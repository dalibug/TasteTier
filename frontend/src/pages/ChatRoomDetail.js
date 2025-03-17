import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import ChatService from '../services/chatService';
import UserService from '../services/userService';

const ChatRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isExpired, setIsExpired] = useState(false);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await UserService.getCurrentUser();
        setUser(userResponse.data);
        
        // Get chat room details
        const chatRoomResponse = await ChatService.getChatRoomById(id);
        setChatRoom(chatRoomResponse.data);
        
        // Check if room is expired
        const expirationDate = new Date(chatRoomResponse.data.expiresAt);
        setIsExpired(expirationDate <= new Date());
        
        // Get group members
        if (chatRoomResponse.data.result && chatRoomResponse.data.result.groupMembers) {
          setGroupMembers(chatRoomResponse.data.result.groupMembers);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching chat room:', err);
        setError('Failed to load chat room. Please try again later.');
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

  const handleExtendRoom = async () => {
    try {
      await ChatService.extendChatRoomExpiration(id, 7); // Extend by 7 days
      
      // Update local state
      const updatedRoom = { ...chatRoom };
      const currentExpiration = new Date(chatRoom.expiresAt);
      currentExpiration.setDate(currentExpiration.getDate() + 7);
      updatedRoom.expiresAt = currentExpiration.toISOString();
      
      setChatRoom(updatedRoom);
      setIsExpired(false);
    } catch (err) {
      console.error('Error extending chat room:', err);
      setError('Failed to extend chat room. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="chat-room-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="loading">Loading chat room...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-room-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="error">{error}</div>
          <Link to="/chat-rooms" className="back-btn">
            Back to Chat Rooms
          </Link>
        </div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="chat-room-detail-page" >
        <Navbar />
        <div className="content-wrapper">
          <div className="not-found">Chat room not found.</div>
          <Link to="/chat-rooms" className="back-btn">
            Back to Chat Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room-detail-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <Link to="/chat-rooms" className="back-btn">
            &larr; Back to Chat Rooms
          </Link>
          <h1 className="page-title">
            {chatRoom.result && chatRoom.result.challenge ? (
              <>Week {chatRoom.result.challenge.weekNumber}/{chatRoom.result.challenge.year} Group</>
            ) : (
              <>Chat Room #{chatRoom.roomId}</>
            )}
          </h1>
        </div>
        
        <div className="chat-room-container">
          <div className="chat-room-sidebar">
            <div className="room-info">
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">{formatDate(chatRoom.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Expires:</span>
                <span className="info-value">{formatDate(chatRoom.expiresAt)}</span>
              </div>
              {isExpired && (
                <div className="expired-notice">
                  <p>This chat room has expired.</p>
                  <button onClick={handleExtendRoom} className="extend-btn">
                    Extend for 7 Days
                  </button>
                </div>
              )}
              
              {chatRoom.result && chatRoom.result.similarityScore && (
                <div className="info-item">
                  <span className="info-label">Similarity:</span>
                  <span className="info-value">
                    {Math.round(chatRoom.result.similarityScore * 100)}% match
                  </span>
                </div>
              )}
              
              {chatRoom.result && chatRoom.result.challenge && (
                <div className="challenge-info">
                  <h3>Challenge:</h3>
                  <Link 
                    to={`/weekly-challenges/${chatRoom.result.challenge.challengeId}`}
                    className="challenge-link"
                  >
                    Week {chatRoom.result.challenge.weekNumber}/{chatRoom.result.challenge.year}
                  </Link>
                  
                  {chatRoom.result.challenge.categories && (
                    <div className="categories">
                      <h4>Categories:</h4>
                      <div className="categories-list">
                        {chatRoom.result.challenge.categories.map(category => (
                          <span key={category.categoryId} className="category-tag">
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="members-list">
              <h3>Members ({groupMembers.length})</h3>
              {groupMembers.length === 0 ? (
                <p className="no-members">No members found.</p>
              ) : (
                <ul className="members">
                  {groupMembers.map(member => (
                    <li key={member.user.userId} className="member">
                      <div className="member-avatar">
                        {member.user.pictureUrl ? (
                          <img src={member.user.pictureUrl} alt={member.user.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {member.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="member-info">
                        <span className="member-name">{member.user.username}</span>
                        {member.tierList && (
                          <Link 
                            to={`/tierlists/${member.tierList.tierListId}`}
                            className="view-tierlist-link"
                          >
                            View Tier List
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="chat-container">
            {isExpired ? (
              <div className="expired-chat">
                <p>This chat room has expired. You can extend it to continue the conversation.</p>
                <button onClick={handleExtendRoom} className="extend-btn">
                  Extend for 7 Days
                </button>
              </div>
            ) : (
              <ChatBox roomId={chatRoom.roomId} currentUser={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomDetail; 