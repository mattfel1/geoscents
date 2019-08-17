const CONSTANTS = require('../resources/constants.js')

class Commands {
    constructor(socket) {
        this.socket = socket
        this.panel = window.document.getElementById('panel');
        this.panel_ctx = this.panel.getContext('2d');
        this.myRoom = CONSTANTS.LOBBY;
        this.us_count = 0;
        this.world_count = 0;
        this.euro_count = 0;
        this.lobby_button = {
            x: this.panel.width*400/600,
            y: this.panel.height*210/824,
            width: this.panel.width*175/600,
            height: CONSTANTS.BUTTONS_HEIGHT
        };
        this.info_window = {
            x: CONSTANTS.INFO_X,
            y: 80,
            width: this.panel.width - 30,
            height: this.panel.height*180/824
        };
        this.ready_button = {
            x:CONSTANTS.INFO_X,
            y:80 + CONSTANTS.BUTTONS_HEIGHT + CONSTANTS.BUTTONS_SPACING,
            width:CONSTANTS.BUTTONS_WIDTH,
            height:CONSTANTS.BUTTONS_HEIGHT
        };
        this.world_button = {
            x:CONSTANTS.INFO_X,
            y:80,
            width:CONSTANTS.BUTTONS_WIDTH,
            height:CONSTANTS.BUTTONS_HEIGHT
        };
        this.us_button = {
            x:CONSTANTS.INFO_X,
            y:80 + CONSTANTS.BUTTONS_HEIGHT + CONSTANTS.BUTTONS_SPACING,
            width:CONSTANTS.BUTTONS_WIDTH,
            height:CONSTANTS.BUTTONS_HEIGHT
        };
        this.euro_button = {
            x:CONSTANTS.INFO_X,
            y:80 + 2*(CONSTANTS.BUTTONS_HEIGHT + CONSTANTS.BUTTONS_SPACING),
            width:CONSTANTS.BUTTONS_WIDTH,
            height:CONSTANTS.BUTTONS_HEIGHT
        };
        this.timer_window = {
            x: 10,
            y: 5,
            width: CONSTANTS.BUTTONS_HEIGHT,
            height: CONSTANTS.BUTTONS_HEIGHT
        };
        this.round_window = {
            x: panel.width*440/600,
            y: 40,
            width: (panel.width-30)*160/600,
            height: 40
        };
        this.time_descrip_window = {
            x: 70,
            y: 10,
            width: 300,
            height: 40
        }
    }


    postBackToLobby() {
        if (this.myRoom != CONSTANTS.LOBBY) {
            this.panel_ctx.fillStyle = CONSTANTS.MAP_BUTTON_COLOR;
            this.panel_ctx.fillRect(this.lobby_button['x'], this.lobby_button['y'], this.lobby_button['width'], this.lobby_button['height']);
            this.panel_ctx.font = CONSTANTS.BUTTONS_FONT + "px Arial";
            this.panel_ctx.fillStyle = 'black';
            this.panel_ctx.fillText('Back to Lobby', this.lobby_button['x'] + 5, this.lobby_button['y'] + 28)
        }
    }
    updateCounts(w,u,e) {
       this.world_count = w;
       this.us_count = u;
       this.euro_count = e;
    }
    postLobby() {
        this.panel_ctx.clearRect(this.time_descrip_window['x'], this.time_descrip_window['y'], this.time_descrip_window['width'], this.time_descrip_window['height'])
        this.panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.panel_ctx.fillRect(this.time_descrip_window['x'], this.time_descrip_window['y'], this.time_descrip_window['width'], this.time_descrip_window['height']);    this.panel_ctx.font = "25px Arial";
        this.panel_ctx.clearRect(this.timer_window['x'], this.timer_window['y'], this.timer_window['width'], this.timer_window['height']);
        this.panel_ctx.fillRect(this.timer_window['x'], this.timer_window['y'], this.timer_window['width'], this.timer_window['height']);


        this.panel_ctx.clearRect(this.info_window['x'], this.info_window['y'], this.info_window['width'], this.info_window['height']);
        this.panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.panel_ctx.fillRect(this.info_window['x'], this.info_window['y'], this.info_window['width'], this.info_window['height']);

        this.panel_ctx.clearRect(this.round_window['x'], this.round_window['y'], this.round_window['width'], this.round_window['height']);
        this.panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.panel_ctx.fillRect(this.round_window['x'], this.round_window['y'], this.round_window['width'], this.round_window['height']);

        this.panel_ctx.fillStyle = CONSTANTS.MAP_BUTTON_COLOR;
        this.panel_ctx.fillRect(this.world_button['x'], this.world_button['y'], this.world_button['width'], this.world_button['height']);
        this.panel_ctx.font = CONSTANTS.BUTTONS_FONT + "px Arial";
        this.panel_ctx.fillStyle = 'black';
        this.panel_ctx.fillText(CONSTANTS.WORLD + '  (' + this.world_count + ' players)', this.world_button['x'] + 5, this.world_button['y'] + 28)

        this.panel_ctx.fillStyle = CONSTANTS.MAP_BUTTON_COLOR;
        this.panel_ctx.fillRect(this.us_button['x'], this.us_button['y'], this.us_button['width'], this.us_button['height']);
        this.panel_ctx.font = CONSTANTS.BUTTONS_FONT + "px Arial";
        this.panel_ctx.fillStyle = 'black';
        this.panel_ctx.fillText(CONSTANTS.US + ' (' + this.us_count + ' players)', this.us_button['x'] + 5, this.us_button['y'] + 28)

        this.panel_ctx.fillStyle = CONSTANTS.MAP_BUTTON_COLOR;
        this.panel_ctx.fillRect(this.euro_button['x'], this.euro_button['y'], this.euro_button['width'], this.euro_button['height']);
        this.panel_ctx.font = CONSTANTS.BUTTONS_FONT + "px Arial";
        this.panel_ctx.fillStyle = 'black';
        this.panel_ctx.fillText(CONSTANTS.EURO + '  (' + this.euro_count + ' players)', this.euro_button['x'] + 5, this.euro_button['y'] + 28)
    }
    drawRound(round) {
        this.panel_ctx.clearRect(this.round_window['x'], this.round_window['y'], this.round_window['width'], this.round_window['height']);
        this.panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.panel_ctx.fillRect(this.round_window['x'], this.round_window['y'], this.round_window['width'], this.round_window['height']);
        this.panel_ctx.font = panel.height*25/824 + "px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText('Round ' + round + '/' + CONSTANTS.GAME_ROUNDS, this.round_window['x']+2,this.round_window['y'] + 25);
    }


