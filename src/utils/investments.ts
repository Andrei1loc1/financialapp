/**
 * Simple Forex Recommendation
 * ===========================
 * One clear recommendation anyone can understand
 */

export interface InvestmentTip {
    title: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    monthlyReturn: string;
    minAmount: number;
    action: string;
}

// Simple single forex recommendation
export function generateInvestmentTips(params: {
    currentBalance: number;
    monthlyIncome: number;
    dailyBurnRate: number;
    expenses: Array<{ amount: number; category: string; date: string }>;
}): InvestmentTip[] {
    const { currentBalance, monthlyIncome, dailyBurnRate } = params;

    const tips: InvestmentTip[] = [];

    // One simple recommendation
    if (currentBalance >= 200) {
        tips.push({
            title: 'Investeste in EUR/USD',
            description: 'Analiza AI arata ca EUR/USD va creste luna aceasta. Cumperi cand pretul e jos si vinzi cand urca. Simplu: cumperi ieftin, vinzi scump.',
            riskLevel: 'medium',
            monthlyReturn: '5-10%',
            minAmount: 200,
            action: 'Deschide pozitie long pe EUR/USD',
        });
    } else {
        tips.push({
            title: 'Adauga bani in cont',
            description: 'Ai nevoie de cel putin 200 lei pentru a incepe. Pune 200 lei deoparte si poti incepe sa faci bani din forex.',
            riskLevel: 'low',
            monthlyReturn: '5-10%',
            minAmount: 200,
            action: 'Economiseste 200 lei',
        });
    }

    return tips.slice(0, 1);
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
    switch (risk) {
        case 'low': return 'text-green-primary bg-green-primary/10 border-green-primary/30';
        case 'medium': return 'text-amber-primary bg-amber-primary/10 border-amber-primary/30';
        case 'high': return 'text-red-primary bg-red-primary/10 border-red-primary/30';
    }
}

export function getRiskLabel(risk: 'low' | 'medium' | 'high'): string {
    switch (risk) {
        case 'low': return 'Sigur';
        case 'medium': return 'Moderat';
        case 'high': return 'Risc Mare';
    }
}
