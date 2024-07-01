// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/anger/client' });

let clients = [];

let token = "";

wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

app.use(bodyParser.json());

app.post('/anger/nexus', (req, res) => {
  const message = req.body;
  const headers = req.headers;
  if (!message) {
    return res.status(400).send({ error: 'No JSON payload provided' });
  }

  if (message["token"]) {
    token = message["token"];
    res.send({ status: 'Token Set' });
  } else if (headers["nexus-token"] == token) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    
      res.send({ status: 'Message broadcasted to all clients' });
  } else {
    console.log("Invalid token/none provided.");
  }
  res.send({ status: 'Invalid token/none provided.' });
});

server.listen(7000, () => {
  console.log('Server is listening on https://api.mrpurplesocks.hackclub.app/anger/nexus');
  console.log('WebSocket server is listening on wss://api.mrpurplesocks.hackclub.app/anger/client');
  console.log('Press Ctrl+C to quit.');
});
