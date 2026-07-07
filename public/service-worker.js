/* Protocol 1000 — Service Worker
 * -------------------------------------------------------------------------
 * Goals for a standalone iOS home-screen web app:
 *   1. App boots instantly and works fully offline after first visit.
 *   2. New deploys are picked up cleanly (versioned caches + skipWaiting).
 *   3. Vite emits content-hashed asset filenames, so we CANNOT hardcode them.
 *      -> Precache only the stable shell; runtime-cache the hashed assets
 *         with stale-while-revalidate the first time they are requested.
 *   4. SPA navigations always resolve to index.html (network-first, then
 *      cache, then a friendly offline page) so deep links never 404 offline.
 *
 * IMPORTANT: bump CACHE_VERSION on every release to invalidate old caches.
 * ------------------------------------------------------------------------- */

const CACHE_VERSION = 'v1.2.0';
const APP_SHELL_CACHE = `p1000-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `p1000-runtime-${CACHE_VERSION}`;

// Stable files we know exist at these exact paths.
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// ---- Install: precache the shell -----------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      // addAll is atomic; if one asset 404s the whole install fails, so we
      // add them individually and ignore misses to stay resilient.
      .then((cache) =>
        Promise.all(
          APP_SHELL.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

// ---- Activate: drop old caches, take control -----------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== APP_SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      );
      // Enable navigation preload where supported (not iOS yet, but harmless).
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (_) {
          /* noop */
        }
      }
      await self.clients.claim();
    })()
  );
});

// Allow the page to trigger an immediate update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// ---- Fetch strategy -------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET; never touch cross-origin or non-http(s) requests.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 1) Navigations (SPA routes) -> network-first, fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  // 2) Static assets (hashed JS/CSS, fonts, images) -> stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(request));
});

async function handleNavigation(event) {
  const { request } = event;
  try {
    const preload = await event.preloadResponse;
    if (preload) return preload;

    const network = await fetch(request);
    // Keep a fresh copy of the shell for offline use.
    const cache = await caches.open(APP_SHELL_CACHE);
    cache.put('/index.html', network.clone());
    return network;
  } catch (_) {
    const cache = await caches.open(APP_SHELL_CACHE);
    return (
      (await cache.match('/index.html')) ||
      (await cache.match('/')) ||
      (await cache.match('/offline.html')) ||
      new Response('You are offline.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      })
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      // Only cache good, basic responses (skip opaque/error responses).
      if (response && response.status === 200 && response.type === 'basic') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Serve cache immediately if present; otherwise wait for the network.
  return cached || (await network) || fetchFallback(request);
}

async function fetchFallback(request) {
  // Last-resort fallback for images so broken tiles don't appear offline.
  if (request.destination === 'image') {
    const cache = await caches.open(APP_SHELL_CACHE);
    const icon = await cache.match('/icons/icon-192.png');
    if (icon) return icon;
  }
  return new Response('', { status: 504, statusText: 'Offline' });
}
