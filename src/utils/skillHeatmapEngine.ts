import {
  WorksiteAssignment,
  Worksite,
  Employee,
  Absence,
} from '../types';

export type SkillHeatLevel = 'NONE' | 'OPTIMAL' | 'SLIGHT_GAP' | 'CRITICAL_GAP';

export interface WorksiteSkillEvaluation {
  assignmentId: string;
  worksite: Worksite;
  assignedEmployees: Employee[];
  requiredSkills: string[];
  fulfilledSkills: string[];
  missingSkills: string[];
  hasTeamLeader: boolean;
  isFullyStaffed: boolean;
  skillCoveragePercent: number;
}

export interface DaySkillHeatmapResult {
  date: string;
  heatLevel: SkillHeatLevel;
  coverageRatio: number; // 0 to 100
  totalWorksitesCount: number;
  worksitesWithGapsCount: number;
  totalRequiredSkillsCount: number;
  missingSkillsCount: number;
  uniqueMissingSkills: string[];
  worksiteEvaluations: WorksiteSkillEvaluation[];
}

/**
 * Evaluates skill coverage for a single date across all scheduled worksites.
 */
export function evaluateDaySkillCoverage({
  dateIso,
  assignments,
  worksites,
  employees,
  absences = [],
}: {
  dateIso: string;
  assignments: WorksiteAssignment[];
  worksites: Worksite[];
  employees: Employee[];
  absences?: Absence[];
}): DaySkillHeatmapResult {
  const dayAssignments = assignments.filter((a) => a.date === dateIso);

  if (dayAssignments.length === 0) {
    return {
      date: dateIso,
      heatLevel: 'NONE',
      coverageRatio: 100,
      totalWorksitesCount: 0,
      worksitesWithGapsCount: 0,
      totalRequiredSkillsCount: 0,
      missingSkillsCount: 0,
      uniqueMissingSkills: [],
      worksiteEvaluations: [],
    };
  }

  const employeeMap = new Map<string, Employee>(employees.map((e) => [e.id, e]));
  const worksiteMap = new Map<string, Worksite>(worksites.map((w) => [w.id, w]));

  const worksiteEvaluations: WorksiteSkillEvaluation[] = [];
  let totalRequiredSkillsCount = 0;
  let totalFulfilledSkillsCount = 0;
  const missingSkillsSet = new Set<string>();

  for (const asg of dayAssignments) {
    const site = worksiteMap.get(asg.worksiteId);
    if (!site) continue;

    // Filter out absent employees for that date
    const assignedEmps = asg.assignedEmployeeIds
      .map((id) => employeeMap.get(id))
      .filter((e): e is Employee => Boolean(e))
      .filter((e) => {
        const isAbsent = absences.some(
          (abs) =>
            abs.employeeId === e.id &&
            abs.status === 'genehmigt' &&
            dateIso >= abs.startDate &&
            dateIso <= abs.endDate
        );
        return !isAbsent;
      });

    const requiredSkills = site.requiredSkills || [];
    const teamSkillsSet = new Set<string>(assignedEmps.flatMap((e) => e.skills || []));

    const fulfilledSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of requiredSkills) {
      if (teamSkillsSet.has(skill)) {
        fulfilledSkills.push(skill);
      } else {
        missingSkills.push(skill);
        missingSkillsSet.add(skill);
      }
    }

    const hasTeamLeader = assignedEmps.some((e) => e.isLeader || e.role === 'Teamleiter');
    const isFullyStaffed = missingSkills.length === 0 && assignedEmps.length > 0;

    const skillCoveragePercent =
      requiredSkills.length > 0
        ? Math.round((fulfilledSkills.length / requiredSkills.length) * 100)
        : assignedEmps.length > 0
        ? 100
        : 0;

    totalRequiredSkillsCount += requiredSkills.length;
    totalFulfilledSkillsCount += fulfilledSkills.length;

    worksiteEvaluations.push({
      assignmentId: asg.id,
      worksite: site,
      assignedEmployees: assignedEmps,
      requiredSkills,
      fulfilledSkills,
      missingSkills,
      hasTeamLeader,
      isFullyStaffed,
      skillCoveragePercent,
    });
  }

  const worksitesWithGapsCount = worksiteEvaluations.filter(
    (e) => e.missingSkills.length > 0 || e.assignedEmployees.length === 0
  ).length;

  const missingSkillsCount = Array.from(missingSkillsSet).length;

  const overallRatio =
    totalRequiredSkillsCount > 0
      ? Math.round((totalFulfilledSkillsCount / totalRequiredSkillsCount) * 100)
      : worksitesWithGapsCount === 0
      ? 100
      : 50;

  // Determine Heat Level
  let heatLevel: SkillHeatLevel = 'OPTIMAL';
  if (worksitesWithGapsCount > 0) {
    if (
      overallRatio < 70 ||
      missingSkillsSet.has('SKT-B Klettern') ||
      missingSkillsSet.has('AS Baum I') ||
      missingSkillsSet.has('AS Baum II') ||
      worksiteEvaluations.some((e) => e.assignedEmployees.length === 0)
    ) {
      heatLevel = 'CRITICAL_GAP';
    } else {
      heatLevel = 'SLIGHT_GAP';
    }
  }

  return {
    date: dateIso,
    heatLevel,
    coverageRatio: overallRatio,
    totalWorksitesCount: dayAssignments.length,
    worksitesWithGapsCount,
    totalRequiredSkillsCount,
    missingSkillsCount,
    uniqueMissingSkills: Array.from(missingSkillsSet),
    worksiteEvaluations,
  };
}

