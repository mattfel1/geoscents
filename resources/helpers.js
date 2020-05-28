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

const makeLink = (room, thisTarget) => {
    let part2 = "%2C+" + thisTarget['country'];
    if (thisTarget['country'] === "USA") part2 = "%2C+" + thisTarget['admin_name'];
    let wiki = "https://en.wikipedia.org/wiki/Special:Search?search=" + thisTarget['city'] + part2 + "&go=Go&ns0=1";
    if (thisTarget['wiki'] != null) wiki = thisTarget['wiki'];
    return wiki;
}
const recordGuesses = (map, citystring, city, admin, country, iso2, raw_ips, dists, times, lats, lons, true_lat, true_lon, link) => {
    try {

        function copy(x) {
            return JSON.parse(JSON.stringify(x, null, 2));
        }

        const file = '/scratch/' + map + '_guesses';
        const joefile = '/scratch/' + map + '_joe';
        if (!fs.existsSync(file)) {
            console.log('File ' + file + ' doesnt exist!!')
            fs.writeFile(file, "", {flag: 'wx'}, function (err) {
                if (err) throw err;
            });
        } else {
            fs.readFile(file, 'utf8', (err, data) => {
                let history;
                try {
                    history = JSON.parse(data);
                } catch {
                    history = {}
                    console.log('File ' + file + ' is corrupted!')
                }
                try {
                    // // Patch for populating initial joe files
                    //     if (!fs.existsSync(joefile)) {
                    //         fs.writeFile(joefile, "", {flag: 'wx'}, function (err) {
                    //             if (err) throw err;
                    //         });
                    //     } else {
                    //         fs.readFile(joefile, 'utf8', (err, joedata) => {
                    //             let joehistory;
                    //             try {
                    //                 joehistory = JSON.parse(joedata);
                    //             } catch {
                    //                 joehistory = {}
                    //             }
                    //             Object.keys(history).forEach(function (key, _) {
                    //                 joehistory[key] = {
                    //                     "mean_time": history[key]["mean_time"],
                    //                     "mean_lat": history[key]["mean_lat"],
                    //                     "mean_lon": history[key]["mean_lon"]
                    //                 };
                    //             });
                    //             // Commit back to file
                    //             fs.writeFile(joefile, JSON.stringify(copy(joehistory), null, 2), function (err) {
                    //                 if (err) {
                    //                     return console.log(err);
                    //                 }
                    //             });
                    //         });
                    //     }

                    // // Patch for back-filling dummy ip addresses for the entries before I started tracked this
                    // Object.keys(history).forEach(function (key,_) {
                    //     history[key]["ips"] = [];
                    //     Object.values(history[key]["dists"]).forEach(function (_,_) {
                    //             history[key]["ips"] = history[key]["ips"].concat(["::ffff:127.0.0.1"])
                    //     });
                    // });

                    // // Patch for truncating decimals
                    // Object.keys(history).forEach(function (key,_) {
                    //     history[key]["dists"] = history[key]["dists"].map(x => trunc(x,1));
                    //     history[key]["times"] = history[key]["times"].map(x => trunc(x,1));
                    // });

                    // // Patch for back-filling dummy coords for the entries before I started tracked this
                    // Object.keys(history).forEach(function (key,_) {
                    //     history[key]["lats"] = [];
                    //     history[key]["lons"] = [];
                    //     Object.values(history[key]["dists"]).forEach(function (_,_) {
                    //             history[key]["lats"] = history[key]["lats"].concat(["x"])
                    //             history[key]["lons"] = history[key]["lons"].concat(["x"])
                    //     });
                    //     history[key]["mean_lat"] = 0;
                    //     history[key]["mean_lon"] = 0;
                    // });

                    // Add raw data
                    let ips = [];
                    Object.values(raw_ips).forEach((ip) => {ips.push(ip.replace("::ffff:",""))});

                    if (Object.keys(history).indexOf(citystring) === -1) {
                        history[citystring] = {"dists": dists, "times": times, "ips": ips, "lats": lats, "lons": lons};
                    } else {
                        history[citystring]["dists"] = history[citystring]["dists"].concat(dists.map(x => trunc(x, 1)));
                        history[citystring]["times"] = history[citystring]["times"].concat(times.map(x => trunc(x, 1)));
                        history[citystring]["ips"] = history[citystring]["ips"].concat(ips);
                        history[citystring]["lats"] = history[citystring]["lats"].concat(lats.map(x => trunc(x, 3)));
                        history[citystring]["lons"] = history[citystring]["lons"].concat(lons.map(x => trunc(x, 3)));
                    }
                    // Compute new averages
                    history[citystring]["true_lat"] = true_lat;
                    history[citystring]["true_lon"] = true_lon;
                    history[citystring]["wiki"] = link;
                    history[citystring]["mean_dist"] = trunc(history[citystring]["dists"].reduce((a, b) => a + b) / history[citystring]["dists"].length, 1);
                    let trueLats = history[citystring]["lats"].filter(x => x != "x");
                    let trueLons = history[citystring]["lons"].filter(x => x != "x");
                    let mean_lat = 0;
                    let mean_lon = 0;
                    let mean_time = trunc(history[citystring]["times"].reduce((a, b) => a + b) / history[citystring]["times"].length, 1);
                    if (trueLats.length > 0 && trueLons.length > 0) {
                        mean_lat = trunc(trueLats.reduce((a, b) => a + b) / trueLats.length, 3);
                        mean_lon = trunc(trueLons.reduce((a, b) => a + b) / trueLons.length, 3);
                        history[citystring]["mean_lat"] = mean_lat;
                        history[citystring]["mean_lon"] = mean_lon;
                    }
                    history[citystring]["mean_time"] = mean_time;
                    history[citystring]["std_dist"] = trunc(Math.sqrt(history[citystring]["dists"].map(x => Math.pow(x - history[citystring]["mean_dist"], 2)).reduce((a, b) => a + b) / history[citystring]["dists"].length), 1);
                    history[citystring]["std_time"] = trunc(Math.sqrt(history[citystring]["times"].map(x => Math.pow(x - history[citystring]["mean_time"], 2)).reduce((a, b) => a + b) / history[citystring]["times"].length), 1);
                    history[citystring]["city"] = city;
                    history[citystring]["admin"] = admin;
                    history[citystring]["country"] = country;
                    history[citystring]["iso2"] = iso2;
                    // Update mini file for joe
                    if (!fs.existsSync(joefile)) {
                        fs.writeFile(joefile, "", {flag: 'wx'}, function (err) {
                            if (err) throw err;
                        });
                    } else {
                        let joehistory;
                        fs.readFile(joefile, 'utf8', (err, joedata) => {
                            try {
                                joehistory = JSON.parse(joedata);
                            } catch {
                                joehistory = {}
                            }
                            joehistory[citystring] = {
                                "mean_time": mean_time,
                                "mean_lat": mean_lat,
                                "mean_lon": mean_lon
                            };
                            // Commit back to file
                            fs.writeFile(joefile, JSON.stringify(copy(joehistory), null, 2), function (err) {
                                if (err) {
                                    return console.log(err);
                                }
                            });
                        });
                    }
                } catch (err) {}
                // Commit back to file
                fs.writeFile(file, JSON.stringify(copy(history), null, 2), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });

            });
        }
    }
    catch (err) {
        logFeedback("Something seems messed up with guess logging!!!!")
    }
};

const joeData = (map, citystring) => {
    try {
        const file = '/scratch/' + map + '_joe';
        history = JSON.parse(fs.readFileSync(file, 'utf8'));
        return [history[citystring]["mean_time"], history[citystring]["mean_lat"], history[citystring]["mean_lon"]];
    } catch {
        return [10,0,0];
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

module.exports = {log, logFeedback, logHistogram, readRecentActivity, prependRecentActivity, recordGuesses, readHallOfFame, prependHallOfFame, makeLink, joeData};
