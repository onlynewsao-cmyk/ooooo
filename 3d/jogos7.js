/* =========================================================
   JOGOS DE VERDADE (jogos7)
   · EA FC — desempate por penáltis (tu marcas e defendes)
   · Free Fire — sobrevive, faz abates e ganha o Booyah (e torneios)
   · Xadrez — xadrez completo (roque, en passant, promoção) contra o computador
   · Cobrinha — a clássica, para o Tijolinho e para todos
   · Aula Online — vídeo-aulas com narração e teste no fim
   Tudo desenhado em canvas (nada de emojis no ecrã do jogo).
   ========================================================= */
const GM_DPR = Math.min(2, window.devicePixelRatio || 1);
function gmCanvas(host, w, h) {
  const c = document.createElement('canvas'); c.width = w * GM_DPR; c.height = h * GM_DPR; c.className = 'gmcv';
  c.style.aspectRatio = w + '/' + h; host.appendChild(c);
  const x = c.getContext('2d'); x.scale(GM_DPR, GM_DPR); return { c, x };
}
function gmPt(c, e, w, h) { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height }; }
function gmLoop(fn) { let on = true, last = performance.now(); const f = t => { if (!on) return; const dt = Math.min(.05, (t - last) / 1000); last = t; try { fn(dt); } catch (e) { console.error(e); on = false; } if (on) requestAnimationFrame(f); }; requestAnimationFrame(f); return () => { on = false; }; }
function gmRR(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function gmTxt(x, t, X, Y, o = {}) { x.font = `${o.w || 800} ${o.s || 14}px system-ui,Arial`; x.textAlign = o.a || 'center'; x.textBaseline = 'middle'; if (o.sh) { x.fillStyle = 'rgba(0,0,0,.55)'; x.fillText(t, X + 1.5, Y + 1.5); } x.fillStyle = o.c || '#fff'; x.fillText(t, X, Y); }
const gmEase = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function gmSnd(k) { try { SND.play(k); } catch (e) { } }

/* =========================================================
   EA FC · PENÁLTIS
   ========================================================= */
function gmPenaltis(host, K) {
  const W = 360, H = 330, { c, x } = gmCanvas(host, W, H);
  const GX0 = 52, GX1 = 308, GY0 = 46, GY1 = 168;
  const Z = []; for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) Z.push({ x: GX0 + (q + .5) * (GX1 - GX0) / 3, y: GY0 + (r + .5) * (GY1 - GY0) / 2, r, q });
  const KC = { x: 180, y: 150 }, BALL = { x: 180, y: 292 };
  const S = { me: [], op: [], ph: 'shoot', t: 0, A: null, hist: [0, 0, 0, 0, 0, 0], tm: 0, msg: 'Toca no sítio da baliza onde queres chutar', fim: false, oz: -1 };
  const dif = Math.min(.5, .18 + (K.lvl || 0) * .04);
  const goals = a => a.filter(Boolean).length;
  function fimCheck() {
    const n = Math.max(S.me.length, S.op.length), gm = goals(S.me), go = goals(S.op);
    if (S.me.length === S.op.length) {
      if (n >= 5 && gm !== go) return true;
      if (n < 5) { const rm = 5 - S.me.length, ro = 5 - S.op.length; if (gm > go + ro || go > gm + rm) return true; }
      if (n >= 10) return true;
    } else if (S.me.length < 5) { const rm = 5 - S.me.length, ro = 5 - S.op.length; if (go > gm + rm || gm > go + ro) return true; }
    return false;
  }
  function acabar() {
    S.fim = true; const gm = goals(S.me), go = goals(S.op); const win = gm > go;
    S.msg = win ? `Ganhaste ${gm}-${go}!` : gm === go ? `Empate ${gm}-${go}` : `Perdeste ${gm}-${go}`;
    gmSnd(win ? 'win' : 'lose'); setTimeout(() => K.done({ win, gm, go }), 1600);
  }
  function chutar(zi) {
    const err = Math.abs(Math.sin(S.t * 3.1)), z = Z[zi];
    const miss = err > .9 || (z.r === 0 && z.q !== 1 && err > .72);
    let w = Z.map((_, i) => 1 + S.hist[i] * dif * 2); const tot = w.reduce((a, b) => a + b); let r = Math.random() * tot, kz = 0; for (let i = 0; i < 6; i++) { r -= w[i]; if (r <= 0) { kz = i; break; } }
    S.hist[zi]++;
    const saved = !miss && (kz === zi || (zi === 4 && Z[kz].q === 1) || (Z[kz].q === z.q && Z[kz].r !== z.r && chance(.25)));
    const tx = miss ? (z.q === 1 ? z.x + R(-30, 30) : z.q === 0 ? GX0 - 22 : GX1 + 22) : z.x, ty = miss ? (z.r === 0 || z.q === 1 ? GY0 - 24 : z.y) : z.y;
    S.A = { k: 'shoot', t: 0, tx, ty, kz, miss, saved, ok: !miss && !saved }; S.ph = 'anim'; gmSnd('tap');
  }
  function defender(dz) {
    const oz = S.oz, z = Z[oz], omiss = chance(.1);
    const saved = !omiss && (dz === oz || (Z[dz].r === z.r && Math.abs(Z[dz].q - z.q) === 1 && chance(.2)));
    const tx = omiss ? (z.q === 0 ? GX0 - 24 : z.q === 2 ? GX1 + 24 : z.x) : z.x, ty = omiss ? GY0 - 26 : z.y;
    S.A = { k: 'save', t: 0, tx, ty, kz: dz, miss: omiss, saved, ok: !omiss && !saved }; S.ph = 'anim';
  }
  function proxFase(prev) {
    if (prev === 'shoot') { S.ph = 'save'; S.tm = 1.6; S.oz = pick([0, 0, 2, 2, 3, 5, 3, 5, 1, 4]); S.msg = `${K.opp} vai bater! Toca para onde mergulhas`; }
    else { S.ph = 'shoot'; S.msg = 'A tua vez: toca na baliza (atenção à barra de precisão)'; }
    if (fimCheck()) acabar();
  }
  c.onpointerdown = e => {
    if (S.fim) return; const p = gmPt(c, e, W, H);
    let zi = -1, best = 1e9; Z.forEach((z, i) => { const d = Math.hypot(z.x - p.x, z.y - p.y); if (d < best) { best = d; zi = i; } });
    if (best > 80 || p.y > 200) return;
    if (S.ph === 'shoot') chutar(zi); else if (S.ph === 'save') defender(zi);
  };
  function keeper(X, Y, rot, col) {
    x.save(); x.translate(X, Y); x.rotate(rot);
    x.strokeStyle = col; x.lineWidth = 7; x.lineCap = 'round';
    x.beginPath(); x.moveTo(-12, -12); x.lineTo(-30, -30); x.moveTo(12, -12); x.lineTo(30, -30); x.stroke();
    x.fillStyle = col; gmRR(x, -13, -18, 26, 32, 7); x.fill();
    x.strokeStyle = '#1b1b1b'; x.beginPath(); x.moveTo(-7, 14); x.lineTo(-9, 32); x.moveTo(7, 14); x.lineTo(9, 32); x.stroke();
    x.fillStyle = '#5a3825'; x.beginPath(); x.arc(0, -27, 9, 0, 7); x.fill();
    x.fillStyle = '#ffcb00'; x.beginPath(); x.arc(-30, -30, 5, 0, 7); x.arc(30, -30, 5, 0, 7); x.fill();
    x.restore();
  }
  function ball(X, Y, s) { x.fillStyle = '#fff'; x.beginPath(); x.arc(X, Y, 9 * s, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 1.2; x.stroke(); x.fillStyle = '#222'; x.beginPath(); x.arc(X, Y, 3 * s, 0, 7); x.fill(); }
  const stop = gmLoop(dt => {
    S.t += dt;
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#2f8f3a' : '#2a8034'; x.fillRect(0, i * H / 8, W, H / 8 + 1); }
    x.fillStyle = '#1d2b4a'; x.fillRect(0, 0, W, 30); for (let i = 0; i < 40; i++) { x.fillStyle = ['#c8102e', '#ffcb00', '#fff', '#1f63c9'][i % 4]; x.beginPath(); x.arc(6 + i * 9.2, 18 + (i % 3) * 3 + Math.sin(S.t * 6 + i) * 1.5, 3, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2; x.strokeRect(20, 168, W - 40, 0.1); x.strokeRect(95, 168, 170, 70);
    x.beginPath(); x.arc(180, 292, 2.5, 0, 7); x.fillStyle = '#fff'; x.fill();
    x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 1; for (let i = GX0; i <= GX1; i += 12) { x.beginPath(); x.moveTo(i, GY0); x.lineTo(i, GY1); x.stroke(); } for (let j = GY0; j <= GY1; j += 12) { x.beginPath(); x.moveTo(GX0, j); x.lineTo(GX1, j); x.stroke(); }
    x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(GX0, GY1); x.lineTo(GX0, GY0); x.lineTo(GX1, GY0); x.lineTo(GX1, GY1); x.stroke();
    const sel = S.ph === 'shoot' || S.ph === 'save';
    if (sel) Z.forEach(z => { x.fillStyle = S.ph === 'save' ? 'rgba(255,203,0,.18)' : 'rgba(255,255,255,.14)'; x.beginPath(); x.arc(z.x, z.y, 22, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 1.5; x.stroke(); });
    let kx = KC.x, ky = KC.y, kr = 0, bx = BALL.x, by = BALL.y, bs = 1;
    const meK = S.ph === 'save' || (S.A && S.A.k === 'save');
    if (S.A) {
      S.A.t += dt; const a = S.A, p = Math.min(1, a.t / .55), e = gmEase(p), kzz = Z[a.kz];
      kx = KC.x + (kzz.x - KC.x) * e; ky = KC.y + (kzz.y - KC.y) * e * .9; kr = (kzz.q - 1) * 1.1 * e;
      if (a.saved && p >= 1) { const q = Math.min(1, (a.t - .55) / .5); bx = a.tx + (a.tx < 180 ? -60 : 60) * q; by = a.ty + 120 * q; }
      else { bx = BALL.x + (a.tx - BALL.x) * e; by = BALL.y + (a.ty - BALL.y) * e; bs = 1 - .35 * e; }
      if (a.t > .55 && !a.snd) { a.snd = 1; gmSnd(a.ok ? (a.k === 'shoot' ? 'win' : 'lose') : a.saved ? (a.k === 'save' ? 'win' : 'lose') : 'tap'); try { SND.vib && SND.vib(30); } catch (e) { } }
      if (a.t > 1.5) { (a.k === 'shoot' ? S.me : S.op).push(a.ok); const k = a.k; S.A = null; proxFase(k); }
    }
    keeper(kx, ky, kr, meK ? '#ffcb00' : '#c8102e');
    if (!(S.A && S.A.k === 'shoot') && S.ph !== 'shoot') { x.fillStyle = '#c8102e'; gmRR(x, 160, 270, 16, 26, 5); x.fill(); x.fillStyle = '#5a3825'; x.beginPath(); x.arc(168, 264, 7, 0, 7); x.fill(); }
    ball(bx, by, bs);
    if (S.A && S.A.t > .6) gmTxt(x, S.A.ok ? 'GOLO!' : S.A.saved ? 'DEFESA!' : 'FORA!', 180, 214, { s: 30, w: 900, c: S.A.ok ? '#ffcb00' : '#fff', sh: 1 });
    if (S.ph === 'shoot') { const m = Math.sin(S.t * 3.1); x.fillStyle = 'rgba(0,0,0,.45)'; gmRR(x, 80, 308, 200, 12, 6); x.fill(); x.fillStyle = '#c8102e'; gmRR(x, 80, 308, 200, 12, 6); x.fill(); x.fillStyle = '#ffcb00'; x.fillRect(110, 308, 140, 12); x.fillStyle = '#2ecc71'; x.fillRect(150, 308, 60, 12); x.fillStyle = '#fff'; x.fillRect(180 + m * 98 - 2, 304, 4, 20); }
    if (S.ph === 'save') { S.tm -= dt; x.fillStyle = '#ffcb00'; x.fillRect(80, 312, 200 * Math.max(0, S.tm / 1.6), 6); if (S.tm <= 0) defender(4); }
    x.fillStyle = 'rgba(0,0,0,.6)'; gmRR(x, 8, 2, W - 16, 26, 8); x.fill();
    gmTxt(x, `TU ${goals(S.me)}`, 60, 15, { s: 13, c: '#ffcb00' }); gmTxt(x, `${goals(S.op)} ${K.opp.toUpperCase().slice(0, 12)}`, 300, 15, { s: 13 });
    for (let i = 0; i < Math.max(5, S.me.length, S.op.length) && i < 10; i++) { const sx = 118 + i * 13; [[S.me, 9], [S.op, 21]].forEach(([a, yy]) => { x.fillStyle = a[i] == null ? '#555' : a[i] ? '#2ecc71' : '#e74c3c'; x.beginPath(); x.arc(sx, yy, 4, 0, 7); x.fill(); }); }
    gmTxt(x, S.msg, 180, 248, { s: 12, w: 700, sh: 1 });
  });
  return stop;
}

/* =========================================================
   FREE FIRE · sobrevivência
   ========================================================= */
function gmFF(host, K) {
  const W = 360, H = 440, { c, x } = gmCanvas(host, W, H);
  const hard = !!K.hard;
  const COV = [{ x: 70, y: 214, s: .72, k: 'cont' }, { x: 180, y: 206, s: .68, k: 'muro' }, { x: 290, y: 214, s: .72, k: 'caixa' }, { x: 60, y: 330, s: 1, k: 'caixa' }, { x: 180, y: 338, s: 1, k: 'cont' }, { x: 300, y: 330, s: 1, k: 'muro' }];
  const S = { t: hard ? 50 : 45, hp: 100, ammo: 12, rel: 0, kills: 0, heads: 0, alive: 50, en: [], next: 1, fx: [], hurt: 0, med: null, fim: false, cross: null, life: hard ? .95 : 1.35, gap: hard ? .55 : .85, aliveT: 0, msg: '' };
  function spawn() {
    const free = COV.map((c, i) => i).filter(i => !S.en.some(e => e.cv === i && !e.gone)); if (!free.length) return;
    const i = pick(free); S.en.push({ cv: i, t: 0, life: S.life * (.8 + Math.random() * .5), up: 0, dead: 0, shot: false, col: pick(['#3a6b35', '#6b3a35', '#35486b', '#6b5a35', '#222']) });
  }
  function fim(res) { if (S.fim) return; S.fim = true; S.msg = res.booyah ? 'BOOYAH!' : res.dead ? `Eliminado · #${res.rank}` : `Ficaste em #${res.rank}`; gmSnd(res.booyah ? 'win' : 'lose'); setTimeout(() => K.done(res), 1700); }
  c.onpointerdown = e => {
    if (S.fim) return; const p = gmPt(c, e, W, H);
    if (p.x > W - 86 && p.y > H - 52) { if (S.ammo < 12 && !S.rel) { S.rel = 1.1; gmSnd('tap'); } return; }
    if (S.med && Math.hypot(p.x - S.med.x, p.y - S.med.y) < 22) { S.hp = Math.min(100, S.hp + 35); S.med = null; S.fx.push({ k: 'txt', t: 0, x: p.x, y: p.y, s: '+35 HP', c: '#2ecc71' }); gmSnd('good'); return; }
    if (S.rel) return; if (S.ammo <= 0) { S.rel = 1.1; return; }
    S.ammo--; S.cross = { x: p.x, y: p.y, t: 0 }; gmSnd('tap');
    for (const en of S.en) {
      if (en.dead || en.gone || en.up < .5) continue; const cv = COV[en.cv], s = cv.s, ex = cv.x, top = cv.y - 30 * s - en.up * 44 * s;
      const head = Math.hypot(p.x - ex, p.y - (top - 2 * s)) < 10 * s + 3;
      const body = Math.abs(p.x - ex) < 14 * s + 2 && p.y > top + 6 * s && p.y < cv.y - 22 * s;
      if (head || body) { en.dead = 1; S.kills++; S.alive = Math.max(1, S.alive - 1); if (head) S.heads++; S.fx.push({ k: 'txt', t: 0, x: ex, y: top - 18, s: head ? 'HEADSHOT' : 'ABATE', c: head ? '#ffcb00' : '#fff' }); try { SND.vib && SND.vib(20); } catch (e) { } break; }
    }
    if (S.ammo <= 0) S.rel = 1.2;
  };
  function cover(cv) {
    const s = cv.s, X = cv.x, Y = cv.y;
    if (cv.k === 'cont') { x.fillStyle = '#b5482a'; x.fillRect(X - 46 * s, Y - 40 * s, 92 * s, 40 * s); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 2; for (let i = -40; i <= 40; i += 9) { x.beginPath(); x.moveTo(X + i * s, Y - 40 * s); x.lineTo(X + i * s, Y); x.stroke(); } }
    else if (cv.k === 'muro') { x.fillStyle = '#9b9488'; x.fillRect(X - 44 * s, Y - 34 * s, 88 * s, 34 * s); x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 1; for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) x.strokeRect(X - 44 * s + i * 15 * s + (j % 2) * 7 * s, Y - 34 * s + j * 8.5 * s, 15 * s, 8.5 * s); }
    else { x.fillStyle = '#a0763d'; x.fillRect(X - 30 * s, Y - 36 * s, 60 * s, 36 * s); x.strokeStyle = '#6b4a1f'; x.lineWidth = 3 * s; x.strokeRect(X - 30 * s, Y - 36 * s, 60 * s, 36 * s); x.beginPath(); x.moveTo(X - 30 * s, Y - 36 * s); x.lineTo(X + 30 * s, Y); x.stroke(); }
  }
  function enemy(en) {
    const cv = COV[en.cv], s = cv.s, ex = cv.x, top = cv.y - 30 * s - en.up * 44 * s;
    x.save(); x.beginPath(); x.rect(0, 0, W, cv.y - 28 * s); x.clip();
    if (en.dead) x.globalAlpha = Math.max(0, 1 - en.dead * 2);
    x.fillStyle = en.col; gmRR(x, ex - 14 * s, top + 6 * s, 28 * s, 44 * s, 6 * s); x.fill();
    x.fillStyle = '#4a2e1c'; x.beginPath(); x.arc(ex, top - 2 * s, 10 * s, 0, 7); x.fill();
    x.fillStyle = '#111'; x.fillRect(ex - 11 * s, top - 11 * s, 22 * s, 6 * s);
    x.fillStyle = '#222'; x.fillRect(ex - 2 * s, top + 16 * s, 26 * s, 5 * s);
    if (en.shot) { x.fillStyle = '#ffcb00'; x.beginPath(); x.arc(ex + 26 * s, top + 18 * s, 6 * s, 0, 7); x.fill(); }
    x.restore();
  }
  const stop = gmLoop(dt => {
    if (!S.fim) {
      S.t -= dt; S.aliveT += dt; if (S.aliveT > 1.1) { S.aliveT = 0; if (chance(.55) && S.alive > 2) S.alive--; }
      S.next -= dt; if (S.next <= 0) { spawn(); S.next = S.gap * (.7 + Math.random() * .6); S.gap = Math.max(hard ? .38 : .5, S.gap * .985); S.life = Math.max(hard ? .62 : .8, S.life * .99); }
      if (S.rel) { S.rel -= dt; if (S.rel <= 0) { S.rel = 0; S.ammo = 12; } }
      if (!S.med && chance(dt * .09)) S.med = { x: R(40, 320), y: R(250, 380), t: 3.5 };
      if (S.med) { S.med.t -= dt; if (S.med.t <= 0) S.med = null; }
      S.en.forEach(en => {
        if (en.gone) return; en.t += dt;
        if (en.dead) { en.dead += dt; if (en.dead > .5) en.gone = 1; return; }
        en.up = Math.min(1, en.t / .16);
        if (en.t > en.life && !en.shot) { en.shot = true; if (chance(hard ? .72 : .6)) { const d = R(7, 14); S.hp -= d; S.hurt = .35; try { SND.vib && SND.vib(60); } catch (e) { } gmSnd('lose'); } }
        if (en.t > en.life + .25) { en.up = Math.max(0, 1 - (en.t - en.life - .25) / .15); if (en.up <= 0) en.gone = 1; }
      });
      S.en = S.en.filter(e => !e.gone);
      if (S.hp <= 0) fim({ booyah: false, dead: true, kills: S.kills, heads: S.heads, rank: Math.max(2, S.alive) });
      else if (S.alive <= 1) fim({ booyah: true, kills: S.kills, heads: S.heads, rank: 1 });
      else if (S.t <= 0) { const need = hard ? 14 : 10; fim(S.kills >= need ? { booyah: true, kills: S.kills, heads: S.heads, rank: 1 } : { booyah: false, kills: S.kills, heads: S.heads, rank: Math.max(2, Math.min(S.alive, 2 + Math.floor((need - S.kills) / 2))) }); }
    }
    const g = x.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, '#f39c5a'); g.addColorStop(1, '#f6d19a'); x.fillStyle = g; x.fillRect(0, 0, W, 200);
    x.fillStyle = '#6d6a75'; [[0, 120, 60], [55, 95, 50], [100, 130, 70], [165, 80, 45], [205, 115, 60], [260, 100, 55], [310, 125, 60]].forEach(([a, b, w]) => x.fillRect(a, b, w, 200 - b));
    x.fillStyle = 'rgba(255,240,200,.5)'; for (let i = 0; i < 26; i++) x.fillRect(8 + (i * 47) % 340, 104 + (i * 31) % 80, 5, 7);
    x.fillStyle = '#c9a66b'; x.fillRect(0, 200, W, H - 200); x.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 12; i++) x.fillRect(0, 210 + i * 20, W, 2);
    const zr = 160 + Math.max(0, S.t) * 4; x.strokeStyle = 'rgba(80,140,255,.55)'; x.lineWidth = 4; x.beginPath(); x.arc(180, 300, zr, 0, 7); x.stroke();
    COV.slice(0, 3).forEach((cv, i) => { S.en.filter(e => e.cv === i).forEach(enemy); cover(cv); });
    COV.slice(3).forEach((cv, i) => { S.en.filter(e => e.cv === i + 3).forEach(enemy); cover(cv); });
    if (S.med) { x.fillStyle = '#fff'; gmRR(x, S.med.x - 14, S.med.y - 14, 28, 28, 6); x.fill(); x.fillStyle = '#e53935'; x.fillRect(S.med.x - 3, S.med.y - 10, 6, 20); x.fillRect(S.med.x - 10, S.med.y - 3, 20, 6); }
    if (S.cross) { S.cross.t += dt; const a = Math.max(0, 1 - S.cross.t * 3); x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = 2; x.beginPath(); x.arc(S.cross.x, S.cross.y, 9, 0, 7); x.moveTo(S.cross.x - 15, S.cross.y); x.lineTo(S.cross.x + 15, S.cross.y); x.moveTo(S.cross.x, S.cross.y - 15); x.lineTo(S.cross.x, S.cross.y + 15); x.stroke(); }
    S.fx = S.fx.filter(f => (f.t += dt) < .9); S.fx.forEach(f => gmTxt(x, f.s, f.x, f.y - f.t * 30, { s: 15, w: 900, c: f.c, sh: 1 }));
    if (S.hurt > 0) { S.hurt -= dt; x.fillStyle = `rgba(220,0,0,${S.hurt})`; x.fillRect(0, 0, W, H); }
    x.fillStyle = 'rgba(0,0,0,.55)'; gmRR(x, 8, 8, W - 16, 32, 8); x.fill();
    gmTxt(x, `${S.alive} VIVOS`, 52, 24, { s: 12, c: '#ffcb00' }); gmTxt(x, `ABATES ${S.kills}`, 140, 24, { s: 12 }); gmTxt(x, `ZONA ${Math.max(0, Math.ceil(S.t))}s`, 226, 24, { s: 12, c: '#7fb0ff' });
    x.fillStyle = '#333'; gmRR(x, 268, 18, 76, 12, 6); x.fill(); x.fillStyle = S.hp > 40 ? '#2ecc71' : '#e74c3c'; gmRR(x, 268, 18, Math.max(0, 76 * S.hp / 100), 12, 6); x.fill();
    x.fillStyle = 'rgba(0,0,0,.6)'; gmRR(x, W - 86, H - 50, 78, 40, 10); x.fill(); gmTxt(x, S.rel ? 'A RECARREGAR' : `BALAS ${S.ammo}/12`, W - 47, H - 36, { s: 9.5, c: S.ammo ? '#fff' : '#ff6b6b' }); gmTxt(x, 'RECARREGAR', W - 47, H - 22, { s: 9, w: 700, c: '#ffcb00' });
    if (S.fim) { x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 160, W, 90); gmTxt(x, S.msg, 180, 200, { s: S.msg === 'BOOYAH!' ? 40 : 26, w: 900, c: '#ffcb00', sh: 1 }); gmTxt(x, `${S.kills} abates · ${S.heads} headshots`, 180, 232, { s: 13 }); }
    else if (S.t > (hard ? 47 : 42)) gmTxt(x, 'Toca nos inimigos que aparecem!', 180, 60, { s: 13, sh: 1 });
  });
  return stop;
}

