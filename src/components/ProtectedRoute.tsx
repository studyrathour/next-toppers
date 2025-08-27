import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/auth';

const ProtectedRoute: React.FC = () => {
  // If the user is authenticated, render the nested routes (the admin dashboard).
  // Otherwise, redirect them to the login page.
  return isAdminAuthenticated() ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
