/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Mensagens de voz
   - Os jogadores na mesma sala (dentro de um edifício) ou perto, na rua, podem
     mandar mensagens de voz de até 15 s.
   - Para gravar: manter o botão do microfone carregado (ou a tecla V) e largar para
     enviar. Um toque rápido deixa a gravação "trancada", com Enviar e Cancelar.
   - Ao receber: a mensagem toca sozinha se for de quem está na tua sala (pode-se
     desligar). Aparece um microfone por cima do nick de quem está a falar.
   - Segurança: limite de 15 s, 1 mensagem a cada 3 s, silenciar jogadores e
     denunciar (3 denúncias bloqueiam a voz desse jogador durante 15 min).
   - Os áudios ficam só na memória do servidor durante 4 min.
   ========================================================= */
const VZ = {
  rec: null, stream: null, chunks: [], mime: '', t0: 0, on: false, locked: false, cancel: false, sending: false,
  auto: localStorage.getItem('pe3d_vzauto') !== '0', scope: 'sala',
  cache: new Map(), meta: new Map(), q: [], cur: null, an: null, actx: null, raf: 0, timer: 0, seq: 0,
  muted: new Set(JSON.parse(localStorage.getItem('pe3d_vzmute') || '[]')),
};
const VZ_MAX = 15;
function vzSupported() { return !!(window.isSecureContext !== false && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); }
function vzPickMime() {
  const L = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/aac'];
  for (const m of L) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) { } }
  return '';
}
const vzIc = n => (typeof ic === 'function' ? ic(n) : '');
const vzFmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function vzHash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---------- quem está na sala ---------- */
function vzRoomPeople() {
  if (typeof MP === 'undefined') return 0;
  let n = 0; const rua = MP.room === 'rua';
  for (const o of MP.others.values()) if (!rua || (o.d != null && o.d <= MP_PERTO)) n++;
  return n;
}
function vzRoomLabel() { return typeof MP !== 'undefined' && MP.room !== 'rua' ? 'na sala' : 'perto'; }

