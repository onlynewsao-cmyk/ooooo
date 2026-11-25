/* =========================================================
   INTERIORES 3D — entras nos edifícios, andas lá dentro e
   falas com os balcões (cada balcão abre o seu separador).
   Carregado depois de empire.js.
   ========================================================= */
let inInt = null, ivSaved = null, ivGo = null, ivNear = null, IVP = null;
const IV_CACHE = {}, IV_TX = {};
const IV_RAY = new T.Raycaster(), IV_V2 = new T.Vector2();
const IV_HITM = new T.MeshBasicMaterial();
let IV_RINGM = null;

/* ---------- texturas (canvas) ---------- */
function ivTex(key, w, h, draw, rep) {
  const t = IV_TX[key] || (IV_TX[key] = ctex(w, h, draw));
  if (!rep) return t;
  const c = t.clone(); c.needsUpdate = true; c.wrapS = c.wrapT = T.RepeatWrapping; c.repeat.set(rep[0], rep[1]); return c;
}
function ivNoise(x, w, h, n, a) { for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); } }
function ivFloorTex(kind, a, b) {
  return ivTex('fl' + kind + a + b, 256, 256, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    if (kind === 'wood') {
      for (let r = 0; r < 8; r++) for (let k = -1; k < 3; k++) {
        const X = k * 128 + (r % 2) * 64 + (r % 3) * 20, Y = r * 32;
        x.fillStyle = shade(a, .84 + Math.random() * .3); x.fillRect(X, Y, 128, 32);
        x.strokeStyle = 'rgba(60,30,10,.18)'; x.lineWidth = 1;
        for (let g = 0; g < 4; g++) { x.beginPath(); x.moveTo(X, Y + 6 + g * 7); x.bezierCurveTo(X + 40, Y + 2 + g * 7 + Math.random() * 6, X + 80, Y + 10 + g * 7, X + 128, Y + 6 + g * 7); x.stroke(); }
        x.fillStyle = 'rgba(40,20,5,.45)'; x.fillRect(X, Y, 2, 32); x.fillRect(X, Y, 128, 1.5);
      }
    } else if (kind === 'marble') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        x.fillStyle = shade(a, .97 + Math.random() * .05); x.fillRect(i * 128, j * 128, 128, 128);
        x.strokeStyle = 'rgba(120,110,100,.22)'; x.lineWidth = 1.2;
        for (let v = 0; v < 3; v++) { x.beginPath(); let px = i * 128 + Math.random() * 128, py = j * 128; x.moveTo(px, py); for (let s = 0; s < 8; s++) { px += (Math.random() - .5) * 30; py += 16; x.lineTo(px, py); } x.stroke(); }
      }
      x.fillStyle = b; x.fillRect(0, 0, 256, 2); x.fillRect(0, 127, 256, 2); x.fillRect(0, 0, 2, 256); x.fillRect(127, 0, 2, 256);
    } else if (kind === 'tile') {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? b : a; x.fillRect(i * 64, j * 64, 64, 64); }
      x.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 0; i <= 4; i++) { x.fillRect(i * 64 - 1, 0, 2, 256); x.fillRect(0, i * 64 - 1, 256, 2); }
    } else if (kind === 'diag') {
      x.fillStyle = b; for (let i = -4; i < 8; i++) for (let j = -4; j < 8; j++) if ((i + j) % 2 === 0) { x.beginPath(); const cx = i * 64, cy = j * 64; x.moveTo(cx, cy - 32); x.lineTo(cx + 32, cy); x.lineTo(cx, cy + 32); x.lineTo(cx - 32, cy); x.fill(); }
      ivNoise(x, w, h, 400, .04);
    } else if (kind === 'concrete' || kind === 'cement') {
      ivNoise(x, w, h, 3000, kind === 'cement' ? .12 : .07);
      x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 1.5;
      if (kind === 'concrete') { x.strokeRect(0, 0, 128, 128); x.strokeRect(128, 128, 128, 128); }
      else for (let c = 0; c < 3; c++) { x.beginPath(); let px = Math.random() * w, py = Math.random() * h; x.moveTo(px, py); for (let s = 0; s < 6; s++) { px += (Math.random() - .5) * 50; py += (Math.random() - .5) * 50; x.lineTo(px, py); } x.stroke(); }
    } else if (kind === 'rubber') {
      ivNoise(x, w, h, 2500, .08); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 0, 256, 2); x.fillRect(0, 0, 2, 256);
    } else if (kind === 'dark') {
      x.fillStyle = b; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) x.fillRect(i * 64, j * 64, 64, 64);
    }
  });
}
function ivSkyGrad(x, w, h, night, hz) {
  const g = x.createLinearGradient(0, 0, 0, h * hz);
  if (night) { g.addColorStop(0, '#060b1e'); g.addColorStop(1, '#2a3560'); } else { g.addColorStop(0, '#5fb2ea'); g.addColorStop(1, '#d6eefb'); }
  x.fillStyle = g; x.fillRect(0, 0, w, h * hz + 2);
  if (night) { x.fillStyle = '#fff'; for (let i = 0; i < 60; i++) x.fillRect(Math.random() * w, Math.random() * h * hz * .7, 1.2, 1.2); x.fillStyle = '#fdf6d8'; x.beginPath(); x.arc(w * .8, h * .18, 12, 0, 7); x.fill(); }
  else { x.fillStyle = 'rgba(255,255,255,.85)'; [[.2, .2], [.55, .12], [.85, .26]].forEach(([a, b]) => { for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(w * a + k * 16, h * b + (k % 2) * 4, 14 - Math.abs(k - 1.5) * 3, 0, 7); x.fill(); } }); }
}
function ivSkyline(x, w, base, night, n, hMin, hMax, cols) {
  for (let i = 0; i < n; i++) {
    const bw = 18 + Math.random() * 34, bh = hMin + Math.random() * (hMax - hMin), bx0 = i * (w / n) + (Math.random() - .5) * 14;
    x.fillStyle = night ? shade('#1a2238', .7 + Math.random() * .5) : pick(cols); x.fillRect(bx0, base - bh, bw, bh);
    for (let r = base - bh + 6; r < base - 6; r += 8) for (let c = bx0 + 4; c < bx0 + bw - 4; c += 7) {
      if (night) { if (Math.random() < .45) { x.fillStyle = Math.random() < .5 ? '#ffd27a' : '#fff1c4'; x.fillRect(c, r, 4, 4); } }
      else { x.fillStyle = 'rgba(30,60,90,.35)'; x.fillRect(c, r, 4, 4); }
    }
    if (bh > hMax * .8) { x.fillStyle = night ? '#ff4040' : '#999'; x.fillRect(bx0 + bw / 2 - 1, base - bh - 14, 2, 14); }
  }
}
function ivViewTex(kind, night) {
  return ivTex('view' + kind + (night ? 'n' : 'd'), 512, 256, (x, w, h) => {
    if (kind === 'city') {
      ivSkyGrad(x, w, h, night, .8);
      ivSkyline(x, w, h * .78, night, 14, 50, 150, ['#b9c7d6', '#8fa3b8', '#d9d2c0', '#6f8aa3', '#c9c4b8']);
      ivSkyline(x, w, h * .9, night, 10, 30, 80, ['#e0d6c2', '#c9b89a', '#a8b4c0']);
      x.fillStyle = night ? '#0b1a33' : '#1e7fb2'; x.fillRect(0, h * .9, w, h * .1);
    } else if (kind === 'sea' || kind === 'pool') {
      ivSkyGrad(x, w, h, night, .5);
      x.fillStyle = night ? '#0d1d3a' : '#1886c2'; x.fillRect(0, h * .5, w, h * .5);
      x.fillStyle = night ? 'rgba(255,240,200,.25)' : 'rgba(255,255,255,.35)'; for (let i = 0; i < 40; i++) x.fillRect(Math.random() * w, h * .52 + Math.random() * h * .35, 10 + Math.random() * 20, 1.5);
      x.fillStyle = night ? '#3a3420' : '#ecd7a4'; x.fillRect(0, h * .47, w, h * .04);
      ivSkyline(x, w * .5, h * .47, night, 7, 10, 40, ['#d9d2c0', '#b9c7d6']);
      if (kind === 'pool') {
        x.fillStyle = night ? '#2a2a30' : '#efe9dc'; x.fillRect(0, h * .74, w, h * .26);
        x.fillStyle = night ? '#0e5a7a' : '#2ec4e8'; x.fillRect(w * .12, h * .8, w * .76, h * .16);
        x.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 18; i++) x.fillRect(w * .14 + Math.random() * w * .7, h * .82 + Math.random() * h * .12, 14, 1.5);
      }
      x.fillStyle = night ? '#0a1a0a' : '#2e6b2a';
      [[.06, .62], [.94, .6]].forEach(([px, py]) => { x.fillRect(w * px - 2, h * py - 70, 4, 90); for (let k = 0; k < 7; k++) { x.save(); x.translate(w * px, h * py - 70); x.rotate(-1.4 + k * .45); x.beginPath(); x.ellipse(22, 0, 24, 5, 0, 0, 7); x.fill(); x.restore(); } });
    } else if (kind === 'bairro') {
      ivSkyGrad(x, w, h, night, .6);
      x.fillStyle = night ? '#3a2416' : '#c4865a'; x.fillRect(0, h * .6, w, h * .4);
      for (let i = 0; i < 12; i++) {
        const X = i * 44 + Math.random() * 10, Y = h * .6 + (i % 3) * 18, c = pick(['#e8d27a', '#d98a5a', '#9fc0d6', '#f2f2f2', '#c96f4a']);
        x.fillStyle = night ? shade(c, .3) : c; x.fillRect(X, Y - 26, 36, 26);
        x.fillStyle = night ? '#333' : '#9aa0a6'; x.fillRect(X - 3, Y - 30, 42, 5);
        x.fillStyle = night ? (Math.random() < .5 ? '#ffd27a' : '#222') : '#3a2a20'; x.fillRect(X + 8, Y - 18, 8, 8);
      }
      x.fillStyle = night ? '#140c06' : '#5a3a1e'; x.fillRect(w * .78, h * .3, 14, 80); x.beginPath(); x.ellipse(w * .78 + 7, h * .3, 50, 22, 0, 0, 7); x.fill();
    } else if (kind === 'obra') {
      ivSkyGrad(x, w, h, night, .65);
      x.fillStyle = night ? '#3a2416' : '#c4865a'; x.fillRect(0, h * .65, w, h * .35);
      x.strokeStyle = night ? '#666' : '#9a958c'; x.lineWidth = 4;
      [[60, 120, 5], [250, 90, 7], [400, 150, 4]].forEach(([X, bw, fl]) => { for (let f = 0; f <= fl; f++) { x.beginPath(); x.moveTo(X, h * .65 - f * 18); x.lineTo(X + bw, h * .65 - f * 18); x.stroke(); } for (let c = 0; c <= 3; c++) { x.beginPath(); x.moveTo(X + c * bw / 3, h * .65); x.lineTo(X + c * bw / 3, h * .65 - fl * 18); x.stroke(); } });
      x.strokeStyle = '#e8b923'; x.lineWidth = 5; x.beginPath(); x.moveTo(200, h * .65); x.lineTo(200, 20); x.lineTo(380, 20); x.moveTo(170, 20); x.lineTo(200, 20); x.stroke();
      x.beginPath(); x.lineWidth = 1.5; x.moveTo(330, 20); x.lineTo(330, 90); x.stroke();
    } else if (kind === 'ceu') { ivSkyGrad(x, w, h, night, 1); }
  });
}

/* ---------- primitivas (pai = IVP) ---------- */
function ivM(c, o) { return typeof c === 'string' ? mat(c, o) : c; }
function ivB(w, h, d, c, x, y, z, o, sh = true) { return mesh(bx(w, h, d), ivM(c, o), x, y + h / 2, z, IVP, sh); }
function ivC(rt, rb, h, c, x, y, z, s = 14, o) { return mesh(cyl(rt, rb, h, s), ivM(c, o), x, y + h / 2, z, IVP); }
function ivS(r, c, x, y, z, o) { return mesh(sph(r, 14, 10), ivM(c, o), x, y, z, IVP); }
function ivGrp(x, z, ry, fn) { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; IVP.add(g); const P0 = IVP; IVP = g; fn(); IVP = P0; return g; }
function ivGlow(c, i = 1.2) { return new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i }); }
function ivPlane(w, h, m, x, y, z, ry = 0, rx = 0) { const p = new T.Mesh(new T.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.set(rx, ry, 0); IVP.add(p); return p; }
function ivCanvas(key, w, h, draw) { return new T.MeshStandardMaterial({ map: ivTex(key, w, h, draw), roughness: .7 }); }
function ivCanvasGlow(key, w, h, draw, i = .9) { const t = ivTex(key, w, h, draw); return new T.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: i }); }

