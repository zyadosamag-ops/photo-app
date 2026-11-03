// صوّر وابعت - iOS PWA Service Worker v4
const CACHE = 'sowar-v4-20261103';
const SHELL = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(k =>
              k.startsWith('photo-') ||
              k.startsWith('sowar-')
            )
            .filter(k => k !== CACHE)
            .map(k => caches.delete(k))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  const url = new URL(r.url);

  if (
    r.method !== 'GET' ||
    url.origin !== self.location.origin
  ) return;

  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r, { cache: 'no-store' })
        .then(res => {
          if (res.ok) {
            const copy = res.clone();

            e.waitUntil(
              caches.open(CACHE)
                .then(c => c.put('./index.html', copy))
            );
          }

          return res;
        })
        .catch(() => caches.match('./index.html'))
    );

    return;
  }

  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();

          e.waitUntil(
            caches.open(CACHE)
              .then(c => c.put(r, copy))
          );
        }

        return res;
      })
      .catch(() => caches.match(r))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();

  e.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(cs =>
      cs.length
        ? cs[0].focus()
        : self.clients.openWindow('./')
    )
  );
});
