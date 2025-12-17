const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ROLES = ['student', 'teacher', 'admin'];

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  batch: user.batch,
});

const register = async (req, res) => {
  const { name, email, password, role = 'student', department, batch } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const safeRole = ROLES.includes(role) ? role : 'student';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: safeRole,
      department,
      batch,
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Self-registration endpoint for students and teachers only
 * Admin role is explicitly rejected for security
 */
const selfRegister = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    batch,
    phone,
    registrationNumber, // Student-only
    semester, // Student-only
    employeeId, // Teacher-only
    designation, // Teacher-only
  } = req.body;

  try {
    // Validate required common fields
    if (!name || !email || !password || !role || !department || !batch || !phone) {
      return res.status(400).json({
        message: 'Name, email, password, role, department, batch, and phone are required',
      });
    }

    // SECURITY: Explicitly reject admin role
    if (role === 'admin') {
      return res.status(403).json({
        message: 'Admin role cannot be self-registered. Please contact system administrator.',
      });
    }

    // Validate role is student or teacher only
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Only student and teacher roles are allowed for self-registration.',
      });
    }

    // Validate role-specific required fields
    if (role === 'student') {
      if (!registrationNumber || !semester) {
        return res.status(400).json({
          message: 'Registration number and semester are required for students',
        });
      }
    }

    if (role === 'teacher') {
      if (!employeeId || !designation) {
        return res.status(400).json({
          message: 'Employee ID and designation are required for teachers',
        });
      }
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check for duplicate registration number (students)
    if (role === 'student' && registrationNumber) {
      const existingReg = await User.findOne({ registrationNumber });
      if (existingReg) {
        return res.status(400).json({ message: 'Registration number already exists' });
      }
    }

    // Check for duplicate employee ID (teachers)
    if (role === 'teacher' && employeeId) {
      const existingEmp = await User.findOne({ employeeId });
      if (existingEmp) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role-specific fields
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      department,
      batch,
      phone,
    };

    // Add role-specific fields
    if (role === 'student') {
      userData.registrationNumber = registrationNumber;
      userData.semester = semester;
      userData.rollNumber = registrationNumber; // Also set rollNumber for backward compatibility
    }

    if (role === 'teacher') {
      userData.employeeId = employeeId;
      userData.designation = designation;
    }

    // Create user with default permissions (empty array - no admin permissions)
    const user = await User.create(userData);

    // Generate JWT token
    const token = generateToken(user);

    // Return token and formatted user
    res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field} already exists`,
      });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, selfRegister };

