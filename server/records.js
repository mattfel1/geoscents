/**
 * Leaderboard (record board) logic.
 *
 * A board file keeps `entries`: every score that is part of a displayed slot, best first, with repeats of the same
 * score by the same player counted rather than duplicated. The five slots the client shows (record1..5,
 * recordName1..5, ...) are derived from the entries: a player's consecutive scores within RECORD_BUCKET_WIDTH of
 * their best share one slot, shown as "6600 - 6571 (5x)". Another player's score in between splits the run, so a
 * new score always gets its own slot, even if that pushes two others off the board. recordScores1..5 list the
 * [score, count] pairs in each slot so the client can show the breakdown.
 */

const CONSTANTS = require('../resources/constants.js');
const NUM_SLOTS = 5;

const copy = (x) => JSON.parse(JSON.stringify(x));

// Raw player names are limited to letters, digits, spaces, ? and ! (see playerJoin), so stripping everything else
// removes flair/clown/ready decorations from display names
const rawNameOf = (name) => String(name).replace(/[^a-zA-Z0-9 ?!]/g, '').trim();

// The board's entries, best first. Boards from before entries were stored only have the five slots.
const entriesOf = (board) => {
    if (Array.isArray(board.entries)) return board.entries.map(e => Object.assign({}, e));
    const entries = [];
    for (let i = 1; i <= NUM_SLOTS; i++) {
        if (!(board['record' + i] > 0)) continue;
        entries.push({
            score: board['record' + i],
            name: board['recordName' + i],
            rawName: board['recordRawName' + i] || rawNameOf(board['recordName' + i]),
            color: board['recordColor' + i],
            count: 1,
            broken: !!board['recordBroken' + i],
        });
    }
    return entries;
};

// Board for the given entries: fills the five slots and keeps only the entries that are part of them
// (entries below the fifth slot can never come back, since scores only ever get added)
const boardOf = (entries) => {
    // Stable sort, so ties keep the earlier score ahead
    entries = entries.slice().sort((a, b) => b.score - a.score);
    const slots = [];
    for (const e of entries) {
        const last = slots[slots.length - 1];
        if (last && last[0].rawName === e.rawName && last[0].score - e.score < CONSTANTS.RECORD_BUCKET_WIDTH) last.push(e);
        else slots.push([e]);
    }
    const board = copy(CONSTANTS.INIT_RECORD);
    slots.slice(0, NUM_SLOTS).forEach((members, i) => {
        const n = i + 1;
        board['record' + n] = members[0].score;
        board['recordLow' + n] = members[members.length - 1].score;
        board['recordCount' + n] = members.reduce((sum, m) => sum + m.count, 0);
        board['recordName' + n] = members[0].name;
        board['recordRawName' + n] = members[0].rawName;
        board['recordColor' + n] = members[0].color;
        board['recordBroken' + n] = members.some(m => m.broken);
        board['recordScores' + n] = members.map(m => [m.score, m.count]); // shown when the slot is clicked
    });
    board.entries = [].concat(...slots.slice(0, NUM_SLOTS));
    return board;
};

// Add a score to a board. Returns the new board and whether the score made it onto the board.
const addScore = (board, score, name, rawName, color) => {
    const entries = entriesOf(board);
    let entry = entries.find(e => e.score === score && e.rawName === rawName);
    if (entry) {
        entry.count += 1;
        entry.broken = true;
    } else {
        entry = { score, name, rawName, color, count: 1, broken: true };
        entries.push(entry);
    }
    const next = boardOf(entries);
    return { board: next, placed: next.entries.includes(entry) };
};

// Turn off the "new record" badges
const clearBroken = (board) => boardOf(entriesOf(board).map(e => Object.assign(e, { broken: false })));

// What the client needs (the slots), without the entries behind them
const forClient = (board) => {
    const out = Object.assign({}, board);
    delete out.entries;
    return out;
};

module.exports = {
    rawNameOf,
    entriesOf,
    boardOf,
    addScore,
    clearBroken,
    forClient,
};
