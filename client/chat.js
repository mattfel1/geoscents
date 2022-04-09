const CONSTANTS = require('../resources/constants.js')

class Chat {
    constructor(socket) {
        this.socket = socket;
        this.chatCount = 0;
        this.myRoomName = CONSTANTS.LOBBY;
        this.myMap = CONSTANTS.LOBBY;
        this.myCitysrc = CONSTANTS.LOBBY;
        this.windowActive = true;
        this.hasNewMessage = false;
        this.muted = false;
        this.spamtracker = new Map();
        this.isSpamming();
    }

    isActive(document) {
        this.windowActive = true;
        this.hasNewMessage = false;
        document.title = "GeoScents";
    }
    isBlur() {
        this.windowActive = false;
    }

    addMessage(room, msg) {
        if (room == this.myRoomName) {
            var final_message = $("<font style=\"font-size:20px;\" />").html(msg);
            if (!this.windowActive) {
                this.hasNewMessage = true;
            }
            var historyDiv = $('#history');
            historyDiv.prepend(final_message);
            this.chatCount = this.chatCount + 1;
            if (this.chatCount > CONSTANTS.MAX_CHAT_HIST) {
                historyDiv.children().last().remove();
                this.chatCount = this.chatCount - 1;
            }
        }
    }
    addCustomMessage(room, msg, fontsize) {
        if (room == this.myRoomName) {
            var final_message = $("<font style=\"font-size:" + fontsize + "px;\" />").html(msg);
            if (!this.windowActive) {
                this.hasNewMessage = true;
            }
            var historyDiv = $('#history');
            historyDiv.prepend(final_message);
            this.chatCount = this.chatCount + 1;
            if (this.chatCount > CONSTANTS.MAX_CHAT_HIST) {
                historyDiv.children().last().remove();
                this.chatCount = this.chatCount - 1;
            }
        }
    }
    isSpamming() {
        if (this.spamtracker.size > CONSTANTS.MAX_MSG_PER_SPAMPERIOD) {
            return true
        }
        var charcount = 0;
        for (let [time, len] of this.spamtracker) {
            charcount = charcount + len;
        }
        if (charcount > CONSTANTS.MAX_CHAR_PER_SPAMPERIOD)
            return true
        return false
    }
    listen() {
        const socket = this.socket;
        const self = this;
        const spamtracker = this.spamtracker;
        $("form#chat").submit(function(e) {
            e.preventDefault();
            const msg = $(this).find("#msg_text").val();
            if (msg.length > 0) {
                if (self.isSpamming()) {
                    socket.emit("block spam");
                } else {
                    socket.emit("send message", msg, function() {
                        $("form#chat #msg_text").val("");

                        // Add to spamtracker map
                        const currentdate = new Date();
                        const unix = currentdate.getTime();
                        spamtracker.set(unix, msg.length)
                    });
                }
            }
        });
        this.spamtracker = spamtracker
    }
}

module.exports = Chat