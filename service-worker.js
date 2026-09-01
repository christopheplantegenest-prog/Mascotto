const CACHE_NAME = "mascotto-v452";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* Pourquoi cette version corrige le blocage sur une ancienne version.
   1. `cache.addAll` passait par le cache HTTP du navigateur : GitHub Pages garde ses fichiers
      quelques minutes, si bien qu'on rangeait l'ANCIEN index.html sous le NOUVEAU nom de cache.
      Le service worker se croyait à jour en servant du vieux. `cache:"reload"` force le réseau.
   2. La stratégie était « cache d'abord, et rien d'autre » : une fois la page en cache, le
      réseau n'était plus jamais consulté pour elle. La page passe donc en « réseau d'abord »,
      le cache ne servant que de secours hors ligne. Les images et le reste gardent le cache
      d'abord — c'est là qu'il fait gagner du temps, et elles ne changent pas. */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" })))
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
    || url.pathname.endsWith("/")
    || url.pathname.endsWith("/index.html");

  if (estLaPage) {
    // Réseau d'abord : on veut toujours la dernière version du jeu quand la connexion est là.
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

  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
