const CONSTANTS = require('../resources/constants.js');

class PrivatePopup {
    constructor(socket) {
        this.socket = socket;
        this.configured = true;
        this.isShowing = false;
        this.map = '';
        this.citysrc = '';
        this.code = '';
        this.configured = false;
    }

    goToRoom(info, cb) {
        let citysrc = info['requestedCitysrc'];
        if (citysrc == 'Random') {
            let options = window.document.getElementById('requestedCitysrc').children
            citysrc = options[Math.floor(Math.random() * options.length)].value;
        }
        this.citysrc = citysrc;
        this.code = info['code'];
        this.socket.emit('moveToPrivate', citysrc, info['code'], cb);
    }

    // function to show our popups
    showPopup(msg) {
        this.isShowing = true;
        this.configured = false;
        $('.overlay-bg').show();
        $('.privatepopup').show();
        $('#selected_code').focus();
        const goToRoom = (info, cb) => this.goToRoom(info, cb);
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
        $('.close-btn, .overlay-bg').unbind().click(function() {
            nonConfiguredClose();
        });
        // hide the this.when user presses the esc key
        $(document).keyup(function(e) {
            if (e.keyCode == 27) { // if user presses esc key
                nonConfiguredClose();
            }
        });
        // hide this.when user sends name
        $("form#code").off().submit(function(e) {
            e.preventDefault();
            var code = $(this).find("#selected_code").val();
            var requestedCitysrc = $(this).find("#requestedCitysrc_choice").val();
            goToRoom({
                'code': code,
                'requestedCitysrc': requestedCitysrc
            }, configuredClose());

        });
    }

    // function to close our popups
    closePopup() {
        $('.overlay-bg, .overlay-content-code').hide(); //hide the overlay
        this.isShowing = false;
        var x = window.scrollX,
            y = window.scrollY;
        $("#msg_text").focus();
        window.scrollTo(x, y);
    }
    hide() {
        $('.overlay-content-code').hide(); //hide the overlay
    }
}


module.exports = PrivatePopup