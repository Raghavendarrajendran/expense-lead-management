import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi, getMe, logout as logoutApi } from '../api/auth.api';
import { User, PermissionEntry, MenuItem } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  permissions: PermissionEntry[];
  menu: MenuItem[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (moduleId: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<PermissionEntry[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      getMe()
        .then(res => {
          setUser(res.data.data.user);
          setPermissions(res.data.data.permissions);
          setMenu(res.data.data.menu);
        })
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    const { accessToken, user: u, permissions: p, menu: m } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(u);
    setPermissions(p);
    setMenu(m);
  };

  const logout = () => {
    logoutApi().catch(() => {});
    localStorage.removeItem('accessToken');
    setUser(null);
    setPermissions([]);
    setMenu([]);
  };

  const hasPermission = (moduleId: string, action: string): boolean => {
    const mod = permissions.find(p => p.moduleId === moduleId);
    return mod ? mod.actions.includes(action) : false;
  };

  return (
    <AuthContext.Provider value={{
      user, permissions, menu,
      isAuthenticated: !!user,
      isLoading, login, logout, hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
