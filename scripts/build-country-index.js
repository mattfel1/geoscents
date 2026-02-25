#!/usr/bin/env node
/**
 * Builds resources/map-countries.json
 *
 * For each map in maps.json, loads the corresponding database file and
 * collects the unique country names.  The result is used by the client's
 * custom autocomplete so that typing a country name (e.g. "Barbados") surfaces
 * the map that contains it (e.g. "Lesser Antilles").
 *
 * Run with:  node scripts/build-country-index.js
 */

const path = require('path');
const fs   = require('fs');

const MAPS    = require('../resources/maps.json');
const DB_DIR  = path.join(__dirname, '../resources/databases');
const OUT     = path.join(__dirname, '../resources/map-countries.json');

const result = {};

for (const mapName of Object.keys(MAPS)) {
    const filename = mapName.toLowerCase().replace(/ /g, '').replace(/\./g, '') + '.js';
    const dbPath   = path.join(DB_DIR, filename);

    try {
        // Clear require cache so repeated runs pick up file changes
        delete require.cache[dbPath];
        const { CITIES } = require(dbPath);
        const countries  = [...new Set(CITIES.map(c => c.country).filter(Boolean))].sort();
        result[mapName]  = countries;
    } catch (e) {
        console.warn(`Warning: could not load "${filename}": ${e.message}`);
        result[mapName] = [];
    }
}

fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
console.log(`Wrote ${Object.keys(result).length} maps to ${path.relative(process.cwd(), OUT)}`);
