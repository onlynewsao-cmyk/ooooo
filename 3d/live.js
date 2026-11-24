/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Canais ao vivo (rádios e TV)
   Todos os jogadores ouvem/vêem o MESMO no mesmo instante:
   a programação é calculada a partir do relógio do servidor.
   • 5 rádios com locutor, publicidade e dedicatórias dos jogadores
   • 4 canais de TV: Telejornal, futebol em direto, novela, música
   • TVs das casas mostram o canal ao vivo
   Carregado depois de mp.js.
   ========================================================= */
const LIVE = {
  off: 0, synced: false, st: localStorage.getItem('pe3d_st') || null, tvCh: localStorage.getItem('pe3d_tv') || 'tj',
  chs: {}, ded: [], dsince: 0, owned: false, segKey: '', tex: null, texCv: null, radTab: 'live', lastGoal: '', lastEnd: '', tvT: 0,
  now() { return (Date.now() + this.off) / 1000; },
  mpBody() { return { ch: lvCh(), dsince: this.dsince }; },
  onMp(d, lat) {
    if (d.srv) { const o = (d.srv + (lat || 0)) * 1000 - Date.now(); this.off = this.synced ? this.off * .8 + o * .2 : o; this.synced = true; }
    this.chs = d.chs || {};
    for (const x of d.ded || []) { if (x.id <= this.dsince) continue; this.dsince = x.id; lvGotDed(x, !this.dedInit); }
    this.dedInit = true;
  },
};
const lvRng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const lvMMSS = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const lvClock = () => { const d = new Date(LIVE.now() * 1000); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

/* =========================================================
   RÁDIOS AO VIVO
   ========================================================= */
const LV_ST = [
  { id: 'kizomba', n: 'Kizomba FM', f: '99.9', g: ['kizomba'], c1: '#ff5c8a', c2: '#590d22', dj: ['DJ Nelo', 'Yara Luz', 'Mana Kiesse', 'Kota Romântico'], pr: ['Manhã Romântica', 'Kizomba ao Almoço', 'Tarde Tarraxinha', 'Noite Quente'] },
  { id: 'kuduro', n: 'Rádio Kuduro Bwé', f: '102.5', g: ['kuduro'], c1: '#00f5d4', c2: '#3c096c', dj: ['Mano Bwé', 'DJ Kalibre', 'Puto Kinaxixi', 'Tia Kuduro'], pr: ['Acorda Musseque', 'Kuduro na Hora', 'Tarde de Fogo', 'Bwé de Noite'] },
  { id: 'afro', n: 'Afro Luanda', f: '95.1', g: ['afrohouse'], c1: '#ffd166', c2: '#06604d', dj: ['DJ Palanca', 'DJ Kalunga', 'Mukuxi', 'DJ Lobito'], pr: ['Sunrise Session', 'Afro Lunch', 'Marginal Grooves', 'Talatona Deep Night'] },
  { id: 'semba', n: 'Rádio Semba Kota', f: '88.3', g: ['semba'], c1: '#f4a261', c2: '#6b2c00', dj: ['Kota Mabanza', 'Mestre Kituxi', 'Dona Rebita', 'Kota Marçal'], pr: ['Bom Dia Kota', 'Semba e Saudade', 'Rebita da Tarde', 'Serão dos Kotas'] },
  { id: 'mix', n: 'Mwangolé Mix', f: '91.7', g: ['kizomba', 'semba', 'kuduro', 'afrohouse'], c1: '#4cc9f0', c2: '#1d3557', dj: ['Djeny Bwé', 'Nelo K', 'Lurdes Mix', 'DJ Kianda'], pr: ['Despertar Angola', 'Top Mwangolé', 'Mix da Tarde', 'Noite Mwangolé'] },
];
const LV_ADS = ['Kitanda Super: tudo mais barato, todos os dias!', 'Banco Palanca: o teu dinheiro em boas mãos.', 'DarkCell: Semana Bwé — chamadas e SMS à vontade por 9.900 Kz!', 'Txova: a fome não espera, a Txova também não!', 'Kianda Mall: as melhores lojas num só lugar.', 'Kandonga: chega lá mais rápido e mais barato!', 'Céu Net: internet até na lavra.', 'Mulemba Petróleos: energia que move Angola.', 'Casa Já: a casa dos teus sonhos à distância de um toque.'];
const LV_LOC = ['Bom dia, boa tarde, boa noite Angola! Estás a ouvir {n}, {f} FM!', 'Manda a tua dedicatória pela app de Rádio e ouve o teu nome no ar!', 'Hora certa em Luanda: {hora}. Bwé de música a seguir!', 'Um abraço a todos os jogadores ligados agora: {online} na cidade!', 'Trânsito: muita fila na Marginal e no Kilamba. Vai de Kandonga!', 'Tempo: calor em Luanda, cacimbo no Huambo. Bebe água, kamba!', 'Não mexe no botão! {n}, a rádio que não pára.', 'E agora as notícias da cidade: {news}!', 'Olha que isto aconteceu mesmo aqui no jogo: {news}. Bwé, né?', 'Na cidade conta-se que {news}. Nós vamos acompanhando!'];
const lvProg = st => { const h = new Date(LIVE.now() * 1000).getHours(); const i = h < 6 ? 3 : h < 12 ? 0 : h < 15 ? 1 : h < 20 ? 2 : 3; return { pr: st.pr[i], dj: st.dj[i] }; };
const LV_SCHED = {};
function lvSched(st) {
  if (LV_SCHED[st.id]) return LV_SCHED[st.id];
  const T = SND.RADIO.TRACKS, rnd = lvRng(phHash(st.id)), segs = [];
  let ids = T.map((x, i) => i).filter(i => st.g.includes(T[i].g));
  const order = []; for (let k = 0; k < 3; k++) order.push(...ids.slice().sort(() => rnd() - .5));
  order.forEach((i, n) => {
    segs.push({ k: 'song', i, d: SND.RADIO.trackDur(i) });
    if (n % 2 === 1) {
      if (n % 4 === 1) segs.push({ k: 'ad', d: 9, txt: LV_ADS[Math.floor(rnd() * LV_ADS.length)] });
      else { const q = (n >> 2) % 3, r0 = rnd(); /* locutor com voz: identificação da rádio, dedicatórias, "fica connosco" */
        segs.push(q === 0 ? { k: 'loc', d: 9, vox: 'id_' + st.id, txt: '{n}, {f} FM! ' + (st.id === 'kuduro' ? 'A batida da banda, sem parar!' : st.id === 'kizomba' ? 'Romance, tarraxinha e muito amor.' : st.id === 'semba' ? 'O semba dos kotas, a raiz de Angola.' : st.id === 'afro' ? 'Deep house e muito groove, da Marginal para o mundo.' : 'Todos os ritmos de Angola, numa só rádio.') }
          : q === 1 ? { k: 'loc', d: 8, txt: LV_LOC[Math.floor(r0 * LV_LOC.length)] }
          : r0 < .5 ? { k: 'loc', d: 8, vox: 'dj_ded', txt: 'Manda a tua dedicatória pela app de Rádio e ouve o teu nome no ar!' } : { k: 'loc', d: 9, vox: 'dj_next', txt: 'Fica connosco, que a seguir vem mais música quente! Bwé de música, mano!' }); }
    }
  });
  let t = 0; segs.forEach(s => { s.t0 = t; t += s.d; });
  return (LV_SCHED[st.id] = { segs, cyc: t });
}
function lvSegAt(st, T = LIVE.now()) {
  const S = lvSched(st), p = ((T % S.cyc) + S.cyc) % S.cyc;
  let lo = 0, hi = S.segs.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (S.segs[m].t0 <= p) lo = m; else hi = m - 1; }
  const s = S.segs[lo]; return { s, off: p - s.t0, n: lo, cycN: Math.floor(T / S.cyc), next: S.segs[(lo + 1) % S.segs.length], next2: S.segs[(lo + 2) % S.segs.length] };
}
const lvStation = id => LV_ST.find(s => s.id === id);
function lvBusyUI() { const a = document.activeElement, d = document.getElementById('dedBox'); return (a && /INPUT|TEXTAREA/.test(a.tagName) && a.closest && a.closest('#phBody')) || (d && !d.classList.contains('hidden')); }
const lvTxt = (t, st) => t.replace('{n}', st.n).replace('{f}', st.f).replace('{hora}', lvClock()).replace('{online}', typeof MP !== 'undefined' ? MP.online : 1).replace('{news}', typeof newsLine === 'function' ? newsLine() : 'a cidade não pára');
function lvTvActive() { return G && (!!LIVE.watch || (phoneApp === 'tv' && lvPhoneTvOk()) || (typeof inInt !== 'undefined' && inInt && inInt.loc === 'casa')); }
function lvTvCur() { return LIVE.watch || LIVE.tvCh; }
function lvPhoneTvOk() { return !!(G && G.contas && G.contas.ano === G.ano && (G.contas.pagas || []).includes('tv')); }
function lvAudioStation() { if (lvTvActive() && lvTvCur() === 'mus') return lvStation('mix'); return LIVE.st ? lvStation(LIVE.st) : null; }
function lvCh() { if (!G) return ''; if (lvTvActive()) return 'tv:' + lvTvCur(); return LIVE.st ? 'r:' + LIVE.st : ''; }
function lvCount(ch) { const n = LIVE.chs[ch] || 0; return (typeof MP !== 'undefined' && MP.offline) ? (lvCh() === ch ? 1 : 0) : n; }

