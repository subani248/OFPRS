import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import { generateReceipt, formatCurrency, formatDate } from '../utils/receiptGenerator';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getTransactions(user._id);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (transaction) => {
    generateReceipt(transaction);
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.fee_type === filter;
  });

  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="transaction-header">
          <div>
            <h1>Transaction History</h1>
            <p className="text-muted">View all your payment transactions</p>
          </div>
          <div className="total-paid-card">
            <p className="text-muted">Total Paid</p>
            <h2 className="text-success">{formatCurrency(totalPaid)}</h2>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <div className="card">
          <div className="card-header flex-between">
            <h2 className="card-title">All Transactions</h2>
            <div className="filter-group">
              <label>Filter by Fee Type:</label>
              <select
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '200px' }}
              >
                <option value="all">All</option>
                <option value="tuition">Tuition</option>
                <option value="uniform">Uniform</option>
                <option value="exam">Exam</option>
                <option value="library">Library</option>
                <option value="transport">Transport</option>
                <option value="hostel">Hostel</option>
                <option value="total">Total Payment</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="transactions-grid">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction._id}
                  className="transaction-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="transaction-header-row">
                    <div>
                      <h3 className="transaction-type">
                        {transaction.fee_type.replace('_', ' ').toUpperCase()}
                      </h3>
                      <p className="transaction-date">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="transaction-amount">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>

                  <div className="transaction-details">
                    <div className="detail-row">
                      <span className="detail-label">Receipt No:</span>
                      <span className="detail-value">{transaction.receipt_number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Payment ID:</span>
                      <span className="detail-value transaction-id">{transaction.payment_id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`badge badge-${transaction.status === 'success' ? 'success' : 'danger'}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full mt-2"
                    onClick={() => handleDownloadReceipt(transaction)}
                  >
                    📄 Download Receipt
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionHistory;
