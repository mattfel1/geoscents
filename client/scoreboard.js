const CONSTANTS = require('../resources/constants.js')

class Scoreboard {
    constructor(socket) {
        this.socket = socket
        this.myRoom = CONSTANTS.LOBBY;

    }

    postScore(rank, name, color, score, wins, ready, trophy) {
        const string = $("<font color=" + color + " style=\"font-size:16px;\" \>").html(ready + trophy + name + ": " + score + '  (' +  wins + ' 🏆)<br>');
        $('#scoreboard').append(string)
    }
    // Message reactions
    clearScores(record, color, name, drawPopper) {
        $('#scoreboard').empty();
    }
    postRecord(color, score, name, drawPopper) {
       var pop = "";
       if (drawPopper) pop = '🎉';
       const string = $("<font color=" + color + " style=\"font-size:16px;\" \>").html(pop + "Today's Record: " + score + " (" + name + ")" + pop + "<br><br>");
       $('#scoreboard').append(string)
    }
}

module.exports = Scoreboard