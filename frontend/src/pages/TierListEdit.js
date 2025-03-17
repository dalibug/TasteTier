import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TierGrid from '../components/TierGrid';
import TierListService from '../services/tierListService';
import TierListItemService from '../services/tierListItemService';
import RecipeService from '../services/recipeService';
import UserService from '../services/userService';

const TierListEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tierList, setTierList] = useState(null);
  const [items, setItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [newTier, setNewTier] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true
  });
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        
        // Get tier list
        const tierListResponse = await TierListService.getTierListById(id);
        const tierListData = tierListResponse.data;
        setTierList(tierListData);
        
        // Check if user is owner
        const isOwner = userResponse.data.userId === tierListData.user.userId;
        setIsOwner(isOwner);
        
        if (!isOwner) {
          setError('You do not have permission to edit this tier list.');
          setLoading(false);
          return;
        }
        
        // Set form data
        setFormData({
          title: tierListData.title,
          description: tierListData.description || '',
          isPublic: tierListData.isPublic
        });
        
        // Get tier list items
        const itemsResponse = await TierListItemService.getTierListItemsByTierListId(id);
        setItems(itemsResponse.data);
        
        // Extract unique tiers from items
        const uniqueTiers = [];
        const tierIds = new Set();
        
        itemsResponse.data.forEach(item => {
          if (item.tier && !tierIds.has(item.tier.tierId)) {
            tierIds.add(item.tier.tierId);
            uniqueTiers.push(item.tier);
          }
        });
        
        setTiers(uniqueTiers);
        
        // Get available items based on challenge
        if (tierListData.challenge) {
          const categoryIds = tierListData.challenge.categories.map(cat => cat.categoryId);
          const recipesResponse = await RecipeService.getRecipesByCategories(categoryIds);
          setAvailableItems(recipesResponse.data);
        } else {
          // Get all recipes if no challenge
          const recipesResponse = await RecipeService.getAllRecipes();
          setAvailableItems(recipesResponse.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching tier list data:', err);
        setError('Failed to load tier list data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const handleAddTier = () => {
    if (newTier.trim() === '') return;
    
    // Check if tier already exists
    if (tiers.some(tier => tier.name === newTier.trim())) {
      setNewTier('');
      return;
    }
    
    // Create new tier object
    const newTierObj = {
      tierId: `temp-${Date.now()}`, // Temporary ID
      name: newTier.trim(),
      rankOrder: tiers.length + 1
    };
    
    setTiers([...tiers, newTierObj]);
    setNewTier('');
  };

  const handleRemoveTier = (tierId) => {
    // Move items from this tier to unranked
    const updatedItems = items.map(item => {
      if (item.tier && item.tier.tierId === tierId) {
        return { ...item, tier: null };
      }
      return item;
    });
    
    setItems(updatedItems);
    setTiers(tiers.filter(tier => tier.tierId !== tierId));
  };

  const handleAddItem = (item) => {
    // Check if item is already added
    const existingItem = items.find(i => i.originalItem.recipeId === item.recipeId);
    
    if (!existingItem) {
      const newItem = {
        itemId: `temp-${Date.now()}-${item.recipeId}`, // Temporary ID
        tier: null,
        position: items.length,
        originalItem: item
      };
      
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.itemId !== itemId));
  };

  const handleMoveTier = (itemId, tierId, position) => {
    const updatedItems = items.map(item => {
      if (item.itemId === itemId) {
        return {
          ...item,
          tier: tiers.find(t => t.tierId === tierId),
          position: position
        };
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOwner) {
      setError('You do not have permission to edit this tier list.');
      return;
    }
    
    try {
      // Update tier list
      const tierListData = {
        ...formData,
        userId: user.userId,
        challenge: tierList.challenge
      };
      
      await TierListService.updateTierList(id, tierListData);
      
      // Delete existing items
      await TierListItemService.deleteAllItemsInTierList(id);
      
      // Prepare items data
      const itemsData = items.map((item, index) => ({
        tier: item.tier ? item.tier.tierId : null,
        position: index,
        originalItemId: item.originalItem.recipeId,
        tierListId: id
      }));
      
      // Create items
      await TierListItemService.createTierListItemsBatch(itemsData);
      
      // Navigate to the tier list detail page
      navigate(`/tierlists/${id}`);
    } catch (err) {
      console.error('Error updating tier list:', err);
      setError('Failed to update tier list. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="tier-list-edit-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !isOwner) {
    return (
      <div className="tier-list-edit-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="error">{error}</div>
          <Link to="/tierlists" className="back-btn">
            Back to Tier Lists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tier-list-edit-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <Link to={`/tierlists/${id}`} className="back-btn">
            &larr; Back to Tier List
          </Link>
          <h1 className="page-title">Edit Tier List</h1>
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
                  <div key={tier.tierId} className="tier-item">
                    <span className="tier-name">{tier.name}</span>
                    <button
                      type="button"
                      className="remove-tier-btn"
                      onClick={() => handleRemoveTier(tier.tierId)}
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
                    tiers={tiers}
                    onItemMove={handleMoveTier}
                    onRemoveItem={handleRemoveItem}
                    isEditable={true}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <Link to={`/tierlists/${id}`} className="cancel-btn">
              Cancel
            </Link>
            <button
              type="submit"
              className="submit-btn"
              disabled={items.length === 0}
            >
              Update Tier List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TierListEdit; 