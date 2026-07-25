import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Users,
  Truck,
  Wrench,
  Sun,
  CloudRain,
  Wind,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  WorksiteAssignment,
  Worksite,
  Employee,
  Vehicle,
  Equipment,
  PlanningConflict,
  WeatherSummary,
} from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { calculateHours } from '../../domain/conflictEngine';

interface WorksiteDetailDrawerProps {
  assignment: WorksiteAssignment | null;
  worksite: Worksite | null;
  assignedEmployees: Employee[];
  allEmployees: Employee[];
  assignedVehicles: Vehicle[];
  allVehicles: Vehicle[];
  assignedEquipment: Equipment[];
  allEquipment: Equipment[];
  conflicts: PlanningConflict[];
  weather?: WeatherSummary;
  onClose: () => void;
  onAddEmployee: (employeeId: string) => void;
  onRemoveEmployee: (employeeId: string) => void;
  onAddVehicle: (vehicleId: string) => void;
  onRemoveVehicle: (vehicleId: string) => void;
  onAddEquipment: (equipmentId: string) => void;
  onRemoveEquipment: (equipmentId: string) => void;
  onTimeChange: (startTime: string, endTime: string) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

export const WorksiteDetailDrawer: React.FC<WorksiteDetailDrawerProps> = ({
  assignment,
  worksite,
  assignedEmployees,
  allEmployees,
  assignedVehicles,
  allVehicles,
  assignedEquipment,
  allEquipment,
  conflicts,
  weather,
  onClose,
  onAddEmployee,
  onRemoveEmployee,
  onAddVehicle,
  onRemoveVehicle,
  onAddEquipment,
  onRemoveEquipment,
  onTimeChange,
  onDeleteAssignment,
}) => {
  if (!assignment || !worksite) return null;

  const durationHours = calculateHours(assignment.startTime, assignment.endTime);
  const totalPersonHours = Math.round(durationHours * assignedEmployees.length * 10) / 10;

  // Filter conflicts for this assignment
  const assignmentConflicts = conflicts.filter(
    (c) =>
      c.affectedWorksiteId === assignment.worksiteId &&
      (c.affectedDate === assignment.date || c.affectedDate === 'Ganze Woche')
  );

  // Unassigned employees available to add
  const assignedEmpIds = new Set(assignedEmployees.map((e) => e.id));
  const availableEmployeesToAdd = allEmployees.filter((e) => !assignedEmpIds.has(e.id));

  // Unassigned vehicles available
  const assignedVehIds = new Set(assignedVehicles.map((v) => v.id));
  const availableVehiclesToAdd = allVehicles.filter((v) => !assignedVehIds.has(v.id));

  // Unassigned equipment available
  const assignedEqIds = new Set(assignedEquipment.map((eq) => eq.id));
  const availableEquipmentToAdd = allEquipment.filter((eq) => !assignedEqIds.has(eq.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* DRAWER CONTAINER */}
      <div className="w-full max-w-2xl bg-[#171717] border-l border-[#45474D] h-full overflow-y-auto flex flex-col justify-between shadow-2xl select-none">
        {/* HEADER */}
        <div
          className="p-5 border-b border-[#45474D] flex items-start justify-between gap-3 sticky top-0 bg-[#202124] z-10"
          style={{ borderTop: `4px solid ${worksite.hexColor || '#4AA8E8'}` }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: worksite.hexColor }}
              />
              <Badge variant="worksite" colorKey={worksite.colorKey} size="md">
                {worksite.code}
              </Badge>
              <h2 className="text-xl font-bold text-neutral-100">{worksite.name}</h2>
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              Einsatz am {assignment.date} · {worksite.location}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#32343A] rounded-lg transition focus-ring"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DRAWER BODY */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto text-xs text-neutral-200">
          {/* CONFLICTS NOTICE IF PRESENT */}
          {assignmentConflicts.length > 0 && (
            <div className="space-y-2">
              {assignmentConflicts.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    c.severity === 'blocking'
                      ? 'bg-rose-950/60 border-rose-700 text-rose-200'
                      : 'bg-amber-950/60 border-amber-700 text-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  <div className="flex-1">
                    <div className="font-bold text-sm mb-0.5">{c.title}</div>
                    <p className="text-xs mb-1 opacity-90">{c.message}</p>
                    {c.suggestedFix && (
                      <div className="text-[11px] font-medium underline">
                        Lösung: {c.suggestedFix}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BASIC WORKSITE & TIME METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#202124] p-4 rounded-xl border border-[#32343A]">
            {/* TIME ADJUSTMENT */}
            <div>
              <label className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Arbeitszeit & Dauer
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={assignment.startTime}
                  onChange={(e) => onTimeChange(e.target.value, assignment.endTime)}
                  className="bg-[#171717] text-neutral-100 px-2.5 py-1.5 rounded-lg border border-[#45474D] focus:border-sky-400 text-xs font-mono"
                />
                <span className="text-neutral-500">bis</span>
                <input
                  type="time"
                  value={assignment.endTime}
                  onChange={(e) => onTimeChange(assignment.startTime, e.target.value)}
                  className="bg-[#171717] text-neutral-100 px-2.5 py-1.5 rounded-lg border border-[#45474D] focus:border-sky-400 text-xs font-mono"
                />
              </div>
              <div className="text-[11px] text-neutral-400 mt-1.5">
                {durationHours} Std. Schicht · <span className="text-sky-300 font-bold">{totalPersonHours} Person-Std. gesamt</span>
              </div>
            </div>

            {/* LOCATION & MEETING POINT */}
            <div>
              <label className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Adresse & Treffpunkt
              </label>
              <div className="text-xs font-medium text-neutral-200">{worksite.address}</div>
              <div className="text-[11px] text-amber-300 mt-0.5">
                Treffpunkt: {worksite.meetingPoint}
              </div>
            </div>
          </div>

          {/* TASK DESCRIPTION */}
          <div className="bg-[#202124] p-4 rounded-xl border border-[#32343A]">
            <h4 className="text-xs uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-purple-400" />
              Tätigkeit & Auftrag
            </h4>
            <p className="text-xs text-neutral-200 font-medium mb-2">
              {assignment.activityName}
            </p>
            <p className="text-[11px] text-neutral-400 italic">
              {worksite.description}
            </p>
          </div>

          {/* WEATHER WIDGET */}
          {weather && (
            <div className="bg-[#202124] p-4 rounded-xl border border-[#32343A]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Wetterprognose ({weather.location})
                </h4>
                <span className="text-[10px] text-neutral-500">{weather.updatedAt}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#171717] p-2.5 rounded-lg border border-[#292A2E]">
                <div>
                  <div className="text-neutral-400 text-[10px]">Temperatur</div>
                  <div className="font-bold text-neutral-100 text-sm">
                    {weather.tempLow}°C - {weather.tempHigh}°C
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Niederschlag</div>
                  <div className="font-bold text-sky-300 text-sm">
                    {weather.precipitationProb}%
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Max. Wind</div>
                  <div className="font-bold text-teal-300 text-sm">
                    {weather.maxWindKmH} km/h
                  </div>
                </div>
              </div>

              {weather.warningText && (
                <div className="mt-2.5 p-2 rounded-lg bg-amber-950/80 border border-amber-700 text-amber-200 text-xs flex items-center gap-2">
                  <Wind className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{weather.warningText}</span>
                </div>
              )}
            </div>
          )}

          {/* ASSIGNED TEAM MEMBERS SECTION */}
          <div className="bg-[#202124] p-4 rounded-xl border border-[#32343A]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase font-bold text-neutral-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                Eingesetztes Team ({assignedEmployees.length})
              </h4>
            </div>

            {assignedEmployees.length === 0 ? (
              <div className="text-amber-400 italic text-xs mb-3">
                Keine Mitarbeiter zugewiesen!
              </div>
            ) : (
              <div className="space-y-2 mb-3">
                {assignedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-2.5 bg-[#171717] rounded-lg border border-[#292A2E] hover:border-neutral-500 transition"
                  >
                    <Avatar employee={emp} size="md" showName showRoleBadge />

                    <div className="flex items-center gap-2">
                      {/* Skill check tags */}
                      <div className="hidden sm:flex items-center gap-1">
                        {emp.skills.slice(0, 2).map((sk) => (
                          <span
                            key={sk}
                            className="text-[9px] bg-[#292A2E] text-neutral-300 px-1.5 py-0.5 rounded border border-[#32343A]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => onRemoveEmployee(emp.id)}
                        className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition focus-ring"
                        title="Aus Team entfernen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ADD EMPLOYEE SELECTOR */}
            {availableEmployeesToAdd.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  id="add-employee-select"
                  aria-label="Mitarbeiter zum Team hinzufügen"
                  onChange={(e) => {
                    if (e.target.value) {
                      onAddEmployee(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 bg-[#171717] text-neutral-200 border border-[#45474D] rounded-lg px-2.5 py-1.5 text-xs focus:border-sky-400"
                >
                  <option value="">+ Mitarbeiter zum Team hinzufügen...</option>
                  {availableEmployeesToAdd.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ASSIGNED VEHICLES & EQUIPMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* VEHICLES */}
            <div className="bg-[#202124] p-4 rounded-xl border border-[#32343A]">
              <h4 className="text-xs uppercase font-bold text-neutral-300 mb-2.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                Fahrzeuge ({assignedVehicles.length})
              </h4>

              <div className="space-y-1.5 mb-3">
                {assignedVehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2 bg-[#171717] rounded-lg border border-[#292A2E]"
                  >
                    <div>
                      <div className="font-semibold text-neutral-200 text-xs">{v.name}</div>
                      <div className="text-[10px] text-neutral-400">{v.licensePlate}</div>
                    </div>
                    <button
                      onClick={() => onRemoveVehicle(v.id)}
                      className="p-1 text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {availableVehiclesToAdd.length > 0 && (
                <select
                  id="add-vehicle-select"
                  aria-label="Fahrzeug zur Baustelle hinzufügen"
                  onChange={(e) => {
                    if (e.target.value) {
                      onAddVehicle(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-[#171717] text-neutral-200 border border-[#45474D] rounded-lg px-2 py-1.5 text-xs"
                >
                  <option value="">+ Fahrzeug zuweisen...</option>
                  {availableVehiclesToAdd.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.licensePlate})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* EQUIPMENT */}
            <div className="bg-[#202124] p-4 rounded-xl border border-[#32343A]">
              <h4 className="text-xs uppercase font-bold text-neutral-300 mb-2.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-purple-400" />
                Geräte ({assignedEquipment.length})
              </h4>

              <div className="space-y-1.5 mb-3">
                {assignedEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between p-2 bg-[#171717] rounded-lg border border-[#292A2E]"
                  >
                    <div>
                      <div className="font-semibold text-neutral-200 text-xs">{eq.name}</div>
                      {eq.isExclusive && (
                        <span className="text-[9px] text-amber-400 uppercase font-bold">
                          Exklusiv
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveEquipment(eq.id)}
                      className="p-1 text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {availableEquipmentToAdd.length > 0 && (
                <select
                  id="add-equipment-select"
                  aria-label="Gerät zur Baustelle hinzufügen"
                  onChange={(e) => {
                    if (e.target.value) {
                      onAddEquipment(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-[#171717] text-neutral-200 border border-[#45474D] rounded-lg px-2 py-1.5 text-xs"
                >
                  <option value="">+ Gerät zuweisen...</option>
                  {availableEquipmentToAdd.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-[#45474D] bg-[#202124] flex items-center justify-between gap-3 sticky bottom-0 z-10">
          <button
            onClick={() => onDeleteAssignment(assignment.id)}
            className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition focus-ring"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Einsatz löschen
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-neutral-950 font-bold rounded-lg text-xs transition focus-ring shadow-md"
          >
            Fertigstellen & Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
