import React, { useState, useMemo } from 'react';
import {
  Employee,
  Worksite,
  WorksiteAssignment,
  Absence,
  Vehicle,
  Equipment,
} from '../../types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Award,
  Users,
  Building,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Filter,
  UserCheck,
  Sparkles,
  Zap,
  Calendar,
  Truck,
  Wrench,
  Plus,
  X,
  Check,
  UserPlus,
  Sliders,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  computeTeamRecommendation,
  TeamRecommendationResult,
} from '../../domain/teamRecommendationEngine';
import {
  calculateSkillMatch,
  getRecommendedEmployeesForWorksite,
} from '../../domain/skillRecommendationEngine';

interface SkillsMatrixDashboardProps {
  employees: Employee[];
  worksites: Worksite[];
  assignments: WorksiteAssignment[];
  vehicles?: Vehicle[];
  equipment?: Equipment[];
  absences?: Absence[];
  onSelectWorksite?: (worksiteId: string) => void;
  onAssignEmployeeQuick?: (employeeId: string, assignmentId: string) => void;
  onUpdateWorksite?: (worksite: Worksite) => void;
  onApplyTeamRecommendation?: (
    worksiteId: string,
    date: string,
    employeeIds: string[],
    vehicleIds: string[],
    equipmentIds: string[]
  ) => void;
  isDarkMode?: boolean;
}

