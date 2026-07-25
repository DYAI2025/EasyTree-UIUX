import React from 'react';
import {
  WorksiteAssignment,
  Worksite,
  Employee,
  Vehicle,
  Equipment,
  PlanningConflict,
  PlanningWeek,
  WeatherSummary,
  Absence,
} from '../../types';
import { DayColumn } from './DayColumn';
import { UnassignedPanel } from './UnassignedPanel';

interface WeeklyPlannerProps {
  currentWeek: PlanningWeek;
  assignments: WorksiteAssignment[];
  worksites: Worksite[];
  employees: Employee[];
  absences: Absence[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  conflicts: PlanningConflict[];
  weatherData: WeatherSummary[];
  onSelectAssignment: (assignment: WorksiteAssignment) => void;
  onAddAssignment: (date: string) => void;
  onQuickAssignEmployee: (employee: Employee) => void;
  onQuickAssignResource: (resource: Vehicle | Equipment) => void;
  onAddEmployeeToAssignment?: (assignment: WorksiteAssignment) => void;
  onSwapEmployeesInAssignment?: (assignment: WorksiteAssignment) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  currentWeek,
  assignments,
  worksites,
  employees,
  absences,
  vehicles,
  equipment,
  conflicts,
  weatherData,
  onSelectAssignment,
  onAddAssignment,
  onQuickAssignEmployee,
  onQuickAssignResource,
  onAddEmployeeToAssignment,
  onSwapEmployeesInAssignment,
  onDeleteAssignment,
}) => {
  // Generate date array for Mon-Fri of the selected week
  // e.g. currentWeek.startDate = '2026-09-14'
  const weekDates = React.useMemo(() => {
    const dates: { date: string; label: string; isToday: boolean }[] = [];
    const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

    const start = new Date(currentWeek.startDate);
    for (let i = 0; i < 5; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;

      const formattedLabel = `${days[i]}, ${d.getDate()}. ${d.toLocaleString('de-DE', {
        month: 'short',
      })}`;

      const todayIso = new Date().toISOString().slice(0, 10);

      dates.push({
        date: isoDate,
        label: formattedLabel,
        isToday: isoDate === todayIso || (i === 0 && currentWeek.weekNumber === 38), // Simulate Monday as today for demo
      });
    }
    return dates;
  }, [currentWeek.startDate, currentWeek.weekNumber]);

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-6 flex flex-col xl:flex-row gap-6 items-start">
      {/* CENTRAL WEEK BOARD GRID (MON - FRI) */}
      <div className="flex-1 w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 min-w-[1420px]">
          {weekDates.map((day) => {
            const dayAssignments = assignments.filter((a) => a.date === day.date);
            const dayWeather = weatherData.find((w) => w.date === day.date);

            return (
              <DayColumn
                key={day.date}
                date={day.date}
                dayLabel={day.label}
                isToday={day.isToday}
                assignments={dayAssignments}
                worksites={worksites}
                employees={employees}
                vehicles={vehicles}
                equipment={equipment}
                conflicts={conflicts}
                weather={dayWeather}
                onCardClick={onSelectAssignment}
                onAddAssignmentClick={onAddAssignment}
                onAddEmployeeClick={onAddEmployeeToAssignment}
                onSwapEmployeeClick={onSwapEmployeesInAssignment}
                onDeleteAssignmentClick={onDeleteAssignment}
              />
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE PANEL: UNASSIGNED / ABSENT STAFF & RESOURCES */}
      <div className="w-full xl:w-80 shrink-0 xl:sticky xl:top-4">
        <UnassignedPanel
          employees={employees}
          absences={absences}
          vehicles={vehicles}
          equipment={equipment}
          currentAssignments={assignments}
          weekStartDate={currentWeek.startDate}
          weekEndDate={currentWeek.endDate}
          onAssignEmployeeQuick={onQuickAssignEmployee}
          onAssignResourceQuick={onQuickAssignResource}
        />
      </div>
    </div>
  );
};
