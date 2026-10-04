import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Globe, Bell, Trash2, Download, Upload, Plus, X } from 'lucide-react';
import { useApp } from '../context';
import { Category } from '../types';
import { accentColors, formatCurrency } from '../store';
import { v4 as uuidv4 } from 'uuid';

const cardIcons = ['🍔', '🚗', '🛍️', '🎬', '🏥', '📚', '📄', '📦', '💡', '🎮', '✈️', '🏠', '👕', '🎁', '🐱', '💪'];
const cardColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#14b8a6'];

export default function SettingsPage() {
  const { settings, updateSettings, categories, setCategories, transactions, setTransactions, budgets, setBudgets } = useApp();
  const isDark = settings.theme.mode === 'dark';
  const accent = settings.theme.accentColor;
  const cardRadius = settings.theme.cardStyle === 'pill' ? 'rounded-3xl' : settings.theme.cardStyle === 'sharp' ? 'rounded-none' : 'rounded-2xl';
  const padding = settings.theme.density === 'compact' ? 'p-4' : 'p-6';

  const [activeTab, setActiveTab] = useState<'appearance' | 'general' | 'categories' | 'data'>('appearance');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📦', color: '#6b7280', type: 'expense' as 'income' | 'expense' | 'both' });

  const tabs = [
    { id: 'appearance' as const, label: 'Tampilan', icon: <Palette size={18} /> },
    { id: 'general' as const, label: 'Umum', icon: <Globe size={18} /> },
    { id: 'categories' as const, label: 'Kategori', icon: <Bell size={18} /> },
    { id: 'data' as const, label: 'Data', icon: <Download size={18} /> },
  ];

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    const cat: Category = {
      id: uuidv4(),
      name: newCategory.name,
      icon: newCategory.icon,
      color: newCategory.color,
      type: newCategory.type,
    };
    setCategories([...categories, cat]);
    setNewCategory({ name: '', icon: '📦', color: '#6b7280', type: 'expense' });
    setShowCategoryForm(false);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleExport = () => {
    const data = {
      transactions,
      categories,
      budgets,
      settings,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.transactions) setTransactions(data.transactions);
        if (data.categories) setCategories(data.categories);
        if (data.budgets) setBudgets(data.budgets);
        if (data.settings) updateSettings({ ...settings, ...data.settings });
        alert('Data berhasil diimpor!');
      } catch {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      setTransactions([]);
      setBudgets([]);
      setCategories([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pengaturan</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Kustomisasi aplikasi sesuai preferensi Anda
        </p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'} overflow-x-auto`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'text-white shadow' : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
            style={activeTab === tab.id ? { backgroundColor: accent } : {}}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-4">
          {/* Theme Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Mode Tampilan</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, mode: 'light' } })}
                className={`p-4 rounded-xl border-2 transition-all ${settings.theme.mode === 'light' ? 'border-current' : isDark ? 'border-gray-700' : 'border-gray-200'}`}
                style={settings.theme.mode === 'light' ? { borderColor: accent } : {}}
              >
                <div className="w-full h-16 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 mb-2 flex items-center justify-center">
                  <span className="text-2xl">☀️</span>
                </div>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Terang</p>
              </button>
              <button
                onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, mode: 'dark' } })}
                className={`p-4 rounded-xl border-2 transition-all ${settings.theme.mode === 'dark' ? 'border-current' : isDark ? 'border-gray-700' : 'border-gray-200'}`}
                style={settings.theme.mode === 'dark' ? { borderColor: accent } : {}}
              >
                <div className="w-full h-16 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 mb-2 flex items-center justify-center">
                  <span className="text-2xl">🌙</span>
                </div>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Gelap</p>
              </button>
            </div>
          </motion.div>

          {/* Accent Color */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Warna Aksen</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {accentColors.map(color => (
                <button
                  key={color.value}
                  onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, accentColor: color.value } })}
                  className={`aspect-square rounded-xl transition-all ${settings.theme.accentColor === color.value ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  style={{
                    backgroundColor: color.value,
                    outlineColor: settings.theme.accentColor === color.value ? color.value : undefined,
                  } as React.CSSProperties}
                  title={color.name}
                />
              ))}
            </div>
          </motion.div>

          {/* Card Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Gaya Kartu</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['rounded', 'sharp', 'pill'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, cardStyle: style } })}
                  className={`p-3 border-2 transition-all ${settings.theme.cardStyle === style ? '' : isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  style={settings.theme.cardStyle === style ? { borderColor: accent } : {}}
                >
                  <div className={`w-full h-10 mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${style === 'rounded' ? 'rounded-xl' : style === 'sharp' ? 'rounded-none' : 'rounded-3xl'}`} />
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {style === 'rounded' ? 'Membulat' : style === 'sharp' ? 'Tajam' : 'Pil'}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Density & Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Opsi Lainnya</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Kepadatan</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Atur jarak antar elemen</p>
                </div>
                <div className={`flex rounded-lg p-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <button
                    onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, density: 'comfortable' } })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${settings.theme.density === 'comfortable' ? 'text-white shadow' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    style={settings.theme.density === 'comfortable' ? { backgroundColor: accent } : {}}
                  >
                    Nyaman
                  </button>
                  <button
                    onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, density: 'compact' } })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${settings.theme.density === 'compact' ? 'text-white shadow' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    style={settings.theme.density === 'compact' ? { backgroundColor: accent } : {}}
                  >
                    Padat
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Animasi</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Efek transisi dan gerakan</p>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, animation: !settings.theme.animation } })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.theme.animation ? '' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                  style={settings.theme.animation ? { backgroundColor: accent } : {}}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.theme.animation ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Latar Gradien</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Background gradien halus</p>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, theme: { ...settings.theme, gradientBg: !settings.theme.gradientBg } })}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.theme.gradientBg ? '' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                  style={settings.theme.gradientBg ? { backgroundColor: accent } : {}}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.theme.gradientBg ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Mata Uang</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { symbol: 'Rp', name: 'Rupiah', locale: 'id-ID' },
                { symbol: '$', name: 'Dollar', locale: 'en-US' },
                { symbol: '€', name: 'Euro', locale: 'de-DE' },
                { symbol: '¥', name: 'Yen', locale: 'ja-JP' },
              ].map(curr => (
                <button
                  key={curr.symbol}
                  onClick={() => updateSettings({ ...settings, currencySymbol: curr.symbol, locale: curr.locale })}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${settings.currencySymbol === curr.symbol ? '' : isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  style={settings.currencySymbol === curr.symbol ? { borderColor: accent } : {}}
                >
                  <p className="text-xl">{curr.symbol}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{curr.name}</p>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Peringatan Anggaran</h3>
            <div>
              <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Peringatkan saat pengeluaran mencapai {settings.budgetAlert}% dari anggaran
              </p>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={settings.budgetAlert}
                onChange={(e) => updateSettings({ ...settings, budgetAlert: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${accent} ${settings.budgetAlert}%, ${isDark ? '#374151' : '#e5e7eb'} ${settings.budgetAlert}%)` }}
              />
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>50%</span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{settings.budgetAlert}%</span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>100%</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tampilan Default</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'dashboard', label: '📊 Dashboard' },
                { id: 'transactions', label: '💳 Transaksi' },
                { id: 'reports', label: '📈 Laporan' },
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => updateSettings({ ...settings, defaultView: view.id })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${settings.defaultView === view.id ? '' : isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}
                  style={settings.defaultView === view.id ? { borderColor: accent, color: accent } : {}}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kategori Kustom</h3>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-xs font-medium"
                style={{ backgroundColor: accent }}
              >
                <Plus size={14} />
                Tambah
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: cat.color + '20' }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.name}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {cat.type === 'income' ? 'Pemasukan' : cat.type === 'expense' ? 'Pengeluaran' : 'Keduanya'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Add Category Form */}
          {showCategoryForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kategori Baru</h3>
                <button onClick={() => setShowCategoryForm(false)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nama kategori"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2`}
                />

                <div>
                  <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pilih Ikon</label>
                  <div className="flex flex-wrap gap-2">
                    {cardIcons.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewCategory({ ...newCategory, icon })}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${newCategory.icon === icon ? 'ring-2 scale-110' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                        style={newCategory.icon === icon ? { backgroundColor: accent + '20' } as React.CSSProperties : {}}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pilih Warna</label>
                  <div className="flex flex-wrap gap-2">
                    {cardColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`w-8 h-8 rounded-full transition-all ${newCategory.color === color ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tipe</label>
                  <div className={`flex rounded-xl p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {(['income', 'expense', 'both'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewCategory({ ...newCategory, type })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${newCategory.type === type ? 'text-white shadow' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        style={newCategory.type === type ? { backgroundColor: accent } : {}}
                      >
                        {type === 'income' ? 'Pemasukan' : type === 'expense' ? 'Pengeluaran' : 'Keduanya'}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleAddCategory}
                  className="w-full py-2.5 text-white rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: accent }}
                >
                  Tambah Kategori
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ekspor & Impor Data</h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className={`w-full flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
              >
                <Download size={20} style={{ color: accent }} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Ekspor Data</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Download semua data dalam format JSON</p>
                </div>
              </button>

              <label className={`w-full flex items-center gap-3 p-4 rounded-xl cursor-pointer ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                <Upload size={20} style={{ color: accent }} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Impor Data</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Muat data dari file JSON</p>
                </div>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Statistik Data</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{transactions.length}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transaksi</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{categories.length}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Kategori</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{budgets.length}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Anggaran</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${cardRadius} ${padding} border-2 border-red-500/20 ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}
          >
            <h3 className="text-sm font-semibold mb-2 text-red-500">Zona Berbahaya</h3>
            <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tindakan ini akan menghapus semua data secara permanen.
            </p>
            <button
              onClick={handleResetData}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              Hapus Semua Data
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
