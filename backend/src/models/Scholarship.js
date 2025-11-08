import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  student_name: {
    type: String,
    required: true
  },
  regno: {
    type: String,
    required: true
  },
  bank_account_no: {
    type: String,
    required: true,
    trim: true
  },
  ifsc_code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  concession_per_sem: {
    type: Number,
    required: true,
    min: 0
  },
  mode_of_payment: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  documents: {
    admission_form: {
      type: String,
      required: true
    },
    fee_receipt: {
      type: String,
      required: true
    },
    parents_passbook: {
      type: String,
      required: true
    },
    student_signature: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_remarks: {
    type: String,
    trim: true
  },
  scholarship_amount: {
    type: Number,
    default: 0
  },
  processed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  processed_date: {
    type: Date
  },
  semester: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  academic_year: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for efficient querying
scholarshipSchema.index({ student_id: 1, academic_year: 1 });
scholarshipSchema.index({ status: 1 });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

export default Scholarship;
