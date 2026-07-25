export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  states: ('BE' | 'BB')[]; // BE = Berlin, BB = Brandenburg
}

/**
 * Calculates Gauss Easter Sunday for a given year (UTC)
 */
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const res = new Date(date.getTime());
  res.setUTCDate(res.getUTCDate() + days);
  return res;
}

export function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // Fixed holidays
  holidays.push({ date: `${year}-01-01`, name: 'Neujahr', states: ['BE', 'BB'] });
  holidays.push({ date: `${year}-03-08`, name: 'Internationaler Frauentag', states: ['BE'] });
  holidays.push({ date: `${year}-05-01`, name: 'Tag der Arbeit', states: ['BE', 'BB'] });
  holidays.push({ date: `${year}-10-03`, name: 'Tag der Deutschen Einheit', states: ['BE', 'BB'] });
  holidays.push({ date: `${year}-10-31`, name: 'Reformationstag', states: ['BB'] });
  holidays.push({ date: `${year}-12-25`, name: '1. Weihnachtsfeiertag', states: ['BE', 'BB'] });
  holidays.push({ date: `${year}-12-26`, name: '2. Weihnachtsfeiertag', states: ['BE', 'BB'] });

  // Easter movable holidays
  const easter = getEasterSunday(year);
  holidays.push({ date: formatDateIso(addDays(easter, -2)), name: 'Karfreitag', states: ['BE', 'BB'] });
  holidays.push({ date: formatDateIso(easter), name: 'Ostersonntag', states: ['BB'] });
  holidays.push({ date: formatDateIso(addDays(easter, 1)), name: 'Ostermontag', states: ['BE', 'BB'] });
  holidays.push({ date: formatDateIso(addDays(easter, 39)), name: 'Christi Himmelfahrt', states: ['BE', 'BB'] });
  holidays.push({ date: formatDateIso(addDays(easter, 49)), name: 'Pfingstsonntag', states: ['BB'] });
  holidays.push({ date: formatDateIso(addDays(easter, 50)), name: 'Pfingstmonatag', states: ['BE', 'BB'] });

  return holidays;
}

export function detectStateFromLocation(location: string): 'BE' | 'BB' {
  const locUpper = (location || '').toUpperCase();
  if (locUpper.includes('BERLIN')) {
    return 'BE';
  }
  return 'BB'; // Default Brandenburg for Potsdam, Cottbus, etc.
}

export function getHolidayInfo(dateIso: string, location?: string): Holiday | null {
  const year = parseInt(dateIso.split('-')[0], 10);
  if (isNaN(year)) return null;
  const holidays = getHolidaysForYear(year);
  const targetState = location ? detectStateFromLocation(location) : 'BB';
  return holidays.find((h) => h.date === dateIso && h.states.includes(targetState)) || null;
}

export function isBrandenburgHolidayOrWeekend(dateIso: string): boolean {
  const date = new Date(dateIso + 'T00:00:00Z');
  const dayOfWeek = date.getUTCDay(); // 0 = Sun, 6 = Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;

  const year = date.getUTCFullYear();
  const holidays = getHolidaysForYear(year);
  return holidays.some((h) => h.date === dateIso && h.states.includes('BB'));
}
