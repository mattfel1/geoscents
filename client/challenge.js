class Challenge {
    constructor(socket) {
        this.player1 = null;
        this.player2 = null;
        this.map = null;
        this.roomId = null;
    }

    // function to show our popups
    showPopup() {
        const closePopup = () => this.closePopup();
        const callback = () => closePopup();
        // hide popup when user clicks on close button or if user clicks anywhere outside the container
        $('.close-btn, .overlay-bg').click(function() {
            join({
                'name': '',
                'color': $("input[name='selected_color']:checked").val()
            }, () => {
                closePopup()
            });
        });
        // hide the this.when user presses the esc key
        $(document).keyup(function(e) {
            if (e.keyCode == 27 && !choseName()) { // if user presses esc key
                join({
                    'name': '',
                    'color': $("input[name='selected_color']:checked").val()
                }, () => {
                    closePopup()
                });
            }
        });

        //      // hide this.when user sends name
        //       $("form#rename").submit(function(e) {
        //        e.preventDefault();

        //        if (!choseName()) {
        //            var name = $(this).find("#selected_name").val();
        //            var color = $("input[name='selected_color']:checked").val();
        //            join({'name':name, 'color':color}, callback);
        //        }
        //      });
        // }

        // function to close our popups
        closePopup() {
            $('.overlay-bg, .overlay-content').hide(); //hide the overlay
            var x = window.scrollX,
                y = window.scrollY;
            $("#msg_text").focus();
            window.scrollTo(x, y);
        }
    }


    module.exports = Challenge