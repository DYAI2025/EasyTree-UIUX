import React, { useState } from 'react';
import {
  Worksite,
  Employee,
  Vehicle,
  Equipment,
  WorksiteAssignment,
  CalendarFilters,
  PlanningConflict,
} from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Truck,
  Eye,
  EyeOff,
  Filter,
  Check,
  Calendar as CalendarIcon,
  Sparkles,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { getHolidayInfo, isBrandenburgHolidayOrWeekend } from '../../domain/holidaysEngine';
import { ResourceLegend } from './ResourceLegend';

interface MonthCalendarViewProps {
  currentMonthDate: string; // YYYY-MM
  onMonthChange: (newMonthDate: string) => void;
  assignments: WorksiteAssignment[];
  worksites: Worksite[];
  employees: Employee[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  calendarFilters: CalendarFilters;
  onUpdateCalendarFilters: (filters: Partial<CalendarFilters>) => void;
  onSelectAssignment: (assignmentId: string) => void;
  onOpenQuickAdd: (date: string) => void;
  conflicts: PlanningConflict[];
  isDarkMode?: boolean;
}

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  currentMonthDate,
  onMonthChange,
  assignments,
  worksites,
  employees,
  vehicles,
  equipment,
  calendarFilters,
  onUpdateCalendarFilters,
  onSelectAssignment,
  onOpenQuickAdd,
  conflicts,
  isDarkMode = true,
}) => {
  const [showWorksiteFilterMenu, setShowWorksiteFilterMenu] = useState(false);

  const selectedResourceIds = calendarFilters.selectedResourceIds || [];

  // Parse YYYY-MM
  const [yearStr, monthStr] = currentMonthDate.split('-');
  const year = parseInt(yearStr, 10) || 2026;
  const month = parseInt(monthStr, 10) || 9; // 1-indexed

  // Month navigation helpers
  const handlePrevMonth = () => {
    let newM = month - 1;
    let newY = year;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    onMonthChange(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newM = month + 1;
    let newY = year;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    onMonthChange(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  // Resource Selection Handlers
  const handleToggleResourceId = (id: string) => {
    const current = calendarFilters.selectedResourceIds || [];
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    onUpdateCalendarFilters({ selectedResourceIds: next });
  };

  const handleClearResourceSelection = () => {
    onUpdateCalendarFilters({ selectedResourceIds: [] });
  };

  const handleSelectAllResources = () => {
    const allIds = [...vehicles.map((v) => v.id), ...equipment.map((e) => e.id)];
    onUpdateCalendarFilters({ selectedResourceIds: allIds });
  };

  const handleSelectOnlyBusyResources = () => {
    const monthAssignments = assignments.filter((a) => a.date.startsWith(currentMonthDate));
    const busyIdsSet = new Set<string>();
    monthAssignments.forEach((a) => {
      a.assignedVehicleIds.forEach((id) => busyIdsSet.add(id));
      a.assignedEquipmentIds.forEach((id) => busyIdsSet.add(id));
    });
    onUpdateCalendarFilters({ selectedResourceIds: Array.from(busyIdsSet) });
  };

  // Month name
  const monthDateObj = new Date(year, month - 1, 1);
  const monthName = monthDateObj.toLocaleString('de-DE', { month: 'long', year: 'numeric' });

  // Calculate calendar days matrix
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const calendarDays: Array<{
    dateIso: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    dayOfWeek: number; // 0 = Mon, 6 = Sun
  }> = [];

  // Padding previous month days
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevM = month - 1 < 1 ? 12 : month - 1;
    const prevY = month - 1 < 1 ? year - 1 : year;
    const dateIso = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dateIso,
      dayNumber: d,
      isCurrentMonth: false,
      dayOfWeek: (calendarDays.length) % 7,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateIso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dateIso,
      dayNumber: d,
      isCurrentMonth: true,
      dayOfWeek: (calendarDays.length) % 7,
    });
  }

  // Trailing next month days to complete week grid
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month + 1 > 12 ? 1 : month + 1;
    const nextY = month + 1 > 12 ? year + 1 : year;
    const dateIso = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dateIso,
      dayNumber: d,
      isCurrentMonth: false,
      dayOfWeek: (calendarDays.length) % 7,
    });
  }

  // Toggle worksite visibility
  const toggleWorksite = (worksiteId: string) => {
    const disabled = calendarFilters.disabledWorksiteIds || [];
    if (disabled.includes(worksiteId)) {
      onUpdateCalendarFilters({
        disabledWorksiteIds: disabled.filter((id) => id !== worksiteId),
      });
    } else {
      onUpdateCalendarFilters({
        disabledWorksiteIds: [...disabled, worksiteId],
      });
    }
  };

  const toggleAllWorksites = (enable: boolean) => {
    if (enable) {
      onUpdateCalendarFilters({ disabledWorksiteIds: [] });
    } else {
      onUpdateCalendarFilters({ disabledWorksiteIds: worksites.map((w) => w.id) });
    }
  };

  // Weekday names
  const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  // Filter calendar days if "Alle Wochenende+Feiertage (nur für Brandenburg) ausblenden" is active
  const filteredDays = calendarDays.filter((day) => {
    if (calendarFilters.hideWeekendsAndBBHolidays) {
      return !isBrandenburgHolidayOrWeekend(day.dateIso);
    }
    return true;
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-["Zag",_ui-sans-serif,_system-ui,_-apple-system,_BlinkMacSystemFont,_"Segoe_UI",_Roboto,_"Helvetica_Neue",_Arial,_sans-serif] tracking-wide transition-colors ${
        isDarkMode ? 'bg-[#0C0C0C] text-[#F2F4F5]' : 'bg-white text-slate-900'
      }`}
    >
      {/* TOP CALENDAR CONTROL BAR & FILTERS */}
      <div
        className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 select-none ${
          isDarkMode ? 'bg-[#171717] border-[#202124]' : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Left: Month Selector & Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-[#BBC2C7] hover:text-white hover:bg-[#202124]'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Vorheriger Monat"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold tracking-tight uppercase font-mono px-2">
              {monthName}
            </h2>
            <button
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-[#BBC2C7] hover:text-white hover:bg-[#202124]'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Nächster Monat"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-[#0C0C0C] border-[#292A2E] text-[#BBC2C7] hover:text-white hover:bg-[#202124]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Heute
          </button>
        </div>

        {/* Right: Specific Requested Calendar Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter 1: Individual Worksites Multi-Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowWorksiteFilterMenu(!showWorksiteFilterMenu)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                (calendarFilters.disabledWorksiteIds || []).length > 0
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                  : isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-[#BBC2C7] hover:bg-[#202124]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Baustellen-Filter</span>
              {(calendarFilters.disabledWorksiteIds || []).length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-500 text-slate-950 font-bold rounded-full font-mono">
                  {worksites.length - (calendarFilters.disabledWorksiteIds || []).length}/
                  {worksites.length}
                </span>
              )}
            </button>

            {/* Worksite Filter Dropdown */}
            {showWorksiteFilterMenu && (
              <div
                className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDarkMode
                    ? 'bg-[#171717] border-[#292A2E] text-[#F2F4F5]'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#292A2E]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#858B90]">
                    Baustellen ein/ausblenden
                  </span>
                  <div className="flex space-x-2 text-[10px]">
                    <button
                      onClick={() => toggleAllWorksites(true)}
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      Alle an
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => toggleAllWorksites(false)}
                      className="text-rose-400 hover:underline font-semibold"
                    >
                      Alle aus
                    </button>
                  </div>
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {worksites.map((w) => {
                    const isDisabled = (calendarFilters.disabledWorksiteIds || []).includes(w.id);
                    return (
                      <button
                        key={w.id}
                        onClick={() => toggleWorksite(w.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          !isDisabled
                            ? isDarkMode
                              ? 'bg-[#202124] border-[#292A2E] text-white'
                              : 'bg-slate-100 border-slate-200 text-slate-900'
                            : isDarkMode
                            ? 'bg-[#0C0C0C]/50 border-transparent text-[#858B90] line-through'
                            : 'bg-slate-50 border-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: w.hexColor }}
                          />
                          <span className="font-bold truncate">{w.location}</span>
                          <span className="text-[10px] text-[#858B90]">({w.code})</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            !isDisabled
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-500'
                          }`}
                        >
                          {!isDisabled && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Filter 2: Personen Ausblenden */}
          <button
            onClick={() =>
              onUpdateCalendarFilters({ hideEmployees: !calendarFilters.hideEmployees })
            }
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              calendarFilters.hideEmployees
                ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                : isDarkMode
                ? 'bg-[#0C0C0C] border-[#292A2E] text-[#BBC2C7] hover:bg-[#202124]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {calendarFilters.hideEmployees ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Users className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>Personen ausblenden</span>
          </button>

          {/* Filter 3: Ressourcen Ausblenden */}
          <button
            onClick={() =>
              onUpdateCalendarFilters({ hideResources: !calendarFilters.hideResources })
            }
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              calendarFilters.hideResources
                ? 'bg-violet-500/10 border-violet-500/50 text-violet-400'
                : isDarkMode
                ? 'bg-[#0C0C0C] border-[#292A2E] text-[#BBC2C7] hover:bg-[#202124]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {calendarFilters.hideResources ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Truck className="w-3.5 h-3.5 text-violet-400" />
            )}
            <span>Ressourcen ausblenden</span>
          </button>

          {/* Filter 4: Wochenende & BB-Feiertage ausblenden */}
          <button
            onClick={() =>
              onUpdateCalendarFilters({
                hideWeekendsAndBBHolidays: !calendarFilters.hideWeekendsAndBBHolidays,
              })
            }
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              calendarFilters.hideWeekendsAndBBHolidays
                ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                : isDarkMode
                ? 'bg-[#0C0C0C] border-[#292A2E] text-[#BBC2C7] hover:bg-[#202124]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>Wochenende & BB-Feiertage ausblenden</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE RESOURCE LEGEND & UTILIZATION BOARD */}
      <ResourceLegend
        vehicles={vehicles}
        equipment={equipment}
        assignments={assignments}
        currentMonthDate={currentMonthDate}
        selectedResourceIds={selectedResourceIds}
        onToggleResourceId={handleToggleResourceId}
        onClearResourceSelection={handleClearResourceSelection}
        onSelectAllResources={handleSelectAllResources}
        onSelectOnlyBusyResources={handleSelectOnlyBusyResources}
        isDarkMode={isDarkMode}
      />

      {/* WEEKDAY HEADERS */}
      {!calendarFilters.hideWeekendsAndBBHolidays ? (
        <div
          className={`grid grid-cols-7 border-b text-center py-2.5 font-bold text-xs uppercase tracking-wider ${
            isDarkMode ? 'bg-[#171717] border-[#202124] text-[#858B90]' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}
        >
          {dayNames.map((name, idx) => (
            <div key={name} className={idx >= 5 ? 'text-rose-400/80 font-mono' : ''}>
              {name}
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`px-6 py-2 border-b text-xs font-semibold text-rose-400 flex items-center space-x-2 ${
            isDarkMode ? 'bg-rose-950/20 border-rose-900/30' : 'bg-rose-50 border-rose-100'
          }`}
        >
          <span>ℹ️ Wochenenden und Brandenburg-Feiertage sind ausgeblendet</span>
        </div>
      )}

      {/* CALENDAR GRID MATRIX */}
      <div
        className={`flex-1 grid gap-2.5 p-3.5 ${
          !calendarFilters.hideWeekendsAndBBHolidays
            ? 'grid-cols-7'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
        } ${isDarkMode ? 'bg-[#0C0C0C]' : 'bg-slate-100'}`}
      >
        {filteredDays.map((day) => {
          // Check for regional holiday
          const holidayInfo = getHolidayInfo(day.dateIso, 'BB'); // Brandenburg check
          const isWeekend = day.dayOfWeek === 5 || day.dayOfWeek === 6; // Sat or Sun

          // Filter assignments for this date
          const dayAssignments = assignments.filter((asg) => {
            if (asg.date !== day.dateIso) return false;
            if (
              calendarFilters.disabledWorksiteIds &&
              calendarFilters.disabledWorksiteIds.includes(asg.worksiteId)
            ) {
              return false;
            }
            return true;
          });

          // Check if today
          const isToday =
            new Date().toISOString().split('T')[0] === day.dateIso;

          return (
            <div
              key={day.dateIso}
              className={`min-h-[150px] p-3.5 rounded-2xl border flex flex-col justify-between group relative transition-all shadow-xs ${
                !day.isCurrentMonth
                  ? isDarkMode
                    ? 'bg-[#121214]/60 border-[#1A1A1E] text-neutral-600'
                    : 'bg-slate-50/70 border-slate-200/60 text-slate-400'
                  : isToday
                  ? isDarkMode
                    ? 'bg-[#181A20] border-emerald-500/50 shadow-emerald-500/5'
                    : 'bg-emerald-50/40 border-emerald-400'
                  : isWeekend || holidayInfo
                  ? isDarkMode
                    ? 'bg-[#141417] border-[#222328]'
                    : 'bg-slate-100/70 border-slate-200'
                  : isDarkMode
                  ? 'bg-[#171717] border-[#25262B] hover:border-[#353740]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-transparent">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-mono text-sm font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-sm'
                        : day.isCurrentMonth
                        ? isDarkMode
                          ? 'text-[#F2F4F5]'
                          : 'text-slate-800'
                        : isDarkMode
                        ? 'text-[#858B90]/50'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Holiday Badge */}
                  {holidayInfo && (
                    <span
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 truncate max-w-[120px]"
                      title={`Feiertag: ${holidayInfo.name} (${holidayInfo.states.join(', ')})`}
                    >
                      🎉 {holidayInfo.name}
                    </span>
                  )}
                </div>

                {/* Quick Add Hover Button */}
                <button
                  onClick={() => onOpenQuickAdd(day.dateIso)}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 ${
                    isDarkMode
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                  title="Einsatz auf diesem Tag erfassen"
                >
                  <Plus className="w-3 h-3" />
                  <span>Neu</span>
                </button>
              </div>

              {/* Day Assignments List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[240px] pr-1 py-0.5 custom-scrollbar">
                {dayAssignments.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-5">
                    <span
                      className={`text-[11px] italic font-light ${
                        isDarkMode ? 'text-[#858B90]/40' : 'text-slate-400'
                      }`}
                    >
                      Keine Einsätze
                    </span>
                  </div>
                ) : (
                  dayAssignments.map((asg) => {
                    const ws = worksites.find((w) => w.id === asg.worksiteId);
                    const hex = ws?.hexColor || '#4AA8E8';
                    const location = ws?.location || 'Unbekannter Ort';
                    const isDraft = asg.status === 'draft';

                    // Assigned workers
                    const assignedEmps = employees.filter((e) =>
                      asg.assignedEmployeeIds.includes(e.id)
                    );
                    // Assigned vehicles & equipment
                    const assignedVehs = vehicles.filter((v) =>
                      asg.assignedVehicleIds.includes(v.id)
                    );
                    const assignedEqs = equipment.filter((eq) =>
                      asg.assignedEquipmentIds.includes(eq.id)
                    );

                    // Check resource match
                    const hasResourceMatch =
                      selectedResourceIds.length > 0 &&
                      (asg.assignedVehicleIds.some((id) => selectedResourceIds.includes(id)) ||
                        asg.assignedEquipmentIds.some((id) => selectedResourceIds.includes(id)));

                    const isDimmed = selectedResourceIds.length > 0 && !hasResourceMatch;

                    return (
                      <div
                        key={asg.id}
                        onClick={() => onSelectAssignment(asg.id)}
                        className={`p-3 rounded-xl border shadow-sm cursor-pointer transition-all ${
                          hasResourceMatch
                            ? 'ring-2 ring-violet-400 shadow-md shadow-violet-500/20 bg-violet-950/25 scale-[1.015]'
                            : isDimmed
                            ? 'opacity-35 grayscale-[0.25] hover:opacity-100 hover:grayscale-0'
                            : isDraft
                            ? 'border-dashed border-amber-400/80 bg-amber-500/10 animate-pulse'
                            : isDarkMode
                            ? 'bg-[#222327] border-[#303239] hover:border-[#4A4D57]'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                        style={{
                          borderLeftWidth: '5px',
                          borderLeftColor: hex,
                        }}
                      >
                        {/* Primary Label: Location of the Worksite */}
                        <div className="flex items-center justify-between mb-1.5 gap-1">
                          <span
                            className="text-xs font-black tracking-tight uppercase truncate"
                            style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }}
                          >
                            📍 {location}
                          </span>

                          <div className="flex items-center space-x-1 shrink-0">
                            {hasResourceMatch && (
                              <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-violet-500 text-white uppercase font-mono shadow-xs">
                                Match
                              </span>
                            )}
                            {isDraft && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-400 text-slate-950 uppercase font-mono">
                                Entwurf
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Activity Name & Worksite Code */}
                        <p
                          className={`text-[11px] font-medium leading-relaxed truncate ${
                            isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-600'
                          }`}
                        >
                          {ws?.code}: {asg.activityName}
                        </p>

                        {/* Time Slot */}
                        <p className="text-[10px] font-mono text-[#858B90] mt-1">
                          ⏰ {asg.startTime} – {asg.endTime}
                        </p>

                        {/* Assigned Employees (If not hidden) */}
                        {!calendarFilters.hideEmployees && assignedEmps.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-[#292A2E]/60">
                            <Users className="w-3 h-3 text-sky-400 shrink-0" />
                            {assignedEmps.map((emp) => (
                              <span
                                key={emp.id}
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                                  emp.isLeader
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : isDarkMode
                                    ? 'bg-[#171717] text-[#BBC2C7] border border-[#292A2E]'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                                title={`${emp.firstName} ${emp.lastName} (${emp.role})`}
                              >
                                {emp.initials}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Assigned Resources (If not hidden) */}
                        {!calendarFilters.hideResources &&
                          (assignedVehs.length > 0 || assignedEqs.length > 0) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 font-mono text-[10px] text-[#858B90]">
                              <Truck className="w-3 h-3 text-violet-400 shrink-0" />
                              {assignedVehs.map((v) => {
                                const isVehSelected = selectedResourceIds.includes(v.id);
                                return (
                                  <span
                                    key={v.id}
                                    className={`truncate max-w-[90px] px-1 py-0.2 rounded ${
                                      isVehSelected
                                        ? 'bg-sky-500/30 text-sky-200 border border-sky-400 font-bold'
                                        : ''
                                    }`}
                                  >
                                    {v.licensePlate}
                                  </span>
                                );
                              })}
                              {assignedEqs.map((eq) => {
                                const isEqSelected = selectedResourceIds.includes(eq.id);
                                return (
                                  <span
                                    key={eq.id}
                                    className={`truncate max-w-[90px] px-1 py-0.2 rounded ${
                                      isEqSelected
                                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400 font-bold'
                                        : ''
                                    }`}
                                  >
                                    {eq.name}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
