import React from 'react';
import {
  Users,
  HardHat,
  Clock,
  Truck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { BentoSummaryMetrics } from '../../domain/capacityEngine';

interface SummaryTilesProps {
  metrics: BentoSummaryMetrics;
  onFilterConflicts: () => void;
  onFilterUnassigned: () => void;
  onFilterResources: () => void;
  isDarkMode?: boolean;
}

export const SummaryTiles: React.FC<SummaryTilesProps> = ({
  metrics,
  onFilterConflicts,
  onFilterUnassigned,
  onFilterResources,
  isDarkMode = true,
}) => {
  return (
    <section
      className={`p-4 transition-colors ${
        isDarkMode ? 'bg-[var(--wood-page)]' : 'bg-slate-50 border-b border-slate-200'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 max-w-[1600px] mx-auto">
        {/* TILE 1: MITARBEITER */}
        <div
          onClick={onFilterUnassigned}
          className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all group ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v hover:border-[var(--wood-edge)] hover:bg-[var(--wood-selected)]'
              : 'bg-white hover:bg-slate-100 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-slate-500'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[var(--wood-moss)]" />
              Mitarbeiter
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--wood-text-muted)] group-hover:text-[var(--wood-moss)] transition-colors" />
          </div>
          <div className="flex items-end justify-between mt-2.5">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-slate-900'
              }`}
            >
              {metrics.plannedEmployeesCount}
            </span>
            <span className="text-xs text-[var(--wood-moss)] font-semibold">
              {metrics.plannedEmployeesCount} Aktiv / {metrics.totalEmployees}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] font-mono border-t pt-2 mt-2.5 ${
              isDarkMode
                ? 'text-[var(--wood-text-secondary)] border-[var(--wood-border)]'
                : 'text-slate-600 border-slate-100'
            }`}
          >
            <span>Belegt: {metrics.plannedEmployeesCount}</span>
            <span>·</span>
            <span className={metrics.unplannedEmployeesCount > 0 ? 'text-[var(--wood-resin)] font-bold' : ''}>
              Offen: {metrics.unplannedEmployeesCount}
            </span>
            <span>·</span>
            <span className="text-[var(--wood-info)]">Abwesend: {metrics.absentEmployeesCount}</span>
          </div>
        </div>

        {/* TILE 2: BAUSTELLEN */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
              isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-slate-500'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-[var(--wood-info)]" />
            Baustellen
          </span>
          <div className="flex items-end justify-between mt-2.5">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-slate-900'
              }`}
            >
              0{metrics.activeWorksitesCount}
            </span>
            <span className="text-xs text-[var(--wood-info)] font-semibold">Parallel</span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] border-t pt-2 mt-2.5 ${
              isDarkMode
                ? 'text-[var(--wood-text-secondary)] border-[var(--wood-border)]'
                : 'text-slate-600 border-slate-100'
            }`}
          >
            {metrics.incompleteWorksitesCount > 0 ? (
              <span className="text-[var(--wood-resin)] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {metrics.incompleteWorksitesCount} unvollständig
              </span>
            ) : (
              <span className="text-[var(--wood-moss)] font-medium">Alle Teams besetzt</span>
            )}
          </div>
        </div>

        {/* TILE 3: STUNDEN */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
              isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-slate-500'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[var(--wood-resin)]" />
            Stunden
          </span>
          <div className="flex items-end justify-between mt-2.5">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-slate-900'
              }`}
            >
              {metrics.totalPlannedHours}h
            </span>
            <span
              className={`text-xs font-mono ${
                isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-500'
              }`}
            >
              / {metrics.totalCapacityHours}h Kap.
            </span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden mt-2.5 ${
              isDarkMode ? 'bg-[var(--wood-seam)]' : 'bg-slate-100'
            }`}
          >
            <div
              className={`h-full transition-all ${
                metrics.totalPlannedHours > metrics.totalCapacityHours
                  ? 'bg-[var(--wood-burnt-red)]'
                  : 'bg-[var(--wood-moss)]'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (metrics.totalPlannedHours / (metrics.totalCapacityHours || 1)) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* TILE 4: KONFLIKTE */}
        <div
          onClick={onFilterConflicts}
          className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all group ${
            metrics.blockingConflictsCount > 0 ? 'border-l-4 border-l-[var(--wood-burnt-red)]' : ''
          } ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v hover:border-[var(--wood-edge)] hover:bg-[var(--wood-selected)]'
              : 'bg-white hover:bg-slate-100 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--wood-burnt-red)] font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--wood-burnt-red)]" />
              Konflikte
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--wood-text-muted)] group-hover:text-[var(--wood-burnt-red)] transition-colors" />
          </div>
          <div className="flex items-end justify-between mt-2.5">
            <span className="text-2xl font-mono font-bold text-[var(--wood-burnt-red)]">
              0{metrics.blockingConflictsCount}
            </span>
            <span className="text-xs text-[var(--wood-burnt-red)] underline font-medium">Anzeigen</span>
          </div>
          <div
            className={`flex items-center justify-between text-[10px] border-t pt-2 mt-2.5 ${
              isDarkMode
                ? 'text-[var(--wood-text-secondary)] border-[var(--wood-border)]'
                : 'text-slate-600 border-slate-100'
            }`}
          >
            <span className="text-[var(--wood-resin)] font-medium">{metrics.warningsCount} Warnungen</span>
            <span className="text-[var(--wood-info)]">Filter →</span>
          </div>
        </div>

        {/* TILE 5: RESSOURCEN */}
        <div
          onClick={onFilterResources}
          className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all group ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v hover:border-[var(--wood-edge)] hover:bg-[var(--wood-selected)]'
              : 'bg-white hover:bg-slate-100 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-slate-500'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[var(--wood-ash)]" />
              Ressourcen
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--wood-text-muted)] group-hover:text-[var(--wood-ash)] transition-colors" />
          </div>
          <div className="flex items-end justify-between mt-2.5">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-slate-900'
              }`}
            >
              0{metrics.vehiclesInUseCount + metrics.equipmentReservedCount}
            </span>
            <span
              className={`text-xs ${isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-500'}`}
            >
              Fahrzeuge & Geräte
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] font-mono border-t pt-2 mt-2.5 ${
              isDarkMode
                ? 'text-[var(--wood-text-secondary)] border-[var(--wood-border)]'
                : 'text-slate-600 border-slate-100'
            }`}
          >
            <span>{metrics.vehiclesInUseCount}/{metrics.totalVehicles} KFZ</span>
            <span>·</span>
            <span>{metrics.equipmentReservedCount}/{metrics.totalEquipment} Geräte</span>
          </div>
        </div>
      </div>
    </section>
  );
};
