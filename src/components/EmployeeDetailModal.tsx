import React, { useState } from 'react';
import {
  X,
  Search,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { EmployeeStats, AccountRecord } from '../types';
import { STATUS_CONFIG } from '../utils/statusColors';

interface EmployeeDetailModalProps {
  employeeStats: EmployeeStats | null;
  onClose: () => void;
  statusTarget: 'afterUpload' | 'final';
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employeeStats,
  onClose,
  statusTarget,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!employeeStats) return null;

  const records = employeeStats.records;

  const filteredRecords = records.filter((rec) => {
    if (selectedStatus !== 'all') {
      const curStatus =
        statusTarget === 'afterUpload' ? rec.statusAfterUpload : (rec.finalStatus || rec.statusAfterUpload);
      if (curStatus !== selectedStatus) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const matchAcc = rec.accountName.toLowerCase().includes(q);
      const matchFio = rec.fio.toLowerCase().includes(q);
      const matchComment = (rec.comment || '').toLowerCase().includes(q);
      if (!matchAcc && !matchFio && !matchComment) return false;
    }

    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="modal-employee-detail"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {employeeStats.employee.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {employeeStats.employee}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold">
                  {employeeStats.total} документов
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                  Конверсия: {employeeStats.approvalRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Вкладка FB-1 • Детализированный реестр аккаунтов сотрудника
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

        {/* Status mini chips & search bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 mr-1 font-medium">Статус:</span>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2 py-1 rounded-md transition-all font-medium ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Все ({records.length})
            </button>
            {Object.keys(STATUS_CONFIG).map((statusName) => {
              const count = records.filter((r) =>
                statusTarget === 'afterUpload'
                  ? r.statusAfterUpload === statusName
                  : (r.finalStatus || r.statusAfterUpload) === statusName
              ).length;
              if (count === 0) return null;
              const cfg = STATUS_CONFIG[statusName];
              return (
                <button
                  key={statusName}
                  onClick={() => setSelectedStatus(statusName)}
                  className={`px-2 py-1 rounded-md transition-all font-medium border ${
                    selectedStatus === statusName
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                      : `${cfg.bg} ${cfg.darkBg}`
                  }`}
                >
                  {statusName} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по номеру аккаунта, ФИО..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Records Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold sticky top-0">
                <th className="py-2.5 px-4">Название аккаунта (A)</th>
                <th className="py-2.5 px-3">ФИО (B)</th>
                <th className="py-2.5 px-3">Город / Штат (D, F)</th>
                <th className="py-2.5 px-3 text-center">Дата отпр. (G)</th>
                <th className="py-2.5 px-3 text-center">Дата вериф. (H)</th>
                <th className="py-2.5 px-3">Статус после загрузки (I)</th>
                <th className="py-2.5 px-3">Статус итоговый (J)</th>
                <th className="py-2.5 px-3">Комментарий (K)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    Записи не найдены по заданным условиям
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const afterCfg = STATUS_CONFIG[rec.statusAfterUpload] || STATUS_CONFIG['Другое'];
                  const finalCfg = rec.finalStatus ? STATUS_CONFIG[rec.finalStatus] || STATUS_CONFIG['Другое'] : null;

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Account Name with copy */}
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[200px]" title={rec.accountName}>
                            {rec.accountName}
                          </span>
                          <button
                            onClick={() => handleCopy(rec.accountName, rec.id)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Скопировать номер"
                          >
                            {copiedId === rec.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* FIO */}
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {rec.fio}
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {rec.city || rec.state ? `${rec.city || ''}, ${rec.state || ''}` : '—'}
                      </td>

                      {/* Date Sent (G) */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                          {rec.dateSent || '—'}
                        </span>
                      </td>

                      {/* Date Verified (H) */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {rec.dateVerified ? (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-[11px]">
                            {rec.dateVerified}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status after upload (I) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${afterCfg.bg} ${afterCfg.darkBg}`}
                        >
                          {rec.statusAfterUpload}
                        </span>
                      </td>

                      {/* Final Status (J) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {finalCfg ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${finalCfg.bg} ${finalCfg.darkBg}`}
                          >
                            {rec.finalStatus}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Comment (K) */}
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-[150px] truncate" title={rec.comment}>
                        {rec.comment || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Показано {filteredRecords.length} из {records.length} записей</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
