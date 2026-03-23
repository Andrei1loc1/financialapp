import { Category, Expense } from './types';

export const CATEGORIES: Category[] = [
  { name: 'Mâncare', emoji: '🍔' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Ieșiri', emoji: '🎉' },
  { name: 'Shopping', emoji: '🛍' },
  { name: 'Sănătate', emoji: '💊' },
  { name: 'Abonamente', emoji: '📱' },
  { name: 'Utilități', emoji: '💡' },
  { name: 'Altele', emoji: '✦' },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: '1', name: 'Mâncare', amount: 47, category: 'Mâncare', emoji: '🍔', date: '21 mar', time: '13:24' },
  { id: '2', name: 'Uber', amount: 22, category: 'Transport', emoji: '🚗', date: '21 mar', time: '10:05' },
  { id: '3', name: 'Cafea', amount: 18, category: 'Mâncare', emoji: '☕', date: '21 mar', time: '08:30' },
  { id: '4', name: 'Ieșire cu prietenii', amount: 180, category: 'Ieșiri', emoji: '🎉', date: '20 mar', time: '22:10' },
  { id: '5', name: 'Supermarket', amount: 95, category: 'Mâncare', emoji: '🛒', date: '20 mar', time: '17:00' },
];

export const CHART_DATA = [
  { name: 'Lu', value: 88 },
  { name: 'Ma', value: 65 },
  { name: 'Mi', value: 120 },
  { name: 'Jo', value: 45 },
  { name: 'Vi', value: 90 },
  { name: 'Sa', value: 87 },
  { name: 'Du', value: 0 },
];
