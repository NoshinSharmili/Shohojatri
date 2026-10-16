// Camera + microphone capture for the activities (SCREENING_SPEC §4.1). Frames are processed
// in memory at ~15 fps into numeric features; video and audio are never recorded, stored or
// uploaded. Only a TaskRecorder's numbers leave the device, through the task upload.
import type { FaceLandmarker, PoseLandmarker } from "@mediapipe/tasks-vision";

import type { components } from "@/lib/api/schema";

import { AudioMeter } from "./audio";
import {
  boxCentre,
  type FaceBox,
  faceBox,
  faceFeatures,
  meanLuma,
  percentile,
  pickChild,
  pickChildPose,
  poseFeatures,
  round,
} from "./features";
import {
  type Delegate,
  loadAudioClassifier,
  loadFaceLandmarker,
  loadPoseLandmarker,
} from "./models";

export type Frame = components["schemas"]["Frame"];
export type Marker = components["schemas"]["Marker"];
export type AudioEvent = components["schemas"]["AudioEvent"];
export type TaskUpload = components["schemas"]["TaskUpload"];
export type DeviceInfo = components["schemas"]["DeviceInfo"];
export type Camera = "front" | "rear";
export type DeviceType = "phone" | "laptop";

const TARGET_FPS = 15;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
const LUMA_INTERVAL_MS = 500;
/** The share of readings below which the room is "quiet": the background under any talking. */
const BACKGROUND_PERCENTILE = 0.2;
// A 4×4 identity, for a face that came without a transformation matrix.
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** One processed frame, for the live UI and the recorder. */
export type Sample = {
  at: number; // performance.now()
  features: Omit<Frame, "t">;
  /** Every face found, and which one is the child's (-1: none). */
  faces: FaceBox[];
  child: number;
  luma: number | null;
};

export type CaptureFailure = "denied" | "not_found" | "busy" | "failed";

export class CaptureError extends Error {
  constructor(readonly kind: CaptureFailure) {
    super(kind);
  }
}

/** Why this browser can't run the games, or null when it can. */
export type Unsupported = "insecure" | "no_camera" | "no_wasm" | "no_audio";

export function unsupportedReason(): Unsupported | null {
  if (typeof window === "undefined") return null;
  if (!window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia) return "no_camera";
  if (typeof WebAssembly !== "object") return "no_wasm";
  if (typeof AudioWorkletNode === "undefined") return "no_audio";
  return null;
}

function failure(error: unknown): CaptureError {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return new CaptureError("denied");
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return new CaptureError("not_found");
  }
  if (name === "NotReadableError" || name === "AbortError") return new CaptureError("busy");
  return new CaptureError("failed");
}

