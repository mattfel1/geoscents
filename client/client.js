/**
 * Top level file for handling rendering and interactions on the client side.
 * // TODO: Split this into multiple classes for handling chat, game history, map, and panel separately
 */

const socket = io();
const Scoreboard = require('./scoreboard.js');
const Commands = require('./commands.js');
const Sounds = require('./sounds.js');
const Popup = require('./popup.js');
const CustomPopup = require('./custompopup.js');
const FamerPopup = require('./famerpopup.js');
const HelpPopup = require('./helppopup.js');
const Chat = require('./chat.js');
const MapPanel = require('./map.js');
const History = require('./history.js');
const CONSTANTS = require('../resources/constants.js');
const MAPS          = require('../resources/maps.json')
const MAP_COUNTRIES = require('../resources/map-countries.json')

var myMap = CONSTANTS.LOBBY;
var myCitysrc = CONSTANTS.LOBBY;
var myRoomName = CONSTANTS.LOBBY;
let canvas;
let panel;
let isFirefox;

// Build login popup
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('map');
    panel = document.getElementById('panel');
    isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; // hack for scaling

    const selectStatus = document.getElementById("selected_color");

    CONSTANTS.COLORS.forEach(function(value) {
        const entry = document.createElement("option");
        entry.value = value;
        entry.style = "color:" + value
        entry.text = '█ '
        selectStatus.appendChild(entry);
    })

    selectStatus.addEventListener('change', changeColor);

    function changeColor() {
        const optionSelected = selectStatus.selectedIndex;
        let color = selectStatus.options[optionSelected].value;
        if (color == "random")
            color = "black"
        selectStatus.style.color = color;
    }
});


var lastScale = 999;
var was_autoscaled = localStorage.getItem("autoscaled");
if (was_autoscaled === "false") was_autoscaled = false
else was_autoscaled = true
var autoscale = was_autoscaled;

var betweenGames = true;
var clickedReady = false;
var booted = false;
var studyPoints = [];
var wasInPoint = false;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Init zoom
document.documentElement.style.zoom = 1;

// Update index with all countries in special list
let dropdown = window.document.getElementById('requestedCitysrc')
let continent_options = [];
let region_options = [];
let country_options = [];
// Add main maps first, then specific maps
Object.keys(MAPS).forEach(function(value) {
    var entry = document.createElement("option");
    entry.value = value;
    if (MAPS[value]['tier'] === 'continent') {
        entry.text = value
        continent_options.push(entry)
    }
})
Object.keys(MAPS).forEach(function(value) {
    var entry = document.createElement("option");
    entry.value = value;
    if (MAPS[value]['tier'] === 'region') {
        entry.text = value
        region_options.push(entry)
    }
})
Object.keys(MAPS).forEach(function(value) {
    var entry = document.createElement("option");
    entry.value = value;
    if (MAPS[value]['tier'] === 'country') {
        entry.text = value
        country_options.push(entry)
    }
})

continent_options.sort((a, b) => {
    return a.text.localeCompare(b.text)
});
region_options.sort((a, b) => {
    return a.text.localeCompare(b.text)
});
country_options.sort((a, b) => {
    return a.text.localeCompare(b.text)
});


var continent_sep = document.createElement("option");
continent_sep.text = "--- Continents ---"
continent_sep.setAttribute('readonly', true);
continent_sep.value = " "
dropdown.appendChild(continent_sep);

continent_options.forEach((x, i) => {
    dropdown.appendChild(x);
})

var region_sep = document.createElement("option");
region_sep.text = "--- Regions ---"
region_sep.setAttribute('readonly', true);
region_sep.value = " "
dropdown.appendChild(region_sep);

region_options.forEach((x, i) => {
    dropdown.appendChild(x);
})

var country_sep = document.createElement("option");
country_sep.text = "--- Countries ---"
country_sep.setAttribute('readonly', true);
country_sep.value = " "
dropdown.appendChild(country_sep);

