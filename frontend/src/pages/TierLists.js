import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faCog, faUser, faHome, faSignOutAlt, faImage, faEdit, faTrash, faTrashAlt, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import DatabaseTablesModal from '../components/DatabaseTablesModal';
import DatabaseTestModal from '../components/DatabaseTestModal';
import '../styles/TierLists.css';
import '../styles/FixTierCards.css';

const TierLists = () => {
  const [currentCategory, setCurrentCategory] = useState('wings');
  const [tierListName, setTierListName] = useState('');
  const [selectedTiers, setSelectedTiers] = useState({});
  const [tierLists, setTierLists] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showDatabaseTestModal, setShowDatabaseTestModal] = useState(false);
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

  // Fetch current user information
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Determine the API URL based on the environment
        const isDocker = window.location.hostname !== 'localhost';
        const apiUrl = isDocker 
          ? 'http://api:8083/auth/current-user'
          : 'http://localhost:8083/auth/current-user';
        
        const response = await fetch(apiUrl, {
          credentials: 'include' // Important: include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const userData = await response.json();
        
        if (userData.authenticated) {
          setCurrentUser(userData);
          // Fetch the user's tier lists after getting the user data
          fetchUserTierLists();
        } else {
          // Not authenticated, redirect to login
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        // We don't redirect here to avoid potential redirect loops if the API is down
      }
    };
    
    fetchCurrentUser();
  }, []);

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
        ? 'http://api:8083/api/weekly-challenges/active'
        : 'http://localhost:8083/api/weekly-challenges/active';
      
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
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const challenge = await response.json();
      console.log('Active challenge:', challenge);
      setActiveChallenge(challenge);
      return challenge;
    } catch (err) {
      console.error('Error fetching active challenge:', err);
      // Create a fallback challenge for testing
      const fallbackChallenge = {
        challengeId: 1,
        weekNumber: getWeekNumber(new Date()),
        year: new Date().getFullYear(),
        status: 'active'
      };
      setActiveChallenge(fallbackChallenge);
      return fallbackChallenge;
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
    // Try to call backend logout endpoint, but continue even if it fails
    fetch('http://localhost:8083/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {
      // Ignore the error and continue with logout process
    }).finally(() => {
      // Clear frontend session
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear Google OAuth session
      const googleLogoutUrl = 'https://accounts.google.com/logout';
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = googleLogoutUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        document.body.removeChild(iframe);
        // Redirect to welcome page after Google logout
        window.location.href = '/';
      }, 1000);
    });
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
        setPreloadedImages(prev => ({
          ...prev,
          [recipeId]: imageObj
        }));
      };
      img.onerror = () => {};
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
      };
      img.src = imageObj.thumbnailUrl;
    };
    
    // Start the chain of attempts
    tryDirectUrl();
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

  // Helper to get the image source for a recipe
  const getRecipeImageSrc = (recipe) => {
    if (!recipe.image_url) return null;
    if (preloadedImages[recipe.recipe_id]) return preloadedImages[recipe.recipe_id];
    
    const imageObj = getImageUrl(recipe.image_url);
    if (!imageObj) return null;
    
    // If it's a string, use that directly
    if (typeof imageObj === 'string') return imageObj;
    
    // Otherwise use the direct URL by default and let the preloader update it later
    return imageObj.directUrl;
  };

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
            title: "Default Challenge"
          };
        }
      }
      console.log("Using challenge:", challenge);

      // Determine the API URL based on the environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? 'http://api:8083/api/tierlists'
        : 'http://localhost:8083/api/tierlists';
      
      console.log('Creating tier list with category:', currentCategory);
      const categoryId = getCategoryId(currentCategory);
      console.log('Category ID:', categoryId);
      
      // Prepare tier list data
      const tierListData = {
        name: tierListName,
        user: { userId: currentUser.userId },
        category: { categoryId: categoryId },
        challenge: { challengeId: challenge.challengeId },
        isPublic: true
      };
      
      console.log('Sending tier list data:', JSON.stringify(tierListData));
      
      // Save the tier list to the database
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tierListData)
      });
      
      // Log the raw response text first
      const responseText = await response.text();
      console.log('Raw tier list response:', responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to create tier list: ${response.status} - ${responseText}`);
      }
      
      // Parse the response text to JSON (if possible)
      let savedTierList;
      try {
        savedTierList = JSON.parse(responseText);
      } catch (e) {
        console.error('Could not parse tier list response as JSON:', e);
        throw new Error('Invalid response format from server');
      }
      
      console.log('Tier list created successfully:', savedTierList);
      
      if (!savedTierList || !savedTierList.tierlistId) {
        throw new Error('Server returned a tier list without an ID');
      }
      
      // Now save the tier list items
      const itemsApiUrl = isDocker 
        ? `http://api:8083/api/tierlist-items/batch/${savedTierList.tierlistId}`
        : `http://localhost:8083/api/tierlist-items/batch/${savedTierList.tierlistId}`;
      
      console.log('Items API URL:', itemsApiUrl);
      
      // Get all recipes from all categories for reference
      const allRecipes = [
        ...recipeCategories.wings,
        ...recipeCategories.pasta, 
        ...recipeCategories.steak, 
        ...recipeCategories.soup
      ];

      console.log('Total recipes available:', allRecipes.length);
      console.log('Selected recipes:', Object.keys(selectedTiers));

      // Create the items to be saved - ensuring we use the correct recipe IDs
      const tierlistItems = Object.entries(selectedTiers).map(([recipeId, tierName], index) => {
        const recipeIdInt = parseInt(recipeId);
        console.log(`Processing recipe ID ${recipeIdInt} for tier ${tierName}`);
        
        // Find the full recipe object
        const recipe = allRecipes.find(r => r.recipe_id === recipeIdInt);
        if (!recipe) {
          console.warn(`Warning: Recipe with ID ${recipeIdInt} not found in local data`);
        }
        
        return {
          originalItemId: recipeIdInt,  // This is the key ID that must match what's in the DB
          tierId: getTierId(tierName),
          position: index,
          tierlistId: savedTierList.tierlistId,
          recipeName: recipe?.title || `Recipe ${recipeIdInt}`
        };
      });
      
      console.log('Sending tierlist items:', JSON.stringify(tierlistItems));
      
      // Send the tier list items to the backend
      const itemsResponse = await fetch(itemsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tierlistItems)
      });
      
      // Log the raw response text
      const itemsResponseText = await itemsResponse.text();
      console.log('Raw items response:', itemsResponseText);
      
      if (!itemsResponse.ok) {
        throw new Error(`Failed to create tier list items: ${itemsResponse.status} - ${itemsResponseText}`);
      }
      
      // All successful - refresh tier lists and show success message
      console.log('Tier list and items saved successfully!');
      setTierListName('');
      setSelectedTiers({});
      setCreatingTierListSuccess(true);
      
      // Set a timer to hide success message after 3 seconds
      setTimeout(() => setCreatingTierListSuccess(false), 3000);
      
      // Refresh user's tier lists
      console.log('Refreshing tier lists after successful creation');
      await fetchUserTierLists();
      
    } catch (error) {
      console.error('Error creating tier list:', error);
      setTierListsError(`Failed to create tier list: ${error.message}`);
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
    if (!currentUser || !currentUser.userId) {
      console.warn('Cannot fetch tier lists: No logged-in user');
      setTierListsError('You must be logged in to view your tier lists');
      return;
    }
    
    try {
      console.log('[DEBUG] === FETCH TIER LISTS ===');
      console.log(`[DEBUG] Fetching tier lists for user ID: ${currentUser.userId}`);
      setLoadingTierLists(true);
      setTierListsError(null);
      
      // Determine the API URL based on the environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? `http://api:8083/api/tierlists/user/${currentUser.userId}`
        : `http://localhost:8083/api/tierlists/user/${currentUser.userId}`;
      
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
        setTierLists([]);
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
            if (typeof item.tier === 'string') {
              // Direct tier name as string
              tierName = item.tier;
              console.log(`[DEBUG] Using direct tier name: ${tierName}`);
            } else if (item.tier && item.tier.tierId) {
              // Map nested tier.tierId to name
              const tierId = item.tier.tierId;
              if (tierId === 1 || tierId === '1') tierName = 'S Tier';
              else if (tierId === 2 || tierId === '2') tierName = 'A Tier';
              else if (tierId === 3 || tierId === '3') tierName = 'B Tier';
              else if (tierId === 4 || tierId === '4') tierName = 'C Tier';
              console.log(`[DEBUG] Derived tier name from nested tier.tierId ${tierId}: ${tierName}`);
            } else if (item.tierId) {
              // Map direct tierId to name
              const tierId = item.tierId;
              if (tierId === 1 || tierId === '1') tierName = 'S Tier';
              else if (tierId === 2 || tierId === '2') tierName = 'A Tier';
              else if (tierId === 3 || tierId === '3') tierName = 'B Tier';
              else if (tierId === 4 || tierId === '4') tierName = 'C Tier';
              console.log(`[DEBUG] Derived tier name from direct tierId ${tierId}: ${tierName}`);
            } else if (item.tier && item.tier.name) {
              // Tier as an object with name property
              tierName = item.tier.name;
              console.log(`[DEBUG] Using tier.name: ${tierName}`);
            }
            
            // Get the recipe name - handle multiple possible formats
            let recipeName = 'Unknown Recipe';
            if (item.recipe && item.recipe.title) {
              recipeName = item.recipe.title;
              console.log(`[DEBUG] Using recipe.title: ${recipeName}`);
            } else if (item.recipeName) {
              recipeName = item.recipeName;
              console.log(`[DEBUG] Using recipeName: ${recipeName}`);
            } else if (item.item && item.item.title) {
              recipeName = item.item.title;
              console.log(`[DEBUG] Using item.title: ${recipeName}`);
            } else if (item.recipeId) {
              recipeName = `Recipe ${item.recipeId}`;
              console.log(`[DEBUG] Using recipeId: ${recipeName}`);
            } else if (item.originalItemId) {
              recipeName = `Recipe ${item.originalItemId}`;
              console.log(`[DEBUG] Using originalItemId: ${recipeName}`);
            } else if (item.recipe && item.recipe.recipeId) {
              recipeName = `Recipe ${item.recipe.recipeId}`;
              console.log(`[DEBUG] Using recipe.recipeId: ${recipeName}`);
            }
            
            const formattedItem = {
              id: item.id || item.itemId,
              recipeName,
              tier: tierName,
              position: item.position || 0
            };
            
            console.log(`[DEBUG] Formatted item: ${JSON.stringify(formattedItem)}`);
            return formattedItem;
          });
        } else {
          console.log(`[DEBUG] No items found for tier list "${tierList.name}" or items is not an array`);
          console.log(`[DEBUG] tierList.items:`, tierList.items);
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

  useEffect(() => {
    // Fetch user tier lists when the component mounts or when the user changes
    if (currentUser && currentUser.userId) {
      console.log('Fetching tier lists for user:', currentUser.userId);
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
                className={`create-tierlist-btn ${Object.keys(selectedTiers).length > 0 ? 'active' : 'disabled'}`}
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
                          backgroundColor: 'rgba(240, 240, 240, 0.8)' // Light background for better visibility
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

        {/* Display existing tier lists */}
        <div className="saved-tierlists">
          <h2>Your Saved Tier Lists</h2>
          
          {getTierListsStatus() === 'loading' && (
            <div className="loading-indicator">Loading your tier lists...</div>
          )}
          
          {getTierListsStatus() === 'error' && (
            <div className="error-message">
              <p>{tierListsError}</p>
              <button onClick={fetchUserTierLists} className="retry-btn">Retry</button>
            </div>
          )}
          
          {getTierListsStatus() === 'empty' && (
            <div className="no-tierlists">
              <p>You haven't created any tier lists yet. Start by selecting tiers for recipes above!</p>
              <button className="refresh-btn" onClick={fetchUserTierLists}>
                <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
              </button>
            </div>
          )}
          
          {getTierListsStatus() === 'no-items' && (
            <div className="no-tierlists">
              <p>Your tier lists were found, but they don't have any items in them. This might be an issue with data loading.</p>
              <button className="refresh-btn" onClick={fetchUserTierLists}>
                <FontAwesomeIcon icon={faArrowsRotate} /> Refresh Data
              </button>
            </div>
          )}
          
          {getTierListsStatus() === 'success' && (
            <div className="tierlists-grid">
              {tierLists.map(tierList => (
                <div key={tierList.id} className="tierlist-card">
                  <div className="tierlist-header">
                    <div className="header-content">
                      <h3 className="tierlist-name">{tierList.name || 'Unnamed Tier List'}</h3>
                      {tierList.categoryName && (
                        <span className="tierlist-category">{tierList.categoryName}</span>
                      )}
                      {tierList.createdAt && (
                        <span className="tierlist-date">
                          {new Date(tierList.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="tierlist-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditClick(tierList)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this tier list?')) {
                            // We don't have delete functionality implemented yet
                            alert('Delete functionality will be added in a future update.');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="tierlist-items">
                    {hasTierListValidItems(tierList) ? (
                      <div className="items-grid">
                        {tierList.items.map((item, index) => (
                          <div key={`${tierList.id}-item-${index}`} className="tierlist-item">
                            <span className={`tier-badge ${item.tier ? item.tier.split(' ')[0].toLowerCase() : 's'}`}>
                              {item.tier || 'S Tier'}
                            </span>
                            <span className="recipe-name" title={item.recipeName}>
                              {item.recipeName || 'Unknown Recipe'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-items">No items in this tier list</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Tier Lists Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/community-tierlists">
            <button id="view-community-tierlists-btn">
              View Community Tier Lists
            </button>
          </Link>
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