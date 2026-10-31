// ============================================================
// THE DAILY DRAFT - TICKET WIDGET (Scriptable, iOS)
// Spacious paper-ticket home-screen widget with side punch
// notches that show your wallpaper through.
//
// COPY-PASTE INSTALL:
//   1. Open the Scriptable app > + > paste this whole file >
//      name it "The Daily Draft" > Done.
//   2. Run it once inside the app (tap the play button) and
//      choose "Set up wallpaper background" - it will ask you
//      for a screenshot of an EMPTY home-screen page (make one:
//      long-press home screen > wiggle mode > swipe to the far
//     -right empty page > take a screenshot) and which slot the
//      widget will sit in. Nothing leaves your phone.
//   3. Add the widget: long-press home screen > + > Scriptable
//      > pick the size you set up > place it in that slot >
//      long-press it > Edit Widget > Script = The Daily Draft,
//      When Interacting = Run Script.
//   4. Tap the widget any time to open today's edition inside
//      Scriptable (new spacious article design, first unread
//      story, scroll-reveal animations). Closing it syncs your
//      read marks back to the widget face.
//
// HONEST NOTES:
//   - iOS widgets cannot be truly transparent. The wallpaper
//     showing through the notches is a cropped slice of YOUR
//     wallpaper sitting behind the paper shape. If you change
//     wallpaper or move the widget, re-run the setup.
//   - Headlines/numerals use Impact, the closest iOS built-in
//     to the site's Anton typeface.
//   - Widget content is static between iOS-controlled refreshes;
//     the animations live in the article, not the widget.
// ============================================================

const FEED = "https://ptlrudra0.github.io/daily/content.json";
const PAGE = "https://ptlrudra0.github.io/daily/type-a4/";
const PAGE_STATE_KEY = "tdr-read-poster";

const PAPER = new Color("#F4F1EA");
const INK   = new Color("#141412");
const SOFT  = new Color("#6E6A5E");
const FADE  = new Color("#141412", 0.14);
const DEF_A1 = new Color("#E8480C");
const NOTCH_R = 9; // punch-notch radius, points

// ---------- read state (shared with the classic widget) ----------
const FM = FileManager.local();
const STATE_PATH = FM.documentsDirectory() + "/daily-draft-read.json";
function loadState() {
  try { if (FM.fileExists(STATE_PATH)) return JSON.parse(FM.readString(STATE_PATH)); } catch (e) {}
  return {};
}
function saveState(s) { FM.writeString(STATE_PATH, JSON.stringify(s)); }
function isRead(state, date, id) { return (state[date] || []).includes(id); }
function firstUnreadIdx(issue, state) {
  const i = issue.items.findIndex(it => !isRead(state, issue.date, it.id));
  return i === -1 ? issue.items.length : i;
}

