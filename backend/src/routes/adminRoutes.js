import express from 'express';
import {
  createFee,
  getAllFees,
  updateFee,
  deleteFee,
  getAllTransactions,
  getFinancialReports,
  getAllStudents,
  getDashboardStats,
  applyConcession,
  getStudentWithConcession
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fee management routes
router.post('/fees', protect, adminOnly, createFee);
router.get('/fees', protect, adminOnly, getAllFees);
router.put('/fees/:id', protect, adminOnly, updateFee);
router.delete('/fees/:id', protect, adminOnly, deleteFee);

// Transaction routes
router.get('/transactions', protect, adminOnly, getAllTransactions);

// Reports route
router.get('/reports', protect, adminOnly, getFinancialReports);

// Student management
router.get('/students', protect, adminOnly, getAllStudents);
router.get('/students/:id', protect, adminOnly, getStudentWithConcession);
router.put('/students/:id/concession', protect, adminOnly, applyConcession);

// Dashboard stats
router.get('/dashboard', protect, adminOnly, getDashboardStats);

export default router;