/* =========================================================
   CIDADE 3D — Luanda (Marginal, Ilha, Baixa, Mutamba, Kilamba,
   Musseque, Talatona, Viana). Substitui o mapa antigo.
   ========================================================= */
const CITY_XS = [-120, -60, 0, 60, 120], CITY_ZS = [-88, -40, 10, 60, 110];
const ROAD_W = 10, SIDE = 6.8;
const WALK = [
  { x0: -178, x1: 178, z0: -100, z1: 148 },   // continente
  { x0: -154, x1: -146, z0: -116, z1: -99 },  // ponte para a Ilha
  { x0: -172, x1: -18, z0: -141, z1: -114 },  // Ilha de Luanda
];
const LOC_POS = {
  empresa: { x: -30, z: -46.8, ico: '🏢', n: 'Torre Empresarial', zona: 'Baixa' },
  banco:   { x: 30,  z: -46.8, ico: '🏦', n: 'Banco Palanca', zona: 'Baixa' },
  emprego: { x: -30, z: -33.2, ico: '💼', n: 'Centro de Emprego', zona: 'Mutamba' },
  escola:  { x: 30,  z: -33.2, ico: '🎓', n: 'Escola & Universidade', zona: 'Mutamba' },
  clinica: { x: 90,  z: -33.2, ico: '🏥', n: 'Clínica', zona: 'Mutamba' },
  mercado: { x: -30, z: 16.8,  ico: '🧺', n: 'Mercado do Roque', zona: 'Rangel' },
  igreja:  { x: 30,  z: 16.8,  ico: '⛪', n: 'Igreja', zona: 'Rangel' },
  ginasio: { x: 90,  z: 16.8,  ico: '🏋️', n: 'Ginásio & Estádio', zona: 'Talatona' },
  shopping:{ x: 150, z: 16.8,  ico: '🛍️', n: 'Kianda Mall', zona: 'Talatona' },
  imobiliaria: { x: -90, z: 53.2, ico: '🏘️', n: 'Imobiliária', zona: 'Centro Habitacional' },
  obras:   { x: -90, z: 116.8, ico: '🏗️', n: 'Terrenos & Obras', zona: 'Viana' },
  casa:    { x: -30, z: 66.8,  ico: '🏠', n: 'A Minha Casa', zona: '' },
  cadeia:  { x: 90,  z: 116.8, ico: '🔒', n: 'Cadeia de Viana', zona: 'Viana' },
  praia:   { x: -100, z: -133, ico: '🏖️', n: 'Praia da Ilha', zona: 'Ilha' },
  farra:   { x: -55, z: -121.5, ico: '💃', n: 'Discoteca Kizomba', zona: 'Ilha' },
  cela:    { x: 90,  z: 136,   ico: '🔒', n: 'Cela', zona: 'Viana' },
};
/* onde fica a casa conforme o tipo de habitação */
/* Centro Habitacional: todas as casas na mesma avenida (linha 4), do bairro pobre (oeste) ao bairro rico (este) */
const CASA_SPOTS = { musseque: [-150, 66.8], zango: [-90, 66.8], bairro: [-30, 66.8], kilamba: [30, 66.8], talatona: [90, 66.8], miramar: [150, 66.8] };
function casaZona() {
  if (!G) return 'bairro';
  const zOf = id => { const C = casaT(id); return C && C.z || 'bairro'; };
  if (G.casa.tipo === 'propria' && G.imoveis[G.casa.idx]) return zOf(G.imoveis[G.casa.idx].id);
  if (G.casa.tipo === 'arrendada') return zOf(G.casa.id);
  if (G.casa.tipo === 'rua') return 'musseque';
  return { pobre: 'musseque', humilde: 'bairro', media: 'kilamba', rica: 'talatona', elite: 'miramar' }[G.classe] || 'bairro';
}
let casaZ = null;
function placeCasa() {
  const z = casaZona(); if (z === casaZ && markers.casa) return; casaZ = z;
  const s = CASA_SPOTS[z] || CASA_SPOTS.bairro, Z = zonaCasa(z); LOC_POS.casa.x = s[0]; LOC_POS.casa.z = s[1]; LOC_POS.casa.zona = `${Z.t} · ${Z.nivel}`;
  if (markers.casa) { markers.casa.g.position.set(s[0], 0, s[1]); }
  HIT_BOXES.casa = [s[0], s[1] + 11, 14, 12, 7];
  if (HITS.length) buildHits();
}
const HIT_BOXES = {
  empresa: [-30, -64, 22, 22, 70], banco: [30, -60, 26, 24, 20], emprego: [-30, -17, 30, 20, 16], escola: [30, -16, 36, 22, 12],
  clinica: [90, -17, 30, 20, 12], mercado: [-30, 34, 40, 30, 4], igreja: [30, 30, 16, 22, 20], ginasio: [90, 36, 40, 34, 10],
  shopping: [150, 34, 40, 30, 10], obras: [-90, 130, 30, 22, 8], casa: [-30, 75, 14, 12, 7], cadeia: [90, 132, 34, 28, 8],
  praia: [-100, -136, 50, 10, 2], farra: [-55, -128, 20, 10, 9], imobiliaria: [-90, 36, 28, 16, 16],
};
function locFace(id) { const L = LOC_POS[id], h = HIT_BOXES[id]; if (!h) return 0; return Math.atan2(h[0] - L.x, h[1] - L.z); }
function clampLand(p) {
  for (const r of WALK) if (p.x >= r.x0 && p.x <= r.x1 && p.z >= r.z0 && p.z <= r.z1) return;
  let best = null, bd = 1e9;
  for (const r of WALK) { const x = Math.max(r.x0, Math.min(p.x, r.x1)), z = Math.max(r.z0, Math.min(p.z, r.z1)), d = (x - p.x) ** 2 + (z - p.z) ** 2; if (d < bd) { bd = d; best = [x, z]; } }
  p.x = best[0]; p.z = best[1];
}

