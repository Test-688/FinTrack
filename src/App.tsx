import React from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { AppProvider, useApp } from './context';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Budgets from './components/Budgets';
import SettingsPage from './components/Settings';

function AppContent() {
  const { currentView, settings, sidebarOpen, setSidebarOpen } = useApp();
  const isDark = settings.theme.mode === 'dark';
  const hasGradient = settings.theme.gradientBg;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'reports': return <Reports />;
      case 'budgets': return <Budgets />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Background gradient */}
      {hasGradient && (
        <div
          className="fixed inset-0 pointer-events-none opacity-30"
          style={{
            background: isDark
              ? `radial-gradient(ellipse at top left, ${settings.theme.accentColor}15 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${settings.theme.accentColor}10 0%, transparent 50%)`
              : `radial-gradient(ellipse at top left, ${settings.theme.accentColor}10 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${settings.theme.accentColor}08 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className={`lg:hidden flex items-center gap-3 px-4 py-3 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <Menu size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
          </button>
          <h1 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>FinTrack</h1>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto"
          >
            {renderView()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
