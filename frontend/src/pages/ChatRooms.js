import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatService from '../services/chatService';
import UserService from '../services/userService';

const ChatRooms = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        
        // Get chat rooms for user
        const chatRoomsResponse = await ChatService.getChatRoomsByUserId(userResponse.data.userId);
        setChatRooms(chatRoomsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError('Failed to load chat rooms. Please try again later.');
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

  const getRemainingTime = (expiresAt) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration - now;
    
    if (diffTime <= 0) {
      return 'Expired';
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    }
  };

  if (loading) {
    return (
      <div className="chat-rooms-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading chat rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-rooms-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">Chat Rooms</h1>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div className="chat-rooms-info">
          <p>
            Chat rooms are created automatically when you participate in weekly challenges.
            You'll be matched with users who have similar tier list rankings.
            Chat rooms expire after one week, so make the most of your time to discuss!
          </p>
        </div>
        
        {chatRooms.length === 0 ? (
          <div className="no-chat-rooms">
            <h2>No Chat Rooms Available</h2>
            <p>
              You haven't been matched with any users yet. Participate in weekly challenges
              to get matched with users who have similar tastes!
            </p>
            <Link to="/weekly-challenges" className="challenge-btn">
              View Weekly Challenges
            </Link>
          </div>
        ) : (
          <div className="chat-rooms-grid">
            {chatRooms.map(room => {
              const isExpired = new Date(room.expiresAt) <= new Date();
              return (
                <div key={room.roomId} className={`chat-room-card ${isExpired ? 'expired' : ''}`}>
                  <div className="chat-room-header">
                    <h3 className="chat-room-title">
                      {room.result.challenge ? (
                        <>Week {room.result.challenge.weekNumber}/{room.result.challenge.year} Group</>
                      ) : (
                        <>Chat Room #{room.roomId}</>
                      )}
                    </h3>
                    <span className={`expiration-badge ${isExpired ? 'expired' : ''}`}>
                      {isExpired ? 'Expired' : getRemainingTime(room.expiresAt)}
                    </span>
                  </div>
                  
                  <div className="chat-room-info">
                    <div className="info-item">
                      <span className="info-label">Created:</span>
                      <span className="info-value">{formatDate(room.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Expires:</span>
                      <span className="info-value">{formatDate(room.expiresAt)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Members:</span>
                      <span className="info-value">
                        {room.result.groupMembers ? room.result.groupMembers.length : 0} users
                      </span>
                    </div>
                    {room.result.similarityScore && (
                      <div className="info-item">
                        <span className="info-label">Similarity:</span>
                        <span className="info-value">
                          {Math.round(room.result.similarityScore * 100)}% match
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {room.result.challenge && (
                    <div className="challenge-info">
                      <h4>Challenge Categories:</h4>
                      <div className="categories-list">
                        {room.result.challenge.categories && room.result.challenge.categories.map(category => (
                          <span key={category.categoryId} className="category-tag">
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="chat-room-actions">
                    {!isExpired ? (
                      <Link to={`/chat-rooms/${room.roomId}`} className="enter-btn">
                        Enter Chat Room
                      </Link>
                    ) : (
                      <span className="expired-message">This chat room has expired</span>
                    )}
                    
                    {room.result.challenge && (
                      <Link 
                        to={`/weekly-challenges/${room.result.challenge.challengeId}`} 
                        className="view-challenge-btn"
                      >
                        View Challenge
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRooms; 