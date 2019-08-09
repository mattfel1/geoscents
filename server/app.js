
const Player = require('./player.js')
const Geography = require('./geography.js')
const Room = require('./room.js')
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

// Game mechanics
const CONSTANTS = require('../resources/constants.js');

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});
// Cities from https://simplemaps.com/data/world-cities
app.get('/resources/map.png', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'resources/map.png'));
});

app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.send(err.message || 'Internal server error');
});

server.listen(PORT, () => {
	console.log('Server is live on PORT:', PORT);
});

// Game state info
const room = new Room(4, 0);

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	socket.on('newPlayer', () => {
	  room.addPlayer(socket)
	});
	socket.on('disconnect', function() {
	  room.killPlayer(socket)
	});
    socket.on('playerReady', () => {
	  room.playerReady(socket);
    })
	socket.on('playerClick', (playerClick) => {
	  room.playerClicked(socket, playerClick)
	})
});

// Handle rooms
setInterval(() => {
    room.fsm();
}, 1000 / CONSTANTS.FPS);

module.exports = io;

