const translations = {
  en: { app: "MuseCue", aurora: "Aurora", sunset: "Before Sunset", plum: "Plum", lightning: "Violet Lightning", mountain: "Emperor’s Landing", snow: "First Snow at World's End", trails: "Star Trails", stars: "Starfield", waves: "Ocean Waves", rain: "Night Rain", celebrity: "Star Girl", hearts: "Floating Hearts", time: "The Chill of Time", custom: "Your PNG card", weibo: "Weibo", sound: "Hear MuseCue" },
  ja: { app: "小丑猫プロンプター", aurora: "オーロラ", sunset: "日没前", plum: "プラム", lightning: "紫電", mountain: "千里江山", snow: "天果ての初雪", trails: "星の軌跡", stars: "星空", waves: "海の波", rain: "夜の雨", celebrity: "女性スター", hearts: "漂うハート", time: "時の寒さ", custom: "あなたのPNGカード", weibo: "微博", sound: "MuseCueを聴く" },
  ko: { app: "MuseCue", aurora: "오로라", sunset: "해지기 전", plum: "플럼", lightning: "보라빛 번개", mountain: "천리강산", snow: "세상 끝의 첫눈", trails: "별 궤적", stars: "별빛 하늘", waves: "파도", rain: "밤비", celebrity: "스타 걸", hearts: "하트 플로트", time: "시간의 추위", custom: "나만의 PNG 카드", weibo: "웨이보", sound: "MuseCue 듣기" },
  "zh-Hans": { app: "小丑猫提词板", aurora: "极光", sunset: "日落之前", plum: "李子", lightning: "紫电", mountain: "千里江山", snow: "天涯初雪", trails: "星轨", stars: "星空", waves: "海浪", rain: "夜雨", celebrity: "女明星", hearts: "飘爱心", time: "时间之寒", custom: "自定义 PNG 卡片", weibo: "微博主页", sound: "聆听 MuseCue" },
  "zh-Hant": { app: "小丑貓提詞板", aurora: "極光", sunset: "日落之前", plum: "李子", lightning: "紫電", mountain: "千里江山", snow: "天涯初雪", trails: "星軌", stars: "星空", waves: "海浪", rain: "夜雨", celebrity: "女明星", hearts: "飄愛心", time: "時間之寒", custom: "自訂 PNG 卡片", weibo: "微博主頁", sound: "聆聽 MuseCue" }
};
function getLocale() {
  const params = new URLSearchParams(location.search);
  const requested = params.get("lang");
  let saved = null;
  try { saved = localStorage.getItem("musecue-language"); } catch (_) {}
  const route = location.pathname.match(/\/(ja|ko|zh-hans|zh-hant)\/?$/i)?.[1];
  const languages = requested ? [requested] : route ? [route] : saved ? [saved] : (navigator.languages || [navigator.language]);
  for (const raw of languages) {
    const lang = raw.toLowerCase();
    if (lang.startsWith("ja")) return "ja";
    if (lang.startsWith("ko")) return "ko";
    if (lang.startsWith("zh")) return /(?:tw|hk|mo|hant)/.test(lang) ? "zh-Hant" : "zh-Hans";
    if (lang.startsWith("en")) return "en";
  }
  return "en";
}
let locale = getLocale();
function applyLocale(nextLocale) {
  locale = translations[nextLocale] ? nextLocale : "en";
  const copy = translations[locale];
  document.documentElement.lang = locale;
  document.getElementById("language-select").value = locale;
  document.querySelectorAll("[data-theme]").forEach(el => { el.textContent = copy[el.dataset.theme]; });
  document.querySelectorAll("[data-i18n]").forEach(el => { if (el.dataset.i18n !== "custom") el.textContent = copy[el.dataset.i18n]; });
  document.querySelector(".prompter-app-card").setAttribute("aria-label", copy.app);
}
applyLocale(locale);
document.getElementById("language-select").addEventListener("change", event => {
  applyLocale(event.target.value);
  try { localStorage.setItem("musecue-language", locale); } catch (_) {}
  const route = locale === "en" ? "./" : `${locale.toLowerCase()}/`;
  window.location.assign(new URL(route, document.baseURI).href);
});