/* ---------- interface ---------- */
function vzBuildUI() {
  if (document.getElementById('vzBtn') || !document.getElementById('mpLive')) return;
  // botão grande ao lado de "Escrever no chat…"
  const lb = document.querySelector('#mpLive .mlbtn');
  if (lb && !lb.parentNode.classList.contains('mlrow')) {
    const row = document.createElement('div'); row.className = 'mlrow';
    lb.parentNode.insertBefore(row, lb); row.appendChild(lb);
    const b = document.createElement('button'); b.id = 'vzBtn'; b.className = 'vzbtn'; b.type = 'button';
    b.title = 'Mensagem de voz: mantém carregado para falar (tecla V)';
    b.innerHTML = `${vzIc('mic')}<span class="vzn hidden" id="vzN">0</span>`;
    row.insertBefore(b, lb); vzHold(b);
  }
  // botão no formulário do chat
  const form = document.getElementById('mpForm');
  if (form && !document.getElementById('vzBtn2')) {
    const b2 = document.createElement('button'); b2.type = 'button'; b2.id = 'vzBtn2'; b2.className = 'vzf'; b2.title = 'Mensagem de voz (manter carregado)';
    b2.innerHTML = vzIc('mic'); const send = form.querySelector('button[type=submit]'); form.insertBefore(b2, send); vzHold(b2);
  }
  // opção "voz automática" nas respostas rápidas
  const q = document.querySelector('#mpBar .mpq');
  if (q && !document.getElementById('vzAuto')) {
    const a = document.createElement('button'); a.type = 'button'; a.id = 'vzAuto'; a.className = 'vzauto'; a.onclick = vzToggleAuto;
    q.insertBefore(a, q.firstChild); vzAutoLbl();
  }
  // painel de gravação
  if (!document.getElementById('vzRec')) {
    const r = document.createElement('div'); r.id = 'vzRec'; r.className = 'hidden';
    r.innerHTML = `<div class="vzr1"><i class="vzdot"></i><b id="vzT">0:00</b><small>/ 0:${VZ_MAX}</small><div class="vzlv" id="vzLv">${'<i></i>'.repeat(18)}</div></div>
      <div class="vzr2" id="vzHint">Solta para enviar · arrasta para o lado para cancelar</div>
      <div class="vzr3 hidden" id="vzBtns"><button type="button" class="vzc" onclick="vzStop(false)">${vzIc('trash-2')} Cancelar</button><button type="button" class="vzs" onclick="vzStop(true)">${vzIc('arrow-up')} Enviar</button></div>`;
    document.body.appendChild(r);
  }
  // tecla V: manter carregada para falar
  if (!VZ._keys) {
    VZ._keys = true;
    addEventListener('keydown', e => {
      if (e.code !== 'KeyV' || e.repeat || mode !== 'game' || uiBlocked) return;
      const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) return;
      e.preventDefault(); vzStart(true);
    });
    addEventListener('keyup', e => { if (e.code === 'KeyV' && VZ.byKey && (VZ.on || VZ.pending)) vzStop(true); });
    const hint = document.querySelector('#hud .hint'); if (hint && !hint.innerHTML.includes('voz')) hint.insertAdjacentHTML('beforeend', ' · <kbd>V</kbd> voz');
  }
}
function vzAutoLbl() { const a = document.getElementById('vzAuto'); if (a) { a.innerHTML = `${vzIc('volume-2')} Voz automática: <b>${VZ.auto ? 'Ligada' : 'Desligada'}</b>`; a.classList.toggle('off', !VZ.auto); } }
function vzToggleAuto() { VZ.auto = !VZ.auto; localStorage.setItem('pe3d_vzauto', VZ.auto ? '1' : '0'); vzAutoLbl(); if (typeof mpWarn === 'function') mpWarn(VZ.auto ? 'As mensagens de voz de quem está na tua sala tocam sozinhas.' : 'As mensagens de voz só tocam quando carregares no play.'); }
/* manter carregado = gravar; toque rápido = gravação trancada com Enviar/Cancelar */
function vzHold(b) {
  let x0 = 0, y0 = 0, tDown = 0, pid = null;
  b.addEventListener('contextmenu', e => e.preventDefault());
  b.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    if (VZ.on && VZ.locked) { vzStop(true); return; }
    pid = e.pointerId; try { b.setPointerCapture(pid); } catch (er) { }
    x0 = e.clientX; y0 = e.clientY; tDown = e.timeStamp; vzStart(false);
  });
  b.addEventListener('pointermove', e => {
    if (!VZ.on || VZ.locked || e.pointerId !== pid) return;
    const far = Math.hypot(e.clientX - x0, e.clientY - y0) > 70;
    document.getElementById('vzRec').classList.toggle('cx', far);
    document.getElementById('vzHint').textContent = far ? 'Solta para CANCELAR' : 'Solta para enviar · arrasta para o lado para cancelar';
  });
  const up = e => {
    if (e.pointerId !== pid) return; pid = null;
    if (!VZ.on && !VZ.pending) return;
    const far = Math.hypot(e.clientX - x0, e.clientY - y0) > 70;
    if (far || e.type === 'pointercancel') return vzStop(false);
    if (e.timeStamp - tDown < 380) { vzLock(); return; }   // toque rápido: tranca
    vzStop(true);
  };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
}
function vzLock() {
  VZ.locked = true;
  document.getElementById('vzBtns').classList.remove('hidden');
  document.getElementById('vzHint').textContent = VZ.pending ? 'A ligar o microfone…' : 'A gravar… carrega em Enviar quando acabares';
}
function vzWarn(t, bad) { if (typeof mpWarn === 'function' && !document.getElementById('mpBar').classList.contains('hidden')) mpWarn(t, bad); else if (typeof toast === 'function') toast(t); }

