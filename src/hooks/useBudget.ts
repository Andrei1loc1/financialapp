import { useState, useEffect, useCallback } from 'react';
import {
    getBudget,
    updateBudget,
    getBudgetPercentageUsed,
    getBudgetStatus,
    Budget
} from '../actions/budget';
import { subscribeToData } from '../actions/database';
import { getCurrentUserId } from '../actions/user';

/**
 * Hook for managing budget
 */
export function useBudget() {
    const [budget, setBudget] = useState<Budget | null>(null);
    const [percentage, setPercentage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get current user ID
    const uid = getCurrentUserId();

    // Load budget on mount and subscribe to updates
    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }

        loadBudget();

        // Subscribe to real-time budget updates
        const unsubscribe = subscribeToData<Budget>(
            `users/${uid}/budget`,
            (data) => {
                setBudget(data);
                // Update percentage when data changes
                if (data && data.monthlyIncome > 0) {
                    const pct = Math.round(((data.monthlyIncome - data.currentBalance) / data.monthlyIncome) * 100);
                    setPercentage(pct);
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    const loadBudget = async () => {
        try {
            setLoading(true);
            const data = await getBudget();
            setBudget(data);

            if (data) {
                const pct = await getBudgetPercentageUsed();
                setPercentage(pct);
            }
        } catch (err) {
            setError('Failed to load budget');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateBudgetData = useCallback(async (updates: Partial<Budget>) => {
        try {
            setError(null);
            const success = await updateBudget(updates);
            if (success) {
                await loadBudget();
                return true;
            }
            setError('Failed to update budget');
            return false;
        } catch (err) {
            setError('Failed to update budget');
            console.error(err);
            return false;
        }
    }, []);

    const getStatus = useCallback(async () => {
        return getBudgetStatus();
    }, []);

    const refresh = useCallback(() => {
        loadBudget();
    }, []);

    return {
        budget,
        percentage,
        loading,
        error,
        updateBudget: updateBudgetData,
        getStatus,
        refresh
    };
}