/* =========================================================
   XADREZ — motor completo (roque, en passant, promoção)
   ========================================================= */
const CH_V = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const chW = p => p && p === p.toUpperCase();
function chInit() {
  const b = Array(64).fill(null), back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let i = 0; i < 8; i++) { b[i] = back[i]; b[8 + i] = 'p'; b[48 + i] = 'P'; b[56 + i] = back[i].toUpperCase(); }
  return { b, w: true, cs: { K: 1, Q: 1, k: 1, q: 1 }, ep: -1, half: 0 };
}
function chAttacked(b, sq, byW) {
  const r = sq >> 3, c = sq & 7, own = p => p && chW(p) === byW, is = (p, t) => own(p) && p.toLowerCase() === t;
  const pr = byW ? r + 1 : r - 1; if (pr >= 0 && pr < 8) for (const dc of [-1, 1]) { const cc = c + dc; if (cc >= 0 && cc < 8 && is(b[pr * 8 + cc], 'p')) return true; }
  for (const [dr, dc] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && is(b[rr * 8 + cc], 'n')) return true; }
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (!dr && !dc) continue; const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && is(b[rr * 8 + cc], 'k')) return true; }
  for (const [dr, dc, a] of [[1, 0, 'r'], [-1, 0, 'r'], [0, 1, 'r'], [0, -1, 'r'], [1, 1, 'b'], [1, -1, 'b'], [-1, 1, 'b'], [-1, -1, 'b']]) {
    let rr = r + dr, cc = c + dc; while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { const p = b[rr * 8 + cc]; if (p) { if (own(p) && (p.toLowerCase() === a || p.toLowerCase() === 'q')) return true; break; } rr += dr; cc += dc; }
  }
  return false;
}
function chPseudo(S) {
  const b = S.b, w = S.w, M = [], mine = p => p && chW(p) === w, foe = p => p && chW(p) !== w;
  for (let sq = 0; sq < 64; sq++) {
    const p = b[sq]; if (!mine(p)) continue; const t = p.toLowerCase(), r = sq >> 3, c = sq & 7;
    const add = (to, o = {}) => M.push(Object.assign({ f: sq, t: to, cap: b[to] }, o));
    if (t === 'p') {
      const d = w ? -1 : 1, r1 = r + d, last = w ? 0 : 7;
      if (r1 >= 0 && r1 < 8 && !b[r1 * 8 + c]) { add(r1 * 8 + c, r1 === last ? { pr: 1 } : {}); if ((w ? r === 6 : r === 1) && !b[(r + 2 * d) * 8 + c]) add((r + 2 * d) * 8 + c, { dbl: 1 }); }
      for (const dc of [-1, 1]) { const cc = c + dc; if (cc < 0 || cc > 7 || r1 < 0 || r1 > 7) continue; const to = r1 * 8 + cc; if (foe(b[to])) add(to, r1 === last ? { pr: 1 } : {}); else if (to === S.ep) add(to, { ep: 1, cap: w ? 'p' : 'P' }); }
    } else if (t === 'n' || t === 'k') {
      const D = t === 'n' ? [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of D) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && !mine(b[rr * 8 + cc])) add(rr * 8 + cc); }
      if (t === 'k') {
        const row = w ? 7 : 0, K = w ? 'K' : 'k', Q = w ? 'Q' : 'q';
        if (sq === row * 8 + 4 && !chAttacked(b, sq, !w)) {
          if (S.cs[K] && b[row * 8 + 7] === (w ? 'R' : 'r') && !b[row * 8 + 5] && !b[row * 8 + 6] && !chAttacked(b, row * 8 + 5, !w)) add(row * 8 + 6, { cs: 'k' });
          if (S.cs[Q] && b[row * 8] === (w ? 'R' : 'r') && !b[row * 8 + 1] && !b[row * 8 + 2] && !b[row * 8 + 3] && !chAttacked(b, row * 8 + 3, !w)) add(row * 8 + 2, { cs: 'q' });
        }
      }
    } else {
      const D = t === 'b' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : t === 'r' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dr, dc] of D) { let rr = r + dr, cc = c + dc; while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { const q = b[rr * 8 + cc]; if (mine(q)) break; add(rr * 8 + cc); if (q) break; rr += dr; cc += dc; } }
    }
  }
  return M;
}
function chMake(S, m) {
  const b = S.b.slice(), p = b[m.f], w = S.w, cs = Object.assign({}, S.cs);
  b[m.t] = m.pr ? (w ? 'Q' : 'q') : p; b[m.f] = null;
  if (m.ep) b[m.t + (w ? 8 : -8)] = null;
  if (m.cs) { const row = w ? 7 : 0; if (m.cs === 'k') { b[row * 8 + 5] = b[row * 8 + 7]; b[row * 8 + 7] = null; } else { b[row * 8 + 3] = b[row * 8]; b[row * 8] = null; } }
  if (p === 'K') cs.K = cs.Q = 0; if (p === 'k') cs.k = cs.q = 0;
  [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']].forEach(([s, k]) => { if (m.f === s || m.t === s) cs[k] = 0; });
  return { b, w: !w, cs, ep: m.dbl ? (m.f + m.t) / 2 : -1, half: (p.toLowerCase() === 'p' || m.cap) ? 0 : S.half + 1 };
}
function chKing(b, w) { return b.indexOf(w ? 'K' : 'k'); }
function chLegal(S) { return chPseudo(S).filter(m => { const N = chMake(S, m); return !chAttacked(N.b, chKing(N.b, S.w), !S.w); }); }
function chInCheck(S) { return chAttacked(S.b, chKing(S.b, S.w), !S.w); }
function chEval(S) {
  let s = 0; const b = S.b;
  for (let i = 0; i < 64; i++) { const p = b[i]; if (!p) continue; const t = p.toLowerCase(), r = i >> 3, c = i & 7, wh = chW(p); let v = CH_V[t];
    const cen = 3.5 - Math.abs(c - 3.5) + 3.5 - Math.abs(r - 3.5);
    if (t === 'n' || t === 'b') v += cen * 6; if (t === 'p') v += (wh ? 6 - r : r - 1) * 8 + (c > 1 && c < 6 ? 6 : 0); if (t === 'q') v += cen * 2; if (t === 'k') v += (wh ? r === 7 : r === 0) ? 12 : -10;
    s += wh ? v : -v; }
  return S.w ? s : -s;
}
function chSearch(S, d, a, bb) {
  if (d === 0) return chEval(S);
  const M = chLegal(S); if (!M.length) return chInCheck(S) ? -99999 - d : 0;
  M.sort((x, y) => (y.cap ? CH_V[y.cap.toLowerCase()] : 0) - (x.cap ? CH_V[x.cap.toLowerCase()] : 0));
  for (const m of M) { const v = -chSearch(chMake(S, m), d - 1, -bb, -a); if (v >= bb) return bb; if (v > a) a = v; }
  return a;
}
function chBest(S, depth, noise) {
  const M = chLegal(S); let best = null, bv = -1e9;
  M.sort(() => Math.random() - .5);
  for (const m of M) { const v = -chSearch(chMake(S, m), depth - 1, -1e9, 1e9) + (noise ? Math.random() * noise : 0); if (v > bv) { bv = v; best = m; } }
  return best;
}
function chPiece(x, t, white, X, Y, s) {
  x.save(); x.translate(X, Y); x.scale(s / 40, s / 40);
  x.fillStyle = white ? '#fbf6ea' : '#2b2b30'; x.strokeStyle = white ? '#2b2b30' : '#e9e2cf'; x.lineWidth = 2; x.lineJoin = 'round';
  const base = () => { x.beginPath(); x.moveTo(-13, 16); x.lineTo(13, 16); x.lineTo(11, 11); x.lineTo(-11, 11); x.closePath(); x.fill(); x.stroke(); };
  x.beginPath();
  if (t === 'p') { x.moveTo(-8, 11); x.quadraticCurveTo(-7, 0, -3, -2); x.lineTo(3, -2); x.quadraticCurveTo(7, 0, 8, 11); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.arc(0, -8, 6.5, 0, 7); x.fill(); x.stroke(); }
  else if (t === 'r') { x.moveTo(-9, 11); x.lineTo(-8, -6); x.lineTo(8, -6); x.lineTo(9, 11); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-11, -6); x.lineTo(-11, -14); x.lineTo(-6, -14); x.lineTo(-6, -10); x.lineTo(-2, -10); x.lineTo(-2, -14); x.lineTo(2, -14); x.lineTo(2, -10); x.lineTo(6, -10); x.lineTo(6, -14); x.lineTo(11, -14); x.lineTo(11, -6); x.closePath(); x.fill(); x.stroke(); }
  else if (t === 'n') { x.moveTo(-9, 11); x.lineTo(-7, 0); x.quadraticCurveTo(-12, -4, -9, -9); x.lineTo(-2, -16); x.lineTo(0, -12); x.quadraticCurveTo(10, -12, 10, 0); x.lineTo(9, 11); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.arc(-3, -9, 1.6, 0, 7); x.fillStyle = white ? '#2b2b30' : '#e9e2cf'; x.fill(); }
  else if (t === 'b') { x.moveTo(-8, 11); x.quadraticCurveTo(-10, -4, 0, -14); x.quadraticCurveTo(10, -4, 8, 11); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.arc(0, -16, 3, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-3, -6); x.lineTo(4, -1); x.stroke(); }
  else if (t === 'q') { x.moveTo(-10, 11); x.lineTo(-13, -10); x.lineTo(-6, -2); x.lineTo(0, -14); x.lineTo(6, -2); x.lineTo(13, -10); x.lineTo(10, 11); x.closePath(); x.fill(); x.stroke(); [[-13, -12], [0, -16], [13, -12]].forEach(([a, b2]) => { x.beginPath(); x.arc(a, b2, 2.6, 0, 7); x.fill(); x.stroke(); }); }
  else { x.moveTo(-10, 11); x.quadraticCurveTo(-13, -6, -5, -8); x.lineTo(5, -8); x.quadraticCurveTo(13, -6, 10, 11); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(0, -9); x.lineTo(0, -20); x.moveTo(-4, -15); x.lineTo(4, -15); x.lineWidth = 3; x.stroke(); }
  base(); x.restore();
}
function gmXadrez(host, K) {
  const W = 336, H = 336, { c, x } = gmCanvas(host, W, H), q = W / 8;
  const info = document.createElement('div'); info.className = 'gmst'; host.appendChild(info);
  const lv = K.lvl || 1, depth = lv >= 3 ? 3 : lv === 2 ? 2 : 1;
  let S = chInit(), sel = -1, moves = [], last = null, fim = false, think = false, nMoves = 0;
  const msg = t => { info.innerHTML = t; };
  function status() {
    const M = chLegal(S);
    if (!M.length) { fim = true; const chk = chInCheck(S); const res = chk ? (S.w ? 'loss' : 'win') : 'draw'; msg(chk ? (S.w ? '♚ Xeque-mate. O computador ganhou.' : '🏆 Xeque-mate! Ganhaste!') : '🤝 Afogado: empate.'); gmSnd(res === 'win' ? 'win' : 'lose'); setTimeout(() => K.done({ res, n: nMoves }), 1600); return; }
    const pcs = S.b.filter(Boolean); if (pcs.length === 2 || S.half >= 100) { fim = true; msg('🤝 Empate.'); setTimeout(() => K.done({ res: 'draw', n: nMoves }), 1400); return; }
    msg(S.w ? (chInCheck(S) ? '⚠️ Estás em xeque! Protege o rei.' : 'A tua vez (brancas). Toca numa peça.') : 'O computador está a pensar…');
  }
  function aiMove() {
    think = true; status();
    setTimeout(() => { if (fim) return; const m = chBest(S, depth, lv === 1 ? 140 : lv === 2 ? 25 : 6); if (m) { S = chMake(S, m); last = m; gmSnd('tap'); } think = false; status(); }, 260);
  }
  c.onpointerdown = e => {
    if (fim || think || !S.w) return; const p = gmPt(c, e, W, H), sq = Math.floor(p.y / q) * 8 + Math.floor(p.x / q);
    const mv = moves.find(m => m.t === sq);
    if (sel >= 0 && mv) { S = chMake(S, mv); last = mv; sel = -1; moves = []; nMoves++; gmSnd('tap'); status(); if (!fim) aiMove(); return; }
    if (S.b[sq] && chW(S.b[sq])) { sel = sq; moves = chLegal(S).filter(m => m.f === sq); } else { sel = -1; moves = []; }
  };
  const stop = gmLoop(() => {
    for (let i = 0; i < 64; i++) { const r = i >> 3, cc = i & 7; x.fillStyle = (r + cc) % 2 ? '#7a9a5a' : '#eeeed2'; x.fillRect(cc * q, r * q, q, q); }
    if (last) [last.f, last.t].forEach(s => { x.fillStyle = 'rgba(255,203,0,.38)'; x.fillRect((s & 7) * q, (s >> 3) * q, q, q); });
    if (sel >= 0) { x.fillStyle = 'rgba(30,144,255,.45)'; x.fillRect((sel & 7) * q, (sel >> 3) * q, q, q); }
    if (chInCheck(S)) { const k = chKing(S.b, S.w); x.fillStyle = 'rgba(230,30,30,.5)'; x.fillRect((k & 7) * q, (k >> 3) * q, q, q); }
    for (let i = 0; i < 64; i++) { const p = S.b[i]; if (p) chPiece(x, p.toLowerCase(), chW(p), (i & 7) * q + q / 2, (i >> 3) * q + q / 2 + 1, q * .95); }
    moves.forEach(m => { x.fillStyle = m.cap ? 'rgba(220,40,40,.55)' : 'rgba(0,0,0,.25)'; x.beginPath(); x.arc((m.t & 7) * q + q / 2, (m.t >> 3) * q + q / 2, m.cap ? q * .42 : q * .15, 0, 7); m.cap ? (x.lineWidth = 4, x.strokeStyle = 'rgba(220,40,40,.7)', x.stroke()) : x.fill(); });
    x.font = '700 9px system-ui'; x.fillStyle = 'rgba(0,0,0,.45)'; for (let i = 0; i < 8; i++) { x.textAlign = 'left'; x.fillText('abcdefgh'[i], i * q + 2, H - 3); x.textAlign = 'right'; x.fillText(8 - i, W - 2, i * q + 10); }
  });
  status();
  return stop;
}

