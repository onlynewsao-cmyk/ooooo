/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Telemóvel (smartphone moderno)
   ========================================================= */
let chatKey = null, kambaProf = null, phoneHist = [];

const WALLS = [
  { t: 'Luanda à noite', css: 'radial-gradient(120% 70% at 50% 0%,#5a1530 0%,#1a0b16 45%,#071425 100%)' },
  { t: 'Pôr do sol na Ilha', css: 'linear-gradient(180deg,#ffb347 0%,#ff6a3d 28%,#c2185b 55%,#2a0f3a 100%)' },
  { t: 'Bandeira de Angola', css: 'linear-gradient(180deg,#c8102e 0 50%,#0d0d0d 50% 100%)' },
  { t: 'Quedas de Kalandula', css: 'linear-gradient(170deg,#0f5132 0%,#14b8a6 45%,#0b1f3a 100%)' },
  { t: 'Aurora', css: 'linear-gradient(160deg,#8a4dff 0%,#3fa9ff 50%,#0d1030 100%)' },
  { t: 'Grafite', css: 'linear-gradient(180deg,#2c2c30,#050505)' },
];
const APPS = [
  { id: 'telefone', ico: '📞', t: 'Telefone', bg: 'linear-gradient(#5df07f,#21b843)', tel: 1, dock: 1 },
  { id: 'mensagens', ico: '💬', t: 'Fala Já', bg: 'linear-gradient(#5fe58a,#14a34a)', tel: 1, dock: 1 },
  { id: 'bwe', ico: '📸', t: 'Bwé Social', bg: 'linear-gradient(45deg,#f9a03f,#e1306c 50%,#833ab4)', tel: 2, dock: 1 },
  { id: 'camara', ico: '📷', t: 'Câmara', bg: 'linear-gradient(#d9d9de,#8e8e93)', tel: 2, dock: 1 },
  { id: 'kuia', ico: '🎵', t: 'Kuia', bg: 'linear-gradient(135deg,#111 60%,#25f4ee 61% 70%,#fe2c55 71%)', tel: 2 },
  { id: 'kamba', ico: '💘', t: 'Kamba', bg: 'linear-gradient(#ff6b8a,#e5174f)', tel: 2, adult: 1 },
  { id: 'banco', ico: '🏦', t: 'Banco Móvel', bg: 'linear-gradient(#3d8bff,#1745b8)', tel: 2 },
  { id: 'investir', ico: '📈', t: 'Invest AO', bg: 'linear-gradient(#1ed47a,#0a7a45)', tel: 2 },
  { id: 'emprego', ico: '💼', t: 'Emprego Já', bg: 'linear-gradient(#ffa149,#e8590c)', tel: 2 },
  { id: 'yango', ico: '🚕', t: 'Kandonga', bg: 'linear-gradient(#ffe14d,#ffb800)', tel: 2 },
  { id: 'tupuca', ico: '🛵', t: 'Txova', bg: 'linear-gradient(#ff6a5c,#d4231a)', tel: 2 },
  { id: 'loja', ico: '🛒', t: 'Kitanda Online', bg: 'linear-gradient(#ffc04d,#f08c00)', tel: 2 },
  { id: 'imoveis', ico: '🏘️', t: 'Casa Já', bg: 'linear-gradient(#8f8cff,#4b47d6)', tel: 2 },
  { id: 'mapa', ico: '🗺️', t: 'Angola', bg: 'linear-gradient(#3ccf8e,#0b7d55)', tel: 2 },
  { id: 'aulas', ico: '🎓', t: 'Aula Online', bg: 'linear-gradient(#4dabff,#0062d6)', tel: 2 },
  { id: 'jogos', ico: '🎮', t: 'Jogos', bg: 'linear-gradient(#c77dff,#7b2cbf)', tel: 2 },
  { id: 'musica', ico: '🎧', t: 'Kizomba FM', bg: 'linear-gradient(#ff5c8a,#c9184a)', tel: 2 },
  { id: 'noticias', ico: '📰', t: 'Notícias', bg: 'linear-gradient(#ff5a4f,#c41d1d)', tel: 2 },
  { id: 'tempo', ico: '⛅', t: 'Tempo', bg: 'linear-gradient(#6fd3ff,#1e88e5)', tel: 2 },
  { id: 'saude', ico: '🩺', t: 'Saúde', bg: 'linear-gradient(#ff6b8a,#e0245e)', tel: 2 },
  { id: 'galeria', ico: '🖼️', t: 'Galeria', bg: 'linear-gradient(135deg,#ffd166,#ef476f 50%,#118ab2)', tel: 2 },
  { id: 'ia', ico: '✨', t: 'Kamba IA', bg: 'conic-gradient(from 200deg,#4285f4,#9b72cb,#d96570,#f6b26b,#4285f4)', tel: 3 },
  { id: 'vida', ico: '📊', t: 'A Minha Vida', bg: 'linear-gradient(#a06bff,#5a2bd6)', tel: 0 },
  { id: 'diario', ico: '📜', t: 'Diário', bg: 'linear-gradient(#a47148,#6b4a2a)', tel: 0 },
  { id: 'definicoes', ico: '⚙️', t: 'Definições', bg: 'linear-gradient(#9a9aa0,#55555b)', tel: 0 },
];
const appOk = a => G.tel >= a.tel && (!a.adult || (plus18() && adulto()));
const phHash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
const unread = () => (G && G.inbox ? G.inbox.filter(m => !m.lida).length : 0);
function updateBadge() { const b = $('#phBadge'); if (!b || !G) return; const n = unread(); b.textContent = n > 9 ? '9+' : n; b.classList.toggle('hidden', !n || G.tel < 1); const hb = $('#hbPhone'); if (hb) hb.style.opacity = G.tel ? 1 : .45; }
const nowTxt = () => { const hr = Math.floor(((dayT * 24) + 6) % 24), mi = Math.floor((dayT * 24 * 60) % 60); return String(hr).padStart(2, '0') + ':' + String(mi).padStart(2, '0'); };
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'], MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dateTxt = () => { const d = new Date(); return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${G.ano}`; };
function weather(offset = 0) {
  const h = phHash(G.ano + G.cidade.prov + offset), alt = ['Huambo', 'Huíla', 'Bié'].includes(G.cidade.prov);
  const c = [['☀️', 'Sol'], ['⛅', 'Parcialmente nublado'], ['🌤️', 'Céu limpo'], ['🌧️', 'Chuva forte'], ['⛈️', 'Trovoada'], ['🌥️', 'Cacimbo']][h % 6];
  return { ico: c[0], t: c[1], temp: (alt ? 18 : 25) + (h >>> 4) % 8 };
}

/* ---------------- ABRIR / FECHAR ---------------- */
function openPhone() {
  if (!G || mode !== 'game' || busy) return;
  if (G.preso > 0) return toast('🔒 Os guardas confiscaram o teu telemóvel.');
  if (!G.tel && G.idade < 10) return toast(G.idade < 3 ? '👶 És um bebé! Ainda não tens telemóvel. (Usa o menu ☰ para as definições.)' : '🧒 Ainda és muito pequeno(a) para ter telemóvel. Os teus pais dão-te um aos 12 anos.');
  closePanel(); uiBlocked = true; phoneHist = [];
  phoneApp = G.tel === 0 ? 'semtel' : 'lock';
  $('#phone').classList.remove('hidden'); renderPhone();
}
function closePhone() { if (!phoneApp) return; phoneApp = null; chatKey = null; $('#phone').classList.add('hidden'); uiBlocked = modalOpen || !!panelId; }
function phoneHome() { if (!phoneApp) return; phoneApp = G.tel === 0 ? 'semtel' : 'home'; chatKey = null; renderPhone(); }
function phoneBack() { if (chatKey) { chatKey = null; renderPhone(); return; } phoneHome(); }
function unlockPhone() {
  const s = $('#phBody'); s.classList.add('unlocking');
  setTimeout(() => { phoneApp = 'home'; renderPhone(); }, G.tel >= 4 ? 420 : 220);
}
function phoneOpen(id) {
  const A = APPS.find(a => a.id === id);
  if (G.tel < A.tel) return toast(A.tel >= 3 ? '✨ O Kamba IA só funciona em telemóveis topo de gama (Nova S25 Ultra ou superior).' : '📱 Esta app precisa de um smartphone. Compra um no Banco → Stand & Loja ou na Kitanda Online.');
  if (A.adult && !(plus18() && adulto())) return toast('🔞 A app Kamba é só para maiores de 18 com a opção +18 ativa.');
  phoneApp = id; chatKey = null;
  if (id === 'noticias') readNews();
  renderPhone();
}

