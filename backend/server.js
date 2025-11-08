import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';
import connectDB from './src/config/db.js';
import { sendPaymentReminders } from './src/utils/paymentReminder.js';
import authRoutes from './src/routes/authRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import scholarshipRoutes from './src/routes/scholarshipRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/scholarship', scholarshipRoutes);

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
  
  // Serve static files
  app.use(express.static(frontendBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
}

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'OFPRS API is running...' });
});

// Schedule payment reminders (runs daily at 9:00 AM)
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily payment reminder check...');
  try {
    await sendPaymentReminders();
  } catch (error) {
    console.error('Error in scheduled payment reminders:', error);
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});