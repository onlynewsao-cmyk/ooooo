/* =========================================================
   APARELHOS DE VERDADE (vida7)
   · ecrã de aparelho (telemóvel, portátil, TV, relógio, leitor) por cima do jogo
   · Câmara real: traseira e selfie a partir da personagem, zoom, filtros
   · Smartwatch: passos reais do dia, ritmo cardíaco, treino guiado, notificações
   · Portátil: freelance a sério (transcrição, faturas, código), finanças, aulas, jogos
   · Smart TV: KiandaFlix (filmes), galeria no ecrã, consola; TV velha só 2 canais
   · Kiami Pod: leitor de música com roda clicável
   · Kamba IA: assistente que responde de verdade ao que perguntas
   ========================================================= */
const DV = { kind: null, onClose: null, t: null };
const dvCasa = () => (typeof inInt !== 'undefined' && inInt && inInt.loc === 'casa') || (typeof vrNearLoc === 'function' && vrNearLoc('casa', 30));
function dvOpen(kind, title, html, onClose) {
  if (DV.kind) dvClose(true);
  let o = document.getElementById('dvOv');
  if (!o) { document.body.insertAdjacentHTML('beforeend', `<div id="dvOv" class="hidden"><div id="dvBox"><div id="dvTop"><b id="dvTitle"></b><button id="dvX" onclick="dvClose()" aria-label="Fechar">✕</button></div><div id="dvBody"></div></div></div>`); o = document.getElementById('dvOv'); }
  document.getElementById('dvBox').className = 'dv-' + kind;
  document.getElementById('dvTitle').innerHTML = title; document.getElementById('dvBody').innerHTML = html;
  o.classList.remove('hidden'); DV.kind = kind; DV.onClose = onClose || null; uiBlocked = true;
  try { SND.play('tap'); } catch (e) { }
}
function dvClose(silent) {
  const o = document.getElementById('dvOv'); if (!o || !DV.kind) return;
  const f = DV.onClose; DV.onClose = null; DV.kind = null; clearInterval(DV.t); DV.t = null;
  try { f && f(); } catch (e) { console.error(e); }
  o.classList.add('hidden'); document.getElementById('dvBody').innerHTML = '';
  uiBlocked = !!panelId || modalOpen || !!phoneApp;
  if (!silent && typeof phoneApp !== 'undefined' && phoneApp) try { renderPhone(true); } catch (e) { }
}
addEventListener('keydown', e => { if (e.code === 'Escape' && DV.kind) { e.stopPropagation(); dvClose(); } }, true);

/* =========================================================
   CÂMARA — vê o mundo de verdade (traseira) ou tu (selfie)
   ========================================================= */
