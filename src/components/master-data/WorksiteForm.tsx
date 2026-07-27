import React, { useState } from 'react';
import {
  Worksite,
  WorksiteColorKey,
  WorksiteRequirement,
  WorksiteTodo,
  WorksiteComment,
} from '../../types';
import { TodoChecklistEditor } from './TodoChecklistEditor';
import { CommentPanel } from './CommentPanel';
import {
  Building2,
  MapPin,
  Clock,
  FileText,
  ListPlus,
  Trash2,
  AlertCircle,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export const WORKSITE_COLOR_OPTIONS: { key: WorksiteColorKey; label: string; hex: string }[] = [
  { key: 'site-blue', label: 'Blau', hex: '#4AA8E8' },
  { key: 'site-green', label: 'Grün', hex: '#45B879' },
  { key: 'site-orange', label: 'Orange', hex: '#E89235' },
  { key: 'site-violet', label: 'Violett', hex: '#9B7AE5' },
  { key: 'site-teal', label: 'Türkis', hex: '#2DD4BF' },
  { key: 'site-red', label: 'Rot', hex: '#F87171' },
  { key: 'site-yellow', label: 'Gelb', hex: '#FACC15' },
  { key: 'site-slate', label: 'Grau', hex: '#94A3B8' },
];

export const AVAILABLE_SKILLS_LIST = [
  'SKT-A Klettern',
  'SKT-B Klettern',
  'AS Baum I',
  'AS Baum II',
  'Ersthelfer',
  'LKW CE',
  'Hubarbeitsbühne',
  'Kettensägenschein',
  'Baggerführerschein',
  'Pflanzung & Bodenkunde',
];

interface WorksiteFormProps {
  initialWorksite?: Partial<Worksite> | null;
  existingWorksites: Worksite[];
  onSubmit: (worksiteData: Omit<Worksite, 'id'> | Worksite) => void;
  onCancel: () => void;
  isDarkMode?: boolean;
}

export const WorksiteForm: React.FC<WorksiteFormProps> = ({
  initialWorksite,
  existingWorksites,
  onSubmit,
  onCancel,
  isDarkMode = true,
}) => {
  const isEditMode = Boolean(initialWorksite?.id);

  // Form Fields State
  const [name, setName] = useState(initialWorksite?.name || '');
  const [code, setCode] = useState(
    initialWorksite?.code || `BAU-${100 + existingWorksites.length + 1}`
  );
  const [location, setLocation] = useState(initialWorksite?.location || '');
  const [address, setAddress] = useState(initialWorksite?.address || '');
  const [meetingPoint, setMeetingPoint] = useState(initialWorksite?.meetingPoint || '');
  const [colorKey, setColorKey] = useState<WorksiteColorKey>(
    initialWorksite?.colorKey || 'site-blue'
  );
  const [description, setDescription] = useState(initialWorksite?.description || '');
  const [orderDescription, setOrderDescription] = useState(
    initialWorksite?.orderDescription || ''
  );
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    initialWorksite?.requiredSkills || []
  );
  const [requirements, setRequirements] = useState<WorksiteRequirement[]>(
    initialWorksite?.requirements || []
  );
  const [todoItems, setTodoItems] = useState<WorksiteTodo[]>(
    initialWorksite?.todoItems || []
  );
  const [comments, setComments] = useState<WorksiteComment[]>(
    initialWorksite?.comments || []
  );

  // New requirement & custom skill input state
  const [newReqText, setNewReqText] = useState('');
  const [customSkillText, setCustomSkillText] = useState('');
  const [skillFilterQuery, setSkillFilterQuery] = useState('');

  // Validation Error State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleToggleSkill = (skill: string) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter((s) => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (!customSkillText.trim()) return;
    const trimmed = customSkillText.trim();
    if (!requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
    }
    setCustomSkillText('');
  };

  const handleAddRequirement = () => {
    if (!newReqText.trim()) return;
    const newReq: WorksiteRequirement = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: newReqText.trim(),
    };
    setRequirements([...requirements, newReq]);
    setNewReqText('');
  };

  const handleRemoveRequirement = (id: string) => {
    setRequirements(requirements.filter((r) => r.id !== id));
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) errs.name = 'Name der Baustelle ist erforderlich.';
    if (!code.trim()) {
      errs.code = 'Baustellen-Code ist erforderlich.';
    } else {
      // Check code uniqueness
      const isDuplicateCode = existingWorksites.some(
        (w) => w.code.toLowerCase() === code.trim().toLowerCase() && w.id !== initialWorksite?.id
      );
      if (isDuplicateCode) {
        errs.code = `Der Code "${code.trim()}" wird bereits verwendet.`;
      }
    }
    if (!location.trim()) errs.location = 'Ort / Bezirk ist erforderlich.';
    if (!address.trim()) errs.address = 'Adresse ist erforderlich.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedColorObj =
      WORKSITE_COLOR_OPTIONS.find((c) => c.key === colorKey) || WORKSITE_COLOR_OPTIONS[0];

    const worksitePayload = {
      ...(initialWorksite?.id ? { id: initialWorksite.id } : {}),
      code: code.trim(),
      name: name.trim(),
      location: location.trim(),
      address: address.trim(),
      meetingPoint: meetingPoint.trim() || 'Nach Absprache',
      colorKey,
      hexColor: selectedColorObj.hex,
      description: description.trim(),
      orderDescription: orderDescription.trim() || description.trim(),
      requiredSkills,
      requirements,
      todoItems,
      comments,
    };

    onSubmit(worksitePayload as Worksite);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--wood-border)]">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{
              backgroundColor:
                WORKSITE_COLOR_OPTIONS.find((c) => c.key === colorKey)?.hex || '#4AA8E8',
            }}
          />
          <h3 className="text-lg font-bold text-[var(--wood-text-primary)]">
            {isEditMode ? `Baustelle bearbeiten: ${initialWorksite?.name}` : 'Neue Baustelle anlegen'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* BASIC DATA SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Code */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Baustellen-Code *
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="z.B. BAU-105"
            className={`w-full px-3 py-2 rounded-lg text-xs border font-mono font-bold ${
              errors.code
                ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
            }`}
          />
          {errors.code && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.code}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Name der Baustelle *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Park Sanssouci"
            className={`w-full px-3 py-2 rounded-lg text-xs border font-bold ${
              errors.name
                ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
            }`}
          />
          {errors.name && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Location / District */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--wood-moss)]" />
            Ort / Bezirk *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="z.B. Potsdam"
            className={`w-full px-3 py-2 rounded-lg text-xs border ${
              errors.location
                ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
            }`}
          />
          {errors.location && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.location}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Genaue Adresse *
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="z.B. Maulbeerallee, 14469 Potsdam"
            className={`w-full px-3 py-2 rounded-lg text-xs border ${
              errors.address
                ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
            }`}
          />
          {errors.address && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.address}
            </p>
          )}
        </div>

        {/* Treffpunkt */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Treffpunkt & Uhrzeit
          </label>
          <input
            type="text"
            value={meetingPoint}
            onChange={(e) => setMeetingPoint(e.target.value)}
            placeholder="z.B. Eingang Grünes Gitter 06:45 Uhr"
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          />
        </div>

        {/* Color Palette Selector */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Farbkennzeichnung
          </label>
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {WORKSITE_COLOR_OPTIONS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColorKey(c.key)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition border ${
                  colorKey === c.key
                    ? 'ring-2 ring-white scale-110 border-white'
                    : 'opacity-70 hover:opacity-100 border-transparent'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              >
                {colorKey === c.key && <Check className="w-3.5 h-3.5 text-black font-bold" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DESCRIPTIONS */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-[var(--wood-info)]" />
            Kurzbeschreibung
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="z.B. Kronenpflege an historischen Eichen und Totholzentnahme"
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Auftragsbeschreibung / Detaillierte Tätigkeiten
          </label>
          <textarea
            rows={3}
            value={orderDescription}
            onChange={(e) => setOrderDescription(e.target.value)}
            placeholder="Detaillierte Beschreibung der auszuführenden Arbeiten, Fällungsmethodik, Maschineneinsatz..."
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] custom-scrollbar"
          />
        </div>
      </div>

      {/* REQUIRED SKILLS SELECTOR */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Erforderliche Qualifikationen / Skills für diese Baustelle
        </label>

        {/* Selected skills badges */}
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-[var(--wood-base)] border border-amber-500/30">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase mr-1">
              Ausgewählt ({requiredSkills.length}):
            </span>
            {requiredSkills.map((sk) => (
              <span
                key={sk}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
              >
                <span>{sk}</span>
                <button
                  type="button"
                  onClick={() => handleToggleSkill(sk)}
                  className="hover:text-rose-400 transition ml-0.5"
                  title="Qualifikation entfernen"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Filter Master List of Available Skills */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={skillFilterQuery}
            onChange={(e) => setSkillFilterQuery(e.target.value)}
            placeholder="Qualifikationen filtern (z.B. SKT, Baum, Ersthelfer)..."
            className="w-full px-3 py-1.5 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          />
          {skillFilterQuery && (
            <button
              type="button"
              onClick={() => setSkillFilterQuery('')}
              className="px-2 py-1 text-xs text-[var(--wood-text-muted)] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Preset Skill Buttons */}
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-[var(--wood-seam)] border border-[var(--wood-border)] max-h-[160px] overflow-y-auto custom-scrollbar">
          {AVAILABLE_SKILLS_LIST.filter((sk) =>
            sk.toLowerCase().includes(skillFilterQuery.toLowerCase().trim())
          ).map((sk) => {
            const isSelected = requiredSkills.includes(sk);
            return (
              <button
                key={sk}
                type="button"
                onClick={() => handleToggleSkill(sk)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition border ${
                  isSelected
                    ? 'bg-[var(--wood-moss)] text-black border-[var(--wood-moss)]'
                    : 'bg-black/20 text-[var(--wood-text-muted)] border-transparent hover:border-[var(--wood-border)]'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {sk}
              </button>
            );
          })}
          {AVAILABLE_SKILLS_LIST.filter((sk) =>
            sk.toLowerCase().includes(skillFilterQuery.toLowerCase().trim())
          ).length === 0 && (
            <span className="text-xs text-[var(--wood-text-muted)] italic p-1">
              Keine passenden vordefinierten Qualifikationen gefunden.
            </span>
          )}
        </div>

        {/* Add Custom Skill Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customSkillText}
            onChange={(e) => setCustomSkillText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomSkill();
              }
            }}
            placeholder="Eigene Qualifikation / Zertifikat eingeben..."
            className="flex-1 px-3 py-1.5 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          />
          <button
            type="button"
            onClick={handleAddCustomSkill}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-lg transition"
          >
            + Hinzufügen
          </button>
        </div>
      </div>

      {/* SPECIAL REQUIREMENTS LIST */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] flex items-center gap-1">
          <ListPlus className="w-3.5 h-3.5 text-[var(--wood-ash)]" />
          Spezielle Baustellen-Anforderungen & Sicherheitsauflagen
        </label>

        <div className="space-y-1.5">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-2 rounded-lg bg-[var(--wood-seam)] border border-[var(--wood-border)] text-xs"
            >
              <span className="text-[var(--wood-text-primary)] font-medium">• {req.text}</span>
              <button
                type="button"
                onClick={() => handleRemoveRequirement(req.id)}
                className="text-neutral-400 hover:text-rose-400 p-1"
                title="Entfernen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newReqText}
            onChange={(e) => setNewReqText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRequirement();
              }
            }}
            placeholder="z.B. Zertifizierter SKT-B Kletterer erforderlich"
            className="flex-1 px-3 py-1.5 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          />
          <button
            type="button"
            onClick={handleAddRequirement}
            className="px-3 py-1.5 bg-[var(--wood-raised)] hover:bg-[var(--wood-edge)] text-[var(--wood-text-primary)] text-xs rounded-lg border border-[var(--wood-border)]"
          >
            Hinzufügen
          </button>
        </div>
      </div>

      {/* TODO CHECKLIST EDITOR */}
      <div className="p-4 rounded-xl bg-[var(--wood-seam)]/40 border border-[var(--wood-border)]">
        <TodoChecklistEditor
          todoItems={todoItems}
          onChange={setTodoItems}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* COMMENTS PANEL */}
      <div className="p-4 rounded-xl bg-[var(--wood-seam)]/40 border border-[var(--wood-border)]">
        <CommentPanel
          comments={comments}
          onChange={setComments}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* ACTIONS FOOTER */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--wood-border)] sticky bottom-0 bg-[var(--wood-base)] py-3 z-10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)] transition border border-transparent hover:border-[var(--wood-border)]"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-xs font-bold bg-[var(--wood-moss)] hover:brightness-110 text-[var(--wood-seam)] transition shadow-md flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>{isEditMode ? 'Änderungen speichern' : 'Baustelle anlegen'}</span>
        </button>
      </div>
    </form>
  );
};
