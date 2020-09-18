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
    listen() {
        const socket = this.socket;
         $("form#chat").submit(function(e) {
           e.preventDefault();
           socket.emit("send message", $(this).find("#msg_text").val(), function() {
             $("form#chat #msg_text").val("");
           });
         });
    }
}

module.exports = Chat
