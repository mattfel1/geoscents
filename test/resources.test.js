/**
 * Checks that map-countries.json is up to date with maps.json.
 *
 * If this test fails after adding a new map, run:
 *   node scripts/build-country-index.js
 * then commit the updated resources/map-countries.json.
 */

const MAPS          = require('../resources/maps.json');
const MAP_COUNTRIES = require('../resources/map-countries.json');

const allMapNames = Object.keys(MAPS);

describe('map-countries.json is in sync with maps.json', () => {
    test('every map in maps.json has an entry in map-countries.json', () => {
        const missing = allMapNames.filter(m => !(m in MAP_COUNTRIES));
        if (missing.length) {
            throw new Error(
                `These maps are missing from map-countries.json:\n  ${missing.join('\n  ')}\n` +
                `Run: node scripts/build-country-index.js`
            );
        }
    });

    test('no stale entries in map-countries.json (maps removed from maps.json)', () => {
        const mapSet = new Set(allMapNames);
        const stale = Object.keys(MAP_COUNTRIES).filter(m => !mapSet.has(m));
        if (stale.length) {
            throw new Error(
                `These entries in map-countries.json no longer exist in maps.json:\n  ${stale.join('\n  ')}\n` +
                `Run: node scripts/build-country-index.js`
            );
        }
    });
});