/* ---------- gravar ---------- */
async function vzStart(byKey) {
  if (VZ.on || VZ.pending || VZ.sending) return;
  if (!vzSupported()) { vzWarn('O teu browser não deixa gravar áudio aqui. Usa o Chrome, Edge, Firefox ou Safari atualizados (o jogo tem de estar em https).', true); return; }
  if (typeof MP !== 'undefined' && MP.mute > Date.now()) { vzWarn('Estás silenciado(a) de momento.', true); return; }
  VZ.pending = true; VZ.pendCancel = false; VZ.byKey = !!byKey; VZ.locked = false; VZ.cancel = false;
  const R0 = document.getElementById('vzRec');
  if (R0) { R0.classList.remove('hidden', 'cx'); R0.classList.add('wait'); document.getElementById('vzT').textContent = '0:00'; document.getElementById('vzBtns').classList.add('hidden'); document.getElementById('vzHint').textContent = 'A ligar o microfone…'; }
  const hide0 = () => { if (R0) R0.classList.add('hidden'); R0 && R0.classList.remove('wait'); };
  try {
    if (!VZ.stream || !VZ.stream.active) VZ.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
  } catch (e) {
    VZ.pending = false; hide0();
    vzWarn(e && e.name === 'NotAllowedError' ? 'Permite o acesso ao microfone no browser para enviares mensagens de voz.' : 'Não foi possível usar o microfone.', true);
    return;
  }
  if (!VZ.pending) {   // largou antes de o microfone abrir (ex.: janela de autorização)
    try { VZ.stream.getTracks().forEach(t => t.stop()); } catch (e) { } VZ.stream = null; hide0();
    if (!VZ.pendCancel) vzWarn('Microfone pronto! Mantém o botão carregado enquanto falas.');
    return;
  }
  VZ.pending = false;
  VZ.mime = vzPickMime();
  try { VZ.rec = new MediaRecorder(VZ.stream, VZ.mime ? { mimeType: VZ.mime, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 }); }
  catch (e) { try { VZ.rec = new MediaRecorder(VZ.stream); } catch (e2) { hide0(); vzWarn('Gravação de áudio indisponível.', true); return; } }
  VZ.chunks = []; VZ.rec.ondataavailable = ev => { if (ev.data && ev.data.size) VZ.chunks.push(ev.data); };
  VZ.rec.onstop = vzDone;
  VZ.rec.start(250); VZ.on = true; VZ.t0 = performance.now();
  if (typeof SND !== 'undefined') { try { SND.play('tap'); SND.RADIO.duck(true); } catch (e) { } }
  const R = document.getElementById('vzRec'); R.classList.remove('hidden', 'wait'); document.getElementById('vzBtns').classList.add('hidden');
  document.getElementById('vzHint').textContent = byKey ? 'Larga a tecla V para enviar' : 'Solta para enviar · arrasta para o lado para cancelar';
  document.body.classList.add('vz-rec');
  if (VZ.locked) vzLock();
  const n = vzRoomPeople();
  document.getElementById('vzT').dataset.n = n;
  vzMeter();
  clearInterval(VZ.timer);
  VZ.timer = setInterval(() => {
    const s = (performance.now() - VZ.t0) / 1000; document.getElementById('vzT').textContent = vzFmt(s);
    if (s >= VZ_MAX) vzStop(true);
  }, 200);
}
function vzMeter() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!VZ.actx) VZ.actx = new AC();
    if (VZ.actx.state === 'suspended') VZ.actx.resume();
    const src = VZ.actx.createMediaStreamSource(VZ.stream); VZ.an = VZ.actx.createAnalyser(); VZ.an.fftSize = 256; src.connect(VZ.an);
    const buf = new Uint8Array(VZ.an.frequencyBinCount), bars = [...document.querySelectorAll('#vzLv i')], lv = [];
    let fr = 0;
    const loop = () => {
      if (!VZ.on) return; VZ.raf = requestAnimationFrame(loop);
      if (++fr % 3) return;   // ~20 vezes por segundo chega (telemóveis fracos)
      VZ.an.getByteTimeDomainData(buf);
      let pk = 0; for (let i = 0; i < buf.length; i++) pk = Math.max(pk, Math.abs(buf[i] - 128));
      lv.push(Math.min(1, pk / 64)); if (lv.length > bars.length) lv.shift();
      bars.forEach((b, i) => { b.style.height = (3 + (lv[i - (bars.length - lv.length)] || 0) * 22).toFixed(1) + 'px'; });
    };
    loop();
  } catch (e) { }
}
function vzStop(send) {
  if (VZ.pending) { VZ.pending = false; VZ.pendCancel = !send; return; }
  if (!VZ.on) return;
  VZ.on = false; VZ.cancel = !send; clearInterval(VZ.timer); cancelAnimationFrame(VZ.raf);
  VZ.dur = (performance.now() - VZ.t0) / 1000;
  try { VZ.rec.stop(); } catch (e) { vzDone(); }
  document.getElementById('vzRec').classList.add('hidden'); document.body.classList.remove('vz-rec');
  if (typeof SND !== 'undefined') { try { SND.RADIO.duck(false); } catch (e) { } }
}
function vzDone() {
  /* liberta o microfone (o browser deixa de mostrar o ícone de gravação) */
  if (VZ.stream) { try { VZ.stream.getTracks().forEach(t => t.stop()); } catch (e) { } VZ.stream = null; }
  if (VZ.cancel) { vzWarn('Mensagem de voz cancelada.'); return; }
  const dur = Math.min(VZ_MAX, VZ.dur || 0);
  if (dur < .6) { vzWarn('Muito curta! Mantém o microfone carregado enquanto falas.', true); return; }
  const type = (VZ.rec && VZ.rec.mimeType) || VZ.mime || 'audio/webm';
  const blob = new Blob(VZ.chunks, { type });
  vzSend(blob, type, dur);
}
function vzB64(blob) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = no; r.readAsDataURL(blob); }); }
async function vzSend(blob, type, dur) {
  if (blob.size > 140000) { vzWarn('A mensagem ficou demasiado grande. Tenta outra vez mais curta.', true); return; }
  const url = URL.createObjectURL(blob);
  /* modo offline: só tu ouves */
  if (typeof MP === 'undefined' || MP.offline || !(typeof Acc !== 'undefined' && Acc.online && Acc.token)) {
    const id = 'L' + (++VZ.seq); VZ.cache.set(id, url);
    const m = { uid: 'me', nick: G ? G.nome : 'Eu', txt: '🎤 Mensagem de voz', room: MP ? MP.room : 'rua', sc: 'sala', vz: { id, d: +dur.toFixed(1) } };
    if (typeof MP !== 'undefined') MP.me = MP.me || 'me';
    mpAddLine(m); mpBubble('me', `🎤 Mensagem de voz · ${Math.round(dur)} s`);
    vzWarn('Modo offline: só tu ouves esta mensagem de voz.');
    return;
  }
  VZ.sending = true; vzBusy(true);
  try {
    const a = await vzB64(blob);
    const res = await fetch('/api/voz', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify({ op: 'enviar', a, mime: type.split(';')[0], dur: +dur.toFixed(1), scope: VZ.scope }) });
    const d = await res.json();
    if (!d.ok) { vzWarn(d.erro || 'Não foi possível enviar a mensagem de voz.', true); if (typeof SND !== 'undefined') SND.play('err'); URL.revokeObjectURL(url); return; }
    VZ.cache.set(d.msg.vz.id, url);
    mpAddLine(d.msg); mpBubble(d.msg.uid, `🎤 Mensagem de voz · ${Math.round(dur)} s`);
    if (typeof SND !== 'undefined') SND.play('send');
    const n = d.ouvintes;
    if (n === 0) vzWarn(`Ninguém está ${vzRoomLabel()} para te ouvir. Entra num sítio com outros jogadores.`);
    else if (n > 0) vzWarn(`${n} jogador${n > 1 ? 'es' : ''} ${vzRoomLabel()} recebe${n > 1 ? 'm' : ''} a tua mensagem de voz.`);
    if (typeof checkAchievements === 'function') try { checkAchievements(); } catch (e) { }
  } catch (e) { vzWarn('Sem ligação ao servidor.', true); }
  finally { VZ.sending = false; vzBusy(false); }
}
function vzBusy(on) { ['vzBtn', 'vzBtn2'].forEach(id => { const b = document.getElementById(id); if (b) b.classList.toggle('busy', on); }); }