function ivTable(x, z, w, d, h = .78, top = '#7a5236', leg) {
  ivB(w, .08, d, top, x, h - .08, z, { roughness: .45 });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => ivB(.07, h - .08, .07, leg || shade(top, .65), x + a * (w / 2 - .12), 0, z + b * (d / 2 - .12)));
}
function ivChair(x, z, ry, c = '#3a3a3a', leg = '#222') {
  return ivGrp(x, z, ry, () => { ivB(.5, .07, .5, c, 0, .45, 0); ivB(.5, .6, .07, c, 0, .5, -.22); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => ivB(.05, .45, .05, leg, a * .21, 0, b * .21)); });
}
function ivStool(x, z, c = '#c8102e') { ivC(.22, .22, .08, c, x, .78, z); ivC(.04, .04, .78, '#888', x, 0, z, 8, { metalness: .7 }); ivC(.2, .2, .03, '#666', x, 0, z); }
function ivSofa(x, z, ry, c = '#5a6b80', len = 2.2, cush) {
  return ivGrp(x, z, ry, () => {
    ivB(len, .42, .92, c, 0, .02, 0, { roughness: .95 }); ivB(len, .62, .22, shade(c, .9), 0, .4, -.36, { roughness: .95 });
    [-1, 1].forEach(s => ivB(.2, .58, .92, shade(c, .85), s * (len / 2 - .1), .02, 0, { roughness: .95 }));
    const n = Math.max(2, Math.round(len / .9)); for (let i = 0; i < n; i++) ivB((len - .5) / n - .04, .14, .7, shade(c, 1.12), -len / 2 + .25 + (i + .5) * (len - .5) / n, .44, .05, { roughness: 1 });
    if (cush) [-1, 1].forEach(s => { const p = ivB(.42, .38, .12, cush, s * (len / 2 - .45), .55, -.2); p.rotation.z = s * .15; });
  });
}
function ivPlant(x, z, s = 1, pot = '#e9e2d4') {
  ivC(.26 * s, .2 * s, .5 * s, pot, x, 0, z);
  ivC(.24 * s, .24 * s, .04, '#3a2a1a', x, .48 * s, z);
  const g1 = mat('#3f8a3a', { roughness: .8 }), g2 = mat('#5aa84a', { roughness: .8 });
  for (let i = 0; i < 7; i++) { const a = i * .9, r = .18 * s; const l = mesh(sph(.22 * s, 8, 6), i % 2 ? g1 : g2, x + Math.cos(a) * r, (.75 + (i % 3) * .28) * s, z + Math.sin(a) * r, IVP); l.scale.set(1, 1.5, .6); l.rotation.y = a; }
  if (s > 1.2) { ivC(.04 * s, .05 * s, 1.2 * s, '#6b4a2a', x, .5 * s, z, 6); for (let i = 0; i < 6; i++) { const a = i * 1.05; const l = mesh(sph(.3 * s, 8, 6), i % 2 ? g1 : g2, x + Math.cos(a) * .35 * s, 1.7 * s + (i % 2) * .2, z + Math.sin(a) * .35 * s, IVP); l.scale.set(1.4, .7, .9); } }
}
const IV_BOOKC = ['#c8102e', '#1f63c9', '#2e8b57', '#e8b923', '#7a3a8a', '#ff7a1a', '#f2f2f2', '#333', '#14b8a6'];
function ivShelf(x, z, ry, w = 2, h = 2.2, c = '#6b4423', books = true) {
  return ivGrp(x, z, ry, () => {
    ivB(w, h, .06, shade(c, .8), 0, 0, -.2); [-1, 1].forEach(s => ivB(.06, h, .42, c, s * (w / 2 - .03), 0, 0));
    const n = Math.max(3, Math.round(h / .5));
    for (let i = 0; i <= n; i++) {
      const y = i * (h - .06) / n; ivB(w, .05, .42, c, 0, y, 0);
      if (books && i < n) { let bx0 = -w / 2 + .1; while (bx0 < w / 2 - .2) { const bw = .05 + Math.random() * .07, bh = .26 + Math.random() * .14; const b = ivB(bw, bh, .28, pick(IV_BOOKC), bx0 + bw / 2, y + .05, .02, { roughness: .9 }, false); if (Math.random() < .08) b.rotation.z = .25; bx0 += bw + .01; if (Math.random() < .06) bx0 += .2; } }
    }
  });
}
function ivCounter(x, z, w, d, h = 1.05, c = '#f4f2ee', top = '#2a2a2a', ry = 0) {
  return ivGrp(x, z, ry, () => { ivB(w, h - .06, d, c, 0, 0, 0, { roughness: .4 }); ivB(w + .12, .06, d + .12, top, 0, h - .06, 0, { roughness: .25, metalness: .2 }); ivB(w, .08, .02, shade(c, .7), 0, .02, d / 2 + .01); });
}
function ivPC(x, y, z, ry = 0, screen = '#7fc8ff') {
  return ivGrp(x, z, ry, () => {
    ivB(.62, .4, .04, '#1a1a1a', 0, y + .16, 0); ivPlane(.56, .34, ivGlow(screen, .9), 0, y + .36, .021);
    ivB(.06, .16, .06, '#2a2a2a', 0, y, -.02); ivB(.24, .02, .16, '#2a2a2a', 0, y, -.02); ivB(.5, .02, .16, '#333', 0, y, .26);
  });
}
function ivLaptop(x, y, z, ry = 0) { return ivGrp(x, z, ry, () => { ivB(.4, .02, .28, '#c9ccd0', 0, y, 0, { metalness: .6, roughness: .3 }); const s = ivB(.4, .26, .015, '#c9ccd0', 0, y, -.14, { metalness: .6, roughness: .3 }); s.rotation.x = -.25; const p = ivPlane(.36, .22, ivGlow('#9ad0ff', .8), 0, y + .14, -.12); p.rotation.x = -.25; }); }
function ivTVtex() {
  return ivTex('tvscr', 256, 144, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2f8a3a'); g.addColorStop(1, '#1f6a2a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 2; x.strokeRect(10, 10, w - 20, h - 20); x.beginPath(); x.moveTo(w / 2, 10); x.lineTo(w / 2, h - 10); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2, 20, 0, 7); x.stroke();
    x.fillStyle = '#c8102e'; [[90, 60], [70, 90], [150, 70]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 4, 0, 7); x.fill(); });
    x.fillStyle = '#ffcb00'; [[120, 50], [180, 95]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 4, 0, 7); x.fill(); });
    x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(8, 8, 92, 18); x.fillStyle = '#fff'; x.font = '700 12px system-ui'; x.fillText('ANG 2 - 1 CMR', 14, 21);
  });
}
function ivTV(x, y, z, ry = 0, w = 1.6) {
  return ivGrp(x, z, ry, () => {
    ivB(w, w * .58, .06, '#111', 0, y, 0, { roughness: .3 });
    const t = ivTVtex(); ivPlane(w * .94, w * .52, new T.MeshStandardMaterial({ map: t, emissive: '#fff', emissiveMap: t, emissiveIntensity: .85 }), 0, y + w * .29, .032);
  });
}
function ivRug(x, z, w, d, c, tex, ry = 0) {
  const m = tex ? new T.MeshStandardMaterial({ map: tex, roughness: 1 }) : mat(c, { roughness: 1 });
  const r = ivPlane(w, d, m, x, .012, z, 0, -Math.PI / 2); r.rotation.z = ry; r.receiveShadow = true; return r;
}
function ivRugTex(c1, c2, c3) {
  return ivTex('rug' + c1 + c2 + c3, 256, 256, (x, w, h) => {
    x.fillStyle = c1; x.fillRect(0, 0, w, h); x.strokeStyle = c2; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28); x.lineWidth = 3; x.strokeRect(30, 30, w - 60, h - 60);
    x.fillStyle = c3; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const cx = 56 + i * 36, cy = 56 + j * 36; x.beginPath(); x.moveTo(cx, cy - 12); x.lineTo(cx + 12, cy); x.lineTo(cx, cy + 12); x.lineTo(cx - 12, cy); x.fill(); }
    x.fillStyle = c2; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { x.beginPath(); x.arc(56 + i * 36, 56 + j * 36, 3, 0, 7); x.fill(); }
  });
}
function ivArtTex(kind) {
  return ivTex('art' + kind, 256, 192, (x, w, h) => {
    if (kind === 'sunset') {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ff9a3c'); g.addColorStop(.6, '#ffcf5c'); g.addColorStop(1, '#c2522a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = '#fff3c0'; x.beginPath(); x.arc(w * .6, h * .55, 30, 0, 7); x.fill();
      x.fillStyle = '#2a1408'; x.fillRect(0, h * .78, w, h); x.fillRect(w * .25, h * .35, 12, h * .45); x.beginPath(); x.ellipse(w * .25 + 6, h * .35, 52, 18, 0, 0, 7); x.fill();
      for (let i = 0; i < 3; i++) { x.fillRect(w * .7 + i * 18, h * .62, 5, 22); x.beginPath(); x.arc(w * .7 + i * 18 + 2, h * .6, 5, 0, 7); x.fill(); }
    } else if (kind === 'abstract') {
      x.fillStyle = '#f4efe6'; x.fillRect(0, 0, w, h);
      [['#c8102e', 60, 70, 50], ['#ffcb00', 150, 90, 60], ['#1d1d1d', 110, 130, 34], ['#1f63c9', 200, 50, 30]].forEach(([c, a, b, r]) => { x.fillStyle = c; x.globalAlpha = .85; x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); });
      x.globalAlpha = 1; x.strokeStyle = '#1d1d1d'; x.lineWidth = 5; x.beginPath(); x.moveTo(20, 170); x.bezierCurveTo(80, 20, 160, 190, 240, 30); x.stroke();
    } else if (kind === 'familia') {
      x.fillStyle = '#e9dcc2'; x.fillRect(0, 0, w, h);
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8ec9f0'); g.addColorStop(1, '#f4e1b0'); x.fillStyle = g; x.fillRect(12, 12, w - 24, h - 24);
      [['#4a2e1c', '#c8102e', 60, 1], ['#5a3825', '#1f63c9', 105, 1.15], ['#3f281a', '#ffcb00', 150, 1.1], ['#6b4429', '#2e8b57', 195, .8]].forEach(([sk, sh, cx, s]) => {
        x.fillStyle = sh; x.fillRect(cx - 18 * s, h - 12 - 60 * s, 36 * s, 60 * s); x.fillStyle = sk; x.beginPath(); x.arc(cx, h - 12 - 76 * s, 15 * s, 0, 7); x.fill();
        x.fillStyle = '#141010'; x.beginPath(); x.arc(cx, h - 12 - 84 * s, 14 * s, Math.PI, 0); x.fill();
        x.fillStyle = '#fff'; x.fillRect(cx - 6 * s, h - 12 - 72 * s, 12 * s, 2.5);
      });
    } else if (kind === 'angola') {
      x.fillStyle = '#cc092f'; x.fillRect(0, 0, w, h / 2); x.fillStyle = '#000'; x.fillRect(0, h / 2, w, h / 2);
      x.strokeStyle = '#ffcb00'; x.fillStyle = '#ffcb00'; x.lineWidth = 9; x.beginPath(); x.arc(w / 2, h / 2, 34, Math.PI * .75, Math.PI * 2.05); x.stroke();
      x.save(); x.translate(w / 2, h / 2); x.rotate(-.7); x.fillRect(-38, -5, 64, 10); x.fillRect(24, -8, 18, 16); x.restore();
      x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 13, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(w / 2 - 20 + Math.cos(a) * r, h / 2 - 22 + Math.sin(a) * r); } x.fill();
    } else if (kind === 'mapa') {
      x.fillStyle = '#bfe1f2'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#e8c27a'; x.beginPath(); x.moveTo(70, 20); x.lineTo(180, 26); x.lineTo(200, 80); x.lineTo(186, 150); x.lineTo(110, 176); x.lineTo(78, 140); x.lineTo(60, 80); x.closePath(); x.fill();
      x.strokeStyle = '#8a5a2a'; x.lineWidth = 2; x.stroke(); x.fillStyle = '#c8102e'; x.beginPath(); x.arc(76, 66, 5, 0, 7); x.fill();
      x.fillStyle = '#333'; x.font = '700 14px system-ui'; x.fillText('LUANDA', 86, 62); x.font = '900 22px system-ui'; x.fillText('ANGOLA', 100, 110);
    }
  });
}
function ivArt(x, y, z, ry, w, h, kind, frame = '#2a1a10') {
  return ivGrp(x, z, ry, () => { ivB(w + .12, h + .12, .05, frame, 0, y - .06, 0); ivPlane(w, h, new T.MeshStandardMaterial({ map: ivArtTex(kind), roughness: .8 }), 0, y + h / 2, .03); });
}
function ivBed(x, z, ry, blanket = '#c8102e', dbl = true, wood = '#6b4423') {
  const w = dbl ? 1.7 : 1;
  return ivGrp(x, z, ry, () => {
    ivB(w + .1, .32, 2.1, wood, 0, 0, 0); ivB(w + .1, .95, .1, shade(wood, .85), 0, 0, -1.05);
    ivB(w, .2, 2, '#f4f1ea', 0, .32, 0, { roughness: 1 });
    const bl = new T.MeshStandardMaterial({ map: waxTex([blanket, '#ffcb00', '#1d1d1d', '#f2f2f2']), roughness: 1 });
    ivB(w + .04, .06, 1.35, bl, 0, .5, .33);
    for (let i = 0; i < (dbl ? 2 : 1); i++) ivB(.6, .14, .32, '#fbfbf7', dbl ? (i ? .4 : -.4) : 0, .52, -.78, { roughness: 1 });
  });
}
function ivWardrobe(x, z, ry, w = 2, h = 2.3, c = '#8a5a3a') {
  return ivGrp(x, z, ry, () => { ivB(w, h, .6, c, 0, 0, 0, { roughness: .6 }); ivB(.02, h - .2, .01, shade(c, .6), 0, .1, .305); [-1, 1].forEach(s => ivB(.04, .3, .04, '#d9c9a0', s * .1, h * .5, .32, { metalness: .7 })); ivB(w + .08, .08, .66, shade(c, .8), 0, h, 0); });
}
function ivLampF(x, z, c = '#fff1c4') { ivC(.18, .18, .03, '#333', x, 0, z); ivC(.02, .02, 1.5, '#444', x, 0, z, 6); ivC(.18, .26, .32, ivGlow(c, .8), x, 1.45, z, 14); }
function ivPendant(x, y, z, c = '#ffe2a0') { ivC(.01, .01, .8, '#222', x, y - .8, z, 4); ivC(.08, .3, .26, '#222', x, y - 1.06, z, 16, { roughness: .4 }); ivS(.1, ivGlow(c, 1.6), x, y - 1.06, z); }
function ivClock(x, y, z, ry) { return ivGrp(x, z, ry, () => { const c = ivC(.32, .32, .05, '#fff', 0, y, 0, 20); c.rotation.x = Math.PI / 2; c.position.set(0, y, .03); const r = ivC(.34, .34, .04, '#222', 0, y, 0, 20); r.rotation.x = Math.PI / 2; r.position.set(0, y, .01); const h1 = ivB(.03, .18, .01, '#111', 0, y - .02, .06); h1.rotation.z = .8; ivB(.025, .25, .01, '#111', 0, y - .02, .065); }); }
function ivCooler(x, z) { ivB(.4, 1, .4, '#e8e8e8', x, 0, z); ivC(.17, .17, .45, new T.MeshStandardMaterial({ color: '#7cc4f0', transparent: true, opacity: .7, roughness: .1 }), x, 1, z); }
function ivSign(text, w, bg, fg, sub, x, y, z, ry = 0) { const s = signPlane(text, w, bg, fg, sub); s.position.set(x, y, z); s.rotation.y = ry; IVP.add(s); return s; }
function ivNeon(text, x, y, z, ry, c, w = 4) {
  const t = ctex(512, 128, (g) => { g.clearRect(0, 0, 512, 128); g.font = '900 86px system-ui,Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = c; g.shadowBlur = 24; g.fillStyle = c; g.fillText(text, 256, 68); g.shadowBlur = 0; g.fillStyle = '#fff'; g.globalAlpha = .55; g.fillText(text, 256, 68); });
  const p = ivPlane(w, w / 4, new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }), x, y, z, ry); return p;
}

/* ---------- sala base ---------- */
function ivNew(id) {
  const sc = new T.Scene();
  const D = { id, sc, st: new T.Group(), dyn: new T.Group(), walls: [], stations: [], hits: [], cols: [], npcs: [], rings: [], labels: [], views: [], spin: [], tick: null, t: 0 };
  sc.add(D.dyn); return D;
}
function ivRoom(D, o) {
  const { w, d, h } = o; D.w = w; D.d = d; D.h = h;
  D.sc.background = new T.Color(o.bg || '#17131c');
  D.dist = o.dist || Math.max(11, Math.max(w, d * 1.25) * .82);
  IVP = D.st;
  const ft = o.ftex ? o.ftex.clone() : null;
  if (ft) { ft.needsUpdate = true; ft.wrapS = ft.wrapT = T.RepeatWrapping; ft.repeat.set(w / (o.frep || 4), d / (o.frep || 4)); }
  const fl = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshStandardMaterial({ map: ft, color: ft ? '#ffffff' : (o.floor || '#888'), roughness: o.fr ?? .55, metalness: o.fm || 0 }));
  fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; D.sc.add(fl); D.floor = fl;
  ivB(w + .6, .5, d + .3, o.slab || '#2a2430', 0, -.53, .15, null, false);
  ivB(w + .6, .08, .08, o.trim || '#333', 0, -.04, d / 2 + .26, null, false);
  const wm = mat(o.wall || '#e9e4da', { roughness: .9 }), tr = mat(o.trim || shade(o.wall || '#e9e4da', .7));
  const mk = (nx, nz) => { const g = new T.Group(); D.sc.add(g); const W = { g, nx, nz, p: nx ? w / 2 : d / 2 }; D.walls.push(W); return W; };
  const back = mk(0, -1), left = mk(-1, 0), right = mk(1, 0);
  D.back = back.g; D.left = left.g; D.right = right.g;
  IVP = back.g; ivB(w + .6, h, .3, wm, 0, 0, -d / 2 - .15); ivB(w, .16, .05, tr, 0, 0, -d / 2 + .02); ivB(w + .6, .18, .42, tr, 0, h, -d / 2 - .06);
  IVP = left.g; ivB(.3, h, d, wm, -w / 2 - .15, 0, 0); ivB(.05, .16, d, tr, -w / 2 + .02, 0, 0); ivB(.42, .18, d, tr, -w / 2 - .06, h, 0);
  IVP = right.g; ivB(.3, h, d, wm, w / 2 + .15, 0, 0); ivB(.05, .16, d, tr, w / 2 - .02, 0, 0); ivB(.42, .18, d, tr, w / 2 + .06, h, 0);
  if (o.wains) {
    const wn = mat(o.wains, { roughness: .7 }), wh = o.wainsH || 1.1;
    IVP = back.g; ivB(w, wh, .04, wn, 0, 0, -d / 2 + .02); ivB(w, .05, .07, tr, 0, wh, -d / 2 + .03);
    IVP = left.g; ivB(.04, wh, d, wn, -w / 2 + .02, 0, 0); ivB(.07, .05, d, tr, -w / 2 + .03, wh, 0);
    IVP = right.g; ivB(.04, wh, d, wn, w / 2 - .02, 0, 0); ivB(.07, .05, d, tr, w / 2 - .03, wh, 0);
  }
  // porta de saída (parede esquerda, perto da frente)
  const dz = d / 2 - 2.2; D.door = { x: -w / 2 + 1.1, z: dz };
  IVP = left.g;
  ivB(.12, 2.5, .14, o.doorFrame || '#3a2a1e', -w / 2 + .06, 0, dz - .78); ivB(.12, 2.5, .14, o.doorFrame || '#3a2a1e', -w / 2 + .06, 0, dz + .78); ivB(.12, .14, 1.7, o.doorFrame || '#3a2a1e', -w / 2 + .06, 2.5, dz);
  ivB(.06, 2.46, 1.42, o.door || '#7a4a2a', -w / 2 + .04, 0, dz, { roughness: .6 }); ivB(.08, .06, .2, '#d9c9a0', -w / 2 + .1, 1.1, dz + .5, { metalness: .8 });
  const ex = ctex(256, 96, (x) => { x.fillStyle = '#0f8a3a'; x.fillRect(0, 0, 256, 96); x.fillStyle = '#fff'; x.font = '900 52px system-ui,Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SAÍDA', 128, 50); });
  ivPlane(.7, .26, new T.MeshStandardMaterial({ map: ex, emissive: '#fff', emissiveMap: ex, emissiveIntensity: .9 }), -w / 2 + .05, 2.95, dz, Math.PI / 2);
  { const b = new T.Mesh(new T.BoxGeometry(1, 2.6, 1.8), IV_HITM); b.position.set(-w / 2 + .4, 1.3, dz); b.updateMatrixWorld(true); b.userData.iv = 'door'; D.hits.push(b); }
  ivRug(-w / 2 + .9, dz, 1.2, 1.6, o.mat || '#5a3a2a');
  IVP = D.st;
}
function ivLights(D, o = {}) {
  const sc = D.sc;
  sc.add(new T.HemisphereLight(o.sky || '#fff6e8', o.gnd || '#4a3a30', o.hi ?? .72));
  const k = new T.DirectionalLight(o.key || '#fff1dc', o.ki ?? .75); k.position.set(-D.w * .3, D.h * 3, D.d * .9); k.castShadow = true;
  k.shadow.mapSize.set(IS_MOBILE ? 1024 : 2048, IS_MOBILE ? 1024 : 2048);
  const s = Math.max(D.w, D.d) * .65; Object.assign(k.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 80 });
  k.shadow.bias = -.0005; k.shadow.normalBias = .03; k.shadow.camera.updateProjectionMatrix(); sc.add(k); sc.add(k.target);
  D.lights = (o.points || []).map(([x, y, z, c, i, r]) => { const p = new T.PointLight(c, i, r || 14, 1.6); p.position.set(x, y, z); sc.add(p); return p; });
}
function ivWindow(D, wall, a, y0, w, h, kind, frame = '#f4f1ea') {
  const P0 = IVP; const W = D.w, Dd = D.d;
  const vm = new T.MeshBasicMaterial({ map: ivViewTex(kind, false), toneMapped: false }); D.views.push({ m: vm, kind });
  const g = new T.Group(); ({ back: D.back, left: D.left, right: D.right })[wall].add(g);
  if (wall === 'back') g.position.set(a, 0, -Dd / 2 + .03); else if (wall === 'left') { g.position.set(-W / 2 + .03, 0, a); g.rotation.y = Math.PI / 2; } else { g.position.set(W / 2 - .03, 0, a); g.rotation.y = -Math.PI / 2; }
  IVP = g;
  ivPlane(w, h, vm, 0, y0 + h / 2, 0);
  const f = mat(frame, { roughness: .5 });
  ivB(w + .16, .1, .1, f, 0, y0 - .1, .03); ivB(w + .16, .1, .1, f, 0, y0 + h, .03); [-1, 1].forEach(s => ivB(.1, h, .1, f, s * (w / 2 + .03), y0, .03));
  const nm = Math.max(1, Math.round(w / 1.4)); for (let i = 1; i < nm; i++) ivB(.05, h, .06, f, -w / 2 + i * w / nm, y0, .03);
  ivB(w + .3, .06, .22, f, 0, y0 - .14, .1);
  IVP = P0; return g;
}
function ivGlassWall(D, kind, mull = '#2a2a2a') {
  const P0 = IVP; const vm = new T.MeshBasicMaterial({ map: ivViewTex(kind, false), toneMapped: false }); D.views.push({ m: vm, kind });
  IVP = D.back; ivPlane(D.w, D.h, vm, 0, D.h / 2, -D.d / 2 + .02);
  const m = mat(mull, { metalness: .6, roughness: .35 }); const n = Math.round(D.w / 2.4);
  for (let i = 0; i <= n; i++) ivB(.1, D.h, .12, m, -D.w / 2 + i * D.w / n, 0, -D.d / 2 + .06);
  ivB(D.w, .08, .12, m, 0, D.h * .36, -D.d / 2 + .06); ivB(D.w, .14, .16, m, 0, .02, -D.d / 2 + .08);
  IVP = P0;
}
function ivStation(D, o) {
  if (!IV_RINGM) IV_RINGM = new T.MeshBasicMaterial({ color: '#ffcb00', transparent: true, opacity: .9, toneMapped: false });
  const ring = new T.Mesh(new T.TorusGeometry(.6, .045, 6, 32), IV_RINGM); ring.rotation.x = -Math.PI / 2; ring.position.set(o.x, .05, o.z); D.dyn.add(ring); D.rings.push(ring);
  const disc = new T.Mesh(new T.CircleGeometry(.58, 28), new T.MeshBasicMaterial({ color: '#ffcb00', transparent: true, opacity: .16, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.set(o.x, .04, o.z); D.dyn.add(disc);
  const hb = o.hit || [o.x, o.z, 1.6, 1.6, 2.4];
  const lab = textSprite(`${o.ico} ${o.label}`, { scale: IS_MOBILE ? 2.7 : 3, size: 50 });
  lab.position.set(hb[0], Math.min(D.h - .3, (o.ly || hb[4]) + .75), hb[1]); lab.userData.y = lab.position.y; D.dyn.add(lab); D.labels.push(lab);
  const idx = D.stations.length;
  [hb, [o.x, o.z, 1.3, 1.3, 2.2]].forEach(a => { const b = new T.Mesh(new T.BoxGeometry(a[2], a[4], a[3]), IV_HITM); b.position.set(a[0], a[4] / 2, a[1]); b.updateMatrixWorld(true); b.userData.iv = 'st:' + idx; D.hits.push(b); });
  D.stations.push(o); return o;
}
function ivCol(D, x, z, w, d) { D.cols.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 }); }
function ivNPC(D, x, z, ry, o = {}) {
  let c = randomNPCcfg(); for (let k = 0; k < 12 && o.fem != null && c.fem !== o.fem; k++) c = randomNPCcfg();
  if (o.cfg) Object.assign(c, o.cfg);
  const h = makeHuman(c); h.g.position.set(x, 0, z); h.g.rotation.y = ry; D.sc.add(h.g);
  const n = { h, mode: o.mode || 'idle', x, z, ry, a: o.a, b: o.b, t: Math.random() * 6, k: 0, y: o.y || 0 };
  if (n.mode === 'dance') h.idleDance = true;
  if (n.mode === 'sit') { const P = h.P; P.legL.rotation.x = P.legR.rotation.x = -1.45; P.body.position.y = (o.seat || .47) + .06 - .92; P.armL.rotation.x = P.armR.rotation.x = -.45; P.armL.rotation.z = -.12; P.armR.rotation.z = .12; }
  if (n.mode === 'statue') { h.P.armL.rotation.z = -.15; h.P.armR.rotation.z = .15; }
  if (n.y) h.g.position.y = n.y;
  D.npcs.push(n); return n;
}
function ivAnimNPC(n, dt) {
  const h = n.h, P = h.P;
  switch (n.mode) {
    case 'sit': case 'statue': return;
    case 'jog': animHuman(h, dt, true, true); return;
    case 'work': h.t += dt * 9; P.armL.rotation.x = -1.05 + Math.sin(h.t) * .08; P.armR.rotation.x = -1.05 + Math.sin(h.t + 1.7) * .08; P.armL.rotation.z = .25; P.armR.rotation.z = -.25; P.head.rotation.x = .12; return;
    case 'train': case 'pray': case 'cheer': case 'think': if (h.emoteT <= 0) { h.emote = n.mode === 'think' ? (Math.random() < .5 ? 'think' : null) : n.mode; h.emoteT = 1.8; } animHuman(h, dt, false, false); return;
    case 'walk': {
      if (n.k > 0) { n.k -= dt; animHuman(h, dt, false, false); return; }
      const tgt = n.toB ? n.b : n.a, dx = tgt[0] - h.g.position.x, dz = tgt[1] - h.g.position.z, dd = Math.hypot(dx, dz);
      if (dd < .1) { n.toB = !n.toB; n.k = 1.5 + Math.random() * 2.5; return; }
      const sp = Math.min(dd, 1.25 * dt); h.g.position.x += dx / dd * sp; h.g.position.z += dz / dd * sp;
      let df = Math.atan2(dx, dz) - h.g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); h.g.rotation.y += df * Math.min(1, dt * 8);
      animHuman(h, dt, true, false); return;
    }
    default: animHuman(h, dt, false, false);
  }
}
function ivFinish(D) {
  D.sc.add(D.st);
  const m = mergeStatic(D.st); D.sc.remove(D.st); D.sc.add(m); D.st = m;
  D.walls.forEach(W => { const mm = mergeStatic(W.g); W.g.clear(); W.g.add(mm); });
  IVP = null; return D;
}

