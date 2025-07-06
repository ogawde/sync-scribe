const { v4: uuidv4 } = require('uuid');

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.userColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createRoom() {
    const roomId = this.generateRoomCode();
    this.rooms.set(roomId, {
      id: roomId,
      users: [],
      document: { type: 'doc', content: [{ type: 'paragraph' }] },
      maxUsers: 4,
    });
    return roomId;
  }

  joinRoom(roomId, username, ws) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { error: 'Room not found' };
    }

    if (room.users.length >= room.maxUsers) {
      return { error: 'Room is full' };
    }

    if (room.users.some(user => user.username === username)) {
      return { error: 'Username already taken in this room' };
    }

    const userId = uuidv4();
    const color = this.userColors[room.users.length % this.userColors.length];
    
    const user = {
      id: userId,
      username,
      color,
      ws,
    };

    room.users.push(user);
    return { user, room };
  }

  leaveRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const userIndex = room.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      room.users.splice(userIndex, 1);
    }

    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }

    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  updateDocument(roomId, document) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.document = document;
    }
  }

  broadcastToRoom(roomId, message, excludeUserId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.users.forEach(user => {
      if (user.id !== excludeUserId && user.ws.readyState === 1) { // 1 = OPEN
        user.ws.send(JSON.stringify(message));
      }
    });
  }

  getUsersInRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.users.map(user => ({
      id: user.id,
      username: user.username,
      color: user.color,
    }));
  }
}

module.exports = RoomManager;

