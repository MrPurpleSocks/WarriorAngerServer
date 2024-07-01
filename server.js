const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/anger/client' });

let clients = [];

let token = process.env.TOKEN;
let lastQueued = "";

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
    console.log("Token Set! Now using: " + token);
  } else if (headers["nexus-token"] == token) {
    if (!lastQueued) {
        lastQueued = message["nowQueuing"];
        message["disregard"] = false;
    } else if (lastQueued == message["nowQueuing"]) {
        message["disregard"] = true;
    } else {
        lastQueued = message["nowQueuing"];
        message["disregard"] = false;
    }

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    
      res.send({ status: 'Message broadcasted to all clients' });
  } else {
    console.log("Warning! Invalid token/none provided.");
    res.send({ status: 'Invalid token/none provided.' });
  }
});

server.listen(7000, () => {
    console.log('WarriorAnger Server v1.0');
    console.log('Minimum supported client version: v4.0');
    console.log('Created by MrPurpleSocks');
    console.log('');
    console.log('Server is listening on https://api.mrpurplesocks.hackclub.app/anger/nexus');
    console.log('WebSocket server is listening on wss://api.mrpurplesocks.hackclub.app/anger/client');
    console.log('Press Ctrl+C to quit.');
});
