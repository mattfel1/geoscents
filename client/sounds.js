const CONSTANTS = require('../resources/constants.js')

class Sounds {
    constructor(socket) {
        this.socket = socket;
        this.myMap = CONSTANTS.LOBBY;
        this.myCitysrc = CONSTANTS.LOBBY;
        this.myRoomName = CONSTANTS.LOBBY;
        this.messagePop = new Audio('/resources/audio/message.mp3');
        this.messagePop.volume = 0.5;
        // this.gameBeginSound = new Audio('/resources/audio/gamestart.mp3');
        this.gameBeginSound = new Audio('/resources/audio/jingle.mp3');
        this.gameBeginSound.volume = 0.22;
        this.grindGameBeginSound = new Audio('/resources/audio/grindgamestart.mp3');
        this.grindGameBeginSound.volume = 0.22;
        this.roundBeginSound = new Audio('/resources/audio/roundstart.mp3');
        this.roundBeginSound.volume = 0.5;
        this.roundEndSound = new Audio('/resources/audio/roundstop.mp3');
        this.roundEndSound.volume = 0.5;

        var was_muted = localStorage.getItem("muted");
        if (was_muted === null || was_muted === "false") was_muted = false
        else was_muted = true
        this.muted = was_muted;

        if (this.muted) {
            this.muteOn();
        }
    }

    muteMe(id) {
        if (this.socket.id == id) {
            $('#mute_button').empty();
            if (this.muted) {
                $('#mute_button').append('Mute');
                document.getElementById("mute_button").className = "settings-btn";
                this.muted = false;
                this.muteOff();
            } else {
                $('#mute_button').append('Unmute');
                document.getElementById("mute_button").className = "settings-btn-clicked";
                this.muted = true;
                this.muteOn();
            }
        }
    }

    muteOn() {
        this.messagePop.muted = true;
        this.gameBeginSound.muted = true;
        this.grindGameBeginSound.muted = true;
        this.roundBeginSound.muted = true;
        this.roundEndSound.muted = true;
    }
    muteOff() {
        this.messagePop.muted = false;
        this.gameBeginSound.muted = false;
        this.grindGameBeginSound.muted = false;
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
    playGrindGameBeginSound() {
        this.grindGameBeginSound.play()
    }
    playRoundBeginSound() {
        this.roundBeginSound.play()
    }
    playRoundEndSound() {
        this.roundEndSound.play()
    }
}

module.exports = Sounds