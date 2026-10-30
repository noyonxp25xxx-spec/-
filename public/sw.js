// ==============================================================================
// ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা - Service Worker (PWA)
// ==============================================================================

const CACHE_NAME = 'bhaggo-pwa-v3';
const PRECACHE_ASSETS = [
  '/offline',
  '/logo.jpg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/apple-touch-icon.png'
];

// Install: Cache critical static shell & offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Secure, Role-Aware, Ledger-Safe Routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Never intercept non-GET requests (POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // 2. Strict Dev & Next.js chunk protection: NEVER cache /_next/ or hot reload assets
  if (url.pathname.startsWith('/_next/') || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // 3. Strict Financial Security: NEVER cache API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'ইন্টারনেট সংযোগ বিচ্ছিন্ন। আর্থিক বা অনুমোদন কার্যক্রম সম্পন্ন করতে অনলাইন থাকা আবশ্যক।'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // 4. Strict Role-Based Portal Protection:
  if (
    url.pathname.startsWith('/ceo/') ||
    url.pathname.startsWith('/employee/') ||
    url.pathname.startsWith('/maintenance/')
  ) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match('/offline');
        return fallback || new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // 5. Static assets (icons, images, fonts): Cache-first with network fallback
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.includes('fonts.googleapis.com') ||
    url.pathname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. HTML Page Navigation (Public Homepage): Network-First, fallback to cache, then /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const cache = await caches.open(CACHE_NAME);
          const offlinePage = await cache.match('/offline');
          return offlinePage || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Default: Network fetch
  event.respondWith(fetch(request));
});
