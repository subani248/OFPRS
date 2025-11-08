import express from 'express';
import { studentLogin, studentRegister, adminLogin, adminRegister } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Student auth routes
router.post('/student/login', studentLogin);
router.post('/student/register', studentRegister);
router.post('/student/forgot-password', forgotPassword);
router.post('/student/reset-password', resetPassword);

// Admin auth routes
router.post('/admin/login', adminLogin);
router.post('/admin/register', adminRegister);

export default router;