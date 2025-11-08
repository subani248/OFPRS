import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { scholarshipAPI } from '../services/api';

const ScholarshipManagement = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processData, setProcessData] = useState({
    status: '',
    adminRemarks: '',
    scholarshipAmount: ''
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await scholarshipAPI.getAllScholarships();
      setScholarships(response.data);
    } catch (err) {
      setError('Failed to load scholarship applications');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await scholarshipAPI.getScholarshipById(id);
      setSelectedScholarship(response.data);
      setProcessData({
        status: response.data.status,
        adminRemarks: response.data.admin_remarks || '',
        scholarshipAmount: response.data.scholarship_amount || ''
      });
      setShowModal(true);
    } catch (err) {
      setError('Failed to load scholarship details');
    }
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await scholarshipAPI.processScholarship(selectedScholarship._id, processData);
      setSuccess(`Scholarship application ${processData.status} successfully`);
      setShowModal(false);
      fetchScholarships();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process application');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Scholarship Management</h1>
        <p className="text-muted mb-3">Review and process scholarship applications</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Concession %</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((scholarship, index) => (
                  <motion.tr
                    key={scholarship._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>{scholarship.student_name}</td>
                    <td>{scholarship.regno}</td>
                    <td>{scholarship.department}</td>
                    <td>{scholarship.semester}</td>
                    <td>{scholarship.concession_per_sem}%</td>
                    <td>
                      <span className={`badge ${getStatusBadge(scholarship.status)}`}>
                        {scholarship.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(scholarship.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => viewDetails(scholarship._id)}
                      >
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Details Modal */}
        {showModal && selectedScholarship && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2>Scholarship Application Details</h2>

              <div className="scholarship-details">
                <h3>Student Information</h3>
                <div className="grid grid-2 gap-2 mb-2">
                  <div>
                    <strong>Name:</strong> {selectedScholarship.student_name}
                  </div>
                  <div>
                    <strong>Roll No:</strong> {selectedScholarship.regno}
                  </div>
                  <div>
                    <strong>Department:</strong> {selectedScholarship.department}
                  </div>
                  <div>
                    <strong>Semester:</strong> {selectedScholarship.semester}
                  </div>
                </div>

                <h3>Bank Details</h3>
                <div className="grid grid-2 gap-2 mb-2">
                  <div>
                    <strong>Account No:</strong> {selectedScholarship.bank_account_no}
                  </div>
                  <div>
                    <strong>IFSC Code:</strong> {selectedScholarship.ifsc_code}
                  </div>
                  <div>
                    <strong>Concession:</strong> {selectedScholarship.concession_per_sem}%
                  </div>
                  <div>
                    <strong>Mode:</strong> {selectedScholarship.mode_of_payment.toUpperCase()}
                  </div>
                </div>

                <h3>Documents</h3>
                <div className="documents-grid">
                  <div>
                    <strong>Admission Form:</strong>{' '}
                    <a href={selectedScholarship.documents.admission_form} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </div>
                  <div>
                    <strong>Fee Receipt:</strong>{' '}
                    <a href={selectedScholarship.documents.fee_receipt} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </div>
                  <div>
                    <strong>Parents Passbook:</strong>{' '}
                    <a href={selectedScholarship.documents.parents_passbook} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </div>
                  <div>
                    <strong>Student Signature:</strong>{' '}
                    <a href={selectedScholarship.documents.student_signature} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </div>
                </div>

                <form onSubmit={handleProcess} className="mt-3">
                  <h3>Process Application</h3>
                  <div className="grid grid-2 gap-2">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={processData.status}
                        onChange={(e) => setProcessData({...processData, status: e.target.value})}
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Scholarship Amount</label>
                      <input
                        type="number"
                        className="form-input"
                        value={processData.scholarshipAmount}
                        onChange={(e) => setProcessData({...processData, scholarshipAmount: e.target.value})}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Admin Remarks</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      value={processData.adminRemarks}
                      onChange={(e) => setProcessData({...processData, adminRemarks: e.target.value})}
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
                      Save
                    </button>
                  </div>
                </form>
              </div>
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
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h2 {
          margin-bottom: 24px;
          color: var(--text-primary);
        }

        .scholarship-details h3 {
          margin-top: 20px;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .documents-grid a {
          color: #2563eb;
          text-decoration: none;
        }

        .documents-grid a:hover {
          text-decoration: underline;
        }

        .badge-warning {
          background-color: #ffc107;
          color: #000;
        }
      `}</style>
    </div>
  );
};

export default ScholarshipManagement;
