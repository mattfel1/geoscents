const fs = require('fs');
const CONSTANTS = require('../resources/constants.js');
const Geography = require('../server/geography.js');
const logfile = '/scratch/connections.log';
const messagefile = '/scratch/messages.log';
const histfile = '/scratch/histograms.log';
const feedbackfile = '/scratch/feedback.log';
const MAPS = require('../resources/maps.json')
var lastUpdates = {};


const playerHistHtml = (name) => {
    return `

<!DOCTYPE html>
<head prefix="og: http://ogp.me/ns#">
    <meta charset="UTF-8">
    <meta name="description" content="Plots for Geoscents. An online multiplayer world geography game!  Test your knowledge of city locations." />
    <title>` + name + ` Play History</title>
    <!-- Place this tag in your head or just before your close body tag. -->
    <link rel="icon" type="image/png" href="https://geoscents.net/resources/images/favicon.png" sizes="48x48">
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.6.3/papaparse.min.js"></script>
    <meta name="GeoScents Plots" content="Plots for Geoscents.  An online multiplayer world geography game!  Test your knowledge of city locations. This is a recreation of the game Geosense from geosense.net.">
    <meta property="og:image" content="https://geoscents.net/resources/images/ogimage.png" />
<script src="https://code.jquery.com/jquery-3.3.1.js"></script>
<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>
<style>
table, td, th {
  border: 1px solid black;
}

table {
  border-collapse: collapse;
}

th {
  height: 50px;
}
</style>
</head>
<body>
<script src="https://code.jquery.com/jquery-3.3.1.js"></script>
<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.20/css/jquery.dataTables.min.css">

<h3>` + name + ` Play History</h3>
<table id="history" class="display" width="75%" align="left"></table>
<br><br>

<script  type="text/javascript" src="` + name + `_history.js"></script>

</body>
</html>

`
}

const playerHistJs = (name) => {
    return `

$(document).ready(function() {
      Papa.parse("` + name + `_history.csv", {
          download: true,
          skipEmptyLines: true,
          "pageLength": 400,
          complete: function(example) {
          $(document).ready(function () {
              $('#history').DataTable({
                  data: example.data,
                  dataSrc:"",
                  columns: [
            { title: "Timestamp", "width": "5%"},
            { title: "Map", "width": "5%"},
            { title: "Score", "width": "5%" },
            { title: "Color", "width": "5%"}
                  ]
              });
          });
          }
      });
} );



`
}

const famerHistHtml = (name, public_hash) => {
    return `

<!DOCTYPE html>
<head prefix="og: http://ogp.me/ns#">
    <meta charset="UTF-8">
    <meta name="description" content="Plots for Geoscents. An online multiplayer world geography game!  Test your knowledge of city locations." />
    <title>` + name + ` Hall of Fame History</title>
    <!-- Place this tag in your head or just before your close body tag. -->
    <link rel="icon" type="image/png" href="https://geoscents.net/resources/images/favicon.png" sizes="48x48">
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.6.3/papaparse.min.js"></script>
    <meta name="GeoScents Plots" content="Plots for Geoscents.  An online multiplayer world geography game!  Test your knowledge of city locations. This is a recreation of the game Geosense from geosense.net.">
    <meta property="og:image" content="https://geoscents.net/resources/images/ogimage.png" />
<script src="https://code.jquery.com/jquery-3.3.1.js"></script>
<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>
<style>
table, td, th {
  border: 1px solid black;
}

table {
  border-collapse: collapse;
}

th {
  height: 50px;
}
.filter-btn {
    cursor: pointer;
    border: 1px solid #333;
    padding: 2px 2px;
    margin: 3px 3px;
    font-size: 16px;
    background: #a9e7f9;
    /* fallback */
    border-radius: 2px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}
</style>
</head>
<body>
<script src="https://code.jquery.com/jquery-3.3.1.js"></script>
<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.20/css/jquery.dataTables.min.css">

<h3>` + name + ` Hall of Fame History</h3>
<div id="buttons"></div>
<table id="table" class="display" width="75%" align="left"></table>
<br><br>

<script  type="text/javascript" src="` + name + `.js"></script>

</body>
</html>

`
}

