import express from 'express';
import { createServer } from 'node:http';
const app = express();
const server = createServer(app);

import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'socket.io';
const io = new Server(server);

const port = process.env.PORT || 3000;

const secret = process.env.TOKEN;

app.use(express.json());
app.use('/', express.static('public'));

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
});

// Logging all requests
app.use((req, _res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

// Authentication
app.use((req, res, next) => {
    if (req.method === 'POST' && secret && req.body.token !== secret) {
        console.log("Token does not match secret!")
        console.log(`token: ${req.body.token}, secret: ${secret}`);
        return res.sendStatus(304);
    }

    if (req.body?.token)
        delete req.body.token;

    next();
});

// Sensor API endpoint
app.post('/api/sensor', (req, res) => {
    console.log(JSON.stringify(req.body, null, 4));

    io.emit("sensor", req.body);

    res.sendStatus(200);
});

server.listen(port, () => {
    if (!secret) {
        console.log("Warning: no secret token, will accept all post requests!");
        console.log("Add TOKEN= to the .env file to set secret token");
    }
    console.log(`Server listening on port ${port}`);
    console.log(`visit http://localhost:${port}`);
});

