module.exports = {

    // Players
    COLORS: ["red", "blue", "purple", "magenta", "grey", "orange", "green", "#1f77b4", "#2ca02c", "#995c00", "#9467bd", "#8c564b", "#e377c2", "#adad1f", "#17becf"],
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
    CLASSICS: {
        "Africa": {
            "coords": [-60, 82, -36.3, 41.0],
            "flair": "🌍"
        },
        "Asia": {
            "coords": [25, 158, -1, 61.05],
            "flair": "🌏"
        },
        "Europe": {
            "coords": [-36.3, 52, 35.0, 66.3],
            "flair": "🇪🇺"
        },
        "N. America": {
            "coords": [-141, -43, 10.0, 56.0],
            "flair": "🏞️"
        },
        "Oceania": {
            "coords": [92, 252, -54.55, 28],
            "flair": "🌊"
        },
        "S. America": {
            "coords": [-140, 17, -56.0, 24.1],
            "flair": "🌎"
        },
        "Trivia": {
            "coords": [-180, 180, -56.0, 80.85],
            "flair": "🧠"
        },
        "World Capitals": {
            "coords": [-180, 180, -65.5, 77.2],
            "flair": "🗺️"
        },
        "World": {
            "coords": [-180, 180, -65.5, 77.2],
            "flair": "🌐"
        },
    },
    SPECIALS: {
        "Afghanistan": {
            "leader": "Akhund",
            "greeting": "سلام (Salâm)/ښه راغلاست (Kha Raghlast)",
            "coords": [56, 78.65, 29, 40],
            "flair": "🇦🇫"
        },
        "Antarctica": {
            "leader": "Penguin",
            "greeting": "Bonvenon",
            "coords": [-180, 180, -90, -52],
            "flair": "🐧"
        },
        "Argentina": {
            "leader": "Fernandez",
            "greeting": "Bienvenido",
            "coords": [-102, -20, -56.5, -20],
            "flair": "🇦🇷"
        },
        "Australia": {
            "leader": "Albanese",
            "greeting": "Welcome",
            "coords": [97, 170, -45.5, -8],
            "flair": "🦘"
        },
        "Bolivia": {
            "leader": "Arce",
            "greeting": "Bienvenido/Jallallt'atapxtawa/Imaynallan",
            "coords": [-79, -49.05, -24, -7],
            "flair": "🇧🇴"
        },
        "Brazil": {
            "leader": "Bolsonaro",
            "greeting": "Receber",
            "coords": [-91.7, -17, -34, 8],
            "flair": "🇧🇷"
        },
        "Canada": {
            "leader": "Trudeau",
            "greeting": "Welcome/Bienvenue",
            "coords": [-152.1, -40, 38, 72.5],
            "flair": "🍁"
        },
        "China": {
            "leader": "Xi",
            "greeting": "欢迎光临 (Huānyíng guānglín)",
            "coords": [62, 148, 16.85, 56],
            "flair": "🐼"
        },
        "Colombia": {
            "leader": "Petro",
            "greeting": "Bienvenido",
            "coords": [-90, -55.9, -5, 15],
            "flair": "🇨🇴"
        },
        "Democratic Republic of the Congo": {
            "leader": "Tshisekedi",
            "greeting": "Bienvenue/Boyei malamu/Karibu",
            "coords": [3.53, 41, -14, 8],
            "flair": "🇨🇩"
        },
        "Egypt": {
            "leader": "el-Sisi",
            "greeting": "أهلا بك (Ahlan bik)",
            "coords": [16.5, 41.7, 20.81, 34],
            "flair": "🇪🇬"
        },
        "Estonia": {
            "leader": "Karis",
            "greeting": "Tere tulemast",
            "coords": [20, 30, 56.92, 60],
            "flair": "🇪🇪"
        },
        "France": {
            "leader": "Macron",
            "greeting": "Bienvenue",
            "coords": [-10.2, 17, 41, 52],
            "flair": "🥐"
        },
        "Germany": {
            "leader": "Scholz",
            "greeting": "Willkommen",
            "coords": [-2.1, 23, 46.8, 56],
            "flair": "🇩🇪"
        },
        "Greater Antilles": {
            "leader": "Atabey",
            "greeting": "Akeyi/Bienvenido",
            "coords": [-85.4, -64.5, 14.43, 26],
            "flair": "🐠"
        },
        "India": {
            "leader": "Modi",
            "greeting": "Welcome/स्वागत हे(svaagat he)",
            "coords": [50, 107.3, 6, 37],
            "flair": "🇮🇳"
        },
        "Indonesia": {
            "leader": "Widodo",
            "greeting": "Selamat datang",
            "coords": [84.5, 151, -23.5, 15],
            "flair": "🇮🇩"
        },
        "Iran": {
            "leader": "Raisi",
            "greeting": "خوش آمدی (xoš âmadi)",
            "coords": [36, 72.6, 24, 42],
            "flair": "🇮🇷"
        },
        "Italy": {
            "leader": "Mattarella",
            "greeting": "Benvenuto",
            "coords": [-2.1, 25.4, 36, 48],
            "flair": "🤌"
        },
        "Japan": {
            "leader": "Kishida",
            "greeting": "いらっしゃいませ (irasshaimase)",
            "coords": [110, 164.5, 23.5, 49],
            "flair": "🗻"
        },
        "Kazakhstan": {
            "leader": "Tokayev",
            "greeting": "Сәлеметсіз бе (Sälemetsiz be)",
            "coords": [42.8, 90, 40, 58],
            "flair": "🇰🇿"
        },
        "Kenya": {
            "leader": "Kenyatta",
            "greeting": "Karibu/Welcome",
            "coords": [30, 49, -5.33, 5.9],
            "flair": "🇰🇪"
        },
        "Kyrgyzstan": {
            "leader": "Japarov",
            "greeting": "Кош келдиңиз (Koş keldiŋiz)",
            "coords": [68.6, 81, 38.5, 44],
            "flair": "🇰🇬"
        },
        "Latvia": {
            "leader": "Levits",
            "greeting": "Laipni lūdzam",
            "coords": [20, 30, 55.285, 58.5],
            "flair": "🇱🇻"
        },
        "Lesser Antilles": {
            "leader": "Yúcahu",
            "greeting": "Welcome",
            "coords": [-74, -56.47, 10, 20],
            "flair": "🏝️"
        },
        "Lithuania": {
            "leader": "Nauseda",
            "greeting": "Sveiki",
            "coords": [18.43, 28, 53.8, 57],
            "flair": "🇱🇹"
        },
        "Mexico": {
            "leader": "AMLO",
            "greeting": "Bienvenido",
            "coords": [-120, -80, 13.61, 35],
            "flair": "🇲🇽"
        },
        "Morocco": {
            "leader": "Akhannouch",
            "greeting": "أهلا بك (Ahlan bik)",
            "coords": [-25, 10, 20.03, 38],
            "flair": "🇲🇦"
        },
        "New Zealand": {
            "leader": "Ardern",
            "greeting": "Kia ora/Welcome",
            "coords": [151, 190.4, -49, -31.4],
            "flair": "🥝"
        },
        "Nigeria": {
            "leader": "Buhari",
            "greeting": "Welcome",
            "coords": [-2.48, 19, 3.5, 16],
            "flair": "🇳🇬"
        },
        "Pakistan": {
            "leader": "Alvi",
            "greeting": "خوش آمدید (Khush Amdeed)/Welcome",
            "coords": [52.25, 84, 23, 39],
            "flair": "🇵🇰"
        },
        "Paraguay": {
            "leader": "Benítez",
            "greeting": "Bienvenido/Maiteí",
            "coords": [-69.1, -47, -29, -17],
            "flair": "🇵🇾"
        },
        "Peru": {
            "leader": "Castillo",
            "greeting": "Bienvenido/Jallallt'atapxtawa/Imaynallan",
            "coords": [-92, -55, -19.5, 2],
            "flair": "🇵🇪"
        },
        "Philippines": {
            "leader": "Bongbong",
            "greeting": "Maligayang Pagdating",
            "coords": [105, 140, 2, 22.15],
            "flair": "🇵🇭"
        },
        "Portugal": {
            "leader": "de Sousa",
            "greeting": "Receber",
            "coords": [-14.34, 0, 36.5, 43],
            "flair": "🇵🇹"
        },
        "Romania": {
            "leader": "Iohannis",
            "greeting": "Bine ati venit",
            "coords": [18.8, 33.7, 43, 49],
            "flair": "🇷🇴"
        },
        "Saudi Arabia": {
            "leader": "Salman",
            "greeting": "أهلا بك (Ahlan bik)",
            "coords": [23.8, 63.5, 15, 36],
            "flair": "🇸🇦"
        },
        "South Africa": {
            "leader": "Ramaphosa",
            "greeting": "Siyakwamukela/Wamkelekile/Welkom",
            "coords": [9, 37, -35.51, -21],
            "flair": "🇿🇦"
        },
        "South Korea": {
            "leader": "Yoon",
            "greeting": "환영하다 (hwan-yeonghada)",
            "coords": [121, 135.75, 33, 40],
            "flair": "🇰🇷"
        },
        "Spain": {
            "leader": "Sánchez",
            "greeting": "Bienvenido",
            "coords": [-14.18, 8, 35, 45],
            "flair": "🇪🇸"
        },
        "Switzerland": {
            "leader": "Cassis",
            "greeting": "Willkommen/Bienvenue/Benvenuto/Bainvegni",
            "coords": [4, 12.66, 45, 48.5],
            "flair": "🇨🇭"
        },
        "Tajikistan": {
            "leader": "Rahmon",
            "greeting": "хуш омадед (xuş omaded)",
            "coords": [64.9, 78, 36, 42],
            "flair": "🇹🇯"
        },
        "Turkey": {
            "leader": "Erdoğan",
            "greeting": "مرحبا‎ (Merhaba)",
            "coords": [22, 48, 33.14, 45],
            "flair": "🦃"
        },
        "Turkmenistan": {
            "leader": "Berdimuhamedow",
            "greeting": "Koş geldiniz",
            "coords": [50, 72, 34, 44.06],
            "flair": "🇹🇲"
        },
        "Ukraine": {
            "leader": "Zelensky",
            "welcome": "ласкаво просимо (laskavo prosymo)",
            "coords": [17.4, 45.3, 43.18, 54],
            "flair": "🇺🇦"
        },
        "United Kingdom": {
            "leader": "Johnson",
            "greeting": "Welcome",
            "coords": [-19.55, 15, 49.5, 61],
            "flair": "🇬🇧"
        },
        "United States": {
            "leader": "Biden",
            "greeting": "Welcome",
            "coords": [-130, -60, 22, 53.7],
            "flair": "🦅"
        },
        "Uruguay": {
            "leader": "Pou",
            "greeting": "Bienvenido",
            "coords": [-61.98, -48, -35.5, -28.5],
            "flair": "🇺🇾"
        },
        "Uzbekistan": {
            "leader": "Mirziyoyev",
            "greeting": "xush kelibsiz",
            "coords": [52, 78, 36, 47.41],
            "flair": "🇺🇿"
        },
        "Vatican City": {
            "leader": "Bertello",
            "greeting": "Benvenuto",
            "coords": [12.440, 12.4605, 41.899, 41.908],
            "flair": "🇻🇦"
        },
        "Venezuela": {
            "leader": "Maduro",
            "greeting": "Bienvenido",
            "coords": [-79.3, -52, -1, 15],
            "flair": "🇻🇪"
        },
        "Vietnam": {
            "leader": "Nguyen",
            "greeting": "Hoan Nghênh",
            "coords": [90, 120.1, 8, 25],
            "flair": "🇻🇳"
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