import * as XLSX from 'xlsx';
import { AccountRecord, EmployeeStats, SummaryTotals } from '../types';

// Export summary statistics and detailed records to an Excel workbook
export function exportToExcel(
  employeeStats: EmployeeStats[],
  totals: SummaryTotals,
  records: AccountRecord[],
  filenamePrefix: string = 'FB-1_Статистика'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Сводная статистика по сотрудникам
  const summaryRows = employeeStats.map((emp) => ({
    'Сотрудник / Вкладка': emp.employee,
    'Всего документов': emp.total,
    'Готов': emp.ready,
    'Модерация': emp.moderation,
    'Suspended': emp.suspended,
    'Запросил платежку': emp.paymentRequested,
    'Бан документа': emp.banned,
    'Другое': emp.other,
    'Отлежка': emp.aging,
    'В работе': emp.inWork,
    'Конверсия (%)': parseFloat(emp.approvalRate.toFixed(1)),
    'Просрочено': emp.overdueCount,
  }));

  // Append Total Row
  summaryRows.push({
    'Сотрудник / Вкладка': 'ИТОГО ПО ВСЕМ СОТРУДНИКАМ',
    'Всего документов': totals.totalDocs,
    'Готов': totals.ready,
    'Модерация': totals.moderation,
    'Suspended': totals.suspended,
    'Запросил платежку': totals.paymentRequested,
    'Бан документа': totals.banned,
    'Другое': totals.other,
    'Отлежка': totals.aging,
    'В работе': totals.inWork,
    'Конверсия (%)': parseFloat(totals.overallApprovalRate.toFixed(1)),
    'Просрочено': totals.totalOverdue,
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  // Auto column widths
  wsSummary['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводная статистика');

  // Sheet 2: Детализация документов
  const detailRows = records.map((r) => ({
    'Сотрудник': r.employee,
    'Название аккаунта': r.accountName,
    'ФИО': r.fio,
    'Город': r.city || '',
    'Штат': r.state || '',
    'Дата отправки (G)': r.dateSent,
    'Дата выхода (H)': r.dateVerified || '—',
    'Статус после загрузки': r.statusAfterUpload,
    'Статус итоговый': r.finalStatus || '—',
    'Комментарий': r.comment || '',
    'Просрочено': r.isOverdue ? `Да (${r.daysOverdue} дн)` : 'Нет',
  }));

  const wsDetail = XLSX.utils.json_to_sheet(detailRows);
  wsDetail['!cols'] = [
    { wch: 16 },
    { wch: 32 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 25 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Все документы');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenamePrefix}_${today}.xlsx`);
}

// Export summary table to CSV (with UTF-8 BOM for Excel Cyrillic compatibility)
export function exportToCSV(
  employeeStats: EmployeeStats[],
  totals: SummaryTotals,
  filenamePrefix: string = 'FB-1_Сводка'
) {
  const headers = [
    'Сотрудник',
    'Всего документов',
    'Готов',
    'Модерация',
    'Suspended',
    'Запросил платежку',
    'Бан документа',
    'Другое',
    'Отлежка',
    'В работе',
    'Конверсия (%)',
    'Просрочено',
  ];

  const rows = employeeStats.map((e) => [
    `"${e.employee}"`,
    e.total,
    e.ready,
    e.moderation,
    e.suspended,
    e.paymentRequested,
    e.banned,
    e.other,
    e.aging,
    e.inWork,
    `"${e.approvalRate.toFixed(1)}%"`,
    e.overdueCount,
  ]);

  // Total row
  rows.push([
    '"ИТОГО"',
    totals.totalDocs,
    totals.ready,
    totals.moderation,
    totals.suspended,
    totals.paymentRequested,
    totals.banned,
    totals.other,
    totals.aging,
    totals.inWork,
    `"${totals.overallApprovalRate.toFixed(1)}%"`,
    totals.totalOverdue,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
