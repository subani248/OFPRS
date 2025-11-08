import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { scholarshipAPI } from '../services/api';

const ScholarshipApplication = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingApplications, setExistingApplications] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: user.name || '',
    regno: user.rollNo || '',
    bankAccountNo: '',
    ifscCode: '',
    concessionPerSem: '',
    modeOfPayment: 'online'
  });

  const [documents, setDocuments] = useState({
    admissionForm: null,
    feeReceipt: null,
    parentsPassbook: null,
    studentSignature: null
  });

  useEffect(() => {
    fetchExistingApplications();
  }, []);

  const fetchExistingApplications = async () => {
    try {
      const response = await scholarshipAPI.getStudentScholarships(user._id);
      setExistingApplications(response.data);
    } catch (err) {
      console.error('Failed to load applications', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments({ ...documents, [name]: reader.result });
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all documents are uploaded
    if (!documents.admissionForm || !documents.feeReceipt || 
        !documents.parentsPassbook || !documents.studentSignature) {
      setError('Please upload all required documents');
      return;
    }

    try {
      setLoading(true);
      await scholarshipAPI.apply({
        studentId: user._id,
        fullName: formData.fullName,
        regno: formData.regno,
        bankAccountNo: formData.bankAccountNo,
        ifscCode: formData.ifscCode,
        concessionPerSem: parseFloat(formData.concessionPerSem),
        modeOfPayment: formData.modeOfPayment,
        documents
      });

      setSuccess('Scholarship application submitted successfully! Wait for admin approval.');
      fetchExistingApplications();
      
      // Reset form
      setFormData({
        ...formData,
        bankAccountNo: '',
        ifscCode: '',
        concessionPerSem: '',
        modeOfPayment: 'online'
      });
      setDocuments({
        admissionForm: null,
        feeReceipt: null,
        parentsPassbook: null,
        studentSignature: null
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
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
        <h1>Scholarship Application</h1>
        <p className="text-muted mb-3">Apply for scholarship after paying tuition fee</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Existing Applications */}
        {existingApplications.length > 0 && (
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">Your Applications</h2>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Concession</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {existingApplications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.academic_year}</td>
                    <td>{app.concession_per_sem}%</td>
                    <td>₹{app.scholarship_amount || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Application Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">New Application</h2>
          </div>
          
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <h3 className="mb-2">Personal Information</h3>
            <div className="grid grid-2 gap-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input
                  type="text"
                  name="regno"
                  className="form-input"
                  value={formData.regno}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank Account Number *</label>
                <input
                  type="text"
                  name="bankAccountNo"
                  className="form-input"
                  value={formData.bankAccountNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">IFSC Code *</label>
                <input
                  type="text"
                  name="ifscCode"
                  className="form-input"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Concession as per Sem (%) *</label>
                <input
                  type="number"
                  name="concessionPerSem"
                  className="form-input"
                  value={formData.concessionPerSem}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mode of Payment *</label>
                <select
                  name="modeOfPayment"
                  className="form-select"
                  value={formData.modeOfPayment}
                  onChange={handleChange}
                  required
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <h3 className="mt-3 mb-2">Upload Documents</h3>
            <div className="grid grid-2 gap-2">
              <div className="form-group">
                <label className="form-label">Vignan Admission Form *</label>
                <input
                  type="file"
                  name="admissionForm"
                  className="form-input"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  required
                />
                {documents.admissionForm && (
                  <span className="text-success text-sm">✓ Uploaded</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Fee Receipt (Online/Offline) *</label>
                <input
                  type="file"
                  name="feeReceipt"
                  className="form-input"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  required
                />
                {documents.feeReceipt && (
                  <span className="text-success text-sm">✓ Uploaded</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Parents Passbook *</label>
                <input
                  type="file"
                  name="parentsPassbook"
                  className="form-input"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  required
                />
                {documents.parentsPassbook && (
                  <span className="text-success text-sm">✓ Uploaded</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Student Signature *</label>
                <input
                  type="file"
                  name="studentSignature"
                  className="form-input"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                />
                {documents.studentSignature && (
                  <span className="text-success text-sm">✓ Uploaded</span>
                )}
              </div>
            </div>

            <div className="mt-3">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <style jsx="true">{`
        .badge-warning {
          background-color: #ffc107;
          color: #000;
        }
      `}</style>
    </div>
  );
};

export default ScholarshipApplication;
