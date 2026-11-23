/* =========================================================
   VIDA REAL — polícia e ladrões (PvP em tempo real), impostos,
   política (eleições online), grupos, amigos, vida diária,
   consequências e razões. Tudo leve: só HTML + dados pequenos.
   ========================================================= */
const VR = { on: false, wl: 0, polOn: 0, gov: null, eleicao: null, all: null, amigos: null, grupo: undefined, grupos: null, pol: null,
  alertas: [], fetchT: {}, crT: 0, t: 0, near: null, hungerT: 0, cadSrv: 0 };
const VR_GOV0 = { nick: 'Governo provisório', partido: 'Comissão Eleitoral', orc: 'economia', iva: 14, promessa: 'Manter a cidade a funcionar até haver eleições.' };
const VR_ORC = {
  saude: ['🏥', 'Saúde', '+2 de saúde por ano para todos'],
  educacao: ['🎓', 'Educação', '+2 de inteligência por ano para todos'],
  seguranca: ['🚔', 'Segurança', 'mais polícia na rua: os crimes ficam mais arriscados'],
  economia: ['📈', 'Economia', '+5% de bónus sobre os salários de todos'],
};
const VR_GT = {
  gangue: ['🔫', 'Gangue', '+20% de saque nos crimes quando há membros a menos de 15 m'],
  empresa: ['💼', 'Empresa', '+5% no salário anual de cada membro'],
  clube: ['⚽', 'Clube', '+3 de felicidade por ano'],
  partido: ['🗳', 'Partido', 'campanha eleitoral a metade do preço · +2 fama/ano'],
  familia: ['🏠', 'Família', '+2 de saúde por ano e ajuda nas multas'],
};
/* crimes contra a cidade (os PvP são carteira/assalto e precisam de alguém ao lado) */
const VR_CRIMES = [
  { id: 'npc', ico: '👛', t: 'Roubar um peão', d: 'Puxar a carteira a alguém que passa na rua.', stars: 1, pok: .75, lo: 2000, hi: 15000, pn: .10, needNpc: true },
  { id: 'loja', ico: '🏪', t: 'Assaltar uma cantina', d: 'Perto do Mercado do Roque ou do Kianda Mall.', stars: 2, pok: .6, lo: 20000, hi: 120000, pn: .18, where: ['mercado', 'shopping'] },
  { id: 'carro', ico: '🚗', t: 'Roubar um carro estacionado', d: 'Em qualquer rua com trânsito. Vendes as peças na sucata.', stars: 2, pok: .55, lo: 40000, hi: 250000, pn: .20, min: 18 },
  { id: 'banco', ico: '🏦', t: 'Assaltar o Banco Palanca', d: 'Só à porta do banco, na Baixa. Golpe grande, risco enorme.', stars: 3, pok: .35, lo: 300000, hi: 2000000, pn: .35, where: ['banco'], min: 18 },
];
const VR_PVP = { carteira: { ico: '👛', t: 'Roubar a carteira', stars: 1, pok: .65 }, assalto: { ico: '🔪', t: 'Assaltar', stars: 2, pok: .7 } };
const VR_FOOD = [
  ['pao', '🍞', 'Pão com chouriço', 'Roulote da esquina · em qualquer lado', 300, 15, 0, null],
  ['funge', '🍲', 'Funge com calulu', 'Tasca do bairro · em qualquer lado', 2000, 40, 5, null],
  ['cafe', '☕', 'Café e bolinho de jinguba', '+20 de energia', 600, 5, 20, null],
  ['mufete', '🐟', 'Mufete na Ilha', 'Só perto da Praia da Ilha', 6000, 60, 10, 'praia'],
  ['mall', '🍔', 'Praça de alimentação', 'Só no Kianda Mall', 9000, 70, 10, 'shopping'],
  ['casa', '🍽', 'Cozinhar em casa', 'Só em casa · o mais barato', 800, 45, 0, 'casa'],
];

function vrG() {
  if (!G) return {};
  if (!G.vr) G.vr = {};
  const d = { fome: 85, energia: 90, crimes: 0, prisoes: 0, presosFeitos: 0, saque: 0, roubado: 0, fuga: false, servico: false, comunit: false,
    cadAte: 0, cadRT: false, wl: 0, wlT: 0, anosLimpo: 0, crimesAno: 0, gtag: null, gtipo: null, imp: { pagos: 0, divida: 0, anosDiv: 0, hist: [] } };
  for (const k in d) if (G.vr[k] === undefined) G.vr[k] = d[k];
  return G.vr;
}
const vrOnline = () => typeof Acc !== 'undefined' && Acc.online && !!Acc.token && !(typeof MP !== 'undefined' && MP.offline);
const vrGov = () => VR.gov || VR_GOV0;
const vrStars = (n, max = 5) => `<span class="vstars" style="color:#ff3b3b;white-space:nowrap">${'<i class="vst"></i>'.repeat(Math.max(0, n))}${'<i class="vst off"></i>'.repeat(Math.max(0, max - n))}</span>`;
const vrStarsF = n => vrStars(n, n);
const vrTyping = () => { const a = document.activeElement; return !!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)); };
const vrNearLoc = (id, r = 30) => { const L = LOC_POS[id]; if (typeof inInt !== 'undefined' && inInt) return inInt.loc === id; return !!L && Math.hypot(L.x - playerPos.x, L.z - playerPos.z) < r; };
const vrPreso = () => { const v = vrG(); return !!(v.cadRT && v.cadAte > Date.now()); };
const vrPodePolicia = () => { const v = vrG(); return !!((G.emprego && ['policia', 'militar'].includes(G.emprego.id)) || v.comunit); };
async function vrApi(p, d) {
  try {
    const r = await fetch('/api/' + p, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify(d || {}) });
    return await r.json();
  } catch (e) { return { ok: false, erro: 'Sem ligação ao servidor.' }; }
}
function vrRe() { if (panelId === 'cidade' && !vrTyping()) renderPanel(true); }

/* ---------------- multijogador: envio e receção ---------------- */
function vrMpBody() {
  if (!G) return {};
  const v = vrG();
  return { pol: !!(v.servico && vrPodePolicia() && !vrPreso()), job: G.emprego ? strip(jobTitle(G.emprego)) : G.estudo ? 'Estudante' : (G.idade < 18 ? 'Jovem' : 'Desempregado(a)'),
    all: (typeof V4 !== 'undefined' && V4.all > Date.now()) || (panelId === 'cidade' && (panelTab.cidade || 'online') === 'online') ? 1 : 0 };
}
function vrOnMp(d) {
  if (!G) return;
  const v = vrG(); VR.on = true;
  VR.wl = d.wl || 0; v.wl = VR.wl; v.wlT = Date.now();
  VR.gov = d.gov || null; VR.polOn = d.polOn || 0; VR.eleicao = d.eleicao || null;
  if (d.all) VR.all = d.all;
  VR.cadSrv = d.cad || 0;
  if (d.cad > 0 && !vrPreso()) vrJail(d.cad, 'O servidor diz que estás detido(a)', true);
  for (const e of d.ev || []) try { vrEvent(e); } catch (er) { console.error(er); }
  if (panelId === 'cidade' && ['online', 'politica'].includes(panelTab.cidade || 'online')) vrRe();
}
function vrEvent(e) {
  const v = vrG();
  if (e.t === 'roubado') {
    const perda = Math.min(e.v, Math.max(0, G.dinheiro)); G.dinheiro -= perda; v.roubado += perda;
    const t = `${e.tipo === 'assalto' ? '🔪' : '👛'} <b>${esc(e.de)}</b> ${e.tipo === 'assalto' ? 'assaltou-te' : 'roubou-te a carteira'} e levou ${kz(perda)}! ` + fx({ felicidade: -5 }) +
      ` <i>Razão: estavas sozinho(a) ao lado de um jogador. Anda com amigos, perto de agentes, ou guarda o dinheiro no banco.</i> ${esc(e.de)} está agora procurado(a).`;
    addLog(t, 'bad'); flash(`👛 Foste roubado(a) por ${esc(e.de)}!`); if (typeof SND !== 'undefined') SND.play('err'); save(); refresh();
  } else if (e.t === 'tentativa') toast(`🛡 ${esc(e.de)} tentou roubar-te, mas falhou! Agora é procurado(a).`);
  else if (e.t === 'preso') vrJail(e.s, `Foste preso(a) pelo(a) agente ${esc(e.por)} (${e.wl} ${e.wl === 1 ? 'estrela' : 'estrelas'} de procurado)`);
  else if (e.t === 'alerta') {
    VR.alertas.push(Object.assign({ at: performance.now() }, e)); VR.alertas = VR.alertas.slice(-8);
    toast(`🚨 Alerta à polícia: <b>${esc(e.de)}</b> — ${esc(e.tn)} ${vrStars(e.wl)}`); if (typeof SND !== 'undefined') SND.play('notif');
  } else if (e.t === 'sms') {
    G.telNomes = G.telNomes || {}; if (e.num) G.telNomes[e.num] = e.de;
    (G.inbox = G.inbox || []).unshift({ key: 'p' + (e.num || '?'), de: e.de || 'DarkCell', txt: String(e.txt || '').slice(0, 140), ano: G.ano, lida: false });
    G.inbox = G.inbox.slice(0, 80);
    flash(`💬 SMS de <b>${esc(e.de || '?')}</b>: ${esc(String(e.txt || '').slice(0, 50))}`);
    if (typeof SND !== 'undefined') SND.play('notif');
    save(); if (typeof updateBadge === 'function') updateBadge();
    if (typeof phoneApp !== 'undefined' && phoneApp && typeof renderPhone === 'function') renderPhone(true);
  }
  else if (e.t === 'pedido') { toast(`🤝 <b>${esc(e.de)}</b> quer ser teu kamba! Abre Cidade → Amigos.`); VR.fetchT.amigos = 0; vrBadge(true); }
  else if (e.t === 'amigo_ok') { toast(`🤝 Tu e <b>${esc(e.de)}</b> agora são kambas!`); VR.fetchT.amigos = 0; }
  else if (e.t === 'grupo_entrou') { toast(`👥 ${esc(e.de)} entrou no teu grupo!`); VR.fetchT.grupo = 0; }
  else if (e.t === 'expulso') { addLog(`👥 Foste expulso(a) do grupo ${esc(e.g)}.`, 'bad'); v.gtag = v.gtipo = null; VR.grupo = null; }
  else if (e.t === 'eleito') { addLog(`🗳 Ganhaste a eleição com ${e.v} voto(s)! És Governador(a) de Luanda: o teu orçamento e o teu IVA valem para todos os jogadores.`, 'gold'); fx({ fama: 12 }); flash('🗳 És o(a) novo(a) Governador(a)!'); save(); refresh(); }
}
function vrBadge(on) { const b = document.getElementById('vrBadge'); if (b) b.classList.toggle('hidden', !on); }

