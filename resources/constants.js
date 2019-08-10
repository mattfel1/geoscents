module.exports = {

    // Players
    COLORS: ['#1f77b4','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'],
    TRUTH_COLOR: '#8b4c00',

    // Map and Panel
    MAP_WIDTH: 1200,
    MAP_HEIGHT: 707,
    PANEL_WIDTH: 800,
    PANEL_HEIGHT: 707,
    ZERO_LAT: 77.0*Math.PI/180, // Latitude of top edge of map
    MAX_LAT: -65.0*Math.PI/180, // Latitude of bottom edge of map

    // FSM
    REVEAL_STATE: 'reveal',
    REVEAL_DURATION: 4,
    GUESS_STATE: 'guess',
    GUESS_DURATION: 8,
    SETUP_STATE: 'setup',
    IDLE_STATE: 'idle',
    PREPARE_GAME_STATE: 'prepare',
    PREPARE_GAME_DURATION: 20,
    ASK_READY_STATE: 'askready',

    // Visuals and score
    BGCOLOR: "#E6E6FA",
    SCORE_SCALE: 10000,
    POINT_RADIUS: 3,
    BUBBLE_RADIUS: 15,
    BUBBLE_WIDTH: 3,
    FPS: 30,

    // Rooms
    GAME_ROUNDS: 10,
    ROOM_CAPACITES: [6, 6, 6, 4, 4, 4, 2, 2, 2],

    // Chat
    GAME_HISTORY: 18,
    MAX_GAME_HIST: 16,
    MAX_CHAT_HIST: 16
}