const CAM7 = { lado: 'tras', zoom: 1, t: null, vc: null };
function cam7Q() { return [null, null, { w: 240, h: 320, n: '13MP' }, { w: 420, h: 560, n: '200MP' }, { w: 480, h: 640, n: '48MP Pro' }, { w: 480, h: 640, n: '50MP' }][Math.max(2, Math.min(5, G.tel))]; }
function cam7Render(out, W, H, filter) {
  if (!renderer || !player || !curScene) return false;
  const S = (typeof inInt !== 'undefined' && inInt) ? 1 : BODY_S;
  if (!CAM7.vc) CAM7.vc = new T.PerspectiveCamera(60, 3 / 4, .05, 900);
  const vc = CAM7.vc, head = new T.Vector3(); player.P.head.getWorldPosition(head);
  const f = new T.Vector3(Math.sin(playerYaw), 0, Math.cos(playerYaw));
  const src = renderer.domElement, sw = src.width, sh = src.height;
  vc.aspect = sw / sh; vc.fov = (CAM7.lado === 'tras' ? 62 : 55) / CAM7.zoom; vc.updateProjectionMatrix();
  const vis = player.g.visible;
  if (CAM7.lado === 'tras') { vc.position.copy(head).addScaledVector(f, .3 * S); vc.position.y -= .05 * S; vc.lookAt(vc.position.clone().addScaledVector(f, 10).add(new T.Vector3(0, -.6, 0))); player.g.visible = false; }
  else { const r = new T.Vector3(Math.cos(playerYaw), 0, -Math.sin(playerYaw)); vc.position.copy(head).addScaledVector(f, 1.9 * S).addScaledVector(r, -.18 * S); vc.position.y += .06 * S; vc.lookAt(head.clone().add(new T.Vector3(0, -.12 * S, 0))); }
  try {
    renderer.render(curScene, vc);
    const x = out.getContext('2d'), k = Math.min(sw / W, sh / H), cw = W * k, ch = H * k;
    x.filter = filter || 'none'; x.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, W, H); x.filter = 'none';
  } finally { player.g.visible = vis; renderer.render(curScene, camera); }
  return true;
}
function cam7Tick() {
  if (phoneApp !== 'camara' || !G || G.tel < 2) { clearInterval(CAM7.t); CAM7.t = null; return; }
  const cv = document.getElementById('cam7Cv'); if (!cv) return;
  try { cam7Render(cv, cv.width, cv.height, P2_FILTROS[P2.camF][1]); } catch (e) { console.error(e); clearInterval(CAM7.t); CAM7.t = null; }
}
function cam7Snap() {
  const q = cam7Q(), out = document.createElement('canvas'); out.width = q.w; out.height = q.h;
  const vf = document.querySelector('.viewf'); if (vf) { vf.classList.remove('flash'); void vf.offsetWidth; vf.classList.add('flash'); }
  try { SND.play('shutter'); } catch (e) { }
  if (!cam7Render(out, q.w, q.h, P2_FILTROS[P2.camF][1])) return toast('📷 A câmara não conseguiu focar.');
  const x = out.getContext('2d');
  if (G.tel <= 2) { const d = x.getImageData(0, 0, q.w, q.h); for (let i = 0; i < d.data.length; i += 4) { const n = (Math.random() - .5) * 26; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } x.putImageData(d, 0, 0); }
  if (G.tel >= 4 && CAM7.lado === 'selfie') { const g = x.createRadialGradient(q.w / 2, q.h * .42, q.w * .25, q.w / 2, q.h / 2, q.w * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = g; x.fillRect(0, 0, q.w, q.h); }
  x.font = '700 11px system-ui'; x.textAlign = 'right'; x.fillStyle = 'rgba(255,255,255,.65)'; x.fillText(`${TEL_NOME[G.tel]} · ${q.n}`, q.w - 8, q.h - 8);
  const url = out.toDataURL('image/jpeg', .78), pid = 'c' + Date.now().toString(36);
  const onde = nearLoc ? 'em ' + LOC_POS[nearLoc].n : (typeof inInt !== 'undefined' && inInt && LOC_POS[inInt.loc] ? 'em ' + LOC_POS[inInt.loc].n : 'em ' + G.cidade.mun);
  G.fotos = G.fotos || []; G.fotos.unshift({ cfg: playerCfg(), bg: '#2a2028', idade: G.idade, ano: G.ano, onde, f: 0, pid, cam: CAM7.lado });
  if (G.fotos.length > 18) G.fotos.length = 18;
  const m = v5FStore(); m[pid] = url; v5FSave(m); save();
  setTimeout(() => { try { renderPhone(true); } catch (e) { } }, 280);
  toast('📸 Foto guardada na Galeria.');
}
PHONE_VIEWS.camara = () => {
  const q = cam7Q(), f0 = (G.fotos || [])[0], th = f0 ? (v5FImg(f0.pid) || avatarShot(f0.cfg, f0.bg, true)) : '';
  const zs = G.tel >= 3 ? [1, 2, 5, 10] : G.tel >= 2 ? [1, 2] : [1];
  return `${apHead('Câmara', `${TEL_NOME[G.tel]} · ${q.n}${CAM7.lado === 'selfie' ? ' · selfie' : ''}`)}
  <div class="viewf cam7"><canvas id="cam7Cv" width="${Math.round(q.w * .75)}" height="${Math.round(q.h * .75)}"></canvas><div class="vfgrid"></div><span class="vflbl">${nearLoc ? LOC_POS[nearLoc].n : G.cidade.mun}</span><span class="vfrec">${P2_FILTROS[P2.camF][0]}${CAM7.zoom > 1 ? ' · ' + CAM7.zoom + 'x' : ''}</span>
    ${zs.length > 1 && CAM7.lado === 'tras' ? `<div class="camzoom">${zs.map(z => `<button class="${z === CAM7.zoom ? 'on' : ''}" onclick="CAM7.zoom=${z};renderPhone(true)">${z}x</button>`).join('')}</div>` : ''}</div>
  <div class="cfil">${P2_FILTROS.map(([n], i) => `<button class="${i === P2.camF ? 'on' : ''}" onclick="P2.camF=${i};renderPhone(true)">${n}</button>`).join('')}</div>
  <div class="shutter"><button onclick="phoneOpen('galeria')" class="thumbb">${th ? `<img src="${th}">` : '🖼️'}</button><button class="shut" onclick="cam7Snap()" aria-label="Tirar foto"></button><button class="thumbb flip" onclick="CAM7.lado=CAM7.lado==='tras'?'selfie':'tras';CAM7.zoom=1;renderPhone(true)" title="Virar câmara">🔄</button></div>`;
};
(function () {
  const _r = renderPhone;
  renderPhone = function () {
    const r = _r.apply(this, arguments);
    try {
      const b = document.getElementById('phBody'); if (b) b.classList.toggle('camv', phoneApp === 'camara');
      if (phoneApp === 'camara' && G.tel >= 2) { cam7Tick(); if (!CAM7.t) CAM7.t = setInterval(cam7Tick, G.tel >= 3 ? 220 : 400); }
    } catch (e) { console.error(e); }
    return r;
  };
})();
/* galeria: a foto em grande também mostra a imagem real */
(function () {
  const _g = PHONE_VIEWS.galeria;
  PHONE_VIEWS.galeria = function () {
    let h = _g.apply(this, arguments);
    try { const x = (G.fotos || [])[P2.foto]; if (P2.foto != null && x && x.pid) { const u = v5FImg(x.pid); const a = avatarShot(x.cfg, x.bg, true, 360); if (u) h = h.split(a).join(u); } } catch (e) { }
    return h;
  };
})();

/* =========================================================
   SMARTWATCH
   ========================================================= */
const WT = { last: null, lastP: 0, spd: 0, bpm: 70, pg: 0 };
function wtG() { const d = typeof v6G === 'function' ? v6G().dia : 0; G.dv = G.dv || {}; const w = G.dv.w = G.dv.w || { dia: d, hoje: 0, hist: [], meta: false, treino: null, kcal: 0 }; if (w.dia !== d) { w.hist.unshift(Math.round(w.hoje)); w.hist.length = Math.min(7, w.hist.length); w.dia = d; w.hoje = 0; w.meta = false; w.kcal = 0; } return w; }
setInterval(() => {
  try {
    if (!G || !G.vivo || typeof playerPos === 'undefined') return;
    const p = player && player.g ? player.g.position : playerPos;
    if (WT.last) WT.spd = WT.spd * .6 + Math.hypot(p.x - WT.last.x, p.z - WT.last.z) * .4; WT.last = { x: p.x, z: p.z };
    const w = wtG(), dp = (G.passos || 0) - WT.lastP; WT.lastP = G.passos || 0;
    if (dp > 0 && dp < 400) { w.hoje += dp; w.kcal += dp * .045; if (w.treino) w.treino.p += dp; }
    const alvo = 62 + (100 - G.stats.saude) / 6 + Math.min(75, WT.spd * 11) + (G.doente ? 12 : 0); WT.bpm += (alvo - WT.bpm) * .25;
    if (G.bens.includes('watch')) {
      if (!w.meta && w.hoje >= 6000) { w.meta = true; const t = '⌚ Meta diária de 6 000 passos cumprida! ' + fx({ saude: 1, felicidade: 1 }); addLog(t, 'good'); toast(strip(t)); try { SND.vib && SND.vib([60, 40, 60]); SND.play('good'); } catch (e) { } save(); }
      if (w.treino) { const T_ = w.treino; T_.s = (Date.now() - T_.t0) / 1000; if (T_.p >= T_.alvo) { const t = `🏃 Treino concluído: ${Math.round(T_.p)} passos em ${Math.round(T_.s)} s. ` + fx({ saude: 2, aparencia: 1, felicidade: 1 }); w.treino = null; addLog(t, 'good'); toast(strip(t)); try { SND.play('win'); SND.vib && SND.vib([80, 50, 80]); } catch (e) { } save(); } else if (T_.s > 240) { w.treino = null; toast('⌚ O treino acabou: não chegaste aos passos. Anda mais depressa (corre com Shift ou empurra o joystick até ao fim).'); } }
      wtHud();
    } else { const h = document.getElementById('wtHud'); if (h) h.remove(); }
    if (DV.kind === 'watch') wtRender();
  } catch (e) { }
}, 1000);
function wtHud() {
  let h = document.getElementById('wtHud'); if (mode !== 'game') { if (h) h.style.display = 'none'; return; }
  if (!h) { document.body.insertAdjacentHTML('beforeend', '<button id="wtHud" onclick="wtOpen()" title="Smartwatch"><b></b><small></small><i></i></button>'); h = document.getElementById('wtHud'); }
  h.style.display = ''; const w = wtG(), pct = Math.min(1, w.hoje / 6000);
  h.querySelector('b').textContent = nowTxt(); h.querySelector('small').textContent = (w.hoje >= 1000 ? (w.hoje / 1000).toFixed(1) + 'k' : Math.round(w.hoje)) + ' passos';
  h.querySelector('i').style.background = `conic-gradient(#30d158 ${pct * 360}deg, rgba(255,255,255,.12) 0)`;
}
function wtOpen() { if (!G.bens.includes('watch')) return toast('⌚ Ainda não tens smartwatch. Compra na loja de tecnologia.'); WT.pg = 0; dvOpen('watch', 'Smartwatch', '<div class="wtface" id="wtFace"></div><div class="wtnav"><button onclick="wtPg(-1)">‹</button><span id="wtDots"></span><button onclick="wtPg(1)">›</button></div>'); wtRender(); }
function wtPg(d) { WT.pg = (WT.pg + d + 5) % 5; try { SND.play('tap'); SND.vib && SND.vib(10); } catch (e) { } wtRender(); }
function wtRender() {
  const f = document.getElementById('wtFace'); if (!f) return; const w = wtG(), pct = Math.min(1, w.hoje / 6000), bpm = Math.round(WT.bpm);
  const ring = (p, c, inner) => `<div class="wtring" style="background:conic-gradient(${c} ${p * 360}deg,#222 0)"><div>${inner}</div></div>`;
  const P = [
    () => `<div class="wtclock"><b>${nowTxt()}</b><span>${DIAS[new Date().getDay()]}, ${new Date().getDate()} ${MESES[new Date().getMonth()].slice(0, 3)}</span><div class="wtmini"><i>👟 ${Math.round(w.hoje)}</i><i>❤️ ${bpm}</i><i>🔋 ${60 + phHash(G.ano) % 40}%</i></div><em>${weather(0).t} · ${weather(0).temp}°C</em></div>`,
    () => ring(pct, '#30d158', `<b>${Math.round(w.hoje).toLocaleString('pt-PT')}</b><small>passos hoje</small><em>${(w.hoje * .72 / 1000).toFixed(2)} km · ${Math.round(w.kcal)} kcal</em><em>${w.meta ? '✅ meta cumprida' : 'meta 6 000'}</em>`) + `<div class="wtbars">${[...w.hist].reverse().concat([w.hoje]).slice(-7).map(v => `<i style="height:${Math.max(4, Math.min(100, v / 80))}%"></i>`).join('')}</div>`,
    () => `<div class="wthr"><i class="beat" style="animation-duration:${(60 / bpm).toFixed(2)}s">❤️</i><b>${bpm}</b><small>bpm ${WT.spd > 2.5 ? '· a correr' : WT.spd > .4 ? '· a andar' : '· em repouso'}</small><svg viewBox="0 0 120 30"><polyline fill="none" stroke="#ff375f" stroke-width="2" points="${Array.from({ length: 24 }, (_, i) => `${i * 5},${15 - (i % 6 === 3 ? 12 : i % 6 === 4 ? -6 : 0)}`).join(' ')}"/></svg><em>Saúde ${G.stats.saude} · ${G.doente ? 'febre detetada: vai ao hospital' : 'ritmo normal'}</em></div>`,
    () => w.treino ? ring(Math.min(1, w.treino.p / w.treino.alvo), '#ff9f0a', `<b>${Math.round(w.treino.p)}/${w.treino.alvo}</b><small>passos no treino</small><em>${Math.max(0, 240 - Math.round(w.treino.s || 0))} s restantes</em><button onclick="wtG().treino=null;wtRender()">Parar</button>`) : `<div class="wttr"><b>Treino</b><small>Caminhada rápida: dá 450 passos em 4 minutos andando pela cidade.</small><button onclick="wtTreino()">▶ Começar</button></div>`,
    () => `<div class="wtnot"><b>Notificações</b>${(G.inbox || []).slice(0, 4).map(m => `<div><i>${m.ico || '💬'}</i><span><u>${esc(m.de)}</u>${esc(String(m.txt).slice(0, 60))}</span></div>`).join('') || '<small>Sem mensagens</small>'}</div>`,
  ];
  f.innerHTML = P[WT.pg](); const d = document.getElementById('wtDots'); if (d) d.innerHTML = [0, 1, 2, 3, 4].map(i => `<i class="${i === WT.pg ? 'on' : ''}"></i>`).join('');
}
function wtTreino() { wtG().treino = { t0: Date.now(), p: 0, alvo: 450, s: 0 }; toast('🏃 Treino iniciado! Anda ou corre pela cidade: o relógio conta os passos reais.'); dvClose(); }

/* =========================================================
   KIAMI POD — leitor de música com roda
   ========================================================= */
if (!BENS.some(b => b.id === 'pod')) BENS.splice(BENS.findIndex(b => b.id === 'watch'), 0, { id: 'pod', cat: 'Tecnologia', t: 'Leitor de música Kiami Pod', ico: '🎧', p: 45000, d: 'Roda clicável e 24 músicas angolanas: ouve em qualquer lado, mesmo sem smartphone', ef: { felicidade: 2 } });
const POD = { v: 'list', sel: 0, ang: null, acc: 0 };
function podOpen() {
  if (!G.bens.includes('pod')) return toast('🎧 Ainda não tens o Kiami Pod (45.000 Kz na loja de tecnologia).');
  POD.sel = SND.RADIO.idx; POD.v = SND.RADIO.on ? 'play' : 'list';
  dvOpen('pod', 'Kiami Pod', `<div class="pod"><div class="podscr" id="podScr"></div><div class="podwh" id="podWh"><button class="pm" onclick="podBtn('menu')">MENU</button><button class="pl" onclick="podBtn('prev')">⏮</button><button class="pr" onclick="podBtn('next')">⏭</button><button class="pp" onclick="podBtn('pp')">▶</button><button class="pc" onclick="podBtn('ok')"></button></div><small class="podhelp">Roda o dedo à volta da roda para escolher (ou mudar o volume). Botão do meio = tocar.</small></div>`);
  const wh = document.getElementById('podWh');
  wh.onpointerdown = e => { if (e.target.tagName === 'BUTTON' && e.target.className !== 'pc' && false) return; const r = wh.getBoundingClientRect(); POD.ang = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2); POD.acc = 0; POD.moved = false; };
  wh.onpointermove = e => { if (POD.ang == null) return; const r = wh.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2; if (Math.hypot(dx, dy) < r.width * .2) return; const a = Math.atan2(dy, dx); let d = a - POD.ang; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; POD.ang = a; POD.acc += d; while (Math.abs(POD.acc) > .42) { const s = Math.sign(POD.acc); POD.acc -= s * .42; POD.moved = true; podScroll(s); } };
  wh.onpointerup = wh.onpointerleave = () => { POD.ang = null; };
  wh.addEventListener('click', e => { if (POD.moved) { e.stopPropagation(); e.preventDefault(); POD.moved = false; } }, true);
  podRender(); DV.t = setInterval(podRender, 500);
}
function podScroll(s) {
  try { SND.play('tap'); } catch (e) { }
  if (POD.v === 'list') { POD.sel = (POD.sel + s + SND.RADIO.TRACKS.length) % SND.RADIO.TRACKS.length; }
  else SND.setOpt('vol', Math.max(0, Math.min(1, +(SND.cfg.vol + s * .05).toFixed(2))));
  podRender();
}
function podBtn(k) {
  const R_ = SND.RADIO;
  if (k === 'menu') POD.v = POD.v === 'list' ? 'play' : 'list';
  else if (k === 'ok') { if (POD.v === 'list') { R_.play(POD.sel); POD.v = 'play'; podReward(); } else POD.v = 'list'; }
  else if (k === 'pp') { if (R_.on) R_.stop(); else { R_.play(R_.idx); podReward(); } }
  else if (k === 'next') { R_.play(R_.idx + 1); POD.sel = R_.idx; }
  else if (k === 'prev') { R_.play(R_.idx - 1); POD.sel = R_.idx; }
  podRender();
}
function podReward() { if (typeof listenMusic === 'function' && !G.musicaAno) { G.musicaAno = true; const t = '🎧 Ouviste a tua playlist no Kiami Pod. ' + fx({ felicidade: 3 }); addLog(t, 'good'); save(); refresh(); } }
function podRender() {
  const s = document.getElementById('podScr'); if (!s) return; const R_ = SND.RADIO, T_ = R_.TRACKS;
  const gn = { kizomba: 'Kizomba', semba: 'Semba', kuduro: 'Kuduro', afrohouse: 'Afro House' };
  if (POD.v === 'list') {
    const st = Math.max(0, Math.min(T_.length - 6, POD.sel - 2));
    s.innerHTML = `<div class="podh">Músicas <span>${R_.on ? '▶' : '❚❚'}</span></div>` + T_.slice(st, st + 6).map((t, i) => `<div class="podi ${st + i === POD.sel ? 'on' : ''}"><span>${esc(t.t)}</span><small>${esc(t.a)}</small></div>`).join('');
  } else {
    const t = T_[R_.idx], pos = R_.pos(), dur = R_.dur() || 1, mm = v => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
    s.innerHTML = `<div class="podh">A tocar <span>${R_.idx + 1} de ${T_.length}</span></div><div class="podnp"><div class="podart g-${t.g}"></div><b>${esc(t.t)}</b><span>${esc(t.a)}</span><small>${gn[t.g]}</small></div><div class="podpr"><i style="width:${Math.min(100, pos / dur * 100)}%"></i></div><div class="podtm"><span>${mm(pos)}</span><span>vol ${Math.round(SND.cfg.vol * 100)}%</span><span>-${mm(Math.max(0, dur - pos))}</span></div>`;
  }
}

/* =========================================================
   PORTÁTIL — Kianda OS
   ========================================================= */
