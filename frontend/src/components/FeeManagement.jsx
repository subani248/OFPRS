import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import { formatCurrency } from '../utils/receiptGenerator';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({
    fee_type: 'tuition',
    amount: '',
    due_date: '',
    semester: 1,
    department: '',
    applicable_for: 'all',
    academic_year: '2024-2025',
    description: ''
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllFees();
      setFees(response.data);
    } catch (err) {
      setError('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingFee) {
        await adminAPI.updateFee(editingFee._id, formData);
        setSuccess('Fee updated successfully');
      } else {
        await adminAPI.createFee(formData);
        setSuccess('Fee created successfully');
      }
      
      setShowModal(false);
      setEditingFee(null);
      resetForm();
      fetchFees();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      fee_type: fee.fee_type,
      amount: fee.amount,
      due_date: new Date(fee.due_date).toISOString().split('T')[0],
      semester: fee.semester,
      department: fee.department,
      applicable_for: fee.applicable_for,
      academic_year: fee.academic_year,
      description: fee.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee?')) return;

    try {
      await adminAPI.deleteFee(id);
      setSuccess('Fee deleted successfully');
      fetchFees();
    } catch (err) {
      setError('Failed to delete fee');
    }
  };

  const resetForm = () => {
    setFormData({
      fee_type: 'tuition',
      amount: '',
      due_date: '',
      semester: 1,
      department: '',
      applicable_for: 'all',
      academic_year: '2024-2025',
      description: ''
    });
  };

  const openCreateModal = () => {
    setEditingFee(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-between mb-3">
          <div>
            <h1>Fee Management</h1>
            <p className="text-muted">Create and manage fee structures</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Add New Fee
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Applicable For</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, index) => (
                  <motion.tr
                    key={fee._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="text-capitalize">{fee.fee_type}</td>
                    <td className="text-success">{formatCurrency(fee.amount)}</td>
                    <td>{fee.semester}</td>
                    <td>{fee.department}</td>
                    <td className="text-capitalize">{fee.applicable_for.replace('_', ' ')}</td>
                    <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${fee.isActive ? 'success' : 'danger'}`}>
                        {fee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleEdit(fee)}
                        style={{ marginRight: '8px' }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(fee._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2>{editingFee ? 'Edit Fee' : 'Create New Fee'}</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Fee Type</label>
                    <select
                      name="fee_type"
                      className="form-select"
                      value={formData.fee_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="tuition">Tuition</option>
                      <option value="uniform">Uniform</option>
                      <option value="exam">Exam</option>
                      <option value="library">Library</option>
                      <option value="transport">Transport</option>
                      <option value="hostel">Hostel</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      className="form-input"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      name="department"
                      className="form-select"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="MECH">MECH</option>
                      <option value="BIO MEDICAL">BIO MEDICAL</option>
                      <option value="AGRICULTURE">AGRICULTURE</option>
                      <option value="MBA">MBA</option>
                      <option value="BBA">BBA</option>
                      <option value="PHARM.D">PHARM.D</option>
                      <option value="LAW">LAW</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      name="semester"
                      className="form-select"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Applicable For</label>
                    <select
                      name="applicable_for"
                      className="form-select"
                      value={formData.applicable_for}
                      onChange={handleChange}
                      required
                    >
                      <option value="all">All Students</option>
                      <option value="day_scholar">Day Scholars</option>
                      <option value="hosteller">Hostellers</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      className="form-input"
                      value={formData.due_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <input
                      type="text"
                      name="academic_year"
                      className="form-input"
                      value={formData.academic_year}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    name="description"
                    className="form-input"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingFee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>

      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h2 {
          margin-bottom: 24px;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default FeeManagement;
