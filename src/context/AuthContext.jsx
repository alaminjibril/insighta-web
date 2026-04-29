import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState({ accessToken: null, refreshToken: null });
  const [user, setUser] = useState(null);

  const login = useCallback(({ accessToken, refreshToken, userInfo }) => {
    setTokens({ accessToken, refreshToken });
    if (userInfo) setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    setTokens({ accessToken: null, refreshToken: null });
    setUser(null);
  }, []);

  const updateTokens = useCallback(({ accessToken, refreshToken }) => {
    setTokens({ accessToken, refreshToken });
  }, []);

  const updateUser = useCallback((userInfo) => {
    setUser(userInfo);
  }, []);

  const isAuthenticated = Boolean(tokens.accessToken);

  return (
    <AuthContext.Provider value={{ tokens, user, login, logout, updateTokens, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