const LP = { win: null };
function lpOpen() {
  if (!G.bens.includes('portatil')) return toast('💻 Ainda não tens portátil (450.000 Kz na loja de tecnologia).');
  const apps = [['free', '💼', 'Freelance'], ['aulas', '🎓', 'Aula Online'], ['jogos', '🎮', 'Jogos'], ['news', '📰', 'Notícias'], ['fin', '📊', 'Finanças'], ['mus', '🎵', 'Música']];
  dvOpen('laptop', '💻 Portátil · Kianda OS', `<div class="lpscr"><div class="lpdesk">${apps.map(([k, i, t]) => `<button onclick="lpApp('${k}')"><i>${i}</i><span>${t}</span></button>`).join('')}</div><div class="lpwin hidden" id="lpWin"><div class="lpwt"><b id="lpWT"></b><button onclick="lpApp(null)">✕</button></div><div class="lpwb" id="lpWB"></div></div><div class="lptask"><span>⊞ Kianda OS</span><span>${G.bens.includes('starlink') ? '🛰️ Céu Net' : '📶 DarkCell 4G'}</span><span id="lpClock">${nowTxt()}</span></div></div>`);
  DV.t = setInterval(() => { const c = document.getElementById('lpClock'); if (c) c.textContent = nowTxt(); }, 5000);
}
function lpApp(k) {
  const w = document.getElementById('lpWin'), b = document.getElementById('lpWB'), t = document.getElementById('lpWT'); if (!w) return;
  if (!k) { w.classList.add('hidden'); return; }
  w.classList.remove('hidden'); try { SND.play('tap'); } catch (e) { }
  if (k === 'free') { t.textContent = 'Freelance Kianda'; b.innerHTML = lpFreeMenu(); }
  else if (k === 'aulas') { t.textContent = 'Aula Online'; b.innerHTML = `<div id="auHost">${auMenu('laptop')}</div>`; AU.dev = 'lp'; }
  else if (k === 'jogos') { t.textContent = 'Jogos'; b.innerHTML = `<div class="list">${btnItem('♟️', 'Xadrez', 'Partida completa · 1 energia', '', "dvClose();gmStart('xadrez',{dev:'laptop'})")}${btnItem('🔫', 'Free Fire', 'Booyah e torneios · 1 energia', '', "dvClose();gmStart('freefire',{dev:'laptop'})")}${btnItem('⚽', 'EA FC · Penáltis', '1 energia', '', "dvClose();gmStart('fifa',{dev:'laptop'})")}${btnItem('🐍', 'Cobrinha', '1 energia', '', "dvClose();gmStart('cobra',{dev:'laptop'})")}</div>`; }
  else if (k === 'news') { t.textContent = 'Navegador · notícias'; let N = []; try { N = p2News(); } catch (e) { } b.innerHTML = N.map(([s, a]) => `<div class="apsec">${s}</div>` + a.filter(Boolean).map(n => `<details class="lpnews"><summary>${n.ico} ${n.t}</summary><p>${n.b}</p></details>`).join('')).join(''); if (!G.noticiasAno && typeof readNews === 'function') readNews(); }
  else if (k === 'fin') { t.textContent = 'Finanças pessoais'; b.innerHTML = lpFin(); }
  else if (k === 'mus') { t.textContent = 'Música'; const R_ = SND.RADIO; b.innerHTML = `<div class="list">${R_.TRACKS.map((x, i) => btnItem(i === R_.idx && R_.on ? '🔊' : '🎵', x.t, x.a, '', `SND.RADIO.play(${i});lpApp('mus')`)).join('')}</div><button class="pbtn" onclick="SND.RADIO.stop();lpApp('mus')">❚❚ Parar</button>`; }
}
function lpFin() {
  const cv = custoVida(), sal = G.emprego ? salario(G.emprego) : 0, part = G.part ? salario(G.part) : 0;
  let cont = { mes: 0, total: 0, linhas: [] }; try { cont = v6Contas(); } catch (e) { }
  const neg = (G.negocios || []).length, inv = G.inv || {};
  const row = (l, v, c) => `<tr><td>${l}</td><td style="color:${c || '#fff'}">${kz(Math.round(v))}</td></tr>`;
  const saldoAno = sal + part - cv.c - (cont.total || 0);
  return `<table class="lpfin">${row('💰 Saldo atual', G.dinheiro, '#ffcb00')}${row('💼 Salário anual', sal, '#2ecc71')}${part ? row('⏱ Part-time', part, '#2ecc71') : ''}${row('🏠 Custo de vida anual', -cv.c, '#ff6b6b')}${cont.total ? row('🧾 Contas da casa (ano)', -cont.total, '#ff6b6b') : ''}${row('📈 Investido', (inv.bodiva || 0) + (inv.cripto || 0) + (inv.dolar || 0))}${row('= Balanço do ano', saldoAno, saldoAno >= 0 ? '#2ecc71' : '#ff6b6b')}</table>
    <div class="lpbar"><i style="width:${Math.min(100, sal ? cv.c / Math.max(1, sal) * 100 : 100)}%"></i></div><p class="apnote">Gastas ${sal ? Math.round(cv.c / sal * 100) : '—'}% do salário em custo de vida (${cv.det.join(', ') || 'nada'}). ${neg ? `Tens ${neg} negócio(s).` : ''} ${saldoAno < 0 ? 'Atenção: este ano vais gastar mais do que ganhas.' : 'Estás a poupar.'}</p>`;
}
/* freelance a sério */
const LP_FRASES = ['A reunião com o cliente do Talatona foi adiada para quinta-feira às dez horas.', 'O relatório de vendas do mês de março mostra um crescimento de doze por cento.', 'Solicitamos o envio da fatura proforma até ao final do dia de hoje.', 'A entrega das encomendas no Kilamba será feita por estafeta na parte da manhã.', 'O candidato tem experiência em atendimento ao cliente e fala inglês fluente.', 'Os preços dos produtos da cesta básica subiram no mercado do Roque Santeiro.', 'A obra da nova escola no Cazenga deve terminar antes do início do ano letivo.', 'Confirmo a receção do pagamento e agradeço a preferência pelos nossos serviços.'];
const LP_COD = [
  { t: 'Somar o preço com IVA', l: ['let preco = 1000;', 'let iva = preco * 0.14;', 'let total = preco - iva;', 'mostrar(total);'], b: 2, e: 'O total com IVA é preço + IVA, não menos.' },
  { t: 'Verificar maioridade', l: ['function adulto(idade) {', '  if (idade > 18) return true;', '  return false;', '}'], b: 1, e: 'Quem tem 18 já é adulto: devia ser >= 18.' },
  { t: 'Contar produtos', l: ['let n = 0;', 'for (let i = 0; i < lista.length; i--) {', '  n = n + 1;', '}'], b: 1, e: 'i-- nunca acaba o ciclo: devia ser i++.' },
  { t: 'Mostrar o nome', l: ['let nome = "Ana";', 'let msg = "Olá " + Nome;', 'mostrar(msg);', '// fim'], b: 1, e: '"Nome" com maiúscula não existe: a variável é "nome".' },
  { t: 'Desconto de 10%', l: ['let preco = 5000;', 'let desconto = preco * 10;', 'let final = preco - desconto;', 'mostrar(final);'], b: 1, e: '10% é preco * 0.10, não * 10.' },
  { t: 'Média de notas', l: ['let soma = n1 + n2 + n3;', 'let media = soma / 2;', 'if (media >= 10) aprovado();', 'else reprovado();'], b: 1, e: 'São 3 notas: divide por 3.' },
];
function lpFreeG() { const d = typeof v6G === 'function' ? v6G().dia : 0; G.dv = G.dv || {}; const f = G.dv.free = G.dv.free || { dia: d, n: 0, ganho: 0 }; if (f.dia !== d) { f.dia = d; f.n = 0; } return f; }
function lpMult() { let m = 1; if (G.emprego && ['freelancer', 'devapps', 'gestorredes'].includes(G.emprego.id)) m *= 1.5; if ((G.aulas && G.aulas.certs || []).includes('cinfo')) m *= 1.3; if (G.bens.includes('starlink')) m *= 1.1; return m; }
function lpFreeMenu() {
  const f = lpFreeG(), left = 3 - f.n, cod = G.stats.inteligencia >= 55 || (G.emprego && ['devapps', 'freelancer'].includes(G.emprego.id));
  return `<div class="apok">💼 Trabalhos de hoje: ${left > 0 ? left + ' de 3 disponíveis' : 'acabaram (volta amanhã no jogo)'} · multiplicador ×${lpMult().toFixed(2)}</div>
  <div class="list">${btnItem('🎧', 'Transcrição de áudio', 'Escreve o texto sem erros e depressa · paga por precisão', 'até ' + kzShort(15000 * lpMult()), 'lpFree(\'tx\')', left <= 0)}${btnItem('🧾', 'Fatura para cliente', 'Calcula o total com IVA de 14%', kzShort(9000 * lpMult()), 'lpFree(\'fat\')', left <= 0)}${btnItem('🧑‍💻', 'Corrigir código', cod ? 'Encontra a linha com erro' : 'Precisas de inteligência 55 ou emprego digital', kzShort(14000 * lpMult()), 'lpFree(\'cod\')', left <= 0 || !cod)}</div>
  <p class="apnote">Cada trabalho gasta 1 energia. O cliente só paga se o trabalho estiver bem feito. Ganhaste hoje: ${kz(f.ganho || 0)}.</p>`;
}
function lpFree(k) {
  if (lpFreeG().n >= 3) return toast('Já fizeste os 3 trabalhos de hoje.'); if (!canAct()) return; G.acoes--; lpFreeG().n++; save(); refresh();
  const b = document.getElementById('lpWB'); LP.task = { k, t0: 0 };
  if (k === 'tx') { const fr = pick(LP_FRASES); LP.task.fr = fr; b.innerHTML = `<div class="lptask2"><b>🎧 Transcreve o áudio do cliente:</b><div class="lpfrase">${fr}</div><textarea id="lpIn" rows="3" placeholder="Escreve aqui exatamente a frase…" oninput="if(!LP.task.t0)LP.task.t0=Date.now()" autocomplete="off" spellcheck="false"></textarea><button class="pbtn" onclick="lpEntregar()">Entregar ao cliente</button></div>`; setTimeout(() => { const i = document.getElementById('lpIn'); if (i) i.focus(); }, 50); }
  else if (k === 'fat') { const it = Array.from({ length: 3 }, () => ({ n: pick(['Resma de papel A4', 'Tinteiro', 'Cadeira de escritório', 'Pen drive 32GB', 'Rato sem fios', 'Cabo HDMI', 'Caixa de canetas']), q: R(1, 5), p: R(2, 18) * 500 })); const sub = it.reduce((s, x) => s + x.q * x.p, 0); LP.task.ok = Math.round(sub * 1.14); b.innerHTML = `<div class="lptask2"><b>🧾 Fatura · Papelaria Mutamba Lda</b><table class="lpfin">${it.map(x => `<tr><td>${x.q} × ${x.n}</td><td>${kz(x.p)}</td></tr>`).join('')}<tr><td>IVA</td><td>14%</td></tr></table><input id="lpIn" type="number" inputmode="numeric" placeholder="Total com IVA (Kz)"><button class="pbtn" onclick="lpEntregar()">Enviar fatura</button></div>`; }
  else { const c = pick(LP_COD); LP.task.c = c; b.innerHTML = `<div class="lptask2"><b>🧑‍💻 ${c.t}: toca na linha com erro</b><div class="lpcode">${c.l.map((l, i) => `<button onclick="lpEntregar(${i})"><u>${i + 1}</u>${esc(l)}</button>`).join('')}</div></div>`; }
}
function lpEntregar(i) {
  const T_ = LP.task, b = document.getElementById('lpWB'); if (!T_) return; LP.task = null; let pay = 0, msg = '';
  if (T_.k === 'tx') {
    const v = (document.getElementById('lpIn').value || '').trim(), a = T_.fr; let ok = 0; for (let j = 0; j < a.length; j++) if (v[j] === a[j]) ok++;
    const acc = ok / Math.max(a.length, v.length || 1), secs = Math.max(4, (Date.now() - (T_.t0 || Date.now())) / 1000), wpm = (v.length / 5) / (secs / 60);
    pay = acc < .6 ? 0 : Math.round(Math.min(15000, 4000 * acc * acc * (1 + Math.min(1.8, wpm / 35))) * lpMult());
    msg = `Precisão ${Math.round(acc * 100)}% · ${Math.round(wpm)} palavras/min. ${pay ? 'O cliente aprovou.' : 'O cliente recusou: demasiados erros.'}`;
  } else if (T_.k === 'fat') { const v = +document.getElementById('lpIn').value; const ok = Math.abs(v - T_.ok) <= 1; pay = ok ? Math.round(9000 * lpMult()) : 0; msg = ok ? 'Fatura certa! O cliente pagou.' : `Errado: o total era ${kz(T_.ok)}. O cliente devolveu a fatura.`; }
  else { const ok = i === T_.c.b; pay = ok ? Math.round(14000 * lpMult()) : 0; msg = ok ? 'Bug corrigido! ' + T_.c.e : 'Não era essa linha. ' + T_.c.e; }
  const f = lpFreeG(); f.ganho = (f.ganho || 0) + pay;
  const txt = `💻 Freelance: ${msg} ` + (pay ? fx({ dinheiro: pay, inteligencia: chance(.4) ? 1 : 0 }) : fx({ felicidade: -1 }));
  after(txt, pay ? 'good' : '', 'think');
  b.innerHTML = `<div class="aufim"><div class="auscore">${pay ? '+' + kzShort(pay) : '0 Kz'}</div><p>${esc(msg)}</p><button class="pbtn" onclick="lpApp('free')">Voltar</button></div>`;
}

