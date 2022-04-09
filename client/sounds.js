const CONSTANTS = require('../resources/constants.js')

class Sounds {
    constructor(socket) {
        this.socket = socket;
        this.myMap = CONSTANTS.LOBBY;
        this.myCitysrc = CONSTANTS.LOBBY;
        this.myRoomName = CONSTANTS.LOBBY;
        this.messagePop = new Audio('/resources/message.mp3');
        this.messagePop.volume = 0.5;
        // this.gameBeginSound = new Audio('/resources/gamestart.mp3');
        this.gameBeginSound = new Audio('/resources/jingle.mp3');
        this.gameBeginSound.volume = 0.25;
        this.roundBeginSound = new Audio('/resources/roundstart.mp3');
        this.roundBeginSound.volume = 0.5;
        this.roundEndSound = new Audio('/resources/roundstop.mp3');
        this.roundEndSound.volume = 0.5;
        this.muted = false;
    }

    muteMe(id) {
        if (this.socket.id == id) {
            $('#mute_button').empty();
            if (this.muted) {
                $('#mute_button').append('🔊');
                this.muted = false;
                this.muteOff();
            } else {
                $('#mute_button').append('🔇 <font color="white">(muted)</font>');
                this.muted = true;
                this.muteOn();
            }
        }
    }

    muteOn() {
        this.messagePop.muted = true;
        this.gameBeginSound.muted = true;
        this.roundBeginSound.muted = true;
        this.roundEndSound.muted = true;
    }
    muteOff() {
        this.messagePop.muted = false;
        this.gameBeginSound.muted = false;
        this.roundBeginSound.muted = false;
        this.roundEndSound.muted = false;
    }

    newMessage(room) {
        if (room == this.myRoomName) {
            this.messagePop.play();
        }
    }

    playGameBeginSound() {
        this.gameBeginSound.play()
    }
    playRoundBeginSound() {
        this.roundBeginSound.play()
    }
    playRoundEndSound() {
        this.roundEndSound.play()
    }
}

module.exports = Sounds