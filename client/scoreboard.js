const CONSTANTS = require('../resources/constants.js')

class Scoreboard {
    constructor(socket) {
        this.socket = socket
        this.myRoom = CONSTANTS.LOBBY;

    }

    postScore(rank, name, color, score, wins) {
        const string = $("<font color=" + color + " style=\"font-size:16px;\" \>").html(name + ": " + score + '  (' +  wins + ' 🏆)<br>');
        $('#scoreboard').append(string)
    }
    // Message reactions
    clearScores() {
        $('#scoreboard').empty();
    }
    postRecord(rank, color, score, name, drawPopper) {
       var pop = "";
       if (drawPopper) pop = '🎉';
       var qualifier = "";
       if (rank == 1) qualifier = "🥇 1st";
       else if (rank == 2) qualifier = "🥈 2nd";
       else if (rank == 3) qualifier = "🥉 3rd";

       const string = $("<font color=" + color + " style=\"font-size:16px;\" \>").html(pop + qualifier + ": " + score + " (" + name + ")" + pop + "<br>");
        if (rank == 1) $('#scoreboard').append("<b>Today's Records:</b><br>")
       $('#scoreboard').append(string)
    }
    postAllRecord(color, score, name, drawPopper) {
       var pop = "";
       if (drawPopper) pop = '🎉';
       var qualifier = "🌟";

       const string = $("<font color=" + color + " style=\"font-size:16px;\" \>").html(pop + qualifier + ": " + score + " (" + name + ")" + pop + "<br><br>");
       $('#scoreboard').append("<b>All-time Record:</b><br>")
       $('#scoreboard').append(string)
    }
    postSpace() {
       $('#scoreboard').append("<br><b>Scoreboard:</b><br>")
    }
    postLobby() {
       $('#scoreboard').append("<b>Lobby:</b><br>")
    }
}

module.exports = Scoreboard