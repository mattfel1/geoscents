/**
  * Class for managing the game flow within a room.
  * // TODO: Currently entire game has one room, but the plan is to have multiple rooms to choose from with player caps
  */

const CONSTANTS = require('../resources/constants.js');
const Geography = require('./geography.js');
const Player = require('./player.js');
const helpers = require('../resources/helpers.js');
const fs = require('fs')

class Room {
    constructor(map) {
      this.room = map;
      // Map from socketID -> socket object
      this.clients = new Map();
      // Map from socketID -> player
      this.players = new Map();
      this.playersHistory = new Map();
      this.ordinalCounter = 0;
      this.timer = CONSTANTS.GUESS_DURATION;
      this.target = {'name':'', 'country':'', 'capital':''};
      this.playedCities = {};
      this.state = CONSTANTS.IDLE_STATE;
      this.round = 0;
      this.winner = null;
      this.blacklist = []; // List of countries or states to avoid drawing for this round
      this.timerColor = CONSTANTS.LOBBY_COLOR;
      if (fs.existsSync('/tmp/' + map + '_day_record')) {
          try {
              this.dayRecord = JSON.parse(fs.readFileSync('/tmp/' + map + '_day_record', 'utf8'));
          } catch (err) {
              this.dayRecord = CONSTANTS.INIT_RECORD;
          }
      } else {
          this.dayRecord = CONSTANTS.INIT_RECORD;
      }
      if (fs.existsSync('/tmp/' + map + '_week_record')) {
          try {
              this.weekRecord = JSON.parse(fs.readFileSync('/tmp/' + map + '_week_record', 'utf8'));
          } catch (err) {
              this.weekRecord = CONSTANTS.INIT_RECORD;
          }
      } else {
          this.weekRecord = CONSTANTS.INIT_RECORD;
      }
      if (fs.existsSync('/tmp/' + map + '_month_record')) {
          try {
              this.monthRecord = JSON.parse(fs.readFileSync('/tmp/' + map + '_month_record', 'utf8'));
          } catch (err) {
              this.monthRecord = CONSTANTS.INIT_RECORD;
          }
      } else {
          this.monthRecord = CONSTANTS.INIT_RECORD;
      }
      if (fs.existsSync('/tmp/' + map + '_all-time_record')) {
          try {
              this.allRecord = JSON.parse(fs.readFileSync('/tmp/' + map + '_all-time_record', 'utf8'));
          } catch (err) {
              this.allRecord = CONSTANTS.INIT_RECORD;
          }
      } else {
          this.allRecord = CONSTANTS.INIT_RECORD;
      }
}

    // Player count
    playerCount() {
        return Array.from(this.players.values()).filter(player => player.choseName).length;
    }
    // Player basic IO
    addPlayer(socket,info) {
      var player = new Player(socket.id, this.players.size, this.room, socket.handshake.address, this.ordinalCounter, "Player " + this.ordinalCounter % 100,info);
      this.clients.set(socket.id, socket);
      this.players.set(socket.id, player);
      this.ordinalCounter = this.ordinalCounter + 1;
      this.sortPlayers();
      this.drawScorePanel(socket.id);
      socket.emit('fresh map', this.room);
      this.drawCommand(socket);
    }

    hasPlayer(socket) {
        return this.clients.has(socket.id) && this.players.has(socket.id)
    }

    renamePlayer(socket, name, color) {
        if (this.players.has(socket.id)) {
            if (name != '') this.players.get(socket.id).name = name;
            if (color != 'random') this.players.get(socket.id).color = color;
            this.players.get(socket.id).choseName = true;
        }
      this.drawScorePanel(socket.id);
      socket.emit('fresh map', this.room);
    }

    getPlayerRawName(socket) {
        if (this.players.has(socket.id)) {
            return this.players.get(socket.id).name;
        }
        else {
            return socket.id.substring(5,0);
        }
    }

