/**
 * Class for storing all geography methods
 */
const WORLDCITIES = require('../resources/worldcities.js').CITIES;
const USCITIES = require('../resources/uscities.js').CITIES;
const EUROCITIES = require('../resources/eurocities.js').CITIES;
const AFRICACITIES = require('../resources/africacities.js').CITIES;
const CONSTANTS = require('../resources/constants.js');

const randomCity = (room, blacklist) => {
    var acceptable = false;
    var i = 0;
    var proposal = null;
    if (room == CONSTANTS.WORLD) {
        while(!acceptable) {
            proposal = WORLDCITIES[Math.floor(Math.random()*WORLDCITIES.length)];
            if (!blacklist.includes(proposal['country']) && i < 10) acceptable = true;
            else i = i+1;
        }
    }
    else if (room == CONSTANTS.US) {
        while(!acceptable) {
            proposal = USCITIES[Math.floor(Math.random()*USCITIES.length)];
            if (!blacklist.includes(proposal['admin_name']) && i < 10) acceptable = true;
            else i = i+1;
        }
    }
    else if (room == CONSTANTS.EURO) {
        while(!acceptable) {
            proposal = EUROCITIES[Math.floor(Math.random()*EUROCITIES.length)];
            if (!blacklist.includes(proposal['country']) && i < 10) acceptable = true;
            else i = i+1;
        }
    }
    else if (room == CONSTANTS.AFRICA) {
        while(!acceptable) {
            proposal = AFRICACITIES[Math.floor(Math.random()*AFRICACITIES.length)];
            if (!blacklist.includes(proposal['country']) && i < 10) acceptable = true;
            else i = i+1;
        }
    }
    else {
        while(!acceptable) {
            proposal = WORLDCITIES[Math.floor(Math.random()*WORLDCITIES.length)];
            if (!blacklist.includes(proposal['country']) && i < 10) acceptable = true;
            else i = i+1;
        }
    }
    return proposal;
};

const mercDist = (room,row1,col1,row2,col2) => {
    const row_err = Math.pow(row1-row2,2);
    var col_err = Math.min(Math.pow(col1-col2,2), Math.pow(col1-col2+CONSTANTS.MAP_WIDTH,2), Math.pow(col1-col2-CONSTANTS.MAP_WIDTH,2));
    if (room == CONSTANTS.US || room == CONSTANTS.EURO || room == CONSTANTS.AFRICA) { // No wrap
        col_err = Math.pow(col1-col2,2);
    }
    return Math.sqrt(row_err + col_err);
};

const geoDist = (lat1,lon1,lat2,lon2) => {
    console.log('dist btw ' + lat1 + ',' + lon1 + ' and ' + lat2 + ',' + lon2)
	var a = Math.pow(Math.sin(Math.abs(lat1-lat2)/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(Math.abs(lon1-lon2)/2), 2,2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var dist = c;
	return dist
};

const mercToGeo = (room,row,col) => {
    var zero_lat = CONSTANTS.WORLD_ZERO_LAT;
    var max_lat = CONSTANTS.WORLD_MAX_LAT;
    var min_lon = CONSTANTS.WORLD_MIN_LON;
    var max_lon = CONSTANTS.WORLD_MAX_LON;
    var lat_ts = CONSTANTS.WORLD_LAT_TS;
    if (room == CONSTANTS.US) {
        zero_lat = CONSTANTS.US_ZERO_LAT;
        max_lat = CONSTANTS.US_MAX_LAT;
        min_lon = CONSTANTS.US_MIN_LON;
        max_lon = CONSTANTS.US_MAX_LON;
        lat_ts = CONSTANTS.US_LAT_TS;
    }
    else if (room == CONSTANTS.EURO) {
        zero_lat = CONSTANTS.EURO_ZERO_LAT;
        max_lat = CONSTANTS.EURO_MAX_LAT;
        min_lon = CONSTANTS.EURO_MIN_LON;
        max_lon = CONSTANTS.EURO_MAX_LON;
        lat_ts = CONSTANTS.EURO_LAT_TS;
    }
    else if (room == CONSTANTS.AFRICA) {
        zero_lat = CONSTANTS.AFRICA_ZERO_LAT;
        max_lat = CONSTANTS.AFRICA_MAX_LAT;
        min_lon = CONSTANTS.AFRICA_MIN_LON;
        max_lon = CONSTANTS.AFRICA_MAX_LON;
        lat_ts = CONSTANTS.AFRICA_LAT_TS;
    }
    const eqMin = Math.atanh(Math.sin(zero_lat));
    const eqRange = Math.atanh(Math.sin(max_lat)) - eqMin;
	const lon = ((col)*(max_lon-min_lon)/CONSTANTS.MAP_WIDTH) + min_lon;
    const lat = Math.asin(Math.tanh(((row)*eqRange/CONSTANTS.MAP_HEIGHT) + eqMin)) * 180 / Math.PI;
	return {'lat': lat, 'lon': lon}
};

const geoToMerc = (room,lat, lon) => {
    var zero_lat = CONSTANTS.WORLD_ZERO_LAT;
    var max_lat = CONSTANTS.WORLD_MAX_LAT;
    var min_lon = CONSTANTS.WORLD_MIN_LON;
    var max_lon = CONSTANTS.WORLD_MAX_LON;
    var lat_ts = CONSTANTS.WORLD_LAT_TS;
    if (room == CONSTANTS.US) {
        zero_lat = CONSTANTS.US_ZERO_LAT;
        max_lat = CONSTANTS.US_MAX_LAT;
        min_lon = CONSTANTS.US_MIN_LON;
        max_lon = CONSTANTS.US_MAX_LON;
        lat_ts = CONSTANTS.US_LAT_TS;
    }
    else if (room == CONSTANTS.EURO) {
        zero_lat = CONSTANTS.EURO_ZERO_LAT;
        max_lat = CONSTANTS.EURO_MAX_LAT;
        min_lon = CONSTANTS.EURO_MIN_LON;
        max_lon = CONSTANTS.EURO_MAX_LON;
        lat_ts = CONSTANTS.EURO_LAT_TS;
    }
    else if (room == CONSTANTS.AFRICA) {
        zero_lat = CONSTANTS.AFRICA_ZERO_LAT;
        max_lat = CONSTANTS.AFRICA_MAX_LAT;
        min_lon = CONSTANTS.AFRICA_MIN_LON;
        max_lon = CONSTANTS.AFRICA_MAX_LON;
        lat_ts = CONSTANTS.AFRICA_LAT_TS;
    }
	// get col value
	const col = (parseFloat(lon)-min_lon)*(CONSTANTS.MAP_WIDTH/(max_lon - min_lon));
	// convert from degrees to radians
	const latRad = (parseFloat(lat))*Math.PI/180;

    const eqMin = Math.atanh(Math.sin(zero_lat));
    const eqRange = Math.atanh(Math.sin(max_lat)) - eqMin;

	// get row value
	const row = (CONSTANTS.MAP_HEIGHT/eqRange) * (Math.atanh(Math.sin(latRad)) - eqMin);
	return {'row': row, 'col': col}
};

module.exports = {
    randomCity,
    mercDist,
    geoDist,
    mercToGeo,
    geoToMerc
}