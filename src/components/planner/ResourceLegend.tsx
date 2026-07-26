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
      className={`mx-6 my-3 rounded-2xl border transition-all duration-200 overflow-hidden shadow-md ${
        isDarkMode
          ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] wood-grain-h wood-burnt-edge text-[var(--wood-text-primary)]'
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* SUMMARY HEADER BAR */}
      <div
        className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 select-none ${
          isDarkMode ? 'bg-[var(--wood-base)] border-b border-[var(--wood-border)]' : 'bg-slate-100/80'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl flex items-center justify-center ${
              isDarkMode
                ? 'bg-[var(--wood-seam)] text-[var(--wood-ash)] border border-[var(--wood-border)]'
                : 'bg-violet-100 text-violet-700'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--wood-text-primary)]">
                Interaktive Ressourcen-Legende
              </h3>
              {activeSelectedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--wood-ash)] text-[var(--wood-seam)] font-mono animate-pulse">
                  {activeSelectedCount} Hervorgehoben
                </span>
              )}
            </div>
            <p
              className={`text-[11px] font-medium mt-0.5 ${
                isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-slate-500'
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
              isDarkMode ? 'bg-[var(--wood-seam)] border-[var(--wood-border)]' : 'bg-white border-slate-200'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Truck className="w-3.5 h-3.5 text-[var(--wood-info)]" />
              <span>
                <strong className="text-[var(--wood-info)]">{busyVehiclesCount}</strong>/{vehicles.length} KFZ
              </span>
            </span>
            <span className="text-[var(--wood-text-muted)]">|</span>
            <span className="flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-[var(--wood-ash)]" />
              <span>
                <strong className="text-[var(--wood-ash)]">{busyEquipmentCount}</strong>/{equipment.length} Geräte
              </span>
            </span>
          </div>

          {/* Quick Action Selection Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onSelectAllResources}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-[var(--wood-raised)] hover:bg-[var(--wood-selected)] border-[var(--wood-border)] text-[var(--wood-text-secondary)] hover:text-[var(--wood-text-primary)]'
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
                  ? 'bg-[var(--wood-raised)] hover:bg-[var(--wood-selected)] border-[var(--wood-border)] text-[var(--wood-moss)]'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-emerald-700'
              }`}
              title="Nur im aktuellen Monat belegte Ressourcen auswählen"
            >
              Nur Belegte
            </button>

            {activeSelectedCount > 0 && (
              <button
                onClick={onClearResourceSelection}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border bg-[var(--wood-burnt-red)]/10 hover:bg-[var(--wood-burnt-red)]/20 border-[var(--wood-burnt-red)]/30 text-[var(--wood-burnt-red)] transition-colors flex items-center space-x-1"
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
                ? 'bg-[var(--wood-raised)] hover:bg-[var(--wood-selected)] border-[var(--wood-border)] text-[var(--wood-text-secondary)]'
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
        <div className="p-4 border-t border-[var(--wood-border)]">
          {/* TAB SWITCHER */}
          <div className="flex items-center space-x-2 mb-3.5">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                activeTab === 'ALL'
                  ? 'bg-[var(--wood-ash)] text-[var(--wood-seam)] font-bold border-[var(--wood-ash)] shadow-xs'
                  : isDarkMode
                  ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              Alle Ressourcen ({vehicles.length + equipment.length})
            </button>

            <button
              onClick={() => setActiveTab('VEHICLES')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center space-x-1.5 ${
                activeTab === 'VEHICLES'
                  ? 'bg-[var(--wood-info)] text-[var(--wood-seam)] font-bold border-[var(--wood-info)] shadow-xs'
                  : isDarkMode
                  ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Fahrzeuge ({vehicles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('EQUIPMENT')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center space-x-1.5 ${
                activeTab === 'EQUIPMENT'
                  ? 'bg-[var(--wood-moss)] text-[var(--wood-seam)] font-bold border-[var(--wood-moss)] shadow-xs'
                  : isDarkMode
                  ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
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
                        ? 'bg-[var(--wood-info)]/15 border-[var(--wood-info)] shadow-md ring-2 ring-[var(--wood-info)]/30'
                        : isDarkMode
                        ? 'wood-raised-card hover:border-[var(--wood-edge)]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Plate + Check */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <Truck className="w-3.5 h-3.5 text-[var(--wood-info)] shrink-0" />
                          <span className="font-mono text-xs font-bold text-[var(--wood-info)] truncate">
                            {v.licensePlate}
                          </span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[var(--wood-info)] border-[var(--wood-info)] text-[var(--wood-seam)]'
                              : isDarkMode
                              ? 'border-[var(--wood-border)] bg-[var(--wood-seam)]'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Vehicle Name & Type */}
                      <p className="text-xs font-semibold text-[var(--wood-text-primary)] truncate mb-2">
                        {v.name}
                      </p>
                    </div>

                    {/* Bottom Row: Utilization Status */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[var(--wood-border)] text-[10px] font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          stat.isDoubleBooked
                            ? 'bg-[var(--wood-burnt-red)]/20 text-[var(--wood-burnt-red)] border border-[var(--wood-burnt-red)]/40'
                            : isBusy
                            ? 'bg-[var(--wood-moss)]/20 text-[var(--wood-moss)] border border-[var(--wood-moss)]/30'
                            : 'bg-[var(--wood-seam)] text-[var(--wood-text-muted)]'
                        }`}
                      >
                        {stat.isDoubleBooked
                          ? '⚠️ Doppelbuchung'
                          : isBusy
                          ? `${stat.count} ${stat.count === 1 ? 'Einsatz' : 'Einsätze'}`
                          : 'Frei'}
                      </span>

                      <span className="text-[var(--wood-text-muted)]">{v.type}</span>
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
                        ? 'bg-[var(--wood-ash)]/15 border-[var(--wood-ash)] shadow-md ring-2 ring-[var(--wood-ash)]/30'
                        : isDarkMode
                        ? 'wood-raised-card hover:border-[var(--wood-edge)]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Name + Check */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <Wrench className="w-3.5 h-3.5 text-[var(--wood-ash)] shrink-0" />
                          <span className="text-xs font-bold text-[var(--wood-ash)] truncate">
                            {eq.category}
                          </span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[var(--wood-ash)] border-[var(--wood-ash)] text-[var(--wood-seam)]'
                              : isDarkMode
                              ? 'border-[var(--wood-border)] bg-[var(--wood-seam)]'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Equipment Name */}
                      <p className="text-xs font-semibold text-[var(--wood-text-primary)] truncate mb-2" title={eq.name}>
                        {eq.name}
                      </p>
                    </div>

                    {/* Bottom Row: Utilization Status */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[var(--wood-border)] text-[10px] font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          stat.isDoubleBooked
                            ? 'bg-[var(--wood-burnt-red)]/20 text-[var(--wood-burnt-red)] border border-[var(--wood-burnt-red)]/40'
                            : isBusy
                            ? 'bg-[var(--wood-moss)]/20 text-[var(--wood-moss)] border border-[var(--wood-moss)]/30'
                            : 'bg-[var(--wood-seam)] text-[var(--wood-text-muted)]'
                        }`}
                      >
                        {stat.isDoubleBooked
                          ? '⚠️ Doppelbuchung'
                          : isBusy
                          ? `${stat.count} ${stat.count === 1 ? 'Einsatz' : 'Einsätze'}`
                          : 'Frei'}
                      </span>

                      {eq.isExclusive && (
                        <span className="text-[var(--wood-resin)] font-semibold" title="Exklusive Zuordnung">
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
