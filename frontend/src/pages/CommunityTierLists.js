import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';

const CommunityTierLists = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  // Example community tier lists with liked state and similarity percentage
  const [communityLists, setCommunityLists] = useState([
    {
      id: 1,
      name: "Italian Cuisine Rankings",
      creator: "FoodLover123",
      likes: 24,
      isLiked: false,
      similarity: 85, // Percentage of similarity with user's tier lists
      items: [
        { recipeName: "Recipe 1", tier: "S Tier" },
        { recipeName: "Recipe 2", tier: "A Tier" },
        { recipeName: "Recipe 3", tier: "B Tier" },
      ]
    },
    {
      id: 2,
      name: "Best Desserts",
      creator: "SweetTooth",
      likes: 15,
      isLiked: false,
      similarity: 92,
      items: [
        { recipeName: "Recipe 4", tier: "S Tier" },
        { recipeName: "Recipe 5", tier: "A Tier" },
      ]
    }
  ]);

  const handleLike = (id) => {
    setCommunityLists(prevLists =>
      prevLists.map(list => {
        if (list.id === id) {
          return {
            ...list,
            likes: list.isLiked ? list.likes - 1 : list.likes + 1,
            isLiked: !list.isLiked
          };
        }
        return list;
      })
    );
  };

  return (
    <div className="tierlists-background" style={backgroundStyle}>
      <div className="fixed-header">
        <div className="nav-buttons">
          <Link to="/">
            <button className="nav-btn home-btn">Home</button>
          </Link>
          <Link to="/tierlists">
            <button className="nav-btn">My Tier Lists</button>
          </Link>
        </div>
        <h1 className="page-title">Community Tier Lists</h1>
      </div>

      <div className="content-wrapper">
        <div className="existing-tierlists">
          <div className="tierlists-grid">
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
                  <div className="like-container">
                    <button 
                      className={`like-btn ${tierList.isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(tierList.id)}
                    >
                      <span className="thumbs-up">👍</span>
                    </button>
                    <span className="likes-count">{tierList.likes} Likes</span>
                  </div>
                  <span className="similarity-badge">{tierList.similarity}% Match</span>
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