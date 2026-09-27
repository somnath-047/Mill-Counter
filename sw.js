const CACHE_NAME = "meal-counter-v4";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

/* ================================
   INSTALL
================================ */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  // Activate the new service worker immediately
  self.skipWaiting();
});


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  // Take control of all open pages immediately
  self.clients.claim();
});


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", (event) => {

  /*
   * For page navigation / HTML:
   * Always try the latest version from the server first.
   *
   * This prevents GitHub Pages from showing
   * an old cached index.html after an update.
   */

  if (event.request.mode === "navigate") {

    event.respondWith(
      fetch(event.request)
        .then((response) => {

          // Save the latest HTML in cache
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put("./index.html", responseClone);
          });

          return response;
        })
        .catch(() => {

          // If there is no internet,
          // use the cached version.
          return caches.match("./index.html");
        })
    );

    return;
  }


  /*
   * For other files:
   * Use cache if available.
   * Otherwise request from the server.
   */

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );

});