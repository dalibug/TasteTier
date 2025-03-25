import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import '../styles/Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHome, faSignOutAlt, faListAlt, faPlus, faArrowsRotate, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import UserTierLists from '../components/UserTierLists';
import TierListService from '../services/TierListService';

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userTierLists, setUserTierLists] = useState([]);
  const [tierListCount, setTierListCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const navigate = useNavigate();

  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  // Fetch current user information
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoading(true);
      try {
        // Determine the API URL based on environment
        const baseUrl = process.env.REACT_APP_DOCKER_ENV === "true" 
          ? "http://localhost:8083" 
          : "http://localhost:8083";
        
        const response = await fetch(`${baseUrl}/auth/current-user`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const userData = await response.json();
        
        if (userData.authenticated) {
          setCurrentUser(userData);
          fetchUserTierLists(userData.userId);
          fetchTierListCount(userData.userId);
        } else {
          console.log("Not authenticated. Using default user ID 1 for testing.");
          // For testing purposes, use user ID 1 even when not authenticated
          setCurrentUser({userId: 1, username: "Test User"});
          fetchUserTierLists(1);
          fetchTierListCount(1);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('Failed to load user data. Please try again later.');
        setLoading(false);
        
        // For testing purposes, use default user ID 1 even on error
        console.log("Error detected. Using default user ID 1 for testing.");
        setCurrentUser({userId: 1, username: "Test User"});
        fetchUserTierLists(1);
        fetchTierListCount(1);
      }
    };
    
    fetchCurrentUser();
  }, [navigate]);

  // Re-fetch tier list count when tier lists change
  useEffect(() => {
    if (currentUser && currentUser.userId) {
      fetchTierListCount(currentUser.userId);
    }
  }, [userTierLists]);

  // Add a scroll indicator class if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      const section = document.querySelector('.user-tierlists-section');
      if (section) {
        if (section.scrollHeight > section.clientHeight) {
          section.classList.add('has-scroll');
        } else {
          section.classList.remove('has-scroll');
        }
      }
    };

    // Check after content loads
    checkScrollable();
    
    // Check again if window resizes
    window.addEventListener('resize', checkScrollable);
    
    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [userTierLists, loading]);

  // Track scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user's tier lists
  const fetchUserTierLists = async (userId) => {
    console.log("[DEBUG] Starting to fetch tier lists for user ID:", userId);
    console.log("[DEBUG] userId type:", typeof userId);
    
    // For troubleshooting, use a hardcoded user ID if the provided one isn't valid
    if (!userId) {
      console.log("[DEBUG] Using default user ID 1 for testing");
      userId = 1;
    }
    
    try {
      // Determine the API URL based on environment
      const baseUrl = process.env.REACT_APP_DOCKER_ENV === "true" 
        ? "http://localhost:8083" 
        : "http://localhost:8083";
      
      // Use the updated controller endpoint that uses @Transactional
      const apiUrl = `${baseUrl}/api/tierlists/user/${userId}`;
      console.log("[DEBUG] Using tierlists controller API URL:", apiUrl);
      
      // Make the request
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Handle HTTP error status codes
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the response text
      const responseText = await response.text();
      console.log(`[DEBUG] TierList controller API response length: ${responseText.length}`);
      
      // Check if we got an empty response
      if (!responseText || responseText.trim() === "") {
        console.log("[DEBUG] Empty response received from API");
        setUserTierLists([]);
        setError({ message: "No tier lists found." });
        setLoading(false);
        return;
      }
      
      // Parse the JSON response
      const data = JSON.parse(responseText);
      console.log("[DEBUG] Tier lists from controller API:", data);
      
      // If the array is empty, display a friendly message
      if (!Array.isArray(data) || data.length === 0) {
        console.log('[DEBUG] No tier lists found for this user');
        setUserTierLists([]);
        setError({ message: "You don't have any tier lists yet. Create your first one!" });
        setLoading(false);
        return;
      }
      
      // Format the tier lists for display
      const formattedTierLists = data.map(tierList => {
        // Format the tier list
        const formattedTierList = {
          id: tierList.tierlistId,
          name: tierList.name || 'Unnamed Tier List',
          categoryName: tierList.categoryName || 'Uncategorized',
          createdAt: tierList.createdAt,
          items: []
        };
        
        // Format the items with tier information
        if (tierList.items && Array.isArray(tierList.items)) {
          formattedTierList.items = tierList.items.map(item => ({
            id: item.itemId,
            recipeName: item.recipeName || `Recipe ${item.recipeId}`,
            tier: item.tierName || `Tier ${item.tierId}`,
            position: item.position || 0
          }));
        }
        
        return formattedTierList;
      });
      
      console.log("[DEBUG] Final formatted tier lists:", formattedTierLists);
      setUserTierLists(formattedTierLists);
      setError(null);
      setLoading(false);
      
    } catch (err) {
      console.error('Failed to fetch user tier lists:', err);
      
      // Since we got an error, fall back to using the old tables API approach
      console.log('[DEBUG] Trying tables API as fallback...');
      
      try {
        // Use the tables API endpoint as fallback
        const baseUrl = process.env.REACT_APP_DOCKER_ENV === "true" 
          ? "http://localhost:8083" 
          : "http://localhost:8083";
        
        const apiUrl = `${baseUrl}/api/tables/tier_lists?filter=user_id:${userId}`;
        console.log("[DEBUG] Using tables API URL as fallback:", apiUrl);
        
        // Make the request
        const response = await fetch(apiUrl, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // Handle HTTP error status codes
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[DEBUG] Error response body from fallback:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the response text
        const responseText = await response.text();
        console.log(`[DEBUG] Tables API fallback response length: ${responseText.length}`);
        
        // Check if we got an empty response
        if (!responseText || responseText.trim() === "") {
          console.log("[DEBUG] Empty response received from fallback API");
          setUserTierLists([]);
          setError({ message: "No tier lists found." });
          setLoading(false);
          return;
        }
        
        // Parse the JSON response
        const data = JSON.parse(responseText);
        console.log("[DEBUG] Tier lists from fallback API:", data);
        
        // If the array is empty, display a friendly message
        if (!Array.isArray(data) || data.length === 0) {
          console.log('[DEBUG] No tier lists found for this user in fallback API');
          setUserTierLists([]);
          setError({ message: "You don't have any tier lists yet. Create your first one!" });
          setLoading(false);
          return;
        }
        
        // Get category info for each tier list
        const tierListWithCategories = await Promise.all(
          data.map(async (tierList) => {
            try {
              const categoryUrl = `${baseUrl}/api/tables/categories?filter=category_id:${tierList.category_id}`;
              const categoryResponse = await fetch(categoryUrl, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
              });
              
              if (categoryResponse.ok) {
                const categories = await categoryResponse.json();
                if (Array.isArray(categories) && categories.length > 0) {
                  return { ...tierList, categoryName: categories[0].name };
                }
              }
              return { ...tierList, categoryName: 'Uncategorized' };
            } catch (err) {
              console.error(`[DEBUG] Error fetching category for tierlist ${tierList.tierlist_id}:`, err);
              return { ...tierList, categoryName: 'Uncategorized' };
            }
          })
        );
        
        console.log("[DEBUG] Tier lists with categories from fallback:", tierListWithCategories);
        
        // Now get items for each tier list
        const completeFormattedTierLists = await Promise.all(
          tierListWithCategories.map(async (tierList) => {
            try {
              // Format the base tier list
              const formattedTierList = {
                id: tierList.tierlist_id,
                name: tierList.name || 'Unnamed Tier List',
                categoryName: tierList.categoryName || 'Uncategorized',
                createdAt: tierList.created_at,
                items: []
              };
              
              // Get the items for this tier list
              const itemsUrl = `${baseUrl}/api/tables/tierlist_recipes?filter=tierlist_id:${tierList.tierlist_id}`;
              const itemsResponse = await fetch(itemsUrl, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
              });
              
              if (itemsResponse.ok) {
                const items = await itemsResponse.json();
                console.log(`[DEBUG] Items for tierlist ${tierList.tierlist_id} from fallback:`, items);
                
                if (Array.isArray(items) && items.length > 0) {
                  // Get tier information
                  const tierIds = [...new Set(items.map(item => item.tier_id))];
                  const tierInfoMap = {};
                  
                  // Fetch tier names
                  for (const tierId of tierIds) {
                    try {
                      const tierUrl = `${baseUrl}/api/tables/tiers?filter=tier_id:${tierId}`;
                      const tierResponse = await fetch(tierUrl, {
                        credentials: 'include',
                        headers: { 'Accept': 'application/json' }
                      });
                      
                      if (tierResponse.ok) {
                        const tiers = await tierResponse.json();
                        if (Array.isArray(tiers) && tiers.length > 0) {
                          tierInfoMap[tierId] = tiers[0].name;
                        } else {
                          tierInfoMap[tierId] = `Tier ${tierId}`;
                        }
                      } else {
                        tierInfoMap[tierId] = `Tier ${tierId}`;
                      }
                    } catch (err) {
                      console.error(`[DEBUG] Error fetching tier info for tier ${tierId}:`, err);
                      tierInfoMap[tierId] = `Tier ${tierId}`;
                    }
                  }
                  
                  // Get recipe information
                  const recipeIds = [...new Set(items.map(item => item.recipe_id))];
                  const recipeInfoMap = {};
                  
                  // Fetch recipe names
                  for (const recipeId of recipeIds) {
                    try {
                      const recipeUrl = `${baseUrl}/api/tables/recipes?filter=recipe_id:${recipeId}`;
                      const recipeResponse = await fetch(recipeUrl, {
                        credentials: 'include',
                        headers: { 'Accept': 'application/json' }
                      });
                      
                      if (recipeResponse.ok) {
                        const recipes = await recipeResponse.json();
                        if (Array.isArray(recipes) && recipes.length > 0) {
                          recipeInfoMap[recipeId] = recipes[0].title;
                        } else {
                          recipeInfoMap[recipeId] = `Recipe ${recipeId}`;
                        }
                      } else {
                        recipeInfoMap[recipeId] = `Recipe ${recipeId}`;
                      }
                    } catch (err) {
                      console.error(`[DEBUG] Error fetching recipe info for recipe ${recipeId}:`, err);
                      recipeInfoMap[recipeId] = `Recipe ${recipeId}`;
                    }
                  }
                  
                  // Format items with tier and recipe information
                  formattedTierList.items = items.map(item => ({
                    id: item.item_id,
                    recipeName: recipeInfoMap[item.recipe_id] || `Recipe ${item.recipe_id}`,
                    tier: tierInfoMap[item.tier_id] || `Tier ${item.tier_id}`,
                    position: item.position || 0
                  }));
                }
              }
              
              return formattedTierList;
            } catch (err) {
              console.error(`[DEBUG] Error processing tierlist ${tierList.tierlist_id}:`, err);
              return {
                id: tierList.tierlist_id,
                name: tierList.name || 'Unnamed Tier List',
                categoryName: tierList.categoryName || 'Uncategorized',
                createdAt: tierList.created_at,
                items: []
              };
            }
          })
        );
        
        console.log("[DEBUG] Final formatted tier lists from fallback:", completeFormattedTierLists);
        setUserTierLists(completeFormattedTierLists);
        setError(null);
      } catch (fallbackErr) {
        console.error('Fallback API also failed:', fallbackErr);
        setUserTierLists([]);
        setError({
          message: "Could not load your tier lists from the server. Please try again later.",
          details: err.message
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch the count of tier lists for the user
  const fetchTierListCount = async (userId) => {
    if (!userId) {
      console.log("[DEBUG] Cannot fetch tier list count: No user ID provided");
      return;
    }

    try {
      console.log("[DEBUG] Fetching tier list count for user ID:", userId);
      const count = await TierListService.getUserTierListCount(userId);
      console.log("[DEBUG] Tier list count:", count);
      setTierListCount(count);
    } catch (error) {
      console.error("Failed to fetch tier list count:", error);
      // Fallback to using the length of the tier lists array if available
      if (userTierLists && Array.isArray(userTierLists)) {
        setTierListCount(userTierLists.length);
      }
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const hasTierListValidItems = (tierList) => {
    return tierList.items && 
           Array.isArray(tierList.items) && 
           tierList.items.length > 0 &&
           tierList.items.some(item => item.recipeName && item.tier);
  };

  // Helper function to get status of tier lists
  const getTierListsStatus = () => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (!userTierLists || userTierLists.length === 0) return 'empty';
    
    // Check if there are tier lists but none have items
    const hasAnyValidItems = userTierLists.some(tierList => hasTierListValidItems(tierList));
    if (!hasAnyValidItems) return 'no-items';
    
    return 'success';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="profile-background" style={backgroundStyle}>
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
                    <FontAwesomeIcon icon={faListAlt} /> Tier Lists
                  </button>
                </Link>
                <button id="settings-menu-item" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-container">
        <h1 className="category-heading">MY PROFILE</h1>

        {loading ? (
          <div className="loading-indicator">Loading profile data...</div>
        ) : error ? (
          <div className="error-message">{typeof error === 'string' ? error : error.message}</div>
        ) : currentUser && (
          <div className="profile-content">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {currentUser.pictureUrl ? (
                    <img src={currentUser.pictureUrl} alt={currentUser.username} />
                  ) : (
                    <div className="avatar-placeholder">{currentUser.username.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="profile-info">
                  <h2>{currentUser.username}</h2>
                  <p className="profile-email">{currentUser.email}</p>
                </div>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">Tier Lists Created:</span>
                  <span className="detail-value">{tierListCount}</span>
                </div>
              </div>
            </div>

            {/* User Tier Lists Section */}
            <div className="user-tierlists-section">
              <h2>My Recipe Tier Lists</h2>
              
              {getTierListsStatus() === 'loading' && (
                <div className="loading-indicator">Loading your tier lists...</div>
              )}
              
              {getTierListsStatus() === 'error' && (
                <div className="error-message">
                  <p>{typeof error === 'string' ? error : error.message}</p>
                  <button onClick={() => fetchUserTierLists(currentUser.userId)} className="retry-btn">Retry</button>
                </div>
              )}
              
              {getTierListsStatus() === 'empty' && (
                <div className="no-tierlists">
                  <p>You haven't created any tier lists yet!</p>
                  <Link to="/tierlists">
                    <button className="create-btn">
                      <FontAwesomeIcon icon={faPlus} /> Create Your First Tier List
                    </button>
                  </Link>
                </div>
              )}
              
              {getTierListsStatus() === 'no-items' && (
                <div className="no-tierlists">
                  <p>Your tier lists were found, but they don't have any items in them. This might be an issue with data loading.</p>
                  <button className="refresh-btn" onClick={() => fetchUserTierLists(currentUser.userId)}>
                    <FontAwesomeIcon icon={faArrowsRotate} /> Refresh Data
                  </button>
                </div>
              )}
              
              {getTierListsStatus() === 'success' && (
                <div className="tierlists-grid" style={{ width: '100%', minHeight: '100px' }}>
                  {userTierLists.map(tierList => (
                    <div key={tierList.id} className="tierlist-card">
                      <div className="tierlist-header">
                        <div className="header-content">
                          <h3 className="tierlist-name">{tierList.name || 'Unnamed Tier List'}</h3>
                          {tierList.categoryName && (
                            <span className="tierlist-category">{tierList.categoryName}</span>
                          )}
                          {tierList.createdAt && (
                            <span className="tierlist-date">
                              {new Date(tierList.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="tierlist-items">
                        {hasTierListValidItems(tierList) ? (
                          <div className="items-grid">
                            {tierList.items.map((item, index) => (
                              <div 
                                key={`${tierList.id}-item-${index}`} 
                                className={`tierlist-item ${item.tier ? item.tier.split(' ')[0].toLowerCase() + '-tier' : 's-tier'}`}
                              >
                                <span className="recipe-name" title={item.recipeName}>
                                  {item.recipeName || 'Unknown Recipe'}
                                </span>
                                <span className={`tier-badge ${item.tier ? item.tier.split(' ')[0].toLowerCase() : 's'}`}>
                                  {item.tier || 'S Tier'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-items">No items in this tier list</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', paddingBottom: '15px' }}>
                <Link to="/tierlists">
                  <button className="create-btn elegant-create-btn">
                    <FontAwesomeIcon icon={faPlus} /> Create a New Tier List
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
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
  );
};

export default Profile; 