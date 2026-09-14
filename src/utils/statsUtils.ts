import { AccountRecord, EmployeeStats, FilterConfig, SummaryTotals } from '../types';
import { getDaysDifference, isDateInRange, isSameDate } from './dateUtils';

// Standardize status text from spreadsheet cells
export function normalizeStatus(raw: string | undefined | null): string {
  if (!raw) return 'Другое';
  const clean = raw.trim();
  const lower = clean.toLowerCase();

  if (lower === 'готов' || lower === 'готово' || lower === 'ready' || lower === 'approved') return 'Готов';
  if (lower === 'модерация' || lower === 'на модерации' || lower === 'moderation') return 'Модерация';
  if (lower === 'suspended' || lower === 'суспенд' || lower === 'блокировка') return 'Suspended';
  if (lower.includes('платежк') || lower.includes('запросил платежку') || lower.includes('payment')) return 'запросил платежку';
  if (lower.includes('бан') || lower.includes('бан документа') || lower.includes('ban')) return 'Бан документа';
  if (lower === 'отлежка' || lower.includes('отлежк') || lower.includes('aging')) return 'Отлежка';
  if (lower === 'в работе' || lower === 'работа' || lower === 'in work' || lower === 'processing') return 'в работе';

  return clean || 'Другое';
}

// Check if an item is considered overdue:
// Date sent exists, but dateVerified is blank OR status is pending/stuck, and days > threshold
export function checkIsOverdue(record: AccountRecord, thresholdDays: number = 2): { isOverdue: boolean; days: number } {
  const status = normalizeStatus(record.statusAfterUpload);
  const isFinalized = status === 'Готов' || status === 'Бан документа' || status === 'Suspended';
  const hasVerifiedDate = Boolean(record.dateVerified && record.dateVerified.trim() !== '');

  // If completed and has date, not overdue
  if (hasVerifiedDate && isFinalized) {
    return { isOverdue: false, days: 0 };
  }

  // If still in moderation, in work, payment requested, or cooling
  const days = getDaysDifference(record.dateSent);
  if (days >= thresholdDays) {
    return { isOverdue: true, days };
  }

  return { isOverdue: false, days };
}

// Filter records according to the user's criteria
export function filterRecords(records: AccountRecord[], filter: FilterConfig): AccountRecord[] {
  return records.filter((rec) => {
    // 1. Employee search & selection filter
    if (filter.employeeSearch) {
      const q = filter.employeeSearch.toLowerCase();
      const matchEmp = rec.employee.toLowerCase().includes(q);
      const matchAcc = rec.accountName.toLowerCase().includes(q);
      const matchFio = rec.fio.toLowerCase().includes(q);
      if (!matchEmp && !matchAcc && !matchFio) return false;
    }

    if (filter.selectedEmployees.length > 0) {
      if (!filter.selectedEmployees.includes(rec.employee)) return false;
    }

    // 2. Specific status filter if chosen
    const activeStatus = normalizeStatus(
      filter.statusTarget === 'afterUpload' ? rec.statusAfterUpload : (rec.finalStatus || rec.statusAfterUpload)
    );
    if (filter.statusFilter && filter.statusFilter !== 'all') {
      if (activeStatus !== filter.statusFilter) return false;
    }

    // 3. Date filtering based on filter.dateTarget
    // dateTarget can be 'dateSent' (Col G), 'dateVerified' (Col H), or 'both'
    const checkSent = filter.dateTarget === 'dateSent' || filter.dateTarget === 'both';
    const checkVerified = filter.dateTarget === 'dateVerified' || filter.dateTarget === 'both';

    // If a single date is specified (e.g., "14.09")
    if (filter.singleDate) {
      if (filter.dateTarget === 'dateSent') {
        if (!isSameDate(rec.dateSent, filter.singleDate)) return false;
      } else if (filter.dateTarget === 'dateVerified') {
        if (!isSameDate(rec.dateVerified, filter.singleDate)) return false;
      } else {
        // 'both'
        const matchSent = isSameDate(rec.dateSent, filter.singleDate);
        const matchVer = isSameDate(rec.dateVerified, filter.singleDate);
        if (!matchSent && !matchVer) return false;
      }
    } else {
      // Range filtering: startDate and endDate
      if (filter.startDate || filter.endDate) {
        if (filter.dateTarget === 'dateSent') {
          if (!isDateInRange(rec.dateSent, filter.startDate, filter.endDate)) return false;
        } else if (filter.dateTarget === 'dateVerified') {
          if (!isDateInRange(rec.dateVerified, filter.startDate, filter.endDate)) return false;
        } else {
          // 'both'
          const sentOk = isDateInRange(rec.dateSent, filter.startDate, filter.endDate);
          const verOk = isDateInRange(rec.dateVerified, filter.startDate, filter.endDate);
          if (!sentOk && !verOk) return false;
        }
      }
    }

    return true;
  });
}

