import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const sessionToken = localStorage.getItem('sessionToken');
      
      if (storedUser && sessionToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Simulate API call - replace with actual API
      if (credentials.username === 'ADMIN' && credentials.password === 'ADMIN123') {
        const userData = {
          employeeId: 'EMP001',
          fullName: 'Administrator',
          username: 'ADMIN',
          role: 'Admin',
          storeId: 'STORE001',
          storeName: 'Main Office'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('sessionToken', 'demo-token-' + Date.now());
        setUser(userData);
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    checkAuthentication
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};