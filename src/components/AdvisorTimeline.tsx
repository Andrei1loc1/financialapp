import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useBudget, useExpenses } from '../hooks';
import {
  ADVISOR_TIMELINE_MAX_DAY,
  clampProjectedDay,
  deriveAdvisorTimelineState,
  pickAdvisorTimelineMessage,
  projectDayToPositionPercent,
  type AdvisorTimelineState,
} from '../utils/advisorTimeline';
import { cn } from '../utils/cn';

interface AdvisorTimelineProps {
  className?: string;
}

const STATE_STYLES: Record<
  AdvisorTimelineState,
  {
    accent: string;
    glow: string;
    ring: string;
  }
> = {
  green: {
    accent: 'text-cyan-primary',
    glow: 'rgba(56, 189, 248, 0.22)',
    ring: 'border-cyan-primary/35 bg-cyan-primary/10',
  },
  yellow: {
    accent: 'text-purple-primary',
    glow: 'rgba(167, 139, 250, 0.22)',
    ring: 'border-purple-primary/35 bg-purple-primary/10',
  },
  red: {
    accent: 'text-pink-primary',
    glow: 'rgba(244, 114, 182, 0.22)',
    ring: 'border-pink-primary/35 bg-pink-primary/10',
  },
  empty: {
    accent: 'text-cyan-primary/70',
    glow: 'rgba(56, 189, 248, 0.08)',
    ring: 'border-cyan-primary/20 bg-cyan-primary/5',
  },
};

function resolveEstimatedDaysLeft(
  estimatedDaysLeft?: number | null,
  currentBalance?: number | null,
  dailyBurnRate?: number | null
): number | null {
  if (estimatedDaysLeft !== null && estimatedDaysLeft !== undefined) {
    return estimatedDaysLeft;
  }

  if (
    currentBalance !== null &&
    currentBalance !== undefined &&
    dailyBurnRate !== null &&
    dailyBurnRate !== undefined &&
    Number.isFinite(currentBalance) &&
    Number.isFinite(dailyBurnRate) &&
    dailyBurnRate > 0
  ) {
    return currentBalance / dailyBurnRate;
  }

  return null;
}

function AdvisorBust({
  state,
  compact = false,
}: {
  state: AdvisorTimelineState;
  compact?: boolean;
}) {
  const styles = STATE_STYLES[state];
  const mood = {
    headTilt:
      state === 'green'
        ? -2
        : state === 'yellow'
          ? 0
          : state === 'red'
            ? 2
            : 0,
    bodyLift:
      state === 'green'
        ? -0.5
        : state === 'red'
          ? 0.5
          : 0,
    leftBrow:
      state === 'green'
        ? 'M18.7 16.8c1-.8 2.1-1.1 3.3-.9'
        : state === 'yellow'
          ? 'M18.6 16.9c1-.3 2.1-.4 3.2-.2'
          : state === 'red'
            ? 'M18.5 17.5c1.2-1 2.4-1.4 3.8-1.3'
            : 'M18.7 17.1c1-.4 2.1-.5 3.2-.4',
    rightBrow:
      state === 'green'
        ? 'M25 15.9c1.2-.2 2.3.1 3.3.9'
        : state === 'yellow'
          ? 'M25.1 16.7c1.1-.2 2.2-.1 3.2.2'
          : state === 'red'
            ? 'M24.9 16.2c1.4-.1 2.6.3 3.8 1.3'
            : 'M25 16.7c1.1-.1 2.2 0 3.2.4',
    mouth:
      state === 'green'
        ? 'M20.2 24.6c1.2 1.4 2.5 2 3.8 2s2.6-.6 3.8-2'
        : state === 'yellow'
          ? 'M20.5 25.4c1.2.5 2.4.8 3.5.8s2.3-.3 3.5-.8'
          : state === 'red'
            ? 'M20.3 26.4c1.1-1.3 2.4-1.9 3.7-1.9s2.6.6 3.7 1.9'
            : 'M20.5 25.8c1 .3 2.2.5 3.5.5s2.5-.2 3.5-.5',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full border backdrop-blur-sm',
        compact ? 'h-9 w-9' : 'h-11 w-11',
        styles.ring
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full blur-md"
        style={{ background: styles.glow }}
      />
      <svg
        viewBox="0 0 48 48"
        className={cn('relative z-10', styles.accent, compact ? 'h-6 w-6' : 'h-8 w-8')}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`rotate(${mood.headTilt} 24 24) translate(0 ${mood.bodyLift})`}
        >
          <path
            d="M15 36.5c1.9-5.8 6-8.7 9-8.7s7.1 2.9 9 8.7"
            className="stroke-current opacity-85"
            strokeWidth="2"
          />
          <path
            d="M18 18.7c0-3.3 2.6-6 6-6s6 2.7 6 6v1.8c0 3.3-2.6 6-6 6s-6-2.7-6-6v-1.8Z"
            className="stroke-current opacity-90"
            strokeWidth="1.8"
          />
          <path
            d={mood.mouth}
            className="stroke-current opacity-70"
            strokeWidth="1.6"
          />
          <path d={mood.leftBrow} className="stroke-current opacity-80" strokeWidth="1.5" />
          <path d={mood.rightBrow} className="stroke-current opacity-80" strokeWidth="1.5" />
          <path d="M20.8 19h0M27.2 19h0" className="stroke-current opacity-85" strokeWidth="2.2" />
          <path
            d="M18.1 22.3c1.7 1.2 3.7 1.8 5.9 1.8s4.2-.6 5.9-1.8"
            className="stroke-current opacity-60"
            strokeWidth="1.3"
          />
        </g>
      </svg>
    </div>
  );
}

