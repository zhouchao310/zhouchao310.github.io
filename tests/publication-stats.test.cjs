const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ document: { getElementById: () => null } });
vm.runInContext(fs.readFileSync(path.join(root, 'publication-stats.js'), 'utf8'), context);
const summarize = venues => JSON.parse(JSON.stringify(context.summarizePublicationYears(
    venues.map(venue => ({ querySelector: () => venue === null ? null : { textContent: venue } }))
)));

assert.deepEqual(summarize([]), { total: 0, annual: [], unknown: 0 });
assert.deepEqual(summarize(['ICIP, 2010', 'VCIP, 2012, Best Student Paper']), {
    total: 2, annual: [{ year: 2010, count: 1 }, { year: 2011, count: 0 }, { year: 2012, count: 1 }], unknown: 0
});
assert.deepEqual(summarize(['ICME, 2026, Best Paper Candidate', 'VCIP, 2026']).annual,
    [{ year: 2026, count: 2 }]);
assert.equal(summarize([null, 'Unknown', '2025–2026']).unknown, 3);
assert.deepEqual(summarize(['ICIP, 2026', 'VCIP, 2027']).annual,
    [{ year: 2026, count: 1 }, { year: 2027, count: 1 }]);

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const cards = [...html.matchAll(/<div class="publication-item card">([\s\S]*?)<\/div>/g)];
const venues = cards.map(([, card]) => card.match(/<strong>([\s\S]*?)<\/strong>/)[1].replace(/<[^>]*>/g, ''));
const result = summarize(venues);
assert.equal(result.unknown, 0);
assert.equal(result.total, cards.length);
assert.equal(result.annual.reduce((sum, item) => sum + item.count, 0), cards.length);
assert.equal(result.annual.length, result.annual.at(-1).year - result.annual[0].year + 1);
console.log('PASS: empty list, zero-count years, awards, missing/ambiguous years, future years, and live page totals.');
console.log(JSON.stringify(result));
