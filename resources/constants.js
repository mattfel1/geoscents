module.exports = {

    // Players
    COLORS: ["red", "blue", "purple", "magenta", "grey", "orange", "green", "#1f77b4", "#2ca02c", "#995c00", "#9467bd", "#8c564b", "#e377c2", "#adad1f", "#17becf"],
    TRUTH_COLOR: 'white',

    // Map and Panel
    EARTH_RADIUS: 6371, // Earth radius in km
    MAP_WIDTH: 1530,
    MAP_HEIGHT: 900,
    WORLD_MIN_LAT: 77.0, // Latitude of top edge of map
    WORLD_MAX_LAT: -65.5, // Latitude of bottom edge of map
    WORLD_MIN_LON: -180, // Latitude of top edge of map
    WORLD_MAX_LON: 180, // Latitude of bottom edge of map
    WORLD_LAT_TS: 0,
    US_MIN_LAT: 56.0, // Latitude of top edge of map
    US_MAX_LAT: 10.0, // Latitude of bottom edge of map
    US_MIN_LON: -141.0, // Latitude of top edge of map
    US_MAX_LON: -43.0, // Latitude of bottom edge of map
    US_LAT_TS: 0,
    EURO_MIN_LAT: 66.3, // Latitude of top edge of map
    EURO_MAX_LAT: 35.0, // Latitude of bottom edge of map
    EURO_MIN_LON: -36, // Latitude of top edge of map
    EURO_MAX_LON: 52, // Latitude of bottom edge of map
    EURO_LAT_TS: 0,
    AFRICA_MIN_LAT: 41.0, // Latitude of top edge of map
    AFRICA_MAX_LAT: -36.0, // Latitude of bottom edge of map
    AFRICA_MIN_LON: -60, // Latitude of top edge of map
    AFRICA_MAX_LON: 82, // Latitude of bottom edge of map  
    AFRICA_LAT_TS: 0,
    ASIA_MIN_LAT: 61.0, // Latitude of top edge of map
    ASIA_MAX_LAT: -0.5, // Latitude of bottom edge of map
    ASIA_MIN_LON: 25, // Latitude of top edge of map
    ASIA_MAX_LON: 158, // Latitude of bottom edge of map
    ASIA_LAT_TS: 0,
    SAMERICA_MIN_LAT: 24.0, // Latitude of top edge of map
    SAMERICA_MAX_LAT: -56.0, // Latitude of bottom edge of map
    SAMERICA_MIN_LON: -140, // Latitude of top edge of map
    SAMERICA_MAX_LON: 17, // Latitude of bottom edge of map
    SAMERICA_LAT_TS: 0,
    OCEANIA_MIN_LAT: 10.5, // Latitude of top edge of map
    OCEANIA_MAX_LAT: -48.0, // Latitude of bottom edge of map
    OCEANIA_MIN_LON: 69, // Latitude of top edge of map
    OCEANIA_MAX_LON: 180, // Latitude of bottom edge of map
    OCEANIA_LAT_TS: 0,
    VERT_WRITE_CELLS: 30,
    HORZ_WRITE_CELLS: 15,


    // FSM
    REVEAL_STATE: 'reveal',
    REVEAL_DURATION: 7,
    GUESS_STATE: 'guess',
    GUESS_DURATION: 10,
    SETUP_STATE: 'setup',
    IDLE_STATE: 'idle',
    PREPARE_GAME_STATE: 'prepare',
    PREPARE_GAME_DURATION: 45,
    BEGIN_GAME_STATE: 'begingame',
    BEGIN_GAME_DURATION: 5,
    ASK_READY_STATE: 'askready',
    LOBBY_STATE: 'lobby',
    SCROLL_THRESHOLD: 25, // Number of frames mobile user can press for that distinguishes a "click" from a "scroll"


    // Visuals and score
    BGCOLOR: "#E6E6FA",
    SCOREBOX_COLOR: "#E6E6E6",
    NUM_GLOBES: 180/5,
    LOBBY_COLOR: "#e3e4e6",
    BEGIN_COLOR: "#388EE6",
    MAP_BUTTON_COLOR: "#9CD69F",
    GUESS_COLOR: '#17eb5e',
    REVEAL_COLOR: '#ffad99',
    SCORE_SCALE: 10000,
    STAR_POINTS: 7,
    STAR_INNER_RADIUS: 5,
    STAR_OUTER_RADIUS: 11,
    POINT_RADIUS: 3,
    BUBBLE_RADIUS: 15,
    MIN_BUBBLE_RADIUS: 9,
    BUBBLE_WIDTH: 3,
    LONGCITY: 40, // # characters for city string to be considered "long"
    FPS: 30,
    BUTTONS_HEIGHT: 40,
    MULTIPLIER: 50,
    LOGISTIC_C1: 0.9,
    LOGISTIC_C2: 7,
    LOGISTIC_C3: 30,
    LOGISTIC_C4: 1/50,
    GAUSS_C1: 1000,
    INFO_BIG_FONT: 35,
    INFO_X: 18,
    BUTTONS_HEIGHT: 45,
    INFO_SPACING: 38,
    INFO_BIG_FONT: 28,
    INFO_LITTLE_FONT: 20,
    BUTTONS_SPACING: 15,
    BUTTONS_WIDTH: 252,
    BUTTONS_FONT: 22,


    // Rooms
    GAME_ROUNDS: 10,
    RECORD_INIT_RANGE: 700,
    RECORD_INIT_BASE: 480,
    RECORD_DELTA_RANGE: 200,
    WORLD: 'World',
    LOBBY: 'Lobby',
    US: 'N. America',
    EURO: 'Europe',
    ASIA: 'Asia',
    OCEANIA: 'Oceania',
    AFRICA: 'Africa',
    SAMERICA: "S. America",
    MAX_INACTIVE: 10, // Rounds of no click before you get booted
    MAX_S_INACTIVE: 600, // seconds * fps spent in lobby before you get booted
    INIT_RECORD: {'record1': 0, 'recordName1': '-', 'recordColor1': 'black', 'recordBroken1': false, 'record2': 0, 'recordName2': '-', 'recordColor2': 'black', 'recordBroken2': false, 'record3': 0, 'recordName3': '-', 'recordColor3': 'black', 'recordBroken3': false},

    // Chat
    MAX_GAME_HIST: 100,
    MAX_CHAT_HIST: 100,
    PROFANITY: ['shit', 'damn', 'fuck', 'bitch', 'cunt', ' ass ', 'asshole', 'penis', 'vagina', 'fuuck', 'fuuuck', 'shiit'] // TODO: Use regex
}
