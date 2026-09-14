import React from 'react';
import { SummaryTotals } from '../types';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  Flame,
  Hourglass,
  Users,
} from 'lucide-react';

interface KpiMetricsProps {
  totals: SummaryTotals;
  onOpenOverdue: () => void;
  statusTarget: 'afterUpload' | 'final';
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  totals,
  onOpenOverdue,
  statusTarget,
}) => {
  const inProgressTotal = totals.moderation + totals.inWork + totals.aging;
  const issuesTotal = totals.suspended + totals.banned + totals.paymentRequested;

  return (
    <div id="kpi-dashboard" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Всего документов */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Всего документов</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {totals.totalDocs.toLocaleString('ru-RU')}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
          <span>Сотрудников в выборке:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {totals.activeEmployeesCount}
          </span>
        </div>
      </div>

      {/* 2. Готов / Конверсия */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
          <span className="text-xs font-medium">Статус «Готов»</span>
          <FileCheck2 className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
            {totals.ready.toLocaleString('ru-RU')}
          </span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            {totals.overallApprovalRate.toFixed(1)}%
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Коэффициент успешности верификации
        </div>
      </div>

      {/* 3. В обработке / Модерация */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
          <span className="text-xs font-medium">В процессе</span>
          <Hourglass className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
          {inProgressTotal.toLocaleString('ru-RU')}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex gap-1.5">
          <span>Мод: {totals.moderation}</span>
          <span>•</span>
          <span>Раб: {totals.inWork}</span>
          <span>•</span>
          <span>Отл: {totals.aging}</span>
        </div>
      </div>

      {/* 4. Проблемные / Бан / Suspended */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
          <span className="text-xs font-medium">Отказы / Блокировки</span>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
          {issuesTotal.toLocaleString('ru-RU')}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex gap-1.5">
          <span>Бан: {totals.banned}</span>
          <span>•</span>
          <span>Susp: {totals.suspended}</span>
        </div>
      </div>

      {/* 5. Просроченные задачи */}
      <div
        onClick={onOpenOverdue}
        className={`bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-xs transition-all cursor-pointer group ${
          totals.totalOverdue > 0
            ? 'border-red-300 dark:border-red-900 hover:border-red-500 dark:hover:border-red-700'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1">
          <span className="text-xs font-medium">Просрочено</span>
          <Flame className={`w-4 h-4 ${totals.totalOverdue > 0 ? 'text-red-600 animate-bounce' : 'text-slate-400'}`} />
        </div>
        <div className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight flex items-center justify-between">
          <span>{totals.totalOverdue}</span>
          {totals.totalOverdue > 0 && (
            <span className="text-[10px] font-semibold text-red-700 dark:text-red-300 group-hover:underline">
              Смотреть &rarr;
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {totals.totalOverdue > 0 ? 'Требуют внимания команды' : 'Все задачи в сроках'}
        </div>
      </div>

      {/* 6. Скорость верификации */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
          <span className="text-xs font-medium">Средний цикл (G&rarr;H)</span>
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {totals.avgVerificationDays}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">дней</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {statusTarget === 'afterUpload' ? 'По дате подгрузки (G)' : 'По итоговому выходу (H)'}
        </div>
      </div>
    </div>
  );
};
