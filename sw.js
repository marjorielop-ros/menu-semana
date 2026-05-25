const CACHE = "menu-semanal-v5";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = e.request.url;
  const esFuente = url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com");

  if (esFuente) {
    // Fuentes: cache-first, y se guardan al vuelo la primera vez (para offline)
    e.respondWith(
      caches.open(CACHE).then(c =>
        c.match(e.request).then(hit =>
          hit || fetch(e.request).then(resp => { c.put(e.request, resp.clone()); return resp; })
                 .catch(() => hit)
        )
      )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).catch(() => caches.match("./index.html"))
    )
  );
});
