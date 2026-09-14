export type DocumentStatus =
  | 'Готов'
  | 'Модерация'
  | 'Suspended'
  | 'запросил платежку'
  | 'Бан документа'
  | 'Другое'
  | 'Отлежка'
  | 'в работе';

export const ALL_STATUSES: DocumentStatus[] = [
  'Готов',
  'Модерация',
  'Suspended',
  'запросил платежку',
  'Бан документа',
  'Другое',
  'Отлежка',
  'в работе',
];

export interface AccountRecord {
  id: string;
  employee: string; // Sheet tab name (e.g., 'Руслан', 'Евгения П')
  accountName: string; // Column A
  fio: string; // Column B
  address?: string; // Column C
  city?: string; // Column D
  code?: string; // Column E
  state?: string; // Column F
  dateSent: string; // Column G: "Дата отправки на" (e.g. "14.09" or "2024-09-14")
  dateVerified?: string; // Column H: "Дата выхода с верифа" (e.g. "18.09" or blank)
  statusAfterUpload: DocumentStatus | string; // Column I
  finalStatus?: DocumentStatus | string; // Column J
  comment?: string; // Column K
  isOverdue?: boolean;
  daysOverdue?: number;
}

export interface EmployeeStats {
  employee: string;
  total: number;
  ready: number; // Готов
  moderation: number; // Модерация
  suspended: number; // Suspended
  paymentRequested: number; // запросил платежку
  banned: number; // Бан документа
  other: number; // Другое
  aging: number; // Отлежка
  inWork: number; // в работе
  approvalRate: number; // (ready / total) * 100
  overdueCount: number;
  records: AccountRecord[];
}

export interface SummaryTotals {
  totalDocs: number;
  ready: number;
  moderation: number;
  suspended: number;
  paymentRequested: number;
  banned: number;
  other: number;
  aging: number;
  inWork: number;
  overallApprovalRate: number;
  totalOverdue: number;
  activeEmployeesCount: number;
  avgVerificationDays: number;
}

export type DateFilterTarget = 'dateSent' | 'dateVerified' | 'both';

export interface FilterConfig {
  dateTarget: DateFilterTarget;
  statusTarget: 'afterUpload' | 'final';
  startDate: string; // YYYY-MM-DD or DD.MM
  endDate: string; // YYYY-MM-DD or DD.MM
  singleDate?: string;
  employeeSearch: string;
  selectedEmployees: string[];
  statusFilter: string; // 'all' or specific status
  overdueDaysThreshold: number; // e.g., 2 or 3 days
  showAllEmployees: boolean; // whether to display all 37 employees in the table even if they have 0 records for the selected period
}

export interface TabDetailInfo {
  name: string;
  totalRecordsCount: number;
  filteredRecordsCount: number;
  hasData: boolean;
}