function lvTune(id) {
  LIVE.st = id || null; localStorage.setItem('pe3d_st', LIVE.st || '');
  if (!id && LIVE.owned) { SND.RADIO.onEnd = null; SND.RADIO.stop(); LIVE.owned = false; }
  if (id) { SND.unlock(); SND.play('tvon'); LIVE.segKey = ''; lvRadioTick(); if (!G.musicaAno && typeof listenMusic === 'function') listenMusic(); }
  if (phoneApp === 'musica') renderPhone(true);
}
function lvRadioTick() {
  if (typeof SND === 'undefined' || !SND.ctx || SND.ctx.state !== 'running') return;
  const R = SND.RADIO, st = lvAudioStation();
  if (!st) { if (LIVE.owned) { R.onEnd = null; if (R.on) R.stop(); LIVE.owned = false; } return; }
  if (R.on && !LIVE.owned) { /* o jogador está a ouvir a playlist dele: a rádio ao vivo assume */ }
  const g = lvSegAt(st), key = st.id + ':' + g.cycN + ':' + g.n;
  if (g.s.k === 'song') {
    if (!(R.on && R.idx === g.s.i && Math.abs(R.pos() - g.off) < 2.5)) { R.onEnd = () => R.stop(); R.play(g.s.i, g.off); LIVE.owned = true; }
  } else {
    if (R.on && LIVE.owned) R.stop();
    if (LIVE.segKey !== key && g.off < 2) SND.play('jingle');
    if (LIVE.segKey !== key && g.s.vox && g.off < g.s.d - 1.5 && SND.voice) SND.voice(g.s.vox, { from: Math.max(0, g.off - .7), delay: g.off < .7 ? .7 - g.off : 0 });
  }
  if (LIVE.segKey !== key) { LIVE.segKey = key; if (phoneApp === 'musica' && LIVE.radTab === 'live' && !lvBusyUI()) renderPhone(true); }
}
setInterval(() => { try { if (G && mode === 'game') { lvRadioTick(); lvTvAudio(); } } catch (e) { console.error(e); } }, 500);

