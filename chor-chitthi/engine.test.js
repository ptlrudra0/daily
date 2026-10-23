const E = require('./engine.js'); const assert = require('assert');
let n = 0; const t = (name, f) => { f(); n++; console.log('ok -', name); };
t('4p and 6p assign each role exactly once (2000 seeds each)', () => {
  for (const c of [4, 6]) for (let s = 0; s < 2000; s++) {
    const r = E.assignRoles(c, E.mulberry32(s));
    assert.strictEqual(r.length, c);
    assert.deepStrictEqual(r.slice().sort(), E.ROLE_CONFIG[c].slice().sort());
  }
});
t('4p has exactly Raja, Rani, Wazir, Chor; 6p has all six', () => {
  assert.deepStrictEqual(E.ROLE_CONFIG[4].slice().sort(), ['chor','raja','rani','wazir']);
  assert.deepStrictEqual(E.ROLE_CONFIG[6].slice().sort(), ['brother','chor','raja','rani','sipahi','wazir']);
});
t('assignment varies across seeds and every role can land on every seat', () => {
  const set = new Set(); const seen = Array.from({length: 6}, () => new Set());
  for (let s = 0; s < 3000; s++) { const r = E.assignRoles(6, E.mulberry32(s)); set.add(r.join()); r.forEach((x, i) => seen[i].add(x)); }
  assert(set.size > 200); seen.forEach(x => assert.strictEqual(x.size, 6));
});
t('assignRoles does not mutate ROLE_CONFIG and rejects bad counts', () => {
  const before = E.ROLE_CONFIG[6].join(); E.assignRoles(6, E.mulberry32(1)); assert.strictEqual(E.ROLE_CONFIG[6].join(), before);
  assert.throws(() => E.assignRoles(5, Math.random));
});
t('secureRng produces fresh deals', () => {
  const rng = E.secureRng(); const a = E.assignRoles(6, rng).join(), seen = new Set([a]); for (let i = 0; i < 30; i++) seen.add(E.assignRoles(6, rng).join()); assert(seen.size > 5);
});
t('validateNames', () => {
  assert(E.validateNames(['a','b','c'], 4)); assert(E.validateNames(['a','b','c',' '], 4));
  assert(E.validateNames(['a','b','c','A'], 4)); assert.strictEqual(E.validateNames(['a','b','c','d'], 4), '');
  assert(E.validateNames(['a','b','c','d'], 5));
});
console.log(n + ' test groups passed');
