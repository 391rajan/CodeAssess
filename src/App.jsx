import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Platform from './pages/Platform';
import AdminDashboard from './pages/AdminDashboard';
import AdminProblemForm from './pages/AdminProblemForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Platform />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/new" element={<AdminProblemForm />} />
      <Route path="/admin/edit/:id" element={<AdminProblemForm />} />
    </Routes>
  );
}

export default App;