const famerHistJs = (name, public_hash) => {
    return `

$(document).ready(function() {
      Papa.parse("` + name + `.csv", {
        download: true,
        skipEmptyLines: true,
        "pageLength": 400,
        complete: function(results) {
            $(document).ready(function() {
                const table = $('#table').DataTable({
                    data: results.data,
                    dataSrc: "",
                    columns: [{
                            title: "Timestamp",
                            "width": "5%"
                        },
                        {
                            title: "Map",
                            "width": "5%"
                        },
                        {
                            title: "Score",
                            "width": "5%"
                        },
                        {
                            title: "Path",
                            "width": "35%"
                        },
                        {
                            title: "Color",
                            "width": "5%"
                        },
                        {
                            title: "Public hash (if multiple users had same username)",
                            "width": "5%"
                        }
                    ]
                });
                // All button
                let all_btn = document.createElement("button");
                all_btn.id = "all"
                all_btn.className = "filter-btn"
                all_btn.style = "background: yellow;"
                all_btn.innerHTML = "Show All"
                document.getElementById("buttons").append(all_btn)

                let maps = []
                let perfect = false

                for (const x in results.data) {
                    let map = results.data[x][1];
                    if (!maps.includes(map)) {
                        maps.push(map)
                    }
                    let score = results.data[x][2]
                    if (score == 6600)
                        perfect = true
                }

                $(document).on('click', '#all', function() {
                    document.getElementById("all").style.background = "yellow"
                    for (const y in maps) {
                        let map2 = maps[y].replace(' ', '');
                        document.getElementById(map2).style.background = "#a9e7f9"
                    }
                    if (perfect)
                        document.getElementById("Perfect").style.background = "#a9e7f9"
                    table.columns(1).search("").draw();
                    table.columns(2).search("").draw();
                });

                for (const x in maps) {
                    let map = maps[x]
                    let spaceless_map = map.replace(' ', '');
                    let map_btn = document.createElement("button");
                    map_btn.id = spaceless_map;
                    map_btn.className = "filter-btn"
                    let flair = "?"
                    $.getJSON("../maps.json", function(json) {
                        // import('../maps.json').then(module => {
                        if (Object.keys(json).indexOf(map) !== -1) {
                            flair = json[map]["flair"]
                            map_btn.innerHTML = map + " " + flair
                            document.getElementById("buttons").append(map_btn)

                            $(document).on('click', '#' + spaceless_map, function() {
                                document.getElementById(spaceless_map).style.background = "yellow"
                                document.getElementById("all").style.background = "#a9e7f9"
                                for (const y in maps) {
                                    let map2 = maps[y]
                                    let spaceless_map2 = map2.replace(' ', '');
                                    if (spaceless_map2 !== spaceless_map) {
                                        document.getElementById(spaceless_map2).style.background = "#a9e7f9"
                                    }
                                }
                                if (perfect)
                                    document.getElementById("Perfect").style.background = "#a9e7f9"

                                table.columns(1).search('^' + map + '$', true, false).draw();
                                table.columns(2).search("").draw();
                            });
                        }
                    });
                }
                if (perfect) {
                    let map_btn = document.createElement("button");
                    map_btn.id = "Perfect";
                    map_btn.className = "filter-btn"
                    map_btn.innerHTML = "Perfect 👑"
                    document.getElementById("buttons").append(map_btn);
                    $(document).on('click', '#' + "Perfect", function() {
                        document.getElementById("Perfect").style.background = "yellow"
                        document.getElementById("all").style.background = "#a9e7f9"
                        for (const y in maps) {
                            let map2 = maps[y]
                            let spaceless_map2 = map2.replace(' ', '');
                            document.getElementById(spaceless_map2).style.background = "#a9e7f9"
                        }
                        table.columns(1).search("").draw();
                        table.columns(2).search('^6600$', true, false).draw();
                    });
                }

            });
        }
    });
});
`
}


