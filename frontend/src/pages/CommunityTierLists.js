import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHome, faSignOutAlt, faListAlt, faThumbsUp, faThumbsDown, faPercentage, faSpinner, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import '../styles/TierLists.css';
import TierListService from '../services/TierListService';

const CommunityTierLists = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  const contentRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [communityLists, setCommunityLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Fetch all tier lists when component mounts
  useEffect(() => {
    const fetchCommunityTierLists = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await TierListService.getAllTierLists();
        
        // Process the data to match our component's needs
        if (Array.isArray(data)) {
          const formattedLists = data.map(tierList => ({
            id: tierList.id,
            name: tierList.name || 'Unnamed Tier List',
            creator: tierList.username || 'Anonymous',
            categoryName: tierList.categoryName || 'General',
            createdAt: tierList.createdAt,
            likes: tierList.likeCount || 0,
            isLiked: false,
            isDisliked: false,
            similarity: Math.floor(Math.random() * 100), // Placeholder until we implement similarity algorithm
            items: Array.isArray(tierList.items) 
              ? tierList.items.map(item => ({
                  recipeName: item.recipeName || item.name || 'Unknown Recipe',
                  tier: item.tierName || 'S Tier'
                }))
              : []
          }));
          
          setCommunityLists(formattedLists);
        } else {
          setCommunityLists([]);
        }
      } catch (err) {
        console.error('Error fetching community tier lists:', err);
        setError('Failed to load community tier lists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityTierLists();
  }, []);

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
    // Call logout API
    fetch('/api/v1/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    })
    .then(() => {
      // Redirect to welcome page after logout
      window.location.href = '/';
    })
    .catch(error => {
      console.error('Logout failed:', error);
    });
  };

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
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>Loading community tier lists...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : communityLists.length === 0 ? (
          <div className="no-lists-message">
            <p>No community tier lists found. Be the first to create one!</p>
            <Link to="/tierlists">
              <button className="create-btn">Create a Tier List</button>
            </Link>
          </div>
        ) : (
          <div className="existing-tierlists">
            <div className="community-tierlists-grid">
              {communityLists.map(tierList => (
                <div key={tierList.id} className="tierlist-card">
                  <div className="tierlist-header">
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
                  <div className="tierlist-items">
                    {tierList.items && tierList.items.length > 0 ? (
                      tierList.items.map((item, index) => (
                        <div key={index} className="tierlist-item">
                          <span className="recipe-name" title={item.recipeName}>{item.recipeName}</span>
                          <span className={`tier-badge ${item.tier.split(' ')[0].toLowerCase()}`}>
                            {item.tier}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="empty-tierlist-message">
                        <p className="no-items">This tier list doesn't have any recipes.</p>
                      </div>
                    )}
                  </div>
                  <div className="tierlist-footer">
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
                    <div className="similarity-badge">
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