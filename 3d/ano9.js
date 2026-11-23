/* =========================================================
   ANO9 — modelo de tempo "misto"
   • A barra do ano enche ao VIVER: ações, turnos, aulas, refeições, viagens, dormir
     e o próprio tempo a jogar (ativo).
   • Para fechar o ano: barra a 100% + pelo menos 25 min de jogo ativo nesse ano.
   • No máximo 3 anos por dia real. Offline ninguém envelhece.
   • Uma só energia: as "ações" passam a gastar a Energia do corpo (10 por ação).
   ========================================================= */
const A9 = {
  MIN_MS: 25 * 60e3,          // tempo mínimo de jogo ativo por ano
  MIN_PRESO_MS: 6 * 60e3,     // na cadeia o ano passa mais depressa (só espera)
  MAX_DIA: 3,                 // anos por dia real
  COST: 10,                   // energia por ação
  IDLE_MS: 120e3,             // sem tocar no jogo há 2 min = não conta
  PTS: { acao: 6, turno: 10, aula: 12, comer: 4, dormir: 6, viagem: 0, tempo: 2.5 /* por minuto */ },
  lastIn: Date.now(), lastDec: 0, tick: 0, okShown: false,
};
const A9_FONTES = [
  ['acao', '⚡', 'Ações (estudar, candidatar-te, treinar…)', '+6 cada'],
  ['turno', '💼', 'Turnos de trabalho de 1 minuto', '+10 cada'],
  ['aula', '🎓', 'Níveis de curso / aulas', '+12 cada'],
  ['comer', '🍲', 'Refeições', '+4 cada'],
  ['dormir', '🌙', 'Dormir', '+6'],
  ['tempo', '⏱️', 'Tempo a jogar (ativo)', '+2,5 por minuto'],
];

function a9Hoje() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function a9G() {
  if (!G) return null;
  if (!G.ano9) G.ano9 = { p: 0, ms: 0, dia: a9Hoje(), n: 0, fontes: {}, tot: 0 };
  const a = G.ano9; if (a.dia !== a9Hoje()) { a.dia = a9Hoje(); a.n = 0; }
  if (!a.fontes) a.fontes = {};
  return a;
}
function a9Min() { return G && G.preso > 0 ? A9.MIN_PRESO_MS : A9.MIN_MS; }
function a9Estado() {
  const a = a9G(); if (!a) return { p: 0, falta: 0, cap: false, ready: false, n: 0 };
  const falta = Math.max(0, a9Min() - a.ms), cap = a.n >= A9.MAX_DIA;
  return { p: Math.floor(a.p), falta, cap, n: a.n, ready: a.p >= 100 && falta <= 0 && !cap };
}
function a9Add(k, pts) {
  if (!G || !G.vivo || !pts) return; const a = a9G();
  a.p = Math.max(0, Math.min(100, a.p + pts)); a.fontes[k] = Math.max(0, (a.fontes[k] || 0) + pts);
}
const a9MinTxt = ms => { const m = Math.ceil(ms / 60e3); return m <= 1 ? (ms > 0 ? 'menos de 1 min' : '0 min') : m + ' min'; };
const a9MinCurto = ms => innerWidth <= 440 ? Math.max(1, Math.ceil(ms / 60e3)) + 'm' : a9MinTxt(ms);

/* ---------- uma só energia: G.acoes passa a ser a Energia do corpo ÷ 10 ---------- */
function a9Install() {
  if (!G) return; const d = Object.getOwnPropertyDescriptor(G, 'acoes');
  if (d && d.get) return;
  delete G.acoes;
  Object.defineProperty(G, 'acoes', {
    configurable: true, enumerable: false,
    get() { const v = G.vr; const e = v && typeof v.energia === 'number' ? v.energia : 90; return Math.floor(e / A9.COST + 1e-6); },
    set(n) {
      const v = vrG(), old = Math.floor(v.energia / A9.COST + 1e-6), d = Math.round(n) - old; if (!d) return;
      v.energia = Math.max(0, Math.min(100, v.energia + d * A9.COST));
      const now = Date.now();
      if (d < 0) { a9Add('acao', -d * A9.PTS.acao); A9.lastDec = now; }
      else if (now - A9.lastDec < 3000) a9Add('acao', -d * A9.PTS.acao); // energia devolvida = não conta
    },
  });
}

