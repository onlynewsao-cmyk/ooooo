/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Multijogador + Chat ao vivo
   • Vês os outros jogadores na cidade e dentro dos edifícios
   • O nick aparece por cima de cada personagem
   • As mensagens aparecem num balão por cima do nick
   • Barra "AO VIVO" à direita com todas as mensagens
   • Filtro inteligente de ofensas (no servidor; cópia local offline)
   Carregado por último (depois de sound.js).
   ========================================================= */
const MP = {
  me: null, nick: '', since: 0, online: 1, others: new Map(), busy: false, room: 'rua', mute: 0,
  last: null, lastT: 0, cfgKey: '', ticks: 0, offline: false, myBub: null, err: 0, seen: new Set(),
  scope: localStorage.getItem('pe3d_scope') === 'perto' ? 'perto' : 'todos', heard: null, musT: 0, plOpen: false,
  cfgs: new Map(), need: [], sh: 0, shWant: +(localStorage.getItem('pe3d_sh') || 0) || 0, shards: [], shOn: 1, needCfg: false,
};
const MP_PERTO = 35, MP_OUVIR = 24, MP_BUB_MS = 30000; // balão fica 30 s na cabeça
const MP_RATE = 300;
/* cluster: cada cidade paralela vive num nó; todos os pedidos /api/ levam ?sh= para o balanceador encaminhar */
(function () {
  const _f = window.fetch.bind(window);
  window.fetch = function (u, o) {
    try { if (typeof u === 'string' && u.startsWith('/api/') && typeof MP !== 'undefined') { const s = MP.sh || MP.shWant; if (s) u += (u.includes('?') ? '&' : '?') + 'sh=' + s; } } catch (e) { }
    return _f(u, o);
  };
})();

/* ---------------- filtro local (modo offline) ---------------- */
const MPF = (() => {
  const base = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[0134@57!$]/g, c => ({ 0: 'o', 1: 'i', 3: 'e', 4: 'a', '@': 'a', 5: 's', 7: 't', '!': 'i', $: 's' })[c]);
  const col = s => s.replace(/(.)\1+/g, '$1');
  const BAD = new Set(('puta putas caralho caralhos krl crl krlh porra merda merdas mrd foda fodase fodasse foder fodido fodida fodam fode fodeu fodi fodes cona conas pila piroca cu cus cuzao cuzoes cabrao cabroes cabra corno cornos chifrudo viado viados paneleiro paneleiros maricas otario otaria otarios idiota idiotas imbecil imbecis estupido estupida estupidos burro burra burros retardado retardada mongoloide anormal vadia vadias vagabunda vagabundo desgracado desgracada nojento nojenta arrombado arrombada babaca escroto escrota buceta boceta xoxota bosta fdp pqp vsf vtnc tnc matumbo matumba macaco macaca ngulu porco porca fuck fucking fucker shit bitch bitches asshole nigger nigga niggas cunt dick motherfucker bastard').split(' ').map(col));
  const ROOTS = 'caralh fodid foder fodas putaria putinha merdinh cabron arromb desgrac retardad imbecil idiot estupid otari viadinh fuck motherf bitch nigg paneleir escrot vagabund'.split(' ').map(col);
  const PHR = 'filhodaputa filhadaputa filhodeumaputa putaquepariu putaqueopariu vaitefoder vaisefoder vaiafoder vaitomarnocu tomanocu tomarnocu enfianocu vaiprocaralho vaipocaralho voutematar voutefoder eutemato vouacabarcontigo voutepartir'.split(' ').map(col);
  const AME = new Set(['voutematar', 'eutemato', 'vouacabarcontigo', 'voutepartir']);
  const mau = tok => { const t = col(base(tok).replace(/[^a-z]/g, '')); if (!t) return false; return BAD.has(t) || (t.endsWith('s') && BAD.has(t.slice(0, -1))) || ROOTS.some(r => t.startsWith(r)); };
  return txt => {
    txt = String(txt || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    if (!txt) return { ok: false, erro: 'Mensagem vazia.' };
    if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ao|io|me|ly|gg)\b)/i.test(txt)) return { ok: false, erro: 'Links não são permitidos no chat.' };
    txt = txt.replace(/(?:\+?\d[\s.-]?){9,}/g, '[número escondido]');
    const L = txt.match(/\p{L}/gu) || []; if (L.length >= 8 && L.filter(c => c !== c.toLowerCase()).length / L.length > .7) txt = txt.toLowerCase();
    const toks = txt.split(' '), out = []; let hits = 0;
    for (let i = 0; i < toks.length;) {
      let j = i; while (j < toks.length && toks[j].replace(/[^a-zA-Z0-9@$!]/g, '').length === 1) j++;
      if (j - i >= 2 && mau(toks.slice(i, j).join(''))) { out.push('•'.repeat(j - i)); hits++; i = j; continue; }
      if (mau(toks[i])) { out.push(/\w/.test(toks[i]) ? toks[i].replace(/\w/g, '•') : '•••'); hits++; } else out.push(toks[i]);
      i++;
    }
    const glued = col(base(txt).replace(/[^a-z]/g, '')), fr = PHR.filter(p => glued.includes(p));
    if (fr.some(p => AME.has(p))) return { ok: false, erro: 'Ameaças não são permitidas. Joga com respeito.', hits: hits + 1 };
    if (fr.length || hits >= 3) return { ok: false, erro: 'Mensagem ofensiva bloqueada.', hits: hits + 1 };
    return { ok: true, txt: out.join(' '), hits };
  };
})();
let mpStrikes = [];

