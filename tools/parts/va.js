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
