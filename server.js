// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/client' });

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

app.use(bodyParser.json());

app.post('/nexus', (req, res) => {
  const message = req.body;
  if (!message) {
    return res.status(400).send({ error: 'No JSON payload provided' });
  }

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  res.send({ status: 'Message broadcasted to all clients' });
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
