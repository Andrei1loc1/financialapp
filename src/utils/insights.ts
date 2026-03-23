/**
 * Financial Insights Generator
 * ==========================
 * Generates personalized insights based on user's financial data
 */

import { ExpenseConfig } from './prediction';

export interface Insight {
    id: string;
    type: 'warning' | 'success' | 'info' | 'tip';
    icon: string;
    title: string;
    description: string;
    action?: string;
    priority: number;
}

/**
 * Analyze spending patterns and generate insights
 */
export function generateInsights(params: {
    currentBalance: number;
    monthlyIncome: number;
    dailyBurnRate: number;
    estimatedDaysLeft: number;
    expenses: Array<{ amount: number; category: string; date: string }>;
    lastMonthExpenses?: Array<{ amount: number; category: string }>;
}): Insight[] {
    const insights: Insight[] = [];

    const {
        currentBalance,
        monthlyIncome,
        dailyBurnRate,
        estimatedDaysLeft,
        expenses,
        lastMonthExpenses
    } = params;

    // 1. Low balance warning
    if (currentBalance < monthlyIncome * 0.2) {
        insights.push({
            id: 'low_balance',
            type: 'warning',
            icon: '⚠️',
            title: 'Sold redus',
            description: `Ai doar ${currentBalance.toLocaleString('ro-RO')} lei (${Math.round((currentBalance / monthlyIncome) * 100)}% din venit). Este recomandat să ai cel puțin 50%.`,
            priority: 1
        });
    }

    // 2. High daily burn rate
    if (dailyBurnRate > monthlyIncome / 30 * 1.2) {
        insights.push({
            id: 'high_burn',
            type: 'warning',
            icon: '🔥',
            title: 'Cheltuieli ridicate',
            description: `Arăți ${dailyBurnRate} lei/zi, care depășește media recomandată de ${Math.round(monthlyIncome / 30)} lei/zi.`,
            priority: 2
        });
    }

    // 3. Days running out warning
    if (estimatedDaysLeft < 10 && estimatedDaysLeft > 0) {
        insights.push({
            id: 'days_low',
            type: 'warning',
            icon: '⏰',
            title: 'Timp limită',
            description: `Cu ${currentBalance.toLocaleString('ro-RO')} lei mai ai doar ${estimatedDaysLeft} zile. Ia în considerare reducerea cheltuielilor.`,
            priority: 1
        });
    }

    // 4. Great savings rate
    const savingsRate = ((monthlyIncome - (dailyBurnRate * 30)) / monthlyIncome) * 100;
    if (savingsRate >= 20) {
        insights.push({
            id: 'great_savings',
            type: 'success',
            icon: '🎉',
            title: 'Excelent!',
            description: `Economisești ${Math.round(savingsRate)}% din venit! Este peste media recomandată de 20%.`,
            priority: 10
        });
    }

    // 5. No expenses today - positive
    const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
    const todayExpenses = expenses.filter(e => e.date === today);
    if (todayExpenses.length === 0 && currentBalance > 0) {
        insights.push({
            id: 'no_spending_today',
            type: 'success',
            icon: '✨',
            title: 'Zi fără cheltuieli',
            description: 'Excelent! Azi nu ai cheltuit nimic. Continuă așa!',
            priority: 8
        });
    }

    // 6. Analyze category spending
    if (expenses.length > 0) {
        const categoryTotals: Record<string, number> = {};
        expenses.forEach(e => {
            const cat = e.category || 'other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
        });

        const maxCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        if (maxCategory) {
            const categoryPercent = Math.round((maxCategory[1] / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100);

            if (categoryPercent > 40) {
                insights.push({
                    id: 'category_focus',
                    type: 'info',
                    icon: '📊',
                    title: `Focus pe ${maxCategory[0]}`,
                    description: `${Math.round(categoryPercent)}% din cheltuieli sunt în categoria "${maxCategory[0]}". Vrei să setezi un buget pentru aceasta?`,
                    priority: 5
                });
            }
        }
    }

    // 7. Weekend spending spike
    const weekendExpenses = expenses.filter(e => {
        const day = e.date.includes('Să') || e.date.includes('Du');
        return day;
    });
    if (weekendExpenses.length > 0) {
        const weekdayTotal = expenses.filter(e => !e.date.includes('Să') && !e.date.includes('Du')).reduce((a, b) => a + b.amount, 0);
        const weekendTotal = weekendExpenses.reduce((a, b) => a + b.amount, 0);
        if (weekendTotal > weekdayTotal * 1.5) {
            insights.push({
                id: 'weekend_spending',
                type: 'tip',
                icon: '🎯',
                title: 'Spending weekend',
                description: 'Observ că cheltuiești mai mult în weekend. Ai putea aloca un buget separat pentru weekend.',
                priority: 6
            });
        }
    }

    // 8. Growth in savings (compare to last month if available)
    if (lastMonthExpenses) {
        const lastMonthTotal = lastMonthExpenses.reduce((a, b) => a + b.amount, 0);
        const thisMonthTotal = expenses.reduce((a, b) => a + b.amount, 0);
        const changePercent = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

        if (changePercent < -10) {
            insights.push({
                id: 'spending_down',
                type: 'success',
                icon: '📉',
                title: 'Cheltuieli în scădere',
                description: `Ai cheltuit cu ${Math.abs(Math.round(changePercent))}% mai puțin decât luna trecută. Felicitări!`,
                priority: 9
            });
        } else if (changePercent > 20) {
            insights.push({
                id: 'spending_up',
                type: 'warning',
                icon: '📈',
                title: 'Cheltuieli în creștere',
                description: `Ai cheltuit cu ${Math.round(changePercent)}% mai mult decât luna trecută. Verifică dacă sunt cheltuieli necesare.`,
                priority: 3
            });
        }
    }

    // 9. Positive balance
    if (currentBalance > monthlyIncome) {
        insights.push({
            id: 'positive_balance',
            type: 'success',
            icon: '💰',
            title: 'Sold pozitiv',
            description: `Ai mai mult decât salariul tău lunar! Ești într-o poziție financiară excelentă.`,
            priority: 7
        });
    }

    // 10. Emergency fund check
    const emergencyFundTarget = monthlyIncome * 3;
    if (currentBalance >= emergencyFundTarget) {
        insights.push({
            id: 'emergency_fund_ready',
            type: 'success',
            icon: '🛡️',
            title: 'Fond de urgență',
            description: `Ai destui bani pentru ${Math.round(currentBalance / (monthlyIncome / 30))} zile - suficient pentru un fond de urgență!`,
            priority: 8
        });
    }

    // Sort by priority (lower number = higher priority)
    return insights.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/**
 * Get insight color class based on type
 */
export function getInsightColor(type: Insight['type']): string {
    switch (type) {
        case 'warning':
            return 'border-l-red-primary bg-red-primary/5';
        case 'success':
            return 'border-l-green-primary bg-green-primary/5';
        case 'info':
            return 'border-l-cyan-primary bg-cyan-primary/5';
        case 'tip':
            return 'border-l-amber-primary bg-amber-primary/5';
        default:
            return 'border-l-purple-primary bg-purple-primary/5';
    }
}

/**
 * Get icon color based on type
 */
export function getInsightIconColor(type: Insight['type']): string {
    switch (type) {
        case 'warning':
            return 'text-red-primary bg-red-primary/10';
        case 'success':
            return 'text-green-primary bg-green-primary/10';
        case 'info':
            return 'text-cyan-primary bg-cyan-primary/10';
        case 'tip':
            return 'text-amber-primary bg-amber-primary/10';
        default:
            return 'text-purple-primary bg-purple-primary/10';
    }
}
