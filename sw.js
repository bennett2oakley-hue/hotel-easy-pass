const CACHE_NAME = "hotel-easy-pass-v6";
const FILES_TO_CACHE = ["./", "./index.html", "./main.js", "./manifest.webmanifest", "./traveler.html", "./owner.html", "./dashboard.html", "./dashboard.js", "./privacy.html", "./terms.html"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    if (event.request.method === "GET") caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => cached)));
});
