import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TierListCard from '../components/TierListCard';
import WeeklyChallengeService from '../services/weeklyChallengeService';
import TierListService from '../services/tierListService';
import UserService from '../services/userService';

const WeeklyChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [challenge, setChallenge] = useState(null);
  const [tierLists, setTierLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userParticipated, setUserParticipated] = useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        setIsAdmin(userResponse.data.isAdmin);
        
        // Get challenge details
        const challengeResponse = await WeeklyChallengeService.getWeeklyChallengeById(id);
        setChallenge(challengeResponse.data);
        
        // Get tier lists for this challenge
        const tierListsResponse = await TierListService.getTierListsByChallenge(id);
        setTierLists(tierListsResponse.data);
        
        // Check if user has participated
        const hasParticipated = tierListsResponse.data.some(
          tierList => tierList.user && tierList.user.userId === userResponse.data.userId
        );
        setUserParticipated(hasParticipated);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching challenge details:', err);
        setError('Failed to load challenge details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await WeeklyChallengeService.updateWeeklyChallengeStatus(id, newStatus);
      setChallenge({...challenge, status: newStatus});
    } catch (err) {
      console.error('Error updating challenge status:', err);
      setError('Failed to update challenge status. Please try again later.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      try {
        await WeeklyChallengeService.deleteWeeklyChallenge(id);
        navigate('/weekly-challenges');
      } catch (err) {
        console.error('Error deleting challenge:', err);
        setError('Failed to delete challenge. Please try again later.');
      }
    }
  };

  if (loading) {
    return (
      <div className="weekly-challenge-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading challenge details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-challenge-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="error">{error}</div>
          <Link to="/weekly-challenges" className="back-btn">
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="weekly-challenge-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="not-found">Challenge not found</div>
          <Link to="/weekly-challenges" className="back-btn">
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  const isActive = challenge.status.toLowerCase() === 'active';
  const isCompleted = challenge.status.toLowerCase() === 'completed';
  const isScheduled = challenge.status.toLowerCase() === 'scheduled';
  const isCanceled = challenge.status.toLowerCase() === 'canceled';
  
  const timeRemaining = () => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    const diffTime = endDate - now;
    
    if (diffTime <= 0) return 'Challenge has ended';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    }
  };

  return (
    <div className="weekly-challenge-detail-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <Link to="/weekly-challenges" className="back-btn">
            &larr; Back to Challenges
          </Link>
          <h1 className="page-title">
            Week {challenge.weekNumber}/{challenge.year} Challenge
          </h1>
          {isAdmin && (
            <div className="admin-actions">
              <Link to={`/weekly-challenges/${id}/edit`} className="edit-btn">
                Edit Challenge
              </Link>
              <button onClick={handleDelete} className="delete-btn">
                Delete Challenge
              </button>
            </div>
          )}
        </div>
        
        <div className="challenge-details">
          <div className="challenge-info">
            <div className="challenge-status-section">
              <span className={`challenge-status status-${challenge.status.toLowerCase()}`}>
                {challenge.status}
              </span>
              {isAdmin && (
                <div className="status-actions">
                  {!isActive && !isCanceled && (
                    <button 
                      onClick={() => handleStatusChange('ACTIVE')}
                      className="status-btn activate-btn"
                      disabled={isCompleted}
                    >
                      Activate
                    </button>
                  )}
                  {!isCompleted && !isCanceled && (
                    <button 
                      onClick={() => handleStatusChange('COMPLETED')}
                      className="status-btn complete-btn"
                    >
                      Complete
                    </button>
                  )}
                  {!isCanceled && (
                    <button 
                      onClick={() => handleStatusChange('CANCELED')}
                      className="status-btn cancel-btn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="challenge-dates">
              <div className="date-item">
                <span className="date-label">Start Date:</span>
                <span className="date-value">{formatDate(challenge.startDate)}</span>
              </div>
              <div className="date-item">
                <span className="date-label">End Date:</span>
                <span className="date-value">{formatDate(challenge.endDate)}</span>
              </div>
              {isActive && (
                <div className="time-remaining">
                  {timeRemaining()}
                </div>
              )}
            </div>
            
            <div className="challenge-categories">
              <h3>Categories</h3>
              {challenge.categories && challenge.categories.length > 0 ? (
                <ul className="category-list">
                  {challenge.categories.map(category => (
                    <li key={category.categoryId} className="category-item">
                      {category.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No categories assigned to this challenge.</p>
              )}
            </div>
            
            {challenge.description && (
              <div className="challenge-description">
                <h3>Description</h3>
                <p>{challenge.description}</p>
              </div>
            )}
            
            {isActive && !userParticipated && (
              <div className="participation-cta">
                <Link to={`/tierlists/new?challenge=${id}`} className="participate-btn">
                  Participate in this Challenge
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="challenge-submissions">
          <h2 className="section-title">Submissions</h2>
          {tierLists.length === 0 ? (
            <p className="no-submissions">No submissions yet for this challenge.</p>
          ) : (
            <div className="tier-lists-grid">
              {tierLists.map(tierList => (
                <TierListCard 
                  key={tierList.tierListId} 
                  tierList={tierList} 
                  showUser={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyChallengeDetail; 