const WebSocket = require('ws');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (data) => {
    console.log('Received message:', data.toString());
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
