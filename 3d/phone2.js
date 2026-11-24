/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Telemóvel 2.0
   Barra de estado real, apps novas (DarkCell, Calculadora, Relógio,
   Notas, Lanterna) e apps antigas com muito mais conteúdo.
   ========================================================= */
const P2 = {
  bankTab: 'card', newsTab: 0, newsOpen: null, kuiaIdx: 0, kuiaLiked: {}, kuiaCom: false, rideCls: 'eco', lastRide: null,
  calc: { v: '0', acc: null, op: null, fresh: true }, game: null, camF: 0, foto: null, clockTab: 'mundo',
  sw: { on: false, t0: 0, acc: 0, laps: [] }, typing: null, track: null, torch: false, torchL: null, saudeAgua: 0,
};
const P2_FILTROS = [['Normal', 'none'], ['P&B', 'grayscale(1) contrast(1.1)'], ['Sépia', 'sepia(.85) contrast(1.05)'], ['Vívido', 'saturate(1.7) contrast(1.1)'], ['Noite', 'brightness(.75) hue-rotate(190deg) saturate(1.3)'], ['Kianda', 'hue-rotate(-25deg) saturate(1.4) brightness(1.08)']];
const p2Rnd = (s, n) => phHash(s) % n;
const p2N1 = s => String(s || '').split(' ')[0];
const p2mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const p2Tabs = (cur, tabs, fn) => `<div class="ptabs">${tabs.map(([k, l]) => `<button class="${cur === k ? 'on' : ''}" onclick="${fn}('${k}')">${l}</button>`).join('')}</div>`;

/* ---------------- BARRA DE ESTADO ---------------- */
function p2Sig() {
  if (G.preso > 0) return 1;
  const n = nivelCidade(cid()); let b = n === 'rica' ? 4 : n === 'media' ? 3 : 2;
  if (G.pacoteAno === G.ano) b = Math.min(4, b + 1);
  return b;
}
function p2Net(b) { const hi = G.tel >= 3; return b >= 4 ? (hi ? '5G' : '4G') : b === 3 ? '4G' : (hi ? '4G' : '3G'); }
const p2SigSVG = b => `<svg class="sig" viewBox="0 0 19 12" aria-hidden="true">${[0, 1, 2, 3].map(i => `<rect x="${i * 4.9}" y="${9 - i * 2.9}" width="3.3" height="${3 + i * 2.9}" rx="1" ${i < b ? '' : 'class="off"'}/>`).join('')}</svg>`;
const p2WifiSVG = () => `<svg class="wifi" viewBox="0 0 16 12" aria-hidden="true"><path d="M1 4.2a10 10 0 0 1 14 0M3.4 6.7a6.6 6.6 0 0 1 9.2 0M5.8 9.1a3.2 3.2 0 0 1 4.4 0"/><circle cx="8" cy="11" r="1.1"/></svg>`;
function p2Bat() {
  const carga = (typeof inInt !== 'undefined' && inInt && inInt.loc === 'casa') || nearLoc === 'casa';
  const v = Math.max(6, Math.min(100, Math.round(100 - ((dayT + .7) % 1) * 78 - phHash(G.ano + 'b') % 9)));
  return { v, carga };
}
function p2BatSVG(b) {
  const w = Math.max(1.5, 17 * b.v / 100), col = b.carga ? '#34c759' : b.v <= 20 ? '#ff3b30' : '#fff';
  return `<svg class="batsvg" viewBox="0 0 27 13" aria-hidden="true"><rect x=".7" y=".7" width="22" height="11.6" rx="3.4" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.3"/><rect x="2.6" y="2.6" width="${w.toFixed(1)}" height="7.8" rx="1.8" fill="${col}"/><path d="M24.6 4.4v4.2c.9-.3 1.5-1.1 1.5-2.1s-.6-1.8-1.5-2.1z" fill="currentColor" fill-opacity=".45"/>${b.carga ? '<path d="M12.6 2.2 9 7h2.6l-.8 3.8L14.4 6h-2.6z" fill="#fff" stroke="#000" stroke-width=".5"/>' : ''}</svg>`;
}
function p2BatIn(b) {
  const col = b.carga ? '#34c759' : b.v <= 20 ? '#ff3b30' : 'rgba(255,255,255,.95)', w = Math.max(2, 21 * b.v / 100);
  return `<svg class="batin" viewBox="0 0 29 14" aria-hidden="true"><rect x=".6" y=".6" width="25" height="12.8" rx="4" fill="rgba(255,255,255,.32)"/><rect x="2" y="2" width="${w.toFixed(1)}" height="10" rx="2.6" fill="${col}"/><path d="M27 4.8v4.4c.9-.3 1.4-1.2 1.4-2.2s-.5-1.9-1.4-2.2z" fill="rgba(255,255,255,.4)"/><text x="13" y="10.4" text-anchor="middle" font-size="9.4" font-weight="800" fill="${b.carga || b.v > 45 ? '#000' : '#fff'}" font-family="system-ui,sans-serif">${b.v}</text></svg>`;
}
function p2Bar() {
  if (!phoneApp || !G) return;
  const bar = $('#phBar'); if (!bar) return;
  const s = p2Sig(), b = p2Bat();
  if (G.tel === 1) { bar.innerHTML = `<span class="nkbar">${[0, 1, 2, 3].map(i => `<i class="${i < s ? 'on' : ''}" style="height:${3 + i * 2}px"></i>`).join('')}<b>MBOTE</b></span><span>${nowTxt()}</span><span class="nkbat">${[0, 1, 2, 3].map(i => `<i class="${i < Math.ceil(b.v / 25) ? 'on' : ''}"></i>`).join('')}</span>`; return; }
  const _ = 0, wifi = G.bens.includes('starlink') && ((typeof inInt !== 'undefined' && inInt && inInt.loc === 'casa') || nearLoc === 'casa');
  bar.innerHTML = `<span class="pbt">${nowTxt()}${SND.RADIO.on && G.tel < 4 ? ' <i class="eqmini"><b></b><b></b><b></b></i>' : ''}</span><span class="pbr">${G.tel === 0 ? '<b class="net">Sem SIM</b>' : (wifi ? p2WifiSVG() : `<b class="net">${p2Net(s)}</b>`) + p2SigSVG(s)}${G.tel >= 4 ? p2BatIn(b) : p2BatSVG(b) + `<b class="bpct">${b.v}</b>`}</span>`;
  const isl = document.querySelector('.phisland');
  if (isl) { const live = SND.RADIO.on && G.tel >= 4; if (isl.classList.contains('live') !== live) { isl.classList.toggle('live', live); isl.innerHTML = live ? `<span class="iscover"></span><span class="iseq"><b></b><b></b><b></b><b></b></span>` : ''; } }
}

/* ---------------- APPS NOVAS NA LISTA ---------------- */
(function () {
  const at = APPS.findIndex(a => a.id === 'vida');
  APPS.splice(at, 0,
    { id: 'darkcell', ico: '📶', t: 'DarkCell', bg: 'linear-gradient(#ff9f1c,#b3261e)', tel: 2 },
    { id: 'calc', ico: '🧮', t: 'Calculadora', bg: 'linear-gradient(#3a3a40,#121214)', tel: 2 },
    { id: 'relogio', ico: '⏰', t: 'Relógio', bg: 'linear-gradient(#2b2b30,#000)', tel: 2 },
    { id: 'notas', ico: '📝', t: 'Notas', bg: 'linear-gradient(#ffe066,#f4b400)', tel: 2 },
    { id: 'lanterna', ico: '🔦', t: 'Lanterna', bg: 'linear-gradient(#5c6b7a,#1f2933)', tel: 2 },
  );
})();

/* ---------------- RENDER (extensões) ---------------- */
(function () {
  const _r = renderPhone;
  renderPhone = function (keep) {
    const r = _r.apply(this, arguments);
    try {
      p2Bar();
      const b = $('#phBody');
      if (phoneApp === 'mensagens' && chatKey && b) b.scrollTop = b.scrollHeight;
      if (phoneApp === 'musica') p2VizStart();
      if (phoneApp === 'kuia') p2KuiaSwipe();
      const ph = $('#ph'); if (ph) ph.classList.toggle('torch', phoneApp === 'lanterna' && P2.torch);
    } catch (e) { console.error(e); }
    return r;
  };
  const _o = phoneOpen;
  phoneOpen = function (id) {
    const r = _o.apply(this, arguments);
    if (phoneApp === id && G.tel >= 2) { G.dadosMB = (G.dadosMB || 0) + 4 + phHash(id + Date.now()) % 40; }
    return r;
  };
  setInterval(() => { try { if (phoneApp && G) { p2Bar(); p2Live(); } } catch (e) { } }, 1000);
  setInterval(() => { try { if (phoneApp && G) p2LiveFast(); } catch (e) { } }, 200);
})();
function p2Live() {
  if (phoneApp === 'tupuca' && P2.track) { const el = document.getElementById('txTrack'); if (el) el.outerHTML = p2TrackHTML(); }
  if (phoneApp === 'relogio' && P2.clockTab === 'mundo') { const el = document.getElementById('clkW'); if (el) el.innerHTML = p2ClocksHTML(); }
  if (phoneApp === 'saude') { const el = document.getElementById('hrV'); if (el) el.textContent = 64 + Math.round(Math.sin(Date.now() / 1700) * 4 + Math.random() * 3) + (100 - G.stats.saude) / 6 | 0; }
}
function p2LiveFast() {
  if (phoneApp === 'musica') { const p = SND.RADIO.pos(), d = SND.RADIO.dur() || 1; const a = document.getElementById('fmProg'), t = document.getElementById('fmTime'); if (a) a.style.width = (p / d * 100).toFixed(1) + '%'; if (t) t.textContent = `${p2mmss(p)} / ${p2mmss(d)}`; }
  if (phoneApp === 'relogio' && P2.clockTab === 'crono') { const el = document.getElementById('swT'); if (el) el.textContent = p2SwTxt(); }
  if (phoneApp === 'jogos' && P2.game && P2.game.k === 'kumbu') p2KumbuTick();
}

/* ---------------- ECRÃ BLOQUEADO / INÍCIO: widget de música ---------------- */
function p2NowWidget(big) {
  if (!SND.RADIO.on) return '';
  const T = SND.RADIO.TRACKS[SND.RADIO.idx];
  return `<div class="nowmini ${big ? 'big' : ''}"><div class="nmc g-${T.g}">🎵</div><div class="nmt"><b>${T.t}</b><span>${T.a} · Kizomba FM</span></div><button onclick="event.stopPropagation();SND.RADIO.toggle();renderPhone(true)">⏸</button><button onclick="event.stopPropagation();SND.RADIO.next();renderPhone(true)">⏭</button></div>`;
}
(function () {
  const _lock = PHONE_VIEWS.lock;
  PHONE_VIEWS.lock = () => _lock().replace('<button class="unlock"', p2NowWidget(true) + '<button class="unlock"');
  const _home = PHONE_VIEWS.home;
  PHONE_VIEWS.home = () => { const h = _home(); const i = h.indexOf('<div class="phhome">'); return i < 0 ? h : h.slice(0, i) + p2NowWidget() + h.slice(i); };
})();

/* =========================================================
   FALA JÁ — conversa a sério (escrever, notas de voz, stickers)
   ========================================================= */
