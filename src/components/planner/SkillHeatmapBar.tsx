import React from 'react';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  Users,
} from 'lucide-react';

interface SkillHeatmapBarProps {
  isHeatmapActive: boolean;
  onToggleHeatmap: () => void;
  selectedSkillFilter: string;
  onSelectSkillFilter: (skill: string) => void;
  availableSkills: string[];
  stats: {
    totalDaysWithJobs: number;
    optimalDaysCount: number;
    slightGapDaysCount: number;
    criticalGapDaysCount: number;
    totalMissingSkillSlots: number;
  };
  isDarkMode?: boolean;
}

export const SkillHeatmapBar: React.FC<SkillHeatmapBarProps> = ({
  isHeatmapActive,
  onToggleHeatmap,
  selectedSkillFilter,
  onSelectSkillFilter,
  availableSkills,
  stats,
  isDarkMode = true,
}) => {
  return (
    <div
      className={`w-full px-4 py-2.5 border-b transition-all duration-200 select-none ${
        isHeatmapActive
          ? isDarkMode
            ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
            : 'bg-amber-50 border-amber-200 text-amber-900'
          : isDarkMode
          ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}
    >
      <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* LEFT: TITLE & TOGGLE */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleHeatmap}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              isHeatmapActive
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-400 shadow-md scale-[1.02]'
                : 'bg-[var(--wood-base)] hover:bg-[var(--wood-raised)] border-[var(--wood-border)] text-[var(--wood-text-secondary)] hover:text-white'
            }`}
          >
            <Flame className={`w-4 h-4 ${isHeatmapActive ? 'animate-bounce' : 'text-amber-400'}`} />
            <span>Fähigkeiten-Heatmap {isHeatmapActive ? 'Aktiv' : 'Aktivieren'}</span>
            {isHeatmapActive ? <Eye className="w-3.5 h-3.5 ml-1" /> : <EyeOff className="w-3.5 h-3.5 ml-1" />}
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>Qualifikations-Soll-Ist Matrix</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold">
                  SKT / AS Baum
                </span>
              </span>
            </div>
            <p className="text-[11px] text-[var(--wood-text-secondary)] flex items-center gap-1 mt-0.5">
              Identifiziert Tage mit Unterbesetzung an Spezialqualifikationen (Kletterer, LKW, Ersthelfer)
            </p>
          </div>
        </div>

        {/* MIDDLE: HEATMAP STATS BADGES */}
        {isHeatmapActive && (
          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{stats.optimalDaysCount} Tage Vollsaniert</span>
            </div>

            {stats.slightGapDaysCount > 0 && (
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{stats.slightGapDaysCount} Leichte Lücken</span>
              </div>
            )}

            {stats.criticalGapDaysCount > 0 && (
              <div className="px-2.5 py-1 rounded-lg bg-rose-500/25 border border-rose-500/50 text-rose-300 font-bold flex items-center gap-1.5 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>{stats.criticalGapDaysCount} Kritische Engpässe</span>
              </div>
            )}
          </div>
        )}

        {/* RIGHT: SKILL FILTER & LEGEND */}
        <div className="flex items-center space-x-3">
          {/* Skill Filter Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[var(--wood-base)] border border-[var(--wood-border)] px-2.5 py-1 rounded-lg text-xs">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedSkillFilter}
              onChange={(e) => onSelectSkillFilter(e.target.value)}
              className="bg-transparent text-[11px] font-medium outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-neutral-900 text-white">
                Alle Qualifikationen
              </option>
              {availableSkills.map((sk) => (
                <option key={sk} value={sk} className="bg-neutral-900 text-white">
                  Fokus: {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Color Legend */}
          <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-[var(--wood-text-muted)] border-l border-[var(--wood-border)] pl-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>100% Abgedeckt</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Teillücke</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Kritisch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
