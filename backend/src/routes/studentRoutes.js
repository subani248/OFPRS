import express from 'express';
import { getStudentFees, getStudentTransactions, getStudentProfile } from '../controllers/studentController.js';
import { protect, studentOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student routes - protected
router.get('/fees/:id', protect, studentOnly, getStudentFees);
router.get('/transactions/:id', protect, studentOnly, getStudentTransactions);
router.get('/profile/:id', protect, studentOnly, getStudentProfile);

export default router;
