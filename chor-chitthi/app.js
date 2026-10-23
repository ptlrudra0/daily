(function(){
const E=window.CCEngine,R=E.ROLES,KEY='chor-chitthi-v1';
const $=document.getElementById('app');
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S=load();let ui={mode:6,names:['','','','','',''],err:'',sel:null,confirm:null,sheet:null,revealStage:0};
function fresh(){return{v:1,screen:'home',scoring:clone(E.DEFAULT_SCORING),sound:true,haptics:true,match:null,round:null,history:[]}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===1){
  // Privacy on restart: never reopen a face-up role card.
  if(s.round&&s.round.dealStep==='shown')s.round.dealStep='handoff';return s}}catch(e){}return fresh()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function go(screen){S.screen=screen;save();render()}
// ---- feedback ----
let ac;function tone(f,d,v){if(!S.sound)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;g.gain.value=v||.04;g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function buzz(p){if(S.haptics&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}}
// ---- art ----
const G='#b8924a',B='#4a0e1c';
const ART={
raja:`<svg viewBox="0 0 100 100" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round"><path d="M14 74 L10 32 L32 50 L50 22 L68 50 L90 32 L86 74Z" fill="${B}"/><path d="M14 74H86M18 84H82"/><circle cx="50" cy="22" r="4" fill="${G}"/><circle cx="10" cy="32" r="3" fill="${G}"/><circle cx="90" cy="32" r="3" fill="${G}"/></svg>`,
rani:`<svg viewBox="0 0 100 100" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round"><path d="M50 18C38 34 30 44 30 58a20 20 0 0040 0C70 44 62 34 50 18Z" fill="${B}"/><path d="M50 40V76M36 56H64"/><path d="M22 82Q50 70 78 82"/></svg>`,
brother:`<svg viewBox="0 0 100 100" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round"><circle cx="38" cy="58" r="22" fill="${B}"/><circle cx="64" cy="44" r="18" fill="${B}"/><path d="M38 46V70M30 52H46M64 34V54M57 40H71"/><path d="M14 86H86"/></svg>`,
chor:`<svg viewBox="0 0 100 100" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round"><path d="M12 38Q50 22 88 38Q86 66 66 70Q56 56 50 70Q44 56 34 70Q14 66 12 38Z" fill="${B}"/><ellipse cx="34" cy="46" rx="8" ry="5"/><ellipse cx="66" cy="46" rx="8" ry="5"/><path d="M50 78V92M44 86H56"/></svg>`,
wazir:`<svg viewBox="0 0 100 100" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round"><path d="M24 20H70Q80 20 80 30V76Q80 86 70 86H34" fill="${B}"/><path d="M24 20Q14 20 14 30T24 40H34V76Q34 86 24 86"/><path d="M44 38H68M44 50H68M44 62H60"/></svg>`,
sipahi:`<svg viewBox="0 0 100 100" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round"><path d="M50 14L82 26V50Q82 74 50 88Q18 74 18 50V26Z" fill="${B}"/><path d="M50 30V70M34 46H66"/></svg>`};
const SEAL=`<svg class="seal" viewBox="0 0 100 100" fill="none" stroke="${G}" stroke-width="2.5"><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="33"/><path d="M50 26 54 42 70 42 57 52 62 68 50 58 38 68 43 52 30 42 46 42Z" fill="${G}" stroke="none"/></svg>`;
const front=r=>`<div class="face front">${ART[r]}<div class="rtitle">${R[r].title}</div><div class="rname">${R[r].name}</div><p class="rtext">${R[r].text}</p></div>`;
const back=`<div class="face back">${SEAL.replace('class="seal"','class="seal" style="width:110px;height:110px"')}</div>`;
// ---- helpers ----
const N=i=>esc(S.match.players[i]);
const topbar=(left,right)=>`<div class="top"><div>${left||''}</div><div>${right||''}</div></div>`;
function sheet(html){return `<div class="sheet"><div class="box">${html}</div></div>`}
function newRound(){const rng=E.secureRng();const n=S.match.players.length;
  S.match.roundNo=(S.match.roundNo||0)+1;
  S.round={id:Date.now()+'-'+S.match.roundNo,roles:E.assignRoles(n,rng),dealIdx:0,dealStep:'handoff',accused:null,applied:false,result:null};
  ui.sel=null;ui.confirm=null;ui.revealStage=0;save()}
// ---- screens ----
const V={};
V.home=()=>{const m=S.match,rd=S.round,active=m&&rd&&!rd.applied||(m&&rd&&rd.applied&&S.screen==='home');
 const inRound=m&&rd&&!rd.applied;
 return `<div class="screen">${topbar('',`<button class="icon" data-a="settings" aria-label="Settings">⚙</button>`)}
 <div class="grow col" style="justify-content:center;gap:18px"><div class="eyebrow">A game of slips &amp; secrets</div>
 <h1 class="big">CHOR-<br>CHITTHI</h1><div class="rule"></div><p style="font-family:var(--serif);font-size:22px;color:var(--ivory)">Trust nobody. Catch the Chor.</p></div>
 <div class="col">${inRound?`<button class="btn" data-a="resume">Resume round ${m.roundNo}</button>`:''}
 <button class="btn ${inRound?'ghost':''}" data-a="play">${m&&!inRound?'Play · next round':'Play'}</button>
 <div class="seg" style="gap:10px"><button class="btn ghost" style="font-size:16px" data-a="rules">Rules</button><button class="btn ghost" style="font-size:16px" data-a="scores">Scoreboard</button></div></div>${ui.sheet==='newm'?sheet(`<h3>Start a new match?</h3><p>A round is in progress. A new match erases the current scores. Resume instead to keep them.</p><button class="btn red" data-a="newgo">New match, erase scores</button><button class="btn ghost" data-a="newno">Keep current match</button>`):''}</div>`};
V.setup=()=>{const n=ui.mode;let inputs='';for(let i=0;i<n;i++)inputs+=`<input class="name" data-i="${i}" maxlength="14" placeholder="Player ${i+1}" value="${esc(ui.names[i]||'')}" autocomplete="off" autocapitalize="words" enterkeyhint="next">`;
 return `<div class="screen">${topbar(`<button class="icon" data-a="home" aria-label="Back">←</button>`,'')}
 <h2 style="margin:6px 0 14px">Who is playing?</h2>
 <div class="seg"><button data-m="4" class="${n===4?'on':''}">4 players</button><button data-m="6" class="${n===6?'on':''}">6 players</button></div>
 <p class="dim" style="margin:10px 0">${n===4?'Raja, Rani, Wazir, Chor.':"Raja, Rani, Rani's Brother, Chor, Wazir, Sipahi."}</p>
 <div class="grow scroll col" style="padding-bottom:8px">${inputs}</div>
 <div class="err">${esc(ui.err)}</div><button class="btn" data-a="start">Start game</button></div>`};
V.deal=()=>{const r=S.round,i=r.dealIdx,name=N(i);
 if(r.dealStep==='handoff')return `<div class="screen neutral"><div class="eyebrow">Chitthi ${i+1} of ${r.roles.length}</div>
  <h2>Pass the phone to<br>${name}</h2><div class="cardwrap" style="flex:0 0 auto"><div class="card" style="width:200px"><div class="face front" style="transform:none;display:none"></div>${back}</div></div>
  <p class="dim">Keep the screen facing away from everyone else.</p><button class="btn" data-a="draw">I am ${name} · draw my chitthi</button></div>`;
 return `<div class="screen">${topbar(`<span class="pill">${name} · only you</span>`,'')}
  <div class="cardwrap"><div class="card" id="card">${back}${front(r.roles[i])}</div></div>
  <p class="dim" style="text-align:center;margin-bottom:12px">Remember it. Then hide it.</p>
  <button class="btn" data-a="hide">Hide &amp; pass phone</button></div>`};
V.court=()=>`<div class="screen">${topbar('<span class="eyebrow">The royal court</span>','')}
 <h2 style="margin:8px 0 10px">Everyone has a chitthi.</h2>
 <p>Talk. Bluff. Rani, advise the Wazir out loud. The Wazir decides alone.</p>
 <div class="rule" style="margin:16px 0"></div>
 <div class="grow scroll">${S.match.players.map((p,i)=>`<div class="row"><div class="n">${N(i)}</div><div class="r">Role hidden</div></div>`).join('')}</div>
 <button class="btn" data-a="decide" style="margin-top:12px">Wazir, make your decision</button></div>`;
V.accuse=()=>{const r=S.round;
 return `<div class="screen">${topbar('<span class="eyebrow">The accusation</span>','')}
 <h2 style="margin:8px 0 6px">Wazir, who is the Chor?</h2><p class="dim" style="margin-bottom:14px">One name. You cannot change it after you confirm.</p>
 <div class="plist grow scroll" style="align-content:start">${S.match.players.map((p,i)=>`<button class="pbtn ${ui.sel===i?'on':''}" data-p="${i}">${N(i)}</button>`).join('')}</div>
 <div class="err">${esc(ui.err)}</div><button class="btn" data-a="lock" ${ui.sel===null?'disabled':''}>${ui.sel===null?'Choose a player':'Accuse '+N(ui.sel)}</button>
 ${ui.confirm!==null?sheet(`<h3>Accuse ${N(ui.confirm)}?</h3><p>This locks your decision. The answer is revealed next.</p><button class="btn red" data-a="confirm">Yes, lock it in</button><button class="btn ghost" data-a="cancel">Not yet</button>`):''}</div>`};
V.reveal=()=>{const r=S.round,res=r.result,st=ui.revealStage;
 if(st===0)return `<div class="screen neutral"><div class="eyebrow">The Wazir has spoken</div><h2>${N(res.accusedIdx)}<br><span class="dim" style="font-family:var(--sans);font-size:18px">is accused of being the Chor</span></h2>
  <div class="stamp">?</div><button class="btn" data-a="unveil">Reveal the Chor</button></div>`;
 const cards=r.roles.map((ro,i)=>`<div class="row rise" style="animation-delay:${60+i*70}ms"><div class="n">${N(i)}</div><div class="r">${R[ro].name}</div></div>`).join('');
 return `<div class="screen"><div class="eyebrow rise">${N(res.chorIdx)} was the Chor</div>
  <div class="verdict rise" style="margin:8px 0 4px;color:${res.correct?'var(--gold2)':'#ff9a8f'};animation-delay:80ms">${res.correct?'Caught.':'Escaped.'}</div>
  <p class="rise" style="animation-delay:140ms">${res.correct?'The Wazir was right.':'The Wazir was wrong.'}${res.theft?` ${N(res.theft.to)} steals ${res.theft.amount} from ${N(res.theft.from)}.`:''}</p>
  <div class="rule"></div><div class="grow scroll">${cards}</div>
  <button class="btn" data-a="results" style="margin-top:12px">See the scores</button></div>`};
V.results=()=>{const r=S.round,res=r.result,m=S.match;
 const order=m.players.map((p,i)=>i).sort((a,b)=>m.totals[b]-m.totals[a]);
 const win=res.winners.map(N).join(' & ');
 const log=res.log.map(l=>`<div class="dim" style="display:flex;justify-content:space-between;padding:3px 0"><span>${N(l.player)} · ${esc(l.why)}</span><span class="${l.amount>0?'pos':'neg'}">${l.amount>0?'+':''}${l.amount}</span></div>`).join('');
 return `<div class="screen">${topbar(`<span class="eyebrow">Round ${m.roundNo} · ${res.correct?'Correct':'Incorrect'} accusation</span>`,'')}
 <h2 style="margin:6px 0 2px">${win} ${res.winners.length>1?'win':'wins'} the round</h2>
 <div class="grow scroll" style="margin-top:8px">
 ${order.map(i=>`<div class="row"><div class="n">${N(i)}<div class="r" style="margin-top:2px">${R[r.roles[i]].name}</div></div><div class="delta ${res.deltas[i]>0?'pos':res.deltas[i]<0?'neg':'dim'}">${res.deltas[i]>0?'+':''}${res.deltas[i]}</div><div class="num" style="min-width:96px;text-align:right">${m.totals[i]}</div></div>`).join('')}
 <h3 style="margin:18px 0 6px;font-size:18px">Point changes</h3>${log||'<p class="dim">No points changed hands.</p>'}</div>
 <div class="col" style="margin-top:10px"><button class="btn" data-a="again">Play again · fresh chitthis</button><button class="btn ghost" data-a="home">Return home</button></div></div>`};
V.rules=()=>`<div class="screen">${topbar(`<button class="icon" data-a="home" aria-label="Back">←</button>`,'')}<h2 style="margin:6px 0 12px">The rules</h2><div class="grow scroll col">
 <p>Each player secretly draws a chitthi. Pass one phone around. Only the holder sees it.</p>
 <p>Talk and bluff. Rani can advise the Wazir by talking. She cannot force a choice.</p>
 <p>The Wazir names one player as the Chor, then confirms. The roles are revealed.</p>
 <p><b>Caught:</b> the Raja is rewarded. In six-player games Rani's Brother steals 15 points from the Raja.</p>
 <p><b>Escaped:</b> the Chor is rewarded. No theft.</p>
 <p class="dim">The Raja starts every round with 100 points. Other point values are set in Settings. No hints, no clues, no extra powers.</p></div></div>`;
V.scores=()=>{const m=S.match;let body='<p class="dim">No match yet. Start a game to keep score.</p>';
 if(m){const order=m.players.map((p,i)=>i).sort((a,b)=>m.totals[b]-m.totals[a]);
  body=`<p class="dim" style="margin-bottom:8px">Match total after ${m.history.length} round${m.history.length===1?'':'s'}</p>`+order.map(i=>`<div class="row"><div class="n">${N(i)}</div><div class="num">${m.totals[i]}</div></div>`).join('')+
  (m.history.length?`<h3 style="margin:18px 0 6px;font-size:18px">Rounds</h3>`+m.history.slice().reverse().map(h=>`<div class="dim" style="padding:4px 0">Round ${h.no} · ${h.correct?'Chor caught':'Chor escaped'} · winner ${esc(h.winners)}</div>`).join(''):'')}
 return `<div class="screen">${topbar(`<button class="icon" data-a="home" aria-label="Back">←</button>`,m?`<button class="btn small ghost" data-a="resetask">Reset match</button>`:'')}<h2 style="margin:6px 0 10px">Scoreboard</h2><div class="grow scroll">${body}</div>
 ${ui.sheet==='reset'?sheet(`<h3>Reset this match?</h3><p>All scores and round history will be erased. This cannot be undone.</p><button class="btn red" data-a="resetgo">Erase scores</button><button class="btn ghost" data-a="resetno">Keep playing</button>`):''}</div>`};
V.settings=()=>{const P=S.scoring.points,rows=Object.keys(P).map(k=>`<div class="set"><div>${R[k].name}</div>${['base','correct','wrong'].map(f=>`<input type="number" inputmode="numeric" data-k="${k}" data-f="${f}" value="${P[k][f]}">`).join('')}</div>`).join('');
 return `<div class="screen">${topbar(`<button class="icon" data-a="home" aria-label="Back">←</button>`,'')}<h2 style="margin:6px 0 8px">Settings</h2><div class="grow scroll col">
 <div class="tog"><span>Sound</span><button class="btn small ${S.sound?'':'ghost'}" data-a="tsound">${S.sound?'On':'Muted'}</button></div>
 <div class="tog"><span>Haptics</span><button class="btn small ${S.haptics?'':'ghost'}" data-a="thaptic">${S.haptics?'On':'Off'}</button></div>
 <div class="rule"></div><h3 style="font-size:19px">Scoring</h3>
 <p class="dim">Known rules: the Raja starts at 100 and the Brother steals 15 after a correct accusation. All other values are placeholders you can change. Changes apply from the next round.</p>
 <div class="set dim"><div></div><div>Start</div><div>Caught</div><div>Escaped</div></div>${rows}
 <div class="set"><div>Brother's theft</div><input type="number" inputmode="numeric" data-t="1" value="${S.scoring.theft}"><div></div><div></div></div>
 <button class="btn ghost" data-a="defaults" style="margin-top:6px">Restore defaults</button></div></div>`};
// ---- render ----
function render(){const s=S.screen;const html=(V[s]||V.home)();$.innerHTML=html;
 if(s==='deal'&&S.round.dealStep==='shown'){const c=document.getElementById('card');requestAnimationFrame(()=>requestAnimationFrame(()=>{c&&c.classList.add('flip')}))}}
// private-phase back-nav guard
history.replaceState({cc:1},'');history.pushState({cc:2},'');
addEventListener('popstate',()=>{history.pushState({cc:2},'');if(!['deal','accuse','reveal'].includes(S.screen)&&S.screen!=='home')go('home')});
// ---- actions ----
const A={
home(){ui.sheet=null;go('home')},settings(){go('settings')},rules(){go('rules')},scores(){ui.sheet=null;go('scores')},
resume(){const r=S.round;go(r.phase==='accuse'?'accuse':r.dealIdx>=r.roles.length?'court':'deal')},
play(){ui.err='';if(S.match&&S.round&&S.round.applied){newRound();go('deal');return}
  if(S.match&&S.round&&!S.round.applied){ui.sheet='newm';render();return}
  go('setup')},
newgo(){ui.sheet=null;go('setup')},newno(){ui.sheet=null;render()},
start(){const n=ui.mode,names=ui.names.slice(0,n).map(x=>x.trim());const e=E.validateNames(names,n);if(e){ui.err=e;render();return}
  ui.err='';S.match={players:names,totals:names.map(()=>0),history:[],roundNo:0};newRound();tone(330,.2);go('deal')},
draw(){S.round.dealStep='shown';tone(260,.15);buzz(15);save();render()},
hide(){const r=S.round;r.dealStep='handoff';r.dealIdx++;save();
  if(r.dealIdx>=r.roles.length){r.phase='court';go('court')}else render()},
decide(){S.round.phase='accuse';ui.sel=null;ui.err='';go('accuse')},
lock(){if(ui.sel===null)return;const r=S.round;if(r.roles[ui.sel]==='wazir'){ui.err='You hold the Wazir chitthi. Name someone else.';ui.sel=null;render();return}
  ui.err='';ui.confirm=ui.sel;render()},
cancel(){ui.confirm=null;render()},
confirm(){const r=S.round;if(r.applied||ui.confirm===null)return;const idx=ui.confirm;ui.confirm=null;
  const res=E.resolveRound(r.roles,idx,S.scoring);const m2=E.applyRound(S.match,r,res);
  r.applied=true;r.accused=idx;r.result=res;r.phase='reveal';
  m2.history=S.match.history.concat([{no:S.match.roundNo,correct:res.correct,winners:res.winners.map(i=>S.match.players[i]).join(' & ')}]);
  S.match=m2;ui.revealStage=0;tone(200,.3,.05);buzz([20,40,20]);go('reveal')},
unveil(){ui.revealStage=1;tone(S.round.result.correct?520:180,.4);buzz(40);render()},
results(){S.round.phase='results';go('results')},
again(){newRound();go('deal')},
resetask(){ui.sheet='reset';render()},resetno(){ui.sheet=null;render()},
resetgo(){S.match=null;S.round=null;ui.sheet=null;go('home')},
tsound(){S.sound=!S.sound;save();render()},thaptic(){S.haptics=!S.haptics;save();render()},
defaults(){S.scoring=clone(E.DEFAULT_SCORING);save();render()}};
$.addEventListener('click',e=>{const t=e.target.closest('[data-a],[data-m],[data-p]');if(!t)return;
 if(t.dataset.m){ui.mode=+t.dataset.m;ui.err='';render();return}
 if(t.dataset.p!==undefined){ui.sel=+t.dataset.p;ui.err='';tone(400,.08);render();return}
 const f=A[t.dataset.a];if(f)f()});
$.addEventListener('input',e=>{const t=e.target;
 if(t.dataset.i!==undefined){ui.names[+t.dataset.i]=t.value;ui.err='';const e=$.querySelector('.err');if(e)e.textContent='';return}
 if(t.dataset.t){S.scoring.theft=Math.max(0,parseInt(t.value)||0);save();return}
 if(t.dataset.k){S.scoring.points[t.dataset.k][t.dataset.f]=parseInt(t.value)||0;save()}});
// resume position
if(S.match&&S.round&&!S.round.applied&&S.screen==='home'){}
if(S.screen==='setup')S.screen='home';
if(S.round&&S.round.phase==='reveal'&&S.screen==='reveal')ui.revealStage=0;
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
render();
window.__cc={S:()=>S,A};
})();
