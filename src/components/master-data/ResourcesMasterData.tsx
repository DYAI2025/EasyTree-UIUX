import React, { useState } from 'react';
import { Vehicle, Equipment } from '../../types';
import { ResourceForm } from './ResourceForm';
import {
  getTuvStatus,
  getMaintenanceStatus,
  calculateNextMaintenanceDate,
  daysSinceDate,
} from '../../domain/resourceMaintenanceEngine';
import {
  Truck,
  Wrench,
  Search,
  Plus,
  Edit2,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Hash,
} from 'lucide-react';

interface ResourcesMasterDataProps {
  vehicles: Vehicle[];
  equipment: Equipment[];
  onCreateVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onCreateEquipment: (equipment: Equipment) => void;
  onUpdateEquipment: (equipment: Equipment) => void;
  isDarkMode?: boolean;
}

export const ResourcesMasterData: React.FC<ResourcesMasterDataProps> = ({
  vehicles,
  equipment,
  onCreateVehicle,
  onUpdateVehicle,
  onCreateEquipment,
  onUpdateEquipment,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'VEHICLES' | 'EQUIPMENT'>('VEHICLES');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      v.name.toLowerCase().includes(term) ||
      v.licensePlate.toLowerCase().includes(term) ||
      v.type.toLowerCase().includes(term) ||
      (v.notes && v.notes.toLowerCase().includes(term))
    );
  });

  const filteredEquipment = equipment.filter((eq) => {
    const term = searchTerm.toLowerCase();
    return (
      eq.name.toLowerCase().includes(term) ||
      eq.category.toLowerCase().includes(term) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(term))
    );
  });

  const handleVehicleSubmit = (vehicle: Vehicle) => {
    if (vehicles.some((v) => v.id === vehicle.id)) {
      onUpdateVehicle(vehicle);
    } else {
      onCreateVehicle(vehicle);
    }
    setEditingVehicle(null);
    setIsCreating(false);
  };

  const handleEquipmentSubmit = (eq: Equipment) => {
    if (equipment.some((e) => e.id === eq.id)) {
      onUpdateEquipment(eq);
    } else {
      onCreateEquipment(eq);
    }
    setEditingEquipment(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* MODAL FOR CREATE / EDIT */}
      {(isCreating || editingVehicle || editingEquipment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[var(--wood-panel)] border border-[var(--wood-border)] rounded-2xl p-6 shadow-2xl my-8 overflow-y-auto max-h-[90vh] custom-scrollbar wood-grain-v">
            <ResourceForm
              initialVehicle={editingVehicle}
              initialEquipment={editingEquipment}
              existingVehicles={vehicles}
              existingEquipment={equipment}
              onSubmitVehicle={handleVehicleSubmit}
              onSubmitEquipment={handleEquipmentSubmit}
              onCancel={() => {
                setIsCreating(false);
                setEditingVehicle(null);
                setEditingEquipment(null);
              }}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* TOP TAB TOGGLE & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--wood-seam)]/60 p-4 rounded-xl border border-[var(--wood-border)]">
        {/* TAB TOGGLE */}
        <div className="flex items-center rounded-lg p-0.5 bg-[var(--wood-base)] border border-[var(--wood-border)] shrink-0">
          <button
            onClick={() => setActiveTab('VEHICLES')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'VEHICLES'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] shadow-xs'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[var(--wood-info)]" />
            <span>Fahrzeuge ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EQUIPMENT')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'EQUIPMENT'
                ? 'bg-[var(--wood-raised)] text-[var(--wood-text-primary)] border border-[var(--wood-border)] shadow-xs'
                : 'text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Geräte & Maschinen ({equipment.length})</span>
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--wood-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'VEHICLES'
                ? 'Fahrzeug suchen (Name, Kennzeichen, Typ)...'
                : 'Gerät suchen (Name, Kategorie, Seriennr.)...'
            }
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-[var(--wood-base)] border border-[var(--wood-border)] text-[var(--wood-text-primary)] focus:border-[var(--wood-info)]"
          />
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-[var(--wood-moss)] hover:brightness-110 text-[var(--wood-seam)] font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ressource hinzufügen</span>
        </button>
      </div>

      {/* VEHICLES VIEW */}
      {activeTab === 'VEHICLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[var(--wood-text-muted)] bg-[var(--wood-seam)]/30 rounded-xl border border-[var(--wood-border)]">
              <Truck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Keine Fahrzeuge gefunden.</p>
            </div>
          ) : (
            filteredVehicles.map((veh) => {
              const tuvStatus = getTuvStatus(veh.nextTuvDate);

              return (
                <div
                  key={veh.id}
                  className="wood-raised-card p-4 space-y-3 flex flex-col justify-between hover:border-[var(--wood-edge)] transition group"
                >
                  <div className="space-y-3">
                    {/* VEHICLE TITLE & LICENSE PLATE */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--wood-text-muted)]">
                          {veh.type}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--wood-text-primary)] group-hover:text-[var(--wood-ash)] transition">
                          {veh.name}
                        </h4>
                        <span className="inline-block font-mono text-xs font-bold px-2 py-0.5 mt-1 rounded bg-[var(--wood-seam)] text-[var(--wood-text-primary)] border border-[var(--wood-border)]">
                          {veh.licensePlate}
                        </span>
                      </div>

                      <button
                        onClick={() => setEditingVehicle(veh)}
                        className="p-1.5 text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] hover:bg-[var(--wood-seam)] rounded-lg transition shrink-0"
                        title="Fahrzeug bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* TÜV WARNING BADGE */}
                    <div className="pt-2 border-t border-[var(--wood-border)]/50">
                      {tuvStatus === 'OVERDUE' && (
                        <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <div>
                            <div>TÜV ABGELAUFEN!</div>
                            <div className="text-[10px] opacity-80 font-mono">Fällig: {veh.nextTuvDate}</div>
                          </div>
                        </div>
                      )}

                      {tuvStatus === 'DUE_SOON' && (
                        <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div>TÜV FÄLLIG IN KRÜRZE!</div>
                            <div className="text-[10px] opacity-80 font-mono">Fällig: {veh.nextTuvDate}</div>
                          </div>
                        </div>
                      )}

                      {tuvStatus === 'OK' && (
                        <div className="flex items-center justify-between text-xs text-[var(--wood-text-secondary)]">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            TÜV OK
                          </span>
                          <span className="font-mono text-[11px]">{veh.nextTuvDate}</span>
                        </div>
                      )}
                    </div>

                    {/* LICENSE REQUIRED BADGE */}
                    {veh.requiresDriverLicense && (
                      <div className="text-[11px] text-[var(--wood-ash)] flex items-center gap-1 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Führerschein: {veh.requiredLicenseClass || 'Erforderlich'}</span>
                      </div>
                    )}
                  </div>

                  {/* STATUS FOOTER */}
                  <div className="pt-2 border-t border-[var(--wood-border)] flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        veh.status === 'verfügbar'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                          : 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
                      }`}
                    >
                      ● {veh.status}
                    </span>

                    <button
                      onClick={() => setEditingVehicle(veh)}
                      className="text-[11px] text-[var(--wood-ash)] hover:underline"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* EQUIPMENT VIEW */}
      {activeTab === 'EQUIPMENT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[var(--wood-text-muted)] bg-[var(--wood-seam)]/30 rounded-xl border border-[var(--wood-border)]">
              <Wrench className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Keine Geräte/Maschinen gefunden.</p>
            </div>
          ) : (
            filteredEquipment.map((eq) => {
              const nextMaintDate = calculateNextMaintenanceDate(
                eq.lastMaintenanceDate,
                eq.maintenanceIntervalDays
              );
              const maintStatus = getMaintenanceStatus(
                eq.lastMaintenanceDate,
                eq.maintenanceIntervalDays
              );
              const daysPassed = daysSinceDate(eq.lastMaintenanceDate);

              return (
                <div
                  key={eq.id}
                  className="wood-raised-card p-4 space-y-3 flex flex-col justify-between hover:border-[var(--wood-edge)] transition group"
                >
                  <div className="space-y-3">
                    {/* TITLE & CATEGORY */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-[var(--wood-text-muted)]">
                            {eq.category}
                          </span>
                          {eq.quantity > 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-[var(--wood-moss)]/20 text-[var(--wood-moss)] text-[10px] font-bold border border-[var(--wood-moss)]/30">
                              {eq.quantity}x
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-[var(--wood-text-primary)] group-hover:text-[var(--wood-ash)] transition">
                          {eq.name}
                        </h4>
                        {eq.serialNumber && (
                          <div className="text-[10px] font-mono text-[var(--wood-text-muted)] mt-0.5">
                            SN: {eq.serialNumber}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setEditingEquipment(eq)}
                        className="p-1.5 text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] hover:bg-[var(--wood-seam)] rounded-lg transition shrink-0"
                        title="Gerät bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* MAINTENANCE STATUS BADGE */}
                    <div className="pt-2 border-t border-[var(--wood-border)]/50">
                      {maintStatus === 'OVERDUE' && (
                        <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <div>
                            <div>WARTUNG ÜBERFÄLLIG!</div>
                            <div className="text-[10px] opacity-80 font-mono">
                              Nächste fällig: {nextMaintDate}
                            </div>
                          </div>
                        </div>
                      )}

                      {maintStatus === 'DUE_SOON' && (
                        <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div>WARTUNG BALD FÄLLIG!</div>
                            <div className="text-[10px] opacity-80 font-mono">
                              Nächste fällig: {nextMaintDate}
                            </div>
                          </div>
                        </div>
                      )}

                      {maintStatus === 'OK' && (
                        <div className="flex items-center justify-between text-xs text-[var(--wood-text-secondary)]">
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Wartung OK
                          </span>
                          <span className="font-mono text-[11px]">Nächste: {nextMaintDate}</span>
                        </div>
                      )}

                      {maintStatus === 'UNKNOWN' && (
                        <div className="text-[11px] text-[var(--wood-text-muted)] italic">
                          Kein Wartungsdatum hinterlegt
                        </div>
                      )}

                      {daysPassed !== null && daysPassed >= 0 && (
                        <div className="text-[10px] text-[var(--wood-text-muted)] mt-1 font-mono">
                          Letzte Wartung vor {daysPassed} Tagen ({eq.lastMaintenanceDate})
                        </div>
                      )}
                    </div>

                    {/* EXCLUSIVE BADGE */}
                    {eq.isExclusive && (
                      <span className="inline-block text-[9px] uppercase font-bold text-amber-300 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40">
                        Exklusiv pro Tag
                      </span>
                    )}
                  </div>

                  {/* STATUS FOOTER */}
                  <div className="pt-2 border-t border-[var(--wood-border)] flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        eq.status === 'verfügbar'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                          : 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
                      }`}
                    >
                      ● {eq.status}
                    </span>

                    <button
                      onClick={() => setEditingEquipment(eq)}
                      className="text-[11px] text-[var(--wood-ash)] hover:underline"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
