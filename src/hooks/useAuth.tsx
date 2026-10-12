'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface AuthUser {
  id: string;
  nickname: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  function login(nextUser: AuthUser) {
    setUser(nextUser);
    setLoginOpen(false);
  }

  function logout() {
    setUser(null);
    setLoginOpen(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginOpen,
        openLogin: () => setLoginOpen(true),
        closeLogin: () => setLoginOpen(false),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
