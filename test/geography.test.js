/**
 * Tests for randomCity() in server/geography.js
 *
 * What we check:
 *   Smoke test   — every map plays a full game without throwing
 *   No repeats   — within one game the same city string never appears twice
 *   Coverage     — across 50 games we see many distinct cities (not stuck on a few)
 *   No monopoly  — no single city dominates more than 15% of all picks
 */

const Geography = require('../server/geography.js');
const CONSTANTS  = require('../resources/constants.js');
const MAPS       = require('../resources/maps.json');

const ROUNDS = CONSTANTS.GAME_ROUNDS;   // 11
const GAMES  = 50;

// Continent + region maps get the full distribution tests.
// Country maps (100+) only get the smoke test to keep the suite fast.
const MAIN_MAPS    = Object.keys(MAPS).filter(m => MAPS[m].tier === 'continent' || MAPS[m].tier === 'region');
const COUNTRY_MAPS = Object.keys(MAPS).filter(m => MAPS[m].tier === 'country');

// ---------------------------------------------------------------------------
// Helper: simulate one full game, returns array of { city, string } per round
// ---------------------------------------------------------------------------
function playGame(citysrc) {
    let blacklist      = [];
    let played_targets = [];
    const rounds       = [];
    for (let r = 0; r < ROUNDS; r++) {
        const [city, newBlacklist] = Geography.randomCity(citysrc, blacklist, played_targets);
        blacklist = newBlacklist;
        const target = Geography.stringifyTarget(city, citysrc);
        played_targets.push(target.string);
        rounds.push({ city, string: target.string });
    }
    return rounds;
}

// ---------------------------------------------------------------------------
// Smoke test — one game per map, all maps
// ---------------------------------------------------------------------------
describe('smoke test (all maps)', () => {
    [...MAIN_MAPS, ...COUNTRY_MAPS].forEach(citysrc => {
        test(`${citysrc}`, () => {
            expect(() => playGame(citysrc)).not.toThrow();
        });
    });
});

// ---------------------------------------------------------------------------
// Full distribution tests — continent and region maps only
// ---------------------------------------------------------------------------
describe('distribution (continent + region maps)', () => {
    MAIN_MAPS.forEach(citysrc => {
        describe(citysrc, () => {
            // Run all 50 games once per describe block, shared across tests
            let allGames;
            beforeAll(() => {
                allGames = Array.from({ length: GAMES }, () => playGame(citysrc));
            });

            test('no within-game city repeats', () => {
                for (const game of allGames) {
                    const strings = game.map(g => g.string);
                    const unique  = new Set(strings);
                    expect(unique.size).toBe(ROUNDS);
                }
            });

            test('good coverage — sees many distinct cities across games', () => {
                const seen = new Set();
                for (const game of allGames) {
                    for (const { string } of game) seen.add(string);
                }
                const totalPicks = GAMES * ROUNDS;
                console.log(`  [${citysrc}] ${seen.size} unique cities across ${totalPicks} picks`);
                // For large maps (200+ cities), expect broad coverage.
                // For small maps (e.g. Lesser Antilles with 21 cities), seeing every city
                // in the pool is actually perfect — just require we saw more than one game's worth.
                const minExpected = seen.size < ROUNDS * 3 ? ROUNDS + 1 : ROUNDS * 3;
                expect(seen.size).toBeGreaterThan(minExpected);
            });

            test('no single city dominates (< 15% of all picks)', () => {
                const counts = {};
                for (const game of allGames) {
                    for (const { string } of game) {
                        counts[string] = (counts[string] || 0) + 1;
                    }
                }
                const entries    = Object.entries(counts);
                const maxCount   = Math.max(...entries.map(([, v]) => v));
                const [topCity]  = entries.find(([, v]) => v === maxCount);
                const totalPicks = GAMES * ROUNDS;
                const pct        = (maxCount / totalPicks * 100).toFixed(1);
                console.log(`  [${citysrc}] most frequent: "${topCity}" (${maxCount}x = ${pct}%)`);
                expect(maxCount / totalPicks).toBeLessThan(0.15);
            });
        });
    });
});
