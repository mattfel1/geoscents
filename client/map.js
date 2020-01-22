const CONSTANTS = require('../resources/constants.js')

var globeImage = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
globeImage['classic'].src = "/resources/spritesheet_classic.png";
globeImage['terrain'].src = "/resources/spritesheet_terrain.png";
globeImage['satellite'].src = "/resources/spritesheet_satellite.png";

var worldImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
worldImg['classic'].src = "/resources/world_classic.png";
worldImg['terrain'].src = "/resources/world_terrain.png";
worldImg['satellite'].src = "/resources/world_satellite.png";

var miscImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
miscImg['classic'].src = "/resources/misc_classic.png";
miscImg['terrain'].src = "/resources/misc_terrain.png";
miscImg['satellite'].src = "/resources/misc_satellite.png";

var usImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
usImg['classic'].src = "/resources/us_classic.png";
usImg['terrain'].src = "/resources/us_terrain.png";
usImg['satellite'].src = "/resources/us_satellite.png";

var euroImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
euroImg['classic'].src = "/resources/euro_classic.png";
euroImg['terrain'].src = "/resources/euro_terrain.png";
euroImg['satellite'].src = "/resources/euro_satellite.png";

var oceaniaImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
oceaniaImg['classic'].src = "/resources/oceania_classic.png";
oceaniaImg['terrain'].src = "/resources/oceania_terrain.png";
oceaniaImg['satellite'].src = "/resources/oceania_satellite.png";

var asiaImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
asiaImg['classic'].src = "/resources/asia_classic.png";
asiaImg['terrain'].src = "/resources/asia_terrain.png";
asiaImg['satellite'].src = "/resources/asia_satellite.png";

var africaImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
africaImg['classic'].src = "/resources/africa_classic.png";
africaImg['terrain'].src = "/resources/africa_terrain.png";
africaImg['satellite'].src = "/resources/africa_satellite.png";

var samericaImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
samericaImg['classic'].src = "/resources/samerica_classic.png";
samericaImg['terrain'].src = "/resources/samerica_terrain.png";
samericaImg['satellite'].src = "/resources/samerica_satellite.png";

var frame_cnt = 0;
var frames = 120;
var rate = 2;

class Map {
    constructor(socket) {
        this.socket = socket;
        this.occupiedCells = []; // For keeping track of which "cells" we can write distance popups in
        this.myRoom = CONSTANTS.LOBBY;
        this.mapStyle = 'terrain';
        this.canvas = window.document.getElementById('map');
        this.ctx = this.canvas.getContext('2d');
        this.command_window = {
            x: this.canvas.width*1/4,
            y: 0,
            width: this.canvas.width*3/5,
            height: 40
        };
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
        const mapStyle = this.mapStyle;
        frame_cnt = (frame_cnt + 1) % (frames*rate);
        const sx = Math.floor(frame_cnt/rate) * 450;
        var ctx = this.ctx;
        globeImage[mapStyle].onload = function (sx) {
          return ctx.drawImage(globeImage[mapStyle], sx,0,450,450,20, 20,450,450);
        };
        globeImage[mapStyle].onload(sx);
    };


