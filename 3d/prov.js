/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Cidades das outras províncias
   Nascer é aleatório: podes nascer em qualquer uma das 21
   províncias — e cada uma tem agora a SUA própria cidade
   compacta (gerada por semente: sempre igual em todos os
   jogadores): hospital, banco, mercado, universidade,
   esquadra, porto/aeroporto… Luanda mantém a cidade grande.
   Carregado depois de veiculos.js.
   ========================================================= */
const PROV = { at: null, saved: null, built: {} };
const PROV_IDS = ['banco', 'clinica', 'escola', 'emprego', 'mercado', 'igreja', 'ginasio', 'imobiliaria', 'casa', 'aeroporto', 'cadeia', 'cela'];
const PROV_SO_LUANDA = new Set(['shopping', 'farra', 'praia', 'empresa', 'obras', 'agencia', 'bikes', 'estacao', 'stand', 'motos', 'tv_marginal', 'tv_estadio', 'tv_ilha', 'tv_mercado']);
/* paisagem por região: deserto no sul seco, mata no norte e nas Lundas/Moxico */
const PROV_DESERTO = new Set(['Namibe', 'Cunene', 'Cuando', 'Cubango']);
const PROV_FLORESTA = new Set(['Cabinda', 'Zaire', 'Uíge', 'Lunda Norte', 'Lunda Sul', 'Moxico', 'Moxico Leste']);
function provRng(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return function () { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function provNomes(P) {
  return {
    banco: `Banco Palanca · ${P.cap}`, clinica: `Hospital Geral de ${P.cap}`, escola: `Universidade · ${P.cap}`,
    emprego: `Centro de Emprego · ${P.cap}`, mercado: `Mercado Municipal de ${P.cap}`, igreja: `Igreja Matriz de ${P.cap}`,
    ginasio: `Estádio Provincial`, imobiliaria: `Imobiliária · ${P.cap}`, casa: (typeof G !== 'undefined' && G && G.visitando) ? `Pensão Central de ${P.cap}` : 'A Minha Casa',
    aeroporto: P.mar ? `Porto de ${(typeof ANG_PORTO !== 'undefined' && ANG_PORTO[P.n]) || P.cap}` : `Aeroporto de ${P.cap}`,
    cadeia: `Esquadra · ${P.cap}`, cela: 'Cela',
  };
}

/* ---------------- construção da cidade da província ---------------- */
function provBuild(P) {
  if (PROV.built[P.n]) return PROV.built[P.n];
  const rng = provRng('pe3d·' + P.n);
  const rr = (a, b) => a + rng() * (b - a);
  const pick2 = arr => arr[Math.floor(rng() * arr.length)];
  const i = Math.max(1, PROVINCIAS.indexOf(P));
  const PX = ((i % 5) - 2) * 470, PZ = 900 + Math.floor(i / 5) * 400;
  const rico = P.custo >= .9, pobre = P.custo < .82;
  const pos = {}, hits = {};
  decor = new T.Group();
  const deserto = PROV_DESERTO.has(P.n), mata = PROV_FLORESTA.has(P.n);
  /* chão (cor varia: areia no litoral e no deserto, terra vermelha no interior, verde na mata) */
  const baseC = P.mar ? '#c2b183' : deserto ? '#c9ac74' : pobre ? '#a7704a' : mata ? '#7f9a52' : '#8f9a62';
  const spC = P.mar ? ['#b3a174', '#d6c69a'] : deserto ? ['#b3945e', '#e0c88f'] : pobre ? ['#8a5a3a', '#c48b5f'] : mata ? ['#6a8a44', '#93ad60'] : ['#7a8a52', '#a2b073'];
  groundPatch(PX - 400, PZ - 300, PX + 400, PZ + 300, null, .004, noiseTex(deserto ? '#b3945e' : pobre ? '#96603c' : mata ? '#6f8a48' : '#7c8a56', spC, [40, 30], 700));
  groundPatch(PX - 170, PZ - 130, PX + 170, PZ + 130, null, .011, noiseTex(baseC, spC, [26, 20], 1200));
  if (P.mar) {
    const sea = new T.Mesh(new T.PlaneGeometry(760, 280), mat('#1a5f8a', { roughness: .25, metalness: .35 }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(PX, .02, PZ - 270); worldScene.add(sea);
    groundPatch(PX - 170, PZ - 130, PX + 170, PZ - 112, '#e0cd9c', .016);
  }
  /* ruas: avenida principal + travessa + grelha de bairro */
  road(PX - 150, PZ, PX + 150, PZ);
  road(PX, PZ - 110, PX, PZ + 110);
  crosswalk(PX, PZ);
  for (let k = 0; k < 8; k++) { const lx = PX - 140 + k * 40; if (Math.abs(lx - PX) > 12) { lamp(lx, PZ - 6.2, 0); lamp(lx + 20, PZ + 6.2, Math.PI); } }
  /* ruas secundárias (duas paralelas à avenida + duas travessas) */
  road(PX - 150, PZ - 78, PX + 150, PZ - 78);
  road(PX - 150, PZ + 78, PX + 150, PZ + 78);
  road(PX - 124, PZ - 78, PX - 124, PZ + 78);
  road(PX + 124, PZ - 78, PX + 124, PZ + 78);
  const imX = mat('#3a3b3f', { roughness: .92 });
  [PX - 124, PX, PX + 124].forEach(ix => [PZ - 78, PZ, PZ + 78].forEach(iz => {   // remendos nos cruzamentos
    const p2 = new T.Mesh(new T.PlaneGeometry(ROAD_W + 6, ROAD_W + 6), imX);
    p2.rotation.x = -Math.PI / 2; p2.position.set(ix, .058, iz); p2.receiveShadow = true; worldScene.add(p2);
  }));
  crosswalk(PX, PZ - 78); crosswalk(PX, PZ + 78); crosswalk(PX - 124, PZ); crosswalk(PX + 124, PZ);
  for (let k = 0; k < 6; k++) { const lx = PX - 130 + k * 52; if (Math.abs(lx - PX) > 12 && Math.abs(Math.abs(lx - PX) - 124) > 14) { lamp(lx, PZ - 84.2, 0); lamp(lx + 26, PZ + 84.2, Math.PI); } }
  lamp(PX - 130.2, PZ - 40, Math.PI / 2); lamp(PX - 130.2, PZ + 40, Math.PI / 2);
  lamp(PX + 130.2, PZ - 40, -Math.PI / 2); lamp(PX + 130.2, PZ + 40, -Math.PI / 2);
  /* instituições (a cara da província) */
  const hR = rico ? [13, 20] : pobre ? [7, 10] : [10, 15];
  const put = (id, x, z, w, d, h, o, sTxt, sSub, sBg, sFg, norte) => {
    bldg(x, z, w, d, h, o || {});
    if (sTxt) sign(sTxt, Math.min(w * .72, 17), sBg || '#1d3557', sFg || '#fff', sSub == null ? P.cap.toUpperCase() : sSub, x, Math.min(h - 1.4, 4.6), z + (norte ? d / 2 + .18 : -d / 2 - .18), norte ? 0 : Math.PI);
    pos[id] = { x, z: z + (norte ? d / 2 + 2 : -d / 2 - 2) };
    hits[id] = [x, z, w, d, h];
  };
  put('banco', PX - 84, PZ - 34, 24, 16, rr(10, 14), { face: '#0d2a4a', glass: '#9fc3e0', kind: 'glass', noTop: true }, 'BANCO PALANCA', 'AGÊNCIA ' + P.cap.toUpperCase(), '#0d2a4a', '#ffd76a', true);
  put('clinica', PX - 28, PZ - 34, 26, 16, rr(hR[0], hR[1]), { face: '#f2f2f2', glass: '#7ab8d9' }, 'HOSPITAL GERAL', 'URGÊNCIAS 24H', '#c8102e', '#fff', true);
  put('escola', PX + 28, PZ - 34, 26, 16, rr(hR[0], hR[1]), { face: '#e8d9b0', glass: '#3a4a5a' }, 'UNIVERSIDADE', null, '#5a3a8a', '#fff', true);
  put('emprego', PX + 84, PZ - 34, 24, 16, rr(hR[0], hR[1]), { face: '#2f6b4f', glass: '#cfe0d8' }, 'CENTRO DE EMPREGO', 'VAGAS · FORMAÇÃO', '#1d4a34', '#fff', true);
  put('mercado', PX - 84, PZ + 34, 34, 18, 7, { face: '#c96f4a', glass: '#3a2a22', noTop: true }, 'MERCADO MUNICIPAL', null, '#8a4a2a', '#ffd76a', false);
  put('igreja', PX - 28, PZ + 34, 16, 18, 13, { face: '#f5efe0', glass: '#5a4a7a', noTop: true }, 'IGREJA MATRIZ', '', '#f5efe0', '#333', false);
  put('ginasio', PX + 28, PZ + 34, 34, 18, 8, { face: '#3a6ea5', glass: '#cfe0f0', noTop: true }, 'ESTÁDIO PROVINCIAL', 'FUTEBOL · BASQUETE', '#163a5c', '#fff', false);
  put('imobiliaria', PX + 84, PZ + 34, 22, 16, rr(hR[0], hR[1]), { face: '#b5651d', glass: '#f0e0c8' }, 'IMOBILIÁRIA', 'ARRENDAR · COMPRAR', '#7a3a10', '#fff', false);
  put('casa', PX - 56, PZ + 62, 11, 10, 6, { face: '#e0c9a6', glass: '#6a8aaa', noTop: true }, null, null, null, null, false);
  put('aeroporto', PX + 96, PZ + 62, 32, 14, 9, { face: '#dfe6ee', glass: '#2a4a6a', kind: 'glass', noTop: true },
    P.mar ? 'PORTO DE ' + ((typeof ANG_PORTO !== 'undefined' && ANG_PORTO[P.n]) || P.cap).toUpperCase() : 'AEROPORTO DE ' + P.cap.toUpperCase(),
    P.mar ? 'PESCA · CARGA · NAVIOS' : 'VOOS PARA TODO O PAÍS', '#0a3a5c', '#fff', false);
  put('cadeia', PX - 96, PZ - 58, 20, 12, 8, { face: '#8f8f8a', glass: '#333333', noTop: true }, 'ESQUADRA · TRIBUNAL', null, '#222222', '#dddddd', true);
  pos.cela = { x: PX - 88, z: PZ - 48 }; hits.cela = [PX - 88, PZ - 58, 8, 10, 8];
  /* cruz da igreja */
  mesh(bx(.5, 2.2, .5), mat('#f5efe0'), PX - 28, 14.4, PZ + 34, decor, false);
  mesh(bx(1.6, .5, .5), mat('#f5efe0'), PX - 28, 14.9, PZ + 34, decor, false);
  /* bancas do mercado */
  for (let s = 0; s < 4; s++) { const sx = PX - 122 + s * 9, sz = PZ + 46, cor = ['#c8102e', '#ffcb00', '#2f9bd0', '#52b788'][s]; mesh(bx(3, 2.2, 2.5), mat(cor), sx, 1.1, sz, decor); canopy(sx, sz, 3.6, 3, 2.6, cor, '#ffffff', 0); addCol(sx, sz, 3.4, 2.9); }
  /* praça central: fonte, bancos, mastro com a bandeira e placa */
  const qx = PX + 37, qz = PZ - 57;
  const pavT = ctex(128, 128, x => { x.fillStyle = '#cfc8b8'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .06})`; x.fillRect(R(0, 127), R(0, 127), 2, 2); } x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 2; for (let i = 0; i <= 128; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); } });
  pavT.wrapS = pavT.wrapT = T.RepeatWrapping; pavT.repeat.set(6, 4);
  groundPatch(qx - 22, qz - 13, qx + 22, qz + 13, null, .04, pavT);
  mesh(cyl(3, 3.3, .7, 18), mat('#b8b0a0', { roughness: .8 }), qx, .35, qz, decor);
  mesh(cyl(2.6, 2.6, .2, 18), mat('#3f9fd8', { roughness: .15, metalness: .4 }), qx, .68, qz, decor, false);
  mesh(cyl(.18, .26, 1.6, 8), mat('#b8b0a0'), qx, 1.2, qz, decor);
  mesh(sph(.5, 10, 8), mat('#cfe8f8', { roughness: .1 }), qx, 2.1, qz, decor, false);
  addCol(qx, qz, 6.8, 6.8);
  const bancoM = mat('#7a5236', { roughness: .85 }), ferroM = mat('#394048', { roughness: .6, metalness: .3 });
  [[0, -6.5, 0], [0, 6.5, Math.PI], [-6.5, 0, Math.PI / 2], [6.5, 0, -Math.PI / 2]].forEach(([ox, oz, or2]) => {
    const bg2 = new T.Group(); bg2.position.set(qx + ox, 0, qz + oz); bg2.rotation.y = or2; decor.add(bg2);
    mesh(bx(2.6, .1, .7), bancoM, 0, .55, 0, bg2, false);
    mesh(bx(2.6, .6, .1), bancoM, 0, .95, -.3, bg2, false);
    [-1.1, 1.1].forEach(lx2 => mesh(bx(.12, .55, .6), ferroM, lx2, .27, 0, bg2, false));
  });
  mesh(cyl(.09, .11, 12, 8), mat('#dddddd', { metalness: .6 }), qx + 15, 6, qz, decor); addCol(qx + 15, qz, .5, .5);
  const flT = ctex(300, 200, x => {
    x.fillStyle = '#cc092f'; x.fillRect(0, 0, 300, 100); x.fillStyle = '#000'; x.fillRect(0, 100, 300, 100);
    x.strokeStyle = '#ffcb00'; x.fillStyle = '#ffcb00'; x.lineWidth = 12;
    x.beginPath(); x.arc(150, 100, 42, Math.PI * .75, Math.PI * 2.05); x.stroke();
    for (let i = 0; i < 9; i++) { const a = Math.PI * .8 + i * .16; x.fillRect(150 + Math.cos(a) * 50 - 5, 100 + Math.sin(a) * 50 - 5, 10, 10); }
    x.save(); x.translate(150, 100); x.rotate(-.7); x.fillRect(-48, -6, 80, 12); x.fillRect(30, -10, 22, 20); x.restore();
    x.beginPath(); for (let i = 0; i < 10; i++) { const rr2 = i % 2 ? 7 : 16, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(128 + Math.cos(a) * rr2, 72 + Math.sin(a) * rr2); } x.closePath(); x.fill();
  });
  const fl2 = new T.Mesh(new T.PlaneGeometry(4.4, 2.9), new T.MeshStandardMaterial({ map: flT, side: T.DoubleSide, roughness: .9 }));
  fl2.position.set(qx + 17.3, 10.2, qz); worldScene.add(fl2);
  lamp(qx - 18, qz - 10, Math.PI / 4); lamp(qx + 18, qz + 10, -Math.PI * .75);
  sign('PRAÇA DA INDEPENDÊNCIA', 7.5, '#7a1f2b', '#ffd76a', P.cap.toUpperCase(), qx - 21.6, 2.7, qz, -Math.PI / 2);
  /* vida nos passeios: paragem, zungueiras, publicidade e lixo */
  if (typeof paragem === 'function') {
    paragem(PX + 46, PZ + 7.4, Math.PI); paragem(PX - 20, PZ - 7.4, 0);
    banca(PX - 72, PZ + 50, pick2(['#d2122e', '#2e8b57', '#e8b923', '#2f9bd0']));
    banca(PX - 62, PZ + 52, pick2(['#d2122e', '#2e8b57', '#e8b923', '#2f9bd0']));
    caixote(PX + 40, PZ - 8.4); caixote(PX - 60, PZ + 8.4); caixote(qx - 20, qz + 11);
    mupi(PX - 40, PZ + 8.6, 'Kalemba TV', '#1f63c9', '#ffffff', 0);
    mupi(PX + 140, PZ - 8.6, 'Txova', '#2e8b57', '#ffffff', Math.PI);
  }
  /* candongueiro parado junto à paragem */
  if (typeof vanModel === 'function') { const van2 = vanModel(); van2.scale.multiplyScalar(BODY_S); van2.position.set(PX + 57, 0, PZ + 5.4); worldScene.add(van2); }
  /* cais com barcos de pesca no litoral; avião estacionado no interior */
  if (P.mar) {
    const pierM = mat('#8a6b46', { roughness: .9 });
    mesh(bx(3.4, .35, 42), pierM, PX + 40, .5, PZ - 136, decor);
    for (let pz2 = PZ - 118; pz2 >= PZ - 154; pz2 -= 9) { mesh(cyl(.14, .14, 1.2, 6), pierM, PX + 38.6, 0, pz2, decor, false); mesh(cyl(.14, .14, 1.2, 6), pierM, PX + 41.4, 0, pz2, decor, false); }
    for (let b2 = 0; b2 < 3; b2++) {
      const bg3 = new T.Group(); bg3.position.set(PX - 60 + b2 * 46 + rr(-8, 8), .1, PZ - 160 - rr(0, 30)); bg3.rotation.y = rr(-.4, .4); decor.add(bg3);
      mesh(bx(5, 1, 1.9), mat(pick2(['#d7d2c8', '#c8102e', '#1f63c9', '#2e8b57']), { roughness: .6 }), 0, .4, 0, bg3);
      mesh(bx(1.8, .9, 1.5), mat('#f2f2f2', { roughness: .7 }), -.8, 1.2, 0, bg3, false);
      mesh(cyl(.05, .05, 3, 6), pierM, 1, 2, 0, bg3, false);
    }
  } else {
    const ap = new T.Group(); ap.position.set(PX + 104, 0, PZ + 46); ap.rotation.y = .5; decor.add(ap);
    const fm2 = mat('#e8ecef', { roughness: .35, metalness: .3 });
    const fus = mesh(cyl(.85, .85, 9, 12), fm2, 0, 1.5, 0, ap); fus.rotation.z = Math.PI / 2;
    const nos = mesh(sph(.85, 10, 8), fm2, 4.5, 1.5, 0, ap, false); nos.scale.x = 1.3;
    mesh(bx(2.6, .14, 11), fm2, -.4, 1.6, 0, ap, false);
    mesh(bx(1.4, 2, .14), fm2, -4.2, 2.6, 0, ap, false);
    mesh(bx(1.4, .12, 4.4), fm2, -4.2, 2, 0, ap, false);
    addCol(PX + 104, PZ + 46, 8, 8);
  }
  /* letreiros de boas-vindas nas duas entradas da avenida */
  const wel = (wx, wz, wry) => {
    const dx = Math.cos(wry), dz = -Math.sin(wry);
    mesh(cyl(.1, .1, 5.6, 8), ferroM, wx - 6.2 * dx, 2.8, wz - 6.2 * dz, decor);
    mesh(cyl(.1, .1, 5.6, 8), ferroM, wx + 6.2 * dx, 2.8, wz + 6.2 * dz, decor);
    sign('BEM-VINDO', 12.5, '#0d3f8f', '#ffffff', P.cap.toUpperCase() + ' · ' + P.n.toUpperCase(), wx, 4.3, wz, wry);
  };
  wel(PX - 156, PZ + 9, -Math.PI / 2);
  wel(PX + 156, PZ - 9, Math.PI / 2);
  /* casario de fundo: musseque nas províncias pobres, prédios nas ricas */
  const nF = (typeof LITE !== 'undefined' && LITE) ? 10 : (typeof IS_MOBILE !== 'undefined' && IS_MOBILE) ? 14 : 20;
  const cores = pobre ? ['#a0663a', '#8a8578', '#b0b4b8', '#7a6a55', '#96543c'] : ['#d9c9a8', '#c9d4d9', '#e0d6c2', '#b8c4cc'];
  for (let f = 0; f < nF; f++) {
    const fx = PX + rr(-140, 140), fz = PZ + (rng() < .5 ? rr(88, 112) : rr(-112, -88));
    if (Math.abs(fx - PX) < 16 || Math.abs(Math.abs(fx - PX) - 124) < 12) continue;
    if (pobre) { const w = rr(5, 8), d = rr(5, 7), h = rr(3, 4.4); mesh(bx(w, h, d), mat(pick2(cores)), fx, h / 2, fz, decor); mesh(bx(w + .4, .18, d + .4), mat('#6a6a66'), fx, h + .05, fz, decor, false); addCol(fx, fz, w, d); }
    else bldg(fx, fz, rr(9, 14), rr(9, 13), rr(8, rico ? 20 : 13), { face: pick2(cores), glass: '#3a4a5a' });
  }
  /* árvores: palmeiras no litoral, imbondeiros no interior, poucas no deserto, muitas na mata */
  const nT = deserto ? 5 : mata ? 16 : 10;
  for (let tI = 0; tI < nT; tI++) {
    const tx = PX + rr(-150, 150), tz = PZ + rr(-112, 112);
    if (Math.abs(tz - PZ) < 12 || Math.abs(tx - PX) < 10) continue;
    if (Math.abs(Math.abs(tz - PZ) - 78) < 11 || Math.abs(Math.abs(tx - PX) - 124) < 10) continue;   // longe das ruas novas
    if (tx > qx - 25 && tx < qx + 25 && tz > qz - 16 && tz < qz + 16) continue;                    // praça livre
    if (P.mar) treeA(tx, tz, rr(.8, 1.3)); else if (deserto || pobre) baobab(tx, tz, rr(deserto ? .55 : .7, deserto ? .95 : 1.2)); else (rng() < .5 ? treeA : baobab)(tx, tz, rr(.7, mata ? 1.5 : 1.2));
  }
  /* carros estacionados e skyline ao longe */
  if (typeof carModel === 'function') for (let c = 0; c < 3; c++) { const v = carModel(); v.scale.multiplyScalar(BODY_S); v.position.set(PX - 40 + c * 34, 0, PZ + (c % 2 ? -5.6 : 5.6)); v.rotation.y = Math.PI / 2; worldScene.add(v); }
  if (!(typeof LITE !== 'undefined' && LITE)) for (let s2 = 0; s2 < 8; s2++) {
    const ang = s2 / 8 * Math.PI * 2, rx = PX + Math.cos(ang) * rr(190, 250), rz = PZ + Math.sin(ang) * rr(160, 210);
    if (P.mar && rz < PZ - 130) continue;
    bldg(rx, rz, rr(10, 16), rr(10, 16), rr(10, rico ? 30 : 16), { face: pick2(cores), nocol: true, noTop: true });
  }
  worldScene.add(mergeStatic(decor)); decor = null;
  WALK.push({ x0: PX - 165, x1: PX + 165, z0: PZ - 125, z1: PZ + 125 });
  const B = { PX, PZ, pos, hits };
  PROV.built[P.n] = B;
  return B;
}

/* ---------------- marcadores (etiquetas flutuantes) ---------------- */
function provMark(id, txt) {
  const M = markers[id]; if (!M) return;
  const s = textSprite(txt, { scale: 3.4, size: 50, bg: 'rgba(10,10,12,.72)', border: 'rgba(255,203,0,.85)' });
  s.position.copy(M.label.position); s.material.opacity = M.label.material.opacity;
  M.g.remove(M.label); M.g.add(s); M.label = s;
}

/* ---------------- aplicar / repor a cidade da província ---------------- */
function provApply(P) {
  if (PROV.at === P.n || !worldScene) return;
  provRestore();
  const B = provBuild(P), N = provNomes(P);
  PROV.saved = { pos: {}, hits: {}, txt: {} };
  PROV_IDS.forEach(id => {
    const old = LOC_POS[id]; if (!old) return;
    PROV.saved.pos[id] = old; PROV.saved.hits[id] = HIT_BOXES[id]; PROV.saved.txt[id] = `${old.ico} ${old.n}`;
    const p = B.pos[id]; if (!p) return;
    LOC_POS[id] = { x: p.x, z: p.z, ico: old.ico, n: N[id] || old.n, zona: P.n };
    if (B.hits[id]) HIT_BOXES[id] = B.hits[id];
    const M = markers[id];
    if (M) { M.g.position.set(p.x, 0, p.z); M.L = LOC_POS[id]; provMark(id, `${old.ico} ${LOC_POS[id].n}`); M.g.rotation.y = locFace(id); }
  });
  PROV.at = P.n;
  buildHits();
}
function provRestore() {
  if (!PROV.at) return;
  const S = PROV.saved; PROV.at = null; PROV.saved = null;
  PROV_IDS.forEach(id => {
    if (!S.pos[id]) return;
    LOC_POS[id] = S.pos[id];
    if (S.hits[id]) HIT_BOXES[id] = S.hits[id]; else delete HIT_BOXES[id];
    const M = markers[id];
    if (M) { M.g.position.set(LOC_POS[id].x, 0, LOC_POS[id].z); M.L = LOC_POS[id]; provMark(id, S.txt[id]); M.g.rotation.y = locFace(id); }
  });
  casaZ = null; placeCasa();
  buildHits();
}
function provTP(id) {
  const L = LOC_POS[id]; if (!L) return;
  autoGo = null; const f = $('#fade');
  f.innerHTML = `<div><small>📍 ${esc(G.cidade.mun)}</small><b style="font-size:30px">${esc(G.cidade.prov)}</b></div>`;
  f.classList.add('on'); uiBlocked = true;
  setTimeout(() => {
    playerYaw = locFace(id);
    playerPos.set(L.x - Math.sin(playerYaw) * 2.2, 0, L.z - Math.cos(playerYaw) * 2.2);
    camYaw = playerYaw + Math.PI + .3;
    if (camera) camera.position.set(playerPos.x + Math.sin(camYaw) * camDist, 6, playerPos.z + Math.cos(camYaw) * camDist);
    f.classList.remove('on'); uiBlocked = false;
  }, 650);
}
/* sincroniza o mundo 3D com a província onde a personagem vive */
function provSync(tp) {
  if (!G || !worldScene || mode !== 'game') return;
  const n = G.cidade.prov;
  if (n === 'Luanda') { if (PROV.at) { provRestore(); if (tp) provTP(tp); } return; }
  const P = PROVINCIAS.find(p => p.n === n); if (!P) return;
  if (PROV.at !== n) { provApply(P); if (tp) provTP(tp); }
}

/* ---------------- integrações ---------------- */
/* a casa da personagem, quando estás noutra província, é a casa da província */
const _placeCasaProv = placeCasa;
placeCasa = function () {
  if (PROV.at && PROV.built[PROV.at]) {
    const B = PROV.built[PROV.at];
    LOC_POS.casa.x = B.pos.casa.x; LOC_POS.casa.z = B.pos.casa.z;
    HIT_BOXES.casa = B.hits.casa;
    if (markers.casa) markers.casa.g.position.set(B.pos.casa.x, 0, B.pos.casa.z);
    return;
  }
  _placeCasaProv();
};
/* sítios que só existem em Luanda: aviso amigável em vez de atravessar o país a pé */
const _tapEnterProv = tapEnter;
tapEnter = function (id) {
  if (PROV.at && PROV_SO_LUANDA.has(id)) return toast('📍 Isso fica em Luanda. Volta pelo Porto/Aeroporto da província!');
  _tapEnterProv(id);
};
const _goTeleportProv = goTeleport;
goTeleport = function (id) {
  if (PROV.at && PROV_SO_LUANDA.has(id)) return toast('📍 Isso fica em Luanda. Volta pelo Porto/Aeroporto da província!');
  _goTeleportProv(id);
};