/* ---------------- RENDER ---------------- */
function renderPhone(keep) {
  if (!phoneApp || !G) return;
  const ph = $('#ph'), b = $('#phBody'), st = b.scrollTop;
  const m = G.tel;
  ph.className = 'ph m' + (m || 2);
  b.classList.remove('unlocking');
  const wall = WALLS[G.wall || 0] || WALLS[0];
  const appView = !['home', 'lock', 'semtel'].includes(phoneApp);
  b.style.background = m === 1 ? '' : appView ? '#0b0b10' : wall.css;
  b.classList.toggle('appv', appView);
  const bat = 35 + phHash(G.ano + 'b') % 64;
  $('#phBar').innerHTML = m === 1 ? `<span>▂▄▆ MBOTE</span><span>${nowTxt()}</span><span>▮▮▮▯</span>`
    : `<span>${nowTxt()}</span><span>${!m ? 'Sem SIM' : m >= 3 ? '5G' : '4G'} <b style="letter-spacing:-2px">▂▄▆█</b> <span class="batt"><i style="width:${bat}%"></i></span> ${bat}%</span>`;
  $('#phNav').classList.toggle('hidden', m === 1);
  $('#phKeys').classList.toggle('hidden', m !== 1);
  let h;
  if (m === 1 && phoneApp !== 'semtel') h = nokiaScreen();
  else h = (PHONE_VIEWS[phoneApp] || PHONE_VIEWS.home)();
  b.innerHTML = h; b.scrollTop = keep ? st : 0;
  updateBadge();
}
const apHead = (t, sub, right) => `<div class="aphead"><button onclick="phoneBack()" aria-label="Voltar">‹</button><div style="flex:1;min-width:0"><h3>${t}</h3>${sub ? `<div class="apsub">${sub}</div>` : ''}</div>${right || ''}</div>`;
const appIcon = a => `<button class="app ${appOk(a) ? '' : 'off'}" onclick="phoneOpen('${a.id}')"><i style="background:${a.bg}">${a.ico}${a.id === 'mensagens' && unread() ? `<span class="bd">${unread()}</span>` : ''}${!appOk(a) ? '<em>🔒</em>' : ''}</i><span>${a.t}</span></button>`;

