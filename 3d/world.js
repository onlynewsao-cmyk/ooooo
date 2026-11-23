/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Motor 3D (Three.js)
   ========================================================= */
const T = THREE;
if (T.ColorManagement) T.ColorManagement.legacyMode = false; // cores hex em sRGB (pele correta)
const IS_MOBILE = matchMedia('(pointer:coarse)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
/* Modo Leve (telemóveis fracos): sem sombras, menos gente e carros, resolução mais baixa */
const LITE = (() => { try { const s = localStorage.getItem('pe3d_lite'); if (s != null) return s === '1'; } catch (e) { } return IS_MOBILE && ((navigator.deviceMemory || 4) <= 3 || (navigator.hardwareConcurrency || 4) <= 4); })();
/* cidade compacta: as pessoas e os carros ficam maiores face aos prédios (tudo fica mais perto) */
const BODY_S = 1.3;
let renderer, camera, clock, curScene, showZoom = 0, _shZ = 0;
let mode = 'title';          // title | select | game | death
let showScene, worldScene, showModels = [], selIndex = 0;
let player = null, playerPos = new T.Vector3(), playerYaw = 0;
let camYaw = 0.6, camPitch = 0.38, camDist = (IS_MOBILE ? 11 : 9) * BODY_S;
let uiBlocked = false, nearLoc = null, dayT = 0.32, wTime = 0;
const keys = {};
const joy = { x: 0, y: 0, active: false };
const colliders = [];
const npcs = [], vans = [], markers = {}, nightMats = [], dancers = [];
let decor = null;
let sun, hemi, seaGeo, seaBase, flagGeo, flagBase, minimapCtx, dying = 0;

/* ---------- helpers ---------- */
const _m = {};
function mat(c, o) { const k = c + (o ? JSON.stringify(o) : ''); return _m[k] || (_m[k] = new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .85, metalness: 0 }, o || {}))); }
const _g = {};
function bx(w, h, d) { const k = `b${w}_${h}_${d}`; return _g[k] || (_g[k] = new T.BoxGeometry(w, h, d)); }
function sph(r, ws = 12, hs = 10) { const k = `s${r}_${ws}_${hs}`; return _g[k] || (_g[k] = new T.SphereGeometry(r, ws, hs)); }
function cyl(rt, rb, h, s = 12) { const k = `c${rt}_${rb}_${h}_${s}`; return _g[k] || (_g[k] = new T.CylinderGeometry(rt, rb, h, s)); }
function mesh(geo, m, x = 0, y = 0, z = 0, parent, shadow = true) {
  const o = new T.Mesh(geo, m); o.position.set(x, y, z);
  if (shadow) { o.castShadow = true; o.receiveShadow = true; }
  if (parent == null) parent = decor;
  if (parent) parent.add(o); return o;
}
function ctex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); draw(x, w, h);
  const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function rrect(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
const _tx = {};
function waxTex(cols) {
  const k = cols.join(); if (_tx[k]) return _tx[k];
  return _tx[k] = ctex(128, 128, (x, w, h) => {
    x.fillStyle = cols[0]; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const cx = i * 32 + 16, cy = j * 32 + 16;
      x.fillStyle = (i + j) % 2 ? cols[1] : cols[3]; x.beginPath(); x.arc(cx, cy, 13, 0, 7); x.fill();
      x.fillStyle = cols[2]; x.beginPath(); x.arc(cx, cy, 6, 0, 7); x.fill();
      x.strokeStyle = cols[2]; x.lineWidth = 2; x.beginPath(); x.moveTo(i * 32, j * 32); x.lineTo(i * 32 + 32, j * 32 + 32); x.stroke();
      x.fillStyle = cols[3]; for (let d = 0; d < 4; d++) { x.beginPath(); x.arc(i * 32 + 4 + d * 8, j * 32 + 2, 1.6, 0, 7); x.fill(); }
    }
  }, [3, 2]);
}
function stripesTex() {
  return _tx.str || (_tx.str = ctex(64, 64, (x) => {
    const c = ['#c8102e', '#ffcb00', '#1d1d1d', '#ffcb00', '#c8102e'];
    for (let i = 0; i < 8; i++) { x.fillStyle = c[i % c.length]; x.fillRect(0, i * 8, 64, 8); }
  }));
}
function jerseyTex() {
  return _tx.jer || (_tx.jer = ctex(128, 128, (x) => {
    x.fillStyle = '#c8102e'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#111'; x.fillRect(0, 0, 128, 10); x.fillRect(0, 118, 128, 10);
    x.fillStyle = '#fff'; x.font = '900 70px system-ui,Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('7', 64, 72);
    x.font = '900 16px system-ui,Arial'; x.fillText('ANGOLA', 64, 26);
  }));
}
function textSprite(text, o = {}) {
  const W = o.w || 512, H = o.h || 128;
  const m = String(text).match(EMO_TEST), icn = m && m.index === 0 ? emoKey(m[0]) : null, label = stripEmo(text);
  const tex = ctex(W, H, (x) => {
    if (!label && icn) {
      x.fillStyle = 'rgba(14,12,18,.88)'; x.beginPath(); x.arc(W / 2, H / 2, W * .4, 0, Math.PI * 2); x.fill();
      x.strokeStyle = '#ffcb00'; x.lineWidth = W * .035; x.stroke();
      drawIc(x, icn, W / 2, H / 2, W * .46, '#ffcb00', 2.3); return;
    }
    if (o.bg !== false) { x.fillStyle = o.bg || 'rgba(10,10,12,.78)'; rrect(x, 4, 4, W - 8, H - 8, 26); x.fill(); x.strokeStyle = o.border || '#ffcb00'; x.lineWidth = 6; x.stroke(); }
    let fs = o.size || 56; x.textBaseline = 'middle'; x.fillStyle = o.fg || '#fff';
    const isz = () => icn ? fs * 1.02 : 0, gap = () => icn ? fs * .3 : 0;
    x.font = `900 ${fs}px system-ui,Segoe UI,sans-serif`;
    while (fs > 16 && isz() + gap() + x.measureText(label).width > W - 48) { fs -= 2; x.font = `900 ${fs}px system-ui,Segoe UI,sans-serif`; }
    const tw = x.measureText(label).width, sx = W / 2 - (isz() + gap() + tw) / 2;
    if (icn) drawIc(x, icn, sx + isz() / 2, H / 2 + 1, isz(), '#ffcb00', 2.4);
    x.textAlign = 'left'; x.fillText(label, sx + isz() + gap(), H / 2 + 4);
  });
  const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  const sc = o.scale || 5; s.scale.set(sc, sc * H / W, 1); return s;
}
function signPlane(text, w, bg, fg, sub) {
  const tex = ctex(1024, 200, (x) => {
    x.fillStyle = bg; x.fillRect(0, 0, 1024, 200);
    x.strokeStyle = fg; x.lineWidth = 10; x.strokeRect(10, 10, 1004, 180);
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `900 ${sub ? 78 : 92}px system-ui,Arial`; x.fillText(text, 512, sub ? 82 : 104, 960);
    if (sub) { x.font = '700 44px system-ui,Arial'; x.fillText(sub, 512, 152, 960); }
  });
  const m = new T.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: .25 });
  nightMats.push({ m, day: .25, night: 1 });
  return new T.Mesh(new T.PlaneGeometry(w, w * 200 / 1024), m);
}

/* =========================================================
   PERSONAGEM 3D
   ========================================================= */
function caps(r, l, s = 10) { const k = `p${r}_${l}_${s}`; return _g[k] || (_g[k] = new T.CapsuleGeometry(r, l, 4, s)); }
function shade(hex, f) { const c = new T.Color(hex); c.multiplyScalar(f); return '#' + c.getHexString(); }
/* Estampas das camisolas (envolvem o tronco; a frente fica no centro da textura) */
function printTex(kind) {
  const key = 'pr_' + kind; if (_tx[key]) return _tx[key];
  return _tx[key] = ctex(512, 256, (x, w, h) => {
    const C = 256;
    const txt = (s, y, size, fill, stroke, lw, maxW = 150) => { x.font = `900 ${size}px system-ui,Arial Black,Arial`; while (x.measureText(s).width > maxW && size > 8) { size--; x.font = `900 ${size}px system-ui,Arial Black,Arial`; } x.textAlign = 'center'; x.textBaseline = 'middle'; if (stroke) { x.lineJoin = 'round'; x.lineWidth = lw || 6; x.strokeStyle = stroke; x.strokeText(s, C, y); } x.fillStyle = fill; x.fillText(s, C, y); };
    const palm = (px, py, s, col) => { x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 5 * s; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 8 * s, py - 40 * s, px + 2 * s, py - 75 * s); x.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI + i * Math.PI / 5; x.beginPath(); x.ellipse(px + 2 * s + Math.cos(a) * 20 * s, py - 75 * s + Math.sin(a) * 9 * s + 6 * s, 22 * s, 5 * s, a, 0, 7); x.fill(); } };
    switch (kind) {
      case 'luanda': {
        const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f2b51e'); g.addColorStop(.55, '#d8361f'); g.addColorStop(1, '#2a1c16'); x.fillStyle = g; x.fillRect(0, 0, w, h);
        x.fillStyle = '#ffd84a'; x.beginPath(); x.arc(C, 92, 58, 0, 7); x.fill();
        x.fillStyle = '#1a1210'; [[-90, 40], [-70, 62], [-48, 30], [-30, 70], [-8, 48], [14, 80], [36, 44], [58, 64], [80, 36]].forEach(([dx, hh]) => x.fillRect(C + dx - 10, 150 - hh * .7, 20, hh * .7));
        palm(C - 70, 150, 1, '#1a1210'); palm(C + 62, 150, .85, '#1a1210');
        x.fillRect(C - 110, 148, 220, 6);
        txt('LUANDA', 180, 46, '#ffcb00', '#1a1210', 8);
        txt('MUSSEQUE', 218, 22, '#ffcb00', '#1a1210', 4, 110);
                break;
      }
      case 'candongueiro': {
        x.fillStyle = '#b9b4aa'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 600; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .05})`; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
        txt('CANDONGUEIRO', 64, 30, '#2a2a2a');
        x.fillStyle = '#f2f2f2'; rrect(x, C - 70, 92, 140, 56, 12); x.fill(); x.fillStyle = '#1f63c9'; x.fillRect(C - 70, 124, 140, 14);
        x.fillStyle = '#2a2a2a'; [-52, -20, 12].forEach(dx => x.fillRect(C + dx, 100, 26, 18)); x.fillRect(C + 44, 100, 20, 22);
        x.beginPath(); x.arc(C - 40, 150, 12, 0, 7); x.arc(C + 40, 150, 12, 0, 7); x.fill();
        txt('AQUI É SÓ MARCHA!', 194, 17, '#2a2a2a');
        break;
      }
      case 'ilha': {
        x.fillStyle = '#d9d2c0'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(80,60,30,${Math.random() * .06})`; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
        txt('ILHA DE', 52, 30, '#3b2f25');
        x.save(); x.beginPath(); x.arc(C, 118, 44, 0, 7); x.clip();
        x.fillStyle = '#f08a24'; x.fillRect(C - 50, 70, 100, 100); x.fillStyle = '#ffcf4a'; x.beginPath(); x.arc(C, 120, 22, 0, 7); x.fill();
        x.fillStyle = '#2f6fa8'; x.fillRect(C - 50, 124, 100, 40); x.fillStyle = '#e8dcc0'; for (let i = 0; i < 4; i++) x.fillRect(C - 40 + i * 6, 132 + i * 7, 80 - i * 12, 3);
        x.restore(); palm(C - 26, 160, .7, '#3b2f25');
        txt('LUANDA', 190, 34, '#3b2f25');
        break;
      }
      case 'zungueira': {
        x.fillStyle = '#1d1d1d'; x.fillRect(0, 0, w, h);
        txt('ZUNGUEIRA', 88, 34, '#f2f2f2');
        txt('POR AMOR A ANGOLA', 118, 15, '#ffcb00');
        x.fillStyle = '#e86a00'; x.beginPath(); x.arc(C + 72, 58, 26, Math.PI, 0); x.fill(); x.fillStyle = '#ffcb00'; x.beginPath(); x.arc(C + 72, 46, 12, 0, 7); x.fill();
        const cs = ['#c8102e', '#ffcb00', '#e86a00', '#f2f2f2']; for (let i = 0; i < 32; i++) { x.fillStyle = cs[i % 4]; x.fillRect(i * 16, 238, 16, 18); x.fillRect(i * 16, 0, 16, 8); }
        break;
      }
      case 'kuduro': {
        x.fillStyle = '#ffcb00'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#c8102e'; x.fillRect(0, 168, w, 88); x.fillStyle = '#1a1a1a'; x.fillRect(0, 160, w, 10); x.fillRect(0, 0, w, 12);
        txt('KUDURO', 98, 46, '#1a1a1a', '#c8102e', 5);
        x.fillStyle = '#1a1a1a'; x.save(); x.translate(C, 208); x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 11 : 26, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); x.restore();
        break;
      }
      case 'jersey': {
        x.fillStyle = '#c8102e'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#151515'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); x.lineTo(w, 64); x.lineTo(C + 120, 64); x.lineTo(C, 104); x.lineTo(C - 120, 64); x.lineTo(0, 64); x.fill();
        x.fillStyle = '#ffcb00'; x.fillRect(0, 236, w, 6); x.fillStyle = '#151515'; x.fillRect(0, 242, w, 14);
        txt('ANGOLA', 52, 34, '#ffcb00');
        txt('7', 168, 96, '#ffcb00', '#151515', 5);
        break;
      }
      case 'blouse': {
        x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, w, h);
        x.strokeStyle = '#d6d1c4'; x.lineWidth = 3; x.beginPath(); x.moveTo(C, 30); x.lineTo(C, h); x.stroke();
        x.fillStyle = '#c9c3b4'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(C + 7, 56 + i * 42, 4, 0, 7); x.fill(); }
        x.fillStyle = '#e6e1d4'; x.beginPath(); x.moveTo(C - 50, 0); x.lineTo(C, 44); x.lineTo(C + 50, 0); x.fill();
        x.fillStyle = '#6b4429'; x.beginPath(); x.moveTo(C - 26, 0); x.lineTo(C, 34); x.lineTo(C + 26, 0); x.fill();
        x.fillStyle = '#e8b923'; x.fillRect(C - 2, 20, 4, 14); x.fillRect(C - 6, 24, 12, 3);
        break;
      }
      case 'suit': {
        x.fillStyle = '#1c2a4a'; x.fillRect(0, 0, w, h);
        x.strokeStyle = 'rgba(255,255,255,.04)'; x.lineWidth = 1; for (let i = 0; i < w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
        x.fillStyle = '#0e1528'; x.beginPath(); x.moveTo(C - 36, 0); x.lineTo(C + 36, 0); x.lineTo(C + 6, 150); x.lineTo(C - 6, 150); x.fill();
        x.fillStyle = '#6a4128'; x.beginPath(); x.moveTo(C - 12, 0); x.lineTo(C, 26); x.lineTo(C + 12, 0); x.fill();
        x.strokeStyle = '#30436e'; x.lineWidth = 6; x.beginPath(); x.moveTo(C - 40, 0); x.lineTo(C - 8, 150); x.moveTo(C + 40, 0); x.lineTo(C + 8, 150); x.stroke();
        x.fillStyle = '#f4f4f4'; x.fillRect(C + 50, 66, 28, 8);
        x.fillStyle = '#0b1120'; x.beginPath(); x.arc(C, 172, 5, 0, 7); x.arc(C, 210, 5, 0, 7); x.fill();
        x.strokeStyle = '#141f38'; x.lineWidth = 3; x.beginPath(); x.moveTo(C - 80, 190); x.lineTo(C - 40, 190); x.moveTo(C + 40, 190); x.lineTo(C + 80, 190); x.stroke();
        break;
      }
      case 'bata': {
        x.fillStyle = '#f6f6f6'; x.fillRect(0, 0, w, h);
        x.strokeStyle = '#dcdcdc'; x.lineWidth = 3; x.beginPath(); x.moveTo(C, 20); x.lineTo(C, h); x.stroke();
        x.fillStyle = '#cfcfcf'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(C + 8, 50 + i * 42, 5, 0, 7); x.fill(); }
        x.strokeStyle = '#d8d8d8'; x.strokeRect(C + 40, 150, 50, 50); x.strokeRect(C - 90, 150, 50, 50);
        x.fillStyle = '#e8e8e8'; x.beginPath(); x.moveTo(C - 54, 0); x.lineTo(C, 40); x.lineTo(C + 54, 0); x.fill();
        x.fillStyle = '#1f2f50'; x.beginPath(); x.moveTo(C - 24, 0); x.lineTo(C, 26); x.lineTo(C + 24, 0); x.fill();
        break;
      }
      case 'medico': {
        x.fillStyle = '#f4f6f8'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#7fb3d5'; x.beginPath(); x.moveTo(C - 34, 0); x.lineTo(C, 70); x.lineTo(C + 34, 0); x.fill();
        x.strokeStyle = '#d5dbe0'; x.lineWidth = 5; x.beginPath(); x.moveTo(C - 44, 0); x.lineTo(C - 6, 120); x.moveTo(C + 44, 0); x.lineTo(C + 6, 120); x.stroke();
        x.strokeStyle = '#3a3f44'; x.lineWidth = 5; x.beginPath(); x.moveTo(C - 40, 0); x.quadraticCurveTo(C - 30, 90, C, 96); x.quadraticCurveTo(C + 30, 90, C + 40, 0); x.stroke();
        x.fillStyle = '#9aa3aa'; x.beginPath(); x.arc(C, 104, 9, 0, 7); x.fill();
        x.strokeStyle = '#ccd3d9'; x.lineWidth = 3; x.strokeRect(C + 40, 60, 44, 40); x.fillStyle = '#1f63c9'; x.fillRect(C + 50, 48, 4, 22); x.fillStyle = '#c8102e'; x.fillRect(C + 60, 50, 4, 20);
        x.fillStyle = '#c8102e'; x.fillRect(C - 82, 64, 30, 8); x.fillRect(C - 71, 53, 8, 30);
        break;
      }
      case 'policia': {
        x.fillStyle = '#22385f'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#1b2d4d'; x.fillRect(C - 4, 0, 8, h);
        x.strokeStyle = '#1a2a48'; x.lineWidth = 3; x.strokeRect(C - 86, 56, 52, 44); x.strokeRect(C + 34, 56, 52, 44);
        x.fillStyle = '#e8b923'; x.save(); x.translate(C - 60, 44); x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 14, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); x.restore();
        x.fillStyle = '#f2f2f2'; x.fillRect(C + 38, 40, 44, 10);
        x.fillStyle = '#ffcb00'; x.font = '900 13px system-ui,Arial'; x.textAlign = 'center'; x.fillText('POLÍCIA', C + 60, 120);
        x.fillStyle = '#c8102e'; x.fillRect(0, 0, w, 6);
        break;
      }
      default: { x.fillStyle = '#c8102e'; x.fillRect(0, 0, w, h); const c = ['#c8102e', '#ffcb00', '#1d1d1d', '#ffcb00']; for (let i = 0; i < 16; i++) { x.fillStyle = c[i % 4]; x.fillRect(0, i * 16, w, 16); } }
    }
  });
}
/* materiais "cartoon" suaves (estilo jogo mobile): toon com rampa suave */
let _toonG = null; const _cm = {}; const _wavesTex = {};
function toonGrad() {
  if (_toonG) return _toonG;
  const c = document.createElement('canvas'); c.width = 6; c.height = 1; const x = c.getContext('2d');
  [118, 150, 192, 226, 246, 255].forEach((v, i) => { x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, 0, 1, 1); });
  _toonG = new T.CanvasTexture(c); _toonG.minFilter = _toonG.magFilter = T.LinearFilter; _toonG.generateMipmaps = false; return _toonG;
}
function cmat(c, o) { const k = c + (o ? JSON.stringify(o) : ''); return _cm[k] || (_cm[k] = new T.MeshToonMaterial(Object.assign({ color: c, gradientMap: toonGrad() }, o || {}))); }
function cmapM(tex, o) { return new T.MeshToonMaterial(Object.assign({ map: tex, gradientMap: toonGrad() }, o || {})); }
/* =========================================================
   CORPO v2 — perfis torneados por género (lathe), estampas
   bem visíveis e acessórios legíveis.
   ========================================================= */
