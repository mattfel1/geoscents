module.exports = {

    // Players
    COLORS: ['#1f77b4','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf', 'blue', 'green', 'red', 'magenta', 'black'],
    TRUTH_COLOR: 'white',

    // Map and Panel
    MAP_WIDTH: 1400,
    MAP_HEIGHT: 824,
    PANEL_WIDTH: 600,
    PANEL_HEIGHT: 824,
    ZERO_LAT: 77.0*Math.PI/180, // Latitude of top edge of map
    MAX_LAT: -65.0*Math.PI/180, // Latitude of bottom edge of map

    // FSM
    REVEAL_STATE: 'reveal',
    REVEAL_DURATION: 7,
    GUESS_STATE: 'guess',
    GUESS_DURATION: 10,
    SETUP_STATE: 'setup',
    IDLE_STATE: 'idle',
    PREPARE_GAME_STATE: 'prepare',
    PREPARE_GAME_DURATION: 45,
    ASK_READY_STATE: 'askready',
    SCROLL_THRESHOLD: 25, // Number of frames mobile user can press for that distinguishes a "click" from a "scroll"


    // Visuals and score
    BGCOLOR: "#E6E6FA",
    LOBBY_COLOR: "#e3e4e6",
    GUESS_COLOR: 'green',
    REVEAL_COLOR: 'red',
    SCORE_SCALE: 10000,
    POINT_RADIUS: 3,
    BUBBLE_RADIUS: 15,
    BUBBLE_WIDTH: 3,
    FPS: 30,

    // Rooms
    GAME_ROUNDS: 10,
    ROOM_CAPACITES: [6, 6, 6, 4, 4, 4, 2, 2, 2],

    // Chat
    MAX_GAME_HIST: 100,
    MAX_CHAT_HIST: 100
}