/* ---------- desenhos de parede ---------- */
const ivDraw = {
  zona: (x, w, h, Z, i) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, Z.cor); g.addColorStop(1, shade(Z.cor, .55)); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,.95)'; x.textAlign = 'center';
    x.font = '900 30px system-ui,Arial'; x.fillText(Z.nivel.toUpperCase(), w / 2, 46);
    x.font = '700 19px system-ui,Arial'; x.fillText(Z.t, w / 2, 76);
    // casinha a crescer com o nível
    const cx = w / 2, by = 250, s = .55 + i * .12;
    x.fillStyle = '#ffffff'; x.fillRect(cx - 60 * s, by - 70 * s, 120 * s, 70 * s);
    x.fillStyle = i < 2 ? '#8a8a8a' : '#c8102e'; x.beginPath(); x.moveTo(cx - 72 * s, by - 68 * s); x.lineTo(cx, by - 120 * s); x.lineTo(cx + 72 * s, by - 68 * s); x.closePath(); x.fill();
    x.fillStyle = '#4a2e1a'; x.fillRect(cx - 12 * s, by - 38 * s, 24 * s, 38 * s);
    x.fillStyle = '#7fc8ff'; x.fillRect(cx - 46 * s, by - 56 * s, 22 * s, 18 * s); x.fillRect(cx + 24 * s, by - 56 * s, 22 * s, 18 * s);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(16, 286, w - 32, 40); x.fillStyle = '#ffcb00'; x.font = '900 26px system-ui,Arial'; x.fillText('★'.repeat(i + 1), w / 2, 316);
  },
  angola: (x, w, h) => {
    x.fillStyle = '#0d2a4a'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffcb00'; x.font = '900 26px system-ui,Arial'; x.textAlign = 'left'; x.fillText('AS 21 PROVÍNCIAS', 18, 36);
    const P = [[.12, .12], [.3, .1], [.42, .18], [.55, .15], [.7, .14], [.78, .25], [.95, .3], [.95, .55], [.8, .58], [.82, .8], [.95, .95], [.55, .95], [.4, .88], [.1, .9], [.05, .8], [.1, .6], [.12, .45], [.08, .3]];
    const ox = 150, oy = 52, sw = 330, sh = 290; x.fillStyle = '#e9dcc0'; x.beginPath(); P.forEach(([a, b], k) => k ? x.lineTo(ox + a * sw, oy + b * sh) : x.moveTo(ox + a * sw, oy + b * sh)); x.closePath(); x.fill();
    x.fillStyle = '#e9dcc0'; x.fillRect(ox + .02 * sw, oy - .04 * sh, 18, 16);
    const POS = { Cabinda: [.06, .0], Zaire: [.13, .13], 'Uíge': [.33, .14], Bengo: [.2, .22], Luanda: [.1, .29], 'Ícolo e Bengo': [.2, .34], 'Cuanza Norte': [.33, .28], Malanje: [.47, .28], 'Lunda Norte': [.7, .2], 'Lunda Sul': [.72, .38], 'Cuanza Sul': [.2, .44], Benguela: [.12, .56], Huambo: [.3, .54], 'Bié': [.45, .5], Moxico: [.63, .56], 'Moxico Leste': [.86, .46], Namibe: [.06, .76], 'Huíla': [.24, .7], Cunene: [.3, .87], Cubango: [.5, .78], Cuando: [.76, .8] };
    const COR = { rica: '#9b59d0', media: '#3fa9d8', pobre: '#a3482a' };
    x.font = '700 11px system-ui,Arial';
    PROVINCIAS.forEach(p => { const q = POS[p.n]; if (!q) return; const X = ox + q[0] * sw, Y = oy + q[1] * sh, r = 3 + p.custo * 6; x.fillStyle = COR[nivelCidade(p)]; x.beginPath(); x.arc(X, Y, r, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); x.fillStyle = '#1a1a1a'; x.fillText(p.n, X + r + 2, Y + 4); });
    [['rica', 'Rica · cara'], ['media', 'Média'], ['pobre', 'Pobre · barata']].forEach(([k, t], i) => { const Y = 80 + i * 34; x.fillStyle = COR[k]; x.beginPath(); x.arc(28, Y, 10, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = '700 16px system-ui,Arial'; x.fillText(t, 46, Y + 6); });
  },
  board: (x, w, h) => { x.fillStyle = '#1f4a34'; x.fillRect(0, 0, w, h); ivNoise(x, w, h, 900, .05); x.fillStyle = 'rgba(255,255,255,.88)'; x.font = '700 30px "Comic Sans MS",system-ui'; x.fillText('Exame de Acesso 2026', 30, 52); x.font = '600 24px "Comic Sans MS",system-ui'; x.fillText('f(x) = 2x² − 3x + 1', 40, 100); x.fillText('Δ = b² − 4ac = 1', 40, 140); x.fillText('x = (3 ± 1) / 4', 40, 180); x.fillText('Luanda → capital de Angola', 290, 110); x.fillText('11 de Novembro de 1975', 300, 160); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 2; x.beginPath(); x.moveTo(330, 210); x.lineTo(330, 140 + 100); x.stroke(); },
  vagas: (x, w, h) => { x.fillStyle = '#b8895a'; x.fillRect(0, 0, w, h); ivNoise(x, w, h, 1500, .12); const cs = ['#fff7a8', '#ffffff', '#ffd1dc', '#c8f0ff', '#d6ffc8']; const jobs = ['CAIXA', 'MOTORISTA', 'VENDEDOR', 'ENFERMEIRO', 'PROGRAMADOR', 'PROFESSOR', 'SEGURANÇA', 'COZINHEIRO', 'CONTABILISTA', 'ELECTRICISTA', 'GESTOR', 'RECEPCIONISTA']; for (let i = 0; i < 12; i++) { const X = 16 + (i % 6) * 82 + Math.random() * 6, Y = 20 + Math.floor(i / 6) * 110 + Math.random() * 8; x.save(); x.translate(X + 34, Y + 40); x.rotate((Math.random() - .5) * .15); x.fillStyle = cs[i % 5]; x.fillRect(-34, -40, 68, 82); x.fillStyle = '#c8102e'; x.beginPath(); x.arc(0, -34, 4, 0, 7); x.fill(); x.fillStyle = '#222'; x.font = '900 10px system-ui'; x.textAlign = 'center'; x.fillText(jobs[i], 0, -14); x.fillStyle = '#777'; for (let l = 0; l < 4; l++) x.fillRect(-24, -2 + l * 9, 48 - (l % 2) * 14, 3); x.restore(); } },
  blueprint: (x, w, h) => { x.fillStyle = '#1b4f8a'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 1; for (let i = 0; i < w; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j < h; j += 16) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } x.strokeStyle = '#e8f4ff'; x.lineWidth = 3; x.strokeRect(40, 30, 200, 130); x.strokeRect(60, 50, 70, 50); x.strokeRect(150, 50, 70, 90); x.beginPath(); x.moveTo(40, 110); x.lineTo(130, 110); x.stroke(); x.strokeRect(290, 40, 180, 170); x.beginPath(); x.moveTo(290, 125); x.lineTo(470, 125); x.moveTo(380, 40); x.lineTo(380, 210); x.stroke(); x.fillStyle = '#e8f4ff'; x.font = '700 14px system-ui'; x.fillText('PLANTA — PRÉDIO T3', 300, 232); x.fillText('ESC 1:100', 50, 190); },
  gantt: (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#222'; x.font = '900 18px system-ui'; x.fillText('CRONOGRAMA DA OBRA', 16, 28); const t = ['Terreno', 'Fundações', 'Estrutura', 'Alvenaria', 'Acabamentos', 'Entrega']; const c = ['#c8102e', '#ff7a1a', '#e8b923', '#2e8b57', '#1f63c9', '#7a3a8a']; t.forEach((s, i) => { x.fillStyle = '#444'; x.font = '600 13px system-ui'; x.fillText(s, 16, 60 + i * 28); x.fillStyle = c[i]; x.fillRect(110 + i * 36, 48 + i * 28, 90 + (i % 2) * 30, 16); }); },
  stained: (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); const cs = ['#c8102e', '#1f63c9', '#ffcb00', '#2e8b57', '#7a3a8a', '#ff7a1a', '#14b8a6']; for (let i = 0; i < 9; i++) for (let j = 0; j < 14; j++) { x.fillStyle = cs[(i * 3 + j * 5) % cs.length]; x.beginPath(); x.moveTo(i * 15 + 2, j * 18 + 2); x.lineTo(i * 15 + 13 + (j % 2) * 3, j * 18 + 3); x.lineTo(i * 15 + 12, j * 18 + 16); x.lineTo(i * 15 + 3 - (j % 2) * 2, j * 18 + 15); x.fill(); } x.fillStyle = '#fff3c0'; x.fillRect(w / 2 - 5, 40, 10, 150); x.fillRect(w / 2 - 34, 80, 68, 10); },
  rose: (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); const cs = ['#c8102e', '#1f63c9', '#ffcb00', '#2e8b57', '#7a3a8a']; for (let r = 5; r > 0; r--) for (let k = 0; k < 16; k++) { x.fillStyle = cs[(k + r) % cs.length]; x.beginPath(); x.moveTo(w / 2, h / 2); x.arc(w / 2, h / 2, r * 24, k * Math.PI / 8 + .03, (k + 1) * Math.PI / 8 - .03); x.fill(); } x.fillStyle = '#fff3c0'; x.beginPath(); x.arc(w / 2, h / 2, 16, 0, 7); x.fill(); },
  led: (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); ['#ff2fa0', '#8a4dff', '#39e6d0', '#ffcb00', '#ff2fa0'].forEach((c, i) => g.addColorStop(i / 4, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.55)'; for (let i = 0; i < w; i += 8) x.fillRect(i, 0, 2, h); for (let j = 0; j < h; j += 8) x.fillRect(0, j, w, 2); x.fillStyle = '#fff'; x.font = '900 46px system-ui'; x.textAlign = 'center'; x.fillText('KIZOMBA NIGHT', w / 2, h / 2 + 16); },
  monitor: (x, w, h) => { x.fillStyle = '#06130c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#39ff8a'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, h / 2); for (let i = 0; i < w; i += 4) { const k = i % 64; x.lineTo(i, h / 2 - (k === 20 ? 40 : k === 24 ? -24 : k === 28 ? 10 : 0)); } x.stroke(); x.fillStyle = '#39ff8a'; x.font = '700 18px monospace'; x.fillText('72 bpm', 8, 22); },
  senha: (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff3b30'; x.font = '900 40px monospace'; x.textAlign = 'center'; x.fillText('SENHA  A042', w / 2, 58); x.fillStyle = '#ffcb00'; x.font = '700 20px monospace'; x.fillText('BALCÃO 2', w / 2, 88); },
  tally: (x, w, h) => { x.fillStyle = '#8a877f'; x.fillRect(0, 0, w, h); ivNoise(x, w, h, 2500, .14); x.strokeStyle = 'rgba(30,30,30,.55)'; x.lineWidth = 3; for (let g = 0; g < 7; g++) { const X = 20 + g * 34; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(X + i * 6, 40); x.lineTo(X + i * 6, 80); x.stroke(); } x.beginPath(); x.moveTo(X - 4, 70); x.lineTo(X + 24, 48); x.stroke(); } x.fillStyle = 'rgba(60,40,20,.25)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(Math.random() * w, 100 + Math.random() * 150, 20 + Math.random() * 30, 0, 7); x.fill(); } },
};

/* =========================================================
   AS SALAS
   ========================================================= */
