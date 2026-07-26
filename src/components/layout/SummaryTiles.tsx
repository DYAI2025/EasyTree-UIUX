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
        isDarkMode ? 'bg-[var(--wood-page)]' : 'bg-[#E9F4EA] border-b border-[#97B89A]'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 max-w-[1600px] mx-auto">
        {/* TILE 1: MITARBEITER */}
        <div
          onClick={onFilterUnassigned}
          className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all group ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v hover:border-[var(--wood-edge)] hover:bg-[var(--wood-selected)]'
              : 'bg-[#CDE7CC] hover:bg-[#BFE0BE] border-[#97B89A] shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-[#3B4A3B]'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[var(--wood-moss)]' : 'text-[#3B4A3B]'}`} />
              Mitarbeiter
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-colors ${
              isDarkMode ? 'text-[var(--wood-text-muted)] group-hover:text-[var(--wood-moss)]' : 'text-[#6E8B6E] group-hover:text-[#3B4A3B]'
            }`} />
          </div>
          <div className="flex items-end justify-between mt-2.5">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-[#3B4A3B]'
              }`}
            >
              {metrics.plannedEmployeesCount}
            </span>
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-[var(--wood-moss)]' : 'text-[#235F53]'}`}>
              {metrics.plannedEmployeesCount} Aktiv / {metrics.totalEmployees}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] font-mono border-t pt-2 mt-2.5 ${
              isDarkMode
                ? 'text-[var(--wood-text-secondary)] border-[var(--wood-border)]'
                : 'text-[#4A5E4A] border-[#97B89A]/60'
            }`}
          >
            <span>Belegt: {metrics.plannedEmployeesCount}</span>
            <span>·</span>
            <span className={metrics.unplannedEmployeesCount > 0 ? (isDarkMode ? 'text-[var(--wood-resin)] font-bold' : 'text-[#8B3B2B] font-bold') : ''}>
              Offen: {metrics.unplannedEmployeesCount}
            </span>
            <span>·</span>
            <span className={isDarkMode ? 'text-[var(--wood-info)]' : 'text-[#235F53]'}>Abwesend: {metrics.absentEmployeesCount}</span>
          </div>
        </div>

        {/* TILE 2: BAUSTELLEN */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v'
              : 'bg-[#CDE7CC] border-[#97B89A] shadow-sm'
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
              isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-[#3B4A3B]'
            }`}
          >
            <HardHat className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[var(--wood-info)]' : 'text-[#235F53]'}`} />
            Baustellen
          </span>
          <div className="flex items-end justify-between mt-2.5">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-[#3B4A3B]'
              }`}
            >
              0{metrics.activeWorksitesCount}
            </span>
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-[var(--wood-info)]' : 'text-[#235F53]'}`}>Parallel</span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] border-t pt-2 mt-2.5 ${
              isDarkMode
                ? 'text-[var(--wood-text-secondary)] border-[var(--wood-border)]'
                : 'text-[#4A5E4A] border-[#97B89A]/60'
            }`}
          >
            {metrics.incompleteWorksitesCount > 0 ? (
              <span className={`font-medium flex items-center gap-1 ${isDarkMode ? 'text-[var(--wood-resin)]' : 'text-[#B93829]'}`}>
                <AlertTriangle className="w-3 h-3" />
                {metrics.incompleteWorksitesCount} unvollständig
              </span>
            ) : (
              <span className={`font-medium ${isDarkMode ? 'text-[var(--wood-moss)]' : 'text-[#235F53]'}`}>Alle Teams besetzt</span>
            )}
          </div>
        </div>

        {/* TILE 3: STUNDEN */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v'
              : 'bg-[#CDE7CC] border-[#97B89A] shadow-sm'
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
              isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-[#3B4A3B]'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[var(--wood-resin)]' : 'text-[#3B4A3B]'}`} />
            Stunden
          </span>
          <div className="flex items-end justify-between mt-2.5">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-[#3B4A3B]'
              }`}
            >
              {metrics.totalPlannedHours}h
            </span>
            <span
              className={`text-xs font-mono ${
                isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-[#4A5E4A]'
              }`}
            >
              / {metrics.totalCapacityHours}h Kap.
            </span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden mt-2.5 ${
              isDarkMode ? 'bg-[var(--wood-seam)]' : 'bg-[#E9F4EA] border border-[#97B89A]/50'
            }`}
          >
            <div
              className={`h-full transition-all ${
                metrics.totalPlannedHours > metrics.totalCapacityHours
                  ? 'bg-[#B93829]'
                  : isDarkMode
                  ? 'bg-[var(--wood-moss)]'
                  : 'bg-[#3B4A3B]'
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
            metrics.blockingConflictsCount > 0 ? 'border-l-4 border-l-[#B93829]' : ''
          } ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v hover:border-[var(--wood-edge)] hover:bg-[var(--wood-selected)]'
              : 'bg-[#CDE7CC] hover:bg-[#BFE0BE] border-[#97B89A] shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#B93829] font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B93829]" />
              Konflikte
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#B93829] group-hover:text-[#B93829] transition-colors" />
          </div>
          <div className="flex items-end justify-between mt-2.5">
            <span className="text-2xl font-mono font-bold text-[#B93829]">
              0{metrics.blockingConflictsCount}
            </span>
            <span className="text-xs text-[#B93829] underline font-medium">Anzeigen</span>
          </div>
          <div
            className={`flex items-center justify-between text-[10px] border-t pt-2 mt-2.5 ${
              isDarkMode
                ? 'text-[var(--wood-text-secondary)] border-[var(--wood-border)]'
                : 'text-[#4A5E4A] border-[#97B89A]/60'
            }`}
          >
            <span className={isDarkMode ? 'text-[var(--wood-resin)] font-medium' : 'text-[#8B3B2B] font-medium'}>{metrics.warningsCount} Warnungen</span>
            <span className={isDarkMode ? 'text-[var(--wood-info)]' : 'text-[#235F53]'}>Filter →</span>
          </div>
        </div>

        {/* TILE 5: RESSOURCEN */}
        <div
          onClick={onFilterResources}
          className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all group ${
            isDarkMode
              ? 'wood-raised-card wood-grain-v hover:border-[var(--wood-edge)] hover:bg-[var(--wood-selected)]'
              : 'bg-[#CDE7CC] hover:bg-[#BFE0BE] border-[#97B89A] shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-[#3B4A3B]'
              }`}
            >
              <Truck className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[var(--wood-ash)]' : 'text-[#3B4A3B]'}`} />
              Ressourcen
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-colors ${
              isDarkMode ? 'text-[var(--wood-text-muted)] group-hover:text-[var(--wood-ash)]' : 'text-[#6E8B6E] group-hover:text-[#3B4A3B]'
            }`} />
          </div>
          <div className="flex items-end justify-between mt-2.5">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-[#3B4A3B]'
              }`}
            >
              0{metrics.vehiclesInUseCount + metrics.equipmentReservedCount}
            </span>
            <span
              className={`text-xs ${isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-[#4A5E4A]'}`}
            >
              Fahrzeuge & Geräte
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] font-mono border-t pt-2 mt-2.5 ${
              isDarkMode
                ? 'text-[var(--wood-text-secondary)] border-[var(--wood-border)]'
                : 'text-[#4A5E4A] border-[#97B89A]/60'
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
