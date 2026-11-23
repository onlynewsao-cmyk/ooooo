/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Kianda Beats
   Compositor generativo de música original (100% sem direitos de autor).
   Cada faixa é composta por algoritmo a partir de uma "semente": todos os
   jogadores ouvem exatamente a mesma música no mesmo instante (rádio ao vivo).
   Estilos: kizomba, kuduro, semba, afro-house.
   Instrumentos sintetizados: bombo, tarola, palmas, pratos, shaker, congas,
   timbalões, baixo (sub/serra/dedilhado), pad, piano elétrico (FM),
   guitarra (Karplus-Strong), marimba/kalimba, sintetizador, flauta, efeitos.
   Funciona em tempo real (AudioContext) e offline (OfflineAudioContext) —
   o trailer usa este mesmo motor.
   ========================================================= */
const MZ = (() => {
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const MIN = [0, 2, 3, 5, 7, 8, 10], MAJ = [0, 2, 4, 5, 7, 9, 11];

  /* ---------------- catálogo ---------------- */
  const TRACKS = [
    { t: 'Amor de Kianda', a: 'Nelo Kizomba', g: 'kizomba' },
    { t: 'Tarraxa na Ilha', a: 'Djeny Bwé', g: 'kizomba' },
    { t: 'Semba do Kota', a: 'Kota Mabanza', g: 'semba' },
    { t: 'Kuduro na Banda', a: 'Os Kalumbas', g: 'kuduro' },
    { t: 'Muxima Minha', a: 'Yara Luz', g: 'kizomba' },
    { t: 'Afro Kilamba', a: 'DJ Palanca', g: 'afrohouse' },
    { t: 'Luanda Lua Cheia', a: 'Banda Kalemba', g: 'semba' },
    { t: 'Toque do Candongueiro', a: 'Mano Txova', g: 'kuduro' },
    { t: 'Noite em Talatona', a: 'DJ Mukuxi', g: 'afrohouse' },
    { t: 'Mwangolé no Coração', a: 'Yola Kianda', g: 'kizomba' },
    { t: 'Saudade do Mussulo', a: 'Edu Bem-Vindo', g: 'kizomba' },
    { t: 'Rebita da Mamã', a: 'Os Kotas do Marçal', g: 'semba' },
    { t: 'Kazukuta 2026', a: 'Mestre Kituxi', g: 'semba' },
    { t: 'Dança do Kupapata', a: 'Mano Bwé', g: 'kuduro' },
    { t: 'Fogo no Musseque', a: 'Kalibre 9', g: 'kuduro' },
    { t: 'Ginga do Cazenga', a: 'Puto Kinaxixi', g: 'kuduro' },
    { t: 'Marginal ao Pôr do Sol', a: 'DJ Kalunga', g: 'afrohouse' },
    { t: 'Talatona Deep', a: 'Afro Kianda Crew', g: 'afrohouse' },
    { t: 'Benguela Sunrise', a: 'DJ Lobito', g: 'afrohouse' },
    { t: 'Kandongueiro Apaixonado', a: 'Nelo Kizomba', g: 'kizomba' },
    { t: 'Kota Kilunje', a: 'Banda Maravilha do Bairro', g: 'semba' },
    { t: 'Batida do Rangel', a: 'DJ Kalibre', g: 'kuduro' },
    { t: 'Mussulo Deep Tribe', a: 'Mukuxi & Lobito', g: 'afrohouse' },
    { t: 'Abraço na Chuva', a: 'Yara Luz', g: 'kizomba' },
  ];

  /* estilos: andamento, escala, progressões (graus), forma, padrões de bateria */
  const STY = {
    kizomba: {
      bpm: [86, 92], sc: MIN, key: [43, 50], progs: [[0, 5, 2, 6], [0, 3, 6, 2], [0, 5, 3, 4], [5, 6, 0, 0]], sev: true,
      form: [['intro', 4], ['a', 8], ['b', 8], ['a', 8], ['brk', 4], ['b', 8], ['out', 4]],
      kits: [
        { k: '1000001010000000', r: '0000100000001000', h: '1010101010101010', sh: '0010001000100010', c: '0000000100000001' },
        { k: '1000001000100000', r: '0000100000001001', h: '1010101010101010', sh: '0011001100110011', c: '0000000000010000' },
      ],
      bass: 'sub', bassPat: ['1000001000100000', '1000001010000010'], keys: 'ep', lead: 'bell', mel: '1000001000100000|1000100010000000|1001000010001000',
    },
    kuduro: {
      bpm: [136, 142], sc: MIN, key: [40, 46], progs: [[0, 0, 6, 5], [0, 6, 5, 6], [0, 3, 0, 4], [0, 5, 6, 4]], sev: false,
      form: [['intro', 4], ['a', 8], ['b', 8], ['brk', 4], ['a', 8], ['b', 8], ['b', 8], ['out', 4]],
      kits: [
        { k: '1001001010010010', s: '0000100000001000', h: '0010001000100010', sh: '1011101110111011', t: '0000000000000101' },
        { k: '1000101010001010', s: '0000100100001000', h: '0010001000100010', sh: '1111111111111111', t: '0000000001010000' },
      ],
      bass: 'saw', bassPat: ['1010110101101011', '1001101010011010'], keys: 'stab', lead: 'square', mel: '1010010100100100|1001001010010010|1010100010101000',
    },
    semba: {
      bpm: [114, 124], sc: MAJ, key: [43, 50], progs: [[0, 3, 4, 0], [0, 5, 3, 4], [0, 4, 0, 3], [0, 3, 0, 4]], sev: false,
      form: [['intro', 4], ['a', 8], ['b', 8], ['a', 8], ['brk', 4], ['b', 8], ['out', 4]],
      kits: [
        { k: '1000001010000010', s: '0000100000001000', h: '0010001000100010', sh: '1111111111111111', cg: '0010010010100100' },
        { k: '1000100010001000', s: '0000100000001001', h: '0110011001100110', sh: '1111111111111111', cg: '1001001000101001' },
      ],
      bass: 'pluck', bassPat: ['1000101010001010', '1010001010100010'], keys: 'guitar', lead: 'guitar', mel: '1011011010110110|1110111011101010|1010111010101110',
    },
    afrohouse: {
      bpm: [120, 124], sc: MIN, key: [40, 47], progs: [[0, 3, 5, 4], [0, 5, 3, 6], [0, 0, 3, 3], [0, 6, 5, 6]], sev: true,
      form: [['intro', 8], ['a', 8], ['b', 8], ['brk', 4], ['b', 8], ['a', 8], ['out', 8]],
      kits: [
        { k: '1000100010001000', s: '0000100000001000', h: '0010001000100010', sh: '1111111111111111', cg: '0010100100100110', t: '0000001000000100' },
        { k: '1000100010001000', s: '0000100000001000', h: '0010001000100010', sh: '1011101110111011', cg: '1000101000100101', t: '0001000000100000' },
      ],
      bass: 'deep', bassPat: ['0010010000100100', '0010001001000100'], keys: 'marimba', lead: 'flute', mel: '1001001010010000|1000101000101000|1001000100100100',
    },
  };

  /* ---------------- composição (determinística) ---------------- */
  const SONGS = {};
  function song(i) {
    i = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    if (SONGS[i]) return SONGS[i];
    const T = TRACKS[i], S = STY[T.g], r = rng(9973 * (i + 11) + 17);
    const pick = a => a[Math.floor(r() * a.length)];
    const bpm = S.bpm[0] + Math.floor(r() * (S.bpm[1] - S.bpm[0] + 1));
    const key = S.key[0] + Math.floor(r() * (S.key[1] - S.key[0] + 1));
    const prog = pick(S.progs), kit = pick(S.kits), bassPat = pick(S.bassPat);
    const sec = []; S.form.forEach(([n, b]) => { for (let k = 0; k < b; k++) sec.push({ n, k, len: b }); });
    const bars = sec.length, sd = 60 / bpm / 4;
    const deg = (d, o = 0) => { const L = S.sc.length; return S.sc[((d % L) + L) % L] + 12 * (Math.floor(d / L) + o); };
    const chord = c => { const d = prog[c % 4]; const n = [deg(d), deg(d + 2), deg(d + 4)]; if (S.sev) n.push(deg(d + 6)); return { d, n }; };
    /* melodia: 4 compassos; ritmo do 1.º compasso repete no 3.º, do 2.º no 4.º (gancho) */
    const rh = S.mel.split('|'), R1 = pick(rh), R2 = pick(rh);
    const mel = []; let cur = 7 + Math.floor(r() * 3);
    for (let b = 0; b < 4; b++) {
      const R = b % 2 ? R2 : R1, ch = chord(b), tones = ch.n.slice(0, 3).map(x => x % 12);
      for (let s = 0; s < 16; s++) {
        if (R[s] !== '1') { mel.push(null); continue; }
        let step = pick([-2, -1, -1, 1, 1, 2, 0, 3, -3]); cur = Math.max(3, Math.min(13, cur + step));
        if (s % 4 === 0) { /* tempos fortes: nota do acorde mais próxima */
          let best = cur, bd = 99; for (let dd = -3; dd <= 3; dd++) { const semi = ((deg(cur + dd) % 12) + 12) % 12; if (tones.includes(semi) && Math.abs(dd) < bd) { bd = Math.abs(dd); best = cur + dd; } } cur = best;
        }
        if (b === 3 && s >= 12) cur = 7; /* resolve na tónica */
        let len = 1; while (s + len < 16 && R[s + len] !== '1') len++;
        mel.push({ d: cur, len });
      }
    }
    /* arpejo / ostinato (semba: guitarra; afro: marimba) */
    const arpOrd = pick([[0, 1, 2, 1, 3, 2, 1, 2], [0, 2, 1, 2, 0, 3, 2, 1], [0, 1, 2, 3, 2, 1, 2, 1]]);
    const ost = pick(['1011010110110101', '1010010100101001', '1001010010100101']);
    const o = { i, T, g: T.g, S, bpm, sd, key, prog, kit, bassPat, sec, bars, steps: bars * 16, dur: bars * 16 * sd, deg, chord, mel, arpOrd, ost, swing: T.g === 'semba' || T.g === 'afrohouse' ? .1 : T.g === 'kizomba' ? .06 : 0, var: r() };
    return (SONGS[i] = o);
  }

  /* ---------------- banco de sons por contexto ---------------- */
  const BANKS = new WeakMap();
  function bank(ac) {
    let B = BANKS.get(ac); if (B) return B;
    const sr = ac.sampleRate, nb = ac.createBuffer(1, sr * 2, sr), d = nb.getChannelData(0);
    let s = 12345; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; }
    /* reverberação: resposta de impulso sintética */
    const ir = ac.createBuffer(2, Math.floor(sr * 2.4), sr);
    for (let c = 0; c < 2; c++) { const x = ir.getChannelData(c); let q = 999 + c * 77; for (let i = 0; i < x.length; i++) { q = (q * 16807) % 2147483647; x[i] = (q / 1073741823.5 - 1) * Math.pow(1 - i / x.length, 3.2) * (i < sr * .01 ? i / (sr * .01) : 1); } }
    B = { noise: nb, ir, pl: {} };
    BANKS.set(ac, B); return B;
  }
  /* guitarra dedilhada (Karplus-Strong), pré-calculada por nota */
  function pluckBuf(ac, n, bright) {
    const B = bank(ac), k = n + (bright ? 'b' : ''); if (B.pl[k]) return B.pl[k];
    const sr = ac.sampleRate, f = midi(n), N = Math.max(2, Math.floor(sr / f - .5)), L = Math.floor(sr * 1.4);
    const buf = ac.createBuffer(1, L, sr), y = buf.getChannelData(0);
    let s = 777 + n * 31; for (let i = 0; i < N; i++) { s = (s * 16807) % 2147483647; y[i] = (s / 1073741823.5 - 1) * .8; }
    for (let i = 1; i < N; i++) y[i] = bright ? y[i] : (y[i] + y[i - 1]) * .5; /* ataque mais suave */
    const dec = .996 - Math.max(0, n - 64) * .0006;
    for (let i = N; i < L; i++) y[i] = (y[i - N] + y[i - N - 1 < 0 ? 0 : i - N - 1]) * .5 * dec;
    return (B.pl[k] = buf);
  }

  /* ---------------- mesa de mistura ---------------- */
  function mixer(ac, dest) {
    const B = bank(ac), M = { ac };
    M.comp = ac.createDynamicsCompressor(); M.comp.threshold.value = -16; M.comp.knee.value = 10; M.comp.ratio.value = 3.5; M.comp.attack.value = .004; M.comp.release.value = .18;
    M.master = ac.createGain(); M.master.gain.value = .85;
    /* equalização final: menos grave embolado, mais presença e brilho */
    M.lo = ac.createBiquadFilter(); M.lo.type = 'lowshelf'; M.lo.frequency.value = 140; M.lo.gain.value = -5;
    M.mid = ac.createBiquadFilter(); M.mid.type = 'peaking'; M.mid.frequency.value = 1800; M.mid.Q.value = .8; M.mid.gain.value = 3;
    M.hi = ac.createBiquadFilter(); M.hi.type = 'highshelf'; M.hi.frequency.value = 5000; M.hi.gain.value = 4;
    M.master.connect(M.lo); M.lo.connect(M.mid); M.mid.connect(M.hi); M.hi.connect(M.comp); M.comp.connect(dest);
    M.an = ac.createAnalyser(); M.an.fftSize = 64; M.comp.connect(M.an);
    M.drums = ac.createGain(); M.drums.gain.value = .9; M.drums.connect(M.master);
    M.duck = ac.createGain(); M.duck.gain.value = 1; M.duck.connect(M.master);
    M.bass = ac.createGain(); M.bass.gain.value = .72; M.bass.connect(M.duck);
    M.mus = ac.createGain(); M.mus.gain.value = .95; M.mus.connect(M.duck);
    M.rev = ac.createConvolver(); M.rev.buffer = B.ir; M.revOut = ac.createGain(); M.revOut.gain.value = .32; M.rev.connect(M.revOut); M.revOut.connect(M.master);
    M.revIn = ac.createGain(); M.revIn.connect(M.rev);
    M.dl = ac.createDelay(1.5); M.dlFb = ac.createGain(); M.dlFb.gain.value = .32; M.dlLp = ac.createBiquadFilter(); M.dlLp.type = 'lowpass'; M.dlLp.frequency.value = 2600;
    M.dlIn = ac.createGain(); M.dlIn.connect(M.dl); M.dl.connect(M.dlLp); M.dlLp.connect(M.dlFb); M.dlFb.connect(M.dl); M.dlOut = ac.createGain(); M.dlOut.gain.value = .5; M.dlLp.connect(M.dlOut); M.dlOut.connect(M.master);
    /* filtro geral (pausas/break com filtro a abrir) */
    M.sweep = ac.createBiquadFilter(); M.sweep.type = 'lowpass'; M.sweep.frequency.value = 20000; M.sweep.Q.value = .8;
    M.mus.disconnect(); M.mus.connect(M.sweep); M.sweep.connect(M.duck);
    const curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 2.6); }
    M.curve = curve;
    M.B = B; return M;
  }

  /* ---------------- instrumentos ---------------- */
  const E = (g, t, a, v, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  function nz(M, t, dur, type, f, q, v, out, a = .001, send) {
    const ac = M.ac, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = M.B.noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    E(g, t, a, v, dur); s.connect(fl); fl.connect(g); g.connect(out); if (send) { const sg = ac.createGain(); sg.gain.value = send; g.connect(sg); sg.connect(M.revIn); }
    s.start(t, (t * 7.31) % 1.5); s.stop(t + a + dur + .05); return fl;
  }
  function osc(M, t, type, f, a, v, dur, out, o = {}) {
    const ac = M.ac, x = ac.createOscillator(), g = ac.createGain(); x.type = type; x.frequency.setValueAtTime(f, t);
    if (o.det) x.detune.value = o.det; if (o.to) x.frequency.exponentialRampToValueAtTime(o.to, t + (o.toT || .1));
    if (o.glideFrom) { x.frequency.setValueAtTime(o.glideFrom, t); x.frequency.exponentialRampToValueAtTime(f, t + .06); }
    let n = x; if (o.lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, t); fl.Q.value = o.q || .7; if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + (o.lpT || .2)); x.connect(fl); n = fl; }
    if (o.vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = o.vib; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .012, t + Math.min(.35, dur * .6)); l.connect(lg); lg.connect(x.frequency); l.start(t); l.stop(t + a + dur + .1); }
    if (o.sus) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.setValueAtTime(v, t + a + Math.max(0, dur - o.sus)); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dur + o.sus); }
    else E(g, t, a, v, dur);
    n.connect(g); g.connect(out);
    if (o.send) { const sg = M.ac.createGain(); sg.gain.value = o.send; g.connect(sg); sg.connect(M.revIn); }
    if (o.dly) { const dg = M.ac.createGain(); dg.gain.value = o.dly; g.connect(dg); dg.connect(M.dlIn); }
    x.start(t); x.stop(t + a + dur + (o.sus || 0) + .08); return x;
  }
  const I = {
    kick(M, t, v, tune = 1, hard) {
      osc(M, t, 'sine', 165 * tune, .002, v, .38, M.drums, { to: 44 * tune, toT: .13 });
      nz(M, t, .012, 'highpass', 3000, .7, v * .35, M.drums);
      if (hard) { const ac = M.ac, x = ac.createOscillator(), ws = ac.createWaveShaper(), g = ac.createGain(); ws.curve = M.curve; x.type = 'sine'; x.frequency.setValueAtTime(140 * tune, t); x.frequency.exponentialRampToValueAtTime(50 * tune, t + .1); E(g, t, .002, v * .28, .22); x.connect(ws); ws.connect(g); g.connect(M.drums); x.start(t); x.stop(t + .3); }
      /* "sidechain": o resto da música baixa a cada bombo */
      const d = M.duck.gain; d.cancelScheduledValues(t); d.setValueAtTime(M.duckAmt || .55, t); d.linearRampToValueAtTime(1, t + .2);
    },
    snare(M, t, v) { nz(M, t, .17, 'bandpass', 1900, .7, v * .5, M.drums, .001, .25); osc(M, t, 'triangle', 200, .001, v * .3, .07, M.drums, { to: 150 }); },
    clap(M, t, v) { [0, .011, .022].forEach((o, i) => nz(M, t + o, i === 2 ? .14 : .01, 'bandpass', 1250, 1.2, v * .55, M.drums, .001, i === 2 ? .45 : 0)); },
    rim(M, t, v) { osc(M, t, 'triangle', 1700, .001, v * .22, .03, M.drums); osc(M, t, 'square', 820, .001, v * .07, .025, M.drums, { lp: 2500 }); nz(M, t, .02, 'bandpass', 3200, 2, v * .2, M.drums); },
    hat(M, t, v, open) { nz(M, t, open ? .22 : .035, 'highpass', 8200, .6, v * (open ? .2 : .26), M.drums); },
    shk(M, t, v) { nz(M, t, .045, 'bandpass', 6800, 1.3, v * .16, M.drums, .008); },
    conga(M, t, v, f, slap) { osc(M, t, 'sine', f, .001, v * .32, .2, M.drums, { glideFrom: f * 1.35, send: .12 }); if (slap) nz(M, t, .03, 'bandpass', 2600, 1.5, v * .22, M.drums); },
    tom(M, t, v, f) { osc(M, t, 'sine', f, .001, v * .4, .3, M.drums, { to: f * .7, toT: .3, send: .2 }); },
    crash(M, t, v) { nz(M, t, 1.6, 'highpass', 5200, .4, v * .14, M.drums, .002, .5); },
    riser(M, t, dur, v) { const fl = nz(M, t, dur, 'bandpass', 500, 1.4, v * .16, M.mus, dur * .9, .4); fl.frequency.setValueAtTime(400, t); fl.frequency.exponentialRampToValueAtTime(9000, t + dur); },
    zap(M, t, v) { osc(M, t, 'square', 1800, .001, v * .05, .14, M.mus, { to: 160, toT: .14, lp: 3500, dly: .4 }); },
    bass(M, t, n, dur, kind, v = 1) {
      const f = midi(n);
      if (kind === 'sub') { osc(M, t, 'sine', f, .01, .27 * v, dur, M.bass, { sus: .06 }); osc(M, t, 'triangle', f * 2, .01, .05 * v, dur * .7, M.bass, { lp: 500 }); }
      else if (kind === 'saw') { osc(M, t, 'sawtooth', f, .003, .2 * v, dur, M.bass, { lp: 2400, lpTo: 260, lpT: .14, q: 4 }); osc(M, t, 'sine', f, .003, .3 * v, dur, M.bass); }
      else if (kind === 'pluck') { osc(M, t, 'triangle', f, .004, .36 * v, Math.max(.18, dur * .85), M.bass, { lp: 1400, lpTo: 380, lpT: .25 }); osc(M, t, 'sine', f, .004, .16 * v, dur, M.bass); }
      else { osc(M, t, 'sine', f, .015, .3 * v, dur, M.bass, { sus: .05 }); osc(M, t, 'sawtooth', f, .015, .03 * v, dur * .6, M.bass, { lp: 420 }); }
    },
    pad(M, t, notes, dur, v = 1, bright = 1200) {
      notes.forEach(n => [-9, 9].forEach(dt => osc(M, t, 'sawtooth', midi(n), .35, .022 * v, dur, M.mus, { det: dt, lp: bright, sus: .4, send: .55 })));
    },
    ep(M, t, n, dur, v = 1) { /* piano elétrico FM */
      const ac = M.ac, f = midi(n), c = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
      c.frequency.value = f; m.frequency.value = f; mg.gain.setValueAtTime(f * 1.6, t); mg.gain.exponentialRampToValueAtTime(f * .08, t + .5);
      m.connect(mg); mg.connect(c.frequency); E(g, t, .004, .095 * v, Math.min(2.2, dur + .6)); c.connect(g); g.connect(M.mus);
      const sg = ac.createGain(); sg.gain.value = .35; g.connect(sg); sg.connect(M.revIn);
      c.start(t); m.start(t); c.stop(t + dur + .9); m.stop(t + dur + .9);
    },
    gtr(M, t, n, v = 1, bright, pan = 0) {
      const ac = M.ac, s = ac.createBufferSource(), g = ac.createGain(); s.buffer = pluckBuf(ac, n, bright);
      g.gain.value = .26 * v; s.connect(g);
      if (ac.createStereoPanner && pan) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(M.mus); } else g.connect(M.mus);
      const sg = ac.createGain(); sg.gain.value = .22; g.connect(sg); sg.connect(M.revIn);
      s.start(t); s.stop(t + 1.4);
    },
    marimba(M, t, n, v = 1) { const f = midi(n); osc(M, t, 'sine', f, .002, .16 * v, .45, M.mus, { send: .3, dly: .25 }); osc(M, t, 'sine', f * 4.01, .001, .035 * v, .08, M.mus); osc(M, t, 'triangle', f * 2, .001, .02 * v, .12, M.mus); },
    stab(M, t, notes, v = 1) { notes.forEach(n => osc(M, t, 'sawtooth', midi(n), .002, .03 * v, .13, M.mus, { lp: 3800, lpTo: 900, lpT: .12, dly: .25 })); },
    lead(M, t, n, dur, kind, v = 1) {
      const f = midi(n);
      if (kind === 'square') { osc(M, t, 'square', f, .004, .045 * v, dur, M.mus, { lp: 3200, lpTo: 1400, lpT: .2, dly: .35, sus: .03 }); osc(M, t, 'square', f * 2, .004, .012 * v, dur * .5, M.mus, { lp: 4000 }); }
      else if (kind === 'flute') { osc(M, t, 'sine', f, .06, .1 * v, dur, M.mus, { vib: 5.2, send: .5, dly: .3, sus: .12 }); osc(M, t, 'triangle', f * 2, .06, .012 * v, dur, M.mus, { sus: .1 }); nz(M, t, Math.min(.3, dur), 'bandpass', f * 2, 6, .05 * v, M.mus, .04); }
      else if (kind === 'bell') { I.ep(M, t, n + 12, dur, .9 * v); osc(M, t, 'sine', f * 2, .01, .03 * v, dur, M.mus, { vib: 4.5, send: .5, sus: .2 }); }
      else I.gtr(M, t, n, 1.15 * v, true, .15);
    },
  };

  /* ---------------- interpretação: agenda um passo (1/16) ---------------- */
  function step(M, S, st, t) {
    if (st < 0 || st >= S.steps) return;
    const bar = Math.floor(st / 16), i = st % 16, sec = S.sec[bar], n = sec.n, K = S.kit, g = S.g;
    const sw = i % 2 ? S.sd * S.swing : 0, tt = t + sw;
    const ch = S.chord(bar), root = S.key + ch.n[0];
    const lastBarOfPhrase = (sec.k % 8) === 7 || sec.k === sec.len - 1;
    const fill = lastBarOfPhrase && i >= 12 && n !== 'out' && n !== 'brk';
    const at = p => p && p[i] === '1';
    const intro = n === 'intro', out = n === 'out', brk = n === 'brk', full = n === 'a' || n === 'b';
    const fadeOut = out ? Math.max(.15, 1 - sec.k / sec.len) : 1;
    M.duckAmt = g === 'afrohouse' ? .45 : g === 'kizomba' ? .7 : .6;
    /* filtro: abre na intro, fecha no break */
    if (i === 0) {
      const fq = M.sweep.frequency;
      if (intro) { fq.cancelScheduledValues(t); fq.setValueAtTime(fq.value || 20000, t); fq.exponentialRampToValueAtTime(400 + 18000 * Math.pow((sec.k + 1) / sec.len, 2.5), t + S.sd * 16); }
      else if (brk && sec.k === 0) { fq.cancelScheduledValues(t); fq.setValueAtTime(20000, t); fq.exponentialRampToValueAtTime(900, t + S.sd * 16 * 2); }
      else if (!brk && fq.value < 19000) { fq.cancelScheduledValues(t); fq.setValueAtTime(Math.max(300, fq.value), t); fq.exponentialRampToValueAtTime(20000, t + S.sd * 8); }
      if (full && sec.k === 0 && bar > 0) I.crash(M, t, .9);
      if (brk && sec.k === sec.len - 2) I.riser(M, t, S.sd * 32, 1);
    }
    /* bateria */
    const drumsOn = !brk && !(intro && sec.k < (g === 'afrohouse' ? 0 : 2));
    if (drumsOn && !fill) {
      if (at(K.k) && !(intro && g !== 'afrohouse')) I.kick(M, t, .95 * fadeOut, g === 'kuduro' ? 1.1 : g === 'kizomba' ? .85 : 1, g === 'kuduro');
      if (at(K.s) && !intro) (g === 'kuduro' || g === 'afrohouse' ? I.clap : I.snare)(M, tt, .9 * fadeOut);
      if (at(K.r) && !intro) I.rim(M, tt, .9 * fadeOut);
      if (at(K.h)) I.hat(M, tt, .8 * fadeOut, g === 'afrohouse' || (g === 'kuduro' && i % 4 === 2));
      if (at(K.sh)) I.shk(M, tt, (i % 4 === 0 ? 1 : .55) * fadeOut);
      if (at(K.cg) && !intro) I.conga(M, tt, .9 * fadeOut, [200, 260, 330][(i + bar) % 3], i % 4 === 2);
      if (at(K.t) && full) I.tom(M, tt, .8, [110, 140, 90][i % 3]);
      if (at(K.c) && !intro) I.clap(M, tt, .5 * fadeOut);
    }
    if (fill) { /* virada no fim da frase */
      if (g === 'kuduro') { I.snare(M, tt, .5 + (i - 12) * .15); if (i % 2 === 0) I.kick(M, t, .8, 1.1, true); }
      else if (g === 'semba') I.conga(M, tt, 1, [330, 280, 230, 190][i - 12], true);
      else if (g === 'afrohouse') { I.kick(M, t, .9); I.tom(M, tt, .9, [150, 130, 110, 90][i - 12]); }
      else if (i % 2 === 0) I.rim(M, tt, .8);
    }
    if (brk && g === 'afrohouse' && i % 4 === 0 && sec.k >= 2) I.kick(M, t, .5);
    if (brk && g === 'kuduro' && sec.k === sec.len - 1) I.snare(M, tt, .3 + i * .045);
    /* baixo */
    if (!intro && !brk && at(S.bassPat)) {
      let len = 1; while (i + len < 16 && S.bassPat[i + len] !== '1') len++;
      let bn = root - 12; if (g === 'kuduro' && i % 4 === 2) bn += 12; if (g === 'semba' && i >= 8 && S.var > .4) bn += [0, 7, 4, 5][(i >> 1) % 4];
      while (bn < 33) bn += 12; while (bn > 52) bn -= 12;
      I.bass(M, tt, bn, len * S.sd * (g === 'kuduro' ? .55 : .92), S.S.bass, fadeOut);
    }
    /* harmonia */
    let base = S.key + 12; if (base < 52) base += 12;
    const notesHi = ch.n.map(x => base + x);
    if (S.S.keys === 'ep') { if (i === 0) notesHi.forEach((x, k) => I.ep(M, t + k * .012, x, S.sd * 15, .9)); if (!brk && i === 10 && full) notesHi.slice(1).forEach(x => I.ep(M, tt, x, S.sd * 5, .5)); if (i === 0) I.pad(M, t, notesHi.slice(0, 3), S.sd * 16, intro || brk ? 1.1 : .7, 900); }
    if (S.S.keys === 'stab') { if (!intro && full && at('0010010000100100')) I.stab(M, tt, notesHi, .95 * fadeOut); if (i === 0 && (brk || intro || n === 'b')) I.pad(M, t, notesHi.slice(0, 3).map(x => x + 12), S.sd * 16, .8, 1800); }
    if (S.S.keys === 'guitar') { /* semba: dedilhado contínuo da guitarra ritmo */
      if (!(intro && sec.k < 1) && i % 2 === 0) { const o = S.arpOrd[(i >> 1) % 8], tones = [ch.n[0], ch.n[1], ch.n[2], ch.n[0] + 12]; I.gtr(M, tt, base + tones[o], (i % 4 === 0 ? .85 : .6) * fadeOut, false, -.25); }
      if (i === 0 && (brk || intro)) I.pad(M, t, notesHi.slice(0, 3), S.sd * 16, .8, 1100);
    }
    if (S.S.keys === 'marimba') {
      if (at(S.ost) && !(intro && sec.k < 2)) { const tones = [ch.n[0], ch.n[2], ch.n[1] + 12, ch.n[0] + 12]; I.marimba(M, tt, base + 12 + tones[(i * 3 + bar) % 4], (i % 4 === 0 ? .9 : .65) * fadeOut); }
      if (i === 0) I.pad(M, t, notesHi, S.sd * 16, intro || brk ? 1.2 : .65, brk ? 2200 : 1000);
      if (full && i === 6) notesHi.forEach(x => I.ep(M, tt, x - 12, S.sd * 2, .45));
    }
    /* melodia (gancho) — só nas partes B e no break; semba também em A, uma oitava abaixo */
    const melOn = n === 'b' || (brk && sec.k >= 2) || (g === 'semba' && n === 'a' && sec.k >= 4) || (g === 'kizomba' && n === 'a' && sec.k >= 4);
    if (melOn) {
      const m = S.mel[(bar % 4) * 16 + i];
      if (m) {
        const nn = base + 12 + S.deg(m.d) - 12 - (n === 'a' ? 12 : 0);
        I.lead(M, tt, nn, m.len * S.sd * .95, S.S.lead, brk ? .7 : 1);
        if (g === 'semba' && n === 'b') I.gtr(M, tt + .004, nn + S.deg(m.d - 2) - S.deg(m.d), .7, true, .3); /* terceiras paralelas, à moda do semba */
      }
    }
    if (g === 'kuduro' && full && i === 14 && bar % 4 === 3) I.zap(M, tt, 1);
  }

  /* ---------------- leitor em tempo real ---------------- */
  function player(ac, dest) {
    const P = { on: false, idx: 0, S: null, st: 0, next: 0, t0: 0, M: mixer(ac, dest), timer: null, onEnd: null };
    P.play = (i, from = 0) => {
      P.S = song(i); P.idx = P.S.i; P.on = true;
      const st = Math.max(0, Math.floor(from / P.S.sd)) % P.S.steps;
      P.st = st; P.next = ac.currentTime + .08; P.t0 = P.next - st * P.S.sd;
      P.M.sweep.frequency.cancelScheduledValues(ac.currentTime); P.M.sweep.frequency.setValueAtTime(20000, ac.currentTime);
      clearInterval(P.timer); P.timer = setInterval(P.tick, 25);
    };
    P.seek = from => { if (!P.S) return; const st = Math.floor(from / P.S.sd); P.st = st; P.next = ac.currentTime + .05; P.t0 = P.next - st * P.S.sd; };
    P.tick = () => {
      if (!P.on || ac.state !== 'running') return;
      while (P.next < ac.currentTime + .18) {
        if (P.st >= P.S.steps) { P.on = false; clearInterval(P.timer); if (P.onEnd) P.onEnd(); return; }
        try { step(P.M, P.S, P.st, P.next); } catch (e) { }
        P.st++; P.next += P.S.sd;
      }
    };
    P.stop = () => { P.on = false; clearInterval(P.timer); };
    P.pos = () => P.on ? Math.min(P.S.dur, ac.currentTime - P.t0) : 0;
    return P;
  }

  /* ---------------- renderização offline (trailer / exportar WAV) ---------------- */
  async function renderOffline(i, sec, from = 0, sr = 44100) {
    const S = song(i), dur = Math.min(sec || S.dur, S.dur - from);
    const oc = new OfflineAudioContext(2, Math.ceil(sr * (dur + 1.5)), sr), M = mixer(oc, oc.destination);
    const s0 = Math.floor(from / S.sd), s1 = Math.min(S.steps, s0 + Math.ceil(dur / S.sd));
    for (let st = s0; st < s1; st++) step(M, S, st, .05 + (st - s0) * S.sd);
    return await oc.startRendering();
  }
  function wav(buf) {
    const ch = buf.numberOfChannels, L = buf.length, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + L * ch * 2));
    const w = (o, s) => { for (let k = 0; k < s.length; k++) out.setUint8(o + k, s.charCodeAt(k)); };
    w(0, 'RIFF'); out.setUint32(4, 36 + L * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
    out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, L * ch * 2, true);
    const C = []; for (let c = 0; c < ch; c++) C.push(buf.getChannelData(c));
    let o = 44; for (let k = 0; k < L; k++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, C[c][k])); out.setInt16(o, v < 0 ? v * 32768 : v * 32767, true); o += 2; }
    return new Blob([out], { type: 'audio/wav' });
  }
  return { TRACKS, STY, song, mixer, step, player, renderOffline, wav, I, midi };
})();
