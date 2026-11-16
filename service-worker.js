const CACHE_NAME = "mascotto-v755";
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
      /* v590 : la voix Piper est retirée — son cache « mascotto-voix » (≈50 Mo) est supprimé comme les autres */
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== "mascotto-chambres").map((k) => caches.delete(k)))
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
    /* v746 : la COPIE DU TÉLÉPHONE d'abord. Au retour dans le jeu (Android a vidé la page), on
       n'attend plus les 3 Mo du réseau : la page part tout de suite du cache, et le réseau la
       remet à jour en arrière-plan pour la fois suivante. Une nouvelle version livrée change
       aussi ce fichier : le nouveau service worker s'installe et la page se recharge une fois
       (voir « controllerchange » dans index.html). Sans copie (première visite) : le réseau. */
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => cache.match("./index.html").then((copie) => {
        const reseau = fetch(new Request(req, { cache: "reload" })).then((rep) => {
          if (rep && rep.ok) cache.put("./index.html", rep.clone());
          return rep;
        });
        if (copie) { event.waitUntil(reseau.catch(() => {})); return copie; }
        return reseau.catch(() => caches.match("./index.html").then((c) => c || caches.match("./")));
      }))
    );
    return;
  }

  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