const IV_ROOMS = {
  empresa(D) {
    ivRoom(D, { w: 22, d: 14, h: 5.4, ftex: ivFloorTex('marble', '#f1ede6', '#cfc8bb'), frep: 5, fr: .2, fm: .1, wall: '#ebe6dc', trim: '#2a2a2a', bg: '#101820', door: '#2a2a2a', doorFrame: '#111' });
    ivGlassWall(D, 'city');
    IVP = D.left; ivB(.06, 5.4, 14, '#5a3a24', -10.97, 0, 0, { roughness: .5 }); for (let i = -6; i <= 6; i += 1.2) ivB(.04, 5.4, .04, '#3a2414', -10.92, 0, i);
    ivSign('TORRE EMPRESARIAL', 6, '#0d1a26', '#ffcb00', 'NEGÓCIOS · EMPRESAS · IMPÉRIO', -10.9, 3.1, -1.5, Math.PI / 2);
    IVP = D.right; [-3.2, .8].forEach(z => { ivB(.08, 3, 2.1, '#222', 10.94, 0, z); [-1, 1].forEach(s => ivB(.04, 2.8, .98, '#b8bcc2', 10.88, 0, z + s * .5, { metalness: .85, roughness: .25 })); ivPlane(.5, .16, ivGlow('#ff9a3c', 1), 10.9, 3.25, z, -Math.PI / 2); });
    ivArt(10.9, 1.6, 4, -Math.PI / 2, 1.8, 1.3, 'abstract', '#111');
    IVP = D.st;
    // recepção (Carreira / RH)
    ivCounter(-2.5, -2.1, 4.6, 1, 1.1, '#f6f4f0', '#1a1a1a'); ivB(4.6, .12, .03, '#c9a227', -2.5, .7, -1.58, { metalness: .8, roughness: .3 }); ivCol(D, -2.5, -2.1, 4.8, 1.2);
    ivPC(-3.4, 1.1, -2.3, 0); ivB(.3, .3, .3, '#e8b923', -1.2, 1.1, -2.3, { metalness: .7 });
    // gabinete do império (CEO)
    ivTable(6.2, -4.6, 3.2, 1.3, .8, '#3a2414'); ivB(3, .7, .06, '#2a1a10', 6.2, .02, -4.0); ivCol(D, 6.2, -4.6, 3.4, 1.5);
    ivLaptop(5.6, .8, -4.6, 0); ivB(.24, .9, .24, '#9ad0ff', 7.2, .8, -4.7, { metalness: .5, roughness: .1 }); ivB(.12, .4, .12, '#c9a227', 7.2, 1.7, -4.7, { metalness: .8 });
    ivChair(6.2, -5.7, 0, '#111'); ivRug(6.2, -3.6, 5, 3.6, null, ivRugTex('#2a3a4a', '#c9a227', '#3d5468'));
    ivSofa(9.6, -2.2, -Math.PI / 2, '#1d1d1d', 2.4, '#c9a227'); ivCol(D, 9.6, -2.2, 1.1, 2.6);
    // escritório aberto (as tuas empresas)
    [[-9, -5.2], [-6.6, -5.2], [-9, -3], [-6.6, -3]].forEach(([x, z]) => { ivTable(x, z, 2, .9, .76, '#f4f2ee', '#888'); ivPC(x, .76, z - .15, 0); ivChair(x, z + .75, Math.PI, '#2a5aa8'); ivCol(D, x, z, 2.1, 1); });
    ivB(4.9, 1.2, .06, '#9ab3c9', -7.8, 0, -4.1, { roughness: .2, metalness: .3 });
    // lounge
    ivSofa(4.4, 2.6, Math.PI, '#e8e2d6', 2.6, '#c9a227'); ivSofa(2.2, 1.2, Math.PI / 2, '#e8e2d6', 1.8); ivTable(4.4, 1.3, 1.6, .8, .42, '#1a1a1a'); ivRug(3.8, 1.6, 4.6, 3.2, null, ivRugTex('#efe9dc', '#2a2a2a', '#c9a227'));
    ivCol(D, 4.4, 2.6, 2.7, 1); ivCol(D, 2.2, 1.2, 1, 1.9); ivCol(D, 4.4, 1.3, 1.7, .9);
    ivPlant(1.2, -5.9, 1.6); ivPlant(-10.3, 5.6, 1.1); ivPlant(10.2, 5.6, 1.1); ivPlant(-4.9, -2.1, 1); ivCooler(10.3, -5.9);
    ivLights(D, { hi: .75, ki: .7, points: [[-2.5, 4.2, -.5, '#fff1d0', .7, 12], [6, 4.2, -3, '#fff1d0', .6, 10]] });
    ivStation(D, { x: -2.5, z: -.7, ry: Math.PI, tab: 'car', ico: '📈', label: 'Recursos Humanos · Carreira', hit: [-2.5, -2.1, 4.6, 1.2, 1.6] });
    ivStation(D, { x: -7.8, z: -1.2, ry: Math.PI, tab: 'neg', ico: '🏪', label: 'As Tuas Empresas', hit: [-7.8, -4.1, 4.6, 3.4, 1.8] });
    ivStation(D, { x: 6.2, z: -3.2, ry: Math.PI, tab: 'imp', ico: '👑', label: 'Gabinete do Império', hit: [6.2, -4.6, 3.3, 1.5, 1.8] });
    ivNPC(D, -2.5, -3, 0, { fem: true, cfg: { shirt: '#1d2a3a', pants: '#1d1d1d' } });
    ivNPC(D, 7.4, -3.4, -.4, { cfg: { shirt: '#f2f2f2', pants: '#1d2a3a' }, mode: 'think' });
    [[-9, -4.5], [-6.6, -4.5], [-9, -2.3], [-6.6, -2.3]].forEach(([x, z], i) => { if (i !== 2) ivNPC(D, x, z, Math.PI, { mode: 'work', cfg: { shirt: pick(['#f2f2f2', '#9cc8e8', '#1d2a3a', '#e8d4b8']) } }); });
    ivNPC(D, -1, 4, 0, { mode: 'walk', a: [-1, 4], b: [7.5, 4.6], cfg: { shirt: '#2a3a4a', pants: '#1a1a1a' } });
  },
  banco(D) {
    ivRoom(D, { w: 20, d: 13, h: 5.6, ftex: ivFloorTex('diag', '#efe7d6', '#c9b48a'), frep: 4, fr: .25, fm: .05, wall: '#f2ebdc', wains: '#1f3a5c', wainsH: 1.3, trim: '#c9a227', bg: '#0d1622', door: '#1f3a5c' });
    IVP = D.back; ivSign('BANCO PALANCA', 7, '#0d2a4a', '#ffcb00', 'CONTA · CRÉDITO · POUPANÇA', -3.5, 4.1, -6.45);
    for (let x = -9; x <= 9; x += 3) ivB(.3, 5.6, .12, '#c9a227', x, 0, -6.44, { metalness: .6, roughness: .35 });
    ivClock(4.5, 4.4, -6.45, 0);
    IVP = D.left; [-1.6, 1].forEach(z => { ivB(.6, 1.7, .8, '#2a2a2a', -9.65, 0, z); ivPlane(.4, .3, ivGlow('#39a0ff', .9), -9.34, 1.3, z, Math.PI / 2); ivB(.3, .2, .6, '#ffcb00', -9.6, 1.75, z); });
    ivSign('PALANCA ATM', 2.2, '#0d2a4a', '#ffcb00', '', -9.95, 2.4, -.3, Math.PI / 2);
    ivWindow(D, 'right', -2.5, 1.6, 2.6, 2.6, 'city', '#c9a227'); ivWindow(D, 'right', 2.2, 1.6, 2.6, 2.6, 'city', '#c9a227');
    IVP = D.st;
    // balcões
    ivCounter(-3.5, -5.1, 10, 1, 1.15, '#6b4423', '#efe7d6'); ivCol(D, -3.5, -5.1, 10.2, 1.2);
    const glass = new T.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: .22, roughness: .05, metalness: .2 });
    for (let i = 0; i <= 3; i++) ivB(.05, 1.2, .9, '#c9a227', -8.5 + i * 3.33, 1.15, -5.1, { metalness: .7 });
    ivB(10, 1.15, .03, glass, -3.5, 1.15, -4.7, null, false);
    [-6.8, -3.5, -.2].forEach((x, i) => { ivPC(x - .4, 1.15, -5.3, 0); const n = ctex(64, 64, g => { g.fillStyle = '#ffcb00'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#111'; g.font = '900 44px system-ui'; g.textAlign = 'center'; g.fillText(String(i + 1), 32, 48); }); ivPlane(.3, .3, new T.MeshStandardMaterial({ map: n }), x, 2.6, -4.68); });
    // fila
    for (let i = 0; i < 4; i++) { ivC(.05, .05, .95, '#c9a227', -5.2 + i * 1.2, 0, -2.4, 10, { metalness: .8 }); ivS(.08, mat('#c9a227', { metalness: .8 }), -5.2 + i * 1.2, .98, -2.4); if (i < 3) ivB(1.1, .05, .05, '#9a1020', -4.6 + i * 1.2, .82, -2.4); }
    // imobiliária
    ivTable(6.6, -4.6, 2.6, 1.1, .78, '#3a2414'); ivCol(D, 6.6, -4.6, 2.8, 1.3); ivChair(6.6, -5.5, 0, '#1f3a5c'); ivLaptop(6, .78, -4.6);
    [[6.9, '#f4f1ea'], [7.5, '#e8c27a']].forEach(([x, c]) => { ivB(.3, .25, .3, c, x, .78, -4.6); const r = mesh(new T.ConeGeometry(.26, .2, 4), mat('#a3482a'), x, 1.13, -4.6, IVP); r.rotation.y = Math.PI / 4; });
    ivB(1.6, .9, 1.6, '#f4f1ea', 8.2, 0, -1.6); ivCol(D, 8.2, -1.6, 1.7, 1.7);
    [[7.8, -2, .9], [8.5, -1.3, 1.6], [8.6, -2.1, .6]].forEach(([x, z, h]) => ivB(.4, h, .4, '#9ab3c9', x, .9, z, { metalness: .4, roughness: .2 }));
    // caixas multibanco
    [-6.4, -5.2, -4].forEach(x => { ivB(.9, 1.7, .6, '#0d2a4a', x, 0, 4.6); ivB(.6, .4, .05, ivGlow('#5fd1ff', 1), x, 1.25, 4.29); ivB(.5, .12, .06, '#ffcb00', x, 1.62, 4.29); ivB(.3, .04, .1, '#222', x, .95, 4.25); });
    ivB(4, .02, 1.6, '#e9e2d0', -5.2, .005, 3.6); ivCol(D, -5.2, 4.6, 3.8, .8);
    ivNPC(D, -6.4, 3.7, 0, { mode: 'think' });
    ivSofa(5, 3.6, Math.PI, '#1f3a5c', 2.4); ivCol(D, 5, 3.6, 2.5, 1);
    ivPlant(-9.2, -5.6, 1.3); ivPlant(9.3, 5.3, 1.1); ivPlant(2.6, -5.6, 1);
    ivLights(D, { hi: .7, ki: .75, points: [[-3.5, 4.6, -2.5, '#fff1d0', .7, 12], [-5.2, 4, 3, '#ffffff', .6, 9]] });
    ivStation(D, { x: -3.5, z: -3.6, ry: Math.PI, tab: 'c', ico: '🏦', label: 'Balcão · Conta & Crédito', hit: [-3.5, -5.1, 10, 1.2, 2] });
    ivStation(D, { x: 6.6, z: -3.2, ry: Math.PI, tab: 'c', ico: '🏦', label: 'Gerente · Empréstimos', hit: [6.8, -4, 3.4, 2.4, 1.6] });
    ivStation(D, { x: -5.2, z: 3.5, ry: 0, tab: 'c', ico: '💳', label: 'Caixa Multibanco', hit: [-5.2, 4.6, 3.8, .8, 1.8] });
    [-6.8, -3.5, -.2].forEach((x, i) => ivNPC(D, x, -5.95, 0, { fem: i === 1, cfg: { shirt: '#f2f2f2', pants: '#1f3a5c' } }));
    ivNPC(D, 6.6, -5.4, 0, { cfg: { shirt: '#1f3a5c' } });
    ivNPC(D, -4.6, -1.7, Math.PI, {}); ivNPC(D, -3.4, -1.75, Math.PI, { mode: 'think' });
    ivNPC(D, 5, 3.6, Math.PI, { mode: 'sit', seat: .48 });
  },
  emprego(D) {
    ivRoom(D, { w: 18, d: 12, h: 4.6, ftex: ivFloorTex('tile', '#dfe4ea', '#bfc8d2'), frep: 3, fr: .35, wall: '#eef2f6', wains: '#2b5d8a', trim: '#1d3d5c', bg: '#0e1622', door: '#2b5d8a' });
    IVP = D.back; [['#c8102e', 3.55], ['#1d1d1d', 3.42]].forEach(([c, y]) => ivB(18, .13, .03, c, 0, y, -5.98)); ivB(18, .04, .035, '#ffcb00', 0, 3.48, -5.97);
    ivPlane(5.2, 2.4, ivCanvas('vagas', 512, 240, ivDraw.vagas), -3, 2.3, -5.97); ivB(5.4, 2.6, .05, '#6b4423', -3, 1, -6);
    ivSign('VAGAS DE EMPREGO', 4, '#2b5d8a', '#fff', '', -3, 3.95, -5.96);
    ivPlane(1.8, .6, ivCanvasGlow('senha', 256, 100, ivDraw.senha, 1), 4.8, 3.2, -5.96);
    ivClock(7.6, 3.6, -5.97, 0);
    IVP = D.right; ivWindow(D, 'right', -2.6, 1.4, 2.4, 2.2, 'city'); ivWindow(D, 'right', 1.6, 1.4, 2.4, 2.2, 'city');
    IVP = D.left; ivArt(-8.95, 1.7, -3.4, Math.PI / 2, 1.4, 1, 'mapa', '#1d3d5c');
    IVP = D.st;
    ivCounter(4.8, -3.6, 5, 1, 1.05, '#2b5d8a', '#f4f4f4'); ivCol(D, 4.8, -3.6, 5.2, 1.2); ivPC(3.6, 1.05, -3.8); ivPC(6, 1.05, -3.8);
    [-1.2, .8].forEach(z => { ivTable(-8, z, .9, 1.4, .76, '#f4f4f4', '#888'); ivPC(-8.1, .76, z, Math.PI / 2); ivChair(-7.2, z, -Math.PI / 2, '#2b5d8a'); ivCol(D, -8, z, 1, 1.5); });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -1.6 + c * .75 + (c > 1 ? .5 : 0), z = .4 + r * 1.35; ivChair(x, z, Math.PI, ['#c8102e', '#2b5d8a', '#ffcb00'][r]); }
    ivCol(D, .05, 1.75, 3.9, 3.4);
    ivCooler(8.4, -5.3); ivPlant(-8.3, -5.3, 1.2); ivPlant(8.3, 5.2, 1);
    ivLights(D, { hi: .78, ki: .7, points: [[0, 4, -1, '#f2f6ff', .5, 12]] });
    ivStation(D, { x: 4.8, z: -2.2, ry: Math.PI, tab: 'eu', ico: '💼', label: 'Atendimento · Trabalho', hit: [4.8, -3.6, 5, 1.2, 1.5] });
    ivStation(D, { x: -3, z: -4.5, ry: Math.PI, tab: 'vagas', ico: '📋', label: 'Quadro de Vagas', hit: [-3, -5.7, 5.2, .6, 3.2] });
    ivStation(D, { x: -6.5, z: -.2, ry: -Math.PI / 2, tab: 'cv', ico: '📄', label: 'Computadores · Currículo', hit: [-8, -.2, 1.2, 3, 1.4] });
    ivNPC(D, 3.6, -4.5, 0, { fem: true, cfg: { shirt: '#f2f2f2', pants: '#2b5d8a' } }); ivNPC(D, 6, -4.5, 0, { fem: false, cfg: { shirt: '#f2f2f2', pants: '#2b5d8a' } });
    ivNPC(D, -1.6, -4.6, Math.PI, { mode: 'think' });
    [[-1.6, .4], [.65, .4], [-.85, 1.75], [1.4, 3.1], [-1.6, 3.1]].forEach(([x, z]) => ivNPC(D, x, z, Math.PI, { mode: 'sit' }));
    ivNPC(D, -7.2, .8, -Math.PI / 2, { mode: 'work' });
  },
  escola(D) {
    ivRoom(D, { w: 20, d: 14, h: 5, ftex: ivFloorTex('wood', '#b07a4a', '#000'), frep: 4, fr: .6, wall: '#f3ead6', wains: '#3f6e4a', trim: '#2a4a32', bg: '#161a12', door: '#6b4423' });
    IVP = D.back; ivB(7.4, 2.6, .06, '#7a5236', 0, 1, -6.98); ivPlane(7, 2.3, ivCanvas('quadro', 512, 240, ivDraw.board), 0, 2.3, -6.94); ivB(7, .08, .16, '#7a5236', 0, 1, -6.9);
    ivArt(-6.4, 3.2, -6.97, 0, 1.5, 1, 'angola', '#3a2a1a'); ivClock(4.6, 3.9, -6.97, 0);
    ivWindow(D, 'back', -6.4, 1.1, 2.2, 1.7, 'city'); ivWindow(D, 'back', 7, 1.1, 2.6, 2.4, 'city');
    IVP = D.right; ivArt(9.95, 2, -4.2, -Math.PI / 2, 1.8, 1.2, 'mapa', '#3a2a1a');
    ivSign('CARTA DE CONDUÇÃO', 2.6, '#c8102e', '#fff', 'ESCOLA DE CONDUÇÃO', 9.95, 3.6, -.6, -Math.PI / 2);
    IVP = D.st;
    ivTable(0, -5.3, 2.4, 1, .8, '#6b4423'); ivCol(D, 0, -5.3, 2.6, 1.2); ivS(.22, mat('#3a7ac8'), .8, 1.1, -5.3); ivC(.03, .05, .1, '#c9a227', .8, .8, -5.3); ivB(.5, .08, .35, '#c8102e', -.6, .8, -5.3);
    for (const x of [-4, -2.6, 2.6, 4]) for (const z of [-2.4, -.6, 1.2]) { ivTable(x, z, 1, .55, .74, '#c9a46a', '#555'); ivChair(x, z + .55, Math.PI, '#2a4a32'); ivCol(D, x, z + .2, 1.1, 1.1); }
    [-5, -3, -1].forEach(z => ivShelf(-9.75, z, Math.PI / 2, 1.9, 2.4)); ivCol(D, -9.6, -3, .6, 6);
    ivTable(8.9, -2.6, 1.1, 3, .9, '#8a8a8a', '#444'); ivCol(D, 8.9, -2.6, 1.3, 3.2);
    ivB(.5, .3, .3, '#c8102e', 8.9, .9, -3.6); ivB(.25, .2, .25, '#555', 8.9, .9, -2.6, { metalness: .6 });
    { const st = ivC(.28, .28, .06, '#222', 8.8, 1.1, -1.7, 18); st.rotation.x = Math.PI / 2.4; }
    ivB(.08, 2, .08, '#888', 8.6, 0, 1.8); { const s = ivC(.35, .35, .04, '#c8102e', 8.6, 2, 1.8, 8); s.rotation.x = Math.PI / 2; s.rotation.z = Math.PI / 8; }
    ivPlant(9.2, -6.3, 1.2); ivPlant(-9.2, 6, 1);
    ivLights(D, { hi: .78, ki: .75, points: [[0, 4, -2, '#fff6e0', .55, 12]] });
    ivStation(D, { x: 0, z: -4.1, ry: Math.PI, tab: 'uni', ico: '🏛️', label: 'Universidades · Guia', hit: [0, -5.6, 3, 1.6, 1.4] });
    ivStation(D, { x: -8, z: -3, ry: -Math.PI / 2, tab: 'est', ico: '📚', label: 'Biblioteca · Estudos', hit: [-9.6, -3, .8, 6, 2.4] });
    ivStation(D, { x: 7.4, z: -2.6, ry: Math.PI / 2, tab: 'tec', ico: '🛠️', label: 'Cursos Técnicos & Carta', hit: [8.9, -2.6, 1.3, 3.2, 1.4] });
    ivNPC(D, -1.8, -6.1, .3, { cfg: { shirt: '#6b4423', pants: '#3a2a1a' }, mode: 'think' });
    let k = 0; for (const x of [-4, -2.6, 2.6, 4]) for (const z of [-2.4, -.6, 1.2]) if ((k++ % 3) !== 1) ivNPC(D, x, z + .55, Math.PI, { mode: 'sit', cfg: { shirt: '#f2f2f2', pants: pick(['#2b3a55', '#1a1a1a']) } });
    ivNPC(D, -8.1, -5, -Math.PI / 2, { mode: 'think' });
  },
  clinica(D) {
    ivRoom(D, { w: 18, d: 12, h: 4.6, ftex: ivFloorTex('tile', '#eef3f4', '#dbe6ea'), frep: 3, fr: .3, wall: '#f8fcfc', wains: '#7cc4b0', trim: '#4a9a86', bg: '#0e1a18', door: '#4a9a86' });
    IVP = D.back; [[2.2, .6], [.6, 2.2]].forEach(([w, h]) => ivB(w, h, .06, ivGlow('#e8102e', .8), 0, 2.9 - h / 2 + .3, -5.95));
    ivSign('CLÍNICA BEM-ESTAR', 4.2, '#ffffff', '#c8102e', 'URGÊNCIAS 24H', 0, 4, -5.95);
    ivWindow(D, 'back', -6, 1.3, 2.6, 2.2, 'city');
    IVP = D.left; ivPlane(1.2, 1.6, ivCanvas('vacina', 128, 170, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#2e8b57'; x.fillRect(0, 0, w, 40); x.fillStyle = '#fff'; x.font = '900 20px system-ui'; x.textAlign = 'center'; x.fillText('VACINA-TE', w / 2, 28); x.fillStyle = '#c8102e'; x.fillRect(w / 2 - 10, 60, 20, 60); x.fillRect(w / 2 - 30, 80, 60, 20); x.fillStyle = '#333'; x.font = '700 12px system-ui'; x.fillText('Protege a tua família', w / 2, 150); }), -8.96, 2.2, -2.6, Math.PI / 2);
    IVP = D.st;
    ivCounter(0, -3.8, 4.4, 1.1, 1.08, '#ffffff', '#4a9a86'); ivCol(D, 0, -3.8, 4.6, 1.3); ivPC(-1, 1.08, -4, 0);
    [-3.6, -.6].forEach(z => { ivBed(7.6, z, -Math.PI / 2, '#7cc4f0', false, '#d8dde0'); ivCol(D, 7.6, z, 2.2, 1.2); ivB(.04, 2.2, 1.6, new T.MeshStandardMaterial({ color: '#bfe3f0', roughness: 1, side: T.DoubleSide }), 6.2, .3, z - 1.1); });
    ivB(.4, 1.4, .4, '#ccc', 8.6, 0, 1.6); ivPlane(.5, .34, ivCanvasGlow('monit', 128, 80, ivDraw.monitor, 1), 8.6, 1.7, 1.81);
    ivB(1.6, 2.2, .5, '#f4f4f4', -6.2, 0, -5.6); ivB(1.5, 1.2, .02, new T.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: .35 }), -6.2, .9, -5.34, null, false);
    for (let i = 0; i < 8; i++) ivB(.2, .14, .14, pick(['#c8102e', '#1f63c9', '#ffcb00', '#f2f2f2']), -6.8 + (i % 4) * .4, 1 + Math.floor(i / 4) * .55, -5.5, null, false);
    ivCol(D, -6.2, -5.6, 1.7, .6);
    for (let i = 0; i < 5; i++) ivChair(-8.3, -2.2 + i * .75, Math.PI / 2, '#4a9a86'); ivCol(D, -8.3, -.7, .7, 3.9);
    ivPlant(-8.2, 4.8, 1.1); ivPlant(3.4, -5.4, 1); ivCooler(-3.4, -5.6);
    ivLights(D, { hi: .85, ki: .7, sky: '#f4fbff', points: [[0, 4, -1, '#f2fbff', .5, 12]] });
    ivStation(D, { x: 0, z: -2.4, ry: Math.PI, tab: null, ico: '🩺', label: 'Recepção · Consultas', hit: [0, -3.8, 4.4, 1.3, 1.6] });
    ivNPC(D, 0, -4.7, 0, { fem: true, cfg: { shirt: '#ffffff', pants: '#7cc4b0' } });
    ivNPC(D, 6.2, -2, -Math.PI / 2, { cfg: { shirt: '#ffffff', pants: '#ffffff' }, mode: 'think' });
    ivNPC(D, -8.3, -1.45, Math.PI / 2, { mode: 'sit' }); ivNPC(D, -8.3, .8, Math.PI / 2, { mode: 'sit', fem: true });
  },
  igreja(D) {
    ivRoom(D, { w: 16, d: 22, h: 8, ftex: ivFloorTex('tile', '#ddd5c4', '#c8bea8'), frep: 3, fr: .5, wall: '#f6f1e6', wains: '#c9b48a', wainsH: 1.3, trim: '#b08a4a', bg: '#141018', dist: 21, door: '#6b4423' });
    IVP = D.back; ivB(.5, 3.4, .14, mat('#d9b24a', { metalness: .7, roughness: .3 }), 0, 3.2, -10.9); ivB(2, .5, .14, mat('#d9b24a', { metalness: .7, roughness: .3 }), 0, 5.2, -10.9);
    ivPlane(2.6, 2.6, ivCanvasGlow('rose', 256, 256, ivDraw.rose, .9), 0, 7.2 - 1.4, -10.96); ivB(2.8, 2.8, .04, '#b08a4a', 0, 4.45, -10.99);
    [-4.5, 4.5].forEach(x => { ivPlane(1.3, 3.2, ivCanvasGlow('stained', 140, 260, ivDraw.stained, .85), x, 4.6, -10.96); ivB(1.5, 3.4, .04, '#b08a4a', x, 2.9, -10.99); });
    IVP = D.left; [-6, -1, 4].forEach(z => { ivPlane(1.2, 3, ivCanvasGlow('stained', 140, 260, ivDraw.stained, .8), -7.96, 4.5, z, Math.PI / 2); });
    IVP = D.right; [-6, -1, 4].forEach(z => { ivPlane(1.2, 3, ivCanvasGlow('stained', 140, 260, ivDraw.stained, .8), 7.96, 4.5, z, -Math.PI / 2); });
    IVP = D.st;
    ivB(9, .35, 4, '#e9e1cf', 0, 0, -9); ivB(9, .18, .5, '#e9e1cf', 0, 0, -6.8); ivCol(D, 0, -9, 9, 4);
    ivB(3, 1, 1.1, '#f8f6f0', 0, .35, -9.4); ivB(3.1, .06, 1.2, '#d9b24a', 0, 1.35, -9.4, { metalness: .6 });
    [-1.2, 1.2].forEach(x => { ivC(.05, .06, .5, '#f8f6f0', x, 1.38, -9.4, 8); ivS(.06, ivGlow('#ffb040', 2.4), x, 1.95, -9.4); });
    ivRug(0, .5, 2.2, 19, '#8a1a2a');
    for (let z = -4.6; z <= 8.5; z += 1.9) [-3.8, 3.8].forEach(x => { ivB(4.6, .1, .55, '#6b4423', x, .45, z); ivB(4.6, .7, .08, '#5a3a1e', x, .5, z + .3); [-1, 1].forEach(s => ivB(.08, .9, .6, '#4a2e18', x + s * 2.3, 0, z)); ivCol(D, x, z, 4.7, .8); });
    for (let z = -9; z <= 9; z += 4.5) [-7.3, 7.3].forEach(x => { ivB(.8, 8, .8, '#efe8d8', x, 0, z); ivB(1, .3, 1, '#c9b48a', x, 0, z); ivCol(D, x, z, .9, .9); });
    ivPlant(-3.6, -8.6, 1.2, '#c9a227'); ivPlant(3.6, -8.6, 1.2, '#c9a227');
    ivLights(D, { hi: .65, ki: .55, key: '#ffe6c0', points: [[0, 6, -8, '#ffd9a0', .8, 14], [0, 6, 2, '#fff1d6', .5, 14]] });
    ivStation(D, { x: 0, z: -6, ry: Math.PI, tab: null, ico: '⛪', label: 'Altar · Rezar', hit: [0, -9.4, 3.2, 1.4, 2], ly: 2 });
    ivNPC(D, 0, -10.2, 0, { cfg: { shirt: '#f8f6f0', pants: '#f8f6f0', skirt: null, shorts: false } });
    let k = 0; for (let z = -4.6; z <= 8.5; z += 1.9) [-3.8, 3.8].forEach(x => { if ((k++ % 3) === 0) ivNPC(D, x + (k % 2 ? -.8 : .9), z - .05, Math.PI, { mode: 'sit', seat: .5 }); });
    ivNPC(D, 2.6, -6.5, Math.PI, { mode: 'pray', fem: true });
  },
  ginasio(D) {
    ivRoom(D, { w: 20, d: 14, h: 5.6, ftex: ivFloorTex('rubber', '#2a2a2e', '#000'), frep: 2, fr: .9, wall: '#e8e8e8', wains: '#2a2f38', wainsH: 1.6, trim: '#ffcb00', bg: '#0e0e10', door: '#2a2f38' });
    IVP = D.back; ivB(11, 2.8, .04, new T.MeshStandardMaterial({ color: '#cfe3f0', metalness: .95, roughness: .06 }), -3, .3, -6.97);
    ivSign('SEM DOR, SEM GLÓRIA', 7, '#111', '#ffcb00', 'GINÁSIO · MUSCULAÇÃO · BOXE', -3, 3.9, -6.96);
    IVP = D.right; ivB(.06, 1.2, 1.8, '#f4f4f4', 9.95, 2.6, 2.4); ivB(.04, .5, .6, '#c8102e', 9.9, 2.75, 2.4); { const r = ivC(.25, .25, .03, '#ff6a00', 9.6, 3, 2.4, 16); r.rotation.z = Math.PI / 2; r.rotation.set(0, 0, 0); }
    ivWindow(D, 'right', -3.6, 2.6, 3, 1.8, 'city');
    IVP = D.st;
    [-8, -6.2, -4.4].forEach(x => { ivB(.9, .2, 2, '#1a1a1a', x, 0, -5.2); ivB(.06, 1.3, .06, '#888', x - .4, .2, -6); ivB(.06, 1.3, .06, '#888', x + .4, .2, -6); ivB(.9, .25, .2, '#333', x, 1.4, -6); ivPlane(.4, .14, ivGlow('#39e6d0', 1), x, 1.53, -5.89); ivCol(D, x, -5.3, 1, 2.2); });
    ivB(3, .9, .6, '#333', 1.5, 0, -6.4); for (let i = 0; i < 6; i++) [.25, .7].forEach(y => { const d = ivC(.12, .12, .3, '#111', .3 + i * .48, y + .2, -6.3, 10); d.rotation.z = Math.PI / 2; });
    ivCol(D, 1.5, -6.4, 3.1, .8);
    ivB(.6, .45, 1.6, '#c8102e', 1.8, 0, -3); ivB(.06, 1.4, .06, '#888', 1.3, 0, -3.6); ivB(.06, 1.4, .06, '#888', 2.3, 0, -3.6);
    { const bar = ivC(.03, .03, 2.2, '#bbb', 1.8, 1.25, -3.6, 8, { metalness: .8 }); bar.rotation.z = Math.PI / 2; bar.position.set(1.8, 1.3, -3.6); [-1, 1].forEach(s => { const p = ivC(.26, .26, .08, '#111', 1.8 + s * .9, 1.3, -3.6, 16); p.rotation.z = Math.PI / 2; p.position.set(1.8 + s * .9, 1.3, -3.6); }); }
    ivCol(D, 1.8, -3.1, 1.4, 1.9);
    ivB(.2, 4.4, .2, '#333', 8.6, 0, -4.8); ivB(.2, .2, 1.4, '#333', 8.6, 4.2, -4.2); ivC(.03, .03, .8, '#666', 8.6, 3.4, -3.6, 6); ivC(.32, .32, 1.3, '#8a1a1a', 8.6, 2.1, -3.6, 16); ivCol(D, 8.6, -4.2, .8, 1.6);
    ivB(5, .1, 5, '#1f63c9', -5.2, 0, 2.6); [0.6, 1.1, 1.6].forEach(y => [[-5.2, .1, 5.1, .05], [-5.2, 5.1, 5.1, .05]].forEach(([x, dz, w, d]) => ivB(w, .05, d, '#f2f2f2', x, y, dz))); [[-7.7, .1], [-2.7, .1], [-7.7, 5.1], [-2.7, 5.1]].forEach(([x, z]) => ivB(.18, 1.8, .18, '#c8102e', x, 0, z));
    ivCol(D, -5.2, 2.6, 5.2, 5.2);
    ivB(3, .02, .05, '#ffcb00', 4.5, .01, 2, null, false); ivB(.05, .02, 3, '#ffcb00', 3, .01, 3.5, null, false);
    ivLights(D, { hi: .7, ki: .7, sky: '#f4f8ff', points: [[0, 4.8, -2, '#f4f8ff', .6, 14]] });
    ivStation(D, { x: -1, z: -2.2, ry: Math.PI, tab: null, ico: '🏋️', label: 'Treinar', hit: [-1, -5, 6, 2.4, 1.8] });
    ivStation(D, { x: 6.6, z: 1.6, ry: Math.PI / 2, tab: null, ico: '🏀', label: 'Campo & Desporto', hit: [9.4, 2.4, 1, 2, 3.4] });
    [-8, -6.2].forEach(x => ivNPC(D, x, -5.2, Math.PI, { mode: 'jog', y: .2 }));
    ivNPC(D, 1.8, -2.1, Math.PI, { mode: 'train' }); ivNPC(D, 7.8, -3.2, -2.4, { mode: 'train' });
    ivNPC(D, -5.6, 2.2, .8, { mode: 'cheer', y: .1 }); ivNPC(D, -4.4, 3.2, -2.4, { mode: 'idle', y: .1 });
  },
  shopping(D) {
    ivRoom(D, { w: 22, d: 14, h: 5.2, ftex: ivFloorTex('marble', '#f6f6f4', '#e2e2de'), frep: 5, fr: .15, fm: .1, wall: '#efe9e0', trim: '#c9a227', bg: '#121014', door: '#2a2a2a' });
    IVP = D.back; ivSign('BOUTIQUE · MODA', 5, '#111', '#ffcb00', '', -5.5, 4.2, -6.96); ivSign('TECNOLOGIA', 5, '#0d2a4a', '#39e6d0', 'TELEMÓVEIS · PCS · CARROS', 6, 4.2, -6.96);
    ivB(22, .08, .05, ivGlow('#ffe9b0', 1), 0, 4.85, -6.96);
    for (let i = 0; i < 4; i++) { ivB(1.6, .06, .4, '#c9a227', -9 + i * 1.8, 1.2, -6.8); ivB(1.6, .06, .4, '#c9a227', -9 + i * 1.8, 2.2, -6.8); for (let k = 0; k < 4; k++) [1.26, 2.26].forEach(y => ivB(.34, .22, .3, pick(['#c8102e', '#1f63c9', '#f2f2f2', '#111', '#e8b923', '#2e8b57', '#c2185b']), -9.6 + i * 1.8 + k * .4, y, -6.78, null, false)); }
    IVP = D.st;
    [[-7.4, -2.2], [-4.2, -2.2]].forEach(([x, z]) => { ivB(.06, 1.7, .06, '#c9a227', x - 1.2, 0, z, { metalness: .8 }); ivB(.06, 1.7, .06, '#c9a227', x + 1.2, 0, z, { metalness: .8 }); ivC(.025, .025, 2.4, '#c9a227', x, 1.65, z, 6, { metalness: .8 }).rotation.z = Math.PI / 2;
      IVP.children[IVP.children.length - 1].position.set(x, 1.65, z); for (let i = 0; i < 9; i++) ivB(.05, .8, .5, pick(['#c8102e', '#1f63c9', '#f2f2f2', '#111', '#e8b923', '#2e8b57', '#c2185b', '#8a4dff', '#ff7a1a']), x - 1 + i * .25, .8, z, { roughness: 1 }, false); ivCol(D, x, z, 2.6, .7); });
    [-9.4, -1.6].forEach(x => { ivC(.5, .55, .2, '#f4f4f4', x, 0, -5.6, 24); ivCol(D, x, -5.6, 1, 1); });
    ivCounter(-1.6, 1.2, 1.8, .8, 1, '#111', '#c9a227'); ivCol(D, -1.6, 1.2, 1.9, .9);
    ivCounter(6, -5.4, 6, .9, 1.05, '#0d2a4a', '#f4f4f4'); ivCol(D, 6, -5.4, 6.2, 1.1);
    for (let i = 0; i < 6; i++) { ivB(.16, .3, .04, '#111', 3.6 + i * .5, 1.05, -5.2); ivPlane(.13, .26, ivGlow(pick(['#39a0ff', '#39e6d0', '#ff2fa0', '#ffcb00']), .9), 3.6 + i * .5, 1.2, -5.17); }
    ivLaptop(7.2, 1.05, -5.4); ivLaptop(8.1, 1.05, -5.4);
    const plat = new T.Group(); plat.position.set(6.6, 0, 2.2); D.dyn.add(plat);
    { const P0 = IVP; IVP = plat; ivC(2.4, 2.5, .22, '#f4f4f4', 0, 0, 0, 40, { roughness: .2 }); ivC(2.52, 2.52, .04, ivGlow('#39e6d0', 1.2), 0, .02, 0, 40); IVP = P0; }
    const car = carModel('#111'); car.position.y = .22; plat.add(car); D.spin.push(car); ivCol(D, 6.6, 2.2, 4.6, 4.6);
    ivB(2.4, .45, .8, '#c9a227', 1.4, 0, 4, { metalness: .5 }); ivCol(D, 1.4, 4, 2.4, .8); ivPlant(.2, -5.8, 1.5); ivPlant(10.2, -6, 1.1); ivPlant(-10.2, 5.5, 1.1);
    ivLights(D, { hi: .8, ki: .7, points: [[-5.5, 4.3, -2, '#fff1d6', .6, 12], [6, 4.3, -1, '#ffffff', .6, 12]] });
    ivStation(D, { x: -5.8, z: -.6, ry: Math.PI, tab: 'bout', ico: '🛍️', label: 'Loja de Roupa', hit: [-5.8, -2.4, 6, 3, 1.8] });
    ivStation(D, { x: 6, z: -3.9, ry: Math.PI, tab: 'loja', ico: '🚗', label: 'Stand & Tecnologia', hit: [6, -5.4, 6.2, 1.2, 1.5] });
    [-9.4, -1.6].forEach((x, i) => ivNPC(D, x, -5.6, .3, { mode: 'statue', y: .2, fem: i === 0, cfg: { skin: '#ebe6dc', hairColor: '#ebe6dc', shirt: i ? '#111' : '#c2185b' } }));
    ivNPC(D, -1.6, .4, Math.PI, { fem: true, cfg: { shirt: '#111' } }); ivNPC(D, 6, -6.2, 0, { cfg: { shirt: '#0d2a4a' } });
    ivNPC(D, -8, 1.2, 0, { mode: 'walk', a: [-8, 1.2], b: [-3, .6] }); ivNPC(D, 2.6, -2.5, 0, { mode: 'walk', a: [2.6, -2.5], b: [3, 3.8], fem: true });
  },
  farra(D) {
    ivRoom(D, { w: 20, d: 14, h: 6, ftex: ivFloorTex('dark', '#141018', '#1c1622'), frep: 2, fr: .2, fm: .3, wall: '#1a1424', trim: '#ff2fa0', bg: '#07050a', door: '#2a1a3a', doorFrame: '#ff2fa0' });
    IVP = D.back; const ledT = ivTex('led', 512, 128, ivDraw.led).clone(); ledT.needsUpdate = true; ledT.wrapS = T.RepeatWrapping; D.ledT = ledT;
    ivPlane(9, 2.4, new T.MeshBasicMaterial({ map: ledT, toneMapped: false }), 0, 3.4, -6.95);
    [-1, 1].forEach(s => { ivB(1.4, 2.6, 1, '#111', s * 6, 0, -6.2); [.7, 1.8].forEach(y => { const c = ivC(.4, .4, .05, '#333', s * 6, y, -5.68, 18); c.rotation.x = Math.PI / 2; c.position.set(s * 6, y, -5.68); }); ivCol(D, s * 6, -6.2, 1.5, 1.1); });
    IVP = D.left; ivNeon('KIZOMBA', -9.95, 3.4, -2, Math.PI / 2, '#ff2fa0', 5);
    IVP = D.right; ivNeon('KUDURO', 9.95, 4.4, 0, -Math.PI / 2, '#39e6d0', 4);
    IVP = D.back; ivB(20, .06, .06, ivGlow('#39e6d0', 2), 0, 5.6, -6.94); IVP = D.left; ivB(.06, .06, 14, ivGlow('#ff2fa0', 2), -9.94, 5.6, 0); IVP = D.right; ivB(.06, .06, 14, ivGlow('#8a4dff', 2), 9.94, 5.6, 0);
    IVP = D.st;
    ivCounter(0, -5.4, 3.4, 1, 1.1, '#111', '#ff2fa0'); ivCol(D, 0, -5.4, 3.6, 1.2);
    [-.8, .8].forEach(x => ivC(.3, .3, .06, '#333', x, 1.1, -5.4, 20)); ivLaptop(0, 1.1, -5.5);
    ivCounter(8.2, -1, 1, 6, 1.1, '#2a1a3a', '#39e6d0', 0); ivCol(D, 8.2, -1, 1.2, 6.2);
    ivB(.4, 2.2, 6, '#100c14', 9.75, 1, -1); for (let i = 0; i < 24; i++) ivC(.06, .06, .34, ivGlow(pick(['#ffcb00', '#39e6d0', '#ff2fa0', '#7cff6a', '#ff7a1a']), .9), 9.6, 1.2 + Math.floor(i / 12) * .7, -3.6 + (i % 12) * .45, 8);
    for (let i = 0; i < 5; i++) ivStool(7.2, -3.4 + i * 1.2, '#ff2fa0');
    D.tiles = [];
    const tg = new T.Group(); D.dyn.add(tg);
    for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) { const m = new T.MeshStandardMaterial({ color: '#222', emissive: '#ff2fa0', emissiveIntensity: .8, roughness: .3 }); const t = new T.Mesh(bx(1.04, .04, 1.04), m); t.position.set(-3.3 + i * 1.1, .02, -2.6 + j * 1.1); t.receiveShadow = true; tg.add(t); D.tiles.push({ m, i, j }); }
    ivLights(D, { hi: .3, ki: .25, sky: '#8a6aff', gnd: '#1a0a1a', points: [[-3, 4.5, -1, '#ff2fa0', 1.6, 12], [3, 4.5, -1, '#39e6d0', 1.6, 12], [7, 3.5, -1, '#ffcb00', .8, 8]] });
    ivStation(D, { x: 0, z: 2.6, ry: Math.PI, tab: null, ico: '💃', label: 'Pista de Dança', hit: [0, -.4, 7.6, 5.6, .6], ly: 2.2 });
    ivStation(D, { x: 6.2, z: 2.6, ry: Math.PI / 2, tab: null, ico: '🍺', label: 'Bar', hit: [8.2, -1, 1.2, 6, 1.4] });
    ivNPC(D, 0, -6.2, 0, { mode: 'dance', cfg: { shirt: '#111', hair: 'cap', capColor: '#ff2fa0' } });
    ivNPC(D, 9.2, -1, -Math.PI / 2, { cfg: { shirt: '#111' } });
    [[-2.4, -1.4], [-.6, -2], [1.4, -1.2], [2.6, .4], [-1.6, .6], [.6, .2]].forEach(([x, z], i) => ivNPC(D, x, z, (i * 1.3) % 6, { mode: 'dance', fem: i % 2 === 0 }));
    ivNPC(D, 7.1, -2.2, Math.PI / 2, { mode: 'sit', seat: .82 });
    D.tick = (dt, t) => {
      D.tiles.forEach(o => { const v = (Math.sin(t * 3 + o.i * .9 + o.j * 1.3) + 1) / 2, c = Math.floor((t * 1.5 + o.i + o.j) % 4); o.m.emissive.set(['#ff2fa0', '#39e6d0', '#ffcb00', '#8a4dff'][c]); o.m.emissiveIntensity = .2 + v * 1.1; });
      if (D.ledT) D.ledT.offset.x = (t * .08) % 1;
      if (D.lights[0]) { D.lights[0].position.x = Math.sin(t * .9) * 5; D.lights[1].position.x = -Math.sin(t * .9) * 5; D.lights[0].position.z = Math.cos(t * .7) * 3; }
    };
  },
  obras(D) {
    ivRoom(D, { w: 16, d: 11, h: 4.2, ftex: ivFloorTex('concrete', '#a09a92', '#000'), frep: 4, fr: .9, wall: '#d8b98a', wains: '#e8b923', wainsH: .9, trim: '#3a3a3a', bg: '#18140e', door: '#e8b923' });
    ivWindow(D, 'back', 2.5, 1.2, 4.4, 2.2, 'obra', '#3a3a3a');
    IVP = D.back; ivSign('SEGURANÇA', 3.6, '#e8b923', '#111', 'USA SEMPRE O CAPACETE', -4.4, 2.6, -5.47);
    IVP = D.left; ivPlane(2.6, 1.5, ivCanvas('gantt', 512, 256, ivDraw.gantt), -7.96, 2.1, -1.6, Math.PI / 2); ivB(.04, 1.6, 2.7, '#888', -7.99, 1.3, -1.6);
    for (let i = 0; i < 4; i++) { const h = mesh(new T.SphereGeometry(.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(i % 2 ? '#ffcb00' : '#f4f4f4'), -7.8, 1.85, -4.8 + i * .5, IVP); }
    ivB(.3, .05, 2.2, '#6b4423', -7.85, 1.8, -4.05);
    IVP = D.st;
    ivTable(0, -1.8, 4, 2.2, .9, '#6b4423'); ivCol(D, 0, -1.8, 4.2, 2.4);
    ivPlane(3.8, 2, new T.MeshStandardMaterial({ map: ivTex('blue', 512, 256, ivDraw.blueprint), roughness: .9 }), 0, .91, -1.8, 0, -Math.PI / 2);
    [[-1.2, -2.2, .5, .9, '#f4f4f4'], [-.6, -2.4, .4, 1.4, '#9ab3c9'], [.1, -1.6, .6, .5, '#e8c27a'], [.9, -2.3, .5, 2, '#cfe0ee'], [1.4, -1.4, .4, .7, '#f4f4f4']].forEach(([x, z, s, h, c]) => ivB(s, h, s, c, x, .92, z, { roughness: .4 }));
    ivB(.05, 1.4, .05, '#e8b923', -1.5, .92, -1.2); ivB(1, .05, .05, '#e8b923', -1.2, 2.3, -1.2);
    ivTable(5, -4.4, 2.4, 1, .78, '#8a8a8a', '#444'); ivPC(4.6, .78, -4.6); ivCol(D, 5, -4.4, 2.6, 1.2); ivChair(5, -5.1, 0, '#e8b923');
    [[5.6, -4.3], [6, -4.5]].forEach(([x, z]) => { ivB(.26, .22, .26, '#f4f1ea', x, .78, z); const r = mesh(new T.ConeGeometry(.22, .18, 4), mat('#a3482a'), x, 1.09, z, IVP); r.rotation.y = Math.PI / 4; });
    for (let i = 0; i < 6; i++) ivB(.9, .22, .6, '#b8b0a2', 6.6 - (i % 2) * .1, (Math.floor(i / 2)) * .22, 4 - (i % 2) * .65, { roughness: 1 }); ivCol(D, 6.5, 3.7, 1.1, 1.4);
    ivC(.3, .3, .8, '#3a6aa8', -6.8, 0, 4); for (let i = 0; i < 4; i++) { const r = ivC(.05, .05, 1.1, '#e8f4ff', -6.85 + (i % 2) * .1, .4, 4 + (i - 1.5) * .08, 6); r.rotation.z = (i - 1.5) * .08; }
    ivCooler(-6.8, -4.8); ivPlant(7.2, -4.9, .9);
    ivLights(D, { hi: .78, ki: .75, points: [[0, 3.6, -1, '#fff1d0', .6, 10]] });
    ivStation(D, { x: 0, z: .2, ry: Math.PI, tab: 'ter', ico: '🗺️', label: 'Terrenos & Prédios', hit: [0, -1.8, 4.2, 2.4, 1.4] });
    ivNPC(D, 2.6, -2, -Math.PI / 2, { fem: false, mode: 'think', cfg: { shirt: '#ff7a1a', hair: 'cap', capColor: '#ffcb00' } });
    ivNPC(D, 5, -5.1, 0, { fem: true, mode: 'work', cfg: { shirt: '#f2f2f2' } });
  },
  imobiliaria(D) {
    ivRoom(D, { w: 18, d: 12, h: 5, ftex: ivFloorTex('wood', '#c99a6a', '#8a5a3a'), frep: 3, fr: .5, wall: '#f4f1ea', wains: '#0d2a4a', wainsH: 1.1, trim: '#ffcb00', bg: '#0f1420', door: '#0d2a4a' });
    IVP = D.back; ivSign('IMOBILIÁRIA', 6, '#0d2a4a', '#ffcb00', 'CENTRO HABITACIONAL', -4.6, 3.9, -5.95);
    // cartazes das 6 zonas, do bairro pobre ao bairro rico
    ZONAS_CASA.forEach((Z, i) => { const x = .2 + i * 1.5; ivB(1.38, 1.82, .05, '#1a1a1a', x, 1.85, -5.97); ivPlane(1.26, 1.7, ivCanvas('zona_' + Z.id, 256, 344, (g, w, h) => ivDraw.zona(g, w, h, Z, i)), x, 2.76, -5.93); });
    ivB(9.2, .06, .1, '#ffcb00', 3.95, 3.8, -5.95, { metalness: .6 });
    // mapa de Angola (cidades ricas e pobres)
    IVP = D.right; ivB(.06, 2.5, 3.5, '#1a1a1a', 8.97, 1.25, -2.4); ivPlane(3.3, 2.35, ivCanvasGlow('angola', 512, 364, ivDraw.angola, .35), 8.92, 2.5, -2.4, -Math.PI / 2);
    ivWindow(D, 'right', 3, 1.3, 2.6, 2.4, 'city', '#0d2a4a');
    IVP = D.st;
    // maquete do Centro Habitacional
    ivTable(0, -1.3, 7.6, 2.6, .9, '#2a2a2a', '#111'); ivCol(D, 0, -1.3, 7.8, 2.8);
    ivB(7.7, .08, 2.7, '#ffcb00', 0, .9, -1.3, { metalness: .5 });
    ZONAS_CASA.forEach((Z, i) => {
      const x = -3.1 + i * 1.24, z = -1.3, y = .98; ivB(1.14, .04, 2.3, Z.cor, x, y - .04, z);
      const box = (bw, bh, bd, c, dx, dz) => ivB(bw, bh, bd, c, x + dx, y, z + dz);
      const roof = (r, hh, c, dx, dz, yy) => { const m = mesh(new T.ConeGeometry(r, hh, 4), mat(c), x + dx, y + yy + hh / 2, z + dz, IVP); m.rotation.y = Math.PI / 4; };
      if (i === 0) for (let k = 0; k < 9; k++) box(.2, .14, .18, ['#8a7a6a', '#a3482a', '#7a8a9a'][k % 3], -.35 + (k % 3) * .35, -.7 + Math.floor(k / 3) * .6);
      if (i === 1) [[-.25, -.5], [.25, -.5], [-.25, .45], [.25, .45]].forEach(([dx, dz], k) => box(.36, .5, .3, ['#efe4cc', '#d9e6ee', '#f2d9c4', '#e6efd9'][k], dx, dz));
      if (i === 2) [[-.25, -.55], [.25, -.55], [-.25, .45], [.25, .45]].forEach(([dx, dz], k) => { box(.3, .22, .3, ['#f0d9a8', '#e8b9a0', '#cfe0c3', '#f4f1ea'][k], dx, dz); roof(.26, .16, '#a3482a', dx, dz, .22); });
      if (i === 3) [[-.25, -.5, .95], [.25, -.3, 1.25], [0, .5, 1.05]].forEach(([dx, dz, hh], k) => box(.36, hh, .32, ['#e8c547', '#d9534f', '#5bc0de'][k], dx, dz));
      if (i === 4) [[0, -.5], [0, .5]].forEach(([dx, dz]) => { box(.6, .32, .42, '#f4f1ea', dx - .1, dz); ivPlane(.3, .24, mat('#2ab0d8', { roughness: .1 }), x + dx + .32, y + .01, z + dz + .05, 0, -Math.PI / 2); });
      if (i === 5) { box(.85, .5, .7, '#f7f4ee', -.05, -.3); box(.5, .3, .4, '#f7f4ee', .1, .25); ivPlane(.5, .35, mat('#2ab0d8', { roughness: .1 }), x - .1, y + .01, z + .7, 0, -Math.PI / 2); ivC(.025, .03, .55, '#8a6a4a', x + .4, y, z + .75, 6); ivS(.14, '#3f8a2c', x + .4, y + .6, z + .75); }
    });
    // balcão do agente
    ivTable(-5.6, -4.1, 2.6, 1.1, .78, '#3a2414'); ivCol(D, -5.6, -4.1, 2.8, 1.3); ivChair(-5.6, -5, 0, '#0d2a4a'); ivLaptop(-6, .78, -4.1); ivChair(-5.6, -3.1, Math.PI, '#ffcb00');
    [[-4.9, '#f4f1ea'], [-4.5, '#e8c27a']].forEach(([x, c]) => { ivB(.26, .22, .26, c, x, .78, -4.1); const r = mesh(new T.ConeGeometry(.22, .18, 4), mat('#a3482a'), x, 1.09, -4.1, IVP); r.rotation.y = Math.PI / 4; });
    // chaves penduradas
    IVP = D.left; ivB(.05, .8, 1.4, '#6b4423', -8.97, 1.9, -3.6); for (let k = 0; k < 8; k++) ivS(.05, mat('#e8b923', { metalness: .8 }), -8.9, 1.75 + Math.floor(k / 4) * .3, -4.1 + (k % 4) * .33);
    IVP = D.st;
    // zona de espera
    ivSofa(5.6, 4.3, Math.PI, '#0d2a4a', 2.4); ivCol(D, 5.6, 4.3, 2.5, 1); ivTable(5.6, 3.1, 1.2, .6, .42, '#f4f1ea'); ivCol(D, 5.6, 3.1, 1.3, .7);
    ivPlant(-8.3, -5.3, 1.2); ivPlant(8.3, -5.3, 1.1); ivPlant(8.3, 5.2, 1); ivPlant(2.6, 5.2, .9);
    ivRug(0, 2.8, 5, 2.2, '#0d2a4a', ivRugTex('#0d2a4a', '#ffcb00', '#1f4e6e'));
    ivLights(D, { hi: .74, ki: .74, points: [[0, 4.4, -1.3, '#fff1d0', .75, 10], [-5.6, 4, -4, '#fff1d0', .5, 7]] });
    ivPendant(-1.8, 5, -1.3); ivPendant(1.8, 5, -1.3);
    ivStation(D, { x: 0, z: .6, ry: Math.PI, tab: 'casas', ico: '🏘️', label: 'Maquete · Casas por zona', hit: [0, -1.3, 7.8, 2.8, 1.6] });
    ivStation(D, { x: -5.6, z: -2.2, ry: Math.PI, tab: 'casas', ico: '🔑', label: 'Agente · Arrendar e Comprar', hit: [-5.6, -4.1, 2.8, 1.3, 1.5] });
    ivStation(D, { x: 7, z: -2.4, ry: Math.PI / 2, tab: 'zonas', ico: '📊', label: 'Mapa · Preços por zona', hit: [8.6, -2.4, .8, 3.6, 2.6] });
    ivNPC(D, -5.6, -4.95, 0, { fem: true, mode: 'work', cfg: { shirt: '#0d2a4a', pants: '#1a1a1a' } });
    ivNPC(D, -1.6, .35, Math.PI, { mode: 'think' }); ivNPC(D, 2.2, .4, Math.PI, { fem: true, mode: 'think' });
    ivNPC(D, 5.6, 4.3, Math.PI, { mode: 'sit', seat: .48 });
  },
  cela(D) {
    ivRoom(D, { w: 8, d: 7, h: 4.2, ftex: ivFloorTex('cement', '#6e6a64', '#000'), frep: 3, fr: 1, wall: '#8a877f', trim: '#555', bg: '#0b0b0c', dist: 10.5, door: '#555', doorFrame: '#333' });
    IVP = D.back; ivPlane(8, 4.2, ivCanvas('tally', 256, 256, ivDraw.tally), 0, 2.1, -3.47); ivWindow(D, 'back', 1.8, 2.8, .9, .7, 'ceu', '#444');
    IVP = D.back; for (let i = -1; i <= 1; i++) ivB(.04, .7, .05, '#333', 1.8 + i * .25, 2.8, -3.43);
    IVP = D.st;
    const beam = new T.Mesh(new T.BoxGeometry(.8, 4, .7), new T.MeshBasicMaterial({ color: '#fff3c0', transparent: true, opacity: .07, depthWrite: false, blending: T.AdditiveBlending })); beam.position.set(1.6, 1.8, -2); beam.rotation.x = .5; D.dyn.add(beam);
    ivB(2, .08, .9, '#555', -2.7, .45, -2.7); ivB(2, .08, .9, '#555', -2.7, 1.75, -2.7); [[-3.7, -3.15], [-1.7, -3.15], [-3.7, -2.25], [-1.7, -2.25]].forEach(([x, z]) => ivB(.06, 2.2, .06, '#444', x, 0, z));
    ivB(1.9, .12, .8, '#8a8f80', -2.7, .53, -2.7, { roughness: 1 }); ivB(1.9, .12, .8, '#7f8576', -2.7, 1.83, -2.7, { roughness: 1 }); ivCol(D, -2.7, -2.7, 2.2, 1);
    ivC(.25, .2, .45, '#bbb', 3.2, 0, -3, 12, { metalness: .7 }); ivB(.5, .5, .3, '#aaa', 3.2, .3, -3.3, { metalness: .6 }); ivCol(D, 3.2, -3, .7, .8);
    for (let x = -3.9; x <= 3.9; x += .4) ivC(.035, .035, 4.2, '#2a2a2a', x, 0, 3.4, 6, { metalness: .7, roughness: .4 });
    ivB(8, .1, .1, '#2a2a2a', 0, 2, 3.4); ivB(8, .1, .1, '#2a2a2a', 0, 4.1, 3.4);
    ivLights(D, { hi: .5, ki: .45, key: '#d9e2ff', points: [[1.6, 3, -2, '#fff3c0', .6, 7]] });
    ivStation(D, { x: -1.2, z: -1.4, ry: Math.PI, tab: null, ico: '🔒', label: 'A Tua Cela', hit: [-2.7, -2.7, 2.2, 1, 2.2] });
  },
};

/* ---------- casas (por nível) ---------- */
function ivCasaTier() {
  const z = typeof casaZona === 'function' ? casaZona() : 'bairro';
  return { musseque: 'simples', zango: 'bairro', bairro: 'bairro', kilamba: 'apto', talatona: 'luxo', miramar: 'luxo' }[z] || 'bairro';
}
function ivCasaStations(D, s) {
  ivStation(D, { x: s.main[0], z: s.main[1], ry: s.main[2], tab: 'main', ico: '🏠', label: 'Sala · A Minha Casa', hit: s.main[3] });
  ivStation(D, { x: s.fam[0], z: s.fam[1], ry: s.fam[2], tab: 'fam', ico: '👨‍👩‍👧', label: 'Família', hit: s.fam[3] });
  ivStation(D, { x: s.roupa[0], z: s.roupa[1], ry: s.roupa[2], tab: 'roupa', ico: '👗', label: 'Guarda-roupa', hit: s.roupa[3] });
  ivStation(D, { x: s.diario[0], z: s.diario[1], ry: s.diario[2], tab: 'diario', ico: '📜', label: 'Diário', hit: s.diario[3] });
}
const IV_CASA = {
  simples(D) {
    ivRoom(D, { w: 12, d: 9, h: 3.6, ftex: ivFloorTex('cement', '#8f857a', '#000'), frep: 3, fr: 1, wall: '#6fa8a0', wains: '#4a7f78', wainsH: .9, trim: '#3a5a55', bg: '#141210', dist: 12.5, door: '#3a6aa8', doorFrame: '#5a3a1e' });
    ivWindow(D, 'back', -3.8, 1.3, 1.4, 1.1, 'bairro', '#5a3a1e');
    IVP = D.back; ivArt(1.6, 1.7, -4.47, 0, .9, .7, 'familia', '#5a3a1e'); ivArt(3.2, 1.9, -4.47, 0, .6, .45, 'angola', '#5a3a1e');
    IVP = D.st;
    ivB(.7, .5, .5, '#6b4a2a', -1, 0, -3.9); ivB(.7, .5, .45, '#333', -1, .5, -3.9); ivPlane(.5, .36, ivGlow('#9ad0ff', .7), -1, .75, -3.66);
    ivChair(-1.7, -2, 0, '#f4f4f4', '#ddd'); ivChair(-.2, -2, 0, '#c8102e', '#a00'); ivCol(D, -1, -3.9, .8, .6);
    ivTable(2.4, -2.2, 1.4, .9, .74, new T.MeshStandardMaterial({ map: waxTex(['#c8102e', '#ffcb00', '#1d1d1d', '#f2f2f2']) })); ivChair(2.4, -3, 0, '#2e8b57', '#1a6a3a'); ivCol(D, 2.4, -2.2, 1.5, 1);
    ivB(.6, .3, .4, '#3a2a1a', 2.4, .74, -2.3);
    ivB(.08, 2, 1.8, new T.MeshStandardMaterial({ map: waxTex(['#1f63c9', '#ffcb00', '#f2f2f2', '#c8102e']), side: T.DoubleSide }), 3.4, 0, -3.2, null, false);
    ivB(1.8, .2, 2, '#8a8f80', 4.8, 0, -3.3); ivB(1.8, .08, 1.4, new T.MeshStandardMaterial({ map: waxTex(['#2e8b57', '#ffcb00', '#1d1d1d', '#f2f2f2']) }), 4.8, .2, -3); ivB(.6, .12, .3, '#f4f4f4', 4.8, .2, -4); ivCol(D, 4.8, -3.3, 1.9, 2.1);
    ivB(.3, .04, .22, '#c8102e', 4.2, .28, -2.4);
    ivB(.08, 1.8, .08, '#6b4a2a', -5.7, 0, -3.8); ivB(.08, 1.8, .08, '#6b4a2a', -5.7, 0, -1.4); ivC(.012, .012, 2.4, '#ddd', -5.7, 1.7, -2.6, 4).rotation.x = Math.PI / 2;
    IVP.children[IVP.children.length - 1].position.set(-5.7, 1.7, -2.6);
    for (let i = 0; i < 5; i++) ivB(.04, .8, .45, pick(['#c8102e', '#1f63c9', '#ffcb00', '#2e8b57', '#f2f2f2']), -5.7, .85, -3.5 + i * .5, { roughness: 1 }, false);
    ivCol(D, -5.7, -2.6, .3, 2.6);
    ivC(.22, .22, .6, '#1f63c9', 5.3, 0, 2.6, 12); ivC(.25, .2, .25, '#555', 4.7, 0, 2.6, 10); ivC(.3, .25, .45, '#2a8a3a', 5.3, 0, 1.6, 12); ivB(.3, .45, .2, '#ffcb00', 4.6, 0, 1.6);
    ivCol(D, 5, 2.1, 1.2, 1.6);
    ivC(.01, .01, .6, '#222', 0, 3, -1, 4); ivS(.09, ivGlow('#fff1c4', 2), 0, 2.95, -1);
    ivLights(D, { hi: .62, ki: .6, key: '#ffe6c0', points: [[0, 2.8, -1, '#ffd9a0', .9, 9]] });
    ivCasaStations(D, { main: [-1, -1.1, 0, [-1, -3.5, 1.6, 1.4, 1.2]], fam: [2.4, -1, Math.PI, [2.4, -2.2, 1.5, 1, 1.2]], roupa: [-4.4, -2.6, -Math.PI / 2, [-5.7, -2.6, .4, 2.6, 1.8]], diario: [4.8, -1.4, Math.PI, [4.8, -3.3, 1.9, 2, .8]] });
    ivNPC(D, 1.7, -3, 0, { mode: 'sit', fem: true });
  },
  bairro(D) {
    ivRoom(D, { w: 14, d: 10, h: 3.8, ftex: ivFloorTex('tile', '#eadfcb', '#d6c6aa'), frep: 2.4, fr: .4, wall: '#f2e6c8', wains: '#c9a77a', trim: '#8a6a48', bg: '#16120e', dist: 13.5 });
    ivWindow(D, 'back', 4.6, 1.2, 1.8, 1.5, 'bairro', '#f4f1ea');
    IVP = D.back; ivArt(.8, 1.9, -4.97, 0, 1.1, .8, 'familia'); ivArt(2.4, 2.1, -4.97, 0, .7, .5, 'angola'); ivClock(-.4, 2.8, -4.97, 0);
    IVP = D.left; ivArt(-6.96, 1.8, -1.8, Math.PI / 2, 1.2, .9, 'sunset');
    IVP = D.st;
    ivB(2.2, .6, .5, '#6b4423', -2.6, 0, -4.6); ivTV(-2.6, .75, -4.6, 0, 1.4); ivCol(D, -2.6, -4.6, 2.3, .6);
    ivSofa(-2.6, -1.3, Math.PI, '#a3482a', 2.4, '#f4e1b0'); ivSofa(-4.8, -2.8, Math.PI / 2, '#a3482a', 1.4); ivTable(-2.6, -2.6, 1.1, .6, .42, '#6b4423');
    ivB(.5, .01, .5, '#fbfbf7', -2.6, .43, -2.6, null, false); ivRug(-2.8, -2.6, 3.6, 2.6, null, ivRugTex('#8a1a2a', '#ffcb00', '#1d1d1d'));
    ivCol(D, -2.6, -1.3, 2.5, 1); ivCol(D, -4.8, -2.8, 1, 1.5); ivCol(D, -2.6, -2.6, 1.2, .7);
    ivTable(3, -2, 1.8, 1, .78, '#7a5236'); [[2.4, -2.75, 0], [3.6, -2.75, 0], [2.4, -1.25, Math.PI], [3.6, -1.25, Math.PI]].forEach(([x, z, r]) => ivChair(x, z, r, '#7a5236')); ivCol(D, 3, -2, 2, 1.8);
    ivB(1.9, .01, 1, '#fbfbf7', 3, .79, -2, null, false); ivC(.08, .1, .2, '#f4f4f4', 3, .8, -2, 10);
    ivWardrobe(6.6, -3.2, -Math.PI / 2, 2, 2.3, '#8a5a3a'); ivCol(D, 6.6, -3.2, .7, 2.1);
    ivTable(-6.4, 2.1, .7, 1.2, .76, '#6b4423'); ivChair(-5.8, 2.1, -Math.PI / 2, '#6b4423'); ivB(.3, .04, .22, '#1f63c9', -6.4, .76, 2); ivC(.08, .1, .4, ivGlow('#fff1c4', .5), -6.5, .76, 2.5, 10); ivCol(D, -6.4, 2.1, .8, 1.3);
    ivB(.8, 1.9, .7, '#f4f4f4', 6.4, 0, 1.6, { roughness: .3 }); ivCol(D, 6.4, 1.6, .9, .8);
    ivPlant(-6.4, -4.4, 1); ivPlant(5.4, -4.4, .9);
    ivLights(D, { hi: .7, ki: .65, key: '#ffe9c8', points: [[0, 3.2, -1.5, '#ffe2b0', .7, 10]] });
    ivCasaStations(D, { main: [-2.6, -3.4, 0, [-2.6, -2, 3, 2.6, 1.4]], fam: [3, -.3, Math.PI, [3, -2, 2, 1.8, 1]], roupa: [5.4, -3.2, Math.PI / 2, [6.6, -3.2, .7, 2.1, 2.3]], diario: [-5.1, 2.1, -Math.PI / 2, [-6.4, 2.1, .8, 1.3, 1]] });
    ivNPC(D, -2.2, -1.25, Math.PI, { mode: 'sit', fem: true }); ivNPC(D, 3.6, -1.25, Math.PI, { mode: 'sit' });
  },
  apto(D) {
    ivRoom(D, { w: 16, d: 11, h: 4, ftex: ivFloorTex('wood', '#c49a6c', '#000'), frep: 4, fr: .5, wall: '#f4f1ec', trim: '#9a8a78', bg: '#101418', dist: 14.5, door: '#3d5a73' });
    IVP = D.back; ivB(5.6, 4, .05, '#3d5a73', -3.6, 0, -5.47); ivWindow(D, 'back', 2.6, .9, 3.6, 2.6, 'city', '#2a2a2a');
    IVP = D.left; ivArt(-7.96, 1.6, 2, Math.PI / 2, 1.4, 1, 'abstract', '#111');
    IVP = D.st;
    ivB(4.6, .5, .5, '#2a2a2a', -3.6, 0, -5.1); ivTV(-3.6, 1.1, -5.4, 0, 2.2); ivCol(D, -3.6, -5.1, 4.7, .6);
    ivSofa(-3.6, -1.4, Math.PI, '#7a8794', 3.2, '#ffcb00'); ivSofa(-6.2, -2.8, Math.PI / 2, '#7a8794', 1.8); ivTable(-3.6, -2.8, 1.4, .8, .4, '#1a1a1a');
    ivRug(-3.8, -2.8, 4.6, 3.2, null, ivRugTex('#e9e4da', '#3d5a73', '#c9a227')); ivCol(D, -3.6, -1.4, 3.3, 1); ivCol(D, -6.2, -2.8, 1, 1.9); ivCol(D, -3.6, -2.8, 1.5, .9);
    ivLampF(-6.6, -4.6);
    ivTable(2.8, -.8, 2.4, 1.1, .78, '#f4f1ec', '#222'); [-.7, 0, .7].forEach(dx => { ivChair(2.8 + dx, -1.6, 0, '#222'); ivChair(2.8 + dx, 0, Math.PI, '#222'); }); ivCol(D, 2.8, -.8, 2.6, 2);
    ivPendant(2.8, 4, -.8); ivPendant(2.2, 4, -.8);
    ivCounter(5.4, -4.9, 4.6, .7, .95, '#f4f1ec', '#2a2a2a'); ivB(1, 1.9, .7, '#c9ccd0', 7.3, 0, -4.9, { metalness: .5, roughness: .3 }); ivCol(D, 5.8, -4.9, 4.6, .8);
    ivWardrobe(7.6, -1.2, -Math.PI / 2, 2.2, 2.4, '#e9e4da'); ivCol(D, 7.6, -1.2, .7, 2.3);
    ivTable(-7.5, 1.4, .7, 1.4, .76, '#c49a6c', '#222'); ivLaptop(-7.5, .76, 1.4, Math.PI / 2); ivChair(-6.8, 1.4, -Math.PI / 2, '#3d5a73'); ivCol(D, -7.5, 1.4, .8, 1.5);
    ivPlant(.3, -4.9, 1.3); ivPlant(7.4, 4.6, 1.1);
    ivLights(D, { hi: .75, ki: .7, points: [[0, 3.4, -1.5, '#fff1d6', .6, 12]] });
    ivCasaStations(D, { main: [-3.6, -3.9, 0, [-3.6, -2.2, 3.4, 2.4, 1.3]], fam: [2.8, 1, Math.PI, [2.8, -.8, 2.6, 2, 1]], roupa: [6.3, -1.2, Math.PI / 2, [7.6, -1.2, .7, 2.3, 2.4]], diario: [-6.2, 1.4, -Math.PI / 2, [-7.5, 1.4, .8, 1.5, 1]] });
    ivNPC(D, -3, -1.4, Math.PI, { mode: 'sit', seat: .48 }); ivNPC(D, 5.4, -4, 0, { mode: 'idle', fem: true });
  },
  luxo(D) {
    ivRoom(D, { w: 20, d: 14, h: 5, ftex: ivFloorTex('marble', '#f4f0e9', '#ddd5c8'), frep: 5, fr: .12, fm: .1, wall: '#f7f4ef', trim: '#c9a227', bg: '#0e1216', dist: 17, door: '#2a2a2a' });
    ivGlassWall(D, 'pool', '#c9a227');
    IVP = D.left; ivArt(-9.96, 1.7, -3, Math.PI / 2, 2.2, 1.6, 'sunset', '#c9a227');
    IVP = D.right; ivArt(9.96, 1.8, 3, -Math.PI / 2, 1.8, 1.3, 'abstract', '#c9a227');
    IVP = D.st;
    ivSofa(-4, -1.4, Math.PI, '#f4f1ea', 3.6, '#c9a227'); ivSofa(-6.9, -3.2, Math.PI / 2, '#f4f1ea', 2.4, '#1d1d1d'); ivTable(-4, -3.2, 1.8, 1, .38, new T.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: .5, roughness: .05 }), '#c9a227');
    ivRug(-4.3, -3.1, 6, 4, null, ivRugTex('#1d1d1d', '#c9a227', '#3a3a3a')); ivCol(D, -4, -1.4, 3.7, 1); ivCol(D, -6.9, -3.2, 1, 2.5); ivCol(D, -4, -3.2, 1.9, 1.1);
    ivTV(-4, 1.2, -6.4, 0, 2.8); ivB(4, .4, .5, '#1d1d1d', -4, 0, -6.6); ivCol(D, -4, -6.6, 4, .6);
    ivTable(4.5, -1.2, 4, 1.3, .78, '#1d1d1d', '#c9a227'); for (let i = 0; i < 4; i++) { ivChair(3 + i, -2.1, 0, '#f4f1ea', '#c9a227'); ivChair(3 + i, -.3, Math.PI, '#f4f1ea', '#c9a227'); } ivCol(D, 4.5, -1.2, 4.2, 2.3);
    for (let i = 0; i < 9; i++) ivS(.09, ivGlow('#fff1c4', 1.8), 3 + (i % 3) * 1.5, 3.6 - Math.floor(i / 3) * .25, -1.2 + (Math.floor(i / 3) - 1) * .35);
    ivB(3, .04, 1, '#c9a227', 4.5, 3.9, -1.2, { metalness: .8 });
    ivWardrobe(9.6, -4, -Math.PI / 2, 3, 2.6, '#1d1d1d'); ivCol(D, 9.6, -4, .7, 3.1);
    ivGrp(-7.4, -5.4, .4, () => { ivB(1.5, .3, 1.9, '#0a0a0a', 0, .7, 0, { roughness: .15 }); ivB(1.5, .06, .3, '#f4f4f4', 0, .9, .8); [[-.6, -.8], [.6, -.8], [0, .8]].forEach(([a, b]) => ivB(.08, .7, .08, '#0a0a0a', a, 0, b)); const lid = ivB(1.4, .04, 1.6, '#0a0a0a', 0, 1.2, -.1, { roughness: .15 }); lid.rotation.x = -.5; });
    ivCol(D, -7.4, -5.4, 1.8, 2.2);
    ivShelf(-9.7, 2.4, Math.PI / 2, 2, 2.4, '#1d1d1d'); ivTable(-8.6, 2.4, .8, 1.6, .76, '#1d1d1d', '#c9a227'); ivLaptop(-8.6, .76, 2.4, Math.PI / 2); ivCol(D, -9.1, 2.4, 1.8, 2.1);
    ivPlant(0, -6.3, 1.7); ivPlant(9.2, 5.7, 1.3); ivPlant(-1.4, 5.7, 1.1);
    ivLights(D, { hi: .78, ki: .72, points: [[4.5, 3.6, -1.2, '#ffe9c0', .7, 10], [-4, 4, -3, '#fff6e0', .5, 12]] });
    ivCasaStations(D, { main: [-4, -4.6, 0, [-4, -2.4, 4, 2.6, 1.3]], fam: [4.5, 1, Math.PI, [4.5, -1.2, 4.2, 2.3, 1]], roupa: [8.2, -4, Math.PI / 2, [9.6, -4, .7, 3.1, 2.6]], diario: [-7.6, 2.4, -Math.PI / 2, [-9.1, 2.4, 1.8, 2, 1]] });
    ivNPC(D, -3.2, -1.4, Math.PI, { mode: 'sit', seat: .48, fem: true }); ivNPC(D, 6, -3.4, .4, { cfg: { shirt: '#f2f2f2', pants: '#1d1d1d' } });
  },
};


