import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import Admin from './src/models/Admin.js';
import Student from './src/models/Student.js';
import Transaction from './src/models/Transaction.js';
import Fee from './src/models/Fee.js';

// Load environment variables
dotenv.config();

// Sample data
const admins = [
  {
    username: 'admin01',
    email: 'admin@feesystem.com',
    password: 'admin123',
    role: 'admin',
    fullName: 'System Administrator',
    isActive: true
  }
];

const students = [
  {
    name: 'Rajesh Kumar',
    rollNo: '21CS001',
    email: 'rajesh.kumar@student.edu',
    phone: '9876543210',
    type: 'hosteller',
    department: 'Computer Science',
    semester: 4,
    password: 'student123'
  },
  {
    name: 'Priya Sharma',
    rollNo: '21CS002',
    email: 'priya.sharma@student.edu',
    phone: '9876543211',
    type: 'day_scholar',
    department: 'Computer Science',
    semester: 4,
    password: 'student123'
  }
];

const fees = [
  {
    fee_type: 'tuition',
    amount: 50000,
    due_date: new Date('2025-01-31'),
    semester: 4,
    department: 'Computer Science',
    applicable_for: 'all',
    academic_year: '2024-2025',
    description: 'Semester 4 Tuition Fee',
    isActive: true
  },
  {
    fee_type: 'hostel',
    amount: 25000,
    due_date: new Date('2025-01-31'),
    semester: 4,
    department: 'Computer Science',
    applicable_for: 'hosteller',
    academic_year: '2024-2025',
    description: 'Hostel Fee for Semester 4',
    isActive: true
  },
  {
    fee_type: 'library',
    amount: 5000,
    due_date: new Date('2025-02-15'),
    semester: 4,
    department: 'Computer Science',
    applicable_for: 'all',
    academic_year: '2024-2025',
    description: 'Library Fee',
    isActive: true
  },
  {
    fee_type: 'exam',
    amount: 3000,
    due_date: new Date('2025-03-31'),
    semester: 4,
    department: 'Computer Science',
    applicable_for: 'all',
    academic_year: '2024-2025',
    description: 'Examination Fee',
    isActive: true
  },
  {
    fee_type: 'transport',
    amount: 8000,
    due_date: new Date('2025-01-31'),
    semester: 4,
    department: 'Computer Science',
    applicable_for: 'day_scholar',
    academic_year: '2024-2025',
    description: 'Transportation Fee',
    isActive: true
  }
];

// Import data
const importData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Admin.deleteMany();
    await Student.deleteMany();
    await Transaction.deleteMany();
    await Fee.deleteMany();

    console.log('👤 Creating admin...');
    const createdAdmins = await Admin.create(admins);

    console.log('🎓 Creating students...');
    const createdStudents = await Student.create(students);

    console.log('💰 Creating fees...');
    const createdFees = await Fee.create(fees);

    // No sample transactions - students must pay via Razorpay
    console.log('✅ Skipping sample transactions - students must pay via Razorpay');

    console.log('✅ Data imported successfully!');
    console.log('\n📊 Database Summary:');
    console.log('━'.repeat(50));
    console.log(`Admins: ${createdAdmins.length}`);
    console.log(`Students: ${createdStudents.length}`);
    console.log(`Fees: ${createdFees.length}`);
    console.log(`Transactions: 0 (Pay via Razorpay to create transactions)`);
    console.log('\n📝 Login Credentials:');
    console.log('━'.repeat(50));
    console.log('Admin:');
    console.log('  Email: admin@feesystem.com');
    console.log('  Password: admin123');
    console.log('\nStudent 1 (Hosteller):');
    console.log('  Roll No: 21CS001');
    console.log('  Email: rajesh.kumar@student.edu');
    console.log('  Password: student123');
    console.log('\nStudent 2 (Day Scholar):');
    console.log('  Roll No: 21CS002');
    console.log('  Email: priya.sharma@student.edu');
    console.log('  Password: student123');
    console.log('━'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

// Destroy data
const destroyData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Destroying all data...');
    await Admin.deleteMany();
    await Student.deleteMany();
    await Transaction.deleteMany();
    await Fee.deleteMany();

    console.log('✅ Data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error destroying data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
