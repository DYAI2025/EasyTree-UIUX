import {
  WorksiteAssignment,
  Employee,
  Absence,
  Worksite,
  Equipment,
  Vehicle,
  PlanningConflict,
} from '../types';

/**
 * Calculates hours from HH:mm to HH:mm string.
 * Example: "07:00" to "15:30" => 8.5 hours.
 */
export function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 8; // default 8h
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startDecimal = startH + (startM || 0) / 60;
  const endDecimal = endH + (endM || 0) / 60;

  let diff = endDecimal - startDecimal;
  if (diff <= 0) diff += 24; // boundary fallback
  return Math.max(0, Math.round(diff * 10) / 10);
}

/**
 * Checks time overlap between two time slots on the same day.
 */
export function isTimeOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const parse = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const s1 = parse(start1);
  const e1 = parse(end1);
  const s2 = parse(start2);
  const e2 = parse(end2);

  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Core conflict detection engine for workforce planning.
 */
export function detectConflicts(
  assignments: WorksiteAssignment[],
  employees: Employee[],
  absences: Absence[],
  worksites: Worksite[],
  equipment: Equipment[],
  vehicles: Vehicle[]
): PlanningConflict[] {
  const conflicts: PlanningConflict[] = [];

  // Helper maps
  const employeeMap = new Map<string, Employee>(employees.map((e) => [e.id, e]));
  const worksiteMap = new Map<string, Worksite>(worksites.map((w) => [w.id, w]));
  const equipmentMap = new Map<string, Equipment>(equipment.map((eq) => [eq.id, eq]));
  const vehicleMap = new Map<string, Vehicle>(vehicles.map((v) => [v.id, v]));

  // 1. ABSENCE CONFLICTS
  // Check if an assigned employee is absent on that day
  for (const asg of assignments) {
    for (const empId of asg.assignedEmployeeIds) {
      const matchingAbsence = absences.find(
        (abs) =>
          abs.employeeId === empId &&
          abs.status === 'genehmigt' &&
          asg.date >= abs.startDate &&
          asg.date <= abs.endDate
      );

      if (matchingAbsence) {
        const emp = employeeMap.get(empId);
        const site = worksiteMap.get(asg.worksiteId);
        const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Mitarbeiter';
        const siteName = site ? site.name : 'Baustelle';

        conflicts.push({
          id: `conf-abs-${asg.id}-${empId}`,
          type: 'absence_conflict',
          severity: 'blocking',
          title: 'Mitarbeiter im Urlaub/Abwesend',
          message: `${empName} ist am ${asg.date} (${matchingAbsence.type}) abwesend, aber auf Baustelle "${siteName}" eingeplant.`,
          affectedDate: asg.date,
          affectedEmployeeIds: [empId],
          affectedWorksiteId: asg.worksiteId,
          suggestedFix: `Entferne ${empName} am ${asg.date} oder ersetze die Person.`,
        });
      }
    }
  }

  // 2. DOUBLE BOOKINGS (Employee scheduled on multiple overlapping assignments)
  const assignmentsByDate = new Map<string, WorksiteAssignment[]>();
  for (const asg of assignments) {
    const list = assignmentsByDate.get(asg.date) || [];
    list.push(asg);
    assignmentsByDate.set(asg.date, list);
  }

  assignmentsByDate.forEach((dayAssignments, date) => {
    for (let i = 0; i < dayAssignments.length; i++) {
      for (let j = i + 1; j < dayAssignments.length; j++) {
        const a1 = dayAssignments[i];
        const a2 = dayAssignments[j];

        if (isTimeOverlapping(a1.startTime, a1.endTime, a2.startTime, a2.endTime)) {
          // Check common employees
          const commonEmps = a1.assignedEmployeeIds.filter((id) =>
            a2.assignedEmployeeIds.includes(id)
          );

          for (const empId of commonEmps) {
            const emp = employeeMap.get(empId);
            const w1 = worksiteMap.get(a1.worksiteId);
            const w2 = worksiteMap.get(a2.worksiteId);
            const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Mitarbeiter';

            conflicts.push({
              id: `conf-db-${date}-${empId}-${a1.id}-${a2.id}`,
              type: 'double_booking',
              severity: 'blocking',
              title: 'Doppelbelegung Mitarbeiter',
              message: `${empName} ist am ${date} zeitgleich auf "${w1?.name || 'Baustelle 1'}" (${a1.startTime}-${a1.endTime}) und "${w2?.name || 'Baustelle 2'}" (${a2.startTime}-${a2.endTime}) eingeplant.`,
              affectedDate: date,
              affectedEmployeeIds: [empId],
              affectedWorksiteId: a1.worksiteId,
              suggestedFix: `Verschiebe die Einsatzzeit oder entferne ${empName} von einer Baustelle.`,
            });
          }

          // Check common EXCLUSIVE equipment
          const commonEquipment = a1.assignedEquipmentIds.filter((id) =>
            a2.assignedEquipmentIds.includes(id)
          );

          for (const eqId of commonEquipment) {
            const eq = equipmentMap.get(eqId);
            if (eq && eq.isExclusive) {
              const w1 = worksiteMap.get(a1.worksiteId);
              const w2 = worksiteMap.get(a2.worksiteId);

              conflicts.push({
                id: `conf-eqdb-${date}-${eqId}-${a1.id}-${a2.id}`,
                type: 'resource_double_booking',
                severity: 'blocking',
                title: 'Doppelreservierung Spezialgerät',
                message: `Exklusives Gerät "${eq.name}" ist am ${date} zeitgleich auf "${w1?.name}" und "${w2?.name}" reserviert.`,
                affectedDate: date,
                affectedWorksiteId: a1.worksiteId,
                affectedResourceId: eqId,
                suggestedFix: `Weise ein alternatives Gerät zu oder passe die Einsatzzeiten an.`,
              });
            }
          }

          // Check common vehicles
          const commonVehicles = a1.assignedVehicleIds.filter((id) =>
            a2.assignedVehicleIds.includes(id)
          );

          for (const vehId of commonVehicles) {
            const veh = vehicleMap.get(vehId);
            const w1 = worksiteMap.get(a1.worksiteId);
            const w2 = worksiteMap.get(a2.worksiteId);

            conflicts.push({
              id: `conf-vehdb-${date}-${vehId}-${a1.id}-${a2.id}`,
              type: 'resource_double_booking',
              severity: 'blocking',
              title: 'Doppelreservierung Fahrzeug',
              message: `Fahrzeug "${veh?.name || 'Fahrzeug'}" (${veh?.licensePlate}) ist am ${date} doppelt reserviert für "${w1?.name}" und "${w2?.name}".`,
              affectedDate: date,
              affectedWorksiteId: a1.worksiteId,
              affectedResourceId: vehId,
              suggestedFix: `Ändere die Fahrzeugzuordnung für eine der Baustellen.`,
            });
          }
        }
      }
    }
  });

  // 3. EMPLOYEE WEEKLY OVERTIME / CAPACITY EXCEEDED
  const employeeWeeklyHours = new Map<string, number>();
  for (const asg of assignments) {
    const duration = calculateHours(asg.startTime, asg.endTime);
    for (const empId of asg.assignedEmployeeIds) {
      const current = employeeWeeklyHours.get(empId) || 0;
      employeeWeeklyHours.set(empId, current + duration);
    }
  }

  employeeWeeklyHours.forEach((plannedHours, empId) => {
    const emp = employeeMap.get(empId);
    if (emp) {
      if (plannedHours > emp.maxWeeklyHours + 4) {
        // Hard overtime warning
        conflicts.push({
          id: `conf-cap-exceed-${empId}`,
          type: 'capacity_exceeded',
          severity: 'blocking',
          title: 'Kritische Überplanung (>44h)',
          message: `${emp.firstName} ${emp.lastName} ist mit ${plannedHours}h deutlich über der vertraglichen Wochenarbeitszeit (${emp.maxWeeklyHours}h) eingeplant.`,
          affectedDate: 'Ganze Woche',
          affectedEmployeeIds: [empId],
          suggestedFix: `Reduziere die Schichten von ${emp.firstName} ${emp.lastName} um ${plannedHours - emp.maxWeeklyHours} Stunden.`,
        });
      } else if (plannedHours > emp.maxWeeklyHours) {
        // Soft overtime warning
        conflicts.push({
          id: `conf-cap-warn-${empId}`,
          type: 'overtime_warning',
          severity: 'warning',
          title: 'Überstundenwarnung',
          message: `${emp.firstName} ${emp.lastName} ist mit ${plannedHours}h leicht über der Sollzeit von ${emp.maxWeeklyHours}h.`,
          affectedDate: 'Ganze Woche',
          affectedEmployeeIds: [empId],
          suggestedFix: `Prüfe, ob der Überstundenaufbau genehmigt ist.`,
        });
      }
    }
  });

  // 4. MISSING SKILLS ON WORKSITE
  for (const asg of assignments) {
    const worksite = worksiteMap.get(asg.worksiteId);
    if (worksite && worksite.requiredSkills && worksite.requiredSkills.length > 0) {
      const teamEmployees = asg.assignedEmployeeIds
        .map((id) => employeeMap.get(id))
        .filter((e): e is Employee => Boolean(e));

      const teamSkills = new Set(teamEmployees.flatMap((e) => e.skills));

      for (const reqSkill of worksite.requiredSkills) {
        if (!teamSkills.has(reqSkill)) {
          conflicts.push({
            id: `conf-skill-${asg.id}-${reqSkill}`,
            type: 'missing_skill',
            severity: 'warning',
            title: 'Fehlende Fähigkeit im Team',
            message: `Auf Baustelle "${worksite.name}" am ${asg.date} fehlt die geforderte Qualifikation "${reqSkill}".`,
            affectedDate: asg.date,
            affectedWorksiteId: asg.worksiteId,
            suggestedFix: `Weise einen Mitarbeiter mit Qualifikation "${reqSkill}" zu.`,
          });
        }
      }
    }

    // 5. UNASSIGNED / EMPTY TEAM WARNING
    if (asg.assignedEmployeeIds.length === 0) {
      const worksite = worksiteMap.get(asg.worksiteId);
      conflicts.push({
        id: `conf-unassigned-${asg.id}`,
        type: 'unassigned_team',
        severity: 'warning',
        title: 'Unbesetzte Baustelle',
        message: `Baustelle "${worksite?.name || 'Baustelle'}" hat am ${asg.date} noch keine Mitarbeiter zugewiesen.`,
        affectedDate: asg.date,
        affectedWorksiteId: asg.worksiteId,
        suggestedFix: `Füge der Baustelle ein Team hinzu.`,
      });
    }

    // 6. WEATHER WARNING ON ASSIGNMENT
    if (asg.weatherWarning) {
      const worksite = worksiteMap.get(asg.worksiteId);
      conflicts.push({
        id: `conf-weather-${asg.id}`,
        type: 'weather_warning',
        severity: 'warning',
        title: 'Wetterwarnung',
        message: `Wetterhinweis für "${worksite?.name}" am ${asg.date}: ${asg.weatherWarning}`,
        affectedDate: asg.date,
        affectedWorksiteId: asg.worksiteId,
        suggestedFix: `Prüfe die Sicherheit bei Baumkletter- und Steigereinsätzen.`,
      });
    }
  }

  return conflicts;
}
