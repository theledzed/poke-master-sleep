/* eslint-disable no-restricted-globals */
// Pokémon Sleep Master — Custom Web Push & Interactive Notification Handler
// Imported into Workbox Service Worker via importScripts('/push-sw.js')

self.addEventListener('push', (event) => {
  let payload = {
    title: '💤 Pokémon Sleep Master',
    body: 'Tienes un recordatorio pendiente para Snorlax.',
    icon: '/pwa-192x192.png',
    badge: '/favicon.png',
    tag: 'pokesleep-general',
    url: '/',
    profileId: 'cris',
    alertType: 'general',
    actions: []
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/favicon.png',
    tag: payload.tag || 'pokesleep-general',
    renotify: true,
    vibrate: [180, 80, 180],
    data: {
      url: payload.url || '/',
      profileId: payload.profileId || 'cris',
      alertType: payload.alertType || 'general'
    }
  };

  // Android / Desktop Chrome support interactive lock-screen buttons; iOS Safari safely ignores `actions`
  if (Array.isArray(payload.actions) && payload.actions.length > 0) {
    options.actions = payload.actions;
  }

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const profileId = data.profileId || 'cris';
  const clickedAction = event.action || '';

  // 1. Android Lock-Screen Button: "[✅ Ya recogí]" -> silent background reset WITHOUT opening the app!
  if (clickedAction === 'bag-collected') {
    event.waitUntil(
      (async () => {
        try {
          await fetch('/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ack',
              profileId,
              ackType: 'bag-collected'
            })
          });
        } catch (err) {
          console.warn('[push-sw] Error sending bag-collected ack:', err);
        }

        // Notify any open app windows so local state updates immediately
        const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windowClients) {
          client.postMessage({
            type: 'PUSH_BAG_COLLECTED',
            profileId,
            timestamp: new Date().toISOString()
          });
        }

        // Brief silent visual confirmation on Android status bar
        await self.registration.showNotification('✅ Reloj de bolsa reiniciado', {
          body: 'Perfecto. Volveremos a avisarte cuando tu equipo llene el inventario.',
          icon: '/pwa-192x192.png',
          badge: '/favicon.png',
          tag: `pokesleep-bag-${profileId}`,
          silent: true,
          data: { url: '/', profileId, alertType: 'ack-done' }
        });
      })()
    );
    return;
  }

  // 2. Android Lock-Screen Button: "[⏱️ +1 hora]" -> silent snooze WITHOUT opening the app!
  if (clickedAction === 'snooze-1h') {
    event.waitUntil(
      fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ack',
          profileId,
          ackType: 'snooze-1h'
        })
      }).catch(() => {})
    );
    return;
  }

  // 3. Default tap (iOS 1-tap or tapping the notification body / "Abrir Chef" button)
  const targetUrl = data.url || '/';

  event.waitUntil(
    (async () => {
      // On iOS (where secondary action buttons aren't shown), tapping a bag notification directly resets the timer!
      if (data.alertType === 'bag') {
        fetch('/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ack',
            profileId,
            ackType: 'bag-collected'
          })
        }).catch(() => {});
      }

      const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windowClients) {
        if ('focus' in client) {
          await client.focus();
          client.postMessage({
            type: 'PUSH_NAVIGATE',
            url: targetUrl,
            profileId,
            alertType: data.alertType
          });
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});
