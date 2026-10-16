// What the screening activities download, all self-hosted under public/models (lib/cv/README.md).
// Shared by scripts/prepare-models.mjs (writes the files) and next.config.ts (tells the app
// where they are). Plain .mjs so both can import it.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const version = (pkg) =>
  JSON.parse(readFileSync(join(root, "node_modules", "@mediapipe", pkg, "package.json"), "utf8"))
    .version;

// The folder name changes whenever the MediaPipe packages do, so the files can be cached for a
// year as immutable: an upgrade gets a new URL instead of a stale WASM/JS pair.
export const MODELS_KEY = `mp-v${version("tasks-vision")}-a${version("tasks-audio")}`;
export const MODELS_PATH = `/models/${MODELS_KEY}`;
export const MODELS_DIR = join(root, "public", "models", MODELS_KEY);

// Downloaded once at build time from Google's model storage and checked against these hashes.
export const MODEL_SOURCE = "https://storage.googleapis.com/mediapipe-models";
export const MODEL_FILES = [
  {
    name: "face_landmarker.task",
    source: "face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    sha256: "64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff",
  },
  {
    name: "pose_landmarker_lite.task",
    source: "pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
    sha256: "59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a",
  },
  {
    name: "yamnet.tflite",
    source: "audio_classifier/yamnet/float32/1/yamnet.tflite",
    sha256: "4d8b4a53282dc83ef04e3e7dbc4fbc98082e34e44ed798e16c3a0cdd4c584faf",
  },
];

// FilesetResolver loads `<task>_wasm_internal.{js,wasm}`, or the `_nosimd_` pair on browsers
// without WASM SIMD. The `_module_` variants are never used, so they aren't served.
export const WASM_SETS = [
  { pkg: "tasks-vision", dir: "wasm/vision", prefix: "vision" },
  { pkg: "tasks-audio", dir: "wasm/audio", prefix: "audio" },
];
export const wasmFiles = (prefix) =>
  ["wasm_internal", "wasm_nosimd_internal"].flatMap((variant) =>
    ["js", "wasm"].map((ext) => `${prefix}_${variant}.${ext}`),
  );
