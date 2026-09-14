import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  User,
  Copy,
  Check,
  Download,
  Filter,
} from 'lucide-react';
import { AccountRecord } from '../types';
import { STATUS_CONFIG } from '../utils/statusColors';

interface OverdueModalProps {
  isOpen: boolean;
  onClose: () => void;
  overdueRecords: AccountRecord[];
  thresholdDays: number;
}

export const OverdueModal: React.FC<OverdueModalProps> = ({
  isOpen,
  onClose,
  overdueRecords,
  thresholdDays,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<string>('all');

  if (!isOpen) return null;

  const employees = Array.from(new Set(overdueRecords.map((r) => r.employee))).sort();

  const filtered = overdueRecords
    .filter((r) => (selectedEmp === 'all' ? true : r.employee === selectedEmp))
    .sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0));

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportOverdue = () => {
    const headers = ['Сотрудник', 'Аккаунт', 'ФИО', 'Дата отправки (G)', 'Статус', 'Просрочено (дней)', 'Комментарий'];
    const rows = filtered.map((r) => [
      `"${r.employee}"`,
      `"${r.accountName}"`,
      `"${r.fio}"`,
      `"${r.dateSent}"`,
      `"${r.statusAfterUpload}"`,
      r.daysOverdue || 0,
      `"${r.comment || ''}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Просроченные_задачи_FB1_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="modal-overdue"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Система уведомлений о просроченных задачах
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-semibold">
                  {overdueRecords.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Задачи без итоговой верификации (H) более {thresholdDays} дней с даты отправки (G)
              </p>
            </div>
          </div>

          <button
            id="btn-close-overdue-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Сотрудник:</span>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Все сотрудники ({overdueRecords.length})</option>
              {employees.map((e) => (
                <option key={e} value={e}>
                  {e} ({overdueRecords.filter((r) => r.employee === e).length})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportOverdue}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Экспорт списка (CSV)</span>
          </button>
        </div>

        {/* Overdue Task List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Все задачи обработаны вовремя!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Нет задач, превышающих лимит ожидания в {thresholdDays} дней.
              </p>
            </div>
          ) : (
            filtered.map((rec) => {
              const statusCfg = STATUS_CONFIG[rec.statusAfterUpload] || STATUS_CONFIG['Другое'];
              return (
                <div
                  key={rec.id}
                  className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {rec.employee}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                        {rec.accountName}
                      </span>
                      <button
                        onClick={() => handleCopy(rec.accountName, rec.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                        title="Скопировать номер аккаунта"
                      >
                        {copiedId === rec.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{rec.fio}</span>
                      {rec.city && <span>• {rec.city}</span>}
                      {rec.comment && (
                        <span className="text-slate-400 italic">({rec.comment})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Отправлен (G):{' '}
                        <strong className="text-slate-800 dark:text-slate-200">{rec.dateSent}</strong>
                      </div>
                      <div className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Просрочка: +{rec.daysOverdue} дн.</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusCfg.bg} ${statusCfg.darkBg}`}
                    >
                      {rec.statusAfterUpload}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Показано {filtered.length} из {overdueRecords.length} просроченных задач
          </span>
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
