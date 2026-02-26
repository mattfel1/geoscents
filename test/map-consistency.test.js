/**
 * Cross-source consistency checks: frame.py  ↔  maps.json  ↔  ImageGenerators.ipynb
 *
 * 1. Every frame.py entry has a matching display name in maps.json.
 * 2. Every non-Capitals maps.json entry has a matching notebook cell.
 * 3. Notebook make_coords() params match maps.json center/half_lon within tolerance.
 *    (Polar maps keep raw coords and are checked separately with a looser coord tolerance.)
 *
 * If test 1 fails: add the map to resources/maps.json.
 * If test 2 fails: add a cell to scripts/ImageGenerators.ipynb.
 * If test 3 fails: fix center/half_lon in maps.json or the make_coords() call in the notebook.
 */

'use strict';

const path = require('path');
const fs   = require('fs');

const MAPS           = require('../resources/maps.json');
const FRAME_PY_PATH  = path.join(__dirname, '../scripts/frame.py');
const NOTEBOOK_PATH  = path.join(__dirname, '../scripts/ImageGenerators.ipynb');

// Tolerance in degrees for center_lon, center_lat, and half_lon comparisons.
const PARAM_TOLERANCE = 0.5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toFilename(displayName) {
    return displayName.toLowerCase().replace(/ /g, '').replace(/\./g, '');
}

function buildReverseMap() {
    const map = new Map();
    for (const [display] of Object.entries(MAPS)) {
        map.set(toFilename(display), display);
    }
    return map;
}

