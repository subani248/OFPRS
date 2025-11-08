import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { studentAPI, paymentAPI } from '../services/api';
import { generateReceipt, formatCurrency } from '../utils/receiptGenerator';
import TransactionHistory from '../components/TransactionHistory';
import ScholarshipApplication from '../components/ScholarshipApplication';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getFees(user._id);
      setFees(response.data.fees);
      setSummary(response.data.summary);
    } catch (err) {
      setError('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (feeType, amount) => {
    setError('');
    setSuccess('');

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Failed to load payment gateway');
      return;
    }

    try {
      setPaymentLoading(true);

      // Create order
      const orderResponse = await paymentAPI.createOrder({
        amount,
        studentId: user._id,
        feeType
      });

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'OFPRS',
        description: `${feeType.toUpperCase()} Fee Payment`,
        order_id: orderResponse.data.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentId: user._id,
              feeType,
              amount
            });

            setSuccess('Payment successful! Your fees have been updated.');
            
            // Generate receipt
            generateReceipt(verifyResponse.data.transaction);
            
            // Refresh fees and summary immediately after successful payment
            await fetchFees();
            
            // Clear success message after 5 seconds
            setTimeout(() => {
              setSuccess('');
            }, 5000);
            
            setPaymentLoading(false);
          } catch (err) {
            setError('Payment verification failed');
            // Clear error message after 5 seconds
            setTimeout(() => {
              setError('');
            }, 5000);
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
            setError('Payment cancelled');
            // Clear error message after 5 seconds
            setTimeout(() => {
              setError('');
            }, 5000);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setPaymentLoading(false);
    }
  };

  const handlePayTotal = async () => {
    const unpaidFees = fees.filter(fee => !fee.isPaid);
    const totalAmount = unpaidFees.reduce((sum, fee) => sum + fee.amount, 0);
    
    if (totalAmount === 0) {
      setError('All fees are already paid');
      return;
    }

    await handlePayment('total', totalAmount);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>OFPRS</h2>
          <p className="text-muted">Student Portal</p>
        </div>
        <div className="nav-links">
          <NavLink to="/student" end className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
          <NavLink to="/student/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
            Transactions
          </NavLink>
          <NavLink to="/student/scholarship" className={({ isActive }) => isActive ? 'active' : ''}>
            Scholarship
          </NavLink>
        </div>
        <div className="nav-user">
          <span>{user.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="welcome-section">
                  <h1>Welcome, {user.name}!</h1>
                  <div className="student-info">
                    <span><strong>Roll No:</strong> {user.rollNo}</span>
                    <span><strong>Department:</strong> {user.department}</span>
                    <span><strong>Semester:</strong> {user.semester}</span>
                    <span><strong>Type:</strong> {user.type === 'day_scholar' ? 'Day Scholar' : 'Hosteller'}</span>
                    {summary && summary.concessionPercentage > 0 && (
                      <span><strong>Concession:</strong> {summary.concessionPercentage}%</span>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.div 
                    className="alert alert-error"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    className="alert alert-success"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {success}
                  </motion.div>
                )}

                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    {summary && (
                      <div className="grid grid-3 gap-2 mb-3">
                        <motion.div 
                          className="stat-card"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3>Total Fees</h3>
                          <p className="stat-value">{formatCurrency(summary.totalOriginalFees)}</p>
                          {summary.totalConcession > 0 && (
                            <p className="text-success text-sm">- {formatCurrency(summary.totalConcession)} concession</p>
                          )}
                        </motion.div>
                        <motion.div 
                          className="stat-card paid"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3>Paid Amount</h3>
                          <p className="stat-value text-success">{formatCurrency(summary.paidAmount)}</p>
                        </motion.div>
                        <motion.div 
                          className="stat-card due"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3>Due Amount</h3>
                          <p className="stat-value text-danger">{formatCurrency(summary.dueAmount)}</p>
                        </motion.div>
                      </div>
                    )}

                    <div className="card">
                      <div className="card-header flex-between">
                        <h2 className="card-title">Fee Breakdown</h2>
                        {summary && !summary.allPaid && (
                          <button 
                            className="btn btn-primary"
                            onClick={handlePayTotal}
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? 'Processing...' : 'Pay Total Fees'}
                          </button>
                        )}
                      </div>

                      <div className="fees-table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Fee Type</th>
                              <th>Original Amount</th>
                              {summary && summary.concessionPercentage > 0 && (
                                <>
                                  <th>Concession</th>
                                  <th>Amount to Pay</th>
                                </>
                              )}
                              <th>Due Date</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fees.map((fee, index) => (
                              <motion.tr
                                key={fee._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <td className="fee-type">{fee.fee_type.replace('_', ' ').toUpperCase()}</td>
                                <td className="fee-amount">{formatCurrency(fee.original_amount)}</td>
                                {summary && summary.concessionPercentage > 0 && (
                                  <>
                                    <td className={fee.concession_amount > 0 ? "text-success" : "text-muted"}>
                                      {fee.concession_amount > 0 
                                        ? `- ${formatCurrency(fee.concession_amount)} (${fee.concession_percentage}%)`
                                        : '-'
                                      }
                                    </td>
                                    <td className="fee-amount">{formatCurrency(fee.amount)}</td>
                                  </>
                                )}
                                <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                                <td>
                                  {fee.isPaid ? (
                                    <span className="badge badge-success">✓ Paid</span>
                                  ) : (
                                    <span className="badge badge-danger">Unpaid</span>
                                  )}
                                </td>
                                <td>
                                  {fee.isPaid ? (
                                    <span className="text-success">Completed</span>
                                  ) : (
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handlePayment(fee.fee_type, fee.amount)}
                                      disabled={paymentLoading}
                                    >
                                      Pay Now
                                    </button>
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          } />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/scholarship" element={<ScholarshipApplication />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;