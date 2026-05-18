// Application entry point.
// Auth state lives in Redux (no Context API providers needed).
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './store';
import { bootstrapAuth } from './store/slices/authSlice';
import './index.css';

// Restore the logged-in user (if any) before React mounts.
store.dispatch(bootstrapAuth());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: 'rgba(15,23,42,0.92)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.08)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