/* ---------------- dedicatórias ---------------- */
function lvGotDed(x, old) {
  LIVE.ded.push(x); if (LIVE.ded.length > 60) LIVE.ded.shift();
  if (old) return;
  const st = lvStation(x.ch); if (!st) return;
  if (typeof mpSys === 'function') mpSys(`📻 ${st.n}: ${x.nick} dedicou uma música a ${x.para}`);
  if (LIVE.st === x.ch && typeof p2Banner === 'function' && !phoneApp) p2Banner('📻', `${st.n} · ao vivo`, `${x.nick} dedica a ${x.para}: “${x.txt || 'com carinho'}”`, () => { if (!phoneApp) openPhone(); phoneApp = 'musica'; renderPhone(); });
  if (phoneApp === 'musica' && !lvBusyUI()) renderPhone(true);
}
async function lvSendDed() {
  const st = LIVE.st; if (!st) return toast('📻 Sintoniza uma rádio primeiro.');
  const para = (document.getElementById('dedPara') || {}).value || '', txt = (document.getElementById('dedTxt') || {}).value || '';
  if (!para.trim()) return toast('📻 Escreve para quem é a dedicatória.');
  if (typeof MP === 'undefined' || MP.offline || !(Acc.online && Acc.token)) {
    const a = MPF(para), b = MPF(txt || 'com carinho');
    if (!a.ok || !b.ok || a.hits || b.hits) return toast('📻 A rádio recusou a dedicatória: linguagem ofensiva.');
    LIVE.dsince++; lvGotDed({ id: 'l' + Date.now(), ch: st, nick: G.nome, para: a.txt, txt: b.txt, t: LIVE.now() });
    return toast('📻 Dedicatória no ar! (modo offline: só tu ouves)');
  }
  try {
    const r = await fetch('/api/ded', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify({ ch: st, para, txt }) });
    const d = await r.json();
    if (!d.ok) { SND.play('err'); return toast('📻 ' + (d.erro || 'Não foi possível enviar.')); }
    SND.play('jingle'); toast(`📻 A tua dedicatória vai passar na ${lvStation(st).n} para todos os ouvintes!`);
    ['dedPara', 'dedTxt'].forEach(i => { const e = document.getElementById(i); if (e) e.value = ''; }); const bx = document.getElementById('dedBox'); if (bx) bx.classList.add('hidden');
    if (d.ded && d.ded.id > LIVE.dsince) { LIVE.dsince = d.ded.id; lvGotDed(d.ded); }
  } catch (e) { toast('📻 Sem ligação ao servidor.'); }
}

/* ---------------- app Rádio ---------------- */
(function () {
  const a = APPS.find(x => x.id === 'musica'); if (a) a.t = 'Rádio FM';
  const at = APPS.findIndex(x => x.id === 'musica');
  if (!APPS.some(x => x.id === 'tv')) APPS.splice(at + 1, 0, { id: 'tv', ico: '📺', t: 'Kalemba TV', bg: 'linear-gradient(#ff3b30,#7a0b06)', tel: 2 });
})();
const lvOldMusica = PHONE_VIEWS.musica;
function lvRadTab(t) { LIVE.radTab = t; renderPhone(); }
function lvNowTxt(st) {
  const g = lvSegAt(st), T = SND.RADIO.TRACKS;
  if (g.s.k === 'song') return { ico: '🎵', t: T[g.s.i].t, a: T[g.s.i].a, k: 'song', g };
  if (g.s.k === 'ad') return { ico: '📢', t: 'Publicidade', a: g.s.txt, k: 'ad', g };
  return { ico: '🎙️', t: lvProg(st).dj + ' ao microfone', a: lvTxt(g.s.txt, st), k: 'loc', g };
}
PHONE_VIEWS.musica = () => {
  const tabs = p2Tabs(LIVE.radTab, [['live', '📻 Rádios ao vivo'], ['list', '🎵 A minha playlist']], 'lvRadTab');
  if (LIVE.radTab === 'list') { const h = lvOldMusica(); return h.includes('<div class="nowp">') ? h.replace('<div class="nowp">', tabs + '<div class="nowp">') : tabs + h; }
  let h = apHead('Rádio FM', 'Rádios ao vivo · iguais para todos', `<span class="aibadge lvbadge">● AO VIVO</span>`) + tabs;
  const cur = LIVE.st && lvStation(LIVE.st);
  if (cur) {
    const N = lvNowTxt(cur), P = lvProg(cur), g = N.g, nx = g.next.k === 'song' ? SND.RADIO.TRACKS[g.next.i] : null;
    const deds = LIVE.ded.filter(x => x.ch === cur.id).slice(-4).reverse();
    h += `<div class="lvnow" style="--c1:${cur.c1};--c2:${cur.c2}">
      <div class="lvtop"><span class="lvfreq">${cur.f}</span><div><b>${cur.n}</b><small>${P.pr} · com ${P.dj}</small></div><span class="lvon">👂 ${lvCount('r:' + cur.id)}</span></div>
      <div class="lvwave ${N.k === 'song' ? 'on' : ''}">${Array.from({ length: 28 }, (_, i) => `<i style="animation-delay:${(i * 73 % 900) / 1000}s"></i>`).join('')}</div>
      <div class="lvsong"><span class="lvk">${N.k === 'song' ? 'A TOCAR AGORA' : N.k === 'ad' ? 'INTERVALO' : 'NO AR'}</span><b>${N.ico} ${esc(N.t)}</b><span>${esc(N.a)}</span></div>
      <div class="prog"><i id="lvProg" style="width:${(g.off / g.s.d * 100).toFixed(1)}%"></i></div><div class="fmtime"><span id="lvTime">${lvMMSS(g.off)}</span> / ${lvMMSS(g.s.d)}</div>
      ${nx ? `<div class="lvnext">A seguir: <b>${esc(nx.t)}</b> · ${esc(nx.a)}</div>` : ''}
      <div class="pgrid2"><button class="pbtn" style="background:rgba(0,0,0,.35)" onclick="lvTune(null)">⏹ Desligar</button><button class="pbtn" style="background:rgba(255,255,255,.18)" onclick="document.getElementById('dedBox').classList.toggle('hidden')">💌 Dedicar música</button></div>
      <div id="dedBox" class="dedbox hidden"><input id="dedPara" data-noic maxlength="30" placeholder="Para quem? (ex: Mana Lurdes)"><input id="dedTxt" data-noic maxlength="100" placeholder="Mensagem (ex: Esta é para ti ❤️)"><button class="pbtn" onclick="lvSendDed()">📻 Enviar para o ar</button><small>Todos os ouvintes ouvem a tua dedicatória. Filtro de ofensas ativo · 1 a cada 30 s.</small></div>
      ${deds.length ? `<div class="lvdeds"><span class="lvk">DEDICATÓRIAS AO VIVO</span>${deds.map(x => `<div><b>${esc(x.nick)}</b> → <b>${esc(x.para)}</b>${x.txt ? `: “${esc(x.txt)}”` : ''}</div>`).join('')}</div>` : ''}
    </div>`;
  }
  h += `<div class="apsec">Estações</div><div class="clist">${LV_ST.map(st => { const N = lvNowTxt(st), on = LIVE.st === st.id; return `<button class="crow lvrow ${on ? 'playing' : ''}" onclick="lvTune('${st.id}')"><div class="lvav" style="background:linear-gradient(135deg,${st.c1},${st.c2})">${st.f}</div><div class="cinfo"><b>${st.n}</b><span>${N.ico} ${esc(N.t)}${N.k === 'song' ? ' · ' + esc(N.a) : ''}</span></div><div class="lvr"><small>👂 ${lvCount('r:' + st.id)}</small>${on ? '<i class="eqmini"><b></b><b></b><b></b></i>' : '<span>▶</span>'}</div></button>`; }).join('')}</div>
    <p class="apnote">As rádios emitem ao vivo: todos os jogadores sintonizados ouvem a mesma música ao mesmo tempo, com locutores, publicidade e dedicatórias. Quem está perto de ti também ouve.</p>`;
  return h;
};
setInterval(() => {
  try {
    if (phoneApp !== 'musica' || LIVE.radTab !== 'live' || !LIVE.st) return;
    const g = lvSegAt(lvStation(LIVE.st)), p = document.getElementById('lvProg'), t = document.getElementById('lvTime');
    if (p) p.style.width = (g.off / g.s.d * 100).toFixed(1) + '%'; if (t) t.textContent = lvMMSS(g.off);
  } catch (e) { }
}, 250);
/* a playlist pessoal desliga a rádio ao vivo */
(function () {
  if (typeof p2Play === 'function') { const _p = p2Play; p2Play = function () { if (LIVE.st) { LIVE.st = null; localStorage.setItem('pe3d_st', ''); } LIVE.owned = false; SND.RADIO.onEnd = null; return _p.apply(this, arguments); }; }
  if (typeof p2NowWidget === 'function') {
    const _w = p2NowWidget;
    p2NowWidget = function (big) {
      const st = LIVE.st && lvStation(LIVE.st);
      if (!st) return _w.apply(this, arguments);
      const N = lvNowTxt(st);
      return `<div class="nowmini ${big ? 'big' : ''}"><div class="nmc" style="background:linear-gradient(135deg,${st.c1},${st.c2});font-size:10px;font-weight:900">${st.f}</div><div class="nmt"><b>${esc(N.t)}</b><span>● AO VIVO · ${st.n}</span></div><button onclick="event.stopPropagation();lvTune(null);renderPhone(true)">⏹</button></div>`;
    };
  }
})();

