const CONSTANTS = require('../resources/constants.js');

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
        this.asia_count = 0;
        this.oceania_count = 0;
        this.samerica_count = 0;
        this.misc_count = 0;
        this.lobby_count = 0;
        this.mapStyle = 'terrain';
        this.lastCommand = {'timeDescrip': '', 'citystring': '', 'capital': false, 'iso2': '', 'round': 0, 'button': false, 'clicked': false};
        this.lastTime = {'time': 10, 'color': 'white'};
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

    drawLastCommand(id) {
        if (this.myRoom !== CONSTANTS.LOBBY) {
            this.drawCommand(this.lastCommand['timeDescrip'], this.lastCommand['citystring'], this.lastCommand['capital'], this.lastCommand['iso2'], this.lastCommand['round'], this.lastCommand['button'], this.lastCommand['clicked']);
            this.postTime(this.lastTime['time'], this.lastTime['color']);
        }
    }
    drawCommand(timeDescrip, citystring, capital, iso2, round, button, clicked) {
        this.lastCommand = {'timeDescrip': timeDescrip, 'citystring': citystring, 'capital': capital, 'iso2': iso2, 'round': round, 'button': button, 'clicked': clicked};
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.ctx.fillRect(this.command_window['x'], this.command_window['y'], this.command_window['width'], this.command_window['height']);
        this.ctx.globalAlpha = 1.0;
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "black";

        this.ctx.fillText(timeDescrip, this.command_window['x'] + 5,this.command_window['y'] + 25);
        this.ctx.fillText(citystring, this.command_window['x']+timeDescrip.length*10 + 30,this.command_window['y'] + 25);
        this.ctx.fillText(capital, this.command_window['x']+citystring.length*10+timeDescrip.length*10 + 50,this.command_window['y'] + 25);
        this.ctx.fillText('Round ' + (round + 1) + '/' + (CONSTANTS.GAME_ROUNDS + 1), this.command_window['x']+this.command_window['width']*0.85,this.command_window['y'] + 25);

        if (iso2 !== "") {
            var flagImage = new Image();
            flagImage.src = "/resources/flags/" + iso2.toString().toLowerCase() + ".png";
            var ctx = this.ctx;
            var command_window = this.command_window;
            flagImage.onload = function () {
                return ctx.drawImage(flagImage, command_window['x'] + 58, command_window['y']-2, 80,40);
            };
        }

        if (button) {
            if (clicked) this.ctx.fillStyle = "lightgrey";
            else this.ctx.fillStyle = "orange";
            this.ctx.fillRect(this.ready_button['x'], this.ready_button['y'], this.ready_button['width'], this.ready_button['height']);
            this.ctx.font = CONSTANTS.BUTTONS_FONT + "px Arial";
            this.ctx.fillStyle = 'black';
            if (clicked) this.ctx.fillText('YOU ARE READY!', this.ready_button['x'] + 5, this.ready_button['y'] + 22)
            else this.ctx.fillText('CLICK IF READY!', this.ready_button['x'] + 5, this.ready_button['y'] + 22)
        }
    }


    updateCounts(l,w,u,e,a,s,as,oc,m) {
       this.lobby_count = l;
       this.world_count = w;
       this.us_count = u;
       this.euro_count = e;
       this.africa_count = a;
       this.asia_count = as;
       this.oceania_count = oc;
       this.samerica_count = s;
       this.misc_count = m;
    }
    postButtons() {
        const socket = this.socket;
        $('#commands').empty();

        let pressed1 = ''; if (this.mapStyle === 'classic') pressed1 = '-clicked';
        let pressed2 = ''; if (this.mapStyle === 'terrain') pressed2 = '-clicked';
        let pressed3 = ''; if (this.mapStyle === 'satellite') pressed3 = '-clicked';
        let button1 = "<div id='classic_button' class='map-style-btn-container'><button class='map-style-btn" + pressed1 + "'>Classic</button></div>";
        let button2 = "<div id='terrain_button' class='map-style-btn-container'><button class='map-style-btn" + pressed2 + "'>Terrain</button></div>";
        let button3 = "<div id='satellite_button' class='map-style-btn-container'><button class='map-style-btn" + pressed3 + "'>Satellite</button></div>";
        $('#commands').append($("<div id='map-btns' style=\"display: inline-block\">" + button1 + button2 + button3 + "</div>"));

        if (this.muted) $('#commands').append($("<button class='mute-btn' id='mute_button' style=\"vertical-align: top\">🔇 <font color=\"white\">(muted)</font></button><br>"));
        else $('#commands').append($("<button class='mute-btn' id='mute_button' style=\"vertical-align: top\">🔊</button><br>"));
        let lobby_string; 
        if (this.lobby_count > 0) {lobby_string = "<b>(" + this.lobby_count + " players)</b>"} else {lobby_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='lobby-btn' id='lobby_button'><b>To Lobby</b> <font size=2>" + lobby_string + "</font></button><br>"))
        let world_string; 
        if (this.world_count > 0) {world_string = "<b>(" + this.world_count + " players)</b>"} else {world_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='room-btn' id='world_button'><b>World</b> <br><font size=2>" + world_string + "</font></button>"))
        let misc_string; 
        if (this.misc_count > 0) {misc_string = "<b>(" + this.misc_count + " players)</b>"} else {misc_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='special-room-btn' id='misc_button'><b>Trivia</b> <br><font size=2>" + misc_string + "</font></button><br>  "))
        let euro_string; 
        if (this.euro_count > 0) {euro_string = "<b>(" + this.euro_count + " players)</b>"} else {euro_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='room-btn' id='euro_button'><b>Europe</b> <br><font size=2>" + euro_string + "</font></button>  "))
        let africa_string; 
        if (this.africa_count > 0) {africa_string = "<b>(" + this.africa_count + " players)</b>"} else {africa_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='room-btn' id='africa_button'><b>Africa</b> <br><font size=2>" + africa_string + "</font></button>  "))
        let asia_string; 
        if (this.asia_count > 0) {asia_string = "<b>(" + this.asia_count + " players)</b>"} else {asia_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='room-btn' id='asia_button'><b>Asia</b> <br><font size=2>" + asia_string + "</font></button>  "))
        let oceania_string; 
        if (this.oceania_count > 0) {oceania_string = "<b>(" + this.oceania_count + " players)</b>"} else {oceania_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='room-btn' id='oceania_button'><b>Oceania</b> <br><font size=2>" + oceania_string + "</font></button>  "))
        let us_string; 
        if (this.us_count > 0) {us_string = "<b>(" + this.us_count + " players)</b>"} else {us_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='room-btn' id='us_button'><b>N. America</b> <br><font size=2>" + us_string + "</font></button>  "))
        let samerica_string; 
        if (this.samerica_count > 0) {samerica_string = "<b>(" + this.samerica_count + " players)</b>"} else {samerica_string = "<font color=\"white\">(0 players)</font>"}
        $('#commands').append($("<button class='room-btn' id='samerica_button'><b>S. America</b> <br><font size=2>" + samerica_string + "</font></button>  "))

        var room = this.myRoom;
        
        $('#mute_button').bind("click", () => {socket.emit('mute'); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#classic_button').bind("click", () => {socket.emit('renderMap', 'classic'); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#terrain_button').bind("click", () => {socket.emit('renderMap', 'terrain'); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#satellite_button').bind("click", () => {socket.emit('renderMap', 'satellite'); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#lobby_button').bind("click", () => {if (room !== CONSTANTS.LOBBY) socket.emit('moveTo', CONSTANTS.LOBBY); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#world_button').bind("click", () => {if (room !== CONSTANTS.WORLD) socket.emit('moveTo', CONSTANTS.WORLD); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#misc_button').bind("click", () => {if (room !== CONSTANTS.MISC) socket.emit('moveTo', CONSTANTS.MISC); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#us_button').bind("click", () => {if (room !== CONSTANTS.US) socket.emit('moveTo', CONSTANTS.US); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#euro_button').bind("click", () => {if (room !== CONSTANTS.EURO) socket.emit('moveTo', CONSTANTS.EURO); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#africa_button').bind("click", () => {if (room !== CONSTANTS.AFRICA) socket.emit('moveTo', CONSTANTS.AFRICA); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#asia_button').bind("click", () => {if (room !== CONSTANTS.ASIA) socket.emit('moveTo', CONSTANTS.ASIA); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#oceania_button').bind("click", () => {if (room !== CONSTANTS.OCEANIA) socket.emit('moveTo', CONSTANTS.OCEANIA); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
        $('#samerica_button').bind("click", () => {if (room !== CONSTANTS.SAMERICA) socket.emit('moveTo', CONSTANTS.SAMERICA); var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);});
    }

    setStyle(id, style) {
        if (this.socket.id === id) {
            this.mapStyle = style;
            $('#classic_button').empty();
            let pressed1 = ''; if (this.mapStyle === 'classic') pressed1 = '-clicked';
            $('#classic_button').append($("<button class='map-style-btn" + pressed1 + "'>Classic</button>"));
            $('#terrain_button').empty();
            let pressed2 = ''; if (this.mapStyle === 'terrain') pressed2 = '-clicked';
            $('#terrain_button').append($("<button class='map-style-btn" + pressed2 + "'>Terrain</button>"));
            $('#satellite_button').empty();
            let pressed3 = ''; if (this.mapStyle === 'satellite') pressed3 = '-clicked';
            $('#satellite_button').append($("<button class='map-style-btn" + pressed3 + "'>Satellite</button>"));
            this.drawLastCommand(id);
        }
    }

    postTime(time, color) {
        this.lastTime = {'time': time, 'color': color};
        this.ctx.fillStyle = color;
        this.ctx.clearRect(this.timer_window['x'], this.timer_window['y'], this.timer_window['width'], this.timer_window['height']);
        this.ctx.fillRect(this.timer_window['x'], this.timer_window['y'], this.timer_window['width'], this.timer_window['height']);
        this.ctx.font = CONSTANTS.INFO_BIG_FONT + "px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(Math.max(time,0), this.timer_window['x']+2,this.timer_window['y'] + 29);
    }

}
module.exports = Commands
