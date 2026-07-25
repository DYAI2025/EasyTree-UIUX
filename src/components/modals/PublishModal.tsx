import React from 'react';
import { X, Send, AlertTriangle, CheckCircle2, ShieldAlert, BellRing } from 'lucide-react';
import { PlanningConflict, PlanningWeek, Employee } from '../../types';

interface PublishModalProps {
  currentWeek: PlanningWeek;
  conflicts: PlanningConflict[];
  assignedEmployeesCount: number;
  onClose: () => void;
  onConfirmPublish: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  currentWeek,
  conflicts,
  assignedEmployeesCount,
  onClose,
  onConfirmPublish,
}) => {
  const blockingConflicts = conflicts.filter((c) => c.severity === 'blocking');
  const warningConflicts = conflicts.filter((c) => c.severity === 'warning');

  const canPublish = blockingConflicts.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-[#171717] border border-[#45474D] rounded-2xl shadow-2xl overflow-hidden select-none">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-[#202124] border-b border-[#45474D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-neutral-100">
              Plan veröffentlichen · KW {currentWeek.weekNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#32343A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-6 space-y-4 text-xs text-neutral-200">
          {/* BLOCKING CONFLICTS WARNING */}
          {blockingConflicts.length > 0 ? (
            <div className="p-4 bg-rose-950/80 border border-rose-700 rounded-xl space-y-3 text-rose-200">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                <span>Veröffentlichung durch {blockingConflicts.length} Konflikte blockiert!</span>
              </div>
              <p className="text-xs opacity-90">
                Folgende kritische Fehler müssen zuerst behoben werden, bevor der Wochenplan an Mitarbeiter übermittelt werden kann:
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {blockingConflicts.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-black/40 rounded-lg border border-rose-800/80 text-xs"
                  >
                    <div className="font-semibold text-rose-200">{c.title}</div>
                    <div className="text-[11px] opacity-80">{c.message}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-xl space-y-2 text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Plan freigegeben zur Veröffentlichung</span>
              </div>
              <p className="text-xs opacity-90">
                Es wurden keine blockierenden Konflikte festgestellt.
              </p>
            </div>
          )}

          {/* WARNINGS LIST IF ANY */}
          {warningConflicts.length > 0 && (
            <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-xl text-amber-200 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{warningConflicts.length} Hinweise (Nicht-blockierend):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90 max-h-28 overflow-y-auto">
                {warningConflicts.map((w) => (
                  <li key={w.id}>
                    <strong className="text-amber-200">{w.title}:</strong> {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PUBLICATION SUMMARY & SIMULATION NOTICE */}
          <div className="p-3 bg-[#202124] rounded-xl border border-[#32343A] space-y-2 text-neutral-300">
            <div className="flex items-center justify-between text-xs">
              <span>Betroffene Mitarbeiter:</span>
              <span className="font-bold text-neutral-100">{assignedEmployeesCount} Personen</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Planungszeitraum:</span>
              <span className="font-bold text-neutral-100">
                {currentWeek.startDate} – {currentWeek.endDate}
              </span>
            </div>

            <div className="pt-2 border-t border-[#292A2E] flex items-center gap-2 text-[11px] text-sky-300 italic">
              <BellRing className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                (Klickprototyp: Die Benachrichtigung der Mitarbeiter wird simuliert.)
              </span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 bg-[#202124] border-t border-[#45474D] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#292A2E] hover:bg-[#32343A] text-neutral-200 border border-[#45474D] rounded-lg text-xs font-semibold"
          >
            Abbrechen
          </button>

          <button
            onClick={onConfirmPublish}
            disabled={!canPublish}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-md ${
              canPublish
                ? 'bg-emerald-600 hover:bg-emerald-500 text-neutral-950'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Jetzt veröffentlichen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