/**
 * Returns helper styling classes for heatmap intensity.
 */
export function getSkillHeatmapStyles(heatLevel: SkillHeatLevel, isDarkMode = true) {
  switch (heatLevel) {
    case 'CRITICAL_GAP':
      return {
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/70',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
        badgeBg: 'bg-rose-500 text-white font-bold',
        pillBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        iconColor: 'text-rose-400',
        intensityLabel: 'Kritische Qualifikationslücke',
      };
    case 'SLIGHT_GAP':
      return {
        bg: 'bg-amber-950/30',
        border: 'border-amber-500/60',
        glow: 'shadow-[0_0_8px_rgba(245,158,11,0.2)]',
        badgeBg: 'bg-amber-500 text-neutral-950 font-bold',
        pillBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        iconColor: 'text-amber-400',
        intensityLabel: 'Mäßige Deckungslücke',
      };
    case 'OPTIMAL':
      return {
        bg: isDarkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/80',
        border: 'border-emerald-500/30',
        glow: '',
        badgeBg: 'bg-emerald-600 text-white font-semibold',
        pillBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        iconColor: 'text-emerald-400',
        intensityLabel: 'Qualifikationen vollständig',
      };
    default:
      return {
        bg: 'bg-transparent',
        border: 'border-transparent',
        glow: '',
        badgeBg: 'bg-neutral-800 text-neutral-400',
        pillBg: 'bg-neutral-800/50 text-neutral-400 border-neutral-700/50',
        iconColor: 'text-neutral-500',
        intensityLabel: 'Kein Einsatz',
      };
  }
}

/**
 * Finds available employees on a date who possess a specified missing skill.
 */
export function getAvailableEmployeesWithSkill({
  dateIso,
  skill,
  employees,
  absences = [],
  assignments = [],
}: {
  dateIso: string;
  skill: string;
  employees: Employee[];
  absences?: Absence[];
  assignments?: WorksiteAssignment[];
}): { employee: Employee; isAlreadyAssignedOnDate: boolean }[] {
  return employees
    .filter((e) => e.skills && e.skills.includes(skill))
    .filter((e) => {
      // Exclude absent
      const isAbsent = absences.some(
        (abs) =>
          abs.employeeId === e.id &&
          abs.status === 'genehmigt' &&
          dateIso >= abs.startDate &&
          dateIso <= abs.endDate
      );
      return !isAbsent;
    })
    .map((e) => {
      const dayAssignments = assignments.filter((a) => a.date === dateIso);
      const isAlreadyAssignedOnDate = dayAssignments.some((a) =>
        a.assignedEmployeeIds.includes(e.id)
      );
      return { employee: e, isAlreadyAssignedOnDate };
    });
}
