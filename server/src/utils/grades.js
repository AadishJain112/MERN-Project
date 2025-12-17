// backend/utils/grades.js

/**
 * Calculate total marks for a subject
 * @param {number} internal - Internal marks (0-100)
 * @param {number} endTerm - End term marks (0-100)
 * @returns {number} Total marks (0-100)
 */
const calcSubjectTotal = (internal, endTerm) => {
  if (typeof internal !== 'number' || typeof endTerm !== 'number') {
    throw new Error('Marks must be numbers');
  }
  if (internal < 0 || internal > 100 || endTerm < 0 || endTerm > 100) {
    throw new Error('Marks must be between 0 and 100');
  }
  return Math.round((internal + endTerm) * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate SGPA (Semester Grade Point Average)
 * Uses weighted average: SGPA = (sum(subjectScore/10)) / numSubjects
 * Assumes equal credits for each subject, 10-point scale
 * @param {Array} subjects - Array of subject objects with 'total' field
 * @returns {number} SGPA (0-10)
 */
const calcSGPA = (subjects) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error('Subjects array is required and must not be empty');
  }

  let totalPoints = 0;
  let validSubjects = 0;

  subjects.forEach((subject) => {
    if (typeof subject.total !== 'number') {
      throw new Error('Each subject must have a numeric total');
    }
    if (subject.total < 0 || subject.total > 100) {
      throw new Error('Subject total must be between 0 and 100');
    }
    // Convert marks (0-100) to grade points (0-10)
    // Assuming linear mapping: 100 marks = 10 points
    const gradePoints = subject.total / 10;
    totalPoints += gradePoints;
    validSubjects++;
  });

  if (validSubjects === 0) {
    return 0;
  }

  const sgpa = totalPoints / validSubjects;
  return Math.round(sgpa * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate CGPA (Cumulative Grade Point Average)
 * Average of all SGPA values from academic records
 * @param {Array} academicRecords - Array of AcademicRecord objects with 'sgpa' field
 * @returns {number} CGPA (0-10)
 */
const calcCGPA = (academicRecords) => {
  if (!Array.isArray(academicRecords)) {
    throw new Error('Academic records must be an array');
  }

  if (academicRecords.length === 0) {
    return 0;
  }

  let totalSGPA = 0;
  let validRecords = 0;

  academicRecords.forEach((record) => {
    if (typeof record.sgpa === 'number' && !isNaN(record.sgpa)) {
      if (record.sgpa < 0 || record.sgpa > 10) {
        throw new Error('SGPA must be between 0 and 10');
      }
      totalSGPA += record.sgpa;
      validRecords++;
    }
  });

  if (validRecords === 0) {
    return 0;
  }

  const cgpa = totalSGPA / validRecords;
  return Math.round(cgpa * 100) / 100; // Round to 2 decimal places
};

module.exports = {
  calcSubjectTotal,
  calcSGPA,
  calcCGPA,
};

