/**
  * Class for managing the game flow within a room.
  * // TODO: Currently entire game has one room, but the plan is to have multiple rooms to choose from with player caps
  */

const CONSTANTS = require('../resources/constants.js');
const Geography = require('./geography.js');
const Player = require('./player.js');

class Room {
    constructor(capacity, id) {
      this.id = id;
      this.capacity = capacity;
      // Map from socketID -> socket object
      this.clients = new Map();
      // Map from socketID -> player
      this.players = new Map();
      this.ordinalCounter = 0;
      this.timer = CONSTANTS.GUESS_DURATION;
      this.target = Geography.randomCity();
      this.playedCities = {};
      this.state = CONSTANTS.IDLE_STATE;
      this.round = 0;
      this.winner = "";
    }

    // Player basic IO
    addPlayer(socket) {
      var player = new Player(socket.id, this.players.size, socket.handshake.address, this.ordinalCounter, this.ordinalCounter)
      this.clients.set(socket.id, socket)
      this.players.set(socket.id, player)
      this.ordinalCounter = this.ordinalCounter + 1;
      this.drawUpperPanel(socket.id);
      this.drawLowerPanel(socket.id);
      socket.emit('fresh map');
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
        const ip = socket.handshake.address
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


    killPlayer(socket) {
      console.log('user disconnected');
      if (this.clients.has(socket.id)) {
        this.clients.delete(socket.id)
      }
      if (this.players.has(socket.id)) {
        this.players.delete(socket.id)
      }
    }

    playerReady(socket) {
      const player = this.players.get(socket.id);
      player.ready = true
    }

    playerClicked(socket, playerClick) {
      if (this.players.has(socket.id)) {
          const player = this.players.get(socket.id);

          if (playerClick.mouseDown && this.state == CONSTANTS.GUESS_STATE && !player.clicked) {
              if (playerClick.cursorX < CONSTANTS.MAP_WIDTH && playerClick.cursorY < CONSTANTS.MAP_HEIGHT) {
                  player.clicked = true;
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

    printScoresWithSelf(sortedPlayers, socket, socketId) {
        sortedPlayers.forEach(function(player, index) {
          if (player.id == socketId) {
              socket.emit('post score', player.rank, player.name, player.color, player.score, '   (you)');
          }
          else socket.emit('post score', player.rank, player.name, player.color, player.score, '');
        })
    }

    decrementTimer() {
        this.timer = this.timer - 1 / CONSTANTS.FPS
    }

    updateScores() {
      const target = this.target;
      this.historyRound(this.round, target['name'], target['country'], target['population'], target['capital'])
      const historyScore = (player, payload) => {this.historyScore(player, payload)}
      Array.from(this.players.values()).forEach(function(player) {
          var timeBonus = player.clickedAt;
          var merc = Geography.geoToMerc(parseFloat(target['lat']), parseFloat(target['lon']))
          var dist = Geography.mercDist(player.row, player.col, merc['row'], merc['col'])
          var update = Math.exp(-Math.pow(dist,2)/1000)*timeBonus*50
          historyScore(player, " + " + Math.floor(update ) + " (Distance: " + Math.floor(dist) + ", Time Bonus: " + (Math.floor(timeBonus * 10) / 10) + ")")
          player.score = Math.floor(player.score + update)
        })
    }

    broadcastPoint(row, col, color) {
      this.clients.forEach(function(s,id) {
          s.emit('draw point', {'row': row, 'col': col}, color)
      });
    }

    revealAll() {
        var answer = Geography.geoToMerc(this.target['lat'], this.target['lon']);
        this.broadcastPoint(answer['row'], answer['col'], CONSTANTS.TRUTH_COLOR);
        this.players.forEach((player,id) => {
            this.broadcastPoint(player.row, player.col, player.color);
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
       const cityname = this.target['name'];
       const citycountry = this.target['country'];
       var capital = "";
       if (this.target['capital'] == "primary") capital = "(* CAPITAL CITY)";
       this.clients.forEach(function(socket, socketId) {
           socket.emit('draw round', round);
           if (state == CONSTANTS.IDLE_STATE) {
               // ???
           }
           if (state == CONSTANTS.PREPARE_GAME_STATE) {
               socket.emit('draw prepare')
           }
           if (state == CONSTANTS.SETUP_STATE) {
                // ???
           }
           if (state == CONSTANTS.GUESS_STATE) {
               socket.emit('draw guess city', cityname + ', ' + citycountry, capital)
           }
           if (state == CONSTANTS.REVEAL_STATE) {
               socket.emit('draw reveal city', cityname + ', ' + citycountry, capital)
               revealAll();
           }
       })
    }

    drawLowerPanel() {
        const players = this.players;
        this.clients.forEach((s,id) => this.printScoresWithSelf(Array.from(this.players.values()),s,id))
        this.clients.forEach(function(s,id) {
            Array.from(players.values()).forEach(function(player,i) {
              if (player.ready) s.emit('player ready', player.rank)
            });
        });

    }

    sortPlayers() {
        var sortedPlayers = Array.from(this.players.values()).sort((a, b) => {(a.score > b.score) ? 1 : -1})
        Array.from(sortedPlayers).forEach((p,i) => p.rank = i);
        this.winner = Array.from(sortedPlayers)[0].name;
    }

    fsm() {
      // Game flow state machine
      const timer = this.timer;
      const drawUpperPanel = () => {this.drawUpperPanel()};
      const drawLowerPanel = () => {this.drawLowerPanel()};
      this.onSecond(() => {this.clients.forEach(function(socket,id) {socket.emit('draw timer', Math.floor(((timer * 1000)) / 1000))})})
      this.decrementTimer();
      if (this.numPlayers() == 0) {
        this.state = CONSTANTS.IDLE_STATE;
      }
      else if (this.numPlayers() > 0 && this.state == CONSTANTS.IDLE_STATE) {
        this.stateTransition(CONSTANTS.PREPARE_GAME_STATE, CONSTANTS.PREPARE_GAME_DURATION);
        this.round = 0;
      }
      else if (this.state == CONSTANTS.PREPARE_GAME_STATE) {
          if (this.allReady() || this.timer <= 0) {
            this.stateTransition(CONSTANTS.SETUP_STATE,0);
            Array.from(this.players.values()).forEach((player,i)=> player.deepReset(i))
          }
          else {
              this.onSecond(function() {
                  drawUpperPanel();
                  drawLowerPanel();
              });
          }
      }
      else if (this.state == CONSTANTS.SETUP_STATE) {
        this.target = Geography.randomCity();
        Array.from(this.players.values()).forEach((p,id) => {p.reset()})
        this.playedCities[this.round] = this.target;
        Array.from(this.clients.values()).forEach((socket,id) => {socket.emit('fresh map')})
        this.stateTransition(CONSTANTS.GUESS_STATE, CONSTANTS.GUESS_DURATION);
      }
      else if (this.state == CONSTANTS.GUESS_STATE) {
          if ((this.timer <= 0 || this.allPlayersClicked()) && this.round < CONSTANTS.GAME_ROUNDS) {
            this.updateScores();
            this.sortPlayers();
            this.stateTransition(CONSTANTS.REVEAL_STATE, CONSTANTS.REVEAL_DURATION);
          }
          else if ((this.timer <= 0 || this.allPlayersClicked())) {
            this.updateScores();
            this.sortPlayers();
            this.historyNewGame(this.winner)
            this.stateTransition(CONSTANTS.PREPARE_GAME_DURATION, CONSTANTS.PREPARE_GAME_DURATION)
          }
      }
      else if (this.state == CONSTANTS.REVEAL_STATE) {
          if (this.timer <= 0) { //&& this.round < CONSTANTS.GAME_ROUNDS - 1) {
            this.round = this.round + 1;
            this.stateTransition(CONSTANTS.SETUP_STATE,0);
          }
      }
      // else if (this.state == CONSTANTS.REVEAL_STATE && this.timer <= 0 && this.round >= CONSTANTS.GAME_ROUNDS - 1) {
      // 	this.state = CONSTANTS.PREPARE_GAME_STATE;
      // 	this.timer = CONSTANTS.PREPARE_GAME_DURATION;
      // }
      else {
        this.stateTransition(CONSTANTS.IDLE_STATE,0)
      }
    }

    historyNewGame(winner) {
        this.clients.forEach((socket,id) => {
            socket.emit('break history',  winner)
        });
    }
    historyRound(round, city, country, pop, capital) {
        var star = ""
        if (capital == 'primary') star = "*";
        const base = "Round " + round + ": " + star + city + ", " + country + " (pop: " + pop.toLocaleString() + ")"
        const link = " <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://en.wikipedia.org/wiki/Special:Search?search=" + city + "%2C+" + country + "&go=Go&ns0=1\">Learn!</a><br>"
        this.clients.forEach((socket,id) => {
            socket.emit('add history',  base + link)
        });
    }
    historyScore(player, score) {
        this.clients.forEach((socket,id) => {
            socket.emit('add history', "<font color=\"" + player.color +"\">  Player " + player.name + ": " + score + "</font><br>")
        });
    }

}

module.exports = Room
