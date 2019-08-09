const canvas = window.document.getElementById('map');
const ctx = canvas.getContext('2d');
const socket = io();

const CONSTANTS = require('../resources/constants.js')

// Connect
socket.emit('newPlayer');

const drawPoint = (point) => {
  ctx.beginPath();
  ctx.rect(point.row, point.col, point.width, point.height);
  ctx.fillStyle = point.color;
  ctx.fill();
  ctx.closePath();
};

const drawMap = (gameState) => {
  ctx.clearRect(0, 0, 800, 519);
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0)
  };
  img.src = "/resources/map.png"
}

socket.on('refresh map', (gameState) => drawMap(gameState))

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




/* PANEL */
const panel = window.document.getElementById('panel');
const panel_ctx = panel.getContext('2d');

var ready_button = {
    x:90,
    y:90,
    width:100,
    height:50
};

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

// Draw game for client
socket.on('draw guess panel', (time, city, round) => {
    panel_ctx.clearRect(0, 0, panel.width, panel.height/2);
    panel_ctx.fillStyle = "#e3e4e6";
    panel_ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    panel_ctx.font = "20px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText("Locate this city!" , 20,50);
    panel_ctx.fillStyle = "dark orange";
    panel_ctx.fillText(city, 20, 80)
    panel_ctx.fillStyle = "black";
    panel_ctx.font = "15px Arial";
    panel_ctx.fillText("Time remaining: " + time , 40,120);
    panel_ctx.fillText("Round " + round + "/" + CONSTANTS.GAME_ROUNDS, 230, 18)
});

// Draw game for client
socket.on('draw reveal panel', (time, city, round) => {
    panel_ctx.clearRect(0, 0, panel.width, panel.height/2);
    panel_ctx.fillStyle = "#e3e4e6";
    panel_ctx.fillRect(0, 0, panel.width, panel.height/2);
    panel_ctx.font = "20px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(city, 20, 80)
    panel_ctx.font = "15px Arial";
    panel_ctx.fillText("Next round in: " + time , 40,120);
    panel_ctx.fillText("Round " + round + "/" + CONSTANTS.GAME_ROUNDS, 230, 18)
});

socket.on('draw prepare panel', (time) => {
    panel_ctx.clearRect(0, 0, panel.width, panel.height/2);
    panel_ctx.fillStyle = "#e3e4e6";
    panel_ctx.fillRect(0, 0, panel.width, panel.height/2);
    panel_ctx.font = "25px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText("Next game starts in: " + time, 20, 80)

    panel_ctx.fillStyle = "orange";
    panel_ctx.fillRect(ready_button['x'], ready_button['y'], ready_button['width'], ready_button['height']);
    panel_ctx.font = "25px Arial";
    panel_ctx.fillStyle = 'black';
    panel_ctx.fillText('YES!', 100, 120)
})


socket.on('clear scores', () => {
  panel_ctx.clearRect(0, panel.height/2, panel.width, panel.height/2)
  panel_ctx.fillStyle = "#e3e4e6";
  panel_ctx.fillRect(0, panel.height/2, panel.width, panel.height/2);
  panel_ctx.font = "15px Arial";
  panel_ctx.fillStyle = "black";
  panel_ctx.fillText("Scoreboard:", 20, panel.height/2 + 10)
});

socket.on('draw score', (id, name, color, score) => {
  panel_ctx.fort = "15px Arial";
  panel_ctx.fillStyle = color;
  panel_ctx.fillText("Player " + name + ": " + score, 20, panel.height/2 + 50 + id * panel.height/10 )
})

socket.on('draw score', (id, color) => {
  panel_ctx.fort = "15px Arial";
  panel_ctx.fillStyle = color;
  panel_ctx.fillText("(you)", 140, panel.height/2 + 50 + id * panel.height/10 )
})