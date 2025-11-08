import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  fee_type: {
    type: String,
    required: [true, 'Please provide fee type'],
    enum: ['tuition', 'uniform', 'exam', 'library', 'transport', 'hostel'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide fee amount'],
    min: 0
  },
  due_date: {
    type: Date,
    required: [true, 'Please provide due date']
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  applicable_for: {
    type: String,
    enum: ['all', 'day_scholar', 'hosteller'],
    default: 'all'
  },
  academic_year: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
feeSchema.index({ semester: 1, department: 1, fee_type: 1, academic_year: 1 });

const Fee = mongoose.model('Fee', feeSchema);

export default Fee;
