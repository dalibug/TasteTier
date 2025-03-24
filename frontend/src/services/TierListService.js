import { API_BASE_URL } from '../config';

const TierListService = {
  // Get all tier lists for a specific user
  getUserTierLists: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tierlists/user/${userId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch user tier lists:", error);
      throw error;
    }
  },

  // Get details of a specific tier list
  getTierList: async (tierlistId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tierlists/${tierlistId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch tier list ${tierlistId}:`, error);
      throw error;
    }
  },

  // Create a new tier list
  createTierList: async (tierListData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tierlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tierListData),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to create tier list:", error);
      throw error;
    }
  },

  // Get the count of tier lists for a specific user
  getUserTierListCount: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/tierlist-count`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error("Failed to fetch tier list count:", error);
      throw error;
    }
  }
};

export default TierListService; 