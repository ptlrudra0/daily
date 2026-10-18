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

## iPhone widget + reader (Scriptable)

The widget shows today's first UNREAD story on the home screen. Tapping it
runs the script inside Scriptable, which opens the story as a paper-styled
reader with a working **Mark as read** tick. Ticking saves the read state
on-device (a JSON file in Scriptable's documents), turns to the next
unread story, and updates the home-screen widget when you leave.

1. Install the free **Scriptable** app from the App Store.
2. Open Scriptable, tap **+**, paste in the whole contents of `widget.js`,
   name it "The Daily Draft".
3. Long-press the home screen → **+** → **Scriptable** → choose the **Medium**
   widget → long-press the placed widget → **Edit Widget** → set Script to
   "The Daily Draft" and **When Interacting** to **Run Script**.
4. Done. The widget refreshes on iOS's schedule (a nudge is set for 15
   minutes) and re-renders right after every reading session.

Note: the reader's read-state lives in Scriptable; the web paper keeps its
own read-state in the browser's localStorage. The two are independent -
the paper is the archive, the widget is the ticking checklist.

## Daily update pipeline

Every morning (~7 AM IST), a new issue is added:

1. Research that day's real AI news (sourced), one AI-usage tip, one
   art/graphic-design lesson, one design lesson drawn from a film,
   series or anime (ON SCREEN), and optionally a small practice exercise.
   Personalise to the reader, a first-year AIML student: angle stories
   at problems he has and projects he could plausibly build next, not
   just his current ones. Content creation is a standing theme (he runs
   a coding-education channel and talks about starting an agency). When
   he says he is brainstorming a specific project, tailor to it until he
   stops. Do not force any of this; variety comes first.
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

Clean NEUTRAL white newsprint (#FAFAFA, equal RGB - never beige, cream,
or warm grey; check sampled means after any texture change), with subtle
static textures: a real paper-fibre photograph under the content plus a
fine SVG grain and a sparse speckle/dropout layer over it.

Print imperfections (Rudy, 18 Oct): the page should read like a real
press run, not a screen. Static and subtle; headlines and body stay
readable, ink never obscures text.
- Plates: baked into each JPEG at generation time - red channel shifted
  +1px and blue -1px horizontally (misregistration fringe), low-frequency
  plasma noise multiplied at [0.90,1.0] (uneven ink density), ~0.2% dark
  speckle (multiply) and ~0.15% white dropouts (screen), recompressed q82.
  Recipe lives in the morning agent's wake prompt.
- Display type: CSS text-shadow ghosts (vermilion + cobalt offsets) and an
  SVG feTurbulence/feDisplacementMap ink-bleed filter (scale 1.5) on the
  masthead and headlines only, never body text.
- Layout: masthead plate rotated -0.35deg, each art figure rotated
  deterministically per plate number (+/-0.25-0.45deg). The fibre is Texturelabs Paper 234
(https://texturelabs.org/textures/paper_234/, free for commercial use, no
credit needed, websites OK) - shipped ONLY as a processed derivative
(img/paper.jpg: greyscaled, levels-lifted, multiplied onto #FAFAFA (neutral),
recompressed ~55KB). Never commit pristine Texturelabs originals;
redistributing the raw resources is prohibited. Every story gets a
bordered art plate with a coloured top bar matching its desk. Solid
colours, hard shadows, print grain.
