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
//      read marks back to the widget face. Everything stays
//      inside Scriptable - source links open in place, no
//      Safari. Re-tap the widget to return to the edition.
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
  // Confirmed in iOS 18 (maintained community table, gist mzeryck/3a97ccd1e059b3afa3c6666d27a496c9)
  "2868": { models: "iPhone 16 Pro Max / 17 Pro Max", variants: {
    text:   { small: 510, medium: 1092, large: 1146, left: 114, right: 696, top: 276, middle: 912, bottom: 1548 },
    notext: { small: 530, medium: 1138, large: 1136, left: 91, right: 699, top: 276, middle: 882, bottom: 1488 } } },
  "2796": { models: "iPhone 16 Plus / 15 Plus / 15 Pro Max / 14 Pro Max", variants: {
    text:   { small: 510, medium: 1092, large: 1146, left: 98, right: 681, top: 252, middle: 888, bottom: 1524 },
    notext: { small: 530, medium: 1139, large: 1136, left: 75, right: 684, top: 252, middle: 858, bottom: 1464 } } },
  "2622": { models: "iPhone 16 Pro / 17 / 17 Pro", variants: {
    text:   { small: 486, medium: 1032, large: 1098, left: 87, right: 633, top: 261, middle: 872, bottom: 1485 },
    notext: { small: 495, medium: 1037, large: 1035, left: 84, right: 626, top: 270, middle: 810, bottom: 1350 } } },
  "2556": { models: "iPhone 16 / 15 / 15 Pro / 14 Pro", variants: {
    text:   { small: 474, medium: 1017, large: 1062, left: 81, right: 624, top: 240, middle: 828, bottom: 1416 },
    notext: { small: 495, medium: 1047, large: 1047, left: 66, right: 618, top: 243, middle: 795, bottom: 1347 } } },
  "1334": { models: "iPhone SE 2/3", variants: {
    text:   { small: 296, medium: 642, large: 648, left: 54, right: 400, top: 60, middle: 412, bottom: 764 },
    notext: { small: 309, medium: 667, large: 667, left: 41, right: 399, top: 67, middle: 425, bottom: 783 } } },
  // Confirmed on older iOS only (single variant)
  "2778": { models: "14 Plus / 13 Pro Max / 12 Pro Max", variants: { text: { small: 510, medium: 1092, large: 1146, left: 96, right: 678, top: 246, middle: 882, bottom: 1518 } } },
  "2688": { models: "11 Pro Max / XS Max", variants: { text: { small: 507, medium: 1080, large: 1137, left: 81, right: 654, top: 228, middle: 858, bottom: 1488 } } },
  "2532": { models: "14 / 13 / 13 Pro / 12 / 12 Pro", variants: { text: { small: 474, medium: 1014, large: 1062, left: 78, right: 618, top: 231, middle: 819, bottom: 1407 } } },
  "2436": { models: "11 Pro / XS / X", variants: { text: { small: 465, medium: 987, large: 1035, left: 69, right: 591, top: 213, middle: 783, bottom: 1353 } } },
  "2436_mini": { models: "13 mini / 12 mini", variants: { text: { small: 465, medium: 987, large: 1035, left: 69, right: 591, top: 231, middle: 801, bottom: 1371 } } },
  "1792": { models: "11 / Xr", variants: { text: { small: 338, medium: 720, large: 758, left: 54, right: 436, top: 160, middle: 580, bottom: 1000 } } },
  "2208": { models: "8 Plus and older Plus", variants: { text: { small: 471, medium: 1044, large: 1071, left: 99, right: 672, top: 114, middle: 696, bottom: 1278 } } }
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

function geoFor(fam, g) {
  return { w: (fam === "small" ? g.small : g.medium), h: (fam === "large" ? g.large : g.small) };
}
function shotPath() { return FM.documentsDirectory() + "/daily-draft-shot.jpg"; }

async function doCrop(shot, cfg) {
  const g = cfg.geo;
  const dims = geoFor(cfg.family, g);
  const x = (cfg.family === "small" && cfg.col === "right" ? g.right : g.left) + (cfg.nudge ? cfg.nudge.x : 0);
  const y = g[cfg.row] + (cfg.nudge ? cfg.nudge.y : 0);
  const slice = cropImage(shot, x, y, dims.w, dims.h);
  FM.writeImage(slicePath(cfg.family), slice);
}

