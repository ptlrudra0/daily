// The Daily Draft - iPhone home-screen widget + reader (Scriptable)
// Install: copy this whole file into a new script in the Scriptable app,
// name it "The Daily Draft", then long-press home screen > + > Scriptable >
// Medium > long-press the placed widget > Edit Widget > pick this script,
// and set "When Interacting" to "Run Script".
//
// Tap the widget -> the script opens today's first UNREAD story inside
// Scriptable with a working "Mark as read" tick. Ticking saves the state
// on-device and turns to the next story. The home-screen widget always
// shows your first unread story.

const FEED = "https://ptlrudra0.github.io/daily/content.json";
const PAGE = "https://ptlrudra0.github.io/daily/";

const PAPER = new Color("#FAFAFA");
const INK   = new Color("#17140F");
const SOFT  = new Color("#6B6255");
const RED   = new Color("#E8480C");
const KIND_COLORS = {
  "AI TIP":  new Color("#2B4BE0"),
  "DESIGN":  new Color("#E8480C"),
  "AI NEWS": new Color("#B87A00"),
  "TRY THIS":new Color("#CE3A6B"),
  "ON SCREEN":new Color("#CE3A6B")
};

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
  w.backgroundColor = PAPER;
  w.setPadding(16, 16, 14, 16);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const lead = firstUnread(issue, state);

  // masthead row
  const top = w.addStack();
  top.layoutHorizontally();
  const name = top.addText("THE DAILY DRAFT");
  name.font = Font.boldSystemFont(10);
  name.textColor = INK;
  top.addSpacer();
  const dot = top.addText("●");
  dot.font = Font.systemFont(8);
  dot.textColor = RED;

  w.addSpacer(2);
  const rule = w.addText("───────────────────");
  rule.font = Font.systemFont(6);
  rule.textColor = SOFT;
  w.addSpacer(8);

  if (!lead) {
    // everything read: stamp + open the paper on tap
    const stamp = w.addText("ALL READ");
    stamp.font = Font.boldSystemFont(26);
    stamp.textColor = RED;
    w.addSpacer(6);
    const sub = w.addText("That's the paper. Tap for the archive.");
    sub.font = Font.systemFont(11);
    sub.textColor = SOFT;
    w.addSpacer();
    const foot = w.addStack();
    foot.layoutHorizontally();
    const dt = foot.addText(dayStr + "  ·  № " + issue.number);
    dt.font = Font.systemFont(10);
    dt.textColor = SOFT;
    foot.addSpacer();
    const open = foot.addText("Archive →");
    open.font = Font.boldSystemFont(10);
    open.textColor = RED;
    w.url = PAGE;
    return w;
  }

  // category chip
  const chip = w.addText(" " + lead.kind + " ");
  chip.font = Font.boldSystemFont(9);
  chip.textColor = PAPER;
  chip.backgroundColor = KIND_COLORS[lead.kind] || RED;

  w.addSpacer(6);

  // headline + story art
  const mid = w.addStack();
  mid.layoutHorizontally();
  mid.centerAlignContent();
  const left = mid.addStack();
  left.layoutVertically();
  const head = left.addText(lead.headline);
  head.font = Font.semiboldSystemFont(19);
  head.textColor = INK;
  head.lineLimit = 3;
  head.minimumScaleFactor = 0.8;
  mid.addSpacer(6);
  if (lead.image) {
    try {
      const img = await new Request(PAGE + lead.image).loadImage();
      const pic = mid.addImage(img);
      pic.imageSize = new Size(92, 62);
      pic.rightAlignImage();
    } catch (e2) {}
  }

  w.addSpacer();

  // footer row
  const foot = w.addStack();
  foot.layoutHorizontally();
  foot.centerAlignContent();
  const dt = foot.addText(dayStr + "  ·  № " + issue.number);
  dt.font = Font.systemFont(10);
  dt.textColor = SOFT;
  foot.addSpacer();
  const open = foot.addText("Read & tick →");
  open.font = Font.boldSystemFont(10);
  open.textColor = RED;
  return w;
}

