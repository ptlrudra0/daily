// The Daily Draft - iPhone home-screen widget + reader (Scriptable)
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
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);

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
    .sec{font-family:"Inter",sans-serif;font-weight:700;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#6B6B66;margin:26px 0 2px}
  .points{list-style:none}
  .points li{position:relative;padding:10px 0 4px 22px}
  .points li::before{content:"";position:absolute;left:2px;top:1.45em;width:7px;height:7px;background:#E8480C}
  .points li p{font-size:15.5px;line-height:1.6;color:#1f1f1c}
  .dots{display:flex;gap:6px;margin:26px 0 0}
  .dots a{flex:1;padding:12px 0;text-decoration:none}
  .dots a i{display:block;height:4px;border-radius:4px;background:#E4E4DF}
  .dots a.read i{background:#E8480C}
  .dots a.cur i{background:#141414}
  .dots a.cur.read i{background:linear-gradient(90deg,#141414 50%,#E8480C 50%)}
  .dots-cap{display:flex;justify-content:space-between;font-family:"Inter",sans-serif;font-size:9px;letter-spacing:1.8px;text-transform:uppercase;color:#6B6B66;margin-top:2px}
  .lab{margin-top:30px;padding:18px 16px 16px;border-radius:24px;background:#F4F4F6;box-shadow:inset 0 2px 6px rgba(20,20,26,.09),inset 0 -1px 0 #fff}
  .lab h3{font-family:"Fraunces",serif;font-weight:560;font-size:23px;letter-spacing:-.01em;margin-bottom:2px}
  .lab .sub{font-size:13.5px;color:#6B6B66;margin-bottom:12px;line-height:1.5}
  .acts{display:grid;grid-template-columns:1fr;gap:8px}
  .acts button,.askrow button{font:600 14px Figtree,-apple-system,sans-serif;color:#141414;padding:13px 10px;border:0;border-radius:14px;background:#fff;box-shadow:0 1px 0 #fff inset,0 2px 7px rgba(20,20,26,.13);cursor:pointer;min-height:48px}
  .acts button:active,.askrow button:active{transform:scale(.97)}
  .acts button small{display:block;font-weight:500;font-size:11px;color:#6B6B66;margin-top:2px}
  .askrow{display:flex;gap:8px;margin-top:10px}
  .askrow input{flex:1;min-width:0;font:inherit;font-size:15px;padding:13px 14px;border:0;border-radius:14px;background:#fff;color:#141414;box-shadow:inset 0 2px 4px rgba(20,20,26,.13);-webkit-appearance:none}
  .askrow button.go{background:#E8480C;color:#fff;box-shadow:0 2px 8px rgba(232,72,12,.35)}
  .lab button:disabled,.lab input:disabled{opacity:.5}
  .lstat{font-size:13px;color:#6B6B66;margin-top:12px;min-height:1.2em}
  .lbar{height:5px;border-radius:5px;background:#E4E4E8;margin-top:8px;overflow:hidden}
  .lbar i{display:block;height:100%;width:0;background:#E8480C;transition:width .4s linear}
  .res{margin-top:14px}
  .res .rh{font-family:"Inter",sans-serif;font-size:9.5px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:#E8480C;margin-bottom:4px}
  .res ul{list-style:none}
  .res li{padding:9px 0 9px 20px;position:relative;line-height:1.55;font-size:14.5px}
  .res li::before{content:"";position:absolute;left:2px;top:1.05em;width:8px;height:8px;border-radius:50%;background:#E8480C}
  .res details{padding:10px 0;border-top:1px solid #E2E2E6}
  .res details:first-of-type{border-top:0}
  .res summary{cursor:pointer;font-weight:600;list-style:none;padding-right:20px;position:relative;font-size:14.5px}
  .res summary::after{content:"+";position:absolute;right:0;color:#E8480C;font-size:18px;line-height:1}
  .res details[open] summary::after{content:"\\2212"}
  .res details p{margin-top:6px;color:#3d3d39;line-height:1.55;font-size:14px}
  .res .err{color:#b3261e;font-size:14px}
  .res .fine2{font-size:12px;color:#6B6B66;margin-top:10px}
  .fine{font-size:12px;line-height:1.5;color:#6B6B66;margin-top:12px}
  .fine summary{cursor:pointer}
  .fine a{color:#141414}
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
  const hex = KIND_HEX[it.kind] || "#B87A00";
  const d = new Date(issue.date + "T12:00:00");
  const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const pts = (it.points && it.points.length) ? it.points : null;
  const readCount = (state && state[issue.date]) ? state[issue.date].length : 0;
  const dots = issue.items.map((x, i) => {
    const cls = ((state && isRead(state, issue.date, x.id)) ? "read " : "") + (i === idx ? "cur" : "");
    return `<a class="${cls.trim()}" href="tdr://goto/${i}"><i></i></a>`;
  }).join("");
  return `<!DOCTYPE html><html><head>${pageCSS()}</head><body>
  <div class="mast"><span>Morning edition</span><span>Vol. I</span></div>
  <h1 class="paper">The Daily <em>Draft</em></h1>
  <div class="mast" style="border-bottom:1px solid #E4E4DF;padding:8px 0"><span>${esc(dayStr)}</span><span>Issue № ${issue.number}</span></div>
  <div class="dots">${dots}</div>
  <div class="dots-cap"><span>Story ${idx + 1} of ${total}</span><span>${readCount} read</span></div>
  <div class="story">
    <span class="chip"><i style="background:${hex}"></i>${esc(it.kind)}</span>
    <div class="redrule"></div>
    <h1>${esc(titleCase(it.headline))}</h1>
    <p class="deck">${esc(it.deck)}</p>
    ${it.image ? `<figure class="art"><img src="${PAGE + esc(it.image)}" alt="${esc(it.image_alt || it.headline)}"><figcaption><span>${it.image_caption ? esc(it.image_caption) : "Illustration &middot; The Daily Draft"}</span><span class="no">Plate № ${idx + 1}</span></figcaption></figure>` : ""}
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
    <a class="paper-link" href="tdr://open">Read in the full paper ↗</a>
  </div>
  ${labJS(it)}
  </body></html>`;
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