async function setupWallpaper(existingShot) {
  let shot = existingShot || null;
  if (!shot) {
    const how = new Alert();
    how.title = "Wallpaper slice setup";
    how.message = "First take a screenshot of an EMPTY home-screen page: long-press your home screen, keep swiping right to the empty page, screenshot it.\n\nThen come back and pick it here. Nothing leaves your phone.";
    how.addAction("Pick my screenshot");
    how.addCancelAction("Cancel");
    if (await how.present() === -1) return false;
    shot = await Photos.fromLibrary();
    if (!shot) return false;
    FM.writeImage(shotPath(), shot);
  }
  const hpx = shot.size.height;
  let key = String(hpx);
  if (hpx === 2436) {
    const mini = await pickOption("Which iPhone?", "This screenshot size fits two layouts.", ["13 mini / 12 mini", "11 Pro / XS / X"]);
    if (mini === null) return false;
    if (mini.indexOf("mini") !== -1) key = "2436_mini";
  }
  let entry = PHONE_SIZES[key];
  if (!entry) {
    let best = null, bd = 1e9;
    for (const k of Object.keys(PHONE_SIZES)) {
      const d = Math.abs(parseInt(k) - hpx);
      if (d < bd) { bd = d; best = k; }
    }
    const f = hpx / parseInt(best);
    const sc = n => Math.round(n * f);
    const src = PHONE_SIZES[best].variants.text;
    entry = { models: "unknown (estimated)", variants: { text: {
      small: sc(src.small), medium: sc(src.medium), large: sc(src.large),
      left: sc(src.left), right: sc(src.right), top: sc(src.top), middle: sc(src.middle), bottom: sc(src.bottom) } } };
    const warn = new Alert();
    warn.title = "Phone not in the table";
    warn.message = "Estimated the crop from the closest known model. Use 'Adjust background alignment' from the menu to fine-tune it on your home screen.";
    warn.addAction("OK");
    await warn.present();
  }

  // iOS icon style shifts widget positions on newer phones
  let g = entry.variants.text;
  if (entry.variants.notext) {
    const style = await pickOption("Home screen icon style", "Settings / jiggle mode > Edit > Customize: are your app icons Small (with names) or Large (no names)?", ["Small icons (with names)", "Large icons (no names)"]);
    if (!style) return false;
    if (style.indexOf("Large") === 0) g = entry.variants.notext;
  }

  const family = await pickOption("Widget size", "Which size did you (or will you) add to the home screen?", ["Small", "Medium", "Large"]);
  if (!family) return false;
  const fam = family.toLowerCase();
  let row, col = "full";
  if (fam === "small") {
    row = await pickOption("Which row?", "Where will the widget sit?", ["Top", "Middle", "Bottom"]);
    if (!row) return false;
    col = await pickOption("Which column?", null, ["Left", "Right"]);
    if (!col) return false;
    col = col.toLowerCase();
  } else if (fam === "medium") {
    row = await pickOption("Which row?", "Where will the widget sit?", ["Top", "Middle", "Bottom"]);
    if (!row) return false;
  } else {
    row = await pickOption("Which row?", "A large widget fills two rows: which row does it START on?", ["Top", "Middle"]);
    if (!row) return false;
  }
  const cfg = { family: fam, row: row.toLowerCase(), col: col, shotHeight: hpx, models: entry.models, nudge: { x: 0, y: 0 }, setAt: Date.now() };
  cfg.geo = g;
  saveCfg(cfg);
  await doCrop(shot, cfg);

  const done = new Alert();
  done.title = "All set";
  done.message = "Wallpaper slice saved for the " + fam + " widget (" + cfg.row + (col === "full" ? "" : " " + col) + "). Add the widget to that exact slot. If the background looks slightly off, run me again and choose 'Adjust background alignment'.";
  done.addAction("Done");
  await done.present();
  return true;
}

async function adjustAlignment() {
  const cfg = loadCfg();
  if (!cfg || !FM.fileExists(shotPath())) {
    const a = new Alert();
    a.title = "Nothing to adjust";
    a.message = "Run 'Set up wallpaper background' first.";
    a.addAction("OK");
    await a.present();
    return;
  }
  const shot = FM.readImage(shotPath());
  for (;;) {
    const cur = cfg.nudge || { x: 0, y: 0 };
    const c = await pickOption("Adjust alignment", "Current offset: " + cur.x + "px right, " + cur.y + "px down. Nudge the background until it lines up, then check the widget.",
      ["Up", "Down", "Left", "Right", "Reset", "Done"]);
    if (!c || c === "Done") break;
    if (c === "Reset") { cfg.nudge = { x: 0, y: 0 }; }
    if (c === "Up") cfg.nudge = { x: cur.x, y: cur.y - 6 };
    if (c === "Down") cfg.nudge = { x: cur.x, y: cur.y + 6 };
    if (c === "Left") cfg.nudge = { x: cur.x - 6, y: cur.y };
    if (c === "Right") cfg.nudge = { x: cur.x + 6, y: cur.y };
    saveCfg(cfg);
    await doCrop(shot, cfg);
  }
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
    const choice = await pickOption("The Daily Draft", null, ["Read today's edition", "Set up wallpaper background", "Adjust background alignment"]);
    if (choice === "Set up wallpaper background") { await setupWallpaper(); openArticle = false; }
    else if (choice === "Adjust background alignment") { await adjustAlignment(); openArticle = false; }
    else if (!choice) openArticle = false;
  }
  if (openArticle) {
    const issue = await getIssue();
    const v = new WebView();
    await v.loadURL(PAGE + "?inapp=1&date=" + issue.date);
    await v.present(true);
    // sync the marks made in the article back to the widget face
    try {
      const probe = new WebView();
      await probe.loadURL(PAGE + "?inapp=1&date=" + issue.date);
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
