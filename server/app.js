const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const Papa = require('papaparse')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const col_margin = 60;
const map_width = 960 - col_margin*2;
const map_height = 720;
const zero_lat = 84.0*Math.PI/180 // Latitude of top edge of map
const max_lat = -80.0*Math.PI/180 // Latitude of bottom edge of map

// Game mechanics
const FPS = 60
const CONSTANTS = require('../resources/constants.js')
const CITIES = require('../resources/cities.js').CITIES

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});
// Map from https://commons.wikimedia.org/wiki/File:Mercator_Blank_Map_World.png
app.get('/resources/map.png', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'resources/map.png'));
});
// Cities from https://simplemaps.com/data/world-cities
// app.get('/resources/cities.js', (req, res, next) => {
// 	res.sendFile(path.join(__dirname, '..', 'resources/cities.js'));
// });

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
const gameState = {
  players: {},
  timer: CONSTANTS.GUESS_DURATION,
  target: randomCity(),
  state: CONSTANTS.ASK_READY_STATE,
  round: 0
}

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	socket.on('newPlayer', () => {
	  gameState.players[socket.id] = {
		row: 0,
		col: 0,
		width: 5,
		height: 5,
		color: CONSTANTS.COLORS[Object.keys(gameState.players).length],
        clicked: false,
		lat: 0,
		lon: 0,
		clickedAt: 0,
        id: socket.id,
		name: Object.values(gameState.players).length + 1,
		score: 0,
        ready: false
	  }
	  socket.emit('refresh map')
	});
	socket.on('disconnect', function() {
		console.log('user disconnected');
		delete gameState.players[socket.id]
	});

    socket.on('playerReady', () => {
      const player = gameState.players[socket.id]
      player.ready = true
    })
	socket.on('playerClick', (playerClick) => {
	  const player = gameState.players[socket.id]

	  if (playerClick.mouseDown && gameState.state == CONSTANTS.GUESS_STATE && !player.clicked) {
	  	if (playerClick.cursorX > col_margin && playerClick.cursorX < col_margin + map_width && playerClick.cursorY < map_height) {
	  		player.clicked = true;
			player.row = playerClick.cursorY;
			player.col = playerClick.cursorX;
			player.clickedAt = gameState.timer;
			var geo = mercToGeo(player.row, player.col)
			player.lat = geo['lat'];
			player.lon = geo['lon'];
			// console.log('click at ' + player.row + ',' + player.col + ' (' + player.lat + ',' + player.lon + ')')
            io.to(player.id).emit('draw point', {'row': player.row, 'col': player.col}, player.color)
		}
	  }
	})
});

function randomCity() {
	return CITIES[Math.floor(Math.random()*CITIES.length)];
}

function resetPlayer(player, i) {
	player.clicked = false;
	player.lat = 0
	player.lon = 0
	player.row = 0
	player.col = 0
	player.clickedAt = 0;
}

function deepResetPlayer(player, i) {
    resetPlayer(player, i)
    player.score = 0;
    player.ready = false;
}

function printPlayerScore(player, index) {
  io.sockets.emit('draw score', index, player.name, player.color, player.score);
  io.to(player.id).emit('you', index, player.color)
}

function showScores() {
	var sortedPlayers = Object.values(gameState.players).sort(function (a, b)  {(a.score > b.score) ? 1 : -1})
	var i = 0

	io.sockets.emit('clear scores')
	sortedPlayers.forEach(printPlayerScore)
}

function decrementTimer() {
	gameState.timer = gameState.timer - 1 / FPS
}

function setupRound() {
	Object.values(gameState.players).forEach(resetPlayer)
	gameState.target = randomCity();
    io.sockets.emit('refresh map');
}

function manageRound() {
  decrementTimer()
  if ( Math.floor((gameState.timer*100) % 100) == 0 ) {
	  io.sockets.emit('draw guess panel', Math.floor(((gameState.timer * 100)) / 100), gameState.target["name"] + ', ' + gameState.target["country"], gameState.round);
	  // io.clients[sessionID].send('')
  }
}

function mercDist(row1,col1,row2,col2) {
    return Math.sqrt(Math.pow(row1-row2,2) + Math.pow(col1-col2, 2))
}