const PHONE_VIEWS = {
  semtel: () => `<div class="lockc" style="padding-top:70px"><div style="font-size:64px">📵</div><h3 style="margin:10px 0 6px">Não tens telemóvel</h3><p style="color:#bbb;font-size:13px;line-height:1.5">Compra um Tijolinho, um Faísca ou um Lumi no<br><b>Banco → Stand & Loja</b>.</p>
    <button class="pbtn" onclick="closePhone();openPanel('shopping','loja')">🛒 Ir à loja</button></div>
    <div class="phhome" style="margin-top:20px">${APPS.filter(a => a.tel === 0).map(appIcon).join('')}</div>`,

  lock: () => {
    const w = weather(), ntf = (G.inbox || []).filter(x => !x.lida).slice(0, 3);
    return `<div class="lockc"><div class="lkdate">${dateTxt()}</div><div class="lktime">${nowTxt()}</div>
      <div class="lkw">${w.ico} ${w.temp}° · ${G.cidade.mun}</div>
      <div class="ntfs">${ntf.map(n => `<div class="ntf"><div class="ni">${n.ico}</div><div style="min-width:0"><b>${esc(n.de)}</b><span>${esc(n.txt)}</span></div><small>agora</small></div>`).join('') || '<div class="ntf" style="justify-content:center;opacity:.7">Sem notificações novas</div>'}</div>
      <button class="unlock" onclick="unlockPhone()">${G.tel >= 4 ? '<span class="faceid">⌾</span> Face ID · toca para abrir' : '🔓 Toca para desbloquear'}</button></div>`;
  },

  home: () => {
    const w = weather(), inv = G.inv || { bodiva: 0, cripto: 0, dolar: 0 };
    const grid = APPS.filter(a => !a.dock);
    return `<div class="widgets">
        <div class="widget"><div class="wt">${G.cidade.mun}</div><div class="wbig">${w.temp}°</div><div class="ws">${w.ico} ${w.t}</div></div>
        <div class="widget"><div class="wt">💳 Saldo</div><div class="wbig" style="font-size:20px;color:${G.dinheiro < 0 ? '#ff6b6b' : '#7ef0ad'}">${kzShort(G.dinheiro)}</div><div class="ws">🏦 ${kzShort(G.poupanca)}${inv.bodiva + inv.cripto + inv.dolar ? ' · 📈 ' + kzShort(inv.bodiva + inv.cripto + inv.dolar) : ''}</div></div>
      </div>
      <div class="phhome">${grid.map(appIcon).join('')}</div>
      <div class="dock">${APPS.filter(a => a.dock).map(appIcon).join('')}</div>`;
  },

  telefone: () => apHead('Telefone', 'Contactos') + `<div class="clist">${contacts().map(c => `<div class="crow"><div class="cav">${c.ico}</div><div class="cinfo"><b>${esc(c.nome)}</b><span>${c.label}${c.rel != null ? ` · ❤️ ${c.rel}` : ''}</span></div>
      <div class="cbtns">${c.call ? `<button onclick="callPerson('${c.key}')" title="Ligar">📞</button>` : ''}<button onclick="phoneApp='mensagens';chatKey='${c.key}';renderPhone()" title="Mensagem">💬</button></div></div>`).join('')}
      <div class="crow"><div class="cav" style="background:#c8102e">🚑</div><div class="cinfo"><b>Emergência 112</b><span>Consulta médica urgente</span></div><div class="cbtns"><button onclick="runAtiv('medico')">📞</button></div></div></div>`
    + `<p class="apnote">Ligar gasta 1 energia e fortalece muito a relação. Mensagens são grátis (1 por pessoa por ano).</p>`,

  mensagens: () => {
    if (chatKey) return chatView(chatKey);
    const cs = contacts(), extra = [['chefe', '💼', 'Chefe'], ['darkcell', '📶', 'DarkCell'], ['unitel', '📶', 'DarkCell'], ['marca', '🤝', 'Marca parceira']].filter(([k]) => (G.inbox || []).some(m => m.key === k));
    const jogs = smsThreads().map(j => ({ key: 'p' + j.num, ico: '📶', nome: j.nome + ' · ' + fmtTel(j.num) }));
    const all = [...jogs, ...cs.map(c => ({ key: c.key, ico: c.ico, nome: c.nome })), ...extra.map(([key, ico, nome]) => ({ key, ico, nome }))];
    const rows = all.map(c => { const ms = (G.inbox || []).filter(m => m.key === c.key); const last = ms[0]; const un = ms.filter(m => !m.lida).length; return { c, last, un }; })
      .sort((a, b) => (b.un - a.un) || ((b.last ? 1 : 0) - (a.last ? 1 : 0)));
    return apHead('Fala Já', 'Conversas', `<button style="background:none;border:0;font-size:20px;cursor:pointer" onclick="smsNovo()" title="SMS a um número">✉️＋</button>`) + `<div class="clist">${rows.map(({ c, last, un }) => `<button class="crow" onclick="chatKey='${c.key}';renderPhone()"><div class="cav">${c.ico}</div><div class="cinfo"><b>${esc(c.nome)}</b><span>${last ? esc(last.txt) : 'Toca para conversar'}</span></div>${un ? `<span class="unb">${un}</span>` : ''}</button>`).join('')}</div>`;
  },

  bwe: () => {
    const handle = '@' + G.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
    const feed = G.feed || [];
    const friends = [...G.amigos, ...G.irmaos].slice(0, 4).map((f, i) => { const hh = phHash(f.nome + G.ano); return `<div class="post"><div class="pu"><span class="cav sm">${f.g === 'F' ? '👩🏿' : '🧑🏿'}</span><b>${esc(f.nome.split(' ')[0])}</b><small>${['há 2 h', 'há 5 h', 'ontem', 'há 3 dias'][i]}</small></div><div class="pimg" style="background:${['linear-gradient(135deg,#ff9a3d,#c2185b)', 'linear-gradient(135deg,#14b8a6,#1f63c9)', 'linear-gradient(135deg,#ffcb00,#2e8b57)', 'linear-gradient(135deg,#8a4dff,#ff6fb5)'][hh % 4]}">${['🏖️', '🍲', '🎉', '⚽', '💃', '🌅'][hh % 6]}</div><div class="pa">❤️ ${numShort(20 + hh % 900)} · 💬 ${hh % 60}</div><div class="pt">${['Domingo na Ilha com a família', 'Muamba da mãe é outra coisa 😋', 'Kizomba até de manhã 🎶', 'Petro campeão!! 🏆', 'Fim de semana no Mussulo', 'Pôr do sol em Luanda ❤️'][hh % 6]}</div></div>`; }).join('');
    return apHead('Bwé Social', handle) + `<div class="prof"><img src="${myShot()}" alt=""><div style="flex:1"><div class="n">${esc(G.nome)}${G.verificado ? ' <span style="color:#3fa9ff">✔</span>' : ''}</div>
      <div class="stats3"><div><b>${feed.length}</b>posts</div><div><b>${numShort(G.seg)}</b>seguidores</div><div><b>${numShort(40 + G.amigos.length * 30 + Math.round(G.seg * .02))}</b>a seguir</div></div></div></div>
      ${energyBar()}
      <div class="pgrid2">${POSTS.filter(P => P.id !== 'danca' && P.id !== 'humor').map(P => { const ok = !P.req || P.req(); return `<button class="pbtn sm" ${ok ? '' : 'disabled'} onclick="postSocial('${P.id}')">${P.ico} ${P.t.replace('Publicar uma ', '').replace('Mostrar a ', '')}</button>`; }).join('')}</div>
      ${feed.length ? `<div class="igrid">${feed.slice(0, 9).map(f => `<div class="ig" style="background:${f.viral ? 'linear-gradient(135deg,#ff9a3d,#e1306c)' : 'linear-gradient(135deg,#2a2a35,#16161d)'}"><span>${f.ico}</span><small>${f.g >= 0 ? '+' : ''}${numShort(f.g)}</small></div>`).join('')}</div>` : ''}
      <div class="apsec">Feed</div>${friends || '<p class="apnote">Faz amigos para veres as publicações deles.</p>'}
      <p class="apnote">Sem publicar pelo menos uma vez por ano, perdes 12% dos seguidores. 5k+ dá parcerias pagas; 50k+ abre a carreira de influenciador(a).</p>`;
  },

  kuia: () => {
    const hh = phHash(G.ano + 'kuia');
    const trends = ['#KudurоChallenge', '#Kizombeira', '#LuandaVibes', '#FunjeChallenge', '#DançaDoCandongueiro', '#AfroHouseAO'];
    return apHead('Kuia', 'Para ti') + `<div class="kv"><div class="kvbg">${['💃', '🕺', '🎤', '😂'][hh % 4]}</div>
      <div class="kvside"><span>❤️<small>${numShort(1000 + hh % 90000)}</small></span><span>💬<small>${numShort(hh % 3000)}</small></span><span>↗️<small>Partilhar</small></span></div>
      <div class="kvtxt"><b>@${['kiesse_oficial', 'dj_malvado_ao', 'humor_do_musseque', 'luanda_dance'][hh % 4]}</b><br>${trends[hh % 6]} 🔥 · 🎵 som original</div></div>
      ${energyBar()}<div class="pgrid2"><button class="pbtn" onclick="postSocial('danca')">💃 Gravar dança</button><button class="pbtn" onclick="postSocial('humor')">😂 Vídeo de humor</button></div>
      <div class="apsec">Em alta em Angola</div><div class="chips">${trends.map(t => `<span class="tchip">${t}</span>`).join('')}</div>
      <p class="apnote">Seguidores: <b>${numShort(G.seg)}</b> · os vídeos usam a tua fama e inteligência. Talento artístico dá o dobro!</p>`;
  },

  camara: () => `${apHead('Câmara', G.tel >= 3 ? 'Modo Retrato · ' + (G.tel >= 4 ? '48MP Pro' : '200MP') : 'Foto')}
    <div class="viewf"><img src="${avatarShot(playerCfg(), '#3a3442', true)}" alt=""><div class="vfgrid"></div><span class="vflbl">${nearLoc ? LOC_POS[nearLoc].n : G.cidade.mun}</span></div>
    <div class="shutter"><button onclick="phoneOpen('galeria')" class="thumbb">${(G.fotos || [])[0] ? `<img src="${avatarShot(G.fotos[0].cfg, G.fotos[0].bg, true)}">` : '🖼️'}</button><button class="shut" onclick="takeSelfie(nearLoc?('em '+LOC_POS[nearLoc].n):'no bairro')"></button><button class="thumbb" onclick="postSocial('selfie')" title="Publicar">↗️</button></div>
    <p class="apnote">Tira selfies para guardar memórias da tua vida. ↗️ publica uma selfie no Bwé Social (gasta 1 energia).</p>`,

  galeria: () => {
    const f = G.fotos || [];
    return apHead('Galeria', `${f.length} fotos`) + (f.length ? `<div class="gal">${f.map(x => `<div class="gph"><img src="${avatarShot(x.cfg, x.bg, true)}" alt=""><small>${x.idade} anos · ${esc(x.onde)}</small></div>`).join('')}</div>` : '<p class="apnote" style="margin-top:40px;text-align:center">Ainda não tiraste fotos. Abre a Câmara! 📷</p>');
  },

  kamba: () => {
    if (!kambaProf) kambaProf = newKambaProf();
    const k = kambaProf;
    return apHead('Kamba', 'Encontra a tua alma gémea') + (G.parceiro ? `<div class="apwarn">💕 Já estás com ${esc(G.parceiro.nome.split(' ')[0])}. Se te apanharem aqui… 😬</div>` : '') +
      `<div class="kcard" style="background:${k.bg}"><img class="kph" src="${avatarShot(k.cfg, '#4a3346', true, 320)}" alt=""><div class="kinfo"><b>${k.nome}, ${k.idade}</b><span>📍 ${k.local} · ${k.prof}</span><p>${k.bio}</p></div></div>
      ${energyBar()}<div class="kbtns"><button class="kno" onclick="kambaProf=null;renderPhone()">✕</button><button class="kyes" onclick="kambaProf=null;findLove('app')">💚</button></div>
      <p class="apnote">💚 tenta um match (gasta 1 energia). ✕ passa ao próximo perfil (grátis).</p>`;
  },

  banco: () => apHead('Banco Móvel', 'Banco Palanca · Palanca Pay') + `<div class="card3d"><div class="cc1">BANCO PALANCA</div><div class="cc2">${kz(G.dinheiro)}</div><div class="cc3">**** **** **** ${String(phHash(G.nome) % 10000).padStart(4, '0')}</div><div class="cc4">${esc(G.nome.toUpperCase())}</div></div>` + contaUI()
    + (G.idade >= 14 ? `<div class="apsec">Transferências rápidas</div><div class="chips">${G.mae.vivo ? chip('💸 Ajudar a mãe', "helpParent('mae')") : ''}${G.pai.vivo ? chip('💸 Ajudar o pai', "helpParent('pai')") : ''}</div>` : ''),

  investir: () => {
    const inv = G.inv || { bodiva: 0, cripto: 0, dolar: 0 }, mk = G.mercado || { bodiva: 0, cripto: 0, dolar: 0 };
    const A = [['bodiva', '📈', 'Ações BODIVA', 'Bolsa de Luanda · risco médio (-10% a +22%)'], ['cripto', '₿', 'Moedas Cripto', 'Muito volátil (-65% a +140%)'], ['dolar', '💵', 'Dólares (USD)', 'Protege contra a desvalorização do Kwanza']];
    const tot = inv.bodiva + inv.cripto + inv.dolar;
    return apHead('Invest AO', 'Carteira de investimentos') + `<div class="kpibig"><small>Carteira total</small><b>${kz(tot)}</b><span>Disponível: ${kzShort(G.dinheiro)}</span></div>`
      + (G.idade < 18 ? '<div class="apwarn">🔞 Só podes investir a partir dos 18 anos.</div>' : '')
      + A.map(([k, ico, t, d]) => `<div class="stk"><div class="stkh"><span class="sico">${ico}</span><div style="flex:1"><b>${t}</b><small>${d}</small></div><div style="text-align:right"><b>${kzShort(inv[k])}</b><small class="${mk[k] >= 0 ? 'g' : 'r'}">${mk[k] >= 0 ? '▲' : '▼'} ${Math.round(mk[k] * 100)}% último ano</small></div></div>
        <div class="chips">${chip('+100 mil', `invest('${k}',100000)`, G.idade < 18)}${chip('+1M', `invest('${k}',1000000)`, G.idade < 18)}${chip('+10M', `invest('${k}',10000000)`, G.idade < 18)}${chip('Tudo', `invest('${k}',G.dinheiro)`, G.idade < 18)}${chip('Resgatar', `resgatar('${k}')`, !inv[k])}</div></div>`).join('')
      + '<p class="apnote">Os rendimentos são calculados a cada ano. Resgatar tem uma taxa de 1% (2% em cripto). Investir não gasta energia.</p>';
  },

  emprego: () => apHead('Emprego Já', 'Vagas em Angola') + vagasUI(),

  yango: () => {
    if (G.idade < 12) return apHead('Kandonga') + '<div class="apwarn">🧒 Menores de 12 anos não podem andar sozinhos de Kandonga.</div>';
    const dests = Object.entries(LOC_POS).filter(([id]) => !['cela', 'cadeia'].includes(id));
    return apHead('Kandonga', 'Para onde vamos?') + `<div class="ymap">${dests.map(([id, L]) => `<span style="left:${50 + L.x / 1.6}%;top:${50 + L.z / 1.6}%">${L.ico}</span>`).join('')}<span class="me" style="left:${50 + playerPos.x / 1.6}%;top:${50 + playerPos.z / 1.6}%"></span></div>`
      + `<div class="clist">${dests.map(([id, L]) => { const d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z), p = rideCost(d); return `<button class="crow" onclick="rideTo('${id}')"><div class="cav" style="background:#ffcc00;color:#111">${L.ico}</div><div class="cinfo"><b>${L.n}</b><span>${(d / 10).toFixed(1)} km · ${Math.max(2, Math.round(d / 9))} min</span></div><b style="color:#ffcc00">${kzShort(p)}</b></button>`; }).join('')}</div>`;
  },

  tupuca: () => apHead('Txova', 'Comida ao domicílio em 30 min') + `<div class="list">${FOODS.map(F => btnItem(F.ico, F.t, Object.entries(F.ef).map(([k, v]) => `${SHORT[k]} ${v > 0 ? '+' : ''}${v}`).join(' '), kzShort(F.p), `orderFood('${F.id}')`, G.dinheiro < F.p)).join('')}</div><p class="apnote">Encomendar não gasta energia. Depois de 3 refeições no ano o efeito diminui. Comida de plástico tira saúde!</p>`,

  loja: () => apHead('Kitanda Online', 'Entrega grátis em Luanda') + lojaUI() + '<div class="apsec">Moda</div>' + boutiqueUI(),
  imoveis: () => apHead('Casa Já', 'App da Imobiliária · Centro Habitacional') + imobUI(),
  mapa: () => apHead('Angola', 'Mapa das 21 províncias e instituições') + angolaApp(),

  aulas: () => apHead('Aula Online', 'Aprende onde quiseres') + energyBar()
    + (G.estudo ? `<div class="apok">📚 A estudar ${esc(G.estudo.t)}: as aulas online contam para a nota do ano!</div>` : '')
    + `<div class="list">${btnItem('▶️', 'Vídeo-aulas na Aula Online', 'Grátis · +inteligência', 'Grátis', 'onlineClass(false)')}${btnItem('🎓', 'Curso certificado online', 'Coursera/edX · conta a dobrar', '25 mil', 'onlineClass(true)')}</div>`
    + `<p class="apnote">${G.bens.includes('portatil') ? '💻 Portátil: +1 bónus. ' : '💻 Com um portátil aprendes mais. '}${G.bens.includes('starlink') ? '🛰️ Céu Net: +1 bónus.' : '🛰️ A internet Céu Net também ajuda.'}</p>`,

  jogos: () => apHead('Jogos', 'Diversão e eSports') + energyBar() + `<div class="list">${GAMES.filter(g => g.tel >= 2).map(g => btnItem(g.ico, g.t, g.id === 'freefire' ? 'Pequena hipótese de ganhar torneios pagos' : g.id === 'xadrez' ? 'Treina a mente' : G.bens.includes('ps5') ? '🎮 Bónus PS5 ativo' : 'Relaxa com a malta', '', `playGame('${g.id}')`)).join('')}</div>`,

  musica: () => {
    const hh = phHash(G.ano + 'fm'), songs = [['Kizomba da Banda', 'C4 Pedro'], ['Semba Novo', 'Yola Semedo'], ['Kuduro Bwé', 'Os Lambas'], ['Afro House Mix', 'DJ Malvado'], ['Rumba Angolana', 'Paulo Flores']];
    const s = songs[hh % songs.length];
    return apHead('Kizomba FM', '100% música angolana') + `<div class="nowp"><div class="cover">🎶</div><b>${s[0]}</b><span>${s[1]}</span><div class="prog"><i></i></div>
      <div class="pctl"><button>⏮</button><button class="play" onclick="listenMusic();this.textContent='⏸'">${G.musicaAno ? '⏸' : '▶'}</button><button>⏭</button></div></div>
      <div class="apsec">Playlist</div><div class="clist">${songs.map(x => `<div class="crow"><div class="cav">🎵</div><div class="cinfo"><b>${x[0]}</b><span>${x[1]}</span></div></div>`).join('')}</div>
      <p class="apnote">Ouvir música dá felicidade (1 vez por ano, grátis).</p>`;
  },

  noticias: () => {
    const mk = G.mercado, hh = phHash(G.ano + 'n');
    const news = [
      mk ? `📈 BODIVA ${mk.bodiva >= 0 ? 'sobe' : 'cai'} ${Math.abs(Math.round(mk.bodiva * 100))}% no último ano` : '📈 BODIVA abre o ano em alta',
      mk ? `💵 Kwanza ${mk.dolar > 0.05 ? 'desvaloriza' : 'estável'} face ao dólar (${Math.round(mk.dolar * 100)}%)` : '💵 Banco Central mantém a taxa de juro',
      ['⚽ Leões da Ilha conquistam mais uma Liga Mwangolé', '🏀 Águias do Kilamba vencem a final do campeonato de basquetebol', '⚽ Palancas Negras apurados para o CAN'][hh % 3],
      ['🚇 Obras do metro de superfície de Luanda avançam', '🛣️ Nova estrada liga Luanda a Catete', '✈️ Novo aeroporto internacional recebe mais voos'][(hh >>> 3) % 3],
      ['🔌 ENDE anuncia cortes de energia programados', '🌧️ Chuvas fortes causam inundações em vários bairros', '🛢️ Preço do petróleo sobe e anima a economia'][(hh >>> 5) % 3],
      ['📱 DarkCell cobre mais províncias com 5G', '💻 Startups angolanas atraem investimento estrangeiro', '🎓 UAN abre novas vagas para Medicina'][(hh >>> 7) % 3],
    ];
    if (G.stats.fama >= 25) news.unshift(`⭐ ${G.nome} é uma das figuras mais faladas de ${G.cidade.prov}!`);
    if (G.negocios.length) news.push(`🏪 Pequenos negócios crescem em ${G.cidade.mun}`);
    return apHead('Notícias', 'Angola hoje') + `<div class="clist">${news.map((n, i) => `<div class="news ${i === 0 ? 'big' : ''}"><span class="nsrc">${['Diário Mwangolé', 'Folha da Ilha', 'Kalemba Notícias', 'Kumbu Económico', 'Rádio Marginal'][i % 5]} · há ${i + 1} h</span><b>${n}</b></div>`).join('')}</div><p class="apnote">Ler as notícias uma vez por ano dá +1 inteligência.</p>`;
  },

  tempo: () => {
    const w = weather();
    return apHead('Tempo', '') + `<div class="wxbig"><div>${G.cidade.mun}</div><b>${w.temp}°</b><span>${w.ico} ${w.t}</span><small>Máx ${w.temp + 3}° · Mín ${w.temp - 5}°</small></div>
      <div class="wxrow">${[1, 2, 3, 4, 5].map(i => { const x = weather(i); return `<div><small>${DIAS[(new Date().getDay() + i) % 7].slice(0, 3)}</small><span>${x.ico}</span><b>${x.temp}°</b></div>`; }).join('')}</div>
      <div class="widget" style="margin-top:12px">🌊 Mar: ${cid().mar ? 'bom para pesca e praia' : 'sem praia na tua cidade'}<br>☀️ Índice UV: alto · usa protetor!</div>`;
  },

  saude: () => {
    const passos = G.bens.includes('watch') ? 4000 + phHash(G.ano + 'p') % 9000 : null;
    const ring = (v, c, l) => `<div class="ring" style="background:conic-gradient(${c} ${v * 3.6}deg,#2a2a33 0)"><div><b>${v}</b><small>${l}</small></div></div>`;
    return apHead('Saúde', G.bens.includes('watch') ? '⌚ Sincronizado com o smartwatch' : '') + `<div class="rings">${ring(G.stats.saude, '#ff375f', 'Saúde')}${ring(G.stats.felicidade, '#ffcb00', 'Humor')}${ring(G.stats.aparencia, '#30d158', 'Forma')}</div>`
      + (G.doente ? '<div class="apwarn">🤒 Estás doente! Marca uma consulta.</div>' : '<div class="apok">✅ Sem doenças diagnosticadas.</div>')
      + `<div class="widget">👟 Passos hoje: <b>${passos ? passos.toLocaleString('pt-PT') : '— (precisas de smartwatch)'}</b><br>❤️ Ritmo cardíaco: <b>${60 + phHash(G.ano + 'c') % 25} bpm</b><br>🎂 Idade: ${G.idade} anos</div>`
      + energyBar() + `<div class="list">${btnItem('🏥', 'Marcar consulta', 'Clínica Bem-Estar', kzShort(70000), "runAtiv('medico')")}${btnItem('🧘', 'Treino em casa (app)', 'Exercício guiado', 'Grátis', "doAct(0,()=>'Fizeste um treino de 30 min com a app. '+fx({saude:R(2,4),aparencia:R(0,2)}),'train')")}</div>`;
  },

  ia: () => apHead('Kamba IA', 'O teu assistente inteligente', '<span class="aibadge">IA</span>') + `<div class="aichat"><div class="bub in">Olá ${esc(G.nome.split(' ')[0])}! 👋 Analisei a tua vida. Aqui vão os meus conselhos:</div>${aiTips().map(t => `<div class="bub in">${t}</div>`).join('')}</div><button class="pbtn" onclick="renderPhone()">✨ Gerar novos conselhos</button>`,

  vida: () => {
    const cls = CLASSES.find(c => c.id === G.classe), tal = TALENTOS.find(t => t.id === G.talento);
    return apHead('A Minha Vida') + `<div class="prof"><img src="${myShot()}" alt=""><div><div class="n">${esc(G.nome)}</div><div class="apsub">${G.idade} anos · ${G.genero === 'F' ? 'Feminino' : 'Masculino'} · 📱 ${TEL_NOME[G.tel]}</div></div></div>`
      + `<div class="widget">🏠 Vive em: <b>${G.cidade.mun}, ${G.cidade.prov}</b><br>${cls.ico} Origem: <b>${cls.t}</b><br>${tal.ico} Talento: <b>${tal.t}</b><br>🎓 ${EDU[G.edu]} · 💼 ${G.emprego ? jobTitle(G.emprego) : '—'}<br>💎 Património: <b>${kzShort(patrimonio())}</b><br>🏆 Conquistas: ${G.conq.length}/${CONQ.length}</div>`
      + Object.keys(LABEL).map(k => `<div style="margin:8px 0;font-size:13px">${SHORT[k]} ${LABEL[k]} <b style="float:right">${G.stats[k]}</b><div class="bar" style="margin-top:4px"><i style="width:${G.stats[k]}%;background:${COLOR[k]}"></i></div></div>`).join('');
  },
  diario: () => apHead('Diário') + diarioUI(),

  definicoes: () => apHead('Definições') + `<div class="widget">👤 <b>${esc(USER.nome)}</b><br>✉️ ${esc(USER.email)}<br>${Acc.online ? '🟢 Guardado no servidor' : '💾 Guardado neste navegador'}<br>📱 Modelo: <b>${TEL_NOME[G.tel]}</b><br>🔞 Conteúdo +18: <b>${plus18() ? 'Ativo' : 'Desativado'}</b></div>`
    + (G.tel >= 2 ? `<div class="apsec">Fundo de ecrã</div><div class="walls">${WALLS.map((w, i) => `<button class="${(G.wall || 0) === i ? 'on' : ''}" style="background:${w.css}" onclick="G.wall=${i};save();renderPhone(true)" title="${w.t}"></button>`).join('')}</div>` : '')
    + `<div class="list" style="margin-top:12px">${btnItem('🔞', plus18() ? 'Desativar conteúdo +18' : 'Ativar conteúdo +18', 'Confirmo que tenho 18 anos ou mais', '', 'toggle18()')}${btnItem('❓', 'Como jogar', '', '', 'closePhone();showHelp()')}${btnItem('★', 'Créditos', '', '', 'closePhone();showCredits()')}${btnItem('🚪', 'Terminar sessão', 'A vida fica guardada', '', 'closePhone();doLogout()')}</div>`,
};

