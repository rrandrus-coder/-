import React, { useState } from 'react';
import {
  X,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Filter,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { AccountRecord, EmployeeStats } from '../types';

interface TabsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTabs: string[];
  records: AccountRecord[];
  filteredRecords: AccountRecord[];
  employeeStats: EmployeeStats[];
  selectedDateText: string;
  onSelectEmployeeFilter: (employeeName: string) => void;
  onClearEmployeeFilter: () => void;
  selectedEmployees: string[];
}

export const TabsManagerModal: React.FC<TabsManagerModalProps> = ({
  isOpen,
  onClose,
  allTabs,
  records,
  filteredRecords,
  employeeStats,
  selectedDateText,
  onSelectEmployeeFilter,
  onClearEmployeeFilter,
  selectedEmployees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Build metrics per tab
  const tabDetails = allTabs.map((tabName, index) => {
    const totalCount = records.filter((r) => r.employee === tabName).length;
    const filteredCount = filteredRecords.filter((r) => r.employee === tabName).length;
    const stat = employeeStats.find((s) => s.employee === tabName);
    const readyCount = stat?.ready || 0;
    const isSelected = selectedEmployees.includes(tabName);

    return {
      index: index + 1,
      name: tabName,
      totalCount,
      filteredCount,
      readyCount,
      isSelected,
      hasDataInScope: filteredCount > 0,
    };
  });

  const filteredTabs = tabDetails.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const activeInScopeCount = tabDetails.filter((t) => t.filteredCount > 0).length;
  const zeroInScopeCount = tabDetails.filter((t) => t.filteredCount === 0).length;

  return (
    <div
      id="modal-tabs-manager"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Реестр именных вкладок FB-1
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  {allTabs.length} вкладок
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Полный перечень сотрудников и аудит собранных данных по каждой вкладке
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="px-6 py-3 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Всего вкладок: <strong>{allTabs.length}</strong></span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              С записями ({selectedDateText}): <strong className="text-slate-900 dark:text-white">{activeInScopeCount}</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Без записей за дату: <strong className="text-slate-900 dark:text-white">{zeroInScopeCount}</strong>
            </div>
          </div>

          {selectedEmployees.length > 0 && (
            <button
              onClick={onClearEmployeeFilter}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline"
            >
              Сбросить фильтр по сотрудникам ({selectedEmployees.length})
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по имени вкладки (напр. Руслан, Евгения, Денис)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Scrollable List of 37 Tabs */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredTabs.map((tab) => {
              return (
                <div
                  key={tab.name}
                  className={`p-3 rounded-xl border text-xs transition-all flex flex-col justify-between gap-2 ${
                    tab.isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                        {tab.index}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {tab.name}
                      </span>
                    </div>

                    {tab.filteredCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                        {tab.filteredCount} шт.
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shrink-0">
                        0 на дату
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Всего в таблице: {tab.totalCount}</span>
                    <button
                      onClick={() => {
                        onSelectEmployeeFilter(tab.name);
                        onClose();
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Filter className="w-3 h-3" />
                      <span>Выбрать</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTabs.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Вкладка с таким названием не найдена среди {allTabs.length} вкладок.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Подтянуто <strong>{allTabs.length} из 37</strong> вкладок сотрудников FB-1
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-xs"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