const log = (payload) => {
    const currentdate = new Date();
    const timestamp = currentdate.getDate().toString().padStart(2, "0") + "/" +
        (currentdate.getMonth() + 1).toString().padStart(2, "0") + "/" +
        currentdate.getFullYear() + " @ " +
        currentdate.getHours().toString().padStart(2, "0") + ":" +
        currentdate.getMinutes().toString().padStart(2, "0") + ":";
    if (fs.existsSync(logfile)) {
        fs.appendFile(logfile, "[" + timestamp + "] " + payload + "\n", function(err) {
            if (err) throw err;
            // console.log('Saved!');
        });
    }
};

const logMessage = (payload) => {
    const currentdate = new Date();
    const timestamp = currentdate.getDate().toString().padStart(2, "0") + "/" +
        (currentdate.getMonth() + 1).toString().padStart(2, "0") + "/" +
        currentdate.getFullYear() + " @ " +
        currentdate.getHours().toString().padStart(2, "0") + ":" +
        currentdate.getMinutes().toString().padStart(2, "0") + ":";
    if (fs.existsSync(messagefile)) {
        fs.appendFile(messagefile, "[" + timestamp + "] " + payload + "\n", function(err) {
            if (err) throw err;
            // console.log('Saved!');
        });
    }
};

const trunc = (decimal, n = 2) => {
    let x = decimal + ''; // string 
    return x.lastIndexOf('.') >= 0 ? parseFloat(x.substr(0, x.lastIndexOf('.') + (n + 1))) : decimal; // You can use indexOf() instead of lastIndexOf()
}

const logFeedback = (payload) => {
    const currentdate = new Date();
    const timestamp = currentdate.getDate().toString().padStart(2, "0") + "/" +
        (currentdate.getMonth() + 1).toString().padStart(2, "0") + "/" +
        currentdate.getFullYear() + " @ " +
        currentdate.getHours().toString().padStart(2, "0") + ":" +
        currentdate.getMinutes().toString().padStart(2, "0") + ":";
    if (fs.existsSync(feedbackfile)) {
        fs.appendFile(feedbackfile, "[" + timestamp + "] " + payload + "\n", function(err) {
            if (err) throw err;
            // console.log('Saved!');
        });
    }
};

const makeLink = (room, thisTarget) => {
    let part2 = "%2C+" + thisTarget['country'];
    if (thisTarget['country'] === "USA") part2 = "%2C+" + thisTarget['admin_name'];
    let wiki = "https://en.wikipedia.org/wiki/Special:Search?search=" + thisTarget['city'] + part2 + "&go=Go&ns0=1";
    //en.wikipedia.org/w/api.php?action=query&titles=Denver%2C+Colorado&prop=pageimages&format=json&pithumbsize=100
    if (thisTarget['wiki'] != null && thisTarget['wiki'] != "") wiki = thisTarget['wiki'];
    return wiki;
}

const filterName = (name) => {
    var badname = false;
    CONSTANTS.PROFANITY_REGEX.forEach((word) => {
        var re = new RegExp(word, "i");
        if (re.test(name)) badname = true;
    });
    return badname;
}

const flushGuesses = (map) => {
    try {

        function copy(x) {
            return JSON.parse(JSON.stringify(x, null, 2));
        }

        const tmpfile = '/scratch/guesses/' + map + '_guesses_staging';
        const file = '/scratch/guesses/' + map + '_guesses';
        if (!fs.existsSync(tmpfile)) {
            // logFeedback('Staging file ' + tmpfile + ' doesnt exist!!')
            fs.writeFile(tmpfile, "", {
                flag: 'wx'
            }, function(err) {
                if (err) throw err;
            });
            return
        } else {
            let history;
            try {
                history = JSON.parse(fs.readFileSync(tmpfile, 'utf8'));
            } catch (err) {
                history = {}
                const currentdate = new Date();
                const timestamp = currentdate.getHours() + "-" + currentdate.getMinutes() + currentdate.getSeconds();
                // logFeedback("Staging file " + file + " seems corrupted!!  Writing it to /scratch/corrupted" + timestamp)
                fs.writeFile("/scratch/corrupted" + timestamp, data, {
                    flag: 'w'
                }, function(err) {
                    if (err) throw err;
                });
            }
            for (var entry in history) {
                console.log("process " + entry)

                // var h1 = JSON.parse(fs.readFileSync(file, 'utf8'));
                // console.log("Before" + h1[entry]["lats"])

                try {
                    recordGuesses(map, entry, history[entry]["city"], history[entry]["admin"], history[entry]["country"], history[entry]["iso2"],
                        history[entry]["ips"], history[entry]["dists"], history[entry]["times"], history[entry]["lats"], history[entry]["lons"], history[entry]["true_lat"],
                        history[entry]["true_lon"], history[entry]["wiki"], false)
                } catch (err) {
                    console.log("Error copying " + entry)
                }

                // var h1 = JSON.parse(fs.readFileSync(file, 'utf8'));
                // console.log("Before" + h1[entry]["lats"])
            }

            console.log("Clearing the staging file for " + map)
            fs.writeFileSync(tmpfile, "", {
                flag: 'w'
            })
        }
    } catch (err) {
        logFeedback("Something seems messed up with moving staged guesses to full guesses!!!!")
    }
}