/* ---------- A MINHA CASA: começa VAZIA — os móveis são comprados pelo jogador ---------- */
const IV_TIER_WH = { simples: [12, 9], bairro: [14, 10], apto: [16, 11], luxo: [20, 14] };
function ivColchao(x, z, ry) {
  ivGrp(x, z, ry, () => {
    ivB(1.5, .2, 2.5, '#8a8f80', 0, .1, 0);
    ivB(1.3, .08, 1.5, new T.MeshStandardMaterial({ map: waxTex(['#c8102e', '#ffcb00', '#1d1d1d', '#f2f2f2']) }), 0, .22, .35);
    ivB(.7, .12, .4, '#f4f4f4', 0, .22, -.85);
  });
}
function ivCama2(x, z, ry) {   // cama ortopédica de casal: maior, cabeceira estofada
  ivGrp(x, z, ry, () => {
    ivB(2.4, .36, 3, '#3a2a1e', 0, .18, 0);
    ivB(2.3, .3, 2.9, '#f7f4ef', 0, .5, 0);
    ivB(2.2, .12, 1.7, new T.MeshStandardMaterial({ map: waxTex(['#8a1a2a', '#c9a227', '#f2f2f2', '#1d1d1d']) }), 0, .66, .45);
    ivB(.9, .16, .5, '#ffffff', -.6, .66, -1.05); ivB(.9, .16, .5, '#ffffff', .6, .66, -1.05);
    ivB(2.4, 1.15, .14, '#5a4632', 0, .58, -1.55);
  });
}
function ivArcond(D, x, z) {   // unidade na parede + fluxo de ar
  ivB(1.35, .45, .3, '#eef1f4', x, 2.62, z);
  ivB(1.2, .06, .05, '#8a949e', x, 2.46, z + .13);
  ivB(.22, .22, .05, '#2ab0d8', x - .48, 2.66, z + .14);
  ivCol(D, x, z, 1.2, .5);
}
function ivCama(x, z, ry) {
  ivGrp(x, z, ry, () => {
    ivB(1.9, .32, 2.6, '#6b4a2a', 0, .16, 0);
    ivB(1.8, .24, 2.5, '#f4f1ea', 0, .42, 0);
    ivB(1.7, .1, 1.4, new T.MeshStandardMaterial({ map: waxTex(['#1f63c9', '#ffcb00', '#f2f2f2', '#c8102e']) }), 0, .54, .4);
    ivB(.75, .13, .45, '#ffffff', -.45, .54, -.9); ivB(.75, .13, .45, '#ffffff', .45, .54, -.9);
    ivB(1.9, 1, .1, '#6b4a2a', 0, .5, -1.32);
  });
}
function ivFogao(x, z, ry) {
  ivGrp(x, z, ry, () => {
    ivB(.9, .85, .65, '#d9d9de', 0, .42, 0, { metalness: .3, roughness: .4 });
    ivB(.8, .03, .55, '#222222', 0, .86, 0);
    [[-.2, -.13], [.2, -.13], [-.2, .13], [.2, .13]].forEach(([a, b]) => ivC(.09, .09, .02, '#0a0a0a', a, .88, b, 10));
    ivB(.66, .38, .03, '#1a1a1a', 0, .34, .34);
    ivB(.3, .12, .24, '#8a8a8a', -.1, .95, 0);
  });
}
function ivGeladeira(x, z, ry) {
  ivGrp(x, z, ry, () => {
    ivB(.8, 1.9, .7, '#f4f4f4', 0, .95, 0, { roughness: .3, metalness: .2 });
    ivB(.05, .55, .05, '#999999', .3, 1.15, .37);
    ivB(.78, .03, .68, '#cccccc', 0, 1.25, 0);
  });
}
function ivSomCasa(x, z, ry) {
  ivGrp(x, z, ry, () => {
    ivB(.32, .75, .32, '#161616', -.55, .37, 0); ivB(.32, .75, .32, '#161616', .55, .37, 0);
    ivB(.55, .28, .32, '#242424', 0, .5, 0); ivB(.45, .13, .02, '#3a86ff', 0, .5, .17);
  });
}
function ivCasaVazia(D, tier) {
  tier = IV_TIER_WH[tier] ? tier : 'bairro';
  const [W, H] = IV_TIER_WH[tier];
  const M = (G && G.moveis) || [];
  const tem = id => M.includes(id);
  if (tier === 'simples') { ivRoom(D, { w: 12, d: 9, h: 3.6, ftex: ivFloorTex('cement', '#8f857a', '#000'), frep: 3, fr: 1, wall: '#6fa8a0', wains: '#4a7f78', wainsH: .9, trim: '#3a5a55', bg: '#141210', dist: 12.5, door: '#3a6aa8', doorFrame: '#5a3a1e' }); ivWindow(D, 'back', -3.8, 1.3, 1.4, 1.1, 'bairro', '#5a3a1e'); }
  else if (tier === 'bairro') { ivRoom(D, { w: 14, d: 10, h: 3.8, ftex: ivFloorTex('tile', '#eadfcb', '#d6c6aa'), frep: 2.4, fr: .4, wall: '#f2e6c8', wains: '#c9a77a', trim: '#8a6a48', bg: '#16120e', dist: 13.5 }); ivWindow(D, 'back', 4.6, 1.2, 1.8, 1.5, 'bairro', '#f4f1ea'); }
  else if (tier === 'apto') { ivRoom(D, { w: 16, d: 11, h: 4, ftex: ivFloorTex('wood', '#c49a6c', '#000'), frep: 4, fr: .5, wall: '#f4f1ec', trim: '#9a8a78', bg: '#101418', dist: 14.5, door: '#3d5a73' }); ivWindow(D, 'back', 2.6, .9, 3.6, 2.6, 'city', '#2a2a2a'); }
  else { ivRoom(D, { w: 20, d: 14, h: 5, ftex: ivFloorTex('marble', '#f4f0e9', '#ddd5c8'), frep: 5, fr: .12, fm: .1, wall: '#f7f4ef', trim: '#c9a227', bg: '#0e1216', dist: 17, door: '#2a2a2a' }); ivGlassWall(D, 'pool', '#c9a227'); }
  IVP = D.st;
  if (!M.length) {
    // casa acabada de comprar: vazia, com as caixas da mudança
    ivB(.6, .5, .6, '#a87f4f', W * .12, .25, H * .16); ivB(.5, .45, .5, '#96703f', W * .12 + .8, .22, H * .16 - .2); ivB(.5, .4, .5, '#b08a55', W * .12 + .35, .68, H * .16, null, false);
    ivCol(D, W * .12 + .3, H * .16, 1.4, 1.2);
    ivB(.5, .04, .3, '#7a6a55', -W * .1, .02, H * .2, null, false);   // tapete velho enrolado
  }
  const ax = (fx, fz) => [W * fx, -H * fz];
  if (tem('cama2')) { const [x, z] = ax(.34, .36); ivCama2(x, z, 0); ivCol(D, x, z, 2.5, 3); }
  else if (tem('cama')) { const [x, z] = ax(.34, .36); ivCama(x, z, 0); ivCol(D, x, z, 2, 2.7); }
  else if (tem('colchao')) { const [x, z] = ax(.34, .36); ivColchao(x, z, 0); ivCol(D, x, z, 1.6, 2.5); }
  if (tem('arcond')) { const [x, z] = ax(.34, .36); ivArcond(D, x, z - 2.6); }
  if (tem('sofa')) { const [x, z] = ax(-.16, .16); ivSofa(x, z, Math.PI, tier === 'luxo' ? '#f4f1ea' : tier === 'apto' ? '#7a8794' : '#a3482a', Math.min(3.2, W * .22)); ivCol(D, x, z, Math.min(3.4, W * .24), 1); }
  if (tem('tv')) { const [x, z] = ax(-.16, .44); ivB(2.2, .55, .5, tier === 'simples' ? '#6b4a2a' : '#1d1d1d', x, 0, z); ivTV(x, .68, z - .12, 0, tier === 'luxo' ? 2.6 : 1.5); ivCol(D, x, z, 2.3, .6); }
  if (tem('mesa')) { const [x, z] = ax(.26, .24); ivTable(x, z, Math.min(2.4, W * .16), 1, .76, tier === 'simples' ? '#7a5236' : '#6b4423'); ivChair(x - .6, z - .75, 0, '#7a5236'); ivChair(x + .6, z - .75, 0, '#7a5236'); ivChair(x, z + .75, Math.PI, '#7a5236'); ivCol(D, x, z, 2.4, 1.8); }
  if (tem('fogao')) { const [x, z] = ax(-.44, .42); ivFogao(x, z, 0); ivCol(D, x, z, 1, .8); }
  if (tem('geladeira')) { const [x, z] = ax(-.44, .28); ivGeladeira(x, z, 0); ivCol(D, x, z, .9, .8); }
  if (tem('guardaroupa')) { const [x, z] = ax(.465, .3); ivWardrobe(x, z, -Math.PI / 2, Math.min(2.4, H * .22), 2.3, tier === 'luxo' ? '#1d1d1d' : '#8a5a3a'); ivCol(D, x, z, .7, 2.4); }
  if (tem('som')) { const [x, z] = ax(-.42, -.34); ivSomCasa(x, z, Math.PI); ivCol(D, x, z, 1.4, .5); }
  if (tem('tapete')) ivRug(0, -H * .06, Math.min(4.6, W * .32), Math.min(3.2, H * .3), null, ivRugTex(tier === 'luxo' ? '#1d1d1d' : '#8a1a2a', '#ffcb00', tier === 'luxo' ? '#c9a227' : '#1d1d1d'));
  if (tem('candeeiro')) ivLampF(-W * .45, H * .36);
  if (tem('pc')) { const [x, z] = ax(-.44, -.22); ivTable(x, z, .75, 1.2, .76, '#6b4423'); ivLaptop(x, .77, z, Math.PI / 2); ivChair(x + .75, z, -Math.PI / 2, '#3d5a73'); ivCol(D, x, z, 1.5, 1.3); }
  if (tem('candeeiro') || tier !== 'simples') ivPlant(W * .46, H * .4, 1);
  ivLights(D, { hi: tem('candeeiro') ? .72 : .58, ki: .6, points: [[0, 3, -1, tem('candeeiro') ? '#ffe6c0' : '#d9c9a8', .8, 10]] });
  const ST = {
    simples: { main: [-1, -1.1, 0, [-1, -3.5, 1.6, 1.4, 1.2]], fam: [2.4, -1, Math.PI, [2.4, -2.2, 1.5, 1, 1.2]], roupa: [-4.4, -2.6, -Math.PI / 2, [-5.7, -2.6, .4, 2.6, 1.8]], diario: [4.8, -1.4, Math.PI, [4.8, -3.3, 1.9, 2, .8]] },
    bairro: { main: [-2.6, -3.4, 0, [-2.6, -2, 3, 2.6, 1.4]], fam: [3, -.3, Math.PI, [3, -2, 2, 1.8, 1]], roupa: [5.4, -3.2, Math.PI / 2, [6.6, -3.2, .7, 2.1, 2.3]], diario: [-5.1, 2.1, -Math.PI / 2, [-6.4, 2.1, .8, 1.3, 1]] },
    apto: { main: [-3.6, -3.9, 0, [-3.6, -2.2, 3.4, 2.4, 1.3]], fam: [2.8, 1, Math.PI, [2.8, -.8, 2.6, 2, 1]], roupa: [6.3, -1.2, Math.PI / 2, [7.6, -1.2, .7, 2.3, 2.4]], diario: [-6.2, 1.4, -Math.PI / 2, [-7.5, 1.4, .8, 1.5, 1]] },
    luxo: { main: [-4, -4.6, 0, [-4, -2.4, 4, 2.6, 1.3]], fam: [4.5, 1, Math.PI, [4.5, -1.2, 4.2, 2.3, 1]], roupa: [8.2, -4, Math.PI / 2, [9.6, -4, .7, 3.1, 2.6]], diario: [-7.6, 2.4, -Math.PI / 2, [-9.1, 2.4, 1.8, 2, 1]] },
  };
  ivCasaStations(D, ST[tier]);
  if (G && G.parceiro && G.parceiro.juntos && tem('sofa')) { const [x, z] = ax(-.16, .16); ivNPC(D, x, z, Math.PI, { mode: 'sit', seat: .48, fem: G.parceiro.g === 'F' }); }
}