/* ---------------- cadeia em tempo real ---------------- */
function vrJail(secs, motivo, silent) {
  const v = vrG();
  v.cadAte = Date.now() + secs * 1000; v.cadRT = true; v.wl = 0; VR.wl = 0;
  if (!silent) {
    v.prisoes++; G.cadastro = true; v.anosLimpo = 0;
    let extra = '';
    if (G.emprego && ['policia', 'militar'].includes(G.emprego.id)) { extra = ` Foste expulso(a) da ${job(G.emprego.id).t}.`; G.emprego = null; }
    if (v.servico) { v.servico = false; }
    if (v.comunit) { v.comunit = false; extra += ' Perdeste o cartão de agente comunitário.'; }
    addLog(`🔒 ${motivo}. Ficas ${secs} s na Cadeia de Viana. <i>Consequência: ganhas cadastro criminal — a Polícia, o banco e outros empregos que exigem registo limpo ficam fechados até o cadastro prescrever (5 anos sem crimes).</i>${extra} ` + fx({ karma: -6, felicidade: -10, fama: 2 }), 'bad');
  }
  G.preso = Math.max(G.preso, 1);
  try { closeModal(); } catch (e) { } try { closePanel(); } catch (e) { }
  if (typeof inInt !== 'undefined' && inInt && typeof ivExit === 'function') try { ivExit(true); } catch (e) { }
  if (typeof sendToPrison === 'function') try { sendToPrison(); } catch (e) { }
  save(); refresh(); vrHud();
}
function vrSoltar(fianca) {
  const v = vrG(); if (!v.cadRT) return;
  v.cadRT = false; v.cadAte = 0; G.preso = 0;
  if (typeof releaseFromPrison === 'function') try { releaseFromPrison(); } catch (e) { }
  addLog(fianca ? '🔓 Pagaste a fiança e saíste da cadeia. O cadastro fica.' : '🔓 Cumpriste a pena e saíste da Cadeia de Viana. Uma nova oportunidade.', 'good');
  save(); refresh(); vrHud();
}
const vrFiancaV = () => Math.max(20000, Math.round(Math.max(0, vrG().cadAte - Date.now()) / 1000) * 1500);
async function vrFianca() {
  const val = vrFiancaV(); if (!pay(val)) return;
  if (vrOnline()) await vrApi('fianca');
  vrSoltar(true);
}

/* ---------------- crimes ---------------- */
function vrNpcPerto(r = 9) { return typeof npcs !== 'undefined' && npcs.some(n => Math.hypot(n.h.g.position.x - playerPos.x, n.h.g.position.z - playerPos.z) < r); }
function vrBloqueioCrime(C) {
  const v = vrG();
  if (vrPreso()) return 'Estás na cadeia.';
  if (G.idade < 16) return 'És menor.';
  if (C.min && G.idade < C.min) return `Precisas de ter ${C.min} anos.`;
  if (v.servico) return 'Estás de serviço como agente: sai de serviço primeiro.';
  if (typeof inInt !== 'undefined' && inInt) return 'Sai para a rua primeiro.';
  if (C.where && !C.where.some(w => vrNearLoc(w))) return 'Tens de estar perto de: ' + C.where.map(w => LOC_POS[w].n).join(' ou ') + '.';
  if (C.needNpc && !vrNpcPerto()) return 'Não há ninguém por perto para roubar. Procura uma rua com peões.';
  return '';
}
function vrGangPerto() { const v = vrG(); if (v.gtipo !== 'gangue' || !v.gtag) return 0; let n = 0; for (const o of MP.others.values()) if (o.gt === v.gtag && o.d < 15) n++; return n; }
function vrCrimeAsk(id, alvo) {
  const C = id in VR_PVP ? Object.assign({ id, pvp: true }, VR_PVP[id]) : VR_CRIMES.find(c => c.id === id); if (!C) return;
  const o = alvo ? MP.others.get(alvo) : null;
  const bl = C.pvp ? (vrPreso() ? 'Estás na cadeia.' : vrG().servico ? 'Estás de serviço como agente.' : !o || o.d > 4.5 ? 'A vítima tem de estar mesmo ao teu lado.' : o.pol ? 'Não podes assaltar um agente em serviço.' : '') : vrBloqueioCrime(C);
  if (bl) return toast('🚫 ' + bl);
  const seg = vrGov().orc === 'seguranca', pol = VR.polOn - (vrG().servico ? 1 : 0), gang = vrGangPerto();
  const pn = C.pvp ? .12 : C.pn;
  const riscoNpc = Math.round(Math.min(.95, (pn + (VR.wl + C.stars) * .04 + (seg ? .1 : 0)) * (pol > 0 ? .35 : 1)) * 100);
  openModal(`<div class="mico">${C.ico}</div><h3>${C.t}${o ? ' — ' + esc(o.nick) : ''}</h3>
    <div class="vrwhy"><b>Razões e consequências</b>
    <div>🎯 Hipótese de sucesso: <b>${Math.round(C.pok * 100)}%</b>${pol > 0 ? ' (−25% se um agente estiver a menos de 30 m)' : ''}</div>
    <div>⭐ Ficas procurado(a): <b style="color:#ff5a5a">${vrStarsF(C.stars)}</b> (mais 1 estrela se falhares). Cada estrela desaparece após 75 s sem crimes.</div>
    <div>🚔 Risco de seres apanhado(a) logo: <b>${riscoNpc}%</b> ${pol > 0 ? `· há <b>${pol}</b> agente(s) jogador(es) online que vão receber um alerta com a tua posição` : '· não há agentes jogadores online agora'}</div>
    <div>🔒 Se fores preso(a): ${40}s de cadeia por estrela, cadastro criminal, perdes emprego na Polícia/FAA, −karma.</div>
    ${gang ? `<div>🔫 ${gang} membro(s) do teu gangue perto: +20% de saque.</div>` : ''}
    ${seg ? '<div>🏛 O Governo investe em <b>Segurança</b>: mais polícia na rua.</div>' : ''}
    ${o ? `<div>👤 ${esc(o.nick)} vai saber quem foi e perde dinheiro de verdade.</div>` : ''}</div>
    <div class="choices"><button class="btn btn-pri" onclick="closeModal();vrCrimeGo('${id}',${alvo || 0})">${C.ico} Fazer na mesma</button><button class="btn btn-ghost" onclick="closeModal()">Desistir (a escolha certa)</button></div>`);
}
async function vrCrimeGo(id, alvo) {
  if (Date.now() - VR.crT < 8000) return toast(`⏳ Calma, a cidade está atenta. Espera ${Math.ceil((8000 - (Date.now() - VR.crT)) / 1000)} s.`);
  const v = vrG(), C = id in VR_PVP ? Object.assign({ id, pvp: true }, VR_PVP[id]) : VR_CRIMES.find(c => c.id === id);
  let r;
  if (vrOnline()) { r = await vrApi('crime', { tipo: id, alvo: alvo || undefined }); if (!r.ok) return toast('🚫 ' + (r.erro || 'Não deu.')); }
  else {
    if (C.pvp) return toast('Precisas de estar online para interagir com outros jogadores.');
    const ok = Math.random() < C.pok; v.wl = Math.min(5, (v.wl || 0) + C.stars + (ok ? 0 : 1)); v.wlT = Date.now(); VR.wl = v.wl;
    const seg = vrGov().orc === 'seguranca', preso = Math.random() < C.pn + v.wl * .04 + (seg ? .1 : 0);
    r = { ok: true, sucesso: ok, v: ok ? R(C.lo, C.hi) : 0, wl: preso ? 0 : v.wl, wl0: v.wl, preso, secs: preso ? 40 * v.wl : 0, pol: 0, perto: 0, seg };
    if (preso) { v.wl = 0; VR.wl = 0; }
  }
  VR.crT = Date.now(); v.crimes++; v.crimesAno++;
  let val = r.v || 0; const gang = vrGangPerto(); if (gang && val) val = Math.round(val * 1.2);
  if (G.idade < 18) val = Math.round(val * .5);
  let t;
  if (r.sucesso) { G.dinheiro += val; v.saque += val; t = `${C.ico} ${C.t}${r.vitima ? ' (' + esc(r.vitima) + ')' : ''}: conseguiste ${kz(val)}. ` + fx({ karma: C.stars >= 3 ? -10 : -5 }); }
  else t = `${C.ico} ${C.t}: correu mal, a vítima gritou e as testemunhas viram a tua cara. ` + fx({ karma: -3, felicidade: -3 });
  const razao = r.perto ? 'havia um(a) agente a menos de 30 m' : r.pol ? `há ${r.pol} agente(s) online que receberam um alerta` : r.seg ? 'o Governo pôs mais polícia na rua' : 'as testemunhas chamaram a polícia';
  if (r.preso) { addLog(t + ` <i>Razão da prisão: ${razao}.</i>`, 'bad'); vrJail(r.secs, `Apanhado(a) em flagrante (${r.wl0} ${r.wl0 === 1 ? 'estrela' : 'estrelas'} de procurado)`); return; }
  VR.wl = r.wl; v.wl = r.wl; v.wlT = Date.now();
  addLog(t + ` Estás procurado(a): ${vrStars(r.wl)}. <i>${r.pol ? 'Os agentes online sabem onde estás — foge ou esconde-te num interior até as estrelas baixarem.' : 'As estrelas baixam 1 a cada 75 s sem crimes.'}</i>`, r.sucesso ? '' : 'bad');
  flash(r.sucesso ? `${C.ico} +${kzShort(val)} · ${vrStars(r.wl)}` : `🚨 Falhou! ${vrStars(r.wl)}`);
  if (typeof SND !== 'undefined') SND.play(r.sucesso ? 'cash' : 'err');
  save(); refresh(); vrHud();
}

