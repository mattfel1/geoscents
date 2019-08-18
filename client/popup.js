class Popup {
    constructor(socket) {
        this.socket = socket;
        this.choseName = false;
    }

    join(name,cb) {
        this.choseName = true;
        this.socket.emit('playerJoin', name, cb);
    }
    getChoseName() {
        return this.choseName;
    }

    // function to show our popups
    showPopup() {
        if (this.choseName == false) {
            var docHeight = $(document).height(); //grab the height of the page
            var scrollTop = $(window).scrollTop(); //grab the px value from the top of the page to where you're scrolling
            $('.overlay-bg').show().css({'height' : docHeight}); //display your popup background and set height to the page height
            $('.popup').show().css({'top': scrollTop+20+'px'}); //show the appropriate popup and set the content 20px from the window top
            $('#selected_name').focus();
        }
        const join = (name,cb) => this.join(name,cb);
        const closePopup = () => this.closePopup();
        const choseName = () => this.getChoseName();
        // hide popup when user clicks on close button or if user clicks anywhere outside the container
        $('.close-btn, .overlay-bg').click(function(){
            join('', () => {closePopup()});
        });
        // hide the this.when user presses the esc key
        $(document).keyup(function(e) {
            if (e.keyCode == 27 && !choseName()) { // if user presses esc key
                join('', () => {closePopup()});
            }
        });

         // hide this.when user sends name
          $("form#rename").submit(function(e) {
           e.preventDefault();

           if (!choseName()) {
               join($(this).find("#selected_name").val(), function () {
                   $("form#rename #selected_name").val("");
                   closePopup()
               });
           }
         });
    }

    // function to close our popups
    closePopup(){
        // $('#msg_text').focus();
        $('.overlay-bg, .overlay-content').hide(); //hide the overlay
    }
}


module.exports = Popup
