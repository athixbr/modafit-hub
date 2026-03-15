import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storeLogin as apiStoreLogin, storeRegister as apiStoreRegister, getStoreProfile } from '@/lib/api';

interface StoreCustomer {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address?: string;
  city?: string;
}

interface StoreAuthContextType {
  customer: StoreCustomer | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    address?: string;
    city?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const StoreAuthContext = createContext<StoreAuthContextType | undefined>(undefined);

export function StoreAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<StoreCustomer | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('storeToken'));

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token]);

  const loadProfile = async () => {
    if (!token) return;
    
    try {
      const response = await getStoreProfile(token);
      if (response.success) {
        setCustomer(response.data);
      } else {
        // Token inválido, fazer logout
        logout();
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiStoreLogin({ email, password });
    
    if (response.success) {
      setToken(response.data.token);
      setCustomer(response.data.customer);
      localStorage.setItem('storeToken', response.data.token);
    } else {
      throw new Error(response.message || 'Erro ao fazer login');
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    address?: string;
    city?: string;
    password: string;
  }) => {
    const response = await apiStoreRegister(data);
    
    if (response.success) {
      setToken(response.data.token);
      setCustomer(response.data.customer);
      localStorage.setItem('storeToken', response.data.token);
    } else {
      throw new Error(response.message || 'Erro ao registrar');
    }
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem('storeToken');
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <StoreAuthContext.Provider value={{
      customer,
      token,
      isAuthenticated: !!customer && !!token,
      login,
      register,
      logout,
      refreshProfile
    }}>
      {children}
    </StoreAuthContext.Provider>
  );
}

export function useStoreAuth() {
  const context = useContext(StoreAuthContext);
  if (!context) {
    throw new Error('useStoreAuth must be used within a StoreAuthProvider');
  }
  return context;
}
