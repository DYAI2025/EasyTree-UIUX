import {
  WeatherSummary,
  WorksiteAssignment,
  Employee,
  Equipment,
  Vehicle,
  Worksite,
} from '../types';
import { calculateHours } from '../domain/conflictEngine';

export interface OperationalRiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskLabel: string;
  riskColorClass: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    iconColor: string;
  };
  riskScore: number; // 0 to 100
  riskFactors: string[];
  recommendedActions: string[];
  affectedAssignments: {
    assignment: WorksiteAssignment;
    worksite?: Worksite;
    atRiskReason: string;
    hasClimbers: boolean;
    hasBucketTruck: boolean;
    hasHeavyMachinery: boolean;
  }[];
}

/**
 * Deterministically generates realistic weather if missing for a date.
 */
export const getWeatherForDate = (
  dateIso: string,
  location: string = 'Potsdam',
  weatherList: WeatherSummary[] = []
): WeatherSummary => {
  // First look for exact match
  const exact = weatherList.find(
    (w) => w.date === dateIso && (w.location.toLowerCase().includes(location.toLowerCase()) || location === 'Alle')
  );
  if (exact) return exact;

  const anyLocationMatch = weatherList.find((w) => w.date === dateIso);
  if (anyLocationMatch) return anyLocationMatch;

  // Fallback: generate pseudo-weather based on date string hash
  let hash = 0;
  for (let i = 0; i < dateIso.length; i++) {
    hash = (hash << 5) - hash + dateIso.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const conditions: WeatherSummary['condition'][] = ['sunny', 'cloudy', 'cloudy', 'rainy', 'windy'];
  const condition = conditions[absHash % conditions.length];

  const tempHigh = 16 + (absHash % 10);
  const tempLow = tempHigh - 7 - (absHash % 4);
  const precipitationProb = condition === 'rainy' ? 70 + (absHash % 25) : (absHash % 40);
  const maxWindKmH = condition === 'windy' ? 48 + (absHash % 22) : 15 + (absHash % 25);

  let warningText: string | undefined = undefined;
  if (maxWindKmH >= 55) {
    warningText = `Warnung vor Windböen bis ${maxWindKmH} km/h. Besondere Vorsicht bei Kletterarbeiten!`;
  } else if (precipitationProb >= 75) {
    warningText = `Warnung vor ergiebigem Dauerregen. Rutschgefahr im Kronenbereich!`;
  }

  return {
    location,
    date: dateIso,
    condition,
    tempHigh,
    tempLow,
    precipitationProb,
    maxWindKmH,
    warningText,
    updatedAt: '06:00 Uhr DWD',
  };
};

/**
 * Returns a 5-day weather forecast array starting from startDateIso.
 */
export const get5DayForecast = (
  startDateIso: string,
  weatherList: WeatherSummary[] = [],
  location: string = 'Potsdam'
): WeatherSummary[] => {
  const result: WeatherSummary[] = [];
  const start = new Date(startDateIso);

  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${day}`;

    result.push(getWeatherForDate(iso, location, weatherList));
  }

  return result;
};

/**
 * Evaluates operational risks for tree care & arboriculture jobs based on weather and equipment/skills.
 */
export const assessOperationalRisk = ({
  weather,
  assignments,
  employees,
  equipment,
  worksites,
}: {
  weather: WeatherSummary;
  assignments: WorksiteAssignment[];
  employees: Employee[];
  equipment: Equipment[];
  worksites: Worksite[];
}): OperationalRiskAssessment => {
  const dayAssignments = assignments.filter((a) => a.date === weather.date);

  const riskFactors: string[] = [];
  const recommendedActions: string[] = [];
  let riskScore = 10; // baseline

  // 1. Wind Analysis
  if (weather.maxWindKmH >= 50) {
    riskScore += 50;
    riskFactors.push(`Starke Windböen (${weather.maxWindKmH} km/h) - Hohes Absturz- & Bruchastrisiko`);
    recommendedActions.push('SKT-Kletterarbeiten und Hubarbeitsbühnen-Einsätze absagen oder verschieben.');
    recommendedActions.push('Sicherheitsabsperrung unter gefährdeten Baumkronen erweitern.');
  } else if (weather.maxWindKmH >= 35) {
    riskScore += 25;
    riskFactors.push(`Mäßiger bis starker Wind (${weather.maxWindKmH} km/h)`);
    recommendedActions.push('Erhöhte Aufmerksamkeit bei Steigereinsätzen und Kronensicherungen.');
  }

  // 2. Rain & Precipitation Analysis
  if (weather.precipitationProb >= 65) {
    riskScore += 30;
    riskFactors.push(`Hohe Niederschlagswahrscheinlichkeit (${weather.precipitationProb}%)`);
    recommendedActions.push('Rutschfeste Kleidung tragen; elektrische Sägen vor Feuchtigkeit schützen.');
    recommendedActions.push('Bodenverdichtung auf unbefestigten Baustellen vermeiden (Rassenschutzplatten nutzen).');
  }

  // 3. Temperature Analysis
  if (weather.tempLow <= 2) {
    riskScore += 20;
    riskFactors.push(`Frostgefahr / Nachtestemperatur ${weather.tempLow}°C`);
    recommendedActions.push('Hydrauliköle von Hubarbeitsbühnen warmfahren, Eisglätte auf Ästen prüfen.');
  }

  // Warning text bonus
  if (weather.warningText) {
    riskScore += 20;
    if (!riskFactors.some((f) => f.includes('Amtliche Warnung'))) {
      riskFactors.push(`Amtliche Wetterwarnung: ${weather.warningText}`);
    }
  }

  // Affected jobs evaluation
  const affectedAssignments: OperationalRiskAssessment['affectedAssignments'] = [];

  dayAssignments.forEach((asg) => {
    const worksite = worksites.find((w) => w.id === asg.worksiteId);

    // Check assigned employees for climbers
    const assignedEmps = employees.filter((e) => asg.assignedEmployeeIds.includes(e.id));
    const hasClimbers = assignedEmps.some((e) => e.role === 'SKT-Kletterer' || e.skills.includes('SKT-B Klettern'));

    // Check assigned equipment for bucket trucks / Hubarbeitsbühnen
    const assignedEqs = equipment.filter((eq) => asg.assignedEquipmentIds.includes(eq.id));
    const hasBucketTruck = assignedEqs.some((eq) => eq.category === 'Hubarbeitsbühne');

    const hasHeavyMachinery = assignedEqs.some((eq) => eq.category === 'Häcksler' || eq.category === 'Fräse');

    let atRiskReason = '';
    if (weather.maxWindKmH >= 45 && (hasClimbers || hasBucketTruck)) {
      atRiskReason = hasBucketTruck
        ? 'Hubarbeitsbühnen-Einsatz bei Windböen über 45 km/h unzulässig'
        : 'SKT-Baumklettern bei Starkwind lebensgefährlich';
    } else if (weather.precipitationProb >= 60 && hasClimbers) {
      atRiskReason = 'Rutschige Rinde erhöht Sturzgefahr beim Klettern';
    } else if (weather.precipitationProb >= 70 && hasHeavyMachinery) {
      atRiskReason = 'Bodenaufweichung beeinträchtigt Schwergeräte-Standfestigkeit';
    }

    if (atRiskReason) {
      affectedAssignments.push({
        assignment: asg,
        worksite,
        atRiskReason,
        hasClimbers,
        hasBucketTruck,
        hasHeavyMachinery,
      });
    }
  });

  // Determine Overall Level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let riskLabel = 'Optimales Einsatzwetter';

  if (riskScore >= 60 || affectedAssignments.some((a) => a.hasBucketTruck || a.hasClimbers)) {
    riskLevel = 'HIGH';
    riskLabel = 'Hohes Einsatzrisiko (Warnung)';
  } else if (riskScore >= 30) {
    riskLevel = 'MEDIUM';
    riskLabel = 'Mäßiges Wetterrisiko';
  }

  // Style classes
  const riskColorClass =
    riskLevel === 'HIGH'
      ? {
          bg: 'bg-rose-950/40',
          border: 'border-rose-500/60',
          text: 'text-rose-300',
          badgeBg: 'bg-rose-500 text-white',
          iconColor: 'text-rose-400',
        }
      : riskLevel === 'MEDIUM'
      ? {
          bg: 'bg-amber-950/30',
          border: 'border-amber-500/50',
          text: 'text-amber-300',
          badgeBg: 'bg-amber-500 text-neutral-950',
          iconColor: 'text-amber-400',
        }
      : {
          bg: 'bg-emerald-950/20',
          border: 'border-emerald-500/30',
          text: 'text-emerald-300',
          badgeBg: 'bg-emerald-600 text-white',
          iconColor: 'text-emerald-400',
        };

  return {
    riskLevel,
    riskLabel,
    riskColorClass,
    riskScore,
    riskFactors,
    recommendedActions,
    affectedAssignments,
  };
};
