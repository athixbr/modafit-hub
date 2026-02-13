import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string; role: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('vidativa-auth') === 'true';
  });

  const [user] = useState({ name: 'Admin Vidativa', email: 'admin@vidativa.com', role: 'Administrador' });

  const login = (email: string, password: string) => {
    if (email && password) {
      setIsAuthenticated(true);
      localStorage.setItem('vidativa-auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('vidativa-auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user: isAuthenticated ? user : null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
