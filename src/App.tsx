import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { KpiMetrics } from './components/KpiMetrics';
import { FilterBar } from './components/FilterBar';
import { SummaryTable } from './components/SummaryTable';
import { ChartsSection } from './components/ChartsSection';
import { OverdueModal } from './components/OverdueModal';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { SheetSelectorModal } from './components/SheetSelectorModal';
import { TabsManagerModal } from './components/TabsManagerModal';

import { AccountRecord, FilterConfig, EmployeeStats } from './types';
import { INITIAL_MOCK_RECORDS, MOCK_TABS } from './data/mockData';
import { filterRecords, aggregateEmployeeStats, checkIsOverdue } from './utils/statsUtils';
import { exportToExcel, exportToCSV } from './utils/exportUtils';
import { initAuth, googleSignIn, googleSignOut, getCachedAccessToken } from './services/firebaseAuth';
import { fetchSpreadsheetTabs, fetchAllTabsData } from './services/googleSheets';

export function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fb1_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fb1_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fb1_theme', 'light');
    }
  }, [isDarkMode]);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (loggedUser) => setUser(loggedUser),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err: any) {
      alert(`Ошибка авторизации Google: ${err.message || err}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleSignOut();
    setUser(null);
  };

  // Data state: records, allTabs (all 37 tabs), sheet title
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>('FB-1');
  const [isUsingLiveSheets, setIsUsingLiveSheets] = useState<boolean>(false);
  const [records, setRecords] = useState<AccountRecord[]>(INITIAL_MOCK_RECORDS);
  const [allTabs, setAllTabs] = useState<string[]>(MOCK_TABS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter configuration (Defaults to 14.09 and Column G as requested in prompt)
  const [filter, setFilter] = useState<FilterConfig>({
    dateTarget: 'dateSent', // Col G: Дата отправки на
    statusTarget: 'afterUpload', // Col I: Статус после загрузки
    startDate: '',
    endDate: '',
    singleDate: '14.09', // Specific prompt example: 14.09
    employeeSearch: '',
    selectedEmployees: [],
    statusFilter: 'all',
    overdueDaysThreshold: 2,
    showAllEmployees: true, // Default to showing all 37 employees
  });

  // Modals state
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeStats | null>(null);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState<boolean>(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);
  const [isTabsModalOpen, setIsTabsModalOpen] = useState<boolean>(false);

  // Live Sheet Loader state
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState<string>('');
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<{ current: number; total: number; tab: string } | null>(null);
  const [sheetErrorMessage, setSheetErrorMessage] = useState<string | null>(null);

  // Filtered records based on selected date, status, employee
  const filteredRecords = useMemo(() => {
    return filterRecords(records, filter);
  }, [records, filter]);

  // Aggregated Statistics covering all 37 tabs
  const { employeeStats, totals } = useMemo(() => {
    return aggregateEmployeeStats(
      filteredRecords,
      filter.statusTarget,
      filter.overdueDaysThreshold,
      allTabs,
      filter.showAllEmployees
    );
  }, [filteredRecords, filter.statusTarget, filter.overdueDaysThreshold, allTabs, filter.showAllEmployees]);

  // Overall overdue records across all current records (for the notification system)
  const allOverdueRecords = useMemo(() => {
    return records
      .map((r) => {
        const info = checkIsOverdue(r, filter.overdueDaysThreshold);
        return { ...r, isOverdue: info.isOverdue, daysOverdue: info.days };
      })
      .filter((r) => r.isOverdue);
  }, [records, filter.overdueDaysThreshold]);

  // Employee list derived from all 37 known tabs
  const employeeNames = useMemo(() => {
    return allTabs.length > 0 ? [...allTabs].sort((a, b) => a.localeCompare(b, 'ru')) : [];
  }, [allTabs]);

  // Filter change helper
  const handleFilterChange = (updated: Partial<FilterConfig>) => {
    setFilter((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilter = () => {
    setFilter({
      dateTarget: 'dateSent',
      statusTarget: 'afterUpload',
      startDate: '',
      endDate: '',
      singleDate: '',
      employeeSearch: '',
      selectedEmployees: [],
      statusFilter: 'all',
      overdueDaysThreshold: 2,
      showAllEmployees: true,
    });
  };

  // Export handlers
  const handleExportExcel = () => {
    exportToExcel(employeeStats, totals, filteredRecords, `FB-1_Статистика_${filter.singleDate || 'все_даты'}`);
  };

  const handleExportCSV = () => {
    exportToCSV(employeeStats, totals, `FB-1_Сводка_${filter.singleDate || 'все_даты'}`);
  };

  // Load live Google Sheets data
  const handleLoadLiveSheets = async (targetId: string) => {
    const token = getCachedAccessToken();
    if (!token) {
      alert('Пожалуйста, сначала выполните вход через Google.');
      return;
    }

    try {
      setIsLoadingLive(true);
      setSheetErrorMessage(null);
      setLoadProgress({ current: 0, total: 1, tab: 'Запрос структуры вкладок...' });

      const meta = await fetchSpreadsheetTabs(targetId, token);
      const tabNames = meta.tabs.map((t) => t.title).filter(Boolean);

      if (tabNames.length === 0) {
        throw new Error('В таблице не найдено ни одной вкладки.');
      }

      setSpreadsheetTitle(meta.title);

      const result = await fetchAllTabsData(
        targetId,
        tabNames,
        token,
        (current, total, tab) => {
          setLoadProgress({ current, total, tab });
        }
      );

      if (result.records.length === 0) {
        throw new Error('Таблица загружена, но строки со статусами или номерами аккаунтов не найдены.');
      }

      setRecords(result.records);
      setAllTabs(result.allTabs);
      setIsUsingLiveSheets(true);
      setIsSheetModalOpen(false);
    } catch (err: any) {
      console.error('Failed to load Google Sheets:', err);
      setSheetErrorMessage(err.message || 'Ошибка подключения к Google Sheets.');
    } finally {
      setIsLoadingLive(false);
      setLoadProgress(null);
    }
  };

  const handleUseDemoData = () => {
    setRecords(INITIAL_MOCK_RECORDS);
    setAllTabs(MOCK_TABS);
    setSpreadsheetTitle('FB-1');
    setIsUsingLiveSheets(false);
  };

  const handleImportCustomRecords = (imported: AccountRecord[], title: string) => {
    setRecords(imported);
    const uniqueTabs = Array.from(new Set(imported.map((r) => r.employee)));
    if (uniqueTabs.length > 0) {
      setAllTabs(uniqueTabs);
    }
    setSpreadsheetTitle(title || 'FB-1');
    setIsUsingLiveSheets(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (isUsingLiveSheets && spreadsheetIdInput) {
      await handleLoadLiveSheets(spreadsheetIdInput);
    } else {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
      return;
    }
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* 1. Header with Controls, Google Sign-In & 37 Tabs Button */}
      <Header
        user={user}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        spreadsheetTitle={spreadsheetTitle}
        isUsingLiveSheets={isUsingLiveSheets}
        onOpenSheetSelector={() => setIsSheetModalOpen(true)}
        onRefreshData={handleRefresh}
        isRefreshing={isRefreshing}
        overdueCount={allOverdueRecords.length}
        onOpenOverdueModal={() => setIsOverdueModalOpen(true)}
        tabsCount={allTabs.length}
        onOpenTabsManager={() => setIsTabsModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner with fast info about current scope & 37 tabs status */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-indigo-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              Выбрана дата:{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {filter.singleDate ? `за ${filter.singleDate}` : filter.startDate ? `с ${filter.startDate} по ${filter.endDate || '...'}` : 'все даты'}
              </strong>{' '}
              ({filter.dateTarget === 'dateSent' ? 'столбец G: Дата отправки на вериф' : filter.dateTarget === 'dateVerified' ? 'столбец H: Дата выхода с верифа' : 'G и H'}).
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setIsTabsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors font-medium text-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Все {allTabs.length} вкладок</span>
            </button>
            <span>•</span>
            <span>Записей в выборке: <strong className="text-slate-900 dark:text-white">{filteredRecords.length}</strong></span>
          </div>
        </div>

        {/* 2. Real-Time KPI Performance Cards */}
        <KpiMetrics
          totals={totals}
          onOpenOverdue={() => setIsOverdueModalOpen(true)}
          statusTarget={filter.statusTarget}
        />

        {/* 3. Comprehensive Filter & Date Controller */}
        <FilterBar
          filter={filter}
          onChange={handleFilterChange}
          onReset={handleResetFilter}
          onExportExcel={handleExportExcel}
          onExportCSV={handleExportCSV}
          employeeNames={employeeNames}
          totalFilteredRecords={filteredRecords.length}
          allTabsCount={allTabs.length}
          onOpenTabsManager={() => setIsTabsModalOpen(true)}
        />

        {/* 4. Interactive Visualizations (Charts Section) */}
        <ChartsSection
          employeeStats={employeeStats}
          totals={totals}
          isDarkMode={isDarkMode}
        />

        {/* 5. Master Summary Table per Employee with 8 Status Details */}
        <SummaryTable
          employeeStats={employeeStats}
          totals={totals}
          statusTarget={filter.statusTarget}
          onSelectEmployee={(emp) => setSelectedEmployee(emp)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400">
        Панель аналитики таблицы FB-1 • Сбор статистики статусов со всех {allTabs.length} вкладок сотрудников по столбцам G, H, I, J
      </footer>

      {/* Overdue Tasks Notification Modal */}
      <OverdueModal
        isOpen={isOverdueModalOpen}
        onClose={() => setIsOverdueModalOpen(false)}
        overdueRecords={allOverdueRecords}
        thresholdDays={filter.overdueDaysThreshold}
      />

      {/* Employee Detail Drilldown Modal */}
      <EmployeeDetailModal
        employeeStats={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        statusTarget={filter.statusTarget}
      />

      {/* 37 Tabs Registry & Audit Modal */}
      <TabsManagerModal
        isOpen={isTabsModalOpen}
        onClose={() => setIsTabsModalOpen(false)}
        allTabs={allTabs}
        records={records}
        filteredRecords={filteredRecords}
        employeeStats={employeeStats}
        selectedDateText={filter.singleDate ? `за ${filter.singleDate}` : 'выбранный период'}
        onSelectEmployeeFilter={(name) => {
          setFilter((prev) => ({
            ...prev,
            selectedEmployees: prev.selectedEmployees.includes(name)
              ? prev.selectedEmployees
              : [...prev.selectedEmployees, name],
          }));
        }}
        onClearEmployeeFilter={() => {
          setFilter((prev) => ({ ...prev, selectedEmployees: [] }));
        }}
        selectedEmployees={filter.selectedEmployees}
      />

      {/* Sheet Configuration / Google Sheets Sync Modal */}
      <SheetSelectorModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        spreadsheetIdInput={spreadsheetIdInput}
        setSpreadsheetIdInput={setSpreadsheetIdInput}
        onLoadLiveSheets={handleLoadLiveSheets}
        onUseDemoData={handleUseDemoData}
        onImportCustomRecords={handleImportCustomRecords}
        isLoading={isLoadingLive}
        loadProgress={loadProgress}
        errorMessage={sheetErrorMessage}
        isUsingLiveSheets={isUsingLiveSheets}
        isLoggedIn={Boolean(user)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default App;
