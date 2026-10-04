export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  month: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  accentColor: string;
  cardStyle: 'rounded' | 'sharp' | 'pill';
  density: 'comfortable' | 'compact';
  animation: boolean;
  gradientBg: boolean;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  locale: string;
  startOfWeek: 'monday' | 'sunday';
  defaultView: string;
  budgetAlert: number;
  theme: ThemeConfig;
}

export type ViewType = 'dashboard' | 'transactions' | 'reports' | 'budgets' | 'settings';
