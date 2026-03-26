import { useState, useEffect, useCallback } from 'react';

const NOTIF_LAST_DATE_KEY = 'financier_notif_last_date';
const NOTIF_ENABLED_KEY = 'financier_notif_enabled';

export type NotifStatus = 'default' | 'granted' | 'denied' | 'unsupported';

/**
 * Get today's date as YYYY-MM-DD
 */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Check if a daily notification was already shown today
 */
function alreadySentToday(): boolean {
  return localStorage.getItem(NOTIF_LAST_DATE_KEY) === todayKey();
}

/**
 * Mark today's notification as sent
 */
function markSentToday(): void {
  localStorage.setItem(NOTIF_LAST_DATE_KEY, todayKey());
}

/**
 * Send a message to the service worker
 */
async function sendToSW(type: string, payload?: Record<string, unknown>): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  if (registration.active) {
    registration.active.postMessage({ type, payload });
  }
}

/**
 * Hook for managing daily spending push notifications (client-side, no server needed)
 *
 * Strategy:
 * 1. Request Notification permission from browser
 * 2. Each time the app is opened with data loaded, send today's total to the SW
 * 3. SW schedules a notification at 21:00 via setTimeout
 * 4. If app is opened after 21:00 and notification wasn't sent yet today, show immediately
 */
export function useNotifications(todayTotal?: number) {
  const [status, setStatus] = useState<NotifStatus>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);

  // Read current permission state on mount
  useEffect(() => {
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return;
    }

    const permStatus = Notification.permission as NotifStatus;
    setStatus(permStatus);

    const enabled = localStorage.getItem(NOTIF_ENABLED_KEY) === 'true';
    setIsEnabled(enabled && permStatus === 'granted');
  }, []);

  /**
   * Request permission and activate notifications
   */
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setStatus(result as NotifStatus);

      if (result === 'granted') {
        localStorage.setItem(NOTIF_ENABLED_KEY, 'true');
        setIsEnabled(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Notifications] Failed to request permission:', error);
      return false;
    }
  }, []);

  /**
   * Disable notifications: cancel scheduled and clear preference
   */
  const disableNotifications = useCallback(async (): Promise<void> => {
    localStorage.setItem(NOTIF_ENABLED_KEY, 'false');
    setIsEnabled(false);
    setScheduledFor(null);
    await sendToSW('CANCEL_NOTIFICATION');
  }, []);

  /**
   * Toggle notifications on/off (called from Settings)
   */
  const toggleNotifications = useCallback(async (): Promise<void> => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  }, [isEnabled, enableNotifications, disableNotifications]);

  /**
   * Schedule the daily notification via Service Worker
   * Called automatically when expenses data is loaded
   */
  const scheduleDailyNotification = useCallback(async (total: number): Promise<void> => {
    if (!isEnabled || status !== 'granted') return;
    if (!('serviceWorker' in navigator)) return;

    const now = new Date();
    const hour = now.getHours();

    // If it's past 21:00 and we haven't sent a notification today → show now
    if (hour >= 21 && !alreadySentToday()) {
      markSentToday();
      const title = '💰 Rezumat zilnic';
      const body = total > 0
        ? `Ai cheltuit ${total.toLocaleString('ro-RO')} lei azi.`
        : 'Nicio cheltuială azi! Zi excelentă 🎉';

      new Notification(title, {
        body,
        icon: '/logo.png',
        tag: `daily-summary-${todayKey()}`,
      });
      return;
    }

    // Otherwise, delegate to Service Worker to schedule at 21:00
    const target = new Date();
    target.setHours(21, 0, 0, 0);
    if (now >= target) {
      target.setDate(target.getDate() + 1);
    }

    setScheduledFor(target.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));

    await sendToSW('SCHEDULE_DAILY_NOTIFICATION', {
      total,
      currency: 'lei',
      date: todayKey(),
    });
  }, [isEnabled, status]);

  /**
   * Send test notification immediately (for debugging)
   */
  const sendTestNotification = useCallback(async (total: number): Promise<void> => {
    if (status !== 'granted') return;

    new Notification('💰 Test notificare', {
      body: `Azi ai cheltuit ${total.toLocaleString('ro-RO')} lei. (test)`,
      icon: '/logo.png',
      tag: 'test-notification',
    });
  }, [status]);

  // Auto-schedule when expenses total changes and notifications are enabled
  useEffect(() => {
    if (todayTotal !== undefined && isEnabled && status === 'granted') {
      scheduleDailyNotification(todayTotal);
    }
  }, [todayTotal, isEnabled, status, scheduleDailyNotification]);

  return {
    status,
    isEnabled,
    scheduledFor,
    enableNotifications,
    disableNotifications,
    toggleNotifications,
    sendTestNotification: () => sendTestNotification(todayTotal ?? 0),
  };
}
