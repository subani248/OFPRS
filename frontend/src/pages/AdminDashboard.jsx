import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { formatCurrency } from '../utils/receiptGenerator';
import FeeManagement from '../components/FeeManagement';
import AdminReports from '../components/AdminReports';
import AdminTransactions from '../components/AdminTransactions';
import ConcessionManagement from '../components/ConcessionManagement';
import ScholarshipManagement from '../components/ScholarshipManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav admin-nav">
        <div className="nav-brand">
          <h2>OFPRS Admin</h2>
          <p className="text-muted">Administrative Portal</p>
        </div>
        <div className="nav-links">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/fees" className={({ isActive }) => isActive ? 'active' : ''}>
            Fee Management
          </NavLink>
          <NavLink to="/admin/concessions" className={({ isActive }) => isActive ? 'active' : ''}>
            Concessions
          </NavLink>
          <NavLink to="/admin/scholarships" className={({ isActive }) => isActive ? 'active' : ''}>
            Scholarships
          </NavLink>
          <NavLink to="/admin/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
            Transactions
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'active' : ''}>
            Reports
          </NavLink>
        </div>
        <div className="nav-user">
          <span>{user.username}</span>
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
                <div className="admin-welcome">
                  <h1>Admin Dashboard</h1>
                  <p className="text-muted">Welcome back, {user.fullName || user.username}!</p>
                </div>

                {loading ? (
                  <div className="spinner"></div>
                ) : stats && (
                  <>
                    <div className="grid grid-4 gap-2 mb-3">
                      <motion.div 
                        className="admin-stat-card"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="stat-icon students">👥</div>
                        <h3>Total Students</h3>
                        <p className="stat-value">{stats.totalStudents}</p>
                      </motion.div>

                      <motion.div 
                        className="admin-stat-card"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="stat-icon revenue">💰</div>
                        <h3>Total Revenue</h3>
                        <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
                      </motion.div>

                      <motion.div 
                        className="admin-stat-card"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="stat-icon month">📅</div>
                        <h3>This Month</h3>
                        <p className="stat-value">{formatCurrency(stats.monthRevenue)}</p>
                        <p className="stat-subtext">{stats.monthTransactions} transactions</p>
                      </motion.div>

                      <motion.div 
                        className="admin-stat-card"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="stat-icon pending">⏳</div>
                        <h3>Pending Payments</h3>
                        <p className="stat-value">{stats.studentsWithPending}</p>
                        <p className="stat-subtext">students</p>
                      </motion.div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <h2 className="card-title">Recent Transactions</h2>
                      </div>

                      {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Receipt No</th>
                              <th>Student</th>
                              <th>Roll No</th>
                              <th>Fee Type</th>
                              <th>Amount</th>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.recentTransactions.map((transaction, index) => (
                              <motion.tr
                                key={transaction._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <td>{transaction.receipt_number}</td>
                                <td>{transaction.student_name}</td>
                                <td>{transaction.student_rollNo}</td>
                                <td className="text-capitalize">{transaction.fee_type}</td>
                                <td className="text-success">{formatCurrency(transaction.amount)}</td>
                                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge badge-${transaction.status === 'success' ? 'success' : 'danger'}`}>
                                    {transaction.status}
                                  </span>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-state">
                          <p>No recent transactions</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          } />
          <Route path="/fees" element={<FeeManagement />} />
          <Route path="/concessions" element={<ConcessionManagement />} />
          <Route path="/scholarships" element={<ScholarshipManagement />} />
          <Route path="/transactions" element={<AdminTransactions />} />
          <Route path="/reports" element={<AdminReports />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;