"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import type { DemoProfile } from "./queries";

// Demo screening mode (SCREENING_SPEC §9, CLAUDE.md §10): a per-device switch for pitches. It
// only changes which source the browser uploads from; the API labels any replayed screening.

export const DEMO_PROFILES: readonly DemoProfile[] = ["elevated", "typical", "noisy"];

type DemoMode = { enabled: boolean; profile: DemoProfile };

const KEY = "sj-demo-mode";
// OPEN_QUESTIONS #13: `elevated` unless the settings say otherwise.
const OFF: DemoMode = { enabled: false, profile: "elevated" };
const listeners = new Set<() => void>();
let cached: { raw: string | null; mode: DemoMode } = { raw: null, mode: OFF };

function read(): DemoMode {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Storage blocked (private mode, site data off): demo mode simply stays off.
  }
  if (raw !== cached.raw) {
    cached = { raw, mode: parse(raw) };
  }
  return cached.mode;
}

function parse(raw: string | null): DemoMode {
  try {
    const value = raw ? (JSON.parse(raw) as Partial<DemoMode>) : {};
    const profile = DEMO_PROFILES.find((p) => p === value.profile) ?? OFF.profile;
    return { enabled: value.enabled === true, profile };
  } catch {
    return OFF;
  }
}

export function setDemoMode(change: Partial<DemoMode>) {
  const next = { ...read(), ...change };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Not persisted; nothing else depends on it.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  window.addEventListener("storage", notify);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", notify);
  };
}

export function useDemoMode(): DemoMode {
  return useSyncExternalStore(subscribe, read, () => OFF);
}

/** `?demo=1` / `?demo=0` on any parent page turns demo mode on or off for this device. */
export function DemoParam() {
  const demo = useSearchParams().get("demo");
  useEffect(() => {
    if (demo === "1" || demo === "0") setDemoMode({ enabled: demo === "1" });
  }, [demo]);
  return null;
}
