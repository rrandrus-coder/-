// Status badge styling adhering strictly to the user's screenshot
export const STATUS_CONFIG: Record<
  string,
  {
    bg: string;
    text: string;
    darkBg: string;
    darkText: string;
    border: string;
    chartColor: string;
    label: string;
  }
> = {
  'Готов': {
    bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    text: 'text-emerald-800',
    darkBg: 'dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    darkText: 'dark:text-emerald-400',
    border: 'border-emerald-500',
    chartColor: '#10b981', // green
    label: 'Готов',
  },
  'Модерация': {
    bg: 'bg-amber-100 text-amber-900 border-amber-300',
    text: 'text-amber-800',
    darkBg: 'dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
    darkText: 'dark:text-amber-400',
    border: 'border-amber-500',
    chartColor: '#f59e0b', // amber
    label: 'Модерация',
  },
  'Suspended': {
    bg: 'bg-rose-100 text-rose-900 border-rose-300',
    text: 'text-rose-800',
    darkBg: 'dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
    darkText: 'dark:text-rose-400',
    border: 'border-rose-600',
    chartColor: '#e11d48', // rose
    label: 'Suspended',
  },
  'запросил платежку': {
    bg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    text: 'text-cyan-800',
    darkBg: 'dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800',
    darkText: 'dark:text-cyan-400',
    border: 'border-cyan-500',
    chartColor: '#06b6d4', // cyan
    label: 'запросил платежку',
  },
  'Бан документа': {
    bg: 'bg-red-100 text-red-900 border-red-300',
    text: 'text-red-800',
    darkBg: 'dark:bg-red-950/80 dark:text-red-300 dark:border-red-800',
    darkText: 'dark:text-red-400',
    border: 'border-red-600',
    chartColor: '#dc2626', // red
    label: 'Бан документа',
  },
  'Другое': {
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    text: 'text-slate-700',
    darkBg: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    darkText: 'dark:text-slate-400',
    border: 'border-slate-400',
    chartColor: '#94a3b8', // slate
    label: 'Другое',
  },
  'Отлежка': {
    bg: 'bg-orange-100 text-orange-900 border-orange-300',
    text: 'text-orange-800',
    darkBg: 'dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800',
    darkText: 'dark:text-orange-400',
    border: 'border-orange-500',
    chartColor: '#ea580c', // orange
    label: 'Отлежка',
  },
  'в работе': {
    bg: 'bg-blue-100 text-blue-900 border-blue-300',
    text: 'text-blue-800',
    darkBg: 'dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',
    darkText: 'dark:text-blue-400',
    border: 'border-blue-500',
    chartColor: '#2563eb', // blue
    label: 'в работе',
  },
};

export function getStatusStyle(status: string) {
  return (
    STATUS_CONFIG[status] || {
      bg: 'bg-gray-100 text-gray-800 border-gray-300',
      text: 'text-gray-800',
      darkBg: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
      darkText: 'dark:text-gray-400',
      border: 'border-gray-400',
      chartColor: '#64748b',
      label: status,
    }
  );
}