/* ---------------- UI ---------------- */
function mpBuildUI() {
  if (document.getElementById('mpLive')) return;
  const hud = document.getElementById('hud');
  const tags = document.createElement('div'); tags.id = 'mpTags'; document.body.insertBefore(tags, hud);
  const live = document.createElement('div'); live.id = 'mpLive';
  live.innerHTML = `<div class="mlh"><span class="mldot"></span><b>AO VIVO</b><button class="mlon" onclick="mpTogglePl()" title="Jogadores perto e longe"><i class="mlg"></i><span id="mpOn">1</span> online ▾</button><button id="mpMin" onclick="mpToggleLive()" aria-label="Minimizar">–</button></div><div id="mpPl" class="hidden"></div><div id="mpList"></div><button class="mlbtn" onclick="mpOpen()">💬 Escrever no chat…</button>`;
  hud.appendChild(live);
  if (localStorage.getItem('pe3d_livemin') === '1') live.classList.add('min');
  const bar = document.createElement('div'); bar.id = 'mpBar'; bar.className = 'hidden';
  const quick = ['Olá a todos! 👋', 'DarkCell, kambas!', 'Bora à farra? 🎶', 'Kkkk 😂', 'Fixe!', 'Onde estão?', 'Quem quer trabalhar comigo? 💼', 'Boa noite 🌙'];
  bar.innerHTML = `<div class="mpq">${quick.map(q => `<button type="button" onclick="mpSend(${JSON.stringify(q).replace(/"/g, '&quot;')})">${q}</button>`).join('')}</div><form id="mpForm"><button type="button" id="mpScope" onclick="mpSetScope()"></button><input id="mpIn" data-noic maxlength="120" autocomplete="off" enterkeyhint="send" placeholder="Diz algo a todos os jogadores…"><span id="mpCnt">0/120</span><button type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg></button><button type="button" class="mpx" onclick="mpClose()" aria-label="Fechar">✕</button></form><div id="mpWarn"></div>`;
  document.body.appendChild(bar);
  const inp = bar.querySelector('#mpIn');
  mpSetScope(MP.scope);
  ['keydown', 'keyup', 'keypress'].forEach(ev => inp.addEventListener(ev, e => { e.stopPropagation(); if (ev === 'keydown') { if (e.key === 'Escape') mpClose(); else if (e.key.length === 1 && (typeof SND !== 'undefined')) SND.play('key'); } }));
  inp.addEventListener('input', () => { document.getElementById('mpCnt').textContent = inp.value.length + '/120'; });
  inp.addEventListener('focus', () => { for (const k in keys) keys[k] = false; });
  bar.querySelector('#mpForm').addEventListener('submit', e => { e.preventDefault(); mpSend(inp.value); });
  // botão no dock
  const hb = document.querySelector('.hbtns');
  if (hb && !document.getElementById('hbChat')) { const b = document.createElement('button'); b.className = 'hb'; b.id = 'hbChat'; b.title = 'Chat'; b.onclick = mpOpen; b.innerHTML = '💬<span class="bd hidden" id="chBadge"></span><small>Chat</small>'; hb.appendChild(b); }
  const hint = document.querySelector('#hud .hint'); if (hint && !hint.innerHTML.includes('chat')) hint.insertAdjacentHTML('beforeend', ' · <kbd>Enter</kbd> chat');
  addEventListener('keydown', e => {
    if (mode !== 'game' || uiBlocked || document.activeElement === inp) return;
    if ((e.code === 'Enter' && !nearLoc) || e.key === '/') { e.preventDefault(); e.stopImmediatePropagation(); mpOpen(); }
  }, true);
  mpSys(MP.offline ? 'Modo offline: só tu vês as tuas mensagens. Joga na versão online para falares com outros jogadores.' : 'Bem-vindo(a) ao chat de Luanda! Sê respeitoso(a): ofensas são filtradas automaticamente.');
}
function mpToggleLive() { const l = document.getElementById('mpLive'); l.classList.toggle('min'); localStorage.setItem('pe3d_livemin', l.classList.contains('min') ? '1' : '0'); }
let mpUnread = 0;
function mpOpen(pre) {
  if (mode !== 'game') return;
  const bar = document.getElementById('mpBar'), inp = document.getElementById('mpIn');
  bar.classList.remove('hidden'); document.body.classList.add('chat-open');
  if (typeof pre === 'string') inp.value = pre;
  setTimeout(() => { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }, 30);
  mpUnread = 0; mpBadge(); if ((typeof SND !== 'undefined')) SND.play('tap');
}
function mpClose() { const bar = document.getElementById('mpBar'); if (!bar) return; bar.classList.add('hidden'); document.body.classList.remove('chat-open'); const i = document.getElementById('mpIn'); if (i) i.blur(); }
function mpBadge() { const b = document.getElementById('chBadge'); if (!b) return; b.textContent = mpUnread > 9 ? '9+' : mpUnread; b.classList.toggle('hidden', !mpUnread); }
function mpWarn(t, bad) {
  const w = document.getElementById('mpWarn'); if (!w) return;
  w.textContent = t || ''; w.className = t ? (bad ? 'bad' : 'ok') : ''; clearTimeout(w._t); if (t) w._t = setTimeout(() => { w.textContent = ''; w.className = ''; }, 5000);
}
const mpColor = s => `hsl(${phHash(String(s)) % 360},85%,72%)`;
function mpAddLine(m) {
  const list = document.getElementById('mpList'); if (!list) return;
  if (m.id && MP.seen.has(m.id)) return; if (m.id) MP.seen.add(m.id);
  const el = document.createElement('div'); el.className = 'mll' + (m.sys ? ' sys' : '') + (m.uid && m.uid === MP.me ? ' mine' : '');
  const dt_ = m.sys ? '' : mpDistTxt(m);
  el.innerHTML = m.sys ? `<span>${esc(m.txt)}</span>` : `<b style="color:${mpColor(m.nick)}">${esc(m.nick)}</b>${m.sc === 'perto' ? '<em class="pt">📍 perto</em>' : ''}${dt_ ? `<em>${dt_}</em>` : ''}<span>${esc(m.txt)}</span>`;
  if (m.sc === 'perto') el.classList.add('perto');
  if (!m.sys) el.onclick = () => mpOpen('@' + m.nick + ' ');
  list.appendChild(el);
  setTimeout(() => el.classList.add('old'), m.sys ? 9000 : 30000);
  while (list.children.length > 40) list.firstChild.remove();
  list.scrollTop = list.scrollHeight;
  if (!m.sys && m.uid !== MP.me && document.getElementById('mpBar').classList.contains('hidden')) { mpUnread++; mpBadge(); }
}
function mpSys(t) { mpAddLine({ sys: 1, txt: t }); }
function mpRoomName(r) { const b = r.split('@')[0], pv = r.split('@')[1], suf = pv && pv !== 'Luanda' ? ' · ' + pv : ''; if (b === 'rua') return 'na rua' + suf; if (b.startsWith('casa#')) return 'em casa' + suf; const L = LOC_POS[b.replace('iv:', '')]; return (L ? L.n : '') + suf; }