/* =========================================================
   COBRINHA
   ========================================================= */
function gmCobra(host, K) {
  const N = 16, cell = 20, W = N * cell, H = N * cell, { c, x } = gmCanvas(host, W, H);
  const pad = document.createElement('div'); pad.className = 'gmpad'; pad.innerHTML = '<button data-d="0,-1">▲</button><button data-d="-1,0">◀</button><button data-d="1,0">▶</button><button data-d="0,1">▼</button>'; host.appendChild(pad);
  const lcd = G.tel <= 1;
  let sn = [[8, 8], [7, 8], [6, 8]], d = [1, 0], nd = [1, 0], food = null, pts = 0, acc = 0, sp = .16, fim = false;
  const place = () => { do { food = [R(0, N - 1), R(0, N - 1)]; } while (sn.some(s => s[0] === food[0] && s[1] === food[1])); };
  place();
  const turn = v => { if (v[0] === -d[0] && v[1] === -d[1]) return; nd = v; };
  pad.onclick = e => { const b = e.target.closest('button'); if (b) turn(b.dataset.d.split(',').map(Number)); };
  const key = e => { const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key]; if (m) { turn(m); e.preventDefault(); e.stopPropagation(); } };
  window.addEventListener('keydown', key, true);
  let t0 = null; c.onpointerdown = e => { t0 = { x: e.clientX, y: e.clientY }; };
  c.onpointerup = e => { if (!t0) return; const dx = e.clientX - t0.x, dy = e.clientY - t0.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]); t0 = null; };
  const stopL = gmLoop(dt => {
    if (!fim) { acc += dt; if (acc >= sp) { acc = 0; d = nd; const h = [sn[0][0] + d[0], sn[0][1] + d[1]];
      if (h[0] < 0 || h[1] < 0 || h[0] >= N || h[1] >= N || sn.some(s => s[0] === h[0] && s[1] === h[1])) { fim = true; gmSnd('lose'); setTimeout(() => K.done({ pts }), 1200); }
      else { sn.unshift(h); if (h[0] === food[0] && h[1] === food[1]) { pts += 10; sp = Math.max(.07, sp * .96); place(); gmSnd('tap'); } else sn.pop(); } } }
    x.fillStyle = lcd ? '#b8cf8a' : '#0e1a12'; x.fillRect(0, 0, W, H);
    if (!lcd) { x.strokeStyle = 'rgba(255,255,255,.04)'; for (let i = 0; i <= N; i++) { x.beginPath(); x.moveTo(i * cell, 0); x.lineTo(i * cell, H); x.moveTo(0, i * cell); x.lineTo(W, i * cell); x.stroke(); } }
    x.fillStyle = lcd ? '#1f2a12' : '#ff4d4d'; x.beginPath(); x.arc(food[0] * cell + cell / 2, food[1] * cell + cell / 2, cell * .38, 0, 7); x.fill();
    sn.forEach((s, i) => { x.fillStyle = lcd ? '#1f2a12' : i ? '#2ecc71' : '#a3f7bf'; gmRR(x, s[0] * cell + 1.5, s[1] * cell + 1.5, cell - 3, cell - 3, 5); x.fill(); });
    gmTxt(x, `${pts}`, W - 24, 14, { s: 14, c: lcd ? '#1f2a12' : '#fff' });
    if (fim) { x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, H / 2 - 30, W, 60); gmTxt(x, `FIM · ${pts} pontos`, W / 2, H / 2, { s: 22, w: 900, c: '#ffcb00' }); }
  });
  return () => { stopL(); window.removeEventListener('keydown', key, true); };
}

