import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      if (decoded.role === 'student') {
        req.user = await Student.findById(decoded.id).select('-password');
        req.userRole = 'student';
      } else if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
        req.userRole = 'admin';
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Student only middleware
export const studentOnly = (req, res, next) => {
  if (req.user && req.userRole === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Student only.' });
  }
};