const _lg = {}, _ctm = {};
/* amostra um perfil [[r,y]...] (y crescente) de forma suave e uniforme em y */
function profSample(pts, step) {
  const out = [], y0 = pts[0][1], y1 = pts[pts.length - 1][1], n = Math.max(2, Math.round((y1 - y0) / step));
  for (let k = 0; k <= n; k++) {
    const y = y0 + (y1 - y0) * k / n; let i = 0; while (i < pts.length - 2 && pts[i + 1][1] < y) i++;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const t = Math.min(1, Math.max(0, (y - p1[1]) / ((p2[1] - p1[1]) || 1))), t2 = t * t, t3 = t2 * t;
    const r = .5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
    out.push([Math.max(0, r), y]);
  }
  return out;
}
const PROF_F = [[.07, .84], [.17, .865], [.232, .93], [.25, .99], [.236, 1.06], [.19, 1.14], [.16, 1.2], [.165, 1.27], [.182, 1.34], [.19, 1.41], [.186, 1.47], [.163, 1.52], [.11, 1.56], [.055, 1.585], [0, 1.592]];
const PROF_M = [[.07, .84], [.17, .865], [.208, .93], [.214, .99], [.208, 1.06], [.204, 1.14], [.21, 1.2], [.226, 1.27], [.246, 1.34], [.262, 1.41], [.264, 1.47], [.24, 1.52], [.18, 1.56], [.1, 1.585], [0, 1.6]];
const PROF_K = [[.07, .84], [.16, .865], [.196, .93], [.2, .99], [.198, 1.06], [.196, 1.14], [.197, 1.2], [.202, 1.27], [.21, 1.34], [.218, 1.41], [.22, 1.47], [.205, 1.52], [.155, 1.56], [.09, 1.585], [0, 1.596]];
/* perfil do tronco: género, corpo (B) e maturidade (0 criança → 1 adulto) */
function torsoProf(fem, B, mat01) {
  const A = fem ? PROF_F : PROF_M;
  return A.map(([r, y], i) => {
    let rr = PROF_K[i][0] + (r - PROF_K[i][0]) * mat01;
    const d = B - 1;
    rr *= fem ? (y < 1.12 ? 1 + d * 1.45 : y < 1.3 ? 1 + d * .6 : 1 + d * .85) : (y > 1.25 ? 1 + d * 1.15 : 1 + d * .85);
    return [rr, y];
  });
}
const _gs = (v, s) => Math.exp(-(v * v) / (2 * s * s));
/* geometria de um troço do tronco [ya, yb] com busto/peitorais/glúteos esculpidos */
function torsoGeo(fem, B, mat01, ya, yb, grow = 0) {
  const key = `t${fem ? 1 : 0}_${B.toFixed(3)}_${mat01.toFixed(2)}_${ya}_${yb}_${grow}`;
  if (_lg[key]) return _lg[key];
  const full = profSample(torsoProf(fem, B, mat01), .02);
  const rAt = y => { for (let i = 0; i < full.length - 1; i++) if (full[i + 1][1] >= y) { const t = (y - full[i][1]) / (full[i + 1][1] - full[i][1] || 1); return full[i][0] + (full[i + 1][0] - full[i][0]) * t; } return 0; };
  const pts = []; const n = Math.max(2, Math.round((yb - ya) / .02));
  for (let k = 0; k <= n; k++) { const y = ya + (yb - ya) * k / n; pts.push(new T.Vector2(rAt(y) + grow, y)); }
  const g = new T.LatheGeometry(pts, 26, -Math.PI, Math.PI * 2);
  const p = g.attributes.position, ZS = .68;
  const bust = fem ? Math.max(0, Math.min(1, (mat01 - .45) / .55)) : 0;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i); let z = p.getZ(i) * ZS;
    const r = Math.hypot(x, p.getZ(i)) || 1, fr = Math.max(0, p.getZ(i) / r), bk = Math.max(0, -p.getZ(i) / r);
    if (bust > 0) { const bx_ = .088 * B; z += .085 * B * bust * _gs(y - 1.35, .06) * Math.max(_gs(x - bx_, .062), _gs(x + bx_, .062)) * fr * fr; }
    if (fem && mat01 > .5) z -= .055 * B * _gs(y - .96, .075) * Math.max(_gs(x - .09 * B, .085), _gs(x + .09 * B, .085)) * bk;
    if (!fem && mat01 > .6) z += .022 * B * _gs(y - 1.39, .055) * Math.max(_gs(x - .1 * B, .075), _gs(x + .1 * B, .075)) * fr;
    p.setZ(i, z);
  }
  g.computeVertexNormals();
  g.userData.rAt = rAt;
  return _lg[key] = g;
}
/* frente do tronco (z) a uma dada altura — para colar botões, gravata, colares */
const _tfz = {};
function torsoFrontZ(fem, B, mat01, y) {
  const kk = `${fem ? 1 : 0}_${B}_${mat01}`; const full = _tfz[kk] || (_tfz[kk] = profSample(torsoProf(fem, B, mat01), .02));
  let r = 0; for (let i = 0; i < full.length - 1; i++) if (full[i + 1][1] >= y) { const t = (y - full[i][1]) / (full[i + 1][1] - full[i][1] || 1); r = full[i][0] + (full[i + 1][0] - full[i][0]) * t; break; }
  return r * .68;
}
/* perna torneada (coordenadas locais: anca y=0 até ao tornozelo y=-.86) */
function legGeo(fem, B, mat01, ya, yb, grow = 0, baggy = false) {
  const key = `l${fem ? 1 : 0}_${B.toFixed(3)}_${mat01.toFixed(2)}_${ya}_${yb}_${grow}_${baggy ? 1 : 0}`;
  if (_lg[key]) return _lg[key];
  const F = [[.05, -.88], [.056, -.8], [.066, -.66], [.073, -.56], [.064, -.47], [.07, -.41], [.094, -.29], [.113, -.15], [.12, -.04], [.112, .05]];
  const M = [[.055, -.88], [.062, -.8], [.074, -.66], [.08, -.56], [.073, -.47], [.08, -.41], [.094, -.29], [.104, -.15], [.108, -.04], [.1, .05]];
  const base = (fem ? F : M).map(([r, y], i) => { const rm = M[i][0]; let rr = rm + (r - rm) * mat01; rr *= 1 + (B - 1) * (y > -.45 ? (fem ? 1.25 : .9) : .55); if (baggy) rr = Math.max(rr, .112 * B); return [rr, y]; });
  const full = profSample(base, .03);
  const rAt = y => { for (let i = 0; i < full.length - 1; i++) if (full[i + 1][1] >= y) { const t = (y - full[i][1]) / (full[i + 1][1] - full[i][1] || 1); return full[i][0] + (full[i + 1][0] - full[i][0]) * t; } return full[full.length - 1][0]; };
  const pts = [], n = Math.max(2, Math.round((yb - ya) / .03));
  for (let k = 0; k <= n; k++) { const y = ya + (yb - ya) * k / n; pts.push(new T.Vector2(rAt(y) + grow, y)); }
  const g = new T.LatheGeometry(pts, 16, -Math.PI, Math.PI * 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) * .92);
  g.computeVertexNormals(); g.userData.rAt = rAt;
  return _lg[key] = g;
}
/* saia / vestido torneado */
function skirtGeo(fem, B, mat01, yTop, yHem, flare) {
  const key = `k${B.toFixed(3)}_${mat01.toFixed(2)}_${yTop}_${yHem}_${flare}`;
  if (_lg[key]) return _lg[key];
  const full = profSample(torsoProf(fem, B, mat01), .02);
  const rAt = y => { for (let i = 0; i < full.length - 1; i++) if (full[i + 1][1] >= y) { const t = (y - full[i][1]) / (full[i + 1][1] - full[i][1] || 1); return full[i][0] + (full[i + 1][0] - full[i][0]) * t; } return .2; };
  const hipR = rAt(.99) + .02, pts = [];
  const n = 14;
  for (let k = 0; k <= n; k++) {
    const y = yHem + (yTop - yHem) * k / n;
    let r = y > .99 ? rAt(y) + .012 : hipR + (flare * B) * Math.pow((.99 - y) / Math.max(.05, .99 - yHem), 1.3);
    pts.push(new T.Vector2(r, y));
  }
  const g = new T.LatheGeometry(pts, 28, -Math.PI, Math.PI * 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) * .8);
  g.computeVertexNormals();
  return _lg[key] = g;
}
/* ---------- estampas (frente no centro da textura; costas nas pontas) ---------- */
function lum(hex) { const c = new T.Color(hex); return .299 * c.r + .587 * c.g + .114 * c.b; }
function contra(hex) { return lum(hex) > .55 ? '#17171a' : '#f6f4ef'; }
function accentOf(hex) { const c = new T.Color(hex), hsl = {}; c.getHSL(hsl); return (hsl.h > .1 && hsl.h < .2 && hsl.s > .5) || lum(hex) > .8 ? '#c8102e' : '#ffcb00'; }
function drawPat(x, w, h, e, col, sc = 1) {
  const k = contra(col), ac = accentOf(col);
  x.fillStyle = col; x.fillRect(0, 0, w, h);
  switch (e) {
    case 'listras': { const s = 22 * sc; for (let y = 0; y < h; y += s * 2) { x.fillStyle = k; x.fillRect(0, y + s * .5, w, s * .55); x.fillStyle = ac; x.fillRect(0, y + s * 1.25, w, s * .18); } break; }
    case 'xadrez': { const s = 32 * sc; x.globalAlpha = .45; x.fillStyle = shade(col, .55); for (let i = 0; i < w; i += s) x.fillRect(i, 0, s * .45, h); for (let j = 0; j < h; j += s) x.fillRect(0, j, w, s * .45); x.globalAlpha = .6; x.fillStyle = k; for (let i = 0; i < w; i += s) x.fillRect(i + s * .7, 0, 2 * sc, h); for (let j = 0; j < h; j += s) x.fillRect(0, j + s * .7, w, 2 * sc); x.globalAlpha = 1; break; }
    case 'wax': {
      const s = 42 * sc, c2 = accentOf(col), c3 = k;
      for (let j = 0; j * s < h + s; j++) for (let i = 0; i * s < w + s; i++) {
        const cx = i * s + (j % 2 ? s / 2 : 0), cy = j * s;
        x.fillStyle = c2; x.beginPath(); x.arc(cx, cy, s * .36, 0, 7); x.fill();
        x.fillStyle = col; x.beginPath(); x.arc(cx, cy, s * .24, 0, 7); x.fill();
        x.fillStyle = c3; x.beginPath(); x.arc(cx, cy, s * .12, 0, 7); x.fill();
        x.strokeStyle = c3; x.lineWidth = 2.2 * sc; x.beginPath(); for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; x.moveTo(cx + Math.cos(t) * s * .4, cy + Math.sin(t) * s * .4); x.lineTo(cx + Math.cos(t) * s * .5, cy + Math.sin(t) * s * .5); } x.stroke();
      }
      break;
    }
    case 'flores': {
      const s = 46 * sc, pc = [ac, k, shade(col, 1.35 > 1 ? 1 : 1)];
      for (let j = 0; j * s < h + s; j++) for (let i = 0; i * s < w + s; i++) {
        const cx = i * s + (j % 2 ? s / 2 : 0) + ((i * 7 + j * 3) % 5) * 2, cy = j * s + ((i * 3) % 4) * 2;
        x.fillStyle = (i + j) % 2 ? pc[0] : pc[1];
        for (let a = 0; a < 5; a++) { const t = a * Math.PI * 2 / 5; x.beginPath(); x.ellipse(cx + Math.cos(t) * s * .14, cy + Math.sin(t) * s * .14, s * .12, s * .08, t, 0, 7); x.fill(); }
        x.fillStyle = (i + j) % 2 ? k : ac; x.beginPath(); x.arc(cx, cy, s * .07, 0, 7); x.fill();
        x.fillStyle = '#2e8b57'; x.beginPath(); x.ellipse(cx + s * .3, cy + s * .22, s * .1, s * .04, .6, 0, 7); x.fill();
      }
      break;
    }
    case 'animal': {
      const s = 30 * sc, d = shade(col, .45);
      for (let j = 0; j * s < h + s; j++) for (let i = 0; i * s < w + s; i++) {
        const cx = i * s + (j % 2 ? s / 2 : 0) + ((i * 13 + j * 7) % 7) - 3, cy = j * s + ((i * 5 + j) % 5) - 2;
        x.strokeStyle = '#1a120c'; x.lineWidth = 3.4 * sc; x.beginPath(); x.ellipse(cx, cy, s * .26, s * .2, (i + j) * .7, .3, 5.2); x.stroke();
        x.fillStyle = d; x.beginPath(); x.ellipse(cx, cy, s * .15, s * .11, (i + j) * .7, 0, 7); x.fill();
      }
      break;
    }
    default: { for (let i = 0; i < w * h / 90; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '0,0,0' : '255,255,255'},${Math.random() * .045})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }
  }
}
/* nome da estampa → rótulo */
const ESTAMPAS = {
  liso: 'Lisa', listras: 'Riscas', logo: 'Marca KIANDA', numero: 'Desportiva 10', wax: 'Padrão africano', xadrez: 'Xadrez', flores: 'Flores', animal: 'Padrão onça'
};
function clothTex(e, col, fem) {
  const key = `ct_${e}_${col}_${fem ? 1 : 0}`; if (_tx[key]) return _tx[key];
  const HI = !LITE && !IS_MOBILE;
  return _tx[key] = ctex(HI ? 512 : 256, HI ? 256 : 128, (x) => {
    if (!HI) x.scale(.5, .5);
    const w = 512, h = 256, C = 256, k = contra(col), ac = accentOf(col);
    drawPat(x, w, h, ['listras', 'xadrez', 'wax', 'flores', 'animal'].includes(e) ? e : 'liso', col, 1);
    const txt = (s, X, y, size, fill, stroke, maxW = 150, wt = 900) => { x.font = `${wt} ${size}px system-ui,Arial Black,Arial`; while (x.measureText(s).width > maxW && size > 8) { size--; x.font = `${wt} ${size}px system-ui,Arial Black,Arial`; } x.textAlign = 'center'; x.textBaseline = 'middle'; if (stroke) { x.lineJoin = 'round'; x.lineWidth = 6; x.strokeStyle = stroke; x.strokeText(s, X, y); } x.fillStyle = fill; x.fillText(s, X, y); };
    if (e === 'logo') {
      /* marca inventada: "KIANDA" com a onda (sereia) */
      x.strokeStyle = ac; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(C - 44, 104); x.quadraticCurveTo(C - 22, 82, C, 102); x.quadraticCurveTo(C + 22, 122, C + 44, 98); x.stroke();
      txt('KIANDA', C, 136, 40, k, null, 128);
      txt('LUANDA · EST. 2026', C, 162, 12, ac, null, 120, 800);
      txt('KIANDA', 0, 120, 30, k, null, 100); txt('KIANDA', 512, 120, 30, k, null, 100);
    } else if (e === 'numero') {
      x.fillStyle = k; x.fillRect(0, 0, w, 10); x.fillStyle = ac; x.fillRect(0, 10, w, 5);
      x.fillStyle = ac; x.fillRect(C - 120, 0, 10, h); x.fillRect(C + 110, 0, 10, h);
      txt('PALANCAS', C, 70, 24, k, null, 112);
      txt('10', C, 140, 84, k, ac === '#ffcb00' ? shade(col, .55) : '#111', 120);
      txt('10', 0, 128, 100, k, null, 130); txt('10', 512, 128, 100, k, null, 130);
    }
    /* golas, bainha e costuras: separam bem a roupa do corpo */
    x.fillStyle = shade(col, .6); x.fillRect(0, h - 12, w, 12); x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(0, h - 14, w, 2);
    x.fillStyle = shade(col, .7); x.fillRect(0, 0, w, 7);
    x.strokeStyle = 'rgba(0,0,0,.22)'; x.lineWidth = 3; x.setLineDash([6, 5]); [128, 384].forEach(X => { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, h); x.stroke(); }); x.setLineDash([]);
  });
}
function patTex(e, col) {
  const key = `pt_${e}_${col}`; if (_tx[key]) return _tx[key];
  return _tx[key] = ctex(128, 128, (x, w, h) => { drawPat(x, w, h, e, col, .5); }, [1, 1]);
}
/* calças: ganga/tecido com costuras laterais e bainha */
function pantsTex(col) {
  const key = `pa_${col}`; if (_tx[key]) return _tx[key];
  return _tx[key] = ctex(128, 128, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    const jeans = (() => { const c = new T.Color(col), s = {}; c.getHSL(s); return s.h > .55 && s.h < .7 && s.s > .2; })();
    for (let i = 0; i < (jeans ? 900 : 400); i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * (jeans ? .06 : .035)})`; x.fillRect(Math.random() * w, Math.random() * h, 1, jeans ? 3 : 2); }
    x.strokeStyle = jeans ? '#d39a3a' : shade(col, .6); x.lineWidth = 1.5; x.setLineDash([3, 3]); [31, 97].forEach(X => { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, h); x.stroke(); }); x.setLineDash([]);
    x.fillStyle = shade(col, .65); x.fillRect(0, 0, w, 5);
  });
}
/* anca das calças: braguilha, bolsos e passadeiras */
function hipsTex(col) {
  const key = `hp_${col}`; if (_tx[key]) return _tx[key];
  return _tx[key] = ctex(256, 64, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .05})`; x.fillRect(Math.random() * w, Math.random() * h, 1, 2); }
    const d = shade(col, .55); x.strokeStyle = d; x.lineWidth = 2.5;
    x.beginPath(); x.moveTo(128, 18); x.lineTo(128, 60); x.stroke();
    x.beginPath(); x.moveTo(98, 14); x.quadraticCurveTo(104, 36, 82, 40); x.moveTo(158, 14); x.quadraticCurveTo(152, 36, 174, 40); x.stroke();
    [10, 54, 202, 246].forEach(X => { x.beginPath(); x.moveTo(X - 14, 20); x.lineTo(X + 14, 20); x.lineTo(X + 12, 46); x.lineTo(X, 52); x.lineTo(X - 12, 46); x.closePath(); x.stroke(); });
  });
}
function texM(tex, k) { return _ctm[k] || (_ctm[k] = cmapM(tex)); }

