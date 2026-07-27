import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeWorksite,
  normalizeEmployee,
  normalizeVehicle,
  normalizeEquipment,
  loadAndNormalizeStorage,
} from '../domain/normalizeData';

// Simple in-memory localStorage mock for test environment
const mockStorage: Record<string, string> = {};
const fakeLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = fakeLocalStorage;
}

describe('Data Normalization Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes incomplete worksite data correctly', () => {
    const rawWorksite = {
      id: 'ws_legacy',
      name: 'Baustelle Schlossgarten',
      description: 'Baumpflege und Kronensicherung',
    };

    const normalized = normalizeWorksite(rawWorksite);

    expect(normalized.id).toBe('ws_legacy');
    expect(normalized.name).toBe('Baustelle Schlossgarten');
    expect(normalized.orderDescription).toBe('Baumpflege und Kronensicherung');
    expect(normalized.requirements).toEqual([]);
    expect(normalized.todoItems).toEqual([]);
    expect(normalized.comments).toEqual([]);
    expect(normalized.requiredSkills).toEqual([]);
  });

  it('normalizes incomplete employee data correctly', () => {
    const rawEmployee = {
      firstName: 'Max',
      lastName: 'Mustermann',
      role: 'SKT-Kletterer',
    };

    const normalized = normalizeEmployee(rawEmployee);

    expect(normalized.firstName).toBe('Max');
    expect(normalized.lastName).toBe('Mustermann');
    expect(normalized.role).toBe('SKT-Kletterer');
    expect(normalized.statusId).toBe('emp-status-1');
    expect(normalized.employmentTypeId).toBe('emp-type-1');
    expect(normalized.initials).toBe('MM');
    expect(normalized.maxWeeklyHours).toBe(40);
  });

  it('normalizes vehicle and equipment data with missing properties', () => {
    const rawVehicle = {
      name: 'Unimog U400',
    };
    const normVeh = normalizeVehicle(rawVehicle);
    expect(normVeh.name).toBe('Unimog U400');
    expect(normVeh.nextTuvDate).toBe('2026-12-31');
    expect(normVeh.requiresDriverLicense).toBe(false);

    const rawEq = {
      name: 'Großhäcksler',
    };
    const normEq = normalizeEquipment(rawEq);
    expect(normEq.name).toBe('Großhäcksler');
    expect(normEq.quantity).toBe(1);
    expect(normEq.maintenanceIntervalDays).toBe(30);
    expect(normEq.isExclusive).toBe(true);
  });

  it('loadAndNormalizeStorage reads from primary or legacy localStorage keys', () => {
    const legacyWorksites = [
      { id: 'ws_old_1', name: 'Alte Baustelle 1', location: 'Potsdam' },
    ];
    localStorage.setItem('arboscus_worksites', JSON.stringify(legacyWorksites));

    const result = loadAndNormalizeStorage(
      'arboscus_v2_worksites',
      normalizeWorksite,
      [],
      'arboscus_worksites'
    );

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('ws_old_1');
    expect(result[0].todoItems).toEqual([]);
    expect(result[0].requirements).toEqual([]);
  });
});
