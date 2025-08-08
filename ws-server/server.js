const WebSocket = require('ws');
const RoomManager = require('./room-manager');

const PORT = process.env.PORT || 8080;
const MAX_CONNECTIONS_PER_IP = parseInt(process.env.MAX_CONNECTIONS_PER_IP || '20', 10);
const MAX_TOTAL_CONNECTIONS = parseInt(process.env.MAX_TOTAL_CONNECTIONS || '200', 10);
const MAX_MESSAGE_BYTES = parseInt(process.env.MAX_MESSAGE_BYTES || '65536', 10);
const IDLE_TIMEOUT_MS = parseInt(process.env.IDLE_TIMEOUT_MS || '900000', 10);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean) : [];

const wss = new WebSocket.Server({ port: PORT });
const roomManager = new RoomManager();

const userRoomMap = new Map(); 
const ipConnectionCounts = new Map();

console.log(`WebSocket server running on port ${PORT}`);

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.length && (!origin || !ALLOWED_ORIGINS.includes(origin))) {
    ws.close(1008, 'Invalid origin');
    return;
  }

  if (wss.clients.size > MAX_TOTAL_CONNECTIONS) {
    ws.close(1013, 'Server overloaded');
    return;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (typeof forwardedFor === 'string' && forwardedFor.split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';

  const currentCount = ipConnectionCounts.get(ip) || 0;
  if (currentCount >= MAX_CONNECTIONS_PER_IP) {
    ws.close(1008, 'Too many connections from this IP');
    return;
  }

  ipConnectionCounts.set(ip, currentCount + 1);

  let idleTimer = setTimeout(() => {
    ws.close(1000, 'Idle timeout');
  }, IDLE_TIMEOUT_MS);

  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      ws.close(1000, 'Idle timeout');
    }, IDLE_TIMEOUT_MS);
  };

  console.log('New client connected');
  let currentUserId = null;
  let currentRoomId = null;

  ws.on('message', (data) => {
    if (Buffer.byteLength(data) > MAX_MESSAGE_BYTES) {
      ws.close(1009, 'Message too large');
      return;
    }

    resetIdleTimer();

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
    clearTimeout(idleTimer);

    const count = ipConnectionCounts.get(ip) || 0;
    if (count <= 1) {
      ipConnectionCounts.delete(ip);
    } else {
      ipConnectionCounts.set(ip, count - 1);
    }

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

