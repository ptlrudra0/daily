(function(){
const E=window.CCEngine,R=E.ROLES,KEY='chor-chitthi-v3';
try{localStorage.removeItem('chor-chitthi-v1');localStorage.removeItem('chor-chitthi-v2')}catch(e){}
const $=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HAPTIC_OK=!!navigator.vibrate;
let S=load();let ui={mode:6,names:['','','','','',''],err:''};
function fresh(){return{v:3,screen:'home',sound:true,haptics:true,players:null,round:null}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===3){
  if(s.round&&s.round.dealStep==='shown')s.round.dealStep='handoff'; // never reopen a face-up role after a restart
  return s}}catch(e){}return fresh()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function go(screen){S.screen=screen;save();render()}
let ac;function tone(f,d,v){if(!S.sound)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;g.gain.value=v||.04;g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function buzz(p){if(S.haptics&&HAPTIC_OK)try{navigator.vibrate(p)}catch(e){}}
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
const N=i=>esc(S.players[i]);
const topbar=(l,r)=>`<div class="top"><div>${l||''}</div><div>${r||''}</div></div>`;
function sheet(h){return `<div class="sheet"><div class="box">${h}</div></div>`}
function deal(){const n=S.players.length,rng=E.secureRng(),prev=S.round&&S.round.roles.length===n?S.round.roles.join():null;
  let roles=E.assignRoles(n,rng),k=0;while(prev&&roles.join()===prev&&k++<20)roles=E.assignRoles(n,rng);
  S.round={roles:roles,dealIdx:0,dealStep:'handoff',no:(S.round&&S.round.no||0)+1};save()}
const V={};
V.home=()=>{const inRound=S.players&&S.round&&S.round.dealIdx<S.round.roles.length;
 return `<div class="screen">${topbar('',`<button class="icon" data-a="settings" aria-label="Settings">⚙</button>`)}
 <div class="grow col" style="justify-content:center;gap:18px"><div class="eyebrow">A game of slips &amp; secrets</div>
 <h1 class="big">CHOR-<br>CHITTHI</h1><div class="rule"></div><p style="font-family:var(--serif);font-size:22px;color:var(--ivory)">Trust nobody. Catch the Chor.</p></div>
 <div class="col">${inRound?`<button class="btn" data-a="resume">Resume dealing</button>`:''}
 <button class="btn ${inRound?'ghost':''}" data-a="play">${inRound?'New game':'Play'}</button>
 <button class="btn ghost" data-a="rules">Rules</button></div>
 ${ui.sheet==='newm'?sheet(`<h3>Start over?</h3><p>Dealing is in progress. Starting over discards the chitthis already handed out.</p><button class="btn red" data-a="newgo">Start over</button><button class="btn ghost" data-a="newno">Keep dealing</button>`):''}</div>`};
V.setup=()=>{const n=ui.mode;let inputs='';for(let i=0;i<n;i++)inputs+=`<input class="name" data-i="${i}" maxlength="14" placeholder="Player ${i+1}" value="${esc(ui.names[i]||'')}" autocomplete="off" autocapitalize="words" enterkeyhint="next">`;
 return `<div class="screen">${topbar(`<button class="icon" data-a="home" aria-label="Back">←</button>`,'')}
 <h2 style="margin:6px 0 14px">Who is playing?</h2>
 <div class="seg"><button data-m="4" class="${n===4?'on':''}">4 players</button><button data-m="6" class="${n===6?'on':''}">6 players</button></div>
 <p class="dim" style="margin:10px 0">${n===4?'Raja, Rani, Wazir, Chor.':"Raja, Rani, Rani's Brother, Chor, Wazir, Sipahi."}</p>
 <div class="grow scroll col" style="padding-bottom:8px">${inputs}</div>
 <div class="err">${esc(ui.err)}</div><button class="btn" data-a="start">Deal the chitthis</button></div>`};
V.deal=()=>{const r=S.round,i=r.dealIdx,name=N(i);
 if(r.dealStep==='handoff')return `<div class="screen neutral"><div class="eyebrow">Chitthi ${i+1} of ${r.roles.length}</div>
  <h2>Pass the phone to<br>${name}</h2><div class="cardwrap" style="flex:0 0 auto"><div class="card" style="width:200px">${back}</div></div>
  <p class="dim">Keep the screen facing away from everyone else.</p><button class="btn" data-a="draw">I am ${name} · draw my chitthi</button></div>`;
 return `<div class="screen">${topbar(`<span class="pill">${name} · only you</span>`,'')}
  <div class="cardwrap"><div class="card" id="card">${back}${front(r.roles[i])}</div></div>
  <p class="dim" style="text-align:center;margin-bottom:12px">Remember it. Then hide it.</p>
  <button class="btn" data-a="hide">Hide &amp; pass phone</button></div>`};
V.done=()=>`<div class="screen neutral"><div class="eyebrow">All chitthis dealt</div>${SEAL.replace('class="seal"','class="seal" style="width:110px;height:110px"')}
 <h2>Everyone has a role.</h2><p>Put the phone down. Talk, bluff, accuse and keep score in person.</p>
 <div class="col" style="width:100%;margin-top:8px"><button class="btn" data-a="redeal">Deal again · fresh chitthis</button><button class="btn ghost" data-a="newplayers">Change players</button><button class="btn ghost" data-a="home">Home</button></div></div>`;
V.rules=()=>`<div class="screen">${topbar(`<button class="icon" data-a="home" aria-label="Back">←</button>`,'')}<h2 style="margin:6px 0 12px">How it works</h2><div class="grow scroll col">
 <p>Enter the players. The phone deals one secret chitthi to each, exactly one of every role.</p>
 <p>Pass the phone round. Only the holder looks. Hide it before passing on.</p>
 <p>4 players: Raja, Rani, Wazir, Chor. 6 players add Rani's Brother and Sipahi.</p>
 <p>Then play in person. Rani advises, the Wazir names the Chor, and you settle the points among yourselves. The app keeps no score.</p></div></div>`;
V.settings=()=>`<div class="screen">${topbar(`<button class="icon" data-a="home" aria-label="Back">←</button>`,'')}<h2 style="margin:6px 0 8px">Settings</h2><div class="grow scroll col">
 <div class="tog"><span>Sound</span><button class="btn small ${S.sound?'':'ghost'}" data-a="tsound">${S.sound?'On':'Muted'}</button></div>
 <div class="tog"><span>Haptics</span>${HAPTIC_OK?`<button class="btn small ${S.haptics?'':'ghost'}" data-a="thaptic">${S.haptics?'On':'Off'}</button>`:`<span class="dim">Not available on this device</span>`}</div></div></div>`;
function render(){const s=S.screen;$.innerHTML=(V[s]||V.home)();
 if(s==='deal'&&S.round.dealStep==='shown'){const c=document.getElementById('card');requestAnimationFrame(()=>requestAnimationFrame(()=>{c&&c.classList.add('flip')}))}}
history.replaceState({cc:1},'');history.pushState({cc:2},'');
addEventListener('popstate',()=>{history.pushState({cc:2},'');if(!['deal','home'].includes(S.screen))go('home')});
const A={
home(){ui.sheet=null;go('home')},settings(){go('settings')},rules(){go('rules')},
resume(){go(S.round.dealIdx>=S.round.roles.length?'done':'deal')},
play(){ui.err='';const inRound=S.players&&S.round&&S.round.dealIdx<S.round.roles.length;if(inRound){ui.sheet='newm';render();return}go('setup')},
newgo(){ui.sheet=null;S.round=null;go('setup')},newno(){ui.sheet=null;render()},
newplayers(){S.round=null;go('setup')},
start(){const n=ui.mode,names=ui.names.slice(0,n).map(x=>x.trim());const e=E.validateNames(names,n);if(e){ui.err=e;render();return}
  ui.err='';S.players=names;S.round=null;deal();tone(330,.2);go('deal')},
draw(){S.round.dealStep='shown';tone(260,.15);buzz(15);save();render()},
hide(){const r=S.round;r.dealStep='handoff';r.dealIdx++;save();if(r.dealIdx>=r.roles.length)go('done');else render()},
redeal(){deal();tone(330,.2);go('deal')},
tsound(){S.sound=!S.sound;save();render()},thaptic(){S.haptics=!S.haptics;save();render()}};
$.addEventListener('click',e=>{const t=e.target.closest('[data-a],[data-m]');if(!t)return;
 if(t.dataset.m){ui.mode=+t.dataset.m;ui.err='';render();return}
 const f=A[t.dataset.a];if(f)f()});
$.addEventListener('input',e=>{const t=e.target;if(t.dataset.i!==undefined){ui.names[+t.dataset.i]=t.value;ui.err='';const x=$.querySelector('.err');if(x)x.textContent=''}});
if(S.screen==='setup')S.screen='home';
if(S.screen==='deal'&&!S.round)S.screen='home';
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
render();
window.__cc={S:()=>S,A};
})();