/* ---------- texturas ---------- */
const _ct = {};
function facadeTex(kind, face, glass) {
  const k = kind + face + glass; if (_ct[k]) return _ct[k];
  const t = ctex(128, 128, x => {
    x.fillStyle = face; x.fillRect(0, 0, 128, 128);
    if (kind === 'glass') { // fachada de vidro
      const g = x.createLinearGradient(0, 0, 128, 128); g.addColorStop(0, glass); g.addColorStop(.5, shade(glass, 1.25)); g.addColorStop(1, shade(glass, .8));
      x.fillStyle = g; x.fillRect(0, 0, 128, 128); x.fillStyle = face; for (let i = 0; i < 4; i++) x.fillRect(i * 32, 0, 3, 128); x.fillRect(0, 0, 128, 4); x.fillRect(0, 64, 128, 4);
      x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(6, 8, 20, 50);
    } else if (kind === 'res') { // residencial com varandas
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const X = i * 64, Y = j * 64; x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(X + 12, Y + 10, 40, 36);
        x.fillStyle = glass; x.fillRect(X + 15, Y + 13, 34, 30); x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(X + 15, Y + 13, 34, 6);
        x.fillStyle = shade(face, .8); x.fillRect(X + 8, Y + 46, 48, 6); x.fillStyle = shade(face, 1.1); x.fillRect(X + 8, Y + 44, 48, 3);
        x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(X + 31, Y + 13, 2, 30);
      }
    } else if (kind === 'kil') { // Kilamba: janelas com moldura branca
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const X = i * 64, Y = j * 64; x.fillStyle = '#f4f1ea'; x.fillRect(X + 10, Y + 10, 44, 40);
        x.fillStyle = glass; x.fillRect(X + 14, Y + 14, 36, 32); x.fillStyle = '#f4f1ea'; x.fillRect(X + 31, Y + 14, 2, 32);
      }
    } else { // escritório
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const X = i * 64, Y = j * 64; x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(X + 6, Y + 10, 52, 40);
        x.fillStyle = glass; x.fillRect(X + 8, Y + 12, 48, 36); x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(X + 8, Y + 12, 48, 5);
      }
    }
    for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .05})`; x.fillRect(R(0, 127), R(0, 127), R(1, 6), R(1, 6)); }
  });
  return (_ct[k] = t);
}
let _lit2;
function litTex2() {
  if (!_lit2) _lit2 = ctex(256, 256, x => { x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if (Math.random() < .4) { x.fillStyle = Math.random() < .5 ? '#ffd27a' : '#fff1c4'; x.fillRect(i * 32 + 6, j * 32 + 7, 20, 17); } });
  return _lit2;
}

/* ---------- detalhes de arquitetura ---------- */
function nightBand(c, day = .15, night = 1.7) { const k = 'nb' + c; if (_ct[k]) return _ct[k]; const m = new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: day, roughness: .4, metalness: .3 }); nightMats.push({ m, day, night }); return (_ct[k] = m); }
function facMat(kind, face, glass, w, h) {
  const flo = kind === 'glass' ? 6.8 : 6.4, rx = Math.max(1, Math.round(w / flo)), ry = Math.max(1, Math.round(h / flo));
  const map = facadeTex(kind, face, glass).clone(); map.needsUpdate = true; map.wrapS = map.wrapT = T.RepeatWrapping; map.repeat.set(rx, ry);
  const lit = litTex2().clone(); lit.needsUpdate = true; lit.wrapS = lit.wrapT = T.RepeatWrapping; lit.repeat.set(rx / 4, ry / 4);
  const m = new T.MeshStandardMaterial({ map, roughness: kind === 'glass' ? .22 : .8, metalness: kind === 'glass' ? .5 : 0, emissive: '#ffffff', emissiveMap: lit, emissiveIntensity: 0 });
  nightMats.push({ m, day: 0, night: .85 }); return m;
}
function tier(cx, cz, w, d, y0, h, kind, face, glass, roof) {
  const m = facMat(kind, face, glass, w, h), r = mat(roof || shade(face, .7));
  const t = new T.Mesh(bx(w, h, d), [m, m, r, r, m, m]); t.position.set(cx, y0 + h / 2, cz); t.castShadow = t.receiveShadow = true; worldScene.add(t); return t;
}
function bldgCrown(cx, cz, w, d, h, face, glass, kind, m, roofM, o) {
  const band = nightBand(o.band || (kind === 'glass' ? '#7fd3ff' : '#ffd27a'));
  mesh(bx(w + .7, .35, d + .7), band, cx, h + .35, cz, decor, false);
  const tw = w * .7, td = d * .7, th = Math.min(9, Math.max(4, h * .12));
  tier(cx, cz, tw, td, h + .3, th, kind, face, glass);
  mesh(bx(tw + .5, .3, td + .5), band, cx, h + th + .45, cz, decor, false);
  if (h > 50) {
    const tw2 = tw * .6, td2 = td * .6; tier(cx, cz, tw2, td2, h + th + .3, 4, kind, face, glass);
    mesh(cyl(.1, .28, 12, 6), mat('#e8e8e8', { metalness: .7, roughness: .3 }), cx, h + th + 10.3, cz, decor);
    const rl = new T.Mesh(sph(.35, 8, 6), new T.MeshStandardMaterial({ color: '#ff3030', emissive: '#ff2020', emissiveIntensity: 1.5 })); rl.position.set(cx, h + th + 16.4, cz); worldScene.add(rl);
  } else { mesh(bx(tw * .5, 1.4, td * .5), mat('#9aa0a6'), cx, h + th + 1, cz, decor); }
}
const AWN = ['#c8102e', '#ffcb00', '#1f63c9', '#2e8b57', '#ff7a1a', '#f2f2f2'];
function bldgAwnings(cx, cz, w, d) {
  const n = Math.max(1, Math.floor(w / 4.6)), sw = w / n;
  [1, -1].forEach(sg => { for (let i = 0; i < n; i++) { if (Math.random() < .25) continue; const a = mesh(bx(sw - .9, .12, 1.5), mat(pick(AWN), { roughness: .9 }), cx - w / 2 + (i + .5) * sw, 3.35, cz + sg * (d / 2 + .9), decor, false); a.rotation.x = sg * .28; } });
}
function canopy(x, z, w, dep, y, col, edge, ry = 0) {
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; decor.add(g);
  mesh(bx(w, .32, dep), mat(col, { roughness: .4 }), 0, y, 0, g); mesh(bx(w + .1, .36, .14), mat(edge || '#c9a227', { metalness: .6, roughness: .3 }), 0, y, dep / 2, g);
  [-1, 1].forEach(s => mesh(cyl(.13, .13, y, 8), mat('#d9d9d9', { metalness: .7, roughness: .3 }), s * (w / 2 - .5), y / 2, dep / 2 - .3, g));
  const lm = nightBand('#fff1c4', 0, 1.4); mesh(bx(w - 1, .04, dep - .8), lm, 0, y - .18, 0, g, false);
  return g;
}
function pediment(x, y, z, w, hgt, dep, col, ry = 0) {
  const sh = new T.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, hgt); sh.closePath();
  const geo = new T.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: false }); geo.translate(0, 0, -dep / 2);
  const m = new T.Mesh(geo, mat(col)); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; decor.add(m); return m;
}
function colonnade(x0, x1, z, n, h, r, col) { for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * i / (n - 1); mesh(cyl(r * .9, r, h, 14), mat(col), x, h / 2, z, decor); mesh(bx(r * 2.4, .4, r * 2.4), mat(col), x, .2, z, decor); mesh(bx(r * 2.4, .4, r * 2.4), mat(col), x, h - .2, z, decor); } }
function steps(x, z, w, n, dz) { for (let i = 0; i < n; i++) mesh(bx(w - i * .4, .25, 1.2 * (n - i)), mat('#e9e4d8'), x, .125 + i * .25, z - dz * (n - i) * .6 + dz * .6 * n, decor); }
/* Torre Empresarial — torre escalonada de vidro com coroa e antena */
function torreEmpresarial() {
  const cx = -30, cz = -64;
  tier(cx, cz, 22, 22, 0, 10, 'glass', '#18232e', '#9ad8f8', '#1a2430'); addCol(cx, cz, 22.4, 22.4);
  mesh(bx(22.6, .5, 22.6), nightBand('#ffcb00', .25, 1.8), cx, 10.1, cz, decor, false);
  tier(cx, cz, 18, 18, 10.3, 34, 'glass', '#20303f', '#5fa8d8', '#1a2430');
  mesh(bx(18.6, .45, 18.6), nightBand('#ffcb00', .25, 1.8), cx, 44.5, cz, decor, false);
  tier(cx, cz, 14, 14, 44.7, 14, 'glass', '#20303f', '#6fb8e4', '#1a2430');
  mesh(bx(14.6, .45, 14.6), nightBand('#ffcb00', .25, 1.8), cx, 58.9, cz, decor, false);
  tier(cx, cz, 10, 10, 59.1, 9, 'glass', '#1a2a38', '#7fc8ee', '#1a2430');
  const fm = mat('#d9dee4', { metalness: .8, roughness: .25 });
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => mesh(bx(.5, 7, .5), fm, cx + a * 4.6, 71.5, cz + b * 4.6, decor));
  [75, 70].forEach(y => mesh(bx(9.8, .4, 9.8), y === 75 ? nightBand('#ffcb00', .3, 2) : fm, cx, y, cz, decor, false));
  mesh(cyl(.15, .4, 16, 8), fm, cx, 83, cz, decor);
  const rl = new T.Mesh(sph(.45, 8, 6), new T.MeshStandardMaterial({ color: '#ff3030', emissive: '#ff2020', emissiveIntensity: 1.6 })); rl.position.set(cx, 91.2, cz); worldScene.add(rl);
  [-1, 1].forEach(s => mesh(bx(.4, 34, .4), nightBand('#9ad8f8', .1, 1.5), cx + s * 9.05, 27.3, cz - 9.05, decor, false));
  canopy(cx, -51.2, 12, 3.8, 4.4, '#f4f4f4', '#ffcb00');
  mesh(cyl(1.3, 1.3, 3.2, 20), mat('#9ad8f8', { metalness: .6, roughness: .1, transparent: true, opacity: .8 }), cx, 1.6, -53, decor, false);
  [-1, 1].forEach(s => { mesh(cyl(.08, .08, 9, 6), mat('#ddd', { metalness: .6 }), cx + s * 8, 4.5, -50.6, decor); });
  sign('TORRE EMPRESARIAL', 14, '#0d1a26', '#ffcb00', 'NEGÓCIOS · EMPRESAS · IMPÉRIO', cx, 7.3, -52.95);
}
/* Banco Palanca — edifício colonial cor-de-rosa com cúpula (estilo colonial) */
function bancoKwanza() {
  const cx = 30, cz = -64, pink = '#e7a99c', wht = '#f7f3ea';
  const t = ctex(256, 256, x => {
    x.fillStyle = pink; x.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      const X = c * 64 + 14, Y = r * 128 + 30; x.fillStyle = wht; x.beginPath(); x.moveTo(X - 4, Y + 80); x.lineTo(X - 4, Y + 18); x.arc(X + 18, Y + 18, 22, Math.PI, 0); x.lineTo(X + 40, Y + 80); x.fill();
      x.fillStyle = '#2a3a4a'; x.beginPath(); x.moveTo(X, Y + 76); x.lineTo(X, Y + 18); x.arc(X + 18, Y + 18, 18, Math.PI, 0); x.lineTo(X + 36, Y + 76); x.fill();
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(X + 3, Y + 20, 6, 50); x.fillStyle = wht; x.fillRect(X - 6, Y + 80, 48, 6); x.fillRect(X + 16, Y + 2, 4, 74);
    }
    x.fillStyle = wht; x.fillRect(0, 0, 256, 8); x.fillRect(0, 124, 256, 8); x.fillRect(0, 0, 6, 256);
  });
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(5, 1.6);
  const lit = litTex2().clone(); lit.needsUpdate = true; lit.wrapS = lit.wrapT = T.RepeatWrapping; lit.repeat.set(1.2, .4);
  const m = new T.MeshStandardMaterial({ map: t, roughness: .75, emissive: '#ffffff', emissiveMap: lit, emissiveIntensity: 0 }); nightMats.push({ m, day: 0, night: .5 });
  const r = mat('#b98478');
  const b = new T.Mesh(bx(26, 15, 18), [m, m, r, r, m, m]); b.position.set(cx, 7.5, cz); b.castShadow = b.receiveShadow = true; worldScene.add(b); addCol(cx, cz, 26.4, 18.4);
  mesh(bx(26.4, 1.4, 18.4), mat(wht), cx, .7, cz, decor);
  mesh(bx(27, .9, 19), mat(wht), cx, 15.2, cz, decor);
  for (let i = 0; i < 26; i++) mesh(bx(.3, .9, .3), mat(wht), cx - 12.6 + i * 1.008, 16.1, cz - 9.3, decor);
  for (let i = 0; i < 26; i++) mesh(bx(.3, .9, .3), mat(wht), cx - 12.6 + i * 1.008, 16.1, cz + 9.3, decor);
  mesh(bx(27, .25, .3), mat(wht), cx, 16.6, cz - 9.3, decor); mesh(bx(27, .25, .3), mat(wht), cx, 16.6, cz + 9.3, decor);
  [[-1, 1], [1, 1]].forEach(([s]) => { mesh(bx(4, 17, 4), mat(pink), cx + s * 11.4, 8.5, cz + 7.4, decor); mesh(bx(4.6, .7, 4.6), mat(wht), cx + s * 11.4, 17.3, cz + 7.4, decor); const p = new T.Mesh(new T.ConeGeometry(2.6, 2.4, 4), mat('#6fae9a', { metalness: .3, roughness: .5 })); p.position.set(cx + s * 11.4, 18.8, cz + 7.4); p.rotation.y = Math.PI / 4; p.castShadow = true; decor.add(p); });
  colonnade(cx - 7.5, cx + 7.5, cz + 10.4, 6, 10, .55, wht);
  mesh(bx(17.4, 2.2, 3.4), mat(wht), cx, 11.1, cz + 10.1, decor); pediment(cx, 12.2, cz + 10.1, 17.4, 3.4, 3.2, wht);
  mesh(bx(18, .4, 3.8), mat('#e9e4d8'), cx, .2, cz + 10.2, decor); mesh(bx(18, .4, 1.4), mat('#e9e4d8'), cx, .2, cz + 12.4, decor); addCol(cx, cz + 10.4, 17, .9);
  mesh(cyl(4.2, 4.4, 3, 24), mat(wht), cx, 17.4, cz, decor);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mesh(bx(.5, 1.6, .2), mat('#2a3a4a'), cx + Math.cos(a) * 4.3, 17.6, cz + Math.sin(a) * 4.3, decor, false).rotation.y = -a + Math.PI / 2; }
  const dome = new T.Mesh(new T.SphereGeometry(4.4, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#6fae9a', { metalness: .35, roughness: .45 })); dome.position.set(cx, 18.9, cz); dome.castShadow = true; decor.add(dome);
  mesh(cyl(.8, .8, 1.6, 12), mat(wht), cx, 24, cz, decor); mesh(sph(.9, 12, 8), mat('#6fae9a', { metalness: .35 }), cx, 24.9, cz, decor); mesh(cyl(.06, .12, 2.2, 6), mat('#e8b923', { metalness: .8 }), cx, 26.6, cz, decor);
  sign('BANCO PALANCA', 10, wht, '#7a1a1a', 'CONTA · CRÉDITO · IMOBILIÁRIA', cx, 11.1, cz + 11.82);
  [-1, 1].forEach(s => { mesh(cyl(.07, .07, 8, 6), mat('#ddd', { metalness: .6 }), cx + s * 11.5, 4, cz + 13.6, decor); });
  const fl = ctex(150, 100, x => { x.fillStyle = '#cc092f'; x.fillRect(0, 0, 150, 50); x.fillStyle = '#000'; x.fillRect(0, 50, 150, 50); x.fillStyle = '#ffcb00'; x.beginPath(); x.arc(75, 50, 18, Math.PI * .8, Math.PI * 2); x.lineWidth = 6; x.strokeStyle = '#ffcb00'; x.stroke(); });
  [-1, 1].forEach(s => { const f = new T.Mesh(new T.PlaneGeometry(2.4, 1.6), new T.MeshStandardMaterial({ map: fl, side: T.DoubleSide })); f.position.set(cx + s * 11.5 + 1.2, 7.1, cz + 13.6); worldScene.add(f); });
}
/* Mausoléu Agostinho Neto — o "foguetão" de Luanda */
function mausoleu(cx, cz) {
  const c = mat('#c9c4b8', { roughness: .8 }), c2 = mat('#b5afa2', { roughness: .8 });
  mesh(cyl(12, 12.5, .6, 40), mat('#e9e4d8'), cx, .3, cz, decor);
  mesh(cyl(7, 8, 4, 8), c2, cx, 2.6, cz, decor); addCol(cx, cz, 13, 13); addCol(cx, cz, 11, 11, 60); colMaxH = Math.max(colMaxH, 60);
  mesh(cyl(3, 5.2, 30, 8), c, cx, 19.6, cz, decor);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; mesh(bx(.7, 30, .9), c2, cx + Math.cos(a) * 4.1, 19.6, cz + Math.sin(a) * 4.1, decor).rotation.y = -a; }
  mesh(cyl(4.2, 3, 3, 8), c2, cx, 36.1, cz, decor);
  mesh(cyl(4.4, 4.4, .5, 8), nightBand('#ffd27a', .1, 1.4), cx, 37.8, cz, decor, false);
  mesh(cyl(.5, 2.6, 16, 8), c, cx, 46, cz, decor); mesh(cyl(.05, .5, 6, 6), mat('#e8e8e8', { metalness: .6 }), cx, 57, cz, decor);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; palm(cx + Math.cos(a) * 10, cz + Math.sin(a) * 10, .9); }
}

/* edifício melhorado: rés-do-chão comercial, cornija, terraço com caixas de água */
function bldg(cx, cz, w, d, h, o = {}) {
  const face = o.face || '#d9d2c0', glass = o.glass || '#2a3d52', kind = o.kind || 'office';
  const flo = kind === 'glass' ? 6.8 : 6.4, rx = Math.max(1, Math.round(w / flo)), ry = Math.max(1, Math.round((h - 4) / flo));
  const base = facadeTex(kind, face, glass), map = base.clone(); map.needsUpdate = true; map.wrapS = map.wrapT = T.RepeatWrapping; map.repeat.set(rx, ry);
  const lit = litTex2().clone(); lit.needsUpdate = true; lit.wrapS = lit.wrapT = T.RepeatWrapping; lit.repeat.set(rx / 4, ry / 4);
  const m = new T.MeshStandardMaterial({ map, roughness: kind === 'glass' ? .25 : .8, metalness: kind === 'glass' ? .45 : 0, emissive: '#ffffff', emissiveMap: lit, emissiveIntensity: 0 });
  nightMats.push({ m, day: 0, night: .85 });
  const roofM = mat(o.roof || shade(face, .7));
  const b = new T.Mesh(bx(w, h - 4, d), [m, m, roofM, roofM, m, m]); b.position.set(cx, 4 + (h - 4) / 2, cz); b.castShadow = b.receiveShadow = true; worldScene.add(b);
  // rés-do-chão
  const gf = mat(o.base || shade(face, .55), { roughness: .6 });
  mesh(bx(w + .3, 4, d + .3), gf, cx, 2, cz, decor);
  const shopM = mat('#1e2a36', { roughness: .15, metalness: .5 });
  [1, -1].forEach(sg => mesh(bx(w * .8, 2.6, .05), shopM, cx, 1.7, cz + sg * (d / 2 + .17), decor, false));
  [1, -1].forEach(sg => mesh(bx(.05, 2.6, d * .8), shopM, cx + sg * (w / 2 + .17), 1.7, cz, decor, false));
  // cornija e terraço
  mesh(bx(w + .6, .5, d + .6), mat(shade(face, 1.08)), cx, h + .05, cz, decor);
  const crowned = !o.noTop && h > 34;
  if (crowned) bldgCrown(cx, cz, w, d, h, face, glass, kind, m, roofM, o);
  else if (kind !== 'glass' && !o.noPil) { const pm = mat(shade(face, 1.12), { roughness: .7 }); [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, c]) => mesh(bx(.8, h - 4, .8), pm, cx + a * (w / 2 - .2), 4 + (h - 4) / 2, cz + c * (d / 2 - .2), decor)); }
  if (kind !== 'glass' && !o.noShops && !o.noTop && h < 50 && w >= 8) bldgAwnings(cx, cz, w, d);
  if (!o.noTop && !crowned) {
    const tk = mat('#2a5aa8'), tw = mat('#e8e8e8');
    for (let i = 0; i < Math.min(4, Math.ceil(w * d / 160)); i++) { const tx = cx + (Math.random() - .5) * (w - 3), tz = cz + (Math.random() - .5) * (d - 3); mesh(cyl(.7, .7, 1.4, 10), Math.random() < .5 ? tk : tw, tx, h + 1, tz, decor); }
    if (Math.random() < .6) mesh(bx(2.2, 1.2, 1.6), mat('#9aa0a6'), cx + w * .25, h + .9, cz - d * .2, decor);
    if (h > 40) { mesh(cyl(.08, .08, 8, 5), mat('#ccc'), cx, h + 4, cz, decor); }
  }
  if (!o.nocol) { addCol(cx, cz, w + .6, d + .6, h + 1); colMaxH = Math.max(colMaxH, Math.min(h + 1, 60)); }
  return b;
}
function kilamba(cx, cz, c, h) { return bldg(cx, cz, 13, 11, h, { face: c, glass: '#3b5a7a', kind: 'kil', base: shade(c, .7) }); }
function treeA(x, z, s = 1) { // acácia / árvore de rua
  const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); decor.add(g);
  mesh(cyl(.16, .22, 3, 6), mat('#6b4a2e'), 0, 1.5, 0, g);
  const lm = mat(pick(['#3f7d2c', '#4c8a33', '#367226']), { roughness: .9 });
  [[0, 3.6, 0, 1.6], [.9, 3.2, .3, 1.1], [-.8, 3.3, -.4, 1.2], [.2, 4.2, -.6, 1]].forEach(([a, b, c, r]) => mesh(sph(r, 9, 7), lm, a, b, c, g).scale.y = .8);
  addCol(x, z, .5, .5);
}
function carModel(col) {
  const g = new T.Group(), body = mat(col || pick(['#f2f2f2', '#151515', '#c8102e', '#1f63c9', '#9aa0a6', '#2e8b57', '#e8b923']), { roughness: .35, metalness: .35 });
  mesh(bx(4, .7, 1.8), body, 0, .65, 0, g);
  const cab = mesh(bx(2.2, .65, 1.6), body, -.2, 1.3, 0, g);
  mesh(bx(2.25, .5, 1.62), mat('#1b2530', { roughness: .1, metalness: .6 }), -.2, 1.32, 0, g, false);
  [[-1.3, 1], [1.3, 1], [-1.3, -1], [1.3, -1]].forEach(([wx, s]) => { const w = mesh(cyl(.34, .34, .24, 12), mat('#141414'), wx, .34, s * .86, g); w.rotation.x = Math.PI / 2; });
  mesh(bx(.05, .16, .4), mat('#fff6c0', { emissive: '#fff6c0', emissiveIntensity: .6 }), 2.01, .75, .6, g, false);
  mesh(bx(.05, .16, .4), mat('#fff6c0', { emissive: '#fff6c0', emissiveIntensity: .6 }), 2.01, .75, -.6, g, false);
  mesh(bx(.05, .14, .35), mat('#c8102e', { emissive: '#c8102e', emissiveIntensity: .5 }), -2.01, .8, .6, g, false);
  mesh(bx(.05, .14, .35), mat('#c8102e', { emissive: '#c8102e', emissiveIntensity: .5 }), -2.01, .8, -.6, g, false);
  return g;
}
function wallRect(x0, z0, x1, z1, h, m, gap, gateN) { // muro com portão (+z, ou -z se gateN)
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
  if (gateN) { const t = z0; z0 = z1; z1 = t; }
  mesh(bx(w, h, .3), m, cx, h / 2, z0, decor); addCol(cx, z0, w, .3);
  mesh(bx(.3, h, d), m, x0, h / 2, cz, decor); addCol(x0, cz, .3, d);
  mesh(bx(.3, h, d), m, x1, h / 2, cz, decor); addCol(x1, cz, .3, d);
  const gw = gap || 4, side = (w - gw) / 2;
  mesh(bx(side, h, .3), m, x0 + side / 2, h / 2, z1, decor); addCol(x0 + side / 2, z1, side, .3);
  mesh(bx(side, h, .3), m, x1 - side / 2, h / 2, z1, decor); addCol(x1 - side / 2, z1, side, .3);
}
function villa(cx, cz, c, big, gateN) { // vivenda moderna com muro e piscina
  const s = typeof big === 'number' ? big : big ? 1.4 : 1, f = gateN ? -1 : 1;
  wallRect(cx - 9 * s, cz - 8 * s, cx + 9 * s, cz + 8 * s, 2.2, mat('#efe9dc'), 4, gateN);
  bldg(cx - 2 * s, cz - 2.5 * s * f, 10 * s, 7 * s, big === true ? 11 : 8, { face: c || '#f4f1ea', glass: '#2a4a66', kind: 'res', noTop: true, base: '#d8d1c2' });
  const pool = new T.Mesh(new T.PlaneGeometry(4 * s, 3 * s), new T.MeshStandardMaterial({ color: '#2ab0d8', roughness: .1, metalness: .2, emissive: '#0a4a66', emissiveIntensity: .2 }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(cx + 5 * s, .08, cz + 2 * s * f); worldScene.add(pool);
  palm(cx + 7.5 * s, cz - 6 * s * f, .8);
}
function blockHouse(cx, cz, c) { // casa de blocos (bairro)
  wallRect(cx - 5.5, cz - 5, cx + 5.5, cz + 5, 1.8, mat(shade(c, .9)), 3, true);
  mesh(bx(7, 3, 6), mat(c), cx, 1.5, cz + 1, decor); addCol(cx, cz + 1, 7, 6);
  mesh(bx(7.6, .25, 6.6), mat('#7a7f84', { metalness: .4 }), cx, 3.15, cz + 1, decor);
  mesh(bx(.9, 2, .06), mat('#4a2e1a'), cx, 1, cz - 2.04, decor, false); mesh(bx(1.2, .9, .06), mat('#1a2633'), cx + 2, 1.7, cz - 2.04, decor, false);
  mesh(cyl(.6, .6, 1.2, 8), mat('#2a5aa8'), cx - 2.5, 3.9, cz + 2, decor);
}

/* ---------- céu em gradiente ---------- */
let skyMat = null;
function makeSky() {
  skyMat = new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T.Color('#3d8fd8') }, hor: { value: new T.Color('#bfe3f7') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6,0.,1.); gl_FragColor = vec4(mix(hor, top, pow(h,.7)),1.); }' });
  const s = new T.Mesh(new T.SphereGeometry(800, 24, 12), skyMat); s.renderOrder = -1; worldScene.add(s); return s;
}
let skyMesh = null;
function citySky(col, night) {
  if (!skyMat) return;
  skyMat.uniforms.hor.value.copy(col).lerp(new T.Color('#ffffff'), .25 * (1 - night));
  skyMat.uniforms.top.value.copy(col).multiplyScalar(.62 + .1 * night);
  if (skyMesh) skyMesh.position.copy(camera.position);
}

/* ---------- ruas ---------- */
const _asp = {};
function asphaltTex(vert, L) {
  const k = vert ? 'v' : 'h';
  if (!_asp[k]) _asp[k] = ctex(vert ? 128 : 256, vert ? 256 : 128, x => {
    const W = vert ? 128 : 256, H = vert ? 256 : 128;
    x.fillStyle = '#3a3b3f'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .07})`; x.fillRect(R(0, W - 1), R(0, H - 1), 2, 2); }
    // marcas dos pneus: duas faixas escuras por via (o asfalto gasta-se onde as rodas passam)
    x.fillStyle = 'rgba(0,0,0,.10)';
    if (vert) { x.fillRect(26, 0, 16, H); x.fillRect(84, 0, 16, H); } else { x.fillRect(0, 26, W, 16); x.fillRect(0, 84, W, 16); }
    // remendos e fissuras
    for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(0,0,0,.16)'; if (vert) x.fillRect(R(6, W - 30), R(0, H - 10), R(8, 20), R(3, 7)); else x.fillRect(R(0, W - 10), R(6, H - 30), R(3, 7), R(8, 20)); }
    const ln = (p, c, dash) => { x.fillStyle = c; for (let d = 0; d < 256; d += dash ? 32 : 256) vert ? x.fillRect(p, d, 3, dash ? 18 : 256) : x.fillRect(d, p, dash ? 18 : 256, 3); };
    ln(4, '#e8e8e8'); ln(121, '#e8e8e8'); ln(60, '#ffcb00'); ln(65, '#ffcb00');
  });
  const t = _asp[k].clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping;
  if (vert) t.repeat.set(1, L / 20); else t.repeat.set(L / 20, 1);
  return t;
}
function road(x0, z0, x1, z1) { // estrada reta (horizontal ou vertical)
  const vert = x0 === x1, L = vert ? z1 - z0 : x1 - x0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const sw = new T.Mesh(new T.PlaneGeometry(vert ? ROAD_W + 6 : L + 6, vert ? L + 6 : ROAD_W + 6), sideMat);
  sw.rotation.x = -Math.PI / 2; sw.position.set(cx, .03, cz); sw.receiveShadow = true; worldScene.add(sw);
  const r = new T.Mesh(new T.PlaneGeometry(vert ? ROAD_W : L, vert ? L : ROAD_W), new T.MeshStandardMaterial({ map: asphaltTex(vert, L), roughness: .92 }));
  r.rotation.x = -Math.PI / 2; r.position.set(cx, vert ? .05 : .056, cz); r.receiveShadow = true; worldScene.add(r);
}
function curbs() { // lancis por troço (sem atravessar cruzamentos)
  const cm = mat('#d8d2c6'), h = ROAD_W / 2, X = CITY_XS, Z = CITY_ZS;
  const seg = (a, b, fixed, vert) => { const L = b - a; if (L < 1) return; const c = (a + b) / 2; [-1, 1].forEach(s => vert ? mesh(bx(.3, .18, L), cm, fixed + s * h, .09, c, decor, false) : mesh(bx(L, .18, .3), cm, c, .09, fixed + s * h, decor, false)); };
  X.forEach(x => { for (let i = 0; i < Z.length; i++) seg(Z[i] + h, i < Z.length - 1 ? Z[i + 1] - h : 148, x, true); });
  Z.forEach(z => { seg(-178, X[0] - h, z, false); for (let i = 0; i < X.length - 1; i++) seg(X[i] + h, X[i + 1] - h, z, false); seg(X[X.length - 1] + h, 178, z, false); });
  const im = new T.MeshStandardMaterial({ color: '#3a3b3f', roughness: .92 });
  X.forEach(x => Z.forEach(z => { const p = new T.Mesh(new T.PlaneGeometry(ROAD_W, ROAD_W), im); p.rotation.x = -Math.PI / 2; p.position.set(x, .062, z); p.receiveShadow = true; worldScene.add(p); }));
}
let sideMat;
function crosswalk(x, z) {
  const m = mat('#f2f2f2', { roughness: .7 });
  for (let i = -3; i <= 3; i++) {
    mesh(bx(.7, .02, 3), m, x + i * 1.3, .07, z - ROAD_W / 2 - 2, decor, false); mesh(bx(.7, .02, 3), m, x + i * 1.3, .07, z + ROAD_W / 2 + 2, decor, false);
    mesh(bx(3, .02, .7), m, x - ROAD_W / 2 - 2, .07, z + i * 1.3, decor, false); mesh(bx(3, .02, .7), m, x + ROAD_W / 2 + 2, .07, z + i * 1.3, decor, false);
  }
}
function groundPatch(x0, z0, x1, z1, col, y = .02, tex) {
  const p = new T.Mesh(new T.PlaneGeometry(x1 - x0, z1 - z0), tex ? new T.MeshStandardMaterial({ map: tex, roughness: 1 }) : mat(col, { roughness: 1 }));
  p.rotation.x = -Math.PI / 2; p.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); p.receiveShadow = true; worldScene.add(p); return p;
}
function noiseTex(base, spots, rep, n = 1600) {
  const t = ctex(256, 256, x => { x.fillStyle = base; x.fillRect(0, 0, 256, 256); for (let i = 0; i < n; i++) { x.fillStyle = pick(spots); x.globalAlpha = Math.random() * .35; x.fillRect(R(0, 255), R(0, 255), R(1, 5), R(1, 5)); } x.globalAlpha = 1; });
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t;
}
function sign(text, w, bg, fg, sub, x, y, z, ry = 0) { const s = signPlane(text, w, bg, fg, sub); s.position.set(x, y, z); s.rotation.y = ry; worldScene.add(s); return s; }

