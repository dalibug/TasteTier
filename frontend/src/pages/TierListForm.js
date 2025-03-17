import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TierGrid from '../components/TierGrid';
import TierListService from '../services/tierListService';
import TierListItemService from '../services/tierListItemService';
import RecipeService from '../services/recipeService';
import WeeklyChallengeService from '../services/weeklyChallengeService';
import UserService from '../services/userService';

const TierListForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Get challenge ID from query params if available
  const queryParams = new URLSearchParams(location.search);
  const challengeIdFromQuery = queryParams.get('challenge');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    challenge: null
  });
  
  const [items, setItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [tiers, setTiers] = useState(['S', 'A', 'B', 'C', 'D', 'F']);
  const [newTier, setNewTier] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        
        // Get active challenges
        const challengesResponse = await WeeklyChallengeService.getActiveWeeklyChallenges();
        setChallenges(challengesResponse.data);
        
        // If editing, get tier list details
        if (isEditMode) {
          const tierListResponse = await TierListService.getTierListById(id);
          const tierList = tierListResponse.data;
          
          // Check if user is the owner
          if (tierList.user.userId !== userResponse.data.userId) {
            setError('You do not have permission to edit this tier list.');
            setLoading(false);
            return;
          }
          
          setFormData({
            title: tierList.title,
            description: tierList.description || '',
            isPublic: tierList.isPublic,
            challenge: tierList.challenge
          });
          
          if (tierList.challenge) {
            setSelectedChallenge(tierList.challenge);
          }
          
          // Get tier list items
          const itemsResponse = await TierListItemService.getTierListItemsByTierListId(id);
          const fetchedItems = itemsResponse.data;
          
          // Extract unique tiers
          const uniqueTiers = [...new Set(fetchedItems.map(item => item.tier))].sort();
          if (uniqueTiers.length > 0) {
            setTiers(uniqueTiers);
          }
          
          setItems(fetchedItems);
          
          // Get available items based on challenge
          if (tierList.challenge) {
            const categoryIds = tierList.challenge.categories.map(cat => cat.categoryId);
            const recipesResponse = await RecipeService.getRecipesByCategories(categoryIds);
            setAvailableItems(recipesResponse.data);
          } else {
            // Get all recipes if no challenge
            const recipesResponse = await RecipeService.getAllRecipes();
            setAvailableItems(recipesResponse.data);
          }
        } else {
          // For new tier lists
          
          // If challenge ID is provided in query, set it as selected
          if (challengeIdFromQuery) {
            try {
              const challengeResponse = await WeeklyChallengeService.getWeeklyChallengeById(challengeIdFromQuery);
              const challenge = challengeResponse.data;
              
              if (challenge.status.toLowerCase() === 'active') {
                setSelectedChallenge(challenge);
                setFormData({
                  ...formData,
                  challenge: challenge,
                  title: `${userResponse.data.username}'s Week ${challenge.weekNumber}/${challenge.year} Tier List`
                });
                
                // Get recipes for this challenge's categories
                const categoryIds = challenge.categories.map(cat => cat.categoryId);
                const recipesResponse = await RecipeService.getRecipesByCategories(categoryIds);
                setAvailableItems(recipesResponse.data);
              } else {
                // If challenge is not active, get all recipes
                const recipesResponse = await RecipeService.getAllRecipes();
                setAvailableItems(recipesResponse.data);
              }
            } catch (err) {
              console.error('Error fetching challenge:', err);
              // If challenge fetch fails, get all recipes
              const recipesResponse = await RecipeService.getAllRecipes();
              setAvailableItems(recipesResponse.data);
            }
          } else {
            // No challenge specified, get all recipes
            const recipesResponse = await RecipeService.getAllRecipes();
            setAvailableItems(recipesResponse.data);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, challengeIdFromQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleChallengeChange = async (e) => {
    const challengeId = e.target.value;
    
    if (challengeId === '') {
      // No challenge selected
      setSelectedChallenge(null);
      setFormData({
        ...formData,
        challenge: null
      });
      
      // Get all recipes
      try {
        const recipesResponse = await RecipeService.getAllRecipes();
        setAvailableItems(recipesResponse.data);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to load recipes. Please try again later.');
      }
      
      return;
    }
    
    // Find the selected challenge
    const challenge = challenges.find(c => c.challengeId.toString() === challengeId);
    
    if (challenge) {
      setSelectedChallenge(challenge);
      setFormData({
        ...formData,
        challenge: challenge,
        title: `${user.username}'s Week ${challenge.weekNumber}/${challenge.year} Tier List`
      });
      
      // Get recipes for this challenge's categories
      try {
        const categoryIds = challenge.categories.map(cat => cat.categoryId);
        const recipesResponse = await RecipeService.getRecipesByCategories(categoryIds);
        setAvailableItems(recipesResponse.data);
        
        // Reset items if changing challenge
        if (!isEditMode) {
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching recipes for challenge:', err);
        setError('Failed to load recipes for this challenge. Please try again later.');
      }
    }
  };

  const handleAddTier = () => {
    if (newTier.trim() === '') return;
    
    // Check if tier already exists
    if (tiers.includes(newTier.trim())) {
      setNewTier('');
      return;
    }
    
    setTiers([...tiers, newTier.trim()]);
    setNewTier('');
  };

  const handleRemoveTier = (tier) => {
    // Move items from this tier to unranked
    const updatedItems = items.map(item => {
      if (item.tier === tier) {
        return { ...item, tier: 'Unranked' };
      }
      return item;
    });
    
    setItems(updatedItems);
    setTiers(tiers.filter(t => t !== tier));
  };

  const handleAddItem = (item) => {
    // Check if item is already added
    const existingItem = items.find(i => i.originalItem.recipeId === item.recipeId);
    
    if (!existingItem) {
      const newItem = {
        tierListItemId: `temp-${Date.now()}-${item.recipeId}`, // Temporary ID
        tier: 'Unranked',
        position: items.length,
        originalItem: item
      };
      
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.tierListItemId !== itemId));
  };

  const handleMoveTier = (item, newTier) => {
    const updatedItems = items.map(i => {
      if (i.tierListItemId === item.tierListItemId) {
        return { ...i, tier: newTier };
      }
      return i;
    });
    
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Please add at least one item to your tier list.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare tier list data
      const tierListData = {
        ...formData,
        userId: user.userId
      };
      
      let tierListId;
      
      if (isEditMode) {
        // Update existing tier list
        const response = await TierListService.updateTierList(id, tierListData);
        tierListId = response.data.tierListId;
        
        // Delete existing items
        await TierListItemService.deleteTierListItemsByTierListId(tierListId);
      } else {
        // Create new tier list
        const response = await TierListService.createTierList(tierListData);
        tierListId = response.data.tierListId;
      }
      
      // Prepare items data
      const itemsData = items.map((item, index) => ({
        tier: item.tier,
        position: index,
        originalItemId: item.originalItem.recipeId,
        tierListId: tierListId
      }));
      
      // Create items
      await TierListItemService.createTierListItems(tierListId, itemsData);
      
      // Navigate to the tier list detail page
      navigate(`/tierlists/${tierListId}`);
    } catch (err) {
      console.error('Error saving tier list:', err);
      setError('Failed to save tier list. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="tier-list-form-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tier-list-form-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <Link to="/tierlists" className="back-btn">
            &larr; Back to Tier Lists
          </Link>
          <h1 className="page-title">
            {isEditMode ? 'Edit Tier List' : 'Create New Tier List'}
          </h1>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="tier-list-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="challenge">Weekly Challenge (Optional)</label>
              <select
                id="challenge"
                name="challenge"
                value={selectedChallenge ? selectedChallenge.challengeId : ''}
                onChange={handleChallengeChange}
                disabled={isEditMode} // Can't change challenge in edit mode
              >
                <option value="">No Challenge (Custom Tier List)</option>
                {challenges.map(challenge => (
                  <option key={challenge.challengeId} value={challenge.challengeId}>
                    Week {challenge.weekNumber}/{challenge.year} - {challenge.categories.map(c => c.name).join(', ')}
                  </option>
                ))}
              </select>
              {isEditMode && selectedChallenge && (
                <div className="field-note">
                  Challenge cannot be changed after creation.
                </div>
              )}
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="isPublic">Make this tier list public</label>
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="section-title">Tiers</h2>
            <div className="tiers-container">
              <div className="tiers-list">
                {tiers.map(tier => (
                  <div key={tier} className="tier-item">
                    <span className="tier-name">{tier}</span>
                    <button
                      type="button"
                      className="remove-tier-btn"
                      onClick={() => handleRemoveTier(tier)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="add-tier-container">
                <input
                  type="text"
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  placeholder="Add a tier..."
                  className="tier-input"
                  maxLength="3"
                />
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="add-tier-btn"
                  disabled={!newTier.trim()}
                >
                  Add Tier
                </button>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="section-title">Items</h2>
            <div className="items-container">
              <div className="available-items">
                <h3>Available Items</h3>
                {availableItems.length === 0 ? (
                  <p className="no-items">No items available.</p>
                ) : (
                  <div className="items-grid">
                    {availableItems.map(item => {
                      const isAdded = items.some(i => i.originalItem.recipeId === item.recipeId);
                      return (
                        <div 
                          key={item.recipeId} 
                          className={`item-card ${isAdded ? 'added' : ''}`}
                          onClick={() => !isAdded && handleAddItem(item)}
                        >
                          <div className="item-name">{item.name}</div>
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="item-image" />
                          )}
                          {isAdded ? (
                            <div className="item-added-badge">Added</div>
                          ) : (
                            <button type="button" className="add-item-btn">Add</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="selected-items">
                <h3>Your Tier List</h3>
                {items.length === 0 ? (
                  <p className="no-items">No items added yet. Select items from the available list.</p>
                ) : (
                  <TierGrid
                    items={items}
                    tiers={[...tiers, 'Unranked']}
                    onMoveTier={handleMoveTier}
                    onRemoveItem={handleRemoveItem}
                    isEditable={true}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/tierlists')}
              className="cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || items.length === 0}
            >
              {submitting ? 'Saving...' : (isEditMode ? 'Update Tier List' : 'Create Tier List')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TierListForm; 