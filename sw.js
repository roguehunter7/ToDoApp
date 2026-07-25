const CACHE = 'pulsetask-v6';

// Derive base path dynamically so it works under any deployment path
const base = self.location.pathname.replace(/\/[^/]*$/, '/');

const ASSETS = [
  base,
  base + 'index.html',
  base + 'style.css',
  base + 'app.js',
  base + 'manifest.json',
  base + 'favicon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
});

// Stale-while-revalidate with network timeout
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(cached => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const fetchPromise = fetch(e.request, { signal: controller.signal })
          .then(res => {
            clearTimeout(timeout);
            if (res.ok) c.put(e.request, res.clone());
            return res;
          })
          .catch(() => cached || new Response('Offline', { status: 503 }));

        return cached || fetchPromise;
      })
    )
  );
});