/* =========================================================
   TV AO VIVO
   ========================================================= */
const LV_TV = [
  { id: 'tj', n: 'Kalemba 1', s: 'Telejornal', c: '#1565c0' },
  { id: 'desp', n: 'Kalemba Desporto', s: 'Futebol em direto', c: '#2e7d32' },
  { id: 'nov', n: 'Kalemba Novelas', s: 'Amor na Banda', c: '#ad1457' },
  { id: 'mus', n: 'Kalemba Música', s: 'Clips 24 h', c: '#6a1b9a' },
];
const LV_TEAMS = [['Petro de Luanda', 'PET', '#ffd400', '#00205b'], ['1º de Agosto', 'AGO', '#c8102e', '#111'], ['Sagrada Esperança', 'SAG', '#00843d', '#fff'], ['Interclube', 'INT', '#0047ab', '#fff'], ['Kabuscorp', 'KAB', '#8b0000', '#ffd700'], ['Desportivo da Huíla', 'HUI', '#1e88e5', '#fff'], ['Leões da Ilha', 'LEO', '#ff8f00', '#000'], ['Águias do Kilamba', 'AGK', '#6d4c41', '#fff']];
const LV_MATCH = 720, LV_PLAY = 600;
function lvMatch(n) {
  const r = lvRng(n * 7919 + 13), a = Math.floor(r() * 8); let b = Math.floor(r() * 7); if (b >= a) b++;
  const ng = Math.floor(r() * r() * 6), goals = [];
  for (let i = 0; i < ng; i++) goals.push({ m: 1 + Math.floor(r() * 90), h: r() < .55 ? 0 : 1, sc: ['Gelson', 'Mabululu', 'Zini', 'Show', 'Jacinto', 'Tó Carneiro', 'Manguxi', 'Ary Papel', 'Freddy', 'Dany Massunguna'][Math.floor(r() * 10)] });
  goals.sort((x, y) => x.m - y.m);
  return { n, A: LV_TEAMS[a], B: LV_TEAMS[b], goals };
}
function lvMatchNow(T = LIVE.now()) {
  const n = Math.floor(T / LV_MATCH), t = T - n * LV_MATCH, M = lvMatch(n);
  const live = t < LV_PLAY, min = live ? Math.min(90, Math.floor(t / LV_PLAY * 90) + 1) : 90;
  const gs = M.goals.filter(g => g.m <= min), s = [gs.filter(g => !g.h).length, gs.filter(g => g.h).length];
  const last = gs[gs.length - 1], goalNow = live && last && (t - last.m / 90 * LV_PLAY) < 7 ? last : null;
  return { M, t, live, min, s, gs, goalNow, left: LV_MATCH - t };
}
const LV_COM = ['Bola no meio-campo, jogo muito disputado!', 'Grande defesa do guarda-redes!', 'Livre perigoso à entrada da área...', 'Que passe! A bancada levanta-se!', 'Remate por cima da barra!', 'Canto para a equipa da casa.', 'O árbitro mostra o cartão amarelo!', 'Contra-ataque rápido pela direita!', 'Os adeptos não param de cantar!', 'Fora de jogo, assinala o assistente.'];
const LV_NOV = {
  ch: [['Dona Fefa', '#8d5524', '#c2185b', '#2b1a12'], ['Zeca', '#6b3f1f', '#1565c0', '#111'], ['Kiesse', '#a0663a', '#f9a825', '#1b0f08'], ['Tio Ngola', '#5a3215', '#4e342e', '#ddd']],
  bg: [['A sala da Dona Fefa', '#f4d6a0', '#a0522d'], ['Rua do Cazenga, à noite', '#1a2340', '#3a3a3a'], ['Praia da Ilha', '#7ec8e3', '#f2d16b'], ['Restaurante Sabores da Banda', '#ffcc80', '#6d4c41']],
  ln: ['Zeca, onde estiveste a noite toda?!', 'Mãe, juro que estava a estudar na casa do Tio Ngola!', 'Estudar? Com esse cheiro a farra?', 'Kiesse, tu sabias do segredo e não me contaste?', 'Eu só queria proteger-te, Zeca...', 'O dinheiro do kixikila desapareceu!', 'Alguém nesta família está a mentir.', 'Tio Ngola, o senhor é o meu verdadeiro pai?', 'Há coisas que é melhor não saber, miúdo.', 'Amanhã vou pedir a Kiesse em casamento!', 'Casamento? Sem alambamento não há casamento!', 'O alambamento vai custar 5 milhões e 3 grades de cerveja.', 'Vou trabalhar dia e noite, mas ela vai ser minha!', 'Dona Fefa, a sua muamba é a melhor de Luanda!', 'Não me venhas com graxa, Tio Ngola.', 'Zeca! A Kiesse foi vista com o filho do patrão!', 'Não pode ser... o meu coração está partido!', 'Calma, mano. Amanhã há outro episódio.', 'Eu nunca te trairia, Zeca. Era tudo mentira!', 'Então quem roubou o kixikila?!', 'Fui eu... mas foi para pagar a escola da Kiesse.', 'Ai, meu Deus! Que vergonha nesta família!', 'A vida em Luanda não é fácil, mas o amor vence tudo.', 'Continua no próximo episódio...'],
};
const LV_CLIPS = ['TOP 10 MWANGOLÉ', 'ESTREIA EXCLUSIVA', 'MAIS PEDIDO DA SEMANA', 'CLIP DO DIA'];
let lvHL = null, lvHLt = 0;
function lvHeadlines() {
  if (lvHL && performance.now() - lvHLt < 3000) return lvHL;
  const out = [];
  try { newsReal().forEach(t => out.push(strip(t))); } catch (e) { }
  try { p2News().forEach(([t, a]) => a.forEach(x => out.push(strip(x.t)))); } catch (e) { }
  const m = lvMatchNow(); out.splice(1, 0, `${m.live ? 'Ao vivo' : 'Final'}: ${m.M.A[0]} ${m.s[0]}-${m.s[1]} ${m.M.B[0]}`);
  if (typeof MP !== 'undefined') out.splice(3, 0, `${MP.online} jogador${MP.online > 1 ? 'es' : ''} online agora na cidade`);
  lvHLt = performance.now(); return (lvHL = out.length ? out : ['Angola hoje: tudo sobre o país']);
}

