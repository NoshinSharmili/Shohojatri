// Microphone measurements (SCREENING_SPEC §4.1): RMS every 50 ms and YAMNet classes for each
// 1-s window. Samples live only in these buffers; nothing is recorded or sent.
import type { AudioClassifier } from "@mediapipe/tasks-audio";

import { rmsDb } from "./features";

export const RMS_BLOCK_MS = 50;
const WINDOW_MS = 1000;
/** How much RMS history the setup check's noise baseline looks at. */
const HISTORY_MS = 3000;

// An AudioWorklet posts contiguous blocks, unlike polling an AnalyserNode, which drops or
// repeats samples whenever a timer runs late.
const WORKLET = `
class SjTap extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.size = options.processorOptions.size;
    this.block = new Float32Array(this.size);
    this.filled = 0;
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      for (let i = 0; i < channel.length; i++) {
        this.block[this.filled++] = channel[i];
        if (this.filled === this.size) {
          this.port.postMessage(this.block, [this.block.buffer]);
          this.block = new Float32Array(this.size);
          this.filled = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor("sj-tap", SjTap);
`;

export type AudioClass = { label: string; score: number };
type WindowListener = (startedAt: number, classes: AudioClass[]) => void;

export class AudioMeter {
  /** dBFS of the latest 50-ms block, and when it ended (performance.now()). */
  latestDb: number | null = null;
  latestAt = 0;
  private history: { at: number; db: number }[] = [];
  private window: Float32Array;
  private filled = 0;
  private windowStart = 0;
  private classifier: AudioClassifier | null = null;
  private windowListeners = new Set<WindowListener>();
  private blockListeners = new Set<(at: number, db: number) => void>();

  private constructor(
    private context: AudioContext,
    private nodes: AudioNode[],
  ) {
    this.window = new Float32Array(Math.round((context.sampleRate * WINDOW_MS) / 1000));
  }

  static async open(stream: MediaStream): Promise<AudioMeter> {
    const context = new AudioContext();
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
    try {
      await context.audioWorklet.addModule(url);
    } finally {
      URL.revokeObjectURL(url);
    }
    const source = context.createMediaStreamSource(stream);
    const tap = new AudioWorkletNode(context, "sj-tap", {
      processorOptions: { size: Math.round((context.sampleRate * RMS_BLOCK_MS) / 1000) },
    });
    // A silent sink: Chrome only pulls audio through nodes connected to the destination.
    const mute = context.createGain();
    mute.gain.value = 0;
    source.connect(tap).connect(mute).connect(context.destination);
    const meter = new AudioMeter(context, [source, tap, mute]);
    tap.port.onmessage = (event: MessageEvent<Float32Array>) => meter.receive(event.data);
    // Started from a tap, but some browsers still create the context suspended.
    await context.resume().catch(() => undefined);
    return meter;
  }

  get sampleRate() {
    return this.context.sampleRate;
  }

  setClassifier(classifier: AudioClassifier | null) {
    this.classifier = classifier;
  }

  onWindow(listener: WindowListener): () => void {
    this.windowListeners.add(listener);
    return () => this.windowListeners.delete(listener);
  }

  /** Every 50-ms reading: when the block ended (performance.now()) and its dBFS. */
  onBlock(listener: (at: number, db: number) => void): () => void {
    this.blockListeners.add(listener);
    return () => this.blockListeners.delete(listener);
  }

  /** Readings from the last 3 s, for the background-noise check (§4.2). */
  recentDb(): number[] {
    return this.history.map((h) => h.db);
  }

  private receive(block: Float32Array) {
    const at = performance.now();
    const db = rmsDb(block);
    this.latestDb = db;
    this.latestAt = at;
    this.history.push({ at, db });
    while (this.history.length && this.history[0].at < at - HISTORY_MS) this.history.shift();
    this.blockListeners.forEach((listener) => listener(at, db));

    if (!this.windowListeners.size) {
      this.filled = 0;
      return;
    }
    if (this.filled === 0) {
      this.windowStart = at - (block.length / this.context.sampleRate) * 1000;
    }
    const take = Math.min(block.length, this.window.length - this.filled);
    this.window.set(block.subarray(0, take), this.filled);
    this.filled += take;
    if (this.filled === this.window.length) {
      this.classify(this.windowStart);
      this.filled = 0;
    }
  }

  private classify(startedAt: number) {
    if (!this.classifier) return;
    try {
      const [first] = this.classifier.classify(this.window, this.context.sampleRate);
      const classes = (first?.classifications[0]?.categories ?? []).map((c) => ({
        label: c.categoryName,
        score: Math.round(c.score * 1000) / 1000,
      }));
      this.windowListeners.forEach((listener) => listener(startedAt, classes));
    } catch {
      // A failed window is simply missing from the vocalisation count.
    }
  }

  close() {
    this.nodes.forEach((node) => node.disconnect());
    void this.context.close().catch(() => undefined);
  }
}