/* =========================================================
   SMART TV / TV VELHA / CONSOLA
   ========================================================= */
const FLIX = [
  { t: 'Amor no Candongueiro', g: 'Comédia romântica · 2026', d: 'Um cobrador de candongueiro apaixona-se pela passageira que nunca tem troco.', sc: [['dia', ['#c8102e', '#ffcb00'], 'KIANDAFLIX apresenta: AMOR NO CANDONGUEIRO'], ['dia', ['#1f63c9', '#e1306c'], '— Mutamba, Mutamba! Minha senhora, tem troco?'], ['dia', ['#1f63c9', '#e1306c'], '— Só tenho nota de cinco mil… outra vez.'], ['tarde', ['#1f63c9', '#e1306c'], '— Então paga-me com um sorriso. Hoje é por conta da casa.'], ['noite', ['#1f63c9', '#e1306c'], 'Um ano depois, o candongueiro tinha um novo letreiro: "Só Amor".'], ['noite', ['#ffcb00', '#c8102e'], 'FIM']] },
  { t: 'O Último Kota do Semba', g: 'Drama musical · 2025', d: 'Um velho músico do Marçal ensina o neto a tocar antes do último concerto.', sc: [['tarde', ['#6a1b9a', '#ffcb00'], 'KIANDAFLIX apresenta: O ÚLTIMO KOTA DO SEMBA'], ['tarde', ['#5a3825', '#2e8b57'], '— Avô, para que serve esta guitarra velha?'], ['noite', ['#5a3825', '#2e8b57'], '— Serve para lembrar. O semba conta a nossa história, neto.'], ['noite', ['#5a3825', '#2e8b57'], 'No Marçal, o bairro inteiro parou para ouvir os dois tocarem.'], ['noite', ['#2e8b57', '#ffcb00'], '— Agora a história é tua. Toca-a bem alto.'], ['noite', ['#ffcb00', '#6a1b9a'], 'FIM']] },
  { t: 'Kianda: a Lenda da Ilha', g: 'Fantasia · 2027', d: 'Uma pescadora da Ilha de Luanda descobre que a sereia Kianda existe mesmo.', sc: [['dia', ['#0096c7', '#ffcb00'], 'KIANDAFLIX apresenta: KIANDA, A LENDA DA ILHA'], ['praia', ['#0096c7', '#c8102e'], 'Todas as manhãs, a Nzinga deixava flores no mar para a Kianda.'], ['praia', ['#0096c7', '#00c2a8'], '— Porque me dás flores, menina? — perguntou uma voz vinda das ondas.'], ['tarde', ['#0096c7', '#00c2a8'], '— Para que o mar devolva sempre os nossos pescadores.'], ['noite', ['#0096c7', '#00c2a8'], 'Nessa noite, os barcos voltaram todos, carregados de peixe.'], ['noite', ['#00c2a8', '#ffcb00'], 'FIM']] },
];
function flixDraw(x, W, H, n, t) {
  const F = FLIX[n], k = Math.floor(t / 7) % F.sc.length, [cena, cols, sub] = F.sc[k], lt = t % 7;
  const sky = { dia: ['#6fc3ff', '#d9f1ff'], tarde: ['#ff9a5a', '#ffd9a0'], noite: ['#0b1340', '#33356b'], praia: ['#4fb5ff', '#bfe9ff'] }[cena];
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = cena === 'noite' ? '#f4f0d0' : '#ffe28a'; x.beginPath(); x.arc(W * .8, H * .2, cena === 'noite' ? 34 : 46, 0, 7); x.fill();
  if (cena === 'praia') { x.fillStyle = '#1e7fc4'; x.fillRect(0, H * .55, W, H * .2); for (let i = 0; i < 12; i++) { x.strokeStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc((i * 90 + t * 30) % (W + 90) - 45, H * .6 + (i % 3) * 18, 20, Math.PI, 0); x.stroke(); } x.fillStyle = '#f0d9a0'; x.fillRect(0, H * .75, W, H * .25); }
  else { for (let i = 0; i < 9; i++) { x.fillStyle = cena === 'noite' ? '#1a1d3a' : '#8a8f9a'; const bh = 110 + (i * 53) % 150; x.fillRect(i * 110 - 10, H * .72 - bh, 96, bh); if (cena === 'noite') { x.fillStyle = '#ffd36b'; for (let j = 0; j < 6; j++) if ((i + j) % 3) x.fillRect(i * 110 + 6 + (j % 3) * 28, H * .72 - bh + 14 + Math.floor(j / 3) * 34, 14, 18); } } x.fillStyle = cena === 'noite' ? '#2a2a33' : '#5d5d66'; x.fillRect(0, H * .72, W, H * .28); x.fillStyle = '#ffcb00'; for (let i = 0; i < 10; i++) x.fillRect(i * 110 + ((t * 60) % 110), H * .85, 50, 6); }
  if (k === 0 || k === F.sc.length - 1) { x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, W, H); gmTxt(x, k === 0 ? 'KIANDAFLIX' : 'FIM', W / 2, H / 2 - 30, { s: 64, w: 900, c: '#e50914' }); gmTxt(x, k === 0 ? F.t.toUpperCase() : 'Obrigado por assistires', W / 2, H / 2 + 40, { s: 30, c: '#fff' }); return; }
  cols.forEach((c, i) => { const cx = W * (.38 + i * .24), bob = Math.sin(t * 4 + i) * 4, ty = H * .74; const talk = (Math.floor(lt * 2) % 2 === i % 2);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(cx, ty + 4, 46, 10, 0, 0, 7); x.fill();
    x.fillStyle = c; gmRR(x, cx - 34, ty - 150 + bob, 68, 100, 22); x.fill(); x.fillStyle = '#222'; x.fillRect(cx - 26, ty - 54, 20, 54); x.fillRect(cx + 6, ty - 54, 20, 54);
    x.fillStyle = '#5a3825'; x.beginPath(); x.arc(cx, ty - 180 + bob, 38, 0, 7); x.fill(); x.fillStyle = '#141010'; x.beginPath(); x.arc(cx, ty - 196 + bob, 36, Math.PI, 0); x.fill();
    x.fillStyle = '#fff'; [[-13], [13]].forEach(([d]) => { x.beginPath(); x.arc(cx + d, ty - 184 + bob, 8, 0, 7); x.fill(); }); x.fillStyle = '#111'; [[-13], [13]].forEach(([d]) => { x.beginPath(); x.arc(cx + d + (i ? -2 : 2), ty - 184 + bob, 4, 0, 7); x.fill(); });
    x.fillStyle = '#7a1a1a'; x.beginPath(); x.ellipse(cx, ty - 162 + bob, 10, talk ? 7 : 2, 0, 0, 7); x.fill(); });
  x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(W * .08, H - 92, W * .84, 62); x.font = '700 30px system-ui'; x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText(sub, W / 2, H - 52, W * .8);
}
function galDraw(x, W, H, t) {
  const f = (G.fotos || []).filter(p => p.pid && v5FImg(p.pid)); x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  if (!f.length) { gmTxt(x, 'Ainda não tens fotos: usa a câmara do telemóvel', W / 2, H / 2, { s: 30 }); return; }
  const i = Math.floor(t / 4) % f.length, k = 'g' + f[i].pid; galDraw.c = galDraw.c || {};
  if (!galDraw.c[k]) { const im = new Image(); im.src = v5FImg(f[i].pid); galDraw.c[k] = im; }
  const im = galDraw.c[k]; if (im.complete && im.naturalWidth) { const s = Math.min(W / im.naturalWidth, H / im.naturalHeight) * (1 + (t % 4) * .02); x.drawImage(im, (W - im.naturalWidth * s) / 2, (H - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s); }
  x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, H - 50, W, 50); gmTxt(x, `${f[i].idade} anos · ${f[i].onde} · ${f[i].ano}`, W / 2, H - 25, { s: 22 });
}
(function () {
  if (typeof lvDrawTV !== 'function') return;
  const _d = lvDrawTV; lvDrawTV = function (x, w, h, chId, t) {
    if (typeof chId === 'string' && chId.startsWith('flix:')) return flixDraw(x, w, h, +chId.slice(5), t);
    if (chId === 'gal') return galDraw(x, w, h, t);
    const r = _d.apply(this, arguments);
    if (typeof MU !== 'undefined' && MU.watchSpot && MU.watchSpot.n === 'A TV da tua casa' && !G.bens.includes('smarttv')) { for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .18})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } x.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < h; y += 4) x.fillRect(0, y, w, 1); }
    return r;
  };
  const _r = muTvRender; muTvRender = function () {
    try { const sp = MU.watchSpot || {}, casa = sp.n === 'A TV da tua casa', smart = G.bens.includes('smarttv'), w = String(LIVE.watch || '');
      if ((w.startsWith('flix:') || w === 'gal') && !(casa && smart)) LIVE.watch = 'tj';
      if (casa && !smart && !['tj', 'desp'].includes(LIVE.watch)) LIVE.watch = 'tj'; } catch (e) { }
    const r = _r.apply(this, arguments);
    try {
      const sp = MU.watchSpot || {}; if (sp.n !== 'A TV da tua casa') return r;
      const chs = document.getElementById('tvvChs'), smart = G.bens.includes('smarttv');
      if (!smart) { chs.innerHTML = lvTvChBtns(LIVE.watch, 'muTvSet').replace(/<button[^>]*onclick="muTvSet\('(nov|mus)'\)"[\s\S]*?<\/button>/g, '') + `<p class="apnote">📺 TV velha de tubo: só apanha 2 canais e com chuvisco. Uma Smart TV 4K dá todos os canais, a KiandaFlix, a galeria e a consola.</p>`; return r; }
      chs.innerHTML += `<div class="apsec">KiandaFlix</div><div class="tvchs">${FLIX.map((f, i) => `<button class="${LIVE.watch === 'flix:' + i ? 'on' : ''}" style="--c:#e50914" onclick="muTvSet('flix:${i}')"><b>${f.t}</b><small>${f.g}</small></button>`).join('')}<button class="${LIVE.watch === 'gal' ? 'on' : ''}" style="--c:#118ab2" onclick="muTvSet('gal')"><b>As minhas fotos</b><small>Galeria no ecrã grande</small></button>${G.bens.includes('ps5') ? `<button style="--c:#7b2cbf" onclick="muTvClose();tvConsola()"><b>KZ Station 5</b><small>Jogar no ecrã grande</small></button>` : ''}</div>`;
      if (String(LIVE.watch).startsWith('flix:')) { const F = FLIX[+LIVE.watch.slice(5)]; document.getElementById('tvvSub').textContent = 'KiandaFlix · ' + F.t; document.getElementById('tvvInfo').innerHTML = `<p class="apnote"><b>${F.t}</b> · ${F.g}<br>${F.d}</p>`; if (!G.dv || G.dv.flix !== G.ano) { G.dv = G.dv || {}; G.dv.flix = G.ano; fx({ felicidade: 3 }); save(); refresh(); toast('🎬 Sessão de cinema em casa: +3 felicidade'); } }
      if (LIVE.watch === 'gal') { document.getElementById('tvvSub').textContent = 'As minhas fotos · apresentação'; document.getElementById('tvvInfo').innerHTML = '<p class="apnote">As fotos que tiras com a câmara do telemóvel passam aqui em apresentação.</p>'; }
    } catch (e) { console.error(e); }
    return r;
  };
})();
(function () { const _s = muTvSet; muTvSet = function (id) { if (String(id).startsWith('flix:') || id === 'gal') { LIVE.watch = id; try { SND.play('tvon'); } catch (e) { } return muTvRender(); } return _s.apply(this, arguments); }; })();
function tvConsola() {
  if (!G.bens.includes('ps5')) return toast('🎮 Ainda não tens a KZ Station 5.');
  if (!dvCasa()) return toast('🏠 A consola está ligada à TV da tua casa.');
  dvOpen('tv', '🎮 KZ Station 5', `<div class="cons"><div class="consh">Escolhe um jogo</div><div class="gcards">${[['corrida', 'Kianda Racing', '#c8102e'], ['fifa', 'EA FC · Penáltis', '#1f63c9'], ['freefire', 'Free Fire', '#e85d04'], ['xadrez', 'Xadrez', '#2e7d32'], ['cobra', 'Cobrinha', '#6a1b9a']].map(([id, t, c]) => `<button onclick="dvClose();gmStart('${id}',{dev:'tv'})" style="background:linear-gradient(135deg,${c},#111)"><b>${t}</b><small>Ecrã grande · +3 felicidade</small></button>`).join('')}</div></div>`);
}

