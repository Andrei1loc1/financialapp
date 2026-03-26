import React from 'react';
import { motion } from 'motion/react';
import { useUser, useSettings, useExpenses, useNotifications } from '../hooks';
import { cn } from '../utils/cn';
import { Bell, BellOff, BellRing, Send } from 'lucide-react';

const Settings: React.FC = () => {
  const { profile } = useUser();
  const { settings, loading } = useSettings();
  const { expenses } = useExpenses();

  // Calculate today's total for notifications
  const todayTotal = React.useMemo(() => {
    const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
    return expenses
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const {
    status,
    isEnabled,
    scheduledFor,
    toggleNotifications,
    sendTestNotification,
  } = useNotifications(todayTotal);

  // Get first letter of name for avatar
  const avatarLetter = profile?.fullName?.charAt(0).toUpperCase() || 'U';

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col flex-1 pb-[88px] items-center justify-center min-h-[400px]"
      >
        <div className="text-text-muted">Se încarcă...</div>
      </motion.div>
    );
  }

  const notifBlocked = status === 'denied';
  const notifUnsupported = status === 'unsupported';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col flex-1 pb-[88px]"
    >
      <div className="px-5 pt-12 pb-4 flex justify-between items-center">
        <div>
          <div className="text-[11px] text-text-muted tracking-[0.1em] uppercase mb-1">Cont</div>
          <div className="text-[24px] font-extrabold tracking-tight">Setări</div>
        </div>
        <div className="w-[42px] h-[42px] rounded-full bg-linear-to-br from-cyan-secondary to-teal-primary flex items-center justify-center text-[17px] font-extrabold text-white">
          {avatarLetter}
        </div>
      </div>

      {/* User Info Card */}
      <div className="liquid-card mx-4 mb-3.5 p-[18px]">
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-3">Informații cont</div>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-cyan-primary/10 flex items-center justify-center text-2xl">
            {avatarLetter}
          </div>
          <div>
            <div className="text-[15px] font-bold text-text-primary">{profile?.fullName || 'User'}</div>
            <div className="text-[12px] text-text-secondary mt-0.5">
              Venit lunar: <span className="text-cyan-primary font-mono">{profile?.income?.toLocaleString() || '0'} lei</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-2 text-[11px] text-text-muted uppercase tracking-widest"><span>Preferințe</span></div>
      <div className="liquid-card mx-4 mb-3.5 p-0 overflow-hidden">
        <div className="flex items-center justify-between p-[13px_20px] border-b border-cyan-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-primary/10 flex items-center justify-center text-[14px]">💰</div>
            <div>
              <div className="text-[13px] font-medium">Monedă</div>
              <div className="text-[11px] text-text-muted mt-0.5">Valuta afișată</div>
            </div>
          </div>
          <div className="text-[11px] text-cyan-primary font-mono">{settings.currency}</div>
        </div>
      </div>

      {/* Daily Notifications Card */}
      <div className="px-5 pb-2 text-[11px] text-text-muted uppercase tracking-widest">
        <span>Notificări zilnice</span>
      </div>
      <div className="liquid-card mx-4 mb-3.5 overflow-hidden">

        {/* Notification header row */}
        <div className="flex items-center justify-between p-[16px_20px] border-b border-cyan-primary/5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isEnabled ? "bg-green-primary/10" : "bg-text-muted/10"
            )}>
              {isEnabled
                ? <BellRing size={15} className="text-green-primary" />
                : <BellOff size={15} className="text-text-muted" />
              }
            </div>
            <div>
              <div className="text-[13px] font-medium">Rezumat la ora 21:00</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {notifUnsupported
                  ? 'Browserul nu suportă notificările'
                  : notifBlocked
                    ? 'Blocat — schimbă din setările browserului'
                    : isEnabled
                      ? scheduledFor
                        ? `Programat pentru ${scheduledFor}`
                        : 'Activ · La ora 21:00 zilnic'
                      : 'Vei primi suma cheltuită în ziua respectivă'
                }
              </div>
            </div>
          </div>

          {/* Toggle */}
          {!notifUnsupported && !notifBlocked && (
            <div
              className={cn("toggle", isEnabled && "on")}
              onClick={toggleNotifications}
            />
          )}
        </div>

        {/* Info row when enabled */}
        {isEnabled && !notifBlocked && !notifUnsupported && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* What the notification looks like */}
            <div className="mx-4 my-3 rounded-[14px] bg-bg/60 border border-border-primary p-3.5">
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Bell size={10} />
                Previzualizare notificare
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-cyan-primary/15 flex items-center justify-center text-[16px] shrink-0">
                  💰
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-text-primary">Rezumat zilnic</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">
                    {todayTotal > 0
                      ? `Ai cheltuit ${todayTotal.toLocaleString('ro-RO')} lei azi.`
                      : 'Nicio cheltuială azi! Zi excelentă 🎉'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Test button */}
            <button
              onClick={sendTestNotification}
              className="w-[calc(100%-32px)] mx-4 mb-3.5 py-2.5 rounded-xl border border-cyan-primary/30 text-cyan-primary text-[12px] font-medium bg-cyan-primary/5 hover:bg-cyan-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Send size={13} />
              Trimite test acum
            </button>
          </motion.div>
        )}

        {/* Blocked warning */}
        {notifBlocked && (
          <div className="px-4 pb-4 pt-2 text-[11px] text-amber-primary/80 leading-relaxed">
            ⚠️ Notificările sunt blocate de browser. Du-te la <strong>Setări browser → Site-uri → Notificări</strong> și permite pentru această pagină.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;
