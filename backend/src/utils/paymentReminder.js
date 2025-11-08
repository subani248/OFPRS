import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import Transaction from '../models/Transaction.js';
import { sendPaymentReminderEmail } from '../config/emailConfig.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

// Function to send payment reminders
export const sendPaymentReminders = async () => {
  try {
    // Connect to DB
    await connectDB();
    
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    // Calculate date ranges for reminders
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    sevenDaysFromNow.setHours(0, 0, 0, 0);
    
    console.log('Checking for fees due in 3 and 7 days...');
    console.log('Today:', today.toDateString());
    console.log('3 days from now:', threeDaysFromNow.toDateString());
    console.log('7 days from now:', sevenDaysFromNow.toDateString());
    
    // Find fees that are due in 3 or 7 days (using date range)
    const upcomingFees = await Fee.find({
      due_date: {
        $gte: today,
        $lte: sevenDaysFromNow
      },
      isActive: true
    });
    
    console.log(`Found ${upcomingFees.length} fees with upcoming due dates`);
    
    // For each upcoming fee, find applicable students and send reminders
    for (const fee of upcomingFees) {
      console.log(`Processing fee: ${fee.fee_type} for ${fee.department} semester ${fee.semester}`);
      
      // Find students who should pay this fee
      let studentQuery = {
        department: fee.department,
        semester: fee.semester
      };
      
      // Apply type filter if applicable
      if (fee.applicable_for !== 'all') {
        studentQuery.type = fee.applicable_for;
      }
      
      const students = await Student.find(studentQuery);
      console.log(`Found ${students.length} students for this fee`);
      
      // For each student, check if they've already paid this fee
      for (const student of students) {
        try {
          // Check if student has already paid this fee
          const existingTransaction = await Transaction.findOne({
            student_id: student._id,
            fee_type: fee.fee_type,
            semester: fee.semester,
            academic_year: fee.academic_year,
            status: 'success'
          });
          
          // If no transaction exists, send reminder
          if (!existingTransaction) {
            console.log(`Sending reminder to ${student.name} (${student.email}) for ${fee.fee_type} fee`);
            await sendPaymentReminderEmail(
              student.email,
              student.name,
              fee.fee_type,
              fee.due_date,
              fee.amount
            );
            console.log(`Reminder sent successfully to ${student.email}`);
          } else {
            console.log(`Skipping ${student.name} - already paid ${fee.fee_type} fee`);
          }
        } catch (error) {
          console.error(`Failed to process reminder for ${student.email}:`, error.message);
        }
      }
    }
    
    console.log('Payment reminder process completed');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error in payment reminder process:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    throw error;
  }
};

// Run the function if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith('paymentReminder.js')) {
  sendPaymentReminders()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error in payment reminder script:', error);
      process.exit(1);
    });
}