/* =========================================================
   KAMBA IA — responde de verdade
   ========================================================= */
const IA7 = { log: [] };
const iaN = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function iaResp(q0) {
  const q = iaN(q0), has = (...w) => w.some(k => q.includes(k));
  try {
    const m = q.replace(/,/g, '.').match(/(?:quanto (?:e|da|sao)|calcula)?\s*([-\d.\s+*/()x%]{3,})\??$/);
    if (m && /\d\s*[-+*/x]\s*\d/.test(m[1])) { const e = m[1].replace(/x/g, '*').replace(/%/g, '/100'); if (/^[\d.\s+\-*/()]+$/.test(e)) { const v = Function('return (' + e + ')')(); if (isFinite(v)) return `${m[1].trim()} = <b>${(+v.toFixed(4)).toLocaleString('pt-PT')}</b>`; } }
  } catch (e) { }
  if (/^(ola|oi|bom dia|boa tarde|boa noite|mbote|hey|ei)\b/.test(q.trim())) return `Olá ${esc(G.nome.split(' ')[0])}! Pergunta-me sobre dinheiro, empregos, documentos, saúde, o Girabola, o dólar, o tempo ou faz contas.`;
  if (has('piada', 'anedota', 'rir')) return pick(['O candongueiro disse "cabe mais um"… e era o quinto no banco de trás. 😂', 'Em Luanda não há trânsito: há estacionamento em movimento. 🚗', 'A ENDE avisou que vai haver luz amanhã. A população preparou-se… com velas, por precaução. 🕯️', 'O meu primo diz que é "empresário": vende saldo na esquina e chama-lhe "telecomunicações". 📱']);
  if (has('obrigad')) return 'De nada! Estou aqui sempre que precisares. 😊';
  if (has('quem es', 'o que es', 'o que fazes')) return 'Sou a Kamba IA, a assistente do teu telemóvel. Leio a tua vida no jogo (saldo, documentos, saúde, emprego) e dou-te respostas concretas.';
  if (has('hora')) return `São <b>${nowTxt()}</b> de ${dateTxt()}.`;
  if (has('tempo', 'chuva', 'calor', 'clima')) { const w = weather(0), a = weather(1); return `Em ${G.cidade.prov}: <b>${w.t}, ${w.temp}°C</b>. Amanhã: ${a.t}, ${a.temp}°C.${typeof v6Chuvas === 'function' && v6Chuvas() ? ' É época das chuvas: cuidado com o paludismo e as ruas alagadas.' : ''}`; }
  if (has('saldo', 'dinheiro', 'kumbu', 'quanto tenho')) { const cv = custoVida(); return `Tens <b>${kz(G.dinheiro)}</b>. O teu custo de vida é ${kz(cv.c)} por ano${G.emprego ? ` e ganhas ${kz(salario(G.emprego))} por ano como ${esc(jobTitle(G.emprego))}` : ', e estás sem emprego'}.`; }
  if (has('emprego', 'trabalh', 'ganhar', 'vaga', 'salario')) { const ok = JOBS.filter(j => !reqOk(j.req).length).sort((a, b) => b.sal - a.sal).slice(0, 3); return ok.length ? `Com o teu perfil podes concorrer a: ${ok.map(j => `<b>${j.t}</b> (~${kzShort(j.sal * (j.informal ? 1 : cid().sal))}/ano)`).join(', ')}. Vai ao Centro de Emprego ou à app Emprego Já.${typeof v6DocOk === 'function' && !v6DocOk('bi') ? ' ⚠️ Sem BI não consegues emprego com contrato: trata no SIAC.' : ''}` : 'Ainda não cumpres requisitos para vagas. Estuda (Aula Online, universidade) ou faz biscates na app Turno Já.'; }
  if (has(' bi', 'bilhete', 'documento', 'passaporte', 'nif', 'registo', 'siac', 'eleitor')) { try { const v = v6G(); return 'Os teus documentos: ' + Object.entries(V6_DOCS).slice(0, 6).map(([id, d]) => `${d.t}: <b>${v6DocOk(id) ? 'tens ✅' : v6Proc(id) ? 'em tratamento ⏳' : 'não tens'}</b>`).join(' · ') + '. Trata no SIAC (Mutamba) ou agenda no SIAC Digital (app Dia a Dia).'; } catch (e) { return 'Os documentos tratam-se no SIAC, na Mutamba.'; } }
  if (has('doente', 'febre', 'paludismo', 'malaria', 'saude', 'hospital')) { let s = `A tua saúde está em <b>${G.stats.saude}/100</b>.`; try { const v = v6G(); if (v.mal) s += ' ⚠️ Tens sinais de paludismo: vai ao Hospital Geral Kianda fazer o teste (é grátis).'; s += v.casa.mosq ? ' Tens mosquiteiro, boa!' : ' Compra um mosquiteiro na farmácia (reduz muito o risco).'; } catch (e) { } if (G.doente) s += ' Estás doente: marca consulta.'; return s; }
  if (has('girabola', 'jogo', 'futebol', 'petro', 'agosto')) { try { const sl = Math.floor(Date.now() / V6_SLOT), J = v6Jogo(sl + 1), L = v6Jogo(sl - 1), mins = Math.ceil(((sl + 1) * V6_SLOT - Date.now()) / 60000); return `Último jogo: ${L.h} <b>${L.gh}-${L.ga}</b> ${L.a}. Próximo: <b>${J.h} vs ${J.a}</b> daqui a ${mins} min, no Ginásio & Campo.`; } catch (e) { return 'Vê o Girabola ao vivo no Ginásio & Campo.'; } }
  if (has('dolar', 'cambio', 'kinguila', 'euro')) { try { const T_ = v6Taxa(); return `Hoje: banco <b>${T_.of} Kz</b> por dólar, kinguilas <b>${T_.rua} Kz</b>. ${T_.divisas ? 'Os bancos têm divisas.' : 'Os bancos estão sem divisas hoje.'}`; } catch (e) { return 'O câmbio vê-se nas kinguilas do mercado.'; } }
  if (has('conta', 'luz', 'agua', 'ende', 'epal', 'gas')) { try { const c = v6Contas(); return c.mes ? `As contas da casa somam <b>${kz(c.mes)}/mês</b> (${kz(c.total)}/ano): ${c.linhas.map(l => l[1]).slice(0, 4).join(', ')}.` : 'Ainda não tens contas de casa (vives com a família ou na rua).'; } catch (e) { return 'As contas estão no separador Contas da casa.'; } }
  if (has('casa', 'renda', 'morar', 'arrendar')) { const b = CASAS.filter(c => c.renda).sort((a, b) => a.renda - b.renda).slice(0, 2); return `Vives em: <b>${G.casa.tipo === 'rua' ? 'na rua' : G.casa.tipo === 'pais' ? 'casa da família' : esc(casaT(G.casa.id).t)}</b>. As rendas mais baratas: ${b.map(c => `${c.t} (${kzShort(c.renda * cid().custo)}/ano)`).join(', ')}. Vê na app Casa Já.`; }
  if (has('estud', 'universidade', 'curso', 'faculdade', 'aula')) return `Na <b>Aula Online</b> tens vídeo-aulas grátis com teste e cursos certificados (25 mil Kz) que aumentam o salário. Na app <b>Uni Angola</b> vês as universidades da tua província.${G.estudo ? ` Estás a estudar ${esc(G.estudo.t)}.` : ''}`;
  if (has('energia', 'cansad')) return `Tens <b>${Math.round(G.vr ? G.vr.energia : 0)}/100</b> de energia (cada ação gasta 10). Recupera a comer, a descansar e a dormir em casa.`;
  if (has('conselho', 'dica', 'ajuda', 'o que faco')) return aiTips().slice(0, 2).join('<br>');
  return `Não percebi bem. Experimenta: "quanto tenho?", "que emprego posso ter?", "preciso de BI?", "como está o dólar?", "próximo jogo do Girabola" ou "quanto é 15000*12".`;
}
function iaSend(txt) {
  const i = document.getElementById('iaIn'); const q = (txt || (i && i.value) || '').trim(); if (!q) return;
  IA7.log.push({ me: 1, t: esc(q) }); IA7.log.push({ me: 0, t: '…', wait: 1 }); if (i) i.value = ''; renderPhone(true);
  setTimeout(() => { const L = IA7.log[IA7.log.length - 1]; L.wait = 0; L.t = iaResp(q); if (IA7.log.length > 30) IA7.log.splice(0, IA7.log.length - 30); try { SND.play('notif'); } catch (e) { } if (phoneApp === 'ia') { renderPhone(true); const b = document.getElementById('phBody'); if (b) b.scrollTop = 1e6; } }, 650);
}
PHONE_VIEWS.ia = () => {
  const sug = ['Quanto tenho?', 'Que emprego posso ter?', 'Preciso de BI?', 'Como está o dólar?', 'Próximo jogo do Girabola', 'Conta uma piada'];
  return apHead('Kamba IA', 'Assistente inteligente', '<span class="aibadge">IA</span>') + `<div class="aichat"><div class="bub in">Olá ${esc(G.nome.split(' ')[0])}! Sou a Kamba IA. Pergunta-me qualquer coisa sobre a tua vida no jogo.</div>${IA7.log.map(m => `<div class="bub ${m.me ? 'out' : 'in'}${m.wait ? ' typing' : ''}">${m.t}</div>`).join('')}</div>
    <div class="iasug">${sug.map(s => `<button onclick="iaSend('${s}')">${s}</button>`).join('')}</div>
    <div class="iabar"><input id="iaIn" placeholder="Escreve a tua pergunta…" onkeydown="if(event.key==='Enter'){event.preventDefault();iaSend()}" autocomplete="off"><button onclick="iaSend()">➤</button></div>`;
};

