/* ── CANVAS ───────────────────────────────────────────────── */
const c0=document.getElementById('c0'),x0=c0.getContext('2d');
const c1=document.getElementById('c1'),x1=c1.getContext('2d');
let W,H;
function resize(){W=c0.width=c1.width=innerWidth;H=c0.height=c1.height=innerHeight}
resize();
window.addEventListener('resize',()=>{resize();initStars()});

/* ── STARFIELD ────────────────────────────────────────────── */
let stars=[];
function initStars(){
  stars=[];
  const n=Math.floor(W*H/8000);
  for(let i=0;i<n;i++) stars.push({
    x:Math.random()*W,y:Math.random()*H,
    r:Math.random()*.7+.1,a:Math.random()*.2+.02,
    vx:(Math.random()-.5)*.06,vy:(Math.random()-.5)*.06,
    col:['58,134,255','139,94,60','242,233,228'][i%3]
  });
}
initStars();

let starActive=true,buildPh=0;
function bgLoop(){
  requestAnimationFrame(bgLoop);
  x0.fillStyle=starActive?'rgba(0,0,0,.15)':'rgba(0,0,0,.08)';
  x0.fillRect(0,0,W,H);
  for(const s of stars){
    const m=starActive?(1+buildPh*2.5):0.4;
    s.x+=s.vx*m;s.y+=s.vy*m;
    if(s.x<0)s.x=W;if(s.x>W)s.x=0;
    if(s.y<0)s.y=H;if(s.y>H)s.y=0;
    x0.beginPath();x0.arc(s.x,s.y,s.r*(1+buildPh*.4),0,Math.PI*2);
    x0.fillStyle=`rgba(${s.col},${s.a*(1+buildPh*.5)})`;x0.fill();
  }
}
bgLoop();

/* ── EXPLOSION ────────────────────────────────────────────── */
let parts=[],waves=[],debris=[],flashA=0,expStarted=false;
let pulseRings=[];
const ECOLS=['#3a86ff','#60a5fa','#93c5fd','#bfdbfe','#8b5e3c','#c2855a','#f2c49b','#ffe8c0','#ffffff','#f0f0f0','#ff9f1c','#ff6b6b','#06d6a0','#ffbe0b'];

