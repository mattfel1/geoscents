const CONSTANTS = require('../resources/constants.js')

class History {
    constructor(socket) {
        this.socket = socket;
        this.myRoom = CONSTANTS.LOBBY;
        this.histCount = 0;
    }

    breakHistory(room, winner, score, color, record) {
        const myRoom = this.myRoom;
        if (room == myRoom) {
            var newRecord = "";
            if (record) newRecord = " 🎉 NEW RECORD 🎉";
            var assembled = "<br>******* " + myRoom + " WINNER: <font color=\"" + color + "\">" + winner + " (" + score + " points)</font>" + newRecord + " *******<br>"
            var final_message = $("<font style=\"font-size:20px;\" />").html(assembled);
            $('#gamehist').prepend(" ");
            $('#gamehist').prepend(final_message);
            this.histcount = this.histcount + 1;
            // if (this.histcount > CONSTANTS.MAX_GAME_HIST) {
            //     $('#gamehist').children().last().remove();
            //     this.histcount = this.histcount - 1;
            // }
        }
    }

    drawChart(hist, winner, color, room, max) {
        const width = 560;
        const height = 210;
        const playersHistory = new Map(JSON.parse(hist));
        // based on https://codepen.io/dmmfll/pen/vGbZrK
        var graph = `<br><div class="graph-container">
<font color="${color}">${winner}</font> wins ${room} with ${max} points!
  <div class="chart-box">
    <svg viewBox="0 0 ${width} ${height}" class="chart">`

        const graph_footer = `  </svg>
    <div class="x-labels" >
      <div>0</div>
      <div>1</div>
      <div>2</div>
      <div>3</div>
      <div>4</div>
      <div>5</div>
      <div>6</div>
      <div>7</div>
      <div>8</div>
      <div>9</div>
      <div>10</div>
      <div>11</div>
    </div>
    <div class="y-labels">
      <div class="y-label top">${max}</div>
    </div>
  </div>
</div>`;
        var i = 0;
        playersHistory.forEach((hist, player) => {
            i = i + 1;
            Object.keys(hist).forEach((round) => {
                const x1 = (round) * ((width) / (CONSTANTS.GAME_ROUNDS+1));
                var y1 = height;
                if ((round-1) in hist) {
                    y1 = height - height * (hist[round - 1] / (Math.max(max, 1)));
                }
                const x2 = (1+parseInt(round)) * ((width) / (CONSTANTS.GAME_ROUNDS+1));
                const y2 = height - height*(hist[round] / (Math.max(max,1)));
                graph = graph + `
<polyline
    fill="none"
    stroke="${player.color}"
    stroke-width="2"
    points="
   ${x1}, ${y1}
   ${x2}, ${y2}
    "
    />
`
            });
        });


        graph = graph + graph_footer;
        $('#gamehist').prepend(graph);
        this.histcount = this.histcount + 1;
        // if (this.histcount > CONSTANTS.MAX_GAME_HIST) {
        //     $('#gamehist').children().last().remove();
        //     this.histcount = this.histcount - 1;
        // }
    }
    addHistory(room, payload) {
        if (room == this.myRoom) {
            var assembled = payload;
            var final_message = $("<font style=\"font-size:20px;\" />").html(assembled);
            $('#gamehist').prepend(final_message);
            this.histcount = this.histcount + 1;
            // if (this.histcount > CONSTANTS.MAX_GAME_HIST) {
            //     $('#gamehist').children().last().remove();
            //     this.histcount = this.histcount - 1;
            // }
        }

    }
}

module.exports = History