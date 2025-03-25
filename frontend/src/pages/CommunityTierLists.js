import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHome, faSignOutAlt, faListAlt, faThumbsUp, faThumbsDown, faPercentage, faSpinner, faArrowUp, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import '../styles/TierLists.css';
import '../styles/Profile.css';
import TierListService from '../services/TierListService';

const CommunityTierLists = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  // Define baseUrl at component level so it's accessible to all functions
  const baseUrl = process.env.REACT_APP_DOCKER_ENV === "true" 
    ? "http://localhost:8083" 
    : "http://localhost:8083";

  const contentRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [communityLists, setCommunityLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Fetch all tier lists when component mounts
  useEffect(() => {
    fetchCommunityTierLists();
  }, []);

  const fetchCommunityTierLists = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[DEBUG] Fetching community tier lists...');
      
      // First try to use the TierListService
      try {
        const data = await TierListService.getAllTierLists();
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('[DEBUG] Community tier lists raw data from service:', data);
          processTierListData(data);
          return;
        } else {
          console.log('[DEBUG] No data from TierListService, falling back to direct API call');
        }
      } catch (serviceError) {
        console.error('[DEBUG] Error using TierListService:', serviceError);
        console.log('[DEBUG] Falling back to direct API call');
      }
      
      // Fallback: direct API call
      const apiUrl = `${baseUrl}/api/tierlists`;
      console.log('[DEBUG] Using direct API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === "") {
        console.log("[DEBUG] Empty response received from API");
        setCommunityLists([]);
        setLoading(false);
        return;
      }
      
      const data = JSON.parse(responseText);
      console.log('[DEBUG] Community tier lists from direct API:', data);
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log('[DEBUG] No community tier lists found');
        setCommunityLists([]);
        setLoading(false);
        return;
      }
      
      processTierListData(data);
      
    } catch (err) {
      console.error('[DEBUG] Error fetching community tier lists:', err);
      setError('Failed to load community tier lists. Please try again later.');
      setLoading(false);
    }
  };
  
  const processTierListData = async (tierListsData) => {
    try {
      console.log('[DEBUG] Processing tier list data:', tierListsData);
      
      // Format the tier lists for display
      const formattedLists = tierListsData.map(tierList => {
        // Base tier list object
        const formattedTierList = {
          id: tierList.id || tierList.tierlistId,
          name: tierList.name || 'Unnamed Tier List',
          creator: tierList.username || tierList.userName || 'Anonymous',
          userId: tierList.userId || tierList.user_id,
          categoryName: tierList.categoryName || 'Uncategorized',
          createdAt: tierList.createdAt || tierList.created_at,
          likes: tierList.likeCount || 0,
          isLiked: false,
          isDisliked: false,
          similarity: Math.floor(Math.random() * 100),
          items: []
        };
        
        // Process the items with tier information
        if (tierList.items && Array.isArray(tierList.items) && tierList.items.length > 0) {
          console.log(`[DEBUG] Tier list ${formattedTierList.id} has ${tierList.items.length} items`);
          
          formattedTierList.items = tierList.items.map(item => ({
            id: item.id || item.itemId,
            recipeId: item.recipeId || item.recipe_id,
            recipeName: item.recipeName || `Recipe ${item.recipeId || item.recipe_id}`,
            tier: item.tier || item.tierName || `Tier ${item.tierId || item.tier_id}`,
            position: item.position || 0
          }));
          
          // Log a sample item to verify recipe names are correct
          if (formattedTierList.items.length > 0) {
            console.log(`[DEBUG] Sample item from tier list ${formattedTierList.id}:`, formattedTierList.items[0]);
          }
        }
        
        return formattedTierList;
      });
      
      console.log('[DEBUG] All formatted community tier lists:', formattedLists);
      setCommunityLists(formattedLists);
      setLoading(false);
    } catch (err) {
      console.error('[DEBUG] Error processing tier list data:', err);
      setError('Failed to process tier list data. Please try again later.');
      setLoading(false);
    }
  };

  // Track scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setShowScrollToTop(contentRef.current.scrollTop > 300);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const hasTierListValidItems = (tierList) => {
    return tierList.items && 
           Array.isArray(tierList.items) && 
           tierList.items.length > 0 &&
           tierList.items.some(item => item.recipeName && item.tier);
  };

  const getTierListsStatus = () => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (!communityLists || communityLists.length === 0) return 'empty';
    
    // Check if there are tier lists but none have items
    const hasAnyValidItems = communityLists.some(tierList => hasTierListValidItems(tierList));
    if (!hasAnyValidItems) return 'no-items';
    
    return 'success';
  };

  const handleLike = (id) => {
    setCommunityLists(prevLists =>
      prevLists.map(list => {
        if (list.id === id) {
          // If already liked, unlike it
          if (list.isLiked) {
            return {
              ...list,
              likes: list.likes - 1,
              isLiked: false
            };
          }
          // If disliked, remove dislike and add like
          else if (list.isDisliked) {
            return {
              ...list,
              likes: list.likes + 1,
              isLiked: true,
              isDisliked: false
            };
          }
          // Otherwise, just like it
          else {
            return {
              ...list,
              likes: list.likes + 1,
              isLiked: true
            };
          }
        }
        return list;
      })
    );
  };

  const handleDislike = (id) => {
    setCommunityLists(prevLists =>
      prevLists.map(list => {
        if (list.id === id) {
          // If already disliked, remove dislike
          if (list.isDisliked) {
            return {
              ...list,
              isDisliked: false
            };
          }
          // If liked, remove like and add dislike
          else if (list.isLiked) {
            return {
              ...list,
              likes: list.likes - 1,
              isLiked: false,
              isDisliked: true
            };
          }
          // Otherwise, just dislike it
          else {
            return {
              ...list,
              isDisliked: true
            };
          }
        }
        return list;
      })
    );
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

  // Check if we have unique recipes across tier lists
  const uniqueRecipes = new Set();
  communityLists.forEach(list => {
    if (list.items && list.items.length > 0) {
      list.items.forEach(item => {
        uniqueRecipes.add(item.recipeName);
      });
    }
  });
  console.log(`[DEBUG] Found ${uniqueRecipes.size} unique recipe names across all tier lists`);
  console.log(`[DEBUG] Sample unique recipes:`, Array.from(uniqueRecipes).slice(0, 5));
  
  // Add detailed logging for each tier list's recipes
  if (communityLists.length > 0) {
    console.log('[DEBUG] ===== DETAILED TIER LIST CONTENTS =====');
    communityLists.forEach(list => {
      console.log(`[DEBUG] Tier list ${list.id} - "${list.name}" by ${list.creator}:`);
      
      if (list.items && list.items.length > 0) {
        // Group items by tier for more organized display
        const itemsByTier = {};
        list.items.forEach(item => {
          const tierKey = (item.tier || 'Unknown Tier').toUpperCase();
          if (!itemsByTier[tierKey]) {
            itemsByTier[tierKey] = [];
          }
          itemsByTier[tierKey].push(item);
        });
        
        // Display items organized by tier
        Object.keys(itemsByTier).forEach(tier => {
          console.log(`[DEBUG]   ${tier}:`);
          itemsByTier[tier].forEach(item => {
            console.log(`[DEBUG]     - ${item.recipeName} (ID: ${item.recipeId})`);
          });
        });
      } else {
        console.log('[DEBUG]   No items in this tier list');
      }
      console.log('[DEBUG] -----------------------------');
    });
  }

  return (
    <div className="tierlists-background" style={backgroundStyle}>
      <div className="fixed-header">
        <div className="nav-buttons">
          <div className="user-profile">
            <button 
              className="settings-btn user-btn" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
            {showUserMenu && (
              <div className="settings-menu user-menu">
                <Link to="/profile">
                  <button id="settings-menu-item">
                    <FontAwesomeIcon icon={faUser} /> Account
                  </button>
                </Link>
                <Link to="/tierlists">
                  <button id="settings-menu-item">
                    <FontAwesomeIcon icon={faListAlt} /> My Tier Lists
                  </button>
                </Link>
                <button id="settings-menu-item" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <h1 className="page-title">Community Tier Lists</h1>
      </div>

      <div ref={contentRef} className="community-content-wrapper">
        {getTierListsStatus() === 'loading' && (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>Loading community tier lists...</p>
          </div>
        )}
        
        {getTierListsStatus() === 'error' && (
          <div className="error-container">
            <p>{typeof error === 'string' ? error : error.message}</p>
            <button
              className="retry-btn"
              onClick={fetchCommunityTierLists}
            >
              <FontAwesomeIcon icon={faArrowsRotate} /> Try Again
            </button>
          </div>
        )}
        
        {getTierListsStatus() === 'empty' && (
          <div className="no-lists-message">
            <p>No community tier lists found. Be the first to create one!</p>
            <Link to="/tierlists">
              <button className="create-btn">Create a Tier List</button>
            </Link>
          </div>
        )}
        
        {getTierListsStatus() === 'no-items' && (
          <div className="no-lists-message">
            <p>Community tier lists were found, but they don't have any items. This might be an issue with data loading.</p>
            <button
              className="retry-btn"
              onClick={fetchCommunityTierLists}
            >
              <FontAwesomeIcon icon={faArrowsRotate} /> Refresh Data
            </button>
          </div>
        )}
        
        {getTierListsStatus() === 'success' && (
          <div className="existing-tierlists">
            <div className="community-tierlists-grid">
              {communityLists.map(tierList => (
                <div key={tierList.id} className="tierlist-card elegant-card">
                  <div className="tierlist-header elegant-header">
                    <div className="header-content">
                      <h3 className="tierlist-name">{tierList.name}</h3>
                      <div className="tierlist-meta">
                        <span className="creator-name">by <strong>{tierList.creator}</strong></span>
                        {tierList.categoryName && (
                          <span className="tierlist-category">{tierList.categoryName}</span>
                        )}
                        {tierList.createdAt && (
                          <span className="tierlist-date">
                            Created: {new Date(tierList.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="tierlist-items elegant-items">
                    {hasTierListValidItems(tierList) ? (
                      <div className="elegant-tiers-container">
                        {/* Group items by tier */}
                        {(() => {
                          // Sort items by tier priority (S, A, B, C, etc.) and then by position
                          const sortedItems = [...tierList.items].sort((a, b) => {
                            const tierOrder = { 's': 0, 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'f': 5 };
                            
                            // Extract the first character from tier name for comparison
                            const aTierChar = (a.tier || '').toLowerCase().charAt(0);
                            const bTierChar = (b.tier || '').toLowerCase().charAt(0);
                            
                            // Use the tier order if possible
                            const aTierVal = tierOrder[aTierChar] !== undefined ? tierOrder[aTierChar] : 6;
                            const bTierVal = tierOrder[bTierChar] !== undefined ? tierOrder[bTierChar] : 6;
                            
                            if (aTierVal !== bTierVal) {
                              return aTierVal - bTierVal;
                            }
                            return a.position - b.position;
                          });
                          
                          // Group items by tier
                          const itemsByTier = {};
                          sortedItems.forEach(item => {
                            // Get the tier character (S, A, B, etc.)
                            const tierChar = (item.tier || '').toLowerCase().charAt(0);
                            
                            // For invalid tier chars, use 'other'
                            const tierKey = (tierChar && /[sabcdf]/.test(tierChar)) ? tierChar : 'other';
                            
                            if (!itemsByTier[tierKey]) {
                              itemsByTier[tierKey] = [];
                            }
                            itemsByTier[tierKey].push(item);
                          });
                          
                          // Ensure we display all tiers in proper order
                          const tierOrder = ['s', 'a', 'b', 'c', 'd', 'f', 'other'];
                          
                          // For debugging purposes
                          console.log(`[DEBUG] Tier list ${tierList.id} has items in tiers:`, Object.keys(itemsByTier));
                          
                          return tierOrder.map(tier => {
                            if (!itemsByTier[tier]) return null;
                            
                            return (
                              <div key={`${tierList.id}-tier-${tier}`} className="elegant-tier-group">
                                <div className={`elegant-tier-header tier-${tier}`}>
                                  <span className={`tier-badge elegant-badge ${tier}`}>
                                    {tier === 'other' ? '?' : tier.toUpperCase()}
                                  </span>
                                  <span className="tier-name">Tier</span>
                                </div>
                                <div className="elegant-recipes-list">
                                  {itemsByTier[tier].map((item, index) => (
                                    <div 
                                      key={`${tierList.id}-${tier}-item-${index}`} 
                                      className="elegant-recipe-item"
                                    >
                                      <span className="elegant-recipe-name" title={item.recipeName}>
                                        {item.recipeName || 'Unknown Recipe'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <p className="no-items elegant-message">No items in this tier list</p>
                    )}
                  </div>
                  
                  <div className="tierlist-footer elegant-footer">
                    <div className="likes-container">
                      <div className="like-buttons">
                        <button 
                          className={`like-btn ${tierList.isLiked ? 'active' : ''}`}
                          onClick={() => handleLike(tierList.id)}
                        >
                          <FontAwesomeIcon icon={faThumbsUp} size="sm" fixedWidth />
                        </button>
                        <button 
                          className={`dislike-btn ${tierList.isDisliked ? 'active' : ''}`}
                          onClick={() => handleDislike(tierList.id)}
                        >
                          <FontAwesomeIcon icon={faThumbsDown} size="sm" fixedWidth />
                        </button>
                      </div>
                      <span className="likes-count">{tierList.likes} {tierList.likes === 1 ? 'Like' : 'Likes'}</span>
                    </div>
                    <div className="similarity-badge elegant-similarity">
                      <span>{tierList.similarity}</span>
                      <FontAwesomeIcon icon={faPercentage} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showScrollToTop && (
          <button 
            className="scroll-to-top-btn" 
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CommunityTierLists; 