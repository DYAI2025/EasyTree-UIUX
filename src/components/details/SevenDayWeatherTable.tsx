import React, { useState } from 'react';
import {
  Sun,
  CloudRain,
  Wind,
  CloudSun,
  Cloud,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
  Umbrella,
  Thermometer,
} from 'lucide-react';
import { WeatherSummary } from '../../types';

interface SevenDayWeatherTableProps {
  location: string;
  selectedDate: string; // YYYY-MM-DD
  weatherData?: WeatherSummary[];
}

export const SevenDayWeatherTable: React.FC<SevenDayWeatherTableProps> = ({
  location,
  selectedDate,
  weatherData = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Generate 7 consecutive days starting from selectedDate (or the Monday of the week)
  const getSevenDays = () => {
    const startDate = new Date(selectedDate);
    // If valid date, get Monday of that week for consistent weekly view
    const dayOfWeek = startDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() + diffToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Match from existing weatherData
      const found = weatherData.find(
        (w) => w.date === dateStr && (w.location.includes(location) || location.includes(w.location))
      ) || weatherData.find((w) => w.date === dateStr);

      if (found) {
        days.push({ dateObj: d, dateStr, ...found });
      } else {
        // Generative realistic fallback if date is outside mock bounds
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const tempHigh = 18 + (i % 3) * 2 - (i % 2);
        const tempLow = 10 + (i % 2);
        const precip = isWeekend ? 15 : (i * 12) % 45;
        const wind = 15 + (i * 7) % 35;
        const condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy' =
          wind > 50 ? 'windy' : precip > 40 ? 'rainy' : i % 2 === 0 ? 'sunny' : 'cloudy';

        days.push({
          dateObj: d,
          dateStr,
          location,
          date: dateStr,
          condition,
          tempHigh,
          tempLow,
          precipitationProb: precip,
          maxWindKmH: wind,
          updatedAt: '06:00 Uhr DWD',
          warningText: wind > 55 ? 'Amtliche Warnung vor Sturmböen.' : undefined,
        });
      }
    }
    return days;
  };

  const daysForecast = getSevenDays();

  const formatDayLabel = (dateObj: Date) => {
    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const day = dayNames[dateObj.getDay()];
    const dateNum = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];
    return { day, dateNum, month, fullStr: `${day}, ${dateNum}. ${month}` };
  };

  const getWeatherIcon = (cond: string, windSpeed: number) => {
    if (windSpeed > 55) return <Wind className="w-4 h-4 text-amber-400" />;
    switch (cond) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-sky-400" />;
      case 'windy':
        return <Wind className="w-4 h-4 text-amber-300" />;
      case 'stormy':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'cloudy':
      default:
        return <CloudSun className="w-4 h-4 text-slate-300" />;
    }
  };

  const getConditionLabel = (cond: string, windSpeed: number) => {
    if (windSpeed > 55) return 'Sturmböen';
    switch (cond) {
      case 'sunny':
        return 'Sonnig';
      case 'rainy':
        return 'Regen';
      case 'windy':
        return 'Windig';
      case 'stormy':
        return 'Unwetter';
      case 'cloudy':
      default:
        return 'Bewölkt';
    }
  };

  const getSafetyBadge = (windKmH: number, precipProb: number) => {
    if (windKmH >= 60) {
      return {
        label: '⛔ SKT- & Steiger-Stopp',
        bgColor: 'bg-red-950/80 text-red-300 border-red-700/60',
        tip: 'Sturmböen: Keine Kletterarbeiten oder Steigereinsätze erlaubt',
      };
    }
    if (windKmH >= 40) {
      return {
        label: '⚠️ Böenwarnung',
        bgColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        tip: 'Erhöhte Vorsicht bei Seilklettertechnik & Fällungen',
      };
    }
    if (precipProb >= 60) {
      return {
        label: '🌧️ Nässe / Rutschgefahr',
        bgColor: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
        tip: 'Rutschfeste Ausrüstung & Bodenschutz beachten',
      };
    }
    return {
      label: '✅ Ideal für Pflege',
      bgColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50',
      tip: 'Gute Wetterbedingungen für Schnitt & Fällung',
    };
  };

  return (
    <div className="wood-raised-card p-4 space-y-3 border border-[var(--wood-border)]">
      {/* Header with expand toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--wood-resin)]" />
          <h4 className="text-xs uppercase font-bold text-[var(--wood-text-primary)] tracking-wider">
            7-Tage Wetterprognose & Sicherheit
          </h4>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-semibold text-[var(--wood-text-muted)] hover:text-[var(--wood-text-primary)] transition-colors px-2 py-1 rounded-md bg-[var(--wood-seam)] border border-[var(--wood-border)]"
        >
          <span>{isExpanded ? 'Einklappen' : '7 Tage anzeigen'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Subtitle / Location badge */}
      <div className="flex items-center justify-between text-[11px] text-[var(--wood-text-muted)] bg-[var(--wood-seam)]/60 px-3 py-1.5 rounded-lg border border-[var(--wood-border)]">
        <span>Standort: <strong className="text-[var(--wood-text-primary)]">{location}</strong></span>
        <span className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-[var(--wood-resin)]" />
          7-Tage Trend
        </span>
      </div>

      {/* 7-Day Table */}
      {isExpanded && (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--wood-border)] text-[10px] font-bold text-[var(--wood-text-muted)] uppercase tracking-wider">
                <th className="py-2 px-2">Tag</th>
                <th className="py-2 px-2">Wetter</th>
                <th className="py-2 px-2 text-center">Temp (°C)</th>
                <th className="py-2 px-2 text-center">Regen %</th>
                <th className="py-2 px-2 text-center">Wind</th>
                <th className="py-2 px-2 text-right">Einsatz-Eignung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--wood-border)]/50">
              {daysForecast.map((day) => {
                const { day: dayName, dateNum, month, fullStr } = formatDayLabel(day.dateObj);
                const isSelectedDay = day.dateStr === selectedDate;
                const safety = getSafetyBadge(day.maxWindKmH, day.precipitationProb);

                return (
                  <tr
                    key={day.dateStr}
                    className={`transition-colors ${
                      isSelectedDay
                        ? 'bg-[var(--wood-moss)]/20 font-medium text-[var(--wood-text-primary)]'
                        : 'hover:bg-[var(--wood-seam)]/50 text-[var(--wood-text-secondary)]'
                    }`}
                  >
                    {/* Day & Date */}
                    <td className="py-2 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[var(--wood-text-primary)]">{dayName}</span>
                        <span className="text-[10px] text-[var(--wood-text-muted)]">
                          {dateNum}. {month}
                        </span>
                        {isSelectedDay && (
                          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-[var(--wood-moss)] text-[var(--wood-seam)] rounded">
                            Einsatz
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Condition */}
                    <td className="py-2 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getWeatherIcon(day.condition, day.maxWindKmH)}
                        <span className="text-[11px]">{getConditionLabel(day.condition, day.maxWindKmH)}</span>
                      </div>
                    </td>

                    {/* Temperature Range with Visual Bar */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-[10px] text-[var(--wood-text-muted)]">{day.tempLow}°</span>
                        <div className="w-10 h-1.5 bg-[var(--wood-seam)] rounded-full overflow-hidden border border-[var(--wood-border)] flex">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 via-amber-400 to-orange-500 rounded-full"
                            style={{
                              marginLeft: `${Math.max(0, (day.tempLow - 5) * 3)}%`,
                              width: `${Math.min(100, (day.tempHigh - day.tempLow) * 6)}%`,
                            }}
                          />
                        </div>
                        <span className="font-bold text-[var(--wood-text-primary)] text-[11px]">
                          {day.tempHigh}°
                        </span>
                      </div>
                    </td>

                    {/* Precipitation Prob */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Umbrella className="w-3 h-3 text-sky-400" />
                        <span
                          className={`font-mono text-[11px] ${
                            day.precipitationProb > 50 ? 'text-sky-400 font-bold' : 'text-[var(--wood-text-muted)]'
                          }`}
                        >
                          {day.precipitationProb}%
                        </span>
                      </div>
                    </td>

                    {/* Wind Speed */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                          day.maxWindKmH >= 55
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : day.maxWindKmH >= 35
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-[var(--wood-text-muted)]'
                        }`}
                      >
                        {day.maxWindKmH} km/h
                      </span>
                    </td>

                    {/* Worksite Safety / Suitability */}
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] rounded-md font-semibold border ${safety.bgColor}`}
                        title={safety.tip}
                      >
                        {safety.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
