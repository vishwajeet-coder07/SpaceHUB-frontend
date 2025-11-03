import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  communities: [],
  localGroups: [],
  activeTab: 'Community',
  loading: false,
  error: '',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCommunities: (state, action) => {
      state.communities = action.payload;
      state.loading = false;
      state.error = '';
    },
    setLocalGroups: (state, action) => {
      state.localGroups = action.payload;
      state.loading = false;
      state.error = '';
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addCommunity: (state, action) => {
      state.communities.push(action.payload);
    },
    addLocalGroup: (state, action) => {
      state.localGroups.push(action.payload);
    },
    updateCommunity: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.communities.findIndex(
        (c) => c.id === id || c.communityId === id || c.community_id === id
      );
      if (index !== -1) {
        state.communities[index] = { ...state.communities[index], ...updates };
      }
    },
    removeCommunity: (state, action) => {
      const id = action.payload;
      state.communities = state.communities.filter(
        (c) => c.id !== id && c.communityId !== id && c.community_id !== id
      );
    },
    removeLocalGroup: (state, action) => {
      const id = action.payload;
      state.localGroups = state.localGroups.filter(
        (g) => g.id !== id && g.groupId !== id && g.roomId !== id
      );
    },
  },
});

export const {
  setCommunities,
  setLocalGroups,
  setActiveTab,
  setLoading,
  setError,
  addCommunity,
  addLocalGroup,
  updateCommunity,
  removeCommunity,
  removeLocalGroup,
} = dashboardSlice.actions;

export const selectCommunities = (state) => state.dashboard.communities;
export const selectLocalGroups = (state) => state.dashboard.localGroups;
export const selectActiveTab = (state) => state.dashboard.activeTab;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;