// ---------- wallpaper-slice geometry ----------
// Home-screen widget rects per screenshot pixel height.
// Technique and base table: the community "no-background"
// method (github.com/supermamon/scriptable-no-background).
// Entries marked EST are scaled estimates for newer phones.
const PHONE_SIZES = {
  "2868": { models: "16 Pro Max / 17 Pro Max (EST)", small: { w: 522, h: 522 }, medium: { w: 1117, h: 522 }, large: { w: 1117, h: 1176 }, left: 101, right: 697, top: 289, middle: 942, bottom: 1594 },
  "2796": { models: "14 Pro Max / 15 Pro Max", small: { w: 510, h: 510 }, medium: { w: 1092, h: 510 }, large: { w: 1092, h: 1146 }, left: 99, right: 681, top: 282, middle: 918, bottom: 1554 },
  "2622": { models: "16 Pro / 17 (EST)", small: { w: 486, h: 486 }, medium: { w: 1037, h: 486 }, large: { w: 1037, h: 1089 }, left: 84, right: 636, top: 277, middle: 880, bottom: 1483 },
  "2556": { models: "14 Pro / 15 / 15 Pro", small: { w: 474, h: 474 }, medium: { w: 1014, h: 474 }, large: { w: 1014, h: 1062 }, left: 82, right: 622, top: 270, middle: 858, bottom: 1446 },
  "2778": { models: "12/13 Pro Max, 14 Plus", small: { w: 510, h: 510 }, medium: { w: 1092, h: 510 }, large: { w: 1092, h: 1146 }, left: 96, right: 678, top: 246, middle: 882, bottom: 1518 },
  "2532": { models: "12 / 12 Pro / 13 / 14", small: { w: 474, h: 474 }, medium: { w: 1014, h: 474 }, large: { w: 1014, h: 1062 }, left: 78, right: 618, top: 231, middle: 819, bottom: 1407 },
  "2688": { models: "Xs Max / 11 Pro Max", small: { w: 507, h: 507 }, medium: { w: 1080, h: 507 }, large: { w: 1080, h: 1137 }, left: 81, right: 654, top: 228, middle: 858, bottom: 1488 },
  "1792": { models: "11 / Xr", small: { w: 338, h: 338 }, medium: { w: 720, h: 338 }, large: { w: 720, h: 758 }, left: 54, right: 436, top: 160, middle: 580, bottom: 1000 },
  "2436": { models: "X / Xs / 11 Pro", small: { w: 465, h: 465 }, medium: { w: 987, h: 465 }, large: { w: 987, h: 1035 }, left: 69, right: 591, top: 213, middle: 783, bottom: 1353 },
  "2436_mini": { models: "12/13 mini", small: { w: 465, h: 465 }, medium: { w: 987, h: 465 }, large: { w: 987, h: 1035 }, left: 69, right: 591, top: 231, middle: 801, bottom: 1371 },
  "2208": { models: "6+/6s+/7+/8+", small: { w: 471, h: 471 }, medium: { w: 1044, h: 471 }, large: { w: 1044, h: 1071 }, left: 99, right: 672, top: 114, middle: 696, bottom: 1278 },
  "1334": { models: "6/6s/7/8", small: { w: 296, h: 296 }, medium: { w: 642, h: 296 }, large: { w: 642, h: 648 }, left: 54, right: 400, top: 60, middle: 412, bottom: 764 }
};

// ---------- wallpaper config ----------
const CFG_PATH = FM.documentsDirectory() + "/daily-draft-ticket.json";
function loadCfg() {
  try { if (FM.fileExists(CFG_PATH)) return JSON.parse(FM.readString(CFG_PATH)); } catch (e) {}
  return null;
}
function saveCfg(c) { FM.writeString(CFG_PATH, JSON.stringify(c)); }
function slicePath(family) { return FM.documentsDirectory() + "/daily-draft-slice-" + family + ".jpg"; }

function cropImage(img, x, y, w, h) {
  const dc = new DrawContext();
  dc.size = new Size(w, h);
  dc.opaque = true;
  dc.drawImageAtPoint(img, new Point(-x, -y));
  return dc.getImage();
}

async function pickOption(title, message, options) {
  const a = new Alert();
  a.title = title;
  if (message) a.message = message;
  options.forEach(o => a.addAction(o));
  a.addCancelAction("Cancel");
  const i = await a.presentAlert();
  return i === -1 ? null : options[i];
}

