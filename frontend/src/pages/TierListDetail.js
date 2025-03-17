import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TierGrid from '../components/TierGrid';
import TierListService from '../services/tierListService';
import TierListItemService from '../services/tierListItemService';
import UserService from '../services/userService';

const TierListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tierList, setTierList] = useState(null);
  const [items, setItems] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        
        // Get tier list
        const tierListResponse = await TierListService.getTierListById(id);
        setTierList(tierListResponse.data);
        
        // Check if user is owner
        setIsOwner(userResponse.data.userId === tierListResponse.data.user.userId);
        
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
        setError(null);
      } catch (err) {
        console.error('Error fetching tier list:', err);
        setError('Failed to load tier list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleVisibility = async () => {
    try {
      await TierListService.toggleTierListVisibility(id);
      setTierList({
        ...tierList,
        isPublic: !tierList.isPublic
      });
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setError('Failed to update visibility. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tier list? This action cannot be undone.')) {
      try {
        await TierListService.deleteTierList(id);
        navigate('/tierlists');
      } catch (err) {
        console.error('Error deleting tier list:', err);
        setError('Failed to delete tier list. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="tierlist-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading tier list...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tierlist-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="error">{error}</div>
          <Link to="/tierlists" className="back-btn">Back to Tier Lists</Link>
        </div>
      </div>
    );
  }

  if (!tierList) {
    return (
      <div className="tierlist-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="not-found">Tier list not found.</div>
          <Link to="/tierlists" className="back-btn">Back to Tier Lists</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tierlist-detail-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="tierlist-header">
          <div className="header-left">
            <h1 className="tierlist-name">{tierList.name}</h1>
            <div className="tierlist-meta">
              <span className="category">
                Category: {tierList.category ? tierList.category.name : 'Uncategorized'}
              </span>
              {tierList.challenge && (
                <span className="challenge">
                  Challenge: Week {tierList.challenge.weekNumber}/{tierList.challenge.year}
                </span>
              )}
              <span className="created-by">
                Created by: {tierList.user.username}
              </span>
              <span className="created-at">
                Created: {formatDate(tierList.createdAt)}
              </span>
              <span className="last-modified">
                Last modified: {formatDate(tierList.lastModified)}
              </span>
              <span className={`visibility-badge ${tierList.isPublic ? 'public' : 'private'}`}>
                {tierList.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
          <div className="header-right">
            <Link to="/tierlists" className="back-btn">Back to Tier Lists</Link>
            {isOwner && (
              <>
                <Link to={`/tierlists/${id}/edit`} className="edit-btn">Edit</Link>
                <button onClick={handleToggleVisibility} className="visibility-btn">
                  {tierList.isPublic ? 'Make Private' : 'Make Public'}
                </button>
                <button onClick={handleDelete} className="delete-btn">Delete</button>
              </>
            )}
          </div>
        </div>
        
        <div className="tierlist-content">
          {items.length === 0 ? (
            <div className="empty-tierlist">
              <p>This tier list is empty.</p>
              {isOwner && (
                <Link to={`/tierlists/${id}/edit`} className="add-items-btn">
                  Add Items
                </Link>
              )}
            </div>
          ) : (
            <TierGrid tiers={tiers} items={items} readOnly={true} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TierListDetail; 