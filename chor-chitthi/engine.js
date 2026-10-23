// CHOR-CHITTHI game engine. Pure logic: no DOM, no storage. Randomness is injected.
(function (root) {
  // ---- Role configuration (edit here to change the roles per mode) ----
  const ROLE_CONFIG = {
    4: ['raja', 'rani', 'wazir', 'chor'],
    6: ['raja', 'rani', 'brother', 'chor', 'wazir', 'sipahi'],
  };
  const ROLES = {
    raja:    { name: 'Raja',          title: 'The King',        text: 'Stay calm. You gain points when the Wazir catches the Chor.' },
    rani:    { name: 'Rani',          title: 'The Queen',       text: 'Advise the Wazir by talking. You cannot force a choice.' },
    brother: { name: "Rani's Brother", title: 'The Opportunist', text: 'If the Wazir catches the Chor, you steal 15 points from the Raja.' },
    chor:    { name: 'Chor',          title: 'The Thief',       text: 'Bluff. Do not get caught by the Wazir.' },
    wazir:   { name: 'Wazir',         title: 'The Decision-Maker', text: 'Listen, then name the Chor. You get one accusation.' },
    sipahi:  { name: 'Sipahi',        title: 'The Guard',       text: 'No special power. Keep a straight face. Points are set in Settings.' },
  };
  // ---- Scoring configuration ----
  // KNOWN rules (fixed): Raja starts every round with 100 points; Rani's Brother steals exactly 15 from the Raja
  // after a correct accusation. Every other value is UNKNOWN (null) and must be set by the host before scored play.
  const FIXED_THEFT = 15;
  const DEFAULT_SCORING = {
    points: {
      raja:    { base: 100,  correct: null, wrong: null },
      rani:    { base: null, correct: null, wrong: null },
      brother: { base: null, correct: null, wrong: null },
      chor:    { base: null, correct: null, wrong: null },
      wazir:   { base: null, correct: null, wrong: null },
      sipahi:  { base: null, correct: null, wrong: null },
    },
  };
  // Lists every unset value for the roles used in a mode.
  function missingPoints(scoring, count) {
    const out = [];
    (ROLE_CONFIG[count] || []).forEach(function (r) {
      ['base', 'correct', 'wrong'].forEach(function (f) {
        const v = scoring.points[r] && scoring.points[r][f];
        if (typeof v !== 'number' || !isFinite(v)) out.push({ role: r, field: f });
      });
    });
    return out;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function secureRng() {
    const c = root.crypto;
    if (c && c.getRandomValues) {
      return function () { const b = new Uint32Array(1); c.getRandomValues(b); return b[0] / 4294967296; };
    }
    return Math.random;
  }
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // Returns roles[] aligned with player index. Exactly one of each role.
  function assignRoles(playerCount, rng) {
    const cfg = ROLE_CONFIG[playerCount];
    if (!cfg) throw new Error('Unsupported player count: ' + playerCount);
    return shuffle(cfg, rng);
  }
  function validateNames(names, count) {
    if (!ROLE_CONFIG[count]) return 'Pick 4 or 6 players.';
    if (names.length !== count) return 'Enter exactly ' + count + ' names.';
    const clean = names.map(function (n) { return String(n || '').trim(); });
    if (clean.some(function (n) { return !n; })) return 'Every player needs a name.';
    const seen = {};
    for (const n of clean) { const k = n.toLowerCase(); if (seen[k]) return 'Names must be different.'; seen[k] = 1; }
    return '';
  }
  // Pure: resolves a round without mutating anything.
  function resolveRound(roles, accusedIdx, scoring) {
    const cfg = scoring;
    if (!cfg || missingPoints(cfg, roles.length).length) throw new Error('Scoring is not fully set');
    const chorIdx = roles.indexOf('chor');
    const wazirIdx = roles.indexOf('wazir');
    if (accusedIdx === wazirIdx || accusedIdx < 0 || accusedIdx >= roles.length) throw new Error('Invalid accusation');
    const correct = accusedIdx === chorIdx;
    const deltas = roles.map(function () { return 0; });
    const log = [];
    function add(i, amt, why) { if (!amt) return; deltas[i] += amt; log.push({ player: i, amount: amt, why: why }); }
    roles.forEach(function (r, i) {
      const p = cfg.points[r];
      add(i, p.base, r === 'raja' ? 'Raja starting score' : 'Starting score');
      add(i, correct ? p.correct : p.wrong, correct ? 'Wazir caught the Chor' : 'Wazir missed the Chor');
    });
    let theft = null;
    const rajaIdx = roles.indexOf('raja');
    const brotherIdx = roles.indexOf('brother');
    if (correct && brotherIdx >= 0 && rajaIdx >= 0) {
      add(rajaIdx, -FIXED_THEFT, 'Stolen by Rani\'s Brother');
      add(brotherIdx, FIXED_THEFT, 'Stole from the Raja');
      theft = { from: rajaIdx, to: brotherIdx, amount: FIXED_THEFT };
    }
    const max = Math.max.apply(null, deltas);
    const winners = deltas.map(function (d, i) { return d === max ? i : -1; }).filter(function (i) { return i >= 0; });
    return { correct: correct, chorIdx: chorIdx, wazirIdx: wazirIdx, accusedIdx: accusedIdx, deltas: deltas, log: log, theft: theft, winners: winners };
  }
  // Applies a round result to a match exactly once (guarded by round.applied). Returns a new match object.
  function applyRound(match, round, result) {
    if (round.applied) return match;
    const totals = match.totals.map(function (t, i) { return t + result.deltas[i]; });
    return Object.assign({}, match, { totals: totals });
  }
  const api = { ROLE_CONFIG: ROLE_CONFIG, ROLES: ROLES, DEFAULT_SCORING: DEFAULT_SCORING, FIXED_THEFT: FIXED_THEFT, missingPoints: missingPoints, mulberry32: mulberry32, secureRng: secureRng,
    shuffle: shuffle, assignRoles: assignRoles, validateNames: validateNames, resolveRound: resolveRound, applyRound: applyRound };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CCEngine = api;
})(typeof self !== 'undefined' ? self : globalThis);
