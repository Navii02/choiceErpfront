import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('bakery-user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('bakery-token') || '');

  useEffect(() => {
    if (token) {
      api
        .get('/auth/me')
        .then(({ data }) => {
          const userData = data?.data?.user;
          if (userData) {
            setUser(userData);
            localStorage.setItem('bakery-user', JSON.stringify(userData));
          }
        })
        .catch(() => {
          localStorage.removeItem('bakery-token');
          localStorage.removeItem('bakery-user');
          setUser(null);
          setToken('');
        });
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data.data.user;
    const authToken = response.data.data.token;
    localStorage.setItem('bakery-token', authToken);
    localStorage.setItem('bakery-user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('bakery-token');
    localStorage.removeItem('bakery-user');
    setUser(null);
    setToken('');
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
