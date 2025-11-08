import express from 'express';
import {
  submitScholarshipApplication,
  getStudentScholarships,
  getAllScholarships,
  getScholarshipById,
  processScholarshipApplication
} from '../controllers/scholarshipController.js';
import { protect, studentOnly, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student routes
router.post('/apply', protect, studentOnly, submitScholarshipApplication);
router.get('/student/:studentId', protect, studentOnly, getStudentScholarships);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllScholarships);
router.get('/admin/:id', protect, adminOnly, getScholarshipById);
router.put('/admin/:id', protect, adminOnly, processScholarshipApplication);

export default router;
