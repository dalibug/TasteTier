import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TierListCard from '../components/TierListCard';
import TierListService from '../services/tierListService';
import UserService from '../services/userService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

const TierLists = () => {
  const [userTierLists, setUserTierLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, challenge, custom
  const [currentWeek, setCurrentWeek] = useState(1);
  const [tierListName, setTierListName] = useState('');
  const [selectedTiers, setSelectedTiers] = useState({});
  const [tierLists, setTierLists] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        
        // Get user's tier lists
        const tierListsResponse = await TierListService.getTierListsByUser(userResponse.data.userId);
        setUserTierLists(tierListsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching tier lists:', err);
        setError('Failed to load tier lists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const getFilteredTierLists = () => {
    switch (filter) {
      case 'challenge':
        return userTierLists.filter(tierList => tierList.challenge !== null);
      case 'custom':
        return userTierLists.filter(tierList => tierList.challenge === null);
      default:
        return userTierLists;
    }
  };

  const filteredTierLists = getFilteredTierLists();

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

  if (loading) {
    return (
      <div className="tier-lists-page">
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading tier lists...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tier-lists-page">
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">My Tier Lists</h1>
          <Link to="/tierlists/new" className="create-btn">
            Create New Tier List
          </Link>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'challenge' ? 'active' : ''}`}
            onClick={() => handleFilterChange('challenge')}
          >
            Challenge
          </button>
          <button 
            className={`filter-btn ${filter === 'custom' ? 'active' : ''}`}
            onClick={() => handleFilterChange('custom')}
          >
            Custom
          </button>
        </div>
        
        {filteredTierLists.length === 0 ? (
          <div className="no-tier-lists">
            <p>You haven't created any tier lists yet.</p>
            <Link to="/tierlists/new" className="create-btn">
              Create Your First Tier List
            </Link>
          </div>
        ) : (
          <div className="tier-lists-grid">
            {filteredTierLists.map(tierList => (
              <TierListCard 
                key={tierList.tierListId} 
                tierList={tierList} 
                showUser={false}
              />
            ))}
          </div>
        )}
        
        <div className="community-link-section">
          <h2>Looking for inspiration?</h2>
          <p>Check out tier lists created by the community.</p>
          <Link to="/community-tierlists" className="community-link">
            View Community Tier Lists
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TierLists; 