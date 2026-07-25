import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  RotateCw,
  Send,
  Calendar as CalendarIcon,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Sun,
  Moon,
  Plus,
} from 'lucide-react';
import { PlanningWeek } from '../../types';

interface TopCommandBarProps {
  currentWeek: PlanningWeek;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  activeView: 'MONTH' | '1W' | '4W';
  onViewChange: (view: 'MONTH' | '1W' | '4W') => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  draftChangesCount: number;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onPublish: () => void;
  blockingConflictsCount: number;
  simulatedRole: 'ADMINISTRATOR' | 'GESCHÄFTSFÜHRUNG';
  onRoleToggle: (role: 'ADMINISTRATOR' | 'GESCHÄFTSFÜHRUNG') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenQuickAdd: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  currentWeek,
  onPrevWeek,
  onNextWeek,
  onToday,
  activeView,
  onViewChange,
  onOpenFilters,
  activeFilterCount,
  draftChangesCount,
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  onPublish,
  blockingConflictsCount,
  simulatedRole,
  onRoleToggle,
  isDarkMode,
  onToggleDarkMode,
  onOpenQuickAdd,
}) => {
  return (
    <header
      className={`flex flex-wrap items-center justify-between px-6 py-3 border-b select-none gap-3 transition-colors ${
        isDarkMode ? 'bg-[#0C0C0C] border-[#171717] text-[#F2F4F5]' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* LEFT: KW & Date Range & View Switcher */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onPrevWeek}
            className={`p-1 rounded transition-colors ${
              isDarkMode ? 'hover:bg-[#171717] text-[#858B90] hover:text-white' : 'hover:bg-slate-200 text-slate-500'
            }`}
            title="Vorherige Periode"
            aria-label="Vorherige Periode"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <span
              className={`font-mono text-sm font-semibold ${
                isDarkMode ? 'text-[#858B90]' : 'text-slate-500'
              }`}
            >
              KW {currentWeek.weekNumber}
            </span>
            <h1
              className={`text-lg font-semibold tracking-tight ${
                isDarkMode ? 'text-[#F2F4F5]' : 'text-slate-900'
              }`}
            >
              {currentWeek.startDate} – {currentWeek.endDate}
            </h1>
          </div>

          <button
            onClick={onNextWeek}
            className={`p-1 rounded transition-colors ${
              isDarkMode ? 'hover:bg-[#171717] text-[#858B90] hover:text-white' : 'hover:bg-slate-200 text-slate-500'
            }`}
            title="Nächste Periode"
            aria-label="Nächste Periode"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onToday}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
              isDarkMode
                ? 'bg-[#171717] hover:bg-[#202124] text-[#BBC2C7] border-[#292A2E]'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            Heute
          </button>
        </div>

        {/* View Switcher: Monat / 1W / 4W */}
        <nav
          className={`flex rounded-md p-0.5 border ${
            isDarkMode ? 'bg-[#171717] border-[#292A2E]' : 'bg-slate-200 border-slate-300'
          }`}
        >
          <button
            onClick={() => onViewChange('MONTH')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center space-x-1 ${
              activeView === 'MONTH'
                ? isDarkMode
                  ? 'bg-[#383B42] text-white shadow-xs font-bold'
                  : 'bg-white text-slate-900 shadow-xs font-bold'
                : isDarkMode
                ? 'text-[#858B90] hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Monat (Kalender)</span>
          </button>

          <button
            onClick={() => onViewChange('1W')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeView === '1W'
                ? isDarkMode
                  ? 'bg-[#383B42] text-white shadow-xs font-bold'
                  : 'bg-white text-slate-900 shadow-xs font-bold'
                : isDarkMode
                ? 'text-[#858B90] hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Woche
          </button>

          <button
            onClick={() => onViewChange('4W')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeView === '4W'
                ? isDarkMode
                  ? 'bg-[#383B42] text-white shadow-xs font-bold'
                  : 'bg-white text-slate-900 shadow-xs font-bold'
                : isDarkMode
                ? 'text-[#858B90] hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4 Wochen
          </button>
        </nav>
      </div>

      {/* RIGHT: Quick Add, Dark Mode, Undo/Redo, Role & Publish */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-md transition-all shadow-sm flex items-center space-x-1"
          title="Neuen Einsatz schnell auf das Board setzen"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Einsatz Erfassen</span>
        </button>

        {/* Undo / Redo Buttons */}
        <div
          className={`flex items-center space-x-1 p-0.5 rounded-md border ${
            isDarkMode ? 'bg-[#171717] border-[#292A2E]' : 'bg-slate-200 border-slate-300'
          }`}
        >
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? isDarkMode
                  ? 'text-[#BBC2C7] hover:text-white cursor-pointer hover:bg-[#202124]'
                  : 'text-slate-700 hover:text-slate-900 cursor-pointer hover:bg-white'
                : 'text-slate-500/40 cursor-not-allowed'
            }`}
            title="Rückgängig (Ctrl+Z / Cmd+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? isDarkMode
                  ? 'text-[#BBC2C7] hover:text-white cursor-pointer hover:bg-[#202124]'
                  : 'text-slate-700 hover:text-slate-900 cursor-pointer hover:bg-white'
                : 'text-slate-500/40 cursor-not-allowed'
            }`}
            title="Wiederholen (Ctrl+Y / Cmd+Shift+Z)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={`p-1.5 rounded-md border transition-colors ${
            isDarkMode
              ? 'bg-[#171717] border-[#292A2E] text-amber-400 hover:bg-[#202124]'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          title={isDarkMode ? 'Auf helles Design wechseln' : 'Auf dunkles Design wechseln'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Role Simulator */}
        <button
          onClick={() =>
            onRoleToggle(
              simulatedRole === 'ADMINISTRATOR' ? 'GESCHÄFTSFÜHRUNG' : 'ADMINISTRATOR'
            )
          }
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
            isDarkMode
              ? 'bg-[#171717] hover:bg-[#202124] border-[#292A2E] text-[#BBC2C7]'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
          }`}
          title="Klick zum Wechseln der simulierten Berechtigung"
        >
          {simulatedRole === 'ADMINISTRATOR' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-[#4FD18B]" />
              <span>Admin</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-[#F4B942]" />
              <span>Geschäftsführung</span>
            </>
          )}
        </button>

        {/* Filter Toggle */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
            activeFilterCount > 0
              ? 'border-[#66C7F5] text-[#66C7F5] bg-sky-500/10'
              : isDarkMode
              ? 'bg-[#171717] border-[#292A2E] text-[#BBC2C7]'
              : 'bg-white border-slate-300 text-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#66C7F5] text-[#0C0C0C] font-mono text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Draft Status Badge */}
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-md border ${
            isDarkMode ? 'bg-[#202124] border-[#292A2E]' : 'bg-slate-100 border-slate-300'
          }`}
        >
          {currentWeek.isPublished ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[#4FD18B] animate-pulse" />
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                Veröffentlicht
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-[#F4B942]" />
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                Entwurf ({draftChangesCount})
              </span>
            </>
          )}
        </div>

        {/* Publish Button */}
        <button
          onClick={onPublish}
          className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all shadow-lg flex items-center space-x-1.5 ${
            blockingConflictsCount > 0
              ? 'bg-[#FF5A4E] hover:bg-rose-600 text-white'
              : 'bg-[#4FD18B] hover:bg-[#3dbd7a] text-[#0C0C0C]'
          }`}
        >
          {blockingConflictsCount > 0 ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>{blockingConflictsCount} Konflikte</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Plan veröffentlichen</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
