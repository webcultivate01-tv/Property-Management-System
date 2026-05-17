import { createSlice } from '@reduxjs/toolkit';

const stored = typeof window !== 'undefined' ? localStorage.getItem('publicTheme') : null;
const storedAdmin = typeof window !== 'undefined' ? localStorage.getItem('adminTheme') : null;
const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialState = {
  publicTheme: stored || (prefersDark ? 'dark' : 'light'),
  adminTheme: storedAdmin || 'light',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPublicTheme(state, action) {
      state.publicTheme = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('publicTheme', action.payload);
    },
    togglePublicTheme(state) {
      state.publicTheme = state.publicTheme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') localStorage.setItem('publicTheme', state.publicTheme);
    },
    setAdminTheme(state, action) {
      state.adminTheme = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('adminTheme', action.payload);
    },
    toggleAdminTheme(state) {
      state.adminTheme = state.adminTheme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') localStorage.setItem('adminTheme', state.adminTheme);
    },
    openSidebar(state) { state.sidebarOpen = true; },
    closeSidebar(state) { state.sidebarOpen = false; },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
  },
});

export const {
  setPublicTheme,
  togglePublicTheme,
  setAdminTheme,
  toggleAdminTheme,
  openSidebar,
  closeSidebar,
  toggleSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
