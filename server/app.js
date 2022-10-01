/** Top level file for handling connections, messages, and dispatching the game FSM */

const Geography = require('./geography.js');
const crypto = require('crypto'),
    fs = require("fs"),
    http = require("http");
const https = require('https');
const hostname = require("os").hostname();
let keydir = '/root/';
if (hostname === "mattfel-pc") {
    keydir = '/home/mattfel/geoscents/'
}

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
let PORT = 80;
let SPORT = 443;
let httpServer;
let httpsServer;
let io;
let useHttp = false;

if (hostname === "matt-machwx9") {
    PORT = 5000;
    SPORT = 5443;
    useHttp = true; // I forgot how to get https working locally after reformatting computer with local hacks... 
    if (useHttp) {
        httpsServer = https.createServer(function(req, res) {
            res.writeHead(301, {
                "Location": "http://" + req.headers['host'].replace(SPORT, PORT) + req.url
            });
            // console.log("http request detected, sending to >> https://" + req.headers['host'].replace(PORT,SPORT) + req.url);
            res.end();
        });
        httpsServer.listen(SPORT);
        httpServer = http.createServer(app);
        httpServer.listen(PORT, () => {
            console.log('Magic is happening on port ' + PORT);
        })
        io = require('socket.io')(httpServer);
    } else {
        var privateKey = fs.readFileSync('/home/mattfel/geoscents/key.pem').toString();
        var certificate = fs.readFileSync('/home/mattfel/geoscents/cert.pem').toString();
        var credentials = {
            key: privateKey,
            cert: certificate
        };
        httpServer = http.createServer(function(req, res) {
            res.writeHead(301, {
                "Location": "https://" + req.headers['host'].replace(PORT, SPORT) + req.url
            });
            // console.log("http request detected, sending to >> https://" + req.headers['host'].replace(PORT,SPORT) + req.url);
            res.end();
        });
        httpServer.listen(PORT);
        httpsServer = https.createServer(credentials, app);
        httpsServer.listen(SPORT, () => {
            console.log('Magic is happening on port ' + SPORT);
        });
        io = require('socket.io')(httpsServer);
    }
} else {
    if (useHttp) {
        httpsServer = https.createServer(function(req, res) {
            res.writeHead(301, {
                "Location": "http://" + req.headers['host'].replace(SPORT, PORT) + req.url
            });
            console.log("http request detected from " + req.connection.remoteAddress + ", sending to >> https://" + req.headers['host'].replace(PORT, SPORT) + req.url);
            res.end();
        });
        httpsServer.listen(SPORT);
        httpServer = http.createServer(app);
        httpServer.listen(PORT, () => {
            console.log('Magic is happening on port ' + PORT);
        })
        io = require('socket.io')(httpServer);
    } else {
        // var privateKey = fs.readFileSync('/root/privatekey.pem').toString();
        // var certificate = fs.readFileSync('/root/geoscents_net.crt').toString();
        var privateKey = fs.readFileSync('/home/mattfel/certs/geoscents_net.pem').toString();
        var certificate = fs.readFileSync('/home/mattfel/certs/geoscents_net.crt').toString();
        var credentials = {
            key: privateKey,
            cert: certificate
        };
        httpServer = http.createServer(function(req, res) {
            try {
                res.writeHead(301, {
                    "Location": "https://" + req.headers['host'].replace(PORT, SPORT) + req.url
                });
                console.log("http request detected from " + req.connection.remoteAddress + ", sending to >> https://" + req.headers['host'].replace(PORT, SPORT) + req.url);
                res.end();
            } catch (err) {
                console.log("failed to redirect " + req + ": " + err.message)
            }
        });
        httpServer.listen(PORT);
        httpsServer = https.createServer(credentials, app);
        httpsServer.listen(SPORT, () => {
            console.log('Magic is happening on port ' + SPORT);
        });
        io = require('socket.io')(httpsServer);
    }
}



// Game mechanics
// const io = require('socket.io')(httpsServer);
const Room = require('./room.js')
const CONSTANTS = require('../resources/constants.js');
const helpers = require('../resources/helpers.js');

helpers.logFeedback("Geoscents rebooted!");

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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
app.get('/resources/images/*.png', (req, res, next) => {
    const wildcard = req.params['0'];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, '..', 'resources/images/' + wildcard + '.png'));
});
app.get('/resources/maps/*.png', (req, res, next) => {
    const wildcard = req.params['0'];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, '..', 'resources/maps/' + wildcard + '.png'));
});
app.get('/resources/images/*.svg', (req, res, next) => {
    const wildcard = req.params['0'];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, '..', 'resources/images/' + wildcard + '.svg'));
});
app.get('/.well-known/pki-validation/*', (req, res, next) => {
    const wildcard = req.params['0'];
    res.sendFile(path.join(__dirname, '..', '.well-known/pki-validation/' + wildcard));
});
app.get('/design.css', (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'design.css'));
});
app.get('/resources/audio/*.mp3', (req, res, next) => {
    const wildcard = req.params['0'];
    res.sendFile(path.join(__dirname, '..', 'resources/audio/' + wildcard + '.mp3'));
});
app.get('/resources/flags/*.png', (req, res, next) => {
    const wildcard = req.params['0'];
    res.sendFile(path.join(__dirname, '..', 'resources/flags/' + wildcard + '.png'));
});
app.get('/resources/histories/*', (req, res, next) => {
    const wildcard = req.params['0'];
    res.sendFile(path.join(__dirname, '..', 'resources/histories/' + wildcard));
});
app.get('/resources/famers/*', (req, res, next) => {
    const wildcard = req.params['0'];
    res.sendFile(path.join(__dirname, '..', 'resources/famers/' + wildcard));
});
app.get('/plots/*', (req, res, next) => {
    const wildcard = req.params['0'];
    res.sendFile(path.join(__dirname, '..', 'plots/' + wildcard));
});
app.get('/ads.txt', (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'ads.txt'));
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