/* =========================================================
   OS MEUS APARELHOS (menu, casa e telemóvel)
   ========================================================= */
function dvLista() {
  const has = id => G.bens.includes(id), casa = dvCasa();
  const it = (ico, t, d, ok, fn, btn) => btnItem(ico, t, d, ok ? btn || 'Usar' : '', ok ? fn : '', !ok);
  return `<div class="list">
    ${it('📱', G.tel ? TEL_NOME[G.tel] : 'Telemóvel', G.tel >= 2 ? 'Câmara real, apps, jogos, Kamba IA' + (G.tel >= 3 ? ', zoom 10x' : '') : G.tel ? 'Chamadas, SMS e Cobrinha' : 'Ainda não tens', G.tel > 0, "closeModal();closePanel();openPhone()", 'Abrir')}
    ${it('⌚', 'Smartwatch', has('watch') ? 'Passos de hoje, coração, treino, notificações' : 'Compra na loja (150 mil Kz)', has('watch'), "closeModal();closePanel();wtOpen()", 'Ver')}
    ${it('💻', 'Portátil', has('portatil') ? 'Freelance a sério, aulas, finanças, jogos' : 'Compra na loja (450 mil Kz)', has('portatil'), "closeModal();closePanel();lpOpen()", 'Ligar')}
    ${it('🎧', 'Kiami Pod', has('pod') ? 'Leitor de música com roda clicável' : 'Compra na loja (45 mil Kz)', has('pod'), "closeModal();closePanel();podOpen()", 'Ouvir')}
    ${it('📺', has('smarttv') ? 'Smart TV 4K' : 'TV velha de casa', casa ? (has('smarttv') ? 'Canais, KiandaFlix, fotos e consola' : '2 canais com chuvisco') : 'Só em casa', casa, "closeModal();closePanel();muWatch({n:'A TV da tua casa',ch:null})", 'Ver TV')}
    ${it('🎮', 'KZ Station 5', has('ps5') ? (casa ? 'Joga no ecrã grande (+3 felicidade)' : 'Só em casa') : 'Compra na loja (650 mil Kz)', has('ps5') && casa, "closeModal();closePanel();tvConsola()", 'Jogar')}
    ${has('starlink') ? infoItem('🛰️', 'Céu Net (satélite)', 'Ativa: aulas +1 de inteligência e freelance +10%') : ''}
  </div><button class="pbtn" style="width:100%;margin-top:8px" onclick="closeModal();closePanel();phoneOpen('loja')">🛒 Comprar aparelhos na Kitanda Online</button>`;
}
function dvMenu() { openModal(`<div class="mico">📱</div><h3>Os meus aparelhos</h3>${dvLista()}<div class="choices"><button class="btn btn-ghost" onclick="closeModal()">Fechar</button></div>`); }
(function () {
  const _gm = gameMenu; gameMenu = function () { _gm.apply(this, arguments); try { const c = document.querySelector('#modalBox .choices'); if (c) c.insertAdjacentHTML('afterbegin', '<button class="btn btn-yel" onclick="closeModal();dvMenu()">📱 Os meus aparelhos</button>'); } catch (e) { } };
  if (PANELS.casa && PANELS.casa.tabs && !PANELS.casa.tabs.some(t => t[0] === 'apar')) PANELS.casa.tabs.push(['apar', '📱 Aparelhos', () => sec('Os teus aparelhos') + dvLista()]);
  /* Jogos no telemóvel: a Cobrinha também aparece */
  const _j = PHONE_VIEWS.jogos; PHONE_VIEWS.jogos = function () { let h = _j.apply(this, arguments); if (!P2.game) h = h.replace('Pequena hipótese de ganhar torneios pagos', 'Battle royale real · Booyah abre torneios pagos').replace('Treina a mente', `Partida completa · 3 níveis · rating ${G.xadElo || 1000}`).replace(/>(Com KZ Station 5: mais diversão|Diversão)</, `>Penáltis contra jogador online${G.bens.includes('ps5') ? ' · em casa joga na TV' : ''}<`).replace(/<\/div>(?![\s\S]*<\/div>)/, btnItem('🐍', 'Cobrinha', `Recorde ${G.cobraBest || 0} · 1 energia`, '', "gmStart('cobra')") + '</div>'); return h; };
  /* Aula Online abre o leitor de aulas */
  PHONE_VIEWS.aulas = () => apHead('Aula Online', 'Vídeo-aulas, testes e certificados') + energyBar() + (G.estudo ? `<div class="apok">📚 A estudar ${esc(G.estudo.t)}: as aulas online contam para a nota do ano!</div>` : '') + auMenu('phone');
  /* Rádio FM do Tijolinho toca mesmo */
  const _lm = listenMusic; listenMusic = function () { try { if (G.tel >= 1 && !SND.RADIO.on) SND.RADIO.play(SND.RADIO.idx); } catch (e) { } return _lm.apply(this, arguments); };
  /* a app Música também funciona no Tijolinho */
  const mu = APPS.find(a => a.id === 'musica'); if (mu) mu.tel = 1;
})();
/* os botões do menu de aulas abrem o leitor por cima de tudo */
(function () {
  const _a = auAbrir, _c = auCurso;
  auAbrir = function (id, curso) { if (!document.getElementById('auHost') || (phoneApp === 'aulas' && !DV.kind)) auOpen(G.tel >= 2 ? 'phone' : 'laptop'); return _a.apply(this, arguments); };
  auCurso = function (id) { if (!document.getElementById('auHost') || (phoneApp === 'aulas' && !DV.kind)) auOpen(G.tel >= 2 ? 'phone' : 'laptop'); return _c.apply(this, arguments); };
})();


/* =========================================================
   CORRIDAS (KZ Station 5) — "Futebol e corridas com a malta"
   ========================================================= */
function gmCorrida(host, K) {
  const W = 360, H = 540, { c, x } = gmCanvas(host, W, H), LEN = 4200, road = { l: 50, r: 310 };
  const pad = document.createElement('div'); pad.className = 'gmpad gmpad2'; pad.innerHTML = '<button data-k="l">◀</button><button data-k="n">NITRO</button><button data-k="r">▶</button>'; host.appendChild(pad);
  const malta = ['Mano Djeff', 'Kota Bento', 'Puto Nelo', 'Txuxa77', 'Yuri Kz'], cols = ['#e63946', '#2a9d8f', '#f4a261', '#8338ec', '#06d6a0'];
  const riv = malta.map((n, i) => ({ n, c: cols[i], x: 80 + (i % 3) * 90, d: -30 - i * 34, v: 0, vmax: 165 + i * 4 + (K.hard ? 14 : 0) + Math.random() * 10 }));
  const me = { x: 180, d: -10, v: 0, vmax: 175, nit: 3, nitT: 0, hit: 0 }, traf = []; let t = 0, start = 3, fim = false, steer = 0, rank = 1;
  const hold = {}; pad.onpointerdown = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.k === 'n') nitro(); else hold[b.dataset.k] = 1; };
  pad.onpointerup = pad.onpointerleave = pad.onpointercancel = () => { hold.l = hold.r = 0; };
  const nitro = () => { if (me.nit > 0 && !me.nitT && start <= 0) { me.nit--; me.nitT = 2.2; gmSnd('good'); } };
  const key = (e, v) => { if (['ArrowLeft', 'a'].includes(e.key)) { hold.l = v; e.preventDefault(); e.stopPropagation(); } if (['ArrowRight', 'd'].includes(e.key)) { hold.r = v; e.preventDefault(); e.stopPropagation(); } if (v && [' ', 'ArrowUp', 'w'].includes(e.key)) { nitro(); e.preventDefault(); e.stopPropagation(); } };
  const kd = e => key(e, 1), ku = e => key(e, 0); window.addEventListener('keydown', kd, true); window.addEventListener('keyup', ku, true);
  c.onpointerdown = c.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') { const p = gmPt(c, e, W, H); steer = p.x < W / 2 ? -1 : 1; } };
  c.onpointerup = c.onpointerleave = () => { steer = 0; };
  const car = (X, Y, col, nome) => { x.fillStyle = 'rgba(0,0,0,.3)'; gmRR(x, X - 15, Y - 24, 32, 52, 8); x.fill(); x.fillStyle = col; gmRR(x, X - 16, Y - 28, 32, 52, 9); x.fill(); x.fillStyle = 'rgba(10,20,40,.8)'; gmRR(x, X - 11, Y - 16, 22, 12, 4); x.fill(); gmRR(x, X - 11, Y + 10, 22, 8, 3); x.fill(); x.fillStyle = '#111'; [[-18, -18], [14, -18], [-18, 10], [14, 10]].forEach(([a, b]) => x.fillRect(X + a, Y + b, 4, 12)); if (nome) gmTxt(x, nome, X, Y - 38, { s: 10, sh: 1 }); };
  const stopL = gmLoop(dt => {
    t += dt;
    if (start > 0) { start -= dt; if (Math.ceil(start) !== Math.ceil(start + dt)) gmSnd('tap'); }
    else if (!fim) {
      const tgt = (me.nitT > 0 ? me.vmax * 1.45 : me.vmax) * (me.hit > 0 ? .45 : 1); me.v += (tgt - me.v) * dt * (me.v < tgt ? 1.1 : 2.5); me.nitT = Math.max(0, me.nitT - dt); me.hit = Math.max(0, me.hit - dt);
      const sd = (hold.r ? 1 : 0) - (hold.l ? 1 : 0) || steer; me.x = Math.max(road.l + 18, Math.min(road.r - 18, me.x + sd * 230 * dt)); me.d += me.v * dt;
      riv.forEach(r => { r.v += (r.vmax * (r.hit > 0 ? .5 : 1) - r.v) * dt * .9; r.hit = Math.max(0, (r.hit || 0) - dt); r.d += r.v * dt; r.x += Math.sin(t * .7 + r.vmax) * 20 * dt; r.x = Math.max(road.l + 20, Math.min(road.r - 20, r.x)); });
      if (Math.random() < dt * 1.3 && me.d < LEN - 300) traf.push({ x: R(road.l + 30, road.r - 30), d: me.d + 620, v: R(60, 100), c: pick(['#ddd', '#ffcb00', '#4b6cb7', '#333']) });
      traf.forEach(o => { o.d += o.v * dt; if (!o.hit && Math.abs(o.d - me.d) < 44 && Math.abs(o.x - me.x) < 30) { o.hit = 1; me.hit = 1.1; me.v *= .5; gmSnd('lose'); try { SND.vib && SND.vib(120); } catch (e) { } } riv.forEach(r => { if (!o.hit && Math.abs(o.d - r.d) < 40 && Math.abs(o.x - r.x) < 28 && Math.random() < .5) { r.hit = .8; o.hit = 1; } }); });
      for (let i = traf.length - 1; i >= 0; i--) if (traf[i].d < me.d - 400) traf.splice(i, 1);
      rank = 1 + riv.filter(r => r.d > me.d).length;
      if (me.d >= LEN) { fim = true; gmSnd(rank === 1 ? 'win' : 'good'); setTimeout(() => K.done({ rank, tempo: t - 3 }), 1500); }
    }
    const cam = me.d, sy = d => H - 110 - (d - cam) * 1;
    x.fillStyle = '#3d7a3a'; x.fillRect(0, 0, W, H); x.fillStyle = '#4c4c55'; x.fillRect(road.l, 0, road.r - road.l, H);
    x.fillStyle = '#c8102e'; for (let y = -40; y < H + 40; y += 40) { const yy = y + (cam % 40); x.fillStyle = Math.floor((y - cam) / 40) % 2 ? '#c8102e' : '#fff'; x.fillRect(road.l - 8, yy, 8, 40); x.fillRect(road.r, yy, 8, 40); }
    x.fillStyle = 'rgba(255,255,255,.7)'; for (let y = -60; y < H + 60; y += 60) { const yy = y + (cam % 60); x.fillRect(137, yy, 4, 30); x.fillRect(222, yy, 4, 30); }
    for (let i = 0; i < 8; i++) { const yy = ((i * 97 + cam * 1) % (H + 80)) - 40; x.fillStyle = '#2d5e2a'; x.beginPath(); x.arc(22, yy, 16, 0, 7); x.arc(W - 22, (yy + 211) % (H + 80) - 40, 16, 0, 7); x.fill(); }
    const fy = sy(LEN); if (fy > -20 && fy < H) { for (let i = 0; i < 13; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#000' : '#fff'; x.fillRect(road.l + i * 20, fy + j * 10, 20, 10); } }
    traf.forEach(o => { const y = sy(o.d); if (y > -40 && y < H + 40) car(o.x, y, o.c); });
    riv.forEach(r => { const y = sy(r.d); if (y > -40 && y < H + 40) car(r.x, y, r.c, r.n); else gmTxt(x, (y < 0 ? '▲ ' : '▼ ') + r.n, r.x, y < 0 ? 14 : H - 14, { s: 10, c: r.c, sh: 1 }); });
    if (me.nitT > 0) { x.fillStyle = 'rgba(255,160,0,.8)'; x.beginPath(); x.moveTo(me.x - 8, H - 82); x.lineTo(me.x, H - 50 + Math.random() * 12); x.lineTo(me.x + 8, H - 82); x.fill(); }
    car(me.x, H - 110, me.hit > 0 && Math.floor(t * 12) % 2 ? '#fff' : '#ffcb00', 'TU');
    x.fillStyle = 'rgba(0,0,0,.55)'; gmRR(x, 8, 8, W - 16, 40, 10); x.fill();
    gmTxt(x, `${rank}º/6`, 40, 28, { s: 18, w: 900, c: '#ffcb00' }); gmTxt(x, `${Math.round(me.v * .9)} km/h`, 120, 28, { s: 13 }); gmTxt(x, `NITRO ${'●'.repeat(me.nit)}${'○'.repeat(3 - me.nit)}`, 215, 28, { s: 11, c: '#ff9f0a' });
    x.fillStyle = '#333'; x.fillRect(270, 24, 76, 8); x.fillStyle = '#2ecc71'; x.fillRect(270, 24, 76 * Math.min(1, Math.max(0, me.d / LEN)), 8);
    if (start > 0) gmTxt(x, String(Math.ceil(start)), W / 2, H / 2 - 40, { s: 80, w: 900, c: '#ffcb00', sh: 1 }); else if (start > -1) gmTxt(x, 'JÁ!', W / 2, H / 2 - 40, { s: 70, w: 900, c: '#2ecc71', sh: 1 });
    if (fim) { x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, H / 2 - 44, W, 70); gmTxt(x, rank === 1 ? 'VITÓRIA! 1º LUGAR' : `Chegaste em ${rank}º`, W / 2, H / 2 - 10, { s: 26, w: 900, c: '#ffcb00' }); }
  });
  return () => { stopL(); window.removeEventListener('keydown', kd, true); window.removeEventListener('keyup', ku, true); };
}
GM_INFO.corrida = { t: 'Kianda Racing', sub: 'Corrida pela Marginal contra a malta · usa o nitro', fn: gmCorrida };
(function () {
  const _e = gmEnd; gmEnd = function (id, r, o) {
    if (id !== 'corrida') return _e.apply(this, arguments);
    G.gmW = G.gmW || {}; if (r.rank === 1) G.gmW.corrida = (G.gmW.corrida || 0) + 1;
    const txt = `🏎️ Corrida pela Marginal: chegaste em ${r.rank}º lugar (${r.tempo.toFixed(1)} s). ` + fx({ felicidade: [0, 8, 5, 4, 3, 2, 2][r.rank] + (o.cons ? 3 : 0), fama: r.rank === 1 && G.gmW.corrida % 5 === 0 ? 1 : 0 });
    after(txt, r.rank <= 3 ? 'good' : '', 'cheer');
    const host = document.getElementById('gmHost'); if (!host) return;
    host.insertAdjacentHTML('beforeend', `<div class="gmres"><p>${strip(txt)}</p><button class="pbtn" onclick="dvClose();gmStart('corrida',{dev:'tv'})">Correr outra vez (1 energia)</button><button class="pbtn ghost" onclick="dvClose()">Sair</button></div>`);
  };
})();

