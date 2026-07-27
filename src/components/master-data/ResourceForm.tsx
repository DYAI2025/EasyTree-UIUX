import React, { useState } from 'react';
import { Vehicle, Equipment } from '../../types';
import {
  Truck,
  Wrench,
  AlertCircle,
  Check,
  X,
  Calendar,
  ShieldAlert,
  Hash,
} from 'lucide-react';

export const VEHICLE_TYPES = ['Transporter', 'Unimog', 'LKW', 'Anhänger'];
export const EQUIPMENT_CATEGORIES = [
  'Hubarbeitsbühne',
  'Häcksler',
  'Großsäge',
  'Fräse',
  'Spezialgerät',
];

interface ResourceFormProps {
  initialVehicle?: Vehicle | null;
  initialEquipment?: Equipment | null;
  existingVehicles: Vehicle[];
  existingEquipment: Equipment[];
  onSubmitVehicle: (vehicle: Vehicle) => void;
  onSubmitEquipment: (equipment: Equipment) => void;
  onCancel: () => void;
  isDarkMode?: boolean;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  initialVehicle,
  initialEquipment,
  existingVehicles,
  existingEquipment,
  onSubmitVehicle,
  onSubmitEquipment,
  onCancel,
  isDarkMode = true,
}) => {
  const [resourceCategory, setResourceCategory] = useState<'VEHICLE' | 'EQUIPMENT'>(
    initialEquipment ? 'EQUIPMENT' : 'VEHICLE'
  );

  const isEditMode = Boolean(initialVehicle?.id || initialEquipment?.id);

  // Common Fields
  const [name, setName] = useState(
    initialVehicle?.name || initialEquipment?.name || ''
  );
  const [status, setStatus] = useState<'verfügbar' | 'reserviert' | 'wartung'>(
    initialVehicle?.status || initialEquipment?.status || 'verfügbar'
  );
  const [notes, setNotes] = useState(
    initialVehicle?.notes || initialEquipment?.notes || ''
  );
  const [requiresDriverLicense, setRequiresDriverLicense] = useState(
    initialVehicle?.requiresDriverLicense ?? initialEquipment?.requiresDriverLicense ?? false
  );
  const [requiredLicenseClass, setRequiredLicenseClass] = useState(
    initialVehicle?.requiredLicenseClass || initialEquipment?.requiredLicenseClass || 'Klasse B'
  );

  // Vehicle Specific
  const [vehicleType, setVehicleType] = useState<string>(
    initialVehicle?.type || 'Transporter'
  );
  const [licensePlate, setLicensePlate] = useState(
    initialVehicle?.licensePlate || ''
  );
  const [nextTuvDate, setNextTuvDate] = useState(
    initialVehicle?.nextTuvDate || ''
  );

  // Equipment Specific
  const [equipmentCategory, setEquipmentCategory] = useState<string>(
    initialEquipment?.category || 'Häcksler'
  );
  const [quantity, setQuantity] = useState<number>(
    initialEquipment?.quantity || 1
  );
  const [isExclusive, setIsExclusive] = useState(
    initialEquipment?.isExclusive ?? true
  );
  const [serialNumber, setSerialNumber] = useState(
    initialEquipment?.serialNumber || ''
  );
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState(
    initialEquipment?.lastMaintenanceDate || ''
  );
  const [maintenanceIntervalDays, setMaintenanceIntervalDays] = useState<number>(
    initialEquipment?.maintenanceIntervalDays || 30
  );

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) errs.name = 'Bezeichnung ist erforderlich.';

    if (resourceCategory === 'VEHICLE') {
      if (!licensePlate.trim()) {
        errs.licensePlate = 'Nummernschild ist erforderlich.';
      } else {
        // Unique check for license plate
        const isDuplicatePlate = existingVehicles.some(
          (v) =>
            v.licensePlate.toLowerCase().replace(/\s/g, '') ===
              licensePlate.trim().toLowerCase().replace(/\s/g, '') &&
            v.id !== initialVehicle?.id
        );
        if (isDuplicatePlate) {
          errs.licensePlate = `Das Kennzeichen "${licensePlate.trim()}" existiert bereits.`;
        }
      }
      if (!nextTuvDate) {
        errs.nextTuvDate = 'Nächstes TÜV-Datum eintragen.';
      }
    } else {
      if (quantity < 1 || isNaN(quantity)) {
        errs.quantity = 'Mindestens 1 Stück erforderlich.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (resourceCategory === 'VEHICLE') {
      const vehiclePayload: Vehicle = {
        id: initialVehicle?.id || `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        type: vehicleType as any,
        licensePlate: licensePlate.trim().toUpperCase(),
        nextTuvDate,
        status,
        quantity: 1,
        requiresDriverLicense,
        requiredLicenseClass: requiresDriverLicense ? requiredLicenseClass : undefined,
        notes: notes.trim(),
      };
      onSubmitVehicle(vehiclePayload);
    } else {
      const equipmentPayload: Equipment = {
        id: initialEquipment?.id || `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        category: equipmentCategory as any,
        quantity: Number(quantity),
        requiresDriverLicense,
        requiredLicenseClass: requiresDriverLicense ? requiredLicenseClass : undefined,
        isExclusive,
        status,
        serialNumber: serialNumber.trim() || undefined,
        lastMaintenanceDate: lastMaintenanceDate || undefined,
        maintenanceIntervalDays: maintenanceIntervalDays > 0 ? Number(maintenanceIntervalDays) : undefined,
        notes: notes.trim(),
      };
      onSubmitEquipment(equipmentPayload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--wood-border)]">
        <h3 className="text-lg font-bold text-[var(--wood-text-primary)] flex items-center gap-2">
          {resourceCategory === 'VEHICLE' ? (
            <Truck className="w-5 h-5 text-[var(--wood-info)]" />
          ) : (
            <Wrench className="w-5 h-5 text-amber-400" />
          )}
          <span>
            {isEditMode
              ? `${resourceCategory === 'VEHICLE' ? 'Fahrzeug' : 'Gerät'} bearbeiten: ${name}`
              : 'Neue Ressource anlegen'}
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

      {/* CATEGORY SWITCHER (If creating new) */}
      {!isEditMode && (
        <div className="flex items-center rounded-lg p-1 bg-[var(--wood-seam)] border border-[var(--wood-border)]">
          <button
            type="button"
            onClick={() => setResourceCategory('VEHICLE')}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-2 ${
              resourceCategory === 'VEHICLE'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] shadow-xs border border-[var(--wood-border)]'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Truck className="w-4 h-4 text-[var(--wood-info)]" />
            <span>Fahrzeug</span>
          </button>

          <button
            type="button"
            onClick={() => setResourceCategory('EQUIPMENT')}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-2 ${
              resourceCategory === 'EQUIPMENT'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] shadow-xs border border-[var(--wood-border)]'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Gerät / Maschine</span>
          </button>
        </div>
      )}

      {/* COMMON FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Bezeichnung / Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              resourceCategory === 'VEHICLE'
                ? 'z.B. Transporter Crafter 04'
                : 'z.B. Großhäcksler Jensen A540'
            }
            className={`w-full px-3 py-2 rounded-lg text-xs border font-medium ${
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

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
            Betriebsstatus
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-medium"
          >
            <option value="verfügbar">verfügbar</option>
            <option value="reserviert">reserviert</option>
            <option value="wartung">in Wartung / Werkstatt</option>
          </select>
        </div>
      </div>

      {/* VEHICLE SPECIFIC FIELDS */}
      {resourceCategory === 'VEHICLE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--wood-seam)]/40 border border-[var(--wood-border)]">
          <div>
            <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
              Fahrzeugtyp
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-medium"
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
              Kennzeichen *
            </label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="P-AG 404"
              className={`w-full px-3 py-2 rounded-lg text-xs border font-mono font-bold uppercase ${
                errors.licensePlate
                  ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                  : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
              }`}
            />
            {errors.licensePlate && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.licensePlate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Nächstes TÜV-Datum *
            </label>
            <input
              type="date"
              value={nextTuvDate}
              onChange={(e) => setNextTuvDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-xs border font-mono ${
                errors.nextTuvDate
                  ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                  : 'bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
              }`}
            />
            {errors.nextTuvDate && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.nextTuvDate}
              </p>
            )}
          </div>
        </div>
      )}

      {/* EQUIPMENT SPECIFIC FIELDS */}
      {resourceCategory === 'EQUIPMENT' && (
        <div className="space-y-4 p-4 rounded-xl bg-[var(--wood-seam)]/40 border border-[var(--wood-border)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
                Kategorie
              </label>
              <select
                value={equipmentCategory}
                onChange={(e) => setEquipmentCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-medium"
              >
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[var(--wood-info)]" />
                Anzahl im Betrieb *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-mono font-bold"
              />
              {errors.quantity && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
                Seriennummer / Inventarnr.
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="z.B. JEN-9921"
                className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-mono"
              />
            </div>
          </div>

          {/* Maintenance Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--wood-border)]/50">
            <div>
              <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Letzte Wartung durchgeführt am
              </label>
              <input
                type="date"
                value={lastMaintenanceDate}
                onChange={(e) => setLastMaintenanceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
                Wartungsintervall (in Tagen)
              </label>
              <select
                value={maintenanceIntervalDays}
                onChange={(e) => setMaintenanceIntervalDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-medium"
              >
                <option value={14}>14 Tage (alle 2 Wochen)</option>
                <option value={30}>30 Tage (monatlich)</option>
                <option value={90}>90 Tage (quartalsweise)</option>
                <option value={180}>180 Tage (halbjährlich)</option>
                <option value={365}>365 Tage (jährlich)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[var(--wood-seam)] border border-[var(--wood-border)]">
              <input
                type="checkbox"
                checked={isExclusive}
                onChange={(e) => setIsExclusive(e.target.checked)}
                className="rounded border-[var(--wood-border)] text-[var(--wood-moss)] focus:ring-[var(--wood-moss)] w-4 h-4"
              />
              <span className="text-xs font-bold text-[var(--wood-text-primary)]">
                Exklusiv nutzbar (kann pro Tag nur 1 Baustelle zugewiesen werden)
              </span>
            </label>
          </div>
        </div>
      )}

      {/* DRIVER LICENSE REQUIREMENTS */}
      <div className="p-4 rounded-xl bg-[var(--wood-seam)]/40 border border-[var(--wood-border)] space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={requiresDriverLicense}
            onChange={(e) => setRequiresDriverLicense(e.target.checked)}
            className="rounded border-[var(--wood-border)] text-[var(--wood-moss)] focus:ring-[var(--wood-moss)] w-4 h-4"
          />
          <span className="text-xs font-bold text-[var(--wood-text-primary)] flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Setzt Führerschein / Berechtigung voraus</span>
          </span>
        </label>

        {requiresDriverLicense && (
          <div>
            <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
              Erforderliche Führerscheinklasse / Berechtigung
            </label>
            <input
              type="text"
              value={requiredLicenseClass}
              onChange={(e) => setRequiredLicenseClass(e.target.value)}
              placeholder="z.B. LKW CE, LKW C1, Klasse BE..."
              className="w-full px-3 py-2 rounded-lg text-xs border bg-[var(--wood-seam)] border-[var(--wood-border)] text-[var(--wood-text-primary)] font-bold"
            />
          </div>
        )}
      </div>

      {/* NOTES */}
      <div>
        <label className="block text-xs font-semibold text-[var(--wood-text-secondary)] mb-1">
          Notizen & Anmerkungen
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Besondere Ausstattung, Stellplatz..."
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
          <span>Speichern</span>
        </button>
      </div>
    </form>
  );
};
