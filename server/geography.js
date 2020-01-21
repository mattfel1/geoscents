/**
 * Class for storing all geography methods
 */
const WORLDCITIES = require('../resources/worldcities.js').CITIES;
const MISCCITIES = require('../resources/misccities.js').CITIES;
const USCITIES = require('../resources/uscities.js').CITIES;
const EUROCITIES = require('../resources/eurocities.js').CITIES;
const AFRICACITIES = require('../resources/africacities.js').CITIES;
const ASIACITIES = require('../resources/asiacities.js').CITIES;
const OCEANIACITIES = require('../resources/oceaniacities.js').CITIES;
const SAMERICACITIES = require('../resources/samericacities.js').CITIES;
const CONSTANTS = require('../resources/constants.js');
// var idx = 0;

const randomCity = (room, blacklist) => {
    let acceptable = false;
    let i = 0;
    let proposal = null;
    let timeout = 20;
    if (room === CONSTANTS.WORLD) {
        while (!acceptable) {
            proposal = WORLDCITIES[Math.floor(Math.random() * WORLDCITIES.length)];
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (room === CONSTANTS.MISC) {
        while (!acceptable) {
            proposal = MISCCITIES[Math.floor(Math.random() * MISCCITIES.length)];
            // proposal = MISCCITIES[idx];
            // idx = idx + 1
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (room === CONSTANTS.US) {
        while (!acceptable) {
            proposal = USCITIES[Math.floor(Math.random() * USCITIES.length)];
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (room === CONSTANTS.EURO) {
        while (!acceptable) {
            proposal = EUROCITIES[Math.floor(Math.random() * EUROCITIES.length)];
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (room === CONSTANTS.AFRICA) {
        while (!acceptable) {
            proposal = AFRICACITIES[Math.floor(Math.random() * AFRICACITIES.length)];
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (room === CONSTANTS.ASIA) {
        while (!acceptable) {
            proposal = ASIACITIES[Math.floor(Math.random() * ASIACITIES.length)];
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (room === CONSTANTS.OCEANIA) {
        while (!acceptable) {
            proposal = OCEANIACITIES[Math.floor(Math.random() * OCEANIACITIES.length)];
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (room === CONSTANTS.SAMERICA) {
        while (!acceptable) {
            proposal = SAMERICACITIES[Math.floor(Math.random() * SAMERICACITIES.length)];
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else {
        while (!acceptable) {
            proposal = WORLDCITIES[Math.floor(Math.random() * WORLDCITIES.length)];
            if (uniqueInBlacklist(room, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    }
    if (requireUniqueAdmin(room, proposal)) {blacklist.push(proposal['admin_name'])}
    else if (room == CONSTANTS.MISC) blacklist.push(stringifyTarget(proposal)['string'])
    else blacklist.push(proposal['country']);
    return [proposal, blacklist];
};

// Include the admin field when displaying city/country string to player
const includeAdmin = (target) => {
    return target['country'] === 'United States' ||
    target['country'] === 'USA' ||
    target['country'] === 'Canada' ||
    target['country'] === 'Mexico' ||
    target['country'] === 'India' ||
    target['country'] === 'China' ||
    target['country'] === 'Australia' ||
    target['country'] === 'Russia' ||
    target['country'] === 'Indonesia' ||
    target['country'] === 'Brazil'
};

const stringifyTarget = (target) => {
    let state = '';
    if (includeAdmin(target)) {
        state = ', ' + target['admin_name'];
    }
    let pop = 0;
    if (target['population'] !== '') {
        pop = target['population'];
    }
    let comma = ', '
    if (target['country'] == '') {
        comma = ''
    }
    return {
        'string': target['city'] + state + comma + target['country'],
        'pop': pop,
        'majorcapital': target['capital'] === "primary",
        'minorcapital': target['capital'] === 'admin' || target['capital'] === 'minor'
    }
};

const stringifyTargetAscii = (target) => {
    let state = '';
    if (includeAdmin(target)) {
        state = ', ' + target['admin_name'];
    }
    let pop = 0;
    if (target['population'] !== '') {
        pop = target['population'];
    }
    let comma = ', '
    if (target['country'] == '') {
        comma = ''
    }
    return {
        'string': target['city_ascii'] + state + comma + target['country'],
        'pop': pop,
        'majorcapital': target['capital'] === "primary",
        'minorcapital': target['capital'] === 'admin' || target['capital'] === 'minor'
    }
};

// Allow this country to be repeated if the state is unique
const requireUniqueAdmin = (room, target) => {
    if (room === CONSTANTS.US && (target['country'] === 'USA' || target['country'] === 'Canada')) {return true}
    else if (room === CONSTANTS.ASIA && (target['country'] === 'China' || target['country'] === 'India')) {return true}
    else if (room === CONSTANTS.OCEANIA && target['country'] === 'Australia') {return true}
    else return false
};

const uniqueInBlacklist = (room, target, blacklist) => {
    if (room == CONSTANTS.MISC) return !blacklist.includes(stringifyTarget(target))
    else if (requireUniqueAdmin(room, target)) return !blacklist.includes(target['admin_name']);
    else return !blacklist.includes(target['country']);
};

const mercDist = (room,row1,col1,row2,col2) => {
    const row_err = Math.pow(row1 - row2, 2);
    let col_err = Math.min(Math.pow(col1 - col2, 2), Math.pow(col1 - col2 + CONSTANTS.MAP_WIDTH, 2), Math.pow(col1 - col2 - CONSTANTS.MAP_WIDTH, 2));
    if (room === CONSTANTS.US || room === CONSTANTS.EURO || room === CONSTANTS.AFRICA || room === CONSTANTS.SAMERICA || room === CONSTANTS.ASIA || room === CONSTANTS.OCEANIA) { // No wrap
        col_err = Math.pow(col1 - col2, 2);
    }
    return Math.sqrt(row_err + col_err);
};

const geoDist = (room,lat1,lon1,lat2,lon2) => {
    const lon_diff = Math.min(Math.abs(Math.max(lon1, lon2) - (Math.min(lon1, lon2) + 360), Math.abs(lon1 - lon2))); // in degrees
    const lon_err = Math.pow(Math.sin(Math.PI / 180 * Math.abs(lon_diff) / 2), 2, 2);
    // Not really necessary since the +2PI correction will always be larger in the tinier maps
    // if (room == CONSTANTS.US || room == CONSTANTS.EURO || room == CONSTANTS.AFRICA || room == CONSTANTS.SAMERICA) { // No wrap
    //     lon_err = Math.pow(col1-col2,2);
    // }
    const a = Math.pow(Math.sin(Math.PI / 180 * Math.abs(lat1 - lat2) / 2), 2) + Math.cos(Math.PI / 180 * lat1) * Math.cos(Math.PI / 180 * lat2) * lon_err;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // console.log("dist for " + lat1 + ", " + lon1 + " to " + lat2 + ", " + lon2 + " = " + (CONSTANTS.EARTH_RADIUS * c));
	return CONSTANTS.EARTH_RADIUS * c
};

const fullDiag = 2 * geoDist(CONSTANTS.WORLD, (CONSTANTS.WORLD_MAX_LAT + CONSTANTS.WORLD_MIN_LAT) / 2, (CONSTANTS.WORLD_MAX_LON + CONSTANTS.WORLD_MIN_LON) / 2, CONSTANTS.WORLD_MIN_LAT, CONSTANTS.WORLD_MIN_LON);
const miscDiag = fullDiag
const euroDiag = geoDist(CONSTANTS.EURO, CONSTANTS.EURO_MAX_LAT, CONSTANTS.EURO_MAX_LON, CONSTANTS.EURO_MIN_LAT, CONSTANTS.EURO_MIN_LON);
const africaDiag = geoDist(CONSTANTS.AFRICA, CONSTANTS.AFRICA_MAX_LAT, CONSTANTS.AFRICA_MAX_LON, CONSTANTS.AFRICA_MIN_LAT, CONSTANTS.AFRICA_MIN_LON);
const asiaDiag = geoDist(CONSTANTS.ASIA, CONSTANTS.ASIA_MAX_LAT, CONSTANTS.ASIA_MAX_LON, CONSTANTS.ASIA_MIN_LAT, CONSTANTS.ASIA_MIN_LON);
const oceaniaDiag = geoDist(CONSTANTS.OCEANIA, CONSTANTS.OCEANIA_MAX_LAT, CONSTANTS.OCEANIA_MAX_LON, CONSTANTS.OCEANIA_MIN_LAT, CONSTANTS.OCEANIA_MIN_LON);
const usDiag = geoDist(CONSTANTS.US, CONSTANTS.US_MAX_LAT, CONSTANTS.US_MAX_LON, CONSTANTS.US_MIN_LAT, CONSTANTS.US_MIN_LON);
const samericaDiag = geoDist(CONSTANTS.SAMERICA, CONSTANTS.SAMERICA_MAX_LAT, CONSTANTS.SAMERICA_MAX_LON, CONSTANTS.SAMERICA_MIN_LAT, CONSTANTS.SAMERICA_MIN_LON);

const score = (room, geoDist, mercDist, timeBonus) => {
    // Scale geoDist based on the length of the map's diagonal
    let scalingFactor = 1;
    if (room === CONSTANTS.EURO) scalingFactor = fullDiag / euroDiag;
    else if (room === CONSTANTS.AFRICA) scalingFactor = fullDiag / africaDiag;
    else if (room === CONSTANTS.ASIA) scalingFactor = fullDiag / asiaDiag;
    else if (room === CONSTANTS.OCEANIA) scalingFactor = fullDiag / oceaniaDiag;
    else if (room === CONSTANTS.US) scalingFactor = fullDiag / usDiag;
    else if (room === CONSTANTS.SAMERICA) scalingFactor = fullDiag / samericaDiag;

    // // Pixel-distance based score (old)
    // const timeLogistic = CONSTANTS.LOGISTIC_C3/(2+Math.exp(CONSTANTS.LOGISTIC_C1*(-timeBonus+CONSTANTS.LOGISTIC_C2)))+CONSTANTS.LOGISTIC_C4;
    // const distGaussian = Math.exp(-Math.pow(mercDist, 2) / CONSTANTS.GAUSS_C1) * CONSTANTS.MULTIPLIER;
    // return distGaussian * timeLogistic;
    // Geo distance based score
    const minTimePortion = 1/3;
    const timeCushion = 1.5;
    const slope = (1 - minTimePortion) / (timeCushion - 10);
    const invTime = CONSTANTS.GUESS_DURATION - timeBonus;
    const timeLine = slope * (invTime - timeCushion) + 1;
    const timePortion = Math.min(1, timeLine);
    // const timePortion = Math.min(13 / 12 - (CONSTANTS.GUESS_DURATION - timeBonus) * 3 / 36, 1);
    // // Logistic distance score
    // const distPortion = 620 / (1 + Math.exp(0.003*(scaledDist - 1000)));
    // Gaussian distance score
    const distPortion = Math.min(600, Math.exp(-scalingFactor * Math.pow(scalingFactor * geoDist, 2) / 600000) * 605);
    return distPortion * timePortion
};

const mercToGeo = (room,row,col) => {
    let zero_lat = CONSTANTS.WORLD_MIN_LAT;
    let max_lat = CONSTANTS.WORLD_MAX_LAT;
    let min_lon = CONSTANTS.WORLD_MIN_LON;
    let max_lon = CONSTANTS.WORLD_MAX_LON;
    let lat_ts = CONSTANTS.WORLD_LAT_TS;
    if (room === CONSTANTS.US) {
        zero_lat = CONSTANTS.US_MIN_LAT;
        max_lat = CONSTANTS.US_MAX_LAT;
        min_lon = CONSTANTS.US_MIN_LON;
        max_lon = CONSTANTS.US_MAX_LON;
        lat_ts = CONSTANTS.US_LAT_TS;
    } else if (room === CONSTANTS.EURO) {
        zero_lat = CONSTANTS.EURO_MIN_LAT;
        max_lat = CONSTANTS.EURO_MAX_LAT;
        min_lon = CONSTANTS.EURO_MIN_LON;
        max_lon = CONSTANTS.EURO_MAX_LON;
        lat_ts = CONSTANTS.EURO_LAT_TS;
    } else if (room === CONSTANTS.AFRICA) {
        zero_lat = CONSTANTS.AFRICA_MIN_LAT;
        max_lat = CONSTANTS.AFRICA_MAX_LAT;
        min_lon = CONSTANTS.AFRICA_MIN_LON;
        max_lon = CONSTANTS.AFRICA_MAX_LON;
        lat_ts = CONSTANTS.AFRICA_LAT_TS;
    } else if (room === CONSTANTS.ASIA) {
        zero_lat = CONSTANTS.ASIA_MIN_LAT;
        max_lat = CONSTANTS.ASIA_MAX_LAT;
        min_lon = CONSTANTS.ASIA_MIN_LON;
        max_lon = CONSTANTS.ASIA_MAX_LON;
        lat_ts = CONSTANTS.ASIA_LAT_TS;
    } else if (room === CONSTANTS.OCEANIA) {
        zero_lat = CONSTANTS.OCEANIA_MIN_LAT;
        max_lat = CONSTANTS.OCEANIA_MAX_LAT;
        min_lon = CONSTANTS.OCEANIA_MIN_LON;
        max_lon = CONSTANTS.OCEANIA_MAX_LON;
        lat_ts = CONSTANTS.OCEANIA_LAT_TS;
    } else if (room === CONSTANTS.SAMERICA) {
        zero_lat = CONSTANTS.SAMERICA_MIN_LAT;
        max_lat = CONSTANTS.SAMERICA_MAX_LAT;
        min_lon = CONSTANTS.SAMERICA_MIN_LON;
        max_lon = CONSTANTS.SAMERICA_MAX_LON;
        lat_ts = CONSTANTS.SAMERICA_LAT_TS;
    }
    const eqMin = Math.atanh(Math.sin(zero_lat * Math.PI/180));
    const eqRange = Math.atanh(Math.sin(max_lat * Math.PI/180)) - eqMin;
    const lon = ((col) * (max_lon - min_lon) / CONSTANTS.MAP_WIDTH) + min_lon;
    const lat = Math.asin(Math.tanh(((row) * eqRange / CONSTANTS.MAP_HEIGHT) + eqMin)) * 180 / Math.PI;
    return {'lat': lat, 'lng': lon}
};

const geoToMerc = (room,lat, lon) => {
    let zero_lat = CONSTANTS.WORLD_MIN_LAT;
    let max_lat = CONSTANTS.WORLD_MAX_LAT;
    let min_lon = CONSTANTS.WORLD_MIN_LON;
    let max_lon = CONSTANTS.WORLD_MAX_LON;
    let lat_ts = CONSTANTS.WORLD_LAT_TS;
    if (room === CONSTANTS.US) {
        zero_lat = CONSTANTS.US_MIN_LAT;
        max_lat = CONSTANTS.US_MAX_LAT;
        min_lon = CONSTANTS.US_MIN_LON;
        max_lon = CONSTANTS.US_MAX_LON;
        lat_ts = CONSTANTS.US_LAT_TS;
    } else if (room === CONSTANTS.EURO) {
        zero_lat = CONSTANTS.EURO_MIN_LAT;
        max_lat = CONSTANTS.EURO_MAX_LAT;
        min_lon = CONSTANTS.EURO_MIN_LON;
        max_lon = CONSTANTS.EURO_MAX_LON;
        lat_ts = CONSTANTS.EURO_LAT_TS;
    } else if (room === CONSTANTS.AFRICA) {
        zero_lat = CONSTANTS.AFRICA_MIN_LAT;
        max_lat = CONSTANTS.AFRICA_MAX_LAT;
        min_lon = CONSTANTS.AFRICA_MIN_LON;
        max_lon = CONSTANTS.AFRICA_MAX_LON;
        lat_ts = CONSTANTS.AFRICA_LAT_TS;
    } else if (room === CONSTANTS.ASIA) {
        zero_lat = CONSTANTS.ASIA_MIN_LAT;
        max_lat = CONSTANTS.ASIA_MAX_LAT;
        min_lon = CONSTANTS.ASIA_MIN_LON;
        max_lon = CONSTANTS.ASIA_MAX_LON;
        lat_ts = CONSTANTS.ASIA_LAT_TS;
    } else if (room === CONSTANTS.OCEANIA) {
        zero_lat = CONSTANTS.OCEANIA_MIN_LAT;
        max_lat = CONSTANTS.OCEANIA_MAX_LAT;
        min_lon = CONSTANTS.OCEANIA_MIN_LON;
        max_lon = CONSTANTS.OCEANIA_MAX_LON;
        lat_ts = CONSTANTS.OCEANIA_LAT_TS;
    } else if (room === CONSTANTS.SAMERICA) {
        zero_lat = CONSTANTS.SAMERICA_MIN_LAT;
        max_lat = CONSTANTS.SAMERICA_MAX_LAT;
        min_lon = CONSTANTS.SAMERICA_MIN_LON;
        max_lon = CONSTANTS.SAMERICA_MAX_LON;
        lat_ts = CONSTANTS.SAMERICA_LAT_TS;
    }
    // get col value
    const col = (parseFloat(lon) - min_lon) * (CONSTANTS.MAP_WIDTH / (max_lon - min_lon));
    // convert from degrees to radians
    const latRad = (parseFloat(lat)) * Math.PI / 180;

    const eqMin = Math.atanh(Math.sin(zero_lat * Math.PI/180));
    const eqRange = Math.atanh(Math.sin(max_lat * Math.PI/180)) - eqMin;

    // get row value
    const row = (CONSTANTS.MAP_HEIGHT / eqRange) * (Math.atanh(Math.sin(latRad)) - eqMin);
    return {'row': row, 'col': col}
};

module.exports = {
    randomCity,
    mercDist,
    geoDist,
    mercToGeo,
    geoToMerc,
    score,
    includeAdmin,
    requireUniqueAdmin,
    stringifyTarget,
    stringifyTargetAscii
}
