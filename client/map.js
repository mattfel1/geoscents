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

var specialImg = {'classic': new Image(), 'terrain': new Image(), 'satellite': new Image()};
specialImg['classic'].src = "/resources/ukraine_classic.png";
specialImg['terrain'].src = "/resources/ukraine_terrain.png";
specialImg['satellite'].src = "/resources/ukraine_satellite.png";

var frame_cnt = 0;
var frames = 120;
var rate = 2;

class Map {
    constructor(socket) {
        this.socket = socket;
        this.occupiedCells = []; // For keeping track of which "cells" we can write distance popups in
        this.myRoomName = CONSTANTS.LOBBY;
        this.myMap = CONSTANTS.LOBBY;
        this.mapStyle = 'terrain';
        this.canvas = window.document.getElementById('map');
        this.ctx = this.canvas.getContext('2d');
        this.command_window = {
            x: this.canvas.width*1/12,
            y: 0,
            width: this.canvas.width*10/12,
            height: 40
        };
        this.about_button = {
            x: 400, y: 190, width: 280, height: 60,
            x_font_ofs: 5, y_font_ofs: 42,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "orange", highlight_color: "green",
            font_size: 40, link: 'http://geoscents.net/resources/about.html', label: 'ABOUT GAME'
        };
        this.visualize_button = {
            x: 710, y: 190, width: 315, height: 60,
            x_font_ofs: 5, y_font_ofs: 42,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "orange", highlight_color: "green",
            font_size: 40, link: 'http://geoscents.net/plots/index.html', label: 'EXPLORE DATA'
        };
        this.help_button = {
            x: 1055, y: 190, width: 35, height: 60,
            x_font_ofs: 5, y_font_ofs: 42,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "orange", highlight_color: "green",
            font_size: 40, link: '', label: '?'
        };
        this.donate1_button = {
            x: 500, y: 200, width: 80, height: 40,
            x_font_ofs: 5, y_font_ofs: 30,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "grey", highlight_color: "purple",
            font_size: 25, link: 'https://action.aclu.org/give/now', label: 'ACLU'
        };
        this.donate2_button = {
            x: 600, y: 200, width: 340, height: 40,
            x_font_ofs: 5, y_font_ofs: 30,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "grey", highlight_color: "purple",
            font_size: 25, link: 'https://org2.salsalabs.com/o/6857/p/salsa/donation/common/public/?donate_page_KEY=15780', label: 'NAACP Legal Defense Fund'
        };
        this.donate3_button = {
            x: 960, y: 200, width: 120, height: 40,
            x_font_ofs: 5, y_font_ofs: 30,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "grey", highlight_color: "purple",
            font_size: 25, link: 'https://secure.actblue.com/donate/fair-fight-1', label: 'Fair Fight'
        };
        this.donate4_button = {
            x: 480, y: 260, width: 230, height: 40,
            x_font_ofs: 5, y_font_ofs: 30,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "grey", highlight_color: "purple",
            font_size: 25, link: 'https://secure3.convio.net/thp/site/Donation2?df_id=2600&mfc_pref=T&2600.donation=form1', label: 'The Hunger Project'
        };
        this.donate5_button = {
            x: 730, y: 260, width: 220, height: 40,
            x_font_ofs: 5, y_font_ofs: 30,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "grey", highlight_color: "purple",
            font_size: 25, link: 'https://secure.actblue.com/donate/ms_blm_homepage_2019', label: 'Black Lives Matter'
        };
        this.donate6_button = {
            x: 970, y: 260, width: 190, height: 40,
            x_font_ofs: 5, y_font_ofs: 30,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "grey", highlight_color: "purple",
            font_size: 25, link: 'https://secure.givelively.org/donate/the-bail-project', label: 'The Bail Project'
        };
        this.donate7_button = {
            x: 600, y: 320, width: 240, height: 40,
            x_font_ofs: 5, y_font_ofs: 30,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "grey", highlight_color: "purple",
            font_size: 25, link: 'https://www.weareplannedparenthood.org/onlineactions/2U7UN1iNhESWUfDs4gDPNg2?sourceid=1000063', label: 'Planned Parenthood'
        };
        this.donate8_button = {
            x: 860, y: 320, width: 280, height: 40,
            x_font_ofs: 5, y_font_ofs: 30,
            border_color1: "#000000", border_color2: "#808080",
            normal_color: "grey", highlight_color: "purple",
            font_size: 25, link: 'https://donate.doctorswithoutborders.org/onetime.cfm', label: 'Doctors Without Borders'
        };
        this.clickable_buttons = [this.about_button, this.visualize_button, this.help_button]
        // this.clickable_buttons = [this.about_button, this.visualize_button,
        //     this.donate1_button, this.donate2_button, this.donate3_button,
        //     this.donate4_button, this.donate5_button, this.donate6_button,
        //     this.donate7_button, this.donate8_button]
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
          return ctx.drawImage(globeImage[mapStyle], sx,0,450,450,350, 200,780,780);
        };
        globeImage[mapStyle].onload(sx);
    };


    drawBlank(room) {
        var ctx = this.ctx;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'black';
      ctx.fill()

    }
    drawMap(room) {
      var ctx = this.ctx;
      this.occupiedCells = [];
      const mapStyle = this.mapStyle;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (room == CONSTANTS.LOBBY){
        // this.ctx.fillText('Welcome to GeoScents!', 400, 590);
        // this.ctx.fillText('Locate cities as quickly and accurately as possible!',20,650);
        this.ctx.font = "120px Arial bold";
        this.ctx.fillText('Welcome to GeoScents!', 210, 150);

        this.ctx.font = "20px Arial";
        this.ctx.fillText('[ Spinning globe is loading... ]', 500, 500);
  
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(this.command_window['x'], this.command_window['y'], this.command_window['width'], this.command_window['height']);
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = 'black';

        // // Donate
        // this.roundRect(this.ctx, 450, 120, 750, 300, 15);
        // this.ctx.font = "25px Arial";
        // this.ctx.fillStyle = 'white';
        // this.ctx.fillText('Every voice counts in enacting change and fighting injustice:',480,170);

        const showButton = (btn) => this.showButton(btn)
        Object.values(this.clickable_buttons).forEach(function(btn) {
            showButton(btn)
        })  


      }
      else if (room == CONSTANTS.WORLD){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            worldImg[this.mapStyle].onload = function () {
                ctx.drawImage(worldImg[mapStyle], 0, 0)
            };

          worldImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.WORLD_EASY){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            worldImg[this.mapStyle].onload = function () {
                ctx.drawImage(worldImg[mapStyle], 0, 0)
            };

          worldImg[mapStyle].onload();
      } else if (room == CONSTANTS.MISC){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            miscImg[this.mapStyle].onload = function () {
                ctx.drawImage(miscImg[mapStyle], 0, 0)
            };

          miscImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.US){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            usImg[mapStyle].onload = function () {
                ctx.drawImage(usImg[mapStyle], 0, 0)
            };
          usImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.EURO){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            euroImg[mapStyle].onload = function () {
                ctx.drawImage(euroImg[mapStyle], 0, 0)
            };
          euroImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.AFRICA){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            africaImg[mapStyle].onload = function () {
                ctx.drawImage(africaImg[mapStyle], 0, 0)
            };
          africaImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.ASIA){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            asiaImg[mapStyle].onload = function () {
                ctx.drawImage(asiaImg[mapStyle], 0, 0)
            };
          asiaImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.OCEANIA){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            oceaniaImg[mapStyle].onload = function () {
                ctx.drawImage(oceaniaImg[mapStyle], 0, 0)
            };
          oceaniaImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.SAMERICA){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            samericaImg[mapStyle].onload = function () {
                ctx.drawImage(samericaImg[mapStyle], 0, 0)
            };
          samericaImg[mapStyle].onload();
      }
      else if (room == CONSTANTS.SPECIAL){
            this.ctx.font = "20px Arial";
            this.ctx.fillText('[ Map is loading... ]', 400, 400);
            specialImg[mapStyle].onload = function () {
                ctx.drawImage(specialImg[mapStyle], 0, 0)
            };
          specialImg[mapStyle].onload();
      }

    }

    setStyle(id, style, room) {
        if (this.socket.id == id) {
            this.mapStyle = style;
            this.drawMap(room);
        }
    }

    highlightButton(properties) {
        this.ctx.fillStyle = properties['border_color1'];
        this.ctx.fillRect(properties['x']-4, properties['y']-4, properties['width']+8, properties['height']+8);
        this.ctx.fillStyle = properties['border_color2'];
        this.ctx.fillRect(properties['x']-2, properties['y']-2, properties['width']+4, properties['height']+4);
        this.ctx.fillStyle = properties['highlight_color'];
        this.ctx.fillRect(properties['x'], properties['y'], properties['width'], properties['height']);
        this.ctx.font = properties['font_size'] + "px Arial";
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(properties['label'], properties['x'] + properties['x_font_ofs'], properties['y'] + properties['y_font_ofs'])
    }
    showButton(properties) {
        this.ctx.fillStyle = properties['border_color1'];
        this.ctx.fillRect(properties['x']-4, properties['y']-4, properties['width']+8, properties['height']+8);
        this.ctx.fillStyle = properties['border_color2'];
        this.ctx.fillRect(properties['x']-2, properties['y']-2, properties['width']+4, properties['height']+4);
        this.ctx.fillStyle = properties['normal_color'];
        this.ctx.fillRect(properties['x'], properties['y'], properties['width'], properties['height']);
        this.ctx.font = properties['font_size'] + "px Arial";
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(properties['label'], properties['x'] + properties['x_font_ofs'], properties['y'] + properties['y_font_ofs'])
    }
    
    cellOf(coords) {
        const CELL_HEIGHT = CONSTANTS.MAP_HEIGHT / CONSTANTS.VERT_WRITE_CELLS;
        const CELL_WIDTH = CONSTANTS.MAP_WIDTH / CONSTANTS.HORZ_WRITE_CELLS;
        var dest_col = Math.floor((coords['col'] + 20) / CELL_WIDTH) % CONSTANTS.HORZ_WRITE_CELLS;
        var dest_row = Math.floor(coords['row'] / CELL_HEIGHT) % CONSTANTS.VERT_WRITE_CELLS;
        return {'col': dest_col, 'row': dest_row}
    }
    drawPhoto(coords, link) {
        var img = new Image;
        let ctx = this.ctx;
        let canvas = this.canvas
        img.onload = function(){
            ctx.save()
            // ctx.shadowBlur = 20;
            ctx.shadowColor = "black";
            if (this.width > 300) {
                let row = canvas.height - this.height * 300 / img.width - 15
                let col = 15
                if (coords['col'] < canvas.width / 2)
                    col = canvas.width - 300 - 15
                ctx.strokeStyle = '#000000';  // some color/style
                ctx.lineWidth = 4;         // thickness
                ctx.strokeRect(col,row, 300, img.height * 300 / img.width)
                ctx.globalAlpha = 0.95;
                ctx.drawImage(img,col,row,300, img.height * 300 / img.width);                 
            } else {
                let row = canvas.height - this.height - 15
                let col = 15
                if (coords['col'] < canvas.width / 2)
                    col = canvas.width - this.width - 15
                ctx.strokeStyle = '#000000';  // some color/style
                ctx.lineWidth = 4;         // thickness
                ctx.strokeRect(col,row, img.width, img.height)
                ctx.globalAlpha = 0.95;
                ctx.drawImage(img,col,row); 
            }
            ctx.restore()
        };
        img.src = link;

    }
    cellPxCoords(cell) {
        const CELL_HEIGHT = CONSTANTS.MAP_HEIGHT / CONSTANTS.VERT_WRITE_CELLS;
        const CELL_WIDTH = CONSTANTS.MAP_WIDTH / CONSTANTS.HORZ_WRITE_CELLS;
        return {'col': cell['col'] * CELL_WIDTH, 'row': cell['row'] * CELL_HEIGHT, 'height': CELL_HEIGHT, 'width': CELL_WIDTH}
    }
    drawStar(coords) {
        // bubble
        var cx = coords['col'];
        var cy = coords['row'];
        var x = cx;
        var y = cy;
        this.ctx.beginPath();
        this.ctx.arc(x, y, CONSTANTS.BUBBLE_RADIUS * 2, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = CONSTANTS.BUBBLE_WIDTH;
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
        this.ctx.closePath()

        var cell = this.cellOf(coords);
        this.occupiedCells += (cell['col'], cell['row']);
        var rot = Math.PI / 2 * 3;
        const spikes = CONSTANTS.STAR_POINTS;
        const outerRadius = CONSTANTS.STAR_OUTER_RADIUS;
        const innerRadius = CONSTANTS.STAR_INNER_RADIUS;
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