/* ---------- ouvir ---------- */
async function vzGetUrl(id) {
  if (VZ.cache.has(id)) return VZ.cache.get(id);
  const res = await fetch('/api/voz', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify({ op: 'ouvir', id }) });
  const d = await res.json();
  if (!d.ok) throw new Error(d.erro || 'Indisponível');
  const bin = atob(d.a), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([u], { type: d.mime }));
  VZ.cache.set(id, url);
  if (VZ.cache.size > 60) { const k = VZ.cache.keys().next().value; URL.revokeObjectURL(VZ.cache.get(k)); VZ.cache.delete(k); }
  return url;
}
function vzTag(uid) { if (typeof MP === 'undefined') return null; if (uid === MP.me || uid === 'me') return MP.myTag; const o = MP.others.get(uid); return o ? o.tag : null; }
function vzTalk(uid, on) {
  const t = vzTag(uid); if (!t) return;
  if (!t.querySelector('.nvz')) { const b = document.createElement('b'); b.className = 'nvz'; b.innerHTML = vzIc('mic'); t.querySelector('.nnick').insertBefore(b, t.querySelector('.nnick span')); }
  t.classList.toggle('talk', on);
}
function vzVol(uid) {
  if (typeof MP === 'undefined' || MP.room !== 'rua') return 1;
  const o = MP.others.get(uid); if (!o || o.d == null) return .8;
  return Math.max(.35, Math.min(1, 1.15 - o.d / 45));
}
async function vzPlay(id, uid, auto) {
  if (VZ.cur && VZ.cur.id === id) { vzStopPlay(); return; }    // carregar outra vez = parar
  if (auto && VZ.cur) { VZ.q.push([id, uid]); return; }        // automáticas esperam pela vez
  vzStopPlay();
  const w = document.querySelectorAll(`.vzw[data-id="${id}"]`);
  w.forEach(x => x.classList.add('load'));
  let url;
  try { url = await vzGetUrl(id); }
  catch (e) { w.forEach(x => { x.classList.remove('load'); x.classList.add('exp'); }); if (!auto) vzWarn(e.message || 'Esta mensagem de voz já expirou.', true); vzNext(); return; }
  const a = new Audio(url); a.volume = vzVol(uid);
  VZ.cur = { id, uid, a };
  w.forEach(x => { x.classList.remove('load'); x.classList.add('play'); x.querySelector('.vzp').innerHTML = vzIc('pause'); });
  vzTalk(uid, true);
  if (typeof SND !== 'undefined') { try { SND.RADIO.duck(true); } catch (e) { } }
  a.ontimeupdate = () => {
    const D = isFinite(a.duration) && a.duration > 0 ? a.duration : ((VZ.meta.get(id) || {}).d || 5);
    const p = Math.min(1, a.currentTime / D);
    document.querySelectorAll(`.vzw[data-id="${id}"] .vzb`).forEach(b => b.style.setProperty('--p', (p * 100).toFixed(1) + '%'));
  };
  a.onended = a.onerror = () => { if (a.error && !auto) vzWarn('O teu browser não consegue tocar este formato de áudio.', true); vzStopPlay(); vzNext(); };
  try { await a.play(); }
  catch (e) {
    /* o browser bloqueia som automático antes do primeiro toque no ecrã */
    vzStopPlay();
    if (auto) document.querySelectorAll(`.vzw[data-id="${id}"]`).forEach(x => x.classList.add('new'));
  }
}
function vzStopPlay() {
  const c = VZ.cur; if (!c) return; VZ.cur = null;
  try { c.a.pause(); } catch (e) { }
  document.querySelectorAll(`.vzw[data-id="${c.id}"]`).forEach(x => { x.classList.remove('play', 'new'); x.querySelector('.vzp').innerHTML = vzIc('play'); x.querySelector('.vzb').style.setProperty('--p', '0%'); });
  vzTalk(c.uid, false);
  if (typeof SND !== 'undefined') { try { SND.RADIO.duck(false); } catch (e) { } }
}
function vzNext() { const n = VZ.q.shift(); if (n) setTimeout(() => vzPlay(n[0], n[1], true), 250); }