/* ---------------- desenho dos canais ---------------- */
function lvPerson(x, cx, cy, s, skin, shirt, hair, talk, t, fem) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  x.fillStyle = shirt; x.beginPath(); x.moveTo(-26, 60); x.quadraticCurveTo(-28, 8, 0, 6); x.quadraticCurveTo(28, 8, 26, 60); x.fill();
  x.fillStyle = skin; x.fillRect(-6, -4, 12, 12);
  x.beginPath(); x.ellipse(0, -22, 18, 21, 0, 0, 7); x.fill();
  x.fillStyle = hair; x.beginPath(); x.ellipse(0, -36, fem ? 21 : 18, fem ? 14 : 10, 0, Math.PI, 0); x.fill(); if (fem) { x.beginPath(); x.arc(0, -48, 9, 0, 7); x.fill(); }
  const blink = (t % 4) < .12;
  x.fillStyle = '#111'; if (blink) { x.fillRect(-9, -24, 6, 1.6); x.fillRect(3, -24, 6, 1.6); } else { x.beginPath(); x.arc(-6, -24, 2.4, 0, 7); x.arc(6, -24, 2.4, 0, 7); x.fill(); }
  const mo = talk ? 1 + Math.abs(Math.sin(t * 13)) * 4 : 1; x.fillStyle = '#5a1a1a'; x.beginPath(); x.ellipse(0, -11, 5, mo, 0, 0, 7); x.fill();
  x.restore();
}
function lvText(x, txt, X, Y, maxW, font, col, align) { x.font = font; x.fillStyle = col; x.textAlign = align || 'left'; let t = txt; while (x.measureText(t).width > maxW && t.length > 4) t = t.slice(0, -2); if (t !== txt) t = t.slice(0, -1) + '…'; x.fillText(t, X, Y); x.textAlign = 'left'; }
function lvWrap(x, txt, X, Y, maxW, lh, font, col) { x.font = font; x.fillStyle = col; x.textAlign = 'center'; const w = txt.split(' '); let line = '', y = Y; const lines = []; for (const p of w) { const t = line ? line + ' ' + p : p; if (x.measureText(t).width > maxW && line) { lines.push(line); line = p; } else line = t; } lines.push(line); lines.forEach((l, i) => x.fillText(l, X, y + i * lh - (lines.length - 1) * lh)); x.textAlign = 'left'; }
function lvBug(x, ch, live) {
  x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(10, 9, 108, 20); x.fillStyle = ch.c; x.fillRect(10, 9, 5, 20);
  lvText(x, ch.n.toUpperCase(), 20, 23, 96, '800 10px system-ui', '#fff');
  if (live) { x.fillStyle = '#e53935'; x.fillRect(254, 9, 56, 18); x.fillStyle = '#fff'; x.beginPath(); x.arc(262, 18, 3, 0, 7); x.fill(); lvText(x, 'AO VIVO', 268, 22, 44, '800 9px system-ui', '#fff'); }
  lvText(x, lvClock(), live ? 248 : 310, 22, 50, '700 10px system-ui', 'rgba(255,255,255,.85)', 'right');
}
function lvDrawTV(x, w, h, chId, t) {
  const T = LIVE.now(), ch = LV_TV.find(c => c.id === chId) || LV_TV[0];
  x.save(); x.setTransform(w / 320, 0, 0, h / 180, 0, 0);
  if (chId === 'tj') {
    const g = x.createLinearGradient(0, 0, 320, 180); g.addColorStop(0, '#0d2b5e'); g.addColorStop(1, '#1565c0'); x.fillStyle = g; x.fillRect(0, 0, 320, 180);
    x.strokeStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(250, 70, 20 + i * 14 + (T * 6 % 14), 0, 7); x.stroke(); }
    const H = lvHeadlines(), hi = Math.floor(T / 9) % H.length;
    x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(190, 34, 116, 76); x.fillStyle = '#ffcb00'; x.fillRect(190, 34, 116, 14); lvText(x, ['ÚLTIMA HORA', 'ECONOMIA', 'DESPORTO', 'PROVÍNCIAS'][hi % 4], 196, 45, 104, '800 9px system-ui', '#111');
    lvWrap(x, H[hi], 248, 84, 104, 12, '700 9.5px system-ui', '#fff');
    x.fillStyle = '#5d4037'; x.fillRect(0, 120, 320, 60); x.fillStyle = '#8d6e63'; x.fillRect(20, 112, 170, 14);
    lvPerson(x, 100, 82, .95, '#7b4a2a', '#263238', '#1b0f08', (T % 9) < 7.5, T, Math.floor(T / 600) % 2 === 1);
    x.fillStyle = '#c62828'; x.fillRect(0, 132, 320, 22); x.fillStyle = '#fff'; x.fillRect(0, 132, 64, 22); lvText(x, 'TELEJORNAL', 32, 147, 60, '900 8px system-ui', '#c62828', 'center');
    lvText(x, H[hi], 70, 147, 244, '700 10px system-ui', '#fff');
    x.fillStyle = 'rgba(0,0,0,.75)'; x.fillRect(0, 158, 320, 22);
    const tick = H.join('   •   ') + '   •   '; x.font = '600 10px system-ui'; const tw = x.measureText(tick).width; const ox = -(T * 40 % tw);
    x.fillStyle = '#ffcb00'; x.fillText(tick, ox, 173); x.fillText(tick, ox + tw, 173);
    lvBug(x, ch, true);
  } else if (chId === 'desp') {
    const m = lvMatchNow(T), A = m.M.A, B = m.M.B;
    x.fillStyle = '#1b5e20'; x.fillRect(0, 0, 320, 180);
    for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#2e7d32' : '#388e3c'; x.fillRect(i * 32, 20, 32, 150); }
    x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1.2; x.strokeRect(12, 26, 296, 138); x.beginPath(); x.moveTo(160, 26); x.lineTo(160, 164); x.stroke(); x.beginPath(); x.arc(160, 95, 18, 0, 7); x.stroke();
    x.strokeRect(12, 66, 30, 58); x.strokeRect(278, 66, 30, 58);
    x.fillStyle = '#0d0d0d'; x.fillRect(0, 0, 320, 20); for (let i = 0; i < 64; i++) { x.fillStyle = ['#ffd400', '#c8102e', '#fff', '#00205b'][(i * 7 + Math.floor(T * 3)) % 4]; x.fillRect(i * 5, 6 + Math.sin(i + T * 6) * 2, 3, 3); }
    if (m.live) {
      const bx = 160 + Math.sin(T * .7) * 110 + Math.sin(T * 1.9) * 25, by = 95 + Math.sin(T * 1.1) * 45 + Math.cos(T * 2.3) * 12;
      const form = [[.06, .5], [.2, .25], [.2, .5], [.2, .75], [.35, .15], [.35, .4], [.35, .6], [.35, .85], [.46, .35], [.46, .65], [.48, .5]];
      [[A, 1], [B, -1]].forEach(([tm, side], k) => form.forEach(([fx, fz], i) => {
        let px = side > 0 ? 12 + fx * 296 : 308 - fx * 296, pz = 26 + fz * 138;
        px += (bx - px) * .18 + Math.sin(T * 1.3 + i * 2 + k) * 6; pz += (by - pz) * .15 + Math.cos(T * 1.1 + i * 3 + k) * 5;
        x.fillStyle = tm[2]; x.beginPath(); x.arc(px, pz, 3.6, 0, 7); x.fill(); x.strokeStyle = tm[3]; x.lineWidth = 1; x.stroke();
      }));
      x.fillStyle = '#fff'; x.beginPath(); x.arc(bx, by, 2.4, 0, 7); x.fill();
    } else {
      x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(60, 60, 200, 70);
      lvText(x, 'FIM DO JOGO', 160, 82, 190, '900 13px system-ui', '#ffcb00', 'center');
      lvText(x, `${A[0]} ${m.s[0]} - ${m.s[1]} ${B[0]}`, 160, 101, 190, '800 11px system-ui', '#fff', 'center');
      const nx = lvMatch(m.M.n + 1); lvText(x, `A seguir (${lvMMSS(m.left)}): ${nx.A[1]} x ${nx.B[1]}`, 160, 119, 190, '600 9.5px system-ui', '#ddd', 'center');
    }
    x.fillStyle = 'rgba(0,0,0,.78)'; x.fillRect(10, 33, 132, 20);
    x.fillStyle = A[2]; x.fillRect(10, 33, 4, 20); x.fillStyle = B[2]; x.fillRect(138, 33, 4, 20);
    lvText(x, `${A[1]} ${m.s[0]} - ${m.s[1]} ${B[1]}`, 18, 47, 90, '900 11px system-ui', '#fff');
    x.fillStyle = '#e53935'; x.fillRect(106, 36, 32, 14); lvText(x, m.live ? m.min + "'" : 'FIM', 122, 46, 30, '800 9px system-ui', '#fff', 'center');
    if (m.goalNow) {
      const k = (Math.sin(T * 8) + 1) / 2; x.fillStyle = `rgba(0,0,0,${.45 + k * .1})`; x.fillRect(0, 70, 320, 50);
      lvText(x, 'GOLOOO!', 160, 98, 300, `900 ${24 + k * 4}px system-ui`, '#ffcb00', 'center');
      lvText(x, `${m.goalNow.sc} (${(m.goalNow.h ? B : A)[0]}) ${m.goalNow.m}'`, 160, 114, 300, '700 10px system-ui', '#fff', 'center');
    }
    x.fillStyle = 'rgba(0,0,0,.72)'; x.fillRect(0, 164, 320, 16);
    lvText(x, m.live ? LV_COM[Math.floor(T / 6) % LV_COM.length] : 'Liga Mwangolé · resumo e análise', 8, 175, 300, '600 9px system-ui', '#fff');
    lvBug(x, ch, m.live);
  } else if (chId === 'nov') {
    const ep = Math.floor(T / 600), et = T - ep * 600, sc = Math.floor(et / 120) % 4, B = LV_NOV.bg[(sc + ep) % 4];
    const g = x.createLinearGradient(0, 0, 0, 180); g.addColorStop(0, B[1]); g.addColorStop(1, B[2]); x.fillStyle = g; x.fillRect(0, 0, 320, 180);
    if (sc === 1) { x.fillStyle = '#ffeb99'; x.beginPath(); x.arc(270, 34, 12, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 20; i++) x.fillRect((i * 53) % 320, (i * 29) % 60, 1.5, 1.5); }
    if (sc === 2) { x.fillStyle = '#4fc3f7'; x.fillRect(0, 96, 320, 30); x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(((T * 20) % 360) - 40, 110, 40, 2); }
    if (sc === 0 || sc === 3) { x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(220, 30, 70, 50); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(226, 36, 58, 38); }
    const li = (Math.floor(et / 6) + ep * 5) % LV_NOV.ln.length, sp = li % 2, c1 = LV_NOV.ch[(ep + sc) % 4], c2 = LV_NOV.ch[(ep + sc + 1) % 4];
    lvPerson(x, 105, 104, 1.05, c1[1], c1[2], c1[3], sp === 0 && (et % 6) < 4.8, T, (ep + sc) % 4 === 0 || (ep + sc) % 4 === 2);
    lvPerson(x, 215, 104, 1.05, c2[1], c2[2], c2[3], sp === 1 && (et % 6) < 4.8, T + 1.7, (ep + sc + 1) % 4 === 0 || (ep + sc + 1) % 4 === 2);
    if (et < 8) { x.fillStyle = 'rgba(80,0,30,.85)'; x.fillRect(0, 0, 320, 180); lvText(x, 'AMOR NA BANDA', 160, 84, 300, '900 24px Georgia,serif', '#ffd6e7', 'center'); lvText(x, `Episódio ${ep % 300 + 1}`, 160, 106, 300, '600 12px system-ui', '#fff', 'center'); }
    else {
      x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(16, 140, 288, 32);
      lvText(x, (sp ? c2 : c1)[0] + ':', 24, 153, 120, '800 9px system-ui', '#ffcb00');
      lvText(x, LV_NOV.ln[li], 24, 166, 272, '600 10.5px system-ui', '#fff');
      lvText(x, B[0], 310, 132, 200, 'italic 600 8.5px system-ui', 'rgba(255,255,255,.75)', 'right');
    }
    lvBug(x, ch, false);
  } else {
    const st = lvStation('mix'), g = lvSegAt(st, T), Tr = SND.RADIO.TRACKS;
    let lvl = .3; const an = SND.RADIO.analyser && SND.RADIO.analyser();
    if (an && SND.RADIO.on && lvAudioStation() === st) { const d = new Uint8Array(32); an.getByteFrequencyData(d); lvl = (d[1] + d[2] + d[3]) / 765; } else lvl = .3 + Math.max(0, Math.sin(T * 8.5)) * .4;
    const hue = (T * 20) % 360, gr = x.createRadialGradient(160, 90, 10, 160, 90, 200); gr.addColorStop(0, `hsl(${hue},90%,${40 + lvl * 25}%)`); gr.addColorStop(1, `hsl(${(hue + 120) % 360},80%,12%)`);
    x.fillStyle = gr; x.fillRect(0, 0, 320, 180);
    for (let i = 0; i < 8; i++) { x.fillStyle = `hsla(${(hue + i * 45) % 360},90%,60%,.25)`; x.beginPath(); x.arc(160 + Math.cos(T + i) * 120, 90 + Math.sin(T * 1.3 + i) * 60, 10 + lvl * 30, 0, 7); x.fill(); }
    [[90, '#1b0f08', '#ff006e'], [160, '#2b1a12', '#ffbe0b'], [230, '#1b0f08', '#3a86ff']].forEach(([px, hair, sh], i) => { const b = Math.abs(Math.sin(T * 4.2 + i)) * 8 * (.5 + lvl); x.save(); x.translate(px, 100 - b); x.rotate(Math.sin(T * 2.1 + i) * .18); lvPerson(x, 0, 0, .8, i === 1 ? '#8d5524' : '#6b3f1f', sh, hair, false, T + i, i !== 1); x.restore(); });
    const song = g.s.k === 'song' ? Tr[g.s.i] : null;
    x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(12, 138, 220, 32); x.fillStyle = '#ff006e'; x.fillRect(12, 138, 4, 32);
    lvText(x, song ? song.t : 'Intervalo · já voltamos', 22, 152, 206, '800 11px system-ui', '#fff');
    lvText(x, song ? song.a + ' · ' + LV_CLIPS[g.s.i % 4] : LV_ADS[Math.floor(T / 9) % LV_ADS.length], 22, 165, 206, '600 9px system-ui', '#ddd');
    lvBug(x, ch, true);
  }
  x.restore();
}