function makeHuman(cfg) {
  const g = new T.Group(), P = {};
  const MUSC = Math.max(0, Math.min(1, cfg.musc || 0)), FAT = Math.max(0, Math.min(1, cfg.fat || 0));
  const B = (cfg.build || 1) * (1 + FAT * .2 + MUSC * .06), fem = !!cfg.fem;
  const age0 = cfg.age == null ? 25 : cfg.age, grown = age0 >= 13;
  const M01 = age0 >= 18 ? 1 : age0 >= 16 ? .9 : age0 >= 14 ? .7 : age0 >= 12 ? .35 : 0;
  const skin = cmat(cfg.skin);
  const skinD = cmat(shade(cfg.skin, .82));
  const kind = cfg.shirtTex === 'stripes' ? 'stripes' : cfg.shirtTex;
  const pr = cfg.print && !kind ? cfg.print : null;              /* estampa casual */
  const patSleeve = pr && ['listras', 'xadrez', 'wax', 'flores', 'animal'].includes(pr);
  const torsoM = kind ? texM(printTex(kind), 'pk' + kind) : texM(clothTex(pr || 'liso', cfg.shirt, fem), `ct${pr || 'liso'}${cfg.shirt}${fem ? 1 : 0}`);
  const sleeveM = patSleeve ? texM(patTex(pr, cfg.shirt), `pt${pr}${cfg.shirt}`) : cmat(cfg.sleeveColor || cfg.shirt);
  const solidPants = cfg.pants === cfg.skin;
  const pantsM = solidPants ? skin : texM(pantsTex(cfg.pants), 'pa' + cfg.pants);
  const hipsM = solidPants ? skin : texM(hipsTex(cfg.pants), 'hp' + cfg.pants);
  const shoeM = cfg.shoes ? cmat(cfg.shoes) : skin;
  const body = new T.Group(); g.add(body); P.body = body;
  const hipX = (fem ? .108 + .01 * M01 : .102) * B;
  const heel = fem && age0 >= 16 && cfg.shoes && !cfg.suit && !!cfg.heels;
  /* pernas */
  ['L', 'R'].forEach((s, i) => {
    const side = i ? 1 : -1;
    const leg = new T.Group(); leg.position.set(side * hipX, .92, 0); body.add(leg);
    const LG = (a, b, grow = 0, bag = false) => legGeo(fem, B, M01, a, b, grow, bag);
    if (cfg.skirt && !cfg.shorts) {
      mesh(LG(-.88, .05), skin, 0, 0, 0, leg);
    } else if (cfg.shorts) {
      mesh(LG(-.34, .05, .012), pantsM, 0, 0, 0, leg);
      mesh(cyl(LG(-.34, -.33).userData.rAt(-.34) + .016, LG(-.34, -.33).userData.rAt(-.34) + .016, .03, 14), cmat(shade(cfg.pants, .7)), 0, -.335, 0, leg, false).scale.z = .92;
      mesh(LG(-.88, -.3), skin, 0, 0, 0, leg);
    } else if (cfg.rolled) {
      mesh(LG(-.58, .05, .01), pantsM, 0, 0, 0, leg);
      mesh(cyl(.092 * B, .092 * B, .07, 12), cmat(shade(cfg.pants, .8)), 0, -.57, 0, leg);
      mesh(LG(-.88, -.55), skin, 0, 0, 0, leg);
    } else {
      mesh(LG(-.86, .05, .01, !!cfg.baggy), pantsM, 0, 0, 0, leg);
      mesh(LG(-.88, -.84), skin, 0, 0, 0, leg, false);
      if (cfg.baggy) mesh(cyl(.105 * B, .105 * B, .06, 12), cmat(shade(cfg.pants, .7)), 0, -.8, 0, leg);
    }
    if (cfg.pantsStripe) {
      const ox = side * ((cfg.shorts ? .118 : .098) * B);
      mesh(bx(.022, cfg.shorts ? .3 : .78, .08), cmat(cfg.pantsStripe[0]), ox, cfg.shorts ? -.16 : -.42, 0, leg, false);
      if (cfg.pantsStripe[1]) mesh(bx(.024, cfg.shorts ? .3 : .78, .025), cmat(cfg.pantsStripe[1]), ox, cfg.shorts ? -.16 : -.42, .045, leg, false);
    }
    if (cfg.socks) mesh(cyl(.066, .062, .16, 10), cmat(cfg.socks), 0, -.79, 0, leg);
    if (cfg.shoes) {
      const fw = heel ? .82 : 1;
      const sh = mesh(caps(heel ? .06 : .072, .15, 12), shoeM, 0, heel ? -.86 : -.85, .055, leg); sh.rotation.x = Math.PI / 2; sh.scale.set(1.35 * fw, 1, heel ? .78 : .95);
      if (heel) { sh.rotation.x = Math.PI / 2 + .22; mesh(cyl(.016, .012, .1, 6), shoeM, 0, -.92, -.04, leg, false); mesh(bx(.07, .012, .1), cmat(shade(cfg.shoes, .55)), 0, -.905, .1, leg, false); }
      else {
        const so = mesh(caps(.05, .2, 10), cmat(cfg.sole || '#f4f4f4'), 0, -.905, .05, leg, false); so.rotation.x = Math.PI / 2; so.scale.set(1.75, 1.08, .55);
        if (cfg.shoes !== '#f2f2f2') mesh(sph(.03, 8, 6), cmat('#f4f4f4'), side * .075, -.85, .03, leg, false).scale.set(.4, 1, 1.6);
        for (let k = 0; k < 3; k++) mesh(bx(.07, .008, .012), cmat(contra(cfg.shoes)), 0, -.783 - k * .007, .07 + k * .04, leg, false);
      }
    } else { const f = mesh(caps(.05, .13, 8), skin, 0, -.885, .04, leg); f.rotation.x = Math.PI / 2; f.scale.set(1.2, 1, .7); }
    P['leg' + s] = leg;
  });
  /* tronco em troços: anca (calças) · cintura · peito */
  const TG = (a, b, grow = 0) => torsoGeo(fem, B, M01, a, b, grow);
  const tuck = !!(cfg.collar || cfg.suit || cfg.dress === false);
  const hemY = cfg.crop ? 1.22 : tuck ? 1.0 : .955;
  if (!cfg.skirt) mesh(TG(.84, 1.03), hipsM, 0, 0, 0, body);
  else mesh(TG(.84, 1.03), skin, 0, 0, 0, body, false);
  if (cfg.crop) {
    mesh(TG(1.0, 1.24), skin, 0, 0, 0, body);
    mesh(new T.SphereGeometry(.011, 6, 4), skinD, 0, 1.08, torsoFrontZ(fem, B, M01, 1.08) - .004, body, false);
  }
  const shirt = mesh(TG(hemY, 1.6, .007), torsoM, 0, 0, 0, body);
  if ((!cfg.skirt || cfg.crop) && (tuck || cfg.crop || cfg.shorts)) { const bz = TG(.99, 1.0).userData.rAt(1.0) + .016; const bl = mesh(cyl(bz, bz, .045, 22), cmat(cfg.belt || (cfg.suit ? '#111' : '#2a1d14')), 0, 1.0, 0, body, false); bl.scale.z = .7; mesh(bx(.05, .04, .015), gold_(), 0, 1.0, bz * .7 + .004, body, false); }
  /* saia / vestido */
  if (cfg.skirt) {
    const yH = cfg.skirtLong ? .16 : .48, top = cfg.dress ? 1.06 : 1.09;
    const skM = cfg.dress ? torsoM : texM(waxTex(cfg.skirt), 'wx' + cfg.skirt.join());
    const sk = new T.Mesh(skirtGeo(fem, B, M01, top, yH, cfg.skirtLong ? .06 : .1), cfg.dress && pr && ['logo', 'numero'].includes(pr) ? cmat(cfg.shirt) : (cfg.dress ? (patSleeve ? texM(patTex(pr, cfg.shirt), `pt${pr}${cfg.shirt}`) : cmat(cfg.shirt)) : skM));
    sk.castShadow = true; body.add(sk);
    if (!cfg.dress) { const wr = TG(1.07, 1.08).userData.rAt(1.075) + .02; mesh(cyl(wr, wr, .05, 20), cmat(cfg.skirt[1] || cfg.skirt[0]), 0, 1.075, 0, body, false).scale.z = .74; }
    else { const wr = TG(1.13, 1.14).userData.rAt(1.135) + .014; mesh(cyl(wr, wr, .035, 20), cmat(contra(cfg.shirt)), 0, 1.135, 0, body, false).scale.z = .72; }
  }
  /* medidas de referência */
  const shR = TG(1.45, 1.46).userData.rAt(1.46);
  const fz = y => torsoFrontZ(fem, B, M01, y);
  if (cfg.collar) {
    const cm = cmat(shade(cfg.shirt, .85));
    [-1, 1].forEach(s => { const c = mesh(bx(.085, .02, .07), cm, s * .05, 1.555, .055, body, false); c.rotation.set(-.5, 0, s * .55); });
    if (!fem) for (let i = 0; i < 4; i++) { const y = 1.47 - i * .12; mesh(sph(.01, 6, 4), cmat('#f2f2f2'), 0, y, fz(y) + .022, body, false); }
  }
  /* braços */
  ['L', 'R'].forEach((s, i) => {
    const side = i ? 1 : -1;
    const arm = new T.Group(); arm.position.set(side * (shR + (fem ? .03 : .04)), 1.48, 0); body.add(arm);
    const ar = (fem ? .045 + .004 * (1 - M01) : .062) * Math.min(B, 1.15) * (1 + MUSC * (fem ? .22 : .4) + FAT * .22);
    P.ar = ar; P.far = cfg.sleeves === 'short' ? ar * .92 : ar;
    if (MUSC > .4 && grown) { const dl = mesh(sph(ar * 1.45, 12, 10), cfg.sleeves && cfg.sleeves !== 'none' ? sleeveM : skin, 0, -.04, 0, arm); dl.scale.set(1, 1.1, 1); }
    if (cfg.sleeves === 'long') { mesh(caps(ar + .012, .48), sleeveM, 0, -.29, 0, arm); mesh(cyl(ar + .016, ar + .016, .03, 10), cmat(shade(cfg.sleeveColor || cfg.shirt, .7)), 0, -.54, 0, arm, false); }
    else if (cfg.sleeves === 'short') { mesh(caps(ar + .024, .1), sleeveM, 0, -.08, 0, arm); mesh(cyl(ar + .026, ar + .026, .025, 10), cmat(shade(cfg.sleeveColor || cfg.shirt, .7)), 0, -.17, 0, arm, false); mesh(caps(ar * .92, .42), skin, 0, -.36, 0, arm); }
    else { mesh(sph(ar * 1.15, 10, 8), skin, 0, -.01, 0, arm); mesh(caps(ar, .48), skin, 0, -.3, 0, arm); }
    const hs = (fem ? .058 : .068) * (1 + MUSC * .12);
    if (cfg.hq) {
      const hand = new T.Group(); hand.position.set(0, -.6, .005); arm.add(hand); P['hand' + s] = hand;
      mesh(sph(hs, 12, 10), skin, 0, -.01, 0, hand).scale.set(.62, .95, .86);
      const nm = cfg.nails ? cmat(cfg.nails, { }) : null, fr = (fem ? .0105 : .0125) * (1 + MUSC * .15);
      [[-.032, .034], [-.011, .043], [.011, .045], [.032, .038]].forEach(([z, l], k) => {
        const f = mesh(caps(fr, l, 6), skin, 0, -.075 - l * .5, z * hs / .068, hand, false); f.rotation.x = z * .9; f.rotation.z = -side * .12;
        if (nm) mesh(bx(.006, .013, fr * 1.6), nm, side * fr * .9, -.077 - l - fr * .6, z * hs / .068, hand, false);
      });
      const th = mesh(caps(fr * 1.15, .034, 6), skin, -side * .004, -.045, hs * .78, hand, false); th.rotation.x = .75; th.rotation.z = side * .25;
      if (nm) mesh(bx(.006, fr * 1.6, .012), nm, side * .006, -.07, hs * .78 + .03, hand, false);
    } else {
      mesh(sph(hs, 14, 10), skin, 0, -.63, .005, arm).scale.set(.82, 1.1, .78);
      mesh(sph(hs * .41, 8, 6), skin, -side * hs * .66, -.6, .03, arm, false).scale.set(1, 1.4, 1);
    }
    P['arm' + s] = arm;
  });
  /* pescoço + cabeça */
  { const nk = 1 + MUSC * .3 + FAT * .25; const nm_ = mesh(fem ? cyl(.05, .062, .24, 12) : cyl(.072, .084, .22, 12), skin, 0, 1.64, 0, body); nm_.scale.set(nk, 1, nk); }
  /* peito musculado / barriga (por baixo da roupa) */
  if (grown && MUSC > .5 && !fem) [-1, 1].forEach(s => { const pc = mesh(sph(.085, 12, 8), cfg.crop ? skin : cmat(cfg.shirt), s * .078, 1.4, fz(1.4) - .045, body, false); pc.scale.set(1.1, .75, .45 + (MUSC - .5) * .5); });
  if (grown && FAT > .28) { const bl = mesh(sph(.2, 16, 12), cfg.crop ? skin : torsoM, 0, 1.12, fz(1.12) - .13 + FAT * .07, body, false); bl.scale.set(1.05 + FAT * .25, .9, .6 + FAT * .5); }
  const HS = 1.32, HY = 1.9;
  const head = new T.Group(); head.position.y = HY; head.scale.setScalar(HS); body.add(head); P.head = head;
  const headM8 = mesh(sph(.19, 32, 24), skin, 0, 0, 0, head); headM8.scale.set(fem ? .96 : 1, 1.1, 1.02);
  const jawM8 = mesh(sph(.13, 20, 14), skin, 0, -.1, .045, head, false); jawM8.scale.set(fem ? .84 : 1.1, fem ? .64 : .74, 1);
  const hairM = hairMat8(cfg.hairColor || '#111');
  const white = mat('#ffffff', { roughness: .25 }), iris = mat(cfg.eyes || '#2b170d', { roughness: .25 }), blk = mat('#0a0606', { roughness: .2 });
  const ex0 = cfg.extras || [];
  buildFace8(head, cfg, fem, skin, skinD, hairM, P, headM8, jawM8);
  const cap = (r = .2) => { const m = new T.Mesh(new T.SphereGeometry(r, 32, 20, 0, Math.PI * 2, 0, Math.PI * .56), hairM); m.scale.set(P.capSX8 ? Math.max(1, P.capSX8 * .2 / r) : 1, 1.12, 1.05); m.position.y = .03; m.rotation.x = fem ? -.53 : -.48; m.castShadow = true; head.add(m); return m; };
  let hairTall = 0;
  switch (cfg.hair) {
    case 'bald': break;
    case 'afro': { cap(.205); const a = mesh(sph(.245, 18, 14), hairM, 0, .17, -.07, head); a.scale.set(1.1, .95, 1); hairTall = .2; } break;
    case 'bun': { cap(.2); mesh(sph(.105, 14, 10), hairM, 0, .27, -.11, head); const r = new T.Mesh(new T.TorusGeometry(.07, .014, 6, 16), mat(cfg.bandColor || '#c8102e')); r.position.set(0, .23, -.09); r.rotation.x = -1.1; head.add(r); hairTall = .12; } break;
    case 'locs': cap(.207);
      for (let i = 0; i < 18; i++) {
        const a = -0.15 + i / 17 * (Math.PI + .3);
        const b = mesh(cyl(.034, .028, .5, 6), hairM, Math.cos(a) * .19, -.12, -Math.sin(a) * .17, head, false);
        b.rotation.x = -Math.sin(a) * .18; b.rotation.z = Math.cos(a) * .18;
      }
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; mesh(sph(.045, 6, 5), hairM, Math.cos(a) * .1, .2, Math.sin(a) * .1 - .02, head, false); }
      hairTall = .06; break;
    case 'short': cap(.2); break;
    case 'nago': { /* tranças nagô (cornrows): fiadas do topo da testa até à nuca */
      { const sc = cap(.196); sc.material = cmat(shade(cfg.skin, .7)); }
      for (let r = -3; r <= 3; r++) {
        const x0 = r * .046, k = Math.sqrt(Math.max(.05, 1 - Math.pow(x0 / .2, 2))), pts = [];
        for (let j = 0; j <= 10; j++) { const a = -1.0 + j / 10 * 2.85; pts.push(new T.Vector3(x0 * (1 - j * .02), .035 + .2 * 1.12 * Math.cos(a) * k, -.2 * 1.05 * Math.sin(a) * k + .02)); }
        const tb = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 22, .021, 6, false), hairM); head.add(tb);
      }
      [-1, 0, 1].forEach(k => mesh(cyl(.016, .012, .18, 5), hairM, k * .05, -.2, -.17, head, false));
    } break;
    case 'hightop': cap(.197); { const t = mesh(cyl(.2, .19, .15, 20), hairM, 0, .17, -.02, head); t.rotation.x = -.12; } hairTall = .18; break;
    case 'waves': { const c = cap(.2); if (!_wavesTex[cfg.hairColor]) _wavesTex[cfg.hairColor] = cmapM(ctex(128, 128, x => { x.fillStyle = cfg.hairColor || '#111'; x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = 3; for (let i = 0; i < 14; i++) { x.beginPath(); for (let q = 0; q <= 128; q += 8) x.lineTo(q, i * 10 + Math.sin(q / 9) * 3); x.stroke(); } })); c.material = _wavesTex[cfg.hairColor]; } break;
    case 'bantu': cap(.2); [[0, .2, .02], [-.11, .16, .05], [.11, .16, .05], [-.09, .17, -.1], [.09, .17, -.1], [0, .12, -.18], [-.15, .06, -.08], [.15, .06, -.08]].forEach(([x, y, z]) => { mesh(sph(.05, 8, 6), hairM, x, y, z, head, false); const k = mesh(new T.ConeGeometry(.032, .06, 7), hairM, x, y + .045, z, head, false); }); hairTall = .08; break;
    case 'boxbraids': cap(.207);
      for (let i = 0; i < 24; i++) {
        const a = -0.25 + i / 23 * (Math.PI + .5), L = .9;
        const b = mesh(cyl(.03, .024, L, 6), mat((cfg.braidColors || [cfg.hairColor || '#141010'])[i % (cfg.braidColors || [1]).length]), Math.cos(a) * .2, -.1 - L / 2 + .2, -Math.sin(a) * .18 - .02, head, false);
        b.rotation.x = -Math.sin(a) * .1; b.rotation.z = Math.cos(a) * .12;
        if (i % 3 === 0) mesh(cyl(.034, .034, .03, 6), gold_(), Math.cos(a) * .21, -.1 - L + .25, -Math.sin(a) * .19 - .02, head, false);
      } hairTall = .02; break;
    case 'fade': { const c = cap(.196); c.rotation.x = -.34; } break;
    case 'twists': cap(.205); for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + r * .26; const rr = r ? .08 : .15; const t = mesh(cyl(.026, .018, .1, 5), hairM, Math.cos(a) * rr, .19 + (r ? .05 : 0), Math.sin(a) * rr * 1.05, head, false); t.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); } mesh(sph(.05, 6, 5), hairM, 0, .24, 0, head, false); hairTall = .06; break;
    case 'afropuff': cap(.205); { const p = mesh(sph(.16, 14, 12), hairM, 0, .3, -.05, head); p.scale.set(1.05, .9, 1.05); } hairTall = .2; break;
    case 'band': cap(.204); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; mesh(sph(.04, 6, 5), hairM, Math.cos(a) * .12, .19, Math.sin(a) * .12, head, false); } { const b = new T.Mesh(new T.TorusGeometry(.207, .026, 6, 28), mat(cfg.bandColor || '#fff')); b.rotation.x = Math.PI / 2 - .12; b.position.set(0, .1, 0); b.scale.set(1, 1.05, 1); head.add(b); } break;
    case 'braids': cap(.207);
      for (let i = 0; i < 20; i++) {
        const a = -0.2 + i / 19 * (Math.PI + .4);
        const b = mesh(cyl(.024, .02, .66, 5), mat(cfg.braidColors[i % cfg.braidColors.length]), Math.cos(a) * .19, -.2, -Math.sin(a) * .17, head, false);
        b.rotation.x = -Math.sin(a) * .15; b.rotation.z = Math.cos(a) * .15;
        mesh(sph(.026, 5, 4), gold_(), Math.cos(a) * .2, -.52, -Math.sin(a) * .18, head, false);
      } break;
    case 'longo': {
      /* liso comprido com franja de lado — cai pelas costas até aos ombros */
      cap(.208);
      const back = new T.Mesh(new T.SphereGeometry(.214, 22, 14, Math.PI * .9, Math.PI * 1.2, 0, Math.PI * .8), cmat(cfg.hairColor || '#111', { side: T.DoubleSide })); back.position.set(0, -.07, -.02); back.scale.set(1.06, 1.42, 1.04); back.castShadow = true; head.add(back);
      for (let i = 0; i < 7; i++) { const a = Math.PI * (.12 + i * .127), t = mesh(new T.ConeGeometry(.045, .1, 6), hairM, Math.cos(a) * .15, -.33, -Math.sin(a) * .14 - .02, head, false); t.rotation.x = Math.PI; }
      [-1, 1].forEach(s => { const sd = mesh(caps(.05, .26, 8), hairM, s * .185, -.12, .05, head, false); sd.rotation.z = s * .08; sd.scale.set(.75, 1, 1.1); });
      const fr = mesh(sph(.11, 14, 10), hairM, .07, .14, .12, head, false); fr.scale.set(1.25, .5, .55); fr.rotation.z = -.35;
    } break;
    case 'rabo': {
      /* rabo-de-cavalo alto com elástico */
      cap(.205);
      const tie = new T.Mesh(new T.TorusGeometry(.04, .014, 6, 14), mat(cfg.bandColor || '#c8102e')); tie.position.set(0, .14, -.2); tie.rotation.x = .5; head.add(tie);
      const pt = new T.Group(); pt.position.set(0, .14, -.21); pt.rotation.x = .38; head.add(pt); P.pony = pt;
      mesh(caps(.06, .16, 8), hairM, 0, -.12, -.03, pt, false);
      mesh(caps(.052, .16, 8), hairM, 0, -.3, -.02, pt, false);
      const tp = mesh(new T.ConeGeometry(.05, .14, 8), hairM, 0, -.46, 0, pt, false); tp.rotation.x = Math.PI;
      [-1, 1].forEach(s => mesh(sph(.06, 10, 8), hairM, s * .16, .03, .1, head, false).scale.set(.5, .9, .8));
    } break;
    case 'cachos': {
      /* cachos compridos: volume de caracóis até aos ombros */
      cap(.21);
      for (let r = 0; r < 5; r++) for (let i = 0; i < 13; i++) {
        const a = -.25 + (i + (r % 2) * .5) / 12 * (Math.PI + .5), rr = .19 + r * .01, y = .1 - r * .095;
        if (Math.sin(a) < -.05 && r > 0) continue;
        if (r >= 3 && (a < .15 || a > Math.PI - .15)) continue;
        const k = ((i * 7 + r * 3) % 5) * .004;
        mesh(sph(.072 - r * .003 + k, 9, 7), hairM, Math.cos(a) * rr, y, -Math.sin(a) * rr * .95 - r * .006, head, false);
      }
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; mesh(sph(.065, 8, 6), hairM, Math.cos(a) * .13, .2, Math.sin(a) * .13 - .02, head, false); }
      hairTall = .08;
    } break;
    case 'wrap': {
      const wm = texM(waxTex(cfg.wrap), 'wx' + cfg.wrap.join());
      const w1 = new T.Mesh(new T.SphereGeometry(.218, 18, 10, 0, Math.PI * 2, 0, Math.PI * .6), wm); w1.scale.set(1, 1.2, 1.06); w1.rotation.x = -.4; w1.position.y = .02; head.add(w1);
      const w2 = new T.Mesh(sph(.17, 14, 10), wm); w2.position.set(0, .25, -.03); w2.scale.set(1.25, .75, 1.1); head.add(w2);
      const kn = new T.Mesh(sph(.06, 8, 6), wm); kn.position.set(.08, .3, .1); head.add(kn);
      hairTall = 1;
    } break;
    case 'cap': { cap(.2); const cm = cmat(cfg.capColor || '#111'); const c1 = new T.Mesh(new T.SphereGeometry(.218, 18, 8, 0, Math.PI * 2, 0, Math.PI * .45), cm); c1.position.y = .05; head.add(c1); mesh(bx(.22, .025, .17), cm, 0, .11, cfg.capFront ? .25 : -.26, head, false); if (cfg.capFront) { const b2 = new T.Mesh(cyl(.205, .215, .09, 18), cm); b2.position.y = .14; head.add(b2); mesh(sph(.025, 6, 4), gold_(), 0, .15, .21, head, false); } else { mesh(bx(.07, .045, .01), cmat(contra(cfg.capColor || '#111')), 0, .14, .205, head, false); } mesh(sph(.02, 6, 4), cm, 0, .26, 0, head, false); hairTall = 1; } break;
  }
  const ex = ex0;
  const gold = gold_(), silver = mat('#d0d4d8', { metalness: .8, roughness: .3 }), dark = mat('#0d0d0d', { roughness: .3 });
  if (ex.includes('chain') || ex.includes('chainSilver')) { const c = new T.Mesh(new T.TorusGeometry(.12, .012, 6, 28), ex.includes('chain') ? gold : silver); c.position.set(0, 1.5, fz(1.5) - .07); c.rotation.x = Math.PI / 2 - .7; body.add(c); mesh(bx(.035, .045, .012), ex.includes('chain') ? gold : silver, 0, 1.42, fz(1.42) + .012, body, false); }
  if (ex.includes('colar')) { const c = new T.Mesh(new T.TorusGeometry(.085, .008, 6, 26), gold); c.position.set(0, 1.56, fz(1.56) - .045); c.rotation.x = Math.PI / 2 - .6; body.add(c); const pd = mesh(new T.OctahedronGeometry(.024), mat('#2fd0c0', { metalness: .3, roughness: .15 }), 0, 1.49, fz(1.49) + .016, body, false); pd.scale.set(.8, 1.2, .5); }
  if (ex.includes('gravata') && !fem) { const tc = cmat(cfg.tieColor || (lum(cfg.shirt) > .55 ? '#c8102e' : '#ffcb00')); mesh(bx(.045, .04, .03), tc, 0, 1.53, fz(1.53) + .012, body, false); const t1 = new T.Mesh(new T.CylinderGeometry(.022, .05, .36, 4), tc); t1.position.set(0, 1.33, fz(1.33) + .035); t1.rotation.x = .1; t1.scale.z = .3; body.add(t1); }
  const gl8 = face8Glasses(head, P, ex, dark, gold);
  if (!gl8 && ex.includes('glasses')) { [-1, 1].forEach(s => { const r = new T.Mesh(new T.TorusGeometry(.048, .008, 6, 16), dark); r.position.set(s * .07, .012, .2); head.add(r); }); mesh(bx(.045, .01, .01), dark, 0, .02, .203, head, false); }
  if (!gl8 && ex.includes('sunglasses')) { const gm = mat('#16110a', { roughness: .1, metalness: .4 }); [-1, 1].forEach(s => mesh(sph(.047, 10, 8), gm, s * .07, .012, .195, head, false).scale.set(1.15, .8, .35)); mesh(bx(.19, .01, .01), gold, 0, .04, .207, head, false); }
  if (ex.includes('sunglassesHead')) { const sg = new T.Group(); sg.position.set(0, .2, .1); sg.rotation.x = -.6; head.add(sg); [-1, 1].forEach(s => mesh(bx(.1, .055, .02), mat(cfg.shadesColor || '#ff2fa0', { roughness: .2 }), s * .07, 0, 0, sg, false)); }
  if (ex.includes('earrings')) [-1, 1].forEach(s => { const e = new T.Mesh(new T.TorusGeometry(fem ? .045 : .03, fem ? .008 : .006, 6, 16), gold); e.position.set(s * .19, fem ? -.1 : -.08, .01); e.rotation.y = Math.PI / 2; head.add(e); });
  const bh8 = face8Hair(head, P, ex, cfg);
  if (!bh8 && ex.includes('stubble') && !ex.includes('beard') && !ex.includes('beardGrey')) { const sb = mesh(new T.SphereGeometry(.152, 16, 8, 0, Math.PI * 2, Math.PI * .66, Math.PI * .34), mat(cfg.beardColor || '#111', { transparent: true, opacity: .4, roughness: 1 }), 0, -.015, .035, head, false); sb.scale.set(1.12, 1.08, 1.06); }
  if (!bh8 && (ex.includes('beard') || ex.includes('beardGrey'))) { const bm = mat(ex.includes('beardGrey') ? '#9a9792' : (cfg.beardColor || '#111'), { roughness: 1 }); const b = mesh(new T.SphereGeometry(.15, 16, 8, 0, Math.PI * 2, Math.PI * .7, Math.PI * .3), bm, 0, -.02, .04, head, false); b.scale.set(1.12, 1.1, 1.05); const mu = new T.Mesh(new T.TorusGeometry(.045, .012, 5, 12, Math.PI), bm); mu.position.set(0, -.058, .182); mu.scale.set(1, .5, 1); head.add(mu); }
  if (ex.includes('mustache') && !ex.includes('beard') && !ex.includes('beardGrey')) { const mm = cmat(cfg.age >= 55 ? '#9a9792' : (cfg.beardColor || '#141010')), sf = P.surf8 || (() => .18); [-1, 1].forEach(sd => { const mu = mesh(caps(.011, .03, 8), mm, sd * .021, -.064, sf(sd * .021, -.064) - .001, head, false); mu.rotation.z = sd * (Math.PI / 2 + .28); mu.scale.set(1, 1, .55); }); }
  if (!bh8 && ex.includes('goatee')) mesh(sph(.03, 8, 6), mat('#111'), 0, -.13, .165, head, false).scale.set(1, 1.3, .7);
  if (ex.includes('chapeu') && hairTall < 1 && !ex.includes('basin')) {
    /* chapéu: aba larga (mulher) / chapéu de feltro (homem) com fita */
    const hc = cfg.hatColor || (fem ? '#e9d7b0' : '#2a2a2e'), hm = cmat(hc), y0 = .17 + hairTall * .55;
    const brim = mesh(cyl(fem ? .36 : .29, fem ? .36 : .29, .016, 26), hm, 0, y0, -.01, head, false); brim.rotation.x = -.14;
    const crown = mesh(cyl(.18, .205, fem ? .13 : .16, 22), hm, 0, y0 + (fem ? .07 : .085), -.02, head, false); crown.rotation.x = -.14;
    const bd = mesh(cyl(.207, .207, .035, 22), cmat(fem ? '#c8102e' : '#111'), 0, y0 + .03, -.015, head, false); bd.rotation.x = -.14;
    if (fem) mesh(sph(.035, 8, 6), cmat('#ffcb00'), .19, y0 + .05, .04, head, false);
  }
  if (age0 >= 45) { /* rugas da testa e marcas de expressão */
    const wm = mat(shade(cfg.skin, .7), { roughness: 1 });
    [.135, .158].forEach((y, k) => { if (k && age0 < 58) return; const w = mesh(bx(.11 - k * .02, .0045, .005), wm, 0, y, .152 - k * .012, head, false); w.rotation.x = -.62 - k * .12; });
    if (age0 >= 55) [-1, 1].forEach(s => { const l = mesh(bx(.004, .05, .004), wm, s * .05, -.075, .176, head, false); l.rotation.z = s * .35; const bg = mesh(sph(.024, 8, 6), cmat(shade(cfg.skin, .86)), s * .072, -.042, .17, head, false); bg.scale.set(1.3, .45, .5); });
  }
  if (cfg.tats && cfg.tats.length) tatApply(P, cfg, body, skin);
  if (age0 >= 75 && !ex.includes('basin')) { const cn = mesh(cyl(.016, .016, 1.0, 6), mat('#5a3a1a'), 0, -1.05, .12, P.armR, false); mesh(sph(.03, 6, 4), mat('#5a3a1a'), 0, -.56, .12, P.armR, false); P.cane = cn; }
  if (ex.includes('phone')) mesh(bx(.06, .12, .015), dark, 0, -.68, .07, P.armR, false);
  if (ex.includes('keys')) mesh(bx(.05, .07, .02), dark, 0, -.7, .06, P.armR, false);
  if (ex.includes('watch')) { mesh(cyl(.066, .066, .045, 12), dark, 0, -.53, 0, P.armL, false); mesh(cyl(.03, .03, .012, 10), mat('#9fd8ff', { roughness: .1 }), 0, -.53, .062, P.armL, false).rotation.x = Math.PI / 2; }
  if (ex.includes('watchGold')) mesh(cyl(.072, .072, .05, 12), gold, 0, -.53, 0, P.armL, false);
  if (ex.includes('pulseiras')) { [0, 1].forEach(k => { const b = new T.Mesh(new T.TorusGeometry(fem ? .056 : .066, .009, 5, 14), k ? gold : mat('#c8102e')); b.position.set(0, -.52 - k * .035, 0); b.rotation.x = Math.PI / 2; P.armR.add(b); }); }
  if (ex.includes('bolsa')) {
    /* mala de mão pendurada na mão esquerda */
    const bc = cfg.bagColor || (fem ? '#7a2a3a' : '#3a2a1c'), bm = cmat(bc);
    const bag = new T.Group(); bag.position.set(0, -.78, .07); P.armL.add(bag);
    const bb = mesh(bx(.24, .16, .085), bm, 0, -.06, 0, bag); bb.scale.set(1, 1, 1);
    mesh(bx(.25, .045, .09), cmat(shade(bc, .75)), 0, .005, .002, bag, false);
    mesh(bx(.04, .03, .01), gold, 0, -.01, .048, bag, false);
    const hd = new T.Mesh(new T.TorusGeometry(.07, .01, 5, 14, Math.PI), cmat(shade(bc, .7))); hd.position.set(0, .02, 0); bag.add(hd);
  }
  if (ex.includes('books')) { ['#1f2f50', '#c8102e', '#1a1a1a'].forEach((c, i) => mesh(bx(.24, .045, .3), mat(c), 0, -.64 + i * .047, .1, P.armL)); }
  if (ex.includes('backpack')) {
    const bm = cmat(cfg.backpackColor || '#2f5d3a'), bz = -(TG(1.29, 1.3).userData.rAt(1.3) * .68) - .1;
    mesh(caps(.13, .16, 8), bm, 0, 1.27, bz, body).scale.set(1.3, 1, .7);
    mesh(bx(.18, .1, .04), cmat(shade(cfg.backpackColor || '#2f5d3a', .75)), 0, 1.18, bz - .09, body, false);
    [-1, 1].forEach(s => { if (fem) { const st = mesh(bx(.045, .14, .03), bm, s * .11, 1.53, fz(1.53) - .01, body, false); st.rotation.x = .5; } else { const st = mesh(bx(.04, .46, .025), bm, s * .1, 1.3, fz(1.3) + .03, body, false); st.rotation.x = -.06; } });
  }
  if (ex.includes('basin')) {
    const bs = new T.Group(); bs.position.y = .44; bs.scale.setScalar(.92); head.add(bs); P.basin = bs;
    mesh(new T.CylinderGeometry(.4, .25, .16, 22), mat('#a9adb2', { metalness: .7, roughness: .35 }), 0, 0, 0, bs);
    const fr = ['#ffd21f', '#ffd21f', '#f29a1f', '#7cbf3a', '#e8461f', '#ffd21f', '#f2b01f', '#7cbf3a'];
    fr.forEach((c, i) => { const a = i / fr.length * Math.PI * 2; const f = mesh(sph(.09, 8, 6), mat(c), Math.cos(a) * .22, .12, Math.sin(a) * .22, bs); if (i % 3 === 0) f.scale.set(.6, .6, 1.9), f.rotation.y = a; });
    mesh(sph(.1, 8, 6), mat('#f29a1f'), 0, .17, 0, bs);
  }
  if (ex.includes('net')) {
    const n = new T.Mesh(new T.SphereGeometry(.32, 10, 8, 0, Math.PI, 0, Math.PI * .6), new T.MeshStandardMaterial({ color: '#b08a50', wireframe: true }));
    n.position.set(-.2, 1.35, -.05); n.rotation.set(.3, .5, .4); body.add(n);
    const st = new T.Mesh(new T.TorusGeometry(.3, .02, 5, 20), mat('#8a6a3a')); st.position.set(0, 1.25, 0); st.rotation.set(Math.PI / 2, .7, 0); st.scale.set(1, .6, 1); body.add(st);
  }
  if (ex.includes('fish')) { const f = new T.Group(); f.position.set(0, -.86, .05); P.armL.add(f); mesh(sph(.08, 10, 8), mat('#9fb4c4', { metalness: .5, roughness: .4 }), 0, 0, 0, f).scale.set(.6, 2.6, 1); const tl = mesh(new T.ConeGeometry(.08, .12, 4), mat('#7d93a3'), 0, -.25, 0, f); tl.rotation.x = Math.PI; }
  if (ex.includes('ball')) { const ball = mesh(sph(.13, 14, 10), mat('#e8701a', { roughness: .7 }), .04, -.42, .14, P.armL); const l = new T.Mesh(new T.TorusGeometry(.131, .006, 4, 20), dark); ball.add(l); const l2 = l.clone(); l2.rotation.y = Math.PI / 2; ball.add(l2); }
  const age = age0;
  const ks = age < 3 ? .42 : age < 6 ? .52 : age < 9 ? .62 : age < 12 ? .72 : age < 15 ? .84 : age < 18 ? .94 : 1;
  if (ks < 1) { const hs = HS * (1 + (1 - ks) * .7); head.scale.setScalar(hs); head.position.y = HY + (hs - HS) * .17; }
  g.scale.setScalar((cfg.height || 1) * ks);
  return { g, P, cfg, t: Math.random() * 10, emote: null, emoteT: 0, lean: age0 >= 70 ? .12 : 0 };
}
/* descrição legível da roupa e acessórios (cartão do jogador) */
const ACESS_T = { chain: 'Corrente de ouro', chainSilver: 'Corrente de prata', colar: 'Colar com pingente', gravata: 'Gravata', chapeu: 'Chapéu', watch: 'Relógio', watchGold: 'Relógio de ouro', pulseiras: 'Pulseiras', bolsa: 'Mala de mão', backpack: 'Mochila', sunglasses: 'Óculos de sol', sunglassesHead: 'Óculos na cabeça', glasses: 'Óculos', earrings: 'Brincos de argola', lipstick: 'Batom', basin: 'Bacia', books: 'Livros' };
function lookDesc(cfg) {
  if (!cfg) return '';
  const top = cfg.lookTop || (cfg.shirtTex ? 'Roupa de estilo' : 'T-shirt');
  const est = cfg.print && ESTAMPAS[cfg.print] && cfg.print !== 'liso' ? ` ${ESTAMPAS[cfg.print].toLowerCase()}` : '';
  const bot = cfg.dress ? '' : cfg.skirt ? (cfg.skirtLong ? 'Saia longa de pano' : 'Saia de pano') : cfg.shorts ? 'Calções' : 'Calças';
  const ac = (cfg.extras || []).filter(x => ACESS_T[x]).map(x => ACESS_T[x]);
  return `${top}${est}${bot ? ' · ' + bot : ''}${ac.length ? ' · ' + ac.join(', ') : ''}`;
}

