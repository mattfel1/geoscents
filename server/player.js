/**
 * Class for storing all of a player's properties and defining methods on them
 */
const CONSTANTS = require('../resources/constants.js');
const helpers = require('../resources/helpers.js');

class Player {
    constructor(socketid, rank, roomName, ip, ordinalid, name, info) {
        this.row = 0;
        this.col = 0;
        this.width = 5;
        this.height = 5;
        this.color = CONSTANTS.COLORS[ordinalid % CONSTANTS.COLORS.length];
        this.clicked = false;
        this.lat = 0;
        this.lon = 0;
        this.mercError = 9999;
        this.geoError = 999999;
        this.clickedAt = 0;
        this.id = socketid;
        this.score = 0;
        this.rank = rank;
        this.wins = 0;
        this.ip = ip;
        this.consecutiveRoundsInactive = 0;
        this.consecutiveSecondsInactive = 0;
        this.ready = '';
        this.reboot = '';
        this.grind = false;
        this.logger = true;
        this.roomName = roomName;
        this.choseName = false;
        this.name = name;
        this.hash = '';
        this.public_hash = '';
        this.flair = '';
        this.optOut = false;
        this.histCount = 0;
        this.perfect = false;
        this.clown = '';


        // Override values based on info map
        if (info['moved']) {
            this.choseName = true;
            this.color = info['color'];
            this.logger = info['logger'];
            this.wins = info['wins'];
            this.name = info['raw_name'];
            this.flair = info['flair'];
            this.hash = info['hash'];
            this.public_hash = info['public_hash'];
            this.optOut = info['optOut'];
            this.grind = info['grind'];
            this.perfect = info['perfect'];
            this.clown = info['clown'];
        }
    }


    reset() {
        this.clicked = false;
        this.ready = '';
        this.lat = 0;
        this.lon = 0;
        this.row = 0;
        this.col = 0;
        this.clickedAt = 0;
        this.histCount = this.histCount + 1;
    }

    deepReset(rank) {
        this.score = 0;
        this.reboot = '';
        this.rank = rank;
        this.reset();
    }

    radius() {
        // Distance where timeLogistic * distGaussian == 4
        // try {
        // const timeLogistic = CONSTANTS.LOGISTIC_C3/(2+Math.exp(CONSTANTS.LOGISTIC_C1*(-timeBonus+CONSTANTS.LOGISTIC_C2)))+1;
        // const distGaussian = Math.exp(-Math.pow(dist, 2) / CONSTANST.GAUSS_C1) * CONSTANTS.MULTIPLIER;
        // Desmond: \sqrt{-1000\ln\left(\frac{1}{80\cdot\left(\frac{30}{2+e^{1.4\left(-x+10\right)}}+\frac{1}{80}\right)}\right)}
        // const timeLogistic = CONSTANTS.LOGISTIC_C3/(2+Math.exp(CONSTANTS.LOGISTIC_C1*(-this.clickedAt+CONSTANTS.LOGISTIC_C2)))+CONSTANTS.LOGISTIC_C4;
        // const inverse = Math.sqrt(-Math.log(5/((CONSTANTS.MULTIPLIER*timeLogistic)))*CONSTANTS.GAUSS_C1);
        // // return Math.max(inverse - CONSTANTS.BUBBLE_RADIUS, CONSTANTS.MIN_BUBBLE_RADIUS);
        // return Math.max(inverse, CONSTANTS.MIN_BUBBLE_RADIUS);
        // return 2.7*this.clickedAt + 11;
        // } catch (err) {
        // 	return CONSTANTS.BUBBLE_RADIUS;
        // }
        return CONSTANTS.BUBBLE_RADIUS * 2;
    }
    won() {
        this.wins = this.wins + 1;
    }
    getFlairedName() {
        var fullname = this.ready + this.reboot + this.clown + this.name + this.clown;
        if (this.flair !== '')
            fullname = fullname + ' ' + this.flair;
        if (this.perfect) {
            fullname = fullname + helpers.perfectEmoji();
        }
        return fullname;
    }
    getName() {
        let axe = ''
        if (this.grind)
            axe = '🪓'
        var fullname = this.ready + this.reboot + axe + this.clown + this.name + this.clown
        if (this.flair !== '')
            fullname = fullname + ' ' + this.flair;
        if (this.perfect) {
            fullname = fullname + helpers.perfectEmoji();
        }
        return fullname;
    }
};

module.exports = Player