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
        // this.ctx.strokeStyle = "black";
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
        // this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
        // this.ctx.fillStyle = "black";
        this.ctx.fill();
    }

    drawAnimation() {
        frame_cnt = (frame_cnt + 1) % (frames*rate);
        const sx = Math.floor(frame_cnt/rate) * 450;
        var ctx = this.ctx;
        globeImage.onload = function (sx) {
          return ctx.drawImage(globeImage, sx,0,450,450,20, 20,450,450);
        };
        globeImage.onload(sx);
    };


    drawBlank(room) {
        var ctx = this.ctx;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMap(room) {
      var ctx = this.ctx;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (room == CONSTANTS.LOBBY){
        // Banner message
        this.ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.font = "55px Arial bold";
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('Welcome to GeoScents!', 480, 490);
        this.ctx.fillText('Locate cities as quickly and accurately as possible!',90,550);

        // Instructions
        this.ctx.font = "25px Arial";
        this.ctx.fillStyle = 'red';
        this.ctx.strokeStyle = 'red';
        this.ctx.fillText('Choose a map to play on here', 780, 125);
        this.canvas_arrow(1150, 120, this.canvas.width-20, 120);

        this.ctx.fillText('Rankings will show here', 850, 305);
        this.canvas_arrow(1150, 300, this.canvas.width-20, 300);

        this.ctx.fillText('Target city and timer will appear here', 500, 40);

        this.ctx.fillText('See results and learn here', 850, 660);
        this.canvas_arrow(1100, 680, this.canvas.width - 200, this.canvas.height - 20);

        this.ctx.fillText('Discuss here', 130, 660);
        this.canvas_arrow(200, 680, 200, this.canvas.height-20);

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

    drawStar(coords) {
        var rot = Math.PI / 2 * 3;
        const spikes = 5;
        const outerRadius = 25;
        const innerRadius = 15;
        var x = coords['col'];
        var y = coords['row'];
        var step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius)
        for (i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y)
            rot += step

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y)
            rot += step
        }
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
    }
    drawPoint(coords, color, radius) {
        this.ctx.beginPath();
        this.ctx.arc(coords['col'] - CONSTANTS.POINT_RADIUS / 2, coords['row'] - CONSTANTS.POINT_RADIUS / 2, CONSTANTS.POINT_RADIUS, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.arc(coords['col'] - CONSTANTS.POINT_RADIUS / 2, coords['row'] - CONSTANTS.POINT_RADIUS / 2, radius, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = CONSTANTS.BUBBLE_WIDTH;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
        this.ctx.closePath()
    }
}

module.exports = Map