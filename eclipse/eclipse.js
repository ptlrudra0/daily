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
  try{skyInit();}catch(e){document.body.classList.add('no-webgl');}
}

/* ---------- shared fragments ---------- */

/* ---------- recreated orange treatments (approved study defaults) ---------- */
var SKY_VERT='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
var SKY_FRAG_B=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;uniform float u_time;
uniform float u_flowAmp,u_flowSpeed,u_rimW,u_haloTau,u_warm;
void main(){
  vec2 p=vec2(gl_FragCoord.x,u_res.y-gl_FragCoord.y);
  float sc=max(u_res.x/1081.0,u_res.y/800.0);
  vec2 ctr=vec2(-89.3,684.3)*sc;
  float R=802.0*sc;
  vec2 dp=p-ctr;
  float d=length(dp);
  float th=atan(dp.y,dp.x);
  float ph=u_time*u_flowSpeed;
  float R_eff=R*(1.0+u_flowAmp*(0.012*sin(3.0*th+ph*0.35)+0.008*sin(5.0*th-ph*0.22)+0.006*sin(2.0*th+ph*0.5)));
  float litA=-0.855+0.05*u_flowAmp*sin(ph*0.11+0.7);
  float t=d-R_eff;
  float dth=th-litA;
  float body_g=exp(min(t+60.0*sc,0.0)/(430.0*sc));
  float ang=dth<0.0?exp(-pow(dth/1.98,2.0)):exp(-pow(dth/0.43,2.5));
  float rim_g=exp(-pow(t/(u_rimW*sc),2.0))*exp(-pow(dth/0.60,2.0))*0.80;
  float tout=max(t,0.0);
  float sig=0.62*exp(-tout/(500.0*sc));
  float halo_g=exp(-tout/(u_haloTau*sc))*exp(-pow(dth/max(sig,0.05),2.0))*step(0.0,t)*1.05;
  halo_g*=1.0+0.06*u_flowAmp*sin(ph*0.17+1.3);
  vec3 wbody=vec3(170.,72.,40.)/255.*0.98*u_warm;
  vec3 body=wbody*body_g*ang*step(t,0.0);
  vec3 rim=vec3(255.,165.,115.)/255.*rim_g;
  vec3 halo=vec3(255.,140.,80.)/255.*halo_g;
  vec3 c=1.0-(1.0-clamp(body,0.,1.))*(1.0-clamp(rim,0.,1.))*(1.0-clamp(halo,0.,1.));
  c=max(c,vec3(9./255.));
  gl_FragColor=vec4(c,1.0);
}`;
var SKY_FRAG_A=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;uniform float u_time;
uniform float u_flowAmp,u_flowSpeed,u_verm,u_pale;
// reference frame 820x1040 (fitted still), cover-fit
vec3 ell(vec2 p,vec2 c,vec2 r,vec3 col,float amp,float pw){
  vec2 q=(p-c)/r;
  float d=dot(q,q);
  return col*exp(-pow(d,pw))*amp;
}
void main(){
  float sc=max(u_res.x/820.0,u_res.y/1040.0);
  vec2 p=vec2(gl_FragCoord.x,u_res.y-gl_FragCoord.y)/sc;
  float ph=u_time*u_flowSpeed;
  vec2 d1=u_flowAmp*vec2(0.03*820.0*sin(ph*0.13),0.018*1040.0*sin(ph*0.09+1.0));
  vec2 d2=u_flowAmp*vec2(0.025*820.0*sin(ph*0.11+2.1),0.0125*1040.0*sin(ph*0.14+0.4));
  vec2 d3=u_flowAmp*vec2(0.02*820.0*sin(ph*0.07+4.0),0.01*1040.0*sin(ph*0.10+2.8));
  float b1=1.0+0.05*u_flowAmp*sin(ph*0.15+0.3);
  float b2=1.0+0.06*u_flowAmp*sin(ph*0.12+2.2);
  vec3 col=vec3(0.);
  col+=ell(p,vec2(0.483*820.0,-0.162*1040.0)+d1,vec2(0.336*820.0,0.653*1040.0),vec3(237.,86.,18.)/255.,1.08*b1*u_verm,1.4);
  col+=ell(p,vec2(0.496*820.0,0.303*1040.0)+d2,vec2(0.400*820.0,0.193*1040.0),vec3(249.,120.,38.)/255.,0.34*b2*u_verm,1.4);
  col+=ell(p,vec2(0.22*820.0,0.42*1040.0)+d3,vec2(0.42*820.0,0.45*1040.0),vec3(150.,110.,88.)/255.,0.30*u_pale,1.2);
  col=min(col,vec3(1.0));
  gl_FragColor=vec4(col,1.0);
}`;
function mkSkyScene(id,frag,vals){
  var cv=document.getElementById(id);if(!cv)return null;
  var gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});
  if(!gl){cv.style.display='none';return null;}
  function sh(ty,src){
    var s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
      if(ty===gl.FRAGMENT_SHADER&&src.indexOf('highp')>-1){
        var s2=gl.createShader(ty);gl.shaderSource(s2,src.replace(/highp/g,'mediump'));gl.compileShader(s2);
        if(gl.getShaderParameter(s2,gl.COMPILE_STATUS))return s2;
      }
      return null;
    }
    return s;
  }
  var vs=sh(gl.VERTEX_SHADER,SKY_VERT),fs=sh(gl.FRAGMENT_SHADER,frag);
  if(!vs||!fs){cv.style.display='none';return null;}
  var pr=gl.createProgram();
  gl.attachShader(pr,vs);
  gl.attachShader(pr,fs);
  gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){cv.style.display='none';return null;}
  gl.useProgram(pr);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var U={};['u_res','u_time'].concat(Object.keys(vals)).forEach(function(n){U[n]=gl.getUniformLocation(pr,n);});
  return {cv:cv,gl:gl,U:U,vals:vals};
}
function sizeSky(s){
  var dpr=Math.min(window.devicePixelRatio||1,1.5);
  var w=Math.round(window.innerWidth*dpr),h=Math.round(window.innerHeight*dpr);
  if(s.cv.width!==w||s.cv.height!==h){s.cv.width=w;s.cv.height=h;s.gl.viewport(0,0,w,h);}
}
function drawSky(s,t){
  s.gl.uniform2f(s.U.u_res,s.cv.width,s.cv.height);
  s.gl.uniform1f(s.U.u_time,t);
  Object.keys(s.vals).forEach(function(k){s.gl.uniform1f(s.U[k],s.vals[k]);});
  s.gl.drawArrays(s.gl.TRIANGLES,0,3);
}
function skyInit(){
  var sB=mkSkyScene('bgB',SKY_FRAG_B,{u_flowAmp:1,u_flowSpeed:1,u_rimW:26,u_haloTau:420,u_warm:0.98});
  var sA=mkSkyScene('bgA',SKY_FRAG_A,{u_flowAmp:1,u_flowSpeed:1,u_verm:1,u_pale:1});
  if(!sB&&!sA){document.body.classList.add('no-webgl');return;}
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mix(){return sA?Math.min(1,Math.max(0,window.scrollY/(window.innerHeight*0.9))):1;}
  function fade(){if(sA)sA.cv.style.opacity=(1-mix()).toFixed(3);}
  if(reduced){
    if(sB){sizeSky(sB);drawSky(sB,4);}
    if(sA){sizeSky(sA);drawSky(sA,4);fade();}
    var pend=false;
    window.addEventListener('scroll',function(){
      fade();
      if(pend)return;pend=true;
      requestAnimationFrame(function(){pend=false;if(sB){drawSky(sB,4);}if(sA&&sA.cv.style.opacity!=='0'){drawSky(sA,4);}});
    },{passive:true});
    window.addEventListener('resize',function(){if(sB){sizeSky(sB);drawSky(sB,4);}if(sA){sizeSky(sA);drawSky(sA,4);}},{passive:true});
    return;
  }
  var t0=performance.now();
  (function loop(now){
    requestAnimationFrame(loop);
    if(document.hidden)return;
    var t=(now-t0)/1000,p=mix();
    if(sA)sA.cv.style.opacity=(1-p).toFixed(3);
    if(sB&&p>0.001){sizeSky(sB);drawSky(sB,t);}
    if(sA&&p<0.999){sizeSky(sA);drawSky(sA,t);}
  })(t0);
  window.addEventListener('resize',function(){if(sB)sizeSky(sB);if(sA)sizeSky(sA);},{passive:true});
}

function skyHTML(mode){
  var c='<canvas class="skyc" id="bgB" aria-hidden="true"></canvas>';
  if(mode!=='issue')c+='<canvas class="skyc" id="bgA" aria-hidden="true"></canvas>';
  return c+'<div class="vignette" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>';}
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
  '<div class="fcol"><h4>Colophon</h4><p>Playfair Display, Inter and Anton. Pitch-black ground, recreated vermilion treatments, restrained flowing motion. Browser approximation of the references.</p></div>'+
  '</div><div class="legal"><span>&copy; 2026 The Daily Draft</span><span>Preview build</span></div></footer>';}

window.ECLIPSE={DATA_URL:DATA_URL,esc:esc,fmtDate:fmtDate,chrome:chrome,skyHTML:skyHTML,skyInit:skyInit,topHTML:topHTML,menuHTML:menuHTML,footHTML:footHTML};
})();