/* ---------------- NOKIA (telemóvel básico) ---------------- */
function nokiaScreen() {
  const it = (t, f) => `<button class="nk" onclick="${f}">${t}</button>`;
  const hd = t => `<div class="nkh">${t}</div>`;
  if (phoneApp === 'lock') return `<div class="nkl"><div class="nkt">${nowTxt()}</div><div>DarkCell · ${G.cidade.mun}</div>${unread() ? `<div style="margin-top:14px">✉ ${unread()} mensagem(ns) nova(s)</div>` : ''}<div class="nkm">Toca em <b>Menu</b> para desbloquear</div></div>`;
  if (phoneApp === 'home') return hd('Menu') + it('📇 Contactos', "phoneApp='telefone';renderPhone()") + it(`✉ Mensagens${unread() ? ' (' + unread() + ')' : ''}`, "phoneApp='mensagens';renderPhone()") + it('💰 DarkCell Money', "phoneApp='nkmoney';renderPhone()") + it('📻 Rádio FM', 'listenMusic()') + it('🐍 Cobrinha', "playGame('cobra')") + it('📊 A minha vida', "phoneApp='nkvida';renderPhone()") + it('⚙ Definições', "phoneApp='definicoes';renderPhone()");
  if (phoneApp === 'telefone') { const jogs = smsThreads(); return hd('Contactos') + contacts().map(c => `<div class="nkr"><span>${esc(c.nome.split(' ')[0])}</span>${c.call ? `<button onclick="callPerson('${c.key}')">Ligar</button>` : ''}<button onclick="sendMsg('${c.key}')">SMS</button></div>`).join('') + (jogs.length ? hd('Jogadores (DarkCell)') : '') + jogs.map(j => `<div class="nkr"><span>${esc(j.nome.split(' ')[0])}</span><button onclick="smsNovoPara('${j.num}')">SMS</button></div>`).join('') + it('＋ SMS a número novo', 'smsNovo()'); }
  if (phoneApp === 'mensagens') { (G.inbox || []).forEach(m => m.lida = true); return hd('Mensagens') + ((G.inbox || []).slice(0, 12).map(m => `<div class="nkmsg"><b>${esc(m.de)}:</b> ${esc(m.txt)}</div>`).join('') || '<div class="nkmsg">Sem mensagens.</div>'); }
  if (phoneApp === 'nkmoney') return hd('DarkCell Money') + `<div class="nkmsg">Saldo: <b>${kz(G.dinheiro)}</b></div>` + (G.mae.vivo ? it('Enviar dinheiro à mãe', "helpParent('mae')") : '') + (G.pai.vivo ? it('Enviar dinheiro ao pai', "helpParent('pai')") : '');
  if (phoneApp === 'nkvida') return hd(esc(G.nome)) + Object.keys(LABEL).map(k => `<div class="nkr"><span>${LABEL[k]}</span><b>${G.stats[k]}</b></div>`).join('');
  if (phoneApp === 'definicoes') return hd('Definições') + it(plus18() ? '+18: Ligado' : '+18: Desligado', 'toggle18()') + it('Créditos', 'closePhone();showCredits()') + it('Terminar sessão', 'closePhone();doLogout()');
  return hd('...');
}
function nokiaKey(k) { if (k === 'menu') { phoneApp = 'home'; renderPhone(); } else if (k === 'back') { if (phoneApp === 'home' || phoneApp === 'lock') closePhone(); else { phoneApp = 'home'; renderPhone(); } } }

