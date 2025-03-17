import api from './api';

const WeeklyChallengeService = {
  // Get all weekly challenges
  getAllWeeklyChallenges: () => {
    return api.get('/weekly-challenges');
  },

  // Get weekly challenge by ID
  getWeeklyChallengeById: (challengeId) => {
    return api.get(`/weekly-challenges/${challengeId}`);
  },

  // Get current weekly challenge
  getCurrentWeeklyChallenge: () => {
    return api.get('/weekly-challenges/current');
  },

  // Get upcoming weekly challenges
  getUpcomingWeeklyChallenges: () => {
    return api.get('/weekly-challenges/upcoming');
  },

  // Get past weekly challenges
  getPastWeeklyChallenges: () => {
    return api.get('/weekly-challenges/past');
  },

  // Create a new weekly challenge (admin only)
  createWeeklyChallenge: (challengeData) => {
    return api.post('/weekly-challenges', challengeData);
  },

  // Update a weekly challenge (admin only)
  updateWeeklyChallenge: (challengeId, challengeData) => {
    return api.put(`/weekly-challenges/${challengeId}`, challengeData);
  },

  // Delete a weekly challenge (admin only)
  deleteWeeklyChallenge: (challengeId) => {
    return api.delete(`/weekly-challenges/${challengeId}`);
  },

  // Get tier lists for a weekly challenge
  getWeeklyChallengeTierLists: (challengeId) => {
    return api.get(`/weekly-challenges/${challengeId}/tierlists`);
  },

  // Get categories for a weekly challenge
  getWeeklyChallengeCategories: (challengeId) => {
    return api.get(`/weekly-challenges/${challengeId}/categories`);
  },

  // Add a category to a weekly challenge (admin only)
  addWeeklyChallengeCategory: (challengeId, categoryId) => {
    return api.post(`/weekly-challenges/${challengeId}/categories`, { categoryId });
  },

  // Remove a category from a weekly challenge (admin only)
  removeWeeklyChallengeCategory: (challengeId, categoryId) => {
    return api.delete(`/weekly-challenges/${challengeId}/categories/${categoryId}`);
  }
};

export default WeeklyChallengeService; 