const CONSTANTS = require('../resources/constants.js')

const MEDALS = ['🥇', '🥈', '🥉', '🥉', '🥉'];

class Scoreboard {
    constructor(socket) {
        this.socket = socket
        this.myMap = CONSTANTS.LOBBY;
        this.myCitysrc = CONSTANTS.LOBBY;
        this.myRoomName = CONSTANTS.LOBBY;
    }

    postScore(rank, name, color, score, wins) {
        const isYou = name.startsWith('*');
        const displayName = isYou ? name.slice(1) : name;

        let botBadge = '';
        if (displayName.startsWith('Average ')) {
            const msg = 'Hello! I am just an ' + displayName + '! I click at the average location at the average time across all players who have played this game! You can turn me off by clicking the "Kill Bot" button on the top right.';
            botBadge = ' <span title="' + msg + '" style="cursor:help">💬</span>';
        }

        const youStyle = isYou
            ? 'background:rgba(255,255,255,0.55);border-radius:3px;padding:0 2px;'
            : '';
        const youArrow = isYou ? '<span style="opacity:0.6">▶ </span>' : '';

        const row = $('<div>').css({
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '2px 4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isYou ? 'rgba(255,255,255,0.35)' : 'transparent',
            borderRadius: '3px',
            margin: '1px 0',
        });

        const left = $('<span>').css({ color: color, fontWeight: isYou ? 'bold' : 'normal' })
            .html(youArrow + '<b>' + displayName + '</b>' + botBadge);

        const right = $('<span>').css({ color: '#333', whiteSpace: 'nowrap', marginLeft: '6px' })
            .text(score + '  (' + wins + ' 🏆)');

        row.append(left).append(right);
        $('#scoreboard').append(row);
    }

    clearScores() {
        $('#scoreboard').empty();
        $('#leaderboard').empty();
    }

    postGroup(category, dict) {
        const slots = [
            { record: dict['record1'], name: dict['recordName1'], color: dict['recordColor1'], broken: dict['recordBroken1'] },
            { record: dict['record2'], name: dict['recordName2'], color: dict['recordColor2'], broken: dict['recordBroken2'] },
            { record: dict['record3'], name: dict['recordName3'], color: dict['recordColor3'], broken: dict['recordBroken3'] },
            { record: dict['record4'], name: dict['recordName4'], color: dict['recordColor4'], broken: dict['recordBroken4'] },
            { record: dict['record5'], name: dict['recordName5'], color: dict['recordColor5'], broken: dict['recordBroken5'] },
        ];

        // Category header
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
                background: 'white',
                borderLeft: '4px solid ' + slot.color,
                borderRadius: '0 3px 3px 0',
                padding: '3px 6px 3px 5px',
                margin: '2px 4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                fontSize: '13px',
            });

            const left = $('<span>').html(
                '<span style="margin-right:4px">' + MEDALS[i] + '</span>' +
                '<span style="color:' + slot.color + ';font-weight:bold">' + slot.name + '</span>' +
                '<span style="font-size:11px">' + badge + '</span>'
            );

            const right = $('<span>').css({ fontWeight: 'bold', color: '#222', whiteSpace: 'nowrap' })
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

        board.forEach(function(x) {
            const entry = $('<div>').css({ padding: '1px 4px', fontSize: '13px' }).html(x);
            $('#leaderboard').append(entry);
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
