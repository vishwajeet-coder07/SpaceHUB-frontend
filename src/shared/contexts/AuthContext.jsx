import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from './AuthContextContext';
import { 
  checkAuthStatus, 
  login, 
  logout, 
  updateUser,
  selectUser, 
  selectIsAuthenticated, 
  selectAuthLoading 
} from '../store/slices/authSlice';

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleLogin = (userData, token) => {
    dispatch(login({ userData, token }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleUpdateUser = (updatedUserData) => {
    dispatch(updateUser(updatedUserData));
  };

  const getToken = () => {
    return sessionStorage.getItem('accessToken');
  };

  const checkAuth = () => {
    dispatch(checkAuthStatus());
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    getToken,
    checkAuthStatus: checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
