const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const AcademicRecord = require('../models/AcademicRecord');
const Classroom = require('../models/Classroom');
const { calcCGPA } = require('../utils/grades');

const allowedRoles = ['student', 'teacher', 'admin'];

const getUsers = async (req, res) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by registration number (rollNumber)
    if (req.query.regNo) {
      query.rollNumber = req.query.regNo;
    }

    let users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // If filtering by CGPA or SGPA, we need to calculate and filter
    if (req.query.cgpaMin || req.query.cgpaMax || req.query.sgpaLt || req.query.sgpaGt) {
      const filteredUsers = [];

      for (const user of users) {
        if (user.role !== 'student') {
          // Only apply CGPA/SGPA filters to students
          if (!req.query.cgpaMin && !req.query.cgpaMax) {
            filteredUsers.push(user);
          }
          continue;
        }

        // Get all academic records for this student
        const records = await AcademicRecord.find({ student: user._id }).sort({ semester: 1 });
        const cgpa = calcCGPA(records);

        // Filter by CGPA range
        if (req.query.cgpaMin && cgpa < parseFloat(req.query.cgpaMin)) {
          continue;
        }
        if (req.query.cgpaMax && cgpa > parseFloat(req.query.cgpaMax)) {
          continue;
        }

        // Filter by SGPA thresholds
        if (req.query.sgpaLt || req.query.sgpaGt) {
          const latestRecord = records[records.length - 1];
          if (!latestRecord || !latestRecord.sgpa) {
            // If no SGPA, skip if filtering by SGPA
            if (req.query.sgpaLt || req.query.sgpaGt) {
              continue;
            }
          } else {
            if (req.query.sgpaLt && latestRecord.sgpa >= parseFloat(req.query.sgpaLt)) {
              continue;
            }
            if (req.query.sgpaGt && latestRecord.sgpa <= parseFloat(req.query.sgpaGt)) {
              continue;
            }
          }
        }

        // Add CGPA to user object for frontend
        const userObj = user.toObject();
        userObj.cgpa = cgpa;
        filteredUsers.push(userObj);
      }

      users = filteredUsers;
    } else {
      // If not filtering by CGPA/SGPA, still add CGPA to student objects for convenience
      const usersWithCGPA = await Promise.all(
        users.map(async (user) => {
          if (user.role === 'student') {
            const records = await AcademicRecord.find({ student: user._id });
            const cgpa = calcCGPA(records);
            const userObj = user.toObject();
            userObj.cgpa = cgpa;
            return userObj;
          }
          return user.toObject();
        })
      );
      users = usersWithCGPA;
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addUser = async (req, res) => {
  const { name, email, password = 'Welcome@123', role = 'student', department, batch } =
    req.body;
  try {
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: allowedRoles.includes(role) ? role : 'student',
      department,
      batch,
    });
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      batch: user.batch,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/users/:id/permissions
 * Set permissions for a teacher user (admin only)
 */
const setPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'Permissions can only be set for teachers' });
    }

    // Validate permission names
    const validPermissions = ['viewMarks', 'editMarks'];
    const invalidPermissions = permissions.filter((p) => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
      });
    }

    user.permissions = permissions;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Classroom Management Functions

// Get all classrooms
const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate('teacher', 'name email')
      .populate('students', 'name email rollNumber department batch')
      .sort({ createdAt: -1 });

    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create classroom (admin can assign teacher)
const createClassroom = async (req, res) => {
  try {
    const { name, description, section, department, teacherId } = req.body;

    if (!name || !section || !department || !teacherId) {
      return res.status(400).json({ message: 'Name, section, department, and teacher are required' });
    }

    // Verify teacher exists and is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    const classroom = new Classroom({
      name,
      description,
      section,
      department,
      teacher: teacherId,
      code
    });

    await classroom.save();
    await classroom.populate('teacher', 'name email');
    await classroom.populate('students', 'name email rollNumber');

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update classroom (admin can change teacher)
const updateClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, section, department, teacherId } = req.body;

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // If teacherId is provided, verify it's a valid teacher
    if (teacherId) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Invalid teacher ID' });
      }
      classroom.teacher = teacherId;
    }

    // Update other fields
    if (name) classroom.name = name;
    if (description !== undefined) classroom.description = description;
    if (section) classroom.section = section;
    if (department) classroom.department = department;

    await classroom.save();
    await classroom.populate('teacher', 'name email');
    await classroom.populate('students', 'name email rollNumber');

    res.status(200).json({
      message: 'Classroom updated successfully',
      classroom
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete classroom
const deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findByIdAndDelete(id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add student to classroom
const addStudentToClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    if (classroom.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already in classroom' });
    }

    classroom.students.push(studentId);
    await classroom.save();
    await classroom.populate('teacher', 'name email');
    await classroom.populate('students', 'name email rollNumber department batch');

    res.status(200).json({
      message: 'Student added to classroom',
      classroom
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove student from classroom
const removeStudentFromClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    classroom.students = classroom.students.filter(
      id => id.toString() !== studentId
    );
    await classroom.save();
    await classroom.populate('teacher', 'name email');
    await classroom.populate('students', 'name email rollNumber department batch');

    res.status(200).json({
      message: 'Student removed from classroom',
      classroom
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  addUser,
  deleteUser,
  setPermissions,
  getAllClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  addStudentToClassroom,
  removeStudentFromClassroom
};

