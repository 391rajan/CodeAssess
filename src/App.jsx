import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Platform from './pages/Platform';
import AdminDashboard from './pages/AdminDashboard';
import AdminProblemForm from './pages/AdminProblemForm';
import AdminUsers from './pages/AdminUsers';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import ProblemList from './pages/ProblemList';
import Profile from './pages/Profile';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

// Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <PageWrapper>{children}</PageWrapper>;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <PageWrapper>{children}</PageWrapper>;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/problems" replace />;
  return <PageWrapper>{children}</PageWrapper>;
};

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Let the AuthProvider handle the global loading state

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper>{user ? <Navigate to="/problems" replace /> : <Navigate to="/login" replace />}</PageWrapper>} />

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
    </AnimatePresence>
  );
}

export default App;
