/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Céu vivo e detalhes: nuvens à deriva,
   pássaros, barcos na baía, arco-íris depois da chuva, pools
   de luz dos candeeiros à noite, cisternas e antenas nos
   telhados, flamboyants e mulembas nas ruas.
   Carregado depois de city.js / mundo.js.
   ========================================================= */
(function () {
  if (typeof T === 'undefined') return;

  /* ---------------- ☁️ nuvens ---------------- */
  const CLOUDS = []; window._ceuClouds = CLOUDS;   // expostas para as sombras no chão (detalhes.js)
  function cloudTex() {
    return ctex(256, 128, x => {
      x.clearRect(0, 0, 256, 128);
      for (let i = 0; i < 14; i++) {
        const cx = 30 + Math.random() * 196, cy = 45 + Math.random() * 42, r = 18 + Math.random() * 30;
        const g = x.createRadialGradient(cx, cy, 2, cx, cy, r);
        g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(.7, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
      }
    });
  }
  function mkClouds() {
    const tex = cloudTex(), n = GFX_HD ? 14 : 9;
    for (let i = 0; i < n; i++) {
      const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, opacity: .55, depthWrite: false, fog: false }));
      s.position.set(Math.random() * 900 - 450, 65 + Math.random() * 55, Math.random() * 760 - 400);
      const w = 45 + Math.random() * 70;
      s.scale.set(w, w * .32, 1);
      s.userData.v = .5 + Math.random() * 1.1;
      worldScene.add(s); CLOUDS.push(s);
    }
  }

  /* ---------------- 🐦 pássaros ---------------- */
  const FLOCKS = [];
  function mkBird() {
    const b = new T.Group();
    const wm = new T.MeshBasicMaterial({ color: '#1c1c22', side: T.DoubleSide });
    const w1 = new T.Mesh(new T.PlaneGeometry(.9, .3), wm), w2 = new T.Mesh(new T.PlaneGeometry(.9, .3), wm);
    w1.position.x = -.45; w2.position.x = .45; b.add(w1, w2);
    b.userData = { w1, w2, ph: Math.random() * 6 };
    return b;
  }
  function mkBirds() {
    for (let f = 0; f < (GFX_HD ? 3 : 2); f++) {
      const g = new T.Group();
      for (let i = 0; i < 5; i++) { const b = mkBird(); b.position.set((i % 2 ? -1 : 1) * Math.ceil(i / 2) * 1.6, -Math.ceil(i / 2) * .5, -Math.ceil(i / 2) * 2.2); g.add(b); }
      g.userData = { cx: Math.random() * 200 - 100, cz: Math.random() * 200 - 60, r: 35 + Math.random() * 45, h: 26 + Math.random() * 22, a: Math.random() * 6.3, sp: .12 + Math.random() * .1 };
      worldScene.add(g); FLOCKS.push(g);
    }
  }

  /* ---------------- ⛵ barcos na baía ---------------- */
  const BOATS = [];
  function mkBoat(x, z, col) {
    const g = new T.Group(); g.position.set(x, 0, z);
    const hull = mat(col || pick(['#e8e2d4', '#c8102e', '#1f63c9', '#ffcb00']));
    const casco = mesh(bx(3.4, .8, 1.4), hull, 0, .3, 0, g);
    casco.scale.z = 1; mesh(bx(2.2, .5, 1.1), mat('#8a6a48'), -.2, .9, 0, g);
    mesh(cyl(.05, .06, 5.4, 6), mat('#6b4a2e'), .3, 3.2, 0, g);
    const vela = mesh(new T.PlaneGeometry(2.2, 3.4), mat('#f7f3e8', { side: T.DoubleSide, roughness: .8 }), 1.45, 3.3, 0, g, false);
    vela.rotation.y = .12;
    worldScene.add(g);
    g.userData = { bx: x, bz: z, ph: Math.random() * 6, drift: .3 + Math.random() * .5, dir: Math.random() < .5 ? 1 : -1 };
    BOATS.push(g);
  }
  function mkBoats() { mkBoat(-120, -180, '#e8e2d4'); mkBoat(30, -230, '#c8102e'); if (GFX_HD) mkBoat(120, -190, '#1f63c9'); }

  /* ---------------- 🌈 arco-íris depois da chuva ---------------- */
  let RAINBOW = null, rbT = 0, chuva0 = 0;
  function mkRainbow() {
    const tex = ctex(64, 16, x => {
      const cores = ['#ff5b5b', '#ffa53b', '#ffe93b', '#4cc94c', '#4b9bff', '#8a5bd6'];
      cores.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * 2.2, 64, 3); });
    });
    const g = new T.Mesh(new T.RingGeometry(46, 60, 48, 1, 0, Math.PI),
      new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, fog: false }));
    g.rotation.x = 0; g.position.set(40, 0, -260); // sobre a baía
    g.renderOrder = 5; worldScene.add(g);
    RAINBOW = g;
  }

  /* ---------------- 💡 pools de luz dos candeeiros ---------------- */
  let poolMat = null;
  function poolTex() {
    return ctex(128, 128, x => {
      const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
      g.addColorStop(0, 'rgba(255,214,130,.75)'); g.addColorStop(.55, 'rgba(255,200,110,.28)'); g.addColorStop(1, 'rgba(255,200,110,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    });
  }
  const _lamp = lamp;
  lamp = function (x, z, ry) {
    _lamp(x, z, ry);
    if (LITE) return;
    if (!poolMat) { poolMat = new T.MeshBasicMaterial({ map: poolTex(), transparent: true, opacity: 0, depthWrite: false }); poolMat.name = 'lampPool'; poolMat.userData.noShadow = true; }
    const p = new T.Mesh(new T.PlaneGeometry(8.5, 8.5), poolMat);
    p.rotation.x = -Math.PI / 2;
    p.position.set(x + Math.sin(ry) * 1.3, .06, z + Math.cos(ry) * 1.3);
    p.renderOrder = 2; decor.add(p);
  };

  /* ---------------- 🛢️ telhados: cisternas, antenas, ar condicionado ---------------- */
  const _bldg = bldg;   // a cidade constrói-se com bldg() (city.js) — o wrap tem de ser aqui
  bldg = function (cx, cz, w, d, h, opts = {}) {
    const b = _bldg(cx, cz, w, d, h, opts);
    if (LITE || h < 7) return b;
    const r = Math.random();
    if (r < .75) {   // cisterna branca (Luanda tem milhares)
      const c = mesh(cyl(1, 1.1, 1.4, 10), mat('#e8e8e8', { roughness: .5 }), cx + (Math.random() * .5 - .25) * (w - 2.5), h + .7, cz + (Math.random() * .5 - .25) * (d - 2.5), decor, false);
      c.castShadow = false;
    }
    if (r < .5) {   // antena de TV
      const ax = cx + (Math.random() * .6 - .3) * w, az = cz + (Math.random() * .6 - .3) * d;
      mesh(cyl(.03, .05, 3.4, 4), mat('#3a3a3a'), ax, h + 1.7, az, decor, false);
      mesh(bx(1.1, .04, .04), mat('#3a3a3a'), ax, h + 3, az, decor, false);
      mesh(bx(.7, .04, .04), mat('#3a3a3a'), ax, h + 3.4, az, decor, false);
    }
    if (r > .55 && w > 6) {   // caixa de ar condicionado / casa das máquinas
      mesh(bx(1.6, .9, 1.2), mat('#b9b2a6', { roughness: .8 }), cx + (Math.random() * .4 - .2) * w, h + .45, cz + (Math.random() * .4 - .2) * d, decor, false);
    }
    return b;
  };

  /* ---------------- 🌳 variedade de árvores: flamboyant e mulemba ---------------- */
  function flamboyant(x, z, s = 1) {   // copa larga com flores vermelhas (as ruas de Luanda floridas)
    const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); decor.add(g);
    mesh(cyl(.14, .24, 2.6, 6), mat('#7a543a'), 0, 1.3, 0, g);
    const lm = mat('#2f6e28', { roughness: .9 });
    [[0, 3.4, 0, 2.1], [1.1, 3, .5, 1.3], [-1.1, 3.1, -.5, 1.3]].forEach(([a, b, c, r]) => mesh(sph(r, 9, 7), lm, a, b, c, g).scale.y = .62);
    const fm = mat('#d93a2b', { roughness: .8 });
    for (let i = 0; i < 7; i++) mesh(sph(.16, 6, 5), fm, (Math.random() - .5) * 3.4, 3.1 + Math.random() * 1.1, (Math.random() - .5) * 3.2, g, false);
    addCol(x, z, .5, .5);
    return g;
  }
  function mulemba(x, z, s = 1) {   // a árvore sagrada: tronco grosso e copa alta
    const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); decor.add(g);
    mesh(cyl(.42, .6, 3.6, 8), mat('#9c8a72'), 0, 1.8, 0, g);
    const lm = mat('#3f7d2c', { roughness: .9 });
    [[0, 4.4, 0, 1.4], [.8, 4, .4, 1], [-.8, 4.1, -.4, 1]].forEach(([a, b, c, r]) => mesh(sph(r, 8, 6), lm, a, b, c, g).scale.y = .75);
    addCol(x, z, .9, .9);
    return g;
  }
  const _treeA = treeA;
  treeA = function (x, z, s = 1) {
    const r = Math.random();
    if (r < .16) return mulemba(x, z, s * 1.25);
    if (r < .4) return flamboyant(x, z, s);
    return _treeA(x, z, s);
  };

  /* ---------------- arranque com o mundo ---------------- */
  const _bw = buildWorld;
  buildWorld = function () {
    const r = _bw.apply(this, arguments);
    if (!LITE) { try { mkClouds(); mkBirds(); mkBoats(); mkRainbow(); } catch (e) { console.error('ceu:', e); } }
    return r;
  };

  /* ---------------- tick (chamado do updateWorld) ---------------- */
  const _nuvC = new T.Color('#566270');
  window.ceuTick = function (dt, day, night, sunDir) {
    const t = wTime;
    // nuvens à deriva (escurecem à noite e com chuva)
    for (const c of CLOUDS) {
      c.position.x += c.userData.v * dt * 2;
      if (c.position.x > 480) c.position.x = -480;
      c.material.opacity = (.28 + day * .35) * (1 - WTH.rain * .4);
      c.material.color.setScalar(.35 + day * .65).lerp(_nuvC, WTH.rain * .5);
    }
    // pássaros: voos circulares; pousam com chuva forte
    for (const f of FLOCKS) {
      const u = f.userData; u.a += u.sp * dt;
      f.position.set(u.cx + Math.cos(u.a) * u.r, u.h + Math.sin(t * .7 + u.a) * 1.6, u.cz + Math.sin(u.a) * u.r);
      f.rotation.y = -u.a - Math.PI / 2;
      f.visible = WTH.rain < .6;
      f.children.forEach(b => { const w = Math.sin(t * 9 + b.userData.ph) * .55; b.userData.w1.rotation.z = w; b.userData.w2.rotation.z = -w; });
    }
    // barcos: baloiçam com as ondas e derivam devagar
    for (const b of BOATS) {
      const u = b.userData;
      u.bx += Math.sin(t * .1 + u.ph) * u.drift * dt * u.dir;
      b.position.x = u.bx; b.position.z = u.bz;
      b.position.y = Math.sin(u.bx * .08 + t * 1.4) * .22 + Math.cos(u.bz * .11 + t * 1.1) * .18 - .35;
      b.rotation.z = Math.sin(t * .9 + u.ph) * .05; b.rotation.x = Math.cos(t * .7 + u.ph) * .04;
    }
    // 🌈 a chuva parou de dia? arco-íris sobre a baía durante 45 s
    if (chuva0 > .3 && WTH.alvo === 0 && WTH.rain < .15 && day > .35 && rbT <= 0) rbT = 45;
    chuva0 = WTH.rain;
    if (RAINBOW) {
      if (rbT > 0) { rbT -= dt; RAINBOW.material.opacity = Math.min(.55, RAINBOW.material.opacity + dt * .25) * (rbT > 5 ? 1 : Math.max(0, rbT / 5)); if (rbT <= 0) RAINBOW.material.opacity = 0; }
      else if (RAINBOW.material.opacity > 0) RAINBOW.material.opacity = Math.max(0, RAINBOW.material.opacity - dt * .3);
    }
    // pools de luz acendem-se à noite
    if (poolMat) poolMat.opacity = night * .38 * (1 - WTH.rain * .35);
  };
})();
