import React, { useState } from 'react';
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
  Award,
  Database,
  Menu,
  X,
  SlidersHorizontal,
  BarChart3,
  Trees,
  Sparkles,
} from 'lucide-react';
import { PlanningWeek } from '../../types';

interface TopCommandBarProps {
  currentWeek: PlanningWeek;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  activeView: 'MONTH' | '1W' | '4W' | 'SKILLS' | 'MASTER_DATA';
  onViewChange: (view: 'MONTH' | '1W' | '4W' | 'SKILLS' | 'MASTER_DATA') => void;
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
  showSummaryTiles?: boolean;
  onToggleSummaryTiles?: () => void;
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
  showSummaryTiles = false,
  onToggleSummaryTiles,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <header
      className={`relative flex flex-col md:flex-row md:items-center justify-between px-3 sm:px-6 py-2.5 border-b select-none gap-2.5 transition-colors z-30 ${
        isDarkMode
          ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] wood-grain-h wood-burnt-edge text-[var(--wood-text-primary)]'
          : 'bg-[#CDE7CC] border-[#97B89A] text-[#3B4A3B] shadow-sm'
      }`}
    >
      {/* BRAND & PERIOD NAVIGATION */}
      <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
        {/* Brand Title */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xs">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight block leading-tight">
              Arboscus
            </span>
            <span className="text-[10px] font-mono text-[var(--wood-text-muted)] block leading-none">
              Teamplaner
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-[var(--wood-border)] hidden sm:block mx-1" />

        {/* Date Navigator */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <button
            onClick={onPrevWeek}
            className={`p-1.5 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isDarkMode
                ? 'hover:bg-[var(--wood-raised)] text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] border border-transparent hover:border-[var(--wood-border)]'
                : 'hover:bg-[#E9F4EA] text-[#3B4A3B] border border-transparent hover:border-[#97B89A]'
            }`}
            title="Vorherige Periode"
            aria-label="Vorherige Periode"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                isDarkMode ? 'bg-[var(--wood-seam)] text-amber-300 border border-amber-500/20' : 'bg-white text-[#3B4A3B] border border-[#97B89A]'
              }`}
            >
              KW {currentWeek.weekNumber}
            </span>
            <span
              className={`text-xs sm:text-sm font-semibold tracking-tight truncate max-w-[130px] sm:max-w-none ${
                isDarkMode ? 'text-[var(--wood-text-primary)]' : 'text-[#3B4A3B]'
              }`}
            >
              {currentWeek.startDate} – {currentWeek.endDate}
            </span>
          </div>

          <button
            onClick={onNextWeek}
            className={`p-1.5 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
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
            className={`px-2 py-1 text-xs font-semibold rounded-md border transition-colors ${
              isDarkMode
                ? 'bg-[var(--wood-base)] hover:bg-[var(--wood-raised)] text-[var(--wood-text-secondary)] border-[var(--wood-border)] hover:text-[var(--wood-text-primary)]'
                : 'bg-[#E9F4EA] hover:bg-white text-[#3B4A3B] border-[#97B89A]'
            }`}
          >
            Heute
          </button>
        </div>
      </div>

      {/* CORE VIEW SWITCHER & PRIMARY CONTROLS */}
      <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
        {/* Main View Tabs (Monat, Woche, 4W) */}
        <nav
          className={`flex items-center rounded-lg p-0.5 border ${
            isDarkMode ? 'bg-[var(--wood-seam)] border-[var(--wood-border)]' : 'bg-[#E9F4EA] border-[#97B89A]'
          }`}
        >
          <button
            onClick={() => onViewChange('MONTH')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-1 shrink-0 ${
              activeView === 'MONTH'
                ? isDarkMode
                  ? 'bg-[var(--wood-raised)] text-emerald-300 border border-emerald-500/30 shadow-xs font-bold'
                  : 'bg-[#3B4A3B] text-[#E9F4EA] border border-[#3B4A3B] shadow-xs font-bold'
                : isDarkMode
                ? 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
                : 'text-[#4A5E4A] hover:text-[#3B4A3B]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Monat</span>
          </button>

          <button
            onClick={() => onViewChange('1W')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-all shrink-0 ${
              activeView === '1W'
                ? isDarkMode
                  ? 'bg-[var(--wood-raised)] text-emerald-300 border border-emerald-500/30 shadow-xs font-bold'
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
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-all shrink-0 ${
              activeView === '4W'
                ? isDarkMode
                  ? 'bg-[var(--wood-raised)] text-emerald-300 border border-emerald-500/30 shadow-xs font-bold'
                  : 'bg-[#3B4A3B] text-[#E9F4EA] border border-[#3B4A3B] shadow-xs font-bold'
                : isDarkMode
                ? 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
                : 'text-[#4A5E4A] hover:text-[#3B4A3B]'
            }`}
          >
            4 Wochen
          </button>
        </nav>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer ${
            isDarkMode
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold border border-emerald-400/30'
              : 'bg-[#3B4A3B] hover:bg-[#2C382C] text-[#E9F4EA] font-extrabold shadow-sm'
          }`}
          title="Neuen Einsatz schnell erfassen"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">+ Einsatz</span>
        </button>

        {/* Filter Toggle (If active) */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            activeFilterCount > 0
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
              : isDarkMode
              ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-secondary)] hover:bg-[var(--wood-raised)]'
              : 'bg-[#E9F4EA] border-[#97B89A] text-[#3B4A3B] hover:bg-white'
          }`}
          title="Filter anpassen"
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold flex items-center justify-center ml-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* CLEAR MENU BAR TRIGGER BUTTON */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm ${
            isMenuOpen
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : isDarkMode
              ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)]'
              : 'bg-white border-[#97B89A] text-[#3B4A3B] hover:bg-[#E9F4EA]'
          }`}
          title="Menü & Werkzeuge öffnen"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Menü</span>
          {isMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* POPUP / SLIDE-OUT MENU BAR FOR ALL SECONDARY & ADDITIONAL FUNCTIONS */}
      {isMenuOpen && (
        <div
          className={`absolute right-3 sm:right-6 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode
              ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] text-[var(--wood-text-primary)] wood-grain-v'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--wood-border)]">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 font-mono">
                Menü & Werkzeuge
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 rounded hover:bg-[var(--wood-raised)] text-[var(--wood-text-muted)] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar pr-1">
            {/* MODULES NAVIGATION */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--wood-text-muted)] block mb-1.5">
                Module & Spezialansichten
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onViewChange('MONTH');
                    setIsMenuOpen(false);
                  }}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 border transition ${
                    activeView === 'MONTH'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)]'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Monats-Kalender</span>
                </button>

                <button
                  onClick={() => {
                    onViewChange('1W');
                    setIsMenuOpen(false);
                  }}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 border transition ${
                    activeView === '1W'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)]'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-teal-400" />
                  <span>Wochenplaner</span>
                </button>

                <button
                  onClick={() => {
                    onViewChange('SKILLS');
                    setIsMenuOpen(false);
                  }}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 border transition ${
                    activeView === 'SKILLS'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Skills-Matrix</span>
                </button>

                <button
                  onClick={() => {
                    onViewChange('MASTER_DATA');
                    setIsMenuOpen(false);
                  }}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 border transition ${
                    activeView === 'MASTER_DATA'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                      : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)]'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-teal-400" />
                  <span>Stammdaten</span>
                </button>
              </div>
            </div>

            {/* DRAFT & PUBLISHING */}
            <div className="pt-2 border-t border-[var(--wood-border)]/50">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--wood-text-muted)] block mb-1.5">
                Planungs-Status & Freigabe
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--wood-seam)] border border-[var(--wood-border)]">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        currentWeek.isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-xs font-medium">
                      {currentWeek.isPublished ? 'Veröffentlicht' : `Entwurf (${draftChangesCount} Änderungen)`}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onPublish();
                      setIsMenuOpen(false);
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded transition flex items-center space-x-1 ${
                      blockingConflictsCount > 0
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {blockingConflictsCount > 0 ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>{blockingConflictsCount} Konflikte</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Freigeben</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Undo / Redo */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--wood-seam)] border border-[var(--wood-border)]">
                  <span className="text-xs font-medium">Historie</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={onUndo}
                      disabled={!canUndo}
                      className={`p-1.5 rounded transition ${
                        canUndo
                          ? 'bg-[var(--wood-raised)] text-white hover:bg-[var(--wood-edge)]'
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                      title="Rückgängig (Ctrl+Z)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onRedo}
                      disabled={!canRedo}
                      className={`p-1.5 rounded transition ${
                        canRedo
                          ? 'bg-[var(--wood-raised)] text-white hover:bg-[var(--wood-edge)]'
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                      title="Wiederholen (Ctrl+Y)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPORTS & PRINTING */}
            <div className="pt-2 border-t border-[var(--wood-border)]/50">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--wood-text-muted)] block mb-1.5">
                Export & Druck
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    handlePrint();
                    setIsMenuOpen(false);
                  }}
                  className="px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 bg-[var(--wood-seam)] border border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)] transition"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Drucken / PDF</span>
                </button>

                {onExportCSV && (
                  <button
                    onClick={() => {
                      onExportCSV();
                      setIsMenuOpen(false);
                    }}
                    className="px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 bg-[var(--wood-seam)] border border-[var(--wood-border)] text-emerald-400 hover:bg-[var(--wood-raised)] transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lohn-CSV</span>
                  </button>
                )}
              </div>
            </div>

            {/* DISPLAY & SYSTEM SETTINGS */}
            <div className="pt-2 border-t border-[var(--wood-border)]/50 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--wood-text-muted)] block mb-1.5">
                Anzeige & Einstellungen
              </span>

              {/* Toggle Summary KPIs */}
              {onToggleSummaryTiles && (
                <button
                  onClick={onToggleSummaryTiles}
                  className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between bg-[var(--wood-seam)] border border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)] transition"
                >
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kennzahlen-Übersicht (KPIs)</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${showSummaryTiles ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>
                    {showSummaryTiles ? 'Aktiv' : 'Aus'}
                  </span>
                </button>
              )}

              {/* Role Toggle */}
              <button
                onClick={() =>
                  onRoleToggle(
                    simulatedRole === 'ADMINISTRATOR' ? 'GESCHÄFTSFÜHRUNG' : 'ADMINISTRATOR'
                  )
                }
                className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between bg-[var(--wood-seam)] border border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)] transition"
              >
                <div className="flex items-center space-x-2">
                  {simulatedRole === 'ADMINISTRATOR' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Rolle: {simulatedRole}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--wood-text-muted)] underline">
                  Wechseln
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={onToggleDarkMode}
                className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between bg-[var(--wood-seam)] border border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)] transition"
              >
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>Design: {isDarkMode ? 'Dunkel' : 'Hell'}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--wood-text-muted)] underline">
                  Umschalten
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


