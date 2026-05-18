// Small in-app notification slice.
// Used as a thin abstraction over react-hot-toast so components can dispatch
// notifications without importing the toast library, and so we have a single
// place to capture/inspect notifications in the future (e.g. a notification
// drawer in the admin panel).

import { createSlice, nanoid } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  unreadCount: 0,
};

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    push: {
      reducer(state, action) {
        state.items.unshift(action.payload);
        if (state.items.length > 50) state.items.pop();
        state.unreadCount += 1;
      },
      prepare({ type = 'info', message, meta }) {
        return {
          payload: {
            id: nanoid(),
            type,
            message,
            meta,
            createdAt: Date.now(),
            read: false,
          },
        };
      },
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    remove(state, action) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clear(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { push, markAllRead, remove, clear } = slice.actions;
export default slice.reducer;

// Thunks that fire a toast AND record the notification in state.

export const notify = ({ type = 'info', message, meta }) => (dispatch) => {
  if (type === 'success') toast.success(message);
  else if (type === 'error') toast.error(message);
  else toast(message);
  dispatch(push({ type, message, meta }));
};
