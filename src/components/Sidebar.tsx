import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, PieChart, Target, Settings, X, Wallet } from 'lucide-react';
import { useApp } from '../context';
import { ViewType } from '../types';

const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'transactions', label: 'Transaksi', icon: <ArrowLeftRight size={20} /> },
  { id: 'reports', label: 'Laporan', icon: <PieChart size={20} /> },
  { id: 'budgets', label: 'Anggaran', icon: <Target size={20} /> },
  { id: 'settings', label: 'Pengaturan', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, settings } = useApp();
  const accent = settings.theme.accentColor;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 h-full
          ${settings.theme.mode === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'}
          border-r flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: accent }}
            >
              <Wallet size={22} className="text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${settings.theme.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                FinTrack
              </h1>
              <p className={`text-xs ${settings.theme.mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Keuangan Pribadi
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} className={settings.theme.mode === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-white shadow-lg'
                    : settings.theme.mode === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                style={isActive ? { backgroundColor: accent } : {}}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 m-3 rounded-xl ${settings.theme.mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-xs ${settings.theme.mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            💡 Tip: Kustomisasi tampilan di Pengaturan
          </p>
        </div>
      </motion.aside>
    </>
  );
}
