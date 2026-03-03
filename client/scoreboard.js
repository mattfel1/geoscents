const CONSTANTS = require('../resources/constants.js')

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
const PACE_MODES = ['Off', 'HoF', 'Year', 'Month', 'Week', 'Day'];
// Indexed by pointsMode: 0=Off, 1=HoF (special), 2=Year, 3=Month, 4=Week, 5=Day
const PACE_KEYS = [null, null, 'yearly', 'monthly', 'weekly', 'daily'];

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value) {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}

class Scoreboard {
    constructor(socket) {
        this.socket = socket
        this.myMap = CONSTANTS.LOBBY;
        this.myCitysrc = CONSTANTS.LOBBY;
        this.myRoomName = CONSTANTS.LOBBY;
        this.currentRound = -1;
        this.records = {
            yearly: 0,
            monthly: 0,
            weekly: 0,
            daily: 0
        };
        const stored = parseInt(getCookie('pointsMode'));
        this.pointsMode = isNaN(stored) ? 0 : Math.min(stored, PACE_MODES.length - 1);
    }

    cyclePointsMode() {
        this.pointsMode = (this.pointsMode + 1) % PACE_MODES.length;
        setCookie('pointsMode', this.pointsMode);
        return PACE_MODES[this.pointsMode];
    }

    setRound(round) {
        this.currentRound = round;
        if (this.myRenderPace) this.myRenderPace();
    }

    _paceInfo(score) {
        if (this.pointsMode === 0) return null;
        let target, goalName;
        if (this.pointsMode === 1) {
            target = CONSTANTS.FAMESCORE;
            goalName = 'Hall of Fame';
        } else {
            const key = PACE_KEYS[this.pointsMode];
            target = this.records[key];
            goalName = '\uD83E\uDD47 ' + PACE_MODES[this.pointsMode];
        }
        if (!target || this.myMap === CONSTANTS.LOBBY) return {
            goalName,
            noData: true
        };
        if (score >= target) return {
            goalName,
            achieved: true
        };
        const remaining = CONSTANTS.GAME_ROUNDS - this.currentRound - 1;
        const maxPerRound = Math.round(CONSTANTS.PERFECT_SCORE / CONSTANTS.GAME_ROUNDS);
        const maxPossible = score + remaining * maxPerRound;
        if (maxPossible < target) return {
            goalName,
            impossible: true,
            maxPossible
        };
        const needed = Math.ceil((target - score) / remaining);
        return {
            goalName,
            needed
        };
    }

    _paceDisplay(pace) {
        const dot = 'style="text-decoration:underline dotted;cursor:pointer"';
        if (!pace) return {
            html: 'Goal: <span ' + dot + '>Off \u2014 click to set</span>',
            color: '#bbb'
        };
        const nameSpan = '<span ' + dot + '>' + pace.goalName + '</span>';
        if (pace.noData) return {
            html: 'Goal: ' + nameSpan + '.  --- pts/rnd',
            color: '#bbb'
        };
        if (pace.achieved) return {
            html: 'Goal: ' + nameSpan + '.  \u2713 Achieved!',
            color: '#2a2'
        };
        if (pace.impossible) return {
            html: 'Goal: ' + nameSpan + '.  Impossible. (<b>' + pace.maxPossible + '</b> Max)',
            color: '#c00'
        };
        return {
            html: 'Goal: ' + nameSpan + '.  Required: <b>' + pace.needed + '</b> pts/rnd',
            color: '#555'
        };
    }

