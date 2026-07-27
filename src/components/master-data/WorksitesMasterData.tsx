import React, { useState } from 'react';
import { Worksite } from '../../types';
import { WorksiteForm } from './WorksiteForm';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Clock,
  CheckSquare,
  MessageSquare,
  Edit2,
  Trash2,
  FileText,
} from 'lucide-react';

interface WorksitesMasterDataProps {
  worksites: Worksite[];
  onCreateWorksite: (worksite: Omit<Worksite, 'id'> | Worksite) => void;
  onUpdateWorksite: (worksite: Worksite) => void;
  onMarkCommentRead?: (worksiteId: string) => void;
  isDarkMode?: boolean;
}

export const WorksitesMasterData: React.FC<WorksitesMasterDataProps> = ({
  worksites,
  onCreateWorksite,
  onUpdateWorksite,
  onMarkCommentRead,
  isDarkMode = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWorksite, setEditingWorksite] = useState<Worksite | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredWorksites = worksites.filter((w) => {
    const term = searchTerm.toLowerCase();
    return (
      w.name.toLowerCase().includes(term) ||
      w.code.toLowerCase().includes(term) ||
      w.location.toLowerCase().includes(term) ||
      w.address.toLowerCase().includes(term) ||
      w.description.toLowerCase().includes(term)
    );
  });

  const handleFormSubmit = (data: Omit<Worksite, 'id'> | Worksite) => {
    if ('id' in data && data.id) {
      onUpdateWorksite(data as Worksite);
    } else {
      onCreateWorksite(data);
    }
    setEditingWorksite(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* MODAL FOR CREATE / EDIT WORKSITE */}
      {(isCreating || editingWorksite) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-[var(--wood-panel)] border border-[var(--wood-border)] rounded-2xl p-6 shadow-2xl my-8 overflow-y-auto max-h-[90vh] custom-scrollbar wood-grain-v">
            <WorksiteForm
              initialWorksite={editingWorksite}
              existingWorksites={worksites}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsCreating(false);
                setEditingWorksite(null);
              }}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* TOOLBAR: SEARCH & ADD */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--wood-seam)]/60 p-4 rounded-xl border border-[var(--wood-border)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--wood-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Baustelle suchen (Code, Name, Ort, Adresse)..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-[var(--wood-base)] border border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]"
          />
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-[var(--wood-moss)] hover:brightness-110 text-[var(--wood-seam)] font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Baustelle hinzufügen</span>
        </button>
      </div>

      {/* WORKSITES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorksites.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[var(--wood-text-muted)] bg-[var(--wood-seam)]/30 rounded-xl border border-[var(--wood-border)]">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Keine Baustellen gefunden.</p>
          </div>
        ) : (
          filteredWorksites.map((site) => {
            const completedTodos = site.todoItems?.filter((t) => t.completed).length || 0;
            const totalTodos = site.todoItems?.length || 0;
            const unreadComments = site.comments?.filter((c) => c.isUnread).length || 0;

            return (
              <div
                key={site.id}
                className="wood-raised-card p-5 space-y-4 flex flex-col justify-between hover:border-[var(--wood-edge)] transition group"
              >
                <div className="space-y-3">
                  {/* HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: site.hexColor || '#4AA8E8' }}
                      />
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--wood-seam)] text-[var(--wood-text-secondary)] border border-[var(--wood-border)]">
                        {site.code}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--wood-text-primary)] group-hover:text-[var(--wood-ash)] transition">
                        {site.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => setEditingWorksite(site)}
                      className="p-1.5 text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] hover:bg-[var(--wood-seam)] rounded-lg transition"
                      title="Baustelle bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* LOCATION & MEETING POINT */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--wood-text-secondary)] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[var(--wood-moss)] shrink-0" />
                      <span className="font-bold text-[var(--wood-text-primary)]">{site.location}</span>
                      <span>· {site.address}</span>
                    </div>

                    {site.meetingPoint && (
                      <div className="flex items-center gap-1.5 text-[var(--wood-text-muted)] text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Treffpunkt: {site.meetingPoint}</span>
                      </div>
                    )}
                  </div>

                  {/* ORDER DESCRIPTION PREVIEW */}
                  <div className="p-3 rounded-lg bg-[var(--wood-seam)]/60 border border-[var(--wood-border)] text-xs text-[var(--wood-text-secondary)] space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[var(--wood-text-muted)] flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[var(--wood-info)]" />
                      <span>Auftragsbeschreibung</span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[var(--wood-text-primary)] font-medium">
                      {site.orderDescription || site.description}
                    </p>
                  </div>

                  {/* SKILLS TAGS */}
                  {site.requiredSkills && site.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {site.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] bg-[var(--wood-base)] text-[var(--wood-text-secondary)] px-2 py-0.5 rounded border border-[var(--wood-border)] font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTTOM BADGES & STATUS METRICS */}
                <div className="pt-3 border-t border-[var(--wood-border)] flex items-center justify-between gap-2 text-xs">
                  {/* Todo Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <CheckSquare
                      className={`w-4 h-4 ${
                        totalTodos > 0 && completedTodos === totalTodos
                          ? 'text-emerald-400'
                          : 'text-[var(--wood-text-muted)]'
                      }`}
                    />
                    <span className="font-mono text-xs font-bold text-[var(--wood-text-secondary)]">
                      {completedTodos}/{totalTodos} To-dos erledigt
                    </span>
                  </div>

                  {/* Comments Badge */}
                  <div className="flex items-center gap-2">
                    {unreadComments > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                        <MessageSquare className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                        <span>{unreadComments} ungelesen</span>
                      </span>
                    ) : site.comments && site.comments.length > 0 ? (
                      <span className="text-[11px] text-[var(--wood-text-muted)] flex items-center gap-1 font-mono">
                        <MessageSquare className="w-3 h-3" />
                        <span>{site.comments.length}</span>
                      </span>
                    ) : null}

                    <button
                      onClick={() => setEditingWorksite(site)}
                      className="px-2.5 py-1 bg-[var(--wood-seam)] hover:bg-[var(--wood-edge)] text-[var(--wood-text-primary)] text-xs rounded-md border border-[var(--wood-border)] transition font-medium"
                    >
                      Details & Editor
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
