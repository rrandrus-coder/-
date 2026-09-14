import * as XLSX from 'xlsx';
import { EmployeeStats, SummaryTotals, AccountRecord } from '../types';

export function exportToExcel(
  employeeStats: EmployeeStats[],
  totals: SummaryTotals,
  records: AccountRecord[],
  fileName = 'FB-1_Статистика'
) {
  // Sheet 1: Summary Table per Employee
  const summaryRows = employeeStats.map((emp, index) => ({
    '№': index + 1,
    'Сотрудник': emp.employee,
    'Всего документов': emp.total,
    'Готов': emp.ready,
    'Модерация': emp.moderation,
    'Suspended': emp.suspended,
    'Запросил платежку': emp.paymentRequested,
    'Бан документа': emp.banned,
    'Другое': emp.other,
    'Отлежка': emp.aging,
    'В работе': emp.inWork,
    '% Апрува': `${emp.approvalRate.toFixed(1)}%`,
    'Просрочено': emp.overdueCount,
  }));

  // Add totals row
  summaryRows.push({
    '№': '' as any,
    'Сотрудник': `ИТОГО (${totals.activeEmployeesCount} активных из ${employeeStats.length})`,
    'Всего документов': totals.totalDocs,
    'Готов': totals.ready,
    'Модерация': totals.moderation,
    'Suspended': totals.suspended,
    'Запросил платежку': totals.paymentRequested,
    'Бан документа': totals.banned,
    'Другое': totals.other,
    'Отлежка': totals.aging,
    'В работе': totals.inWork,
    '% Апрува': `${totals.overallApprovalRate.toFixed(1)}%`,
    'Просрочено': totals.totalOverdue,
  });

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводная статистика');

  // Sheet 2: Raw Records
  if (records.length > 0) {
    const detailRows = records.map((r, i) => ({
      '№': i + 1,
      'Сотрудник': r.employee,
      'Название аккаунта': r.accountName,
      'ФИО': r.fio,
      'Адрес': r.address,
      'Город': r.city,
      'Индекс': r.code,
      'Штат': r.state,
      'Дата отправки (G)': r.dateSent,
      'Дата выхода (H)': r.dateVerified,
      'Статус после загрузки (I)': r.statusAfterUpload,
      'Итоговый статус (J)': r.finalStatus || '',
      'Комментарий (K)': r.comment || '',
    }));
    const wsDetail = XLSX.utils.json_to_sheet(detailRows);
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Все аккаунты');
  }

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportToCSV(
  employeeStats: EmployeeStats[],
  totals: SummaryTotals,
  fileName = 'FB-1_Сводка'
) {
  const headers = [
    '№',
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
    '% Апрува',
    'Просрочено',
  ];

  const rows = employeeStats.map((emp, i) => [
    i + 1,
    `"${emp.employee}"`,
    emp.total,
    emp.ready,
    emp.moderation,
    emp.suspended,
    emp.paymentRequested,
    emp.banned,
    emp.other,
    emp.aging,
    emp.inWork,
    `"${emp.approvalRate.toFixed(1)}%"`,
    emp.overdueCount,
  ]);

  rows.push([
    '',
    `"ИТОГО (${totals.activeEmployeesCount} с док. из ${employeeStats.length})"`,
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

  // UTF-8 BOM so Excel opens Cyrillic characters properly
  const csvContent =
    '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
