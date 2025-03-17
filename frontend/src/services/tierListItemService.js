import api from './api';

const TierListItemService = {
  // Get all items in a tier list
  getTierListItemsByTierListId: (tierListId) => {
    return api.get(`/tierlist-items/tierlist/${tierListId}`);
  },

  // Get a specific tier list item
  getTierListItemById: (itemId) => {
    return api.get(`/tierlist-items/${itemId}`);
  },

  // Create a new tier list item
  createTierListItem: (itemData) => {
    return api.post('/tierlist-items', itemData);
  },

  // Create multiple tier list items in batch
  createTierListItemsBatch: (itemsData) => {
    return api.post('/tierlist-items/batch', itemsData);
  },

  // Update a tier list item
  updateTierListItem: (itemId, itemData) => {
    return api.put(`/tierlist-items/${itemId}`, itemData);
  },

  // Delete a tier list item
  deleteTierListItem: (itemId) => {
    return api.delete(`/tierlist-items/${itemId}`);
  },

  // Delete all items in a tier list
  deleteAllItemsInTierList: (tierListId) => {
    return api.delete(`/tierlist-items/tierlist/${tierListId}`);
  },

  // Update item positions in batch
  updateItemPositions: (positionsData) => {
    return api.put('/tierlist-items/positions', positionsData);
  }
};

export default TierListItemService; 