import { getData, setData, updateData } from './database';
import { getCurrentUserId } from './user';

/**
 * Budget data structure
 */
export interface Budget {
    monthlyIncome: number;
    currentBalance: number;
    dailyBurnRate: number;
    budgetStartDate: string;
    estimatedDaysLeft: number;
    lastUpdated: string;
}

/**
 * Get user budget
 */
export async function getBudget(): Promise<Budget | null> {
    const uid = getCurrentUserId();
    if (!uid) {
        console.warn('No user authenticated for getBudget');
        return null;
    }
    return getData<Budget>(`users/${uid}/budget`);
}

/**
 * Update budget
 */
export async function updateBudget(updates: Partial<Budget>): Promise<boolean> {
    const uid = getCurrentUserId();
    if (!uid) {
        console.error('Cannot update budget: no authenticated user');
        return false;
    }
    return updateData(`users/${uid}/budget`, {
        ...updates,
        lastUpdated: new Date().toISOString()
    });
}

/**
 * Update budget after adding an expense
 * Recalculates balance and burn rate
 */
export async function updateBudgetAfterExpense(expenseAmount: number): Promise<boolean> {
    const uid = getCurrentUserId();
    if (!uid) {
        console.error('Cannot update budget: no authenticated user');
        return false;
    }

    const budget = await getBudget();
    if (!budget) return false;

    const newBalance = budget.currentBalance - expenseAmount;

    // Calculate days since budget start
    const startDate = new Date(budget.budgetStartDate);
    const now = new Date();
    const daysPassed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate new daily burn rate
    const monthlyIncome = budget.monthlyIncome;
    const totalSpent = monthlyIncome - newBalance;
    const dailyBurnRate = Math.round(totalSpent / daysPassed);

    // Estimate days left
    const estimatedDaysLeft = dailyBurnRate > 0 ? Math.round(newBalance / dailyBurnRate) : 30;

    return updateData(`users/${uid}/budget`, {
        currentBalance: newBalance,
        dailyBurnRate,
        estimatedDaysLeft: Math.max(0, estimatedDaysLeft),
        lastUpdated: now.toISOString()
    });
}

/**
 * Reset budget for new month
 */
export async function resetBudget(): Promise<boolean> {
    const uid = getCurrentUserId();
    const profile = await getData<{ income: number }>(`users/${uid}/profile`);

    if (!profile) return false;

    const now = new Date().toISOString();

    return setData(`users/${uid}/budget`, {
        monthlyIncome: profile.income,
        currentBalance: profile.income,
        dailyBurnRate: 0,
        budgetStartDate: now,
        estimatedDaysLeft: 30,
        lastUpdated: now
    });
}

/**
 * Add money to balance (e.g., salary, extra income)
 * Recalculates balance and burn rate
 */
export async function addToBalance(amount: number): Promise<boolean> {
    const uid = getCurrentUserId();
    if (!uid) {
        console.error('Cannot add to balance: no authenticated user');
        return false;
    }

    const budget = await getBudget();
    if (!budget) return false;

    const newBalance = budget.currentBalance + amount;
    const monthlyIncome = budget.monthlyIncome + amount;

    // Calculate days since budget start
    const startDate = new Date(budget.budgetStartDate);
    const now = new Date();
    const daysPassed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate new daily burn rate
    const totalSpent = monthlyIncome - newBalance;
    const dailyBurnRate = totalSpent > 0 ? Math.round(totalSpent / daysPassed) : 0;

    // Estimate days left
    const estimatedDaysLeft = dailyBurnRate > 0 ? Math.round(newBalance / dailyBurnRate) : 30;

    return updateData(`users/${uid}/budget`, {
        currentBalance: newBalance,
        monthlyIncome: monthlyIncome,
        dailyBurnRate,
        estimatedDaysLeft: Math.max(0, estimatedDaysLeft),
        lastUpdated: now.toISOString()
    });
}

/**
 * Calculate budget percentage used
 */
export async function getBudgetPercentageUsed(): Promise<number> {
    const budget = await getBudget();
    if (!budget || budget.monthlyIncome === 0) return 0;

    const spent = budget.monthlyIncome - budget.currentBalance;
    return Math.round((spent / budget.monthlyIncome) * 100);
}

/**
 * Get formatted budget status
 */
export async function getBudgetStatus(): Promise<{
    balance: number;
    percentage: number;
    daysLeft: number;
    burnRate: number;
} | null> {
    const budget = await getBudget();
    if (!budget) return null;

    const percentage = await getBudgetPercentageUsed();

    return {
        balance: budget.currentBalance,
        percentage,
        daysLeft: budget.estimatedDaysLeft,
        burnRate: budget.dailyBurnRate
    };
}