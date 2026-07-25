import React from 'react';
import {
  Clock,
  MapPin,
  Truck,
  Wrench,
  AlertTriangle,
  MoreHorizontal,
  UserPlus,
  ArrowRightLeft,
  Trash2,
} from 'lucide-react';
import {
  WorksiteAssignment,
  Worksite,
  Employee,
  Vehicle,
  Equipment,
  PlanningConflict,
} from '../../types';
import { Avatar } from '../common/Avatar';
import { calculateHours } from '../../domain/conflictEngine';

interface WorksiteCardProps {
  assignment: WorksiteAssignment;
  worksite: Worksite;
  assignedEmployees: Employee[];
  assignedVehicles: Vehicle[];
  assignedEquipment: Equipment[];
  conflicts: PlanningConflict[];
  onCardClick: () => void;
  onAddEmployeeClick?: (e: React.MouseEvent) => void;
  onSwapEmployeeClick?: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
}

export const WorksiteCard: React.FC<WorksiteCardProps> = ({
  assignment,
  worksite,
  assignedEmployees,
  assignedVehicles,
  assignedEquipment,
  conflicts,
  onCardClick,
  onAddEmployeeClick,
  onSwapEmployeeClick,
  onDeleteClick,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Filter conflicts for this assignment
  const assignmentConflicts = conflicts.filter(
    (c) =>
      c.affectedWorksiteId === assignment.worksiteId &&
      (c.affectedDate === assignment.date || c.affectedDate === 'Ganze Woche')
  );

  const blockingCount = assignmentConflicts.filter((c) => c.severity === 'blocking').length;
  const warningCount = assignmentConflicts.filter((c) => c.severity === 'warning').length;

  const durationHours = calculateHours(assignment.startTime, assignment.endTime);

  // Max 3 avatars visible, then count remaining
  const visibleEmployees = assignedEmployees.slice(0, 3);
  const hiddenEmployeesCount = Math.max(0, assignedEmployees.length - 3);

  // Hex border or accent color based on worksite
  const borderHexColor = worksite.hexColor || '#4AA8E8';

  return (
    <div
      onClick={onCardClick}
      className={`group relative bg-[#202124] hover:bg-[#292A2E] border rounded-xl p-4 transition-all duration-150 cursor-pointer shadow-md focus-ring ${
        blockingCount > 0
          ? 'border-rose-600 bg-rose-950/20'
          : assignment.status === 'modified'
          ? 'border-amber-600'
          : 'border-[#45474D] hover:border-neutral-400'
      }`}
      style={{
        borderLeftWidth: '5px',
        borderLeftColor: borderHexColor,
      }}
    >
      {/* CARD TOP HEADER: Site Name & Code + Options Menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: borderHexColor }}
            />
            <span className="text-xs font-bold text-neutral-100 truncate tracking-wide uppercase">
              {worksite.name}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono bg-[#171717] px-1.5 py-0.5 rounded border border-[#45474D] shrink-0">
              {worksite.code}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs text-neutral-300 font-medium">
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              {assignment.startTime}–{assignment.endTime} ({durationHours}h)
            </span>
            <span className="text-neutral-500 shrink-0">·</span>
            <span className="flex items-center gap-1 text-neutral-400 truncate">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{worksite.location}</span>
            </span>
          </div>
        </div>

        {/* Quick Action Button Menu */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#32343A] rounded-lg transition focus-ring"
            title="Aktionen"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-20 w-48 bg-[#171717] border border-[#45474D] rounded-xl shadow-2xl p-1.5 text-xs text-neutral-200"
            >
              <button
                onClick={(e) => {
                  setMenuOpen(false);
                  onAddEmployeeClick?.(e);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#32343A] rounded-lg flex items-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5 text-sky-400" />
                Mitarbeiter zuweisen
              </button>
              <button
                onClick={(e) => {
                  setMenuOpen(false);
                  onSwapEmployeeClick?.(e);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#32343A] rounded-lg flex items-center gap-2"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                Personen tauschen
              </button>
              <div className="my-1 border-t border-[#292A2E]" />
              <button
                onClick={(e) => {
                  setMenuOpen(false);
                  onDeleteClick?.(e);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-rose-950 text-rose-300 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Einsatz löschen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVITY DESCRIPTION */}
      <div className="text-xs text-neutral-200 font-medium bg-[#171717] px-3 py-2 rounded-lg border border-[#292A2E] mb-3 line-clamp-2 leading-relaxed">
        {assignment.activityName}
      </div>

      {/* ASSIGNED EMPLOYEES: Avatars + Names */}
      <div className="mb-3">
        <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1.5">
          Eingesetztes Team ({assignedEmployees.length})
        </div>

        {assignedEmployees.length === 0 ? (
          <div className="text-xs text-amber-400 font-medium italic bg-amber-950/40 px-2.5 py-2 rounded-lg border border-amber-800/60 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Noch keine Personen zugewiesen</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {visibleEmployees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-1.5 bg-[#171717] border border-[#32343A] rounded-full pl-0.5 pr-2.5 py-0.5 shadow-xs"
              >
                <Avatar employee={emp} size="sm" showRoleBadge />
                <span className="text-xs font-semibold text-neutral-200">
                  {emp.firstName}
                </span>
              </div>
            ))}

            {hiddenEmployeesCount > 0 && (
              <span className="px-2.5 py-1 text-xs font-bold bg-[#32343A] text-neutral-300 rounded-full border border-[#45474D]">
                +{hiddenEmployeesCount} weitere
              </span>
            )}
          </div>
        )}
      </div>

      {/* FOOTER: Vehicles, Equipment & Conflict Badges */}
      <div className="flex items-center justify-between gap-2 border-t border-[#292A2E] pt-2.5 mt-2 text-[11px] text-neutral-400">
        <div className="flex items-center gap-2 flex-wrap">
          {assignedVehicles.length > 0 && (
            <span className="flex items-center gap-1 text-sky-300 font-medium bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/80">
              <Truck className="w-3 h-3" />
              {assignedVehicles.length} KFZ
            </span>
          )}

          {assignedEquipment.length > 0 && (
            <span className="flex items-center gap-1 text-purple-300 font-medium bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/80">
              <Wrench className="w-3 h-3" />
              {assignedEquipment.length} Geräte
            </span>
          )}
        </div>

        {/* Conflict Badge */}
        {blockingCount > 0 ? (
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-900 text-rose-100 rounded-md border border-rose-700 flex items-center gap-1 shrink-0 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-300" />
            {blockingCount} Konflikt
          </span>
        ) : warningCount > 0 ? (
          <span className="px-2.5 py-0.5 text-[10px] font-medium bg-amber-950 text-amber-300 rounded-md border border-amber-800 flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            {warningCount} Hinweis
          </span>
        ) : null}
      </div>
    </div>
  );
};
