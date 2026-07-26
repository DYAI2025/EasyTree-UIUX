import React, { useState, useMemo } from 'react';
import {
  Employee,
  Worksite,
  WorksiteAssignment,
  Absence,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Award,
  Users,
  Building,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Filter,
  UserCheck,
  UserX,
  Sparkles,
  Zap,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';

interface SkillsMatrixDashboardProps {
  employees: Employee[];
  worksites: Worksite[];
  assignments: WorksiteAssignment[];
  absences?: Absence[];
  onSelectWorksite?: (worksiteId: string) => void;
  onAssignEmployeeQuick?: (employeeId: string, assignmentId: string) => void;
  isDarkMode?: boolean;
}

export const SkillsMatrixDashboard: React.FC<SkillsMatrixDashboardProps> = ({
  employees,
  worksites,
  assignments,
  absences = [],
  onSelectWorksite,
  onAssignEmployeeQuick,
  isDarkMode = true,
}) => {
  // Filters
  const [selectedWorksiteId, setSelectedWorksiteId] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'MONTH' | 'WEEK' | 'ALL'>('MONTH');

  // Master List of unique skills across system
  const allSkillsList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => e.skills?.forEach((s) => set.add(s)));
    worksites.forEach((w) => w.requiredSkills?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [employees, worksites]);

  // Filtered Assignments according to Date Range
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
      // 1. Total certified workforce count for this skill
      const totalStaffWithSkill = employees.filter((e) => e.skills?.includes(skillName)).length;

      // 2. Total required instances in active worksites
      const targetWorksites =
        selectedWorksiteId === 'ALL'
          ? worksites
          : worksites.filter((w) => w.id === selectedWorksiteId);

      const requiredInWorksites = targetWorksites.filter((w) =>
        w.requiredSkills?.includes(skillName)
      ).length;

      // 3. Assigned staff count possessing this skill
      const assignedEmployeeIds = new Set(
        filteredAssignments.flatMap((a) => a.assignedEmployeeIds)
      );

      const assignedStaffWithSkill = Array.from(assignedEmployeeIds)
        .map((id) => employees.find((e) => e.id === id))
        .filter((e): e is Employee => Boolean(e) && Boolean(e.skills?.includes(skillName))).length;

      // Coverage ratio
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

  // Selected Worksite Analysis
  const selectedWorksiteObject = useMemo(() => {
    if (selectedWorksiteId === 'ALL') return null;
    return worksites.find((w) => w.id === selectedWorksiteId) || null;
  }, [worksites, selectedWorksiteId]);

  return (
    <div
      className={`min-h-screen p-4 md:p-6 font-["Zag",_ui-sans-serif,_system-ui] transition-colors ${
        isDarkMode
          ? 'bg-[var(--wood-dark)] text-[var(--wood-text-primary)]'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* TOP HEADER & DASHBOARD SUMMARY */}
        <div
          className={`p-6 rounded-2xl border shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
            isDarkMode
              ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] wood-grain-h'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold font-mono uppercase tracking-tight">
                  Team Qualifikations-Matrix & Skill-Radar
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Einsatzplanung 2026
                </span>
              </div>
              <p className="text-xs text-[var(--wood-text-secondary)] mt-1">
                Vergleicht die zertifizierten Qualifikationen des Teams (Kletterer, Führerscheine, Ersthelfer) mit den Baustellenanforderungen.
              </p>
            </div>
          </div>

          {/* Quick KPI Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block">
                Mitarbeiter Gesamt
              </span>
              <span className="text-xl font-mono font-bold text-sky-400 mt-0.5 block">
                {employees.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block">
                Erfasste Skills
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">
                {allSkillsList.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block">
                Aktive Baustellen
              </span>
              <span className="text-xl font-mono font-bold text-amber-400 mt-0.5 block">
                {worksites.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--wood-text-muted)] block">
                Skill-Engpässe
              </span>
              <span
                className={`text-xl font-mono font-bold mt-0.5 block ${
                  skillGapMetrics.criticalGapsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {skillGapMetrics.missingSkillsList.length}
              </span>
            </div>
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

              {selectedWorksiteObject && (
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border"
                  style={{
                    backgroundColor: `${selectedWorksiteObject.hexColor}20`,
                    borderColor: selectedWorksiteObject.hexColor,
                    color: selectedWorksiteObject.hexColor,
                  }}
                >
                  Fokus: {selectedWorksiteObject.name}
                </span>
              )}
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
                      2 Baumpfleger (z.B. Felix Braun) besitzen bereits SKT-A. Eine Fortbildung zu SKT-B sichert künftige Großbaumfällungen ab.
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
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--wood-border)] bg-[var(--wood-base)] text-[var(--wood-text-muted)] font-mono uppercase">
                  <th className="p-3 font-bold">Mitarbeiter</th>
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

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[var(--wood-raised)]/50 transition-colors"
                    >
                      {/* Name & Initials */}
                      <td className="p-3 font-semibold">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 font-mono font-bold text-xs flex items-center justify-center border border-sky-500/30 shrink-0">
                            {emp.initials}
                          </span>
                          <div>
                            <span className="text-[var(--wood-text-primary)] font-bold block">
                              {emp.firstName} {emp.lastName}
                            </span>
                            <span className="text-[10px] text-[var(--wood-text-muted)] font-mono">
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
