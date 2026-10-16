// `pnpm test:cv`: Node's test runner with type stripping, no extra dependencies.
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  faceFeatures,
  headAngles,
  meanLuma,
  percentile,
  pickChild,
  pickChildPose,
  poseFeatures,
  rmsDb,
  type Point,
} from "./features.ts";
import { actionSeen, AwayGate, lookingAway, type PoseSample } from "./realtime.ts";

/** A column-major 4×4 rotation about the camera's y axis (up), by `deg`. */
function yawMatrix(deg: number): number[] {
  const a = (deg * Math.PI) / 180;
  // Columns: x axis, y axis, z axis (the face's forward direction), translation.
  return [
    Math.cos(a),
    0,
    -Math.sin(a),
    0,
    0,
    1,
    0,
    0,
    Math.sin(a),
    0,
    Math.cos(a),
    0,
    0,
    0,
    -50,
    1,
  ];
}

test("a face turned toward image left has positive yaw", () => {
  // Rotating +deg about y (up) swings the forward vector toward +x (image right).
  assert.ok(headAngles(yawMatrix(20)).yaw < -19);
  assert.ok(headAngles(yawMatrix(-20)).yaw > 19);
  assert.ok(Math.abs(headAngles(yawMatrix(0)).yaw) < 1e-9);
});

test("pitch is positive when the face points up", () => {
  const up = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0.34, 0.94, 0, 0, 0, -50, 1];
  assert.ok(headAngles(up).pitch > 19);
});

