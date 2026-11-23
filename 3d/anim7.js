/* =========================================================
   ANIMAÇÃO 2.0 (anim7)
   · esqueleto com cotovelos, joelhos e cintura (o tronco dobra sem levar as pernas)
   · andar/correr com passada ligada à velocidade real (sem "patinar"), pés sempre no chão
   · transições suaves entre parado ⇄ andar ⇄ correr ⇄ gestos
   · os 25 gestos/danças refeitos com mãos que chegam à cara, ao peito, à cintura…
   ========================================================= */
const AN7 = { EY: -.31, KY: -.45, HY: .92, TH: .45, SH: .47 };

/* a geometria das pernas guarda os argumentos para poder ser cortada no joelho */
(function () { const _lg = legGeo; legGeo = function () { const g = _lg.apply(this, arguments); if (!g.userData.args) g.userData.args = [...arguments]; return g; }; })();

function an7Rig(h) {
  const P = h.P; if (!P || P.chest) return h;
  const cp = (src, geo, parent, x, y, z) => { const m = new T.Mesh(geo, src.material); m.position.set(x, y, z); m.scale.copy(src.scale); m.rotation.copy(src.rotation); m.castShadow = src.castShadow; m.receiveShadow = src.receiveShadow; parent.add(m); return m; };
  const move = (c, from, to, dy) => { from.remove(c); c.position.y -= dy; to.add(c); };
  /* braços → antebraço a partir do cotovelo */
  ['L', 'R'].forEach(s => {
    const arm = P['arm' + s]; if (!arm) return; const E = AN7.EY;
    const fore = new T.Group(); fore.position.y = E;
    [...arm.children].forEach(c => {
      const gp = c.geometry && c.geometry.parameters;
      if (c.isMesh && c.geometry.type === 'CapsuleGeometry' && !c.rotation.x && !c.rotation.z) {
        const len = gp.length != null ? gp.length : gp.height, top = c.position.y + len / 2, bot = c.position.y - len / 2;
        if (top > E + .03 && bot < E - .03) { cp(c, caps(gp.radius, +(top - E).toFixed(3)), arm, c.position.x, (top + E) / 2, c.position.z); cp(c, caps(gp.radius, +(E - bot).toFixed(3)), fore, c.position.x, (E + bot) / 2 - E, c.position.z); arm.remove(c); return; }
      }
      if (c.position.y < E) move(c, arm, fore, E);
    });
    arm.add(fore); P['fore' + s] = fore;
  });
  /* pernas → canela a partir do joelho */
  ['L', 'R'].forEach(s => {
    const leg = P['leg' + s]; if (!leg) return; const K = AN7.KY;
    const shin = new T.Group(); shin.position.y = K;
    [...leg.children].forEach(c => {
      const a = c.geometry && c.geometry.userData && c.geometry.userData.args;
      if (a) {
        const [fem, B, m01, ya, yb, grow, bag] = a;
        if (yb <= K + .005) { move(c, leg, shin, K); return; }
        if (ya >= K - .005) return;
        cp(c, legGeo(fem, B, m01, K, yb, grow, bag), leg, c.position.x, c.position.y, c.position.z);
        cp(c, legGeo(fem, B, m01, ya, K, grow, bag), shin, c.position.x, c.position.y - K, c.position.z);
        const r = c.geometry.userData.rAt(K) + (grow || 0), j = new T.Mesh(sph(r, 12, 8), c.material); j.scale.set(1, 1, .92); j.position.set(c.position.x, c.position.y, c.position.z); j.castShadow = c.castShadow; shin.add(j);
        leg.remove(c); return;
      }
      const gp = c.geometry && c.geometry.parameters;
      if (c.isMesh && c.geometry.type === 'BoxGeometry' && !c.rotation.x && !c.rotation.z) {
        const top = c.position.y + gp.height / 2, bot = c.position.y - gp.height / 2;
        if (top > K + .02 && bot < K - .02) { cp(c, new T.BoxGeometry(gp.width, top - K, gp.depth), leg, c.position.x, (top + K) / 2, c.position.z); cp(c, new T.BoxGeometry(gp.width, K - bot, gp.depth), shin, c.position.x, (K + bot) / 2 - K, c.position.z); leg.remove(c); return; }
      }
      if (c.position.y < K) move(c, leg, shin, K);
    });
    leg.add(shin); P['shin' + s] = shin;
  });
  /* bacia: tronco, anca, saia e cabeça rodam juntos na articulação da anca (nada se separa na cintura) */
  const body = P.body, chest = new T.Group(); chest.position.y = AN7.HY;
  [...body.children].forEach(c => { if (c !== P.legL && c !== P.legR) move(c, body, chest, AN7.HY); });
  body.add(chest); P.chest = chest;
  /* ombros: bola fixa no tronco para o braço nunca "sair" da manga quando sobe */
  ['L', 'R'].forEach(s => {
    const arm = P['arm' + s]; if (!arm) return;
    const sl = arm.children.find(c => c.isMesh && c.geometry.type === 'CapsuleGeometry' && c.position.y > -.2 && c.position.y < 0) || arm.children.find(c => c.isMesh && c.geometry.type === 'SphereGeometry' && Math.abs(c.position.y) < .06);
    if (!sl) return; const r = sl.geometry.parameters.radius * (sl.geometry.type === 'SphereGeometry' ? 1 : 1.04);
    const b = new T.Mesh(sph(r, 14, 10), sl.material); b.position.set(arm.position.x - Math.sign(arm.position.x) * r * .25, arm.position.y - r * .15, arm.position.z); b.scale.set(1, .92, .95); b.castShadow = true; chest.add(b);
  });
  /* meias um pouco mais largas que a perna (sem "dentes" brancos no tornozelo) */
  ['shinL', 'shinR'].forEach(k => (P[k] ? P[k].children : []).forEach(c => { const gp = c.geometry && c.geometry.parameters; if (c.geometry && c.geometry.type === 'CylinderGeometry' && gp.height === .16 && gp.radiusTop === .066) c.scale.set(1.14, 1, 1.06); }));
  return h;
}
(function () { const _mk = makeHuman; makeHuman = function () { const h = _mk.apply(this, arguments); try { an7Rig(h); } catch (e) { console.error('an7Rig', e); } return h; }; })();