const P2_STICK = ['😂', '❤️', '🔥', '👍', '🎉', '🙏', '😎', '😢'];
function p2Kind(k) { return k === 'mae' || k === 'pai' ? 'pais' : k === 'par' ? 'par' : k[0] === 'i' ? 'irmao' : k[0] === 'a' ? 'amigo' : k; }
function p2Reply(k, txt) {
  const t = (txt || '').toLowerCase(), kind = p2Kind(k), me = p2N1(G.nome);
  const has = re => re.test(t);
  if (kind === 'chefe') return pick(['Ok. Amanhã às 8h no escritório.', 'Recebido. Foca-te nos resultados.', 'Fala comigo depois da reunião.', has(/aumento|salario|salário/) ? 'Aumento só com resultados. Vamos ver no fim do ano.' : 'Certo, obrigado pela mensagem.']);
  if (kind === 'unitel' || kind === 'darkcell') return pick(['DarkCell: a tua mensagem foi recebida. Ativa a Semana Bwé na app DarkCell!', 'Obrigado por escolheres a DarkCell. Mais rede, mais Angola! 📶']);
  if (kind === 'marca') return pick(['Ótimo! A nossa equipa vai enviar a proposta. 🤝', 'Adoramos o teu conteúdo! Continua a publicar.']);
  if (has(/\b(ol[aá]|oi|bom dia|boa tarde|boa noite|mbote|tudo bem|como est[aá]s|wi)\b/)) return kind === 'pais' ? pick([`Olá ${me}! Estou bem, graças a Deus. E tu, já comeste? 🍲`, 'Oi filho(a)! Por aqui tudo bem. Tens saudades da comida da mãe? 😄']) : kind === 'par' ? pick(['Oi amor 🥰 Estava agora a pensar em ti!', 'Olá meu bem ❤️ Como foi o teu dia?']) : pick(['Mbote mano! Tudo fixe, e contigo? 😎', 'Ei! Bwé de tempo, tudo bem?', 'Oi! Tudo tranquilo por aqui.']) /* mbote=gíria */;
  if (has(/dinheiro|kumbu|kz|emprest|ajud|transfer/)) {
    if (kind === 'pais') { const p = personByKey(k); G.msgAno = G.msgAno || {}; if (p && p.rel > 60 && !G.msgAno['kz_' + k] && G.dinheiro < 500000) { G.msgAno['kz_' + k] = 1; G.dinheiro += 10000; setTimeout(() => { toast('💸 ' + p2N1(p.nome) + ' transferiu-te 10 mil Kz pelo Palanca Pay.'); save(); refresh(); }, 300); return 'Mandei-te 10 mil pelo Palanca Pay. Não gastes em farra! 😅'; } return 'Filho(a), a situação não está fácil… mas reza e trabalha que Deus abre portas 🙏'; }
    return pick(['Epá, estou mal de kumbu também 😅', 'Só no fim do mês, mano.', 'Quanto? Hmm… deixa ver 🤔']);
  }
  if (has(/amo|adoro|saudade|❤|gosto de ti|beijo/)) return kind === 'par' ? pick(['Também te amo muito 🥰', 'Saudades tuas também… vem cá hoje? 💕']) : kind === 'pais' ? 'A mãe/o pai também te ama muito ❤️ Cuida-te!' : pick(['Haha, também gosto de ti, kamba 😂❤️', 'És família! 🙌']);
  if (has(/farra|festa|bora|discoteca|sair|praia|kizomba/)) return kind === 'pais' ? 'Farra outra vez?! Juízo, hein. Volta cedo.' : pick(['Bora! Sábado na Discoteca Kizomba 🎶', 'Bora à praia da Ilha no domingo? 🏖️', 'Conta comigo! Quem paga a gasosa? 😂']);
  if (has(/fome|comer|comida|jantar|almo[cç]o|muamba|funje/)) return pick(['Hoje há muamba de galinha em casa! 🍲', 'Pede pela Txova, chega em 30 min 🛵', 'Bora comer funje na Tia Maria?']);
  if (has(/escola|estud|exame|universidade|faculdade|curso/)) return kind === 'pais' ? 'Estuda muito! A educação é a única herança que ninguém te tira 📚' : pick(['Epá, os exames estão a matar 😩', 'Força! Tu consegues 💪']);
  if (has(/trabalho|emprego|chefe|vaga/)) return pick(['Vi uma vaga no Centro de Emprego, vai lá ver!', 'Trabalho é trabalho, mas não te mates 😅', 'O meu chefe também é complicado 🙄']);
  if (has(/futebol|jogo|le[õo]es|[áa]guias|liga/)) return pick(['Os Leões da Ilha vão ganhar a Liga Mwangolé este ano! ⚽', 'Viste o golo de ontem?! Bwé de bom!']);
  if (t.includes('?')) return pick(['Boa pergunta 🤔 Depois te digo.', 'Hmm… acho que sim!', 'Não sei, mano 😂', 'Claro que sim!']);
  return kind === 'pais' ? pick(['Ok filho(a). Cuida-te ❤️', 'Deus te abençoe 🙏', 'Liga-me quando puderes.']) : kind === 'par' ? pick(['Hehe 😘', 'Tu és demais 🥰', 'Ok amor ❤️']) : pick(['Kkkk 😂', 'Fixe!', 'Verdade, mano.', 'Ya ya 👍', 'Bwé de bom!']);
}
function p2Chat(k) { G.chats = G.chats || {}; return (G.chats[k] = G.chats[k] || []); }
function p2Push(k, m) { const c = p2Chat(k); m.ano = G.ano; c.push(m); if (c.length > 40) c.splice(0, c.length - 40); }
function p2Bond(k) {
  const p = personByKey(k); if (!p) return;
  G.msgAno = G.msgAno || {};
  if (!G.msgAno[k]) { G.msgAno[k] = 1; p.rel = clamp(p.rel + R(2, 5)); fx({ felicidade: 1 }); setTimeout(() => toast(`💬 ${p2N1(p.nome)} gostou da conversa. Relação +`), 2600); }
}
function p2AfterSend(k, txt) {
  save(); renderPhone(true);
  P2.typing = k; const delay = 900 + Math.random() * 1600;
  setTimeout(() => { if (phoneApp === 'mensagens' && chatKey === k) renderPhone(true); }, 350);
  setTimeout(() => {
    P2.typing = null;
    const voice = chance(.15) && personByKey(k);
    p2Push(k, voice ? { o: 0, voice: 2 + R(1, 6) } : { o: 0, txt: p2Reply(k, txt) });
    p2Bond(k); save();
    SND.play('recv');
    if (phoneApp === 'mensagens' && chatKey === k) renderPhone(true);
  }, delay + 600);
}
function p2SendTxt(ev, k) {
  ev.preventDefault();
  const i = document.getElementById('chIn'); const txt = (i && i.value || '').trim(); if (!txt) return false;
  p2Push(k, { o: 1, txt: txt.slice(0, 300) }); SND.play('send'); p2AfterSend(k, txt); return false;
}
function p2SendSticker(k, s) { p2Push(k, { o: 1, st: s }); SND.play('send'); p2AfterSend(k, s); }
function p2SendVoice(k) { const s = 2 + R(1, 8); p2Push(k, { o: 1, voice: s }); SND.play('voice', Math.min(2, s / 3)); p2AfterSend(k, 'voz'); }
function p2PlayVoice(s) { SND.play('voice', Math.min(2.6, s / 2.5)); }
const p2Wave = n => `<span class="wave">${Array.from({ length: 22 }, (_, i) => `<i style="height:${4 + (phHash(n + '' + i) % 14)}px"></i>`).join('')}</span>`;
function p2Bub(m, i) {
  const cls = m.o ? 'out' : 'in', tick = m.o ? '<small>✓✓</small>' : `<small>${m.ano || ''}</small>`;
  if (m.st) return `<div class="bub ${cls} stk">${m.st}</div>`;
  if (m.voice) return `<div class="bub ${cls} vn"><button onclick="p2PlayVoice(${m.voice})">▶</button>${p2Wave(i + m.voice)}<em>0:${String(m.voice).padStart(2, '0')}</em>${tick}</div>`;
  return `<div class="bub ${cls}">${esc(m.txt)}${tick}</div>`;
}
chatView = function (k) {
  if (k && k[0] === 'p' && typeof smsThread === 'function') return smsThread(k.slice(1));
  const p = personByKey(k);
  const nome = p ? p.nome : { chefe: 'Chefe', unitel: 'DarkCell', darkcell: 'DarkCell', marca: 'Marca parceira' }[k] || k;
  const ms = (G.inbox || []).filter(m => m.key === k).slice().reverse();
  ms.forEach(m => m.lida = true); setTimeout(updateBadge, 0);
  G.msgAno = G.msgAno || {};
  let quick = '';
  if (k === 'marca') quick = G.seg > 5000 && !G.msgAno.marca ? `<button class="pbtn" onclick="acceptBrand()">🤝 Aceitar parceria (+${kzShort(Math.round(G.seg * 6))})</button>` : '';
  else if (k === 'chefe' && G.emprego && !G.msgAno.chefe) quick = `<button class="pbtn" onclick="G.msgAno.chefe=1;G.emprego.desemp=clamp(G.emprego.desemp+3);toast('👍 O chefe gostou da tua prontidão.');save();renderPhone(true)">👍 Ok chefe, conte comigo!</button>`;
  else if ((k === 'unitel' || k === 'darkcell') && G.pacoteAno !== G.ano) quick = `<button class="pbtn" onclick="phoneOpen('darkcell')">📶 Abrir a app DarkCell</button>`;
  const online = p ? (P2.typing === k ? '<span class="typing">a escrever…</span>' : (phHash(k + G.ano) % 3 ? 'online' : 'visto por último hoje')) : 'conta verificada ✔';
  const conv = p2Chat(k);
  return `<div class="aphead chat"><button onclick="phoneBack()">‹</button><div class="cav sm">${p ? (k === 'par' ? '💕' : (p.g === 'F' || k === 'mae' ? '👩🏿' : '🧑🏿')) : '🏢'}</div><div style="flex:1;min-width:0"><h3>${esc(nome)}</h3><div class="apsub">${online}</div></div>${p ? `<button class="chcall" onclick="callPerson('${k}')" aria-label="Ligar">📞</button>` : ''}</div>
    <div class="chatbg"><div class="chday">Mensagens encriptadas · Fala Já</div>${ms.map(m => `<div class="bub in">${esc(m.txt)}<small>${m.ano}</small></div>`).join('')}${conv.map(p2Bub).join('')}${P2.typing === k ? '<div class="bub in tdots"><i></i><i></i><i></i></div>' : ''}${!ms.length && !conv.length ? '<div class="apnote" style="text-align:center">Diz olá! 👋</div>' : ''}</div>${quick}
    ${p ? `<div class="stkrow">${P2_STICK.map(s => `<button onclick="p2SendSticker('${k}','${s}')">${s}</button>`).join('')}</div>
    <form class="chin" onsubmit="return p2SendTxt(event,'${k}')"><input id="chIn" data-noic autocomplete="off" maxlength="300" placeholder="Escreve uma mensagem"><button type="button" class="mic" onclick="p2SendVoice('${k}')" aria-label="Nota de voz">🎙️</button><button type="submit" class="snd" aria-label="Enviar">➡️</button></form>
    <p class="apnote">A primeira conversa do ano com cada pessoa fortalece a relação. Experimenta pedir ajuda, convidar para a farra ou dizer que tens saudades.</p>` : ''}`;
};

/* =========================================================
   BANCO MÓVEL — cartão, extrato, transferências e contas
   ========================================================= */
