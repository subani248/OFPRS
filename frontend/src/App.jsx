import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user, loading, isStudent, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : (isStudent ? <Navigate to="/student" /> : <Navigate to="/admin" />)} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/student/*" element={isStudent ? <StudentDashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/*" element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;