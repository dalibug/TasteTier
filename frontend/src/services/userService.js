import api from './api';

// Keep track of authentication status to prevent multiple checks
let authCheckInProgress = false;
let lastAuthResult = null;
let lastAuthCheckTime = 0;
const AUTH_CACHE_DURATION = 30000; // 30 seconds

const UserService = {
  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/users/me');
      
      // For development: Add admin status to the user data if not present
      // In production, this would come from the backend
      if (response.data && response.data.email) {
        // Check if the email contains 'admin' or if it's a specific test email
        const isAdminEmail = response.data.email.includes('admin') || 
                            response.data.email === 'test@example.com';
        
        // Set admin status if not already set
        if (response.data.isAdmin === undefined) {
          response.data.isAdmin = isAdminEmail;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: (userId) => {
    return api.get(`/api/users/${userId}`);
  },

  // Update user profile
  updateUserProfile: (userId, userData) => {
    return api.put(`/api/users/${userId}`, userData);
  },
  
  // Update user (alias for updateUserProfile)
  updateUser: (userId, userData) => {
    console.log('UserService.updateUser called with userId:', userId, 'and userData:', userData);
    
    // Check for userId field in userData
    if (!userId && userData.userId) {
      console.log('Using userId from userData:', userData.userId);
      userId = userData.userId;
    }
    
    // Check for user_id field in userData
    if (!userId && userData.user_id) {
      console.log('Using user_id from userData:', userData.user_id);
      userId = userData.user_id;
    }
    
    // Ensure userId is a number
    if (typeof userId === 'string') {
      console.log('Converting userId from string to number:', userId);
      userId = parseInt(userId, 10);
      if (isNaN(userId)) {
        console.error('Invalid user ID:', userId);
        return Promise.reject(new Error('Invalid user ID'));
      }
    }
    
    // Ensure we have a valid user ID
    if (!userId) {
      console.error('Missing user ID for update');
      return Promise.reject(new Error('Missing user ID'));
    }
    
    console.log(`UserService: Updating user ${userId} with data:`, userData);
    return api.put(`/api/users/${userId}`, userData);
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const now = Date.now();
    
    // Check if we just logged out
    if (sessionStorage.getItem('justLoggedOut') === 'true') {
      console.log('User just logged out, returning false');
      return false;
    }
    
    // If we checked auth recently, return the cached result
    if (lastAuthCheckTime > 0 && now - lastAuthCheckTime < AUTH_CACHE_DURATION) {
      console.log('Using cached auth result:', lastAuthResult);
      return lastAuthResult;
    }
    
    // If a check is already in progress, wait for it to complete
    if (authCheckInProgress) {
      console.log('Auth check already in progress, waiting...');
      // Wait for the current check to finish
      await new Promise(resolve => setTimeout(resolve, 500));
      return lastAuthResult;
    }
    
    try {
      console.log('Performing new auth check');
      authCheckInProgress = true;
      
      const response = await api.get('/api/users/me');
      lastAuthResult = response.status === 200 && !!response.data;
      lastAuthCheckTime = Date.now();
      
      console.log('Auth check result:', lastAuthResult);
      return lastAuthResult;
    } catch (error) {
      console.log('Auth check failed:', error.message);
      lastAuthResult = false;
      lastAuthCheckTime = Date.now();
      return false;
    } finally {
      authCheckInProgress = false;
    }
  },

  // Check if user is an admin
  isAdmin: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.status === 200 && response.data && response.data.isAdmin === true;
    } catch (error) {
      console.log('Admin check failed:', error.message);
      return false;
    }
  },

  // Clear authentication cache
  clearAuthCache: () => {
    console.log('Clearing auth cache');
    lastAuthResult = null;
    lastAuthCheckTime = 0;
    authCheckInProgress = false;
  },

  // Get user's tier lists
  getUserTierLists: (userId) => {
    return api.get(`/api/users/${userId}/tierlists`);
  },
  
  // Get tier lists by user (alias for getUserTierLists)
  getTierListsByUser: (userId) => {
    return api.get(`/api/users/${userId}/tierlists`);
  },

  // Get user's weekly challenge participations
  getUserChallengeParticipations: (userId) => {
    return api.get(`/api/users/${userId}/challenges`);
  },

  // Get user's chat rooms
  getUserChatRooms: (userId) => {
    return api.get(`/api/users/${userId}/chatrooms`);
  },

  // Logout user
  logout: () => {
    // Clear auth cache
    lastAuthResult = false;
    lastAuthCheckTime = 0;
    authCheckInProgress = false;
    
    // Set logout flag in sessionStorage
    sessionStorage.setItem('justLoggedOut', 'true');
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    return Promise.resolve({ success: true });
  },

  // Get user stats
  getUserStats: (userId) => {
    return api.get(`/api/users/${userId}/stats`);
  }
};

export default UserService; 