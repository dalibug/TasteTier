import api from './api';

const ChatService = {
  // Get all chat rooms
  getAllChatRooms: () => {
    return api.get('/chatrooms');
  },

  // Get chat room by ID
  getChatRoomById: (roomId) => {
    return api.get(`/chatrooms/${roomId}`);
  },

  // Get chat rooms by user ID
  getChatRoomsByUserId: (userId) => {
    return api.get(`/chatrooms/user/${userId}`);
  },

  // Get chat rooms by challenge ID
  getChatRoomsByChallengeId: (challengeId) => {
    return api.get(`/chatrooms/challenge/${challengeId}`);
  },

  // Get messages in a chat room
  getChatMessages: (roomId) => {
    return api.get(`/chatrooms/${roomId}/messages`);
  },

  // Send a message to a chat room
  sendMessage: (roomId, messageData) => {
    return api.post(`/chatrooms/${roomId}/messages`, messageData);
  },

  // Create a new chat room
  createChatRoom: (chatRoomData) => {
    return api.post('/chatrooms', chatRoomData);
  },

  // Update a chat room
  updateChatRoom: (roomId, chatRoomData) => {
    return api.put(`/chatrooms/${roomId}`, chatRoomData);
  },

  // Delete a chat room
  deleteChatRoom: (roomId) => {
    return api.delete(`/chatrooms/${roomId}`);
  },

  // Get chat room members
  getChatRoomMembers: (roomId) => {
    return api.get(`/chatrooms/${roomId}/members`);
  },

  // Add a member to a chat room
  addChatRoomMember: (roomId, userId) => {
    return api.post(`/chatrooms/${roomId}/members`, { userId });
  },

  // Remove a member from a chat room
  removeChatRoomMember: (roomId, userId) => {
    return api.delete(`/chatrooms/${roomId}/members/${userId}`);
  },

  // Extend chat room expiration
  extendChatRoomExpiration: (roomId, days) => {
    return api.put(`/chatrooms/${roomId}/extend`, { days });
  },

  // Get chat room by challenge result ID
  getChatRoomByResultId: (resultId) => {
    return api.get(`/api/chat-rooms/result/${resultId}`);
  },

  // Get chat rooms by week number and year
  getChatRoomsByWeekAndYear: (weekNumber, year) => {
    return api.get(`/api/chat-rooms/week/${weekNumber}/year/${year}`);
  },

  // Get expired chat rooms
  getExpiredChatRooms: () => {
    return api.get('/api/chat-rooms/expired');
  },

  // Get all chat messages
  getAllChatMessages: () => {
    return api.get('/api/chat-messages');
  },

  // Get chat message by ID
  getChatMessageById: (id) => {
    return api.get(`/api/chat-messages/${id}`);
  },

  // Get chat messages by room ID
  getChatMessagesByRoomId: (roomId) => {
    return api.get(`/api/chat-messages/room/${roomId}`);
  },

  // Get chat messages by user ID
  getChatMessagesByUserId: (userId) => {
    return api.get(`/api/chat-messages/user/${userId}`);
  },

  // Create a new chat message
  createChatMessage: (chatMessage) => {
    return api.post('/api/chat-messages', chatMessage);
  },

  // Update a chat message
  updateChatMessage: (id, chatMessage) => {
    return api.put(`/api/chat-messages/${id}`, chatMessage);
  },

  // Delete a chat message
  deleteChatMessage: (id) => {
    return api.delete(`/api/chat-messages/${id}`);
  },

  // Delete all messages in a room
  deleteAllMessagesInRoom: (roomId) => {
    return api.delete(`/api/chat-messages/room/${roomId}`);
  }
};

export default ChatService; 