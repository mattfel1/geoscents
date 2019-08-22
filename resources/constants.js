module.exports = {

    // Players
    COLORS: ['#1f77b4','#2ca02c','#995c00','#9467bd','#8c564b','#e377c2','#737373','#adad1f','#17becf', 'blue', 'green', 'red', 'magenta', 'black'],
    RANDOM_NAMES: ['Emma','Liam','Noah','Olivia','Ava','Isabella','Sophia','Elijah','Logan','Mia','Mason','James','Aiden','Ethan','Lucas','Jacob',
        'Michael','Matthew','Benjamin','Amelia','Charlotte','Alexander','William','Daniel','Jayden','Merica!','happy','lucky','sleepy','funky',
        'KnuckleHed','geoMASTA','fish','dog','cat','meow','ruff','woof','AAAAAAAAAA','knightmare','asdf','aoeu','qwerty','Naughty', 'xkcd',
        'hector', 'dz', 'swed', 'tobies', 'masta', 'coooool', 'BLOOP!', 'Shwoop'],
    TRUTH_COLOR: 'white',

    // Map and Panel
    MAP_WIDTH: 1530,
    MAP_HEIGHT: 900,
    WORLD_ZERO_LAT: 77.0*Math.PI/180, // Latitude of top edge of map
    WORLD_MAX_LAT: -65.0*Math.PI/180, // Latitude of bottom edge of map
    WORLD_MIN_LON: -180, // Latitude of top edge of map
    WORLD_MAX_LON: 180, // Latitude of bottom edge of map
    WORLD_LAT_TS: 0,
    US_ZERO_LAT: 53.0*Math.PI/180, // Latitude of top edge of map
    US_MAX_LAT: 20.0*Math.PI/180, // Latitude of bottom edge of map
    US_MIN_LON: -130.0, // Latitude of top edge of map
    US_MAX_LON: -58.0, // Latitude of bottom edge of map
    US_LAT_TS: 0,
    EURO_ZERO_LAT: 64.0*Math.PI/180, // Latitude of top edge of map
    EURO_MAX_LAT: 27.0*Math.PI/180, // Latitude of bottom edge of map
    EURO_MIN_LON: -22, // Latitude of top edge of map
    EURO_MAX_LON: 73, // Latitude of bottom edge of map
    EURO_LAT_TS: 0,
    AFRICA_ZERO_LAT: 41.0*Math.PI/180, // Latitude of top edge of map
    AFRICA_MAX_LAT: -36.0*Math.PI/180, // Latitude of bottom edge of map
    AFRICA_MIN_LON: -60, // Latitude of top edge of map
    AFRICA_MAX_LON: 82, // Latitude of bottom edge of map  
    AFRICA_LAT_TS: 0,

    // FSM
    REVEAL_STATE: 'reveal',
    REVEAL_DURATION: 0,//7,
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
    EURO: 'Eurasia',
    AFRICA: 'Africa',
    MAX_INACTIVE: 10, // Rounds of no click before you get booted
    MAX_S_INACTIVE: 600, // seconds * fps spent in lobby before you get booted
    INIT_RECORD: {'record1': 0, 'recordName1': '-', 'recordColor1': 'black', 'recordBroken1': false, 'record2': 0, 'recordName2': '-', 'recordColor2': 'black', 'recordBroken2': false, 'record3': 0, 'recordName3': '-', 'recordColor3': 'black', 'recordBroken3': false},

    // Chat
    MAX_GAME_HIST: 100,
    MAX_CHAT_HIST: 100,
    PROFANITY: ['shit', 'damn', 'fuck', 'bitch', 'cunt', ' ass ', 'asshole', 'penis', 'vagina', 'fuuck', 'fuuuck', 'shiit'] // TODO: Use regex
}
