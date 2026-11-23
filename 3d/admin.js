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

/* ---------------- separador: jogadores online ---------------- */
function admTabOn() { setTimeout(admLoadOn, 30); return '<div id="admB"><p class="center" style="padding:30px">⏳ A carregar…</p></div>'; }
async function admLoadOn() {
  const el = document.getElementById('admB'); if (!el) return;
  try {
    const d = await admApi('admin/painel');
    const sala = s => s.split('@')[0] === 'rua' ? 'na rua' : s.split('@')[0].startsWith('iv:') ? '🚪 ' + s.split('@')[0].slice(3) : '🏠 casa';
    el.innerHTML = '<h4 style="margin:6px 0 4px">🟢 Online agora neste nó</h4>'
      + (d.online.length ? '<div class="list">' + d.online.map(o => _admRow(o.sus ? '⚠️' : '🟢', esc(o.nome) + ' <small>#' + o.id + '</small>', kzShort(o.kz) + ' · ' + sala(o.sala),
        `<span style="display:flex;gap:4px">${o.sus ? `<button class="btn btn-ghost" style="padding:6px 8px;font-size:12px" onclick="admAcao('perdoar',${o.id},'${esc(o.nome).replace(/'/g, '')}')">🕊️</button>` : ''}<button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="admAcao('banir',${o.id},'${esc(o.nome).replace(/'/g, '')}')">🚫</button></span>`)).join('') + '</div>'
        : '<p class="center" style="padding:14px">Ninguém online neste nó agora.</p>')
      + (d.banidos.length ? '<h4 style="margin:12px 0 4px">🚫 Contas suspensas</h4><div class="list">' + d.banidos.map(b => _admRow('🚫', esc(b.nome) + ' <small>#' + b.id + '</small>', 'suspensa', `<button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="admAcao('desbanir',${b.id},'${esc(b.nome).replace(/'/g, '')}')">Readmitir</button>`)).join('') + '</div>' : '');
  } catch (e) { el.innerHTML = `<p class="center" style="padding:30px">❌ ${esc(e.message)}</p>`; }
}

/* ---------------- registar o painel ---------------- */
if (typeof PANELS !== 'undefined') PANELS.admin = {
  ico: '🛡️', t: 'Administração', sub: 'Só para o dono do jogo',
  tabs: [['vis', '📊 Visão geral', admTabVis], ['multi', '🕵️ Multicontas', admTabMulti], ['on', '🟢 Jogadores', admTabOn]],
};
