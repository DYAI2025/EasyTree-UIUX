import React, { useState } from 'react';
import {
  Employee,
  EmployeeStatusOption,
  EmploymentTypeOption,
} from '../../types';
import { AVAILABLE_SKILLS_LIST } from './WorksiteForm';
import {
  User,
  Mail,
  Phone,
  Clock,
  Plus,
  AlertCircle,
  Check,
  X,
  Award,
  Sparkles,
} from 'lucide-react';

export const DEFAULT_ROLES = [
  'Teamleiter',
  'SKT-Kletterer',
  'Baumpfleger',
  'Maschinist',
  'Auszubildender',
  'Facharbeiter',
];

interface EmployeeFormProps {
  initialEmployee?: Partial<Employee> | null;
  statusOptions: EmployeeStatusOption[];
  employmentTypeOptions: EmploymentTypeOption[];
  onAddStatusOption: (label: string) => EmployeeStatusOption;
  onAddEmploymentTypeOption: (label: string) => EmploymentTypeOption;
  onSubmit: (employeeData: Omit<Employee, 'id'> | Employee) => void;
  onCancel: () => void;
  isDarkMode?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialEmployee,
  statusOptions,
  employmentTypeOptions,
  onAddStatusOption,
  onAddEmploymentTypeOption,
  onSubmit,
  onCancel,
  isDarkMode = true,
}) => {
  const isEditMode = Boolean(initialEmployee?.id);

  // Form Fields
  const [firstName, setFirstName] = useState(initialEmployee?.firstName || '');
  const [lastName, setLastName] = useState(initialEmployee?.lastName || '');
  const [role, setRole] = useState(initialEmployee?.role || 'Baumpfleger');
  const [statusId, setStatusId] = useState(
    initialEmployee?.statusId || statusOptions[0]?.id || 'emp-status-1'
  );
  const [employmentTypeId, setEmploymentTypeId] = useState(
    initialEmployee?.employmentTypeId || employmentTypeOptions[0]?.id || 'emp-type-1'
  );
  const [isLeader, setIsLeader] = useState(initialEmployee?.isLeader || false);
  const [skills, setSkills] = useState<string[]>(initialEmployee?.skills || []);
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number>(
    initialEmployee?.maxWeeklyHours || 40
  );
  const [email, setEmail] = useState(initialEmployee?.email || '');
  const [phone, setPhone] = useState(initialEmployee?.phone || '');
  const [initials, setInitials] = useState(
    initialEmployee?.initials ||
      (initialEmployee?.firstName && initialEmployee?.lastName
        ? `${initialEmployee.firstName[0]}${initialEmployee.lastName[0]}`.toUpperCase()
        : '')
  );
  const [notes, setNotes] = useState(initialEmployee?.notes || '');

  // Inline Option Adding State
  const [newStatusInput, setNewStatusInput] = useState('');
  const [showAddStatusInput, setShowAddStatusInput] = useState(false);
  const [newEmploymentTypeInput, setNewEmploymentTypeInput] = useState('');
  const [showAddEmploymentTypeInput, setShowAddEmploymentTypeInput] = useState(false);

  // Validation Error State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    if (!initials || initials.length === 0 || !isEditMode) {
      const f = val.trim()[0] || '';
      const l = lastName.trim()[0] || '';
      setInitials(`${f}${l}`.toUpperCase());
    }
  };

  const handleLastNameChange = (val: string) => {
    setLastName(val);
    if (!initials || initials.length === 0 || !isEditMode) {
      const f = firstName.trim()[0] || '';
      const l = val.trim()[0] || '';
      setInitials(`${f}${l}`.toUpperCase());
    }
  };

  const handleToggleSkill = (sk: string) => {
    if (skills.includes(sk)) {
      setSkills(skills.filter((s) => s !== sk));
    } else {
      setSkills([...skills, sk]);
    }
  };

  const handleCreateStatusOption = () => {
    const trimmed = newStatusInput.trim();
    if (!trimmed) return;
    const existing = statusOptions.find(
      (s) => s.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      setStatusId(existing.id);
    } else {
      const created = onAddStatusOption(trimmed);
      setStatusId(created.id);
    }
    setNewStatusInput('');
    setShowAddStatusInput(false);
  };

  const handleCreateEmploymentTypeOption = () => {
    const trimmed = newEmploymentTypeInput.trim();
    if (!trimmed) return;
    const existing = employmentTypeOptions.find(
      (e) => e.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      setEmploymentTypeId(existing.id);
    } else {
      const created = onAddEmploymentTypeOption(trimmed);
      setEmploymentTypeId(created.id);
    }
    setNewEmploymentTypeInput('');
    setShowAddEmploymentTypeInput(false);
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!firstName.trim()) errs.firstName = 'Vorname ist erforderlich.';
    if (!lastName.trim()) errs.lastName = 'Nachname ist erforderlich.';
    if (maxWeeklyHours <= 0 || isNaN(maxWeeklyHours)) {
      errs.maxWeeklyHours = 'Gültige maximale Wochenstunden eintragen.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const calcInitials = initials.trim()
      ? initials.trim().toUpperCase()
      : `${firstName.trim()[0] || ''}${lastName.trim()[0] || ''}`.toUpperCase();

    const employeePayload = {
      ...(initialEmployee?.id ? { id: initialEmployee.id } : {}),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      statusId,
      employmentTypeId,
      isLeader: role === 'Teamleiter' || isLeader,
      skills,
      maxWeeklyHours: Number(maxWeeklyHours),
      initials: calcInitials,
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
    };

    onSubmit(employeePayload as Employee);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--wood-border)]">
        <h3 className="text-lg font-bold text-[var(--wood-text-primary)] flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--wood-info)]" />
          <span>
            {isEditMode
              ? `Mitarbeiter bearbeiten: ${initialEmployee?.firstName} ${initialEmployee?.lastName}`
              : 'Neuen Mitarbeiter anlegen'}
          </span>
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* NAME & INITIALS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Vorname *
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            placeholder="z.B. Martin"
            className={`w-full px-3 py-2 rounded-lg text-xs border font-medium ${
              errors.firstName
                ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
            }`}
          />
          {errors.firstName && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Nachname *
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => handleLastNameChange(e.target.value)}
            placeholder="z.B. Schuster"
            className={`w-full px-3 py-2 rounded-lg text-xs border font-medium ${
              errors.lastName
                ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
            }`}
          />
          {errors.lastName && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.lastName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Kürzel / Initialen
          </label>
          <input
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase())}
            maxLength={4}
            placeholder="MS"
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-mono uppercase font-bold"
          />
        </div>
      </div>

      {/* ROLE, STATUS, EMPLOYMENT TYPE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Rolle im Betrieb
          </label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value === 'Teamleiter') setIsLeader(true);
            }}
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-medium"
          >
            {DEFAULT_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown + Adder */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Status
          </label>
          {!showAddStatusInput ? (
            <div className="space-y-1">
              <select
                value={statusId}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    setShowAddStatusInput(true);
                  } else {
                    setStatusId(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-medium"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
                <option value="NEW">+ Neuen Status hinzufügen...</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newStatusInput}
                onChange={(e) => setNewStatusInput(e.target.value)}
                placeholder="Status Name..."
                autoFocus
                className="flex-1 px-2.5 py-1.5 rounded-lg text-xs border bg-[var(--wood-base)] border-[var(--wood-info)] text-[var(--wood-text-primary)]"
              />
              <button
                type="button"
                onClick={handleCreateStatusOption}
                className="px-2.5 py-1.5 bg-[var(--wood-moss)] text-[var(--wood-seam)] font-bold text-xs rounded-lg"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={() => setShowAddStatusInput(false)}
                className="p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Employment Type Dropdown + Adder */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Beschäftigungsart
          </label>
          {!showAddEmploymentTypeInput ? (
            <div className="space-y-1">
              <select
                value={employmentTypeId}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    setShowAddEmploymentTypeInput(true);
                  } else {
                    setEmploymentTypeId(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-medium"
              >
                {employmentTypeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
                <option value="NEW">+ Neue Beschäftigungsart hinzufügen...</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newEmploymentTypeInput}
                onChange={(e) => setNewEmploymentTypeInput(e.target.value)}
                placeholder="Beschäftigungsart Name..."
                autoFocus
                className="flex-1 px-2.5 py-1.5 rounded-lg text-xs border bg-[var(--wood-base)] border-[var(--wood-info)] text-[var(--wood-text-primary)]"
              />
              <button
                type="button"
                onClick={handleCreateEmploymentTypeOption}
                className="px-2.5 py-1.5 bg-[var(--wood-moss)] text-[var(--wood-seam)] font-bold text-xs rounded-lg"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={() => setShowAddEmploymentTypeInput(false)}
                className="p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HOURS & TEAM LEADER CHECKBOX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--wood-info)]" />
            Max. Wochenstunden *
          </label>
          <input
            type="number"
            value={maxWeeklyHours}
            onChange={(e) => setMaxWeeklyHours(Number(e.target.value))}
            min={1}
            max={60}
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-bold font-mono"
          />
          {errors.maxWeeklyHours && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.maxWeeklyHours}</p>
          )}
        </div>

        <div className="pt-5">
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[var(--wood-seam)] border border-[var(--wood-border)]">
            <input
              type="checkbox"
              checked={isLeader}
              onChange={(e) => setIsLeader(e.target.checked)}
              className="rounded border-[var(--wood-border)] text-[var(--wood-moss)] focus:ring-[var(--wood-moss)] w-4 h-4"
            />
            <span className="text-xs font-bold text-[var(--wood-text-primary)] flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Darf als Teamleiter eingesetzt werden</span>
            </span>
          </label>
        </div>
      </div>

      {/* CONTACT DATA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-[var(--wood-text-muted)]" />
            E-Mail-Adresse
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m.schuster@arborga.de"
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-[var(--wood-text-muted)]" />
            Telefonnummer
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+49 171 1029384"
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          />
        </div>
      </div>

      {/* SKILLS TAG SELECTOR */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Qualifikationen & Nachweise (Skills)
        </label>
        <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-[var(--wood-seam)] border border-[var(--wood-border)]">
          {AVAILABLE_SKILLS_LIST.map((sk) => {
            const isSelected = skills.includes(sk);
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
        </div>
      </div>

      {/* NOTES */}
      <div>
        <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
          Interne Notizen
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Besondere Absprachen, Einschränkungen, Urlaubsvereinbarungen..."
          className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] custom-scrollbar"
        />
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--wood-border)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] hover:bg-[var(--wood-raised)] transition"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-xs font-bold bg-[var(--wood-moss)] hover:brightness-110 text-[var(--wood-seam)] transition shadow-md flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>{isEditMode ? 'Mitarbeiter speichern' : 'Mitarbeiter anlegen'}</span>
        </button>
      </div>
    </form>
  );
};
