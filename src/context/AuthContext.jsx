import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Guard JSON.parse so a corrupt localStorage entry can't crash the app.
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bakery-user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('bakery-token') || '');

  // authReady flips to true once the initial /auth/me check settles
  // (or immediately if there's no token to verify).
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (cancelled) return;
        const userData = data?.data?.user;
        if (userData) {
          setUser(userData);
          localStorage.setItem('bakery-user', JSON.stringify(userData));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // Only clear the session on a genuine auth failure.
        // Network errors / 5xx / offline should NOT log the user out —
        // we keep the cached user and let the app work offline.
        if (err?.response?.status === 401) {
          localStorage.removeItem('bakery-token');
          localStorage.removeItem('bakery-user');
          setUser(null);
          setToken('');
        }
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data.data.user;
    const authToken = response.data.data.token;
    localStorage.setItem('bakery-token', authToken);
    localStorage.setItem('bakery-user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    setAuthReady(true);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('bakery-token');
    localStorage.removeItem('bakery-user');
    setUser(null);
    setToken('');
    setAuthReady(true);
  };

  const value = useMemo(
    () => ({ user, token, authReady, login, logout }),
    [user, token, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}