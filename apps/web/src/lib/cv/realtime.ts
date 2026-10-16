// The little real-time logic a task needs to run (CLAUDE.md §4): when to show "Call now", and
// whether Copy me repeats an action. Scoring itself is the API's (apps/api/app/scoring/); these
// rules only steer the activity, so a near miss here costs at most one extra or missing retry.
// Type-only imports keep this file runnable under plain Node for `pnpm test:cv`.
import type { Keypoint, PoseName } from "./features";

/** §4.4 gate: the child counts as looking away with no face or |yaw| > 30°, for ≥ 1.5 s. */
export const AWAY_YAW_DEG = 30;
export const AWAY_HOLD_MS = 1500;

export function lookingAway(face: boolean, yaw: number | null | undefined): boolean {
  return !face || yaw == null || Math.abs(yaw) > AWAY_YAW_DEG;
}

/** Tracks how long the child has been looking away; `update` is true once it has lasted. */
export class AwayGate {
  private since: number | null = null;

  update(t: number, away: boolean): boolean {
    if (!away) {
      this.since = null;
      return false;
    }
    this.since ??= t;
    return t - this.since >= AWAY_HOLD_MS;
  }

  reset() {
    this.since = null;
  }
}

export type Action = "arms_up" | "clap" | "wave" | "touch_head";
export type PoseSample = { t: number; pose?: Partial<Record<PoseName, Keypoint | null>> | null };

// Same numbers as SCREENING_SPEC §4.6 / scoring config.yaml.
const MIN_VISIBILITY = 0.5;
const RULES = {
  arms_up: { hold_ms: 400 },
  clap: { close: 0.35, open: 0.6, cycles: 2 },
  wave: { swing: 0.25, reversals: 2, within_ms: 2000 },
  touch_head: { reach: 0.5, hold_ms: 300 },
} as const;

type XY = { x: number; y: number };

function seen(point: Keypoint | null | undefined): XY | null {
  return point && point[2] >= MIN_VISIBILITY ? { x: point[0], y: point[1] } : null;
}

const distance = (a: XY, b: XY) => Math.hypot(a.x - b.x, a.y - b.y);

/** True once `test` has held for `ms` without a break. */
function heldFor(samples: readonly PoseSample[], ms: number, test: (s: PoseSample) => boolean) {
  let start: number | null = null;
  for (const s of samples) {
    if (!test(s)) {
      start = null;
      continue;
    }
    start ??= s.t;
    if (s.t - start >= ms) return true;
  }
  return false;
}

function shoulderWidth(samples: readonly PoseSample[]): number | null {
  const widths = samples.flatMap((s) => {
    const l = seen(s.pose?.l_shoulder);
    const r = seen(s.pose?.r_shoulder);
    return l && r ? [distance(l, r)] : [];
  });
  if (!widths.length) return null;
  widths.sort((a, b) => a - b);
  return widths[Math.floor(widths.length / 2)];
}

/** Turning points of a signal, ignoring swings smaller than `swing` (a zig-zag filter). */
function reversals(points: readonly { t: number; v: number }[], swing: number): number[] {
  const out: number[] = [];
  if (!points.length) return out;
  // Highest and lowest point since the last turn; direction 1 rising, -1 falling, 0 not yet.
  let high = points[0];
  let low = points[0];
  let direction = 0;
  for (const p of points.slice(1)) {
    if (direction >= 0 && p.v > high.v) high = p;
    if (direction <= 0 && p.v < low.v) low = p;
    if (direction >= 0 && high.v - p.v >= swing) {
      if (direction === 1) out.push(high.t);
      direction = -1;
      low = p;
    } else if (direction <= 0 && p.v - low.v >= swing) {
      if (direction === -1) out.push(low.t);
      direction = 1;
      high = p;
    }
  }
  return out;
}

/** Whether the child seems to have done `action` in a response window: decides the automatic
 *  retry (§4.6) and nothing else. */
export function actionSeen(action: Action, samples: readonly PoseSample[]): boolean {
  const sw = shoulderWidth(samples);
  if (!sw) return false;
  const pose = (s: PoseSample) => ({
    nose: seen(s.pose?.nose),
    ears: [seen(s.pose?.l_ear), seen(s.pose?.r_ear)],
    shoulders: [seen(s.pose?.l_shoulder), seen(s.pose?.r_shoulder)],
    wrists: [seen(s.pose?.l_wrist), seen(s.pose?.r_wrist)],
  });

  switch (action) {
    case "arms_up":
      return heldFor(samples, RULES.arms_up.hold_ms, (s) => {
        const { nose, wrists } = pose(s);
        return !!nose && wrists.every((w) => w && w.y < nose.y);
      });
    case "touch_head":
      return heldFor(samples, RULES.touch_head.hold_ms, (s) => {
        const { nose, ears, shoulders, wrists } = pose(s);
        const line = shoulders.filter((p): p is XY => !!p);
        if (!line.length) return false;
        const shoulderY = line.reduce((sum, p) => sum + p.y, 0) / line.length;
        const head = [nose, ...ears].filter((p): p is XY => !!p);
        return wrists.some(
          (w) =>
            !!w &&
            w.y < shoulderY &&
            head.some((h) => distance(w, h) <= RULES.touch_head.reach * sw),
        );
      });
    case "clap": {
      let closed = false;
      let cycles = 0;
      for (const s of samples) {
        const [l, r] = pose(s).wrists;
        if (!l || !r) continue;
        const gap = distance(l, r) / sw;
        if (gap < RULES.clap.close) closed = true;
        else if (closed && gap > RULES.clap.open) {
          closed = false;
          cycles += 1;
        }
      }
      return cycles >= RULES.clap.cycles;
    }
    case "wave":
      return [0, 1].some((side) => {
        const raised = samples.flatMap((s) => {
          const { shoulders, wrists } = pose(s);
          const w = wrists[side];
          const sh = shoulders[side];
          return w && sh && w.y < sh.y ? [{ t: s.t, v: w.x / sw }] : [];
        });
        const turns = reversals(raised, RULES.wave.swing);
        return turns.some(
          (t, i) =>
            i + RULES.wave.reversals - 1 < turns.length &&
            turns[i + RULES.wave.reversals - 1] - t <= RULES.wave.within_ms,
        );
      });
  }
}
