import React from 'react';
import { Plus, Sun, Cloud, CloudRain, CloudLightning, Wind, AlertTriangle, Clock } from 'lucide-react';
import {
  WorksiteAssignment,
  Worksite,
  Employee,
  Vehicle,
  Equipment,
  PlanningConflict,
  WeatherSummary,
} from '../../types';
import { WorksiteCard } from './WorksiteCard';
import { calculateHours } from '../../domain/conflictEngine';

interface DayColumnProps {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Montag, 14. Sep"
  isToday: boolean;
  assignments: WorksiteAssignment[];
  worksites: Worksite[];
  employees: Employee[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  conflicts: PlanningConflict[];
  weather?: WeatherSummary;
  onCardClick: (assignment: WorksiteAssignment) => void;
  onAddAssignmentClick: (date: string) => void;
  onAddEmployeeClick?: (assignment: WorksiteAssignment) => void;
  onSwapEmployeeClick?: (assignment: WorksiteAssignment) => void;
  onDeleteAssignmentClick?: (assignmentId: string) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  dayLabel,
  isToday,
  assignments,
  worksites,
  employees,
  vehicles,
  equipment,
  conflicts,
  weather,
  onCardClick,
  onAddAssignmentClick,
  onAddEmployeeClick,
  onSwapEmployeeClick,
  onDeleteAssignmentClick,
}) => {
  const worksiteMap = new Map<string, Worksite>(worksites.map((w) => [w.id, w]));
  const employeeMap = new Map<string, Employee>(employees.map((e) => [e.id, e]));
  const vehicleMap = new Map<string, Vehicle>(vehicles.map((v) => [v.id, v]));
  const equipmentMap = new Map<string, Equipment>(equipment.map((eq) => [eq.id, eq]));

  // Calculate total person-hours on this day
  let dayPersonHours = 0;
  assignments.forEach((asg) => {
    const hours = calculateHours(asg.startTime, asg.endTime);
    dayPersonHours += hours * asg.assignedEmployeeIds.length;
  });

  const getWeatherIcon = (condition?: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-sky-400" />;
      case 'stormy':
        return <CloudLightning className="w-4 h-4 text-rose-400" />;
      case 'windy':
        return <Wind className="w-4 h-4 text-teal-400" />;
      default:
        return <Cloud className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="flex flex-col min-w-[280px] flex-1 bg-[#171717] border border-[#45474D] rounded-xl overflow-hidden shadow-sm">
      {/* COLUMN HEADER */}
      <div
        className={`px-3 py-2.5 border-b border-[#45474D] flex items-center justify-between gap-2 select-none ${
          isToday ? 'bg-[#292A2E] border-b-2 border-b-sky-400' : 'bg-[#202124]'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-100">
            <span>{dayLabel}</span>
            {isToday && (
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-sky-500 text-neutral-950 rounded">
                Heute
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              {dayPersonHours} Person-Std.
            </span>
            <span>·</span>
            <span>{assignments.length} Einsätze</span>
          </div>
        </div>

        {/* Weather Badge */}
        {weather && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${
              weather.warningText
                ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                : 'bg-[#171717] text-neutral-300 border-[#32343A]'
            }`}
            title={weather.warningText || `Wetter ${weather.location}: ${weather.tempHigh}°C, Max. Wind ${weather.maxWindKmH} km/h`}
          >
            {getWeatherIcon(weather.condition)}
            <span>{weather.tempHigh}°C</span>
            {weather.warningText && <AlertTriangle className="w-3 h-3 text-amber-400" />}
          </div>
        )}
      </div>

      {/* CARDS LIST CONTAINER */}
      <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[300px]">
        {assignments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#292A2E] rounded-xl text-neutral-500 text-xs gap-2">
            <span>Keine Einsätze für {dayLabel} geplant</span>
            <button
              onClick={() => onAddAssignmentClick(date)}
              className="px-3 py-1.5 bg-[#202124] hover:bg-[#32343A] text-neutral-300 border border-[#45474D] rounded-lg text-xs font-medium transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Einsatz hinzufügen
            </button>
          </div>
        ) : (
          <>
            {assignments.map((asg) => {
              const worksite = worksiteMap.get(asg.worksiteId) || {
                id: asg.worksiteId,
                code: 'BAU',
                name: 'Baustelle',
                location: 'Unbekannt',
                address: '',
                meetingPoint: '',
                colorKey: 'site-blue',
                hexColor: '#4AA8E8',
                description: '',
                requiredSkills: [],
              };

              const assignedEmps = asg.assignedEmployeeIds
                .map((id) => employeeMap.get(id))
                .filter((e): e is Employee => Boolean(e));

              const assignedVehs = asg.assignedVehicleIds
                .map((id) => vehicleMap.get(id))
                .filter((v): v is Vehicle => Boolean(v));

              const assignedEqs = asg.assignedEquipmentIds
                .map((id) => equipmentMap.get(id))
                .filter((eq): eq is Equipment => Boolean(eq));

              return (
                <WorksiteCard
                  key={asg.id}
                  assignment={asg}
                  worksite={worksite}
                  assignedEmployees={assignedEmps}
                  assignedVehicles={assignedVehs}
                  assignedEquipment={assignedEqs}
                  conflicts={conflicts}
                  onCardClick={() => onCardClick(asg)}
                  onAddEmployeeClick={() => onAddEmployeeClick?.(asg)}
                  onSwapEmployeeClick={() => onSwapEmployeeClick?.(asg)}
                  onDeleteClick={() => onDeleteAssignmentClick?.(asg.id)}
                />
              );
            })}

            {/* ADD ASSIGNMENT BUTTON */}
            <button
              onClick={() => onAddAssignmentClick(date)}
              className="w-full py-2 border-2 border-dashed border-[#32343A] hover:border-sky-500 hover:bg-sky-950/20 text-neutral-400 hover:text-sky-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 focus-ring"
            >
              <Plus className="w-3.5 h-3.5" />
              Weiteren Einsatz anlegen
            </button>
          </>
        )}
      </div>
    </div>
  );
};
