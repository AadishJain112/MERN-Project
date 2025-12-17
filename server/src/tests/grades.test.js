// backend/tests/grades.test.js
const { calcSubjectTotal, calcSGPA, calcCGPA } = require('../utils/grades');

describe('Grades Utilities', () => {
  describe('calcSubjectTotal', () => {
    test('should calculate total correctly', () => {
      expect(calcSubjectTotal(30, 50)).toBe(80);
      expect(calcSubjectTotal(25, 25)).toBe(50);
      expect(calcSubjectTotal(0, 0)).toBe(0);
      expect(calcSubjectTotal(100, 100)).toBe(200);
    });

    test('should handle decimal values', () => {
      expect(calcSubjectTotal(30.5, 49.5)).toBe(80);
      expect(calcSubjectTotal(25.25, 25.75)).toBe(51);
    });

    test('should throw error for invalid input types', () => {
      expect(() => calcSubjectTotal('30', 50)).toThrow('Marks must be numbers');
      expect(() => calcSubjectTotal(30, '50')).toThrow('Marks must be numbers');
      expect(() => calcSubjectTotal(null, 50)).toThrow('Marks must be numbers');
    });

    test('should throw error for marks out of range', () => {
      expect(() => calcSubjectTotal(-1, 50)).toThrow('Marks must be between 0 and 100');
      expect(() => calcSubjectTotal(101, 50)).toThrow('Marks must be between 0 and 100');
      expect(() => calcSubjectTotal(30, -1)).toThrow('Marks must be between 0 and 100');
      expect(() => calcSubjectTotal(30, 101)).toThrow('Marks must be between 0 and 100');
    });
  });

  describe('calcSGPA', () => {
    test('should calculate SGPA correctly for single subject', () => {
      const subjects = [{ total: 80 }];
      expect(calcSGPA(subjects)).toBe(8.0);
    });

    test('should calculate SGPA correctly for multiple subjects', () => {
      const subjects = [
        { total: 80 },
        { total: 90 },
        { total: 70 },
      ];
      // (8.0 + 9.0 + 7.0) / 3 = 8.0
      expect(calcSGPA(subjects)).toBe(8.0);
    });

    test('should handle edge cases', () => {
      expect(calcSGPA([{ total: 0 }])).toBe(0);
      expect(calcSGPA([{ total: 100 }])).toBe(10.0);
    });

    test('should round to 2 decimal places', () => {
      const subjects = [
        { total: 85 },
        { total: 87 },
      ];
      // (8.5 + 8.7) / 2 = 8.6
      expect(calcSGPA(subjects)).toBe(8.6);
    });

    test('should throw error for empty array', () => {
      expect(() => calcSGPA([])).toThrow('Subjects array is required and must not be empty');
    });

    test('should throw error for invalid subject totals', () => {
      expect(() => calcSGPA([{ total: '80' }])).toThrow('Each subject must have a numeric total');
      expect(() => calcSGPA([{ total: -1 }])).toThrow('Subject total must be between 0 and 100');
      expect(() => calcSGPA([{ total: 101 }])).toThrow('Subject total must be between 0 and 100');
    });
  });

  describe('calcCGPA', () => {
    test('should calculate CGPA correctly', () => {
      const records = [
        { sgpa: 8.0 },
        { sgpa: 9.0 },
        { sgpa: 7.5 },
      ];
      // (8.0 + 9.0 + 7.5) / 3 = 8.17
      expect(calcCGPA(records)).toBe(8.17);
    });

    test('should return 0 for empty array', () => {
      expect(calcCGPA([])).toBe(0);
    });

    test('should ignore records with invalid SGPA', () => {
      const records = [
        { sgpa: 8.0 },
        { sgpa: null },
        { sgpa: 9.0 },
        { sgpa: undefined },
      ];
      // (8.0 + 9.0) / 2 = 8.5
      expect(calcCGPA(records)).toBe(8.5);
    });

    test('should throw error for non-array input', () => {
      expect(() => calcCGPA(null)).toThrow('Academic records must be an array');
      expect(() => calcCGPA({})).toThrow('Academic records must be an array');
    });

    test('should throw error for SGPA out of range', () => {
      expect(() => calcCGPA([{ sgpa: -1 }])).toThrow('SGPA must be between 0 and 10');
      expect(() => calcCGPA([{ sgpa: 11 }])).toThrow('SGPA must be between 0 and 10');
    });

    test('should round to 2 decimal places', () => {
      const records = [
        { sgpa: 8.333 },
        { sgpa: 9.666 },
      ];
      // (8.333 + 9.666) / 2 = 8.9995 -> 9.0
      expect(calcCGPA(records)).toBe(9.0);
    });
  });
});

