/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Interface
   ========================================================= */
let panelId = null, panelTab = {}, busy = false, modalOpen = false, phoneApp = null;
let regData = null, crAv = null, crMode = 'reg', crAge = 25, crTouchedG = false;

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function showOv(id) { ['ovTitle', 'ovCreate', 'hud', 'death'].forEach(x => $('#' + x).classList.toggle('hidden', x !== id)); }
function toast(msg) {
  const t = $('#toast'); t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 3000);
}
function flash(msg) { const f = $('#flash'); f.innerHTML = msg; f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
function floatStat(k, d) {
  if (mode !== 'game') return;
  const el = document.createElement('div'); el.className = 'float ' + (d > 0 ? 'up' : 'down');
  el.textContent = `${d > 0 ? '+' : ''}${d} ${SHORT[k]}`; el.style.left = (45 + Math.random() * 10) + '%';
  $('#floats').appendChild(el); setTimeout(() => el.remove(), 1600);
}
function openModal(html, closable = true) {
  modalOpen = true; uiBlocked = true;
  $('#modalBox').innerHTML = html; $('#modal').classList.remove('hidden'); $('#modalBox').scrollTop = 0;
  $('#modal').onclick = e => { if (closable && e.target.id === 'modal') closeModal(); };
}
function closeModal() { $('#modal').classList.add('hidden'); modalOpen = false; uiBlocked = !!panelId || !!phoneApp || mode !== 'game'; }
const myShot = () => G ? avatarShot(playerCfg()) : '';

/* =========================================================
   CONTA: ENTRAR / CRIAR
   ========================================================= */
function setSession(r) {
  USER = r.user; meta = r.meta || { karmaBonus: 0, vidas: [] }; if (!meta.vidas) meta.vidas = [];
  G = r.save && r.save.v === 2 && r.save.vivo ? r.save : null;
  if (G && !G.semApelidos) { // vidas antigas: tirar os sobrenomes automáticos
    const first = (USER.nome || '').trim().split(/\s+/)[0];
    if (first && semApelido(G.nome) === first) G.nome = USER.nome.trim().replace(/\s+/g, ' ').slice(0, 24);
    const fix = o => { if (o && o.nome) o.nome = semApelido(o.nome); };
    ['pai', 'mae', 'parceiro', 'conjuge', 'ex'].forEach(k => fix(G[k]));
    ['irmaos', 'amigos', 'filhos', 'ex', 'familia'].forEach(k => Array.isArray(G[k]) && G[k].forEach(fix));
    G.semApelidos = 1;
  }
}
function goTitle() {
  mode = 'title'; curScene = showScene; layoutTitle(); showOv('ovTitle'); closePanel(); closePhone(); closeModal();
  document.querySelectorAll('.ntag').forEach(t => t.style.display = 'none');
  const logged = !!USER;
  $('#authBox').classList.toggle('hidden', logged); $('#menuBox').classList.toggle('hidden', !logged);
  $('#ovTitle').classList.toggle('auth', !logged);
  $('#aMode').innerHTML = Acc.online ? '<svg style="width:14px;height:14px;color:#2ecc71"><use href="#icShield"/></svg> A tua conta e as tuas vidas ficam guardadas na nuvem.' : 'Modo local — a conta fica guardada neste navegador.';
  const ts = $('#tStat'); if (ts) { ts.textContent = Acc.online ? 'Servidor online' : 'Modo local'; ts.parentNode.classList.toggle('off', !Acc.online); }
  if (logged) {
    let im = ''; try { if (USER.avatar && USER.avatar.genero) im = avatarShot(avatarCfg(USER.avatar, 'casual', G ? Math.max(16, G.idade) : 25), '#1c1a22', true); } catch (e) { }
    $('#hello').innerHTML = `<div class="hav">${im ? `<img src="${im}" alt="">` : ''}<div><big>Olá, ${esc(USER.nome)}</big>${G ? `A viver como <b>${esc(G.nome)}</b> · ${G.idade} anos` : 'Pronto(a) para começar uma nova vida?'}</div></div>`;
    $('#btnContinue').classList.toggle('hidden', !G);
  }
}
function authTab(t) {
  $('#tLogin').classList.toggle('on', t === 'login'); $('#tReg').classList.toggle('on', t === 'reg');
  $('#fLogin').classList.toggle('hidden', t !== 'login'); $('#fReg').classList.toggle('hidden', t !== 'reg');
  $('#lErr').textContent = ''; $('#rErr').textContent = '';
  const h = $('#aHead'), sb = $('#aSub');
  if (h) { h.textContent = t === 'reg' ? 'Cria a tua conta' : 'Bem-vindo(a) de volta'; sb.textContent = t === 'reg' ? 'Leva menos de um minuto. Depois crias o teu avatar.' : 'Entra para continuar a tua vida.'; }
}
function togglePass(id, b) { const i = $('#' + id); if (!i) return; const show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.classList.toggle('on', show); b.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha'); }
async function doLogin(e) {
  e.preventDefault(); const err = $('#lErr'); err.textContent = '';
  const b = e.submitter || $('#fLogin button'); b.disabled = true; b.textContent = 'A entrar…';
  try { const r = await Acc.login($('#lEmail').value.trim(), $('#lPass').value); setSession(r); $('#lPass').value = ''; goTitle(); toast(`👋 Bem-vindo(a) de volta, ${esc(USER.nome)}!`); }
  catch (x) { err.textContent = x.message; }
  b.disabled = false; b.textContent = '▶ Entrar';
}
function regNext(e) {
  e.preventDefault(); const err = $('#rErr'); err.textContent = '';
  const d = { nome: $('#rNome').value.trim().replace(/\s+/g, ' '), email: $('#rEmail').value.trim().toLowerCase(), senha: $('#rPass').value, adulto: $('#r18').checked };
  if (d.nome.length < 2) return err.textContent = 'O nome precisa de pelo menos 2 letras.';
  if (!/^[\wÀ-ÖØ-öø-ÿ]+(?: [\wÀ-ÖØ-öø-ÿ]+)*$/.test(d.nome) || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(d.nome)) return err.textContent = 'O nome só pode ter letras, números e _ (sem emojis nem símbolos). Ex.: draka, _draka_, draka_4.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return err.textContent = 'E-mail inválido.';
  if (d.senha.length < 6) return err.textContent = 'A senha precisa de pelo menos 6 caracteres.';
  if (d.senha !== $('#rPass2').value) return err.textContent = 'As senhas não coincidem.';
  regData = d; openCreator('reg');
}
async function doLogout() {
  if (!confirm('Terminar sessão? A tua vida fica guardada na conta.')) return;
  save(); await Acc.logout(); USER = null; G = null; meta = { karmaBonus: 0, vidas: [] }; goTitle(); authTab('login');
}

/* ---------------- CRIADOR DE AVATAR ---------------- */
let crTab = 'corpo', crShotTok = 0;
const CR_TABS = [['corpo', '🧍', 'Corpo'], ['cabelo', '💇', 'Cabelo'], ['rosto', '🙂', 'Rosto'], ['roupa', '👕', 'Roupa']];
const CR_BASE = { M: 'domingos', F: 'ndalu' };
function crDefaults(g) {
  return g === 'F' ? { base: CR_BASE.F, cabelo: 'longo', corCabelo: '#0d0d0d', rosto: ['earrings', 'lipstick'], corpo: 1, altura: 1, olhos: EYES[0][0], cara: 0, olhar: 0, nariz: 1, labios: 1, sobr: 0, cima: 'blusa', baixo: 'saia', estampa: 'flores', acess: ['bolsa', 'pulseiras'] }
    : { base: CR_BASE.M, cabelo: 'short', corCabelo: '#0d0d0d', rosto: [], corpo: 1, altura: 1, olhos: EYES[0][0], cara: 0, olhar: 0, nariz: 1, labios: 1, sobr: 0, cima: 'tshirt', baixo: 'calcas', estampa: 'logo', acess: ['watch'] };
}
function crFixGender(a) {
  const G2 = GEN[a.genero] || GEN.M, d = crDefaults(a.genero);
  a.base = CR_BASE[a.genero];
  if (!G2.hairs.includes(a.cabelo)) a.cabelo = d.cabelo;
  a.rosto = (a.rosto || []).filter(x => G2.face.includes(x));
  if (a.genero === 'F' && !a._semBrinco && !a.rosto.includes('earrings')) a.rosto.push('earrings');
  if (!G2.cima.some(c => c[0] === a.cima)) a.cima = d.cima;
  if (!G2.baixo.some(c => c[0] === a.baixo)) a.baixo = d.baixo;
  if (!G2.estampas.includes(a.estampa)) a.estampa = d.estampa;
  a.acess = Array.isArray(a.acess) ? a.acess.filter(x => G2.acess.includes(x)) : d.acess.slice();
}
function openCreator(m) {
  crMode = m; crAge = 25; crTouchedG = m === 'edit'; crTab = 'corpo';
  const g = chance(.5) ? 'M' : 'F';
  const def = Object.assign({ genero: g, pele: pick(SKINS.slice(2)), roupa: CLOTH[0], calcas: PANTS[0], sapatos: SHOES[0] }, crDefaults(g));
  crAv = m === 'edit' && USER.avatar && USER.avatar.base ? Object.assign(def, presetFromChar(USER.avatar.base, USER.avatar.genero === 'F'), USER.avatar) : def;
  crFixGender(crAv);
  if (m === 'reg') crAv.adulto = regData.adulto; else crAv.adulto = USER.adulto;
  mode = 'select'; curScene = showScene; showOv('ovCreate');
  $('#crLeft').innerHTML = '';
  renderCreator();
}
function crSet(k, v) {
  crAv[k] = v;
  if (k === 'genero') { crTouchedG = true; const d = crDefaults(v); crAv.cabelo = d.cabelo; crAv.cima = d.cima; crAv.baixo = d.baixo; crAv.rosto = d.rosto.slice(); crAv.estampa = d.estampa; crAv.acess = d.acess.slice(); crFixGender(crAv); }
  renderCreator(k !== 'genero');
}
function crFace(x) { const r = new Set(crAv.rosto || []); r.has(x) ? r.delete(x) : r.add(x); if (x === 'earrings') crAv._semBrinco = !r.has(x); crAv.rosto = [...r]; renderCreator(true); }
function crAcess(x) { const r = new Set(crAv.acess || []); r.has(x) ? r.delete(x) : r.add(x); crAv.acess = [...r]; renderCreator(true); }
function crTabSet(t) { crTab = t; renderCreator(); }
function crRandom() {
  const g = crTouchedG ? crAv.genero : (chance(.5) ? 'M' : 'F'), G2 = GEN[g];
  crAv = Object.assign(crAv, crDefaults(g), { genero: g, pele: pick(SKINS), roupa: pick(CLOTH), calcas: pick(PANTS), sapatos: pick(SHOES) });
  crAv.cabelo = pick(G2.hairs); crAv.cima = pick(G2.cima)[0]; crAv.baixo = pick(G2.baixo)[0];
  crAv.corCabelo = chance(.7) ? HAIR_COLORS[R(0, 2)][0] : pick(HAIR_COLORS)[0];
  crAv.olhos = chance(.8) ? EYES[R(0, 1)][0] : pick(EYES)[0];
  crAv.corpo = pick(BUILDS)[0]; crAv.altura = pick(HEIGHTS)[0];
  crAv.rosto = g === 'F' ? ['earrings'].concat(chance(.4) ? ['lipstick'] : [], chance(.2) ? ['glasses'] : []) : [chance(.4) ? 'beard' : chance(.3) ? 'goatee' : chance(.3) ? 'mustache' : null, chance(.2) ? 'glasses' : null].filter(Boolean);
  Object.assign(crAv, (f => ({ cara: f.s, olhar: f.e, nariz: f.n, labios: f.l, sobr: f.b }))(face8Rand()));
  crAv.estampa = pick(G2.estampas); crAv.acess = G2.acess.filter(() => chance(.28)).slice(0, 3);
  crAv._semBrinco = false; renderCreator(true);
}
function crPreviewCfg(over) { return avatarCfg(Object.assign({}, crAv, over || {}), 'casual', 25); }
function renderCreator(keep) {
  const a = crAv, body = $('#crBody'), st = keep && body ? body.scrollTop : 0, G2 = GEN[a.genero] || GEN.M, F = a.genero === 'F';
  showZoom = crTab === 'cabelo' || crTab === 'rosto' ? 1 : 0;
  showPreview(crPreviewCfg());
  const sw = (arr, k, names) => `<div class="sw">${arr.map((c, i) => `<button style="background:${c}" class="${a[k] === c ? 'on' : ''}" onclick="crSet('${k}','${c}')" title="${names ? names[i] : ''}" aria-label="${names ? names[i] : c}"></button>`).join('')}</div>`;
  const seg = (arr, k, str) => `<div class="seg">${arr.map(([v, l]) => `<button class="${a[k] === v ? 'on' : ''}" onclick="crSet('${k}',${str ? `'${v}'` : v})">${l}</button>`).join('')}</div>`;
  const sec = (t, h, extra = '') => `<div class="crrow"><div class="crsec">${t}${extra}</div>${h}</div>`;
  const nm = (arr, v) => ` <small>${(arr.find(c => c[0] === v) || ['', ''])[1]}</small>`;
  let h = '';
  if (crTab === 'corpo') h = sec('Cor da pele', sw(SKINS, 'pele'))
    + sec('Corpo', seg(BUILDS.map((b, i) => [b[0], G2.builds[i]]), 'corpo'))
    + sec('Altura', seg(HEIGHTS.map(x => [x[0], F ? x[1].replace(/o$/, 'a') : x[1]]), 'altura'));
  if (crTab === 'cabelo') h = sec('Penteado', `<div class="hairs">${G2.hairs.map(id => `<button class="hairb ${a.cabelo === id ? 'on' : ''}" onclick="crSet('cabelo','${id}')"><img data-hair="${id}" alt=""><span>${HAIRS.find(x => x.id === id).t}</span></button>`).join('')}</div>`)
    + (a.cabelo === 'bald' || a.cabelo === 'wrap' ? '' : sec('Cor do cabelo', sw(HAIR_COLORS.map(c => c[0]), 'corCabelo', HAIR_COLORS.map(c => c[1])), nm(HAIR_COLORS, a.corCabelo)));
  const F8 = FACE8[F ? 'F' : 'M'], thumbs = (arr, k) => `<div class="hairs ${arr.length % 3 === 0 ? 'h3' : ''}">${arr.map(([t], i) => `<button class="hairb ${(a[k] | 0) === i ? 'on' : ''}" onclick="crSet('${k}',${i})"><img data-f8="${k}" data-i="${i}" alt=""><span>${t}</span></button>`).join('')}</div>`;
  const segI = (arr, k, d) => `<div class="seg">${arr.map(([t], i) => `<button class="${(a[k] == null ? d : a[k]) === i ? 'on' : ''}" onclick="crSet('${k}',${i})">${t}</button>`).join('')}</div>`;
  if (crTab === 'rosto') h = sec('Formato do rosto', thumbs(F8.caras, 'cara')) + sec('Olhos', thumbs(F8.olhos, 'olhar'))
    + sec('Nariz', segI(F8.nariz, 'nariz', 1)) + sec('Lábios', segI(F8.labios, 'labios', 1)) + sec('Sobrancelhas', segI(F8.sobr, 'sobr', 0))
    + sec(F ? 'Maquilhagem e acessórios' : 'Barba e acessórios', `<div class="hairs">${G2.face.map(k => `<button class="hairb ${(a.rosto || []).includes(k) ? 'on' : ''}" onclick="crFace('${k}')"><img data-face="${k}" alt=""><span>${FACE_OPTS.find(f => f[0] === k)[2]}</span></button>`).join('')}</div>`)
    + sec('Cor dos olhos', sw(EYES.map(c => c[0]), 'olhos', EYES.map(c => c[1])), nm(EYES, a.olhos));
  if (crTab === 'roupa') h = sec(F ? 'Parte de cima / vestido' : 'Parte de cima', seg(G2.cima, 'cima', 1)) + sw(CLOTH, 'roupa')
    + sec('Estampa', `<div class="seg segw">${G2.estampas.map(e => `<button class="${(a.estampa || 'liso') === e ? 'on' : ''}" onclick="crSet('estampa','${e}')">${ESTAMPAS[e]}</button>`).join('')}</div>`)
    + sec(a.baixo === 'calcoes' ? 'Calções' : a.baixo === 'calcas' ? 'Calças' : 'Saia', seg(G2.baixo, 'baixo', 1)) + sw(PANTS, 'calcas')
    + sec('Sapatos', sw(SHOES, 'sapatos'))
    + sec('Acessórios', `<div class="seg segw">${G2.acess.map(k => `<button class="${(a.acess || []).includes(k) ? 'on' : ''}" onclick="crAcess('${k}')">${ACESS_LBL[k]}</button>`).join('')}</div>`, ' <small>toca para pôr / tirar</small>')
    + `<div class="crhint">Outros estilos compram-se depois na <b>Loja de Roupa</b>. As fardas vêm com o emprego.</div>`;
  $('#crPanel').innerHTML = `<div class="crtabs">${CR_TABS.map(([id, ico, t]) => `<button class="${crTab === id ? 'on' : ''}" onclick="crTabSet('${id}')"><b>${ico}</b><span>${t}</span></button>`).join('')}</div>
    <div class="crbody" id="crBody">${h}</div>
    <div class="crfoot">
      ${crMode === 'edit' ? `<label class="chk sm"><input type="checkbox" ${a.adulto ? 'checked' : ''} onchange="crAv.adulto=this.checked"><span>Conteúdo <b>+18</b> (namoros, casino, bebidas)</span></label>` : ''}
      <button class="btn btn-pri big" id="crGo" onclick="creatorDone()">${crMode === 'reg' ? '✔ Criar conta e nascer' : '✔ Guardar avatar'}</button>
    </div>`;
  $('#crBody').scrollTop = st;
  $('#crTools').innerHTML = `<div class="crgen"><button class="${!F ? 'on' : ''}" onclick="crSet('genero','M')">♂ Homem</button><button class="${F ? 'on' : ''}" onclick="crSet('genero','F')">♀ Mulher</button></div><button class="crdice" onclick="crRandom()" title="Aleatório" aria-label="Aleatório">🎲</button>`;
  if (crTab === 'cabelo' || crTab === 'rosto') {
    const tok = ++crShotTok, imgs = [...document.querySelectorAll('#crBody img[data-f8], #crBody img[data-hair], #crBody img[data-face]')];
    const next = i => {
      if (tok !== crShotTok || i >= imgs.length) return; const im = imgs[i];
      let over; if (im.dataset.f8) over = { [im.dataset.f8]: +im.dataset.i }; else if (im.dataset.hair) over = { cabelo: im.dataset.hair }; else { const k = im.dataset.face, r = new Set((crAv.rosto || []).filter(x => !['beard', 'goatee', 'mustache'].includes(x) || !['beard', 'goatee', 'mustache'].includes(k))); r.add(k); over = { rosto: [...r] }; }
      im.src = avatarShot(avatarCfg(Object.assign({}, crAv, over), 'casual', 25), '#2a2433', false, 160, im.dataset.f8 ? (im.dataset.f8 === 'olhar' ? 'eyes' : 'face') : false); setTimeout(() => next(i + 1), 0);
    };
    next(0);
  }
}
function creatorBack() { if (crMode === 'reg') { goTitle(); authTab('reg'); } else goTitle(); }
async function creatorDone() {
  const b = $('#crGo'); b.disabled = true;
  const avatar = {}; ['base', 'genero', 'pele', 'roupa', 'calcas', 'sapatos', 'cabelo', 'corCabelo', 'olhos', 'corpo', 'altura', 'rosto', 'cara', 'olhar', 'nariz', 'labios', 'sobr', 'cima', 'baixo', 'estampa', 'acess'].forEach(k => { if (crAv[k] !== undefined) avatar[k] = crAv[k]; });
  try {
    if (crMode === 'reg') {
      b.textContent = 'A criar conta…';
      const r = await Acc.register(Object.assign({}, regData, { adulto: !!crAv.adulto, avatar }));
      setSession(r); regData = null; ['rNome', 'rEmail', 'rPass', 'rPass2'].forEach(i => $('#' + i).value = '');
      newLifeFlow(true);
    } else {
      const u = await Acc.updateProfile({ avatar, adulto: !!crAv.adulto }); if (u) USER = u;
      if (G) { G.avatar = Object.assign({}, avatar); G.genero = avatar.genero; save(); }
      toast('✔ Avatar guardado!'); goTitle();
    }
  } catch (x) { toast('❌ ' + esc(x.message)); b.disabled = false; renderCreator(); if (crMode === 'reg' && /e-mail|conta/i.test(x.message)) { goTitle(); authTab('reg'); $('#rErr').textContent = x.message; } }
}

/* ---------------- NOVA VIDA / NASCIMENTO ---------------- */
function newLifeFlow(skipConfirm) {
  if (G && G.vivo && !skipConfirm && !confirm(`Tens uma vida em curso (${G.nome}, ${G.idade} anos). Começar outra apaga-a. Continuar?`)) return;
  G = null; const b = newLife();
  enterWorld(true, () => birthReveal(b));
}
function birthReveal(b) {
  const kb = meta.karmaBonus || 0;
  const row = (ico, t, d, i) => `<div class="item" style="animation:pop .35s ${0.25 + i * .35}s both"><div class="ico">${ico}</div><div class="tx"><div class="t2">${t}</div><div class="t1">${d}</div></div></div>`;
  const A = b.inf.area;
  openModal(`<div class="mico">🎓</div><h3>A tua vida começa aos 16</h3><p class="center">Olá, <b>${esc(G.nome)}</b>. Ninguém escolhe onde nasce… e a escola acabou. Agora a vida é tua.</p>
    <div class="list" style="margin-top:14px">
      ${row('📍', 'Local de nascimento', `${b.prov.n} · ${G.cidade.mun}`, 0)}
      ${b.rua ? row('🌧️', 'Origem', 'Nasceste na rua<br><span class="fxs">Sem casa e sem família · trabalha para arrendar ou comprar casa</span>', 1) : row(b.cls.ico, 'Classe social', `${b.cls.t} <span class="fxs" style="color:${CLASSES.indexOf(b.cls) >= 3 ? '#ffd76a' : '#8fa3b8'}">· 🎲 ${b.cls.w}%${CLASSES.indexOf(b.cls) === 4 ? ' · 💎 muito rara!' : CLASSES.indexOf(b.cls) === 3 ? ' · ✨ rara!' : ''}</span><br><span class="fxs">${b.cls.casa}</span>`, 1)}
      ${b.rua ? row('👥', 'Pais', 'Desconhecidos · cresceste sozinho(a)', 2) : row('👨🏿', 'Pai', b.pai.vivo ? `${esc(b.pai.nome)} · ${b.pai.prof}` : 'Ausente', 2)}
      ${b.rua ? row('⛪', 'Apoio', 'Abrigo da Missão · sopa e colchão', 3) : row('👩🏿', 'Mãe', `${esc(b.mae.nome)} · ${b.mae.prof}`, 3)}
      ${b.fundo ? row('💳', 'Fundo da família', `${kzShort(b.fundo.total)}<br><span class="fxs">até ${kzShort(b.fundo.anual)}/ano · quando acabar, acabou</span>`, 4) : row('🌐', 'Amigos', 'Nenhum ainda · conhece pessoas online, na cidade', 4)}
      ${row(b.tal.ico, 'Talento natural', `${b.tal.t} — <span class="fxs">${b.tal.d}</span>`, 5)}
      ${row('📘', 'Escola', `${b.inf.priv ? 'Colégio privado' : 'Escola pública'} · ${A.t}<br><span class="fxs">Média final: ${G.notaMedia} valores</span>`, 6)}
      ${row('💰', 'Poupanças', `${kzShort(G.dinheiro)} · ${TEL_NOME[G.tel]}`, 7)}
    </div>
    ${kb ? `<div class="result" style="color:${kb > 0 ? '#9ff0bf' : '#ffa3a3'}">${kb > 0 ? '✨ O teu bom karma' : '⚠️ O teu mau karma'} da vida passada (${kb > 0 ? '+' : ''}${kb}) influenciou este nascimento.</div>` : ''}
    <div class="choices"><button class="btn btn-yel" onclick="pathModal()">Escolher o meu caminho</button></div>`, false);
}
function pathModal() {
  const go = (p, t) => `closeModal();openPanel('${p}','${t}');if(!localStorage.getItem('pe3d_help2')){localStorage.setItem('pe3d_help2',1)}`;
  const card = (ico, t, d, on, cls) => `<button class="pathc ${cls || ''}" onclick="${on}"><span class="pi">${ico}</span><b>${t}</b><small>${d}</small></button>`;
  openModal(`<div class="mico">🧭</div><h3>E agora?</h3><p class="center">Terminaste a escola. O que vais fazer com a tua vida?</p>
    <div class="paths">
      ${card('🎓', 'Universidade', `Pública (exame de acesso) ou privada. Abre as profissões superiores e o caminho até CEO.`, go('escola', 'uni'), 'a')}
      ${card('🛠️', 'Curso técnico', 'Mecânica, eletricidade, culinária… 1 ano e já podes trabalhar ou abrir negócio.', go('escola', 'tec'), 'b')}
      ${card('💼', 'Ir trabalhar', 'Procura emprego já: retalho, part-times, informal. Ganha dinheiro para o teu primeiro negócio.', go('emprego', 'vagas'), 'c')}
    </div>
    <div class="choices"><button class="btn btn-ghost" onclick="closeModal()">Decidir depois</button></div>`, false);
}
function continueGame() { if (G) enterWorld(false); }
function enterWorld(isNew, cb) {
  $('#loading').classList.remove('hidden');
  setTimeout(() => {
    spawnPlayer(G.preso > 0 ? 'cela' : 'casa');
    mode = 'game'; curScene = worldScene; uiBlocked = false; busy = false;
    if (typeof provSync === 'function') provSync(G.preso > 0 ? 'cela' : 'casa');
    showOv('hud'); $('#joy').classList.toggle('hidden', !IS_MOBILE);
    $('#loading').classList.add('hidden');
    refresh();
    if (!isNew) flash(`De volta, ${esc(G.nome.split(' ')[0])}!`);
    if (cb) setTimeout(cb, 500);
  }, 60);
}

/* ---------------- AJUDA, VIDAS, CRÉDITOS ---------------- */
function showHelp() {
  openModal(`<div class="mico">🎮</div><h3>Como Jogar</h3>
  <div class="help">
  <p><b>🕹️ Controlos</b><br>${IS_MOBILE ? '👆 <b>Toca num edifício para entrar</b> (a personagem vai lá a pé) · Joystick para andar · Arrasta o ecrã para rodar a câmara.' : '🖱️ <b>Clica num edifício para entrar</b> · <kbd>WASD</kbd> andar · <kbd>Shift</kbd> correr · <kbd>E</kbd> entrar · <kbd>T</kbd> telemóvel · arrastar o rato = câmara'}</p>
  <p><b>⏳ O tempo</b><br>A vida começa aos <b>16 anos</b>. Um ano não passa com um clique: a <b>barra do ano</b> (ao lado do botão do ano) enche enquanto <b>vives</b> — ações, turnos, aulas, refeições, dormir e o tempo a jogar. Com a barra cheia e pelo menos <b>25 minutos</b> de jogo nesse ano, carrega em <b>Fechar o ano</b>. Máximo de <b>3 anos por dia</b>. Se saíres do jogo, ninguém envelhece.</p>
  <p><b>⚡ Energia</b><br>Há uma só energia: a barra no topo. Cada ação gasta <b>10</b>; andar e fazer turnos também gastam. Recupera a <b>comer</b>, a <b>descansar</b> e a <b>dormir em casa</b> (de 8 em 8 minutos). Fechar o ano também te dá energia nova.</p>
  <p><b>🪪 Documentos</b><br>Aos 18, para emprego com contrato, carta de condução e crédito precisas do <b>BI</b>. Trata no <b>SIAC (Mutamba)</b>.</p>
  <p><b>🧭 O teu caminho</b><br>Aos 16 escolhes: <b>universidade</b> (exame de acesso na pública ou propinas na privada), <b>curso técnico</b> ou <b>ir trabalhar</b>. A média e a área do médio contam!</p>
  <p><b>💼 Profissões</b><br>Cada emprego tem requisitos reais: idade, escolaridade, curso, carta, cadastro limpo… Trabalha bem para seres promovido(a) — nas grandes empresas (Kitanda Super, Mbote Telecom, Banco Palanca, Mulemba Petróleos) podes chegar a <b>CEO</b>.</p>
  <p><b>👑 Império</b><br>Na <b>Torre Empresarial</b> abres empresas, contratas funcionários, abres filiais e fundas o teu <b>Grupo Empresarial</b>. Em <b>Terrenos & Obras</b> compras terrenos, constróis prédios e vives das rendas.</p>
  <p><b>🗺️ Angola inteira</b><br>Nasces numa província aleatória — cada uma das 21 tem a sua própria cidade com hospital, banco, mercado, universidade, esquadra e porto/aeroporto. Luanda é a maior de todas: Marginal, Baixa, Mutamba, Ilha, Kilamba, Talatona, musseques e Viana. Aos 18 podes mudar-te de província (mapa no telemóvel).</p>
  <p><b>🏠 Vida adulta</b><br>Arrenda ou compra casa (crédito habitação), faz o alembamento, tem filhos, abre negócios, investe e cuida da saúde. Tudo tem consequências.</p>
  <p><b>☯️ Nova vida</b><br>Quando a vida acaba, começas uma <b>nova vida</b>: outra pessoa, outra família, outro lugar. O <b>karma</b> que juntaste ajuda (ou complica) esse novo começo.</p>
  <p><b>🔞 Conteúdo +18</b><br>Toda a gente pode estudar, trabalhar e viver no jogo. A opção +18 só liga namoros, casino, apostas e bebidas.</p></div>
  <div class="choices"><button class="btn btn-yel" onclick="closeModal()">Bora!</button></div>`);
}
function showPastLives() {
  const v = meta.vidas.slice().reverse();
  openModal(`<div class="mico">☠️</div><h3>Vidas Passadas</h3>
  ${v.length ? `<div class="list">${v.map(x => `<div class="item"><img class="mini" src="${x.av ? avatarShot(avatarCfg(x.av, 'casual', x.idade), '#1c1a22', true) : imgSrc(x.img)}" alt=""><div class="tx"><div class="t1">${esc(x.nome)}</div><div class="t2">${esc(x.titulo)} · ${x.local || ''} · morreu aos ${x.idade} · ${esc(x.causa)}</div></div><div class="pr">${x.score} pts</div></div>`).join('')}</div>` : '<p class="center">Ainda não viveste nenhuma vida completa.</p>'}
  <p class="center" style="margin-top:12px">Karma para a próxima vida: <b style="color:var(--yel)">${meta.karmaBonus >= 0 ? '+' : ''}${meta.karmaBonus}</b></p>
  <div class="choices"><button class="btn btn-ghost" onclick="closeModal()">Fechar</button></div>`);
}
function showCredits() {
  openModal(`<div class="cred"><svg class="emb" style="width:84px;height:84px;margin:4px auto 8px;display:block"><use href="#embS"/></svg><h3>Próxima Encarnação</h3>
    <p class="center">Uma vida. Infinitas escolhas.<br>Cada vida é uma nova vida: nasces num lugar de Angola ao acaso e o teu futuro depende das tuas escolhas.</p>
    <div class="who">Criada pela<b>Dark Net AO</b></div>
    <p class="center" style="margin-top:16px;font-size:12px;color:#888">Gráficos: Three.js · Feito com ❤️ em Angola 🇦🇴</p></div>
    <p class="center" style="font-size:12px;color:#888">Música original procedimental, vozes e vídeos feitos para o jogo · sem direitos de autor de terceiros</p></div>
    <div class="choices">${Object.keys(IMG).length ? '' : '<button class="btn btn-pri" onclick="showTrailer()">Ver trailer</button>'}<button class="btn btn-yel" onclick="closeModal()">Fechar</button></div>`);
}
function showTrailer() {
  try { if (typeof RADIO !== 'undefined' && RADIO.stop) RADIO.stop(); } catch (e) { }
  openModal(`<h3 style="margin:0 0 10px">Trailer oficial</h3><video src="media/trailer.mp4" controls autoplay playsinline style="width:100%;border-radius:12px;background:#000;aspect-ratio:16/9"></video>
    <div class="choices"><button class="btn btn-yel" onclick="closeModal()">Fechar</button></div>`);
}

/* =========================================================
   HUD
   ========================================================= */
function statusTxt() {
  if (G.preso > 0) return `🔒 Preso(a) · ${G.preso} ano(s)`;
  if (G.idade < 3) return '🍼 Bebé';
  const p = [];
  if (G.emprego) p.push('💼 ' + jobTitle(G.emprego));
  if (G.estudo) p.push('📚 ' + (G.estudo.tipo === 'univ' ? CURSOS.find(c => c.id === G.estudo.curso).t : classeTxt()));
  if (G.reformado) p.push('🏖️ Reformado(a)');
  if (G.grupo) p.unshift('🏛️ CEO do ' + G.grupo.nome);
  if (!p.length) p.push(G.idade < 6 ? '🧸 Criança' : G.idade < 18 ? (G.edu >= 3 ? '🎓 Escola concluída' : '🧒 Sem escola') : 'Desempregado(a)');
  return p.join(' · ');
}
function refresh() {
  if (!G || !$('#hName')) return;
  $('#hAvatar').src = myShot() || imgSrc(G.avatar.base);
  $('#hName').textContent = G.nome;
  $('#hSub').textContent = statusTxt();
  const m = $('#hMoney'); m.textContent = kzShort(G.dinheiro); m.classList.toggle('neg', G.dinheiro < 0);
  $('#hAge').textContent = `${G.idade} anos · ${G.ano}`;
  $('#hStats').innerHTML = Object.keys(LABEL).map(k => `<div class="hs" title="${LABEL[k]}"><span>${SHORT[k]}</span><div class="bar"><i style="width:${G.stats[k]}%;background:${COLOR[k]}"></i></div><b>${G.stats[k]}</b></div>`).join('');
  if (typeof a9Hud === 'function') a9Hud(); else $('#hEnergy').innerHTML = Array.from({ length: maxAcoes() }, (_, i) => `<i class="${i < G.acoes ? '' : 'off'}"></i>`).join('');
  if (panelId) renderPanel(true);
  if (phoneApp) renderPhone(true);
  updateBadge(); if (mode === 'game') checkPlayerLook();
}
function showPrompt(id) {
  const p = $('#prompt');
  if (!id || mode !== 'game') { p.classList.add('hidden'); return; }
  const L = LOC_POS[id];
  p.innerHTML = `${L.ico} <b>${L.n}</b> <span class="k">${IS_MOBILE ? 'ENTRAR' : 'E'}</span>`;
  p.classList.remove('hidden');
}

/* =========================================================
   COMPONENTES
   ========================================================= */
const energyBar = () => `<div class="energy">⚡ Energia: ${Array.from({ length: maxAcoes() }, (_, i) => `<i class="${i < G.acoes ? '' : 'off'}"></i>`).join('')} <span>${G.acoes}/${maxAcoes()} · 💰 ${kzShort(G.dinheiro)}</span></div>`;
const btnItem = (ico, t1, t2, pr, on, dis) => `<button class="item" onclick="${on}" ${dis ? 'disabled' : ''}><div class="ico">${ico}</div><div class="tx"><div class="t1">${t1}</div><div class="t2">${t2}</div></div>${pr ? `<div class="pr">${pr}</div>` : ''}</button>`;
const infoItem = (ico, t1, t2, pr) => `<div class="item"><div class="ico">${ico}</div><div class="tx"><div class="t1">${t1}</div><div class="t2">${t2}</div></div>${pr ? `<div class="pr">${pr}</div>` : ''}</div>`;
const relItem = (ico, nome, sub, r, btns) => `<div class="item col"><div class="row"><div class="ico">${ico}</div><div class="tx"><div class="t1">${nome}</div><div class="t2">${sub}</div>${r != null ? `<div class="bar rel"><i style="width:${r}%"></i></div>` : ''}</div></div>${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;
const chip = (l, f, dis) => `<button class="chip" onclick="${f}" ${dis ? 'disabled style="opacity:.4"' : ''}>${l}</button>`;
const sec = t => `<div class="sec">${t}</div>`;
const list = a => `<div class="list">${a.join('')}</div>`;
const noteBox = (t, bad) => `<div class="info ${bad ? 'bad' : ''}">${t}</div>`;
const tooYoung = (min, what) => G.idade < min ? (typeof lockRich === 'function' ? lockRich(min, what) : noteBox(`🧒 Ainda és muito novo(a) para ${what}. Volta aos ${min} anos.`)) : '';
function ativList(ids) {
  return list(ids.map(id => ATIV.find(a => a.id === id)).filter(Boolean).map(a => {
    const ok = ativOk(a);
    const why = !ok ? (a.adult && !plus18() ? '🔞 Requer a opção +18 na conta' : G.idade < (a.min || 0) ? `A partir dos ${a.min} anos` : `Só até aos ${a.max} anos`) : a.d;
    return btnItem(a.ico, a.t, why, a.c ? kzShort(a.c) : 'Grátis', `runAtiv('${a.id}')`, !ok);
  }));
}
const reqTxt = f => f.length ? '❌ Requer: ' + f.join(', ') : '✅ Cumpres os requisitos';

/* =========================================================
   PAINÉIS DOS LOCAIS
   ========================================================= */
// ---- CASA
function casaMain() {
  if (G.casa.tipo === 'rua' && typeof v4RuaUI === 'function') return v4RuaUI();
  let h = energyBar();
  h += noteBox(`🏠 <b>${moradaTxt()}</b> · ${G.cidade.mun}, ${G.cidade.prov}<br>🧾 Custo de vida estimado: <b>${kzShort(Math.max(0, custoVida().c))}/ano</b>${G.casa.tipo === 'arrendada' ? ` (renda ${kzShort(casaT(G.casa.id).renda * cid().custo)})` : ''}`);
  h += list([
    btnItem('🗓️', 'Fechar o ano', 'Quando a barra do ano estiver cheia', 'ANO', 'closePanel();ageUpUI()'),
    btnItem('🛏️', 'Descansar', 'Dormir bem e recuperar forças', 'Grátis', "doAct(0,()=>'Dormiste bem e acordaste com energia. '+fx({saude:R(3,6),felicidade:R(1,3)}),'think')"),
    ...(G.idade < 13 ? [] : [btnItem('📺', 'Ver novela da Kalemba TV', 'Relaxar no sofá', 'Grátis', "doAct(0,()=>'Viste a novela das 20h com a família. '+fx({felicidade:R(3,6)}),'think')")]),
  ]);
  h += sec('Brincar & ajudar') + ativList(['brincar', 'historias', 'ajudarcasa']);
  const mud = [];
  if (G.idade >= 18 || semFamilia()) mud.push(btnItem('🏘️', 'Procurar outra casa', 'Imobiliária do Centro Habitacional · do bairro pobre ao rico', '', "closePanel();goTeleport('imobiliaria')"));
  if (G.casa.tipo !== 'pais' && parentsAlive()) mud.push(btnItem('🧳', 'Voltar para casa dos pais', 'Poupas na renda, mas perdes independência', '', 'moveToParents()'));
  if (mud.length) h += sec('Mudança') + list(mud);
  return h;
}
function familiaUI() {
  let h = energyBar() + sec('Pais');
  ['pai', 'mae'].forEach(k => {
    const p = G[k];
    h += p.vivo ? relItem(k === 'pai' ? '👨🏿' : '👩🏿', esc(p.nome), `${k === 'pai' ? 'Pai' : 'Mãe'} · ${p.idade} anos · ${p.prof}`, p.rel,
      chip('Passar tempo', `visitParent('${k}')`) + chip('Pedir kumbu', `askMoney('${k}')`) + (G.idade >= 18 ? chip('Ajudar com dinheiro', `helpParent('${k}')`) : ''))
      : p.ausente ? relItem('❔', k === 'pai' ? 'Pai desconhecido' : 'Mãe desconhecida', 'Nunca conheceste — cresceste na rua', null, '')
      : relItem('🕯️', esc(p.nome), `${k === 'pai' ? 'Pai' : 'Mãe'} · falecido(a) ou ausente`, null, '');
  });
  if (G.fundo) h += noteBox(G.fundo.resto > 0 ? `💳 <b>Fundo da família:</b> restam ${kzShort(G.fundo.resto)} de ${kzShort(G.fundo.total)} (até ${kzShort(G.fundo.anual)}/ano e propinas). Quando acabar, acabou.` : '💳 O fundo da família acabou. Agora o dinheiro vem do teu trabalho.', G.fundo.resto <= 0);
  if (G.irmaos.length) h += sec(`Irmãos (${G.irmaos.length})`) + list(G.irmaos.map((s, i) => relItem(s.g === 'M' ? '👦🏿' : '👧🏿', esc(s.nome), `${s.g === 'M' ? 'Irmão' : 'Irmã'} · ${s.idade} anos`, s.rel, chip('Passar tempo', `siblingTime(${i})`))));
  if (typeof v4AmigosFam === 'function') h += v4AmigosFam();
  if (G.amigos.length) h += sec(`Amigos de infância (${G.amigos.length})`);
  if (G.amigos.length) h += list([...G.amigos.map((f, i) => relItem(f.g === 'M' ? '🧑🏿' : '👩🏿', esc(f.nome), `${f.idade} anos${f.rico ? ' · família influente 🤫' : ''}`, f.rel,
    chip('Sair (10 mil)', `friendOut(${i})`) + (G.idade >= 18 ? chip('Pedir cunha', `askCunha(${i})`) : '')))]);
  h += sec('Amor');
  if (G.parceiro) {
    const p = G.parceiro, lbl = p.casado ? (p.g === 'F' ? 'Esposa' : 'Marido') : (p.g === 'F' ? 'Namorada' : 'Namorado');
    const btns = chip('Sair juntos (15 mil)', 'dateTime()') + (!p.juntos && !p.casado ? chip('🏠 Morar juntos', 'moveIn()') : '') +
      (!p.casado ? chip(`💍 Alembamento (${kzShort(alembCusto())})`, 'marry()') : '') +
      (p.casado && !p.festa ? chip('💒 Festa de casamento', 'weddingUI()') : '') +
      (G.idade >= 18 ? chip('👶 Ter um filho', 'haveKid()') : '') + chip(p.casado ? '💔 Divorciar' : '💔 Terminar', 'breakUp()');
    h += relItem(p.casado ? '💍' : '💕', esc(p.nome), `${lbl} · ${p.idade} anos · ${p.anos} ano(s) juntos${p.juntos ? ' · moram juntos' : ''}${p.emprego ? ' · ' + job(p.emprego).t : ''}<br>Família ${CLASSES[p.cls || 0].t.replace('Família ', '')}`, p.rel, btns);
  } else h += list([btnItem('💘', 'Procurar namoro', G.idade < 16 ? 'A partir dos 16 anos' : 'Depende da aparência, fama e felicidade', '', "findLove('rua')", G.idade < 16)]);
  if (G.filhos.length) h += sec(`Filhos (${G.filhos.length})`) + list(G.filhos.map((f, i) => relItem(f.idade < 13 ? (f.g === 'M' ? '👦🏿' : '👧🏿') : (f.g === 'M' ? '🧑🏿' : '👩🏿'), esc(f.nome), `${f.g === 'M' ? 'Filho' : 'Filha'} · ${f.idade} anos${f.idade >= 6 && f.idade < 18 ? ' · escola ' + f.escola : ''}`, f.rel,
    chip('Passar tempo', `kidTime(${i})`) + (f.idade < 18 ? (f.escola === 'privada' ? chip('Escola pública', `kidSchool(${i},'publica')`) : chip('Colégio privado (1,5M/ano)', `kidSchool(${i},'privada')`)) : ''))));
  if (G.idade >= 25) h += list([btnItem('🧡', 'Adotar uma criança', 'Precisas de casa própria ou arrendada', '500 mil', 'adopt()')]);
  return h;
}
function weddingUI() {
  openModal(`<div class="mico">💒</div><h3>Festa de Casamento</h3><p class="center">O alembamento está feito. Que festa vão fazer?</p><div class="choices">
    <button class="choice" onclick="closeModal();wedding('simples')">🏡 No quintal da família<small>500 mil Kz</small></button>
    <button class="choice" onclick="closeModal();wedding('medio')">🎉 Salão de festas<small>3 milhões Kz · +fama</small></button>
    <button class="choice" onclick="closeModal();wedding('luxo')">💎 Luxo no Epic Sana<small>25 milhões Kz · sai nas revistas</small></button>
    <button class="btn btn-ghost" onclick="closeModal()">Agora não</button></div>`);
}
function roupaUI() {
  const cur = curOutfit();
  let h = noteBox(`👗 A vestir: <b>${OUTFITS[cur].ico} ${OUTFITS[cur].t}</b>. Desbloqueias roupas novas a estudar, trabalhar e viver.`);
  h += list(Object.entries(OUTFITS).filter(([id]) => id !== 'bebe').map(([id, o]) => {
    const tem = G.roupas.includes(id), kidBlock = G.idade < 13 && !o.kid;
    if (tem) return btnItem(o.ico, o.t + (cur === id ? ' <span class="tag">a vestir</span>' : ''), kidBlock ? 'Disponível aos 13 anos' : 'Toca para vestir', '', `wear('${id}')`, kidBlock || cur === id || G.idade < 3);
    return `<div class="item lock"><div class="ico">🔒</div><div class="tx"><div class="t1">${o.t}</div><div class="t2">${o.how || 'Bloqueada'}${SHOP_OUTFITS[id] ? ' · ou compra na Loja de Roupa (Mercado)' : ''}</div></div></div>`;
  }));
  return h;
}
function diarioUI() {
  const conq = CONQ.map(c => `<span title="${c.t}" style="font-size:20px;${G.conq.includes(c.id) ? '' : 'filter:grayscale(1);opacity:.25'}">${c.ico}</span>`).join(' ');
  return `<div class="info">🏆 Conquistas (${G.conq.length}/${CONQ.length})<br>${conq}</div><div class="log">${G.log.slice().reverse().map(y => `<div class="ly"><h4>${y.idade} anos · ${y.ano}</h4>${y.e.map(e => `<p class="${e.c}">${e.t}</p>`).join('')}</div>`).join('')}</div>`;
}

// ---- ESCOLA
function estudosUI() {
  let h = energyBar();
  h += noteBox(`🎓 Escolaridade: <b>${EDU[G.edu]}</b>${G.notaMedia ? ` · Média: <b>${G.notaMedia}</b> valores` : ''}${G.area ? `<br>📘 Área do médio: <b>${AREAS.find(a => a.id === G.area).t}</b>` : ''}${G.cursosFeitos.length ? `<br>🎓 Licenciatura: <b>${G.cursosFeitos.map(c => CURSOS.find(x => x.id === c).t).join(', ')}</b>` : ''}${G.mestrado ? ' + Mestrado' : ''}${G.tecnicos.length ? `<br>🛠️ Técnicos: ${G.tecnicos.map(t => TECNICOS.find(x => x.id === t).t).join(', ')}` : ''}`);
  if (G.idade < 6) return h + noteBox('🧸 A escola começa aos 6 anos. Por agora, brinca e ouve as histórias da avó!');
  if (G.precisaArea) return h + sec('Escolhe a área do II Ciclo') + noteBox('A área decide a que cursos superiores terás acesso facilitado.') + areaList();
  if (G.estudo) {
    const e = G.estudo;
    h += sec('A frequentar') + infoItem('📖', e.t, `${classeTxt()} · ano ${e.ano} de ${e.anos}${e.notaUlt ? ' · última nota: ' + e.notaUlt : ''}${e.prop ? ` · propina ${kzShort(e.prop)}/ano${e.paisPagam ? ' (pais pagam)' : ''}` : ''}<br>Esforço este ano: ${'📗'.repeat(e.esf) || '—'} ${e.faltas ? '· Faltas: ' + e.faltas : ''}`);
    h += list([
      btnItem('📚', 'Estudar a sério', 'Melhora a nota final do ano', '', 'studyHard()'),
      btnItem('👨‍🏫', 'Explicações', 'Conta a dobrar para a nota', '20 mil', 'explicacao()'),
      btnItem('🏃', 'Faltar às aulas', 'Diversão agora, nota pior depois', '', 'faltar()'),
      btnItem('🚫', 'Desistir dos estudos', G.idade < 14 ? 'Proibido antes dos 14 anos' : 'Perdes o progresso deste nível', '', 'dropSchool()', G.idade < 14),
    ]);
  } else if (G.edu < 3) {
    h += noteBox(G.idade < 18 ? 'Não estás a estudar. Sem o Ensino Médio, os bons empregos ficam fechados.' : 'Podes voltar a estudar no ensino noturno (anos reduzidos).', true);
    if (G.idade >= 18) h += list([btnItem('🌙', 'Ensino noturno para adultos', `Continuar a partir de ${EDU[G.edu]}`, 'Grátis', 'adultSchool()')]);
    else if (G.idade >= 6) h += list([btnItem('🎒', 'Voltar à escola', 'Matricular-me de novo', 'Grátis', 'backToSchool()')]);
  }
  h += sec('Biblioteca') + ativList(['biblio']);
  return h;
}
function backToSchool() {
  if (G.estudo || G.edu >= 3) return; if (!canAct()) return; G.acoes--;
  const tipo = G.edu === 0 ? 'primario' : G.edu === 1 ? 'ciclo1' : 'ciclo2';
  if (tipo === 'ciclo2' && !G.area) { G.precisaArea = true; G.acoes++; save(); refresh(); return areaModal(); }
  startStage(tipo, false); after(`🎒 Voltaste à escola: ${G.estudo.t}.`, 'good', 'think'); checkPlayerLook();
}
function areaList() {
  return list(AREAS.map(a => btnItem(a.ico, a.t, `${a.d} · ${a.anos} anos`, '', `chooseArea('${a.id}');closeModal();checkPlayerLook()`)));
}
function areaModal() {
  openModal(`<div class="mico">📘</div><h3>Concluíste o I Ciclo!</h3><p class="center">Escolhe a área do <b>II Ciclo do Ensino Secundário</b>. Isto vai decidir a que cursos tens acesso na universidade.</p><div style="margin-top:12px">${areaList()}</div>
    ${G.idade >= 14 ? `<div class="choices"><button class="btn btn-ghost" onclick="G.precisaArea=false;addLog('🚫 Decidiste não continuar os estudos.','bad');save();closeModal();refresh()">Parar de estudar</button></div>` : ''}`, false);
}
function uniUI() {
  let h = energyBar();
  if (G.idade < 16) return h + tooYoung(17, 'a universidade');
  h += noteBox(`🏛️ <b>Pública (UAN)</b>: propina ${kzShort(PROP_PUB)}/ano, mas há <b>exame de acesso</b> (conta a média e a área do médio).<br>🏫 <b>Privada</b>: entrada garantida, propina ${kzShort(PROP_PRIV)}/ano (Medicina o dobro).${familiaPaga() ? '<br>👨‍👩‍👧 A tua família pode pagar as propinas.' : ''}`);
  if (G.edu < 3) h += noteBox('❌ Precisas de concluir o Ensino Médio para entrar na universidade.', true);
  if (G.estudo && G.estudo.tipo === 'univ') h += noteBox('📖 Já estás a frequentar um curso superior.');
  h += sec('Cursos de licenciatura');
  const block = G.edu < 3 || !!G.estudo;
  h += list(CURSOS.map(c => {
    const feito = G.cursosFeitos.includes(c.id), match = G.area && c.area.includes(G.area);
    const pc = Math.round(uniChance(c, true) * 100);
    return `<div class="item col"><div class="row"><div class="ico">${c.ico}</div><div class="tx"><div class="t1">${c.t}${feito ? ' <span class="tag">concluído</span>' : ''}</div><div class="t2">${c.anos} anos · área: ${c.area.map(a => AREAS.find(x => x.id === a).t.replace('Ciências ', 'C. ').replace('Técnico Médio de ', 'Téc. ')).join(' / ')}${match ? ' ✅' : ' ⚠️ área diferente'}${!block ? ` · hipótese na pública: <b>${pc}%</b>` : ''}</div></div></div>
      <div class="btns">${chip('Exame na pública', `applyUni('${c.id}',true)`, block || feito)}${chip('Privada (' + kzShort(PROP_PRIV * (c.id === 'medicina' ? 2 : 1)) + '/ano)', `applyUni('${c.id}',false)`, block || feito)}</div></div>`;
  }));
  if (G.edu >= 4) h += sec('Pós-graduação') + list([
    btnItem('🎓', 'Mestrado em Luanda', '2 anos · +25% salário em cargos superiores · abre Juiz(a)', '1,5M', 'applyMestrado(false)', G.mestrado || !!G.estudo),
    btnItem('✈️', 'Mestrado em Portugal', '2 anos · mais prestígio', '6M', 'applyMestrado(true)', G.mestrado || !!G.estudo)]);
  return h;
}
function tecnicoUI() {
  let h = energyBar() + sec('Cursos técnicos (INEFOP) · a partir dos 15 anos');
  h += list(TECNICOS.map(t => btnItem(t.ico, t.t + (G.tecnicos.includes(t.id) ? ' <span class="tag">tens</span>' : ''), 'Curso de 1 ano · abre profissões técnicas', kzShort(t.custo), `doTecnico('${t.id}')`, G.tecnicos.includes(t.id) || G.idade < 15)));
  h += sec('Escola de condução') + list([btnItem('🪪', 'Tirar a carta de condução', G.carta ? 'Já tens carta ✅' : G.idade < 18 ? 'A partir dos 18 anos' : 'Exame teórico e prático', '150 mil', 'tirarCarta()', G.carta || G.idade < 18)]);
  return h;
}

// ---- EMPREGO
function trabalhoUI() {
  let h = energyBar();
  if (G.idade < 14) return h + tooYoung(14, 'trabalhar') + noteBox('Por agora podes fazer pequenos biscates no Mercado a partir dos 12.');
  const slot = (e, part) => {
    const j = job(e.id), s = salario(e);
    return `<div class="item col"><div class="row"><div class="ico">${j.ico}</div><div class="tx"><div class="t1">${jobTitle(e)}${part ? ' <span class="tag">part-time</span>' : ''}</div><div class="t2">${j.cat} · ${e.anos} ano(s) · ${kzShort(s)}/ano (${kzShort(s / 12)}/mês)${j.niv ? `<br>Carreira: ${j.niv.map((n, i) => i === e.nivel ? `<b style="color:var(--yel)">${n}</b>` : n).join(' → ')}` : ''}</div>
      <div class="t2">Desempenho</div><div class="bar rel"><i style="width:${e.desemp}%;background:${e.desemp < 30 ? '#ff5b5b' : '#2ecc71'}"></i></div></div></div>
      <div class="btns">${part ? '' : chip('💪 Trabalhar no duro', 'workHard()') + chip('⏰ Horas extra', 'horasExtra()') + chip(j.niv ? '🚀 Pedir promoção' : '📈 Pedir aumento', 'askPromo()')}${!part && G.idade >= 60 ? chip('🏖️ Reformar-me', 'reformar()') : ''}${chip('🚪 Despedir-me', `quitJob(${part})`)}</div></div>`;
  };
  if (G.emprego) h += sec('O teu trabalho') + slot(G.emprego, false);
  if (G.part) h += slot(G.part, true);
  if (!G.emprego) h += noteBox(G.reformado ? `🏖️ Estás reformado(a). Pensão: ${kzShort(G.pensao || 600000)}/ano.` : '😕 Estás sem emprego. Vê as vagas e cumpre os requisitos.');
  if (G.cunha) h += noteBox('🤫 Tens uma <b>cunha</b> ativa: a próxima candidatura ou promoção tem mais hipóteses.');
  if (G.cadastro) h += noteBox('⚠️ Tens <b>cadastro criminal</b>: empregos formais são mais difíceis e alguns estão vedados.', true);
  return h;
}
function vagasUI() {
  let h = energyBar();
  if (G.idade < 14) return h + tooYoung(14, 'trabalhar');
  h += noteBox('📋 Só podes ter <b>1 emprego a tempo inteiro</b> + <b>1 part-time</b>. Menores a estudar só fazem part-time e trabalho informal.');
  const cats = [...new Set(JOBS.map(j => j.cat))];
  cats.forEach(cat => {
    h += sec(cat) + list(JOBS.filter(j => j.cat === cat).map(j => {
      const f = reqOk(j.req); const mine = (G.emprego && G.emprego.id === j.id) || (G.part && G.part.id === j.id);
      const sal = j.varFama ? 'Varia c/ fama' : j.varSeg ? 'Varia c/ seguidores' : kzShort(salario({ id: j.id, nivel: 0 })) + '/ano';
      return btnItem(j.ico, j.t + (mine ? ' <span class="tag">o teu</span>' : '') + (j.part ? ' <span class="tag" style="background:#3a2d0b;color:#ffcb00">part-time</span>' : ''), reqTxt(f), sal, `applyJob('${j.id}')`, f.length || mine);
    }));
  });
  return h;
}
function cvUI() {
  return noteBox(`📄 <b>Currículo de ${esc(G.nome)}</b><br>🎓 ${EDU[G.edu]}${G.cursosFeitos.length ? ' em ' + G.cursosFeitos.map(c => CURSOS.find(x => x.id === c).t).join(', ') : ''}${G.mestrado ? ' + Mestrado' : ''}<br>🛠️ Técnicos: ${G.tecnicos.length ? G.tecnicos.map(t => TECNICOS.find(x => x.id === t).t).join(', ') : '—'}<br>🪪 Carta: ${G.carta ? 'Sim' : 'Não'} · ⚖️ Registo criminal: ${G.cadastro ? '<b class="r">Com cadastro</b>' : '<b class="g">Limpo</b>'}<br>🏀 Treinos desportivos: ${G.treinos} · 📸 Seguidores: ${numShort(G.seg)}`) +
    sec('Experiência') + (G.historico.length ? list(G.historico.slice().reverse().map(t => infoItem('💼', t, ''))) : noteBox('Ainda sem experiência profissional.'));
}

// ---- BANCO
function contaUI() {
  let h = energyBar();
  if (G.idade < 14) return h + tooYoung(14, 'abrir conta no banco') + noteBox(`🐷 Mealheiro: <b>${kz(G.dinheiro)}</b>`);
  const e = G.emprestimo;
  h += `<div class="grid2"><div class="kpi">💵 Dinheiro<b class="${G.dinheiro < 0 ? 'r' : 'g'}">${kz(G.dinheiro)}</b></div><div class="kpi">🏦 Poupança (7%/ano)<b>${kz(G.poupanca)}</b></div><div class="kpi">📉 Empréstimo<b class="${e ? 'r' : ''}">${e ? kz(e.divida) : '—'}</b></div><div class="kpi">💎 Património<b>${kzShort(patrimonio())}</b></div></div>`;
  const d = v => Math.max(0, Math.min(v, G.dinheiro));
  h += sec('Depósito a prazo') + `<div class="btns" style="display:flex;flex-wrap:wrap;gap:6px">${chip('Depositar 50 mil', 'deposit(50000)', G.dinheiro < 1)}${chip('Depositar 500 mil', 'deposit(500000)', G.dinheiro < 1)}${chip('Depositar tudo', 'deposit(G.dinheiro)', G.dinheiro < 1)}${chip('Levantar 100 mil', 'withdraw(100000)', !G.poupanca)}${chip('Levantar tudo', 'withdraw(G.poupanca)', !G.poupanca)}</div>`;
  if (G.idade >= 18) {
    const max = Math.max(500000, (G.emprego ? salario(G.emprego) : 0) * 2);
    h += sec('Crédito pessoal (juro 25%, 4 anos)');
    if (e) h += list([infoItem('📉', 'Empréstimo em curso', `Prestação ${kzShort(e.prest)}/ano · falta ${kzShort(e.divida)}`), btnItem('✅', 'Liquidar já', 'Pagar a dívida toda', kzShort(e.divida), 'payLoan()', G.dinheiro < e.divida)]);
    else h += list([500000, 2000000, 10000000, 50000000].map(v => btnItem('💳', `Pedir ${kzShort(v)}`, v > max ? `❌ Máximo para ti: ${kzShort(max)} (2× salário anual)` : `Pagas ${kzShort(v * 1.25 / 4)}/ano`, '', `takeLoan(${v})`, v > max)));
  }
  return h;
}
function imobRend() { return (G.emprego && !job(G.emprego.id).informal ? salario(G.emprego) : 0) + G.negocios.reduce((s, n) => s + Math.max(0, n.ult || 0), 0); }
const NIVEL_CID = { rica: 'Província rica · cara', media: 'Província média', pobre: 'Província pobre · barata' };
function meusImoveisHTML() {
  if (!G.imoveis.length) return '';
  return sec('Os teus imóveis') + list(G.imoveis.map((im, i) => {
    const C = casaT(im.id), Z = zonaCasa(C.z);
    return `<div class="item col"><div class="row"><div class="ico">${C.ico}</div><div class="tx"><div class="t1">${C.t}${im.mora ? ' <span class="tag">moras aqui</span>' : im.inq ? ' <span class="tag">arrendada</span>' : ''}</div><div class="t2">${Z.nivel} · Valor: ${kzShort(im.valor)}${im.cred ? ` · crédito: falta ${kzShort(im.cred.divida)} (${kzShort(im.cred.prest)}/ano, ${im.cred.anos} anos)` : ' · 100% tua'}</div></div></div>
      <div class="btns">${!im.mora ? chip('Mudar para aqui', `moveInto(${i})`) + chip(im.inq ? 'Tirar do arrendamento' : `Arrendar (~${kzShort(C.renda * .9)}/ano)`, `toggleRentOut(${i})`) : ''}${chip('Vender', `sellHouse(${i})`)}</div></div>`;
  }));
}
/* Centro Habitacional — todas as casas num só sítio, do bairro pobre ao bairro rico */
function imobUI() {
  let h = energyBar();
  const P = cid(), Zm = zonaCasa(typeof casaZona === 'function' ? casaZona() : 'bairro');
  h += noteBox(`🏠 Moras em: <b>${moradaTxt()}</b> · ${Zm.nivel}<br>📍 ${G.cidade.mun}, <b>${P.n}</b> — ${NIVEL_CID[nivelCidade(P)]} (preços a ${Math.round(P.custo * 100)}% dos de Luanda)`);
  if (G.idade < 18) return h + tooYoung(18, 'arrendar ou comprar casa');
  h += meusImoveisHTML();
  const rend = imobRend();
  h += sec('Casas · do bairro pobre ao bairro rico') + noteBox(`🔑 Arrendar: pagas uma caução de 2 meses. 🏦 Comprar a crédito: entrada de 30%, 15 anos, 14%/ano, o banco pede 2 anos de contrato, e a prestação não pode passar 45% do teu rendimento formal (${kzShort(rend)}/ano).`);
  ZONAS_CASA.forEach(Z => {
    const cs = CASAS.filter(C => C.z === Z.id); if (!cs.length) return;
    h += `<div class="zhead" style="--zc:${Z.cor}"><b>${Z.ico} ${Z.nivel}</b><span>${Z.t}</span></div>`;
    h += list(cs.map(C => {
      const renda = Math.round(C.renda * P.custo), cau = Math.round(renda / 6), preco = precoCasa(C), ent = Math.round(preco * CRED_ENT), prest = credPrest(preco - ent), okCred = rend && prest <= rend * .45 && credAnosOk();
      const aqui = G.casa.tipo === 'arrendada' && G.casa.id === C.id;
      return `<div class="item col"><div class="row"><div class="ico">${C.ico}</div><div class="tx"><div class="t1">${C.t}${aqui ? ' <span class="tag">moras aqui</span>' : ''}</div><div class="t2">Renda <b>${kzShort(renda / 12)}/mês</b>${C.preco ? ` · Preço <b>${kzShort(preco)}</b>` : ' · só arrendar'} · conforto ${C.conforto > 0 ? '+' : ''}${C.conforto}</div></div></div>
        <div class="btns">${chip(`Arrendar (caução ${kzShort(cau)})`, `rentHouse('${C.id}')`, aqui || G.dinheiro < cau)}${C.preco ? chip('Comprar a pronto', `buyHouse('${C.id}',false)`, G.dinheiro < preco) + chip(okCred ? `Crédito: ${kzShort(ent)} + ${kzShort(prest)}/ano` : 'Crédito ❌', `buyHouse('${C.id}',true)`, !okCred || G.dinheiro < ent) : ''}</div></div>`;
    }));
  });
  return h;
}
/* Províncias: o mapa das 21 províncias está em angola.js */
function cidadesUI() { return angCidadesUI(); }
function lojaUI() {
  let h = energyBar();
  if (G.bens.length) h += sec('Os teus bens') + list(G.bens.map(b => { const B = bemT(b); return `<div class="item"><div class="ico">${B.ico}</div><div class="tx"><div class="t1">${B.t}</div><div class="t2">${B.renda ? 'Rende ~' + kzShort(B.renda) + '/ano · ' : ''}${B.manut ? 'Manutenção ' + kzShort(B.manut) + '/ano' : B.d || ''}</div></div><button class="chip" onclick="sellBem('${b}')">Vender ${kzShort(B.p * .55)}</button></div>`; }));
  [...new Set(BENS.map(B => B.cat))].forEach(cat => {
    h += sec(cat) + list(BENS.filter(B => B.cat === cat).map(B => {
      const tem = G.bens.includes(B.id) || (B.tel && G.tel >= B.tel);
      const why = B.carta && !G.carta ? '🪪 Requer carta de condução' : (B.d || '') + (B.manut ? ` · manutenção ${kzShort(B.manut)}/ano` : '');
      return btnItem(B.ico, B.t + (tem ? ` <span class="tag">${B.tel && !G.bens.includes(B.id) ? 'tens melhor' : 'tens'}</span>` : ''), why, kzShort(B.p), `buyBem('${B.id}')`, tem || (B.carta && !G.carta) || (G.idade < 10 && !B.tel && B.id !== 'bike'));
    }));
  });
  return h;
}
// ---- MERCADO
function mercadoAtiv() { return energyBar() + ativList(['biscate', 'apostas', 'casino', 'esquema']) + (G.cadastro ? noteBox('⚠️ Já tens cadastro. Se fores apanhado(a) outra vez, a pena será dura.', true) : ''); }
function negociosUI() {
  let h = energyBar();
  if (G.idade < 14) return h + tooYoung(14, 'ter um negócio');
  if (G.negocios.length) h += sec('Os teus negócios') + list(G.negocios.map((n, i) => {
    const N = negT(n.id);
    return `<div class="item col"><div class="row"><div class="ico">${N.ico}</div><div class="tx"><div class="t1">${N.t} <span class="tag">nível ${n.nivel}</span>${n.gerente ? ' <span class="tag">gerente</span>' : ''}</div><div class="t2">Último ano: <b class="${(n.ult || 0) >= 0 ? 'g' : 'r'}">${n.ult == null ? '—' : kzShort(n.ult)}</b> · valor ${kzShort(negValor(n))}</div><div class="t2">Gestão</div><div class="bar rel"><i style="width:${n.gestao}%;background:#3fa9ff"></i></div></div></div>
      <div class="btns">${chip('📋 Gerir pessoalmente', `manageNeg(${i})`)}${n.nivel < 5 ? chip(`📈 Expandir (${kzShort(N.p * n.nivel * 1.2)})`, `expandNeg(${i})`) : ''}${chip(n.gerente ? 'Dispensar gerente' : '👔 Contratar gerente', `toggleGerente(${i})`)}${chip('Vender', `sellNeg(${i})`)}</div></div>`;
  }));
  h += sec('Abrir negócio (+5% alvará)') + noteBox('📊 Sem gestão, os negócios perdem qualidade todos os anos. Um gerente mantém a gestão mas fica com 15% do lucro. Há risco de prejuízo!');
  h += list(NEG.map(N => { const f = negReq(N), tem = G.negocios.some(n => n.id === N.id); return btnItem(N.ico, N.t + (tem ? ' <span class="tag">tens</span>' : ''), (f.length ? reqTxt(f) : `Lucro base ~${kzShort(N.base * .65)}/ano`) + (N.bonus ? ` · bónus com técnico de ${TECNICOS.find(t => t.id === N.bonus).t}` : ''), kzShort(N.p), `openNeg('${N.id}')`, f.length || tem); }));
  return h;
}
let lookTok = 0;
function fillLooks() {
  const tok = ++lookTok, imgs = [...document.querySelectorAll('img[data-look]')].filter(i => !i.src);
  const next = i => { if (tok !== lookTok || i >= imgs.length) return; const im = imgs[i];
    im.src = avatarShot(avatarCfg(G.avatar, im.dataset.look, Math.max(16, G.idade)), '#2a2433', true, 240, true); setTimeout(() => next(i + 1), 0); };
  next(0);
}
function boutiqueUI() {
  setTimeout(fillLooks, 0);
  const cur = curOutfit();
  let h = energyBar() + noteBox('🛍️ <b>Loja de Roupa</b> · Estilos novos dão <b>aparência</b> e mudam o teu visual no mundo 3D. O que compras fica no guarda-roupa (Casa).');
  h += `<div class="looks">${Object.entries(SHOP_OUTFITS).map(([id, p]) => {
    const O = OUTFITS[id], tem = G.roupas.includes(id), kid = G.idade < 13 && !O.kid, veste = cur === id;
    const lock = id === 'executivo' && G.edu < 4 && G.dinheiro < 20000000;
    const btn = veste ? `<button class="lkb on" disabled>A vestir</button>` : tem ? `<button class="lkb" ${kid ? 'disabled' : ''} onclick="wear('${id}')">Vestir</button>` : `<button class="lkb buy" ${kid || G.dinheiro < p ? 'disabled' : ''} onclick="buyOutfit('${id}')">${kzShort(p)}</button>`;
    return `<div class="look ${veste ? 'on' : ''}"><img data-look="${id}" alt=""><div class="lkt"><b>${O.t}</b><small>${kid ? 'A partir dos 13 anos' : lock ? 'Só licenciados ou 20M Kz' : tem ? 'No teu guarda-roupa' : 'Disponível'}</small>${btn}</div></div>`;
  }).join('')}</div>`;
  return h;
}

// ---- OUTROS
function clinicaUI() {
  return energyBar() + (G.doente ? noteBox('🤒 Estás doente! Faz uma consulta antes que piore.', true) : noteBox(`❤️ Saúde: <b>${G.stats.saude}</b>/100${talento('saude') ? ' · 💪 Saúde de ferro' : ''}`)) + ativList(['medico', 'estetica']);
}
function prisonUI() {
  return noteBox(`🔒 Estás na <b>Cadeia de Viana</b>. Faltam <b>${G.preso}</b> ano(s). Na cadeia cada ano demora 6 minutos reais; depois fecha o ano.`) + list([btnItem('🙏', 'Bom comportamento', 'Pode reduzir a pena', '', 'prisonAct()'), btnItem('📚', 'Estudar na prisão', 'Ler livros da biblioteca da cadeia', '', "prisonStudy()")]);
}
function prisonStudy() { if (G.acoes <= 0) return toast('Sem energia este ano.'); G.acoes--; const t = 'Leste livros na biblioteca da cadeia. ' + fx({ inteligencia: R(2, 4) }); addLog(t); toast(strip(t)); save(); refresh(); }

const PANELS = {
  casa:    { ico: '🏠', t: 'A Minha Casa', sub: () => moradaTxt(), tabs: [['main', '🏠 Casa', casaMain], ['fam', '👨‍👩‍👧 Família', familiaUI], ['roupa', '👗 Guarda-roupa', roupaUI], ['diario', '📜 Diário', diarioUI]] },
  emprego: { ico: '💼', t: 'Centro de Emprego', sub: 'O teu trabalho, vagas e currículo', tabs: [['eu', '💼 Trabalho', trabalhoUI], ['vagas', '📋 Vagas', vagasUI], ['cv', '📄 Currículo', cvUI]] },
  escola:  { ico: '🎓', t: 'Escola & Universidade', sub: 'Primária, secundário, universidade e cursos', tabs: [['est', '📚 Estudos', estudosUI], ['uni', '🏛️ Universidade', uniUI], ['tec', '🛠️ Técnicos & Carta', tecnicoUI]] },
  mercado: { ico: '🧺', t: 'Mercado do Roque', sub: 'Biscates, negócios e roupa', tabs: [['m', '🧺 Mercado', mercadoAtiv], ['neg', '🏪 Negócios', negociosUI], ['bout', '🛍️ Loja de Roupa', boutiqueUI]] },
  banco:   { ico: '🏦', t: 'Banco Palanca', sub: 'Conta, crédito e stand', tabs: [['c', '🏦 Conta', contaUI], ['loja', '🚗 Stand & Loja', lojaUI]] },
  imobiliaria: { ico: '🏘️', t: 'Imobiliária', sub: 'Centro Habitacional · casas e as 21 províncias', tabs: [['casas', '🏘️ Casas', imobUI], ['cid', '🗺️ Províncias', cidadesUI]] },
  clinica: { ico: '🏥', t: 'Clínica Bem-Estar', sub: 'Saúde em primeiro lugar', body: clinicaUI },
  igreja:  { ico: '⛪', t: 'Igreja', sub: 'Fé, comunidade e boas ações', body: () => energyBar() + ativList(['igreja', 'voluntario']) + list([btnItem('🤝', 'Conhecer pessoas da paróquia', 'Fazer amigos', '', "makeFriend('na igreja')", G.idade < 5)]) },
  ginasio: { ico: '🏋️', t: 'Ginásio & Campo', sub: 'Corpo são, mente sã', body: () => energyBar() + noteBox(`🏀 Treinos acumulados: <b>${G.treinos}</b> (o desporto profissional pede 6+ e saúde 80+)`) + ativList(['ginasio', 'basquete', 'futebol', 'salao']) },
  farra:   { ico: '💃', t: 'Discoteca Kizomba', sub: 'Kizomba, semba e kuduro até de manhã', body: () => energyBar() + (G.idade < 14 ? tooYoung(16, 'entrar na discoteca') : ativList(['farra', 'kuduro']) + list([btnItem('💘', 'Engatar na pista', 'Procurar namoro', '', "findLove('farra')", G.idade < 16 || !!G.parceiro), btnItem('🤝', 'Fazer amigos na farra', '', '', "makeFriend('na discoteca')")])) },
  praia:   { ico: '🏖️', t: 'Praia da Ilha', sub: 'Mar, sol e peixe fresco', body: () => energyBar() + ativList(['praia', 'pesca']) },
  cadeia:  { ico: '🔒', t: 'Cadeia de Viana', sub: 'Ninguém quer vir parar aqui…', body: () => noteBox('Os portões estão fechados. Quem faz esquemas acaba aqui dentro. Porta-te bem! 😅') },
  cela:    { ico: '🔒', t: 'A Tua Cela', sub: 'Cadeia de Viana', body: prisonUI },
  diario:  { ico: '📜', t: 'Diário', sub: 'A história da tua vida', body: diarioUI },
};
function openLocation(id) {
  if (G.preso > 0 && id !== 'cela') return toast('🔒 Estás preso(a)! Não podes sair da cela.');
  if (G.idade < 4 && !['casa', 'praia', 'igreja', 'clinica', 'diario'].includes(id)) return toast('👶 És muito pequenino(a)! Os teus pais não te deixam ir aí sozinho(a).');
  openPanel(id);
}
function openPanel(id, tab) {
  if (G.preso > 0 && !['cela', 'diario'].includes(id)) { toast('🔒 Estás preso(a)!'); id = 'cela'; }
  closePhone();
  panelId = id; if (tab) panelTab[id] = tab; uiBlocked = true; renderPanel(false);
  $('#panel').classList.remove('hidden'); $('#prompt').classList.add('hidden'); document.body.classList.add('panel-open');
}
function setTab(t) { panelTab[panelId] = t; renderPanel(false); }
function renderPanel(keepScroll) {
  const P = PANELS[panelId]; if (!P) return;
  const body = $('#pBody'); const st = body.scrollTop;
  $('#pHead').innerHTML = `<div class="pico">${P.ico}</div><div style="min-width:0"><h3>${P.t}</h3><div class="psub">${typeof P.sub === 'function' ? P.sub() : P.sub}</div></div><button class="pclose" onclick="closePanel()" aria-label="Fechar">✕</button>`;
  if (P.tabs) {
    const cur = panelTab[panelId] || P.tabs[0][0]; const T_ = P.tabs.find(t => t[0] === cur) || P.tabs[0];
    body.innerHTML = `<div class="tabs">${P.tabs.map(t => `<button class="tab ${t[0] === T_[0] ? 'on' : ''}" onclick="setTab('${t[0]}')">${t[1]}</button>`).join('')}</div>` + T_[2]();
  } else body.innerHTML = P.body();
  if (keepScroll) body.scrollTop = st; else body.scrollTop = 0;
}
function closePanel() { if (!panelId) return; panelId = null; $('#panel').classList.add('hidden'); document.body.classList.remove('panel-open'); uiBlocked = modalOpen || !!phoneApp; if (nearLoc) showPrompt(nearLoc); }

/* =========================================================
   ANO / EVENTOS
   ========================================================= */
function ageUpUI() {
  if (busy || !G || !G.vivo || mode !== 'game' || modalOpen) return;
  busy = true; closePanel(); closePhone(); uiBlocked = true;
  const f = $('#fade'); f.innerHTML = `<div><small>Um ano depois…</small><b>${G.idade + 1} anos</b><span>${G.ano + 1}</span></div>`; f.classList.add('on');
  setTimeout(() => {
    const wasPreso = G.preso > 0;
    const r = ageUpLogic();
    if (r === 'dead') { f.classList.remove('on'); busy = false; return die(); }
    checkPlayerLook();
    if (wasPreso && G.preso === 0) releaseFromPrison();
    dayT = .3; refresh();
    setTimeout(() => {
      f.classList.remove('on'); busy = false; uiBlocked = false;
      const last = G.log[G.log.length - 1];
      if (last) toast(`📅 ${G.idade} anos: ` + strip(last.e[last.e.length > 1 && /Mesada|Salário|Custo/.test(last.e[0].t) ? 1 : 0].t));
      if (G.idade === 18 || G.idade === 13 || G.idade === 6) flash(G.idade === 18 ? '🎂 18 anos! Maior de idade' : G.idade === 13 ? '🧑🏿 Adolescência!' : '🎒 Primeiro dia de escola!');
      if (r === 'area') setTimeout(areaModal, 450);
      else if (r) setTimeout(() => eventModal(r), 450);
    }, 900);
  }, 850);
}
function eventModal(ev) {
  const choices = ev.ch.map((c, i) => `<button class="choice" data-i="${i}">${c[0]}${c[1] ? `<small>${c[1]}</small>` : ''}</button>`).join('');
  openModal(`<div class="mico">${ev.ico}</div><h3>${ev.t}</h3><p class="center">${ev.txt()}</p><div class="choices">${choices}</div>`, false);
  $('#modalBox').querySelectorAll('.choice').forEach(b => b.onclick = () => {
    const c = ev.ch[+b.dataset.i]; const r = c[2]() || '';
    addLog(`${ev.ico} <b>${ev.t}:</b> ${c[0]}. ${r}`);
    $('#modalBox').querySelector('.choices').outerHTML = `<div class="result">${r || 'Feito.'}</div><div class="choices"><button class="btn btn-yel" id="evOk">Continuar</button></div>`;
    $('#evOk').onclick = () => { closeModal(); checkPlayerLook(); if (G.stats.saude <= 0) die(); };
    checkUnlocks(); checkConq(); save(); refresh();
  });
}

/* =========================================================
   MORTE
   ========================================================= */
function die(causa) {
  if (!G || !G.vivo) return;
  const shot = myShot();
  const d = deathData(causa);
  closePanel(); closePhone(); closeModal(); uiBlocked = true; dying = .001;
  $('#hud').classList.add('hidden'); $('#prompt').classList.add('hidden');
  flash('☠️');
  setTimeout(() => {
    mode = 'death';
    const S = G.stats;
    $('#death').innerHTML = `<div class="dbox">
      <div class="tomb"><img src="${shot || imgSrc(G.avatar.base)}" alt=""></div>
      <div class="aqui">Aqui jaz</div><h2>${esc(G.nome)}</h2>
      <div class="cause">${G.ano - G.idade} – ${G.ano} · ${G.cidade.prov} · Morreu aos ${G.idade} anos · ${d.causa}</div>
      <div class="summary">
        <div>Património<b>${kzShort(d.patrimonio)}</b></div><div>Escolaridade<b>${EDU[G.edu]}</b></div>
        <div>Filhos<b>${G.filhos.length}</b></div><div>Último emprego<b>${G.emprego ? jobTitle(G.emprego) : (G.historico.slice(-1)[0] || '—')}</b></div>
        <div>Fama<b>${S.fama}</b></div><div>Karma<b style="color:${COLOR.karma}">${S.karma}</b></div>
      </div>
      <div class="reinc"><h4>☯ Próxima Encarnação</h4>${d.destino}<br><b style="color:var(--yel)">Bónus de karma: ${d.kb >= 0 ? '+' : ''}${d.kb}</b> · Pontuação: <b>${d.score}</b></div>
      <div class="menu"><button class="btn btn-pri" onclick="G=null;newLifeFlow(true)">☯ Renascer</button><button class="btn btn-ghost" onclick="G=null;goTitle()">Menu Principal</button></div></div>`;
    showOv('death');
  }, 2600);
}
function gameMenu() {
  openModal(`<div class="mico">☰</div><h3>Menu</h3><div class="choices">
    <button class="btn btn-ghost" onclick="closeModal();showHelp()">❓ Como Jogar</button>
    <button class="btn btn-ghost" onclick="closeModal();showCredits()">★ Créditos</button>
    <button class="btn btn-ghost" onclick="closeModal();admAbrir()">🛡️ Administração</button>
    <button class="btn btn-ghost" onclick="save();closeModal();goTitle()">🏠 Menu Principal (vida guardada)</button>
    <button class="btn btn-pri" onclick="if(confirm('Terminar esta vida agora?')){closeModal();die('decidiu partir para a próxima encarnação')}">☠ Terminar esta vida</button>
    <button class="btn btn-ghost" onclick="closeModal()">Voltar ao jogo</button></div>`);
}

/* =========================================================
   ARRANQUE
   ========================================================= */
window.addEventListener('load', () => {
  try { init3D(); } catch (e) { console.error(e); $('#loading').innerHTML = '<div style="text-align:center">⚠️ O teu navegador não suporta WebGL.<br><a href="../index.html" style="color:#ffcb00">Jogar a versão 2D</a></div>'; return; }
  setTimeout(async () => {
    try { buildWorld(); } catch (e) { console.error(e); }
    try {
      await Acc.init();
      let r = await Acc.restore();
      for (let i = 0; !r && Acc.hasSession && i < 3; i++) {   // rede móvel/servidor a acordar: insiste antes de mostrar o login
        await new Promise(res => setTimeout(res, 2000 * (i + 1)));
        await Acc.init(); r = await Acc.restore();
      }
      if (r) setSession(r);
    } catch (e) { console.error(e); }
    $('#loading').classList.add('hidden'); goTitle();
  }, 30);
});
addEventListener('beforeunload', () => { try { save(); } catch (e) { } });
