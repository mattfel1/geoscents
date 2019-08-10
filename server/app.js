/** Top level file for handling connections, messages, and dispatching the game FSM */

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
const fs = require('fs');

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
//  1) Delete all "capitals" that were not primary
//  2) Sort by capital first, population second
//  3) Take top 1000 cities
//  4) xlsx -> csv (https://www.zamzar.com/convert/xlsx-to-csv/)
//  5) csv -> json (https://csvjson.com/csv2json)
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
const WELCOME_MESSAGE1 = "Welcome to GeoScents, an unabashed attempt at recreating the geosense.net game from the mid 2000s. " +
	"Try to click the locations of the given city as quickly and accurately as possible!  If you are enjoying " +
	"this game, consider donating to keep the server running!  Feel free to play with the code on github and make pull requests or post issues.";

function log(payload) {
    const currentdate = new Date();
    const timestamp = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":";
    fs.appendFile('connections.log', "[" + timestamp + "] " + payload + "\n", function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	socket.on('newPlayer', () => {
	  room.addPlayer(socket)
      log("User connected    " + socket.handshake.address + ", " + socket.id)
	  socket.emit("update messages", WELCOME_MESSAGE1);
      var join_msg = "[ <font color='" + room.getPlayerColor(socket.handshake.address) + "'>Player " + room.getPlayerName(socket.handshake.address) + " has joined!</font> ]";
      io.sockets.emit("update messages", join_msg)
	});
	socket.on('disconnect', function() {
	  room.killPlayer(socket)
      log("User disconnected " + socket.handshake.address + ", " + socket.id)
	});
    socket.on('playerReady', () => {
	  room.playerReady(socket);
    })
	socket.on('playerClick', (playerClick) => {
	  room.playerClicked(socket, playerClick)
	})
    socket.on("send message", function(sent_msg, callback) {
    	//TODO: Why is this socket.id different from the socket.id used to create player?  Will just use ip address for now...
        sent_msg = "[ <font color='" + room.getPlayerColor(socket.handshake.address) + "'>Player " + room.getPlayerName(socket.handshake.address) + "</font> ]: " + sent_msg;
        console.log(sent_msg)
        // if (sent_msg.length > CONSTANTS.MAX_MSG) {
        // 	sent_msg = sent_msg.substring(0, CONSTANTS.MAX_MSG)
		// }
        log("Message passed: " + sent_msg)
        io.sockets.emit("update messages", sent_msg);
        callback();
    });
});

// Handle rooms
setInterval(() => {
    room.fsm();
}, 1000 / CONSTANTS.FPS);

module.exports = io;

