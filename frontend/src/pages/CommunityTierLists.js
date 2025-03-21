import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHome, faSignOutAlt, faListAlt, faThumbsUp, faThumbsDown, faPercentage } from '@fortawesome/free-solid-svg-icons';
import '../styles/TierLists.css';

const CommunityTierLists = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  const [showUserMenu, setShowUserMenu] = useState(false);

  // Example community tier lists with liked state and similarity percentage
  const [communityLists, setCommunityLists] = useState([
    {
      id: 1,
      name: "Italian Cuisine Rankings",
      creator: "FoodLover123",
      likes: 24,
      isLiked: false,
      isDisliked: false,
      similarity: 85, // Percentage of similarity with user's tier lists
      items: [
        { recipeName: "Recipe 1", tier: "S Tier" },
        { recipeName: "Recipe 2", tier: "A Tier" },
        { recipeName: "Recipe 3", tier: "B Tier" },
        { recipeName: "Recipe 6", tier: "C Tier" },
        { recipeName: "Recipe 7", tier: "A Tier" },
      ]
    },
    {
      id: 2,
      name: "Best Desserts",
      creator: "SweetTooth",
      likes: 15,
      isLiked: false,
      isDisliked: false,
      similarity: 92,
      items: [
        { recipeName: "Recipe 4", tier: "S Tier" },
        { recipeName: "Recipe 5", tier: "A Tier" },
        { recipeName: "Recipe 8", tier: "B Tier" },
        { recipeName: "Recipe 9", tier: "C Tier" },
        { recipeName: "Recipe 10", tier: "S Tier" },
      ]
    },
    {
      id: 3,
      name: "Top Seafood Dishes",
      creator: "OceanFlavor",
      likes: 18,
      isLiked: false,
      isDisliked: false,
      similarity: 78,
      items: [
        { recipeName: "Grilled Salmon", tier: "S Tier" },
        { recipeName: "Shrimp Scampi", tier: "A Tier" },
        { recipeName: "Fish Tacos", tier: "B Tier" },
        { recipeName: "Crab Cakes", tier: "S Tier" },
        { recipeName: "Tuna Steak", tier: "A Tier" },
      ]
    }
  ]);

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

      <div className="community-content-wrapper">
        <div className="existing-tierlists">
          <div className="community-tierlists-grid">
            {communityLists.map(tierList => (
              <div key={tierList.id} className="tierlist-card">
                <div className="tierlist-header">
                  <div className="header-content">
                    <h3 className="tierlist-name">{tierList.name}</h3>
                    <span className="creator-name">by {tierList.creator}</span>
                  </div>
                </div>
                <div className="tierlist-items">
                  {tierList.items.map((item, index) => (
                    <div key={index} className="tierlist-item">
                      <span className="recipe-name" title={item.recipeName}>{item.recipeName}</span>
                      <span className={`tier-badge ${item.tier.split(' ')[0].toLowerCase()}`}>
                        {item.tier}
                      </span>
                    </div>
                  ))}
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
      </div>
    </div>
  );
};

export default CommunityTierLists; 