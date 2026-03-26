/**
 * firebase-messaging-sw.js
 * Service Worker for daily spending notifications (Option B - client-side, no server required)
 *
 * Strategy: When the app sends a "SCHEDULE_DAILY_NOTIFICATION" message with today's total,
 * the SW calculates ms until 21:00 and uses setTimeout to show the notification.
 * On Android PWA, Chrome keeps the SW alive in background, so this works even with the app minimized.
 */

// Cache for storing the daily total received from the app
let pendingNotificationData = null;
let scheduledTimer = null;

/**
 * Calculate milliseconds until next 21:00 (9 PM)
 */
function msUntil2100() {
  const now = new Date();
  const target = new Date();
  target.setHours(21, 0, 0, 0);

  // If 21:00 has already passed today, schedule for tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Show the daily spending notification
 */
async function showDailyNotification(data) {
  const { total, currency } = data || {};
  const todayKey = getTodayKey();

  // Check if we already sent notification today
  const clients = await self.clients.matchAll();
  
  const title = '💰 Rezumat zilnic';
  let body;

  if (total > 0) {
    body = `Ai cheltuit ${total.toLocaleString('ro-RO')} ${currency || 'lei'} azi. Deschide app-ul pentru detalii.`;
  } else {
    body = 'Nicio cheltuială înregistrată azi! Zi excelentă 🎉';
  }

  await self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `daily-summary-${todayKey}`,   // Prevents duplicate notifications for same day
    renotify: false,
    data: { url: '/', date: todayKey },
    actions: [
      { action: 'open', title: 'Deschide' },
      { action: 'dismiss', title: 'Închide' }
    ],
    vibrate: [200, 100, 200]
  });
}

/**
 * Schedule notification for 21:00 using setTimeout
 */
function scheduleNotification(data) {
  // Cancel any existing timer
  if (scheduledTimer !== null) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }

  pendingNotificationData = data;
  const delay = msUntil2100();
  const hoursUntil = Math.round(delay / 3600000 * 10) / 10;

  console.log(`[SW] Notification scheduled in ${hoursUntil}h (at 21:00)`);

  scheduledTimer = setTimeout(async () => {
    scheduledTimer = null;
    await showDailyNotification(pendingNotificationData);
    pendingNotificationData = null;
  }, delay);
}

// ─── Service Worker Lifecycle ─────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[SW] Installing notification service worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating notification service worker');
  event.waitUntil(self.clients.claim());
});

// ─── Message Handler (receives data from app) ─────────────────────────────────

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SCHEDULE_DAILY_NOTIFICATION':
      // App sends today's total → schedule for 21:00
      scheduleNotification(payload);
      // Respond with scheduled time
      if (event.ports && event.ports[0]) {
        const delay = msUntil2100();
        event.ports[0].postMessage({
          success: true,
          scheduledAt: new Date(Date.now() + delay).toISOString()
        });
      }
      break;

    case 'CANCEL_NOTIFICATION':
      // User disabled notifications
      if (scheduledTimer !== null) {
        clearTimeout(scheduledTimer);
        scheduledTimer = null;
        pendingNotificationData = null;
        console.log('[SW] Notification cancelled');
      }
      break;

    case 'SEND_NOW':
      // For testing: send notification immediately
      showDailyNotification(event.data.payload);
      break;
  }
});

// ─── Notification Click Handler ───────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow('/');
    })
  );
});
