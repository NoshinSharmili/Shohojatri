// Lazy MediaPipe loading (SCREENING_SPEC §4.1). The packages are imported dynamically, so only
// the activities routes download them. WASM and models are self-hosted under public/models
// (scripts/prepare-models.mjs); next.config.ts passes their versioned folder in.
import type { FaceLandmarker, FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import type { AudioClassifier } from "@mediapipe/tasks-audio";

export const MODELS_BASE = process.env.NEXT_PUBLIC_MODELS_PATH ?? "/models";
const WASM = { vision: `${MODELS_BASE}/wasm/vision`, audio: `${MODELS_BASE}/wasm/audio` };
const MODELS = {
  face: `${MODELS_BASE}/face_landmarker.task`,
  pose: `${MODELS_BASE}/pose_landmarker_lite.task`,
  yamnet: `${MODELS_BASE}/yamnet.tflite`,
};

/** Everything the activities download on a browser with WASM SIMD (all current phones). */
export const MODEL_URLS = [
  ...Object.values(MODELS),
  ...(["vision", "audio"] as const).flatMap((task) =>
    ["js", "wasm"].map((ext) => `${WASM[task]}/${task}_wasm_internal.${ext}`),
  ),
];

export type Delegate = "GPU" | "CPU";

/** Tries the GPU delegate first and falls back to the CPU when it can't be created. */
async function withFallback<T>(create: (delegate: Delegate) => Promise<T>) {
  try {
    return { model: await create("GPU"), delegate: "GPU" as Delegate };
  } catch {
    return { model: await create("CPU"), delegate: "CPU" as Delegate };
  }
}

let visionFiles: ReturnType<typeof FilesetResolver.forVisionTasks> | null = null;
let quieted = false;

/** MediaPipe's WASM prints routine notes ("INFO: Created TensorFlow Lite XNNPACK delegate") on
 *  stderr, which the browser reports as errors (and Next's dev overlay flags). Only those lines
 *  are sent to console.info; every other error is untouched. */
function quietInfoLogs() {
  if (quieted) return;
  quieted = true;
  const error = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("INFO: ")) console.info(...args);
    else error(...args);
  };
}

async function vision() {
  quietInfoLogs();
  const mp = await import("@mediapipe/tasks-vision");
  visionFiles ??= mp.FilesetResolver.forVisionTasks(WASM.vision);
  return { mp, files: await visionFiles };
}

let face: ReturnType<typeof loadFace> | null = null;
let pose: ReturnType<typeof loadPose> | null = null;
let audio: ReturnType<typeof loadAudio> | null = null;

async function loadFace() {
  const { mp, files } = await vision();
  return withFallback((delegate) =>
    mp.FaceLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: MODELS.face, delegate },
      runningMode: "VIDEO",
      // Two, so the child can be told apart from a parent in view (§4.1).
      numFaces: 2,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    }),
  );
}

async function loadPose() {
  const { mp, files } = await vision();
  return withFallback((delegate) =>
    mp.PoseLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: MODELS.pose, delegate },
      runningMode: "VIDEO",
      numPoses: 2,
    }),
  );
}

async function loadAudio() {
  quietInfoLogs();
  const mp = await import("@mediapipe/tasks-audio");
  const files = await mp.FilesetResolver.forAudioTasks(WASM.audio);
  // The audio classifier runs on the CPU only.
  const model = await mp.AudioClassifier.createFromOptions(files, {
    baseOptions: { modelAssetPath: MODELS.yamnet },
    maxResults: 3,
  });
  return { model, delegate: "CPU" as Delegate };
}

/** Each model is created once per page load and shared by every task. A failed load is
 *  forgotten, so "Try again" really retries. */
function once<T>(
  get: () => Promise<T> | null,
  set: (p: Promise<T> | null) => void,
  load: () => Promise<T>,
) {
  const existing = get();
  if (existing) return existing;
  const loading = load().catch((error: unknown) => {
    set(null);
    throw error;
  });
  set(loading);
  return loading;
}

export const loadFaceLandmarker = (): Promise<{ model: FaceLandmarker; delegate: Delegate }> =>
  once(
    () => face,
    (p) => (face = p),
    loadFace,
  );
export const loadPoseLandmarker = (): Promise<{ model: PoseLandmarker; delegate: Delegate }> =>
  once(
    () => pose,
    (p) => (pose = p),
    loadPose,
  );
export const loadAudioClassifier = (): Promise<{ model: AudioClassifier; delegate: Delegate }> =>
  once(
    () => audio,
    (p) => (audio = p),
    loadAudio,
  );