/* ---------- silenciar / denunciar ---------- */
function vzMenu(id, uid, nick) {
  if (typeof openModal !== 'function') return;
  const mut = VZ.muted.has(String(uid));
  openModal(`<h3 style="margin:0 0 6px">${vzIc('mic')} Mensagem de voz de ${esc(nick)}</h3>
    <p style="margin:0 0 12px;color:#aaa;font-size:13px">Se a mensagem for ofensiva, podes silenciar este jogador (só para ti) ou denunciá-lo. Com 3 denúncias, a voz dele fica bloqueada durante 15 minutos.</p>
    <div class="choices"><button class="btn" onclick="vzMute('${uid}');closeModal()">${mut ? 'Voltar a ouvir' : 'Silenciar a voz deste jogador'}</button>
    <button class="btn btn-pri" onclick="vzReport('${id}')">${vzIc('flag')} Denunciar</button>
    <button class="btn btn-yel" onclick="closeModal()">Fechar</button></div>`);
}
function vzMute(uid) {
  uid = String(uid); if (VZ.muted.has(uid)) VZ.muted.delete(uid); else VZ.muted.add(uid);
  localStorage.setItem('pe3d_vzmute', JSON.stringify([...VZ.muted].slice(-200)));
  document.querySelectorAll(`.vzw[data-uid="${uid}"]`).forEach(x => x.classList.toggle('mut', VZ.muted.has(uid)));
  if (VZ.cur && String(VZ.cur.uid) === uid) vzStopPlay();
  if (typeof toast === 'function') toast(VZ.muted.has(uid) ? 'Silenciaste a voz deste jogador.' : 'Voltaste a ouvir a voz deste jogador.');
}
async function vzReport(id) {
  if (String(id).startsWith('L')) { closeModal(); return; }
  try {
    const r = await fetch('/api/voz', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify({ op: 'denunciar', id }) });
    const d = await r.json(); closeModal(); if (typeof toast === 'function') toast(d.ok ? d.msg : (d.erro || 'Não foi possível denunciar.'));
  } catch (e) { closeModal(); }
}

