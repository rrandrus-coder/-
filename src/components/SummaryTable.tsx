import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { EmployeeStats, SummaryTotals } from '../types';
import { STATUS_CONFIG } from '../utils/statusColors';

interface SummaryTableProps {
  employeeStats: EmployeeStats[];
  totals: SummaryTotals;
  statusTarget: 'afterUpload' | 'final';
  onSelectEmployee: (emp: EmployeeStats) => void;
}

type SortKey =
  | 'employee'
  | 'total'
  | 'ready'
  | 'moderation'
  | 'suspended'
  | 'paymentRequested'
  | 'banned'
  | 'other'
  | 'aging'
  | 'inWork'
  | 'approvalRate'
  | 'overdueCount';

export const SummaryTable: React.FC<SummaryTableProps> = ({
  employeeStats,
  totals,
  statusTarget,
  onSelectEmployee,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false); // Default descending for counts
    }
  };

  const sortedStats = [...employeeStats].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (typeof valA === 'string') {
      return sortAsc
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }

    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-1" />
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden mb-6 transition-colors">
      {/* Table Header / Title Bar */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Итоговая таблица эффективности сотрудников
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              {employeeStats.length} сотрудников
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Детализация по 8 статусам • Выбран статус:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {statusTarget === 'afterUpload' ? 'после загрузки (I)' : 'итоговый (J)'}
            </span>
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 italic">
          Нажмите на строку сотрудника для просмотра списка аккаунтов
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table id="summary-employees-table" className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold select-none whitespace-nowrap">
              {/* Employee Tab Name */}
              <th
                onClick={() => handleSort('employee')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[150px]"
              >
                <div className="flex items-center">
                  <span>Сотрудник (Вкладка)</span>
                  {renderSortIcon('employee')}
                </div>
              </th>

              {/* Total Documents */}
              <th
                onClick={() => handleSort('total')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[90px]"
              >
                <div className="flex items-center justify-end">
                  <span>Всего</span>
                  {renderSortIcon('total')}
                </div>
              </th>

              {/* Status: Готов */}
              <th
                onClick={() => handleSort('ready')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[85px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Готов</span>
                  {renderSortIcon('ready')}
                </div>
              </th>

              {/* Status: Модерация */}
              <th
                onClick={() => handleSort('moderation')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[95px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Модерация</span>
                  {renderSortIcon('moderation')}
                </div>
              </th>

              {/* Status: Suspended */}
              <th
                onClick={() => handleSort('suspended')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[95px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>Suspended</span>
                  {renderSortIcon('suspended')}
                </div>
              </th>

              {/* Status: запросил платежку */}
              <th
                onClick={() => handleSort('paymentRequested')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[130px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  <span>Запросил платежку</span>
                  {renderSortIcon('paymentRequested')}
                </div>
              </th>

              {/* Status: Бан документа */}
              <th
                onClick={() => handleSort('banned')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[110px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>Бан документа</span>
                  {renderSortIcon('banned')}
                </div>
              </th>

              {/* Status: Отлежка */}
              <th
                onClick={() => handleSort('aging')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[85px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>Отлежка</span>
                  {renderSortIcon('aging')}
                </div>
              </th>

              {/* Status: в работе */}
              <th
                onClick={() => handleSort('inWork')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[85px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>В работе</span>
                  {renderSortIcon('inWork')}
                </div>
              </th>

              {/* Status: Другое */}
              <th
                onClick={() => handleSort('other')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[75px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>Другое</span>
                  {renderSortIcon('other')}
                </div>
              </th>

              {/* Approval Rate / % Успеха */}
              <th
                onClick={() => handleSort('approvalRate')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[100px]"
              >
                <div className="flex items-center justify-end">
                  <span>Конверсия</span>
                  {renderSortIcon('approvalRate')}
                </div>
              </th>

              {/* Overdue Count */}
              <th
                onClick={() => handleSort('overdueCount')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group min-w-[95px]"
              >
                <div className="flex items-center justify-end">
                  <span>Просрочено</span>
                  {renderSortIcon('overdueCount')}
                </div>
              </th>

              {/* Action column */}
              <th className="py-3 px-3 text-center min-w-[50px]">Инфо</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedStats.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  Нет данных, удовлетворяющих выбранным условиям фильтрации
                </td>
              </tr>
            ) : (
              sortedStats.map((emp, index) => {
                const isTopPerformer = index === 0 && emp.total > 0 && sortKey === 'total';
                return (
                  <tr
                    key={emp.employee}
                    onClick={() => onSelectEmployee(emp)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    {/* Employee Name */}
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                          {emp.employee.slice(0, 2).toUpperCase()}
                        </span>
                        <span>{emp.employee}</span>
                        {emp.total === 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-normal">
                            0 на дату
                          </span>
                        )}
                        {isTopPerformer && (
                          <span
                            title="Лидер по числу обработанных документов"
                            className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          >
                            <Sparkles className="w-2.5 h-2.5 mr-0.5 text-amber-500" /> Топ
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className={`py-3 px-3 text-right font-bold ${emp.total > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {emp.total}
                    </td>

                    {/* Ready */}
                    <td className="py-3 px-3 text-right">
                      {emp.ready > 0 ? (
                        <span className="inline-block font-semibold text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50">
                          {emp.ready}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Moderation */}
                    <td className="py-3 px-3 text-right">
                      {emp.moderation > 0 ? (
                        <span className="inline-block font-semibold text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50">
                          {emp.moderation}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Suspended */}
                    <td className="py-3 px-3 text-right">
                      {emp.suspended > 0 ? (
                        <span className="inline-block font-semibold text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50">
                          {emp.suspended}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Payment Requested */}
                    <td className="py-3 px-3 text-right">
                      {emp.paymentRequested > 0 ? (
                        <span className="inline-block font-semibold text-cyan-700 dark:text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/50">
                          {emp.paymentRequested}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Banned */}
                    <td className="py-3 px-3 text-right">
                      {emp.banned > 0 ? (
                        <span className="inline-block font-semibold text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/50">
                          {emp.banned}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Aging */}
                    <td className="py-3 px-3 text-right">
                      {emp.aging > 0 ? (
                        <span className="inline-block font-semibold text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/50">
                          {emp.aging}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* In Work */}
                    <td className="py-3 px-3 text-right">
                      {emp.inWork > 0 ? (
                        <span className="inline-block font-semibold text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50">
                          {emp.inWork}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Other */}
                    <td className="py-3 px-3 text-right">
                      {emp.other > 0 ? (
                        <span className="inline-block text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {emp.other}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Approval Rate */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {emp.total > 0 ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                emp.approvalRate >= 70
                                  ? 'bg-emerald-500'
                                  : emp.approvalRate >= 40
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, emp.approvalRate)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 min-w-[38px]">
                            {emp.approvalRate.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Overdue */}
                    <td className="py-3 px-3 text-right">
                      {emp.overdueCount > 0 ? (
                        <span className="inline-flex items-center gap-0.5 font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-full text-[11px]">
                          {emp.overdueCount}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">0</span>
                      )}
                    </td>

                    {/* Detail Icon */}
                    <td className="py-3 px-3 text-center">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all inline-block" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Master Total Row (Итого по всем сотрудникам) */}
          {sortedStats.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white">
                <td className="py-3 px-4 uppercase tracking-wider text-xs">
                  ИТОГО ПО ВСЕМ СОТРУДНИКАМ ({totals.activeEmployeesCount} с док. из {employeeStats.length})
                </td>
                <td className="py-3 px-3 text-right text-sm font-extrabold text-slate-950 dark:text-white">
                  {totals.totalDocs}
                </td>
                <td className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                  {totals.ready}
                </td>
                <td className="py-3 px-3 text-right text-amber-700 dark:text-amber-400 font-bold">
                  {totals.moderation}
                </td>
                <td className="py-3 px-3 text-right text-rose-700 dark:text-rose-400 font-bold">
                  {totals.suspended}
                </td>
                <td className="py-3 px-3 text-right text-cyan-700 dark:text-cyan-400 font-bold">
                  {totals.paymentRequested}
                </td>
                <td className="py-3 px-3 text-right text-red-700 dark:text-red-400 font-bold">
                  {totals.banned}
                </td>
                <td className="py-3 px-3 text-right text-orange-700 dark:text-orange-400 font-bold">
                  {totals.aging}
                </td>
                <td className="py-3 px-3 text-right text-blue-700 dark:text-blue-400 font-bold">
                  {totals.inWork}
                </td>
                <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400 font-bold">
                  {totals.other}
                </td>
                <td className="py-3 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                  {totals.overallApprovalRate.toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-right">
                  {totals.totalOverdue > 0 ? (
                    <span className="font-extrabold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                      {totals.totalOverdue}
                    </span>
                  ) : (
                    '0'
                  )}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
