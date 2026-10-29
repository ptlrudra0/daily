// The Daily Draft - DESI DANGLERS EDITION - iPhone widget + reader (Scriptable)
// Indian-maximalism theme adapted from Rudy's Behance reference (NIFT Department
// Danglers), Gujarati masthead in place of the reference's Hindi, blurred-glow
// accents from his Greco Gum reference. Stories stay English.
// Install: copy this whole file into a new script in the Scriptable app,
// name it "The Daily Draft", then long-press home screen > + > Scriptable >
// Medium > long-press the placed widget > Edit Widget > pick this script,
// and set "When Interacting" to "Run Script".
//
// Tap the widget -> the script opens today's first UNREAD story inside
// Scriptable: the full story view - plate with its caption, key points,
// the interactive "Try it on this story" lab (explain / example / quiz /
// ask), story dots to jump between stories, and a working "Mark as read"
// tick. Ticking saves the state on-device and turns to the next unread
// story. The home-screen widget always shows your first unread story.

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
// ---------- danglers theme ----------
// Story-card rotation mirrors the reference's banner row; name plates contrast.
const DCARD = ["#F2B90C", "#2A2886", "#C6D936", "#F04E23", "#E93E8A", "#7B3FBF", "#2A2886"];
const DPLATE = ["#2A2886", "#F04E23", "#E93E8A", "#2A2886", "#C6D936", "#F2B90C", "#7B3FBF"];
const DPLATE_TXT = ["#F5EFE3", "#F5EFE3", "#F5EFE3", "#F5EFE3", "#23206E", "#23206E", "#F5EFE3"];
const DCARD_TXT = ["#23206E", "#F5EFE3", "#23206E", "#F5EFE3", "#F5EFE3", "#F5EFE3", "#F5EFE3"];
// widget-face chip: the banner/plate colour that contrasts the indigo widget field
const WCHIP_BG = ["#F2B90C", "#F04E23", "#C6D936", "#F04E23", "#E93E8A", "#7B3FBF", "#7B3FBF"];
const WCHIP_TXT = ["#23206E", "#F5EFE3", "#23206E", "#F5EFE3", "#F5EFE3", "#F5EFE3", "#F5EFE3"];
const DINDIGO = "#2A2886";
const DLIME = "#C6D936";
const DCREAM = "#F5EFE3";
// tonal background motifs per story kind (SVG data-URI, drawn with currentColor-ish tint)
function dpattern(kind, tint) {
  const P = {
    "AI TIP": "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><path d='M18 10 l26 26 -12 3 9 15 -6 4 -9 -15 -10 9 z' fill='${tint}' fill-opacity='0.16'/></svg>`),
    "DESIGN": "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><path d='M6 20 q12 -14 24 0 t24 0' stroke='${tint}' stroke-opacity='0.16' stroke-width='5' fill='none'/><path d='M6 46 q12 -14 24 0 t24 0' stroke='${tint}' stroke-opacity='0.16' stroke-width='5' fill='none'/></svg>`),
    "AI NEWS": "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><circle cx='36' cy='36' r='5' fill='${tint}' fill-opacity='0.16'/><path d='M24 24 a17 17 0 0 1 24 0 M16 16 a28 28 0 0 1 40 0' stroke='${tint}' stroke-opacity='0.16' stroke-width='5' fill='none'/></svg>`),
    "ON SCREEN": "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><rect x='8' y='22' width='56' height='28' rx='4' stroke='${tint}' stroke-opacity='0.18' stroke-width='4' fill='none'/><rect x='14' y='28' width='8' height='6' fill='${tint}' fill-opacity='0.18'/><rect x='28' y='28' width='8' height='6' fill='${tint}' fill-opacity='0.18'/><rect x='42' y='28' width='8' height='6' fill='${tint}' fill-opacity='0.18'/></svg>`),
    "TRY THIS": "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><path d='M12 12 h48 v48 h-48 z M24 24 h24 v12 h-12 v12' stroke='${tint}' stroke-opacity='0.16' stroke-width='5' fill='none'/></svg>`)
  };
  return P[kind] || P["AI NEWS"];
}


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
  const INDIGO = new Color(DINDIGO), LIME = new Color(DLIME), CREAM = new Color(DCREAM);
  w.backgroundColor = INDIGO;
  w.setPadding(16, 16, 14, 16);
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);

  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const lead = firstUnread(issue, state);
  const leadIdx = lead ? issue.items.indexOf(lead) : 0;

  // masthead row - Gujarati lockup on indigo, like the reference's Hindi stamp
  const top = w.addStack();
  top.layoutHorizontally();
  const name = top.addText("\u0AA1\u0AC7\u0A88\u0AB2\u0AC0 \u0AA1\u0ACD\u0AB0\u0ABE\u0AAB\u0ACD\u0A9F \u00B7 THE DAILY DRAFT");
  name.font = Font.boldSystemFont(11);
  name.textColor = LIME;
  top.addSpacer();
  const dot = top.addText("\u25CF");
  dot.font = Font.systemFont(8);
  dot.textColor = LIME;

  w.addSpacer(2);
  const rule = w.addText("- - - - - - - - - - - - - - - - - - -");
  rule.font = Font.systemFont(6);
  rule.textColor = LIME;
  w.addSpacer(8);

  if (!lead) {
    // everything read: stamp + open the paper on tap
    const stamp = w.addText("ALL READ");
    stamp.font = Font.boldSystemFont(26);
    stamp.textColor = LIME;
    w.addSpacer(6);
    const sub = w.addText("That's the paper. Tap for the archive.");
    sub.font = Font.systemFont(11);
    sub.textColor = CREAM;
    w.addSpacer();
    const foot = w.addStack();
    foot.layoutHorizontally();
    const dt = foot.addText(dayStr + "  \u00B7  \u2116 " + issue.number);
    dt.font = Font.systemFont(10);
    dt.textColor = CREAM;
    foot.addSpacer();
    const open = foot.addText("Archive \u2192");
    open.font = Font.boldSystemFont(10);
    open.textColor = LIME;
    w.url = PAGE;
    return w;
  }

  // riveted name-plate chip in this story's dangler plate colour
  const chip = w.addText(" " + lead.kind + " ");
  chip.font = Font.boldSystemFont(9);
  chip.textColor = new Color(WCHIP_TXT[leadIdx] || "#F5EFE3");
  chip.backgroundColor = new Color(WCHIP_BG[leadIdx] || "#F04E23");

  w.addSpacer(6);

  // headline + story art
  const mid = w.addStack();
  mid.layoutHorizontally();
  mid.centerAlignContent();
  const left = mid.addStack();
  left.layoutVertically();
  const head = left.addText(lead.headline);
  head.font = Font.semiboldSystemFont(19);
  head.textColor = CREAM;
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
  const dt = foot.addText(dayStr + "  \u00B7  \u2116 " + issue.number);
  dt.font = Font.systemFont(10);
  dt.textColor = LIME;
  foot.addSpacer();
  const open = foot.addText("Read & tick \u2192");
  open.font = Font.boldSystemFont(10);
  open.textColor = LIME;
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

