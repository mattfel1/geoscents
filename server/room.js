/**
  * Class for managing the game flow within a room.
  * // TODO: Currently entire game has one room, but the plan is to have multiple rooms to choose from with player caps
  */

const CONSTANTS = require('../resources/constants.js');
const Geography = require('./geography.js');
const Player = require('./player.js');

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
    }

    // Player count
    playerCount() {
        return this.players.size;
    }
    // Player basic IO
    addPlayer(socket,info) {
      var player = new Player(socket.id, this.players.size, this.room, socket.handshake.address, this.ordinalCounter, this.ordinalCounter,info)
      this.clients.set(socket.id, socket)
      this.players.set(socket.id, player)
      this.ordinalCounter = this.ordinalCounter + 1;
      this.drawUpperPanel(socket.id);
      this.drawLowerPanel(socket.id);
      socket.emit('fresh map', this.room);
      socket.emit('clear history')
    }

    getPlayerByIp(ip) {
        const match = Array.from(this.players.values()).filter(player => player.ip == ip);
        if (match.length > 0)
            return {'playerId': match[0].id, 'numMatch': match.length};
        else
            return {'playerId': "", 'numMatch': 0};
    }

    getPlayerName(socket) {
        const ip = socket.handshake.address;
        const playerByIp = this.getPlayerByIp(ip);
        const matchedSocketId = playerByIp['playerId'];
        const numMatches = playerByIp['numMatch'];
        if (numMatches == 1 && this.players.has(matchedSocketId)) {
            return this.players.get(matchedSocketId).name
        }
        else if (numMatches > 1 && this.players.has(matchedSocketId)) {
            return this.players.get(matchedSocketId).name + "-" + socket.id.substring(5,0);
        } else {
            return socket.id.substring(5,0);
        }
    }
    getPlayerColor(socket) {
        const ip = socket.handshake.address;
        const playerByIp = this.getPlayerByIp(ip);
        const matchedSocketId = playerByIp['playerId'];
        if (this.players.has(matchedSocketId)) {
            return this.players.get(matchedSocketId).color
        }
        else {
            return '#000000'
        }
    }
    getPlayerWins(socket) {
        const ip = socket.handshake.address;
        const playerByIp = this.getPlayerByIp(ip);
        const matchedSocketId = playerByIp['playerId'];
        if (this.players.has(matchedSocketId)) {
            return this.players.get(matchedSocketId).wins
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
          var boot_msg = "[ <font color='" + color + "'>Player " + name + " has been booted due to inactivity!</font> ]<br>";
          this.players.delete(socket.id);
          this.clients.forEach(function(s,id) {
              s.emit('update messages', boot_msg)
          });
      }
    }

    playerReady(socket) {
      if (this.players.has(socket.id)) {
          const player = this.players.get(socket.id);
          player.ready = true
      }
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

    printScoresWithSelf(socket, socketId) {
        Array.from(this.players.values()).forEach(function(player, index) {
          var you = '';
          if (player.id == socketId) {
              you = '   <-- you';
          }
          socket.emit('post score', player.rank, player.name, player.color, player.score, player.wins, you);
        })
    }

    decrementTimer() {
        this.timer = this.timer - 1 / CONSTANTS.FPS
    }

    stringifyTarget(){
        var state = ''
        if (this.target['country'] == 'United States' || this.target['country'] == 'USA' || this.target['country'] == 'Canada' || this.target['country'] == 'Mexico') {
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
          const update = Math.exp(-Math.pow(dist, 2) / 1000) * timeBonus * 50;
          historyScore(player, " + " + Math.floor(update ) + " (Distance: " + Math.floor(dist) + ", Time Bonus: " + (Math.floor(timeBonus * 10) / 10) + ")")
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
        this.players.forEach((player, id) => {
            if (player.consecutiveRoundsInactive > CONSTANTS.MAX_INACTIVE || player.consecutiveSecondsInactive > CONSTANTS.MAX_S_INACTIVE) {
                if (clients.has(id)) {
                    const socket = clients.get(id);
                    socket.emit('draw booted', player.consecutiveRoundsInactive);
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
        if ( Math.floor((this.timer*1000) % 1000) < 50 ) {
            fcn()
        }
    }
    stateTransition(toState, toDuration) {
      this.state = toState;
      this.timer = toDuration;
      this.drawUpperPanel();
      this.drawLowerPanel();
    }

    // Panel methods
    drawUpperPanel() {
       const round = this.round;
       const state = this.state;
       const revealAll = () => {this.revealAll()};
       const thisTarget = this.stringifyTarget();
       const citystring = thisTarget['string'];
       var capital = "";
       if (thisTarget['majorcapital']) capital = "(* COUNTRY CAPITAL)";
       if (thisTarget['minorcapital']) capital = "(† MINOR CAPITAL)";
       this.clients.forEach(function(socket, socketId) {
           socket.emit('draw round', round);
           if (state == CONSTANTS.IDLE_STATE) {
               socket.emit('draw idle');
           }
           if (state == CONSTANTS.PREPARE_GAME_STATE) {
               socket.emit('draw prepare');
           }
           if (state == CONSTANTS.SETUP_STATE) {
                // ???
           }
           if (state == CONSTANTS.GUESS_STATE) {
               socket.emit('draw guess city', citystring, capital);
           }
           if (state == CONSTANTS.REVEAL_STATE) {
               socket.emit('draw reveal city', citystring, capital);
               revealAll();
           }
       })
    }

    drawLowerPanel() {
        const players = this.players;
        this.clients.forEach((s,id) => {
            s.emit('clear scores');
            this.printScoresWithSelf(s,id);
        });
        this.clients.forEach(function(s,id) {
            Array.from(players.values()).forEach(function(player,i) {
              if (player.ready) s.emit('player ready', player.rank)
            });
        });

    }

    sortPlayers() {
        var sortedPlayers = Array.from(this.players.values()).sort((a, b) => {return b.score - a.score})
        Array.from(sortedPlayers.values()).forEach((p,i) => {p.rank = i});
        this.winner = Array.from(sortedPlayers)[0];
        return sortedPlayers;
    }

    fsm() {
      // Game flow state machine
      const timer = this.timer;
      const drawUpperPanel = () => {this.drawUpperPanel()};
      const drawLowerPanel = () => {this.drawLowerPanel()};
      var timerColor = CONSTANTS.LOBBY_COLOR;
      if (this.state == CONSTANTS.GUESS_STATE) {
          timerColor = CONSTANTS.GUESS_COLOR;
      }
      else if (this.state == CONSTANTS.REVEAL_STATE) {
          timerColor = CONSTANTS.REVEAL_COLOR;
      }
      this.decrementTimer();
      if (this.room == CONSTANTS.LOBBY) {
          this.state = CONSTANTS.LOBBY_STATE;
          this.onSecond(() => {this.clients.forEach(function(socket,id) {socket.emit('draw lobby')})})
          this.onSecond(() => this.players.forEach(function(player,id) {player.consecutiveSecondsInactive = player.consecutiveSecondsInactive + 1;}));
          this.onSecond(() => drawLowerPanel());
          this.bootInactive();
      }
      else {
          this.onSecond(() => {
              this.clients.forEach(function (socket, id) {
                  socket.emit('draw timer', Math.floor(((timer * 1000)) / 1000), timerColor)
              })
          })
          if (this.numPlayers() == 0 && this.room != CONSTANTS.LOBBY) {
              this.state = CONSTANTS.IDLE_STATE;
          } else if (this.numPlayers() > 0 && this.state == CONSTANTS.IDLE_STATE) {
              this.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
              this.round = 0;
          } else if (this.state == CONSTANTS.PREPARE_GAME_STATE) {
              if (this.allReady() || this.timer <= 0) {
                  this.stateTransition(CONSTANTS.SETUP_STATE, 0);
                  Array.from(this.players.values()).forEach((player, i) => player.deepReset(i))
              } else {
                  this.onSecond(function () {
                      drawUpperPanel();
                      drawLowerPanel();
                  });
              }
          } else if (this.state == CONSTANTS.SETUP_STATE) {
              this.target = Geography.randomCity(this.room);
              Array.from(this.players.values()).forEach((p, id) => {
                  p.reset()
              })
              this.playedCities[this.round] = this.target;
              Array.from(this.clients.values()).forEach((socket, id) => {
                  socket.emit('fresh map', this.room)
              })
              this.stateTransition(CONSTANTS.GUESS_STATE, CONSTANTS.GUESS_DURATION);
          } else if (this.state == CONSTANTS.GUESS_STATE) {
              if (this.timer <= 0 || this.allPlayersClicked()) {
                  this.updateScores();
                  this.sortPlayers();
                  if (this.round >= CONSTANTS.GAME_ROUNDS) {
                      this.winner.wins = this.winner.wins + 1;
                      this.historyNewGame(this.winner.name, this.winner.score, this.winner.color);
                  }
                  this.stateTransition(CONSTANTS.REVEAL_STATE, CONSTANTS.REVEAL_DURATION);
              }
          } else if (this.state == CONSTANTS.REVEAL_STATE) {
              if (this.timer <= 0 && this.round >= CONSTANTS.GAME_ROUNDS) {
                  this.round = 0;
                  this.stateTransition(CONSTANTS.PREPARE_GAME_DURATION, CONSTANTS.PREPARE_GAME_DURATION)
              } else if (this.timer <= 0) {
                  this.round = this.round + 1;
                  this.incrementInactive();
                  this.bootInactive();
                  this.stateTransition(CONSTANTS.SETUP_STATE, 0);
              }
          } else {
              this.stateTransition(CONSTANTS.IDLE_STATE, 0)
          }
      }
    }

    historyNewGame(winner, score, color) {
        const room = this.room;
        this.clients.forEach((socket,id) => {
            socket.emit('break history',  room, winner, score, color)
        });
    }
    historyRound(round, thisTarget) {
        const room = this.room;
        var star = ""
        if (thisTarget['majorcapital']) star = "*";
        if (thisTarget['minorcapital']) star = "†";
        const base = "Round " + round + ": " + star + thisTarget['string'] + " (pop: " + thisTarget['pop'].toLocaleString() + ")";
        const link = " <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://en.wikipedia.org/wiki/Special:Search?search=" + this.target['name'] + "%2C+" + this.target['country'] + "&go=Go&ns0=1\">Learn!</a><br>"
        this.clients.forEach((socket,id) => {
            socket.emit('add history',  room, base + link)
            socket.emit('add history', room, "<br>")
        });
    }
    historyScore(player, score) {
        const room = this.room;
        this.clients.forEach((socket,id) => {
            socket.emit('add history', room, "<font color=\"" + player.color +"\">  Player " + player.name + ": " + score + "</font><br>")
        });
    }

}

module.exports = Room
