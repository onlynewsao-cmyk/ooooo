/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Detalhes vivos da cidade (onda 2):
   🚗 faróis dos veículos à noite · 🌊 mar com a cor do dia e
   brilho do sol · 🚦 semáforos com ciclo · 🐕🐈🐓🕊️ animais
   de rua · 👕 estendais de roupa no musseque · 🌴 palmeiras
   na marginal · ☁️ sombras das nuvens · 🌠 estrelas cadentes
   · 🛰️ parabólicas nas casas · 🌫️ névoa da manhã.
   Carregado depois de ceu.js. No modo LITE só mar + névoa.
   ========================================================= */
(function () {
  if (typeof T === 'undefined') return;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function glowTex(rgb) {   // rgb = '255,243,192'
    return ctex(64, 64, x => {
      const g = x.createRadialGradient(32, 32, 1, 32, 32, 31);
      g.addColorStop(0, `rgba(${rgb},.95)`); g.addColorStop(.45, `rgba(${rgb},.3)`); g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    });
  }

  /* ---------------- 🌊 mar vivo ---------------- */
  let SEA = null, GLINT = null;
  const _seaC = new T.Color(), seaDayC = new T.Color('#137cb0'), seaNightC = new T.Color('#06182e'), seaDuskC = new T.Color('#b56a45'), seaRainC = new T.Color('#40586c');
  function mkSea() {
    worldScene.traverse(o => { if (!SEA && o.isMesh && o.geometry === seaGeo) SEA = o; });
    if (!SEA) return;
    GLINT = new T.Mesh(new T.PlaneGeometry(210, 70),
      new T.MeshBasicMaterial({ map: glowTex('255,236,180'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
    GLINT.rotation.x = -Math.PI / 2; GLINT.position.set(0, .25, -235); GLINT.renderOrder = 3;
    worldScene.add(GLINT);
  }

  /* ---------------- 🚗 faróis dos veículos ---------------- */
  let headMat = null, tailMat = null, hPoolMat = null;
  function mkHeadlights() {
    headMat = new T.SpriteMaterial({ map: glowTex('255,243,192'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: false }); headMat.name = 'headGlow';
    tailMat = new T.SpriteMaterial({ map: glowTex('255,59,48'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: false }); tailMat.name = 'tailGlow';
    hPoolMat = new T.MeshBasicMaterial({ map: glowTex('255,230,150'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }); hPoolMat.name = 'headPool'; hPoolMat.userData.noShadow = true;
    vans.forEach(v => {
      [[2.35, .85, .68], [2.35, .85, -.68]].forEach(p => { const s = new T.Sprite(headMat); s.position.set(p[0], p[1], p[2]); s.scale.setScalar(.85); v.g.add(s); });
      const tb = new T.Sprite(tailMat); tb.position.set(-2.3, .95, 0); tb.scale.set(1.5, .5, 1); v.g.add(tb);
      const p = new T.Mesh(new T.PlaneGeometry(5, 2.8), hPoolMat); p.rotation.x = -Math.PI / 2; p.position.set(4.6, .07, 0); p.renderOrder = 2; v.g.add(p);
    });
  }

  /* ---------------- 🚦 semáforos ---------------- */
  const SEMAFS = [];
  let semOff = null, semR = null, semY = null, semG = null, semGlow = null;
  function semaforo(x, z, ry, off) {
    semOff = semOff || mat('#26292e', { roughness: .6 });
    semR = semR || new T.MeshStandardMaterial({ color: '#400f0d', emissive: '#ff2d20', emissiveIntensity: 1.7 });
    semY = semY || new T.MeshStandardMaterial({ color: '#40350d', emissive: '#ffc400', emissiveIntensity: 1.6 });
    semG = semG || new T.MeshStandardMaterial({ color: '#0d3318', emissive: '#25d366', emissiveIntensity: 1.7 });
    semGlow = semGlow || (() => { const m = new T.SpriteMaterial({ map: glowTex('255,222,130'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: false }); m.name = 'semGlow'; return m; })();
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; worldScene.add(g);
    mesh(cyl(.07, .09, 3.4, 8), semOff, 0, 1.7, 0, g);
    mesh(bx(.42, 1.08, .3), semOff, 0, 3.72, 0, g, false);
    const ls = [0, 1, 2].map(i => mesh(sph(.13, 8, 6), semOff, 0, 4.06 - i * .35, .18, g, false));
    const gl = new T.Sprite(semGlow); gl.position.set(0, 4.06, .35); gl.scale.setScalar(1.25); g.add(gl);
    SEMAFS.push({ ls, gl, off, st: -1 });
  }
  function mkSemaforos() {
    semaforo(6.4, 16.4, Math.atan2(-6.4, -6.4), 0);        // centro / mercado
    semaforo(-53.6, -33.6, Math.atan2(-6.4, 6.4), 9.3);    // baixa
    semaforo(66.4, 16.4, Math.atan2(-6.4, -6.4), 4.6);     // mutamba
    semaforo(-6.4, 66.4, Math.atan2(6.4, -6.4), 13.9);     // centro habitacional
  }

  /* ---------------- 🐕🐈🐓🕊️ animais de rua ---------------- */
  const ANIM = []; window._detAnim = ANIM;
  function mkAnimal(kind, hx, hz, r) {
    const g = new T.Group(); const legs = [];
    if (kind === 'cao') {
      const cm = mat(pick(['#8a6a48', '#5e4630', '#b59a76', '#3d3226']));
      mesh(bx(.26, .3, .6), cm, 0, .42, 0, g);
      mesh(bx(.22, .22, .24), cm, 0, .56, .36, g, false);
      mesh(bx(.09, .06, .14), cm, 0, .5, .52, g, false);
      mesh(bx(.05, .13, .08), cm, .08, .72, .3, g, false); mesh(bx(.05, .13, .08), cm, -.08, .72, .3, g, false);
      const tail = mesh(cyl(.04, .02, .34, 5), cm, 0, .56, -.4, g, false); tail.rotation.x = -.9;
      [[.09, .2], [-.09, .2], [.09, -.2], [-.09, -.2]].forEach(([lx, lz]) => legs.push(mesh(cyl(.032, .026, .32, 5), cm, lx, .16, lz, g, false)));
    } else if (kind === 'gato') {
      const cm = mat(pick(['#3a3a3e', '#c98a4b', '#8f8f96', '#222226']));
      mesh(bx(.2, .24, .46), cm, 0, .32, 0, g);
      mesh(sph(.13, 8, 6), cm, 0, .42, .28, g, false);
      const e1 = mesh(new T.ConeGeometry(.05, .1, 4), cm, .06, .53, .26, g, false), e2 = mesh(new T.ConeGeometry(.05, .1, 4), cm, -.06, .53, .26, g, false);
      const tail = mesh(cyl(.025, .015, .4, 5), cm, 0, .38, -.3, g, false); tail.rotation.x = -1.15;
      [[.07, .16], [-.07, .16], [.07, -.16], [-.07, -.16]].forEach(([lx, lz]) => legs.push(mesh(cyl(.024, .02, .24, 5), cm, lx, .12, lz, g, false)));
    } else if (kind === 'galinha') {
      const cm = mat(pick(['#f2f2f2', '#c98a4b', '#8a4b2d']));
      mesh(sph(.17, 8, 6), cm, 0, .27, 0, g).scale.z = 1.25;
      mesh(sph(.09, 7, 5), cm, 0, .44, .15, g, false);
      mesh(new T.ConeGeometry(.035, .1, 5), mat('#e8a020'), 0, .43, .26, g, false).rotation.x = Math.PI / 2;
      mesh(bx(.03, .07, .05), mat('#d92b20'), 0, .52, .14, g, false);
      const tl = mesh(new T.ConeGeometry(.09, .22, 5), cm, 0, .36, -.2, g, false); tl.rotation.x = -1;
      [.05, -.05].forEach(lx => legs.push(mesh(cyl(.013, .013, .16, 4), mat('#e8a020'), lx, .08, 0, g, false)));
    } else {   // pombo
      const cm = mat(pick(['#8f8f96', '#6a6a72', '#b9b9c0']));
      mesh(sph(.13, 8, 6), cm, 0, .2, 0, g).scale.z = 1.3;
      mesh(sph(.07, 7, 5), cm, 0, .33, .11, g, false);
      mesh(new T.ConeGeometry(.025, .07, 5), mat('#3a3a3a'), 0, .33, .19, g, false).rotation.x = Math.PI / 2;
      const tl = mesh(bx(.12, .02, .18), cm, 0, .22, -.18, g, false); tl.rotation.x = .25;
      [.045, -.045].forEach(lx => legs.push(mesh(cyl(.011, .011, .1, 4), mat('#c9522e'), lx, .05, 0, g, false)));
    }
    g.position.set(hx, 0, hz); worldScene.add(g);
    ANIM.push({ g, legs, hx, hz, r, tx: hx, tz: hz, sp: kind === 'cao' ? 1.7 : kind === 'gato' ? 1.3 : .75, pause: rnd(0, 2.5), kind, ph: rnd(0, 6) });
  }
  function mkAnimais() {
    mkAnimal('cao', 10, 18.2, 22); mkAnimal('cao', -45, 2.8, 18);
    mkAnimal('gato', 40, 53.4, 16); mkAnimal('gato', -80, 67.2, 14);
    for (let i = 0; i < 3; i++) mkAnimal('galinha', -150 + rnd(-8, 8), 86 + rnd(-6, 6), 13);
    for (let i = 0; i < 4; i++) mkAnimal('pombo', -30 + rnd(-3, 3), 21 + rnd(-2, 2), 5.5);
  }

  /* ---------------- 👕 estendais de roupa ---------------- */
  const PANOS = [];
  function estendal(x0, x1, z, PST) {
    const pm = mat('#6b5a44');
    mesh(cyl(.05, .06, 1.9, 6), pm, x0, .95, z, PST);
    mesh(cyl(.05, .06, 1.9, 6), pm, x1, .95, z, PST);
    const L = x1 - x0, lin = mesh(cyl(.014, .014, L, 5), mat('#d8d8d8'), (x0 + x1) / 2, 1.82, z, PST, false);
    lin.rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const geo = new T.PlaneGeometry(.78, .95); geo.translate(0, -.48, 0);
      const p = new T.Mesh(geo, mat(pick(['#e8442e', '#f2b500', '#1f8f5f', '#2743c9', '#d12e8d', '#f2f2f2', '#ff7a1a']), { side: T.DoubleSide, roughness: .9 }));
      p.position.set(x0 + L * (i + .7) / 4.4, 1.82, z); p.userData.ph = rnd(0, 6); p.castShadow = true;
      worldScene.add(p); PANOS.push(p);
    }
  }

  /* ---------------- ☁️ sombras das nuvens ---------------- */
  const NSHAD = [];
  let shadMat = null;
  function mkCloudShadows() {
    shadMat = new T.MeshBasicMaterial({ map: glowTex('10,14,22'), transparent: true, opacity: 0, depthWrite: false });
    shadMat.name = 'cloudShad'; shadMat.userData.noShadow = true;
    for (let i = 0; i < 5; i++) {
      const s = new T.Mesh(new T.PlaneGeometry(75, 36), shadMat);
      s.rotation.x = -Math.PI / 2; s.position.y = .045; s.renderOrder = 1;
      worldScene.add(s); NSHAD.push(s);
    }
  }

  /* ---------------- 🌠 estrelas cadentes ---------------- */
  let starMesh = null, starLife = 0, starNext = 10, starVX = 0, starVY = 0;
  function mkStar() {
    starMesh = new T.Mesh(new T.PlaneGeometry(9, .3),
      new T.MeshBasicMaterial({ map: glowTex('210,230,255'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: false, side: T.DoubleSide }));
    starMesh.visible = false; starMesh.rotation.x = -.45; worldScene.add(starMesh);
  }

  /* ---------------- névoa da manhã ---------------- */
  let fogB = null;

  /* ---------------- construção (hook do buildWorld) ---------------- */
  function mkAll() {
    mkSea();   // mar + brilho: também no LITE (1 material, 1 plano)
    if (LITE) return;
    mkHeadlights(); mkSemaforos(); mkAnimais(); mkCloudShadows(); mkStar();
    const PST = new T.Group();   // estáticos fundidos num só draw call por material
    const sv = decor; decor = PST;
    try {
      for (let x = -170; x <= 170; x += 14.5) {   // 🌴 marginal de palmeiras junto à baía
        const px = x + rnd(-2.5, 2.5), pz = -97.5 + rnd(-1.2, 1.2);
        palm(px, pz, rnd(.8, 1.15)); addCol(px, pz, .45, .45);
      }
      estendal(-163, -157, 85.5, PST); estendal(-147, -141, 86, PST); estendal(-136, -131, 84.8, PST);
    } finally { decor = sv; }
    worldScene.add(mergeStatic(PST));
  }
  const _bw2 = buildWorld;
  buildWorld = function () {
    const r = _bw2.apply(this, arguments);
    try { mkAll(); } catch (e) { console.error('detalhes:', e); }
    return r;
  };

  /* ---------------- 🛰️ parabólicas nas casas de blocos ---------------- */
  const _bh = blockHouse;
  blockHouse = function (cx, cz, c) {
    const r = _bh(cx, cz, c);
    if (!LITE && Math.random() < .6) {
      const dx = cx + rnd(-2.2, 2.2), dz = cz + 1 + rnd(-2, 2);
      mesh(cyl(.05, .06, .7, 6), mat('#5a5a5a'), dx, 3.6, dz, decor, false);
      const dish = mesh(sph(.5, 10, 6), mat('#dcd8d0', { side: T.DoubleSide }), dx, 3.95, dz, decor, false);
      dish.scale.y = .38; dish.rotation.x = -Math.PI / 2 + .7; dish.rotation.y = rnd(0, 6);
    }
    return r;
  };

  /* ---------------- tick (encadeado no ceuTick) ---------------- */
  const _ct = window.ceuTick;
  window.ceuTick = function (dt, day, night, sunDir) {
    if (typeof _ct === 'function') _ct(dt, day, night, sunDir);
    const t = wTime;
    // 🌊 cor do mar e brilho do sol
    if (SEA) {
      const e = sunDir ? sunDir.y : 1;
      _seaC.copy(seaNightC).lerp(seaDayC, day);
      if (e < .3 && e > -.06 && day > .05) _seaC.lerp(seaDuskC, Math.max(0, 1 - Math.abs(e - .1) / .2) * .5);
      if (WTH.rain > .02) _seaC.lerp(seaRainC, WTH.rain * .55);
      SEA.material.color.copy(_seaC);
      if (GLINT) {
        GLINT.material.opacity = Math.max(0, day - .12) * .45 * (1 - WTH.rain) * Math.max(0, Math.min(1, e * 3));
        GLINT.position.x = sunDir ? sunDir.x * 230 : 0;
      }
    }
    // 🌫️ névoa da manhã (pico ~7h)
    if (!fogB && worldScene.fog) fogB = { n: worldScene.fog.near, f: worldScene.fog.far };
    if (fogB) {
      const m = Math.max(0, 1 - Math.abs(dayT - .29) / .07) * (1 - WTH.rain * .5);
      worldScene.fog.near = fogB.n * (1 - .42 * m);
      worldScene.fog.far = fogB.f * (1 - .28 * m);
    }
    if (!SEMAFS.length && !ANIM.length) return;   // LITE ou mundo sem extras

    // 🚗 faróis
    if (headMat) {
      headMat.opacity = night * (1 - WTH.rain * .3) * .95;
      tailMat.opacity = night * .9;
      hPoolMat.opacity = night * .3 * (1 - WTH.rain * .4);
    }
    // 🚦 ciclo dos semáforos (18,6 s: 8 verde · 1,4 amarelo · 9,2 vermelho)
    for (const s of SEMAFS) {
      const ph = (t + s.off) % 18.6, st = ph < 8 ? 2 : ph < 9.4 ? 1 : 0;   // 0 vermelho · 1 amarelo · 2 verde
      if (st !== s.st) {
        s.st = st;
        s.ls[0].material = st === 0 ? semR : semOff;
        s.ls[1].material = st === 1 ? semY : semOff;
        s.ls[2].material = st === 2 ? semG : semOff;
        s.gl.position.y = 4.06 - (st === 0 ? 0 : st === 1 ? 1 : 2) * .35;
      }
      s.gl.material.opacity = night * .75;
    }
    // 🐕🐈🐓🕊️ animais a deambular (escondem-se com chuva forte)
    for (const a of ANIM) {
      a.g.visible = WTH.rain < .5;
      if (!a.g.visible) continue;
      const dx = a.tx - a.g.position.x, dz = a.tz - a.g.position.z, d = Math.hypot(dx, dz);
      if (a.pause > 0) {
        a.pause -= dt;
        if (a.kind === 'galinha' || a.kind === 'pombo') a.g.rotation.x = Math.max(0, Math.sin(t * 7 + a.ph)) * .4;   // a bicar
        a.legs.forEach(l => { l.rotation.x = 0; });
      } else if (d < .3) {
        a.pause = rnd(.8, 3.2);
        const ang = rnd(0, Math.PI * 2), rr = rnd(1.5, a.r);
        a.tx = a.hx + Math.cos(ang) * rr; a.tz = a.hz + Math.sin(ang) * rr;
      } else {
        const vy = Math.atan2(dx, dz); let dd = vy - a.g.rotation.y; dd = Math.atan2(Math.sin(dd), Math.cos(dd));
        a.g.rotation.y += dd * Math.min(1, dt * 8);
        a.g.position.x += Math.sin(a.g.rotation.y) * a.sp * dt;
        a.g.position.z += Math.cos(a.g.rotation.y) * a.sp * dt;
        a.g.rotation.x = 0;
        a.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 11 + a.ph + i * Math.PI) * .5; });
        if (a.kind === 'pombo') a.g.position.y = Math.abs(Math.sin(t * 9 + a.ph)) * .04;
      }
    }
    // 👕 panos ao vento
    for (const p of PANOS) p.rotation.x = Math.sin(t * 1.8 + p.userData.ph) * (.14 + WTH.rain * .15) - WTH.rain * .1;
    // ☁️ sombras das nuvens no chão
    if (shadMat) {
      const cl = window._ceuClouds || [];
      NSHAD.forEach((s, i) => { const c = cl[i * 2]; if (c) { s.position.x = c.position.x; s.position.z = c.position.z + 34; } });
      shadMat.opacity = .16 * day * (1 - WTH.rain * .5);
    }
    // 🌠 estrelas cadentes
    if (starMesh) {
      if (starLife > 0) {
        starLife -= dt;
        starMesh.position.x += starVX * dt; starMesh.position.y += starVY * dt;
        starMesh.material.opacity = Math.min(.9, starLife * 2) * night;
        if (starLife <= 0) starMesh.visible = false;
      } else if (night > .65 && WTH.rain < .3) {
        starNext -= dt;
        if (starNext <= 0) {
          starNext = rnd(14, 40); starLife = rnd(.9, 1.4);
          starMesh.position.set(rnd(-250, 250), rnd(60, 110), rnd(-320, -60));
          starVX = (Math.random() < .5 ? -1 : 1) * rnd(50, 85); starVY = -rnd(9, 16);
          starMesh.rotation.z = Math.atan2(starVY, starVX);
          starMesh.visible = true;
        }
      }
    }
  };
})();
