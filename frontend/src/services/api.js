import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL:'https://ofprs.onrender.com//api'
});

// Add request interceptor to include token
API.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  studentLogin: (data) => API.post('/auth/student/login', data),
  studentRegister: (data) => API.post('/auth/student/register', data),
  forgotPassword: (data) => API.post('/auth/student/forgot-password', data),
  resetPassword: (data) => API.post('/auth/student/reset-password', data),
  adminLogin: (data) => API.post('/auth/admin/login', data)
};

// Student API
export const studentAPI = {
  getFees: (studentId) => API.get(`/student/fees/${studentId}`),
  getTransactions: (studentId) => API.get(`/student/transactions/${studentId}`),
  createOrder: (data) => API.post('/student/create-order', data)
};

// Payment API
export const paymentAPI = {
  createOrder: (data) => API.post('/payment/create-order', data),
  verifyPayment: (data) => API.post('/payment/verify', data)
};

// Admin API
export const adminAPI = {
  createFee: (data) => API.post('/admin/fees', data),
  getAllFees: (params) => API.get('/admin/fees', { params }),
  updateFee: (id, data) => API.put(`/admin/fees/${id}`, data),
  deleteFee: (id) => API.delete(`/admin/fees/${id}`),
  getAllTransactions: (params) => API.get('/admin/transactions', { params }),
  getFinancialReports: (params) => API.get('/admin/reports', { params }),
  getAllStudents: (params) => API.get('/admin/students', { params }),
  getStudent: (id) => API.get(`/admin/students/${id}`),
  applyConcession: (id, data) => API.put(`/admin/students/${id}/concession`, data),
  getDashboardStats: () => API.get('/admin/dashboard')
};

// Scholarship API
export const scholarshipAPI = {
  apply: (data) => API.post('/scholarship/apply', data),
  getStudentScholarships: (studentId) => API.get(`/scholarship/student/${studentId}`),
  getAllScholarships: (params) => API.get('/scholarship/admin/all', { params }),
  getScholarshipById: (id) => API.get(`/scholarship/admin/${id}`),
  processScholarship: (id, data) => API.put(`/scholarship/admin/${id}`, data)
};


export default API;
