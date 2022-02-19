class Popup {
    constructor(socket) {
        this.socket = socket;
        this.choseName = false;
        this.isShowing = true;
    }

    join(info, cb) {
        this.choseName = true;
        this.socket.emit('playerJoin', info['name'], info['color'], info['logger'], cb);
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
        const callback = () => {
                   // $("form#rename #selected_name").val("");
                   closePopup()
               }

        var name = localStorage.getItem("selected_name");
        if (name !== null) $('#selected_name').val(name);
        var color = localStorage.getItem("selected_color");
        if (color !== null) {
            var radios = document.getElementsByName("selected_color");
            for(var i=0;i<radios.length;i++){
                if (radios[i].value == color) radios[i].checked = true
                else radios[i].checked = false
            }
        }
        var logger = localStorage.getItem("selected_log");
        if (logger !== null) {
            var radios = document.getElementsByName("selected_log");
            for(var i=0;i<radios.length;i++){
                // console.log("radio button " + radios[i].value)
                if (radios[i].value == logger) radios[i].checked = true
                else radios[i].checked = false
            }
        }

        // hide popup when user clicks on close button or if user clicks anywhere outside the container
        $('.close-btn, .overlay-bg').unbind().click(function(){
            join({'name':'', 'color':$("input[name='selected_color']:checked").val()}, () => {closePopup()});
        });
        // hide the this.when user presses the esc key
        $(document).keyup(function(e) {
            if (e.keyCode == 27 && !choseName()) { // if user presses esc key
                join({'name':'', 'color':$("input[name='selected_color']:checked").val()}, () => {closePopup()});
            }
        });

         // hide this.when user sends name
          $("form#rename").submit(function(e) {
           e.preventDefault();

           if (!choseName()) {
               var name = $(this).find("#selected_name").val();
               var color = $("input[name='selected_color']:checked").val();
               var logger = $("input[name='selected_log']:checked").val();
               localStorage.setItem("selected_name", $('#selected_name').val());
               localStorage.setItem("selected_color", $("input[name='selected_color']:checked").val());
               localStorage.setItem("selected_log", $("input[name='selected_log']:checked").val());
               join({'name':name, 'color':color, 'logger':logger}, callback);
           }
         });
    }

    // function to close our popups
    closePopup(){
        $('.overlay-bg, .overlay-content-name').hide(); //hide the overlay
        this.isShowing = false;
        var x = window.scrollX, y = window.scrollY; $("#msg_text").focus(); window.scrollTo(x, y);
    }
}


module.exports = Popup
