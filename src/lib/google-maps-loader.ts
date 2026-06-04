// Singleton loader for the Google Maps JavaScript API.
// Uses the Lovable-managed browser key + tracking ID injected via Vite env vars
// by the Google Maps Platform connector.

let loaderPromise: Promise<typeof google> | null = null;

declare global {
  interface Window {
    google: typeof google;
    __lovableGmapsInit?: () => void;
  }
}

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (loaderPromise) return loaderPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

  if (!key) {
    return Promise.reject(new Error("Google Maps browser key is not configured"));
  }

  loaderPromise = new Promise((resolve, reject) => {
    window.__lovableGmapsInit = () => resolve(window.google);

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key,
      loading: "async",
      callback: "__lovableGmapsInit",
      libraries: "places",
      v: "weekly",
    });
    if (channel) params.set("channel", channel);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}
