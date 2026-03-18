const CACHE = 'cqp-v3';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Install : cache les assets ET prend le contrôle immédiatement
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Prend le contrôle sans attendre
  );
});

// Activate : supprime les anciens caches ET réclame tous les clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // Prend le contrôle de tous les onglets ouverts
  );
});

// Fetch : réseau en priorité, cache en fallback
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Met à jour le cache avec la réponse fraîche
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)) // Fallback cache si offline
  );
});
