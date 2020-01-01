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

module.exports = {log, logHistogram, readRecentActivity, prependRecentActivity};