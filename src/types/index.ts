/**
 * Arboscus Workforce Planning Domain Types
 */

export type WorksiteColorKey =
  | 'site-blue'
  | 'site-green'
  | 'site-orange'
  | 'site-violet'
  | 'site-teal'
  | 'site-red'
  | 'site-yellow'
  | 'site-slate';

export interface EmployeeStatusOption {
  id: string;
  label: string;
}

export interface EmploymentTypeOption {
  id: string;
  label: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: 'Teamleiter' | 'SKT-Kletterer' | 'Baumpfleger' | 'Maschinist' | 'Auszubildender' | 'Facharbeiter' | string;
  statusId: string;
  employmentTypeId: string;
  isLeader: boolean;
  skills: string[];
  maxWeeklyHours: number;
  initials: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Absence {
  id: string;
  employeeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: 'Urlaub' | 'Krankheit' | 'Schulung' | 'Elternzeit';
  status: 'genehmigt' | 'ausstehend';
  note?: string;
}

export interface WorksiteRequirement {
  id: string;
  text: string;
}

export interface WorksiteTodo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface WorksiteComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  isUnread: boolean;
}

export interface Worksite {
  id: string;
  code: string;
  name: string;
  location: string; // District/City e.g. "Potsdam", "Berlin-Mitte"
  address: string;
  meetingPoint: string;
  colorKey: WorksiteColorKey;
  hexColor: string;
  description: string;
  requiredSkills: string[];
  orderDescription: string;
  requirements: WorksiteRequirement[];
  todoItems: WorksiteTodo[];
  comments: WorksiteComment[];
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'LKW' | 'Transporter' | 'Unimog' | 'Anhänger' | string;
  licensePlate: string;
  nextTuvDate: string; // YYYY-MM-DD
  status: 'verfügbar' | 'reserviert' | 'wartung';
  quantity: 1;
  requiresDriverLicense?: boolean;
  requiredLicenseClass?: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'Hubarbeitsbühne' | 'Häcksler' | 'Großsäge' | 'Fräse' | 'Spezialgerät' | string;
  quantity: number;
  requiresDriverLicense?: boolean;
  requiredLicenseClass?: string;
  isExclusive: boolean;
  status: 'verfügbar' | 'reserviert' | 'wartung';
  serialNumber?: string;
  lastMaintenanceDate?: string; // YYYY-MM-DD
  maintenanceIntervalDays?: number;
  notes?: string;
}

export interface TeamTemplate {
  id: string;
  name: string;
  description?: string;
  leaderEmployeeId?: string;
  employeeIds: string[];
  vehicleIds: string[];
  equipmentIds: string[];
  color?: string;
  tags?: string[];
  defaultActivityName?: string;
  createdAt?: string;
}

export type AssignmentStatus = 'draft' | 'published' | 'modified';

export interface WorksiteAssignment {
  id: string;
  worksiteId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "07:00"
  endTime: string; // e.g. "15:30"
  activityName: string;
  assignedEmployeeIds: string[];
  assignedVehicleIds: string[];
  assignedEquipmentIds: string[];
  status: AssignmentStatus;
  confirmationStatus?: Record<string, 'bestätigt' | 'ausstehend' | 'abgelehnt'>;
  weatherWarning?: string;
  notes?: string;
}

export type ConflictType =
  | 'double_booking'
  | 'absence_conflict'
  | 'resource_double_booking'
  | 'capacity_exceeded'
  | 'missing_skill'
  | 'unassigned_team'
  | 'overtime_warning'
  | 'weather_warning';

export type ConflictSeverity = 'blocking' | 'warning';

export interface PlanningConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  message: string;
  affectedDate: string;
  affectedEmployeeIds?: string[];
  affectedWorksiteId?: string;
  affectedResourceId?: string;
  suggestedFix?: string;
}

export interface PlanningWeek {
  weekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string; // YYYY-MM-DD (Friday or Sunday)
  isPublished: boolean;
  draftChangesCount: number;
  lastModified: string;
}

export interface WeatherSummary {
  location: string;
  date: string; // YYYY-MM-DD
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'windy';
  tempHigh: number; // Celsius
  tempLow: number;
  precipitationProb: number; // Percentage 0-100
  maxWindKmH: number;
  warningText?: string;
  updatedAt: string;
}

export interface EmployeeCapacitySummary {
  employeeId: string;
  plannedHours: number;
  maxHours: number;
  overtimeHours: number;
  assignmentsCount: number;
  isOverCapacity: boolean;
  isAbsentThisWeek: boolean;
}

export interface ResourceUtilizationSummary {
  resourceId: string;
  name: string;
  category: 'vehicle' | 'equipment';
  isExclusive: boolean;
  totalDaysInWeek: number;
  reservedDaysCount: number;
  isDoubleBooked: boolean;
  assignedWorksites: string[];
}

export interface CalendarFilters {
  disabledWorksiteIds: string[];
  hideEmployees: boolean;
  hideResources: boolean;
  hideWeekendsAndBBHolidays: boolean;
  selectedResourceIds?: string[];
}

export interface FilterOptions {
  searchTerm: string;
  selectedRole?: string;
  selectedSkill?: string;
  selectedWorksiteId?: string;
  onlyConflicts: boolean;
  onlyUnassigned: boolean;
  onlyAbsent: boolean;
  onlyWarnings: boolean;
}

export interface PlanningState {
  currentWeekIndex: number; // 0, 1, 2, 3 in 4-week window
  currentMonthDate: string; // e.g. "2026-09"
  weeks: PlanningWeek[];
  employees: Employee[];
  absences: Absence[];
  worksites: Worksite[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  assignments: WorksiteAssignment[];
  weatherData: WeatherSummary[];
  filters: FilterOptions;
  calendarFilters: CalendarFilters;
  selectedWorksiteId: string | null;
  selectedAssignmentId: string | null;
  historyStack: WorksiteAssignment[][];
  futureStack: WorksiteAssignment[][];
  activeView: 'MONTH' | '1W' | '4W' | 'SKILLS' | 'MASTER_DATA';
  simulatedRole: 'ADMINISTRATOR' | 'GESCHÄFTSFÜHRUNG';
  isDarkMode: boolean;
  employeeStatusOptions?: EmployeeStatusOption[];
  employmentTypeOptions?: EmploymentTypeOption[];
}
