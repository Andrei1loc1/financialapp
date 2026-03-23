import React from 'react';
import { LayoutGrid, Clock, Plus, BarChart3, Settings } from 'lucide-react';
import { Screen } from '../types';
import { cn } from '../utils/cn';

interface NavigationProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeScreen, onScreenChange }) => {
  const navItems = [
    { id: 'dash', label: 'Acasă', icon: LayoutGrid },
    { id: 'history', label: 'Istoric', icon: Clock },
    { id: 'add', label: 'Adaugă', icon: Plus, isSpecial: true },
    { id: 'whatif', label: 'Simulator', icon: BarChart3 },
    { id: 'settings', label: 'Setări', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-bg/92 backdrop-blur-3xl border-t border-x border-border-primary rounded-t-3xl flex z-[100] pb-[14px] pt-2">
      {navItems.map((item) => (
        <div
          key={item.id}
          onClick={() => onScreenChange(item.id as Screen)}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 cursor-pointer py-1.5 transition-all duration-300 text-[10px] tracking-wider uppercase",
            activeScreen === item.id ? "text-cyan-primary" : "text-text-muted"
          )}
        >
          {item.isSpecial ? (
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-cyan-secondary to-teal-primary flex items-center justify-center shadow-[0_0_18px_rgba(14,165,233,0.38)] -mt-5">
              <Plus className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
          ) : (
            <item.icon className={cn(
              "w-5 h-5 transition-all duration-300",
              activeScreen === item.id && "drop-shadow-[0_0_6px_var(--color-cyan-primary)]"
            )} />
          )}
          {item.label}
        </div>
      ))}
    </nav>
  );
};

export default Navigation;