/* ---------- Abrigo da Missão (quando não tens casa) ---------- */
function ivAbrigo(D) {
  ivRoom(D, { w: 13, d: 9, h: 3.4, ftex: ivFloorTex('cement', '#7f7a70', '#000'), frep: 3, fr: 1, wall: '#8a9a8a', wains: '#5a6a5a', wainsH: 1, trim: '#3a4a3a', bg: '#121410', dist: 12.5, door: '#4a6a4a', doorFrame: '#3a3a2a' });
  ivWindow(D, 'back', -3, 1.4, 1.4, 1, 'bairro', '#4a4a3a'); ivWindow(D, 'back', 3, 1.4, 1.4, 1, 'bairro', '#4a4a3a');
  IVP = D.st;
  for (let i = 0; i < 3; i++) {
    const bx = -4 + i * 2.6;
    ivGrp(bx, -2.8, 0, () => {
      ivB(1.4, .3, 2.2, '#4a5a6a', 0, .15, 0);
      ivB(1.3, .12, 2.1, '#7a8a9a', 0, .36, 0);
      ivB(1.2, .08, 1.2, '#a34a3a', 0, .42, .3);
    });
    ivCol(D, bx, -2.8, 1.5, 2.3);
  }
  ivTable(3.8, -3.2, 1.6, .9, .76, '#5a4a3a'); ivCol(D, 3.8, -3.2, 1.7, 1);
  ivB(.4, .3, .3, '#c8b090', 3.8, .78, -3.2, null, false);
  ivB(.5, .2, .35, '#d9d9de', 3.2, .76, -3.4, null, false);
  ivLights(D, { hi: .62, ki: .55, points: [[0, 2.9, -1, '#ffe6c0', .8, 9]] });
  ivStation(D, { x: 0, z: -.6, ry: 0, tab: 'main', ico: '🏚️', label: 'Abrigo da Missão', hit: [0, -2.2, 2.6, 1.6, 1.2] });
  ivStation(D, { x: 3.8, z: -1.6, ry: Math.PI, tab: 'fam', ico: '🍲', label: 'Sopa dos pobres', hit: [3.8, -3.2, 1.8, 1.2, 1] });
  ivNPC(D, -1.4, -2.8, 0, { mode: 'sit' }); ivNPC(D, 4.4, -3.4, Math.PI, { mode: 'idle', fem: true });
}

