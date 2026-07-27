import React, { useState } from 'react';
import {
  Employee,
  WorksiteAssignment,
  EmployeeStatusOption,
  EmploymentTypeOption,
} from '../../types';
import { EmployeeForm } from './EmployeeForm';
import { Avatar } from '../common/Avatar';
import { calculateHours } from '../../domain/conflictEngine';
import {
  User,
  Search,
  Plus,
  Edit2,
  Clock,
  Building2,
  Phone,
  Mail,
  Award,
  Filter,
} from 'lucide-react';

interface EmployeesMasterDataProps {
  employees: Employee[];
  assignments: WorksiteAssignment[];
  statusOptions: EmployeeStatusOption[];
  employmentTypeOptions: EmploymentTypeOption[];
  onAddStatusOption: (label: string) => EmployeeStatusOption;
  onAddEmploymentTypeOption: (label: string) => EmploymentTypeOption;
  onCreateEmployee: (employee: Omit<Employee, 'id'> | Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  isDarkMode?: boolean;
}

export const EmployeesMasterData: React.FC<EmployeesMasterDataProps> = ({
  employees,
  assignments,
  statusOptions,
  employmentTypeOptions,
  onAddStatusOption,
  onAddEmploymentTypeOption,
  onCreateEmployee,
  onUpdateEmployee,
  isDarkMode = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusId, setSelectedStatusId] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredEmployees = employees.filter((e) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(term) ||
      e.role.toLowerCase().includes(term) ||
      e.skills.some((sk) => sk.toLowerCase().includes(term)) ||
      (e.email && e.email.toLowerCase().includes(term));

    const matchesStatus =
      selectedStatusId === 'ALL' || e.statusId === selectedStatusId;
    const matchesRole = selectedRole === 'ALL' || e.role === selectedRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleFormSubmit = (data: Omit<Employee, 'id'> | Employee) => {
    if ('id' in data && data.id) {
      onUpdateEmployee(data as Employee);
    } else {
      onCreateEmployee(data);
    }
    setEditingEmployee(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* CREATE / EDIT MODAL */}
      {(isCreating || editingEmployee) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[var(--wood-panel)] border border-[var(--wood-border)] rounded-2xl p-6 shadow-2xl my-8 overflow-y-auto max-h-[90vh] custom-scrollbar wood-grain-v">
            <EmployeeForm
              initialEmployee={editingEmployee}
              statusOptions={statusOptions}
              employmentTypeOptions={employmentTypeOptions}
              onAddStatusOption={onAddStatusOption}
              onAddEmploymentTypeOption={onAddEmploymentTypeOption}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsCreating(false);
                setEditingEmployee(null);
              }}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--wood-seam)]/60 p-4 rounded-xl border border-[var(--wood-border)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--wood-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Mitarbeiter suchen (Name, Rolle, Skills, E-Mail)..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-[var(--wood-base)] border border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[var(--wood-text-muted)] shrink-0 hidden sm:block" />
          <select
            value={selectedStatusId}
            onChange={(e) => setSelectedStatusId(e.target.value)}
            className="px-2.5 py-2 rounded-lg text-xs bg-[var(--wood-base)] border border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          >
            <option value="ALL">Alle Status</option>
            {statusOptions.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-2.5 py-2 rounded-lg text-xs bg-[var(--wood-base)] border border-[var(--wood-border)] text-[var(--wood-text-primary)]"
          >
            <option value="ALL">Alle Rollen</option>
            <option value="Teamleiter">Teamleiter</option>
            <option value="SKT-Kletterer">SKT-Kletterer</option>
            <option value="Baumpfleger">Baumpfleger</option>
            <option value="Maschinist">Maschinist</option>
            <option value="Auszubildender">Auszubildender</option>
            <option value="Facharbeiter">Facharbeiter</option>
          </select>

          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-[var(--wood-moss)] hover:brightness-110 text-[var(--wood-seam)] font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-md shrink-0 ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Mitarbeiter hinzufügen</span>
          </button>
        </div>
      </div>

      {/* EMPLOYEES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[var(--wood-text-muted)] bg-[var(--wood-seam)]/30 rounded-xl border border-[var(--wood-border)]">
            <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Keine Mitarbeiter gefunden.</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            // Find status label
            const statusObj = statusOptions.find((s) => s.id === emp.statusId);
            const statusLabel = statusObj?.label || 'Aktiv';

            // Find employment type label
            const empTypeObj = employmentTypeOptions.find(
              (t) => t.id === emp.employmentTypeId
            );
            const empTypeLabel = empTypeObj?.label || 'Festanstellung';

            // Calculate planned hours & worksites count in assignments
            const empAssignments = assignments.filter((a) =>
              a.assignedEmployeeIds.includes(emp.id)
            );
            let totalPlannedHours = 0;
            const worksiteIds = new Set<string>();

            empAssignments.forEach((a) => {
              totalPlannedHours += calculateHours(a.startTime, a.endTime);
              worksiteIds.add(a.worksiteId);
            });

            return (
              <div
                key={emp.id}
                className="wood-raised-card p-4 space-y-4 flex flex-col justify-between hover:border-[var(--wood-edge)] transition group"
              >
                <div className="space-y-3">
                  {/* HEADER WITH AVATAR, NAME, EDIT BUTTON */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar employee={emp} size="lg" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[var(--wood-text-primary)] group-hover:text-[var(--wood-ash)] transition">
                            {emp.firstName} {emp.lastName}
                          </h4>
                          {emp.isLeader && (
                            <Award
                              className="w-4 h-4 text-amber-400 shrink-0"
                              title="Teamleiter-Berechtigung"
                            />
                          )}
                        </div>
                        <p className="text-xs text-[var(--wood-text-secondary)] font-medium">
                          {emp.role}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingEmployee(emp)}
                      className="p-1.5 text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] hover:bg-[var(--wood-seam)] rounded-lg transition shrink-0"
                      title="Mitarbeiter bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* STATUS & EMPLOYMENT TYPE BADGES */}
                  <div className="flex items-center gap-2 text-[10px] flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded font-bold border ${
                        statusLabel.toLowerCase().includes('aktiv')
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                          : statusLabel.toLowerCase().includes('abwesend')
                          ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      ● {statusLabel}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-[var(--wood-seam)] text-[var(--wood-text-secondary)] border border-[var(--wood-border)] font-medium">
                      {empTypeLabel}
                    </span>
                  </div>

                  {/* CONTACT & HOURS INFO */}
                  <div className="space-y-1 text-xs text-[var(--wood-text-secondary)] pt-1 border-t border-[var(--wood-border)]/50">
                    {emp.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-[var(--wood-text-muted)] shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    )}
                    {emp.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--wood-text-muted)] shrink-0" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* SKILLS */}
                  {emp.skills && emp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {emp.skills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[9px] bg-[var(--wood-base)] text-[var(--wood-text-secondary)] px-1.5 py-0.5 rounded border border-[var(--wood-border)]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTTOM WORKLOAD & ASSIGNMENTS STATS */}
                <div className="pt-3 border-t border-[var(--wood-border)] grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-[var(--wood-seam)]/60 p-2 rounded-lg border border-[var(--wood-border)]">
                    <div className="text-[10px] text-[var(--wood-text-muted)] uppercase font-semibold flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--wood-info)]" />
                      Geplant
                    </div>
                    <div className="font-mono font-bold text-[var(--wood-text-primary)] text-xs mt-0.5">
                      {totalPlannedHours}h / {emp.maxWeeklyHours}h
                    </div>
                  </div>

                  <div className="bg-[var(--wood-seam)]/60 p-2 rounded-lg border border-[var(--wood-border)]">
                    <div className="text-[10px] text-[var(--wood-text-muted)] uppercase font-semibold flex items-center justify-center gap-1">
                      <Building2 className="w-3 h-3 text-[var(--wood-moss)]" />
                      Baustellen
                    </div>
                    <div className="font-mono font-bold text-[var(--wood-text-primary)] text-xs mt-0.5">
                      {worksiteIds.size} Baustellen
                    </div>
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