const P2_CONTAS = [
  { id: 'luz', ico: '⚡', t: 'Kianda Energia', d: 'Luz da casa · sem cortes este ano', p: 18000, ef: { felicidade: 2 } },
  { id: 'agua', ico: '💧', t: 'Água Viva', d: 'Água canalizada', p: 7000, ef: { saude: 1 } },
  { id: 'tv', ico: '📺', t: 'Kalemba TV Premium', d: 'Novelas, Liga Mwangolé e filmes', p: 12000, ef: { felicidade: 2 } },
  { id: 'net', ico: '📡', t: 'Céu Net Casa', d: 'Internet em casa · +estudo online', p: 25000, ef: { inteligencia: 1 } },
];
function p2BankTab(t) { P2.bankTab = t; renderPhone(); }
function p2Transfer(k, v) {
  const p = personByKey(k); if (!p) return;
  if (G.idade < 14) return toast('🧒 Precisas de conta bancária (14+).');
  if (!pay(v)) return;
  G.trfAno = G.trfAno || {}; const first = G.trfAno[k] !== G.ano; G.trfAno[k] = G.ano;
  if (first) { p.rel = clamp(p.rel + (v >= 100000 ? 10 : v >= 20000 ? 5 : 2)); fx({ karma: v >= 100000 ? 4 : 2 }); }
  p2Push(k, { o: 1, txt: `💸 Transferência Palanca Pay: ${kz(v)}` });
  const t = `💸 Transferiste ${kz(v)} para ${p2N1(p.nome)}. ${first ? 'Ficou muito agradecido(a)!' : ''}`;
  addLog(t); toast(t); save(); refresh(); renderPhone(true);
  setTimeout(() => { p2Push(k, { o: 0, txt: pick(['Obrigado(a)!! Deus te abençoe 🙏', 'Recebi! Muito obrigado(a) ❤️', 'Eish, salvaste-me o mês 😭🙌']) }); SND.play('recv'); save(); }, 1800);
}
function p2PayBill(id) {
  const C = P2_CONTAS.find(c => c.id === id); if (!C) return;
  G.contas = G.contas && G.contas.ano === G.ano ? G.contas : { ano: G.ano, pagas: [] };
  if (G.contas.pagas.includes(id)) return toast('✅ Esta conta já está paga este ano.');
  const p = Math.round(C.p * cid().custo * 12 / 12);
  if (!pay(p)) return;
  G.contas.pagas.push(id);
  const t = `🧾 Pagaste ${C.t} (${kzShort(p)}). ` + fx(C.ef); addLog(t); toast(strip(t)); save(); refresh(); renderPhone(true);
}
PHONE_VIEWS.banco = () => {
  const tab = P2.bankTab, e = G.emprestimo;
  let h = apHead('Banco Móvel', 'Banco Palanca · Palanca Pay', '<span class="aibadge" style="background:#1745b8">PAY</span>');
  h += p2Tabs(tab, [['card', 'Cartão'], ['ext', 'Extrato'], ['trf', 'Transferir'], ['contas', 'Contas']], 'p2BankTab');
  if (tab === 'card') {
    h += `<div class="card3d"><div class="cc1">BANCO PALANCA <span style="float:right">${G.tel >= 3 ? 'BLACK' : 'GOLD'}</span></div><div class="cc2">${kz(G.dinheiro)}</div><div class="cc3">**** **** **** ${String(phHash(G.nome) % 10000).padStart(4, '0')}</div><div class="cc4">${esc(G.nome.toUpperCase())}<span>${String(phHash(G.nome + 'm') % 12 + 1).padStart(2, '0')}/${String((G.ano + 4) % 100).padStart(2, '0')}</span></div></div>`;
    h += `<div class="bkq"><button onclick="deposit(100000);renderPhone(true)"><i>🐷</i>Poupar<br>100 mil</button><button onclick="withdraw(100000);renderPhone(true)"><i>💵</i>Levantar<br>100 mil</button><button onclick="p2BankTab('trf')"><i>💸</i>Enviar<br>dinheiro</button><button onclick="p2BankTab('contas')"><i>🧾</i>Pagar<br>contas</button></div>`;
    h += `<div class="grid2p"><div><small>Poupança (7%/ano)</small><b>${kzShort(G.poupanca)}</b></div><div><small>Empréstimo</small><b class="${e ? 'r' : ''}">${e ? kzShort(e.divida) : '—'}</b></div><div><small>Património</small><b>${kzShort(patrimonio())}</b></div><div><small>Movimentos</small><b>${(G.extrato || []).length}</b></div></div>`;
    h += `<button class="pbtn" style="background:#1c1c24" onclick="closePhone();openPanel('banco','c')">🏦 Crédito e depósitos no balcão</button>`;
  } else if (tab === 'ext') {
    const ex = G.extrato || [];
    const ent = ex.filter(x => x.v > 0).reduce((s, x) => s + x.v, 0), sai = ex.filter(x => x.v < 0).reduce((s, x) => s - x.v, 0);
    h += `<div class="grid2p"><div><small>Entradas</small><b class="g">+${kzShort(ent)}</b></div><div><small>Saídas</small><b class="r">-${kzShort(sai)}</b></div></div>`;
    let ano = null;
    h += ex.length ? `<div class="txl">${ex.map(x => { const hd = x.ano !== ano ? `<div class="txy">${x.ano} · ${x.idade} anos</div>` : ''; ano = x.ano; return hd + `<div class="tx"><i class="${x.v > 0 ? 'g' : 'r'}">${x.v > 0 ? '↙' : '↗'}</i><span>${esc(x.t)}</span><b class="${x.v > 0 ? 'g' : 'r'}">${x.v > 0 ? '+' : ''}${kzShort(x.v)}</b></div>`; }).join('')}</div>` : '<p class="apnote">Ainda não há movimentos. Cada pagamento e recebimento fica registado aqui.</p>';
  } else if (tab === 'trf') {
    const cs = contacts();
    h += cs.length ? cs.map(c => `<div class="crow"><div class="cav">${c.ico}</div><div class="cinfo"><b>${esc(c.nome)}</b><span>${c.label} · relação ${c.rel}</span></div></div><div class="chips" style="margin:-4px 0 8px 55px">${[5000, 20000, 100000].map(v => chip(kzShort(v), `p2Transfer('${c.key}',${v})`, G.dinheiro < v)).join('')}</div>`).join('') : '<p class="apnote">Ainda não tens contactos.</p>';
    h += '<p class="apnote">A primeira transferência do ano para cada pessoa aumenta a relação e o karma.</p>';
  } else {
    const pg = G.contas && G.contas.ano === G.ano ? G.contas.pagas : [];
    h += `<div class="list">${P2_CONTAS.map(C => btnItem(C.ico, C.t + (pg.includes(C.id) ? ' <span class="tag">paga</span>' : ''), C.d, kzShort(Math.round(C.p * cid().custo)), `p2PayBill('${C.id}')`, pg.includes(C.id))).join('')}</div><p class="apnote">Os preços dependem da província. Cada conta paga dá um pequeno bónus durante o ano.</p>`;
  }
  return h;
};

/* =========================================================
   MBOTE — operadora (dados, pacotes, rede)
   ========================================================= */
const P2_PAC = [
  { id: 'dia', t: 'Diário 1 GB', mb: 1024, p: 500, d: 'Válido 24 h' },
  { id: 'sem', t: 'Semanal 6 GB', mb: 6144, p: 2500, d: 'Válido 7 dias' },
  { id: 'mes', t: 'Mensal 25 GB', mb: 25600, p: 6000, d: 'Válido 30 dias' },
  { id: 'ilim', t: 'Ilimitado 5G · ano inteiro', mb: 0, p: 9900, d: 'Mais rede e velocidade máxima' },
];
function p2Pac(id) {
  const P = P2_PAC.find(x => x.id === id); if (!P) return;
  if (id === 'ilim' && G.pacoteAno === G.ano) return toast('📶 Já tens o Ilimitado este ano.');
  if (!pay(P.p)) return;
  if (id === 'ilim') { G.pacoteAno = G.ano; fx({ felicidade: 1 }); } else G.dadosCap = (G.dadosCap || 2048) + P.mb;
  toast(`📶 Pacote ${P.t} ativado!`); SND.play('good'); save(); refresh(); renderPhone(true);
}
PHONE_VIEWS.darkcell = () => {
  const ilim = G.pacoteAno === G.ano, cap = G.dadosCap || 2048, used = Math.min(cap, G.dadosMB || 0), s = p2Sig();
  const pct = ilim ? 100 : Math.max(0, 100 - used / cap * 100);
  const nv = nivelCidade(cid());
  return apHead('DarkCell', 'DarkCell · a tua rede', `<span class="aibadge" style="background:#b3261e">${p2Net(s)}</span>`)
    + `<div class="mbring" style="--p:${pct}"><div><b>${ilim ? '∞' : ((cap - used) / 1024).toFixed(1) + ' GB'}</b><small>${ilim ? 'Ilimitado 5G' : 'dados restantes'}</small></div></div>`
    + `<div class="grid2p"><div><small>Rede em ${esc(G.cidade.mun)}</small><b>${p2SigSVG(s)} ${['', 'Fraca', 'Razoável', 'Boa', 'Excelente'][s]}</b></div><div><small>Usados este ano</small><b>${((G.dadosMB || 0) / 1024).toFixed(2)} GB</b></div></div>`
    + `<div class="apnote" style="text-align:center">📞 O teu número DarkCell: <b>${typeof fmtTel === 'function' ? fmtTel(G.telNum || '—') : (G.telNum || '—')}</b> · partilha com outros jogadores para receberes SMS!</div>`
    + (nv === 'pobre' && !ilim ? '<div class="apwarn">📶 A rede é fraca nas províncias pobres. O Ilimitado 5G melhora o sinal.</div>' : '')
    + (!ilim && used >= cap ? '<div class="apwarn">⚠️ Ficaste sem dados! Compra um pacote.</div>' : '')
    + `<div class="apsec">Pacotes</div><div class="list">${P2_PAC.map(P => btnItem(P.id === 'ilim' ? '🚀' : '📶', P.t + (P.id === 'ilim' && ilim ? ' <span class="tag">ativo</span>' : ''), P.d, P.p.toLocaleString('pt-PT') + ' Kz', `p2Pac('${P.id}')`, P.id === 'ilim' && ilim)).join('')}</div>`
    + `<div class="apsec">DarkCell Money</div><div class="list">${G.mae.vivo ? btnItem('💸', 'Enviar dinheiro à mãe', 'Transferência por telemóvel', '', "helpParent('mae')") : ''}${G.pai.vivo ? btnItem('💸', 'Enviar dinheiro ao pai', 'Transferência por telemóvel', '', "helpParent('pai')") : ''}${btnItem('📞', 'Liga-me grátis', 'Manda um "liga-me" a um amigo', 'Grátis', "toast('📲 Mandaste um liga-me. Agora espera sentado(a) 😂')")}</div>`;
};

/* =========================================================
   CALCULADORA
   ========================================================= */
