const CONSTANTS = require('../resources/constants.js');
const io = require('./app.js').io;

class Chat {
    constructor() {
        this.messages = {}
    }

    clearMessages() {
        this.messages = {}
    }

    newScore(name, color, score) {
        this.messages[Object.values(this.messages).length] = {
            'id': Object.values(this.messages).length,
            'namecolor': color,
            'name': name,
            'payloadcolor': color,
            'payload': score
        }
    }
    newRound(data) {
        this.messages[Object.values(this.messages).length] = {
            'id': Object.values(this.messages).length,
            'namecolor': 'black',
            'name': data,
            'payloadcolor': 'black',
            'payload': ''
        }
    }
}

module.exports = Chat