const CACHE_NAME = "hotel-easy-pass-v7";
const FILES_TO_CACHE = ["./", "./index.html", "./main.js", "./manifest.webmanifest", "./traveler.html", "./owner.html", "./dashboard.html", "./dashboard.js", "./privacy.html", "./terms.html"];

self.addEventListener("install", event => {
  // "reload" keeps the offline snapshot from being seeded with an old HTTP-cached build.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE.map(url => new Request(url, { cache: "reload" })))));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;
  // Network first. The server lets JS sit in the HTTP cache for an hour, so a
  // cache-first service worker would keep serving the previous build long after
  // a deploy. Revalidating on every request means a release reaches the traveller
  // straight away; the cache below still keeps the app usable with no connection.
  event.respondWith(
    fetch(request, { cache: "no-cache" }).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});