/* ---------------- poses ---------------- */
const AN7_K = ['py', 'brx', 'bry', 'brz', 'crx', 'cry', 'crz', 'hrx', 'hry', 'hrz', 'aLx', 'aLy', 'aLz', 'aRx', 'aRy', 'aRz', 'fL', 'fR', 'lLx', 'lLz', 'lRx', 'lRz', 'kL', 'kR'];
const an7Z = () => { const o = {}; AN7_K.forEach(k => o[k] = 0); return o; };
/* abdução do braço/perna: positivo = afastar do corpo (para os dois lados) */
const abL = v => -v, abR = v => v;
/* altura do corpo para o pé mais baixo tocar no chão */
function an7Ground(o) {
  const f = (hp, k) => AN7.TH * Math.cos(hp) * Math.cos(o.lLz) + AN7.SH * Math.cos(hp + k);
  const L = AN7.TH * Math.cos(o.lLx) * Math.cos(o.lLz) + AN7.SH * Math.cos(o.lLx + o.kL) * Math.cos(o.lLz), R = AN7.TH * Math.cos(o.lRx) * Math.cos(o.lRz) + AN7.SH * Math.cos(o.lRx + o.kR) * Math.cos(o.lRz);
  return Math.max(L, R) - (AN7.TH + AN7.SH);
}
function an7Idle(h, o, t) {
  const br = Math.sin(t * .9), sh = Math.sin(t * .21);
  o.aLz = abL(.1 + br * .02); o.aRz = abR(.1 + br * .02); o.aLx = br * .03; o.aRx = -br * .03; o.fL = -.14; o.fR = -.14;
  o.kL = Math.max(0, sh) * .14; o.kR = Math.max(0, -sh) * .14; o.lLx = -o.kL * .3; o.lRx = -o.kR * .3;
  o.brz = sh * .025; o.crz = -sh * .03; o.crx = (h.lean || 0) + br * .01;
  const look = Math.sin(t * .17) * Math.sin(t * .41); o.hry = look * .35; o.hrx = Math.sin(t * .3) * .04 - (h.lean || 0) * .5;
  o.py = an7Ground(o) + br * .004;
}
function an7Gait(h, o, p, run) {
  const A = run ? .7 : (h.an && h.an.A) || .45, sp = Math.sin(p), cp = Math.cos(p);
  o.lLx = -A * sp - (run ? .12 : 0); o.lRx = A * sp - (run ? .12 : 0);
  const K = run ? 1.55 : .8, st = run ? .22 : .06;
  o.kL = st + K * Math.pow(Math.max(0, cp), 1.4); o.kR = st + K * Math.pow(Math.max(0, -cp), 1.4);
  const B = run ? .85 : .42;
  o.aLx = B * sp; o.aRx = -B * sp; o.aLz = abL(run ? .14 : .07); o.aRz = abR(run ? .14 : .07);
  o.fL = (run ? -1.35 : -.22) - .35 * Math.max(0, -o.aLx); o.fR = (run ? -1.35 : -.22) - .35 * Math.max(0, -o.aRx);
  o.bry = -sp * (run ? .1 : .07); o.cry = sp * (run ? .16 : .1); o.brz = sp * .02; o.crz = -sp * .025;
  o.crx = (run ? .22 : .05) + (h.lean || 0); o.hry = -o.cry * .85 - o.bry; o.hrx = run ? -.14 : -.02;
  o.py = an7Ground(o) + (run ? Math.max(0, Math.cos(p * 2)) * .05 : Math.abs(cp) * .012);
}
/* gestos: o = pose base (já com zeros), t = idade do gesto * 8, a = idade em s */
const AN7_EM = {
  cheer(o, t, a) { const j = Math.max(0, Math.sin(t * .8)); o.aLz = abL(2.55 + Math.sin(t) * .2); o.aRz = abR(2.55 + Math.sin(t) * .2); o.fL = o.fR = -.35; o.kL = o.kR = (1 - j) * .45; o.lLx = o.lRx = -(1 - j) * .2; o.crx = -.08; o.hrx = -.2; o.py = an7Ground(o) + j * .22; return 'laugh'; },
  sad(o) { o.hrx = .5; o.crx = .28; o.aLz = abL(.03); o.aRz = abR(.03); o.fL = o.fR = -.08; o.kL = .08; o.py = an7Ground(o); return 'sad'; },
  dance(o, t) { const b = Math.abs(Math.sin(t * 1.6)); o.kL = o.kR = .25 + b * .3; o.lLx = o.lRx = -.12 - b * .12; o.lLz = abL(.08); o.lRz = abR(.08); o.bry = Math.sin(t * .8) * .45; o.crz = Math.sin(t * 1.6) * .08;
    o.aLz = abL(1.0 + Math.sin(t * 1.6) * .7); o.aRz = abR(1.0 + Math.sin(t * 1.6 + Math.PI) * .7); o.fL = -1.1 - Math.sin(t * 1.6) * .4; o.fR = -1.1 + Math.sin(t * 1.6) * .4; o.hrz = Math.sin(t * 1.6) * .1; o.py = an7Ground(o) + b * .05; return 'happy'; },
  pray(o) { o.aLx = o.aRx = -.42; o.aLz = abL(-.5); o.aRz = abR(-.5); o.fL = o.fR = -1.85; o.hrx = .38; o.crx = .1; o.kL = o.kR = .05; o.py = an7Ground(o); return null; },
  train(o, t) { const s = Math.max(0, Math.sin(t * 1.1)); o.lLx = o.lRx = -1.25 * s; o.kL = o.kR = 2.1 * s; o.lLz = abL(.12); o.lRz = abR(.12); o.crx = .5 * s; o.hrx = -.4 * s; o.aLx = o.aRx = -1.45 - .3 * s; o.aLz = abL(.05); o.aRz = abR(.05); o.fL = o.fR = 0; o.py = an7Ground(o); return 'angry'; },
  think(o, t) { o.aRx = -.62; o.aRz = abR(-.32); o.fR = -2.35; o.aLx = -.3; o.aLz = abL(-.45); o.fL = -1.55; o.hrz = .14; o.hrx = .06 + Math.sin(t * .4) * .03; o.hry = -.15; o.kL = .1; o.py = an7Ground(o); return null; },
  love(o, t) { const j = Math.abs(Math.sin(t * .9)); o.aLx = o.aRx = -.42; o.aLz = abL(-.48); o.aRz = abR(-.48); o.fL = o.fR = -1.95; o.crx = -.06; o.hrz = Math.sin(t * .45) * .15; o.kL = o.kR = (1 - j) * .25; o.py = an7Ground(o) + j * .12; return 'happy'; },
  kuduro(o, t) { const b = t * 1.6, ph = Math.floor(b / Math.PI) % 4, s1 = Math.max(0, Math.sin(b * 2)), s2 = Math.max(0, -Math.sin(b * 2));
    o.crx = .15; o.bry = [.5, -.5, .25, -.25][ph]; o.crz = Math.sin(b) * .1; o.lLx = -s1 * 1.0 - .1; o.lRx = -s2 * 1.0 - .1; o.kL = .35 + s1 * 1.3; o.kR = .35 + s2 * 1.3; o.lLz = abL(.22 + Math.abs(Math.sin(b)) * .2); o.lRz = abR(.22 + Math.abs(Math.cos(b)) * .2);
    o.aLx = -1.1 + Math.sin(b * 2) * .5; o.aRx = -1.1 - Math.sin(b * 2) * .5; o.aLz = abL(.7); o.aRz = abR(.7); o.fL = -1.5 + Math.sin(b * 4) * .35; o.fR = -1.5 - Math.sin(b * 4) * .35; o.hrx = Math.sin(b * 4) * .12; o.py = an7Ground(o) + Math.abs(Math.sin(b * 2)) * .08; return 'laugh'; },
  kizomba(o, t) { const b = t * .55, s = Math.sin(b * 2); o.lLx = s * .25; o.lRx = -s * .25; o.kL = .18 + Math.max(0, s) * .25; o.kR = .18 + Math.max(0, -s) * .25; o.bry = Math.sin(b) * .25; o.brz = Math.sin(b * 2) * .06; o.crz = -o.brz * .6;
    o.aLx = -.95; o.aLz = abL(.45); o.fL = -1.45; o.aRx = -.55; o.aRz = abR(-.55); o.fR = -1.25; o.hry = -Math.sin(b) * .15; o.hrz = .1; o.py = an7Ground(o); return 'happy'; },
  semba(o, t) { const b = t * .9, s = Math.sin(b * 2); o.bry = Math.sin(b * .5) * 1.4; o.lLx = s * .5; o.lRx = -s * .5; o.kL = .15 + Math.max(0, s) * .5; o.kR = .15 + Math.max(0, -s) * .5; o.brz = s * .05;
    o.aLz = abL(1.9 + s * .25); o.fL = -.6; o.aRx = -.6; o.aRz = abR(.35); o.fR = -1.1; o.py = an7Ground(o) + Math.abs(s) * .04; return 'happy'; },
  afro(o, t) { const b = t * 1.1, s = Math.sin(b); o.crx = .12 + Math.sin(b * 4) * .07; o.bry = s * .3; o.lLz = abL(Math.max(0, s) * .35); o.lRz = abR(Math.max(0, -s) * .35); o.lLx = o.lRx = -.18; o.kL = o.kR = .4 + Math.abs(Math.sin(b * 2)) * .15;
    o.aLx = -.7 + Math.sin(b * 2) * .45; o.aRx = -.7 - Math.sin(b * 2) * .45; o.aLz = abL(.3); o.aRz = abR(.3); o.fL = o.fR = -1.3; o.hrx = Math.sin(b * 4) * .1; o.py = an7Ground(o); return 'happy'; },
  wave(o, t) { o.aRz = abR(2.35); o.aRx = -.25; o.fR = -.55 + Math.sin(t * 1.6) * .5; o.aLz = abL(.08); o.fL = -.15; o.hrz = -.08; o.hry = .1; o.kL = .1; o.py = an7Ground(o); return 'happy'; },
  clap(o, t) { const c = Math.abs(Math.sin(t * 1.5)); o.aLx = o.aRx = -.7; o.aLz = abL(-.35 + c * .3); o.aRz = abR(-.35 + c * .3); o.fL = o.fR = -1.45; o.crx = .04; o.kL = o.kR = .06; o.py = an7Ground(o); return 'happy'; },
  laugh(o, t) { const s = Math.sin(t * 2); o.crx = -.14 + s * .05; o.hrx = -.28; o.aLx = o.aRx = -.3; o.aLz = abL(-.32); o.aRz = abR(-.32); o.fL = o.fR = -1.35; o.kL = o.kR = .12 + Math.abs(s) * .05; o.py = an7Ground(o) + Math.abs(s) * .02; return 'laugh'; },
  angry(o, t) { o.aLz = abL(.32); o.aRz = abR(.32); o.aLx = o.aRx = .1; o.fL = o.fR = -1.0; o.crx = .12; o.hrx = .12; const st = Math.sin(t * 2) > .7; o.lRx = st ? -.35 : 0; o.kR = st ? .5 : .05; o.py = an7Ground(o); return 'angry'; },
  shrug(o, t, a) { const k = Math.min(1, a * 4); o.aLz = abL(.35 * k); o.aRz = abR(.35 * k); o.aLx = o.aRx = -.25 * k; o.fL = o.fR = -1.45 * k; o.hrz = .2 * k; o.crz = -.04 * k; o.py = an7Ground(o) + .02 * k; return 'surprise'; },
  facepalm(o) { o.aRx = -.95; o.aRz = abR(-.3); o.fR = -2.25; o.hrx = .35; o.crx = .14; o.aLz = abL(.08); o.fL = -.2; o.kL = .1; o.py = an7Ground(o); return 'sad'; },
  point(o) { o.aRx = -1.5; o.aRz = abR(.05); o.fR = -.05; o.cry = -.15; o.hry = -.05; o.aLz = abL(.08); o.fL = -.15; o.lRx = -.15; o.kL = .08; o.py = an7Ground(o); return 'surprise'; },
  bow(o, t, a, h) { const k = Math.min(1, a * 2.2) * (h.emoteT > .5 ? 1 : h.emoteT * 2); o.crx = .8 * k; o.hrx = .2 * k; o.aLx = o.aRx = -.15 * k; o.aLz = abL(.04); o.aRz = abR(.04); o.fL = o.fR = -.1; o.lLx = o.lRx = .1 * k; o.py = an7Ground(o); return null; },
  kiss(o, t, a) { const k = a > 1 ? Math.min(1, (a - 1) * 3) : 0; o.aRx = -.95 - k * .55; o.aRz = abR(-.22 + k * .2); o.fR = -2.25 + k * 1.8; o.hrx = -.05; o.aLz = abL(.08); o.py = an7Ground(o); return 'kiss'; },
  yes(o, t) { o.hrx = Math.sin(t * 1.6) * .25; o.aRx = -.55; o.aRz = abR(.1); o.fR = -1.5; o.py = an7Ground(o); return 'happy'; },
  no(o, t) { o.hry = Math.sin(t * 1.6) * .4; o.aRx = -.45; o.aRz = abR(-.1 + Math.sin(t * 2.4) * .12); o.fR = -2.0; o.py = an7Ground(o); return 'angry'; },
  pushup(o, t) { const s = (Math.sin(t * .8) + 1) / 2, th = 1.1 + s * .14; o.brx = th; o.py = 0; o.aLx = o.aRx = -th + s * .55; o.fL = o.fR = -s * 1.1; o.aLz = abL(.22); o.aRz = abR(.22); o.hrx = -.6; o.lLx = o.lRx = 0; o.kL = o.kR = 0; return 'angry'; },
  sit(o, t) { o.py = -.72; o.lLx = o.lRx = -1.35; o.kL = o.kR = 1.95; o.lLz = abL(.12); o.lRz = abR(.12); o.crx = -.18; o.hrx = .12; o.aLx = o.aRx = .55; o.aLz = abL(.22); o.aRz = abR(.22); o.fL = o.fR = 0; o.hry = Math.sin(t * .12) * .25; return null; },
  selfie(o) { o.aRx = -1.85; o.aRz = abR(.38); o.fR = -.45; o.aLz = abL(.4); o.aLx = .1; o.fL = -1.3; o.hry = -.25; o.hrz = .12; o.lLx = -.1; o.kL = .12; o.py = an7Ground(o); return 'happy'; },
};
function an7Apply(h, o, k) {
  const P = h.P, L = (obj, ax, v) => { if (obj) obj.rotation[ax] += (v - obj.rotation[ax]) * k; };
  P.body.position.y += (o.py - P.body.position.y) * k;
  L(P.body, 'x', o.brx); L(P.body, 'y', o.bry); L(P.body, 'z', o.brz);
  L(P.chest, 'x', o.crx); L(P.chest, 'y', o.cry); L(P.chest, 'z', o.crz);
  L(P.head, 'x', o.hrx); L(P.head, 'y', o.hry); L(P.head, 'z', o.hrz);
  L(P.armL, 'x', o.aLx); L(P.armL, 'y', o.aLy); L(P.armL, 'z', o.aLz); L(P.armR, 'x', o.aRx); L(P.armR, 'y', o.aRy); L(P.armR, 'z', o.aRz);
  L(P.foreL, 'x', o.fL); L(P.foreR, 'x', o.fR);
  L(P.legL, 'x', o.lLx); L(P.legL, 'z', o.lLz); L(P.legR, 'x', o.lRx); L(P.legR, 'z', o.lRz);
  L(P.shinL, 'x', o.kL); L(P.shinR, 'x', o.kR);
}
/* sentado numa cadeira/banco/veículo (seat = altura do assento) */
function an7SitPose(seat) { const o = an7Z(); o.py = (seat || .47) + .06 - .92; o.lLx = o.lRx = -1.45; o.kL = o.kR = 1.45; o.lLz = abL(.06); o.lRz = abR(.06); o.aLx = o.aRx = -.5; o.aLz = abL(.1); o.aRz = abR(.1); o.fL = o.fR = -.7; o.crx = -.04; return o; }
function an7Sit(h, seat) { if (!h || !h.P) return; h.sitUntil = performance.now() + 300; h.sitSeat = seat; if (!h.an) an7Apply(h, an7SitPose(seat), 1); }

