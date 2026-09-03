const CACHE_NAME = "parcours-v1";
const ASSETS = [
  "./",
  "./index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
];

/* Le parcours doit tenir deux heures sans réseau fiable :
   - la page passe en « réseau d'abord » (dernière version quand la connexion est là, cache sinon) ;
   - TOUT le reste — Leaflet, tuiles de carte, images hébergées — est gardé en cache dès le
     premier passage. Les tuiles vues pendant le premier tour avec du réseau restent donc
     disponibles ensuite. (Le préchargement systématique d'une zone viendra à l'étape 4.) */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) =>
        cache.add(new Request(url, { cache: "reload", mode: url.startsWith("http") ? "no-cors" : "same-origin" })).catch(() => null)
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const estLaPage = req.mode === "navigate"
    || (url.origin === self.location.origin && (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")));

  if (estLaPage) {
    event.respondWith(
      fetch(new Request(req, { cache: "reload" }))
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE_NAME).then((c) => c.put("./index.html", copie));
          return rep;
        })
        .catch(() => caches.match("./index.html").then((c) => c || caches.match("./")))
    );
    return;
  }

  /* Le fichier de parcours (.json) doit toujours être relu quand le réseau répond :
     c'est lui qui porte les mises à jour du concepteur. */
  if (url.pathname.endsWith(".json")) {
    event.respondWith(
      fetch(req).then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copie));
        return rep;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((rep) => {
        if (rep && (rep.ok || rep.type === "opaque")) {
          const copie = rep.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copie));
        }
        return rep;
      });
    })
  );
});
