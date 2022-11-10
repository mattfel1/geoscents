module.exports = {
    // Players
    COLORS: ["#FF0000", "#FF8080", "#E377C2", "#FF00FF", "#9467BD", "#009EAF", "#00D8D8", "#6BAB6B", "#2CA02C", "#00D47B", "#8080FF", "#1F77B4", "#0000FF", "#ADAD1F", "#E0E000", "#808080", "#995C00", "#8C564B"],
    TRUTH_COLOR: 'white',
    AVERAGE_NAMES: ["Joe", "Jane", "Chump", "Dog", "Cat", "Matt", "Elyse", "Avery", "Erica", "Jimbo", "Todd", "Sammy", "Jose", "Errol", "Timmy",
        "Bojack", "Avon", "Tyrion", "Bob", "Marie", "Mohammed", "Fatima", "Pierre", "Helen", "Sebastian", "Benny", "Dwayne", "Darius", "Hugo",
        "Emma", "Chuck", "Mama", "Papa", "Uncle", "Aunt", "Gramps", "Granny", "Ronald", "Clown", "Goober", "Daisy", "GZA", "Omar", "Volodymyr", "Kiwi", "Lalo", "Tuco",
        "Saul", "Pops", "Soyboy"
    ],
    KILL_MSGS: ["PLAYER has killed BOT!", "PLAYER killed BOT in the study using a candlestick!", "PLAYER unplugged BOT!",
        "PLAYER murdered BOT in cold blood!", "PLAYER devoured BOT for dinner!", "PLAYER annihilated BOT!",
        "PLAYER locked BOT in the basement and threw away the key!", "PLAYER made BOT swim with the fishes!", "PLAYER ripped BOT to shreds!",
        "PLAYER sent BOT to a farm upstate", "PLAYER disintegrated BOT in a vat of hydrofluoric acid!",
        "PLAYER drowned BOT in its own tears!", "PLAYER pulled BOT apart limb by limb!", "PLAYER unravelled BOT thread by thread.",
        "PLAYER sacrificed BOT to the gods.", "PLAYER ran over BOT with a Subaru!", "PLAYER pushed BOT into an alligator pit!",
        "PLAYER sent BOT to Belize.", "PLAYER euthanized BOT!", "PLAYER sent BOT to Davy Jones's Locker!", "PLAYER turned BOT into worm food!",
        "PLAYER sent some Daleks to exterminate BOT", "PLAYER fed BOT into the wood chipper, like at the end of the Fargo movie!", "PLAYER pushed BOT out of an airplane with a faulty parachute!"
    ],
    BIRTH_MSGS: ["PLAYER has given birth to BOT!", "PLAYER created BOT!", "PLAYER plugged in BOT!", "PLAYER manufactured BOT!",
        "PLAYER spawned BOT!", "PLAYER produced BOT!", "PLAYER cooked up BOT in a top secret lab!", "PLAYER whipped up BOT using some eggs, flour, water, and yeast!",
        "PLAYER opened up the cage and let BOT out to play!", "PLAYER unleashed BOT unto the world, causing relentless damage!", "PLAYER brewed up a batch of BOT!",
        "PLAYER sculpted BOT from molding clay!", "PLAYER painted a happy little BOT!", "PLAYER patched together body parts to form BOT... IT'S ALIVE!!",
        "PLAYER ripped out a rib and used it to create BOT.", "PLAYER picked up BOT from the pound and brought it here!",
        "PLAYER summoned BOT from the afterlife to terrorize everyone!", "BOT burst from PLAYER's chest, like an Alien!",
        "PLAYER woke up BOT from suspended animation!", "PLAYER teleported Bot from Dimension C-132 to this universe!",
        "PLAYER busted BOT out of prison!"
    ],

    DEBUG_MODE: 0,

    // Map and Panel
    EARTH_RADIUS: 6371, // Earth radius in km
    MAP_WIDTH: 1530,
    MAP_HEIGHT: 900,

    WORLD: 'World',
    WORLD_CAPITALS: 'World Capitals',
    PRIVATE: 'Private',
    LOBBY: 'Lobby',
    NAMERICA: 'N. America',
    EUROPE: 'Europe',
    ASIA: 'Asia',
    OCEANIA: 'Oceania',
    TRIVIA: 'Trivia',
    SPECIAL: 'Daily Country',
    AFRICA: 'Africa',
    SAMERICA: "S. America",
    VERT_WRITE_CELLS: 30,
    HORZ_WRITE_CELLS: 15,


    // FSM
    REVEAL_STATE: 'reveal',
    REVEAL_DURATION: 5,
    REVEAL_DURATION_GRIND: 1.7,
    GUESS_STATE: 'guess',
    GUESS_DURATION: 10,
    SETUP_STATE: 'setup',
    IDLE_STATE: 'idle',
    PREPARE_GAME_STATE: 'prepare',
    PREPARE_GAME_DURATION: 45,
    BEGIN_GAME_STATE: 'begingame',
    BEGIN_GAME_DURATION: 5,
    BEGIN_GAME_DURATION_GRIND: 2.5,
    ASK_READY_STATE: 'askready',
    LOBBY_STATE: 'lobby',
    SCROLL_THRESHOLD: 25, // Number of frames mobile user can press for that distinguishes a "click" from a "scroll"


    // Visuals and score
    BGCOLOR: "#E6E6FA",
    SCOREBOX_COLOR: "#E6E6E6",
    NUM_GLOBES: 180 / 5,
    LOBBY_COLOR: "#e3e4e6",
    BEGIN_COLOR: "#388EE6",
    MAP_BUTTON_COLOR: "#9CD69F",
    GUESS_COLOR: '#17eb5e',
    REVEAL_COLOR: '#ffad99',
    SCORE_SCALE: 10000,
    STAR_POINTS: 7,
    STAR_INNER_RADIUS: 3,
    STAR_OUTER_RADIUS: 7,
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
    LOGISTIC_C4: 1 / 50,
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
    FAMESCORE: 6500,
    DEBUGFAMESCORE: 100,
    PERFECT_SCORE: 6600,
    DEBUG_PERFECT_SCORE: 900,
    CLOWNSCORE: 5,


    // Rooms
    GAME_ROUNDS: 11,
    DEBUG_GAME_ROUNDS: 5,
    RECORD_INIT_RANGE: 700,
    RECORD_INIT_BASE: 480,
    RECORD_DELTA_RANGE: 200,
    MAX_INACTIVE: 10, // Rounds of no click before you get booted
    MAX_S_INACTIVE: 2400, // seconds * fps spent in lobby before you get booted
    INIT_RECORD: {
        'record1': 0,
        'recordName1': '-',
        'recordColor1': 'black',
        'recordBroken1': false,
        'record2': 0,
        'recordName2': '-',
        'recordColor2': 'black',
        'recordBroken2': false,
        'record3': 0,
        'recordName3': '-',
        'recordColor3': 'black',
        'recordBroken3': false,
        'record4': 0,
        'recordName4': '-',
        'recordColor4': 'black',
        'recordBroken4': false,
        'record5': 0,
        'recordName5': '-',
        'recordColor5': 'black',
        'recordBroken5': false
    },

    // Scoring
    PERCENT_AT_MAX_TIME: 0.333, // Percent of full credit if you answer in the last second
    NUM_SECONDS_FULL_SCORE: 1.7, // Number of seconds before you start paying a time penalty

    // Chat
    MAX_GAME_HIST: 100,
    MAX_CHAT_HIST: 100,
    SPAMPERIOD: 5, // seconds
    MAX_MSG_PER_SPAMPERIOD: 6,
    MAX_CHAR_PER_SPAMPERIOD: 4000,
    MAX_BOT_TOGGLE_PER_SPAMPERIOD: 5,
    PROFANITY_REGEX: ['\\bs+[\ \_.-]*h+[\ \_.-]*[1i]+[\ \_.-]*t+s*\\b',
        '\\bb+[\ \_.-]*u+[\ \_.-]*l+[\ \_.-]*s+[\ \_.-]*h+[\ \_.-]*[1i]+[\ \_.-]*t+s*\\b',
        'f+[\ \_.-]*u+[\ \_.-]*c+[\ \_.-]*k+',
        'f+[\ \_.-]*u+[\ \_.-]*c+[\ \_.-]*k+i+[\ \_.-]*n+[\ \_.-]*g+',
        '\\bf+[\ \_.-]*u+[\ \_.-]*c+[\ \_.-]*k+i+[\ \_.-]*n+\\b',
        '\\bb+[\ \_.-]*i+[\ \_.-]*t+[\ \_.-]*c+[\ \_.-]*h+\\b',
        '\\bb+[\ \_.-]*i+[\ \_.-]*t+[\ \_.-]*c+[\ \_.-]*h+[\ \_.-]*e+[\ \_.-]*s+\\b',
        '\\bc+[\ \_.-]*u+[\ \_.-]*n+[\ \_.-]*t+\\b',
        '\\bf+[\ \_.-]*[4a]+[\ \_.-]*g+[\ \_.-]*[oi1]+[\ \_.-]*t+[\ \_.-]*\\b',
        '\\bp+[\ \_.-]*e+[\ \_.-]*n+[\ \_.-]*i+[\ \_.-]*s+\\b',
        '\\bv+[\ \_.-]*a+[\ \_.-]*g+[\ \_.-]*i+[\ \_.-]*n+[\ \_.-]*a+\\b',
        '\\bn+[\ \_.-]*[i1y!]+[\ \_.-]*gg+[\ \_.-]*[3ei]+[\ \_.-]*r+s*\\b',
        '\\bn+[\ \_.-]*[i1y!]+[\ \_.-]*g+[\ \_.-]*[a4]+[\ \_.-]*s*\\b',
        '\\br+[\ \_.-]*a+[\ \_.-]*p+[\ \_.-]*e+r*s*\\b'
    ]
}