function animHuman(h, dt, moving, run) {
  const P = h.P; if (!P) return; if (!P.chest) an7Rig(h);
  dt = Math.min(dt || .016, .1);
  h.t += dt * (moving ? (run ? 13 : 9) : 2.5);
  blink(h, dt);
  /* velocidade real (unidades do modelo por segundo) */
  const g = h.g, sc = g.scale.x || 1, pos = g.position;
  let spd = 0; if (h.lp) { const d = Math.hypot(pos.x - h.lp.x, pos.z - h.lp.z) / sc; if (d < 3) spd = d / dt; } h.lp = { x: pos.x, z: pos.z };
  h.spd = (h.spd || 0) + (spd - (h.spd || 0)) * Math.min(1, dt * 12);
  const A = h.an || (h.an = { ph: Math.random() * 6, wW: 0, rW: 0, eW: 0, last: null, init: true });
  /* fase da passada: ligada à distância percorrida */
  const wA = Math.max(.26, Math.min(.55, .22 + h.spd * .056)); A.A = (A.A || wA) + (wA - (A.A || wA)) * Math.min(1, dt * 4);
  const cyc = run ? 3.5 : 3.3 * A.A * 1.3;
  if (moving) A.ph += (h.spd > .3 ? Math.min(3.4, h.spd / cyc) : (run ? 2.2 : 1.3)) * Math.PI * 2 * dt;
  A.wW += ((moving ? 1 : 0) - A.wW) * Math.min(1, dt * 9);
  A.rW += ((run ? 1 : 0) - A.rW) * Math.min(1, dt * 6);
  const sitting = !moving && h.sitUntil && performance.now() < h.sitUntil;
  const emo = h.emoteT > 0 && h.emote && AN7_EM[h.emote];
  A.eW += ((emo ? 1 : 0) - A.eW) * Math.min(1, dt * 10);
  /* pose de locomoção */
  let o = an7Z();
  if (sitting) o = an7SitPose(h.sitSeat);
  else if (h.idleDance && !moving) AN7_EM.dance(o, h.t * 3.2);
  else {
    const id = an7Z(); an7Idle(h, id, h.t);
    if (A.wW > .01) {
      const w = an7Z(); an7Gait(h, w, A.ph, false);
      if (A.rW > .01) { const r = an7Z(); an7Gait(h, r, A.ph, true); AN7_K.forEach(k => w[k] += (r[k] - w[k]) * A.rW); }
      AN7_K.forEach(k => o[k] = id[k] + (w[k] - id[k]) * A.wW);
    } else o = id;
  }
  /* gesto por cima */
  let fe = null;
  if (h.emoteT > 0) {
    h.emoteT -= dt; h.emAge = (h.emAge || 0) + dt;
    if (emo) { const e = an7Z(); fe = emo(e, h.emAge * 8, h.emAge, h); A.lastE = e; A.lastFe = fe; }
    if (h.emoteT <= 0) { h.emote = null; h.emAge = 0; }
  }
  if (A.eW > .01 && A.lastE) { const e = A.lastE; AN7_K.forEach(k => o[k] += (e[k] - o[k]) * A.eW); }
  if (fe || A.faceOn) { faceExpr(P, fe, h.emAge * 8); A.faceOn = !!fe; }
  /* aplicar com suavização (rápida para não perder a passada) */
  const k = A.init ? 1 : 1 - Math.exp(-dt * (A.eW > .05 && A.eW < .95 ? 16 : 24));
  A.init = false;
  an7Apply(h, o, k);
  if (P.body.scale.z !== 1 && moving) P.body.scale.z = 1;
}

