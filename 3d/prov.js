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
function provRng(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return function () { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function provNomes(P) {
  return {
    banco: `Banco Palanca · ${P.cap}`, clinica: `Hospital Geral de ${P.cap}`, escola: `Universidade · ${P.cap}`,
    emprego: `Centro de Emprego · ${P.cap}`, mercado: `Mercado Municipal de ${P.cap}`, igreja: `Igreja Matriz de ${P.cap}`,
    ginasio: `Estádio Provincial`, imobiliaria: `Imobiliária · ${P.cap}`, casa: 'A Minha Casa',
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
  /* chão (cor varia: areia no litoral, terra vermelha no interior) */
  const baseC = P.mar ? '#c2b183' : pobre ? '#a7704a' : '#8f9a62';
  const spC = P.mar ? ['#b3a174', '#d6c69a'] : pobre ? ['#8a5a3a', '#c48b5f'] : ['#7a8a52', '#a2b073'];
  groundPatch(PX - 400, PZ - 300, PX + 400, PZ + 300, null, .004, noiseTex(pobre ? '#96603c' : '#7c8a56', spC, [40, 30], 700));
  groundPatch(PX - 170, PZ - 130, PX + 170, PZ + 130, null, .011, noiseTex(baseC, spC, [26, 20], 1200));
  if (P.mar) {
    const sea = new T.Mesh(new T.PlaneGeometry(760, 280), mat('#1a5f8a', { roughness: .25, metalness: .35 }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(PX, .02, PZ - 270); worldScene.add(sea);
    groundPatch(PX - 170, PZ - 130, PX + 170, PZ - 112, '#e0cd9c', .016);
  }
  /* ruas: avenida principal + travessa */
  road(PX - 150, PZ, PX + 150, PZ);
  road(PX, PZ - 110, PX, PZ + 110);
  crosswalk(PX, PZ);
  for (let k = 0; k < 8; k++) { const lx = PX - 140 + k * 40; if (Math.abs(lx - PX) > 12) { lamp(lx, PZ - 6.2, 0); lamp(lx + 20, PZ + 6.2, Math.PI); } }
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
  /* casario de fundo: musseque nas províncias pobres, prédios nas ricas */
  const nF = (typeof LITE !== 'undefined' && LITE) ? 8 : (typeof IS_MOBILE !== 'undefined' && IS_MOBILE) ? 12 : 16;
  const cores = pobre ? ['#a0663a', '#8a8578', '#b0b4b8', '#7a6a55', '#96543c'] : ['#d9c9a8', '#c9d4d9', '#e0d6c2', '#b8c4cc'];
  for (let f = 0; f < nF; f++) {
    const fx = PX + rr(-140, 140), fz = PZ + (rng() < .5 ? rr(72, 104) : rr(-104, -74));
    if (Math.abs(fx - PX) < 16) continue;
    if (pobre) { const w = rr(5, 8), d = rr(5, 7), h = rr(3, 4.4); mesh(bx(w, h, d), mat(pick2(cores)), fx, h / 2, fz, decor); mesh(bx(w + .4, .18, d + .4), mat('#6a6a66'), fx, h + .05, fz, decor, false); addCol(fx, fz, w, d); }
    else bldg(fx, fz, rr(9, 14), rr(9, 13), rr(8, rico ? 20 : 13), { face: pick2(cores), glass: '#3a4a5a' });
  }
  /* árvores: palmeiras no litoral, imbondeiros no interior */
  for (let tI = 0; tI < 10; tI++) {
    const tx = PX + rr(-150, 150), tz = PZ + rr(-110, 110);
    if (Math.abs(tz - PZ) < 12 || Math.abs(tx - PX) < 10) continue;
    if (P.mar) treeA(tx, tz, rr(.8, 1.3)); else if (pobre) baobab(tx, tz, rr(.7, 1.2)); else (rng() < .5 ? treeA : baobab)(tx, tz, rr(.7, 1.2));
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
