const fs = require('fs');
const CONSTANTS = require('../resources/constants.js');
const logfile = '/scratch/connections.log';
const histfile = '/scratch/histograms.log';
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

const trunc = (decimal,n=2) => {
  let x = decimal + ''; // string 
  return x.lastIndexOf('.')>=0?parseFloat(x.substr(0,x.lastIndexOf('.')+(n+1))):decimal; // You can use indexOf() instead of lastIndexOf()
}

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

const recordGuesses = (room, citystring, city, admin, country, ips, dists, times, lats, lons) => {
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

            // Patch for truncating decimals
            Object.keys(history).forEach(function (key,_) {
                history[key]["dists"] = history[key]["dists"].map(x => trunc(x,1));
                history[key]["times"] = history[key]["times"].map(x => trunc(x,1));
            });

            // Patch for back-filling dummy coords for the entries before I started tracked this
            Object.keys(history).forEach(function (key,_) {
                history[key]["lats"] = [];
                history[key]["lons"] = [];
                Object.values(history[key]["dists"]).forEach(function (_,_) {
                        history[key]["lats"] = history[key]["lats"].concat(["x"])
                        history[key]["lons"] = history[key]["lons"].concat(["x"])
                });
                history[key]["mean_lat"] = 0;
                history[key]["mean_lon"] = 0;
            });

            // Add raw data
            if (Object.keys(history).indexOf(citystring) === -1) {
                history[citystring] = {"dists": dists, "times": times, "ips": ips};
            } else {
                history[citystring]["dists"] = history[citystring]["dists"].concat(dists.map(x => trunc(x,1)));
                history[citystring]["times"] = history[citystring]["times"].concat(times.map(x => trunc(x,1)));
                history[citystring]["ips"] = history[citystring]["ips"].concat(ips);
                history[citystring]["lats"] = history[citystring]["lats"].concat(lats.map(x => trunc(x,3)));
                history[citystring]["lons"] = history[citystring]["lons"].concat(lons.map(x => trunc(x,3)));
            }
            // Compute new averages
            history[citystring]["mean_dist"] = trunc(history[citystring]["dists"].reduce((a, b) => a + b) / history[citystring]["dists"].length, 1);
            let trueLats = history[citystring]["lats"].filter(x => x != "x");
            let trueLons = history[citystring]["lons"].filter(x => x != "x");
            if (trueLats.length > 0 && trueLons.length > 0) {
                history[citystring]["mean_lat"] = trunc(trueLats.reduce((a, b) => a + b) / trueLats.length,3);
                history[citystring]["mean_lon"] = trunc(trueLons.reduce((a, b) => a + b) / trueLons.length,3);
            }
            history[citystring]["mean_time"] = trunc(history[citystring]["times"].reduce((a, b) => a + b) / history[citystring]["times"].length, 1);
            history[citystring]["std_dist"] = trunc(Math.sqrt(history[citystring]["dists"].map(x => Math.pow(x - history[citystring]["mean_dist"], 2)).reduce((a, b) => a + b) / history[citystring]["dists"].length), 1);
            history[citystring]["std_time"] = trunc(Math.sqrt(history[citystring]["times"].map(x => Math.pow(x - history[citystring]["mean_time"], 2)).reduce((a, b) => a + b) / history[citystring]["times"].length), 1);
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
    const payload = "There are " + totalPlayers + " players: Lobby (" + rooms[CONSTANTS.LOBBY].playerCount() +
        "), World (" + rooms[CONSTANTS.WORLD].playerCount() +
        "), US (" + rooms[CONSTANTS.US].playerCount() +
        "), Europe (" + rooms[CONSTANTS.EURO].playerCount() +
        "), Africa (" + rooms[CONSTANTS.AFRICA].playerCount() +
        "), SAmerica (" + rooms[CONSTANTS.SAMERICA].playerCount() +
        "), Asia (" + rooms[CONSTANTS.ASIA].playerCount() +
        "), Oceania (" + rooms[CONSTANTS.OCEANIA].playerCount() +
        "), Trivia (" + rooms[CONSTANTS.MISC].playerCount() + ")"
    const currentdate = new Date();
    const timestamp = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":";
    if (fs.existsSync(histfile)) {
        fs.appendFile(histfile, "[" + timestamp + "] " + payload + "\n", function (err) {
            if (err) throw err;
            // console.log('Saved!');
        });
    }
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

const readHallOfFame = (numel) => {
    var result = "";
    if (!fs.existsSync('/scratch/hall_of_fame')) {
        fs.writeFile('/scratch/hall_of_fame', "", { flag: 'wx' }, function (err) {
            if (err) throw err;
        });
    }
    fs.readFileSync('/scratch/hall_of_fame', 'utf-8')
        .split('\n').map( (line, i) => {if (i < numel) result = result + line + "<br>"});
    return result;
};

const prependHallOfFame = (payload) => {
    if (!fs.existsSync('/scratch/hall_of_fame')) {
        fs.writeFile('/scratch/hall_of_fame', "", { flag: 'wx' }, function (err) {
            if (err) throw err;
        });
    }
    const data = fs.readFileSync('/scratch/hall_of_fame');
    const fd = fs.openSync('/scratch/hall_of_fame', 'w+');
    const insert = new Buffer(payload + "\n"); // TODO: use safer Buffer api
    fs.writeSync(fd, insert, 0, insert.length, 0);
    fs.writeSync(fd, data, 0, data.length, insert.length);
    fs.close(fd, (err) => {
      if (err) throw err;
    });
};

module.exports = {log, logFeedback, logHistogram, readRecentActivity, prependRecentActivity, recordGuesses, readHallOfFame, prependHallOfFame};