/* ---------------- polícia ---------------- */
function vrComunit() {
  const v = vrG();
  const why = [G.idade < 18 && 'ter 18 anos', G.cadastro && 'não ter cadastro criminal', G.stats.karma < 40 && 'karma 40 ou mais', (VR.wl || 0) > 0 && 'não estar procurado(a)'].filter(Boolean);
  if (why.length) return toast('🚫 Para seres agente comunitário(a) precisas de: ' + why.join(', ') + '.');
  v.comunit = true; addLog('🛡 Entraste na Polícia Comunitária como voluntário(a). Podes entrar de serviço e prender procurados (prémio a metade do de um agente de carreira).', 'good'); save(); renderPanel(true);
}
function vrServico() {
  const v = vrG();
  if (!vrPodePolicia()) return toast('🚫 Só agentes da Polícia Nacional, militares das FAA ou da Polícia Comunitária podem entrar de serviço.');
  if (vrPreso()) return toast('🔒 Estás preso(a).');
  if (!v.servico && (VR.wl || 0) > 0) return toast('🚫 Estás procurado(a)! Um agente procurado não pode trabalhar.');
  v.servico = !v.servico;
  toast(v.servico ? '🚔 Entraste de serviço! Os procurados aparecem a vermelho no radar e recebes alertas de crimes.' : 'Saíste de serviço.');
  save(); renderPanel(true); vrHud();
}
async function vrPrender(id) {
  const o = MP.others.get(id), v = vrG();
  if (!v.servico) return toast('Entra de serviço primeiro (Cidade → Polícia).');
  if (!o || o.d > 5) return toast('🚔 Aproxima-te do suspeito (menos de 5 m).');
  const r = await vrApi('prender', { alvo: id });
  if (!r.ok) return toast('🚫 ' + r.erro);
  const premio = Math.round(r.premio * (v.comunit && !(G.emprego && ['policia', 'militar'].includes(G.emprego.id)) ? .5 : 1));
  G.dinheiro += premio; v.presosFeitos++;
  if (G.emprego && G.emprego.id === 'policia') G.emprego.desemp = clamp((G.emprego.desemp || 50) + 8 * r.wl);
  addLog(`🚔 Prendeste <b>${esc(r.nick)}</b> ${vrStarsF(r.wl)}: vai passar ${r.secs} s na Cadeia de Viana. Prémio: ${kz(premio)}. ` + fx({ karma: 3, fama: 2 }) + (G.emprego && G.emprego.id === 'policia' ? ' O teu desempenho subiu.' : ''), 'good');
  flash(`🚔 Prendeste ${esc(r.nick)}! +${kzShort(premio)}`); if (typeof SND !== 'undefined') SND.play('cash');
  save(); refresh();
}

/* ---------------- amigos, grupos e política (servidor) ---------------- */
async function vrLoad(key, force) {
  if (!vrOnline()) return;
  if (!force && performance.now() - (VR.fetchT[key] || -1e9) < 6000) return;
  VR.fetchT[key] = performance.now();
  if (key === 'amigos') { const r = await vrApi('amigos', { op: 'list' }); if (r.ok) { VR.amigos = r; vrBadge(r.pedidos.length > 0); } }
  if (key === 'grupo') {
    const [a, b] = await Promise.all([vrApi('grupo', { op: 'meu' }), vrApi('grupo', { op: 'lista' })]);
    if (a.ok) { VR.grupo = a.grupo; const v = vrG(); v.gtag = a.grupo ? a.grupo.tag : null; v.gtipo = a.grupo ? a.grupo.tipo : null; }
    if (b.ok) VR.grupos = b.grupos;
  }
  if (key === 'pol') { const r = await vrApi('pol', { op: 'estado' }); if (r.ok) { VR.pol = r; VR.gov = r.gov; } }
  vrRe();
}
async function vrAmigo(op, fid, nick) {
  if (!vrOnline()) return toast('Precisas de estar online.');
  const r = await vrApi('amigos', { op, fid: fid || undefined, nick: nick || undefined });
  if (!r.ok) return toast('🚫 ' + r.erro);
  toast(op === 'del' ? 'Removido(a) dos amigos.' : r.estado === 'amigos' ? `🤝 Tu e ${esc(r.nick)} agora são kambas!` : `🤝 Pedido de amizade enviado a ${esc(r.nick)}.`);
  vrLoad('amigos', true);
}
async function vrGrupoOp(op, extra) {
  if (!vrOnline()) return toast('Precisas de estar online.');
  const d = Object.assign({ op }, extra || {});
  if (op === 'criar') {
    d.nome = (document.getElementById('vrGNome') || {}).value || ''; d.tag = (document.getElementById('vrGTag') || {}).value || '';
    d.tipo = (document.getElementById('vrGTipo') || {}).value || 'clube'; d.lema = (document.getElementById('vrGLema') || {}).value || '';
    if (G.dinheiro < 50000) return toast('💸 Fundar um grupo custa 50 000 Kz (registo e sede).');
  }
  if (op === 'sair' && !confirm('Sair do grupo?')) return;
  const r = await vrApi('grupo', d);
  if (!r.ok) return toast('🚫 ' + r.erro);
  if (op === 'criar') { pay(50000); addLog(`👥 Fundaste o grupo <b>[${esc(r.tag)}] ${esc(d.nome)}</b> (${VR_GT[d.tipo][1]}). ${VR_GT[d.tipo][2]}.`, 'gold'); fx({ fama: 3 }); }
  if (op === 'entrar') addLog(`👥 Entraste no grupo <b>[${esc(r.tag)}]</b>.`, 'good');
  if (op === 'sair') { const v = vrG(); v.gtag = v.gtipo = null; if (MP.scope === 'grupo') mpSetScope('todos'); }
  save(); vrLoad('grupo', true);
}
async function vrPolOp(op, extra) {
  if (!vrOnline()) return toast('Precisas de estar online para as eleições.');
  const d = Object.assign({ op }, extra || {}), v = vrG();
  let custo = 0;
  if (op === 'candidatar') {
    const why = [G.idade < 21 && 'ter 21 anos', G.cadastro && 'não ter cadastro criminal', v.imp.divida > 0 && 'não ter dívidas ao Estado (AGT)', G.stats.fama < 5 && 'fama 5 ou mais'].filter(Boolean);
    if (why.length) return toast('🚫 Para te candidatares precisas de: ' + why.join(', ') + '.');
    custo = v.gtipo === 'partido' ? 50000 : 100000; if (G.dinheiro < custo) return toast(`💸 A campanha custa ${kz(custo)}.`);
    d.partido = document.getElementById('vrPPart').value; d.promessa = document.getElementById('vrPProm').value; d.orc = document.getElementById('vrPOrc').value; d.iva = +document.getElementById('vrPIva').value;
  }
  const r = await vrApi('pol', d);
  if (!r.ok) return toast('🚫 ' + r.erro);
  if (op === 'candidatar') { pay(custo); addLog(`🗳 Candidataste-te a Governador(a) de Luanda pelo ${esc(d.partido)}. Campanha: ${kz(custo)}.`, 'gold'); fx({ fama: 3 }); }
  if (op === 'votar') { addLog('🗳 Votaste na eleição para Governador(a). A tua voz conta!', 'good'); fx({ karma: 1, felicidade: 2 }); }
  VR.pol = r; VR.gov = r.gov; save(); refresh(); vrRe();
}

