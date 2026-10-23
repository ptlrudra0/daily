// CHOR-CHITTHI game engine. Pure logic: no DOM, no storage. Randomness is injected.
(function (root) {
  // ---- Role configuration (edit here to change the roles per mode) ----
  const ROLE_CONFIG = {
    4: ['raja', 'rani', 'wazir', 'chor'],
    6: ['raja', 'rani', 'brother', 'chor', 'wazir', 'sipahi'],
  };
  const ROLES = {
    raja:    { name: 'Raja',          title: 'The King',        text: 'Stay calm. Hold your court while the others bluff.' },
    rani:    { name: 'Rani',          title: 'The Queen',       text: 'Advise the Wazir by talking. You cannot force a choice.' },
    brother: { name: "Rani's Brother", title: 'The Opportunist', text: 'If the Wazir catches the Chor, you steal 15 points from the Raja.' },
    chor:    { name: 'Chor',          title: 'The Thief',       text: 'Bluff. Do not get caught by the Wazir.' },
    wazir:   { name: 'Wazir',         title: 'The Decision-Maker', text: 'Listen, then name the Chor. You get one accusation.' },
    sipahi:  { name: 'Sipahi',        title: 'The Guard',       text: 'No special power. Keep a straight face.' },
  };
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
  const api = { ROLE_CONFIG: ROLE_CONFIG, ROLES: ROLES, mulberry32: mulberry32, secureRng: secureRng,
    shuffle: shuffle, assignRoles: assignRoles, validateNames: validateNames };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CCEngine = api;
})(typeof self !== 'undefined' ? self : globalThis);
