import { describe, it, expect } from 'vitest';
import { detectConflicts, calculateHours } from '../domain/conflictEngine';
import {
  getEmployeeCapacitySummaries,
  getWorksitePersonHours,
  getResourceUtilization,
} from '../domain/capacityEngine';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ABSENCES,
  INITIAL_WORKSITES,
  INITIAL_VEHICLES,
  INITIAL_EQUIPMENT,
  INITIAL_ASSIGNMENTS,
  INITIAL_WEEKS,
} from '../data/mockData';
import { WorksiteAssignment } from '../types';

describe('Arboscus Workforce Planning - Domain Rules Tests', () => {
  it('should accurately calculate assignment hours from start and end times', () => {
    expect(calculateHours('07:00', '15:30')).toBe(8.5);
    expect(calculateHours('07:30', '16:00')).toBe(8.5);
    expect(calculateHours('07:00', '14:00')).toBe(7.0);
  });

  it('should detect an absence conflict when an absent employee is assigned', () => {
    // Thomas Berger (emp-7) is absent on 2026-09-14
    const testAssignments: WorksiteAssignment[] = [
      {
        id: 'test-asg-1',
        worksiteId: 'site-1',
        date: '2026-09-14',
        startTime: '07:00',
        endTime: '15:30',
        activityName: 'Test Activity',
        assignedEmployeeIds: ['emp-7'], // Thomas Berger on leave
        assignedVehicleIds: [],
        assignedEquipmentIds: [],
        status: 'draft',
      },
    ];

    const conflicts = detectConflicts(
      testAssignments,
      INITIAL_EMPLOYEES,
      INITIAL_ABSENCES,
      INITIAL_WORKSITES,
      INITIAL_EQUIPMENT,
      INITIAL_VEHICLES
    );

    const absConflict = conflicts.find((c) => c.type === 'absence_conflict');
    expect(absConflict).toBeDefined();
    expect(absConflict?.severity).toBe('blocking');
    expect(absConflict?.affectedEmployeeIds).toContain('emp-7');
  });

  it('should detect a double-booking conflict when an employee is on two overlapping assignments', () => {
    const testAssignments: WorksiteAssignment[] = [
      {
        id: 'test-asg-1',
        worksiteId: 'site-1',
        date: '2026-09-15',
        startTime: '07:00',
        endTime: '15:30',
        activityName: 'Site 1 Work',
        assignedEmployeeIds: ['emp-1'], // Martin Schuster
        assignedVehicleIds: [],
        assignedEquipmentIds: [],
        status: 'draft',
      },
      {
        id: 'test-asg-2',
        worksiteId: 'site-2',
        date: '2026-09-15',
        startTime: '08:00',
        endTime: '16:00',
        activityName: 'Site 2 Work',
        assignedEmployeeIds: ['emp-1'], // Martin Schuster assigned again
        assignedVehicleIds: [],
        assignedEquipmentIds: [],
        status: 'draft',
      },
    ];

    const conflicts = detectConflicts(
      testAssignments,
      INITIAL_EMPLOYEES,
      INITIAL_ABSENCES,
      INITIAL_WORKSITES,
      INITIAL_EQUIPMENT,
      INITIAL_VEHICLES
    );

    const dbConflict = conflicts.find((c) => c.type === 'double_booking');
    expect(dbConflict).toBeDefined();
    expect(dbConflict?.severity).toBe('blocking');
    expect(dbConflict?.affectedEmployeeIds).toContain('emp-1');
  });

  it('should detect a resource double-booking for exclusive equipment', () => {
    const testAssignments: WorksiteAssignment[] = [
      {
        id: 'test-asg-1',
        worksiteId: 'site-1',
        date: '2026-09-16',
        startTime: '07:00',
        endTime: '15:30',
        activityName: 'Site 1 Work',
        assignedEmployeeIds: ['emp-1'],
        assignedVehicleIds: [],
        assignedEquipmentIds: ['eq-1'], // Ruthmann Hubarbeitsbühne (Exclusive)
        status: 'draft',
      },
      {
        id: 'test-asg-2',
        worksiteId: 'site-2',
        date: '2026-09-16',
        startTime: '07:00',
        endTime: '15:30',
        activityName: 'Site 2 Work',
        assignedEmployeeIds: ['emp-2'],
        assignedVehicleIds: [],
        assignedEquipmentIds: ['eq-1'], // Same Exclusive Equipment
        status: 'draft',
      },
    ];

    const conflicts = detectConflicts(
      testAssignments,
      INITIAL_EMPLOYEES,
      INITIAL_ABSENCES,
      INITIAL_WORKSITES,
      INITIAL_EQUIPMENT,
      INITIAL_VEHICLES
    );

    const eqConflict = conflicts.find((c) => c.type === 'resource_double_booking');
    expect(eqConflict).toBeDefined();
    expect(eqConflict?.severity).toBe('blocking');
    expect(eqConflict?.affectedResourceId).toBe('eq-1');
  });

  it('should correctly sum planned weekly hours and calculate person-hours per site', () => {
    const capacities = getEmployeeCapacitySummaries(
      INITIAL_EMPLOYEES,
      INITIAL_ASSIGNMENTS,
      INITIAL_ABSENCES,
      '2026-09-14',
      '2026-09-18'
    );

    const martinCap = capacities.find((c) => c.employeeId === 'emp-1');
    expect(martinCap).toBeDefined();
    expect(martinCap?.plannedHours).toBeGreaterThan(0);

    const site1Hours = getWorksitePersonHours('site-1', INITIAL_ASSIGNMENTS);
    expect(site1Hours.totalPersonHours).toBeGreaterThan(0);
    expect(site1Hours.totalAssignedPeople).toBeGreaterThan(0);
  });

  it('should verify that four-week horizon contains exactly 4 weeks', () => {
    expect(INITIAL_WEEKS.length).toBe(4);
    expect(INITIAL_WEEKS[0].weekNumber).toBe(38);
    expect(INITIAL_WEEKS[1].weekNumber).toBe(39);
    expect(INITIAL_WEEKS[2].weekNumber).toBe(40);
    expect(INITIAL_WEEKS[3].weekNumber).toBe(41);
  });

  it('should verify that domain models contain NO cost or monetary fields in MVP', () => {
    const sampleEmployee = INITIAL_EMPLOYEES[0] as any;
    expect(sampleEmployee.hourlyRate).toBeUndefined();
    expect(sampleEmployee.wage).toBeUndefined();
    expect(sampleEmployee.cost).toBeUndefined();

    const sampleWorksite = INITIAL_WORKSITES[0] as any;
    expect(sampleWorksite.budget).toBeUndefined();
    expect(sampleWorksite.revenue).toBeUndefined();
  });
});
