import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TierListCard from '../components/TierListCard';
import UserService from '../services/userService';
import TierListService from '../services/tierListService';

const Profile = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [userTierLists, setUserTierLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        setFormData({
          username: userResponse.data.username,
          email: userResponse.data.email,
          bio: userResponse.data.bio || ''
        });
        
        // Get user's tier lists
        const tierListsResponse = await TierListService.getTierListsByUser(userResponse.data.userId);
        setUserTierLists(tierListsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await UserService.updateUser(user.userId, formData);
      
      // Update local user state
      setUser({
        ...user,
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      });
      
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update profile. Please try again later.');
    }
  };

  const handleLogout = async () => {
    try {
      await UserService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="profile-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="error">User not found. Please log in again.</div>
          <Link to="/login" className="login-btn">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
        </div>
        
        {error && <div className="error">{error}</div>}
        {updateSuccess && <div className="success">Profile updated successfully!</div>}
        
        <div className="profile-container">
          <div className="profile-section">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bio">Bio (Optional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-name-container">
                    <h2 className="profile-name">{user.username}</h2>
                    <p className="profile-email">{user.email}</p>
                  </div>
                </div>
                
                {user.bio && (
                  <div className="profile-bio">
                    <h3>Bio</h3>
                    <p>{user.bio}</p>
                  </div>
                )}
                
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-value">{userTierLists.length}</span>
                    <span className="stat-label">Tier Lists</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {userTierLists.filter(list => list.challenge !== null).length}
                    </span>
                    <span className="stat-label">Challenges</span>
                  </div>
                </div>
                
                <div className="profile-actions">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-profile-btn"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="logout-btn"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="recent-activity-section">
            <h2 className="section-title">Recent Tier Lists</h2>
            {userTierLists.length === 0 ? (
              <div className="no-tier-lists">
                <p>You haven't created any tier lists yet.</p>
                <Link to="/tierlists/new" className="create-btn">
                  Create Your First Tier List
                </Link>
              </div>
            ) : (
              <div className="recent-tier-lists">
                {userTierLists
                  .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
                  .slice(0, 3)
                  .map(tierList => (
                    <TierListCard 
                      key={tierList.tierListId} 
                      tierList={tierList} 
                      showUser={false}
                    />
                  ))
                }
                
                {userTierLists.length > 3 && (
                  <Link to="/tierlists" className="view-all-link">
                    View All Tier Lists
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 