/* ---------------- DARKCELL: número próprio e SMS entre jogadores ---------------- */
const fmtTel = n => !n ? '' : String(n).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
function telNum() {
  if (!G.telNum) {
    const base = String((typeof USER !== 'undefined' && USER ? USER.id : 0) || Date.now()).replace(/\D/g, '') || '1';
    G.telNum = '95' + String(1000000 + (parseInt(base, 10) * 7919) % 9000000);
  }
  return G.telNum;
}
async function telReg(tent) {   // regista o número na rede (para outros jogadores te encontrarem)
  if (typeof Acc === 'undefined' || !Acc.online || !G || !G.tel || !G.telNum) return;
  try {
    const r = await fetch('/api/tel/reg', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify({ num: G.telNum }) });
    if (r.status === 409 && !tent) { G.telNum = '95' + String(1000000 + Math.floor(Math.random() * 9000000)); return telReg(1); }
  } catch (e) { }
}
function telNovo() {   // ao comprar telemóvel (ou ao entrar com um sem número)
  if (!G || !G.tel) return;
  const novo = !G.telNum;
  telNum();
  if (novo) {
    (G.inbox = G.inbox || []).unshift({ key: 'darkcell', de: 'DarkCell', txt: `📶 Bem-vindo(a) à DarkCell! O teu número é ${fmtTel(G.telNum)}. Partilha-o com os teus kambas e troquem SMS de verdade. Oferta de boas-vindas: 500 Kz de saldo.`, ano: G.ano, lida: false });
    toast(`📶 DarkCell: o teu número é ${fmtTel(G.telNum)}!`); save();
  }
  telReg();
}
function smsThreads() {   // conversas com jogadores reais (chave 'p'+número no inbox)
  const th = {};
  (G.inbox || []).forEach(m => {
    if (!m.key || m.key[0] !== 'p') return;
    const num = m.key.slice(1);
    if (!th[num]) th[num] = { num, nome: (G.telNomes || {})[num] || num, last: null, un: 0 };
    if (!m.out && m.de && m.de !== 'Eu') th[num].nome = m.de;
    if (m.out && m.pnome) th[num].nome = m.pnome;
    if (!m.lida) th[num].un++;
    if (!th[num].last) th[num].last = m;
  });
  return Object.values(th).sort((a, b) => (b.un - a.un) || ((b.last ? 1 : 0) - (a.last ? 1 : 0)));
}
async function smsNovo() {
  if (G.tel < 1) return toast('📵 Não tens telemóvel.');
  if (typeof Acc === 'undefined' || !Acc.online) return toast('📶 SMS entre jogadores precisa de internet (modo online).');
  const num = (prompt(`📶 DarkCell — número do jogador (o teu é ${fmtTel(telNum())}):`) || '').replace(/\D/g, '');
  if (!num) return;
  try {
    const r = await fetch('/api/tel/quem', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify({ num }) });
    const d = await r.json();
    if (!r.ok) return toast('📵 ' + (d.erro || 'Número não encontrado.'));
    if (d.eu) return toast('😄 Esse é o teu próprio número!');
    G.telNomes = G.telNomes || {}; G.telNomes[num] = d.nome; save();
    chatKey = 'p' + num; renderPhone();
  } catch (e) { toast('📶 Sem rede DarkCell. Tenta outra vez.'); }
}
function smsNovoPara(num) {   // fluxo simples (tijolinho)
  const nome = (G.telNomes || {})[num] || num;
  const txt = (prompt(`💬 SMS para ${nome} (${fmtTel(num)}):`) || '').trim();
  if (txt) smsSendTxt(num, txt).then(ok => { if (ok) toast(`💬 SMS enviado a ${nome}.`); });
}
async function smsSendTxt(num, txt) {
  if (G.tel < 1) { toast('📵 Não tens telemóvel.'); return false; }
  if (typeof Acc === 'undefined' || !Acc.online) { toast('📶 SMS entre jogadores precisa de internet.'); return false; }
  txt = (txt || '').trim().slice(0, 140); if (!txt) return false;
  try {
    const r = await fetch('/api/tel/msg', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify({ para: num, txt, meu: telNum() }) });
    let d = {}; try { d = await r.json(); } catch (e) { }
    if (!r.ok) { toast('📵 ' + (d.erro || 'Falha ao enviar.')); return false; }
    (G.inbox = G.inbox || []).unshift({ key: 'p' + num, de: 'Eu', pnome: (G.telNomes || {})[num] || num, txt, ano: G.ano, lida: true, out: true });
    G.inbox = G.inbox.slice(0, 80);
    save(); updateBadge();
    return true;
  } catch (e) { toast('📶 Sem rede DarkCell. Tenta outra vez.'); return false; }
}
async function smsSend(num) {
  const inp = document.getElementById('smsIn');
  const txt = (inp && inp.value || '').trim(); if (!txt) return;
  if (await smsSendTxt(num, txt)) { renderPhone(true); setTimeout(() => { const i = document.getElementById('smsIn'); if (i) i.focus(); }, 60); }
}
function smsThread(num) {
  G.telNomes = G.telNomes || {};
  const ms = (G.inbox || []).filter(m => m.key === 'p' + num).slice().reverse();
  ms.forEach(m => { m.lida = true; if (!m.out && m.de && m.de !== 'Eu') G.telNomes[num] = m.de; if (m.out && m.pnome) G.telNomes[num] = m.pnome; });
  setTimeout(updateBadge, 0); save();
  const nome = G.telNomes[num] || fmtTel(num);
  return `<div class="aphead chat"><button onclick="phoneBack()">‹</button><div class="cav sm">📶</div><div style="flex:1;min-width:0"><h3>${esc(nome)}</h3><div class="apsub">DarkCell ${fmtTel(num)}</div></div></div>
    <div class="chatbg">${ms.map(m => m.out ? `<div class="bub out">${esc(m.txt)}<small>✓✓</small></div>` : `<div class="bub in">${esc(m.txt)}<small>${m.ano}</small></div>`).join('') || '<div class="apnote" style="text-align:center">Ainda não há mensagens.<br>Diz mbote! 👋</div>'}</div>
    <div style="display:flex;gap:6px;padding:8px;background:#101018"><input id="smsIn" maxlength="140" placeholder="Escreve um SMS…" style="flex:1;padding:10px 12px;border-radius:20px;border:1px solid #333;background:#1a1a24;color:#fff" onkeydown="if(event.key==='Enter')smsSend('${num}')"><button class="pbtn" style="width:auto;padding:0 16px;margin:0" onclick="smsSend('${num}')">➤</button></div>`;
}