function videoConstraints(camera: Camera): MediaTrackConstraints {
  return {
    facingMode: { ideal: camera === "front" ? "user" : "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };
}

/** A task's timeline: frames, markers and audio events in ms since its start, plus the
 *  capture conditions. Held in memory until the upload. */
export class TaskRecorder {
  readonly startedAt = performance.now();
  readonly frames: Frame[] = [];
  readonly markers: Marker[] = [];
  readonly audioEvents: AudioEvent[] = [];
  private luma: number[] = [];
  private db: number[] = [];

  now(): number {
    return round(performance.now() - this.startedAt, 1);
  }

  private since(at: number): number {
    return round(at - this.startedAt, 1);
  }

  mark(marker: Omit<Marker, "t">): Marker {
    const stamped = { ...marker, t: this.now() } as Marker;
    this.markers.push(stamped);
    return stamped;
  }

  addSample(sample: Sample) {
    this.frames.push({ t: this.since(sample.at), ...sample.features });
    if (sample.luma !== null) this.luma.push(sample.luma);
  }

  addDb(db: number) {
    this.db.push(db);
  }

  addAudio(at: number, classes: { label: string; score: number }[]) {
    const t = Math.max(0, this.since(at));
    for (const c of classes) this.audioEvents.push({ t, ...c });
  }

  /** Frames since `t` (ms since the start), for real-time decisions. */
  framesSince(t: number): Frame[] {
    const out: Frame[] = [];
    for (let i = this.frames.length - 1; i >= 0 && this.frames[i].t >= t; i--) {
      out.push(this.frames[i]);
    }
    return out.reverse();
  }

  upload(device: DeviceInfo, variant?: "on_screen" | "live"): TaskUpload {
    const seconds = Math.max(0.001, this.now() / 1000);
    const lumaMean = this.luma.length
      ? this.luma.reduce((a, b) => a + b, 0) / this.luma.length
      : null;
    const background = percentile(this.db, BACKGROUND_PERCENTILE);
    return {
      frames: this.frames,
      markers: this.markers,
      audio_events: this.audioEvents,
      ...(variant ? { variant } : {}),
      device: { ...device, fps: round(this.frames.length / seconds, 1) },
      quality: {
        mean_luma: lumaMean === null ? null : round(lumaMean, 1),
        noise_db: background === null ? null : Math.min(0, background),
      },
    };
  }
}

type Listener = (sample: Sample) => void;

export class CaptureSession {
  readonly video: HTMLVideoElement;
  latest: Sample | null = null;
  /** Bumped whenever the camera changes, so previews re-attach. */
  streamVersion = 0;
  delegate: Delegate | null = null;
  private face: FaceLandmarker | null = null;
  private pose: PoseLandmarker | null = null;
  private poseOn = false;
  private childHint: { x: number; y: number } | null = null;
  private luma: number | null = null;
  private lumaAt = 0;
  private lumaCanvas: HTMLCanvasElement | null = null;
  private lastProcessed = 0;
  private lastTimestamp = 0;
  private listeners = new Set<Listener>();
  private changeListeners = new Set<() => void>();
  private recorder: TaskRecorder | null = null;
  private unsubscribeAudio: (() => void)[] = [];
  private closed = false;
  private loopHandle = 0;
  private detectErrors = 0;

  private constructor(
    private stream: MediaStream,
    readonly meter: AudioMeter,
    public camera: Camera,
  ) {
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.srcObject = stream;
    this.unsubscribeAudio.push(
      meter.onBlock((_, db) => this.recorder?.addDb(db)),
      meter.onWindow((at, classes) => this.recorder?.addAudio(at, classes)),
    );
  }

  /** Asks for the camera and microphone. Call from a tap: browsers want a user gesture. */
  static async open(camera: Camera): Promise<CaptureSession> {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints(camera),
        // Raw levels: echo cancellation, noise suppression and gain control would flatten the
        // voice onset (§4.4) and hide the room's noise (§4.2).
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch (error) {
      throw failure(error);
    }
    let meter: AudioMeter;
    try {
      meter = await AudioMeter.open(stream);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      throw new CaptureError("failed");
    }
    const session = new CaptureSession(stream, meter, actualCamera(stream, camera));
    await session.video.play().catch(() => undefined);
    session.loop();
    return session;
  }

  get mediaStream(): MediaStream {
    return this.stream;
  }

  /** Mirrored preview for the front camera (what people expect); features stay un-mirrored. */
  get mirrored(): boolean {
    return this.camera === "front";
  }

  get size() {
    return { width: this.video.videoWidth, height: this.video.videoHeight };
  }

  /** Face landmarks and the audio classifier; pose loads on demand (Copy me, Free play). */
  async loadModels() {
    const [face, audio] = await Promise.all([loadFaceLandmarker(), loadAudioClassifier()]);
    this.face = face.model;
    this.delegate = face.delegate;
    this.meter.setClassifier(audio.model);
    // Warm the pose model in the background so the later games don't wait for it.
    void loadPoseLandmarker().catch(() => undefined);
  }

  get modelsReady(): boolean {
    return this.face !== null;
  }

  async usePose(on: boolean) {
    if (on && !this.pose) this.pose = (await loadPoseLandmarker()).model;
    this.poseOn = on;
  }

  async switchCamera(camera: Camera) {
    if (
      camera === this.camera &&
      this.stream.getVideoTracks().some((t) => t.readyState === "live")
    ) {
      return;
    }
    let video: MediaStream;
    try {
      video = await navigator.mediaDevices.getUserMedia({ video: videoConstraints(camera) });
    } catch (error) {
      throw failure(error);
    }
    this.stream.getVideoTracks().forEach((track) => track.stop());
    this.stream = new MediaStream([...video.getVideoTracks(), ...this.stream.getAudioTracks()]);
    this.camera = actualCamera(video, camera);
    this.video.srcObject = this.stream;
    await this.video.play().catch(() => undefined);
    // A position on the other camera's picture means nothing here.
    this.childHint = null;
    this.latest = null;
    this.streamVersion += 1;
    this.changeListeners.forEach((listener) => listener());
  }

  /** The parent tapped the child's face (normalised, un-mirrored coordinates). */
  confirmChild(point: { x: number; y: number } | null) {
    this.childHint = point;
  }

  get childConfirmed(): boolean {
    return this.childHint !== null;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onChange(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  startTask(): TaskRecorder {
    this.recorder = new TaskRecorder();
    return this.recorder;
  }

  endTask() {
    this.recorder = null;
  }

  device(deviceType: DeviceType | null): DeviceInfo {
    return {
      camera: this.camera,
      device_type: deviceType,
      width: this.video.videoWidth || null,
      height: this.video.videoHeight || null,
      user_agent: navigator.userAgent.slice(0, 300),
    };
  }

  close() {
    this.closed = true;
    cancelAnimationFrame(this.loopHandle);
    this.unsubscribeAudio.forEach((off) => off());
    this.stream.getTracks().forEach((track) => track.stop());
    this.meter.close();
    this.video.srcObject = null;
    this.listeners.clear();
    this.changeListeners.clear();
  }

  private loop() {
    const tick = () => {
      if (this.closed) return;
      const now = performance.now();
      if (now - this.lastProcessed >= FRAME_INTERVAL_MS - 4 && this.video.readyState >= 2) {
        this.lastProcessed = now;
        this.process(now);
      }
      this.loopHandle = requestAnimationFrame(tick);
    };
    this.loopHandle = requestAnimationFrame(tick);
  }

  private process(now: number) {
    const { videoWidth: width, videoHeight: height } = this.video;
    if (!width || !height) return;
    if (now - this.lumaAt >= LUMA_INTERVAL_MS) {
      this.lumaAt = now;
      this.luma = this.measureLuma();
    }
    if (!this.face) return;
    // MediaPipe needs strictly increasing timestamps in VIDEO mode.
    const timestamp = Math.max(now, this.lastTimestamp + 1);
    this.lastTimestamp = timestamp;

    let features: Omit<Frame, "t"> = { face: false };
    let faces: FaceBox[] = [];
    let child = -1;
    try {
      const result = this.face.detectForVideo(this.video, timestamp);
      faces = result.faceLandmarks.map(faceBox);
      child = pickChild(faces, this.childHint);
      if (child >= 0) {
        // Follow a confirmed child as they move.
        if (this.childHint) this.childHint = boxCentre(faces[child]);
        features = {
          face: true,
          ...faceFeatures(
            result.faceLandmarks[child],
            result.faceBlendshapes[child]?.categories ?? [],
            result.facialTransformationMatrixes[child]?.data ?? IDENTITY,
            width,
            height,
          ),
        };
      }
      if (this.poseOn && this.pose) {
        const poses = this.pose.detectForVideo(this.video, timestamp).landmarks;
        const which = pickChildPose(poses, child >= 0 ? boxCentre(faces[child]) : null);
        if (which >= 0) features.pose = poseFeatures(poses[which], width, height);
      }
      this.detectErrors = 0;
    } catch (error) {
      // A dropped frame counts as "not seen" in scoring; only report a persistent failure.
      this.detectErrors += 1;
      if (this.detectErrors === 30) console.error("[cv] frame processing keeps failing", error);
      return;
    }
    features.rms_db = this.meter.latestDb;

    const sample: Sample = { at: now, features, faces, child, luma: this.luma };
    this.latest = sample;
    this.recorder?.addSample(sample);
    this.listeners.forEach((listener) => listener(sample));
  }

  private measureLuma(): number | null {
    this.lumaCanvas ??= Object.assign(document.createElement("canvas"), { width: 32, height: 24 });
    const context = this.lumaCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(this.video, 0, 0, 32, 24);
    return round(meanLuma(context.getImageData(0, 0, 32, 24).data), 1);
  }
}

/** Which way the camera really faces. Laptops report nothing: their one camera faces the
 *  person at the screen, so it counts as the front camera. */
function actualCamera(stream: MediaStream, asked: Camera): Camera {
  const facing = stream.getVideoTracks()[0]?.getSettings().facingMode;
  if (facing === "environment") return "rear";
  if (facing === "user") return "front";
  return asked === "rear" ? "front" : asked;
}

/** Background noise over the last few seconds (§4.2), dBFS. */
export function backgroundDb(meter: AudioMeter): number | null {
  return percentile(meter.recentDb(), 0.5);
}
