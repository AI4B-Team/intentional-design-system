// Legacy service worker kill switch.
//
// Older preview sessions registered /sw.js. The current PWA worker is emitted as
// /service-worker.js, so this file lets browsers replace the stale /sw.js worker,
// clear any cached app shell/chunks, and return control to the live preview.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});

self.addEventListener("fetch", () => {
  // No-op: once activated this worker unregisters itself and does not intercept requests.
});