import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, registerThunk, logoutThunk, bootstrapAuth } from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);

  const login = (email, password) =>
    dispatch(loginThunk({ email, password })).unwrap();

  const register = (payload) => dispatch(registerThunk(payload)).unwrap();

  const logout = () => dispatch(logoutThunk());

  const refresh = () => dispatch(bootstrapAuth());

  return { user, loading, error, login, register, logout, refresh };
}
