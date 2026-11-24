/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Veículos: Stand Auto Kianda, Moto Bwé,
   Pedala Angola, Estação Ferroviária e Aeroporto de Luanda.
   Catálogo, modelos 3D, viagens de lazer com visual animado.
   Carregado depois de mundo.js.
   ========================================================= */
const VEIC = {
  // ---- carros ----
  citadino: { cat: 'carro', mod: 'mini', t: 'Kitoko Mini', sub: 'Citadino novo', ico: '🚗', p: 2800000, manut: 150000, vel: 145, conf: 2, kml: 22, ef: { felicidade: 5, fama: 1 }, d: 'Pequeno, económico e fácil de estacionar na Baixa', cores: ['#ffcb00', '#ff2fa0', '#2ab0d8', '#f2f2f2'] },
  carro: { cat: 'carro', mod: 'sedan', t: 'Kianda Sedan 2014', sub: 'Usado, bem estimado', ico: '🚗', vel: 170, conf: 2, kml: 35, cores: ['#9aa0a6', '#151515', '#f2f2f2', '#1f63c9'] },
  carroel: { cat: 'carro', mod: 'ev', t: 'Volta EV', sub: 'Elétrico, 480 km de autonomia', ico: '🔋', vel: 185, conf: 4, kml: 8, ev: true, cores: ['#f2f2f2', '#0077b6', '#2e8b57', '#151515'] },
  pickup: { cat: 'carro', mod: 'pickup', t: 'Bwala 4x4 Pick-up', sub: 'Todo-o-terreno, caixa aberta', ico: '🛻', p: 9500000, manut: 350000, vel: 165, conf: 3, kml: 55, tt: true, ef: { felicidade: 7, fama: 2 }, d: 'Aguenta picadas, lama e as estradas do interior', cores: ['#2e8b57', '#c8102e', '#f2f2f2', '#6b4f2a'] },
  hiace: { cat: 'carro', mod: 'van', t: 'Carrinha Candongueiro', sub: 'Azul e branca, 15 lugares', ico: '🚐', vel: 125, conf: 1, kml: 45, cores: ['#1f63c9'] },
  carronovo: { cat: 'carro', mod: 'suv', t: 'Mulemba X5', sub: 'SUV novo, 7 lugares', ico: '🚙', vel: 200, conf: 4, kml: 55, tt: true, d: 'Espaço, conforto e estatuto', cores: ['#0077b6', '#151515', '#f2f2f2', '#7a1f2b'] },
  gt: { cat: 'carro', mod: 'sport', t: 'Palanca GT', sub: 'Desportivo V8, 0–100 em 3,6 s', ico: '🏎️', p: 45000000, manut: 1500000, carta: true, vel: 300, conf: 3, kml: 90, ef: { felicidade: 14, fama: 10, karma: -1 }, d: 'Toda a Marginal vai olhar para ti', cores: ['#c8102e', '#ffcb00', '#151515', '#ff7a1a'] },
  jeep: { cat: 'carro', mod: 'jeep', t: 'Jeep de Luxo V8', sub: 'O rei das estradas do interior', ico: '🛻', vel: 210, conf: 5, kml: 80, tt: true, cores: ['#151515', '#f2f2f2', '#3a4a2a', '#7a1f2b'] },
  // ---- motos ----
  scooter: { cat: 'moto', mod: 'scooter', t: 'Bwé 50 Scooter', sub: '50 cc, sem carta a partir dos 16', ico: '🛵', p: 350000, manut: 40000, idade: 16, vel: 60, conf: 1, kml: 8, ef: { felicidade: 4 }, d: 'Para fugir ao engarrafamento sem carta de condução', cores: ['#ff2fa0', '#2ab0d8', '#ffcb00', '#f2f2f2'] },
  motoel: { cat: 'moto', mod: 'scooter', t: 'Bwé E-Volt', sub: 'Scooter elétrica, carrega em casa', ico: '🛵', p: 900000, manut: 30000, idade: 16, vel: 85, conf: 1, kml: 3, ev: true, ef: { felicidade: 4, karma: 2 }, d: 'Silenciosa, sem combustível, amiga do ambiente', cores: ['#2e8b57', '#f2f2f2', '#0077b6', '#151515'] },
  moto: { cat: 'moto', mod: 'moto', t: 'Kupapata 125', sub: 'A clássica dos mototaxistas', ico: '🏍️', vel: 110, conf: 1, kml: 14, cores: ['#c8102e', '#151515', '#1f63c9', '#f2f2f2'] },
  trail: { cat: 'moto', mod: 'trail', t: 'Mbunda Trail 250', sub: 'Aventura e picadas', ico: '🏍️', p: 1600000, manut: 150000, carta: true, vel: 140, conf: 2, kml: 18, tt: true, ef: { felicidade: 6, saude: 1 }, d: 'Sobe a Serra da Leba e atravessa a savana', cores: ['#ffcb00', '#ff7a1a', '#2e8b57', '#f2f2f2'] },
  superbike: { cat: 'moto', mod: 'superbike', t: 'Raio 1000R', sub: 'Superdesportiva, 299 km/h', ico: '🏍️', p: 12000000, manut: 600000, carta: true, vel: 299, conf: 2, kml: 35, ef: { felicidade: 12, fama: 6, karma: -1 }, d: 'Barulho, adrenalina e muitos seguidores', cores: ['#151515', '#c8102e', '#0077b6', '#ffcb00'] },
  // ---- bicicletas ----
  bike: { cat: 'bike', mod: 'bike', t: 'Pasteleira Kianda', sub: 'Bicicleta de cidade com cesto', ico: '🚲', vel: 22, conf: 1, kml: 0, cores: ['#2e8b57', '#c8102e', '#f2f2f2', '#1f63c9'] },
  bmx: { cat: 'bike', mod: 'bmx', t: 'BMX Kuduro', sub: 'Saltos e manobras', ico: '🚲', p: 80000, vel: 20, conf: 1, kml: 0, ef: { felicidade: 4, saude: 1 }, d: 'A bicicleta dos truques no Largo da Independência', cores: ['#ff2fa0', '#ffcb00', '#151515', '#2ab0d8'] },
  btt: { cat: 'bike', mod: 'btt', t: 'BTT Serra da Leba', sub: 'Montanha, 21 velocidades', ico: '🚲', p: 250000, vel: 26, conf: 1, kml: 0, tt: true, ef: { saude: 3, felicidade: 2 }, d: 'Picadas, areia e trilhos no Miradouro da Lua', cores: ['#ff7a1a', '#2e8b57', '#151515', '#c8102e'] },
  corrida: { cat: 'bike', mod: 'corrida', t: 'Estrada Volta a Angola', sub: 'Bicicleta de corrida em carbono', ico: '🚲', p: 600000, vel: 38, conf: 1, kml: 0, ef: { saude: 3, fama: 1 }, d: 'Para as provas de ciclismo e os treinos ao amanhecer', cores: ['#0077b6', '#151515', '#f2f2f2', '#ffcb00'] },
  ebike: { cat: 'bike', mod: 'ebike', t: 'E-Bike Kianda', sub: 'Elétrica, sobe tudo sem suar', ico: '🚲', p: 900000, vel: 32, conf: 2, kml: 0, ev: true, ef: { saude: 1, felicidade: 4, karma: 1 }, d: 'Chega ao trabalho fresco(a), mesmo com 35 °C', cores: ['#0077b6', '#f2f2f2', '#2e8b57', '#151515'] },
};
// junta os veículos novos à lista de bens (manutenção anual, venda, inventário)
Object.keys(VEIC).forEach(id => {
  const V = VEIC[id]; V.id = id; const B = BENS.find(b => b.id === id);
  if (B) { V.p = B.p; V.manut = B.manut; V.carta = !!B.carta; V.ef = B.ef || V.ef || {}; V.d = V.d || B.d; B.t = V.t + (V.sub ? ' (' + V.sub.toLowerCase() + ')' : ''); }
  else BENS.push({ id, cat: 'Veículos', t: V.t, ico: V.ico, p: V.p, carta: V.cat === 'carro' || !!V.carta, manut: V.manut, d: V.d, ef: V.ef });
  if (V.cat === 'carro') V.carta = true;
});
const VH_CAT = { carro: { n: 'Carros', ico: '🚗', loc: 'stand', rent: 45000, rentN: 'Kianda Sedan de aluguer', rentMod: 'sedan', rentIdade: 21 },
  moto: { n: 'Motos', ico: '🏍️', loc: 'motos', rent: 15000, rentN: 'Kupapata 125 de aluguer', rentMod: 'moto', rentIdade: 18 },
  bike: { n: 'Bicicletas', ico: '🚲', loc: 'bikes', rent: 2000, rentN: 'Bicicleta de aluguer', rentMod: 'bike', rentIdade: 0 } };
const VH = { cor: {}, sel: {}, cls: 'eco', cam: 0 };
function vhG() { if (!G.viag) G.viag = { km: 0, n: 0, mi: 0, vis: [], car: [], td: {}, cor: {} }; const v = G.viag; v.vis = v.vis || []; v.car = v.car || []; v.td = v.td || {}; v.cor = v.cor || {}; return v; }
function vhOwned(cat) { return Object.keys(VEIC).filter(id => VEIC[id].cat === cat && G.bens.includes(id)); }
function vhCor(id) { return VH.cor[id] || (G.viag && G.viag.cor && G.viag.cor[id]) || VEIC[id].cores[0]; }

/* =========================================================
   MODELOS 3D (frente = +x, chão em y = 0)
   ========================================================= */