function p2Calc(k) {
  const C = P2.calc, num = () => parseFloat(C.v.replace(',', '.')) || 0;
  const fmt = x => { if (!isFinite(x)) return 'Erro'; const s = String(+x.toPrecision(12)); return s.replace('.', ','); };
  const op = (a, b, o) => o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : o === '÷' ? a / b : b;
  if (/^[0-9]$/.test(k)) { C.v = C.fresh || C.v === '0' ? k : (C.v.length < 12 ? C.v + k : C.v); C.fresh = false; }
  else if (k === ',') { if (C.fresh) { C.v = '0,'; C.fresh = false; } else if (!C.v.includes(',')) C.v += ','; }
  else if (k === 'C') { P2.calc = { v: '0', acc: null, op: null, fresh: true }; }
  else if (k === '±') C.v = fmt(-num());
  else if (k === '%') C.v = fmt(num() / 100);
  else if ('+−×÷'.includes(k)) { if (C.op && !C.fresh) C.v = fmt(op(C.acc, num(), C.op)); C.acc = num(); C.op = k; C.fresh = true; }
  else if (k === '=') { if (C.op) { C.v = fmt(op(C.acc, num(), C.op)); C.op = null; C.acc = null; C.fresh = true; } }
  else if (k === 'kz') { C.v = fmt(Math.max(0, G.dinheiro)); C.fresh = true; }
  renderPhone(true);
}
PHONE_VIEWS.calc = () => {
  const C = P2.calc, K = [['C', 'fn'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'], ['7'], ['8'], ['9'], ['×', 'op'], ['4'], ['5'], ['6'], ['−', 'op'], ['1'], ['2'], ['3'], ['+', 'op'], ['kz', 'fn'], ['0'], [','], ['=', 'op']];
  const v = C.v.length > 9 ? C.v.slice(0, 12) : C.v;
  return apHead('Calculadora', C.op ? `${String(C.acc).replace('.', ',')} ${C.op}` : '') + `<div class="cdisp" style="font-size:${C.v.length > 8 ? 34 : 52}px">${v}</div><div class="cgrid">${K.map(([k, c]) => `<button class="ckey ${c || ''} ${C.op === k && C.fresh ? 'sel' : ''}" onclick="p2Calc('${k}')">${k === 'kz' ? 'Kz' : k}</button>`).join('')}</div><p class="apnote">Kz = o teu saldo atual.</p>`;
};

/* =========================================================
   RELÓGIO — mundo e cronómetro
   ========================================================= */
const P2_CID = [['Luanda', 0], ['Lisboa', -1], ['São Paulo', -4], ['Joanesburgo', 1], ['Dubai', 3], ['Pequim', 7], ['Nova Iorque', -6]];
function p2Hour() { const hr = ((dayT * 24) + 6) % 24; return hr; }
function p2ClocksHTML() {
  const h = p2Hour(), mi = Math.floor((dayT * 24 * 60) % 60), ha = (h % 12) * 30 + mi * .5, ma = mi * 6;
  return `<svg class="aclock" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47"/>${Array.from({ length: 12 }, (_, i) => `<line x1="50" y1="7" x2="50" y2="${i % 3 ? 11 : 14}" transform="rotate(${i * 30} 50 50)"/>`).join('')}<line class="hh" x1="50" y1="50" x2="50" y2="27" transform="rotate(${ha} 50 50)"/><line class="mh" x1="50" y1="50" x2="50" y2="15" transform="rotate(${ma} 50 50)"/><circle cx="50" cy="50" r="2.6" fill="#ff9f0a"/></svg>`
    + `<div class="clist">${P2_CID.map(([n, o]) => { const hh = Math.floor((h + o + 24) % 24); return `<div class="crow"><div class="cinfo"><b>${n}</b><span>${o === 0 ? 'Hora local' : (o > 0 ? '+' : '') + o + ' h'} · ${hh >= 6 && hh < 19 ? 'dia' : 'noite'}</span></div><b class="wclk">${String(hh).padStart(2, '0')}:${String(mi).padStart(2, '0')}</b></div>`; }).join('')}</div>`;
}
function p2SwMs() { const S = P2.sw; return S.acc + (S.on ? performance.now() - S.t0 : 0); }
function p2SwTxt() { const ms = p2SwMs(); return `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(Math.floor(ms / 10) % 100).padStart(2, '0')}`; }
function p2Sw(a) {
  const S = P2.sw;
  if (a === 'go') { if (S.on) { S.acc += performance.now() - S.t0; S.on = false; } else { S.t0 = performance.now(); S.on = true; } }
  else if (a === 'lap') { if (S.on) S.laps.unshift(p2SwTxt()); else { S.acc = 0; S.laps = []; } }
  renderPhone(true);
}
function p2ClockTab(t) { P2.clockTab = t; renderPhone(); }
PHONE_VIEWS.relogio = () => apHead('Relógio') + p2Tabs(P2.clockTab, [['mundo', 'Mundo'], ['crono', 'Cronómetro']], 'p2ClockTab')
  + (P2.clockTab === 'mundo' ? `<div id="clkW">${p2ClocksHTML()}</div>`
    : `<div class="swt" id="swT">${p2SwTxt()}</div><div class="swb"><button class="sw2" onclick="p2Sw('lap')">${P2.sw.on ? 'Volta' : 'Repor'}</button><button class="sw1 ${P2.sw.on ? 'stop' : ''}" onclick="p2Sw('go')">${P2.sw.on ? 'Parar' : 'Iniciar'}</button></div><div class="clist">${P2.sw.laps.map((l, i) => `<div class="crow"><div class="cinfo"><b>Volta ${P2.sw.laps.length - i}</b></div><b class="wclk">${l}</b></div>`).join('')}</div>`);

/* =========================================================
   NOTAS
   ========================================================= */
let p2NotaT = 0;
function p2Nota(v) { G.notas = v.slice(0, 2000); clearTimeout(p2NotaT); p2NotaT = setTimeout(save, 600); const c = document.getElementById('ntC'); if (c) c.textContent = `${G.notas.length}/2000`; }
PHONE_VIEWS.notas = () => {
  const ideias = aiTips().slice(0, 3).map(t => strip(t));
  return apHead('Notas', 'Guardadas na tua vida') + `<textarea class="nota" data-noic placeholder="Escreve aqui os teus planos, sonhos e listas…" oninput="p2Nota(this.value)">${esc(G.notas || '')}</textarea><div class="apnote" id="ntC" style="text-align:right">${(G.notas || '').length}/2000</div>`
    + `<div class="apsec">Ideias para a tua lista</div>${ideias.map(t => `<button class="crow" onclick="const a=document.querySelector('.nota');a.value=(a.value?a.value+'\\n':'')+'☐ '+${JSON.stringify(t.slice(0, 120)).replace(/"/g, '&quot;')};p2Nota(a.value)"><div class="cinfo"><span style="font-size:12.5px;color:#ddd">${esc(t.slice(0, 120))}</span></div><b style="color:#f4b400">＋</b></button>`).join('')}`;
};

/* =========================================================
   LANTERNA — acende uma luz a sério no mundo 3D
   ========================================================= */
function p2Torch() {
  P2.torch = !P2.torch; SND.play('light');
  try {
    if (!P2.torchL && typeof T !== 'undefined' && player) { P2.torchL = new T.PointLight(0xfff1d6, 0, 16, 1.4); P2.torchL.position.set(0, 1.5, .9); player.g.add(P2.torchL); }
    if (P2.torchL) { if (P2.torchL.parent !== player.g) player.g.add(P2.torchL); P2.torchL.intensity = P2.torch ? 2.6 : 0; }
  } catch (e) { }
  renderPhone(true);
}
PHONE_VIEWS.lanterna = () => apHead('Lanterna') + `<div class="torchw"><button class="torchb ${P2.torch ? 'on' : ''}" onclick="p2Torch()" aria-label="Lanterna"><svg viewBox="0 0 24 24"><path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z M6 6h12 M12 12v.01"/></svg></button><b>${P2.torch ? 'Ligada' : 'Desligada'}</b><span>${P2.torch ? 'A tua personagem está a iluminar a rua. Fecha o telemóvel para veres.' : 'Toca para ligar. À noite ilumina mesmo o caminho!'}</span></div>`;

/* =========================================================
   KANDONGA — tipos de viagem, motorista e avaliação
   ========================================================= */
const P2_RIDE = [
  { id: 'moto', t: 'Kupapata', ico: '🏍', m: .6, d: 'Moto · rápido e barato', eta: 2 },
  { id: 'eco', t: 'Económico', ico: '🚕', m: 1, d: 'Carro partilhado', eta: 4 },
  { id: 'conf', t: 'Conforto', ico: '🚗', m: 1.7, d: 'Ar condicionado · +felicidade', eta: 5 },
  { id: 'xl', t: 'Kandonga XL', ico: '🚐', m: 2.2, d: 'Até 6 pessoas', eta: 7 },
];
const P2_CARROS = ['Kianda K3 branco', 'Mbaxi Sedan cinzento', 'Kalemba Hatch azul', 'Palanca SUV preto', 'Toyo Kanda vermelho'];
const P2_MOT = ['Mano Zeca', 'Tio Ngola', 'Dona Rosa', 'Kiko Bwé', 'Mestre Txitxi', 'Mana Lurdes', 'Djalma'];
function p2RideCls(c) { P2.rideCls = c; renderPhone(true); }
function p2Ride(id) {
  const L = LOC_POS[id], C = P2_RIDE.find(x => x.id === P2.rideCls) || P2_RIDE[1];
  const d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z);
  if (d < 6) return toast('Já estás aí! 😄');
  if (C.id === 'moto' && G.idade < 16) return toast('🧒 Kupapata só a partir dos 16 anos.');
  const cost = Math.round(rideCost(d) * C.m / 100) * 100; if (!pay(cost)) return;
  const mot = pick(P2_MOT), car = C.id === 'moto' ? 'Moto Kwanza 125' : C.id === 'xl' ? 'Kandonga Van azul e branca' : pick(P2_CARROS), mat = `LD-${R(10, 99)}-${R(10, 99)}-${String.fromCharCode(65 + R(0, 25))}${String.fromCharCode(65 + R(0, 25))}`;
  closePhone(); SND.play('car');
  const f = $('#fade'); f.innerHTML = `<div><small>${C.ico} ${mot} · ${car} · ${mat} · ⭐ 4,${R(6, 9)}</small><b style="font-size:38px">${L.n}</b><span>${C.t} · ${kzShort(cost)} · ${C.eta + Math.round(d / 20)} min</span></div>`; f.classList.add('on');
  setTimeout(() => {
    const y = playerYaw; spawnPlayer(id); playerYaw = y; f.classList.remove('on');
    G.rideAno = G.rideAno || {};
    if ((C.id === 'conf' || C.id === 'xl') && G.rideAno.conf !== G.ano) { G.rideAno.conf = G.ano; fx({ felicidade: 1 }); }
    P2.lastRide = { mot, car, cost };
    toast(`${C.ico} Chegaste a ${L.n}. Avalia ${mot} na app Kandonga!`); save(); refresh();
  }, 1300);
}
function p2Rate(n) {
  const r = P2.lastRide; if (!r) return;
  P2.lastRide = null;
  if (n === 5 && G.dinheiro >= 500) { G.dinheiro -= 500; fx({ karma: 1 }); toast(`⭐ Deste 5 estrelas e 500 Kz de gorjeta a ${r.mot}. Ficou feliz!`); }
  else toast(`⭐ Avaliaste ${r.mot} com ${n} estrela${n > 1 ? 's' : ''}.`);
  save(); refresh(); renderPhone(true);
}
PHONE_VIEWS.yango = () => {
  if (G.idade < 12) return apHead('Kandonga') + '<div class="apwarn">🧒 Menores de 12 anos não podem andar sozinhos de Kandonga.</div>';
  const C = P2_RIDE.find(x => x.id === P2.rideCls) || P2_RIDE[1];
  const dests = Object.entries(LOC_POS).filter(([id]) => !['cela', 'cadeia'].includes(id));
  const sx = x => 50 + x / 3.6, sz = z => 50 + z / 3.2;
  let h = apHead('Kandonga', 'Para onde vamos?');
  if (P2.lastRide) h += `<div class="rate"><b>Como foi a viagem com ${P2.lastRide.mot}?</b><span>${P2.lastRide.car}</span><div>${[1, 2, 3, 4, 5].map(n => `<button onclick="p2Rate(${n})">★</button>`).join('')}</div><small>5 estrelas = 500 Kz de gorjeta</small></div>`;
  h += `<div class="ymap2">${dests.map(([id, L]) => `<span style="left:${sx(L.x)}%;top:${sz(L.z)}%" title="${L.n}">${L.ico}</span>`).join('')}<span class="me" style="left:${sx(playerPos.x)}%;top:${sz(playerPos.z)}%"></span>${Array.from({ length: 3 }, (_, i) => `<i class="ycar" style="left:${(phHash(G.ano + 'c' + i) % 80) + 10}%;top:${(phHash(G.ano + 'd' + i) % 70) + 15}%;animation-delay:${i * .7}s">🚕</i>`).join('')}</div>`;
  h += `<div class="rcls">${P2_RIDE.map(x => `<button class="${x.id === C.id ? 'on' : ''}" onclick="p2RideCls('${x.id}')"><i>${x.ico}</i><b>${x.t}</b><small>${x.eta} min</small></button>`).join('')}</div><div class="apnote" style="margin:4px 0 6px">${C.ico} ${C.d}</div>`;
  h += `<div class="clist">${dests.map(([id, L]) => { const d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z), p = Math.round(rideCost(d) * C.m / 100) * 100; return `<button class="crow" onclick="p2Ride('${id}')"><div class="cav" style="background:#ffcc00;color:#111">${L.ico}</div><div class="cinfo"><b>${L.n}</b><span>${(d / 10).toFixed(1)} km · ${C.eta + Math.round(d / 20)} min</span></div><b style="color:#ffcc00">${kzShort(p)}</b></button>`; }).join('')}</div>`;
  return h;
};

