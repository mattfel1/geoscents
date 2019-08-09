

class Panel {
    constructor(socket) {
        this.socket = socket;
        this.panel = window.document.getElementById('panel');
        this.panel_ctx = this.panel.getContext('2d')
    }

    ready_button = {
        x:90,
        y:150,
        width:110,
        height:50
    };
    timer_window = {
        x: 10,
        y: 5,
        width: 50,
        height: 50
    };
    round_window = {
        x: 450,
        y: 40,
        width: 160,
        height: 40
    };
    info_window = {
        x: 20,
        y: 80,
        width: 500,
        height: 140
    }
    time_descrip_window = {
        x: 70,
        y: 10,
        width: 300,
        height: 40
    }
    scoreboard_window = {
        x: 0,
        y: this.panel.height/2,
        width: this.panel.width,
        height: this.panel.height/2
    };

    postTime(time) {
        this.panel_ctx.clearRect(timer_window['x'], timer_window['y'], timer_window['width'], timer_window['height']);
        this.panel_ctx.fillStyle =  "#e3e4e6";
        this.panel_ctx.fillRect(timer_window['x'], timer_window['y'], timer_window['width'], timer_window['height']);
        this.panel_ctx.font = "30px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(Math.max(time,0), timer_window['x']+5,timer_window['y'] + 33);
    }

    postTimeDescrip(info) {
        this.panel_ctx.clearRect(time_descrip_window['x'], time_descrip_window['y'], time_descrip_window['width'], time_descrip_window['height'])
        this.panel_ctx.fillStyle = 'white';
        this.panel_ctx.fillRect(time_descrip_window['x'], time_descrip_window['y'], time_descrip_window['width'], time_descrip_window['height']);    this.panel_ctx.font = "25px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(info, time_descrip_window['x'] + 5, time_descrip_window['y']+25)
    }

    postScore(rank, name, color, score, you) {
        if (rank == 0) {
            this.panel_ctx.clearRect(scoreboard_window['x'], scoreboard_window['y'], scoreboard_window['width'], scoreboard_window['height']);
            this.panel_ctx.fillStyle =  "#e3e4e6";
            this.panel_ctx.fillRect(scoreboard_window['x'], scoreboard_window['y'], scoreboard_window['width'], scoreboard_window['height']);
            this.panel_ctx.font = "35px Arial";
            this.panel_ctx.fillStyle = "black";
            this.panel_ctx.fillText("Scoreboard:", scoreboard_window['x'] + 5, scoreboard_window['y'] + 45)
        }

        this.panel_ctx.font = "30px Arial";
        this.panel_ctx.fillStyle = color;
        this.panel_ctx.fillText("Player " + name + ": " + score + ' ' + you, scoreboard_window['x'] + 80, scoreboard_window['y'] + 85 + rank * 40 )
    }

    postReady(rank) {
        this.panel_ctx.font = "30px Arial";
        this.panel_ctx.fillStyle = "green";
        this.panel_ctx.fillText("RDY", scoreboard_window['x'] + 5, scoreboard_window['y'] + 85 + rank * 40 )
    }


    postInfo(info1, info2, button) {
        this.panel_ctx.clearRect(info_window['x'], info_window['y'], info_window['width'], info_window['height']);
        this.panel_ctx.fillStyle = 'white';
        this.panel_ctx.fillRect(info_window['x'], info_window['y'], info_window['width'], info_window['height']);

        this.panel_ctx.font = "35px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(info1, info_window['x'] + 5, info_window['y'] + 28)

        this.panel_ctx.font = "35px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(info2, info_window['x'] + 5, info_window['y'] + 86)

        if (button) {
            this.panel_ctx.fillStyle = "orange";
            this.panel_ctx.fillRect(ready_button['x'], ready_button['y'], ready_button['width'], ready_button['height']);
            this.panel_ctx.font = "25px Arial";
            this.panel_ctx.fillStyle = 'black';
            this.panel_ctx.fillText('READY!', ready_button['x'] + 5, ready_button['y'] + 28)
        }
    }

    this.socket.on('post score', (rank, name, color, score, you) => {
        postScore(rank,name,color,score, you)
    });

    this.socket.on('player ready', (rank) => {
        postReady(rank);
    })
    this.socket.on('draw round', (round) => {
        this.panel_ctx.clearRect(round_window['x'], round_window['y'], round_window['width'], round_window['height']);
        this.panel_ctx.fillStyle = 'white';
        this.panel_ctx.fillRect(round_window['x'], round_window['y'], round_window['width'], round_window['height']);
        this.panel_ctx.font = "25px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText('Round ' + round + '/' + CONSTANTS.GAME_ROUNDS, round_window['x']+2,round_window['y'] + 25);
    })

    this.socket.on('draw timer', (time) => {
        postTime(time)
    });

    this.socket.on('draw prepare', () => {
        postInfo("Preparing next game...", "",true);
        postTimeDescrip("seconds until autostart");
    })

    // Draw game for client
    this.socket.on('draw guess city', (city) => {
        postInfo("Locate this city!", city, false)
        postTimeDescrip("seconds remaining")
    });

    this.panel.addEventListener('click', function(evt) {
        var mousePos = getMousePosInPanel(this.panel, evt);
        if (isInside(mousePos,ready_button)) {
            this.socket.emit('playerReady')
        }
    }, false);

    //Function to get the mouse position
    function getMousePosInPanel(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    //Function to check whether a point is inside a rectangle
    function isInside(pos, rect){
        return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
    }



    // Draw game for client
    this.socket.on('draw reveal this.panel', (time, city, round) => {
        this.panel_ctx.clearRect(0, 0, this.panel.width, this.panel.height/2);
        this.panel_ctx.fillStyle = "#e3e4e6";
        this.panel_ctx.fillRect(0, 0, this.panel.width, this.panel.height/2);
        this.panel_ctx.font = "20px Arial";
        this.panel_ctx.fillStyle = "black";
        this.panel_ctx.fillText(city, 20, 80)
        this.panel_ctx.font = "15px Arial";
        this.panel_ctx.fillText("Next round in: " + time , 40,120);
        this.panel_ctx.fillText("Round " + round + "/" + CONSTANTS.GAME_ROUNDS, 230, 18)
    });
}

modules.export = Panel