const CACHE_NAME = "nexus-defender-v2.2.3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./designs.html",
  "./manifest.webmanifest",
  "./icons/nexus-defender.svg",
  "./css/styles.css?v=2.2.3",
  "./css/designs.css",
  "./js/audio-system.js?v=1.6",
  "./js/cosmetic-art.js?v=1.8",
  "./js/enemy-art.js",
  "./js/enemy-behavior.js?v=1.6",
  "./js/enemy-previews.js",
  "./js/game-rules.js?v=1.5",
  "./js/player-art.js?v=1.5",
  "./js/game.js?v=2.2.3",
  "./js/gallery.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(
    names.filter((name) => name.startsWith("nexus-defender-") && name !== CACHE_NAME)
      .map((name) => caches.delete(name))
  )));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;

  // Las páginas consultan primero la red para recibir actualizaciones. Si no hay
  // conexión, se usa la portada guardada y el resto del juego sigue disponible.
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return response;
  })));
});
