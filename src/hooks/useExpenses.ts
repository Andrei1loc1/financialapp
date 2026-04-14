import { useState, useEffect, useCallback } from 'react';
import {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteAllExpenses,
    createRecurringExpenses,
    getExpensesByDate,
    getCurrentMonthExpenses,
    getMonthlyExpensesTotal,
    getExpensesGroupedByDate,
    subscribeToExpenses,
    Expense
} from '../actions/expenses';

/**
 * Hook for managing expenses
 */
export function useExpenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load expenses on mount
    useEffect(() => {
        loadExpenses();
        createRecurringExpenses();

        // Subscribe to real-time updates
        const unsubscribe = subscribeToExpenses((data) => {
            setExpenses(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await getExpenses();
            setExpenses(data);
        } catch (err) {
            setError('Failed to load expenses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createExpense = useCallback(async (
        name: string,
        amount: number,
        category: string,
        emoji: string,
        isRecurrent: boolean = false
    ) => {
        try {
            setError(null);
            const expenseId = await addExpense(name, amount, category, emoji, isRecurrent);
            if (expenseId) {
                await loadExpenses();
                return expenseId;
            }
            setError('Failed to add expense');
            return null;
        } catch (err) {
            setError('Failed to add expense');
            console.error(err);
            return null;
        }
    }, []);

    const editExpense = useCallback(async (expenseId: string, updates: Partial<Expense>) => {
        try {
            setError(null);
            const success = await updateExpense(expenseId, updates);
            if (success) {
                await loadExpenses();
                return true;
            }
            setError('Failed to update expense');
            return false;
        } catch (err) {
            setError('Failed to update expense');
            console.error(err);
            return false;
        }
    }, []);

    const removeExpense = useCallback(async (expenseId: string) => {
        try {
            setError(null);
            const success = await deleteExpense(expenseId);
            if (success) {
                await loadExpenses();
                return true;
            }
            setError('Failed to delete expense');
            return false;
        } catch (err) {
            setError('Failed to delete expense');
            console.error(err);
            return false;
        }
    }, []);

    const getByDate = useCallback(async (date: string) => {
        return getExpensesByDate(date);
    }, []);

    const getMonthTotal = useCallback(async () => {
        return getMonthlyExpensesTotal();
    }, []);

    const getGrouped = useCallback(async () => {
        return getExpensesGroupedByDate();
    }, []);

    const clearAll = useCallback(async () => {
        try {
            setError(null);
            const success = await deleteAllExpenses();
            if (success) {
                await loadExpenses();
                return true;
            }
            setError('Failed to clear expenses');
            return false;
        } catch (err) {
            setError('Failed to clear expenses');
            console.error(err);
            return false;
        }
    }, []);

    return {
        expenses,
        loading,
        error,
        addExpense: createExpense,
        updateExpense: editExpense,
        deleteExpense: removeExpense,
        clearAll,
        getByDate,
        getMonthTotal,
        getGrouped,
        refresh: loadExpenses
    };
}