function explode(){
  expStarted=true;flashA=1;
  const cx=W/2,cy=H/2;
  for(let i=0;i<6;i++) waves.push({x:cx,y:cy,r:0,maxR:Math.max(W,H)*.85,a:.9-i*.1,speed:22+i*8,col:i<3?'255,255,255':'58,134,255',delay:i*4,fr:0,lw:3-i*.35});
  for(let i=0;i<600;i++){
    const a=Math.random()*Math.PI*2,spd=Math.pow(Math.random(),.35)*(38+Math.random()*20),col=ECOLS[Math.floor(Math.random()*ECOLS.length)],big=Math.random()<.07;
    parts.push({x:cx,y:cy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:big?Math.random()*7+4:Math.random()*3+.5,col,a:1,life:1,decay:Math.random()*.012+.006+(big?.003:0),grav:Math.random()*.18+.05,trail:[],shard:Math.random()<.25,big});
  }
  for(let i=0;i<80;i++){
    const a=Math.random()*Math.PI*2,spd=Math.random()*12+3,col=ECOLS[Math.floor(Math.random()*ECOLS.length)];
    debris.push({x:cx,y:cy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-3,w:Math.random()*14+4,h:Math.random()*4+1,rot:Math.random()*Math.PI*2,rotV:(Math.random()-.5)*.2,col,a:1,life:1,decay:Math.random()*.008+.004,grav:.25});
  }
  [[.25,.15],[-.2,.2],[.1,-.25],[-.15,-.15],[.3,-.1]].forEach(([ox,oy],i)=>
    setTimeout(()=>miniBurst(cx+ox*W*.4,cy+oy*H*.4,50),80+i*60));
}
function miniBurst(cx,cy,n){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,spd=Math.random()*14+2,col=ECOLS[Math.floor(Math.random()*ECOLS.length)];
    parts.push({x:cx,y:cy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:Math.random()*2.5+.5,col,a:1,life:1,decay:Math.random()*.018+.01,grav:Math.random()*.15+.04,trail:[],shard:false,big:false});}
}
function hexA(h,a){if(!h||!h.startsWith('#'))return`rgba(255,255,255,${a})`;const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${+a.toFixed(3)})`}

let expFrame=0;
function expLoop(){
  requestAnimationFrame(expLoop);
  x1.clearRect(0,0,W,H);
  if(!expStarted)return;
  expFrame++;
  if(flashA>0){x1.fillStyle=`rgba(255,255,255,${flashA})`;x1.fillRect(0,0,W,H);flashA=Math.max(0,flashA-.07);}
  for(const w of waves){w.fr++;if(w.fr<w.delay)continue;w.r+=w.speed;w.a*=.935;if(w.a<.004||w.r>w.maxR)continue;x1.beginPath();x1.arc(w.x,w.y,w.r,0,Math.PI*2);x1.strokeStyle=`rgba(${w.col},${w.a})`;x1.lineWidth=Math.max(.5,w.lw*(1-w.r/w.maxR)*3);x1.stroke();}
  for(const d of debris){if(d.life<=0)continue;d.x+=d.vx;d.y+=d.vy;d.vy+=d.grav;d.vx*=.985;d.rot+=d.rotV;d.life-=d.decay;d.a=Math.max(0,d.life);x1.save();x1.translate(d.x,d.y);x1.rotate(d.rot);x1.fillStyle=hexA(d.col,d.a);x1.fillRect(-d.w/2,-d.h/2,d.w,d.h);x1.restore();}
  let alive=0;
  for(const p of parts){if(p.life<=0)continue;alive++;p.trail.push({x:p.x,y:p.y,a:p.a});if(p.trail.length>10)p.trail.shift();p.x+=p.vx;p.y+=p.vy;p.vy+=p.grav;p.vx*=.984;p.vy*=.984;p.life-=p.decay;p.a=Math.max(0,p.life);
    for(let t=1;t<p.trail.length;t++){const t0=p.trail[t-1],t1=p.trail[t],tf=t/p.trail.length;x1.beginPath();x1.moveTo(t0.x,t0.y);x1.lineTo(t1.x,t1.y);x1.strokeStyle=hexA(p.col,t0.a*tf*.5);x1.lineWidth=p.r*tf;x1.stroke();}
    if(p.shard){x1.save();x1.translate(p.x,p.y);x1.rotate(Math.atan2(p.vy,p.vx));x1.fillStyle=hexA(p.col,p.a);x1.fillRect(-p.r*2.5,-p.r*.4,p.r*5,p.r*.8);x1.restore();}
    else{x1.beginPath();x1.arc(p.x,p.y,p.r,0,Math.PI*2);x1.fillStyle=hexA(p.col,p.a);x1.fill();}
    if(p.big&&p.r>3){const g=x1.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*8);g.addColorStop(0,hexA(p.col,p.a*.5));g.addColorStop(1,'rgba(0,0,0,0)');x1.beginPath();x1.arc(p.x,p.y,p.r*8,0,Math.PI*2);x1.fillStyle=g;x1.fill();}
  }
}
expLoop();

/* ── SCREEN SHAKE ─────────────────────────────────────────── */
function shake(el,intensity,dur){let t=0,tot=dur/16;const id=setInterval(()=>{t++;const s=Math.max(0,1-t/tot);el.style.transform=`translate(${(Math.random()-.5)*intensity*s*2}px,${(Math.random()-.5)*intensity*s*2}px)`;if(t>=tot){clearInterval(id);el.style.transform=''}},16)}

/* ── SPARKLINE (memecoin) ────────────────────────────────── */
function drawSparkline(){
  const cvs=document.getElementById('mc-chart');if(!cvs)return;
  const ctx=cvs.getContext('2d');
  const W=cvs.clientWidth||260,H=cvs.clientHeight||70;
  cvs.width=W*devicePixelRatio;cvs.height=H*devicePixelRatio;
  ctx.scale(devicePixelRatio,devicePixelRatio);
  const pts=[];let v=50;
  for(let i=0;i<60;i++){v+=(Math.random()-.45)*8;v=Math.max(5,Math.min(95,v));pts.push(v);}
  const min=Math.min(...pts),max=Math.max(...pts),range=max-min||1;
  const sx=W/(pts.length-1),sy=H/range;
  ctx.beginPath();
  pts.forEach((p,i)=>i?ctx.lineTo(i*sx,(max-p)*sy):ctx.moveTo(0,(max-p)*sy));
  ctx.strokeStyle='#f7b731';ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.stroke();
  const last=pts[pts.length-1];
  ctx.lineTo((pts.length-1)*sx,H);ctx.lineTo(0,H);ctx.closePath();
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'rgba(247,183,49,.25)');g.addColorStop(1,'rgba(247,183,49,0)');
  ctx.fillStyle=g;ctx.fill();
}

/* ── UNITED FAKE ENTRIES ─────────────────────────────────── */
const utEntries=[
  {name:'3D Solar System Sim',views:1842,likes:203},
  {name:'Pixel Rain Generator',views:997,likes:88},
  {name:'Lo-fi Stream Hub',views:3401,likes:512},
  {name:'Morse Code Translator',views:564,likes:41},
  {name:'Fake Tweet Maker',views:7229,likes:890},
];
function buildUnitedPreview(){
  const wrap=document.getElementById('ut-wrap');if(!wrap)return;
  wrap.innerHTML='';
  utEntries.forEach((e,i)=>{
    const el=document.createElement('div');el.className='ut-item';
    el.style.animationDelay=`${i*.08}s`;
    el.innerHTML=`<div class="ut-dot"></div><div class="ut-info"><div class="ut-name">${e.name}</div></div><div class="ut-views">${e.views.toLocaleString()} views</div><div class="ut-likes">♥ ${e.likes}</div>`;
    wrap.appendChild(el);
    setInterval(()=>{if(Math.random()<.3){e.views+=Math.floor(Math.random()*3+1);el.querySelector('.ut-views').textContent=e.views.toLocaleString()+' views';}},1800+i*400);
  });
}

/* ── MEMECOIN TICKER ─────────────────────────────────────── */
let mcPrice=0.0042;
function tickPrice(){
  mcPrice*=(1+(Math.random()-.48)*.02);
  const pEl=document.getElementById('mc-price');
  const cEl=document.getElementById('mc-change');
  if(pEl)pEl.textContent=`$${mcPrice.toFixed(4)}`;
  if(cEl){const up=Math.random()>.45;cEl.textContent=(up?'▲ ':'▼ ')+(Math.random()*8+.5).toFixed(1)+'%';cEl.style.color=up?'#06d6a0':'#ff6b6b';}
}

/* ── HUB CLOCK ────────────────────────────────────────────── */
function updateClock(){const el=document.getElementById('hub-time');if(el)el.textContent=new Date().toLocaleTimeString('en-NZ',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}

/* ── SEQUENCE ─────────────────────────────────────────────── */
const intro=document.getElementById('intro');
const hub=document.getElementById('hub');
const aring=document.getElementById('aring');
const rf=document.getElementById('rf');
const ws=document.getElementById('ws');
const isub=document.getElementById('isub');
const ibar=document.getElementById('ibar');
const avimg=document.getElementById('avimg');
const corners=document.querySelectorAll('.corner');

window.addEventListener('load',()=>{
  setTimeout(()=>{ aring.style.opacity=1 },200);
  setTimeout(()=>{ avimg.style.opacity=1 },500);
  setTimeout(()=>{ rf.style.transition='stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)';rf.style.strokeDashoffset=0 },400);
  setTimeout(()=>{ ws.style.transition='transform .85s cubic-bezier(.16,1,.3,1)';ws.style.transform='translateY(0)' },800);
  setTimeout(()=>{ isub.style.transition='opacity .5s ease,transform .5s ease';isub.style.opacity=1;isub.style.transform='translateY(0)' },1300);
  setTimeout(()=>{ ibar.style.transition='opacity .3s';ibar.style.opacity=1 },1600);
  setTimeout(()=>{ ibar.style.transition='opacity .3s'; },1600);
  setTimeout(()=>{
    ibar.style.opacity=1;
    const barInner=document.createElement('div');
    barInner.style.cssText='position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,#8b5e3c,#3a86ff);transition:width 1.4s cubic-bezier(.4,0,.2,1)';
    ibar.appendChild(barInner);
    requestAnimationFrame(()=>requestAnimationFrame(()=>barInner.style.width='100%'));
  },1650);

  setTimeout(()=>{
    let bf=0;
    const bId=setInterval(()=>{
      bf++;buildPh=Math.min(1,bf/40);
      if(bf%8===0) pulseRings.push({r:0,a:.5,x:W/2,y:H/2});
      if(bf>20){const s=(buildPh-.5)*8;intro.style.transform=`translate(${(Math.random()-.5)*s}px,${(Math.random()-.5)*s}px)`;}
      if(bf>=50){clearInterval(bId);intro.style.transform='';}
    },16);
  },2000);

  setTimeout(()=>{
    explode();
    shake(document.body,28,900);
    setTimeout(()=>{ intro.style.transition='opacity .15s';intro.style.opacity=0; },100);
    setTimeout(()=>{
      intro.style.display='none';
      starActive=false;
      buildPh=0;
      hub.style.pointerEvents='auto';
      hub.style.transition='opacity .9s cubic-bezier(.16,1,.3,1)';
      hub.style.opacity=1;
      document.querySelectorAll('.card').forEach((c,i)=>{
        c.style.opacity=0;c.style.transform='translateY(24px)';
        setTimeout(()=>{ c.style.transition='opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)';c.style.opacity=1;c.style.transform='none'; },i*120);
      });
      corners.forEach(c=>{ c.style.transition='opacity .6s';c.style.opacity=1 });
      setTimeout(()=>{drawSparkline();buildUnitedPreview();},300);
      setInterval(tickPrice,3000);
      setInterval(updateClock,1000);updateClock();
    },850);
  },2900);
});