// ---------- in-app reader ----------
const KIND_VERB = {
  "AI TIP": "Prompting desk", "DESIGN": "Design desk", "AI NEWS": "News wire",
  "TRY THIS": "Practice desk", "ON SCREEN": "Screen desk"
};
const KIND_HEX = {
  "AI TIP": "#2B4BE0", "DESIGN": "#E8480C", "AI NEWS": "#B87A00",
  "TRY THIS": "#F2C200", "ON SCREEN": "#CE3A6B"
};
function titleCase(s) {
  const small = new Set(["a","an","and","as","at","but","by","for","in","is","it","of","on","or","the","to","vs","with"]);
  const keep = new Set(["ai","api","css","ui","ux","llm","gpt"]);
  return String(s || "").toLowerCase().split(" ").map((w, i) => {
    const bare = w.replace(/[^a-z0-9]/gi, "");
    if (keep.has(bare)) return w.toUpperCase();
    if (i > 0 && small.has(bare)) return w;
    return w.replace(/(^|[^a-z0-9'])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  }).join(" ");
}
function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function pageCSS() {
  return `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400..700;1,400..700&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#FAFAFA;color:#141414;font-family:"Figtree",-apple-system,"Segoe UI",sans-serif;padding:22px 20px 48px;-webkit-font-smoothing:antialiased}
  .mast{font-family:"Inter",sans-serif;font-weight:500;font-size:10px;letter-spacing:2.2px;text-transform:uppercase;color:#6B6B66;border-bottom:1px solid #141414;padding-bottom:9px;display:flex;justify-content:space-between}
  .paper{font-family:"Fraunces",serif;font-weight:480;font-size:34px;letter-spacing:-.01em;text-align:center;padding:16px 0 12px;border-bottom:3px solid #141414;margin:0}
  .paper em{font-style:italic;color:#E8480C}
  .story{padding-top:24px}
  .chip{display:inline-flex;align-items:center;gap:8px;font-family:"Inter",sans-serif;font-weight:600;font-size:11px;letter-spacing:2.6px;text-transform:uppercase;color:#141414}
  .chip i{width:7px;height:7px;flex:none}
  .redrule{width:44px;height:3px;background:#E8480C;margin:14px 0}
  h1{font-family:"Fraunces",serif;font-weight:560;font-size:34px;line-height:1.05;letter-spacing:-.01em;margin:0 0 12px}
  .deck{font-style:italic;font-size:18px;line-height:1.5;color:#54544F;margin-bottom:18px}
  .art{margin:20px 0 22px}
  .art img{display:block;width:100%;height:auto}
  .art figcaption{display:flex;justify-content:space-between;font-family:"Inter",sans-serif;font-weight:500;font-size:9px;letter-spacing:1.8px;text-transform:uppercase;color:#6B6B66;border-top:1px solid #E4E4DF;padding-top:8px;margin-top:10px}
  .art figcaption .no{color:#E8480C}
  .byline{display:flex;gap:8px;font-family:"Inter",sans-serif;font-weight:500;font-size:10px;letter-spacing:2.2px;text-transform:uppercase;color:#6B6B66;border-top:1px solid #E4E4DF;border-bottom:1px solid #E4E4DF;padding:8px 0;margin-bottom:18px}
  .byline b{color:#141414;font-weight:600}
  .body{font-size:16.5px;line-height:1.66;text-align:justify;hyphens:auto}
  .body::first-letter{font-family:"Fraunces",serif;font-weight:600;font-size:52px;float:left;line-height:.8;padding:3px 9px 0 0;color:#141414}
  .why{margin-top:20px;padding:2px 0 2px 14px;border-left:2px solid #2B4BE0;font-size:15px;line-height:1.6}
  .why span{display:block;font-family:"Inter",sans-serif;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#2B4BE0;margin-bottom:5px}
  .source{margin-top:16px;font-family:"Inter",sans-serif;font-size:12px;color:#6B6B66}
  .source a{color:#141414;text-decoration-color:#E8480C;text-underline-offset:3px}
  .tickrow{margin-top:30px;border-top:3px solid #141414;padding-top:16px;display:flex;justify-content:space-between;align-items:center}
  .tick{display:flex;align-items:center;gap:12px;text-decoration:none;color:#141414}
  .tick .box{width:24px;height:24px;border:1.5px solid #141414;background:#FAFAFA;display:inline-block}
  .tick .lbl{font-family:"Inter",sans-serif;font-weight:600;font-size:13px;letter-spacing:2.2px;text-transform:uppercase}
  .folio{font-family:"Inter",sans-serif;font-size:12px;letter-spacing:1.5px;color:#6B6B66}
  .folio b{color:#E8480C;font-weight:600}
  .paper-link{display:block;text-align:center;margin-top:26px;font-family:"Inter",sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B66;text-decoration-color:#E8480C}
  .done{text-align:center;padding:44px 0 20px}
  .done .stamp{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid #E8480C;color:#E8480C;border-radius:50%;width:140px;height:140px;font-family:"Fraunces",serif;font-style:italic;font-weight:600;font-size:24px;line-height:1.1;transform:rotate(-8deg);margin-bottom:24px}
  .done h1{font-size:30px;margin-bottom:10px}
  .done p{color:#6B6B66;font-style:italic;font-size:15px;line-height:1.6;max-width:320px;margin:0 auto}
  </style>`;
}

function storyHTML(issue, it, idx) {
  const total = issue.items.length;
  const hex = KIND_HEX[it.kind] || "#B87A00";
  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `<!DOCTYPE html><html><head>${pageCSS()}</head><body>
  <div class="mast"><span>Morning edition</span><span>Vol. I</span></div>
  <h1 class="paper">The Daily <em>Draft</em></h1>
  <div class="mast" style="border-bottom:1px solid #E4E4DF;padding:8px 0"><span>${esc(dayStr)}</span><span>Issue № ${issue.number}</span></div>
  <div class="story">
    <span class="chip"><i style="background:${hex}"></i>${esc(it.kind)}</span>
    <div class="redrule"></div>
    <h1>${esc(titleCase(it.headline))}</h1>
    <p class="deck">${esc(it.deck)}</p>
    ${it.image ? `<figure class="art"><img src="${PAGE + esc(it.image)}" alt=""><figcaption><span>Illustration · The Daily Draft</span><span class="no">Plate № ${idx + 1}</span></figcaption></figure>` : ""}
    <div class="byline"><b>${esc(KIND_VERB[it.kind] || "News wire")}</b><span>·</span><span>${esc(it.reading_time || "1 min read")}</span></div>
    <p class="body">${esc(it.body)}</p>
    ${it.why ? `<div class="why"><span>Why it matters</span>${esc(it.why)}</div>` : ""}
    ${it.source_url ? `<p class="source">Filed from <a href="${esc(it.source_url)}">${esc(it.source_name || it.source_url)}</a> ↗</p>` : ""}
    <div class="tickrow">
      <a class="tick" href="tdr://read/${encodeURIComponent(it.id)}"><span class="box"></span><span class="lbl">MARK AS READ</span></a>
      <span class="folio">№ <b>${idx + 1}</b> — of ${total}</span>
    </div>
    <a class="paper-link" href="tdr://open">Read in the full paper ↗</a>
  </div></body></html>`;
}

function allReadHTML(issue) {
  return `<!DOCTYPE html><html><head>${pageCSS()}</head><body>
  <div class="mast"><span>Morning edition</span><span>Vol. I</span></div>
  <h1 class="paper">The Daily <em>Draft</em></h1>
  <div class="done">
    <div class="stamp">ALL<br>READ</div>
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
      if (nxt) wv.loadHTML(storyHTML(issue, nxt, issue.items.indexOf(nxt)), PAGE);
      else wv.loadHTML(allReadHTML(issue), PAGE);
      return false;
    }
    if (u.startsWith("tdr://open")) { Safari.open(PAGE); return false; }
    return true;
  };
  const s = loadState();
  const lead = firstUnread(issue, s);
  if (lead) await wv.loadHTML(storyHTML(issue, lead, issue.items.indexOf(lead)), PAGE);
  else await wv.loadHTML(allReadHTML(issue), PAGE);
  await wv.present(true);
}

// ---------- main ----------
try {
  const data = await new Request(FEED).loadJSON();
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
    w.backgroundColor = PAPER;
    w.setPadding(16, 16, 14, 16);
    const t = w.addText("The Daily Draft");
    t.font = Font.boldSystemFont(16);
    t.textColor = INK;
    w.addSpacer(6);
    const s = w.addText("Could not load today's edition. Tap to retry.");
    s.font = Font.systemFont(11);
    s.textColor = SOFT;
    w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
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
