import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendRegistrationEmail, sendPasswordResetEmail } from '../config/emailConfig.js';
import crypto from 'crypto';

// @desc    Student login
// @route   POST /api/auth/student/login
// @access  Public
export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ email }).select('+password');

    if (student && (await student.matchPassword(password))) {
      res.json({
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        phone: student.phone,
        type: student.type,
        department: student.department,
        semester: student.semester,
        token: generateToken(student._id, 'student')
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Student registration
// @route   POST /api/auth/student/register
// @access  Public
export const studentRegister = async (req, res) => {
  try {
    const { name, rollNo, email, phone, type, department, semester, password } = req.body;

    // Check if student already exists
    const studentExists = await Student.findOne({ $or: [{ email }, { rollNo }] });

    if (studentExists) {
      return res.status(400).json({ message: 'Student with this email or roll number already exists' });
    }

    // Create student
    const student = await Student.create({
      name,
      rollNo,
      email,
      phone,
      type,
      department,
      semester,
      password
    });

    if (student) {
      // Send registration confirmation email
      await sendRegistrationEmail(student.email, student.name);
      
      // Return success message without auto-login
      res.status(201).json({ 
        message: 'Registration successful! Please check your email and login with your credentials.',
        success: true
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/student/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if student exists
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: 'No student found with that email address' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to student model
    student.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set expire time (10 minutes)
    student.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await student.save();
    
    // Create reset url
    const resetUrl = `https://ofprs-4jtu.vercel.app/reset-password/${resetToken}`;
    
    // Send email with reset link
    await sendPasswordResetEmail(student.email, student.name, resetUrl);
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/student/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    // Hash the token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Find student with matching token and not expired
    const student = await Student.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!student) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Set new password
    student.password = newPassword;
    student.resetPasswordToken = undefined;
    student.resetPasswordExpire = undefined;
    
    await student.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ username }).select('+password');

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        token: generateToken(admin._id, 'admin')
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin registration (for initial setup)
// @route   POST /api/auth/admin/register
// @access  Public (should be protected in production)
export const adminRegister = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ $or: [{ email }, { username }] });

    if (adminExists) {
      return res.status(400).json({ message: 'Admin with this email or username already exists' });
    }

    // Create admin
    const admin = await Admin.create({
      username,
      email,
      password,
      fullName
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        token: generateToken(admin._id, 'admin')
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};
