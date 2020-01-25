const fs = require('fs');
const CONSTANTS = require('../resources/constants.js');
const logfile = '/scratch/connections.log';
const feedbackfile = '/scratch/feedback.log';

const log = (payload) => {
    const currentdate = new Date();
    const timestamp = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":";
    if (fs.existsSync(logfile)) {
        fs.appendFile(logfile, "[" + timestamp + "] " + payload + "\n", function (err) {
            if (err) throw err;
            // console.log('Saved!');
        });
    }
};

const logFeedback = (payload) => {
    const currentdate = new Date();
    const timestamp = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":";
    if (fs.existsSync(feedbackfile)) {
        fs.appendFile(feedbackfile, "[" + timestamp + "] " + payload + "\n", function (err) {
            if (err) throw err;
            // console.log('Saved!');
        });
    }
};

const recordGuesses = (room, citystring, city, admin, country, ips, dists, times) => {
    function copy(x) {
        return JSON.parse( JSON.stringify(x) );
    }
    const file = '/scratch/' + room + '_guesses';
    if (!fs.existsSync(file)) {
        fs.writeFile(file, "", { flag: 'wx' }, function (err) {
            if (err) throw err;
        });
    }
    else {
        let history;
        try {
            history = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (err) {
            history = {};
        }
        try {
            // // Patch for back-filling dummy ip addresses for the entries before I started tracked this
            // Object.keys(history).forEach(function (key,_) {
            //     history[key]["ips"] = [];
            //     Object.values(history[key]["dists"]).forEach(function (_,_) {
            //             history[key]["ips"] = history[key]["ips"].concat(["::ffff:127.0.0.1"])
            //     });
            // });

            // Add raw data
            if (Object.keys(history).indexOf(citystring) === -1) {
                history[citystring] = {"dists": dists, "times": times, "ips": ips};
            } else {
                history[citystring]["dists"] = history[citystring]["dists"].concat(dists);
                history[citystring]["times"] = history[citystring]["times"].concat(times);
                history[citystring]["ips"] = history[citystring]["ips"].concat(ips);
            }
            // Compute new averages
            history[citystring]["mean_dist"] = history[citystring]["dists"].reduce((a, b) => a + b) / history[citystring]["dists"].length;
            history[citystring]["mean_time"] = history[citystring]["times"].reduce((a, b) => a + b) / history[citystring]["times"].length;
            history[citystring]["std_dist"] = Math.sqrt(history[citystring]["dists"].map(x => Math.pow(x - history[citystring]["mean_dist"], 2)).reduce((a, b) => a + b) / history[citystring]["dists"].length);
            history[citystring]["std_time"] = Math.sqrt(history[citystring]["times"].map(x => Math.pow(x - history[citystring]["mean_time"], 2)).reduce((a, b) => a + b) / history[citystring]["times"].length);
            history[citystring]["city"] = city;
            history[citystring]["admin"] = admin;
            history[citystring]["country"] = country;
        } catch (err) {}
        // Commit back to file
        fs.writeFile(file, JSON.stringify(copy(history)), function(err) {if(err){return console.log(err);}});
    }
};

const logHistogram = (rooms) => {
    const totalPlayers = rooms[CONSTANTS.LOBBY].playerCount() + rooms[CONSTANTS.WORLD].playerCount() + rooms[CONSTANTS.US].playerCount() + rooms[CONSTANTS.EURO].playerCount() + rooms[CONSTANTS.AFRICA].playerCount() + rooms[CONSTANTS.SAMERICA].playerCount() + rooms[CONSTANTS.ASIA].playerCount() + rooms[CONSTANTS.OCEANIA].playerCount() + rooms[CONSTANTS.MISC].playerCount();
    log("There are " + totalPlayers + " players: Lobby (" + rooms[CONSTANTS.LOBBY].playerCount() +
        "), World (" + rooms[CONSTANTS.WORLD].playerCount() +
        "), US (" + rooms[CONSTANTS.US].playerCount() +
        "), Europe (" + rooms[CONSTANTS.EURO].playerCount() +
        "), Africa (" + rooms[CONSTANTS.AFRICA].playerCount() +
        "), SAmerica (" + rooms[CONSTANTS.SAMERICA].playerCount() +
        "), Asia (" + rooms[CONSTANTS.ASIA].playerCount() +
        "), Oceania (" + rooms[CONSTANTS.OCEANIA].playerCount() +
        "), Trivia (" + rooms[CONSTANTS.TRIVIA].playerCount() + ")"
        )
};

const readRecentActivity = (numel) => {
    var result = "";
    if (!fs.existsSync('/scratch/recent_activity')) {
        fs.writeFile('/scratch/recent_activity', "", { flag: 'wx' }, function (err) {
            if (err) throw err;
        });
    }
    fs.readFileSync('/scratch/recent_activity', 'utf-8')
        .split('\n').map( (line, i) => {if (i < numel) result = result + line + "<br>"});
    return result;
};

const prependRecentActivity = (payload) => {
    if (!fs.existsSync('/scratch/recent_activity')) {
        fs.writeFile('/scratch/recent_activity', "", { flag: 'wx' }, function (err) {
            if (err) throw err;
        });
    }
    const data = fs.readFileSync('/scratch/recent_activity');
    const fd = fs.openSync('/scratch/recent_activity', 'w+');
    const insert = new Buffer(payload + "\n"); // TODO: use safer Buffer api
    fs.writeSync(fd, insert, 0, insert.length, 0);
    fs.writeSync(fd, data, 0, data.length, insert.length);
    fs.close(fd, (err) => {
      if (err) throw err;
    });
};

module.exports = {log, logFeedback, logHistogram, readRecentActivity, prependRecentActivity, recordGuesses};
