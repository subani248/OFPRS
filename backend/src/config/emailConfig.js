import nodemailer from 'nodemailer';

const createTransporter = () => {
  // Check if email credentials are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not provided. Email notifications will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendRegistrationEmail = async (studentEmail, studentName) => {
  try {
    const transporter = createTransporter();
    
    // If transporter is null, email credentials are not configured
    if (!transporter) {
      console.log('Email not configured. Skipping registration email.');
      return true;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: 'Registration Successful - OFPRS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">OFPRS</h1>
            <p style="color: #e0e0e0; margin: 5px 0 0;">Online Fee Payment & Receipt Management System</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background-color: #4CAF50; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px; color: white;">✓</span>
              </div>
            </div>
            
            <h2 style="color: #1e3c72; text-align: center;">Welcome ${studentName}!</h2>
            
            <p>Your registration has been successfully completed.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2a5298;">Registration Details</h3>
              <p><strong>Email:</strong> ${studentEmail}</p>
              <p>You can now log in to the system using your credentials.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ofprs-4jtu.vercel.app/login" style="background-color: #1e3c72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account & Login</a>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Thank you for choosing OFPRS!</p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">&copy; 2025 OFPRS. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Registration email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending registration email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (studentEmail, studentName, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    // If transporter is null, email credentials are not configured
    if (!transporter) {
      console.log('Email not configured. Skipping password reset email.');
      return true;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: 'Password Reset Request - OFPRS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">OFPRS</h1>
            <p style="color: #e0e0e0; margin: 5px 0 0;">Online Fee Payment & Receipt Management System</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #1e3c72;">Password Reset Request</h2>
            
            <p>Dear ${studentName},</p>
            
            <p>You have requested a password reset for your OFPRS account.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3c72;">
              <h3 style="color: #2a5298; margin-top: 0;">Reset Your Password</h3>
              <p>Click the button below to reset your password:</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #1e3c72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            
            <p><strong>Note:</strong> This link will expire in 10 minutes.</p>
            
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            
            <p>Thank you for using OFPRS!</p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">&copy; 2025 OFPRS. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

export const sendPaymentReminderEmail = async (studentEmail, studentName, feeType, dueDate, amount) => {
  try {
    const transporter = createTransporter();
    
    // If transporter is null, email credentials are not configured
    if (!transporter) {
      console.log('Email not configured. Skipping payment reminder email.');
      return true;
    }
    
    // Format the due date properly
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: `Payment Reminder - ${feeType.replace('_', ' ')} Fee Due on ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">OFPRS</h1>
            <p style="color: #e0e0e0; margin: 5px 0 0;">Online Fee Payment & Receipt Management System</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #1e3c72;">Payment Reminder</h2>
            
            <p>Dear ${studentName},</p>
            
            <p>This is a friendly reminder that your <strong>${feeType.replace('_', ' ')}</strong> fee payment is due on <strong>${formattedDueDate}</strong>.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3c72;">
              <h3 style="color: #2a5298; margin-top: 0;">Payment Details</h3>
              <p><strong>Fee Type:</strong> ${feeType.replace('_', ' ')}</p>
              <p><strong>Amount Due:</strong> ₹${amount}</p>
              <p><strong>Due Date:</strong> ${formattedDueDate}</p>
            </div>
            
            <p>Please log in to your account to make the payment at your earliest convenience.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login" style="background-color: #1e3c72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Pay Now</a>
            </div>
            
            <p>If you have already made the payment, please disregard this reminder.</p>
            
            <p>Thank you for your attention to this matter.</p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">&copy; 2025 OFPRS. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment reminder email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment reminder email:', error);
    return false;
  }
};

export const sendPaymentSuccessEmail = async (studentEmail, studentName, transaction) => {
  try {
    const transporter = createTransporter();
    
    // If transporter is null, email credentials are not configured
    if (!transporter) {
      console.log('Email not configured. Skipping payment success email.');
      return true;
    }
    
    // Format the payment date
    const paymentDate = new Date(transaction.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: `Payment Successful - Receipt #${transaction.receipt_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">OFPRS</h1>
            <p style="color: #e0e0e0; margin: 5px 0 0;">Online Fee Payment & Receipt Management System</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background-color: #4CAF50; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px; color: white;">✓</span>
              </div>
            </div>
            
            <h2 style="color: #1e3c72; text-align: center;">Payment Successful!</h2>
            
            <p>Dear ${studentName},</p>
            
            <p>Your payment has been successfully processed. Thank you for your payment!</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3 style="color: #2a5298; margin-top: 0;">Payment Details</h3>
              <p><strong>Receipt Number:</strong> ${transaction.receipt_number}</p>
              <p><strong>Payment ID:</strong> ${transaction.payment_id}</p>
              <p><strong>Fee Type:</strong> ${transaction.fee_type.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Amount Paid:</strong> ₹${transaction.amount.toFixed(2)}</p>
              <p><strong>Payment Date:</strong> ${paymentDate}</p>
              <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">SUCCESS</span></p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>📄 Note:</strong> Your payment receipt has been generated. You can download it from your dashboard.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/student/transactions" style="background-color: #1e3c72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Transaction History</a>
            </div>
            
            <p>If you have any questions regarding this transaction, please contact our support team.</p>
            
            <p>Thank you for using OFPRS!</p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">&copy; 2025 OFPRS. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment success email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return false;
  }
};


export default { sendRegistrationEmail, sendPasswordResetEmail, sendPaymentReminderEmail, sendPaymentSuccessEmail };
