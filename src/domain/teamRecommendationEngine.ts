import {
  Employee,
  Worksite,
  Vehicle,
  Equipment,
  WorksiteAssignment,
  Absence,
} from '../types';
import { calculateSkillMatch } from './skillRecommendationEngine';

export interface RecommendedEmployee {
  employee: Employee;
  matchingSkills: string[];
  missingSkills: string[];
  matchScorePercent: number;
  isLeader: boolean;
  reasons: string[];
}

export interface RecommendedResource<T> {
  item: T;
  isAvailable: boolean;
  matchReason: string;
}

export interface TeamRecommendationResult {
  worksite: Worksite;
  targetDate: string;

  // Requirements breakdown
  requiredSkills: string[];
  hasLeaderRequirement: boolean;

  // Free staff & resources
  freeEmployees: Employee[];
  freeVehicles: Vehicle[];
  freeEquipment: Equipment[];

  // Selected/Suggested Team
  suggestedLeader: RecommendedEmployee | null;
  suggestedWorkers: RecommendedEmployee[];
  suggestedVehicles: RecommendedResource<Vehicle>[];
  suggestedEquipment: RecommendedResource<Equipment>[];

  // Overall Coverage Metrics
  overallMatchPercent: number;
  coveredSkills: string[];
  missingSkills: string[];
  warnings: string[];
}

/**
 * Pure function to calculate available free employees on a specific date.
 */
export function getFreeEmployeesOnDate(
  date: string,
  allEmployees: Employee[],
  assignments: WorksiteAssignment[],
  absences: Absence[] = []
): Employee[] {
  // 1. Employees on absence on this date
  const absentEmployeeIds = new Set(
    absences
      .filter((a) => a.startDate <= date && a.endDate >= date && a.status === 'genehmigt')
      .map((a) => a.employeeId)
  );

  // 2. Employees assigned to worksites on this date
  const assignedEmployeeIds = new Set(
    assignments
      .filter((a) => a.date === date)
      .flatMap((a) => a.assignedEmployeeIds)
  );

  return allEmployees.filter(
    (emp) => !absentEmployeeIds.has(emp.id) && !assignedEmployeeIds.has(emp.id)
  );
}

/**
 * Pure function to calculate available free vehicles on a specific date.
 */
export function getFreeVehiclesOnDate(
  date: string,
  allVehicles: Vehicle[],
  assignments: WorksiteAssignment[]
): Vehicle[] {
  const assignedVehicleIds = new Set(
    assignments
      .filter((a) => a.date === date)
      .flatMap((a) => a.assignedVehicleIds || [])
  );

  return allVehicles.filter(
    (veh) => veh.status !== 'wartung' && !assignedVehicleIds.has(veh.id)
  );
}

/**
 * Pure function to calculate available free equipment on a specific date.
 */
export function getFreeEquipmentOnDate(
  date: string,
  allEquipment: Equipment[],
  assignments: WorksiteAssignment[]
): Equipment[] {
  const assignedEquipmentIds = new Set(
    assignments
      .filter((a) => a.date === date)
      .flatMap((a) => a.assignedEquipmentIds || [])
  );

  return allEquipment.filter(
    (eq) => eq.status !== 'wartung' && !assignedEquipmentIds.has(eq.id)
  );
}

/**
 * Main Team Setup Recommendation Engine
 */