// Aggregate records into per-employee stats and team totals
export function aggregateEmployeeStats(
  records: AccountRecord[],
  statusTarget: 'afterUpload' | 'final' = 'afterUpload',
  overdueThresholdDays: number = 2,
  allKnownEmployees: string[] = [],
  showAllEmployees: boolean = true
): { employeeStats: EmployeeStats[]; totals: SummaryTotals } {
  const map = new Map<string, AccountRecord[]>();

  // If showing all employees, pre-seed all known tabs so zero-document employees are included
  if (showAllEmployees && allKnownEmployees.length > 0) {
    allKnownEmployees.forEach((emp) => {
      map.set(emp, []);
    });
  }

  // Group by employee
  records.forEach((r) => {
    const list = map.get(r.employee) || [];
    list.push(r);
    map.set(r.employee, list);
  });

  const employeeStats: EmployeeStats[] = [];
  let totalDocs = 0;
  let totalReady = 0;
  let totalModeration = 0;
  let totalSuspended = 0;
  let totalPaymentRequested = 0;
  let totalBanned = 0;
  let totalOther = 0;
  let totalAging = 0;
  let totalInWork = 0;
  let totalOverdue = 0;
  let totalVerificationDays = 0;
  let verifiedCount = 0;

  map.forEach((empRecords, employee) => {
    let ready = 0;
    let moderation = 0;
    let suspended = 0;
    let paymentRequested = 0;
    let banned = 0;
    let other = 0;
    let aging = 0;
    let inWork = 0;
    let overdueCount = 0;

    const enrichedRecords = empRecords.map((rec) => {
      const status = normalizeStatus(
        statusTarget === 'afterUpload' ? rec.statusAfterUpload : (rec.finalStatus || rec.statusAfterUpload)
      );

      switch (status) {
        case 'Готов':
          ready++;
          break;
        case 'Модерация':
          moderation++;
          break;
        case 'Suspended':
          suspended++;
          break;
        case 'запросил платежку':
          paymentRequested++;
          break;
        case 'Бан документа':
          banned++;
          break;
        case 'Отлежка':
          aging++;
          break;
        case 'в работе':
          inWork++;
          break;
        default:
          other++;
          break;
      }

      // Check overdue
      const overdueInfo = checkIsOverdue(rec, overdueThresholdDays);
      if (overdueInfo.isOverdue) {
        overdueCount++;
      }

      // Calculate speed if both dates exist
      if (rec.dateSent && rec.dateVerified) {
        const days = getDaysDifference(rec.dateSent, rec.dateVerified);
        totalVerificationDays += days;
        verifiedCount++;
      }

      return {
        ...rec,
        isOverdue: overdueInfo.isOverdue,
        daysOverdue: overdueInfo.days,
      };
    });

    const total = empRecords.length;
    const approvalRate = total > 0 ? (ready / total) * 100 : 0;

    totalDocs += total;
    totalReady += ready;
    totalModeration += moderation;
    totalSuspended += suspended;
    totalPaymentRequested += paymentRequested;
    totalBanned += banned;
    totalOther += other;
    totalAging += aging;
    totalInWork += inWork;
    totalOverdue += overdueCount;

    employeeStats.push({
      employee,
      total,
      ready,
      moderation,
      suspended,
      paymentRequested,
      banned,
      other,
      aging,
      inWork,
      approvalRate,
      overdueCount,
      records: enrichedRecords,
    });
  });

  // Sort employeeStats by total descending, tie-breaking alphabetically by employee name
  employeeStats.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    return a.employee.localeCompare(b.employee, 'ru');
  });

  const activeEmployeesWithDocs = employeeStats.filter((e) => e.total > 0).length;
  const overallApprovalRate = totalDocs > 0 ? (totalReady / totalDocs) * 100 : 0;
  const avgVerificationDays = verifiedCount > 0 ? parseFloat((totalVerificationDays / verifiedCount).toFixed(1)) : 0;

  const totals: SummaryTotals = {
    totalDocs,
    ready: totalReady,
    moderation: totalModeration,
    suspended: totalSuspended,
    paymentRequested: totalPaymentRequested,
    banned: totalBanned,
    other: totalOther,
    aging: totalAging,
    inWork: totalInWork,
    overallApprovalRate,
    totalOverdue,
    activeEmployeesCount: activeEmployeesWithDocs,
    avgVerificationDays,
  };

  return { employeeStats, totals };
}