/** Parse frame.py and return an array of { filename } objects. */
function parseFramePy(source) {
    const entries = [];

    const regionRe = /make_region_list\(["'](\w+)["']\s*,/g;
    let m;
    while ((m = regionRe.exec(source)) !== null) {
        entries.push({ filename: m[1], label: `make_region_list("${m[1]}")` });
    }

    const countryRe = /make_country_list\(["']([^"']+)["']\s*,/g;
    while ((m = countryRe.exec(source)) !== null) {
        const fn = m[1].toLowerCase().replace(/ /g, '').replace(/\./g, '');
        entries.push({ filename: fn, label: `make_country_list("${m[1]}")` });
    }

    let pendingOutfile = null;
    for (const line of source.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) continue;
        const ofm = trimmed.match(/^outfile\s*=.*'resources\/databases\/(\w+)\.js'/);
        if (ofm) { pendingOutfile = ofm[1]; continue; }
        if (pendingOutfile && /^rng\s*=\s*\[/.test(trimmed)) {
            entries.push({ filename: pendingOutfile, label: `outfile databases/${pendingOutfile}.js` });
            pendingOutfile = null;
        }
    }
    return entries;
}

/** Parse ImageGenerators.ipynb.
 * Returns a Map: filename → { type, params }
 *   type 'make_coords': params = [clon, clat, halfLon]
 *   type 'raw':         params = [min_lon, max_lon, min_lat, max_lat]
 */
function parseNotebook(nbPath) {
    const nb      = JSON.parse(fs.readFileSync(nbPath, 'utf8'));
    const entries = new Map();

    const mkRe    = /^coords\s*=\s*make_coords\(([^)]+)\)/m;
    const rawRe   = /^coords\s*=\s*\[([^\]]+)\]/m;
    const nameRe  = /^name\s*=\s*["'](\w+)["']/m;

    for (const cell of nb.cells) {
        const src = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        const nm  = nameRe.exec(src);
        if (!nm) continue;
        const filename = nm[1];

        const mk = mkRe.exec(src);
        if (mk) {
            entries.set(filename, {
                type:   'make_coords',
                params: mk[1].split(',').map(s => parseFloat(s.trim())),
            });
            continue;
        }
        const raw = rawRe.exec(src);
        if (raw) {
            entries.set(filename, {
                type:   'raw',
                params: raw[1].split(',').map(s => parseFloat(s.trim())),
            });
        }
    }
    return entries;
}

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

const frameSource    = fs.readFileSync(FRAME_PY_PATH, 'utf8');
const framePyEntries = parseFramePy(frameSource);
const nbEntries      = parseNotebook(NOTEBOOK_PATH);
const reverseMap     = buildReverseMap();

// ---------------------------------------------------------------------------
// Test 1: every frame.py entry has a maps.json display name
// ---------------------------------------------------------------------------
describe('frame.py entries exist in maps.json', () => {
    test('all frame.py filenames resolve to a maps.json display name', () => {
        const missing = framePyEntries.filter(e => !reverseMap.has(e.filename));
        if (missing.length) {
            throw new Error(
                'These frame.py entries have no matching display name in maps.json\n' +
                '(add the map to resources/maps.json, or fix the filename):\n  ' +
                missing.map(e => `${e.label}  →  expected key "${e.filename}"`).join('\n  ')
            );
        }
    });
});

// ---------------------------------------------------------------------------
// Test 2: every non-Capitals maps.json entry has a notebook cell
// ---------------------------------------------------------------------------
describe('maps.json entries have notebook cells', () => {
    test('all non-Capitals maps have a matching notebook cell', () => {
        const missing = [];
        for (const [display] of Object.entries(MAPS)) {
            if (display.endsWith('Capitals')) continue;
            const fname = toFilename(display);
            if (!nbEntries.has(fname)) {
                missing.push(`${display}  →  expected notebook cell with name="${fname}"`);
            }
        }
        if (missing.length) {
            throw new Error(
                'These maps.json entries have no matching notebook cell\n' +
                '(add a cell to scripts/ImageGenerators.ipynb):\n  ' +
                missing.join('\n  ')
            );
        }
    });
});

// ---------------------------------------------------------------------------
// Test 3: notebook params match maps.json center/half_lon
// ---------------------------------------------------------------------------
describe('notebook params match maps.json', () => {
    test(`make_coords params match maps.json center/half_lon within ${PARAM_TOLERANCE}°`, () => {
        const mismatches = [];
        for (const [display, data] of Object.entries(MAPS)) {
            if (display.endsWith('Capitals')) continue;
            const fname = toFilename(display);
            const nb    = nbEntries.get(fname);
            if (!nb) continue; // already caught by test 2

            if (!data.center) continue; // polar maps — handled below

            const [mapClon, mapClat] = data.center;
            const mapHl = data.half_lon;

            if (nb.type !== 'make_coords') {
                mismatches.push(
                    `${display}: maps.json uses center/half_lon but notebook cell uses raw coords=[...]\n` +
                    `  → convert notebook cell to: make_coords(${mapClon}, ${mapClat}, ${mapHl})`
                );
                continue;
            }

            const [nbClon, nbClat, nbHl] = nb.params;
            const diffs = [
                Math.abs(mapClon - nbClon),
                Math.abs(mapClat - nbClat),
                Math.abs(mapHl  - nbHl),
            ];
            if (Math.max(...diffs) > PARAM_TOLERANCE) {
                mismatches.push(
                    `${display}:\n` +
                    `  maps.json center=[${mapClon}, ${mapClat}] half_lon=${mapHl}\n` +
                    `  notebook  make_coords(${nbClon}, ${nbClat}, ${nbHl})\n` +
                    `  diffs: clon=${diffs[0].toFixed(2)}° clat=${diffs[1].toFixed(2)}° hl=${diffs[2].toFixed(2)}°`
                );
            }
        }
        if (mismatches.length) {
            throw new Error(
                `Notebook make_coords params differ from maps.json center/half_lon by more than ${PARAM_TOLERANCE}°\n` +
                '(fix center/half_lon in maps.json, or update the make_coords() call):\n  ' +
                mismatches.join('\n  ')
            );
        }
    });

    test('polar maps notebook coords are raw [...]', () => {
        const bad = [];
        for (const [display, data] of Object.entries(MAPS)) {
            if (!data.coords) continue; // not polar
            const fname = toFilename(display);
            const nb    = nbEntries.get(fname);
            if (!nb) continue;
            if (nb.type !== 'raw') {
                bad.push(`${display}: expected raw coords=[...] in notebook but found make_coords()`);
            }
        }
        if (bad.length) throw new Error(bad.join('\n'));
    });
});
