import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initAxiosAuth } from './api/axios';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Profiles from './pages/Profiles';
import ProfileDetail from './pages/ProfileDetail';

function AppRoutes() {
  const { tokens, updateTokens, logout } = useAuth();

  // Wire up the axios interceptor with live auth context references
  useEffect(() => {
    initAxiosAuth({
      getTokens: () => tokens,
      updateTokens,
      onAuthFailure: logout,
    });
  }, [tokens, updateTokens, logout]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profiles"
        element={
          <ProtectedRoute>
            <Profiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profiles/:id"
        element={
          <ProtectedRoute>
            <ProfileDetail />
          </ProtectedRoute>
        }
      />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
