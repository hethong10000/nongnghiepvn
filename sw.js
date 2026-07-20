/* ANVIFA — Service Worker (giup app cai duoc len may va mo nhanh) */
const CACHE = 'anvifa-shell-v1';
const SHELL = ['./quanlybanhang.html', './icon-192.png', './icon-512.png', './manifest-banhang.webmanifest'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Chi xu ly file cua chinh app (khong dung den Firebase/gstatic)
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // File HTML: LUON lay ban moi nhat tren mang truoc (de cap nhat app), mat mang moi dung ban da luu
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return r;
      }).catch(() =>
        caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./quanlybanhang.html'))
      )
    );
    return;
  }

  // Icon / manifest: dung ban da luu cho nhanh, tai ngam ban moi
  e.respondWith(
    caches.match(e.request).then(m => m || fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return r;
    }))
  );
});
