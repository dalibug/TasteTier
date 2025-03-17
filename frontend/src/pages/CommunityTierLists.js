import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TierListCard from '../components/TierListCard';
import TierListService from '../services/tierListService';
import WeeklyChallengeService from '../services/weeklyChallengeService';
import UserService from '../services/userService';

const CommunityTierLists = () => {
  const [communityTierLists, setCommunityTierLists] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, challenge, custom
  const [selectedChallenge, setSelectedChallenge] = useState('');
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        
        // Get public tier lists
        const tierListsResponse = await TierListService.getPublicTierLists();
        setCommunityTierLists(tierListsResponse.data);
        
        // Get challenges for filtering
        const challengesResponse = await WeeklyChallengeService.getAllWeeklyChallenges();
        setChallenges(challengesResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching community tier lists:', err);
        setError('Failed to load community tier lists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedChallenge('');
  };

  const handleChallengeChange = (e) => {
    setSelectedChallenge(e.target.value);
    if (e.target.value !== '') {
      setFilter('challenge');
    }
  };

  const getFilteredTierLists = () => {
    let filtered = [...communityTierLists];
    
    // Filter by type (challenge or custom)
    if (filter === 'challenge') {
      filtered = filtered.filter(tierList => tierList.challenge !== null);
      
      // Further filter by specific challenge if selected
      if (selectedChallenge !== '') {
        filtered = filtered.filter(
          tierList => tierList.challenge && tierList.challenge.challengeId.toString() === selectedChallenge
        );
      }
    } else if (filter === 'custom') {
      filtered = filtered.filter(tierList => tierList.challenge === null);
    }
    
    return filtered;
  };

  const filteredTierLists = getFilteredTierLists();

  if (loading) {
    return (
      <div className="community-tier-lists-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading community tier lists...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-tier-lists-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">Community Tier Lists</h1>
          <Link to="/tierlists" className="back-btn">
            My Tier Lists
          </Link>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div className="filter-section">
          <div className="filter-controls">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'challenge' ? 'active' : ''}`}
              onClick={() => handleFilterChange('challenge')}
            >
              Challenge
            </button>
            <button 
              className={`filter-btn ${filter === 'custom' ? 'active' : ''}`}
              onClick={() => handleFilterChange('custom')}
            >
              Custom
            </button>
          </div>
          
          {filter === 'challenge' && (
            <div className="challenge-filter">
              <select
                value={selectedChallenge}
                onChange={handleChallengeChange}
                className="challenge-select"
              >
                <option value="">All Challenges</option>
                {challenges
                  .sort((a, b) => {
                    // Sort by year (descending) and then by week number (descending)
                    if (a.year !== b.year) return b.year - a.year;
                    return b.weekNumber - a.weekNumber;
                  })
                  .map(challenge => (
                    <option key={challenge.challengeId} value={challenge.challengeId}>
                      Week {challenge.weekNumber}/{challenge.year} - {challenge.categories.map(c => c.name).join(', ')}
                    </option>
                  ))
                }
              </select>
            </div>
          )}
        </div>
        
        {filteredTierLists.length === 0 ? (
          <div className="no-tier-lists">
            <p>No tier lists found with the current filters.</p>
            <button 
              onClick={() => {
                setFilter('all');
                setSelectedChallenge('');
              }}
              className="reset-filters-btn"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="tier-lists-grid">
            {filteredTierLists.map(tierList => (
              <TierListCard 
                key={tierList.tierListId} 
                tierList={tierList} 
                showUser={true}
              />
            ))}
          </div>
        )}
        
        <div className="create-cta">
          <h2>Want to share your own tier list?</h2>
          <p>Create a tier list and make it public to share with the community.</p>
          <Link to="/tierlists/new" className="create-btn">
            Create Your Own Tier List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityTierLists; 