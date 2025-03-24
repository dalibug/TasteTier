import React, { useState, useEffect } from 'react';
import TierListService from '../services/TierListService';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import '../styles/UserTierLists.css';

const UserTierLists = () => {
  const [tierLists, setTierLists] = useState([]);
  const [tierListCount, setTierListCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get the current user

  useEffect(() => {
    const fetchTierLists = async () => {
      if (!user || !user.id) return;
      
      try {
        setLoading(true);
        
        // Fetch count first
        try {
          const count = await TierListService.getUserTierListCount(user.id);
          setTierListCount(count);
          
          // If count is 0, no need to fetch tier lists
          if (count === 0) {
            setTierLists([]);
            setLoading(false);
            return;
          }
        } catch (countErr) {
          console.error("Failed to fetch tier list count:", countErr);
          // Continue to fetch tier lists even if count fails
        }
        
        // Fetch tier lists
        const data = await TierListService.getUserTierLists(user.id);
        console.log('Fetched tier lists:', data); // Debugging
        setTierLists(data);
        
        // Update count if it wasn't set before
        if (tierListCount === 0 && data.length > 0) {
          setTierListCount(data.length);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load tier lists');
        setLoading(false);
        console.error(err);
      }
    };

    fetchTierLists();
  }, [user]);

  if (loading) return <div>Loading tier lists...</div>;
  if (error) return <div>Error: {error}</div>;
  if (tierListCount === 0) return <div>You haven't created any tier lists yet.</div>;

  return (
    <div className="user-tier-lists">
      <h2>Your Saved Tier Lists</h2>
      <div className="tier-list-grid">
        {tierLists.map(tierList => (
          <div key={tierList.tierlistId} className="tier-list-card">
            <h3>{tierList.name}</h3>
            <p>Category: {tierList.categoryName}</p>
            <p>Created: {new Date(tierList.createdAt).toLocaleDateString()}</p>
            <button 
              onClick={() => window.location.href = `/tierlist/${tierList.tierlistId}`}
              className="view-button"
            >
              View Tier List
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTierLists; 