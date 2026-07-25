import {
  WorksiteAssignment,
  Employee,
  Absence,
  Worksite,
  Vehicle,
  Equipment,
  EmployeeCapacitySummary,
  ResourceUtilizationSummary,
} from '../types';
import { calculateHours } from './conflictEngine';

/**
 * Calculates capacity summaries for all employees in a week.
 */
export function getEmployeeCapacitySummaries(
  employees: Employee[],
  assignments: WorksiteAssignment[],
  absences: Absence[],
  weekStartDate: string,
  weekEndDate: string
): EmployeeCapacitySummary[] {
  return employees.map((emp) => {
    // Check if absent during week
    const isAbsentThisWeek = absences.some(
      (abs) =>
        abs.employeeId === emp.id &&
        abs.status === 'genehmigt' &&
        abs.startDate <= weekEndDate &&
        abs.endDate >= weekStartDate
    );

    // Sum planned hours
    let plannedHours = 0;
    let assignmentsCount = 0;

    assignments.forEach((asg) => {
      if (
        asg.date >= weekStartDate &&
        asg.date <= weekEndDate &&
        asg.assignedEmployeeIds.includes(emp.id)
      ) {
        plannedHours += calculateHours(asg.startTime, asg.endTime);
        assignmentsCount++;
      }
    });

    const overtimeHours = Math.max(0, plannedHours - emp.maxWeeklyHours);
    const isOverCapacity = plannedHours > emp.maxWeeklyHours;

    return {
      employeeId: emp.id,
      plannedHours: Math.round(plannedHours * 10) / 10,
      maxHours: emp.maxWeeklyHours,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      assignmentsCount,
      isOverCapacity,
      isAbsentThisWeek,
    };
  });
}

/**
 * Calculates person-hours per worksite for a week or single assignment.
 */
export function getWorksitePersonHours(
  worksiteId: string,
  assignments: WorksiteAssignment[]
): { totalPersonHours: number; totalAssignments: number; totalAssignedPeople: number } {
  let totalPersonHours = 0;
  let totalAssignments = 0;
  const uniquePeople = new Set<string>();

  assignments.forEach((asg) => {
    if (asg.worksiteId === worksiteId) {
      totalAssignments++;
      const duration = calculateHours(asg.startTime, asg.endTime);
      const peopleCount = asg.assignedEmployeeIds.length;
      totalPersonHours += duration * peopleCount;
      asg.assignedEmployeeIds.forEach((id) => uniquePeople.add(id));
    }
  });

  return {
    totalPersonHours: Math.round(totalPersonHours * 10) / 10,
    totalAssignments,
    totalAssignedPeople: uniquePeople.size,
  };
}

/**
 * Calculates resource utilization for vehicles and equipment across a week.
 */
export function getResourceUtilization(
  vehicles: Vehicle[],
  equipment: Equipment[],
  assignments: WorksiteAssignment[],
  worksites: Worksite[]
): ResourceUtilizationSummary[] {
  const worksiteMap = new Map<string, Worksite>(worksites.map((w) => [w.id, w]));

  const vehicleSummaries: ResourceUtilizationSummary[] = vehicles.map((veh) => {
    const datesReserved = new Set<string>();
    const worksiteNames = new Set<string>();
    let reservationInstances = 0;

    assignments.forEach((asg) => {
      if (asg.assignedVehicleIds.includes(veh.id)) {
        datesReserved.add(asg.date);
        reservationInstances++;
        const site = worksiteMap.get(asg.worksiteId);
        if (site) worksiteNames.add(site.name);
      }
    });

    return {
      resourceId: veh.id,
      name: veh.name,
      category: 'vehicle',
      isExclusive: true,
      totalDaysInWeek: 5,
      reservedDaysCount: datesReserved.size,
      isDoubleBooked: reservationInstances > datesReserved.size,
      assignedWorksites: Array.from(worksiteNames),
    };
  });

  const equipmentSummaries: ResourceUtilizationSummary[] = equipment.map((eq) => {
    const datesReserved = new Set<string>();
    const worksiteNames = new Set<string>();
    let reservationInstances = 0;

    assignments.forEach((asg) => {
      if (asg.assignedEquipmentIds.includes(eq.id)) {
        datesReserved.add(asg.date);
        reservationInstances++;
        const site = worksiteMap.get(asg.worksiteId);
        if (site) worksiteNames.add(site.name);
      }
    });

    return {
      resourceId: eq.id,
      name: eq.name,
      category: 'equipment',
      isExclusive: eq.isExclusive,
      totalDaysInWeek: 5,
      reservedDaysCount: datesReserved.size,
      isDoubleBooked: eq.isExclusive && reservationInstances > datesReserved.size,
      assignedWorksites: Array.from(worksiteNames),
    };
  });

  return [...vehicleSummaries, ...equipmentSummaries];
}

