import React, { useState } from 'react';
import {
  TeamTemplate,
  Employee,
  Worksite,
  Vehicle,
  Equipment,
  WorksiteAssignment,
  Absence,
} from '../../types';
import {
  Users,
  Truck,
  Wrench,
  Search,
  Plus,
  Zap,
  Edit2,
  Trash2,
  Copy,
  Crown,
  Tag,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Check,
  Shield,
  Award,
} from 'lucide-react';
import { TeamTemplateModal } from './TeamTemplateModal';
import { OneClickAssignModal } from './OneClickAssignModal';

interface TeamTemplatesMasterDataProps {
  templates: TeamTemplate[];
  employees: Employee[];
  worksites: Worksite[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  absences?: Absence[];
  assignments?: WorksiteAssignment[];
  onCreateTemplate: (template: Omit<TeamTemplate, 'id'>) => void;
  onUpdateTemplate: (template: TeamTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onAddAssignment: (assignment: Omit<WorksiteAssignment, 'id'>) => void;
  isDarkMode?: boolean;
}

export const TeamTemplatesMasterData: React.FC<TeamTemplatesMasterDataProps> = ({
  templates,
  employees,
  worksites,
  vehicles,
  equipment,
  absences = [],
  assignments = [],
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onAddAssignment,
  isDarkMode = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modal States
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TeamTemplate | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState<TeamTemplate | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(templates.flatMap((t) => t.tags || []))
  );

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = selectedTag ? t.tags?.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsEditorModalOpen(true);
  };

  const handleOpenEdit = (template: TeamTemplate) => {
    setEditingTemplate(template);
    setIsEditorModalOpen(true);
  };

  const handleOpenAssign = (template: TeamTemplate) => {
    setAssigningTemplate(template);
    setIsAssignModalOpen(true);
  };

  const handleDuplicate = (template: TeamTemplate) => {
    const cloned = {
      ...template,
      name: `${template.name} (Kopie)`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    delete (cloned as any).id;
    onCreateTemplate(cloned);
  };

  const handleSaveTemplate = (templateData: any) => {
    if (templateData.id) {
      onUpdateTemplate(templateData);
    } else {
      onCreateTemplate(templateData);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-[var(--wood-text-primary)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Gespeicherte Team-Vorlagen & Kolonnen</span>
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {templates.length} Vorlagen
            </span>
          </div>
          <p className="text-xs text-[var(--wood-text-secondary)] mt-0.5">
            Definiere feste Kolonnen aus Mitarbeitern, Fahrzeugen & Maschinen für 1-Klick Zuweisungen
          </p>
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Neue Team-Vorlage anlegen</span>
        </button>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--wood-text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Vorlage oder Tag suchen..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border font-medium transition-colors ${
              isDarkMode
                ? 'bg-[#0C0C0C] border-[#292A2E] text-white placeholder:text-[#858B90]'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* TAG FILTER PILLS */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedTag === null
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : isDarkMode
                  ? 'bg-[#171717] text-[#858B90] border border-[#202124] hover:text-white'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              Alle Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center space-x-1 ${
                  selectedTag === tag
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isDarkMode
                    ? 'bg-[#171717] text-[#858B90] border-[#202124] hover:text-white'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Tag className="w-3 h-3 text-emerald-400" />
                <span>#{tag}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TEMPLATES GRID */}
      {filteredTemplates.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDarkMode ? 'bg-[#171717] border-[#292A2E]' : 'bg-white border-slate-200'
          }`}
        >
          <Layers className="w-12 h-12 text-emerald-400 mx-auto opacity-40 mb-3" />
          <h3 className="text-base font-bold text-[var(--wood-text-primary)]">
            Keine Team-Vorlagen gefunden
          </h3>
          <p className="text-xs text-[var(--wood-text-secondary)] mt-1 max-w-md mx-auto">
            {searchTerm || selectedTag
              ? 'Keine Ergebnisse für deinen Suchfilter. Versuche deine Eingabe anzupassen.'
              : 'Erstelle wiederverwendbare Team-Vorlagen für Deine Kolonnen, um Baustellen mit 1 Klick zu besetzen.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Erste Team-Vorlage erstellen</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const leader = employees.find((e) => e.id === template.leaderEmployeeId);
            const teamEmployees = employees.filter((e) => template.employeeIds.includes(e.id));
            const teamVehicles = vehicles.filter((v) => template.vehicleIds.includes(v.id));
            const teamEquipment = equipment.filter((eq) => template.equipmentIds.includes(eq.id));

            return (
              <div
                key={template.id}
                className={`rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-xl ${
                  isDarkMode
                    ? 'bg-[#171717] border-[#292A2E] hover:border-emerald-500/40'
                    : 'bg-white border-slate-200 hover:border-emerald-500/50'
                }`}
              >
                {/* TOP ACCENT BAR */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: template.color || '#10B981' }}
                />

                <div className="p-5 space-y-4 flex-1">
                  {/* CARD TITLE & TAGS */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: template.color || '#10B981' }}
                        />
                        <h3 className="font-bold text-sm text-[var(--wood-text-primary)] leading-snug">
                          {template.name}
                        </h3>
                      </div>
                      {template.description && (
                        <p className="text-xs text-[var(--wood-text-muted)] mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>

                    {/* ACTIONS DROPDOWN/ICONS */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleDuplicate(template)}
                        title="Vorlage duplizieren"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-[#202124] text-[#858B90] hover:text-white'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(template)}
                        title="Vorlage bearbeiten"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-[#202124] text-[#858B90] hover:text-white'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === template.id ? (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onDeleteTemplate(template.id)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-600 text-white"
                          >
                            Ja
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-600 text-white"
                          >
                            Nein
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(template.id)}
                          title="Vorlage löschen"
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-rose-500/20 text-[#858B90] hover:text-rose-400'
                              : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TAGS */}
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* TEAM LEADER HIGHLIGHT */}
                  {leader && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center space-x-2 text-xs">
                      <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-300">
                          {leader.firstName} {leader.lastName}
                        </span>
                        <span className="text-[10px] text-[var(--wood-text-muted)] block">
                          Teamleiter · {leader.role}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ASSIGNED EMPLOYEES LIST */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--wood-text-secondary)]">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>Personal ({teamEmployees.length})</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {teamEmployees.map((emp) => (
                        <span
                          key={emp.id}
                          className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 ${
                            emp.id === template.leaderEmployeeId
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                              : isDarkMode
                              ? 'bg-[#0C0C0C] border-[#292A2E] text-[#F2F4F5]'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-bold">{emp.firstName} {emp.lastName[0]}.</span>
                          <span className="text-[10px] font-mono opacity-60">({emp.initials})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* VEHICLES & EQUIPMENT SUMMARY */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {/* VEHICLES */}
                    <div
                      className={`p-2 rounded-xl border space-y-1 ${
                        isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1 text-[11px] font-bold text-violet-400">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Fahrzeuge ({teamVehicles.length})</span>
                      </div>
                      {teamVehicles.length === 0 ? (
                        <p className="text-[10px] text-[var(--wood-text-muted)] italic">Keine</p>
                      ) : (
                        <ul className="text-[10px] space-y-0.5 truncate text-[var(--wood-text-secondary)]">
                          {teamVehicles.map((v) => (
                            <li key={v.id} className="truncate">
                              • {v.name} ({v.licensePlate})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* EQUIPMENT */}
                    <div
                      className={`p-2 rounded-xl border space-y-1 ${
                        isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-400">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Geräte ({teamEquipment.length})</span>
                      </div>
                      {teamEquipment.length === 0 ? (
                        <p className="text-[10px] text-[var(--wood-text-muted)] italic">Keine</p>
                      ) : (
                        <ul className="text-[10px] space-y-0.5 truncate text-[var(--wood-text-secondary)]">
                          {teamEquipment.map((eq) => (
                            <li key={eq.id} className="truncate">
                              • {eq.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER WITH ONE-CLICK BULK ASSIGN BUTTON */}
                <div
                  className={`px-5 py-3 border-t flex items-center justify-between ${
                    isDarkMode ? 'border-[#292A2E] bg-[#0C0C0C]' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-mono text-[var(--wood-text-muted)]">
                    Erstellt: {template.createdAt || 'Standard'}
                  </span>

                  <button
                    onClick={() => handleOpenAssign(template)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5"
                    title="Trage dieses komplette Team auf eine Baustelle ein"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>1-Klick Zuweisung</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FOR CREATING / EDITING TEAM TEMPLATE */}
      {isEditorModalOpen && (
        <TeamTemplateModal
          isOpen={isEditorModalOpen}
          onClose={() => setIsEditorModalOpen(false)}
          onSave={handleSaveTemplate}
          initialTemplate={editingTemplate}
          employees={employees}
          vehicles={vehicles}
          equipment={equipment}
          isDarkMode={isDarkMode}
        />
      )}

      {/* MODAL FOR ONE-CLICK ASSIGNMENT TO A WORKSITE */}
      {isAssignModalOpen && (
        <OneClickAssignModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          template={assigningTemplate}
          worksites={worksites}
          employees={employees}
          vehicles={vehicles}
          equipment={equipment}
          absences={absences}
          assignments={assignments}
          onAddAssignment={onAddAssignment}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
