import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedView: 'dashboard',
  showCreate: false,
  showRightSidebar: true,
  showInbox: false,
  selectedFriend: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedView: (state, action) => {
      state.selectedView = action.payload;
    },
    setShowCreate: (state, action) => {
      state.showCreate = action.payload;
    },
    setShowRightSidebar: (state, action) => {
      state.showRightSidebar = action.payload;
    },
    setShowInbox: (state, action) => {
      state.showInbox = action.payload;
    },
    setSelectedFriend: (state, action) => {
      state.selectedFriend = action.payload;
    },
    toggleRightSidebar: (state) => {
      state.showRightSidebar = !state.showRightSidebar;
    },
    toggleInbox: (state) => {
      state.showInbox = !state.showInbox;
    },
  },
});

export const {
  setSelectedView,
  setShowCreate,
  setShowRightSidebar,
  setShowInbox,
  setSelectedFriend,
  toggleRightSidebar,
  toggleInbox,
} = uiSlice.actions;

export const selectSelectedView = (state) => state.ui.selectedView;
export const selectShowCreate = (state) => state.ui.showCreate;
export const selectShowRightSidebar = (state) => state.ui.showRightSidebar;
export const selectShowInbox = (state) => state.ui.showInbox;
export const selectSelectedFriend = (state) => state.ui.selectedFriend;

export default uiSlice.reducer;

