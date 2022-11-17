/**
 * Class for storing all geography methods
 */

const MAPS = require('../resources/maps.json')
const CONSTANTS = require('../resources/constants.js');
let ALLCITIES = new Map()

// We don't want all these json files to get in-lined in the bundle,
// and we can't import at runtime (because imports can't be inside of a loop that is executed at runtime),
// and we can't use require because it just wild-cards the variable and we end up in-lining every cities.js..
// We need to trick webpack/babel into not inferring a wildcard in the variable portion of the require file name.
// Hack over the wildcard with this solution from https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
// But you have to be careful because these files MUST exist at the path when the game boots up or else it crashes

requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
Object.keys(MAPS).forEach(function(value) {
    let list = requireFunc('../public/' + value.toLowerCase().replace(/ /g, "").replace(".", "") + '.js').CITIES;
    ALLCITIES.set(value, list);
})

const randomCity = (citysrc, blacklist, played_targets) => {
    let acceptable = false;
    let i = 0;
    let proposal = null;
    let timeout = 20;
    console.assert(ALLCITIES.has(citysrc), "No city src database for " + citysrc);
    let CITIES = ALLCITIES.get(citysrc);
    while (!acceptable) {
        const rng = Math.random();
        // Scan the next 11 targets to find a suitable one
        let ofs = 0;
        let desperate = i >= timeout - 3;
        let linear_scan_count = 1;
        if (desperate)
            linear_scan_count = CONSTANTS.GAME_ROUNDS + 1;
        for (let ofs = 0; ofs < linear_scan_count; ofs++) {
            const id = (Math.floor(rng * CITIES.length) + ofs) % CITIES.length;
            proposal = CITIES[id];

            // If we are about to timeout, forget about the citysrc rules and just get first unique target
            if (!desperate && uniqueInBlacklist(citysrc, proposal, blacklist) || i >= timeout)
                acceptable = true;
            else if (desperate && !played_targets.includes(stringifyTarget(proposal, citysrc)['string']))
                acceptable = true;

            if (acceptable)
                break;
        }
        i = i + 1;
    }
    if (requireUniqueAdmin(citysrc, proposal)) {
        blacklist.push(proposal['admin_name'])
    } else if (blacklistEntireString(citysrc)) {
        blacklist.push(stringifyTarget(proposal, citysrc)['string'])
    } else {
        blacklist.push(proposal['country']);
    }
    return [proposal, blacklist];
};

const blacklistEntireString = (citysrc) => {
    return citysrc == CONSTANTS.TRIVIA || citysrc == "Vatican City" || citysrc == "Antarctica";
}

const isCountry = (citysrc) => {
    return MAPS[citysrc]['tier'] === "country"
}
const isRegion = (citysrc) => {
    return MAPS[citysrc]['tier'] === "region"
}
const isContinent = (citysrc) => {
    return MAPS[citysrc]['tier'] === "continent"
}
const isCapital = (citysrc) => {
    return citysrc.endsWith("Capitals")
}
const hasLeader = (citysrc) => {
    return MAPS[citysrc]['leader'] !== undefined
}

// Include the admin field when displaying city/country string to player
const includeAdmin = (target, citysrc) => {
    // Always display for "big" countris, or when playing region or country
    return (target['country'] === 'United States' ||
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
            isCountry(citysrc) || isRegion(citysrc)) &&
        !blacklistEntireString(citysrc)

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
    if (citysrc === CONSTANTS.NAMERICA && (target['country'] === 'United States' || target['country'] === 'Canada')) {
        return true
    } else if (citysrc === CONSTANTS.ASIA && (target['country'] === 'China' || target['country'] === 'India')) {
        return true
    } else if (blacklistEntireString(citysrc)) {
        return false
    } else if (isCountry(citysrc)) {
        return true
    }
    // else if (citysrc === CONSTANTS.OCEANIA && target['country'] === 'Australia') {return true}
    else return false
};

const uniqueInBlacklist = (citysrc, target, blacklist) => {
    if (blacklistEntireString(citysrc)) return !blacklist.includes(stringifyTarget(target, citysrc)['string'])
    else if (requireUniqueAdmin(citysrc, target)) return !blacklist.includes(target['admin_name']);
    else return !blacklist.includes(target['country']);
};

const mercDist = (map, row1, col1, row2, col2) => {
    const row_err = Math.pow(row1 - row2, 2);
    let col_err = Math.min(Math.pow(col1 - col2, 2), Math.pow(col1 - col2 + CONSTANTS.MAP_WIDTH, 2), Math.pow(col1 - col2 - CONSTANTS.MAP_WIDTH, 2));
    if (map === CONSTANTS.NAMERICA || map === CONSTANTS.EUROPE || map === CONSTANTS.AFRICA || map === CONSTANTS.SAMERICA || map === CONSTANTS.ASIA || map === CONSTANTS.OCEANIA || isCountry(map)) { // No wrap
        col_err = Math.pow(col1 - col2, 2);
    }
    return Math.sqrt(row_err + col_err);
};

