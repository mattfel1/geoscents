/**
  * Class for managing the game flow within a room.
  * // TODO: Currently entire game has one room, but the plan is to have multiple rooms to choose from with player caps
  */

const CONSTANTS = require('../resources/constants.js');
const Geography = require('./geography.js');
const Player = require('./player.js');
const helpers = require('../resources/helpers.js')

class Room {
    constructor(map) {
      this.room = map;
      // Map from socketID -> socket object
      this.clients = new Map();
      // Map from socketID -> player
      this.players = new Map();
      this.ordinalCounter = 0;
      this.timer = CONSTANTS.GUESS_DURATION;
      this.target = {'name':'', 'country':'', 'capital':''};
      this.playedCities = {};
      this.state = CONSTANTS.IDLE_STATE;
      this.round = 0;
      this.winner = null;
      this.timerColor = CONSTANTS.LOBBY_COLOR;
      this.record1 = Math.floor(Math.random() * CONSTANTS.RECORD_INIT_RANGE) + CONSTANTS.RECORD_INIT_BASE;
      this.recordColor1 = CONSTANTS.COLORS[Math.floor(Math.random()*CONSTANTS.COLORS.length)];
      this.recordName1 = CONSTANTS.RANDOM_NAMES[Math.floor(Math.random()*CONSTANTS.RANDOM_NAMES.length)];
      this.recordBroken1 = false;
      this.record2 = this.record1 - Math.floor(Math.random() * CONSTANTS.RECORD_DELTA_RANGE);
      this.recordColor2 = CONSTANTS.COLORS[Math.floor(Math.random()*CONSTANTS.COLORS.length)];
      this.recordName2 = CONSTANTS.RANDOM_NAMES[Math.floor(Math.random()*CONSTANTS.RANDOM_NAMES.length)];
      this.recordBroken2 = false;
      this.record3 = this.record2 - Math.floor(Math.random() * CONSTANTS.RECORD_DELTA_RANGE);
      this.recordColor3 = CONSTANTS.COLORS[Math.floor(Math.random()*CONSTANTS.COLORS.length)];
      this.recordName3 = CONSTANTS.RANDOM_NAMES[Math.floor(Math.random()*CONSTANTS.RANDOM_NAMES.length)];
      this.recordBroken3 = false;
}