/* ---------------- som da TV ---------------- */
function lvTvAudio() {
  if (typeof SND === 'undefined' || !SND.ctx) return;
  const on = lvTvActive() && lvTvCur() === 'desp', m = on ? lvMatchNow() : null;
  SND.crowd(on && m.live ? (phoneApp === 'tv' || LIVE.watch ? .6 : .35) + Math.sin(LIVE.now() * .8) * .1 : 0);
  if (m && m.goalNow) { const k = m.M.n + ':' + m.goalNow.m; if (LIVE.lastGoal !== k) { LIVE.lastGoal = k; SND.play('goal'); SND.crowd(1.4); if (typeof mpSys === 'function') mpSys(`⚽ GOLO! ${m.M.A[0]} ${m.s[0]}-${m.s[1]} ${m.M.B[0]} (${m.goalNow.m}', ${m.goalNow.sc})`); } }
  const all = lvMatchNow();
  if (!all.live) { const k = String(all.M.n); if (LIVE.lastEnd !== k && all.t < LV_PLAY + 3) { LIVE.lastEnd = k; if (typeof mpSys === 'function') mpSys(`🏁 Final na Kalemba Desporto: ${all.M.A[0]} ${all.s[0]}-${all.s[1]} ${all.M.B[0]}`); if (on) SND.play('whistle'); } }
}

