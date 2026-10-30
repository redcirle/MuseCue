/* Canvas 2D adaptation of LEDHalloweenBackdrops.swift: three effects, three palettes. */
(() => {
  const card = document.getElementById('halloween-card');
  const canvas = document.getElementById('halloween-canvas');
  if (!card || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const palettes = [
    { name: 'pumpkin', bg: 0x150b20, fg: 0xff7a1a, fg2: 0xf4ebd9, acc: 0x8a5cd6 },
    { name: 'slime', bg: 0x08120a, fg: 0x8be04e, fg2: 0xf4ebd9, acc: 0xff7a1a },
    { name: 'blood', bg: 0x1a0508, fg: 0xe8352b, fg2: 0xf4ebd9, acc: 0xffb347 }
  ];
  const effects = ['floating', 'candy', 'runes'];
  const effect = effects[Math.floor(Math.random() * effects.length)];
  const theme = palettes[Math.floor(Math.random() * palettes.length)];
  const seed = (Math.random() * 0xffffffff) >>> 0;
  const tau = Math.PI * 2;
  // Same glyph filter as the Swift source, checked against the bundled EB Garamond file.
  const glyphs = Array.from('ΓΔΘΛΞΠΣΦΨΩαβγδζθλμξπσφψωЖЗИЛПФЦЧШЩЮЯжзлфцчшщюя∑∆∇∫≈≠∞√∂∏');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 1, h = 1, dpr = 1, visible = true;
  const started = performance.now();
  let lastFrame = -Infinity;

  card.dataset.halloweenEffect = effect;
  card.dataset.halloweenPalette = theme.name;
  card.style.backgroundColor = hex(theme.bg);
  card.style.setProperty('--halloween-title', hex(theme.fg2));
  card.style.setProperty('--halloween-glow', hex(theme.fg));

  function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }
  function rgb(n) { return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, k) {
    const aa = rgb(a), bb = rgb(b);
    return `rgb(${aa.map((v, i) => Math.round(v + (bb[i] - v) * k)).join(',')})`;
  }
  function rgba(n, a) { const c = rgb(n); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
  function shade(n, k) { return mix(theme.bg, n, k); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp(x, a = 0, b = 1) { return Math.min(b, Math.max(a, x)); }
  function mixSeed(s, a, b) {
    let v = Math.imul(s, 0x9e3779b1) ^ Math.imul(a, 0x85ebca6b);
    v = Math.imul(v ^ (v >>> 15), 0x2c1b3c6d);
    v ^= Math.imul(b, 0xc2b2ae35);
    v = Math.imul(v ^ (v >>> 13), 0x297a2d39);
    return (v ^ (v >>> 16)) >>> 0;
  }
  function rng(s) {
    let a = s >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let v = Math.imul(a ^ (a >>> 15), a | 1);
      v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
      return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
    };
  }
  function range(r, lo, hi) { return lo + (hi - lo) * r(); }
  function ellipse(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, tau); }
  function polygon(points) {
    ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
    for (const p of points.slice(1)) ctx.lineTo(p[0], p[1]);
    ctx.closePath();
  }

  function pumpkin(r, k, face) {
    ctx.fillStyle = shade(0xff7a1a, k);
    for (const [x, rx] of [[-0.5, 0.58], [0.5, 0.58], [0, 0.6]]) {
      ellipse(x * r, x ? 0.05 * r : 0, rx * r, (x ? 0.82 : 0.9) * r); ctx.fill();
    }
    ctx.fillStyle = shade(0x6fbf3a, k);
    polygon([[-.14*r,-.8*r],[-.08*r,-1.2*r],[.16*r,-1.15*r],[.1*r,-.8*r]]); ctx.fill();
    if (!face) return;
    ctx.fillStyle = shade(0xffc93c, k);
    polygon([[-.33*r,-.32*r],[-.15*r,-.05*r],[-.5*r,-.05*r]]); ctx.fill();
    polygon([[.33*r,-.32*r],[.5*r,-.05*r],[.15*r,-.05*r]]); ctx.fill();
    polygon([[0,.04*r],[.08*r,.2*r],[-.08*r,.2*r]]); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-.45*r,.27*r);
    for (const [x,y] of [[-.28,.5],[-.12,.33],[0,.52],[.12,.33],[.28,.5],[.45,.27]]) ctx.lineTo(x*r,y*r);
    ctx.quadraticCurveTo(0,.78*r,-.45*r,.27*r); ctx.closePath(); ctx.fill();
  }
  function ghost(r, k, face) {
    const y0 = .85 * r;
    ctx.fillStyle = shade(0xf4ebd9, k);
    ctx.beginPath(); ctx.moveTo(-r,y0); ctx.lineTo(-r,0);
    ctx.arc(0,0,r,Math.PI,0); ctx.lineTo(r,y0);
    for (let j = 0; j < 3; j++) {
      const cx = r - (r / 3) * (1 + 2 * j);
      ctx.arc(cx,y0,r/3,0,Math.PI);
    }
    ctx.closePath(); ctx.fill();
    if (!face) return;
    ctx.fillStyle = hex(theme.bg);
    for (const [x,y,rx,ry] of [[-.35,-.1,.14,.21],[.35,-.1,.14,.21],[0,.32,.14,.2]]) {
      ellipse(x*r,y*r,rx*r,ry*r); ctx.fill();
    }
  }
  function sparkle(r,k) {
    ctx.fillStyle = shade(0xf4ebd9,k);
    ctx.beginPath(); ctx.moveTo(0,-r);
    ctx.quadraticCurveTo(0,0,r,0); ctx.quadraticCurveTo(0,0,0,r);
    ctx.quadraticCurveTo(0,0,-r,0); ctx.quadraticCurveTo(0,0,0,-r);
    ctx.fill();
  }
  function ribbon(len, thick, amp, phase, k) {
    const top = [], bot = [];
    for (let j=0; j<=28; j++) {
      const s=j/28, env=Math.sin(Math.PI*s)*.9+.1;
      const y=Math.sin(tau*s*1.1-phase)*amp*env;
      top.push([s*len,y-thick/2]); bot.push([s*len,y+thick/2]);
    }
    polygon(top.concat(bot.reverse()));
    ctx.fillStyle=shade(0xf4ebd9,k); ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle=rgba(theme.bg,.25); ctx.lineWidth=thick*.09;
    for (let x=0; x<len; x+=thick*.8) {
      ctx.beginPath(); ctx.moveTo(x,-amp-thick); ctx.lineTo(x+thick*.6,amp+thick); ctx.stroke();
    }
    ctx.restore();
  }
  function candyCorn(s,k) {
    polygon([[0,-.8*s],[-.55*s,.7*s],[.55*s,.7*s]]);
    ctx.save(); ctx.clip();
    ctx.fillStyle=shade(0xf4ebd9,k); ctx.fillRect(-s,-.9*s,2*s,.6*s);
    ctx.fillStyle=shade(0xff7a1a,k); ctx.fillRect(-s,-.3*s,2*s,.5*s);
    ctx.fillStyle=shade(0xffc93c,k); ctx.fillRect(-s,.2*s,2*s,.6*s);
    ctx.restore();
  }
  function wrapped(s,col) {
    ctx.fillStyle=col; ellipse(0,0,.5*s,.36*s); ctx.fill();
    polygon([[-.45*s,0],[-.98*s,-.4*s],[-.98*s,.4*s]]); ctx.fill();
    polygon([[.45*s,0],[.98*s,-.4*s],[.98*s,.4*s]]); ctx.fill();
  }
  function lolly(s,col,k) {
    ctx.fillStyle=shade(0xf4ebd9,k); ctx.fillRect(-.045*s,.3*s,.09*s,.95*s);
    ctx.fillStyle=col; ellipse(0,0,.45*s,.45*s); ctx.fill();
    ctx.strokeStyle=rgba(theme.bg,.55); ctx.lineWidth=.09*s;
    ellipse(0,0,.26*s,.26*s); ctx.stroke();
  }

  function floating(t,u) {
    const n=Math.round(clamp((w/u)*(h/u)/1100,9,18));
    const camX=(Math.cos(t*.43)*8+Math.sin(t*.171+1.1)*5)*u;
    const camY=(Math.sin(t*.37)*4+Math.cos(t*.113+.6)*3)*u;
    const slope=Math.tan(range(rng(mixSeed(seed,1,1)),-.2,.2));
    const margin=45*u, pathLen=w+2*margin;
    const pool=[0,0,0,1,1,1,6,6,4], shades=[.25,.55,1];
    for (let layer=0; layer<3; layer++) {
      const depth=[.3,.6,1][layer], vel=[1.1,2.4,4.6][layer]*u;
      for (let i=layer; i<n; i+=3) {
        const r0=rng(mixSeed(seed,100+i,0));
        const p=r0()+vel*t/pathLen, lap=Math.floor(p), frac=p-lap;
        const r1=rng(mixSeed(seed,100+i,lap+1));
        const type=pool[Math.floor(r1()*pool.length)];
        const rr=lerp(4.5,6.5,r1())*(.45+depth*1.2)*u;
        const y0=lerp(.08,.92,r1())*h;
        const ph=range(r1,0,tau), ph2=range(r1,0,tau);
        const base=(r1()-.5)*1.3, dir=r1()<.5?1:-1;
        const bob=t*1.05+ph, xb=w+margin-frac*pathLen;
        const x=xb-camX*depth*1.6+Math.sin(bob)*1.4*u*depth;
        const y=y0+(w/2-xb)*slope-camY*depth*1.6+Math.cos(bob)*2.4*u*depth;
        const sway=.22*Math.sin(t*1.05+ph2), k=shades[layer];
        ctx.save(); ctx.translate(x,y);
        if (type===0) { ctx.rotate(sway); pumpkin(rr,k,layer>=1); }
        else if (type===1) { ctx.rotate(sway*.8); ghost(rr*.95,k,layer>=1); }
        else if (type===6) { const len=rr*4.2; ctx.rotate(base+sway*1.4); ctx.translate(-len/2,0); ribbon(len,rr*.5,rr*.32,t*2.1+ph,k); }
        else { ctx.rotate(dir*.35*t+ph); sparkle(rr*.7,k); }
        ctx.restore();
      }
    }
  }
  function candy(t,u) {
    const n=Math.round((w/u)*(h/u)/520), span=h+26*u;
    const colors=[theme.fg,theme.acc,theme.fg2];
    for (let pass=0; pass<2; pass++) for (let i=0; i<n; i++) {
      const r0=rng(mixSeed(seed,200+i,0)), near=r0()<.45;
      if (near !== (pass===1)) continue;
      const v=(near?range(r0,15,22):range(r0,8,12))*u;
      const p=r0()+v*t/span, lap=Math.floor(p), frac=p-lap;
      const r1=rng(mixSeed(seed,200+i,lap+1));
      const sz=(near?range(r1,8.5,10.5):range(r1,5.2,6.4))*u;
      const jitter=r1(), flipW=range(r1,1.5,4.2), swayW=range(r1,1,2.2);
      const ph=range(r1,0,tau), ph2=range(r1,0,tau);
      const tilt=range(r1,0,tau)*.3-.45, kind=r1();
      const ci=Math.min(2,Math.floor(r1()*3)), k=near?1:.5;
      const y=frac*span-13*u;
      const x=((i+.1+jitter*.8)/n)*(w+8*u)-4*u+Math.sin(swayW*t+ph)*2.5*u;
      const fl=Math.cos(flipW*t+ph2), col=shade(colors[ci],k);
      ctx.save(); ctx.translate(x,y); ctx.rotate(tilt+Math.sin(.9*t+ph)*.5);
      ctx.scale(Math.max(.12,Math.abs(fl)),1);
      if (kind<.34) candyCorn(sz*.8,k);
      else if (kind<.64) wrapped(sz*.7,col);
      else if (kind<.84) lolly(sz*.8,col,k);
      else { ctx.fillStyle=col; ctx.fillRect(-sz*.22,-sz*.5,sz*.44,sz); }
      ctx.restore();
    }
  }
  function runes(t,u) {
    const sc=((w/u)*(h/u))/17800;
    const layers=[
      { n:10, lo:11, hi:16, amax:.2, p0:6, p1:12, glow:0 },
      { n:22, lo:6, hi:9, amax:.55, p0:4, p1:10, glow:.5 },
      { n:36, lo:3.4, hi:5, amax:.95, p0:3, p1:7, glow:1 }
    ];
    for (let li=0; li<layers.length; li++) {
      const L=layers[li], n=Math.max(4,Math.round(L.n*sc));
      for (let i=0; i<n; i++) {
        const id=700+li*100+i, r0=rng(mixSeed(seed,id,0));
        const per=range(r0,L.p0,L.p1), off=range(r0,0,per);
        const raw=(t+off)/per, cyc=Math.floor(raw), ph=raw-cyc;
        const rp=rng(mixSeed(seed,id,cyc+1));
        const x=rp()*w, y0=rp()*h;
        const glyph=glyphs[Math.min(glyphs.length-1,Math.floor(rp()*glyphs.length))];
        const size=range(rp,L.lo,L.hi)*u;
        const cr=rp(), slot=cr<.2?2:(cr<.32?1:0);
        const color=[theme.fg,theme.fg2,theme.acc][slot];
        const a=L.amax*Math.sin(Math.PI*ph)**2*(.88+.12*Math.sin(t*12.566+i));
        if (a<.02) continue;
        const y=y0-ph*(li+1)*1.2*u;
        if (L.glow>0) {
          const rad=size*.9;
          const grad=ctx.createRadialGradient(x,y,0,x,y,rad);
          grad.addColorStop(0,rgba(color,a*.35*L.glow)); grad.addColorStop(1,rgba(color,0));
          ctx.fillStyle=grad; ellipse(x,y,rad,rad); ctx.fill();
        }
        ctx.save(); ctx.translate(x,y); ctx.rotate(.15*Math.sin(t*1.05+i));
        ctx.globalAlpha=a; ctx.fillStyle=hex(color);
        ctx.font=`${(0.85+0.2*ph)*size}px "EB Garamond Halloween", Georgia, serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(glyph,0,0);
        ctx.restore();
      }
    }
  }
  function resize() {
    const rect=card.getBoundingClientRect();
    w=Math.max(1,rect.width); h=Math.max(1,rect.height);
    dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    draw((performance.now()-started)/1000);
  }
  function draw(t) {
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle=hex(theme.bg); ctx.fillRect(0,0,w,h);
    const u=Math.min(w,h)/100;
    if (effect==='floating') floating(t,u);
    else if (effect==='candy') candy(t,u);
    else runes(t,u);
  }
  function frame(now) {
    if (visible && !document.hidden && now-lastFrame>=1000/30) {
      draw(reduceMotion?0:(now-started)/1000);
      lastFrame=now;
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(card);
  else window.addEventListener('resize',resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible=entries[0].isIntersecting; },{rootMargin:'100px'}).observe(card);
  }
  resize();
  if (document.fonts) {
    document.fonts.load('16px "EB Garamond Halloween"').then(() => {
      if (effect === 'runes') draw(reduceMotion ? 0 : (performance.now()-started)/1000);
    });
  }
  if (!reduceMotion) requestAnimationFrame(frame);
})();
