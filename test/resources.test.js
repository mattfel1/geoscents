/**
 * Resource integrity checks:
 *  1. Every map in maps.json has a backing database file with valid CITIES data.
 *  2. map-countries.json is in sync with maps.json.
 *
 * If test 1 fails after adding a new map, create the database file in resources/databases/.
 * If test 2 fails, run:  node scripts/build-country-index.js
 */

const path = require('path');
const fs   = require('fs');

const MAPS          = require('../resources/maps.json');
const MAP_COUNTRIES = require('../resources/map-countries.json');

const DB_DIR     = path.join(__dirname, '../resources/databases');
const allMapNames = Object.keys(MAPS);

// Derive the expected filename the same way build-country-index.js does
function dbFilename(mapName) {
    return mapName.toLowerCase().replace(/ /g, '').replace(/\./g, '') + '.js';
}

// ---------------------------------------------------------------------------
// Database file checks
// ---------------------------------------------------------------------------
describe('every map has a backing database file', () => {
    test('all database files exist', () => {
        const missing = allMapNames.filter(m => !fs.existsSync(path.join(DB_DIR, dbFilename(m))));
        if (missing.length) {
            throw new Error(
                `These maps have no database file in resources/databases/:\n  ` +
                missing.map(m => `${m}  →  ${dbFilename(m)}`).join('\n  ')
            );
        }
    });

    test('all database files export a non-empty CITIES array', () => {
        const bad = [];
        for (const mapName of allMapNames) {
            const dbPath = path.join(DB_DIR, dbFilename(mapName));
            if (!fs.existsSync(dbPath)) continue; // already caught above
            try {
                delete require.cache[require.resolve(dbPath)];
                const mod = require(dbPath);
                if (!Array.isArray(mod.CITIES) || mod.CITIES.length === 0) {
                    bad.push(`${mapName}: CITIES is ${Array.isArray(mod.CITIES) ? 'empty' : 'not an array'}`);
                }
            } catch (e) {
                bad.push(`${mapName}: failed to load — ${e.message}`);
            }
        }
        if (bad.length) throw new Error(`Database problems:\n  ` + bad.join('\n  '));
    });
});

// ---------------------------------------------------------------------------
// map-countries.json sync checks
// ---------------------------------------------------------------------------
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
        const stale  = Object.keys(MAP_COUNTRIES).filter(m => !mapSet.has(m));
        if (stale.length) {
            throw new Error(
                `These entries in map-countries.json no longer exist in maps.json:\n  ${stale.join('\n  ')}\n` +
                `Run: node scripts/build-country-index.js`
            );
        }
    });
});