/* ---------------- vida diária ---------------- */
function vrComer(id) {
  const F = VR_FOOD.find(f => f[0] === id), v = vrG(); if (!F) return;
  if (F[7] && !vrNearLoc(F[7], 34)) return toast(`📍 Isto só existe perto de: ${LOC_POS[F[7]].n}.`);
  if (F[0] === 'casa' && G.casa && (G.casa.tipo === 'propria' || G.casa.tipo === 'arrendada') && !(G.moveis || []).includes('fogao')) return toast('🍳 Não tens fogão! Compra um na Imobiliária → 🪑 Móveis para cozinhares em casa.');
  if (vrPreso()) return toast('🔒 Na cadeia comes o que te dão.');
  if (!pay(F[4])) return;
  v.fome = Math.min(100, v.fome + F[5]); v.energia = Math.min(100, v.energia + F[6]);
  toast(`${F[1]} ${F[2]}: fome ${Math.round(v.fome)} · energia ${Math.round(v.energia)}`); save(); refresh(); vrHud();
}
function vrDormir(sesta) {
  const v = vrG();
  if (vrPreso()) return toast('🔒 Na cadeia dorme-se mal...');
  if (!sesta && !vrNearLoc('casa', 34)) return toast('🏠 Para dormires bem tens de estar em casa (ou faz uma sesta no jardim, com risco).');
  const f = $('#fade'); f.innerHTML = `<div><small>${sesta ? 'Uma sesta no banco do jardim…' : 'Boa noite…'}</small><b>${sesta ? '😴' : '🌙'}</b></div>`; f.classList.add('on'); uiBlocked = true;
  setTimeout(() => {
    f.classList.remove('on'); uiBlocked = !!panelId || modalOpen || !!phoneApp;
    if (sesta) {
      v.energia = Math.min(100, v.energia + 30); v.fome = Math.max(0, v.fome - 5);
      if (Math.random() < .3 && G.dinheiro > 0) { const p = Math.round(G.dinheiro * (.05 + Math.random() * .1)); G.dinheiro -= p; addLog(`😴 Fizeste uma sesta no jardim e acordaste sem ${kz(p)} na carteira. <i>Razão: dormir na rua é arriscado.</i>`, 'bad'); }
      else toast('😴 Sesta feita: +30 de energia.');
    } else {
      const minha = G.casa && (G.casa.tipo === 'propria' || G.casa.tipo === 'arrendada');
      const mv = G.moveis || [];
      if (minha && !mv.includes('cama') && !mv.includes('colchao')) {
        v.energia = Math.min(100, v.energia + 45); v.fome = Math.max(0, v.fome - 8);
        addLog('🌙 Dormiste no chão frio da tua casa vazia e acordaste todo(a) dorido(a). <i>Compra pelo menos um colchão (Imobiliária → 🪑 Móveis).</i> ' + fx({ saude: -1, felicidade: -2 }), 'bad');
      } else if (minha && !mv.includes('cama')) {
        v.energia = Math.min(100, v.energia + 75); v.fome = Math.max(0, v.fome - 10 - (mv.includes('geladeira') ? 4 : 0));
        addLog('🌙 Dormiste no colchão no chão. Dá para descansar, mas uma cama a sério era outra coisa. ' + fx({ saude: 1 })); 
      } else {
        v.energia = 100; v.fome = Math.max(0, v.fome - 12 - (mv.includes('geladeira') ? 6 : 0));
        addLog('🌙 Dormiste bem na tua cama e acordaste com a energia no máximo. ' + fx({ saude: 2, felicidade: 1 + (mv.length >= 5 ? 1 : 0) }));
      }
      if (typeof dayT !== 'undefined') dayT = .3;
    }
    save(); refresh(); vrHud();
  }, 1300);
}
function vrSpeedK(run) { if (!G || !G.vr) return 1; const v = G.vr; let k = 1; if (run && v.energia < 8) k *= .58; if (v.fome < 8) k *= .85; if (vrPreso()) k *= .6; return k; }

/* ---------------- impostos & efeitos anuais ---------------- */
function vrIRT(s) { const B = [[1200000, 0], [6000000, .10], [24000000, .17], [Infinity, .25]]; let t = 0, prev = 0; for (const [lim, tx] of B) { if (s > prev) t += (Math.min(s, lim) - prev) * tx; prev = lim; } return Math.round(t); }
function vrImpostos() {
  const sal = (G.emprego ? salario(G.emprego) : 0) + (G.part ? salario(G.part) : 0);
  let ipu = 0; (G.imoveis || []).forEach(i => { const C = casaT(i.id); ipu += (i.valor || (C ? precoCasa(C) : 0)) * .005; });
  let ind = 0; (G.negocios || []).forEach(n => { try { ind += negValor(n) * .04; } catch (e) { } });
  const iva = Math.round((custoVida().c || 0) * vrGov().iva / 100);
  const irt = vrIRT(sal);
  return { sal, irt, iva, ipu: Math.round(ipu), ind: Math.round(ind), total: irt + iva + Math.round(ipu) + Math.round(ind) };
}
function vrAnual() {
  const v = vrG(), gov = vrGov(), out = [];
  if (G.idade < 18) { v.crimesAno = 0; return; }
  // cadastro prescreve
  if (v.crimesAno === 0) { v.anosLimpo++; if (G.cadastro && v.anosLimpo >= 5) { G.cadastro = false; addLog('📜 O teu cadastro criminal prescreveu: 5 anos sem crimes. Voltas a ter registo limpo.', 'good'); } }
  else v.anosLimpo = 0;
  v.crimesAno = 0;
  if (G.preso > 0 && !v.cadRT) return;
  // impostos
  const I = vrImpostos();
  if (I.total > 0) {
    if (v.fuga) {
      v.imp.divida += I.total; v.imp.anosDiv++;
      out.push(`🧾 Não declaraste ${kz(I.total)} de impostos (fuga ao fisco).`);
      if (Math.random() < .22 + Math.min(.4, v.imp.divida / 2e7)) {
        const multa = Math.round(v.imp.divida * 1.5); G.dinheiro -= multa;
        addLog(`🕵 A AGT fez uma fiscalização e apanhou a tua fuga aos impostos! Pagaste ${kz(multa)} (dívida + 50% de multa). <i>Consequência: ficas com cadastro fiscal e o teu nome sai no jornal.</i> ` + fx({ karma: -6, fama: -3, felicidade: -8 }), 'bad');
        G.cadastro = true; v.anosLimpo = 0; v.imp.divida = 0; v.imp.anosDiv = 0; v.fuga = false;
      }
    } else {
      const pago = Math.min(I.total, Math.max(0, G.dinheiro)); G.dinheiro -= pago; v.imp.pagos += pago;
      if (pago < I.total) { v.imp.divida += I.total - pago; out.push(`🧾 Impostos: pagaste ${kz(pago)} de ${kz(I.total)}. Falta ${kz(I.total - pago)} (dívida à AGT, +10% de juros/ano).`); }
      else out.push(`🧾 Impostos pagos: ${kz(I.total)} (IRT ${kzShort(I.irt)} · IVA ${gov.iva}% ${kzShort(I.iva)}${I.ipu ? ' · IPU ' + kzShort(I.ipu) : ''}${I.ind ? ' · Industrial ' + kzShort(I.ind) : ''}).`);
    }
    v.imp.hist.unshift({ ano: G.ano, ...I, fuga: !!v.fuga }); v.imp.hist = v.imp.hist.slice(0, 8);
  }
  if (v.imp.divida > 0 && !v.fuga) {
    v.imp.divida = Math.round(v.imp.divida * 1.1); v.imp.anosDiv++;
    if (v.imp.anosDiv >= 3) { const pz = Math.min(G.poupanca || 0, v.imp.divida); if (pz > 0) { G.poupanca -= pz; v.imp.divida -= pz; out.push(`⚖ Execução fiscal: a AGT penhorou ${kz(pz)} da tua poupança.`); } }
  }
  // efeitos do governo eleito
  const O = VR_ORC[gov.orc];
  if (gov.orc === 'saude') fx({ saude: 2 }); else if (gov.orc === 'educacao') fx({ inteligencia: 2 });
  else if (gov.orc === 'economia' && I.sal > 0) { const b = Math.round(I.sal * .05); G.dinheiro += b; }
  if (O) out.push(`🏛 Orçamento do Governo (${esc(gov.nick)}): ${O[1]} — ${O[2]}.`);
  if (VR.gov && typeof MP !== 'undefined' && MP.me === VR.gov.uid) { G.dinheiro += 3000000; fx({ fama: 3 }); out.push('🏛 Salário de Governador(a): +3 000 000 Kz.'); }
  // bónus do grupo
  if (v.gtipo === 'empresa' && I.sal) { G.dinheiro += Math.round(I.sal * .05); out.push(`💼 Bónus da tua empresa [${v.gtag}]: +5% do salário.`); }
  if (v.gtipo === 'clube') fx({ felicidade: 3 }); if (v.gtipo === 'familia') fx({ saude: 2 }); if (v.gtipo === 'partido') fx({ fama: 2 });
  if (out.length) addLog(out.join(' '));
}
async function vrPagarDivida() { const v = vrG(); if (!v.imp.divida) return; if (!pay(v.imp.divida)) return; v.imp.pagos += v.imp.divida; addLog(`🧾 Liquidaste a dívida à AGT (${kz(v.imp.divida)}). Estás em dia com o Estado.`, 'good'); v.imp.divida = 0; v.imp.anosDiv = 0; save(); refresh(); }
function vrFuga() { const v = vrG(); if (!v.fuga && !confirm('Fugir aos impostos? Poupas dinheiro agora, mas a AGT fiscaliza (cerca de 1 em 4 anos) e a multa é a dívida + 50%, com cadastro.')) return; v.fuga = !v.fuga; save(); renderPanel(true); }

