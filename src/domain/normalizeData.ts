import {
  Worksite,
  Employee,
  Vehicle,
  Equipment,
  EmployeeStatusOption,
  EmploymentTypeOption,
} from '../types';

/**
 * Normalizes a Worksite object to guarantee all required fields and arrays exist.
 */
export function normalizeWorksite(raw: any): Worksite {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `ws_${Date.now()}`,
      code: 'BS-000',
      name: 'Unbenannte Baustelle',
      location: 'Potsdam',
      address: 'Unbekannte Adresse',
      meetingPoint: 'Treffpunkt vor Ort',
      colorKey: 'site-blue',
      hexColor: '#4AA8E8',
      description: '',
      orderDescription: 'Keine Zusatzangaben hinterlegt.',
      requiredSkills: [],
      requirements: [],
      todoItems: [],
      comments: [],
    };
  }

  const desc = raw.description || raw.orderDescription || '';
  const orderDesc = raw.orderDescription || raw.description || 'Keine Zusatzangaben hinterlegt.';

  return {
    id: String(raw.id || `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    code: String(raw.code || 'BS-000'),
    name: String(raw.name || 'Baustelle'),
    location: String(raw.location || 'Ort'),
    address: String(raw.address || 'Adresse'),
    meetingPoint: String(raw.meetingPoint || 'Treffpunkt vor Ort'),
    colorKey: raw.colorKey || 'site-blue',
    hexColor: String(raw.hexColor || '#4AA8E8'),
    description: String(desc),
    orderDescription: String(orderDesc),
    requiredSkills: Array.isArray(raw.requiredSkills) ? raw.requiredSkills : [],
    requirements: Array.isArray(raw.requirements)
      ? raw.requirements.map((req: any) => ({
          id: String(req.id || `req_${Math.random().toString(36).substring(2, 6)}`),
          text: String(req.text || ''),
        }))
      : [],
    todoItems: Array.isArray(raw.todoItems)
      ? raw.todoItems.map((item: any) => ({
          id: String(item.id || `todo_${Math.random().toString(36).substring(2, 6)}`),
          title: String(item.title || item.text || ''),
          completed: Boolean(item.completed),
          dueDate: item.dueDate ? String(item.dueDate) : undefined,
        }))
      : [],
    comments: Array.isArray(raw.comments)
      ? raw.comments.map((comment: any) => ({
          id: String(comment.id || `com_${Math.random().toString(36).substring(2, 6)}`),
          author: String(comment.author || 'Anonym'),
          text: String(comment.text || ''),
          createdAt: String(comment.createdAt || new Date().toISOString()),
          isUnread: comment.isUnread !== undefined ? Boolean(comment.isUnread) : true,
        }))
      : [],
  };
}

/**
 * Normalizes an Employee object to guarantee all required fields exist.
 */
export function normalizeEmployee(raw: any): Employee {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `emp_${Date.now()}`,
      firstName: 'Vorname',
      lastName: 'Nachname',
      role: 'Baumpfleger',
      statusId: 'emp-status-1',
      employmentTypeId: 'emp-type-1',
      isLeader: false,
      skills: [],
      maxWeeklyHours: 40,
      initials: 'VN',
      email: '',
      phone: '',
      notes: '',
    };
  }

  const fName = String(raw.firstName || '').trim();
  const lName = String(raw.lastName || '').trim();
  const defaultInitials = `${fName[0] || ''}${lName[0] || ''}`.toUpperCase() || 'MA';

  return {
    id: String(raw.id || `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    firstName: fName || 'Mitarbeiter',
    lastName: lName || '',
    role: String(raw.role || 'Baumpfleger'),
    statusId: String(raw.statusId || 'emp-status-1'),
    employmentTypeId: String(raw.employmentTypeId || 'emp-type-1'),
    isLeader: Boolean(raw.isLeader || raw.role === 'Teamleiter'),
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    maxWeeklyHours: Number(raw.maxWeeklyHours) > 0 ? Number(raw.maxWeeklyHours) : 40,
    initials: String(raw.initials || defaultInitials).toUpperCase(),
    email: String(raw.email || ''),
    phone: String(raw.phone || ''),
    notes: String(raw.notes || ''),
  };
}