/* =========================================================
   NOVA DOBRA 7 — ecrã dividido (app + painel lateral)
   ========================================================= */
function dobSide() {
  const R_ = SND.RADIO, msgs = (G.inbox || []).slice(0, 3), w = typeof wtG === 'function' ? wtG() : { hoje: 0 };
  return `<div class="dobw dobclock"><b>${nowTxt()}</b><small>${DIAS[new Date().getDay()]} · ${weather(0).temp}°C</small></div>
  <button class="dobw" onclick="phoneOpen('banco')"><small>Saldo</small><b>${kzShort(G.dinheiro)}</b></button>
  <div class="dobw"><small>Energia</small><b>⚡ ${G.acoes}/${maxAcoes()}</b><small>👟 ${Math.round(w.hoje)} passos</small></div>
  <div class="dobw"><small>${R_.on ? 'A tocar' : 'Música'}</small><b class="dobt">${R_.on ? esc(R_.TRACKS[R_.idx].t) : 'Kizomba FM'}</b><span class="dobmu"><button onclick="SND.RADIO.play(SND.RADIO.idx-1);renderPhone(true)">⏮</button><button onclick="SND.RADIO.on?SND.RADIO.stop():SND.RADIO.play(SND.RADIO.idx);renderPhone(true)">${R_.on ? '❚❚' : '▶'}</button><button onclick="SND.RADIO.play(SND.RADIO.idx+1);renderPhone(true)">⏭</button></span></div>
  <button class="dobw" onclick="phoneOpen('mensagens')"><small>Mensagens</small>${msgs.map(m => `<span class="dobm"><u>${esc(m.de)}</u>${esc(String(m.txt).slice(0, 34))}</span>`).join('') || '<span class="dobm">Sem mensagens</span>'}</button>`;
}
(function () {
  const _r = renderPhone;
  renderPhone = function (keep) {
    const b = document.getElementById('phBody'), mm = b && b.querySelector(':scope > .dobmain'), st = mm ? mm.scrollTop : 0;
    const r = _r.apply(this, arguments);
    try {
      if (!b) return r;
      const split = G && G.tel === 5 && innerWidth >= 560 && !['home', 'lock', 'semtel', 'camara'].includes(phoneApp) && phoneApp;
      b.classList.toggle('dobra', !!split);
      if (split) { const m = document.createElement('div'); m.className = 'dobmain'; while (b.firstChild) m.appendChild(b.firstChild); b.appendChild(m); const a = document.createElement('aside'); a.className = 'dobside'; a.innerHTML = dobSide(); b.appendChild(a); if (keep) m.scrollTop = st; }
    } catch (e) { console.error(e); }
    return r;
  };
})();
/* =========================================================
   CSS
   ========================================================= */
