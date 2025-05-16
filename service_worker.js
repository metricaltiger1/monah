const CACHE_NAME = "monah-cache-v1";
const urlsToCache = [
  "/monah/index.html",
  "/monah/auth/login.html",
  "/monah/auth/signup.html",
  "/monah/app/chat.html",
  "/monah/app/history.html",
  "/monah/css/main.css",
  "/monah/js/main.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
