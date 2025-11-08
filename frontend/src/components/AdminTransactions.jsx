import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import { formatCurrency } from '../utils/receiptGenerator';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    semester: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTransactions(filters);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ status: '', department: '', semester: '' });
  };

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-3">
          <h1>All Transactions</h1>
          <p className="text-muted">View and manage all payment transactions</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card mb-3">
          <div className="card-header">
            <h3>Filters</h3>
          </div>
          <div className="grid grid-4 gap-2 p-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-input"
                value={filters.department}
                onChange={handleFilterChange}
                placeholder="Filter by department"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Semester</label>
              <select
                name="semester"
                className="form-select"
                value={filters.semester}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-secondary w-full" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Transaction List ({transactions.length})</h3>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Fee Type</th>
                    <th>Amount</th>
                    <th>Payment ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td>{transaction.receipt_number}</td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.student_name}</td>
                      <td>{transaction.student_rollNo}</td>
                      <td>{transaction.department}</td>
                      <td>{transaction.semester}</td>
                      <td className="text-capitalize">{transaction.fee_type}</td>
                      <td className="text-success">{formatCurrency(transaction.amount)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {transaction.payment_id.substring(0, 20)}...
                      </td>
                      <td>
                        <span className={`badge badge-${transaction.status === 'success' ? 'success' : 'danger'}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminTransactions;
