self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 基礎的回傳，確保 PWA 符合安裝資格
  event.respondWith(fetch(event.request));
});
