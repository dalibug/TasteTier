import React, { useState, useEffect, useRef } from 'react';
import ChatService from '../services/chatService';

const ChatBox = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch messages on component mount and when roomId changes
  useEffect(() => {
    if (!roomId) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await ChatService.getChatMessagesByRoomId(roomId);
        setMessages(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Set up polling for new messages
    const intervalId = setInterval(fetchMessages, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [roomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !roomId || !currentUser) return;
    
    try {
      const messageData = {
        room: { roomId },
        user: { userId: currentUser.userId },
        message: newMessage.trim(),
        sentAt: new Date().toISOString()
      };
      
      await ChatService.createChatMessage(messageData);
      
      // Optimistically add message to UI
      setMessages([
        ...messages,
        {
          ...messageData,
          messageId: `temp-${Date.now()}`, // Temporary ID until refresh
          user: currentUser // Use full user object for display
        }
      ]);
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && messages.length === 0) {
    return <div className="chat-loading">Loading messages...</div>;
  }

  return (
    <div className="chat-box">
      {error && <div className="chat-error">{error}</div>}
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.messageId} 
              className={`chat-message ${msg.user.userId === currentUser.userId ? 'own-message' : ''}`}
            >
              <div className="message-header">
                <img 
                  src={msg.user.pictureUrl || 'https://via.placeholder.com/30'} 
                  alt={msg.user.username} 
                  className="user-avatar"
                />
                <span className="username">{msg.user.username}</span>
                <span className="timestamp">{formatTime(msg.sentAt)}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox; 