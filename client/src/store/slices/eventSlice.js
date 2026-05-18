// Event slice — admin listing/CRUD + the public popup event.
// Existing pages can keep calling eventService directly; this slice
// wraps the same service so Redux-driven components have a single source
// of truth.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventService } from '@/services/event.service';

const initialState = {
  items: [],
  meta: { page: 1, totalPages: 1, total: 0 },
  loading: false,
  error: null,

  popup: null,
  popupLoaded: false,
};

export const fetchEvents = createAsyncThunk(
  'events/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await eventService.list(params);
      return { items: res.data || [], meta: res.meta || initialState.meta };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load events');
    }
  }
);

export const fetchPopupEvent = createAsyncThunk(
  'events/popup',
  async (_, { rejectWithValue }) => {
    try {
      const res = await eventService.popup();
      return res.data || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Popup fetch failed');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await eventService.create(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Create failed');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await eventService.update(id, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id, { rejectWithValue }) => {
    try {
      await eventService.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

export const toggleEvent = createAsyncThunk(
  'events/toggle',
  async (id, { rejectWithValue }) => {
    try {
      const res = await eventService.toggle(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Toggle failed');
    }
  }
);

const slice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    dismissPopup(state) { state.popup = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchPopupEvent.fulfilled, (state, action) => {
        state.popup = action.payload;
        state.popupLoaded = true;
      })
      .addCase(fetchPopupEvent.rejected, (state) => { state.popupLoaded = true; })

      .addCase(createEvent.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e._id === action.payload._id);
        if (idx > -1) state.items[idx] = action.payload;
      })
      .addCase(toggleEvent.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e._id === action.payload._id);
        if (idx > -1) state.items[idx] = action.payload;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e._id !== action.payload);
      });
  },
});

export const { dismissPopup } = slice.actions;
export default slice.reducer;
