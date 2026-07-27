import React, { useState } from 'react';
import { WorksiteTodo } from '../../types';
import { CheckSquare, Square, Plus, Trash2, Calendar, Edit2, Check } from 'lucide-react';

interface TodoChecklistEditorProps {
  todoItems: WorksiteTodo[];
  onChange: (todos: WorksiteTodo[]) => void;
  isDarkMode?: boolean;
}

export const TodoChecklistEditor: React.FC<TodoChecklistEditorProps> = ({
  todoItems,
  onChange,
  isDarkMode = true,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const completedCount = todoItems.filter((t) => t.completed).length;
  const totalCount = todoItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: WorksiteTodo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      completed: false,
      dueDate: newDueDate ? newDueDate : undefined,
    };

    onChange([...todoItems, newItem]);
    setNewTitle('');
    setNewDueDate('');
  };

  const handleToggleTodo = (id: string) => {
    onChange(
      todoItems.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleRemoveTodo = (id: string) => {
    onChange(todoItems.filter((t) => t.id !== id));
  };

  const handleStartEdit = (todo: WorksiteTodo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingTitle.trim()) {
      handleRemoveTodo(id);
    } else {
      onChange(
        todoItems.map((t) => (t.id === id ? { ...t, title: editingTitle.trim() } : t))
      );
    }
    setEditingId(null);
    setEditingTitle('');
  };

  return (
    <div className="space-y-3">
      {/* HEADER & PROGRESS */}
      <div className="flex items-center justify-between">
        <label
          className={`block text-xs font-semibold flex items-center gap-1.5 ${
            isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-[var(--wood-moss)]" />
          <span>To-do-Checkliste</span>
        </label>
        {totalCount > 0 && (
          <span
            className={`text-xs font-mono font-bold ${
              completedCount === totalCount
                ? 'text-emerald-400'
                : isDarkMode
                ? 'text-[var(--wood-ash)]'
                : 'text-slate-600'
            }`}
          >
            {completedCount}/{totalCount} erledigt ({progressPercent}%)
          </span>
        )}
      </div>

      {/* PROGRESS BAR */}
      {totalCount > 0 && (
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/50">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* ITEMS LIST */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar">
        {todoItems.length === 0 ? (
          <p className="text-xs italic text-[var(--wood-text-muted)] p-2 rounded bg-[var(--wood-seam)] border border-[var(--wood-border)]">
            Keine Aufgaben in der Checkliste eingetragen.
          </p>
        ) : (
          todoItems.map((todo) => {
            const isEditing = editingId === todo.id;
            return (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs transition ${
                  todo.completed
                    ? 'bg-neutral-900/40 border-neutral-800 text-neutral-400 line-through opacity-80'
                    : isDarkMode
                    ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] hover:border-[var(--wood-edge)]'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(todo.id)}
                    className="text-emerald-400 hover:text-emerald-300 shrink-0 focus-ring rounded"
                    title={todo.completed ? 'Als unerledigt markieren' : 'Als erledigt markieren'}
                  >
                    {todo.completed ? (
                      <CheckSquare className="w-4 h-4 fill-emerald-500/20" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(todo.id);
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-black/50 border border-emerald-500/50 rounded px-2 py-0.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(todo.id)}
                        className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate flex-1 font-medium">{todo.title}</span>
                  )}

                  {todo.dueDate && !isEditing && (
                    <span className="text-[10px] text-amber-300/80 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {todo.dueDate}
                    </span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(todo)}
                      className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTodo(todo.id)}
                      className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition"
                      title="Löschen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* INPUT FORM FOR NEW ITEM */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTodo(e);
            }
          }}
          placeholder="Neuen Checklistenpunkt hinzufügen..."
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs border font-medium transition-colors ${
            isDarkMode
              ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          title="Optionales Fälligkeitsdatum"
          className={`w-32 px-2 py-1.5 rounded-lg text-xs border font-mono transition-colors ${
            isDarkMode
              ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        />
        <button
          type="button"
          onClick={handleAddTodo}
          className="px-3 py-1.5 bg-[var(--wood-moss)] hover:brightness-110 text-[var(--wood-seam)] font-bold text-xs rounded-lg transition flex items-center gap-1 shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Hinzufügen</span>
        </button>
      </div>
    </div>
  );
};
