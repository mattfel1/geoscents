/**
 * Class for storing all of a player's properties and defining methonds on them
 */
const CONSTANTS = require('../resources/constants.js');

class Player {
    constructor(socketid, rank, ip, ordinalid, name) {
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
        this.ip = ip;
		this.name = name;
		this.score = 0;
		this.rank = rank;
        this.ready = false;
    }

    reset() {
		this.clicked = false;
		this.lat = 0;
		this.lon = 0;
		this.row = 0;
		this.col = 0;
		this.clickedAt = 0;
	}

	deepReset(rank) {
    	this.score = 0;
    	this.rank = rank;
    	this.ready = false;
	}
};

module.exports = Player