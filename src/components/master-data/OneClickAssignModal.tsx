import React, { useState, useMemo } from 'react';
import {
  TeamTemplate,
  Worksite,
  Employee,
  Vehicle,
  Equipment,
  WorksiteAssignment,
  Absence,
} from '../../types';
import {
  X,
  Zap,
  Calendar,
  Clock,
  MapPin,
  Users,
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Check,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { detectConflicts } from '../../domain/conflictEngine';

interface OneClickAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TeamTemplate | null;
  worksites: Worksite[];
  employees: Employee[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  absences?: Absence[];
  assignments?: WorksiteAssignment[];
  onAddAssignment: (assignment: Omit<WorksiteAssignment, 'id'>) => void;
  isDarkMode?: boolean;
}

export const OneClickAssignModal: React.FC<OneClickAssignModalProps> = ({
  isOpen,
  onClose,
  template,
  worksites,
  employees,
  vehicles,
  equipment,
  absences = [],
  assignments = [],
  onAddAssignment,
  isDarkMode = true,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [worksiteId, setWorksiteId] = useState(() => worksites[0]?.id || '');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('15:30');
  const [activityName, setActivityName] = useState(
    template?.defaultActivityName || 'Baumfällung & Kronenpflege'
  );

  // Update activityName if template changes
  React.useEffect(() => {
    if (template) {
      if (template.defaultActivityName) {
        setActivityName(template.defaultActivityName);
      }
      if (worksites.length > 0 && !worksiteId) {
        setWorksiteId(worksites[0].id);
      }
    }
  }, [template, worksites]);

  if (!isOpen || !template) return null;

  const selectedWorksite = worksites.find((w) => w.id === worksiteId) || worksites[0];

  // Candidates for conflict checking
  const candidateAssignment: WorksiteAssignment = {
    id: 'candidate-template-asg',
    worksiteId: worksiteId || worksites[0]?.id || 'site-1',
    date,
    startTime,
    endTime,
    activityName,
    assignedEmployeeIds: template.employeeIds,
    assignedVehicleIds: template.vehicleIds,
    assignedEquipmentIds: template.equipmentIds,
    status: 'published',
  };

  const detectedConflicts = useMemo(() => {
    const allConflicts = detectConflicts(
      [candidateAssignment, ...assignments],
      employees,
      absences,
      worksites,
      equipment,
      vehicles
    );

    return allConflicts.filter(
      (c) => c.affectedWorksiteId === candidateAssignment.worksiteId && c.affectedDate === date
    );
  }, [candidateAssignment, assignments, employees, absences, worksites, equipment, vehicles, date]);

  const blockingConflictsCount = detectedConflicts.filter((c) => c.severity === 'blocking').length;
  const hasConflicts = detectedConflicts.length > 0;

  // Resolve assigned entity objects
  const assignedLeader = employees.find((e) => e.id === template.leaderEmployeeId);
  const assignedStaff = employees.filter((e) => template.employeeIds.includes(e.id));
  const assignedVehs = vehicles.filter((v) => template.vehicleIds.includes(v.id));
  const assignedEquip = equipment.filter((eq) => template.equipmentIds.includes(eq.id));

  const handleCreateAssignment = (status: 'draft' | 'published') => {
    if (!worksiteId) return;

    onAddAssignment({
      worksiteId,
      date,
      startTime,
      endTime,
      activityName: activityName.trim() || 'Team-Einsatz',
      assignedEmployeeIds: template.employeeIds,
      assignedVehicleIds: template.vehicleIds,
      assignedEquipmentIds: template.equipmentIds,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDarkMode
            ? 'bg-[#171717] border-[#292A2E] text-[#F2F4F5]'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* HEADER */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDarkMode ? 'border-[#292A2E] bg-[#0C0C0C]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
              style={{ backgroundColor: template.color || '#10B981' }}
            >
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold">Ein-Klick Team-Zuweisung</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Bulk Assign
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-[#858B90]' : 'text-slate-500'}`}>
                {template.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-[#202124] text-[#858B90] hover:text-white'
                : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* TEMPLATE CONTENT SUMMARY */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--wood-text-secondary)]">Team-Zusammensetzung:</span>
              {assignedLeader && (
                <span className="text-amber-400 font-bold flex items-center space-x-1">
                  <span>Leiter: {assignedLeader.firstName} {assignedLeader.lastName}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold">{assignedStaff.length} Mitarbeiter</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/30 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span className="font-semibold">{assignedVehs.length} Fahrzeug(e)</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span className="font-semibold">{assignedEquip.length} Gerät(e)</span>
              </div>
            </div>
          </div>

          {/* DATE & TIME ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Einsatzdatum *</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${
                  isDarkMode
                    ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Arbeitszeit *</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-lg text-xs font-mono border ${
                    isDarkMode
                      ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <span className="text-xs text-slate-400">–</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-lg text-xs font-mono border ${
                    isDarkMode
                      ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* TARGET WORKSITE */}
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Ziel-Baustelle wählen *</span>
            </label>
            <select
              value={worksiteId}
              onChange={(e) => setWorksiteId(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
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
              <p className="mt-1 text-[11px] text-[var(--wood-text-muted)] italic">
                📍 {selectedWorksite.address}
              </p>
            )}
          </div>

          {/* ACTIVITY DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold mb-1">Einsatzbezeichnung</label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Tätigkeit eintragen..."
              className={`w-full px-3 py-2 rounded-lg text-xs border font-medium ${
                isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* REAL-TIME CONFLICTS BANNER */}
          {hasConflicts ? (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1.5">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-bold">
                  {detectedConflicts.length} Konflikt(e) am {date} erkannt
                </span>
              </div>
              <ul className="text-[11px] space-y-1 list-disc pl-5 opacity-90">
                {detectedConflicts.map((c) => (
                  <li key={c.id}>{c.message}</li>
                ))}
              </ul>
              {blockingConflictsCount > 0 && (
                <p className="text-[10px] font-bold text-amber-300 pt-1">
                  💡 Hinweis: Bei Blockaden kann der Einsatz als unveröffentlichter Entwurf angelegt werden.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Keine Konflikte am {date}! Das komplette Team ist verfügbar.</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
            isDarkMode ? 'border-[#292A2E] bg-[#0C0C0C]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-lg ${
              isDarkMode
                ? 'bg-[#202124] text-[#BBC2C7] hover:bg-[#292A2E]'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Abbrechen
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleCreateAssignment('draft')}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
            >
              Als Entwurf anlegen
            </button>

            <button
              type="button"
              onClick={() => handleCreateAssignment('published')}
              disabled={blockingConflictsCount > 0}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg shadow-md transition flex items-center space-x-1.5 ${
                blockingConflictsCount > 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600 opacity-60'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Sofort Buchen & Anlegen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
