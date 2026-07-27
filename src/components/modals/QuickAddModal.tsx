import React, { useState, useMemo } from 'react';
import { Worksite, Employee, Vehicle, Equipment, WorksiteAssignment, Absence, PlanningConflict, TeamTemplate } from '../../types';
import {
  X,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Truck,
  Wrench,
  Sparkles,
  Building,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Info,
  Check,
  Award,
  Zap,
  Layers,
} from 'lucide-react';
import { NewWorksiteModal } from './NewWorksiteModal';
import { detectConflicts, isTimeOverlapping } from '../../domain/conflictEngine';
import { computeTeamRecommendation, getFreeEmployeesOnDate, getFreeVehiclesOnDate, getFreeEquipmentOnDate } from '../../domain/teamRecommendationEngine';
import { calculateSkillMatch } from '../../domain/skillRecommendationEngine';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string; // YYYY-MM-DD
  worksites: Worksite[];
  employees: Employee[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  teamTemplates?: TeamTemplate[];
  absences?: Absence[];
  assignments?: WorksiteAssignment[];
  onAddAssignment: (assignment: Omit<WorksiteAssignment, 'id'>) => void;
  onAddWorksite?: (worksite: Worksite) => void;
  isDarkMode?: boolean;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  worksites,
  employees,
  vehicles,
  equipment,
  teamTemplates = [],
  absences = [],
  assignments = [],
  onAddAssignment,
  onAddWorksite,
  isDarkMode = true,
}) => {
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [worksiteId, setWorksiteId] = useState(worksites[0]?.id || '');
  const [activityName, setActivityName] = useState('Baumpflege & Totholzbeseitigung');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('15:30');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
    employees.slice(0, 2).map((e) => e.id)
  );
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  
  const [isNewWorksiteModalOpen, setIsNewWorksiteModalOpen] = useState(false);
  const [showConflictResolver, setShowConflictResolver] = useState(false);

  if (!isOpen) return null;

  const selectedWorksite = worksites.find((w) => w.id === worksiteId) || worksites[0];

  // 1. COMPUTE REAL-TIME CONFLICTS FOR PROPOSED ASSIGNMENT
  const candidateAssignment: WorksiteAssignment = {
    id: 'candidate-asg-temp',
    worksiteId,
    date,
    startTime,
    endTime,
    activityName,
    assignedEmployeeIds: selectedEmployeeIds,
    assignedVehicleIds: selectedVehicleIds,
    assignedEquipmentIds: selectedEquipmentIds,
    status: 'draft',
  };

  const detectedConflicts = useMemo(() => {
    // Run full conflict engine with candidate included
    const allConflicts = detectConflicts(
      [candidateAssignment, ...assignments],
      employees,
      absences,
      worksites,
      equipment,
      vehicles
    );

    // Filter conflicts specifically affecting this candidate assignment
    return allConflicts.filter(
      (c) => c.affectedWorksiteId === worksiteId && c.affectedDate === date
    );
  }, [candidateAssignment, assignments, employees, absences, worksites, equipment, vehicles, worksiteId, date]);

  // Additional check for missing required skills or missing team leader
  const missingSkillConflicts = useMemo(() => {
    if (!selectedWorksite) return [];
    const reqSkills = selectedWorksite.requiredSkills || [];
    if (reqSkills.length === 0) return [];

    const assignedEmps = employees.filter((e) => selectedEmployeeIds.includes(e.id));
    const possessedSkills = new Set(assignedEmps.flatMap((e) => e.skills || []));
    const missing = reqSkills.filter((s) => !possessedSkills.has(s));

    if (missing.length > 0) {
      return [
        {
          id: 'conf-missing-skills',
          type: 'qualification_mismatch' as const,
          severity: 'blocking' as const,
          title: 'Geforderte Qualifikation fehlt',
          message: `Baustelle erfordert: ${missing.join(', ')}. Kein zugewiesener Mitarbeiter besitzt diese Qualifikation.`,
          affectedDate: date,
          affectedEmployeeIds: selectedEmployeeIds,
          affectedWorksiteId: worksiteId,
          suggestedFix: 'Weise einen qualifizierten Mitarbeiter zu.',
        },
      ];
    }
    return [];
  }, [selectedWorksite, employees, selectedEmployeeIds, date, worksiteId]);

  const allCandidateConflicts = [...detectedConflicts, ...missingSkillConflicts];
  const hasConflicts = allCandidateConflicts.length > 0;
  const blockingConflictsCount = allCandidateConflicts.filter((c) => c.severity === 'blocking').length;

  // 2. RECOMMENDATION ENGINE FOR FREE & QUALIFIED STAFF
  const freeEmployees = useMemo(() => {
    return getFreeEmployeesOnDate(date, employees, assignments, absences);
  }, [date, employees, assignments, absences]);

  const recommendedFreeEmployees = useMemo(() => {
    const reqSkills = selectedWorksite?.requiredSkills || [];
    return freeEmployees
      .map((emp) => {
        const match = calculateSkillMatch(emp, reqSkills);
        const isLeader = Boolean(emp.isLeader || emp.role === 'Teamleiter');
        let score = match.matchScorePercent;
        if (reqSkills.length === 0) score = 85;
        if (isLeader) score = Math.min(100, score + 10);
        return {
          employee: emp,
          matchScorePercent: score,
          matchingSkills: match.matchingSkills,
          missingSkills: match.missingSkills,
          isLeader,
        };
      })
      .sort((a, b) => b.matchScorePercent - a.matchScorePercent);
  }, [freeEmployees, selectedWorksite]);

  // 3. FREE VEHICLES & EQUIPMENT
  const freeVehicles = useMemo(() => {
    return getFreeVehiclesOnDate(date, vehicles, assignments);
  }, [date, vehicles, assignments]);

  const freeEquipment = useMemo(() => {
    return getFreeEquipmentOnDate(date, equipment, assignments);
  }, [date, equipment, assignments]);

  // HANDLERS
  const handleAddNewWorksite = (newWs: Worksite) => {
    if (onAddWorksite) {
      onAddWorksite(newWs);
    }
    setWorksiteId(newWs.id);
  };

  const handleSaveAsDraft = () => {
    if (!worksiteId) return;
    onAddAssignment({
      worksiteId,
      date,
      startTime,
      endTime,
      activityName,
      assignedEmployeeIds: selectedEmployeeIds,
      assignedVehicleIds: selectedVehicleIds,
      assignedEquipmentIds: selectedEquipmentIds,
      status: 'draft',
    });
    onClose();
  };

  const handleCreateImmediately = () => {
    if (!worksiteId || blockingConflictsCount > 0) return;
    onAddAssignment({
      worksiteId,
      date,
      startTime,
      endTime,
      activityName,
      assignedEmployeeIds: selectedEmployeeIds,
      assignedVehicleIds: selectedVehicleIds,
      assignedEquipmentIds: selectedEquipmentIds,
      status: 'published',
    });
    onClose();
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const swapEmployee = (oldEmpId: string, newEmpId: string) => {
    setSelectedEmployeeIds((prev) => [...prev.filter((id) => id !== oldEmpId), newEmpId]);
  };

  const addRecommendedEmployee = (empId: string) => {
    if (!selectedEmployeeIds.includes(empId)) {
      setSelectedEmployeeIds((prev) => [...prev, empId]);
    }
  };

  const toggleVehicle = (vId: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vId) ? prev.filter((id) => id !== vId) : [...prev, vId]
    );
  };

  const swapVehicle = (oldVId: string, newVId: string) => {
    setSelectedVehicleIds((prev) => [...prev.filter((id) => id !== oldVId), newVId]);
  };

  const toggleEquipment = (eqId: string) => {
    setSelectedEquipmentIds((prev) =>
      prev.includes(eqId) ? prev.filter((id) => id !== eqId) : [...prev, eqId]
    );
  };

  const presetActivities = [
    'Kronenpflege',
    'Gefahrenfällung',
    'Baumpflege',
    'Wurzelbehandlung',
    'Lichtraumprofil',
    'Pflanzung',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-colors flex flex-col max-h-[90vh] ${
          isDarkMode
            ? 'bg-[#171717] border-[#292A2E] text-[#F2F4F5]'
            : 'bg-white border-[#97B89A] text-[#3B4A3B]'
        }`}
      >
        {/* HEADER */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDarkMode ? 'border-[#292A2E] bg-[#0C0C0C]' : 'border-[#97B89A] bg-[#CDE7CC]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#3B4A3B]/10 text-[#3B4A3B]'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight">Einsatz & Baustelle Planen</h2>
                {hasConflicts ? (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{allCandidateConflicts.length} Konflikt(e)</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Konfliktfrei</span>
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-[#858B90]' : 'text-[#6E8B6E]'}`}>
                Erfasse Einsätze mit Echtzeit-Konfliktprüfung & KI-Personal-Empfehlungen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-[#202124] text-[#858B90] hover:text-white'
                : 'hover:bg-[#E9F4EA] text-[#6E8B6E] hover:text-[#3B4A3B]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* TEAM TEMPLATE QUICK LOADER */}
          {teamTemplates.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0 fill-current" />
                <div>
                  <span className="font-bold text-emerald-300">Aus gespeicherter Team-Vorlage befüllen:</span>
                  <p className="text-[10px] text-[var(--wood-text-muted)]">
                    Lädt auf 1-Klick Personal, Fahrzeuge & Geräte der Kolonne
                  </p>
                </div>
              </div>

              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  const tmplId = e.target.value;
                  setSelectedTemplateId(tmplId);
                  const tmpl = teamTemplates.find((t) => t.id === tmplId);
                  if (tmpl) {
                    setSelectedEmployeeIds(tmpl.employeeIds);
                    setSelectedVehicleIds(tmpl.vehicleIds);
                    setSelectedEquipmentIds(tmpl.equipmentIds);
                    if (tmpl.defaultActivityName) {
                      setActivityName(tmpl.defaultActivityName);
                    }
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-colors text-xs ${
                  isDarkMode
                    ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">-- Vorlage auswählen... --</option>
                {teamTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    ⚡ {t.name} ({t.employeeIds.length} Person., {t.vehicleIds.length} Fzg., {t.equipmentIds.length} Gerät)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CONFLICT BANNER & RESOLUTION TRIGGER */}
          {hasConflicts && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs font-bold">
                    Planung hat {allCandidateConflicts.length} Konflikt(e) — Sofort Anlegen ist gesperrt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConflictResolver((prev) => !prev)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-white transition flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{showConflictResolver ? 'Schließen' : 'Konflikte lösen'}</span>
                </button>
              </div>

              <ul className="text-[11px] space-y-1 list-disc pl-5 opacity-90">
                {allCandidateConflicts.map((c) => (
                  <li key={c.id}>{c.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SMART CONFLICT RESOLUTION / RECOMMENDATION PANEL */}
          {(showConflictResolver || hasConflicts) && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-[#0C0C0C] border-amber-500/30' : 'bg-amber-50/80 border-amber-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    Vorschlagssystem: Freie & Qualifizierte Alternativen
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--wood-text-muted)]">
                  {freeEmployees.length} freie Mitarbeiter am {date}
                </span>
              </div>

              {/* RECOMMENDED EMPLOYEES LIST */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold block text-[var(--wood-text-secondary)]">
                  Passendes Ersatz-Personal für den {date}:
                </span>
                {recommendedFreeEmployees.length === 0 ? (
                  <p className="text-xs italic text-rose-400">Keine freien Mitarbeiter an diesem Datum gefunden.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recommendedFreeEmployees.slice(0, 4).map(({ employee: emp, matchScorePercent, isLeader }) => (
                      <div
                        key={emp.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          isDarkMode
                            ? 'bg-[#171717] border-[#292A2E] text-[#F2F4F5]'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs">
                              {emp.firstName} {emp.lastName}
                            </span>
                            {isLeader && (
                              <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Teamleiter
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--wood-text-muted)]">
                            {emp.role} · <span className="text-amber-400 font-bold">{matchScorePercent}% Match</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addRecommendedEmployee(emp.id)}
                          className="px-2 py-1 text-[11px] font-bold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Hinzufügen</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECOMMENDED FREE VEHICLES */}
              {freeVehicles.length > 0 && selectedVehicleIds.length > 0 && (
                <div className="pt-2 border-t border-[var(--wood-border)]/50 space-y-1">
                  <span className="text-[11px] font-semibold block text-[var(--wood-text-secondary)]">
                    Verfügbare freie Fahrzeuge:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {freeVehicles.slice(0, 3).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => swapVehicle(selectedVehicleIds[0], v.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 transition flex items-center space-x-1"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Wechseln zu {v.name} ({v.licensePlate})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DATE & TIME ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Datum *</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full px-3 py-2 rounded-lg text-sm border font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                  isDarkMode
                    ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Uhrzeit *</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-lg text-xs border font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                    isDarkMode
                      ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <span className={`text-xs ${isDarkMode ? 'text-[#858B90]' : 'text-slate-400'}`}>–</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-lg text-xs border font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                    isDarkMode
                      ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* WORKSITE SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className={`text-xs font-semibold flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Baustelle / Einsatzort *</span>
              </label>

              <button
                type="button"
                onClick={() => setIsNewWorksiteModalOpen(true)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center space-x-1 ${
                  isDarkMode
                    ? 'bg-[var(--wood-moss)]/20 border-[var(--wood-moss)]/40 text-[var(--wood-moss)] hover:bg-[var(--wood-moss)]/30'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                }`}
                title="Eine neue Baustelle anlegen"
              >
                <Building className="w-3.5 h-3.5" />
                <span>+ Neue Baustelle anlegen</span>
              </button>
            </div>

            <select
              value={worksiteId}
              onChange={(e) => setWorksiteId(e.target.value)}
              required
              className={`w-full px-3 py-2 rounded-lg text-sm border font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {worksites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.location} — {w.name} ({w.code})
                </option>
              ))}
            </select>
            {selectedWorksite && (
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <p className={`italic ${isDarkMode ? 'text-[#858B90]' : 'text-slate-500'}`}>
                  📍 {selectedWorksite.address}
                </p>
                {selectedWorksite.requiredSkills && selectedWorksite.requiredSkills.length > 0 && (
                  <span className="font-mono text-amber-400 font-bold">
                    Gefordert: {selectedWorksite.requiredSkills.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ACTIVITY DESCRIPTION */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
              }`}
            >
              Tätigkeit / Beschreibung *
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="z. B. Kronenpflege Totholz"
              required
              className={`w-full px-3 py-2 rounded-lg text-sm border font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetActivities.map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setActivityName(act)}
                  className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                    isDarkMode
                      ? 'bg-[#202124] hover:bg-[#292A2E] text-[#BBC2C7]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  + {act}
                </button>
              ))}
            </div>
          </div>

          {/* EMPLOYEE SELECTION */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Mitarbeiter zuweisen ({selectedEmployeeIds.length} ausgewählt)</span>
            </label>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-lg border custom-scrollbar ${
                isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {employees.map((emp) => {
                const isSelected = selectedEmployeeIds.includes(emp.id);
                const isAbsent = absences.some(
                  (a) => a.employeeId === emp.id && a.startDate <= date && a.endDate >= date && a.status === 'genehmigt'
                );

                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleEmployee(emp.id)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between border transition-all ${
                      isSelected
                        ? isAbsent
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                          : isDarkMode
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                        : isDarkMode
                        ? 'bg-[#171717] border-[#202124] text-[#BBC2C7] hover:border-[#292A2E]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">
                      {emp.firstName} {emp.lastName[0]}. {isAbsent && '🏖️'}
                    </span>
                    <span className="text-[10px] font-mono opacity-70 ml-1">{emp.initials}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VEHICLES & EQUIPMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-violet-400" />
                <span>Fahrzeug (optional)</span>
              </label>
              <div
                className={`space-y-1 max-h-24 overflow-y-auto p-2 rounded-lg border custom-scrollbar ${
                  isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {vehicles.map((v) => {
                  const isSel = selectedVehicleIds.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVehicle(v.id)}
                      className={`w-full text-left px-2 py-1 rounded text-xs truncate border transition-colors ${
                        isSel
                          ? 'bg-violet-500/20 border-violet-500 text-violet-300 font-medium'
                          : isDarkMode
                          ? 'bg-[#171717] border-[#202124] text-[#858B90]'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {v.name} ({v.licensePlate})
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Gerät (optional)</span>
              </label>
              <div
                className={`space-y-1 max-h-24 overflow-y-auto p-2 rounded-lg border custom-scrollbar ${
                  isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {equipment.map((eq) => {
                  const isSel = selectedEquipmentIds.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggleEquipment(eq.id)}
                      className={`w-full text-left px-2 py-1 rounded text-xs truncate border transition-colors ${
                        isSel
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-medium'
                          : isDarkMode
                          ? 'bg-[#171717] border-[#202124] text-[#858B90]'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {eq.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ACTION FOOTER WITH 3 EXPLICIT OPTIONS: ABBRECHEN / ALS ENTWURF ANLEGEN / SOFORT ANLEGEN */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-2 shrink-0 ${
            isDarkMode ? 'border-[#292A2E] bg-[#0C0C0C]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          {/* ABBRECHEN */}
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-[#202124] hover:bg-[#292A2E] text-[#BBC2C7]'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            Abbrechen
          </button>

          <div className="flex items-center space-x-2">
            {/* ALS ENTWURF SPEICHERN / ANLEGEN */}
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center space-x-1.5 ${
                isDarkMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
              title="Speichert den Einsatz als unveröffentlichten Entwurf"
            >
              <span>Als Entwurf anlegen</span>
            </button>

            {/* SOFORT ANLEGEN (DISABLED IF BLOCKING CONFLICTS PRESENT) */}
            <button
              type="button"
              onClick={handleCreateImmediately}
              disabled={blockingConflictsCount > 0}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-md transition-all flex items-center space-x-1.5 ${
                blockingConflictsCount > 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600 opacity-60'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold cursor-pointer shadow-emerald-500/20'
              }`}
              title={
                blockingConflictsCount > 0
                  ? 'Sofort anlegen ist wegen Konflikten gesperrt. Löse die Konflikte oder speichere als Entwurf.'
                  : 'Trägt den Einsatz sofort veröffentlicht in den Kalender ein.'
              }
            >
              {blockingConflictsCount > 0 ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Sofort Anlegen (Gesperrt)</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Sofort Anlegen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* NEW WORKSITE MODAL */}
      {isNewWorksiteModalOpen && (
        <NewWorksiteModal
          isOpen={isNewWorksiteModalOpen}
          onClose={() => setIsNewWorksiteModalOpen(false)}
          onAddWorksite={handleAddNewWorksite}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