const calcGeoDist = (lat1, lon1, lat2, lon2) => {
    const lon_diff = Math.min(Math.abs(Math.max(lon1, lon2) - (Math.min(lon1, lon2) + 360), Math.abs(lon1 - lon2))); // in degrees
    const lon_err = Math.pow(Math.sin(Math.PI / 180 * Math.abs(lon_diff) / 2), 2, 2);
    const a = Math.pow(Math.sin(Math.PI / 180 * Math.abs(lat1 - lat2) / 2), 2) + Math.cos(Math.PI / 180 * lat1) * Math.cos(Math.PI / 180 * lat2) * lon_err;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // console.log("dist for " + lat1 + ", " + lon1 + " to " + lat2 + ", " + lon2 + " = " + (CONSTANTS.EARTH_RADIUS * c));
    return CONSTANTS.EARTH_RADIUS * c
};

const score = (map, geoDist, mercDist, timeBonus) => {
    // Scale geoDist based on the length of the map's diagonal
    console.assert(Object.keys(MAPS).indexOf(map) !== -1, "Error calculating score for " + map);
    var bounds = MAPS[map]["coords"];

    let min_lon = bounds[0];
    let max_lon = bounds[1];
    let max_lat = bounds[2];
    let min_lat = bounds[3];
    let world_bounds = MAPS[CONSTANTS.WORLD]["coords"];
    let world_min_lon = world_bounds[0];
    let world_max_lon = world_bounds[1];
    let world_max_lat = world_bounds[2];
    let world_min_lat = world_bounds[3];
    let diag = calcGeoDist(max_lat, max_lon, min_lat, min_lon);
    let scalingFactor = 1;
    let fullDiag = 2 * calcGeoDist((world_max_lat + world_min_lat) / 2, (world_max_lon + world_min_lon) / 2, world_min_lat, world_min_lon);
    if (min_lon == -180 && max_lon == 180) {
        // No scaling for full map
    } else {
        let fudge_factor = 1
        // Tiny maps need slightly different math
        if (!isContinent(map))
            fudge_factor = 2.5;
        if (map == "Vatican City")
            fudge_factor = 30;
        scalingFactor = fullDiag / (fudge_factor * diag);
    }
    // console.log("diag = " + diag + " sf = " + scalingFactor + " geo dist " + geoDist + " merc dist " + mercDist)

    // // Pixel-distance based score (old)
    // const timeLogistic = CONSTANTS.LOGISTIC_C3/(2+Math.exp(CONSTANTS.LOGISTIC_C1*(-timeBonus+CONSTANTS.LOGISTIC_C2)))+CONSTANTS.LOGISTIC_C4;
    // const distGaussian = Math.exp(-Math.pow(mercDist, 2) / CONSTANTS.GAUSS_C1) * CONSTANTS.MULTIPLIER;
    // return distGaussian * timeLogistic;
    // Geo distance based score
    const slope = (1 - CONSTANTS.PERCENT_AT_MAX_TIME) / (CONSTANTS.NUM_SECONDS_FULL_SCORE - 10);
    const invTime = CONSTANTS.GUESS_DURATION - timeBonus;
    const timeLine = slope * (invTime - CONSTANTS.NUM_SECONDS_FULL_SCORE) + 1;
    const timePortion = Math.min(1, timeLine);
    // const timePortion = Math.min(13 / 12 - (CONSTANTS.GUESS_DURATION - timeBonus) * 3 / 36, 1);
    // // Logistic distance score
    // const distPortion = 620 / (1 + Math.exp(0.003*(scaledDist - 1000)));
    // Gaussian distance score
    const distPortion = Math.min(600, Math.exp(-scalingFactor * Math.pow(scalingFactor * geoDist, 2) / 600000) * 605);
    return distPortion * timePortion
};

