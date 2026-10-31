// The Daily Draft - POSTER STUDY widget + reader (Scriptable)
// Design-study variant of widget.js in the TV/poster direction:
// off-white canvas, oversized condensed poster headline, IBM-Plex-Mono-style
// metadata rows, strongly rounded plate panel, monochrome reader plates.
// Install: copy this whole file into a new script in the Scriptable app,
// name it "The Daily Draft - poster", then point a Medium Scriptable
// widget at it with "When Interacting" = "Run Script".
// Stand-ins, flagged honestly: Scriptable cannot load Anton, so the widget
// face uses iOS's Avenir Next Condensed Bold; the reader loads real Anton.
// Scriptable widgets cannot recolour images, so the widget-face thumbnail
// stays in colour; reader plates are true black-and-white via CSS.

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
  const vol = top.addText("VOL. I");
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

  // metadata row: number + desk + reading time, mono
  const meta = w.addStack();
  meta.layoutHorizontally();
  const idx = issue.items.indexOf(lead) + 1;
  const no = meta.addText("NO. " + String(idx).padStart(2, "0") + "/" + String(issue.items.length).padStart(2, "0"));
  no.font = Font.monospacedSystemFont(8, 2);
  no.textColor = INK;
  meta.addSpacer(8);
  const desk = meta.addText((lead.kind + " · " + (lead.reading_time || "1 MIN")).toUpperCase());
  desk.font = Font.monospacedSystemFont(8, 0);
  desk.textColor = SOFT;
  meta.addSpacer();
  w.addSpacer(4);

  // poster headline + plate panel
  const mid = w.addStack();
  mid.layoutHorizontally();
  mid.centerAlignContent();
  const left = mid.addStack();
  left.layoutVertically();
  const head = left.addText(lead.headline.toUpperCase());
  head.font = new Font("AvenirNextCondensed-Bold", 26);
  head.textColor = INK;
  head.lineLimit = 4;
  head.minimumScaleFactor = 0.55;
  mid.addSpacer(8);
  if (lead.image) {
    try {
      const img = await new Request(PAGE + lead.image).loadImage();
      const pic = mid.addImage(img);
      pic.imageSize = new Size(96, 64);
      pic.cornerRadius = 14;
      pic.rightAlignImage();
    } catch (e2) {}
  }

  w.addSpacer();

  // footer row
  const foot = w.addStack();
  foot.layoutHorizontally();
  foot.centerAlignContent();
  const dt = foot.addText(dayStr.toUpperCase() + "  ·  № " + issue.number);
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
function hlClass(h) {
  const n = (h || "").length;
  if (n <= 14) return "hl-xl";
  if (n <= 24) return "hl-l";
  if (n <= 38) return "hl-m";
  return "hl-s";
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
  .inforow{display:grid;grid-template-columns:1fr 1fr;gap:10px;border-bottom:1px solid rgba(20,20,18,.9);padding:10px 0 12px;font-size:9px}
  .inforow .lbl{color:#6E6A5E;display:block;margin-bottom:4px;font-size:8px}
  .inforow .val{font-weight:600}
  .dots{display:flex;gap:6px;margin:20px 0 0}
  .dots a{flex:1;padding:10px 0;text-decoration:none}
  .dots a i{display:block;height:4px;border-radius:4px;background:rgba(20,20,18,.18)}
  .dots a.read i{background:rgba(20,20,18,.45)}
  .dots a.cur i{background:#141412}
  .dots-cap{display:flex;justify-content:space-between;font-size:9px;color:#6E6A5E;margin-top:4px}
  .story{padding-top:24px}
  .tagrow{display:flex;align-items:center;gap:10px;font-size:10px}
  .tag{display:inline-block;border:1.5px solid #141412;border-radius:999px;padding:4px 10px;font-weight:600}
  .rt{color:#6E6A5E}
  h1{font-family:"Anton",Impact,sans-serif;font-weight:400;text-transform:uppercase;line-height:.98;margin:14px 0 12px}
  .hl-xl{font-size:76px} .hl-l{font-size:58px} .hl-m{font-size:44px} .hl-s{font-size:34px}
  .deck{font-size:16.5px;line-height:1.55;color:#3A382F;margin-bottom:18px;max-width:34em}
  .panel{position:relative;background:#fff;border-radius:26px;padding:9px;border:1.5px solid #141412;margin:18px 0 6px}
  .panel img{display:block;width:100%;height:auto;border-radius:18px;filter:grayscale(1) contrast(1.06)}
  .panel .over{position:absolute;left:20px;bottom:17px;font-size:9px;font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.55)}
  .pcap{display:flex;justify-content:space-between;gap:10px;font-size:9px;color:#6E6A5E;margin:8px 0 20px}
  .body{font-size:16.5px;line-height:1.68;max-width:38em}
  .sec{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#6E6A5E;margin:26px 0 2px}
  .points{list-style:none}
  .points li{position:relative;padding:10px 0 4px 24px}
  .points li::before{content:"";position:absolute;left:2px;top:1.5em;width:8px;height:8px;background:#141412}
  .points li p{font-size:15.5px;line-height:1.6}
  .why{margin-top:22px;padding:2px 0 2px 16px;border-left:3px solid #141412;font-size:15px;line-height:1.6}
  .why span{display:block;font-family:"IBM Plex Mono",monospace;font-size:9px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:#6E6A5E;margin-bottom:6px}
  .source{margin-top:16px;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6E6A5E}
  .source a{color:#141412;text-underline-offset:3px}
  .tickrow{margin-top:28px;border-top:2px solid #141412;padding-top:16px;display:flex;justify-content:space-between;align-items:center}
  .tick{display:flex;align-items:center;gap:12px;text-decoration:none;color:#141412}
  .tick .box{width:24px;height:24px;border:1.5px solid #141412;border-radius:8px;background:#fff;display:inline-block}
  .tick .lbl{font:600 11px "IBM Plex Mono",monospace;letter-spacing:.2em;text-transform:uppercase}
  .folio{font:11px "IBM Plex Mono",monospace;letter-spacing:.1em;color:#6E6A5E}
  .folio b{color:#141412}
  .paper-link{display:block;text-align:center;margin-top:26px;font:10px "IBM Plex Mono",monospace;letter-spacing:.18em;text-transform:uppercase;color:#6E6A5E}
  .done{text-align:center;padding:44px 0 20px}
  .done .stamp{display:inline-block;font-family:"Anton",Impact,sans-serif;text-transform:uppercase;font-size:40px;line-height:1.05;border:4px solid #141412;border-radius:18px;padding:12px 26px;transform:rotate(-6deg);margin-bottom:24px}
  .done h1{font-size:28px;margin-bottom:10px}
  .done p{color:#6E6A5E;font-size:15px;line-height:1.6;max-width:320px;margin:0 auto}
  .lab{margin-top:28px;padding:18px 16px 16px;border-radius:24px;background:#fff;border:1.5px solid #141412}
  .lab h3{font-family:"Anton",Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:24px;margin-bottom:4px}
  .lab .sub{font-size:13.5px;color:#6E6A5E;margin-bottom:12px;line-height:1.5}
  .acts{display:grid;grid-template-columns:1fr;gap:8px}
  .acts button,.askrow button{font:600 12px "IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.08em;color:#141412;padding:13px 10px;border:1.5px solid #141412;border-radius:14px;background:#F4F1EA;cursor:pointer;min-height:48px;text-align:left}
  .acts button small{display:block;font-weight:400;font-size:11px;color:#6E6A5E;margin-top:2px;text-transform:none;letter-spacing:0;font-family:"Inter",sans-serif}
  .acts button:active,.askrow button:active{transform:scale(.97)}
  .askrow{display:flex;gap:8px;margin-top:10px}
  .askrow input{flex:1;min-width:0;font:15px "Inter",sans-serif;padding:13px 14px;border:1.5px solid #141412;border-radius:14px;background:#F4F1EA;color:#141412;-webkit-appearance:none}
  .askrow button.go{background:#141412;color:#F4F1EA}
  .lab button:disabled,.lab input:disabled{opacity:.5}
  .lstat{font-size:13px;color:#6E6A5E;margin-top:12px;min-height:1.2em}
  .lbar{height:5px;border-radius:5px;background:rgba(20,20,18,.15);margin-top:8px;overflow:hidden}
  .lbar i{display:block;height:100%;width:0;background:#141412;transition:width .4s linear}
  .res{margin-top:14px}
  .res .rh{font-family:"IBM Plex Mono",monospace;font-size:9.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#141412;margin-bottom:4px}
  .res ul{list-style:none}
  .res li{padding:9px 0 9px 20px;position:relative;line-height:1.55;font-size:14.5px}
  .res li::before{content:"";position:absolute;left:2px;top:1.05em;width:8px;height:8px;background:#141412}
  .res details{padding:10px 0;border-top:1px solid rgba(20,20,18,.18)}
  .res details:first-of-type{border-top:0}
  .res summary{cursor:pointer;font-weight:600;list-style:none;padding-right:20px;position:relative;font-size:14.5px}
  .res summary::after{content:"+";position:absolute;right:0;font-size:18px;line-height:1}
  .res details[open] summary::after{content:"\\2212"}
  .res details p{margin-top:6px;color:#3d3d39;line-height:1.55;font-size:14px}
  .res .err{color:#9c1f13;font-size:14px}
  .res .fine2{font-size:12px;color:#6E6A5E;margin-top:10px}
  .fine{font-size:12px;line-height:1.5;color:#6E6A5E;margin-top:12px}
  .fine summary{cursor:pointer}
  .fine a{color:#141412}
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
  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const pts = (it.points && it.points.length) ? it.points : null;
  const readCount = (state && state[issue.date]) ? state[issue.date].length : 0;
  const dots = issue.items.map((x, i) => {
    const cls = ((state && isRead(state, issue.date, x.id)) ? "read " : "") + (i === idx ? "cur" : "");
    return `<a class="${cls.trim()}" href="tdr://goto/${i}"><i></i></a>`;
  }).join("");
  return `<!DOCTYPE html><html><head>${pageCSS()}</head><body>
  <div class="mast mono"><span class="brand">The Daily Draft</span><span>Vol. I</span></div>
  <div class="inforow mono">
    <div><span class="lbl">No.</span><span class="val">${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span></div>
    <div><span class="lbl">Edition</span><span class="val">Issue № ${issue.number}</span></div>
    <div><span class="lbl">Desk</span><span class="val">${esc(KIND_VERB[it.kind] || "News wire")}</span></div>
    <div><span class="lbl">Source</span><span class="val">${esc(it.source_name || "Original")}</span></div>
  </div>
  <div class="dots">${dots}</div>
  <div class="dots-cap mono"><span>Story ${idx + 1} of ${total}</span><span>${readCount} read</span></div>
  <div class="story">
    <div class="tagrow mono"><span class="tag">${esc(it.kind)}</span><span class="rt">${esc(it.reading_time || "1 min read")}</span></div>
    <h1 class="${hlClass(it.headline)}">${esc(it.headline)}</h1>
    <p class="deck">${esc(it.deck)}</p>
    ${it.image ? `<div class="panel"><img src="${PAGE + esc(it.image)}" alt="${esc(it.image_alt || it.headline)}"><span class="over mono">Plate № ${idx + 1}</span></div>
    <div class="pcap mono"><span>${it.image_caption ? esc(it.image_caption) : "Illustration · The Daily Draft"}</span><span>B/W study</span></div>` : ""}
    <p class="body">${esc(it.body || "")}</p>
    ${pts ? `<div class="sec">The key points</div>
    <ol class="points">${pts.map(p => `<li><p>${esc(p)}</p></li>`).join("")}</ol>` : ""}
    ${it.why ? `<div class="why"><span>Why it matters</span>${esc(it.why)}</div>` : ""}
    ${it.source_url ? `<p class="source">Source: <a href="${esc(it.source_url)}">${esc(it.source_name || it.source_url)}</a> ↗</p>` : ""}
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
    <a class="paper-link" href="tdr://open">Read in the full paper ↗</a>
  </div>
  ${labJS(it)}
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
