import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextContext';
import LoadingSpinner from './LoadingSpinner';

const ResetPasswordRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  const hasResetToken = sessionStorage.getItem('resetAccessToken') && sessionStorage.getItem('resetEmail');

  if (!hasResetToken && !isAuthenticated) {
    return <Navigate to="/forgot-password" state={{ from: location }} replace />;
  }

  return children;
};

export default ResetPasswordRoute;

