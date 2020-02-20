/**
 * Top level file for handling rendering and interactions on the client side.
 * // TODO: Split this into multiple classes for handling chat, game history, map, and panel separately
 */

const socket = io();
const Scoreboard = require('./scoreboard.js');
const Commands = require('./commands.js');
const Sounds = require('./sounds.js');
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
    socket.on('clear scores', () => {scoreboard.clearScores()});
    socket.on('post score', (rank, name, color, score, wins) => {scoreboard.postScore(rank,name,color,score,wins)});
    socket.on('post group', (category, dict) => {scoreboard.postGroup(category, dict)});
    socket.on('post space', () => {scoreboard.postSpace()});
    socket.on('post lobby', (recent, hall) => {scoreboard.postLobby(recent, hall)});
    socket.on('announce record', (category, room, medal, name, score, color) => {socket.emit("announcement", '[New ' + category + ' record set by <font color="' + color + '">' + medal + name + ' (' + score + ')</font> in ' + room + ']<br>')});
    socket.on('announce hall', (room, name, score, color) => {socket.emit("announcement", '<b>WOW!! <font color="' + color + '">' + name + '</font> made it into the hall of fame with ' + score + ' points in ' + room + '!!!  How is that even possible?!</b><br>')});

    /**** Commands *****/
    const sounds = new Sounds(socket);

    const commands = new Commands(socket);
    socket.on('update counts', (l,w,u,e,a,s,as,oc,m) => {commands.updateCounts(l,w,u,e,a,s,as,oc,m);commands.postButtons();})
    socket.on('draw buttons', () => {commands.postButtons()});
    socket.on('draw timer', (time,color) => {commands.postTime(time,color)});
    socket.on('draw prepare', (round) => {commands.drawCommand(" seconds until new game auto-starts...", "", "", "", round, true, false)});
    socket.on('draw begin', (time, round) => {
        commands.drawCommand(" seconds until first round..  GET READY!", "", "", "", round, false, false);
        if (time === CONSTANTS.BEGIN_GAME_DURATION) sounds.playGameBeginSound();
    });
    socket.on('draw guess city', (city, capital, iso2, round) => {
        commands.drawCommand( "Find!       ", city, capital, iso2, round, false, false);
        sounds.playRoundBeginSound();
    });
    socket.on('draw reveal city', (city, capital, iso2, round) => {
        commands.drawCommand("            ", city, capital, iso2, round, false, false);
        sounds.playRoundEndSound();
    });
    socket.on('draw booted', () => {commands.drawCommand("You have been booted due to inactivity!", "Please refresh to rejoin","", "",0, false, false)});
    socket.on('draw idle', () => {commands.drawCommand("Waiting for players to join...t", "", "", "", 0, false, false)});

    /**** Chat *****/
    const chat = new Chat(socket);

    window.onfocus = function () {
      chat.isActive(document);
    };
    window.onblur = function () {
      chat.isBlur();
    };
    chat.listen();
    socket.on("update custom messages", function(room, msg, font){
        chat.addCustomMessage(room, msg, font);
        sounds.newMessage(room)
    });
    socket.on("update messages", function(room, msg){
        chat.addMessage(room, msg);
        sounds.newMessage(room)
    });
    socket.on("mute player", function(id){
        sounds.muteMe(id);
        commands.muted = sounds.muted;
    });

    /**** Map *****/
    const map = new Map(socket);
    socket.on('draw point', (coords, color, radius) => {map.drawPoint(coords, color, radius)});
    socket.on('draw dist', (coords, color, distance) => {map.drawDist(coords, color, distance)});
    socket.on('draw answer', (coords) => {map.drawStar(coords)});
    socket.on('fresh map', (room) => map.drawMap(room));
    socket.on('blank map', (room) => map.drawBlank(room));
    socket.on('animate', () => map.drawAnimation());
    socket.on("render map", function(id, style, room){
        map.setStyle(id, style, room);
        commands.setStyle(id, style);
    });

    /**** History *****/
    const history = new History(socket);
    socket.on('break history', (room, winner, score, color, record) => {history.breakHistory(room, winner, score, color, record)});
    socket.on('draw chart', (hist,winner, color, room, max) => {history.drawChart(hist,winner, color, room, max)});
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
        sounds.myRoom = room;
    });
    setInterval(() => {
      if (playerClick.touchDown) playerClick.downCount = playerClick.downCount + 1;
      if (!playerClick.touchDown) socket.emit('playerClick', playerClick);
      if (chat.hasNewMessage) document.title = "(*) GeoScents"
    }, 1000 / CONSTANTS.FPS);

    const mouseUpHandler = (e) => {
      playerClick.mouseDown = false
      playerClick.downCount = 0;
      playerClick.touchDown = false;
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
      playerClick.mouseDown = false;
      playerClick.touchDown = false;
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
    canvas.addEventListener('click', function(evt) {
        var mousePos = getMousePosInPanel(canvas, evt);
        if (isInside(mousePos,commands.ready_button) && myRoom !== CONSTANTS.LOBBY) {
            socket.emit('playerReady');
            commands.drawCommand(" seconds until new game auto-starts...", "", "", "", 0, true, true)
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




