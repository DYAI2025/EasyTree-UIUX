import React, { useState } from 'react';
import {
  Employee,
  Worksite,
  Vehicle,
  Equipment,
  WorksiteAssignment,
  EmployeeStatusOption,
  EmploymentTypeOption,
  TeamTemplate,
  Absence,
} from '../../types';
import { EmployeesMasterData } from './EmployeesMasterData';
import { ResourcesMasterData } from './ResourcesMasterData';
import { WorksitesMasterData } from './WorksitesMasterData';
import { TeamTemplatesMasterData } from './TeamTemplatesMasterData';
import { Users, Truck, Building2, Database, Layers } from 'lucide-react';

interface MasterDataViewProps {
  employees: Employee[];
  worksites: Worksite[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  assignments: WorksiteAssignment[];
  teamTemplates: TeamTemplate[];
  absences?: Absence[];
  statusOptions: EmployeeStatusOption[];
  employmentTypeOptions: EmploymentTypeOption[];
  onAddStatusOption: (label: string) => EmployeeStatusOption;
  onAddEmploymentTypeOption: (label: string) => EmploymentTypeOption;
  onCreateEmployee: (employee: Omit<Employee, 'id'> | Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onCreateVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onCreateEquipment: (equipment: Equipment) => void;
  onUpdateEquipment: (equipment: Equipment) => void;
  onCreateWorksite: (worksite: Omit<Worksite, 'id'> | Worksite) => void;
  onUpdateWorksite: (worksite: Worksite) => void;
  onCreateTeamTemplate: (template: Omit<TeamTemplate, 'id'>) => void;
  onUpdateTeamTemplate: (template: TeamTemplate) => void;
  onDeleteTeamTemplate: (templateId: string) => void;
  onAddAssignment: (assignment: Omit<WorksiteAssignment, 'id'>) => void;
  onMarkCommentRead?: (worksiteId: string) => void;
  isDarkMode?: boolean;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  employees,
  worksites,
  vehicles,
  equipment,
  assignments,
  teamTemplates,
  absences = [],
  statusOptions,
  employmentTypeOptions,
  onAddStatusOption,
  onAddEmploymentTypeOption,
  onCreateEmployee,
  onUpdateEmployee,
  onCreateVehicle,
  onUpdateVehicle,
  onCreateEquipment,
  onUpdateEquipment,
  onCreateWorksite,
  onUpdateWorksite,
  onCreateTeamTemplate,
  onUpdateTeamTemplate,
  onDeleteTeamTemplate,
  onAddAssignment,
  onMarkCommentRead,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<
    'EMPLOYEES' | 'RESOURCES' | 'WORKSITES' | 'TEAM_TEMPLATES'
  >('EMPLOYEES');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto custom-scrollbar">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--wood-border)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--wood-text-primary)] flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[var(--wood-moss)]" />
            <span>Stammdatenverwaltung</span>
          </h1>
          <p className="text-xs text-[var(--wood-text-secondary)] mt-1">
            Zentrale Verwaltung von Mitarbeitern, Ressourcen, Baustellen & gespeicherten Kolonnen-Vorlagen
          </p>
        </div>

        {/* TAB NAVIGATION */}
        <nav className="flex flex-wrap items-center rounded-xl p-1 bg-[var(--wood-seam)] border border-[var(--wood-border)] shrink-0 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'EMPLOYEES'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] shadow-xs'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Users className="w-4 h-4 text-[var(--wood-info)]" />
            <span>Mitarbeiter ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RESOURCES')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'RESOURCES'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] shadow-xs'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Ressourcen ({vehicles.length + equipment.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('WORKSITES')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'WORKSITES'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] shadow-xs'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[var(--wood-moss)]" />
            <span>Baustellen ({worksites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TEAM_TEMPLATES')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'TEAM_TEMPLATES'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Team-Vorlagen ({teamTemplates.length})</span>
          </button>
        </nav>
      </div>

      {/* ACTIVE TAB CONTENT */}
      {activeTab === 'EMPLOYEES' && (
        <EmployeesMasterData
          employees={employees}
          assignments={assignments}
          statusOptions={statusOptions}
          employmentTypeOptions={employmentTypeOptions}
          onAddStatusOption={onAddStatusOption}
          onAddEmploymentTypeOption={onAddEmploymentTypeOption}
          onCreateEmployee={onCreateEmployee}
          onUpdateEmployee={onUpdateEmployee}
          isDarkMode={isDarkMode}
        />
      )}

      {activeTab === 'RESOURCES' && (
        <ResourcesMasterData
          vehicles={vehicles}
          equipment={equipment}
          onCreateVehicle={onCreateVehicle}
          onUpdateVehicle={onUpdateVehicle}
          onCreateEquipment={onCreateEquipment}
          onUpdateEquipment={onUpdateEquipment}
          isDarkMode={isDarkMode}
        />
      )}

      {activeTab === 'WORKSITES' && (
        <WorksitesMasterData
          worksites={worksites}
          onCreateWorksite={onCreateWorksite}
          onUpdateWorksite={onUpdateWorksite}
          onMarkCommentRead={onMarkCommentRead}
          isDarkMode={isDarkMode}
        />
      )}

      {activeTab === 'TEAM_TEMPLATES' && (
        <TeamTemplatesMasterData
          templates={teamTemplates}
          employees={employees}
          worksites={worksites}
          vehicles={vehicles}
          equipment={equipment}
          absences={absences}
          assignments={assignments}
          onCreateTemplate={onCreateTeamTemplate}
          onUpdateTemplate={onUpdateTeamTemplate}
          onDeleteTemplate={onDeleteTeamTemplate}
          onAddAssignment={onAddAssignment}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
