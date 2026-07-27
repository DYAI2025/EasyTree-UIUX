import React, { useState } from 'react';
import { WorksiteComment } from '../../types';
import { MessageSquare, Eye, Send, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface CommentPanelProps {
  comments: WorksiteComment[];
  onChange: (comments: WorksiteComment[]) => void;
  onMarkRead?: () => void;
  isDarkMode?: boolean;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  comments,
  onChange,
  onMarkRead,
  isDarkMode = true,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [authorName, setAuthorName] = useState('Planung / Baugruppe');
  const [newText, setNewText] = useState('');

  const unreadComments = comments.filter((c) => c.isUnread);
  const readComments = comments.filter((c) => !c.isUnread);

  // If showAll is false, show unread comments first. If no unread comments, show the latest 2 read comments unless expanded.
  const visibleComments = showAll
    ? comments
    : unreadComments.length > 0
    ? unreadComments
    : comments.slice(-2);

  const collapsedCount = comments.length - visibleComments.length;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newComment: WorksiteComment = {
      id: `com_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: newText.trim(),
      author: authorName.trim() || 'Planung',
      createdAt: formattedDate,
      isUnread: false, // New comment written by user is read
    };

    onChange([...comments, newComment]);
    setNewText('');
  };

  const handleMarkAllRead = () => {
    onChange(comments.map((c) => ({ ...c, isUnread: false })));
    if (onMarkRead) onMarkRead();
  };

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <label
          className={`block text-xs font-semibold flex items-center gap-1.5 ${
            isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[var(--wood-info)]" />
          <span>Kommentare & Baustellennotizen</span>
        </label>

        <div className="flex items-center gap-2">
          {unreadComments.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/30 transition"
            >
              <CheckCircle className="w-3 h-3 text-amber-400" />
              <span>{unreadComments.length} als gelesen markieren</span>
            </button>
          )}

          {comments.length > visibleComments.length && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-[11px] text-[var(--wood-ash)] hover:underline flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              <span>
                {showAll
                  ? 'Weniger anzeigen'
                  : `Alle Kommentare anzeigen (${comments.length})`}
              </span>
              {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* COMMENTS LIST */}
      <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
        {comments.length === 0 ? (
          <p className="text-xs italic text-[var(--wood-text-muted)] p-2 rounded bg-[var(--wood-seam)] border border-[var(--wood-border)]">
            Keine Kommentare vorhanden.
          </p>
        ) : (
          visibleComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-2.5 rounded-lg border text-xs space-y-1 transition ${
                comment.isUnread
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-100 shadow-xs'
                  : isDarkMode
                  ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <div className="font-bold flex items-center gap-1.5">
                  <span
                    className={
                      comment.isUnread ? 'text-amber-300 font-extrabold' : 'text-[var(--wood-ash)]'
                    }
                  >
                    {comment.author}
                  </span>
                  {comment.isUnread && (
                    <span className="bg-amber-500 text-black font-bold px-1 rounded text-[9px]">
                      UNGELERNT / NEU
                    </span>
                  )}
                </div>
                <span className="text-[var(--wood-text-muted)] font-mono">{comment.createdAt}</span>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))
        )}

        {!showAll && collapsedCount > 0 && unreadComments.length === 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="w-full text-center py-1.5 bg-[var(--wood-seam)]/50 hover:bg-[var(--wood-seam)] border border-[var(--wood-border)] rounded text-[11px] text-[var(--wood-ash)] transition"
          >
            + {collapsedCount} ältere Kommentare ausklappen
          </button>
        )}
      </div>

      {/* NEW COMMENT INPUT FORM */}
      <form onSubmit={handleAddComment} className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Verfasser Name / Kürzel..."
            className={`w-40 px-2.5 py-1 rounded text-xs border font-medium ${
              isDarkMode
                ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
          <span className="text-[10px] text-[var(--wood-text-muted)]">Absender</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Neuen Kommentar verfassen..."
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs border font-medium transition-colors ${
              isDarkMode
                ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[var(--wood-info)] hover:brightness-110 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Senden</span>
          </button>
        </div>
      </form>
    </div>
  );
};
