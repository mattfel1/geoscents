/** Top level file for handling connections, messages, and dispatching the game FSM */

const Geography = require('./geography.js');
const MAPS = require('../resources/maps.json')
const crypto = require('crypto'),
    fs = require("fs"),
    http = require("http");
const https = require('https');
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

if (process.env.LOCAL_DEV) {
    PORT = 5000;
    SPORT = 5443;
    useHttp = true;
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
        var privateKey = fs.readFileSync('/home/mattf/geoscents/key.pem').toString();
        var certificate = fs.readFileSync('/home/mattf/geoscents/cert.pem').toString();
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

// Handle post request to report growth error, from geoscents_stats on my local machine
app.post('/', (req, res) => {
    console.log("Handling post...")

    let recognized_post = Object.keys(req.body).indexOf('msg') !== -1
    if (recognized_post) {
        let msg = req.body['msg']
        console.log("post msg: " + msg)
        helpers.logFeedback(msg);
        res.send("Handled post request with msg: " + msg);
    } else {
        console.log("unrecognized post!")
    }
});

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
app.get('/resources/constants.js', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, '..', 'resources/constants.js'));
});
app.get('/resources/maps.json', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, '..', 'resources/maps.json'));
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

const calculate_specials = () => {
    // Get days since jan 1
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay) + 2;
    let region_maps = []
    let capital_maps = []
    for (const x in MAPS) {
        if (Geography.isRegion(x))
            region_maps.push(x);
        else if (Geography.isCapital(x))
            capital_maps.push(x);
    }

    const num_regions = region_maps.length;
    const num_capitals = capital_maps.length;
    // We want day % num_regions to be our new special_region_idx, but this is not stable when num_regions grows.
    // To be more stable, we upcast num_regions to the nearest multiple of 20 and mod by that.  Then mod by num_regions.
    let upcast_num_regions = (Math.round(num_regions / 20) + 1) * 20
    let upcast_num_capitals = (Math.round(num_capitals / 20) + 1) * 20
    let raw_regions_idx = (day % upcast_num_regions) % num_regions;
    let raw_capitals_idx = (day % upcast_num_capitals) % num_capitals;

    // "Randomize" the special country so you can't easily tell the order by looking at constants.js.
    // Find a multiplier, mult, that is coprime with num_regions, and recalculate special idx by multiplying
    // with this value and re-modding with num_regions.
    // Basically, since the lcm of two coprime numbers, A and B, is A*B, that means you can use A to re-index
    // values from 0 to B. For example, B = 10, A = 3, integers 0, 1, 2, ..., 9 would become 0, 3, 6, ..., 7.
    // Choose mult as the first coprime number above currenty "epoch."  Epoch = raw_idx / upcast_num_specials.
    let regions_epoch = Math.floor(day / upcast_num_regions) % num_regions;
    let mult = 1;
    for (let i = regions_epoch; i < num_regions; i++) {
        if (i != 0 && coprime(i, num_regions)) {
            mult = i;
            break;
        }
    }
    // Plus 6 to match country the day this was implemented
    let regions_idx = (6 + mult * raw_regions_idx) % num_regions;
    let capitals_idx = (6 + mult * raw_capitals_idx) % num_capitals;

    let special_region = region_maps[regions_idx];
    let special_capital = capital_maps[capitals_idx];

    // Assume classics always come first
    return [special_region, special_capital];
}

let [special_region, special_capital] = calculate_specials();
let special_capital_map = special_capital.replace(" Capitals", "");

// Game state info
// map, roomName, citysrc
var rooms = {
    'World': new Room(CONSTANTS.WORLD, CONSTANTS.WORLD, CONSTANTS.WORLD),
    'N. America': new Room(CONSTANTS.NAMERICA, CONSTANTS.NAMERICA, CONSTANTS.NAMERICA),
    'S. America': new Room(CONSTANTS.SAMERICA, CONSTANTS.SAMERICA, CONSTANTS.SAMERICA),
    'Europe': new Room(CONSTANTS.EUROPE, CONSTANTS.EUROPE, CONSTANTS.EUROPE),
    'Africa': new Room(CONSTANTS.AFRICA, CONSTANTS.AFRICA, CONSTANTS.AFRICA),
    'Asia': new Room(CONSTANTS.ASIA, CONSTANTS.ASIA, CONSTANTS.ASIA),
    'Oceania': new Room(CONSTANTS.OCEANIA, CONSTANTS.OCEANIA, CONSTANTS.OCEANIA),
    'Trivia': new Room(CONSTANTS.TRIVIA, CONSTANTS.TRIVIA, CONSTANTS.TRIVIA),
    'Daily Region': new Room(special_region, CONSTANTS.SPECIAL_REGION, special_region),
    'Daily Capitals': new Room(special_capital_map, CONSTANTS.SPECIAL_CAPITAL, special_capital),
    'Lobby': new Room(CONSTANTS.LOBBY, CONSTANTS.LOBBY, CONSTANTS.LOBBY),
};

