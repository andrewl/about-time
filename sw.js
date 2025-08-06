const CACHE_NAME = 'abouttimer-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './timer.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data.type === 'TIMER_DONE') {
    self.registration.showNotification('Timer Finished!', {
      body: 'Your timer has reached 0 minutes.',
      icon: 'icons/icon-192.png'
    });
  }
});

