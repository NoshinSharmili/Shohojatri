"use client";

import { useSyncExternalStore } from "react";

// Chrome's install event (Android, desktop). Not in TypeScript's DOM types.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// The event fires once, early, often before the parent home has mounted, so it is caught as
// soon as this module loads (it's imported by the app-wide Providers) and kept here.
let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Stops Chrome's own mini-infobar; the parent home shows our card instead.
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export type InstallOption = "prompt" | "ios" | null;

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  // iPadOS reports itself as a Mac, but Macs have no touch screen.
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function current(): InstallOption {
  if (isStandalone()) return null;
  if (deferred) return "prompt";
  // iOS never fires beforeinstallprompt; Safari's Share menu is the only way.
  return isIos() ? "ios" : null;
}

/** How this browser can install the app right now, or null (installed / not possible). */
export function useInstallOption(): InstallOption {
  return useSyncExternalStore(subscribe, current, () => null);
}

/** Shows Chrome's install dialog. Resolves true when the parent installed the app. */
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  // The event can only be used once, whatever the answer.
  deferred = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  notify();
  return outcome === "accepted";
}
