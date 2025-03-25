import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faCog, faUser, faHome, faSignOutAlt, faImage, faEdit, faTrash, faTrashAlt, faThumbsUp, faThumbsDown, faBug, faListAlt } from '@fortawesome/free-solid-svg-icons';
import DatabaseTablesModal from '../components/DatabaseTablesModal';
import DatabaseTestModal from '../components/DatabaseTestModal';
import UserTierListsModal from '../components/UserTierListsModal';
import TierListService from '../services/TierListService';
import '../styles/TierLists.css';
import '../styles/FixTierCards.css';
import { useAuth } from '../context/AuthContext';
import UserTierLists from '../components/UserTierLists';

const TierLists = () => {
  const { user } = useAuth(); // Get current user from AuthContext
  const [currentCategory, setCurrentCategory] = useState('wings');
  const [tierListName, setTierListName] = useState('');
  const [selectedTiers, setSelectedTiers] = useState({});
  const [tierLists, setTierLists] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showDatabaseTestModal, setShowDatabaseTestModal] = useState(false);
  const [showTierListsModal, setShowTierListsModal] = useState(false); // New state for tier lists modal
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [showImagePopout, setShowImagePopout] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTierList, setSelectedTierList] = useState(null);
  const [recipeCategories, setRecipeCategories] = useState({
    wings: [],
    pasta: [],
    steak: [],
    soup: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState({});
  const [creatingTierList, setCreatingTierList] = useState(false);
  const [creatingTierListSuccess, setCreatingTierListSuccess] = useState(false);
  const [loadingTierLists, setLoadingTierLists] = useState(false);
  const [tierListsError, setTierListsError] = useState(null);

  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  // Modified useEffect to use AuthContext
  useEffect(() => {
    // Set current user from context
    if (user) {
      console.log('[DEBUG] Using user from AuthContext:', user);
      setCurrentUser({
        userId: user.id,
        username: user.username,
        email: user.email,
        pictureUrl: user.pictureUrl,
        isAdmin: user.isAdmin,
        authenticated: user.isAuthenticated
      });
      // Fetch the user's tier lists after setting the user
      fetchUserTierLists();
    }
  }, [user]);

  // Fetch active challenge
  useEffect(() => {
    fetchActiveChallenge();
  }, []);

  // Fetch recipe data from our API
  useEffect(() => {
    fetchRecipeData();
  }, []);

  // Function to fetch the current active challenge
  const fetchActiveChallenge = async () => {
    try {
      // Determine the API URL based on the environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? '/api/challenges/active/latest'
        : 'http://localhost:8083/api/challenges/active/latest';
      
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No active challenge found.');
          // Create a fallback challenge for testing if none exists
          setActiveChallenge({
            challengeId: 1,
            weekNumber: getWeekNumber(new Date()),
            year: new Date().getFullYear(),
            status: 'active'
          });
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Active challenge data:', data);
      setActiveChallenge(data);
      return data;
    } catch (error) {
      console.error('Error fetching active challenge:', error);
      // Create a fallback challenge for testing
      setActiveChallenge({
        challengeId: 1,
        weekNumber: getWeekNumber(new Date()),
        year: new Date().getFullYear(),
        status: 'active'
      });
      return null;
    }
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Helper function to get category ID from name
  const getCategoryId = (categoryName) => {
    // This is a simplified mapping - ideally this would come from backend
    const categoryMap = {
      'wings': 1,
      'pasta': 2,
      'steak': 3,
      'soup': 4
    };
    return categoryMap[categoryName] || 1; // Default to 1 if not found
  };

  // Helper function to get tier ID from name
  const getTierId = (tierName) => {
    // This is a simplified mapping - ideally this would come from backend
    const tierMap = {
      'S Tier': 1,
      'A Tier': 2,
      'B Tier': 3,
      'C Tier': 4
    };
    return tierMap[tierName] || 1; // Default to 1 if not found
  };

  const fetchRecipeData = async () => {
    try {
      setLoading(true);
      
      // Determine the API URL based on the environment
      // In Docker, services communicate using their service names
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? 'http://api:8083/api/recipe-cards/categories'
        : 'http://localhost:8083/api/recipe-cards/categories';
      
      console.log('Environment detection:', { isDocker, apiUrl });
      console.log('Attempting to fetch from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      
      // Data is already in the format we need - direct assignment should work
      setRecipeCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching recipe data:', err);
      setError('Failed to load recipes. Please try again later.');
      
      // Fallback to some sample data if API call fails
      setRecipeCategories({
        wings: [
          { recipe_id: 29, title: 'Lemon Pepper Wings', description: 'Crispy wings with a tangy, zesty flavor.', image_url: '' },
          { recipe_id: 30, title: 'Mango Habanero Wings', description: 'Sweet and spicy wings with a tropical kick.', image_url: '' },
          { recipe_id: 31, title: 'Garlic Parmesan Wings', description: 'Savory wings with garlic and cheese.', image_url: '' },
          { recipe_id: 32, title: 'BBQ Wings', description: 'Classic smoky BBQ wings.', image_url: '' },
          { recipe_id: 33, title: 'Spicy Korean Wings', description: 'Bold wings with Korean chili paste.', image_url: '' }
        ],
        pasta: [
          { recipe_id: 34, title: 'Shrimp Alfredo', description: 'Creamy pasta with succulent shrimp.', image_url: '' },
          { recipe_id: 35, title: 'Spaghetti Bolognese', description: 'Traditional Italian pasta with meat sauce.', image_url: '' },
          { recipe_id: 36, title: 'Pesto Chicken Pasta', description: 'Pasta with basil pesto and chicken.', image_url: '' },
          { recipe_id: 37, title: 'Penne Arrabbiata', description: 'Spicy penne pasta in tomato sauce.', image_url: '' },
          { recipe_id: 38, title: 'Fettuccine Carbonara', description: 'Classic pasta with eggs and pancetta.', image_url: '' }
        ],
        steak: [
          { recipe_id: 39, title: 'Ribeye Steak', description: 'Juicy ribeye with garlic butter.', image_url: '' },
          { recipe_id: 40, title: 'Filet Mignon', description: 'Tender steak with red wine sauce.', image_url: '' },
          { recipe_id: 41, title: 'NY Strip Steak', description: 'Classic steak with peppercorn sauce.', image_url: '' },
          { recipe_id: 42, title: 'T-bone Steak', description: 'Impressive cut with herb butter.', image_url: '' },
          { recipe_id: 43, title: 'Sirloin Steak', description: 'Flavorful sirloin with mashed potatoes.', image_url: '' }
        ],
        soup: [
          { recipe_id: 44, title: 'Chicken Soup', description: 'Comforting soup with vegetables.', image_url: '' },
          { recipe_id: 45, title: 'Beef Soup', description: 'Hearty soup with tender beef.', image_url: '' },
          { recipe_id: 46, title: 'Tomato Soup', description: 'Classic creamy tomato soup.', image_url: '' },
          { recipe_id: 47, title: 'Vegetable Soup', description: 'Healthy soup with seasonal vegetables.', image_url: '' },
          { recipe_id: 48, title: 'Minestrone', description: 'Italian vegetable soup with pasta.', image_url: '' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear user data and redirect to login
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const cycleCategory = () => {
    // Cycle through the recipe categories: wings -> pasta -> steak -> soup -> wings
    const categories = ['wings', 'pasta', 'steak', 'soup'];
    const currentIndex = categories.indexOf(currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    setCurrentCategory(categories[nextIndex]);
  };

  const getCurrentRecipes = () => {
    console.log('Getting recipes for category:', currentCategory);
    console.log('Available categories:', Object.keys(recipeCategories));
    console.log('Number of recipes in this category:', recipeCategories[currentCategory]?.length || 0);
    
    // Ensure we return all available recipes for the current category
    return recipeCategories[currentCategory] || [];
  };

  const handleTierSelect = (recipeId, tier) => {
    console.log(`Selected ${tier} for recipe ID: ${recipeId}`);
    setSelectedTiers(prev => ({
      ...prev,
      [recipeId]: tier
    }));
  };

  const handleImageClick = (recipeId) => {
    setSelectedRecipeId(recipeId);
    setImageLoading(true);
    setShowImagePopout(true);
    
    // Force reload the image for the popup
    const recipe = getCurrentRecipes().find(recipe => recipe.recipe_id === recipeId);
    if (recipe && recipe.image_url) {
      const imageObj = getImageUrl(recipe.image_url);
      if (imageObj && !preloadedImages[recipeId]) {
        preloadImage(imageObj, recipeId);
      }
    }
  };

  const closeImagePopout = () => {
    setShowImagePopout(false);
    setSelectedRecipeId(null);
    setImageLoading(true);
  };

  // Utility function to convert Google Drive links to proper image URLs
  const getImageUrl = (driveUrl) => {
    if (!driveUrl) return null;
    
    console.log('Processing image URL:', driveUrl);
    
    // Check if it's a Google Drive URL
    if (driveUrl.includes('drive.google.com/file/d/')) {
      try {
        // Extract the file ID from the Google Drive URL
        const fileId = driveUrl.match(/\/file\/d\/([^\/]+)/)[1];
        console.log('Extracted file ID:', fileId);
        
        // Return an array of potential URLs to try in order
        return {
          fileId,
          // First try direct access using Google's content delivery network
          directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
          // Then try the export/view method
          exportUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
          // Finally try the thumbnail method
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
        };
      } catch (error) {
        console.error('Error extracting file ID from Google Drive URL:', error);
        return null;
      }
    }
    
    // If not a Google Drive URL or couldn't extract ID, return original
    return driveUrl;
  };

  // A function to preload images for better Google Drive compatibility
  const preloadImage = (imageObj, recipeId) => {
    if (!imageObj || preloadedImages[recipeId]) return;
    
    // If it's a string (direct URL), just try that
    if (typeof imageObj === 'string') {
      const img = new Image();
      img.onload = () => {
        console.log(`Direct URL successful for recipe ${recipeId}`);
        setPreloadedImages(prev => ({
          ...prev,
          [recipeId]: imageObj
        }));
      };
      img.onerror = () => {
        console.log(`Direct URL failed for recipe ${recipeId}`);
        // Set a placeholder image on error
        setPreloadedImages(prev => ({
          ...prev,
          [recipeId]: "https://placehold.co/300x300/gray/white?text=No+Image"
        }));
      };
      img.src = imageObj;
      return;
    }

    // For Google Drive images, try each URL format in order
    console.log(`Preloading image for recipe ${recipeId}:`, imageObj);
    
    // Try direct URL first
    const tryDirectUrl = () => {
      const img = new Image();
      img.onload = () => {
        console.log(`Direct URL successful for recipe ${recipeId}`);
        setPreloadedImages(prev => ({
          ...prev,
          [recipeId]: imageObj.directUrl
        }));
      };
      img.onerror = () => {
        console.log(`Direct URL failed for recipe ${recipeId}, trying export URL...`);
        // If direct URL fails, try export URL
        setTimeout(tryExportUrl, 100);
      };
      img.src = imageObj.directUrl;
    };
    
    // Then try export URL
    const tryExportUrl = () => {
      const img = new Image();
      img.onload = () => {
        console.log(`Export URL successful for recipe ${recipeId}`);
        setPreloadedImages(prev => ({
          ...prev,
          [recipeId]: imageObj.exportUrl
        }));
      };
      img.onerror = () => {
        console.log(`Export URL failed for recipe ${recipeId}, trying thumbnail URL...`);
        // If export URL fails, try thumbnail URL
        setTimeout(tryThumbnailUrl, 100);
      };
      img.src = imageObj.exportUrl;
    };
    
    // Finally try thumbnail URL
    const tryThumbnailUrl = () => {
      const img = new Image();
      img.onload = () => {
        console.log(`Thumbnail URL successful for recipe ${recipeId}`);
        setPreloadedImages(prev => ({
          ...prev,
          [recipeId]: imageObj.thumbnailUrl
        }));
      };
      img.onerror = () => {
        console.log(`All URL formats failed for recipe ${recipeId}`);
        // Set a placeholder image when all attempts fail
        setPreloadedImages(prev => ({
          ...prev,
          [recipeId]: "https://placehold.co/300x300/gray/white?text=No+Image"
        }));
      };
      img.src = imageObj.thumbnailUrl;
    };
    
    // Start the chain of attempts
    tryDirectUrl();
  };

  // Helper to get the image source for a recipe
  const getRecipeImageSrc = (recipe) => {
    if (!recipe.image_url) return null;
    if (preloadedImages[recipe.recipe_id]) return preloadedImages[recipe.recipe_id];
    
    const imageObj = getImageUrl(recipe.image_url);
    if (!imageObj) return "https://placehold.co/300x300/gray/white?text=No+Image";
    
    // If it's a string, use that directly
    if (typeof imageObj === 'string') return imageObj;
    
    // Otherwise use the direct URL by default and let the preloader update it later
    return imageObj.directUrl;
  };

  // Update to preload images when recipes are fetched
  useEffect(() => {
    if (!loading && recipeCategories) {
      // Preload images for all recipes
      Object.values(recipeCategories).flat().forEach(recipe => {
        if (recipe.image_url) {
          const imageObj = getImageUrl(recipe.image_url);
          if (imageObj) { // Only preload if we got a valid URL or URL object back
            preloadImage(imageObj, recipe.recipe_id);
          }
        }
      });
    }
  }, [loading, recipeCategories]);

  const handleEditClick = (tierList) => {
    setSelectedTierList(tierList);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedTierList(null);
  };

  const createTierList = async () => {
    if (!tierListName.trim()) {
      alert("Please enter a tier list name");
      return;
    }

    if (Object.keys(selectedTiers).length === 0) {
      alert("Please select at least one tier for an item");
      return;
    }

    try {
      // Check for current user
      if (!currentUser || !currentUser.userId) {
        alert("You must be logged in to create a tier list");
        return;
      }

      setCreatingTierList(true);
      setCreatingTierListSuccess(false);
      setTierListsError(null);
      console.log("Starting tier list creation process");

      // Make sure we have an active challenge
      let challenge = activeChallenge;
      if (!challenge) {
        console.log("No active challenge in state, fetching one...");
        challenge = await fetchActiveChallenge();
        if (!challenge) {
          console.warn("No active challenge available");
          challenge = {
            challengeId: 1, // Fallback challenge ID
            weekNumber: getWeekNumber(new Date()),
            year: new Date().getFullYear(),
            status: 'active'
          };
        }
      }
      console.log("Using challenge:", challenge);

      // Get all recipes from all categories for reference
      const allRecipes = [
        ...recipeCategories.wings,
        ...recipeCategories.pasta, 
        ...recipeCategories.steak, 
        ...recipeCategories.soup
      ];

      console.log('Total recipes available:', allRecipes.length);
      console.log('Selected recipes:', Object.keys(selectedTiers));

      // Create the recipes array according to the specified format
      const recipes = Object.entries(selectedTiers).map(([recipeId, tierName], index) => {
        const recipeIdInt = parseInt(recipeId);
        console.log(`Processing recipe ID ${recipeIdInt} for tier ${tierName}`);
        
        return {
          recipeId: recipeIdInt,
          tierId: getTierId(tierName),
          position: index + 1
        };
      });
      
      console.log('Creating tier list with category:', currentCategory);
      const categoryId = getCategoryId(currentCategory);
      console.log('Category ID:', categoryId);
      
      // Prepare tier list data according to the specified format
      const tierListData = {
        name: tierListName,
        userId: currentUser.userId,
        categoryId: categoryId,
        challengeId: challenge ? challenge.challengeId : null,
        isPublic: true,
        recipes: recipes
      };
      
      console.log('Sending tier list data:', JSON.stringify(tierListData));
      
      // Use the TierListService to create the tier list with recipes
      const result = await TierListService.createTierListWithRecipes(tierListData);
      
      console.log('Tier list created successfully:', result);
      
      // All successful - refresh tier lists and show success message
      setTierListName('');
      setSelectedTiers({});
      setCreatingTierListSuccess(true);
      
      // Set a timer to hide success message after 3 seconds
      setTimeout(() => setCreatingTierListSuccess(false), 3000);
      
      // Refresh user's tier lists
      console.log('Refreshing tier lists after successful creation');
      await fetchUserTierLists();
      
      return result;
    } catch (error) {
      console.error('Error creating tier list:', error);
      setTierListsError(`Failed to create tier list: ${error.message}`);
      throw error;
    } finally {
      setCreatingTierList(false);
    }
  };

  const tiers = ['S Tier', 'A Tier', 'B Tier', 'C Tier'];

  // Get the current category display name
  const getCategoryDisplayName = () => {
    const nameMap = {
      'wings': 'Chicken Wings',
      'pasta': 'Pasta Dishes',
      'steak': 'Steak Entrees',
      'soup': 'Soups'
    };
    return nameMap[currentCategory] || 'Recipes';
  };

  // Fetch user's tier lists
  const fetchUserTierLists = async () => {
    // For testing, we'll force the user ID to 1 if not already set
    const userId = currentUser?.userId || 1;
    
    console.log('[DEBUG] === FETCH TIER LISTS ===');
    console.log(`[DEBUG] Fetching tier lists for user ID: ${userId}`);
    setLoadingTierLists(true);
    setTierListsError(null);
    
    try {
      // Determine the API URL based on the environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? `/api/tierlists/user/${userId}`
        : `http://localhost:8083/api/tierlists/user/${userId}`;
      
      console.log(`[DEBUG] Using API URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        credentials: 'include', // Important for authentication cookies
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`[DEBUG] API response status: ${response.status}`);
      
      if (response.status === 302) {
        console.warn('[DEBUG] Redirect detected - authentication issue');
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (!response.ok) {
        console.error(`[DEBUG] Failed to fetch tier lists: HTTP ${response.status}`);
        const errorText = await response.text();
        console.error(`[DEBUG] Error response: ${errorText}`);
        throw new Error(`API request failed: ${response.statusText || 'Unknown error'}`);
      }
      
      const responseText = await response.text();
      console.log('[DEBUG] Raw tier lists response length:', responseText.length);
      console.log('[DEBUG] Response text begins with:', responseText.substring(0, 100) + '...');
      
      if (!responseText || responseText.trim() === '') {
        console.warn('[DEBUG] Empty response from server');
        // If we received an empty response for user 1, try the fallback API
        if (userId === 1) {
          console.log('[DEBUG] Trying fallback method to fetch tier lists for user 1');
          return await fetchUserTierListsFallback();
        }
        setTierLists([]);
        setLoadingTierLists(false);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('[DEBUG] Successfully parsed JSON response');
      } catch (e) {
        console.error('[DEBUG] Failed to parse tier lists response as JSON:', e);
        console.error('[DEBUG] Problematic responseText:', responseText);
        throw new Error('Invalid response format from server');
      }
      
      console.log('[DEBUG] Parsed tier lists data type:', typeof data);
      console.log('[DEBUG] Is array?', Array.isArray(data));
      console.log('[DEBUG] Data length:', Array.isArray(data) ? data.length : 'N/A');
      if (Array.isArray(data) && data.length > 0) {
        console.log('[DEBUG] First item keys:', Object.keys(data[0]));
        console.log('[DEBUG] First item sample:', JSON.stringify(data[0]).substring(0, 200) + '...');
      }
      
      if (!Array.isArray(data)) {
        console.error('[DEBUG] Expected array of tier lists but got:', typeof data);
        console.log('[DEBUG] Data content:', data);
        
        // If we got a single object instead of an array, try to convert it
        if (data && typeof data === 'object' && (data.id || data.tierlistId)) {
          data = [data];
          console.log('[DEBUG] Converted single object to array');
        } else {
          throw new Error('Unexpected response format');
        }
      }
      
      // Format the tier lists data for display
      const formattedTierLists = data.map((tierList, index) => {
        console.log(`[DEBUG] Processing tier list ${index + 1}/${data.length}:`, tierList);
        
        // Extract the base tier list information
        const formattedTierList = {
          id: tierList.id || tierList.tierlistId,
          name: tierList.name || 'Unnamed Tier List',
          categoryName: tierList.categoryName,
          createdAt: tierList.createdAt,
          items: [],
          likedBy: []
        };
        
        console.log(`[DEBUG] Base tier list info: ID=${formattedTierList.id}, Name=${formattedTierList.name}`);
        
        // Process items if they exist
        if (tierList.items && Array.isArray(tierList.items)) {
          console.log(`[DEBUG] Processing ${tierList.items.length} items for tier list "${tierList.name}"`);
          formattedTierList.items = tierList.items.map((item, idx) => {
            console.log(`[DEBUG] Processing tier list item ${idx + 1}/${tierList.items.length}:`, item);
            
            // Get the tier name - handle multiple possible formats
            let tierName = 'S Tier'; // Default
            if (typeof item.tierName === 'string') {
              // Direct tier name from our API
              tierName = item.tierName;
            } else if (item.tier && typeof item.tier === 'string') {
              // Direct tier name as string
              tierName = item.tier;
            } else if (item.tierId) {
              // Map direct tierId to name
              const tierId = item.tierId;
              if (tierId === 1 || tierId === '1') tierName = 'S Tier';
              else if (tierId === 2 || tierId === '2') tierName = 'A Tier';
              else if (tierId === 3 || tierId === '3') tierName = 'B Tier';
              else if (tierId === 4 || tierId === '4') tierName = 'C Tier';
            }
            
            // Get the recipe name - handle multiple possible formats
            let recipeName = 'Unknown Recipe';
            if (item.recipeName) {
              recipeName = item.recipeName;
            } else if (item.recipeId) {
              recipeName = `Recipe ${item.recipeId}`;
            }
            
            const formattedItem = {
              id: item.itemId || item.id,
              recipeName,
              tier: tierName,
              position: item.position || 0
            };
            
            return formattedItem;
          });
        } else {
          console.log(`[DEBUG] No items found for tier list "${tierList.name}" or items is not an array`);
        }
        
        return formattedTierList;
      });
      
      console.log('[DEBUG] Formatted tier lists for display:', formattedTierLists);
      setTierLists(formattedTierLists);
      setLoadingTierLists(false);
      setTierListsError(null);
      console.log('[DEBUG] === END FETCH TIER LISTS ===');
      
    } catch (err) {
      console.error('[DEBUG] Error fetching user tier lists:', err);
      setTierListsError(err.message || 'Failed to load tier lists');
      setLoadingTierLists(false);
    }
  };

  // New fallback method for user 1
  const fetchUserTierListsFallback = async () => {
    try {
      console.log('[DEBUG] Using fallback method to get tier lists for user 1');
      
      // Determine the API URL based on the environment
      const isDocker = window.location.hostname !== 'localhost';
      const baseUrl = isDocker ? 'http://api:8083' : 'http://localhost:8083';
      
      // First, get all tier lists for user 1 from the generic tables API
      const tierListsUrl = `${baseUrl}/api/tables/tier_lists?filter=user_id:1`;
      console.log(`[DEBUG] Fallback tier lists URL: ${tierListsUrl}`);
      
      const tierListsResponse = await fetch(tierListsUrl, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!tierListsResponse.ok) {
        console.error(`[DEBUG] Fallback API error: ${tierListsResponse.status}`);
        throw new Error(`Failed to fetch tier lists from fallback API: ${tierListsResponse.statusText}`);
      }
      
      const tierListsData = await tierListsResponse.json();
      console.log('[DEBUG] Fallback tier lists raw data:', tierListsData);
      
      if (!Array.isArray(tierListsData) || tierListsData.length === 0) {
        console.warn('[DEBUG] No tier lists found in fallback API');
        setTierLists([]);
        setLoadingTierLists(false);
        return;
      }
      
      // Process the tier lists to the expected format
      const formattedTierLists = await Promise.all(tierListsData.map(async (tierList) => {
        // Try to get the category name
        let categoryName = 'Uncategorized';
        if (tierList.category_id) {
          try {
            const categoryUrl = `${baseUrl}/api/tables/categories?filter=category_id:${tierList.category_id}`;
            const categoryResponse = await fetch(categoryUrl, { credentials: 'include' });
            if (categoryResponse.ok) {
              const categories = await categoryResponse.json();
              if (Array.isArray(categories) && categories.length > 0) {
                categoryName = categories[0].name;
              }
            }
          } catch (e) {
            console.error('[DEBUG] Failed to fetch category name:', e);
          }
        }
        
        // Try to get items for this tier list
        let items = [];
        try {
          const itemsUrl = `${baseUrl}/api/tierlist-items/tierlist/${tierList.tierlist_id}`;
          const itemsResponse = await fetch(itemsUrl, { credentials: 'include' });
          
          if (itemsResponse.ok) {
            const itemsData = await itemsResponse.json();
            if (Array.isArray(itemsData) && itemsData.length > 0) {
              items = await Promise.all(itemsData.map(async (item) => {
                let recipeName = `Recipe ${item.recipe_id || item.original_item_id}`;
                let tierName = 'S Tier';
                
                // Try to get recipe name
                if (item.recipe_id) {
                  try {
                    const recipeUrl = `${baseUrl}/api/tables/recipes?filter=recipe_id:${item.recipe_id}`;
                    const recipeResponse = await fetch(recipeUrl, { credentials: 'include' });
                    if (recipeResponse.ok) {
                      const recipes = await recipeResponse.json();
                      if (Array.isArray(recipes) && recipes.length > 0) {
                        recipeName = recipes[0].title || recipes[0].name || recipeName;
                      }
                    }
                  } catch (e) {
                    console.error('[DEBUG] Failed to fetch recipe name:', e);
                  }
                }
                
                // Try to get tier name
                if (item.tier_id) {
                  try {
                    const tierUrl = `${baseUrl}/api/tables/tiers?filter=tier_id:${item.tier_id}`;
                    const tierResponse = await fetch(tierUrl, { credentials: 'include' });
                    if (tierResponse.ok) {
                      const tiers = await tierResponse.json();
                      if (Array.isArray(tiers) && tiers.length > 0) {
                        tierName = tiers[0].name;
                      } else {
                        // Default tier name based on ID
                        if (item.tier_id === 1) tierName = 'S Tier';
                        else if (item.tier_id === 2) tierName = 'A Tier';
                        else if (item.tier_id === 3) tierName = 'B Tier';
                        else if (item.tier_id === 4) tierName = 'C Tier';
                      }
                    }
                  } catch (e) {
                    console.error('[DEBUG] Failed to fetch tier name:', e);
                  }
                }
                
                return {
                  id: item.id || item.item_id,
                  recipeName,
                  tier: tierName,
                  position: item.position || 0
                };
              }));
            }
          }
        } catch (e) {
          console.error('[DEBUG] Failed to fetch tier list items:', e);
        }
        
        return {
          id: tierList.tierlist_id,
          name: tierList.name || 'Unnamed Tier List',
          categoryName,
          createdAt: tierList.created_at,
          items
        };
      }));
      
      console.log('[DEBUG] Final formatted tier lists from fallback:', formattedTierLists);
      setTierLists(formattedTierLists);
      setLoadingTierLists(false);
    } catch (error) {
      console.error('[DEBUG] Error in fallback method:', error);
      setTierListsError(`Fallback error: ${error.message}`);
      setLoadingTierLists(false);
    }
  };

  useEffect(() => {
    // Fetch user tier lists when the component mounts or when the user changes
    if (currentUser && currentUser.userId) {
      console.log('Fetching tier lists for user:', currentUser.userId);
      fetchUserTierLists();
    } else {
      // When no user is present but we're in development mode,
      // fetch tier lists for user ID 1 for testing
      console.log('No user detected, but fetching tier lists for user ID 1 for testing');
      fetchUserTierLists();
    }
  }, [currentUser]);

  // Helper utility to check if a tier list has valid items
  const hasTierListValidItems = (tierList) => {
    return tierList.items && 
           Array.isArray(tierList.items) && 
           tierList.items.length > 0 &&
           tierList.items.some(item => item.recipeName && item.tier);
  };

  // Helper function to get status of tier lists
  const getTierListsStatus = () => {
    if (loadingTierLists) return 'loading';
    if (tierListsError) return 'error';
    if (!tierLists || tierLists.length === 0) return 'empty';
    
    // Check if there are tier lists but none have items
    const hasAnyValidItems = tierLists.some(tierList => hasTierListValidItems(tierList));
    if (!hasAnyValidItems) return 'no-items';
    
    return 'success';
  };

  const debugRefresh = async () => {
    console.log('========== DEBUG INFO ==========');
    console.log('Current user:', user);
    
    // Define the base URL based on environment
    const API_BASE_URL = process.env.REACT_APP_DOCKER_ENV === "true" 
      ? "http://localhost:8083" 
      : "http://localhost:8083";
    
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('window.location.hostname:', window.location.hostname);
    
    // Get what the API URL would be based on location
    const isDocker = window.location.hostname !== 'localhost';
    const tierListsUrl = isDocker 
      ? `/api/tierlists/user/${user?.userId || 1}`
      : `http://localhost:8083/api/tierlists/user/${user?.userId || 1}`;
    
    console.log('Calculated tier lists URL:', tierListsUrl);
    
    try {
      console.log('Attempting direct fetch with credentials...');
      const response = await fetch(tierListsUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      const text = await response.text();
      console.log('Response length:', text.length);
      console.log('Response preview:', text.substring(0, 200) + '...');
      
      try {
        const data = JSON.parse(text);
        console.log('Parsed data type:', typeof data);
        console.log('Is array?', Array.isArray(data));
        console.log('Data length:', Array.isArray(data) ? data.length : 'N/A');
        if (Array.isArray(data) && data.length > 0) {
          console.log('First item keys:', Object.keys(data[0]));
        }
      } catch (e) {
        console.error('JSON parse error:', e);
      }
    } catch (e) {
      console.error('Direct fetch error:', e);
    }
    
    console.log('Refreshing tier lists via component...');
    await fetchUserTierLists();
    console.log('===============================');
  };

  return (
    <div className="tierlists-background" style={backgroundStyle}>
      <div className="fixed-header">
        <div className="nav-buttons">
          <div className="user-profile">
            {currentUser && (
              <button 
                className="settings-btn user-btn" 
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FontAwesomeIcon icon={faUser} />
              </button>
            )}
            {showUserMenu && (
              <div className="settings-menu user-menu">
                <Link to="/profile">
                  <button id="settings-menu-item">
                    <FontAwesomeIcon icon={faUser} /> Account
                  </button>
                </Link>
                <Link to="/community-tierlists">
                  <button id="settings-menu-item">
                    <FontAwesomeIcon icon={faListAlt} /> Community Lists
                  </button>
                </Link>
                <button id="settings-menu-item" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <h1 className="page-title">Create Your Recipe Tier List</h1>
        <div className="name-input-container">
          <div className="input-row">
            <div className="create-tierlist">
              <input
                type="text"
                placeholder="Enter Name for Your Tier List"
                value={tierListName}
                onChange={(e) => setTierListName(e.target.value)}
                className="tierlist-name-input"
              />
              <button 
                id="create-tierlist-btn"
                className={Object.keys(selectedTiers).length > 0 ? 'active' : 'disabled'}
                disabled={Object.keys(selectedTiers).length === 0 || creatingTierList}
                onClick={createTierList}
              >
                {creatingTierList ? 'Creating...' : 'Create Tier List'}
              </button>
              {creatingTierListSuccess && (
                <div className="success-message">
                  <span>Tier List Created Successfully!</span>
                </div>
              )}
              {tierListsError && (
                <div className="error-message">
                  <span>{tierListsError}</span>
                  <button onClick={() => setTierListsError(null)} className="dismiss-btn">×</button>
                </div>
              )}
            </div>
            {currentUser && currentUser.isAdmin && (
              <button 
                className="cycle-week-btn"
                onClick={cycleCategory}
                title="Next Category of Recipes"
              >
                <FontAwesomeIcon icon={faArrowsRotate} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="settings-container">
        {currentUser && currentUser.isAdmin && (
          <>
            <button 
              className="settings-btn" 
              onClick={() => setShowMenu(!showMenu)}
            >
              <FontAwesomeIcon icon={faCog} />
            </button>
            {showMenu && (
              <div className="settings-menu">
                <button id="settings-menu-item" onClick={() => setShowDatabaseModal(true)}>
                  Database Tables
                </button>
                <button id="settings-menu-item" onClick={() => setShowDatabaseTestModal(true)}>
                  Database Testing
                </button>
                <button id="settings-menu-item" onClick={() => setShowTierListsModal(true)}>
                  <FontAwesomeIcon icon={faListAlt} /> My Tier Lists
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="content-wrapper">
        <div className="tierlists-container">
          <h2 className="category-heading">{getCategoryDisplayName()}</h2>
          {loading ? (
            <div className="loading-indicator">Loading recipes...</div>
          ) : error ? (
            <div className="error-message">
              {error}
              <br />
              <small>(Showing fallback recipe data)</small>
            </div>
          ) : (
            <div className="recipe-cards-container">
              {getCurrentRecipes().length === 0 ? (
                <div className="error-message">No recipes found for {getCategoryDisplayName()}</div>
              ) : (
                getCurrentRecipes().map(recipe => (
                  <div key={recipe.recipe_id} className="tier-card">
                    <h2 title={recipe.title}>{recipe.title}</h2>
                    <p title={recipe.description}>{recipe.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                      <button 
                        className="recipe-image-btn" 
                        onClick={() => handleImageClick(recipe.recipe_id)}
                        style={{
                          backgroundImage: getRecipeImageSrc(recipe) ? 
                            `url(${getRecipeImageSrc(recipe)})` : 
                            'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          backgroundColor: 'rgba(240, 240, 240, 0.8)'
                        }}
                      >
                        {!getRecipeImageSrc(recipe) && 
                          <FontAwesomeIcon icon={faImage} />
                        }
                        {recipe.image_url && !preloadedImages[recipe.recipe_id] && 
                          <div className="image-loading-overlay">
                            <div className="loading-spinner"></div>
                          </div>
                        }
                      </button>
                      <div className="tier-items">
                        {tiers.map(tier => (
                          <span
                            key={tier}
                            className={`tier-item ${selectedTiers[recipe.recipe_id] === tier ? 'selected' : ''}`}
                            onClick={() => handleTierSelect(recipe.recipe_id, tier)}
                          >
                            {tier}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <DatabaseTablesModal 
        isOpen={showDatabaseModal} 
        onClose={() => setShowDatabaseModal(false)} 
      />

      <DatabaseTestModal
        isOpen={showDatabaseTestModal}
        onClose={() => setShowDatabaseTestModal(false)}
      />
      
      <UserTierListsModal
        isOpen={showTierListsModal}
        onClose={() => setShowTierListsModal(false)}
        onRefresh={() => fetchUserTierLists()}
        isAdmin={currentUser?.isAdmin}
        onDebug={debugRefresh}
      />

      {showImagePopout && (
        <div className="image-popout-overlay" onClick={closeImagePopout}>
          <div className="image-popout-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-popout-btn" onClick={closeImagePopout}>×</button>
            <div className="image-container">
              {selectedRecipeId && getCurrentRecipes().find(recipe => recipe.recipe_id === selectedRecipeId)?.image_url ? (
                preloadedImages[selectedRecipeId] ? (
                  // If we have a preloaded image, use an img tag
                  <img 
                    src={preloadedImages[selectedRecipeId]} 
                    alt={getCurrentRecipes().find(recipe => recipe.recipe_id === selectedRecipeId)?.title}
                    className="recipe-image"
                    onLoad={() => {
                      console.log('Popup image loaded');
                      setImageLoading(false);
                    }}
                    onError={(e) => {
                      console.error('Image failed to load in popup:', e);
                      setImageLoading(false);
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/300x300/gray/white?text=No+Image";
                    }}
                    style={{
                      maxWidth: "100%", 
                      maxHeight: "300px", 
                      objectFit: "cover",
                      display: imageLoading ? "none" : "block" // Hide while loading
                    }}
                  />
                ) : (
                  // If we don't have a preloaded image yet, use a div with background-image
                  // This approach sometimes works better with Google Drive
                  <div 
                    className="image-container-direct"
                    style={{
                      backgroundImage: `url(${getRecipeImageSrc(getCurrentRecipes().find(recipe => recipe.recipe_id === selectedRecipeId))})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      width: "100%",
                      height: "300px"
                    }}
                    onLoad={() => setImageLoading(false)}
                  ></div>
                )
              ) : (
                <div className="placeholder-text">No image available for this recipe</div>
              )}
              {imageLoading && (
                <div className="loading-spinner" style={{margin: "auto"}}></div>
              )}
            </div>
            <div className="recipe-details">
              <h3>{getCurrentRecipes().find(recipe => recipe.recipe_id === selectedRecipeId)?.title}</h3>
              <p>{getCurrentRecipes().find(recipe => recipe.recipe_id === selectedRecipeId)?.description}</p>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedTierList && (
        <div className="edit-modal-overlay" onClick={closeEditModal}>
          <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeEditModal}>×</button>
            <h2 className="edit-modal-title">Edit Tier List</h2>
            
            <div className="edit-form">
              <div className="form-group">
                <label>Tier List Name</label>
                <input 
                  type="text" 
                  className="edit-tierlist-input" 
                  value={selectedTierList.name}
                  onChange={(e) => setSelectedTierList({
                    ...selectedTierList,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="form-group items-list">
                <label>Recipes</label>
                {selectedTierList.items.map((item, index) => (
                  <div key={index} className="edit-item-row">
                    <div className="item-name">{item.recipeName}</div>
                    <div className="item-actions">
                      <select 
                        value={item.tier} 
                        onChange={(e) => {
                          const updatedItems = [...selectedTierList.items];
                          updatedItems[index] = {
                            ...item,
                            tier: e.target.value
                          };
                          setSelectedTierList({
                            ...selectedTierList,
                            items: updatedItems
                          });
                        }}
                        className="tier-select"
                      >
                        <option value="S Tier">S Tier</option>
                        <option value="A Tier">A Tier</option>
                        <option value="B Tier">B Tier</option>
                        <option value="C Tier">C Tier</option>
                      </select>
                      <button 
                        className="delete-item-btn"
                        onClick={() => {
                          const updatedItems = [...selectedTierList.items];
                          updatedItems.splice(index, 1);
                          setSelectedTierList({
                            ...selectedTierList,
                            items: updatedItems
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="modal-footer">
                <button 
                  className="delete-tierlist-btn" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this tier list?')) {
                      // Handle tier list deletion
                      alert('Tier list deleted!');
                      closeEditModal();
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete List
                </button>
                <button 
                  className="save-btn" 
                  onClick={() => {
                    // Here you would implement saving the edited tier list
                    alert('Changes saved!');
                    closeEditModal();
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierLists; 