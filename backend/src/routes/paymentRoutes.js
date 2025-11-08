import express from 'express';
import { createOrder, verifyPayment, getPaymentDetails } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Payment routes
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:paymentId', protect, getPaymentDetails);

export default router;
