import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/endpoints';

interface UsuarioInfo {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  tenantId: string;
  sucursalId?: string;
}

interface AuthState {
  token: string | null;
  usuario: UsuarioInfo | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = { TOKEN: 'auth_token', USUARIO: 'auth_usuario', TENANT: 'tenant_id' };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ token: null, usuario: null, loading: true });

  // Restaurar sesión al arrancar
  useEffect(() => {
    (async () => {
      try {
        const [token, usuarioJson] = await AsyncStorage.multiGet([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USUARIO]);
        const tokenVal = token[1];
        const usuarioVal = usuarioJson[1] ? JSON.parse(usuarioJson[1]) : null;
        setState({ token: tokenVal, usuario: usuarioVal, loading: false });
      } catch {
        setState((prev) => ({ ...prev, loading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { accessToken, usuario } = res.data?.data ?? res.data;
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN,   accessToken],
      [STORAGE_KEYS.USUARIO, JSON.stringify(usuario)],
      [STORAGE_KEYS.TENANT,  usuario.tenantId ?? 'default'],
    ]);
    setState({ token: accessToken, usuario, loading: false });
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    setState({ token: null, usuario: null, loading: false });
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