const tagline = document.getElementById("tagline-text");
const taglineText = "This Cue, made out of a wild thought, arrives for you.";
let charIndex = 0;
function typeWriter() {
  if (charIndex < taglineText.length) {
    const char = taglineText[charIndex++];
    tagline.textContent += char;
    const next = taglineText[charIndex] || "";
    const delay = char === "," ? 480 : char === "." ? 720 : char === " " ? 260 : next === " " ? 160 : 75;
    setTimeout(typeWriter, delay);
  } else {
    setTimeout(() => { tagline.textContent = ""; charIndex = 0; typeWriter(); }, 3400);
  }
}
typeWriter();
new Swiper(".swiper-container", {
  effect: "coverflow", grabCursor: true, centeredSlides: true, slidesPerView: "auto", loop: true,
  autoplay: { delay: 3600, disableOnInteraction: false },
  coverflowEffect: { rotate: 30, stretch: 0, depth: 150, modifier: 1, slideShadows: true },
  pagination: { el: ".swiper-pagination", clickable: true }
});
const audioButton = document.getElementById("resonance-button");
const audio = document.getElementById("tagline-audio");
audioButton.addEventListener("click", () => { audio.currentTime = 0; audio.play().catch(() => {}); });
const buttons = [...document.querySelectorAll(".footer-button")];
let activeButton = null;
setInterval(() => {
  if (activeButton) activeButton.classList.remove("auto-hover");
  activeButton = buttons[Math.floor(Math.random() * buttons.length)];
  activeButton.classList.add("auto-hover");
}, 1600);
/* ===== 李子静态背景 + 紫电动效 ===== */
(function initPlumLightning() {
  const canvas = document.getElementById("plumLightningCanvas");
  const card = document.getElementById("plumLightningCard");
  if (!canvas || !card) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let bolt = null;
  let branches = [];
  let strikeStart = 0;
  let nextStrike = performance.now() + 500;

  function resize() {
    const rect = card.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeBolt(startX, startY, endX, endY, segments, sway) {
    const points = [{ x: startX, y: startY }];
    for (let i = 1; i < segments; i += 1) {
      const t = i / segments;
      const envelope = Math.sin(Math.PI * t);
      points.push({
        x: startX + (endX - startX) * t + (Math.random() - 0.5) * sway * envelope,
        y: startY + (endY - startY) * t + (Math.random() - 0.5) * height * 0.025
      });
    }
    points.push({ x: endX, y: endY });
    return points;
  }

  function createStrike() {
    const fromLeft = Math.random() > 0.5;
    const startX = width * (fromLeft ? Math.random() * 0.34 : 0.66 + Math.random() * 0.34);
    const endX = width * (0.22 + Math.random() * 0.56);
    bolt = makeBolt(startX, -height * 0.04, endX, height * 1.04, 19, width * 0.35);
    branches = [];

    const branchCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < branchCount; i += 1) {
      const index = 3 + Math.floor(Math.random() * (bolt.length - 7));
      const origin = bolt[index];
      const direction = Math.random() > 0.5 ? 1 : -1;
      const branchLength = width * (0.14 + Math.random() * 0.22);
      branches.push(makeBolt(
        origin.x,
        origin.y,
        origin.x + direction * branchLength,
        origin.y + height * (0.10 + Math.random() * 0.17),
        6 + Math.floor(Math.random() * 4),
        width * 0.12
      ));
    }
    strikeStart = performance.now();
  }

  function trace(points) {
    if (!points || points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  function drawLayer(points, color, lineWidth, blur, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    trace(points);
    ctx.restore();
  }

  function strikeAlpha(elapsed) {
    if (elapsed < 55) return 0.14 * (elapsed / 55);
    if (elapsed < 120) return 0.14 + 0.86 * ((elapsed - 55) / 65);
    if (elapsed < 245) return 1;
    if (elapsed < 290) return 1 - 0.58 * ((elapsed - 245) / 45);
    if (elapsed < 335) return 0.42 + 0.50 * ((elapsed - 290) / 45);
    if (elapsed < 435) return 0.92;
    if (elapsed < 760) return 0.92 * (1 - (elapsed - 435) / 325);
    return 0;
  }

  function drawStrike(alpha) {
    if (!bolt || alpha <= 0) return;
    const sets = [bolt, ...branches];
    sets.forEach((points, index) => {
      const scale = index === 0 ? 1 : 0.62;
      drawLayer(points, "rgba(110, 33, 255, 1)", 9 * scale, 18, alpha * 0.42);
      drawLayer(points, "rgba(184, 102, 255, 1)", 4.2 * scale, 10, alpha * 0.90);
      drawLayer(points, "rgba(252, 245, 255, 1)", 1.25 * scale, 4, alpha);
    });
  }

  function animate(now) {
    ctx.clearRect(0, 0, width, height);

    if (now >= nextStrike) {
      createStrike();
      nextStrike = now + (reducedMotion ? 6000 : 2200 + Math.random() * 2000);
    }

    if (strikeStart) {
      drawStrike(strikeAlpha(now - strikeStart));
    }
    window.requestAnimationFrame(animate);
  }

  resize();
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(card);
  } else {
    window.addEventListener("resize", resize);
  }
  window.requestAnimationFrame(animate);
})();

/* Web rendition of the procedural backgrounds in PrompterProceduralBackgrounds.swift. */
(function initThemeBackgrounds() {
  const palettes = {
    mountain: { light: ['#EEF2EA','#CFE0CF','#9FC2B5','#5E9285','#2F5E57','#1F3D42','#E8DCB8','#C9A86A','#3A4A63'], dark: ['#F2ECE4','#E6D3C8','#D9B9B0','#B98F95','#8A6A82','#5C5470','#C9CFC8','#3A3550'] },
    time: { light: ['#EAF3FA','#F8FBFE','#D6E6F2','#B4CDE0','#8FB0CA','#6A8DAE','#C7D3E0','#7E93AD','#3F5673'], dark: ['#0A1424','#172A42','#25405E','#36587A','#4F7599','#86A9C8','#2A3F5C','#111D33'] },
    ocean: { light: ['#E7F7F4','#B8E4DD','#72C6C5','#358FA4','#15546E'], dark: ['#071923','#0C3140','#14556A','#23829A','#65B9C4'] }
  };
  function random(seed) { let state = seed >>> 0; return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296); }
  function fill(ctx, color, w, h) { ctx.fillStyle = color; ctx.fillRect(0, 0, w, h); }
  function drawLayers(ctx, w, h, type, dark) {
    const config = palettes[type];
    const colors = config[dark ? 'dark' : 'light'];
    const rng = random(type === 'mountain' ? 20260918 : type === 'time' ? 20260921 : 7250441);
    fill(ctx, colors[0], w, h);
    const count = type === 'ocean' ? 8 : type === 'time' ? 7 : 8;
    for (let layer = 0; layer < count; layer++) {
      const ocean = type === 'ocean';
      const base = ocean ? h * (0.25 + layer * 0.086) + h * (rng() - .5) * .025 : h / count * layer - (type === 'time' ? 52 : 35.15) * .3 + h / count * .5;
      const amp = ocean ? h * (.024 + layer * .004) * (.62 + rng() * .92) : (type === 'time' ? 52 : 35.15) * (.6 + rng() * .8);
      const freq = ocean ? .34 + rng() * .31 : .9;
      const phase = ocean ? rng() * 9 : layer * 1.3 + .918;
      const points = ocean ? 38 : type === 'time' ? 15 : 13;
      const path = new Path2D();
      path.moveTo(0, h); path.lineTo(0, base);
      let px = 0, py = base;
      for (let point = 0; point <= points; point++) {
        const x = w * point / points;
        const y = base + Math.sin(point * freq + phase) * amp * (ocean ? .82 : .5) + Math.sin(point * (ocean ? .17 : .35) + phase * 1.7) * amp * (ocean ? .46 : .6) + (rng() - .5) * amp * (ocean ? .14 : .25);
        path.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2); px = x; py = y;
      }
      path.lineTo(w, base); path.lineTo(w, h); path.closePath();
      ctx.globalAlpha = ocean ? .38 + layer * .07 : (type === 'time' ? .58 : .53) * (.6 + rng() * .5);
      ctx.fillStyle = colors[ocean ? Math.min(Math.floor(layer / 2) + 1, colors.length - 1) : Math.min((layer + Math.floor(rng() * 2.4)) % colors.length, colors.length - 1)];
      ctx.fill(path); ctx.globalAlpha = 1;
    }
  }
  function drawStars(ctx, w, h) {
    // Direct port of StarTrailProceduralBackground in the iOS project.
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#050815'); gradient.addColorStop(.5, '#101735'); gradient.addColorStop(1, '#261B45');
    fill(ctx, gradient, w, h);
    const cx = w * .12, cy = h * .76, maxRadius = Math.hypot(w, h);
    for (let index = 0; index < 18; index++) {
      const radius = maxRadius * (.10 + index * .045);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, (-76 + index % 3 * 4) * Math.PI / 180, (18 + index % 5 * 5) * Math.PI / 180, false);
      ctx.strokeStyle = index % 3 === 0 ? '#E8D8A8' : '#9FC8E8';
      ctx.globalAlpha = .18 + index % 4 * .055;
      ctx.lineWidth = index % 4 === 0 ? 1.25 : .7;
      ctx.stroke();
    }
    let seed = 8812023n;
    const next = () => {
      seed = (seed * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n);
      return Number(seed >> 11n) / 9007199254740992;
    };
    for (let index = 0; index < 72; index++) {
      const diameter = .8 + next() * 2.2;
      const x = Math.max(0, w - diameter) * next();
      const y = Math.max(0, h - diameter) * next();
      ctx.fillStyle = index % 5 === 0 ? '#F2D59B' : '#FFFFFF';
      ctx.globalAlpha = .38 + next() * .54;
      ctx.beginPath(); ctx.arc(x + diameter / 2, y + diameter / 2, diameter / 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function drawAurora(ctx, w, h) {
    // Port of PrompterBackgroundView .polarAurora in PrompterEngine.swift.
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, 'rgb(6,13,29)');
    base.addColorStop(.42, 'rgb(6,34,40)');
    base.addColorStop(1, 'rgb(22,10,41)');
    fill(ctx, base, w, h);
    const green = ctx.createLinearGradient(w * .02, h * .12, w * .82, h * .68);
    green.addColorStop(0, 'rgba(71,240,168,0)');
    green.addColorStop(.5, 'rgba(71,240,168,.46)');
    green.addColorStop(1, 'rgba(71,240,168,0)');
    fill(ctx, green, w, h);
    const violet = ctx.createLinearGradient(w * .90, h * .06, w * .28, h * .90);
    violet.addColorStop(0, 'rgba(125,87,245,0)');
    violet.addColorStop(.5, 'rgba(125,87,245,.36)');
    violet.addColorStop(1, 'rgba(125,87,245,0)');
    fill(ctx, violet, w, h);
  }
  function drawSunset(ctx, w, h) {
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, '#CD3871'); base.addColorStop(.48, '#D8535A'); base.addColorStop(1, '#EDAC56');
    fill(ctx, base, w, h);
    const radius = Math.max(w, h);
    const glow = (x, y, r, center, edge, alpha, midAlpha = 0) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, center);
      if (edge) g.addColorStop(.52, edge);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = alpha; fill(ctx, g, w, h); ctx.globalAlpha = 1;
    };
    glow(w * .03, h * .52, radius * .72, '#91386F', '#A63E6B6B', .82);
    glow(w * .42, h * -.04, radius * .62, '#F02B68', null, .46);
    glow(w * 1.02, h * .08, radius * .66, '#FF8494', null, .76);
    glow(w * .55, h * .82, radius * .72, '#EA4D32', null, .54);
    glow(w * 1.03, h * 1.04, radius * .58, '#FFBC47', null, .82);
  }
  function drawCard(canvas) {
    const card = canvas.parentElement, rect = card.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2), w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dark = matchMedia('(prefers-color-scheme: dark)').matches;
    if (card.classList.contains('theme-mountain')) drawLayers(ctx, w, h, 'mountain', dark);
    if (card.classList.contains('theme-time')) drawLayers(ctx, w, h, 'time', dark);
    if (card.classList.contains('theme-sunset')) drawSunset(ctx, w, h);
    if (card.classList.contains('theme-aurora')) drawAurora(ctx, w, h);
  }
  const canvases = [...document.querySelectorAll('.theme-canvas')];
  const redraw = () => canvases.forEach(drawCard);
  redraw();
  if ('ResizeObserver' in window) { const observer = new ResizeObserver(redraw); canvases.forEach(canvas => observer.observe(canvas.parentElement)); }
  else window.addEventListener('resize', redraw);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', redraw);
})();

