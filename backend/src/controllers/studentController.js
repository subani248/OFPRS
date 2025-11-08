import Fee from '../models/Fee.js';
import Transaction from '../models/Transaction.js';
import Student from '../models/Student.js';

// @desc    Get student fees
// @route   GET /api/student/fees/:id
// @access  Private (Student)
export const getStudentFees = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get applicable fees based on student's semester, department, and type
    const fees = await Fee.find({
      semester: student.semester,
      department: student.department,
      isActive: true,
      $or: [
        { applicable_for: 'all' },
        { applicable_for: student.type }
      ]
    }).sort({ fee_type: 1 });

    // Get paid transactions for this student
    const paidTransactions = await Transaction.find({
      student_id: studentId,
      status: 'success'
    });

    // Create a set of paid fee IDs (only for non-total payments)
    const paidFeeIds = new Set(
      paidTransactions
        .filter(t => t.fee_id) // Only include transactions with specific fee_id
        .map(t => t.fee_id.toString())
    );

    // Mark fees as paid or unpaid and apply concession only to tuition fees
    const feesWithStatus = fees.map(fee => {
      // Apply concession only to tuition fee
      const isTuitionFee = fee.fee_type === 'tuition';
      const concessionAmount = isTuitionFee ? fee.amount * (student.concession / 100) : 0;
      const discountedAmount = fee.amount - concessionAmount;
      
      // Check if this specific fee ID has been paid
      const isPaid = paidFeeIds.has(fee._id.toString());
      
      return {
        _id: fee._id,
        fee_type: fee.fee_type,
        original_amount: fee.amount,
        concession_percentage: isTuitionFee ? student.concession : 0,
        concession_amount: concessionAmount,
        amount: discountedAmount,
        due_date: fee.due_date,
        description: fee.description,
        isPaid: isPaid,
        semester: fee.semester,
        department: fee.department,
        academic_year: fee.academic_year
      };
    });

    // Calculate totals
    const totalOriginalFees = feesWithStatus.reduce((sum, fee) => sum + fee.original_amount, 0);
    const totalConcession = feesWithStatus.reduce((sum, fee) => sum + fee.concession_amount, 0);
    const totalDiscountedFees = feesWithStatus.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = feesWithStatus
      .filter(fee => fee.isPaid)
      .reduce((sum, fee) => sum + fee.amount, 0);
    const dueAmount = totalDiscountedFees - paidAmount;

    res.json({
      fees: feesWithStatus,
      summary: {
        totalOriginalFees,
        totalConcession,
        totalDiscountedFees,
        paidAmount,
        dueAmount,
        allPaid: dueAmount === 0,
        concessionPercentage: student.concession
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student transactions/payment history
// @route   GET /api/student/transactions/:id
// @access  Private (Student)
export const getStudentTransactions = async (req, res) => {
  try {
    const studentId = req.params.id;

    const transactions = await Transaction.find({
      student_id: studentId
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student profile
// @route   GET /api/student/profile/:id
// @access  Private (Student)
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      res.json({
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        phone: student.phone,
        type: student.type,
        department: student.department,
        semester: student.semester,
        concession: student.concession
      });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};