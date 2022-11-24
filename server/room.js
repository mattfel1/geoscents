/**
 * Class for managing the game flow within a room.
 * // TODO: Currently entire game has one room, but the plan is to have multiple rooms to choose from with player caps
 */

const CONSTANTS = require('../resources/constants.js');
const Geography = require('./geography.js');
const Player = require('./player.js');
const helpers = require('../resources/helpers.js');
const fs = require('fs')
const fetch = require("node-fetch");
const app = require('./app.js')
const MAPS = require('../resources/maps.json')


class Room {
    constructor(map, roomName, citysrc) {
        this.map = map; // Underlying map ("Ukraine" or "World")
        this.roomName = roomName; // User-friendly room name ("Weekly Country" or "Trivia")
        this.citysrc = citysrc; // source for random city selection ("Ukraine" or "Trivia")
        this.isPrivate = roomName.startsWith('private');
        this.joeTime = 10;
        this.joeLat = 0;
        this.joeLon = 0;
        // Map from socketID -> socket object
        this.clients = new Map();
        // Map from socketID -> player
        this.players = new Map();
        this.playersHistory = new Map();
        this.ordinalCounter = 0;
        this.timer = CONSTANTS.GUESS_DURATION;
        this.target = {
            'city': '',
            'country': '',
            'capital': ''
        };
        this.playedCities = {};
        this.state = CONSTANTS.IDLE_STATE;
        this.round = 0;
        this.winner = null;
        this.blacklist = []; // List of countries or states to avoid drawing for this round
        this.played_targets = []; // List of actual targets this game
        this.timerColor = CONSTANTS.LOBBY_COLOR;
        this.lastRecordUpdate = new Date().getTime();
        this.serviceRecord = false;
        this.dayRecord;
        this.weekRecord;
        this.monthRecord;
        this.allRecord;
        this.loadRecords();
        this.createJoe('');
        this.hasJoe = roomName != CONSTANTS.LOBBY && !CONSTANTS.DEBUG_MODE;
        this.recorded = false; // Toggle for making sure we only record once per reveal_state
        this.hall_of_fame; // Keep hall of fame in-memory if this is the lobby
        this.gameHistory = [];
    }


    syncRecords(timestamp, day, week, month, all) {
        this.dayRecord = day;
        this.weekRecord = week;
        this.monthRecord = month;
        this.allRecord = all;
        this.lastRecordUpdate = timestamp;
    }
    createJoe(botname) {
        let name = CONSTANTS.AVERAGE_NAMES[Math.floor(Math.random() * CONSTANTS.AVERAGE_NAMES.length)]
        // console.log("create joe in " + this.map + " idx " + CONSTANTS.SPECIALS.has(this.map))
        if (this.citysrc != CONSTANTS.LOBBY && Geography.hasLeader(this.citysrc))
            name = MAPS[this.citysrc]["leader"]
        if (botname !== '')
            name = botname;
        const avg_name = "Average " + name;
        this.joe = new Player(this.roomName + "_joe", 0, this.map, this.ordinalCounter, this.ordinalCounter, avg_name, {
            'moved': true,
            'color': 'black',
            'wins': 0,
            'flair': '',
            'raw_name': avg_name,
            'optOut': true,
            'grind': false,
            'perfect': false,
            'clown': ''
        });
        this.hasJoe = true;
        this.sortPlayers();
        this.drawScorePanel();
        this.clients.forEach(function(socket, socketId) {
            socket.emit("update joe button", true)
        });
        const roomName = this.roomName;
        const joeName = this.joe.name;
        this.clients.forEach(function(s, id) {
            s.emit('update messages', roomName, '[ ' + roomName + ' <b>' + joeName +
                '</b> ]: Hello!  I am just an ' + joeName + '!  I click at the average location at the average time across all players who have played this game! You can turn me off by clicking the "Kill Bot" button on the top right.<br>');
        });
    }
    joeGood(socket) {
        const name = this.exportPlayer(socket)['name'];
        const color = this.exportPlayer(socket)['color'];
        const roomName = this.roomName;
        const joeName = this.joe.name;
        this.clients.forEach(function(s, id) {
            s.emit('update messages', roomName, '[ ' + roomName + ' <b>' + joeName +
                '</b> ]: Aww, thanks, <b><font color="' + color + '">' + name + '</font></b>!  :D<br>');
        });
    }
    joeBad(socket) {
        const name = this.exportPlayer(socket)['name'];
        const color = this.exportPlayer(socket)['color'];
        const roomName = this.roomName;
        const joeName = this.joe.name;
        this.clients.forEach(function(s, id) {
            s.emit('update messages', roomName, '[ ' + roomName + ' <b>' + joeName +
                '</b> ]: Oh no, sorry for being a bad bot, <b><font color="' + color + '">' + name + '</font></b>!  D:<br>');
        });
    }
    joeGG(socket) {
        const name = this.exportPlayer(socket)['name'];
        const color = this.exportPlayer(socket)['color'];
        const roomName = this.roomName;
        const joeName = this.joe.name;
        this.clients.forEach(function(s, id) {
            s.emit('update messages', roomName, '[ ' + roomName + ' <b>' + joeName +
                '</b> ]: Good game, <b><font color="' + color + '">' + name + '</font></b>!  You did well!<br>');
        });
    }
    joeYeet(socket) {
        const name = this.exportPlayer(socket)['name'];
        const color = this.exportPlayer(socket)['color'];
        const roomName = this.roomName;
        const joeName = this.joe.name;
        this.clients.forEach(function(s, id) {
            s.emit('update messages', roomName, '[ ' + roomName + ' <b>' + joeName +
                '</b> ]: YEEEEEET!<br>');
        });
    }
    killJoe() {
        this.hasJoe = false;
        this.sortPlayers();
        this.drawScorePanel();
        this.clients.forEach(function(socket, socketId) {
            socket.emit("update joe button", false)
        });
    }
    flushRecords(week, month, year) {
        function copy(x) {
            return JSON.parse(JSON.stringify(x, null, 2));
        }
        if (!this.hasJoe && this.map !== CONSTANTS.LOBBY) this.createJoe('')
        this.dayRecord = CONSTANTS.INIT_RECORD;
        if (week) this.weekRecord = CONSTANTS.INIT_RECORD;
        if (month) this.monthRecord = CONSTANTS.INIT_RECORD;
        if (year) this.allRecord = CONSTANTS.INIT_RECORD;
        fs.writeFile("/scratch/records/" + this.citysrc + "_day_record", JSON.stringify(copy(this.dayRecord), null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
        });
        fs.writeFile("/scratch/records/" + this.citysrc + "_week_record", JSON.stringify(copy(this.weekRecord), null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
        });
        fs.writeFile("/scratch/records/" + this.citysrc + "_month_record", JSON.stringify(copy(this.monthRecord), null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
        });
        fs.writeFile("/scratch/records/" + this.citysrc + "_year_record", JSON.stringify(copy(this.allRecord), null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
        });
        this.drawScorePanel();
    }
    loadRecords() {
        if (fs.existsSync('/scratch/records/' + this.citysrc + '_day_record')) {
            try {
                this.dayRecord = JSON.parse(fs.readFileSync('/scratch/records/' + this.citysrc + '_day_record', 'utf8'));
            } catch (err) {
                this.dayRecord = CONSTANTS.INIT_RECORD;
            }
        } else {
            this.dayRecord = CONSTANTS.INIT_RECORD;
        }
        if (fs.existsSync('/scratch/records/' + this.citysrc + '_week_record')) {
            try {
                this.weekRecord = JSON.parse(fs.readFileSync('/scratch/records/' + this.citysrc + '_week_record', 'utf8'));
            } catch (err) {
                this.weekRecord = CONSTANTS.INIT_RECORD;
            }
        } else {
            this.weekRecord = CONSTANTS.INIT_RECORD;
        }
        if (fs.existsSync('/scratch/records/' + this.citysrc + '_month_record')) {
            try {
                this.monthRecord = JSON.parse(fs.readFileSync('/scratch/records/' + this.citysrc + '_month_record', 'utf8'));
            } catch (err) {
                this.monthRecord = CONSTANTS.INIT_RECORD;
            }
        } else {
            this.monthRecord = CONSTANTS.INIT_RECORD;
        }
        if (fs.existsSync('/scratch/records/' + this.citysrc + '_year_record')) {
            try {
                this.allRecord = JSON.parse(fs.readFileSync('/scratch/records/' + this.citysrc + '_year_record', 'utf8'));
            } catch (err) {
                this.allRecord = CONSTANTS.INIT_RECORD;
            }
        } else {
            this.allRecord = CONSTANTS.INIT_RECORD;
        }
    }
    reset() {
        this.state = CONSTANTS.IDLE_STATE;
        this.killJoe();
        this.loadRecords();
        this.drawScorePanel();
        if (!this.hasJoe)
            this.createJoe('');
    }
    // Player count
    playerCount() {
        return Array.from(this.players.values()).filter(player => player.choseName).length;
    }
    // Player basic IO
    addPlayer(socket, info) {
        const player = new Player(socket.id, this.players.size, this.map, socket.handshake.address, this.ordinalCounter, "Player " + this.ordinalCounter % 100, info);
        this.clients.set(socket.id, socket);
        this.players.set(socket.id, player);
        this.ordinalCounter = this.ordinalCounter + 1;
        this.sortPlayers();
        this.drawScorePanel(socket.id);
        socket.emit('fresh map', this.map);
        socket.emit('update joe button', this.hasJoe);
        this.drawCommand(socket);
    }

