import { useState, useEffect, useCallback } from 'react';
import {
    getGamification,
    getGamificationStats,
    addXpForExpense,
    updateStreak,
    updatePersonality,
    resetStreak as resetGamificationStreak,
    Gamification,
    calculateLevel,
    getXpProgress,
    xpForNextLevel
} from '../actions/gamification';
import { subscribeToData } from '../actions/database';

/**
 * Hook for managing gamification
 */
export function useGamification() {
    const [gamification, setGamification] = useState<Gamification | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load gamification on mount and subscribe to updates
    useEffect(() => {
        loadGamification();

        // Subscribe to real-time updates
        const unsubscribe = subscribeToData<Gamification>(
            `users/default_user/gamification`,
            (data) => {
                setGamification(data);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const loadGamification = async () => {
        try {
            setLoading(true);
            const data = await getGamification();
            setGamification(data);
        } catch (err) {
            setError('Failed to load gamification data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addXp = useCallback(async (amount: number) => {
        try {
            setError(null);
            const success = await addXpForExpense(amount);
            if (success) {
                await loadGamification();
                return true;
            }
            return false;
        } catch (err) {
            setError('Failed to add XP');
            console.error(err);
            return false;
        }
    }, []);

    const updateStreakOnExpense = useCallback(async () => {
        try {
            setError(null);
            const success = await updateStreak();
            if (success) {
                await loadGamification();
                return true;
            }
            return false;
        } catch (err) {
            setError('Failed to update streak');
            console.error(err);
            return false;
        }
    }, []);

    const updatePersonalityTraits = useCallback(async (category: string, amount: number) => {
        try {
            setError(null);
            const success = await updatePersonality(category, amount);
            if (success) {
                await loadGamification();
                return true;
            }
            return false;
        } catch (err) {
            setError('Failed to update personality');
            console.error(err);
            return false;
        }
    }, []);

    const resetStreak = useCallback(async () => {
        try {
            setError(null);
            const success = await resetGamificationStreak();
            if (success) {
                await loadGamification();
                return true;
            }
            return false;
        } catch (err) {
            setError('Failed to reset streak');
            console.error(err);
            return false;
        }
    }, []);

    const getStats = useCallback(async () => {
        return getGamificationStats();
    }, []);

    // Computed values
    const level = gamification ? calculateLevel(gamification.xp) : 1;
    const xpProgress = gamification ? getXpProgress(gamification.xp) : 0;
    const xpToNext = gamification ? xpForNextLevel(level) - gamification.xp : 100;

    return {
        gamification,
        loading,
        error,
        level,
        xpProgress,
        xpToNext,
        currentStreak: gamification?.currentStreak || 0,
        longestStreak: gamification?.longestStreak || 0,
        personality: gamification?.personality || { saving: 50, impulsive: 50, conscientious: 50 },
        addXp,
        updateStreak: updateStreakOnExpense,
        updatePersonality: updatePersonalityTraits,
        resetStreak,
        getStats,
        refresh: loadGamification
    };
}