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
import { WeatherForecastOverlay } from '../weather/WeatherForecastOverlay';

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
  onFilterWeatherConflicts?: () => void;
  onMoveEmployee?: (
    employeeId: string,
    targetAssignmentId: string,
    sourceAssignmentId?: string
  ) => void;
  onUnassignEmployee?: (employeeId: string, sourceAssignmentId: string) => void;
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
  onFilterWeatherConflicts,
  onMoveEmployee,
  onUnassignEmployee,
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

  // Selected day for focused mobile view ('ALL' or index 0-4)
  const [selectedMobileDay, setSelectedMobileDay] = React.useState<string>('ALL');

  return (
    <div className="flex flex-col w-full">
      {/* 5-DAY WEATHER FORECAST & OPERATIONAL RISK OVERLAY */}
      <WeatherForecastOverlay
        startDate={currentWeek.startDate}
        weatherData={weatherData}
        assignments={assignments}
        employees={employees}
        equipment={equipment}
        worksites={worksites}
        onFilterWeatherConflicts={onFilterWeatherConflicts}
      />

      <div className="max-w-[1800px] w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col xl:flex-row gap-6 items-start">
        {/* MOBILE DAY SELECTOR TABS (Visible on small screens < lg) */}
        <div className="w-full xl:hidden flex items-center space-x-1.5 p-1 rounded-xl bg-neutral-900/40 border border-neutral-800/80 overflow-x-auto no-scrollbar mb-2">
          <button
            onClick={() => setSelectedMobileDay('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
              selectedMobileDay === 'ALL'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Alle 5 Tage
          </button>
          {weekDates.map((day, idx) => {
            const shortDay = day.label.split(',')[0].slice(0, 2); // 'Mo', 'Di', etc.
            const dayNum = day.label.split(' ')[1]; // '14.'

            return (
              <button
                key={day.date}
                onClick={() => setSelectedMobileDay(String(idx))}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 flex items-center space-x-1 ${
                  selectedMobileDay === String(idx)
                    ? 'bg-sky-500 text-neutral-950 shadow-sm'
                    : day.isToday
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>{shortDay}</span>
                <span className="text-[10px] opacity-80">{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* CENTRAL WEEK BOARD GRID (MON - FRI) */}
        <div className="flex-1 w-full overflow-x-auto pb-4 custom-scrollbar">
          <div
            className={`grid gap-4 ${
              selectedMobileDay !== 'ALL'
                ? 'grid-cols-1 w-full'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 min-w-full xl:min-w-[1420px]'
            }`}
          >
            {weekDates
              .filter((_, idx) => selectedMobileDay === 'ALL' || selectedMobileDay === String(idx))
              .map((day) => {
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
                    onMoveEmployee={onMoveEmployee}
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
            onUnassignEmployee={onUnassignEmployee}
          />
        </div>
      </div>
    </div>
  );
};

