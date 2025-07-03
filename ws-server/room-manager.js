class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createRoom() {
    const roomId = this.generateRoomCode();
    this.rooms.set(roomId, {
      id: roomId,
      users: [],
    });
    return roomId;
  }
}

module.exports = RoomManager;
