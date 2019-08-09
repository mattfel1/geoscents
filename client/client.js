const canvas = window.document.getElementById('map');
const ctx = canvas.getContext('2d');
const socket = io();

const CONSTANTS = require('../resources/constants.js')

// Connect
socket.emit('newPlayer');


/** MAP HANDLING */
const drawMap = (gameState) => {
  ctx.clearRect(0, 0, 800, 519);
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0)
  };
  img.src = "/resources/map.png"
}

socket.on('fresh map', (gameState) => drawMap(gameState))

socket.on('draw point', (coords, color) => {
  ctx.beginPath()
  ctx.arc(coords['col'] - CONSTANTS.POINT_RADIUS/2, coords['row'] - CONSTANTS.POINT_RADIUS/2, CONSTANTS.POINT_RADIUS,0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath()
  ctx.beginPath()
  ctx.arc(coords['col'] - CONSTANTS.POINT_RADIUS/2, coords['row'] - CONSTANTS.POINT_RADIUS/2, CONSTANTS.BUBBLE_RADIUS, 0, 2*Math.PI, false);
  ctx.lineWidth = CONSTANTS.BUBBLE_WIDTH;
  ctx.strokeStyle = color
  ctx.stroke();
  ctx.closePath()
});

const playerClick = {
  mouseDown: false,
  cursorX: 0,
  cursorY: 0
};
const mouseUpHandler = (e) => {
  if (window.event) playerClick.mouseDown = false
};
const mouseDownHandler = (e) => {
  playerClick.mouseDown = true

  var rect = canvas.getBoundingClientRect();
  playerClick.cursorX = e.clientX - rect.left
  playerClick.cursorY = e.clientY - rect.top
};

setInterval(() => {
  socket.emit('playerClick', playerClick);
}, 1000 / 60);
document.addEventListener('mousedown', mouseDownHandler, false);
document.addEventListener('mouseup', mouseUpHandler, false);




/** PANEL HANDLING */
const panel = window.document.getElementById('panel');
const panel_ctx = panel.getContext('2d');

const ready_button = {
    x:90,
    y:150,
    width:110,
    height:50
};
const timer_window = {
    x: 10,
    y: 5,
    width: 50,
    height: 50
};
const round_window = {
    x: 450,
    y: 40,
    width: 160,
    height: 40
};
const info_window = {
    x: 20,
    y: 80,
    width: 500,
    height: 140
}
const time_descrip_window = {
    x: 70,
    y: 10,
    width: 300,
    height: 40
}
const scoreboard_window = {
    x: 0,
    y: panel.height/2,
    width: panel.width,
    height: panel.height/2
};

function postTime(time) {
    panel_ctx.clearRect(timer_window['x'], timer_window['y'], timer_window['width'], timer_window['height']);
    panel_ctx.fillStyle =  "#e3e4e6";
    panel_ctx.fillRect(timer_window['x'], timer_window['y'], timer_window['width'], timer_window['height']);
    panel_ctx.font = "30px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(Math.max(time,0), timer_window['x']+5,timer_window['y'] + 33);
}

function postTimeDescrip(info) {
    panel_ctx.clearRect(time_descrip_window['x'], time_descrip_window['y'], time_descrip_window['width'], time_descrip_window['height'])
    panel_ctx.fillStyle = 'white';
    panel_ctx.fillRect(time_descrip_window['x'], time_descrip_window['y'], time_descrip_window['width'], time_descrip_window['height']);    panel_ctx.font = "25px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(info, time_descrip_window['x'] + 5, time_descrip_window['y']+25)
}

function postScore(rank, name, color, score, you) {
    if (rank == 0) {
        panel_ctx.clearRect(scoreboard_window['x'], scoreboard_window['y'], scoreboard_window['width'], scoreboard_window['height']);
        panel_ctx.fillStyle =  "#e3e4e6";
        panel_ctx.fillRect(scoreboard_window['x'], scoreboard_window['y'], scoreboard_window['width'], scoreboard_window['height']);
        panel_ctx.font = "35px Arial";
        panel_ctx.fillStyle = "black";
        panel_ctx.fillText("Scoreboard:", scoreboard_window['x'] + 5, scoreboard_window['y'] + 45)
    }

    panel_ctx.font = "30px Arial";
    panel_ctx.fillStyle = color;
    panel_ctx.fillText("Player " + name + ": " + score + ' ' + you, scoreboard_window['x'] + 80, scoreboard_window['y'] + 85 + rank * 40 )
}

function postReady(rank) {
    panel_ctx.font = "30px Arial";
    panel_ctx.fillStyle = "green";
    panel_ctx.fillText("RDY", scoreboard_window['x'] + 5, scoreboard_window['y'] + 85 + rank * 40 )
}


function postInfo(info1, info2, button) {
    panel_ctx.clearRect(info_window['x'], info_window['y'], info_window['width'], info_window['height']);
    panel_ctx.fillStyle = 'white';
    panel_ctx.fillRect(info_window['x'], info_window['y'], info_window['width'], info_window['height']);

    panel_ctx.font = "35px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(info1, info_window['x'] + 5, info_window['y'] + 28)

    panel_ctx.font = "35px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(info2, info_window['x'] + 5, info_window['y'] + 86)

    if (button) {
        panel_ctx.fillStyle = "orange";
        panel_ctx.fillRect(ready_button['x'], ready_button['y'], ready_button['width'], ready_button['height']);
        panel_ctx.font = "25px Arial";
        panel_ctx.fillStyle = 'black';
        panel_ctx.fillText('READY!', ready_button['x'] + 5, ready_button['y'] + 28)
    }
}

socket.on('post score', (rank, name, color, score, you) => {
    postScore(rank,name,color,score, you)
});

socket.on('player ready', (rank) => {
    postReady(rank);
})
socket.on('draw round', (round) => {
    panel_ctx.clearRect(round_window['x'], round_window['y'], round_window['width'], round_window['height']);
    panel_ctx.fillStyle = 'white';
    panel_ctx.fillRect(round_window['x'], round_window['y'], round_window['width'], round_window['height']);
    panel_ctx.font = "25px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText('Round ' + round + '/' + CONSTANTS.GAME_ROUNDS, round_window['x']+2,round_window['y'] + 25);
})

socket.on('draw timer', (time) => {
    postTime(time)
});

socket.on('draw prepare', () => {
    postInfo("Preparing next game...", "",true);
    postTimeDescrip("seconds until autostart");
})

// Draw game for client
socket.on('draw guess city', (city) => {
    postInfo("Locate this city!", city, false)
    postTimeDescrip("seconds remaining")
});

panel.addEventListener('click', function(evt) {
    var mousePos = getMousePosInPanel(panel, evt);
    if (isInside(mousePos,ready_button)) {
        socket.emit('playerReady')
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
//
//

/** CHAT WINDOW HANDLING */
const chat = window.document.getElementById('chat');
const chat_ctx = chat.getContext('2d');

const chatdisplay = {
    x: 0,
    y: 0,
    width: chat.width,
    height: 7*chat.height/8
};

function clearMessages() {
    chat_ctx.clearRect(chatdisplay['x'], chatdisplay['y'], chatdisplay['width'], chatdisplay['height']);
    chat_ctx.fillStyle =  "#f4fce0";
    chat_ctx.fillRect(chatdisplay['x'], chatdisplay['y'], chatdisplay['width'], chatdisplay['height']);
    chat_ctx.font = "20px Arial";
    chat_ctx.fillStyle =  "black";
    chat_ctx.fillText("HISTORY (chat box TBD):", chatdisplay['x']+5,chatdisplay['y'] + 40);
}
function postMessage(row, namecolor, name, payloadcolor, payload) {
    chat_ctx.font = "20px Arial";
    chat_ctx.fillStyle =  namecolor;
    chat_ctx.fillText(name + ": ", chatdisplay['x']+5,chatdisplay['y'] + 80 + row * 25);
    chat_ctx.fillStyle =  payloadcolor;
    chat_ctx.fillText(payload, chatdisplay['x']+90,chatdisplay['y'] + 80 + row * 25);
}
socket.on('reset chat', () => {clearMessages()});
socket.on('draw chat', (chat) => {//row, namecolor, name, payloadcolor, payload) => {
    var i;
    for (i = 0; i < Math.min(CONSTANTS.MSG_HISTORY, Object.values(chat.messages).length); i++) {
        const start = Math.max(Object.values(chat.messages).length - CONSTANTS.MSG_HISTORY, 0)
        const msg = chat.messages[start + i];
        postMessage(i, msg['namecolor'], msg['name'], msg['payloadcolor'], msg['payload']);
    }
});