/* ---------- HUD: botão do ano e mini-barra ---------- */
function a9Hud() {
  const b = document.getElementById('ageBtn'), h = document.getElementById('hEnergy');
  if (!b || !G || !G.vivo) return;
  const e = a9Estado();
  b.classList.toggle('a9ok', e.ready); b.classList.toggle('a9wait', !e.ready);
  b.style.setProperty('--p', e.p + '%');
  const html = e.ready ? '<span class="a9w">Fechar o </span>ano ⏩' : e.cap ? '<span class="a9w">Amanhã </span>🌙' : `<span class="a9w">Ano </span>${e.p}%`;
  if (b.dataset.a9 !== html || !b.querySelector('.a9w')) { b.innerHTML = html; b.dataset.a9 = html; }
  if (h) {
    const sub = e.cap ? `${A9.MAX_DIA}/${A9.MAX_DIA} hoje` : e.ready ? 'pronto!' : e.falta > 0 ? `⏱️ ${a9MinCurto(e.falta)}` : 'vive mais';
    const hh = `<div class="a9h" title="Barra do ano"><div class="a9bar"><i style="width:${e.p}%"></i></div><small>${sub}</small></div>`;
    if (h.dataset.a9 !== hh || !h.querySelector('.a9h')) { h.innerHTML = hh; h.dataset.a9 = hh; }
  }
  if (e.ready && !A9.okShown) { A9.okShown = true; try { toast('🎂 O teu ano está completo! Carrega em "Fechar o ano" quando quiseres.'); } catch (x) { } }
  if (!e.ready) A9.okShown = false;
}

/* ---------- janela "O teu ano" ---------- */
function a9Modal() {
  const a = a9G(), e = a9Estado(), min = a9Min();
  const tempoPct = Math.min(100, Math.round((1 - e.falta / min) * 100));
  const fontes = A9_FONTES.map(([k, ico, t, v]) => `<div class="a9f"><span class="a9fi">${ico}</span><div class="a9ft"><b>${t}</b><small>${v}</small></div><em>${Math.round(a.fontes[k] || 0)}%</em></div>`).join('');
  const msg = e.cap ? `🌙 Já viveste <b>${A9.MAX_DIA} anos hoje</b>. Para que todos os jogadores envelheçam a um ritmo parecido, o próximo ano fecha <b>amanhã</b>. Podes continuar a jogar: o que fizeres continua a contar.`
    : e.ready ? '✅ O teu ano está completo!'
      : G.preso > 0 ? `🔒 Na cadeia, cada ano demora <b>${Math.round(A9.MIN_PRESO_MS / 60e3)} minutos</b> reais. Espera, ou paga a fiança.`
        : `Para fechar o ano precisas de <b>encher a barra</b> e de jogar pelo menos <b>${Math.round(min / 60e3)} minutos</b> neste ano. Se saíres do jogo, o tempo pára — ninguém envelhece offline.`;
  openModal(`<div class="mico">🗓️</div><h3>O teu ano · ${G.idade} anos</h3>
    <div class="a9m">
      <div class="a9row"><span>Viver o ano</span><b>${e.p}%</b></div><div class="a9big"><i style="width:${e.p}%"></i></div>
      <div class="a9row"><span>Tempo de jogo neste ano</span><b>${Math.round((min - e.falta) / 60e3)} / ${Math.round(min / 60e3)} min</b></div><div class="a9big t"><i style="width:${tempoPct}%"></i></div>
      <div class="a9row"><span>Anos vividos hoje</span><b>${e.n} / ${A9.MAX_DIA}</b></div>
      <p class="a9msg">${msg}</p>
      ${G.preso > 0 ? '' : `<div class="a9sec">O que enche a barra</div>${fontes}`}
    </div>
    <div class="choices">${e.ready ? '<button class="btn btn-yel" onclick="closeModal();ageUpUI()">Fechar o ano ⏩</button>' : ''}<button class="btn btn-ghost" onclick="closeModal()">${e.ready ? 'Ainda não' : 'Continuar a viver'}</button></div>`);
}

