/* =========================================================
   BWÉ SOCIAL — AO VIVO
   O feed real da cidade: publicações, gostos e seguidores
   entre TODOS os jogadores (servidor /api/bwe). O sistema
   simulado (posts de carreira, fãs) continua em "Criar".
   ========================================================= */
const BWEL = { items: [], ts: 0, meu: null, on: false };

async function bweRefresh(force) {
  if (typeof Acc === 'undefined' || !Acc.online || !Acc.token) return;
  const now = Date.now();
  if (!force && now - BWEL.ts < 40000) return;
  BWEL.ts = now;
  const r = await vrApi('bwe', { op: 'feed' });
  if (r && r.ok) { BWEL.items = r.items || []; BWEL.meu = r.meu || { seg: 0, fol: 0 }; BWEL.on = true; BWEL.fail = false; }
  else BWEL.fail = true;
  if (typeof phoneApp !== 'undefined' && phoneApp === 'bwe' && typeof renderPhone === 'function') renderPhone(true);
}
setInterval(() => { try { if (phoneApp === 'bwe') bweRefresh(); } catch (e) { } }, 60000);

function bweAgo(ts) {
  const s = Math.max(1, (Date.now() - ts * 1000) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return Math.floor(s / 60) + ' min';
  if (s < 86400) return Math.floor(s / 3600) + ' h';
  return Math.floor(s / 86400) + ' d';
}

async function bwePublicar() {
  const el = document.getElementById('bweTxt');
  const txt = (el && el.value || '').trim();
  if (txt.length < 2) return toast('✍️ Escreve alguma coisa primeiro.');
  const r = await vrApi('bwe', { op: 'post', txt });
  if (!r || !r.ok) return toast('🚫 ' + ((r && r.erro) || 'Sem ligação ao servidor.'));
  toast('📸 Publicado! Os jogadores de todo o país já podem ver e gostar.');
  try { if (typeof SND !== 'undefined') SND.play('notif'); } catch (e) { }
  bweRefresh(true);
}
async function bweGostar(id) {
  const it = BWEL.items.find(x => x.i === id); if (!it) return;
  it.ml = !it.ml; it.l = Math.max(0, it.l + (it.ml ? 1 : -1));   // resposta imediata
  if (phoneApp === 'bwe') renderPhone(true);
  const r = await vrApi('bwe', { op: 'like', id });
  if (r && r.ok) { it.ml = !!r.on; it.l = r.n; if (phoneApp === 'bwe') renderPhone(true); }
}
async function bweSeguir(uid) {
  const its = BWEL.items.filter(x => x.u === uid); if (!its.length) return;
  const era = its[0].sg; its.forEach(x => x.sg = !era);
  if (phoneApp === 'bwe') renderPhone(true);
  const r = await vrApi('bwe', { op: 'seguir', fid: uid });
  if (!r || !r.ok) { its.forEach(x => x.sg = era); toast('🚫 ' + ((r && r.erro) || 'Sem ligação ao servidor.')); }
  else {
    toast(r.on ? '➕ Agora segues essa pessoa! Os posts dela aparecem-te primeiro.' : '➖ Deixaste de seguir.');
    if (BWEL.meu) BWEL.meu.seg = Math.max(0, BWEL.meu.seg + (r.on ? 1 : -1));
  }
  if (phoneApp === 'bwe') renderPhone(true);
}
async function bweApagar(id) {
  if (!confirm('Apagar esta publicação?')) return;
  const r = await vrApi('bwe', { op: 'apagar', id });
  if (!r || !r.ok) return toast('🚫 ' + ((r && r.erro) || 'Sem ligação ao servidor.'));
  BWEL.items = BWEL.items.filter(x => x.i !== id);
  toast('🗑 Publicação apagada.');
  if (phoneApp === 'bwe') renderPhone(true);
}

function bweIni(n) {
  const p = String(n || '?').trim().split(/\s+/);
  return esc(((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase());
}
function bwePostHTML(x) {
  const cor = `hsl(${(typeof phHash === 'function' ? phHash(String(x.n || '?')) : 7) % 360},55%,42%)`;
  return `<div class="post bwe${x.sg ? ' seg' : ''}"><div class="pu"><span class="cav sm" style="background:${cor};display:grid;place-items:center;font-weight:800;color:#fff">${bweIni(x.n)}</span><b>${esc((x.n || '?').split(' ')[0])}</b><small>${bweAgo(x.ts)}</small>
    ${x.eu ? `<button class="bwe-x" onclick="bweApagar(${x.i})" title="Apagar">🗑</button>` : `<button class="bwe-f${x.sg ? ' on' : ''}" onclick="bweSeguir(${x.u})">${x.sg ? '✓ A seguir' : '+ Seguir'}</button>`}</div>
    <div class="pt bwetxt">${esc(x.t)}</div>
    <div class="pa"><button class="bwe-l${x.ml ? ' on' : ''}" onclick="bweGostar(${x.i})">${x.ml ? '❤️' : '🤍'} ${numShort(x.l)}</button></div></div>`;
}
function bweLiveHTML() {
  const meu = BWEL.meu || { seg: 0, fol: 0 };
  let h = `<div class="bwepub"><input id="bweTxt" maxlength="140" placeholder="No que estás a pensar, ${esc((G.nome || '').split(' ')[0])}?" onkeydown="if(event.key==='Enter')bwePublicar()"><button class="pbtn sm" onclick="bwePublicar()">Publicar</button></div>`;
  h += `<div class="bwestats">🌍 <b>${numShort(meu.fol)}</b> ${meu.fol === 1 ? 'jogador segue-te' : 'jogadores seguem-te'} · tu segues <b>${numShort(meu.seg)}</b> · <a onclick="bweRefresh(true)">🔄 atualizar</a></div>`;
  if (!BWEL.on && !BWEL.fail) h += '<p class="apnote">A ligar ao servidor… 📡</p>';
  else if (BWEL.fail) h += '<p class="apnote">Sem ligação ao servidor — o feed ao vivo precisa de internet. Tenta outra vez daqui a bocado. 📡</p>';
  else if (!BWEL.items.length) h += '<p class="apnote">Ainda ninguém publicou nada. Sê o(a) primeiro(a) a fazer história no país! 🎉</p>';
  else {
    const seg = BWEL.items.filter(x => x.sg), rest = BWEL.items.filter(x => !x.sg);
    h += (seg.concat(rest)).map(bwePostHTML).join('');
  }
  h += '<p class="apnote">As publicações são reais: ficam guardadas no país e toda a gente as pode ver. Sem spam (1 post a cada 90 s) e sem ofensas — o filtro está atento. 🚫</p>';
  return h;
}

/* envolve a app Bwé Social: o feed falso dá lugar ao AO VIVO */
{
  const _bweBase = PHONE_VIEWS.bwe;
  PHONE_VIEWS.bwe = function () {
    let h = _bweBase.apply(this, arguments);
    const nota = '<p class="apnote">Sem publicar pelo menos uma vez por ano, perdes 12% dos seguidores. 5k+ dá parcerias pagas; 50k+ abre a carreira de influenciador(a).</p>';
    const k = h.indexOf('<div class="apsec">Feed</div>');
    h = (k >= 0 ? h.slice(0, k) : h) + `<div class="apsec">🌍 Ao vivo — jogadores reais</div>` + bweLiveHTML() +
      `<div class="apsec">A tua carreira de criador</div>` + nota;
    return h;
  };
  const _phoneOpenBwe = phoneOpen;
  phoneOpen = function (id) {
    _phoneOpenBwe.apply(this, arguments);
    if (id === 'bwe') bweRefresh();
  };
}
