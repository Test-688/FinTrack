import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../context';
import { Budget } from '../types';
import { formatCurrency } from '../store';
import { v4 as uuidv4 } from 'uuid';

export default function Budgets() {
  const { budgets, setBudgets, categories, transactions, settings } = useApp();
  const isDark = settings.theme.mode === 'dark';
  const accent = settings.theme.accentColor;
  const cardRadius = settings.theme.cardStyle === 'pill' ? 'rounded-3xl' : settings.theme.cardStyle === 'sharp' ? 'rounded-none' : 'rounded-2xl';
  const padding = settings.theme.density === 'compact' ? 'p-4' : 'p-6';

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ categoryId: '', limit: '', month: new Date().toISOString().substring(0, 7) });

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const budgetData = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    return budgets
      .filter(b => b.month === currentMonth)
      .map(b => {
        const cat = categories.find(c => c.id === b.categoryId);
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category === cat?.name && t.date.startsWith(currentMonth))
          .reduce((s, t) => s + t.amount, 0);
        
        return {
          ...b,
          categoryName: cat?.name || 'Unknown',
          categoryIcon: cat?.icon || '📦',
          categoryColor: cat?.color || '#6b7280',
          spent,
          percentage: b.limit > 0 ? (spent / b.limit) * 100 : 0,
          remaining: b.limit - spent,
          isOver: spent > b.limit,
          isWarning: spent > (b.limit * settings.budgetAlert / 100),
        };
      });
  }, [budgets, categories, transactions, settings.budgetAlert]);

  const totalBudget = budgetData.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgetData.filter(b => b.isOver).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.limit) return;

    const newBudget: Budget = {
      id: uuidv4(),
      categoryId: formData.categoryId,
      limit: parseFloat(formData.limit),
      month: formData.month,
    };
    setBudgets([...budgets, newBudget]);
    setFormData({ categoryId: '', limit: '', month: new Date().toISOString().substring(0, 7) });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Anggaran</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Atur batas pengeluaran per kategori
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium shadow-lg"
          style={{ backgroundColor: accent }}
        >
          <Plus size={18} />
          Tambah Anggaran
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Anggaran</p>
          <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(totalBudget, settings)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Terpakai</p>
          <p className="text-xl font-bold text-amber-500 mt-1">
            {formatCurrency(totalSpent, settings)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Melebihi Anggaran</p>
          <p className={`text-xl font-bold mt-1 ${overBudgetCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {overBudgetCount} kategori
          </p>
        </motion.div>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgetData.length === 0 ? (
          <div className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'} text-center py-12`}>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Belum ada anggaran</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Tambahkan anggaran untuk mengontrol pengeluaran
            </p>
          </div>
        ) : (
          budgetData.map((budget, i) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: budget.categoryColor + '20' }}
                  >
                    {budget.categoryIcon}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {budget.categoryName}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatCurrency(budget.spent, settings)} / {formatCurrency(budget.limit, settings)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {budget.isOver ? (
                    <AlertTriangle size={16} className="text-red-500" />
                  ) : budget.isWarning ? (
                    <AlertTriangle size={16} className="text-amber-500" />
                  ) : (
                    <CheckCircle size={16} className="text-emerald-500" />
                  )}
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="h-full rounded-full transition-colors"
                  style={{
                    backgroundColor: budget.isOver ? '#ef4444' : budget.isWarning ? '#f59e0b' : budget.categoryColor,
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {budget.percentage.toFixed(0)}% terpakai
                </span>
                <span className={`text-xs font-medium ${budget.remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {budget.remaining >= 0 ? `Sisa: ${formatCurrency(budget.remaining, settings)}` : `Over: ${formatCurrency(Math.abs(budget.remaining), settings)}`}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md ${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tambah Anggaran</h2>
                <button onClick={() => setShowForm(false)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2`}
                    required
                  >
                    <option value="">Pilih kategori</option>
                    {expenseCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Batas Anggaran</label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {settings.currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={formData.limit}
                      onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                      placeholder="0"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Bulan</label>
                  <input
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2`}
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-3 text-white rounded-xl text-sm font-semibold shadow-lg"
                  style={{ backgroundColor: accent }}
                >
                  Simpan Anggaran
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
