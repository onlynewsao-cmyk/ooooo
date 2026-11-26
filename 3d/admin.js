/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Painel de Administração (dono do jogo)
   Ativar: Menu → 🛡️ Administração → chave de administrador
   (ou a conta com e-mail listado em ADMIN_EMAILS no servidor).
   ========================================================= */
async function admApi(path, body) {
  const r = await fetch('/api/' + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erro || 'Erro de ligação.');
  return d;
}
async function admAbrir() {
  if (typeof Acc === 'undefined' || !Acc.token) return toast('Entra com a tua conta online primeiro.');
  if (!(USER && USER.adm)) {
    const ch = prompt('🔐 Chave de administrador:');
    if (!ch) return;
    try {
      await admApi('admin/entrar', { chave: ch });
      if (USER) USER.adm = true;
      toast('🛡️ Modo administrador ativo!');
    } catch (e) { return toast('❌ ' + esc(e.message)); }
  }
  if (typeof G === 'undefined' || !G) return toast('🛡️ Admin ativo! Entra no jogo e abre Menu → Administração.');
  openPanel('admin');
}
async function admAcao(op, uid, nome) {
  const msgs = { banir: `Banir ${nome}? A conta fica suspensa e é desligada já.`, zerar: `Apagar a vida de ${nome}? A conta recomeça do zero.`, perdoar: `Retirar a suspeita de ${nome}?`, desbanir: `Readmitir ${nome}? O banimento é retirado.` };
  if (!confirm(msgs[op] || op)) return;
  try { await admApi('admin/acao', { op, uid }); toast('✅ Feito.'); renderPanel(true); }
  catch (e) { toast('❌ ' + esc(e.message)); }
}