function ivBuild(id, key) {
  const D = ivNew(id);
  if (id === 'casa') {
    const p = key.split(':');
    if (p[1] === 'minha') ivCasaVazia(D, p[2]);       // casa própria/arrendada: começa vazia, mostra os móveis comprados
    else if (p[1] === 'abrigo') ivAbrigo(D);          // sem casa: Abrigo da Missão
    else IV_CASA[p[2] || 'bairro'](D);                // casa dos pais: mobilada pela família
  } else IV_ROOMS[id](D);
  ivFinish(D);
  D.hall = { x: 0, z: D.d / 2 - 1.3 };
  return D;
}

/* =========================================================
   ENTRAR / SAIR / ATUALIZAR
   ========================================================= */
const IV_IDS = ['casa', 'empresa', 'banco', 'emprego', 'escola', 'clinica', 'igreja', 'ginasio', 'shopping', 'farra', 'obras', 'imobiliaria', 'cela'];
function ivBase(D) { return D.dist * (camera.aspect < .8 ? 1.5 : 1); }
function ivNight() { return Math.sin(dayT * Math.PI * 2 - Math.PI / 2) < -.05; }
function ivCasaKey() {
  if (!G) return 'casa:pais:bairro';
  if (G.casa.tipo === 'rua') return 'casa:abrigo';
  if (G.casa.tipo === 'propria' || G.casa.tipo === 'arrendada') return 'casa:minha:' + ivCasaTier() + ':' + (G.moveis || []).slice().sort().join('.');
  return 'casa:pais:' + ivCasaTier();
}
function ivEnter(id) {
  const L = LOC_POS[id]; if (!L || !player) return openPanel(id);
  const key = id === 'casa' ? ivCasaKey() : id;
  const f = $('#fade'); f.innerHTML = `<div><small>A entrar em…</small><b style="font-size:34px">${L.ico} ${L.n}</b></div>`; f.classList.add('on'); uiBlocked = true; autoGo = null;
  closePanel(); if (typeof closePhone === 'function') closePhone();
  setTimeout(() => {
    let D = IV_CACHE[key];
    if (!D) { try { D = IV_CACHE[key] = ivBuild(id, key); } catch (e) { console.error('interior', id, e); f.classList.remove('on'); uiBlocked = false; return openPanel(id); } }
    ivSaved = { camYaw, camPitch, camDist };
    inInt = D; D.loc = id;
    worldScene.remove(player.g); D.sc.add(player.g); if (player.s0) player.g.scale.setScalar(player.s0);
    playerPos.set(D.door.x, 0, D.door.z); playerYaw = Math.PI / 2; player.g.position.copy(playerPos);
    camYaw = -.12; camPitch = camera.aspect < .8 ? .82 : .66; camDist = ivBase(D);
    const nt = ivNight(); D.views.forEach(v => { v.m.map = ivViewTex(v.kind, nt); v.m.needsUpdate = true; });
    curScene = D.sc; document.body.classList.add('in-int');
    const nm = document.getElementById('ivName'); if (nm) nm.textContent = L.n;
    nearLoc = null; showPrompt(null); ivNear = null;
    ivCamSnap();
    f.classList.remove('on'); uiBlocked = false;
    const st = D.stations[0]; ivGo = { path: [D.hall, st], st, t: 0, stuck: 0 };
    toast(id === 'casa' ? (G.casa && G.casa.tipo === 'rua' ? '🏚️ Abrigo da Missão: sopa, banho e uma cama. Trabalha para sair da rua!' : G.casa.tipo === 'pais' ? '👨‍👩‍👧 Casa dos teus pais — aqui tens tudo, mas a independência é lá fora.' : !(G.moveis || []).length ? '🏠 A tua casa está VAZIA! Vai à Imobiliária → 🪑 Móveis para mobilar (colchão, fogão, TV…).' : '🏠 Estás em casa. Toca nos móveis para descansar, ver TV ou falar com a família.') : `${L.ico} Bem-vindo(a) a ${L.n}! Toca nos balcões para falar com as pessoas.`);
  }, 380);
}
function ivExit(instant) {
  if (!inInt) return;
  const D = inInt, id = D.loc;
  if (!instant && id === 'cela' && G && G.preso > 0) return toast('🔒 Estás preso(a)! A porta da cela está trancada.');
  const done = () => {
    if (player) { D.sc.remove(player.g); worldScene.add(player.g); }
    inInt = null; ivGo = null; ivNear = null;
    curScene = worldScene; document.body.classList.remove('in-int');
    if (camera.view && camera.view.enabled) camera.clearViewOffset();
    const L = LOC_POS[id];
    if (L) { playerYaw = locFace(id) + Math.PI; playerPos.set(L.x + Math.sin(playerYaw) * .4, 0, L.z + Math.cos(playerYaw) * .4); }
    if (ivSaved) { camPitch = ivSaved.camPitch; camDist = ivSaved.camDist; }
    camYaw = playerYaw + Math.PI;
    camera.position.set(playerPos.x + Math.sin(camYaw) * camDist, 5, playerPos.z + Math.cos(camYaw) * camDist);
    nearLoc = null; $('#prompt').classList.add('hidden');
  };
  if (instant) return done();
  closePanel(); const f = $('#fade'); f.innerHTML = `<div><small>De volta à rua…</small><b style="font-size:30px">${LOC_POS[id] ? LOC_POS[id].n : ''}</b></div>`; f.classList.add('on'); uiBlocked = true;
  setTimeout(() => { done(); f.classList.remove('on'); uiBlocked = !!panelId || modalOpen || !!phoneApp; }, 380);
}
function ivUse(st) {
  if (!inInt) return;
  ivGo = null; playerYaw = st.ry; openPanel(inInt.loc, st.tab || undefined);
}
function ivAct(n) { if (!n) return; if (n.door) { ivGo = null; ivExit(); } else ivUse(n.st); }
function ivTarget() {
  const D = inInt;
  return new T.Vector3(playerPos.x * .55, 1.25, playerPos.z * .45 - D.d * .06);
}
function ivCamDir() { return new T.Vector3(Math.sin(camYaw) * Math.cos(camPitch), Math.sin(camPitch), Math.cos(camYaw) * Math.cos(camPitch)); }
function ivCamSnap() { const t = ivTarget(); camera.position.copy(t).addScaledVector(ivCamDir(), camDist); camera.lookAt(t); }
function ivViewOff() {
  const W = innerWidth, H = innerHeight; let ox = 0, oy = 0;
  if (panelId) { if (W > 820) ox = Math.round((Math.min(430, W * .94) + 12) / 2); else oy = Math.round(H * .33); }
  const v = camera.view;
  if (ox || oy) { if (!v || !v.enabled || v.offsetX !== ox || v.offsetY !== oy || v.fullWidth !== W) camera.setViewOffset(W, H, ox, oy, W, H); }
  else if (v && v.enabled) camera.clearViewOffset();
}
function ivCollide(p) {
  const D = inInt, r = .4;
  for (const c of D.cols) {
    const nx = Math.max(c.x0, Math.min(p.x, c.x1)), nz = Math.max(c.z0, Math.min(p.z, c.z1)), dx = p.x - nx, dz = p.z - nz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-6) { const d = Math.sqrt(d2); p.x = nx + dx / d * r; p.z = nz + dz / d * r; }
      else { const l = p.x - c.x0, rr = c.x1 - p.x, t = p.z - c.z0, b = c.z1 - p.z, m = Math.min(l, rr, t, b); if (m === l) p.x = c.x0 - r; else if (m === rr) p.x = c.x1 + r; else if (m === t) p.z = c.z0 - r; else p.z = c.z1 + r; }
    }
  }
  p.x = Math.max(-D.w / 2 + .45, Math.min(D.w / 2 - .45, p.x)); p.z = Math.max(-D.d / 2 + .45, Math.min(D.d / 2 - .45, p.z));
}
function ivUpdate(dt) {
  const D = inInt; D.t += dt; wTime += dt;
  dayT = (dayT + dt / 360) % 1;
  D.npcs.forEach(n => ivAnimNPC(n, dt));
  D.spin.forEach(o => o.rotation.y += dt * .35);
  D.rings.forEach((r, i) => { r.rotation.z += dt; r.scale.setScalar(1 + Math.sin(wTime * 3 + i) * .06); });
  D.labels.forEach((s, i) => { s.position.y = s.userData.y + Math.sin(wTime * 2 + i) * .07; });
  if (D.tick) D.tick(dt, D.t);
  if (!player) return;
  let ix = 0, iy = 0;
  if (mode === 'game' && !uiBlocked && !dying) {
    if (keys.KeyW || keys.ArrowUp) iy += 1; if (keys.KeyS || keys.ArrowDown) iy -= 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1; if (keys.KeyD || keys.ArrowRight) ix += 1;
    if (joy.active) { ix += joy.x; iy += joy.y; }
  }
  let len = Math.hypot(ix, iy), moving = len > .15, ag = null;
  if (moving || uiBlocked || dying || mode !== 'game') ivGo = null;
  if (!moving && ivGo) {
    const tg = ivGo.path ? ivGo.path[0] : ivGo, dx = tg.x - playerPos.x, dz = tg.z - playerPos.z, dd = Math.hypot(dx, dz);
    if (dd < .3) {
      if (ivGo.path && ivGo.path.length > 1) ivGo.path.shift();
      else { const g = ivGo; ivGo = null; if (g.st) ivUse(g.st); else if (g.door) ivExit(); }
    } else { ag = [dx / dd, dz / dd]; moving = true; len = 1; ivGo.t += dt; }
  }
  const run = (keys.ShiftLeft || keys.ShiftRight || (len > .95 && joy.active)) && !ag;
  if (moving) {
    let mx, mz;
    if (ag) { mx = ag[0]; mz = ag[1]; }
    else { const fx_ = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw); mx = fx_ * iy + rx * ix; mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); mx /= ml; mz /= ml; }
    const sp = (run ? 7 : ag ? 4.6 : 4.2) * Math.min(1, len), bx0 = playerPos.x, bz0 = playerPos.z;
    playerPos.x += mx * sp * dt; playerPos.z += mz * sp * dt; ivCollide(playerPos);
    if (ag && ivGo) {
      const mv = Math.hypot(playerPos.x - bx0, playerPos.z - bz0);
      ivGo.stuck = mv < sp * dt * .35 ? ivGo.stuck + dt : Math.max(0, ivGo.stuck - dt);
      if (ivGo.stuck > .5 || ivGo.t > 7) { const tg = ivGo.path ? ivGo.path[ivGo.path.length - 1] : ivGo; playerPos.set(tg.x, 0, tg.z); if (ivGo.path) ivGo.path = [tg]; ivGo.stuck = 0; }
    }
    let df = Math.atan2(mx, mz) - playerYaw; df = Math.atan2(Math.sin(df), Math.cos(df)); playerYaw += df * Math.min(1, dt * 12);
    if (player.emoteT > 0) player.emoteT = 0;
  }
  player.g.position.copy(playerPos); player.g.rotation.y = playerYaw;
  animHuman(player, dt, moving, run);
  // câmara (corte tipo casa de bonecas)
  camYaw = Math.max(-.7, Math.min(.7, camYaw)); camPitch = Math.max(.4, Math.min(1.1, camPitch)); camDist = Math.max(ivBase(D) * .6, Math.min(ivBase(D) * 1.35, camDist));
  const t = ivTarget(), want = t.clone().addScaledVector(ivCamDir(), camDist);
  camera.position.lerp(want, Math.min(1, dt * 6)); camera.lookAt(t);
  D.walls.forEach(W => { const c = W.nx ? camera.position.x * W.nx : camera.position.z * W.nz; W.g.visible = c < W.p + .1; });
  ivViewOff();
  // perto de um balcão / da porta
  let best = null, bd = 1.5;
  if (mode === 'game' && !dying) {
    D.stations.forEach(st => { const d = Math.hypot(st.x - playerPos.x, st.z - playerPos.z); if (d < bd) { bd = d; best = { st }; } });
    const dd = Math.hypot(D.door.x - playerPos.x, D.door.z - playerPos.z); if (dd < 1.3 && dd < bd) best = { door: true };
  }
  const key = best ? (best.door ? 'door' : best.st.label) : null, cur = ivNear ? (ivNear.door ? 'door' : ivNear.st.label) : null;
  if (key !== cur || (best && $('#prompt').classList.contains('hidden') && !panelId)) { ivNear = best; ivPrompt(best); }
}
function ivPrompt(n) {
  const p = $('#prompt');
  if (!n || mode !== 'game') { p.classList.add('hidden'); return; }
  p.innerHTML = n.door ? `🚪 <b>Sair para a rua</b> <span class="k">${IS_MOBILE ? 'SAIR' : 'E'}</span>` : `${n.st.ico} <b>${n.st.label}</b> <span class="k">${IS_MOBILE ? 'ABRIR' : 'E'}</span>`;
  p.classList.remove('hidden');
}
function ivPick(cx, cy) {
  const r = renderer.domElement.getBoundingClientRect();
  IV_V2.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  IV_RAY.setFromCamera(IV_V2, camera);
  const h = IV_RAY.intersectObjects(inInt.hits, false)[0];
  if (h) return 'iv:' + h.object.userData.iv;
  const f = IV_RAY.intersectObject(inInt.floor, false)[0];
  if (f) return 'iv:fl:' + f.point.x.toFixed(2) + ':' + f.point.z.toFixed(2);
  return null;
}
function ivTap(id) {
  if (!inInt || uiBlocked || dying) return;
  const s = id.split(':');
  if (s[1] === 'door') { const dd = Math.hypot(inInt.door.x - playerPos.x, inInt.door.z - playerPos.z); if (dd < 1.6) return ivExit(); ivGo = { x: inInt.door.x, z: inInt.door.z, door: true, t: 0, stuck: 0 }; return; }
  if (s[1] === 'st') { const st = inInt.stations[+s[2]]; if (!st) return; const dd = Math.hypot(st.x - playerPos.x, st.z - playerPos.z); if (dd < 1.4) return ivUse(st); ivGo = { x: st.x, z: st.z, st, t: 0, stuck: 0 }; return; }
  if (s[1] === 'fl') { ivGo = { x: +s[2], z: +s[3], t: 0, stuck: 0 }; }
}