    // Player count
    playerCount() {
        return Array.from(this.players.values()).filter(player => player.choseName).length;
    }
    // Player basic IO
    addPlayer(socket,info) {
      var player = new Player(socket.id, this.players.size, this.room, socket.handshake.address, this.ordinalCounter, "Player " + this.ordinalCounter % 100,info)
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

    renamePlayer(socket, name) {
        if (this.players.has(socket.id)) {
            if (name != '') this.players.get(socket.id).name = name;
            this.players.get(socket.id).choseName = true;
        }
      this.drawScorePanel(socket.id);
      socket.emit('fresh map', this.room);
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
      console.log('user disconnected ' + socket.id);
      if (this.clients.has(socket.id)) {
        this.clients.delete(socket.id);
      }
      if (this.players.has(socket.id)) {
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
                  socket.emit('draw point', {'row': player.row, 'col': player.col}, player.color)
              }
          }
      }
    }

    recordsBroken() {
        var record1 = this.record1;
        var recordColor1 = this.recordColor1;
        var recordName1 = this.recordName1;
        var recordBroken1 = this.recordBroken1;
        var record2 = this.record2;
        var recordColor2 = this.recordColor2;
        var recordName2 = this.recordName2;
        var recordBroken2 = this.recordBroken2;
        var record3 = this.record3;
        var recordColor3 = this.recordColor3;
        var recordName3 = this.recordName3;
        var recordBroken3 = this.recordBroken3;
        Array.from(this.sortPlayers()).forEach((player, id) => {
            if (player.score > record1) {
                record3 = record2;
                recordColor3 = recordColor2;
                recordName3 = recordName2;
                recordBroken1 = true;
                record2 = record1;
                recordColor2 = recordColor1;
                recordName2 = recordName1;
                record1 = player.score;
                recordColor1 = player.color;
                recordName1 = player.name;
                player.medal = '🥇';
                if (this.clients.has(player.id)) {
                    this.clients.get(player.id).emit("announce record", player.getName(), player.score, player.color);
                }
            }
            else if (player.score > record2) {
                record3 = record2;
                recordColor3 = recordColor2;
                recordName3 = recordName2;
                record2 = player.score;
                recordColor2 = player.color;
                recordName2 = player.name;
                recordBroken2 = true;
                player.medal = '🥈';
                if (this.clients.has(player.id)) {
                    this.clients.get(player.id).emit("announce record", player.getName(), player.score, player.color);
                }
            }
            else if (player.score > record3) {
                record3 = player.score;
                recordColor3 = player.color;
                recordName3 = player.name;
                recordBroken3 = true;
                player.medal = '🥉';
                if (this.clients.has(player.id)) {
                    this.clients.get(player.id).emit("announce record", player.getName(), player.score, player.color);
                }
            }
        });

        this.record1 = record1;
        this.recordColor1 = recordColor1;
        this.recordName1 = recordName1;
        this.recordBroken1 = recordBroken1;
        this.record2 = record2;
        this.recordColor2 = recordColor2;
        this.recordName2 = recordName2;
        this.recordBroken2 = recordBroken2;
        this.record3 = record3;
        this.recordColor3 = recordColor3;
        this.recordName3 = recordName3;
        this.recordBroken3 = recordBroken3;
    }

    printScoresWithSelf(socket, socketId) {
        if (this.room != CONSTANTS.LOBBY) {
            socket.emit('post record', 1,this.recordColor1, this.record1, this.recordName1, this.recordBroken1);
            socket.emit('post record', 2,this.recordColor2, this.record2, this.recordName2, this.recordBroken2);
            socket.emit('post record', 3,this.recordColor3, this.record3, this.recordName3, this.recordBroken3);
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
    updateScores() {
      const target = this.target;
      const room = this.room;
      const historyScore = (player, payload) => {this.historyScore(player, payload)}
      Array.from(this.players.values()).forEach(function(player) {
          const timeBonus = player.clickedAt;
          const merc = Geography.geoToMerc(room,parseFloat(target['lat']), parseFloat(target['lon']));
          var dist = Geography.mercDist(room, player.row, player.col, merc['row'], merc['col']);
          if (!player.clicked) {
              dist = 9999;
          }
          const timeLogistic = 20/(2+Math.exp(0.8*(-timeBonus+7)))+1
          const update = Math.exp(-Math.pow(dist, 2) / 1000) * timeLogistic * 50;
          historyScore(player, " + " + Math.floor(update ) + " (Distance: " + Math.floor(dist) + ", Time Bonus: " + (Math.floor(timeBonus * 10) / 10) + "s)")
          player.score = Math.floor(player.score + update)
        })
      this.historyRound(this.round, this.stringifyTarget())
    }

    broadcastPoint(row, col, color) {
      this.clients.forEach(function(s,id) {
          s.emit('draw point', {'row': row, 'col': col}, color)
      });
    }

    revealAll() {
        var answer = Geography.geoToMerc(this.room,this.target['lat'], this.target['lon']);
        this.broadcastPoint(answer['row'], answer['col'], CONSTANTS.TRUTH_COLOR);
        this.players.forEach((player,id) => {
            this.broadcastPoint(player.row, player.col, player.color);
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
      const drawScorePanel = () => {this.drawScorePanel()};
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
          } else if (this.numPlayers() > 0 && this.state == CONSTANTS.IDLE_STATE) {
              this.timerColor = CONSTANTS.LOBBY_COLOR;
              this.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
              this.round = 0;
          } else if (this.state == CONSTANTS.PREPARE_GAME_STATE) {
              if (this.allReady() || this.timer <= 0) {
                  this.timerColor = CONSTANTS.LOBBY_COLOR;
                  this.recordBroken1 = false;
                  this.recordBroken2 = false;
                  this.recordBroken3 = false;
                  this.stateTransition(CONSTANTS.SETUP_STATE, 0);
                  Array.from(this.players.values()).forEach((player, i) => player.deepReset(i))
              } else {
                  this.onSecond(function () {
                      drawScorePanel();
                  });
              }
          } else if (this.state == CONSTANTS.SETUP_STATE) {
              this.target = Geography.randomCity(this.room);
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
        const room = this.room;
        this.clients.forEach((socket,id) => {
            socket.emit('break history',  room, winner, score, color);
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
