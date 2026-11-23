
/* ---------------- veículos em 2D (vista lateral) ---------------- */
const TR_CARP = {
  mini: { L: 150, bh: 40, cl: 14, c: [-62, -42, 20, 40], ch: 36, wr: 17, wx: 48 },
  sedan: { L: 205, bh: 36, cl: 14, c: [-74, -52, 22, 54], ch: 34, wr: 18, wx: 66 },
  ev: { L: 210, bh: 34, cl: 14, c: [-86, -46, 28, 74], ch: 34, wr: 19, wx: 68 },
  suv: { L: 215, bh: 48, cl: 22, c: [-104, -98, 36, 62], ch: 42, wr: 22, wx: 68 },
  pickup: { L: 230, bh: 46, cl: 22, c: [-20, -14, 40, 66], ch: 40, wr: 22, wx: 74, bed: 1 },
  sport: { L: 215, bh: 30, cl: 8, c: [-60, -28, 14, 64], ch: 26, wr: 19, wx: 70, spoiler: 1 },
  jeep: { L: 212, bh: 52, cl: 26, c: [-104, -102, 50, 58], ch: 46, wr: 24, wx: 68, spare: 1 },
  van: { L: 240, bh: 96, cl: 18, c: null, wr: 20, wx: 80, van: 1 },
};
function trWheel2D(x, cx, cy, r, rot, tyre) {
  trCirc(x, cx, cy, r, '#151515'); trCirc(x, cx, cy, r * (tyre || .6), '#c9ced4'); trCirc(x, cx, cy, r * .2, '#555');
  x.strokeStyle = '#7d848c'; x.lineWidth = Math.max(1, r * .1); for (let k = 0; k < 5; k++) { const a = rot + k * 1.2566; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r * (tyre || .6), cy + Math.sin(a) * r * (tyre || .6)); x.stroke(); }
}
function trCar2D(x, cx, gy, s, mod, col, rot, cfg) {
  const P = TR_CARP[mod] || TR_CARP.sedan, L = P.L * s, top = gy - (P.cl + P.bh) * s, bot = gy - P.cl * s;
  x.save();
  x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(cx, gy + 2 * s, L * .52, 8 * s, 0, 0, 7); x.fill();
  if (P.c) { const c = P.c.map(v => cx + v * s), ct = top - P.ch * s; trPoly(x, [[c[0], top + 2], [c[1], ct], [c[2], ct], [c[3], top + 2]], col); trPoly(x, [[c[0] + 7 * s, top], [c[1] + 5 * s, ct + 5 * s], [c[2] - 3 * s, ct + 5 * s], [c[3] - 9 * s, top]], '#1c2a38'); x.fillStyle = col; x.fillRect((c[1] + c[2]) / 2 - 2 * s, ct, 5 * s, P.ch * s);
    const hx = c[2] - 14 * s, hy = ct + P.ch * s * .5; if (cfg) { trCirc(x, hx, hy, 9 * s, cfg.skin); x.fillStyle = cfg.hairColor || '#141414'; x.beginPath(); x.arc(hx, hy - 2 * s, 9.5 * s, Math.PI, 0); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,.18)'; trPoly(x, [[c[1] + 12 * s, ct + 6 * s], [c[1] + 22 * s, ct + 6 * s], [c[1] + 8 * s, top - 2 * s], [c[1] - 2 * s, top - 2 * s]], 'rgba(255,255,255,.18)'); }
  const g = x.createLinearGradient(0, top, 0, bot); g.addColorStop(0, col); g.addColorStop(1, trMix(col.length === 7 ? col : '#888888', '#000000', .35));
  x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(cx - L / 2, top, L, bot - top, 12 * s) : x.rect(cx - L / 2, top, L, bot - top); x.fill();
  if (P.van) { x.fillStyle = '#f2f2f2'; x.fillRect(cx - L / 2, top + 30 * s, L, 14 * s); x.fillStyle = '#1c2a38'; for (let k = 0; k < 5; k++) x.fillRect(cx - L / 2 + 14 * s + k * 38 * s, top + 6 * s, 30 * s, 20 * s); x.fillRect(cx + L / 2 - 22 * s, top + 6 * s, 18 * s, 30 * s); if (cfg) trCirc(x, cx + L / 2 - 30 * s, top + 18 * s, 8 * s, cfg.skin); }
  if (P.bed) { x.fillStyle = trMix(col, '#000000', .25); x.fillRect(cx - L / 2 + 6 * s, top - 12 * s, 100 * s, 12 * s); }
  if (P.spoiler) { x.fillStyle = '#151515'; x.fillRect(cx - L / 2 + 2 * s, top - 14 * s, 34 * s, 5 * s); x.fillRect(cx - L / 2 + 14 * s, top - 10 * s, 4 * s, 10 * s); }
  if (P.spare) { trCirc(x, cx - L / 2 - 6 * s, top + 24 * s, 18 * s, '#151515'); trCirc(x, cx - L / 2 - 6 * s, top + 24 * s, 8 * s, '#777'); }
  x.fillStyle = '#fff3b0'; x.fillRect(cx + L / 2 - 8 * s, top + 8 * s, 8 * s, 8 * s); x.fillStyle = '#d81e3a'; x.fillRect(cx - L / 2, top + 8 * s, 6 * s, 9 * s);
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(cx - 10 * s, top + (bot - top) * .45, 18 * s, 3 * s);
  [-1, 1].forEach(k => { const wx = cx + k * P.wx * s; trCirc(x, wx, gy - P.wr * s, P.wr * s + 4 * s, '#111'); trWheel2D(x, wx, gy - P.wr * s, P.wr * s, rot); });
  x.restore();
}
function trRider(x, hip, hand, foot, s, cfg, lean, helmet, col) {
  const sh = [hip[0] + 16 * s * lean, hip[1] - 34 * s];
  x.lineCap = 'round'; x.strokeStyle = cfg.pants || '#2a3550'; x.lineWidth = 9 * s; const knee = [(hip[0] + foot[0]) / 2 + 10 * s, Math.min(hip[1], foot[1]) - 6 * s];
  x.beginPath(); x.moveTo(hip[0], hip[1]); x.lineTo(knee[0], knee[1]); x.lineTo(foot[0], foot[1]); x.stroke();
  x.strokeStyle = cfg.shirt || '#c8102e'; x.lineWidth = 15 * s; x.beginPath(); x.moveTo(hip[0], hip[1]); x.lineTo(sh[0], sh[1]); x.stroke();
  x.lineWidth = 7 * s; x.beginPath(); x.moveTo(sh[0], sh[1]); x.lineTo((sh[0] + hand[0]) / 2, (sh[1] + hand[1]) / 2 + 6 * s); x.lineTo(hand[0], hand[1]); x.stroke();
  const hx = sh[0] + 4 * s, hy = sh[1] - 14 * s;
  if (helmet) { trCirc(x, hx, hy, 13 * s, col); x.fillStyle = '#1c2a38'; x.beginPath(); x.arc(hx + 3 * s, hy + 1 * s, 9 * s, -.6, .9); x.lineTo(hx + 3 * s, hy + 1 * s); x.fill(); }
  else { trCirc(x, hx, hy, 10 * s, cfg.skin); x.fillStyle = cfg.hairColor || '#141414'; x.beginPath(); x.arc(hx, hy - 2 * s, 10.5 * s, Math.PI, 0); x.fill(); }
}
function trMoto2D(x, cx, gy, s, mod, col, rot, cfg) {
  const sc = mod === 'scooter', r = (sc ? 14 : mod === 'trail' ? 21 : 19) * s, wb = (sc ? 36 : 44) * s, wy = gy - r;
  x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(cx, gy + 2 * s, wb + r, 6 * s, 0, 0, 7); x.fill();
  [-1, 1].forEach(k => trWheel2D(x, cx + k * wb, wy, r, rot, .55));
  x.strokeStyle = '#9aa0a6'; x.lineWidth = 4 * s; x.beginPath(); x.moveTo(cx + wb, wy); x.lineTo(cx + wb - 10 * s, wy - 40 * s); x.stroke();
  if (sc) { trPoly(x, [[cx - wb - 4 * s, wy - 4 * s], [cx - wb + 10 * s, wy - 30 * s], [cx - 4 * s, wy - 30 * s], [cx + 6 * s, wy - 6 * s], [cx + wb - 12 * s, wy - 8 * s], [cx + wb - 6 * s, wy - 44 * s], [cx + wb - 16 * s, wy - 46 * s], [cx + wb - 22 * s, wy - 12 * s], [cx - 4 * s, wy]], col); x.fillStyle = '#151515'; x.fillRect(cx - wb + 6 * s, wy - 36 * s, 36 * s, 7 * s); }
  else {
    x.strokeStyle = '#555'; x.lineWidth = 5 * s; x.beginPath(); x.moveTo(cx - wb, wy); x.lineTo(cx - 6 * s, wy - 26 * s); x.stroke();
    x.fillStyle = '#3a3a3a'; x.fillRect(cx - 12 * s, wy - 20 * s, 24 * s, 18 * s);
    x.strokeStyle = '#b0b5bb'; x.lineWidth = 4 * s; x.beginPath(); x.moveTo(cx - 6 * s, wy - 2 * s); x.lineTo(cx - wb - 6 * s, wy - 8 * s); x.stroke();
    trPoly(x, [[cx - 8 * s, wy - 28 * s], [cx + 2 * s, wy - 42 * s], [cx + 26 * s, wy - 40 * s], [cx + 22 * s, wy - 24 * s]], col);
    x.fillStyle = '#151515'; x.fillRect(cx - 36 * s, wy - 34 * s, 30 * s, 7 * s);
    if (mod === 'superbike') { trPoly(x, [[cx + 18 * s, wy - 44 * s], [cx + wb + 4 * s, wy - 30 * s], [cx + wb - 4 * s, wy - 10 * s], [cx + 6 * s, wy - 8 * s]], col); trPoly(x, [[cx - 40 * s, wy - 30 * s], [cx - wb - 6 * s, wy - 40 * s], [cx - wb + 6 * s, wy - 30 * s]], col); }
    if (mod === 'trail') { x.fillStyle = col; x.fillRect(cx + wb - 16 * s, wy - r - 6 * s, 26 * s, 5 * s); }
  }
  x.fillStyle = '#fff3b0'; x.fillRect(cx + wb - 6 * s, wy - 40 * s, 6 * s, 7 * s);
  const hip = [cx - 18 * s, wy - (sc ? 38 : 36) * s];
  if (cfg) trRider(x, hip, [cx + wb - 14 * s, wy - 44 * s], [cx + (sc ? 4 : -2) * s, wy - 8 * s], s, cfg, mod === 'superbike' ? 1.6 : .8, true, mod === 'superbike' ? '#151515' : col);
}
function trBike2D(x, cx, gy, s, mod, col, rot, cfg) {
  const r = (mod === 'bmx' ? 17 : 22) * s, wb = (mod === 'bmx' ? 28 : 34) * s, wy = gy - r;
  x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(cx, gy + 2 * s, wb + r, 5 * s, 0, 0, 7); x.fill();
  [-1, 1].forEach(k => { const wx = cx + k * wb; x.strokeStyle = '#151515'; x.lineWidth = (mod === 'btt' ? 5 : mod === 'corrida' ? 2.5 : 3.5) * s; x.beginPath(); x.arc(wx, wy, r, 0, 7); x.stroke(); x.strokeStyle = '#aaa'; x.lineWidth = 1 * s; for (let q = 0; q < 6; q++) { const a = rot + q * 1.047; x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r); x.stroke(); } });
  const bb = [cx - 2 * s, wy + 2 * s], seat = [cx - 12 * s, wy - 30 * s * (mod === 'bmx' ? .7 : 1)], head = [cx + wb - 8 * s, wy - 30 * s * (mod === 'bmx' ? .8 : 1)];
  x.strokeStyle = col; x.lineWidth = 4 * s; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - wb, wy); x.lineTo(bb[0], bb[1]); x.lineTo(head[0], head[1]); x.lineTo(cx + wb, wy); x.moveTo(cx - wb, wy); x.lineTo(seat[0], seat[1]); x.lineTo(bb[0], bb[1]); if (mod !== 'bike') { x.moveTo(seat[0], seat[1]); x.lineTo(head[0], head[1]); } x.stroke();
  if (mod === 'ebike') { x.fillStyle = '#222'; x.save(); x.translate((bb[0] + head[0]) / 2, (bb[1] + head[1]) / 2); x.rotate(-.7); x.fillRect(-12 * s, -4 * s, 24 * s, 8 * s); x.restore(); }
  if (mod === 'bike') { x.fillStyle = '#8a5a2b'; x.fillRect(cx + wb - 6 * s, wy - 36 * s, 18 * s, 12 * s); }
  x.fillStyle = '#151515'; x.fillRect(seat[0] - 8 * s, seat[1] - 3 * s, 16 * s, 4 * s);
  const ca = rot * 1.4, f1 = [bb[0] + Math.cos(ca) * 9 * s, bb[1] + Math.sin(ca) * 9 * s];
  if (cfg) trRider(x, [seat[0], seat[1] - 2 * s], [head[0] + 2 * s, head[1] - 4 * s], f1, s, cfg, mod === 'corrida' ? 1.8 : 1, mod === 'corrida' || mod === 'btt', col);
}
function trTrain2D(x, rx, gy, s, rot, col) {
  const L = 300 * s, H = 110 * s;
  for (let k = 0; k < 4; k++) {
    const x1 = rx - k * (L + 8 * s), x0 = x1 - L, top = gy - 18 * s - H;
    x.fillStyle = col; x.beginPath(); if (k === 0) { x.moveTo(x0, top); x.lineTo(x1 - 40 * s, top); x.quadraticCurveTo(x1 + 10 * s, top + 10 * s, x1 + 4 * s, gy - 18 * s); x.lineTo(x0, gy - 18 * s); } else x.rect(x0, top, L, H); x.fill();
    x.fillStyle = '#ffcb00'; x.fillRect(x0, gy - 48 * s, L - (k ? 0 : 8 * s), 9 * s); x.fillStyle = '#9aa0a6'; x.fillRect(x0 + 4 * s, top - 8 * s, L - 8 * s - (k ? 0 : 40 * s), 8 * s);
    x.fillStyle = '#1c2a38'; for (let w = 0; w < 7; w++) { const wx = x0 + 18 * s + w * 38 * s; if (k === 0 && w > 5) break; x.fillRect(wx, top + 20 * s, 28 * s, 30 * s); }
    if (k === 0) { x.fillStyle = '#1c2a38'; x.fillRect(x1 - 36 * s, top + 16 * s, 28 * s, 34 * s); x.fillStyle = '#fff3b0'; x.fillRect(x1 - 4 * s, gy - 34 * s, 6 * s, 8 * s); }
    x.fillStyle = '#222'; x.fillRect(x0 + 20 * s, gy - 22 * s, 70 * s, 10 * s); x.fillRect(x1 - 90 * s, gy - 22 * s, 70 * s, 10 * s);
    [34, 76, -76, -34].forEach(o => trWheel2D(x, (o > 0 ? x0 : x1) + o * s, gy - 10 * s, 10 * s, rot, .5));
    if (k === 1) { x.fillStyle = '#fff'; x.font = `900 ${14 * s}px system-ui`; x.textAlign = 'left'; x.fillText('FERROVIA KIANDA', x0 + 20 * s, gy - 56 * s); }
  }
}
function trPlane2D(x, cx, cy, s, col, tilt) {
  x.save(); x.translate(cx, cy); x.rotate(-tilt); const L = 380 * s, R = 34 * s;
  trPoly(x, [[-L * .42, -R * .6], [-L * .5, -R * 3.2], [-L * .4, -R * 3.2], [-L * .26, -R * .6]], col);
  x.fillStyle = '#f4f6f8'; x.beginPath(); x.moveTo(-L / 2, -R * .5); x.lineTo(L * .36, -R); x.quadraticCurveTo(L / 2 + 10 * s, -R * .2, L * .44, R * .6); x.lineTo(-L * .38, R * .8); x.lineTo(-L / 2, R * .1); x.closePath(); x.fill();
  x.fillStyle = col; x.fillRect(-L * .44, R * .1, L * .84, R * .3);
  x.fillStyle = '#1c2a38'; for (let k = 0; k < 18; k++) x.fillRect(-L * .3 + k * 14 * s, -R * .45, 7 * s, 9 * s); x.fillRect(L * .38, -R * .65, 18 * s, 10 * s);
  trPoly(x, [[-L * .02, R * .3], [L * .1, R * .3], [-L * .08, R * 1.7], [-L * .14, R * 1.7]], '#d7dce1');
  x.fillStyle = '#9aa0a6'; x.beginPath(); x.ellipse(L * .02, R * 1.05, 26 * s, 12 * s, 0, 0, 7); x.fill();
  x.font = `900 ${13 * s}px system-ui`; x.fillStyle = col; x.fillText('PALANCA AIRLINES', -L * .2, -R * .7);
  x.restore();
}

