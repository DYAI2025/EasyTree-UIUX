import { describe, it, expect } from 'vitest';
import {
  calculateSkillMatch,
  getRecommendedEmployeesForWorksite,
  filterEmployeesBySkills,
} from '../domain/skillRecommendationEngine';
import { Employee, Worksite } from '../types';

describe('Skill Recommendation Engine', () => {
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
      skills: ['SKT-A', 'AS Baum 1'],
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

  it('calculates skill match correctly for an employee', () => {
    const match = calculateSkillMatch(mockEmployees[0], mockWorksite.requiredSkills);
    expect(match.matchScorePercent).toBe(100);
    expect(match.isFullyQualified).toBe(true);
    expect(match.missingSkills.length).toBe(0);

    const partialMatch = calculateSkillMatch(mockEmployees[1], mockWorksite.requiredSkills);
    expect(partialMatch.matchScorePercent).toBe(33); // 1 matching out of 3
    expect(partialMatch.isFullyQualified).toBe(false);
    expect(partialMatch.matchingSkills).toContain('AS Baum 1');
    expect(partialMatch.missingSkills).toContain('SKT-B');
    expect(partialMatch.missingSkills).toContain('Ersthelfer');
  });

  it('ranks recommended employees for a worksite based on skill match', () => {
    const recommendations = getRecommendedEmployeesForWorksite(mockWorksite, mockEmployees);
    expect(recommendations.length).toBe(3);
    expect(recommendations[0].employee.id).toBe('emp_1'); // 100%
    expect(recommendations[1].employee.id).toBe('emp_3'); // 67% (2/3)
    expect(recommendations[2].employee.id).toBe('emp_2'); // 33% (1/3)
  });

  it('filters employees requiring all skills', () => {
    const fullyQualified = filterEmployeesBySkills(mockEmployees, ['AS Baum 1', 'Ersthelfer'], 'all');
    expect(fullyQualified.length).toBe(2); // emp_1 and emp_3
    expect(fullyQualified.map(e => e.id)).toContain('emp_1');
    expect(fullyQualified.map(e => e.id)).toContain('emp_3');
  });

  it('filters employees requiring any skill', () => {
    const sktAorB = filterEmployeesBySkills(mockEmployees, ['SKT-A', 'SKT-B'], 'any');
    expect(sktAorB.length).toBe(2); // emp_1 (SKT-B) and emp_2 (SKT-A)
  });
});
