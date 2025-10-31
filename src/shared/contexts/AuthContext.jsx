import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const userData = sessionStorage.getItem('userData');

      if (token && userData) {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid data
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('userData');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    try {
      if (token) sessionStorage.setItem('accessToken', token);
      sessionStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetAccessToken');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const updateUser = (updatedUserData) => {
    try {
      sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const getToken = () => {
    return sessionStorage.getItem('accessToken');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    getToken,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