const recordGuesses = (map, citystring, city, admin, country, iso2, raw_ips, dists, times, lats, lons, true_lat, true_lon, link, staged) => {
    try {

        function copy(x) {
            return JSON.parse(JSON.stringify(x, null, 2));
        }

        let file;
        if (staged)
            file = '/scratch/guesses/' + map + '_guesses_staging';
        else
            file = '/scratch/guesses/' + map + '_guesses';
        const joefile = '/scratch/guesses/' + map + '_joe';

        // Ignore updates to same file if it happened less than 1 second ago, hack to prevent file corruption
        const currentdate = new Date();
        if ((map in lastUpdates) && (currentdate.getTime() - lastUpdates[map] < 2000)) {
            // logFeedback("Skipping update to " + map + " because we updated less than 1s ago!")
        } else if (!fs.existsSync(file)) {
            // logFeedback('File ' + file + ' doesnt exist!!')
            fs.writeFile(file, "", {
                flag: 'w'
            }, function(err) {
                if (err) throw err;
            });
        } else {
            lastUpdates[map] = currentdate.getTime();
            fs.readFile(file, 'utf8', (err, data) => {
                let history;
                try {
                    history = JSON.parse(data);
                } catch (err) {
                    history = {}
                    const currentdate = new Date();
                    const timestamp = currentdate.getHours() + "-" + currentdate.getMinutes() + currentdate.getSeconds();
                    // logFeedback("File " + file + " seems corrupted!!  Writing it to /scratch/corrupted" + timestamp)
                    fs.writeFile("/scratch/corrupted" + timestamp, data, {
                        flag: 'w'
                    }, function(err) {
                        if (err) throw err;
                    });
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
                    Object.values(raw_ips).forEach((ip) => {
                        ips.push(ip.replace("::ffff:", ""))
                    });

                    if (Object.keys(history).indexOf(citystring) === -1) {
                        history[citystring] = {
                            "dists": dists,
                            "times": times,
                            "ips": ips,
                            "lats": lats,
                            "lons": lons
                        };
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
                        fs.writeFile(joefile, "", {
                            flag: 'wx'
                        }, function(err) {
                            if (err) throw err;
                        });
                    } else {
                        let joehistory;
                        fs.readFile(joefile, 'utf8', (err, joedata) => {
                            try {
                                joehistory = JSON.parse(joedata);
                            } catch (err) {
                                joehistory = {}
                            }
                            joehistory[citystring] = {
                                "mean_time": mean_time,
                                "mean_lat": mean_lat,
                                "mean_lon": mean_lon
                            };
                            // Commit back to file
                            fs.writeFile(joefile, JSON.stringify(copy(joehistory), null, 2), function(err) {
                                if (err) {
                                    return console.log(err);
                                }
                            });
                        });
                    }
                } catch (err) {}
                // Commit back to file
                fs.writeFile(file, JSON.stringify(copy(history), null, 2), function(err) {
                    if (err) {
                        logFeedback("Error commiting new data back to file!")
                        return console.log(err);
                    }
                });

            });
        }
    } catch (err) {
        logFeedback("Something seems messed up with guess logging!!!!")
    }
};

