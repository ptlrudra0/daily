// The Daily Draft - POSTER STUDY widget + reader (Scriptable)
// Design-study variant of widget.js in the TV/poster direction:
// off-white canvas, oversized condensed poster headline, IBM-Plex-Mono-style
// metadata rows, strongly rounded plate panel, full-colour plates.
// Install: copy this whole file into a new script in the Scriptable app,
// name it "The Daily Draft - poster", then point a Medium Scriptable
// widget at it with "When Interacting" = "Run Script".
// Stand-ins, flagged honestly: Scriptable cannot load Anton, so the widget
// face uses iOS's Avenir Next Condensed Bold; the reader loads real Anton.
// Scriptable widgets cannot recolour images; plates are shown in their
// original colour in both the widget face and the reader.

const FEED = "https://ptlrudra0.github.io/daily/content.json";
const PAGE = "https://ptlrudra0.github.io/daily/";

const CANVAS = new Color("#F4F1EA");
const INK    = new Color("#141412");
const SOFT   = new Color("#6E6A5E");

// ---------- read state, on-device ----------
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
function firstUnread(issue, state) {
  return issue.items.find(it => !isRead(state, issue.date, it.id));
}
function markRead(issue, id) {
  const s = loadState();
  const set = new Set(s[issue.date] || []);
  set.add(id);
  s[issue.date] = [...set];
  saveState(s);
}

// ---------- home-screen widget ----------
async function buildWidget(issue, state) {
  const w = new ListWidget();
  w.backgroundColor = CANVAS;
  w.setPadding(14, 16, 12, 16);
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);

  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const lead = firstUnread(issue, state);

  // compact masthead row, mono style
  const top = w.addStack();
  top.layoutHorizontally();
  const name = top.addText("THE DAILY DRAFT");
  name.font = Font.monospacedSystemFont(9, 2);
  name.textColor = INK;
  top.addSpacer();
  const vol = top.addText("№ " + issue.number);
  vol.font = Font.monospacedSystemFont(9, 0);
  vol.textColor = SOFT;

  // hairline
  const rule = w.addText("───────────────────────");
  rule.font = Font.systemFont(5);
  rule.textColor = INK;
  w.addSpacer(6);

  if (!lead) {
    const stamp = w.addText("ALL READ");
    stamp.font = new Font("AvenirNextCondensed-Bold", 34);
    stamp.textColor = INK;
    w.addSpacer(4);
    const sub = w.addText("That's the paper. Tap for the archive.");
    sub.font = Font.systemFont(11);
    sub.textColor = SOFT;
    w.addSpacer();
    const foot = w.addStack();
    foot.layoutHorizontally();
    const dt = foot.addText(dayStr.toUpperCase() + "  ·  № " + issue.number);
    dt.font = Font.monospacedSystemFont(9, 0);
    dt.textColor = SOFT;
    foot.addSpacer();
    const open = foot.addText("ARCHIVE →");
    open.font = Font.monospacedSystemFont(9, 2);
    open.textColor = INK;
    w.url = PAGE;
    return w;
  }

  const idx = issue.items.indexOf(lead) + 1;
  w.addSpacer(4);

  // poster composition: giant story number, condensed headline, plate thumb
  const mid = w.addStack();
  mid.layoutHorizontally();
  mid.centerAlignContent();
  const numCol = mid.addStack();
  numCol.layoutVertically();
  const num = numCol.addText(String(idx).padStart(2, "0"));
  num.font = new Font("AvenirNextCondensed-Bold", 46);
  num.textColor = new Color(lead.accent || "#141412");
  const ofTot = numCol.addText("/ " + String(issue.items.length).padStart(2, "0"));
  ofTot.font = Font.monospacedSystemFont(8, 0);
  ofTot.textColor = SOFT;
  mid.addSpacer(10);
  const left = mid.addStack();
  left.layoutVertically();
  const head = left.addText(lead.headline.toUpperCase());
  head.font = new Font("AvenirNextCondensed-Bold", 22);
  head.textColor = INK;
  head.lineLimit = 4;
  head.minimumScaleFactor = 0.55;
  mid.addSpacer(8);
  if (lead.image) {
    try {
      const img = await new Request(PAGE + lead.image).loadImage();
      const pic = mid.addImage(img);
      pic.imageSize = new Size(84, 58);
      pic.cornerRadius = 14;
      pic.rightAlignImage();
    } catch (e2) {}
  }

  w.addSpacer();

  // footer row
  const foot = w.addStack();
  foot.layoutHorizontally();
  foot.centerAlignContent();
  const dt = foot.addText("NO. " + String(idx).padStart(2, "0") + "/" + String(issue.items.length).padStart(2, "0") + "  ·  " + dayStr.toUpperCase());
  dt.font = Font.monospacedSystemFont(8, 0);
  dt.textColor = SOFT;
  foot.addSpacer();
  const open = foot.addText("READ & TICK →");
  open.font = Font.monospacedSystemFont(8, 2);
  open.textColor = INK;
  return w;
}

