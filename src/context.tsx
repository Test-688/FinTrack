import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, Transaction, Category, Budget, ViewType } from './types';
import {
  loadTransactions, saveTransactions,
  loadCategories, saveCategories,
  loadSettings, saveSettings,
  loadBudgets, saveBudgets,
} from './store';

interface AppContextType {
  transactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
  settings: AppSettings;
  updateSettings: (s: AppSettings) => void;
  budgets: Budget[];
  setBudgets: (b: Budget[]) => void;
  currentView: ViewType;
  setCurrentView: (v: ViewType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactionsState] = useState<Transaction[]>(loadTransactions);
  const [categories, setCategoriesState] = useState<Category[]>(loadCategories);
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);
  const [budgets, setBudgetsState] = useState<Budget[]>(loadBudgets);
  const [currentView, setCurrentView] = useState<ViewType>(settings.defaultView as ViewType);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setTransactions = (t: Transaction[]) => {
    setTransactionsState(t);
    saveTransactions(t);
  };

  const setCategories = (c: Category[]) => {
    setCategoriesState(c);
    saveCategories(c);
  };

  const updateSettings = (s: AppSettings) => {
    setSettingsState(s);
    saveSettings(s);
  };

  const setBudgets = (b: Budget[]) => {
    setBudgetsState(b);
    saveBudgets(b);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.setProperty('--accent', settings.theme.accentColor);
  }, [settings.theme]);

  return (
    <AppContext.Provider value={{
      transactions, setTransactions,
      categories, setCategories,
      settings, updateSettings,
      budgets, setBudgets,
      currentView, setCurrentView,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}
