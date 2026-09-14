import React from 'react';
import { User } from 'firebase/auth';
import {
  Bell,
  Moon,
  Sun,
  FileSpreadsheet,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  spreadsheetTitle: string;
  isUsingLiveSheets: boolean;
  onOpenSheetSelector: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  overdueCount: number;
  onOpenOverdueModal: () => void;
  tabsCount: number;
  onOpenTabsManager: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoggingIn,
  onLogin,
  onLogout,
  spreadsheetTitle,
  isUsingLiveSheets,
  onOpenSheetSelector,
  onRefreshData,
  isRefreshing,
  overdueCount,
  onOpenOverdueModal,
  tabsCount,
  onOpenTabsManager,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo and Sheet Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            FB
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Статистика {spreadsheetTitle || 'FB-1'}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  isUsingLiveSheets
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                }`}
              >
                {isUsingLiveSheets ? 'Google Sheets Live' : 'FB-1 Демо-база'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Мониторинг статусов документов (G / H) по сотрудникам
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Refresh / Sync Button */}
          <button
            id="btn-refresh-data"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Обновить данные"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Select / Configure Sheet Modal Button */}
          <button
            id="btn-open-sheet-config"
            onClick={onOpenSheetSelector}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Таблица FB-1</span>
            <SlidersHorizontal className="w-3 h-3 text-slate-400 ml-1" />
          </button>

          {/* 37 Tabs Overview Button */}
          <button
            id="btn-open-tabs-manager"
            onClick={onOpenTabsManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
            title="Открыть список всех 37 вкладок сотрудников"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Вкладки: <strong>{tabsCount}</strong></span>
          </button>

          {/* Overdue Tasks Notification Bell */}
          <button
            id="btn-overdue-notifications"
            onClick={onOpenOverdueModal}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={overdueCount > 0 ? `Просроченных задач: ${overdueCount}` : 'Нет просроченных задач'}
          >
            <Bell className={`w-5 h-5 ${overdueCount > 0 ? 'text-amber-500 dark:text-amber-400' : ''}`} />
            {overdueCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {overdueCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Google Authentication Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Пользователь'}
                    className="w-7 h-7 rounded-full ring-1 ring-slate-300 dark:ring-slate-600"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-semibold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden md:inline text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                id="btn-google-signout"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Выйти из Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-google-signin"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.28 21.43 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.32a7.18 7.18 0 0 1 0-4.64V6.58H1.25a12.01 12.01 0 0 0 0 10.84l4.03-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.28 2.57 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>{isLoggingIn ? 'Подключение...' : 'Войти через Google'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
