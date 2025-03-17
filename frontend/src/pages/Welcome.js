import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserService from '../services/userService';
import WeeklyChallengeService from '../services/weeklyChallengeService';
import TierListService from '../services/tierListService';
import Logo from '../components/Logo';
import '../App.css';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [featuredTierLists, setFeaturedTierLists] = useState([]);
  const authCheckAttempted = useRef(false);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in, but only once and only if not recently logged out
        if (!authCheckAttempted.current) {
          authCheckAttempted.current = true;
          
          // Check if we just logged out
          const justLoggedOut = sessionStorage.getItem('justLoggedOut') === 'true';
          
          if (!justLoggedOut) {
            try {
              const isAuthenticated = await UserService.isAuthenticated();
              if (isAuthenticated) {
                const userResponse = await UserService.getCurrentUser();
                setUser(userResponse.data);
              }
            } catch (err) {
              // User not logged in, continue with public data
              console.log('User not logged in');
            }
          } else {
            // Clear the logout flag after using it
            sessionStorage.removeItem('justLoggedOut');
          }
        }
        
        // Get active challenge
        try {
          const challengesResponse = await WeeklyChallengeService.getActiveWeeklyChallenges();
          if (challengesResponse.data && challengesResponse.data.length > 0) {
            setActiveChallenge(challengesResponse.data[0]);
          }
        } catch (err) {
          console.error('Error fetching active challenge:', err);
        }
        
        // Get featured tier lists
        try {
          const tierListsResponse = await TierListService.getPublicTierLists();
          // Get up to 3 recent public tier lists
          const featured = tierListsResponse.data
            .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
            .slice(0, 3);
          setFeaturedTierLists(featured);
        } catch (err) {
          console.error('Error fetching featured tier lists:', err);
        }
      } catch (err) {
        console.error('Error in welcome page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/tierlists');
    } else {
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="welcome-page" >
      <div className="welcome-content">
        <header className="welcome-header">
          <div className="logo-container">
            <Logo size={60} />
            <h1 className="app-name">TasteTier</h1>
          </div>
          <div className="auth-buttons">
            {user ? (
              <div className="user-welcome">
                <span className="welcome-message">Welcome, {user.username}!</span>
                <Link to="/tierlists" className="dashboard-btn">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="login-btn">
                  Log In
                </Link>
                <Link to="/signup" className="signup-btn">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </header>
        
        <main className="welcome-main">
          <section className="hero-section">
            <div className="hero-content">
              <h2 className="hero-title">Create, Share, and Discover Food Tier Lists</h2>
              <p className="hero-description">
                Rank your favorite foods, participate in weekly challenges, and see how your tastes compare with others.
              </p>
              <button onClick={handleGetStarted} className="get-started-btn">
                {user ? 'Create a Tier List' : 'Get Started'}
              </button>
            </div>
          </section>
          
          {activeChallenge && (
            <section className="active-challenge-section">
              <h2 className="section-title">Current Challenge</h2>
              <div className="challenge-card">
                <div className="challenge-header">
                  <h3 className="challenge-title">
                    Week {activeChallenge.weekNumber}/{activeChallenge.year} Challenge
                  </h3>
                  <span className="challenge-dates">
                    {formatDate(activeChallenge.startDate)} - {formatDate(activeChallenge.endDate)}
                  </span>
                </div>
                <div className="challenge-categories">
                  {activeChallenge.categories && activeChallenge.categories.length > 0 && (
                    <div className="categories-list">
                      {activeChallenge.categories.map(category => (
                        <span key={category.categoryId} className="category-tag">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="challenge-cta">
                  {user ? (
                    <Link to={`/tierlists/new?challenge=${activeChallenge.challengeId}`} className="participate-btn">
                      Participate Now
                    </Link>
                  ) : (
                    <Link to="/login" className="login-to-participate-btn">
                      Log In to Participate
                    </Link>
                  )}
                  <Link to={`/weekly-challenges/${activeChallenge.challengeId}`} className="view-details-btn">
                    View Details
                  </Link>
                </div>
              </div>
            </section>
          )}
          
          {featuredTierLists.length > 0 && (
            <section className="featured-tierlists-section">
              <h2 className="section-title">Featured Tier Lists</h2>
              <div className="featured-tierlists">
                {featuredTierLists.map(tierList => (
                  <div key={tierList.tierListId} className="featured-tierlist-card">
                    <h3 className="tierlist-title">{tierList.title}</h3>
                    <div className="tierlist-meta">
                      <span className="tierlist-creator">by {tierList.user.username}</span>
                      <span className="tierlist-date">{formatDate(tierList.lastModified)}</span>
                    </div>
                    {tierList.challenge && (
                      <div className="tierlist-challenge">
                        <span className="challenge-badge">Challenge</span>
                        <span className="challenge-name">
                          Week {tierList.challenge.weekNumber}/{tierList.challenge.year}
                        </span>
                      </div>
                    )}
                    <Link to={`/tierlists/${tierList.tierListId}`} className="view-tierlist-btn">
                      View Tier List
                    </Link>
                  </div>
                ))}
              </div>
              <div className="view-more-container">
                <Link to="/community-tierlists" className="view-more-btn">
                  View More Tier Lists
                </Link>
              </div>
            </section>
          )}
          
          <section className="features-section">
            <h2 className="section-title">Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3 className="feature-title">Weekly Challenges</h3>
                <p className="feature-description">
                  Participate in themed weekly challenges and compare your rankings with others.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3 className="feature-title">Custom Tier Lists</h3>
                <p className="feature-description">
                  Create your own custom tier lists with any food items you want.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3 className="feature-title">Community</h3>
                <p className="feature-description">
                  Share your tier lists with the community and discover others' rankings.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3 className="feature-title">Discussions</h3>
                <p className="feature-description">
                  Join chat rooms to discuss food preferences and tier list rankings.
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="welcome-footer">
          <div className="footer-content">
            <p className="copyright">© 2023 TasteTier. All rights reserved.</p>
            <div className="footer-links">
              <button className="footer-link">About</button>
              <button className="footer-link">Privacy Policy</button>
              <button className="footer-link">Terms of Service</button>
              <button className="footer-link">Contact</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Welcome; 