import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Platform from './pages/Platform';
import AdminDashboard from './pages/AdminDashboard';
import AdminProblemForm from './pages/AdminProblemForm';
import AdminUsers from './pages/AdminUsers';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import ProblemList from './pages/ProblemList';
import Profile from './pages/Profile';

// Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/problems" replace />;
  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) return null; // Let the AuthProvider handle the global loading state

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/problems" replace /> : <Navigate to="/login" replace />} />

      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/admin/login" element={<PublicOnlyRoute><AdminLogin /></PublicOnlyRoute>} />

      <Route path="/problems" element={<ProtectedRoute><ProblemList /></ProtectedRoute>} />
      <Route path="/problems/:id" element={<ProtectedRoute><Platform /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/new" element={<AdminRoute><AdminProblemForm /></AdminRoute>} />
      <Route path="/admin/edit/:id" element={<AdminRoute><AdminProblemForm /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
    </Routes>
  );
}

export default App;