/* ---------------- separador: visão geral ---------------- */
function admTabVis() { setTimeout(admLoadVis, 30); return '<div id="admB"><p class="center" style="padding:30px">⏳ A carregar…</p></div>'; }
const _admCard = (ico, v, l) => `<div style="flex:1;min-width:72px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 4px;text-align:center"><div style="font-size:19px">${ico}</div><div style="font-size:19px;font-weight:800;color:#ffcb00">${v}</div><div style="font-size:11px;opacity:.75">${l}</div></div>`;
const _admRow = (ico, t, d, extra) => `<div class="item"><div class="ico">${ico}</div><div class="tx"><div class="t1">${t}</div><div class="t2">${d || ''}</div></div>${extra || ''}</div>`;
const _admDt = ts => { try { return new Date(ts * 1000).toLocaleString('pt', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
async function admLoadVis() {
  const el = document.getElementById('admB'); if (!el) return;
  try {
    const d = await admApi('admin/painel');
    el.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 12px">${_admCard('👥', d.contas, 'contas')}${_admCard('🟢', d.online.length, 'online neste nó')}${_admCard('⚠️', d.sus.length, 'suspeitos')}${_admCard('🚫', d.banidos.length, 'banidos')}</div>`
      + (d.sus.length ? '<h4 style="margin:8px 0 4px">⚠️ Contas suspeitas</h4><div class="list">' + d.sus.map(s => _admRow('⚠️', esc(s.nome) + ' <small>#' + s.id + '</small>', esc(s.motivo), `<button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="admAcao('perdoar',${s.id},'${esc(s.nome).replace(/'/g, '')}')">Perdoar</button>`)).join('') + '</div>' : '')
      + '<h4 style="margin:12px 0 4px">🆕 Últimas contas criadas</h4><div class="list">'
      + d.ultimos.map(u => _admRow('👤', esc(u.nome) + ' <small>#' + u.id + '</small>', esc(u.email) + ' · ' + _admDt(u.criado))).join('')
      + '</div>';
  } catch (e) { el.innerHTML = `<p class="center" style="padding:30px">❌ ${esc(e.message)}</p>`; }
}

/* ---------------- separador: multicontas ---------------- */
function admTabMulti() { setTimeout(admLoadMulti, 30); return '<div id="admB"><p class="center" style="padding:30px">⏳ A carregar…</p></div>'; }
async function admLoadMulti() {
  const el = document.getElementById('admB'); if (!el) return;
  try {
    const d = await admApi('admin/contas');
    const grupos = d.grupos || [];
    el.innerHTML = '<p class="fxs" style="opacity:.8;margin:4px 0 10px">Contas que partilham o mesmo aparelho ou o mesmo IP. Vários jogadores da mesma família/cybercafé são normais — suspeita é quando também há funil de dinheiro.</p>'
      + (grupos.length ? grupos.map(g => `<div class="apsec" style="margin-bottom:10px"><b>${g.tipo === 'dev' ? '📱 Mesmo aparelho' : '🌐 Mesmo IP'} · ${g.contas.length} contas</b></div><div class="list">`
        + g.contas.map(u => _admRow(u.suspeita ? '⚠️' : '👤', esc(u.nome) + ' <small>#' + u.id + '</small>', u.suspeita ? 'SUSPEITA de funil/batota' : 'sem suspeita', `<button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="admAcao('banir',${u.id},'${esc(u.nome).replace(/'/g, '')}')">Banir</button>`)).join('') + '</div>').join('')
        : '<p class="center" style="padding:20px">✅ Nenhuma partilha de aparelho/IP entre contas.</p>');
  } catch (e) { el.innerHTML = `<p class="center" style="padding:30px">❌ ${esc(e.message)}</p>`; }
}

/* ---------------- separador: denúncias de membros ---------------- */
function admTabDen() { setTimeout(admLoadDen, 30); return '<div id="admB"><p class="center" style="padding:30px">⏳ A carregar…</p></div>'; }
async function admLoadDen() {
  const el = document.getElementById('admB'); if (!el) return;
  try {
    const d = await admApi('admin/denuncias');
    const itens = d.denuncias || [];
    el.innerHTML = '<p class="fxs" style="opacity:.8;margin:4px 0 10px">Denúncias feitas pelos jogadores (últimos 10 min). 3 denúncias à mesma pessoa bloqueiam-na automaticamente por 5 min.</p>'
      + (itens.length ? itens.map(x => `<div class="apsec" style="margin-bottom:8px"><b>🚨 ${esc(x.nome)} <small>#${x.id}</small> · ${x.n} denúncia${x.n > 1 ? 's' : ''}</b></div><div class="list">`
        + x.den.map(r => _admRow('🗣️', esc(r.nome) + ' <small>#' + r.id + '</small>', _admDt(r.t))).join('') + '</div>'
        + `<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="admAcao('banir',${x.id},'${esc(x.nome).replace(/'/g, '')}')">🚫 Banir</button></div>`).join('')
        : '<p class="center" style="padding:20px">✅ Nenhuma denúncia ativa agora.</p>')
      + (d.log && d.log.length ? '<h4 style="margin:12px 0 4px">📜 Últimas denúncias registadas</h4><div class="list">' + d.log.map(l => { const p = l.split('\t'); return _admRow('📝', esc(p[3] || '?') + ' → ' + esc(p[4] || '?'), esc(p[0] || '') + (p[5] ? ' · ' + esc(p[5]) : '')); }).join('') + '</div>' : '');
  } catch (e) { el.innerHTML = `<p class="center" style="padding:30px">❌ ${esc(e.message)}</p>`; }
}

/* ---------------- separador: superpoderes do Criador ---------------- */
function admTabPoderes() {
  const criador = typeof G !== 'undefined' && G && G.criador;
  return `<div id="admB">
    <div class="apsec"><b>👑 Superpoderes do Criador</b></div>
    <p class="fxs" style="opacity:.8;margin:2px 0 10px">Estes poderes afetam o jogo inteiro e ficam registados no diário de auditoria.</p>
    <div class="apsec" style="margin-bottom:6px"><b>📢 Anúncio global</b></div>
    <div style="display:flex;gap:6px;margin-bottom:12px"><input id="admAnuncio" maxlength="140" placeholder="Mensagem para todos os jogadores…" style="flex:1;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:inherit;font-size:13px"><button class="btn" style="padding:10px 14px;font-size:13px" onclick="admAnuncio()">Enviar</button></div>
    <div class="apsec" style="margin-bottom:6px"><b>🌧️💸 Chuva de kumbu (para todos os online)</b></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${[10000, 100000, 1000000, 10000000].map(v => `<button class="btn btn-ghost" style="padding:8px 10px;font-size:12px" onclick="admChuva(${v})">${kzShort(v)}</button>`).join('')}</div>
    <div class="apsec" style="margin-bottom:6px"><b>🌦️ Controlar o tempo (10 min)</b></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${[['auto', '🌦️ Normal'], ['sol', '☀️ Sol'], ['chuva', '🌧️ Chuva'], ['noite', '🌙 Noite'], ['dia', '🌅 Dia']].map(x => `<button class="btn btn-ghost" style="padding:8px 10px;font-size:12px" onclick="admTempo('${x[0]}')">${x[1]}</button>`).join('')}</div>
    <div class="apsec" style="margin-bottom:6px"><b>🔇 Invisibilidade & limpeza</b></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <button class="btn btn-ghost" style="padding:8px 10px;font-size:12px" onclick="admInvisivel()">${typeof MP !== 'undefined' && MP.inv ? '👁️ Voltar a ser visível' : '🔇 Ficar invisível na cidade'}</button>
      <button class="btn btn-ghost" style="padding:8px 10px;font-size:12px" onclick="admPoder('limpar_chat')">🧹 Limpar o chat</button>
    </div>
    <div class="apsec" style="margin-bottom:6px"><b>📍 Teleporte para junto de um jogador</b></div>
    <div style="margin-bottom:12px"><button class="btn btn-ghost" style="padding:8px 10px;font-size:12px" onclick="admTeleportes()">Carregar jogadores online</button><div id="admTp"></div></div>
    <div class="apsec" style="margin-bottom:6px"><b>📊 Economia do jogo</b></div>
    <div style="margin-bottom:12px"><button class="btn btn-ghost" style="padding:8px 10px;font-size:12px" onclick="admEco()">Ver estatísticas</button><div id="admEcoB"></div></div>
    ${criador ? `<div class="apsec" style="margin-bottom:6px"><b>🎛️ Editor de vida (a tua personagem)</b></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <label class="fxs">Idade<input id="edIdade" type="number" min="0" max="120" value="${G.idade}" style="width:100%;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:inherit"></label>
      <label class="fxs">Dinheiro (Kz)<input id="edKz" type="number" min="0" value="${G.dinheiro}" style="width:100%;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:inherit"></label>
      ${['saude', 'felicidade', 'inteligencia', 'aparencia', 'fama', 'karma'].map(s => `<label class="fxs">${s[0].toUpperCase() + s.slice(1)}<input id="ed_${s}" type="number" min="0" max="100" value="${Math.round(G.stats[s] || 0)}" style="width:100%;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:inherit"></label>`).join('')}
    </div>
    <button class="btn" style="width:100%;padding:10px;font-size:13px;margin-bottom:6px" onclick="admAplicarVida()">✨ Aplicar à minha vida</button>` : ''}
  </div>`;
}
async function admPoder(op, extra) {
  try { const d = await admApi('admin/poderes', Object.assign({ op }, extra || {})); toast('✅ Feito.' + (d.n !== undefined ? ` (${d.n} jogadores)` : '')); return d; }
  catch (e) { toast('❌ ' + esc(e.message)); return null; }
}
function admAnuncio() { const el = document.getElementById('admAnuncio'); const txt = (el && el.value || '').trim(); if (!txt) return toast('Escreve o anúncio.'); admPoder('anuncio', { txt }).then(d => { if (d && d.ok && el) el.value = ''; }); }
function admChuva(v) { if (!confirm(`Fazer chover ${kzShort(v)} para TODOS os jogadores online?`)) return; admPoder('chuva', { v }); }
function admTempo(modo) { admPoder('tempo', { modo }); }
function admInvisivel() { if (typeof MP === 'undefined') return; MP.inv = !MP.inv; toast(MP.inv ? '🔇 Estás invisível: ninguém te vê na cidade (só outros admins).' : '👁️ Voltaste a ser visível.'); renderPanel(true); }
async function admTeleportes() {
  const el = document.getElementById('admTp'); if (!el) return;
  el.innerHTML = '<p class="center" style="padding:10px">⏳…</p>';
  try {
    const d = await admApi('admin/painel');
    el.innerHTML = d.online.length ? '<div class="list" style="margin-top:8px">' + d.online.filter(o => o.sala.split('@')[0] === 'rua' || o.sala.split('@')[0].startsWith('iv:')).map(o => _admRow('📍', esc(o.nome) + ' <small>#' + o.id + '</small>', mpRoomName ? mpRoomName(o.sala) : o.sala, `<button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="admIrPara(${o.id})">Ir</button>`)).join('') + '</div>' : '<p class="fxs" style="padding:8px">Ninguém online.</p>';
  } catch (e) { el.innerHTML = `<p class="fxs">❌ ${esc(e.message)}</p>`; }
}
async function admIrPara(uid) {
  try {
    const d = await admApi('admin/painel');
    const o = (d.online || []).find(x => x.id === uid);
    if (!o) return toast('Essa pessoa já saiu.');
    const sala = o.sala.split('@')[0], pv = o.sala.split('@')[1] || 'Luanda';
    if (typeof G === 'undefined' || !G) return toast('Entra no jogo primeiro.');
    if (pv !== G.cidade.prov) return toast(`🌍 ${o.nome} está em ${pv} — viaja primeiro para essa província (instantâneo para ti).`);
    closePanel();
    if (sala === 'rua') {
      playerPos.set(o.x + 1.4, 0, o.z + 1.4);
      toast(`📍 Apareceste ao lado de ${o.nome}!`);
    } else if (sala.startsWith('iv:')) {
      const loc = sala.slice(3);
      if (typeof LOC_POS !== 'undefined' && LOC_POS[loc]) { playerPos.set(LOC_POS[loc].x, 0, LOC_POS[loc].z); tapEnter(loc); toast(`📍 Apareceste à porta de ${o.nome} em ${mpRoomName(o.sala)}.`); }
      else toast('Não consegui encontrar esse sítio.');
    }
  } catch (e) { toast('❌ ' + esc(e.message)); }
}
async function admEco() {
  const el = document.getElementById('admEcoB'); if (!el) return;
  el.innerHTML = '<p class="center" style="padding:10px">⏳…</p>';
  try {
    const d = await admApi('admin/poderes', { op: 'economia' });
    el.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0">${_admCard('👥', d.contas, 'contas')}${_admCard('❤️', d.vidas, 'vidas')}${_admCard('🟢', d.online, 'online')}${_admCard('💰', kzShort(d.total), 'em circulação')}${_admCard('🌆', kzShort(d.online_kz), 'bolsos online')}</div>`
      + (d.top.length ? '<h4 style="margin:6px 0 4px">🏆 Os mais ricos (sem o Criador)</h4><div class="list">' + d.top.map((x, i) => _admRow(['🥇', '🥈', '🥉'][i] || '🏅', esc(x.n), kzShort(x.kz))).join('') + '</div>' : '');
  } catch (e) { el.innerHTML = `<p class="fxs">❌ ${esc(e.message)}</p>`; }
}
function admAplicarVida() {
  if (typeof G === 'undefined' || !G || !G.criador) return;
  const num = id => { const el = document.getElementById(id); return el ? +el.value || 0 : 0; };
  G.idade = Math.max(0, Math.min(120, Math.round(num('edIdade'))));
  G.dinheiro = Math.max(0, num('edKz'));
  for (const s of ['saude', 'felicidade', 'inteligencia', 'aparencia', 'fama', 'karma']) G.stats[s] = Math.max(0, Math.min(100, Math.round(num('ed_' + s))));
  addLog('👑 <b>Poder do Criador:</b> reescreveste a tua própria vida.', 'gold');
  save(); refresh(); toast('✨ Vida atualizada!');
}
async function admVerVida(uid) {
  try {
    const d = await admApi('admin/poderes', { op: 'ver', uid });
    const v = d.vida;
    const h = `<h3 style="margin:0 0 6px">👁️ ${esc(d.nome)}</h3><p class="fxs" style="opacity:.75">${esc(d.email)} · ${d.on ? '🟢 online agora' : '⚫ offline'} · conta de ${_admDt(d.criado)}</p>`
      + (v ? `<div class="list" style="margin-top:8px">`
        + _admRow('🎂', v.idade + ' anos', 'ano ' + v.ano)
        + _admRow('📍', esc(v.mun || '?') + ', ' + esc(v.prov || '?'), v.casa === 'propria' ? '🏠 casa própria' : v.casa === 'arrendada' ? '🏠 arrendada' : '🏠 ' + (v.casa || '?'))
        + _admRow('💰', kzShort(v.dinheiro), 'poupança: ' + kzShort(v.poupanca))
        + _admRow('💼', esc(v.emprego || 'desempregado(a)'), v.bens + ' bens')
        + _admRow('📊', '❤️' + Math.round(v.stats.saude || 0) + ' 😊' + Math.round(v.stats.felicidade || 0) + ' 🧠' + Math.round(v.stats.inteligencia || 0), '✨' + Math.round(v.stats.aparencia || 0) + ' 🌟' + Math.round(v.stats.fama || 0) + ' ☯️' + Math.round(v.stats.karma || 0))
        + '</div>' : '<p style="padding:10px">Ainda não criou a vida desta encarnação.</p>');
    if (typeof openModal === 'function') openModal(h); else toast('👁️ ' + d.nome + (v ? `: ${v.idade} anos, ${kzShort(v.dinheiro)}` : ' sem vida'));
  } catch (e) { toast('❌ ' + esc(e.message)); }
}
function admDarKz(uid, nome) {
  const v = +prompt(`💸 Quanto kumbu dar a ${nome}? (negativo para tirar)`, '1000000');
  if (!v) return;
  admPoder(v > 0 ? 'dar' : 'tirar', { uid, v: Math.abs(v) });
}
function admSoltar(uid, nome) { if (confirm(`🔓 Soltar ${nome} e limpar a ficha criminal?`)) admPoder('soltar', { uid }); }
function admKick(uid, nome) { if (confirm(`🥾 Expulsar ${nome} da cidade por 60 segundos?`)) admPoder('kick', { uid }); }
function admMute(uid, nome) { if (confirm(`🔇 Silenciar ${nome} no chat por 10 minutos?`)) admPoder('mute', { uid }); }

/* ---------------- separador: jogadores online ---------------- */
function admTabOn() { setTimeout(admLoadOn, 30); return '<div id="admB"><p class="center" style="padding:30px">⏳ A carregar…</p></div>'; }
async function admLoadOn() {
  const el = document.getElementById('admB'); if (!el) return;
  try {
    const d = await admApi('admin/painel');
    const sala = s => s.split('@')[0] === 'rua' ? 'na rua' : s.split('@')[0].startsWith('iv:') ? '🚪 ' + s.split('@')[0].slice(3) : '🏠 casa';
    el.innerHTML = '<h4 style="margin:6px 0 4px">🟢 Online agora neste nó</h4>'
      + (d.online.length ? '<div class="list">' + d.online.map(o => _admRow(o.sus ? '⚠️' : o.inv ? '🔇' : '🟢', esc(o.nome) + ' <small>#' + o.id + '</small>', kzShort(o.kz) + ' · ' + sala(o.sala) + (o.cad ? ` · 🔒 preso ${o.cad}s` : ''),
        `<span style="display:flex;gap:4px;flex-wrap:wrap"><button class="btn btn-ghost" style="padding:6px 8px;font-size:12px" title="Ver a vida" onclick="admVerVida(${o.id})">👁️</button><button class="btn btn-ghost" style="padding:6px 8px;font-size:12px" title="Dar/tirar Kz" onclick="admDarKz(${o.id},'${esc(o.nome).replace(/'/g, '')}')">💸</button>${o.cad ? `<button class="btn btn-ghost" style="padding:6px 8px;font-size:12px" title="Soltar" onclick="admSoltar(${o.id},'${esc(o.nome).replace(/'/g, '')}')">🔓</button>` : ''}<button class="btn btn-ghost" style="padding:6px 8px;font-size:12px" title="Silenciar 10 min" onclick="admMute(${o.id},'${esc(o.nome).replace(/'/g, '')}')">🔇</button><button class="btn btn-ghost" style="padding:6px 8px;font-size:12px" title="Expulsar da cidade 60 s" onclick="admKick(${o.id},'${esc(o.nome).replace(/'/g, '')}')">🥾</button>${o.sus ? `<button class="btn btn-ghost" style="padding:6px 8px;font-size:12px" onclick="admAcao('perdoar',${o.id},'${esc(o.nome).replace(/'/g, '')}')">🕊️</button>` : ''}<button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="admAcao('banir',${o.id},'${esc(o.nome).replace(/'/g, '')}')">🚫</button></span>`)).join('') + '</div>'
        : '<p class="center" style="padding:14px">Ninguém online neste nó agora.</p>')
      + (d.banidos.length ? '<h4 style="margin:12px 0 4px">🚫 Contas suspensas</h4><div class="list">' + d.banidos.map(b => _admRow('🚫', esc(b.nome) + ' <small>#' + b.id + '</small>', 'suspensa', `<button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="admAcao('desbanir',${b.id},'${esc(b.nome).replace(/'/g, '')}')">Readmitir</button>`)).join('') + '</div>' : '');
  } catch (e) { el.innerHTML = `<p class="center" style="padding:30px">❌ ${esc(e.message)}</p>`; }
}

/* ---------------- registar o painel ---------------- */
if (typeof PANELS !== 'undefined') PANELS.admin = {
  ico: '🛡️', t: 'Administração', sub: 'Só para o dono do jogo',
  tabs: [['vis', '📊 Visão geral', admTabVis], ['multi', '🕵️ Multicontas', admTabMulti], ['on', '🟢 Jogadores', admTabOn], ['den', '🚨 Denúncias', admTabDen], ['pz', '⚡ Poderes', admTabPoderes]],
};
