import React from 'react';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { FilterOptions, Worksite } from '../../types';

interface FilterModalProps {
  filters: FilterOptions;
  worksites: Worksite[];
  allSkills: string[];
  allRoles: string[];
  onUpdateFilters: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  filters,
  worksites,
  allSkills,
  allRoles,
  onUpdateFilters,
  onResetFilters,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[var(--wood-panel)] border border-[var(--wood-border)] rounded-2xl shadow-2xl overflow-hidden select-none">
        {/* HEADER */}
        <div className="px-5 py-4 bg-[var(--wood-base)] border-b border-[var(--wood-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[var(--wood-ash)]" />
            <h3 className="text-base font-bold text-[var(--wood-text-primary)]">Planungsfilter anpassen</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] rounded-lg hover:bg-[var(--wood-raised)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4 text-xs text-[var(--wood-text-secondary)] max-h-[70vh] overflow-y-auto">
          {/* SEARCH TERM */}
          <div>
            <label className="text-[11px] font-bold text-[var(--wood-text-muted)] uppercase mb-1 block">
              Freitextsuche (Name, Baustelle, Ort)
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => onUpdateFilters({ ...filters, searchTerm: e.target.value })}
              placeholder="z.B. Martin, Sanssouci, Potsdam..."
              className="w-full bg-[var(--wood-base)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] rounded-lg px-3 py-2 text-xs focus:border-[var(--wood-edge)] focus:outline-none"
            />
          </div>

          {/* ROLE FILTER */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase mb-1 block">
              Rolle / Position
            </label>
            <select
              value={filters.selectedRole || ''}
              onChange={(e) =>
                onUpdateFilters({ ...filters, selectedRole: e.target.value || undefined })
              }
              className="w-full bg-[#202124] text-neutral-100 border border-[#45474D] rounded-lg px-3 py-2 text-xs focus:border-sky-400 focus:outline-none"
            >
              <option value="">Alle Rollen</option>
              {allRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* SKILL FILTER */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase mb-1 block">
              Erforderliche Fähigkeit / Qualifikation
            </label>
            <select
              value={filters.selectedSkill || ''}
              onChange={(e) =>
                onUpdateFilters({ ...filters, selectedSkill: e.target.value || undefined })
              }
              className="w-full bg-[#202124] text-neutral-100 border border-[#45474D] rounded-lg px-3 py-2 text-xs focus:border-sky-400 focus:outline-none"
            >
              <option value="">Alle Fähigkeiten</option>
              {allSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* WORKSITE FILTER */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase mb-1 block">
              Spezifische Baustelle
            </label>
            <select
              value={filters.selectedWorksiteId || ''}
              onChange={(e) =>
                onUpdateFilters({
                  ...filters,
                  selectedWorksiteId: e.target.value || undefined,
                })
              }
              className="w-full bg-[#202124] text-neutral-100 border border-[#45474D] rounded-lg px-3 py-2 text-xs focus:border-sky-400 focus:outline-none"
            >
              <option value="">Alle Baustellen</option>
              {worksites.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.code})
                </option>
              ))}
            </select>
          </div>

          {/* QUICK TOGGLES */}
          <div className="space-y-2 pt-2 border-t border-[#292A2E]">
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#202124] rounded-lg border border-[#32343A] hover:bg-[#292A2E]">
              <input
                type="checkbox"
                checked={filters.onlyConflicts}
                onChange={(e) =>
                  onUpdateFilters({ ...filters, onlyConflicts: e.target.checked })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
              <span className="font-medium text-rose-300">
                Nur Baustellen mit Konflikten anzeigen
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#202124] rounded-lg border border-[#32343A] hover:bg-[#292A2E]">
              <input
                type="checkbox"
                checked={filters.onlyUnassigned}
                onChange={(e) =>
                  onUpdateFilters({ ...filters, onlyUnassigned: e.target.checked })
                }
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="font-medium text-amber-300">
                Nur unvollständig besetzte Baustellen anzeigen
              </span>
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3.5 bg-[#202124] border-t border-[#45474D] flex items-center justify-between">
          <button
            onClick={onResetFilters}
            className="px-3 py-1.5 text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Filter zurücksetzen
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-neutral-950 font-bold rounded-lg text-xs"
          >
            Anwenden
          </button>
        </div>
      </div>
    </div>
  );
};
