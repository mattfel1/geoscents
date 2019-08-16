/**
 * Class for storing all of a player's properties and defining methods on them
 */
const CONSTANTS = require('../resources/constants.js');

class Player {
    constructor(socketid, rank, room, ip, ordinalid, name, info) {
        this.row = 0;
		this.col = 0;
		this.width = 5;
		this.height = 5;
		this.color = CONSTANTS.COLORS[ordinalid % CONSTANTS.COLORS.length];
        this.clicked = false;
		this.lat = 0;
		this.lon = 0;
		this.clickedAt = 0;
        this.id = socketid;
		this.score = 0;
		this.rank = rank;
        this.ready = false;
        this.wins = 0;
        this.consecutiveRoundsInactive = 0;
        this.consecutiveSecondsInactive = 0;
        this.trophy = false;
        this.room = room;
        this.inGame = false;
        this.name = name;

        // Override values based on info map
		if (info['moved']) {
			this.inGame = true;
			this.color = info['color'];
			this.wins = info['wins'];
			this.name = info['name'];
		}
    }

    reset() {
		this.clicked = false;
		this.ready = false;
		this.trophy = false;
		this.lat = 0;
		this.lon = 0;
		this.row = 0;
		this.col = 0;
		this.clickedAt = 0;
	}

	deepReset(rank) {
    	this.score = 0;
    	this.rank = rank;
	}
};

module.exports = Player