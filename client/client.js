/**
 * Top level file for handling rendering and interactions on the client side.
 * // TODO: Split this into multiple classes for handling chat, game history, map, and panel separately
 */

const canvas = window.document.getElementById('map');
const ctx = canvas.getContext('2d');
const socket = io();

const CONSTANTS = require('../resources/constants.js')

// Connect
socket.emit('newPlayer');
var chatcount = 0;
var histcount = 0;
var myRoom = CONSTANTS.LOBBY;
var us_count = 0;
var world_count = 0;
var euro_count = 0;
var frame_cnt = 0;
var frames = 8*9;
var rate = 2;

function canvas_arrow(context, fromx, fromy, tox, toy) {
  var headlen = 50; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.fillStyle = 'black';
  context.lineWidth = 10;
  context.beginPath();
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  context.stroke();
  context.closePath()
}

// Globe animation
//
// function sprite (options) {
//     var that = {};
//     that.context = options.context;
//     that.width = options.width;
//     that.height = options.height;
//     that.image = options.image;
//     that.render = function () {
//         // Draw the animation
//         that.context.drawImage(
//            that.image,
//            0,
//            0,
//            that.width,
//            that.height,
//            200,
//            200,
//            that.width,
//            that.height);
//     };
//     return that;
// }
// var globe = sprite({
//     context: ctx,
//     width: 450,
//     height: 450,
//     image: globeImage
// });

/** MAP HANDLING */

var globeImage = new Image();
globeImage.src = "/resources/spritesheet.png";

var worldImg = new Image()
worldImg.src = "/resources/world.png";


var usImg = new Image()
usImg.src = "/resources/us.png";


var euroImg = new Image()
euroImg.src = "/resources/euro.png";


const drawAnimation = () => {
    frame_cnt = (frame_cnt + 1) % (frames*rate);
    const sx = Math.floor(frame_cnt/rate) * 450;
    globeImage.onload = function (sx) {
      return ctx.drawImage(globeImage, sx,0,450,450,50, 100,450,450);
    };
    globeImage.onload(sx);
};
const drawMap = (room) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (room == CONSTANTS.LOBBY){
    // Banner message
    ctx.fillStyle = CONSTANTS.BGCOLOR;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = "50px Arial";
    ctx.fillStyle = 'black';
    ctx.fillText('Welcome to GeoScents!', 300, 50);
    ctx.fillText('Locate cities as quickly and accurately as possible!',10,110);

    // Instructions
    ctx.font = "35px Arial";
    ctx.fillStyle = 'black';
    ctx.fillText('Choose a map to play on and the', 700, 310);
    ctx.fillText('target cities will show up here', 700, 350);
    canvas_arrow(ctx, 1200, 340, canvas.width - 20, 220);

    ctx.fillText('See how everyone did and', 800, 590);
    ctx.fillText('learn about the cities here', 800, 625);
    canvas_arrow(ctx, 1100, 650, canvas.width - 70, canvas.height - 20);

    ctx.fillText('Map will appear here', 480, 480);

    ctx.fillText('Discuss here', 100, 610);
    canvas_arrow(ctx, 200, 650, 200, canvas.height-20);

  }
  else if (room == CONSTANTS.WORLD){
        worldImg.onload = function () {
            ctx.drawImage(worldImg, 0, 0)
        };
      worldImg.onload();
  }
  else if (room == CONSTANTS.US){
        usImg.onload = function () {
            ctx.drawImage(usImg, 0, 0)
        };
      usImg.onload();
  }
  else if (room == CONSTANTS.EURO){
        euroImg.onload = function () {
            ctx.drawImage(euroImg, 0, 0)
        };
      euroImg.onload();
  }

}

socket.on('update counts', (w,u,e) => {
   world_count = w;
   us_count = u;
   euro_count = e;
});

socket.on('fresh map', (room) => drawMap(room));
socket.on('animate', () => drawAnimation());