export function computeTeamRecommendation(
  worksite: Worksite,
  targetDate: string,
  allEmployees: Employee[],
  allVehicles: Vehicle[],
  allEquipment: Equipment[],
  assignments: WorksiteAssignment[],
  absences: Absence[] = []
): TeamRecommendationResult {
  const requiredSkills = worksite.requiredSkills || [];
  const freeEmployees = getFreeEmployeesOnDate(targetDate, allEmployees, assignments, absences);
  const freeVehicles = getFreeVehiclesOnDate(targetDate, allVehicles, assignments);
  const freeEquipment = getFreeEquipmentOnDate(targetDate, allEquipment, assignments);

  // Evaluate each free employee against worksite requirements using skillRecommendationEngine
  const evaluatedEmployees: RecommendedEmployee[] = freeEmployees.map((emp) => {
    const match = calculateSkillMatch(emp, requiredSkills);
    const isLeader = Boolean(emp.isLeader || emp.role === 'Teamleiter');

    let matchScorePercent = match.matchScorePercent;
    if (requiredSkills.length === 0) {
      matchScorePercent = 80; // Base score if worksite has no specific required skills
    }
    if (isLeader) {
      matchScorePercent = Math.min(100, matchScorePercent + 15);
    }

    const reasons: string[] = [];
    if (isLeader) reasons.push('Qualifiziert als Teamleiter');
    if (match.matchingSkills.length > 0) {
      reasons.push(`${match.matchingSkills.length} geforderte Qualifikation(en): ${match.matchingSkills.join(', ')}`);
    }
    if (emp.role) {
      reasons.push(`Rolle: ${emp.role}`);
    }

    return {
      employee: emp,
      matchingSkills: match.matchingSkills,
      missingSkills: match.missingSkills,
      matchScorePercent,
      isLeader,
      reasons,
    };
  });

  // Sort evaluated employees by match score descending
  evaluatedEmployees.sort((a, b) => b.matchScorePercent - a.matchScorePercent);

  // Identify suggested leader
  const leaderCandidate = evaluatedEmployees.find((e) => e.isLeader) || null;

  // Select recommended workers (excluding the chosen leader if found)
  const remainingCandidates = leaderCandidate
    ? evaluatedEmployees.filter((e) => e.employee.id !== leaderCandidate.employee.id)
    : evaluatedEmployees;

  // Aim for a standard crew size of 2-3 workers + 1 leader
  const suggestedWorkers = remainingCandidates.slice(0, 3);

  // Assemble full recommended crew
  const recommendedCrew = leaderCandidate
    ? [leaderCandidate, ...suggestedWorkers]
    : suggestedWorkers;

  // Compute aggregated skills covered by recommended crew
  const crewSkillsSet = new Set<string>();
  recommendedCrew.forEach((member) => {
    (member.employee.skills || []).forEach((s) => crewSkillsSet.add(s));
  });

  const coveredSkills = requiredSkills.filter((s) => crewSkillsSet.has(s));
  const missingSkills = requiredSkills.filter((s) => !crewSkillsSet.has(s));

  let overallMatchPercent = 100;
  if (requiredSkills.length > 0) {
    overallMatchPercent = Math.round((coveredSkills.length / requiredSkills.length) * 100);
  }

  const warnings: string[] = [];
  if (!leaderCandidate) {
    warnings.push('Kein freier Teamleiter für diesen Tag verfügbar.');
  }
  if (missingSkills.length > 0) {
    warnings.push(`Unabgedeckte Qualifikationen: ${missingSkills.join(', ')}`);
  }
  if (recommendedCrew.length === 0) {
    warnings.push('Keine freien Mitarbeiter für das Team-Setup gefunden.');
  }

  // Suggest Vehicle
  const suggestedVehicles: RecommendedResource<Vehicle>[] = freeVehicles.slice(0, 2).map((v) => ({
    item: v,
    isAvailable: true,
    matchReason: `Freies Fahrzeug (${v.type || 'Transporter'})`,
  }));

  // Suggest Equipment based on worksite description / required skills
  const suggestedEquipment: RecommendedResource<Equipment>[] = freeEquipment
    .filter((eq) => {
      // Prioritize equipment matching worksite needs
      const descLower = (worksite.description + ' ' + worksite.orderDescription).toLowerCase();
      const catLower = (eq.category || eq.name).toLowerCase();
      return descLower.includes(catLower) || requiredSkills.some((s) => s.toLowerCase().includes(catLower));
    })
    .concat(freeEquipment) // fallback to other available equipment
    .filter((v, i, self) => self.findIndex((t) => t.id === v.id) === i) // deduplicate
    .slice(0, 2)
    .map((eq) => ({
      item: eq,
      isAvailable: true,
      matchReason: `Verfügbares Spezialgerät (${eq.category || eq.name})`,
    }));

  return {
    worksite,
    targetDate,
    requiredSkills,
    hasLeaderRequirement: true,
    freeEmployees,
    freeVehicles,
    freeEquipment,
    suggestedLeader: leaderCandidate,
    suggestedWorkers,
    suggestedVehicles,
    suggestedEquipment,
    overallMatchPercent,
    coveredSkills,
    missingSkills,
    warnings,
  };
}
