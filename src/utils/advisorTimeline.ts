export const ADVISOR_TIMELINE_MAX_DAY = 30;

export type AdvisorTimelineState = 'green' | 'yellow' | 'red' | 'empty';

const EMPTY_MESSAGE = 'Adauga cateva cheltuieli si iti arat ritmul.';

const MESSAGE_POOLS: Record<Exclude<AdvisorTimelineState, 'empty'>, readonly string[]> = {
  green: [
    'Buget acoperit perfect.',
    'Excelent. Rămâi pe plus.',
    'Ești complet în grafic.',
  ],
  yellow: [
    'Atenție. Buget la limită.',
    'La fix. Fără cheltuieli extra.',
    'Aterizare forțată spre zero.',
  ],
  red: [
    'Pericol. Nu prinzi finalul.',
    'Minus cert. Taie urgent.',
    'Zonă de avarie financiară.',
  ],
};

export function deriveAdvisorTimelineState(estimatedDaysLeft?: number | null): AdvisorTimelineState {
  if (estimatedDaysLeft === null || estimatedDaysLeft === undefined || Number.isNaN(estimatedDaysLeft)) {
    return 'empty';
  }

  if (estimatedDaysLeft >= 30) {
    return 'green';
  }

  if (estimatedDaysLeft >= 22) {
    return 'yellow';
  }

  return 'red';
}

export function clampProjectedDay(estimatedDaysLeft?: number | null): number {
  if (estimatedDaysLeft === null || estimatedDaysLeft === undefined || Number.isNaN(estimatedDaysLeft)) {
    return 1;
  }

  if (!Number.isFinite(estimatedDaysLeft)) {
    return ADVISOR_TIMELINE_MAX_DAY;
  }

  return Math.min(ADVISOR_TIMELINE_MAX_DAY, Math.max(1, Math.round(estimatedDaysLeft)));
}

export function projectDayToPositionPercent(projectedDay: number): number {
  const clampedDay = Math.min(ADVISOR_TIMELINE_MAX_DAY, Math.max(1, Math.round(projectedDay)));
  return 4 + ((clampedDay - 1) / (ADVISOR_TIMELINE_MAX_DAY - 1)) * 92;
}

export function pickAdvisorTimelineMessage(
  state: AdvisorTimelineState,
  estimatedDaysLeft?: number | null
): string {
  if (state === 'empty') {
    return EMPTY_MESSAGE;
  }

  const pool = MESSAGE_POOLS[state];
  const seed = Number.isFinite(estimatedDaysLeft ?? NaN)
    ? Math.abs(Math.round((estimatedDaysLeft as number) * 10))
    : 0;

  return pool[seed % pool.length];
}
