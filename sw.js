// Service worker GRIT — notifications push + ouverture de l'app au clic
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'GRIT', body: event.data ? event.data.text() : "N'oublie pas de loguer ta séance du jour 💪" };
  }
  const title = data.title || 'GRIT';
  const options = {
    body: data.body || "N'oublie pas de loguer ta séance du jour 💪",
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'grit-daily-reminder',
    renotify: true,
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