async function setupWallpaper() {
  const how = new Alert();
  how.title = "Wallpaper slice setup";
  how.message = "First take a screenshot of an EMPTY home-screen page: long-press your home screen, keep swiping right to the empty page, screenshot it.\n\nThen come back and pick it here. Nothing leaves your phone.";
  how.addAction("Pick my screenshot");
  how.addCancelAction("Cancel");
  if (await how.present() === -1) return false;

  const shot = await Photos.fromLibrary();
  if (!shot) return false;
  const hpx = shot.size.height;
  let key = String(hpx);
  if (hpx === 2436) {
    const mini = await pickOption("Which iPhone?", "This screenshot size fits two layouts.", ["12 mini / 13 mini", "X / Xs / 11 Pro"]);
    if (mini === null) return false;
    if (mini.indexOf("mini") !== -1) key = "2436_mini";
  }
  let geo = PHONE_SIZES[key];
  if (!geo) {
    // unknown phone: estimate by scaling from the closest entry
    let best = null, bd = 1e9;
    for (const k of Object.keys(PHONE_SIZES)) {
      const d = Math.abs(parseInt(k) - hpx);
      if (d < bd) { bd = d; best = k; }
    }
    const src = PHONE_SIZES[best];
    const f = hpx / parseInt(best);
    const sc = n => Math.round(n * f);
    geo = {
      models: "unknown (estimated)",
      small: { w: sc(src.small.w), h: sc(src.small.h) },
      medium: { w: sc(src.medium.w), h: sc(src.medium.h) },
      large: { w: sc(src.large.w), h: sc(src.large.h) },
      left: sc(src.left), right: sc(src.right),
      top: sc(src.top), middle: sc(src.middle), bottom: sc(src.bottom)
    };
    const warn = new Alert();
    warn.title = "Phone not in the table";
    warn.message = "I'll estimate the crop from the closest known model. If the background looks offset on the widget, re-run this setup after telling support your phone model.";
    warn.addAction("OK");
    await warn.present();
  }

  const family = await pickOption("Widget size", "Which size did you (or will you) add to the home screen?", ["Small", "Medium", "Large"]);
  if (!family) return false;
  const fam = family.toLowerCase();
  let slot;
  if (fam === "small") {
    const row = await pickOption("Which row?", "Where will the widget sit?", ["Top", "Middle", "Bottom"]);
    if (!row) return false;
    const col = await pickOption("Which column?", null, ["Left", "Right"]);
    if (!col) return false;
    slot = row.toLowerCase() + "|" + col.toLowerCase();
  } else if (fam === "medium") {
    const row = await pickOption("Which row?", "Where will the widget sit?", ["Top", "Middle", "Bottom"]);
    if (!row) return false;
    slot = row.toLowerCase() + "|full";
  } else {
    const row = await pickOption("Which row?", "A large widget fills two rows: which row does it START on?", ["Top", "Middle"]);
    if (!row) return false;
    slot = row.toLowerCase() + "|full";
  }
  const [r, c] = slot.split("|");
  const x = (fam === "small" && c === "right") ? geo.right : geo.left;
  const y = geo[r];
  const w = geo[fam].w, h = geo[fam].h;
  const slice = cropImage(shot, x, y, w, h);
  FM.writeImage(slicePath(fam), slice);
  saveCfg({ family: fam, slot: slot, shotHeight: hpx, models: geo.models, setAt: Date.now() });

  const done = new Alert();
  done.title = "All set";
  done.message = "Wallpaper slice saved for the " + fam + " widget (" + r + (c === "full" ? "" : " " + c) + "). Add the widget to that exact slot and it will blend into your wallpaper.";
  done.addAction("Done");
  await done.present();
  return true;
}

// ---------- ticket background: wallpaper slice + paper with real notch cut-outs ----------
function ticketPath(w, h, r) {
  const k = 0.5523 * r;
  const cy = h / 2;
  const p = new Path();
  p.move(new Point(0, 0));
  p.addLine(new Point(w, 0));
  p.addLine(new Point(w, cy - r));
  p.addCurve(new Point(w - r, cy), new Point(w - k, cy - r), new Point(w - r, cy - k));
  p.addCurve(new Point(w, cy + r), new Point(w - r, cy + k), new Point(w - k, cy + r));
  p.addLine(new Point(w, h));
  p.addLine(new Point(0, h));
  p.addLine(new Point(0, cy + r));
  p.addCurve(new Point(r, cy), new Point(k, cy + r), new Point(r, cy + k));
  p.addCurve(new Point(0, cy - r), new Point(r, cy - k), new Point(k, cy - r));
  p.closeSubpath();
  return p;
}
const FAMILY_PTS = { small: [155, 155], medium: [329, 155], large: [329, 345] };

function faceBackground(family) {
  const [wp, hp] = FAMILY_PTS[family] || FAMILY_PTS.medium;
  const dc = new DrawContext();
  dc.size = new Size(wp, hp);
  dc.opaque = false;
  dc.respectScreenScale = true;
  // wallpaper slice underneath (if set up), else plain canvas tone
  const cfg = loadCfg();
  if (cfg && cfg.family === family && FM.fileExists(slicePath(family))) {
    dc.drawImageInRect(FM.readImage(slicePath(family)), new Rect(0, 0, wp, hp));
  } else {
    dc.setFillColor(new Color("#E9E5DA"));
    dc.fillRect(new Rect(0, 0, wp, hp));
  }
  // paper ticket with transparent punch notches
  dc.setFillColor(PAPER);
  dc.addPath(ticketPath(wp, hp, NOTCH_R));
  dc.fillPath();
  return dc.getImage();
}