/* ---------------- CONTACTOS / CHAT ---------------- */
function contacts() {
  const c = [];
  ['mae', 'pai'].forEach(k => { const p = G[k]; if (p.vivo) c.push({ key: k, ico: k === 'mae' ? '👩🏿' : '👨🏿', nome: p.nome, label: k === 'mae' ? 'Mãe' : 'Pai', rel: p.rel, call: true }); });
  if (G.parceiro) c.push({ key: 'par', ico: '💕', nome: G.parceiro.nome, label: G.parceiro.casado ? 'Cônjuge' : 'Namoro', rel: G.parceiro.rel, call: true });
  G.irmaos.forEach((s, i) => c.push({ key: 'i' + i, ico: s.g === 'M' ? '👦🏿' : '👧🏿', nome: s.nome, label: s.g === 'M' ? 'Irmão' : 'Irmã', rel: s.rel, call: true }));
  G.amigos.forEach((f, i) => c.push({ key: 'a' + i, ico: f.g === 'F' ? '👩🏿' : '🧑🏿', nome: f.nome, label: 'Amigo(a)', rel: f.rel, call: true }));
  return c;
}
function personByKey(k) { return k === 'pai' || k === 'mae' ? G[k] : k === 'par' ? G.parceiro : k[0] === 'a' ? G.amigos[+k.slice(1)] : k[0] === 'i' ? G.irmaos[+k.slice(1)] : null; }
function callPerson(k) {
  const p = personByKey(k); if (!p) return;
  if (k === 'pai' || k === 'mae') {   // 1 chamada por dia a cada um — com recompensa
    const hoje = new Date().toDateString();
    G.telDia = G.telDia && G.telDia.d === hoje ? G.telDia : { d: hoje };
    if (G.telDia[k]) return toast(`📞 Já ligaste ${k === 'mae' ? 'à tua mãe' : 'ao teu pai'} hoje. Volta a ligar amanhã!`);
    G.telDia[k] = 1;
    doAct(0, () => {
      p.rel = clamp(p.rel + R(8, 14));
      let extra = '';
      if (chance(.4)) { const v = R(2000, 12000) * (['rica', 'elite'].includes(G.classe) ? 8 : G.classe === 'media' ? 3 : 1); G.dinheiro += v; extra = ` E mandou-te <b>${kz(v)}</b> pelo DarkCell Money! 💸`; }
      return `📞 Ligaste ${k === 'mae' ? 'à tua mãe' : 'ao teu pai'}. ${pick(['Falaram mais de uma hora!', 'Contou-te as novidades do bairro todas.', 'Disse que tens de comer bem e aparecer para almoçar.', 'Perguntou se já tens casa — mentiste um bocadinho.', 'Riram-se bwé ao telefone.'])}${extra} ` + fx({ felicidade: R(3, 6), karma: 1 });
    }, 'think');
    return;
  }
  doAct(0, () => { p.rel = clamp(p.rel + R(6, 12)); return `📞 Ligaste a ${p.nome.split(' ')[0]}. ${pick(['Falaram mais de uma hora!', 'Riram-se bwé ao telefone.', 'Contaram as novidades todas.', 'A chamada caiu duas vezes, mas valeu a pena.'])} ` + fx({ felicidade: R(2, 5), karma: 1 }); }, 'think');
}
function chatView(k) {
  if (k && k[0] === 'p') return smsThread(k.slice(1));
  const p = personByKey(k);
  const nome = p ? p.nome : { chefe: 'Chefe', unitel: 'DarkCell', darkcell: 'DarkCell', marca: 'Marca parceira' }[k] || k;
  const ms = (G.inbox || []).filter(m => m.key === k).slice().reverse();
  ms.forEach(m => m.lida = true); setTimeout(updateBadge, 0);
  G.msgAno = G.msgAno || {};
  let quick = '';
  if (p) quick = G.msgAno[k] ? '<div class="apnote">Já falaste este ano. Liga para fortalecer mais a relação.</div>' : `<button class="pbtn" onclick="sendMsg('${k}');renderPhone(true)">${pick(['❤️ Responder com carinho', '😂 Mandar um meme', '👋 Perguntar como está'])}</button>`;
  else if (k === 'marca') quick = G.seg > 5000 && !G.msgAno.marca ? `<button class="pbtn" onclick="acceptBrand()">🤝 Aceitar parceria (+${kzShort(Math.round(G.seg * 6))})</button>` : '';
  else if (k === 'chefe' && G.emprego && !G.msgAno.chefe) quick = `<button class="pbtn" onclick="G.msgAno.chefe=1;G.emprego.desemp=clamp(G.emprego.desemp+3);toast('👍 O chefe gostou da tua prontidão.');save();renderPhone(true)">👍 Ok chefe, conte comigo!</button>`;
  else if ((k === 'darkcell' || k === 'unitel') && !G.msgAno.darkcell) quick = `<button class="pbtn" onclick="if(pay(9900)){G.msgAno.darkcell=1;fx({felicidade:1});toast('📶 DarkCell: Semana Bwé ativada — chamadas e SMS à vontade!');save();refresh();}">📶 Ativar Semana Bwé (9.900 Kz)</button>`;
  return `<div class="aphead chat"><button onclick="phoneBack()">‹</button><div class="cav sm">${p ? (k === 'par' ? '💕' : '🧑🏿') : '🏢'}</div><div style="flex:1;min-width:0"><h3>${esc(nome)}</h3><div class="apsub">${p ? 'online' : 'conta verificada'}</div></div><span>📞</span></div>
    <div class="chatbg">${ms.map(m => `<div class="bub in">${esc(m.txt)}<small>${m.ano}</small></div>`).join('') || '<div class="apnote" style="text-align:center">Ainda não há mensagens.</div>'}${p && G.msgAno[k] ? '<div class="bub out">Também te adoro ❤️ Falamos em breve!<small>✓✓</small></div>' : ''}</div>${quick}`;
}
function acceptBrand() { G.msgAno.marca = 1; const v = Math.round(G.seg * 6); const t = `🤝 Fechaste uma parceria paga nas redes! ` + fx({ dinheiro: v, fama: 1 }); addLog(t, 'good'); toast(strip(t)); save(); refresh(); }