/* ---------------- HUD: estrelas, fome/energia, cadeia, botões de ação ---------------- */
function vrBuildUI() {
  const hud = document.getElementById('hud'); if (!hud || document.getElementById('vrHud')) return;
  const d = document.createElement('div'); d.id = 'vrHud';
  d.innerHTML = `<div class="vrn" title="Fome"><span>🍲</span><i><b id="vrFome"></b></i></div><div class="vrn" title="Energia"><span>⚡</span><i><b id="vrEn"></b></i></div><div id="vrWl" class="hidden"></div><div id="vrSrv" class="hidden">🚔 EM SERVIÇO</div>`;
  d.onclick = () => openPanel('cidade', 'vida'); hud.appendChild(d);
  const j = document.createElement('div'); j.id = 'vrJail'; j.className = 'hidden'; hud.appendChild(j);
  const a = document.createElement('button'); a.id = 'vrAct'; a.className = 'hidden'; hud.appendChild(a);
  const hb = document.querySelector('.hbtns');
  if (hb && !document.getElementById('hbCidade')) { const b = document.createElement('button'); b.className = 'hb'; b.id = 'hbCidade'; b.title = 'Cidade'; b.onclick = () => openPanel('cidade'); b.innerHTML = '🏛<span class="bd hidden" id="vrBadge">!</span><small>Cidade</small>'; hb.appendChild(b); }
}
function vrHud() {
  if (!G || !document.getElementById('vrHud')) return;
  const v = vrG();
  const f = document.getElementById('vrFome'), e = document.getElementById('vrEn');
  f.style.width = v.fome + '%'; f.style.background = v.fome < 20 ? '#ff4d4d' : '#ff9f1a';
  e.style.width = v.energia + '%'; e.style.background = v.energia < 15 ? '#ff4d4d' : '#3fd0ff';
  const w = document.getElementById('vrWl'), wl = VR.wl || 0;
  w.classList.toggle('hidden', !wl); if (wl && w.dataset.n != wl) { w.dataset.n = wl; w.innerHTML = vrStars(wl); }
  document.getElementById('vrSrv').classList.toggle('hidden', !v.servico);
  const j = document.getElementById('vrJail'), p = vrPreso();
  j.classList.toggle('hidden', !p);
  if (p) { const s = Math.ceil((v.cadAte - Date.now()) / 1000); j.innerHTML = `🔒 Cadeia de Viana · <b>${s}s</b> <button onclick="vrFianca()">Fiança ${kzShort(vrFiancaV())}</button>`; }
}
function vrActBtn() {
  const a = document.getElementById('vrAct'); if (!a) return;
  let best = null;
  if (mode === 'game' && G && !vrPreso() && typeof MP !== 'undefined' && MP.room === 'rua' && !(typeof inInt !== 'undefined' && inInt)) for (const [id, o] of MP.others) if (o.d != null && o.d < 4.5 && (!best || o.d < best.o.d)) best = { id, o };
  const v = vrG();
  if (!best) { if (!a.classList.contains('hidden')) a.classList.add('hidden'); VR.near = null; return; }
  const arrest = v.servico && best.o.wl > 0 && best.o.d < 5;
  const key = best.id + ':' + arrest + ':' + best.o.nick;
  if (VR.near !== key) {
    VR.near = key; a.className = arrest ? 'arrest' : '';
    a.innerHTML = arrest ? `🚔 PRENDER ${esc(best.o.nick)} ${vrStarsF(best.o.wl)}` : `👥 ${esc(best.o.nick)}`;
    a.onclick = () => arrest ? vrPrender(best.id) : vrInteragir(best.id);
  }
}
function vrInteragir(id) {
  const o = MP.others.get(id); if (!o) return;
  const v = vrG(), am = VR.amigos && VR.amigos.amigos.some(a => a.id === id);
  openModal(`<div class="mico">👤</div><h3>${o.gt ? `<span class="vrgt">[${esc(o.gt)}]</span> ` : ''}${esc(o.nick)}</h3>
    <p style="opacity:.8;margin:-4px 0 10px">${esc(o.job || '')}${o.pol ? ' · 🚔 agente em serviço' : ''}${o.wl ? ` · <b style="color:#ff5a5a">procurado(a) ${vrStars(o.wl)}</b>` : ''}</p>
    ${(() => { const cc = MP.cfgs && MP.cfgs.get(id); if (!cc || !cc.cfg || typeof lookDesc !== 'function') return ''; let im = ''; try { im = avatarShot(cc.cfg, '#1c1a22', true, 160, true); } catch (e) { } return `<div class="vrlook">${im ? `<img src="${im}" alt="">` : ''}<div><b>Está a vestir</b><span>${esc(lookDesc(cc.cfg))}</span></div></div>`; })()}
    <div class="choices">
      <button class="btn btn-ghost" onclick="closeModal();mpOpen('@${esc(o.nick).replace(/'/g, '')} ')">💬 Falar</button>
      ${am ? '' : `<button class="btn btn-ghost" onclick="closeModal();vrAmigo('add',${id})">🤝 Pedir amizade</button>`}
      ${v.servico && o.wl ? `<button class="btn btn-pri" onclick="closeModal();vrPrender(${id})">🚔 Prender</button>` : ''}
      ${!v.servico && !o.pol ? `<button class="btn btn-ghost" onclick="closeModal();vrCrimeAsk('carteira',${id})">👛 Roubar a carteira</button><button class="btn btn-ghost" onclick="closeModal();vrCrimeAsk('assalto',${id})">🔪 Assaltar</button>` : ''}
      <button class="btn btn-ghost" onclick="closeModal()">Voltar</button></div>`);
}