function vmRod(g, a, b, r, m) { // cilindro entre dois pontos
  const A = new T.Vector3(...a), B = new T.Vector3(...b), d = B.clone().sub(A), L = d.length();
  const o = new T.Mesh(cyl(r, r, 1, 6), m); o.scale.y = L; o.position.copy(A).add(B).multiplyScalar(.5);
  o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); o.castShadow = true; g.add(o); return o;
}
function vmWheel(g, x, y, z, r, w, list) {
  const t = mesh(cyl(r, r, w, 16), mat('#151515', { roughness: .9 }), x, y, z, g); t.rotation.x = Math.PI / 2;
  const rim = mesh(cyl(r * .58, r * .58, w + .02, 10), mat('#c9ced4', { metalness: .8, roughness: .25 }), 0, 0, 0, t, false);
  if (list) list.push(t); return t;
}
function vmCar(col, o) {
  const g = new T.Group(), body = mat(col, { roughness: .28, metalness: .45 }), glass = mat('#14202b', { roughness: .06, metalness: .75 }), dark = mat('#1a1a1a', { roughness: .7 });
  const L = o.L, W = o.W || 1.8, y0 = o.y0 || .32, H = o.H || .62;
  mesh(bx(L, H, W), body, 0, y0 + H / 2, 0, g);
  mesh(bx(L + .06, .18, W + .04), dark, 0, y0 + .08, 0, g, false); // para-choques
  if (o.cl) {
    const cab = mesh(bx(o.cl, o.ch, W * .9), body, o.cx, y0 + H + o.ch / 2, 0, g);
    mesh(bx(o.cl + .03, o.ch * .62, W * .92), glass, o.cx, y0 + H + o.ch * .46, 0, g, false);
    const ws = mesh(bx(.06, o.ch * 1.05, W * .86), glass, o.cx + o.cl / 2 + .14, y0 + H + o.ch * .45, 0, g, false); ws.rotation.z = -(o.ws || .55);
  }
  [[L / 2 + .01, '#fff6c0', .7], [-L / 2 - .01, '#e01e37', .55]].forEach(([x, c, e]) => [-1, 1].forEach(s => mesh(bx(.05, .14, .34), mat(c, { emissive: c, emissiveIntensity: e }), x, y0 + H * .62, s * (W / 2 - .3), g, false)));
  mesh(bx(.04, .2, W * .45), dark, L / 2 + .02, y0 + H * .42, 0, g, false); // grelha
  const wr = o.wr || .36, wx = o.wx || L / 2 - .7; g.userData.wheels = [];
  [[wx, 1], [-wx, 1], [wx, -1], [-wx, -1]].forEach(([x, s]) => vmWheel(g, x, wr, s * (W / 2 - .02), wr, .26, g.userData.wheels));
  return g;
}
function vmMoto(col, o) {
  const g = new T.Group(), body = mat(col, { roughness: .3, metalness: .4 }), dark = mat('#161616', { roughness: .6 }), chrome = mat('#c9ced4', { metalness: .85, roughness: .2 });
  const r = o.r || .34, wb = o.wb || .72; g.userData.wheels = [];
  [wb, -wb].forEach(x => { const t = mesh(new T.TorusGeometry(r, o.tyre || .085, 8, 20), dark, x, r, 0, g); g.userData.wheels.push(t); mesh(cyl(r * .6, r * .6, .04, 12), chrome, x, r, 0, g, false).rotation.x = Math.PI / 2; });
  if (o.kind === 'scooter') {
    mesh(bx(1.1, .14, .36), body, -.05, .4, 0, g); mesh(bx(.5, .5, .4), body, -.42, .62, 0, g); mesh(bx(.56, .1, .32), dark, -.4, .92, 0, g);
    mesh(bx(.18, .8, .38), body, .55, .72, 0, g); vmRod(g, [.6, 1.1, 0], [.62, 1.15, 0], .03, chrome); mesh(bx(.06, .04, .6), dark, .62, 1.16, 0, g, false);
    mesh(bx(.06, .12, .16), mat('#fff6c0', { emissive: '#fff6c0', emissiveIntensity: .7 }), .66, .95, 0, g, false);
  } else {
    const hi = o.kind === 'trail' ? .2 : 0;
    vmRod(g, [-wb, r, 0], [-.05, .62 + hi, 0], .045, chrome); vmRod(g, [wb, r, 0], [.48, 1.02 + hi, 0], .04, chrome);
    mesh(bx(.5, .3, .34), body, .12, .86 + hi, 0, g); // depósito
    mesh(bx(.36, .3, .26), mat('#3a3a3a', { metalness: .6 }), 0, .5 + hi, 0, g); // motor
    mesh(bx(.6, .1, .3), dark, -.34, .94 + hi, 0, g); // banco
    mesh(bx(.06, .04, .7), dark, .5, 1.1 + hi, 0, g, false); // guiador
    vmRod(g, [-.15, .45, .14], [-.75, .62, .14], .05, chrome); // escape
    mesh(bx(.06, .14, .16), mat('#fff6c0', { emissive: '#fff6c0', emissiveIntensity: .7 }), .58, .98 + hi, 0, g, false);
    if (o.kind === 'superbike') { const f = mesh(bx(.7, .5, .4), body, .38, .86, 0, g); f.rotation.z = -.35; mesh(bx(.3, .2, .3), mat('#14202b', { metalness: .7, roughness: .1 }), .52, 1.12, 0, g, false).rotation.z = -.7; mesh(bx(.5, .3, .3), body, -.52, 1.0, 0, g).rotation.z = .3; }
    if (o.kind === 'trail') { mesh(bx(.3, .05, .3), body, wb - .05, r + .42, 0, g); mesh(bx(.3, .05, .26), body, -wb + .12, r + .5, 0, g); }
  }
  return g;
}
function vmBike(col, o) {
  const g = new T.Group(), fr = mat(col, { roughness: .35, metalness: .5 }), dark = mat('#151515'), r = o.r || .34, wb = o.wb || .55; g.userData.wheels = [];
  [wb, -wb].forEach(x => { const t = mesh(new T.TorusGeometry(r, o.tyre || .03, 6, 22), dark, x, r, 0, g); g.userData.wheels.push(t); mesh(cyl(.03, .03, .06, 6), mat('#aaa'), x, r, 0, g, false).rotation.x = Math.PI / 2; });
  const bb = [-.02, r * .95, 0], seat = [-.18, r + .5 * (o.h || 1), 0], head = [wb - .1, r + .48 * (o.h || 1), 0];
  vmRod(g, [-wb, r, 0], bb, .02, fr); vmRod(g, [-wb, r, 0], seat, .02, fr); vmRod(g, bb, seat, .025, fr);
  vmRod(g, bb, head, .028, fr); vmRod(g, seat, head, o.kind === 'bike' ? .0001 : .024, fr); vmRod(g, head, [wb, r, 0], .022, fr);
  mesh(bx(.24, .05, .1), dark, seat[0] - .02, seat[1] + .05, 0, g, false);
  mesh(bx(.04, .04, .5), dark, head[0] + .02, head[1] + .12, 0, g, false);
  if (o.kind === 'bike') mesh(bx(.26, .16, .26), mat('#8a5a2b'), wb + .08, r + .5, 0, g, false); // cesto
  if (o.kind === 'ebike') mesh(bx(.34, .1, .1), mat('#222'), (bb[0] + seat[0]) / 2, (bb[1] + seat[1]) / 2, 0, g, false).rotation.z = -1.1;
  return g;
}
function vmTrain(col) {
  const g = new T.Group(), body = mat(col, { roughness: .4, metalness: .3 }), yel = mat('#ffcb00', { roughness: .5 }), glass = mat('#14202b', { roughness: .06, metalness: .75 }), roof = mat('#9aa0a6', { metalness: .5 }), dark = mat('#222');
  g.userData.wheels = [];
  const car = (cx, L, loco) => {
    mesh(bx(L, 3, 3.1), body, cx, 2.6, 0, g); mesh(bx(L, .35, 3.12), yel, cx, 1.65, 0, g, false);
    mesh(bx(L - .4, .3, 2.9), roof, cx, 4.25, 0, g);
    mesh(bx(L - (loco ? 5 : 1.2), .9, 3.14), glass, cx - (loco ? 1.5 : 0), 3.1, 0, g, false);
    [-1, 1].forEach(s => { mesh(bx(2.6, .6, 2.6), dark, cx + s * (L / 2 - 2.2), .75, 0, g, false); [-.75, .75].forEach(dx => [-1, 1].forEach(sz => vmWheel(g, cx + s * (L / 2 - 2.2) + dx, .45, sz * .72, .45, .14, g.userData.wheels))); });
    if (loco) {
      const n = mesh(bx(3, 2.6, 3.1), body, cx + L / 2 + 1.2, 2.4, 0, g); mesh(bx(.1, 1.2, 2.6), glass, cx + L / 2 + 2.72, 3.1, 0, g, false).rotation.z = -.3;
      mesh(bx(.1, .4, 3), yel, cx + L / 2 + 2.73, 1.65, 0, g, false);
      [-1, 1].forEach(s => mesh(bx(.06, .25, .4), mat('#fff6c0', { emissive: '#fff6c0', emissiveIntensity: 1 }), cx + L / 2 + 2.76, 2.1, s * 1.1, g, false));
    }
  };
  car(24, 11, true); car(9, 16); car(-8, 16); car(-25, 16);
  return g;
}
function vmPlane(col) {
  const g = new T.Group(), white = mat('#f4f6f8', { roughness: .35, metalness: .25 }), liv = mat(col, { roughness: .35, metalness: .25 }), glass = mat('#14202b', { roughness: .06, metalness: .75 }), grey = mat('#9aa0a6', { metalness: .6 }), dark = mat('#222');
  const f = mesh(new T.CapsuleGeometry(1.4, 15, 6, 14), white, 0, 3.2, 0, g); f.rotation.z = Math.PI / 2; f.scale.set(1, 1, 1);
  mesh(bx(15.5, .5, 2.84), liv, -.3, 2.55, 0, g, false); // faixa da pintura
  for (let i = 0; i < 14; i++) [-1, 1].forEach(s => mesh(bx(.32, .3, .05), glass, -6 + i * .95, 3.6, s * 1.39, g, false));
  mesh(bx(.6, .5, 2.2), glass, 8.4, 3.8, 0, g, false).rotation.z = -.5;
  const w = mesh(bx(3.2, .22, 19), white, -.6, 2.6, 0, g); w.rotation.y = 0;
  [-1, 1].forEach(s => { mesh(cyl(.55, .5, 2.4, 12), grey, .2, 1.9, s * 4.4, g).rotation.z = Math.PI / 2; mesh(bx(.4, 1, .1), liv, -2.1, 3.1, s * 9.4, g, false); });
  const fin = mesh(bx(2.8, 3.4, .22), liv, -8.6, 5.4, 0, g); fin.rotation.z = .35;
  mesh(bx(2, .16, 7), white, -8.9, 3.6, 0, g);
  [[6.5, 0], [-1, 1.4], [-1, -1.4]].forEach(([x, z]) => { mesh(cyl(.06, .06, 1.5, 6), grey, x, 1.1, z, g, false); vmWheel(g, x, .38, z, .38, .26); });
  return g;
}
function vehModel(kind, col) {
  col = col || '#c8102e';
  switch (kind) {
    case 'mini': return vmCar(col, { L: 3.3, H: .66, cl: 1.9, ch: .66, cx: -.25, wr: .32, wx: 1.08, W: 1.7 });
    case 'sedan': return vmCar(col, { L: 4.3, H: .62, cl: 2.2, ch: .6, cx: -.25, wr: .36 });
    case 'ev': return vmCar(col, { L: 4.4, H: .58, cl: 2.6, ch: .56, cx: -.2, wr: .37, ws: .8 });
    case 'suv': return vmCar(col, { L: 4.6, H: .82, cl: 3, ch: .72, cx: -.5, wr: .44, y0: .42, W: 1.95 });
    case 'pickup': { const g = vmCar(col, { L: 5, H: .78, cl: 1.7, ch: .74, cx: .55, wr: .44, y0: .42, W: 1.9 }); [-1, 1].forEach(s => mesh(bx(2.2, .36, .08), mat(col, { roughness: .3, metalness: .4 }), -1.3, 1.4, s * .9, g)); mesh(bx(.08, .36, 1.8), mat(col), -2.45, 1.4, 0, g); return g; }
    case 'sport': { const g = vmCar(col, { L: 4.5, H: .46, cl: 1.7, ch: .42, cx: -.35, wr: .36, y0: .22, W: 1.95, ws: 1 }); mesh(bx(.4, .06, 1.8), mat('#151515'), -2.1, 1.05, 0, g); [-.6, .6].forEach(z => mesh(bx(.06, .3, .06), mat('#151515'), -2.1, .86, z, g)); return g; }
    case 'jeep': { const g = vmCar(col, { L: 4.7, H: .9, cl: 3.2, ch: .8, cx: -.6, wr: .48, y0: .48, W: 2, ws: .2 }); const sp = mesh(cyl(.42, .42, .26, 14), mat('#151515'), -2.5, 1.1, 0, g); sp.rotation.z = Math.PI / 2; mesh(bx(2.6, .08, 1.7), mat('#222'), -.6, 2.3, 0, g, false); return g; }
    case 'van': { const g = vmCar(col, { L: 5, H: 1.6, cl: 0, wr: .4, y0: .36, W: 1.9 }); mesh(bx(5.02, .5, 1.92), mat('#f2f2f2'), 0, 1.5, 0, g, false); mesh(bx(4.2, .5, 1.94), mat('#14202b', { metalness: .7, roughness: .1 }), -.3, 1.62, 0, g, false); mesh(bx(.06, .7, 1.6), mat('#14202b', { metalness: .7, roughness: .1 }), 2.52, 1.6, 0, g, false); return g; }
    case 'scooter': return vmMoto(col, { kind: 'scooter', r: .24, wb: .62, tyre: .08 });
    case 'moto': return vmMoto(col, { kind: 'moto' });
    case 'trail': return vmMoto(col, { kind: 'trail', r: .38, wb: .76, tyre: .1 });
    case 'superbike': return vmMoto(col, { kind: 'superbike', r: .32, wb: .74, tyre: .1 });
    case 'bike': return vmBike(col, { kind: 'bike' });
    case 'bmx': return vmBike(col, { kind: 'bmx', r: .26, wb: .46, tyre: .045, h: .8 });
    case 'btt': return vmBike(col, { kind: 'btt', r: .35, tyre: .055 });
    case 'corrida': return vmBike(col, { kind: 'corrida', r: .35, tyre: .022, h: 1.1 });
    case 'ebike': return vmBike(col, { kind: 'ebike', tyre: .045 });
    case 'train': return vmTrain(col);
    case 'plane': return vmPlane(col);
  }
  return carModel(col);
}

/* =========================================================
   DESTINOS
   ========================================================= */