// ---------- shared face bits ----------
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
function dashRow(stack, total, curIdx) {
  stack.layoutHorizontally();
  stack.spacing = 4;
  for (let i = 0; i < total; i++) {
    const d = stack.addStack();
    d.size = new Size(10, 3);
    d.cornerRadius = 1.5;
    d.backgroundColor = (i === curIdx) ? INK : FADE;
  }
}

// ---------- widget face ----------
async function buildWidget(issue, state, family) {
  const w = new ListWidget();
  w.backgroundImage = faceBackground(family);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  const idx = firstUnreadIdx(issue, state);
  const total = issue.items.length;
  w.url = PAGE + "?date=" + issue.date;

  if (idx >= total) {
    w.setPadding(16, 18, 14, 18);
    masthead(w, issue, family === "small");
    w.addSpacer();
    const stamp = w.addText("ALL READ");
    stamp.font = new Font("Impact", 24);
    stamp.textColor = DEF_A1;
    const sub = w.addText("That's the paper. Tomorrow's edition prints at 7 in the morning.");
    sub.font = Font.systemFont(10);
    sub.textColor = SOFT;
    sub.lineLimit = 2;
    w.addSpacer();
    return w;
  }

  const it = issue.items[idx];
  const acc = new Color((it.accents && it.accents[0]) || it.accent || "#E8480C");

  if (family === "small") {
    w.setPadding(14, 16, 12, 16);
    masthead(w, issue, true);
    w.addSpacer();
    const num = w.addText(String(idx + 1));
    num.font = new Font("Impact", 44);
    num.textColor = acc;
    const kind = w.addText(it.kind.toUpperCase());
    kind.font = new Font("Menlo", 7);
    kind.textColor = SOFT;
    w.addSpacer(8);
    dashRow(w.addStack(), total, idx);
  } else if (family === "medium") {
    w.setPadding(14, 20, 12, 20);
    masthead(w, issue, false);
    w.addSpacer();
    const head = w.addText(it.headline.toUpperCase());
    head.font = new Font("Impact", 17);
    head.textColor = INK;
    head.lineLimit = 2;
    w.addSpacer(4);
  } else {
    w.setPadding(16, 22, 14, 22);
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
    dashRow(foot.addStack(), total, idx);
    foot.addSpacer();
    const tap = foot.addText("TAP TO READ");
    tap.font = new Font("Menlo", 7.5);
    tap.textColor = SOFT;
  }
  return w;
}

// ---------- data ----------
async function getIssue() {
  const r = new Request(FEED + "?t=" + Date.now());
  const data = await r.loadJSON();
  return data.issues[0];
}

// ---------- run ----------
const family = config.widgetFamily || "medium";

if (config.runsInWidget) {
  try {
    const issue = await getIssue();
    Script.setWidget(await buildWidget(issue, loadState(), family));
  } catch (e) {
    const w = new ListWidget();
    w.backgroundColor = PAPER;
    const t = w.addText("THE DAILY DRAFT");
    t.font = new Font("Menlo", 8);
    t.textColor = SOFT;
    w.addSpacer();
    const m = w.addText("Couldn't load today's edition. Check connection.");
    m.font = Font.systemFont(11);
    m.textColor = INK;
    Script.setWidget(w);
  }
  Script.complete();
} else {
  // Widget tap ("Run Script") arrives with config.widgetFamily set:
  // go straight to the article. A manual run inside the app gets the menu.
  let openArticle = true;
  if (!config.widgetFamily) {
    const choice = await pickOption("The Daily Draft", null, ["Read today's edition", "Set up wallpaper background"]);
    if (choice === "Set up wallpaper background") { await setupWallpaper(); openArticle = false; }
    else if (!choice) openArticle = false;
  }
  if (openArticle) {
    const issue = await getIssue();
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
      }
    } catch (e) {}
  }
  Script.complete();
}
