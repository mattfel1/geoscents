const CONSTANTS = require('../resources/constants.js');

class Commands {
    constructor(socket, animated = true) {
        this.socket = socket
        this.hasJoe = false;
        this.panel = window.document.getElementById('panel');
        this.canvas = window.document.getElementById('map');
        this.ctx = this.canvas.getContext('2d');
        this.myRoomName = CONSTANTS.LOBBY;
        this.isPrivate = false;
        this.privateCitysrc;
        this.privateCode;
        this.counts = {
            [CONSTANTS.LOBBY]: 0,
            [CONSTANTS.WORLD]: 0,
            [CONSTANTS.SPECIAL_CAPITAL]: 0,
            [CONSTANTS.EUROPE]: 0,
            [CONSTANTS.NAMERICA]: 0,
            [CONSTANTS.AFRICA]: 0,
            [CONSTANTS.ASIA]: 0,
            [CONSTANTS.OCEANIA]: 0,
            [CONSTANTS.SAMERICA]: 0,
            [CONSTANTS.TRIVIA]: 0,
            [CONSTANTS.SPECIAL_REGION]: 0
        }
        this.mapStyle = 'terrain';
        this.lastCommand = {
            'timeDescrip': '',
            'citystring': '',
            'capital': false,
            'iso2': '',
            'round': 0,
            'button': false,
            'clicked': false
        };
        this.lastTime = {
            'time': 10,
            'color': 'white'
        };
        var was_muted = localStorage.getItem("muted");
        if (was_muted === null || was_muted === "false") was_muted = false
        else was_muted = true
        this.muted = was_muted;

        var was_autoscaled = localStorage.getItem("autoscaled");
        if (was_autoscaled === "false") was_autoscaled = false
        else was_autoscaled = true
        this.autoscale = was_autoscaled;

        var was_grind = localStorage.getItem("grind");
        if (was_grind === "true") was_grind = true
        else was_grind = false
        this.grind = was_grind;

        this.animated = animated;

        this.bottracker = [];

        var old_hue = localStorage.getItem("hue");
        if (old_hue === null) old_hue = 0
        this.hueShift = old_hue;
        this.isBotSpamming();
    }

    drawLastCommand() {
        if (this.myRoomName !== CONSTANTS.LOBBY) {
            this.drawCommand(this.lastCommand['timeDescrip'], this.lastCommand['citystring'], this.lastCommand['capital'], this.lastCommand['iso2'], this.lastCommand['round'], this.lastCommand['button'], this.lastCommand['clicked'], this.lastCommand['is_target']);
            this.postTime(this.lastTime['time'], this.lastTime['color']);
        }
    }
    drawCommand(timeDescrip, citystring, capital, iso2_raw, round, button, clicked, is_target) {
        let iso2 = (iso2_raw === "" || iso2_raw == null) ? "earth" : iso2_raw;

        this.lastCommand = {
            'timeDescrip': timeDescrip,
            'citystring': citystring,
            'capital': capital,
            'iso2': iso2,
            'round': round,
            'button': button,
            'clicked': clicked,
            'is_target': is_target
        };

        document.getElementById('cmd-time').textContent = timeDescrip;
        document.getElementById('cmd-city').textContent = citystring;
        document.getElementById('cmd-capital').textContent = capital || '';
        document.getElementById('cmd-round').textContent = 'Round ' + (round + 1) + '/' + CONSTANTS.GAME_ROUNDS;

        const flagEl = document.getElementById('cmd-flag');
        if (is_target && iso2 && iso2 !== 'earth') {
            flagEl.src = '/resources/flags/' + iso2.toLowerCase() + '.png';
            flagEl.style.visibility = '';
        } else {
            flagEl.style.visibility = 'hidden';
        }

        if (button) this.showReadyButton(clicked);
        else document.getElementById('ready-btn').style.display = 'none';
    }

