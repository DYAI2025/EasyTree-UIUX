import React from 'react';
import { Calendar, Users, HardHat, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PlanningWeek, WorksiteAssignment, Employee, Worksite } from '../../types';
import { calculateHours } from '../../domain/conflictEngine';

interface FourWeekPlannerProps {
  weeks: PlanningWeek[];
  assignments: WorksiteAssignment[];
  employees: Employee[];
  worksites: Worksite[];
  onSelectWeek: (weekIndex: number) => void;
}

export const FourWeekPlanner: React.FC<FourWeekPlannerProps> = ({
  weeks,
  assignments,
  employees,
  worksites,
  onSelectWeek,
}) => {
  const totalCapacityHoursPerWeek = employees.reduce((sum, e) => sum + e.maxWeeklyHours, 0);

  return (
    <div className="max-w-[1600px] mx-auto p-4 select-none">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            Vier-Wochen-Planungsübersicht (4W)
          </h2>
          <p className="text-xs text-neutral-400">
            Klicke auf eine Kalenderwoche, um die detaillierte Tagesplanung zu öffnen.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeks.map((week, idx) => {
          // Calculate week stats
          const weekAssignments = assignments.filter(
            (a) => a.date >= week.startDate && a.date <= week.endDate
          );

          const activeSiteIds = new Set(weekAssignments.map((a) => a.worksiteId));
          const uniqueEmpsAssigned = new Set(weekAssignments.flatMap((a) => a.assignedEmployeeIds));

          let weekPlannedHours = 0;
          weekAssignments.forEach((a) => {
            const h = calculateHours(a.startTime, a.endTime);
            weekPlannedHours += h * a.assignedEmployeeIds.length;
          });

          return (
            <div
              key={week.weekNumber}
              onClick={() => onSelectWeek(idx)}
              className="group bg-[#171717] hover:bg-[#202124] border border-[#45474D] hover:border-sky-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-lg focus-ring"
            >
              <div>
                {/* WEEK HEADER */}
                <div className="flex items-center justify-between gap-2 border-b border-[#292A2E] pb-3 mb-4">
                  <div>
                    <span className="text-lg font-bold text-neutral-100">
                      KW {week.weekNumber}
                    </span>
                    <div className="text-xs text-neutral-400">
                      {week.startDate} bis {week.endDate}
                    </div>
                  </div>

                  {week.isPublished ? (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Veröffentlicht
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Entwurf
                    </span>
                  )}
                </div>

                {/* STATS LIST */}
                <div className="space-y-3 text-xs mb-6">
                  {/* Active Sites */}
                  <div className="flex items-center justify-between text-neutral-300 bg-[#202124] p-2.5 rounded-lg border border-[#32343A]">
                    <span className="flex items-center gap-2 text-neutral-400">
                      <HardHat className="w-4 h-4 text-emerald-400" />
                      Baustellen:
                    </span>
                    <span className="font-bold text-neutral-100">
                      {activeSiteIds.size} aktiv
                    </span>
                  </div>

                  {/* Employees Assigned */}
                  <div className="flex items-center justify-between text-neutral-300 bg-[#202124] p-2.5 rounded-lg border border-[#32343A]">
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Users className="w-4 h-4 text-sky-400" />
                      Eingeplante Mitarbeiter:
                    </span>
                    <span className="font-bold text-neutral-100">
                      {uniqueEmpsAssigned.size} von {employees.length}
                    </span>
                  </div>

                  {/* Planned Hours */}
                  <div className="flex items-center justify-between text-neutral-300 bg-[#202124] p-2.5 rounded-lg border border-[#32343A]">
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Geplante Person-Std.:
                    </span>
                    <span className="font-bold text-neutral-100">
                      {Math.round(weekPlannedHours)} h
                    </span>
                  </div>
                </div>
              </div>

              {/* FOOTER CALL TO ACTION */}
              <div className="flex items-center justify-between border-t border-[#292A2E] pt-3 text-xs text-sky-400 font-medium group-hover:text-sky-300">
                <span>Wochenplanung öffnen</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