/* ---------- mostrar no chat ---------- */
function vzWidget(m) {
  const id = m.vz.id, d = +m.vz.d || 1, h = vzHash(id), n = 16, mine = (typeof MP !== 'undefined' && (m.uid === MP.me || m.uid === 'me'));
  VZ.meta.set(id, { d, uid: m.uid });
  let bars = ''; for (let i = 0; i < n; i++) { const v = ((h >>> (i % 24)) & 7) / 7, e = Math.sin((i + 1) / (n + 1) * Math.PI); bars += `<i style="height:${(4 + (v * .6 + .4) * e * 14).toFixed(1)}px"></i>`; }
  const muted = VZ.muted.has(String(m.uid));
  return `<span class="vzw${muted ? ' mut' : ''}" data-id="${id}" data-uid="${m.uid}"><button type="button" class="vzp" aria-label="Ouvir">${vzIc('play')}</button><span class="vzb">${bars}</span><small>${vzFmt(d)}</small>${mine ? '' : `<button type="button" class="vzm" aria-label="Opções">${vzIc('flag')}</button>`}</span>`;
}
(function vzPatch() {
  if (typeof mpAddLine !== 'function') return;
  const _add = mpAddLine;
  mpAddLine = function (m) {
    const had = m && m.id && MP.seen.has(m.id);
    const r = _add.apply(this, arguments);
    if (!m || had || !m.vz || !m.vz.id) return r;
    const list = document.getElementById('mpList'); const el = list && list.lastElementChild; if (!el) return r;
    const sp = el.querySelector(':scope > span:last-of-type'); if (sp) sp.outerHTML = vzWidget(m);
    el.classList.add('vzl');
    const w = el.querySelector('.vzw');
    w.querySelector('.vzp').onclick = e => { e.stopPropagation(); vzPlay(m.vz.id, m.uid, false); };
    const mb = w.querySelector('.vzm'); if (mb) mb.onclick = e => { e.stopPropagation(); vzMenu(m.vz.id, m.uid, m.nick); };
    w.onclick = e => e.stopPropagation();
    /* toca sozinha se acabou de chegar, é de outra pessoa na tua sala e não está silenciada */
    const mine = m.uid === MP.me || m.uid === 'me';
    const fresh = typeof LIVE !== 'undefined' && LIVE.synced ? (LIVE.now() - (m.t || 0)) < 25 : !!MP.since;
    if (!mine && fresh && VZ.auto && !VZ.muted.has(String(m.uid)) && (m.room === MP.room || m.sc === 'grupo') && VZ.ready) vzPlay(m.vz.id, m.uid, true);
    else if (!mine && fresh) w.classList.add('new');
    return r;
  };
})();

/* ---------- ciclo: contador "N na sala" + arranque ---------- */
(function vzBoot() {
  const t = setInterval(() => {
    if (typeof MP === 'undefined' || !document.getElementById('mpLive')) return;
    vzBuildUI();
    const n = vzRoomPeople(), b = document.getElementById('vzBtn'), N = document.getElementById('vzN');
    if (b && N) {
      N.textContent = n; N.classList.toggle('hidden', !n); b.classList.toggle('live', n > 0);
      b.title = n ? `Mensagem de voz para ${n} jogador${n > 1 ? 'es' : ''} ${vzRoomLabel()} (manter carregado · tecla V)` : 'Mensagem de voz: mantém carregado para falar (tecla V)';
    }
    if (!VZ.ready && MP.since) setTimeout(() => { VZ.ready = true; }, 1500);   // não toca o histórico antigo ao entrar
    if (VZ.on && mode !== 'game') vzStop(false);
  }, 700);
})();
