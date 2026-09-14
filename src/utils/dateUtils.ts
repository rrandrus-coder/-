// Robust date parsing and normalization for Russian / international formats
// Examples: "14.09", "14.09.2024", "2024-09-14", "09.08", "18.08"

export function parseFlexibleDate(dateStr: string | number | undefined | null): Date | null {
  if (!dateStr) return null;

  // Handle number (Excel serial date)
  if (typeof dateStr === 'number') {
    // Excel base date is 1899-12-30
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateStr * 86400000);
  }

  const str = String(dateStr).trim();
  if (!str) return null;

  // Current year fallback for dates like "14.09"
  const defaultYear = 2024; // Base spreadsheet year

  // Pattern 1: DD.MM or DD.MM.YYYY
  const dotParts = str.split('.');
  if (dotParts.length >= 2) {
    const day = parseInt(dotParts[0], 10);
    const month = parseInt(dotParts[1], 10) - 1;
    let year = defaultYear;
    if (dotParts.length >= 3 && dotParts[2]) {
      const parsedYear = parseInt(dotParts[2], 10);
      year = parsedYear < 100 ? 2000 + parsedYear : parsedYear;
    }
    if (!isNaN(day) && !isNaN(month) && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  // Pattern 2: YYYY-MM-DD
  const dashParts = str.split('-');
  if (dashParts.length === 3) {
    const year = parseInt(dashParts[0], 10);
    const month = parseInt(dashParts[1], 10) - 1;
    const day = parseInt(dashParts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  // Pattern 3: DD/MM/YYYY or DD/MM
  const slashParts = str.split('/');
  if (slashParts.length >= 2) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10) - 1;
    const year = slashParts.length >= 3 ? parseInt(slashParts[2], 10) : defaultYear;
    if (!isNaN(day) && !isNaN(month)) {
      return new Date(year, month, day);
    }
  }

  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

export function formatDateToDayMonth(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

export function formatDateToISO(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Compare if targetDate falls within [startDate, endDate]
// Both boundaries inclusive. If startDate or endDate is not set, that side is unbounded.
export function isDateInRange(
  targetDateStr: string | undefined,
  startDateStr: string | undefined,
  endDateStr: string | undefined
): boolean {
  if (!targetDateStr) return false;
  const target = parseFlexibleDate(targetDateStr);
  if (!target) return false;

  const targetDayMonth = target.getMonth() * 100 + target.getDate();

  if (startDateStr) {
    const start = parseFlexibleDate(startDateStr);
    if (start) {
      const startDayMonth = start.getMonth() * 100 + start.getDate();
      if (targetDayMonth < startDayMonth) return false;
    }
  }

  if (endDateStr) {
    const end = parseFlexibleDate(endDateStr);
    if (end) {
      const endDayMonth = end.getMonth() * 100 + end.getDate();
      if (targetDayMonth > endDayMonth) return false;
    }
  }

  return true;
}

// Check if a single target date matches a single specified date (e.g. "14.09")
export function isSameDate(targetDateStr: string | undefined, filterDateStr: string | undefined): boolean {
  if (!targetDateStr || !filterDateStr) return false;
  const t = parseFlexibleDate(targetDateStr);
  const f = parseFlexibleDate(filterDateStr);
  if (!t || !f) return false;
  return t.getDate() === f.getDate() && t.getMonth() === f.getMonth();
}

// Calculate days between two dates
export function getDaysDifference(dateFromStr: string, dateToStr?: string): number {
  const from = parseFlexibleDate(dateFromStr);
  if (!from) return 0;
  // If dateToStr is missing, use a fixed reference or current date
  const to = dateToStr ? parseFlexibleDate(dateToStr) : new Date(2024, 8, 16); // Sept 16, 2024 reference
  if (!to) return 0;

  const diffMs = to.getTime() - from.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}
