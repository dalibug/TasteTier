import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WeeklyChallengeService from '../services/weeklyChallengeService';
import UserService from '../services/userService';

const WeeklyChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        setIsAdmin(userResponse.data.isAdmin);
        
        // Get all challenges
        const challengesResponse = await WeeklyChallengeService.getAllWeeklyChallenges();
        setChallenges(challengesResponse.data);
        
        // Get active challenge
        const activeChallengeResponse = await WeeklyChallengeService.getActiveWeeklyChallenges();
        if (activeChallengeResponse.data && activeChallengeResponse.data.length > 0) {
          setActiveChallenge(activeChallengeResponse.data[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching challenges:', err);
        setError('Failed to load challenges. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getChallengeStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'canceled':
        return 'status-canceled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="weekly-challenges-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading challenges...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-challenges-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">Weekly Challenges</h1>
          {isAdmin && (
            <Link to="/weekly-challenges/new" className="create-btn">
              Create New Challenge
            </Link>
          )}
        </div>
        
        {error && <div className="error">{error}</div>}
        
        {activeChallenge && (
          <div className="active-challenge-section">
            <h2 className="section-title">Current Challenge</h2>
            <div className="challenge-card active">
              <div className="challenge-header">
                <h3 className="challenge-title">
                  Week {activeChallenge.weekNumber}/{activeChallenge.year}
                </h3>
                <span className={`challenge-status ${getChallengeStatusClass(activeChallenge.status)}`}>
                  {activeChallenge.status}
                </span>
              </div>
              <div className="challenge-dates">
                <span className="date-range">
                  {formatDate(activeChallenge.startDate)} - {formatDate(activeChallenge.endDate)}
                </span>
              </div>
              <div className="challenge-categories">
                <h4>Categories:</h4>
                {activeChallenge.categories && activeChallenge.categories.length > 0 ? (
                  <ul className="category-list">
                    {activeChallenge.categories.map(category => (
                      <li key={category.categoryId} className="category-item">
                        {category.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No categories assigned to this challenge.</p>
                )}
              </div>
              <div className="challenge-actions">
                <Link to={`/weekly-challenges/${activeChallenge.challengeId}`} className="view-btn">
                  View Details
                </Link>
                <Link to={`/tierlists/new?challenge=${activeChallenge.challengeId}`} className="participate-btn">
                  Participate
                </Link>
              </div>
            </div>
          </div>
        )}
        
        <div className="past-challenges-section">
          <h2 className="section-title">Past Challenges</h2>
          {challenges.filter(c => c.status.toLowerCase() === 'completed').length === 0 ? (
            <p className="no-challenges">No past challenges found.</p>
          ) : (
            <div className="challenges-grid">
              {challenges
                .filter(c => c.status.toLowerCase() === 'completed')
                .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
                .map(challenge => (
                  <div key={challenge.challengeId} className="challenge-card">
                    <div className="challenge-header">
                      <h3 className="challenge-title">
                        Week {challenge.weekNumber}/{challenge.year}
                      </h3>
                      <span className={`challenge-status ${getChallengeStatusClass(challenge.status)}`}>
                        {challenge.status}
                      </span>
                    </div>
                    <div className="challenge-dates">
                      <span className="date-range">
                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                      </span>
                    </div>
                    <div className="challenge-categories">
                      <h4>Categories:</h4>
                      {challenge.categories && challenge.categories.length > 0 ? (
                        <ul className="category-list">
                          {challenge.categories.slice(0, 3).map(category => (
                            <li key={category.categoryId} className="category-item">
                              {category.name}
                            </li>
                          ))}
                          {challenge.categories.length > 3 && (
                            <li className="more-categories">+{challenge.categories.length - 3} more</li>
                          )}
                        </ul>
                      ) : (
                        <p>No categories assigned to this challenge.</p>
                      )}
                    </div>
                    <div className="challenge-actions">
                      <Link to={`/weekly-challenges/${challenge.challengeId}`} className="view-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        
        {isAdmin && (
          <div className="upcoming-challenges-section">
            <h2 className="section-title">Upcoming Challenges</h2>
            {challenges.filter(c => c.status.toLowerCase() === 'scheduled').length === 0 ? (
              <p className="no-challenges">No upcoming challenges scheduled.</p>
            ) : (
              <div className="challenges-grid">
                {challenges
                  .filter(c => c.status.toLowerCase() === 'scheduled')
                  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                  .map(challenge => (
                    <div key={challenge.challengeId} className="challenge-card upcoming">
                      <div className="challenge-header">
                        <h3 className="challenge-title">
                          Week {challenge.weekNumber}/{challenge.year}
                        </h3>
                        <span className={`challenge-status ${getChallengeStatusClass(challenge.status)}`}>
                          {challenge.status}
                        </span>
                      </div>
                      <div className="challenge-dates">
                        <span className="date-range">
                          {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                        </span>
                      </div>
                      <div className="challenge-categories">
                        <h4>Categories:</h4>
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
                      <div className="challenge-actions">
                        <Link to={`/weekly-challenges/${challenge.challengeId}`} className="view-btn">
                          View Details
                        </Link>
                        <Link to={`/weekly-challenges/${challenge.challengeId}/edit`} className="edit-btn">
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyChallenges; 