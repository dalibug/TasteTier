import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faCog, faUser, faHome, faSignOutAlt, faImage } from '@fortawesome/free-solid-svg-icons';
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
  const [recipeCategories, setRecipeCategories] = useState({
    wings: [],
    pasta: [],
    steak: [],
    soup: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
          fetchUserTierLists(userData.userId);
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
          { item_id: 29, name: 'Lemon Pepper Wings', description: 'Crispy wings with a tangy, zesty flavor.' },
          { item_id: 30, name: 'Mango Habanero Wings', description: 'Sweet and spicy wings with a tropical kick.' },
          { item_id: 31, name: 'Garlic Parmesan Wings', description: 'Savory wings with garlic and cheese.' },
          { item_id: 32, name: 'BBQ Wings', description: 'Classic smoky BBQ wings.' },
          { item_id: 33, name: 'Spicy Korean Wings', description: 'Bold wings with Korean chili paste.' }
        ],
        pasta: [
          { item_id: 34, name: 'Shrimp Alfredo', description: 'Creamy pasta with succulent shrimp.' },
          { item_id: 35, name: 'Spaghetti Bolognese', description: 'Traditional Italian pasta with meat sauce.' },
          { item_id: 36, name: 'Pesto Chicken Pasta', description: 'Pasta with basil pesto and chicken.' },
          { item_id: 37, name: 'Penne Arrabbiata', description: 'Spicy penne pasta in tomato sauce.' },
          { item_id: 38, name: 'Fettuccine Carbonara', description: 'Classic pasta with eggs and pancetta.' }
        ],
        steak: [
          { item_id: 39, name: 'Ribeye Steak', description: 'Juicy ribeye with garlic butter.' },
          { item_id: 40, name: 'Filet Mignon', description: 'Tender steak with red wine sauce.' },
          { item_id: 41, name: 'NY Strip Steak', description: 'Classic steak with peppercorn sauce.' },
          { item_id: 42, name: 'T-bone Steak', description: 'Impressive cut with herb butter.' },
          { item_id: 43, name: 'Sirloin Steak', description: 'Flavorful sirloin with mashed potatoes.' }
        ],
        soup: [
          { item_id: 44, name: 'Chicken Soup', description: 'Comforting soup with vegetables.' },
          { item_id: 45, name: 'Beef Soup', description: 'Hearty soup with tender beef.' },
          { item_id: 46, name: 'Tomato Soup', description: 'Classic creamy tomato soup.' },
          { item_id: 47, name: 'Vegetable Soup', description: 'Healthy soup with seasonal vegetables.' },
          { item_id: 48, name: 'Minestrone', description: 'Italian vegetable soup with pasta.' }
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
    setShowImagePopout(true);
  };

  const closeImagePopout = () => {
    setShowImagePopout(false);
    setSelectedRecipeId(null);
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

      // Make sure we have an active challenge
      let challenge = activeChallenge;
      if (!challenge) {
        challenge = await fetchActiveChallenge();
        if (!challenge) {
          alert("No active challenge available. Please try again later.");
          return;
        }
      }

      // Determine the API URL based on the environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? 'http://api:8083/api/tierlists'
        : 'http://localhost:8083/api/tierlists';
      
      console.log('Creating tier list with category:', currentCategory);
      
      // Prepare tier list data
      const tierListData = {
        name: tierListName,
        user: { userId: currentUser.userId },
        category: { categoryId: getCategoryId(currentCategory) },
        challenge: { challengeId: challenge.challengeId },
        isPublic: true
      };
      
      console.log('Sending tier list data:', tierListData);
      
      // Save the tier list to the database
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tierListData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(`Failed to create tier list: ${response.status}`);
      }
      
      const savedTierList = await response.json();
      console.log('Tier list created successfully:', savedTierList);
      
      // Now save the tier list items
      const itemsApiUrl = isDocker 
        ? `http://api:8083/api/tierlist-items/batch/${savedTierList.tierlistId}`
        : `http://localhost:8083/api/tierlist-items/batch/${savedTierList.tierlistId}`;
      
      // Get all recipes from all categories for reference
      const allRecipes = [
        ...recipeCategories.wings,
        ...recipeCategories.pasta, 
        ...recipeCategories.steak, 
        ...recipeCategories.soup
      ];

      // Create the items to be saved
      const tierlistItems = Object.entries(selectedTiers).map(([recipeId, tierName], index) => {
        const recipe = allRecipes.find(r => r.item_id === parseInt(recipeId));
        return {
          originalItemId: parseInt(recipeId),
          tierId: getTierId(tierName),
          position: index,
          tierlistId: savedTierList.tierlistId,
          recipeName: recipe?.name || `Recipe ${recipeId}`
        };
      });
      
      console.log('Sending tierlist items:', tierlistItems);
      
      const itemsResponse = await fetch(itemsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tierlistItems)
      });
      
      if (!itemsResponse.ok) {
        const errorData = await itemsResponse.json().catch(() => null);
        console.error('Error saving items:', errorData);
        throw new Error(`Failed to add items to tier list: ${itemsResponse.status}`);
      }
      
      // Create a formatted tier list for the UI
      const uiTierList = {
        id: savedTierList.tierlistId,
        name: savedTierList.name,
        items: tierlistItems.map(item => {
          // Map tier ID back to tier name
          let tierName = 'S Tier'; // Default
          if (item.tierId === 1) tierName = 'S Tier';
          else if (item.tierId === 2) tierName = 'A Tier';
          else if (item.tierId === 3) tierName = 'B Tier';
          else if (item.tierId === 4) tierName = 'C Tier';
          
          return {
            recipeName: item.recipeName,
            tier: tierName
          };
        }),
        likedBy: []
      };
      
      // Update the local state with the newly created tier list
      setTierLists(prev => [...prev, uiTierList]);
      
      // Reset the form
      setTierListName('');
      setSelectedTiers({});
      
      alert('Tier list created successfully!');
      
    } catch (error) {
      console.error('Error creating tier list:', error);
      alert(`Failed to create tier list: ${error.message}`);
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

  // Function to fetch user's tier lists
  const fetchUserTierLists = async (userId) => {
    if (!userId) return;
    
    try {
      // Determine the API URL based on the environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? `http://api:8083/api/tierlists/user/${userId}`
        : `http://localhost:8083/api/tierlists/user/${userId}`;
      
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tier lists: ${response.status}`);
      }
      
      const fetchedTierLists = await response.json();
      console.log('Fetched tier lists:', fetchedTierLists);
      
      // Process and format the tier lists for UI display
      const formattedTierLists = await Promise.all(fetchedTierLists.map(async (list) => {
        // Fetch the items for each tier list
        const itemsResponse = await fetch(
          isDocker 
            ? `http://api:8083/api/tierlist-items/tierlist/${list.tierlistId}`
            : `http://localhost:8083/api/tierlist-items/tierlist/${list.tierlistId}`,
          { credentials: 'include' }
        );
        
        if (!itemsResponse.ok) {
          console.error(`Failed to fetch items for tier list ${list.tierlistId}`);
          return {
            id: list.tierlistId,
            name: list.name,
            items: [],
            likedBy: []
          };
        }
        
        const items = await itemsResponse.json();
        
        // Format the items with tier names
        const formattedItems = items.map(item => {
          let tierName = 'S Tier'; // Default
          if (item.tier.tierId === 1) tierName = 'S Tier';
          else if (item.tier.tierId === 2) tierName = 'A Tier';
          else if (item.tier.tierId === 3) tierName = 'B Tier';
          else if (item.tier.tierId === 4) tierName = 'C Tier';
          
          return {
            recipeName: item.item ? item.item.name : `Item ${item.originalItemId}`,
            tier: tierName
          };
        });
        
        return {
          id: list.tierlistId,
          name: list.name,
          items: formattedItems,
          likedBy: []
        };
      }));
      
      setTierLists(formattedTierLists);
    } catch (err) {
      console.error('Error fetching user tier lists:', err);
    }
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
            <input
              type="text"
              placeholder="Enter your tier list name"
              value={tierListName}
              onChange={(e) => setTierListName(e.target.value)}
              className="tierlist-name-input"
            />
            <button 
              className="create-tierlist-btn"
              onClick={createTierList}
            >
              Create Tier List
            </button>
            <button 
              className="cycle-week-btn"
              onClick={cycleCategory}
              title="Next Category of Recipes"
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </button>
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
                  <div key={recipe.item_id} className="tier-card">
                    <h2 title={recipe.name}>{recipe.name}</h2>
                    <p title={recipe.description}>{recipe.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                      <button className="recipe-image-btn" onClick={() => handleImageClick(recipe.item_id)}>
                        <FontAwesomeIcon icon={faImage} />
                      </button>
                      <div className="tier-items">
                        {tiers.map(tier => (
                          <span
                            key={tier}
                            className={`tier-item ${selectedTiers[recipe.item_id] === tier ? 'selected' : ''}`}
                            onClick={() => handleTierSelect(recipe.item_id, tier)}
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
        <div className="existing-tierlists">
          <h2>My Created Tier Lists</h2>
          <div className="tierlists-grid">
            {tierLists.map(tierList => (
              <div key={tierList.id} className="tierlist-card">
                <div className="tierlist-header">
                  <div className="header-content">
                    <h3 className="tierlist-name">{tierList.name}</h3>
                  </div>
                </div>
                <div className="tierlist-items">
                  {tierList.items.map((item, index) => (
                    <div key={index} className="tierlist-item">
                      <span className="recipe-name" title={item.recipeName}>{item.recipeName}</span>
                      <span className={`tier-badge ${item.tier.split(' ')[0].toLowerCase()}`}>
                        {item.tier}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="tierlist-footer">
                  <span className="similarity-badge">
                    <i className="fas fa-heart"></i>
                    {tierList.likedBy && tierList.likedBy.length > 0 
                      ? tierList.likedBy.length === 1
                        ? `Liked by ${tierList.likedBy[0]}`
                        : `Liked by ${tierList.likedBy[0]} and ${tierList.likedBy.length - 1} others`
                      : 'No likes yet'}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
              {/* Image will be added here later */}
              <div className="placeholder-text">Image will be displayed here</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierLists; 