/* ---------------- painel CIDADE ---------------- */
function vrNeedOnline(h) { return vrOnline() ? '' : noteBox('🌍 Esta parte é multijogador: entra com a tua conta online para veres os outros jogadores.', true); }
function vrOnlineUI() {
  let h = vrNeedOnline();
  const all = (VR.all || []).slice().sort((a, b) => (b.id === MP.me) - (a.id === MP.me) || (b.wl || 0) - (a.wl || 0) || String(a.nick).localeCompare(b.nick));
  const am = new Set(((VR.amigos && VR.amigos.amigos) || []).map(a => a.id));
  h += sec(`${all.length || (MP.online || 1)} jogador${(all.length || MP.online) === 1 ? '' : 'es'} online agora · ${VR.polOn} agente${VR.polOn === 1 ? '' : 's'} em serviço`);
  if (!all.length) h += noteBox(vrOnline() ? 'A carregar a lista…' : 'Offline: só tu na cidade.');
  if (vrOnline() && MP.sh) h += `<div class="vrshard">🌍 Estás em <b>Luanda ${MP.sh}</b> · ${MP.shOn}/${MP.shCap || 250} nesta cidade · ${MP.online} online no total${MP.shards.length > 1 ? '<br>Mudar para: ' + MP.shards.filter(([n]) => n !== MP.sh).map(([n, c]) => `<button class="chip" onclick="vrShard(${n})">Luanda ${n} · ${c}</button>`).join('') : ''}</div>`;
  h += `<div class="vrlist">${all.map(p => { const me = p.id === MP.me; return `<div class="vrp ${me ? 'me' : ''}"><i style="background:${mpColor(p.nick)}"></i><div><b>${p.gt ? `<span class="vrgt">[${esc(p.gt)}]</span> ` : ''}${esc(p.nick)}${me ? ' (tu)' : ''}</b><small>${esc(p.job || '—')} · ${esc(mpRoomName(p.room || 'rua'))}${p.vh ? ' · em viagem' : ''}</small></div>
    <span class="vrtags">${p.pol ? '<em class="pol">🚔 agente</em>' : ''}${p.cad ? '<em class="cad">🔒 preso</em>' : ''}${p.wl ? `<em class="wl">${vrStarsF(p.wl)}</em>` : ''}${am.has(p.id) ? '<em class="am">🤝 kamba</em>' : ''}</span>
    ${me ? '' : `<button class="chip" onclick="v4Perfil(${p.id})">👤</button><button class="chip" onclick="mpOpen('@${esc(p.nick).replace(/'/g, '')} ')">💬</button>${am.has(p.id) ? '' : `<button class="chip" onclick="vrAmigo('add',${p.id})">🤝</button>`}`}</div>`; }).join('')}</div>`;
  h += noteBox('Dica: toca em qualquer personagem de outro jogador (ou no 👤) para abrir o perfil: amizade, mensagem, dinheiro, presentes, convites, namoro, desafios e denúncia.');
  return h;
}
function vrShard(n) { MP.shWant = n; toast(`🌍 A mudar para Luanda ${n}…`); }
function vrPolUI() {
  const v = vrG(), wl = VR.wl || 0, podeP = vrPodePolicia();
  let h = sec('A tua ficha');
  h += list([
    infoItem('⭐', 'Procurado(a)', wl ? `<b style="color:#ff5a5a">${vrStars(wl)}</b> · baixa 1 estrela a cada 75 s sem crimes` : 'Não estás a ser procurado(a)'),
    infoItem('📜', 'Cadastro criminal', G.cadastro ? `Sim · prescreve com 5 anos sem crimes (${v.anosLimpo}/5)` : 'Limpo'),
    infoItem('🔒', 'Prisões', `${v.prisoes} · Crimes: ${v.crimes} · Saque total: ${kzShort(v.saque)}`),
    infoItem('👮', 'Detenções feitas', `${v.presosFeitos} procurados presos por ti`),
  ]);
  h += sec('Polícia (PvP em tempo real)');
  if (podeP) h += list([btnItem(v.servico ? '🚫' : '🚔', v.servico ? 'Sair de serviço' : 'Entrar de serviço', v.servico ? 'Estás a patrulhar: procurados a vermelho no radar, alertas de crimes, botão PRENDER quando estás ao lado' : 'Patrulha a cidade e prende jogadores procurados', '', 'vrServico()')]);
  else h += list([btnItem('🛡', 'Polícia Comunitária (voluntário)', 'Requisitos: 18 anos, sem cadastro, karma 40+. Ou candidata-te à Polícia Nacional no Centro de Emprego.', '', 'vrComunit()')]);
  if (v.servico) {
    const ws = [...MP.others.values()].filter(o => o.wl > 0).sort((a, b) => a.d - b.d);
    h += sec(`Procurados na tua zona (${ws.length})`) + (ws.length ? list(ws.map(o => infoItem('🚨', `${esc(o.nick)} <b style="color:#ff5a5a">${vrStarsF(o.wl)}</b>`, `a ${Math.round(o.d)} m · aproxima-te a menos de 5 m e toca em PRENDER`))) : noteBox('Ninguém procurado por perto. Os alertas de crime chegam aqui e no radar.'));
  }
  h += sec('Crimes (pensa nas consequências)');
  h += noteBox('O crime dá dinheiro rápido, mas dá estrelas de procurado, cadastro e cadeia. Com cadastro não entras na Polícia nem no banco.', true);
  h += list(VR_CRIMES.map(C => { const bl = vrBloqueioCrime(C); return btnItem(C.ico, C.t, `${C.d} · ${vrStarsF(C.stars)} · sucesso ${Math.round(C.pok * 100)}%${bl ? ` · <b style="color:#ff8a8a">${bl}</b>` : ''}`, kzShort(C.lo) + '–' + kzShort(C.hi), `vrCrimeAsk('${C.id}')`, !!bl); }));
  h += noteBox('Contra jogadores: aproxima-te de alguém na rua e toca no nome dele → Roubar a carteira / Assaltar. A vítima perde dinheiro de verdade e sabe quem foi.');
  return h;
}
function vrPolitUI() {
  vrLoad('pol');
  const gov = vrGov(), P = VR.pol, v = vrG(), O = VR_ORC[gov.orc] || VR_ORC.economia;
  let h = vrNeedOnline();
  h += sec('Governo de Luanda');
  h += list([infoItem('🏛', `${esc(gov.nick)} <small style="opacity:.7">· ${esc(gov.partido)}</small>`, `“${esc(gov.promessa)}”`),
    infoItem(O[0], 'Orçamento: ' + O[1], O[2] + ' (vale para todos os jogadores)'),
    infoItem('🧾', `IVA: ${gov.iva}%`, 'Imposto sobre o teu consumo anual — decidido pelo governo eleito')]);
  const el = P || VR.eleicao;
  if (el) {
    const fim = P ? P.fim : el.fim;
    h += sec(`Eleição nº ${P ? P.ronda : el.ronda} · fecha em ${Math.floor(fim / 60)} min ${fim % 60}s`);
    const cs = (P && P.cands) || [];
    if (!cs.length) h += noteBox('Ainda não há candidatos. Candidata-te e pede votos no chat!');
    h += list(cs.map(c => `<div class="item"><div class="ico">${(VR_ORC[c.orc] || O)[0]}</div><div class="tx"><div class="t1">${esc(c.nick)} <small style="opacity:.7">· ${esc(c.partido)}</small></div><div class="t2">“${esc(c.promessa)}” · ${VR_ORC[c.orc][1]} · IVA ${c.iva}%</div></div><div class="pr">${c.votos} voto${c.votos === 1 ? '' : 's'}</div>${P && !P.votei ? `<button class="chip" onclick="vrPolOp('votar',{cid:${c.uid}})">🗳 Votar</button>` : ''}</div>`));
    if (P && P.votei) h += noteBox('✔ Já votaste nesta eleição.');
  }
  if (P && !P.souCand) {
    const custo = v.gtipo === 'partido' ? 50000 : 100000;
    h += sec('Candidatar-me a Governador(a)') + `<div class="vrform">
      <input id="vrPPart" maxlength="24" placeholder="Nome do partido (ex.: Movimento Kianda)">
      <input id="vrPProm" maxlength="90" placeholder="A tua promessa (ex.: Luz e água em todos os bairros)">
      <select id="vrPOrc">${Object.entries(VR_ORC).map(([k, o]) => `<option value="${k}">${o[1]} — ${o[2]}</option>`).join('')}</select>
      <label>IVA proposto: <b id="vrPIvaV">14</b>% <input id="vrPIva" type="range" min="7" max="20" value="14" oninput="document.getElementById('vrPIvaV').textContent=this.value"></label>
      <button class="btn btn-pri" onclick="vrPolOp('candidatar')">🗳 Candidatar (${kzShort(custo)})</button>
      <small>Requisitos: 21 anos, sem cadastro, sem dívidas à AGT e fama 5+. Ganha quem tiver mais votos quando a eleição fechar.</small></div>`;
  } else if (P && P.souCand) h += list([btnItem('↩', 'Desistir da candidatura', 'Retira o teu nome desta eleição', '', "vrPolOp('desistir')")]);
  return h;
}
function vrImpUI() {
  const v = vrG(), I = vrImpostos(), gov = vrGov();
  let h = sec('Este ano (estimativa)');
  h += list([infoItem('💼', 'IRT — imposto sobre o salário', `Salário anual ${kzShort(I.sal)} · 0% até 1,2M · 10% até 6M · 17% até 24M · 25% acima`, kzShort(I.irt)),
    infoItem('🛒', `IVA ${gov.iva}% — consumo`, 'Sobre o custo de vida (comida, renda, telemóvel…) · taxa do governo eleito', kzShort(I.iva)),
    infoItem('🏠', 'IPU — imóveis', '0,5% do valor das casas que possuis', kzShort(I.ipu)),
    infoItem('🏪', 'Imposto Industrial', '4% do valor dos teus negócios', kzShort(I.ind)),
    infoItem('🧾', '<b>Total</b>', 'Cobrado automaticamente em cada +1 Ano', `<b>${kzShort(I.total)}</b>`)]);
  h += sec('A tua situação na AGT');
  h += list([infoItem('✔', 'Impostos pagos (vida)', '', kzShort(v.imp.pagos)), infoItem('⚠', 'Dívida ao Estado', v.imp.divida ? '+10% de juros por ano · ao 3º ano há penhora da poupança' : 'Nenhuma', kzShort(v.imp.divida))]);
  if (v.imp.divida) h += list([btnItem('🧾', 'Pagar a dívida toda', 'Fica em dia e volta a poder candidatar-te', kzShort(v.imp.divida), 'vrPagarDivida()')]);
  h += list([btnItem(v.fuga ? '✔' : '🕵', v.fuga ? 'Voltar a declarar impostos' : 'Fugir aos impostos', v.fuga ? 'Estás a fugir ao fisco: risco de fiscalização da AGT todos os anos' : 'Poupas agora… multa de 50% e cadastro se a AGT te apanhar', '', 'vrFuga()')]);
  if (v.imp.hist.length) h += sec('Histórico') + list(v.imp.hist.map(x => infoItem('📅', String(x.ano), `IRT ${kzShort(x.irt)} · IVA ${kzShort(x.iva)} · IPU ${kzShort(x.ipu)} · Ind. ${kzShort(x.ind)}${x.fuga ? ' · <b style="color:#ff8a8a">não declarado</b>' : ''}`, kzShort(x.total))));
  return h;
}
function vrGrupoUI() {
  vrLoad('grupo');
  let h = vrNeedOnline();
  const g = VR.grupo;
  if (g) {
    const T_ = VR_GT[g.tipo] || VR_GT.clube;
    h += sec('O teu grupo') + list([infoItem(T_[0], `[${esc(g.tag)}] ${esc(g.nome)}`, `${T_[1]} · ${esc(g.lema || '')}<br>Bónus: ${T_[2]}`)]);
    h += list([btnItem('💬', 'Chat do grupo', 'Só os membros leem', '', "closePanel();mpSetScope('grupo');mpOpen()"), btnItem('🚪', 'Sair do grupo', g.lider ? 'A liderança passa para o membro mais antigo' : '', '', "vrGrupoOp('sair')")]);
    h += sec(`Membros (${g.membros.length}/30)`) + `<div class="vrlist">${g.membros.map(m => `<div class="vrp"><i style="background:${mpColor(m.nick)}"></i><div><b>${esc(m.nick)}</b><small>${esc(m.cargo)} · ${m.on ? '🟢 ' + esc(mpRoomName(m.room || 'rua')) : 'offline'}</small></div><span></span>${g.lider && m.id !== MP.me ? `<button class="chip" onclick="vrGrupoOp('expulsar',{uid:${m.id}})">Expulsar</button>` : ''}</div>`).join('')}</div>`;
  } else if (vrOnline()) {
    h += sec('Fundar um grupo (50 000 Kz)') + `<div class="vrform"><input id="vrGNome" maxlength="24" placeholder="Nome (ex.: Kambas do Cazenga)"><input id="vrGTag" maxlength="4" placeholder="Sigla (2–4 letras, ex.: KDC)" style="text-transform:uppercase">
      <select id="vrGTipo">${Object.entries(VR_GT).map(([k, t]) => `<option value="${k}">${t[1]} — ${t[2]}</option>`).join('')}</select>
      <input id="vrGLema" maxlength="60" placeholder="Lema (opcional)"><button class="btn btn-pri" onclick="vrGrupoOp('criar')">👥 Fundar grupo</button></div>`;
  }
  const gs = VR.grupos || [];
  h += sec(`Grupos da cidade (${gs.length})`) + (gs.length ? list(gs.map(x => `<div class="item"><div class="ico">${(VR_GT[x.tipo] || VR_GT.clube)[0]}</div><div class="tx"><div class="t1">[${esc(x.tag)}] ${esc(x.nome)}</div><div class="t2">${(VR_GT[x.tipo] || VR_GT.clube)[1]} · ${x.n} membro${x.n === 1 ? '' : 's'} · ${x.on} online · líder ${esc(x.dono)}</div></div>${!g && vrOnline() ? `<button class="chip" onclick="vrGrupoOp('entrar',{gid:${x.id}})">Entrar</button>` : ''}</div>`)) : noteBox('Ainda não há grupos. Funda o primeiro!'));
  return h;
}
function vrAmigosUI() {
  vrLoad('amigos');
  let h = vrNeedOnline();
  const A = VR.amigos || { amigos: [], pedidos: [], enviados: [] };
  if (A.pedidos.length) h += sec(`Pedidos de amizade (${A.pedidos.length})`) + list(A.pedidos.map(p => `<div class="item"><div class="ico">🤝</div><div class="tx"><div class="t1">${esc(p.nick)}</div><div class="t2">quer ser teu kamba</div></div><button class="chip" onclick="vrAmigo('add',${p.id})">Aceitar</button><button class="chip" onclick="vrAmigo('del',${p.id})">Recusar</button></div>`));
  h += sec(`Kambas (${A.amigos.length})`) + (A.amigos.length ? `<div class="vrlist">${A.amigos.map(p => `<div class="vrp"><i style="background:${mpColor(p.nick)}"></i><div><b>${p.gt ? `<span class="vrgt">[${esc(p.gt)}]</span> ` : ''}${esc(p.nick)}</b><small>${p.on ? '🟢 online · ' + esc(p.job || '') + ' · ' + esc(mpRoomName(p.room || 'rua')) : '⚪ offline'}</small></div><span class="vrtags">${p.wl ? `<em class="wl">${vrStarsF(p.wl)}</em>` : ''}</span><button class="chip" onclick="v4Perfil(${p.id})">👤</button>${p.on ? `<button class="chip" onclick="mpOpen('@${esc(p.nick).replace(/'/g, '')} ')">💬</button>` : ''}<button class="chip" onclick="if(confirm('Remover dos amigos?'))vrAmigo('del',${p.id})">✕</button></div>`).join('')}</div>` : noteBox('Ainda não tens kambas online. Encontra jogadores na rua ou na lista Online.'));
  if (A.enviados.length) h += sec('Pedidos enviados') + list(A.enviados.map(p => infoItem('⏳', esc(p.nick), 'à espera de resposta')));
  if (vrOnline()) h += `<div class="vrform row"><input id="vrANick" maxlength="24" placeholder="Nick de um jogador online"><button class="btn btn-pri" onclick="vrAmigo('add',0,document.getElementById('vrANick').value)">🤝 Adicionar</button></div>`;
  h += noteBox(`Também tens ${G.amigos.length} amigo(s) da vida (personagens) — gere-os no telemóvel e no Diário.`);
  return h;
}
function vrVidaUI() {
  const v = vrG();
  let h = sec('Necessidades');
  h += `<div class="vrneeds"><div><span>🍲 Fome</span><i><b style="width:${v.fome}%;background:${v.fome < 20 ? '#ff4d4d' : '#ff9f1a'}"></b></i><em>${Math.round(v.fome)}</em></div><div><span>⚡ Energia</span><i><b style="width:${v.energia}%;background:${v.energia < 15 ? '#ff4d4d' : '#3fd0ff'}"></b></i><em>${Math.round(v.energia)}</em></div></div>`;
  h += noteBox('Razões: com fome a zero perdes saúde e andas mais devagar; sem energia não consegues correr. Come e dorme como na vida real.');
  h += sec('Comer') + list(VR_FOOD.map(F => { const longe = F[7] && !vrNearLoc(F[7], 34); return btnItem(F[1], F[2], F[3] + ` · +${F[5]} fome${F[6] ? ` · +${F[6]} energia` : ''}${longe ? ' · <b style="color:#ff8a8a">longe daqui</b>' : ''}`, kzShort(F[4]), `vrComer('${F[0]}')`, longe); }));
  h += sec('Descansar') + list([btnItem('🌙', 'Dormir em casa', 'Energia ao máximo e +2 saúde · tens de estar em casa', '', 'vrDormir(false)', !vrNearLoc('casa', 34)), btnItem('😴', 'Sesta no banco do jardim', '+30 energia em qualquer lado · 30% de risco de seres roubado(a)', '', 'vrDormir(true)')]);
  h += sec('Definições') + list([btnItem('🔋', `Modo Leve: ${LITE ? 'LIGADO' : 'desligado'}`, 'Para telemóveis fracos: sem sombras, menos gente e carros, resolução mais baixa (recarrega o jogo)', '', 'vrLite()')]);
  return h;
}
function vrLite() { try { localStorage.setItem('pe3d_lite', LITE ? '0' : '1'); } catch (e) { } save(); toast('🔋 A recarregar…'); setTimeout(() => location.reload(), 600); }
PANELS.cidade = {
  ico: '🏛', t: 'Cidade Viva', sub: () => `${vrOnline() ? (MP.online || 1) + ' online' : 'offline'} · Governo: ${esc(vrGov().nick)}${VR.wl ? ' · <b style="color:#ff5a5a">' + vrStarsF(VR.wl) + '</b>' : ''}`,
  tabs: [['online', '👥 Online', vrOnlineUI], ['policia', '🚔 Polícia', vrPolUI], ['politica', '🗳 Política', vrPolitUI], ['impostos', '🧾 Impostos', vrImpUI], ['grupo', '👥 Grupos', vrGrupoUI], ['amigos', '🤝 Amigos', vrAmigosUI], ['vida', '🍲 Vida', vrVidaUI]],
};

