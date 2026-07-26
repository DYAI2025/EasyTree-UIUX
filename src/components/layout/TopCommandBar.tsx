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
  Printer,
  FileSpreadsheet,
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
  onPrint?: () => void;
  onExportCSV?: () => void;
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
  onPrint,
  onExportCSV,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };
  return (
    <header
      className={`flex flex-wrap items-center justify-between px-6 py-3 border-b select-none gap-3 transition-colors ${
        isDarkMode
          ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] wood-grain-h wood-burnt-edge text-[var(--wood-text-primary)]'
          : 'bg-[#CDE7CC] border-[#97B89A] text-[#3B4A3B] shadow-sm'
      }`}
    >
      {/* LEFT: KW & Date Range & View Switcher */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onPrevWeek}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-[var(--wood-raised)] text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] border border-transparent hover:border-[var(--wood-border)]'
                : 'hover:bg-[#E9F4EA] text-[#3B4A3B] border border-transparent hover:border-[#97B89A]'
            }`}
            title="Vorherige Periode"
            aria-label="Vorherige Periode"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <span
              className={`font-mono text-sm font-semibold ${
                isDarkMode ? 'text-[var(--wood-ash)]' : 'text-[#6E8B6E]'
              }`}
            >
              KW {currentWeek.weekNumber}
            </span>
            <h1
              className={`text-lg font-semibold tracking-tight ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-[#3B4A3B]'
              }`}
            >
              {currentWeek.startDate} – {currentWeek.endDate}
            </h1>
          </div>

          <button
            onClick={onNextWeek}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-[var(--wood-raised)] text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] border border-transparent hover:border-[var(--wood-border)]'
                : 'hover:bg-[#E9F4EA] text-[#3B4A3B] border border-transparent hover:border-[#97B89A]'
            }`}
            title="Nächste Periode"
            aria-label="Nächste Periode"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onToday}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-[var(--wood-base)] hover:bg-[var(--wood-raised)] text-[var(--wood-text-secondary)] border-[var(--wood-border)] hover:text-[var(--wood-text-primary)]'
                : 'bg-[#E9F4EA] hover:bg-white text-[#3B4A3B] border-[#97B89A]'
            }`}
          >
            Heute
          </button>
        </div>

        {/* View Switcher: Monat / 1W / 4W */}
        <nav
          className={`flex rounded-lg p-0.5 border ${
            isDarkMode ? 'bg-[var(--wood-seam)] border-[var(--wood-border)]' : 'bg-[#E9F4EA] border-[#97B89A]'
          }`}
        >
          <button
            onClick={() => onViewChange('MONTH')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
              activeView === 'MONTH'
                ? isDarkMode
                  ? 'bg-[var(--wood-raised)] text-[var(--wood-ash)] border border-[var(--wood-edge)] shadow-xs font-bold'
                  : 'bg-[#3B4A3B] text-[#E9F4EA] border border-[#3B4A3B] shadow-xs font-bold'
                : isDarkMode
                ? 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
                : 'text-[#4A5E4A] hover:text-[#3B4A3B]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--wood-ash)]" />
            <span>Monat (Kalender)</span>
          </button>

          <button
            onClick={() => onViewChange('1W')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeView === '1W'
                ? isDarkMode
                  ? 'bg-[var(--wood-raised)] text-[var(--wood-ash)] border border-[var(--wood-edge)] shadow-xs font-bold'
                  : 'bg-[#3B4A3B] text-[#E9F4EA] border border-[#3B4A3B] shadow-xs font-bold'
                : isDarkMode
                ? 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
                : 'text-[#4A5E4A] hover:text-[#3B4A3B]'
            }`}
          >
            Woche
          </button>

          <button
            onClick={() => onViewChange('4W')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeView === '4W'
                ? isDarkMode
                  ? 'bg-[var(--wood-raised)] text-[var(--wood-ash)] border border-[var(--wood-edge)] shadow-xs font-bold'
                  : 'bg-[#3B4A3B] text-[#E9F4EA] border border-[#3B4A3B] shadow-xs font-bold'
                : isDarkMode
                ? 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
                : 'text-[#4A5E4A] hover:text-[#3B4A3B]'
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
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer ${
            isDarkMode
              ? 'bg-[var(--wood-moss)] hover:brightness-110 text-[var(--wood-seam)] font-extrabold'
              : 'bg-[#3B4A3B] hover:bg-[#2C382C] text-[#E9F4EA] font-extrabold shadow-sm'
          }`}
          title="Neuen Einsatz schnell auf das Board setzen"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Einsatz Erfassen</span>
        </button>

        {/* Undo / Redo Buttons */}
        <div
          className={`flex items-center space-x-1 p-0.5 rounded-lg border ${
            isDarkMode ? 'bg-[var(--wood-seam)] border-[var(--wood-border)]' : 'bg-[#E9F4EA] border-[#97B89A]'
          }`}
        >
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? isDarkMode
                  ? 'text-[var(--wood-text-secondary)] hover:text-[var(--wood-text-primary)] cursor-pointer hover:bg-[var(--wood-raised)]'
                  : 'text-[#3B4A3B] hover:text-[#2C382C] cursor-pointer hover:bg-[#CDE7CC]'
                : 'opacity-30 cursor-not-allowed'
            }`}
            title="Rückgängig (Ctrl+Z / Cmd+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? isDarkMode
                  ? 'text-[var(--wood-text-secondary)] hover:text-[var(--wood-text-primary)] cursor-pointer hover:bg-[var(--wood-raised)]'
                  : 'text-[#3B4A3B] hover:text-[#2C382C] cursor-pointer hover:bg-[#CDE7CC]'
                : 'opacity-30 cursor-not-allowed'
            }`}
            title="Wiederholen (Ctrl+Y / Cmd+Shift+Z)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDarkMode
              ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-resin)] hover:bg-[var(--wood-raised)]'
              : 'bg-[#E9F4EA] border-[#97B89A] text-[#3B4A3B] hover:bg-white'
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
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
            isDarkMode
              ? 'bg-[var(--wood-base)] hover:bg-[var(--wood-raised)] border-[var(--wood-border)] text-[var(--wood-text-secondary)]'
              : 'bg-[#E9F4EA] hover:bg-white border-[#97B89A] text-[#3B4A3B]'
          }`}
          title="Klick zum Wechseln der simulierten Berechtigung"
        >
          {simulatedRole === 'ADMINISTRATOR' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--wood-moss)]" />
              <span>Admin</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-[var(--wood-resin)]" />
              <span>Geschäftsführung</span>
            </>
          )}
        </button>

        {/* Filter Toggle */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
            activeFilterCount > 0
              ? 'border-[#235F53] text-[#235F53] bg-[#235F53]/10 font-bold'
              : isDarkMode
              ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-secondary)] hover:bg-[var(--wood-raised)]'
              : 'bg-[#E9F4EA] border-[#97B89A] text-[#3B4A3B] hover:bg-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#3B4A3B] text-[#E9F4EA] font-mono text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Print / PDF Export Button */}
        <button
          onClick={handlePrint}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-ash)] hover:bg-[var(--wood-raised)] hover:border-[var(--wood-edge)]'
              : 'bg-[#E9F4EA] border-[#97B89A] text-[#3B4A3B] hover:bg-white'
          }`}
          title="Wochenplan / Ansicht drucken oder als PDF exportieren"
          aria-label="Wochenplan drucken oder als PDF exportieren"
        >
          <Printer className="w-3.5 h-3.5 text-[var(--wood-ash)]" />
          <span>Drucken / PDF</span>
        </button>

        {/* CSV Export Button for Payroll / Software */}
        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-emerald-400 hover:bg-[var(--wood-raised)] hover:border-[var(--wood-edge)]'
                : 'bg-[#E9F4EA] border-[#97B89A] text-[#235F53] hover:bg-white font-bold'
            }`}
            title="Einsätze der aktuellen Woche als CSV-Datei für Lohn & Management-Software exportieren"
            aria-label="Wocheneinsätze als CSV exportieren"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </button>
        )}

        {/* Draft Status Badge */}
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${
            isDarkMode ? 'bg-[var(--wood-base)] border-[var(--wood-border)]' : 'bg-[#E9F4EA] border-[#97B89A]'
          }`}
        >
          {currentWeek.isPublished ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[var(--wood-moss)] animate-pulse" />
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-[#3B4A3B]'
                }`}
              >
                Veröffentlicht
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-[var(--wood-resin)]" />
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-[#3B4A3B]'
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
          className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all shadow-md flex items-center space-x-1.5 cursor-pointer ${
            blockingConflictsCount > 0
              ? 'bg-[var(--wood-burnt-red)] hover:brightness-110 text-white'
              : 'bg-[#3B4A3B] hover:bg-[#2C382C] text-[#E9F4EA]'
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
