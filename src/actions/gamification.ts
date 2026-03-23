import { getData, setData, updateData } from './database';
import { getCurrentUserId } from './user';

/**
 * Weekly streak data structure
 */
export interface WeeklyStreak {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
}

/**
 * Personality data structure
 */
export interface Personality {
    saving: number;
    impulsive: number;
    conscientious: number;
}

/**
 * Gamification data structure
 */
export interface Gamification {
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastExpenseDate: string | null;
    weeklyStreak: WeeklyStreak;
    personality: Personality;
}

/**
 * Default gamification for new users
 */
export const defaultGamification: Gamification = {
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastExpenseDate: null,
    weeklyStreak: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    },
    personality: {
        saving: 50,
        impulsive: 50,
        conscientious: 50
    }
};

/**
 * XP required to reach each level
 */
const XP_PER_LEVEL = 100;

/**
 * Get user gamification data
 */
export async function getGamification(): Promise<Gamification> {
    const uid = getCurrentUserId();
    const gamification = await getData<Gamification>(`users/${uid}/gamification`);
    return gamification || defaultGamification;
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
    return currentLevel * XP_PER_LEVEL;
}

/**
 * Calculate XP progress to next level (0-100)
 */
export function getXpProgress(xp: number): number {
    const currentLevelXP = xp % XP_PER_LEVEL;
    return Math.round((currentLevelXP / XP_PER_LEVEL) * 100);
}

/**
 * Add XP after an expense
 * @param amount - Expense amount
 */
export async function addXpForExpense(amount: number): Promise<boolean> {
    const gamification = await getGamification();

    // XP based on expense amount (1 XP per 10 lei, min 1 XP)
    const xpGained = Math.max(1, Math.floor(amount / 10));
    const newXp = gamification.xp + xpGained;
    const newLevel = calculateLevel(newXp);

    const now = new Date().toISOString();

    return updateData(`users/${getCurrentUserId()}/gamification`, {
        xp: newXp,
        level: newLevel,
        lastExpenseDate: now
    });
}

/**
 * Update streak after an expense
 * Only increments if no expense yesterday
 */
export async function updateStreak(): Promise<boolean> {
    const uid = getCurrentUserId();
    const gamification = await getGamification();
    const now = new Date();

    // Get today's day name
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];

    // Check if already updated today
    if (gamification.lastExpenseDate) {
        const lastDate = new Date(gamification.lastExpenseDate);
        const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        // If last expense was today, don't increment streak
        if (daysDiff === 0) {
            // Just update the weekly streak
            return updateData(`users/${uid}/gamification/weeklyStreak`, {
                [today]: true
            });
        }

        // If last expense was yesterday, increment streak
        if (daysDiff === 1) {
            const newStreak = gamification.currentStreak + 1;
            const newLongest = Math.max(newStreak, gamification.longestStreak);

            return updateData(`users/${uid}/gamification`, {
                currentStreak: newStreak,
                longestStreak: newLongest,
                weeklyStreak: {
                    ...gamification.weeklyStreak,
                    [today]: true
                }
            });
        }
    }

    // First expense or gap in days - reset streak
    return updateData(`users/${uid}/gamification`, {
        currentStreak: 1,
        weeklyStreak: {
            ...gamification.weeklyStreak,
            [today]: true
        }
    });
}

/**
 * Update personality traits based on spending behavior
 * @param category - Expense category
 * @param amount - Expense amount
 */
export async function updatePersonality(category: string, amount: number): Promise<boolean> {
    const gamification = await getGamification();
    const personality = { ...gamification.personality };

    // Adjust personality based on category
    switch (category) {
        case 'Mâncare':
            personality.impulsive = Math.min(100, personality.impulsive + 2);
            break;
        case 'Ieșiri':
            personality.impulsive = Math.min(100, personality.impulsive + 3);
            break;
        case 'Shopping':
            personality.impulsive = Math.min(100, personality.impulsive + 4);
            break;
        case 'Altele':
            personality.conscientious = Math.max(0, personality.conscientious - 1);
            break;
    }

    // Saving increases with lower impulse spending
    personality.saving = Math.max(0, Math.min(100, 100 - personality.impulsive));

    return updateData(`users/${getCurrentUserId()}/gamification`, {
        personality
    });
}

/**
 * Reset streak manually
 */
export async function resetStreak(): Promise<boolean> {
    const uid = getCurrentUserId();
    const gamification = await getGamification();

    return updateData(`users/${uid}/gamification`, {
        currentStreak: 0,
        weeklyStreak: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
        }
    });
}

/**
 * Get formatted gamification data
 */
export async function getGamificationStats(): Promise<{
    xp: number;
    level: number;
    xpProgress: number;
    xpToNext: number;
    streak: number;
    longestStreak: number;
    personality: Personality;
} | null> {
    const gamification = await getGamification();

    return {
        xp: gamification.xp,
        level: gamification.level,
        xpProgress: getXpProgress(gamification.xp),
        xpToNext: xpForNextLevel(gamification.level) - gamification.xp,
        streak: gamification.currentStreak,
        longestStreak: gamification.longestStreak,
        personality: gamification.personality
    };
}