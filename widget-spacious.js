// The Daily Draft - spacious ticket widget + article opener (Scriptable)
//
// Install:
//   1. Copy this whole file into a new script in the Scriptable app,
//      name it e.g. "The Daily Draft - Ticket".
//   2. Long-press home screen > + > Scriptable > pick a size (small,
//      medium or large - all three are designed) > long-press the placed
//      widget > Edit Widget > choose this script, and set
//      "When Interacting" to "Run Script".
//   3. Tap the widget -> today's edition opens inside Scriptable at your
//      first unread story (the new spacious article design, with its
//      scroll-reveal animations). When you close it, your read marks sync
//      back so the widget face stays on the right story.
//
// Notes:
//   - Headlines/numerals use Impact, the closest iOS built-in to the
//     site's Anton. If a device lacks it, iOS falls back to a system font.
//   - The train-ticket side notches are drawn visual styling, not real
//     cut-outs - the home-screen wallpaper does not show through.
//   - Read marks made inside the article live in the page's own storage;
//     after you close the article this script quietly re-reads them so the
//     home-screen face can show your first unread story.

const FEED = "https://ptlrudra0.github.io/daily/content.json";
const PAGE = "https://ptlrudra0.github.io/daily/type-a4/";
const PAGE_STATE_KEY = "tdr-read-poster";

const PAPER = new Color("#F4F1EA");
const NOTCH = new Color("#E4DFD2");
const INK   = new Color("#141412");
const SOFT  = new Color("#6E6A5E");
const FADE  = new Color("#141412", 0.14);
const DEF_A1 = new Color("#E8480C");

// ---------- read state, on-device (same file the classic widget uses) ----------
const FM = FileManager.local();
const STATE_PATH = FM.documentsDirectory() + "/daily-draft-read.json";
function loadState() {
  try {
    if (FM.fileExists(STATE_PATH)) return JSON.parse(FM.readString(STATE_PATH));
  } catch (e) {}
  return {};
}
function saveState(s) { FM.writeString(STATE_PATH, JSON.stringify(s)); }
function isRead(state, date, id) { return (state[date] || []).includes(id); }
function firstUnreadIdx(issue, state) {
  const i = issue.items.findIndex(it => !isRead(state, issue.date, it.id));
  return i === -1 ? issue.items.length : i;
}

// ---------- ticket background (paper + side notches) ----------
function ticketBG(wPts, hPts) {
  const dc = new DrawContext();
  dc.size = new Size(wPts, hPts);
  dc.opaque = false;
  dc.respectScreenScale = true;
  dc.setFillColor(PAPER);
  dc.fillRect(new Rect(0, 0, wPts, hPts));
  const r = 8;
  const cy = hPts / 2;
  dc.setFillColor(NOTCH);
  dc.fillEllipse(new Rect(-r, cy - r, r * 2, r * 2));
  dc.fillEllipse(new Rect(wPts - r, cy - r, r * 2, r * 2));
  return dc.getImage();
}
const FAMILY_PTS = { small: [155, 155], medium: [329, 155], large: [329, 345] };

// ---------- shared bits ----------
function masthead(w, issue, small) {
  const top = w.addStack();
  top.layoutHorizontally();
  top.centerAlignContent();
  const name = top.addText(small ? "DAILY DRAFT" : "THE DAILY DRAFT");
  name.font = new Font("Menlo", small ? 6.5 : 8);
  name.textColor = SOFT;
  top.addSpacer();
  const d = new Date(issue.date + "T12:00:00");
  const when = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
  const no = top.addText(small ? ("N " + issue.number) : ("N " + issue.number + " · " + when));
  no.font = new Font("Menlo", small ? 6.5 : 8);
  no.textColor = SOFT;
}
function dashes(w, total, curIdx) {
  const row = w.addStack();
  row.layoutHorizontally();
  row.spacing = 4;
  for (let i = 0; i < total; i++) {
    const d = row.addStack();
    d.size = new Size(10, 3);
    d.cornerRadius = 1.5;
    d.backgroundColor = (i === curIdx) ? INK : FADE;
  }
}