export const SkillsMatrixDashboard: React.FC<SkillsMatrixDashboardProps> = ({
  employees,
  worksites,
  assignments,
  vehicles = [],
  equipment = [],
  absences = [],
  onSelectWorksite,
  onAssignEmployeeQuick,
  onUpdateWorksite,
  onApplyTeamRecommendation,
  isDarkMode = true,
}) => {
  // Filters
  const [selectedWorksiteId, setSelectedWorksiteId] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');

  // TEAM SETUP RECOMMENDATION STATE
  const [recTargetDate, setRecTargetDate] = useState<string>('2026-09-14');
  const [recWorksiteId, setRecWorksiteId] = useState<string>(
    worksites[0]?.id || ''
  );
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [showSkillConfig, setShowSkillConfig] = useState<boolean>(false);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string | null>(null);

  // Master List of unique skills across system
  const allSkillsList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => e.skills?.forEach((s) => set.add(s)));
    worksites.forEach((w) => w.requiredSkills?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [employees, worksites]);

  // Selected Worksite object for Team Setup
  const activeRecWorksite = useMemo(() => {
    return worksites.find((w) => w.id === recWorksiteId) || worksites[0] || null;
  }, [worksites, recWorksiteId]);

  // Compute Team Recommendation via Domain Engine
  const recommendationResult: TeamRecommendationResult | null = useMemo(() => {
    if (!activeRecWorksite) return null;
    return computeTeamRecommendation(
      activeRecWorksite,
      recTargetDate,
      employees,
      vehicles,
      equipment,
      assignments,
      absences
    );
  }, [activeRecWorksite, recTargetDate, employees, vehicles, equipment, assignments, absences]);

  // Filtered Assignments according to selected worksite
  const filteredAssignments = useMemo(() => {
    if (selectedWorksiteId !== 'ALL') {
      return assignments.filter((a) => a.worksiteId === selectedWorksiteId);
    }
    return assignments;
  }, [assignments, selectedWorksiteId]);

  // Filtered Employees according to Role and Skill
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (selectedRoleFilter !== 'ALL' && e.role !== selectedRoleFilter) {
        return false;
      }
      if (selectedSkillFilter !== 'ALL' && !e.skills?.includes(selectedSkillFilter)) {
        return false;
      }
      return true;
    });
  }, [employees, selectedRoleFilter, selectedSkillFilter]);

  // Radar Data Computation
  const radarChartData = useMemo(() => {
    return allSkillsList.map((skillName) => {
      const totalStaffWithSkill = employees.filter((e) => e.skills?.includes(skillName)).length;

      const targetWorksites =
        selectedWorksiteId === 'ALL'
          ? worksites
          : worksites.filter((w) => w.id === selectedWorksiteId);

      const requiredInWorksites = targetWorksites.filter((w) =>
        w.requiredSkills?.includes(skillName)
      ).length;

      const assignedEmployeeIds = new Set(
        filteredAssignments.flatMap((a) => a.assignedEmployeeIds)
      );

      const assignedStaffWithSkill = Array.from(assignedEmployeeIds)
        .map((id) => employees.find((e) => e.id === id))
        .filter((e): e is Employee => Boolean(e) && Boolean(e.skills?.includes(skillName))).length;

      const coveragePercent =
        requiredInWorksites > 0
          ? Math.min(Math.round((assignedStaffWithSkill / requiredInWorksites) * 100), 120)
          : totalStaffWithSkill > 0
          ? 100
          : 0;

      return {
        skill: skillName,
        'Verfügbare Mitarbeiter': totalStaffWithSkill,
        'Geforderte Baustellen': requiredInWorksites,
        'Eingesetzte Mitarbeiter': assignedStaffWithSkill,
        Deckung: coveragePercent,
      };
    });
  }, [allSkillsList, employees, worksites, filteredAssignments, selectedWorksiteId]);

  // Skill Deficit / Gap Breakdown
  const skillGapMetrics = useMemo(() => {
    let criticalGapsCount = 0;
    let warningGapsCount = 0;
    const missingSkillsList: { skill: string; required: number; assigned: number; gap: number }[] = [];

    radarChartData.forEach((item) => {
      if (item['Geforderte Baustellen'] > item['Eingesetzte Mitarbeiter']) {
        const gap = item['Geforderte Baustellen'] - item['Eingesetzte Mitarbeiter'];
        missingSkillsList.push({
          skill: item.skill,
          required: item['Geforderte Baustellen'],
          assigned: item['Eingesetzte Mitarbeiter'],
          gap,
        });

        if (item['Eingesetzte Mitarbeiter'] === 0) {
          criticalGapsCount++;
        } else {
          warningGapsCount++;
        }
      }
    });

    return {
      criticalGapsCount,
      warningGapsCount,
      missingSkillsList: missingSkillsList.sort((a, b) => b.gap - a.gap),
    };
  }, [radarChartData]);

  // Add skill requirement to active worksite
  const handleAddRequiredSkill = (skill: string) => {
    if (!activeRecWorksite || !skill.trim()) return;
    const current = activeRecWorksite.requiredSkills || [];
    if (current.includes(skill.trim())) return;

    const updated: Worksite = {
      ...activeRecWorksite,
      requiredSkills: [...current, skill.trim()],
    };

    if (onUpdateWorksite) {
      onUpdateWorksite(updated);
    }
    setNewSkillInput('');
  };

  // Remove skill requirement from active worksite
  const handleRemoveRequiredSkill = (skillToRemove: string) => {
    if (!activeRecWorksite) return;
    const updated: Worksite = {
      ...activeRecWorksite,
      requiredSkills: (activeRecWorksite.requiredSkills || []).filter(
        (s) => s !== skillToRemove
      ),
    };

    if (onUpdateWorksite) {
      onUpdateWorksite(updated);
    }
  };

  // Apply full team recommendation
  const handleApplyRecommendation = () => {
    if (!recommendationResult || !activeRecWorksite) return;

    const leaderId = recommendationResult.suggestedLeader?.employee.id;
    const workerIds = recommendationResult.suggestedWorkers.map((w) => w.employee.id);
    const empIds = Array.from(new Set([...(leaderId ? [leaderId] : []), ...workerIds]));

    const vehicleIds = recommendationResult.suggestedVehicles.map((v) => v.item.id);
    const equipmentIds = recommendationResult.suggestedEquipment.map((e) => e.item.id);

    if (onApplyTeamRecommendation) {
      onApplyTeamRecommendation(
        activeRecWorksite.id,
        recTargetDate,
        empIds,
        vehicleIds,
        equipmentIds
      );
    }

    setAssignSuccessMsg(
      `Team (${empIds.length} Mitarbeiter, ${vehicleIds.length} Fahrzeuge, ${equipmentIds.length} Geräte) wurde erfolgreich der Baustelle ${activeRecWorksite.code} für den ${recTargetDate} zugewiesen!`
    );

    setTimeout(() => {
      setAssignSuccessMsg(null);
    }, 6000);
  };

  return (
    <div
      className={`min-h-screen p-3 sm:p-4 md:p-6 font-["Zag",_ui-sans-serif,_system-ui] transition-colors ${
        isDarkMode
          ? 'bg-[var(--wood-dark)] text-[var(--wood-text-primary)]'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      <div className="max-w-[1800px] mx-auto space-y-4 sm:space-y-6">
        {/* TOP HEADER & DASHBOARD SUMMARY */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 ${
            isDarkMode
              ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] wood-grain-h'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400 shrink-0">
              <Award className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg md:text-xl font-bold font-mono uppercase tracking-tight">
                  Team Qualifikations-Matrix & Team-Setup Empfehlungen
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GF & Admin Modul
                </span>
              </div>
              <p className="text-xs text-[var(--wood-text-secondary)] mt-1 hidden sm:block">
                Ermittelt freie Kapazitäten, vergleicht Baustellen-Qualifikationen und schlägt optimale Teams für Mitarbeiter & Ressourcen vor.
              </p>
            </div>
          </div>

          {/* Quick KPI Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block truncate">
                Mitarbeiter
              </span>
              <span className="text-lg sm:text-xl font-mono font-bold text-sky-400 mt-0.5 block">
                {employees.length}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block truncate">
                Zertifikate
              </span>
              <span className="text-lg sm:text-xl font-mono font-bold text-emerald-400 mt-0.5 block">
                {allSkillsList.length}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block truncate">
                Baustellen
              </span>
              <span className="text-lg sm:text-xl font-mono font-bold text-amber-400 mt-0.5 block">
                {worksites.length}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block truncate">
                Engpässe
              </span>
              <span
                className={`text-lg sm:text-xl font-mono font-bold mt-0.5 block ${
                  skillGapMetrics.criticalGapsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {skillGapMetrics.missingSkillsList.length}
              </span>
            </div>
          </div>
        </div>

        {/* SUCCESS ALERT TOAST */}
        {assignSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{assignSuccessMsg}</span>
            </div>
            <button
              onClick={() => setAssignSuccessMsg(null)}
              className="p-1 rounded hover:bg-emerald-500/30 text-emerald-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 1: BAUSTELLEN-TEAM-SETUP EMPFEHLUNGEN (GF & ADMIN PANEL) */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border shadow-xl flex flex-col gap-6 transition-all ${
            isDarkMode
              ? 'bg-gradient-to-br from-[var(--wood-panel)] via-[var(--wood-panel)] to-emerald-950/20 border-[var(--wood-border)]'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--wood-border)]">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h2 className="text-base sm:text-lg font-bold font-mono uppercase tracking-tight text-[var(--wood-text-primary)]">
                  Baustellen-Team-Setup Empfehlungen
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  KI / Qualifikations-Matching
                </span>
              </div>
              <p className="text-xs text-[var(--wood-text-secondary)] mt-1">
                Gleicht freie Mitarbeiter und Ressourcen für ein bestimmtes Datum mit den geforderten Zertifikaten der Baustelle ab.
              </p>
            </div>

            {/* Date & Worksite Selection Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Input */}
              <div className="flex items-center space-x-2 bg-[var(--wood-base)] border border-[var(--wood-border)] px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <label className="text-[11px] font-bold text-[var(--wood-text-muted)] uppercase">
                  Datum:
                </label>
                <input
                  type="date"
                  value={recTargetDate}
                  onChange={(e) => setRecTargetDate(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-[var(--wood-text-primary)] outline-none cursor-pointer"
                />
              </div>

              {/* Worksite Selector */}
              <div className="flex items-center space-x-2 bg-[var(--wood-base)] border border-[var(--wood-border)] px-3 py-1.5 rounded-xl">
                <Building className="w-4 h-4 text-amber-400 shrink-0" />
                <label className="text-[11px] font-bold text-[var(--wood-text-muted)] uppercase">
                  Baustelle:
                </label>
                <select
                  value={recWorksiteId}
                  onChange={(e) => setRecWorksiteId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[var(--wood-text-primary)] outline-none cursor-pointer max-w-[220px] truncate"
                >
                  {worksites.map((w) => (
                    <option key={w.id} value={w.id} className="bg-neutral-900 text-white">
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Skill Requirements Configurator */}
              <button
                onClick={() => setShowSkillConfig((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition flex items-center space-x-1.5 ${
                  showSkillConfig
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-muted)] hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Anforderungen (GF/Admin)</span>
              </button>
            </div>
          </div>

          {/* GF / Admin Requirements Configurator (Collapsible) */}
          {showSkillConfig && activeRecWorksite && (
            <div className="p-4 rounded-xl bg-[var(--wood-base)] border border-amber-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Geforderte Qualifikationen für {activeRecWorksite.code} ({activeRecWorksite.name}) anpassen</span>
                </span>
                <span className="text-[11px] text-[var(--wood-text-muted)]">
                  Durch GF oder Admin manuell festgelegt
                </span>
              </div>

              {/* Current Required Skills Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {(activeRecWorksite.requiredSkills || []).length > 0 ? (
                  activeRecWorksite.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    >
                      <span>{sk}</span>
                      <button
                        onClick={() => handleRemoveRequiredSkill(sk)}
                        className="hover:text-rose-400 transition"
                        title="Qualifikation entfernen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--wood-text-muted)] italic">
                    Keine spezifischen Qualifikationsanforderungen definiert.
                  </span>
                )}
              </div>

              {/* Add New Skill Input */}
              <div className="flex items-center space-x-2 pt-2 border-t border-[var(--wood-border)]">
                <input
                  type="text"
                  placeholder="Zertifikat hinzufügen (z.B. SKT-B, LKW C1E, Ersthelfer)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequiredSkill(newSkillInput);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--wood-panel)] border border-[var(--wood-border)] text-xs text-[var(--wood-text-primary)] outline-none focus:border-amber-400 flex-1 max-w-md"
                />
                <button
                  onClick={() => handleAddRequiredSkill(newSkillInput)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Qualifikation hinzufügen</span>
                </button>
              </div>
            </div>
          )}

          {/* Recommendation Overview Stats & Match Score */}
          {recommendationResult && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Overall Match Score Card */}
              <div className="md:col-span-4 p-4 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[var(--wood-text-muted)]">
                    Soll-Ist Match Score
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      recommendationResult.overallMatchPercent >= 100
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : recommendationResult.overallMatchPercent >= 50
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {recommendationResult.overallMatchPercent}% Abdeckung
                  </span>
                </div>

                {/* Match Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        recommendationResult.overallMatchPercent >= 100
                          ? 'bg-emerald-500'
                          : recommendationResult.overallMatchPercent >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, recommendationResult.overallMatchPercent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--wood-text-muted)] font-mono">
                    <span>{recommendationResult.coveredSkills.length} abgedeckt</span>
                    <span>{recommendationResult.missingSkills.length} fehlend</span>
                  </div>
                </div>

                {/* Free Capacity Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--wood-border)] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--wood-text-muted)] block">Frei Staff</span>
                    <span className="font-mono font-bold text-sky-400">
                      {recommendationResult.freeEmployees.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--wood-text-muted)] block">Frei Veh.</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {recommendationResult.freeVehicles.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--wood-text-muted)] block">Frei Eq.</span>
                    <span className="font-mono font-bold text-amber-400">
                      {recommendationResult.freeEquipment.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Team Setup Cards */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Recommended Leader */}
                <div className="p-3.5 rounded-xl bg-[var(--wood-base)] border border-amber-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Teamleiter</span>
                      </span>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300">
                        Empfohlen
                      </span>
                    </div>

                    {recommendationResult.suggestedLeader ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/40">
                            {recommendationResult.suggestedLeader.employee.initials}
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-xs text-[var(--wood-text-primary)] block truncate">
                              {recommendationResult.suggestedLeader.employee.firstName}{' '}
                              {recommendationResult.suggestedLeader.employee.lastName}
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono block">
                              {recommendationResult.suggestedLeader.employee.role}
                            </span>
                          </div>
                        </div>

                        {/* Leader Skills */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(recommendationResult.suggestedLeader.matchingSkills || []).map((sk) => (
                            <span
                              key={sk}
                              className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            >
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                        Kein freier Teamleiter an diesem Tag verfügbar.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Recommended Workers */}
                <div className="p-3.5 rounded-xl bg-[var(--wood-base)] border border-sky-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-sky-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Fachkräfte / Kletterer</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--wood-text-muted)]">
                        {recommendationResult.suggestedWorkers.length} gewählt
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                      {recommendationResult.suggestedWorkers.length > 0 ? (
                        recommendationResult.suggestedWorkers.map((worker) => (
                          <div
                            key={worker.employee.id}
                            className="p-1.5 rounded-lg bg-[var(--wood-panel)] border border-[var(--wood-border)] flex items-center justify-between text-xs"
                          >
                            <div className="truncate">
                              <span className="font-semibold text-[var(--wood-text-primary)] block truncate">
                                {worker.employee.firstName} {worker.employee.lastName}
                              </span>
                              <span className="text-[9px] text-[var(--wood-text-muted)] font-mono block">
                                {worker.employee.role}
                              </span>
                            </div>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              {worker.matchScorePercent}%
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[11px] text-[var(--wood-text-muted)] italic block">
                          Keine freien Fachkräfte verfügbar.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Recommended Resources */}
                <div className="p-3.5 rounded-xl bg-[var(--wood-base)] border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Fahrzeuge & Geräte</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--wood-text-muted)]">
                        Ressourcen
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                      {recommendationResult.suggestedVehicles.map((v) => (
                        <div
                          key={v.item.id}
                          className="p-1.5 rounded-lg bg-[var(--wood-panel)] border border-[var(--wood-border)] flex items-center justify-between text-[11px]"
                        >
                          <span className="truncate font-medium text-emerald-300">
                            🚚 {v.item.name} ({v.item.licensePlate})
                          </span>
                        </div>
                      ))}
                      {recommendationResult.suggestedEquipment.map((eq) => (
                        <div
                          key={eq.item.id}
                          className="p-1.5 rounded-lg bg-[var(--wood-panel)] border border-[var(--wood-border)] flex items-center justify-between text-[11px]"
                        >
                          <span className="truncate font-medium text-amber-300">
                            🔧 {eq.item.name}
                          </span>
                        </div>
                      ))}
                      {recommendationResult.suggestedVehicles.length === 0 &&
                        recommendationResult.suggestedEquipment.length === 0 && (
                          <span className="text-[11px] text-[var(--wood-text-muted)] italic block">
                            Keine freien Fahrzeuge/Geräte.
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Button */}
          <div className="pt-3 border-t border-[var(--wood-border)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-[var(--wood-text-secondary)] font-mono">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>
                Empfohlenes Team-Setup basiert auf Echzeit-Verfügbarkeit & Zertifikats-Matching
              </span>
            </div>

            <button
              onClick={handleApplyRecommendation}
              disabled={
                !recommendationResult ||
                (recommendationResult.suggestedWorkers.length === 0 &&
                  !recommendationResult.suggestedLeader)
              }
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs uppercase tracking-wide shadow-lg shadow-emerald-950/40 transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Vorgeschlagenes Team-Setup für {recTargetDate} zuweisen</span>
            </button>
          </div>
        </div>

        {/* CONTROLS & FILTER BAR */}
        <div
          className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
            isDarkMode
              ? 'bg-[var(--wood-panel)] border-[var(--wood-border)]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Worksite Filter */}
            <div className="flex items-center space-x-2 bg-[var(--wood-base)] border border-[var(--wood-border)] px-3 py-1.5 rounded-lg">
              <Building className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-[var(--wood-text-muted)] uppercase">
                Baustelle:
              </label>
              <select
                value={selectedWorksiteId}
                onChange={(e) => setSelectedWorksiteId(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-neutral-900 text-white">
                  Alle Baustellen im Fokus
                </option>
                {worksites.map((w) => (
                  <option key={w.id} value={w.id} className="bg-neutral-900 text-white">
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2 bg-[var(--wood-base)] border border-[var(--wood-border)] px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-sky-400" />
              <label className="text-xs font-bold text-[var(--wood-text-muted)] uppercase">
                Rolle:
              </label>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-neutral-900 text-white">
                  Alle Rollen
                </option>
                <option value="Teamleiter" className="bg-neutral-900 text-white">
                  Teamleiter
                </option>
                <option value="SKT-Kletterer" className="bg-neutral-900 text-white">
                  SKT-Kletterer
                </option>
                <option value="Baumpfleger" className="bg-neutral-900 text-white">
                  Baumpfleger
                </option>
                <option value="Maschinist" className="bg-neutral-900 text-white">
                  Maschinist
                </option>
                <option value="Auszubildender" className="bg-neutral-900 text-white">
                  Auszubildender
                </option>
              </select>
            </div>

            {/* Skill Filter */}
            <div className="flex items-center space-x-2 bg-[var(--wood-base)] border border-[var(--wood-border)] px-3 py-1.5 rounded-lg">
              <Award className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-bold text-[var(--wood-text-muted)] uppercase">
                Spezifische Qualifikation:
              </label>
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-neutral-900 text-white">
                  Alle Qualifikationen
                </option>
                {allSkillsList.map((s) => (
                  <option key={s} value={s} className="bg-neutral-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {(selectedWorksiteId !== 'ALL' || selectedRoleFilter !== 'ALL' || selectedSkillFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedWorksiteId('ALL');
                setSelectedRoleFilter('ALL');
                setSelectedSkillFilter('ALL');
              }}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>

        {/* MAIN VISUALIZATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* RADAR CHART PANEL (7 COLS) */}
          <div
            className={`lg:col-span-7 p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
              isDarkMode
                ? 'bg-[var(--wood-panel)] border-[var(--wood-border)]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--wood-border)]">
              <div>
                <h3 className="text-base font-bold font-mono uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Soll-Ist Skill-Radar (Qualifikations-Deckung)</span>
                </h3>
                <p className="text-xs text-[var(--wood-text-secondary)] mt-0.5">
                  Visualisiert Soll-Anforderungen (Baustellen) vs. Ist-Bestand (Team-Qualifikationen)
                </p>
              </div>
            </div>

            {/* Radar Chart Component */}
            <div className="w-full h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                  <PolarGrid stroke={isDarkMode ? '#3f3f46' : '#cbd5e1'} />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: isDarkMode ? '#e4e4e7' : '#334155', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 'dataMax + 2']}
                    tick={{ fill: isDarkMode ? '#71717a' : '#64748b', fontSize: 10 }}
                  />
                  <Radar
                    name="Verfügbare Mitarbeiter"
                    dataKey="Verfügbare Mitarbeiter"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Geforderte Baustellen"
                    dataKey="Geforderte Baustellen"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name="Eingesetzte Mitarbeiter"
                    dataKey="Eingesetzte Mitarbeiter"
                    stroke="#38bdf8"
                    fill="#38bdf8"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                      borderColor: isDarkMode ? '#3f3f46' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '0.75rem',
                      color: isDarkMode ? '#f4f4f5' : '#0f172a',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Insights Footer */}
            <div className="pt-4 border-t border-[var(--wood-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hohe Deckung bei AS Baum I & Ersthelfer</span>
              </div>
              {skillGapMetrics.criticalGapsCount > 0 && (
                <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  <span>{skillGapMetrics.criticalGapsCount} Qualifikationslücke(n) ermittelt</span>
                </div>
              )}
            </div>
          </div>

          {/* GAP ANALYSIS & RECOMMENDATION CARDS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Critical Skill Gaps Card */}
            <div
              className={`p-6 rounded-2xl border shadow-lg flex flex-col gap-4 ${
                isDarkMode
                  ? 'bg-[var(--wood-panel)] border-[var(--wood-border)]'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--wood-border)]">
                <h3 className="text-base font-bold font-mono uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Qualifikations-Engpass Analyse</span>
                </h3>
                <span className="text-xs text-[var(--wood-text-secondary)] font-mono">
                  Soll vs. Ist
                </span>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                {skillGapMetrics.missingSkillsList.length > 0 ? (
                  skillGapMetrics.missingSkillsList.map((item) => (
                    <div
                      key={item.skill}
                      className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-rose-300 font-mono">
                            {item.skill}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/30 text-rose-200 font-bold uppercase">
                            Lücke: -{item.gap}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--wood-text-secondary)] mt-0.5">
                          Gefordert auf {item.required} Baustelle(n), derzeit nur {item.assigned}{' '}
                          Mitarbeiter mit Zertifikat zugewiesen.
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedSkillFilter(item.skill)}
                        className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition shrink-0"
                        title="Qualifikation filtern"
                      >
                        <Filter className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Alle Qualifikationen abgedeckt!</span>
                      <span className="text-[11px] text-emerald-300/80">
                        Für die aktuellen Baustellen sind alle geforderten Zertifikate in den Teams vorhanden.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Management Recommendations */}
            <div
              className={`p-6 rounded-2xl border shadow-lg flex flex-col gap-3 ${
                isDarkMode
                  ? 'bg-[var(--wood-panel)] border-[var(--wood-border)]'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-sm font-bold font-mono uppercase flex items-center gap-2 text-amber-400">
                <Zap className="w-4 h-4" />
                <span>Empfohlene Schulungen & Einsatzoptimierung</span>
              </h3>

              <div className="space-y-2.5 text-xs text-[var(--wood-text-secondary)]">
                <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--wood-text-primary)] block">
                      SKT-B Kletterer Kapazität erhöhen
                    </span>
                    <span>
                      2 Baumpfleger besitzen bereits SKT-A. Eine Fortbildung zu SKT-B sichert künftige Großbaumfällungen ab.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--wood-text-primary)] block">
                      Teamleiter-Spreizung
                    </span>
                    <span>
                      Verteilen Sie Martin Schuster und Jana Weber auf unterschiedliche Kolonnen, um zwei vollwertige Einsatzteams abzudecken.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED STAFF SKILL MATRIX TABLE */}
        <div
          className={`p-6 rounded-2xl border shadow-lg flex flex-col gap-4 ${
            isDarkMode
              ? 'bg-[var(--wood-panel)] border-[var(--wood-border)]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--wood-border)]">
            <div>
              <h3 className="text-base font-bold font-mono uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Mitarbeiter Qualifikations-Matrix (Detailübersicht)</span>
              </h3>
              <p className="text-xs text-[var(--wood-text-secondary)] mt-0.5">
                Zeigt alle erfassten Mitarbeiter und deren nachgewiesene Fachzertifikate & Befähigungen
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-[var(--wood-text-muted)]">
              {filteredEmployees.length} von {employees.length} Mitarbeitern angezeigt
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-[var(--wood-border)] bg-[var(--wood-base)] text-[var(--wood-text-muted)] font-mono uppercase">
                  <th className="p-3 font-bold sticky left-0 z-10 bg-[var(--wood-panel)] border-r border-[var(--wood-border)]">
                    Mitarbeiter
                  </th>
                  <th className="p-3 font-bold">Rolle</th>
                  <th className="p-3 font-bold">Status</th>
                  {allSkillsList.map((skill) => (
                    <th key={skill} className="p-3 font-bold text-center">
                      <span className="truncate max-w-[100px] inline-block" title={skill}>
                        {skill}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--wood-border)]/50">
                {filteredEmployees.map((emp) => {
                  const empSkillsSet = new Set(emp.skills || []);

                  const activeSelectedWorksite =
                    selectedWorksiteId !== 'ALL'
                      ? worksites.find((w) => w.id === selectedWorksiteId)
                      : activeRecWorksite;

                  const matchInfo =
                    activeSelectedWorksite &&
                    (activeSelectedWorksite.requiredSkills || []).length > 0
                      ? calculateSkillMatch(emp, activeSelectedWorksite.requiredSkills)
                      : null;

                  let rowMatchClass = 'hover:bg-[var(--wood-raised)]/50 transition-colors';
                  if (matchInfo) {
                    if (matchInfo.isFullyQualified) {
                      rowMatchClass =
                        'bg-emerald-950/25 hover:bg-emerald-900/35 border-l-4 border-l-emerald-500 transition-colors';
                    } else if (matchInfo.matchScorePercent > 0) {
                      rowMatchClass =
                        'bg-amber-950/15 hover:bg-amber-900/25 border-l-4 border-l-amber-500/80 transition-colors';
                    }
                  }

                  return (
                    <tr
                      key={emp.id}
                      className={`skills-matrix-row ${rowMatchClass}`}
                    >
                      {/* Name & Initials */}
                      <td className="p-3 font-semibold sticky left-0 z-10 bg-[var(--wood-panel)] border-r border-[var(--wood-border)] shadow-sm">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 font-mono font-bold text-xs flex items-center justify-center border border-sky-500/30 shrink-0">
                            {emp.initials}
                          </span>
                          <div className="truncate max-w-[130px] sm:max-w-none">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[var(--wood-text-primary)] font-bold block truncate">
                                {emp.firstName} {emp.lastName}
                              </span>
                              {matchInfo && matchInfo.isFullyQualified && (
                                <span
                                  className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0"
                                  title="100% Qualifikations-Deckung"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  Match
                                </span>
                              )}
                              {matchInfo &&
                                !matchInfo.isFullyQualified &&
                                matchInfo.matchScorePercent > 0 && (
                                  <span
                                    className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0"
                                    title={`${matchInfo.matchScorePercent}% Qualifikations-Deckung`}
                                  >
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    {matchInfo.matchScorePercent}%
                                  </span>
                                )}
                            </div>
                            <span className="text-[10px] text-[var(--wood-text-muted)] font-mono truncate block">
                              {emp.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            emp.isLeader
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                          }`}
                        >
                          {emp.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3 font-mono text-[11px]">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Aktiv
                        </span>
                      </td>

                      {/* Skill Check Columns */}
                      {allSkillsList.map((skill) => {
                        const hasSkill = empSkillsSet.has(skill);

                        return (
                          <td key={skill} className="p-3 text-center">
                            {hasSkill ? (
                              <span
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold"
                                title={`${emp.firstName} besitzt ${skill}`}
                              >
                                ✓
                              </span>
                            ) : (
                              <span className="text-neutral-600 font-mono text-[10px]">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
