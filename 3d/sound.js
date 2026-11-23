/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Som
   Efeitos sonoros, ambiente da cidade e rádio com música gerada
   em tempo real (Web Audio, motor musica.js). Só as vozes dos locutores
   vêm de ficheiros (audio/*.mp3, originais do jogo).
   ========================================================= */
const SND = (() => {
  let ctx = null, master, gSfx, gMus, gAmb, noiseBuf = null, ambSrc = null, ambF = null, ambG = null;
  const cfg = Object.assign({ sfx: true, mus: true, amb: true, vib: true, vol: .8 }, (() => { try { return JSON.parse(localStorage.getItem('pe3d_snd') || '{}'); } catch (e) { return {}; } })());
  const saveCfg = () => { try { localStorage.setItem('pe3d_snd', JSON.stringify(cfg)); } catch (e) { } };
  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = cfg.vol; master.connect(ctx.destination);
    gSfx = ctx.createGain(); gSfx.gain.value = cfg.sfx ? 1 : 0; gSfx.connect(master);
    gMus = ctx.createGain(); gMus.gain.value = cfg.mus ? .6 : 0; gMus.connect(master);
    gAmb = ctx.createGain(); gAmb.gain.value = cfg.amb ? 1 : 0; gAmb.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  const unlock = () => { if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); };
  addEventListener('pointerdown', unlock, { capture: true }); addEventListener('keydown', unlock, { capture: true });
  const now = () => ctx.currentTime;
  const ready = () => ctx && ctx.state === 'running';

  /* ---- blocos básicos ---- */
  function tone(f, dur, o = {}) {
    const t = now() + (o.delay || 0), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + (o.slide || dur));
    if (o.det) osc.detune.value = o.det;
    const v = o.vol == null ? .2 : o.vol, a = o.a || .005;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; fl.Q.value = o.q || .7; osc.connect(fl); node = fl; }
    node.connect(g); g.connect(o.dest || gSfx); osc.start(t); osc.stop(t + dur + .05);
    return osc;
  }
  function noise(dur, o = {}) {
    const t = now() + (o.delay || 0), s = ctx.createBufferSource(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    s.buffer = noiseBuf; s.playbackRate.value = o.rate || 1;
    fl.type = o.ft || 'bandpass'; fl.frequency.setValueAtTime(o.f || 2000, t); if (o.fto) fl.frequency.exponentialRampToValueAtTime(o.fto, t + dur); fl.Q.value = o.q || 1;
    const v = o.vol == null ? .2 : o.vol;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || .003)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(o.dest || gSfx); s.start(t, Math.random() * 1.5); s.stop(t + dur + .05);
  }
  const arp = (notes, step, o = {}) => notes.forEach((f, i) => tone(f, o.dur || step * 1.6, Object.assign({}, o, { delay: (o.delay || 0) + i * step })));

  /* ---- biblioteca de efeitos ---- */
  const FX = {
    tap: () => { tone(1800, .045, { type: 'sine', vol: .06, to: 1200 }); },
    key: () => { noise(.03, { f: 3500 + Math.random() * 1500, q: 3, vol: .07 }); },
    app: () => { tone(520, .12, { vol: .08, to: 880, type: 'triangle' }); noise(.12, { f: 1500, fto: 4000, vol: .03 }); },
    back: () => { tone(700, .09, { vol: .06, to: 420, type: 'triangle' }); },
    phoneOn: () => { noise(.25, { f: 600, fto: 3000, vol: .05, ft: 'bandpass' }); arp([660, 990], .07, { vol: .07, type: 'sine', dur: .18 }); },
    phoneOff: () => { noise(.2, { f: 3000, fto: 500, vol: .04 }); tone(500, .12, { vol: .06, to: 300 }); },
    unlock: () => { tone(1200, .05, { vol: .08 }); tone(1600, .08, { vol: .07, delay: .06 }); },
    coin: () => { tone(988, .08, { type: 'square', vol: .05, lp: 4000 }); tone(1319, .35, { type: 'square', vol: .05, lp: 4000, delay: .07 }); },
    cash: () => { noise(.06, { f: 5000, q: 2, vol: .08 }); tone(2093, .25, { vol: .06, delay: .05 }); tone(2637, .3, { vol: .05, delay: .09 }); },
    good: () => arp([523, 659, 784], .07, { vol: .08, type: 'triangle', dur: .25 }),
    bad: () => { tone(330, .22, { vol: .09, type: 'sawtooth', lp: 900, to: 220 }); tone(247, .3, { vol: .08, type: 'sawtooth', lp: 800, delay: .14, to: 160 }); },
    gold: () => { arp([523, 659, 784, 1047], .08, { vol: .08, type: 'triangle', dur: .3 }); tone(1568, .6, { vol: .04, delay: .32 }); noise(.5, { f: 8000, q: .5, vol: .02, delay: .3 }); },
    err: () => { tone(220, .12, { vol: .08, type: 'square', lp: 700 }); tone(196, .16, { vol: .08, type: 'square', lp: 700, delay: .12 }); },
    pop: () => { tone(600, .08, { vol: .05, to: 1000 }); },
    notif: () => { tone(1319, .18, { vol: .07 }); tone(1760, .3, { vol: .06, delay: .12 }); vib([60, 40, 60]); },
    send: () => { noise(.18, { f: 1000, fto: 6000, vol: .05 }); tone(880, .1, { vol: .05, to: 1400 }); },
    recv: () => { tone(1047, .1, { vol: .06 }); tone(1397, .16, { vol: .06, delay: .09 }); vib(40); },
    like: () => { tone(700, .12, { vol: .07, to: 1400, type: 'triangle' }); },
    shutter: () => { noise(.05, { f: 4000, q: .8, vol: .18, ft: 'highpass' }); noise(.07, { f: 2500, q: 1, vol: .12, delay: .07 }); },
    door: () => { noise(.35, { f: 400, fto: 200, q: 2, vol: .1 }); tone(90, .25, { vol: .12, type: 'triangle', delay: .28 }); },
    bell: () => { [1568, 2093].forEach((f, i) => tone(f, .8, { vol: .05, delay: i * .14 })); },
    step: (alt) => { noise(.07, { f: alt ? 260 : 220, q: 1.4, vol: .05, ft: 'lowpass' }); },
    car: () => { const o = tone(70, 1.1, { type: 'sawtooth', vol: .07, lp: 300, to: 140, slide: .9 }); noise(1, { f: 300, vol: .04, ft: 'lowpass' }); FX.horn(.9); },
    horn: (d = 0) => { tone(415, .28, { type: 'square', vol: .045, lp: 1500, delay: d }); tone(523, .28, { type: 'square', vol: .035, lp: 1500, delay: d }); },
    ring: () => { for (let r = 0; r < 2; r++) { tone(440, .9, { vol: .05, delay: r * 1.6 }); tone(480, .9, { vol: .05, delay: r * 1.6 }); } },
    pickup: () => { tone(880, .08, { vol: .06 }); tone(1320, .12, { vol: .06, delay: .08 }); },
    whoosh: () => { noise(1.1, { f: 300, fto: 5000, q: .8, vol: .09, a: .4 }); },
    year: () => { FX.whoosh(); arp([392, 523, 659, 784], .12, { vol: .07, type: 'triangle', dur: .5, delay: .9 }); },
    death: () => { arp([392, 349, 311, 262], .35, { vol: .08, type: 'triangle', dur: .9 }); tone(65, 2.4, { vol: .1, type: 'sine', delay: .2 }); },
    win: () => { arp([523, 659, 784, 1047, 784, 1047], .09, { vol: .08, type: 'square', lp: 3000, dur: .2 }); },
    lose: () => { arp([392, 370, 349, 330], .14, { vol: .07, type: 'triangle', dur: .25 }); },
    flip: () => { noise(.06, { f: 2500, q: 1.5, vol: .06 }); },
    voice: (len = 1.4) => { // nota de voz: "conversa" sintetizada
      let t = 0; while (t < len) { const d = .06 + Math.random() * .12; tone(140 + Math.random() * 120, d, { type: 'sawtooth', vol: .05, lp: 900 + Math.random() * 700, delay: t, to: 120 + Math.random() * 160 }); t += d + Math.random() * .05; }
    },
    babyCry: () => { for (let i = 0; i < 3; i++) tone(600, .45, { type: 'sawtooth', vol: .04, lp: 2000, delay: i * .5, to: 900 }); },
    light: () => { tone(2400, .04, { vol: .05 }); noise(.03, { f: 6000, vol: .05 }); },
    beep: () => { tone(420, .35, { type: 'square', vol: .06, lp: 1800 }); tone(520, .35, { type: 'square', vol: .05, lp: 1800 }); },
    bell2: () => { tone(1200, .12, { vol: .08 }); tone(1500, .14, { vol: .07, delay: .1 }); },
    chime: () => { tone(988, .6, { vol: .06 }); tone(784, .9, { vol: .06, delay: .5 }); },
    trainHorn: () => { tone(311, 1.3, { type: 'sawtooth', vol: .05, lp: 1300 }); tone(370, 1.3, { type: 'sawtooth', vol: .04, lp: 1300 }); },
    crash: () => { noise(.4, { f: 900, q: .6, vol: .25 }); tone(80, .3, { type: 'triangle', vol: .15, to: 40 }); },
    jingle: () => { arp([784, 988, 1175, 1568], .11, { vol: .07, type: 'triangle', dur: .3 }); tone(196, .5, { vol: .06, type: 'square', lp: 900, delay: .44 }); },
    whistle: () => { tone(2900, .35, { vol: .05, type: 'sine', to: 2700 }); tone(2900, .7, { vol: .05, type: 'sine', delay: .45, to: 2600 }); },
    goal: () => { noise(1.9, { f: 900, q: .7, vol: .16, a: .5 }); noise(1.6, { f: 2200, q: 1, vol: .08, delay: .3, a: .4 }); FX.whistle(); },
    tvon: () => { noise(.12, { f: 6000, q: .5, vol: .06, ft: 'highpass' }); tone(15000, .3, { vol: .01 }); },
  };
  function vib(p) { if (cfg.vib && navigator.vibrate) try { navigator.vibrate(p); } catch (e) { } }
  function play(name, ...a) { if (!cfg.sfx || !ready() || !FX[name]) return; try { FX[name](...a); } catch (e) { } }

  /* ---- ambiente da cidade: trânsito ao longe, pássaros de dia, grilos de noite ---- */
  let ambT = 0;
  function ambTick() {
    if (!ready() || !cfg.amb) return;
    const inGame = typeof mode !== 'undefined' && mode === 'game' && typeof G !== 'undefined' && G;
    if (!ambSrc) {
      ambSrc = ctx.createBufferSource(); ambSrc.buffer = noiseBuf; ambSrc.loop = true; ambSrc.playbackRate.value = .35;
      ambF = ctx.createBiquadFilter(); ambF.type = 'lowpass'; ambF.frequency.value = 380; ambF.Q.value = .3;
      ambG = ctx.createGain(); ambG.gain.value = 0; ambSrc.connect(ambF); ambF.connect(ambG); ambG.connect(gAmb); ambSrc.start();
    }
    const inside = typeof inInt !== 'undefined' && inInt;
    const tgt = !inGame ? 0 : inside ? .018 : .05;
    ambG.gain.setTargetAtTime(tgt, now(), .8);
    if (!inGame) return;
    const hr = typeof dayT !== 'undefined' ? ((dayT * 24) + 6) % 24 : 12, night = hr >= 19 || hr < 6;
    const k = inside ? .35 : 1;
    if (!night && Math.random() < .28) { // pássaro
      const b = 2200 + Math.random() * 1600, n = 2 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) tone(b, .09, { vol: .018 * k, to: b * (1.25 + Math.random() * .3), delay: i * .13, dest: gAmb });
    }
    if (night && Math.random() < .6) { // grilos
      const f = 4200 + Math.random() * 600;
      for (let i = 0; i < 4; i++) tone(f, .035, { vol: .012 * k, delay: i * .07, dest: gAmb });
    }
    if (!inside && Math.random() < .05) { const d = Math.random() * .5; tone(392 + Math.random() * 60, .22, { type: 'square', vol: .008, lp: 1100, delay: d, dest: gAmb }); }
    if (!inside && Math.random() < .08) noise(1.6, { f: 160, fto: 90, ft: 'lowpass', vol: .03, a: .6, dest: gAmb }); // carro a passar
  }
  setInterval(ambTick, 1000);

  /* ---- passos ---- */
  let stepAcc = 0, stepAlt = false, lastP = null;
  function stepTick(dt) {
    if (typeof playerPos === 'undefined' || typeof G === 'undefined' || !G) return;
    const p = playerPos;
    if (!lastP) { lastP = { x: p.x, z: p.z }; return; }
    const d = Math.hypot(p.x - lastP.x, p.z - lastP.z); lastP.x = p.x; lastP.z = p.z;
    if (d > 3 || d < .0005) return; // teletransporte ou parado
    G.passos = (G.passos || 0) + d * 1.4;
    if (!G.metaPassos && G.passos >= 10000) { G.metaPassos = true; const t = '👟 Meta de 10 000 passos atingida este ano! ' + fx({ saude: 2, felicidade: 2 }); addLog(t, 'good'); toast(strip(t)); play('good'); }
    stepAcc += d;
    if (stepAcc > .9) { stepAcc = 0; stepAlt = !stepAlt; play('step', stepAlt); }
  }

  /* =========================================================
     RÁDIO — música original (kizomba, semba, kuduro, afro-house)
     composta em tempo real pelo motor Kianda Beats (musica.js)
     ========================================================= */
  const TRACKS = MZ.TRACKS;
  const R_ = { src: 'me', pan: null, on: false, idx: 0, P: null, bus: null, an: null, gen: { bpm: 120 } };
  function ensure() {
    if (R_.bus) return;
    R_.bus = ctx.createGain(); R_.bus.gain.value = .9;
    R_.pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (R_.pan) { R_.bus.connect(R_.pan); R_.pan.connect(gMus); } else R_.bus.connect(gMus);
    R_.P = MZ.player(ctx, R_.bus); R_.an = R_.P.M.an;
    R_.P.onEnd = () => { R_.on = false; document.body.classList.remove('radio-on'); if (R_.src === 'near') return; if (RADIO.onEnd) { RADIO.onEnd(); return; } RADIO.next(true); };
  }
  const RADIO = {
    TRACKS,
    get on() { return R_.on && R_.P && R_.P.on && R_.src === 'me'; }, get idx() { return R_.idx; },
    get nearOn() { return R_.on && R_.src === 'near'; },
    pos() { return this.on ? R_.P.pos() : 0; }, dur() { return R_.P && R_.P.S ? R_.P.S.dur : 0; },
    rawPos() { return R_.on && R_.P ? R_.P.pos() : 0; },
    onEnd: null,
    trackDur(i) { return MZ.song(i).dur; },
    analyser() { return R_.an; },
    play(i, from, src) {
      unlock(); if (!ctx) return; ensure();
      if (i != null) R_.idx = (i + TRACKS.length) % TRACKS.length;
      R_.src = src || 'me';
      if (R_.src === 'me') { R_.bus.gain.cancelScheduledValues(now()); R_.bus.gain.setValueAtTime(.9, now()); if (R_.pan) R_.pan.pan.setValueAtTime(0, now()); }
      R_.P.play(R_.idx, from || 0); R_.on = true; R_.gen.bpm = R_.P.S.bpm;
      document.body.classList.toggle('radio-on', R_.src === 'me');
    },
    stop() { R_.on = false; if (R_.P) R_.P.stop(); document.body.classList.remove('radio-on'); },
    toggle() { RADIO.on ? RADIO.stop() : RADIO.play(); },
    /* música de outro jogador que está perto (volume por distância + estéreo) */
    near(i, from, gain, pan) {
      if (!ready() || (R_.on && R_.src === 'me')) return;
      ensure();
      if (!(R_.on && R_.src === 'near' && R_.idx === i)) { RADIO.play(i, from, 'near'); R_.bus.gain.setValueAtTime(0.0001, now()); }
      else if (Math.abs(R_.P.pos() - from) > 1.5) R_.P.seek(from);
      RADIO.nearSet(gain, pan);
    },
    nearSet(gain, pan) {
      if (!R_.on || R_.src !== 'near') return;
      R_.bus.gain.setTargetAtTime(Math.max(0.0001, gain), now(), .25);
      if (R_.pan) R_.pan.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan || 0)), now(), .2);
    },
    nearStop() {
      if (!R_.on || R_.src !== 'near') return;
      R_.bus.gain.setTargetAtTime(0.0001, now(), .3);
      clearTimeout(R_.nst); R_.nst = setTimeout(() => { if (R_.src === 'near') RADIO.stop(); }, 900);
    },
    next(auto) { if (R_.src !== 'me') return; RADIO.play(R_.idx + 1); if (auto && typeof renderPhone === 'function' && typeof phoneApp !== 'undefined' && phoneApp === 'musica') renderPhone(true); },
    prev() { RADIO.play(R_.idx - 1); },
    /* baixa a música enquanto se ouve/grava uma mensagem de voz */
    duck(on) { if (!R_.on || R_.src !== 'me' || !R_.bus) return; R_.bus.gain.setTargetAtTime(on ? .18 : .9, now(), .15); },
  };
  /* vozes dos locutores (ficheiros gerados para o jogo) */
  const VOX = {};
  async function voxBuf(name) {
    if (VOX[name]) return VOX[name];
    const src = (window.AUD && window.AUD[name]) || ('audio/' + name + '.mp3');
    VOX[name] = fetch(src).then(r => r.arrayBuffer()).then(b => new Promise((ok, no) => ctx.decodeAudioData(b, ok, no))).catch(e => { delete VOX[name]; throw e; });
    return VOX[name];
  }
  async function voice(name, o = {}) {
    if (!ready()) return null;
    try {
      const b = await voxBuf(name), s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = b; g.gain.value = (o.vol || 1) * 1.6; s.connect(g); g.connect(o.bus === 'sfx' ? gSfx : gMus);
      s.start(now() + (o.delay || 0), Math.max(0, Math.min(b.duration - .2, o.from || 0))); return { s, dur: b.duration };
    } catch (e) { return null; }
  }

  function setOpt(k, v) {
    cfg[k] = v; saveCfg(); if (!ctx) return;
    if (k === 'vol') master.gain.value = v;
    if (k === 'sfx') gSfx.gain.value = v ? 1 : 0;
    if (k === 'mus') gMus.gain.value = v ? .6 : 0;
    if (k === 'amb') gAmb.gain.value = v ? 1 : 0;
  }
  /* público de estádio (TV desporto) */
  let crowdN = null, crowdG = null;
  function crowd(level) {
    if (!ready()) return;
    if (!crowdN) {
      crowdN = ctx.createBufferSource(); crowdN.buffer = noiseBuf; crowdN.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 850; f.Q.value = .6;
      crowdG = ctx.createGain(); crowdG.gain.value = 0; crowdN.connect(f); f.connect(crowdG); crowdG.connect(gAmb); crowdN.start();
    }
    crowdG.gain.setTargetAtTime(Math.max(0, level) * .12, now(), .4);
  }
  /* motor de veículo (loop contínuo): kind = 'car' | 'moto' | 'ev' | 'off' ; k = 0..1 rotação */
  let eng = null;
  function engine(kind, k = 0) {
    if (!ready()) return;
    if (kind === 'off' || !kind) { if (eng) { eng.g.gain.setTargetAtTime(0, now(), .15); const e = eng; eng = null; setTimeout(() => { try { e.o1.stop(); e.o2.stop(); e.n.stop(); } catch (x) { } }, 600); } return; }
    if (!eng || eng.kind !== kind) {
      if (eng) engine('off');
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), ng = ctx.createGain();
      o1.type = kind === 'ev' ? 'sine' : 'sawtooth'; o2.type = kind === 'ev' ? 'triangle' : 'square';
      n.buffer = noiseBuf; n.loop = true; f.type = 'lowpass'; f.frequency.value = 600; f.Q.value = 2;
      o1.connect(f); o2.connect(f); n.connect(ng); ng.connect(f); ng.gain.value = kind === 'ev' ? .05 : .35;
      f.connect(g); g.gain.value = 0; g.connect(gSfx); o1.start(); o2.start(); n.start();
      eng = { kind, o1, o2, n, f, g };
    }
    const t = now(), base = kind === 'moto' ? 70 : kind === 'ev' ? 180 : 42, span = kind === 'moto' ? 170 : kind === 'ev' ? 520 : 90;
    eng.o1.frequency.setTargetAtTime(base + k * span, t, .08); eng.o2.frequency.setTargetAtTime((base + k * span) * (kind === 'ev' ? 2.01 : .5), t, .08);
    eng.f.frequency.setTargetAtTime((kind === 'ev' ? 900 : 380) + k * 1400, t, .1);
    eng.g.gain.setTargetAtTime((kind === 'ev' ? .025 : .05) + k * (kind === 'ev' ? .03 : .06), t, .1);
  }
  /* ambiente de viagem: 'plane' (cabine), 'train' (tac-tac), 'road' (vento), null = desligar */
  let trip = null, tripT = 0;
  function tripAmb(kind, k = 1) {
    if (!ready()) return;
    if (!kind) { if (trip) { trip.g.gain.setTargetAtTime(0, now(), .3); const e = trip; trip = null; setTimeout(() => { try { e.n.stop(); } catch (x) { } }, 1200); } return; }
    if (!trip || trip.kind !== kind) {
      if (trip) tripAmb(null);
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noiseBuf; n.loop = true; f.type = kind === 'plane' ? 'lowpass' : 'bandpass'; f.frequency.value = kind === 'plane' ? 420 : 700; f.Q.value = .5;
      n.connect(f); f.connect(g); g.gain.value = 0; g.connect(gAmb); n.start(); trip = { kind, n, f, g };
    }
    trip.g.gain.setTargetAtTime((kind === 'plane' ? .22 : kind === 'train' ? .08 : .06) * k, now(), .4);
    if (kind === 'train' && k > .15) { const t = performance.now(); if (t - tripT > 1100 / Math.max(.3, k)) { tripT = t; noise(.05, { f: 300, q: 2, vol: .12 * k, ft: 'lowpass', dest: gAmb }); noise(.05, { f: 280, q: 2, vol: .1 * k, ft: 'lowpass', delay: .14, dest: gAmb }); } }
  }
  return { play, vib, cfg, setOpt, RADIO, stepTick, unlock, crowd, engine, tripAmb, voice, voxBuf, get ctx() { return ctx; }, get mus() { return gMus; } };
})();
const RADIO = SND.RADIO;

