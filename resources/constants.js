module.exports = {

    // Players
    COLORS: ["red", "blue", "purple", "magenta", "grey", "orange", "green", "#1f77b4", "#2ca02c", "#995c00", "#9467bd", "#8c564b", "#e377c2", "#adad1f", "#17becf"],
    TRUTH_COLOR: 'white',
    AVERAGE_NAMES: ["Joe", "Jane", "Chump", "Dog", "Cat", "Matt", "Elyse", "Avery", "Erica", "Jimbo", "Todd", "Sammy", "Jose", "Errol", "Timmy",
        "Bojack", "Avon", "Tyrion", "Bob", "Marie", "Mohammed", "Fatima", "Pierre", "Helen", "Sebastian", "Benny", "Dwayne", "Darius", "Hugo",
        "Emma", "Chuck", "Mama", "Papa", "Uncle", "Aunt", "Gramps", "Granny", "Ronald", "Clown", "Goober", "Daisy", "GZA", "Omar", "Volodymyr", "Kiwi"
    ],
    KILL_MSGS: ["PLAYER has killed BOT!", "PLAYER killed BOT in the study using a candlestick!", "PLAYER unplugged BOT!",
        "PLAYER murdered BOT in cold blood!", "PLAYER devoured BOT for dinner!", "PLAYER annihilated BOT!",
        "PLAYER locked BOT in the basement and threw away the key!", "PLAYER made BOT swim with the fishes!", "PLAYER ripped BOT to shreds!",
        "PLAYER sent BOT to a farm upstate", "PLAYER disintegrated BOT in a vat of hydrofluoric acid!",
        "PLAYER drowned BOT in its own tears!", "PLAYER pulled BOT apart limb by limb!", "PLAYER unravelled BOT thread by thread.",
        "PLAYER sacrificed BOT to the gods.", "PLAYER ran over BOT with a Subaru!", "PLAYER pushed BOT into an alligator pit!",
        "PLAYER sent BOT to Belize.", "PLAYER euthanized BOT!", "PLAYER sent BOT to Davy Jones's Locker!", "PLAYER turned BOT into worm food!",
        "PLAYER sent some Daleks to exterminate BOT", "PLAYER fed BOT into the wood chipper, like at the end of the Fargo movie!"
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
    WORLD_EASY: 'World Capitals',
    PRIVATE: 'Private',
    LOBBY: 'Lobby',
    US: 'N. America',
    EURO: 'Europe',
    ASIA: 'Asia',
    OCEANIA: 'Oceania',
    MISC: 'Trivia',
    SPECIAL: 'Daily Country',
    AFRICA: 'Africa',
    SAMERICA: "S. America",
    SPECIAL_COUNTRIES: ["Ukraine", "Japan", "Canada", "Argentina", "Kenya", "Australia", "Romania", "Egypt", "Peru", "Indonesia",
        "Spain", "China", "United States", "Iran", "Brazil", "Mexico", "India", "United Kingdom", "Italy", "Germany", "France",
        "Nigeria", "South Africa", "Democratic Republic of the Congo", "Morocco"
    ],
    SPECIAL_JOES: ["Zelensky", "Kishida", "Trudeau", "Fernandez", "Kenyatta", "Morrison", "Iohannis", "el-Sisi", "Castillo", "Widodo",
        "Sánchez", "Xi", "Biden", "Raisi", "Bolsonaro", "AMLO", "Modi", "Johnson", "Mattarella", "Scholz", "Macron", "Buhari", "Ramaphosa", "Tshisekedi", "Akhannouch"
    ],
    SPECIAL_WELCOMES: ["ласкаво просимо (laskavo prosymo)", "いらっしゃいませ (irasshaimase)",
        "Welcome/Bienvenue", "Bienvenido", "Karibu/Welcome", "Welcome", "Bine ati venit", "أهلا بك (Ahlan bik)", "Bienvenido", "Selamat datang",
        "Bienvenido", "欢迎光临 (Huānyíng guānglín)", "Welcome", "خوش آمدی (xoš âmadi)", "Receber", "Bienvenido", "Welcome/स्वागत हे(svaagat he)", "Welcome",
        "Benvenuto/Benvenuta", "Willkommen", "Bienvenue", "Welcome", "Siyakwamukela/Wamkelekile/Welkom", "Bienvenue", "أهلا بك ('ahlan bik)"
    ],

    // IDs generally used for map pngs and css div classes
    MAP_TO_ID: {
        "World": "world",
        "Trivia": "misc",
        "World Capitals": "world_easy",
        "N. America": "us",
        "Europe": "euro",
        "Oceania": "oceania",
        "Asia": "asia",
        "Africa": "africa",
        "S. America": "samerica",
    },

    MAP_BOUNDS: {
        "World": {
            "min_lon": -180,
            "max_lon": 180,
            "max_lat": -65.5, // Bottom edge of map (max row pixel coordinate)
            "min_lat": 77.2, // Top edge of map (min row pixel coordinate)
            "lat_ts": 0
        },
        "World Capitals": {
            "min_lon": -180,
            "max_lon": 180,
            "max_lat": -65.5,
            "min_lat": 77.2,
            "lat_ts": 0
        },
        "Trivia": {
            "min_lon": -180,
            "max_lon": 180,
            "max_lat": -56.0,
            "min_lat": 80.85,
            "lat_ts": 0
        },
        "N. America": {
            "min_lon": -141,
            "max_lon": -43,
            "max_lat": 10.0,
            "min_lat": 56.0,
            "lat_ts": 0
        },
        "S. America": {
            "min_lon": -140,
            "max_lon": 17,
            "max_lat": -56.0,
            "min_lat": 24.1,
            "lat_ts": 0
        },
        "Europe": {
            "min_lon": -36.3,
            "max_lon": 52,
            "max_lat": 35.0,
            "min_lat": 66.3,
            "lat_ts": 0
        },
        "Africa": {
            "min_lon": -60,
            "max_lon": 82,
            "max_lat": -36.3,
            "min_lat": 41.0,
            "lat_ts": 0
        },
        "Asia": {
            "min_lon": 25,
            "max_lon": 158,
            "max_lat": -1,
            "min_lat": 61.05,
            "lat_ts": 0
        },
        "Oceania": {
            "min_lon": 92,
            "max_lon": 252,
            "max_lat": -54.5,
            "min_lat": 28,
            "lat_ts": 0
        },
        "Argentina": {
            "min_lon": -102,
            "max_lon": -20,
            "max_lat": -56.5,
            "min_lat": -20,
            "lat_ts": 0
        },
        "Australia": {
            "min_lon": 97,
            "max_lon": 170,
            "max_lat": -45.5,
            "min_lat": -8,
            "lat_ts": 0
        },
        "Canada": {
            "min_lon": -152.1,
            "max_lon": -40,
            "max_lat": 38,
            "min_lat": 72.5,
            "lat_ts": 0
        },
        "Japan": {
            "min_lon": 110,
            "max_lon": 164.5,
            "max_lat": 23.5,
            "min_lat": 49,
            "lat_ts": 0
        },
        "Kenya": {
            "min_lon": 30,
            "max_lon": 49,
            "max_lat": -5.33,
            "min_lat": 5.9,
            "lat_ts": 0
        },
        "Romania": {
            "min_lon": 18.8,
            "max_lon": 33.7,
            "max_lat": 43,
            "min_lat": 49,
            "lat_ts": 0
        },
        "Ukraine": {
            "min_lon": 17.4,
            "max_lon": 45.3,
            "max_lat": 43.18,
            "min_lat": 54,
            "lat_ts": 0
        },
        "Peru": {
            "min_lon": -92,
            "max_lon": -55,
            "max_lat": -19.5,
            "min_lat": 2,
            "lat_ts": 0
        },
        "Egypt": {
            "min_lon": 16.5,
            "max_lon": 41.7,
            "max_lat": 20.81,
            "min_lat": 34,
            "lat_ts": 0
        },
        "Indonesia": {
            "min_lon": 84.5,
            "max_lon": 151,
            "max_lat": -23.5,
            "min_lat": 15,
            "lat_ts": 0
        },
        "Spain": {
            "min_lon": -14.18,
            "max_lon": 8,
            "max_lat": 35,
            "min_lat": 45,
            "lat_ts": 0
        },
        "China": {
            "min_lon": 62,
            "max_lon": 148,
            "max_lat": 16.85,
            "min_lat": 56,
            "lat_ts": 0
        },
        "United States": {
            "min_lon": -130,
            "max_lon": -60,
            "max_lat": 22,
            "min_lat": 53.7,
            "lat_ts": 0
        },
        "Iran": {
            "min_lon": 36,
            "max_lon": 72.6,
            "max_lat": 24,
            "min_lat": 42,
            "lat_ts": 0
        },
        "Brazil": {
            "min_lon": -91.7,
            "max_lon": -17,
            "max_lat": -34,
            "min_lat": 8,
            "lat_ts": 0
        },
        "Mexico": {
            "min_lon": -120,
            "max_lon": -80,
            "max_lat": 13.61,
            "min_lat": 35,
            "lat_ts": 0
        },
        "India": {
            "min_lon": 50,
            "max_lon": 107.3,
            "max_lat": 6,
            "min_lat": 37,
            "lat_ts": 0
        },
        "Italy": {
            "min_lon": -2.1,
            "max_lon": 25.4,
            "max_lat": 36,
            "min_lat": 48,
            "lat_ts": 0
        },
        "United Kingdom": {
            "min_lon": -19.55,
            "max_lon": 15,
            "max_lat": 49.5,
            "min_lat": 61,
            "lat_ts": 0
        },
        "Germany": {
            "min_lon": -2.1,
            "max_lon": 23,
            "max_lat": 46.8,
            "min_lat": 56,
            "lat_ts": 0
        },
        "France": {
            "min_lon": -10.2,
            "max_lon": 17,
            "max_lat": 41,
            "min_lat": 52,
            "lat_ts": 0
        },
        "Nigeria": {
            "min_lon": -2.48,
            "max_lon": 19,
            "max_lat": 3.5,
            "min_lat": 16,
            "lat_ts": 0
        },
        "South Africa": {
            "min_lon": 9,
            "max_lon": 37,
            "max_lat": -35.51,
            "min_lat": -21,
            "lat_ts": 0
        },
        "Democratic Republic of the Congo": {
            "min_lon": 3.53,
            "max_lon": 41,
            "max_lat": -14,
            "min_lat": 8,
            "lat_ts": 0
        },
        "Morocco": {
            "min_lon": -25,
            "max_lon": 10,
            "max_lat": 20.03,
            "min_lat": 38,
            "lat_ts": 0
        },

    },

    VERT_WRITE_CELLS: 30,
    HORZ_WRITE_CELLS: 15,


    // FSM
    REVEAL_STATE: 'reveal',
    REVEAL_DURATION: 5,
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


    // Rooms
    GAME_ROUNDS: 11,
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

    // Chat
    MAX_GAME_HIST: 100,
    MAX_CHAT_HIST: 100,
    SPAMPERIOD: 5, // seconds
    MAX_MSG_PER_SPAMPERIOD: 6,
    MAX_CHAR_PER_SPAMPERIOD: 4000,
    MAX_BOT_TOGGLE_PER_SPAMPERIOD: 5,
    PROFANITY_REGEX: ['\\bs+[\ \_.-]*h+[\ \_.-]*[1i]+[\ \_.-]*t+s*\\b',
        '\\bb+[\ \_.-]*u+[\ \_.-]*l+[\ \_.-]*s+[\ \_.-]*h+[\ \_.-]*[1i]+[\ \_.-]*t+s*\\b',
        '\\bdamn\\b',
        '\\bdamnit\\b',
        '\\bdam+it\\b',
        'f+[\ \_.-]*u+[\ \_.-]*c+[\ \_.-]*k+',
        'f+[\ \_.-]*u+[\ \_.-]*c+[\ \_.-]*k+i+[\ \_.-]*n+[\ \_.-]*g+',
        '\\bf+[\ \_.-]*u+[\ \_.-]*c+[\ \_.-]*k+i+[\ \_.-]*n+\\b',
        '\\bb+[\ \_.-]*i+[\ \_.-]*t+[\ \_.-]*c+[\ \_.-]*h+\\b',
        '\\bb+[\ \_.-]*i+[\ \_.-]*t+[\ \_.-]*c+[\ \_.-]*h+[\ \_.-]*e+[\ \_.-]*s+\\b',
        '\\bc+[\ \_.-]*u+[\ \_.-]*n+[\ \_.-]*t+\\b',
        '\\bf+[\ \_.-]*[4a]+[\ \_.-]*g+[\ \_.-]*[oi1]+[\ \_.-]*t+[\ \_.-]*\\b',
        '\\bass\\b',
        '\\basshole\\b',
        '\\bp+[\ \_.-]*e+[\ \_.-]*n+[\ \_.-]*i+[\ \_.-]*s+\\b',
        '\\bv+[\ \_.-]*a+[\ \_.-]*g+[\ \_.-]*i+[\ \_.-]*n+[\ \_.-]*a+\\b',
        '\\bn+[\ \_.-]*[i1y!]+[\ \_.-]*g+[\ \_.-]*[3ei]+[\ \_.-]*r+s*\\b',
        '\\bn+[\ \_.-]*[i1y!]+[\ \_.-]*g+[\ \_.-]*[a4]+[\ \_.-]*s*\\b',
        '\\br+[\ \_.-]*a+[\ \_.-]*p+[\ \_.-]*e+r*s*\\b'
    ]
}