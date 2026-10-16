// Puts MediaPipe's WASM runtimes and the three models under public/models/<key>/, so the app
// never loads them from a CDN at runtime. Runs before `dev` and `build`.
//  - WASM is copied from node_modules, so it always matches the JS the app was built with.
//  - Models are downloaded once (Vercel builds have internet) and verified by SHA-256; a file
//    already present with the right hash is kept, so local runs work offline after the first.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  MODEL_FILES,
  MODEL_SOURCE,
  MODELS_DIR,
  MODELS_KEY,
  WASM_SETS,
  wasmFiles,
} from "./mediapipe-assets.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modelsRoot = join(root, "public", "models");
const sha256 = (data) => createHash("sha256").update(data).digest("hex");

// Older keys are from previous MediaPipe versions (and the pre-deploy public/mediapipe folder).
mkdirSync(modelsRoot, { recursive: true });
for (const entry of readdirSync(modelsRoot)) {
  if (entry !== MODELS_KEY) rmSync(join(modelsRoot, entry), { recursive: true, force: true });
}
rmSync(join(root, "public", "mediapipe"), { recursive: true, force: true });

for (const { pkg, dir, prefix } of WASM_SETS) {
  const target = join(MODELS_DIR, dir);
  mkdirSync(target, { recursive: true });
  for (const file of wasmFiles(prefix)) {
    copyFileSync(join(root, "node_modules", "@mediapipe", pkg, "wasm", file), join(target, file));
  }
}

await Promise.all(
  MODEL_FILES.map(async ({ name, source, sha256: expected }) => {
    const target = join(MODELS_DIR, name);
    if (existsSync(target) && sha256(readFileSync(target)) === expected) return;
    const response = await fetch(`${MODEL_SOURCE}/${source}`);
    if (!response.ok) throw new Error(`${name}: download failed (${response.status})`);
    const data = Buffer.from(await response.arrayBuffer());
    const actual = sha256(data);
    if (actual !== expected) throw new Error(`${name}: sha256 ${actual}, expected ${expected}`);
    await writeFile(target, data);
    console.log(`models: downloaded ${name}`);
  }),
);
