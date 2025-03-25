import { API_BASE_URL } from '../config';

const TierListService = {
  // Get all tier lists for a specific user
  getUserTierLists: async (userId) => {
    console.log('[DEBUG TierListService] Getting tier lists for user ID:', userId);
    console.log('[DEBUG TierListService] API base URL:', API_BASE_URL);
    
    try {
      const apiUrl = `${API_BASE_URL}/tierlists/user/${userId}`;
      console.log('[DEBUG TierListService] Full API URL:', apiUrl);
      
      console.log('[DEBUG TierListService] Making fetch request with credentials included');
      const response = await fetch(apiUrl, {
        credentials: 'include', // Include credentials for authentication
      });
      
      console.log('[DEBUG TierListService] Response status:', response.status);
      console.log('[DEBUG TierListService] Response status text:', response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG TierListService] Error response body:', errorText);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Get the response as text first to inspect it
      const responseText = await response.text();
      console.log('[DEBUG TierListService] Response text (first 100 chars):', 
        responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText);
      
      let data;
      try {
        // Parse the text as JSON
        data = JSON.parse(responseText);
        console.log('[DEBUG TierListService] Successfully parsed JSON');
        console.log('[DEBUG TierListService] Data type:', typeof data);
        console.log('[DEBUG TierListService] Is array?', Array.isArray(data));
        console.log('[DEBUG TierListService] Data length:', Array.isArray(data) ? data.length : 'N/A');
        return data;
      } catch (parseError) {
        console.error('[DEBUG TierListService] JSON parse error:', parseError);
        console.error('[DEBUG TierListService] Problem with response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error("[DEBUG TierListService] Failed to fetch user tier lists:", error);
      throw error;
    }
  },

  // Get all tier lists for community page
  getAllTierLists: async () => {
    console.log('[DEBUG TierListService] Getting all tier lists for community page');
    
    try {
      const apiUrl = `${API_BASE_URL}/tierlists`;
      console.log('[DEBUG TierListService] Community API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: 'include', // Include credentials for authentication
      });
      
      console.log('[DEBUG TierListService] Community response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG TierListService] Error response body:', errorText);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Get the response as text first to inspect it
      const responseText = await response.text();
      console.log('[DEBUG TierListService] Community response text (first 100 chars):', 
        responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText);
      
      let tierLists;
      try {
        // Parse the text as JSON
        tierLists = JSON.parse(responseText);
        console.log('[DEBUG TierListService] Successfully parsed JSON');
        console.log('[DEBUG TierListService] Data type:', typeof tierLists);
        console.log('[DEBUG TierListService] Is array?', Array.isArray(tierLists));
        console.log('[DEBUG TierListService] Data length:', Array.isArray(tierLists) ? tierLists.length : 'N/A');
        
        // Fetch items for each tier list
        const tierListsWithItems = await Promise.all(
          tierLists.map(async (tierList) => {
            try {
              // Fetch tier list items
              const itemsUrl = `${API_BASE_URL}/tierlists/${tierList.tierlistId}/items`;
              console.log(`[DEBUG TierListService] Fetching items for tier list ${tierList.tierlistId}:`, itemsUrl);
              
              const itemsResponse = await fetch(itemsUrl, {
                credentials: 'include',
              });
              
              if (!itemsResponse.ok) {
                console.error(`[DEBUG TierListService] Failed to fetch items for tier list ${tierList.tierlistId}: ${itemsResponse.status}`);
                return { ...tierList, items: [] };
              }
              
              const items = await itemsResponse.json();
              console.log(`[DEBUG TierListService] Got ${Array.isArray(items) ? items.length : 0} items for tier list ${tierList.tierlistId}`);
              console.log(`[DEBUG TierListService] Items sample:`, items.length > 0 ? items[0] : 'No items');
              
              return {
                id: tierList.tierlistId,
                name: tierList.name || 'Unnamed Tier List',
                username: tierList.userName || tierList.username || 'Anonymous', 
                categoryName: tierList.categoryName,
                createdAt: tierList.createdAt,
                lastModified: tierList.lastModified,
                isPublic: tierList.isPublic,
                likeCount: 0, // Default until we implement likes
                items: Array.isArray(items) ? items : []
              };
            } catch (err) {
              console.error(`[DEBUG TierListService] Error fetching items for tier list ${tierList.tierlistId}:`, err);
              return { ...tierList, items: [] };
            }
          })
        );
        
        console.log('[DEBUG TierListService] All tier lists with items:', tierListsWithItems);
        return tierListsWithItems;
      } catch (parseError) {
        console.error('[DEBUG TierListService] JSON parse error:', parseError);
        console.error('[DEBUG TierListService] Problem with response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error("[DEBUG TierListService] Failed to fetch community tier lists:", error);
      throw error;
    }
  },

  // Get details of a specific tier list
  getTierList: async (tierlistId) => {
    console.log('[DEBUG TierListService] Getting tier list details for ID:', tierlistId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tierlists/${tierlistId}`, {
        credentials: 'include', // Include credentials for authentication
      });
      
      console.log('[DEBUG TierListService] Tier list response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[DEBUG TierListService] Failed to fetch tier list ${tierlistId}:`, error);
      throw error;
    }
  },

  // Create a new tier list (legacy method)
  createTierList: async (tierListData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tierlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
  
  // Create a new tier list with recipes included in the request
  createTierListWithRecipes: async (tierListData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tierlists/with-recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(tierListData),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to create tier list with recipes:", error);
      throw error;
    }
  },

  // Get the count of tier lists for a specific user
  getUserTierListCount: async (userId) => {
    console.log('[DEBUG TierListService] Getting tier list count for user ID:', userId);
    
    try {
      const apiUrl = `${API_BASE_URL}/users/${userId}/tierlist-count`;
      console.log('[DEBUG TierListService] Count API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: 'include', // Include credentials for authentication
      });
      
      console.log('[DEBUG TierListService] Count response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('[DEBUG TierListService] Tier list count result:', data);
      return data.count;
    } catch (error) {
      console.error("[DEBUG TierListService] Failed to fetch tier list count:", error);
      throw error;
    }
  }
};

export default TierListService; 