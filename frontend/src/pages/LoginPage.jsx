import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [isRegister, setIsRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    rollNo: '',
    email: '',
    phone: '',
    type: 'day_scholar',
    department: '',
    semester: 1,
    password: ''
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setSuccess('');
    setIsRegister(false);
    setShowForgotPassword(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({ ...forgotPasswordData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let response;
      if (role === 'student') {
        response = await authAPI.studentLogin({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await authAPI.adminLogin({
          username: formData.username,
          password: formData.password
        });
      }

      login(response.data);
      navigate(role === 'student' ? '/student' : '/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.studentRegister(registerData);
      // Show success message and redirect to login page
      alert('Registration successful! Please check your email and login with your credentials.');
      setIsRegister(false); // Switch back to login form
      // Reset form data
      setRegisterData({
        name: '',
        rollNo: '',
        email: '',
        phone: '',
        type: 'day_scholar',
        department: '',
        semester: 1,
        password: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(forgotPasswordData);
      setSuccess(response.data.message);
      // Reset form data
      setForgotPasswordData({
        email: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <h1>Vignan University</h1>
          <p>Online Fee Payment & Receipt Management System</p>
        </div>

        <div className="role-toggle">
          <button
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            Student
          </button>
          <button
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            Admin
          </button>
        </div>

        <motion.div
          key={role}
          className="login-form-container"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
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

          {!isRegister && !showForgotPassword ? (
            <form onSubmit={handleLogin} className="login-form">
              <h2>Sign In</h2>
              
              {role === 'student' ? (
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {role === 'student' && (
                <div className="form-group text-right">
                  <span 
                    className="link" 
                    onClick={() => setShowForgotPassword(true)}
                    style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {role === 'student' && (
                <p className="toggle-text">
                  Don't have an account?{' '}
                  <span className="link" onClick={() => setIsRegister(true)}>
                    Register here
                  </span>
                </p>
              )}
            </form>
          ) : showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="login-form">
              <h2>Forgot Password</h2>
              
              <p className="text-muted mb-3">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={forgotPasswordData.email}
                  onChange={handleForgotPasswordChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="toggle-text mt-3">
                <span className="link" onClick={() => setShowForgotPassword(false)}>
                  Back to Login
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="login-form">
              <h2>Student Registration</h2>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input
                  type="text"
                  name="rollNo"
                  className="form-input"
                  value={registerData.rollNo}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  className="form-select"
                  value={registerData.department}
                  onChange={handleRegisterChange}
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

              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    name="semester"
                    className="form-select"
                    value={registerData.semester}
                    onChange={handleRegisterChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="type"
                    className="form-select"
                    value={registerData.type}
                    onChange={handleRegisterChange}
                    required
                  >
                    <option value="day_scholar">Day Scholar</option>
                    <option value="hosteller">Hosteller</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>

              <p className="toggle-text">
                Already have an account?{' '}
                <span className="link" onClick={() => setIsRegister(false)}>
                  Sign in here
                </span>
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;