/** Top level file for handling connections, messages, and dispatching the game FSM */

const Room = require('./room.js')
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const hostname = require("os").hostname();
let PORT = 80;
if (hostname === "mattfel-pc") {
    PORT = 5000;
}
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const helpers = require('../resources/helpers.js');
var d = new Date();

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
app.get('/resources/*.html', (req, res, next) => {
    const wildcard = req.params['0'];
	res.sendFile(path.join(__dirname, '..', 'resources/' + wildcard + '.html'));
});
app.get('/resources/*.png', (req, res, next) => {
    const wildcard = req.params['0'];
	res.sendFile(path.join(__dirname, '..', 'resources/' + wildcard + '.png'));
});
app.get('/overlaypopup.css', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'overlaypopup.css'));
});
app.get('/resources/*.mp3', (req, res, next) => {
    const wildcard = req.params['0'];
	res.sendFile(path.join(__dirname, '..', 'resources/' + wildcard + '.mp3'));
});
app.get('/resources/flags/*.png', (req, res, next) => {
    const wildcard = req.params['0'];
	res.sendFile(path.join(__dirname, '..', 'resources/flags/' + wildcard + '.png'));
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
    'S. America': new Room(CONSTANTS.SAMERICA),
    'Europe': new Room(CONSTANTS.EURO),
    'Africa': new Room(CONSTANTS.AFRICA),
    'Asia': new Room(CONSTANTS.ASIA),
    'Oceania': new Room(CONSTANTS.OCEANIA),
    'Trivia': new Room(CONSTANTS.MISC),
    'Lobby': new Room(CONSTANTS.LOBBY)
};
var playerRooms = new Map();

const ABOUT_MESSAGE = '[ <b>ABOUT</b> ] <a href="http://geoscents.net/resources/anomalies.html" target="_blank">Click here</a> for info about geopolitical anomalies and details about the game!<br>';
const PRIVACY_POLICY = '[ <b>PRIVACY POLICY</b> ] We do not use cookies to track you after you leave this page.' +
                       ' For educational purposes, we store your public IP address and your game history securely on our server. The IP addresses are replaced with country and region names, and then this data is published to <a href="https://github.com/mattfel1/geoscents_stats">https://github.com/mattfel1/geoscents_stats</a>.    This is meant to be a fun and interesting' +
                       ' dataset on how well people around the world know geography!  This data is not used for any commercial purposes.  If you would like to opt out, simply type "private" into the chat box.  If you would like to opt in, type "public" into the chat box.<br>'
const WELCOME_MESSAGE1 = '[ <b>GREETING</b> ] Welcome to Geoscents, an online multiplayer world geography game! ' +
                          'This is an attempt at recreating the similarly-named game from the mid 2000s, Geosense (geosense.net), which is no longer available. ' +
                          '<br>If you have feedback, simply shout it directly into this chat box, starting with the word "feedback".  You can also post feedback on the <a href="https://github.com/mattfel1/geoscents">geoscents github</a> as an issue if you prefer.<br>' +
                          'If you are enjoying this game, please share it with a friend!  If you really love it, consider donating at the bottom of the page to help keep the server ' +
                          'running!<br>';
const REFERENCE1 = '[ <b>REFERENCES</b> ] Terrain map rendering provided by by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.  Satellite map rendering provided by Google Tiles.  All maps generated using python cartopy 0.17.0.  '
const REFERENCE2 = 'This game uses the most populous and important cities from the database at <a href="https://simplemaps.com/data/world-cities">https://simplemaps.com/data/world-cities</a>.  '
const REFERENCE3 = 'The jingle at the start of the game was composed and recorded by Marc Ryan Feldman.<br>'

//const WELCOME_MESSAGE2 = '[ <b>UPDATE 1/6/2019</b> ] The yearly records are supposed to reset on 1/1/2020, but because of a mistake with cron, they were erroneously reset again on 1/6/2020.  Sorry!<br>'

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	socket.on('newPlayer', () => {
	  rooms[CONSTANTS.LOBBY].addPlayer(socket, {'moved': false});
      playerRooms.set(socket.id, rooms[CONSTANTS.LOBBY]);
      io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
      helpers.logHistogram(rooms);
      helpers.log("User connected    " + socket.handshake.address);
      socket.emit("update custom messages", CONSTANTS.LOBBY, REFERENCE3, 10);
      socket.emit("update custom messages", CONSTANTS.LOBBY, REFERENCE2, 10);
      socket.emit("update custom messages", CONSTANTS.LOBBY, REFERENCE1, 10);
      socket.emit("update custom messages", CONSTANTS.LOBBY, PRIVACY_POLICY, 10);
	  socket.emit("update custom messages", CONSTANTS.LOBBY, ABOUT_MESSAGE, 10);
	  // socket.emit("update messages", CONSTANTS.LOBBY, WELCOME_MESSAGE2);
	  socket.emit("update messages", CONSTANTS.LOBBY, WELCOME_MESSAGE1);
	  //socket.emit("update messages", CONSTANTS.LOBBY, WELCOME_MESSAGE2);
	});
	socket.on('disconnect', function() {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          helpers.log("User disconnected " + socket.handshake.address);
          if (room.playerChoseName(socket)) {
              var leave_msg = "[ <font color='" + room.getPlayerColor(socket) + "'><b>" + room.getPlayerRawName(socket) + "</b> has exited GeoScents!</font> ]<br>";
              io.sockets.emit("update messages", room.room, leave_msg);
          }
          room.killPlayer(socket);
      	  io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
      }
	});
	socket.on('playerJoin', (newname, newcolor, callback) => {
	    var name = '';
        if (newname !== null) name = newname;
        var color = '';
        if (newcolor !== null) color = newcolor;
        helpers.log("User " + socket.handshake.address + " named themself    " + newname);
	    if (rooms[CONSTANTS.LOBBY].hasPlayer(socket)) {
	        var badname = "";
	        CONSTANTS.PROFANITY.forEach((word) => {if (name.toUpperCase().includes(word.toUpperCase())) badname = "I used a bad word in my name :(";});
	        if (badname != "") {
                name = 'Naughty'
            }
	        rooms[CONSTANTS.LOBBY].renamePlayer(socket, name, color);
            var join_msg = "[ <font color='" + rooms[CONSTANTS.LOBBY].getPlayerColor(socket) + "'><b>" + rooms[CONSTANTS.LOBBY].getPlayerRawName(socket) + "</b> has entered the lobby!</font> ] " + badname + "<br>";
            io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg);
      	    io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
		    
            helpers.logHistogram(rooms)
	    }
        callback()
    });
	socket.on('announcement', (text) => {
        io.sockets.emit("update messages", CONSTANTS.LOBBY, text);
        io.sockets.emit("update messages", CONSTANTS.WORLD, text);
        io.sockets.emit("update messages", CONSTANTS.US, text);
        io.sockets.emit("update messages", CONSTANTS.EURO, text);
        io.sockets.emit("update messages", CONSTANTS.AFRICA, text);
        io.sockets.emit("update messages", CONSTANTS.ASIA, text);
        io.sockets.emit("update messages", CONSTANTS.OCEANIA, text);
        io.sockets.emit("update messages", CONSTANTS.SAMERICA, text);
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
       // io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
    });
    socket.on('mute', () => {
        io.sockets.emit('mute player', socket.id)
    });
    socket.on('renderMap', (style) => {
        const room = playerRooms.get(socket.id);
        helpers.log("Player " +  socket.handshake.address + " switched to map style " + style);
    
	io.sockets.emit('render map', socket.id, style, room.room);
    });
    socket.on('moveTo', (dest) => {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          const origin = room.room;
          const oldColor = rooms[origin].getPlayerColor(socket);
          const oldName = rooms[origin].getPlayerRawName(socket);
          const oldWins = rooms[origin].getPlayerWins(socket);
          const oldOptOut = rooms[origin].getPlayerOptOut(socket);
          const info = {
              'moved': true,
              'color': oldColor,
              'name': oldName,
              'wins': oldWins,
              'optOut': oldOptOut
          }
          var leave_msg = "[ <font color='" + rooms[origin].getPlayerColor(socket) + "'><b>" + rooms[origin].getPlayerRawName(socket) + "</b> has left " + origin + " and joined " + dest + "!</font> ]<br>";
          io.sockets.emit("update messages", origin, leave_msg)
          rooms[origin].killPlayer(socket);
          socket.emit('moved to', dest);
          rooms[dest].addPlayer(socket, info);
          playerRooms.set(socket.id, rooms[dest]);
          var join_msg = "[ <font color='" + rooms[dest].getPlayerColor(socket) + "'><b>" + rooms[dest].getPlayerRawName(socket) + "</b> has joined " + dest + "!</font> ]<br>";
          io.sockets.emit("update messages", dest, join_msg);
          if (dest == CONSTANTS.MISC) rooms[dest].whisperMessage(socket, "<i>Welcome to the Trivia map!  This one quizzes you on the locations of miscellaneous cultural and historical events and places.  Please suggest more items by typing a message into the chat box that starts with \"feedback\" and I may add them!  You may also complain about any of the existing items.</i><br>", function() {});
          io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
          helpers.logHistogram(rooms)
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
      const isFeedback = (msg.toLowerCase().trim().startsWith('feedback') || msg.toLowerCase().trim().startsWith('"feedback"'));
      const isOptOut = (msg.toLowerCase().trim().startsWith('private') || msg.toLowerCase().trim().startsWith('"private"'));
      const isOptIn = (msg.toLowerCase().trim().startsWith('public') || msg.toLowerCase().trim().startsWith('"public"'));
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
              helpers.log("Message passed by " +  socket.handshake.address + " " + room.getPlayerName(socket) + ": " + msg);
              room.distributeMessage(socket, new_sent_msg, cb);
              if (isFeedback) room.whisperMessage(socket, "<i>Your feedback has been noted!  Thank you for playing and commenting!</i><br>", cb);
              if (isOptOut) {
                  room.whisperMessage(socket, "<i>Your IP address has been masked.  Thank you for playing the game!</i><br>", cb);
                  room.players.get(socket.id).optOut = true;
              }
              if (isOptIn) {
                  room.whisperMessage(socket, "<i>Your IP address has been unmasked.  Thank you for playing the game and helping to build up the dataset!</i><br>", cb);
                  room.players.get(socket.id).optOut = false;
              }
          }
      });
    });
});

// Handle rooms
setInterval(() => {
    Object.values(rooms).forEach((room) => room.fsm());
}, 1000 / CONSTANTS.FPS);
// Handle reboot message
setInterval( () => {
    if (d.getHours() === 10 && d.getMinutes() > 58) {
        io.sockets.emit("update messages", CONSTANTS.LOBBY, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
        io.sockets.emit("update messages", CONSTANTS.WORLD, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
        io.sockets.emit("update messages", CONSTANTS.US, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
        io.sockets.emit("update messages", CONSTANTS.EURO, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
        io.sockets.emit("update messages", CONSTANTS.AFRICA, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
        io.sockets.emit("update messages", CONSTANTS.ASIA, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
        io.sockets.emit("update messages", CONSTANTS.OCEANIA, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
        io.sockets.emit("update messages", CONSTANTS.MISC, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
        io.sockets.emit("update messages", CONSTANTS.SAMERICA, "<font color=\"red\"><b>WARNING: Game will restart within the next minute to reset records!  Please refresh the page after it freezes!  Sorry for the inconvenience!</b></font><br>");
    }
}, 15000);

module.exports = {io};