/* ---------------- ligar os sons ao jogo ---------------- */
(function sndHooks() {
  const wrap = (name, before, after_) => {
    const f = window[name]; if (typeof f !== 'function') return;
    window[name] = function () { if (before) try { before.apply(this, arguments); } catch (e) { } const r = f.apply(this, arguments); if (after_) try { after_.apply(this, arguments); } catch (e) { } return r; };
  };
  // cliques em botões (UI, painéis, telemóvel)
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button,.app,.tab,[onclick]'); if (!b || b.disabled) return;
    if (b.classList.contains('app')) return SND.play('app');
    if (b.closest('.aphead') && b === b.parentNode.firstElementChild) return SND.play('back');
    if (b.classList.contains('ckey')) return;
    SND.play('tap');
  }, true);
  document.addEventListener('keydown', e => { if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) SND.play('key'); }, true);
  // mensagens de resultado
  wrap('after', (txt, cls) => { if (!txt) return; SND.play(cls === 'good' ? 'good' : cls === 'bad' ? 'bad' : cls === 'gold' ? 'gold' : 'pop'); });
  const _toast = window.toast;
  window.toast = function (msg) { const s = String(msg || ''); if (/^(❌|💸|⚠️|🔒|📵|🔞|🧒|👶)/u.test(s)) SND.play('err'); return _toast.apply(this, arguments); };
  // dinheiro: som de moedas / caixa + extrato do banco
  let lastKz = null, lastToast = '';
  const _t2 = window.toast; window.toast = function (m) { lastToast = typeof strip === 'function' ? strip(String(m || '')) : String(m || ''); return _t2.apply(this, arguments); };
  wrap('refresh', null, () => {
    if (typeof G === 'undefined' || !G) { lastKz = null; return; }
    if (lastKz === null || lastKz.g !== G) { lastKz = { v: G.dinheiro, g: G }; return; }
    const d = Math.round(G.dinheiro - lastKz.v); lastKz.v = G.dinheiro;
    if (!d) return;
    if (!busy) SND.play(d > 0 ? 'coin' : 'cash');
    G.extrato = G.extrato || [];
    G.extrato.unshift({ v: d, t: (busy ? 'Balanço do ano' : lastToast || 'Movimento').slice(0, 70), ano: G.ano, idade: G.idade });
    if (G.extrato.length > 60) G.extrato.length = 60;
  });
  wrap('openPhone', null, () => { if (phoneApp) SND.play('phoneOn'); });
  wrap('closePhone', () => { if (phoneApp) SND.play('phoneOff'); });
  wrap('unlockPhone', () => SND.play('unlock'));
  wrap('ageUpUI', () => { if (!busy && G && G.vivo && mode === 'game' && !modalOpen) { SND.play('year'); G.passos = 0; G.metaPassos = false; } }, () => {
    const u0 = typeof unread === 'function' ? unread() : 0;
    setTimeout(() => { if (typeof unread === 'function' && unread() > u0) SND.play('notif'); }, 1600);
  });
  wrap('die', () => { SND.play('death'); RADIO.stop(); });
  wrap('ivEnter', () => SND.play('door'), () => { setTimeout(() => SND.play('bell'), 450); });
  wrap('ivExit', (instant) => { if (!instant) SND.play('door'); });
  wrap('goTeleport', () => SND.play('whoosh'));
  wrap('takeSelfie', () => SND.play('shutter'));
  wrap('callPerson', () => { SND.play('ring'); setTimeout(() => SND.play('pickup'), 1900); });
  wrap('sendMsg', () => SND.play('send'));
  wrap('postSocial', () => SND.play('shutter'));
  // passos no mundo
  if (typeof updateWorld === 'function') { const _u = updateWorld; updateWorld = function (dt) { const r = _u.apply(this, arguments); try { if (mode === 'game' && !dying) SND.stepTick(dt); } catch (e) { } return r; }; }
})();
