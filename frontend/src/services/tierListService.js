import api from './api';

const TierListService = {
  // Get all tier lists
  getAllTierLists: () => {
    return api.get('/tierlists');
  },

  // Get tier lists by user ID
  getTierListsByUserId: (userId) => {
    return api.get(`/tierlists/user/${userId}`);
  },

  // Get tier list by ID
  getTierListById: (tierListId) => {
    return api.get(`/tierlists/${tierListId}`);
  },

  // Create a new tier list
  createTierList: (tierListData) => {
    return api.post('/tierlists', tierListData);
  },

  // Update an existing tier list
  updateTierList: (tierListId, tierListData) => {
    return api.put(`/tierlists/${tierListId}`, tierListData);
  },

  // Delete a tier list
  deleteTierList: (tierListId) => {
    return api.delete(`/tierlists/${tierListId}`);
  },

  // Get public tier lists
  getPublicTierLists: () => {
    return api.get('/tierlists/public');
  },

  // Get tier lists by challenge ID
  getTierListsByChallengeId: (challengeId) => {
    return api.get(`/tierlists/challenge/${challengeId}`);
  },

  // Toggle tier list visibility
  toggleTierListVisibility: (tierListId) => {
    return api.put(`/tierlists/${tierListId}/toggle-visibility`);
  }
};

export default TierListService; 