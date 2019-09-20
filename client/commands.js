const CONSTANTS = require('../resources/constants.js')

class Commands {
    constructor(socket) {
        this.socket = socket
        this.panel = window.document.getElementById('panel');
        this.canvas = window.document.getElementById('map');
        this.ctx = this.canvas.getContext('2d');
        this.myRoom = CONSTANTS.LOBBY;
        this.us_count = 0;
        this.world_count = 0;
        this.euro_count = 0;
        this.africa_count = 0;
        this.samerica_count = 0;
        this.lobby_count = 0;
        this.ready_button = {
            x:this.canvas.width*5/9,
            y:5,
            width:200,
            height:30
        };
        this.timer_window = {
            x: this.canvas.width*1/4 - 40,
            y: 0,
            width: 40,
            height: 40
        };
        this.command_window = {
            x: this.canvas.width*1/4,
            y: 0,
            width: this.canvas.width*3/5,
            height: 40
        };
        this.muted = false;
    }


    drawCommand(timeDescrip, citystring, capital, round, button) {
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.ctx.fillRect(this.command_window['x'], this.command_window['y'], this.command_window['width'], this.command_window['height']);
        this.ctx.globalAlpha = 1.0;
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "black";

        // if (timeDescrip + citystring.length + capital.length > 100) {
        //     this.ctx.font = "15px Arial";
        // }

        this.ctx.fillText(timeDescrip, this.command_window['x'] + 5,this.command_window['y'] + 25);
        this.ctx.fillText(citystring, this.command_window['x']+timeDescrip.length*10 + 30,this.command_window['y'] + 25);
        this.ctx.fillText(capital, this.command_window['x']+citystring.length*10+timeDescrip.length*10 + 50,this.command_window['y'] + 25);
        this.ctx.fillText('Round ' + round + '/' + CONSTANTS.GAME_ROUNDS, this.command_window['x']+this.command_window['width']*0.85,this.command_window['y'] + 25);

        if (button) {
            this.ctx.fillStyle = "orange";
            this.ctx.fillRect(this.ready_button['x'], this.ready_button['y'], this.ready_button['width'], this.ready_button['height']);
            this.ctx.font = CONSTANTS.BUTTONS_FONT + "px Arial";
            this.ctx.fillStyle = 'black';
            this.ctx.fillText('CLICK IF READY!', this.ready_button['x'] + 5, this.ready_button['y'] + 22)
        }
    }


    updateCounts(l,w,u,e,a,s) {
       this.lobby_count = l;
       this.world_count = w;
       this.us_count = u;
       this.euro_count = e;
       this.africa_count = a;
       this.samerica_count = s;
    }
    postButtons() {
        const socket = this.socket;
        $('#commands').empty();
        if (this.muted) $('#commands').append($("<button class='mute-btn' id='mute_button'>🔇 <font color=\"white\">(muted)</font></button>"));
        else $('#commands').append($("<button class='mute-btn' id='mute_button'>🔊</button>"));
        $('#commands').append($("<button class='lobby-btn' id='lobby_button'>To Lobby (" + this.lobby_count + " players)</button><br>"))
        $('#commands').append($("<button class='room-btn' id='world_button'>World (" + this.world_count + " players)</button>  "))
        $('#commands').append($("<button class='room-btn' id='euro_button'>Eurasia (" + this.euro_count + " players)</button>  "))
        $('#commands').append($("<button class='room-btn' id='africa_button'>Africa (" + this.africa_count + " players)</button>  "))
        $('#commands').append($("<button class='room-btn' id='us_button'>N. America (" + this.us_count + " players)</button>  "))
        $('#commands').append($("<button class='room-btn' id='samerica_button'>S. America (" + this.samerica_count + " players)</button>  "))

        var room = this.myRoom;
        $('#mute_button').bind("click", () => {socket.emit('mute')});
        $('#lobby_button').bind("click", () => {if (room != CONSTANTS.LOBBY) socket.emit('moveTo', CONSTANTS.LOBBY)});
        $('#world_button').bind("click", () => {if (room != CONSTANTS.WORLD) socket.emit('moveTo', CONSTANTS.WORLD)});
        $('#us_button').bind("click", () => {if (room != CONSTANTS.US) socket.emit('moveTo', CONSTANTS.US)});
        $('#euro_button').bind("click", () => {if (room != CONSTANTS.EURO) socket.emit('moveTo', CONSTANTS.EURO)});
        $('#africa_button').bind("click", () => {if (room != CONSTANTS.AFRICA) socket.emit('moveTo', CONSTANTS.AFRICA)});
        $('#samerica_button').bind("click", () => {if (room != CONSTANTS.SAMERICA) socket.emit('moveTo', CONSTANTS.SAMERICA)});

    }


    postTime(time, color) {
        this.ctx.fillStyle = color;
        this.ctx.clearRect(this.timer_window['x'], this.timer_window['y'], this.timer_window['width'], this.timer_window['height']);
        this.ctx.fillRect(this.timer_window['x'], this.timer_window['y'], this.timer_window['width'], this.timer_window['height']);
        this.ctx.font = CONSTANTS.INFO_BIG_FONT + "px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(Math.max(time,0), this.timer_window['x']+2,this.timer_window['y'] + 29);
    }

}
module.exports = Commands