/* ---------------- KAMBA / YANGO / IA ---------------- */
function newKambaProf() {
  const g = G.genero === 'M' ? 'F' : 'M';
  const idade = Math.max(18, G.idade + R(-5, 6));
  const av = Object.assign({ genero: g, pele: pick(SKINS), roupa: pick(CLOTH), calcas: pick(PANTS), sapatos: pick(SHOES) }, crDefaults(g));
  av.cabelo = pick(GEN[g].hairs.filter(h => h !== 'bald' || chance(.3))); av.cima = pick(GEN[g].cima)[0]; av.baixo = pick(GEN[g].baixo)[0];
  av.corCabelo = chance(.8) ? HAIR_COLORS[R(0, 2)][0] : pick(HAIR_COLORS)[0];
  av.rosto = g === 'F' ? ['earrings'].concat(chance(.4) ? ['lipstick'] : [], chance(.2) ? ['glasses'] : []) : [chance(.4) ? 'beard' : chance(.3) ? 'goatee' : null, chance(.15) ? 'glasses' : null].filter(Boolean);
  return {
    cfg: avatarCfg(av, 'casual', idade),
    nome: pick(g === 'M' ? NOMES_M : NOMES_F), idade, ico: g === 'M' ? pick(['🧑🏿', '👨🏿', '🧔🏿']) : pick(['👩🏿', '👩🏿‍🦱', '👸🏿']),
    local: pick(cid().m), prof: pick(['Estudante', 'Enfermeira(o)', 'Empresária(o)', 'Professora(or)', 'Engenheira(o)', 'Modelo', 'Bancária(o)', 'DJ']),
    bio: pick(['Amo kizomba e praia 🏖️', 'Procuro alguém sério 💍', 'Fã do Petro ⚽ e de muamba', 'Viajar, ler e rir muito 😂', 'Se não dançares semba, nem tentes 💃', 'Deus, família e trabalho 🙏']),
    bg: pick(['linear-gradient(160deg,#ff9a8b,#ff6a88 50%,#ff99ac)', 'linear-gradient(160deg,#8ec5fc,#e0c3fc)', 'linear-gradient(160deg,#f6d365,#fda085)', 'linear-gradient(160deg,#84fab0,#8fd3f4)']),
  };
}
const rideCost = d => Math.round((1200 + d * 45) / 100) * 100;
function rideTo(id) {
  const L = LOC_POS[id], d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z);
  if (d < 6) return toast('Já estás aí! 😄');
  if (!pay(rideCost(d))) return;
  closePhone(); const f = $('#fade'); f.innerHTML = `<div><small>🚕 Kandonga a caminho…</small><b style="font-size:40px">${L.n}</b></div>`; f.classList.add('on');
  setTimeout(() => { const y = playerYaw; spawnPlayer(id); playerYaw = y; f.classList.remove('on'); toast(`🚕 Chegaste a ${L.n}. Avalia o motorista: ⭐⭐⭐⭐⭐`); save(); refresh(); }, 900);
}
function aiTips() {
  const t = [], S = G.stats;
  if (G.doente) t.push('🤒 Estás doente. A tua prioridade é ir à <b>Clínica</b> — doenças por tratar tiram saúde todos os anos.');
  if (S.saude < 40) t.push('❤️ A tua saúde está baixa. Treina no ginásio, faz check-ups e evita a farra.');
  if (G.precisaArea) t.push('📘 Tens de escolher a área do II Ciclo na <b>Escola</b>. Medicina e engenharias pedem Ciências Físicas e Biológicas.');
  if (G.estudo && G.estudo.tipo !== 'univ' && G.notaMedia && G.notaMedia < 12) t.push(`📉 A tua média é ${G.notaMedia}. Estuda mais ou faz explicações — notas baixas fecham a universidade pública.`);
  if (G.idade >= 14 && G.edu < 3 && !G.estudo && !G.precisaArea) t.push('🎒 Não tens o Ensino Médio. Sem ele, a maioria dos empregos formais está fechada. ' + (G.idade >= 18 ? 'Experimenta o <b>ensino noturno</b>.' : 'Volta à escola!'));
  if (G.edu === 3 && !G.estudo && G.idade < 35) { const best = CURSOS.map(c => [c, uniChance(c, true)]).sort((a, b) => b[1] - a[1])[0]; t.push(`🏛️ Já podes ir para a universidade. A tua melhor hipótese na pública é <b>${best[0].t}</b> (${Math.round(best[1] * 100)}%).`); }
  if (G.idade >= 18 && !G.carta) t.push('🪪 Tira a <b>carta de condução</b> — abre empregos como motorista Kandonga, taxista e kupapata.');
  if (G.idade >= 16 && G.preso === 0) {
    const ok = JOBS.filter(j => !reqOk(j.req).length && !(G.emprego && G.emprego.id === j.id) && !j.varFama && !j.varSeg).sort((a, b) => salario({ id: b.id, nivel: 0 }) - salario({ id: a.id, nivel: 0 }))[0];
    if (ok && (!G.emprego || salario({ id: ok.id, nivel: 0 }) > salario(G.emprego) * 1.2)) t.push(`💼 Podes candidatar-te a <b>${ok.t}</b> (${kzShort(salario({ id: ok.id, nivel: 0 }))}/ano)${G.emprego ? ', que paga mais do que o teu emprego atual' : ''}.`);
    const near = JOBS.map(j => [j, reqOk(j.req)]).filter(([j, f]) => f.length === 1 && j.sal > (G.emprego ? job(G.emprego.id).sal : 0)).sort((a, b) => b[0].sal - a[0].sal)[0];
    if (near) t.push(`🎯 Falta-te só <b>${near[1][0]}</b> para seres <b>${near[0].t}</b>.`);
  }
  if (G.emprego && job(G.emprego.id).niv && G.emprego.anosNivel >= 2 && G.emprego.desemp >= 60) t.push('🚀 Tens tempo de casa e bom desempenho: é boa altura para <b>pedir promoção</b>.');
  if (G.dinheiro > 5000000 && !G.poupanca && !(G.inv && G.inv.bodiva + G.inv.dolar + G.inv.cripto)) t.push('💰 Tens dinheiro parado. Põe parte na <b>poupança (7%)</b> ou investe na <b>Invest AO</b>.');
  if (G.emprestimo) t.push(`🏦 Tens um empréstimo de ${kzShort(G.emprestimo.divida)}. Liquida-o assim que puderes.`);
  if (G.dinheiro < 0) t.push('⚠️ Estás endividado(a)! Corta gastos, vende bens ou arranja um emprego melhor.');
  if (G.casa.tipo === 'rua') t.push('🏚️ Estás a viver na rua. Faz biscates, arranja um emprego e aluga um <b>quarto no musseque</b> na app <b>Casa Já</b>.');
  if (!G.amigos.length && G.idade >= 14) t.push('👥 Ainda não tens kambas. Toca noutro jogador no mapa ou abre <b>Cidade › Online</b> para fazer amizades.');
  if (G.casa.tipo === 'pais' && G.idade >= 25 && G.dinheiro > 1000000) t.push('🏠 Já tens idade e dinheiro para sair de casa dos pais. Vê a app <b>Casa Já</b>.');
  if (G.tel >= 2 && !G.posts && G.idade >= 13) t.push('📸 Ainda não publicaste este ano no Bwé Social. Sem publicações, perdes seguidores.');
  if (S.karma < 35) t.push('☯️ O teu karma está baixo. Voluntariado e ajudar a família melhoram a próxima encarnação.');
  if (G.idade >= 18 && !G.parceiro && S.felicidade < 60) t.push('💘 Andas em baixo… que tal conhecer alguém? Experimenta a discoteca ou a app Kamba.');
  if (!t.length) t.push('🌟 Estás a ir muito bem! Continua a equilibrar estudos, trabalho, família e saúde.');
  return t.slice(0, 6);
}
async function toggle18() {
  const v = !plus18();
  if (v && !confirm('Confirmas que tens 18 anos ou mais?')) return;
  try { const u = await Acc.updateProfile({ adulto: v }); if (u) USER = u; else USER.adulto = v; } catch (e) { USER.adulto = v; }
  toast(v ? '🔞 Conteúdo +18 ativado.' : 'Conteúdo +18 desativado.'); renderPhone(true);
}
