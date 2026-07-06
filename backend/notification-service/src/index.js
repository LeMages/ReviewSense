const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const { handleConnection } = require('./ws');
const notifyRouter = require('./routes/notify');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(notifyRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
handleConnection(wss);

server.listen(PORT, () => {
  console.log(`notification-service listening on port ${PORT}`);
});
