// Property slice — public listing + admin CRUD.
// Pages that already use `propertyService` directly continue to work;
// this slice is available for components that want Redux-managed state
// (e.g. listing + detail page with shared cache).

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyService } from '@/services/property.service';

const initialState = {
  items: [],
  meta: { page: 1, totalPages: 1, total: 0 },
  current: null,
  similar: [],
  loading: false,
  error: null,
};

export const fetchProperties = createAsyncThunk(
  'properties/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await propertyService.list(params);
      return { items: res.data || [], meta: res.meta || initialState.meta };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load properties');
    }
  }
);

export const fetchProperty = createAsyncThunk(
  'properties/get',
  async (id, { rejectWithValue }) => {
    try {
      const res = await propertyService.get(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Property not found');
    }
  }
);

export const fetchSimilar = createAsyncThunk(
  'properties/similar',
  async (id, { rejectWithValue }) => {
    try {
      const res = await propertyService.similar(id);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load similar');
    }
  }
);

export const createProperty = createAsyncThunk(
  'properties/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await propertyService.create(formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Create failed');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await propertyService.update(id, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id, { rejectWithValue }) => {
    try {
      await propertyService.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

export const toggleFeatured = createAsyncThunk(
  'properties/toggleFeatured',
  async (id, { rejectWithValue }) => {
    try {
      const res = await propertyService.toggleFeatured(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Toggle failed');
    }
  }
);

const slice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearCurrent(state) { state.current = null; state.similar = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProperty.fulfilled, (state, action) => { state.current = action.payload; })
      .addCase(fetchSimilar.fulfilled, (state, action) => { state.similar = action.payload; })

      .addCase(createProperty.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx > -1) state.items[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx > -1) state.items[idx] = action.payload;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