/**
 * Top Bento Summary Tile Data
 */
export interface BentoSummaryMetrics {
  totalEmployees: number;
  plannedEmployeesCount: number;
  unplannedEmployeesCount: number;
  absentEmployeesCount: number;
  activeWorksitesCount: number;
  incompleteWorksitesCount: number;
  totalPlannedHours: number;
  totalCapacityHours: number;
  vehiclesInUseCount: number;
  totalVehicles: number;
  equipmentReservedCount: number;
  totalEquipment: number;
  resourceBottlenecksCount: number;
  blockingConflictsCount: number;
  warningsCount: number;
}

export function computeBentoMetrics(
  employees: Employee[],
  assignments: WorksiteAssignment[],
  absences: Absence[],
  worksites: Worksite[],
  vehicles: Vehicle[],
  equipment: Equipment[],
  conflicts: any[],
  weekStartDate: string,
  weekEndDate: string
): BentoSummaryMetrics {
  const capacities = getEmployeeCapacitySummaries(
    employees,
    assignments,
    absences,
    weekStartDate,
    weekEndDate
  );

  const plannedEmployeesCount = capacities.filter((c) => c.plannedHours > 0).length;
  const absentEmployeesCount = capacities.filter((c) => c.isAbsentThisWeek).length;
  const unplannedEmployeesCount = capacities.filter(
    (c) => c.plannedHours === 0 && !c.isAbsentThisWeek
  ).length;

  const activeWorksiteIds = new Set(
    assignments
      .filter((a) => a.date >= weekStartDate && a.date <= weekEndDate)
      .map((a) => a.worksiteId)
  );

  const incompleteWorksitesCount = worksites.filter((w) => {
    if (!activeWorksiteIds.has(w.id)) return false;
    const siteAssignments = assignments.filter(
      (a) => a.worksiteId === w.id && a.date >= weekStartDate && a.date <= weekEndDate
    );
    return siteAssignments.some((a) => a.assignedEmployeeIds.length === 0);
  }).length;

  let totalPlannedHours = 0;
  capacities.forEach((c) => {
    totalPlannedHours += c.plannedHours;
  });

  const totalCapacityHours = employees.reduce((sum, e) => sum + e.maxWeeklyHours, 0);

  const utilizations = getResourceUtilization(vehicles, equipment, assignments, worksites);
  const vehiclesInUseCount = utilizations.filter(
    (u) => u.category === 'vehicle' && u.reservedDaysCount > 0
  ).length;
  const equipmentReservedCount = utilizations.filter(
    (u) => u.category === 'equipment' && u.reservedDaysCount > 0
  ).length;

  const resourceBottlenecksCount = utilizations.filter((u) => u.isDoubleBooked).length;

  const blockingConflictsCount = conflicts.filter((c) => c.severity === 'blocking').length;
  const warningsCount = conflicts.filter((c) => c.severity === 'warning').length;

  return {
    totalEmployees: employees.length,
    plannedEmployeesCount,
    unplannedEmployeesCount,
    absentEmployeesCount,
    activeWorksitesCount: activeWorksiteIds.size,
    incompleteWorksitesCount,
    totalPlannedHours: Math.round(totalPlannedHours),
    totalCapacityHours,
    vehiclesInUseCount,
    totalVehicles: vehicles.length,
    equipmentReservedCount,
    totalEquipment: equipment.length,
    resourceBottlenecksCount,
    blockingConflictsCount,
    warningsCount,
  };
}
