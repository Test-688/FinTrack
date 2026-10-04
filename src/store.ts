import { AppSettings, Transaction, Category, Budget } from './types';
import { v4 as uuidv4 } from 'uuid';

export const defaultCategories: Category[] = [
  { id: uuidv4(), name: 'Gaji', icon: '💰', color: '#10b981', type: 'income' },
  { id: uuidv4(), name: 'Freelance', icon: '💻', color: '#06b6d4', type: 'income' },
  { id: uuidv4(), name: 'Investasi', icon: '📈', color: '#8b5cf6', type: 'income' },
  { id: uuidv4(), name: 'Lainnya', icon: '💵', color: '#6b7280', type: 'income' },
  { id: uuidv4(), name: 'Makanan', icon: '🍔', color: '#f59e0b', type: 'expense' },
  { id: uuidv4(), name: 'Transportasi', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: uuidv4(), name: 'Belanja', icon: '🛍️', color: '#ec4899', type: 'expense' },
  { id: uuidv4(), name: 'Hiburan', icon: '🎬', color: '#a855f7', type: 'expense' },
  { id: uuidv4(), name: 'Kesehatan', icon: '🏥', color: '#ef4444', type: 'expense' },
  { id: uuidv4(), name: 'Pendidikan', icon: '📚', color: '#14b8a6', type: 'expense' },
  { id: uuidv4(), name: 'Tagihan', icon: '📄', color: '#f97316', type: 'expense' },
  { id: uuidv4(), name: 'Lainnya', icon: '📦', color: '#6b7280', type: 'expense' },
];

export const defaultSettings: AppSettings = {
  currency: 'IDR',
  currencySymbol: 'Rp',
  locale: 'id-ID',
  startOfWeek: 'monday',
  defaultView: 'dashboard',
  budgetAlert: 80,
  theme: {
    mode: 'dark',
    accentColor: '#6366f1',
    cardStyle: 'rounded',
    density: 'comfortable',
    animation: true,
    gradientBg: true,
  },
};

export const accentColors = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
];

export function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem('fintrack_transactions');
    return data ? JSON.parse(data) : generateSampleData();
  } catch {
    return generateSampleData();
  }
}

export function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
}

export function loadCategories(): Category[] {
  try {
    const data = localStorage.getItem('fintrack_categories');
    return data ? JSON.parse(data) : defaultCategories;
  } catch {
    return defaultCategories;
  }
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem('fintrack_categories', JSON.stringify(categories));
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem('fintrack_settings');
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem('fintrack_settings', JSON.stringify(settings));
}

export function loadBudgets(): Budget[] {
  try {
    const data = localStorage.getItem('fintrack_budgets');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBudgets(budgets: Budget[]) {
  localStorage.setItem('fintrack_budgets', JSON.stringify(budgets));
}

function generateSampleData(): Transaction[] {
  const now = new Date();
  const transactions: Transaction[] = [];
  const incomeCategories = defaultCategories.filter(c => c.type === 'income');
  const expenseCategories = defaultCategories.filter(c => c.type === 'expense');

  for (let i = 0; i < 60; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    const isIncome = Math.random() > 0.6;
    const cats = isIncome ? incomeCategories : expenseCategories;
    const cat = cats[Math.floor(Math.random() * cats.length)];
    
    transactions.push({
      id: uuidv4(),
      type: isIncome ? 'income' : 'expense',
      amount: isIncome 
        ? Math.floor(Math.random() * 5000000) + 1000000 
        : Math.floor(Math.random() * 500000) + 50000,
      category: cat.name,
      description: isIncome 
        ? ['Gaji bulanan', 'Proyek freelance', 'Dividen saham', 'Bonus'][Math.floor(Math.random() * 4)]
        : ['Makan siang', 'Bensin', 'Belanja bulanan', 'Nonton film', 'Obat', 'Buku', 'Listrik', 'Internet'][Math.floor(Math.random() * 8)],
      date: date.toISOString().split('T')[0],
      createdAt: date.toISOString(),
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatCurrency(amount: number, settings: AppSettings): string {
  return `${settings.currencySymbol} ${amount.toLocaleString(settings.locale)}`;
}