    joeMessage() {
        if (this.players.size === 1 && this.hasJoe) {
            const roomName = this.roomName;
            const joeName = this.joe.name;
            this.clients.forEach(function(s, id) {
                s.emit('update messages', roomName, '[ ' + roomName + ' <b>' + joeName +
                    '</b> ]: Hello!  I am just an ' + joeName + '!  I click at the average location at the average time across all players who have played this game! You can turn me off by clicking the "Kill Bot" button on the top right.<br>');
            });
        }
    }

    redrawMap(socket) {
        this.drawCommand(socket);
    }

    hasPlayer(socket) {
        return this.clients.has(socket.id) && this.players.has(socket.id)
    }

    getPlayerByName(name) {
        const candidates = Array.from(this.players).find(([, pn]) => pn.name === name);
        if (candidates != null && candidates.length > 0) {
            const socket = candidates[0];
            if (this.clients.has(socket)) return this.clients.get(socket);
            else return null;
        } else return null;
    }

    renamePlayer(socket, name, color, logger, hash, public_hash, flair, grind, perfect, clown) {
        if (this.players.has(socket.id)) {
            if (name !== '') this.players.get(socket.id).name = name;
            if (color !== 'random') this.players.get(socket.id).color = color;
            if (logger == 'No') this.players.get(socket.id).logger = false
            if (hash !== '') this.players.get(socket.id).hash = hash;
            if (public_hash !== '') this.players.get(socket.id).public_hash = public_hash;
            if (flair !== '') this.players.get(socket.id).flair = flair;
            if (clown !== '') this.players.get(socket.id).clown = clown;
            this.players.get(socket.id).perfect = perfect
            this.players.get(socket.id).grind = grind
            this.players.get(socket.id).choseName = true;
        }
        this.drawScorePanel(socket.id);
        socket.emit('fresh map', this.map);
    }

    flairPlayer(socket, name, flair) {
        if (this.players.has(socket.id)) {
            if (name !== '') this.players.get(socket.id).name = name;
            if (flair !== '') this.players.get(socket.id).flair = flair;
            this.players.get(socket.id).choseName = true;
        }
    }

    playerChoseName(socket) {
        return this.players.has(socket.id) && this.players.get(socket.id).choseName;
    }
    exportPlayer(socket) {
        var oldColor = '#000000';
        var oldLogger = false;
        var oldRawName = socket.id.substring(5, 0);
        var oldName = socket.id.substring(5, 0);
        var oldWins = 0;
        var oldOptOut = false;
        var oldHash = '';
        var oldPublicHash = '';
        var oldFlair = '';
        var oldGrind = false;
        var oldPerfect = false;
        var oldClown = '';
        if (this.players.has(socket.id)) {
            oldColor = this.players.get(socket.id).color
            oldLogger = this.players.get(socket.id).logger;
            oldName = this.players.get(socket.id).getName();
            oldRawName = this.players.get(socket.id).name;
            oldWins = this.players.get(socket.id).wins;
            oldOptOut = this.players.get(socket.id).optOut;
            oldHash = this.players.get(socket.id).hash;
            oldPublicHash = this.players.get(socket.id).public_hash;
            oldFlair = this.players.get(socket.id).flair;
            oldGrind = this.players.get(socket.id).grind;
            oldPerfect = this.players.get(socket.id).perfect;
            oldClown = this.players.get(socket.id).clown;
        }
        const info = {
            'color': oldColor,
            'raw_name': oldRawName,
            'name': oldName,
            'wins': oldWins,
            'logger': oldLogger,
            'hash': oldHash,
            'public_hash': oldPublicHash,
            'flair': oldFlair,
            'grind': oldGrind,
            'optOut': oldOptOut,
            'perfect': oldPerfect,
            'clown': oldClown
        }
        return info;
    }

