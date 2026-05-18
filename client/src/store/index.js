// Central Redux store.
// All app state lives here — Context API has been removed.

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import eventReducer from './slices/eventSlice';
import userReducer from './slices/userSlice';
import propertyReducer from './slices/propertySlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    events: eventReducer,
    users: userReducer,
    properties: propertyReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});
