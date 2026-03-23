import { getData, setData, pushData, removeData, subscribeToData } from './database';
import { getCurrentUserId } from './user';
import { updateBudgetAfterExpense } from './budget';

/**
 * Expense data structure
 */
export interface Expense {
    id?: string;
    name: string;
    amount: number;
    category: string;
    emoji: string;
    date: string;
    timestamp: string;
    createdAt: string;
}

/**
 * Get all expenses for current user
 */
export async function getExpenses(): Promise<Expense[]> {
    const uid = getCurrentUserId();
    const data = await getData<Record<string, Expense>>(`users/${uid}/expenses`);

    if (!data) return [];

    // Convert object to array with IDs
    return Object.entries(data).map(([id, expense]) => ({
        ...expense,
        id
    }));
}

/**
 * Get expense by ID
 */
export async function getExpense(expenseId: string): Promise<Expense | null> {
    const uid = getCurrentUserId();
    return getData<Expense>(`users/${uid}/expenses/${expenseId}`);
}

/**
 * Add new expense
 */
export async function addExpense(
    name: string,
    amount: number,
    category: string,
    emoji: string
): Promise<string | null> {
    const uid = getCurrentUserId();
    const now = new Date();

    // Format date as "DD MMM" (e.g., "22 mar")
    const dateStr = now.toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'short'
    });

    // Format time as "HH:MM" (e.g., "14:30")
    const timeStr = now.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const expense: Omit<Expense, 'id'> = {
        name,
        amount: Number(amount),
        category,
        emoji,
        date: dateStr,
        timestamp: now.toISOString(),
        createdAt: now.toISOString()
    };

    const expenseId = await pushData(`users/${uid}/expenses`, expense);

    if (expenseId) {
        // Update budget after adding expense
        await updateBudgetAfterExpense(amount);
    }

    return expenseId;
}

/**
 * Update an existing expense
 */
export async function updateExpense(
    expenseId: string,
    updates: Partial<Expense>
): Promise<boolean> {
    const uid = getCurrentUserId();
    return setData(`users/${uid}/expenses/${expenseId}`, updates);
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string): Promise<boolean> {
    const uid = getCurrentUserId();
    return removeData(`users/${uid}/expenses/${expenseId}`);
}

/**
 * Get expenses for a specific date
 */
export async function getExpensesByDate(date: string): Promise<Expense[]> {
    const expenses = await getExpenses();
    return expenses.filter(e => e.date === date);
}

/**
 * Get expenses for current month
 */
export async function getCurrentMonthExpenses(): Promise<Expense[]> {
    const expenses = await getExpenses();
    const now = new Date();
    const currentMonth = now.toLocaleDateString('ro-RO', { month: 'short' });

    return expenses.filter(e => e.date.includes(currentMonth));
}

/**
 * Calculate total expenses for current month
 */
export async function getMonthlyExpensesTotal(): Promise<number> {
    const expenses = await getCurrentMonthExpenses();
    return expenses.reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Subscribe to real-time expense updates
 */
export function subscribeToExpenses(
    callback: (expenses: Expense[]) => void
): () => void {
    const uid = getCurrentUserId();

    return subscribeToData<Record<string, Expense>>(
        `users/${uid}/expenses`,
        (data) => {
            if (!data) {
                callback([]);
                return;
            }

            const expenses = Object.entries(data).map(([id, expense]) => ({
                ...expense,
                id
            }));
            callback(expenses);
        }
    );
}

/**
 * Get expenses grouped by date
 */
export async function getExpensesGroupedByDate(): Promise<Record<string, Expense[]>> {
    const expenses = await getExpenses();

    return expenses.reduce((groups, expense) => {
        const date = expense.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(expense);
        return groups;
    }, {} as Record<string, Expense[]>);
}