const joeData = (map, citystring) => {
    try {
        const file = '/scratch/guesses/' + map + '_joe';
        history = JSON.parse(fs.readFileSync(file, 'utf8'));
        return [history[citystring]["mean_time"], history[citystring]["mean_lat"], history[citystring]["mean_lon"]];
    } catch (err) {
        return [10, 0, 0];
    }
};


const logPlayerHistory = (name, color, score, room) => {
    try {
        const filebase = '/scratch/histories/' + name.replace(/ /g, '_') + '_history';

        // Set html
        fs.writeFile(filebase + ".html", playerHistHtml(name.replace(/ /g, '_')), {
            flag: 'w'
        }, function(err) {
            if (err) throw err;
        });

        // Set js
        fs.writeFile(filebase + ".js", playerHistJs(name.replace(/ /g, '_')), {
            flag: 'w'
        }, function(err) {
            if (err) throw err;
        });

        if (!fs.existsSync(filebase + ".csv")) {
            // logFeedback('Creating history for ' + name)
            fs.writeFile(filebase + ".csv", "", {
                flag: 'wx'
            }, function(err) {
                if (err) throw err;
            });
        }
        const currentdate = new Date();
        const timestamp = currentdate.getFullYear() + "/" +
            (currentdate.getMonth() + 1).toString().padStart(2, "0") + "/" +
            currentdate.getDate().toString().padStart(2, "0") + " @ " +
            currentdate.getHours().toString().padStart(2, "0") + ":" +
            currentdate.getMinutes().toString().padStart(2, "0") + " GMT";
        fs.appendFile(filebase + ".csv", "\"" + timestamp + "\",\"" + room + "\",\"" + score + "\",\"<font color=" + color + ">" + name + "</font>\",,,,,,,,,,,,,,,,,,,,,,,,,,,,\n", function(err) {
            if (err) throw err;
        });
    } catch (err) {
        console.log("Something messed up trying to write history for " + name)
    }

};

const flairToEmoji = (flair) => {
    if (Object.keys(MAPS).indexOf(flair) !== -1)
        return MAPS[flair]["flair"]
    else
        return "?";
}

const perfectEmoji = () => {
    return '👑';
}

// Load hall of fame from json
const loadHallOfFame = () => {
    var famers = new Map();
    if (fs.existsSync('/scratch/hall_of_fame.json')) {
        try {
            famers = JSON.parse(fs.readFileSync('/scratch/hall_of_fame.json', 'utf8'));
        } catch (err) {
            console.log('Hall of fame json corrupted! (1)');
            fs.writeFileSync('/scratch/hall_of_fame.json', "{}", {
                flag: 'w'
            }, function(err) {
                if (err) throw err;
            });
        }
    } else {
        console.log('Hall of fame json corrupted! (2)');
        fs.writeFileSync('/scratch/hall_of_fame.json', "{}", {
            flag: 'w'
        }, function(err) {
            if (err) throw err;
        });
    }

    let entries = Object.entries(famers)

    // Regenerate hall of fame js and html files in case the code is updated
    for (const x in entries) {
        let name = entries[x][1]['name']
        if (name === undefined)
            continue
        let spaceless_name = name.replace(/ /g, '_')
        let html = famerHistHtml(spaceless_name, entries[x]['public_hash'])
        let js = famerHistJs(spaceless_name, entries[x]['public_hash'])
        const filebase = '/scratch/famers/' + spaceless_name;
        // Set html
        fs.writeFile(filebase + ".html", html, {
            flag: 'w'
        }, function(err) {
            if (err) throw err;
        });

        // Set js
        fs.writeFileSync(filebase + ".js", js, {
            flag: 'w'
        }, function(err) {
            if (err) throw err;
        });
    }

    return new Map(entries)
}