function AdvisorWalker({ state }: { state: AdvisorTimelineState }) {
  const styles = STATE_STYLES[state];

  return (
    <div className="relative" aria-hidden="true">
      <span className={cn('relative z-10 text-[28px] leading-none', styles.accent)}>
        {'\u{1F9CD}\u200D\u2642\uFE0F'}
      </span>
    </div>
  );
}

function MapPinMarker() {
  return (
    <div className="relative z-20 flex flex-col items-center" aria-hidden="true">
      <div className="absolute top-[17px] h-2 w-4 rounded-full bg-black/18 blur-[2px]" />
      <svg viewBox="0 0 54 70" className="relative z-10 h-[27px] w-[24px]">
        <path d="M27 67 13 53h28L27 67Z" fill="white" />
        <path
          d="M27 58c0 0-21-16.2-21-33C6 11.2 15.4 2 27 2s21 9.2 21 23c0 16.8-21 33-21 33Z"
          fill="white"
        />
        <circle cx="27" cy="26" r="11.5" fill="var(--color-cyan-primary)" />
      </svg>
    </div>
  );
}

export default function AdvisorTimeline({
  className,
}: AdvisorTimelineProps) {
  const { budget } = useBudget();
  const { expenses } = useExpenses();

  const dailyAverage = useMemo(() => {
    if (expenses.length === 0) return 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.timestamp || e.date);
      return expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear;
    });
    if (monthExpenses.length === 0) return 0;
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dayOfMonth = Math.max(1, now.getDate());
    return Math.round(totalSpent / dayOfMonth);
  }, [expenses]);

  const estimatedDaysLeft = budget?.estimatedDaysLeft;
  const currentBalance = budget?.currentBalance;
  const dailyBurnRate = budget?.dailyBurnRate || dailyAverage || 1;

  const resolvedDaysLeft = useMemo(
    () => resolveEstimatedDaysLeft(estimatedDaysLeft, currentBalance, dailyBurnRate),
    [estimatedDaysLeft, currentBalance, dailyBurnRate]
  );

  const now = useMemo(() => new Date(), []);
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = daysInMonth - currentDay;

  const state = useMemo((): AdvisorTimelineState => {
    if (resolvedDaysLeft === null || resolvedDaysLeft === undefined || Number.isNaN(resolvedDaysLeft)) {
      return 'empty';
    }
    const isBudgetSet = budget?.monthlyIncome && budget.monthlyIncome > 0;
    if (!isBudgetSet) return 'empty';

    if (resolvedDaysLeft >= daysLeftInMonth + 3) return 'green';
    if (resolvedDaysLeft >= daysLeftInMonth) return 'yellow';
    return 'red';
  }, [resolvedDaysLeft, daysLeftInMonth, budget?.monthlyIncome]);

  const positionPercent = useMemo(() => {
    return 4 + ((currentDay - 1) / (Math.max(1, daysInMonth - 1))) * 92;
  }, [currentDay, daysInMonth]);

  const message = useMemo(
    () => pickAdvisorTimelineMessage(state, resolvedDaysLeft),
    [state, resolvedDaysLeft]
  );

  const isEmpty = state === 'empty';

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      aria-live="polite"
      role="status"
      className={cn('relative px-5 py-4', className)}
    >
      <div className="relative mt-5 h-[112px]">
        <motion.div
          className="absolute top-0 z-20 -translate-x-1/2"
          initial={false}
          animate={{ left: `${positionPercent}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 24, mass: 0.8 }}
        >
          <div className="relative flex flex-col items-center">
            <div
              className={cn(
                "pointer-events-none absolute top-[-6px] w-[96px]",
                positionPercent < 35 ? "-right-[114px]" : "-left-[114px]"
              )}
            >
              <div className="relative rounded-[14px] border border-white/8 bg-slate-950/84 px-2.5 py-1.5 text-[9px] font-medium leading-[1.25] text-balance text-center flex items-center justify-center min-h-[34px] tracking-[-0.01em] text-white/70 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                {message}
              </div>
              <div
                className={cn(
                  "absolute top-[14px] h-[4px] w-[4px] rounded-full bg-white/30 shadow-[0_3px_8px_rgba(0,0,0,0.18)]",
                  positionPercent < 35 ? "left-[-9px]" : "right-[-9px]"
                )}
              />
              <div
                className={cn(
                  "absolute top-[12px] h-[3px] w-[3px] rounded-full bg-white/30 shadow-[0_2px_6px_rgba(0,0,0,0.14)]",
                  positionPercent < 35 ? "left-[-18px]" : "right-[-18px]"
                )}
              />
            </div>
            <AdvisorWalker state={state} />
            <div className="mt-[5px]">
              <MapPinMarker />
            </div>
          </div>
        </motion.div>

        <div className="absolute left-0 right-0 top-[54px] z-10 h-4 overflow-hidden rounded-full border border-border-primary/60 bg-text-primary/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-3px_8px_rgba(2,6,23,0.35),0_8px_18px_rgba(0,0,0,0.22)]">
          <div
            className={cn(
              'absolute inset-0 opacity-95',
              state === 'green'
                ? 'bg-[linear-gradient(90deg,var(--color-cyan-primary)_0%,var(--color-teal-primary)_100%)]'
                : state === 'yellow'
                  ? 'bg-[linear-gradient(90deg,var(--color-purple-primary)_0%,var(--color-pink-primary)_100%)]'
                  : state === 'red'
                    ? 'bg-[linear-gradient(90deg,var(--color-pink-primary)_0%,var(--color-red-primary)_100%)]'
                    : 'bg-[linear-gradient(90deg,rgba(56,189,248,0.15)_0%,rgba(56,189,248,0.05)_100%)]'
            )}
          />
          <div className="absolute inset-x-[3px] top-[2px] h-[3px] rounded-full bg-white/20 blur-[0.5px]" />
          <div className="absolute inset-x-[8px] bottom-[2px] h-[3px] rounded-full bg-black/18 blur-[1px]" />

          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--color-cyan-primary)_0%,var(--color-teal-primary)_100%)] shadow-[0_0_18px_rgba(56,189,248,0.42)]"
            initial={false}
            animate={{ width: `${positionPercent}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 26, mass: 0.8 }}
          />
        </div>

        <div className="absolute left-0 top-[82px] text-[11px] font-mono text-text-primary">01</div>
        <div className="absolute right-0 top-[82px] text-[11px] font-mono text-text-primary">
          {daysInMonth}
        </div>
      </div>
    </motion.section>
  );
}
