const CONSTANTS = require('../resources/constants.js')

class Scoreboard {
    constructor(socket) {
        this.socket = socket
        this.myMap = CONSTANTS.LOBBY;
        this.myCitysrc = CONSTANTS.LOBBY;
        this.myRoomName = CONSTANTS.LOBBY;
    }

    postScore(rank, name, color, score, wins) {
        const string = $("<font color=" + color + " style=\"font-size:16px;\" \>").html("<b>" + name + "</b>: " + score + '  (' +  wins + ' 🏆)<br>');
        $('#scoreboard').append(string)
    }
    // Message reactions
    clearScores() {
        $('#scoreboard').empty();
        $('#leaderboard').empty();
    }

    postGroup(category, dict) {
       var pop1 = "";
       if (dict['recordBroken1']) pop1 = '🎉';
       var pop2 = "";
       if (dict['recordBroken2']) pop2 = '🎉';
       var pop3 = "";
       if (dict['recordBroken3']) pop3 = '🎉';
       var pop4 = "";
       if (dict['recordBroken4']) pop4 = '🎉';
       var pop5 = "";
       if (dict['recordBroken5']) pop5 = '🎉';

       const string1 = $("<font color=" + dict['recordColor1'] + " style=\"font-size:16px;\" \>").html(pop1 + "🥇 1st: " + dict['record1'] + " (<b>" + dict['recordName1'] + "</b>)" + pop1 + "<br>");
       const string2 = $("<font color=" + dict['recordColor2'] + " style=\"font-size:16px;\" \>").html(pop2 + "🥈 2nd: " + dict['record2'] + " (<b>" + dict['recordName2'] + "</b>)" + pop2 + "<br>");
       const string3 = $("<font color=" + dict['recordColor3'] + " style=\"font-size:16px;\" \>").html(pop3 + "🥉 3rd: " + dict['record3'] + " (<b>" + dict['recordName3'] + "</b>)" + pop3 + "<br>");
       const string4 = $("<font color=" + dict['recordColor4'] + " style=\"font-size:16px;\" \>").html(pop4 + "🥉 4rd: " + dict['record4'] + " (<b>" + dict['recordName4'] + "</b>)" + pop4 + "<br>");
       const string5 = $("<font color=" + dict['recordColor5'] + " style=\"font-size:16px;\" \>").html(pop5 + "🥉 5rd: " + dict['record5'] + " (<b>" + dict['recordName5'] + "</b>)" + pop5 + "<br>");
       $('#leaderboard').append("<b>" + category + "</b><br>");
       $('#leaderboard').append(string1);
       $('#leaderboard').append(string2);
       $('#leaderboard').append(string3);
       $('#leaderboard').append(string4);
       $('#leaderboard').append(string5);
       $('#leaderboard').append("<br>")
    }
    postSpace() {
       // $('#scoreboard').append("<br>-------------------------------------------<br><b>Scoreboard:</b><br>")
    }
    postLobby(recent, hall) {
       $('#leaderboard').append("<b>" + CONSTANTS.FAMESCORE + "+ Hall of Fame (out of 6600 points)</b><br>");
       $('#leaderboard').append(hall);
       $('#leaderboard').append("<b>Recent Records:</b><br>");
       $('#leaderboard').append("<font size=\"1\">" + recent + "</font>");
       $('#scoreboard').append("<br><b>Players in Lobby:</b><br>");
    }
}

module.exports = Scoreboard