import React, { useState } from 'react';
import { Worksite, WorksiteColorKey } from '../../types';
import { X, MapPin, Building, Sparkles, Check, Tag, Info, ShieldCheck } from 'lucide-react';
import { WorksiteLocationPicker } from '../common/WorksiteLocationPicker';

interface NewWorksiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorksite: (worksite: Worksite) => void;
  isDarkMode?: boolean;
}

const COLOR_OPTIONS: { key: WorksiteColorKey; hex: string; label: string }[] = [
  { key: 'site-blue', hex: '#3B82F6', label: 'Blau' },
  { key: 'site-green', hex: '#10B981', label: 'Grün' },
  { key: 'site-orange', hex: '#F97316', label: 'Orange' },
  { key: 'site-violet', hex: '#8B5CF6', label: 'Violett' },
  { key: 'site-teal', hex: '#14B8A6', label: 'Türkis' },
  { key: 'site-red', hex: '#EF4444', label: 'Rot' },
  { key: 'site-yellow', hex: '#EAB308', label: 'Gelb' },
  { key: 'site-slate', hex: '#64748B', label: 'Grau' },
];

const AVAILABLE_SKILLS = [
  'SKT-A',
  'SKT-B',
  'ASBaum1',
  'ASBaum2',
  'Baumpfleger',
  'Maschinist',
  'Großsägenschein',
  'Pflanzung',
];

export const NewWorksiteModal: React.FC<NewWorksiteModalProps> = ({
  isOpen,
  onClose,
  onAddWorksite,
  isDarkMode = true,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('Potsdam');
  const [address, setAddress] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColorKey, setSelectedColorKey] = useState<WorksiteColorKey>('site-green');
  const [selectedHex, setSelectedHex] = useState('#10B981');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['ASBaum1']);

  // Map position (default to Potsdam / Berlin Brandenburg area)
  const [lat, setLat] = useState(52.4009);
  const [lng, setLng] = useState(13.0591);

  if (!isOpen) return null;

  // Auto-generate site code from name if code is empty or untouched
  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code.length <= 6) {
      const initials = val
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0]?.toUpperCase())
        .join('');
      const randomNum = Math.floor(Math.random() * 90 + 10);
      setCode(initials ? `BS-${initials}-${randomNum}` : `BS-${randomNum}`);
    }
  };

  const handleLocationSelect = (newLat: number, newLng: number, newAddr?: string, city?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (newAddr) {
      setAddress(newAddr);
    }
    if (city) {
      setLocation(city);
    }
  };

  const toggleSkill = (skill: string) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWorksite: Worksite = {
      id: `ws_${Date.now()}`,
      code: code.trim() || `BS-${Math.floor(Math.random() * 900 + 100)}`,
      name: name.trim(),
      location: location.trim() || 'Brandenburg',
      address: address.trim() || 'Adresse nicht definiert',
      meetingPoint: meetingPoint.trim() || 'Zufahrt Haupttor',
      colorKey: selectedColorKey,
      hexColor: selectedHex,
      description: description.trim() || 'Keine Zusatzangaben hinterlegt.',
      requiredSkills,
    };

    onAddWorksite(newWorksite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
          isDarkMode
            ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] text-[var(--wood-text-primary)] wood-grain-v'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDarkMode
              ? 'border-[var(--wood-border)] bg-[var(--wood-base)] wood-burnt-edge'
              : 'border-slate-100 bg-slate-50'
          }`}
          style={{ borderTop: `4px solid ${selectedHex}` }}
        >
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-lg text-white font-bold flex items-center justify-center"
              style={{ backgroundColor: selectedHex }}
            >
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Neue Baustelle anlegen</h2>
              <p className={`text-xs ${isDarkMode ? 'text-[var(--wood-text-muted)]' : 'text-slate-500'}`}>
                Ort per Adresse oder Karte festlegen und Stammdaten erfassen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-[var(--wood-raised)] text-[var(--wood-text-muted)] hover:text-white'
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
                  isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-[var(--wood-info)]" />
                <span>Name / Bezeichnung der Baustelle *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="z.B. Baumpflege Park Sanssouci, Kronensicherung Villa"
                required
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  isDarkMode
                    ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
                  isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-[var(--wood-resin)]" />
                <span>Kürzel / Code *</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="z.B. BS-SAN-01"
                required
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase border transition-colors ${
                  isDarkMode
                    ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Location / OpenStreetMap Search & Interactive Map */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 flex items-center justify-between ${
                isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--wood-moss)]" />
                <span>Ort & Position (OpenStreetMap / Geocoding)</span>
              </div>
              <span className="text-[10px] text-[var(--wood-text-muted)]">
                📍 Karte oder Adresse durchsuchen
              </span>
            </label>

            <WorksiteLocationPicker
              lat={lat}
              lng={lng}
              onLocationSelect={handleLocationSelect}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Address details & Meeting point */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
                }`}
              >
                Exakte Adresse
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Maulbeerallee 1, 14469 Potsdam"
                required
                className={`w-full px-3 py-2 rounded-lg text-xs border font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
                }`}
              >
                Stadt / Ortsteil
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Potsdam, Berlin-Mitte, etc."
                required
                className={`w-full px-3 py-2 rounded-lg text-xs border font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Meeting Point & Color Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
                }`}
              >
                Treffpunkt / Anfahrtshinweis
              </label>
              <input
                type="text"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="z.B. Parkplatz Nord, Haupteingang Zufahrt 2"
                className={`w-full px-3 py-2 rounded-lg text-xs border font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
                }`}
              >
                Farbkennzeichnung
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map((c) => {
                  const isSel = selectedColorKey === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setSelectedColorKey(c.key);
                        setSelectedHex(c.hex);
                      }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform flex items-center justify-center ${
                        isSel ? 'scale-110 ring-2 ring-white border-black' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {isSel && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
                isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--wood-moss)]" />
              <span>Benötigte Qualifikationen</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_SKILLS.map((sk) => {
                const isSelected = requiredSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-[var(--wood-moss)]/20 text-[var(--wood-moss)] border-[var(--wood-moss)]/50 font-bold'
                        : isDarkMode
                        ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-muted)] hover:text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
                isDarkMode ? 'text-[var(--wood-text-secondary)]' : 'text-slate-700'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-[var(--wood-ash)]" />
              <span>Beschreibung / Auftragsdetails</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Besondere Hinweise für das Team, Gerätewünsche, Totholzbeseitigung..."
              className={`w-full px-3 py-2 rounded-lg text-xs border font-medium transition-colors ${
                isDarkMode
                  ? 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Footer Actions */}
          <div
            className={`pt-4 flex items-center justify-end space-x-3 border-t ${
              isDarkMode ? 'border-[var(--wood-border)]' : 'border-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-[var(--wood-base)] border border-[var(--wood-border)] text-[var(--wood-text-secondary)] hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-[var(--wood-seam)] bg-[var(--wood-moss)] hover:brightness-110 rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Baustelle anlegen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
