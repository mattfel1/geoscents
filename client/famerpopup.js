class FamerPopup {
    constructor(socket) {
        this.socket = socket;
        this.choseFlair = false;
        this.isShowing = false;
    }

    join(info, cb) {
        this.choseFlair = true;
        this.socket.emit('playerJoin', info['name'], info['color'], info['logger'], info['hash'], info['public_hash'], info['flair'], info['grind'], cb);
    }
    getChoseFlair() {
        return this.choseFlair;
    }

    // function to show our popups
    showPopup(name, color, logger, hash, public_hash, grind) {
        this.isShowing = true;
        var docHeight = $(document).height(); //grab the height of the page
        var scrollTop = $(window).scrollTop(); //grab the px value from the top of the page to where you're scrolling
        $('.famerpopup').show().css({
            'top': scrollTop + 20 + 'px'
        }); //show the appropriate popup and set the content 20px from the window top
        $('.overlay-bg').show().css({
            'height': docHeight
        }); //display your popup background and set height to the page height
        $('#submit_famer').focus();
        const join = (info, cb) => this.join(info, cb);
        const closePopup = () => this.closePopup();
        const choseFlair = () => this.getChoseFlair();
        const callback = () => {
            // $("form#rename #selected_famer_name").val("");
            closePopup()
        }

        var flair = localStorage.getItem("selected_famer_flair");
        // Cache select TBD
        // if (flair !== null) {
        //     var radios = document.getElementsByName("selected_famer_flair");
        //     for (var i = 0; i < radios.length; i++) {
        //         // console.log("radio button " + radios[i].value)
        //         if (radios[i].value == flair) radios[i].checked = true
        //         else radios[i].checked = false
        //     }
        // }

        // hide popup when user clicks on close button or if user clicks anywhere outside the container
        $('.close-btn, .overlay-bg').unbind().click(function() {
            var flair = $(this).find("#requestedFlair").val()
            join({
                'name': name,
                'color': color,
                'flair': '',
                'logger': logger,
                'hash': hash,
                'public_hash': public_hash,
                'grind': grind
            }, () => {
                closePopup()
            });
        });
        // hide the this.when user presses the esc key
        $(document).keyup(function(e) {
            if (e.keyCode == 27 && !choseFlair()) { // if user presses esc key
                var flair = $(this).find("#requestedFlair").val()
                join({
                    'name': name,
                    'color': color,
                    'flair': '',
                    'logger': logger,
                    'hash': hash,
                    'public_hash': public_hash,
                    'grind': grind
                }, () => {
                    closePopup()
                });
            }
        });

        // hide this.when user sends name
        $("form#famer_rename").submit(function(e) {
            e.preventDefault();

            if (!choseFlair()) {
                var flair = $(this).find("#requestedFlair").val()
                localStorage.setItem("selected_famer_flair", $('#requestedFlair').val());
                join({
                    'name': name,
                    'flair': flair,
                    'color': color,
                    'logger': logger,
                    'hash': hash,
                    'public_hash': public_hash,
                    'grind': grind
                }, callback);
            }
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


module.exports = FamerPopup