// Populate hall of fame into lobby room
rooms[CONSTANTS.LOBBY].hall_of_fame = famers;

const getHist = () => {
    const publicRoomList = Object.values(rooms).filter(r => r.isPublic);
    return {
        [CONSTANTS.LOBBY]: rooms[CONSTANTS.LOBBY].playerCount(),
        [CONSTANTS.WORLD]: rooms[CONSTANTS.WORLD].playerCount(),
        [CONSTANTS.SPECIAL_CAPITAL]: rooms[CONSTANTS.SPECIAL_CAPITAL].playerCount(),
        [CONSTANTS.NAMERICA]: rooms[CONSTANTS.NAMERICA].playerCount(),
        [CONSTANTS.EUROPE]: rooms[CONSTANTS.EUROPE].playerCount(),
        [CONSTANTS.AFRICA]: rooms[CONSTANTS.AFRICA].playerCount(),
        [CONSTANTS.SAMERICA]: rooms[CONSTANTS.SAMERICA].playerCount(),
        [CONSTANTS.ASIA]: rooms[CONSTANTS.ASIA].playerCount(),
        [CONSTANTS.OCEANIA]: rooms[CONSTANTS.OCEANIA].playerCount(),
        [CONSTANTS.TRIVIA]: rooms[CONSTANTS.TRIVIA].playerCount(),
        [CONSTANTS.SPECIAL_REGION]: rooms[CONSTANTS.SPECIAL_REGION].playerCount(),
        _publicRooms: publicRoomList.length,
        _publicPlayers: publicRoomList.reduce((sum, r) => sum + r.playerCount(), 0)
    };
}

const PLAYER_COUNT_LOG = '/scratch/player_count.csv';
if (!fs.existsSync(PLAYER_COUNT_LOG)) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fs.writeFileSync(PLAYER_COUNT_LOG, `date,time (${tz}),hour (${tz}),players\n`);
}
const logPlayerCount = () => {
    const total = Object.values(rooms).reduce((sum, r) => sum + r.playerCount(), 0);
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    fs.appendFile(PLAYER_COUNT_LOG, `${date},${time},${d.getHours()},${total}\n`, () => {});
};
setInterval(logPlayerCount, 15 * 60 * 1000);

const getPublicRoomsInfo = () => {
    return Object.values(rooms)
        .filter(r => r.isPublic && r.playerCount() > 0)
        .map(r => ({
            roomId: r.roomName,
            citysrc: r.citysrc,
            roomLabel: r.roomLabel,
            playerCount: r.playerCount(),
            flair: MAPS[r.citysrc] ? MAPS[r.citysrc].flair || '' : ''
        }));
};

let publicRoomCounter = 0;

var playerRooms = new Map();

const WELCOME_MESSAGE1 = 'Try out some other geography games, <a href=https://statdle.com/ target=\"_blank\">statdle</a>, <a href=https://worldle.teuteuf.fr/ target=\"_blank\">worldle</a>, and <a href=https://geoquest.wout.space/ target=\"_blank\">geoquest</a>!<br><br> ' +
    '[ <b>GREETING</b> ] Welcome to Geoscents, an online multiplayer world geography game! ' +
    'This is an attempt at recreating the similarly-named game from the mid 2000s, Geosense (geosense.net), which is no longer available. ' +
    '<br>If you have feedback, simply shout it directly into this chat box, starting with the word /feedback. ' +
    'If you are enjoying this game, please share it with a friend!  You can donate to help keep the server ' +
    'running using the buttons at the bottom of the page! You can also click on the ads to help pay for the server!';
const PRIVATE_MESSAGE = '<i>Welcome to a private room!  You can whisper your secret code to a friend by typing the command /whisper "username" in the chat box. ' +
    'You can use the command /hidden to see if your friend is hiding in another private game.</i><br>';

//const WELCOME_MESSAGE2 = '[ <b>UPDATE 1/6/2019</b> ] The yearly records are supposed to reset on 1/1/2020, but because of a mistake with cron, they were erroneously reset again on 1/6/2020.  Sorry!<br>'

let random_player_id = 0;

