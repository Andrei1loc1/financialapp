import React, { useMemo, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useUser, useExpenses, useBudget } from '../hooks';
import { cn } from '../utils/cn';
import { addToBalance } from '../actions/budget';
import { Input, Button, Card } from './ui';
import { Plus, X, Sparkles, TrendingDown, TrendingUp, AlertTriangle, DollarSign, Calendar, PiggyBank, TrendingUpIcon, Shield, Banknote, Clock, LineChart, BarChart3, Bitcoin } from 'lucide-react';
import { generateInvestmentTips, getRiskColor, getRiskLabel, InvestmentTip } from '../utils/investments';

interface DashboardProps {
  onNavigateToHistory: () => void;
}

type InsightType = 'warning' | 'success' | 'tip' | 'info';

interface AIInsight {
  type: InsightType;
  title: string;
  description: string;
  metric?: string;
}

// Generate a single AI-powered insight based on financial data
// Focus on motivation and saving recommendations, NOT days left
function generateAIInsight(params: {
  currentBalance: number;
  monthlyIncome: number;
  dailyBurnRate: number;
  expenses: Array<{ amount: number; category: string; date: string }>;
  lastMonthTotal?: number;
}): AIInsight {
  const { currentBalance, monthlyIncome, dailyBurnRate, expenses, lastMonthTotal } = params;

  const savingsRate = ((monthlyIncome - (dailyBurnRate * 30)) / monthlyIncome) * 100;
  const totalSpent = expenses.reduce((a, b) => a + b.amount, 0);
  const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  const todayTotal = expenses.filter(e => e.date === today).reduce((a, b) => a + b.amount, 0);

  // Calculate category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    const cat = e.category || 'Altele';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // 1. EXCELLENT savings rate - motivate!
  if (savingsRate >= 20) {
    const monthsToEmergency = Math.round((monthlyIncome * 3) / (monthlyIncome - dailyBurnRate * 30));
    return {
      type: 'success',
      title: '🚀 Ești un campion la economii!',
      description: `Cu ${Math.round(savingsRate)}% economii lunar, în doar ${monthsToEmergency} luni vei avea fondul tău de urgență de 3 salarii. Fiecare leu economisit e o pasă spre libertatea financiară!`,
      metric: `${Math.round(savingsRate)}% economii`
    };
  }

  // 2. Spending decreased from last month
  if (lastMonthTotal && totalSpent < lastMonthTotal * 0.9) {
    const saved = lastMonthTotal - totalSpent;
    return {
      type: 'success',
      title: '📉 Progres excelent!',
      description: `Ai cheltuit cu ${Math.round((1 - totalSpent / lastMonthTotal) * 100)}% mai puțin decât luna trecută - adică ${saved.toLocaleString('ro-RO')} lei economisiți! Este diferența dintre supraviețuire și prosperitate.`,
      metric: `-${Math.round((1 - totalSpent / lastMonthTotal) * 100)}%`
    };
  }

  // 3. Low spending today - motivate!
  if (todayTotal === 0) {
    return {
      type: 'success',
      title: '⚡ Zi de aur!',
      description: `Ai trecut prin toată ziua fără să cheltuiești nimic! Fiecare zi fără cheltuieli mici se adaugă la sfârșitul lunii. Ce plan simplu ai putea face mâine?`,
      metric: '0 lei'
    };
  }

  // 4. Top category is high - suggest budget
  if (topCategory && topCategory[1] > 0 && totalExpenses > 0) {
    const topPercent = Math.round((topCategory[1] / totalExpenses) * 100);
    if (topPercent > 40) {
      const suggestedBudget = Math.round(topCategory[1] * 0.8);
      return {
        type: 'tip',
        title: `💰 Setează un buget pentru ${topCategory[0]}`,
        description: `Acum cheltuiești ${topCategory[1].toLocaleString('ro-RO')} lei pe ${topCategory[0]} (${topPercent}%). Un buget de ${suggestedBudget.toLocaleString('ro-RO')} lei te-ar ajuta să economisești ${(topCategory[1] - suggestedBudget).toLocaleString('ro-RO')} lei lunar.`,
        metric: `${topPercent}% din buget`
      };
    }
  }

  // 5. High savings potential
  if (savingsRate < 10 && savingsRate > 0) {
    const potentialSavings = Math.round((monthlyIncome * 0.2) - (monthlyIncome - dailyBurnRate * 30));
    return {
      type: 'tip',
      title: '🎯 Ai potențial de economii!',
      description: `La doar 20% economii ai economisi ${Math.round(monthlyIncome * 0.2).toLocaleString('ro-RO')} lei lunar - adică ${Math.round(monthlyIncome * 0.2 * 12).toLocaleString('ro-RO')} lei pe an! Începe cu mici reduceri: cafea, gustări, abonamente neutilizate.`,
      metric: `${Math.round(savingsRate)}% economii`
    };
  }

  // 6. Large balance - encourage saving/investing
  if (currentBalance > monthlyIncome) {
    const extra = currentBalance - monthlyIncome;
    return {
      type: 'success',
      title: '💎 Ai bani în plus!',
      description: `Felicitări! Ai ${extra.toLocaleString('ro-RO')} lei peste salariul lunar. Această sumă e mai valoroasă când o pui la lucru: 50% într-un depozit, 50% într-un fond de investiții. Anul viitor acești bani vor lucra pentru tine.`,
      metric: `+${extra.toLocaleString('ro-RO')} lei`
    };
  }

  // 7. Spending trend analysis
  if (todayTotal > dailyBurnRate * 1.5) {
    return {
      type: 'warning',
      title: '🛑 Oprește-te o secundă',
      description: `Azi ai cheltuit ${todayTotal} lei - de ${Math.round(todayTotal / dailyBurnRate)}x media ta zilnică. Întreabă-te: "E nevoie sau e dorință?" Piatra de temelie a averii e formată din sute de decizii mici.`,
      metric: `${todayTotal} lei azi`
    };
  }

  // 8. Good day average - encourage
  if (dailyBurnRate <= monthlyIncome / 30) {
    const projectedMonth = dailyBurnRate * 30;
    return {
      type: 'success',
      title: 'Esti sub buget!',
      description: `Cu o medie de ${dailyBurnRate} lei/zi, luna aceasta vei cheltui aproximativ ${projectedMonth.toLocaleString('ro-RO')} lei - cu ${Math.round(monthlyIncome - projectedMonth)} lei sub buget! Fiecare zi e o victorie.`,
      metric: `${dailyBurnRate} lei/zi`
    };
  }

  // Default motivational insight
  return {
    type: 'success',
    title: 'Fiecare leu conteaza!',
    description: `Cheltuielile variaza natural de la o zi la alta. Important e trendul lunar. Continua sa fii atent la cum cheltuiesti si vei vedea diferente in cont!`,
    metric: `${totalSpent.toLocaleString('ro-RO')} lei`
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToHistory }) => {
  const { profile, loading: userLoading } = useUser();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { budget, percentage, loading: budgetLoading } = useBudget();

  // Calculate today's expenses
  const todayExpenses = useMemo(() => {
    const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
    return expenses.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Generate chart data from real last 7 days
  const chartData = useMemo(() => {
    const dayLabels = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'];
    const data: Array<{ name: string; value: number }> = [];

    // Get last 7 days starting from today
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dayName = dayLabels[date.getDay() === 0 ? 6 : date.getDay() - 1];
      const dateStr = date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });

      // Sum expenses for this day
      const dayExpenses = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);

      data.push({ name: dayName, value: dayExpenses });
    }

    return data;
  }, [expenses]);

  // Calculate budget percentage
  const budgetPct = budget ? ((budget.monthlyIncome - budget.currentBalance) / budget.monthlyIncome) : 0;
  const daysPct = budget ? (budget.estimatedDaysLeft / 30) : 1;

  // Get first name from profile
  const firstName = profile?.fullName?.split(' ')[0] || 'User';

  // Calculate daily average this month
  const dailyAverage = useMemo(() => {
    if (expenses.length === 0) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear;
    });

    if (monthExpenses.length === 0) return 0;

    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dayOfMonth = now.getDate();

    return Math.round(totalSpent / dayOfMonth);
  }, [expenses]);

  // Generate single AI insight
  const aiInsight = useMemo(() => {
    if (!budget) return null;

    return generateAIInsight({
      currentBalance: budget.currentBalance,
      monthlyIncome: budget.monthlyIncome,
      dailyBurnRate: budget.dailyBurnRate || dailyAverage,
      expenses: expenses.map(e => ({ amount: e.amount, category: e.category, date: e.date }))
    });
  }, [budget, dailyAverage, expenses]);

  // Generate investment tips
  const investmentTips = useMemo(() => {
    if (!budget) return [];

    return generateInvestmentTips({
      currentBalance: budget.currentBalance,
      monthlyIncome: budget.monthlyIncome,
      dailyBurnRate: budget.dailyBurnRate || dailyAverage,
      expenses: expenses.map(e => ({ amount: e.amount, category: e.category, date: e.date }))
    });
  }, [budget, dailyAverage, expenses]);

  // Get emoji for chart coloring
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  // Add money modal state
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Handle add money
  const handleAddMoney = async () => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) return;

    setIsAdding(true);
    try {
      await addToBalance(amount);
      setShowAddMoneyModal(false);
      setAddAmount('');
    } catch (error) {
      console.error('Failed to add money:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Get insight card styles
  const getInsightStyles = (type: InsightType) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-red-primary/8',
          border: 'border-red-primary/30',
          icon: 'text-red-primary',
          iconBg: 'bg-red-primary/15',
          gradient: 'from-red-primary/20 via-red-primary/5 to-transparent'
        };
      case 'success':
        return {
          bg: 'bg-green-primary/8',
          border: 'border-green-primary/30',
          icon: 'text-green-primary',
          iconBg: 'bg-green-primary/15',
          gradient: 'from-green-primary/20 via-green-primary/5 to-transparent'
        };
      case 'tip':
        return {
          bg: 'bg-amber-primary/8',
          border: 'border-amber-primary/30',
          icon: 'text-amber-primary',
          iconBg: 'bg-amber-primary/15',
          gradient: 'from-amber-primary/20 via-amber-primary/5 to-transparent'
        };
      case 'info':
        return {
          bg: 'bg-cyan-primary/8',
          border: 'border-cyan-primary/30',
          icon: 'text-cyan-primary',
          iconBg: 'bg-cyan-primary/15',
          gradient: 'from-cyan-primary/20 via-cyan-primary/5 to-transparent'
        };
    }
  };

  if (userLoading || budgetLoading || expensesLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col flex-1 pb-[88px] items-center justify-center min-h-[400px]"
      >
        <div className="text-text-muted">Se încarcă...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col flex-1 pb-[88px]"
    >
      {/* HERO CIRCLE */}
      <div className="flex flex-col items-center px-5 pt-9 relative">
        <div className="text-[12px] text-text-muted tracking-[0.12em] uppercase mb-5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-primary shadow-[0_0_6px_var(--color-green-primary)] animate-pulse" />
          <span>Bună ziua, {firstName}</span>
        </div>

        <div className="relative w-[240px] h-[240px] mb-7">
          <svg className="w-[240px] h-[240px] -rotate-90" viewBox="0 0 240 240">
            <defs>
              <linearGradient id="cg1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
              <linearGradient id="cg2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            {/* outer track */}
            <circle className="fill-none stroke-cyan-primary/7 stroke-[12] stroke-linecap-round" cx="120" cy="120" r="105" />
            {/* outer arc: budget used */}
            <motion.circle
              initial={{ strokeDashoffset: 659.7 }}
              animate={{ strokeDashoffset: 659.7 * (1 - Math.min(budgetPct, 1)) }}
              transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="fill-none stroke-[url(#cg1)] stroke-[12] stroke-linecap-round"
              strokeDasharray={659.7}
              cx="120" cy="120"
              r="105"
            />
            {/* inner track */}
            <circle className="fill-none stroke-cyan-primary/7 stroke-[8] stroke-linecap-round" cx="120" cy="120" r="90" />
            {/* inner arc: days left */}
            <motion.circle
              initial={{ strokeDashoffset: 565.5 }}
              animate={{ strokeDashoffset: 565.5 * (1 - Math.min(daysPct, 1)) }}
              transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
              className="fill-none stroke-[url(#cg2)] stroke-[8] stroke-linecap-round"
              strokeDasharray={565.5}
              cx="120" cy="120"
              r="90"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <div className="text-[11px] text-text-muted tracking-[0.1em] uppercase">sold curent</div>
            <div className="flex items-baseline">
              <span className="text-[16px] text-text-muted font-mono font-light">lei </span>
              <span className="text-[38px] font-extrabold font-mono tracking-[-2px] text-text-primary leading-none">
                {budget?.currentBalance?.toLocaleString('ro-RO') || '0'}
              </span>
            </div>
            <div className="text-[13px] text-cyan-primary font-mono mt-1">
              {budget?.estimatedDaysLeft || 0} <span className="text-text-muted text-[11px]">zile estimate</span>
            </div>
            <div className="mt-1.5 flex gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-green-primary/10 border border-green-primary/20 text-green-primary">
                ↑ {percentage}%
              </span>
            </div>
          </div>

          {/* orbit dots */}
          <div className="absolute top-[18px] right-[30px] w-2.5 h-2.5 rounded-full bg-cyan-primary shadow-[0_0_10px_var(--color-cyan-primary)] animate-[orbitGlow_3s_ease-in-out_infinite]" />
          <div className="absolute bottom-[22px] left-[26px] w-[7px] h-[7px] rounded-full bg-purple-primary shadow-[0_0_8px_var(--color-purple-primary)] animate-[orbitGlow_4s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/2 left-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-primary shadow-[0_0_7px_var(--color-teal-primary)] animate-[orbitGlow_5s_ease-in-out_infinite_0.5s]" />
        </div>

        {/* ADD MONEY BUTTON */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={() => setShowAddMoneyModal(true)}
          className="mb-6 w-[85%] py-3 rounded-full border-2 border-cyan-primary/50 text-cyan-primary text-base font-medium bg-cyan-primary/5 hover:bg-cyan-primary/10 active:bg-cyan-primary/15 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus size={18} className="text-cyan-primary" />
          Adaugă bani
        </motion.button>
      </div>

      {/* ADD MONEY MODAL */}
      <AnimatePresence>
        {showAddMoneyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddMoneyModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px]"
            >
              <Card variant="elevated" padding="lg" className="bg-card border-border-primary">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-text-primary">Adaugă bani</h3>
                  <button
                    onClick={() => setShowAddMoneyModal(false)}
                    className="w-8 h-8 rounded-full bg-bg border border-border-primary flex items-center justify-center text-text-muted hover:text-text-primary hover:border-cyan-primary/50 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <Input
                    label="Suma (lei)"
                    type="number"
                    placeholder="0"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Submit Button */}
                <Button
                  fullWidth
                  onClick={handleAddMoney}
                  disabled={!addAmount || Number(addAmount) <= 0 || isAdding}
                  isLoading={isAdding}
                >
                  Adaugă {addAmount ? `${Number(addAmount).toLocaleString('ro-RO')} lei` : ''}
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI INSIGHT CARD */}
      {aiInsight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className={cn(
            "mx-4 mb-4 rounded-2xl p-5 border backdrop-blur-sm relative overflow-hidden",
            getInsightStyles(aiInsight.type).bg,
            getInsightStyles(aiInsight.type).border
          )}
        >
          {/* Gradient background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50",
            getInsightStyles(aiInsight.type).gradient
          )} />

          {/* Content */}
          <div className="relative">
            {/* Header with icon */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  getInsightStyles(aiInsight.type).iconBg
                )}>
                  <Sparkles size={18} className={getInsightStyles(aiInsight.type).icon} />
                </div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">AI Insight</span>
              </div>
              {aiInsight.metric && (
                <div className="text-[11px] font-mono px-2 py-1 rounded-md bg-bg/50 text-text-secondary">
                  {aiInsight.metric}
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[16px] font-bold text-text-primary mb-2">
              {aiInsight.title}
            </h3>

            {/* Description */}
            <p className="text-[12px] text-text-secondary leading-relaxed">
              {aiInsight.description}
            </p>
          </div>
        </motion.div>
      )}

      {/* STATS ROW */}
      <div className="flex gap-3 px-5 mb-4">
        {[
          { label: 'Azi cheltuit', val: todayExpenses.toString(), sub: `față de ${dailyAverage} avg`, color: 'text-amber-primary', border: 'before:bg-linear-to-r before:from-transparent before:via-cyan-primary before:to-transparent' },
          { label: 'Media zilnică', val: budget?.dailyBurnRate?.toString() || '0', sub: 'lei / zi', color: 'text-cyan-primary', border: 'before:bg-linear-to-r before:from-transparent before:via-amber-primary before:to-transparent' },
          { label: 'Buget', val: `${Math.round(budgetPct * 100)}% `, sub: 'cheltuit', color: 'text-purple-primary', border: 'before:bg-linear-to-r before:from-transparent before:via-purple-primary before:to-transparent' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              "flex-1 bg-card border border-border-primary rounded-2xl p-[14px_12px] relative overflow-hidden",
              "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:rounded-t-2xl",
              stat.border
            )}
          >
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">{stat.label}</div>
            <div className={cn("text-[20px] font-bold tracking-tight font-mono", stat.color)}>{stat.val}</div>
            <div className="text-[10px] text-text-secondary mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* CHART */}
      <div className="px-5 pb-2 text-[11px] text-text-muted uppercase tracking-widest flex justify-between items-center">
        <span>Ultimele 7 zile</span>
        <span className="text-cyan-primary cursor-pointer" onClick={onNavigateToHistory}>Tot →</span>
      </div>
      <div className="liquid-card mx-4 mb-3.5 pb-2.5">
        <div className="h-[90px] mt-2.5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Bar dataKey="value" radius={[5, 5, 5, 5]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell - ${index} `}
                    fill={entry.value === maxValue ? 'rgba(248,113,113,0.55)' : entry.value > 0 ? 'rgba(56,189,248,0.75)' : 'rgba(56,189,248,0.28)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-1.5 px-0.5 text-[9px] text-text-muted font-mono">
          {chartData.map(d => <span key={d.name}>{d.name}</span>)}
        </div>
      </div>

      {/* AI FOREX RECOMMENDATION */}
      {investmentTips.length > 0 && (
        <div className="px-5 mb-3">
          <div className="text-[11px] text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <TrendingUpIcon size={12} className="text-purple-primary" />
            <span>Sfat Investitie Luna Aceasta</span>
          </div>
          {investmentTips.map((tip) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="bg-purple-primary/10 border border-purple-primary/30 rounded-2xl p-5"
            >
              <div className="text-[20px] font-bold text-text-primary mb-2">
                {tip.title}
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                {tip.description}
              </p>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[12px] text-text-muted">
                  Profit potential: <span className="text-green-primary font-bold">{tip.monthlyReturn}</span>
                </span>
                <span className="text-[10px] text-text-muted">|</span>
                <span className="text-[12px] text-text-muted">
                  Minimum: <span className="text-cyan-primary font-bold">{tip.minAmount} lei</span>
                </span>
              </div>
              <div className="bg-cyan-primary/15 py-3 px-4 rounded-xl">
                <span className="text-[14px] text-cyan-primary font-semibold">
                  → {tip.action}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
