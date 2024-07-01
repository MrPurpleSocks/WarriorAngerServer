// good luck to anyone that tries to understand this code
// i don't even understand it myself
// i just copied it from the internet and changed some stuff
// i coded this at 3am and i don't even know what i'm doing
// i dont use node.js
// i dont know javascript
// i dont know express
// i dont know websockets
// i dont know anything
// i just want to go to sleep
// i'm sorry
// i'm so sorry

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/anger/client' });

let clients = [];

let token = "";
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
    } else if (lastQueued == message["nowQueuing"]) {
        console.log("Already queued, duplicate request, disregarding.");
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
    console.log("Invalid token/none provided.");
    res.send({ status: 'Invalid token/none provided.' });
  }
});

server.listen(7000, () => {
  console.log('Server is listening on https://api.mrpurplesocks.hackclub.app/anger/nexus');
  console.log('WebSocket server is listening on wss://api.mrpurplesocks.hackclub.app/anger/client');
  console.log('Press Ctrl+C to quit.');
});
