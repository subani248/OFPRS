import Fee from '../models/Fee.js';
import Transaction from '../models/Transaction.js';
import Student from '../models/Student.js';

// @desc    Create new fee
// @route   POST /api/admin/fees
// @access  Private (Admin)
export const createFee = async (req, res) => {
  try {
    const { fee_type, amount, due_date, semester, department, applicable_for, academic_year, description } = req.body;

    const fee = await Fee.create({
      fee_type,
      amount,
      due_date,
      semester,
      department,
      applicable_for,
      academic_year,
      description
    });

    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all fees
// @route   GET /api/admin/fees
// @access  Private (Admin)
export const getAllFees = async (req, res) => {
  try {
    const { semester, department, fee_type, academic_year } = req.query;

    let query = {};
    if (semester) query.semester = semester;
    if (department) query.department = department;
    if (fee_type) query.fee_type = fee_type;
    if (academic_year) query.academic_year = academic_year;

    const fees = await Fee.find(query).sort({ createdAt: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update fee
// @route   PUT /api/admin/fees/:id
// @access  Private (Admin)
export const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (fee) {
      fee.fee_type = req.body.fee_type || fee.fee_type;
      fee.amount = req.body.amount || fee.amount;
      fee.due_date = req.body.due_date || fee.due_date;
      fee.semester = req.body.semester || fee.semester;
      fee.department = req.body.department || fee.department;
      fee.applicable_for = req.body.applicable_for || fee.applicable_for;
      fee.academic_year = req.body.academic_year || fee.academic_year;
      fee.description = req.body.description || fee.description;
      fee.isActive = req.body.isActive !== undefined ? req.body.isActive : fee.isActive;

      const updatedFee = await fee.save();
      res.json(updatedFee);
    } else {
      res.status(404).json({ message: 'Fee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete fee
// @route   DELETE /api/admin/fees/:id
// @access  Private (Admin)
export const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (fee) {
      await fee.deleteOne();
      res.json({ message: 'Fee removed' });
    } else {
      res.status(404).json({ message: 'Fee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin)
export const getAllTransactions = async (req, res) => {
  try {
    const { status, department, semester, startDate, endDate } = req.query;

    let query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (semester) query.semester = semester;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('student_id', 'name rollNo email')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get financial reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
export const getFinancialReports = async (req, res) => {
  try {
    const { startDate, endDate, department, semester } = req.query;

    let query = { status: 'success' };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);

    const transactions = await Transaction.find(query);

    // Calculate total revenue
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Revenue by fee type
    const revenueByFeeType = transactions.reduce((acc, t) => {
      acc[t.fee_type] = (acc[t.fee_type] || 0) + t.amount;
      return acc;
    }, {});

    // Revenue by department
    const revenueByDepartment = transactions.reduce((acc, t) => {
      acc[t.department] = (acc[t.department] || 0) + t.amount;
      return acc;
    }, {});

    // Monthly revenue
    const monthlyRevenue = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {});

    // Get total students and paying students
    const totalStudents = await Student.countDocuments();
    const payingStudents = new Set(transactions.map(t => t.student_id.toString())).size;

    res.json({
      summary: {
        totalRevenue,
        totalTransactions: transactions.length,
        totalStudents,
        payingStudents,
        averageTransaction: totalRevenue / transactions.length || 0
      },
      revenueByFeeType,
      revenueByDepartment,
      monthlyRevenue,
      transactions: transactions.slice(0, 10) // Latest 10 transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
export const getAllStudents = async (req, res) => {
  try {
    const { department, semester, type } = req.query;

    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (type) query.type = type;

    const students = await Student.find(query).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    // Get current date range (this month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total students
    const totalStudents = await Student.countDocuments();

    // Total revenue (all time)
    const allTransactions = await Transaction.find({ status: 'success' });
    const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amount, 0);

    // This month's revenue
    const monthTransactions = await Transaction.find({
      status: 'success',
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });
    const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Pending payments (students with unpaid fees)
    const allFees = await Fee.find({ isActive: true });
    const paidStudents = new Set(allTransactions.map(t => t.student_id.toString()));
    const studentsWithPending = totalStudents - paidStudents.size;

    // Recent transactions
    const recentTransactions = await Transaction.find({ status: 'success' })
      .sort({ date: -1 })
      .limit(5)
      .populate('student_id', 'name rollNo');

    res.json({
      totalStudents,
      totalRevenue,
      monthRevenue,
      studentsWithPending,
      totalTransactions: allTransactions.length,
      monthTransactions: monthTransactions.length,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply concession to student
// @route   PUT /api/admin/students/:id/concession
// @access  Private (Admin)
export const applyConcession = async (req, res) => {
  try {
    const { concession } = req.body;
    const studentId = req.params.id;

    // Validate concession value
    if (concession < 0 || concession > 100) {
      return res.status(400).json({ message: 'Concession must be between 0 and 100' });
    }

    // Find and update student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.concession = concession;
    const updatedStudent = await student.save();

    res.json({
      message: `Concession of ${concession}% applied successfully`,
      student: updatedStudent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student with concession details
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
export const getStudentWithConcession = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};