const E = require('./engine.js'); const assert = require('assert');
// Test-only scoring (the app ships with these values UNSET; the host must fill them).
const TS = JSON.parse(JSON.stringify(E.DEFAULT_SCORING));
for (const r in TS.points) for (const f of ['base','correct','wrong']) if (TS.points[r][f] === null) TS.points[r][f] = 0;
TS.points.raja.correct = 20; TS.points.chor.wrong = 20; TS.points.sipahi.correct = 5;
let n = 0; const t = (name, f) => { f(); n++; console.log('ok -', name); };
t('4p and 6p assign each role exactly once (2000 seeds each)', () => {
  for (const c of [4, 6]) for (let s = 0; s < 2000; s++) {
    const r = E.assignRoles(c, E.mulberry32(s));
    assert.deepStrictEqual(r.slice().sort(), E.ROLE_CONFIG[c].slice().sort());
  }
});
t('assignment varies across seeds', () => {
  const set = new Set(); for (let s = 0; s < 200; s++) set.add(E.assignRoles(6, E.mulberry32(s)).join()); assert(set.size > 50);
});
t('validateNames', () => {
  assert(E.validateNames(['a','b','c'], 4)); assert(E.validateNames(['a','b','c',' '], 4));
  assert(E.validateNames(['a','b','c','A'], 4)); assert.strictEqual(E.validateNames(['a','b','c','d'], 4), '');
  assert(E.validateNames(['a','b','c','d'], 5));
});
for (const c of [4, 6]) t(c + 'p: every accusation resolves correctly', () => {
  for (let s = 0; s < 300; s++) {
    const roles = E.assignRoles(c, E.mulberry32(s));
    for (let a = 0; a < c; a++) {
      if (roles[a] === 'wazir') { assert.throws(() => E.resolveRound(roles, a, TS)); continue; }
      const r = E.resolveRound(roles, a, TS), P = TS.points;
      const raja = roles.indexOf('raja'), br = roles.indexOf('brother');
      assert.strictEqual(r.correct, roles[a] === 'chor');
      if (r.correct) {
        if (c === 6) { assert.strictEqual(r.deltas[raja], P.raja.base + P.raja.correct - 15); assert.strictEqual(r.deltas[br], 15); assert(r.theft && r.theft.amount === 15); }
        else { assert.strictEqual(r.deltas[raja], P.raja.base + P.raja.correct); assert.strictEqual(r.theft, null); }
      } else {
        assert.strictEqual(r.theft, null); if (br >= 0) assert.strictEqual(r.deltas[br], 0);
        assert.strictEqual(r.deltas[raja], P.raja.base + P.raja.wrong);
        assert.strictEqual(r.deltas[roles.indexOf('chor')], P.chor.wrong);
      }
      // theft is zero-sum between raja and brother
      if (r.theft) assert.strictEqual(r.log.filter(l => l.why.includes('Brother') || l.why.includes('Stole')).reduce((s, l) => s + l.amount, 0), 0);
    }
  }
});
t('custom scoring is respected, theft stays fixed at 15', () => {
  const cfg = JSON.parse(JSON.stringify(TS)); cfg.theft = 40; cfg.points.sipahi.correct = 7;
  const roles = ['raja','rani','brother','chor','wazir','sipahi']; const r = E.resolveRound(roles, 3, cfg);
  assert.strictEqual(r.deltas[2], 15); assert.strictEqual(r.deltas[5], 7);
});
t('unset scoring cannot be played', () => {
  const roles = ['raja','rani','brother','chor','wazir','sipahi'];
  assert.throws(() => E.resolveRound(roles, 3, E.DEFAULT_SCORING), /not fully set/);
  assert.strictEqual(E.DEFAULT_SCORING.points.raja.base, 100);
  assert.strictEqual(E.missingPoints(E.DEFAULT_SCORING, 4).length, 11);
  assert.strictEqual(E.missingPoints(E.DEFAULT_SCORING, 6).length, 17);
  assert.strictEqual(E.missingPoints(TS, 6).length, 0);
});
t('applyRound is applied exactly once and does not mutate', () => {
  const roles = ['raja','rani','brother','chor','wazir','sipahi']; const res = E.resolveRound(roles, 3, TS);
  const m0 = { totals: [0,0,0,0,0,0] }; const round = { applied: false };
  const m1 = E.applyRound(m0, round, res); assert.deepStrictEqual(m0.totals, [0,0,0,0,0,0]);
  assert.strictEqual(m1.totals[2], 15); round.applied = true;
  const m2 = E.applyRound(m1, round, res); assert.strictEqual(m2, m1);
});
t('winner is highest round score', () => {
  const roles = ['raja','rani','brother','chor','wazir','sipahi']; assert.deepStrictEqual(E.resolveRound(roles, 3, TS).winners, [0]);
  assert.deepStrictEqual(E.resolveRound(roles, 1, TS).winners, [0]);
});
console.log(n + ' test groups passed');