/* =========================================================
   REGRAS DOS JOGOS ONLINE (energia, prémios, torneios)
   ========================================================= */
const GM7 = { stop: null, cur: null };
const GM_INFO = {
  fifa: { t: 'EA FC · Penáltis', sub: 'Marca e defende 5 penáltis contra um jogador online', fn: gmPenaltis },
  freefire: { t: 'Free Fire · Bermuda', sub: 'Sobrevive na zona, faz abates e ganha o Booyah', fn: gmFF },
  xadrez: { t: 'Xadrez online', sub: 'Partida completa contra o computador', fn: gmXadrez },
  cobra: { t: 'Cobrinha', sub: 'Come as maçãs e não batas nas paredes', fn: gmCobra },
};
function gmConsola() { return G.bens.includes('ps5') && (typeof inInt !== 'undefined' && inInt && inInt.loc === 'casa' || (typeof vrNearLoc === 'function' && vrNearLoc('casa', 30))); }
function gmStart(id, o = {}) {
  const I = GM_INFO[id]; if (!I) return;
  const g = GAMES.find(x => x.id === id); if (g && G.tel < g.tel && !o.dev) return toast('📵 Precisas de um smartphone.');
  if (!o.free && !o.torneio) { if (!canAct()) return; G.acoes--; save(); refresh(); }
  const cons = o.dev === 'tv' || (!o.dev && id !== 'cobra' && gmConsola());
  const lvl = id === 'xadrez' ? (o.lvl || G.xadLvl || 2) : (G.gmW && G.gmW[id]) || 0;
  const opp = pick(['Mano Djeff', 'Kota Bento', 'Puto Nelo', 'Dona Tchizé', 'Kiluange10', 'Mwangolé_FC', 'Yuri Kz', 'Txuxa77']);
  const dev = o.dev || (cons ? 'tv' : 'phone');
  dvOpen(dev, (cons ? '🎮 KZ Station 5 · ' : '') + I.t + (o.torneio ? ' · TORNEIO' : ''), `<div class="gmhost" id="gmHost"></div>`, () => { if (GM7.stop) { GM7.stop(); GM7.stop = null; } });
  const host = document.getElementById('gmHost');
  if (id === 'xadrez' && !o.lvl) {
    host.innerHTML = `<div class="gmpre"><b>Escolhe o nível</b><div class="gmlv">${[[1, 'Fácil'], [2, 'Médio'], [3, 'Difícil']].map(([n, l]) => `<button onclick="G.xadLvl=${n};gmRun('xadrez',{lvl:${n},cons:${cons},opp:'${opp}'})">${l}</button>`).join('')}</div><small>Ganhar no Difícil dá mais inteligência. Rating atual: ${G.xadElo || 1000}</small></div>`;
    return;
  }
  gmRun(id, { lvl, cons, opp, torneio: o.torneio });
}
function gmRun(id, o) {
  const host = document.getElementById('gmHost'); if (!host) return; host.innerHTML = '';
  const I = GM_INFO[id];
  host.insertAdjacentHTML('beforeend', `<div class="gmsub">${I.sub}${o.opp && id !== 'cobra' && id !== 'xadrez' ? ' · contra <b>' + o.opp + '</b>' : ''}</div>`);
  if (GM7.stop) GM7.stop();
  GM7.stop = I.fn(host, { lvl: o.lvl, opp: o.opp || 'Adversário', hard: o.torneio, done: r => gmEnd(id, r, o) });
}
function gmEnd(id, r, o) {
  G.gmW = G.gmW || {}; const bon = o.cons ? 3 : 0; let txt = '', extra = '';
  if (id === 'fifa') {
    if (r.win) { G.gmW.fifa = (G.gmW.fifa || 0) + 1; txt = `⚽ Ganhaste nos penáltis (${r.gm}-${r.go}) contra ${o.opp}! ` + fx({ felicidade: 5 + bon, fama: G.gmW.fifa % 5 === 0 ? 1 : 0 }); }
    else txt = `⚽ Perdeste nos penáltis (${r.gm}-${r.go}) contra ${o.opp}. ` + fx({ felicidade: 1 + bon });
  } else if (id === 'freefire') {
    if (o.torneio) {
      if (r.booyah) { const p = R(120000, 480000); txt = `🏆 Ganhaste o torneio DarkCell eSports com ${r.kills} abates! Prémio: ${kz(p)}. ` + fx({ dinheiro: p, fama: R(2, 5), felicidade: 10 }); }
      else txt = `🎮 Torneio: ficaste em #${r.rank} com ${r.kills} abates. Para a próxima! ` + fx({ felicidade: 1 });
    } else if (r.booyah) { G.gmW.freefire = (G.gmW.freefire || 0) + 1; txt = `🔥 BOOYAH! ${r.kills} abates (${r.heads} headshots). ` + fx({ felicidade: 7 + bon }); extra = 'torneio'; }
    else txt = `🎮 Ficaste em #${r.rank} com ${r.kills} abates. ` + fx({ felicidade: 2 + bon, saude: -1 });
  } else if (id === 'xadrez') {
    const lv = o.lvl || 2; G.xadElo = G.xadElo || 1000;
    if (r.res === 'win') { G.xadElo += 10 + lv * 8; txt = `♟️ Ganhaste ao computador (nível ${['', 'fácil', 'médio', 'difícil'][lv]}) em ${r.n} jogadas! Rating ${G.xadElo}. ` + fx({ inteligencia: 1 + lv, felicidade: 3 + bon }); }
    else if (r.res === 'draw') { txt = `♟️ Empate no xadrez. Rating ${G.xadElo}. ` + fx({ inteligencia: 1 + (lv > 1 ? 1 : 0) }); }
    else { G.xadElo = Math.max(400, G.xadElo - 8); txt = `♟️ Perdeste a partida, mas aprendeste. Rating ${G.xadElo}. ` + fx({ inteligencia: 1 }); }
  } else if (id === 'cobra') {
    G.cobraBest = Math.max(G.cobraBest || 0, r.pts);
    txt = `🐍 Fizeste ${r.pts} pontos na cobrinha${r.pts >= (G.cobraBest || 0) && r.pts > 0 ? ' (recorde!)' : ''}. ` + fx({ felicidade: Math.min(6, 1 + Math.floor(r.pts / 50)) });
  }
  after(txt, '', id === 'xadrez' ? 'think' : 'cheer');
  const host = document.getElementById('gmHost'); if (!host) return;
  host.insertAdjacentHTML('beforeend', `<div class="gmres"><p>${txt.replace(/<[^>]+>/g, '')}</p>
    ${extra === 'torneio' ? `<button class="pbtn" onclick="gmTorneio()">🏆 Entrar no torneio DarkCell eSports (5.000 Kz)</button>` : ''}
    <button class="pbtn" onclick="dvClose();gmStart('${id}',{dev:'${o.cons ? 'tv' : ''}'||undefined})">Jogar outra vez (1 energia)</button><button class="pbtn ghost" onclick="dvClose()">Sair</button></div>`);
}
function gmTorneio() {
  if (G.dinheiro < 5000) return toast('💸 A inscrição custa 5.000 Kz.');
  G.dinheiro -= 5000; save(); refresh(); dvClose(); gmStart('freefire', { torneio: true });
}
/* os botões antigos passam a abrir os jogos de verdade */
playGame = function (id) { gmStart(id); };