/* ---------------- enviar ---------------- */
async function mpSend(txt) {
  txt = String(txt || '').trim(); if (!txt) return;
  const inp = document.getElementById('mpIn');
  if (MP.offline || !(Acc.online && Acc.token)) {
    const r = MPF(txt), now = Date.now();
    if (r.hits) { mpStrikes = mpStrikes.filter(t => now - t < 300000).concat(now); if (mpStrikes.length >= 3) { MP.mute = now + 90000; mpStrikes = []; } }
    if (MP.mute > now) { mpWarn(`Estás silenciado(a) por mais ${Math.ceil((MP.mute - now) / 1000)} s por linguagem ofensiva.`, true); return; }
    if (!r.ok) { mpWarn(r.erro, true); if ((typeof SND !== 'undefined')) SND.play('err'); return; }
    if (r.hits) mpWarn(`Linguagem ofensiva filtrada. Aviso ${mpStrikes.length}/3.`, true);
    inp.value = ''; document.getElementById('mpCnt').textContent = '0/120';
    const m = { uid: 'me', nick: G.nome, txt: r.txt, room: MP.room, sc: MP.scope }; MP.me = 'me';
    mpAddLine(m); mpBubble('me', r.txt); if ((typeof SND !== 'undefined')) SND.play('send'); return;
  }
  try {
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify({ txt, scope: MP.scope }) });
    const d = await res.json();
    if (!d.ok) { mpWarn(d.erro || 'Não foi possível enviar.', true); if (d.aviso) setTimeout(() => mpWarn(d.aviso, true), 2600); if ((typeof SND !== 'undefined')) SND.play('err'); return; }
    inp.value = ''; document.getElementById('mpCnt').textContent = '0/120';
    if (d.aviso) mpWarn(d.aviso, true); else if (MP.scope === 'perto' && d.ouvintes === 0) mpWarn('📍 Ninguém está perto para te ouvir. Aproxima-te de alguém ou muda para 🌍 Todos.'); else if (MP.scope === 'perto') mpWarn(`📍 ${d.ouvintes} jogador${d.ouvintes > 1 ? 'es' : ''} perto ouviu a tua mensagem.`); else mpWarn('');
    mpAddLine(d.msg); mpBubble(d.msg.uid, d.msg.txt); if ((typeof SND !== 'undefined')) SND.play('send');
  } catch (e) { mpWarn('Sem ligação ao servidor.', true); }
}