/* Particle motion follows the App's SpriteKit presets, scaled for carousel cards. */
(function initCardEffects() {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvases = [...document.querySelectorAll('.particle-canvas')];
  const states = canvases.map(canvas => ({ canvas, kind: canvas.parentElement.dataset.effect, particles: [], lastSpawn: 0, width: 0, height: 0 }));
  function resize(state) {
    const rect = state.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    state.width = rect.width; state.height = rect.height;
    state.canvas.width = Math.round(rect.width * dpr); state.canvas.height = Math.round(rect.height * dpr);
    state.ctx = state.canvas.getContext('2d');
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state.kind === 'stars') {
      state.particles = [];
      const layers = [[70,1.5,.6,1.8],[35,3,.85,1.2],[15,5,1,.7]];
      const areaScale = Math.min(1, Math.max(.6, state.width * state.height / (390 * 844)));
      layers.forEach(([count,size,alpha,duration], layer) => {
        count = Math.max(3, Math.round(count * areaScale));
        for (let i = 0; i < count; i++) {
          const seed = i + layer * 100;
          state.particles.push({ x: (Math.sin(seed * 7.3) + 1) / 2 * state.width, y: (Math.cos(seed * 3.7) + 1) / 2 * state.height, size, alpha, duration, phase: i * .15 });
        }
      });
    }
  }
  states.forEach(resize);
  if ('ResizeObserver' in window) { const observer = new ResizeObserver(() => states.forEach(resize)); states.forEach(state => observer.observe(state.canvas.parentElement)); }
  else window.addEventListener('resize', () => states.forEach(resize));
  function spawn(state) {
    const w = state.width, h = state.height;
    if (state.kind === 'rain') {
      const scale = Math.min(1, w / 390);
      const speed = (520 + (Math.random() - .5) * 160) * scale;
      const life = 1.8 + (Math.random() - .5) * .8;
      state.particles.push({ x: Math.random() * w * 1.2 - w * .1, y: -16, vx: -Math.sin(.18) * speed, vy: Math.cos(.18) * speed, gravity: 200 * scale, life, max: life, alpha: .55 + (Math.random() - .5) * .3, size: 14 * scale, lineWidth: 1.2 * scale });
    }
    if (state.kind === 'snow') state.particles.push({ x: Math.random() * w * 1.3 - w * .15, y: -10, vx: (Math.random() - .5) * 18, vy: 38 + Math.random() * 40, life: 7, max: 7, size: Math.random() < .18 ? 10 : 6, phase: Math.random() * 6.28 });
    if (state.kind === 'hearts') state.particles.push({ x: w * (.1 + Math.random() * .8), y: h + 20, vx: (Math.random() - .5) * 12, vy: -(h + 80) / (4 + Math.random() * 3.5), life: 7.5, max: 7.5, size: 12 + Math.random() * 24, phase: Math.random() * 6.28 });
  }
  function heart(ctx, x, y, size) {
    ctx.beginPath(); ctx.moveTo(x, y + size * .16);
    ctx.bezierCurveTo(x + size * .46, y - size * .34, x + size * .63, y + size * .2, x, y + size * .48);
    ctx.bezierCurveTo(x - size * .63, y + size * .2, x - size * .46, y - size * .34, x, y + size * .16);
    ctx.fill();
  }
  let previous = performance.now();
  function tick(now) {
    const dt = Math.min((now - previous) / 1000, .05); previous = now;
    states.forEach(state => {
      const { ctx, width: w, height: h } = state;
      ctx.clearRect(0, 0, w, h);
      if (state.kind === 'stars') {
        state.particles.forEach(p => {
          const pulse = (Math.sin(now / 1000 * Math.PI * 2 / p.duration + p.phase) + 1) / 2;
          ctx.globalAlpha = .05 + pulse * (p.alpha - .05);
          const radius = p.size / 2;
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          glow.addColorStop(0, '#fff'); glow.addColorStop(.4, '#ffffff80'); glow.addColorStop(1, '#ffffff00');
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
        });
      } else {
        const rate = state.kind === 'rain' ? 80 * Math.min(1, w * h / (390 * 844)) : state.kind === 'snow' ? 8 : .75;
        if (!reduceMotion) { state.lastSpawn += dt * rate; while (state.lastSpawn >= 1) { spawn(state); state.lastSpawn -= 1; } }
        state.particles = state.particles.filter(p => p.life > 0 && p.y < h + 30 && p.y > -50);
        state.particles.forEach(p => {
          if (!reduceMotion) { p.life -= dt; p.y += p.vy * dt; p.x += p.vx * dt; if (p.gravity) p.vy += p.gravity * dt; }
          if (state.kind === 'rain') {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha - (p.max - p.life) * .3)); ctx.strokeStyle = '#fff'; ctx.lineWidth = p.lineWidth;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 2.5, p.y + p.size); ctx.stroke();
          } else if (state.kind === 'snow') {
            const x = p.x + Math.sin(now / 900 + p.phase) * 5;
            ctx.globalAlpha = Math.min(.75, p.life / p.max * .75);
            const glow = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.size / 2);
            glow.addColorStop(.3, '#fff'); glow.addColorStop(1, '#ffffff00'); ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(x, p.y, p.size / 2, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.globalAlpha = Math.min(.78, p.life / 1.8); ctx.fillStyle = '#ff738c';
            heart(ctx, p.x + Math.sin(now / 700 + p.phase) * 12, p.y, p.size);
          }
        });
      }
      ctx.globalAlpha = 1;
    });
    if (!reduceMotion) requestAnimationFrame(tick);
  }
  if (reduceMotion) { states.forEach(state => { for (let i = 0; i < 12; i++) { spawn(state); const p = state.particles[i]; if (p) p.y = Math.random() * state.height; } }); }
  requestAnimationFrame(tick);
})();

/* Match the original Plum + Violet Lightning shake on every theme card. */
document.querySelectorAll('.swiper-slide:not(.prompter-app-slide) > *').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  });
  card.addEventListener('animationend', event => {
    if (event.animationName === 'bangClockShake') card.classList.remove('shake');
  });
});