    drawStudy(timeDescrip, citystring, capital, iso2_raw) {
        let iso2 = (iso2_raw === "" || iso2_raw == null) ? "earth" : iso2_raw;

        document.getElementById('cmd-time').textContent = timeDescrip;
        document.getElementById('cmd-city').textContent = citystring;
        document.getElementById('cmd-capital').textContent = capital || '';

        const flagEl = document.getElementById('cmd-flag');
        if (iso2 && iso2 !== 'earth') {
            flagEl.src = '/resources/flags/' + iso2.toLowerCase() + '.png';
            flagEl.style.visibility = '';
        } else {
            flagEl.style.visibility = 'hidden';
        }
    }


    updateCounts(newdict) {
        this.counts = newdict;
    }

    showReadyButton(clicked) {
        const btn = document.getElementById('ready-btn');
        btn.style.display = 'block';
        if (clicked) {
            btn.textContent = 'YOU ARE READY!';
            btn.classList.add('ready-clicked');
        } else {
            btn.textContent = 'CLICK HERE WHEN READY!';
            btn.classList.remove('ready-clicked');
        }
    }

    refocus() {
        if (!(typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) {
            var x = window.scrollX,
                y = window.scrollY;
            $("#msg_text").focus();
            window.scrollTo(x, y);
        }
    }
    isBotSpamming() {
        if (this.bottracker.length > CONSTANTS.MAX_BOT_TOGGLE_PER_SPAMPERIOD)
            return true
        return false
    }
    roomButton(room, id, special = false) {
        let str;
        if (this.counts[room] > 0) {
            str = "<b>(" + this.counts[room] + " players)</b>"
        } else {
            str = "<font color=\"white\">(0 players)</font>"
        }
        let c = "room-btn"
        $('#commands').append($("<button class='" + c + "' id='" + id + "_button'><b>" + room + "</b> <br><font size=2>" + str + "</font></button>"))
    }
    bindClick(myRoom, room, id, socket) {
        $('#' + id + '_button').bind("click", () => {
            if (myRoom !== room) socket.emit('moveTo', room);
            this.refocus()
        });
    }
    postButtons() {
        const socket = this.socket;
        // Add commands box
        $('#commands').empty();
        $('#commands').append($("<div id='settings-box' class='settings-panel'>"))

        // Add map texturens
        let pressed1 = '';
        if (this.mapStyle === 'classic') pressed1 = '-clicked';
        let pressed2 = '';
        if (this.mapStyle === 'terrain') pressed2 = '-clicked';
        let pressed3 = '';
        if (this.mapStyle === 'satellite') pressed3 = '-clicked';
        let button1 = "<span id='classic_button' class='settings-btn-container'><button class='settings-btn" + pressed1 + "'>Classic</button></span>";
        let button2 = "<span id='terrain_button' class='settings-btn-container'><button class='settings-btn" + pressed2 + "'>Terrain</button></span>";
        let button3 = "<span id='satellite_button' class='settings-btn-container'><button class='settings-btn" + pressed3 + "'>Satellite</button></span>";
        $('#settings-box').append($("<span>Map Terrain:</span><span>" + button1 + button2 + button3 + "</span>"));

        // Add joe and reset buttons
        let rebootButton = "<span id='reboot_button' class='settings-btn-container'><button class='settings-btn'>Restart</button></span>";
        let killJoe = 'Kill Bot';
        let joeSfx = '';
        if (!this.hasJoe) {
            killJoe = 'Create Bot';
        } else {
            joeSfx = '-clicked';
        }
        let joeButton = "<span id='joe_button' class='settings-btn-container'><button class='settings-btn" + joeSfx + "'>" + killJoe + "</button></span>";
        let muteButton = "<span class='settings-btn-container'><button class='settings-btn' id='mute_button'>Mute</button></span>"
        if (this.muted)
            muteButton = "<span class='settings-btn-container'><button class='settings-btn-clicked' id='mute_button'>Unmute</button></span>"
        $('#settings-box').append($("<span>Game Controls:</span><span>" + rebootButton + joeButton + muteButton + "</span>"));

        // Add jitter, hue, and grind
        let pressedAutoscale = '';
        if (this.autoscale) pressedAutoscale = '-clicked';
        let autoscaleButton = "<span id='autoscale_button' class='settings-btn-container'><button class='settings-btn" + pressedAutoscale + "'>Autoscale</button></span>";
        let pressedGrind = '';
        if (this.grind) pressedGrind = '-clicked';
        let grindButton = "<span id='grind_button' class='grind-btn-container'><button class='grind-btn" + pressedGrind + "'>🪓</button></span>";
        let hueSlider = "<div style=\"display: inline-block\" class=\"slidecontainer\"><input style=\"width: 90px\" type=\"range\" min=\"0\" max=\"360\" value=\"" + this.hueShift + "\" class=\"slider\" id=\"hue_shift\"></div>"
        let pressedAnimated = '';
        if (this.animated) pressedAnimated = '-clicked';
        let animatedButton = "<span id='animated_button' class='grind-btn-container'><button class='grind-btn" + pressedAnimated + "'>🌍</button></span>";
        $('#settings-box').append($("<span>Display: </span><span>" + hueSlider + autoscaleButton + grindButton + animatedButton + "</span>"));

        // Add map buttons
        $('#commands').append($("</div><br>"))
        let lobby_string;
        if (this.counts[CONSTANTS.LOBBY] > 0) {
            lobby_string = "<b>(" + this.counts[CONSTANTS.LOBBY] + " players)</b>"
        } else {
            lobby_string = "<font color=\"white\">(0 players)</font>"
        }
        let private_string;
        private_string = "<font color=\"white\">(? players)</font>"

        $('#commands').append($("<button class='lobby-btn' id='lobby_button'><b>Lobby</b> <font size=2><br>" + lobby_string + "</font></button>"))
        if (this.isPrivate) $('#commands').append($("<button class='private-room-btn' id='private_button'><b>" + this.privateCitysrc + "</b><br>code: " + this.privateCode + "</button>"));
        else $('#commands').append($("<button class='private-room-btn' id='private_button'><b>Private/Custom</b><font size=2><br>" + private_string + "</font></button>"));
        this.roomButton(CONSTANTS.TRIVIA, "trivia", true);
        this.roomButton(CONSTANTS.WORLD, "world");
        this.roomButton(CONSTANTS.SPECIAL_CAPITAL, "special_capital", true);
        this.roomButton(CONSTANTS.SPECIAL_REGION, "special_region", true);
        this.roomButton(CONSTANTS.EUROPE, "europe");
        this.roomButton(CONSTANTS.AFRICA, "africa");
        this.roomButton(CONSTANTS.ASIA, "asia");
        this.roomButton(CONSTANTS.OCEANIA, "oceania");
        this.roomButton(CONSTANTS.NAMERICA, "namerica");
        this.roomButton(CONSTANTS.SAMERICA, "samerica");

        var room = this.myRoomName;

        $('#mute_button').bind("click", () => {
            localStorage.setItem("muted", !this.muted);
            socket.emit('mute');
            this.refocus()
        });
        $('#autoscale_button').bind("click", () => {
            localStorage.setItem("autoscaled", !this.autoscale);
            socket.emit('autoscale');
            this.refocus()
        });
        $('#grind_button').bind("click", () => {
            localStorage.setItem("grind", !this.grind);
            socket.emit('grind', !this.grind);
            this.refocus()
        });
        $('#animated_button').bind("click", () => {
            localStorage.setItem("animated", !this.animated);
            socket.emit('animated', !this.animated);
            this.refocus()
        });
        $('#reboot_button').bind("click", () => {
            socket.emit('playerReboot');
            this.refocus()
        });
        $('#joe_button').bind("click", () => {
            if (this.isBotSpamming())
                socket.emit('block joe toggle');
            else {
                // Add to spamtracker map
                const currentdate = new Date();
                const unix = currentdate.getTime();
                this.bottracker.push(unix)
                socket.emit('toggle joe');
            }
            this.refocus()
        });
        $('#classic_button').bind("click", () => {
            socket.emit('renderMap', 'classic');
            this.refocus()
        });
        $('#terrain_button').bind("click", () => {
            socket.emit('renderMap', 'terrain');
            this.refocus()
        });
        $('#satellite_button').bind("click", () => {
            socket.emit('renderMap', 'satellite');
            this.refocus()
        });
        $('#hue_shift').bind("input", () => {
            let shift = $('#hue_shift').val();
            localStorage.setItem("hue", shift);
            socket.emit('shiftHue', shift);
            this.refocus()
        });
        this.bindClick(room, CONSTANTS.LOBBY, "lobby", socket)
        this.bindClick(room, CONSTANTS.WORLD, "world", socket)
        this.bindClick(room, CONSTANTS.SPECIAL_CAPITAL, "special_capital", socket)
        this.bindClick(room, CONSTANTS.TRIVIA, "trivia", socket)
        this.bindClick(room, CONSTANTS.NAMERICA, "namerica", socket)
        this.bindClick(room, CONSTANTS.EUROPE, "europe", socket)
        this.bindClick(room, CONSTANTS.AFRICA, "africa", socket)
        this.bindClick(room, CONSTANTS.ASIA, "asia", socket)
        this.bindClick(room, CONSTANTS.OCEANIA, "oceania", socket)
        this.bindClick(room, CONSTANTS.SAMERICA, "samerica", socket)
        this.bindClick(room, CONSTANTS.SPECIAL_REGION, "special_region", socket)
        $('#private_button').bind("click", () => {
            if (room !== CONSTANTS.PRIVATE) {
                // Popup to ask for room name, map, bot
                socket.emit('requestPrivatePopup');
                // socket.emit('moveToPrivate', CONSTANTS.PRIVATE); this.refocus()
            }
        });
    }

    setStyle(id, style) {
        if (this.socket.id === id) {
            this.mapStyle = style;
            $('#classic_button').empty();
            let pressed1 = '';
            if (this.mapStyle === 'classic') pressed1 = '-clicked';
            $('#classic_button').append($("<button class='settings-btn" + pressed1 + "'>Classic</button>"));
            $('#terrain_button').empty();
            let pressed2 = '';
            if (this.mapStyle === 'terrain') pressed2 = '-clicked';
            $('#terrain_button').append($("<button class='settings-btn" + pressed2 + "'>Terrain</button>"));
            $('#satellite_button').empty();
            let pressed3 = '';
            if (this.mapStyle === 'satellite') pressed3 = '-clicked';
            $('#satellite_button').append($("<button class='settings-btn" + pressed3 + "'>Satellite</button>"));
        }
    }

    setHueShift(id, shift) {
        if (this.socket.id === id) {
            this.hueShift = shift;
        }
    }
    setAutoscale(id) {
        if (this.socket.id === id) {
            $('#autoscale_button').empty();
            let pressedAutoscale = '';
            if (this.autoscale) pressedAutoscale = '-clicked';
            let autoscaleButton = "<button class='settings-btn" + pressedAutoscale + "'>Autoscale</button>";
            $('#autoscale_button').append($(autoscaleButton))
        }
    }
    setAnimated(id) {
        if (this.socket.id === id) {
            $('#animated_button').empty();
            let pressedAnimated = '';
            if (this.animated) pressedAnimated = '-clicked';
            let animatedButton = "<button class='grind-btn" + pressedAnimated + "'>🌍</button>";
            $('#animated_button').append($(animatedButton))
        }
    }
    setGrind(id) {
        if (this.socket.id === id) {
            $('#grind_button').empty();
            let pressedGrind = '';
            if (this.grind) pressedGrind = '-clicked';
            let grindButton = "<button class='grind-btn" + pressedGrind + "'>🪓</button>";
            $('#grind_button').append($(grindButton))
        }
    }

    labelPrivate(citysrc, code) {
        this.privateCitysrc = citysrc;
        this.privateCode = code;
        this.isPrivate = true;
    }
    clearPrivate() {
        this.isPrivate = false;
    }

    postTime(time, color) {
        this.lastTime = {
            'time': time,
            'color': color
        };
        const el = document.getElementById('timer');
        el.style.display = 'block';
        el.style.background = color;
        el.textContent = Math.max(time, 0);
    }

}
module.exports = Commands