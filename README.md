# OFPRS - Online Fee Payment & Receipt Management System

A comprehensive MERN stack application for managing student fee payments and receipts with Razorpay integration.

## 🚀 Features

### Student Features
- Secure JWT authentication
- View detailed fee breakdown
- Individual or total fee payment options
- Razorpay payment integration (Test Mode)
- Automatic PDF receipt generation
- Transaction history
- Animated UI with smooth transitions

### Admin Features
- Secure admin authentication
- Create and manage fee structures
- Real-time payment monitoring
- Financial reports and analytics
- Revenue breakdown by fee type and department
- Transaction management
- Student management

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Framer Motion, Axios, jsPDF
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Token)
- **Payment**: Razorpay (Test Mode)
- **PDF Generation**: jsPDF

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Razorpay Test Account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ofprs
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`
The backend will run on `http://localhost:5000`

## 🚀 Deployment

For production deployment, please refer to the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) file which contains detailed instructions on:

- Environment configuration for production
- Building the application
- Server deployment options
- SSL configuration
- Domain setup
- Process management with PM2
- Monitoring and maintenance

## 🔑 Getting Razorpay Test Keys

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Dashboard → Settings → API Keys
3. Generate Test Keys
4. Add the keys to your `.env` file

## 👥 Default Users

### Admin Account
You need to create an admin account first. Use the following API endpoint:

```bash
POST http://localhost:5000/api/auth/admin/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@ofprs.com",
  "password": "admin123",
  "fullName": "System Administrator"
}
```

### Student Account
Students can register through the login page or use the API:

```bash
POST http://localhost:5000/api/auth/student/register
Content-Type: application/json

{
  "name": "John Doe",
  "rollNo": "CS2024001",
  "email": "john@example.com",
  "phone": "1234567890",
  "type": "day_scholar",
  "department": "Computer Science",
  "semester": 1,
  "password": "password123"
}
```

## 📝 Usage

### Student Portal

1. **Register/Login**: Create an account or login with credentials
2. **View Fees**: See all applicable fees for your semester and department
3. **Make Payment**: Click "Pay Now" for individual fees or "Pay Total Fees" for all
4. **Razorpay Checkout**: Complete payment using test cards
5. **Download Receipt**: Automatically generated PDF receipt after payment
6. **View History**: Check all previous transactions

### Admin Portal

1. **Login**: Use admin credentials
2. **Dashboard**: View statistics and recent transactions
3. **Fee Management**: Create, edit, or delete fee structures
4. **Transactions**: View all payment transactions with filters
5. **Reports**: Analyze revenue by fee type, department, and month

## 💳 Test Payment Cards (Razorpay)

Use these test cards for payments:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

## 📄 API Endpoints

### Authentication
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/register` - Admin registration

### Student
- `GET /api/student/fees/:id` - Get student fees
- `GET /api/student/transactions/:id` - Get payment history
- `GET /api/student/profile/:id` - Get student profile

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/fees` - Create fee
- `GET /api/admin/fees` - Get all fees
- `PUT /api/admin/fees/:id` - Update fee
- `DELETE /api/admin/fees/:id` - Delete fee
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/reports` - Financial reports
- `GET /api/admin/students` - Get all students

## 🎨 Features in Detail

### Animations
- Smooth page transitions using Framer Motion
- Login form slides up animation based on role selection
- Card hover effects
- List item stagger animations

### Payment Flow
1. Student selects fee(s) to pay
2. System creates Razorpay order
3. Razorpay checkout modal opens
4. Student completes payment
5. Payment verification on backend
6. Transaction saved to database
7. PDF receipt auto-generated
8. Fee status updated

### Receipt Generation
- Institution header
- Student details
- Fee breakdown
- Payment ID and transaction details
- Auto-download after payment

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Razorpay signature verification
- CORS configuration

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🤝 Contributing

This is a project for educational purposes. Feel free to fork and modify as needed.

## 📧 Support

For issues or questions, please create an issue in the repository.

## 📄 License

This project is for educational purposes.

---

Built with ❤️ using MERN Stack