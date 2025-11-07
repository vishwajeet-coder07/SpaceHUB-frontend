import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextContext';
import LoadingSpinner from './LoadingSpinner';

const ProfileSetupRoute = ({ children }) => {
  const { isAuthenticated, loading, getToken } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }
const accessToken = getToken();
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default ProfileSetupRoute;