/* =========================================================
   AULA ONLINE — vídeo-aulas com narração e teste
   ========================================================= */
const AULAS = [
  { id: 'fin1', t: 'Finanças pessoais', c: '#1e8e5a', s: ['Faz um orçamento: escreve tudo o que ganhas e tudo o que gastas no mês.', 'Regra 50-30-20: 50% para o essencial (casa, comida, transporte), 30% para desejos e 20% para poupar.', 'Cuidado com o agiota: 50% de juros num ano significa devolver 150 mil por cada 100 mil.'],
    q: [['Na regra 50-30-20, quanto vai para a poupança?', ['50%', '30%', '20%'], 2], ['Pedes 100 mil a 50% de juros. Quanto devolves?', ['105 mil', '150 mil', '200 mil'], 1], ['O que é um orçamento?', ['Lista do que ganhas e gastas', 'Um empréstimo', 'Um tipo de imposto'], 0], ['Qual destas despesas é essencial?', ['Renda de casa', 'Sapatilhas novas', 'Festa de sábado'], 0]] },
  { id: 'fin2', t: 'Kwanza, câmbio e inflação', c: '#0f6b8a', s: ['Inflação é a subida geral dos preços: com o mesmo dinheiro compras menos coisas.', 'O câmbio oficial é o do banco; nas kinguilas o dólar é mais caro, mas é mais rápido.', 'O IVA em Angola é de 14%: um produto de 1.000 Kz sem IVA custa 1.140 Kz com IVA.'],
    q: [['Um produto de 1.000 Kz com 14% de IVA custa…', ['1.014 Kz', '1.140 Kz', '1.400 Kz'], 1], ['O que é a inflação?', ['Subida geral dos preços', 'Descida do salário mínimo', 'Um imposto novo'], 0], ['Onde o dólar costuma ser mais caro?', ['No banco', 'Nas kinguilas', 'É igual em todo o lado'], 1], ['Se a inflação é 20%, 100 mil Kz valem no próximo ano…', ['Mais', 'O mesmo', 'Menos'], 2]] },
  { id: 'info1', t: 'Informática básica', c: '#3949ab', s: ['Hardware é o que se toca (ecrã, teclado); software são os programas.', 'Ctrl+C copia, Ctrl+V cola, Ctrl+Z desfaz. Guarda o trabalho muitas vezes com Ctrl+S.', 'Organiza os ficheiros em pastas com nomes claros, por exemplo: CV_Joana_2026.'],
    q: [['Qual atalho cola o que copiaste?', ['Ctrl+C', 'Ctrl+V', 'Ctrl+Z'], 1], ['Um teclado é…', ['Software', 'Hardware', 'Internet'], 1], ['Para desfazer um erro usas…', ['Ctrl+Z', 'Ctrl+S', 'Ctrl+P'], 0], ['Qual é o melhor nome para um ficheiro?', ['documento1final(2)', 'CV_Joana_2026', 'aaaa'], 1]] },
  { id: 'info2', t: 'Folhas de cálculo', c: '#1b7a3a', s: ['Uma folha de cálculo tem colunas (letras) e linhas (números). A célula B3 fica na coluna B, linha 3.', 'As fórmulas começam com igual: =SOMA(B2:B10) soma todas as células de B2 a B10.', '=MÉDIA calcula a média; os gráficos ajudam a mostrar vendas e despesas de um negócio.'],
    q: [['As fórmulas começam com…', ['#', '=', '@'], 1], ['A célula C5 está na…', ['Coluna 5, linha C', 'Coluna C, linha 5', 'Página 5'], 1], ['Qual fórmula soma de A1 até A4?', ['=SOMA(A1:A4)', '=A1-A4', '=MÉDIA(A1)'], 0], ['Para ver a média usas…', ['=SOMA', '=MÉDIA', '=MAIOR'], 1]] },
  { id: 'info3', t: 'Segurança digital', c: '#8e24aa', s: ['Nunca envies saldo nem códigos a quem diz que ganhaste um prémio: é burla.', 'Usa palavras-passe longas, diferentes em cada conta, e ativa a verificação em dois passos.', 'Desconfia de links estranhos no Fala Já: confirma sempre com a pessoa por chamada.'],
    q: [['Recebes "Ganhaste 5 milhões, manda 5.000 de saldo". O que fazes?', ['Mando o saldo', 'Bloqueio: é burla', 'Mando metade'], 1], ['Qual é a palavra-passe mais segura?', ['123456', 'nome2000', 'Kianda!Lua_Mar77'], 2], ['A verificação em dois passos…', ['Protege mais a conta', 'Deixa o telefone lento', 'Apaga as mensagens'], 0], ['Um amigo manda um link estranho. O que fazes?', ['Abro logo', 'Confirmo com ele primeiro', 'Reencaminho a todos'], 1]] },
  { id: 'ing1', t: 'Inglês para o trabalho', c: '#c62828', s: ['Cumprimentar: "Good morning" (bom dia), "Nice to meet you" (prazer em conhecer).', 'Na entrevista: "I am a hard worker and I learn fast" (sou trabalhador e aprendo rápido).', 'Números: one, two, three… "How much is it?" pergunta quanto custa.'],
    q: [['"Good morning" quer dizer…', ['Boa noite', 'Bom dia', 'Adeus'], 1], ['Como perguntas o preço?', ['How much is it?', 'Where are you?', 'What time is it?'], 0], ['"I learn fast" significa…', ['Aprendo rápido', 'Corro rápido', 'Como depressa'], 0], ['"Nice to meet you" usa-se…', ['Ao conhecer alguém', 'Ao despedir do trabalho', 'Ao pagar'], 0]] },
  { id: 'hist1', t: 'História de Angola', c: '#b71c1c', s: ['A 4 de Fevereiro de 1961 começou a luta armada de libertação nacional.', 'Angola tornou-se independente a 11 de Novembro de 1975.', 'A paz foi assinada a 4 de Abril de 2002. Desde 2025 o país tem 21 províncias.'],
    q: [['Em que data Angola ficou independente?', ['4 de Abril de 2002', '11 de Novembro de 1975', '4 de Fevereiro de 1961'], 1], ['O Dia da Paz é a…', ['4 de Abril', '1 de Maio', '17 de Setembro'], 0], ['Quantas províncias tem Angola desde 2025?', ['18', '21', '24'], 1], ['O que começou a 4 de Fevereiro de 1961?', ['A luta armada', 'O Girabola', 'O Carnaval'], 0]] },
  { id: 'geo1', t: 'Geografia de Angola', c: '#00796b', s: ['O rio Kwanza dá nome à moeda e atravessa o país até ao mar, a sul de Luanda.', 'As Quedas de Kalandula, em Malanje, estão entre as maiores quedas de água de África.', 'O Morro do Moco, no Huambo, é o ponto mais alto do país; no sul fica o deserto do Namibe.'],
    q: [['Onde ficam as Quedas de Kalandula?', ['Malanje', 'Cabinda', 'Namibe'], 0], ['Qual é o ponto mais alto de Angola?', ['Serra da Leba', 'Morro do Moco', 'Tundavala'], 1], ['A moeda tem o nome de…', ['Um rio', 'Um rei', 'Uma cidade'], 0], ['O deserto do sul de Angola é o…', ['Sahara', 'Kalahari', 'Namibe'], 2]] },
  { id: 'saude1', t: 'Saúde e primeiros socorros', c: '#d81b60', s: ['Febre em Angola pode ser paludismo: faz o teste no hospital, é rápido e grátis.', 'Dorme com mosquiteiro e elimina água parada à volta de casa.', 'Diarreia: dá soro caseiro (1 litro de água fervida, 1 colher de chá de sal, 8 de açúcar).'],
    q: [['Tens febre. O que fazes primeiro?', ['Teste de paludismo', 'Espero uma semana', 'Tomo café'], 0], ['O mosquiteiro serve para…', ['Evitar picadas de mosquito', 'Fazer sombra', 'Decorar o quarto'], 0], ['O soro caseiro leva…', ['Água fervida, sal e açúcar', 'Gasosa e gelo', 'Leite e café'], 0], ['Onde nascem os mosquitos?', ['Em água parada', 'Na areia seca', 'Nas árvores'], 0]] },
  { id: 'neg1', t: 'Empreender em Angola', c: '#ef6c00', s: ['Lucro = vendas − custos. Se vendes 50 mil e gastas 35 mil, o lucro é 15 mil.', 'Para um negócio formal precisas de NIF, alvará e de passar faturas.', 'Conhece o cliente: o que ele quer, quanto pode pagar e onde compra.'],
    q: [['Vendes 50 mil e gastas 35 mil. Qual é o lucro?', ['15 mil', '35 mil', '85 mil'], 0], ['Para um negócio formal precisas de…', ['NIF e alvará', 'Só de um telefone', 'Nada'], 0], ['O lucro é…', ['Vendas mais custos', 'Vendas menos custos', 'Só as vendas'], 1], ['Antes de abrir um negócio deves…', ['Conhecer o cliente', 'Gastar tudo em publicidade', 'Copiar o vizinho'], 0]] },
  { id: 'mkt1', t: 'Marketing digital', c: '#6a1b9a', s: ['Define o público-alvo: idade, bairro e o que essas pessoas gostam.', 'Publica com regularidade: fotos boas, texto curto e um preço claro.', 'Vê as métricas (alcance, gostos, mensagens) para saber o que funciona.'],
    q: [['Público-alvo é…', ['Quem queres alcançar', 'O teu concorrente', 'O dono da rede social'], 0], ['Um bom post tem…', ['Foto boa e preço claro', 'Só texto enorme', 'Nada sobre o produto'], 0], ['Métricas servem para…', ['Ver o que funciona', 'Pagar impostos', 'Bloquear clientes'], 0], ['Publicar com regularidade…', ['Ajuda a crescer', 'Não serve de nada', 'Fecha a conta'], 0]] },
  { id: 'port1', t: 'Português e currículo', c: '#455a64', s: ['Um bom CV tem: dados pessoais, formação, experiência e competências, numa página.', 'Na carta de apresentação explica porque queres aquele emprego e o que podes dar à empresa.', 'Revê os acentos: "está" (verbo) é diferente de "esta" (pronome).'],
    q: [['Quantas páginas deve ter um CV de início de carreira?', ['Uma', 'Cinco', 'Dez'], 0], ['"Ele ___ em casa." Qual é a forma certa?', ['esta', 'está', 'estã'], 1], ['A carta de apresentação explica…', ['Porque queres o emprego', 'A tua comida favorita', 'O teu signo'], 0], ['No CV não deve faltar…', ['A experiência', 'A senha do banco', 'Fotos de festas'], 0]] },
];
const CURSOS7 = [
  { id: 'cinfo', t: 'Informática na Prática', mods: ['info1', 'info2', 'info3'], ef: '+30% nos trabalhos freelance e +3% no salário' },
  { id: 'cnego', t: 'Gestão e Finanças', mods: ['fin1', 'fin2', 'neg1'], ef: '+3% no salário e +5% no lucro dos negócios' },
  { id: 'ccom', t: 'Comunicação Profissional', mods: ['ing1', 'port1', 'mkt1'], ef: '+3% no salário e mais seguidores' },
  { id: 'ccid', t: 'Cultura Geral e Cidadania', mods: ['hist1', 'geo1', 'saude1'], ef: '+3% no salário e +saúde' },
];
const AU = { a: null, i: 0, t: 0, raf: 0, tts: true, quiz: null, prem: null, dev: 'phone' };
function auG() { G.aulas = G.aulas || { feitas: {}, cursos: {}, certs: [] }; return G.aulas; }
function auMenu(dev) {
  AU.dev = dev || 'phone'; const A = auG();
  const certs = A.certs.map(id => CURSOS7.find(c => c.id === id)).filter(Boolean);
  return `<div class="aumenu"><div class="apsec">Vídeo-aulas grátis</div><div class="aulist">${AULAS.map(a => `<button onclick="auAbrir('${a.id}')" style="--c:${a.c}"><b>${a.t}</b><small>${A.feitas[a.id] === G.ano ? 'Já fizeste este ano · rende menos' : '3 partes · teste de 4 perguntas'}</small></button>`).join('')}</div>
    <div class="apsec">Cursos certificados · Kianda Academy</div><div class="aulist">${CURSOS7.map(c => { const st = A.cursos[c.id]; const done = A.certs.includes(c.id); const n = st ? st.ok.length : 0; return `<button onclick="auCurso('${c.id}')" style="--c:#ffcb00"><b>${done ? '🏅 ' : ''}${c.t}</b><small>${done ? 'Certificado obtido · ' + c.ef : st ? `Módulo ${n + 1} de 3 · inscrito` : '25.000 Kz · 3 módulos · ' + c.ef}</small></button>`; }).join('')}</div>
    ${certs.length ? `<div class="apok">🏅 Certificados: ${certs.map(c => c.t).join(', ')}</div>` : ''}
    <p class="apnote">Cada aula gasta 1 energia. Ganhas inteligência conforme acertas no teste. ${G.bens.includes('portatil') ? 'Portátil: +1.' : 'Com portátil ganhas +1.'} ${G.bens.includes('starlink') ? 'Céu Net: +1.' : ''}</p></div>`;
}
function auOpen(dev) { dvOpen(dev || (G.tel >= 2 ? 'phone' : 'laptop'), '🎓 Aula Online', `<div id="auHost">${auMenu(dev)}</div>`, auStop); }
function auStop() { cancelAnimationFrame(AU.raf); AU.raf = 0; try { speechSynthesis.cancel(); } catch (e) { } }
function auCurso(id) {
  const A = auG(), c = CURSOS7.find(x => x.id === id); if (A.certs.includes(id)) return toast('🏅 Já tens este certificado.');
  if (!A.cursos[id]) { if (G.dinheiro < 25000) return toast('💸 A inscrição custa 25.000 Kz.'); G.dinheiro -= 25000; A.cursos[id] = { ok: [] }; save(); refresh(); toast('📝 Inscrito(a) em ' + c.t); }
  const nx = c.mods.find(m => !A.cursos[id].ok.includes(m)); AU.prem = id; auAbrir(nx, id);
}
function auAbrir(id, curso) {
  if (!canAct()) return; G.acoes--; save(); refresh();
  AU.a = AULAS.find(a => a.id === id); AU.i = 0; AU.t = 0; AU.quiz = null; AU.prem = curso || null;
  const h = document.getElementById('auHost'); if (!h) return;
  const prof = typeof avatarShot === 'function' ? avatarShot(Object.assign(randomNPCcfg(), { shirt: AU.a.c }), AU.a.c, true, 120) : '';
  h.innerHTML = `<div class="auplayer"><canvas id="auCv" width="640" height="360"></canvas><img class="auprof" src="${prof}" alt=""><div class="aubar"><i id="auProg"></i></div>
    <div class="auctl"><button onclick="auPrev()">⏮</button><button id="auPP" onclick="auPause()">⏸</button><button onclick="auNext()">⏭</button><button onclick="AU.tts=!AU.tts;if(!AU.tts)speechSynthesis.cancel();this.textContent=AU.tts?'🔊':'🔈'">${AU.tts ? '🔊' : '🔈'}</button><span id="auLbl"></span></div></div>
    <div class="ausub" id="auSub"></div>`;
  AU.pause = false; auFala(); auLoop();
}
function auFala() { try { if (!AU.tts || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(AU.a.s[AU.i]); u.lang = 'pt-PT'; u.rate = 1.02; const v = speechSynthesis.getVoices().find(v => /pt/i.test(v.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) { } }
function auPause() { AU.pause = !AU.pause; const b = document.getElementById('auPP'); if (b) b.textContent = AU.pause ? '▶' : '⏸'; try { AU.pause ? speechSynthesis.pause() : speechSynthesis.resume(); } catch (e) { } }
function auNext() { if (AU.i < AU.a.s.length - 1) { AU.i++; AU.t = 0; auFala(); } else auQuiz(); }
function auPrev() { if (AU.i > 0) { AU.i--; AU.t = 0; auFala(); } }
const AU_DUR = 9;
function auLoop() {
  let last = performance.now();
  const f = now => {
    const cv = document.getElementById('auCv'); if (!cv || AU.quiz) { AU.raf = 0; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; if (!AU.pause) AU.t += dt;
    const x = cv.getContext('2d'), W = 640, H = 360, a = AU.a, tt = now / 1000;
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, a.c); g.addColorStop(1, '#0b0b12'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) { x.fillStyle = `rgba(255,255,255,${.04 + i * .008})`; x.beginPath(); x.arc((i * 137 + tt * 18 * (i % 2 ? 1 : -1)) % (W + 200) - 100, 60 + i * 45, 40 + i * 9, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 0, W, 54); gmTxt(x, a.t.toUpperCase(), 24, 28, { s: 22, w: 900, a: 'left', c: '#fff' }); gmTxt(x, `PARTE ${AU.i + 1}/${a.s.length}`, W - 24, 28, { s: 15, a: 'right', c: '#ffcb00' });
    x.fillStyle = '#ffcb00'; x.fillRect(24, 90, 6, 150);
    const words = a.s[AU.i].split(' '), shown = Math.min(words.length, Math.floor(AU.t * 3.2) + 1); let line = '', y = 110; x.font = '700 25px system-ui'; x.textAlign = 'left'; x.fillStyle = '#fff';
    words.slice(0, shown).forEach(w2 => { const tst = line + w2 + ' '; if (x.measureText(tst).width > 440) { x.fillText(line, 46, y); line = w2 + ' '; y += 36; } else line = tst; }); x.fillText(line, 46, y);
    const p = Math.min(1, AU.t / AU_DUR); const pr = document.getElementById('auProg'); if (pr) pr.style.width = ((AU.i + p) / a.s.length * 100) + '%';
    const lb = document.getElementById('auLbl'); if (lb) lb.textContent = `${Math.floor(AU.t)}s`;
    const sb = document.getElementById('auSub'); if (sb && sb.dataset.i != AU.i) { sb.dataset.i = AU.i; sb.textContent = a.s[AU.i]; }
    if (AU.t >= AU_DUR && !AU.pause) { auNext(); }
    AU.raf = requestAnimationFrame(f);
  };
  AU.raf = requestAnimationFrame(f);
}
function auQuiz() {
  auStop(); AU.quiz = { i: 0, ok: 0 };
  auQ();
}
function auQ() {
  const h = document.getElementById('auHost'); if (!h) return; const a = AU.a, Q = AU.quiz;
  if (Q.i >= a.q.length) return auFim();
  const [p, ops] = a.q[Q.i];
  h.innerHTML = `<div class="auquiz"><div class="auqh">Teste · pergunta ${Q.i + 1} de ${a.q.length}<span>${Q.ok} certas</span></div><b>${p}</b>${ops.map((o, i) => `<button onclick="auResp(${i},this)">${o}</button>`).join('')}</div>`;
}
function auResp(i, el) {
  const Q = AU.quiz, a = AU.a, ok = a.q[Q.i][2] === i; if (Q.lock) return; Q.lock = true;
  el.classList.add(ok ? 'ok' : 'no'); if (!ok) el.parentNode.querySelectorAll('button')[a.q[Q.i][2]].classList.add('ok');
  if (ok) Q.ok++; gmSnd(ok ? 'good' : 'lose');
  setTimeout(() => { Q.lock = false; Q.i++; auQ(); }, 900);
}
function auFim() {
  const A = auG(), a = AU.a, ok = AU.quiz.ok, rep = A.feitas[a.id] === G.ano;
  const b = (G.bens.includes('portatil') ? 1 : 0) + (G.bens.includes('starlink') ? 1 : 0);
  let gain = Math.max(ok >= 2 ? 1 : 0, Math.round((ok / 4) * 4) + b); if (rep) gain = Math.ceil(gain / 2);
  A.feitas[a.id] = G.ano; if (G.estudo) G.estudo.esf += ok >= 3 ? 2 : 1;
  let txt = `🎓 Aula "${a.t}": acertaste ${ok}/4. ` + fx({ inteligencia: gain }), cert = '';
  if (AU.prem) {
    const c = CURSOS7.find(x => x.id === AU.prem), st = A.cursos[c.id];
    if (ok >= 3) { if (!st.ok.includes(a.id)) st.ok.push(a.id); txt += ` Módulo aprovado (${st.ok.length}/3).`; if (st.ok.length >= 3) { A.certs.push(c.id); delete A.cursos[c.id]; cert = c.t; txt += ` 🏅 Certificado "${c.t}" obtido! ` + fx({ inteligencia: 3, fama: 1 }); } }
    else txt += ' Precisas de 3 certas para passar o módulo: repete a aula.';
  }
  after(txt, 'good', 'think');
  const h = document.getElementById('auHost'); if (!h) return;
  h.innerHTML = `<div class="aufim">${cert ? `<div class="aucert"><small>KIANDA ACADEMY</small><b>Certificado</b><span>${esc(G.nome)}</span><em>concluiu o curso</em><strong>${cert}</strong><i>${G.ano}</i></div>` : `<div class="auscore">${ok}/4</div>`}<p>${strip(txt)}</p><button class="pbtn" onclick="document.getElementById('auHost').innerHTML=auMenu(AU.dev)">Voltar às aulas</button></div>`;
}
onlineClass = function (premium) { if (G.tel < 2 && !G.bens.includes('portatil')) return toast('Precisas de smartphone ou portátil.'); auOpen(); };
/* cada certificado conta no salário (máx. 4) */
(function () { const _s = salario; salario = function (e) { const v = _s.apply(this, arguments); try { const j = job(e.id); if (j.informal || j.varFama || j.varSeg) return v; const n = Math.min(4, (G.aulas && G.aulas.certs || []).length); return Math.round(v * (1 + n * .03)); } catch (x) { return v; } }; })();