/**
 * Normalizes a Vehicle object to guarantee all required fields exist.
 */
export function normalizeVehicle(raw: any): Vehicle {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `veh_${Date.now()}`,
      name: 'Fahrzeug',
      type: 'Transporter',
      licensePlate: 'P-AG 100',
      nextTuvDate: '2026-12-31',
      status: 'verfügbar',
      quantity: 1,
      requiresDriverLicense: false,
      notes: '',
    };
  }

  return {
    id: String(raw.id || `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    name: String(raw.name || 'Fahrzeug'),
    type: raw.type || 'Transporter',
    licensePlate: String(raw.licensePlate || 'P-AG 000').toUpperCase(),
    nextTuvDate: String(raw.nextTuvDate || '2026-12-31'),
    status: raw.status || 'verfügbar',
    quantity: 1,
    requiresDriverLicense: Boolean(raw.requiresDriverLicense),
    requiredLicenseClass: raw.requiredLicenseClass ? String(raw.requiredLicenseClass) : undefined,
    notes: String(raw.notes || ''),
  };
}

/**
 * Normalizes an Equipment object to guarantee all required fields exist.
 */
export function normalizeEquipment(raw: any): Equipment {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `eq_${Date.now()}`,
      name: 'Gerät',
      category: 'Häcksler',
      quantity: 1,
      requiresDriverLicense: false,
      isExclusive: true,
      status: 'verfügbar',
      maintenanceIntervalDays: 30,
      notes: '',
    };
  }

  return {
    id: String(raw.id || `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    name: String(raw.name || 'Gerät'),
    category: raw.category || 'Häcksler',
    quantity: Number(raw.quantity) > 0 ? Number(raw.quantity) : 1,
    requiresDriverLicense: Boolean(raw.requiresDriverLicense),
    requiredLicenseClass: raw.requiredLicenseClass ? String(raw.requiredLicenseClass) : undefined,
    isExclusive: raw.isExclusive !== undefined ? Boolean(raw.isExclusive) : true,
    status: raw.status || 'verfügbar',
    serialNumber: raw.serialNumber ? String(raw.serialNumber) : undefined,
    lastMaintenanceDate: raw.lastMaintenanceDate ? String(raw.lastMaintenanceDate) : undefined,
    maintenanceIntervalDays: Number(raw.maintenanceIntervalDays) > 0 ? Number(raw.maintenanceIntervalDays) : 30,
    notes: String(raw.notes || ''),
  };
}

/**
 * Normalizes collection arrays from localStorage, falling back to defaults if empty or invalid.
 */
export function loadAndNormalizeStorage<T>(
  storageKey: string,
  normalizer: (item: any) => T,
  fallbackDefaults: T[],
  legacyKey?: string
): T[] {
  let rawData: any = null;
  const storageAvailable = typeof localStorage !== 'undefined';

  if (storageAvailable) {
    // Primary key check
    const primaryItem = localStorage.getItem(storageKey);
    if (primaryItem) {
      try {
        rawData = JSON.parse(primaryItem);
      } catch (e) {
        console.error(`Error parsing primary localStorage key "${storageKey}"`, e);
      }
    }

    // Fallback to legacy key if primary key wasn't found or parsed
    if ((!rawData || !Array.isArray(rawData) || rawData.length === 0) && legacyKey) {
      const legacyItem = localStorage.getItem(legacyKey);
      if (legacyItem) {
        try {
          rawData = JSON.parse(legacyItem);
        } catch (e) {
          console.error(`Error parsing legacy localStorage key "${legacyKey}"`, e);
        }
      }
    }
  }

  if (Array.isArray(rawData) && rawData.length > 0) {
    return rawData.map(normalizer);
  }

  return fallbackDefaults.map(normalizer);
}
