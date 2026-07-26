import React, { useState } from 'react';
import { Worksite, Employee, Vehicle, Equipment, WorksiteAssignment } from '../../types';
import { X, Plus, Calendar, Clock, MapPin, User, Truck, Wrench, Sparkles, Building } from 'lucide-react';
import { NewWorksiteModal } from './NewWorksiteModal';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string; // YYYY-MM-DD
  worksites: Worksite[];
  employees: Employee[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  onAddAssignment: (assignment: Omit<WorksiteAssignment, 'id'>) => void;
  onAddWorksite?: (worksite: Worksite) => void;
  isDarkMode?: boolean;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  worksites,
  employees,
  vehicles,
  equipment,
  onAddAssignment,
  onAddWorksite,
  isDarkMode = true,
}) => {
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [worksiteId, setWorksiteId] = useState(worksites[0]?.id || '');
  const [activityName, setActivityName] = useState('Baumpflege & Totholzbeseitigung');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('15:30');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
    employees.slice(0, 2).map((e) => e.id)
  );
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [isNewWorksiteModalOpen, setIsNewWorksiteModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleAddNewWorksite = (newWs: Worksite) => {
    if (onAddWorksite) {
      onAddWorksite(newWs);
    }
    setWorksiteId(newWs.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worksiteId) return;

    onAddAssignment({
      worksiteId,
      date,
      startTime,
      endTime,
      activityName,
      assignedEmployeeIds: selectedEmployeeIds,
      assignedVehicleIds: selectedVehicleIds,
      assignedEquipmentIds: selectedEquipmentIds,
      status: 'draft', // Draft status as requested
    });

    onClose();
  };

  const selectedWorksite = worksites.find((w) => w.id === worksiteId);

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

  const presetActivities = [
    'Kronenpflege',
    'Gefahrenfällung',
    'Baumpflege',
    'Wurzelbehandlung',
    'Lichtraumprofil',
    'Pflanzung',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
          isDarkMode
            ? 'bg-[#171717] border-[#292A2E] text-[#F2F4F5]'
            : 'bg-white border-[#97B89A] text-[#3B4A3B]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDarkMode ? 'border-[#292A2E] bg-[#0C0C0C]' : 'border-[#97B89A] bg-[#CDE7CC]'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#3B4A3B]/10 text-[#3B4A3B]'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Einsatz Schnell-Erfassen</h2>
              <p className={`text-xs ${isDarkMode ? 'text-[#858B90]' : 'text-[#6E8B6E]'}`}>
                Wird direkt als unbestätigter Entwurf angelegt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-[#202124] text-[#858B90] hover:text-white'
                : 'hover:bg-[#E9F4EA] text-[#6E8B6E] hover:text-[#3B4A3B]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Datum</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full px-3 py-2 rounded-lg text-sm border font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                  isDarkMode
                    ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Uhrzeit</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-lg text-xs border font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                    isDarkMode
                      ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <span className={`text-xs ${isDarkMode ? 'text-[#858B90]' : 'text-slate-400'}`}>–</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-lg text-xs border font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                    isDarkMode
                      ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Worksite Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className={`text-xs font-semibold flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Baustelle / Ort</span>
              </label>

              <button
                type="button"
                onClick={() => setIsNewWorksiteModalOpen(true)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center space-x-1 ${
                  isDarkMode
                    ? 'bg-[var(--wood-moss)]/20 border-[var(--wood-moss)]/40 text-[var(--wood-moss)] hover:bg-[var(--wood-moss)]/30'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                }`}
                title="Eine völlig neue Baustelle mit Adresse und Karten-Pinpoint anlegen"
              >
                <Building className="w-3.5 h-3.5" />
                <span>+ Neue Baustelle anlegen</span>
              </button>
            </div>

            <select
              value={worksiteId}
              onChange={(e) => setWorksiteId(e.target.value)}
              required
              className={`w-full px-3 py-2 rounded-lg text-sm border font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {worksites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.location} — {w.name} ({w.code})
                </option>
              ))}
            </select>
            {selectedWorksite && (
              <p className={`text-[11px] mt-1 italic ${isDarkMode ? 'text-[#858B90]' : 'text-slate-500'}`}>
                📍 {selectedWorksite.address}
              </p>
            )}
          </div>

          {/* Activity Input & Presets */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
              }`}
            >
              Tätigkeit / Beschreibung
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="z. B. Kronenpflege Totholz"
              required
              className={`w-full px-3 py-2 rounded-lg text-sm border font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                isDarkMode
                  ? 'bg-[#0C0C0C] border-[#292A2E] text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetActivities.map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setActivityName(act)}
                  className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                    isDarkMode
                      ? 'bg-[#202124] hover:bg-[#292A2E] text-[#BBC2C7]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  + {act}
                </button>
              ))}
            </div>
          </div>

          {/* Employee Selection */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Mitarbeiter zuweisen ({selectedEmployeeIds.length} ausgewählt)</span>
            </label>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg border ${
                isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {employees.map((emp) => {
                const isSelected = selectedEmployeeIds.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleEmployee(emp.id)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between border transition-all ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                        : isDarkMode
                        ? 'bg-[#171717] border-[#202124] text-[#BBC2C7] hover:border-[#292A2E]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>
                      {emp.firstName} {emp.lastName[0]}.
                    </span>
                    <span className="text-[10px] font-mono opacity-70">{emp.initials}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicles & Equipment (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-violet-400" />
                <span>Fahrzeug (optional)</span>
              </label>
              <div
                className={`space-y-1 max-h-24 overflow-y-auto p-2 rounded-lg border ${
                  isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {vehicles.map((v) => {
                  const isSel = selectedVehicleIds.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVehicle(v.id)}
                      className={`w-full text-left px-2 py-1 rounded text-xs truncate border transition-colors ${
                        isSel
                          ? 'bg-violet-500/20 border-violet-500 text-violet-300 font-medium'
                          : isDarkMode
                          ? 'bg-[#171717] border-[#202124] text-[#858B90]'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {v.name} ({v.licensePlate})
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-[#BBC2C7]' : 'text-slate-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Gerät (optional)</span>
              </label>
              <div
                className={`space-y-1 max-h-24 overflow-y-auto p-2 rounded-lg border ${
                  isDarkMode ? 'bg-[#0C0C0C] border-[#292A2E]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {equipment.map((eq) => {
                  const isSel = selectedEquipmentIds.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggleEquipment(eq.id)}
                      className={`w-full text-left px-2 py-1 rounded text-xs truncate border transition-colors ${
                        isSel
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-medium'
                          : isDarkMode
                          ? 'bg-[#171717] border-[#202124] text-[#858B90]'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {eq.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div
            className={`pt-4 flex items-center justify-end space-x-3 border-t ${
              isDarkMode ? 'border-[#292A2E]' : 'border-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-[#202124] hover:bg-[#292A2E] text-[#BBC2C7]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Als Entwurf anlegen</span>
            </button>
          </div>
        </form>
      </div>

      {/* Render New Worksite Modal if triggered */}
      {isNewWorksiteModalOpen && (
        <NewWorksiteModal
          isOpen={isNewWorksiteModalOpen}
          onClose={() => setIsNewWorksiteModalOpen(false)}
          onAddWorksite={handleAddNewWorksite}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
