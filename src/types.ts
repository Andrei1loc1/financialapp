export type Screen = 'dash' | 'add' | 'history' | 'whatif' | 'settings';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  emoji: string;
  date: string;
  time: string;
}

export interface Category {
  name: string;
  emoji: string;
}