const TR_ROAD = [
  { id: 'marginal', n: 'Marginal & Ilha de Luanda', km: 18, bio: ['cidade', 'costa'], bike: 1, f: 3, ico: '🌅', d: 'Volta pela baía, a Fortaleza e a Ilha do Cabo',
    acts: [['🍢', 'Espetadas e gelado na Ilha', { felicidade: 3 }, 4000], ['📸', 'Fotos na Fortaleza de São Miguel', { inteligencia: 1, fama: 1 }, 1500], ['🌅', 'Ver o pôr do sol na Marginal', { felicidade: 2, karma: 1 }, 0]] },
  { id: 'kilamba', n: 'Centralidade do Kilamba', km: 28, bio: ['cidade', 'planalto'], bike: 1, f: 2, ico: '🏙️', d: 'Avenidas largas, ciclovia e jardins',
    acts: [['⚽', 'Futebol com a malta do bairro', { saude: 2, felicidade: 2 }, 0], ['🛍️', 'Passear no centro comercial', { felicidade: 2 }, 6000], ['🧺', 'Piquenique no jardim', { felicidade: 3 }, 3000]] },
  { id: 'miradouro', n: 'Miradouro da Lua', km: 40, bio: ['cidade', 'falesia'], bike: 1, f: 5, ico: '🌄', d: 'Falésias vermelhas esculpidas pelo vento e pela chuva',
    acts: [['📸', 'Fotos no miradouro', { felicidade: 3, fama: 1 }, 0], ['🥾', 'Descer o trilho até à praia', { saude: 2, felicidade: 2 }, 0], ['🥥', 'Água de coco na barraca', { felicidade: 2 }, 1000]] },
  { id: 'mussulo', n: 'Mussulo (pela Samba)', km: 45, bio: ['cidade', 'costa'], bike: 1, f: 5, ico: '🏝️', d: 'Restinga de areia branca e águas calmas',
    acts: [['⛵', 'Passeio de barco à vela', { felicidade: 4 }, 15000], ['🦀', 'Caranguejo grelhado à beira-mar', { felicidade: 3, saude: 1 }, 9000], ['🏖️', 'Dormir na rede o dia todo', { felicidade: 3, saude: 1 }, 0]] },
  { id: 'kissama', n: 'Parque Nacional da Quiçama', km: 75, bio: ['cidade', 'savana'], tt: 1, terra: 1, f: 7, ico: '🐘', d: 'Safari com elefantes, palancas e gungas',
    acts: [['🐘', 'Safari guiado ao amanhecer', { felicidade: 5, inteligencia: 2 }, 25000], ['⛺', 'Acampar debaixo das estrelas', { felicidade: 4, saude: 1 }, 8000], ['🌊', 'Ver o rio na Barra do Kwanza', { felicidade: 3 }, 0]] },
  { id: 'caboledo', n: 'Cabo Ledo', km: 120, bio: ['cidade', 'savana', 'costa'], f: 7, ico: '🏄', d: 'As melhores ondas de Angola para o surf',
    acts: [['🏄', 'Aula de surf', { saude: 2, felicidade: 4 }, 20000], ['🐟', 'Peixe grelhado na praia', { felicidade: 3 }, 7000], ['🎶', 'Festa na praia ao fim da tarde', { felicidade: 4, fama: 1 }, 10000]] },
  { id: 'pungo', n: 'Pedras Negras de Pungo Andongo', km: 390, bio: ['savana', 'planalto', 'pedras'], f: 8, ico: '🪨', d: 'Rochedos gigantes e as pegadas lendárias da Rainha Njinga',
    acts: [['🧗', 'Subir às pedras', { saude: 2, felicidade: 3 }, 0], ['👑', 'Ouvir a lenda da Rainha Njinga com um guia', { inteligencia: 3, karma: 1 }, 5000], ['📸', 'Fotos ao pôr do sol', { fama: 1, felicidade: 2 }, 0]] },
  { id: 'calandula', n: 'Quedas de Kalandula (Malanje)', km: 420, bio: ['cidade', 'savana', 'planalto', 'quedas'], f: 10, ico: '💦', d: 'Uma das maiores quedas de água de África, com mais de 100 m',
    acts: [['👀', 'Ver as quedas do miradouro', { felicidade: 5, inteligencia: 1 }, 0], ['🥾', 'Descer até ao fundo da queda', { saude: 2, felicidade: 5 }, 5000], ['🛏️', 'Dormir na pousada com vista', { felicidade: 4, saude: 2 }, 30000]] },
  { id: 'benguela', n: 'Benguela & Restinga do Lobito', km: 540, bio: ['cidade', 'savana', 'costa'], f: 9, ico: '🌴', d: 'Praia Morena, acácias rubras e a Restinga',
    acts: [['🏖️', 'Dia na Praia Morena', { felicidade: 4 }, 0], ['🍲', 'Caldeirada de cabrito', { felicidade: 3 }, 8000], ['🚶', 'Passear na Restinga do Lobito', { felicidade: 3, karma: 1 }, 0]] },
  { id: 'leba', n: 'Serra da Leba (Huíla)', km: 1000, bio: ['savana', 'planalto', 'serra'], f: 12, ico: '⛰️', d: 'A estrada em ziguezague mais famosa de Angola',
    acts: [['👀', 'Miradouro da Serra da Leba', { felicidade: 6 }, 0], ['🏞️', 'Fenda da Tundavala', { felicidade: 5, inteligencia: 1 }, 5000], ['⛪', 'Cristo Rei do Lubango', { karma: 2, felicidade: 3 }, 0]] },
  { id: 'namibe', n: 'Deserto do Namibe', km: 1150, bio: ['serra', 'deserto'], tt: 1, f: 12, ico: '🏜️', d: 'Dunas, a Lagoa do Arco e a misteriosa Welwitschia',
    acts: [['🌿', 'Ver uma Welwitschia com mais de mil anos', { inteligencia: 3 }, 0], ['🏞️', 'Lagoa do Arco', { felicidade: 5 }, 10000], ['🌅', 'Pôr do sol nas dunas de jipe', { felicidade: 6, fama: 1 }, 25000]] },
];
const TR_TREM = [
  { id: 'viana', n: 'Viana', km: 25, bio: ['cidade'], f: 2, ico: '🏘️', d: 'Suburbano: Bungo → Viana, a cada hora',
    acts: [['🧺', 'Compras no mercado do Km 30', { felicidade: 2 }, 5000], ['⚽', 'Ver um jogo do bairro', { felicidade: 2 }, 0], ['🍗', 'Frango no churrasco', { felicidade: 2 }, 3000]] },
  { id: 'catete', n: 'Catete (Ícolo e Bengo)', km: 62, bio: ['cidade', 'savana'], f: 4, ico: '🌾', d: 'Capital da nova província de Ícolo e Bengo',
    acts: [['🏛️', 'Visitar Kaxicane, terra natal de Agostinho Neto', { inteligencia: 3, karma: 1 }, 2000], ['🐟', 'Funge com peixe do rio Bengo', { felicidade: 3 }, 4000], ['🧺', 'Feira de produtos do campo', { felicidade: 2 }, 3000]] },
  { id: 'zenza', n: 'Zenza do Itombe', km: 140, bio: ['savana', 'floresta'], f: 5, ico: '🌳', d: 'Pequena vila à beira do rio Kwanza',
    acts: [['🎣', 'Pescar no rio Kwanza', { felicidade: 3, saude: 1 }, 0], ['🥭', 'Comprar fruta fresca na estação', { felicidade: 2, saude: 1 }, 1500], ['📖', 'Conversar com os mais-velhos da vila', { inteligencia: 2, karma: 1 }, 0]] },
  { id: 'ndalatando', n: "N'dalatando (Cuanza Norte)", km: 250, bio: ['savana', 'floresta', 'planalto'], f: 7, ico: '☕', d: 'Jardim Botânico e as antigas roças de café',
    acts: [['🌺', 'Jardim Botânico', { inteligencia: 2, felicidade: 3 }, 2000], ['☕', 'Visitar uma roça de café', { inteligencia: 2, felicidade: 2 }, 5000], ['🌧️', 'Passear na serra verde e fresca', { saude: 2, felicidade: 2 }, 0]] },
  { id: 'malanje', n: 'Malanje', km: 424, bio: ['savana', 'floresta', 'planalto'], f: 9, ico: '🚉', d: 'Fim da linha: porta para Kalandula e Pungo Andongo',
    acts: [['💦', 'Excursão às Quedas de Kalandula', { felicidade: 6 }, 15000], ['🪨', 'Excursão às Pedras Negras', { inteligencia: 2, felicidade: 3 }, 12000], ['🧺', 'Mercado de Malanje', { felicidade: 2 }, 3000]] },
];
const TR_CLS_T = [['seg', '2.ª classe', 1, 0], ['pri', '1.ª classe', 2, 2], ['exe', 'Executiva', 4, 4]];
const TR_VOO = [
  { id: 'catumbela', n: 'Benguela (Catumbela)', km: 400, p: 65000, bio: 'costa', ico: '🌴', f: 6, d: 'Praias, acácias rubras e o Lobito',
    acts: [['🏖️', 'Praia da Caotinha', { felicidade: 4 }, 0], ['🍲', 'Caldeirada no Lobito', { felicidade: 3 }, 8000], ['🚂', 'Ver o Caminho de Ferro de Benguela', { inteligencia: 2 }, 0]] },
  { id: 'lubango', n: 'Lubango (Huíla)', km: 750, p: 95000, bio: 'serra', ico: '⛰️', f: 8, d: 'Cristo Rei, Tundavala e o clima fresco da serra',
    acts: [['⛪', 'Cristo Rei', { karma: 2, felicidade: 3 }, 0], ['🏞️', 'Fenda da Tundavala', { felicidade: 5 }, 5000], ['🐄', 'Churrasco de carne da Huíla', { felicidade: 3 }, 9000]] },
  { id: 'namibe', n: 'Moçâmedes (Namibe)', km: 870, p: 105000, bio: 'deserto', ico: '🏜️', f: 9, d: 'O deserto encontra o mar',
    acts: [['🌿', 'Welwitschia mirabilis', { inteligencia: 3 }, 0], ['🏞️', 'Lagoa do Arco', { felicidade: 5 }, 10000], ['🐟', 'Peixe seco e lagosta', { felicidade: 3 }, 12000]] },
  { id: 'huambo', n: 'Huambo', km: 520, p: 80000, bio: 'planalto', ico: '🌾', f: 6, d: 'O Planalto Central e a cidade das flores',
    acts: [['🌸', 'Passear na cidade jardim', { felicidade: 3 }, 0], ['🏔️', 'Subir ao Morro do Moco', { saude: 3, felicidade: 4 }, 8000], ['🥔', 'Feira agrícola do planalto', { inteligencia: 1, felicidade: 2 }, 3000]] },
  { id: 'cabinda', n: 'Cabinda', km: 420, p: 70000, bio: 'floresta', ico: '🌳', f: 7, d: 'A floresta do Maiombe e as praias do norte',
    acts: [['🦍', 'Trilho na floresta do Maiombe', { felicidade: 5, inteligencia: 2 }, 15000], ['🏖️', 'Praia de Cabinda', { felicidade: 3 }, 0], ['🍫', 'Provar cacau e chikuanga', { felicidade: 2 }, 3000]] },
  { id: 'saurimo', n: 'Saurimo (Lunda Sul)', km: 800, p: 98000, bio: 'savana', ico: '💎', f: 6, d: 'Terra dos diamantes e da cultura Cokwe',
    acts: [['🎭', 'Máscaras e danças Cokwe', { inteligencia: 3, felicidade: 2 }, 3000], ['💎', 'Visitar uma feira de artesanato', { felicidade: 2 }, 5000], ['🌳', 'Passear no parque da cidade', { felicidade: 2 }, 0]] },
  { id: 'menongue', n: 'Menongue (Cuando Cubango)', km: 900, p: 110000, bio: 'savana', ico: '🦁', f: 8, d: 'Rios, savana sem fim e vida selvagem',
    acts: [['🛶', 'Canoa no rio Cuebe', { felicidade: 4 }, 8000], ['🦓', 'Safari fotográfico', { felicidade: 5, fama: 1 }, 20000], ['🍯', 'Mel e peixe do rio', { felicidade: 2 }, 3000]] },
  { id: 'saotome', n: 'São Tomé', km: 800, p: 280000, int: 1, pais: 'São Tomé e Príncipe', bio: 'costa', ico: '🏝️', f: 10, d: 'Ilhas verdes, cacau e praias de sonho',
    acts: [['🍫', 'Roça de cacau', { inteligencia: 2, felicidade: 3 }, 15000], ['🏖️', 'Praia Jalé', { felicidade: 5 }, 0], ['🐢', 'Ver tartarugas a desovar', { felicidade: 4, karma: 2 }, 10000]] },
  { id: 'windhoek', n: 'Windhoek', km: 1560, p: 380000, int: 1, pais: 'Namíbia', bio: 'deserto', ico: '🏜️', f: 10, d: 'Capital limpa e moderna às portas do deserto',
    acts: [['🦒', 'Safari no Etosha', { felicidade: 6, inteligencia: 2 }, 90000], ['🏜️', 'Dunas de Sossusvlei', { felicidade: 6 }, 70000], ['🍖', 'Mercado e churrasco', { felicidade: 3 }, 15000]] },
  { id: 'joburg', n: 'Joanesburgo', km: 2600, p: 520000, int: 1, pais: 'África do Sul', bio: 'cidadeX', ico: '🏙️', f: 10, d: 'Arranha-céus, compras e história',
    acts: [['🏛️', 'Museu do Apartheid', { inteligencia: 4, karma: 1 }, 20000], ['🛍️', 'Compras em Sandton', { felicidade: 4, aparencia: 1 }, 150000], ['🦁', 'Safari perto da cidade', { felicidade: 5 }, 60000]] },
  { id: 'cabo', n: 'Cidade do Cabo', km: 3000, p: 600000, int: 1, pais: 'África do Sul', bio: 'serra', ico: '🏔️', f: 12, d: 'A Montanha da Mesa e o oceano',
    acts: [['🚡', 'Subir à Montanha da Mesa', { felicidade: 6 }, 40000], ['🐧', 'Pinguins na praia', { felicidade: 5 }, 15000], ['🍷', 'Jantar no porto', { felicidade: 4 }, 50000]] },
  { id: 'lisboa', n: 'Lisboa', km: 6550, p: 950000, int: 1, pais: 'Portugal', bio: 'europa', ico: '🏰', f: 12, d: 'Elétricos amarelos, pastéis e a diáspora angolana',
    acts: [['🚋', 'Passear de elétrico pelas colinas', { felicidade: 5 }, 8000], ['👨‍👩‍👧', 'Visitar família na diáspora', { felicidade: 5, karma: 2 }, 0], ['🎶', 'Noite de kizomba angolana em Lisboa', { felicidade: 5, fama: 1 }, 20000]] },
  { id: 'saopaulo', n: 'São Paulo', km: 6200, p: 1100000, int: 1, pais: 'Brasil', bio: 'cidadeX', ico: '🌎', f: 12, d: 'A metrópole gigante do Brasil',
    acts: [['🎨', 'Avenida Paulista e museus', { inteligencia: 3, felicidade: 3 }, 20000], ['⚽', 'Jogo no estádio', { felicidade: 6 }, 45000], ['🥩', 'Rodízio de churrasco', { felicidade: 4 }, 30000]] },
  { id: 'dubai', n: 'Dubai', km: 7300, p: 1200000, int: 1, pais: 'Emirados Árabes Unidos', bio: 'dubai', ico: '🏙️', f: 13, d: 'O prédio mais alto do mundo e o deserto',
    acts: [['🏙️', 'Subir ao prédio mais alto do mundo', { felicidade: 6, fama: 1 }, 90000], ['🐪', 'Safari no deserto', { felicidade: 5 }, 60000], ['🛍️', 'Compras no mega centro comercial', { felicidade: 4, aparencia: 2 }, 250000]] },
];
const TR_CLS_V = [['eco', 'Económica', 1, 0], ['exe', 'Executiva', 2.8, 3], ['pri', 'Primeira', 5, 6]];

/* =========================================================
   EVENTOS A MEIO DA VIAGEM
   ========================================================= */
