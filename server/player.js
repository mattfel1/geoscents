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
        this.wins = 0;
        this.consecutiveRoundsInactive = 0;
        this.consecutiveSecondsInactive = 0;
        this.ready = '';
        this.trophy = '';
        this.medal = '';
        this.record = '';
        this.room = room;
        this.choseName = false;
        this.name = name;

        // Override values based on info map
		if (info['moved']) {
			this.choseName = true;
			this.color = info['color'];
			this.wins = info['wins'];
			this.name = info['name'];
		}
    }

    reset() {
		this.clicked = false;
		this.ready = '';
		this.trophy = '';
		this.medal = '';
		this.record = '';
		this.lat = 0;
		this.lon = 0;
		this.row = 0;
		this.col = 0;
		this.clickedAt = 0;
	}

	deepReset(rank) {
    	this.score = 0;
    	this.rank = rank;
    	this.reset();
	}

	giveMedal(position, category) {
		if (position == 1) this.medal = this.medal + '🥇';
		else if (position == 2) this.medal = this.medal + '🥈';
		else if (position == 3) this.medal = this.medal + '🥉';
	}

	radius() {
    	// Distance where timeLogistic * distGaussian == 4
		try {
		    // const timeLogistic = CONSTANTS.LOGISTIC_C3/(2+Math.exp(CONSTANTS.LOGISTIC_C1*(-timeBonus+CONSTANTS.LOGISTIC_C2)))+1;
            // const distGaussian = Math.exp(-Math.pow(dist, 2) / CONSTANST.GAUSS_C1) * CONSTANTS.MULTIPLIER;
			// Desmond: \sqrt{-1000\ln\left(\frac{1}{80\cdot\left(\frac{30}{2+e^{1.4\left(-x+10\right)}}+\frac{1}{80}\right)}\right)}
			// const timeLogistic = CONSTANTS.LOGISTIC_C3/(2+Math.exp(CONSTANTS.LOGISTIC_C1*(-this.clickedAt+CONSTANTS.LOGISTIC_C2)))+CONSTANTS.LOGISTIC_C4;
			// const inverse = Math.sqrt(-Math.log(5/((CONSTANTS.MULTIPLIER*timeLogistic)))*CONSTANTS.GAUSS_C1);
			// // return Math.max(inverse - CONSTANTS.BUBBLE_RADIUS, CONSTANTS.MIN_BUBBLE_RADIUS);
			// return Math.max(inverse, CONSTANTS.MIN_BUBBLE_RADIUS);
			return 2.8*this.clickedAt + 15;
		} catch (err) {
			return CONSTANTS.BUBBLE_RADIUS;
		}
	}
	won() {
    	this.wins = this.wins + 1;
        this.trophy = '🏆';
	}
	getName() {
		const fullname = this.ready + this.record + this.medal + this.trophy + this.name;
    	return fullname;
	}
};

module.exports = Player