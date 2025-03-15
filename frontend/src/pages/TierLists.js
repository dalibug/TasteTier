import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';

const TierLists = () => {
  const [selectedTiers, setSelectedTiers] = useState({});
  const [tierLists, setTierLists] = useState([]);
  const [tierListName, setTierListName] = useState('');
  const [editingTierList, setEditingTierList] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const createTierList = () => {
    // Filter recipes that have been rated
    const ratedRecipes = recipes.filter(recipe => selectedTiers[recipe.id]);
    
    if (ratedRecipes.length === 0 || !tierListName.trim()) {
      return;
    }

    // Create a new tier list with rated recipes
    const newTierList = {
      id: Date.now(), // temporary ID for frontend
      name: tierListName,
      items: ratedRecipes.map(recipe => ({
        recipeName: recipe.name,
        tier: selectedTiers[recipe.id]
      })),
      likedBy: [] // Initialize empty likedBy array
    };

    // Add the new tier list to the state
    setTierLists(prev => [newTierList, ...prev]);

    // Clear selected tiers and name
    setSelectedTiers({});
    setTierListName('');
  };

  const handleEdit = (tierList) => {
    setEditingTierList(tierList);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setEditingTierList(null);
    setShowEditModal(false);
  };

  const handleUpdateTier = (itemIndex, newTier) => {
    setEditingTierList(prev => ({
      ...prev,
      items: prev.items.map((item, index) => 
        index === itemIndex ? { ...item, tier: newTier } : item
      )
    }));
  };

  const handleDeleteItem = (itemIndex) => {
    setEditingTierList(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== itemIndex)
    }));
  };

  const handleDeleteList = () => {
    setTierLists(prev => prev.filter(list => list.id !== editingTierList.id));
    handleCloseModal();
  };

  const handleSaveChanges = () => {
    setTierLists(prev => 
      prev.map(list => 
        list.id === editingTierList.id ? editingTierList : list
      )
    );
    handleCloseModal();
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
      <div className="fixed-header">
        <div className="nav-buttons">
          <Link to="/">
            <button className="nav-btn home-btn">Home</button>
          </Link>
        </div>
        <h1 className="page-title">Your Tier Lists</h1>
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
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="tierlists-container">
          <div className="recipe-cards-container">
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

        {/* Display existing tier lists */}
        {tierLists.length > 0 && (
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
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(tierList)}
                    >
                      Edit
                    </button>
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
            <div className="community-button-container">
              <Link to="/community-tierlists">
                <button className="community-btn">
                  View Community Tier Lists
                </button>
              </Link>
            </div>
          </div>
        )}

        {showEditModal && editingTierList && (
          <div className="modal-overlay">
            <div className="edit-modal">
              <div className="modal-header">
                <h3 className="modal-title">Edit {editingTierList.name}</h3>
                <button className="close-modal" onClick={handleCloseModal}>&times;</button>
              </div>
              <div className="modal-content">
                {editingTierList.items.map((item, index) => (
                  <div key={index} className="edit-item">
                    <span className="recipe-name">{item.recipeName}</span>
                    <div className="edit-item-actions">
                      <select
                        className="tier-select"
                        value={item.tier}
                        onChange={(e) => handleUpdateTier(index, e.target.value)}
                      >
                        {tiers.map(tier => (
                          <option key={tier} value={tier}>{tier}</option>
                        ))}
                      </select>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteItem(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button 
                  className="action-btn delete"
                  onClick={handleDeleteList}
                >
                  Delete List
                </button>
                <button 
                  className="action-btn"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TierLists; 