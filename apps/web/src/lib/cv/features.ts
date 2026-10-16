// Per-frame features (SCREENING_SPEC §4.1) from MediaPipe results. Pure functions with no
// imports, so `pnpm test:cv` runs them under plain Node. Sign conventions: lib/cv/README.md.

/** A MediaPipe normalised landmark: x / width, y / height, as captured (un-mirrored). */
export type Point = { x: number; y: number; z?: number; visibility?: number };
export type Blendshape = { categoryName: string; score: number };
/** x / width, y / width (scaled like x, §4.1), visibility. */
export type Keypoint = [number, number, number];

export type FaceFeatures = {
  yaw: number;
  pitch: number;
  nose_dx: number;
  iris_x: number;
  iris_y: number;
  eye_open: number;
  iod: number;
};

// Face mesh indices (478-point model with irises).
const NOSE_TIP = 1;
const CHEEK_IMAGE_LEFT = 234; // the child's right cheek on an un-mirrored frame
const CHEEK_IMAGE_RIGHT = 454;
// Each eye: outer corner, inner corner (the child's right eye first).
const EYES = [
  [33, 133],
  [362, 263],
] as const;
const IRIS_CENTRES = [468, 473] as const;

const DEG = 180 / Math.PI;

/** Degrees from MediaPipe's facial transformation matrix (4×4, column-major). The canonical
 *  face looks along +z; its direction in camera space is the matrix's third column. Camera
 *  space has x toward image right and y up, so a nose turned toward image left (the child's
 *  own right) gives a negative x and, by the §4.1 convention, a positive yaw. */
export function headAngles(matrix: ArrayLike<number>): { yaw: number; pitch: number } {
  const fx = matrix[8];
  const fy = matrix[9];
  const fz = matrix[10];
  return {
    yaw: -Math.atan2(fx, fz) * DEG,
    // Positive when the face points up. The scorer only uses |pitch|.
    pitch: Math.atan2(fy, Math.hypot(fx, fz)) * DEG,
  };
}

/** Features for one face. `width` / `height` are the frame's pixel size: landmarks are
 *  normalised per axis, so distances are measured in pixels. */
export function faceFeatures(
  landmarks: readonly Point[],
  blendshapes: readonly Blendshape[],
  matrix: ArrayLike<number>,
  width: number,
  height: number,
): FaceFeatures {
  const px = (i: number) => ({ x: landmarks[i].x * width, y: landmarks[i].y * height });
  const eyes = EYES.map(([a, b]) => {
    const outer = px(a);
    const inner = px(b);
    return {
      centre: { x: (outer.x + inner.x) / 2, y: (outer.y + inner.y) / 2 },
      halfWidth: Math.hypot(outer.x - inner.x, outer.y - inner.y) / 2,
    };
  });
  const iodPx = Math.hypot(
    eyes[0].centre.x - eyes[1].centre.x,
    eyes[0].centre.y - eyes[1].centre.y,
  );

  // Pair each iris with the nearer eye, so the result never depends on which of the two
  // centres the model lists first.
  const irises = IRIS_CENTRES.map(px);
  const near = (eye: (typeof eyes)[number], p: { x: number; y: number }) =>
    Math.hypot(p.x - eye.centre.x, p.y - eye.centre.y);
  const swap = near(eyes[0], irises[0]) > near(eyes[0], irises[1]);
  const offsets = eyes.map((eye, i) => {
    const iris = irises[swap ? 1 - i : i];
    // Both axes over the half eye width: the eye height collapses when the child blinks.
    return {
      x: (iris.x - eye.centre.x) / eye.halfWidth,
      y: (iris.y - eye.centre.y) / eye.halfWidth,
    };
  });

  const nose = px(NOSE_TIP);
  const cheekMid = (px(CHEEK_IMAGE_LEFT).x + px(CHEEK_IMAGE_RIGHT).x) / 2;
  const blink = (name: string) => blendshapes.find((b) => b.categoryName === name)?.score ?? 0;
  const { yaw, pitch } = headAngles(matrix);

  return {
    yaw: round(yaw, 1),
    pitch: round(pitch, 1),
    nose_dx: round((nose.x - cheekMid) / iodPx, 4),
    iris_x: round(clamp((offsets[0].x + offsets[1].x) / 2, -1, 1), 4),
    iris_y: round(clamp((offsets[0].y + offsets[1].y) / 2, -1, 1), 4),
    eye_open: round(1 - (blink("eyeBlinkLeft") + blink("eyeBlinkRight")) / 2, 3),
    iod: round(iodPx / width, 4),
  };
}

