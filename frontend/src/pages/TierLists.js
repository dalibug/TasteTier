import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faCog } from '@fortawesome/free-solid-svg-icons';
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
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showDatabaseTestModal, setShowDatabaseTestModal] = useState(false);
  const [recipeCategories, setRecipeCategories] = useState({
    wings: [],
    pasta: [],
    steak: [],
    soup: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  // Fetch recipe data from our API
  useEffect(() => {
    fetchRecipeData();
  }, []);

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

  const createTierList = () => {
    if (!tierListName.trim()) {
      return;
    }

    // Get all recipes from all categories for reference
    const allRecipes = [
      ...recipeCategories.wings,
      ...recipeCategories.pasta, 
      ...recipeCategories.steak, 
      ...recipeCategories.soup
    ];

    const selectedRecipes = Object.entries(selectedTiers).map(([recipeId, tier]) => {
      const recipe = allRecipes.find(r => r.item_id === parseInt(recipeId));
      return {
        recipeName: recipe?.name || `Recipe ${recipeId}`,
        tier: tier
      };
    });

    if (selectedRecipes.length === 0) {
      return;
    }

    const newTierList = {
      id: tierLists.length + 1,
      name: tierListName,
      items: selectedRecipes,
      likedBy: []
    };

    setTierLists(prev => [...prev, newTierList]);
    setTierListName('');
    setSelectedTiers({});
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

  return (
    <div className="tierlists-background" style={backgroundStyle}>
      <div className="fixed-header">
        <div className="nav-buttons">
          <Link to="/">
            <button className="nav-btn home-btn">Home</button>
          </Link>
          <button onClick={handleLogout} className="nav-btn">Logout</button>
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
      </div>

      <div className="content-wrapper">
        <div className="tierlists-container">
          <h2 className="category-heading">{getCategoryDisplayName()}</h2>
          {loading ? (
            <div className="loading-indicator">Loading recipes from API...</div>
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
                ))
              )}
            </div>
          )}
        </div>

        {/* Display existing tier lists */}
        <div className="existing-tierlists">
          <h2>Your Created Tier Lists</h2>
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
    </div>
  );
};

export default TierLists; 