const TR_EV = {
  road: [
    { id: 'stop', t: '👮 Operação STOP! Um agente pede os documentos e fala numa "gasosa".', c: [['Mostrar os documentos', () => G.carta || VEIC[TR.veh || 'bike'].cat === 'bike' || (TR.veh && !VEIC[TR.veh].carta) ? ['Tudo em ordem. O agente deseja boa viagem.', { karma: 1 }] : ['Sem carta! Multa de 30.000 Kz.', { dinheiro: -30000, felicidade: -2 }]], ['Dar 5.000 Kz de gasosa', () => chance(.2) ? ['Era uma operação anticorrupção! Multa pesada.', { dinheiro: -55000, fama: -2, karma: -3 }] : ['Ele aceitou e deixou-te passar…', { dinheiro: -5000, karma: -3 }]]] },
    { id: 'furo', t: '🛞 Pneu furado no meio da estrada!', c: [['Trocar tu mesmo', () => ['Mãos sujas, mas resolveste sozinho(a).', { inteligencia: 1, saude: -1 }]], ['Chamar um mecânico de rua (8.000 Kz)', () => ['O kota mecânico trocou num instante.', { dinheiro: -8000 }]]] },
    { id: 'boleia', t: '🙋 Uma senhora com sacos de mandioca pede boleia.', c: [['Dar boleia', () => chance(.4) ? ['Ela ofereceu-te mandioca e muitas bênçãos!', { karma: 3, felicidade: 2 }] : ['Foi a contar histórias o caminho todo.', { karma: 3 }]], ['Seguir viagem', () => ['Seguiste… e ficaste com a consciência pesada.', { karma: -1 }]]] },
    { id: 'zunga', t: '🥭 Na paragem, zungueiras vendem jinguba, mangas e água fresca.', c: [['Comprar lanche (2.000 Kz)', () => ['Manga docinha e jinguba torrada!', { dinheiro: -2000, felicidade: 2, saude: 1 }]], ['Só uma água (300 Kz)', () => ['Água fresquinha. Siga!', { dinheiro: -300 }]]] },
    { id: 'chuva', t: '🌧️ Chuvada tropical! A estrada parece um rio.', c: [['Abrandar e ligar os quatro piscas', () => ['Chegaste mais tarde, mas em segurança.', { karma: 1 }]], ['Manter a velocidade', () => chance(.28) ? (vhSeguro() ? ['Despiste! O seguro pagou o arranjo.', { saude: -6, felicidade: -3 }] : ['Despiste! Arranjo caro e uns arranhões.', { saude: -8, dinheiro: -120000, felicidade: -4 }]) : ['Correu bem… desta vez.', { felicidade: 1 }]]] },
    { id: 'miradouro', t: '📸 Há um miradouro com uma vista incrível.', c: [['Parar 10 minutos', () => ['Que vista! Valeu a pena.', { felicidade: 3 }]], ['Seguir, que está tarde', () => ['Fica para a próxima.', {}]]] },
    { id: 'radar', t: '📡 Radar de velocidade escondido atrás de um embondeiro!', c: [['Travar a tempo', () => ['Ufa, passaste dentro do limite.', {}]], ['Arriscar', () => chance(.5) ? ['Flash! Multa de 25.000 Kz.', { dinheiro: -25000, felicidade: -2 }] : ['Escapaste… por pouco.', { felicidade: 1, karma: -1 }]]] },
    { id: 'avaria', t: '🌡️ O motor começa a aquecer…', ok: () => TR.veh && !VEIC[TR.veh].ev && vhG().rev !== G.ano, c: [['Parar e deixar arrefecer', () => ['Esperaste meia hora à sombra de uma mulemba.', { felicidade: -1 }]], ['Continuar a abrir', () => chance(.4) ? ['O motor gripou! Reboque e oficina.', { dinheiro: -70000, felicidade: -4 }] : ['Aguentou até ao fim.', {}]]] },
    { id: 'animais', t: '🦌 Uma manada de palancas atravessa a estrada!', bio: ['savana', 'planalto', 'pedras'], c: [['Parar e fotografar', () => ['Fotos incríveis da palanca!', { felicidade: 3, fama: G.tel >= 2 ? 1 : 0 }]], ['Buzinar', () => ['Os animais fugiram assustados.', { karma: -2 }]]] },
    { id: 'kupapata', t: '🧍 Um senhor acena: quer ir para o mesmo lado e paga 3.000 Kz.', kind: 'moto', c: [['Levar o passageiro', () => ['Ganhaste uns trocos pelo caminho.', { dinheiro: 3000 }]], ['Não, estou a passear', () => ['Hoje é só lazer.', {}]]] },
    { id: 'bomba', t: '⛽ Na bomba de combustível, alguém muito simpático puxa conversa.', ok: () => G.idade >= 18 && !G.parceiro, c: [['Trocar números', () => ['Ficaram a falar no Fala Já a viagem toda!', { felicidade: 3 }]], ['Sorrir e seguir', () => ['Um sorriso também alegra o dia.', { felicidade: 1 }]]] },
  ],
  bike: [
    { id: 'sede', t: '🥵 Está um calor de 34 °C e a água acabou.', c: [['Comprar água a uma zungueira (300 Kz)', () => ['Salvaste-te!', { dinheiro: -300, saude: 1 }]], ['Aguentar até ao fim', () => ['Chegaste a desidratar…', { saude: -3 }]]] },
    { id: 'subida', t: '⛰️ Uma subida enorme pela frente!', c: [['Dar tudo nos pedais', () => G.stats.saude > 60 ? ['Subiste sem parar! Pernas de aço.', { saude: 2, felicidade: 2 }] : ['Ficaste sem fôlego a meio…', { saude: -2 }]], ['Empurrar a bicicleta', () => ['Devagar se vai ao longe.', {}]]] },
    { id: 'corrente', t: '⛓️ Saltou a corrente da bicicleta!', c: [['Arranjar com as mãos', () => ['Aprendeste mecânica à força.', { inteligencia: 1 }]], ['Pedir ajuda a um mecânico (1.000 Kz)', () => ['Arranjado num minuto.', { dinheiro: -1000 }]]] },
    { id: 'grupo', t: '🚴 Um grupo de ciclistas convida-te a pedalar com eles.', c: [['Juntar-me ao grupo', () => ['Novos amigos e um ritmo forte!', { felicidade: 3, saude: 1 }]], ['Seguir sozinho(a)', () => ['Tu e a estrada.', {}]]] },
    { id: 'buraco', t: '🕳️ Um buraco enorme no asfalto!', c: [['Desviar com cuidado', () => ['Bem visto.', {}]], ['Saltar por cima', () => TR.veh === 'bmx' || TR.veh === 'btt' ? ['Salto perfeito! Alguém filmou.', { felicidade: 3, fama: 1 }] : chance(.45) ? ['Caíste! Joelho esfolado.', { saude: -5 }] : ['Saltaste! Por pouco.', { felicidade: 2 }]]] },
  ],
  train: [
    { id: 'vend', t: '🧃 Passa um vendedor com bolinhos, sumos e jinguba.', c: [['Comprar (1.500 Kz)', () => ['Lanche no comboio sabe sempre melhor.', { dinheiro: -1500, felicidade: 2 }]], ['Não, obrigado', () => ['Poupaste o kumbu.', {}]]] },
    { id: 'kota', t: '👴 Um mais-velho conta histórias da linha de Malanje de antigamente.', c: [['Ouvir com atenção', () => ['Aprendeste muito sobre a história do país.', { inteligencia: 2, karma: 1 }]], ['Pôr os auriculares', () => ['Música no máximo.', { felicidade: 1 }]]] },
    { id: 'para', t: '⏸️ O comboio para no meio da savana: manutenção da via.', c: [['Esperar sentado', () => ['Quarenta minutos depois, seguiu.', { felicidade: -1 }]], ['Descer para esticar as pernas', () => ['Fotos lindas ao lado da linha!', { felicidade: 2 }]]] },
    { id: 'revisor', t: '🎫 O revisor oferece upgrade para a 1.ª classe por 3.000 Kz.', ok: () => TR.cls === 'seg', c: [['Aceitar', () => ['Cadeira larga e ar condicionado!', { dinheiro: -3000, felicidade: 3 }]], ['Fico onde estou', () => ['Mais animado aqui atrás.', { felicidade: 1 }]]] },
    { id: 'crianca', t: '👦 Uma criança está perdida da mãe na carruagem.', c: [['Ajudar a encontrar a mãe', () => ['A mãe agradeceu-te em lágrimas.', { karma: 4 }]], ['Chamar o revisor', () => ['O revisor tratou do assunto.', { karma: 1 }]]] },
  ],
  plane: [
    { id: 'turb', t: '🌀 Turbulência forte! O avião abana muito.', c: [['Apertar o cinto e respirar fundo', () => ['Passou. Coração aos saltos.', {}]], ['Agarrar a mão do vizinho', () => ['Ele riu-se e ficaram amigos.', { felicidade: 2 }]]] },
    { id: 'comida', t: '🍽️ Hora da refeição: frango com arroz ou peixe com funge?', c: [['Frango com arroz', () => ['Nada mau para comida de avião!', { felicidade: 1 }]], ['Peixe com funge', () => ['Sabor de casa, lá em cima!', { felicidade: 2 }]]] },
    { id: 'famoso', t: '🌟 Um artista famoso de kuduro está no teu voo!', c: [['Pedir uma selfie', () => G.tel >= 2 ? ['A selfie bombou nas redes!', { fama: 2, felicidade: 2 }] : ['Sem câmara… só um autógrafo.', { felicidade: 2 }]], ['Deixar o homem descansar', () => ['Ele reparou e agradeceu com um aceno.', { karma: 1 }]]] },
    { id: 'upg', t: '💺 A tripulação oferece upgrade para executiva por 50.000 Kz.', ok: () => TR.cls === 'eco', c: [['Aceitar', () => ['Champanhe, cadeira-cama e silêncio.', { dinheiro: -50000, felicidade: 4 }]], ['Recusar', () => ['Económica também chega.', {}]]] },
    { id: 'rio', t: '🏞️ Lá em baixo, o rio Kwanza serpenteia pela savana.', c: [['Tirar uma foto pela janela', () => ['Foto do ano!', { felicidade: 2, fama: G.tel >= 2 ? 1 : 0 }]], ['Dormir um bocado', () => ['Uma soneca nas nuvens.', { saude: 1 }]]] },
  ],
};
function vhSeguro() { return vhG().seg === G.ano; }

/* =========================================================
   DESENHO DA VIAGEM (canvas 2D com paralaxe)
   ========================================================= */
let TR = null;
const trRnd = (i, s) => { let h = Math.imul(i | 0, 374761393) ^ Math.imul((s | 0) + 1, 668265263); h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const trHex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const trMix = (a, b, k) => { const A = trHex(a), B = trHex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
const TR_SKY = [[0, '#070b1e', '#18264a'], [.22, '#0b1430', '#1d2c55'], [.27, '#3b3f78', '#f39a5b'], [.33, '#4f8fd8', '#ffd9a0'], [.42, '#2f7fdc', '#a9d6ff'], [.66, '#2f7fdc', '#b5dcff'], [.74, '#5a4a9a', '#ff8a4a'], [.79, '#1c1f4a', '#7a3a5a'], [.84, '#0b1430', '#1d2c55'], [1, '#070b1e', '#18264a']];
function trSky(tod) { let i = 0; while (i < TR_SKY.length - 2 && TR_SKY[i + 1][0] <= tod) i++; const a = TR_SKY[i], b = TR_SKY[i + 1], k = (tod - a[0]) / (b[0] - a[0] || 1); return [trMix(a[1], b[1], k), trMix(a[2], b[2], k)]; }
function trNight(tod) { if (tod > .3 && tod < .72) return 0; if (tod >= .22 && tod <= .3) return (.3 - tod) / .08; if (tod >= .72 && tod <= .82) return (tod - .72) / .1; return 1; }
function trLayer(sc, f, S, seed, W, fn) { const off = sc * f, i0 = Math.floor(off / S) - 1, i1 = Math.ceil((off + W) / S) + 1; for (let i = i0; i <= i1; i++) fn(i * S - off, trRnd(i, seed), i); }
function trPoly(x, pts, col) { x.fillStyle = col; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fill(); }
function trCirc(x, cx, cy, r, col) { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, Math.max(.5, r), 0, 7); x.fill(); }
function trPalm(x, px, gy, s, h) {
  x.strokeStyle = '#7a5a3a'; x.lineWidth = 7 * s; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, gy); x.quadraticCurveTo(px + 14 * s, gy - h * .5, px + 6 * s, gy - h); x.stroke();
  x.strokeStyle = '#2f7a3a'; x.lineWidth = 6 * s; for (let k = 0; k < 7; k++) { const a = -Math.PI + k * Math.PI / 6; x.beginPath(); x.moveTo(px + 6 * s, gy - h); x.quadraticCurveTo(px + 6 * s + Math.cos(a) * 30 * s, gy - h - 16 * s, px + 6 * s + Math.cos(a) * 52 * s, gy - h + Math.abs(Math.sin(a)) * 4 * s + 16 * s); x.stroke(); }
}
function trBaobab(x, px, gy, s, r) {
  const h = (90 + r * 60) * s, w = (26 + r * 14) * s;
  trPoly(x, [[px - w, gy], [px - w * .55, gy - h], [px + w * .55, gy - h], [px + w, gy]], '#8a6a52');
  x.strokeStyle = '#7a5a44'; x.lineWidth = 6 * s; x.lineCap = 'round';
  for (let k = 0; k < 6; k++) { const a = -Math.PI * (.15 + k * .14); x.beginPath(); x.moveTo(px, gy - h + 4 * s); x.lineTo(px + Math.cos(a) * 46 * s, gy - h + Math.sin(a) * 30 * s); x.stroke(); trCirc(x, px + Math.cos(a) * 46 * s, gy - h + Math.sin(a) * 30 * s, 11 * s, '#5f8a3a'); }
}
function trAcacia(x, px, gy, s, r) { const h = (70 + r * 40) * s; x.strokeStyle = '#5a4030'; x.lineWidth = 5 * s; x.beginPath(); x.moveTo(px, gy); x.lineTo(px + 6 * s, gy - h); x.stroke(); x.fillStyle = '#6b8e3a'; x.beginPath(); x.ellipse(px + 6 * s, gy - h, 50 * s, 13 * s, 0, 0, 7); x.fill(); }
function trTree(x, px, gy, s, h, col) { x.fillStyle = '#5a4030'; x.fillRect(px - 4 * s, gy - h, 8 * s, h); trCirc(x, px, gy - h, h * .35, col); trCirc(x, px - h * .22, gy - h * .85, h * .26, col); trCirc(x, px + h * .22, gy - h * .85, h * .26, col); }
function trAnimal(x, px, gy, s, kind, t) {
  const b = Math.sin(t * 8 + px) * 2 * s;
  if (kind === 'ele') { trCirc(x, px, gy - 46 * s, 34 * s, '#8d8a86'); trCirc(x, px + 34 * s, gy - 54 * s, 18 * s, '#8d8a86'); x.fillStyle = '#8d8a86'; [-22, -6, 10, 24].forEach(o => x.fillRect(px + o * s, gy - 26 * s, 10 * s, 26 * s + (o % 2 ? b : -b))); x.strokeStyle = '#8d8a86'; x.lineWidth = 7 * s; x.beginPath(); x.moveTo(px + 46 * s, gy - 52 * s); x.quadraticCurveTo(px + 56 * s, gy - 20 * s, px + 48 * s, gy - 10 * s); x.stroke(); x.strokeStyle = '#f2efe6'; x.lineWidth = 3 * s; x.beginPath(); x.moveTo(px + 40 * s, gy - 44 * s); x.lineTo(px + 52 * s, gy - 38 * s); x.stroke(); return; }
  // palanca negra
  x.fillStyle = '#2a211c'; x.beginPath(); x.ellipse(px, gy - 34 * s, 26 * s, 12 * s, 0, 0, 7); x.fill();
  [-18, -10, 12, 20].forEach(o => x.fillRect(px + o * s, gy - 26 * s, 3.5 * s, 26 * s + (o % 4 ? b : -b)));
  x.beginPath(); x.ellipse(px + 30 * s, gy - 48 * s, 7 * s, 10 * s, .4, 0, 7); x.fill(); x.fillRect(px + 18 * s, gy - 48 * s, 9 * s, 16 * s);
  x.fillStyle = '#f2efe6'; x.fillRect(px + 30 * s, gy - 44 * s, 6 * s, 4 * s);
  x.strokeStyle = '#2a211c'; x.lineWidth = 3 * s; x.beginPath(); x.moveTo(px + 28 * s, gy - 56 * s); x.quadraticCurveTo(px + 14 * s, gy - 90 * s, px - 6 * s, gy - 78 * s); x.stroke();
}
function trHills(x, W, base, amp, f, sc, col, seed, wl) { x.fillStyle = col; x.beginPath(); x.moveTo(0, base + amp * 3); for (let X = 0; X <= W + 20; X += 20) { const u = (X + sc * f) / (wl || 300); x.lineTo(X, base - amp * (.6 + .4 * Math.sin(u + seed) * Math.sin(u * .37 + seed * 2))); } x.lineTo(W, base + amp * 3); x.closePath(); x.fill(); }

