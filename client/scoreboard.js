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

    postGroup(category, dict) {
       var pop1 = "";
       if (dict['recordBroken1']) pop1 = '🎉';
       var pop2 = "";
       if (dict['recordBroken2']) pop2 = '🎉';
       var pop3 = "";
       if (dict['recordBroken3']) pop3 = '🎉';

       const string1 = $("<font color=" + dict['recordColor1'] + " style=\"font-size:16px;\" \>").html(pop1 +  "🥇 1st: " + dict['record1'] + " (" + dict['recordName1'] + ")" + pop1 + "<br>");
       const string2 = $("<font color=" + dict['recordColor2'] + " style=\"font-size:16px;\" \>").html(pop2 + "🥈 2nd: " + dict['record2'] + " (" + dict['recordName2'] + ")" + pop2 + "<br>");
       const string3 = $("<font color=" + dict['recordColor3'] + " style=\"font-size:16px;\" \>").html(pop3 + "🥉 3rd: " + dict['record3'] + " (" + dict['recordName3'] + ")" + pop3 + "<br>");
       $('#scoreboard').append("<b>" + category + "</b><br>");
       $('#scoreboard').append(string1);
       $('#scoreboard').append(string2);
       $('#scoreboard').append(string3);
       $('#scoreboard').append("<br>")
    }
    postSpace() {
       $('#scoreboard').append("<br>-------------------------------------------<br><b>Scoreboard:</b><br>")
    }
    postLobby(recent, hall) {
       $('#scoreboard').append("<b>" + CONSTANTS.FAMESCORE + "+ Hall of Fame (out of 6600 points)</b><br>");
       $('#scoreboard').append(hall);
       $('#scoreboard').append("-------------------------------------------<br>")
       $('#scoreboard').append("<br><b>Recent Records:</b><br>");
       $('#scoreboard').append("<font size=\"1\">" + recent + "</font>");
       $('#scoreboard').append("-------------------------------------------<br>")
       $('#scoreboard').append("<br><b>Players in Lobby:</b><br>");
    }
}

module.exports = Scoreboard