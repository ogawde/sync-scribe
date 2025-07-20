const WebSocket = require('ws');
const RoomManager = require('./room-manager');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });
const roomManager = new RoomManager();

const userRoomMap = new Map(); 

console.log(`WebSocket server running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('New client connected');
  let currentUserId = null;
  let currentRoomId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message.type);

      switch (message.type) {
        case 'create-room': {
          const roomId = roomManager.createRoom();
          ws.send(JSON.stringify({
            type: 'room-created',
            payload: { roomId },
          }));
          break;
        }

        case 'join': {
          const { roomId, username } = message.payload;
          const result = roomManager.joinRoom(roomId, username, ws);

          if (result.error) {
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: result.error },
            }));
          } else {
            currentUserId = result.user.id;
            currentRoomId = roomId;
            userRoomMap.set(currentUserId, { roomId, userId: currentUserId });

            ws.send(JSON.stringify({
              type: 'room-joined',
              payload: {
                user: {
                  id: result.user.id,
                  username: result.user.username,
                  color: result.user.color,
                },
                roomId,
                document: result.room.document,
              },
            }));

            const users = roomManager.getUsersInRoom(roomId);
            roomManager.broadcastToRoom(roomId, {
              type: 'user-presence',
              payload: { users },
            });
          }
          break;
        }

        case 'document-update': {
          if (!currentRoomId) return;
          
          const { document } = message.payload;
          roomManager.updateDocument(currentRoomId, document);

          roomManager.broadcastToRoom(currentRoomId, {
            type: 'document-update',
            payload: { document },
            userId: currentUserId,
          }, currentUserId);
          break;
        }

        case 'cursor-move': {
          if (!currentRoomId) return;

          const { cursorPosition } = message.payload;
          
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'cursor-move',
            payload: { 
              userId: currentUserId,
              cursorPosition,
            },
          }, currentUserId);
          break;
        }

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid message format' },
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    
    if (currentUserId && currentRoomId) {
      roomManager.leaveRoom(currentRoomId, currentUserId);
      userRoomMap.delete(currentUserId);

      const users = roomManager.getUsersInRoom(currentRoomId);
      roomManager.broadcastToRoom(currentRoomId, {
        type: 'user-presence',
        payload: { users },
      });
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

