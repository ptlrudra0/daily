# CHOR-CHITTHI

Offline pass-the-phone party game (PWA). Open `index.html`; add to Home Screen for full-screen play.

- `engine.js` roles, shuffling, scoring (pure logic). `engine.test.js` run with `node engine.test.js`.
- `app.js` / `style.css` UI. State is stored in localStorage (`chor-chitthi-v1`).
- Roles per mode: `ROLE_CONFIG` in `engine.js`. Scoring defaults: `DEFAULT_SCORING` (also editable in Settings).
- `await/index.tsx` optional Await launcher widget.
