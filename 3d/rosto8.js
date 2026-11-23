/* =========================================================
   ROSTO 8 — rostos novos (sobretudo femininos) e escolha de rosto
   - olhos com íris pintada (anel, brilho, pupila), pálpebras que dão
     forma amendoada, linha de pestanas com "asa"
   - sobrancelhas em arco afiladas, nariz delicado, lábios naturais
   - escolha no criador: formato do rosto, olhos, nariz, lábios, sobrancelhas
   ========================================================= */
const FACE8 = {
  F: {
    caras: [['Oval', { hw: .97, hy: 1.1, jw: .96, ch: 1.06 }], ['Redondo', { hw: 1.07, hy: 1.04, jw: 1.22, ch: .84, cf: .6 }], ['Coração', { hw: 1.06, hy: 1.08, jw: .76, ch: 1.16, ck: .8 }], ['Maçãs altas', { hw: .99, hy: 1.1, jw: .86, ch: 1.04, ck: 1.25 }], ['Forte', { hw: 1.05, hy: 1.08, jw: 1.2, ch: 1.02, sq: .6 }], ['Delicado', { hw: .93, hy: 1.12, jw: .8, ch: 1.1, cf: .3 }]],
    olhos: [['Amendoados', { es: 1, tilt: .1, up: .72, lo: .4, sp: 0 }], ['Redondos', { es: 1.05, tilt: .03, up: .86, lo: .52, sp: 0 }], ['Gatinho', { es: .98, tilt: .24, up: .62, lo: .34, sp: .002 }], ['Doces', { es: 1.03, tilt: -.06, up: .76, lo: .54, sp: -.002 }]],
    nariz: [['Pequeno', .85], ['Médio', 1], ['Largo', 1.2]],
    labios: [['Finos', .8], ['Médios', 1], ['Carnudos', 1.22]],
    sobr: [['Arqueadas', { a: 1, t: 1 }], ['Retas', { a: .25, t: 1.05 }], ['Grossas', { a: .7, t: 1.45 }]]
  },
  M: {
    caras: [['Normal', { hw: 1, hy: 1.1, jw: 1, ch: 1 }], ['Redondo', { hw: 1.04, hy: 1.04, jw: 1.14, ch: .86, cf: .6 }], ['Quadrado', { hw: 1.03, hy: 1.08, jw: 1.24, ch: 1.08, sq: 1.2 }], ['Fino', { hw: .95, hy: 1.12, jw: .86, ch: 1.08 }], ['Largo', { hw: 1.04, hy: 1.06, jw: 1.2, ch: .96, cf: .3 }], ['Marcado', { hw: 1, hy: 1.1, jw: 1.06, ch: 1.12, ck: 1, sq: .7 }]],
    olhos: [['Normais', { es: 1, tilt: .03, up: .68, lo: .55, sp: 0 }], ['Redondos', { es: 1.05, tilt: 0, up: .82, lo: .62, sp: 0 }], ['Rasgados', { es: .96, tilt: .14, up: .56, lo: .48, sp: .002 }], ['Sérios', { es: .98, tilt: -.03, up: .5, lo: .6, sp: 0 }]],
    nariz: [['Pequeno', .88], ['Médio', 1], ['Largo', 1.2]],
    labios: [['Finos', .82], ['Médios', 1], ['Carnudos', 1.2]],
    sobr: [['Normais', { a: .3, t: 1 }], ['Grossas', { a: .25, t: 1.4 }], ['Finas', { a: .45, t: .75 }]]
  }
};
const FACE8_DEF = { s: 0, e: 0, n: 1, l: 1, b: 0 };
function face8Of(cfg) { const f = cfg.face || {}; return { s: f.s | 0, e: f.e | 0, n: f.n == null ? 1 : f.n | 0, l: f.l == null ? 1 : f.l | 0, b: f.b | 0 }; }
function face8Rand() { return { s: R(0, 5), e: R(0, 3), n: R(0, 2), l: R(0, 2), b: R(0, 2) }; }
function face8Params(cfg) {
  const G = FACE8[cfg.fem ? 'F' : 'M'], f = face8Of(cfg), pk = (a, i) => (a[i] || a[0])[1];
  return Object.assign({}, pk(G.caras, f.s), pk(G.olhos, f.e), { nw: pk(G.nariz, f.n), lf: pk(G.labios, f.l) }, { br: pk(G.sobr, f.b) });
}
/* textura do olho: branco + íris com anel escuro, fibras, pupila e brilhos (u=.25 é a frente da esfera) */
const _eye8 = {};
function eye8Tex(col) {
  if (_eye8[col]) return _eye8[col];
  const t = ctex(256, 128, (x, w, h) => {
    x.fillStyle = '#f5f0ea'; x.fillRect(0, 0, w, h);
    const cx = 64, cy = 64, R0 = 24, c = new T.Color(col), lt = c.clone().lerp(new T.Color('#c89048'), .18).multiplyScalar(1.25), dk = c.clone().multiplyScalar(.4);
    const g = x.createRadialGradient(cx, cy, 4, cx, cy, R0);
    g.addColorStop(0, '#' + dk.getHexString()); g.addColorStop(.38, '#' + lt.getHexString()); g.addColorStop(.75, col); g.addColorStop(1, '#' + dk.getHexString());
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R0, 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,230,190,.16)'; x.lineWidth = 1.2;
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2; x.beginPath(); x.moveTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12); x.lineTo(cx + Math.cos(a) * (R0 - 4), cy + Math.sin(a) * (R0 - 4)); x.stroke(); }
    x.strokeStyle = 'rgba(10,5,3,.85)'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, R0 - 1, 0, 7); x.stroke();
    x.fillStyle = '#070404'; x.beginPath(); x.arc(cx, cy, 10, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.ellipse(cx + 7, cy - 8, 5.5, 4.8, 0, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(cx - 8, cy + 9, 2.6, 0, 7); x.fill();
    /* sombra da pálpebra no topo do branco */
    const s = x.createLinearGradient(0, 30, 0, 52); s.addColorStop(0, 'rgba(120,80,70,.35)'); s.addColorStop(1, 'rgba(120,80,70,0)'); x.fillStyle = s; x.fillRect(0, 0, w, 52);
  });
  return (_eye8[col] = new T.MeshStandardMaterial({ map: t, roughness: .18, metalness: 0 }));
}
const _g8 = {}; const g8 = (k, f) => _g8[k] || (_g8[k] = f());
const _mix8 = (a, b, k) => '#' + new T.Color(a).lerp(new T.Color(b), k).getHexString();
function _cap8(r, th, ws, mat_, from) { /* calote esférica a partir do polo de cima (from=0) ou de baixo (from=1) */
  const g = g8('c' + r.toFixed(5) + th.toFixed(4) + (ws || 22) + from, () => new T.SphereGeometry(r, ws || 22, 10, 0, Math.PI * 2, from ? Math.PI - th : 0, th));
  return new T.Mesh(g, mat_);
}
/* cabeça numa só peça (sem costura no queixo): união suave de elipsóides */
function head8Shape(hx, hy, jx, jy, fem, F) {
  const A = [.19 * hx, .19 * hy, .19 * 1.02], E = [{ c: [0, -.1, .045], r: [.13 * jx, .13 * jy, .13] }];
  if (F.ck) [-1, 1].forEach(s => E.push({ c: [s * .095, -.025, .085], r: [.07, .05 * (1 + F.ck * .1), .075 + F.ck * .006] }));
  if (F.sq) [-1, 1].forEach(s => E.push({ c: [s * .085 * jx, -.14, .05], r: [.05 + F.sq * .01, .05 + F.sq * .005, .08] }));
  if (F.cf) E.push({ c: [0, -.06, .08], r: [.14 * jx, .09, .1 + F.cf * .01] });
  const ray = (d, e) => { const p = d.map((v, i) => v / e.r[i]), q = e.c.map((v, i) => v / e.r[i]); const a = p[0] * p[0] + p[1] * p[1] + p[2] * p[2], b = -2 * (p[0] * q[0] + p[1] * q[1] + p[2] * q[2]), c = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] - 1, D = b * b - 4 * a * c; if (D < 0) return 0; return Math.max(0, (-b + Math.sqrt(D)) / (2 * a)); };
  const smax = (a, b, k) => { const h = Math.max(0, Math.min(1, .5 + .5 * (b - a) / k)); return a + (b - a) * h + k * h * (1 - h); };
  const rad = d => { let r = 1 / Math.sqrt((d[0] / A[0]) ** 2 + (d[1] / A[1]) ** 2 + (d[2] / A[2]) ** 2); E.forEach((e, i) => { r = smax(r, ray(d, e), i ? .018 : .03); }); return r; };
  return rad;
}
function head8Geo(key, rad) {
  return g8('hd' + key, () => {
    const g = new T.SphereGeometry(1, 40, 30); g.rotateY(-Math.PI / 2); const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { const d = [pa.getX(i), pa.getY(i), pa.getZ(i)], l = Math.hypot(d[0], d[1], d[2]) || 1, u = d.map(v => v / l), r = rad(u); pa.setXYZ(i, u[0] * r, u[1] * r, u[2] * r); }
    g.computeVertexNormals(); return g;
  });
}
/* cabelo com madeixas e faixa de brilho (deixa de parecer um capacete) */
const _hair8 = {};
function hairMat8(col) {
  if (_hair8[col]) return _hair8[col];
  const c = new T.Color(col), L = .299 * c.r + .587 * c.g + .114 * c.b, hi = '#' + c.clone().lerp(new T.Color(L < .15 ? '#6a6070' : '#fff4dc'), L < .15 ? .3 : .26).getHexString(), lo = '#' + c.clone().multiplyScalar(L < .15 ? .6 : .78).getHexString();
  const t = ctex(256, 128, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { const u = (i * 37 % 256) + (i % 3), a = .1 + (i % 5) * .03; x.strokeStyle = i % 2 ? lo : hi; x.globalAlpha = i % 2 ? .3 : a * .7; x.lineWidth = 1 + (i % 3) * .6; x.beginPath(); x.moveTo(u, 0); x.bezierCurveTo(u + 3, h * .3, u - 3, h * .6, u + 2, h); x.stroke(); }
    x.globalAlpha = 1; const g = x.createLinearGradient(0, h * .3, 0, h * .62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, hi); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalAlpha = .55; x.fillStyle = g; for (let u = 0; u < w; u += 4) x.fillRect(u, h * .3 + Math.sin(u / 11) * 4, 4, h * .32);
    x.globalAlpha = 1;
  });
  return (_hair8[col] = cmapM(t));
}
/* casca colada ao rosto (barba, barba por fazer, pêra) — segue qualquer formato de cara */
function shell8(geo, off, tag, keep) {
  return g8('sh' + geo.uuid + tag + off, () => {
    const pa = geo.attributes.position, na = geo.attributes.normal, idx = geo.index.array, pos = new Float32Array(pa.count * 3), out = [];
    for (let i = 0; i < pa.count; i++) { pos[i * 3] = pa.getX(i) + na.getX(i) * off; pos[i * 3 + 1] = pa.getY(i) + na.getY(i) * off; pos[i * 3 + 2] = pa.getZ(i) + na.getZ(i) * off; }
    for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2]; const x = (pa.getX(a) + pa.getX(b) + pa.getX(c)) / 3, y = (pa.getY(a) + pa.getY(b) + pa.getY(c)) / 3, z = (pa.getZ(a) + pa.getZ(b) + pa.getZ(c)) / 3; if (keep(x, y, z)) out.push(a, b, c); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setIndex(out); g.computeVertexNormals(); return g;
  });
}
const _mouthHole8 = (x, y) => (x / .05) ** 2 + ((y + .086) / .019) ** 2 < 1;
/* barba: grelha angular da zona inferior do rosto + máscara pintada (contornos lisos, sem degraus) */
const BD8 = { NT: 30, NP: 48, T0: Math.PI * .4, T1: Math.PI * .985, P0: -Math.PI * .64, P1: Math.PI * .64 };
const _bdir8 = (th, ph) => [Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph)];
function beard8Geo(rad, key, off) {
  return g8('bd' + key + off, () => {
    const { NT, NP, T0, T1, P0, P1 } = BD8, pos = [], uv = [], idx = [];
    for (let i = 0; i <= NT; i++) for (let j = 0; j <= NP; j++) {
      const d = _bdir8(T0 + (T1 - T0) * i / NT, P0 + (P1 - P0) * j / NP), r = rad(d) + off;
      pos.push(d[0] * r, d[1] * r, d[2] * r); uv.push(j / NP, 1 - i / NT);
    }
    const V = (i, j) => i * (NP + 1) + j;
    for (let i = 0; i < NT; i++) for (let j = 0; j < NP; j++) idx.push(V(i, j), V(i + 1, j), V(i, j + 1), V(i + 1, j), V(i + 1, j + 1), V(i, j + 1));
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  });
}
function beard8Tex(rad, key, mask) {
  return g8('bt' + key, () => {
    const { T0, T1, P0, P1 } = BD8, W = 256, H = 112, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), im = x.createImageData(W, H);
    for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) {
      const d = _bdir8(T0 + (T1 - T0) * (v + .5) / H, P0 + (P1 - P0) * (u + .5) / W), r = rad(d), q = (v * W + u) * 4;
      const m = mask(d[0] * r, d[1] * r, d[2] * r), n = 200 + ((u * 73 + v * 151) % 7) * 8;
      im.data[q] = im.data[q + 1] = im.data[q + 2] = n; im.data[q + 3] = m ? 255 : 0;
    }
    x.putImageData(im, 0, 0); const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const x2 = c2.getContext('2d'); x2.filter = 'blur(1.3px)'; x2.drawImage(c, 0, 0);
    const t = new T.CanvasTexture(c2); t.encoding = T.sRGBEncoding; return t;
  });
}
function face8Hair(head, P, ex, cfg) {
  const rad = P.rad8; if (!rad) return false;
  const key = P.headGeo8.uuid, col = ex.includes('beardGrey') ? '#9a9792' : (cfg.beardColor || '#141010');
  const ss = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const top = x => -.064 + ss(.04, .17, Math.abs(x)) * .06;
  const beardM = (x, y, z) => { if (z < -.03 || y > .036) return false; if (_mouthHole8(x, y)) return false; if (Math.abs(x) > .165 && z < .07) return true; return y < top(x); };
  const tm = (k, m, o) => { const M = new T.MeshToonMaterial(Object.assign({ color: col, map: beard8Tex(rad, key + k, m), gradientMap: toonGrad(), alphaTest: .5 }, o || {})); return M; };
  if (ex.includes('beard') || ex.includes('beardGrey')) head.add(new T.Mesh(beard8Geo(rad, key, .0075), tm('b', beardM)));
  else if (ex.includes('stubble')) head.add(new T.Mesh(beard8Geo(rad, key, .0012), tm('s', (x, y, z) => beardM(x, y, z) && z > .015, { alphaTest: .15, transparent: true, opacity: .45, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })));
  if (ex.includes('goatee')) {
    const gM = (x, y, z) => z > .05 && !_mouthHole8(x, y) && ((x / .036) ** 2 + ((y + .134) / .036) ** 2 < 1 || (Math.abs(x) < .05 && y > -.074 && y < -.06 + (Math.abs(x) > .03 ? -.004 : 0)));
    head.add(new T.Mesh(beard8Geo(rad, key, .0078), tm('g', gM)));
  }
  return true;
}
function face8Glasses(head, P, ex, dark, gold) {
  const E = P.eye8, sf = P.surf8; if (!E) return false;
  const yy = E.EY + .004, rr = E.ER * 1.18;
  if (ex.includes('glasses')) {
    [-1, 1].forEach(s => { const x = s * E.EX, r = new T.Mesh(g8('gl' + rr.toFixed(4), () => new T.TorusGeometry(rr, .0055, 6, 22)), dark); r.position.set(x, yy, sf(x, yy) + .014); r.rotation.y = s * .26; head.add(r);
      const a = mesh(bx(.006, .006, .12), dark, s * (E.EX + rr * .98), yy + .006, sf(s * (E.EX + rr), yy) - .045, head, false); a.rotation.y = s * .1; });
    mesh(bx(E.EX * 2 - rr * 2 + .004, .0055, .006), dark, 0, yy + .008, sf(0, yy) + .012, head, false);
  }
  if (ex.includes('sunglasses')) {
    const gm = mat('#16110a', { roughness: .08, metalness: .45 });
    [-1, 1].forEach(s => { const x = s * E.EX, l = mesh(sph(rr, 14, 10), gm, x, yy - .002, sf(x, yy) + .006, head, false); l.scale.set(1.18, .82, .3); l.rotation.z = -s * .08;
      const a = mesh(bx(.006, .007, .12), gold, s * (E.EX + rr * 1.1), yy + .01, sf(s * (E.EX + rr), yy) - .048, head, false); a.rotation.y = s * .1; });
    mesh(bx(E.EX * 2 - rr * 2.1, .006, .006), gold, 0, yy + .012, sf(0, yy) + .014, head, false);
  }
  return true;
}
/* constrói o rosto. Recebe a cabeça e as malhas da cabeça/queixo para ajustar o formato */
function buildFace8(head, cfg, fem, skin, skinD, hairM, P, headM, jawM) {
  const F = face8Params(cfg), ex0 = cfg.extras || [], kid = (cfg.age == null ? 25 : cfg.age) < 13;
  const browM = cmat(shade(cfg.hairColor && cfg.hairColor !== '#e6e6e6' ? cfg.hairColor : '#1a1210', .9)), blk = mat('#0a0606', { roughness: .4 }), lashM = mat('#120a08', { roughness: .85 });
  /* formato */
  const hx = Math.min(fem ? 1.08 : 1.04, F.hw) * (fem ? .96 : 1), hy = F.hy || 1.1, jx = (fem ? .84 : 1.1) * F.jw, jy = (fem ? .64 : .74) * (F.ch || 1);
  const rad = head8Shape(hx, hy, jx, jy, fem, F);
  headM.geometry = head8Geo([fem ? 1 : 0, face8Of(cfg).s, hx.toFixed(3)].join(), rad); headM.scale.set(1, 1, 1); if (jawM.parent) jawM.parent.remove(jawM);
  const inside = (x, y, z) => { const l = Math.hypot(x, y, z); return l <= rad([x / l, y / l, z / l]); };
  const surf = (x, y) => { let lo = 0, hi = .3; if (!inside(x, y, .001)) return 0; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (inside(x, y, m)) lo = m; else hi = m; } return lo; };
  /* blush suave */
  const lip = ex0.includes('lipstick');
  if (fem || kid) [-1, 1].forEach(s => { const b = mesh(sph(.036, 12, 8), mat('#ff6f86', { roughness: .9, transparent: true, opacity: lip ? .16 : .11, depthWrite: false }), s * .105, -.045, surf(s * .105, -.045) - .012, head, false); b.scale.set(1.35, .72, .4); });
  /* olhos */
  const ER = (fem ? .047 : .044) * F.es * (kid ? 1.08 : 1), EX = (fem ? .071 : .072) + F.sp, EY = fem ? .004 : .006;
  const eyeM = eye8Tex(cfg.eyes || '#2b170d');
  const shadow = cfg.shadowColor || (lip ? '#7a3a5a' : null);
  const lidM = fem && shadow ? cmat(_mix8(cfg.skin, shadow, .3)) : skin;
  [-1, 1].forEach(s => {
    const x0 = s * EX, eg = new T.Group(); eg.position.set(x0, EY, surf(x0, EY) - .004); eg.rotation.set(0, s * .14, s * F.tilt); head.add(eg);
    const ball = new T.Mesh(sph(ER, 24, 16), eyeM); ball.position.z = -ER * .7; ball.rotation.y = -s * .02; eg.add(ball);
    /* pálpebra de cima: tapa o topo e faz o arco */
    const uTh = Math.PI * .5, uA = F.up * (fem ? 1.08 : 1);
    const lu = _cap8(ER * 1.045, uTh, 22, lidM, 0); lu.position.z = -ER * .7; lu.rotation.x = -uA; eg.add(lu);
    /* linha de pestanas (fica por baixo da pálpebra e aparece como traço escuro) */
    const lb = new T.Mesh(g8('lb' + ER.toFixed(5) + fem, () => new T.SphereGeometry(ER * 1.02, 22, 6, 0, Math.PI * 2, 0, uTh + (fem ? .27 : .12))), lashM); lb.position.z = -ER * .7; lb.rotation.x = -uA; eg.add(lb);
    /* pálpebra de baixo */
    /* pálpebra de baixo: a própria pele do rosto recorta o olho (sem olheiras nem tremido) */
    /* piscar */
    const bl = new T.Group(); bl.visible = false; eg.add(bl); (P.lids = P.lids || []).push(bl);
    { const c1 = _cap8(ER * 1.032, Math.PI * .62, 22, skin, 0); c1.position.z = -ER * .7; c1.rotation.x = -.15; bl.add(c1);
      const c2 = _cap8(ER * 1.015, Math.PI * .45, 22, skin, 1); c2.position.z = -ER * .7; c2.rotation.x = .1; bl.add(c2);
      const cl = new T.Mesh(g8('cl' + ER.toFixed(5), () => new T.SphereGeometry(ER * 1.04, 22, 3, 0, Math.PI, Math.PI * .6, .09)), lashM); cl.position.z = -ER * .7; cl.rotation.x = -.15; bl.add(cl); }
    if (fem) {
      /* "asa" do eyeliner + pestanas no canto de fora */
      const cx = ER * .8, cy = ER * .1, cz = -ER * .12;
      const wingL = cfg.eyeliner || lip ? .03 : .022;
      const w = new T.Mesh(g8('w' + wingL, () => new T.ConeGeometry(.0058, wingL, 6)), blk); const a = .42;
      w.rotation.z = -(Math.PI / 2 - a) ; w.position.set(cx + Math.cos(a) * wingL / 2, cy + Math.sin(a) * wingL / 2, cz); w.scale.z = .5; eg.add(w);
      const ob = new T.Mesh(g8('ob' + ER.toFixed(5) + s, () => new T.SphereGeometry(ER * 1.025, 12, 5, s > 0 ? Math.PI * .58 : Math.PI * .02, Math.PI * .4, 0, uTh + .36)), lashM); ob.position.z = -ER * .7; ob.rotation.x = -uA; eg.add(ob);
    }
    /* sobrancelhas: arco afilado de esferas achatadas */
    const bg = new T.Group(); const by = EY + (fem ? .072 : .058) + (F.tilt > .15 ? .004 : 0); bg.position.set(x0, by, 0); head.add(bg);
    const bA = F.br.a, bT = F.br.t * (fem ? 1 : 1.25), n = 9, bz = fem ? .004 : .016;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), x = s * (EX - .036 + t * .082 * (fem ? 1 : 1.04)), y = (fem ? .002 : 0) + Math.sin(Math.min(1, t * 1.25) * Math.PI) * .011 * bA - t * .006 + (t > .8 ? -(t - .8) * .03 : 0);
      pts.push(new T.Vector3(x - x0, y, surf(x, by + y) + bz));
    }
    const R0 = (fem ? .0068 : .0095) * bT, TS = 18, RS = 6, cv = new T.CatmullRomCurve3(pts), tkey = 'br' + [fem, s, EX, hx, jx, jy, bA, bT, by].map(v => typeof v === 'number' ? v.toFixed(4) : v).join(), cached = _g8[tkey], tg = cached || new T.TubeGeometry(cv, TS, R0, RS, false), pa = tg.attributes.position;
    if (!cached) {
    for (let i = 0; i <= TS; i++) { const t = i / TS, c = cv.getPointAt(t), k = (t < .12 ? .55 + t / .12 * .45 : 1 - (t - .12) / .88 * (fem ? .7 : .45));
      for (let j = 0; j <= RS; j++) { const q = i * (RS + 1) + j; pa.setXYZ(q, c.x + (pa.getX(q) - c.x) * k * 1.25, c.y + (pa.getY(q) - c.y) * k, c.z + (pa.getZ(q) - c.z) * k * .45); } }
    pa.needsUpdate = true; tg.computeVertexNormals(); _g8[tkey] = tg; }
    { const bm = new T.Mesh(tg, browM); bg.add(bm); [0, TS].forEach(e => { const c = cv.getPointAt(e / TS); const cap_ = mesh(sph(R0 * (e ? (fem ? .3 : .55) : .55), 6, 5), browM, c.x, c.y, c.z, bg, false); cap_.scale.set(1.25, 1, .45); }); }
    (P.brows = P.brows || []).push({ m: bg, r: 0, y: by, s });
    /* orelha */
    mesh(sph(.042, 10, 8), skin, s * .19 * hx, 0, 0, head, false).scale.set(.55, 1, .8);
  });
  /* nariz */
  const nw = F.nw, NY = -.045;
  if (fem) {
    mesh(sph(.012, 10, 8), skin, 0, NY + .026, surf(0, NY + .026) - .006, head, false).scale.set(.85, 2.3, .7);
    mesh(sph(.016, 14, 10), skin, 0, NY, surf(0, NY) + .002, head, false).scale.set(1.35 * nw, .82, .9);
    [-1, 1].forEach(s => mesh(sph(.0034, 6, 4), mat('#3a1c16'), s * .0095 * nw, NY - .0125, surf(s * .0095, NY - .0125) + .0012, head, false).scale.set(1.6, .5, .4));
  } else {
    mesh(sph(.012, 10, 8), skin, 0, NY + .028, surf(0, NY + .028) - .006, head, false).scale.set(1, 2.2, .7);
    mesh(sph(.021, 12, 10), skin, 0, NY + .002, surf(0, NY) + .001, head, false).scale.set(1.3 * nw, .82, .85);
    [-1, 1].forEach(s => mesh(sph(.011, 8, 6), skin, s * .02 * nw, NY - .004, surf(s * .02, NY) - .003, head, false).scale.set(1.1, .85, .8));
    [-1, 1].forEach(s => mesh(sph(.0055, 6, 4), mat('#2a1410'), s * .011 * nw, NY - .016, surf(s * .011, NY - .016) + .003, head, false).scale.set(1.4, .7, .5));
  }
  /* boca */
  const lipC = lip ? (cfg.lipColor || '#9a0f2e') : fem ? _mix8(shade(cfg.skin, .68), '#9c3c4c', .32) : _mix8(shade(cfg.skin, .7), '#5a2a28', .3);
  const lipM = cmat(lipC), lf = F.lf;
  if (fem) {
    const MY = -.098, mg = new T.Group(); mg.position.set(0, MY, surf(0, MY) - .004); head.add(mg); P.mouth = mg;
    [-1, 1].forEach(s => { const u = mesh(sph(.019, 12, 8), lipM, s * .0145, .0085, 0, mg, false); u.scale.set(1.3, .5 * (.85 + lf * .15), .55); u.rotation.z = -s * .18; });
    const lo = mesh(sph(.024, 14, 10), lipM, 0, -.0085, -.002, mg, false); lo.scale.set(1.28, .5 * lf, .6);
    mesh(bx(.044, .0032, .008), mat('#3a1416'), 0, .0005, .008, mg, false);
    [-1, 1].forEach(s => mesh(sph(.0035, 6, 4), mat('#3a1416'), s * .023, .002, .003, mg, false));
    if (lip) { const gl = mesh(sph(.01, 8, 6), mat('#ffffff', { transparent: true, opacity: .32, roughness: .1, depthWrite: false }), .006, -.01, .011 * lf, mg, false); gl.scale.set(1.6, .45, .3); }
  } else {
    const mouth = new T.Mesh(new T.TorusGeometry(.042, .0095 * lf, 8, 20, Math.PI), lipM); mouth.position.set(0, -.082, surf(0, -.082) - .004); mouth.rotation.z = Math.PI; mouth.scale.set(1, .55, 1); head.add(mouth); P.mouth = mouth; P.mouthM = 1;
  }
  P.surf8 = surf;
  { const MY = fem ? -.098 : -.096, mo = new T.Group(); mo.position.set(0, MY, surf(0, MY) + (fem ? .004 : .002)); mo.visible = false; head.add(mo); P.mouthO = mo;
    mesh(sph(.02, 12, 8), mat('#3a1014'), 0, 0, 0, mo, false).scale.set(1.25, .75, .45);
    mesh(sph(.012, 10, 6), mat('#f4f0ea'), 0, .009, .004, mo, false).scale.set(1.5, .32, .4);
    mesh(sph(.011, 8, 6), mat('#c0485a'), 0, -.008, .003, mo, false).scale.set(1.3, .45, .4); }
  P.eye8 = { EX, EY, ER }; P.headGeo8 = headM.geometry; P.rad8 = rad; P.capSX8 = Math.max(1, (Math.max(rad([1, 0, 0]), rad([.97, .24, 0]), rad([.97, -.24, 0])) + .006) / .2);
}
