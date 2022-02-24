/**
 * Class for storing all geography methods
 */
const WORLDCITIES = require('../resources/worldcities.js').CITIES;
const WORLDEASYCITIES = require('../resources/worldeasycities.js').CITIES;
const MISCCITIES = require('../resources/misccities.js').CITIES;
const USCITIES = require('../resources/uscities.js').CITIES;
const EUROCITIES = require('../resources/eurocities.js').CITIES;
const AFRICACITIES = require('../resources/africacities.js').CITIES;
const ASIACITIES = require('../resources/asiacities.js').CITIES;
const OCEANIACITIES = require('../resources/oceaniacities.js').CITIES;
const SAMERICACITIES = require('../resources/samericacities.js').CITIES;
const UKRAINECITIES = require('../resources/ukrainecities.js').CITIES;
const CONSTANTS = require('../resources/constants.js');
// var idx = 0;

const randomCity = (citysrc, blacklist) => {
    let acceptable = false;
    let i = 0;
    let proposal = null;
    let timeout = 20;
    if (citysrc === CONSTANTS.WORLD) {
        while (!acceptable) {
            proposal = WORLDCITIES[Math.floor(Math.random() * WORLDCITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.WORLD_EASY) {
        while (!acceptable) {
            proposal = WORLDEASYCITIES[Math.floor(Math.random() * WORLDEASYCITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.MISC) {
        while (!acceptable) {
            proposal = MISCCITIES[Math.floor(Math.random() * MISCCITIES.length)];
            // proposal = MISCCITIES[idx];
            // idx = idx + 1
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.US) {
        while (!acceptable) {
            proposal = USCITIES[Math.floor(Math.random() * USCITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.EURO) {
        while (!acceptable) {
            proposal = EUROCITIES[Math.floor(Math.random() * EUROCITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.AFRICA) {
        while (!acceptable) {
            proposal = AFRICACITIES[Math.floor(Math.random() * AFRICACITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.ASIA) {
        while (!acceptable) {
            proposal = ASIACITIES[Math.floor(Math.random() * ASIACITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.OCEANIA) {
        while (!acceptable) {
            proposal = OCEANIACITIES[Math.floor(Math.random() * OCEANIACITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.SAMERICA) {
        while (!acceptable) {
            proposal = SAMERICACITIES[Math.floor(Math.random() * SAMERICACITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    } else if (citysrc === CONSTANTS.UKRAINE) {
        while (!acceptable) {
            proposal = UKRAINECITIES[Math.floor(Math.random() * UKRAINECITIES.length)];
            if (uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout) acceptable = true;
            else i = i + 1;
        }
    }
    if (requireUniqueAdmin(citysrc, proposal)) {blacklist.push(proposal['admin_name'])}
    else if (citysrc == CONSTANTS.MISC) blacklist.push(stringifyTarget(proposal, citysrc)['string'])
    else blacklist.push(proposal['country']);
    return [proposal, blacklist];
};

// Include the admin field when displaying city/country string to player
const includeAdmin = (target, citysrc) => {
    return target['country'] === 'United States' ||
    target['country'] === 'USA' ||
    target['country'] === 'Canada' ||
    target['country'] === 'Mexico' ||
    target['country'] === 'Portugal' ||
    target['country'] === 'India' ||
    target['country'] === 'China' ||
    target['country'] === 'Australia' ||
    target['country'] === 'Russia' ||
    target['country'] === 'Indonesia' ||
    target['country'] === 'Brazil' ||
    citysrc === 'Ukraine'
};

const stringifyTarget = (target, citysrc) => {
    let state = '';
    if (includeAdmin(target, citysrc)) {
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
        'minorcapital': target['capital'] === 'admin' || target['capital'] === 'minor',
        'iso2': target['iso2']
    }
};

const stringifyTargetAscii = (target, citysrc) => {
    let state = '';
    if (includeAdmin(target, citysrc)) {
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
const requireUniqueAdmin = (citysrc, target) => {
    if (citysrc === CONSTANTS.US && (target['country'] === 'United States' || target['country'] === 'Canada')) {return true}
    else if (citysrc === CONSTANTS.ASIA && (target['country'] === 'China' || target['country'] === 'India')) {return true}
    else if (citysrc === CONSTANTS.UKRAINE) {return true}
    // else if (citysrc === CONSTANTS.OCEANIA && target['country'] === 'Australia') {return true}
    else return false
};

const uniqueInBlacklist = (citysrc, target, blacklist) => {
    if (citysrc == CONSTANTS.MISC) return !blacklist.includes(stringifyTarget(target, citysrc)['string'])
    else if (requireUniqueAdmin(citysrc, target)) return !blacklist.includes(target['admin_name']);
    else return !blacklist.includes(target['country']);
};

const mercDist = (map,row1,col1,row2,col2) => {
    const row_err = Math.pow(row1 - row2, 2);
    let col_err = Math.min(Math.pow(col1 - col2, 2), Math.pow(col1 - col2 + CONSTANTS.MAP_WIDTH, 2), Math.pow(col1 - col2 - CONSTANTS.MAP_WIDTH, 2));
    if (map === CONSTANTS.US || map === CONSTANTS.EURO || map === CONSTANTS.AFRICA || map === CONSTANTS.SAMERICA || map === CONSTANTS.ASIA || map === CONSTANTS.OCEANIA || map === CONSTANTS.UKRAINE) { // No wrap
        col_err = Math.pow(col1 - col2, 2);
    }
    return Math.sqrt(row_err + col_err);
};

const geoDist = (map,lat1,lon1,lat2,lon2) => {
    const lon_diff = Math.min(Math.abs(Math.max(lon1, lon2) - (Math.min(lon1, lon2) + 360), Math.abs(lon1 - lon2))); // in degrees
    const lon_err = Math.pow(Math.sin(Math.PI / 180 * Math.abs(lon_diff) / 2), 2, 2);
    // Not really necessary since the +2PI correction will always be larger in the tinier maps
    // if (map == CONSTANTS.US || map == CONSTANTS.EURO || map == CONSTANTS.AFRICA || map == CONSTANTS.SAMERICA) { // No wrap
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
const ukraineDiag = geoDist(CONSTANTS.UKRAINE, CONSTANTS.UKRAINE_MAX_LAT, CONSTANTS.UKRAINE_MAX_LON, CONSTANTS.UKRAINE_MIN_LAT, CONSTANTS.UKRAINE_MIN_LON);

const score = (map, geoDist, mercDist, timeBonus) => {
    // Scale geoDist based on the length of the map's diagonal
    let scalingFactor = 1;
    if (map === CONSTANTS.EURO) scalingFactor = fullDiag / euroDiag;
    else if (map === CONSTANTS.AFRICA) scalingFactor = fullDiag / africaDiag;
    else if (map === CONSTANTS.ASIA) scalingFactor = fullDiag / asiaDiag;
    else if (map === CONSTANTS.OCEANIA) scalingFactor = fullDiag / oceaniaDiag;
    else if (map === CONSTANTS.US) scalingFactor = fullDiag / usDiag;
    else if (map === CONSTANTS.SAMERICA) scalingFactor = fullDiag / samericaDiag;
    else if (map === CONSTANTS.UKRAINE) scalingFactor = fullDiag / (2.5 * ukraineDiag);

    // // Pixel-distance based score (old)
    // const timeLogistic = CONSTANTS.LOGISTIC_C3/(2+Math.exp(CONSTANTS.LOGISTIC_C1*(-timeBonus+CONSTANTS.LOGISTIC_C2)))+CONSTANTS.LOGISTIC_C4;
    // const distGaussian = Math.exp(-Math.pow(mercDist, 2) / CONSTANTS.GAUSS_C1) * CONSTANTS.MULTIPLIER;
    // return distGaussian * timeLogistic;
    // Geo distance based score
    const minTimePortion = 1/3;
    const timeCushion = 1.55;
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

const mercToGeo = (map,row,col) => {
    let zero_lat = CONSTANTS.WORLD_MIN_LAT;
    let max_lat = CONSTANTS.WORLD_MAX_LAT;
    let min_lon = CONSTANTS.WORLD_MIN_LON;
    let max_lon = CONSTANTS.WORLD_MAX_LON;
    let lat_ts = CONSTANTS.WORLD_LAT_TS;
    if (map === CONSTANTS.US) {
        zero_lat = CONSTANTS.US_MIN_LAT;
        max_lat = CONSTANTS.US_MAX_LAT;
        min_lon = CONSTANTS.US_MIN_LON;
        max_lon = CONSTANTS.US_MAX_LON;
        lat_ts = CONSTANTS.US_LAT_TS;
    } else if (map === CONSTANTS.EURO) {
        zero_lat = CONSTANTS.EURO_MIN_LAT;
        max_lat = CONSTANTS.EURO_MAX_LAT;
        min_lon = CONSTANTS.EURO_MIN_LON;
        max_lon = CONSTANTS.EURO_MAX_LON;
        lat_ts = CONSTANTS.EURO_LAT_TS;
    } else if (map === CONSTANTS.MISC) {
        zero_lat = CONSTANTS.MISC_MIN_LAT;
        max_lat = CONSTANTS.MISC_MAX_LAT;
        min_lon = CONSTANTS.MISC_MIN_LON;
        max_lon = CONSTANTS.MISC_MAX_LON;
        lat_ts = CONSTANTS.MISC_LAT_TS;
    } else if (map === CONSTANTS.AFRICA) {
        zero_lat = CONSTANTS.AFRICA_MIN_LAT;
        max_lat = CONSTANTS.AFRICA_MAX_LAT;
        min_lon = CONSTANTS.AFRICA_MIN_LON;
        max_lon = CONSTANTS.AFRICA_MAX_LON;
        lat_ts = CONSTANTS.AFRICA_LAT_TS;
    } else if (map === CONSTANTS.ASIA) {
        zero_lat = CONSTANTS.ASIA_MIN_LAT;
        max_lat = CONSTANTS.ASIA_MAX_LAT;
        min_lon = CONSTANTS.ASIA_MIN_LON;
        max_lon = CONSTANTS.ASIA_MAX_LON;
        lat_ts = CONSTANTS.ASIA_LAT_TS;
    } else if (map === CONSTANTS.OCEANIA) {
        zero_lat = CONSTANTS.OCEANIA_MIN_LAT;
        max_lat = CONSTANTS.OCEANIA_MAX_LAT;
        min_lon = CONSTANTS.OCEANIA_MIN_LON;
        max_lon = CONSTANTS.OCEANIA_MAX_LON;
        lat_ts = CONSTANTS.OCEANIA_LAT_TS;
    } else if (map === CONSTANTS.SAMERICA) {
        zero_lat = CONSTANTS.SAMERICA_MIN_LAT;
        max_lat = CONSTANTS.SAMERICA_MAX_LAT;
        min_lon = CONSTANTS.SAMERICA_MIN_LON;
        max_lon = CONSTANTS.SAMERICA_MAX_LON;
        lat_ts = CONSTANTS.SAMERICA_LAT_TS;
    } else if (map === CONSTANTS.UKRAINE) {
        zero_lat = CONSTANTS.UKRAINE_MIN_LAT;
        max_lat = CONSTANTS.UKRAINE_MAX_LAT;
        min_lon = CONSTANTS.UKRAINE_MIN_LON;
        max_lon = CONSTANTS.UKRAINE_MAX_LON;
        lat_ts = CONSTANTS.UKRAINE_LAT_TS;
    }
    const eqMin = Math.atanh(Math.sin(zero_lat * Math.PI/180));
    const eqRange = Math.atanh(Math.sin(max_lat * Math.PI/180)) - eqMin;
    const lon = ((col) * (max_lon - min_lon) / CONSTANTS.MAP_WIDTH) + min_lon;
    const lat = Math.asin(Math.tanh(((row) * eqRange / CONSTANTS.MAP_HEIGHT) + eqMin)) * 180 / Math.PI;
    return {'lat': lat, 'lng': lon}
};

const geoToMerc = (map,lat, lon) => {
    let zero_lat = CONSTANTS.WORLD_MIN_LAT;
    let max_lat = CONSTANTS.WORLD_MAX_LAT;
    let min_lon = CONSTANTS.WORLD_MIN_LON;
    let max_lon = CONSTANTS.WORLD_MAX_LON;
    let lat_ts = CONSTANTS.WORLD_LAT_TS;
    if (map === CONSTANTS.US) {
        zero_lat = CONSTANTS.US_MIN_LAT;
        max_lat = CONSTANTS.US_MAX_LAT;
        min_lon = CONSTANTS.US_MIN_LON;
        max_lon = CONSTANTS.US_MAX_LON;
        lat_ts = CONSTANTS.US_LAT_TS;
    } else if (map === CONSTANTS.EURO) {
        zero_lat = CONSTANTS.EURO_MIN_LAT;
        max_lat = CONSTANTS.EURO_MAX_LAT;
        min_lon = CONSTANTS.EURO_MIN_LON;
        max_lon = CONSTANTS.EURO_MAX_LON;
        lat_ts = CONSTANTS.EURO_LAT_TS;
    } else if (map === CONSTANTS.MISC) {
        zero_lat = CONSTANTS.MISC_MIN_LAT;
        max_lat = CONSTANTS.MISC_MAX_LAT;
        min_lon = CONSTANTS.MISC_MIN_LON;
        max_lon = CONSTANTS.MISC_MAX_LON;
        lat_ts = CONSTANTS.MISC_LAT_TS;
    } else if (map === CONSTANTS.AFRICA) {
        zero_lat = CONSTANTS.AFRICA_MIN_LAT;
        max_lat = CONSTANTS.AFRICA_MAX_LAT;
        min_lon = CONSTANTS.AFRICA_MIN_LON;
        max_lon = CONSTANTS.AFRICA_MAX_LON;
        lat_ts = CONSTANTS.AFRICA_LAT_TS;
    } else if (map === CONSTANTS.ASIA) {
        zero_lat = CONSTANTS.ASIA_MIN_LAT;
        max_lat = CONSTANTS.ASIA_MAX_LAT;
        min_lon = CONSTANTS.ASIA_MIN_LON;
        max_lon = CONSTANTS.ASIA_MAX_LON;
        lat_ts = CONSTANTS.ASIA_LAT_TS;
    } else if (map === CONSTANTS.OCEANIA) {
        zero_lat = CONSTANTS.OCEANIA_MIN_LAT;
        max_lat = CONSTANTS.OCEANIA_MAX_LAT;
        min_lon = CONSTANTS.OCEANIA_MIN_LON;
        max_lon = CONSTANTS.OCEANIA_MAX_LON;
        lat_ts = CONSTANTS.OCEANIA_LAT_TS;
    } else if (map === CONSTANTS.SAMERICA) {
        zero_lat = CONSTANTS.SAMERICA_MIN_LAT;
        max_lat = CONSTANTS.SAMERICA_MAX_LAT;
        min_lon = CONSTANTS.SAMERICA_MIN_LON;
        max_lon = CONSTANTS.SAMERICA_MAX_LON;
        lat_ts = CONSTANTS.SAMERICA_LAT_TS;
    } else if (map === CONSTANTS.UKRAINE) {
        zero_lat = CONSTANTS.UKRAINE_MIN_LAT;
        max_lat = CONSTANTS.UKRAINE_MAX_LAT;
        min_lon = CONSTANTS.UKRAINE_MIN_LON;
        max_lon = CONSTANTS.UKRAINE_MAX_LON;
        lat_ts = CONSTANTS.UKRAINE_LAT_TS;
    }
    // get col value
    let col = (parseFloat(lon) - min_lon) * (CONSTANTS.MAP_WIDTH / (max_lon - min_lon));
    if (parseFloat(lon) < min_lon) { col = (parseFloat(lon) + 360 - min_lon) * (CONSTANTS.MAP_WIDTH / (max_lon - min_lon)) }
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