    postScore(rank, name, color, score, wins) {
        const isYou = name.startsWith('*');
        const displayName = isYou ? name.slice(1) : name;
        const isBot = displayName.startsWith('Average ');

        let botTooltip = '';
        if (isBot) {
            const msg = 'Hello! I am just an ' + displayName + '! I click at the average location at the average time across all players who have played this game! You can turn me off by clicking the "Kill Bot" button on the top right.';
            botTooltip = ' <span title="' + msg + '" style="cursor:help">💬</span>';
        }

        const youArrow = isYou ? '<span style="opacity:0.6">▶ </span>' : '';

        const row = $('<div>').css({
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '3px 6px',
            background: color + '18',
            border: '2px ' + (isBot ? 'dashed' : 'solid') + ' ' + color,
            borderRadius: '3px',
            margin: '2px 4px',
        });

        const mainLine = $('<div>').css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        });

        const left = $('<span>').css({
                color: color,
                fontWeight: isYou ? 'bold' : 'normal'
            })
            .html(youArrow + '<b>' + displayName + '</b>' + botTooltip);
        const right = $('<span>').css({
                color: '#333',
                whiteSpace: 'nowrap',
                marginLeft: '6px'
            })
            .text(score + '  (' + wins + ' \uD83C\uDFC6)');

        mainLine.append(left).append(right);
        row.append(mainLine);

        if (isYou) {
            const paceEl = $('<div>').css({
                fontSize: '11px',
                textAlign: 'right',
                marginTop: '2px',
                userSelect: 'none',
            });

            const self = this;

            function renderPace() {
                const pace = self._paceInfo(score);
                const {
                    html,
                    color
                } = self._paceDisplay(pace);
                paceEl.css('color', color).html(html);
                paceEl.find('span').on('click', function(e) {
                    e.stopPropagation();
                    self.cyclePointsMode();
                    renderPace();
                });
            }
            renderPace();
            this.myRenderPace = renderPace;
            row.append(paceEl);
        }

        $('#scoreboard').append(row);
    }

    clearScores() {
        $('#scoreboard').empty();
        $('#leaderboard').empty();
        this.records = {
            yearly: 0,
            monthly: 0,
            weekly: 0,
            daily: 0
        };
        this.myRenderPace = null;
    }

    postGroup(category, dict) {
        // Capture #1 record for pace tracking
        if (category.startsWith('Yearly')) this.records.yearly = dict['record1'] || 0;
        if (category.startsWith('Monthly')) this.records.monthly = dict['record1'] || 0;
        if (category.startsWith('Weekly')) this.records.weekly = dict['record1'] || 0;
        if (category.startsWith('Daily')) this.records.daily = dict['record1'] || 0;

        const slots = [{
                record: dict['record1'],
                name: dict['recordName1'],
                color: dict['recordColor1'],
                broken: dict['recordBroken1']
            },
            {
                record: dict['record2'],
                name: dict['recordName2'],
                color: dict['recordColor2'],
                broken: dict['recordBroken2']
            },
            {
                record: dict['record3'],
                name: dict['recordName3'],
                color: dict['recordColor3'],
                broken: dict['recordBroken3']
            },
            {
                record: dict['record4'],
                name: dict['recordName4'],
                color: dict['recordColor4'],
                broken: dict['recordBroken4']
            },
            {
                record: dict['record5'],
                name: dict['recordName5'],
                color: dict['recordColor5'],
                broken: dict['recordBroken5']
            },
        ];

        const header = $('<div>').css({
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '6px 4px 2px 4px',
        }).text(category.replace(/:/g, ''));
        $('#leaderboard').append(header);

        slots.forEach(function(slot, i) {
            if (!slot.name) return;
            const badge = slot.broken ? ' 🎉' : '';
            const card = $('<div>').css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: slot.color + '18',
                border: '2px solid ' + slot.color,
                borderRadius: '3px',
                padding: '3px 6px',
                margin: '2px 4px',
                fontSize: '13px',
            });

            const left = $('<span>').html(
                '<span style="margin-right:4px">' + MEDALS[i] + '</span>' +
                '<span style="color:' + slot.color + ';font-weight:bold">' + slot.name + '</span>' +
                '<span style="font-size:11px">' + badge + '</span>'
            );
            const right = $('<span>').css({
                    fontWeight: 'bold',
                    color: '#222',
                    whiteSpace: 'nowrap'
                })
                .text(slot.record);

            card.append(left).append(right);
            $('#leaderboard').append(card);
        });
    }

    postSpace() {}

    postScoreTitle(citysrc) {
        const title = $('<div>').css({
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#555',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '6px 4px 2px 4px',
        }).text('Players in ' + citysrc);
        $('#scoreboard').append(title);
    }

    postLobby(board) {
        const header = $('<div>').css({
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#555',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '4px 4px 2px 4px',
        }).text(CONSTANTS.FAMESCORE + '+ Hall of Fame');
        $('#leaderboard').append(header);

        board.forEach(function(entry) {
            const hasCrown = entry.perfectMaps && entry.perfectMaps.length > 0;

            const card = $('<div>').css({
                display: 'block',
                padding: '3px 6px',
                margin: '2px 4px',
                background: hasCrown ? 'linear-gradient(135deg, #fffbe6, #fff3b0)' : '#f5f5f5',
                border: '1px solid ' + (hasCrown ? '#d4a800' : '#ccc'),
                borderRadius: '3px',
            });

            const nameLine = $('<div>').css({
                fontWeight: 'bold',
                fontSize: '13px',
            });
            nameLine.append(
                $('<a>').attr({ href: entry.href, target: '_blank' }).css({ color: '#222', textDecoration: 'none' }).text(entry.name)
            );
            if (hasCrown) {
                const tip = 'Perfect ' + CONSTANTS.PERFECT_SCORE + '! ' + entry.perfectMaps.join(', ');
                nameLine.append(
                    $('<span>').attr('title', tip).css({
                        fontSize: '15px',
                        filter: 'drop-shadow(0 0 5px gold) drop-shadow(0 0 2px #b8860b)',
                        cursor: 'help',
                        marginLeft: '4px',
                    }).text('👑')
                );
            }
            card.append(nameLine);

            const flairLine = $('<div>').css({ fontSize: '14px', lineHeight: '1.5', marginTop: '1px' });

            entry.flairs.forEach(function(f) {
                flairLine.append(
                    $('<span>').attr('title', f.map).css({ cursor: 'help', marginRight: '1px' }).text(f.emoji)
                );
            });

            card.append(flairLine);
            $('#leaderboard').append(card);
        });

        const lobbyTitle = $('<div>').css({
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#555',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '6px 4px 2px 4px',
        }).text('Players in Lobby');
        $('#scoreboard').append(lobbyTitle);
    }
}

module.exports = Scoreboard