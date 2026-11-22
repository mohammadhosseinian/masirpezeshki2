/* Service Worker برنامه «در مسیر پزشکی»
   هر زمان index.html را تغییر دادید، شماره‌ی VERSION را یکی بالا ببرید تا گوشی نسخه‌ی جدید را بگیرد. */
const VERSION = 'v2';
const CACHE = 'dar-masir-pezeshki-' + VERSION;
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== 'fonts').map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // فونت‌های گوگل: بار اول از اینترنت، بعد از حافظه
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open('fonts').then(async c => {
        const hit = await c.match(req);
        const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  // فایل‌های خود برنامه: اول حافظه، اگر نبود اینترنت
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).catch(() =>
        req.mode === 'navigate' ? caches.match('./index.html') : undefined))
    );
  }
});
