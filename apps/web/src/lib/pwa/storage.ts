"use client";

import { useSyncExternalStore } from "react";

// Per-viewer "dismissed" flags (the demo banner, the install card). Storage can be missing or
// throw (private mode, blocked site data), so reads and writes are guarded, and a failed read
// means "not dismissed".

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/** Whether `key` was dismissed in this browser, and a function that dismisses it. The server
 *  render (and hydration) treats it as dismissed, so nothing flashes in and out. */
export function useDismissed(key: string): [boolean, () => void] {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => readFlag(key),
    () => true,
  );
  const dismiss = () => {
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // Not remembered: the message comes back on the next visit.
    }
    listeners.forEach((listener) => listener());
  };
  return [dismissed, dismiss];
}