/* ---------- ligar ao resto do jogo ---------- */
(function ivHook() {
  const _openLoc = openLocation;
  openLocation = function (id) {
    if (inInt) { if (id === inInt.loc && (id !== 'casa' || IV_CACHE[ivCasaKey()] === inInt)) return openPanel(id); ivExit(true); }
    if (IV_IDS.includes(id) && mode === 'game' && player && worldScene && G) {
      if (G.preso > 0 && id !== 'cela') return toast('🔒 Estás preso(a)! Não podes sair da cela.');
      return ivEnter(id);
    }
    return _openLoc(id);
  };
  const _goT = goTeleport; goTeleport = function (id) { if (inInt) ivExit(true); return _goT(id); };
  const _tapE = tapEnter; tapEnter = function (id) { if (inInt) { if (typeof id === 'string' && id.startsWith('iv:')) ivTap(id); return; } return _tapE(id); };
  const _pick = pickLoc; pickLoc = function (cx, cy) { if (inInt) return (camera && renderer) ? ivPick(cx, cy) : null; return _pick(cx, cy); };
  const _spawn = spawnPlayer; spawnPlayer = function (at) {
    if (inInt && !at && player) {
      inInt.sc.remove(player.g); player = makeHuman(playerCfg()); player.lookKey = lookKey(); if (G.idade >= 70) player.P.body.rotation.x = .12;
      inInt.sc.add(player.g); player.g.position.copy(playerPos); return;
    }
    if (inInt) ivExit(true);
    return _spawn(at);
  };
  const _upd = updateWorld; updateWorld = function (dt) { if (inInt) return ivUpdate(dt); return _upd(dt); };
  const _die = die; die = function (c) { if (inInt) ivExit(true); return _die(c); };
  const _rel = releaseFromPrison; releaseFromPrison = function () { if (inInt) ivExit(true); return _rel(); };
  const _ref = refresh; refresh = function () { const r = _ref.apply(this, arguments); try { if (worldScene && typeof placeCasa === 'function' && !inInt) placeCasa(); } catch (e) { } return r; };
  addEventListener('keydown', e => { if (inInt && mode === 'game' && !uiBlocked && (e.code === 'KeyE' || e.code === 'Enter') && ivNear) ivAct(ivNear); });
  const hud = document.getElementById('hud');
  if (hud && !document.getElementById('ivBar')) hud.insertAdjacentHTML('beforeend', '<button id="ivBar" onclick="ivExit()">🚪 <span>Sair</span> · <b id="ivName"></b></button>');
  const pr = document.getElementById('prompt'); if (pr) pr.onclick = () => { if (inInt) { if (ivNear) ivAct(ivNear); } else if (nearLoc) openLocation(nearLoc); };
})();
