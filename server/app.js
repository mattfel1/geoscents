/** Top level file for handling connections, messages, and dispatching the game FSM */

const crypto = require('crypto'),
      fs = require("fs"),
      http = require("http"),
      https = require('https');
const hostname = require("os").hostname();
let keydir = '/root/';
if (hostname === "mattfel-pc") {
  keydir = '/home/mattfel/geoscents/'
}
var privateKey = fs.readFileSync(keydir + 'privatekey.pem').toString();
var certificate = fs.readFileSync(keydir + 'certificate.pem').toString();
var credentials = {key: privateKey, cert: certificate};

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
let PORT = 8080;
let SPORT = 8443
if (hostname === "mattfel-pc") {
    PORT = 5000;
    SPORT = 5443;
}
var httpServer = http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(PORT,SPORT) + req.url });
    console.log("http request, will go to >> ");
    console.log("https://" + req.headers['host'].replace(PORT,SPORT) + req.url );
    res.end();
  });
var httpsServer = https.createServer(credentials, app);

httpServer.listen(PORT)
httpsServer.listen(SPORT, () => {
  console.log('Magic is happening on port ' + SPORT);
});

// Game mechanics
const io = require('socket.io')(httpsServer);
const Room = require('./room.js')
const CONSTANTS = require('../resources/constants.js');
const helpers = require('../resources/helpers.js');

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
    res.setHeader('Access-Control-Allow-Origin', '*');
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
app.get('/plots/*', (req, res, next) => {
    const wildcard = req.params['0'];
	res.sendFile(path.join(__dirname, '..', 'plots/' + wildcard));
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

// Game state info
var rooms = {
    'World': new Room(CONSTANTS.WORLD, 'World'),
    'N. America': new Room(CONSTANTS.US, 'N. America'),
    'S. America': new Room(CONSTANTS.SAMERICA, 'S. America'),
    'Europe': new Room(CONSTANTS.EURO, 'Europe'),
    'Africa': new Room(CONSTANTS.AFRICA, 'Africa'),
    'Asia': new Room(CONSTANTS.ASIA, 'Asia'),
    'Oceania': new Room(CONSTANTS.OCEANIA, 'Oceania'),
    'Trivia': new Room(CONSTANTS.MISC, 'Trivia'),
    'Lobby': new Room(CONSTANTS.LOBBY, 'Lobby'),
};
var playerRooms = new Map();

const WELCOME_MESSAGE1 = '[ <b>GREETING</b> ] Welcome to Geoscents, an online multiplayer world geography game! ' +
                          'This is an attempt at recreating the similarly-named game from the mid 2000s, Geosense (geosense.net), which is no longer available. ' +
                          '<br>If you have feedback, simply shout it directly into this chat box, starting with the /feedback.' +
                          'If you are enjoying this game, please share it with a friend!  If you really love it, consider donating at the bottom of the page to help keep the server ' +
                          'running! <br>';
const PRIVATE_MESSAGE = '<i>Welcome to a private room!  You can whisper your secret code to a friend by typing the command /whisper "username" in the chat box. ' +
                        'You can use the command /hidden to see if your friend is hiding in another private game.</i><br>';

//const WELCOME_MESSAGE2 = '[ <b>UPDATE 1/6/2019</b> ] The yearly records are supposed to reset on 1/1/2020, but because of a mistake with cron, they were erroneously reset again on 1/6/2020.  Sorry!<br>'

const announce = (text) => {
  Object.values(rooms).forEach(function(room) {
      io.sockets.emit("update messages", room.roomName, text);
  });
}

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	socket.on('newPlayer', () => {
	  rooms[CONSTANTS.LOBBY].addPlayer(socket, {'moved': false});
      playerRooms.set(socket.id, rooms[CONSTANTS.LOBBY]);
      io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
      helpers.logHistogram(rooms);
      helpers.log("User connected    " + socket.handshake.address);
	  socket.emit("update messages", CONSTANTS.LOBBY, WELCOME_MESSAGE1);
	});
  socket.on('view viz', function() {
    let name = "";
    if (rooms[CONSTANTS.LOBBY].hasPlayer(socket)) {
      name = rooms[CONSTANTS.LOBBY].getPlayerName(socket);
    }
    helpers.log('User clicked viz ' + socket.handshake.address + " (" + name + ")");
  });
  socket.on('view about', function() {
    let name = "";
    if (rooms[CONSTANTS.LOBBY].hasPlayer(socket)) {
      name = rooms[CONSTANTS.LOBBY].getPlayerName(socket);
    }
    helpers.log('User clicked about ' + socket.handshake.address + " (" + name + ")");
  });
  socket.on('disconnect', function() {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          const name = room.getPlayerName(socket);
          helpers.log("User disconnected " + socket.handshake.address + ": " + name);
          if (room.playerChoseName(socket)) {
              var leave_msg = "[ <font color='" + room.getPlayerColor(socket) + "'><b>" + room.getPlayerRawName(socket) + "</b> has exited GeoScents!</font> ]<br>";
              io.sockets.emit("update messages", room.roomName, leave_msg);
          }
          room.killPlayer(socket);
      	  io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
      }
      Object.values(rooms).forEach(function(room) {
        if (room.isPrivate && room.playerCount() == 0) {
          delete rooms[room.roomName];
        }
      });
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
            // Send whispers to specific players
            const specificGreeting = (socket, name, target, msg) => {
                if (name == target && !fs.existsSync('/tmp/' + target)) {
                    helpers.logFeedback("Sent whisper to " + target + ": " + msg + '. touch /tmp/' + target + ' to suppress this message');
                    rooms[CONSTANTS.LOBBY].whisperMessage(socket, msg, () => {});
                }
            };
            specificGreeting(socket, name, "Doz", "<i>Thanks so much for the donation, Doz!</i><br>");
            specificGreeting(socket, name, "ninjer tootle", "<i>U a bitch</i><br>");
      	    io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
		    
            helpers.logHistogram(rooms)
	    }
        callback()
    });
  	socket.on('announcement', (text) => {
      announce(text);
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
        Object.values(rooms).forEach(function(room) {
          if (room.isPrivate && room.playerCount() == 0) {
              delete rooms[room.roomName];
          }
        });

        io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
    });
    socket.on('mute', () => {
        io.sockets.emit('mute player', socket.id)
    });
    socket.on('jitter', () => {
        io.sockets.emit('jitter', socket.id)
    });
    socket.on('toggle joe', () => {
        if (playerRooms.has(socket.id)) {
           const room = playerRooms.get(socket.id);
           if (room.roomName == CONSTANTS.LOBBY) {
              socket.emit('update messages', room.roomName, "<i>Cannot create bot in Lobby!</i><br>");
              return;
           }
           if (room.hasJoe) {
               const bot_msg = "[ " + CONSTANTS.KILL_MSGS[Math.floor(Math.random() * CONSTANTS.KILL_MSGS.length)]
                   .replace('PLAYER', "<font color='" + room.getPlayerColor(socket) + "'><b>" + room.getPlayerRawName(socket) + "</b></font>")
                   .replace('BOT', "<b>" + room.joe.name + "</b>") + "]<br>";
               io.sockets.emit("update messages", room.roomName, bot_msg);
               helpers.log("Player " +  socket.handshake.address + " " + room.getPlayerName(socket) + " has killed joe in " + room.roomName);
               room.killJoe()
           }
           else {
               helpers.log("Player " +  socket.handshake.address + " " + room.getPlayerName(socket) + " has birthed joe in " + room.roomName);
               room.createJoe();
               const bot_msg = "[ " + CONSTANTS.BIRTH_MSGS[Math.floor(Math.random() * CONSTANTS.BIRTH_MSGS.length)]
                   .replace('PLAYER', "<font color='" + room.getPlayerColor(socket) + "'><b>" + room.getPlayerRawName(socket) + "</b></font>")
                   .replace('BOT', "<b>" + room.joe.name + "</b>") + "]<br>";
               io.sockets.emit("update messages", room.roomName, bot_msg);
           }
        }
    });
    socket.on('renderMap', (style) => {
        if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          helpers.log("Player " +  socket.handshake.address + " switched to map style " + style);
          io.sockets.emit('render map', socket.id, style, room.roomName);
          room.redrawMap(socket);
        } else {
          helpers.log("Player " + socket.handshake.address + " tried to switch maps without being in a room!")
        }
    });
    socket.on('moveTo', (dest) => {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          const origin = room.roomName;
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
          socket.emit('moved to', dest, dest, rooms[dest].state);
          rooms[dest].addPlayer(socket, info);
          playerRooms.set(socket.id, rooms[dest]);
          var join_msg = "[ <font color='" + rooms[dest].getPlayerColor(socket) + "'><b>" + rooms[dest].getPlayerRawName(socket) + "</b> has joined " + dest + "!</font> ]<br>";
          io.sockets.emit("update messages", dest, join_msg);
          // if (dest == CONSTANTS.MISC) rooms[dest].whisperMessage(socket, "<i>Welcome to the Trivia map!  This one quizzes you on the locations of miscellaneous cultural and historical events and places.  Please suggest more items by typing a message into the chat box that starts with \"feedback\" and I may add them!  You may also complain about any of the existing items.</i><br>", function() {});
          io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
          rooms[dest].joeMessage();
          helpers.logHistogram(rooms)
      }
      Object.values(rooms).forEach(function(room) {
        if (room.isPrivate && room.playerCount() == 0 && rooms.hasOwnProperty(room.roomName)) {
          delete rooms[room.roomName];
        }
      });
    });
    socket.on('requestPrivatePopup', () => {
      socket.emit('request private popup');
    });
    socket.on('moveToPrivate', (askmap, code) => {
      if (playerRooms.has(socket.id)) {
          let dest = "private_" + code;
          const room = playerRooms.get(socket.id);
          const origin = room.roomName;
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
          if (origin == dest) {
              var leave_msg = "[ <font color='" + rooms[origin].getPlayerColor(socket) + "'><b>" + rooms[origin].getPlayerRawName(socket) + "</b> has changed the map to " + askmap + "!</font> ]<br>";
              io.sockets.emit("update messages", origin, leave_msg);
              let map = askmap;
              rooms[dest].map = map;
              rooms[dest].reset();
              socket.emit('moved to', map, dest, rooms[dest].state);
              helpers.log("Player " +  socket.handshake.address + " " + rooms[dest].getPlayerName(socket) + " changed map in " + dest);
              helpers.logHistogram(rooms)
          } else {
              var leave_msg = "[ <font color='" + rooms[origin].getPlayerColor(socket) + "'><b>" + rooms[origin].getPlayerRawName(socket) + "</b> has left " + origin + " and joined a private room!</font> ]<br>";
              io.sockets.emit("update messages", origin, leave_msg)
              rooms[origin].killPlayer(socket);
              Object.values(rooms).forEach(function(room) {
                if (room.isPrivate && room.playerCount() == 0 && rooms.hasOwnProperty(room.roomName)) {
                  delete rooms[room.roomName];
                }
              });
              let map = askmap;
              if (!(dest in rooms)) {
                rooms[dest] = new Room(map, dest);
              } else {
                map = rooms[dest].map
              }
              socket.emit('moved to', map, dest, rooms[dest].state);
              socket.emit('update messages', dest, PRIVATE_MESSAGE);
              rooms[dest].addPlayer(socket, info);
              playerRooms.set(socket.id, rooms[dest]);
              var join_msg = "[ <font color='" + rooms[dest].getPlayerColor(socket) + "'><b>" + rooms[dest].getPlayerRawName(socket) + "</b> has joined " + dest + "!</font> ]<br>";
              io.sockets.emit("update messages", dest, join_msg);
              // if (dest == CONSTANTS.MISC) rooms[dest].whisperMessage(socket, "<i>Welcome to the Trivia map!  This one quizzes you on the locations of miscellaneous cultural and historical events and places.  Please suggest more items by typing a message into the chat box that starts with \"feedback\" and I may add them!  You may also complain about any of the existing items.</i><br>", function() {});
              io.sockets.emit('update counts', rooms[CONSTANTS.LOBBY].playerCount(),rooms[CONSTANTS.WORLD].playerCount(),rooms[CONSTANTS.US].playerCount(),rooms[CONSTANTS.EURO].playerCount(),rooms[CONSTANTS.AFRICA].playerCount(),rooms[CONSTANTS.SAMERICA].playerCount(),rooms[CONSTANTS.ASIA].playerCount(),rooms[CONSTANTS.OCEANIA].playerCount(),rooms[CONSTANTS.MISC].playerCount());
              helpers.log("Player " +  socket.handshake.address + " " + rooms[dest].getPlayerName(socket) + " moved to room " + dest);
              rooms[dest].joeMessage();
              helpers.logHistogram(rooms)
          }
      }
    });
    socket.on('playerClick', (playerClick) => {
      if (playerRooms.has(socket.id)) {
          const room = playerRooms.get(socket.id);
          room.playerClicked(socket, playerClick)
      }
	});
    socket.on("send message", function(sent_msg, callback) {
      if (sent_msg == "") {callback(); return;}
      const msg = sent_msg;
      const isFeedback = (msg.toLowerCase().trim().startsWith('/feedback'));
      const isOptOut = (msg.toLowerCase().trim().startsWith('/private'));
      const isOptIn = (msg.toLowerCase().trim().startsWith('/public'));
      const isAnnounce = (msg.toLowerCase().trim().startsWith('/announce'));
      const isWhisper = (msg.toLowerCase().trim().startsWith('/whisper'));
      const isHidden = (msg.toLowerCase().trim().startsWith('/hidden'));
      const isUnknownCmd = (msg.toLowerCase().trim().startsWith('/'));
      const cb = () => {callback()};
      Object.values(rooms).forEach(function(room) {
          if (room.hasPlayer(socket)) {
              var new_sent_msg = msg;
              replaceAll = function(original, strReplace, strWith) {
                // See http://stackoverflow.com/a/3561711/556609
                var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var reg = new RegExp(esc, 'ig');
                return original.replace(reg, strWith);
              };
              CONSTANTS.PROFANITY.forEach((word) => {new_sent_msg = replaceAll(new_sent_msg, word, "****")});
              helpers.log("Message passed by " +  socket.handshake.address + " " + room.getPlayerName(socket) + " " + room.getActiveEntry() + " : " + msg);
              if (room.hasJoe && new_sent_msg.toLowerCase().trim().includes("good bot")) {
                room.distributeMessage(socket, new_sent_msg, cb);
                room.joeGood(socket);
                cb();
                return;
              }
              if (room.hasJoe && new_sent_msg.toLowerCase().trim().includes("bad bot")) {
                room.distributeMessage(socket, new_sent_msg, cb);
                room.joeBad(socket);
                cb();
                return;
              }
              if (room.hasJoe && new_sent_msg.toLowerCase().trim().startsWith("gg")) {
                room.distributeMessage(socket, new_sent_msg, cb);
                room.joeGG(socket);
                cb();
                return;
              }
              if (isFeedback) {
                room.distributeMessage(socket, new_sent_msg, cb);
		        room.whisperMessage(socket, "<i>Your feedback has been noted!  Thank you for playing and commenting!</i><br>", cb);
                helpers.logFeedback("Message passed by " +  socket.handshake.address + " " + room.getPlayerName(socket) + ": " + msg);
	            }
              else if (isOptOut) {
                  room.whisperMessage(socket, "<i>Your IP address has been masked.  Thank you for playing the game!  Type /public if you want to opt-in!</i><br>", cb);
                  room.players.get(socket.id).optOut = true;
              }
              else if (isOptIn) {
                  room.whisperMessage(socket, "<i>Your IP address has been unmasked.  Thank you for playing the game and helping to build up the dataset!</i><br>", cb);
                  room.players.get(socket.id).optOut = false;
              }
              else if (isAnnounce) {
                const playerName = room.getPlayerName(socket);
                const playerColor = room.getPlayerColor(socket);
                const playerRoom = room.roomName;
                announce("[ " + playerRoom + " <b><font color='" + playerColor + "'>" + playerName + "</font></b> Announces ]: " + replaceAll(new_sent_msg, "/announce", "") + "<br>")
                cb();
              }
              else if (isHidden) {
                let numHidden = 0;
                room.distributeMessage(socket, new_sent_msg, cb)
                Object.values(rooms).forEach(function(r) {
                    if (r.isPrivate) {
                      Array.from(r.players.values()).forEach(function(player) {
                          room.distributeMessage(socket, "  - <font color='" + player.color + "'><b>" + player.name + "</b></font>", cb)
                          numHidden = numHidden + 1;
                      })
                    }
                })
                if (numHidden > 0) room.distributeMessage(socket, "The following players are in private games: ", cb);
                else room.distributeMessage(socket, "No players are currently in private games", cb);
              }
              else if (isWhisper) {
                const playerName = room.getPlayerName(socket);
                const playerColor = room.getPlayerColor(socket);
                const playerRoom = room.roomName;
                let dst = msg.match(/"(.*?)"/g);
                if (dst == null || dst.length != 1) {
                  room.whisperMessage(socket, "<i>Please specify one player to whisper to, using quotes (\"\")</i><br>",() => {});
                } else {
                  let foundPlayer = false;
                  let dstPlayer = dst[0].replace(/"/g,"");
                  let dstSocket = null;
                  Object.values(rooms).forEach(function(dstroom) {
                    if (!foundPlayer) {
                      dstSocket = dstroom.getPlayerByName(dstPlayer);
                      if (dstSocket != null) {
                        room.whisperMessage(socket, "<i>[ You whisper to " + dstPlayer + " ]: " + replaceAll(replaceAll(new_sent_msg, "/whisper", ""), "\"" + dstPlayer + "\"","") + "</i><br>", cb);
                        dstroom.whisperMessage(dstSocket, "<i>[ " + playerRoom + " <b><font color='" + playerColor + "'>" + playerName + "</font></b> Whispers ]: " + replaceAll(replaceAll(new_sent_msg, "/whisper", ""), "\"" + dstPlayer + "\"","") + "</i><br>", () => {});
                        foundPlayer = true;
                      }  
                    }
                  });
                  if (!foundPlayer) {
                    room.whisperMessage(socket, "<i>Player " + dstPlayer + " not found in any room.</i><br>",() => {});
                  }
                }
              }
              else if (isUnknownCmd) {
                room.whisperMessage(socket, "<i>Your command was not recognized!  Please check your spelling.  All valid commands can be found at <a href=\"http://geoscents.net/resources/about.html\" target=\"_blank\">http://geoscents.net/resources/about.html</a></i><br>", () => {});
              }
              else {
                room.distributeMessage(socket, new_sent_msg, cb);
              }
          }
      });
    });
});

// Handle rooms
setInterval(() => {
    Object.values(rooms).forEach((room) => room.fsm());
}, 1000 / CONSTANTS.FPS);
// Handle record sync
setInterval(() => {
    Object.values(rooms).forEach((room1) => {
        if (room1.serviceRecord == true) {
            Object.values(rooms).forEach((room2) => {
                if (room1.map == room2.map && room1.roomName != room2.roomName && room1.lastRecordUpdate > room2.lastRecordUpdate) {
                    room2.syncRecords(room1.lastRecordUpdate, room1.dayRecord, room1.weekRecord, room1.monthRecord, room1.allRecord);
                }
            });
            room1.serviceRecord = false;
        }
    });
}, 1000);
// Handle reboot message
setInterval( () => {
    var d = new Date();
    if (d.getHours() === 23 && d.getMinutes() > 57) {
        announce("<font size=20 color=\"red\"><b>WARNING: Game will go down for a few minutes to refresh records at 00:00 GMT (current time " + d.getHours() + ":" + d.getMinutes() + ")!  Sorry for the inconvenience!</b></font><br>")
    }
}, 20000);


module.exports = {io};

