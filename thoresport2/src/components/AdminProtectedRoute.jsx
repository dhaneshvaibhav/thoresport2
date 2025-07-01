import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const isAdmin = !!localStorage.getItem('orgToken');
  if (!isAdmin) {
    return <Navigate to="/admin/auth" replace />;
  }
  return children;
};

export default AdminProtectedRoute; 