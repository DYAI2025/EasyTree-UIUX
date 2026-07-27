/**
 * Arboscus Teamplaner - Administration & Management Workforce Planner
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  PlanningState,
  WorksiteAssignment,
  Worksite,
  Employee,
  Vehicle,
  Equipment,
  FilterOptions,
  CalendarFilters,
  EmployeeStatusOption,
  EmploymentTypeOption,
} from './types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ABSENCES,
  INITIAL_WORKSITES,
  INITIAL_VEHICLES,
  INITIAL_EQUIPMENT,
  INITIAL_WEEKS,
  INITIAL_WEATHER,
  INITIAL_ASSIGNMENTS,
  INITIAL_EMPLOYEE_STATUSES,
  INITIAL_EMPLOYMENT_TYPES,
} from './data/mockData';
import { detectConflicts } from './domain/conflictEngine';
import { computeBentoMetrics } from './domain/capacityEngine';
import {
  normalizeWorksite,
  normalizeEmployee,
  normalizeVehicle,
  normalizeEquipment,
  loadAndNormalizeStorage,
} from './domain/normalizeData';
import { exportWeekAssignmentsToCSV } from './utils/csvExport';
import { TopCommandBar } from './components/layout/TopCommandBar';
import { SummaryTiles } from './components/layout/SummaryTiles';
import { MonthCalendarView } from './components/planner/MonthCalendarView';
import { WeeklyPlanner } from './components/planner/WeeklyPlanner';
import { FourWeekPlanner } from './components/planner/FourWeekPlanner';
import { SkillsMatrixDashboard } from './components/skills/SkillsMatrixDashboard';
import { MasterDataView } from './components/master-data/MasterDataView';
import { WorksiteDetailDrawer } from './components/details/WorksiteDetailDrawer';
import { PublishModal } from './components/modals/PublishModal';
import { FilterModal } from './components/modals/FilterModal';
import { QuickAddModal } from './components/modals/QuickAddModal';

export default function App() {
  // MASTER PLANNING STATE
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
  const [currentMonthDate, setCurrentMonthDate] = useState<string>('2026-09');
  const [weeks, setWeeks] = useState(INITIAL_WEEKS);
  const [absences] = useState(INITIAL_ABSENCES);
  const [weatherData] = useState(INITIAL_WEATHER);
  const [assignments, setAssignments] = useState<WorksiteAssignment[]>(INITIAL_ASSIGNMENTS);

  // PERSISTENT MASTER DATA STATES (arboscus_v2_*)
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadAndNormalizeStorage(
      'arboscus_v2_employees',
      normalizeEmployee,
      INITIAL_EMPLOYEES,
      'arboscus_employees'
    )
  );

  const [statusOptions, setStatusOptions] = useState<EmployeeStatusOption[]>(() => {
    const stored = localStorage.getItem('arboscus_v2_emp_statuses');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.error('Failed to parse statuses', err);
      }
    }
    return INITIAL_EMPLOYEE_STATUSES;
  });

  const [employmentTypeOptions, setEmploymentTypeOptions] = useState<EmploymentTypeOption[]>(() => {
    const stored = localStorage.getItem('arboscus_v2_employment_types');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.error('Failed to parse employment types', err);
      }
    }
    return INITIAL_EMPLOYMENT_TYPES;
  });

  const [worksites, setWorksites] = useState<Worksite[]>(() =>
    loadAndNormalizeStorage(
      'arboscus_v2_worksites',
      normalizeWorksite,
      INITIAL_WORKSITES,
      'arboscus_worksites'
    )
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    loadAndNormalizeStorage(
      'arboscus_v2_vehicles',
      normalizeVehicle,
      INITIAL_VEHICLES,
      'arboscus_vehicles'
    )
  );

  const [equipment, setEquipment] = useState<Equipment[]>(() =>
    loadAndNormalizeStorage(
      'arboscus_v2_equipment',
      normalizeEquipment,
      INITIAL_EQUIPMENT,
      'arboscus_equipment'
    )
  );

  // PERSISTENCE EFFECTS
  useEffect(() => {
    localStorage.setItem('arboscus_v2_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('arboscus_v2_emp_statuses', JSON.stringify(statusOptions));
  }, [statusOptions]);

  useEffect(() => {
    localStorage.setItem('arboscus_v2_employment_types', JSON.stringify(employmentTypeOptions));
  }, [employmentTypeOptions]);

  useEffect(() => {
    localStorage.setItem('arboscus_v2_worksites', JSON.stringify(worksites));
  }, [worksites]);

  useEffect(() => {
    localStorage.setItem('arboscus_v2_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('arboscus_v2_equipment', JSON.stringify(equipment));
  }, [equipment]);

  // MASTER DATA HANDLERS
  const handleAddStatusOption = useCallback((label: string): EmployeeStatusOption => {
    const newOpt: EmployeeStatusOption = {
      id: `emp-status-${Date.now()}`,
      label,
    };
    setStatusOptions((prev) => [...prev, newOpt]);
    return newOpt;
  }, []);

  const handleAddEmploymentTypeOption = useCallback((label: string): EmploymentTypeOption => {
    const newOpt: EmploymentTypeOption = {
      id: `emp-type-${Date.now()}`,
      label,
    };
    setEmploymentTypeOptions((prev) => [...prev, newOpt]);
    return newOpt;
  }, []);

  const handleCreateEmployee = useCallback((empData: Omit<Employee, 'id'> | Employee) => {
    const newEmp: Employee = {
      ...empData,
      id: 'id' in empData && empData.id ? empData.id : `emp_${Date.now()}`,
    };
    setEmployees((prev) => [newEmp, ...prev]);
  }, []);

  const handleUpdateEmployee = useCallback((updatedEmp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
  }, []);

  const handleCreateVehicle = useCallback((veh: Vehicle) => {
    setVehicles((prev) => [veh, ...prev]);
  }, []);

  const handleUpdateVehicle = useCallback((updatedVeh: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updatedVeh.id ? updatedVeh : v)));
  }, []);

  const handleCreateEquipment = useCallback((eq: Equipment) => {
    setEquipment((prev) => [eq, ...prev]);
  }, []);

  const handleUpdateEquipment = useCallback((updatedEq: Equipment) => {
    setEquipment((prev) => prev.map((e) => (e.id === updatedEq.id ? updatedEq : e)));
  }, []);

  const handleCreateWorksite = useCallback((wsData: Omit<Worksite, 'id'> | Worksite) => {
    const newWs: Worksite = {
      ...wsData,
      id: 'id' in wsData && wsData.id ? wsData.id : `ws_${Date.now()}`,
    };
    setWorksites((prev) => [newWs, ...prev]);
  }, []);

  const handleUpdateWorksite = useCallback((updatedWs: Worksite) => {
    setWorksites((prev) => prev.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
  }, []);

  const handleMarkCommentRead = useCallback((worksiteId: string) => {
    setWorksites((prev) =>
      prev.map((w) =>
        w.id === worksiteId
          ? {
              ...w,
              comments: w.comments?.map((c) => ({ ...c, isUnread: false })),
            }
          : w
      )
    );
  }, []);

  // ADD NEW WORKSITE HANDLER
  const handleAddWorksite = useCallback((newWs: Worksite) => {
    setWorksites((prev) => [newWs, ...prev]);
  }, []);

  // THEME & VIEW STATES
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('arboscus_dark_mode');
    return stored !== null ? stored === 'true' : true;
  });

  const [activeView, setActiveView] = useState<'MONTH' | '1W' | '4W' | 'SKILLS' | 'MASTER_DATA'>(() => {
    const stored = localStorage.getItem('arboscus_active_view');
    if (stored === 'MONTH' || stored === '1W' || stored === '4W' || stored === 'SKILLS' || stored === 'MASTER_DATA') {
      return stored as any;
    }
    return 'MONTH';
  });

  const [simulatedRole, setSimulatedRole] = useState<'ADMINISTRATOR' | 'GESCHÄFTSFÜHRUNG'>('ADMINISTRATOR');
  const [showSummaryTiles, setShowSummaryTiles] = useState<boolean>(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // MODAL STATES
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultDate, setQuickAddDefaultDate] = useState<string>('2026-09-14');

  // UNDO / REDO STACKS
  const [pastAssignments, setPastAssignments] = useState<WorksiteAssignment[][]>([]);
  const [futureAssignments, setFutureAssignments] = useState<WorksiteAssignment[][]>([]);

  // CALENDAR & BOARD FILTERS
  const DEFAULT_FILTERS: FilterOptions = {
    searchTerm: '',
    onlyConflicts: false,
    onlyUnassigned: false,
    onlyAbsent: false,
    onlyWarnings: false,
  };

  const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
    disabledWorksiteIds: [],
    hideEmployees: false,
    hideResources: false,
    hideWeekendsAndBBHolidays: false,
    selectedResourceIds: [],
  };

  const [filters, setFilters] = useState<FilterOptions>(() => {
    const stored = localStorage.getItem('arboscus_filters');
    if (stored) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Failed to parse stored filters', e);
      }
    }
    return DEFAULT_FILTERS;
  });

  const [calendarFilters, setCalendarFilters] = useState<CalendarFilters>(() => {
    const stored = localStorage.getItem('arboscus_calendar_filters');
    if (stored) {
      try {
        return { ...DEFAULT_CALENDAR_FILTERS, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Failed to parse stored calendar filters', e);
      }
    }
    return DEFAULT_CALENDAR_FILTERS;
  });

  // PERSISTENCE EFFECTS
  useEffect(() => {
    localStorage.setItem('arboscus_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('arboscus_filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('arboscus_calendar_filters', JSON.stringify(calendarFilters));
  }, [calendarFilters]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const currentWeek = weeks[currentWeekIndex] || weeks[0];

  // TOGGLE DARK MODE
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('arboscus_dark_mode', String(next));
      return next;
    });
  };

  // SAVE SNAPSHOT BEFORE MODIFICATION
  const pushHistory = useCallback(() => {
    setPastAssignments((prev) => [...prev, JSON.parse(JSON.stringify(assignments))]);
    setFutureAssignments([]); // Clear redo stack on new action
  }, [assignments]);

  // UNDO ACTION
  const handleUndo = useCallback(() => {
    if (pastAssignments.length === 0) return;
    const previousState = pastAssignments[pastAssignments.length - 1];
    setPastAssignments((prev) => prev.slice(0, prev.length - 1));
    setFutureAssignments((prev) => [...prev, JSON.parse(JSON.stringify(assignments))]);
    setAssignments(previousState);
  }, [pastAssignments, assignments]);

  // REDO ACTION
  const handleRedo = useCallback(() => {
    if (futureAssignments.length === 0) return;
    const nextState = futureAssignments[futureAssignments.length - 1];
    setFutureAssignments((prev) => prev.slice(0, prev.length - 1));
    setPastAssignments((prev) => [...prev, JSON.parse(JSON.stringify(assignments))]);
    setAssignments(nextState);
  }, [futureAssignments, assignments]);

  // GLOBAL KEYBOARD SHORTCUTS FOR UNDO / REDO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // DETECT CONFLICTS
  const allConflicts = useMemo(() => {
    return detectConflicts(
      assignments,
      employees,
      absences,
      worksites,
      equipment,
      vehicles
    );
  }, [assignments, employees, absences, worksites, equipment, vehicles]);

  // WEEKLY CONFLICTS FILTERED BY CURRENT WEEK DATES
  const weeklyConflicts = useMemo(() => {
    return allConflicts.filter(
      (c) =>
        c.affectedDate === 'Ganze Woche' ||
        (c.affectedDate >= currentWeek.startDate && c.affectedDate <= currentWeek.endDate)
    );
  }, [allConflicts, currentWeek.startDate, currentWeek.endDate]);

  const blockingConflictsCount = useMemo(() => {
    return weeklyConflicts.filter((c) => c.severity === 'blocking').length;
  }, [weeklyConflicts]);

  // BENTO SUMMARY TILES METRICS
  const metrics = useMemo(() => {
    return computeBentoMetrics(
      employees,
      assignments,
      absences,
      worksites,
      vehicles,
      equipment,
      weeklyConflicts,
      currentWeek.startDate,
      currentWeek.endDate
    );
  }, [
    employees,
    assignments,
    absences,
    worksites,
    vehicles,
    equipment,
    weeklyConflicts,
    currentWeek.startDate,
    currentWeek.endDate,
  ]);

  // FILTERED ASSIGNMENTS
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      if (activeView === '1W' && (asg.date < currentWeek.startDate || asg.date > currentWeek.endDate)) {
        return false;
      }

      // Filter by search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const worksite = worksites.find((w) => w.id === asg.worksiteId);
        const matchesWorksite = worksite && (worksite.name.toLowerCase().includes(term) || worksite.location.toLowerCase().includes(term));
        const matchesActivity = asg.activityName.toLowerCase().includes(term);
        const matchesEmps = asg.assignedEmployeeIds.some((id) => {
          const emp = employees.find((e) => e.id === id);
          return emp && `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term);
        });

        if (!matchesWorksite && !matchesActivity && !matchesEmps) return false;
      }

      // Filter by specific worksite
      if (filters.selectedWorksiteId && asg.worksiteId !== filters.selectedWorksiteId) {
        return false;
      }

      // Filter by role or skill
      if (filters.selectedRole || filters.selectedSkill) {
        const assignedEmps = asg.assignedEmployeeIds
          .map((id) => employees.find((e) => e.id === id))
          .filter(Boolean);

        if (filters.selectedRole && !assignedEmps.some((e) => e?.role === filters.selectedRole)) {
          return false;
        }

        if (
          filters.selectedSkill &&
          !assignedEmps.some((e) => e?.skills.includes(filters.selectedSkill!))
        ) {
          return false;
        }
      }

      // Filter by conflicts only
      if (filters.onlyConflicts) {
        const hasConflict = allConflicts.some(
          (c) => c.affectedWorksiteId === asg.worksiteId && c.affectedDate === asg.date
        );
        if (!hasConflict) return false;
      }

      // Filter by unassigned only
      if (filters.onlyUnassigned && asg.assignedEmployeeIds.length > 0) {
        return false;
      }

      return true;
    });
  }, [assignments, activeView, currentWeek, filters, worksites, employees, allConflicts]);

  // CURRENTLY SELECTED ASSIGNMENT FOR DRAWER
  const selectedAssignment = useMemo(() => {
    return assignments.find((a) => a.id === selectedAssignmentId) || null;
  }, [assignments, selectedAssignmentId]);

  const selectedWorksite = useMemo(() => {
    if (!selectedAssignment) return null;
    return worksites.find((w) => w.id === selectedAssignment.worksiteId) || null;
  }, [selectedAssignment, worksites]);

  const selectedAssignedEmployees = useMemo(() => {
    if (!selectedAssignment) return [];
    return selectedAssignment.assignedEmployeeIds
      .map((id) => employees.find((e) => e.id === id))
      .filter((e): e is Employee => Boolean(e));
  }, [selectedAssignment, employees]);

  const selectedAssignedVehicles = useMemo(() => {
    if (!selectedAssignment) return [];
    return selectedAssignment.assignedVehicleIds
      .map((id) => vehicles.find((v) => v.id === id))
      .filter((v): v is Vehicle => Boolean(v));
  }, [selectedAssignment, vehicles]);

  const selectedAssignedEquipment = useMemo(() => {
    if (!selectedAssignment) return [];
    return selectedAssignment.assignedEquipmentIds
      .map((id) => equipment.find((eq) => eq.id === id))
      .filter((eq): eq is Equipment => Boolean(eq));
  }, [selectedAssignment, equipment]);

  const selectedWeather = useMemo(() => {
    if (!selectedAssignment || !selectedWorksite) return undefined;
    return weatherData.find(
      (w) => w.date === selectedAssignment.date && (w.location.includes(selectedWorksite.location) || selectedWorksite.location.includes(w.location))
    ) || weatherData.find((w) => w.date === selectedAssignment.date);
  }, [selectedAssignment, selectedWorksite, weatherData]);

  // ACTIONS & HANDLERS
  const handlePrevWeek = () => {
    if (activeView === 'MONTH') {
      const [y, m] = currentMonthDate.split('-').map(Number);
      let newM = m - 1;
      let newY = y;
      if (newM < 1) {
        newM = 12;
        newY -= 1;
      }
      setCurrentMonthDate(`${newY}-${String(newM).padStart(2, '0')}`);
    } else {
      setCurrentWeekIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextWeek = () => {
    if (activeView === 'MONTH') {
      const [y, m] = currentMonthDate.split('-').map(Number);
      let newM = m + 1;
      let newY = y;
      if (newM > 12) {
        newM = 1;
        newY += 1;
      }
      setCurrentMonthDate(`${newY}-${String(newM).padStart(2, '0')}`);
    } else {
      setCurrentWeekIndex((prev) => Math.min(weeks.length - 1, prev + 1));
    }
  };

  const handleToday = () => {
    setCurrentWeekIndex(0);
    setCurrentMonthDate('2026-09');
  };

  const handleOpenQuickAdd = (date?: string) => {
    setQuickAddDefaultDate(date || '2026-09-14');
    setIsQuickAddOpen(true);
  };

  const handleQuickAddSubmit = (newAssignmentData: Omit<WorksiteAssignment, 'id'>) => {
    pushHistory();

    const newAsg: WorksiteAssignment = {
      ...newAssignmentData,
      id: `asg-quick-${Date.now()}`,
      status: 'draft', // Created as draft initially as required
    };

    setAssignments((prev) => [...prev, newAsg]);
    setSelectedAssignmentId(newAsg.id);

    // Update draft changes count
    setWeeks((prevWeeks) =>
      prevWeeks.map((w, idx) =>
        idx === currentWeekIndex
          ? { ...w, draftChangesCount: w.draftChangesCount + 1, isPublished: false }
          : w
      )
    );
  };

  const handleAddAssignment = (date: string) => {
    handleOpenQuickAdd(date);
  };

  const handleAddEmployeeToAssignment = (employeeId: string) => {
    if (!selectedAssignmentId) return;
    pushHistory();

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === selectedAssignmentId && !a.assignedEmployeeIds.includes(employeeId)) {
          return {
            ...a,
            assignedEmployeeIds: [...a.assignedEmployeeIds, employeeId],
            status: 'modified',
          };
        }
        return a;
      })
    );

    setWeeks((prev) =>
      prev.map((w, idx) =>
        idx === currentWeekIndex
          ? { ...w, draftChangesCount: w.draftChangesCount + 1, isPublished: false }
          : w
      )
    );
  };

  const handleMoveEmployeeBetweenAssignments = useCallback(
    (employeeId: string, targetAssignmentId: string, sourceAssignmentId?: string) => {
      if (sourceAssignmentId === targetAssignmentId) return;

      pushHistory();

      setAssignments((prev) =>
        prev.map((a) => {
          // If it's the target assignment, add employee if not present
          if (a.id === targetAssignmentId) {
            if (!a.assignedEmployeeIds.includes(employeeId)) {
              return {
                ...a,
                assignedEmployeeIds: [...a.assignedEmployeeIds, employeeId],
                status: 'modified',
              };
            }
            return a;
          }

          // If it's the source assignment, remove employee
          if (sourceAssignmentId && sourceAssignmentId !== 'unassigned' && a.id === sourceAssignmentId) {
            return {
              ...a,
              assignedEmployeeIds: a.assignedEmployeeIds.filter((id) => id !== employeeId),
              status: 'modified',
            };
          }

          return a;
        })
      );

      setWeeks((prevWeeks) =>
        prevWeeks.map((w, idx) =>
          idx === currentWeekIndex
            ? { ...w, draftChangesCount: w.draftChangesCount + 1, isPublished: false }
            : w
        )
      );
    },
    [pushHistory, currentWeekIndex]
  );

  const handleUnassignEmployeeFromAssignment = useCallback(
    (employeeId: string, sourceAssignmentId: string) => {
      if (!sourceAssignmentId || sourceAssignmentId === 'unassigned') return;

      pushHistory();

      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id === sourceAssignmentId) {
            return {
              ...a,
              assignedEmployeeIds: a.assignedEmployeeIds.filter((id) => id !== employeeId),
              status: 'modified',
            };
          }
          return a;
        })
      );

      setWeeks((prevWeeks) =>
        prevWeeks.map((w, idx) =>
          idx === currentWeekIndex
            ? { ...w, draftChangesCount: w.draftChangesCount + 1, isPublished: false }
            : w
        )
      );
    },
    [pushHistory, currentWeekIndex]
  );

  const handleRemoveEmployeeFromAssignment = (employeeId: string) => {
    if (!selectedAssignmentId) return;
    pushHistory();

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === selectedAssignmentId) {
          return {
            ...a,
            assignedEmployeeIds: a.assignedEmployeeIds.filter((id) => id !== employeeId),
            status: 'modified',
          };
        }
        return a;
      })
    );
  };

  const handleApplyTeamRecommendation = useCallback(
    (
      worksiteId: string,
      date: string,
      employeeIds: string[],
      vehicleIds: string[],
      equipmentIds: string[]
    ) => {
      pushHistory();

      const existingIndex = assignments.findIndex(
        (a) => a.worksiteId === worksiteId && a.date === date
      );

      if (existingIndex >= 0) {
        setAssignments((prev) =>
          prev.map((a, idx) => {
            if (idx === existingIndex) {
              return {
                ...a,
                assignedEmployeeIds: Array.from(
                  new Set([...a.assignedEmployeeIds, ...employeeIds])
                ),
                assignedVehicleIds: Array.from(
                  new Set([...a.assignedVehicleIds, ...vehicleIds])
                ),
                assignedEquipmentIds: Array.from(
                  new Set([...a.assignedEquipmentIds, ...equipmentIds])
                ),
                status: 'modified',
              };
            }
            return a;
          })
        );
        setSelectedAssignmentId(assignments[existingIndex].id);
      } else {
        const worksiteObj = worksites.find((w) => w.id === worksiteId);
        const newAsg: WorksiteAssignment = {
          id: `asg-rec-${Date.now()}`,
          worksiteId,
          date,
          startTime: '07:00',
          endTime: '15:30',
          activityName: worksiteObj ? worksiteObj.name : 'Baustellenarbeiten',
          assignedEmployeeIds: employeeIds,
          assignedVehicleIds: vehicleIds,
          assignedEquipmentIds: equipmentIds,
          status: 'draft',
        };
        setAssignments((prev) => [...prev, newAsg]);
        setSelectedAssignmentId(newAsg.id);
      }
    },
    [assignments, worksites, pushHistory]
  );

  const handleAddVehicleToAssignment = (vehicleId: string) => {
    if (!selectedAssignmentId) return;
    pushHistory();

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === selectedAssignmentId && !a.assignedVehicleIds.includes(vehicleId)) {
          return {
            ...a,
            assignedVehicleIds: [...a.assignedVehicleIds, vehicleId],
            status: 'modified',
          };
        }
        return a;
      })
    );
  };

  const handleRemoveVehicleFromAssignment = (vehicleId: string) => {
    if (!selectedAssignmentId) return;
    pushHistory();

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === selectedAssignmentId) {
          return {
            ...a,
            assignedVehicleIds: a.assignedVehicleIds.filter((id) => id !== vehicleId),
            status: 'modified',
          };
        }
        return a;
      })
    );
  };

  const handleAddEquipmentToAssignment = (equipmentId: string) => {
    if (!selectedAssignmentId) return;
    pushHistory();

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === selectedAssignmentId && !a.assignedEquipmentIds.includes(equipmentId)) {
          return {
            ...a,
            assignedEquipmentIds: [...a.assignedEquipmentIds, equipmentId],
            status: 'modified',
          };
        }
        return a;
      })
    );
  };

  const handleRemoveEquipmentFromAssignment = (equipmentId: string) => {
    if (!selectedAssignmentId) return;
    pushHistory();

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === selectedAssignmentId) {
          return {
            ...a,
            assignedEquipmentIds: a.assignedEquipmentIds.filter((id) => id !== equipmentId),
            status: 'modified',
          };
        }
        return a;
      })
    );
  };

  const handleTimeChange = (startTime: string, endTime: string) => {
    if (!selectedAssignmentId) return;
    pushHistory();

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === selectedAssignmentId) {
          return {
            ...a,
            startTime,
            endTime,
            status: 'modified',
          };
        }
        return a;
      })
    );
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    pushHistory();
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    if (selectedAssignmentId === assignmentId) {
      setSelectedAssignmentId(null);
    }
  };

  const handleQuickAssignEmployee = (employee: Employee) => {
    if (selectedAssignmentId) {
      handleAddEmployeeToAssignment(employee.id);
    } else if (filteredAssignments.length > 0) {
      const targetAsg = filteredAssignments[0];
      setSelectedAssignmentId(targetAsg.id);
      pushHistory();
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === targetAsg.id && !a.assignedEmployeeIds.includes(employee.id)
            ? { ...a, assignedEmployeeIds: [...a.assignedEmployeeIds, employee.id] }
            : a
        )
      );
    }
  };

  const handleQuickAssignResource = (resource: Vehicle | Equipment) => {
    if (selectedAssignmentId) {
      if ('licensePlate' in resource) {
        handleAddVehicleToAssignment(resource.id);
      } else {
        handleAddEquipmentToAssignment(resource.id);
      }
    }
  };

  const handleConfirmPublish = () => {
    setWeeks((prev) =>
      prev.map((w, idx) =>
        idx === currentWeekIndex
          ? {
              ...w,
              isPublished: true,
              draftChangesCount: 0,
              lastModified: 'Soeben veröffentlicht',
            }
          : w
      )
    );

    setAssignments((prev) =>
      prev.map((a) =>
        a.date >= currentWeek.startDate && a.date <= currentWeek.endDate
          ? { ...a, status: 'published' }
          : a
      )
    );

    setIsPublishModalOpen(false);
  };

  // ALL SKILLS & ROLES FOR FILTERING
  const allSkills = useMemo(() => {
    return Array.from(new Set(employees.flatMap((e) => e.skills)));
  }, [employees]);

  const allRoles = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.role)));
  }, [employees]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.selectedRole) count++;
    if (filters.selectedSkill) count++;
    if (filters.selectedWorksiteId) count++;
    if (filters.onlyConflicts) count++;
    if (filters.onlyUnassigned) count++;
    return count;
  }, [filters]);

  const handleExportCSV = useCallback(() => {
    exportWeekAssignmentsToCSV({
      currentWeek,
      assignments,
      worksites,
      employees,
      vehicles,
      equipment,
    });
  }, [currentWeek, assignments, worksites, employees, vehicles, equipment]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDarkMode
          ? 'bg-[#0C0C0C] text-[#F2F4F5] dark'
          : 'bg-slate-50 text-slate-900 light'
      }`}
    >
      {/* 1. TOP COMMAND BAR */}
      <TopCommandBar
        currentWeek={currentWeek}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
        draftChangesCount={currentWeek.draftChangesCount}
        onUndo={handleUndo}
        canUndo={pastAssignments.length > 0}
        onRedo={handleRedo}
        canRedo={futureAssignments.length > 0}
        onPublish={() => setIsPublishModalOpen(true)}
        blockingConflictsCount={blockingConflictsCount}
        simulatedRole={simulatedRole}
        onRoleToggle={setSimulatedRole}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenQuickAdd={() => handleOpenQuickAdd()}
        onExportCSV={handleExportCSV}
        showSummaryTiles={showSummaryTiles}
        onToggleSummaryTiles={() => setShowSummaryTiles((prev) => !prev)}
      />

      {/* 2. SUMMARY TILES (OPTIONAL BENTO GRID) */}
      {showSummaryTiles && (
        <SummaryTiles
          metrics={metrics}
          onFilterConflicts={() => setFilters((f) => ({ ...f, onlyConflicts: !f.onlyConflicts }))}
          onFilterUnassigned={() =>
            setFilters((f) => ({ ...f, onlyUnassigned: !f.onlyUnassigned }))
          }
          onFilterResources={() => setIsFilterModalOpen(true)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 3. MAIN WORKSPACE VIEW (MONTH CALENDAR / 1W / 4W) */}
      <main className="flex-1 overflow-x-hidden">
        {activeView === 'MONTH' ? (
          <MonthCalendarView
            currentMonthDate={currentMonthDate}
            onMonthChange={setCurrentMonthDate}
            assignments={filteredAssignments}
            worksites={worksites}
            employees={employees}
            vehicles={vehicles}
            equipment={equipment}
            weatherData={weatherData}
            calendarFilters={calendarFilters}
            onUpdateCalendarFilters={(f) => setCalendarFilters((prev) => ({ ...prev, ...f }))}
            onSelectAssignment={(id) => setSelectedAssignmentId(id)}
            onOpenQuickAdd={(date) => handleOpenQuickAdd(date)}
            conflicts={allConflicts}
            isDarkMode={isDarkMode}
          />
        ) : activeView === '1W' ? (
          <WeeklyPlanner
            currentWeek={currentWeek}
            assignments={filteredAssignments}
            worksites={worksites}
            employees={employees}
            absences={absences}
            vehicles={vehicles}
            equipment={equipment}
            conflicts={weeklyConflicts}
            weatherData={weatherData}
            onSelectAssignment={(asg) => setSelectedAssignmentId(asg.id)}
            onAddAssignment={handleAddAssignment}
            onQuickAssignEmployee={handleQuickAssignEmployee}
            onQuickAssignResource={handleQuickAssignResource}
            onAddEmployeeToAssignment={(asg) => setSelectedAssignmentId(asg.id)}
            onSwapEmployeesInAssignment={(asg) => setSelectedAssignmentId(asg.id)}
            onDeleteAssignment={handleDeleteAssignment}
            onFilterWeatherConflicts={() =>
              setFilters((f) => ({ ...f, onlyWarnings: !f.onlyWarnings }))
            }
            onMoveEmployee={handleMoveEmployeeBetweenAssignments}
            onUnassignEmployee={handleUnassignEmployeeFromAssignment}
          />
        ) : activeView === '4W' ? (
          <FourWeekPlanner
            weeks={weeks}
            assignments={assignments}
            employees={employees}
            worksites={worksites}
            onSelectWeek={(weekIdx) => {
              setCurrentWeekIndex(weekIdx);
              setActiveView('1W');
            }}
          />
        ) : activeView === 'SKILLS' ? (
          <SkillsMatrixDashboard
            employees={employees}
            worksites={worksites}
            assignments={assignments}
            vehicles={vehicles}
            equipment={equipment}
            absences={absences}
            onSelectWorksite={(wsId) => {
              const asg = assignments.find((a) => a.worksiteId === wsId);
              if (asg) setSelectedAssignmentId(asg.id);
            }}
            onAssignEmployeeQuick={handleQuickAssignEmployee}
            onUpdateWorksite={handleUpdateWorksite}
            onApplyTeamRecommendation={handleApplyTeamRecommendation}
            isDarkMode={isDarkMode}
          />
        ) : (
          <MasterDataView
            employees={employees}
            worksites={worksites}
            vehicles={vehicles}
            equipment={equipment}
            assignments={assignments}
            statusOptions={statusOptions}
            employmentTypeOptions={employmentTypeOptions}
            onAddStatusOption={handleAddStatusOption}
            onAddEmploymentTypeOption={handleAddEmploymentTypeOption}
            onCreateEmployee={handleCreateEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onCreateVehicle={handleCreateVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onCreateEquipment={handleCreateEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onCreateWorksite={handleCreateWorksite}
            onUpdateWorksite={handleUpdateWorksite}
            onMarkCommentRead={handleMarkCommentRead}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* 4. CONTEXTUAL WORKSITE DETAIL DRAWER */}
      <WorksiteDetailDrawer
        assignment={selectedAssignment}
        worksite={selectedWorksite}
        assignedEmployees={selectedAssignedEmployees}
        allEmployees={employees}
        assignedVehicles={selectedAssignedVehicles}
        allVehicles={vehicles}
        assignedEquipment={selectedAssignedEquipment}
        allEquipment={equipment}
        conflicts={weeklyConflicts}
        weather={selectedWeather}
        weatherData={weatherData}
        onClose={() => setSelectedAssignmentId(null)}
        onAddEmployee={handleAddEmployeeToAssignment}
        onRemoveEmployee={handleRemoveEmployeeFromAssignment}
        onAddVehicle={handleAddVehicleToAssignment}
        onRemoveVehicle={handleRemoveVehicleFromAssignment}
        onAddEquipment={handleAddEquipmentToAssignment}
        onRemoveEquipment={handleRemoveEquipmentFromAssignment}
        onTimeChange={handleTimeChange}
        onDeleteAssignment={handleDeleteAssignment}
      />

      {/* 5. PUBLICATION CONFIRMATION MODAL */}
      {isPublishModalOpen && (
        <PublishModal
          currentWeek={currentWeek}
          conflicts={weeklyConflicts}
          assignedEmployeesCount={
            new Set(
              assignments
                .filter(
                  (a) => a.date >= currentWeek.startDate && a.date <= currentWeek.endDate
                )
                .flatMap((a) => a.assignedEmployeeIds)
            ).size
          }
          onClose={() => setIsPublishModalOpen(false)}
          onConfirmPublish={handleConfirmPublish}
        />
      )}

      {/* 6. FILTER MODAL */}
      {isFilterModalOpen && (
        <FilterModal
          filters={filters}
          worksites={worksites}
          allSkills={allSkills}
          allRoles={allRoles}
          onUpdateFilters={setFilters}
          onResetFilters={() =>
            setFilters({
              searchTerm: '',
              onlyConflicts: false,
              onlyUnassigned: false,
              onlyAbsent: false,
              onlyWarnings: false,
            })
          }
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}

      {/* 7. QUICK ADD MODAL */}
      {isQuickAddOpen && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          defaultDate={quickAddDefaultDate}
          worksites={worksites}
          employees={employees}
          vehicles={vehicles}
          equipment={equipment}
          onAddAssignment={handleQuickAddSubmit}
          onAddWorksite={handleAddWorksite}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
