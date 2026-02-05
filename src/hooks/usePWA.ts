import { useState, useEffect, useCallback, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isInWebAppiOS = (window.navigator as unknown as { standalone: boolean }).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setIsInstallable(false);
    };

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Service worker: proactively check for updates and surface when a refresh is needed.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let cleanup: undefined | (() => void);

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (cancelled || !registration) return;

        registrationRef.current = registration;

        const handleUpdateFound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            // If there's an existing controller, an update means we need a refresh
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setNeedsRefresh(true);
            }
          });
        };

        registration.addEventListener("updatefound", handleUpdateFound);

        const checkForUpdate = () => {
          registration.update().catch(() => {
            /* noop */
          });
        };

        // Kick off an update check immediately, and also on focus/online.
        checkForUpdate();
        window.addEventListener("focus", checkForUpdate);
        window.addEventListener("online", checkForUpdate);

        cleanup = () => {
          registration.removeEventListener("updatefound", handleUpdateFound);
          window.removeEventListener("focus", checkForUpdate);
          window.removeEventListener("online", checkForUpdate);
        };
      } catch {
        // noop
      }
    };

    void setup();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstallable(false);
      return true;
    }
    return false;
  }, [installPrompt]);

  const refreshApp = useCallback(() => {
    // In a PWA, a plain reload may still be controlled by an old service worker.
    if (!("serviceWorker" in navigator)) {
      window.location.reload();
      return;
    }

    let reloaded = false;
    const reloadOnce = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", reloadOnce);

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        // If a worker is waiting, try to activate it (supported by the generated SW when skipWaiting is enabled).
        registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
        return registration?.update();
      })
      .catch(() => {
        /* noop */
      })
      .finally(() => {
        // Fallback: ensure we still refresh even if controllerchange doesn't fire quickly.
        window.setTimeout(() => {
          navigator.serviceWorker.removeEventListener("controllerchange", reloadOnce);
          reloadOnce();
        }, 1200);
      });
  }, []);

  return {
    isInstalled,
    isInstallable,
    isOnline,
    needsRefresh,
    promptInstall,
    refreshApp,
  };
}

// Hook for detecting iOS
export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  return isIOS;
}

// Hook for detecting if in standalone mode
export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isDisplayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = (window.navigator as unknown as { standalone: boolean }).standalone === true;
    setIsStandalone(isDisplayModeStandalone || isIOSStandalone);
  }, []);

  return isStandalone;
}