(function () {
  // portão do +1 ANO
  const _aui = ageUpUI;
  ageUpUI = function () {
    if (!G || !G.vivo || mode !== 'game' || busy || modalOpen) return _aui.apply(this, arguments);
    if (!window.A9_DEV && !a9Estado().ready) return a9Modal();
    if (!window.A9_DEV && typeof Acc !== 'undefined' && Acc.online && Acc.token) {
      if (A9.srvBusy) return;
      A9.srvBusy = true;
      fetch('/api/ano', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: '{}' })
        .then(r => (r.ok ? r.json() : null)).then(d => {
          A9.srvBusy = false;
          if (!d || d.ok) { if (d && d.ok) { const a = a9G(); a.n = Math.max(0, d.n - 1); } return _aui.apply(this, arguments); }  /* o hook do ageUpLogic faz a.n++ → fica igual ao do servidor */
          const a = a9G();
          if (d.cedo) { a.p = 0; a.ms = 0; toast(`⏱️ O servidor pede calma: fechaste anos demasiado seguidos. Espera ${Math.max(1, Math.ceil((d.espera || 0) / 60))} min.`); }
          else { a.n = A9.MAX_DIA; toast(`🌙 O servidor confirma: já viveste ${A9.MAX_DIA} anos hoje. Amanhã há mais.`); }
          a9Hud(); save();
        }).catch(() => { A9.srvBusy = false; return _aui.apply(this, arguments); });
      return;
    }
    return _aui.apply(this, arguments);
  };
  // fechar o ano: zera a barra
  const _al = ageUpLogic;
  ageUpLogic = function () {
    const r = _al.apply(this, arguments);
    try { if (r !== 'dead' && G && G.vivo) { const a = a9G(); a.p = 0; a.ms = 0; a.fontes = {}; a.n++; a.tot = (a.tot || 0) + 1; } } catch (e) { console.error(e); }
    return r;
  };
  // nova vida / carregar jogo: instala a energia única
  const _nl = newLife;
  newLife = function () { const r = _nl.apply(this, arguments); try { G.ano9 = null; a9G(); a9Install(); vrG().energia = 90; } catch (e) { console.error(e); } return r; };
  // fim da regeneração "+1 em 45 s" (agora recupera-se a comer, descansar e dormir)
  if (typeof v2RegenTick === 'function') { v2RegenTick = function () { }; v2RegenTxt = function () { return ''; }; }
  // fontes que enchem a barra
  const wrapGain = (name, k, test) => {
    if (typeof window[name] !== 'function') return; const f = window[name];
    window[name] = function () {
      const v = G && G.vr ? { fo: G.vr.fome, en: G.vr.energia } : null;
      const r = f.apply(this, arguments);
      try { if (!test || (v && G.vr && (G.vr.fome > v.fo + .5 || G.vr.energia > v.en + .5))) a9Add(k, A9.PTS[k]); } catch (e) { }
      return r;
    };
  };
  wrapGain('v3TurnoFim', 'turno'); wrapGain('v3CursoFim', 'aula');
  wrapGain('vrComer', 'comer', true); wrapGain('v3Comer', 'comer', true); wrapGain('orderFood', 'comer', true);
  // dormir: a cama enche a energia, mas não se dorme a toda a hora
  if (typeof vrDormir === 'function') {
    const _vd = vrDormir;
    vrDormir = function (sesta) {
      const v = vrG(), now = Date.now(), cd = sesta ? 3 * 60e3 : 8 * 60e3, last = sesta ? v.sestaT : v.dormT;
      if (last && now - last < cd && !vrPreso()) return toast(`😴 Ainda não tens sono. Podes ${sesta ? 'fazer outra sesta' : 'dormir outra vez'} daqui a ${a9MinTxt(cd - (now - last))}. Entretanto come alguma coisa ou descansa.`);
      const en0 = v.energia, r = _vd.apply(this, arguments);
      setTimeout(() => { try { if (v.energia > en0) { if (sesta) v.sestaT = Date.now(); else v.dormT = Date.now(); a9Add('dormir', A9.PTS.dormir); a9Hud(); } } catch (e) { } }, 1500);
      return r;
    };
  }
  // jogo ativo = conta tempo
  const mark = () => { A9.lastIn = Date.now(); };
  ['keydown', 'pointerdown', 'touchstart', 'wheel', 'mousemove'].forEach(ev => addEventListener(ev, mark, { passive: true }));
  setInterval(() => {
    try {
      if (!G || !G.vivo) return;
      a9Install();
      if (mode !== 'game' || document.hidden || (typeof dying !== 'undefined' && dying)) return;
      const ativo = Date.now() - A9.lastIn < A9.IDLE_MS || (typeof autoGo !== 'undefined' && !!autoGo);
      if (ativo || G.preso > 0) {
        const a = a9G(); a.ms += 1000;
        if (G.preso > 0) a9Add('tempo', 100 / (A9.MIN_PRESO_MS / 1000));
        else a9Add('tempo', A9.PTS.tempo / 60);
      }
      a9Hud();
      if (++A9.tick % 15 === 0) save();
    } catch (e) { }
  }, 1000);
  // estilo
  const st = document.createElement('style');
  st.textContent = `
#ageBtn.a9wait{background:linear-gradient(90deg,rgba(255,203,0,.30) var(--p,0%),rgba(255,255,255,.06) var(--p,0%)),linear-gradient(135deg,#2b2b36,#1b1b22);border-color:rgba(255,255,255,.18);box-shadow:0 6px 18px rgba(0,0,0,.4);color:#fff}
#ageBtn.a9ok{animation:a9pulse 1.6s ease-in-out infinite}
@keyframes a9pulse{0%,100%{box-shadow:0 8px 30px rgba(210,18,46,.5)}50%{box-shadow:0 0 0 6px rgba(255,77,106,.25),0 8px 34px rgba(210,18,46,.8)}}
#hEnergy .a9h{display:flex;flex-direction:column;gap:3px;min-width:74px;justify-content:center}
#hEnergy .a9bar{height:7px;border-radius:5px;background:#2a2a33;overflow:hidden}
#hEnergy .a9bar i{display:block;height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#ffcb00,#ff8a00);box-shadow:none}
#hEnergy .a9h small{font-size:10px;font-weight:800;color:#ffcb00;white-space:nowrap;line-height:1}
#hEnergy .v2rg{display:none}
.a9m{margin-top:6px}.a9row{display:flex;justify-content:space-between;font-size:13px;margin:10px 0 5px;color:#cfcfd8}.a9row b{color:#fff}
.a9big{height:12px;border-radius:8px;background:#26262e;overflow:hidden}.a9big i{display:block;height:100%;background:linear-gradient(90deg,#ffcb00,#ff8a00);border-radius:8px}
.a9big.t i{background:linear-gradient(90deg,#3fd0ff,#2a7fff)}
.a9msg{font-size:13px;line-height:1.45;color:#ddd;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px;margin:12px 0 4px}
.a9sec{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#999;margin:12px 0 6px;font-weight:800}
.a9f{display:flex;align-items:center;gap:10px;padding:7px 4px;border-bottom:1px solid rgba(255,255,255,.06)}
.a9fi{width:30px;height:30px;border-radius:9px;background:rgba(255,203,0,.12);display:flex;align-items:center;justify-content:center;flex:none}
.a9ft{flex:1;display:flex;flex-direction:column;font-size:12.5px}.a9ft small{color:#9a9aa5;font-size:11px}.a9f em{font-style:normal;font-weight:900;color:#ffcb00;font-size:13px}
#ageBtn{white-space:nowrap}
@media (max-width:440px){.hdock{gap:4px}.hdock .hbtns{gap:3px}.hdock #hEnergy{padding:3px 6px}#hEnergy .a9h{min-width:40px}#hEnergy .a9h small{font-size:9px}.hdock #ageBtn{padding:9px 8px;font-size:13px;letter-spacing:0;min-width:48px}#ageBtn .a9w{display:none}}
`;
  document.head.appendChild(st);
})();