/** Where a face is on the frame (normalised), for picking the child and drawing a box. */
export type FaceBox = { x: number; y: number; w: number; h: number };

export function faceBox(landmarks: readonly Point[]): FaceBox {
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const p of landmarks) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export const boxCentre = (b: FaceBox) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

/** Sizes within this share of each other count as "the same size" when picking the child. */
const SAME_SIZE = 0.15;
/** A confirmed child's face may move this far (normalised) between frames and stay tracked. */
const TRACK_RADIUS = 0.25;

/**
 * Which face is the child's (§4.1). With a confirmed position (the parent tapped the face, then
 * updated every frame) the nearest face within reach; otherwise the smallest face, and of two
 * of about the same size the lower one (the child on the lap sits below the parent's face).
 */
export function pickChild(
  boxes: readonly FaceBox[],
  hint: { x: number; y: number } | null,
): number {
  if (boxes.length <= 1) return boxes.length - 1;
  if (hint) {
    let best = -1;
    let bestDistance = TRACK_RADIUS;
    boxes.forEach((box, i) => {
      const c = boxCentre(box);
      const d = Math.hypot(c.x - hint.x, c.y - hint.y);
      if (d < bestDistance) {
        best = i;
        bestDistance = d;
      }
    });
    if (best >= 0) return best;
  }
  let best = 0;
  for (let i = 1; i < boxes.length; i++) {
    const a = boxes[i];
    const b = boxes[best];
    const sameSize = Math.abs(a.w - b.w) <= SAME_SIZE * Math.max(a.w, b.w);
    if (sameSize ? a.y + a.h > b.y + b.h : a.w < b.w) best = i;
  }
  return best;
}

// MediaPipe pose indices → the §4.1 record's names ("l_" = the child's own left).
export const POSE_POINTS = {
  nose: 0,
  l_ear: 7,
  r_ear: 8,
  l_shoulder: 11,
  r_shoulder: 12,
  l_elbow: 13,
  r_elbow: 14,
  l_wrist: 15,
  r_wrist: 16,
  l_hip: 23,
  r_hip: 24,
} as const;
export type PoseName = keyof typeof POSE_POINTS;
export type PoseFeatures = Record<PoseName, Keypoint>;

/** The pose record: y rescaled by height / width so distances mean the same on both axes. */
export function poseFeatures(
  landmarks: readonly Point[],
  width: number,
  height: number,
): PoseFeatures {
  const out = {} as PoseFeatures;
  for (const [name, i] of Object.entries(POSE_POINTS) as [PoseName, number][]) {
    const p = landmarks[i];
    out[name] = [round(p.x, 4), round((p.y * height) / width, 4), round(p.visibility ?? 0, 2)];
  }
  return out;
}

/** Of several detected bodies, the child's: the one whose nose is nearest the child's face,
 *  else the narrowest shoulders (the smallest body). */
export function pickChildPose(
  poses: readonly (readonly Point[])[],
  face: { x: number; y: number } | null,
): number {
  if (poses.length <= 1) return poses.length - 1;
  if (face) {
    const distances = poses.map((p) => Math.hypot(p[0].x - face.x, p[0].y - face.y));
    return distances.indexOf(Math.min(...distances));
  }
  const widths = poses.map((p) =>
    Math.abs(p[POSE_POINTS.l_shoulder].x - p[POSE_POINTS.r_shoulder].x),
  );
  return widths.indexOf(Math.min(...widths));
}

/** Mean luma (BT.601) of RGBA pixels, 0-255. */
export function meanLuma(rgba: ArrayLike<number>): number {
  let sum = 0;
  const n = rgba.length / 4;
  for (let i = 0; i < rgba.length; i += 4) {
    sum += 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return n ? sum / n : 0;
}

/** RMS of a block of samples in dBFS, floored at -100 for silence. */
export function rmsDb(samples: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  const rms = Math.sqrt(sum / Math.max(1, samples.length));
  return round(Math.max(-100, 20 * Math.log10(rms || 1e-10)), 1);
}

/** The p-th percentile (0-1) by nearest rank, or null for no values. */
export function percentile(values: readonly number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))];
}

export function round(value: number, digits: number): number {
  const f = 10 ** digits;
  // "+ 0" turns -0 into 0.
  return Math.round(value * f) / f + 0;
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}
