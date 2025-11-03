import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [],
  pending: [],
  loading: false,
  error: '',
  activeTab: 'request',
  processingRequest: null,
};

const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {
    setRequests: (state, action) => {
      state.requests = action.payload;
      state.loading = false;
      state.error = '';
    },
    setPending: (state, action) => {
      state.pending = action.payload;
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
    setProcessingRequest: (state, action) => {
      state.processingRequest = action.payload;
    },
    removeRequest: (state, action) => {
      const requestId = action.payload;
      state.requests = state.requests.filter((r) => r.id !== requestId);
    },
    clearInbox: (state) => {
      state.requests = [];
      state.pending = [];
      state.error = '';
      state.processingRequest = null;
    },
  },
});

export const {
  setRequests,
  setPending,
  setActiveTab,
  setLoading,
  setError,
  setProcessingRequest,
  removeRequest,
  clearInbox,
} = inboxSlice.actions;

export const selectRequests = (state) => state.inbox.requests;
export const selectPending = (state) => state.inbox.pending;
export const selectInboxActiveTab = (state) => state.inbox.activeTab;
export const selectInboxLoading = (state) => state.inbox.loading;
export const selectInboxError = (state) => state.inbox.error;
export const selectProcessingRequest = (state) => state.inbox.processingRequest;

export default inboxSlice.reducer;