function sentences(t){
  var out=[],cur="";
  var parts=String(t||"").split(/(\s+)/);
  for(var i=0;i<parts.length;i++){
    cur+=parts[i];
    var w=parts[i].trim();
    if(!w)continue;
    if(/[.!?]["')\]]*$/.test(w)){
      var next=(parts[i+2]||"").replace(/^["'(\[]+/,"");
      var bare=w.replace(/[^A-Za-z.]/g,"").replace(/\.$/,"").toLowerCase();
      var abbr=/[.!?]$/.test(w)&&w.slice(-1)==="."&&(/^[A-Za-z]$/.test(bare)||(/\d\.$/.test(w)&&/^\d/.test(next)));
      if(!abbr&&(next===""||/^[A-Z0-9]/.test(next))){out.push(cur.trim());cur=""}
    }
  }
  if(cur.trim())out.push(cur.trim());
  return out}
function chunks(body){
  var s=sentences(body),out=[],i=0;
  while(i<s.length){var a=s[i];if(i+1<s.length&&(a+" "+s[i+1]).length<=210){out.push(a+" "+s[i+1]);i+=2}else{out.push(a);i++}}
  return out}


function pageCSS() {
  return `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Shrikhand&family=Figtree:ital,wght@0,400..700;1,400..700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#F5EFE3;color:#23206E;font-family:"Figtree",-apple-system,"Segoe UI",sans-serif;padding:0 0 48px;-webkit-font-smoothing:antialiased}
  .masthead{background:#2A2886;text-align:center;padding:30px 16px 8px;position:relative;overflow:hidden}
  .lockup{font-family:"Anton",sans-serif;font-size:44px;line-height:1;color:#F5EFE3;letter-spacing:.5px}
  .lockup .guj{font-family:"Shrikhand",serif;font-weight:400;font-size:46px;color:#C6D936;padding:0 2px}
  .tagrow{position:relative;height:74px;margin-top:2px}
  .string{width:0;height:30px;margin:0 auto;border-left:2px dashed rgba(245,239,227,.85);transform:rotate(9deg);transform-origin:top center}
  .tag{position:absolute;left:50%;top:26px;transform:translateX(-50%) rotate(-7deg);background:#C6D936;color:#23206E;font-family:"Anton",sans-serif;font-size:15px;letter-spacing:2px;padding:7px 16px 6px;white-space:nowrap;box-shadow:0 0 26px 8px rgba(198,217,54,.55),0 0 60px 22px rgba(198,217,54,.25)}
  .perf{height:12px;background-color:#F5EFE3;background-image:radial-gradient(circle 6px at 12px 6px, #2A2886 6px, transparent 6.8px);background-size:24px 12px;background-repeat:repeat-x}
  .perf.flip{background-image:radial-gradient(circle 6px at 12px 6px, #2A2886 6px, transparent 6.8px)}
  .dateline{display:flex;justify-content:space-between;gap:10px;font-family:"Inter",sans-serif;font-weight:500;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#23206E;padding:14px 20px 10px}
  .dateline .guj{font-family:"Shrikhand",serif;font-size:12px;letter-spacing:.4px;text-transform:none}
  .wrap{padding:0 20px}
  .dots{display:flex;gap:6px;margin:8px 0 0}
  .dots a{flex:1;padding:12px 0;text-decoration:none}
  .dots a i{display:block;height:4px;border-radius:4px;background:#DDD3C2}
  .dots a.read i{background:#E93E8A}
  .dots a.cur i{background:#23206E}
  .dots a.cur.read i{background:linear-gradient(90deg,#23206E 50%,#E93E8A 50%)}
  .dots-cap{display:flex;justify-content:space-between;font-family:"Inter",sans-serif;font-size:9px;letter-spacing:1.8px;text-transform:uppercase;color:#6E6860;margin-top:2px}
  .dangler{--card:#F2B90C;--plate:#2A2886;--ptxt:#F5EFE3;--txt:#23206E;position:relative;overflow:hidden;background:var(--card);color:var(--txt);margin-top:16px;border-radius:6px;box-shadow:0 10px 30px rgba(35,32,110,.25)}
  .pattern{position:absolute;inset:0;background-repeat:repeat;pointer-events:none}
  .hang{position:relative;display:flex;flex-direction:column;align-items:center;padding-top:2px}
  .strings{display:flex;gap:64px;height:24px}
  .strings i{width:2px;border-left:2px dashed rgba(0,0,0,.35)}
  .nameplate{position:relative;background:var(--plate);color:var(--ptxt);font-family:"Anton",sans-serif;font-size:14px;letter-spacing:3.5px;padding:9px 30px 8px;border-radius:3px;box-shadow:0 3px 0 rgba(0,0,0,.22)}
  .nameplate::before,.nameplate::after{content:"";position:absolute;top:5px;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffffff 0%,#c9c9c9 45%,#7a7a7a 100%)}
  .nameplate::before{left:7px}
  .nameplate::after{right:7px}
  .art{position:relative;margin:18px 20px 6px;text-align:center}
  .art .bloom{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:78%;height:240px;background:radial-gradient(closest-side,var(--plate) 0%,transparent 72%);filter:blur(30px);opacity:.6;pointer-events:none}
  .art img{position:relative;display:block;width:100%;height:auto;border-radius:4px;box-shadow:0 14px 28px rgba(0,0,0,.35)}
  .art .platform{display:block;width:64%;height:16px;margin:-8px auto 0;background:radial-gradient(ellipse at center,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 70%);position:relative}
  .art figcaption{position:relative;display:flex;justify-content:space-between;gap:8px;font-family:"Inter",sans-serif;font-weight:500;font-size:9px;letter-spacing:1.6px;text-transform:uppercase;color:var(--txt);opacity:.85;padding-top:10px;margin-top:6px;text-align:left}
  .dangler.lighttext .art figcaption,.dangler.lighttext .source,.dangler.lighttext .folio{opacity:1}
  .dangler.lighttext .sec,.dangler.lighttext .why span{opacity:.92}
  .art figcaption .no{white-space:nowrap}
  h1{position:relative;font-family:"Anton",sans-serif;font-weight:400;font-size:29px;line-height:1.12;letter-spacing:.4px;text-transform:uppercase;margin:16px 20px 10px;color:var(--txt)}
  .deck{position:relative;font-style:italic;font-size:16.5px;line-height:1.5;opacity:.92;margin:0 20px 16px;color:var(--txt)}
  .byline{position:relative;display:flex;gap:8px;font-family:"Inter",sans-serif;font-weight:500;font-size:10px;letter-spacing:2px;text-transform:uppercase;border-top:1px solid rgba(0,0,0,.18);border-bottom:1px solid rgba(0,0,0,.18);padding:8px 0;margin:0 20px 16px;color:var(--txt)}
  .dangler.darktext .byline{border-color:rgba(0,0,0,.18)}
  .dangler.lighttext .byline{border-color:rgba(255,255,255,.25)}
  .byline b{font-weight:700}
  .body{position:relative;font-size:16.5px;line-height:1.66;margin:0 20px;color:var(--txt)}
  .body::first-letter{font-family:"Anton",sans-serif;font-size:50px;float:left;line-height:.82;padding:4px 9px 0 0;color:var(--plate)}
  .dangler.lighttext .body::first-letter{color:var(--txt)}
  .sec{position:relative;font-family:"Inter",sans-serif;font-weight:700;font-size:10px;letter-spacing:3px;text-transform:uppercase;opacity:.75;margin:22px 20px 2px;color:var(--txt)}
  .points{position:relative;list-style:none;margin:0 20px}
  .points li{position:relative;padding:10px 0 4px 22px}
  .points li::before{content:"";position:absolute;left:2px;top:1.45em;width:8px;height:8px;background:var(--plate)}
  .points li p{font-size:15.5px;line-height:1.6;color:var(--txt)}
  .why{position:relative;margin:20px 20px 0;padding:2px 0 2px 14px;border-left:3px solid var(--plate);font-size:15px;line-height:1.6;color:var(--txt)}
  .why span{display:block;font-family:"Inter",sans-serif;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;opacity:.75;margin-bottom:5px}
  .source{position:relative;margin:16px 20px 0;font-family:"Inter",sans-serif;font-size:12px;color:var(--txt);opacity:.85}
  .source a{color:var(--txt);text-decoration-color:var(--plate);text-underline-offset:3px}
  .lab{position:relative;margin:24px 20px 0;padding:18px 16px 16px;border-radius:20px;background:#F4F1EA;color:#141414;box-shadow:inset 0 2px 6px rgba(20,20,26,.09),inset 0 -1px 0 #fff}
  .lab h3{font-family:"Anton",sans-serif;font-weight:400;font-size:22px;letter-spacing:.4px;text-transform:uppercase;margin-bottom:2px;color:#141414}
  .lab .sub{font-size:13.5px;color:#6B6B66;margin-bottom:12px;line-height:1.5}
  .acts{display:grid;grid-template-columns:1fr;gap:8px}
  .acts button,.askrow button{font:600 14px Figtree,-apple-system,sans-serif;color:#141414;padding:13px 10px;border:0;border-radius:14px;background:#fff;box-shadow:0 1px 0 #fff inset,0 2px 7px rgba(20,20,26,.13);cursor:pointer;min-height:48px}
  .acts button:active,.askrow button:active{transform:scale(.97)}
  .acts button small{display:block;font-weight:500;font-size:11px;color:#6B6B66;margin-top:2px}
  .askrow{display:flex;gap:8px;margin-top:10px}
  .askrow input{flex:1;min-width:0;font:inherit;font-size:15px;padding:13px 14px;border:0;border-radius:14px;background:#fff;color:#141414;box-shadow:inset 0 2px 4px rgba(20,20,26,.13);-webkit-appearance:none}
  .askrow button.go{background:#2A2886;color:#F5EFE3;box-shadow:0 2px 8px rgba(42,40,134,.35)}
  .lab button:disabled,.lab input:disabled{opacity:.5}
  .lstat{font-size:13px;color:#6B6B66;margin-top:12px;min-height:1.2em}
  .lbar{height:5px;border-radius:5px;background:#E4E4E8;margin-top:8px;overflow:hidden}
  .lbar i{display:block;height:100%;width:0;background:#2A2886;transition:width .4s linear}
  .res{margin-top:14px}
  .res .rh{font-family:"Inter",sans-serif;font-size:9.5px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:#2A2886;margin-bottom:4px}
  .res ul{list-style:none}
  .res li{padding:9px 0 9px 20px;position:relative;line-height:1.55;font-size:14.5px}
  .res li::before{content:"";position:absolute;left:2px;top:1.05em;width:8px;height:8px;border-radius:50%;background:#2A2886}
  .res details{padding:10px 0;border-top:1px solid #E2E2E6}
  .res details:first-of-type{border-top:0}
  .res summary{cursor:pointer;font-weight:600;list-style:none;padding-right:20px;position:relative;font-size:14.5px}
  .res summary::after{content:"+";position:absolute;right:0;color:#2A2886;font-size:18px;line-height:1}
  .res details[open] summary::after{content:"\\2212"}
  .res details p{margin-top:6px;color:#3d3d39;line-height:1.55;font-size:14px}
  .res .err{color:#b3261e;font-size:14px}
  .res .fine2{font-size:12px;color:#6B6B66;margin-top:10px}
  .fine{font-size:12px;line-height:1.5;color:#6B6B66;margin-top:12px}
  .fine summary{cursor:pointer}
  .fine a{color:#141414}
  .tickrow{position:relative;margin:26px 20px 0;border-top:3px solid var(--txt);padding:16px 0 30px;display:flex;justify-content:space-between;align-items:center}
  .tick{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--txt)}
  .tick .box{width:24px;height:24px;border:1.5px solid var(--txt);background:transparent;display:inline-block}
  .tick .lbl{font-family:"Anton",sans-serif;font-size:13px;letter-spacing:2.2px}
  .folio{font-family:"Inter",sans-serif;font-size:12px;letter-spacing:1.5px;color:var(--txt);opacity:.8}
  .folio b{font-weight:700;opacity:1}
  .paper-link{display:block;text-align:center;margin-top:26px;font-family:"Inter",sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6E6860;text-decoration-color:#E93E8A}
  .done{text-align:center;padding:44px 20px 20px}
  .done .stamp{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid #C6D936;color:#C6D936;border-radius:50%;width:140px;height:140px;font-family:"Shrikhand",serif;font-weight:400;font-size:24px;line-height:1.1;transform:rotate(-8deg);margin-bottom:24px}
  .done h1{font-family:"Anton",sans-serif;font-size:28px;text-transform:uppercase;margin:0 0 10px}
  .done p{color:#6E6860;font-style:italic;font-size:15px;line-height:1.6;max-width:320px;margin:0 auto}
</style>`;
}

function labJS(it) {
  const story = { headline: it.headline, deck: it.deck, body: it.body, why: it.why || "" };
  const json = JSON.stringify(story).replace(/</g, "\\u003c");
  return `<script>
var STORY=${json};
var API="https://text.pollinations.ai/openai",GAP=31000,lastCall=0,busy=false;
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function lstat(t,p){var s=document.getElementById("lstat"),b=document.getElementById("lbar"),bi=document.getElementById("lbari");if(!s)return;s.textContent=t;if(p===undefined){b.hidden=true}else{b.hidden=false;bi.style.width=p+"%"}}
function setBusy(b){busy=b;var q=document.querySelectorAll(".lab button,.lab input");for(var i=0;i<q.length;i++)q[i].disabled=b}
async function callModel(sys,user){
  var w=lastCall+GAP-Date.now();
  while(w>0){lstat("Waiting for the free AI slot: "+Math.ceil(w/1000)+"s",Math.round((1-w/GAP)*100));await sleep(400);w=lastCall+GAP-Date.now()}
  lstat("Asking the AI...",100);lastCall=Date.now();
  var body={model:"openai",messages:[{role:"system",content:sys},{role:"user",content:user}],max_tokens:900,seed:Math.floor(Math.random()*1e9)};
  var r;try{r=await fetch(API,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)})}catch(e){throw new Error("Could not reach the AI service.")}
  if(r.status===402||r.status===429)throw new Error("The free slot is not ready yet. Nothing was charged. Try again in about 30 seconds.");
  if(!r.ok)throw new Error("The AI service returned an error ("+r.status+").");
  var j;try{j=await r.json()}catch(e){throw new Error("Unexpected reply from the AI service.")}
  var m=j.choices&&j.choices[0]&&j.choices[0].message;if(!m||typeof m.content!=="string"||!m.content.trim())throw new Error("The AI service returned no answer.");
  var t=m.content,a=t.indexOf("{"),b2=t.lastIndexOf("}");if(a<0||b2<a)throw new Error("The reply was not in the expected format, so nothing is shown. Try again.");
  try{return JSON.parse(t.slice(a,b2+1))}catch(e){throw new Error("The reply was not in the expected format, so nothing is shown. Try again.")}}
function okStr(x,n){return typeof x==="string"&&x.trim().length>0&&x.length<=n}
function validPts(o){if(!o||!Array.isArray(o.points)||o.points.length<1||o.points.length>5)return null;for(var i=0;i<o.points.length;i++){if(!okStr(o.points[i],280))return null}return o.points}
function validQuiz(o){if(!o||!Array.isArray(o.questions)||o.questions.length<1||o.questions.length>4)return null;for(var i=0;i<o.questions.length;i++){var q=o.questions[i];if(!q||!okStr(q.q,220)||!okStr(q.a,280))return null}return o.questions}
function mk(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
async function act(kind,question){
  if(busy)return;
  var res=document.getElementById("res");res.textContent="";
  var story="Headline: "+STORY.headline+". Summary: "+STORY.deck+". Story: "+STORY.body+(STORY.why?". Why it matters: "+STORY.why:"");
  var base="You explain one short newsletter story to a college student. Use ONLY the story text given. Do not add outside facts, numbers or advice. Reply with ONE JSON object and nothing else. ";
  var sys,user,label;
  if(kind==="simple"){sys=base+'Format: {"points":["...","...","..."]} with exactly 3 plain-language points, each under 30 words.';user=story;label="Explained simply"}
  else if(kind==="example"){sys=base+'Format: {"points":["...","..."]} with exactly 2 everyday examples of the idea, each one or two sentences. They are illustrations, not facts.';user=story;label="Two examples"}
  else if(kind==="quiz"){sys=base+'Format: {"questions":[{"q":"...","a":"..."}]} with exactly 3 short questions that this story text answers, each answer under 30 words.';user=story;label="Quiz yourself"}
  else{sys=base+'Format: {"points":["..."]} with 1 to 4 short points answering the reader question from the story text. If the story does not answer it, say so in one point.';user=story+". Reader question: "+question;label="Your answer"}
  setBusy(true);
  try{
    var o=await callModel(sys,user);
    lstat("",undefined);
    if(kind==="quiz"){var qs=validQuiz(o);if(!qs)throw new Error("The reply was not in the expected format, so nothing is shown. Try again.");
      res.appendChild(mk("div","rh",label));qs.forEach(function(q){var d=mk("details");d.appendChild(mk("summary",null,q.q));d.appendChild(mk("p",null,q.a));res.appendChild(d)})}
    else{var ps=validPts(o);if(!ps)throw new Error("The reply was not in the expected format, so nothing is shown. Try again.");
      res.appendChild(mk("div","rh",label));var ul=mk("ul");ps.forEach(function(p){ul.appendChild(mk("li",null,p))});res.appendChild(ul)}
    res.appendChild(mk("p","fine2","AI-written from this story. It can be wrong."))
  }catch(e){lstat("",undefined);res.appendChild(mk("p","err",e.message))}
  setBusy(false)}
var actBtns=document.querySelectorAll(".lab .acts button");
for(var bi=0;bi<actBtns.length;bi++)actBtns[bi].onclick=function(){act(this.getAttribute("data-a"))};
var askBtn=document.getElementById("askgo"),askIn=document.getElementById("q");
function doAsk(){var v=askIn.value.trim().slice(0,200);if(v)act("ask",v)}
askBtn.onclick=doAsk;askIn.onkeydown=function(e){if(e.key==="Enter")doAsk()};
</script>`;
}

function storyHTML(issue, it, idx, state) {
  const total = issue.items.length;
  const card = DCARD[idx] || DINDIGO;
  const plate = DPLATE[idx] || "#F04E23";
  const ptxt = DPLATE_TXT[idx] || "#F5EFE3";
  const ctxt = DCARD_TXT[idx] || "#F5EFE3";
  const darktext = (ctxt === "#23206E");
  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const pts = (it.points && it.points.length) ? it.points : null;
  const readCount = (state && state[issue.date]) ? state[issue.date].length : 0;
  const dots = issue.items.map((x, i) => {
    const cls = ((state && isRead(state, issue.date, x.id)) ? "read " : "") + (i === idx ? "cur" : "");
    return `<a class="${cls.trim()}" href="tdr://goto/${i}"><i></i></a>`;
  }).join("");
  return `<!DOCTYPE html><html><head>${pageCSS()}</head><body>
  <header class="masthead">
    <div class="lockup"><span class="lat">THE</span> <span class="guj">ડેઈલી</span> <span class="lat">DRAFT</span></div>
    <div class="tagrow"><div class="string"></div><div class="tag">સવાર EXPRESS</div></div>
  </header>
  <div class="perf"></div>
  <div class="dateline"><span class="guj">સવારની આવૃત્તિ · Morning edition</span><span>Issue № ${issue.number}</span></div>
  <div class="dateline" style="padding-top:0"><span>${esc(dayStr)}</span><span>Vol. I</span></div>
  <div class="wrap">
  <div class="dots">${dots}</div>
  <div class="dots-cap"><span>Story ${idx + 1} of ${total}</span><span>${readCount} read</span></div>
  </div>
  <section class="dangler ${darktext ? "darktext" : "lighttext"}" style="--card:${card};--plate:${plate};--ptxt:${ptxt};--txt:${ctxt}">
    <div class="pattern" style="background-image:url(&quot;${dpattern(it.kind, "#141414")}&quot;)"></div>
    <div class="hang"><div class="strings"><i></i><i></i></div><div class="nameplate">${esc(it.kind)}</div></div>
    ${it.image ? `<figure class="art"><span class="bloom"></span><img src="${PAGE + esc(it.image)}" alt="${esc(it.image_alt || it.headline)}"><span class="platform"></span><figcaption><span>${it.image_caption ? esc(it.image_caption) : "Illustration &middot; The Daily Draft"}</span><span class="no">Plate № ${idx + 1}</span></figcaption></figure>` : ""}
    <h1>${esc(titleCase(it.headline))}</h1>
    <p class="deck">${esc(it.deck)}</p>
    <div class="byline"><b>${esc(KIND_VERB[it.kind] || "News wire")}</b><span>·</span><span>${esc(it.reading_time || "1 min read")}</span></div>
    <p class="body">${esc(it.body || "")}</p>
    ${pts ? `<div class="sec">The key points</div>
    <ol class="points">${pts.map(p => `<li><p>${esc(p)}</p></li>`).join("")}</ol>` : ""}
    ${it.why ? `<div class="why"><span>Why it matters</span>${esc(it.why)}</div>` : ""}
    ${it.source_url ? `<p class="source">Filed from <a href="${esc(it.source_url)}">${esc(it.source_name || it.source_url)}</a> ↗</p>` : ""}
    <section class="lab">
      <h3>Try it on this story</h3>
      <p class="sub">Pick one, or ask your own question. An AI model is told to use this story only, but it can still be wrong.</p>
      <div class="acts">
        <button data-a="simple">Explain simply<small>3 quick points</small></button>
        <button data-a="example">Show an example<small>2 everyday cases</small></button>
        <button data-a="quiz">Quiz me<small>3 tap-to-reveal</small></button>
      </div>
      <div class="askrow"><input type="text" id="q" maxlength="200" placeholder="Ask about this story..." autocomplete="off" enterkeyhint="send"><button class="go" id="askgo">Ask</button></div>
      <div class="lstat" id="lstat"></div><div class="lbar" id="lbar" hidden><i id="lbari"></i></div>
      <div class="res" id="res"></div>
      <details class="fine"><summary>How this works and its limits</summary>
        <p>Your tap sends this story's text and your question to a free AI service (Pollinations, no account). One request at a time, so there can be a wait of up to 30 seconds, and it can fail. Answers are AI-written, can be wrong, and are not checked. Reading the story and ticking it off need no AI. Do not type anything private. <a href="https://pollinations.ai/privacy">Privacy</a>.</p></details>
    </section>
    <div class="tickrow">
      <a class="tick" href="tdr://read/${encodeURIComponent(it.id)}"><span class="box"></span><span class="lbl">MARK AS READ</span></a>
      <span class="folio">№ <b>${idx + 1}</b> — of ${total}</span>
    </div>
  </section>
  <a class="paper-link" href="tdr://open">Read in the full paper ↗</a>
  ${labJS(it)}
  </body></html>`;
}

function allReadHTML(issue) {
  return `<!DOCTYPE html><html><head>${pageCSS()}</head><body>
  <header class="masthead">
    <div class="lockup"><span class="lat">THE</span> <span class="guj">ડેઈલી</span> <span class="lat">DRAFT</span></div>
    <div class="tagrow"><div class="string"></div><div class="tag">સવાર EXPRESS</div></div>
  </header>
  <div class="perf"></div>
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
    w.backgroundColor = PAPER;
    w.setPadding(16, 16, 14, 16);
    const t = w.addText("The Daily Draft");
    t.font = Font.boldSystemFont(16);
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
