import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';
import { useExpenses, useBudget } from '../hooks';
import { cn } from '../utils/cn';

const History: React.FC = () => {
  const { expenses, loading } = useExpenses();
  const { budget } = useBudget();

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    const grouped: Record<string, typeof expenses> = {};

    expenses.forEach(expense => {
      if (!grouped[expense.date]) {
        grouped[expense.date] = [];
      }
      grouped[expense.date].push(expense);
    });

    return grouped;
  }, [expenses]);

  // Calculate weekly total
  const weeklyTotal = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Generate chart data from expenses
  const chartData = useMemo(() => {
    const days = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'];
    const data = days.map(day => ({ name: day, value: 0 }));

    expenses.forEach(expense => {
      const dayIndex = days.findIndex(d => expense.date.includes(d));
      if (dayIndex !== -1) {
        data[dayIndex].value += expense.amount;
      }
    });

    return data;
  }, [expenses]);

  // Get sorted dates (most recent first)
  const sortedDates = useMemo(() => {
    return Object.keys(expensesByDate).sort((a, b) => {
      // Sort by date - needs proper parsing for real dates
      return expensesByDate[b].length - expensesByDate[a].length;
    });
  }, [expensesByDate]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col flex-1 pb-[88px] items-center justify-center min-h-[400px]"
      >
        <div className="text-text-muted">Se încarcă...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col flex-1 pb-[88px]"
    >
      <div className="px-5 pt-12 pb-3">
        <div className="text-[11px] text-text-muted tracking-[0.1em] uppercase mb-1">Istoric</div>
        <div className="text-[24px] font-extrabold tracking-tight">Toate cheltuielile</div>
      </div>

      <div className="liquid-card mx-4 mb-3 pb-2.5">
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Total săptămână</div>
        <div className="text-[26px] font-extrabold font-mono text-red-primary tracking-tight">
          -{weeklyTotal.toLocaleString('ro-RO')} lei
        </div>
        <div className="h-[70px] mt-2.5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(248,113,113,0.25)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="rgba(248,113,113,0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgba(248,113,113,0.75)"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-1 px-0.5 text-[9px] text-text-muted font-mono">
          {chartData.map(d => <span key={d.name}>{d.name}</span>)}
        </div>
      </div>

      {/* Expense list grouped by date */}
      {sortedDates.length === 0 ? (
        <div className="px-5 py-8 text-center text-text-muted">
          Nu ai înregistrat încă nicio cheltuială
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date}>
            <div className="px-5 py-2.5 text-[10px] text-text-muted uppercase tracking-widest border-b border-cyan-primary/5">
              {date}
            </div>
            {expensesByDate[date].map((exp) => (
              <div key={exp.id} className="flex items-center gap-3 px-5 py-3 border-b border-cyan-primary/5">
                <div className="w-8.5 h-8.5 rounded-[10px] bg-cyan-primary/10 flex items-center justify-center text-[15px] shrink-0">
                  {exp.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{exp.name}</div>
                  <div className="text-[10px] text-text-muted font-mono mt-0.5">
                    {new Date(exp.timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} · {exp.category}
                  </div>
                </div>
                <div className="text-[14px] font-semibold font-mono text-red-primary">-{exp.amount} lei</div>
              </div>
            ))}
          </div>
        ))
      )}
    </motion.div>
  );
};

export default History;
