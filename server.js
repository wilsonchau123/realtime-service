const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json()); // Middleware to parse JSON bodies

// WebSocket connection
// WebSocket connection
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const payload = JSON.parse(message);
            handlePayload(ws, payload);

            // Send the original payload to all connected clients
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
// HTTP endpoint for triggering payments
app.post('/trigger-payment', (req, res) => {
    console.log('Received POST request:', req.body);
    const payload = req.body;

    if (!payload || payload.type !== 'trigger_payment') {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    // Send response back via WebSocket to all connected clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const response = {
                client_id: payload.client_id,
                event_type: 'payment_result',
                event_data: {
                    success: true,
                    message: 'Payment triggered successfully',
                    pay_method: payload.pay_method,
                },
            };
            client.send(JSON.stringify(response));
        }
    });

    res.status(200).json({ message: 'Payment triggered successfully' });
});

// Handle WebSocket payloads
function handlePayload(ws, payload) {
    console.log('Received WebSocket payload:', payload);
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});