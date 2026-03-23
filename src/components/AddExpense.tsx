import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';
import { cn } from '../utils/cn';
import { useExpenses } from '../hooks';

interface AddExpenseProps {
  onAdd?: (amount: number, category: string) => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ onAdd }) => {
  const [amount, setAmount] = useState('0');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addExpense } = useExpenses();

  const numPress = (v: string) => {
    if (v === '.' && amount.includes('.')) return;
    setAmount(prev => (prev === '0' && v !== '.' ? v : prev + v));
  };

  const numDel = () => {
    setAmount(prev => prev.slice(0, -1) || '0');
  };

  const handleAdd = useCallback(async () => {
    const val = parseFloat(amount);
    if (val <= 0 || !selectedCat) return;

    // Get emoji for the selected category
    const category = CATEGORIES.find(c => c.name === selectedCat);
    const emoji = category?.emoji || '✦';
    const expenseName = selectedCat || 'Cheltuială';

    setIsLoading(true);

    try {
      // Add expense to Firebase: (name, amount, category, emoji)
      const expenseId = await addExpense(expenseName, val, selectedCat, emoji);

      if (expenseId) {
        // Call the optional onAdd prop for backward compatibility
        onAdd?.(val, selectedCat);

        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setAmount('0');
          setSelectedCat(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
    } finally {
      setIsLoading(false);
    }
  }, [amount, selectedCat, addExpense, onAdd]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1 pb-[88px]"
    >
      <div className="px-5 pt-12 pb-5">
        <div className="text-[24px] font-extrabold tracking-tight bg-linear-to-br from-cyan-primary to-teal-primary bg-clip-text text-transparent mb-1">
          Adaugă cheltuială
        </div>
        <div className="text-[12px] text-text-muted">Înregistrează rapid o cheltuială</div>
      </div>

      <div className="mx-5 mb-5 bg-card border border-border-primary rounded-[20px] p-[22px] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-[ellipse_at_50%_0%] from-cyan-primary/7 to-transparent pointer-events-none" />
        <div className="text-[44px] font-extrabold font-mono tracking-[-2px] text-cyan-primary relative">
          <span className="text-[18px] text-text-muted font-mono">lei </span>
          {amount}
          <span className="inline-block w-0.5 h-9 bg-cyan-primary align-middle ml-0.5 animate-pulse" />
        </div>
        <div className="text-[11px] text-text-muted mt-2 font-mono">
          {selectedCat ? `Categorie: ${selectedCat}` : 'Selectează o categorie'}
        </div>
      </div>

      <div className="px-5 pb-2 text-[11px] text-text-muted uppercase tracking-widest"><span>Categorie</span></div>
      <div className="grid grid-cols-4 gap-2 mx-5 mb-4.5">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.name}
            onClick={() => setSelectedCat(cat.name)}
            className={cn("cat-item", selectedCat === cat.name && "sel")}
          >
            <span className="text-[18px]">{cat.emoji}</span>
            {cat.name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mx-5 mb-4.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
          <div key={num} onClick={() => numPress(num)} className="num-btn">{num}</div>
        ))}
        <div onClick={numDel} className="num-btn text-red-primary">⌫</div>
      </div>

      <button
        onClick={handleAdd}
        disabled={isSuccess || isLoading || !selectedCat || parseFloat(amount) <= 0}
        className={cn(
          "mx-5 bg-linear-to-br from-cyan-secondary to-teal-primary border-none rounded-2xl p-[17px] w-[calc(100%-40px)] text-[15px] font-bold text-white cursor-pointer transition-all duration-220 shadow-[0_4px_22px_rgba(14,165,233,0.28)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(14,165,233,0.38)]",
          isSuccess && "bg-linear-to-br from-green-primary to-green-600",
          (isLoading || !selectedCat || parseFloat(amount) <= 0) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? 'Se salvează...' : isSuccess ? '✓ Adăugat!' : 'Adaugă cheltuiala →'}
      </button>
    </motion.div>
  );
};

export default AddExpense;
