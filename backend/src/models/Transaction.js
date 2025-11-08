import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  student_name: {
    type: String,
    required: true
  },
  student_rollNo: {
    type: String,
    required: true
  },
  fee_type: {
    type: String,
    required: [true, 'Fee type is required'],
    enum: ['tuition', 'uniform', 'exam', 'library', 'transport', 'hostel', 'total']
  },
  fee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fee',
    required: false // Optional because 'total' payment doesn't link to single fee
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  payment_id: {
    type: String,
    required: true,
    unique: true
  },
  order_id: {
    type: String,
    required: true
  },
  razorpay_signature: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success'
  },
  payment_method: {
    type: String,
    default: 'razorpay'
  },
  date: {
    type: Date,
    default: Date.now
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
  receipt_number: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate receipt number before saving
transactionSchema.pre('save', async function(next) {
  if (!this.receipt_number) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.receipt_number = `RCPT${year}${month}${random}`;
  }
  next();
});

// Create index for efficient querying
transactionSchema.index({ student_id: 1, date: -1 });
transactionSchema.index({ status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