country_options.forEach((x, i) => {
    dropdown.appendChild(x);
})



const playerClick = {
    clickEvent: false,
    mouseDown: false,
    touchDown: false,
    downCount: 0,
    cursorX: 0,
    cursorY: 0
};

$(document).ready(function() {
    // ---------------------------------------------------------------------------
    // Custom autocomplete for the map search box
    // Matches both map names and the country names contained in each map.
    // ---------------------------------------------------------------------------
    const citysrcInput       = document.getElementById('requestedCitysrc_choice');
    const citysrcSuggestions = document.getElementById('citysrc-suggestions');

    if (citysrcInput && citysrcSuggestions) {
        // Preserve tier info for show-all grouping
        const allMaps = [
            { name: 'Random', tier: 'special', flair: '' },
            ...continent_options.map(o => ({ name: o.value, tier: 'continent', flair: (MAPS[o.value] && MAPS[o.value].flair) || '' })),
            ...region_options.map(o => ({ name: o.value, tier: 'region', flair: (MAPS[o.value] && MAPS[o.value].flair) || '' })),
            ...country_options.map(o => ({ name: o.value, tier: 'country', flair: (MAPS[o.value] && MAPS[o.value].flair) || '' })),
        ];
        const TIER_LABELS = { special: 'Special', continent: 'Continents', region: 'Regions', country: 'Countries' };

        let activeIndex = -1;

        function appendSuggestionItem(m, q) {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = (m.flair ? m.flair + ' ' : '') + m.name;
            // Show matched country as a hint when the query matched a country, not the name
            if (q && !m.name.toLowerCase().includes(q)) {
                const countries = MAP_COUNTRIES[m.name] || [];
                const hit = countries.find(c => c.toLowerCase().includes(q));
                if (hit) {
                    const hint = document.createElement('span');
                    hint.className = 'suggestion-hint';
                    hint.textContent = ' \u2014 contains ' + hit;
                    item.appendChild(hint);
                }
            }
            item.addEventListener('mousedown', function(e) {
                e.preventDefault();
                citysrcInput.value = m.name;
                citysrcSuggestions.style.display = 'none';
            });
            citysrcSuggestions.appendChild(item);
        }

        function showSuggestions(query, forceAll) {
            citysrcSuggestions.innerHTML = '';
            activeIndex = -1;

            const q = query.trim().toLowerCase();
            if (!forceAll && !q) { citysrcSuggestions.style.display = 'none'; return; }

            function renderGroup(items) {
                let lastTier = null;
                items.forEach(m => {
                    if (m.tier !== lastTier) {
                        const sep = document.createElement('div');
                        sep.className = 'suggestion-sep';
                        sep.textContent = TIER_LABELS[m.tier] || m.tier;
                        citysrcSuggestions.appendChild(sep);
                        lastTier = m.tier;
                    }
                    appendSuggestionItem(m, q);
                });
            }

            if (forceAll) {
                renderGroup(allMaps);
                if (citysrcSuggestions.children.length)
                    citysrcSuggestions.style.display = 'block';
                return;
            }

            // Search mode: direct name matches first, then country-contains matches
            const directMatches = allMaps.filter(m => m.name.toLowerCase().includes(q));
            const containsMatches = allMaps.filter(m => {
                if (m.name.toLowerCase().includes(q)) return false;
                const countries = MAP_COUNTRIES[m.name];
                return countries && countries.some(c => c.toLowerCase().includes(q));
            });

            if (!directMatches.length && !containsMatches.length) {
                citysrcSuggestions.style.display = 'none'; return;
            }

            renderGroup(directMatches);

            if (containsMatches.length) {
                const sep = document.createElement('div');
                sep.className = 'suggestion-sep';
                sep.textContent = '\u2014 contains \u201c' + query.trim() + '\u201d';
                citysrcSuggestions.appendChild(sep);
                renderGroup(containsMatches);
            }

            citysrcSuggestions.style.display = 'block';
        }

        citysrcInput.addEventListener('input', function() {
            showSuggestions(this.value, false);
        });

        citysrcInput.addEventListener('focus', function() {
            if (this.value.trim()) showSuggestions(this.value, false);
        });

        citysrcInput.addEventListener('blur', function() {
            citysrcSuggestions.style.display = 'none';
        });

        citysrcInput.addEventListener('keydown', function(e) {
            const items = citysrcSuggestions.querySelectorAll('.suggestion-item');
            if (!items.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, items.length - 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, 0);
            } else if (e.key === 'Enter' && activeIndex >= 0) {
                e.preventDefault();
                citysrcInput.value = items[activeIndex].textContent.split(' \u2014 ')[0].trim();
                citysrcSuggestions.style.display = 'none';
                return;
            } else if (e.key === 'Escape') {
                citysrcSuggestions.style.display = 'none';
                return;
            }
            items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
            if (activeIndex >= 0) items[activeIndex].scrollIntoView({ block: 'nearest' });
        });

        const showAllBtn = document.getElementById('citysrc-show-all');
        if (showAllBtn) {
            showAllBtn.addEventListener('mousedown', function(e) {
                e.preventDefault(); // keep focus on input
                if (citysrcSuggestions.style.display === 'block') {
                    citysrcSuggestions.style.display = 'none';
                } else {
                    showSuggestions('', true);
                    citysrcInput.focus();
                }
            });
        }
    }

    // Player connects
    socket.emit('newPlayer');

    /**** POPUP *****/
    // Make player choose name
    const popup = new Popup(socket);
    popup.showPopup();

    document.getElementById('ready-btn').addEventListener('click', () => {
        if (myMap !== CONSTANTS.LOBBY && betweenGames && !clickedReady) {
            socket.emit('playerReady');
            commands.drawCommand(" seconds until new game auto-starts...", "", "", "", 0, true, true, false);
            clickedReady = true;
        }
    });

    /**** Scoreboard *****/
    const scoreboard = new Scoreboard(socket);
    socket.on('clear scores', () => {
        scoreboard.clearScores()
    });
    socket.on('post score', (rank, name, color, score, wins) => {
        scoreboard.postScore(rank, name, color, score, wins)
    });
    socket.on('post group', (category, dict) => {
        scoreboard.postGroup(category, dict)
    });
    socket.on('post score title', (citysrc) => {
        scoreboard.postScoreTitle(citysrc)
    });
    socket.on('post space', () => {
        scoreboard.postSpace()
    });
    socket.on('post lobby', (board) => {
        scoreboard.postLobby(board)
    });
    socket.on('announce record', (category, room, name, score, color) => {
        socket.emit("announcement", '[New ' + category + ' record set by <font color="' + color + '">' + name + ' (' + score + ')</font> in ' + room + ']<br>')
    });
    socket.on('announce hall', (room, name, score, color) => {
        // TODO can this be called by client to cheat into hall of fame?
        let perfect_limit = CONSTANTS.PERFECT_SCORE;
        if (CONSTANTS.DEBUG_MODE)
            perfect_limit = CONSTANTS.DEBUG_PERFECT_SCORE;
        var perfect_thresh = score >= perfect_limit
        var perfect = ''
        if (perfect_thresh)
            perfect = 'PERFECT SCORE!!!! '
        socket.emit("announcement", '<b>WOW!! ' + perfect + '<font color="' + color + '">' + name + '</font> made it into the hall of fame with ' + score + ' points in ' + room + '!!!</b><br>')
    });
    socket.on('announce clown', (room, name, score, color) => {
        socket.emit("announcement", '<font color="' + color + '">' + name + '</font> guessed every round and still scored fewer than ' + CONSTANTS.CLOWNSCORE + ' points in ' + room + '! 🤡🤡🤡</b><br>')
    });

    /**** Commands *****/
    const sounds = new Sounds(socket);

    const commands = new Commands(socket);
    socket.on('update counts', (newdict) => {
        if (!booted) {
            commands.updateCounts(newdict);
            commands.postButtons();
        }
    })
    socket.on('draw buttons', () => {
        commands.postButtons()
    });
    socket.on('update joe button', (hasJoe) => {
        commands.hasJoe = hasJoe;
        commands.postButtons()
    });
    socket.on('draw timer', (time, color) => {
        commands.postTime(time, color)
    });
    socket.on('draw prepare', (map, round) => {
        betweenGames = true;
        commands.drawCommand(" seconds until new " + map + " game auto-starts...", "", "", "", round, true, false, false)
    });
    socket.on('draw begin', (map, time, round, allgrind) => {
        betweenGames = false;
        clickedReady = false;
        commands.drawCommand(" seconds until first round of " + map + "..  GET READY!", "", "", "", round, false, false, false);
        if (time === CONSTANTS.BEGIN_GAME_DURATION && !allgrind) sounds.playGameBeginSound();
        else if (time === CONSTANTS.BEGIN_GAME_DURATION_GRIND && allgrind) sounds.playGrindGameBeginSound();
    });
    socket.on('draw guess city', (city, capital, iso2, round) => {
        commands.drawCommand("Find!       ", city, capital, iso2, round, false, false, true);
        sounds.playRoundBeginSound();
    });
    socket.on('draw study city', (target, city, capital, iso2, row, col) => {
        let boxSize = 20;
        let point = {
            y: row - boxSize / 2,
            x: col - boxSize / 2,
            width: boxSize,
            height: boxSize
        };
        let studyPoint = {
            "target": target,
            "city": city,
            "capital": capital,
            "iso2": iso2,
            "box": point
        }
        studyPoints.push(studyPoint);
    })
    socket.on('draw reveal city', (city, capital, iso2, round) => {
        commands.drawCommand("            ", city, capital, iso2, round, false, false, true);
        sounds.playRoundEndSound();
    });
    socket.on('draw booted', () => {
        commands.drawCommand("You have been booted due to inactivity!", "Please refresh to rejoin", "", "", 0, false, false, false)
        booted = true;
    });
    socket.on('draw idle', () => {
        commands.drawCommand("Waiting for players to join...", "", "", "", 0, false, false, false)
    });
    setInterval(() => {
        // Keep track of bot toggle rate.  No more than 6 toggles every 5s
        // Handled on the client side, even though technically someone can get around this
        const currentdate = new Date();
        const unix = currentdate.getTime();
        const droptime = unix - 1000 * CONSTANTS.SPAMPERIOD;
        var filtered = commands.bottracker.filter(function(value, index, arr) {
            return value > droptime;
        })
        commands.bottracker = filtered
    }, 1000 / 5);

    /**** Chat *****/
    const chat = new Chat(socket);
    chat.listen();

    socket.on("mute player", function(id) {
        sounds.muteMe(id);
        commands.muted = sounds.muted;
    });
    socket.on("autoscale", function(id) {
        if (socket.id == id) {
            commands.autoscale = !commands.autoscale;
            autoscale = commands.autoscale;
            commands.setAutoscale(id)
            lastScale = 1;
            document.documentElement.style.zoom = 1;
            document.documentElement.style.MozTransform = "scale(1)";
            document.documentElement.style.MozTransformOrigin = "0 0";
        }
    });
    socket.on("grind", function(id) {
        if (socket.id == id) {
            commands.grind = !commands.grind;
            commands.setGrind(id);
        }
    });
    /**** HELP POPUP *****/
    // Make player choose options
    const helppopup = new HelpPopup(socket);
    helppopup.hide();
    socket.on('request help popup', () => {
        helppopup.showPopup()
    });

    /**** CUSTOM POPUP *****/
    const custompopup = new CustomPopup(socket);
    custompopup.hide();
    socket.on('request private popup', () => {
        custompopup.showPopup(myRoomName, myCitysrc);
    });
    socket.on('update public rooms', (rooms) => {
        custompopup.updatePublicRooms(rooms);
        // Keep the count in sync so postButtons() always sees the current value
        commands.counts['_publicRooms'] = rooms.length;
        // Refresh label if in a public room (label may have just arrived)
        if (commands.isPublic && commands.publicRoomId) {
            const roomInfo = rooms.find(r => r.roomId === commands.publicRoomId);
            if (roomInfo) commands.labelPublic(commands.publicCitysrc, commands.publicRoomId, roomInfo.roomLabel);
        }
        commands.postButtons();
    });
    socket.on('request browse public', () => {
        custompopup.showPopup('', ''); // neutral mode — Create Public Room / browse list
    });

    /**** FAMER POPUP *****/
    const famerpopup = new FamerPopup(socket);
    famerpopup.hide();
    socket.on('request famer popup', (name, color, logger, hash, public_hash, famer_emojis, grind, perfects, clown, cb) => {
        // Update index with all flairs
        // TODO: This should probably be handled on the server side so it can't be edited by user
        let dropdown = window.document.getElementById('requestedFlair')
        let options = [];
        for (const [key, value] of Object.entries(famer_emojis)) {
            var entry = document.createElement("option");
            const perfect = perfects.includes(key);
            var crown = '';
            if (perfect)
                crown = '👑';
            entry.value = value;
            entry.text = value + crown + key;
            options.push(entry)
        }
        options.forEach((x, i) => {
            dropdown.append(x);
        })

        window.document.getElementById('selected_famer_name').append(name)
        window.document.getElementById('selected_famer_name').style.color = color

        famerpopup.showPopup(name, color, logger, hash, public_hash, grind, perfects, clown)
    });

    /**** Map *****/
    const map = new MapPanel(socket);
    socket.on('draw point', (coords, color, radius) => {
        map.drawPoint(coords, color, radius)
    });
    socket.on('draw dist', (coords, color, distance) => {
        map.drawDist(coords, color, distance)
    });
    socket.on('draw answer', (coords) => {
        map.drawStar(coords)
    });
    // socket.on('draw answer', (coords) => {map.drawPoint(coords, "white", CONSTANTS.BUBBLE_RADIUS*2)});
    socket.on('draw photo', (coords, link) => {
        map.drawPhoto(coords, link)
    });
    socket.on('fresh map', (room) => map.drawMap(room));
    socket.on('blank map', (room) => map.drawBlank(room));
    socket.on('animate', () => {
        map.drawAnimation();
    });
    socket.on("render map", function(id, style, room) {
        map.setStyle(id, style, room);
        commands.setStyle(id, style);
    });
    socket.on("shift hue", function(id, shift, room) {
        map.setHueShift(id, shift, room);
        commands.setHueShift(id, shift);
    });

    /**** History *****/
    const history = new History(socket);
    socket.on('break history', (room, winner, score, color, record) => {
        history.breakHistory(room, winner, score, color, record)
    });
    socket.on('draw chart', (hist, gameId, winner, color, room, max) => {
        history.drawChart(hist, gameId, winner, color, room, max)
    });
    socket.on('draw path', (h, gameId) => {
        history.drawPath(h, gameId)
    });
    socket.on('add history', (room, payload) => {
        history.addHistory(room, payload)
    });

    /***** Player interactions *****/
    socket.on('request boot', function(id) {
        socket.emit('bootPlayer', id)
    });
    socket.on('moved to', (mapName, roomName, roomCitysrc, roomState) => {
        myMap = mapName;
        map.myMap = mapName;
        chat.myMap = mapName;
        scoreboard.myMap = mapName;
        commands.myMap = mapName;
        history.myMap = mapName;
        sounds.myMap = mapName;
        myRoomName = roomName;
        map.myRoomName = roomName;
        chat.myRoomName = roomName;
        scoreboard.myRoomName = roomName;
        commands.myRoomName = roomName;
        history.myRoomName = roomName;
        sounds.myRoomName = roomName;
        custompopup.activeRoomName = roomName;
        myCitysrc = roomCitysrc
        map.myCitysrc = myCitysrc;
        chat.myCitysrc = myCitysrc;
        scoreboard.myCitysrc = myCitysrc;
        commands.myCitysrc = myCitysrc;
        history.myCitysrc = myCitysrc;
        sounds.myCitysrc = myCitysrc;
        clickedReady = false;
        if (roomName.startsWith('private')) commands.labelPrivate(myCitysrc, custompopup.code);
        else if (roomName.startsWith('public')) {
            const roomInfo = custompopup.publicRooms.find(r => r.roomId === roomName);
            commands.labelPublic(myCitysrc, roomName, roomInfo ? roomInfo.roomLabel : '');
        } else commands.clearPrivate();
        commands.postButtons()
        studyPoints = []
        betweenGames = roomState === CONSTANTS.PREPARE_GAME_STATE;
        if (mapName === CONSTANTS.LOBBY) {
            document.getElementById('timer').style.display = 'none';
            document.getElementById('ready-btn').style.display = 'none';
            ['cmd-time', 'cmd-city', 'cmd-capital', 'cmd-round'].forEach(id => {
                document.getElementById(id).textContent = '';
            });
            document.getElementById('cmd-flag').style.visibility = 'hidden';
        }
    });
    socket.on("clear study points", () => {
        studyPoints = []
    })
    setInterval(() => {
        if (playerClick.touchDown) playerClick.downCount = playerClick.downCount + 1;
        if (playerClick.clickEvent) {
            socket.emit('playerClick', playerClick);
            playerClick.clickEvent = false;
        }
        if (chat.hasNewMessage) document.title = "(*) GeoScents"
    }, 1000 / CONSTANTS.FPS);

    setInterval(() => {
        // Set zoom for resolution
        const scale = Math.floor(50 * Math.max(0.5, Math.min(1, window.innerWidth / 1920))) / 50;
        if (scale != lastScale && autoscale) {
            lastScale = scale;
            document.documentElement.style.zoom = scale;
            document.documentElement.style.MozTransform = "scale(" + scale + ")";
            document.documentElement.style.MozTransformOrigin = "0 0";
        }
    }, 1000 / 5);

    const mouseUpHandler = (e) => {
        playerClick.mouseDown = false
        playerClick.downCount = 0;
        playerClick.touchDown = false;
        playerClick.clickEvent = false;
    };
    const mouseDownHandler = (evt) => {
        playerClick.mouseDown = true
        playerClick.clickEvent = true;

        const mousePos = getMousePosInPanel(canvas, evt);
        // var rect = canvas.getBoundingClientRect();
        playerClick.cursorX = mousePos.x //e.clientX - rect.left
        playerClick.cursorY = mousePos.y //e.clientY - rect.top
    };
    const touchUpHandler = (e) => {
        playerClick.clickEvent = true;
        socket.emit('playerClick', playerClick);
        playerClick.downCount = 0;
        playerClick.mouseDown = false;
        playerClick.touchDown = false;
    };
    const touchDownHandler = (evt) => {
        playerClick.touchDown = true;
        playerClick.mouseDown = true;
        const mousePos = getTouchPosInPanel(canvas, evt);
        // var rect = canvas.getBoundingClientRect();
        playerClick.cursorX = mousePos.x //e.touches[0].clientX - rect.left
        playerClick.cursorY = mousePos.y //e.touches[0].clientY - rect.top
    };
    document.addEventListener('mousedown', mouseDownHandler, false);
    document.addEventListener('mouseup', mouseUpHandler, false);
    document.addEventListener("touchstart", touchDownHandler, false);
    document.addEventListener("touchend", touchUpHandler, false);
    canvas.addEventListener('click', function(evt) {
        var mousePos = getMousePosInPanel(canvas, evt);
        Object.values(map.clickable_buttons).forEach(function(btn) {
            if (isInside(mousePos, btn) && myMap === CONSTANTS.LOBBY && !popup.isShowing && !booted) {
                if (btn.label.trim() != "?") {
                    window.open(btn.link, '_blank');
                } else {
                    socket.emit('requestHelpPopup');
                }
            }
        })
        studyPoints.forEach(function(point) {
            if (isInside(mousePos, point["box"])) {
                // Copied from helpers.js makeLink, because I'm not sure I can import that file here...
                let thisTarget = point["target"]
                let part2 = "%2C+" + thisTarget['country'];
                if (thisTarget['country'] === "USA") part2 = "%2C+" + thisTarget['admin_name'];
                let wiki = "https://en.wikipedia.org/wiki/Special:Search?search=" + thisTarget['city'] + part2 + "&go=Go&ns0=1";
                //en.wikipedia.org/w/api.php?action=query&titles=Denver%2C+Colorado&prop=pageimages&format=json&pithumbsize=100
                if (thisTarget['wiki'] != null && thisTarget['wiki'] != "") wiki = thisTarget['wiki'];
                window.open(wiki, '_blank');
            }
        })
        if (!(typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) {
            var x = window.scrollX,
                y = window.scrollY;
            $("#msg_text").focus();
            window.scrollTo(x, y);
        }
    }, false);
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePosInPanel(canvas, evt);
        if (myMap === CONSTANTS.LOBBY) {
            Object.values(map.clickable_buttons).forEach(function(btn) {
                if (isInside(mousePos, btn) && myMap === CONSTANTS.LOBBY && !popup.isShowing && !booted) {
                    map.highlightButton(btn);
                } else if (!booted) map.showButton(btn);
            })
        } else {
            if (betweenGames) {
                let inPoint = false;
                studyPoints.forEach(function(point) {
                    if (isInside(mousePos, point["box"])) {
                        inPoint = true;
                        if (!wasInPoint) {
                            commands.drawStudy("            ", point["city"], point["capital"], point["iso2"]);
                            socket.emit('requestTargetPhoto', point["target"]);
                            $('#map').css('cursor', 'pointer')
                        }
                    }
                })
                if (!inPoint && wasInPoint) {
                    $('#map').css('cursor', 'auto')
                    socket.emit('redrawStudy')
                }
                wasInPoint = inPoint;
            }
        }
    }, false);

    //Function to get the mouse position
    function getMousePosInPanel(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        let xPos;
        let yPos;
        if (isFirefox) {
            xPos = 1 / document.documentElement.style.zoom * (event.clientX - rect.left);
            yPos = 1 / document.documentElement.style.zoom * (event.clientY - rect.top);
        } else {
            xPos = (event.clientX - rect.left) / document.documentElement.style.zoom;
            yPos = (event.clientY - rect.top) / document.documentElement.style.zoom;
        }
        return {
            x: xPos,
            y: yPos
        };
    }

    function getTouchPosInPanel(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        let xPos;
        let yPos;
        if (isFirefox) {
            xPos = 1 / document.documentElement.style.zoom * (event.touches[0].clientX - rect.left);
            yPos = 1 / document.documentElement.style.zoom * (event.touches[0].clientY - rect.top);
        } else {
            xPos = (event.touches[0].clientX - rect.left) / document.documentElement.style.zoom;
            yPos = (event.touches[0].clientY - rect.top) / document.documentElement.style.zoom;
        }
        return {
            x: xPos,
            y: yPos
        };
    }
    //Function to check whether a point is inside a rectangle
    function isInside(pos, rect) {
        return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
    }
});