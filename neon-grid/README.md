# Neon Grid

One game, three ways to play it: tic-tac-toe vs a bot, with a neon arcade look.
You are **X** (cyan). The bot is **O** (magenta). Scores carry over between games.

**Play the web version:** https://ptlrudra0.github.io/daily/neon-grid/

---

## 1. Web app (works everywhere, zero installs)

Open https://ptlrudra0.github.io/daily/neon-grid/ in Safari, then
**Share → Add to Home Screen**. It launches full-screen like an app and keeps
your score on the device.

## 2. Await widget (real interactive Home Screen widget)

The same game as a true tappable Home Screen widget - each cell is a real
button, no app opens when you tap.

1. Install **Await - Make Anything a Widget** from the App Store:
   https://apps.apple.com/us/app/await-make-anything-a-widget/id6755678187
   (free download, has in-app purchases, needs iOS 18+)
2. In Await, create a new widget and open its code editor.
3. Copy the whole contents of `await/index.tsx` from this repo
   (raw: https://raw.githubusercontent.com/ptlrudra0/daily/main/neon-grid/await/index.tsx)
   and paste it in, replacing the starter code.
4. Save, then long-press the Home Screen → **+** → Await → pick the **medium**
   or **large** size and choose this widget.
5. Tap a cell to play. **NEW** starts a fresh board, the middle tile is your
   score (you - bot).

If you are on a laptop, Await's `npx await-widget` computer bridge can sync the
`await/` folder directly instead of pasting (see awaitwidget.com).

## 3. Scriptable widget (free workaround, app opens on each move)

Same game, but taps are sent through Scriptable URLs - every move briefly
opens the Scriptable app. Free forever, no in-app purchases.

1. Install **Scriptable** (free): https://apps.apple.com/us/app/scriptable/id1405459188
2. In Scriptable, tap **+** , name the script exactly **Neon Grid** , and paste
   the whole contents of `scriptable/neon-grid.js`
   (raw: https://raw.githubusercontent.com/ptlrudra0/daily/main/neon-grid/scriptable/neon-grid.js).
3. Long-press the Home Screen → **+** → Scriptable → **medium** widget →
   Edit Widget → Script = **Neon Grid** → When Interacting = **Run Script**.
4. Tap a cell to move (Scriptable opens, makes the move, updates the widget -
   jump back Home). Tap the score area or run the script inside the app for a
   full-screen playable board that shares the same save.

---

## Files

| Path | What |
| --- | --- |
| `index.html` | Web version (also the visual reference for all three) |
| `await/index.tsx` | Await widget source (TSX, type-checked against `@await-widget/runtime`) |
| `scriptable/neon-grid.js` | Scriptable script (widget + in-app board) |
| `icon-180.png`, `icon-512.png`, `manifest.webmanifest` | Home Screen icon + PWA manifest |
