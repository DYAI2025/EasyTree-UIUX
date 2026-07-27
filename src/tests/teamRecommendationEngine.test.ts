import { describe, it, expect } from 'vitest';
import {
  getFreeEmployeesOnDate,
  getFreeVehiclesOnDate,
  getFreeEquipmentOnDate,
  computeTeamRecommendation,
} from '../domain/teamRecommendationEngine';
import {
  Employee,
  Worksite,
  Vehicle,
  Equipment,
  WorksiteAssignment,
  Absence,
} from '../types';

describe('Team Recommendation Engine', () => {
  const mockEmployees: Employee[] = [
    {
      id: 'emp_1',
      firstName: 'Martin',
      lastName: 'Schuster',
      role: 'Teamleiter',
      statusId: 'emp-status-1',
      employmentTypeId: 'emp-type-1',
      isLeader: true,
      skills: ['SKT-B', 'AS Baum 1', 'Ersthelfer'],
      maxWeeklyHours: 40,
      initials: 'MS',
      email: 'm.schuster@arboscus.de',
      phone: '0171 1234567',
    },
    {
      id: 'emp_2',
      firstName: 'Felix',
      lastName: 'Braun',
      role: 'SKT-Kletterer',
      statusId: 'emp-status-1',
      employmentTypeId: 'emp-type-1',
      isLeader: false,
      skills: ['SKT-A', 'AS Baum 1', 'Häcksler-Bedienung'],
      maxWeeklyHours: 40,
      initials: 'FB',
      email: 'f.braun@arboscus.de',
      phone: '0171 7654321',
    },
    {
      id: 'emp_3',
      firstName: 'Jana',
      lastName: 'Weber',
      role: 'Baumpfleger',
      statusId: 'emp-status-1',
      employmentTypeId: 'emp-type-1',
      isLeader: false,
      skills: ['AS Baum 1', 'Ersthelfer'],
      maxWeeklyHours: 40,
      initials: 'JW',
      email: 'j.weber@arboscus.de',
      phone: '0171 9998887',
    },
  ];

  const mockWorksite: Worksite = {
    id: 'ws_101',
    code: 'BS-101',
    name: 'Park Sanatorium',
    location: 'Potsdam',
    address: 'Kaiser-Friedrich-Str. 12',
    meetingPoint: 'Haupteingang',
    colorKey: 'site-green',
    hexColor: '#10B981',
    description: 'Großbaumfällung mit Häckslereinsatz',
    orderDescription: 'Gefahrenfällung Tanne 28m',
    requiredSkills: ['SKT-B', 'AS Baum 1', 'Ersthelfer'],
    requirements: [],
    todoItems: [],
    comments: [],
  };

  const mockVehicles: Vehicle[] = [
    {
      id: 'veh_1',
      name: 'Unimog U400',
      type: 'Unimog',
      licensePlate: 'P-AG 100',
      nextTuvDate: '2026-12-31',
      status: 'verfügbar',
      quantity: 1,
    },
  ];

  const mockEquipment: Equipment[] = [
    {
      id: 'eq_1',
      name: 'Großhäcksler Jensen',
      category: 'Häcksler',
      quantity: 1,
      isExclusive: true,
      status: 'verfügbar',
    },
  ];

  it('filters free employees correctly considering assignments and absences', () => {
    const assignments: WorksiteAssignment[] = [
      {
        id: 'asg_1',
        worksiteId: 'ws_99',
        date: '2026-08-01',
        startTime: '07:00',
        endTime: '15:30',
        activityName: 'Baumpflegerarbeiten',
        assignedEmployeeIds: ['emp_1'],
        assignedVehicleIds: [],
        assignedEquipmentIds: [],
        status: 'published',
      },
    ];

    const absences: Absence[] = [
      {
        id: 'abs_1',
        employeeId: 'emp_2',
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        type: 'Urlaub',
        status: 'genehmigt',
      },
    ];

    const freeOnAug1 = getFreeEmployeesOnDate('2026-08-01', mockEmployees, assignments, absences);
    // emp_1 is assigned, emp_2 is on vacation, only emp_3 is free
    expect(freeOnAug1.length).toBe(1);
    expect(freeOnAug1[0].id).toBe('emp_3');

    const freeOnAug10 = getFreeEmployeesOnDate('2026-08-10', mockEmployees, assignments, absences);
    expect(freeOnAug10.length).toBe(3);
  });

  it('computes optimal team recommendation matching required skills', () => {
    const result = computeTeamRecommendation(
      mockWorksite,
      '2026-08-10',
      mockEmployees,
      mockVehicles,
      mockEquipment,
      [],
      []
    );

    expect(result.worksite.id).toBe('ws_101');
    expect(result.suggestedLeader?.employee.id).toBe('emp_1');
    expect(result.overallMatchPercent).toBe(100);
    expect(result.coveredSkills).toContain('SKT-B');
    expect(result.coveredSkills).toContain('AS Baum 1');
    expect(result.coveredSkills).toContain('Ersthelfer');
    expect(result.missingSkills.length).toBe(0);
    expect(result.suggestedVehicles.length).toBeGreaterThan(0);
  });
});