/* tatuagens: desenhos em tinta (canvas) enrolados no antebraço / pescoço */
const TATS = { tribal: 'Tribal', angola: 'Estrela de Angola', rosa: 'Rosa', mae: 'Mãe ♥', leao: 'Leão', ondas: 'Ondas', kianda: 'Kianda (sereia)', relogio: 'Relógio & rosa' };
const _tatM = {};
function tatTex(id) {
  if (_tatM[id]) return _tatM[id];
  const t = ctex(256, 128, x => {
    x.clearRect(0, 0, 256, 128); const ink = 'rgba(18,14,24,.92)'; x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = 5; x.lineCap = 'round';
    const C = (cx) => {
      x.save(); x.translate(cx, 64);
      switch (id) {
        case 'tribal': for (let k = -1; k <= 1; k += 2) { x.beginPath(); x.moveTo(-30, -40 * k); x.quadraticCurveTo(0, -5 * k, 30, -40 * k); x.quadraticCurveTo(10, -18 * k, -30, -40 * k); x.fill(); } x.beginPath(); x.moveTo(-34, 0); x.lineTo(34, 0); x.stroke(); break;
        case 'angola': x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 30, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fillStyle = 'rgba(200,16,46,.9)'; x.fill(); x.stroke(); break;
        case 'rosa': x.fillStyle = 'rgba(190,20,50,.9)'; x.beginPath(); x.arc(0, -10, 20, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.arc(0, -10, 10, 0, 5); x.stroke(); x.beginPath(); x.moveTo(0, 10); x.lineTo(0, 46); x.stroke(); x.beginPath(); x.ellipse(10, 28, 10, 5, -.5, 0, 7); x.fillStyle = 'rgba(30,110,60,.9)'; x.fill(); break;
        case 'mae': x.font = 'italic 900 30px Georgia,serif'; x.textAlign = 'center'; x.fillText('Mãe', 0, 6); x.beginPath(); x.moveTo(0, 40); x.bezierCurveTo(-26, 18, -12, 4, 0, 18); x.bezierCurveTo(12, 4, 26, 18, 0, 40); x.fillStyle = 'rgba(200,16,46,.9)'; x.fill(); break;
        case 'leao': x.beginPath(); x.arc(0, 0, 30, 0, 7); x.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.beginPath(); x.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); x.lineTo(Math.cos(a) * 42, Math.sin(a) * 42); x.stroke(); } x.beginPath(); x.arc(-10, -6, 4, 0, 7); x.arc(10, -6, 4, 0, 7); x.fill(); x.beginPath(); x.moveTo(-8, 12); x.lineTo(0, 18); x.lineTo(8, 12); x.stroke(); break;
        case 'ondas': for (let r = 0; r < 3; r++) { x.beginPath(); for (let q = -40; q <= 40; q += 4) x.lineTo(q, -20 + r * 20 + Math.sin(q / 8) * 7); x.stroke(); } break;
        case 'kianda': x.beginPath(); x.arc(0, -30, 9, 0, 7); x.fill(); x.beginPath(); x.moveTo(-8, -20); x.quadraticCurveTo(-14, 10, 0, 28); x.quadraticCurveTo(14, 10, 8, -20); x.stroke(); x.beginPath(); x.moveTo(0, 28); x.lineTo(-14, 44); x.lineTo(14, 44); x.closePath(); x.fillStyle = 'rgba(20,90,140,.9)'; x.fill(); break;
        case 'relogio': x.beginPath(); x.arc(0, -8, 22, 0, 7); x.stroke(); x.beginPath(); x.moveTo(0, -8); x.lineTo(0, -24); x.moveTo(0, -8); x.lineTo(12, -4); x.stroke(); x.fillStyle = 'rgba(190,20,50,.9)'; x.beginPath(); x.arc(14, 24, 12, 0, 7); x.fill(); break;
      }
      x.restore();
    };
    C(64); if (id === 'tribal' || id === 'ondas') C(192);
  });
  return (_tatM[id] = new T.MeshToonMaterial({ map: t, transparent: true, alphaTest: .25, gradientMap: toonGrad() }));
}
function tatApply(P, cfg, body, skin) {
  (cfg.tats || []).slice(0, 4).forEach(tt => {
    const [loc, id] = String(tt).split(':'); if (!TATS[id]) return;
    if ((loc === 'bL' || loc === 'bR') && cfg.sleeves !== 'long') {
      const arm = P[loc === 'bL' ? 'armL' : 'armR']; if (!arm) return;
      const r = (P.far || .06) + .0035, m = new T.Mesh(new T.CylinderGeometry(r, r * .93, .2, 16, 1, true), tatTex(id));
      m.position.set(0, -.41, 0); m.rotation.y = loc === 'bL' ? Math.PI * .5 : -Math.PI * .5; arm.add(m);
    } else if (loc === 'pes' && P.head) {
      const m = new T.Mesh(new T.PlaneGeometry(.07, .05), tatTex(id)); m.position.set(.078, 1.63, .025); m.rotation.y = Math.PI * .42; body.add(m);
    } else if (loc === 'mao' && P.armR) {
      const m = new T.Mesh(new T.PlaneGeometry(.06, .045), tatTex(id)); m.position.set(.002, -.6, .066); m.rotation.x = -.1; P.armR.add(m);
    }
  });
}
function gold_() { return mat('#e8b923', { metalness: .8, roughness: .3 }); }
function lerpRot(o, k, v, a) { o.rotation[k] += (v - o.rotation[k]) * a; }
/* duração de cada gesto/dança (segundos) — as danças duram mais */
const EM_DANCE = ['dance', 'kuduro', 'kizomba', 'semba', 'afro'];
function emDur(t) { return EM_DANCE.includes(t) ? 6 : t === 'sit' || t === 'pushup' ? 5 : t === 'selfie' ? 3 : 2.2; }
/* expressões faciais: sobrancelhas + boca */
function faceExpr(P, e, t) {
  const B = P.brows || [], M = P.mouth, O = P.mouthO;
  let br = 0, by = 0, ms = 1, mo = false, frown = false;
  switch (e) {
    case 'happy': br = .12; ms = 1.25; break;
    case 'laugh': br = .18; by = .006; ms = 1.2; mo = Math.sin(t * 3) > -.3; break;
    case 'sad': br = -.35; frown = true; ms = .8; break;
    case 'angry': br = .45; by = -.006; frown = true; ms = .85; break;
    case 'surprise': by = .012; mo = true; ms = .7; break;
    case 'kiss': ms = .6; break;
  }
  B.forEach(b => { b.m.rotation.z = b.r + b.s * br * (e === 'angry' ? -1 : 1); b.m.position.y = b.y + by; });
  if (M) {
    M.scale.x = (P.mouthM ? 1 : 1) * ms;
    if (P.mouthM) M.rotation.z = frown ? 0 : Math.PI, M.position.y = frown ? -.1 : -.082;
    else M.scale.y = frown ? .8 : 1;
  }
  if (O) O.visible = mo;
}
function blink(h, dt) {
  const L = h.P.lids; if (!L || !L.length) return;
  h.bk = (h.bk == null ? 1 + Math.random() * 3 : h.bk) - dt;
  const on = h.bk < 0 && h.bk > -.12;
  if (h.bk <= -.12) h.bk = 2.2 + Math.random() * 3.5;
  if (L[0].visible !== on) L.forEach(l => l.visible = on);
}
function animHuman(h, dt, moving, run) {
  const P = h.P; const a = Math.min(1, dt * 10);
  h.t += dt * (moving ? (run ? 13 : 9) : 2.5);
  blink(h, dt);
  if (h.emoteT > 0) {
    h.emoteT -= dt; h.emAge = (h.emAge || 0) + dt;
    const t = h.emAge * 8; P.body.position.y = 0; P.body.rotation.z = 0; P.body.rotation.x = 0;
    P.armL.rotation.y = P.armR.rotation.y = 0;
    let fe = null;
    switch (h.emote) {
      case 'cheer': P.armL.rotation.z = 2.6 + Math.sin(t) * .3; P.armR.rotation.z = -2.6 - Math.sin(t) * .3; P.armL.rotation.x = P.armR.rotation.x = 0; P.body.position.y = Math.abs(Math.sin(t * .8)) * .25; fe = 'laugh'; break;
      case 'dance': danceAnim(h, t); fe = 'happy'; break;
      case 'kuduro': kuduroAnim(h, t); fe = 'laugh'; break;
      case 'kizomba': kizombaAnim(h, t); fe = 'happy'; break;
      case 'semba': sembaAnim(h, t); fe = 'happy'; break;
      case 'afro': afroAnim(h, t); fe = 'happy'; break;
      case 'sad': P.head.rotation.x = .5; P.armL.rotation.z = P.armR.rotation.z = 0; P.armL.rotation.x = P.armR.rotation.x = 0; P.body.rotation.x = .12; fe = 'sad'; break;
      case 'pray': P.armL.rotation.x = P.armR.rotation.x = -1.3; P.armL.rotation.z = -.35; P.armR.rotation.z = .35; P.head.rotation.x = .35; break;
      case 'train': { const s = Math.sin(t * 1.2); P.legL.rotation.x = P.legR.rotation.x = -Math.max(0, s) * 1.1; P.body.position.y = -Math.max(0, s) * .25; P.armL.rotation.x = P.armR.rotation.x = -1.5; fe = 'angry'; break; }
      case 'think': P.armR.rotation.x = -2.4; P.armR.rotation.z = .4; P.head.rotation.z = .15; break;
      case 'love': P.body.position.y = Math.abs(Math.sin(t)) * .3; P.armL.rotation.x = P.armR.rotation.x = -1.6; P.armL.rotation.z = -.5; P.armR.rotation.z = .5; fe = 'happy'; break;
      case 'wave': P.armR.rotation.x = 0; P.armR.rotation.z = -2.5 + Math.sin(t * 1.6) * .35; lerpRot(P.armL, 'z', -.08, a); P.head.rotation.z = -.08; fe = 'happy'; break;
      case 'clap': { const c = Math.abs(Math.sin(t * 1.5)); P.armL.rotation.x = P.armR.rotation.x = -1.3; P.armL.rotation.z = -.25 - c * .35; P.armR.rotation.z = .25 + c * .35; fe = 'happy'; break; }
      case 'laugh': P.body.rotation.x = -.12 + Math.sin(t * 2) * .05; P.head.rotation.x = -.25; P.armL.rotation.x = P.armR.rotation.x = -.6; P.armL.rotation.z = -.4; P.armR.rotation.z = .4; P.body.position.y = Math.abs(Math.sin(t * 2)) * .04; fe = 'laugh'; break;
      case 'angry': P.armL.rotation.z = -.5; P.armR.rotation.z = .5; P.armL.rotation.x = P.armR.rotation.x = -.3; P.body.rotation.x = .08; P.head.rotation.x = .1; P.body.position.y = Math.sin(t * 2) > .7 ? .05 : 0; fe = 'angry'; break;
      case 'shrug': { const k = Math.min(1, h.emAge * 4); P.armL.rotation.z = -.7 * k; P.armR.rotation.z = .7 * k; P.armL.rotation.x = P.armR.rotation.x = -.9 * k; P.head.rotation.z = .18 * k; P.body.position.y = .03 * k; fe = 'surprise'; break; }
      case 'facepalm': P.armR.rotation.x = -2.5; P.armR.rotation.z = -.35; P.head.rotation.x = .35; fe = 'sad'; break;
      case 'point': P.armR.rotation.x = -1.55; P.armR.rotation.z = .1; P.head.rotation.x = 0; fe = 'surprise'; break;
      case 'bow': P.body.rotation.x = Math.min(.6, h.emAge * 2) * (h.emoteT > .5 ? 1 : h.emoteT * 2); P.armL.rotation.x = P.armR.rotation.x = 0; break;
      case 'kiss': P.armR.rotation.x = -2.3 + (h.emAge > 1 ? Math.min(1, (h.emAge - 1) * 3) * .9 : 0); P.armR.rotation.z = .3; fe = 'kiss'; break;
      case 'yes': P.head.rotation.x = Math.sin(t * 1.6) * .25; P.armR.rotation.x = -1.4; P.armR.rotation.z = .1; fe = 'happy'; break;
      case 'no': P.head.rotation.y = Math.sin(t * 1.6) * .4; P.armR.rotation.x = -1.4; P.armR.rotation.z = .1; fe = 'angry'; break;
      case 'pushup': { const s = (Math.sin(t * .8) + 1) / 2; P.body.rotation.x = 1.45; P.body.position.y = .32 + s * .18; P.armL.rotation.x = P.armR.rotation.x = -1.55; P.legL.rotation.x = P.legR.rotation.x = 0; fe = 'angry'; break; }
      case 'sit': P.legL.rotation.x = P.legR.rotation.x = -1.5; P.body.position.y = -.5; P.armL.rotation.x = P.armR.rotation.x = -.5; P.body.rotation.x = -.05; break;
      case 'selfie': P.armR.rotation.x = -1.9; P.armR.rotation.z = -.55; P.armL.rotation.z = -.5; P.head.rotation.y = -.25; P.head.rotation.z = .12; fe = 'happy'; break;
    }
    faceExpr(P, fe, t);
    if (h.emoteT <= 0) { h.emote = null; h.emAge = 0; P.head.rotation.set(0, 0, 0); P.body.rotation.set(h.lean || 0, 0, 0); P.body.position.y = 0; faceExpr(P, null, 0); }
    return;
  }
  if (moving) {
    /* andar natural: balanço da anca, ombros contrários, inclinação ao correr */
    const s = Math.sin(h.t) * (run ? .95 : .6), c = Math.cos(h.t);
    P.legL.rotation.x = s; P.legR.rotation.x = -s; P.armL.rotation.x = -s * (run ? 1.1 : .8); P.armR.rotation.x = s * (run ? 1.1 : .8);
    lerpRot(P.armL, 'z', run ? -.22 : -.06, a); lerpRot(P.armR, 'z', run ? .22 : .06, a);
    P.body.position.y = Math.abs(c) * (run ? .09 : .045);
    P.body.rotation.y = s * (run ? .12 : .08);
    P.body.rotation.z = Math.sin(h.t) * (run ? .025 : .035);
    lerpRot(P.body, 'x', (run ? .16 : .03) + (h.lean || 0), a);
    P.head.rotation.y = -s * (run ? .08 : .05); lerpRot(P.head, 'x', run ? -.1 : 0, a);
  } else if (h.idleDance) danceAnim(h, h.t * 1.4);
  else {
    /* parado: respiração, peso a passar de uma perna para a outra, olhar à volta */
    ['legL', 'legR'].forEach(k => lerpRot(P[k], 'x', 0, a));
    const br = Math.sin(h.t * .9);
    lerpRot(P.armL, 'x', br * .03, a); lerpRot(P.armR, 'x', -br * .03, a);
    lerpRot(P.armL, 'z', -.09 - br * .025, a); lerpRot(P.armR, 'z', .09 + br * .025, a);
    lerpRot(P.body, 'y', 0, a); lerpRot(P.body, 'x', h.lean || 0, a);
    P.body.rotation.z = Math.sin(h.t * .23) * .018;
    P.body.position.y = br * .008;
    P.body.scale.z = 1 + br * .012;
    const look = Math.sin(h.t * .17) * Math.sin(h.t * .41);
    P.head.rotation.y = look * .35; P.head.rotation.x = Math.sin(h.t * .3) * .04;
  }
}
function danceAnim(h, t) {
  const P = h.P;
  P.body.position.y = Math.abs(Math.sin(t * 2)) * .12;
  P.body.rotation.y = Math.sin(t) * .5;
  P.armL.rotation.z = 1.2 + Math.sin(t * 2) * .9; P.armR.rotation.z = -1.2 + Math.sin(t * 2 + 1) * .9;
  P.armL.rotation.x = Math.sin(t * 2) * .5; P.armR.rotation.x = -Math.sin(t * 2) * .5;
  P.legL.rotation.x = Math.max(0, Math.sin(t * 2)) * -.7; P.legR.rotation.x = Math.max(0, -Math.sin(t * 2)) * -.7;
}
/* kuduro: pernas "partidas", saltos rápidos e braços em ângulo */
function kuduroAnim(h, t) {
  const P = h.P, b = t * 1.6, ph = Math.floor(b / Math.PI) % 4;
  P.body.position.y = Math.abs(Math.sin(b * 2)) * .16 - .04;
  P.body.rotation.x = .12; P.body.rotation.y = [.5, -.5, .2, -.2][ph]; P.body.rotation.z = Math.sin(b) * .1;
  P.legL.rotation.x = -Math.max(0, Math.sin(b * 2)) * 1.1; P.legR.rotation.x = -Math.max(0, -Math.sin(b * 2)) * 1.1;
  P.legL.rotation.z = -.25 - Math.abs(Math.sin(b)) * .2; P.legR.rotation.z = .25 + Math.abs(Math.cos(b)) * .2;
  P.armL.rotation.x = -1.4 + Math.sin(b * 2) * .6; P.armR.rotation.x = -1.4 - Math.sin(b * 2) * .6;
  P.armL.rotation.z = .9 + Math.sin(b * 4) * .3; P.armR.rotation.z = -.9 - Math.sin(b * 4) * .3;
  P.head.rotation.x = Math.sin(b * 4) * .12;
}
/* kizomba: passos curtos, anca a rodar devagar, braços em posição de par */
function kizombaAnim(h, t) {
  const P = h.P, b = t * .55;
  P.body.position.y = -.04 + Math.abs(Math.sin(b * 2)) * .025;
  P.body.rotation.y = Math.sin(b) * .25; P.body.rotation.z = Math.sin(b * 2) * .06;
  P.legL.rotation.x = Math.sin(b * 2) * .28; P.legR.rotation.x = -Math.sin(b * 2) * .28;
  P.legL.rotation.z = P.legR.rotation.z = 0;
  P.armL.rotation.x = -1.2; P.armL.rotation.z = -.9; P.armR.rotation.x = -1.0; P.armR.rotation.z = .55;
  P.head.rotation.y = -Math.sin(b) * .15; P.head.rotation.z = .1;
}
/* semba: passos largos, rodopios e mãos no ar */
function sembaAnim(h, t) {
  const P = h.P, b = t * .9;
  P.body.position.y = Math.abs(Math.sin(b * 2)) * .08;
  P.body.rotation.y = Math.sin(b * .5) * 1.4; P.body.rotation.z = Math.sin(b * 2) * .05;
  P.legL.rotation.x = Math.sin(b * 2) * .5; P.legR.rotation.x = -Math.sin(b * 2) * .5;
  P.armL.rotation.z = 1.6 + Math.sin(b * 2) * .3; P.armR.rotation.z = -.4 - Math.sin(b * 2) * .2; P.armL.rotation.x = 0; P.armR.rotation.x = -.6;
}
/* afro-house: bounce no peito, passos ao lado e braços soltos */
function afroAnim(h, t) {
  const P = h.P, b = t * 1.1;
  P.body.position.y = -.05 + Math.abs(Math.sin(b * 2)) * .06;
  P.body.rotation.x = .1 + Math.sin(b * 4) * .06; P.body.rotation.y = Math.sin(b) * .3;
  P.legL.rotation.z = -Math.max(0, Math.sin(b)) * .4; P.legR.rotation.z = Math.max(0, -Math.sin(b)) * .4;
  P.legL.rotation.x = P.legR.rotation.x = -.15;
  P.armL.rotation.x = -.8 + Math.sin(b * 2) * .5; P.armR.rotation.x = -.8 - Math.sin(b * 2) * .5;
  P.armL.rotation.z = -.4; P.armR.rotation.z = .4;
  P.head.rotation.x = Math.sin(b * 4) * .1;
}
/* repõe rotações laterais das pernas depois de danças */
(function () { const _a = animHuman; animHuman = function (h, dt, moving, run) { const P = h.P; if (!(h.emoteT > 0 && ['kuduro', 'afro', 'kizomba'].includes(h.emote))) { if (P.legL.rotation.z) P.legL.rotation.z *= .8; if (P.legR.rotation.z) P.legR.rotation.z *= .8; } if (P.body.scale.z !== 1 && moving) P.body.scale.z = 1; return _a(h, dt, moving, run); }; })();