    postInfo(info1, info2, button, capital) {
        this.panel_ctx.clearRect(this.info_window['x'], this.info_window['y'], this.info_window['width'], this.info_window['height']);
        this.panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.panel_ctx.fillRect(this.info_window['x'], this.info_window['y'], this.info_window['width'], this.info_window['height']);

        this.panel_ctx.font = CONSTANTS.INFO_BIG_FONT + "px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(info1, this.info_window['x'] + 5, this.info_window['y'] + 28)

        if (info2.length < CONSTANTS.LONGCITY) {
            this.panel_ctx.font = CONSTANTS.INFO_BIG_FONT + "px Arial";
        }
        else {
            this.panel_ctx.font = CONSTANTS.INFO_LITTLE_FONT + "px Arial";
        }

        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(info2, this.info_window['x'] + 5, this.info_window['y'] + 26 + CONSTANTS.INFO_SPACING);

        if (button) {
            this.panel_ctx.fillStyle = "orange";
            this.panel_ctx.fillRect(this.ready_button['x'], this.ready_button['y'], this.ready_button['width'], this.ready_button['height']);
            this.panel_ctx.font = CONSTANTS.BUTTONS_FONT + "px Arial";
            this.panel_ctx.fillStyle = 'black';
            this.panel_ctx.fillText('CLICK IF READY!', this.ready_button['x'] + 5, this.ready_button['y'] + 28)
        }

        if (capital != "") {
            this.panel_ctx.font = CONSTANTS.INFO_BIG_FONT + "px Arial";
            this.panel_ctx.fillStyle = "black";
            this.panel_ctx.fillText(capital, this.info_window['x'] + 15, this.info_window['y'] + 26 + 2*CONSTANTS.INFO_SPACING)
        }
    }

    postTime(time, color) {
        this.panel_ctx.fillStyle = color;
        this.panel_ctx.clearRect(this.timer_window['x'], this.timer_window['y'], this.timer_window['width'], this.timer_window['height']);
        this.panel_ctx.fillRect(this.timer_window['x'], this.timer_window['y'], this.timer_window['width'], this.timer_window['height']);
        this.panel_ctx.font = CONSTANTS.INFO_BIG_FONT + "px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(Math.max(time,0), this.timer_window['x']+5,this.timer_window['y'] + 33);
    }

    postTimeDescrip(info) {
        this.panel_ctx.clearRect(this.time_descrip_window['x'], this.time_descrip_window['y'], this.time_descrip_window['width'], this.time_descrip_window['height'])
        this.panel_ctx.fillStyle = CONSTANTS.BGCOLOR;
        this.panel_ctx.fillRect(this.time_descrip_window['x'], this.time_descrip_window['y'], this.time_descrip_window['width'], this.time_descrip_window['height']);
        this.panel_ctx.font = "25px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(info, this.time_descrip_window['x'] + 5, this.time_descrip_window['y']+25)
    }
}
module.exports = Commands