// ---------- in-app reader ----------
const KIND_VERB = {
  "AI TIP": "Prompting desk", "DESIGN": "Design desk", "AI NEWS": "News wire",
  "TRY THIS": "Practice desk", "ON SCREEN": "Screen desk"
};
function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function splitHead(h) {
  const w = String(h || "").split(/\s+/);
  if (w.length < 4) return [h, ""];
  const m = Math.ceil(w.length / 2);
  return [w.slice(0, m).join(" "), w.slice(m).join(" ")];
}
function hsClass(part) {
  const n = (part || "").length;
  if (n <= 12) return "hs-xl";
  if (n <= 20) return "hs-l";
  if (n <= 30) return "hs-m";
  return "hs-s";
}

function pageCSS() {
  return `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  <style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#F4F1EA;color:#141412;font-family:"Inter",-apple-system,"Segoe UI",sans-serif;padding:18px 16px 48px;-webkit-font-smoothing:antialiased}
  .mono{font-family:"IBM Plex Mono",ui-monospace,monospace;text-transform:uppercase;letter-spacing:.14em}
  .mast{display:flex;justify-content:space-between;align-items:baseline;font-size:10px;border-bottom:2px solid #141412;padding-bottom:10px}
  .mast .brand{font-weight:600}
  .dots{display:flex;gap:6px;margin:16px 0 0}
  .dots a{flex:1;padding:10px 0;text-decoration:none}
  .dots a i{display:block;height:3px;border-radius:3px;background:rgba(20,20,18,.16)}
  .dots a.read i{background:rgba(20,20,18,.4)}
  .dots a.cur i{background:#141412}
  .story{padding-top:44px}
  .kicker{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:10px;color:#6E6A5E}
  .kicker b{color:#141412;font-weight:600}
  .bignum{font-family:"Anton",Impact,sans-serif;font-size:110px;line-height:.82;color:var(--a1,#141412);margin:22px 0 0 -4px}
  .bignum span{font-family:"IBM Plex Mono",monospace;font-size:11px;font-weight:500;letter-spacing:.18em;color:#6E6A5E}
  .headline{font-family:"Anton",Impact,sans-serif;font-weight:400;text-transform:uppercase;line-height:.94;letter-spacing:.005em}
  .hl-a{margin-top:10px}
  .hl-b{margin-top:6px}
  .hs-xl{font-size:76px} .hs-l{font-size:58px} .hs-m{font-size:44px} .hs-s{font-size:34px}
  .plate{margin:10px 0;position:relative}
  .infofig{margin:24px 0 0;position:relative}
  .infolbl{position:absolute;transform:translate(-50%,-50%);font:600 9px "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:#141412;background:rgba(250,250,248,.94);border:1.5px solid #141412;border-radius:8px;padding:3px 6px;max-width:44%;text-align:center;line-height:1.35}
  .plate img{display:block;width:100%;height:auto;border-radius:26px}
  .plate .over{position:absolute;left:16px;bottom:16px;font-size:9px;font-weight:600;color:#F4F1EA;background:rgba(20,20,18,.82);border-radius:8px;padding:5px 9px}
  .pcap{font-size:9px;color:#6E6A5E;margin:8px 2px 0}
  .deck{font-style:italic;font-size:17.5px;line-height:1.5;color:#3A382F;max-width:24em;margin:30px 0 0 12%}
  .body{font-size:16.5px;line-height:1.7;margin-top:36px;max-width:34em}
  .example{font-style:italic;font-size:15.5px;line-height:1.6;color:#3A382F;margin:24px 0 0 12%;max-width:30em}
  .points{list-style:none;max-width:34em;margin-top:26px}
  .points li{position:relative;padding:10px 0 4px 24px}
  .points li::before{content:"";position:absolute;left:2px;top:1.5em;width:8px;height:8px;background:var(--a1,#141412)}
  .points li:nth-child(3n+2)::before{background:var(--a2,var(--a1,#141412))}
  .points li:nth-child(3n+3)::before{background:var(--a3,var(--a2,var(--a1,#141412)))}
  .points li p{font-size:15.5px;line-height:1.6}
  .why{margin:26px 0 0 12%;padding:2px 0 2px 16px;border-left:3px solid var(--a2,var(--a1,#141412));font-size:15px;line-height:1.6;max-width:30em}
  .quiz{margin-top:28px;max-width:34em}
  .quiz details{padding:12px 0;border-top:1px solid rgba(20,20,18,.18)}
  .quiz details:first-child{border-top:0}
  .quiz summary{cursor:pointer;font-weight:600;font-size:15px;list-style:none;position:relative;padding-right:26px;line-height:1.45}
  .quiz summary::after{content:"+";position:absolute;right:2px;top:-2px;font-size:20px;font-weight:400;color:var(--a3t,var(--a2t,#6E6A5E))}
  .quiz details[open] summary::after{content:"\\2212"}
  .quiz details p{margin-top:8px;color:#3d3d39;font-size:14px;line-height:1.6}
  .source{margin-top:20px;font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#6E6A5E}
  .source a{color:#141412;text-underline-offset:3px}
  .tickrow{margin-top:38px;border-top:2px solid #141412;padding-top:16px;display:flex;justify-content:space-between;align-items:center}
  .tick{display:flex;align-items:center;gap:12px;text-decoration:none;color:#141412}
  .tick .box{width:24px;height:24px;border:1.5px solid #141412;border-radius:8px;background:#fff;display:inline-block}
  .tick .lbl{font:600 11px "IBM Plex Mono",monospace;letter-spacing:.2em;text-transform:uppercase}
  .folio{font:11px "IBM Plex Mono",monospace;letter-spacing:.1em;color:#6E6A5E}
  .folio b{color:#141412}
  .paper-link{display:block;text-align:center;margin-top:26px;font:10px "IBM Plex Mono",monospace;letter-spacing:.18em;text-transform:uppercase;color:#6E6A5E}
  .done{text-align:center;padding:44px 0 20px}
  .done .stamp{display:inline-block;font-family:"Anton",Impact,sans-serif;text-transform:uppercase;font-size:40px;line-height:1.05;border:4px solid #141412;border-radius:18px;padding:12px 26px;transform:rotate(-6deg);margin-bottom:24px}
  .done h1{font-family:"Anton",Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:28px;margin:0 0 10px}
  .done p{color:#6E6A5E;font-size:15px;line-height:1.6;max-width:320px;margin:0 auto}
  .fine{font-size:12px;line-height:1.5;color:#6E6A5E;margin-top:12px}
  .fine summary{cursor:pointer}
  .fine a{color:#141412}
</style>`;
}



