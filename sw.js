// Cambiamos la versión para forzar al navegador a actualizar el caché
const CACHE_NAME = 'pizarra-editorial-v2'; 

// Agregamos todos los archivos esenciales de la nueva estructura
const assets = [
  './',
  './dashboard.html',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalar el Service Worker y guardar en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(assets))
      .then(() => self.skipWaiting()) // Fuerza la activación inmediata
  );
});

// Activar el Service Worker y limpiar cachés viejos (muy importante al actualizar)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar peticiones (modo Offline-first)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    }).catch(() => {
      // Si falla la red y no está en caché, y es navegación, mandamos al dashboard
      if (e.request.mode === 'navigate') {
        return caches.match('./dashboard.html');
      }
    })
  );
});
