import { useEffect, useId, useRef, useState } from "react";

// Cloudflare Turnstile widget. Gated on VITE_TURNSTILE_SITE_KEY — if the site
// key is not configured, this renders nothing and reports an empty token so
// public forms keep working unchanged before keys are added.

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile_load_failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = TURNSTILE_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile_load_failed"));
    document.head.appendChild(s);
  });
  return scriptLoadingPromise;
}

export interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export function TurnstileWidget({ onToken, theme = "auto", className }: TurnstileWidgetProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const id = useId();
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      })
      .catch(() => setLoadError(true));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, theme]);

  if (!siteKey) return null;
  if (loadError) return null;
  return <div id={id} ref={containerRef} className={className} />;
}

export function isTurnstileEnabled(): boolean {
  return Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
}