const pixelToGeo = (map, row, col) => {
    console.assert(Object.keys(MAPS).indexOf(map) !== -1, "Error calculating score for " + map);
    var bounds = MAPS[map]["coords"];

    let min_lon = bounds[0];
    let max_lon = bounds[1];
    let max_lat = bounds[2];
    let zero_lat = bounds[3];
    let lat_ts = 0;

    let lat = 0;
    let lon = 0;
    if (map == "Antarctica" || map == "Arctic") {
        // Azimuthal Equidistant projection
        // Lon = angle from midpoint
        // Lat = distance from midpoint

        // Square map (0 lon is straight up for antarctica, down for arctic)
        let sgn = 1;
        if (map == "Arctic") {
            sgn = -1;
        }

        let x = col - (CONSTANTS.MAP_WIDTH / 2)
        let y = row - (CONSTANTS.MAP_HEIGHT / 2)
        // Scaling factor is number of degrees per pixel
        let lat_sf = (zero_lat - max_lat) / (CONSTANTS.MAP_WIDTH / 2)
        lat = sgn * (-90 + Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * lat_sf)
        if (x == 0)
            lon = 180
        else
            lon = (Math.atan(Math.abs(x) / Math.abs(y)) * 180) / Math.PI
        if (x < 0 && y < 0) {
            // Top left
            if (map == "Antarctica")
                lon = -lon
            if (map == "Arctic")
                lon = -180 + lon
        } else if (x < 0 && y > 0) {
            // Bottom left
            if (map == "Antarctica")
                lon = -(180 - lon)
            if (map == "Arctic") {
                lon = -lon
            }
        } else if (x > 0 && y > 0) {
            // Bottom right
            if (map == "Antarctica")
                lon = 180 - lon
            if (map == "Arctic")
                lon = lon
        } else if (x > 0 && y < 0) {
            // Top right
            if (map == "Arctic")
                lon = 180 - lon
        }

    } else {
        // Mercator projection
        const eqMin = Math.atanh(Math.sin(zero_lat * Math.PI / 180));
        const eqRange = Math.atanh(Math.sin(max_lat * Math.PI / 180)) - eqMin;
        lon = ((col) * (max_lon - min_lon) / CONSTANTS.MAP_WIDTH) + min_lon;
        lat = Math.asin(Math.tanh(((row) * eqRange / CONSTANTS.MAP_HEIGHT) + eqMin)) * 180 / Math.PI;
    }
    return {
        'lat': lat,
        'lng': lon
    }
};

const geoToPixel = (map, lat, lon) => {
    console.assert(Object.keys(MAPS).indexOf(map) !== -1, "Error calculating score for " + map);
    var bounds = MAPS[map]["coords"];

    let min_lon = bounds[0];
    let max_lon = bounds[1];
    let max_lat = bounds[2];
    let zero_lat = bounds[3];
    let lat_ts = 0;

    let col = 0;
    let row = 0;
    if (map == "Antarctica" || map == "Arctic") {
        // Azimuthal Equidistant projection
        // Lat = radius from origin
        // Lon = angle from origin
        // x = cos(lon) * lat + midpoint
        // y = sin(lon) * lat + midpoint
        // Longitude scaling factor

        // Square map (0 lon is straight up for antarctica, down for arctic)
        let sgn = 1;
        let outer_lat = max_lat;
        if (map == "Arctic") {
            sgn = -1;
            outer_lat = zero_lat;
        }

        // Scaling factor is number of degrees per pixel
        let lat_sf = (zero_lat - max_lat) / (CONSTANTS.MAP_WIDTH / 2)
        let hypot = (lat - outer_lat) / lat_sf

        col = sgn * Math.sin(lon * Math.PI / 180) * hypot + (CONSTANTS.MAP_WIDTH / 2)
        row = -Math.cos(lon * Math.PI / 180) * hypot + (CONSTANTS.MAP_HEIGHT / 2)
    } else {
        // Mercator projection
        // get col value
        col = (parseFloat(lon) - min_lon) * (CONSTANTS.MAP_WIDTH / (max_lon - min_lon));
        if (parseFloat(lon) < min_lon) {
            col = (parseFloat(lon) + 360 - min_lon) * (CONSTANTS.MAP_WIDTH / (max_lon - min_lon))
        }
        // convert from degrees to radians
        const latRad = (parseFloat(lat)) * Math.PI / 180;

        const eqMin = Math.atanh(Math.sin(zero_lat * Math.PI / 180));
        const eqRange = Math.atanh(Math.sin(max_lat * Math.PI / 180)) - eqMin;

        // get row value
        row = (CONSTANTS.MAP_HEIGHT / eqRange) * (Math.atanh(Math.sin(latRad)) - eqMin);
    }

    return {
        'row': row,
        'col': col
    }
};

module.exports = {
    randomCity,
    mercDist,
    calcGeoDist,
    pixelToGeo,
    geoToPixel,
    score,
    includeAdmin,
    requireUniqueAdmin,
    stringifyTarget,
    blacklistEntireString,
    stringifyTargetAscii,
    isCountry,
    isRegion,
    isContinent,
    isCapital,
    hasLeader
}