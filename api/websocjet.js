// /api/websocket.js
const WebSocket = require('ws');

let wss;

const initWebSocket = (req, res) => {
    if (!wss) {
        const server = require('http').createServer();
        wss = new WebSocket.Server({ server });

        wss.on('connection', (ws) => {
            console.log('Client connected');

            ws.on('message', (message) => {
                try {
                    const payload = JSON.parse(message);
                    handlePayload(ws, payload);

                    // Broadcast to all clients
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(payload));
                        }
                    });
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });

        server.listen(0, () => {
            console.log(`WebSocket server is listening`);
        });
    }

    res.status(200).send('WebSocket server is running');
};

function handlePayload(ws, payload) {
    console.log('Received WebSocket payload:', payload);
}

module.exports = initWebSocket;