/* um "bioma": fundo + camada média; L = pass de luzes (depois do escurecer da noite) */
function trBiome(x, k, W, H, sc, t, hz, s, L) {
  const gy = hz;
  switch (k) {
    case 'cidade': case 'cidadeX': {
      const X = k === 'cidadeX';
      trLayer(sc, .05, 64 * s, X ? 7 : 3, W, (px, r, i) => {
        const w = (40 + r * 46) * s, h = (X ? 160 + trRnd(i, 9) * 300 : 70 + trRnd(i, 9) * 200) * s;
        if (!L) { x.fillStyle = X ? ['#5f7894', '#7d93ad', '#4a6280', '#8fa6bf'][i & 3] : ['#8a9bb0', '#a5b4c4', '#7586a0', '#b9c3cf'][i & 3]; x.fillRect(px, gy - h, w, h + 4); if (X && r > .7) { x.fillRect(px + w / 2 - 2 * s, gy - h - 40 * s, 4 * s, 40 * s); } }
        else for (let yy = gy - h + 10 * s; yy < gy - 6 * s; yy += 13 * s) for (let xx = px + 5 * s; xx < px + w - 6 * s; xx += 10 * s) if (trRnd(i * 97 + Math.round(yy), Math.round(xx)) > .55) { x.fillStyle = '#ffd77a'; x.fillRect(xx, yy, 4 * s, 5 * s); }
      });
      trLayer(sc, .3, 170 * s, 11, W, (px, r, i) => {
        if (L) { if (r < .55) { x.fillStyle = '#ffe2a0'; x.fillRect(px + 30 * s, gy + 18 * s - 34 * s, 12 * s, 12 * s); } return; }
        if (i % 7 === 0 && TR.ads.length) { const a = TR.ads[Math.abs(i) % TR.ads.length]; x.fillStyle = '#555'; x.fillRect(px + 60 * s, gy - 30 * s, 6 * s, 50 * s); x.fillRect(px + 130 * s, gy - 30 * s, 6 * s, 50 * s); x.drawImage(a, px + 30 * s, gy - 110 * s, 140 * s, 70 * s); return; }
        if (r < .55) { const w = (90 + r * 60) * s, h = (50 + trRnd(i, 4) * 50) * s, c = ['#f2c14e', '#e76f51', '#f4a261', '#2a9d8f', '#e9c46a', '#d0d6dc', '#9d4edd'][Math.abs(i) % 7]; x.fillStyle = c; x.fillRect(px, gy + 18 * s - h, w, h); x.fillStyle = '#7a7f84'; x.fillRect(px - 4 * s, gy + 18 * s - h - 6 * s, w + 8 * s, 7 * s); x.fillStyle = '#2a3d52'; x.fillRect(px + 30 * s, gy + 18 * s - 34 * s, 12 * s, 12 * s); x.fillRect(px + 60 * s, gy + 18 * s - 34 * s, 12 * s, 12 * s); x.fillStyle = '#4a2e1a'; x.fillRect(px + 12 * s, gy + 18 * s - 26 * s, 12 * s, 26 * s); }
        else trPalm(x, px + 40 * s, gy + 20 * s, s, (80 + r * 40) * s);
      });
      break;
    }
    case 'costa': case 'falesia': {
      if (!L) {
        const sg = x.createLinearGradient(0, gy - 30 * s, 0, gy + 30 * s); sg.addColorStop(0, '#1f6fa8'); sg.addColorStop(1, '#3fb0d8'); x.fillStyle = sg; x.fillRect(0, gy - 26 * s, W, 60 * s);
        x.fillStyle = 'rgba(255,255,255,.55)'; trLayer(sc, .04, 40 * s, 5, W, (px, r) => x.fillRect(px, gy - 20 * s + r * 40 * s, 14 * s * r, 2 * s));
        trLayer(sc, .02, 600 * s, 6, W, (px, r) => { if (r > .5) return; trPoly(x, [[px, gy - 22 * s], [px + 40 * s, gy - 22 * s], [px + 34 * s, gy - 14 * s], [px + 6 * s, gy - 14 * s]], '#f2f2f2'); x.fillStyle = '#c8102e'; x.fillRect(px + 14 * s, gy - 34 * s, 4 * s, 12 * s); });
        if (k === 'falesia') trLayer(sc, .12, 90 * s, 12, W, (px, r, i) => { const h = (60 + r * 90) * s; trPoly(x, [[px - 10 * s, gy + 20 * s], [px + 6 * s, gy - h], [px + 18 * s, gy - h * .8], [px + 26 * s, gy - h * 1.05], [px + 40 * s, gy - h * .7], [px + 54 * s, gy - h * .9], [px + 100 * s, gy + 20 * s]], ['#c4572e', '#d9773e', '#b5482a'][Math.abs(i) % 3]); x.fillStyle = 'rgba(255,255,255,.15)'; for (let q = 0; q < 4; q++) x.fillRect(px + q * 18 * s, gy - h * .6 + q * 8 * s, 3 * s, h * .5); });
        x.fillStyle = '#ecd9a6'; x.fillRect(0, gy + 18 * s, W, 30 * s);
        trLayer(sc, .3, 160 * s, 13, W, (px, r, i) => { if (r < .6) trPalm(x, px, gy + 34 * s, s, (80 + r * 50) * s); else if (r < .8) { trPoly(x, [[px, gy + 30 * s], [px + 50 * s, gy + 30 * s], [px + 25 * s, gy - 10 * s]], '#c99a52'); x.fillStyle = '#7a5a3a'; x.fillRect(px + 23 * s, gy, 4 * s, 30 * s); } else { trPoly(x, [[px, gy + 30 * s], [px + 60 * s, gy + 30 * s], [px + 52 * s, gy + 40 * s], [px + 8 * s, gy + 40 * s]], '#2a7ab0'); } });
      }
      break;
    }
    case 'savana': case 'pedras': {
      if (!L) {
        trHills(x, W, gy, 26 * s, .04, sc, '#c9a36a', 1, 260 * s);
        if (k === 'pedras') trLayer(sc, .1, 220 * s, 21, W, (px, r) => { const h = (80 + r * 110) * s; x.fillStyle = '#2f2b2a'; x.beginPath(); x.ellipse(px, gy + 10 * s, (50 + r * 40) * s, h, 0, Math.PI, 0); x.fill(); x.fillStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.ellipse(px - 14 * s, gy - h * .5, 10 * s, h * .4, 0, 0, 7); x.fill(); });
        trLayer(sc, .3, 190 * s, 14, W, (px, r, i) => { if (r < .35) trBaobab(x, px, gy + 26 * s, s, r); else if (r < .7) trAcacia(x, px, gy + 26 * s, s, r); else if (r < .8) trAnimal(x, px, gy + 26 * s, s, Math.abs(i) % 3 ? 'pal' : 'ele', t); });
        x.fillStyle = '#b8945a'; trLayer(sc, .7, 30 * s, 15, W, (px, r) => { x.fillRect(px, gy + 40 * s + r * 20 * s, 2 * s, -10 * s * r); x.fillRect(px + 4 * s, gy + 40 * s + r * 20 * s, 2 * s, -14 * s * r); });
      }
      break;
    }
    case 'planalto': {
      if (!L) {
        trHills(x, W, gy - 6 * s, 40 * s, .04, sc, '#6f9f55', 2, 320 * s); trHills(x, W, gy + 10 * s, 26 * s, .1, sc, '#86b862', 4, 200 * s);
        trLayer(sc, .3, 120 * s, 16, W, (px, r, i) => {
          if (r < .45) { const h = (110 + r * 60) * s; x.fillStyle = '#d8cfc0'; x.fillRect(px - 2.5 * s, gy + 26 * s - h, 5 * s, h); x.fillStyle = '#4f7a4a'; x.beginPath(); x.ellipse(px, gy + 26 * s - h, 16 * s, 34 * s, 0, 0, 7); x.fill(); }
          else if (r < .7) { x.fillStyle = '#b06a3a'; x.beginPath(); x.ellipse(px, gy + 20 * s, 22 * s, 18 * s, 0, Math.PI, 0); x.fill(); x.fillRect(px - 22 * s, gy + 20 * s, 44 * s, 8 * s); trPoly(x, [[px - 30 * s, gy + 6 * s], [px, gy - 30 * s], [px + 30 * s, gy + 6 * s]], '#c9a050'); x.fillStyle = '#3a2416'; x.fillRect(px - 5 * s, gy + 12 * s, 10 * s, 16 * s); }
        });
      }
      break;
    }
    case 'serra': {
      if (!L) {
        trLayer(sc, .03, 300 * s, 17, W, (px, r, i) => { const h = (180 + r * 120) * s; trPoly(x, [[px - 200 * s, gy + 10 * s], [px, gy - h], [px + 200 * s, gy + 10 * s]], '#5b6f8a'); trPoly(x, [[px - 40 * s, gy - h * .8], [px, gy - h], [px + 40 * s, gy - h * .8], [px + 10 * s, gy - h * .75]], '#7d8fa6'); if (i % 3 === 0) { x.strokeStyle = 'rgba(240,230,210,.7)'; x.lineWidth = 2.5 * s; x.beginPath(); for (let z = 0; z < 7; z++) { const yy = gy - h * .1 - z * h * .1, wv = (90 - z * 11) * s; x.lineTo(px + (z % 2 ? wv : -wv), yy); } x.stroke(); } });
        trHills(x, W, gy + 6 * s, 50 * s, .1, sc, '#7a8f6a', 5, 220 * s);
        trLayer(sc, .3, 140 * s, 18, W, (px, r) => { if (r < .4) { x.fillStyle = '#8a8478'; x.beginPath(); x.ellipse(px, gy + 26 * s, 26 * s * (r + .6), 16 * s, 0, Math.PI, 0); x.fill(); } else if (r < .7) { x.strokeStyle = '#4f7a4a'; x.lineWidth = 4 * s; for (let q = -3; q <= 3; q++) { x.beginPath(); x.moveTo(px, gy + 26 * s); x.lineTo(px + q * 8 * s, gy - 10 * s - Math.abs(3 - Math.abs(q)) * 8 * s); x.stroke(); } } });
      }
      break;
    }
    case 'deserto': case 'dubai': {
      if (!L) {
        trHills(x, W, gy - 4 * s, 34 * s, .04, sc, '#e6b071', 3, 360 * s);
        if (k === 'dubai') trLayer(sc, .06, 70 * s, 22, W, (px, r, i) => { const tall = Math.abs(i) % 11 === 0, h = (tall ? 420 : 120 + r * 220) * s, w = (tall ? 30 : 30 + r * 30) * s; const g = x.createLinearGradient(px, 0, px + w, 0); g.addColorStop(0, '#9fc3dc'); g.addColorStop(1, '#5d87a8'); x.fillStyle = g; if (tall) trPoly(x, [[px, gy], [px + w * .3, gy - h], [px + w * .5, gy - h - 60 * s], [px + w * .7, gy - h], [px + w, gy]], g); else x.fillRect(px, gy - h, w, h); });
        trHills(x, W, gy + 14 * s, 22 * s, .12, sc, '#d99a5a', 6, 240 * s);
        trLayer(sc, .3, 200 * s, 19, W, (px, r, i) => { if (k === 'dubai' && r < .5) return trPalm(x, px, gy + 30 * s, s, 90 * s); if (r < .4) { x.fillStyle = '#5a6a3a'; for (let q = 0; q < 2; q++) { x.beginPath(); x.ellipse(px + (q ? 26 : -26) * s, gy + 26 * s, 34 * s, 7 * s, q ? .2 : -.2, 0, 7); x.fill(); } x.fillStyle = '#8a5a3a'; x.fillRect(px - 8 * s, gy + 18 * s, 16 * s, 8 * s); } else if (r < .6) { x.fillStyle = '#a07a5a'; x.beginPath(); x.ellipse(px, gy + 26 * s, 22 * s, 14 * s, 0, Math.PI, 0); x.fill(); } else if (r < .7) trAnimal(x, px, gy + 26 * s, s * .9, 'pal', t); });
      }
      break;
    }
    case 'quedas': case 'floresta': {
      if (!L) {
        if (k === 'quedas') {
          trHills(x, W, gy - 70 * s, 30 * s, .06, sc, '#355f35', 8, 260 * s); x.fillStyle = '#3f6b3a'; x.fillRect(0, gy - 60 * s, W, 80 * s);
          trLayer(sc, .06, 260 * s, 23, W, (px, r) => { const w = (30 + r * 40) * s; const g = x.createLinearGradient(0, gy - 90 * s, 0, gy + 20 * s); g.addColorStop(0, '#e8f6ff'); g.addColorStop(1, '#bfe3f2'); x.fillStyle = g; x.fillRect(px, gy - 92 * s, w, 112 * s); x.fillStyle = 'rgba(160,200,220,.7)'; for (let q = 0; q < 6; q++) { const yy = (t * 120 * s + q * 22 * s) % (110 * s); x.fillRect(px + q * w / 6, gy - 92 * s + yy, 2 * s, 14 * s); } x.fillStyle = 'rgba(255,255,255,.55)'; for (let q = 0; q < 5; q++) trCirc(x, px + w / 2 + (q - 2) * 16 * s, gy + 18 * s - Math.sin(t * 2 + q) * 3 * s, 18 * s, 'rgba(255,255,255,.45)'); });
        } else { trLayer(sc, .05, 60 * s, 24, W, (px, r) => trCirc(x, px, gy, (40 + r * 30) * s, '#2f5a32')); x.fillStyle = '#2f5a32'; x.fillRect(0, gy, W, 30 * s); }
        trLayer(sc, .3, 110 * s, 25, W, (px, r) => { if (r < .6) trTree(x, px, gy + 30 * s, s, (80 + r * 70) * s, ['#3d7a3a', '#2f6a35', '#4f8a3a'][Math.floor(r * 30) % 3]); else if (r < .85) { x.strokeStyle = '#3f8a3a'; x.lineWidth = 9 * s; for (let q = -2; q <= 2; q++) { x.beginPath(); x.moveTo(px, gy + 30 * s); x.quadraticCurveTo(px + q * 16 * s, gy - 30 * s, px + q * 34 * s, gy - 10 * s); x.stroke(); } } });
      }
      break;
    }
    case 'europa': {
      if (!L) {
        trHills(x, W, gy - 10 * s, 50 * s, .04, sc, '#9aa978', 7, 300 * s);
        trLayer(sc, .06, 26 * s, 26, W, (px, r, i) => { const yy = gy - 20 * s - 40 * s * (.5 + .5 * Math.sin((px + sc * .06) / (300 * s) + 7)); x.fillStyle = ['#f4ead5', '#f2d7a8', '#e8e0d0', '#f6c9a0'][Math.abs(i) % 4]; x.fillRect(px, yy, 22 * s, 18 * s); trPoly(x, [[px - 2 * s, yy], [px + 11 * s, yy - 9 * s], [px + 24 * s, yy]], '#c25a32'); });
        x.fillStyle = '#5b8fb0'; x.fillRect(0, gy + 6 * s, W, 14 * s);
        trLayer(sc, .3, 260 * s, 27, W, (px, r) => { if (r < .5) trTree(x, px, gy + 30 * s, s, 90 * s, '#5f8a4a'); else if (r < .75) { x.fillStyle = '#ffcb00'; x.fillRect(px, gy - 14 * s, 90 * s, 38 * s); x.fillStyle = '#2a3d52'; for (let q = 0; q < 5; q++) x.fillRect(px + 6 * s + q * 17 * s, gy - 8 * s, 11 * s, 12 * s); x.fillStyle = '#333'; x.fillRect(px + 44 * s, gy - 34 * s, 2 * s, 20 * s); } });
      }
      break;
    }
  }
}
const TR_GROUND = { cidade: ['#b9b3a6', '#9a9488'], cidadeX: ['#a9a9a9', '#8a8a8a'], costa: ['#e3cf98', '#cdb67a'], falesia: ['#d9b47a', '#c09058'], savana: ['#d8b878', '#b8945a'], pedras: ['#c8a868', '#a88848'], planalto: ['#8fbf5f', '#6f9f45'], serra: ['#9a8f6a', '#7a704a'], deserto: ['#ecc48a', '#d8a86a'], dubai: ['#ecc896', '#d8b07a'], quedas: ['#5f9a45', '#4a7f38'], floresta: ['#4f7f3a', '#3a6a2a'], europa: ['#b8b0a0', '#9a9284'] };

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

