/**
 * What-If Simulator Prediction Utilities
 * ========================================
 * 
 * TypeScript implementation of prediction logic for the What-If financial simulator.
 * This mirrors the Python script in scripts/predict.py
 */

export interface ExpenseConfig {
    food: number;
    transport: number;
    entertainment: number;
    subscriptions: number;
}

export interface PredictionResult {
    input: {
        current_balance: number;
        expenses: ExpenseConfig;
    };
    prediction: {
        total_monthly_expenses: number;
        daily_expenses: number;
        estimated_days: number;
        base_days: number;
        difference: number;
    };
    interpretation: {
        days_label: string;
        difference_label: string;
    };
}

export interface ScenarioResult {
    balance: number;
    income: number;
    expenses: ExpenseConfig;
    total_expenses: number;
    monthly_savings: number;
    savings_rate: number;
    days_until_depleted: number;
    months_to_3_month_emergency_fund: number | null;
}

/**
 * Default expense configuration
 */
export const DEFAULT_EXPENSES: ExpenseConfig = {
    food: 450,
    transport: 120,
    entertainment: 300,
    subscriptions: 150
};

/**
 * Calculate total monthly expenses
 */
export function calculateTotalExpenses(expenses: ExpenseConfig): number {
    return expenses.food + expenses.transport + expenses.entertainment + expenses.subscriptions;
}

/**
 * Predict the number of days the current balance will last.
 */
export function predictDays(
    currentBalance: number,
    expenses: ExpenseConfig = DEFAULT_EXPENSES
): PredictionResult {
    const { food, transport, entertainment, subscriptions } = expenses;

    // Calculate total monthly expenses
    const totalExpenses = food + transport + entertainment + subscriptions;

    // Calculate daily expenses (divide by 30 days)
    const dailyExpenses = totalExpenses / 30;

    // Calculate days until balance runs out
    let days: number;
    if (dailyExpenses > 0) {
        days = Math.round(currentBalance / dailyExpenses);
    } else {
        days = Infinity;
    }

    // Base scenario (default values)
    const baseTotal = calculateTotalExpenses(DEFAULT_EXPENSES); // 1020
    const baseDaily = baseTotal / 30;
    const baseDays = baseDaily > 0 ? Math.round(currentBalance / baseDaily) : 0;

    // Calculate difference from base
    const diff = days - baseDays;

    // Create interpretation
    const daysLabel = `${days} zile estimate`;
    let differenceLabel: string;
    if (diff > 0) {
        differenceLabel = `+${diff} zile`;
    } else if (diff < 0) {
        differenceLabel = `${diff} zile`;
    } else {
        differenceLabel = 'Fără modificări';
    }

    return {
        input: {
            current_balance: currentBalance,
            expenses: {
                food,
                transport,
                entertainment,
                subscriptions
            }
        },
        prediction: {
            total_monthly_expenses: totalExpenses,
            daily_expenses: Math.round(dailyExpenses * 100) / 100,
            estimated_days: days,
            base_days: baseDays,
            difference: diff
        },
        interpretation: {
            days_label: daysLabel,
            difference_label: differenceLabel
        }
    };
}

/**
 * Get prediction for the base/default expense configuration.
 */
export function getBasePrediction(currentBalance: number): PredictionResult {
    return predictDays(currentBalance, DEFAULT_EXPENSES);
}

/**
 * Comprehensive scenario simulation including savings rate.
 */
export function simulateScenario(
    currentBalance: number,
    monthlyIncome: number,
    expenses: ExpenseConfig
): ScenarioResult {
    const totalExpenses = calculateTotalExpenses(expenses);
    const monthlySavings = monthlyIncome - totalExpenses;

    // Days until balance runs out (no income)
    const daysNoIncome = totalExpenses > 0
        ? Math.round(currentBalance / (totalExpenses / 30))
        : Infinity;

    return {
        balance: currentBalance,
        income: monthlyIncome,
        expenses,
        total_expenses: totalExpenses,
        monthly_savings: monthlySavings,
        savings_rate: monthlyIncome > 0
            ? Math.round((monthlySavings / monthlyIncome) * 100 * 10) / 10
            : 0,
        days_until_depleted: daysNoIncome,
        months_to_3_month_emergency_fund: monthlySavings > 0 && totalExpenses > 0
            ? Math.round((monthlySavings / (totalExpenses * 3)) * 10) / 10
            : null
    };
}

/**
 * Calculate days from balance and total monthly expenses (simple version)
 */
export function calculateDays(currentBalance: number, totalMonthlyExpenses: number): number {
    if (totalMonthlyExpenses <= 0) return Infinity;
    return Math.round(currentBalance / (totalMonthlyExpenses / 30));
}
