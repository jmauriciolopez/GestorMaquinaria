import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/endpoints';

interface AuthState {
  token: string | null;
  usuario: Record<string, unknown> | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ token: null, usuario: null });

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { accessToken, usuario } = res.data;
    await AsyncStorage.setItem('token', accessToken);
    await AsyncStorage.setItem('tenantId', usuario.tenantId ?? 'default');
    setState({ token: accessToken, usuario });
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'tenantId']);
    setState({ token: null, usuario: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAuthenticated: !!state.token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
