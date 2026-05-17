// Public-site theme is now in Redux. Admin panel is always light.
// This shim preserves the previous API (`useTheme`, `ThemeProvider`).
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { togglePublicTheme, setPublicTheme } from '@/store/slices/uiSlice';

export function ThemeProvider({ children }) {
  const theme = useSelector((s) => s.ui.publicTheme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);
  return children;
}

export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.ui.publicTheme);
  return {
    theme,
    toggle: () => dispatch(togglePublicTheme()),
    setTheme: (t) => dispatch(setPublicTheme(t)),
  };
}
