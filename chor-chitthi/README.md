# CHOR-CHITTHI

Offline pass-the-phone party game (PWA). Open `index.html`; add to Home Screen for full-screen play.

- `engine.js` roles, shuffling, name validation (pure logic). `engine.test.js`: `node engine.test.js`.
- `app.js` / `style.css` UI. State is stored in localStorage (`chor-chitthi-v3`).
- Roles per mode: `ROLE_CONFIG` in `engine.js`. The app only deals roles; scoring and accusation are played in person.
- `await/index.tsx` optional Await launcher widget.
