import { AccountRecord, DocumentStatus } from '../types';

// Complete list of all 37 employees corresponding to 37 tabs in the FB-1 spreadsheet
export const MOCK_TABS: string[] = [
  'Руслан',
  'Евгения П',
  'Адель',
  'Дана',
  'Диана',
  'Ангелина',
  'Татьяна',
  'Анастасия',
  'Михаил',
  'Евгения И',
  'Сергей Х',
  'Хусниддин',
  'Азамат',
  'Шахзода',
  'Евгений Ч',
  'Владислав',
  'Артем',
  'Кристина',
  'Карина',
  'Александр Б',
  'Александр К',
  'Дмитрий С',
  'Дмитрий В',
  'Илья',
  'Полина',
  'Алина',
  'Виктория',
  'Максим',
  'Роман',
  'Никита',
  'Дарья',
  'Валерия',
  'Кирилл',
  'Тимур',
  'София',
  'Игорь',
  'Денис',
];

// Helper to deterministically generate representative data matching screenshot & user requirements
function createMockRecords(): AccountRecord[] {
  const records: AccountRecord[] = [];
  const indianNames = [
    'FAYIS', 'DHAVAL SHAH', 'GAUTAM DAYAL', 'HARSH RAGHUWANSHI', 'HARSH S JAISWAL',
    'ANKUSH B M', 'DIPAK BALU NIKAM', 'VIKAS KUMAR', 'ROHIT SHARMA', 'AMAN VERMA',
    'RAHUL MEHTA', 'SURESH PATEL', 'KIRAN REDDY', 'ARUN SINGH', 'PRADEEP YADAV',
    'MANISH JOSHI', 'SANJAY GUPTA', 'SUNIL DAS', 'AJAY KUMAR', 'DEEPAK CHOUDHARY',
    'VIJAY THAKUR', 'MOHIT AGARWAL', 'SANDEEP ROY', 'PRAKASH JAT', 'HEMANT SHARMA',
    'KUNAL MISHRA', 'VISHAL PANDEY', 'NAVEEN RAWAT', 'SUMIT TIWARI', 'AMIT CHAUHAN',
    'RAJESH NAIR', 'NITIN BHATIA', 'ALOK TRIPATHI', 'SACHIN DUBEY', 'VARUN MALHOTRA'
  ];

  const addresses = [
    { address: '70/2, Kuttichira', city: 'Kozhikode', code: '673003', state: 'Kerala' },
    { address: '10, Shivpark Society, Viratnagar', city: 'Ahmedabad', code: '382443', state: 'Gujarat' },
    { address: '116, Sector 63 Road', city: 'Noida', code: '201309', state: 'Uttar Pradesh' },
    { address: 'Ashok Vihar Colony Phase 1', city: 'Varanasi', code: '221007', state: 'Uttar Pradesh' },
    { address: '28, RB Rajpura', city: 'Vadodara', code: '390023', state: 'Gujarat' },
    { address: '8, Gandhi Bazaar Main Road', city: 'Bengaluru', code: '560004', state: 'Karnataka' },
    { address: 'Plot 45, MIDC Industrial Area', city: 'Nashik', code: '422007', state: 'Maharashtra' },
    { address: 'Flat 302, Green Park', city: 'New Delhi', code: '110016', state: 'Delhi' },
    { address: '14, Residency Road', city: 'Jaipur', code: '302001', state: 'Rajasthan' },
    { address: '88, Anna Salai', city: 'Chennai', code: '600002', state: 'Tamil Nadu' },
    { address: '19, Banjara Hills', city: 'Hyderabad', code: '500034', state: 'Telangana' },
    { address: '7, Park Street', city: 'Kolkata', code: '700016', state: 'West Bengal' },
  ];

  // Specific distribution per employee for 14.09 (and previous dates)
  // For 'Руслан': exactly 50 records for 14.09 as specified in user prompt!
  MOCK_TABS.forEach((emp, empIdx) => {
    // Number of records on 14.09
    let count1409 = 0;
    let countOtherDates = 0;

    if (emp === 'Руслан') {
      count1409 = 50; // Exact prompt specification: "допустим 50 строк в столбце G стоит дата 14.09"
      countOtherDates = 12;
    } else if (empIdx < 8) {
      // High volume employees (30-45 records on 14.09)
      count1409 = 32 + (empIdx * 2);
      countOtherDates = 10;
    } else if (empIdx < 20) {
      // Medium volume (18-28 records on 14.09)
      count1409 = 18 + ((empIdx % 5) * 2);
      countOtherDates = 8;
    } else if (empIdx < 32) {
      // Standard volume (10-18 records on 14.09)
      count1409 = 10 + ((empIdx % 4) * 2);
      countOtherDates = 6;
    } else if (empIdx < 35) {
      // Low volume (4-8 records on 14.09)
      count1409 = 4 + (empIdx % 3);
      countOtherDates = 5;
    } else {
      // Zero submissions on 14.09 (e.g. day off / weekend shift) to demonstrate 0-handling
      count1409 = 0;
      countOtherDates = 8; // Has records on 13.09 or 12.09
    }

    // Generate records for 14.09
    for (let i = 0; i < count1409; i++) {
      const nameIndex = (empIdx * 7 + i) % indianNames.length;
      const addrIndex = (empIdx * 3 + i) % addresses.length;
      const addr = addresses[addrIndex];
      const accNum = 100000000 + (empIdx * 10000) + (i * 137);

      // Status distribution reflecting real production operations:
      // ~45% Готов, ~20% Модерация, ~12% Suspended, ~8% запросил платежку,
      // ~6% Бан документа, ~4% Отлежка, ~3% в работе, ~2% Другое
      let statusAfter: DocumentStatus = 'Готов';
      let dateVerified = '14.09';
      let comment = 'заливка ' + ((i % 4) + 1);

      const mod = i % 20;
      if (mod === 0 || mod === 5 || mod === 9) {
        statusAfter = 'Модерация';
        dateVerified = '';
        comment = 'на проверке FB';
      } else if (mod === 2 || mod === 14) {
        statusAfter = 'Suspended';
        dateVerified = '14.09';
        comment = 'селфи не прошло';
      } else if (mod === 4) {
        statusAfter = 'запросил платежку';
        dateVerified = '';
        comment = 'запрос выписки';
      } else if (mod === 8) {
        statusAfter = 'Бан документа';
        dateVerified = '14.09';
        comment = 'дубликат ID';
      } else if (mod === 12) {
        statusAfter = 'Отлежка';
        dateVerified = '';
        comment = 'суточный лимит';
      } else if (mod === 16) {
        statusAfter = 'в работе';
        dateVerified = '';
        comment = 'подготовка скана';
      } else if (mod === 18) {
        statusAfter = 'Другое';
        dateVerified = '';
        comment = 'смена прокси';
      } else {
        statusAfter = 'Готов';
        dateVerified = i % 2 === 0 ? '14.09' : '15.09';
        comment = 'готово к запуску';
      }

      records.push({
        id: `rec-${empIdx}-${i}-1409`,
        employee: emp,
        accountName: `IN${accNum}_KMAI_QQ_RND_RT_080`,
        fio: indianNames[nameIndex],
        address: addr.address,
        city: addr.city,
        code: addr.code,
        state: addr.state,
        dateSent: '14.09',
        dateVerified: dateVerified,
        statusAfterUpload: statusAfter,
        finalStatus: statusAfter,
        comment,
      });
    }

    // Generate records for other dates (13.09, 12.09, 11.09, 09.08)
    const otherDates = ['13.09', '12.09', '11.09', '10.09', '09.08'];
    for (let j = 0; j < countOtherDates; j++) {
      const date = otherDates[j % otherDates.length];
      const nameIndex = (empIdx * 5 + j + 3) % indianNames.length;
      const addrIndex = (empIdx * 2 + j + 1) % addresses.length;
      const addr = addresses[addrIndex];
      const accNum = 200000000 + (empIdx * 10000) + (j * 243);

      let statusAfter: DocumentStatus = 'Готов';
      let dateVerified = date;
      let comment = 'архив';

      const mod = j % 6;
      if (mod === 0) {
        statusAfter = 'Модерация';
        dateVerified = '';
        comment = 'ожидает верификации (2+ дня)';
      } else if (mod === 1) {
        statusAfter = 'запросил платежку';
        dateVerified = '';
        comment = 'нет ответа по платежке';
      } else if (mod === 2) {
        statusAfter = 'Suspended';
        dateVerified = date;
      } else if (mod === 3) {
        statusAfter = 'Бан документа';
        dateVerified = date;
      } else {
        statusAfter = 'Готов';
      }

      records.push({
        id: `rec-${empIdx}-${j}-other`,
        employee: emp,
        accountName: `IN${accNum}_KMAI_QQ_RND_RT_080`,
        fio: indianNames[nameIndex],
        address: addr.address,
        city: addr.city,
        code: addr.code,
        state: addr.state,
        dateSent: date,
        dateVerified,
        statusAfterUpload: statusAfter,
        finalStatus: statusAfter,
        comment,
      });
    }
  });

  return records;
}

export const INITIAL_MOCK_RECORDS: AccountRecord[] = createMockRecords();