function storyHTML(issue, it, idx, state) {
  const total = issue.items.length;
  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const pts = (it.points && it.points.length) ? it.points : null;
  const readCount = (state && state[issue.date]) ? state[issue.date].length : 0;
  const dots = issue.items.map((x, i) => {
    const cls = ((state && isRead(state, issue.date, x.id)) ? "read " : "") + (i === idx ? "cur" : "");
    return `<a class="${cls.trim()}" href="tdr://goto/${i}"><i></i></a>`;
  }).join("");
  const accs = (it.accents && it.accents.length) ? it.accents : [it.accent || '#141412'];
  const a1 = accs[0], a2 = accs[1] || a1, a3 = accs[2] || a2;
  const safeT = c => c.toUpperCase() === '#F2C200' ? '#A67C00' : c;
  const parts = splitHead(it.headline);
  const dShort = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return `<!DOCTYPE html><html><head>${pageCSS()}</head><body>
  <div class="mast mono"><span class="brand">The Daily Draft</span><span>№ ${issue.number} · ${esc(dShort)}</span></div>
  <div class="dots">${dots}</div>
  <div class="story" style="--a1:${a1};--a2:${a2};--a3:${a3};--a2t:${safeT(a2)};--a3t:${safeT(a3)}">
    <div class="bignum">${String(idx + 1).padStart(2, "0")}<span> / ${String(total).padStart(2, "0")} &middot; ${esc(it.kind)}</span></div>
    <h1 class="headline hl-a ${hsClass(parts[0])}">${esc(parts[0])}</h1>
    ${it.image ? `<div class="plate"><img src="${PAGE + esc(it.image)}" alt="${esc(it.image_alt || it.headline)}"></div>
    ${it.image_caption ? `<div class="pcap mono">${esc(it.image_caption)}</div>` : ""}` : ""}
    ${parts[1] ? `<h1 class="headline hl-b ${hsClass(parts[1])}">${esc(parts[1])}</h1>` : ""}
    <p class="deck">${esc(it.deck)}</p>
    <p class="body">${esc(it.body || "")}</p>
    ${it.example ? `<p class="example">${esc(it.example)}</p>` : ""}
    ${pts ? `<ol class="points">${pts.map(p => `<li><p>${esc(p)}</p></li>`).join("")}</ol>` : ""}
    ${it.info_image ? `<div class="plate infofig"><img src="${PAGE + esc(it.info_image)}" alt="${esc(it.info_alt || 'Explanatory diagram')}">${(it.info_labels || []).map(l => `<span class="infolbl" style="left:${l.x}%;top:${l.y}%;border-color:${l.c || '#141412'}">${esc(l.t)}</span>`).join("")}</div>${it.info_caption ? `<div class="pcap">${esc(it.info_caption)}</div>` : ""}` : ""}
    ${it.why ? `<div class="why"><p>${esc(it.why)}</p></div>` : ""}
    ${(it.questions && it.questions.length) ? `<div class="quiz">${it.questions.map(q => `<details><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join("")}</div>` : ""}
    ${it.source_url ? `<p class="source">Source: <a href="${esc(it.source_url)}">${esc(it.source_name || it.source_url)}</a> ↗</p>` : ""}

    <div class="tickrow">
      <a class="tick" href="tdr://read/${encodeURIComponent(it.id)}"><span class="box"></span><span class="lbl">MARK AS READ</span></a>
      <span class="folio">№ <b>${idx + 1}</b> — of ${total}</span>
    </div>
    <a class="paper-link" href="tdr://open">Read in the full paper ↗</a>
  </div>
  </body></html>`;
}

function allReadHTML(issue) {
  return `<!DOCTYPE html><html><head>${pageCSS()}</head><body>
  <div class="mast mono"><span class="brand">The Daily Draft</span><span>Vol. I</span></div>
  <div class="done">
    <div class="stamp">ALL READ</div>
    <h1>That's the paper.</h1>
    <p>All ${issue.items.length} stories read. Tomorrow's edition prints at 7 in the morning.</p>
  </div>
  <a class="paper-link" href="tdr://open">Browse the archive in the paper ↗</a>
  </body></html>`;
}

async function presentReader(issue) {
  const wv = new WebView();
  wv.shouldAllowRequest = (req) => {
    const u = req.url || "";
    if (u.startsWith("tdr://read/")) {
      markRead(issue, decodeURIComponent(u.replace("tdr://read/", "")));
      const s = loadState();
      const nxt = firstUnread(issue, s);
      if (nxt) wv.loadHTML(storyHTML(issue, nxt, issue.items.indexOf(nxt), s), PAGE);
      else wv.loadHTML(allReadHTML(issue), PAGE);
      return false;
    }
    if (u.startsWith("tdr://goto/")) {
      const i = parseInt(u.replace("tdr://goto/", ""), 10);
      if (!isNaN(i) && issue.items[i]) wv.loadHTML(storyHTML(issue, issue.items[i], i, loadState()), PAGE);
      return false;
    }
    if (u.startsWith("tdr://open")) { Safari.open(PAGE); return false; }
    return true;
  };
  const s = loadState();
  const lead = firstUnread(issue, s);
  if (lead) await wv.loadHTML(storyHTML(issue, lead, issue.items.indexOf(lead), s), PAGE);
  else await wv.loadHTML(allReadHTML(issue), PAGE);
  await wv.present(true);
}

// ---------- main ----------
try {
  // cache-busted: GitHub Pages serves a 10-min cache header and iOS caches too
  const data = await new Request(FEED + "?t=" + Date.now()).loadJSON();
  const issue = data.issues[0];
  if (config.runsInWidget) {
    Script.setWidget(await buildWidget(issue, loadState()));
  } else {
    await presentReader(issue);
    // refresh the home-screen widget with the new read state
    Script.setWidget(await buildWidget(issue, loadState()));
  }
} catch (e) {
  if (config.runsInWidget) {
    const w = new ListWidget();
    w.backgroundColor = CANVAS;
    w.setPadding(14, 16, 12, 16);
    const t = w.addText("THE DAILY DRAFT");
    t.font = Font.monospacedSystemFont(12, 2);
    t.textColor = INK;
    w.addSpacer(6);
    const s = w.addText("Could not load today's edition. Tap to retry.");
    s.font = Font.systemFont(11);
    s.textColor = SOFT;
    w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);
    Script.setWidget(w);
  } else {
    const a = new Alert();
    a.title = "The Daily Draft";
    a.message = "Could not load today's edition. Check your connection and try again.";
    a.addCancelAction("Close");
    await a.presentAlert();
  }
}
Script.complete();