/* =========================================================
   PAINÉIS DOS CENTROS
   ========================================================= */
const VH_PAINT = { carro: 250000, moto: 60000, bike: 8000 };
function vhIdade(V) { return V.idade || (V.cat === 'bike' ? 0 : 18); }
function vhCard(id) {
  const V = VEIC[id], own = G.bens.includes(id), cor = vhCor(id), sell = Math.round(V.p * .55);
  const fuel = V.kml ? (V.ev ? `${V.kml} Kz/km (elétrico)` : `${V.kml} Kz/km`) : 'Sem combustível';
  const req = []; if (V.carta && !G.carta) req.push('carta de condução'); if (vhIdade(V) > G.idade) req.push(vhIdade(V) + '+ anos');
  return `<div class="vhcard ${own ? 'own' : ''}"><canvas data-veh="${id}" width="300" height="140"></canvas><div class="vhinfo">
    <b>${V.t}</b><small>${V.sub || ''}</small>
    <div class="vhspec"><span>🏁 ${V.vel} km/h</span><span>💺 Conforto ${V.conf}/5</span><span>⛽ ${fuel}</span>${V.tt ? '<span>⛰️ Todo-o-terreno</span>' : ''}${V.manut ? `<span>🔧 ${kzShort(V.manut)}/ano</span>` : ''}</div>
    ${V.d ? `<p>${V.d}</p>` : ''}${Object.keys(V.ef || {}).length ? `<p class="vhef">Ao comprar: ${Object.entries(V.ef).map(([k, v]) => `${LABEL[k] || k} +${v}`).join(' · ')}</p>` : ''}
    <div class="vhcores">${V.cores.map(c => `<button style="background:${c}" class="${c === cor ? 'on' : ''}" onclick="vhSetCor('${id}','${c}')" aria-label="cor"></button>`).join('')}${own && V.cores.length > 1 ? `<em>Pintura: ${kzShort(VH_PAINT[V.cat])}</em>` : ''}</div>
    ${req.length && !own ? `<div class="vhreq">Requer: ${req.join(' · ')}</div>` : ''}
    <div class="vhbtns">${own ? `<span class="vhown">✅ É teu</span><button onclick="vhSell('${id}')">Vender · ${kzShort(sell)}</button>` : `<button class="buy" onclick="vhBuy('${id}')">Comprar · ${kzShort(V.p)}</button>`}${V.cat !== 'bike' && !own ? `<button onclick="vhTest('${id}')">🔑 Test-drive</button>` : ''}</div>
  </div></div>`;
}
function vhSetCor(id, c) {
  const V = VEIC[id];
  if (G.bens.includes(id)) {
    if (vhCor(id) === c) return; const pr = VH_PAINT[V.cat];
    if (!confirm(`Pintar ${V.t} por ${kz(pr)}?`)) return; if (!pay(pr)) return; vhG().cor[id] = c; VH.cor[id] = c; toast('🎨 Pintura nova! Parece acabado de sair da fábrica.'); save(); refresh();
  } else VH.cor[id] = c;
  renderPanel(true);
}
function vhBuy(id) {
  const V = VEIC[id]; if (vhIdade(V) > G.idade) return toast(`🧒 Só a partir dos ${vhIdade(V)} anos.`);
  buyBem(id); if (G.bens.includes(id)) { vhG().cor[id] = vhCor(id); VH.sel[V.cat] = id; if (typeof SND !== 'undefined') SND.play(V.cat === 'bike' ? 'bell2' : 'car'); save(); }
  renderPanel(true);
}
function vhSell(id) { sellBem(id); renderPanel(true); }
function vhTest(id) {
  const V = VEIC[id], v = vhG(); if (V.carta && !G.carta) return toast('🪪 Precisas de carta de condução para fazer o test-drive.'); if (vhIdade(V) > G.idade) return toast(`🧒 Só a partir dos ${vhIdade(V)} anos.`);
  if (v.td[id] === G.ano) return toast('🔑 Já fizeste test-drive deste modelo este ano. O vendedor quer é que compres! 😅');
  v.td[id] = G.ano;
  trStart({ kind: V.cat === 'carro' ? 'car' : V.cat, D: { id: 'test', n: 'Test-drive na Marginal', km: 6, bio: ['cidade', 'costa'], f: 2, ico: '🔑', d: `Deste uma volta no ${V.t}. O vendedor diz que "é teu por um precinho"…`, acts: [], noVis: 1 }, veh: id, mod: V.mod, col: vhCor(id), conf: 0, vehN: V.t, dur: 13, noEv: true });
}
function vhPaintCv(c) {
  const id = c.dataset.veh, V = VEIC[id]; if (!V) return; const x = c.getContext('2d'), W = c.width, H = c.height;
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d1f27'); g.addColorStop(.7, '#2a2d38'); g.addColorStop(1, '#14151b'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W / 2, H * .82, 10, W / 2, H * .82, W * .5); rg.addColorStop(0, 'rgba(255,203,0,.22)'); rg.addColorStop(1, 'rgba(255,203,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  const col = vhCor(id), gy = H * .86;
  if (V.cat === 'carro') { const P = TR_CARP[V.mod] || TR_CARP.sedan; trCar2D(x, W / 2, gy, Math.min(1.15, 255 / (P.L + 30)), V.mod, col, .3, null); }
  else if (V.cat === 'moto') trMoto2D(x, W / 2, gy, 1.55, V.mod, col, .3, null);
  else trBike2D(x, W / 2, gy, 1.75, V.mod, col, .3, null);
}
(function () { const _r = renderPanel; renderPanel = function () { const r = _r.apply(this, arguments); try { document.querySelectorAll('#pBody canvas[data-veh]').forEach(vhPaintCv); } catch (e) { console.error(e); } return r; }; })();

/* ---------- passeios de estrada (carro / moto / bicicleta) ---------- */
function vhRentOk(cat) { const C = VH_CAT[cat]; if (G.idade < C.rentIdade) return `idade ${C.rentIdade}+`; if (cat !== 'bike' && !G.carta) return 'carta de condução'; return ''; }
function vhSel(cat) { const own = vhOwned(cat); let s = VH.sel[cat]; if (!s || (s !== 'rent' && !own.includes(s))) s = VH.sel[cat] = own[own.length - 1] || 'rent'; return s; }
function vhTripCost(cat, sel, d) {
  const C = VH_CAT[cat], kml = sel === 'rent' ? (cat === 'carro' ? 35 : cat === 'moto' ? 14 : 0) : VEIC[sel].kml;
  return Math.round(kml * d.km * 2 / 100) * 100 + (sel === 'rent' ? C.rent * Math.max(1, Math.ceil(d.km / 350)) : 0);
}
function vhRoadUI(cat) {
  const C = VH_CAT[cat], own = vhOwned(cat), sel = vhSel(cat), rent = vhRentOk(cat);
  let h = sec(`${C.ico} Com que veículo vais?`) + `<div class="vhpick">${own.map(id => `<button class="${sel === id ? 'on' : ''}" onclick="VH.sel.${cat}='${id}';renderPanel(true)"><canvas data-veh="${id}" width="300" height="140"></canvas><b>${VEIC[id].t}</b><small>O teu</small></button>`).join('')}
    <button class="${sel === 'rent' ? 'on' : ''}" onclick="VH.sel.${cat}='rent';renderPanel(true)"><div class="vhrent">🔑</div><b>Alugar</b><small>${kzShort(C.rent)}/dia${rent ? ' · requer ' + rent : ''}</small></button></div>`;
  if (!own.length) h += noteBox(`Ainda não tens ${C.n.toLowerCase()}. Podes alugar aqui ou comprar no separador ao lado.`);
  h += noteBox(`⚡ Cada passeio gasta <b>1 energia</b> (viagens com mais de 800 km gastam 2). O preço inclui ${cat === 'bike' ? 'o aluguer, se precisares' : 'combustível de ida e volta' + (sel === 'rent' ? ' e aluguer' : '')}.`);
  const tt = sel !== 'rent' && VEIC[sel].tt;
  h += sec('🗺️ Destinos') + list(TR_ROAD.filter(d => cat !== 'bike' || d.bike).map(d => {
    const c = vhTripCost(cat, sel, d), seen = vhG().vis.includes((cat === 'carro' ? 'car' : cat) + ':' + d.id);
    return btnItem(d.ico, d.n + (seen ? ' ✅' : ''), `${d.km} km · ${d.d}${d.tt && !tt ? ' · ⚠️ picada difícil sem 4x4' : ''}`, c ? kzShort(c) : 'Grátis', `vhGo('${cat}','${d.id}')`);
  }));
  if (cat === 'bike') h += noteBox('🚲 De bicicleta só dá para destinos até 60 km. Para mais longe, apanha o comboio ou um voo!');
  return h;
}
function vhEnergy(n) { if (!canAct()) return false; if (G.acoes < n) { toast(`⚡ Esta viagem gasta ${n * 10} de energia. Come ou descansa primeiro.`); return false; } return true; }
function vhGo(cat, did) {
  const d = TR_ROAD.find(x => x.id === did), sel = vhSel(cat), C = VH_CAT[cat], need = d.km > 800 ? 2 : 1;
  if (sel === 'rent') { const r = vhRentOk(cat); if (r) return toast('🔑 Para alugar precisas de: ' + r + '.'); }
  else if (VEIC[sel].carta && !G.carta) return toast('🪪 Precisas de carta de condução.');
  if (!vhEnergy(need)) return; const cost = vhTripCost(cat, sel, d); if (!pay(cost)) return; G.acoes -= need;
  const V = sel === 'rent' ? null : VEIC[sel];
  trStart({ kind: cat === 'carro' ? 'car' : cat, cat, D: d, veh: V ? sel : null, mod: V ? V.mod : C.rentMod, col: V ? vhCor(sel) : '#f2f2f2', conf: V ? V.conf - 1 : 0, vehN: V ? V.t : C.rentN, risk: d.tt && !(V && V.tt) });
}

