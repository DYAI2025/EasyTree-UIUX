import {
  PlanningWeek,
  WorksiteAssignment,
  Worksite,
  Employee,
  Vehicle,
  Equipment,
} from '../types';
import { calculateHours } from '../domain/conflictEngine';

const DAY_NAMES: Record<number, string> = {
  0: 'Sonntag',
  1: 'Montag',
  2: 'Dienstag',
  3: 'Mittwoch',
  4: 'Donnerstag',
  5: 'Freitag',
  6: 'Samstag',
};

/**
 * Formats a single CSV cell with proper escaping for German Excel / payroll software (`;` delimiter).
 */
const escapeCSV = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  // Escape double quotes by doubling them
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Exports current week assignment data as a CSV file optimized for payroll and workforce management software.
 */
export const exportWeekAssignmentsToCSV = ({
  currentWeek,
  assignments,
  worksites,
  employees,
  vehicles,
  equipment,
}: {
  currentWeek: PlanningWeek;
  assignments: WorksiteAssignment[];
  worksites: Worksite[];
  employees: Employee[];
  vehicles: Vehicle[];
  equipment: Equipment[];
}) => {
  // Filter assignments belonging to current week date range
  const weekAssignments = assignments
    .filter((a) => a.date >= currentWeek.startDate && a.date <= currentWeek.endDate)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  // CSV Headers (in German, matching German payroll & dispatching tools)
  const headers = [
    'Kalenderwoche',
    'Datum',
    'Wochentag',
    'Baustellen_Code',
    'Baustellen_Name',
    'Ort_Adresse',
    'Taetigkeit',
    'Startzeit',
    'Endzeit',
    'Stunden_Geplant',
    'Mitarbeiter_ID',
    'Mitarbeiter_Name',
    'Rolle_Qualifikation',
    'Fahrzeuge',
    'Geraete_Maschinen',
    'Status',
    'Notizen',
  ];

  const rows: string[][] = [];

  weekAssignments.forEach((asg) => {
    const worksite = worksites.find((w) => w.id === asg.worksiteId);
    const dateObj = new Date(asg.date);
    const dayOfWeek = DAY_NAMES[dateObj.getDay()] || '';

    // Formatted date (DD.MM.YYYY)
    const [year, month, day] = asg.date.split('-');
    const formattedDate = `${day}.${month}.${year}`;

    const hoursNum = calculateHours(asg.startTime, asg.endTime);
    const hoursStr = hoursNum.toFixed(2).replace('.', ','); // German decimal comma

    const vehicleNames = asg.assignedVehicleIds
      .map((id) => vehicles.find((v) => v.id === id)?.name || id)
      .join(', ');

    const equipmentNames = asg.assignedEquipmentIds
      .map((id) => equipment.find((eq) => eq.id === id)?.name || id)
      .join(', ');

    const statusLabel =
      asg.status === 'published'
        ? 'Veröffentlicht'
        : asg.status === 'modified'
        ? 'Geändert (Entwurf)'
        : 'Entwurf';

    const worksiteCode = worksite?.code || '';
    const worksiteName = worksite?.name || 'Unbekannte Baustelle';
    const locationAddr = worksite ? `${worksite.location} (${worksite.address})` : '';

    if (asg.assignedEmployeeIds.length > 0) {
      // Create a row for each assigned employee
      asg.assignedEmployeeIds.forEach((empId) => {
        const emp = employees.find((e) => e.id === empId);
        const empName = emp ? `${emp.firstName} ${emp.lastName}` : empId;
        const empRole = emp?.role || 'Unbekannt';

        rows.push([
          `KW ${currentWeek.weekNumber}`,
          formattedDate,
          dayOfWeek,
          worksiteCode,
          worksiteName,
          locationAddr,
          asg.activityName,
          asg.startTime,
          asg.endTime,
          hoursStr,
          empId,
          empName,
          empRole,
          vehicleNames,
          equipmentNames,
          statusLabel,
          asg.notes || '',
        ]);
      });
    } else {
      // Row for assignment without assigned employees
      rows.push([
        `KW ${currentWeek.weekNumber}`,
        formattedDate,
        dayOfWeek,
        worksiteCode,
        worksiteName,
        locationAddr,
        asg.activityName,
        asg.startTime,
        asg.endTime,
        hoursStr,
        '',
        '-- Unbesetzt --',
        '',
        vehicleNames,
        equipmentNames,
        statusLabel,
        asg.notes || '',
      ]);
    }
  });

  // Construct CSV String with semicolon delimiter and UTF-8 BOM
  const csvContent =
    '\uFEFF' +
    [
      headers.map(escapeCSV).join(';'),
      ...rows.map((row) => row.map(escapeCSV).join(';')),
    ].join('\r\n');

  // Trigger file download in browser
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = `Arboscus_Dienstplan_KW${currentWeek.weekNumber}_${currentWeek.startDate}_bis_${currentWeek.endDate}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
