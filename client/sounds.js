const CONSTANTS = require('../resources/constants.js')

// Browsers refuse to play audio until the player has interacted with the page (see the unlock in the constructor),
// and play() then rejects. That's expected, so swallow it rather than reporting it as an error.
const play = (audio) => {
    const p = audio.play();
    if (p) p.catch(() => {});
};

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

        // Safari only lets an audio element play on its own (e.g. from a socket event) after it has been played once
        // during a user gesture, so play each sound silently on the first click/keypress to unlock them.
        const unlock = () => {
            document.removeEventListener('pointerdown', unlock, true);
            document.removeEventListener('keydown', unlock, true);
            this.allSounds().forEach((audio) => {
                const wasMuted = audio.muted;
                audio.muted = true;
                const p = audio.play();
                const restore = () => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = wasMuted;
                };
                if (p) p.then(restore, restore);
                else restore();
            });
        };
        document.addEventListener('pointerdown', unlock, true);
        document.addEventListener('keydown', unlock, true);
    }

    allSounds() {
        return [this.messagePop, this.gameBeginSound, this.grindGameBeginSound, this.roundBeginSound, this.roundEndSound];
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
            play(this.messagePop);
        }
    }

    playGameBeginSound() {
        play(this.gameBeginSound);
    }
    playGrindGameBeginSound() {
        play(this.grindGameBeginSound);
    }
    playRoundBeginSound() {
        play(this.roundBeginSound);
    }
    playRoundEndSound() {
        play(this.roundEndSound);
    }
}

module.exports = Sounds