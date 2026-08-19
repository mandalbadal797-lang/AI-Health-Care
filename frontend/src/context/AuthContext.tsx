import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/domain';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginPlaceholder: (role?: 'student' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const loginPlaceholder = (role: 'student' | 'admin' = 'student') => {
    setUser({
      id: 'demo-user-id-12345',
      email: `${role}@mindcampus.edu`,
      full_name: role === 'admin' ? 'Demo Administrator' : 'Demo Student User',
      role: role,
      is_active: true,
      created_at: new Date().toISOString(),
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginPlaceholder, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
