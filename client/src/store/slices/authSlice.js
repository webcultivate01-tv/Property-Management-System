import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

const initialState = {
  user: null,
  loading: true,
  error: null,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const { data } = await api.get('/auth/me');
    return data.data?.user || null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Unauthorized');
  }
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { user, accessToken } = data.data;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      const { user, accessToken } = data.data;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch {}
  localStorage.removeItem('accessToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) { state.user = action.payload; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => { state.loading = true; })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null;
        state.loading = false;
      })

      .addCase(loginThunk.pending, (state) => { state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(loginThunk.rejected, (state, action) => { state.error = action.payload; })

      .addCase(registerThunk.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(registerThunk.rejected, (state, action) => { state.error = action.payload; })

      .addCase(logoutThunk.fulfilled, (state) => { state.user = null; });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
