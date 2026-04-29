import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      navigate('/');
      return;
    }

    // Clear tokens from URL immediately
    window.history.replaceState({}, document.title, window.location.pathname);

    // Fetch user info with the new token
    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}`, 'X-API-Version': '1' },
    })
      .then((res) => {
        login({ accessToken, refreshToken, userInfo: res.data });
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        // Even if /me fails, store tokens and proceed
        login({ accessToken, refreshToken });
        navigate('/dashboard', { replace: true });
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
    }}>
      {/* Spinner */}
      <div style={{
        width: '48px', height: '48px',
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
        Completing authentication…
      </p>
    </div>
  );
}
