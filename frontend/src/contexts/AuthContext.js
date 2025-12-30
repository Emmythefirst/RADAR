import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (!savedToken) {
        console.log('❌ No token found');
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        console.log('🔐 Loading user from token...');
        
        // Verify token and get user
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });

        if (response.data?.success && response.data.user) {
          console.log('✅ User loaded:', response.data.user.email);
          
          const userData = {
            ...response.data.user,
            watchlist: Array.isArray(response.data.user.watchlist) 
              ? response.data.user.watchlist 
              : []
          };
          
          setUser(userData);
          setToken(savedToken);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        console.error('❌ Failed to load user:', error.message);
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      
      if (response.data?.success) {
        const { token: newToken, user: userData } = response.data;
        
        const safeUserData = {
          ...userData,
          watchlist: Array.isArray(userData.watchlist) ? userData.watchlist : []
        };
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(safeUserData);
        setIsAuthenticated(true);
        
        console.log('✅ Login successful:', safeUserData.email);
        return { success: true };
      }
      
      throw new Error(response.data?.error || 'Login failed');
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      
      if (response.data?.success) {
        const { token: newToken, user: userData } = response.data;
        
        const safeUserData = {
          ...userData,
          watchlist: Array.isArray(userData.watchlist) ? userData.watchlist : []
        };
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(safeUserData);
        setIsAuthenticated(true);
        
        console.log('✅ Signup successful:', safeUserData.email);
        return { success: true };
      }
      
      throw new Error(response.data?.error || 'Signup failed');
    } catch (error) {
      console.error('❌ Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Signup failed' 
      };
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      console.log('🔐 Google login with credential...');
      
      const response = await api.post('/auth/google', { token: credential });
      
      if (response.data?.success) {
        const { token: newToken, user: userData } = response.data;
        
        const safeUserData = {
          ...userData,
          watchlist: Array.isArray(userData.watchlist) ? userData.watchlist : []
        };
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(safeUserData);
        setIsAuthenticated(true);
        
        console.log('✅ Google login successful:', safeUserData.email);
        return { success: true };
      }
      
      throw new Error(response.data?.error || 'Google login failed');
    } catch (error) {
      console.error('❌ Google login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Google login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log('👋 User logged out');
  };

  const updateWatchlist = (newWatchlist) => {
    if (!user) {
      console.error('❌ Cannot update watchlist: user is null');
      return;
    }
    
    const safeWatchlist = Array.isArray(newWatchlist) ? newWatchlist : [];
    
    setUser(prev => ({
      ...prev,
      watchlist: safeWatchlist
    }));
    console.log('✅ Watchlist updated:', safeWatchlist.length, 'items');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateWatchlist,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};