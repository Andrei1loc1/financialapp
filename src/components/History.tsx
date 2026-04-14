import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useExpenses, useBudget } from '../hooks';
import { cn } from '../utils/cn';
import { updateExpense } from '../actions/expenses';

const History: React.FC = () => {
  const { expenses, loading, clearAll, refresh } = useExpenses();
  const { budget, reset } = useBudget();
  const [clearing, setClearing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [disabling, setDisabling] = useState(false);

  const handleClear = async () => {
    if (expenses.length === 0) return;
    if (!confirm('Ștergi toate cheltuielile și resetezi bugetul? Această acțiune nu poate fi anulată.')) return;
    
    setClearing(true);
    await Promise.all([clearAll(), reset()]);
    setClearing(false);
  };

  const openRecurrentModal = (exp: any) => {
    if (exp.isRecurrent || exp.category === 'Abonamente') {
      setSelectedExpense(exp);
      setModalOpen(true);
    }
  };

  const disableRecurrent = async () => {
    if (!selectedExpense?.id) return;
    setDisabling(true);
    await updateExpense(selectedExpense.id, { isRecurrent: null, recurrentDay: null });
    await refresh();
    setModalOpen(false);
    setDisabling(false);
    setSelectedExpense(null);
  };

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

  const weeklyTotal = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

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

  const sortedDates = useMemo(() => {
    return Object.keys(expensesByDate).sort((a, b) => {
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
      <div className="px-5 pt-12 pb-3 flex justify-between items-start">
        <div>
          <div className="text-[11px] text-text-muted tracking-[0.1em] uppercase mb-1">Istoric</div>
          <div className="text-[22px] font-extrabold tracking-[-0.02em] whitespace-nowrap">Toate cheltuielile</div>
        </div>
        {expenses.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="text-[10px] text-text-muted hover:text-red-primary flex items-center gap-1 px-3 py-1.5 rounded-full bg-bg2/50 hover:bg-red-primary/10 transition-colors disabled:opacity-50"
          >
            <span>✕</span>
            <span>Clear</span>
          </button>
        )}
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
              <div 
                key={exp.id} 
                className="flex items-center gap-3 px-5 py-3 border-b border-cyan-primary/5 cursor-pointer active:scale-[0.99]"
                onClick={() => openRecurrentModal(exp)}
              >
                <div className="w-8.5 h-8.5 rounded-[10px] bg-cyan-primary/10 flex items-center justify-center text-[15px] shrink-0 relative">
                  {exp.emoji}
                  {(exp.isRecurrent === true || exp.isRecurrent === 'true') && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-primary" />
                  )}
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

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-[260px] relative overflow-hidden bg-card border border-border-primary rounded-[20px] p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-1/2 -right-1/3 w-[180%] h-[180%] pointer-events-none bg-radial-[ellipse_at_60%_40%] from-cyan-primary/5 to-transparent" />
              
              <div className="text-center mb-4 relative">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-primary/10 flex items-center justify-center text-2xl">
                  {selectedExpense?.emoji || '📱'}
                </div>
                <div className="text-[14px] font-bold text-text-primary">{selectedExpense?.name}</div>
                <div className="text-[11px] text-text-muted font-mono mt-1">{selectedExpense?.amount} lei/lună</div>
              </div>
              
<button
                onClick={disableRecurrent}
                disabled={disabling}
                className="w-full py-2 rounded-xl bg-red-primary/5 text-red-primary text-[11px] font-medium active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {disabling ? 'Se dezactivează...' : 'Dezactivează'}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-2 rounded-xl text-text-muted text-[11px] hover:text-text-primary transition-colors mt-1"
              >
                Anulează
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default History;