    gameActive() {
        return this.state == CONSTANTS.GUESS_STATE ||
            this.state == CONSTANTS.REVEAL_STATE;
    }
    gameBeginning() {
        return this.state == CONSTANTS.BEGIN_GAME_STATE;
    }
    killPlayer(socket) {
        // console.log('user disconnected ' + socket.id);
        if (this.clients.has(socket.id)) {
            this.clients.delete(socket.id);
        }
        if (this.players.has(socket.id)) {
            this.players.get(socket.id).reset();
            this.players.delete(socket.id);
        }
        this.sortPlayers();
        this.drawScorePanel(socket.id);
    }

    bootPlayer(socket) {
        console.log('user booted ' + socket.id);

        if (this.clients.has(socket.id)) {
            this.clients.delete(socket.id);
        }
        if (this.players.has(socket.id)) {
            const player = this.players.get(socket.id);
            const color = player.color;
            const name = player.name;
            const room = this.roomName;
            const boot_msg = "[ <font color='" + color + "'><b>" + name + "</b> has been booted due to inactivity!</font> ]<br>";
            this.players.delete(socket.id);
            this.clients.forEach(function(s, id) {
                s.emit('update messages', room, boot_msg)
            });
            socket.emit('request boot', socket.id);
        }
        this.sortPlayers();
        this.drawScorePanel(socket.id);
    }

    playerReady(socket) {
        if (this.players.has(socket.id) && !this.gameBeginning()) {
            const player = this.players.get(socket.id);
            player.ready = '✔';
        }
        this.drawScorePanel();
    }

    playerReboot(socket) {
        if (this.players.has(socket.id) && this.gameActive()) {
            const player = this.players.get(socket.id);
            player.reboot = '⏻';
        }
        this.drawScorePanel();
    }

    grind(socket) {
        if (this.players.has(socket.id)) {
            const player = this.players.get(socket.id);
            player.grind = !player.grind;
        }
        this.drawScorePanel();
    }

    playerClicked(socket, playerClick) {
        if (this.players.has(socket.id) || socket == this.joe.id) {
            let player;
            if (socket == this.joe.id) player = this.joe;
            else player = this.players.get(socket.id);
            if (socket == this.joe.id || (playerClick.downCount < CONSTANTS.SCROLL_THRESHOLD && playerClick.mouseDown && this.state === CONSTANTS.GUESS_STATE && !player.clicked)) {
                if (socket == this.joe.id || (playerClick.cursorX < CONSTANTS.MAP_WIDTH && playerClick.cursorY < CONSTANTS.MAP_HEIGHT)) {
                    player.clicked = true;
                    player.consecutiveRoundsInactive = 0;
                    player.row = playerClick.cursorY;
                    player.col = playerClick.cursorX;
                    // console.log("player clicked at time " + this.timer)
                    player.clickedAt = this.timer;
                    const geo = Geography.pixelToGeo(this.map, player.row, player.col);
                    player.lat = geo['lat'];
                    player.lon = geo['lng'];
                    // console.log('click at ' + player.row + ',' + player.col + ' (' + player.lat + ',' + player.lon + ')')
                    if (socket != this.joe.id) socket.emit('draw point', {
                        'row': player.row,
                        'col': player.col
                    }, player.color, player.radius())
                }
            }
        }
    }

    insertRecord(position, category, olddict, room, player) {
        function copy(x) {
            return JSON.parse(JSON.stringify(x, null, 2));
        }
        const num_records = 5
        const dict = copy(olddict);
        let i;
        for (i = num_records; i > position; i--) {
            if (('record' + (i - 1)) in dict) {
                dict['record' + i] = copy(dict['record' + (i - 1)]);
                dict['recordColor' + i] = copy(dict['recordColor' + (i - 1)]);
                dict['recordName' + i] = copy(dict['recordName' + (i - 1)]);
                dict['recordBroken' + i] = false;
            }
        }
        dict['record' + position] = copy(player.score);
        dict['recordColor' + position] = copy(player.color);
        let display_name = player.getFlairedName();
        dict['recordName' + position] = copy(display_name);
        dict['recordBroken' + position] = true;
        // fs.writeFile("/scratch/" + room + "_" + category + "_record", JSON.stringify(dict), function(err) {
        //     if(err) {
        //         return console.log(err);
        //     }
        // });
        return copy(dict);
    }

    getPosition(score, category) {
        if (score > category['record1']) return 1;
        else if (score > category['record2']) return 2;
        else if (score > category['record3']) return 3;
        else if (score > category['record4'] || !('record4' in category)) return 4;
        else if (score > category['record5'] || !('record5' in category)) return 5;
        else return 6;
    }

    removePoppers() {
        this.allRecord['recordBroken1'] = false;
        this.allRecord['recordBroken2'] = false;
        this.allRecord['recordBroken3'] = false;
        this.allRecord['recordBroken4'] = false;
        this.allRecord['recordBroken5'] = false;
        this.monthRecord['recordBroken1'] = false;
        this.monthRecord['recordBroken2'] = false;
        this.monthRecord['recordBroken3'] = false;
        this.monthRecord['recordBroken4'] = false;
        this.monthRecord['recordBroken5'] = false;
        this.weekRecord['recordBroken1'] = false;
        this.weekRecord['recordBroken2'] = false;
        this.weekRecord['recordBroken3'] = false;
        this.weekRecord['recordBroken4'] = false;
        this.weekRecord['recordBroken5'] = false;
        this.dayRecord['recordBroken1'] = false;
        this.dayRecord['recordBroken2'] = false;
        this.dayRecord['recordBroken3'] = false;
        this.dayRecord['recordBroken4'] = false;
        this.dayRecord['recordBroken5'] = false;
    }

    clearStudyPoints() {
        this.clients.forEach((socket, id) => {
            socket.emit("clear study points")
        });
    }

    getActiveEntry() {
        try {
            return Geography.stringifyTarget(this.target, this.citysrc).string;
        } catch (err) {
            return "Unknown"
        }
    }

    appendActivity(update) {
        // TODO: update activity log json for display in lobby
    }

    playedAllRounds(data, socketid) {
        const playersHistory = new Map(JSON.parse(data));
        let play_count = 0;

        playersHistory.forEach((hist, player) => {
            if (socketid == player.id) {
                Object.keys(hist).forEach((round) => {
                    let datapoint = hist[round];
                    if (datapoint['time'] > 0)
                        play_count = play_count + 1
                })
            }
        });
        let rounds = CONSTANTS.GAME_ROUNDS;
        if (CONSTANTS.DEBUG_MODE)
            rounds = CONSTANTS.DEBUG_GAME_ROUNDS;

        return play_count == rounds;
    }

