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
const fs = require('fs');

// Game mechanics
const CONSTANTS = require('../resources/constants.js');


function log(payload) {
    const currentdate = new Date();
    const timestamp = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":";
    fs.appendFile('/root/connections.log', "[" + timestamp + "] " + payload + "\n", function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

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
                          'This is an unabashed attempt at recreating the similarly-named game, Geosense (geosense.net), from the mid 2000s. ' +
                          'If you are enjoying this game, consider donating at the bottom of the page to help keep the server ' +
                          'running!  Feel free to play with the code on github and make pull requests if you want.' +
                          ' If this text is double-spaced or things don\'t look right, try refreshing the page!';


function warnDuplicateIp(ip) {
    Object.values(rooms).forEach((room) => {
        const matches = room.getPlayerByIp(ip)['numMatch'];
        if (matches > 0 && room.room != CONSTANTS.LOBBY) { // Conflict between lobby and other room
            io.sockets.emit('update messages', room.room, "A player has joined the lobby who shares an IP address with a player in this room. Chats from these players may be buggy, but their gameplay should work fine.<br>");
            io.sockets.emit('update messages', CONSTANTS.LOBBY, "A player in the " + room.room + " game shares an IP address with a player who just joined.  Chats from these players may be buggy, but their gameplay should work fine.<br>");
        }
        else if (matches > 1 && room.room == CONSTANTS.LOBBY) { // Conflict in lobby
            io.sockets.emit('update messages', CONSTANTS.LOBBY, "A player in the lobby shares an IP address with a player who just joined.  Chats from these players may be buggy, but their gameplay should work fine.<br>");
        }
    })

}

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	socket.on('newPlayer', () => {
	  rooms[CONSTANTS.LOBBY].addPlayer(socket, {'moved': false});
      playerRooms.set(socket.id, rooms[CONSTANTS.LOBBY]);
      log("User connected    " + socket.handshake.address + ", " + socket.id);
	  socket.emit("update messages", CONSTANTS.LOBBY, WELCOME_MESSAGE1);
      var join_msg = "[ <font color='" + rooms[CONSTANTS.LOBBY].getPlayerColor(socket) + "'>Player " + rooms[CONSTANTS.LOBBY].getPlayerName(socket) + " has entered the lobby!</font> ]<br>";
      io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg)
      io.sockets.emit('update counts', rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount());
      warnDuplicateIp(socket.handshake.address);
	});
	socket.on('disconnect', function() {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          log("User disconnected " + socket.handshake.address + ", " + socket.id)
          var leave_msg = "[ <font color='" + room.getPlayerColor(socket) + "'>Player " + room.getPlayerName(socket) + " has left " + room.room + "!</font> ]<br>";
          io.sockets.emit("update messages", room.room, leave_msg);
          room.killPlayer(socket)
          io.sockets.emit('update counts', rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount());
      }
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
          var leave_msg = "[ <font color='" + rooms[origin].getPlayerColor(socket) + "'>Player " + rooms[origin].getPlayerName(socket) + " has left " + origin + " and joined " + dest + "!</font> ]<br>";
          io.sockets.emit("update messages", origin, leave_msg)
          rooms[origin].killPlayer(socket);
          rooms[dest].addPlayer(socket, info);
          playerRooms.set(socket.id, rooms[dest]);
          socket.emit('moved to', dest);
          var join_msg = "[ <font color='" + rooms[dest].getPlayerColor(socket) + "'>Player " + rooms[dest].getPlayerName(socket) + " has joined " + dest + "!</font> ]<br>";
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
          if (room.getPlayerByIp(socket.handshake.address)['numMatch'] > 0) {
              //TODO: Why is this socket.id different from the socket.id used to create player?  Will just use ip address for now...

              replaceAll = function(original, strReplace, strWith) {
                // See http://stackoverflow.com/a/3561711/556609
                var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var reg = new RegExp(esc, 'ig');
                return original.replace(reg, strWith);
              };
              var new_sent_msg = msg;
              CONSTANTS.PROFANITY.forEach((word) => {new_sent_msg = replaceAll(new_sent_msg, word, "****")});
              const sent_msg = "[ " + room.room + " <font color='" + room.getPlayerColor(socket) + "'>Player " + room.getPlayerName(socket) + "</font> ]: " + new_sent_msg + "<br>";
              // if (msg.length > CONSTANTS.MAX_MSG) {
              // 	msg = msg.substring(0, CONSTANTS.MAX_MSG)
              // }
              log("Message passed by " + socket.handshake.address + " " + socket.id + ": " + sent_msg)
              io.sockets.emit("update messages", room.room, sent_msg);
              cb();
          }
      });
    });
});

// Handle rooms
setInterval(() => {
    Object.values(rooms).forEach((room) => room.fsm());
}, 1000 / CONSTANTS.FPS);

module.exports = io;

