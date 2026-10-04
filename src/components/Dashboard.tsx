import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context';
import { formatCurrency } from '../store';

export default function Dashboard() {
  const { transactions, settings, categories } = useApp();
  const accent = settings.theme.accentColor;
  const isDark = settings.theme.mode === 'dark';
  const cardRadius = settings.theme.cardStyle === 'pill' ? 'rounded-3xl' : settings.theme.cardStyle === 'sharp' ? 'rounded-none' : 'rounded-2xl';
  const padding = settings.theme.density === 'compact' ? 'p-4' : 'p-6';

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const lastMonth = new Date(thisYear, thisMonth - 1);
    const lastMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    });
    const lastMonthIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastMonthExpense = lastMonthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const incomeChange = lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome * 100) : 0;
    const expenseChange = lastMonthExpense > 0 ? ((totalExpense - lastMonthExpense) / lastMonthExpense * 100) : 0;

    return { totalIncome, totalExpense, balance, incomeChange, expenseChange };
  }, [transactions]);

  const chartData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const data = [];
    
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTransactions = transactions.filter(t => t.date === dateStr);
      
      cumulativeIncome += dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      cumulativeExpense += dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      data.push({
        day: day,
        income: cumulativeIncome,
        expense: cumulativeExpense,
        balance: cumulativeIncome - cumulativeExpense,
      });
    }
    return data;
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const topCategories = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const monthExpenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const categoryMap = new Map<string, number>();
    monthExpenses.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => {
        const cat = categories.find(c => c.name === name);
        return { name, amount, icon: cat?.icon || '📦', color: cat?.color || '#6b7280' };
      });
  }, [transactions, categories]);

  const totalExpenseTop = topCategories.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Ringkasan keuangan bulan ini
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Saldo</p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.balance, settings)}
              </p>
              <p className={`text-xs mt-1 ${stats.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.balance >= 0 ? 'Positif' : 'Defisit'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + '20' }}>
              <Wallet size={24} style={{ color: accent }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pemasukan</p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.totalIncome, settings)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {stats.incomeChange >= 0 ? (
                  <ArrowUpRight size={14} className="text-emerald-500" />
                ) : (
                  <ArrowDownRight size={14} className="text-red-500" />
                )}
                <span className={`text-xs ${stats.incomeChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Math.abs(stats.incomeChange).toFixed(1)}% dari bulan lalu
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/20">
              <TrendingUp size={24} className="text-emerald-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pengeluaran</p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.totalExpense, settings)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {stats.expenseChange <= 0 ? (
                  <ArrowDownRight size={14} className="text-emerald-500" />
                ) : (
                  <ArrowUpRight size={14} className="text-red-500" />
                )}
                <span className={`text-xs ${stats.expenseChange <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Math.abs(stats.expenseChange).toFixed(1)}% dari bulan lalu
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/20">
              <TrendingDown size={24} className="text-red-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`lg:col-span-2 ${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Arus Kas Bulan Ini
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                  labelStyle={{ color: isDark ? '#fff' : '#000' }}
                  formatter={(value: number) => [formatCurrency(value, settings)]}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} name="Pemasukan" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} name="Pengeluaran" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Top Pengeluaran
          </h3>
          <div className="space-y-3">
            {topCategories.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{cat.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {totalExpenseTop > 0 ? ((cat.amount / totalExpenseTop) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalExpenseTop > 0 ? (cat.amount / totalExpenseTop) * 100 : 0}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
            {topCategories.length === 0 && (
              <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Belum ada data
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`${cardRadius} ${padding} ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Transaksi Terbaru
        </h3>
        <div className="space-y-3">
          {recentTransactions.map((t) => {
            const cat = categories.find(c => c.name === t.category);
            return (
              <div
                key={t.id}
                className={`flex items-center justify-between py-2 ${isDark ? 'border-gray-700' : 'border-gray-100'} border-b last:border-0`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
                  >
                    {cat?.icon || '📦'}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t.description}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.category} • {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings)}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