    recordsBroken() {
        function copy(x) {
            return JSON.parse(JSON.stringify(x, null, 2));
        }


        let dayRecord = copy(this.dayRecord);
        let weekRecord = copy(this.weekRecord);
        let monthRecord = copy(this.monthRecord);
        let allRecord = copy(this.allRecord);
        const lastRecordUpdate = (t) => {
            this.lastRecordUpdate = t;
            this.serviceRecord = true
        };
        const getPosition = (score, category) => {
            return this.getPosition(score, category)
        };
        const insertRecord = (p, c, d, r, pl) => {
            return this.insertRecord(p, c, d, r, pl)
        };
        const playedAllRounds = (data, socketid) => {
            return this.playedAllRounds(data, socketid)
        }
        const sufx = ["st", "nd", "rd", "th", "th"];
        const citysrc = this.citysrc;
        Array.from(this.sortPlayersNoJoe()).forEach((player, id) => {
            // var sortedPlayers = Array.from(this.sortPlayersNoJoe());
            // for (let player of sortedPlayers) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const date = new Date();
            const utcDate = new Date(date.toUTCString());
            // utcDate.setHours(utcDate.getHours()-8); // PST
            const time = new Date(utcDate);
            const month = monthNames[time.getMonth()];
            const day = time.getDate();
            const hour = time.getHours();
            const minute = time.getMinutes();
            let famescore = CONSTANTS.FAMESCORE;
            if (CONSTANTS.DEBUG_MODE)
                famescore = CONSTANTS.DEBUGFAMESCORE
            if (player.score >= famescore) {
                const payload = "- " + month + day + ": <font color=" + player.color + "><b>" + player.name + "</b></font> scored <b>" + player.score + "</b> on " + citysrc;
                if (player.hash == "" || typeof player.hash === 'undefined') {
                    player.hash = helpers.randstring(10)
                    // If they don't yet have a hash, they definitely don't have a public_hash either
                    player.public_hash = helpers.randstring(10)
                }
                this.clients.get(player.id).emit("announce hall", citysrc, player.name, player.score, player.color);
                this.whisperMessage(player, "<br><i>Your PRIVATE username is <b>" + player.hash + "</b>.  Please rejoin the game any time using this name and you can select a flair for this achievement, and you can collect more!  If you forget this hash, you can leave log /feedback with your name and email, or you can ask on discord.  If multiple users are using your current display name, then your unique public identifier is <b>" + player.public_hash + "</b></i><br><br>", () => {})
            }
            if (player.score > 0 && player.score < CONSTANTS.CLOWNSCORE) {
                const playersHistory = JSON.stringify([...this.playersHistory.entries()], null, 2);
                if (playedAllRounds(playersHistory, player.id)) {
                    player.clown = '🤡';
                    helpers.logMessage("Player " + player.name + " has been awarded the clown hat in room " + citysrc + "!");
                    this.clients.get(player.id).emit("announce clown", citysrc, player.getName(), player.score, player.color);
                }
            }
            const num_records = 5
            let allStr = "";
            let monStr = "";
            let wkStr = "";
            let dayStr = "";
            let categories = [];
            if (getPosition(player.score, dayRecord) <= num_records) {
                dayStr = "<b>" + (getPosition(player.score, dayRecord)) + sufx[(getPosition(player.score, dayRecord) - 1)] + "</b>" + " daily"
                dayRecord = copy(insertRecord(getPosition(player.score, dayRecord), "day", copy(dayRecord), citysrc, player));
                categories.push("<b>daily</b>");
            }
            if (getPosition(player.score, weekRecord) <= num_records) {
                wkStr = "<b>" + (getPosition(player.score, weekRecord)) + sufx[(getPosition(player.score, weekRecord) - 1)] + "</b>" + " weekly"
                weekRecord = copy(insertRecord(getPosition(player.score, weekRecord), "week", copy(weekRecord), citysrc, player));
                categories.push("<b>weekly</b>");
            }
            if (getPosition(player.score, monthRecord) <= num_records) {
                monStr = "<b>" + (getPosition(player.score, monthRecord)) + sufx[(getPosition(player.score, monthRecord) - 1)] + "</b>" + " monthly"
                monthRecord = copy(insertRecord(getPosition(player.score, monthRecord), "month", copy(monthRecord), citysrc, player));
                categories.push("<b>monthly</b>");
            }
            if (getPosition(player.score, allRecord) <= num_records) {
                allStr = "<b>" + (getPosition(player.score, allRecord)) + sufx[(getPosition(player.score, allRecord) - 1)] + "</b>" + " yearly"
                allRecord = copy(insertRecord(getPosition(player.score, allRecord), "yearly", copy(allRecord), citysrc, player));
                categories.push("<b>yearly</b>");
            }
            if (categories.length > 0 && this.clients.has(player.id)) {
                this.clients.get(player.id).emit("announce record", categories.join(", "), citysrc, player.getFlairedName(), player.score, player.color);
            }

            // Javascript is trash.. I can't figure out how to stop later record holders from swamping earlier ones, with every combination of for loop, async, await, etc.
            // So I just update the json at the very end with a different delay for each player.  This sucks but should be good enough and invisible to the user
            if (player.score >= famescore) {
                const playersHistory = JSON.stringify([...this.playersHistory.entries()], null, 2);
                let rounds = CONSTANTS.GAME_ROUNDS;
                if (CONSTANTS.DEBUG_MODE)
                    rounds = CONSTANTS.DEBUG_GAME_ROUNDS;
                let path_str = helpers.formatPath(playersHistory, rounds, player.color, player.id, citysrc, player.score)

                const delay = id * 500
                helpers.insertHallOfFame(player.hash, player.public_hash, player.name, citysrc, path_str, player.score, player.color, delay)
            }
        })
        fs.writeFile("/scratch/records/" + citysrc + "_day_record", JSON.stringify(copy(dayRecord), null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
        });
        fs.writeFile("/scratch/records/" + citysrc + "_week_record", JSON.stringify(copy(weekRecord), null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
        });
        fs.writeFile("/scratch/records/" + citysrc + "_month_record", JSON.stringify(copy(monthRecord), null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
        });
        fs.writeFile("/scratch/records/" + citysrc + "_year_record", JSON.stringify(copy(allRecord), null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
        });
        console.log("writing record to " + "/scratch/records/" + citysrc + "_day_record")
        this.dayRecord = copy(dayRecord);
        this.weekRecord = copy(weekRecord);
        this.monthRecord = copy(monthRecord);
        this.allRecord = copy(allRecord);

    }

