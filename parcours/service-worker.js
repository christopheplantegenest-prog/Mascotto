const CACHE_NAME = "parcours-v6";
const TUILES_CACHE = "parcours-tuiles"; // rempli par l'appli (Options → Préparer la carte hors connexion) et par le premier passage
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
];

/* Le parcours doit tenir deux heures sans réseau fiable :
   - la page passe en « réseau d'abord » (dernière version quand la connexion est là, cache sinon) ;
   - TOUT le reste — Leaflet, tuiles de carte, images hébergées — est gardé en cache dès le
     premier passage. Les tuiles vues pendant le premier tour avec du réseau restent donc
     disponibles ensuite.
   - v3 : les tuiles ont leur propre cache (TUILES_CACHE), que l'appli remplit d'avance
     pour tout le rectangle du parcours. La clé ignore le sous-domaine a/b/c d'OpenStreetMap,
     sans quoi une tuile déjà en cache pouvait être redemandée au réseau. */

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
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== TUILES_CACHE).map((k) => caches.delete(k)))
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

  /* Tuiles de carte : cache dédié, clé sans sous-domaine, réseau seulement si elle manque. */
  if (/(^|\.)tile\.openstreetmap\.org$/.test(url.hostname)) {
    const cle = "https://tile.openstreetmap.org" + url.pathname;
    event.respondWith(
      caches.open(TUILES_CACHE).then((cache) =>
        cache.match(cle).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((rep) => {
            if (rep && (rep.ok || rep.type === "opaque")) cache.put(cle, rep.clone());
            return rep;
          });
        })
      )
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
