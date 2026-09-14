import React from 'react';
import {
  Calendar,
  Filter,
  Download,
  Search,
  RotateCcw,
  CalendarDays,
  FileSpreadsheet,
  Layers,
  Users,
  CheckSquare,
  Square,
} from 'lucide-react';
import { DateFilterTarget, FilterConfig } from '../types';

interface FilterBarProps {
  filter: FilterConfig;
  onChange: (updated: Partial<FilterConfig>) => void;
  onReset: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  employeeNames: string[];
  totalFilteredRecords: number;
  allTabsCount: number;
  onOpenTabsManager: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChange,
  onReset,
  onExportExcel,
  onExportCSV,
  employeeNames,
  totalFilteredRecords,
  allTabsCount,
  onOpenTabsManager,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs mb-6 space-y-3.5 transition-colors">
      {/* Row 1: Date column selector & Quick date presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Колонка даты:
          </span>

          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              id="filter-target-sent"
              onClick={() => onChange({ dateTarget: 'dateSent' })}
              className={`px-3 py-1 rounded-md transition-all ${
                filter.dateTarget === 'dateSent'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Фильтрация по столбцу G: Дата отправки на верификацию"
            >
              Столбец G (Дата отправки)
            </button>
            <button
              id="filter-target-verified"
              onClick={() => onChange({ dateTarget: 'dateVerified' })}
              className={`px-3 py-1 rounded-md transition-all ${
                filter.dateTarget === 'dateVerified'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Фильтрация по столбцу H: Дата выхода с верифа"
            >
              Столбец H (Дата выхода)
            </button>
            <button
              id="filter-target-both"
              onClick={() => onChange({ dateTarget: 'both' })}
              className={`px-3 py-1 rounded-md transition-all ${
                filter.dateTarget === 'both'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Фильтрация по обоим столбцам (G или H)"
            >
              Оба столбца (G и H)
            </button>
          </div>
        </div>

        {/* Quick Date Buttons (e.g. 14.09 as requested in prompt) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">Быстрый выбор:</span>

          <button
            id="preset-date-1409"
            onClick={() => onChange({ singleDate: '14.09', startDate: '', endDate: '' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              filter.singleDate === '14.09'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
            title="Выбрать 14.09 (пример из запроса: 50+ строк в столбце G)"
          >
            ★ 14.09 (Промпт)
          </button>

          <button
            id="preset-date-0908"
            onClick={() => onChange({ singleDate: '09.08', startDate: '', endDate: '' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              filter.singleDate === '09.08'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            09.08
          </button>

          <button
            id="preset-date-all"
            onClick={() => onChange({ singleDate: '', startDate: '', endDate: '' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              !filter.singleDate && !filter.startDate && !filter.endDate
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Все даты
          </button>
        </div>
      </div>

      {/* Row 2: Inputs for Date Range, Search, Status Target, Overdue threshold, and Exports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Specific Date or Range Pickers */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              Точная дата или начало (ДД.ММ):
            </label>
            <div className="relative">
              <input
                id="input-single-date"
                type="text"
                value={filter.singleDate || filter.startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({ singleDate: val, startDate: val });
                }}
                placeholder="Напр. 14.09 или 2024-09-14"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <CalendarDays className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              Конец диапазона (по):
            </label>
            <div className="relative">
              <input
                id="input-end-date"
                type="text"
                value={filter.endDate}
                onChange={(e) => {
                  onChange({ endDate: e.target.value, singleDate: '' });
                }}
                placeholder="Напр. 18.09"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <CalendarDays className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Status Mode: After Upload (Col I) vs Final Status (Col J) */}
        <div className="lg:col-span-3">
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
            Колонка статуса для анализа:
          </label>
          <div className="inline-flex w-full rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              id="status-target-upload"
              onClick={() => onChange({ statusTarget: 'afterUpload' })}
              className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                filter.statusTarget === 'afterUpload'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Колонка I: Статус после загрузки документов"
            >
              После загрузки (I)
            </button>
            <button
              id="status-target-final"
              onClick={() => onChange({ statusTarget: 'final' })}
              className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                filter.statusTarget === 'final'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Колонка J: Статус итоговый (после верифа)"
            >
              Итоговый статус (J)
            </button>
          </div>
        </div>

        {/* Search by Employee / Account / FIO */}
        <div className="lg:col-span-3">
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
            Поиск сотрудника / аккаунта:
          </label>
          <div className="relative">
            <input
              id="input-search-employee"
              type="text"
              value={filter.employeeSearch}
              onChange={(e) => onChange({ employeeSearch: e.target.value })}
              placeholder="Поиск по имени, аккаунту..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Reset & Count */}
        <div className="lg:col-span-2 flex items-end justify-end gap-2">
          <button
            id="btn-reset-filters"
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Сбросить все фильтры"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс</span>
          </button>

          {/* Export Group */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-export-excel"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
              title="Экспортировать сводную таблицу и детализацию в Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Экспортировать в CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Filter summary status indicator & Employee visibility toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex flex-wrap items-center gap-2">
          <span>Найдено записей:</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {totalFilteredRecords} шт.
          </span>
          {(filter.singleDate || filter.startDate || filter.endDate) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              Период:{' '}
              <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                {filter.singleDate || `${filter.startDate || '—'} по ${filter.endDate || '—'}`}
              </strong>{' '}
              ({filter.dateTarget === 'dateSent' ? 'столбец G' : filter.dateTarget === 'dateVerified' ? 'столбец H' : 'столбцы G+H'})
            </span>
          )}

          {/* Toggle: All 37 employees vs only with documents */}
          <button
            id="toggle-show-all-employees"
            onClick={() => onChange({ showAllEmployees: !filter.showAllEmployees })}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border transition-colors ml-2 ${
              filter.showAllEmployees
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="Показывать всех 37 сотрудников в таблице, даже если за выбранную дату у них 0 записей"
          >
            {filter.showAllEmployees ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Все {allTabsCount} сотрудников (вкл. с 0)</span>
          </button>

          <button
            id="btn-filter-view-tabs"
            onClick={onOpenTabsManager}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Реестр {allTabsCount} вкладок</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px]">Порог просрочки:</span>
          <select
            id="select-overdue-threshold"
            value={filter.overdueDaysThreshold}
            onChange={(e) => onChange({ overdueDaysThreshold: Number(e.target.value) })}
            className="text-xs py-0.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value={1}>&gt; 1 дня</option>
            <option value={2}>&gt; 2 дней (стандарт)</option>
            <option value={3}>&gt; 3 дней</option>
            <option value={5}>&gt; 5 дней</option>
          </select>
        </div>
      </div>
    </div>
  );
};