function geoDist(lat1,lon1,lat2,lon2) {
    console.log('dist btw ' + lat1 + ',' + lon1 + ' and ' + lat2 + ',' + lon2)
	var a = Math.pow(Math.sin(Math.abs(lat1-lat2)/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(Math.abs(lon1-lon2)/2), 2,2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var dist = c;
	return dist
}

function mercToGeo(row,col) {
    var eqMin = Math.atanh(Math.sin(zero_lat));
    var eqRange = Math.atanh(Math.sin(max_lat)) - eqMin;
	var lon = ((col-col_margin)*360/map_width) - 180;
    var lat = Math.asin(Math.tanh((row*eqRange/map_height) + eqMin)) * 180 / Math.PI;
	return {'lat': lat, 'lon': lon}
}

function geoToMerc(lat, lon) {
	// get col value
	var col = (parseFloat(lon)+180)*(map_width/360) + col_margin;
	// convert from degrees to radians
	var latRad = parseFloat(lat)*Math.PI/180;
    var eqMin = Math.atanh(Math.sin(zero_lat));
    var eqRange = Math.atanh(Math.sin(max_lat)) - eqMin;
	// get row value
	var row = (map_height/eqRange) * (Math.atanh(Math.sin(latRad)) - eqMin);
	return {'row': row, 'col': col}
}

function scoreEquation(timeBonus, guess_row, guess_col, true_lat, true_lon) {
    // var dist = geoDist(player.lat, player.lon true_lat, true_lon)
    var merc = geoToMerc(true_lat, true_lon)
    var dist = mercDist(guess_row, guess_col, merc['row'], merc['col'])
    var score = Math.exp(-Math.pow(dist,2)/1000)*timeBonus*50
    // console.log('[' + guess_row + ',' + guess_col + '] to [' + merc['row'] + ',' + merc['col'] + '] = ' + score + ' dist ' + dist)
    return score
}

function updateScore(player) {
    var timeBonus = player.clickedAt;
	var update = scoreEquation(timeBonus, player.row, player.col, parseFloat(gameState.target['lat']), parseFloat(gameState.target['lon']));
    player.score = Math.floor(player.score + update)
}
function updateScores() {
	Object.values(gameState.players).forEach(updateScore)
}

function revealCity() {
    var answer = geoToMerc(gameState.target['lat'], gameState.target['lon'])
	io.sockets.emit('draw point', answer, 'orange')
   	showScores()
    gameState.round = gameState.round + 1
}
function manageReveal() {
	decrementTimer()
	if ( Math.floor((gameState.timer*100) % 100) == 0 ) {
	  io.sockets.emit('draw reveal panel', Math.floor(((gameState.timer * 100)) / 100), gameState.target["name"] + ", " + gameState.target["country"], gameState.round);
  }
}

function allPlayersClicked() {
    return Object.values(gameState.players).length > 0 && Object.values(gameState.players).filter(player => !player.clicked).length == 0
}

function numPlayers() {
    return Object.values(gameState.players).length;
}

function prepareGame() {
	Object.values(gameState.players).forEach(deepResetPlayer)
    io.sockets.emit('draw prepare panel', Math.floor(((gameState.timer * 100)) / 100));
    showScores()
    io.sockets.emit('refresh map');
}

function managePrepare() {
	decrementTimer()
	if ( Math.floor((gameState.timer*100) % 100) == 0 ) {
	  io.sockets.emit('draw prepare panel', Math.floor(((gameState.timer * 100)) / 100));
	  // io.clients[sessionID].send('')
  }
}

function allReady() {
  return Object.values(gameState.players).length > 0 && Object.values(gameState.players).filter(player => !player.ready).length == 0
}

function askReady() {
    io.sockets.emit('draw askready panel');
    showScores()
    io.sockets.emit('refresh map');
}

setInterval(() => {
  // Game flow state machine
  if (numPlayers() == 0) {
    gameState.state = CONSTANTS.IDLE_STATE
  }
  else if (numPlayers() > 0 && gameState.state == CONSTANTS.IDLE_STATE) {
    askReady()
    gameState.state = CONSTANTS.ASK_READY_STATE
  }
  else if (gameState.state == CONSTANTS.ASK_READY_STATE && allReady()) {
    prepareGame()
    gameState.state = CONSTANTS.PREPARE_GAME_STATE;
    gameState.timer = CONSTANTS.PREPARE_GAME_DURATION;
  }
  else if (gameState.state == CONSTANTS.ASK_READY_STATE) {
    // stay
  }
  else if (gameState.state == CONSTANTS.PREPARE_GAME_STATE && (gameState.timer <= 0)) {
  	gameState.state = CONSTANTS.SETUP_STATE;
  }
  else if (gameState.state == CONSTANTS.PREPARE_GAME_STATE) {
  	managePrepare()
  }
  else if (gameState.state == CONSTANTS.SETUP_STATE) {
  	setupRound();
	gameState.state = CONSTANTS.GUESS_STATE;
	gameState.timer = CONSTANTS.GUESS_DURATION;
  }
  else if (gameState.state == CONSTANTS.GUESS_STATE && (gameState.timer <= 0 || allPlayersClicked())) {
  	gameState.state = CONSTANTS.REVEAL_STATE;
  	gameState.timer = CONSTANTS.REVEAL_DURATION;
  	updateScores()
    revealCity()
  }
  else if (gameState.state == CONSTANTS.GUESS_STATE) {
  	manageRound();
  }
  else if (gameState.state == CONSTANTS.REVEAL_STATE && gameState.timer <= 0) {
  	gameState.state = CONSTANTS.SETUP_STATE;
  }
  else if (gameState.state == CONSTANTS.REVEAL_STATE) {
  	manageReveal();
  }
  else {
  	gameState.state = CONSTANTS.SETUP_STATE;
  }
}, 1000 / FPS);