    drawBlank(room) {
        var ctx = this.ctx;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMap(room) {
      var ctx = this.ctx;
      this.occupiedCells = [];
      const mapStyle = this.mapStyle;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (room == CONSTANTS.LOBBY){
        // Banner message
        this.ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.font = "55px Arial bold";
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('Welcome to GeoScents!', 480, 490);
        this.ctx.fillText('Locate cities as quickly and accurately as possible!',90,550);

        this.ctx.font = "20px Arial";
        this.ctx.fillText('[ Spinning globe is loading... ]', 90, 220);
        // Instructions
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(this.command_window['x'], this.command_window['y'], this.command_window['width'], this.command_window['height']);
        this.ctx.globalAlpha = 1;
        this.ctx.font = "25px Arial";
        this.ctx.fillStyle = 'red';
        this.ctx.strokeStyle = 'red';
        this.ctx.fillText('Join a game', 990, 125);
        this.canvas_arrow(1150, 120, this.canvas.width-20, 120);

        this.ctx.fillText('Toggle volume and map texture', 1040, 80);
        this.canvas_arrow(1400, 75, this.canvas.width-20, 35);

        this.ctx.fillText('See player rankings', 900, 305);
        this.canvas_arrow(1150, 300, this.canvas.width-20, 300);

        this.ctx.fillText('Target city and time remaining will appear in this panel', 500, 25);

        this.ctx.fillText('See game history and learn about cities', 850, 660);
        this.canvas_arrow(1100, 680, this.canvas.width - 200, this.canvas.height - 20);

        this.ctx.fillText('Discuss', 160, 660);
        this.canvas_arrow(200, 680, 200, this.canvas.height-20);

      }
      else if (room == CONSTANTS.WORLD){
            worldImg[this.mapStyle].onload = function () {
                ctx.drawImage(worldImg[mapStyle], 0, 0)
            };

          worldImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.MISC){
            miscImg[this.mapStyle].onload = function () {
                ctx.drawImage(miscImg[mapStyle], 0, 0)
            };

          miscImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.US){
            usImg[mapStyle].onload = function () {
                ctx.drawImage(usImg[mapStyle], 0, 0)
            };
          usImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.EURO){
            euroImg[mapStyle].onload = function () {
                ctx.drawImage(euroImg[mapStyle], 0, 0)
            };
          euroImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.AFRICA){
            africaImg[mapStyle].onload = function () {
                ctx.drawImage(africaImg[mapStyle], 0, 0)
            };
          africaImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.ASIA){
            asiaImg[mapStyle].onload = function () {
                ctx.drawImage(asiaImg[mapStyle], 0, 0)
            };
          asiaImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.OCEANIA){
            oceaniaImg[mapStyle].onload = function () {
                ctx.drawImage(oceaniaImg[mapStyle], 0, 0)
            };
          oceaniaImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.SAMERICA){
            samericaImg[mapStyle].onload = function () {
                ctx.drawImage(samericaImg[mapStyle], 0, 0)
            };
          samericaImg[mapStyle].onload();
      }

    }

    setStyle(id, style, room) {
        if (this.socket.id == id) {
            this.mapStyle = style;
            this.drawMap(room);
        }
    }

    cellOf(coords) {
        const CELL_HEIGHT = CONSTANTS.MAP_HEIGHT / CONSTANTS.VERT_WRITE_CELLS;
        const CELL_WIDTH = CONSTANTS.MAP_WIDTH / CONSTANTS.HORZ_WRITE_CELLS;
        var dest_col = Math.floor((coords['col'] + 20) / CELL_WIDTH) % CONSTANTS.HORZ_WRITE_CELLS;
        var dest_row = Math.floor(coords['row'] / CELL_HEIGHT) % CONSTANTS.VERT_WRITE_CELLS;
        return {'col': dest_col, 'row': dest_row}
    }
    cellPxCoords(cell) {
        const CELL_HEIGHT = CONSTANTS.MAP_HEIGHT / CONSTANTS.VERT_WRITE_CELLS;
        const CELL_WIDTH = CONSTANTS.MAP_WIDTH / CONSTANTS.HORZ_WRITE_CELLS;
        return {'col': cell['col'] * CELL_WIDTH, 'row': cell['row'] * CELL_HEIGHT, 'height': CELL_HEIGHT, 'width': CELL_WIDTH}
    }
    drawStar(coords) {
        var cell = this.cellOf(coords);
        this.occupiedCells += (cell['col'], cell['row']);
        var rot = Math.PI / 2 * 3;
        const spikes = CONSTANTS.STAR_POINTS;
        const outerRadius = CONSTANTS.STAR_OUTER_RADIUS;
        const innerRadius = CONSTANTS.STAR_INNER_RADIUS;
        var cx = coords['col'];
        var cy = coords['row'];
        var x = cx;
        var y = cy;
        var step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        var i;
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
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
    }
    drawPoint(coords, color, radius) {
        var cell = this.cellOf(coords);
        this.occupiedCells += (cell['col'], cell['row']);
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
    drawDist(coords, color, distance) {
        // var cell = this.cellOf(coords);
        // var cell_row = cell['row'];
        // var cell_col = cell['col'] + 1;
        // var inc_dir = 1;
        // var attempts = 0;
        // // console.log("coords " + coords['col'] + " " + coords['row'] + " are in cell " + cell['col'] + " " + cell['row']);
        // while (this.occupiedCells.includes((cell_col, cell_row)) && attempts < 7) {
        //     cell_row = cell_row + inc_dir;
        //     if (cell_row == CONSTANTS.VERT_WRITE_CELLS) {
        //         inc_dir = -1;
        //     }
        //     attempts = attempts + 1;
        // }
        // const loc = this.cellPxCoords({'col': cell_col, 'row': cell_row});
        // // console.log("final placement in " + cell_col + " " + cell_row + " aka " + loc['col'] + " " + loc['row']);
        // this.occupiedCells += (cell_col, cell_row);

        // const oldctx = this.ctx;
        // this.ctx.globalAlpha = 0.5;
        // this.ctx.fillStyle = CONSTANTS.SCOREBOX_COLOR;
        // this.ctx.fillRect(loc['col'] + 2, loc['row'] + 2, loc['width'] - 2, loc['height'] - 2);
        // this.ctx.globalAlpha = 1;
        // this.ctx.font = CONSTANTS.INFO_LITTLE_FONT + "px Arial";
        // this.ctx.fillStyle = color;
        // this.ctx.fillText(Math.floor(distance) + " km", loc['col'] + 5, loc['row'] + 20);
        // this.ctx = oldctx;
    }
}

module.exports = Map
