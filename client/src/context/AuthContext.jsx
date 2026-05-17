// Thin compatibility layer — auth state now lives in Redux.
// Existing imports (`import { useAuth } from '@/context/AuthContext'`) keep working.
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bootstrapAuth } from '@/store/slices/authSlice';

export { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);
  return children;
}
