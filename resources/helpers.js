const fs = require('fs');
const lineReader = require('line-reader');
const CONSTANTS = require('../resources/constants.js');
const logfile = '/root/connections.log';


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

const recordGuesses = (room, citystring, dists, times) => {
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
        // Add raw data
        if (Object.keys(history).indexOf(citystring) === -1) {
            history[citystring] = {"dists": dists, "times": times};
        } else {
            history[citystring]["dists"] = history[citystring]["dists"].concat(dists);
            history[citystring]["times"] = history[citystring]["times"].concat(times);
        }
        // Compute new averages
        try {
            history[citystring]["mean_dist"] = history[citystring]["dists"].reduce((a, b) => a + b) / history[citystring]["dists"].length;
            history[citystring]["mean_time"] = history[citystring]["times"].reduce((a, b) => a + b) / history[citystring]["times"].length;
            history[citystring]["std_dist"] = Math.sqrt(history[citystring]["dists"].map(x => Math.pow(x - history[citystring]["mean_dist"], 2)).reduce((a, b) => a + b) / history[citystring]["dists"].length);
            history[citystring]["std_time"] = Math.sqrt(history[citystring]["times"].map(x => Math.pow(x - history[citystring]["mean_time"], 2)).reduce((a, b) => a + b) / history[citystring]["times"].length);
        } catch (err) {};
        // Commit back to file
        fs.writeFile(file, JSON.stringify(copy(history)), function(err) {if(err){return console.log(err);}});
    }
};

const logHistogram = (rooms) => {
    log("Current player histogram: Lobby (" + rooms[CONSTANTS.LOBBY].playerCount() + "), World (" + rooms[CONSTANTS.WORLD].playerCount() + "), US (" + rooms[CONSTANTS.US].playerCount() + "), Eurasia (" + rooms[CONSTANTS.EURO].playerCount() + "), Africa (" + rooms[CONSTANTS.AFRICA].playerCount() + "), SAmerica (" + rooms[CONSTANTS.SAMERICA].playerCount() + ")")
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

module.exports = {log, logHistogram, readRecentActivity, prependRecentActivity, recordGuesses};