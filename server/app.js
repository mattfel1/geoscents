/** Top level file for handling connections, messages, and dispatching the game FSM */

const Room = require('./room.js')
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const PORT = 80;
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const helpers = require('../resources/helpers.js')

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
app.get('/resources/world.png', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'resources/world.png'));
});
app.get('/resources/us.png', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'resources/us.png'));
});
app.get('/resources/euro.png', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'resources/euro.png'));
});
app.get('/resources/spritesheet.png', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'resources/spritesheet.png'));
});
app.get('/resources/favicon.png', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'resources/favicon.png'));
});
app.get('/overlaypopup.css', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'overlaypopup.css'));
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
const rooms = {
    'World': new Room(CONSTANTS.WORLD),
    'N. America': new Room(CONSTANTS.US),
    'Eurasia': new Room(CONSTANTS.EURO),
    'Lobby': new Room(CONSTANTS.LOBBY)
};
var playerRooms = new Map();

const WELCOME_MESSAGE1 = 'Welcome to Geoscents, an online multiplayer world geography game! ' +
                          'This is an attempt at recreating the similarly-named game from the mid 2000s, Geosense (geosense.net), which is no longer available. ' +
                          'If you are enjoying this game, consider donating at the bottom of the page to help keep the server ' +
                          'running!  Feel free to make pull requests or leave feedback on github.' +
                          ' If this text is double-spaced or things don\'t look right, try refreshing the page!';


io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	socket.on('newPlayer', () => {
	  rooms[CONSTANTS.LOBBY].addPlayer(socket, {'moved': false});
      playerRooms.set(socket.id, rooms[CONSTANTS.LOBBY]);
      io.sockets.emit('update counts', rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount());
      helpers.log("User connected    " + socket.handshake.address);
	  socket.emit("update messages", CONSTANTS.LOBBY, WELCOME_MESSAGE1);
	});
	socket.on('disconnect', function() {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          helpers.log("User disconnected " + socket.handshake.address);
          if (room.playerChoseName(socket)) {
              var leave_msg = "[ <font color='" + room.getPlayerColor(socket) + "'>" + room.getPlayerName(socket) + " has exited GeoScents!</font> ]<br>";
              io.sockets.emit("update messages", room.room, leave_msg);
          }
          room.killPlayer(socket);
          io.sockets.emit('update counts', rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount());
      }
	});
	socket.on('playerJoin', (newname, callback) => {
	    var name = newname;
        helpers.log("User " + socket.handshake.address + " named themself    " + newname);
	    if (rooms[CONSTANTS.LOBBY].hasPlayer(socket)) {
	        var badname = "";
	        CONSTANTS.PROFANITY.forEach((word) => {if (newname.toUpperCase().includes(word.toUpperCase())) badname = "I used a bad word in my name :(";});
	        if (badname != "") {
                name = 'Naughty'
            }
	        rooms[CONSTANTS.LOBBY].renamePlayer(socket, name);
            var join_msg = "[ <font color='" + rooms[CONSTANTS.LOBBY].getPlayerColor(socket) + "'>" + rooms[CONSTANTS.LOBBY].getPlayerName(socket) + " has entered the lobby!</font> ] " + badname + "<br>";
            io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg);
            io.sockets.emit('update counts', rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount());
	    }
        callback()
    });
    socket.on('playerReady', () => {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          room.playerReady(socket);
      }
    });
    socket.on('bootPlayer', (socketid) => {
       if (playerRooms.has(socketid)) {
           playerRooms.delete(socketid);
       }
       io.sockets.emit('update counts', rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount());
    });
    socket.on('moveTo', (dest) => {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          const origin = room.room;
          const oldColor = rooms[origin].getPlayerColor(socket);
          const oldName = rooms[origin].getPlayerName(socket);
          const oldWins = rooms[origin].getPlayerWins(socket);
          const info = {
              'moved': true,
              'color': oldColor,
              'name': oldName,
              'wins': oldWins
          }
          var leave_msg = "[ <font color='" + rooms[origin].getPlayerColor(socket) + "'>" + rooms[origin].getPlayerName(socket) + " has left " + origin + " and joined " + dest + "!</font> ]<br>";
          io.sockets.emit("update messages", origin, leave_msg)
          rooms[origin].killPlayer(socket);
          socket.emit('moved to', dest);
          rooms[dest].addPlayer(socket, info);
          playerRooms.set(socket.id, rooms[dest]);
          var join_msg = "[ <font color='" + rooms[dest].getPlayerColor(socket) + "'>" + rooms[dest].getPlayerName(socket) + " has joined " + dest + "!</font> ]<br>";
          io.sockets.emit("update messages", dest, join_msg)
          io.sockets.emit('update counts', rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount());
      }
    });
	socket.on('playerClick', (playerClick) => {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          room.playerClicked(socket, playerClick)
      }
	});
    socket.on("send message", function(sent_msg, callback) {
      const msg = sent_msg;
      const cb = () => {callback()};
      Object.values(rooms).forEach(function(room) {
          if (room.hasPlayer(socket)) {
              replaceAll = function(original, strReplace, strWith) {
                // See http://stackoverflow.com/a/3561711/556609
                var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var reg = new RegExp(esc, 'ig');
                return original.replace(reg, strWith);
              };
              var new_sent_msg = msg;
              CONSTANTS.PROFANITY.forEach((word) => {new_sent_msg = replaceAll(new_sent_msg, word, "****")});
              helpers.log("Message passed by " + socket.handshake.address + " " + socket.id + ": " + new_sent_msg);
              room.distributeMessage(socket, new_sent_msg, cb);
          }
      });
    });
});

// Handle rooms
setInterval(() => {
    Object.values(rooms).forEach((room) => room.fsm());
}, 1000 / CONSTANTS.FPS);

module.exports = {io};

