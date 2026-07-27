import React, { useState } from 'react';
import { Users, UserX, Truck, Search, Plus, Check, ShieldAlert, GripVertical } from 'lucide-react';
import { Employee, Absence, Vehicle, Equipment, WorksiteAssignment } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface UnassignedPanelProps {
  employees: Employee[];
  absences: Absence[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  currentAssignments: WorksiteAssignment[];
  weekStartDate: string;
  weekEndDate: string;
  onAssignEmployeeQuick: (employee: Employee) => void;
  onAssignResourceQuick: (resource: Vehicle | Equipment) => void;
  onUnassignEmployee?: (employeeId: string, sourceAssignmentId: string) => void;
}

export const UnassignedPanel: React.FC<UnassignedPanelProps> = ({
  employees,
  absences,
  vehicles,
  equipment,
  currentAssignments,
  weekStartDate,
  weekEndDate,
  onAssignEmployeeQuick,
  onAssignResourceQuick,
  onUnassignEmployee,
}) => {
  const [activeTab, setActiveTab] = useState<'unassigned' | 'absent' | 'resources'>('unassigned');
  const [search, setSearch] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const dataStr =
        e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (
        data &&
        data.type === 'EMPLOYEE' &&
        data.employeeId &&
        data.sourceAssignmentId &&
        data.sourceAssignmentId !== 'unassigned'
      ) {
        onUnassignEmployee?.(data.employeeId, data.sourceAssignmentId);
      }
    } catch (err) {
      console.error('Failed to parse drop data in UnassignedPanel:', err);
    }
  };

  // Find set of employee IDs assigned in current week
  const assignedEmpIds = new Set(
    currentAssignments
      .filter((a) => a.date >= weekStartDate && a.date <= weekEndDate)
      .flatMap((a) => a.assignedEmployeeIds)
  );

  // Find employees absent during current week
  const absentEmpIds = new Set(
    absences
      .filter(
        (abs) =>
          abs.status === 'genehmigt' &&
          abs.startDate <= weekEndDate &&
          abs.endDate >= weekStartDate
      )
      .map((abs) => abs.employeeId)
  );

  // Filter unassigned (neither assigned nor absent)
  const unassignedEmployees = employees.filter(
    (e) => !assignedEmpIds.has(e.id) && !absentEmpIds.has(e.id)
  );

  // Filter absent employees
  const absentEmployees = employees.filter((e) => absentEmpIds.has(e.id));

  return (
    <aside
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative bg-[#171717] border rounded-xl flex flex-col h-full max-h-[800px] shadow-lg overflow-hidden transition-all ${
        isDragOver ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-950/20' : 'border-[#45474D]'
      }`}
    >
      {/* DROP OVERLAY TO UNASSIGN */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 bg-neutral-900/90 backdrop-blur-xs border-2 border-dashed border-amber-400 rounded-xl flex flex-col items-center justify-center p-4 text-amber-200 pointer-events-none animate-fadeIn">
          <UserX className="w-8 h-8 text-amber-400 mb-2 animate-bounce" />
          <span className="text-sm font-bold font-mono uppercase tracking-wide">
            Mitarbeiter hier ablegen
          </span>
          <span className="text-xs text-amber-300/80 mt-1">
            Wird aus dem Baustelleneinsatz entfernt (Entplant)
          </span>
        </div>
      )}

      {/* PANEL HEADER TABS */}
      <div className="bg-[#202124] border-b border-[#45474D] p-2 flex items-center justify-between gap-1 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab('unassigned')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'unassigned'
              ? 'bg-[#383B42] text-white shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>Ungeplant ({unassignedEmployees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('absent')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'absent'
              ? 'bg-[#383B42] text-white shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <UserX className="w-3.5 h-3.5 text-amber-400" />
          <span>Abwesend ({absentEmployees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'resources'
              ? 'bg-[#383B42] text-white shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-purple-400" />
          <span>Ressourcen</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="p-2.5 border-b border-[#292A2E] bg-[#171717]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Suchen nach Namen, Rolle oder Gerät..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#202124] text-xs text-neutral-200 placeholder-neutral-500 pl-8 pr-3 py-1.5 rounded-lg border border-[#45474D] focus:border-sky-400 focus:outline-none"
          />
        </div>
      </div>

      {/* CONTENT LIST */}
      <div className="p-3 overflow-y-auto flex-1 space-y-2.5 text-xs">
        {/* TAB 1: UNASSIGNED EMPLOYEES */}
        {activeTab === 'unassigned' && (
          <>
            {unassignedEmployees.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                Alle aktiven Mitarbeiter sind für diese Woche verplant!
              </div>
            ) : (
              unassignedEmployees
                .filter((e) =>
                  `${e.firstName} ${e.lastName} ${e.role} ${e.skills.join(' ')}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((emp) => (
                  <div
                    key={emp.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      const payload = JSON.stringify({
                        type: 'EMPLOYEE',
                        employeeId: emp.id,
                        sourceAssignmentId: 'unassigned',
                      });
                      e.dataTransfer.setData('application/json', payload);
                      e.dataTransfer.setData('text/plain', payload);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className="bg-[#202124] hover:bg-[#292A2E] p-2.5 rounded-xl border border-[#32343A] hover:border-sky-500/80 flex items-center justify-between gap-2 transition cursor-grab active:cursor-grabbing group/unassigned select-none"
                    title={`${emp.firstName} ${emp.lastName} — Gedrückt halten & Ziehen auf eine Baustelle im Wochenplan`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-neutral-500 group-hover/unassigned:text-sky-400 shrink-0" />
                      <Avatar employee={emp} size="md" showName showRoleBadge />
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignEmployeeQuick(emp);
                        }}
                        className="px-2.5 py-1 bg-sky-900 hover:bg-sky-800 text-sky-200 border border-sky-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 focus-ring"
                      >
                        <Plus className="w-3 h-3" />
                        Zuweisen
                      </button>
                    </div>
                  </div>
                ))
            )}
          </>
        )}

        {/* TAB 2: ABSENT EMPLOYEES */}
        {activeTab === 'absent' && (
          <>
            {absentEmployees.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                Keine Abwesenheiten in dieser Woche gemeldet.
              </div>
            ) : (
              absentEmployees.map((emp) => {
                const abs = absences.find((a) => a.employeeId === emp.id);
                return (
                  <div
                    key={emp.id}
                    className="bg-[#202124] p-2.5 rounded-xl border border-amber-900/60 bg-amber-950/10 flex items-center justify-between gap-2"
                  >
                    <Avatar employee={emp} size="md" showName />
                    {abs && (
                      <Badge variant="warning" size="xs">
                        {abs.type} ({abs.startDate})
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* TAB 3: VEHICLES & EQUIPMENT POOL */}
        {activeTab === 'resources' && (
          <div className="space-y-3">
            <div>
              <div className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5">
                Fahrzeuge ({vehicles.length})
              </div>
              <div className="space-y-1.5">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="bg-[#202124] p-2 rounded-lg border border-[#32343A] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-200">{v.name}</div>
                      <div className="text-[10px] text-neutral-400">{v.licensePlate}</div>
                    </div>
                    <button
                      onClick={() => onAssignResourceQuick(v)}
                      className="px-2 py-1 bg-[#292A2E] hover:bg-[#32343A] text-neutral-200 rounded border border-[#45474D] text-[11px]"
                    >
                      Reservieren
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase font-bold text-neutral-400 mb-1.5">
                Spezialgeräte ({equipment.length})
              </div>
              <div className="space-y-1.5">
                {equipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-[#202124] p-2 rounded-lg border border-[#32343A] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-200">{eq.name}</div>
                      {eq.isExclusive && (
                        <span className="text-[9px] text-amber-400 uppercase font-bold">
                          Exklusiv
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onAssignResourceQuick(eq)}
                      className="px-2 py-1 bg-[#292A2E] hover:bg-[#32343A] text-neutral-200 rounded border border-[#45474D] text-[11px]"
                    >
                      Reservieren
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