// ---------- widget faces ----------
async function buildWidget(issue, state, family) {
  const w = new ListWidget();
  const [wp, hp] = FAMILY_PTS[family] || FAMILY_PTS.medium;
  w.backgroundImage = ticketBG(wp, hp);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  const idx = firstUnreadIdx(issue, state);
  const total = issue.items.length;
  w.url = PAGE + "?date=" + issue.date;

  if (idx >= total) {
    w.setPadding(16, 16, 14, 16);
    masthead(w, issue, family === "small");
    w.addSpacer();
    const stamp = w.addText("ALL READ");
    stamp.font = new Font("Impact", 24);
    stamp.textColor = DEF_A1;
    const sub = w.addText("That's the paper. Tomorrow's edition prints at 7 in the morning.");
    sub.font = Font.systemFont(10);
    sub.textColor = SOFT;
    w.addSpacer();
    return w;
  }

  const it = issue.items[idx];
  const acc = new Color((it.accents && it.accents[0]) || it.accent || "#E8480C");

  if (family === "small") {
    w.setPadding(14, 14, 12, 14);
    masthead(w, issue, true);
    w.addSpacer();
    const num = w.addText(String(idx + 1));
    num.font = new Font("Impact", 44);
    num.textColor = acc;
    const kind = w.addText(it.kind.toUpperCase());
    kind.font = new Font("Menlo", 7);
    kind.textColor = SOFT;
    w.addSpacer(8);
    dashes(w, total, idx);
  } else if (family === "medium") {
    w.setPadding(14, 18, 12, 18);
    masthead(w, issue, false);
    w.addSpacer();
    const head = w.addText(it.headline.toUpperCase());
    head.font = new Font("Impact", 17);
    head.textColor = INK;
    head.lineLimit = 2;
  } else {
    w.setPadding(16, 20, 14, 20);
    masthead(w, issue, false);
    w.addSpacer(10);
    const numrow = w.addStack();
    numrow.layoutHorizontally();
    numrow.bottomAlignContent();
    const num = numrow.addText(String(idx + 1));
    num.font = new Font("Impact", 56);
    num.textColor = acc;
    const suffix = numrow.addText("  / " + String(total).padStart(2, "0") + " · " + it.kind.toUpperCase());
    suffix.font = new Font("Menlo", 8);
    suffix.textColor = SOFT;
    w.addSpacer();
    const head = w.addText(it.headline.toUpperCase());
    head.font = new Font("Impact", 20);
    head.textColor = INK;
    head.lineLimit = 2;
    w.addSpacer(8);
    const lead = w.addText(it.lead || it.body || "");
    lead.font = Font.systemFont(10.5);
    lead.textColor = INK;
    lead.lineLimit = 3;
    w.addSpacer(10);
    const foot = w.addStack();
    foot.layoutHorizontally();
    foot.centerAlignContent();
    const dr = foot.addStack();
    dr.layoutHorizontally();
    dr.spacing = 4;
    for (let i = 0; i < total; i++) {
      const d = dr.addStack();
      d.size = new Size(10, 3);
      d.cornerRadius = 1.5;
      d.backgroundColor = (i === idx) ? INK : FADE;
    }
    foot.addSpacer();
    const tap = foot.addText("TAP TO READ");
    tap.font = new Font("Menlo", 7.5);
    tap.textColor = SOFT;
  }
  return w;
}

// ---------- run ----------
const issue = await (async () => {
  const r = new Request(FEED + "?t=" + Date.now());
  const data = await r.loadJSON();
  return data.issues[0];
})();
let state = loadState();

if (config.runsInWidget) {
  Script.setWidget(await buildWidget(issue, state, config.widgetFamily || "medium"));
  Script.complete();
} else {
  // tapped: open today's edition inside Scriptable at the first unread story
  const v = new WebView();
  await v.loadURL(PAGE + "?date=" + issue.date);
  await v.present(true);
  // sync the marks made in the article back to the widget face
  try {
    const probe = new WebView();
    await probe.loadURL(PAGE + "?date=" + issue.date);
    const raw = await probe.evaluateJavaScript("localStorage.getItem('" + PAGE_STATE_KEY + "')");
    if (raw) {
      const fromPage = JSON.parse(raw);
      const merged = loadState();
      for (const date of Object.keys(fromPage)) {
        const set = new Set([...(merged[date] || []), ...(fromPage[date] || [])]);
        merged[date] = [...set];
      }
      saveState(merged);
      state = merged;
    }
  } catch (e) {}
  Script.setWidget(await buildWidget(issue, state, config.widgetFamily || "medium"));
  Script.complete();
}