/* ---------------- vida nos passeios: paragens, bancas, mupis e caixotes ---------------- */
function paragem(x, z, ry = 0) {  // abrigo da paragem de candongueiro
  const g = new T.Group(); g.name = 'paragem';
  const post = mat('#394048', { roughness: .6, metalness: .3 });
  [[-1.7, -0.9], [1.7, -0.9]].forEach(([px, pz]) => mesh(cyl(.06, .06, 2.4, 8), post, px, 1.2, pz, g));
  mesh(bx(4.2, .12, 1.7), mat('#1f63c9', { roughness: .5 }), 0, 2.45, -.15, g);
  mesh(bx(3.6, .42, .12), mat('#ffcb00', { roughness: .5 }), 0, 2.1, -.95, g, false);
  mesh(bx(3.4, .08, .5), mat('#8a6b46', { roughness: .8 }), 0, .55, -.55, g, false);
  mesh(bx(3.4, .5, .08), mat('#8a6b46', { roughness: .8 }), 0, .95, -.9, g, false);
  const s = signPlane('🚌 PARAGEM', 2.2, '#0d3f8f', '#ffffff'); s.material.side = T.DoubleSide; s.position.set(0, 1.55, -.99); g.add(s);
  g.position.set(x, 0, z); g.rotation.y = ry; worldScene.add(g);
}
function banca(x, z, cor) {  // banca da zunga: mesa com mercadoria + guarda-sol às riscas + caixas
  const g = new T.Group(); g.name = 'banca';
  mesh(bx(1.9, .8, 1.1), mat('#7a5236', { roughness: .9 }), 0, .4, 0, g);
  mesh(bx(1.7, .25, .9), mat('#e8b923', { roughness: .8 }), 0, .93, 0, g, false);
  mesh(cyl(.04, .04, 2.3, 8), mat('#394048'), .6, 1.15, 0, g);
  mesh(new T.ConeGeometry(1.5, .65, 10), new T.MeshStandardMaterial({ map: (() => { const t = ctex(128, 128, x2 => { for (let i = 0; i < 8; i++) { x2.fillStyle = i % 2 ? cor : '#f2f2f2'; x2.fillRect(i * 16, 0, 16, 128); } }); t.wrapS = t.wrapT = T.RepeatWrapping; return t; })(), roughness: .8 }), .6, 2.45, 0, g);
  mesh(bx(.5, .5, .5), mat('#a34a2a', { roughness: .9 }), -1.3, .25, .4, g);
  mesh(bx(.5, .5, .5), mat('#c4865a', { roughness: .9 }), -1.3, .75, .4, g);
  g.position.set(x, 0, z); worldScene.add(g);
}
function mupi(x, z, txt, bg, fg, ry = 0) {  // painel publicitário das marcas do jogo
  const g = new T.Group(); g.name = 'mupi';
  mesh(cyl(.09, .09, 2.6, 8), mat('#2b2f36', { roughness: .6, metalness: .3 }), 0, 1.3, 0, g);
  const s = signPlane(txt, 3.2, bg, fg); s.material.side = T.DoubleSide; s.position.set(0, 2.7, 0); g.add(s);
  g.position.set(x, 0, z); g.rotation.y = ry; worldScene.add(g);
}
function caixote(x, z) {  // caixote do lixo municipal
  const g = new T.Group(); g.name = 'caixote';
  mesh(bx(1.6, 1, 1), mat('#2e7d32', { roughness: .85 }), 0, .55, 0, g);
  mesh(bx(1.66, .12, 1.06), mat('#256427', { roughness: .8 }), 0, 1.1, 0, g);
  g.position.set(x, 0, z); g.rotation.y = Math.random() * 3; worldScene.add(g);
}
function streetProps() {
  const h = ROAD_W / 2 + 2.4;   // passeio = 5..11,8 a contar do centro da estrada
  paragem(-90, 10 + h, Math.PI); paragem(30, 10 - h, 0); paragem(-h, -20, Math.PI / 2); paragem(h, 80, -Math.PI / 2);
  banca(-52, 22, '#d2122e'); banca(-8, 22, '#2e8b57'); banca(-30, 33, '#e8b923');
  mupi(-h, -64, 'DarkCell', '#ffcb00', '#151515', Math.PI / 2); mupi(h, 36, 'Banco Palanca', '#c8102e', '#ffffff', -Math.PI / 2);
  mupi(-90, 10 - h, 'Kalemba TV', '#1f63c9', '#ffffff', 0); mupi(90, 10 + h, 'Txova', '#2e8b57', '#ffffff', Math.PI);
  caixote(-52.6, -36); caixote(67.4, 12); caixote(-7.4, 70); caixote(28, -95.4); caixote(-112.6, 21.8);
}

