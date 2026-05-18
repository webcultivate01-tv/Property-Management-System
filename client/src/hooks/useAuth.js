// Tiny convenience hook over the Redux auth slice.
// Public sign-up has been removed — accounts are created from the admin panel.

import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, logoutThunk, bootstrapAuth } from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);

  const login = (email, password) =>
    dispatch(loginThunk({ email, password })).unwrap();

  const logout = () => dispatch(logoutThunk());

  const refresh = () => dispatch(bootstrapAuth());

  return { user, loading, error, login, logout, refresh };
}
