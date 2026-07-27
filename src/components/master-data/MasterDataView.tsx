import React, { useState } from 'react';
import {
  Employee,
  Worksite,
  Vehicle,
  Equipment,
  WorksiteAssignment,
  EmployeeStatusOption,
  EmploymentTypeOption,
} from '../../types';
import { EmployeesMasterData } from './EmployeesMasterData';
import { ResourcesMasterData } from './ResourcesMasterData';
import { WorksitesMasterData } from './WorksitesMasterData';
import { Users, Truck, Building2, Database } from 'lucide-react';

interface MasterDataViewProps {
  employees: Employee[];
  worksites: Worksite[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  assignments: WorksiteAssignment[];
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
  onMarkCommentRead?: (worksiteId: string) => void;
  isDarkMode?: boolean;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  employees,
  worksites,
  vehicles,
  equipment,
  assignments,
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
  onMarkCommentRead,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'RESOURCES' | 'WORKSITES'>('EMPLOYEES');

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
            Zentrale Verwaltung von Mitarbeitern, Fahrzeugen, Geräten und Baustellenaufträgen
          </p>
        </div>

        {/* TAB NAVIGATION */}
        <nav className="flex items-center rounded-xl p-1 bg-[var(--wood-seam)] border border-[var(--wood-border)] shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'EMPLOYEES'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] shadow-sm'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Users className="w-4 h-4 text-[var(--wood-info)]" />
            <span>Mitarbeiter ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RESOURCES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'RESOURCES'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] shadow-sm'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Ressourcen ({vehicles.length + equipment.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('WORKSITES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'WORKSITES'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] shadow-sm'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[var(--wood-moss)]" />
            <span>Baustellen ({worksites.length})</span>
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
    </div>
  );
};