// Load hall of fame stuff
var famers = helpers.loadHallOfFame();

const coprime = (num1, num2) => {
    const smaller = num1 > num2 ? num1 : num2;
    for (let ind = 2; ind < smaller; ind++) {
        const condition1 = num1 % ind === 0;
        const condition2 = num2 % ind === 0;
        if (condition1 && condition2) {
            return false;
        };
    };
    return true;
};

const calculate_special = () => {
    // Get days since jan 1
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay) + 2;

    // We want day % num_specials to be our new special_idx, but this is not stable when num_specials grows.
    // To be more stable, we upcast num_specials to the nearest multiple of 20 and mod by that.  Then mod by num_specials.
    let num_specials = Object.keys(CONSTANTS.SPECIALS).length;
    let upcast_num_specials = (Math.round(num_specials / 20) + 1) * 20
    let raw_idx = (day % upcast_num_specials) % num_specials;

    // "Randomize" the special country so you can't easily tell the order by looking at constants.js.
    // Find a multiplier, mult, that is coprime with num_specials, and recalculate special idx by multiplying
    // with this value and re-modding with num_specials.
    // Basically, since the lcm of two coprime numbers, A and B, is A*B, that means you can use A to re-index
    // values from 0 to B. For example, B = 10, A = 3, integers 0, 1, 2, ..., 9 would become 0, 3, 6, ..., 7.
    // Choose mult as the first coprime number above currenty "epoch."  Epoch = raw_idx / upcast_num_specials.
    let epoch = Math.floor(day / upcast_num_specials) % num_specials;
    let mult = 1;
    for (let i = epoch; i < num_specials; i++) {
        if (i != 0 && coprime(i, num_specials)) {
            mult = i;
            break;
        }
    }
    // Plus 6 to match country the day this was implemented
    let idx = (6 + mult * raw_idx) % num_specials;

    return idx;
}

let special_idx = calculate_special();
let special = Object.keys(CONSTANTS.SPECIALS)[special_idx];

// Game state info
// map, roomName, citysrc
var rooms = {
    'World': new Room(CONSTANTS.WORLD, CONSTANTS.WORLD, CONSTANTS.WORLD),
    'World Capitals': new Room(CONSTANTS.WORLD, CONSTANTS.WORLD_CAPITALS, CONSTANTS.WORLD_CAPITALS),
    'N. America': new Room(CONSTANTS.NAMERICA, CONSTANTS.NAMERICA, CONSTANTS.NAMERICA),
    'S. America': new Room(CONSTANTS.SAMERICA, CONSTANTS.SAMERICA, CONSTANTS.SAMERICA),
    'Europe': new Room(CONSTANTS.EUROPE, CONSTANTS.EUROPE, CONSTANTS.EUROPE),
    'Africa': new Room(CONSTANTS.AFRICA, CONSTANTS.AFRICA, CONSTANTS.AFRICA),
    'Asia': new Room(CONSTANTS.ASIA, CONSTANTS.ASIA, CONSTANTS.ASIA),
    'Oceania': new Room(CONSTANTS.OCEANIA, CONSTANTS.OCEANIA, CONSTANTS.OCEANIA),
    'Trivia': new Room(CONSTANTS.TRIVIA, CONSTANTS.TRIVIA, CONSTANTS.TRIVIA),
    'Daily Country': new Room(special, CONSTANTS.SPECIAL, special),
    'Lobby': new Room(CONSTANTS.LOBBY, CONSTANTS.LOBBY, CONSTANTS.LOBBY),
};

// Populate hall of fame into lobby room
rooms[CONSTANTS.LOBBY].hall_of_fame = famers;
Object.values(rooms).forEach(function(room) {
    room.game_special_idx = special_idx;
});
var playerRooms = new Map();

