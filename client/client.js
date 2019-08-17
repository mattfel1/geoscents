/**
 * Top level file for handling rendering and interactions on the client side.
 * // TODO: Split this into multiple classes for handling chat, game history, map, and panel separately
 */

const socket = io();
const Scoreboard = require('./scoreboard.js');
const Commands = require('./commands.js');
const Popup = require('./popup.js');
const Chat = require('./chat.js');
const Map = require('./map.js');
const History = require('./history.js');
const CONSTANTS = require('../resources/constants.js');

var myRoom = CONSTANTS.LOBBY;
const canvas = window.document.getElementById('map');
const panel = window.document.getElementById('panel');

const playerClick = {
  mouseDown: false,
  touchDown: false,
  downCount: 0,
  cursorX: 0,
  cursorY: 0
};

$(document).ready(function(){
    // Player connects
    socket.emit('newPlayer');

    /**** POPUP *****/
    // Make player choose name
    const popup = new Popup(socket);
    popup.showPopup();

    /**** Scoreboard *****/
    const scoreboard = new Scoreboard(socket);
    socket.on('clear scores', (record, color, name, drawPopper) => {scoreboard.clearScores(record,color,name,drawPopper)});
    socket.on('post score', (rank, name, color, score, wins, you, trophy) => {scoreboard.postScore(rank,name,color,score,wins,you,trophy)});
    socket.on('player ready', (rank) => {scoreboard.postReady(rank)});

    /**** Commands *****/
    const commands = new Commands(socket);
    socket.on('update counts', (w,u,e) => {commands.updateCounts(w,u,e);})
    socket.on('draw back button', () => {commands.postBackToLobby()});
    socket.on('draw lobby', () => {commands.postLobby()});
    socket.on('draw round', (round) => {commands.drawRound(round)});
    socket.on('draw timer', (time,color) => {commands.postTime(time,color)});
    socket.on('draw prepare', () => {commands.postInfo("Preparing next game...", "", true, ""); commands.postTimeDescrip("seconds until autostart")});
    socket.on('draw booted', () => {commands.postInfo("You have been booted due to inactivity!", "Please refresh to rejoin",false, "")});
    socket.on('draw idle', () => {commands.postInfo("Waiting for players to join...", "", false, "")})
    socket.on('draw guess city', (city, capital) => {commands.postInfo("Locate this city!", city, false, capital); commands.postTimeDescrip("seconds remaining")});
    socket.on('draw reveal city', (city, capital) => {commands.postInfo("Revealing...", city, false, capital); commands.postTimeDescrip("seconds until next round")});

    /**** Chat *****/
    const chat = new Chat(socket);
    window.onfocus = function () {
      chat.isActive(document);
    };
    window.onblur = function () {
      chat.isBlur();
    };
    chat.listen();
    socket.on("update messages", function(room, msg){ chat.addMessage(room, msg)});

    /**** Map *****/
    const map = new Map(socket);
    socket.on('draw point', (coords, color) => {map.drawPoint(coords, color)})
    socket.on('fresh map', (room) => map.drawMap(room));
    socket.on('animate', () => map.drawAnimation());

    /**** History *****/
    const history = new History(socket);
    socket.on('break history', (room, winner, score, color, record) => {history.breakHistory(room, winner, score, color, record)});
    socket.on('add history', (room, payload) => {history.addHistory(room, payload)});

    /***** Player interactions *****/
    socket.on('request boot', function(id){socket.emit('bootPlayer', id)});
    socket.on('moved to', (room) => {
        myRoom = room;
        map.myRoom = room;
        chat.myRoom = room;
        scoreboard.myRoom = room;
        commands.myRoom = room;
        history.myRoom = room;
    });
    setInterval(() => {
      if (playerClick.touchDown) playerClick.downCount = playerClick.downCount + 1;
      if (!playerClick.touchDown) socket.emit('playerClick', playerClick);
      if (chat.hasNewMessage) document.title = "(*) GeoScents"
    }, 1000 / CONSTANTS.FPS);

    const mouseUpHandler = (e) => {
      playerClick.mouseDown = false
    };
    const mouseDownHandler = (e) => {
      playerClick.mouseDown = true

      var rect = canvas.getBoundingClientRect();
      playerClick.cursorX = e.clientX - rect.left
      playerClick.cursorY = e.clientY - rect.top
    };
    const touchUpHandler = (e) => {
      socket.emit('playerClick', playerClick);
      playerClick.downCount = 0;
      playerClick.mouseDown = false
    };
    const touchDownHandler = (e) => {
      playerClick.touchDown = true;
      playerClick.mouseDown = true;

      var rect = canvas.getBoundingClientRect();
      playerClick.cursorX = e.touches[0].clientX - rect.left
      playerClick.cursorY = e.touches[0].clientY - rect.top
    };
    document.addEventListener('mousedown', mouseDownHandler, false);
    document.addEventListener('mouseup', mouseUpHandler, false);
    document.addEventListener("touchstart", touchDownHandler, false);
    document.addEventListener("touchend", touchUpHandler, false);
    panel.addEventListener('click', function(evt) {
        var mousePos = getMousePosInPanel(panel, evt);
        if (isInside(mousePos,commands.ready_button) && myRoom != CONSTANTS.LOBBY) {
            socket.emit('playerReady')
        }
        if (isInside(mousePos,commands.lobby_button) && myRoom != CONSTANTS.LOBBY) {
            socket.emit('moveTo', CONSTANTS.LOBBY)
        }
        else if (isInside(mousePos,commands.world_button) && myRoom == CONSTANTS.LOBBY) {
            socket.emit('moveTo', CONSTANTS.WORLD)
        }
        else if (isInside(mousePos,commands.us_button) && myRoom == CONSTANTS.LOBBY) {
            socket.emit('moveTo', CONSTANTS.US)
        }
        else if (isInside(mousePos,commands.euro_button) && myRoom == CONSTANTS.LOBBY) {
            socket.emit('moveTo', CONSTANTS.EURO)
        }
    }, false);

    //Function to get the mouse position
    function getMousePosInPanel(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    //Function to check whether a point is inside a rectangle
    function isInside(pos, rect){
        return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
    }
});