document.head.insertAdjacentHTML('beforeend', `<style id="v7css">
#dvOv{position:fixed;inset:0;z-index:62;background:rgba(4,4,10,.78);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:10px;animation:fadein .2s}
#dvOv.hidden{display:none}
#dvBox{position:relative;display:flex;flex-direction:column;max-height:96vh;color:#fff;overflow:hidden}
#dvTop{display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:14px}#dvTop b{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dvX{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:16px;flex:none}
#dvBody{flex:1;overflow-y:auto;overflow-x:hidden;padding:0 12px 14px;-webkit-overflow-scrolling:touch}
.dv-phone{width:min(400px,96vw);height:min(820px,94vh);background:#0b0b10;border-radius:38px;border:8px solid #26262b;box-shadow:0 30px 90px rgba(0,0,0,.8)}
.dv-tv{width:min(980px,97vw);max-height:94vh;background:#050507;border-radius:14px;border:12px solid #111;border-bottom-width:22px;box-shadow:0 0 0 2px #333,0 30px 90px rgba(0,0,0,.8)}
.dv-laptop{width:min(900px,97vw);height:min(640px,92vh);background:#14161c;border-radius:14px 14px 4px 4px;border:10px solid #2b2e36;border-bottom-width:16px;box-shadow:0 18px 0 -6px #3b3f49,0 30px 90px rgba(0,0,0,.8)}
.dv-watch{width:min(330px,92vw);background:#000;border-radius:90px;border:14px solid #2a2a2e;box-shadow:0 0 0 3px #555,0 30px 90px rgba(0,0,0,.8);padding:10px 0}
.dv-pod{width:min(300px,92vw);background:linear-gradient(#f4f4f6,#d9dade);color:#111;border-radius:30px;box-shadow:0 30px 90px rgba(0,0,0,.8)}
.dv-pod #dvX{background:rgba(0,0,0,.1);color:#111}.dv-pod #dvTop{color:#111}
.gmhost{display:flex;flex-direction:column;align-items:center;gap:8px}
.gmcv{width:100%;max-width:440px;height:auto;border-radius:14px;touch-action:none;display:block;background:#111}
.dv-tv .gmcv{max-width:min(720px,100%);max-height:72vh;width:auto}
.dv-laptop .gmcv{max-height:60vh;width:auto;max-width:100%}
.gmsub{font-size:12px;color:#aab;text-align:center}
.gmst{font-size:13px;text-align:center;min-height:20px;color:#ddd}
.gmres{width:100%;max-width:440px;display:flex;flex-direction:column;gap:6px;text-align:center}.gmres p{font-size:13px;margin:0 0 4px;color:#eee}
.gmres .pbtn.ghost{background:#2a2a33;color:#fff}
.gmpre{text-align:center;padding:30px 10px}.gmlv{display:flex;gap:8px;justify-content:center;margin:14px 0}.gmlv button{padding:12px 18px;border-radius:12px;background:#2e7d32;color:#fff;font-weight:800}
.gmpad{display:grid;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(2,46px);gap:6px}.gmpad button{border-radius:12px;background:#22222c;color:#fff;font-size:18px}
.gmpad button:nth-child(1){grid-column:2;grid-row:1}.gmpad button:nth-child(2){grid-column:1;grid-row:2}.gmpad button:nth-child(3){grid-column:3;grid-row:2}.gmpad button:nth-child(4){grid-column:2;grid-row:2}
.phscreen.camv{display:flex;flex-direction:column;overflow:hidden;padding-bottom:24px}.viewf.cam7 .vflbl{transform:none;top:auto;bottom:8px;left:10px}
.phscreen.camv .viewf{flex:1 1 auto;min-height:0;aspect-ratio:auto}
.phscreen.camv .cfil,.phscreen.camv .shutter{flex:none}.phscreen.camv .shutter{margin:8px 0 0}
.viewf.cam7{min-height:200px}.viewf.cam7 canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.camzoom{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:6px;background:rgba(0,0,0,.45);padding:4px;border-radius:20px}.camzoom button{width:34px;height:28px;border-radius:14px;color:#fff;font-size:11px;font-weight:800;background:transparent}.camzoom button.on{background:#ffcb00;color:#000}
.thumbb.flip{font-size:20px}
#wtHud{position:fixed;left:12px;top:192px;z-index:21;width:64px;height:64px;border-radius:50%;background:#0b0b10;border:2px solid #333;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.5);padding:0}
#wtHud i{position:absolute;inset:-5px;border-radius:50%;z-index:-1}#wtHud b{font-size:13px;line-height:1}#wtHud small{font-size:8px;color:#30d158;margin-top:2px}
body.in-int #wtHud{top:192px}
@media (max-width:700px){#wtHud{top:auto;bottom:150px;left:10px;width:54px;height:54px}#wtHud b{font-size:11px}#wtHud small{font-size:7px}}
.wtface{width:260px;height:260px;margin:0 auto;border-radius:50%;background:radial-gradient(circle at 50% 30%,#1b1b22,#000);display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
.wtclock b{display:block;font-size:56px;font-weight:300;letter-spacing:-2px}.wtclock span{color:#ff9f0a;font-size:13px}.wtclock em{display:block;font-style:normal;color:#8ab;font-size:11px;margin-top:6px}
.wtmini{display:flex;gap:8px;justify-content:center;margin-top:10px}.wtmini i{font-style:normal;font-size:11px;background:#1c1c22;padding:4px 7px;border-radius:10px}
.wtring{width:200px;height:200px;border-radius:50%;display:flex;align-items:center;justify-content:center}.wtring>div{width:172px;height:172px;border-radius:50%;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.wtring b{font-size:30px}.wtring small{color:#aaa;font-size:11px}.wtring em{font-style:normal;font-size:10px;color:#8ab}.wtring button{margin-top:6px;padding:5px 12px;border-radius:12px;background:#ff453a;color:#fff;font-size:11px}
.wtbars{position:absolute;bottom:0;display:none}
.wthr b{display:block;font-size:52px;font-weight:300}.wthr small{color:#ff375f}.wthr svg{width:150px;margin:8px auto 0;display:block}.wthr em{display:block;font-style:normal;font-size:10px;color:#8ab;margin-top:4px;max-width:190px}.wthr .beat{font-size:26px;display:inline-block;animation:beat .8s infinite;font-style:normal}
@keyframes beat{0%,100%{transform:scale(1)}20%{transform:scale(1.25)}}
.wttr{padding:20px}.wttr b{font-size:20px;display:block}.wttr small{display:block;color:#aaa;margin:8px 0 12px;font-size:12px}.wttr button{padding:10px 20px;border-radius:20px;background:#30d158;color:#000;font-weight:800}
.wtnot{width:210px;text-align:left}.wtnot>b{display:block;text-align:center;margin-bottom:6px}.wtnot div{display:flex;gap:6px;background:#1c1c22;border-radius:12px;padding:6px 8px;margin-bottom:4px;font-size:10px}.wtnot u{display:block;text-decoration:none;font-weight:800;color:#ffcb00}
.wtnav{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:8px}.wtnav button{width:36px;height:36px;border-radius:50%;background:#1c1c22;color:#fff;font-size:18px}.wtnav span{display:flex;gap:5px}.wtnav span i{width:6px;height:6px;border-radius:50%;background:#444}.wtnav span i.on{background:#fff}
.pod{display:flex;flex-direction:column;align-items:center;gap:14px;padding:4px 6px 8px}
.podscr{width:100%;height:170px;background:linear-gradient(#e9f2ff,#c9d9ee);border:3px solid #333;border-radius:10px;color:#111;font-size:12px;overflow:hidden}
.podh{display:flex;justify-content:space-between;background:linear-gradient(#fdfdfd,#c6ccd6);padding:3px 8px;font-weight:800;border-bottom:1px solid #889}
.podi{display:flex;flex-direction:column;padding:2px 8px}.podi span{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.podi small{font-size:9px;color:#556}.podi.on{background:linear-gradient(#3d8bff,#1557c9);color:#fff}.podi.on small{color:#dde}
.podnp{display:flex;flex-direction:column;align-items:center;padding:6px 0 2px;gap:1px}.podnp b{font-size:13px}.podnp span,.podnp small{font-size:10px;color:#445}
.podart{width:46px;height:46px;border-radius:6px;background:linear-gradient(135deg,#c9184a,#ffcb00);margin-bottom:4px}
.podpr{margin:6px 10px 2px;height:7px;border-radius:4px;background:#fff;border:1px solid #889;overflow:hidden}.podpr i{display:block;height:100%;background:linear-gradient(#3d8bff,#1557c9)}
.podtm{display:flex;justify-content:space-between;padding:0 10px;font-size:9px;color:#445}
.podwh{position:relative;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,#fafafa 0 30%,#e4e5e8 31%);box-shadow:inset 0 2px 6px rgba(0,0,0,.15),0 1px 0 #fff;touch-action:none}
.podwh button{position:absolute;color:#8a8d95;font-weight:800;font-size:12px;background:none;width:50px;height:40px}
.podwh .pm{top:6px;left:75px}.podwh .pl{left:4px;top:80px}.podwh .pr{right:4px;top:80px}.podwh .pp{bottom:6px;left:75px}
.podwh .pc{left:62px;top:62px;width:76px;height:76px;border-radius:50%;background:linear-gradient(#f2f2f4,#d6d7db);box-shadow:0 1px 3px rgba(0,0,0,.25)}
.podhelp{font-size:10px;color:#666;text-align:center}
.lpscr{position:relative;height:100%;min-height:420px;border-radius:6px;overflow:hidden;background:linear-gradient(135deg,#0d3b66,#1f6b8a 45%,#c8102e 120%)}
.dv-laptop #dvBody{padding:0}.dv-laptop #dvTop{background:#1d2028;font-size:12px;padding:6px 10px}
.lpdesk{display:grid;grid-template-columns:repeat(auto-fill,88px);gap:10px;padding:16px}
.lpdesk button{display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;background:none;padding:8px 2px;border-radius:10px;font-size:12px}.lpdesk button:hover{background:rgba(255,255,255,.12)}
.lpdesk i{font-style:normal;width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:24px}
.lpwin{position:absolute;inset:12px 12px 46px;background:#101218;border-radius:10px;box-shadow:0 20px 50px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden}
.lpwin.hidden{display:none}.lpwt{display:flex;align-items:center;padding:8px 10px;background:#1d2028}.lpwt b{flex:1;font-size:13px}.lpwt button{width:28px;height:24px;border-radius:6px;background:#c62828;color:#fff}
.lpwb{flex:1;overflow-y:auto;padding:12px}
.lptask{position:absolute;left:0;right:0;bottom:0;height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:rgba(10,12,18,.85);font-size:12px}
.lptask2{display:flex;flex-direction:column;gap:10px}.lpfrase{background:#1b1e27;border-left:3px solid #ffcb00;padding:10px;border-radius:8px;font-size:14px;user-select:none;-webkit-user-select:none}
.lptask2 textarea,.lptask2 input{width:100%;background:#0b0c10;color:#fff;border:1px solid #333;border-radius:8px;padding:10px;font-size:14px;font-family:inherit}
.lpcode{display:flex;flex-direction:column;gap:4px;font-family:ui-monospace,monospace}.lpcode button{text-align:left;background:#0b0c10;color:#9fe;padding:8px;border-radius:6px;font-family:inherit;font-size:13px;white-space:pre}.lpcode u{text-decoration:none;color:#556;margin-right:10px}
.lpfin{width:100%;border-collapse:collapse;font-size:13px}.lpfin td{padding:6px 4px;border-bottom:1px solid #222}.lpfin td:last-child{text-align:right;font-weight:800}
.lpbar{height:10px;border-radius:5px;background:#2ecc71;overflow:hidden;margin:10px 0}.lpbar i{display:block;height:100%;background:#ff6b6b}
.lpnews{background:#161922;border-radius:8px;padding:8px 10px;margin-bottom:6px;font-size:13px}.lpnews p{color:#bbb;margin:6px 0 0}
.aumenu .aulist{display:grid;grid-template-columns:1fr;gap:6px}.aulist button{text-align:left;background:#15151c;border-left:4px solid var(--c);border-radius:10px;padding:10px 12px;color:#fff}.aulist b{display:block;font-size:14px}.aulist small{color:#999;font-size:11px}
.dv-laptop .aulist{grid-template-columns:1fr 1fr}
.auplayer{position:relative;border-radius:12px;overflow:hidden;background:#000}.auplayer canvas{width:100%;display:block;aspect-ratio:16/9}
.auprof{position:absolute;right:8px;bottom:56px;width:22%;max-width:110px;border-radius:12px;border:2px solid rgba(255,255,255,.5)}
.aubar{height:4px;background:#333}.aubar i{display:block;height:100%;width:0;background:#ff0033;transition:width .2s}
.auctl{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#0b0b0f}.auctl button{width:36px;height:32px;border-radius:8px;background:#1c1c24;color:#fff}.auctl span{margin-left:auto;font-size:11px;color:#888}
.ausub{font-size:13px;color:#ddd;background:#14141a;border-radius:10px;padding:10px;margin-top:8px}
.auquiz{display:flex;flex-direction:column;gap:8px;padding:6px 0}.auquiz b{font-size:16px;margin:6px 0}.auqh{display:flex;justify-content:space-between;font-size:12px;color:#999}.auqh span{color:#2ecc71}
.auquiz button{text-align:left;padding:12px;border-radius:12px;background:#1a1a22;color:#fff;font-size:14px;border:2px solid transparent}.auquiz button.ok{border-color:#2ecc71;background:#103a22}.auquiz button.no{border-color:#e74c3c;background:#3a1010}
.aufim{text-align:center;padding:20px 6px;display:flex;flex-direction:column;gap:12px;align-items:center}.auscore{font-size:54px;font-weight:900;color:#ffcb00}.aufim p{font-size:13px;color:#ddd}
.aucert{width:100%;max-width:340px;background:linear-gradient(#fffaf0,#f3e6c8);color:#3a2a10;border:6px double #b8862f;border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:4px}
.aucert small{letter-spacing:3px;font-size:10px;color:#8a6a2a}.aucert b{font-size:26px;font-family:Georgia,serif}.aucert span{font-size:18px;font-weight:800}.aucert em{font-size:12px}.aucert strong{font-size:16px;color:#7a1a1a}.aucert i{font-size:11px}
.cons{padding:10px}.consh{font-size:18px;font-weight:800;margin-bottom:10px}.cons .gcards{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.iasug{display:flex;gap:6px;overflow-x:auto;padding:6px 0;scrollbar-width:none}.iasug button{flex:none;padding:6px 10px;border-radius:14px;background:#1d1d27;color:#cfd;font-size:11px}
.iabar{position:sticky;bottom:-30px;display:flex;gap:6px;padding:8px 0 4px;background:#0b0b10}.iabar input{flex:1;background:#17171f;border:1px solid #2a2a35;border-radius:18px;padding:10px 12px;color:#fff;font-size:14px}.iabar button{width:42px;border-radius:50%;background:linear-gradient(135deg,#4285f4,#9b72cb);color:#fff}
.bub.out{margin-left:auto;background:#2d5bd7}.bub.typing{opacity:.6}
.gmpad2{grid-template-columns:70px 110px 70px;grid-template-rows:50px}.gmpad2 button:nth-child(n){grid-row:1}.gmpad2 button:nth-child(1){grid-column:1}.gmpad2 button:nth-child(2){grid-column:2;background:#e85d04;font-size:14px;font-weight:900}.gmpad2 button:nth-child(3){grid-column:3}
.phscreen.dobra{display:flex;gap:8px;overflow:hidden;padding-right:8px}.phscreen.dobra>.dobmain{flex:1;min-width:0;overflow-y:auto;height:100%}
.dobside{width:150px;flex:none;display:flex;flex-direction:column;gap:6px;overflow-y:auto;padding:8px 0;border-left:1px solid #222;padding-left:8px}
.dobw{display:flex;flex-direction:column;gap:2px;background:#16161e;border-radius:14px;padding:8px 10px;text-align:left;color:#fff}.dobw small{font-size:10px;color:#889}.dobw b{font-size:15px}.dobclock b{font-size:28px;font-weight:300}
.dobt{font-size:12px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dobmu{display:flex;gap:4px;margin-top:4px}.dobmu button{flex:1;height:26px;border-radius:8px;background:#262633;color:#fff;font-size:11px}
.dobm{font-size:10px;color:#ccd;display:block;margin-top:3px}.dobm u{text-decoration:none;color:#ffcb00;font-weight:800;margin-right:4px}
</style>`);
