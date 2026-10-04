import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Trash2, Edit2, X, Calendar } from 'lucide-react';
import { useApp } from '../context';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../store';
import { v4 as uuidv4 } from 'uuid';

export default function Transactions() {
  const { transactions, setTransactions, categories, settings } = useApp();
  const isDark = settings.theme.mode === 'dark';
  const accent = settings.theme.accentColor;
  const cardRadius = settings.theme.cardStyle === 'pill' ? 'rounded-3xl' : settings.theme.cardStyle === 'sharp' ? 'rounded-none' : 'rounded-2xl';
  const padding = settings.theme.density === 'compact' ? 'p-4' : 'p-6';

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterMonth !== 'all' && !t.date.startsWith(filterMonth)) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filterType, filterCategory, filterMonth, search]);

  const availableCategories = useMemo(() => {
    if (formData.type === 'income') return categories.filter(c => c.type === 'income' || c.type === 'both');
    return categories.filter(c => c.type === 'expense' || c.type === 'both');
  }, [categories, formData.type]);

  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.substring(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    if (editId) {
      const updated = transactions.map(t =>
        t.id === editId ? { ...t, ...formData, amount: parseFloat(formData.amount) } : t
      );
      setTransactions(updated);
      setEditId(null);
    } else {
      const newTransaction: Transaction = {
        id: uuidv4(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        createdAt: new Date().toISOString(),
      };
      setTransactions([newTransaction, ...transactions]);
    }

    setFormData({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  const handleEdit = (t: Transaction) => {
    setFormData({
      type: t.type,
      amount: t.amount.toString(),
      category: t.category,
      description: t.description,
      date: t.date,
    });
    setEditId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const selectClass = `w-full px-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-offset-0`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaksi</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Kelola semua transaksi keuangan Anda
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowForm(true); setEditId(null); }}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium shadow-lg"
          style={{ backgroundColor: accent }}
        >
          <Plus size={18} />
          Tambah Transaksi
        </motion.button>
      </div>

      {/* Filters */}
      <div className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2`}
              style={{ '--tw-ring-color': accent } as React.CSSProperties}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | TransactionType)}
            className={selectClass}
            style={{ maxWidth: '160px' }}
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={selectClass}
            style={{ maxWidth: '160px' }}
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={selectClass}
            style={{ maxWidth: '160px' }}
          >
            <option value="all">Semua Bulan</option>
            {months.map(m => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className={`${cardRadius} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTransactions.map((t, i) => {
              const cat = categories.find(c => c.name === t.category);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center justify-between px-6 py-4 ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
                    >
                      {cat?.icon || '📦'}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.description || t.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.category}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(t)}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      >
                        <Edit2 size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className={`p-1.5 rounded-lg hover:bg-red-500/10 transition-colors`}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
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
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editId ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </h2>
                <button onClick={() => setShowForm(false)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Toggle */}
                <div className={`flex rounded-xl p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white shadow' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Pemasukan
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Jumlah</label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {settings.currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2`}
                      style={{ '--tw-ring-color': accent } as React.CSSProperties}
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={selectClass}
                    required
                  >
                    <option value="">Pilih kategori</option>
                    {availableCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Deskripsi</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi transaksi..."
                    className={`w-full px-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2`}
                    style={{ '--tw-ring-color': accent } as React.CSSProperties}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2`}
                    style={{ '--tw-ring-color': accent } as React.CSSProperties}
                    required
                  />
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-3 text-white rounded-xl text-sm font-semibold shadow-lg"
                  style={{ backgroundColor: accent }}
                >
                  {editId ? 'Simpan Perubahan' : 'Tambah Transaksi'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
