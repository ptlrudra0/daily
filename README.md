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
   art/graphic-design lesson, one design lesson drawn from a film,
   series or anime (ON SCREEN), and optionally a small practice exercise.
2. Make one original illustration per story: flat risograph-print style,
   white newsprint background (#F9F9F6), palette limited to ink #17140F,
   vermilion #E8480C, cobalt #2B4BE0, amber #F2C200. No people, no text,
   no logos, no third-party imagery or IP. Export ~1200px-wide JPEGs into
   `img/<date>-<n>.jpg`.
3. Prepend a new issue object to `issues` in `content.json` (newest first),
   incrementing `number`. 4-6 items per issue. Keep bodies short; this is a
   paper, not a blog. Each item carries `image` + `image_alt` pointing at
   its illustration.
4. Every factual item carries `source_name` + `source_url`. Practice items
   need no source.
5. Commit and push to `main`. GitHub Pages redeploys automatically.

## Look

Clean white newsprint (#F9F9F6), never beige, with two subtle static
textures (fine grain + fibre) layered over the page. Every story gets a
bordered art plate with a coloured top bar matching its desk. Solid
colours, hard shadows, print grain.
