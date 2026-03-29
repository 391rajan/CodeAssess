import React, { createContext, useState, useEffect, useContext } from 'react';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANT for cookies
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-400 font-medium">Verifying Session...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
