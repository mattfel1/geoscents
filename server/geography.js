/**
 * Class for storing all geography methods
 */
const CITIES = require('../resources/cities.js').CITIES;
const CONSTANTS = require('../resources/constants.js');

const randomCity = () => {return CITIES[Math.floor(Math.random()*CITIES.length)];};

const mercDist = (row1,col1,row2,col2) => {
    return Math.sqrt(Math.pow(row1-row2,2) + Math.pow(col1-col2, 2))
};

const geoDist = (lat1,lon1,lat2,lon2) => {
    console.log('dist btw ' + lat1 + ',' + lon1 + ' and ' + lat2 + ',' + lon2)
	var a = Math.pow(Math.sin(Math.abs(lat1-lat2)/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(Math.abs(lon1-lon2)/2), 2,2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var dist = c;
	return dist
};

const mercToGeo = (row,col) => {
    var eqMin = Math.atanh(Math.sin(CONSTANTS.ZERO_LAT));
    var eqRange = Math.atanh(Math.sin(CONSTANTS.MAX_LAT)) - eqMin;
	var lon = ((col)*360/CONSTANTS.MAP_WIDTH) - 180;
    var lat = Math.asin(Math.tanh((row*eqRange/CONSTANTS.MAP_HEIGHT) + eqMin)) * 180 / Math.PI;
	return {'lat': lat, 'lon': lon}
};

const geoToMerc = (lat, lon) => {
	// get col value
	var col = (parseFloat(lon)+180)*(CONSTANTS.MAP_WIDTH/360);
	// convert from degrees to radians
	var latRad = parseFloat(lat)*Math.PI/180;
    var eqMin = Math.atanh(Math.sin(CONSTANTS.ZERO_LAT));
    var eqRange = Math.atanh(Math.sin(CONSTANTS.MAX_LAT)) - eqMin;
	// get row value
	var row = (CONSTANTS.MAP_HEIGHT/eqRange) * (Math.atanh(Math.sin(latRad)) - eqMin);
	return {'row': row, 'col': col}
};

module.exports = {
    randomCity,
    mercDist,
    geoDist,
    mercToGeo,
    geoToMerc
}