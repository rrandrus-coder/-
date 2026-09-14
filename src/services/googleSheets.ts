import { AccountRecord } from '../types';
import { normalizeStatus } from '../utils/statsUtils';

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  // Match https://docs.google.com/spreadsheets/d/([a-zA-Z0-9-_]+)
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return trimmed;
}

export interface SheetTabInfo {
  title: string;
  sheetId: number;
}

export interface FetchTabsResult {
  records: AccountRecord[];
  allTabs: string[];
  tabCounts: Record<string, number>;
}

// Fetch list of sheet tabs in the spreadsheet
export async function fetchSpreadsheetTabs(
  spreadsheetId: string,
  accessToken: string
): Promise<{ title: string; tabs: SheetTabInfo[] }> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title,sheets.properties`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `Ошибка загрузки таблицы (статус ${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  const title = data.properties?.title || 'FB-1';
  const tabs: SheetTabInfo[] = (data.sheets || []).map((s: any) => ({
    title: s.properties?.title || '',
    sheetId: s.properties?.sheetId || 0,
  }));

  return { title, tabs };
}

// Fetch all rows from all tabs (all 37 tabs)
export async function fetchAllTabsData(
  spreadsheetId: string,
  tabNames: string[],
  accessToken: string,
  onProgress?: (current: number, total: number, tab: string) => void
): Promise<FetchTabsResult> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const allRecords: AccountRecord[] = [];
  const tabCounts: Record<string, number> = {};

  // Initialize count for all 37 tabs to 0
  tabNames.forEach((t) => {
    tabCounts[t] = 0;
  });

  // Use batchGet in chunks of 8 to prevent URI length overflow while maintaining high speed
  const chunkSize = 8;
  for (let i = 0; i < tabNames.length; i += chunkSize) {
    const chunk = tabNames.slice(i, i + chunkSize);
    // Properly escape single quotes in Google Sheets tab names: 'Tab' -> ''Tab''
    const rangesQuery = chunk
      .map((tab) => `ranges=${encodeURIComponent(`'${tab.replace(/'/g, "''")}'!A1:Z5000`)}`)
      .join('&');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values:batchGet?${rangesQuery}&valueRenderOption=FORMATTED_VALUE`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Не удалось загрузить данные вкладок (статус ${response.status})`);
    }

    const data = await response.json();
    const valueRanges = data.valueRanges || [];

    valueRanges.forEach((rangeObj: any, index: number) => {
      const tabName = chunk[index];
      if (!tabName) return;

      const rows: string[][] = rangeObj.values || [];
      if (rows.length <= 1) {
        // Tab exists but has no data rows yet
        tabCounts[tabName] = 0;
        if (onProgress) {
          onProgress(Math.min(i + index + 1, tabNames.length), tabNames.length, tabName);
        }
        return;
      }

      // Dynamic header mapping with intelligent aliases for FB operations
      const headerRow = rows[0] || [];
      let colAccount = 0; // Col A
      let colFio = 1; // Col B
      let colAddress = 2; // Col C
      let colCity = 3; // Col D
      let colCode = 4; // Col E
      let colState = 5; // Col F
      let colDateSent = 6; // Col G: Дата отправки на верификацию
      let colDateVerified = 7; // Col H: Дата выхода с верифа
      let colStatusAfter = 8; // Col I: Статус после загрузки документов
      let colStatusFinal = 9; // Col J: Статус итоговый
      let colComment = 10; // Col K: Комментарий

      headerRow.forEach((colName, idx) => {
        const lower = String(colName || '').trim().toLowerCase();
        if (lower.includes('название') || lower.includes('аккаунт') || lower.includes('account')) colAccount = idx;
        else if (lower.includes('фио') || lower.includes('fio') || lower.includes('клиент')) colFio = idx;
        else if (lower.includes('address') || lower.includes('адрес')) colAddress = idx;
        else if (lower.includes('city') || lower.includes('город')) colCity = idx;
        else if (lower.includes('code') || lower.includes('индекс') || lower.includes('zip')) colCode = idx;
        else if (lower.includes('state') || lower.includes('штат') || lower.includes('регион')) colState = idx;
        else if (lower.includes('отправк') || lower.includes('подгрузк') || lower.includes('отпр') || lower.includes('дата отпр')) colDateSent = idx;
        else if (lower.includes('выхода') || lower.includes('вериф') || lower.includes('дата вых')) colDateVerified = idx;
        else if (lower.includes('после') || lower.includes('загрузки') || lower.includes('статус 1') || lower.includes('статус док')) colStatusAfter = idx;
        else if (lower.includes('итоговый') || lower.includes('итог') || lower.includes('финал') || lower.includes('статус 2')) colStatusFinal = idx;
        else if (lower.includes('коммент') || lower.includes('примеч')) colComment = idx;
      });

      let tabRowsCount = 0;

      // Parse data rows starting from row 1 (index 1)
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        const accountName = String(row[colAccount] || '').trim();
        const fio = String(row[colFio] || '').trim();
        const dateSent = String(row[colDateSent] || '').trim();
        const dateVerified = String(row[colDateVerified] || '').trim();
        const statusAfter = String(row[colStatusAfter] || '').trim();
        const statusFinal = String(row[colStatusFinal] || '').trim();

        // Skip completely empty rows
        if (!accountName && !fio && !dateSent && !statusAfter) continue;

        tabRowsCount++;
        allRecords.push({
          id: `${tabName}-${r}-${accountName || Math.random().toString(36).substring(7)}`,
          employee: tabName,
          accountName: accountName || `ACC-${r}`,
          fio: fio || '—',
          address: String(row[colAddress] || '').trim(),
          city: String(row[colCity] || '').trim(),
          code: String(row[colCode] || '').trim(),
          state: String(row[colState] || '').trim(),
          dateSent: dateSent,
          dateVerified: dateVerified,
          statusAfterUpload: normalizeStatus(statusAfter),
          finalStatus: statusFinal ? normalizeStatus(statusFinal) : undefined,
          comment: String(row[colComment] || '').trim(),
        });
      }

      tabCounts[tabName] = tabRowsCount;

      if (onProgress) {
        onProgress(Math.min(i + index + 1, tabNames.length), tabNames.length, tabName);
      }
    });
  }

  return {
    records: allRecords,
    allTabs: tabNames,
    tabCounts,
  };
}
