/* The Daily Draft - dark edition (preview). Shared chrome + data. */
(function(){
"use strict";
var DATA_URL='../content.json';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmtDate(iso){var d=new Date(iso+'T12:00:00');var M=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];return d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear()}

/* ---------- chrome: menu, clock, reveal ---------- */
function chrome(){
  var burger=document.getElementById('burger'),menu=document.getElementById('menu');
  if(burger&&menu){
    burger.addEventListener('click',function(){
      var on=menu.classList.toggle('on');
      burger.classList.toggle('open',on);
      burger.setAttribute('aria-expanded',on?'true':'false');
      document.body.style.overflow=on?'hidden':'';
    });
    menu.addEventListener('click',function(e){if(e.target.closest('a')){burger.click();}});
  }
  var clock=document.getElementById('menuClock');
  if(clock){
    var tick=function(){
      var d=new Date();
      try{clock.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:'Asia/Kolkata'}).format(d)+' IST';}
      catch(e){clock.textContent=d.toTimeString().slice(0,8);}
    };
    tick();setInterval(tick,1000);
  }
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:.12});
    Array.prototype.forEach.call(document.querySelectorAll('.rv'),function(el){io.observe(el);});
  }else{
    Array.prototype.forEach.call(document.querySelectorAll('.rv'),function(el){el.classList.add('in');});
  }
}

/* ---------- shared fragments ---------- */
function skyHTML(){return '<div class="sky" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="blob b4"></div><div class="sheen"></div></div><div class="vignette" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>';}
function topHTML(){return '<div class="topbar"><div class="page"><header class="top"><a class="wordmark" href="index.html">The Daily <em>Draft</em></a></header></div><button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button></div>';}
function menuHTML(){return '<nav class="menu" id="menu" aria-hidden="true"><div class="mblob m1"></div><div class="mblob m2"></div><div class="mblob m3"></div><div class="menu-inner">'+
  '<a class="menu-item" href="index.html#today">Today</a>'+
  '<a class="menu-item" href="index.html#archive">Archive</a>'+
  '<a class="menu-item" href="../index.html">Classic site<small>live</small></a>'+
  '<a class="menu-item" href="https://www.cosmos.so/e/720594073" rel="noopener">Reference</a>'+
  '</div><div class="menu-meta"><span id="menuClock">--:--:-- IST</span><span><b>Preview</b> - not the live design</span></div></nav>';}
function footHTML(){return '<footer><div class="foot">'+
  '<div class="fcol"><h4>The Daily Draft</h4><p>A morning edition of ideas worth your coffee. Published daily, read in minutes.</p></div>'+
  '<div class="fcol"><h4>Status</h4><p>Design preview inspired by Cosmos references. The live edition stays at the classic site. Nothing here is final.</p></div>'+
  '<div class="fcol"><h4>Colophon</h4><p>Playfair Display, Inter and Anton. Pitch-black ground, vermilion light, liquid gradient motion. Browser approximation of the references.</p></div>'+
  '</div><div class="legal"><span>&copy; 2026 The Daily Draft</span><span>Preview build</span></div></footer>';}

window.ECLIPSE={DATA_URL:DATA_URL,esc:esc,fmtDate:fmtDate,chrome:chrome,skyHTML:skyHTML,topHTML:topHTML,menuHTML:menuHTML,footHTML:footHTML};
})();
