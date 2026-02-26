import { useEffect, useRef, useCallback } from "react";

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
    } catch (e) {
      // Wake Lock request failed (e.g., low battery)
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {}
      wakeLockRef.current = null;
    }
  }, []);

  // Re-acquire on visibility change (required by spec)
  useEffect(() => {
    if (!enabled) return;
    const onVisChange = () => {
      if (document.visibilityState === "visible" && enabled && !wakeLockRef.current) {
        request();
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [enabled, request]);

  useEffect(() => {
    if (enabled) {
      request();
    } else {
      release();
    }
    return () => { release(); };
  }, [enabled, request, release]);
}