/* ---------------- app Kalemba TV ---------------- */
function lvTvSet(id) { LIVE.tvCh = id; localStorage.setItem('pe3d_tv', id); SND.unlock(); SND.play('tvon'); renderPhone(true); lvTvBoot(); }
function lvTvInfo(chId) {
  const ch = LV_TV.find(c => c.id === chId) || LV_TV[0];
  let info = '';
  if (ch.id === 'desp') {
    const m = lvMatchNow(), nx = [1, 2, 3].map(i => lvMatch(m.M.n + i));
    info = `<div class="lvscore"><div><i style="background:${m.M.A[2]}"></i><b>${m.M.A[0]}</b></div><strong>${m.s[0]} - ${m.s[1]}</strong><div><b>${m.M.B[0]}</b><i style="background:${m.M.B[2]}"></i></div></div><div class="apnote" style="text-align:center">${m.live ? `● Ao vivo · ${m.min}'` : `Fim do jogo · próximo em ${lvMMSS(m.left)}`}</div>`
      + (m.gs.length ? `<div class="lvev">${m.gs.map(g => `<div><span>${g.m}'</span>⚽ ${g.sc} <small>(${(g.h ? m.M.B : m.M.A)[1]})</small></div>`).join('')}</div>` : '')
      + `<div class="apsec">Próximos jogos · Liga Mwangolé</div>${nx.map((M, i) => `<div class="tvepg"><span>+${lvMMSS(m.left + i * LV_MATCH)}</span><b>${M.A[0]} x ${M.B[0]}</b></div>`).join('')}`;
  } else if (ch.id === 'tj') info = `<div class="apsec">Manchetes</div>${lvHeadlines().slice(0, 6).map(t => `<div class="tvepg"><b>${esc(t)}</b></div>`).join('')}`;
  else if (ch.id === 'nov') { const ep = Math.floor(LIVE.now() / 600); info = `<div class="apsec">Amor na Banda · episódio ${ep % 300 + 1}</div><p class="apnote">Dona Fefa, Zeca, Kiesse e Tio Ngola: amor, kixikila, alambamento e segredos de família no Cazenga. Novo episódio a cada 10 minutos, para todos ao mesmo tempo.</p><div class="tvepg"><span>${lvMMSS(600 - (LIVE.now() - ep * 600))}</span><b>até ao próximo episódio</b></div>`; }
  else { const st = lvStation('mix'), g = lvSegAt(st), T = SND.RADIO.TRACKS; const up = [g.s, g.next, g.next2].filter(s => s.k === 'song').map(s => T[s.i]); info = `<div class="apsec">Clips a passar</div>${up.map((t, i) => `<div class="tvepg"><span>${i ? 'a seguir' : 'agora'}</span><b>${esc(t.t)}</b> · ${esc(t.a)}</div>`).join('')}<p class="apnote">O som vem da rádio Mwangolé Mix ao vivo.</p>`; }
  return info;
}
function lvTvChBtns(cur, fn) { return `<div class="tvchs">${LV_TV.map(c => `<button class="${c.id === cur ? 'on' : ''}" style="--c:${c.c}" onclick="${fn}('${c.id}')"><b>${c.n}</b><small>${c.s}</small><em>👁 ${lvCount('tv:' + c.id)}</em></button>`).join('')}</div>`; }
PHONE_VIEWS.tv = () => {
  if (!lvPhoneTvOk()) {
    const sp = (typeof MU_TVS !== 'undefined' ? MU_TVS : []);
    return apHead('Kalemba TV', 'Canais ao vivo', '<span class="aibadge lvbadge">● AO VIVO</span>')
      + `<div class="tvlock"><div class="tvlk">📺</div><b>Para ver TV, procura um ecrã</b><p>Os canais passam nos telões da cidade, nos bares e na TV da tua casa. No telemóvel só com a assinatura Kalemba TV Premium.</p></div>`
      + `<div class="apsec">Onde há TV agora</div><div class="clist">${sp.map(t => { const c = LV_TV.find(x => x.id === t.ch); return `<button class="crow" onclick="closePhone();tapEnter('${t.id}')"><div class="lvav" style="background:${c ? c.c : '#333'}">📺</div><div class="cinfo"><b>${t.n}</b><span>${c ? c.n + ' · ' + c.s : 'Todos os canais'} · 👁 ${t.ch ? lvCount('tv:' + t.ch) : ''}</span></div><span class="lvgo">Ir ›</span></button>`; }).join('')}</div>`
      + `<button class="pbtn" style="margin-top:10px" onclick="phoneOpen('banco')">💳 Assinar Kalemba TV Premium (Banco Móvel)</button>`;
  }
  const ch = LV_TV.find(c => c.id === LIVE.tvCh) || LV_TV[0];
  return apHead('Kalemba TV', 'Premium · canais ao vivo', '<span class="aibadge lvbadge">● AO VIVO</span>')
    + `<div class="tvbox"><canvas id="tvCv" width="640" height="360"></canvas><span class="tvview">👁 ${lvCount('tv:' + ch.id)} a ver</span></div>`
    + lvTvChBtns(ch.id, 'lvTvSet') + lvTvInfo(ch.id) + `<p class="apnote">Os canais emitem ao vivo: todos os jogadores vêem o mesmo programa ao mesmo tempo. A TV da tua casa mostra o canal que escolheres aqui.</p>`;
};
let lvTvRaf = 0;
function lvTvBoot() {
  if (lvTvRaf) return;
  const loop = () => {
    const cv = document.getElementById('tvCv');
    if (!cv || phoneApp !== 'tv') { lvTvRaf = 0; return; }
    try { lvDrawTV(cv.getContext('2d'), cv.width, cv.height, LIVE.tvCh, performance.now() / 1000); } catch (e) { console.error(e); lvTvRaf = 0; return; }
    lvTvRaf = requestAnimationFrame(loop);
  };
  lvTvRaf = requestAnimationFrame(loop);
}
(function () {
  const _r = renderPhone;
  renderPhone = function () { const r = _r.apply(this, arguments); try { if (phoneApp === 'tv') lvTvBoot(); } catch (e) { } return r; };
  // atualizar contadores/placar no ecrã da TV a cada 5 s
  setInterval(() => { try { if ((phoneApp === 'tv' || (phoneApp === 'musica' && LIVE.radTab === 'live')) && !lvBusyUI()) renderPhone(true); } catch (e) { } }, 5000);
})();

/* ---------------- TVs das casas (textura ao vivo) ---------------- */
(function () {
  if (typeof ivTVtex !== 'function') return;
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 180;
  LIVE.texCv = cv; LIVE.tex = new T.CanvasTexture(cv); LIVE.tex.encoding = T.sRGBEncoding;
  lvDrawTV(cv.getContext('2d'), 320, 180, LIVE.tvCh, 0);
  ivTVtex = function () { return LIVE.tex; };
  setInterval(() => {
    try {
      if (!G || typeof inInt === 'undefined' || !inInt || mode !== 'game') return;
      lvDrawTV(cv.getContext('2d'), 320, 180, LIVE.tvCh, performance.now() / 1000); LIVE.tex.needsUpdate = true;
    } catch (e) { }
  }, 150);
})();