    getPlayerName(socket) {
        if (this.players.has(socket.id)) {
            return this.players.get(socket.id).getName();
        }
        else {
            return socket.id.substring(5,0);
        }
    }
    playerChoseName(socket) {
        return this.players.has(socket.id) && this.players.get(socket.id).choseName;
    }
    getPlayerColor(socket) {
        if (this.players.has(socket.id)) {
            return this.players.get(socket.id).color
        }
        else {
            return '#000000'
        }
    }
    getPlayerWins(socket) {
        if (this.players.has(socket.id)) {
            return this.players.get(socket.id).wins
        }
        else {
            return 0
        }
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
          const room = this.room;
          var boot_msg = "[ <font color='" + color + "'>" + name + " has been booted due to inactivity!</font> ]<br>";
          this.players.delete(socket.id);
          this.clients.forEach(function(s,id) {
              s.emit('update messages', room, boot_msg)
          });
          socket.emit('request boot', socket.id);
      }
      this.sortPlayers();
      this.drawScorePanel(socket.id);
    }

    playerReady(socket) {
      if (this.players.has(socket.id)) {
          const player = this.players.get(socket.id);
          player.ready = '✔';
      }
      this.drawScorePanel();
    }

    playerClicked(socket, playerClick) {
      if (this.players.has(socket.id)) {
          const player = this.players.get(socket.id);
          if (playerClick.downCount < CONSTANTS.SCROLL_THRESHOLD && playerClick.mouseDown && this.state == CONSTANTS.GUESS_STATE && !player.clicked) {
              if (playerClick.cursorX < CONSTANTS.MAP_WIDTH && playerClick.cursorY < CONSTANTS.MAP_HEIGHT) {
                  player.clicked = true;
                  player.consecutiveRoundsInactive = 0;
                  player.row = playerClick.cursorY;
                  player.col = playerClick.cursorX;
                  player.clickedAt = this.timer;
                  var geo = Geography.mercToGeo(player.row, player.col)
                  player.lat = geo['lat'];
                  player.lon = geo['lon'];
                  // console.log('click at ' + player.row + ',' + player.col + ' (' + player.lat + ',' + player.lon + ')')
                  socket.emit('draw point', {'row': player.row, 'col': player.col}, player.color, player.radius())
              }
          }
      }
    }

    insertRecord(position, category, olddict, room, player){
        function copy(x) {
            return JSON.parse( JSON.stringify(x) );
        }
        var dict = copy(olddict);
        var i;
        for (i = 3; i > position; i--) {
          dict['record' + i] = copy(dict['record' + (i-1)]);
          dict['recordColor' + i] = copy(dict['recordColor' + (i-1)]);
          dict['recordName' + i] = copy(dict['recordName' + (i-1)]);
          dict['recordBroken' + i] = false;
        }
        dict['record' + position] = copy(player.score);
        dict['recordColor' + position] = copy(player.color);
        dict['recordName' + position] = copy(player.name);
        dict['recordBroken' + position] = true;
        player.giveMedal(position, category);
        var medal = '';
        if (position == 1) medal = '🥇';
        else if (position == 2) medal = '🥈';
        else if (position == 3) medal = '🥉';
        if (this.clients.has(player.id)) {
            this.clients.get(player.id).emit("announce record", category, room, medal, player.name, player.score, player.color);
        }
        // fs.writeFile("/tmp/" + room + "_" + category + "_record", JSON.stringify(dict), function(err) {
        //     if(err) {
        //         return console.log(err);
        //     }
        // });
        return copy(dict);
    }

    getPosition(score, category){
        if (score > category['record1']) return 1;
        else if (score > category['record2']) return 2;
        else if (score > category['record3']) return 3;
        else return 4;
    }

    removePoppers() {
        this.allRecord['recordBroken1'] = false;
        this.allRecord['recordBroken2'] = false;
        this.allRecord['recordBroken3'] = false;
        this.monthRecord['recordBroken1'] = false;
        this.monthRecord['recordBroken2'] = false;
        this.monthRecord['recordBroken3'] = false;
        this.weekRecord['recordBroken1'] = false;
        this.weekRecord['recordBroken2'] = false;
        this.weekRecord['recordBroken3'] = false;
        this.dayRecord['recordBroken1'] = false;
        this.dayRecord['recordBroken2'] = false;
        this.dayRecord['recordBroken3'] = false;
    }

    appendActivity(update) {
        // TODO: update activity log json for display in lobby
    }

    recordsBroken() {
        function copy(x) {
            return JSON.parse( JSON.stringify(x) );
        }
        var dayRecord = copy(this.dayRecord);
        var weekRecord = copy(this.weekRecord);
        var monthRecord = copy(this.monthRecord);
        var allRecord = copy(this.allRecord);
        const getPosition = (score, category) => {return this.getPosition(score, category)};
        const insertRecord = (p,c,d,r,pl) => {return this.insertRecord(p,c,d,r,pl)}
        const room = this.room;
        const appendActivity = (update) => {this.appendActivity(update)};
        Array.from(this.sortPlayers()).forEach((player, id) => {
            var activityLog = {};
            if (getPosition(player.score,dayRecord) < 4) {
                dayRecord = copy(insertRecord(getPosition(player.score,dayRecord), "day", copy(dayRecord), room, player));
                activityLog['day'] = getPosition(player.score,dayRecord)
            }
            if (getPosition(player.score,weekRecord) < 4) {
                weekRecord = copy(insertRecord(getPosition(player.score,weekRecord), "week", copy(weekRecord), room, player));
                activityLog['week'] = getPosition(player.score,weekRecord)
            }
            if (getPosition(player.score,monthRecord) < 4) {
                monthRecord = copy(insertRecord(getPosition(player.score,monthRecord), "month", copy(monthRecord), room, player));
                activityLog['month'] = getPosition(player.score,monthRecord)
            }
            if (getPosition(player.score,allRecord) < 4) {
                allRecord = copy(insertRecord(getPosition(player.score,allRecord), "all-time", copy(allRecord), room, player));
                activityLog['all-time'] = getPosition(player.score,allRecord)
            }
            if (Object.keys(activityLog).length > 0) {
                const monthNames = ["Jan", "Feb", "Mar","Apr", "May", "Jun","Jul", "Aug", "Sep","Oct", "Nov", "Dec"];
                const time = new Date();
                const month = monthNames[time.getMonth()];
                const day = time.getDay();
                const hour = time.getHours();
                activityLog['room'] = room;
                activityLog['date'] = month + day + " @" + hour + "gmt";
                activityLog['player'] = player.name;
                activityLog['color'] = player.color;
                appendActivity(activityLog)
            }
        });
        fs.writeFile("/tmp/" + room + "_day_record", JSON.stringify(copy(dayRecord)), function(err) {if(err){return console.log(err);}});
        fs.writeFile("/tmp/" + room + "_week_record", JSON.stringify(copy(weekRecord)), function(err) {if(err){return console.log(err);}});
        fs.writeFile("/tmp/" + room + "_month_record", JSON.stringify(copy(monthRecord)), function(err) {if(err){return console.log(err);}});
        fs.writeFile("/tmp/" + room + "_all-time_record", JSON.stringify(copy(allRecord)), function(err) {if(err){return console.log(err);}});
        this.dayRecord = copy(dayRecord);
        this.weekRecord = copy(weekRecord);
        this.monthRecord = copy(monthRecord);
        this.allRecord = copy(allRecord);

    }

    printScoresWithSelf(socket, socketId) {
        if (this.room != CONSTANTS.LOBBY) {
            socket.emit('post group', 'All-Time Records:', this.allRecord);
            socket.emit('post group', 'Monthly Records:', this.monthRecord);
            socket.emit('post group', 'Weekly Records:', this.weekRecord);
            socket.emit('post group', 'Daily Records:', this.dayRecord);
            socket.emit('post space');
        }
        else {
            socket.emit('post lobby');
        }
        const sortedPlayers = this.sortPlayers();
        Array.from(sortedPlayers.values()).forEach(function(player, index) {
          var you = '';
          if (player.id == socketId) {
              you = '*';
          }
          if (player.choseName) socket.emit('post score', player.rank, you + player.getName(), player.color, player.score, player.wins);
        })
    }

    decrementTimer() {
        this.timer = this.timer - 1 / CONSTANTS.FPS
    }

    stringifyTarget(){
        var state = ''
        if (this.target['country'] == 'United States' || this.target['country'] == 'USA' || this.target['country'] == 'Canada' || this.target['country'] == 'Mexico' || this.target['country'] == 'India' || this.target['country'] == 'China') {
            state = ', ' + this.target['admin_name'];
        }
        var pop = 0;
        if (this.target['population'] != '') {
            pop = this.target['population'];
        }
        return {
            'string': this.target['name'] + state + ', ' + this.target['country'],
            'pop': pop,
            'majorcapital': this.target['capital'] == "primary",
            'minorcapital': this.target['capital'] == 'admin' || this.target['capital'] == 'minor'
        }
    }
    updateHistory(player, round, score) {
        if (this.playersHistory.has(player)) {
          var dict = this.playersHistory.get(player);
          dict[round] = score;
          this.playersHistory.set(player, dict)
        } else {
          var dict = {};
          dict[round] = score;
          this.playersHistory.set(player, dict)
        }
    }
    updateScores() {
        function copy(x) {
            return JSON.parse( JSON.stringify(x) );
        }
      const target = this.target;
      const room = this.room;
      const round = this.round;
      const updateHistory = (p,r,s) => this.updateHistory(p,r,s);
      const historyScore = (player, payload) => {this.historyScore(player, payload)}
      Array.from(this.players.values()).forEach(function(player) {
          const timeBonus = player.clickedAt;
          const merc = Geography.geoToMerc(room,parseFloat(target['lat']), parseFloat(target['lon']));
          var dist = Geography.mercDist(room, player.row, player.col, merc['row'], merc['col']);
          if (!player.clicked || isNaN(dist)) {
              dist = 9999;
          }
          const timeLogistic = CONSTANTS.LOGISTIC_C3/(2+Math.exp(CONSTANTS.LOGISTIC_C1*(-timeBonus+CONSTANTS.LOGISTIC_C2)))+CONSTANTS.LOGISTIC_C4;
          const distGaussian = Math.exp(-Math.pow(dist, 2) / CONSTANTS.GAUSS_C1) * CONSTANTS.MULTIPLIER;
          const update = distGaussian * timeLogistic;
          const newScore = Math.floor(player.score + update);
          historyScore(player, " + " + Math.floor(update ) + " (Distance: " + Math.floor(dist) + ", Time Bonus: " + (Math.floor(timeBonus * 10) / 10) + "s)")
          player.score = newScore;
          updateHistory(player, round, newScore);
        })
      this.historyRound(this.round, this.stringifyTarget())
    }

    broadcastPoint(row, col, color, radius) {
      this.clients.forEach(function(s,id) {
          s.emit('draw point', {'row': row, 'col': col}, color, radius)
      });
    }

    broadcastAnswer(row, col) {
      this.clients.forEach(function(s,id) {
          s.emit('draw answer', {'row': row, 'col': col})
      });
    }

    revealAll() {
        var answer = Geography.geoToMerc(this.room,this.target['lat'], this.target['lon']);
        this.broadcastAnswer(answer['row'], answer['col']);
        this.players.forEach((player,id) => {
            this.broadcastPoint(player.row, player.col, player.color, player.radius());
        });
    }

    incrementInactive() {
        this.players.forEach((player, id) => {
            player.consecutiveRoundsInactive = player.consecutiveRoundsInactive + 1;
        });
    }

    bootInactive() {
        const bootPlayer = (socket) => {this.bootPlayer(socket)};
        const clients = this.clients;
        const room = this.room;
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
        return this.players.size > 0 && Array.from(this.players.values()).filter(player => !player.clicked).length == 0
    }

    numPlayers() {
        return this.players.size;
    }

    allReady() {
      return this.players.size > 0 && Array.from(this.players.values()).filter(player => !player.ready).length == 0
    }

    onSecond(fcn) {
        if ( Math.abs(Math.floor((this.timer*1000) % 1000)) < 40 ) {
            fcn()
        }
    }

    drawCommand(socket) {
          const room = this.room;
          const round = this.round;
          if (this.state == CONSTANTS.PREPARE_GAME_STATE) {
             socket.emit('fresh map', room);
             socket.emit('draw prepare', round);
          }
          else if (this.state == CONSTANTS.GUESS_STATE) {
             const thisTarget = this.stringifyTarget();
             const citystring = thisTarget['string'];
             var capital = "";
             if (thisTarget['majorcapital']) capital = "(* COUNTRY CAPITAL)";
             if (thisTarget['minorcapital']) capital = "(† MINOR CAPITAL)";
             socket.emit('fresh map', room);
             socket.emit('draw guess city', citystring, capital, round);
          }
          else if (this.state == CONSTANTS.REVEAL_STATE) {
             const thisTarget = this.stringifyTarget();
             const citystring = thisTarget['string'];
             var capital = "";
             if (thisTarget['majorcapital']) capital = "(* COUNTRY CAPITAL)";
             if (thisTarget['minorcapital']) capital = "(† MINOR CAPITAL)";
             socket.emit('fresh map', room);
             socket.emit('draw reveal city', citystring, capital, round);
             this.revealAll();
          }
    }
    stateTransition(toState, toDuration) {
      this.state = toState;
      this.timer = toDuration;
      this.drawScorePanel();
      const drawCommand = (socket) => this.drawCommand(socket);
      this.clients.forEach(function(socket, socketId) {drawCommand(socket)});
    }

    drawScorePanel() {
        this.clients.forEach((s,id) => {
            s.emit('clear scores');
            this.printScoresWithSelf(s,id);
        });
    }

    sortPlayers() {
        var sortedPlayers = Array.from(this.players.values()).filter((p) => p.choseName).sort((a, b) => {return b.score - a.score});
        Array.from(sortedPlayers.values()).forEach((p,i) => {p.rank = i});
        this.winner = Array.from(sortedPlayers)[0];
        return sortedPlayers;
    }

    fsm() {
      // Game flow state machine
      this.decrementTimer();
      if (this.room == CONSTANTS.LOBBY) {
          this.timerColor = CONSTANTS.LOBBY_COLOR;
          this.state = CONSTANTS.LOBBY_STATE;
          this.clients.forEach(function (socket, id) {
              socket.emit('animate')
          });
          // this.onSecond(() => {this.clients.forEach(function(socket,id) {socket.emit('draw lobby')})})
          this.onSecond(() => this.players.forEach(function(player,id) {player.consecutiveSecondsInactive = player.consecutiveSecondsInactive + 1;}));
          this.bootInactive();
      }
      else {
          if (this.numPlayers() == 0 && this.room != CONSTANTS.LOBBY) {
              this.timerColor = CONSTANTS.LOBBY_COLOR;
              this.state = CONSTANTS.IDLE_STATE;
              this.removePoppers();
          } else if (this.numPlayers() > 0 && this.state == CONSTANTS.IDLE_STATE) {
              this.timerColor = CONSTANTS.LOBBY_COLOR;
              this.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
              this.round = 0;
          } else if (this.state == CONSTANTS.PREPARE_GAME_STATE) {
              if (this.allReady() || this.timer <= 0) {
                  this.timerColor = CONSTANTS.LOBBY_COLOR;
                  this.blacklist = [];
                  this.removePoppers();
                  this.playersHistory = new Map();
                  this.stateTransition(CONSTANTS.SETUP_STATE, 0);
                  Array.from(this.players.values()).forEach((player, i) => player.deepReset(i))
              }
          } else if (this.state == CONSTANTS.SETUP_STATE) {
              this.target = Geography.randomCity(this.room, this.blacklist);
              if (this.room == CONSTANTS.US) this.blacklist.push(this.target['admin_name']);
              else this.blacklist.push(this.target['country']);
              this.timerColor = CONSTANTS.GUESS_COLOR;
              Array.from(this.players.values()).forEach((p, id) => {
                  p.reset()
              });
              this.playedCities[this.round] = this.target;
              this.stateTransition(CONSTANTS.GUESS_STATE, CONSTANTS.GUESS_DURATION);
          } else if (this.state == CONSTANTS.GUESS_STATE) {
              if (this.timer <= 0 || this.allPlayersClicked()) {
                  this.updateScores();
                  this.sortPlayers();
                  if (this.round >= CONSTANTS.GAME_ROUNDS) {
                      this.winner.won();
                      this.printWinner(this.winner.getName(), this.winner.score, this.winner.color);
                  }
                  this.stateTransition(CONSTANTS.REVEAL_STATE, CONSTANTS.REVEAL_DURATION);
                  this.timerColor = CONSTANTS.REVEAL_COLOR;
              }
          } else if (this.state == CONSTANTS.REVEAL_STATE) {
              if (this.timer <= 0 && this.round >= CONSTANTS.GAME_ROUNDS) {
                  this.round = 0;
                  this.stateTransition(CONSTANTS.PREPARE_GAME_DURATION, CONSTANTS.PREPARE_GAME_DURATION);
              }
               else if (this.timer <= 0) {
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
              this.clients.forEach(function (socket, id) {
                  socket.emit('draw timer', Math.floor(((timer * 1000)) / 1000), timerColor)
              })
          })
      }
    }

    distributeMessage(senderSocket, new_sent_msg, cb) {
      const getname = (s) => this.getPlayerName(s)
      const senderColor = this.getPlayerColor(senderSocket);
      const room = this.room;
      this.clients.forEach((socket,id) => {
          var senderName = getname(senderSocket);
          if (this.players.has(id)) {
              const player = this.players.get(id);
              if (player.id == senderSocket.id) senderName = "*" + senderName;
          }
          const sent_msg = "[ " + room + " <font color='" + senderColor + "'>" + senderName + "</font> ]: " + new_sent_msg + "<br>";
          socket.emit("update messages", room, sent_msg);
          cb();
      });
    };
    printWinner(winner, score, color) {
        this.recordsBroken();
        const playersHistory = JSON.stringify([...this.playersHistory.entries()]);
        const room = this.room;
        this.clients.forEach((socket,id) => {
            socket.emit('draw chart', playersHistory, winner, color, room, score);
            // socket.emit('break history',  room, winner, score, color);
        });
    }
    historyRound(round, thisTarget) {
        const room = this.room;
        var star = ""
        if (thisTarget['majorcapital']) star = "*";
        if (thisTarget['minorcapital']) star = "†";
        const base = "Round " + round + ": " + star + thisTarget['string'] + " (pop: " + thisTarget['pop'].toLocaleString() + ")";
        var part2 = "%2C+" + this.target['country'];
        if (this.target['country'] == "USA") part2 = "%2C+" + this.target['admin_name'];
        var link = " <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://en.wikipedia.org/wiki/Special:Search?search=" + this.target['name'] + part2 + "&go=Go&ns0=1\">Learn!</a><br>"
        this.clients.forEach((socket,id) => {
            socket.emit('add history',  room, base + link);
            socket.emit('add history', room, "<br>");
        });
    }
    historyScore(player, score) {
        const room = this.room;
        this.clients.forEach((socket,id) => {
            var name = player.name;
            if (player.id == id) name = "*" + name;
            socket.emit('add history', room, "<font color=\"" + player.color +"\">  " + name + ": " + score + "</font><br>")
        });
    }

}

module.exports = Room
