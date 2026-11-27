/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Ondas da cidade
   💃 Discoteca Kizomba com o set do DJ ao vivo (todos os
   jogadores na pista ouvem a mesma música ao mesmo tempo)
   📻 Aparelhagem de som da casa finalmente interativa:
   sintoniza as 5 rádios ao vivo ou a tua playlist.
   Carregado depois de live.js e vida2.js.
   ========================================================= */
(function () {
  if (typeof T === 'undefined' || typeof MZ === 'undefined' || typeof SND === 'undefined') return;

  /* ============ 💃 DISCOTECA — o DJ passa música ao vivo ============ */
  const DISCO = { on: false, key: '', st0: null, saida: 0 };
  // roda da noite: 2 quentes (kuduro/afro) + 1 lento (kizomba/semba), sem anúncios
  const _hot = [], _slow = [];
  MZ.TRACKS.forEach((t, i) => { (t.g === 'kuduro' || t.g === 'afrohouse' ? _hot : _slow).push(i); });
  const SET = [];
  for (let k = 0; k < 24; k++) SET.push(_hot[(k * 7 + 3) % _hot.length], _hot[(k * 5 + 11) % _hot.length], _slow[(k * 3 + 1) % _slow.length]);
  const DURS = SET.map(i => SND.RADIO.trackDur(i));
  const CYC = DURS.reduce((a, b) => a + b, 0);
  function discoSegAt(now) {   // determinístico no tempo: pista sincronizada para todos
    let p = ((now % CYC) + CYC) % CYC;
    for (let n = 0; n < SET.length; n++) { if (p < DURS[n]) return { i: SET[n], off: p, n }; p -= DURS[n]; }
    return { i: SET[0], off: 0, n: 0 };
  }
  setInterval(() => {
    try {
      if (typeof G === 'undefined' || !G || typeof mode === 'undefined' || mode !== 'game') return;
      const naDisco = typeof inInt !== 'undefined' && inInt && inInt.loc === 'farra';
      const R = SND.RADIO;
      if (naDisco) {
        // respeita o jogador que pôs a música dele no telemóvel
        if (R.on && !DISCO.on && !LIVE.owned) return;
        if (DISCO.st0 === null) { DISCO.st0 = LIVE.st || ''; LIVE.st = null; }   // a pista manda: a rádio ao vivo espera lá fora
        const g = discoSegAt(LIVE.now()), key = g.n + ':' + g.i;
        if (!(R.on && DISCO.on && DISCO.key === key && Math.abs(R.pos() - g.off) < 2.5)) {
          R.onEnd = () => { if (DISCO.on) DISCO.key = ''; };
          R.play(g.i, Math.max(0, g.off)); DISCO.on = true; DISCO.key = key;
          const T = MZ.TRACKS[g.i];
          if (Date.now() - DISCO.saida > 8000) toast(`💃 Na pista: <b>${T.t}</b> — ${T.a}`);
        }
      } else if (DISCO.on || DISCO.st0 !== null) {
        if (DISCO.on) { DISCO.on = false; DISCO.key = ''; R.onEnd = null; R.stop(); }
        LIVE.st = DISCO.st0 || null; DISCO.st0 = null; DISCO.saida = Date.now();
        if (LIVE.st) lvRadioTick();   // retoma a rádio que estavas a ouvir
      }
    } catch (e) { console.error('disco', e); }
  }, 500);

  /* ============ 📻 aparelhagem de som da casa (o móvel 'som' ganha vida) ============ */
  if (typeof V2_PROPS !== 'undefined') V2_PROPS.ivSomCasa = { ico: '📻', label: 'Aparelhagem · música', act: 'som', r: 1.2, max: 1 };
  if (typeof window.ivSomCasa === 'function') {   // mesmo registo que os outros móveis (vida2.js)
    const _is = window.ivSomCasa;
    window.ivSomCasa = function () {
      const a = [...arguments];
      try { if (V2.rec && IVP === V2.rec.st) V2.rec.list.push({ k: 'ivSomCasa', a }); } catch (e) { }
      return _is.apply(this, arguments);
    };
  }
  function ondasSomUI() {
    const agora = s => { try { const g = lvSegAt(s); return g.s.k === 'song' ? MZ.TRACKS[g.s.i] : null; } catch (e) { return null; } };
    openModal(`<h3>📻 Aparelhagem de som</h3>
      <p class="apnote">As rádios de Luanda ao vivo — toda a cidade ouve o mesmo ao mesmo tempo.</p>
      <div class="clist">${LV_ST.map(s => {
        const cur = agora(s), on = LIVE.st === s.id;
        return `<button class="crow ${on ? 'playing' : ''}" onclick="ondasTune('${s.id}')"><div class="cav" style="background:linear-gradient(135deg,${s.c1},${s.c2});color:#fff">📻</div><div class="cinfo"><b>${s.n} <small style="opacity:.75">${s.f} FM</small></b><span>${cur ? '🎵 ' + esc(cur.t) + ' — ' + esc(cur.a) : '🎙️ ' + s.pr.join(' · ')}</span></div><span style="color:${on ? '#25d366' : '#888'};font-size:12px">${on ? '● AO VIVO' : '▶'}</span></button>`;
      }).join('')}</div>
      <div class="apsec">Ou a tua música</div>
      <button class="crow" onclick="ondasTune('__pl')"><div class="cav g-kizomba">🎧</div><div class="cinfo"><b>Playlist Kianda Beats</b><span>${MZ.TRACKS.length} faixas originais criadas pelo jogo</span></div><span style="color:#888">▶</span></button>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn" style="flex:1" onclick="ondasNext()">⏭ Mudar de faixa</button>
        <button class="btn" style="flex:1" onclick="ondasStop()">⏹ Desligar</button>
      </div>`);
  }
  window.ondasTune = function (id) {
    if (id === '__pl') { lvTune(null); SND.unlock(); SND.RADIO.play(); toast('🎧 A tocar a tua playlist Kianda Beats.'); }
    else { lvTune(id); const s = lvStation(id); toast(`📻 Sintonizaste a <b>${s.n}</b> — ao vivo!`); }
    closeModal(); save();
  };
  window.ondasNext = function () { SND.unlock(); if (LIVE.st) { toast('📻 Na rádio ao vivo não dá para saltar — muda de estação!'); } else { SND.RADIO.next && SND.RADIO.next(); } ondasSomUI(); };
  window.ondasStop = function () { lvTune(null); SND.RADIO.onEnd = null; if (SND.RADIO.on) SND.RADIO.stop(); closeModal(); toast('📻 Aparelhagem desligada.'); };
  window.ondasSomUI = ondasSomUI;
  if (typeof v2PropAct === 'function') {   // a ação da estação junto à aparelhagem
    const _v2pa = v2PropAct;
    v2PropAct = function (st) {
      if (st && st.act === 'som') {
        playerEmote('think');
        if (typeof listenMusic === 'function') listenMusic();
        return ondasSomUI();
      }
      return _v2pa.apply(this, arguments);
    };
  }
})();
