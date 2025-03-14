import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';

const TierLists = () => {
  const [selectedTiers, setSelectedTiers] = useState({});

  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  const selectTier = (recipeId, tier) => {
    setSelectedTiers(prev => ({
      ...prev,
      [recipeId]: tier
    }));
  };

  const recipes = [
    { id: 1, name: 'Recipe 1', description: 'recipe placeholder' },
    { id: 2, name: 'Recipe 2', description: 'recipe placeholder' },
    { id: 3, name: 'Recipe 3', description: 'recipe placeholder' },
    { id: 4, name: 'Recipe 4', description: 'recipe placeholder' },
    { id: 5, name: 'Recipe 5', description: 'recipe placeholder' },
    
  ];

  const tiers = ['S Tier', 'A Tier', 'B Tier', 'C Tier'];

  return (
    <div className="tierlists-background" style={backgroundStyle}>
      <h1 className="page-title">Your Tier Lists</h1>

      <div className="nav-buttons">
        <Link to="/">
          <button className="nav-btn">Home</button>
        </Link>
      </div>

      <div className="tierlists-container">
        {recipes.map(recipe => (
          <div key={recipe.id} className="tier-card">
            <h2>{recipe.name}</h2>
            <p>{recipe.description}</p>
            <div className="tier-items">
              {tiers.map(tier => (
                <span
                  key={tier}
                  className={`tier-item ${selectedTiers[recipe.id] === tier ? 'selected' : ''}`}
                  onClick={() => selectTier(recipe.id, tier)}
                >
                  {tier}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierLists; 