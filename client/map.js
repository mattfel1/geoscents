const CONSTANTS = require('../resources/constants.js')


var globeImage = new Image();
globeImage.src = "/resources/spritesheet.png";

var worldImg = new Image();
worldImg.src = "/resources/world.png";

var usImg = new Image();
usImg.src = "/resources/us.png";

var euroImg = new Image();
euroImg.src = "/resources/euro.png";
var frame_cnt = 0;
var frames = 8*9;
var rate = 2;

class Map {
    constructor(socket) {
        this.socket = socket;
        this.myRoom = CONSTANTS.LOBBY;
        this.canvas = window.document.getElementById('map');
        this.ctx = this.canvas.getContext('2d');
    }

    canvas_arrow(fromx, fromy, tox, toy){
        //variables to be used when creating the arrow
        var headlen = 30;

        var angle = Math.atan2(toy-fromy,tox-fromx);

        //starting path of the arrow from the start square to the end square and drawing the stroke
        this.ctx.beginPath();
        this.ctx.moveTo(fromx, fromy);
        this.ctx.lineTo(tox, toy);
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 10;
        this.ctx.stroke();

        //starting a new path from the head of the arrow to one of the sides of the point
        this.ctx.beginPath();
        this.ctx.moveTo(tox, toy);
        this.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

        //path from the side point of the arrow, to the other side point
        this.ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        this.ctx.lineTo(tox, toy);
        this.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

        //draws the paths created above
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
        this.ctx.fillStyle = "black";
        this.ctx.fill();
    }

    drawAnimation() {
        frame_cnt = (frame_cnt + 1) % (frames*rate);
        const sx = Math.floor(frame_cnt/rate) * 450;
        var ctx = this.ctx;
        globeImage.onload = function (sx) {
          return ctx.drawImage(globeImage, sx,0,450,450,50, 100,450,450);
        };
        globeImage.onload(sx);
    };

    drawMap(room) {
      var ctx = this.ctx;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (room == CONSTANTS.LOBBY){
        // Banner message
        this.ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.font = "50px Arial";
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('Welcome to GeoScents!', 300, 50);
        this.ctx.fillText('Locate cities as quickly and accurately as possible!',10,110);

        // Instructions
        this.ctx.font = "35px Arial";
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('Choose a map to play on and the', 700, 310);
        this.ctx.fillText('target cities will show up here', 700, 350);
        this.canvas_arrow(1200, 340, this.canvas.width - 20, 220);

        this.ctx.fillText('See how everyone did and', 800, 590);
        this.ctx.fillText('learn about the cities here', 800, 625);
        this.canvas_arrow(1100, 650, this.canvas.width - 70, this.canvas.height - 20);

        this.ctx.fillText('Map will appear here', 480, 480);

        this.ctx.fillText('Discuss here', 100, 610);
        this.canvas_arrow(200, 650, 200, this.canvas.height-20);

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

    drawPoint(coords, color) {
        this.ctx.beginPath();
        this.ctx.arc(coords['col'] - CONSTANTS.POINT_RADIUS / 2, coords['row'] - CONSTANTS.POINT_RADIUS / 2, CONSTANTS.POINT_RADIUS, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.arc(coords['col'] - CONSTANTS.POINT_RADIUS / 2, coords['row'] - CONSTANTS.POINT_RADIUS / 2, CONSTANTS.BUBBLE_RADIUS, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = CONSTANTS.BUBBLE_WIDTH;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
        this.ctx.closePath()
    }
}

module.exports = Map