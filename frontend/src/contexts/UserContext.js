import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from '../utils/useApi';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Session hook that uses the same context
export const useSession = () => {
  const context = useUser();
  return {
    session: context.user ? { 
      user: context.user, 
      token: localStorage.getItem('token') 
    } : null,
    loading: context.loading,
    signIn: context.signIn,
    signOut: context.signOut,
    updateSession: context.login,
    refreshSession: context.refreshUser
  };
};

export const UserProvider = ({ children }) => {
  const api = useApi();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await api.get('/api/auth/profile');
      clearTimeout(timeoutId);
      
      if (response.success) {
        setUser(response.user);
      } else {
        console.error('Profile fetch failed:', response.error);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If token is invalid, remove it
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  // New signIn function for session functionality
  const signIn = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      if (response.success) {
        // Save token
        localStorage.setItem('token', response.token);
        
        // Refresh user data
        await fetchUserProfile();
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error || 'Login failed' 
      };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { 
        success: false, 
        error: error.message || 'Sign in failed' 
      };
    }
  };

  // signOut is an alias for logout
  const signOut = logout;

  useEffect(() => {
    fetchUserProfile();
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Profile fetch timeout, stopping loading state');
        setLoading(false);
      }
    }, 15000); // 15 second fallback

    return () => clearTimeout(fallbackTimeout);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    signIn,
    signOut,
    refreshUser: fetchUserProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 