import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    checkAuthStatus: (state) => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const userData = sessionStorage.getItem('userData');

        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          state.user = parsedUserData;
          state.token = token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      } catch (error) {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userData');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      } finally {
        state.loading = false;
      }
    },
    login: (state, action) => {
      const { userData, token } = action.payload;
      try {
        if (token) {
          sessionStorage.setItem('accessToken', token);
          state.token = token;
        }
        sessionStorage.setItem('userData', JSON.stringify(userData));
        state.user = userData;
        state.isAuthenticated = true;
      } catch (error) {
        // Error saving auth data silently ignored
      }
    },
    logout: (state) => {
      try {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetAccessToken');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      } catch (error) {
        // Error clearing auth data silently ignored
      }
    },
    updateUser: (state, action) => {
      try {
        const updatedUserData = action.payload;
        sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
        state.user = updatedUserData;
      } catch (error) {
        // Error updating user data silently ignored
      }
    },
  },
});

export const { setLoading, checkAuthStatus, login, logout, updateUser } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;