// Convert hall of fame json to board string
const hallJsonToBoard = (famers) => {
    var entries = new Array()
    var posted_names = new Array()
    var record_time = new Array()
    for (const [key, value] of famers.entries()) {
        if (!posted_names.includes(value['name'])) {
            let last_record = parseInt(value['last_record'])

            // Find any other private hashes with this name and get largest record_time and superset of maps
            let has_crown = value['perfect'] !== undefined && Object.entries(value['perfect']).length > 0;
            let flairs = []
            for (const [key2, value2] of famers.entries()) {
                if (value2['name'] == value['name']) {
                    for (const [x, map] of Object.entries(value2['maps'])) {
                        if (!flairs.includes(flairToEmoji(map)))
                            flairs.push(flairToEmoji(map))
                        if (parseInt(value2['last_record']) > last_record)
                            last_record = parseInt(value2['last_record'])
                    }
                    has_crown = has_crown || value2['perfect'] !== undefined && Object.entries(value2['perfect']).length > 0;

                }
            }

            flairs.sort();
            let flairs_str = flairs.join('');
            if (has_crown)
                flairs_str = perfectEmoji() + flairs_str;
            let link_name = value['name'] + " " + flairs_str;

            let link = "<a target=\"_blank\" href='resources/famers/" + value['name'].replace(/ /g, '_') + ".html'>" + link_name + "</a>"
            posted_names.push(value['name'])
            record_time.push(last_record)
            entries.push(link)
        }
    }

    entries = entries.sort(function(a, b) {
        let time_delta = record_time[entries.indexOf(b)] - record_time[entries.indexOf(a)]
        return time_delta;
    });

    return entries;
};

const formatPath = (hist, histcount, color, socketid, room, score) => {
    const width = 560;
    const height = 210;
    const playersHistory = new Map(JSON.parse(hist));
    let name = "Your";
    playersHistory.forEach((hist, player) => {
        if (socketid == player.id) {
            name = "<font color=\"" + player.color + "\">" + player.name + "</font>'s";
        }
    });

    const pointsToEmoji = (points) => {
        if (points < 60)
            return "❌";
        if (points < 120)
            return "⬛";
        if (points < 180)
            return "🟫";
        if (points < 240)
            return "🟥";
        if (points < 300)
            return "🟧"
        if (points < 360)
            return "🟨";
        if (points < 420)
            return "🟩"
        if (points < 480)
            return "🟦";
        if (points < 540)
            return "🟪";
        if (points < 600)
            return "⭐";
        if (points == 600)
            return "✅";
        return "?";
    };
    // var history = "<br><button id=\"sharepath" + histcount + "\">copy</button><br>" + "<div id=\"mypath" + histcount + "\"><br><tt>" + name + " path to " + score + " points";
    var history = "<br><div id=\"mypath" + histcount + "\"><br><tt>" + name + " path to " + score + " points on " + room + ":";
    let notified = false;
    playersHistory.forEach((hist, player) => {
        // For debugging, track all targets
        let targets = [];
        if (socketid == player.id) {
            var i = CONSTANTS.GAME_ROUNDS - Object.keys(hist).length + 1;
            Object.keys(hist).forEach((round) => {
                let datapoint = hist[round];
                let points_int = datapoint['round_points'];
                let points = points_int.toString().padEnd(3).replace(/\s/g, "&nbsp;")
                let time = datapoint['time'];
                time = time.toString().padEnd(3).replace(/\s/g, "&nbsp;")
                let error_unit = datapoint['error_unit']
                let dist = datapoint['dist'];
                dist = dist.toString().padEnd(5).replace(/\s/g, "&nbsp;")
                let target = Geography.stringifyTarget(datapoint['target'], room).string.replace(/\s/g, "&nbsp");

                // For debugging, check if this is a collision and send me a push
                if (targets.includes(target) && !notified) {
                    console.log("FOUND COLLISION IN THIS GAME! " + room);
                    logFeedback("FOUND COLLISION IN THIS GAME! " + room);
                    notified = true;
                }
                targets.push(target)

                let iso2 = datapoint['target']['iso2'];
                if (iso2 == "" || iso2 == null)
                    iso2 = "earth";
                iso2 = iso2.toLowerCase();
                let image = "<img alt=\":flag_" + iso2 + ":\" height=16 src=\"https://geoscents.net/resources/flags/" + iso2 + ".png\" />";
                history = history + "<br>" + pointsToEmoji(points_int) + " Round " + i.toString().padEnd(2).replace(/\s/g, "&nbsp;") + ": " + points + "pts [" + dist + error_unit + ", " + time + "s]  " + image + " " + target;
                i = i + 1;
            });
        }
    });


    history = history + "</tt><br></div>"
    return history;
}