socket.on('draw point', (coords, color) => {
  ctx.beginPath();
  ctx.arc(coords['col'] - CONSTANTS.POINT_RADIUS/2, coords['row'] - CONSTANTS.POINT_RADIUS/2, CONSTANTS.POINT_RADIUS,0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(coords['col'] - CONSTANTS.POINT_RADIUS/2, coords['row'] - CONSTANTS.POINT_RADIUS/2, CONSTANTS.BUBBLE_RADIUS, 0, 2*Math.PI, false);
  ctx.lineWidth = CONSTANTS.BUBBLE_WIDTH;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath()
});

const playerClick = {
  mouseDown: false,
  touchDown: false,
  downCount: 0,
  cursorX: 0,
  cursorY: 0
};
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

setInterval(() => {
  if (playerClick.touchDown) playerClick.downCount = playerClick.downCount + 1;
  if (!playerClick.touchDown) socket.emit('playerClick', playerClick);
}, 1000 / CONSTANTS.FPS);
document.addEventListener('mousedown', mouseDownHandler, false);
document.addEventListener('mouseup', mouseUpHandler, false);
document.addEventListener("touchstart", touchDownHandler, false);
document.addEventListener("touchend", touchUpHandler, false);
// document.addEventListener('click', (e) => {
//     mouseDownHandler(e);
//     mouseUpHandler(e);
// }, false);




/** PANEL HANDLING */
const panel = window.document.getElementById('panel');
const panel_ctx = panel.getContext('2d');
const info_x = panel.width*20/600;
const buttons_height = panel.height*50/824;
const buttons_width = panel.width*275/600;
const buttons_font = buttons_height*0.5;
const buttons_spacing = 5;
const info_big_font = panel.height*30/824;
const info_little_font = panel.height*20/824;
const info_spacing = info_big_font + 10;
const ready_button = {
    x:info_x,
    y:80 + buttons_height + buttons_spacing,
    width:buttons_width,
    height:buttons_height
};
const world_button = {
    x:info_x,
    y:80,
    width:buttons_width,
    height:buttons_height
};
const us_button = {
    x:info_x,
    y:80 + buttons_height + buttons_spacing,
    width:buttons_width,
    height:buttons_height
};
const euro_button = {
    x:info_x,
    y:80 + 2*(buttons_height + buttons_spacing),
    width:buttons_width,
    height:buttons_height
};
const timer_window = {
    x: 10,
    y: 5,
    width: buttons_height,
    height: buttons_height
};
const lobby_button = {
    x: panel.width*400/600,
    y: panel.height*210/824,
    width: panel.width*175/600,
    height: buttons_height
};
const round_window = {
    x: panel.width*440/600,
    y: 40,
    width: (panel.width-30)*160/600,
    height: 40
};
const info_window = {
    x: info_x,
    y: 80,
    width: panel.width - 30,
    height: panel.height*180/824
}
const time_descrip_window = {
    x: 70,
    y: 10,
    width: 300,
    height: 40
}
const scoreboard_window = {
    x: 0,
    y: panel.height/3,
    width: panel.width-15,
    height: 2*panel.height/3
};

function postTime(time, color) {
    panel_ctx.fillStyle = color;
    panel_ctx.clearRect(timer_window['x'], timer_window['y'], timer_window['width'], timer_window['height']);
    panel_ctx.fillRect(timer_window['x'], timer_window['y'], timer_window['width'], timer_window['height']);
    panel_ctx.font = info_big_font + "px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(Math.max(time,0), timer_window['x']+5,timer_window['y'] + 33);
}

function postTimeDescrip(info) {
    panel_ctx.clearRect(time_descrip_window['x'], time_descrip_window['y'], time_descrip_window['width'], time_descrip_window['height'])
    panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
    panel_ctx.fillRect(time_descrip_window['x'], time_descrip_window['y'], time_descrip_window['width'], time_descrip_window['height']);    panel_ctx.font = "25px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(info, time_descrip_window['x'] + 5, time_descrip_window['y']+25)
}

function postScore(rank, name, color, score, wins, you) {
    panel_ctx.font = info_big_font + "px Arial";
    panel_ctx.fillStyle = color;
    panel_ctx.fillText("Player " + name + ": " + score + '  (' + wins + ' wins)' + you, scoreboard_window['x'] + 80, scoreboard_window['y'] + 85 + rank * 40 )
}

function postReady(rank) {
    panel_ctx.font = info_big_font + "px Arial";
    panel_ctx.fillStyle = "green";
    panel_ctx.fillText("RDY", scoreboard_window['x'] + 5, scoreboard_window['y'] + 85 + rank * 40 )
}


function postLobby() {
    panel_ctx.clearRect(time_descrip_window['x'], time_descrip_window['y'], time_descrip_window['width'], time_descrip_window['height'])
    panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
    panel_ctx.fillRect(time_descrip_window['x'], time_descrip_window['y'], time_descrip_window['width'], time_descrip_window['height']);    panel_ctx.font = "25px Arial";
    panel_ctx.clearRect(timer_window['x'], timer_window['y'], timer_window['width'], timer_window['height']);
    panel_ctx.fillRect(timer_window['x'], timer_window['y'], timer_window['width'], timer_window['height']);


    panel_ctx.clearRect(info_window['x'], info_window['y'], info_window['width'], info_window['height']);
    panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
    panel_ctx.fillRect(info_window['x'], info_window['y'], info_window['width'], info_window['height']);

    panel_ctx.clearRect(round_window['x'], round_window['y'], round_window['width'], round_window['height']);
    panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
    panel_ctx.fillRect(round_window['x'], round_window['y'], round_window['width'], round_window['height']);

    panel_ctx.fillStyle = CONSTANTS.MAP_BUTTON_COLOR;
    panel_ctx.fillRect(world_button['x'], world_button['y'], world_button['width'], world_button['height']);
    panel_ctx.font = buttons_font + "px Arial";
    panel_ctx.fillStyle = 'black';
    panel_ctx.fillText(CONSTANTS.WORLD + '  (' + world_count + ' players)', world_button['x'] + 5, world_button['y'] + 28)

    panel_ctx.fillStyle = CONSTANTS.MAP_BUTTON_COLOR;
    panel_ctx.fillRect(us_button['x'], us_button['y'], us_button['width'], us_button['height']);
    panel_ctx.font = buttons_font + "px Arial";
    panel_ctx.fillStyle = 'black';
    panel_ctx.fillText(CONSTANTS.US + ' (' + us_count + ' players)', us_button['x'] + 5, us_button['y'] + 28)

    panel_ctx.fillStyle = CONSTANTS.MAP_BUTTON_COLOR;
    panel_ctx.fillRect(euro_button['x'], euro_button['y'], euro_button['width'], euro_button['height']);
    panel_ctx.font = buttons_font + "px Arial";
    panel_ctx.fillStyle = 'black';
    panel_ctx.fillText(CONSTANTS.EURO + '  (' + euro_count + ' players)', euro_button['x'] + 5, euro_button['y'] + 28)

}

function postInfo(info1, info2, button, capital) {
    panel_ctx.clearRect(info_window['x'], info_window['y'], info_window['width'], info_window['height']);
    panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
    panel_ctx.fillRect(info_window['x'], info_window['y'], info_window['width'], info_window['height']);

    panel_ctx.font = info_big_font + "px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(info1, info_window['x'] + 5, info_window['y'] + 28)

    if (info2.length < CONSTANTS.LONGCITY) {
        panel_ctx.font = info_big_font + "px Arial";
    }
    else {
        panel_ctx.font = info_little_font + "px Arial";
    }

    panel_ctx.fillStyle = "black";
    panel_ctx.fillText(info2, info_window['x'] + 5, info_window['y'] + 26 + info_spacing)

    if (button) {
        panel_ctx.fillStyle = "orange";
        panel_ctx.fillRect(ready_button['x'], ready_button['y'], ready_button['width'], ready_button['height']);
        panel_ctx.font = buttons_font + "px Arial";
        panel_ctx.fillStyle = 'black';
        panel_ctx.fillText('CLICK IF READY!', ready_button['x'] + 5, ready_button['y'] + 28)
    }

    if (capital != "") {
        panel_ctx.font = info_big_font + "px Arial";
        panel_ctx.fillStyle = "black";
        panel_ctx.fillText(capital, info_window['x'] + 15, info_window['y'] + 26 + 2*info_spacing)
    }
}

socket.on('clear scores', () => {
    panel_ctx.clearRect(scoreboard_window['x'], scoreboard_window['y'], scoreboard_window['width'], scoreboard_window['height']);
    panel_ctx.fillStyle =  "#e3e4e6";
    panel_ctx.fillRect(scoreboard_window['x'], scoreboard_window['y'], scoreboard_window['width'], scoreboard_window['height']);
    panel_ctx.font = "35px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText("Scoreboard:", scoreboard_window['x'] + 5, scoreboard_window['y'] + 45)

    if (myRoom != CONSTANTS.LOBBY) {
        panel_ctx.fillStyle = CONSTANTS.MAP_BUTTON_COLOR;
        panel_ctx.fillRect(lobby_button['x'], lobby_button['y'], lobby_button['width'], lobby_button['height']);
        panel_ctx.font = buttons_font + "px Arial";
        panel_ctx.fillStyle = 'black';
        panel_ctx.fillText('Back to Lobby', lobby_button['x'] + 5, lobby_button['y'] + 28)
    }
});
socket.on('post score', (rank, name, color, score, wins, you) => {
    postScore(rank,name,color,score, wins, you)
});

socket.on('player ready', (rank) => {
    postReady(rank);
});
socket.on('draw round', (round) => {
    panel_ctx.clearRect(round_window['x'], round_window['y'], round_window['width'], round_window['height']);
    panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
    panel_ctx.fillRect(round_window['x'], round_window['y'], round_window['width'], round_window['height']);
    panel_ctx.font = panel.height*25/824 + "px Arial";
    panel_ctx.fillStyle = "black";
    panel_ctx.fillText('Round ' + round + '/' + CONSTANTS.GAME_ROUNDS, round_window['x']+2,round_window['y'] + 25);


})

socket.on('draw timer', (time,color) => {
    postTime(time,color)
});

socket.on('draw prepare', () => {
    postInfo("Preparing next game...", "",true, "");
    postTimeDescrip("seconds until autostart");
});

socket.on('draw booted', (roundsDead) => {
    postInfo("You have been booted due to inactivity!", "Please refresh to rejoin",false, "");
});

socket.on('draw lobby', () => {
    postLobby();
});

socket.on('draw idle', () => {
    postInfo("Waiting for players to join...", "", false, "");
})

socket.on('draw guess city', (city, capital) => {
    postInfo("Locate this city!", city, false, capital)
    postTimeDescrip("seconds remaining")
});

socket.on('draw reveal city', (city, capital) => {
    postInfo("Revealing...", city, false, capital)
    postTimeDescrip("seconds until next round")
});


panel.addEventListener('click', function(evt) {
    var mousePos = getMousePosInPanel(panel, evt);
    if (isInside(mousePos,ready_button) && myRoom != CONSTANTS.LOBBY) {
        socket.emit('playerReady')
    }
    if (isInside(mousePos,lobby_button) && myRoom != CONSTANTS.LOBBY) {
        socket.emit('moveTo', CONSTANTS.LOBBY)
    }
    else if (isInside(mousePos,world_button) && myRoom == CONSTANTS.LOBBY) {
        socket.emit('moveTo', CONSTANTS.WORLD)
    }
    else if (isInside(mousePos,us_button) && myRoom == CONSTANTS.LOBBY) {
        socket.emit('moveTo', CONSTANTS.US)
    }
    else if (isInside(mousePos,euro_button) && myRoom == CONSTANTS.LOBBY) {
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
//
//

/** HISTORY WINDOW HANDLING */
socket.on("update messages", function(room, msg){
    if (room == myRoom) {
        var final_message = $("<font style=\"font-size:20px;\" />").html(msg);
        $("#history").prepend(final_message);
        chatcount = chatcount + 1;
        if (chatcount > CONSTANTS.MAX_CHAT_HIST) {
            $("#history").children().last().remove();
            chatcount = chatcount - 1;
        }
    }
});

socket.on('request boot', function(id){
   socket.emit('bootPlayer', id)
});

socket.on('moved to', (room) => {
    myRoom = room;
});

socket.on('break history', (room, winner, score, color) => {
    if (room == myRoom) {
        var assembled = "<br>******* WINNER: <font color=\"" + color + "\">Player " + winner + " (" + score + " points)</font> *******<br>"
        var final_message = $("<font style=\"font-size:20px;\" />").html(assembled);
        $("#gamehist").prepend(" ");
        $("#gamehist").prepend(final_message);
        histcount = histcount + 1;
        if (histcount > CONSTANTS.MAX_GAME_HIST) {
            $("#gamehist").children().last().remove();
            histcount = histcount - 1;
        }
    }
});
socket.on('add history', (room, payload) => {
    if (room == myRoom) {
        var assembled = payload;
        var final_message = $("<font style=\"font-size:20px;\" />").html(assembled);
        $("#gamehist").prepend(final_message);
        histcount = histcount + 1;
        if (histcount > CONSTANTS.MAX_GAME_HIST) {
            $("#gamehist").children().last().remove();
            histcount = histcount - 1;
        }
    }
});

