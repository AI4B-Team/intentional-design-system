import { useEffect } from "react";

export function useOrientationLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const so = screen.orientation;
    if (!so?.lock) return;
    so.lock("portrait-primary").catch(() => {
      // Not supported or denied — silent fallback
    });
    return () => {
      so.unlock?.();
    };
  }, [enabled]);
}
