/* =====================================================================
   Regenerative Peace Bridges — sw.js (service worker)
   Keeps an offline copy of this app's OWN files so it opens without a
   connection. It never stores other websites, your plans or anything
   you type (those live only in the page's own storage).

   When you change any file, bump VERSION so readers get the update.
   The page then shows "A new version is ready" with a Reload button,
   so nobody loses work to a surprise refresh.
   ===================================================================== */
const VERSION = "rpb-core-v3.0.0";
const CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "./styles.css",
  "./early.js",
  "./data.js",
  "./lang/content-paths.js",
  "./lang/catalog.js",
  "./lang/fr.js",
  "./lang/es.js",
  "./lang/ar.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./fonts/fraunces-latin-full-normal.woff2",
  "./fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2",
  "./fonts/atkinson-hyperlegible-next-latin-wght-italic.woff2"
];

self.addEventListener("install", (event) => {
  // No automatic skipWaiting: the page asks the reader before switching.
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("rpb-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // other websites: never cached

  // Pages: try the network first so fixes arrive quickly; fall back to
  // the saved copy, then to the offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then((hit) => hit || caches.match("./index.html"))
          .then((hit) => hit || caches.match("./offline.html")))
    );
    return;
  }

  // App files: use the saved copy, fetch and save anything missing.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => new Response("Offline: this file is not in the offline copy yet.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })))
  );
});
