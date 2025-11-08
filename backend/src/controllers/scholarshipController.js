import Scholarship from '../models/Scholarship.js';
import Student from '../models/Student.js';
import Transaction from '../models/Transaction.js';

// @desc    Submit scholarship application
// @route   POST /api/student/scholarship
// @access  Private (Student)
export const submitScholarshipApplication = async (req, res) => {
  try {
    const {
      studentId,
      fullName,
      regno,
      bankAccountNo,
      ifscCode,
      concessionPerSem,
      modeOfPayment,
      documents
    } = req.body;

    // Validate student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student has paid tuition fee
    const tuitionPayment = await Transaction.findOne({
      student_id: studentId,
      fee_type: 'tuition',
      status: 'success'
    });

    if (!tuitionPayment) {
      return res.status(400).json({ 
        message: 'You must pay tuition fee before applying for scholarship' 
      });
    }

    // Check if scholarship already applied for this academic year
    const currentDate = new Date();
    const academicYear = `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`;
    
    const existingApplication = await Scholarship.findOne({
      student_id: studentId,
      academic_year: academicYear,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied for scholarship this academic year' 
      });
    }

    // Create scholarship application
    const scholarship = await Scholarship.create({
      student_id: studentId,
      student_name: fullName,
      regno: regno,
      bank_account_no: bankAccountNo,
      ifsc_code: ifscCode,
      concession_per_sem: concessionPerSem,
      mode_of_payment: modeOfPayment,
      documents: {
        admission_form: documents.admissionForm,
        fee_receipt: documents.feeReceipt,
        parents_passbook: documents.parentsPassbook,
        student_signature: documents.studentSignature
      },
      semester: student.semester,
      department: student.department,
      academic_year: academicYear
    });

    res.status(201).json({
      success: true,
      message: 'Scholarship application submitted successfully',
      scholarship
    });
  } catch (error) {
    console.error('Scholarship application error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's scholarship applications
// @route   GET /api/student/scholarship/:studentId
// @access  Private (Student)
export const getStudentScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find({
      student_id: req.params.studentId
    }).sort({ createdAt: -1 });

    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all scholarship applications (Admin)
// @route   GET /api/admin/scholarships
// @access  Private (Admin)
export const getAllScholarships = async (req, res) => {
  try {
    const { status, department, semester } = req.query;

    let query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (semester) query.semester = semester;

    const scholarships = await Scholarship.find(query)
      .populate('student_id', 'name rollNo email phone')
      .sort({ createdAt: -1 });

    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single scholarship application
// @route   GET /api/admin/scholarships/:id
// @access  Private (Admin)
export const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id)
      .populate('student_id', 'name rollNo email phone type department semester');

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship application not found' });
    }

    res.json(scholarship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject scholarship application
// @route   PUT /api/admin/scholarships/:id
// @access  Private (Admin)
export const processScholarshipApplication = async (req, res) => {
  try {
    const { status, adminRemarks, scholarshipAmount } = req.body;
    const adminId = req.user._id;

    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship application not found' });
    }

    scholarship.status = status;
    scholarship.admin_remarks = adminRemarks;
    scholarship.scholarship_amount = scholarshipAmount || 0;
    scholarship.processed_by = adminId;
    scholarship.processed_date = new Date();

    await scholarship.save();

    res.json({
      success: true,
      message: `Scholarship application ${status}`,
      scholarship
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
