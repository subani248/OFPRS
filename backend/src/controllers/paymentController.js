import Razorpay from 'razorpay';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import { sendPaymentSuccessEmail } from '../config/emailConfig.js';
    
// Lazy initialization of Razorpay instance
let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private (Student)
export const createOrder = async (req, res) => {
  try {
    const { amount, studentId, feeType, feeIds } = req.body;

    // Validate student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        studentId: studentId,
        studentName: student.name,
        rollNo: student.rollNo,
        feeType: feeType
      }
    };

    const order = await getRazorpayInstance().orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Error creating payment order', error: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private (Student)
export const verifyPayment = async (req, res) => {
  try {
    console.log('Payment verification started');
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      feeType,
      amount,
      feeIds
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get the fee being paid to get the correct academic year and fee ID
    let academicYear;
    let feeId = null;
    
    if (feeType !== 'total') {
      // Find the fee to get its academic year and ID
      const fee = await Fee.findOne({
        fee_type: feeType,
        semester: student.semester,
        department: student.department,
        isActive: true
      }).sort({ createdAt: -1 }); // Get the latest fee of this type
      
      if (fee) {
        academicYear = fee.academic_year;
        feeId = fee._id;
      } else {
        academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      }
    } else {
      // For total payment, use current academic year
      academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    }

    // Create transaction record
    const transaction = await Transaction.create({
      student_id: studentId,
      student_name: student.name,
      student_rollNo: student.rollNo,
      fee_type: feeType,
      fee_id: feeId,
      amount: amount,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      razorpay_signature: razorpay_signature,
      status: 'success',
      semester: student.semester,
      department: student.department,
      academic_year: academicYear
    });

    // Update fee status if it's not a total payment
    if (feeType !== 'total' && feeId) {
      // We don't actually need to update the Fee model since we check transactions in the student controller
      // But we could add any additional logic here if needed in the future
    }

    // Send payment success email (don't let email failure break payment)
    try {
      await sendPaymentSuccessEmail(student.email, student.name, transaction);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      transaction: {
        _id: transaction._id,
        receipt_number: transaction.receipt_number,
        payment_id: transaction.payment_id,
        amount: transaction.amount,
        fee_type: transaction.fee_type,
        date: transaction.date,
        student_name: transaction.student_name,
        student_rollNo: transaction.student_rollNo
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

// @desc    Get payment details
// @route   GET /api/payment/:paymentId
// @access  Private
export const getPaymentDetails = async (req, res) => {
  try {
    const payment = await getRazorpayInstance().payments.fetch(req.params.paymentId);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment details', error: error.message });
  }
};
