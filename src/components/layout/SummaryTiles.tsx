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
        isDarkMode ? 'bg-[#0C0C0C]' : 'bg-slate-50 border-b border-slate-200'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-[1600px] mx-auto">
        {/* TILE 1: MITARBEITER */}
        <div
          onClick={onFilterUnassigned}
          className={`p-3 rounded-lg border flex flex-col justify-between cursor-pointer transition-colors group shadow-xs ${
            isDarkMode
              ? 'bg-[#171717] hover:bg-[#202124] border-[#202124]'
              : 'bg-white hover:bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'text-[#858B90]' : 'text-slate-500'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#4FD18B]" />
              Mitarbeiter
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#858B90] group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[#F2F4F5]' : 'text-slate-900'
              }`}
            >
              {metrics.plannedEmployeesCount}
            </span>
            <span className="text-xs text-[#4FD18B] font-semibold">
              {metrics.plannedEmployeesCount} Aktiv / {metrics.totalEmployees}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] font-mono border-t pt-2 mt-2 ${
              isDarkMode
                ? 'text-[#BBC2C7] border-[#292A2E]'
                : 'text-slate-600 border-slate-100'
            }`}
          >
            <span>Belegt: {metrics.plannedEmployeesCount}</span>
            <span>·</span>
            <span className={metrics.unplannedEmployeesCount > 0 ? 'text-[#F4B942]' : ''}>
              Offen: {metrics.unplannedEmployeesCount}
            </span>
            <span>·</span>
            <span className="text-[#66C7F5]">Abwesend: {metrics.absentEmployeesCount}</span>
          </div>
        </div>

        {/* TILE 2: BAUSTELLEN */}
        <div
          className={`p-3 rounded-lg border flex flex-col justify-between shadow-xs transition-colors ${
            isDarkMode ? 'bg-[#171717] border-[#202124]' : 'bg-white border-slate-200'
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
              isDarkMode ? 'text-[#858B90]' : 'text-slate-500'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-[#66C7F5]" />
            Baustellen
          </span>
          <div className="flex items-end justify-between mt-2">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[#F2F4F5]' : 'text-slate-900'
              }`}
            >
              0{metrics.activeWorksitesCount}
            </span>
            <span className="text-xs text-[#66C7F5] font-semibold">Parallel</span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] border-t pt-2 mt-2 ${
              isDarkMode
                ? 'text-[#BBC2C7] border-[#292A2E]'
                : 'text-slate-600 border-slate-100'
            }`}
          >
            {metrics.incompleteWorksitesCount > 0 ? (
              <span className="text-[#F4B942] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {metrics.incompleteWorksitesCount} unvollständig
              </span>
            ) : (
              <span className="text-[#4FD18B] font-medium">Alle Teams besetzt</span>
            )}
          </div>
        </div>

        {/* TILE 3: STUNDEN */}
        <div
          className={`p-3 rounded-lg border flex flex-col justify-between shadow-xs transition-colors ${
            isDarkMode ? 'bg-[#171717] border-[#202124]' : 'bg-white border-slate-200'
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
              isDarkMode ? 'text-[#858B90]' : 'text-slate-500'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#F4B942]" />
            Stunden
          </span>
          <div className="flex items-end justify-between mt-2">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[#F2F4F5]' : 'text-slate-900'
              }`}
            >
              {metrics.totalPlannedHours}h
            </span>
            <span
              className={`text-xs font-mono ${
                isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-500'
              }`}
            >
              / {metrics.totalCapacityHours}h Kap.
            </span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${
              isDarkMode ? 'bg-[#292A2E]' : 'bg-slate-100'
            }`}
          >
            <div
              className={`h-full transition-all ${
                metrics.totalPlannedHours > metrics.totalCapacityHours
                  ? 'bg-[#FF5A4E]'
                  : 'bg-[#4FD18B]'
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
          className={`p-3 rounded-lg border flex flex-col justify-between cursor-pointer transition-colors group shadow-xs ${
            metrics.blockingConflictsCount > 0 ? 'border-l-4 border-l-[#FF5A4E]' : ''
          } ${
            isDarkMode
              ? 'bg-[#171717] hover:bg-[#202124] border-[#202124]'
              : 'bg-white hover:bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#FF5A4E] font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF5A4E]" />
              Konflikte
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#858B90] group-hover:text-rose-500 transition-colors" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-mono font-bold text-[#FF5A4E]">
              0{metrics.blockingConflictsCount}
            </span>
            <span className="text-xs text-[#FF5A4E] underline font-medium">Anzeigen</span>
          </div>
          <div
            className={`flex items-center justify-between text-[10px] border-t pt-2 mt-2 ${
              isDarkMode
                ? 'text-[#BBC2C7] border-[#292A2E]'
                : 'text-slate-600 border-slate-100'
            }`}
          >
            <span className="text-[#F4B942] font-medium">{metrics.warningsCount} Warnungen</span>
            <span className="text-[#66C7F5]">Filter →</span>
          </div>
        </div>

        {/* TILE 5: RESSOURCEN */}
        <div
          onClick={onFilterResources}
          className={`p-3 rounded-lg border flex flex-col justify-between cursor-pointer transition-colors group shadow-xs ${
            isDarkMode
              ? 'bg-[#171717] hover:bg-[#202124] border-[#202124]'
              : 'bg-white hover:bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'text-[#858B90]' : 'text-slate-500'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#9B7AE5]" />
              Ressourcen
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#858B90] group-hover:text-violet-500 transition-colors" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <span
              className={`text-2xl font-mono font-bold ${
                isDarkMode ? 'text-[#F2F4F5]' : 'text-slate-900'
              }`}
            >
              0{metrics.vehiclesInUseCount + metrics.equipmentReservedCount}
            </span>
            <span
              className={`text-xs ${isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-500'}`}
            >
              Fahrzeuge & Geräte
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-[10px] font-mono border-t pt-2 mt-2 ${
              isDarkMode
                ? 'text-[#BBC2C7] border-[#292A2E]'
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