/* sentar (veículos, sofás, NPCs sentados) passa a dobrar os joelhos */
(function () {
  if (typeof v2Sit === 'function') v2Sit = function (h, seat) { an7Sit(h, seat); if (h && h.an) an7Apply(h, an7SitPose(seat), .35); };
  if (typeof ivNPC === 'function') { const _n = ivNPC; ivNPC = function (D, x, z, ry, o = {}) { const n = _n.apply(this, arguments); try { if (n.mode === 'sit') { an7Apply(n.h, an7SitPose(o.seat), 1); n.h.an = null; } else if (n.mode === 'statue') { const p = an7Z(); an7Idle(n.h, p, 0); an7Apply(n.h, p, 1); } } catch (e) { } return n; }; }
  if (typeof ivAnimNPC === 'function') { const _a = ivAnimNPC; ivAnimNPC = function (n, dt) {
    if (n.mode === 'work') { const h = n.h, P = h.P; h.t += dt * 9; const o = an7Z(); an7Idle(h, o, h.t * .3); o.aLx = -.75 + Math.sin(h.t) * .1; o.aRx = -.75 + Math.sin(h.t + 1.7) * .1; o.aLz = abL(-.15); o.aRz = abR(-.15); o.fL = o.fR = -.9; o.hrx = .3; o.crx = .12; o.hry = 0; an7Apply(h, o, Math.min(1, dt * 10)); blink(h, dt); return; }
    return _a.apply(this, arguments); }; }
})();
