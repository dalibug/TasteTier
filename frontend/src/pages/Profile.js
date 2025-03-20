import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background3.png';
import '../styles/Profile.css';

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userTierLists, setUserTierLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  // Fetch current user information
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Determine the API URL based on the environment
        const isDocker = window.location.hostname !== 'localhost';
        const apiUrl = isDocker 
          ? 'http://api:8083/auth/current-user'
          : 'http://localhost:8083/auth/current-user';
        
        const response = await fetch(apiUrl, {
          credentials: 'include' // Important: include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const userData = await response.json();
        
        if (userData.authenticated) {
          setCurrentUser(userData);
          fetchUserTierLists(userData.userId);
        } else {
          // Not authenticated, redirect to login
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('Failed to load user data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, [navigate]);

  // Fetch user's tier lists
  const fetchUserTierLists = async (userId) => {
    try {
      setLoading(true);
      
      // Determine the API URL based on the environment
      const isDocker = window.location.hostname !== 'localhost';
      const apiUrl = isDocker 
        ? `http://api:8083/api/tierlists/user/${userId}`
        : `http://localhost:8083/api/tierlists/user/${userId}`;
      
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setUserTierLists(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user tier lists:', err);
      setError('Failed to load your tier lists. Please try again later.');
    } finally {
      setLoading(false);
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

  return (
    <div className="profile-background" style={backgroundStyle}>
      <div className="nav-buttons">
        <div className="user-profile">
          <Link to="/tierlists">
            <button className="nav-btn">Tier Lists</button>
          </Link>
          <Link to="/">
            <button className="nav-btn home-btn">Home</button>
          </Link>
          <button onClick={handleLogout} className="nav-btn">Logout</button>
        </div>
      </div>

      <div className="profile-container">
        <h1 className="profile-title">My Profile</h1>

        {loading ? (
          <div className="loading-indicator">Loading profile data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
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
                  <span className="detail-label">Account Created:</span>
                  <span className="detail-value">{formatDate(currentUser.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Login:</span>
                  <span className="detail-value">{formatDate(currentUser.lastLogin)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tier Lists Created:</span>
                  <span className="detail-value">{userTierLists.length}</span>
                </div>
              </div>
            </div>

            <div className="user-tierlists-section">
              <h2>My Tier Lists</h2>
              
              {userTierLists.length === 0 ? (
                <div className="no-tierlists">
                  <p>You haven't created any tier lists yet.</p>
                  <Link to="/tierlists">
                    <button className="create-btn">Create Your First Tier List</button>
                  </Link>
                </div>
              ) : (
                <div className="tierlists-grid">
                  {userTierLists.map(tierlist => (
                    <div key={tierlist.id} className="tierlist-card">
                      <div className="tierlist-header">
                        <div className="header-content">
                          <h3 className="tierlist-name">{tierlist.name}</h3>
                        </div>
                      </div>
                      <div className="tierlist-items">
                        {tierlist.items && tierlist.items.map((item, index) => (
                          <div key={index} className="tierlist-item">
                            <span className="recipe-name">{item.recipeName}</span>
                            <span className={`tier-badge ${item.tier.split(' ')[0].toLowerCase()}`}>
                              {item.tier}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="tierlist-footer">
                        <span className="tierlist-date">
                          Created: {formatDate(tierlist.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 