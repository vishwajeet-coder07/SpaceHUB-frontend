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

        if (userData) {
          const parsedUserData = JSON.parse(userData);
          state.user = parsedUserData;
          state.token = token || null;
          state.isAuthenticated = true;
          const needsProfileSetup = !parsedUserData?.username;
          sessionStorage.setItem('profileSetupRequired', needsProfileSetup ? 'true' : 'false');
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          sessionStorage.removeItem('profileSetupRequired');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('profileSetupRequired');
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
        const needsProfileSetup = !userData?.username;
        sessionStorage.setItem('profileSetupRequired', needsProfileSetup ? 'true' : 'false');
      } catch (error) {
        console.error('Error saving auth data:', error);
      }
    },
    logout: (state) => {
      try {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetAccessToken');
        sessionStorage.removeItem('profileSetupRequired');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      } catch (error) {
        console.error('Error clearing auth data:', error);
      }
    },
    updateUser: (state, action) => {
      try {
        const updatedUserData = action.payload;
        sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
        state.user = updatedUserData;
        const needsProfileSetup = !updatedUserData?.username;
        sessionStorage.setItem('profileSetupRequired', needsProfileSetup ? 'true' : 'false');
      } catch (error) {
        console.error('Error updating user data:', error);
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

