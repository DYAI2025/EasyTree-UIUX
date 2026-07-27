import React, { useState } from 'react';
import { TeamTemplate, Employee, Vehicle, Equipment } from '../../types';
import {
  X,
  Users,
  Truck,
  Wrench,
  Tag,
  Sparkles,
  Check,
  UserCheck,
  Search,
  Crown,
  Layers,
} from 'lucide-react';

interface TeamTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: Omit<TeamTemplate, 'id'> | TeamTemplate) => void;
  initialTemplate?: TeamTemplate | null;
  employees: Employee[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  isDarkMode?: boolean;
}

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

export const TeamTemplateModal: React.FC<TeamTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTemplate,
  employees,
  vehicles,
  equipment,
  isDarkMode = true,
}) => {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [defaultActivityName, setDefaultActivityName] = useState(
    initialTemplate?.defaultActivityName || ''
  );
  const [color, setColor] = useState(initialTemplate?.color || '#10B981');
  const [leaderEmployeeId, setLeaderEmployeeId] = useState(
    initialTemplate?.leaderEmployeeId || ''
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
    initialTemplate?.employeeIds || []
  );
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(
    initialTemplate?.vehicleIds || []
  );
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    initialTemplate?.equipmentIds || []
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialTemplate?.tags || []);
  const [empSearch, setEmpSearch] = useState('');

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const toggleVehicle = (vId: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vId) ? prev.filter((id) => id !== vId) : [...prev, vId]
    );
  };

  const toggleEquipment = (eqId: string) => {
    setSelectedEquipmentIds((prev) =>
      prev.includes(eqId) ? prev.filter((id) => id !== eqId) : [...prev, eqId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Make sure leader is included in employeeIds if selected
    let finalEmpIds = [...selectedEmployeeIds];
    if (leaderEmployeeId && !finalEmpIds.includes(leaderEmployeeId)) {
      finalEmpIds.unshift(leaderEmployeeId);
    }

    const templateData = {
      ...(initialTemplate ? { id: initialTemplate.id } : {}),
      name: name.trim(),
      description: description.trim(),
      defaultActivityName: defaultActivityName.trim() || undefined,
      leaderEmployeeId: leaderEmployeeId || undefined,
      employeeIds: finalEmpIds,
      vehicleIds: selectedVehicleIds,
      equipmentIds: selectedEquipmentIds,
      color,
      tags,
      createdAt: initialTemplate?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(templateData as any);
    onClose();
  };

  const filteredEmployees = employees.filter((e) => {
    const full = `${e.firstName} ${e.lastName} ${e.role} ${e.skills.join(' ')}`.toLowerCase();
    return full.includes(empSearch.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDarkMode
            ? 'bg-[#171717] border-[#292A2E] text-[#F2F4F5]'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* MODAL HEADER */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDarkMode ? 'border-[#292A2E] bg-[#0C0C0C]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-bold"
              style={{ backgroundColor: color }}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {initialTemplate ? 'Team-Vorlage bearbeiten' : 'Neue Team-Vorlage anlegen'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-[#858B90]' : 'text-slate-500'}`}>
                Speichere feste Kombinationen aus Personal, Fahrzeugen & Maschinen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-[#202124] text-[#858B90] hover:text-white'
                : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* NAME, ACTIVITY & COLOR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold">Name der Vorlage / Kolonne *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Kolonne Alpha (SKT & Großhäcksler)"
                required
                className={`w-full px-3 py-2 rounded-lg text-sm border font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                  isDarkMode
                    ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">Kennarbeitsfarbe</label>
              <div className="flex items-center space-x-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* DESCRIPTION & DEFAULT ACTIVITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">Beschreibung (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Einsatzzweck, z. B. Spezialteam für Seilklettertechnik und Fällarbeiten"
                rows={2}
                className={`w-full px-3 py-2 rounded-lg text-xs border font-normal focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                  isDarkMode
                    ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">Standard-Tätigkeit (optional)</label>
              <input
                type="text"
                value={defaultActivityName}
                onChange={(e) => setDefaultActivityName(e.target.value)}
                placeholder="z. B. Kronenpflege & Totholz"
                className={`w-full px-3 py-2 rounded-lg text-xs border font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                  isDarkMode
                    ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />

              {/* TAGS INPUT */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-[var(--wood-text-muted)] mb-1">
                  Tags / Schlagwörter
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Tag hinzufügen & Eingabe..."
                    className={`flex-1 px-2.5 py-1 text-xs rounded-md border ${
                      isDarkMode
                        ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                        : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                    >
                      <span>#{t}</span>
                      <button type="button" onClick={() => handleRemoveTag(t)}>
                        <X className="w-2.5 h-2.5 hover:text-rose-400" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TEAM LEADER SELECTION */}
          <div className="p-3.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-2">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Teamleiter der Vorlage festlegen
              </label>
            </div>

            <select
              value={leaderEmployeeId}
              onChange={(e) => {
                const id = e.target.value;
                setLeaderEmployeeId(id);
                if (id && !selectedEmployeeIds.includes(id)) {
                  setSelectedEmployeeIds((prev) => [...prev, id]);
                }
              }}
              className={`w-full px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="">-- Kein fester Teamleiter bestimmt --</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.role}) {e.isLeader ? '⭐ Zertifizierter Leiter' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* EMPLOYEES SELECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Mitarbeiter zuweisen ({selectedEmployeeIds.length} gewählt)</span>
              </label>

              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  placeholder="Suchen..."
                  className={`w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 rounded-xl border custom-scrollbar ${
                isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployeeIds.includes(emp.id);
                const isLeader = emp.id === leaderEmployeeId;

                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleEmployee(emp.id)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                        : isDarkMode
                        ? 'bg-[#171717] border-[#202124] text-[#BBC2C7] hover:border-[#292A2E]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-500'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1 text-xs font-bold">
                          <span>
                            {emp.firstName} {emp.lastName}
                          </span>
                          {isLeader && <Crown className="w-3 h-3 text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-[var(--wood-text-muted)] truncate">
                          {emp.role} {emp.skills.length > 0 ? `· ${emp.skills.slice(0, 2).join(', ')}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono opacity-60 shrink-0">{emp.initials}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VEHICLES & EQUIPMENT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* VEHICLES */}
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-violet-400" />
                <span>Fahrzeuge zuweisen ({selectedVehicleIds.length})</span>
              </label>

              <div
                className={`space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-xl border custom-scrollbar ${
                  isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {vehicles.map((v) => {
                  const isSel = selectedVehicleIds.includes(v.id);
                  return (
                    <div
                      key={v.id}
                      onClick={() => toggleVehicle(v.id)}
                      className={`p-2 rounded-lg border cursor-pointer text-xs flex items-center justify-between transition-colors ${
                        isSel
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 font-semibold'
                          : isDarkMode
                          ? 'bg-[#171717] border-[#202124] text-[#858B90]'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            isSel ? 'bg-violet-500 border-violet-400 text-black' : 'border-slate-500'
                          }`}
                        >
                          {isSel && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{v.name}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80 shrink-0">{v.licensePlate}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EQUIPMENT */}
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center space-x-1.5">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Geräte & Maschinen ({selectedEquipmentIds.length})</span>
              </label>

              <div
                className={`space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-xl border custom-scrollbar ${
                  isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {equipment.map((eq) => {
                  const isSel = selectedEquipmentIds.includes(eq.id);
                  return (
                    <div
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={`p-2 rounded-lg border cursor-pointer text-xs flex items-center justify-between transition-colors ${
                        isSel
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                          : isDarkMode
                          ? 'bg-[#171717] border-[#202124] text-[#858B90]'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            isSel ? 'bg-amber-500 border-amber-400 text-black' : 'border-slate-500'
                          }`}
                        >
                          {isSel && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{eq.name}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80 shrink-0">{eq.category}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-4 border-t border-[var(--wood-border)] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-lg ${
                isDarkMode
                  ? 'bg-[#202124] text-[#BBC2C7] hover:bg-[#292A2E]'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Abbrechen
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{initialTemplate ? 'Änderungen speichern' : 'Vorlage erstellen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
