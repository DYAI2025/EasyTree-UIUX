import React from 'react';
import {
  DaySkillHeatmapResult,
  getAvailableEmployeesWithSkill,
} from '../../utils/skillHeatmapEngine';
import { Employee, Absence, WorksiteAssignment } from '../../types';
import {
  X,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  Users,
  HardHat,
  UserPlus,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface SkillHeatmapModalProps {
  evaluation: DaySkillHeatmapResult;
  employees: Employee[];
  absences: Absence[];
  assignments: WorksiteAssignment[];
  onClose: () => void;
  onAssignEmployeeQuick?: (employeeId: string, assignmentId: string) => void;
  isDarkMode?: boolean;
}

export const SkillHeatmapModal: React.FC<SkillHeatmapModalProps> = ({
  evaluation,
  employees,
  absences,
  assignments,
  onClose,
  onAssignEmployeeQuick,
  isDarkMode = true,
}) => {
  const dateFormatted = new Date(evaluation.date).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-hidden ${
          isDarkMode
            ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] text-[var(--wood-text-primary)] wood-grain-v'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--wood-border)]">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2.5 rounded-xl ${
                evaluation.heatLevel === 'CRITICAL_GAP'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : evaluation.heatLevel === 'SLIGHT_GAP'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-mono uppercase flex items-center gap-2">
                <span>Qualifikations-Heatmap Analyse</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--wood-base)] border border-[var(--wood-border)] text-[var(--wood-text-secondary)]">
                  {evaluation.coverageRatio}% Abdeckung
                </span>
              </h3>
              <p className="text-xs text-[var(--wood-text-secondary)] mt-0.5">{dateFormatted}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--wood-border)] text-[var(--wood-text-muted)] hover:text-white hover:bg-[var(--wood-raised)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Heatmap Stats Cards */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
            <span className="text-[10px] uppercase text-[var(--wood-text-muted)] font-bold block">
              Eingeplante Baustellen
            </span>
            <span className="text-xl font-mono font-bold mt-0.5 block">
              {evaluation.totalWorksitesCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
            <span className="text-[10px] uppercase text-[var(--wood-text-muted)] font-bold block">
              Geforderte Skills
            </span>
            <span className="text-xl font-mono font-bold text-amber-400 mt-0.5 block">
              {evaluation.totalRequiredSkillsCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
            <span className="text-[10px] uppercase text-[var(--wood-text-muted)] font-bold block">
              Fehlende Qualifikationen
            </span>
            <span
              className={`text-xl font-mono font-bold mt-0.5 block ${
                evaluation.missingSkillsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {evaluation.missingSkillsCount}
            </span>
          </div>
        </div>

        {/* Worksite Breakdown List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--wood-text-secondary)] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>Soll-Ist Soll-Qualifikation je Baustelle:</span>
          </h4>

          {evaluation.worksiteEvaluations.map((evalItem) => {
            const hasGaps = evalItem.missingSkills.length > 0 || evalItem.assignedEmployees.length === 0;

            return (
              <div
                key={evalItem.assignmentId}
                className={`p-4 rounded-xl border flex flex-col gap-3 ${
                  hasGaps
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-[var(--wood-base)] border-[var(--wood-border)]'
                }`}
              >
                {/* Worksite Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[var(--wood-border)]/50">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: evalItem.worksite.hexColor }}
                    />
                    <div>
                      <span className="font-bold text-sm text-[var(--wood-text-primary)]">
                        {evalItem.worksite.name}
                      </span>
                      <span className="text-xs text-[var(--wood-text-secondary)] ml-2 font-mono">
                        ({evalItem.worksite.code})
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      hasGaps ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {evalItem.skillCoveragePercent}% Abdeckung
                  </span>
                </div>

                {/* Team & Leader info */}
                <div className="text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[var(--wood-text-secondary)]">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Eingesetzte Mitarbeiter ({evalItem.assignedEmployees.length}):</span>
                    <span className="font-semibold text-white">
                      {evalItem.assignedEmployees.map((e) => `${e.firstName} ${e.lastName}`).join(', ') || 'Keine Mitarbeiter zugewiesen'}
                    </span>
                  </div>

                  {!evalItem.hasTeamLeader && (
                    <span className="text-[10px] text-amber-400 font-mono font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Kein Teamleiter!
                    </span>
                  )}
                </div>

                {/* Skills Checklist */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block">
                    Geforderte Spezialfähigkeiten:
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {evalItem.requiredSkills.map((reqSkill) => {
                      const isFulfilled = evalItem.fulfilledSkills.includes(reqSkill);
                      const fulfilledBy = evalItem.assignedEmployees.filter((e) =>
                        e.skills?.includes(reqSkill)
                      );

                      return (
                        <div
                          key={reqSkill}
                          className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
                            isFulfilled
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                          }`}
                        >
                          {isFulfilled ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span>{reqSkill}</span>
                          {isFulfilled ? (
                            <span className="text-[10px] text-emerald-400/80 font-mono">
                              ({fulfilledBy.map((e) => e.initials).join(', ')})
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-300 uppercase font-mono">
                              FEHLT
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Recommendation for Missing Skills */}
                {evalItem.missingSkills.length > 0 && (
                  <div className="mt-1 pt-2 border-t border-rose-500/30 text-xs space-y-2">
                    <span className="text-amber-300 font-semibold block flex items-center gap-1 text-[11px]">
                      <UserPlus className="w-3.5 h-3.5" />
                      Verfügbare Mitarbeiter mit fehlender Qualifikation:
                    </span>

                    {evalItem.missingSkills.map((missingSkill) => {
                      const availableCandidates = getAvailableEmployeesWithSkill({
                        dateIso: evaluation.date,
                        skill: missingSkill,
                        employees,
                        absences,
                        assignments,
                      });

                      return (
                        <div key={missingSkill} className="pl-2 border-l-2 border-amber-500/50 space-y-1">
                          <span className="text-[11px] font-mono text-amber-200 block">
                            Für "{missingSkill}":
                          </span>

                          <div className="flex flex-wrap gap-1.5">
                            {availableCandidates.length > 0 ? (
                              availableCandidates.map(({ employee, isAlreadyAssignedOnDate }) => (
                                <button
                                  key={employee.id}
                                  onClick={() =>
                                    onAssignEmployeeQuick?.(employee.id, evalItem.assignmentId)
                                  }
                                  className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition ${
                                    isAlreadyAssignedOnDate
                                      ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-500/40 font-semibold'
                                  }`}
                                  title={
                                    isAlreadyAssignedOnDate
                                      ? 'Bereits an diesem Tag eingeplant'
                                      : 'Klicken zum Zuweisen'
                                  }
                                >
                                  <span>
                                    + {employee.firstName} {employee.lastName} ({employee.role})
                                  </span>
                                  {isAlreadyAssignedOnDate && (
                                    <span className="text-[9px] text-amber-400">(Belegt)</span>
                                  )}
                                </button>
                              ))
                            ) : (
                              <span className="text-[10px] text-neutral-400 italic">
                                Kein verfügbarer Mitarbeiter besitzt "{missingSkill}".
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[var(--wood-border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--wood-raised)] hover:bg-[var(--wood-selected)] text-xs font-semibold rounded-xl border border-[var(--wood-border)]"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
