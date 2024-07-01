// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/anger/client' });

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

app.use(bodyParser.json());

app.post('/anger/nexus', (req, res) => {
  const message = req.body;
  if (!message) {
    return res.status(400).send({ error: 'No JSON payload provided' });
  }

  console.log(req.headers)
  console.log(req.ip)

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  res.send({ status: 'Message broadcasted to all clients' });
});

server.listen(7000, () => {
  console.log('Server is listening on https://api.mrpurplesocks.hackclub.app/anger/nexus');
  console.log('WebSocket server is listening on wss://api.mrpurplesocks.hackclub.app/anger/client');
  console.log('Press Ctrl+C to quit.');
});
