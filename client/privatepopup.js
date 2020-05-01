
const CONSTANTS = require('../resources/constants.js');

class PrivatePopup {
    constructor(socket) {
        this.socket = socket;
        this.isShowing = false;
        this.map = '';
        this.code = '';
        this.configured = false;
    }

    goToRoom(info, cb) {
        let map = info['requestedMap'];
        if (map == 'Random') {
            let options = [CONSTANTS.WORLD,CONSTANTS.US,CONSTANTS.EURO,CONSTANTS.AFRICA,CONSTANTS.ASIA,CONSTANTS.OCEANIA,CONSTANTS.MISC,CONSTANTS.SAMERICA];
            map = options[Math.floor(Math.random() * options.length)];
        }
        this.map = map;
        this.code = info['code'];
        this.socket.emit('moveToPrivate', map, info['code'], info['bot'] == 'Yes', cb);
    }

    // function to show our popups
    showPopup() {
        this.isShowing = true;
        var docHeight = $(document).height(); //grab the height of the page
        var scrollTop = $(window).scrollTop(); //grab the px value from the top of the page to where you're scrolling
        $('.overlay-bg').show().css({'height' : docHeight}); //display your popup background and set height to the page height
        $('.privatepopup').show().css({'top': scrollTop+20+'px'}); //show the appropriate popup and set the content 20px from the window top
        $('#selected_code').focus();
        const goToRoom = (info,cb) => this.goToRoom(info,cb);
        const closePopup = () => this.closePopup();
        const nonConfiguredClose = () => {
            this.configured = false;
            closePopup();
        }
        const configuredClose = () => {
            this.configured = true;
            closePopup()
        }
        // hide popup when user clicks on close button or if user clicks anywhere outside the container
        $('.close-btn, .overlay-bg').click(function(){
            nonConfiguredClose();
        });
        // hide the this.when user presses the esc key
        $(document).keyup(function(e) {
            if (e.keyCode == 27) { // if user presses esc key
                nonConfiguredClose();
            }
        });

         // hide this.when user sends name
        $("form#code").submit(function(e) {
            e.preventDefault();

            var code = $(this).find("#selected_code").val();
            var requestedMap = $(this).find("#requestedMap").val();
            var bot = $(this).find("#bot").val();
            goToRoom({'code':code, 'requestedMap':requestedMap, 'bot':bot}, configuredClose());           
        });
    }

    // function to close our popups
    closePopup(){
        $('.overlay-bg, .overlay-content-code').hide(); //hide the overlay
        this.isShowing = false;
        var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);
    }
    hide(){
        $('.overlay-content-code').hide(); //hide the overlay
    }
}


module.exports = PrivatePopup
