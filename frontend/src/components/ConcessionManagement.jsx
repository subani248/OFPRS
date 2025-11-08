import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';

const ConcessionManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [concessionValue, setConcessionValue] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllStudents();
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(term) ||
      student.rollNo.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.department.toLowerCase().includes(term)
    );
    
    setFilteredStudents(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleApplyConcession = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminAPI.applyConcession(selectedStudent._id, { concession: concessionValue });
      setSuccess(`Concession of ${concessionValue}% applied successfully to ${selectedStudent.name}`);
      
      // Update the student in the list
      const updatedStudents = students.map(student => 
        student._id === selectedStudent._id 
          ? { ...student, concession: concessionValue } 
          : student
      );
      
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setShowModal(false);
      setSelectedStudent(null);
      setConcessionValue(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply concession');
    }
  };

  const openConcessionModal = (student) => {
    setSelectedStudent(student);
    setConcessionValue(student.concession || 0);
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
            <h1>Concession Management</h1>
            <p className="text-muted">Apply concessions to students</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card mb-3">
          <div className="card-header">
            <div className="flex-between">
              <h2 className="card-title">Students</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by Roll Number..."
                  className="form-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Type</th>
                  <th>Current Concession</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>{student.name}</td>
                    <td>{student.rollNo}</td>
                    <td>{student.email}</td>
                    <td>{student.department}</td>
                    <td>{student.semester}</td>
                    <td className="text-capitalize">{student.type.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge badge-${student.concession > 0 ? 'success' : 'secondary'}`}>
                        {student.concession || 0}%
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => openConcessionModal(student)}
                      >
                        Apply Concession
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Concession Modal */}
        {showModal && selectedStudent && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2>Apply Concession</h2>
              <p className="text-muted mb-2">
                Applying concession for <strong>{selectedStudent.name}</strong> (Roll No: {selectedStudent.rollNo})
              </p>
              
              <form onSubmit={handleApplyConcession}>
                <div className="form-group mb-2">
                  <label className="form-label">Concession Percentage</label>
                  <input
                    type="number"
                    className="form-input"
                    value={concessionValue}
                    onChange={(e) => setConcessionValue(Number(e.target.value))}
                    min="0"
                    max="100"
                    required
                  />
                  <div className="form-hint">Enter a value between 0 and 100</div>
                </div>

                <div className="card bg-light mb-2">
                  <div className="card-body">
                    <h3>Concession Impact</h3>
                    <p>
                      This will reduce <strong>TUITION FEE ONLY</strong> by <strong>{concessionValue}%</strong> for this student.
                    </p>
                    {concessionValue > 0 && (
                      <div className="alert alert-info">
                        <strong>Note:</strong> This concession will apply only to tuition fees for this student.
                      </div>
                    )}
                  </div>
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
                    Apply Concession
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
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h2 {
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .search-box {
          max-width: 300px;
        }

        .form-hint {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .bg-light {
          background-color: var(--bg-light);
        }
      `}</style>
    </div>
  );
};

export default ConcessionManagement;