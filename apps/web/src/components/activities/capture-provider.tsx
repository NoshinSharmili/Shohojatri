"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  type Camera,
  CaptureError,
  type CaptureFailure,
  CaptureSession,
  type DeviceType,
  type Sample,
  type Unsupported,
  unsupportedReason,
} from "@/lib/cv/capture";
import { warmUpSpeech } from "@/lib/activities/sound";

export type CaptureStatus =
  | { status: "idle" }
  | { status: "starting" }
  | { status: "loading" } // camera on, models downloading
  | { status: "ready" }
  | { status: "error"; kind: CaptureFailure | "models" }
  | { status: "unsupported"; reason: Unsupported };

type CaptureContext = {
  state: CaptureStatus;
  session: CaptureSession | null;
  deviceType: DeviceType;
  setDeviceType: (type: DeviceType) => void;
  /** Asks for the camera and mic (call from a tap), then loads the models. */
  start: () => Promise<void>;
  /** Camera off: leaving the games, or the result is next. */
  stop: () => void;
  /** Switches camera; on a laptop both ask for the one camera. Returns false on failure. */
  switchCamera: (camera: Camera) => Promise<boolean>;
};

const Context = createContext<CaptureContext | null>(null);

function guessDeviceType(): DeviceType {
  if (typeof navigator === "undefined") return "phone";
  return /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? "phone" : "laptop";
}

/** Keeps one camera session for all the activity routes, so moving between games doesn't ask
 *  for the camera again. Leaving the activities turns the camera off. */
export function CaptureProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CaptureStatus>({ status: "idle" });
  const [session, setSession] = useState<CaptureSession | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>(guessDeviceType);
  const sessionRef = useRef<CaptureSession | null>(null);

  const stop = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    setSession(null);
    setState({ status: "idle" });
  }, []);

  const start = useCallback(async () => {
    const reason = unsupportedReason();
    if (reason) {
      setState({ status: "unsupported", reason });
      return;
    }
    warmUpSpeech();
    let current = sessionRef.current;
    if (!current) {
      setState({ status: "starting" });
      try {
        current = await CaptureSession.open("front");
      } catch (error) {
        setState({
          status: "error",
          kind: error instanceof CaptureError ? error.kind : "failed",
        });
        return;
      }
      sessionRef.current = current;
      setSession(current);
    }
    if (current.modelsReady) {
      setState({ status: "ready" });
      return;
    }
    setState({ status: "loading" });
    try {
      await current.loadModels();
      setState({ status: "ready" });
    } catch (error) {
      console.error("[cv] models failed to load", error);
      setState({ status: "error", kind: "models" });
    }
  }, []);

  const switchCamera = useCallback(async (camera: Camera) => {
    const current = sessionRef.current;
    if (!current) return false;
    try {
      await current.switchCamera(camera);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Turn the camera off when the parent leaves the activities.
  useEffect(() => () => sessionRef.current?.close(), []);

  // Keep the screen on while the camera is in use: the name game can take a few minutes.
  useEffect(() => {
    if (!session || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let released = false;
    const acquire = () => {
      if (document.visibilityState !== "visible") return;
      navigator.wakeLock
        .request("screen")
        .then((l) => {
          if (released) void l.release();
          else lock = l;
        })
        .catch(() => undefined);
    };
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", acquire);
      void lock?.release().catch(() => undefined);
    };
  }, [session]);

  const value = useMemo(
    () => ({ state, session, deviceType, setDeviceType, start, stop, switchCamera }),
    [state, session, deviceType, start, stop, switchCamera],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCapture(): CaptureContext {
  const context = useContext(Context);
  if (!context) throw new Error("useCapture outside CaptureProvider");
  return context;
}

/** The latest processed frame, re-rendering at most `hz` times a second (enough for the UI). */
export function useSample(session: CaptureSession | null, hz = 6): Sample | null {
  const cache = useRef<{ sample: Sample | null; at: number }>({ sample: null, at: 0 });
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!session) return () => undefined;
      return session.subscribe((sample) => {
        if (sample.at - cache.current.at < 1000 / hz) return;
        cache.current = { sample, at: sample.at };
        notify();
      });
    },
    [session, hz],
  );
  return useSyncExternalStore(
    subscribe,
    () => (session ? cache.current.sample : null),
    () => null,
  );
}

/** Re-renders when the session switches camera, so previews re-attach the new stream. */
export function useStreamVersion(session: CaptureSession | null): number {
  const subscribe = useCallback(
    (notify: () => void) => (session ? session.onChange(notify) : () => undefined),
    [session],
  );
  return useSyncExternalStore(
    subscribe,
    () => session?.streamVersion ?? 0,
    () => 0,
  );
}
