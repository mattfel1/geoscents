/**
 * Class for storing all geography methods
 */

const TIMELINES = require('../resources/timelines.json')
const CONSTANTS = require('../resources/constants.js');
let ALLEVENTS = new Map()

// We don't want all these json files to get in-lined in the bundle,
// and we can't import at runtime (because imports can't be inside of a loop that is executed at runtime),
// and we can't use require because it just wild-cards the variable and we end up in-lining every events.js..
// We need to trick webpack/babel into not inferring a wildcard in the variable portion of the require file name.
// Hack over the wildcard with this solution from https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
// But you have to be careful because these files MUST exist at the path when the game boots up or else it crashes

requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
Object.keys(TIMELINES).forEach(function(value) {
    let list = requireFunc('../public/' + value.toLowerCase().replace(/ /g, "").replace(".", "") + '.js').EVENTS;
    ALLEVENTS.set(value, list);
})

const randomEvent = (eventsrc, blacklist, played_targets) => {
    let acceptable = false;
    let i = 0;
    let proposal = null;
    let timeout = 20;
    console.assert(ALLEVENTS.has(eventsrc), "No city src database for " + eventsrc);
    let events = ALLEVENTS.get(eventsrc);
    while (!acceptable) {
        const rng = Math.random();
        // Scan the next 11 targets to find a suitable one
        let ofs = 0;
        let desperate = i >= timeout - 3;
        let linear_scan_count = 1;
        if (desperate)
            linear_scan_count = CONSTANTS.GAME_ROUNDS + 1;
        for (let ofs = 0; ofs < linear_scan_count; ofs++) {
            const id = (Math.floor(rng * events.length) + ofs) % events.length;
            proposal = events[id];

            if (!played_targets.includes(proposal['event']))
                acceptable = true;

            if (acceptable)
                break;
        }
        i = i + 1;
    }
    blacklist.push(proposal['event'])
    return [proposal, blacklist];
};

const isEra = (eventsrc) => {
    return TIMELINES[eventsrc]['tier'] === "era"
}
const isCentury = (eventsrc) => {
    return TIMELINES[eventsrc]['tier'] === "century"
}
const isMisc = (eventsrc) => {
    return TIMELINES[eventsrc]['tier'] === "misc"
}

const hasLeader = (eventsrc) => {
    return TIMELINES[eventsrc]['leader'] !== undefined
}

const firstDayOfMonthInDays = (month) => {
    let daysPerMonth = [31, 28.2422, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let day = 0;
    for (let i = 0; i < month - 1; i++) {
        day = day + daysPerMonth[i]
    }
    return day;
}

const dateToDaysSinceStart = (eventsrc, date) => {
    console.assert(ALLEVENTS.has(eventsrc), "No city src database for " + eventsrc);
    let events = ALLEVENTS.get(eventsrc);
    var start = events['START']
    var end = events['END']
    const split = date.split(".")
    const day = split[0]
    const month = split[1]
    const year = split[2]
    const daysDeltaYear = 365.2422 * (year - start);
    const monthToDay = firstDayOfMonthInDays(month)
    return monthToDay + day + daysDeltaYear;
}

const score = (eventsrc, temporalDist, timeBonus) => {
    // Scale geoDist based on the length of the map's diagonal
    console.assert(ALLEVENTS.has(eventsrc), "No city src database for " + eventsrc);
    let events = ALLEVENTS.get(eventsrc);
    var start = events['START']
    var end = events['END']

    // TODO
    return temporalDist;
};

const pixelToChrono = (eventsrc, row, col) => {
    console.assert(ALLEVENTS.has(eventsrc), "No city src database for " + eventsrc);
    let events = ALLEVENTS.get(eventsrc);

    // TODO
    return row

};

const calcDayDist = (eventsrc) => {
    console.assert(ALLEVENTS.has(eventsrc), "No city src database for " + eventsrc);
    let events = ALLEVENTS.get(eventsrc);

    // TODO
    return 0;

};

const chronoToPixel = (map, globalDay) => {
    console.assert(ALLEVENTS.has(eventsrc), "No city src database for " + eventsrc);
    let events = ALLEVENTS.get(eventsrc);

    // TODO
    return {
        'row': 5,
        'col': 10
    }
};

module.exports = {
    randomEvent,
    calcDayDist,
    pixelToChrono,
    chronoToPixel,
    score,
    isEra,
    isCentury,
    isMisc,
    hasLeader
}