/* eslint-disable no-restricted-globals */
// Pokémon Sleep Master — Custom Web Push & Interactive Notification Handler
// Optimized for Wear OS (Pixel Watch 4 / Galaxy Watch) and Android Lock-Screens
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

  // Helper to ensure all asset URLs are fully-qualified HTTPS so Wear OS companion service
  // can download and display bitmaps on circular smartwatch displays
  const toAbsoluteUrl = (path) => {
    if (!path) return undefined;
    try {
      return new URL(path, self.location.origin).href;
    } catch {
      return path;
    }
  };

  // Distinct haptics: default to a tailored two-beat tap rhythm for smartwatches
  const vibratePattern = payload.vibrate || [100, 60, 100];

  const options = {
    body: payload.body,
    icon: toAbsoluteUrl(payload.icon || '/pwa-192x192.png'),
    badge: toAbsoluteUrl(payload.badge || '/favicon.png'),
    tag: payload.tag || 'pokesleep-general',
    renotify: true,
    vibrate: vibratePattern,
    data: {
      url: payload.url || '/',
      profileId: payload.profileId || 'cris',
      alertType: payload.alertType || 'general',
      icon: payload.icon
    }
  };

  // Wear OS BigPictureStyle / Android expanded card banner
  if (payload.image) {
    options.image = toAbsoluteUrl(payload.image);
  }

  // Android & Wear OS interactive action pills (rendered directly on smartwatch screen)
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

  const toAbsoluteUrl = (path) => {
    if (!path) return undefined;
    try {
      return new URL(path, self.location.origin).href;
    } catch {
      return path;
    }
  };

  // 1. Pixel Watch / Android Lock-Screen Button: "[✅ Recogí]" -> silent background reset WITHOUT opening the app!
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

        // Crisp haptic confirmation card on Pixel Watch & phone status bar
        await self.registration.showNotification('✅ Bolsa reiniciada', {
          body: 'Reloj en marcha para la siguiente recolección.',
          icon: toAbsoluteUrl(data.icon || '/pwa-192x192.png'),
          badge: toAbsoluteUrl('/favicon.png'),
          tag: `pokesleep-bag-${profileId}`,
          vibrate: [60],
          silent: false,
          data: { url: '/', profileId, alertType: 'ack-done' }
        });
      })()
    );
    return;
  }

  // 2. Pixel Watch / Android Lock-Screen Button: "[⏱️ +1h]" -> silent snooze WITHOUT opening the app!
  if (clickedAction === 'snooze-1h') {
    event.waitUntil(
      (async () => {
        try {
          await fetch('/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ack',
              profileId,
              ackType: 'snooze-1h'
            })
          });
        } catch (err) {
          console.warn('[push-sw] Error sending snooze ack:', err);
        }

        await self.registration.showNotification('⏱️ Pospuesto 1 hora', {
          body: 'Te recordaremos revisar tu inventario en 60 minutos.',
          icon: toAbsoluteUrl(data.icon || '/pwa-192x192.png'),
          badge: toAbsoluteUrl('/favicon.png'),
          tag: `pokesleep-bag-${profileId}`,
          vibrate: [50],
          silent: false,
          data: { url: '/', profileId, alertType: 'ack-done' }
        });
      })()
    );
    return;
  }

  // 3. Default tap (tapping notification card / "Abrir Chef" button)
  const targetUrl = data.url || '/';

  event.waitUntil(
    (async () => {
      // On iOS (where action buttons aren't rendered), tapping a bag notification directly resets the timer!
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

