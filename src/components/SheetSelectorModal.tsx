import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CloudDownload,
  Database,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AccountRecord } from '../types';
import { normalizeStatus } from '../utils/statsUtils';

interface SheetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetIdInput: string;
  setSpreadsheetIdInput: (val: string) => void;
  onLoadLiveSheets: (id: string) => Promise<void>;
  onUseDemoData: () => void;
  onImportCustomRecords: (records: AccountRecord[], title: string) => void;
  isLoading: boolean;
  loadProgress: { current: number; total: number; tab: string } | null;
  errorMessage: string | null;
  isUsingLiveSheets: boolean;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export const SheetSelectorModal: React.FC<SheetSelectorModalProps> = ({
  isOpen,
  onClose,
  spreadsheetIdInput,
  setSpreadsheetIdInput,
  onLoadLiveSheets,
  onUseDemoData,
  onImportCustomRecords,
  isLoading,
  loadProgress,
  errorMessage,
  isUsingLiveSheets,
  isLoggedIn,
  onLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'demo' | 'upload'>('google');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const allRecords: AccountRecord[] = [];

        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (data.length <= 1) return;

          for (let r = 1; r < data.length; r++) {
            const row = data[r];
            if (!row || row.length === 0) continue;
            const accountName = String(row[0] || '').trim();
            const fio = String(row[1] || '').trim();
            const dateSent = String(row[6] || '').trim(); // Col G
            const dateVerified = String(row[7] || '').trim(); // Col H
            const statusAfter = String(row[8] || '').trim(); // Col I
            const statusFinal = String(row[9] || '').trim(); // Col J
            const comment = String(row[10] || '').trim(); // Col K

            if (!accountName && !fio && !dateSent) continue;

            allRecords.push({
              id: `${sheetName}-${r}-${Math.random().toString(36).slice(5)}`,
              employee: sheetName,
              accountName: accountName || `ACC-${r}`,
              fio: fio || '—',
              address: String(row[2] || '').trim(),
              city: String(row[3] || '').trim(),
              code: String(row[4] || '').trim(),
              state: String(row[5] || '').trim(),
              dateSent,
              dateVerified,
              statusAfterUpload: normalizeStatus(statusAfter),
              finalStatus: statusFinal ? normalizeStatus(statusFinal) : undefined,
              comment,
            });
          }
        });

        if (allRecords.length > 0) {
          onImportCustomRecords(allRecords, file.name.replace(/\.[^/.]+$/, ''));
          onClose();
        } else {
          alert('В файле не найдено строк с данными.');
        }
      } catch (err) {
        console.error('File parse error', err);
        alert('Не удалось разобрать файл таблицы Excel/CSV.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div
      id="modal-sheet-selector"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Подключение таблицы FB-1
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Синхронизация через Google Sheets API, файл или встроенную базу
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

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('google')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'google'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CloudDownload className="w-3.5 h-3.5" />
            <span>Google Sheets (OAuth)</span>
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'demo'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Демо-база FB-1</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Загрузить Excel/CSV</span>
          </button>
        </div>

        {/* Tab 1: Google Sheets Live */}
        {activeTab === 'google' && (
          <div className="p-6 space-y-4">
            {!isLoggedIn ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Требуется вход через Google</p>
                    <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                      Для чтения защищенных данных таблицы FB-1 подключите ваш Google аккаунт с правами чтения Google Sheets.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogin}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Войти через Google и разрешить доступ</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ссылка на таблицу FB-1 или Spreadsheet ID:
                  </label>
                  <input
                    type="text"
                    value={spreadsheetIdInput}
                    onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Вставьте полный URL таблицы из адресной строки браузера. Приложение автоматически считает все именные вкладки сотрудников.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {loadProgress && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Чтение вкладки: {loadProgress.tab}</span>
                      <span>
                        {loadProgress.current} из {loadProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${(loadProgress.current / loadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  id="btn-sync-google-sheets"
                  onClick={() => onLoadLiveSheets(spreadsheetIdInput)}
                  disabled={isLoading || !spreadsheetIdInput.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CloudDownload className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Загрузка данных с вкладок...' : 'Загрузить и проанализировать FB-1'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Demo Preloaded Data */}
        {activeTab === 'demo' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Встроенная база по образцу скриншота таблицы FB-1 (все 37 вкладок)
              </div>
              <p>
                Включает полный перечень из 37 именных вкладок (Руслан, Евгения П, Адель, Дана, Диана, Ангелина, Татьяна, Анастасия, Михаил, Сергей Х, Денис и все остальные) с точной структурой столбцов:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
                <li>Столбец G: Дата отправки на верификацию (включая 50 строк у Руслана за 14.09)</li>
                <li>Столбец H: Дата выхода с верифа (итоговая дата)</li>
                <li>Столбцы I и J: Все 8 типов статусов (Готов, Модерация, Suspended и др.)</li>
              </ul>
            </div>

            <button
              id="btn-activate-demo-data"
              onClick={() => {
                onUseDemoData();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-xs transition-colors"
            >
              Использовать демо-данные FB-1
            </button>
          </div>
        )}

        {/* Tab 3: Upload Excel / CSV */}
        {activeTab === 'upload' && (
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Перетащите сюда файл .xlsx или .csv таблицы FB-1
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Поддерживаются многостраничные книги Excel с именными вкладками
              </p>
              <label className="mt-3 inline-block px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors">
                Выбрать файл
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
