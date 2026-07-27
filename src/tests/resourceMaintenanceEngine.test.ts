import { describe, it, expect } from 'vitest';
import {
  daysSinceDate,
  calculateNextMaintenanceDate,
  getMaintenanceStatus,
  getTuvStatus,
  TUV_WARNING_DAYS,
  MAINTENANCE_WARNING_DAYS,
} from '../domain/resourceMaintenanceEngine';

describe('Resource Maintenance & TÜV Engine Tests', () => {
  const TODAY = '2026-07-27';

  it('should calculate days since date correctly', () => {
    // 10 days ago
    expect(daysSinceDate('2026-07-17', TODAY)).toBe(10);
    // Same day
    expect(daysSinceDate('2026-07-27', TODAY)).toBe(0);
    // 5 days in the future
    expect(daysSinceDate('2026-08-01', TODAY)).toBe(-5);
  });

  it('should calculate next maintenance date from last date + interval', () => {
    expect(calculateNextMaintenanceDate('2026-07-01', 30)).toBe('2026-07-31');
    expect(calculateNextMaintenanceDate('2026-01-01', 180)).toBe('2026-06-30');
    expect(calculateNextMaintenanceDate(undefined, 30)).toBeNull();
    expect(calculateNextMaintenanceDate('2026-07-01', 0)).toBeNull();
  });

  describe('TÜV Warnings', () => {

    it('should detect TÜV OVERDUE when next TÜV date is in the past', () => {
      // TÜV expired yesterday (2026-07-26)
      const status = getTuvStatus('2026-07-26', TODAY);
      expect(status).toBe('OVERDUE');
    });

    it('should detect TÜV DUE_SOON when next TÜV date is within 30 days', () => {
      // TÜV in 15 days (2026-08-11)
      const status15 = getTuvStatus('2026-08-11', TODAY);
      expect(status15).toBe('DUE_SOON');

      // TÜV exactly in 30 days (2026-08-26)
      const status30 = getTuvStatus('2026-08-26', TODAY);
      expect(status30).toBe('DUE_SOON');
    });

    it('should return TÜV OK when next TÜV date is more than 30 days away', () => {
      // TÜV in 45 days (2026-09-10)
      const status = getTuvStatus('2026-09-10', TODAY);
      expect(status).toBe('OK');
    });

    it('should return TÜV UNKNOWN if date is missing or invalid', () => {
      expect(getTuvStatus(undefined, TODAY)).toBe('UNKNOWN');
      expect(getTuvStatus('invalid-date', TODAY)).toBe('UNKNOWN');
    });
  });

  describe('Equipment Maintenance Warnings', () => {

    it('should detect maintenance OVERDUE when next maintenance date is in the past', () => {
      // Last maintenance 100 days ago, interval 90 days -> next date was 10 days ago
      const status = getMaintenanceStatus('2026-04-18', 90, TODAY);
      expect(status).toBe('OVERDUE');
    });

    it('should detect maintenance DUE_SOON when next maintenance date is within 14 days', () => {
      // Last maintenance 80 days ago, interval 90 days -> next date is in 10 days (2026-08-06)
      const status = getMaintenanceStatus('2026-05-08', 90, TODAY);
      expect(status).toBe('DUE_SOON');
    });

    it('should return maintenance OK when next maintenance date is more than 14 days away', () => {
      // Last maintenance 10 days ago, interval 90 days -> next date is in 80 days
      const status = getMaintenanceStatus('2026-07-17', 90, TODAY);
      expect(status).toBe('OK');
    });

    it('should return UNKNOWN for missing or invalid maintenance data', () => {
      expect(getMaintenanceStatus(undefined, 90, TODAY)).toBe('UNKNOWN');
      expect(getMaintenanceStatus('2026-07-01', undefined, TODAY)).toBe('UNKNOWN');
      expect(getMaintenanceStatus('invalid-date', 90, TODAY)).toBe('UNKNOWN');
    });
  });
});
