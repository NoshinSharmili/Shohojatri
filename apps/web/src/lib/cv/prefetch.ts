"use client";

import { useEffect } from "react";

import { MODEL_URLS } from "./models";

let started = false;

type Connection = { saveData?: boolean };

/** Downloads the MediaPipe files in the background while the parent answers the questions,
 *  so the camera games start without a wait. The service worker keeps them (cache-first),
 *  and their year-long immutable headers keep them in the HTTP cache without one.
 *  Once per page load; skipped when the browser asks to save data. */
export function usePrefetchModels(enabled: boolean) {
  useEffect(() => {
    if (!enabled || started) return;
    if ((navigator as Navigator & { connection?: Connection }).connection?.saveData) return;
    started = true;
    void (async () => {
      // One at a time and at low priority, so answering a question never waits on them.
      for (const url of MODEL_URLS) {
        try {
          const response = await fetch(url, { priority: "low" });
          // Read to the end: an unread body may not be stored.
          await response.arrayBuffer();
        } catch {
          // Offline or interrupted: the games download what's missing when they start.
        }
      }
    })();
  }, [enabled]);
}