    printScoresWithSelf(socket, socketId) {
        if (this.map !== CONSTANTS.LOBBY) {
            socket.emit('post group', 'Yearly Records:', this.allRecord);
            socket.emit('post group', 'Monthly Records:', this.monthRecord);
            socket.emit('post group', 'Weekly Records:', this.weekRecord);
            socket.emit('post group', 'Daily Records:', this.dayRecord);
            socket.emit('post score title', this.citysrc);
        } else {
            socket.emit('post lobby', helpers.hallJsonToBoard(this.hall_of_fame));
        }
        const sortedPlayers = this.sortPlayers();
        Array.from(sortedPlayers.values()).forEach(function(player, index) {
            let you = '';
            if (player.id === socketId) {
                you = '*';
            }
            if (player.choseName) socket.emit('post score', player.rank, you + player.getName(), player.color, player.score, player.wins);
        })
    }

    decrementTimer() {
        this.timer = this.timer - 1 / CONSTANTS.FPS
    }

    updateHistory(player, round, net, diff, time, dist, target, error_unit) {
        let datapoint = {
            'total_points': net,
            'round_points': diff,
            'time': time,
            'dist': dist,
            'error_unit': error_unit,
            'target': target
        }
        if (this.playersHistory.has(player)) {
            var dict = this.playersHistory.get(player);
            dict[round] = datapoint;
            this.playersHistory.set(player, dict)
        } else {
            var dict = {};
            dict[round] = datapoint;
            this.playersHistory.set(player, dict)
        }
    }
    updateScores() {
        function copy(x) {
            return JSON.parse(JSON.stringify(x, null, 2));
        }
        const target = this.target;
        const map = this.map;
        const round = this.round;
        const updateHistory = (p, r, net, diff, t, d, targ, erunit) => this.updateHistory(p, r, net, diff, t, d, targ, erunit);
        const historyScore = (player, payload) => {
            this.historyScore(player, payload)
        };
        let playersToScore = Array.from(this.players.values());
        if (this.hasJoe)
            playersToScore.push(this.joe);
        Array.from(playersToScore).forEach(function(player) {
            const merc = Geography.geoToPixel(map, parseFloat(target['lat']), parseFloat(target['lng']));
            player.geoError = Geography.calcGeoDist(player.lat, player.lon, parseFloat(target['lat']), parseFloat(target['lng']));
            player.mercError = Geography.mercDist(map, player.row, player.col, merc['row'], merc['col']);
            if (!player.clicked || isNaN(player.mercError)) {
                player.mercError = 9999;
                player.geoError = 999999;
            }
            const update = Geography.score(map, player.geoError, player.mercError, player.clickedAt);
            const newScore = Math.floor(player.score + update);
            let points = Math.floor(update);
            var dist;
            var error_unit;
            if (player.geoError > 10) {
                dist = Math.floor(player.geoError)
                error_unit = "km"
            } else {
                dist = Math.floor(player.geoError * 1000)
                error_unit = "m";
            }
            let clicktime = Math.floor(player.clickedAt * 10) / 10;
            let points_str = ("Points: <b>" + points.toString() + "</b>").padEnd(19).replace(/\s/g, "&nbsp;");
            let dist_str = ("Error (" + error_unit + "): <b>" + dist.toString() + "</b>").padEnd(26).replace(/\s/g, "&nbsp;");
            let time_str = ("Seconds Remaining: <b>" + clicktime.toString() + "</b>").padEnd(34).replace(/\s/g, "&nbsp;");
            let playerScoreLine = points_str + dist_str + time_str
            if (player.geoError === 999999) {
                playerScoreLine = " (Did not guess)";
            }
            playerScoreLine = playerScoreLine
            historyScore(player, playerScoreLine);
            player.score = newScore;
            updateHistory(player, round, newScore, points, clicktime, dist, target, error_unit);
        });
        this.historyRound(this.round + 1, Geography.stringifyTarget(this.target, this.citysrc));
        this.gameHistory.push(this.target)
    }

    recordGuesses() {
        const respectOptOut = (x) => {
            if (x.optOut) return 'optOut' + x.ip;
            else return x.ip;
        };
        let map = this.map;
        // Stick ukraine, or any special maps, into world data for now because laziness
        if (map == CONSTANTS.SPECIAL)
            map = CONSTANTS.WORLD
        const dists = Array.from(this.players.values()).filter(player => player.clicked).map(x => x.geoError);
        const lats = Array.from(this.players.values()).filter(player => player.clicked).map(x => x.lat);
        const lons = Array.from(this.players.values()).filter(player => player.clicked).map(x => x.lon);
        const times = Array.from(this.players.values()).filter(player => player.clicked).map(x => x.clickedAt);
        const ips = Array.from(this.players.values()).filter(player => player.clicked).map(x => respectOptOut(x))
        // helpers.recordGuesses(this.map, Geography.stringifyTarget(this.target).string, this.target['city'], this.target['admin_name'], this.target['country'], this.target['iso2'], ips, dists, times, lats, lons, this.target['lat'], this.target['lng'], helpers.makeLink(map, this.target), true);
        helpers.recordGuesses(this.map, Geography.stringifyTarget(this.target, this.citysrc).string, this.target['city'], this.target['admin_name'], this.target['country'], this.target['iso2'], ips, dists, times, lats, lons, this.target['lat'], this.target['lng'], helpers.makeLink(map, this.target), false);
    }

    flushGuesses() {
        helpers.flushGuesses(this.map)
    }

    static broadcastPoint(socket, row, col, color, radius, distance) {
        if (distance < 999999) {
            socket.emit('draw point', {
                'row': row,
                'col': col
            }, color, radius)
            socket.emit('draw dist', {
                'row': row,
                'col': col
            }, color, distance)
        }
    }
    static broadcastJoe(socket, joe) {
        socket.emit('draw point', {
            'row': joe.row,
            'col': joe.col
        }, joe.color, joe.radius());
        socket.emit('draw dist', {
            'row': joe.row,
            'col': joe.col
        }, joe.color, joe.geoError);
    }

    static broadcastAnswer(socket, row, col) {
        // this.clients.forEach(function(s,id) {
        socket.emit('draw answer', {
            'row': row,
            'col': col
        })
        // });
    }

    revealAll(socket) {
        const answer = Geography.geoToPixel(this.map, this.target['lat'], this.target['lng']);
        this.players.forEach((player, id) => {
            Room.broadcastPoint(socket, player.row, player.col, player.color, player.radius(), player.geoError);
        });
        if (this.hasJoe) Room.broadcastJoe(socket, this.joe)
        Room.broadcastAnswer(socket, answer['row'], answer['col']);
    }