const announce = (text) => {
    Object.values(rooms).forEach(function(room) {
        io.sockets.emit("update messages", room.roomName, text);
    });
}

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    famers = helpers.loadHallOfFame();
    rooms[CONSTANTS.LOBBY].hall_of_fame = famers;
    socket.on('newPlayer', () => {
        rooms[CONSTANTS.LOBBY].addPlayer(socket, {
            'moved': false
        });
        playerRooms.set(socket.id, rooms[CONSTANTS.LOBBY]);
        io.sockets.emit('update counts', getHist()); 
        socket.emit('update public rooms', getPublicRoomsInfo());
        helpers.log("User connected    " + socket.handshake.address);
        socket.emit("update messages", CONSTANTS.LOBBY, WELCOME_MESSAGE1);
    });
    socket.on('disconnect', function() {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            const info = room.exportPlayer(socket);
            const name = info['raw_name'];
            helpers.log("User disconnected " + socket.handshake.address + ": " + name);
            if (room.playerChoseName(socket)) {
                var leave_msg = "[ <font color='" + info['color'] + "'><b>" + info['raw_name'] + "</b> has exited GeoScents!</font> ]<br>";
                io.sockets.emit("update messages", room.roomName, leave_msg);
            }
            // Transfer host before removing player so clients Map is still intact
            if (room.isPrivate || room.isPublic) {
                const newHostId = room.transferHostIfNeeded(socket.id);
                if (newHostId !== null) {
                    const newHostPlayer = room.players.get(newHostId);
                    const newHostName = newHostPlayer ? newHostPlayer.name : '???';
                    const newHostColor = newHostPlayer ? newHostPlayer.color : '#000';
                    const hostMsg = "[ <i>Room host left. <font color='" + newHostColor + "'><b>" + newHostName + "</b></font> is now the host!</i> ]<br>";
                    room.clients.forEach((s) => s.emit('update messages', room.roomName, hostMsg));
                }
            }
            const wasNamed = room.playerChoseName(socket);
            room.killPlayer(socket);
            io.sockets.emit('update counts', getHist());
            io.sockets.emit('update public rooms', getPublicRoomsInfo());
        }
        Object.values(rooms).forEach(function(room) {
            if ((room.isPrivate || room.isPublic) && room.playerCount() == 0) {
                delete rooms[room.roomName];
            }
        });
    });

    socket.on('playerJoin', (newname, newcolor, newlogger, famerhash, famerpublichash, flair, grind, perfect, clown, callback) => {
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
        let perfects = [];
        for (const [key, value] of famers.entries()) {
            if (key === name) {
                console.log("Login from hall of famer hash " + name)
                famer_countries = value['maps']
                perfect_countries = value['perfect']
                is_famer = true;
                if (value['perfect'] !== undefined)
                    perfect = value['perfect']
                public_hash = value['public_hash']
                famer_name = value['name']
                Object.values(famer_countries).forEach(function(value) {
                    famer_emojis.set(value, helpers.flairToEmoji(value));
                });
                Object.values(perfect_countries).forEach(function(value) {
                    perfects.push(value);
                });
            }
        }
        if (is_famer) {
            // famer popup will call playerJoin again with a flaired name
            callback()
            socket.emit('request famer popup', famer_name, newcolor, newlogger, name, public_hash, Object.fromEntries(famer_emojis), grind, perfects, "", callback);
            return
        }

        if (rooms[CONSTANTS.LOBBY].hasPlayer(socket)) {
            var badname = helpers.filterName(name);
            var bad_msg = ""
            if (badname) {
                name = 'Naughty'
                bad_msg = "I used a bad word in my name :(";
            }

            // Verify player is well-formed
            if (name == '') {
                name = "Player " + random_player_id;
                random_player_id = (random_player_id + 1) % 100;
            }
            let name_ok = name.length >= 1 && name.length <= 14 && /^[a-zA-Z0-9][a-zA-Z0-9 ?!]+[a-zA-Z0-9]$/.test(name);
            if (!name_ok) {
                rooms[CONSTANTS.LOBBY].whisperMessage(socket, "<b>Changing name to Error because your name was invalid: " + name + "</b><br>", () => {});
                name = "Error"
            }

            const color_ok = CONSTANTS.COLORS.indexOf(color) !== -1 || color == "random"
            if (!color_ok) {
                rooms[CONSTANTS.LOBBY].whisperMessage(socket, "<b>Changing color to red because your color was invalid: " + color + "</b><br>", () => {});
                color = "red"
            }

            let logger_ok = logger == "Yes" || logger == "No"
            if (!logger_ok) {
                rooms[CONSTANTS.LOBBY].whisperMessage(socket, "<b>Changing logger to Yes because your logger was invalid: " + logger + "</b><br>", () => {});
                logger = "Yes"
            }

            let flair_ok = true;
            if (famerhash != "") {
                flair_ok = false;
                for (const [key, value] of famers.entries()) {
                    if (key === famerhash) {
                        famer_countries = value['maps']
                        famer_countries.forEach(function(country) {
                            if (helpers.flairToEmoji(country) == flair)
                                flair_ok = true;
                        })
                    }
                }
            }
            if (!flair_ok) {
                rooms[CONSTANTS.LOBBY].whisperMessage(socket, "<b>Changing flair to blank because your flair was invalid: " + flair + "</b><br>", () => {});
                flair = ""
            }


            // If player has flair now, then use the name they chose during flair selection instead of their secret hash
            rooms[CONSTANTS.LOBBY].renamePlayer(socket, name, color, logger, famerhash, famerpublichash, flair, grind, perfect, clown);
            const info = rooms[CONSTANTS.LOBBY].exportPlayer(socket)
            var join_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b> has entered the lobby!</font> ] " + bad_msg + "<br>";
            io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg);
            if (famerpublichash != "") {
                var perfect_msg = ''
                if (perfect)
                    perfect_msg = ' WHO ACHIEVED A PERFECT SCORE ON ' + flair;
                var join_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b></font> is a hall of famer " + perfect_msg + " (with public hash " + famerpublichash + ")! ] " + bad_msg + "<br>";
                io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg);
            }
            // Send whispers to specific players
            const specificGreeting = (socket, name, target, msg) => {
                if (name == target && !fs.existsSync('/tmp/' + target)) {
                    helpers.logFeedback("Sent whisper to " + target + ": " + msg + '. touch /tmp/' + target + ' to suppress this message');
                    rooms[CONSTANTS.LOBBY].whisperMessage(socket, msg, () => {});
                }
            };

            if (info['logger']) socket.emit("update messages", CONSTANTS.LOBBY, "Your player history data is available <a target=\"_blank\" href='https://geoscents.net/resources/histories/" + info['raw_name'].replace(/ /g, '_') + "_history.html'>here</a><br>");

            // Specific greetings for players
            // specificGreeting(socket, name, "Doz", "<i>Thanks so much for the donation, Doz!</i><br>");
            // specificGreeting(socket, name, "ninjer tootle", "<i>U a bitch</i><br>");
            specificGreeting(socket, name, "Player 69", "<i>nice</i><br>");
            // specificGreeting(socket, name, "Snowgoat", "<i>There was a bug in World Capitals and your records disappeared from the leaderboard :( Sorry</i><br>");
            // specificGreeting(socket, name, "bumbo", "<i>There was a bug in World Capitals and your records disappeared from the leaderboard :( Sorry</i><br>");
            // specificGreeting(socket, name, "Player 42", "<i>nice</i><br>");
            // specificGreeting(socket, name, "Walter", "<i>Thanks for the feedback!  If you have any ideas for spreading the word besides a post on r/WebGames every 3 months, let me know!  <br>The twine question is surprisingly controversial, but I will add the words 'built by a single person' so that it is accurate and also matches the Weird Al song.</i><br>");
            // specificGreeting(socket, name, "adam", "<i>I was very concerned when you said the Male, Maldives image was \"crazy\".  I thought it was grabbing a random image from the wikipedia page for \"male\".  Did you just mean <a href=https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Male-total.jpg/600px-Male-total.jpg>this image</a> looks crazy?</i><br>");
            // specificGreeting(socket, name, "ecanpecan", "<i>Thanks for pointing that out...</i><br>");
            // specificGreeting(socket, name, "Chrisi", "<i>Hi Chrisi, try using \"n7zc3wsn36\" instead of \"Chrisi\" next time you log in!</i><br>");
            io.sockets.emit('update counts', getHist());

        }
        callback()
    });
    socket.on('announcement', (text) => {
        announce(text);
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
    socket.on('grind', (state) => {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            room.whisperMessage(socket, "<i>Grind mode has been set to <b>" + state + "</b>.  If all players have grind mode enabled, the game will run faster!</i><br>", () => {});
            room.grind(socket);
        }
        io.sockets.emit('grind', socket.id)
    });
    socket.on('bootPlayer', (socketid) => {
        if (playerRooms.has(socketid)) {
            playerRooms.delete(socketid);
        }
        Object.values(rooms).forEach(function(room) {
            if ((room.isPrivate || room.isPublic) && room.playerCount() == 0) {
                delete rooms[room.roomName];
            }
        });
        io.sockets.emit('update counts', getHist());
        io.sockets.emit('update public rooms', getPublicRoomsInfo());
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
            const info = room.exportPlayer(socket);
            if (room.roomName == CONSTANTS.LOBBY) {
                socket.emit('update messages', room.roomName, "<i>Cannot create bot in Lobby!</i><br>");
                return;
            }
            if (room.hasJoe) {
                const bot_msg = "[ " + CONSTANTS.KILL_MSGS[Math.floor(Math.random() * CONSTANTS.KILL_MSGS.length)]
                    .replace('PLAYER', "<font color='" + info['color'] + "'><b>" + info['raw_name'] + "</b></font>")
                    .replace('BOT', "<b>" + room.joe.name + "</b>") + "]<br>";
                io.sockets.emit("update messages", room.roomName, bot_msg);
                helpers.log("Player " + socket.handshake.address + " " + info['name'] + " has killed joe in " + room.roomName);
                room.killJoe()
            } else {
                helpers.log("Player " + socket.handshake.address + " " + info['name'] + " has birthed joe in " + room.roomName);
                let botname = ''
                if (info['perfect'] && info['flair'] == helpers.flairToEmoji(room.citysrc)) {
                    botname = info['raw_name'];
                }
                room.createJoe(botname);
                const bot_msg = "[ " + CONSTANTS.BIRTH_MSGS[Math.floor(Math.random() * CONSTANTS.BIRTH_MSGS.length)]
                    .replace('PLAYER', "<font color='" + info['color'] + "'><b>" + info['raw_name'] + "</b></font>")
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
            var info = rooms[originRoomName].exportPlayer(socket);
            info['moved'] = true;
            var leave_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b> has left " + originRoomName + " and joined " + citysrc + "!</font> ]<br>";
            io.sockets.emit("update messages", originRoomName, leave_msg)
            if (rooms[originRoomName].isPrivate || rooms[originRoomName].isPublic) {
                const newHostId = rooms[originRoomName].transferHostIfNeeded(socket.id);
                if (newHostId !== null) {
                    const newHostPlayer = rooms[originRoomName].players.get(newHostId);
                    const newHostName = newHostPlayer ? newHostPlayer.name : '???';
                    const newHostColor = newHostPlayer ? newHostPlayer.color : '#000';
                    const hostMsg = "[ <i>Room host left. <font color='" + newHostColor + "'><b>" + newHostName + "</b></font> is now the host!</i> ]<br>";
                    rooms[originRoomName].clients.forEach((s) => s.emit('update messages', originRoomName, hostMsg));
                }
            }
            rooms[originRoomName].killPlayer(socket);
            let map = citysrc.replace(" Capitals", "");
            let roomName = citysrc
            // Update hall of fame
            if (roomName === CONSTANTS.LOBBY) {
                famers = helpers.loadHallOfFame();
                rooms[CONSTANTS.LOBBY].hall_of_fame = famers;
            }
            socket.emit('moved to', map, roomName, citysrc, rooms[citysrc].state);
            rooms[roomName].addPlayer(socket, info);
            playerRooms.set(socket.id, rooms[roomName]);
            var join_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b> has joined " + roomName + "!</font> ]<br>";
            io.sockets.emit("update messages", roomName, join_msg);
            io.sockets.emit('update counts', getHist());
            io.sockets.emit('update public rooms', getPublicRoomsInfo());
            rooms[roomName].joeMessage();
        }
        Object.values(rooms).forEach(function(room) {
            if ((room.isPrivate || room.isPublic) && room.playerCount() == 0 && rooms.hasOwnProperty(room.roomName)) {
                delete rooms[room.roomName];
            }
        });
    });
    socket.on('requestPrivatePopup', () => {
        socket.emit('request private popup');
    });
    socket.on('requestBrowsePublic', () => {
        socket.emit('request browse public');
    });

    // Helper shared by createPublicRoom and joinPublicRoom to move a player into a room
    function movePlayerToRoom(info, originRoomName, destRoom) {
        rooms[originRoomName].killPlayer(socket);
        socket.emit('moved to', destRoom.map, destRoom.roomName, destRoom.citysrc, destRoom.state);
        destRoom.addPlayer(socket, info);
        playerRooms.set(socket.id, destRoom);
        // Cleanup after adding to dest so the new room is never deleted
        Object.values(rooms).forEach(function(room) {
            if ((room.isPrivate || room.isPublic) && room.playerCount() == 0 && rooms.hasOwnProperty(room.roomName)) {
                delete rooms[room.roomName];
            }
        });
        io.sockets.emit('update counts', getHist());
        io.sockets.emit('update public rooms', getPublicRoomsInfo());
        destRoom.joeMessage();
    }

    socket.on('createPublicRoom', (askcitysrc, roomLabel) => {
        if (Object.keys(MAPS).indexOf(askcitysrc) === -1) {
            Object.values(rooms).forEach(function(room) {
                if (room.hasPlayer(socket)) room.whisperMessage(socket, "<b>Invalid map: " + askcitysrc + "</b><br>", () => {});
            });
            return;
        }
        if (!playerRooms.has(socket.id)) return;
        const sanitizedLabel = (roomLabel || '').trim().slice(0, 16);
        if (sanitizedLabel) {
            const labelTaken = Object.values(rooms).some(r => r.isPublic && (r.roomLabel === sanitizedLabel || r.roomName === sanitizedLabel));
            if (labelTaken) {
                const originRoom = playerRooms.get(socket.id);
                originRoom.whisperMessage(socket, "<b>A public room named \"" + sanitizedLabel + "\" already exists. Choose a different name.</b><br>", () => {});
                return;
            }
        }
        const originRoomName = playerRooms.get(socket.id).roomName;
        var info = rooms[originRoomName].exportPlayer(socket);
        info['moved'] = true;
        let attempts = 0;
        do { publicRoomCounter++; attempts++; } while (rooms['public_' + (publicRoomCounter % 100)] && attempts < 100);
        const roomId = 'public_' + (publicRoomCounter % 100);
        const map = askcitysrc.replace(" Capitals", "");
        var leave_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b> has left " + originRoomName + " and created a public room!</font> ]<br>";
        io.sockets.emit("update messages", originRoomName, leave_msg);
        // Host transfer from origin if needed
        if (rooms[originRoomName].isPrivate || rooms[originRoomName].isPublic) {
            const newHostId = rooms[originRoomName].transferHostIfNeeded(socket.id);
            if (newHostId !== null) {
                const nhp = rooms[originRoomName].players.get(newHostId);
                const hostMsg = "[ <i>Room host left. <font color='" + (nhp ? nhp.color : '#000') + "'><b>" + (nhp ? nhp.name : '???') + "</b></font> is now the host!</i> ]<br>";
                rooms[originRoomName].clients.forEach((s) => s.emit('update messages', originRoomName, hostMsg));
            }
        }
        rooms[roomId] = new Room(map, roomId, askcitysrc);
        rooms[roomId].hostSocketId = socket.id;
        rooms[roomId].roomLabel = sanitizedLabel;
        var join_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b> has created a public room: <b>" + askcitysrc + "</b>!</font> ]<br>";
        io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg);
        movePlayerToRoom(info, originRoomName, rooms[roomId]);
        rooms[roomId].whisperMessage(socket, "<i>You created this public room and are the host.</i><br>", () => {});
        if (Geography.hasLeader(askcitysrc)) rooms[roomId].whisperMessage(socket, "<i><b>" + MAPS[askcitysrc]["greeting"] + "</b> to the <b>" + askcitysrc + "</b> map!</i><br>", () => {});
        helpers.log("Player " + socket.handshake.address + " " + info['name'] + " created public room " + roomId);
    });

    socket.on('joinPublicRoom', (roomId) => {
        if (!(roomId in rooms) || !rooms[roomId].isPublic) {
            Object.values(rooms).forEach(function(room) {
                if (room.hasPlayer(socket)) room.whisperMessage(socket, "<b>That public room no longer exists.</b><br>", () => {});
            });
            return;
        }
        if (!playerRooms.has(socket.id)) return;
        const originRoomName = playerRooms.get(socket.id).roomName;
        if (originRoomName === roomId) return; // already in this room
        var info = rooms[originRoomName].exportPlayer(socket);
        info['moved'] = true;
        var leave_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b> has left " + originRoomName + " and joined a public room!</font> ]<br>";
        io.sockets.emit("update messages", originRoomName, leave_msg);
        if (rooms[originRoomName].isPrivate || rooms[originRoomName].isPublic) {
            const newHostId = rooms[originRoomName].transferHostIfNeeded(socket.id);
            if (newHostId !== null) {
                const nhp = rooms[originRoomName].players.get(newHostId);
                const hostMsg = "[ <i>Room host left. <font color='" + (nhp ? nhp.color : '#000') + "'><b>" + (nhp ? nhp.name : '???') + "</b></font> is now the host!</i> ]<br>";
                rooms[originRoomName].clients.forEach((s) => s.emit('update messages', originRoomName, hostMsg));
            }
        }
        const destRoom = rooms[roomId];
        const hostPlayer = destRoom.players.get(destRoom.hostSocketId);
        var join_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b> has joined the public room: <b>" + destRoom.citysrc + "</b>!</font> ]<br>";
        io.sockets.emit("update messages", CONSTANTS.LOBBY, join_msg);
        movePlayerToRoom(info, originRoomName, destRoom);
        rooms[roomId].whisperMessage(socket, "<i><b>" + (hostPlayer ? hostPlayer.name : '???') + "</b> is the room host.</i><br>", () => {});
        if (Geography.hasLeader(destRoom.citysrc)) rooms[roomId].whisperMessage(socket, "<i><b>" + MAPS[destRoom.citysrc]["greeting"] + "</b> to the <b>" + destRoom.citysrc + "</b> map!</i><br>", () => {});
        helpers.log("Player " + socket.handshake.address + " " + info['name'] + " joined public room " + roomId);
    });
    socket.on('changePublicRoomMap', (askcitysrc) => {
        if (!playerRooms.has(socket.id)) return;
        const room = playerRooms.get(socket.id);
        if (!room.isPublic) return;
        if (Object.keys(MAPS).indexOf(askcitysrc) === -1) {
            room.whisperMessage(socket, "<b>Invalid map: " + askcitysrc + "</b><br>", () => {});
            return;
        }
        if (room.hostSocketId !== socket.id) {
            const hostPlayer = room.players.get(room.hostSocketId);
            const hostColor = hostPlayer ? hostPlayer.color : '#000';
            const hostName = hostPlayer ? hostPlayer.name : 'the host';
            room.whisperMessage(socket, "<b>Only the room host (<font color='" + hostColor + "'>" + hostName + "</font>) can change the map.</b><br>", () => {});
            return;
        }
        const map = askcitysrc.replace(" Capitals", "");
        const info = room.exportPlayer(socket);
        room.map = map;
        room.citysrc = askcitysrc;
        room.reset();
        const msg = "[ <font color='" + info['color'] + "'><b>" + info['raw_name'] + "</b> changed the map to <b>" + askcitysrc + "</b>!</font> ]<br>";
        room.clients.forEach((s) => s.emit('update messages', room.roomName, msg));
        room.clients.forEach((s) => s.emit('moved to', map, room.roomName, askcitysrc, room.state));
        io.sockets.emit('update public rooms', getPublicRoomsInfo());
        helpers.log("Player " + socket.handshake.address + " " + info['raw_name'] + " changed public room map to " + askcitysrc);
    });
    socket.on('requestHelpPopup', () => {
        socket.emit('request help popup');
    });
    socket.on('moveToPrivate', (askcitysrc, code) => {
        // Check if room exists
        let dest = "private_" + code;
        let exists = (dest in rooms)

        // Verify asked citysrc is valid.
        // When joining an existing room the map comes from the room itself, so we only
        // reject an unrecognized citysrc when creating a new room or changing the map.
        let unrecognized_citysrc = Object.keys(MAPS).indexOf(askcitysrc) === -1
        if (!exists && unrecognized_citysrc) {
            Object.values(rooms).forEach(function(room) {
                if (room.hasPlayer(socket)) {
                    room.whisperMessage(socket, "<b>Not going to private room because your map was invalid: " + askcitysrc + "</b><br>", () => {});
                }
            });
            return
        }

        // Verify code is valid
        let code_valid = code.length >= 1 && code.length <= 5 && /^[a-z0-9]+$/.test(code);
        if (!code_valid) {
            Object.values(rooms).forEach(function(room) {
                if (room.hasPlayer(socket)) {
                    room.whisperMessage(socket, "<b>Not going to private room because your code was invalid: " + code + "</b><br>", () => {});
                }
            });
            return
        }


        // Convert citysrc to the map that it is played on
        let map = askcitysrc.replace(" Capitals", "");

        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            const originRoomName = room.roomName;
            var info = rooms[originRoomName].exportPlayer(socket);
            info['moved'] = true;
            if (originRoomName == dest) {
                // Handle change map — only the room host may do this
                if (unrecognized_citysrc) {
                    room.whisperMessage(socket, "<b>Map change failed: unrecognized map \"" + askcitysrc + "\"</b><br>", () => {});
                    return;
                }
                if (rooms[dest].hostSocketId !== null && rooms[dest].hostSocketId !== socket.id) {
                    const hostPlayer = rooms[dest].players.get(rooms[dest].hostSocketId);
                    const hostName = hostPlayer ? hostPlayer.name : 'the room host';
                    const hostColor = hostPlayer ? hostPlayer.color : '#000';
                    room.whisperMessage(socket, "<b>Only the room host (<font color='" + hostColor + "'>" + hostName + "</font>) can change the map.</b><br>", () => {});
                    return;
                }
                var leave_msg = "[ <font color='" + info['color'] + "'><b>" + info['raw_name'] + "</b> has changed the map to " + askcitysrc + "!</font> ]<br>";
                io.sockets.emit("update messages", originRoomName, leave_msg);
                let citysrc = askcitysrc;
                if (Geography.hasLeader(citysrc)) rooms[dest].whisperMessage(socket, "<i><b>" + MAPS[citysrc]["greeting"] + "</b>! This is the <b>" + citysrc + "</b> map!</i><br>", function() {});
                rooms[dest].map = map;
                rooms[dest].citysrc = citysrc;
                rooms[dest].reset();
                socket.emit('moved to', map, dest, citysrc, rooms[dest].state);
                helpers.log("Player " + socket.handshake.address + " " + info['raw_name'] + " changed map in " + dest);
            } else {
                // Handle join room
                console.log('making private room ' + dest)
                var leave_msg = "[ <font color='" + info['color'] + "'><b>" + info['name'] + "</b> has left " + originRoomName + " and joined a private room!</font> ]<br>";
                io.sockets.emit("update messages", originRoomName, leave_msg)
                // Transfer host before removing player from origin room
                if (rooms[originRoomName].isPrivate || rooms[originRoomName].isPublic) {
                    const newHostId = rooms[originRoomName].transferHostIfNeeded(socket.id);
                    if (newHostId !== null) {
                        const newHostPlayer = rooms[originRoomName].players.get(newHostId);
                        const newHostName = newHostPlayer ? newHostPlayer.name : '???';
                        const newHostColor = newHostPlayer ? newHostPlayer.color : '#000';
                        const hostMsg = "[ <i>Room host left. <font color='" + newHostColor + "'><b>" + newHostName + "</b></font> is now the host!</i> ]<br>";
                        rooms[originRoomName].clients.forEach((s) => s.emit('update messages', originRoomName, hostMsg));
                    }
                }
                rooms[originRoomName].killPlayer(socket);
                Object.values(rooms).forEach(function(room) {
                    if ((room.isPrivate || room.isPublic) && room.playerCount() == 0 && rooms.hasOwnProperty(room.roomName)) {
                        delete rooms[room.roomName];
                    }
                });
                let citysrc = askcitysrc;
                if (!exists) {
                    rooms[dest] = new Room(map, dest, citysrc);
                    rooms[dest].hostSocketId = socket.id;
                } else {
                    map = rooms[dest].map
                    citysrc = rooms[dest].citysrc
                }
                socket.emit('moved to', map, dest, citysrc, rooms[dest].state);
                socket.emit('update messages', dest, PRIVATE_MESSAGE);
                rooms[dest].addPlayer(socket, info);
                playerRooms.set(socket.id, rooms[dest]);
                if (Geography.hasLeader(citysrc)) rooms[dest].whisperMessage(socket, "<i><b>" + MAPS[citysrc]["greeting"] + "</b> to the <b>" + citysrc + "</b> map!</i><br>", function() {});
                // Announce host status
                if (!exists) {
                    rooms[dest].whisperMessage(socket, "<i>You created this room and are the host. Only you can change the map.</i><br>", () => {});
                } else {
                    const hostPlayer = rooms[dest].players.get(rooms[dest].hostSocketId);
                    const hostName = hostPlayer ? hostPlayer.name : '???';
                    rooms[dest].whisperMessage(socket, "<i><b>" + hostName + "</b> is the room host and controls the map.</i><br>", () => {});
                }
                var join_msg = "[ <font color='" + info['color'] + "'><b>" + info['raw_name'] + "</b> has joined " + dest + "!</font> ]<br>";
                io.sockets.emit("update messages", dest, join_msg);
                io.sockets.emit('update counts', getHist());
                io.sockets.emit('update public rooms', getPublicRoomsInfo());
                helpers.log("Player " + socket.handshake.address + " " + info['raw_name'] + " moved to room " + dest);
                rooms[dest].joeMessage();
            }
        }
    });
    socket.on('requestTargetPhoto', (target) => {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            room.drawPhoto(socket, target)
        }
    });
    socket.on('redrawStudy', () => {
        if (playerRooms.has(socket.id)) {
            const room = playerRooms.get(socket.id);
            room.revealStudy()
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
                room.whisperMessage(socket, "<i>You are talking too fast!  Please calm down</i><br>", () => {});
            }
        });
    });
    socket.on("block joe toggle", function() {
        Object.values(rooms).forEach(function(room) {
            if (room.hasPlayer(socket)) {
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
                const info = room.exportPlayer(socket);
                helpers.logMessage("Message passed by " + socket.handshake.address + " " + info['name'] + " " + room.getActiveEntry() + " : " + msg);
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
                    helpers.logFeedback("Message passed by " + socket.handshake.address + " " + info['name'] + ": " + msg);
                } else if (isOptOut) {
                    room.whisperMessage(socket, "<i>Your IP address has been masked.  Thank you for playing the game!  Type /public if you want to opt-in!</i><br>", cb);
                    room.players.get(socket.id).optOut = true;
                } else if (isOptIn) {
                    room.whisperMessage(socket, "<i>Your IP address has been unmasked.  Thank you for playing the game and helping to build up the dataset!</i><br>", cb);
                    room.players.get(socket.id).optOut = false;
                } else if (isAnnounce) {
                    const playerName = info['name'];
                    const playerColor = info['color'];
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
                    const playerName = info['name'];
                    const playerColor = info['color'];
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
    // let reset_imminent = d.getMinutes() % 1 === 0 && d.getSeconds() <= 29;
    // let reset_now = d.getMinutes() % 1 === 0 && d.getSeconds() > 29;

    let reset_imminent = d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() <= 29;
    let reset_now = d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() > 29;
    if (reset_imminent) {
        announce("<font size=9 color=\"red\"><b>WARNING: Daily" + s + " records will reset in 30 seconds! Daily maps will also be changed!</b></font><br>")
    }

    // Get new special
    if (reset_now) {
        let old_special_region = special_region;
        let old_special_capital = special_capital;
        [special_region, special_capital] = calculate_specials();
        let no_reset = []
        // Flush all current rooms and select new specials
        Object.values(rooms).forEach(function(room) {
            if (room.roomName == CONSTANTS.SPECIAL_REGION) {
                room.flushRecords(week, month, year);
                room.killJoe();
                room.map = special_region;
                room.citysrc = special_region;
                room.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
                room.createJoe('');
                room.loadRecords();
            } else if (room.roomName == CONSTANTS.SPECIAL_CAPITAL) {
                room.flushRecords(week, month, year);
                room.killJoe();
                room.map = special_capital.replace(" Capitals", "");
                room.citysrc = special_capital;
                room.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
                room.createJoe('');
                room.loadRecords();
            } else {
                room.flushRecords(week, month, year);
            }
            if (room.isPrivate) {
                no_reset.push(room.citysrc)
            }
        });
        // Make a room for each map temporarily, to reset those records in case no one is in them right now
        // Delaying in case there is an io issue
        helpers.sleep(1000)
        Object.keys(MAPS).forEach(function(value) {
            if (value != old_special_region && value != old_special_capital && MAPS[value]['tier'] != "continent" && value != CONSTANTS.TRIVIA && no_reset.includes(value)) {
                let map = value.replace(" Capitals", "");
                let tmp_room = new Room(map, "tmp", value)
                tmp_room.flushRecords(week, month, year);
                delete tmp_room;
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