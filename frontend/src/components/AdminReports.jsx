import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import { formatCurrency } from '../utils/receiptGenerator';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await adminAPI.getFinancialReports(params);
      setReports(response.data);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleApplyFilter = () => {
    fetchReports();
  };

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-3">
          <h1>Financial Reports</h1>
          <p className="text-muted">Comprehensive revenue and payment analytics</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card mb-3">
          <div className="card-header">
            <h3>Date Range Filter</h3>
          </div>
          <div className="flex gap-2 p-2" style={{ flexWrap: 'wrap' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="form-input"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="form-input"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleApplyFilter}>
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : reports && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-4 gap-2 mb-3">
              <motion.div 
                className="admin-stat-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon revenue">💰</div>
                <h3>Total Revenue</h3>
                <p className="stat-value">{formatCurrency(reports.summary.totalRevenue)}</p>
              </motion.div>

              <motion.div 
                className="admin-stat-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">📊</div>
                <h3>Total Transactions</h3>
                <p className="stat-value">{reports.summary.totalTransactions}</p>
              </motion.div>

              <motion.div 
                className="admin-stat-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon students">👥</div>
                <h3>Paying Students</h3>
                <p className="stat-value">{reports.summary.payingStudents}</p>
                <p className="stat-subtext">of {reports.summary.totalStudents} total</p>
              </motion.div>

              <motion.div 
                className="admin-stat-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">📈</div>
                <h3>Avg Transaction</h3>
                <p className="stat-value">{formatCurrency(reports.summary.averageTransaction)}</p>
              </motion.div>
            </div>

            {/* Revenue by Fee Type */}
            <div className="grid grid-2 gap-2 mb-3">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Revenue by Fee Type</h3>
                </div>
                <div className="p-2">
                  {Object.entries(reports.revenueByFeeType || {}).map(([feeType, amount], index) => (
                    <motion.div
                      key={feeType}
                      className="revenue-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="revenue-label text-capitalize">{feeType}:</span>
                      <span className="revenue-value text-success">{formatCurrency(amount)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Revenue by Department</h3>
                </div>
                <div className="p-2">
                  {Object.entries(reports.revenueByDepartment || {}).map(([dept, amount], index) => (
                    <motion.div
                      key={dept}
                      className="revenue-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="revenue-label">{dept}:</span>
                      <span className="revenue-value text-success">{formatCurrency(amount)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="card mb-3">
              <div className="card-header">
                <h3 className="card-title">Monthly Revenue Breakdown</h3>
              </div>
              <div className="p-2">
                <div className="grid grid-3 gap-2">
                  {Object.entries(reports.monthlyRevenue || {}).map(([month, amount], index) => (
                    <motion.div
                      key={month}
                      className="month-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <h4>{month}</h4>
                      <p className="text-success">{formatCurrency(amount)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Transactions</h3>
              </div>
              {reports.transactions && reports.transactions.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student</th>
                      <th>Fee Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.transactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{transaction.student_name}</td>
                        <td className="text-capitalize">{transaction.fee_type}</td>
                        <td className="text-success">{formatCurrency(transaction.amount)}</td>
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
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>

      <style jsx="true">{`
        .revenue-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          margin-bottom: 8px;
          background: var(--bg-color);
          border-radius: 8px;
          font-weight: 500;
        }

        .revenue-label {
          color: var(--text-primary);
        }

        .revenue-value {
          font-weight: 700;
        }

        .month-card {
          background: white;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .month-card h4 {
          margin: 0 0 8px 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .month-card p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .month-card:hover {
          border-color: var(--primary-color);
        }
      `}</style>
    </div>
  );
};

export default AdminReports;
