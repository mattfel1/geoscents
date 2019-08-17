const CONSTANTS = require('../resources/constants.js')

class Scoreboard {
    constructor(socket) {
        this.socket = socket
        this.panel = window.document.getElementById('panel');
        this.panel_ctx = this.panel.getContext('2d');
        this.myRoom = CONSTANTS.LOBBY;
        this.scoreboard_window = {
            x: 0,
            y: this.panel.height/3,
            width: this.panel.width-15,
            height: 2*this.panel.height/3
        };

        this.record_window = {
            x: this.panel.width*2/5 - 70,
            y: this.panel.height/3 + 20,
            width: this.panel.width/3 + 50,
            height: 35
        };

    }

    postScore(rank, name, color, score, wins, you, trophy) {
        this.panel_ctx.font = CONSTANTS.INFO_BIG_FONT + "px Arial";
        this.panel_ctx.fillStyle = color;
        this.panel_ctx.fillText(name + ": " + score + '  (' + wins + ' 🏆)' + you, this.scoreboard_window['x'] + 80, this.scoreboard_window['y'] + 85 + rank * 40 );
        if (trophy) this.panel_ctx.fillText("🏆", this.scoreboard_window['x'] + 50, this.scoreboard_window['y'] + 85 )
    }

    postReady(rank) {
        this.panel_ctx.font = CONSTANTS.INFO_BIG_FONT + "px Arial";
        this.panel_ctx.fillStyle = "green";
        this.panel_ctx.fillText("✔️", this.scoreboard_window['x'] + 10, this.scoreboard_window['y'] + 85 + rank * 40 )
    }

    // Message reactions
    clearScores(record, color, name, drawPopper) {
        this.panel_ctx.clearRect(this.scoreboard_window['x'], this.scoreboard_window['y'], this.scoreboard_window['width'], this.scoreboard_window['height']);
        this.panel_ctx.fillStyle =  "#e3e4e6";
        this.panel_ctx.fillRect(this.scoreboard_window['x'], this.scoreboard_window['y'], this.scoreboard_window['width'], this.scoreboard_window['height']);
        this.panel_ctx.font = "35px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText("Scores:", this.scoreboard_window['x'] + 5, this.scoreboard_window['y'] + 45)

        if (this.myRoom != CONSTANTS.LOBBY) {
            this.panel_ctx.fillStyle = color;
            this.panel_ctx.font = "22px Arial";
            this.panel_ctx.fillText("Today's Record " + record + " (" + name + ")", this.record_window['x'] + 5, this.record_window['y'] + 20);
            if (drawPopper) this.panel_ctx.fillText("🎉", this.record_window['x'] - 20, this.record_window['y'] + 20);
        }
    }

}

module.exports = Scoreboard