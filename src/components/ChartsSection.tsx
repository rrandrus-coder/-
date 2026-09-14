import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { EmployeeStats, SummaryTotals } from '../types';
import { STATUS_CONFIG } from '../utils/statusColors';
import { BarChart3, PieChart as PieIcon, Award } from 'lucide-react';

interface ChartsSectionProps {
  employeeStats: EmployeeStats[];
  totals: SummaryTotals;
  isDarkMode: boolean;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  employeeStats,
  totals,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'stacked' | 'donut' | 'conversion'>('stacked');

  // Status breakdown data for Donut Chart
  const statusPieData = [
    { name: 'Готов', value: totals.ready, color: STATUS_CONFIG['Готов'].chartColor },
    { name: 'Модерация', value: totals.moderation, color: STATUS_CONFIG['Модерация'].chartColor },
    { name: 'Suspended', value: totals.suspended, color: STATUS_CONFIG['Suspended'].chartColor },
    { name: 'запросил платежку', value: totals.paymentRequested, color: STATUS_CONFIG['запросил платежку'].chartColor },
    { name: 'Бан документа', value: totals.banned, color: STATUS_CONFIG['Бан документа'].chartColor },
    { name: 'Отлежка', value: totals.aging, color: STATUS_CONFIG['Отлежка'].chartColor },
    { name: 'в работе', value: totals.inWork, color: STATUS_CONFIG['в работе'].chartColor },
    { name: 'Другое', value: totals.other, color: STATUS_CONFIG['Другое'].chartColor },
  ].filter((item) => item.value > 0);

  // Stacked bar chart data per employee (Top 12 employees to avoid overcrowding)
  const stackedBarData = employeeStats.slice(0, 12).map((emp) => ({
    name: emp.employee,
    Готов: emp.ready,
    Модерация: emp.moderation,
    Suspended: emp.suspended,
    'запросил платежку': emp.paymentRequested,
    'Бан документа': emp.banned,
    Отлежка: emp.aging,
    'в работе': emp.inWork,
    Другое: emp.other,
    total: emp.total,
    rate: emp.approvalRate,
  }));

  // Conversion rate data sorted by rate
  const conversionData = [...employeeStats]
    .filter((e) => e.total >= 1)
    .sort((a, b) => b.approvalRate - a.approvalRate)
    .slice(0, 10)
    .map((e) => ({
      name: e.employee,
      rate: parseFloat(e.approvalRate.toFixed(1)),
      total: e.total,
      ready: e.ready,
    }));

  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs mb-6 transition-colors">
      {/* Chart Header with Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Визуализация эффективности команды
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Сравнительный анализ распределения документов и статусов
          </p>
        </div>

        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
          <button
            id="tab-chart-stacked"
            onClick={() => setActiveTab('stacked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'stacked'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Статусы по сотрудникам</span>
          </button>

          <button
            id="tab-chart-donut"
            onClick={() => setActiveTab('donut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'donut'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Доли статусов команды</span>
          </button>

          <button
            id="tab-chart-conversion"
            onClick={() => setActiveTab('conversion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'conversion'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Рейтинг конверсии (%)</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-80 w-full">
        {activeTab === 'stacked' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedBarData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '8px',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="Готов" stackId="a" fill={STATUS_CONFIG['Готов'].chartColor} />
              <Bar dataKey="Модерация" stackId="a" fill={STATUS_CONFIG['Модерация'].chartColor} />
              <Bar dataKey="Suspended" stackId="a" fill={STATUS_CONFIG['Suspended'].chartColor} />
              <Bar dataKey="запросил платежку" stackId="a" fill={STATUS_CONFIG['запросил платежку'].chartColor} />
              <Bar dataKey="Бан документа" stackId="a" fill={STATUS_CONFIG['Бан документа'].chartColor} />
              <Bar dataKey="Отлежка" stackId="a" fill={STATUS_CONFIG['Отлежка'].chartColor} />
              <Bar dataKey="в работе" stackId="a" fill={STATUS_CONFIG['в работе'].chartColor} />
              <Bar dataKey="Другое" stackId="a" fill={STATUS_CONFIG['Другое'].chartColor} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'donut' && (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '8px',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} документов`, 'Количество']}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Status Statistics Legend Cards */}
            <div className="grid grid-cols-2 gap-2 pl-4">
              {statusPieData.map((s) => {
                const pct = totals.totalDocs > 0 ? ((s.value / totals.totalDocs) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={s.name}
                    className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {s.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.value}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'conversion' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={conversionData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                stroke={axisColor}
                fontSize={11}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                width={85}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '8px',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val}%`, 'Конверсия Готов']}
              />
              <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