    drawPhoto(socket, curtarget) {
        const answer = Geography.geoToPixel(this.map, curtarget['lat'], curtarget['lng']);
        if ('img_link' in curtarget) {
            socket.emit('draw photo', {
                'row': answer['row'],
                'col': answer['col']
            }, curtarget['img_link'])
            return
        }


        // Try once with country
        let part2 = "%2C+" + curtarget['country'];
        if (curtarget['country'] === "USA" || curtarget['country'] === "United States") part2 = "%2C+" + curtarget['admin_name'];
        var url = "https://en.wikipedia.org/w/api.php?";
        var title = (curtarget['city_ascii'] + part2).split(' ').join('_');
        if ('wiki' in curtarget && curtarget['wiki'] != "") {
            let link = curtarget['wiki']
            let parts = link.split('/')
            title = parts[parts.length - 1].split('#')[0]
        }
        title = title.replace('’', '')
        // TODO: THIS QUERY DOESN'T ALWAYS GET INFOBOX IMAGE.. SO ANNOYING
        var params = {
            action: "query",
            prop: "pageimages",
            // pageids: id,
            titles: title,
            format: "json",
            pithumbsize: 600,
            redirects: ""
        };
        Object.keys(params).forEach(function(key) {
            url += "&" + key + "=" + params[key];
        });
        let target = curtarget
        // console.log(url)
        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(response) {
                var done = false
                var pages = response.query.pages;
                Object.keys(pages).forEach(function(key, _) {
                    if (pages[key].hasOwnProperty('thumbnail')) {
                        if (pages[key]['thumbnail'].hasOwnProperty('source')) {
                            socket.emit('draw photo', {
                                'row': answer['row'],
                                'col': answer['col']
                            }, pages[key]['thumbnail']['source'])
                            done = true
                        }
                    }
                })

                if (done == true)
                    return

                // Try again without country
                let part2 = "";
                if (target['country'] === "USA" || target['country'] === "United States") part2 = "%2C+" + target['admin_name'];
                let url = "https://en.wikipedia.org/w/api.php?";
                let params = {
                    action: "query",
                    prop: "pageimages",
                    // pageids: id,
                    titles: (target['city_ascii'] + part2).split(' ').join('_'),
                    format: "json",
                    pithumbsize: 800,
                    redirects: ""
                };
                Object.keys(params).forEach(function(key) {
                    url += "&" + key + "=" + params[key];
                });
                // console.log(url)
                fetch(url)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(response) {
                        var pages = response.query.pages;
                        Object.keys(pages).forEach(function(key, _) {
                            if (pages[key].hasOwnProperty('thumbnail')) {
                                if (pages[key]['thumbnail'].hasOwnProperty('source')) {
                                    socket.emit('draw photo', {
                                        'row': answer['row'],
                                        'col': answer['col']
                                    }, pages[key]['thumbnail']['source'])
                                }
                            }
                        })
                    })
                    .catch(function(error) {
                        // console.log("failed to fetch 2" + url)
                        // console.log(error);
                    });

            })
            .catch(function(error) {
                console.log(error);

                // Try again without country
                let part2 = "";
                if (target['country'] === "USA" || target['country'] === "United States") part2 = "%2C+" + target['admin_name'];
                let url = "https://en.wikipedia.org/w/api.php?";
                let params = {
                    action: "query",
                    prop: "pageimages",
                    // pageids: id,
                    titles: (target['city_ascii'] + part2).split(' ').join('_'),
                    format: "json",
                    pithumbsize: 800,
                    redirects: ""
                };
                Object.keys(params).forEach(function(key) {
                    url += "&" + key + "=" + params[key];
                });
                // console.log(url)
                fetch(url)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(response) {
                        var pages = response.query.pages;
                        Object.keys(pages).forEach(function(key, _) {
                            if (pages[key].hasOwnProperty('thumbnail')) {
                                if (pages[key]['thumbnail'].hasOwnProperty('source')) {
                                    socket.emit('draw photo', {
                                        'row': answer['row'],
                                        'col': answer['col']
                                    }, pages[key]['thumbnail']['source'])
                                }
                            }
                        })
                    })
                    .catch(function(error) {
                        // console.log("failed to fetch 2" + url)
                        // console.log(error);
                    });
            });


    }

    incrementInactive() {
        this.players.forEach((player, id) => {
            player.consecutiveRoundsInactive = player.consecutiveRoundsInactive + 1;
        });
    }

    bootInactive() {
        const bootPlayer = (socket) => {
            this.bootPlayer(socket)
        };
        const clients = this.clients;
        const room = this.roomName;
        this.players.forEach((player, id) => {
            if (player.consecutiveRoundsInactive > CONSTANTS.MAX_INACTIVE || player.consecutiveSecondsInactive > CONSTANTS.MAX_S_INACTIVE) {
                if (clients.has(id)) {
                    const socket = clients.get(id);
                    socket.emit('blank map');
                    socket.emit('draw booted', room, player.consecutiveRoundsInactive);
                    socket.emit('update messages', room, "[ You have been booted due to inactivity! ]<br>")
                    console.log('killing! ' + id);
                    bootPlayer(socket);
                }
            };
        });
    }

    allPlayersClicked() {
        const realPlayersClicked = this.players.size > 0 && Array.from(this.players.values()).filter(player => !player.clicked).length === 0;
        let joeClicked = true
        if (this.hasJoe) joeClicked = this.joe.clicked;
        return joeClicked && realPlayersClicked;
    }

    numPlayers() {
        return this.players.size;
    }

    allReady() {
        return this.players.size > 0 && Array.from(this.players.values()).filter(player => !player.ready).length === 0
    }

    allReboot() {
        return this.players.size > 0 && Array.from(this.players.values()).filter(player => !player.reboot).length === 0
    }

    allGrind() {
        return this.players.size > 0 && Array.from(this.players.values()).filter(player => !player.grind).length === 0
    }

    onSecond(fcn) {
        if (Math.abs(Math.floor((this.timer * 1000) % 1000)) < 40) {
            fcn()
        }
    }

    drawCommand(socket) {
        let capital;
        const map = this.map;
        const citysrc = this.citysrc;
        const round = this.round;
        if (this.state === CONSTANTS.PREPARE_GAME_STATE) {
            socket.emit('draw prepare', citysrc.toUpperCase(), round);
        } else if (this.state === CONSTANTS.BEGIN_GAME_STATE) {
            socket.emit('fresh map', map);
            let allgrind = this.allGrind();
            socket.emit('draw begin', citysrc.toUpperCase(), this.timer, round, allgrind);
        } else if (this.state === CONSTANTS.GUESS_STATE) {
            const thisTarget = Geography.stringifyTarget(this.target, this.citysrc);
            const citystring = thisTarget['string'];
            const iso2 = this.target['iso2']
            capital = "";
            if (thisTarget['majorcapital']) capital = "(* COUNTRY CAPITAL)";
            if (thisTarget['minorcapital']) capital = "(† MINOR CAPITAL)";
            socket.emit('fresh map', map);
            socket.emit('draw guess city', citystring, capital, iso2, round);
        } else if (this.state === CONSTANTS.REVEAL_STATE) {
            const thisTarget = Geography.stringifyTarget(this.target, this.citysrc);
            const citystring = thisTarget['string'];
            const iso2 = this.target['iso2']
            capital = "";
            if (thisTarget['majorcapital']) capital = "(* COUNTRY CAPITAL)";
            if (thisTarget['minorcapital']) capital = "(† MINOR CAPITAL)";
            socket.emit('fresh map', map);
            socket.emit('draw reveal city', citystring, capital, iso2, round);
            this.revealAll(socket);
            // Move the following to GUESS_STATE to make images pop up at the start of round
            try {
                this.drawPhoto(socket, this.target);
            } catch (err) {
                helpers.logFeedback("ERROR DRAWING " + Geography.stringifyTarget(this.target, this.citysrc)['string'])
            }
        }
    }
    stateTransition(toState, toDuration) {
        this.state = toState;
        this.timer = toDuration;
        this.drawScorePanel();
        const drawCommand = (socket) => this.drawCommand(socket);
        this.clients.forEach(function(socket, socketId) {
            drawCommand(socket)
        });
    }

    drawScorePanel() {
        this.clients.forEach((s, id) => {
            s.emit('clear scores');
            this.printScoresWithSelf(s, id);
        });
    }

    processJoe() {
        if (!this.joe.clicked && this.timer <= this.joeTime) {
            const joeGeo = Geography.geoToPixel(this.map, this.joeLat, this.joeLon);
            const playerClick = {
                mouseDown: false,
                touchDown: false,
                clickEvent: false,
                downCount: 0,
                cursorX: joeGeo.col,
                cursorY: joeGeo.row
            };
            this.playerClicked(this.joe.id, playerClick);
        }
    }

    sortPlayers() {
        let allPlayers = Array.from(this.players.values());
        if (this.hasJoe) {
            allPlayers.push(this.joe);
        }
        const sortedPlayers = allPlayers.filter((p) => p.choseName).sort((a, b) => {
            return b.score - a.score
        });
        Array.from(sortedPlayers.values()).forEach((p, i) => {
            p.rank = i
        });
        this.winner = Array.from(sortedPlayers)[0];
        return sortedPlayers;
    }

    sortPlayersNoJoe() {
        let allPlayers = Array.from(this.players.values());
        const sortedPlayers = allPlayers.filter((p) => p.choseName).sort((a, b) => {
            return b.score - a.score
        });
        Array.from(sortedPlayers.values()).forEach((p, i) => {
            p.rank = i
        });
        this.winner = Array.from(sortedPlayers)[0];
        return sortedPlayers;
    }

    revealStudy() {
        let citysrc = this.citysrc;
        let map = this.map;
        let gameHistory = this.gameHistory;
        this.clients.forEach(function(socket, socketId) {
            socket.emit('fresh map', map);
            // Reveal points of previous game
            gameHistory.forEach(function(target) {
                const thisTarget = Geography.stringifyTarget(target, citysrc);
                const citystring = thisTarget['string'];
                const iso2 = target['iso2']
                let capital = "";
                if (thisTarget['majorcapital']) capital = "(* COUNTRY CAPITAL)";
                if (thisTarget['minorcapital']) capital = "(† MINOR CAPITAL)";
                const answer = Geography.geoToPixel(map, target['lat'], target['lng']);
                Room.broadcastAnswer(socket, answer['row'], answer['col']);
                socket.emit('draw study city', target, citystring, capital, iso2, answer['row'], answer['col']);
            })
            socket.emit('draw prepare', citysrc.toUpperCase(), 1);
        });
    }

    fsm() {
        // Game flow state machine
        this.decrementTimer();
        if (this.roomName === CONSTANTS.LOBBY) {
            this.timerColor = CONSTANTS.LOBBY_COLOR;
            this.state = CONSTANTS.LOBBY_STATE;
            this.clients.forEach(function(socket, id) {
                socket.emit('animate')
            });
            // this.onSecond(() => {this.clients.forEach(function(socket,id) {socket.emit('draw lobby')})})
            this.onSecond(() => this.players.forEach(function(player, id) {
                player.consecutiveSecondsInactive = player.consecutiveSecondsInactive + 1;
            }));
            this.bootInactive();
        } else {
            let reveal_duration = CONSTANTS.REVEAL_DURATION;
            let begin_game_duration = CONSTANTS.BEGIN_GAME_DURATION;
            if (CONSTANTS.DEBUG_MODE) {
                begin_game_duration = 0;
                reveal_duration = 0;
            } else if (this.allGrind()) {
                begin_game_duration = CONSTANTS.BEGIN_GAME_DURATION_GRIND;
                reveal_duration = CONSTANTS.REVEAL_DURATION_GRIND;
            }

            if (this.numPlayers() === 0 && this.roomName !== CONSTANTS.LOBBY) {
                this.timerColor = CONSTANTS.LOBBY_COLOR;
                this.state = CONSTANTS.IDLE_STATE;
                this.removePoppers();
            } else if (this.numPlayers() > 0 && this.state === CONSTANTS.IDLE_STATE) {
                this.timerColor = CONSTANTS.LOBBY_COLOR;
                this.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
                this.round = 0;
            } else if (this.state === CONSTANTS.BEGIN_GAME_STATE) {
                if (this.timer <= 0) {
                    // Reset lists
                    this.blacklist = [];
                    this.played_targets = [];
                    // Make sure this is a real map
                    let real_map = Object.keys(MAPS).indexOf(this.citysrc) !== -1
                    if (!real_map) {
                        Array.from(this.sortPlayersNoJoe()).forEach((player, id) => {
                            this.whisperMessage(player, "<br><b>Error detected in this room!  Please refresh the game or change rooms!</b><br><br>", () => {})
                        });
                        this.timer = 99;
                    } else {
                        this.stateTransition(CONSTANTS.SETUP_STATE, 0);
                    }
                }
            } else if (this.state === CONSTANTS.PREPARE_GAME_STATE) {
                if (this.allReady() || this.timer <= 0) {
                    this.timerColor = CONSTANTS.BEGIN_COLOR;
                    this.blacklist = [];
                    this.gameHistory = [];
                    this.played_targets = [];
                    this.removePoppers();
                    this.playersHistory = new Map();
                    this.stateTransition(CONSTANTS.BEGIN_GAME_STATE, begin_game_duration);
                    Array.from(this.players.values()).forEach((player, i) => player.deepReset(i))
                    if (this.hasJoe) this.joe.deepReset(this.players.values().size)
                }
            } else if (this.state === CONSTANTS.SETUP_STATE) {
                let mapname;
                [this.target, this.blacklist] = Geography.randomCity(this.citysrc, this.blacklist, this.played_targets);
                [this.joeTime, this.joeLat, this.joeLon] = helpers.joeData(this.map, Geography.stringifyTarget(this.target, this.citysrc).string);
                this.timerColor = CONSTANTS.GUESS_COLOR;
                Array.from(this.players.values()).forEach((p, id) => {
                    p.reset()
                });
                if (this.hasJoe) this.joe.reset();
                this.playedCities[this.round] = this.target;
                this.clearStudyPoints()
                this.played_targets.push(Geography.stringifyTarget(this.target, this.citysrc)['string'])
                this.stateTransition(CONSTANTS.GUESS_STATE, CONSTANTS.GUESS_DURATION);
            } else if (this.state === CONSTANTS.GUESS_STATE) {
                if (this.allReboot()) {
                    if (this.hasJoe) this.joe.deepReset(this.players.values().size);
                    this.round = 0;
                    this.gameHistory = []
                    this.timerColor = CONSTANTS.BEGIN_COLOR;
                    Array.from(this.players.values()).forEach((player, i) => player.deepReset(i))
                    this.playersHistory = new Map();
                    this.stateTransition(CONSTANTS.BEGIN_GAME_STATE, begin_game_duration);
                }
                if (this.timer <= 0 || this.allPlayersClicked()) {
                    this.updateScores();
                    this.sortPlayers();
                    let rounds = CONSTANTS.GAME_ROUNDS;
                    if (CONSTANTS.DEBUG_MODE)
                        rounds = CONSTANTS.DEBUG_GAME_ROUNDS;

                    if (this.round + 1 >= rounds) {
                        this.winner.won();
                        this.recordPersonalHistory();
                        this.printPath(this.winner.getName(), this.winner.score, this.winner.color);
                        this.printWinner(this.winner.getName(), this.winner.score, this.winner.color);
                    }
                    this.stateTransition(CONSTANTS.REVEAL_STATE, reveal_duration);
                    this.recorded = false
                    this.timerColor = CONSTANTS.REVEAL_COLOR;
                }
                if (this.hasJoe) this.processJoe()
            } else if (this.state === CONSTANTS.REVEAL_STATE) {
                if (this.allReboot()) {
                    if (this.hasJoe) this.joe.deepReset(this.players.values().size);
                    this.round = 0;
                    this.gameHistory = []
                    this.timerColor = CONSTANTS.BEGIN_COLOR;
                    Array.from(this.players.values()).forEach((player, i) => player.deepReset(i))
                    this.playersHistory = new Map();
                    this.stateTransition(CONSTANTS.BEGIN_GAME_STATE, begin_game_duration);
                }
                // Record in the middle of the reveal_state
                if (this.recorded == false && this.timer <= 4) {
                    this.recorded = true
                    this.recordGuesses()
                }
                let rounds = CONSTANTS.GAME_ROUNDS;
                if (CONSTANTS.DEBUG_MODE)
                    rounds = CONSTANTS.DEBUG_GAME_ROUNDS;

                if (this.timer <= 0 && this.round + 1 >= rounds) {
                    this.round = 0;
                    this.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
                    this.revealStudy();
                } else if (this.timer <= 0) {
                    this.round = this.round + 1;
                    this.incrementInactive();
                    this.bootInactive();
                    this.stateTransition(CONSTANTS.SETUP_STATE, 0);
                }
            } else {
                this.stateTransition(CONSTANTS.IDLE_STATE, 0)
            }
            this.onSecond(() => {
                const timerColor = this.timerColor;
                const timer = this.timer;
                this.clients.forEach(function(socket, id) {
                    socket.emit('draw timer', Math.floor(((timer * 1000)) / 1000), timerColor)
                })
            })
        }
    }

    distributeMessage(senderSocket, new_sent_msg, cb) {
        const getname = (s) => this.exportPlayer(s)['name'];
        if (this.players.has(senderSocket.id)) {
            this.players.get(senderSocket.id).consecutiveSecondsInactive = 0;
            this.players.get(senderSocket.id).consecutiveRoundsInactive = 0;
        }
        const senderColor = this.exportPlayer(senderSocket)['color'];
        const room = this.roomName;
        this.clients.forEach((socket, id) => {
            let senderName = getname(senderSocket);
            if (this.players.has(id)) {
                const player = this.players.get(id);
                if (player.id === senderSocket.id) senderName = "*" + senderName;
            }
            const sent_msg = "[ " + room + " <b><font color='" + senderColor + "'>" + senderName + "</font></b> ]: " + new_sent_msg + "<br>";
            socket.emit("update messages", room, sent_msg);
            cb();
        });
    };
    whisperMessage(senderSocket, msg, cb) {
        const room = this.roomName;
        this.clients.forEach((socket, id) => {
            if (this.players.has(id)) {
                const player = this.players.get(id);
                if (player.id === senderSocket.id) socket.emit("update messages", room, msg)
            }
            cb();
        });
    };


    recordPersonalHistory() {
        let citysrc = this.citysrc;
        Array.from(this.players.values()).forEach((player, id) => {
            if (player.logger) {
                helpers.logPlayerHistory(player.name, player.color, player.score, citysrc)
            }
        })
    }

    printWinner(winner, score, color) {
        this.recordsBroken();
        const playersHistory = JSON.stringify([...this.playersHistory.entries()], null, 2);
        const room = this.citysrc;
        this.clients.forEach((socket, id) => {
            socket.emit('draw chart', playersHistory, winner, color, room, score);
            // socket.emit('break history',  room, winner, score, color);
        });
    }

    printPath(you, score, color) {
        const playersHistory = JSON.stringify([...this.playersHistory.entries()], null, 2);
        const room = this.citysrc;
        const players = this.players
        this.clients.forEach((socket, id) => {
            let history = helpers.formatPath(playersHistory, players.get(socket.id).histCount, players.get(socket.id).color, id, room, score)
            socket.emit('draw path', history);
        });
    }

    historyRound(round, thisTarget) {
        const room = this.roomName;
        let star = "";
        if (thisTarget['majorcapital']) star = "*";
        if (thisTarget['minorcapital']) star = "†";
        const base = "<b>Round " + round + "</b>: <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"" + helpers.makeLink(room, this.target) + "\">" + star + thisTarget['string'] + "</a> (pop: " + thisTarget['pop'].toLocaleString() + ")<br>";

        // console.log("made link " + base)
        this.clients.forEach((socket, id) => {
            socket.emit('add history', room, base);
            socket.emit('add history', room, "<br>");
        });
    }
    historyScore(player, score) {
        const room = this.roomName;
        this.clients.forEach((socket, id) => {
            let name = player.name;
            if (player.id === id) name = "*" + name;
            name = name.padEnd(16).replace(/\s/g, "&nbsp;");;
            socket.emit('add history', room, "<tt><font color=\"" + player.color + "\"><b>  " + name + "</b>: " + score + "</font></tt><br>")
        });
    }

}

module.exports = Room