import React from 'react';
import { motion } from 'motion/react';
import { useUser, useSettings } from '../hooks';
import { cn } from '../utils/cn';

const Settings: React.FC = () => {
  const { profile } = useUser();
  const { settings, toggleNotifications, loading } = useSettings();

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

        <div className="flex items-center justify-between p-[13px_20px] border-b border-cyan-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-primary/10 flex items-center justify-center text-[14px]">🔔</div>
            <div>
              <div className="text-[13px] font-medium">Notificări</div>
              <div className="text-[11px] text-text-muted mt-0.5">Alerte cheltuieli</div>
            </div>
          </div>
          <div
            className={cn("toggle", settings.notifications && "on")}
            onClick={toggleNotifications}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
