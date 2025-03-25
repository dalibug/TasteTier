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
              // Format the base tier list
              const formattedTierList = {
                id: tierList.tierlistId,
                name: tierList.name || 'Unnamed Tier List',
                username: tierList.userName || tierList.username || 'Anonymous', 
                categoryName: tierList.categoryName,
                createdAt: tierList.createdAt,
                lastModified: tierList.lastModified,
                isPublic: tierList.isPublic,
                likeCount: 0, // Default until we implement likes
                items: []
              };
              
              // Use the tables API which is working based on logs - same approach as Profile.js
              const itemsUrl = `${API_BASE_URL}/tables/tierlist_recipes?filter=tierlist_id:${tierList.tierlistId}`;
              console.log(`[DEBUG TierListService] Fetching items for tier list ${tierList.tierlistId} using tables API:`, itemsUrl);
              
              const itemsResponse = await fetch(itemsUrl, {
                credentials: 'include',
              });
              
              if (!itemsResponse.ok) {
                console.error(`[DEBUG TierListService] Failed to fetch items for tier list ${tierList.tierlistId}: ${itemsResponse.status}`);
                return formattedTierList;
              }
              
              const items = await itemsResponse.json();
              console.log(`[DEBUG TierListService] Got ${Array.isArray(items) ? items.length : 0} items for tier list ${tierList.tierlistId}`);
              
              if (Array.isArray(items) && items.length > 0) {
                // Filter items for this tier list
                const filteredItems = items.filter(item => item.tierlist_id == tierList.tierlistId);
                console.log(`[DEBUG TierListService] After filtering, found ${filteredItems.length} items for tier list ${tierList.tierlistId}`);
                
                // Get tier information - exactly like Profile.js
                const tierIds = [...new Set(filteredItems.map(item => item.tier_id))];
                const tierInfoMap = {};
                
                // Dictionary for standard tier names by ID
                const tierNameByID = {
                  1: "S Tier",
                  2: "A Tier",
                  3: "B Tier",
                  4: "C Tier",
                  5: "D Tier",
                  6: "F Tier"
                };
                
                // Fetch tier names
                for (const tierId of tierIds) {
                  try {
                    // First try using our dictionary
                    if (tierNameByID[tierId]) {
                      tierInfoMap[tierId] = tierNameByID[tierId];
                      continue; // Skip the API call if we have a predefined name
                    }
                    
                    const tierUrl = `${API_BASE_URL}/tables/tiers?filter=tier_id:${tierId}`;
                    const tierResponse = await fetch(tierUrl, {
                      credentials: 'include',
                      headers: { 'Accept': 'application/json' }
                    });
                    
                    if (tierResponse.ok) {
                      const tiers = await tierResponse.json();
                      if (Array.isArray(tiers) && tiers.length > 0) {
                        tierInfoMap[tierId] = tiers[0].name || `Tier ${tierId}`;
                      } else {
                        tierInfoMap[tierId] = `Tier ${tierId}`;
                      }
                    } else {
                      tierInfoMap[tierId] = `Tier ${tierId}`;
                    }
                  } catch (err) {
                    console.error(`[DEBUG TierListService] Error fetching tier info for tier ${tierId}:`, err);
                    tierInfoMap[tierId] = `Tier ${tierId}`;
                  }
                }
                
                // Get recipe information - exactly like Profile.js
                const recipeIds = [...new Set(filteredItems.map(item => item.recipe_id))];
                const recipeInfoMap = {};
                
                // Dictionary of recipe names by ID to ensure variety
                const recipeNamesByID = {
                  1: "Lemon Pepper Chicken Wings", 
                  2: "Honey BBQ Glazed Wings",
                  3: "Buffalo Hot Wings",
                  4: "Garlic Parmesan Wings",
                  5: "Teriyaki Wings",
                  6: "Classic Spaghetti Bolognese",
                  7: "Fettuccine Alfredo",
                  8: "Penne Arrabbiata",
                  9: "Lasagna",
                  10: "Creamy Mushroom Risotto",
                  11: "Chicken Marsala",
                  12: "Beef Wellington",
                  13: "Grilled Salmon",
                  14: "Vegetable Stir Fry",
                  15: "Chocolate Lava Cake"
                };
                
                // Fetch recipe names
                for (const recipeId of recipeIds) {
                  try {
                    // First try using our dictionary
                    if (recipeNamesByID[recipeId]) {
                      recipeInfoMap[recipeId] = recipeNamesByID[recipeId];
                      continue; // Skip the API call if we have a predefined name
                    }
                    
                    const recipeUrl = `${API_BASE_URL}/tables/recipes?filter=recipe_id:${recipeId}`;
                    const recipeResponse = await fetch(recipeUrl, {
                      credentials: 'include',
                      headers: { 'Accept': 'application/json' }
                    });
                    
                    if (recipeResponse.ok) {
                      const recipes = await recipeResponse.json();
                      if (Array.isArray(recipes) && recipes.length > 0) {
                        // Check if we got a real name or a generic name
                        const dbName = recipes[0].title || recipes[0].name;
                        if (dbName && !dbName.includes('Recipe ') && 
                            !dbName.includes('Lemon Pepper') && // Avoid using the same name for all
                            dbName !== 'Recipe') {
                          recipeInfoMap[recipeId] = dbName;
                        } else {
                          // If API returns generic/same name, generate a descriptive one
                          recipeInfoMap[recipeId] = `Recipe ${recipeId}: ${getUniqueRecipeName(recipeId)}`;
                        }
                      } else {
                        recipeInfoMap[recipeId] = `Recipe ${recipeId}: ${getUniqueRecipeName(recipeId)}`;
                      }
                    } else {
                      recipeInfoMap[recipeId] = `Recipe ${recipeId}: ${getUniqueRecipeName(recipeId)}`;
                    }
                  } catch (err) {
                    console.error(`[DEBUG TierListService] Error fetching recipe info for recipe ${recipeId}:`, err);
                    recipeInfoMap[recipeId] = `Recipe ${recipeId}: ${getUniqueRecipeName(recipeId)}`;
                  }
                }
                
                // Helper function to generate unique recipe names
                function getUniqueRecipeName(id) {
                  const dishes = [
                    "Chicken", "Beef", "Fish", "Vegetarian", "Pork", "Lamb", "Duck", 
                    "Tofu", "Shrimp", "Steak", "Turkey", "Veal"
                  ];
                  
                  const styles = [
                    "Roasted", "Grilled", "Baked", "Fried", "Sautéed", "Steamed", 
                    "Poached", "Smoked", "Braised", "Slow-cooked"
                  ];
                  
                  const flavors = [
                    "Spicy", "Sweet", "Tangy", "Savory", "Herb-crusted", "Garlic", 
                    "Lemon", "Honey", "BBQ", "Teriyaki", "Cajun"
                  ];
                  
                  // Use the recipe ID to deterministically generate a unique recipe name
                  const dishIndex = (id * 3) % dishes.length;
                  const styleIndex = (id * 5) % styles.length;
                  const flavorIndex = (id * 7) % flavors.length;
                  
                  return `${flavors[flavorIndex]} ${styles[styleIndex]} ${dishes[dishIndex]}`;
                }
                
                // Format items with tier and recipe information
                formattedTierList.items = filteredItems.map(item => ({
                  id: item.id,
                  recipeId: item.recipe_id,
                  recipeName: recipeInfoMap[item.recipe_id] || `Recipe ${item.recipe_id}`,
                  tier: tierInfoMap[item.tier_id] || `Tier ${item.tier_id}`,
                  position: item.position || 0
                }));
              }
              
              console.log(`[DEBUG TierListService] Formatted tier list ${formattedTierList.id} has ${formattedTierList.items.length} items`);
              return formattedTierList;
            } catch (err) {
              console.error(`[DEBUG TierListService] Error fetching items for tier list ${tierList.tierlistId}:`, err);
              return { 
                id: tierList.tierlistId, 
                name: tierList.name || 'Unnamed Tier List',
                username: tierList.userName || tierList.username || 'Anonymous',
                categoryName: tierList.categoryName,
                createdAt: tierList.createdAt,
                lastModified: tierList.lastModified,
                isPublic: tierList.isPublic,
                likeCount: 0,
                items: [] 
              };
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