/* =========================================================
   INIT
   ========================================================= */
function init3D() {
  renderer = new T.WebGLRenderer({ antialias: !IS_MOBILE && !LITE, powerPreference: LITE ? 'low-power' : 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, LITE ? 1 : IS_MOBILE ? 1.25 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !LITE; renderer.shadowMap.type = T.PCFSoftShadowMap;
  document.getElementById('stage').appendChild(renderer.domElement);
  camera = new T.PerspectiveCamera(55, innerWidth / innerHeight, .1, 900);
  clock = new T.Clock();
  buildShowroom();
  curScene = showScene;
  const fit = () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < .8 ? 68 : 55; if (camera.view && camera.view.enabled) camera.clearViewOffset(); camera.updateProjectionMatrix(); if (typeof mode !== 'undefined' && mode === 'title' && showModels.length) layoutTitle(); };
  addEventListener('resize', fit); fit();
  setupInput();
  loop();
}

/* ---------- Showroom (título / seleção) ---------- */
let pedestal, showSpinY = 0, showDrag = null;
function buildShowroom() {
  showScene = new T.Scene();
  showScene.background = new T.Color('#0a0a0c');
  showScene.fog = new T.Fog('#0a0a0c', 14, 34);
  showScene.add(new T.HemisphereLight('#c9d2ff', '#2a160c', .7));
  const fill = new T.DirectionalLight('#fff6ea', .75); fill.position.set(-1.5, 2.2, 8); showScene.add(fill);
  const key = new T.DirectionalLight('#fff3e0', 1.2); key.position.set(3, 8, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); key.shadow.camera.updateProjectionMatrix(); showScene.add(key);
  const red = new T.PointLight('#ff1a3c', 3, 18); red.position.set(-5, 3, -3); showScene.add(red);
  const yel = new T.PointLight('#ffcb00', 2.6, 18); yel.position.set(5, 3, -3); showScene.add(yel);
  const floorTex = ctex(512, 512, (x) => { const g = x.createRadialGradient(256, 256, 20, 256, 256, 256); g.addColorStop(0, '#2a2a30'); g.addColorStop(1, '#0a0a0c'); x.fillStyle = g; x.fillRect(0, 0, 512, 512); });
  const floor = new T.Mesh(new T.CircleGeometry(30, 48), new T.MeshStandardMaterial({ map: floorTex, roughness: .6 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; showScene.add(floor);
  pedestal = new T.Group(); showScene.add(pedestal);
  mesh(cyl(1.15, 1.25, .25, 40), mat('#1d1d22', { metalness: .6, roughness: .35 }), 0, .125, 0, pedestal);
  const ring = new T.Mesh(new T.TorusGeometry(1.2, .035, 8, 60), new T.MeshStandardMaterial({ color: '#ffcb00', emissive: '#ffcb00', emissiveIntensity: 2 })); ring.rotation.x = Math.PI / 2; ring.position.y = .26; pedestal.add(ring);
  showScene.add(titleBackdrop());
  showModels = Array.from({ length: 7 }, (_, i) => {
    const h = makeHuman(citizenCfg(i % 2 ? 'F' : 'M', i)); h.idleDance = i === 3; showScene.add(h.g); return h;
  });
  layoutTitle();
}
/* cenário do ecrã de entrada: pôr-do-sol na baía de Luanda (canvas, sem ficheiros externos) */
function titleBackdrop() {
  const W = 2048, H = 512, hz = 392;
  const tex = ctex(W, H, (x) => {
    const g = x.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#0a0a0c'); g.addColorStop(.32, '#1c0c1e'); g.addColorStop(.62, '#6a1626'); g.addColorStop(.86, '#d2471f'); g.addColorStop(1, '#ffb347');
    x.fillStyle = g; x.fillRect(0, 0, W, hz);
    const sg = x.createRadialGradient(1240, hz, 10, 1240, hz, 420); sg.addColorStop(0, 'rgba(255,226,140,.95)'); sg.addColorStop(.18, 'rgba(255,170,60,.55)'); sg.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = sg; x.fillRect(0, 0, W, hz);
    x.fillStyle = '#ffd98a'; x.beginPath(); x.arc(1240, hz, 74, Math.PI, 0); x.fill();
    for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .6})`; x.fillRect(Math.random() * W, Math.random() * 140, 2, 2); }
    /* água da baía */
    const wg = x.createLinearGradient(0, hz, 0, H); wg.addColorStop(0, '#5a1e22'); wg.addColorStop(.35, '#22101a'); wg.addColorStop(1, '#0a0a0c'); x.fillStyle = wg; x.fillRect(0, hz, W, H - hz);
    for (let i = 0; i < 70; i++) { const y = hz + 4 + Math.random() * 90, w = 30 + Math.random() * 160; x.fillStyle = `rgba(255,200,110,${.08 + Math.random() * .25})`; x.fillRect(1240 - w / 2 + (Math.random() - .5) * 220, y, w, 2); }
    /* skyline da Marginal */
    const sil = '#120a10';
    let X = 40; const tw = [];
    while (X < W - 40) { const w = 26 + Math.random() * 46, h = 30 + Math.pow(Math.random(), 1.6) * (X > 700 && X < 1700 ? 210 : 120); tw.push([X, w, h]); X += w + 2 + Math.random() * 10; }
    tw.forEach(([X, w, h]) => {
      x.fillStyle = sil; x.fillRect(X, hz - h, w, h);
      if (h > 150 && Math.random() < .5) { x.fillRect(X + w / 2 - 1.5, hz - h - 26, 3, 26); x.fillStyle = '#ff3040'; x.fillRect(X + w / 2 - 2, hz - h - 28, 4, 4); x.fillStyle = sil; }
      for (let yy = hz - h + 8; yy < hz - 6; yy += 9) for (let xx = X + 5; xx < X + w - 5; xx += 8) if (Math.random() < .28) { x.fillStyle = Math.random() < .7 ? 'rgba(255,205,120,.85)' : 'rgba(190,220,255,.7)'; x.fillRect(xx, yy, 3, 4); }
    });
    /* Mausoléu (agulha) */
    x.fillStyle = sil; x.beginPath(); x.moveTo(520, hz); x.lineTo(536, hz - 60); x.lineTo(546, hz - 250); x.lineTo(552, hz - 300); x.lineTo(558, hz - 250); x.lineTo(568, hz - 60); x.lineTo(584, hz); x.fill();
    x.fillRect(500, hz - 34, 104, 34);
    /* palmeiras da Marginal */
    const palmS = (px, s) => { x.strokeStyle = sil; x.fillStyle = sil; x.lineWidth = 5 * s; x.beginPath(); x.moveTo(px, hz + 4); x.quadraticCurveTo(px + 10 * s, hz - 60 * s, px + 4 * s, hz - 110 * s); x.stroke(); for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6; x.beginPath(); x.ellipse(px + 4 * s + Math.cos(a) * 30 * s, hz - 110 * s + Math.sin(a) * 12 * s + 10 * s, 34 * s, 7 * s, a, 0, 7); x.fill(); } };
    [120, 300, 860, 1020, 1480, 1660, 1880].forEach((px, i) => palmS(px, .9 + (i % 3) * .18));
    /* candeeiros da Marginal */
    for (let i = 0; i < 60; i++) { const px = 20 + i * 34; x.fillStyle = 'rgba(255,214,140,.95)'; x.fillRect(px, hz - 3, 3, 3); x.fillStyle = 'rgba(255,214,140,.18)'; x.fillRect(px - 1, hz + 4, 5, 26); }
    x.fillStyle = '#0d080c'; x.fillRect(0, hz - 1, W, 3);
  });
  const m = new T.MeshBasicMaterial({ map: tex, fog: false, toneMapped: false });
  const pl = new T.Mesh(new T.PlaneGeometry(78, 19.5), m); pl.position.set(0, 7.6, -19); pl.userData.backdrop = 1;
  return pl;
}
function layoutTitle() {
  pedestal.visible = false; if (previewModel) previewModel.g.visible = false;
  const wide = innerWidth > 900 && innerWidth / innerHeight > 1.15;
  showModels.forEach((h, i) => {
    const a = (i - (showModels.length - 1) / 2) * (wide ? .17 : .29);
    h.g.visible = true; h.g.position.set(Math.sin(a) * 7, 0, -Math.cos(a) * 7 + 5); h.g.rotation.y = -a * .9;
  });
}
let previewModel = null;
/* Retrato 3D do avatar (renderer próprio, pequeno) */
let shotR = null, shotScene = null, shotCam = null; const shotCache = {};
function avatarShot(cfg, bg, realAge, size = 160, full = false) {
  const key = JSON.stringify(cfg) + (bg || '') + (realAge ? 1 : 0) + size + (full ? 'f' + full : ''); if (shotCache[key]) return shotCache[key];
  try {
    if (!shotR) {
      shotR = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); shotR.setSize(160, 160); shotR.setPixelRatio(1);
      shotR.outputEncoding = T.sRGBEncoding;
      shotScene = new T.Scene(); shotScene.add(new T.HemisphereLight('#dfe6ff', '#3a2414', .9));
      const k = new T.DirectionalLight('#fff3e0', 1.3); k.position.set(2, 3, 5); shotScene.add(k);
      shotCam = new T.PerspectiveCamera(26, 1, .1, 50);
    }
    const age = realAge ? (cfg.age == null ? 25 : cfg.age) : Math.max(18, cfg.age || 25);
    const h = makeHuman(Object.assign({}, cfg, { age })); shotScene.add(h.g); h.g.rotation.y = .35;
    h.g.updateMatrixWorld(true); const hp = new T.Vector3(); h.P.head.getWorldPosition(hp);
    const hs = h.P.head.scale.y * h.g.scale.y / 1.17, top = hp.y + .28 * hs * 1.17;
    if (full === 'eyes') { h.g.rotation.y = 0; h.g.updateMatrixWorld(true); h.P.head.getWorldPosition(hp); const k = Math.max(.62, hs); shotCam.aspect = 1; shotCam.updateProjectionMatrix(); shotCam.position.set(0, hp.y + .01 * k, .9 * k); shotCam.lookAt(0, hp.y - .005 * k, 0); }
    else if (full === 'face') { h.g.rotation.y = .18; h.g.updateMatrixWorld(true); h.P.head.getWorldPosition(hp); const k = Math.max(.62, hs); shotCam.aspect = 1; shotCam.updateProjectionMatrix(); shotCam.position.set(0, hp.y + .02 * k, 1.2 * k); shotCam.lookAt(0, hp.y - .03 * k, 0); }
    else if (full) { h.g.rotation.y = .25; shotCam.aspect = .8; shotCam.updateProjectionMatrix(); shotCam.position.set(0, top * .55, top * 2.55 + .4); shotCam.lookAt(0, top * .5, 0); }
    else { shotCam.aspect = 1; shotCam.updateProjectionMatrix(); shotCam.position.set(0, top - .02 * hs, 2.6 * Math.max(.62, hs)); shotCam.lookAt(0, top - .28 * Math.max(.62, hs), 0); }
    const sw = full && full !== 'face' && full !== 'eyes' ? Math.round(size * .8) : size; { const v = shotR.getSize(new T.Vector2()); if (v.x !== sw || v.y !== size) shotR.setSize(sw, size); }
    shotR.setClearColor(bg || '#2a2028', 1); shotR.render(shotScene, shotCam);
    const url = shotR.domElement.toDataURL('image/jpeg', .85);
    shotScene.remove(h.g);
    return (shotCache[key] = url);
  } catch (e) { return ''; }
}
function showPreview(cfg) {
  if (previewModel) showScene.remove(previewModel.g);
  previewModel = makeHuman(cfg); showScene.add(previewModel.g);
  previewModel.g.position.set(0, .25, 0); previewModel.g.rotation.y = showSpinY;
  pedestal.visible = true; showModels.forEach(h => h.g.visible = false);
}
function layoutSelect(i) {
  selIndex = i; pedestal.visible = true;
  showModels.forEach((h, j) => { h.g.visible = j === i; if (j === i) { h.g.position.set(0, .25, 0); h.g.rotation.y = 0; showSpinY = 0; h.emote = 'cheer'; h.emoteT = 1.2; } });
}
function updateShowroom(dt) {
  showModels.forEach(h => h.g.visible && animHuman(h, dt, false, false));
  if (previewModel && previewModel.g.visible && mode === 'select') animHuman(previewModel, dt, false, false);
  const t = clock.elapsedTime;
  if (mode === 'title') {
    const nar = innerWidth / innerHeight < .8, r = nar ? 19 : 9.5, a = Math.sin(t * .15) * (nar ? .25 : .5);
    camera.position.set(Math.sin(a) * r, (nar ? 3.2 : 2.4) + Math.sin(t * .3) * .2, Math.cos(a) * r + 1);
    camera.lookAt(0, 1.3, -1);
    if (nar) camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight * (USER ? .12 : .2), innerWidth, innerHeight);
    else if (camera.view && camera.view.enabled) camera.clearViewOffset();
  } else {
    const h = previewModel || showModels[selIndex];
    if (!showDrag) { if (mode === 'select' && previewModel && showZoom) { const d = Math.atan2(Math.sin(.35 - showSpinY), Math.cos(.35 - showSpinY)); showSpinY += d * Math.min(1, dt * 3); } else showSpinY += dt * .45; }
    h.g.rotation.y = showSpinY;
    const narrow = innerWidth < 820;
    _shZ += ((mode === 'select' && previewModel ? showZoom : 0) - _shZ) * Math.min(1, dt * 6);
    let hy = 2.15; if (previewModel) { const hp = new T.Vector3(); previewModel.P.head.getWorldPosition(hp); hy = hp.y + .05; }
    const L = (a, b) => a + (b - a) * _shZ;
    if (narrow) { camera.position.set(0, L(1.5, hy - .05), L(7.4, 3.6)); camera.lookAt(0, L(1.15, hy - .2), 0); camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight * .24, innerWidth, innerHeight); }
    else { if (camera.view && camera.view.enabled) camera.clearViewOffset(); camera.position.set(0, L(1.6, hy - .02), L(5.6, 2.7)); camera.lookAt(0, L(1.3, hy - .12), 0); }
  }
}

/* =========================================================
   MUNDO — Bairro de Luanda
   ========================================================= */
function addCol(cx, cz, w, d, h) { const c = { x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2 }; if (h) c.h = h; colliders.push(c); return c; }
let colMaxH = 9;   // altura do edifício mais alto com colisão (a câmara verifica até aí)

const _wt = {};
function windowTex(face, glass, rx, ry) {
  const k = face + glass; let base = _wt[k];
  if (!base) base = _wt[k] = ctex(64, 64, (x) => { x.fillStyle = face; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(10, 12, 44, 38); x.fillStyle = glass; x.fillRect(13, 15, 38, 32); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(13, 15, 38, 6); });
  const t = base.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); return t;
}
let _litBase;
function litTex(rx, ry) {
  if (!_litBase) _litBase = ctex(256, 256, (x) => { x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (Math.random() < .45) { x.fillStyle = Math.random() < .5 ? '#ffd27a' : '#fff1c4'; x.fillRect(i * 64 + 13, j * 64 + 15, 38, 32); } });
  const t = _litBase.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx / 4, ry / 4); return t;
}
function building(cx, cz, w, d, h, face, opts = {}) {
  const glass = opts.glass || '#2a3d52';
  const rx = Math.max(1, Math.round(w / 3.2)), ry = Math.max(1, Math.round(h / 3.4));
  const m = new T.MeshStandardMaterial({ map: windowTex(face, glass, rx, ry), roughness: opts.rough ?? .8, metalness: opts.metal || 0, emissive: '#ffffff', emissiveMap: litTex(rx, ry), emissiveIntensity: 0 });
  nightMats.push({ m, day: 0, night: .9 });
  const roof = mat(opts.roof || '#5d5d5d');
  const b = new T.Mesh(bx(w, h, d), [m, m, roof, roof, m, m]);
  b.position.set(cx, h / 2, cz); b.castShadow = b.receiveShadow = true; worldScene.add(b);
  if (!opts.nocol) addCol(cx, cz, w, d);
  return b;
}
function shack(x, z, ry = 0, col) {
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; decor.add(g);
  const c = col || pick(['#c96f4a', '#d9b38c', '#8fa3b8', '#e0d4b0', '#a35c3c', '#b5c99a', '#d98c6a', '#e8d27a']);
  mesh(bx(3.4, 2.4, 3.2), mat(c), 0, 1.2, 0, g);
  const roof = mesh(bx(3.9, .08, 3.7), mat('#8d9499', { metalness: .55, roughness: .45 }), 0, 2.55, 0, g); roof.rotation.z = .09;
  mesh(bx(.8, 1.6, .06), mat('#3a2a1a'), .6, .8, 1.62, g);
  mesh(bx(.6, .5, .06), mat('#1a2633'), -.8, 1.4, 1.62, g);
  const s = Math.abs(Math.sin(ry)) > .5; addCol(x, z, s ? 3.4 : 3.6, s ? 3.6 : 3.4);
  return g;
}
function palm(x, z, s = 1) {
  const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); decor.add(g);
  const tm = mat('#8a6a48'); let y = 0, ox = 0; const lean = Math.random() * .3;
  for (let i = 0; i < 6; i++) { const seg = mesh(cyl(.17 - i * .015, .2 - i * .015, 1.2, 7), tm, ox, y + .6, 0, g); seg.rotation.z = -lean * .5; y += 1.15; ox += lean * .25; }
  const lm = mat('#2f7a32', { side: T.DoubleSide });
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2; const l = new T.Mesh(new T.ConeGeometry(.35, 3.2, 4), lm);
    l.scale.set(1, 1, .2); l.position.set(ox + Math.cos(a) * 1.3, y - .2, Math.sin(a) * 1.3);
    l.rotation.set(0, -a, 0); l.rotateZ(-Math.PI / 2 - .35); l.castShadow = true; g.add(l);
  }
  mesh(sph(.25, 8, 6), mat('#5a4a2a'), ox, y, 0, g);
  addCol(x, z, .6, .6);
}
function baobab(x, z, s = 1) {
  const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); decor.add(g);
  const tm = mat('#8f7a66');
  mesh(cyl(1.0, 1.6, 5.5, 10), tm, 0, 2.75, 0, g);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2; const br = mesh(cyl(.12, .28, 2.6, 6), tm, Math.cos(a) * .9, 6.2, Math.sin(a) * .9, g);
    br.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7);
    mesh(sph(.9, 8, 6), mat('#5d7a2e'), Math.cos(a) * 2, 7.4, Math.sin(a) * 2, g).scale.y = .6;
  }
  addCol(x, z, 2.6 * s, 2.6 * s);
}
let lampMat;
function lamp(x, z, ry) {
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; decor.add(g);
  mesh(cyl(.07, .1, 5.5, 6), mat('#555'), 0, 2.75, 0, g);
  mesh(bx(.08, .08, 1.4), mat('#555'), 0, 5.45, .65, g);
  mesh(bx(.35, .12, .5), lampMat, 0, 5.38, 1.3, g, false);
}
function vanModel() {
  const g = new T.Group();
  mesh(bx(4.4, 1.0, 1.95), mat('#1f63c9', { roughness: .4, metalness: .2 }), 0, .85, 0, g);
  mesh(bx(4.4, .95, 1.9), mat('#f2f2f2', { roughness: .4 }), 0, 1.8, 0, g);
  const gl = mat('#1b2530', { roughness: .1, metalness: .6 });
  mesh(bx(3.2, .55, 1.94), gl, -.4, 1.9, 0, g, false);
  mesh(bx(.05, .7, 1.7), gl, 2.21, 1.85, 0, g, false);
  mesh(bx(4.42, .1, 1.97), mat('#ffcb00'), 0, 1.33, 0, g, false);
  [[-1.4, 1], [1.4, 1], [-1.4, -1], [1.4, -1]].forEach(([wx, s]) => { const w = mesh(cyl(.38, .38, .25, 12), mat('#141414'), wx, .38, s * .95, g); w.rotation.x = Math.PI / 2; });
  mesh(bx(.06, .2, .4), mat('#fff6c0', { emissive: '#fff6c0', emissiveIntensity: .6 }), 2.21, .9, .7, g, false);
  mesh(bx(.06, .2, .4), mat('#fff6c0', { emissive: '#fff6c0', emissiveIntensity: .6 }), 2.21, .9, -.7, g, false);
  return g;
}
/* cidadão anónimo (tela inicial) — ninguém tem personagem fixa */
function citizenCfg(g, i) {
  const G2 = GEN[g], av = Object.assign({ genero: g, pele: SKINS[(i * 3 + 2) % SKINS.length], roupa: CLOTH[(i * 5) % CLOTH.length], calcas: PANTS[(i * 3) % PANTS.length], sapatos: SHOES[i % SHOES.length] }, crDefaults(g));
  av.cabelo = G2.hairs[(i * 2) % G2.hairs.length]; av.cima = G2.cima[i % G2.cima.length][0]; av.baixo = G2.baixo[(i + 1) % G2.baixo.length][0];
  av.corpo = BUILDS[i % 3][0]; av.rosto = g === 'F' ? ['earrings'].concat(i % 3 !== 2 ? ['lipstick'] : []) : (i % 3 === 1 ? ['beard'] : i % 3 === 2 ? ['mustache'] : []);
  av.estampa = G2.estampas[(i * 3 + 1) % G2.estampas.length];
  av.acess = g === 'F' ? [['bolsa', 'colar'], ['chapeu', 'pulseiras'], ['sunglasses', 'bolsa'], ['colar']][i % 4] : [['watch', 'chain'], ['sunglasses'], ['chapeu', 'watch'], ['backpack']][i % 4];
  if (g === 'F') { av.cabelo = ['longo', 'cachos', 'rabo', 'braids'][i % 4]; if (i === 3) { av.cima = 'vestido'; } }
  return avatarCfg(av, 'casual', [24, 31, 19, 27, 45, 22, 66][i % 7]);
}
function randomNPCcfg() {
  const f = chance(.5);
  const skins = ['#3f281a', '#4a2e1c', '#5a3825', '#6b4429', '#4d3020', '#7a4e30'];
  const tops = ['#d2122e', '#ffcb00', '#1f63c9', '#2e8b57', '#f2f2f2', '#111', '#ff7a1a', '#8a4dff', '#14b8a6', '#c2185b'];
  const c = { skin: pick(skins), shirt: pick(tops), pants: pick(['#2b3a55', '#1a1a1a', '#6a5a40', '#3b5a85', '#7a7a7a']), shoes: pick(['#222', '#fff', '#6b3b1f']), sleeves: pick(['short', 'short', 'none']), build: .9 + Math.random() * .25, extras: [] };
  c.fem = f;
  if (f) {
    c.hair = pick(['afropuff', 'braids', 'wrap', 'short', 'longo', 'cachos', 'rabo', 'longo']); c.hairColor = chance(.8) ? '#141010' : pick(['#4a2c1c', '#6a1424', '#b8862f']);
    c.braidColors = ['#141010', '#2a1a10', pick(tops)]; c.wrap = [pick(tops), pick(tops), '#111', '#f2f2f2'];
    if (chance(.6)) { c.skirt = [pick(tops), pick(tops), '#f2f2f2', '#111']; c.skirtLong = chance(.5); c.pants = c.skin; if (chance(.4)) c.heels = true; }
    else if (chance(.3)) { c.dress = true; c.skirt = [c.shirt, '#ffcb00', '#f2f2f2', '#111']; c.pants = c.skin; c.sleeves = 'none'; c.heels = chance(.5); }
    c.print = pick(['liso', 'listras', 'flores', 'wax', 'logo', 'animal', 'flores']);
    if (chance(.35)) c.extras.push('bolsa'); if (chance(.25)) c.extras.push('colar'); if (chance(.15)) c.extras.push('sunglasses'); if (chance(.12)) c.extras.push('chapeu');
    if (chance(.25)) { c.extras.push('basin'); c.hair = 'wrap'; }
    c.extras.push('earrings');
    if (chance(.3)) c.extras.push('lipstick');
  } else {
    c.hair = pick(['short', 'fade', 'twists', 'cap']); c.hairColor = '#111'; c.capColor = pick(tops);
    if (chance(.3)) c.shorts = true;
    if (chance(.3)) c.extras.push('beard');
    c.print = pick(['liso', 'listras', 'logo', 'numero', 'wax', 'xadrez', 'logo']);
    if (chance(.3)) c.extras.push('watch'); if (chance(.15)) c.extras.push('chain'); if (chance(.12)) c.extras.push('sunglasses'); if (chance(.1) && c.hair !== 'cap') c.extras.push('chapeu'); if (chance(.12)) c.extras.push('backpack');
  }
  c.face = face8Rand();
  return c;
}

function mergeStatic(group) {
  group.updateMatrixWorld(true);
  const buckets = new Map(), keep = [];
  group.traverse(o => {
    if (!o.isMesh) return;
    if (Array.isArray(o.material)) { keep.push(o); return; }
    let b = buckets.get(o.material); if (!b) { b = []; buckets.set(o.material, b); }
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld); b.push(g);
  });
  const out = new T.Group();
  buckets.forEach((geos, m) => {
    let n = 0; geos.forEach(g => n += g.attributes.position.count);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
    geos.forEach(g => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; g.dispose(); });
    const bg = new T.BufferGeometry();
    bg.setAttribute('position', new T.BufferAttribute(pos, 3)); bg.setAttribute('normal', new T.BufferAttribute(nor, 3)); bg.setAttribute('uv', new T.BufferAttribute(uv, 2));
    const mm = new T.Mesh(bg, m); mm.castShadow = !m.wireframe; mm.receiveShadow = true; out.add(mm);
  });
  keep.forEach(o => { const m = o.matrixWorld.clone(); m.decompose(o.position, o.quaternion, o.scale); out.add(o); });
  return out;
}
function npcNext(n, xs, zs) {
  const [x, z] = n.from; const opts = [];
  const ix = xs.indexOf(x), iz = zs.indexOf(z);
  if (ix > 0) opts.push([xs[ix - 1], z]); if (ix < xs.length - 1) opts.push([xs[ix + 1], z]);
  if (iz > 0) opts.push([x, zs[iz - 1]]); if (iz < zs.length - 1) opts.push([x, zs[iz + 1]]);
  n.to = pick(opts); n.t = 0; n.L = Math.hypot(n.to[0] - x, n.to[1] - z);
}

/* ---------- Jogador ---------- */
function spawnPlayer(at) {
  if (!worldScene) buildWorld();
  placeCasa();
  if (player) worldScene.remove(player.g);
  const cfg = playerCfg();
  player = makeHuman(cfg); player.lookKey = lookKey();
  if (G.idade >= 70) player.P.body.rotation.x = .12;
  worldScene.add(player.g);
  if (at) {
    const L = LOC_POS[at];
    if (at === 'cela') { playerPos.set(L.x, 0, L.z - 3); playerYaw = Math.PI; camYaw = 0; }
    else { playerYaw = locFace(at); playerPos.set(L.x - Math.sin(playerYaw) * 2.2, 0, L.z - Math.cos(playerYaw) * 2.2); camYaw = playerYaw + Math.PI + .3; }
  }
  dying = 0; if (camera.view && camera.view.enabled) camera.clearViewOffset(); player.g.rotation.set(0, 0, 0);
  markers.cela.g.visible = G.preso > 0;
}
const ageStage = a => a < 3 ? 0 : a < 6 ? 1 : a < 9 ? 2 : a < 12 ? 3 : a < 15 ? 4 : a < 18 ? 5 : a < 55 ? 6 : a < 70 ? 7 : 8;
const lookKey = () => { const a = G.avatar || {}; return curOutfit() + '|' + ageStage(G.idade) + '|' + (G.tel >= 2 ? 1 : 0) + '|' + [a.cabelo, a.corCabelo, (a.rosto || []).join(), (a.tats || []).join(), a.unhas, a.sombra, a.delineado, a.corBarba, Math.round((a.musc || 0) * 5), Math.round((a.gord || 0) * 5), G.idade >= 45 ? 1 : 0, G.idade >= 58 ? 1 : 0, G.idade >= 75 ? 1 : 0].join('/'); };
function checkPlayerLook() { if (player && mode === 'game' && player.lookKey !== lookKey()) { const y = playerYaw; spawnPlayer(null); playerYaw = y; } }
const checkPlayerAgeLook = checkPlayerLook;
function updatePlayerProps() { }
function playerEmote(type) {
  if (!player) return; player.emote = type; player.emoteT = emDur(type); player.emAge = 0;
  const em = { cheer: '🎉', sad: '😢', dance: '🎶', pray: '🙏', train: '💪', think: '💡', love: '💖', kuduro: '🎶', kizomba: '💃', semba: '🎶', afro: '🎶', wave: '👋', clap: '👏', laugh: '😂', angry: '😠', shrug: '🤷', facepalm: '🤦', point: '👉', bow: '🙇', pushup: '💪', sit: '🪑', selfie: '📸', kiss: '😘', yes: '👍', no: '👎' }[type] || '✨';
  const s = textSprite(em, { bg: false, size: 110, w: 160, h: 160, scale: 1.3 });
  s.position.copy(playerPos).add(new T.Vector3(0, 2.6, 0)); s.userData.life = 1.6; worldScene.add(s); floaters.push(s);
}
const floaters = [];
function sendToPrison() { if (!player) return; spawnPlayer('cela'); markers.cela.g.visible = true; flash('🔒 Foste levado(a) para a Cadeia de Viana'); }
function releaseFromPrison() { markers.cela.g.visible = false; const L = LOC_POS.cadeia; playerPos.set(L.x, 0, L.z - 2); playerYaw = Math.PI; }

/* ---------- Input ---------- */

/* ---------- Tocar num edifício para entrar ---------- */
let HITS = [], autoGo = null;
function buildHits() {
  HITS = []; const m = new T.MeshBasicMaterial();
  const add = (id, x, z, w, d, h) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, h / 2, z); b.updateMatrixWorld(true); b.userData.loc = id; HITS.push(b); };
  Object.entries(HIT_BOXES).forEach(([id, a]) => add(id, ...a));
  Object.entries(LOC_POS).forEach(([id, L]) => add(id, L.x, L.z, 3.6, 3.6, 6.5));
}
const _ray = new T.Raycaster(), _ndc = new T.Vector2();
function pickLoc(cx, cy) {
  if (!HITS.length || !camera) return null;
  const r = renderer.domElement.getBoundingClientRect();
  _ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  _ray.setFromCamera(_ndc, camera);
  const hit = _ray.intersectObjects(HITS.filter(h => h.userData.loc !== 'cela' || (G && G.preso > 0)), false)[0];
  return hit ? hit.object.userData.loc : null;
}
function tapRipple(x, y, ok) {
  const d = document.createElement('div'); d.className = 'tapfx' + (ok ? ' ok' : ''); d.style.left = x + 'px'; d.style.top = y + 'px';
  document.body.appendChild(d); setTimeout(() => d.remove(), 600);
}
function tapEnter(id) {
  if (!G || mode !== 'game' || uiBlocked || dying || busy) return;
  if (G.preso > 0 && id !== 'cela') return toast('🔒 Estás preso(a)! Não podes sair da cela.');
  if (G.idade < 4 && !['casa', 'praia', 'igreja', 'clinica'].includes(id)) return toast('👶 És muito pequenino(a)! Os teus pais não te deixam ir aí sozinho(a).');
  const L = LOC_POS[id], d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z);
  if (d < 3.4) return openLocation(id);
  autoGo = { id, t: 0, stuck: 0, hard: 0, path: typeof v2Route === 'function' ? v2Route(playerPos, id) : null };
  if (typeof v2WalkStart === 'function') v2WalkStart(id, d); else toast(`🚶 A caminho de ${L.n}…`);
}
function goTeleport(id) {
  autoGo = null; const L = LOC_POS[id], f = $('#fade');
  f.innerHTML = `<div><small>🚶 A caminho de…</small><b style="font-size:34px">${L.ico} ${L.n}</b></div>`; f.classList.add('on'); uiBlocked = true;
  setTimeout(() => {
    if (id === 'cela') { playerPos.set(L.x, 0, L.z - 1); playerYaw = Math.PI; camYaw = 0; }
    else { playerYaw = locFace(id); playerPos.set(L.x - Math.sin(playerYaw) * 1.2, 0, L.z - Math.cos(playerYaw) * 1.2); camYaw = playerYaw + Math.PI + .3; }
    if (camera) camera.position.set(L.x + Math.sin(camYaw) * camDist, 6, L.z + Math.cos(camYaw) * camDist);
    f.classList.remove('on'); uiBlocked = false; openLocation(id);
  }, 650);
}
function setupInput() {
  addEventListener('keydown', e => {
    keys[e.code] = true;
    if (mode === 'game' && !uiBlocked && (e.code === 'KeyE' || e.code === 'Enter') && nearLoc) openLocation(nearLoc);
    if (mode === 'game' && e.code === 'Escape') { closePanel(); if (typeof closePhone === 'function') closePhone(); }
    if (mode === 'game' && !uiBlocked && e.code === 'KeyT' && typeof openPhone === 'function') openPhone();
  });
  addEventListener('keyup', e => keys[e.code] = false);
  const cv = renderer.domElement;
  let drag = null;
  let hoverT = 0;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId, sx: e.clientX, sy: e.clientY, t: performance.now(), mv: 0 }; showDrag = mode === 'select'; });
  addEventListener('pointermove', e => {
    if (!drag && mode === 'game' && !IS_MOBILE && e.target === cv) { const n = performance.now(); if (n - hoverT > 90) { hoverT = n; cv.style.cursor = !uiBlocked && ((typeof v4PickPlayer === 'function' && v4PickPlayer(e.clientX, e.clientY)) || pickLoc(e.clientX, e.clientY)) ? 'pointer' : ''; } }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.mv += Math.abs(dx) + Math.abs(dy);
    if (mode === 'game') { camYaw -= dx * .006; camPitch = Math.max(.12, Math.min(1.2, camPitch + dy * .004)); }
    else if (mode === 'select') showSpinY += dx * .01;
  });
  addEventListener('pointerup', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const tap = drag.mv < 12 && performance.now() - drag.t < 600 && mode === 'game' && !uiBlocked;
    const sx = drag.sx, sy = drag.sy; drag = null; showDrag = false;
    if (tap) { const pid = typeof v4PickPlayer === 'function' ? v4PickPlayer(sx, sy) : null; if (pid) { tapRipple(sx, sy, true); v4Perfil(pid); return; } const id = pickLoc(sx, sy); tapRipple(sx, sy, !!id); if (id) tapEnter(id); }
  });
  cv.addEventListener('wheel', e => { if (mode === 'game') camDist = Math.max(5, Math.min(30, camDist + e.deltaY * .01)); }, { passive: true });
  // joystick
  const base = document.getElementById('joy'), knob = document.getElementById('joyKnob');
  let jid = null, cx = 0, cy = 0;
  base.addEventListener('pointerdown', e => { jid = e.pointerId; const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; joy.active = true; base.setPointerCapture(jid); moveJoy(e); });
  base.addEventListener('pointermove', e => { if (e.pointerId === jid) moveJoy(e); });
  const end = e => { if (e.pointerId !== jid) return; jid = null; joy.x = joy.y = 0; joy.active = false; knob.style.transform = 'translate(-50%,-50%)'; };
  base.addEventListener('pointerup', end); base.addEventListener('pointercancel', end);
  function moveJoy(e) { let dx = e.clientX - cx, dy = e.clientY - cy; const L = Math.hypot(dx, dy), M = 48; if (L > M) { dx *= M / L; dy *= M / L; } joy.x = dx / M; joy.y = -dy / M; knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`; }
}

/* ---------- Loop ---------- */
let hitCool = 0, mmFrame = 0;
// 2.º plano: o rAF pára quando a aba está escondida — o mundo continua a viver via temporizador
setInterval(() => {
  if (!document.hidden) return;
  try {
    if ((mode === 'title' || mode === 'select') && typeof updateShowroom === 'function') updateShowroom(1);
    else if (worldScene && typeof updateWorld === 'function') updateWorld(1);
  } catch (e) { }
}, 1000);
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), .1); // até 10 fps o boneco anda à velocidade normal
  if (mode === 'title' || mode === 'select') updateShowroom(dt);
  else if (worldScene) updateWorld(dt);
  renderer.render(curScene, camera);
}
function collide(p, r) {
  for (const c of colliders) {
    const nx = Math.max(c.x0, Math.min(p.x, c.x1)), nz = Math.max(c.z0, Math.min(p.z, c.z1));
    const dx = p.x - nx, dz = p.z - nz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-6) { const d = Math.sqrt(d2); p.x = nx + dx / d * r; p.z = nz + dz / d * r; }
      else { const l = p.x - c.x0, rr = c.x1 - p.x, t = p.z - c.z0, b = c.z1 - p.z; const m = Math.min(l, rr, t, b); if (m === l) p.x = c.x0 - r; else if (m === rr) p.x = c.x1 + r; else if (m === t) p.z = c.z0 - r; else p.z = c.z1 + r; }
    }
  }
  clampLand(p);
}
function updateWorld(dt) {
  wTime += dt;
  // ciclo dia/noite (6 min)
  dayT = (dayT + dt / 360) % 1;
  const ang = dayT * Math.PI * 2 - Math.PI / 2;
  const elev = Math.sin(ang);
  const day = Math.max(0, Math.min(1, elev * 2.5 + .2));
  const sunDir = new T.Vector3(Math.cos(ang) * .8, Math.max(.15, elev), .45).normalize();
  sun.position.copy(playerPos).addScaledVector(sunDir, 80); sun.target.position.copy(playerPos);
  sun.intensity = .15 + day * 1.25;
  sun.color.set(elev < .25 && elev > -0.1 ? '#ffb070' : (day > .1 ? '#fff1d6' : '#9fb5ff'));
  hemi.intensity = .25 + day * .45;
  const skyDay = new T.Color('#8ec9f0'), skyDusk = new T.Color('#f2925c'), skyNight = new T.Color('#0b1430');
  const sky = elev > .25 ? skyDay : elev > -0.05 ? skyDusk.clone().lerp(skyDay, Math.max(0, (elev + .05) / .3)) : skyNight.clone().lerp(skyDusk, Math.max(0, (elev + .3) / .25));
  worldScene.background.copy(sky); worldScene.fog.color.copy(sky).lerp(new T.Color('#ffffff'), .2 * day); citySky(sky, 1 - day);
  const night = 1 - day;
  nightMats.forEach(n => n.m.emissiveIntensity = n.day + (n.night - n.day) * night);
  const hh = document.getElementById('clock'); if (hh) { const hr = Math.floor(((dayT * 24) + 6) % 24), mi = Math.floor((dayT * 24 * 60) % 60); hh.textContent = `${night > .5 ? '🌙' : '☀️'} ${String(hr).padStart(2, '0')}:${String(mi).padStart(2, '0')}`; }

  // mar
  const pa = seaGeo.attributes.position.array;
  for (let i = 0; i < pa.length; i += 3) { const x = seaBase[i], z = seaBase[i + 2]; pa[i + 1] = seaBase[i + 1] + Math.sin(x * .08 + wTime * 1.4) * .22 + Math.cos(z * .11 + wTime * 1.1) * .18; }
  seaGeo.attributes.position.needsUpdate = true;
  // bandeira
  const fa = flagGeo.attributes.position.array;
  for (let i = 0; i < fa.length; i += 3) { const x = flagBase[i]; fa[i + 2] = Math.sin(x * 1.6 - wTime * 5) * .18 * (x / 4.5); }
  flagGeo.attributes.position.needsUpdate = true;
  // marcadores
  Object.values(markers).forEach(m => {
    if (!m.g.visible) return;
    const d = Math.hypot(m.L.x - playerPos.x, m.L.z - playerPos.z), dc = Math.hypot(m.L.x - camera.position.x, m.L.z - camera.position.z);
    const mid = d > 5 && d < 46 && dc > 7, lo = mid ? Math.min(1, (d - 5) / 3, (46 - d) / 8) : 0;
    m.label.visible = lo > .02; m.label.material.opacity = lo; m.label.position.y = 3.3 + Math.sin(wTime * 2) * .08;
    m.badge.visible = d >= 14 && d < 170; m.badge.material.opacity = Math.min(.9, (d - 14) / 8); m.badge.position.y = 3.6 + Math.sin(wTime * 2 + m.t0) * .12;
    const near = d < 5; m.dm.opacity = near ? .85 + Math.sin(wTime * 4 + m.t0) * .12 : .55; const sc = 1 + Math.sin(wTime * 2.5 + m.t0) * .03 + (near ? .04 : 0); m.decal.scale.set(sc, sc, 1);
  });
  // vans
  vans.forEach(v => {
    const dP = Math.hypot(v.g.position.x - playerPos.x, v.g.position.z - playerPos.z);
    const slow = dP < 6 && mode === 'game' ? .25 : 1;
    v.d = (v.d + v.speed * slow * dt) % v.total;
    const sg = v.segs.find(s => v.d >= s.s && v.d < s.s + s.L) || v.segs[0];
    const k = (v.d - sg.s) / sg.L; const dx = (sg.b[0] - sg.a[0]) / sg.L, dz = (sg.b[1] - sg.a[1]) / sg.L;
    const x = sg.a[0] + (sg.b[0] - sg.a[0]) * k + (-dz) * 2, z = sg.a[1] + (sg.b[1] - sg.a[1]) * k + dx * 2;
    v.g.position.set(x, 0, z);
    const target = Math.atan2(-dz, dx); let diff = target - v.g.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); v.g.rotation.y += diff * Math.min(1, dt * 6);
    if (mode === 'game' && dP < 2.6 * BODY_S && hitCool <= 0 && !dying) {
      hitCool = 3; const push = new T.Vector3(playerPos.x - x, 0, playerPos.z - z).normalize().multiplyScalar(2.2); playerPos.add(push);
      if (G && G.vivo) { const t = fx({ saude: -2 }); toast('🚐 Cuidado! O candongueiro quase te atropelou! ' + strip(t)); save(); refresh(); }
    }
  });
  hitCool -= dt;
  // NPCs
  const xs = CITY_XS, zs = CITY_ZS; if (mmFrame % 90 === 0) placeCasa();
  npcs.forEach(n => {
    n.t += n.speed * dt; let k = n.t / n.L;
    if (k >= 1) { n.from = n.to; npcNext(n, xs, zs); k = 0; }
    const dx = (n.to[0] - n.from[0]) / n.L, dz = (n.to[1] - n.from[1]) / n.L;
    const x = n.from[0] + (n.to[0] - n.from[0]) * k + (-dz) * n.side, z = n.from[1] + (n.to[1] - n.from[1]) * k + dx * n.side;
    n.h.g.position.set(x, 0, z); n.h.g.rotation.y = Math.atan2(dx, dz);
    animHuman(n.h, dt, true, false);
  });
  dancers.forEach(h => animHuman(h, dt, false, false));
  // floaters
  for (let i = floaters.length - 1; i >= 0; i--) { const s = floaters[i]; s.userData.life -= dt; s.position.y += dt * 1.2; s.material.opacity = Math.min(1, s.userData.life); if (s.userData.life <= 0) { worldScene.remove(s); floaters.splice(i, 1); } }

  // jogador
  if (player) {
    let ix = 0, iy = 0;
    if (mode === 'game' && !uiBlocked && !dying) {
      if (keys.KeyW || keys.ArrowUp) iy += 1; if (keys.KeyS || keys.ArrowDown) iy -= 1;
      if (keys.KeyA || keys.ArrowLeft) ix -= 1; if (keys.KeyD || keys.ArrowRight) ix += 1;
      if (joy.active) { ix += joy.x; iy += joy.y; }
    }
    let len = Math.hypot(ix, iy), moving = len > .15, agDir = null;
    if (moving || uiBlocked || dying || mode !== 'game') autoGo = null;
    if (!moving && autoGo) {
      const L = LOC_POS[autoGo.id], dd = Math.hypot(L.x - playerPos.x, L.z - playerPos.z);
      if (dd < 1.3) { const id = autoGo.id; autoGo = null; if (typeof v2WalkEnd === 'function') v2WalkEnd(); openLocation(id); }
      else {
        let tx = L.x, tz = L.z;
        if (autoGo.path && autoGo.path.length) { while (autoGo.path.length > 1 && Math.hypot(autoGo.path[0][0] - playerPos.x, autoGo.path[0][1] - playerPos.z) < 1.5) autoGo.path.shift(); tx = autoGo.path[0][0]; tz = autoGo.path[0][1]; }
        const ddx = tx - playerPos.x, ddz = tz - playerPos.z, d2 = Math.hypot(ddx, ddz) || 1;
        agDir = [ddx / d2, ddz / d2];
        if (autoGo.nudge > 0) { autoGo.nudge -= dt; const s = autoGo.ns || 1; agDir = [agDir[0] * .35 - agDir[1] * s, agDir[1] * .35 + agDir[0] * s]; }
        moving = true; len = 1; autoGo.t += dt;
      }
    }
    const run = (keys.ShiftLeft || keys.ShiftRight || len > .95 && joy.active || agDir) && G && G.idade < 70;
    if (moving) {
      const fx_ = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
      let mx = fx_ * iy + rx * ix, mz = fz * iy + rz * ix; if (agDir) { mx = agDir[0]; mz = agDir[1]; } const ml = Math.hypot(mx, mz); mx /= ml; mz /= ml;
      const bx0 = playerPos.x, bz0 = playerPos.z;
      const sp = (run ? 10 : 5.5) * BODY_S * (agDir && autoGo && autoGo.t > 1.2 ? 1.45 : 1) * (typeof vrSpeedK === 'function' ? vrSpeedK(run) : 1) * (G && G.idade >= 70 ? .65 : G && G.idade < 3 ? .4 : G && G.idade < 9 ? .75 : 1) * Math.min(1, len);
      playerPos.x += mx * sp * dt; playerPos.z += mz * sp * dt;
      collide(playerPos, .45);
      if (agDir && autoGo) {
        const moved = Math.hypot(playerPos.x - bx0, playerPos.z - bz0);
        autoGo.stuck = moved < sp * dt * .35 ? autoGo.stuck + dt : Math.max(0, autoGo.stuck - dt * .5);
        if (autoGo.stuck > .5 && !(autoGo.nudge > 0)) {
          autoGo.nudge = .5; autoGo.ns = -(autoGo.ns || -1); autoGo.hard = (autoGo.hard || 0) + 1; autoGo.stuck = 0;
          if (autoGo.hard % 3 === 0 && typeof v2Route === 'function') autoGo.path = v2Route(playerPos, autoGo.id);
        }
        if (autoGo && (autoGo.hard > 12 || autoGo.t > 150)) goTeleport(autoGo.id);
      }
      const target = Math.atan2(mx, mz); let diff = target - playerYaw; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); playerYaw += diff * Math.min(1, dt * 12);
      if (player.emoteT > 0) player.emoteT = 0;
    }
    if (player.s0 == null) player.s0 = player.g.scale.x;
    if (player.g.scale.x !== player.s0 * BODY_S) player.g.scale.setScalar(player.s0 * BODY_S);
    player.g.position.copy(playerPos); player.g.rotation.y = playerYaw;
    if (dying) { dying += dt; player.g.rotation.x = Math.max(-Math.PI / 2, -dying * 1.6); player.g.position.y = Math.min(.25, dying * .3); }
    else animHuman(player, dt, moving, run);
    // camera
    const tgt = new T.Vector3(playerPos.x, 1.6 * BODY_S, playerPos.z);
    const cd = dying ? Math.max(4, camDist - dying * 2) : camDist;
    const dir = new T.Vector3(Math.sin(camYaw) * Math.cos(camPitch), Math.sin(camPitch), Math.cos(camYaw) * Math.cos(camPitch));
    let cdc = cd;
    for (let k = 1; k <= 14; k++) {
      const f = k / 14 * cd, px = tgt.x + dir.x * f, py = tgt.y + dir.y * f, pz = tgt.z + dir.z * f;
      if (py > colMaxH) break;
      if (colliders.some(c => c.x1 - c.x0 > 2.5 && c.z1 - c.z0 > 2.5 && py < (c.h || 9) && px > c.x0 - .3 && px < c.x1 + .3 && pz > c.z0 - .3 && pz < c.z1 + .3)) { cdc = Math.max(2.2, f - .8); break; }
    }
    const want = tgt.clone().addScaledVector(dir, cdc);
    camera.position.lerp(want, Math.min(1, dt * 8)); camera.lookAt(tgt);
    // local próximo
    let best = null, bd = 3.3;
    if (mode === 'game' && !dying) Object.entries(LOC_POS).forEach(([id, L]) => { if (id === 'cela' && !(G && G.preso > 0)) return; const d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z); if (d < bd) { bd = d; best = id; } });
    if (best !== nearLoc) { nearLoc = best; showPrompt(best); }
  }
  if (++mmFrame % 3 === 0) drawMinimap();
}

