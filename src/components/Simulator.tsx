import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useBudget } from '../hooks';
import { cn } from '../utils/cn';
import { predictDays, getBasePrediction, DEFAULT_EXPENSES } from '../utils/prediction';

const Simulator: React.FC = () => {
  const { budget, loading } = useBudget();

  // Get current balance or use default if loading
  const currentBalance = budget?.currentBalance || 2840;
  const monthlyIncome = budget?.monthlyIncome || 5000;

  const [vals, setVals] = useState({
    1: 450,
    2: 120,
    3: 300,
    4: 150
  });

  // Create expense config from slider values
  const expenseConfig = useMemo(() => ({
    food: vals[1],
    transport: vals[2],
    entertainment: vals[3],
    subscriptions: vals[4]
  }), [vals]);

  // Calculate predictions using the prediction utility
  const basePrediction = useMemo(() => getBasePrediction(currentBalance), [currentBalance]);
  const newPrediction = useMemo(() => predictDays(currentBalance, expenseConfig), [currentBalance, expenseConfig]);

  // Get days from prediction
  const baseDays = basePrediction.prediction.estimated_days;
  const newDays = newPrediction.prediction.estimated_days;
  const diff = newPrediction.prediction.difference;

  const updateSim = (idx: number, val: number) => {
    setVals(prev => ({ ...prev, [idx]: val }));
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col flex-1 pb-[88px] items-center justify-center min-h-[400px]"
      >
        <div className="text-text-muted">Se încarcă...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col flex-1 pb-[88px]"
    >
      <div className="px-5 pt-12 pb-4">
        <div className="text-[11px] text-text-muted tracking-[0.1em] uppercase mb-1">Simulator</div>
        <div className="text-[24px] font-extrabold tracking-tight">What-If 🔮</div>
      </div>

      <div className="simulator-card mx-4 mb-3.5 p-[18px] bg-card border border-border-primary rounded-[20px] relative overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[180px] h-[180px] bg-radial-[circle] from-purple-primary/7 to-transparent pointer-events-none" />
        <div className="text-[12px] font-semibold text-text-primary mb-3.5">Ajustează cheltuielile</div>

        {[
          { id: 1, label: 'Mâncare', min: 100, max: 800 },
          { id: 2, label: 'Transport', min: 0, max: 400 },
          { id: 3, label: 'Ieșiri', min: 0, max: 600 },
          { id: 4, label: 'Abonamente', min: 0, max: 300 },
        ].map((slider) => (
          <div key={slider.id} className="flex flex-col gap-2 mb-4.5 last:mb-0">
            <div className="flex justify-between text-[11px] text-text-secondary">
              <span>{slider.label}</span>
              <span className="text-cyan-primary font-mono font-medium">{(vals as any)[slider.id]} lei</span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={10}
              value={(vals as any)[slider.id]}
              onChange={(e) => updateSim(slider.id, parseInt(e.target.value))}
              className="appearance-none w-full h-1 rounded-full bg-cyan-primary/15 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[17px] [&::-webkit-slider-thumb]:h-[17px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_7px_rgba(56,189,248,0.45)]"
            />
          </div>
        ))}
      </div>

      <div className="simulator-card mx-4 mb-3.5 p-[18px] bg-card border border-border-primary rounded-[20px]">
        <div className="text-[12px] font-semibold text-text-primary mb-3">Rezultat simulat</div>
        <div className="bg-cyan-primary/5 border border-border-secondary rounded-2xl p-3.5 text-center">
          <div className={cn(
            "text-[38px] font-extrabold font-mono tracking-[-2px]",
            diff > 0 ? "text-green-primary" : diff < 0 ? "text-red-primary" : "text-cyan-primary"
          )}>
            {newDays}
          </div>
          <div className="text-[11px] text-text-muted uppercase tracking-widest mt-0.5">zile estimate</div>
          <div className="mt-2 text-[12px] text-text-secondary">
            {diff > 0 ? (
              <><span className="text-green-primary">+{diff} zile</span> față de acum</>
            ) : diff < 0 ? (
              <><span className="text-red-primary">{diff} zile</span> față de acum</>
            ) : (
              'Fără modificări față de acum'
            )}
          </div>
        </div>
      </div>

      {/* Debug info - shows prediction details */}
      <div className="mx-4 mb-3.5 p-[18px] bg-card border border-border-primary rounded-[20px]">
        <div className="text-[12px] font-semibold text-text-primary mb-3">Detalii predicție</div>
        <div className="text-[11px] text-text-secondary space-y-1">
          <div className="flex justify-between">
            <span>Total cheltuieli lunare:</span>
            <span className="text-cyan-primary font-mono">{newPrediction.prediction.total_monthly_expenses} lei</span>
          </div>
          <div className="flex justify-between">
            <span>Cheltuieli zilnice:</span>
            <span className="text-cyan-primary font-mono">{newPrediction.prediction.daily_expenses} lei</span>
          </div>
          <div className="flex justify-between">
            <span>Zile bază:</span>
            <span className="text-text-muted font-mono">{baseDays} zile</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Simulator;