/* ---------- oficina ---------- */
function vhOficinaUI(cat) {
  const own = vhOwned(cat), v = vhG(), C = VH_CAT[cat], car = cat === 'carro';
  let h = noteBox(G.carta ? '🪪 Tens carta de condução. Boa estrada!' : '🪪 Ainda não tens carta de condução. Tira-a na Escola de Condução (Escola → Técnicos & Carta).', !G.carta);
  if (!G.carta) h += list([btnItem('🎓', 'Ir à Escola de Condução', 'Carta a partir dos 18 anos', '', "closePanel();tapEnter('escola')")]);
  if (!own.length) return h + noteBox(`Não tens nenhum veículo desta categoria. Compra um no separador ${C.ico} ${C.n}.`);
  const top = own.map(id => VEIC[id]).sort((a, b) => b.p - a.p)[0], segP = Math.round(top.p * (car ? .03 : .02) / 1000) * 1000;
  h += sec('🔧 Serviços') + list([
    btnItem('🔧', 'Revisão completa', v.rev === G.ano ? 'Feita este ano: sem avarias nas viagens' : 'Óleo, travões e pneus. Evita avarias durante as viagens este ano', car ? kzShort(60000) : kzShort(20000), `vhSvc('rev',${car ? 60000 : 20000})`, v.rev === G.ano),
    btnItem('🛡️', 'Seguro contra todos os riscos', v.seg === G.ano ? 'Ativo este ano' : `Cobre acidentes nas viagens (${top.t})`, kzShort(segP), `vhSvc('seg',${segP})`, v.seg === G.ano),
    btnItem('🧽', 'Lavagem e polimento', v.lav === G.ano ? 'Já brilhou este ano' : 'Chegar a brilhar dá estilo (Aparência +1)', kzShort(car ? 5000 : 2000), `vhSvc('lav',${car ? 5000 : 2000})`, v.lav === G.ano),
    car ? btnItem('🔊', 'Jantes desportivas e som potente', (v.tun || []).includes(G.ano) ? 'Já fizeste o tuning este ano' : 'A Marginal vai ouvir-te chegar (Fama +2)', kzShort(350000), `vhSvc('tun',350000)`, (v.tun || []).includes(G.ano))
      : btnItem('⛑️', 'Capacete e casaco de proteção', (v.cap || 0) ? 'Já tens' : 'Menos risco nas quedas', kzShort(45000), `vhSvc('cap',45000)`, !!v.cap),
  ]);
  if (cat === 'moto') h += sec('💼 Trabalhar com a moto') + list([btnItem('🏍️', 'Mototaxista (Kupapata)', 'Com moto e carta tens vaga no Centro de Emprego', '', "closePanel();tapEnter('emprego')")]);
  h += sec('🚘 A tua garagem') + `<div class="vhgar">${own.map(id => `<div><canvas data-veh="${id}" width="300" height="140"></canvas><b>${VEIC[id].t}</b><small>Vale ${kzShort(VEIC[id].p * .55)}</small></div>`).join('')}</div>`;
  return h;
}
function vhSvc(k, pr) {
  const v = vhG(); if (!pay(pr)) return; let t = '';
  if (k === 'rev') { v.rev = G.ano; t = '🔧 Revisão feita: o motor está como novo.'; }
  if (k === 'seg') { v.seg = G.ano; t = '🛡️ Seguro ativo até ao fim do ano.'; }
  if (k === 'lav') { v.lav = G.ano; t = '🧽 Brilha que até encandeia! ' + fx({ aparencia: 1 }); }
  if (k === 'tun') { v.tun = (v.tun || []).concat(G.ano); t = '🔊 Jantes novas e som a bombar! ' + fx({ fama: 2, felicidade: 3 }); }
  if (k === 'cap') { v.cap = 1; t = '⛑️ Equipamento de proteção comprado. ' + fx({ saude: 1 }); }
  after(t, 'good'); renderPanel(true);
}

/* ---------- desafios de bicicleta ---------- */
function vhDesafiosUI() {
  const own = vhOwned('bike'), v = vhG();
  let h = noteBox('🏆 Desafios da Pedala Angola. Pedalar faz bem à saúde e ainda podes ganhar prémios!');
  h += list([
    btnItem('🏁', 'Volta a Luanda (corrida amadora)', own.length ? 'Corrida de 42 km. O resultado depende da tua saúde e da bicicleta' : 'Precisas de uma bicicleta tua', kzShort(5000), "vhRace()", !own.length || v.volta === G.ano),
    btnItem('🌳', 'Passeio de domingo em grupo', 'Pela Marginal com a comunidade. Grátis e faz amigos', 'Grátis', "vhGroupRide()", v.grupo === G.ano),
    btnItem('🤸', 'Escola de BMX no Largo', 'Manobras e saltos (melhor com uma BMX)', kzShort(10000), "vhBmx()", v.bmx === G.ano),
  ]);
  if (v.volta === G.ano) h += noteBox('Já correste a Volta a Luanda este ano. Treina e volta para o ano!');
  h += sec('📊 As tuas estatísticas') + list([infoItem('🛣️', 'Quilómetros na vida', `${Math.round(v.km).toLocaleString('pt-PT')} km em ${v.n} viagens`), infoItem('🧭', 'Destinos descobertos', `${new Set(v.vis.map(s => s.split(':')[1])).size} sítios diferentes`), infoItem('🏆', 'Melhor resultado na Volta', v.best ? v.best + '.º lugar' : 'Ainda não correste')]);
  return h;
}
function vhRace() {
  const own = vhOwned('bike'); if (!own.length) return; if (!vhEnergy(1) || !pay(5000)) return; G.acoes--; vhG().volta = G.ano;
  const best = own.sort((a, b) => VEIC[b].vel - VEIC[a].vel)[0];
  trStart({ kind: 'bike', D: { id: 'volta', n: 'Volta a Luanda', km: 21, ida: 0, bio: ['cidade', 'costa', 'cidade'], f: 2, ico: '🏁', d: 'Meta na Marginal, com o público a gritar o teu nome.', acts: [], noVis: 1, race: 1 }, veh: best, mod: VEIC[best].mod, col: vhCor(best), conf: 0, vehN: VEIC[best].t, noEv: false });
}
function vhGroupRide() {
  const v = vhG(); if (!vhEnergy(1)) return; G.acoes--; v.grupo = G.ano; const sel = vhOwned('bike').pop();
  trStart({ kind: 'bike', D: Object.assign({}, TR_ROAD[0], { id: 'grupo', n: 'Passeio de domingo', km: 12, f: 4, noVis: 1, acts: [['🤝', 'Ficar a conversar com o grupo', { felicidade: 2, karma: 1 }, 0], ['🥤', 'Sumo natural no fim', { felicidade: 2 }, 1000]] }), veh: sel || null, mod: sel ? VEIC[sel].mod : 'bike', col: sel ? vhCor(sel) : '#2e8b57', conf: 0, vehN: sel ? VEIC[sel].t : 'Bicicleta emprestada' });
}
function vhBmx() { const v = vhG(); doAct(10000, () => { v.bmx = G.ano; return G.bens.includes('bmx') ? '🤸 Aprendeste um backflip! Toda a gente filmou. ' + fx({ saude: 2, fama: 2, felicidade: 3 }) : '🤸 Aula de BMX com uma bicicleta emprestada. ' + fx({ saude: 2, felicidade: 2 }); }); renderPanel(true); }

/* ---------- estação ---------- */
function vhTrainNow() { const T = typeof muNowS === 'function' ? muNowS() : Date.now() / 1000, c = ((T % 110) + 110) % 110; return c < 30 ? `🚆 O próximo comboio chega à plataforma em <b>${Math.ceil(30 - c)} s</b>` : c < 42 ? '🟢 <b>Comboio na plataforma</b>: embarque imediato!' : `🚆 Comboio a partir. O próximo chega em <b>${Math.ceil(140 - c)} s</b>`; }
function vhTrainPrice(d, cls) { const v = vhG(), m = TR_CLS_T.find(c => c[0] === cls)[2]; let p = Math.max(500, Math.round(d.km * 18 * m / 100) * 100); if (v.passe === G.ano && d.km <= 62 && cls === 'seg') p = 0; if (v.jovem === G.ano) p = Math.round(p * .7 / 100) * 100; return p; }
function vhPartidasUI() {
  const cls = VH.clsT || 'seg', now = new Date(), v = vhG();
  let h = `<div class="vhnow">${vhTrainNow()}</div>`;
  h += `<div class="vhboard"><div class="vbh"><span>Hora</span><span>Destino</span><span>Linha</span><span>Estado</span></div>${TR_TREM.map((d, i) => { const iv = i === 0 ? 20 : 60 + i * 30, m = now.getHours() * 60 + now.getMinutes(), nx = Math.ceil((m + 1) / iv) * iv, hh = String(Math.floor(nx / 60) % 24).padStart(2, '0') + ':' + String(nx % 60).padStart(2, '0'), st = trRnd(Math.floor(m / 30) * 7 + i, 99) < .15 ? ['ATRASADO', 'late'] : nx - m < 10 ? ['A EMBARCAR', 'board'] : ['A HORAS', 'ok']; return `<div><span>${hh}</span><span>${d.n}</span><span>CFL</span><span class="${st[1]}">${st[0]}</span></div>`; }).join('')}</div>`;
  h += sec('🎫 Classe') + `<div class="agchips">${TR_CLS_T.map(([k, t, m, b]) => `<button class="chip ${k === cls ? 'on' : ''}" onclick="VH.clsT='${k}';renderPanel(true)">${t}${b ? ' · Felicidade +' + b : ''}</button>`).join('')}</div>`;
  h += sec('🚆 Linha de Luanda (Ferrovia Kianda)') + list(TR_TREM.map(d => { const p = vhTrainPrice(d, cls), seen = v.vis.includes('train:' + d.id); return btnItem(d.ico, `Luanda → ${d.n}${seen ? ' ✅' : ''}`, `${d.km} km · ~${Math.max(1, Math.round(d.km / 55 * 10) / 10)} h · ${d.d}`, p ? kzShort(p) : 'Passe', `vhTrain('${d.id}')`); }));
  h += noteBox('⚡ Cada viagem de comboio gasta 1 energia. Na janela vês a paisagem; carrega em 🎥 para ver o comboio por fora.');
  return h;
}
function vhTrain(id) {
  const d = TR_TREM.find(x => x.id === id), cls = VH.clsT || 'seg', C = TR_CLS_T.find(c => c[0] === cls);
  if (!vhEnergy(1)) return; const p = vhTrainPrice(d, cls); if (!pay(p)) return; G.acoes--;
  trStart({ kind: 'train', D: d, cls, clsN: C[1], conf: C[3], vehN: 'Ferrovia Kianda · ' + C[1] });
}
function vhPasseUI() {
  const v = vhG();
  return noteBox('🎫 Passes e cartões da Ferrovia Kianda. Válidos até ao fim do ano.') + list([
    btnItem('🎫', 'Passe Suburbano anual', v.passe === G.ano ? 'Ativo: Viana e Catete grátis na 2.ª classe' : 'Viana e Catete grátis em 2.ª classe durante o ano', kzShort(60000), "vhPasse('passe',60000)", v.passe === G.ano),
    btnItem('🧑', 'Cartão Jovem (até 25 anos)', v.jovem === G.ano ? 'Ativo: 30% de desconto' : G.idade > 25 ? 'Só para quem tem até 25 anos' : '30% de desconto em todos os bilhetes', kzShort(10000), "vhPasse('jovem',10000)", v.jovem === G.ano || G.idade > 25),
  ]) + sec('📈 As tuas viagens') + list([infoItem('🛣️', 'Quilómetros na vida', `${Math.round(v.km).toLocaleString('pt-PT')} km`), infoItem('🚆', 'Estações visitadas', `${v.vis.filter(s => s.startsWith('train:')).length} de ${TR_TREM.length}`)]);
}
function vhPasse(k, pr) { const v = vhG(); if (!pay(pr)) return; v[k] = G.ano; after(k === 'passe' ? '🎫 Compraste o Passe Suburbano!' : '🧑 Cartão Jovem ativado: 30% de desconto!', 'good'); renderPanel(true); }
function vhLinhaUI() {
  return noteBox('🚆 A <b>Linha de Luanda</b> é uma das mais antigas de África: começou a ser construída no fim do século XIX e chegou a Malanje no início do século XX. Hoje leva milhares de passageiros por dia entre Luanda, Viana e o interior.')
    + list([infoItem('🛤️', 'Caminho de Ferro de Luanda (CFL)', 'Luanda → Viana → Catete → Zenza do Itombe → N\'dalatando → Malanje'), infoItem('🚂', 'Caminho de Ferro de Benguela (CFB)', 'Lobito → Huambo → Cuito → Luena → Luau, até à fronteira'), infoItem('🏜️', 'Caminho de Ferro de Moçâmedes (CFM)', 'Namibe → Lubango → Menongue'), infoItem('🌍', 'Corredor do Lobito', 'Liga o porto do Lobito à Zâmbia e ao Congo')])
    + noteBox('💡 Sabias que? O comboio que vês a chegar à plataforma aqui fora chega à mesma hora para todos os jogadores online.');
}

