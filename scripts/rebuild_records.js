// Rebuild day/week/month/year record boards from player history CSVs.
//
// From 2026-03-19 until daily rooms were switched to the map's own record files, daily room games were saved to
// separate "Daily ..." boards, so the map boards are missing them (rooms writing back stale in-memory copies could
// also drop records, see Room.writeRecords). Player histories are append-only, but only exist for players with
// logging enabled, so this only ever ADDS missing scores to the existing boards and never removes anything.
//
// Usage: node scripts/rebuild_records.js <scratch dir> <out dir> [--since 2026-03-13] [--now 2026-11-18T00:00Z]
//   --since ignores history before that date (e.g. testing games before launch)
//   <scratch dir> must contain records/ and histories/ (e.g. a copy of the server's /scratch)
//   Changed boards are written to <out dir>/records/, ready to copy over /scratch/records/

const fs = require('fs');
const path = require('path');
const CONSTANTS = require('../resources/constants.js');

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

const NUM_RECORDS = 5;
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
const plays = new Map(); // recordKey -> [{time, score, color, name}]
const histDir = path.join(scratchDir, 'histories');
for (const file of fs.readdirSync(histDir).filter(f => f.endsWith('_history.csv'))) {
    for (const line of fs.readFileSync(path.join(histDir, file), 'utf8').split('\n')) {
        const m = LINE_RE.exec(line);
        if (!m) continue;
        const time = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
        const score = parseInt(m[7]);
        if (time < windows.year || time > now.getTime() || score <= 0) continue;
        if (since && time < since.getTime()) continue;
        if (!plays.has(m[6])) plays.set(m[6], []);
        plays.get(m[6]).push({ time, score, color: m[8], name: m[9] });
    }
}

const toList = (board) => {
    const list = [];
    for (let i = 1; i <= NUM_RECORDS; i++) {
        if (board['record' + i] > 0) list.push({
            score: board['record' + i],
            name: board['recordName' + i],
            color: board['recordColor' + i],
            broken: board['recordBroken' + i],
            existing: true,
        });
    }
    return list;
};
const toBoard = (list) => {
    const board = JSON.parse(JSON.stringify(CONSTANTS.INIT_RECORD));
    list.forEach((e, i) => {
        board['record' + (i + 1)] = e.score;
        board['recordName' + (i + 1)] = e.name;
        board['recordColor' + (i + 1)] = e.color;
        board['recordBroken' + (i + 1)] = !!e.broken;
    });
    return board;
};
// Board names carry flair/clown/ready decorations around the raw name, so match on substring
const alreadyListed = (list, play) => list.some(e => e.existing && e.score === play.score && e.name.includes(play.name));

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

        const list = toList(board);
        const added = [];
        // Chronological, so ties keep the earlier score ahead (getPosition uses strict >)
        const candidates = (plays.get(key) || []).filter(p => p.time >= windows[category]).sort((a, b) => a.time - b.time);
        for (const play of candidates) {
            if (alreadyListed(list, play)) continue;
            list.push(play);
            added.push(play);
        }
        // Stable sort: existing entries stay ahead of history entries with the same score
        list.sort((a, b) => b.score - a.score);
        const top = list.slice(0, NUM_RECORDS);
        const kept = added.filter(p => top.includes(p));
        if (kept.length === 0) continue;

        changedFiles++;
        fs.writeFileSync(path.join(outDir, 'records', key + '_' + category + '_record'), JSON.stringify(toBoard(top), null, 2));
        console.log(key + ' [' + category + ']');
        console.log('  before: ' + toList(board).map(e => e.score + ' ' + e.name).join(', '));
        console.log('  after:  ' + top.map(e => e.score + ' ' + e.name + (e.existing ? '' : ' (+' + new Date(e.time).toISOString().slice(0, 10) + ')')).join(', '));
    }
}
console.log('\n' + changedFiles + ' record files rebuilt into ' + path.join(outDir, 'records'));
