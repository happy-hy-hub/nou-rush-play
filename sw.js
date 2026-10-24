// オフライン用 Service Worker（PWA として HTTPS 配信したとき用。iOS アプリ版では使われない）
// VERSION と ASSETS は npm run build（tools/build-www.js）が書き込む
const VERSION = 'nr-e5a36d7a38';
const ASSETS = ["./","./data.js","./game.js","./icons/apple-touch-icon.png","./icons/icon-1024.png","./icons/icon-192.png","./icons/icon-512.png","./index.html","./manifest.webmanifest","./quiz.js","./rogue.css","./rogue.js","./roles.js","./style.css","./theme.css","./theme.js","./themes/aws.js","./themes/murakami.js","./themes/pyramid.js"];

// インストール時に全ファイルを保存 → 初回に開いた後はオフラインで全テーマ遊べる
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// ネット優先・つながらなければ保存済みを使う（更新がすぐ届くように）
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