/* ---------------- ligações aos sistemas existentes ---------------- */
(function () {
  if (typeof LIVE !== 'undefined') {
    const _b = LIVE.mpBody, _o = LIVE.onMp;
    LIVE.mpBody = function () { const o = (_b ? _b.apply(this, arguments) : {}) || {}; try { Object.assign(o, vrMpBody()); } catch (e) { } return o; };
    LIVE.onMp = function (d) { const r = _o ? _o.apply(this, arguments) : undefined; try { vrOnMp(d); } catch (e) { console.error(e); } return r; };
  }
  // etiquetas: sigla do grupo, estrelas de procurado e distintivo de agente
  const _ap = mpApply;
  mpApply = function (ps) {
    const r = _ap.apply(this, arguments);
    for (const p of ps) {
      const o = MP.others.get(p.id); if (!o) continue;
      o.wl = p.wl || 0; o.pol = !!p.pol; o.gt = p.gt || null; o.cad = !!p.cad; o.job = p.job || '';
      const k = `${o.wl}|${o.pol}|${o.gt}`; if (o.vrK === k) continue; o.vrK = k;
      const nn = o.tag.querySelector('.nnick'); let x = nn.querySelector('.nvr'); if (!x) { x = document.createElement('em'); x.className = 'nvr'; nn.insertBefore(x, nn.querySelector('span')); }
      x.innerHTML = (o.pol ? '<b class="npol">🚔</b>' : '') + (o.gt ? `<b class="ngt">${esc(o.gt)}</b>` : '') + (o.wl ? `<b class="nwl">${vrStarsF(o.wl)}</b>` : '');
      o.tag.classList.toggle('wanted', o.wl > 0);
    }
    return r;
  };
  // âmbito do chat: Todos → Perto → Grupo
  const _ss = mpSetScope;
  mpSetScope = function (v) {
    const tem = G && G.vr && G.vr.gtag;
    if (v === undefined && MP.scope === 'perto' && tem) v = 'grupo'; else if (v === undefined && MP.scope === 'grupo') v = 'todos';
    if (v === 'grupo') {
      if (!tem) v = 'todos';
      else { MP.scope = 'grupo'; const b = document.getElementById('mpScope'); if (b) { b.className = 'grupo'; b.innerHTML = '👥 <span>Grupo</span>'; } const i = document.getElementById('mpIn'); if (i) i.placeholder = `Mensagem só para o grupo [${G.vr.gtag}]…`; mpWarn(`👥 Modo Grupo: só os membros de [${G.vr.gtag}] leem.`); return; }
    }
    return _ss.apply(this, [v].concat([].slice.call(arguments, 1)));
  };
  // radar: procurados a vermelho, alertas para a polícia
  const _dm = drawMinimap;
  drawMinimap = function () {
    _dm.apply(this, arguments);
    try {
      const c = minimapCtx; if (!c || !G || MP.room !== 'rua') return;
      const W = c.canvas.width, H = c.canvas.height, S = 1.05, t = performance.now();
      const serv = G.vr && G.vr.servico;
      for (const o of MP.others.values()) {
        if (!o.wl) continue;
        let X = W / 2 + (o.x - playerPos.x) * S, Z = H / 2 + (o.z - playerPos.z) * S; X = Math.max(6, Math.min(W - 6, X)); Z = Math.max(6, Math.min(H - 6, Z));
        c.strokeStyle = `rgba(255,40,40,${.5 + .5 * Math.sin(t / 150)})`; c.lineWidth = 2.5; c.beginPath(); c.arc(X, Z, 8 + (serv ? 3 : 0), 0, 7); c.stroke();
      }
      if (serv) for (const a of VR.alertas) {
        const age = (t - a.at) / 1000; if (age > 40 || a.room !== 'rua') continue;
        let X = W / 2 + (a.x - playerPos.x) * S, Z = H / 2 + (a.z - playerPos.z) * S; X = Math.max(8, Math.min(W - 8, X)); Z = Math.max(8, Math.min(H - 8, Z));
        c.fillStyle = `rgba(255,30,30,${.25 * (1 - age / 40)})`; c.beginPath(); c.arc(X, Z, 12 + (t / 60 % 10), 0, 7); c.fill();
      }
    } catch (e) { }
  };
  // ano: impostos, governo, grupos, cadastro
  const _au = ageUpLogic;
  ageUpLogic = function () { const r = _au.apply(this, arguments); if (r !== 'dead' && G && G.vivo) try { vrAnual(); } catch (e) { console.error(e); } return r; };
  const _aui = ageUpUI;
  ageUpUI = function () { if (G && G.vr && vrPreso()) return toast(`🔒 Estás na cadeia: espera ${Math.ceil((G.vr.cadAte - Date.now()) / 1000)} s ou paga a fiança.`); return _aui.apply(this, arguments); };
  // tempo real: fome, energia, estrelas, cadeia, botão de interação
  const _uw = updateWorld;
  updateWorld = function (dt) {
    const r = _uw.apply(this, arguments);
    try {
      if (!G || !G.vivo || mode !== 'game' || (typeof TR !== 'undefined' && TR)) return r;
      if (!document.getElementById('vrHud')) vrBuildUI();
      const v = vrG(), run = keys.ShiftLeft || keys.ShiftRight || (joy.active && Math.hypot(joy.x, joy.y) > .95);
      const k = (uiBlocked ? .4 : 1) * Math.min(dt, .5);
      const mov = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight || (joy.active && Math.hypot(joy.x, joy.y) > .15) || !!autoGo;
      v.fome = Math.max(0, v.fome - k / 40 * (run ? 1.2 : 1)); v.energia = Math.max(0, v.energia - k / 70 * (!mov ? .3 : run ? 1.6 : 1));
      VR.t += dt;
      if (VR.t > .33) {
        VR.t = 0; vrActBtn(); vrHud();
        if (!vrOnline() && v.wl > 0 && Date.now() - v.wlT > 75000) { v.wl--; v.wlT = Date.now(); VR.wl = v.wl; }
        if (v.cadRT && Date.now() >= v.cadAte && !(vrOnline() && VR.cadSrv > 1)) vrSoltar(false);
        if (!v.cadRT && G.preso > 0 && v.cadAte && Date.now() >= v.cadAte) { G.preso = 0; v.cadAte = 0; }
      }
      VR.hungerT += dt;
      if (VR.hungerT > 25) {
        VR.hungerT = 0;
        if (v.fome <= 0) { fx({ saude: -1, felicidade: -1 }); toast('🍲 Estás cheio(a) de fome! Perdes saúde. Come qualquer coisa (Cidade → Vida).'); refresh(); }
        else if (v.fome < 15) toast('🍲 Estás com fome. Come qualquer coisa (Cidade → Vida).');
        else if (v.energia < 10) toast('⚡ Estás exausto(a): já não consegues correr. Dorme ou bebe um café.');
      }
    } catch (e) { console.error(e); }
    return r;
  };
  // menu: atalho para o Modo Leve
  const _gm = gameMenu;
  gameMenu = function () { _gm.apply(this, arguments); const ch = document.querySelector('#modalBox .choices'); if (ch) { const b = document.createElement('button'); b.className = 'btn btn-ghost'; b.innerHTML = `🔋 Modo Leve: ${LITE ? 'LIGADO' : 'desligado'}`; b.onclick = vrLite; ch.insertBefore(b, ch.lastElementChild); } };
})();
