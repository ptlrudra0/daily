# The Daily Draft

A one-reader morning newspaper: sharper AI habits, art and graphic design
lessons, and the AI news worth knowing. Light, editorial, a modern digital
take on the printed paper.

Live at **https://ptlrudra0.github.io/daily/**

## How it works

- `index.html` — the paper. Mobile-first, Fraunces + Space Grotesk, ivory paper.
- `content.json` — every issue. Newest issue first in the `issues` array.
- Each story has a **Mark as read** checkbox. Ticking it stamps the story READ
  and turns to the next one. Read state is remembered on the device
  (localStorage), so the paper always opens on the first unread story.
- When every story is read, the paper shows an ALL READ stamp and the archive
  of back issues.

## iPhone widget (Scriptable)

The widget shows today's lead story on the home screen; tapping it opens the
paper. iOS widgets are not interactive, so the checkbox lives inside the paper
itself.

1. Install the free **Scriptable** app from the App Store.
2. Open Scriptable, tap **+**, paste in the whole contents of `widget.js`,
   name it "The Daily Draft".
3. Long-press the home screen → **+** → **Scriptable** → choose the **Medium**
   widget → long-press the placed widget → **Edit Widget** → set Script to
   "The Daily Draft".
4. Done. iOS refreshes widgets on its own schedule (usually several times an
   hour); the widget always pulls the latest `content.json` when it refreshes.

## Daily update pipeline

Every morning (~7 AM IST), a new issue is added:

1. Research that day's real AI news (sourced), one AI-usage tip, one
   art/graphic-design lesson, and optionally a small practice exercise.
2. Prepend a new issue object to `issues` in `content.json` (newest first),
   incrementing `number`. 4-6 items per issue. Keep bodies short; this is a
   paper, not a blog.
3. Every factual item carries `source_name` + `source_url`. Practice items
   need no source.
4. Commit and push to `main`. GitHub Pages redeploys automatically.
