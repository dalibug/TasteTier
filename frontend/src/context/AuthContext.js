import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Determine the API URL based on the environment
        const isDocker = window.location.hostname !== 'localhost';
        const apiUrl = isDocker 
          ? 'http://api:8083/auth/current-user'
          : 'http://localhost:8083/auth/current-user';
        
        console.log('[AUTH] Fetching user data from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          credentials: 'include' // Important: include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('[AUTH] User data received:', userData);
        
        if (userData.authenticated) {
          console.log('[AUTH] User is authenticated:', userData.username);
          setUser({
            id: userData.userId,
            username: userData.username,
            email: userData.email,
            pictureUrl: userData.pictureUrl,
            isAdmin: userData.isAdmin,
            isAuthenticated: true
          });
        } else {
          console.log('[AUTH] Not authenticated, using default user ID 1 for testing');
          // For testing purposes in development environment, use a default user
          // This will make sure tierlists for user 1 are displayed even when not logged in
          setUser({
            id: 1,
            username: 'Test User',
            email: 'test@example.com',
            isAdmin: false,
            isAuthenticated: false
          });
        }
      } catch (err) {
        console.error('[AUTH] Error fetching current user:', err);
        setError(err.message);
        
        // For testing purposes, use a default user
        console.log('[AUTH] Error detected, using default user ID 1 for testing');
        setUser({
          id: 1,
          username: 'Test User',
          email: 'test@example.com',
          isAdmin: false,
          isAuthenticated: false
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const login = async () => {
    // Redirect to Google OAuth login
    window.location.href = '/oauth2/authorization/google';
  };
  
  const logout = async () => {
    try {
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? 'http://api:8083/logout'
        : 'http://localhost:8083/logout';
      
      await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 