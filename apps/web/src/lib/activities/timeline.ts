// Cancellable waits for the task scripts: "Try again", "Stop" and leaving the page abort the
// running task through its AbortSignal.
import type { CaptureSession, Sample } from "@/lib/cv/capture";

export class Aborted extends Error {
  constructor() {
    super("aborted");
  }
}

export function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Aborted());
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new Aborted());
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/** Waits until `test` is true for a processed frame, or `timeoutMs` passes (false). */
export function waitForSample(
  session: CaptureSession,
  test: (sample: Sample) => boolean,
  timeoutMs: number,
  signal: AbortSignal,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Aborted());
    const done = (value: boolean | Error) => {
      window.clearTimeout(timer);
      off();
      signal.removeEventListener("abort", onAbort);
      if (value instanceof Error) reject(value);
      else resolve(value);
    };
    const off = session.subscribe((sample) => {
      if (test(sample)) done(true);
    });
    const timer = window.setTimeout(() => done(false), timeoutMs);
    const onAbort = () => done(new Aborted());
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/** Waits for the parent's tap (or anything else that resolves `next`), abortable. */
export function untilSignal<T>(next: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Aborted());
    const onAbort = () => reject(new Aborted());
    signal.addEventListener("abort", onAbort, { once: true });
    next.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

/** Balanced target sides for "Look where I point" (§4.5): 3 left and 3 right in random order,
 *  never more than two in a row on the same side. */
export function balancedSides(count: number, random = Math.random): ("left" | "right")[] {
  for (;;) {
    const sides = [
      ...Array<"left">(count / 2).fill("left"),
      ...Array<"right">(count / 2).fill("right"),
    ];
    for (let i = sides.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [sides[i], sides[j]] = [sides[j], sides[i]];
    }
    if (sides.every((s, i) => i < 2 || s !== sides[i - 1] || s !== sides[i - 2])) return sides;
  }
}
