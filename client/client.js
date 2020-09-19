/**
 * Top level file for handling rendering and interactions on the client side.
 * // TODO: Split this into multiple classes for handling chat, game history, map, and panel separately
 */

const socket = io();
const Scoreboard = require('./scoreboard.js');
const Commands = require('./commands.js');
const Sounds = require('./sounds.js');
const Popup = require('./popup.js');
const PrivatePopup = require('./privatepopup.js');
const Chat = require('./chat.js');
const Map = require('./map.js');
const History = require('./history.js');
const CONSTANTS = require('../resources/constants.js');

var myMap = CONSTANTS.LOBBY;
var myCitysrc = CONSTANTS.LOBBY;
var myRoomName = CONSTANTS.LOBBY;
const canvas = window.document.getElementById('map');
const panel = window.document.getElementById('panel');
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; // hack for scaling
var lastScale = 999; 
var noScale = false;
var betweenGames = true;
var clickedReady = false;
var booted = false;

const playerClick = {
  clickEvent: false,
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
    socket.on('post score title', (citysrc) => {scoreboard.postScoreTitle(citysrc)});
    socket.on('post space', () => {scoreboard.postSpace()});
    socket.on('post lobby', (recent, hall) => {scoreboard.postLobby(recent, hall)});
    socket.on('announce record', (category, room, medal, name, score, color) => {socket.emit("announcement", '[New ' + category + ' record set by <font color="' + color + '">' + medal + name + ' (' + score + ')</font> in ' + room + ']<br>')});
    socket.on('announce hall', (room, name, score, color) => {socket.emit("announcement", '<b>WOW!! <font color="' + color + '">' + name + '</font> made it into the hall of fame with ' + score + ' points in ' + room + '!!!  How is that even possible?!</b><br>')});

    /**** Commands *****/
    const sounds = new Sounds(socket);

    const commands = new Commands(socket);
    socket.on('update counts', (newdict) => {commands.updateCounts(newdict);commands.postButtons();})
    socket.on('draw buttons', () => {commands.postButtons()});
    socket.on('update joe button', (hasJoe) => {commands.hasJoe = hasJoe; commands.postButtons()});
    socket.on('draw timer', (time,color) => {commands.postTime(time,color)});
    socket.on('draw prepare', (round) => {
        betweenGames = true;
        commands.drawCommand(" seconds until new game auto-starts...", "", "", "", round, true, false)
    });
    socket.on('draw begin', (time, round) => {
        betweenGames = false;
        clickedReady = false;
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
    socket.on('draw booted', () => {
        commands.drawCommand("You have been booted due to inactivity!", "Please refresh to rejoin","", "",0, false, false)
        booted = true;
    });
    socket.on('draw idle', () => {commands.drawCommand("Waiting for players to join...", "", "", "", 0, false, false)});

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
    socket.on("jitter", function(id){
        if (socket.id == id) {
            noScale = !commands.antiJitter;
            commands.antiJitter = !commands.antiJitter;
            commands.setJitter(id)
            lastScale = 1;
            document.documentElement.style.zoom = 1;
            document.documentElement.style.MozTransform = "scale(1)";
            document.documentElement.style.MozTransformOrigin = "0 0";
        }
    });

    /**** PRIVATE POPUP *****/
    // Make player choose options
    const privatepopup = new PrivatePopup(socket);
    privatepopup.hide();
    socket.on('request private popup', () => {
        if (myRoomName.startsWith("private"))
            privatepopup.showPopup("Change map")
        else
            privatepopup.showPopup("Choose a map<br>(Ignored if room already exists)<br>")
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
    socket.on('moved to', (mapName, roomName, roomCitysrc, roomState) => {
        myMap = mapName;
        map.myMap = mapName;
        chat.myMap = mapName;
        scoreboard.myMap = mapName;
        commands.myMap = mapName;
        history.myMap = mapName;
        sounds.myMap = mapName;
        myRoomName = roomName;
        map.myRoomName = roomName;
        chat.myRoomName = roomName;
        scoreboard.myRoomName = roomName;
        commands.myRoomName = roomName;
        history.myRoomName = roomName;
        sounds.myRoomName = roomName;
        myCitysrc = roomCitysrc
        map.myCitysrc = myCitysrc;
        chat.myCitysrc = myCitysrc;
        scoreboard.myCitysrc = myCitysrc;
        commands.myCitysrc = myCitysrc;
        history.myCitysrc = myCitysrc;
        sounds.myCitysrc = myCitysrc;
        clickedReady = false;
        if (roomName.startsWith('private')) commands.labelPrivate(myCitysrc, privatepopup.code);
        else commands.clearPrivate()
        commands.postButtons()
        betweenGames = roomState === CONSTANTS.PREPARE_GAME_STATE;
    });
    setInterval(() => {
      if (playerClick.touchDown) playerClick.downCount = playerClick.downCount + 1;
      if (playerClick.clickEvent) {
        socket.emit('playerClick', playerClick);
        playerClick.clickEvent = false; 
      }
      if (chat.hasNewMessage) document.title = "(*) GeoScents"
    }, 1000 / CONSTANTS.FPS);

    setInterval(() => {
        // Set zoom for resolution
        const scale = Math.floor(50*Math.max(0.5, Math.min(1, window.innerWidth / 1920)))/50;
        if (scale != lastScale && !noScale) {
            lastScale = scale;
            document.documentElement.style.zoom = scale;
            document.documentElement.style.MozTransform = "scale(" + scale + ")";
            document.documentElement.style.MozTransformOrigin = "0 0";
        }
    }, 1000 / 5);

    const mouseUpHandler = (e) => {
      playerClick.mouseDown = false
      playerClick.downCount = 0;
      playerClick.touchDown = false; 
      playerClick.clickEvent = false;
    };
    const mouseDownHandler = (evt) => {
      playerClick.mouseDown = true
      playerClick.clickEvent = true;

      const mousePos = getMousePosInPanel(canvas, evt);
      // var rect = canvas.getBoundingClientRect();
      playerClick.cursorX = mousePos.x //e.clientX - rect.left
      playerClick.cursorY = mousePos.y //e.clientY - rect.top
    };
    const touchUpHandler = (e) => {
      playerClick.clickEvent = true;
      socket.emit('playerClick', playerClick);
      playerClick.downCount = 0;
      playerClick.mouseDown = false;
      playerClick.touchDown = false;
    };
    const touchDownHandler = (evt) => {
      playerClick.touchDown = true;
      playerClick.mouseDown = true;
      const mousePos = getTouchPosInPanel(canvas, evt);
      // var rect = canvas.getBoundingClientRect();
      playerClick.cursorX = mousePos.x //e.touches[0].clientX - rect.left
      playerClick.cursorY = mousePos.y //e.touches[0].clientY - rect.top
    };
    document.addEventListener('mousedown', mouseDownHandler, false);
    document.addEventListener('mouseup', mouseUpHandler, false);
    document.addEventListener("touchstart", touchDownHandler, false);
    document.addEventListener("touchend", touchUpHandler, false);
    canvas.addEventListener('click', function(evt) {
        var mousePos = getMousePosInPanel(canvas, evt);
        if (isInside(mousePos,commands.ready_button) && myMap !== CONSTANTS.LOBBY && betweenGames) {
            socket.emit('playerReady');
            commands.drawCommand(" seconds until new game auto-starts...", "", "", "", 0, true, true);
            clickedReady = true;
        }
        Object.values(map.clickable_buttons).forEach(function(btn) {
            if (isInside(mousePos,btn) && myMap === CONSTANTS.LOBBY && !popup.isShowing && !booted) {
                window.open(btn.link, '_blank');
                socket.emit('button clicked', btn.label);
            }
        })

        if (!(typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) {
            var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);
        }
    }, false);
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePosInPanel(canvas, evt);
        if (myMap === CONSTANTS.LOBBY && !popup.isShowing) {
            Object.values(map.clickable_buttons).forEach(function(btn) {
                if (isInside(mousePos,btn) && myMap === CONSTANTS.LOBBY && !popup.isShowing && !booted) {
                    map.highlightButton(btn);
                } else if (!booted) map.showButton(btn);
            })
        } else {
            if (betweenGames && !clickedReady && isInside(mousePos,commands.ready_button)) {
                commands.highlightReadyButton();
            } else if (betweenGames) commands.showReadyButton(clickedReady);
        }
    }, false);

    //Function to get the mouse position
    function getMousePosInPanel(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        let xPos;
        let yPos;
        if (isFirefox) {
            xPos = 1 / document.documentElement.style.zoom * (event.clientX - rect.left);
            yPos = 1 / document.documentElement.style.zoom * (event.clientY - rect.top);
        } else {
            xPos = (1 / document.documentElement.style.zoom * event.clientX) - rect.left;
            yPos = (1 / document.documentElement.style.zoom * event.clientY) - rect.top;
        }
        return {
            x: xPos,
            y: yPos
        };
    }
    function getTouchPosInPanel(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        let xPos;
        let yPos;
        if (isFirefox) {
            xPos = 1 / document.documentElement.style.zoom * (event.touches[0].clientX - rect.left);
            yPos = 1 / document.documentElement.style.zoom * (event.touches[0].clientY - rect.top);
        } else {
            xPos = (1 / document.documentElement.style.zoom * event.touches[0].clientX) - rect.left;
            yPos = (1 / document.documentElement.style.zoom * event.touches[0].clientY) - rect.top;
        }
        return {
            x: xPos,
            y: yPos
        };
    }
    //Function to check whether a point is inside a rectangle
    function isInside(pos, rect){
        return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
    }
});




