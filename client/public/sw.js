// sw.js - Reliable PWA Service Worker (no cache for API/HEAD/POST)
const CACHE_NAME = 'tds-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event – cache essential files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event – only cache GET for http/https, skip API/storage
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests with http or https
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Skip Supabase API / Storage calls (they're dynamic)
  if (request.url.includes('supabase.co') || request.url.includes('storage/v1')) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          // Only cache same-origin or fonts/scripts
          if (new URL(request.url).origin === location.origin) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});