// Javascript sucks
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function insertHallOfFame(hash, public_hash, player_name, map, path, score, color, delay) {
    // hack....
    await sleep(delay);
    let famers = await loadHallOfFame()
    const currentdate = new Date();
    const timestamp = currentdate.getFullYear() + "/" +
        (currentdate.getMonth() + 1).toString().padStart(2, "0") + "/" +
        currentdate.getDate().toString().padStart(2, "0") + " @ " +
        currentdate.getHours().toString().padStart(2, "0") + ":" +
        currentdate.getMinutes().toString().padStart(2, "0") + " GMT";
    var unixtime = Math.round(currentdate.getTime() / 1000);
    let perfect_limit = CONSTANTS.PERFECT_SCORE;
    if (CONSTANTS.DEBUG_MODE)
        perfect_limit = CONSTANTS.DEBUG_PERFECT_SCORE;
    var perfect = score >= perfect_limit

    // Update hall of fame summary
    if (famers.has(hash)) {
        let old = famers.get(hash);
        let prev_famed = Array.from(old['maps'].values());
        if (!prev_famed.includes(map)) {
            old['maps'].push(map)
        }
        old['last_record'] = unixtime
        if (perfect) {
            let prev_perfect = Array.from(old['perfect'].values());
            if (!prev_perfect.includes(map)) {
                old['perfect'].push(map)
            }
        }
        famers.set(hash, old)
    } else {
        let dict = {
            'name': player_name,
            'maps': [map],
            'perfect': [],
            'last_record': unixtime,
            'public_hash': public_hash
        }
        if (perfect)
            dict['perfect'] = [map];
        famers.set(hash, dict)
    }

    function copy(x) {
        return JSON.parse(JSON.stringify(x, null, 2));
    }

    fs.writeFileSync('/scratch/hall_of_fame.json', JSON.stringify(copy(Object.fromEntries(famers)), null, 2), function(err) {
        if (err) {
            logFeedback("Error commiting new hall of fame to file!")
            return console.log(err);
        }
    });

    // Update specific famer file
    try {
        let spaceless_name = player_name.replace(/ /g, '_')
        const filebase = '/scratch/famers/' + spaceless_name;

        // Set html
        fs.writeFileSync(filebase + ".html", famerHistHtml(spaceless_name, public_hash), {
            flag: 'w'
        }, function(err) {
            if (err) throw err;
        });

        // Set js
        fs.writeFile(filebase + ".js", famerHistJs(spaceless_name, public_hash), {
            flag: 'w'
        }, function(err) {
            if (err) throw err;
        });

        if (!fs.existsSync(filebase + ".csv")) {
            // logFeedback('Creating history for ' + player_name)
            fs.writeFileSync(filebase + ".csv", "", {
                flag: 'wx'
            }, function(err) {
                if (err) throw err;
            });
        }

        fs.appendFile(filebase + ".csv", "\"" + timestamp + "\",\"" + map + "\",\"" + score + "\",\"" + path + "\",\"<font color=" + color + ">" + player_name + "</font>\",\"" + public_hash + "\",,,,,,,,,,,,,,,,,,,,,,,,,,,\n", function(err) {
            if (err) throw err;
        });
    } catch (err) {
        console.log("Something messed up trying to write hall of fame path for " + player_name)
    }

    return famers;

};

const randstring = (length) => {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


module.exports = {
    log,
    logFeedback,
    logMessage,
    logPlayerHistory,
    recordGuesses,
    flushGuesses,
    hallJsonToBoard,
    loadHallOfFame,
    insertHallOfFame,
    makeLink,
    joeData,
    flairToEmoji,
    perfectEmoji,
    formatPath,
    filterName,
    randstring,
    sleep
};