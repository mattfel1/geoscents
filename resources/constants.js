module.exports = {

    // Players
    COLORS: ['#1f77b4','#2ca02c','#995c00','#9467bd','#8c564b','#e377c2','#737373','#adad1f','#17becf', 'blue', 'green', 'red', 'magenta', 'black'],
    RANDOM_NAMES: ['Emma','Liam','Noah','Olivia','Ava','Isabella','Sophia','Elijah','Logan','Mia','Mason','James','Aiden','Ethan','Lucas','Jacob',
        'Michael','Matthew','Benjamin','Amelia','Charlotte','Alexander','William','Daniel','Jayden','Merica!','happy','lucky','sleepy','funky',
        'KnuckleHed','geoNow!','fish','dog','cat','meow','ruff','woof','L337','AAAAAAAAAA','knightmare','asdf','aoeu','qwerty'],
    TRUTH_COLOR: 'white',

    // Map and Panel
    MAP_WIDTH: 1350,
    MAP_HEIGHT: 794,
    PANEL_WIDTH: 550,
    PANEL_HEIGHT: 794,
    WORLD_ZERO_LAT: 77.0*Math.PI/180, // Latitude of top edge of map
    WORLD_MAX_LAT: -65.0*Math.PI/180, // Latitude of bottom edge of map
    WORLD_MIN_LON: -180, // Latitude of top edge of map
    WORLD_MAX_LON: 180, // Latitude of bottom edge of map
    WORLD_LAT_TS: 6,
    US_ZERO_LAT: 53.0*Math.PI/180, // Latitude of top edge of map
    US_MAX_LAT: 20.0*Math.PI/180, // Latitude of bottom edge of map
    US_MIN_LON: -130.0, // Latitude of top edge of map
    US_MAX_LON: -58.0, // Latitude of bottom edge of map    US_LAT_TS: 0,
    US_LAT_TS: 36,
    EURO_ZERO_LAT: 64.0*Math.PI/180, // Latitude of top edge of map
    EURO_MAX_LAT: 27.0*Math.PI/180, // Latitude of bottom edge of map
    EURO_MIN_LON: -22, // Latitude of top edge of map
    EURO_MAX_LON: 73, // Latitude of bottom edge of map    euro_LAT_TS: 0,
    EURO_LAT_TS: 45,

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
    LOBBY_STATE: 'lobby',
    SCROLL_THRESHOLD: 25, // Number of frames mobile user can press for that distinguishes a "click" from a "scroll"


    // Visuals and score
    BGCOLOR: "#E6E6FA",
    NUM_GLOBES: 180/5,
    LOBBY_COLOR: "#e3e4e6",
    MAP_BUTTON_COLOR: "#9CD69F",
    GUESS_COLOR: '#17eb5e',
    REVEAL_COLOR: '#ffad99',
    SCORE_SCALE: 10000,
    POINT_RADIUS: 3,
    BUBBLE_RADIUS: 15,
    BUBBLE_WIDTH: 3,
    LONGCITY: 40, // # characters for city string to be considered "long"
    FPS: 30,

    // Rooms
    GAME_ROUNDS: 10,
    RECORD_INIT_RANGE: 700,
    RECORD_INIT_BASE: 450,
    WORLD: 'World',
    LOBBY: 'Lobby',
    US: 'N. America',
    EURO: 'Eurasia',
    MAX_INACTIVE: 15, // Rounds of no click before you get booted
    MAX_S_INACTIVE: 600*30, // seconds * fps spent in lobby before you get booted

    // Chat
    MAX_GAME_HIST: 100,
    MAX_CHAT_HIST: 100,
    PROFANITY: ['shit', 'damn', 'fuck', 'bitch', 'cunt', ' ass ', 'asshole', 'fuuck', 'fuuuck', 'shiit'] // TODO: Use regex
}
