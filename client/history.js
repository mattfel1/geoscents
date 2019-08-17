const CONSTANTS = require('../resources/constants.js')

class History {
    constructor(socket) {
        this.socket = socket;
        this.myRoom = CONSTANTS.LOBBY;
        this.histCount = 0;
    }

    breakHistory(room, winner, score, color, record) {
        if (room == this.myRoom) {
            var newRecord = "";
            if (record) newRecord = " 🎉 NEW RECORD 🎉";
            var assembled = "<br>******* " + myRoom + " WINNER: <font color=\"" + color + "\">" + winner + " (" + score + " points)</font>" + newRecord + " *******<br>"
            var final_message = $("<font style=\"font-size:20px;\" />").html(assembled);
            $('#gamehist').prepend(" ");
            $('#gamehist').prepend(final_message);
            this.histcount = this.histcount + 1;
            if (this.histcount > CONSTANTS.MAX_GAME_HIST) {
                $('#gamehist').children().last().remove();
                this.histcount = this.histcount - 1;
            }
        }
    }
    addHistory(room, payload) {
        if (room == this.myRoom) {
            var assembled = payload;
            var final_message = $("<font style=\"font-size:20px;\" />").html(assembled);
            $('#gamehist').prepend(final_message);
            this.histcount = this.histcount + 1;
            if (this.histcount > CONSTANTS.MAX_GAME_HIST) {
                $('#gamehist').children().last().remove();
                this.histcount = this.histcount - 1;
            }
        }

    }
}

module.exports = History