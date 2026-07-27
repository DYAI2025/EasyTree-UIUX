/**
 * Domain Engine for Resource Maintenance & TÜV Warnings
 * Calculates days since maintenance, next maintenance dates,
 * TÜV statuses, and maintenance warning levels.
 */

export const TUV_WARNING_DAYS = 30;
export const MAINTENANCE_WARNING_DAYS = 14;

export type WarningLevel = 'OK' | 'DUE_SOON' | 'OVERDUE' | 'UNKNOWN';

/**
 * Safely parses a YYYY-MM-DD string into a local Date at 00:00:00
 * avoiding UTC timezone offset errors.
 */
function parseLocalDate(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

/**
 * Formats a Date object to YYYY-MM-DD string
 */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calculates calendar days between dateStr and currentDateStr (defaults to today).
 * Positive number = days passed since dateStr.
 * Negative number = dateStr is in the future.
 */
export function daysSinceDate(dateStr?: string, currentDateStr?: string): number | null {
  const target = parseLocalDate(dateStr);
  if (!target) return null;

  const current = currentDateStr ? parseLocalDate(currentDateStr) : new Date();
  if (!current) return null;

  // Reset time portions to midnight for exact day diff
  current.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = current.getTime() - target.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the next maintenance date as string YYYY-MM-DD
 * based on last maintenance date + interval in days.
 */
export function calculateNextMaintenanceDate(
  lastMaintenanceDateStr?: string,
  intervalDays?: number
): string | null {
  if (!lastMaintenanceDateStr || !intervalDays || intervalDays <= 0) return null;
  const lastDate = parseLocalDate(lastMaintenanceDateStr);
  if (!lastDate) return null;

  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return formatLocalDate(nextDate);
}

/**
 * Evaluates the maintenance status of equipment:
 * - OVERDUE: next maintenance date is in the past (< current date)
 * - DUE_SOON: next maintenance date is within MAINTENANCE_WARNING_DAYS (14 days)
 * - OK: next maintenance date is more than 14 days away
 * - UNKNOWN: missing date or interval
 */
export function getMaintenanceStatus(
  lastMaintenanceDateStr?: string,
  intervalDays?: number,
  currentDateStr?: string
): WarningLevel {
  const nextDateStr = calculateNextMaintenanceDate(lastMaintenanceDateStr, intervalDays);
  if (!nextDateStr) return 'UNKNOWN';

  const daysUntilNext = daysSinceDate(nextDateStr, currentDateStr);
  if (daysUntilNext === null) return 'UNKNOWN';

  // daysUntilNext = current - nextDate
  // If current > nextDate, daysUntilNext > 0 -> OVERDUE
  if (daysUntilNext > 0) {
    return 'OVERDUE';
  }

  // If current <= nextDate, days until next is -daysUntilNext
  const remainingDays = -daysUntilNext;
  if (remainingDays <= MAINTENANCE_WARNING_DAYS) {
    return 'DUE_SOON';
  }

  return 'OK';
}

/**
 * Evaluates the TÜV status for vehicles:
 * - OVERDUE: TÜV date is in the past (< current date)
 * - DUE_SOON: TÜV date is within TUV_WARNING_DAYS (30 days)
 * - OK: TÜV date is more than 30 days away
 * - UNKNOWN: missing TÜV date
 */
export function getTuvStatus(
  nextTuvDateStr?: string,
  currentDateStr?: string
): WarningLevel {
  if (!nextTuvDateStr) return 'UNKNOWN';

  const daysPassed = daysSinceDate(nextTuvDateStr, currentDateStr);
  if (daysPassed === null) return 'UNKNOWN';

  if (daysPassed > 0) {
    return 'OVERDUE';
  }

  const remainingDays = -daysPassed;
  if (remainingDays <= TUV_WARNING_DAYS) {
    return 'DUE_SOON';
  }

  return 'OK';
}
