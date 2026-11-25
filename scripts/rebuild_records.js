// Rebuild day/week/month/year record boards from player history CSVs.
//
// From 2026-03-19 until daily rooms were switched to the map's own record files, daily room games were saved to
// separate "Daily ..." boards, so the map boards are missing them (rooms writing back stale in-memory copies could
// also drop records, see Room.writeRecords). Player histories are append-only, but only exist for players with
// logging enabled, so missing scores are only ever ADDED to the existing boards.
//
// Before 2026-03-19 the midnight daily rotation also saved the previous daily map's in-memory boards over the new
// daily map's files, copying one board across every map in the rotation, and the nightly reset skipped the Capitals
// maps entirely, so those boards were never cleared. So an existing entry is REMOVED when the history has that exact
// player+score, but never on this map within the board's window (entries with no history at all are kept).
//
// Boards are rebuilt with server/records.js, so a player's nearby scores share one slot exactly as in the game.
//
// Usage: node scripts/rebuild_records.js <scratch dir> <out dir> [--since 2026-03-13] [--now 2026-11-18T00:00Z]
//   --since ignores history before that date (e.g. testing games before launch)
//   <scratch dir> must contain records/ and histories/ (e.g. a copy of the server's /scratch)
//   Changed boards are written to <out dir>/records/, ready to copy over /scratch/records/

const fs = require('fs');
const path = require('path');
const CONSTANTS = require('../resources/constants.js');
const records = require('../server/records.js');

const args = process.argv.slice(2);
const option = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? new Date(args.splice(i, 2)[1]) : null;
};
const now = option('--now') || new Date();
const since = option('--since');
const [scratchDir, outDir] = args;
if (!scratchDir || !outDir) {
    console.log('Usage: node scripts/rebuild_records.js <scratch dir> <out dir> [--since <date>] [--now <date>]');
    process.exit(1);
}

// The old "Daily ..." boards are no longer used
const SKIP_KEYS = [CONSTANTS.LOBBY, CONSTANTS.DAILY_TRIVIA, CONSTANTS.DAILY_REGION, CONSTANTS.DAILY_CAPITAL];

// Server runs in UTC and resets at midnight: day always, week on Sunday, month on the 1st, year on Jan 1
const utcMidnight = (y, m, d) => Date.UTC(y, m, d);
const Y = now.getUTCFullYear(), M = now.getUTCMonth(), D = now.getUTCDate();
const windows = {
    day: utcMidnight(Y, M, D),
    week: utcMidnight(Y, M, D - now.getUTCDay()),
    month: utcMidnight(Y, M, 1),
    year: utcMidnight(Y, 0, 1),
};

// "2026/09/23 @ 21:44 GMT","Precolumbian Americas","5399","<font color=#6BAB6B>pepino4379592</font>",,,...
const LINE_RE = /^"(\d+)\/(\d+)\/(\d+) @ (\d+):(\d+) GMT","([^"]*)","(-?\d+)","<font color=([^>]*)>(.*)<\/font>"/;
const plays = new Map(); // recordKey -> [{time, score, color, name}], candidates to add
const allPlays = []; // every play ever, used to spot entries copied from other maps or left over from old windows
const histDir = path.join(scratchDir, 'histories');
for (const file of fs.readdirSync(histDir).filter(f => f.endsWith('_history.csv'))) {
    for (const line of fs.readFileSync(path.join(histDir, file), 'utf8').split('\n')) {
        const m = LINE_RE.exec(line);
        if (!m) continue;
        const time = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
        const score = parseInt(m[7]);
        if (time > now.getTime() || score <= 0) continue;
        allPlays.push({ key: m[6], time, score, name: m[9] });
        if (time < windows.year) continue;
        if (since && time < since.getTime()) continue;
        if (!plays.has(m[6])) plays.set(m[6], []);
        plays.get(m[6]).push({ time, score, color: m[8], name: m[9] });
    }
}

const slotsText = (board) => [1, 2, 3, 4, 5].filter(i => board['record' + i] > 0).map(i => {
    const count = board['recordCount' + i] || 1;
    const range = count > 1 && board['recordLow' + i] !== board['record' + i] ? ' - ' + board['recordLow' + i] : '';
    return board['record' + i] + range + ' ' + board['recordName' + i] + (count > 1 ? ' (' + count + 'x)' : '');
}).join(', ');
// Board names carry flair/clown/ready decorations around the raw name, so match on substring
const alreadyListed = (list, play) => list.some(e => e.existing && e.score === play.score && e.name.includes(play.name));
// Keep only the longest matching raw names, so "Trump Sucks 2 🇨🇦" isn't matched to plays by "Trump Sucks"
const historyFor = (entry) => {
    const matches = allPlays.filter(p => p.score === entry.score && entry.name.includes(p.name));
    const longest = Math.max(0, ...matches.map(p => p.name.length));
    return matches.filter(p => p.name.length === longest);
};
const doesNotBelong = (key, windowStart, entry) => {
    const matches = historyFor(entry);
    return matches.length > 0 && !matches.some(p => p.key === key && p.time >= windowStart);
};

const recordsDir = path.join(scratchDir, 'records');
const keys = new Set(fs.readdirSync(recordsDir)
    .map(f => f.match(/^(.*)_(day|week|month|year)_record$/))
    .filter(m => m)
    .map(m => m[1]));
for (const key of plays.keys()) keys.add(key);

fs.mkdirSync(path.join(outDir, 'records'), { recursive: true });
let changedFiles = 0;
for (const key of [...keys].sort()) {
    if (SKIP_KEYS.includes(key)) continue;
    for (const category of Object.keys(windows)) {
        const file = path.join(recordsDir, key + '_' + category + '_record');
        let board = JSON.parse(JSON.stringify(CONSTANTS.INIT_RECORD));
        if (fs.existsSync(file)) board = JSON.parse(fs.readFileSync(file, 'utf8'));

        const entries = records.entriesOf(board).map(e => Object.assign(e, { existing: true }));
        const removed = entries.filter(e => doesNotBelong(key, windows[category], e));
        const list = entries.filter(e => !doesNotBelong(key, windows[category], e));
        // Chronological, so ties keep the earlier score ahead
        const candidates = (plays.get(key) || []).filter(p => p.time >= windows[category]).sort((a, b) => a.time - b.time);
        for (const play of candidates) {
            if (alreadyListed(list, play)) continue;
            list.push({ score: play.score, name: play.name, rawName: play.name, color: play.color, count: 1, broken: false });
        }
        const rebuilt = records.boardOf(list.map(({ score, name, rawName, color, count, broken }) => ({ score, name, rawName, color, count, broken })));
        if (slotsText(rebuilt) === slotsText(board)) continue;

        changedFiles++;
        fs.writeFileSync(path.join(outDir, 'records', key + '_' + category + '_record'), JSON.stringify(rebuilt, null, 2));
        console.log(key + ' [' + category + ']');
        console.log('  before: ' + slotsText(board));
        if (removed.length) console.log('  removed (not played on this map in this window): ' + removed.map(e => e.score + ' ' + e.name + ' <- ' + [...new Set(historyFor(e).map(p => p.key + ' ' + new Date(p.time).toISOString().slice(0, 10)))].join('/')).join(', '));
        console.log('  after:  ' + slotsText(rebuilt));
    }
}
console.log('\n' + changedFiles + ' record files rebuilt into ' + path.join(outDir, 'records'));
