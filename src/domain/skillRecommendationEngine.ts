import { Employee, Worksite } from '../types';

export interface EmployeeSkillMatch {
  employee: Employee;
  matchingSkills: string[];
  missingSkills: string[];
  matchScorePercent: number;
  isFullyQualified: boolean;
}

/**
 * Calculates skill match score and breakdown for a single employee against required skills.
 */
export function calculateSkillMatch(
  employee: Employee,
  requiredSkills: string[] = []
): EmployeeSkillMatch {
  const employeeSkills = employee.skills || [];

  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      employee,
      matchingSkills: employeeSkills,
      missingSkills: [],
      matchScorePercent: 100,
      isFullyQualified: true,
    };
  }

  const matchingSkills = requiredSkills.filter((reqSkill) =>
    employeeSkills.includes(reqSkill)
  );

  const missingSkills = requiredSkills.filter(
    (reqSkill) => !employeeSkills.includes(reqSkill)
  );

  const matchScorePercent = Math.round(
    (matchingSkills.length / requiredSkills.length) * 100
  );

  const isFullyQualified = missingSkills.length === 0;

  return {
    employee,
    matchingSkills,
    missingSkills,
    matchScorePercent,
    isFullyQualified,
  };
}

/**
 * Filters and ranks employees based on how well their skills match a worksite's required skills.
 * Can filter for fully qualified employees or return all candidates ranked by match score.
 */
export function getRecommendedEmployeesForWorksite(
  worksite: Worksite,
  availableEmployees: Employee[],
  options?: {
    requireFullyQualified?: boolean;
    minMatchPercent?: number;
  }
): EmployeeSkillMatch[] {
  const requiredSkills = worksite.requiredSkills || [];

  const matches = availableEmployees.map((emp) =>
    calculateSkillMatch(emp, requiredSkills)
  );

  let filtered = matches;
  if (options?.requireFullyQualified) {
    filtered = filtered.filter((m) => m.isFullyQualified);
  } else if (options?.minMatchPercent !== undefined) {
    filtered = filtered.filter((m) => m.matchScorePercent >= options.minMatchPercent!);
  }

  return filtered.sort((a, b) => {
    if (b.matchScorePercent !== a.matchScorePercent) {
      return b.matchScorePercent - a.matchScorePercent;
    }
    const aLeader = a.employee.isLeader || a.employee.role === 'Teamleiter' ? 1 : 0;
    const bLeader = b.employee.isLeader || b.employee.role === 'Teamleiter' ? 1 : 0;
    if (bLeader !== aLeader) {
      return bLeader - aLeader;
    }
    return a.employee.lastName.localeCompare(b.employee.lastName);
  });
}

/**
 * Filter employees array directly by skills matching criteria ('all' or 'any').
 */
export function filterEmployeesBySkills(
  employees: Employee[],
  requiredSkills: string[],
  mode: 'all' | 'any' = 'all'
): Employee[] {
  if (!requiredSkills || requiredSkills.length === 0) {
    return employees;
  }

  return employees.filter((emp) => {
    const empSkills = emp.skills || [];
    if (mode === 'all') {
      return requiredSkills.every((req) => empSkills.includes(req));
    } else {
      return requiredSkills.some((req) => empSkills.includes(req));
    }
  });
}