/* ---------------- etiquetas (nick + balão) ---------------- */
const mpV = new T.Vector3(), mpBox = new T.Box3();
function mpTag(key, nick, mine) {
  const el = document.createElement('div'); el.className = 'ntag' + (mine ? ' me' : '');
  el.innerHTML = `<div class="nbub hidden"></div><div class="nnick"><i></i><span></span><b class="nmus">🎵</b><small class="ndist"></small></div>`;
  el.querySelector('.nnick span').textContent = nick;
  el.querySelector('.nnick i').style.background = mine ? '#ffd23f' : mpColor(nick);
  if (!mine) el.querySelector('.nnick').onclick = () => mpOpen('@' + nick + ' ');
  document.getElementById('mpTags').appendChild(el);
  return el;
}
function mpHeight(g) { g.updateMatrixWorld(true); mpBox.setFromObject(g); return Math.max(.8, mpBox.max.y - g.position.y); }
function mpBubble(uid, txt) {
  let tag = null;
  if (uid === MP.me || uid === 'me') tag = MP.myTag; else { const o = MP.others.get(uid); if (o) tag = o.tag; }
  if (!tag) return;
  const b = tag.querySelector('.nbub'); b.textContent = txt; b.classList.remove('hidden', 'pop'); void b.offsetWidth; b.classList.add('pop');
  b._w = b.offsetWidth || 160; b._h = b.offsetHeight || 34;
  clearTimeout(b._t); b.classList.remove('out'); clearTimeout(b._t2); b._t2 = setTimeout(() => b.classList.add('out'), MP_BUB_MS - 2500); b._t = setTimeout(() => b.classList.add('hidden'), MP_BUB_MS);
}
function mpPlace(tag, g, h, show) {
  tag._vis = false;
  if (!show) { if (tag.style.display !== 'none') tag.style.display = 'none'; return; }
  mpV.set(g.position.x, g.position.y + h + .18, g.position.z);
  const dist = camera.position.distanceTo(mpV);
  mpV.project(camera);
  if (mpV.z > 1 || mpV.z < -1 || dist > 70 || Math.abs(mpV.x) > 1.2 || Math.abs(mpV.y) > 1.2) { tag.style.display = 'none'; return; }
  tag.style.display = '';
  const x = (mpV.x + 1) / 2 * innerWidth, y = (1 - mpV.y) / 2 * innerHeight;
  const s = Math.max(.62, Math.min(1.08, 14 / dist));
  tag._vis = true; tag._x = x; tag._y = y; tag._s = s; tag._z = 1000 - Math.round(dist);
  tag.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%) scale(${s.toFixed(3)})`;
  tag.style.opacity = dist > 45 ? Math.max(0, (70 - dist) / 25).toFixed(2) : '';
  tag.style.zIndex = String(1000 - Math.round(dist));
}

/* ---------------- jogadores remotos ---------------- */
function mpScene() { return (typeof inInt !== 'undefined' && inInt) ? inInt.sc : worldScene; }
function mpRoom() { const pv = (typeof G !== 'undefined' && G && G.cidade) ? '@' + G.cidade.prov : ''; if (typeof inInt !== 'undefined' && inInt) return (inInt.loc === 'casa' ? 'casa#' + (MP.me || 'eu') : 'iv:' + inInt.loc) + pv; return 'rua' + pv; }
function mpRemove(id) { const o = MP.others.get(id); if (!o) return; if (o.h && o.h.g.parent) o.h.g.parent.remove(o.h.g); o.tag.remove(); MP.others.delete(id); }
function mpApply(ps) {
  const sc = mpScene(), ids = new Set(); MP.need = [];
  for (const p of ps) {
    ids.add(p.id);
    let o = MP.others.get(p.id);
    /* aparência só vem quando muda (cv = versão); pedimos as que faltam no próximo envio */
    if (p.cfg) MP.cfgs.set(p.id, { cv: p.cv || JSON.stringify(p.cfg), cfg: p.cfg });
    const cc = MP.cfgs.get(p.id), ok = cc && (!p.cv || cc.cv === p.cv);
    if (!ok) { if (MP.need.length < 10) MP.need.push(p.id); if (!o) continue; }
    const ck = ok ? cc.cv : (o && o.ck);
    if (o && o.ck !== ck) { mpRemove(p.id); o = null; }
    if (!o) {
      let h; try { h = makeHuman(cc.cfg); } catch (e) { continue; }
      h.g.position.set(p.x, 0, p.z); h.g.rotation.y = p.yaw;
      o = { h, s0: h.g.scale.x, ck, x: p.x, z: p.z, yaw: p.yaw, tx: p.x, tz: p.z, tyaw: p.yaw, mv: 0, nick: p.nick, tag: mpTag(p.id, p.nick, false), hgt: 0 };
      MP.others.set(p.id, o);
    }
    if (o.h.g.parent !== sc) { if (o.h.g.parent) o.h.g.parent.remove(o.h.g); sc.add(o.h.g); o.h.g.scale.setScalar(o.s0 * (sc === worldScene ? BODY_S : 1)); o.hgt = 0; }
    if (Math.hypot(p.x - o.x, p.z - o.z) > 20) { o.x = p.x; o.z = p.z; }
    o.tx = p.x; o.tz = p.z; o.tyaw = p.yaw; o.mv = p.mv;
    if (JSON.stringify(o.mu) !== JSON.stringify(p.mu)) { o.mu = p.mu; o.muT = performance.now(); }
    if ((o.vh || '') !== (p.vh || '')) { o.vh = p.vh || ''; o.tag.classList.toggle('vtrip', !!o.vh); }
    if (p.em && o.h.emote !== p.em) { o.h.emote = p.em; o.h.emoteT = typeof emDur === 'function' ? emDur(p.em) : 1.8; o.h.emAge = 0; }
    if (o.nick !== p.nick) { o.nick = p.nick; o.tag.querySelector('.nnick span').textContent = p.nick; }
  }
  for (const id of [...MP.others.keys()]) if (!ids.has(id)) mpRemove(id);
  if (MP.cfgs.size > 300) for (const id of [...MP.cfgs.keys()]) if (!ids.has(id)) MP.cfgs.delete(id);
}
function mpFrame(dt) {
  const rm = mpRoom(); if (rm !== MP.room) { MP.room = rm; for (const id of [...MP.others.keys()]) mpRemove(id); }
  const show = mode === 'game' && !document.getElementById('hud').classList.contains('hidden');
  for (const o of MP.others.values()) {
    const k = Math.min(1, dt * 7);
    o.x += (o.tx - o.x) * k; o.z += (o.tz - o.z) * k;
    let dy = o.tyaw - o.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); o.yaw += dy * Math.min(1, dt * 10);
    o.h.g.position.set(o.x, 0, o.z); o.h.g.rotation.y = o.yaw;
    const moving = o.mv > 0 || Math.hypot(o.tx - o.x, o.tz - o.z) > .12;
    try { animHuman(o.h, dt, moving, o.mv === 2); } catch (e) { }
    if (!o.hgt) o.hgt = mpHeight(o.h.g);
    o.d = Math.hypot(o.x - playerPos.x, o.z - playerPos.z);
    const dl = o.d > 18 ? (Math.round(o.d / 5) * 5) + ' m' : '';
    if (o.dl !== dl) { o.dl = dl; o.tag.querySelector('.ndist').textContent = dl; }
    const mus = !!o.mu; if (o.musC !== mus) { o.musC = mus; o.tag.classList.toggle('mus', mus); }
    mpPlace(o.tag, o.h.g, o.hgt, show && o.h.g.parent === mpScene());
  }
  if (player && G) {
    if (MP.myPlayer !== player || MP.myS !== player.g.scale.x) { MP.myPlayer = player; MP.myS = player.g.scale.x; MP.myH = 0; }
    if (!MP.myTag) MP.myTag = mpTag('me', G.nome, true);
    const nm = MP.myTag.querySelector('.nnick span'); const want = MP.nick || G.nome; if (nm.textContent !== want) nm.textContent = want;
    if (!MP.myH) MP.myH = mpHeight(player.g);
    const myMus = !!((typeof SND !== 'undefined') && SND.RADIO.on); if (MP.myMus !== myMus) { MP.myMus = myMus; MP.myTag.classList.toggle('mus', myMus); }
    mpPlace(MP.myTag, player.g, MP.myH, show && !dying);
  } else if (MP.myTag) MP.myTag.style.display = 'none';
  mpDeclutter();
}
/* balões de conversa não se sobrepõem: os mais perto ficam no sítio, os outros sobem */
function mpDeclutter() {
  const L = [];
  const add = t => { if (!t || !t._vis) return; const b = t.querySelector('.nbub'); if (!b || b.classList.contains('hidden')) return; L.push({ t, w: (b._w || 160) * t._s, h: ((b._h || 34) + 30) * t._s }); };
  for (const o of MP.others.values()) add(o.tag); add(MP.myTag);
  if (L.length < 2) return;
  L.sort((a, b) => b.t._z - a.t._z);
  const done = [];
  for (const r of L) {
    let y = r.t._y, moved = false;
    for (let k = 0; k < 6; k++) {
      const hit = done.find(d => Math.abs(d.x - r.t._x) < (d.w + r.w) / 2 && y > d.y - d.h && y - r.h < d.y);
      if (!hit) break; y = hit.y - hit.h - 2; moved = true;
    }
    done.push({ x: r.t._x, y, w: r.w, h: r.h });
    if (moved) r.t.style.transform = `translate(${r.t._x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%) scale(${r.t._s.toFixed(3)})`;
  }
}
(function () { const _u = updateWorld; updateWorld = function (dt) { const r = _u.apply(this, arguments); try { mpFrame(dt); MP.musT += dt; if (MP.musT > .25) { MP.musT = 0; mpMusic(); } } catch (e) { console.error(e); } return r; }; })();

/* ---------------- ligação ao servidor (presença a cada 0,3 s) ---------------- */
async function mpTick() {
  let wait = MP_RATE;
  try {
    if (MP.offline) { wait = 60000; return; }
    if (!(Acc.online && Acc.token && G && player && mode === 'game')) { wait = 1000; return; }
    if (MP.busy) return;
    const room = mpRoom();
    if (room !== MP.room) { MP.room = room; MP.roomN = -1; for (const id of [...MP.others.keys()]) mpRemove(id); }
    const now = performance.now(), p = playerPos;
    let mv = 0;
    if (MP.last) { const sp = Math.hypot(p.x - MP.last.x, p.z - MP.last.z) / Math.max(.05, (now - MP.lastT) / 1000); mv = sp > 7 ? 2 : sp > .4 ? 1 : 0; }
    MP.last = { x: p.x, z: p.z }; MP.lastT = now;
    const cfg = playerCfg(), ck = JSON.stringify(cfg);
    const body = { room, x: +p.x.toFixed(2), z: +p.z.toFixed(2), yaw: +playerYaw.toFixed(3), mv, em: player.emoteT > 0 ? player.emote : null, nick: G.nome, since: MP.since, mu: (typeof SND !== 'undefined') && SND.RADIO.on ? [SND.RADIO.idx, +SND.RADIO.pos().toFixed(1)] : null }; body.dv = typeof DEV_ID !== 'undefined' ? DEV_ID : '';
    if (typeof LIVE !== 'undefined') Object.assign(body, LIVE.mpBody());
    if (ck !== MP.cfgKey || MP.needCfg || MP.ticks % 200 === 0) { body.cfg = cfg; MP.cfgKey = ck; }
    body.cv = 1; if (MP.need.length) body.need = MP.need.slice(0, 10);
    if (MP.shWant) { body.sh = MP.shWant; if (MP.sh === MP.shWant) MP.shWant = 0; }
    if (G) body.kz = Math.round(G.dinheiro);
    MP.ticks++; MP.busy = true;
    const r = await fetch('/api/mp', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify(body) });
    MP.busy = false;
    if (!r.ok) {   // servidor ocupado (429) ou nó em baixo (502/503): espera mais e, se persistir, pede outra cidade
      MP.err++; wait = Math.min(8000, 1500 * MP.err);
      if (MP.err >= 4 && r.status >= 500) { MP.sh = 0; MP.shWant = 0; MP.since = 0; }
      return;
    }
    const t0 = now; const d = await r.json(); MP.err = 0;
    if (d.move) { MP.sh = 0; MP.shWant = d.move; MP.since = 0; wait = 60; return; }   // a cidade pedida está noutro servidor
    if (typeof LIVE !== 'undefined') try { LIVE.onMp(d, (performance.now() - t0) / 2000); } catch (e) { console.error(e); }
    MP.me = d.me; MP.nick = d.nick; MP.online = d.online; MP.needCfg = !!d.needCfg; MP.pm = +d.pm || 1;
    if (d.sh) { if (MP.sh && MP.sh !== d.sh) { for (const id of [...MP.others.keys()]) mpRemove(id); MP.since = 0; mpSys(`Estás agora em Luanda ${d.sh}.`); } MP.sh = d.sh; MP.shOn = d.shOn; MP.shards = d.shards || []; MP.shCap = d.shCap; localStorage.setItem('pe3d_sh', d.sh); }
    const on = document.getElementById('mpOn'); if (on) on.textContent = d.online;
    if (MP.room === room) mpApply(d.players || []);
    {   // salas: ao entrar num prédio diz quantas pessoas lá estão; avisa quando entra alguém
      const nn = (d.players || []).length, iv = room.split('@')[0] !== 'rua' && !room.startsWith('casa#');
      if (MP.roomN === -1) { if (iv) toast(nn ? `👥 ${nn === 1 ? '1 pessoa está' : nn + ' pessoas estão'} aqui em ${mpRoomName(room)} — falem no chat ou por voz.` : `🚪 ${mpRoomName(room)}: és o(a) único(a) aqui dentro por agora.`); }
      else if (iv && nn > MP.roomN) mpSys(nn - MP.roomN === 1 ? 'Alguém entrou na sala.' : `${nn - MP.roomN} pessoas entraram na sala.`);
      MP.roomN = nn;
    }
    if (MP.plOpen) mpRenderPl(d.online);
    const first = !MP.since;
    for (const m of d.chat || []) {
      MP.since = Math.max(MP.since, m.id);
      if (MP.seen.has(m.id)) continue;
      mpAddLine(m);
      if (!m.sys && !first && m.uid !== MP.me) { mpBubble(m.uid, m.txt); if ((typeof SND !== 'undefined') && MP.others.has(m.uid)) SND.play('recv'); }
    }
    if (first && d.online <= 1) mpSys('Estás sozinho(a) na cidade agora. Partilha o link do jogo com os teus kambas para jogarem juntos!');
    if (document.hidden) wait = 2000;
    else if (!MP.others.size && !MP.plOpen) wait = 900;   // sozinho(a): pergunta menos vezes ao servidor
    else if (!MP.plOpen) {   // ritmo adaptativo: rápido só quando há alguém mesmo perto (menos carga no servidor)
      let dm = 1e9; for (const o of MP.others.values()) if (o.d != null && o.d < dm) dm = o.d;
      wait = dm < 35 ? MP_RATE : dm < 80 ? 450 : 650;
    }
    if (MP.pm > 1) wait = Math.round(wait * MP.pm);   // o servidor pede calma quando há muita gente (ex.: 10 000 online)
  } catch (e) { MP.busy = false; MP.err++; wait = 2000; }
  finally { setTimeout(mpTick, wait); }
}

/* ---------------- perto e longe ---------------- */
function mpSetScope(v) {
  MP.scope = v || (MP.scope === 'perto' ? 'todos' : 'perto'); localStorage.setItem('pe3d_scope', MP.scope);
  const b = document.getElementById('mpScope'); if (!b) return;
  b.className = MP.scope; b.innerHTML = MP.scope === 'perto' ? '📍 <span>Perto</span>' : '🌍 <span>Todos</span>';
  b.title = MP.scope === 'perto' ? `Só quem está a menos de ${MP_PERTO} m recebe` : 'Todos os jogadores recebem';
  const i = document.getElementById('mpIn'); if (i) i.placeholder = MP.scope === 'perto' ? `Falar só com quem está perto (${MP_PERTO} m)…` : 'Diz algo a todos os jogadores…';
  if (v === undefined) mpWarn(MP.scope === 'perto' ? `📍 Modo Perto: só quem está a menos de ${MP_PERTO} m vê a mensagem.` : '🌍 Modo Todos: a mensagem vai para a cidade inteira.');
}
function mpDistTxt(m) {
  if (m.uid === MP.me || m.uid === 'me') return '';
  if (m.room && m.room !== '*' && m.room !== MP.room) return mpRoomName(m.room);
  const o = MP.others.get(m.uid); if (!o) return 'longe';
  const d = o.d != null ? o.d : Math.hypot(o.x - playerPos.x, o.z - playerPos.z);
  return d < 6 ? 'ao teu lado' : d > 70 ? 'longe' : `a ${Math.round(d)} m`;
}
function mpTogglePl() { MP.plOpen = !MP.plOpen; document.getElementById('mpPl').classList.toggle('hidden', !MP.plOpen); if (MP.plOpen) mpRenderPl(MP.online); }
function mpRenderPl(online) {
  const el = document.getElementById('mpPl'); if (!el) return;
  const os = [...MP.others.entries()].map(([id, o]) => ({ id, o, d: o.d != null ? o.d : Math.hypot(o.x - playerPos.x, o.z - playerPos.z) })).sort((a, b) => a.d - b.d);
  const fora = Math.max(0, (online || 1) - 1 - os.length);
  const zona = d => d < MP_PERTO ? '<em class="z1">perto</em>' : d < 80 ? '<em class="z2">médio</em>' : '<em class="z3">longe</em>';
  el.innerHTML = `<div class="plh">${MP.room.split('@')[0] === 'rua' ? 'Na rua contigo' : 'Aqui em ' + esc(mpRoomName(MP.room))}</div>` + (os.length ? os.map(({ id, o, d }) => `<button class="plr" onclick="mpOpen('@${esc(o.nick).replace(/'/g, '')} ')"><i style="background:${mpColor(o.nick)}"></i><b>${esc(o.nick)}</b>${o.mu ? '<span class="plm">🎵</span>' : ''}${o.vh ? `<span class="plm">${o.vh.startsWith('plane') ? '✈️' : o.vh.startsWith('train') ? '🚆' : o.vh.startsWith('bike') ? '🚲' : o.vh.startsWith('moto') ? '🏍️' : '🚗'}</span>` : ''}${zona(d)}<small>${Math.round(d)} m</small></button>`).join('') : '<div class="ple">Ninguém por perto.</div>')
    + (fora ? `<div class="plf">+${fora} noutros sítios da cidade</div>` : '') + `<div class="plf">📍 Perto = até ${MP_PERTO} m · 🎵 ouves a música a até ${MP_OUVIR} m</div>`;
}
/* minimapa: pontos dos outros jogadores */
if (typeof drawMinimap === 'function') {
  const _dm = drawMinimap;
  drawMinimap = function () {
    _dm.apply(this, arguments);
    try {
      if (MP.room !== 'rua' || !MP.others.size || !minimapCtx) return;
      const c = minimapCtx, W = c.canvas.width, H = c.canvas.height, S = 1.05;
      for (const o of MP.others.values()) {
        let X = W / 2 + (o.x - playerPos.x) * S, Z = H / 2 + (o.z - playerPos.z) * S; const out = X < 5 || X > W - 5 || Z < 5 || Z > H - 5;
        X = Math.max(5, Math.min(W - 5, X)); Z = Math.max(5, Math.min(H - 5, Z));
        c.globalAlpha = out ? .6 : 1; c.fillStyle = mpColor(o.nick); c.strokeStyle = '#fff'; c.lineWidth = 2;
        c.beginPath(); c.arc(X, Z, out ? 3.5 : 5, 0, Math.PI * 2); c.fill(); c.stroke();
        if (o.mu && !out) { c.strokeStyle = 'rgba(255,92,138,.8)'; c.lineWidth = 1.5; c.beginPath(); c.arc(X, Z, 8 + (performance.now() / 120 % 6), 0, Math.PI * 2); c.stroke(); }
        c.globalAlpha = 1;
      }
    } catch (e) { }
  };
}
/* música por proximidade: ouves o telemóvel de quem está perto */
function mpMusic() {
  if (!(typeof SND !== 'undefined') || !SND.ctx || SND.ctx.state !== 'running') return;
  const R = SND.RADIO;
  if (R.on) { MP.heard = null; return; }
  let best = null;
  for (const [id, o] of MP.others) if (o.mu && o.d != null && o.d <= MP_OUVIR && o.h.g.parent === mpScene() && (!best || o.d < best.o.d)) best = { id, o };
  if (!best) { if (R.nearOn) R.nearStop(); MP.heard = null; return; }
  const o = best.o, k = 1 - o.d / MP_OUVIR, gain = .9 * Math.pow(k, 1.6);
  const rx = Math.cos(camYaw), rz = -Math.sin(camYaw), dx = o.x - playerPos.x, dz = o.z - playerPos.z, dd = Math.max(.5, Math.hypot(dx, dz));
  const pan = Math.max(-1, Math.min(1, (dx * rx + dz * rz) / dd)) * .85;
  const exp = o.mu[1] + (performance.now() - (o.muT || performance.now())) / 1000 + .3;
  if (!R.nearOn || R.idx !== o.mu[0] || Math.abs(R.rawPos() - exp) > 2.5) R.near(o.mu[0], exp, gain, pan); else R.nearSet(gain, pan);
  const key = best.id + ':' + o.mu[0];
  if (MP.heard !== key) { MP.heard = key; const T = R.TRACKS[o.mu[0]]; if (T) mpSys(`🎵 Estás a ouvir “${T.t}” do telemóvel de ${o.nick}`); }
}

/* ---------------- arranque ---------------- */
(function mpBoot() {
  const go = () => {
    if (!document.getElementById('hud')) return setTimeout(go, 300);
    MP.offline = location.protocol === 'file:';
    mpBuildUI();
    setTimeout(mpTick, 800);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