/* ---------- viagens interprovinciais (ida: ficas a visitar a província) ---------- */
function vhInterUI(meio) {
  const bus = meio === 'bus';
  let h = noteBox(bus
    ? '🚌 <b>Terminal interprovincial</b>: autocarros para todas as províncias. O bilhete é de <b>ida</b> — ficas a visitar a província e a tua casa espera por ti. Voltas pelo mapa Angola (🏠) ou aqui.'
    : '✈️ <b>Palanca Airlines</b>: voa para outra província e <b>fica</b> lá a visitar (bilhete de ida). Para passeios de ida-e-volta no mesmo dia usa o separador ✈️ Nacionais.');
  if (G.visitando) {
    return h + noteBox(`🧳 Estás de <b>visita</b> — a tua casa fica em ${G.visitando.mun} (${G.visitando.prov}).`)
      + `<div class="btns" style="margin:8px 0">${chip(`🏠 Voltar para casa · ${G.visitando.prov}`, 'voltarParaCasa()', false)}</div>`;
  }
  h += sec(bus ? '🚌 Autocarros (30 Kz/km)' : '✈️ Voos (preço por distância)') + list(PROVINCIAS.filter(p => p.n !== G.cidade.prov).map(P => {
    const km = ANG_KM[P.n] || 500, p = viajarPreco(P.n, meio);
    return btnItem(bus ? '🚌' : '✈️', `${P.n}`, `${P.cap} · ${km} km · ~${viajarHoras(P.n, meio)} h · ${P.eco}`, kzShort(p), `viajarPara('${P.n}','${meio}')`, G.dinheiro < p);
  }));
  return h;
}

/* ---------- aeroporto ---------- */
function vhTier(mi) { return mi >= 20000 ? ['Ouro', '#ffcb00', .2] : mi >= 5000 ? ['Prata', '#c0c7d0', .1] : ['Azul', '#2ab0d8', 0]; }
function vhFlyPrice(d, cls) { const m = TR_CLS_V.find(c => c[0] === cls)[2], t = vhTier(vhG().mi || 0); return Math.round(d.p * m * (1 - t[2]) / 1000) * 1000; }
function vhVoosUI(int) {
  const cls = VH.cls || 'eco', v = vhG(), t = vhTier(v.mi || 0);
  let h = `<div class="vhmiles" style="--c:${t[1]}"><b>Palanca Miles · ${t[0]}</b><span>${(v.mi || 0).toLocaleString('pt-PT')} milhas${t[2] ? ' · ' + Math.round(t[2] * 100) + '% de desconto' : ''}</span></div>`;
  if (int && (!v.pass || G.idade < 18)) h += noteBox(G.idade < 18 ? '🛂 Para voos internacionais sozinho(a) precisas de ter 18 anos.' : '🛂 Precisas de passaporte para voar para fora. Trata dele no separador 🛂 Passaporte & Milhas.', true);
  h += sec('💺 Classe') + `<div class="agchips">${TR_CLS_V.map(([k, tt, m, b]) => `<button class="chip ${k === cls ? 'on' : ''}" onclick="VH.cls='${k}';renderPanel(true)">${tt}${b ? ' · Felicidade +' + b : ''}</button>`).join('')}</div>`;
  if (!int && (v.mi || 0) >= 3000) h += `<div class="agchips"><button class="chip ${VH.useMi ? 'on' : ''}" onclick="VH.useMi=!VH.useMi;renderPanel(true)">🎁 Usar 3.000 milhas: voo nacional grátis</button></div>`;
  h += sec(int ? '🌍 Voos internacionais' : '✈️ Voos nacionais') + list(TR_VOO.filter(d => !!d.int === !!int).map(d => {
    const p = !int && VH.useMi && (v.mi || 0) >= 3000 ? 0 : vhFlyPrice(d, cls), hrs = d.km / 750 + .5, seen = v.vis.includes('plane:' + d.id);
    return btnItem(d.ico, `${d.n}${seen ? ' ✅' : ''}`, `${d.pais ? d.pais + ' · ' : ''}${Math.floor(hrs)} h ${String(Math.round(hrs % 1 * 60)).padStart(2, '0')} de voo · ${d.d}`, p ? kzShort(p) : 'Milhas', `vhFly('${d.id}')`, int && (!v.pass || G.idade < 18));
  }));
  h += noteBox(`⚡ Voos nacionais gastam 1 energia; internacionais gastam 2. Ganhas milhas por cada km voado (a dobrar em Primeira).`);
  return h;
}
function vhFly(id) {
  const d = TR_VOO.find(x => x.id === id), v = vhG(), cls = VH.cls || 'eco', C = TR_CLS_V.find(c => c[0] === cls), need = d.int ? 2 : 1;
  if (d.int && G.idade < 18) return toast('🛂 Só a partir dos 18 anos.'); if (d.int && !v.pass) return toast('🛂 Precisas de passaporte.');
  if (!vhEnergy(need)) return; const mi = !d.int && VH.useMi && (v.mi || 0) >= 3000, p = mi ? 0 : vhFlyPrice(d, cls); if (!pay(p)) return;
  if (mi) { v.mi -= 3000; VH.useMi = false; } G.acoes -= need;
  trStart({ kind: 'plane', D: d, cls, clsN: C[1], conf: C[3], col: '#b5179e', vehN: 'Palanca Airlines · ' + C[1] });
}
function vhPassUI() {
  const v = vhG(), t = vhTier(v.mi || 0);
  let h = sec('🛂 Passaporte') + list([v.pass ? infoItem('🛂', 'Passaporte angolano', 'Válido. Podes voar para fora do país', '✅') : btnItem('🛂', 'Tratar o passaporte (SME)', G.idade < 18 ? 'Só a partir dos 18 anos' : 'Pronto na hora, aqui no balcão do aeroporto', kzShort(25000), 'vhPass()', G.idade < 18)]);
  h += sec('🎖️ Palanca Miles') + `<div class="vhmiles big" style="--c:${t[1]}"><b>${t[0]}</b><span>${(v.mi || 0).toLocaleString('pt-PT')} milhas</span><i style="width:${Math.min(100, (v.mi || 0) / (t[0] === 'Azul' ? 5000 : 20000) * 100)}%"></i><small>${t[0] === 'Ouro' ? 'Nível máximo: 20% de desconto e sala VIP grátis' : t[0] === 'Prata' ? 'Faltam ' + (20000 - v.mi).toLocaleString('pt-PT') + ' milhas para Ouro' : 'Faltam ' + (5000 - (v.mi || 0)).toLocaleString('pt-PT') + ' milhas para Prata'}</small></div>`;
  h += sec('🛍️ No terminal') + list([
    btnItem('🛋️', 'Sala VIP Palanca', v.vip === G.ano ? 'Já relaxaste este ano' : 'Buffet, duche e wi-fi antes do voo', t[0] === 'Ouro' ? 'Grátis' : kzShort(20000), 'vhVip()', v.vip === G.ano),
    btnItem('🧴', 'Duty free: perfume Kianda N.º 5', v.duty === G.ano ? 'Já compraste este ano' : 'Cheirar bem dá confiança (Aparência +1)', kzShort(45000), 'vhDuty()', v.duty === G.ano),
  ]);
  h += sec('🌍 Carimbos no passaporte') + (v.car.length ? `<div class="vhstamps">${v.car.map(c => `<span>${c}</span>`).join('')}</div>` : noteBox('Ainda não tens carimbos. O mundo está à tua espera!'));
  h += sec('🧭 Destinos descobertos') + list([infoItem('🗺️', 'Sítios visitados', `${new Set(v.vis.map(s => s.split(':')[1])).size} destinos · ${v.n} viagens · ${Math.round(v.km).toLocaleString('pt-PT')} km`)]);
  return h;
}
function vhPass() { if (G.idade < 18) return; if (!pay(25000)) return; vhG().pass = 1; after('🛂 Passaporte tratado! Agora podes voar para o estrangeiro.', 'good', 'cheer'); renderPanel(true); }
function vhVip() { const v = vhG(), free = vhTier(v.mi || 0)[0] === 'Ouro'; if (!free && !pay(20000)) return; v.vip = G.ano; after('🛋️ Relaxaste na sala VIP. ' + fx({ felicidade: 2, saude: 1 }), 'good'); renderPanel(true); }
function vhDuty() { const v = vhG(); if (!pay(45000)) return; v.duty = G.ano; after('🧴 Perfume novo! ' + fx({ aparencia: 1, felicidade: 1 }), 'good'); renderPanel(true); }

/* ---------- registo dos painéis ---------- */
const vhShop = cat => () => {
  const ids = Object.keys(VEIC).filter(id => VEIC[id].cat === cat).sort((a, b) => VEIC[a].p - VEIC[b].p);
  const msg = { carro: '🚗 Carros novos e usados. Todos os carros pedem carta de condução e têm manutenção anual.', moto: '🏍️ Scooters a partir dos 16 anos sem carta; motos maiores pedem carta.', bike: '🚲 Bicicletas para todas as idades: saúde, poupança e zero engarrafamento.' }[cat];
  return noteBox(msg + ` Tens <b>${kzShort(G.dinheiro)}</b>.`) + `<div class="vhgrid">${ids.map(vhCard).join('')}</div>`;
};
Object.assign(PANELS, {
  stand: { ico: '🚗', t: 'Stand Auto Kianda', sub: 'Carros novos e usados · test-drive · oficina', tabs: [['carros', '🚗 Carros', vhShop('carro')], ['passeios', '🛣️ Passeios', () => vhRoadUI('carro')], ['oficina', '🔧 Oficina', () => vhOficinaUI('carro')]] },
  motos: { ico: '🏍️', t: 'Moto Bwé', sub: 'Scooters, motos e superdesportivas', tabs: [['motos', '🏍️ Motos', vhShop('moto')], ['passeios', '🛣️ Passeios', () => vhRoadUI('moto')], ['oficina', '🔧 Oficina', () => vhOficinaUI('moto')]] },
  bikes: { ico: '🚲', t: 'Pedala Angola', sub: 'Bicicletas, aluguer, passeios e desafios', tabs: [['bikes', '🚲 Bicicletas', vhShop('bike')], ['passeios', '🌳 Passeios', () => vhRoadUI('bike')], ['desafios', '🏆 Desafios', vhDesafiosUI]] },
  estacao: { ico: '🚆', t: 'Estação Ferroviária de Luanda', sub: 'Ferrovia Kianda · Linha de Luanda', tabs: [['partidas', '🚆 Partidas', vhPartidasUI], ['inter', '🚌 Interprovincial', () => vhInterUI('bus')], ['passe', '🎫 Passes', vhPasseUI], ['info', 'ℹ️ A linha', vhLinhaUI]] },
  aeroporto: { ico: '✈️', t: 'Aeroporto de Luanda', sub: 'Palanca Airlines · voos nacionais e internacionais', tabs: [['nac', '✈️ Nacionais', () => vhVoosUI(false)], ['int', '🌍 Internacionais', () => vhVoosUI(true)], ['visitar', '🧳 Visitar & Ficar', () => vhInterUI('aviao')], ['milhas', '🛂 Passaporte & Milhas', vhPassUI]] },
});

/* resultado da corrida e do atolar na picada (antes do ecrã de chegada) */
(function () {
  const _a = trArrive; trArrive = function () {
    const D = TR.D, v = vhG();
    if (D.race) { const V = VEIC[TR.veh] || {}, sc = G.stats.saude + (TR.veh === 'corrida' ? 28 : TR.veh === 'btt' ? 12 : TR.veh === 'ebike' ? -40 : 4) + Math.random() * 35, pos = sc > 112 ? 1 : sc > 100 ? 2 : sc > 90 ? 3 : Math.max(4, Math.round(60 - sc / 2));
      v.best = Math.min(v.best || 999, pos); let t;
      if (TR.veh === 'ebike') t = '🚫 Desclassificado(a): bicicletas elétricas não podem correr! ' + fx({ felicidade: -2 });
      else if (pos === 1) t = '🥇 GANHASTE a Volta a Luanda! Prémio de 150.000 Kz! ' + fx({ dinheiro: 150000, fama: 4, felicidade: 6 });
      else if (pos <= 3) t = `🥉 Pódio! Ficaste em ${pos}.º lugar. Prémio de 50.000 Kz. ` + fx({ dinheiro: 50000, fama: 2, felicidade: 4 });
      else t = `🏅 Terminaste em ${pos}.º lugar. Para o ano há mais! ` + fx({ saude: 2, felicidade: 1 });
      TR.log.push(t); if (typeof SND !== 'undefined') SND.play(pos <= 3 ? 'goal' : 'whistle'); }
    if (TR.risk && chance(.35)) { G.dinheiro -= 15000; TR.log.push('🚜 Atolaste na picada! Um tractor puxou-te por 15.000 Kz.'); }
    if (D.noVis) { const vis = v.vis.slice(); const r = _a.apply(this, arguments); v.vis = vis; return r; }
    return _a.apply(this, arguments);
  };
})();
/* quem está em viagem aparece assim para os outros jogadores */
if (typeof LIVE !== 'undefined' && LIVE.mpBody) { const _mb = LIVE.mpBody.bind(LIVE); LIVE.mpBody = function () { return Object.assign(_mb(), { vh: TR ? TR.kind + ':' + String(TR.D.id).replace(/[^a-z0-9]/g, '') : '' }); }; }
