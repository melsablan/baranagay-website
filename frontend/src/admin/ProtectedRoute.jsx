import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/admin/login" replace />;
  }

  // TODO: Add token validation with backend
  // For now, just check if token exists
  
  return children;
};

export default ProtectedRoute;
