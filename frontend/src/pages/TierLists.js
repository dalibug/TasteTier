import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faCog } from '@fortawesome/free-solid-svg-icons';
import DatabaseTablesModal from '../components/DatabaseTablesModal';
import '../styles/TierLists.css';

const TierLists = () => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [tierListName, setTierListName] = useState('');
  const [selectedTiers, setSelectedTiers] = useState({});
  const [tierLists, setTierLists] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);

  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
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

  const cycleWeek = () => {
    setCurrentWeek(prev => (prev % 3) + 1);
  };

  const getCurrentRecipes = () => {
    const startIndex = (currentWeek - 1) * 5;
    return recipes.slice(startIndex, startIndex + 5);
  };

  const handleTierSelect = (recipeId, tier) => {
    setSelectedTiers(prev => ({
      ...prev,
      [recipeId]: tier
    }));
  };

  const createTierList = () => {
    if (!tierListName.trim()) {
      return;
    }

    const selectedRecipes = Object.entries(selectedTiers).map(([recipeId, tier]) => {
      const recipe = recipes.find(r => r.id === parseInt(recipeId));
      return {
        recipeName: recipe.name,
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

  // Hardcoded recipes data
  const recipes = [
    // Week 1 recipes (1-5)
    { id: 1, name: 'Spaghetti Carbonara', description: 'Classic Italian pasta dish' },
    { id: 2, name: 'Chicken Tikka Masala', description: 'Indian curry dish' },
    { id: 3, name: 'Sushi Roll', description: 'Japanese rice and fish dish' },
    { id: 4, name: 'Pizza Margherita', description: 'Traditional Italian pizza' },
    { id: 5, name: 'Beef Stir Fry', description: 'Chinese-style stir-fried beef' },
    // Week 2 recipes (6-10)
    { id: 6, name: 'Pad Thai', description: 'Thai noodle dish' },
    { id: 7, name: 'Greek Salad', description: 'Mediterranean salad' },
    { id: 8, name: 'Tacos', description: 'Mexican street food' },
    { id: 9, name: 'Ramen', description: 'Japanese noodle soup' },
    { id: 10, name: 'Falafel', description: 'Middle Eastern chickpea balls' },
    // Week 3 recipes (11-15)
    { id: 11, name: 'Paella', description: 'Spanish rice dish' },
    { id: 12, name: 'Bibimbap', description: 'Korean mixed rice bowl' },
    { id: 13, name: 'Pho', description: 'Vietnamese noodle soup' },
    { id: 14, name: 'Moussaka', description: 'Greek eggplant casserole' },
    { id: 15, name: 'Dumplings', description: 'Chinese steamed dumplings' },
  ];

  const tiers = ['S Tier', 'A Tier', 'B Tier', 'C Tier'];

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
              onClick={cycleWeek}
              title="Next Week's Recipes"
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
            <button id="settings-menu-item" onClick={() => navigate('/database-test')}>
              Database Testing
            </button>
          </div>
        )}
      </div>

      <div className="content-wrapper">
        <div className="tierlists-container">
          <div className="recipe-cards-container">
            {getCurrentRecipes().map(recipe => (
              <div key={recipe.id} className="tier-card">
                <h2>{recipe.name}</h2>
                <p>{recipe.description}</p>
                <div className="tier-items">
                  {tiers.map(tier => (
                    <span
                      key={tier}
                      className={`tier-item ${selectedTiers[recipe.id] === tier ? 'selected' : ''}`}
                      onClick={() => handleTierSelect(recipe.id, tier)}
                    >
                      {tier}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
                      <span className="recipe-name">{item.recipeName}</span>
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
    </div>
  );
};

export default TierLists; 