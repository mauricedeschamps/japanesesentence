const CACHE_NAME = 'nihongo-builder-v1';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192.jpg',
  'icons/icon-512.jpg'
  // 必要な外部リソース（フォントなど）があれば追加
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// フェッチ時にキャッシュ優先、なければネットワーク
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(
          networkResponse => {
            // 動的リクエストはキャッシュしない（オプションで変更可）
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // オフライン時のフォールバック（簡易）
        return new Response('オフラインです。ネットワークに接続してください。', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});