/* ---------------- ciclo da viagem ---------------- */
function trCloud(x, cx, cy, s, a) { x.fillStyle = `rgba(255,255,255,${a})`; [[0, 0, 30], [26, -10, 26], [52, 0, 28], [24, 8, 26], [-24, 6, 20], [74, 8, 18]].forEach(([dx, dy, r]) => { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, r * s, 0, 7); x.fill(); }); }
function trDraw(t) {
  const cv = TR.cv, x = TR.ctx, W = cv.width, H = cv.height, s = Math.min(W / 1100, H / 650), p = Math.min(1, TR.t / TR.dur), D = TR.D;
  const kind = TR.kind, tod = (TR.tod0 + p * .12) % 1, night = trNight(tod), [st, sb] = trSky(tod), hz = H * (kind === 'train' && !VH.cam ? .47 : .6);
  const plane = kind === 'plane', alt = plane ? (p < .05 ? 0 : p < .2 ? (p - .05) / .15 : p > .94 ? 0 : p > .8 ? (.94 - p) / .14 : 1) : 0, A = alt * alt * (3 - 2 * alt);
  const g = x.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, st); g.addColorStop(1, sb); x.fillStyle = g; x.fillRect(0, 0, W, H);
  if (A > 0) { const g2 = x.createLinearGradient(0, 0, 0, H); g2.addColorStop(0, night > .5 ? '#050818' : '#1d5fc0'); g2.addColorStop(1, night > .5 ? '#1d2c55' : '#cfe8ff'); x.globalAlpha = A; x.fillStyle = g2; x.fillRect(0, 0, W, H); x.globalAlpha = 1; }
  // estrelas / sol / lua
  if (night > .05) { x.fillStyle = `rgba(255,255,255,${night * .8})`; for (let i = 0; i < 70; i++) x.fillRect(trRnd(i, 1) * W, trRnd(i, 2) * hz * .8, 1.6 * s, 1.6 * s); }
  const sa = (tod - .25) / .5; if (sa > -.05 && sa < 1.05) { const sx = W * (.1 + .8 * sa), sy = hz - Math.sin(Math.PI * Math.max(0, Math.min(1, sa))) * H * .45; const sg = x.createRadialGradient(sx, sy, 0, sx, sy, 70 * s); sg.addColorStop(0, 'rgba(255,240,200,1)'); sg.addColorStop(.25, 'rgba(255,220,150,.9)'); sg.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = sg; x.fillRect(sx - 70 * s, sy - 70 * s, 140 * s, 140 * s); }
  else trCirc(x, W * .78, H * .18, 22 * s, '#f4f1e0');
  // bioma
  const bios = plane ? [p < .5 ? 'cidade' : D.bio] : D.bio, n = bios.length, bi = Math.min(n - 1, Math.floor(p * n)), fr = p * n - bi, sc = TR.sc;
  const drawB = (k, L) => { const gr = TR_GROUND[k] || TR_GROUND.savana; if (!L) { const gg = x.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, gr[0]); gg.addColorStop(1, gr[1]); x.fillStyle = gg; x.fillRect(0, hz, W, H - hz); } trBiome(x, k, W, H, sc, t, hz, s, L); };
  x.save(); if (A > 0) { x.translate(0, A * H * .9); }
  if (A < 1) { drawB(bios[bi]); if (fr > .85 && bi < n - 1) { x.globalAlpha = (fr - .85) / .15; drawB(bios[bi + 1]); x.globalAlpha = 1; } }
  // estrada / linha
  const rY = H * .8;
  if (!plane) {
    const dirt = D.terra && bios[bi] !== 'cidade' && TR.kind !== 'train';
    if (kind === 'train') { x.fillStyle = '#6e5a48'; x.fillRect(0, rY - 4 * s, W, 26 * s); x.fillStyle = '#5a3d26'; trLayer(sc, 1, 26 * s, 31, W, px => x.fillRect(px, rY + 2 * s, 12 * s, 14 * s)); x.fillStyle = '#b0b5bb'; x.fillRect(0, rY, W, 4 * s); x.fillRect(0, rY + 12 * s, W, 3 * s); trLayer(sc, 1, 520 * s, 32, W, px => { x.fillStyle = '#5a4a3a'; x.fillRect(px, hz - 40 * s, 6 * s, rY - hz + 36 * s); x.fillRect(px - 20 * s, hz - 36 * s, 46 * s, 4 * s); }); x.strokeStyle = 'rgba(30,30,30,.6)'; x.lineWidth = 1.5 * s; x.beginPath(); x.moveTo(0, hz - 30 * s); x.lineTo(W, hz - 30 * s); x.stroke(); }
    else {
      x.fillStyle = bios[bi] === 'cidade' ? '#9a9a96' : 'rgba(0,0,0,.12)'; x.fillRect(0, rY - 30 * s, W, 8 * s);
      x.fillStyle = dirt ? '#a87a4a' : '#3a3c40'; x.fillRect(0, rY - 22 * s, W, 70 * s);
      if (!dirt) { x.fillStyle = '#e8e8e8'; x.fillRect(0, rY - 20 * s, W, 2.5 * s); x.fillRect(0, rY + 44 * s, W, 2.5 * s); x.fillStyle = '#f2c94c'; trLayer(sc, 1, 110 * s, 33, W, px => x.fillRect(px, rY + 12 * s, 50 * s, 4 * s)); }
      else { x.fillStyle = 'rgba(0,0,0,.12)'; trLayer(sc, 1, 60 * s, 34, W, (px, r) => x.fillRect(px, rY + r * 40 * s - 14 * s, 20 * s, 4 * s)); }
      trLayer(sc, 1, (bios[bi] === 'cidade' ? 380 : 700) * s, 35, W, px => { if (bios[bi] === 'cidade') { x.fillStyle = '#555'; x.fillRect(px, rY - 120 * s, 5 * s, 96 * s); x.fillRect(px, rY - 120 * s, 30 * s, 4 * s); x.fillStyle = '#ffe8a0'; x.fillRect(px + 22 * s, rY - 117 * s, 12 * s, 5 * s); } else { x.fillStyle = '#f2f2f2'; x.fillRect(px, rY - 40 * s, 8 * s, 18 * s); x.fillStyle = '#c8102e'; x.fillRect(px, rY - 40 * s, 8 * s, 5 * s); } });
    }
    // placa de chegada
    if (p > .88) { const sx = W * 1.05 - (p - .88) / .1 * W * 1.2; x.fillStyle = '#666'; x.fillRect(sx + 40 * s, rY - 140 * s, 6 * s, 120 * s); x.fillStyle = '#1f7a3a'; x.fillRect(sx - 30 * s, rY - 190 * s, 150 * s, 56 * s); x.strokeStyle = '#fff'; x.lineWidth = 2 * s; x.strokeRect(sx - 26 * s, rY - 186 * s, 142 * s, 48 * s); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `800 ${11 * s}px system-ui`; x.fillText('BEM-VINDO(A) A', sx + 45 * s, rY - 170 * s); x.font = `900 ${14 * s}px system-ui`; x.fillText(D.n.split(/[(&·]/)[0].trim().slice(0, 20).toUpperCase(), sx + 45 * s, rY - 150 * s); }
  }
  x.restore();
  // nuvens (avião)
  if (plane) {
    if (A > .05) { for (let row = 0; row < 3; row++) trLayer(sc, .15 + row * .2, (220 - row * 30) * s, 40 + row, W, (px, r) => trCloud(x, px, H * (.62 + row * .12) + (1 - A) * H * .6 + r * 20 * s, s * (1.6 + row * .6), (.75 + row * .08) * A)); x.fillStyle = `rgba(255,255,255,${A * .9})`; x.fillRect(0, H * .9 + (1 - A) * H * .6, W, H); }
    trLayer(sc, .05, 500 * s, 45, W, (px, r) => trCloud(x, px, H * (.12 + r * .2), s * (1 + r), .5));
  }
  // noite: escurece e acende as luzes
  if (night > .05) {
    x.fillStyle = `rgba(8,12,40,${night * .55})`; x.fillRect(0, 0, W, H);
    x.save(); if (A > 0) x.translate(0, A * H * .9); if (A < 1) trBiome(x, bios[bi], W, H, sc, t, hz, s, true); x.restore();
  }
  // veículo
  const rot = -TR.sc / (20 * s), bounce = Math.sin(t * 9) * (TR.v > .1 ? 1.2 : 0) * s, cfg = TR.cfg, vx = W * .36;
  if (kind === 'car') { trCar2D(x, vx, rY + 34 * s + bounce * .5, s * 1.25, TR.mod, TR.col, rot, cfg); if (night > .3) { const bg = x.createLinearGradient(vx + 130 * s, 0, vx + 500 * s, 0); bg.addColorStop(0, 'rgba(255,240,170,.45)'); bg.addColorStop(1, 'rgba(255,240,170,0)'); trPoly(x, [[vx + 130 * s, rY - 10 * s], [vx + 520 * s, rY - 40 * s], [vx + 520 * s, rY + 60 * s]], bg); } }
  else if (kind === 'moto') trMoto2D(x, vx, rY + 30 * s + bounce * .4, s * 1.35, TR.mod, TR.col, rot, cfg);
  else if (kind === 'bike') trBike2D(x, vx, rY + 28 * s + bounce * .3, s * 1.45, TR.mod, TR.col, rot, cfg);
  else if (kind === 'train') {
    if (VH.cam) trTrain2D(x, W * .82, rY + 18 * s + bounce * .2, s, rot * 2, '#2b9348');
    else { const sh = Math.sin(t * 13) * 1.5 * s; x.save(); x.translate(0, sh); trLayer(sc, 2.2, 900 * s, 50, W, px => { x.fillStyle = '#3a3026'; x.fillRect(px, 0, 14 * s, H); }); x.fillStyle = '#d8cbb0'; x.beginPath(); x.rect(-10, -10, W + 20, H + 20); const ww = W * .38, wh = H * .42, wy = H * .18; [W * .07, W * .55].forEach(wx => { x.roundRect ? x.roundRect(wx, wy, ww, wh, 26 * s) : x.rect(wx, wy, ww, wh); }); x.fill('evenodd'); x.strokeStyle = '#8a7a5a'; x.lineWidth = 8 * s; [W * .07, W * .55].forEach(wx => { x.beginPath(); x.roundRect ? x.roundRect(wx, wy, ww, wh, 26 * s) : x.rect(wx, wy, ww, wh); x.stroke(); });
      x.fillStyle = '#2b9348'; x.fillRect(0, H * .66, W, H * .06); x.fillStyle = '#6b4f2a'; x.fillRect(W * .2, H * .7, W * .6, H * .05); x.fillStyle = '#1d3557'; [W * .02, W * .82].forEach(q => { x.beginPath(); x.roundRect ? x.roundRect(q, H * .6, W * .16, H * .45, 30 * s) : x.rect(q, H * .6, W * .16, H * .45); x.fill(); });
      x.fillStyle = '#c84a3a'; [W * .07, W * .45, W * .55, W * .93].forEach((q, i) => x.fillRect(q - (i % 2 ? 14 * s : 0), H * .16, 14 * s, H * .46)); x.fillStyle = '#3a2a1a'; x.font = `800 ${14 * s}px system-ui`; x.textAlign = 'center'; x.fillText('FERROVIA KIANDA · ' + TR.clsN.toUpperCase(), W / 2, H * .1); x.restore(); }
  } else if (kind === 'plane') {
    if (VH.cam) trPlane2D(x, W * .45, H * .45 + Math.sin(t * 1.3) * 6 * s * A + (1 - A) * H * .3, s * 1.1, TR.col, p < .2 ? .12 * alt * (p < .2 ? 1 : 0) : p > .8 ? -.05 : 0);
    else { x.save(); const cx = W / 2, cy = H * .46, rx = Math.min(W * .26, H * .3), ry = rx * 1.3; trPoly(x, [[cx - rx * 1.2, cy + ry * .55], [cx + rx * .2, cy + ry * .25], [cx + rx * .3, cy + ry * .34], [cx - rx * 1.2, cy + ry * 1.1]], '#d7dce1'); x.fillStyle = TR.col; x.fillRect(cx + rx * .16, cy + ry * .1, rx * .1, ry * .2);
      x.fillStyle = '#ece6da'; x.beginPath(); x.rect(-10, -10, W + 20, H + 20); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill('evenodd'); x.strokeStyle = '#cfc6b4'; x.lineWidth = 22 * s; x.beginPath(); x.ellipse(cx, cy, rx + 8 * s, ry + 8 * s, 0, 0, 7); x.stroke(); x.fillStyle = '#d9d1c0'; x.beginPath(); x.ellipse(cx, cy - ry * .82, rx * .9, ry * .22, 0, Math.PI, 0); x.fill();
      x.fillStyle = '#9a917e'; x.font = `800 ${13 * s}px system-ui`; x.textAlign = 'center'; x.fillText('PALANCA AIRLINES · ' + TR.clsN.toUpperCase(), cx, H * .915); x.restore(); }
  }
}
function trLoop(now) {
  if (!TR) return; const dt = Math.min(.1, (now - (TR.last || now)) / 1000); TR.last = now;
  const p = Math.min(1, TR.t / TR.dur), tgt = TR.paused || TR.done ? 0 : Math.min(1, .15 + p / .05, .1 + (1 - p) / .05);
  TR.v += (tgt - TR.v) * Math.min(1, dt * 1.8); if (!TR.paused && !TR.done) TR.t += dt;
  TR.sc += dt * TR.v * TR.pxs * (TR.cv.height / 650);
  try { trDraw(now / 1000); } catch (e) { console.error(e); }
  TR.hudT += dt; if (TR.hudT > .2) { TR.hudT = 0; trHud(); }
  if (!TR.ev && TR.evAt && p >= TR.evAt && !TR.done) trEvent();
  if (p >= 1 && !TR.done) trArrive();
  TR.raf = requestAnimationFrame(trLoop);
}
function trSound() {
  if (!TR || typeof SND === 'undefined') return;
  const k = TR.v; if (TR.kind === 'car' || TR.kind === 'moto') SND.engine(TR.kind === 'moto' ? (TR.evc ? 'ev' : 'moto') : (TR.evc ? 'ev' : 'car'), Math.max(.05, k * .85));
  SND.tripAmb(TR.kind === 'train' ? 'train' : TR.kind === 'plane' ? 'plane' : 'road', TR.kind === 'plane' ? 1 : Math.max(.1, k));
}
function trHud() {
  const p = Math.min(1, TR.t / TR.dur), D = TR.D, km = Math.round(p * D.km);
  const vel = Math.round(TR.v * TR.vel * (TR.kind === 'plane' ? 1 : .92 + Math.sin(TR.t) * .05));
  const left = Math.max(0, D.km - km), hrs = left / Math.max(1, TR.vel * .75);
  $('#trKm').innerHTML = `<b>${km}</b>/${D.km} km`; $('#trVel').innerHTML = `<b>${vel}</b> km/h`; $('#trEta').innerHTML = left ? `<b>${hrs >= 1 ? Math.floor(hrs) + ' h ' + String(Math.round(hrs % 1 * 60)).padStart(2, '0') : Math.max(1, Math.round(hrs * 60)) + ' min'}</b> p/ chegar` : '<b>Chegaste!</b>';
  $('#trProg').style.width = (p * 100) + '%'; $('#trDot').style.left = (p * 100) + '%';
  const r = $('#trRadio'); if (TR.kind !== 'bike' && typeof LIVE !== 'undefined' && LIVE.st) { try { const st = lvStation(LIVE.st), nw = lvNowTxt(LIVE.st); r.innerHTML = `📻 <b>${st.n}</b> · ${esc(nw.t)}${nw.a ? ' — ' + esc(String(nw.a).slice(0, 60)) : ''}`; r.classList.remove('hidden'); } catch (e) { r.classList.add('hidden'); } } else r.classList.add('hidden');
  trSound();
}
function trUI() {
  if ($('#tripView')) return;
  document.body.insertAdjacentHTML('beforeend', `<div id="tripView" class="hidden"><canvas id="trCv"></canvas>
    <div class="trTop"><div class="trDest"><small id="trFrom"></small><b id="trTo"></b></div><div class="trStats"><span id="trKm"></span><span id="trVel"></span><span id="trEta"></span></div></div>
    <div class="trBar"><div class="trTrack"><i id="trProg"></i><span id="trDot"></span></div></div>
    <div class="trRadio hidden" id="trRadio"></div>
    <div class="trBtns"><button onclick="trPhoto()">📸 <span>Foto</span></button><button id="trRadBtn" onclick="trRadio()">📻 <span>Rádio</span></button><button id="trCamBtn" onclick="trCam()">🎥 <span>Câmara</span></button><button onclick="trSkip()">⏩ <span>Chegar já</span></button></div>
    <div class="trCard hidden" id="trCard"></div></div>`);
  if (typeof icHydrate === 'function') try { icHydrate($('#tripView')); } catch (e) { }
}
function trResize() { if (!TR) return; const d = Math.min(1.5, devicePixelRatio || 1); TR.cv.width = Math.round(innerWidth * d); TR.cv.height = Math.round(innerHeight * d); }
/* começa uma viagem: o = { kind, D, veh, mod, col, cost, cls, clsN, conf, energia } */
function trStart(o) {
  if (TR) return;
  trUI(); closePanel(); if (typeof closePhone === 'function') closePhone();
  if (typeof SND !== 'undefined') { SND.unlock(); SND.play(o.kind === 'train' ? 'trainHorn' : o.kind === 'plane' ? 'chime' : o.kind === 'bike' ? 'bell2' : 'car'); }
  const V = o.veh ? VEIC[o.veh] : null;
  TR = Object.assign({ t: 0, sc: 0, v: 0, hudT: 1, last: 0, fotos: 0, log: [], cfg: playerCfg(), ads: [], tod0: .3 + Math.random() * .52, ev: null, done: false, paused: false }, o);
  if (Math.random() < .18) TR.tod0 = .8 + Math.random() * .15;
  TR.vel = o.kind === 'train' ? (o.D.km < 80 ? 60 : 90) : o.kind === 'plane' ? 820 : (V ? V.vel : (VH_CAT[o.cat] || {}).vel || (o.kind === 'bike' ? 20 : o.kind === 'moto' ? 100 : 150)) * .75;
  TR.evc = V ? !!V.ev : false; TR.veh = o.veh || null;
  TR.pxs = o.kind === 'bike' ? 260 : o.kind === 'train' ? 620 : o.kind === 'plane' ? 260 : Math.min(1100, 420 + TR.vel * 2.6);
  TR.dur = o.dur || (o.kind === 'plane' ? 26 + Math.min(10, o.D.km / 800) : 17 + Math.min(13, o.D.km / 85));
  TR.evAt = o.noEv ? 0 : .42 + Math.random() * .12;
  try { const pool = muPool('placa').slice(0, 30); for (let i = 0; i < 4; i++) { const c = document.createElement('canvas'); c.width = 256; c.height = 128; muAdDraw(c.getContext('2d'), 256, 128, pool[Math.floor(Math.random() * pool.length)], 0); TR.ads.push(c); } } catch (e) { }
  TR.cv = $('#trCv'); TR.ctx = TR.cv.getContext('2d'); trResize();
  const ic_ = o.kind === 'plane' ? '✈️' : o.kind === 'train' ? '🚆' : o.kind === 'bike' ? '🚲' : o.kind === 'moto' ? '🏍️' : '🚗';
  $('#trFrom').innerHTML = `${ic_} ${o.vehN || ''} · Luanda →`; $('#trTo').textContent = o.D.n;
  $('#trCamBtn').style.display = o.kind === 'train' || o.kind === 'plane' ? '' : 'none'; $('#trRadBtn').style.display = o.kind === 'bike' ? 'none' : '';
  $('#trCard').classList.add('hidden'); $('#tripView').classList.remove('hidden'); document.body.classList.add('tripping');
  uiBlocked = true; VH.cam = 0; TR.raf = requestAnimationFrame(trLoop);
  addEventListener('resize', trResize);
}
function trPhoto() {
  if (!TR) return; if (G.tel < 2) return toast('📵 Precisas de um smartphone com câmara.');
  if (typeof SND !== 'undefined') SND.play('shutter');
  const f = document.createElement('div'); f.className = 'trFlash'; $('#tripView').appendChild(f); setTimeout(() => f.remove(), 400);
  TR.fotos++; if (TR.fotos <= 3) { G.fotos = G.fotos || []; G.fotos.unshift({ cfg: playerCfg(), bg: ['#1f5a8a', '#c4572e', '#2f6a35', '#e6a04a'][TR.fotos % 4], idade: G.idade, ano: G.ano, onde: 'a caminho de ' + TR.D.n }); if (G.fotos.length > 12) G.fotos.length = 12; }
  if (TR.fotos === 1) { const r = fx({ felicidade: 1 }); TR.log.push('📸 Primeira foto da viagem ' + r); }
  toast(TR.fotos <= 3 ? '📸 Foto guardada na galeria!' : '📸 Click! (a galeria guarda só as melhores)');
}
function trRadio() {
  if (!TR || typeof LV_ST === 'undefined') return; const ids = [null].concat(LV_ST.map(s => s.id)); const i = ids.indexOf(LIVE.st || null); const nx = ids[(i + 1) % ids.length];
  lvTune(nx); toast(nx ? '📻 ' + lvStation(nx).n : '📻 Rádio desligado'); TR.hudT = 1;
}
function trCam() { VH.cam = VH.cam ? 0 : 1; toast(VH.cam ? '🎥 Vista de fora' : '🪟 Vista da janela'); }
function trSkip() { if (!TR || TR.done) return; if (TR.paused) return; TR.t = TR.dur; if (!TR.evDone && TR.evAt) { TR.evAt = 0; } }
function trEvent() {
  const k = TR.kind === 'car' || TR.kind === 'moto' ? 'road' : TR.kind;
  const bio = TR.D.bio && Array.isArray(TR.D.bio) ? TR.D.bio : [];
  const pool = (TR_EV[k] || []).filter(e => (!e.ok || e.ok()) && (!e.kind || e.kind === TR.kind) && (!e.bio || e.bio.some(b => bio.includes(b))));
  TR.ev = true; if (!pool.length || Math.random() < .2) return;
  const E = pool[Math.floor(Math.random() * pool.length)]; TR.paused = true; TR.E = E;
  trCard(`<div class="trEvT">${E.t}</div><div class="trChoices">${E.c.map((c, i) => `<button onclick="trChoose(${i})">${c[0]}</button>`).join('')}</div>`);
  if (typeof SND !== 'undefined') SND.play('notif');
}
function trCard(h) { const c = $('#trCard'); c.innerHTML = h; c.classList.remove('hidden'); if (typeof icHydrate === 'function') try { icHydrate(c); } catch (e) { } }
function trChoose(i) {
  const E = TR.E; if (!E) return; TR.E = null; const [txt, ef] = E.c[i][1](); const r = fx(ef || {}); TR.log.push(txt + ' ' + r);
  trCard(`<div class="trEvT">${txt}</div><div class="trRes">${r || ''}</div><div class="trChoices"><button class="go" onclick="trResume()">Continuar viagem ▶</button></div>`);
  if (typeof SND !== 'undefined') SND.play(Object.values(ef || {}).some(v => v < 0) ? 'bad' : 'good');
}
function trResume() { $('#trCard').classList.add('hidden'); if (TR) TR.paused = false; }
function trArrive() {
  TR.done = true; const D = TR.D, v = vhG(), first = !D.noVis && !v.vis.includes(TR.kind + ':' + D.id);
  if (typeof SND !== 'undefined') { SND.engine('off'); SND.play('win'); }
  const ef = { felicidade: Math.round(D.f * (TR.kind === 'bike' ? .8 : 1)) + (TR.conf || 0) };
  if (first) { ef.inteligencia = (ef.inteligencia || 0) + (D.int ? 3 : 2); if (D.int) ef.fama = 1; }
  if (TR.kind === 'bike') ef.saude = Math.min(6, 1 + Math.round(D.km / 12));
  if (TR.kind === 'moto' && D.km > 300 && TR.mod !== 'trail') ef.saude = -2;
  if (TR.kind === 'car' && D.km > 600 && (TR.conf || 0) < 2) ef.saude = -1;
  const r = fx(ef); TR.log.unshift(`${D.ico} Chegaste a <b>${D.n}</b>! ${r}`);
  v.km += D.km * (D.ida ? 1 : 2); v.n++; if (first) v.vis.push(TR.kind + ':' + D.id); if (TR.kind === 'plane') v.mi = (v.mi || 0) + Math.round(D.km * (TR.cls === 'pri' ? 2 : TR.cls === 'exe' ? 1.5 : 1));
  if (D.pais && !v.car.includes(D.pais)) v.car.push(D.pais);
  const nv = new Set(v.vis.map(s => s.split(':')[1])).size; let extra = '';
  [[5, '🧭 Explorador(a): visitaste 5 destinos!', { fama: 2 }], [10, '🗺️ Viajante: 10 destinos!', { inteligencia: 3, fama: 2 }], [20, '🌍 Cidadão do mundo: 20 destinos!', { felicidade: 5, fama: 4 }]].forEach(([n, t, e]) => { if (nv >= n && !(v.lvl || []).includes(n)) { v.lvl = (v.lvl || []).concat(n); extra += `<div class="trMil">${t} ${fx(e)}</div>`; TR.log.push(t); } });
  const acts = (D.acts || []).map((a, i) => `<button onclick="trAct(${i})"><b>${a[0]} ${a[1]}</b><small>${a[3] ? kzShort(a[3]) : 'Grátis'}</small></button>`).join('');
  trCard(`<div class="trArr"><div class="trBig">${D.ico}</div><h3>Chegaste a ${D.n}!</h3><p>${D.d || ''}</p><div class="trRes">${r}</div>${first ? '<div class="trMil">✨ Destino novo descoberto!</div>' : ''}${extra}</div>
    <div class="trSec">O que queres fazer aqui?</div><div class="trActs">${acts}<button onclick="trAct(-1)"><b>😴 Só descansar</b><small>Grátis</small></button></div>`);
}
function trAct(i) {
  const D = TR.D; let txt = '';
  if (i >= 0) { const a = D.acts[i]; if (a[3] && G.dinheiro < a[3]) return toast('💸 Não tens kumbu para isso (' + kz(a[3]) + ').'); if (a[3]) G.dinheiro -= a[3]; const r = fx(a[2]); txt = `${a[0]} ${a[1]} ${r}`; TR.log.push(txt); }
  else { const r = fx({ saude: 1 }); txt = '😴 Descansaste ' + r; TR.log.push(txt); }
  const km = D.km * (D.ida ? 1 : 2);
  trCard(`<div class="trArr"><div class="trBig">🎒</div><h3>Boa viagem!</h3><div class="trLog">${TR.log.map(l => `<div>${l}</div>`).join('')}</div><p class="trSum">${km} km percorridos · ${TR.fotos} foto(s) · total da vida: ${Math.round(vhG().km).toLocaleString('pt-PT')} km</p></div><div class="trChoices"><button class="go" onclick="trEnd()">Voltar a Luanda ▶</button></div>`);
}
function trEnd() {
  if (!TR) return; cancelAnimationFrame(TR.raf); removeEventListener('resize', trResize);
  if (typeof SND !== 'undefined') { SND.engine('off'); SND.tripAmb(null); }
  const D = TR.D, kind = TR.kind, log = TR.log.slice();
  TR = null; $('#tripView').classList.add('hidden'); document.body.classList.remove('tripping'); uiBlocked = false;
  addLog(`${kind === 'plane' ? '✈️' : kind === 'train' ? '🚆' : kind === 'bike' ? '🚲' : kind === 'moto' ? '🏍️' : '🚗'} Viagem a ${D.n}: ` + log.map(strip).join(' · '), 'good');
  if (typeof playerEmote === 'function') playerEmote('cheer');
  checkUnlocks(); checkConq(); if (G.stats.saude <= 0) return die('cansaço da viagem'); save(); refresh();
}