const WELCOME_MESSAGE1 = 'Try out some other geography games, <a href=https://statdle.github.io/ target=\"_blank\">statdle</a>, <a href=https://worldle.teuteuf.fr/ target=\"_blank\">worldle</a>, and <a href=https://geoquest.wout.space/ target=\"_blank\">geoquest</a>!<br><br> ' +
    '[ <b>GREETING</b> ] Welcome to Geoscents, an online multiplayer world geography game! ' +
    'This is an attempt at recreating the similarly-named game from the mid 2000s, Geosense (geosense.net), which is no longer available. ' +
    '<br>If you have feedback, simply shout it directly into this chat box, starting with the word /feedback. ' +
    'If you are enjoying this game, please share it with a friend!  You can donate to help keep the server ' +
    'running using the buttons at the bottom of the page! You can also click on the ads to help pay for the server!';
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
        rooms[CONSTANTS.LOBBY].addPlayer(socket, {
            'moved': false
        });
        playerRooms.set(socket.id, rooms[CONSTANTS.LOBBY]);
        io.sockets.emit('update counts', {
            [CONSTANTS.LOBBY]: rooms[CONSTANTS.LOBBY].playerCount(),
            [CONSTANTS.WORLD]: rooms[CONSTANTS.WORLD].playerCount(),
            [CONSTANTS.WORLD_CAPITALS]: rooms[CONSTANTS.WORLD_CAPITALS].playerCount(),
            [CONSTANTS.NAMERICA]: rooms[CONSTANTS.NAMERICA].playerCount(),
            [CONSTANTS.EUROPE]: rooms[CONSTANTS.EUROPE].playerCount(),
            [CONSTANTS.AFRICA]: rooms[CONSTANTS.AFRICA].playerCount(),
            [CONSTANTS.SAMERICA]: rooms[CONSTANTS.SAMERICA].playerCount(),
            [CONSTANTS.ASIA]: rooms[CONSTANTS.ASIA].playerCount(),
            [CONSTANTS.OCEANIA]: rooms[CONSTANTS.OCEANIA].playerCount(),
            [CONSTANTS.TRIVIA]: rooms[CONSTANTS.TRIVIA].playerCount(),
            [CONSTANTS.SPECIAL]: rooms[CONSTANTS.SPECIAL].playerCount()
        });
        helpers.log("User connected    " + socket.handshake.address);
        socket.emit("update messages", CONSTANTS.LOBBY, WELCOME_MESSAGE1);
    });
    socket.on('button clicked', function(btn) {
        let name = "";
        if (rooms[CONSTANTS.LOBBY].hasPlayer(socket)) {
            name = rooms[CONSTANTS.LOBBY].getPlayerName(socket);
        }
        helpers.log('User clicked ' + btn + ' ' + socket.handshake.address + " (" + name + ")");
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
            io.sockets.emit('update counts', {
                [CONSTANTS.LOBBY]: rooms[CONSTANTS.LOBBY].playerCount(),
                [CONSTANTS.WORLD]: rooms[CONSTANTS.WORLD].playerCount(),
                [CONSTANTS.WORLD_CAPITALS]: rooms[CONSTANTS.WORLD_CAPITALS].playerCount(),
                [CONSTANTS.NAMERICA]: rooms[CONSTANTS.NAMERICA].playerCount(),
                [CONSTANTS.EUROPE]: rooms[CONSTANTS.EUROPE].playerCount(),
                [CONSTANTS.AFRICA]: rooms[CONSTANTS.AFRICA].playerCount(),
                [CONSTANTS.SAMERICA]: rooms[CONSTANTS.SAMERICA].playerCount(),
                [CONSTANTS.ASIA]: rooms[CONSTANTS.ASIA].playerCount(),
                [CONSTANTS.OCEANIA]: rooms[CONSTANTS.OCEANIA].playerCount(),
                [CONSTANTS.TRIVIA]: rooms[CONSTANTS.TRIVIA].playerCount(),
                [CONSTANTS.SPECIAL]: rooms[CONSTANTS.SPECIAL].playerCount()
            });
        }
        Object.values(rooms).forEach(function(room) {
            if (room.isPrivate && room.playerCount() == 0) {
                delete rooms[room.roomName];
            }
        });
    });

    socket.on('playerJoin', (newname, newcolor, newlogger, famerhash, famerpublichash, flair, callback) => {
        var name = '';
        if (newname !== null) name = newname;
        var color = '';
        if (newcolor !== null) color = newcolor;
        var logger = '';
        if (newlogger !== null) logger = newlogger;
        helpers.log("User " + socket.handshake.address + " named themself    " + newname);

        // Handle hall of fame login
        let is_famer = false;
        let famer_emojis = new Map();
        let public_hash = "";
        let famer_name = "";
        for (const [key, value] of famers.entries()) {
            if (key === name) {
                console.log("Login from hall of famer hash " + name)
                famer_countries = value['maps']
                is_famer = true;
                public_hash = value['public_hash']
                famer_name = value['name']
                Object.values(famer_countries).forEach(function(value) {
                    famer_emojis.set(value, helpers.flairToEmoji(value));
                })
            }
        }
        if (is_famer) {
            // famer popup will call playerJoin again with a flaired name
            callback()
            socket.emit('request famer popup', famer_name, newcolor, newlogger, name, public_hash, Object.fromEntries(famer_emojis), callback);
            return
        }

        if (rooms[CONSTANTS.LOBBY].hasPlayer(socket)) {
            var badname = helpers.filterName(name);
            var bad_msg = ""
            if (badname) {
                name = 'Naughty'
                bad_msg = "I used a bad word in my name :(";
            }

            // If player has flair now, then use the name they chose during flair selection instead of their secret hash
            rooms[CONSTANTS.LOBBY].renamePlayer(socket, name, color, logger, famerhash, famerpublichash, flair);
            var join_msg = "[ <font color='" + rooms[CONSTANTS.LOBBY].getPlayerColor(socket) + "'><b>" + rooms[CONSTANTS.LOBBY].getPlayerName(socket) + "</b> has entered the lobby!</font> ] " + bad_msg + "<br>";
            io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg);
            if (famerpublichash != "") {
                var join_msg = "[ <font color='" + rooms[CONSTANTS.LOBBY].getPlayerColor(socket) + "'><b>" + rooms[CONSTANTS.LOBBY].getPlayerName(socket) + "</b></font> is a hall of famer (with public hash " + famerpublichash + ")! ] " + bad_msg + "<br>";
                io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg);
            }
            // Send whispers to specific players
            const specificGreeting = (socket, name, target, msg) => {
                if (name == target && !fs.existsSync('/tmp/' + target)) {
                    helpers.logFeedback("Sent whisper to " + target + ": " + msg + '. touch /tmp/' + target + ' to suppress this message');
                    rooms[CONSTANTS.LOBBY].whisperMessage(socket, msg, () => {});
                }
            };

            if (rooms[CONSTANTS.LOBBY].getPlayerLogger(socket)) socket.emit("update messages", CONSTANTS.LOBBY, "Your player history data is available <a target=\"_blank\" href='https://geoscents.net/resources/histories/" + rooms[CONSTANTS.LOBBY].getPlayerRawName(socket).replace(/ /g, '_') + "_history.html'>here</a><br>");

            // Specific greetings for players
            // specificGreeting(socket, name, "Doz", "<i>Thanks so much for the donation, Doz!</i><br>");
            // specificGreeting(socket, name, "ninjer tootle", "<i>U a bitch</i><br>");
            // specificGreeting(socket, name, "Player 69", "<i>nice</i><br>");
            // specificGreeting(socket, name, "Snowgoat", "<i>There was a bug in World Capitals and your records disappeared from the leaderboard :( Sorry</i><br>");
            // specificGreeting(socket, name, "bumbo", "<i>There was a bug in World Capitals and your records disappeared from the leaderboard :( Sorry</i><br>");
            // specificGreeting(socket, name, "Player 42", "<i>nice</i><br>");
            // specificGreeting(socket, name, "Walter", "<i>Thanks for the feedback!  If you have any ideas for spreading the word besides a post on r/WebGames every 3 months, let me know!  <br>The twine question is surprisingly controversial, but I will add the words 'built by a single person' so that it is accurate and also matches the Weird Al song.</i><br>");
            // specificGreeting(socket, name, "adam", "<i>I was very concerned when you said the Male, Maldives image was \"crazy\".  I thought it was grabbing a random image from the wikipedia page for \"male\".  Did you just mean <a href=https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Male-total.jpg/600px-Male-total.jpg>this image</a> looks crazy?</i><br>");
            // specificGreeting(socket, name, "ecanpecan", "<i>Thanks for pointing that out...</i><br>");
            specificGreeting(socket, name, "Chrisi", "<i>Hi Chrisi, try using \"n7zc3wsn36\" instead of \"Chrisi\" next time you log in!</i><br>");
            io.sockets.emit('update counts', {
                [CONSTANTS.LOBBY]: rooms[CONSTANTS.LOBBY].playerCount(),
                [CONSTANTS.WORLD]: rooms[CONSTANTS.WORLD].playerCount(),
                [CONSTANTS.WORLD_CAPITALS]: rooms[CONSTANTS.WORLD_CAPITALS].playerCount(),
                [CONSTANTS.NAMERICA]: rooms[CONSTANTS.NAMERICA].playerCount(),
                [CONSTANTS.EUROPE]: rooms[CONSTANTS.EUROPE].playerCount(),
                [CONSTANTS.AFRICA]: rooms[CONSTANTS.AFRICA].playerCount(),
                [CONSTANTS.SAMERICA]: rooms[CONSTANTS.SAMERICA].playerCount(),
                [CONSTANTS.ASIA]: rooms[CONSTANTS.ASIA].playerCount(),
                [CONSTANTS.OCEANIA]: rooms[CONSTANTS.OCEANIA].playerCount(),
                [CONSTANTS.TRIVIA]: rooms[CONSTANTS.TRIVIA].playerCount(),
                [CONSTANTS.SPECIAL]: rooms[CONSTANTS.SPECIAL].playerCount()
            });

        }
        callback()
    });
    socket.on('announcement', (text) => {
        announce(text);
        famers = helpers.loadHallOfFame();
        rooms[CONSTANTS.LOBBY].hall_of_fame = famers;
    });
    socket.on('drawCommand', (text) => {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            room.drawCommand(socket);
        }
    });
    socket.on('playerReady', () => {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            room.playerReady(socket);
        }
    });
    socket.on('playerReboot', () => {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            room.playerReboot(socket);
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

        io.sockets.emit('update counts', {
            [CONSTANTS.LOBBY]: rooms[CONSTANTS.LOBBY].playerCount(),
            [CONSTANTS.WORLD]: rooms[CONSTANTS.WORLD].playerCount(),
            [CONSTANTS.WORLD_CAPITALS]: rooms[CONSTANTS.WORLD_CAPITALS].playerCount(),
            [CONSTANTS.NAMERICA]: rooms[CONSTANTS.NAMERICA].playerCount(),
            [CONSTANTS.EUROPE]: rooms[CONSTANTS.EUROPE].playerCount(),
            [CONSTANTS.AFRICA]: rooms[CONSTANTS.AFRICA].playerCount(),
            [CONSTANTS.SAMERICA]: rooms[CONSTANTS.SAMERICA].playerCount(),
            [CONSTANTS.ASIA]: rooms[CONSTANTS.ASIA].playerCount(),
            [CONSTANTS.OCEANIA]: rooms[CONSTANTS.OCEANIA].playerCount(),
            [CONSTANTS.TRIVIA]: rooms[CONSTANTS.TRIVIA].playerCount(),
            [CONSTANTS.SPECIAL]: rooms[CONSTANTS.SPECIAL].playerCount()
        });
    });
    socket.on('mute', () => {
        io.sockets.emit('mute player', socket.id)
    });
    socket.on('autoscale', () => {
        io.sockets.emit('autoscale', socket.id)
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
                helpers.log("Player " + socket.handshake.address + " " + room.getPlayerName(socket) + " has killed joe in " + room.roomName);
                room.killJoe()
            } else {
                helpers.log("Player " + socket.handshake.address + " " + room.getPlayerName(socket) + " has birthed joe in " + room.roomName);
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
            helpers.log("Player " + socket.handshake.address + " switched to map style " + style);
            io.sockets.emit('render map', socket.id, style, room.map);
            room.redrawMap(socket);
        } else {
            helpers.log("Player " + socket.handshake.address + " tried to switch maps without being in a room!")
        }
    });
    socket.on('shiftHue', (shift) => {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            io.sockets.emit('shift hue', socket.id, shift, room.map);
            room.redrawMap(socket);
        }
    });
    socket.on('moveTo', (citysrc) => {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            const originRoomName = room.roomName;
            const oldColor = rooms[originRoomName].getPlayerColor(socket);
            const oldLogger = rooms[originRoomName].getPlayerLogger(socket);
            const oldName = rooms[originRoomName].getPlayerRawName(socket);
            const oldWins = rooms[originRoomName].getPlayerWins(socket);
            const oldOptOut = rooms[originRoomName].getPlayerOptOut(socket);
            const oldHash = rooms[originRoomName].getPlayerHash(socket);
            const oldPublicHash = rooms[originRoomName].getPlayerPublicHash(socket);
            const oldFlair = rooms[originRoomName].getPlayerFlair(socket);
            const info = {
                'moved': true,
                'color': oldColor,
                'name': oldName,
                'wins': oldWins,
                'logger': oldLogger,
                'hash': oldHash,
                'public_hash': oldPublicHash,
                'flair': oldFlair,
                'optOut': oldOptOut
            }
            var leave_msg = "[ <font color='" + rooms[originRoomName].getPlayerColor(socket) + "'><b>" + rooms[originRoomName].getPlayerRawName(socket) + "</b> has left " + originRoomName + " and joined " + citysrc + "!</font> ]<br>";
            io.sockets.emit("update messages", originRoomName, leave_msg)
            rooms[originRoomName].killPlayer(socket);
            let map = citysrc
            if (map.includes('World'))
                map = CONSTANTS.WORLD
            let roomName = citysrc
            socket.emit('moved to', map, roomName, citysrc, rooms[citysrc].state);
            rooms[roomName].addPlayer(socket, info);
            playerRooms.set(socket.id, rooms[roomName]);
            var join_msg = "[ <font color='" + rooms[roomName].getPlayerColor(socket) + "'><b>" + rooms[roomName].getPlayerRawName(socket) + "</b> has joined " + roomName + "!</font> ]<br>";
            io.sockets.emit("update messages", roomName, join_msg);
            if (roomName == CONSTANTS.TRIVIA) rooms[roomName].whisperMessage(socket, "<i>Welcome to the Trivia map!  This one quizzes you on the locations of miscellaneous cultural and historical events and places.  Please suggest more items or complain about current items by typing a message starting with /feedback!</i><br>", function() {});
            if (roomName == CONSTANTS.SPECIAL) rooms[CONSTANTS.SPECIAL].whisperMessage(socket, "<i><b>" + CONSTANTS.SPECIALS[special]["greeting"] + "</b>! Today's special country is <b>" + special + "</b>!</i><br>", function() {});
            if (roomName == CONSTANTS.WORLD_CAPITALS) rooms[roomName].whisperMessage(socket, "<i>Welcome to the World Capitals map!  This map no longer includes province and state capitals of the largest countries (i.e. Canada, USA, China, India, and Australia).  Let me know if you think this is better or worse by leaving /feedback!</i><br>", function() {});
            io.sockets.emit('update counts', {
                [CONSTANTS.LOBBY]: rooms[CONSTANTS.LOBBY].playerCount(),
                [CONSTANTS.WORLD]: rooms[CONSTANTS.WORLD].playerCount(),
                [CONSTANTS.WORLD_CAPITALS]: rooms[CONSTANTS.WORLD_CAPITALS].playerCount(),
                [CONSTANTS.NAMERICA]: rooms[CONSTANTS.NAMERICA].playerCount(),
                [CONSTANTS.EUROPE]: rooms[CONSTANTS.EUROPE].playerCount(),
                [CONSTANTS.AFRICA]: rooms[CONSTANTS.AFRICA].playerCount(),
                [CONSTANTS.SAMERICA]: rooms[CONSTANTS.SAMERICA].playerCount(),
                [CONSTANTS.ASIA]: rooms[CONSTANTS.ASIA].playerCount(),
                [CONSTANTS.OCEANIA]: rooms[CONSTANTS.OCEANIA].playerCount(),
                [CONSTANTS.TRIVIA]: rooms[CONSTANTS.TRIVIA].playerCount(),
                [CONSTANTS.SPECIAL]: rooms[CONSTANTS.SPECIAL].playerCount()
            });
            rooms[roomName].joeMessage();
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
    socket.on('requestHelpPopup', () => {
        socket.emit('request help popup');
    });
    socket.on('moveToPrivate', (askcitysrc, code) => {
        // Convert citysrc to the map that it is played on
        let map = askcitysrc;
        if (map.includes('World'))
            map = CONSTANTS.WORLD

        if (playerRooms.has(socket.id)) {
            let dest = "private_" + code;
            const room = playerRooms.get(socket.id);
            const originRoomName = room.roomName;
            const oldColor = rooms[originRoomName].getPlayerColor(socket);
            const oldName = rooms[originRoomName].getPlayerRawName(socket);
            const oldWins = rooms[originRoomName].getPlayerWins(socket);
            const oldOptOut = rooms[originRoomName].getPlayerOptOut(socket);
            const oldHash = rooms[originRoomName].getPlayerHash(socket);
            const oldPublicHash = rooms[originRoomName].getPlayerPublicHash(socket);
            const oldFlair = rooms[originRoomName].getPlayerFlair(socket);
            const info = {
                'moved': true,
                'color': oldColor,
                'name': oldName,
                'wins': oldWins,
                'hash': oldHash,
                'public_hash': oldPublicHash,
                'flair': oldFlair,
                'optOut': oldOptOut
            }
            if (originRoomName == dest) {
                var leave_msg = "[ <font color='" + rooms[originRoomName].getPlayerColor(socket) + "'><b>" + rooms[originRoomName].getPlayerRawName(socket) + "</b> has changed the map to " + askcitysrc + "!</font> ]<br>";
                io.sockets.emit("update messages", originRoomName, leave_msg);
                let citysrc = askcitysrc;
                if (Object.keys(CONSTANTS.SPECIALS).indexOf(citysrc) !== -1) rooms[dest].whisperMessage(socket, "<i><b>" + CONSTANTS.SPECIALS[citysrc]["greeting"] + "</b> to the <b>" + citysrc + "</b> map!</i><br>", function() {});
                rooms[dest].map = map;
                rooms[dest].citysrc = citysrc;
                rooms[dest].reset();
                socket.emit('moved to', map, dest, citysrc, rooms[dest].state);
                helpers.log("Player " + socket.handshake.address + " " + rooms[dest].getPlayerName(socket) + " changed map in " + dest);
            } else {
                console.log('making private room ' + dest)
                var leave_msg = "[ <font color='" + rooms[originRoomName].getPlayerColor(socket) + "'><b>" + rooms[originRoomName].getPlayerName(socket) + "</b> has left " + originRoomName + " and joined a private room!</font> ]<br>";
                io.sockets.emit("update messages", originRoomName, leave_msg)
                rooms[originRoomName].killPlayer(socket);
                Object.values(rooms).forEach(function(room) {
                    if (room.isPrivate && room.playerCount() == 0 && rooms.hasOwnProperty(room.roomName)) {
                        delete rooms[room.roomName];
                    }
                });
                let citysrc = askcitysrc;
                if (!(dest in rooms)) {
                    rooms[dest] = new Room(map, dest, citysrc);
                } else {
                    map = rooms[dest].map
                    citysrc = rooms[dest].citysrc
                }
                socket.emit('moved to', map, dest, citysrc, rooms[dest].state);
                socket.emit('update messages', dest, PRIVATE_MESSAGE);
                rooms[dest].addPlayer(socket, info);
                playerRooms.set(socket.id, rooms[dest]);
                if (Object.keys(CONSTANTS.SPECIALS).indexOf(citysrc) !== -1) rooms[dest].whisperMessage(socket, "<i><b>" + CONSTANTS.SPECIALS[citysrc]["greeting"] + "</b> to the <b>" + citysrc + "</b> map!</i><br>", function() {});
                var join_msg = "[ <font color='" + rooms[dest].getPlayerColor(socket) + "'><b>" + rooms[dest].getPlayerName(socket) + "</b> has joined " + dest + "!</font> ]<br>";
                io.sockets.emit("update messages", dest, join_msg);
                // if (dest == CONSTANTS.TRIVIA) rooms[dest].whisperMessage(socket, "<i>Welcome to the Trivia map!  This one quizzes you on the locations of miscellaneous cultural and historical events and places.  Please suggest more items by typing a message into the chat box that starts with \"feedback\" and I may add them!  You may also complain about any of the existing items.</i><br>", function() {});
                io.sockets.emit('update counts', {
                    [CONSTANTS.LOBBY]: rooms[CONSTANTS.LOBBY].playerCount(),
                    [CONSTANTS.WORLD]: rooms[CONSTANTS.WORLD].playerCount(),
                    [CONSTANTS.WORLD_CAPITALS]: rooms[CONSTANTS.WORLD_CAPITALS].playerCount(),
                    [CONSTANTS.NAMERICA]: rooms[CONSTANTS.NAMERICA].playerCount(),
                    [CONSTANTS.EUROPE]: rooms[CONSTANTS.EUROPE].playerCount(),
                    [CONSTANTS.AFRICA]: rooms[CONSTANTS.AFRICA].playerCount(),
                    [CONSTANTS.SAMERICA]: rooms[CONSTANTS.SAMERICA].playerCount(),
                    [CONSTANTS.ASIA]: rooms[CONSTANTS.ASIA].playerCount(),
                    [CONSTANTS.OCEANIA]: rooms[CONSTANTS.OCEANIA].playerCount(),
                    [CONSTANTS.TRIVIA]: rooms[CONSTANTS.TRIVIA].playerCount(),
                    [CONSTANTS.SPECIAL]: rooms[CONSTANTS.SPECIAL].playerCount()
                });
                helpers.log("Player " + socket.handshake.address + " " + rooms[dest].getPlayerName(socket) + " moved to room " + dest);
                rooms[dest].joeMessage();
            }
        }
    });
    socket.on('playerClick', (playerClick) => {
        if (playerClick.clickEvent && playerRooms.has(socket.id)) {
            // console.log('processing player click')      
            const room = playerRooms.get(socket.id);
            room.playerClicked(socket, playerClick)
        }
    });
    socket.on("block spam", function() {
        Object.values(rooms).forEach(function(room) {
            if (room.hasPlayer(socket)) {
                helpers.log("Blocked spammer " + socket.handshake.address + " " + room.getPlayerName(socket));
                room.whisperMessage(socket, "<i>You are talking too fast!  Please calm down</i><br>", () => {});
            }
        });
    });
    socket.on("block joe toggle", function() {
        Object.values(rooms).forEach(function(room) {
            if (room.hasPlayer(socket)) {
                helpers.log("Blocked joe toggler " + socket.handshake.address + " " + room.getPlayerName(socket));
                room.whisperMessage(socket, "<i>Please calm down and stop taking your anger out on the poor bot!</i><br>", () => {});
            }
        });
    });
    socket.on("send message", function(sent_msg, callback) {
        if (sent_msg == "") {
            callback();
            return;
        }
        const msg = sent_msg;
        const isFeedback = (msg.toLowerCase().trim().startsWith('/feedback'));
        const isOptOut = (msg.toLowerCase().trim().startsWith('/private'));
        const isOptIn = (msg.toLowerCase().trim().startsWith('/public'));
        const isAnnounce = (msg.toLowerCase().trim().startsWith('/announce'));
        const isWhisper = (msg.toLowerCase().trim().startsWith('/whisper'));
        const isHidden = (msg.toLowerCase().trim().startsWith('/hidden'));
        const isCount = (msg.toLowerCase().trim().startsWith('/count'));
        const isUnknownCmd = (msg.toLowerCase().trim().startsWith('/'));
        const cb = () => {
            callback()
        };
        Object.values(rooms).forEach(function(room) {
            if (room.hasPlayer(socket)) {
                var new_sent_msg = msg;
                replaceAll = function(original, strReplace, strWith) {
                    // See http://stackoverflow.com/a/3561711/556609
                    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    var reg = new RegExp(esc, 'ig');
                    return original.replace(reg, strWith);
                };
                CONSTANTS.PROFANITY_REGEX.forEach((word) => {
                    var re = new RegExp(word, "i");
                    new_sent_msg = new_sent_msg.replace(re, " **** ")
                });
                helpers.logMessage("Message passed by " + socket.handshake.address + " " + room.getPlayerName(socket) + " " + room.getActiveEntry() + " : " + msg);
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
                if (room.hasJoe && new_sent_msg.toLowerCase().trim().startsWith("yeet")) {
                    room.distributeMessage(socket, new_sent_msg, cb);
                    room.joeYeet(socket);
                    cb();
                    return;
                }
                if (isFeedback) {
                    room.distributeMessage(socket, new_sent_msg, cb);
                    room.whisperMessage(socket, "<i>Your feedback has been noted!  Thank you for playing and commenting!</i><br>", cb);
                    helpers.logFeedback("Message passed by " + socket.handshake.address + " " + room.getPlayerName(socket) + ": " + msg);
                } else if (isOptOut) {
                    room.whisperMessage(socket, "<i>Your IP address has been masked.  Thank you for playing the game!  Type /public if you want to opt-in!</i><br>", cb);
                    room.players.get(socket.id).optOut = true;
                } else if (isOptIn) {
                    room.whisperMessage(socket, "<i>Your IP address has been unmasked.  Thank you for playing the game and helping to build up the dataset!</i><br>", cb);
                    room.players.get(socket.id).optOut = false;
                } else if (isAnnounce) {
                    const playerName = room.getPlayerName(socket);
                    const playerColor = room.getPlayerColor(socket);
                    const playerRoom = room.roomName;
                    announce("[ " + playerRoom + " <b><font color='" + playerColor + "'>" + playerName + "</font></b> Announces ]: " + replaceAll(new_sent_msg, "/announce", "") + "<br>")
                    cb();
                } else if (isHidden) {
                    let numHidden = 0;
                    room.distributeMessage(socket, new_sent_msg, cb)
                    Object.values(rooms).forEach(function(r) {
                        if (r.isPrivate) {
                            Array.from(r.players.values()).forEach(function(player) {
                                room.distributeMessage(socket, "  - <font color='" + player.color + "'><b>" + player.name + "</b></font> (" + r.citysrc + ")", cb)
                                numHidden = numHidden + 1;
                            })
                        }
                    })
                    if (numHidden > 0) room.distributeMessage(socket, "The following players are in private games: ", cb);
                    else room.distributeMessage(socket, "No players are currently in private games", cb);
                } else if (isCount) {
                    let numCount = 0;
                    room.distributeMessage(socket, new_sent_msg, cb)
                    Object.values(rooms).forEach(function(r) {
                        Array.from(r.players.values()).forEach(function(player) {
                            numCount = numCount + 1;
                        })
                    })
                    if (numCount > 1) room.distributeMessage(socket, "<b>Total online  (including you): " + numCount + "</b>", cb);
                    else room.distributeMessage(socket, "<b>You are the only player online!</b>", cb);
                } else if (isWhisper) {
                    const playerName = room.getPlayerName(socket);
                    const playerColor = room.getPlayerColor(socket);
                    const playerRoom = room.roomName;
                    let dst = msg.match(/"(.*?)"/g);
                    if (dst == null || dst.length != 1) {
                        room.whisperMessage(socket, "<i>Please specify one player to whisper to, using quotes (\"\")</i><br>", () => {});
                    } else {
                        let foundPlayer = false;
                        let dstPlayer = dst[0].replace(/"/g, "");
                        let dstSocket = null;
                        Object.values(rooms).forEach(function(dstroom) {
                            if (!foundPlayer) {
                                dstSocket = dstroom.getPlayerByName(dstPlayer);
                                if (dstSocket != null) {
                                    room.whisperMessage(socket, "<i>[ You whisper to " + dstPlayer + " ]: " + replaceAll(replaceAll(new_sent_msg, "/whisper", ""), "\"" + dstPlayer + "\"", "") + "</i><br>", cb);
                                    dstroom.whisperMessage(dstSocket, "<i>[ " + playerRoom + " <b><font color='" + playerColor + "'>" + playerName + "</font></b> Whispers ]: " + replaceAll(replaceAll(new_sent_msg, "/whisper", ""), "\"" + dstPlayer + "\"", "") + "</i><br>", () => {});
                                    foundPlayer = true;
                                }
                            }
                        });
                        if (!foundPlayer) {
                            room.whisperMessage(socket, "<i>Player " + dstPlayer + " not found in any room.</i><br>", () => {});
                        }
                    }
                } else if (isUnknownCmd) {
                    room.whisperMessage(socket, "<i>Your command was not recognized!  Please check your spelling.  All valid commands can be found at <a href=\"https://geoscents.net/resources/about.html\" target=\"_blank\">https://geoscents.net/resources/about.html</a></i><br>", () => {});
                } else {
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
                if (room1.citysrc == room2.citysrc && room1.roomName != room2.roomName && room1.lastRecordUpdate > room2.lastRecordUpdate) {
                    room2.syncRecords(room1.lastRecordUpdate, room1.dayRecord, room1.weekRecord, room1.monthRecord, room1.allRecord);
                }
            });
            room1.serviceRecord = false;
        }
    });
}, 1000);
// Handle reboot message
setInterval(() => {
    var d = new Date();
    const week = d.getDay() === 0;
    const month = d.getDate() === 1;
    const year = d.getDate() === 1 && d.getMonth() === 0;
    let s = ""
    if (week && !month && !year) s = " and weekly"
    if (!week && month && !year) s = " and monthly"
    if (week && month && !year) s = ", weekly, and monthly"
    if (!week && !month && year) s = " and yearly"
    if (week && !month && year) s = ", weekly, and yearly"
    if (!week && month && year) s = ", monthly, and yearly"
    if (week && month && year) s = ", weekly, monthly, and yearly"

    // // Debug rapid reset
    // let reset_imminent = d.getMinutes() % 2 === 0 && d.getSeconds() <= 29; 
    // let reset_now = d.getMinutes() % 2 === 0 && d.getSeconds() > 29;

    let reset_imminent = d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() <= 29;
    let reset_now = d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() > 29;
    if (reset_imminent) {
        announce("<font size=9 color=\"red\"><b>WARNING: Daily" + s + " records will reset in 30 seconds! Daily country will also be changed!</b></font><br>")
    }

    // Get new special
    if (reset_now) {
        special_idx = calculate_special();
        special = Object.keys(CONSTANTS.SPECIALS)[special_idx];
        Object.values(rooms).forEach(function(room) {
            room.flushRecords(week, month, year);
            if (room.roomName == CONSTANTS.SPECIAL) {
                room.killJoe();
                room.map = special.key;
                room.citysrc = special.key;
                room.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
                room.createJoe();
            }
        });
        announce("<font size=10 color=\"red\"><b>Daily" + s + " records have been reset!</b></font><br>")
    }
}, 30000);

// // Handle *_guesses_staging -> *_guesses merge every so often
// var flushed_guesses = false
// setInterval( () => {
//     var d = new Date();
//     var every_n_hours = 1
//     var every_n_minutes = 1
//     if (d.getHours() % every_n_hours == 0 && d.getMinutes() % every_n_minutes === 0 && d.getSeconds() <= 29) {
//       const timestamp = d.getDate() + "/"
//         + (d.getMonth() + 1) + "/"
//         + d.getFullYear() + " @ "
//         + d.getHours() + ":"
//         + d.getMinutes() + ":"
//         + d.getSeconds() + ":";
//       console.log(timestamp + ": Preparing to flush staged guesses")
//       flushed_guesses = false
//     }
//     if (flushed_guesses == false && d.getHours() % every_n_hours === 0 && d.getMinutes() % every_n_minutes === 0 && d.getSeconds() > 29) {
//       const timestamp = d.getDate() + "/"
//         + (d.getMonth() + 1) + "/"
//         + d.getFullYear() + " @ "
//         + d.getHours() + ":"
//         + d.getMinutes() + ":"
//         + d.getSeconds() + ":";
//       console.log(timestamp + ": Flushing guesses!")
//       flushed_guesses = true
//       Object.values(rooms).forEach(function(room) {
//           room.flushGuesses();
//       });
//     }
// // }, 30000);
// }, 5000);


module.exports = {
    io
};