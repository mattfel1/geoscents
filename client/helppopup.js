
const CONSTANTS = require('../resources/constants.js');

class HelpPopup {
    constructor(socket) {
        this.socket = socket;
        this.isShowing = false;
        this.map = '';
        this.citysrc = '';
        this.code = '';
        this.phase = 0
    }

    // function to show our popups
    showPopup() {
        var docHeight = $(document).height(); //grab the height of the page
        var scrollTop = $(window).scrollTop(); //grab the px value from the top of the page to where you're scrolling


        $('.screen').show().css({'height' : docHeight});
        $('.overlay-bg').show().css({'height' : docHeight}); //display your popup background and set height to the page height
        $(".instruction").show().html("Locate cities/targets as quickly and accurately as possible to score points!<br><font size=5>(click to continue)</font>");
        this.isShowing = true


        const closePopup = () => this.closePopup();
        const getPhase = () => this.getPhase();
        const incPhase = () => this.incPhase();
        const isShowing = () => this.isShowing();
        // hide popup when user clicks on close button or if user clicks anywhere outside the container
        $('.screen').unbind().click(function(){
            console.log(getPhase())
            if (getPhase() == 0) {
                $('.overlay-bg').hide()
                $('.hole').show().css({  'top': '70px', 'left': '1540px',  'width': '350px', 'height': '210px'})
                $(".instruction").show().html("Choose a map/room here<br><font size=5>(click to continue)</font>");
                incPhase()
            }
            else if (getPhase() == 1) {
                $('.hole').show().css({  'top': '15px', 'left': '150px',  'width': '1250px', 'height': '40px'})
                $(".instruction").show().html("Cities/targets and time remaining will appear here<br><font size=5>(click to continue)</font>");
                incPhase()
            } else if (getPhase() == 2) {
                $('.hole').show().css({  'top': '700px', 'left': '1540px',  'width': '345px', 'height': '215px'})
                $(".instruction").show().html("Current game scores posted here<br><font size=5>(click to continue)</font>");
                incPhase()
            } else if (getPhase() == 3) {
                $('.hole').show().css({  'top': '280px', 'left': '1540px',  'width': '345px', 'height': '410px'})
                $(".instruction").show().html("Records for current map shown here<br><font size=5>(click to continue)</font>");
                incPhase()
            } else if (getPhase() == 4) {
                $('.hole').show().css({  'top': '930px', 'left': '0px',  'width': '1050px', 'height': '300px'})
                $(".instruction").show().html("Chat here<br><font size=5>(click to continue)</font>");
                incPhase()
            } else if (getPhase() == 5) {
                $('.hole').show().css({  'top': '940px', 'left': '1060px',  'width': '810px', 'height': '310px'})
                $(".instruction").show().html("See game history here<br><font size=5>(click to continue)</font>");
                incPhase()
            } else if (getPhase() == 6) {
                $('.hole').hide()
                $('.overlay-bg').show().css({'height' : docHeight}); //display your popup background and set height to the page height
                $(".instruction").show().html("Each game has 11 rounds.  Good luck!<br><font size=5>(click to continue)</font>");
                incPhase()
            } else {

                closePopup();
            }

        });
        // hide the this.when user presses the esc key
        $(document).keyup(function(e) {
            if (e.keyCode == 27) { // if user presses esc key
                closePopup();
            }
        });

    }

    // function to close our popups
    closePopup(){
        this.phase = 0
        $('.hole, .screen, .instruction, .overlay-bg').hide(); //hide the overlay
        this.isShowing = false;
        var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);
    }
    getPhase() {
        return this.phase
    }
    incPhase() {
        this.phase = this.phase + 1
    }
    hide(){
        $('.overlay-content-code').hide(); //hide the overlay
    }
}


module.exports = HelpPopup
