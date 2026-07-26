import React, { useState } from 'react';
import {
  WeatherSummary,
  WorksiteAssignment,
  Employee,
  Equipment,
  Worksite,
} from '../../types';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldAlert,
  HardHat,
  Truck,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  get5DayForecast,
  assessOperationalRisk,
  OperationalRiskAssessment,
} from '../../utils/weatherEngine';

interface WeatherForecastOverlayProps {
  startDate: string; // YYYY-MM-DD
  weatherData: WeatherSummary[];
  assignments: WorksiteAssignment[];
  employees: Employee[];
  equipment: Equipment[];
  worksites: Worksite[];
  isDarkMode?: boolean;
  onSelectDay?: (dateIso: string) => void;
  onFilterWeatherConflicts?: () => void;
}

export const WeatherForecastOverlay: React.FC<WeatherForecastOverlayProps> = ({
  startDate,
  weatherData,
  assignments,
  employees,
  equipment,
  worksites,
  isDarkMode = true,
  onSelectDay,
  onFilterWeatherConflicts,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('Alle');
  const [activeRiskDetailDate, setActiveRiskDetailDate] = useState<string | null>(null);

  // Generate 5-day forecast
  const fiveDayForecast = React.useMemo(() => {
    return get5DayForecast(startDate, weatherData, selectedLocation);
  }, [startDate, weatherData, selectedLocation]);

  // Compute operational risks for all 5 days
  const forecastAssessments = React.useMemo(() => {
    return fiveDayForecast.map((w) => {
      const assessment = assessOperationalRisk({
        weather: w,
        assignments,
        employees,
        equipment,
        worksites,
      });
      return { weather: w, assessment };
    });
  }, [fiveDayForecast, assignments, employees, equipment, worksites]);

  // Count total high-risk days or jobs
  const totalHighRiskDays = forecastAssessments.filter(
    (f) => f.assessment.riskLevel === 'HIGH'
  ).length;

  const totalAtRiskJobs = forecastAssessments.reduce(
    (acc, curr) => acc + curr.assessment.affectedAssignments.length,
    0
  );

  const getWeatherIcon = (condition: WeatherSummary['condition']) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'rainy':
        return <CloudRain className="w-5 h-5 text-sky-400" />;
      case 'stormy':
        return <CloudLightning className="w-5 h-5 text-rose-400" />;
      case 'windy':
        return <Wind className="w-5 h-5 text-teal-300" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-300" />;
    }
  };

  const activeDetail = forecastAssessments.find(
    (f) => f.weather.date === activeRiskDetailDate
  );

  return (
    <div
      className={`w-full border-b transition-all duration-200 select-none ${
        isDarkMode
          ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] text-[var(--wood-text-primary)]'
          : 'bg-emerald-950/5 border-emerald-800/20 text-slate-900'
      }`}
    >
      {/* OVERLAY TOP HEADER BAR */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--wood-border)]/40">
        <div className="flex items-center space-x-3">
          <div
            className={`p-1.5 rounded-lg flex items-center justify-center ${
              totalHighRiskDays > 0
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>5-Tage Wetterprognose & Einsatzrisiken</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded font-bold">
                  DWD Live
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-[var(--wood-text-secondary)] flex items-center gap-1 mt-0.5">
              <span>Baumpflege-Sicherheit: Wind- & Kletterverbot-Überwachung</span>
              {totalAtRiskJobs > 0 && (
                <span className="text-rose-400 font-semibold ml-1">
                  · {totalAtRiskJobs} Einsätze durch Wetter gefährdet!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CONTROLS (Location selector + Toggle collapse) */}
        <div className="flex items-center space-x-2">
          {/* Location selector */}
          <div className="flex items-center space-x-1.5 bg-[var(--wood-base)] border border-[var(--wood-border)] px-2 py-1 rounded-lg text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-[11px] font-medium outline-none cursor-pointer"
            >
              <option value="Alle" className="bg-neutral-900 text-white">
                Alle Standorte (Potsdam & Berlin)
              </option>
              <option value="Potsdam" className="bg-neutral-900 text-white">
                Potsdam
              </option>
              <option value="Berlin-Dahlem" className="bg-neutral-900 text-white">
                Berlin-Dahlem
              </option>
            </select>
          </div>

          {totalAtRiskJobs > 0 && onFilterWeatherConflicts && (
            <button
              onClick={onFilterWeatherConflicts}
              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Gefährdete Jobs filtern</span>
            </button>
          )}

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-[var(--wood-base)] border-[var(--wood-border)] text-[var(--wood-text-secondary)] hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={isExpanded ? 'Prognose einklappen' : 'Prognose ausklappen'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 5-DAY CARDS GRID CONTAINER */}
      {isExpanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-[1800px] mx-auto animate-in fade-in duration-200">
          {forecastAssessments.map(({ weather, assessment }) => {
            const dateObj = new Date(weather.date);
            const dayName = dateObj.toLocaleDateString('de-DE', { weekday: 'short' });
            const dayNum = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

            const dayAssignmentsCount = assignments.filter((a) => a.date === weather.date).length;

            const isHighRisk = assessment.riskLevel === 'HIGH';
            const isMediumRisk = assessment.riskLevel === 'MEDIUM';

            return (
              <div
                key={weather.date}
                onClick={() => {
                  setActiveRiskDetailDate(weather.date);
                  onSelectDay?.(weather.date);
                }}
                className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                  isHighRisk
                    ? 'bg-rose-950/30 border-rose-500/60 hover:bg-rose-950/50 shadow-sm'
                    : isMediumRisk
                    ? 'bg-amber-950/20 border-amber-500/50 hover:bg-amber-950/30 shadow-sm'
                    : isDarkMode
                    ? 'bg-[var(--wood-base)] border-[var(--wood-border)] hover:border-[var(--wood-moss)]/60'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* DAY TITLE & WEATHER ICON */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--wood-border)]/40">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-xs uppercase text-[var(--wood-text-primary)]">
                        {dayName} {dayNum}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {getWeatherIcon(weather.condition)}
                      <span className="font-mono text-xs font-bold ml-1">
                        {weather.tempHigh}°
                      </span>
                      <span className="text-[10px] text-[var(--wood-text-muted)] font-mono">
                        /{weather.tempLow}°C
                      </span>
                    </div>
                  </div>

                  {/* WIND & PRECIPITATION METRICS */}
                  <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] font-mono">
                    <div
                      className={`px-2 py-1 rounded border flex items-center justify-between ${
                        weather.maxWindKmH >= 45
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                          : weather.maxWindKmH >= 30
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-[var(--wood-seam)]/50 text-[var(--wood-text-secondary)] border-[var(--wood-border)]/40'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Wind className="w-3 h-3 text-teal-400" />
                        Wind:
                      </span>
                      <span>{weather.maxWindKmH} km/h</span>
                    </div>

                    <div
                      className={`px-2 py-1 rounded border flex items-center justify-between ${
                        weather.precipitationProb >= 60
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
                          : 'bg-[var(--wood-seam)]/50 text-[var(--wood-text-secondary)] border-[var(--wood-border)]/40'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-sky-400" />
                        Regen:
                      </span>
                      <span>{weather.precipitationProb}%</span>
                    </div>
                  </div>

                  {/* OPERATIONAL RISK BADGE */}
                  <div className="mt-2.5">
                    <div
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${assessment.riskColorClass.badgeBg}`}
                    >
                      <span className="flex items-center gap-1">
                        {isHighRisk ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : isMediumRisk ? (
                          <Info className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {assessment.riskLabel}
                      </span>
                      <span>Risk {assessment.riskScore}%</span>
                    </div>
                  </div>
                </div>

                {/* SCHEDULED JOBS ON THIS DAY & WARNING TAG */}
                <div className="mt-3 pt-2 border-t border-[var(--wood-border)]/40 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--wood-text-secondary)]">
                      {dayAssignmentsCount} {dayAssignmentsCount === 1 ? 'Einsatz' : 'Einsätze'}
                    </span>

                    <span className="text-[10px] text-emerald-400 font-mono hover:underline">
                      Details →
                    </span>
                  </div>

                  {/* High Risk Jobs Alert Banner */}
                  {assessment.affectedAssignments.length > 0 && (
                    <div className="px-2 py-1 bg-rose-500/25 border border-rose-500/50 rounded-md text-[10px] text-rose-200 font-semibold flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">
                        {assessment.affectedAssignments.length}{' '}
                        {assessment.affectedAssignments.length === 1 ? 'Job' : 'Jobs'} gefährdet
                        (Klettern/Steiger)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL / DRAWER FOR DETAILED OPERATIONAL RISK ON A SELECTED DAY */}
      {activeDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-xl rounded-2xl border shadow-2xl p-6 flex flex-col gap-4 ${
              isDarkMode
                ? 'bg-[var(--wood-panel)] border-[var(--wood-border)] text-[var(--wood-text-primary)] wood-grain-v'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--wood-border)]">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-xl ${
                    activeDetail.assessment.riskLevel === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-mono uppercase">
                    Wetter & Arbeitsschutz ({activeDetail.weather.date})
                  </h3>
                  <p className="text-xs text-[var(--wood-text-secondary)]">
                    DWD Prognose {activeDetail.weather.location} · {activeDetail.weather.updatedAt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveRiskDetailDate(null)}
                className="p-1.5 rounded-lg border border-[var(--wood-border)] text-[var(--wood-text-muted)] hover:text-white hover:bg-[var(--wood-raised)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Weather Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
                <span className="text-[10px] uppercase text-[var(--wood-text-muted)] font-bold">
                  Temperatur
                </span>
                <p className="text-lg font-mono font-bold mt-1">
                  {activeDetail.weather.tempHigh}°C / {activeDetail.weather.tempLow}°C
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
                <span className="text-[10px] uppercase text-[var(--wood-text-muted)] font-bold">
                  Max. Windböen
                </span>
                <p
                  className={`text-lg font-mono font-bold mt-1 ${
                    activeDetail.weather.maxWindKmH >= 45 ? 'text-rose-400' : 'text-teal-300'
                  }`}
                >
                  {activeDetail.weather.maxWindKmH} km/h
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--wood-base)] border border-[var(--wood-border)] text-center">
                <span className="text-[10px] uppercase text-[var(--wood-text-muted)] font-bold">
                  Regenwahrsch.
                </span>
                <p className="text-lg font-mono font-bold text-sky-400 mt-1">
                  {activeDetail.weather.precipitationProb}%
                </p>
              </div>
            </div>

            {/* Warning Text */}
            {activeDetail.weather.warningText && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Amtliche Warnung:</span>
                  <span>{activeDetail.weather.warningText}</span>
                </div>
              </div>
            )}

            {/* Risk Factors & Recommended Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--wood-text-secondary)]">
                Handlungsempfehlungen für die Disposition:
              </h4>

              <div className="space-y-1.5">
                {activeDetail.assessment.recommendedActions.map((action, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[var(--wood-base)] border border-[var(--wood-border)] text-xs flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Scheduled Jobs */}
            {activeDetail.assessment.affectedAssignments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--wood-border)]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <HardHat className="w-4 h-4" />
                  Gefährdete Einsätze an diesem Tag ({activeDetail.assessment.affectedAssignments.length}):
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {activeDetail.assessment.affectedAssignments.map(({ assignment, worksite, atRiskReason }, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-rose-200">
                          {worksite?.name || 'Baustelle'} ({worksite?.code})
                        </div>
                        <div className="text-[11px] text-rose-300/80 mt-0.5">
                          {assignment.activityName}
                        </div>
                        <div className="text-[10px] text-amber-300 font-mono mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>{atRiskReason}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveRiskDetailDate(null);
                          onSelectDay?.(assignment.date);
                        }}
                        className="px-2.5 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 text-rose-100 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1"
                      >
                        <span>Zum Job</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRiskDetailDate(null)}
                className="px-4 py-2 bg-[var(--wood-raised)] hover:bg-[var(--wood-selected)] text-xs font-semibold rounded-xl border border-[var(--wood-border)]"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