/* =========================================================
   TXOVA — restaurantes, carrinho e entrega em tempo real
   ========================================================= */
const P2_REST = [
  { t: 'Sabores da Banda', d: 'Comida angolana · ⭐ 4,8', ids: ['funje', 'muamba'], bg: 'linear-gradient(135deg,#e85d04,#9d0208)' },
  { t: 'Kianda Fast', d: 'Pizza e hambúrguer · ⭐ 4,5', ids: ['pizza', 'burger'], bg: 'linear-gradient(135deg,#ffb703,#fb8500)' },
  { t: 'Ilha Gourmet', d: 'Marisco e sushi · ⭐ 4,9', ids: ['sushi', 'marisco'], bg: 'linear-gradient(135deg,#0077b6,#03045e)' },
];
const P2_ESTAF = ['Mano Djó', 'Kiesse', 'Txutxi', 'Bruno Kupapata', 'Mana Fefa'];
function p2TrackHTML() {
  const T = P2.track; if (!T) return '<div id="txTrack"></div>';
  const s = (Date.now() - T.t0) / 1000, st = s < 2 ? 0 : s < 5 ? 1 : s < 9 ? 2 : 3;
  const L = ['Pedido aceite', 'A preparar', `${T.est} a caminho`, 'Entregue! Bom apetite'];
  return `<div id="txTrack" class="track"><div class="trh"><b>${T.f.ico} ${T.f.t}</b><span>${st < 3 ? `Chega em ${Math.max(1, Math.ceil((9 - s) / 1.5))} min` : 'Entregue'}</span></div><div class="trbar"><i style="width:${Math.min(100, s / 9 * 100)}%"></i><em style="left:${Math.min(96, s / 9 * 100)}%">🛵</em></div><div class="trst">${L.map((l, i) => `<span class="${i <= st ? 'on' : ''}">${l}</span>`).join('')}</div></div>`;
}
orderFood = function (id) {
  if (G.tel < 2) return toast('Precisas de um smartphone.');
  const F = FOODS.find(f => f.id === id); if (!F) return;
  if (P2.track && Date.now() - P2.track.t0 < 9000) return toast('🛵 Espera pelo pedido que já vem a caminho!');
  if (!pay(F.p)) return;
  P2.track = { f: F, t0: Date.now(), est: pick(P2_ESTAF) };
  toast(`🛵 Pedido feito: ${F.t}. Acompanha a entrega na Txova!`); save(); refresh(); renderPhone(true);
  setTimeout(() => {
    G.comidaAno = (G.comidaAno || 0) + 1;
    const t = `🛵 A Txova entregou: ${F.t}. ` + (G.comidaAno <= 3 ? fx(F.ef) : 'Já comeste bem este ano, o efeito é menor. ' + fx({ saude: F.ef.saude < 0 ? -1 : 0 }));
    addLog(t); toast(strip(t)); SND.play('bell'); save(); refresh();
  }, 9000);
};
PHONE_VIEWS.tupuca = () => apHead('Txova', `Entrega em ${G.cidade.mun} · 30 min`) + p2TrackHTML()
  + P2_REST.map(Rs => `<div class="rest" style="background:${Rs.bg}"><b>${Rs.t}</b><span>${Rs.d} · entrega grátis</span></div><div class="list">${Rs.ids.map(id => { const F = FOODS.find(f => f.id === id); return F ? btnItem(F.ico, F.t, Object.entries(F.ef).map(([k, v]) => `${SHORT[k]} ${v > 0 ? '+' : ''}${v}`).join(' '), kzShort(F.p), `orderFood('${F.id}')`, G.dinheiro < F.p) : ''; }).join('')}</div>`).join('')
  + '<p class="apnote">Encomendar não gasta energia. Depois de 3 refeições no ano o efeito diminui. Comida de plástico tira saúde!</p>';

/* =========================================================
   KUIA — feed de vídeos (deslizar, gostar, comentar)
   ========================================================= */
const P2_KV = [
  { u: 'kiesse_oficial', c: 'Passinho novo de kuduro 🔥 quem consegue?', ico: '💃', bg: 'linear-gradient(160deg,#ff006e,#8338ec)', s: 'Toque do Candongueiro' },
  { u: 'humor_do_musseque', c: 'Quando a mãe diz "temos comida em casa" 😂', ico: '😂', bg: 'linear-gradient(160deg,#ffbe0b,#fb5607)', s: 'som original' },
  { u: 'luanda_vibes', c: 'Pôr do sol na Marginal de Luanda 🌅', ico: '🌅', bg: 'linear-gradient(180deg,#ff9e00,#ff006e 55%,#3a0ca3)', s: 'Muxima Minha' },
  { u: 'chef_da_banda', c: 'Muamba de galinha em 60 segundos 🍲', ico: '🍲', bg: 'linear-gradient(160deg,#e85d04,#370617)', s: 'Semba do Kota' },
  { u: 'dj_palanca', c: 'Set de afro house ao vivo no Kianda Mall 🎧', ico: '🎧', bg: 'linear-gradient(160deg,#00f5d4,#00bbf9 50%,#9b5de5)', s: 'Afro Kilamba' },
  { u: 'futebol_ao', c: 'Golo do ano na Liga Mwangolé ⚽', ico: '⚽', bg: 'linear-gradient(160deg,#2d6a4f,#081c15)', s: 'som original' },
  { u: 'kizombeira_ao', c: 'Aula de kizomba para iniciantes 💃🕺', ico: '🕺', bg: 'linear-gradient(160deg,#c9184a,#590d22)', s: 'Amor de Kianda' },
  { u: 'viagens_angola', c: 'Quedas de Kalandula vistas de cima 🌊', ico: '🌊', bg: 'linear-gradient(180deg,#48cae4,#023e8a)', s: 'Luanda Lua Cheia' },
];
const P2_COM = ['Kkkkk morri 😂', 'Isso é Angola meu! 🇦🇴', 'Bwé de bom 🔥', 'Quem veio pelo trend? 🙋', 'Ensina-me isso mano', 'Top demais 👏', 'A minha mãe faz igual 😂', 'Partilhei com a família toda'];
function p2Kuia(dir) { P2.kuiaIdx = (P2.kuiaIdx + dir + 1000) % P2_KV.length; P2.kuiaCom = false; SND.play('flip'); renderPhone(true); }
function p2KuiaLike() { const i = P2.kuiaIdx; P2.kuiaLiked[i] = !P2.kuiaLiked[i]; if (P2.kuiaLiked[i]) SND.play('like'); renderPhone(true); }
function p2KuiaSwipe() {
  const el = document.querySelector('.kv2'); if (!el || el._sw) return; el._sw = 1;
  let y0 = null, last = 0;
  el.addEventListener('pointerdown', e => { y0 = e.clientY; });
  el.addEventListener('pointerup', e => { if (y0 == null) return; const dy = e.clientY - y0; y0 = null; if (Math.abs(dy) > 40) p2Kuia(dy < 0 ? 1 : -1); else { const n = Date.now(); if (n - last < 320) { if (!P2.kuiaLiked[P2.kuiaIdx]) p2KuiaLike(); } last = n; } });
  el.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > 30) p2Kuia(e.deltaY > 0 ? 1 : -1); }, { passive: true });
}
PHONE_VIEWS.kuia = () => {
  const i = P2.kuiaIdx, V = P2_KV[i], hh = phHash(G.ano + 'kv' + i), lk = (1200 + hh % 90000) + (P2.kuiaLiked[i] ? 1 : 0);
  const trends = ['#KuduroChallenge', '#Kizombeira', '#LuandaVibes', '#FunjeChallenge', '#DançaDoCandongueiro', '#AfroHouseAO'];
  return apHead('Kuia', 'Para ti · A seguir') + `<div class="kv2" style="background:${V.bg}"><div class="kvico">${V.ico}</div><div class="kvprog"><i></i></div>
      <div class="kvside"><button class="${P2.kuiaLiked[i] ? 'lk' : ''}" onclick="p2KuiaLike()">❤️<small>${numShort(lk)}</small></button><button onclick="P2.kuiaCom=!P2.kuiaCom;renderPhone(true)">💬<small>${numShort(hh % 3000)}</small></button><button onclick="toast('↗️ Partilhaste no Fala Já!')">↗️<small>Partilhar</small></button><span class="disc"></span></div>
      <div class="kvtxt"><b>@${V.u}</b><br>${esc(V.c)}<br><span class="kvs">🎵 ${V.s}</span></div>
      <button class="kvnav up" onclick="p2Kuia(-1)" aria-label="Anterior">⬆️</button><button class="kvnav dn" onclick="p2Kuia(1)" aria-label="Seguinte">⬇️</button>
      ${P2.kuiaCom ? `<div class="kvcom"><b>Comentários</b>${[0, 1, 2, 3].map(j => `<div><span>@${['kamba', 'mwangole', 'zungueira', 'kota', 'bebucha'][(hh + j) % 5]}_${(hh >> j) % 99}</span> ${P2_COM[(hh + j * 3) % P2_COM.length]}</div>`).join('')}</div>` : ''}</div>
      <div class="apnote" style="text-align:center;margin:2px 0 8px">Desliza para cima ou para baixo · toque duplo para gostar</div>
      ${energyBar()}<div class="pgrid2"><button class="pbtn" onclick="postSocial('danca')">💃 Gravar dança</button><button class="pbtn" onclick="postSocial('humor')">😂 Vídeo de humor</button></div>
      <div class="apsec">Em alta em Angola</div><div class="chips">${trends.map(t => `<span class="tchip">${t}</span>`).join('')}</div>
      <p class="apnote">Seguidores: <b>${numShort(G.seg)}</b> · os vídeos usam a tua fama e inteligência. Talento artístico dá o dobro!</p>`;
};

/* =========================================================
   KIZOMBA FM — rádio com música gerada em tempo real
   ========================================================= */