/* =========================================================
   CONSTRUIR A CIDADE
   ========================================================= */
function buildWorld() {
  worldScene = new T.Scene();
  decor = new T.Group(); worldScene.add(decor);
  worldScene.background = new T.Color('#8ec9f0');
  worldScene.fog = new T.Fog('#bfe3f7', LITE ? 80 : GFX_HD ? 150 : 120, LITE ? 300 : GFX_HD ? 520 : 420);
  skyMesh = makeSky();
  hemi = new T.HemisphereLight('#d6ebff', '#8a5a3a', .65); worldScene.add(hemi);
  sun = new T.DirectionalLight('#fff1d6', 1.35); sun.castShadow = true;
  sun.shadow.mapSize.set(LITE ? 1024 : GFX_HD && !IS_MOBILE ? 4096 : IS_MOBILE ? 1024 : 2048, LITE ? 1024 : GFX_HD && !IS_MOBILE ? 4096 : IS_MOBILE ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 260 });
  sun.shadow.bias = -.0006; sun.shadow.normalBias = .02; sun.shadow.camera.updateProjectionMatrix(); worldScene.add(sun); worldScene.add(sun.target);
  lampMat = new T.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffd27a', emissiveIntensity: 0 });
  nightMats.push({ m: lampMat, day: 0, night: 2.2 });
  sideMat = new T.MeshStandardMaterial({ map: (() => { const t = ctex(128, 128, x => { x.fillStyle = '#b9b2a6'; x.fillRect(0, 0, 128, 128); for (let ty = 0; ty < 128; ty += 32) for (let tx = 0; tx < 128; tx += 32) { x.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.07)'; x.fillRect(tx, ty, 32, 32); } for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .08})`; x.fillRect(R(0, 127), R(0, 127), 2, 2); } x.strokeStyle = 'rgba(0,0,0,.16)'; x.lineWidth = 2; for (let i = 0; i <= 128; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); } }); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(60, 60); return t; })(), roughness: .95 });

  /* chão: terra vermelha + relva nos bairros nobres */
  const red = noiseTex('#c4865a', ['#8a5236', '#d9a070', '#6e4028', '#b97a4e'], [80, 80], 2200);
  groundPatch(-400, -100, 400, 400, null, 0, red);
  const grass = noiseTex('#6f9a3e', ['#5b8530', '#88b04f', '#4e7428'], [8, 8]);
  groundPatch(64, 64, 176, 106, null, .015, grass); groundPatch(-176, -84, -124, -44, null, .015, grass); groundPatch(-176, 114, -64, 150, null, .015, grass);
  const dirt = noiseTex('#a7704a', ['#7d5034', '#c48b5f', '#5e3a24'], [6, 6], 2600);
  groundPatch(-176, 64, -124, 106, null, .016, dirt);

  /* mar, baía e Ilha */
  seaGeo = new T.PlaneGeometry(1000, 420, 100, 40); seaGeo.rotateX(-Math.PI / 2); seaGeo.translate(0, -.6, -310);
  seaBase = seaGeo.attributes.position.array.slice();
  const sea = new T.Mesh(seaGeo, new T.MeshStandardMaterial({ color: '#137cb0', roughness: .18, metalness: .25, transparent: true, opacity: .94, flatShading: true }));
  sea.receiveShadow = true; worldScene.add(sea);
  const sandT = noiseTex('#ecd7a4', ['#d9c08a', '#f7e9c4', '#cdb27a'], [20, 3]);
  groundPatch(-176, -144, -14, -112, null, .02, sandT); // Ilha
  road(-176, -118, -14, -118);
  // ponte
  mesh(bx(9, .5, 18), mat('#9a958c'), -150, .0, -107, decor); [-1, 1].forEach(s => mesh(bx(.3, 1.1, 18), mat('#e8e2d4'), -150 + s * 4.4, .7, -107, decor));
  addCol(-154.6, -107, .4, 18); addCol(-145.4, -107, .4, 18);
  // Marginal: calçadão
  const tiles = ctex(128, 128, x => { x.fillStyle = '#e9e1cf'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#2b2b2b'; for (let i = 0; i < 128; i += 32) { x.beginPath(); x.moveTo(0, i + 16); for (let k = 0; k <= 128; k += 8) x.lineTo(k, i + 16 + Math.sin(k / 10) * 7); x.lineTo(128, i + 20); for (let k = 128; k >= 0; k -= 8) x.lineTo(k, i + 20 + Math.sin(k / 10) * 7); x.fill(); } });
  tiles.wrapS = tiles.wrapT = T.RepeatWrapping; tiles.repeat.set(60, 2);
  groundPatch(-178, -100, 178, -93, null, .035, tiles);
  mesh(bx(323, .6, .6), mat('#d9d2c0'), 16.5, .3, -100.2, decor, false); mesh(bx(23, .6, .6), mat('#d9d2c0'), -166.5, .3, -100.2, decor, false); addCol(16.5, -100.4, 323, .3); addCol(-166.5, -100.4, 23, .3);
  for (let x = -170; x <= 170; x += 12) if (Math.abs(x + 150) > 6) palm(x, -97, .95 + Math.random() * .2);
  for (let x = -164; x <= 164; x += 24) lamp(x, -94.2, 0);
  // bandeira de Angola
  mesh(cyl(.1, .12, 14, 8), mat('#ddd', { metalness: .6 }), 0, 7, -97); addCol(0, -97, .4, .4);
  const flagTex = ctex(300, 200, (x) => {
    x.fillStyle = '#cc092f'; x.fillRect(0, 0, 300, 100); x.fillStyle = '#000'; x.fillRect(0, 100, 300, 100);
    x.strokeStyle = '#ffcb00'; x.fillStyle = '#ffcb00'; x.lineWidth = 12;
    x.beginPath(); x.arc(150, 100, 42, Math.PI * .75, Math.PI * 2.05); x.stroke();
    for (let i = 0; i < 9; i++) { const a = Math.PI * .8 + i * .16; x.fillRect(150 + Math.cos(a) * 50 - 5, 100 + Math.sin(a) * 50 - 5, 10, 10); }
    x.save(); x.translate(150, 100); x.rotate(-.7); x.fillRect(-48, -6, 80, 12); x.fillRect(30, -10, 22, 20); x.restore();
    x.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? 7 : 16, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(128 + Math.cos(a) * rr, 72 + Math.sin(a) * rr); } x.closePath(); x.fill();
  });
  flagGeo = new T.PlaneGeometry(5, 3.3, 18, 8); flagGeo.translate(2.5, 0, 0); flagBase = flagGeo.attributes.position.array.slice();
  const flag = new T.Mesh(flagGeo, new T.MeshStandardMaterial({ map: flagTex, side: T.DoubleSide, roughness: .8 })); flag.position.set(.1, 12.2, -97); flag.castShadow = true; worldScene.add(flag);

  /* ruas */
  road(-178, -88, 178, -88);
  CITY_ZS.slice(1).forEach(z => road(-178, z, 178, z));
  CITY_XS.forEach(x => road(x, -88, x, 148));
  curbs(); CITY_XS.forEach(x => CITY_ZS.forEach(z => crosswalk(x, z)));
  const offRoad = x => !CITY_XS.some(a => Math.abs(a - x) < 9) && !Object.values(LOC_POS).some(L => Math.abs(L.x - x) < 6);
  CITY_ZS.forEach((z, i) => { for (let x = -170; x <= 170; x += 20) { if (i && offRoad(x)) lamp(x, z - ROAD_W / 2 - 1.2, 0); if (offRoad(x + 10)) lamp(x + 10, z + ROAD_W / 2 + 1.2, Math.PI); } });
  CITY_XS.forEach(x => { for (let z = -76; z <= 144; z += 16) { if (CITY_ZS.some(a => Math.abs(a - z) < 8)) continue; treeA(x - ROAD_W / 2 - 1.8, z, .8); treeA(x + ROAD_W / 2 + 1.8, z + 8, .8); } });
  streetProps();

  /* ===== ILHA ===== */
  for (let i = 0; i < 12; i++) {
    const x = -168 + i * 13 + R(-2, 2), z = -137 + R(-1, 2); if (Math.abs(x + 100) < 7) continue;
    mesh(cyl(.05, .05, 2.6, 6), mat('#eee'), x, 1.3, z, decor);
    mesh(new T.ConeGeometry(1.7, .7, 10), mat(pick(['#d2122e', '#ffcb00', '#1f63c9', '#ff7a1a', '#f2f2f2'])), x, 2.7, z, decor);
    if (i % 3 === 0) { const c = mesh(new T.CylinderGeometry(.6, .6, 5, 10, 1, false, 0, Math.PI), mat(pick(['#a3482a', '#2a6aa3', '#e8b923', '#2e8b57'])), x + 5, .4, -142.5, decor); c.rotation.set(0, 0, Math.PI / 2); c.rotateX(Math.PI); c.scale.set(1, 1, .7); }
  }
  for (let x = -164; x <= -24; x += 18) if (Math.abs(x + 55) > 13) palm(x, -126.8, .9);
  // discoteca
  bldg(-55, -131.2, 22, 10, 9, { face: '#1a1424', glass: '#4a1a5a', kind: 'glass', noTop: true });
  [['#ff2fa0', 0], ['#39e6d0', 1], ['#ffcb00', 2]].forEach(([c, i]) => { const n = new T.Mesh(bx(22.4, .2, .2), new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.8 })); n.position.set(-55, 8.6 - i * .5, -126); worldScene.add(n); });
  sign('DISCOTECA KIZOMBA', 13, '#1a0a1f', '#ff2fa0', 'KUDURO · SEMBA · AFRO HOUSE', -55, 5.4, -125.95);
  // bares de praia
  [[-140, '#e8b923', 'BAR DA ILHA'], [-120, '#2e8b57', 'MARISQUEIRA'], [-85, '#1f63c9', 'CHILL OUT'], [-30, '#d2122e', 'RESTAURANTE']].forEach(([x, c, t]) => {
    mesh(bx(8, 3.2, 6), mat('#e9dcc0'), x, 1.6, -129, decor); addCol(x, -129, 8, 6);
    const r = mesh(new T.ConeGeometry(6.2, 2.4, 4), mat('#c9a35a', { roughness: 1 }), x, 4.4, -129, decor); r.rotation.y = Math.PI / 4;
    sign(t, 6, c, '#fff', '', x, 2.6, -125.94);
  });

  /* ===== BAIXA / MARGINAL (linha 1) ===== */
  // Miramar — mansões (elite)
  // Miradouro (as mansões do Miramar estão agora no Centro Habitacional)
  palm(-136, -44, 1); palm(-166, -44, 1);
  // Assembleia / prédios governamentais
  bldg(-90, -66, 30, 18, 18, { face: '#efe9dc', glass: '#3a4f66', base: '#cfc6b0' });
  mesh(new T.SphereGeometry(6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#d9c9a0', { metalness: .3 }), -90, 18, -66, decor);
  bldg(-90, -51.5, 30, 3, 6, { face: '#efe9dc', noTop: true }); sign('ASSEMBLEIA NACIONAL', 14, '#efe9dc', '#7a1a1a', '', -90, 4.6, -49.85);
  // Torre Empresarial (o teu império)
  torreEmpresarial();
  bldg(-44, -72, 10, 12, 30, { face: '#c9c4b8', glass: '#2a3d52' }); bldg(-14, -72, 9, 12, 26, { face: '#e0d6c2', glass: '#2a3d52', kind: 'res' });
  // Banco
  bancoKwanza();
  bldg(50, -72, 10, 14, 38, { face: '#8fa3b8', glass: '#2a3d52' }); bldg(10, -74, 8, 12, 22, { face: '#d9d2c0', glass: '#34495e', kind: 'res' });
  // torres (Mulemba Petróleos, hotel)
  bldg(80, -66, 18, 18, 78, { face: '#1f2a33', glass: '#7ab8d8', kind: 'glass' }); bldg(102, -64, 14, 22, 52, { face: '#e8e2d4', glass: '#2a3d52' });
  sign('MULEMBA', 10, '#111', '#ffcb00', '', 80, 6, -56.8);
  // Porto
  const cc = ['#c8102e', '#1f63c9', '#2e8b57', '#e8b923', '#ff7a1a', '#7a7a7a'];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < R(1, 3); k++) { mesh(bx(6, 2.5, 2.4), mat(pick(cc), { roughness: .6 }), 134 + i * 7, 1.25 + k * 2.5, -76 + j * 3.2, decor); }
  addCol(150, -71, 36, 14);
  [[140, -56], [160, -56]].forEach(([x, z]) => { mesh(bx(1, 22, 1), mat('#e8b923'), x, 11, z, decor); mesh(bx(1, 1, 18), mat('#e8b923'), x, 22, z - 6, decor); mesh(bx(1.6, 1.6, 2), mat('#c8102e'), x, 21, z + 2, decor); addCol(x, z, 1.4, 1.4); });

  /* ===== MUTAMBA (linha 2) ===== */
  mausoleu(-150, -14); sign('MAUSOLÉU AGOSTINHO NETO', 12, '#3a3a3a', '#ffcb00', '', -150, 2.2, -26.6, Math.PI);
  bldg(-98, -18, 16, 16, 28, { face: '#8fa3b8', glass: '#2a3d52' }); bldg(-78, -12, 12, 22, 16, { face: '#e0d6c2', glass: '#34495e', kind: 'res' });
  // Centro de Emprego
  bldg(-30, -16, 28, 18, 18, { face: '#d9c9a8', glass: '#34495e' });
  sign('CENTRO DE EMPREGO', 13, '#0d2a4a', '#fff', 'VAGAS · ENTREVISTAS · FORMAÇÃO', -30, 5.6, -25.6, Math.PI);
  for (let i = 0; i < 15; i++) { if (Math.abs(i - 7) < 4) continue; mesh(bx(.35, 12.6, 1.3), mat(['#ff7a1a', '#ffa12e', '#ffcb00'][i % 3], { roughness: .6 }), -43 + i * 1.857, 11, -25.75, decor); }
  canopy(-30, -27, 11, 3.2, 3.7, '#0d2a4a', '#ffcb00', Math.PI);
  // Universidade
  bldg(30, -14, 34, 18, 12, { face: '#e0b860', glass: '#2a3d52', roof: '#7a3a2a' });
  for (let i = 0; i < 9; i++) mesh(cyl(.45, .5, 8, 10), mat('#f4efe2'), 15 + i * 3.7, 4, -25.6, decor);
  mesh(bx(36, .9, 2.4), mat('#f4efe2'), 30, 8.4, -25.6, decor); addCol(30, -25.6, 34, 1);
  sign('UNIVERSIDADE PÚBLICA DE LUANDA', 18, '#7a1a1a', '#ffcb00', 'ESCOLA · UNIVERSIDADE · CURSOS', 30, 9.9, -26.86, Math.PI);
  mesh(bx(5, 8, 5), mat('#e0b860'), 30, 16, -16, decor); mesh(bx(5.6, .5, 5.6), mat('#f4efe2'), 30, 20.2, -16, decor);
  { const p = new T.Mesh(new T.ConeGeometry(3.8, 4, 4), mat('#7a3a2a')); p.position.set(30, 22.4, -16); p.rotation.y = Math.PI / 4; p.castShadow = true; decor.add(p); }
  { const ck = ctex(128, 128, x => { x.fillStyle = '#f7f3ea'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 6; x.stroke(); x.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillRect(64 + Math.cos(a) * 48 - 3, 64 + Math.sin(a) * 48 - 3, 6, 6); } x.lineWidth = 6; x.beginPath(); x.moveTo(64, 64); x.lineTo(64, 26); x.moveTo(64, 64); x.lineTo(92, 64); x.stroke(); });
    const c = new T.Mesh(new T.CircleGeometry(1.6, 24), new T.MeshStandardMaterial({ map: ck, emissive: '#fff', emissiveMap: ck, emissiveIntensity: .2 })); c.position.set(30, 17, -18.52); c.rotation.y = Math.PI; worldScene.add(c); }
  mesh(bx(36, .3, 2), mat('#e9e4d8'), 30, .15, -27.2, decor); mesh(bx(36, .3, 1.2), mat('#e9e4d8'), 30, .3, -26.6, decor);
  // Clínica
  bldg(90, -16, 28, 18, 12, { face: '#f4f4f0', glass: '#7ab0d6' });
  [[3, .9], [.9, 3]].forEach(([w, h]) => { const c = new T.Mesh(bx(w, h, .2), new T.MeshStandardMaterial({ color: '#e8102e', emissive: '#e8102e', emissiveIntensity: .6 })); c.position.set(90, 10, -25.25); worldScene.add(c); });
  sign('CLÍNICA BEM-ESTAR', 12, '#fff', '#c8102e', 'URGÊNCIAS 24H', 90, 5.4, -25.4, Math.PI);
  canopy(90, -27, 10, 3.2, 3.7, '#ffffff', '#c8102e', Math.PI);
  [-1, 1].forEach(s => mesh(bx(1.2, 8, .3), nightBand('#7cc4b0', .2, 1.2), 90 + s * 11, 8, -25.2, decor, false));
  mesh(bx(4, .1, 6), mat('#c8102e'), 100, .08, -28, decor);
  bldg(150, -16, 20, 22, 40, { face: '#f2ede2', glass: '#2a4a66', kind: 'res' }); sign('HOTEL PRESIDENTE', 12, '#7a1a1a', '#fff', '', 150, 6, -27.36, Math.PI);

  /* ===== RANGEL / TALATONA (linha 3) ===== */
  // Kilamba
  const kc = ['#e8c547', '#d9534f', '#5bc0de', '#8bc34a', '#f0a04b', '#b48bd6'];
  /* Imobiliária do Centro Habitacional (virada para a avenida das casas) */
  bldg(-90, 36, 28, 16, 14, { face: '#f4f1ea', glass: '#1f4e6e', kind: 'office', noTop: true, noShops: true });
  ZONAS_CASA.forEach((Z, i) => mesh(bx(4.6, 1.3, .2), mat(Z.cor, { roughness: .5 }), -101.5 + i * 4.6, 12.6, 44.25, decor, false));
  sign('IMOBILIÁRIA', 12, '#0d2a4a', '#ffcb00', 'CENTRO HABITACIONAL', -90, 6.4, 44.35, 0);
  canopy(-90, 45.6, 12, 3.2, 3.7, '#0d2a4a', '#ffcb00', 0);
  mesh(bx(5, 3.2, 4), mat('#ffcb00'), -90, 16, 36, decor);
  { const rf = mesh(new T.ConeGeometry(4.1, 2.6, 4), mat('#c8102e'), -90, 18.9, 36, decor); rf.rotation.y = Math.PI / 4; }
  mesh(bx(1.1, 1.6, .2), mat('#4a2e1a'), -90, 15.2, 38.05, decor, false);
  // praça de entrada do Centro Habitacional
  [-160, -140].forEach(x => { mesh(bx(.7, 8, .7), mat('#3a3a3a', { metalness: .5 }), x, 4, 48, decor); addCol(x, 48, .8, .8); });
  sign('CENTRO HABITACIONAL', 22, '#c8102e', '#ffffff', 'DO MUSSEQUE À MANSÃO · TODAS AS CASAS AQUI', -150, 7.4, 48.45, 0);
  treeA(-166, 30); treeA(-134, 30); baobab(-171, 22, .9); palm(-170, 46, .9); palm(-130, 46, .9);
  for (let i = 0; i < 6; i++) mesh(bx(3, .45, 1), mat('#8a5a3a'), -162 + i * 4.8, .45, 38, decor);
  // Mercado do Roque Santeiro
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
    const x = -48 + i * 7, z = 24 + j * 7.5;
    const g = new T.Group(); g.position.set(x, 0, z); decor.add(g);
    [[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]].forEach(([a, b]) => mesh(cyl(.06, .06, 2.6, 5), mat('#7a5a3a'), a, 1.3, b, g));
    const tarp = mesh(bx(3.8, .06, 3), mat(pick(['#d2122e', '#1f63c9', '#ffcb00', '#2e8b57', '#ff7a1a'])), 0, 2.65, 0, g); tarp.rotation.x = .1;
    mesh(bx(3, .9, 1.6), mat('#8a6a48'), 0, .45, 0, g);
    for (let k = 0; k < 6; k++) mesh(sph(.17, 6, 5), mat(pick(['#ffd21f', '#e8461f', '#7cbf3a', '#f29a1f', '#a3482a'])), -1.1 + k * .45, 1.05, R(-4, 4) / 10, g, false);
    addCol(x, z, 3.2, 1.8);
  }
  mesh(cyl(.12, .12, 6.4, 6), mat('#555'), -36, 3.2, 21.6, decor); mesh(cyl(.12, .12, 6.4, 6), mat('#555'), -24, 3.2, 21.6, decor);
  sign('MERCADO DO ROQUE', 12, '#ffcb00', '#111', 'TUDO SE VENDE · TUDO SE COMPRA', -30, 5.6, 21.55, Math.PI);
  // Igreja
  bldg(30, 32, 14, 20, 12, { face: '#f6f3ea', glass: '#5a7aa8', noTop: true, roof: '#8a3a2a' });
  mesh(bx(5, 22, 5), mat('#f6f3ea'), 30, 11, 21, decor); addCol(30, 21, 5, 5, 22);
  mesh(new T.ConeGeometry(3.6, 6, 4), mat('#8a3a2a'), 30, 25, 21, decor).rotation.y = Math.PI / 4;
  mesh(bx(.35, 3, .35), mat('#ffcb00', { metalness: .6 }), 30, 29.4, 21, decor); mesh(bx(1.8, .35, .35), mat('#ffcb00', { metalness: .6 }), 30, 29.8, 21, decor);
  treeA(16, 26); treeA(44, 26); treeA(16, 44); treeA(44, 44);
  { const rt = ctex(256, 256, x => { x.fillStyle = '#111'; x.fillRect(0, 0, 256, 256); const cs = ['#c8102e', '#1f63c9', '#ffcb00', '#2e8b57', '#7a3a8a']; for (let r = 5; r > 0; r--) for (let k = 0; k < 16; k++) { x.fillStyle = cs[(k + r) % 5]; x.beginPath(); x.moveTo(128, 128); x.arc(128, 128, r * 24, k * Math.PI / 8 + .03, (k + 1) * Math.PI / 8 - .03); x.fill(); } });
    const rm = new T.MeshStandardMaterial({ map: rt, emissive: '#fff', emissiveMap: rt, emissiveIntensity: .1 }); nightMats.push({ m: rm, day: .1, night: 1.2 });
    const ro = new T.Mesh(new T.CircleGeometry(1.7, 28), rm); ro.position.set(30, 15, 18.45); ro.rotation.y = Math.PI; worldScene.add(ro);
    mesh(new T.TorusGeometry(1.75, .15, 6, 28), mat('#e8e2d4'), 30, 15, 18.45, decor); }
  // Ginásio & Estádio
  bldg(76, 28, 14, 14, 8, { face: '#e8e2d4', glass: '#2a3d52', noTop: true });
  sign('GINÁSIO', 8, '#111', '#ffcb00', 'MUSCULAÇÃO · BOXE', 76, 5, 20.85, Math.PI);
  { const st = new T.Mesh(new T.CylinderGeometry(15, 17, 9, 32, 1, true), mat('#d9d2c0', { side: T.DoubleSide })); st.position.set(98, 4.5, 38); st.scale.z = .75; st.castShadow = true; worldScene.add(st); addCol(98, 38, 30, 24);
    const pitch = new T.Mesh(new T.CircleGeometry(14, 32), mat('#3f8a2c')); pitch.rotation.x = -Math.PI / 2; pitch.scale.y = .72; pitch.position.set(98, 9.2, 38); worldScene.add(pitch);
    sign('ESTÁDIO 11 DE NOVEMBRO', 12, '#c8102e', '#ffcb00', '', 98, 7, 24.9, Math.PI); }
  // Kianda Mall
  bldg(150, 36, 40, 26, 12, { face: '#f2ede2', glass: '#2a4a66', kind: 'glass', noTop: true });
  sign('KIANDA MALL', 16, '#111', '#ffcb00', 'MODA · TECNOLOGIA · STAND AUTOMÓVEL', 150, 9.2, 22.8, Math.PI);
  for (let i = 0; i < 18; i++) { const x = 132 + i * 2.1, y = 5.6 + Math.sin(i * .55) * .5; mesh(bx(2.15, .28, 4.2), mat('#f7f7f7', { roughness: .35 }), x, y, 20.9, decor, false); }
  [134, 144, 156, 166].forEach(x => mesh(cyl(.14, .14, 5.4, 8), mat('#d9d9d9', { metalness: .7 }), x, 2.7, 19.2, decor));
  for (let i = 0; i < 9; i++) { if (Math.abs(i - 4) < 2) continue; mesh(bx(.25, 10, .25), nightBand(['#ff2fa0', '#39e6d0', '#ffcb00'][i % 3], .3, 1.8), 131.5 + i * 4.6, 7, 22.85, decor, false); }
  palm(130, 19, 1); palm(170, 19, 1);

  /* ===== CENTRO HABITACIONAL (linha 4) — do bairro pobre (oeste) ao bairro rico (este) =====
     Cada quarteirão: chão próprio, ruelas em grelha, lotes alinhados, árvores e candeeiros.
     Colunas dos lotes: cx-15.5 · cx · cx+15.5 | ruelas em cx±7.75 | ruela transversal z≈85 */
  const HZ0 = 68, HZ1 = 102;
  const lane = (x0, z0, x1, z1, col) => mesh(bx(x1 - x0, .04, z1 - z0), mat(col, { roughness: .95 }), (x0 + x1) / 2, .02, (z0 + z1) / 2, decor, false);
  const lanes = (cx, col, zc = 85, zw = 7) => { [-7.75, 7.75].forEach(o => lane(cx + o - 2.25, HZ0, cx + o + 2.25, HZ1, col)); lane(cx - 22, zc - zw / 2, cx + 22, zc + zw / 2, col); };
  const hedge = (x, z, w, d, h = .9) => { mesh(bx(w, h, d), mat('#3f7d2c', { roughness: .95 }), x, h / 2, z, decor); addCol(x, z, w, d); };
  const bench = (x, z, ry = 0) => { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; decor.add(g); mesh(bx(1.8, .12, .5), mat('#8a5a3a'), 0, .5, 0, g); mesh(bx(1.8, .45, .1), mat('#8a5a3a'), 0, .8, -.22, g); [-.75, .75].forEach(o => mesh(bx(.1, .5, .45), mat('#444'), o, .25, 0, g)); };
  const zMon = (zid, x, z = 69.4) => { // placa-monumento do bairro (muro baixo pintado)
    const Z = zonaCasa(zid);
    mesh(bx(7.4, 1.6, .6), mat('#efe9dc'), x, .8, z, decor); addCol(x, z, 7.4, .6);
    mesh(bx(7.8, .2, .8), mat(shade(Z.cor, .8)), x, 1.7, z, decor);
    [-4.3, 4.3].forEach(o => { mesh(bx(1, .45, .8), mat('#b5793f'), x + o, .22, z, decor); mesh(sph(.42, 8, 6), mat(pick(['#e0457b', '#ffcb00', '#ff7a1a'])), x + o, .6, z, decor); });
    sign(Z.t.toUpperCase(), 6.8, Z.cor, '#ffffff', Z.nivel.toUpperCase(), x, .85, z - .32, Math.PI);
  };
  const flat = (x0, z0, x1, z1, base, spots, rep) => groundPatch(x0, z0, x1, z1, null, .02, noiseTex(base, spots, rep, 900));
  // 1 · Musseque — bairro pobre (barracas alinhadas, ruelas de terra batida)
  { const cx = -150;
    flat(cx - 22, HZ0, cx + 22, HZ1, '#b07a50', ['#8a5a3a', '#c48b5f', '#7a4e30'], [4, 3]);
    lanes(cx, '#94603e', 87, 4.5);
    const cols = ['#c96f4a', '#d9b38c', '#8fa3b8', '#e0d4b0', '#a35c3c', '#b5c99a', '#d98c6a', '#e8d27a'];
    let k = 0;
    [-18.5, -13.5, 0, 13.5, 18.5].forEach(ox => [75, 81, 93, 99].forEach(z => {
      if (ox === 0 && z === 75) { shack(cx, 75, Math.PI, '#e8d27a'); return; }
      shack(cx + ox, z, Math.PI + (k % 3 - 1) * .04, cols[k++ % cols.length]);
    }));
    const zinc = mat('#8d9499', { metalness: .5, roughness: .5 });
    [[-16, 72.2, 8.6], [16, 72.2, 8.6], [-16, 90.2, 8.6], [16, 90.2, 8.6]].forEach(([ox, z, w]) => { mesh(bx(w, 1.3, .08), zinc, cx + ox, .65, z, decor); addCol(cx + ox, z, w, .2); });
    [[-3.6, 78], [3.6, 96], [-3.6, 96]].forEach(([ox, z]) => mesh(cyl(.45, .45, 1.1, 10), mat('#1f63c9'), cx + ox, .55, z, decor));
    { const g = new T.Group(); g.position.set(cx + 3.4, 0, 78); decor.add(g); [-1.2, 1.2].forEach(o => mesh(cyl(.04, .04, 1.9, 5), mat('#6b4a2e'), 0, .95, o, g)); mesh(bx(.02, .02, 2.4), mat('#ddd'), 0, 1.85, 0, g, false); [['#c8102e', -.7], ['#ffcb00', 0], ['#1f63c9', .7]].forEach(([c, o]) => mesh(bx(.04, .55, .5), mat(c), 0, 1.55, o, g, false)); }
    baobab(cx + 19.5, 87, .6); treeA(cx - 19.5, 87, .7);
    zMon('musseque', cx - 16.5);
  }
  // 2 · Zango — cidade barata (prédios sociais em grelha, pátio com árvores)
  { const cx = -90;
    flat(cx - 22, HZ0, cx + 22, HZ1, '#d2c7b0', ['#bfb39a', '#e0d6c2', '#a99d86'], [4, 3]);
    lanes(cx, '#bdb6a8');
    const fc = ['#efe4cc', '#f2d9c4', '#d9e6ee', '#e6efd9', '#f4f1ea', '#eadcf0'];
    [[-15.5, 77], [0, 77], [15.5, 77], [-15.5, 94], [0, 94], [15.5, 94]].forEach(([ox, z], i) => bldg(cx + ox, z, 11, 9, i === 1 ? 11 : 10, { face: fc[i], glass: '#3b5a7a', kind: 'kil', noShops: true, base: '#bdb4a2' }));
    [-15.5, 0, 15.5].forEach(ox => { treeA(cx + ox - 3.5, 85, .7); treeA(cx + ox + 3.5, 85, .7); bench(cx + ox, 83.4, 0); });
    lamp(cx - 7.75, 82.4, 0); lamp(cx + 7.75, 82.4, 0);
    zMon('zango', cx - 16.5);
  }
  // 3 · Bairro Popular — casas de blocos com muro, ruelas calcetadas
  { const cx = -30;
    flat(cx - 22, HZ0, cx + 22, HZ1, '#c9a27a', ['#b08a62', '#d9b48c', '#9c7550'], [4, 3]);
    lanes(cx, '#cfc6b4', 85, 8);
    const hc = ['#f0d9a8', '#e8b9a0', '#cfe0c3', '#f4f1ea', '#d9c9e8', '#f2c48a'];
    [[-15.5, 76], [0, 76], [15.5, 76], [-15.5, 94], [0, 94], [15.5, 94]].forEach(([ox, z], i) => blockHouse(cx + ox, z, hc[i]));
    [-15.5, 15.5].forEach(ox => treeA(cx + ox, 85, .8)); treeA(cx - 20.5, 85, .7); treeA(cx + 20.5, 85, .7);
    lamp(cx - 7.75, 82, 0); lamp(cx + 7.75, 82, 0);
    zMon('bairro', cx - 16.5);
  }
  // 4 · Kilamba — cidade média (torres coloridas em relvado, parque infantil)
  { const cx = 30;
    flat(cx - 22, HZ0, cx + 22, HZ1, '#6f9a3e', ['#5b8530', '#88b04f', '#4e7428'], [4, 3]);
    lanes(cx, '#e6dfd0');
    [[-16, 78, 20], [0, 78, 22], [16, 78, 18], [-16, 95, 24], [16, 95, 16]].forEach(([ox, z, h], i) => bldg(cx + ox, z, 12, 11, h, { face: kc[(i + 2) % kc.length], glass: '#3b5a7a', kind: 'kil', base: shade(kc[(i + 2) % kc.length], .7) }));
    // parque infantil (traseiras do centro)
    mesh(bx(9, .05, 8), mat('#c8553d', { roughness: .9 }), cx, .03, 95, decor, false);
    { const sw = mat('#ffcb00', { metalness: .3 }); [-1.5, 1.5].forEach(o => mesh(cyl(.06, .06, 2.4, 6), sw, cx - 2 + o, 1.2, 94, decor)); mesh(cyl(.06, .06, 3.2, 6), sw, cx - 2, 2.4, 94, decor).rotation.z = Math.PI / 2; mesh(bx(.6, .06, .3), mat('#1f63c9'), cx - 2, .6, 94, decor); }
    { const sl = mesh(bx(.9, .08, 3.4), mat('#c8102e'), cx + 2.2, 1, 95, decor); sl.rotation.x = .5; mesh(bx(.9, 1.6, .9), mat('#1f63c9'), cx + 2.2, .8, 93.4, decor); }
    bench(cx - 3, 99.5, Math.PI); bench(cx + 3, 99.5, Math.PI);
    [-15.5, 15.5].forEach(ox => treeA(cx + ox, 86.5, .8)); treeA(cx - 4.6, 90.2, .7); treeA(cx + 4.6, 90.2, .7);
    lamp(cx - 7.75, 87, 0); lamp(cx + 7.75, 87, 0);
    zMon('kilamba', cx - 16.5);
  }
  // 5 · Talatona — cidade cara (condomínio de vivendas, guarita e jardim)
  { const cx = 90;
    flat(cx - 22, HZ0, cx + 22, HZ1, '#6f9a3e', ['#5b8530', '#88b04f', '#4e7428'], [4, 3]);
    lane(cx - 2.5, HZ0, cx + 2.5, 70, '#e6dfd0'); lane(cx - 22, 84.4, cx + 22, 87.2, '#e6dfd0');
    villa(cx, 77, '#f4f1ea', .9, true); villa(cx - 11, 94.4, '#efe6d6', .85, true); villa(cx + 11, 94.4, '#f7f2e8', .85, true);
    // guarita
    mesh(bx(3, 2.6, 3), mat('#f4f1ea'), cx + 15, 1.3, 75, decor); addCol(cx + 15, 75, 3, 3); mesh(bx(3.6, .25, 3.6), mat('#2a4a66'), cx + 15, 2.75, 75, decor);
    mesh(bx(2, .9, .06), mat('#1a2633'), cx + 15, 1.7, 73.47, decor, false);
    mesh(bx(4, .1, .1), mat('#c8102e'), cx + 15, 1, 72.4, decor, false);
    hedge(cx + 15, 70.5, 12, .7); hedge(cx - 15, 79.5, 12, .7, .7);
    palm(cx + 19.5, 80, .8); palm(cx - 19.5, 74, .8); palm(cx - 11, 74, .7);
    bench(cx - 15, 77, Math.PI);
    lamp(cx - 9.5, 85.8, 0); lamp(cx + 9.5, 85.8, 0);
    zMon('talatona', cx - 16.5);
  }
  // 6 · Miramar — bairro rico (mansão com piscina, palmeiras alinhadas, sebes)
  { const cx = 150;
    flat(cx - 22, HZ0, cx + 22, HZ1, '#6f9a3e', ['#5b8530', '#88b04f', '#4e7428'], [4, 3]);
    lane(cx - 2.5, HZ0, cx + 2.5, 70, '#e6dfd0');
    villa(cx, 81, '#f7f4ee', true, true);
    [74, 83, 92, 100].forEach(z => { palm(cx - 17.5, z, .9); palm(cx + 17.5, z, .9); });
    hedge(cx, 98.5, 26, .8, 1.1);
    { mesh(cyl(1.6, 1.8, .6, 16), mat('#e8e2d4'), cx, .3, 95.3, decor); addCol(cx, 95.3, 3.4, 3.4); const w = new T.Mesh(new T.CircleGeometry(1.4, 16), new T.MeshStandardMaterial({ color: '#2ab0d8', roughness: .1, emissive: '#0a4a66', emissiveIntensity: .2 })); w.rotation.x = -Math.PI / 2; w.position.set(cx, .62, 95.3); worldScene.add(w); mesh(cyl(.15, .2, 1.4, 8), mat('#e8e2d4'), cx, 1, 95.3, decor); }
    lamp(cx - 21, 86, Math.PI / 2); lamp(cx + 21, 86, -Math.PI / 2);
    zMon('miramar', cx - 17);
  }

  /* ===== VIANA (linha 5) ===== */
  // Terrenos & Obras (estaleiro)
  wallRect(-104, 120, -76, 140, 2, mat('#c9c4b8'), 6, true);
  bldg(-98, 130, 8, 6, 6, { face: '#e8b923', glass: '#2a3d52', noTop: true }); sign('TERRENOS & OBRAS', 9, '#e8b923', '#111', 'CONSTRÓI O TEU IMPÉRIO', -90, 3.2, 119.7, Math.PI);
  { const cr = new T.Group(); cr.position.set(-82, 0, 132); decor.add(cr); mesh(bx(1, 26, 1), mat('#e8b923'), 0, 13, 0, cr); mesh(bx(16, .9, .9), mat('#e8b923'), 4, 26, 0, cr); mesh(bx(2, 2, 2), mat('#555'), -3, 25, 0, cr); addCol(-82, 132, 1.4, 1.4); }
  mesh(bx(9, 9, 9), mat('#9a9690'), -86, 4.5, 134, decor); addCol(-86, 134, 9, 9);
  for (let i = 0; i < 4; i++) mesh(bx(1.4, .6, 3), mat('#c96f4a'), -100 + i * 2, .3, 137, decor);
  // zona verde
  baobab(-168, 152, 1.2); baobab(-136, 140, 1); baobab(-150, 142, .8); treeA(-120, 126); treeA(-170, 140);
  // zona industrial
  [[-30, 130], [30, 130]].forEach(([x, z], i) => { bldg(x, z, 30, 18, 9, { face: ['#b8b4aa', '#9aa3ad'][i], glass: '#3a4a5a', noTop: true, kind: 'office' }); mesh(cyl(1, 1.3, 18, 10), mat('#8a8580'), x + 10, 18, z + 4, decor); });
  sign('ZONA ECONÓMICA ESPECIAL', 14, '#1a3a5a', '#fff', 'FÁBRICAS · ARMAZÉNS', -30, 5, 120.8, Math.PI);
  // Cadeia de Viana
  const wallM = mat('#8f8f8a');
  [[90, 121, 34, 1], [90, 147, 34, 1], [73, 134, 1, 26], [107, 134, 1, 26]].forEach(([x, z, w, d]) => { mesh(bx(w, 5, d), wallM, x, 2.5, z, decor); addCol(x, z, w, d); });
  [[73, 121], [107, 121], [73, 147], [107, 147]].forEach(([x, z]) => { mesh(bx(2.4, 8, 2.4), mat('#777'), x, 4, z, decor); mesh(bx(3, .4, 3), mat('#555'), x, 8.2, z, decor); });
  bldg(90, 143, 20, 4, 7, { face: '#9a9a94', glass: '#222', nocol: true, noTop: true }); addCol(90, 143, 20, 4);
  mesh(bx(4, 4.2, .2), mat('#3a3a3a', { metalness: .6 }), 90, 2.1, 120.4, decor);
  sign('CADEIA DE VIANA', 10, '#222', '#ddd', '', 90, 5.8, 120.35, Math.PI);
  bldg(150, 132, 30, 20, 10, { face: '#c9c0aa', glass: '#3a4a5a', noTop: true }); sign('FÁBRICA DE CERVEJA', 12, '#c8102e', '#fff', '', 150, 6, 121.9, Math.PI);

  // skyline ao longe (desligado no Modo Leve)
  if (!LITE) for (let i = 0; i < (GFX_HD ? 40 : 26); i++) { const x = -240 + i * (GFX_HD ? 12.5 : 19), z = 330 + R(0, 40); bldg(x, z, R(10, 16), R(10, 16), R(18, 60), { face: pick(['#c9c4b8', '#8fa3b8', '#d9d2c0', '#6f8aa3']), glass: '#2a3d52', nocol: true, noTop: true }); }
  if (!LITE) for (let i = 0; i < (GFX_HD ? 16 : 10); i++) { bldg(220 + R(0, 30), -60 + i * 22, 14, 14, R(14, 40), { face: pick(['#c9c4b8', '#d9d2c0']), nocol: true, noTop: true }); bldg(-220 - R(0, 30), -60 + i * 22, 14, 14, R(14, 40), { face: pick(['#c9c4b8', '#d9d2c0', '#e0d6c2']), nocol: true, noTop: true }); }

  // juntar geometria estática
  worldScene.remove(decor); worldScene.add(mergeStatic(decor)); decor = null;

  /* ----- marcadores de entrada: tapete com seta no chão (aponta para a porta) + nome que só aparece a meia distância ----- */
  const mkTex = ctex(256, 256, x => {
    x.fillStyle = 'rgba(16,14,10,.55)'; rrect(x, 14, 30, 228, 196, 40); x.fill();
    x.strokeStyle = '#ffcb00'; x.lineWidth = 10; rrect(x, 14, 30, 228, 196, 40); x.stroke();
    x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 22;
    [[78, 1], [134, .55]].forEach(([y, a]) => { x.strokeStyle = `rgba(255,203,0,${a})`; x.beginPath(); x.moveTo(76, y); x.lineTo(128, y + 44); x.lineTo(180, y); x.stroke(); });
  });
  Object.entries(LOC_POS).forEach(([id, L]) => {
    const g = new T.Group(); g.position.set(L.x, 0, L.z); g.rotation.y = locFace(id); worldScene.add(g);
    const dm = new T.MeshBasicMaterial({ map: mkTex, transparent: true, opacity: .75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const decal = new T.Mesh(new T.PlaneGeometry(2.2, 2.2), dm); decal.rotation.x = -Math.PI / 2; decal.position.set(0, .085, .3); g.add(decal);
    const label = textSprite(`${L.ico} ${L.n}`, { scale: 3.4, size: 50, bg: 'rgba(10,10,12,.72)', border: 'rgba(255,203,0,.85)' }); label.position.y = 3.3; label.material.opacity = 0; g.add(label);
    const badge = textSprite(L.ico, { w: 128, h: 128, scale: 1.5 }); badge.position.y = 3.6; badge.material.opacity = .9; g.add(badge);
    markers[id] = { g, label, badge, decal, dm, L, t0: Math.random() * 7 };
    if (id === 'cela') g.visible = false;
  });
  buildHits();

  /* ----- trânsito: candongueiros e carros ----- */
  const X = CITY_XS, Z = CITY_ZS;
  const loops = [
    [[X[0], Z[0]], [X[4], Z[0]], [X[4], Z[4]], [X[0], Z[4]]],
    [[X[1], Z[1]], [X[3], Z[1]], [X[3], Z[3]], [X[1], Z[3]]],
    [[X[2], Z[0]], [X[2], Z[4]], [X[4], Z[4]], [X[4], Z[2]], [X[0], Z[2]], [X[0], Z[0]]],
    [[X[0], Z[1]], [X[4], Z[1]], [X[4], Z[3]], [X[0], Z[3]]],
  ];
  const nV = LITE ? 5 : GFX_HD ? (IS_MOBILE ? 10 : 18) : IS_MOBILE ? 8 : 12;
  for (let i = 0; i < nV; i++) {
    let path = loops[i % loops.length]; if (i % 2) path = path.slice().reverse();
    const segs = []; let total = 0;
    for (let k = 0; k < path.length; k++) { const a = path[k], b = path[(k + 1) % path.length]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, L, s: total }); total += L; }
    const v = i % 3 === 0 ? vanModel() : carModel(); v.scale.multiplyScalar(BODY_S); worldScene.add(v);
    vans.push({ g: v, segs, total, d: (i * .37 % 1) * total, speed: 10 + Math.random() * 5, wait: 0 });
  }

  /* ----- peões: cidade só de jogadores reais (sem NPCs falsos na rua) ----- */

  minimapCtx = document.getElementById('minimap').getContext('2d');
  casaZ = null;
}

/* ---------- Minimapa (radar centrado no jogador) ---------- */
function drawMinimap() {
  const c = minimapCtx; if (!c) return; const W = c.canvas.width, H = c.canvas.height, S = 1.05, px = playerPos.x, pz = playerPos.z;
  const sx = x => W / 2 + (x - px) * S, sz = z => H / 2 + (z - pz) * S;
  c.fillStyle = '#b77a50'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#7ea24a'; [[64, 64, 176, 106], [-176, -84, -124, -44], [-176, 114, -64, 150]].forEach(([a, b, d, e]) => c.fillRect(sx(a), sz(b), (d - a) * S, (e - b) * S));
  c.fillStyle = '#1478a8'; c.fillRect(0, 0, W, Math.max(0, sz(-100)));
  c.fillStyle = '#e6cf9c'; c.fillRect(sx(-176), sz(-144), 162 * S, 30 * S); c.fillRect(sx(-154), sz(-116), 8 * S, 16 * S);
  c.fillStyle = '#4a4a4e';
  c.fillRect(sx(-178), sz(-88) - 4, 356 * S, 8); CITY_ZS.forEach(z => c.fillRect(sx(-178), sz(z) - 4, 356 * S, 8)); CITY_XS.forEach(x => c.fillRect(sx(x) - 4, sz(-88), 8, 236 * S)); c.fillRect(sx(-176), sz(-118) - 3, 162 * S, 6);
  c.fillStyle = 'rgba(30,30,40,.35)'; colliders.forEach(k => { if (k.x1 - k.x0 > 6 && k.z1 - k.z0 > 6) c.fillRect(sx(k.x0), sz(k.z0), (k.x1 - k.x0) * S, (k.z1 - k.z0) * S); });
  Object.entries(LOC_POS).forEach(([id, L]) => {
    if (id === 'cela') return; let X = sx(L.x), Z = sz(L.z); const out = X < 9 || X > W - 9 || Z < 9 || Z > H - 9;
    X = Math.max(9, Math.min(W - 9, X)); Z = Math.max(9, Math.min(H - 9, Z));
    c.globalAlpha = out ? .55 : 1; c.fillStyle = id === 'casa' ? '#c8102e' : 'rgba(14,12,18,.88)'; c.beginPath(); c.arc(X, Z, 8, 0, Math.PI * 2); c.fill();
    drawIc(c, emoKey(L.ico), X, Z, 11, id === 'casa' ? '#fff' : '#ffcb00', 2.6); c.globalAlpha = 1;
  });
  c.fillStyle = '#1f63c9'; vans.forEach(v => { const X = sx(v.g.position.x), Z = sz(v.g.position.z); if (X > 0 && X < W && Z > 0 && Z < H) c.fillRect(X - 2, Z - 2, 4, 4); });
  c.save(); c.translate(W / 2, H / 2); c.rotate(-playerYaw + Math.PI);
  c.fillStyle = '#ffcb00'; c.strokeStyle = '#000'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -8); c.lineTo(6, 6); c.lineTo(-6, 6); c.closePath(); c.fill(); c.stroke(); c.restore();
}
