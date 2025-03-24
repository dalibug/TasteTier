import React, { useState, useEffect } from 'react';
import TierListService from '../services/TierListService';
import { useAuth } from '../context/AuthContext'; // Import AuthContext
import '../styles/UserTierLists.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

const UserTierLists = () => {
  const [tierLists, setTierLists] = useState([]);
  const [tierListCount, setTierListCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get the current user

  const fetchTierLists = async () => {
    // Use default user ID 1 if no user is provided or user has no ID
    const userId = user?.userId || 1;
    console.log('[DEBUG UserTierLists] Current user object:', user);
    console.log('[DEBUG UserTierLists] Using user ID for fetch:', userId);
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch count first
      try {
        console.log('[DEBUG UserTierLists] Fetching tier list count...');
        const count = await TierListService.getUserTierListCount(userId);
        console.log('[DEBUG UserTierLists] Tier list count:', count);
        setTierListCount(count);
        
        // If count is 0, no need to fetch tier lists
        if (count === 0) {
          console.log('[DEBUG UserTierLists] Count is 0, not fetching tier lists');
          setTierLists([]);
          setLoading(false);
          return;
        }
      } catch (countErr) {
        console.error("[DEBUG UserTierLists] Failed to fetch tier list count:", countErr);
        // Continue to fetch tier lists even if count fails
      }
      
      // Fetch tier lists
      console.log('[DEBUG UserTierLists] Fetching tier lists from API...');
      const data = await TierListService.getUserTierLists(userId);
      console.log('[DEBUG UserTierLists] Raw API response:', data); 
      console.log('[DEBUG UserTierLists] Response type:', typeof data);
      console.log('[DEBUG UserTierLists] Is array?', Array.isArray(data));
      console.log('[DEBUG UserTierLists] Data length:', Array.isArray(data) ? data.length : 'N/A');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('[DEBUG UserTierLists] First item sample:', data[0]);
      } else {
        console.log('[DEBUG UserTierLists] Empty or invalid data returned');
      }
      
      // Format the tier lists for display
      const formattedTierLists = Array.isArray(data) ? data.map(tierList => {
        console.log('[DEBUG UserTierLists] Processing tier list:', tierList);
        
        const formatted = {
          id: tierList.tierlistId || tierList.id,
          name: tierList.name || 'Unnamed Tier List',
          categoryName: tierList.categoryName,
          createdAt: tierList.createdAt,
          items: Array.isArray(tierList.items) ? tierList.items.map(item => {
            console.log('[DEBUG UserTierLists] Processing item:', item);
            return {
              id: item.itemId || item.id,
              recipeName: item.recipeName || 'Unknown Recipe',
              tier: item.tierName || item.tier || 'S Tier',
              position: item.position || 0
            };
          }) : []
        };
        
        console.log('[DEBUG UserTierLists] Formatted tier list:', formatted);
        return formatted;
      }) : [];
      
      console.log('[DEBUG UserTierLists] All formatted tier lists:', formattedTierLists);
      setTierLists(formattedTierLists);
      
      // Update count if it wasn't set before
      if (tierListCount === 0 && formattedTierLists.length > 0) {
        console.log('[DEBUG UserTierLists] Updating count from tier lists length:', formattedTierLists.length);
        setTierListCount(formattedTierLists.length);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('[DEBUG UserTierLists] Error in fetching tier lists:', err);
      setError('Failed to load tier lists: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTierLists();
  }, [user]);

  const handleRefresh = () => {
    fetchTierLists();
  };

  if (loading) return (
    <div className="tierlist-message">
      Loading tier lists...
      <div className="loading-spinner" style={{ marginTop: '20px' }}></div>
    </div>
  );
  
  if (error) return (
    <div className="tierlist-error">
      <p>Error: {error}</p>
      <button onClick={handleRefresh} className="refresh-error-btn">
        <FontAwesomeIcon icon={faArrowsRotate} /> Try Again
      </button>
    </div>
  );
  
  if (tierLists.length === 0) return (
    <div className="tierlist-message">
      <p>You haven't created any tier lists yet.</p>
      <button onClick={handleRefresh} className="refresh-btn" style={{ marginTop: '10px' }}>
        <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
      </button>
      <div className="tier-list-debug-info">
        <p>Debug Info:</p>
        <ul>
          <li>User ID: {user?.userId || 1}</li>
          <li>Tier List Count: {tierListCount}</li>
          <li>API URL: {`${process.env.REACT_APP_API_URL || 'http://localhost:8083/api'}/tierlists/user/${user?.userId || 1}`}</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="user-tierlists-container">
      <div className="tierlist-header-row">
        <h2>Your Tier Lists ({tierListCount})</h2>
        <button onClick={handleRefresh} className="refresh-btn">
          <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
        </button>
      </div>
      <div className="tierlists-grid">
        {tierLists.map(tierList => (
          <div key={tierList.id} className="tierlist-card">
            <div className="tierlist-header">
              <h3>{tierList.name}</h3>
              {tierList.categoryName && <span className="category">{tierList.categoryName}</span>}
              {tierList.createdAt && (
                <span className="created-date">
                  Created: {new Date(tierList.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="tierlist-items">
              {tierList.items && tierList.items.length > 0 ? (
                tierList.items.map((item, index) => (
                  <div key={index} className="tierlist-item">
                    <span className={`tier-badge ${item.tier.split(' ')[0].toLowerCase()}`}>{item.tier}</span>
                    <span className="recipe-name">{item.recipeName}</span>
                  </div>
                ))
              ) : (
                <p className="no-items">No items in this tier list</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTierLists; 