/** A minimal face mesh: only the indices faceFeatures reads are placed. */
function mesh(shift: { nose?: number; iris?: number }): Point[] {
  const points: Point[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  const set = (i: number, x: number, y: number) => (points[i] = { x, y });
  set(33, 0.4, 0.4); // the child's right eye, image left
  set(133, 0.46, 0.4);
  set(362, 0.54, 0.4);
  set(263, 0.6, 0.4);
  set(468, 0.43 + (shift.iris ?? 0), 0.4);
  set(473, 0.57 + (shift.iris ?? 0), 0.4);
  set(234, 0.36, 0.5);
  set(454, 0.64, 0.5);
  set(1, 0.5 + (shift.nose ?? 0), 0.5);
  return points;
}

test("nose_dx and iris_x follow image directions", () => {
  const blinks = [
    { categoryName: "eyeBlinkLeft", score: 0.2 },
    { categoryName: "eyeBlinkRight", score: 0.4 },
  ];
  const left = faceFeatures(mesh({ nose: -0.03 }), blinks, yawMatrix(0), 640, 480);
  assert.ok(left.nose_dx < 0);
  assert.equal(left.iris_x, 0);
  assert.equal(left.eye_open, 0.7);
  // Eye centres 0.43 and 0.57 apart over a 640-px-wide frame.
  assert.equal(left.iod, 0.14);
  const right = faceFeatures(mesh({ iris: 0.015 }), [], yawMatrix(0), 640, 480);
  assert.equal(right.nose_dx, 0);
  assert.equal(right.iris_x, 0.5);
});

test("the child is the smaller face, or the lower of two alike, or the confirmed one", () => {
  const parent = { x: 0.3, y: 0.1, w: 0.3, h: 0.35 };
  const child = { x: 0.4, y: 0.5, w: 0.18, h: 0.2 };
  assert.equal(pickChild([parent, child], null), 1);
  const twin = { x: 0.1, y: 0.55, w: 0.29, h: 0.33 };
  assert.equal(pickChild([parent, twin], null), 1);
  assert.equal(pickChild([parent, child], { x: 0.45, y: 0.27 }), 0);
  assert.equal(pickChild([child], null), 0);
  assert.equal(pickChild([], null), -1);
});

function body(cx: number, width: number): Point[] {
  const points: Point[] = Array.from({ length: 33 }, () => ({ x: cx, y: 0.5, visibility: 0.9 }));
  points[0] = { x: cx, y: 0.3, visibility: 0.9 };
  points[11] = { x: cx + width / 2, y: 0.45, visibility: 0.9 };
  points[12] = { x: cx - width / 2, y: 0.45, visibility: 0.9 };
  return points;
}

test("pose y is scaled by height / width, and the child's body is the narrower one", () => {
  const record = poseFeatures(body(0.5, 0.2), 640, 480);
  assert.deepEqual(record.nose, [0.5, 0.225, 0.9]);
  assert.equal(pickChildPose([body(0.3, 0.3), body(0.7, 0.15)], null), 1);
  assert.equal(pickChildPose([body(0.3, 0.3), body(0.7, 0.15)], { x: 0.31, y: 0.3 }), 0);
});

test("luma, RMS and percentiles", () => {
  assert.equal(Math.round(meanLuma([255, 255, 255, 255, 0, 0, 0, 255])), 128);
  assert.equal(rmsDb(new Float32Array(100).fill(0.1)), -20);
  assert.equal(rmsDb(new Float32Array(10)), -100);
  assert.equal(percentile([5, 1, 3, 2, 4], 0.5), 3);
  assert.equal(percentile([], 0.2), null);
});

test("the call gate opens after 1.5 s of looking away", () => {
  assert.ok(lookingAway(false, null));
  assert.ok(lookingAway(true, -35));
  assert.ok(!lookingAway(true, 10));
  const gate = new AwayGate();
  assert.ok(!gate.update(0, true));
  assert.ok(!gate.update(1000, false));
  assert.ok(!gate.update(1100, true));
  assert.ok(gate.update(2600, true));
});

const REST = {
  nose: [0.5, 0.32, 0.9],
  l_ear: [0.535, 0.31, 0.9],
  r_ear: [0.465, 0.31, 0.9],
  l_shoulder: [0.58, 0.46, 0.9],
  r_shoulder: [0.42, 0.46, 0.9],
  l_wrist: [0.6, 0.68, 0.9],
  r_wrist: [0.4, 0.68, 0.9],
} as const;
type Pose = { [K in keyof typeof REST]: [number, number, number] };

function window(ms: number, at: (t: number) => Partial<Pose>): PoseSample[] {
  const out: PoseSample[] = [];
  for (let t = 0; t <= ms; t += 66)
    out.push({ t, pose: { ...structuredClone(REST), ...at(t) } as Pose });
  return out;
}

test("copy-me actions are recognised for the retry decision", () => {
  const still = window(5000, () => ({}));
  for (const action of ["arms_up", "clap", "wave", "touch_head"] as const) {
    assert.ok(!actionSeen(action, still), action);
  }
  const up = window(5000, (t) =>
    t > 1000 && t < 2000 ? { l_wrist: [0.58, 0.18, 0.9], r_wrist: [0.42, 0.18, 0.9] } : {},
  );
  assert.ok(actionSeen("arms_up", up));
  const clap = window(5000, (t) => {
    const gap = 0.03 + (0.17 * (1 - Math.cos((2 * Math.PI * 1.5 * t) / 1000))) / 2;
    return { l_wrist: [0.5 + gap / 2, 0.55, 0.9], r_wrist: [0.5 - gap / 2, 0.55, 0.9] };
  });
  assert.ok(actionSeen("clap", clap));
  const wave = window(5000, (t) => ({
    r_wrist: [0.36 + 0.05 * Math.sin((2 * Math.PI * 2 * t) / 1000), 0.28, 0.9],
  }));
  assert.ok(actionSeen("wave", wave));
  const head = window(5000, (t) => (t > 1000 && t < 2000 ? { r_wrist: [0.47, 0.26, 0.9] } : {}));
  assert.ok(actionSeen("touch_head", head));
  // Hand to chest: movement, but no rule met.
  const chest = window(5000, () => ({ r_wrist: [0.42, 0.53, 0.9] }));
  assert.ok(!actionSeen("touch_head", chest) && !actionSeen("arms_up", chest));
});
