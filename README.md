# The Daily Draft

A one-reader morning newspaper: sharper AI habits, art and graphic design
lessons, and the AI news worth knowing. Light, editorial, a modern digital
take on the printed paper.

Live at **https://ptlrudra0.github.io/daily/**

## How it works

- `index.html` — the paper. Mobile-first, Fraunces + Figtree + Inter, plain premium white.
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
   white background (#FAFAFA), palette limited to ink #141414,
   vermilion #E8480C, cobalt #2B4BE0, amber #F2C200. No people, no text,
   no logos, no third-party imagery or IP. Export 1200x800 JPEG q82 into
   `img/<date>-<n>.jpg`, shipped as generated - no post-processing.
3. Prepend a new issue object to `issues` in `content.json` (newest first),
   incrementing `number`. 4-6 items per issue. Keep bodies short; this is a
   paper, not a blog. Each item carries `image` + `image_alt` pointing at
   its illustration.
4. Every factual item carries `source_name` + `source_url`. Practice items
   need no source.
5. Commit and push to `main`. GitHub Pages redeploys automatically.

## Look

Premium editorial (Rudy, 18 Oct): plain paper, no textures, no print
effects. Page is flat neutral white #FAFAFA. Type system: Fraunces
(optical-size display serif) for the masthead, headlines, drop caps and
stamps; Figtree for body text (nearest free match to the Matter font
used by Sarvam's Indus, which is commercial); Inter for eyebrows, bylines
and meta labels. Masthead is black type with an italic vermilion "Draft".
Headlines render title-case (JS converts the stored uppercase). Eyebrow
labels are a small accent square + letterspaced Inter; rules are hairlines
(#E4E4DF) with one heavy rule under the masthead. Art plates are
borderless with a small caption; WHY IT MATTERS is a cobalt left-border
note. Keep it quiet and confident: whitespace and type do the work.
