import React, { useState, useMemo } from 'react';
import {
  Truck,
  Wrench,
  Check,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Activity,
  Info,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Vehicle, Equipment, WorksiteAssignment } from '../../types';

interface ResourceLegendProps {
  vehicles: Vehicle[];
  equipment: Equipment[];
  assignments: WorksiteAssignment[];
  currentMonthDate: string; // YYYY-MM
  selectedResourceIds: string[];
  onToggleResourceId: (id: string) => void;
  onClearResourceSelection: () => void;
  onSelectAllResources: () => void;
  onSelectOnlyBusyResources: () => void;
  isDarkMode?: boolean;
}

export const ResourceLegend: React.FC<ResourceLegendProps> = ({
  vehicles,
  equipment,
  assignments,
  currentMonthDate,
  selectedResourceIds,
  onToggleResourceId,
  onClearResourceSelection,
  onSelectAllResources,
  onSelectOnlyBusyResources,
  isDarkMode = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VEHICLES' | 'EQUIPMENT'>('ALL');

  // Compute month utilization per resource
  const resourceStats = useMemo(() => {
    const monthAssignments = assignments.filter((a) => a.date.startsWith(currentMonthDate));

    const statsMap: Record<
      string,
      {
        count: number;
        dates: Set<string>;
        isDoubleBooked: boolean;
      }
    > = {};

    // Helper to init
    const initStat = (id: string) => {
      if (!statsMap[id]) {
        statsMap[id] = { count: 0, dates: new Set(), isDoubleBooked: false };
      }
    };

    vehicles.forEach((v) => initStat(v.id));
    equipment.forEach((eq) => initStat(eq.id));

    // Calculate dates and overlaps per date
    const dateResourceCounts: Record<string, Record<string, number>> = {};

    monthAssignments.forEach((asg) => {
      const d = asg.date;
      if (!dateResourceCounts[d]) dateResourceCounts[d] = {};

      const allAssigned = [...asg.assignedVehicleIds, ...asg.assignedEquipmentIds];

      allAssigned.forEach((resId) => {
        initStat(resId);
        statsMap[resId].count += 1;
        statsMap[resId].dates.add(d);

        dateResourceCounts[d][resId] = (dateResourceCounts[d][resId] || 0) + 1;
        if (dateResourceCounts[d][resId] > 1) {
          statsMap[resId].isDoubleBooked = true;
        }
      });
    });

    return statsMap;
  }, [assignments, currentMonthDate, vehicles, equipment]);

  // Total busy stats
  const busyVehiclesCount = useMemo(() => {
    return vehicles.filter((v) => (resourceStats[v.id]?.count || 0) > 0).length;
  }, [vehicles, resourceStats]);

  const busyEquipmentCount = useMemo(() => {
    return equipment.filter((eq) => (resourceStats[eq.id]?.count || 0) > 0).length;
  }, [equipment, resourceStats]);

  const activeSelectedCount = selectedResourceIds.length;

  return (
    <div
      className={`mx-6 my-3 rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
        isDarkMode
          ? 'bg-[#141416] border-[#25262B] text-[#F2F4F5]'
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* SUMMARY HEADER BAR */}
      <div
        className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 select-none ${
          isDarkMode ? 'bg-[#18191D]' : 'bg-slate-100/80'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl flex items-center justify-center ${
              isDarkMode
                ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                : 'bg-violet-100 text-violet-700'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Interaktive Ressourcen-Legende
              </h3>
              {activeSelectedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500 text-white font-mono animate-pulse">
                  {activeSelectedCount} Hervorgehoben
                </span>
              )}
            </div>
            <p
              className={`text-[11px] font-medium mt-0.5 ${
                isDarkMode ? 'text-[#858B90]' : 'text-slate-500'
              }`}
            >
              Klicken Sie auf Ressourcen, um diese auf dem Kalender hervorzuheben.
            </p>
          </div>
        </div>

        {/* QUICK STATS & CONTROLS */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Metrics Badges */}
          <div
            className={`flex items-center space-x-3 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium ${
              isDarkMode ? 'bg-[#0C0C0C] border-[#25262B]' : 'bg-white border-slate-200'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>
                <strong className="text-sky-400">{busyVehiclesCount}</strong>/{vehicles.length} KFZ
              </span>
            </span>
            <span className="text-[#858B90]">|</span>
            <span className="flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-purple-400" />
              <span>
                <strong className="text-purple-400">{busyEquipmentCount}</strong>/{equipment.length} Geräte
              </span>
            </span>
          </div>

          {/* Quick Action Selection Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onSelectAllResources}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-[#202124] hover:bg-[#2A2B30] border-[#292A2E] text-neutral-300'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Alle Fahrzeuge und Geräte auswählen"
            >
              Alle wählen
            </button>

            <button
              onClick={onSelectOnlyBusyResources}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-[#202124] hover:bg-[#2A2B30] border-[#292A2E] text-emerald-400'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-emerald-700'
              }`}
              title="Nur im aktuellen Monat belegte Ressourcen auswählen"
            >
              Nur Belegte
            </button>

            {activeSelectedCount > 0 && (
              <button
                onClick={onClearResourceSelection}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 transition-colors flex items-center space-x-1"
                title="Auswahl zurücksetzen"
              >
                <X className="w-3 h-3" />
                <span>Zurücksetzen</span>
              </button>
            )}
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-[#202124] hover:bg-[#2A2B30] border-[#292A2E] text-[#BBC2C7]'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title={isExpanded ? 'Legende einklappen' : 'Legende ausklappen'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EXPANDED LEGEND BODY */}
      {isExpanded && (
        <div className="p-4 border-t border-[#25262B]/80">
          {/* TAB SWITCHER */}
          <div className="flex items-center space-x-2 mb-3.5">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                activeTab === 'ALL'
                  ? 'bg-violet-500 text-white border-violet-500 shadow-xs'
                  : isDarkMode
                  ? 'bg-[#1C1D21] border-[#292A2E] text-[#858B90] hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              Alle Ressourcen ({vehicles.length + equipment.length})
            </button>

            <button
              onClick={() => setActiveTab('VEHICLES')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center space-x-1.5 ${
                activeTab === 'VEHICLES'
                  ? 'bg-sky-500 text-slate-950 font-bold border-sky-500 shadow-xs'
                  : isDarkMode
                  ? 'bg-[#1C1D21] border-[#292A2E] text-[#858B90] hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Fahrzeuge ({vehicles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('EQUIPMENT')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center space-x-1.5 ${
                activeTab === 'EQUIPMENT'
                  ? 'bg-purple-500 text-white font-bold border-purple-500 shadow-xs'
                  : isDarkMode
                  ? 'bg-[#1C1D21] border-[#292A2E] text-[#858B90] hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-purple-400" />
              <span>Geräte ({equipment.length})</span>
            </button>
          </div>

          {/* GRID MATRIX FOR VEHICLES & EQUIPMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {/* VEHICLES SECTION */}
            {(activeTab === 'ALL' || activeTab === 'VEHICLES') &&
              vehicles.map((v) => {
                const stat = resourceStats[v.id] || { count: 0, dates: new Set(), isDoubleBooked: false };
                const isSelected = selectedResourceIds.includes(v.id);
                const isBusy = stat.count > 0;

                return (
                  <div
                    key={v.id}
                    onClick={() => onToggleResourceId(v.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all duration-150 relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400 shadow-md ring-2 ring-sky-400/30'
                        : isDarkMode
                        ? 'bg-[#1A1B20] border-[#2A2C33] hover:border-[#3E414C]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Plate + Check */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="font-mono text-xs font-bold text-sky-300 truncate">
                            {v.licensePlate}
                          </span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-sky-400 border-sky-400 text-slate-950'
                              : isDarkMode
                              ? 'border-[#45474D] bg-[#101114]'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Vehicle Name & Type */}
                      <p className="text-xs font-semibold text-neutral-200 truncate mb-2">
                        {v.name}
                      </p>
                    </div>

                    {/* Bottom Row: Utilization Status */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#282A30] text-[10px] font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          stat.isDoubleBooked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : isBusy
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {stat.isDoubleBooked
                          ? '⚠️ Doppelbuchung'
                          : isBusy
                          ? `${stat.count} ${stat.count === 1 ? 'Einsatz' : 'Einsätze'}`
                          : 'Frei'}
                      </span>

                      <span className="text-[#858B90]">{v.type}</span>
                    </div>
                  </div>
                );
              })}

            {/* EQUIPMENT SECTION */}
            {(activeTab === 'ALL' || activeTab === 'EQUIPMENT') &&
              equipment.map((eq) => {
                const stat = resourceStats[eq.id] || { count: 0, dates: new Set(), isDoubleBooked: false };
                const isSelected = selectedResourceIds.includes(eq.id);
                const isBusy = stat.count > 0;

                return (
                  <div
                    key={eq.id}
                    onClick={() => onToggleResourceId(eq.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all duration-150 relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-400 shadow-md ring-2 ring-purple-400/30'
                        : isDarkMode
                        ? 'bg-[#1A1B20] border-[#2A2C33] hover:border-[#3E414C]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Name + Check */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <Wrench className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="text-xs font-bold text-purple-300 truncate">
                            {eq.category}
                          </span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-purple-400 border-purple-400 text-slate-950'
                              : isDarkMode
                              ? 'border-[#45474D] bg-[#101114]'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Equipment Name */}
                      <p className="text-xs font-semibold text-neutral-200 truncate mb-2" title={eq.name}>
                        {eq.name}
                      </p>
                    </div>

                    {/* Bottom Row: Utilization Status */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#282A30] text-[10px] font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          stat.isDoubleBooked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : isBusy
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {stat.isDoubleBooked
                          ? '⚠️ Doppelbuchung'
                          : isBusy
                          ? `${stat.count} ${stat.count === 1 ? 'Einsatz' : 'Einsätze'}`
                          : 'Frei'}
                      </span>

                      {eq.isExclusive && (
                        <span className="text-amber-400 font-semibold" title="Exklusive Zuordnung">
                          Exklusiv
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
