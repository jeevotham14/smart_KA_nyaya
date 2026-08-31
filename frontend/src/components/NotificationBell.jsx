import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Loader2, X, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { notificationApi } from '../services/api.js';

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const token = localStorage.getItem('smartNyayaToken');

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const [notifs, countData] = await Promise.all([
        notificationApi.getNotifications(20),
        notificationApi.getUnreadCount(),
      ]);
      const safeNotifs = Array.isArray(notifs) ? notifs : [];
      setNotifications(safeNotifs);
      setUnreadCount(
        typeof countData?.unread_count === 'number'
          ? countData.unread_count
          : safeNotifs.filter((n) => !n.read_status).length
      );
    } catch (err) {
      // Fallback silently if unauthenticated or network hiccup
    }
  };

  useEffect(() => {
    if (!token) return;
    loadNotifications();

    // Polling every 45s (NEAR_REAL_TIME)
    const interval = setInterval(loadNotifications, 45000);

    // Refresh on window focus
    const onFocus = () => loadNotifications();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [token]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkOne = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, read_status: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="relative inline-block" ref={panelRef}>
      {/* ── Bell Icon Button ── */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-200 hover:border-legalGold hover:text-legalGold focus:outline-none focus:ring-2 focus:ring-legalGold/50"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            id="notification-badge"
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-black text-white shadow-md animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-white animate-scale-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-navy-950">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-legalGold" />
              <span className="text-sm font-bold text-navy-900 dark:text-white">
                {isKn ? 'ಅಧಿಸೂಚನೆಗಳು' : 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-2 py-0.5 text-xs font-bold">
                  {unreadCount} {isKn ? 'ಹೊಸ' : 'new'}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={loading}
                className="text-xs font-semibold text-legalGold hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : (isKn ? 'ಎಲ್ಲವನ್ನೂ ಓದಿದೆ ಎಂದು ಗುರುತಿಸಿ' : 'Mark all read')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {(!Array.isArray(notifications) || notifications.length === 0) ? (
              <div className="p-8 text-center text-sm text-slate-400">
                {isKn ? 'ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ' : 'No notifications yet'}
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.notification_id}
                  onClick={() => !notif.read_status && handleMarkOne(notif.notification_id)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-800/50 ${
                    !notif.read_status ? 'bg-amber-50/50 dark:bg-legalGold/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!notif.read_status && (
                        <span className="h-2 w-2 rounded-full bg-legalGold shrink-0" />
                      )}
                      <p className="text-xs font-bold text-navy-900 dark:text-white">
                        {notif.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