function p2Play(i) {
  if (i != null) SND.RADIO.play(i); else SND.RADIO.toggle();
  if (SND.RADIO.on && !G.musicaAno && typeof listenMusic === 'function') listenMusic();
  renderPhone(true);
}
let p2VizOn = false;
function p2VizStart() {
  if (p2VizOn) return; p2VizOn = true;
  const loop = () => {
    const cv = document.getElementById('fmViz');
    if (!cv || phoneApp !== 'musica') { p2VizOn = false; return; }
    const c = cv.getContext('2d'), W = cv.width, H = cv.height, an = SND.RADIO.analyser();
    c.clearRect(0, 0, W, H);
    const n = 24, data = new Uint8Array(32);
    if (an && SND.RADIO.on) an.getByteFrequencyData(data);
    for (let i = 0; i < n; i++) {
      const v = SND.RADIO.on ? (data[i + 1] || 0) / 255 : .04 + .02 * Math.sin(Date.now() / 400 + i);
      const h = Math.max(3, v * H), x = i * (W / n) + 2;
      const g = c.createLinearGradient(0, H, 0, H - h); g.addColorStop(0, '#ff5c8a'); g.addColorStop(1, '#ffd166');
      c.fillStyle = g; c.beginPath(); if (c.roundRect) c.roundRect(x, H - h, W / n - 4, h, 3); else c.rect(x, H - h, W / n - 4, h); c.fill();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
PHONE_VIEWS.musica = () => {
  const on = SND.RADIO.on, T = SND.RADIO.TRACKS[SND.RADIO.idx];
  const gn = { kizomba: 'Kizomba', semba: 'Semba', kuduro: 'Kuduro', afrohouse: 'Afro House' };
  return apHead('Kizomba FM', '99.9 FM · 100% música angolana', `<span class="aibadge" style="background:#c9184a">${on ? 'AO VIVO' : 'FM'}</span>`)
    + `<div class="nowp"><div class="vinyl ${on ? 'spin' : ''} g-${T.g}"><div class="lbl">🎵</div></div><b>${T.t}</b><span>${T.a} · ${gn[T.g]}</span>
      <canvas id="fmViz" width="300" height="56"></canvas>
      <div class="prog"><i id="fmProg" style="width:0"></i></div><div class="fmtime" id="fmTime">0:00 / ${p2mmss(SND.RADIO.dur() || 0)}</div>
      <div class="pctl"><button onclick="SND.RADIO.prev();p2Play(SND.RADIO.idx)">⏮</button><button class="play" onclick="p2Play()">${on ? '⏸' : '▶'}</button><button onclick="SND.RADIO.next();p2Play(SND.RADIO.idx)">⏭</button></div>
      <div class="vol"><span>🔈</span><input type="range" min="0" max="1" step=".05" value="${SND.cfg.vol}" oninput="SND.setOpt('vol',+this.value)"><span>🔊</span></div></div>
      <div class="apsec">Playlist</div><div class="clist">${SND.RADIO.TRACKS.map((x, i) => `<button class="crow ${i === SND.RADIO.idx && on ? 'playing' : ''}" onclick="p2Play(${i})"><div class="cav g-${x.g}">${i === SND.RADIO.idx && on ? '<i class="eqmini"><b></b><b></b><b></b></i>' : '🎵'}</div><div class="cinfo"><b>${x.t}</b><span>${x.a} · ${gn[x.g]}</span></div><span style="color:#888;font-size:12px">${i === SND.RADIO.idx && on ? 'a tocar' : '▶'}</span></button>`).join('')}</div>
      <p class="apnote">A música é criada em tempo real pelo jogo e continua a tocar com o telemóvel fechado. 🎵 Os jogadores perto de ti também ouvem a tua música, mais alto quanto mais perto estiverem. Ouvir a rádio dá felicidade (1 vez por ano).</p>`;
};

/* =========================================================
   NOTÍCIAS — secções, artigos e tabela da Liga Mwangolé
   ========================================================= */
const P2_EQ = ['Leões da Ilha', 'Águias do Kilamba', 'Palancas do Sul', 'Kianda FC', 'Sagrada Mbanza', 'Desportivo do Planalto', 'Estrela do Namibe', 'Kuanza United'];
function p2News() {
  const mk = G.mercado, hh = phHash(G.ano + 'n'), P = cid(), sel = (a, s) => a[phHash(G.ano + s) % a.length];
  const tab = (ico, t, b) => ({ ico, t, b });
  const real = [];
  if (typeof NEWS !== 'undefined') {
    NEWS.items.slice(0, 8).forEach((x, i) => real.push(tab('📣', x.t, `Contado por quem viveu: acontecimento real na cidade, há ${Math.max(1, Math.round((Date.now() / 1000 - (x.ts || 0)) / 60))} min.`)));
    if (NEWS.top.length) real.push(tab('💰', `${NEWS.top[0].n} lidera a lista dos mais ricos`, `O ranking da fortuna da cidade: ${NEWS.top.slice(0, 5).map(x => x.n).join(', ')}. O dinheiro fala alto em Luanda.`));
    if (NEWS.fam.length && NEWS.fam[0].f >= 20) real.push(tab('⭐', `${NEWS.fam[0].n} é a figura mais falada`, `Com ${NEWS.fam[0].f} de fama, toda a gente conhece ${NEWS.fam[0].n}. ${NEWS.fam.slice(1, 4).map(x => x.n).join(' e ')} também andam nas bocas do povo.`));
    real.push(tab('🌐', `${NEWS.on || 1} jogador${(NEWS.on || 1) > 1 ? 'es' : ''} online agora na cidade`, 'A cidade está viva: cada pessoa que vês na rua é um jogador real, a viver a própria história.'));
    NEWS.deds.slice(0, 3).forEach(x => real.push(tab('💌', `${x.nick} dedicou música a ${x.para}`, x.txt ? `“${x.txt}” — ouvido nas rádios da cidade.` : 'Dedicatória ouvida nas rádios da cidade.')));
  }
  return [
    ['🇦🇴 Acontecimentos', real.length ? real : [tab('🌱', 'Ainda não há grandes acontecimentos', 'Sê o primeiro a fazer história: casa, compra casa, tem filhos — a cidade fala de ti!')]],
    ...[
    ['Destaques', [
      G.stats.fama >= 25 ? tab('⭐', `${G.nome} é uma das figuras mais faladas de ${G.cidade.prov}!`, `As redes sociais não param de falar de ${G.nome}. Com ${numShort(G.seg)} seguidores, já é reconhecido(a) nas ruas de ${G.cidade.mun}.`) : null,
      tab('🛣️', sel(['Nova estrada liga Luanda a Catete', 'Obras do metro de superfície de Luanda avançam', 'Novo aeroporto internacional recebe mais voos'], 'a'), 'O Governo garante que as obras vão criar milhares de empregos e reduzir o trânsito nas horas de ponta.'),
      tab('🌧️', sel(['Chuvas fortes causam inundações em vários bairros', 'Cacimbo chega mais cedo este ano', 'Calor intenso: médicos pedem para beber muita água'], 'b'), 'A protecção civil pede cuidado redobrado e aconselha a população a evitar zonas de risco.'),
      tab('🗺️', sel(['As 21 províncias celebram um ano da nova divisão', 'Ícolo e Bengo cresce com novas centralidades', 'Moxico Leste recebe primeiro hospital provincial'], 'c'), 'A nova divisão administrativa aproxima os serviços das populações, dizem os governos provinciais.'),
    ]],
    ['Economia', [
      tab('📈', mk ? `Bolsa de Luanda ${mk.bodiva >= 0 ? 'sobe' : 'cai'} ${Math.abs(Math.round(mk.bodiva * 100))}% no último ano` : 'Bolsa de Luanda abre o ano em alta', 'Os analistas recomendam diversificar os investimentos e manter uma reserva em dólares.'),
      tab('💵', mk ? `Kwanza ${mk.dolar > .05 ? 'desvaloriza' : 'mantém-se estável'} face ao dólar (${Math.round(mk.dolar * 100)}%)` : 'Banco Central mantém a taxa de juro', 'O Banco Central diz que vai continuar a acompanhar a inflação de perto.'),
      tab('🛢️', sel(['Preço do petróleo sobe e anima a economia', 'Mulemba Petróleos anuncia novo bloco no mar', 'Exportações de diamantes batem recorde'], 'd'), 'O sector representa a maior parte das receitas do país, mas a diversificação continua a ser o grande desafio.'),
      tab('🏪', G.negocios.length ? `Pequenos negócios crescem em ${G.cidade.mun}` : 'Zungueiras ganham espaço nos mercados formais', 'Cada vez mais angolanos apostam no próprio negócio para fugir ao desemprego.'),
    ]],
    ['Desporto', [
      tab('⚽', sel(['Leões da Ilha lideram a Liga Mwangolé', 'Águias do Kilamba vencem o clássico por 2-1', 'Palancas Negras apurados para o CAN'], 'e'), 'Os adeptos encheram o estádio e a festa continuou pela noite fora.'),
      tab('🏀', sel(['Angola conquista mais um Afrobasket', 'Águias do Kilamba campeões de basquetebol', 'Jovem de Cabinda assina por clube europeu'], 'f'), 'O basquetebol continua a ser o orgulho do desporto angolano.'),
    ]],
    ['Tecnologia', [
      tab('📶', sel(['DarkCell leva o 5G a mais províncias', 'DarkCell Money já tem 2 milhões de carteiras', 'Palanca Pay ultrapassa 5 milhões de utilizadores'], 'g'), 'A cobertura de rede é cada vez melhor, mas as províncias do interior ainda pedem mais antenas.'),
      tab('💻', sel(['Startups angolanas atraem investimento estrangeiro', 'Jovens programadores criam app de kandongueiros', 'Universidade Pública de Luanda abre curso de IA'], 'h'), 'O ecossistema tecnológico de Luanda nunca esteve tão animado.'),
    ]],
    [P.n, [
      tab('📍', `${P.cap}: ${sel(['governo provincial inaugura novo mercado', 'abre nova escola secundária', 'hospital provincial recebe equipamento novo', 'festival cultural junta milhares'], 'i')}`, `A economia de ${P.n} assenta em ${P.eco.toLowerCase()}. ${nivelCidade(P) === 'pobre' ? 'A população pede mais investimento e emprego.' : 'A província continua a atrair investimento.'}`),
      tab('🌤️', `Tempo em ${G.cidade.mun}: ${weather().t.toLowerCase()}, ${weather().temp}°`, 'Previsão para os próximos dias disponível na app Tempo.'),
    ]],
  ].map(([t, a]) => [t, a.filter(Boolean)])];
}
function p2NewsTab(i) { P2.newsTab = +i; P2.newsOpen = null; renderPhone(); }
function p2NewsOpen(i) { P2.newsOpen = i; renderPhone(); }
PHONE_VIEWS.noticias = () => {
  const N = p2News(), tab = Math.min(P2.newsTab, N.length - 1), srcs = ['Diário Mwangolé', 'Folha da Ilha', 'Kalemba Notícias', 'Kumbu Económico', 'Rádio Marginal'];
  if (P2.newsOpen != null) {
    const a = N[tab][1][P2.newsOpen]; if (a) return `<div class="aphead"><button onclick="P2.newsOpen=null;renderPhone()">‹</button><div style="flex:1"><h3>${N[tab][0]}</h3><div class="apsub">${srcs[P2.newsOpen % 5]}</div></div></div><div class="nart"><div class="nimg">${a.ico}</div><h2>${esc(a.t)}</h2><small>${srcs[P2.newsOpen % 5]} · há ${P2.newsOpen + 1} h · ${2 + P2.newsOpen} min de leitura</small><p>${esc(a.b)}</p><p>${esc(G.cidade.mun)}, ${G.ano}. Mais desenvolvimentos a qualquer momento.</p></div>`;
  }
  let h = apHead('Notícias', 'Angola hoje') + `<div class="ptabs scroll">${N.map(([t], i) => `<button class="${i === tab ? 'on' : ''}" onclick="p2NewsTab(${i})">${t}</button>`).join('')}</div>`;
  h += `<div class="clist">${N[tab][1].map((a, i) => `<button class="news ${i === 0 ? 'big' : ''}" onclick="p2NewsOpen(${i})"><span class="nsrc">${a.ico} ${srcs[i % 5]} · há ${i + 1} h</span><b>${esc(a.t)}</b></button>`).join('')}</div>`;
  if (N[tab][0] === 'Desporto') {
    const tb = P2_EQ.map((e, i) => ({ e, p: 20 + phHash(G.ano + e) % 40 })).sort((a, b) => b.p - a.p);
    h += `<div class="apsec">Liga Mwangolé · Classificação</div><div class="ltab">${tb.map((x, i) => `<div><span>${i + 1}</span><b>${x.e}</b><em>${Math.round(x.p / 2.3)} J</em><strong>${x.p} pts</strong></div>`).join('')}</div>`;
  }
  return h + '<p class="apnote">Ler as notícias uma vez por ano dá +1 inteligência.</p>';
};

/* =========================================================
   TEMPO — hora a hora, 7 dias e outras províncias
   ========================================================= */
function p2WxBg(t) { return /Chuva|Trovoada/.test(t) ? 'linear-gradient(180deg,#3a4a5f,#141b26)' : /Cacimbo|nublado/.test(t) ? 'linear-gradient(180deg,#6b7f99,#26334a)' : p2Hour() >= 19 || p2Hour() < 6 ? 'linear-gradient(180deg,#0b1d3a,#05070f)' : 'linear-gradient(180deg,#3fa9ff,#1460c4)'; }
PHONE_VIEWS.tempo = () => {
  const w = weather(), h0 = Math.floor(p2Hour()), hum = 55 + phHash(G.ano + 'hu') % 35, vento = 6 + phHash(G.ano + 've') % 20;
  const caps = ['Luanda', 'Huambo', 'Huíla', 'Benguela', 'Cabinda', 'Moxico Leste'].filter(n => n !== G.cidade.prov).slice(0, 5);
  return `<div class="wxpage" style="background:${p2WxBg(w.t)}">` + apHead('Tempo', '') + `<div class="wxbig"><div>${G.cidade.mun}</div><b>${w.temp}°</b><span>${w.ico} ${w.t}</span><small>Máx ${w.temp + 3}° · Mín ${w.temp - 5}° · Sensação ${w.temp + 2}°</small></div>
    <div class="wxcard"><div class="apsec" style="margin-top:0">Hora a hora</div><div class="wxh">${Array.from({ length: 8 }, (_, i) => { const hr = (h0 + i) % 24, x = weather('h' + i); const ni = hr >= 19 || hr < 6; return `<div><small>${i ? String(hr).padStart(2, '0') + 'h' : 'Agora'}</small><span>${ni && /Sol|limpo/.test(x.t) ? '🌙' : x.ico}</span><b>${w.temp + Math.round(Math.sin((hr - 9) / 24 * Math.PI * 2) * 3)}°</b></div>`; }).join('')}</div></div>
    <div class="wxcard"><div class="apsec" style="margin-top:0">Próximos 7 dias</div>${[1, 2, 3, 4, 5, 6, 7].map(i => { const x = weather(i); return `<div class="wxd"><span>${DIAS[(new Date().getDay() + i) % 7].slice(0, 3)}</span><i>${x.ico}</i><small>${x.temp - 5}°</small><em><b style="left:${(x.temp - 18) * 6}%;width:${30 + (x.temp % 4) * 8}%"></b></em><small>${x.temp + 3}°</small></div>`; }).join('')}</div>
    <div class="wxgrid"><div>💧<small>Humidade</small><b>${hum}%</b></div><div>💨<small>Vento</small><b>${vento} km/h</b></div><div>🌅<small>Nascer do sol</small><b>06:${String(10 + phHash(G.ano + 's') % 20)}</b></div><div>🌇<small>Pôr do sol</small><b>18:${String(5 + phHash(G.ano + 'p') % 25).padStart(2, '0')}</b></div><div>☀️<small>Índice UV</small><b>${/Sol|limpo/.test(w.t) ? 'Alto' : 'Moderado'}</b></div><div>🌊<small>Mar</small><b>${cid().mar ? 'Calmo' : 'Sem praia'}</b></div></div>
    <div class="wxcard"><div class="apsec" style="margin-top:0">Outras províncias</div>${caps.map(n => { const P = PROVINCIAS.find(p => p.n === n); const x = weather('p' + n); return P ? `<div class="wxd"><span style="width:auto;flex:1">${P.cap} <small style="opacity:.6">${P.n}</small></span><i>${x.ico}</i><b>${x.temp - (['Huambo', 'Huíla'].includes(n) ? 6 : 0)}°</b></div>` : ''; }).join('')}</div></div>`;
};

/* =========================================================
   SAÚDE — passos reais, água, coração e sono
   ========================================================= */
function p2Agua() {
  G.aguaAno = G.aguaAno && G.aguaAno.ano === G.ano ? G.aguaAno : { ano: G.ano, n: 0 };
  if (G.aguaAno.n >= 8) return toast('💧 Já bebeste os 8 copos. Muito bem!');
  G.aguaAno.n++; SND.play('pop');
  if (G.aguaAno.n === 8) { const t = '💧 Bebeste 8 copos de água. O corpo agradece! ' + fx({ saude: 2 }); addLog(t, 'good'); toast(strip(t)); }
  save(); refresh(); renderPhone(true);
}
PHONE_VIEWS.saude = () => {
  const passos = Math.round(G.passos || 0), km = (passos * .72 / 1000).toFixed(1), meta = Math.min(100, passos / 100);
  const agua = G.aguaAno && G.aguaAno.ano === G.ano ? G.aguaAno.n : 0;
  const ring = (v, c, l, t) => `<div class="ring" style="background:conic-gradient(${c} ${v * 3.6}deg,#2a2a33 0)"><div><b>${t != null ? t : v}</b><small>${l}</small></div></div>`;
  const altura = 1.5 + (phHash(G.nome + 'h') % 35) / 100, peso = Math.round(altura * altura * (20 + (100 - G.stats.saude) / 12));
  return apHead('Saúde', G.bens.includes('watch') ? '⌚ Sincronizado com o smartwatch' : 'O teu corpo em números') + `<div class="rings">${ring(Math.round(meta), '#30d158', 'Passos', passos >= 1000 ? (passos / 1000).toFixed(1) + 'k' : passos)}${ring(G.stats.saude, '#ff375f', 'Saúde')}${ring(G.stats.felicidade, '#ffcb00', 'Humor')}</div>`
    + (G.doente ? '<div class="apwarn">🤒 Estás doente! Marca uma consulta.</div>' : '<div class="apok">✅ Sem doenças diagnosticadas.</div>')
    + `<div class="grid2p"><div><small>👟 Passos este ano</small><b>${passos.toLocaleString('pt-PT')}</b><em>${km} km · meta 10 000 ${G.metaPassos ? '✅' : ''}</em></div><div><small>❤️ Ritmo cardíaco</small><b><span id="hrV">${64 + (100 - G.stats.saude) / 6 | 0}</span> bpm <i class="beat">❤️</i></b><em>em repouso</em></div><div><small>😴 Sono</small><b>${(6 + (G.stats.felicidade % 30) / 12).toFixed(1)} h</b><em>${G.stats.felicidade > 60 ? 'bom descanso' : 'dormes pouco'}</em></div><div><small>⚖️ IMC</small><b>${(peso / (altura * altura)).toFixed(1)}</b><em>${altura.toFixed(2)} m · ${peso} kg</em></div></div>`
    + `<div class="apsec">Água hoje</div><div class="agua">${Array.from({ length: 8 }, (_, i) => `<i class="${i < agua ? 'on' : ''}"></i>`).join('')}<button onclick="p2Agua()">+ copo</button></div>`
    + '<p class="apnote">Os passos contam mesmo: anda pela cidade com a tua personagem. 10 000 passos num ano dão saúde e felicidade.</p>'
    + energyBar() + `<div class="list">${btnItem('🏥', 'Marcar consulta', 'Clínica Bem-Estar', kzShort(70000), "runAtiv('medico')")}${btnItem('🧘', 'Treino em casa (app)', 'Exercício guiado', 'Grátis', "doAct(0,()=>'Fizeste um treino de 30 min com a app. '+fx({saude:R(2,4),aparencia:R(0,2)}),'train')")}</div>`;
};

/* =========================================================
   JOGOS — mini-jogos que se jogam a sério no telemóvel
   ========================================================= */
function p2Reward(k, ef, msg) {
  G.jogoAno = G.jogoAno || {};
  if (G.jogoAno[k] === G.ano) return toast(msg + ' (já ganhaste o bónus deste jogo este ano)');
  G.jogoAno[k] = G.ano; const t = msg + ' ' + fx(ef); addLog(t, 'good'); toast(strip(t)); save(); refresh();
}
function p2Game(k) {
  if (k === 'galo') P2.game = { k, b: Array(9).fill(''), fim: null };
  else if (k === 'mem') { const ic = ['🎵', '🌴', '🚕', '🏀', '💎', '🎁', '🔥', '⚽']; const c = [...ic, ...ic].sort(() => Math.random() - .5); P2.game = { k, c, open: [], ok: [], moves: 0, lock: false }; }
  else if (k === 'kumbu') P2.game = { k, pts: 0, t0: 0, fim: false, x: 50, y: 50 };
  else P2.game = null;
  renderPhone();
}
function p2GaloWin(b) { const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; for (const [a, c, d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.every(Boolean) ? 'empate' : null; }
function p2Galo(i) {
  const g = P2.game; if (!g || g.fim || g.b[i]) return;
  g.b[i] = 'X'; SND.play('tap'); g.fim = p2GaloWin(g.b);
  if (!g.fim) {
    const b = g.b, free = b.map((v, j) => v ? null : j).filter(v => v != null);
    const tryW = s => free.find(j => { b[j] = s; const w = p2GaloWin(b) === s; b[j] = ''; return w; });
    let m = tryW('O'); if (m == null) m = tryW('X'); if (m == null && !b[4]) m = 4; if (m == null) m = chance(.75) ? [0, 2, 6, 8].filter(j => !b[j])[0] : undefined; if (m == null) m = pick(free);
    b[m] = 'O'; g.fim = p2GaloWin(b);
  }
  if (g.fim === 'X') { SND.play('win'); p2Reward('galo', { felicidade: 3, inteligencia: 1 }, '⭕ Ganhaste ao Jogo do Galo!'); }
  else if (g.fim === 'O') SND.play('lose'); else if (g.fim) SND.play('pop');
  renderPhone(true);
}
function p2Mem(i) {
  const g = P2.game; if (!g || g.lock || g.open.includes(i) || g.ok.includes(i)) return;
  g.open.push(i); SND.play('flip');
  if (g.open.length === 2) {
    g.moves++; const [a, b] = g.open;
    if (g.c[a] === g.c[b]) { g.ok.push(a, b); g.open = []; SND.play('like'); if (g.ok.length === 16) { SND.play('win'); p2Reward('mem', { inteligencia: 2, felicidade: 2 }, `🧠 Memória completa em ${g.moves} jogadas!`); } }
    else { g.lock = true; setTimeout(() => { g.open = []; g.lock = false; if (phoneApp === 'jogos') renderPhone(true); }, 750); }
  }
  renderPhone(true);
}
function p2KumbuHit() {
  const g = P2.game; if (!g || g.fim) return;
  if (!g.t0) g.t0 = performance.now();
  g.pts++; g.x = 10 + Math.random() * 80; g.y = 12 + Math.random() * 76; SND.play('coin');
  const c = document.getElementById('kbCoin'), p = document.getElementById('kbPts');
  if (c) { c.style.left = g.x + '%'; c.style.top = g.y + '%'; } if (p) p.textContent = g.pts;
}
function p2KumbuTick() {
  const g = P2.game; if (!g.t0 || g.fim) return;
  const left = 10 - (performance.now() - g.t0) / 1000, el = document.getElementById('kbT');
  if (el) el.textContent = Math.max(0, left).toFixed(1) + 's';
  if (left <= 0) {
    g.fim = true; G.kumbuBest = Math.max(G.kumbuBest || 0, g.pts);
    if (g.pts >= 15) { SND.play('win'); p2Reward('kumbu', { felicidade: 3 }, `🪙 Apanhaste ${g.pts} moedas!`); } else SND.play('lose');
    save(); renderPhone(true);
  }
}
function p2GameView() {
  const g = P2.game, back = `<div class="aphead"><button onclick="p2Game(null)">‹</button><div style="flex:1"><h3>${{ galo: 'Jogo do Galo', mem: 'Memória', kumbu: 'Apanha o Kumbu' }[g.k]}</h3><div class="apsub">Mini-jogo</div></div></div>`;
  if (g.k === 'galo') return back + `<div class="gstat">${g.fim === 'X' ? '🏆 Ganhaste!' : g.fim === 'O' ? '😅 O telemóvel ganhou' : g.fim ? '🤝 Empate' : 'Tu és X · toca numa casa'}</div><div class="galo">${g.b.map((v, i) => `<button class="${v === 'X' ? 'x' : v === 'O' ? 'o' : ''}" onclick="p2Galo(${i})">${v}</button>`).join('')}</div>${g.fim ? `<button class="pbtn" onclick="p2Game('galo')">Jogar outra vez</button>` : ''}`;
  if (g.k === 'mem') return back + `<div class="gstat">Jogadas: <b>${g.moves}</b> · pares: <b>${g.ok.length / 2}/8</b></div><div class="memg">${g.c.map((v, i) => { const show = g.open.includes(i) || g.ok.includes(i); return `<button class="${show ? 'up' : ''} ${g.ok.includes(i) ? 'ok' : ''}" onclick="p2Mem(${i})">${show ? v : ''}</button>`; }).join('')}</div>${g.ok.length === 16 ? `<button class="pbtn" onclick="p2Game('mem')">Jogar outra vez</button>` : ''}`;
  return back + `<div class="gstat">Moedas: <b id="kbPts">${g.pts}</b> · Tempo: <b id="kbT">${g.t0 ? '' : '10.0s'}</b> · Recorde: <b>${G.kumbuBest || 0}</b></div><div class="kbar">${g.fim ? `<div class="kbend"><b>${g.pts} moedas!</b><span>${g.pts >= 15 ? 'Mãos rápidas! 🏆' : 'Consegues 15? Tenta outra vez.'}</span><button class="pbtn" onclick="p2Game('kumbu')">Jogar outra vez</button></div>` : `<button id="kbCoin" class="kbcoin" style="left:${g.x}%;top:${g.y}%" onpointerdown="p2KumbuHit()">🪙</button>${g.t0 ? '' : '<div class="kbhint">Toca na moeda para começar!</div>'}`}</div>`;
}
PHONE_VIEWS.jogos = () => {
  if (P2.game) return p2GameView();
  return apHead('Jogos', 'Diversão e eSports') + `<div class="apsec">Mini-jogos</div><div class="gcards">
      <button onclick="p2Game('galo')" style="background:linear-gradient(135deg,#7b2cbf,#3c096c)"><i>⭕</i><b>Jogo do Galo</b><small>Contra o telemóvel</small></button>
      <button onclick="p2Game('mem')" style="background:linear-gradient(135deg,#0096c7,#023e8a)"><i>🧠</i><b>Memória</b><small>Encontra os pares</small></button>
      <button onclick="p2Game('kumbu')" style="background:linear-gradient(135deg,#ffb703,#e85d04)"><i>🪙</i><b>Apanha o Kumbu</b><small>10 segundos · recorde ${G.kumbuBest || 0}</small></button></div>
    <p class="apnote">Cada mini-jogo dá um bónus na primeira vitória do ano. Não gastam energia.</p>`
    + `<div class="apsec">Online</div>` + energyBar() + `<div class="list">${GAMES.filter(g => g.tel >= 2).map(g => btnItem(g.ico, g.t, g.id === 'freefire' ? 'Pequena hipótese de ganhar torneios pagos' : g.id === 'xadrez' ? 'Treina a mente' : G.bens.includes('ps5') ? 'Com KZ Station 5: mais diversão' : 'Diversão', '', `playGame('${g.id}')`)).join('')}</div>`;
};

/* =========================================================
   CÂMARA e GALERIA — filtros, flash, ver em grande
   ========================================================= */
function p2Snap() {
  const vf = document.querySelector('.viewf'); if (vf) { vf.classList.remove('flash'); void vf.offsetWidth; vf.classList.add('flash'); }
  takeSelfie(nearLoc ? ('em ' + LOC_POS[nearLoc].n) : (typeof inInt !== 'undefined' && inInt && LOC_POS[inInt.loc] ? 'em ' + LOC_POS[inInt.loc].n : 'em ' + G.cidade.mun));
  if (G.fotos && G.fotos[0]) G.fotos[0].f = P2.camF;
  save(); setTimeout(() => renderPhone(true), 260);
}
PHONE_VIEWS.camara = () => `${apHead('Câmara', G.tel >= 3 ? 'Modo Retrato · ' + (G.tel >= 4 ? '48MP Pro' : '200MP') : 'Foto')}
  <div class="viewf"><img src="${avatarShot(playerCfg(), '#3a3442', true)}" alt="" style="filter:${P2_FILTROS[P2.camF][1]}"><div class="vfgrid"></div><span class="vflbl">${nearLoc ? LOC_POS[nearLoc].n : G.cidade.mun}</span><span class="vfrec">${P2_FILTROS[P2.camF][0]}</span></div>
  <div class="cfil">${P2_FILTROS.map(([n], i) => `<button class="${i === P2.camF ? 'on' : ''}" onclick="P2.camF=${i};renderPhone(true)">${n}</button>`).join('')}</div>
  <div class="shutter"><button onclick="phoneOpen('galeria')" class="thumbb">${(G.fotos || [])[0] ? `<img src="${avatarShot(G.fotos[0].cfg, G.fotos[0].bg, true)}" style="filter:${P2_FILTROS[G.fotos[0].f || 0][1]}">` : '🖼️'}</button><button class="shut" onclick="p2Snap()" aria-label="Tirar foto"></button><button class="thumbb" onclick="postSocial('selfie')" title="Publicar">↗️</button></div>
  <p class="apnote">Escolhe um filtro e tira selfies para guardar memórias da tua vida. ↗️ publica uma selfie no Bwé Social (gasta 1 energia).</p>`;
PHONE_VIEWS.galeria = () => {
  const f = G.fotos || [];
  if (P2.foto != null && f[P2.foto]) { const x = f[P2.foto]; return `<div class="aphead"><button onclick="P2.foto=null;renderPhone()">‹</button><div style="flex:1"><h3>${x.idade} anos</h3><div class="apsub">${esc(x.onde)} · ${x.ano}</div></div></div><div class="gbig"><img src="${avatarShot(x.cfg, x.bg, true, 360)}" style="filter:${P2_FILTROS[x.f || 0][1]}"></div><div class="pgrid2"><button class="pbtn" onclick="postSocial('selfie')">↗️ Publicar</button><button class="pbtn" style="background:#3a1a1f" onclick="G.fotos.splice(P2.foto,1);P2.foto=null;save();renderPhone()">🗑️ Apagar</button></div>`; }
  return apHead('Galeria', `${f.length} fotos`) + (f.length ? `<div class="gal">${f.map((x, i) => `<button class="gph" onclick="P2.foto=${i};renderPhone()"><img src="${avatarShot(x.cfg, x.bg, true)}" alt="" style="filter:${P2_FILTROS[x.f || 0][1]}"><small>${x.idade} anos · ${esc(x.onde)}</small></button>`).join('')}</div>` : '<p class="apnote" style="text-align:center;margin-top:40px">Ainda não tiraste fotos. Abre a Câmara! 📷</p>');
};

/* =========================================================
   DEFINIÇÕES — som, música, ambiente, vibração
   ========================================================= */
function p2Opt(k) { SND.setOpt(k, !SND.cfg[k]); if (k === 'mus' && !SND.cfg.mus && SND.RADIO.on) SND.RADIO.stop(); SND.play('tap'); renderPhone(true); }
(function () {
  const _def = PHONE_VIEWS.definicoes;
  PHONE_VIEWS.definicoes = () => {
    const sw = (k, l, d) => `<button class="swrow" onclick="p2Opt('${k}')"><div><b>${l}</b><small>${d}</small></div><i class="tg ${SND.cfg[k] ? 'on' : ''}"></i></button>`;
    const som = `<div class="apsec">Som</div><div class="swbox">${sw('sfx', 'Efeitos sonoros', 'Botões, dinheiro, portas, passos')}${sw('mus', 'Música da rádio', 'Kizomba FM')}${sw('amb', 'Ambiente da cidade', 'Trânsito, pássaros e grilos')}${sw('vib', 'Vibração', 'Em notificações (telemóveis)')}<div class="swrow"><div><b>Volume</b></div><input type="range" min="0" max="1" step=".05" value="${SND.cfg.vol}" oninput="SND.setOpt('vol',+this.value)"></div></div>`;
    const h = _def(), head = apHead('Definições');
    return h.startsWith(head) ? head + h.slice(head.length).replace('<div class="list" style="margin-top:12px">', som + '<div class="list" style="margin-top:12px">') : h + som;
  };
})();

/* ---------------- limpar ao morrer / nova vida ---------------- */
(function () {
  const _d = die; die = function () { try { P2.torch = false; if (P2.torchL) P2.torchL.intensity = 0; P2.game = null; P2.track = null; } catch (e) { } return _d.apply(this, arguments); };
})();

/* =========================================================
   NOTIFICAÇÕES AO VIVO — banners que descem enquanto andas
   ========================================================= */
function p2Banner(ico, de, txt, act) {
  let el = document.getElementById('p2ban');
  if (!el) { el = document.createElement('div'); el.id = 'p2ban'; document.body.appendChild(el); }
  el.innerHTML = `<div class="bi">${ico}</div><div class="bt"><b>${esc(de)}</b><span>${esc(txt)}</span></div><small>agora</small>`;
  el.onclick = () => { el.classList.remove('on'); try { act && act(); } catch (e) { } };
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  SND.play('notif'); SND.vib([30, 40, 30]);
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 5200);
}
function p2OpenApp(id, ck) { if (!G || G.tel < 2) return; if (!phoneApp) openPhone(); phoneApp = id; chatKey = ck || null; renderPhone(); }
function p2RandomNotif() {
  if (!G || G.tel < 2 || phoneApp || (typeof mode !== 'undefined' && mode !== 'game') || (typeof modalOpen !== 'undefined' && modalOpen) || (typeof panelId !== 'undefined' && panelId) || (typeof dying !== 'undefined' && dying)) return;
  const cs = contacts(), c = cs.length ? pick(cs) : null;
  const opts = [
    c && (() => { const t = pick(c.key === 'mae' || c.key === 'pai' ? ['Já comeste hoje?', 'Liga-me quando puderes ❤️', 'Não te esqueças de rezar 🙏', 'Vem almoçar no domingo!'] : c.key === 'par' ? ['Saudades tuas 🥰', 'Onde estás? 😘', 'Hoje à noite jantamos juntos?'] : ['Mano, bora à farra sábado? 🎶', 'Viste o golo de ontem?! ⚽', 'Kkkk vê isto no Kuia 😂', 'Tens 5 mil emprestado? 😅']); p2Push(c.key, { o: 0, txt: t }); return ['💬', 'Fala Já · ' + p2N1(c.nome), t, () => p2OpenApp('mensagens', c.key)]; }),
    () => { const V = P2_KV[R(0, P2_KV.length - 1)]; return ['🎵', 'Kuia', `@${V.u} publicou: ${V.c}`, () => { P2.kuiaIdx = P2_KV.indexOf(V); p2OpenApp('kuia'); }]; },
    () => ['🛵', 'Txova', pick(['Fome? Muamba com entrega grátis hoje! 🍲', 'Pizza familiar com 20% de desconto 🍕', 'O teu restaurante favorito está aberto']), () => p2OpenApp('tupuca')],
    () => ['📰', 'Notícias', strip(p2News()[R(0, 3)][1][0]?.t || 'Últimas notícias de Angola'), () => { P2.newsOpen = null; p2OpenApp('noticias'); }],
    () => ['📶', 'DarkCell', (G.telNum ? 'Número: ' + (typeof fmtTel === 'function' ? fmtTel(G.telNum) : G.telNum) + ' · ' : '') + (G.pacoteAno === G.ano ? 'Semana Bwé ativa 🚀' : 'Ativa a Semana Bwé e tem rede em todo o lado!'), () => p2OpenApp('darkcell')],
    () => { const T = SND.RADIO.TRACKS[R(0, SND.RADIO.TRACKS.length - 1)]; return ['🎶', 'Kizomba FM', `A tocar agora: ${T.t} — ${T.a}`, () => p2OpenApp('musica')]; },
    G.passos > 5000 && !G.metaPassos ? (() => ['👟', 'Saúde', `Já deste ${Math.round(G.passos).toLocaleString('pt-PT')} passos. Faltam ${(10000 - Math.round(G.passos)).toLocaleString('pt-PT')} para a meta!`, () => p2OpenApp('saude')]) : null,
    G.mercado ? (() => ['📈', 'Invest AO', `Bolsa de Luanda ${G.mercado.bodiva >= 0 ? 'em alta' : 'em queda'}: ${G.mercado.bodiva >= 0 ? '+' : ''}${Math.round(G.mercado.bodiva * 100)}%`, () => p2OpenApp('investir')]) : null,
  ].filter(Boolean);
  const [ico, de, txt, act] = pick(opts)(); p2Banner(ico, de, txt, act); save(); updateBadge();
}
setInterval(() => { try { if (chance(.55)) p2RandomNotif(); } catch (e) { } }, 70000);
