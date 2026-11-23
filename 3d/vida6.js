/* =========================================================
   VIDA REAL (vida6) — o dia a dia angolano a sério
   Contas da casa (ENDE, EPAL, gás, gerador, TV, net), documentos com filas
   e senhas no SIAC, paludismo e Hospital público vs clínica, gravidez e parto,
   família alargada, kixikila, kinguilas, rancho do mês, gasosa e multas,
   INSS e salários em atraso, Girabola ao vivo, batalha de kuduro, carnaval e domingo.
   Os preços são aproximados à realidade de Luanda, ajustados para o jogo.
   ========================================================= */
const V6 = { lastT: null, nextRT: 0, t0: 0, jogo: null, kud: null, rtQ: [] };
const V6_DIA_S = 360; // um dia de jogo = 6 minutos reais (ver world.js)

function v6G() {
  if (!G) return {};
  const novo = !G.v6;
  if (!G.v6) G.v6 = {};
  const d = {
    docs: {}, proc: [], fila: {}, casa: {}, mal: null, receita: null, seguro: 0, inss: 0, inssVol: false, pAdj: false,
    atraso: 0, kix: null, kixHist: [], multas: [], gasosas: 0, grav: null, dia: 0, famRep: 60, rt: true, rtN: 0,
    clube: null, gira: {}, kudDia: -1, kudN: 0, kudV: 0, carn: {}, cortes: 0, hoje: {}, despensa: 0, repel: -1,
    ipc: 1, cambio: 930, agiota: 0, domingo: '', culto: '', quintal: '', coro: -1, dizimo: 0, igrejaAjuda: 0, obito: 0, partos: 0,
  };
  for (const k in d) if (G.v6[k] === undefined) G.v6[k] = d[k];
  const c0 = { luz: 'ende', agua: 'epal', coz: 'gas', tv: 0, net: 0, ger: 0, filtro: 0, solar: 0, contador: 0, mosq: 0 };
  for (const k in c0) if (G.v6.casa[k] === undefined) G.v6.casa[k] = c0[k];
  if (novo) { // jogos antigos: quem já é adulto feito já tinha os documentos tratados
    if (G.idade >= 20 || G.emprego) G.v6.docs.bi = G.ano - Math.min(5, Math.max(0, G.idade - 18));
    if (G.viag && G.viag.pass) G.v6.docs.pass = G.ano;
    if (G.emprego) G.v6.inss = G.emprego.anos || 0;
    if (G.reformado) G.v6.pAdj = true;
    if (G.negocios && G.negocios.length) G.v6.docs.nif = G.ano;
    if (G.idade >= 25) G.v6.docs.eleitor = G.ano;
  }
  return G.v6;
}
const v6Aqui = (id, r = 34) => typeof vrNearLoc === 'function' ? vrNearLoc(id, r) : true;
const v6K = () => (cid().custo || 1);
const v6Hoje = () => (typeof mxDayKey === 'function' ? mxDayKey() : new Date().toDateString());
const v6Domingo = () => new Date().getDay() === 0;
const v6Seg = s => { s = Math.max(0, Math.ceil(s)); return s >= 60 ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s` : s + 's'; };
const v6Cd = ts => `<b class="v6cd" data-v6cd="${ts}">${v6Seg((ts - Date.now()) / 1000)}</b>`;
const v6Card = (t, body, cls = '') => `<div class="v6card ${cls}">${t ? `<b>${t}</b>` : ''}${body}</div>`;
const v6Muted = t => `<div class="v6muted">${t}</div>`;
function v6Done(txt, cls, anim) { addLog(txt, cls || ''); toast(strip(txt)); if (anim && typeof playerEmote === 'function') playerEmote(anim); checkConq(); if (G.stats.saude <= 0) return die('problemas de saúde'); save(); refresh(); }
function v6Zona() { try { return typeof casaZona === 'function' ? casaZona() : 'bairro'; } catch (e) { return 'bairro'; } }
function v6Pobre() { return ['musseque', 'zango'].includes(v6Zona()) || (G.casa && G.casa.tipo === 'rua'); }
function v6Chuvas() { const m = new Date().getMonth(); return m >= 9 || m <= 3; } // outubro a abril
function v6Formal() { return !!(G.emprego && !job(G.emprego.id).informal); }

/* =========================================================
   1. DOCUMENTOS · SIAC (Loja do Cidadão) com senhas e filas
   ========================================================= */
const V6_DOCS = {
  bi: { ico: '🪪', t: 'Bilhete de Identidade (BI)', p: 3500, pu: 10000, s: 240, su: 60, val: 10, min: 6, d: 'Pedem-no em todo o lado: emprego formal, banco, carta, passaporte e rusgas da polícia.' },
  atest: { ico: '📄', t: 'Atestado de Residência', p: 1500, s: 120, val: 1, min: 16, req: ['bi'], d: 'Passado pela Administração Municipal. Pedem para arrendar casa e para matrículas.' },
  registo: { ico: '📜', t: 'Registo Criminal', p: 2500, pu: 7000, s: 180, su: 45, val: 1, min: 16, req: ['bi'], d: 'Obrigatório para a função pública, polícia, segurança e bancos. Vale 1 ano.' },
  nif: { ico: '🧾', t: 'NIF · Número de Contribuinte (AGT)', p: 0, s: 60, val: 0, min: 14, req: ['bi'], d: 'Sem NIF não abres negócio, não passas faturas nem declaras impostos.' },
  eleitor: { ico: '🗳️', t: 'Cartão de Eleitor', p: 0, s: 60, val: 0, min: 18, req: ['bi'], d: 'Registo eleitoral. Sem ele não votas nem te candidatas.' },
  pass: { ico: '🛂', t: 'Passaporte (SME)', p: 25000, pu: 60000, s: 480, su: 120, val: 5, min: 18, req: ['bi'], d: 'Para viajar para fora do país. Vale 5 anos.' },
};
function v6DocOk(id) {
  const v = v6G(), a = v.docs[id], D = V6_DOCS[id];
  if (!a) return false;
  if (id === 'pass' && !(G.viag && G.viag.pass)) return false;
  return !D.val || G.ano - a < D.val;
}
function v6Proc(id) { return v6G().proc.find(p => p.id === id); }
function v6FilaKey(loc) { return loc === 'hospital' ? 'hosp' : 'siac'; }
function v6SenhaOk(k) { const s = v6G().fila[k], n = Date.now(); return !!(s && n >= s.chama && n <= s.ate); }
function v6Senha(k) {
  const v = v6G(), loc = k === 'hosp' ? 'hospital' : 'siac';
  if (!v6Aqui(loc)) return toast(`📍 Tens de estar no ${LOC_POS[loc].n} para tirar senha.`);
  const s = v.fila[k];
  if (s && Date.now() < s.ate) return toast('🎫 Já tens uma senha. Espera pela tua vez.');
  const seg = new Date().getDay() === 1 ? 1.3 : 1; // à segunda está sempre cheio
  const espera = Math.round((k === 'hosp' ? R(45, 95) : R(35, 75)) * seg);
  const n = (k === 'hosp' ? 'U' : 'A') + String(R(12, 98)).padStart(3, '0');
  v.fila[k] = { n, chama: Date.now() + espera * 1000, ate: Date.now() + (espera + 240) * 1000 };
  SND.play('tap'); toast(`🎫 Senha ${n}. Há ${Math.round(espera / 6)} pessoas à tua frente.`); save(); renderPanel(true);
}
function v6Facilitador(k) {
  const v = v6G(), s = v.fila[k];
  if (!s || Date.now() >= s.chama) return;
  if (!pay(3000)) return;
  v.gasosas++;
  if (chance(.25)) { v6Done(`🕴️ Um "facilitador" ficou com os teus 3.000 Kz e desapareceu. Continuas na fila. ${fx({ karma: -1, felicidade: -3 })}`, 'bad'); renderPanel(true); return; }
  s.chama = Date.now(); s.av = 0; v6Done(`🕴️ Pagaste 3.000 Kz a um "facilitador" e passaste à frente da fila toda. ${fx({ karma: -2 })}`); renderPanel(true);
}
function v6Agendar() {
  const v = v6G();
  if (G.tel < 2) return toast('📱 O agendamento online precisa de smartphone.');
  const s = v.fila.siac; if (s && Date.now() < s.ate) return toast('🎫 Já tens uma senha ativa.');
  v.fila.siac = { n: 'W' + String(R(10, 99)).padStart(3, '0'), chama: Date.now() + 20000, ate: Date.now() + 360000, web: 1 };
  toast('📲 Atendimento marcado no SIAC Digital! Vai ao SIAC: és atendido(a) daqui a 20 s, sem fila.'); save(); if (phoneApp) renderPhone(true);
}
function v6SenhaCard(k) {
  const s = v6G().fila[k], now = Date.now(), loc = k === 'hosp' ? 'hospital' : 'siac';
  if (!s || now > s.ate) return v6Card('🎫 Senha', v6Muted(k === 'hosp' ? 'Na consulta externa do hospital público é por ordem de chegada. Tira senha e espera (podes andar por aí).' : 'Tira uma senha para seres atendido(a) no guichê. À segunda-feira há sempre mais gente.') + list([btnItem('🎫', 'Tirar senha', v6Aqui(loc) ? 'A máquina está à entrada' : 'Tens de estar no local', 'Grátis', `v6Senha('${k}')`, !v6Aqui(loc))]) + (k === 'siac' && G.tel >= 2 ? v6Muted('Dica: na app Dia a Dia podes agendar no SIAC Digital e não apanhas fila.') : ''));
  if (now < s.chama) return v6Card(`🎫 Senha ${s.n}${s.web ? ' · agendada' : ''}`, `<div class="v6big">Falta ${v6Cd(s.chama)}</div>` + v6Muted('Podes sair e voltar: avisamos quando chamarem a tua senha.') + (s.web ? '' : list([btnItem('🕴️', 'Pagar a um "facilitador"', 'Passa à frente… se não for burla (karma −)', kzShort(3000), `v6Facilitador('${k}')`)])), 'wait');
  return v6Card(`🔔 Senha ${s.n}: é a tua vez!`, `<div class="v6big ok">Guichê ${1 + (s.n.charCodeAt(2) % 4)} · válida mais ${v6Cd(s.ate)}</div>`, 'ok');
}
function v6Pedir(id, modo) {
  const v = v6G(), D = V6_DOCS[id];
  if (!v6Aqui('siac')) return toast('📍 Vai ao SIAC (Mutamba) para tratar documentos.');
  if (!v6SenhaOk('siac')) return toast('🎫 Primeiro tira senha e espera que chamem o teu número.');
  if (G.idade < D.min) return toast(`Só a partir dos ${D.min} anos.`);
  const falta = (D.req || []).filter(r => !v6DocOk(r));
  if (falta.length) return toast('📄 Falta: ' + falta.map(r => V6_DOCS[r].t).join(', '));
  if (v6Proc(id)) return toast('Já tens esse pedido em curso.');
  let custo = modo === 'u' ? D.pu : D.p; if (modo === 'g') custo = D.p + 5000;
  if (!pay(custo)) return;
  let seg = modo === 'u' ? D.su : modo === 'g' ? 10 : D.s;
  if (modo === 'g') {
    v.gasosas++;
    if (chance(.2)) { G.dinheiro -= 50000; v6Done(`🚨 A fiscalização apanhou-te a dar "gasosa" ao funcionário do SIAC! Multa de 50.000 Kz e o pedido foi anulado. ${fx({ karma: -6, felicidade: -6 })}`, 'bad'); renderPanel(true); return; }
    fx({ karma: -3 });
  }
  v.proc.push({ id, pronto: Date.now() + seg * 1000, modo });
  v6Done(`${D.ico} Pediste o <b>${D.t}</b>${modo === 'u' ? ' com urgência' : modo === 'g' ? ' com uma "gasosa" por baixo da mesa' : ''}. Fica pronto daqui a ${v6Seg(seg)}${custo ? ` (${kz(custo)})` : ''}.`);
  renderPanel(true);
}
function v6Levantar(id) {
  const v = v6G(), p = v6Proc(id), D = V6_DOCS[id];
  if (!p || Date.now() < p.pronto) return;
  if (!v6Aqui('siac')) return toast('📍 Levanta os documentos no balcão de entregas do SIAC.');
  v.proc = v.proc.filter(x => x !== p); v.docs[id] = G.ano;
  if (id === 'pass' && typeof vhG === 'function') vhG().pass = 1;
  const primeiro = id === 'bi' && !v.biTeve; if (id === 'bi') v.biTeve = 1;
  v6Done(`${D.ico} Levantaste o teu <b>${D.t}</b>!${id === 'registo' ? (G.cadastro ? ' Diz que tens cadastro criminal…' : ' "Nada consta".') : ''} ${fx({ felicidade: primeiro ? 6 : 2 })}`, 'good', 'cheer');
  if (primeiro) flash('🪪 Já tens BI! Agora podes trabalhar com contrato.');
  renderPanel(true);
}
function v6DocItem(id) {
  const D = V6_DOCS[id], p = v6Proc(id), ok = v6DocOk(id), v = v6G(), aqui = v6Aqui('siac'), senha = v6SenhaOk('siac');
  const falta = (D.req || []).filter(r => !v6DocOk(r)).map(r => V6_DOCS[r].t);
  const tem = v.docs[id];
  let est = ok ? `<span class="v6ok">✔ válido${D.val ? ` até ${tem + D.val}` : ''}</span>` : tem ? '<span class="v6bad">caducado</span>' : '<span class="v6muted2">não tens</span>';
  if (p) est = Date.now() >= p.pronto ? '<span class="v6ok">pronto para levantar</span>' : `<span class="v6warn">em tratamento · ${v6Cd(p.pronto)}</span>`;
  let btns = '';
  if (p && Date.now() >= p.pronto) btns = chip('📥 Levantar', `v6Levantar('${id}')`, !aqui);
  else if (!p && !ok) {
    const dis = !aqui || !senha || falta.length || G.idade < D.min;
    btns = chip(`Normal · ${D.p ? kzShort(D.p) : 'grátis'}`, `v6Pedir('${id}','n')`, dis) + (D.pu ? chip(`⚡ Urgente · ${kzShort(D.pu)}`, `v6Pedir('${id}','u')`, dis) : '') + (D.p ? chip(`🤫 Gasosa · ${kzShort(D.p + 5000)}`, `v6Pedir('${id}','g')`, dis) : '');
  } else if (ok && D.val && G.ano - tem >= D.val - 1) btns = chip('Renovar', `v6Pedir('${id}','n')`, !aqui || !senha);
  return `<div class="item col"><div class="row"><div class="ico">${D.ico}</div><div class="tx"><div class="t1">${D.t} ${est}</div><div class="t2">${D.d}${falta.length ? ` · <b>Precisa de:</b> ${falta.join(', ')}` : ''}${G.idade < D.min ? ` · a partir dos ${D.min} anos` : ''} · demora ${v6Seg(D.s)}${D.su ? ` (urgente ${v6Seg(D.su)})` : ''}</div></div></div>${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;
}
function v6DocsUI() {
  const aqui = v6Aqui('siac');
  let h = (aqui ? '' : noteBox('📍 Estás longe do SIAC. Aqui vês o estado dos teus documentos; para pedir ou levantar tens de vir à Mutamba.', true)) + v6SenhaCard('siac');
  h += sec('Os teus documentos') + list(Object.keys(V6_DOCS).map(v6DocItem));
  h += v6Muted('Normal = mais barato e demora. Urgente = taxa oficial mais cara. "Gasosa" = suborno ao funcionário: rápido, mas é crime e a fiscalização apanha 1 em cada 5.');
  return h;
}
function v6FilaUI() {
  const v = v6G();
  let h = v6SenhaCard('siac');
  h += v6Card('📊 Como está o SIAC hoje', v6Muted(`${new Date().getDay() === 1 ? 'Segunda-feira: fila enorme, toda a gente veio tratar do que ficou do fim de semana.' : v6Domingo() ? 'Domingo: pouca gente, só atendimento rápido.' : 'Movimento normal. Ao fim da manhã a fila diminui.'} Já deste ${v.gasosas} "gasosa(s)" na vida.`));
  return h;
}
/* multas de trânsito e coimas */
function v6Multa(v_, mot) { const v = v6G(); v.multas.push({ v: Math.round(v_), mot, ano: G.ano }); save(); }
function v6MultaPagar(i) {
  const v = v6G(), m = v.multas[i]; if (!m) return;
  if (!pay(m.v)) return;
  v.multas.splice(i, 1); v6Done(`🧾 Pagaste a multa (${m.mot}): ${kz(m.v)}. ${fx({ karma: 1 })}`); renderPanel(true); if (phoneApp) renderPhone(true);
}
function v6MultaRecorrer(i) {
  const v = v6G(), m = v.multas[i]; if (!m || m.rec) return;
  m.rec = 1;
  if (chance(.3)) { v.multas.splice(i, 1); v6Done(`⚖️ Recorreste da multa (${m.mot}) e ganhaste! Foi anulada. ${fx({ felicidade: 4 })}`, 'good'); }
  else { m.v = Math.round(m.v * 1.1); v6Done(`⚖️ O recurso foi indeferido: a multa (${m.mot}) subiu 10% para ${kz(m.v)}.`, 'bad'); }
  renderPanel(true);
}
function v6MultasUI() {
  const v = v6G();
  let h = noteBox('🚔 Multas de trânsito e coimas ficam aqui até pagares. Se passar um ano sem pagar, o valor <b>duplica</b>. Também podes pagar pelo Palanca Pay na app Dia a Dia.');
  h += v.multas.length ? list(v.multas.map((m, i) => `<div class="item col"><div class="row"><div class="ico">🧾</div><div class="tx"><div class="t1">${esc(m.mot)} <span class="tag">${m.ano}</span></div><div class="t2">${kz(m.v)}${m.ano < G.ano ? ' · já duplicou' : ''}</div></div></div><div class="btns">${chip('Pagar ' + kzShort(m.v), `v6MultaPagar(${i})`)}${m.rec ? '' : chip('⚖️ Recorrer', `v6MultaRecorrer(${i})`)}</div></div>`)) : noteBox('✅ Não tens multas pendentes. Continua assim!');
  if (typeof vrImpUI === 'function') h += v6Muted('Impostos (IRT) e dívidas à AGT: Cidade → Impostos.');
  return h;
}

/* =========================================================
   2. CONTAS DA CASA (entram no custo de vida anual)
   ========================================================= */
const V6_LUZ = {
  ende: { ico: '💡', t: 'ENDE pós-pago (estimativa)', m: 12000, d: 'A fatura vem por estimativa: às vezes cobram mais do que gastaste.' },
  pre: { ico: '🔌', t: 'ENDE pré-pago (contador)', m: 8000, inst: 35000, own: 'contador', d: 'Pagas só o que gastas. Instalar o contador custa 35.000 Kz.' },
  puxada: { ico: '⚡', t: 'Puxada do vizinho ("gato")', m: 2500, d: 'Baratíssimo, mas ilegal: fiscalização, multas e risco de incêndio.' },
  solar: { ico: '☀️', t: 'Painéis solares', m: 0, inst: 650000, own: 'solar', d: 'Caro no início, mas sem faturas e quase sem cortes.' },
};
const V6_AGUA = {
  epal: { ico: '🚰', t: 'EPAL (água canalizada)', m: 5000, d: 'Barata, mas falta muitas vezes no bairro.' },
  cist: { ico: '🚚', t: 'Camião-cisterna para o tanque', m: 28000, d: 'Água sempre no tanque. Mas é cara.' },
  cac: { ico: '🪣', t: 'Chafariz / cacimba e bidões', m: 3000, d: 'Quase de graça, mas a água pode não ser segura (diarreia, cólera).' },
};
const V6_COZ = { gas: { ico: '🔥', t: 'Botija de gás 12 kg', m: 7500, d: 'Limpo e rápido.' }, carvao: { ico: '🪵', t: 'Carvão e fogareiro', m: 5500, d: 'Mais barato, mas o fumo faz mal à saúde.' } };
const V6_TV = [{ ico: '📺', t: 'Sem TV paga', m: 0, d: 'Só os canais abertos.' }, { ico: '📡', t: 'Kianda TV Satélite · Básico', m: 9000, d: 'Novelas, notícias e desenhos animados.' }, { ico: '⚽', t: 'Kianda TV Satélite · Premium', m: 25000, d: 'Girabola em direto, filmes e futebol europeu.' }];
const V6_NET = [{ ico: '📶', t: 'Só dados no telemóvel', m: 0, d: 'Pacotes da Mbote quando dá.' }, { ico: '📡', t: 'Router 4G Mbote', m: 15000, d: 'Internet em casa para estudar e trabalhar.' }, { ico: '🌐', t: 'Fibra Kianda Net', m: 35000, d: 'Rápida e estável: aulas online e trabalho remoto (+inteligência).' }];
const v6Indep = () => ['arrendada', 'propria'].includes(G.casa.tipo);
function v6Contas() {
  const v = v6G(), c = v.casa, L = [];
  if (!v6Indep()) return { mes: 0, total: 0, linhas: L };
  const add = (ico, t, m) => { if (m > 0) L.push([ico, t, m]); };
  add(V6_LUZ[c.luz].ico, V6_LUZ[c.luz].t, V6_LUZ[c.luz].m);
  if (c.ger) add('⛽', 'Gasóleo do gerador', c.luz === 'solar' ? 5000 : 20000);
  add(V6_AGUA[c.agua].ico, V6_AGUA[c.agua].t, V6_AGUA[c.agua].m);
  add(V6_COZ[c.coz].ico, V6_COZ[c.coz].t, V6_COZ[c.coz].m);
  add(V6_TV[c.tv].ico, V6_TV[c.tv].t, V6_TV[c.tv].m);
  add(V6_NET[c.net].ico, V6_NET[c.net].t, V6_NET[c.net].m);
  const mes = L.reduce((s, x) => s + x[2], 0);
  return { mes, total: Math.round(mes * 12 * v6K()), linhas: L };
}
function v6SetCasa(k, val) {
  const v = v6G(), c = v.casa;
  if (!v6Indep()) return toast('🏠 Só podes escolher os serviços quando tiveres casa tua (arrendada ou própria).');
  if (k === 'luz') {
    const L = V6_LUZ[val];
    if (L.own && !c[L.own]) { if (!pay(Math.round(L.inst * v6K()))) return; c[L.own] = 1; addLog(`${L.ico} Instalaste: ${L.t} (${kzShort(L.inst * v6K())}).`); }
    if (val === 'puxada' && !confirm('Fazer uma puxada ("gato") de luz? É ilegal: a ENDE pode multar-te e há risco de incêndio.')) return;
  }
  if (k === 'agua' && val === 'cist' && G.casa.tipo === 'arrendada' && casaT(G.casa.id) && casaT(G.casa.id).conforto < 3) toast('🚚 O camião-cisterna enche o tanque do quintal.');
  c[k] = (k === 'tv' || k === 'net') ? +val : val;
  v6Done(`🧾 Contas da casa: mudaste para <b>${(k === 'luz' ? V6_LUZ : k === 'agua' ? V6_AGUA : k === 'coz' ? V6_COZ : k === 'tv' ? V6_TV : V6_NET)[c[k]].t}</b>.`);
  renderPanel(true);
}
function v6Comprar(k) {
  const v = v6G(), c = v.casa;
  const P = { ger: [180000, '⛽ Compraste um gerador a gasóleo. Quando a luz falha, ele salva o jantar.'], filtro: [12000, '🚰 Compraste um filtro de água. Menos diarreias em casa!'] }[k];
  if (c[k]) return; if (!pay(Math.round(P[0] * v6K()))) return;
  c[k] = 1; v6Done(P[1], 'good'); renderPanel(true);
}
function v6Opts(k, TAB, cur) {
  return `<div class="v6opts">${(Array.isArray(TAB) ? TAB.map((x, i) => [i, x]) : Object.entries(TAB)).map(([id, x]) => {
    const on = String(cur) === String(id), inst = x.own && !v6G().casa[x.own] ? ` · instalar ${kzShort(x.inst * v6K())}` : '';
    return `<button class="v6opt ${on ? 'on' : ''}" onclick="v6SetCasa('${k}','${id}')" ${on ? 'disabled' : ''}><b>${x.ico} ${x.t}</b><small>${x.m ? kzShort(x.m) + '/mês' : 'sem mensalidade'}${inst}</small><em>${x.d || ''}</em></button>`;
  }).join('')}</div>`;
}
function v6ContasUI() {
  const v = v6G(), c = v.casa, b = v6Contas();
  let h = '';
  if (!v6Indep()) h += noteBox(G.casa.tipo === 'rua' ? '🏚️ Sem casa não há contas… mas também não há luz, água nem cama. Trabalha e arrenda casa na Imobiliária.' : '🏠 Vives com a família: as contas da casa são dos teus pais. Quando arrendares ou comprares casa, escolhes aqui a luz, a água, o gás, a TV e a internet.');
  h += v6Card('🧾 Contas deste mês', b.linhas.length ? `<div class="v6bill">${b.linhas.map(l => `<div><span>${l[0]} ${l[1]}</span><b>${kz(Math.round(l[2] * v6K()))}</b></div>`).join('')}<div class="tot"><span>Total por mês</span><b>${kz(Math.round(b.mes * v6K()))}</b></div><div class="tot"><span>Por ano (entra no custo de vida)</span><b>${kzShort(b.total)}</b></div></div>` : v6Muted('Sem contas por agora.'));
  if (!v6Indep()) return h;
  h += sec('💡 Luz') + v6Opts('luz', V6_LUZ, c.luz);
  h += list([c.ger ? infoItem('⛽', 'Gerador a gasóleo', `Liga sozinho nos cortes de luz · já houve ${v.cortes} corte(s) desde que vieste`, '✅') : btnItem('⛽', 'Comprar gerador', 'Nos cortes da ENDE não perdes a comida da geleira nem a novela', kzShort(180000 * v6K()), "v6Comprar('ger')")]);
  h += sec('🚰 Água') + v6Opts('agua', V6_AGUA, c.agua);
  h += list([c.filtro ? infoItem('🚰', 'Filtro de água', 'Protege contra diarreias e cólera', '✅') : btnItem('🚰', 'Comprar filtro de água', 'Reduz muito o risco de doenças da água', kzShort(12000 * v6K()), "v6Comprar('filtro')")]);
  h += sec('🔥 Cozinha') + v6Opts('coz', V6_COZ, c.coz);
  h += sec('📺 Televisão') + v6Opts('tv', V6_TV, c.tv);
  h += sec('🌐 Internet') + v6Opts('net', V6_NET, c.net);
  h += v6Muted('As faturas são cobradas no fim de cada ano, junto com o custo de vida. Escolhas baratas têm riscos; escolhas caras dão conforto.');
  return h;
}

/* =========================================================
   3. SAÚDE · paludismo, Hospital público vs clínica, seguro
   ========================================================= */
function v6MalInfetar() {
  const v = v6G(); if (v.mal) return;
  v.mal = { d: v.dia, fase: 1, test: false, trat: false };
  if (G.vr) G.vr.energia = Math.max(5, G.vr.energia - 25);
  addLog('🦟 Febre alta, calafrios, dores no corpo e na cabeça… Pode ser <b>paludismo</b>. Faz o teste no Hospital ou na Clínica!', 'bad');
  if (typeof p2Banner === 'function') p2Banner('🦟', 'O teu corpo', 'Febre alta e calafrios: pode ser paludismo. Faz o teste!', () => phoneOpenSafe('diaadia'));
  save(); refresh();
}
function v6MalRisco() {
  const v = v6G(); let p = .035;
  if (v6Chuvas()) p *= 1.8;
  if (v6Pobre()) p *= 1.7; else if (['talatona', 'miramar'].includes(v6Zona())) p *= .6;
  if (v.casa.mosq) p *= .3;
  if (v.repel === v.dia) p *= .5;
  if (v.casa.agua === 'cac') p *= 1.3;
  return Math.min(.25, p);
}
function v6MalDia() {
  const v = v6G(), m = v.mal;
  if (!m) { if (G.idade >= 1 && chance(v6MalRisco())) v6MalInfetar(); return; }
  if (m.trat) { v.mal = null; addLog('💊 Acabaste o tratamento e venceste o paludismo! ' + fx({ saude: 6, felicidade: 4 }), 'good'); return; }
  m.fase++;
  const dano = m.fase >= 3 ? R(10, 14) : R(5, 7);
  addLog(`🤒 ${m.fase >= 3 ? '<b>Paludismo grave!</b> Vómitos e febre de 40 °C. Vai à urgência do Hospital AGORA!' : 'O paludismo continua: febre e fraqueza.'} ${fx({ saude: -dano, felicidade: -3 })}`, 'bad');
  if (G.vr) G.vr.energia = Math.max(0, G.vr.energia - 20);
  if (m.fase === 3 && typeof p2Banner === 'function') p2Banner('🚑', 'Urgência', 'Paludismo grave! Vai já ao Hospital Geral (urgência sem senha).', () => phoneOpenSafe('diaadia'));
  if (G.stats.saude <= 0) die('complicações de paludismo');
}
function v6Teste(onde) {
  const v = v6G();
  if (onde === 'cli') { if (!v6Aqui('clinica')) return toast('📍 Vem à Clínica Bem-Estar.'); if (!pay(Math.round(8000 * v6K() * (v.seguro ? .3 : 1)))) return; }
  else { if (!v6Aqui('hospital')) return toast('📍 Vem ao Hospital Geral Kianda.'); if (!v6Urg() && !v6SenhaOk('hosp')) return toast('🎫 Tira senha e espera a tua vez.'); v.fila.hosp = null; }
  if (!v.mal) { v6Done(`🧪 Teste de paludismo: <b>negativo</b>. Deve ser só cansaço ou uma gripe. Bebe água e descansa. ${fx({ saude: 1 })}`); renderPanel(true); return; }
  v.mal.test = true;
  if (onde === 'cli') { v6Done(`🧪 Teste rápido: <b>positivo para paludismo</b>. O tratamento completo custa ${kz(Math.round(15000 * v6K() * (v.seguro ? .3 : 1)))}.`, 'bad'); }
  else if (chance(.55)) { v.mal.trat = true; v6Done(`🧪 Positivo para paludismo. O hospital deu-te o tratamento de graça (artemeter + lumefantrina, 3 dias). Amanhã já estás melhor. ${fx({ karma: 1 })}`, 'good'); }
  else { v.receita = 'mal'; v6Done('🧪 Positivo para paludismo. "Não há medicamento na farmácia do hospital, compra lá fora." Levas a receita: compra na farmácia do Mercado do Roque ou na app Dia a Dia.', 'bad'); }
  renderPanel(true);
}
function v6TratarCli() {
  const v = v6G(); if (!v.mal || !v.mal.test || v.mal.trat) return;
  if (!v6Aqui('clinica')) return toast('📍 Vem à Clínica.');
  if (!pay(Math.round(15000 * v6K() * (v.seguro ? .3 : 1)))) return;
  v.mal.trat = true; if (v.mal.fase >= 3) fx({ saude: 8 });
  v6Done('💊 Começaste o tratamento contra o paludismo na Clínica (com soro, se foi preciso). Amanhã estás melhor. ' + fx({ felicidade: 2 }), 'good'); renderPanel(true);
}
const v6Urg = () => { const v = v6G(); return G.stats.saude < 30 || (v.mal && v.mal.fase >= 3); };
function v6Consulta() {
  const v = v6G();
  if (!v6Aqui('hospital')) return toast('📍 Vem ao Hospital Geral Kianda (Baixa).');
  const urg = v6Urg();
  if (!urg && !v6SenhaOk('hosp')) return toast('🎫 Tira senha e espera a tua vez (ou vem à urgência se estiveres muito mal).');
  if (v.mal && !v.mal.trat) return v6Teste('pub');
  if (!urg) v.fila.hosp = null;
  if (urg && G.stats.saude < 30) fx({ saude: R(6, 10) });
  if (G.doente) {
    if (chance(.45)) { G.doente = false; v6Done(`🏥 O médico do hospital público tratou-te: ficaste curado(a)! Sem pagar nada. ${fx({ saude: R(8, 14), karma: 1 })}`, 'good'); }
    else { v.receita = 'doente'; v6Done('🏥 O médico passou-te uma receita, mas "não há medicamento". Tens de comprar na farmácia (15.000 Kz).', 'bad'); }
  } else v6Done(`🩺 Consulta no hospital público: tensão, peso e análises básicas. Está tudo bem. ${fx({ saude: R(2, 4) })}`);
  renderPanel(true);
}
function v6Farmacia(id) {
  const v = v6G();
  const P = {
    coartem: [3500, () => { if (v.mal && chance(.75)) { v.mal.trat = true; return '💊 Compraste antipalúdicos na farmácia do bairro sem teste. Desta vez acertaste: era paludismo e já estás a tratar.'; } return v.mal ? '💊 Compraste comprimidos sem receita… eram falsificados ou a dose errada. Faz o teste no hospital!' : '💊 Tomaste antipalúdicos sem teste… mas não tinhas paludismo. Dinheiro deitado fora. Faz sempre o teste!'; }],
    receita: [15000, () => { const r = v.receita; v.receita = null; if (r === 'mal' && v.mal) { v.mal.trat = true; return '💊 Compraste o medicamento da receita. O tratamento do paludismo começou.'; } if (r === 'doente' && chance(.85)) { G.doente = false; return '💊 Tomaste o medicamento da receita e ficaste curado(a)! ' + fx({ saude: 10 }); } return '💊 Tomaste o medicamento, mas ainda não melhoraste. Volta ao médico.'; }],
    mosq: [4500, () => { v.casa.mosq = 1; return '🦟 Compraste um mosquiteiro tratado com inseticida. O risco de paludismo cai muito.'; }],
    repel: [1500, () => { v.repel = v.dia; return '🧴 Repelente aplicado: hoje os mosquitos ficam longe.'; }],
    soro: [500, () => { if (G.vr) G.vr.energia = Math.min(100, G.vr.energia + 8); return '🥤 Soro oral: hidratação reposta. ' + fx({ saude: 1 }); }],
  }[id];
  if (!P) return;
  if (id === 'receita' && !v.receita) return toast('Não tens nenhuma receita por aviar.');
  if (id === 'mosq' && v.casa.mosq) return toast('Já tens mosquiteiro.');
  if (!pay(Math.round(P[0] * v6K()))) return;
  v6Done(P[1](), id === 'coartem' && !(v.mal && v.mal.trat) ? 'bad' : '');
  if (panelId) renderPanel(true); if (phoneApp) renderPhone(true);
}
function v6FarmaciaList() {
  const v = v6G(), k = v6K();
  return list([
    v.receita ? btnItem('📋', 'Aviar a receita do médico', v.receita === 'mal' ? 'Antipalúdicos que faltavam no hospital' : 'Medicamento para a tua doença', kzShort(15000 * k), "v6Farmacia('receita')") : '',
    btnItem('💊', 'Antipalúdico sem receita (auto-medicação)', 'Arriscado: sem teste não sabes se é paludismo', kzShort(3500 * k), "v6Farmacia('coartem')"),
    btnItem('🦟', 'Mosquiteiro tratado', v.casa.mosq ? 'Já tens um em casa' : 'A melhor proteção contra o paludismo (−70% risco)', kzShort(4500 * k), "v6Farmacia('mosq')", !!v.casa.mosq),
    btnItem('🧴', 'Repelente', v.repel === v.dia ? 'Já puseste hoje' : 'Protege durante um dia de jogo', kzShort(1500 * k), "v6Farmacia('repel')", v.repel === v.dia),
    btnItem('🥤', 'Soro de reidratação oral', 'Para o calor, diarreia e febre', kzShort(500 * k), "v6Farmacia('soro')"),
  ].filter(Boolean));
}
function v6MalCard() {
  const v = v6G(), m = v.mal;
  const risco = Math.round(v6MalRisco() * 100);
  if (!m) return v6Card('🦟 Paludismo (malária)', v6Muted(`É a doença que mais mata em Angola. ${v6Chuvas() ? '<b>Estamos na época das chuvas</b>: há muito mais mosquitos.' : 'Estamos no cacimbo: há menos mosquitos.'} O teu risco por dia: <b>${risco}%</b>${v.casa.mosq ? ' (tens mosquiteiro)' : ' · compra um mosquiteiro!'}.`));
  return v6Card(`🤒 Paludismo ${m.fase >= 3 ? 'GRAVE' : ''} · dia ${m.fase}`, v6Muted(m.trat ? 'Em tratamento: amanhã estás curado(a).' : m.test ? 'Teste positivo. Precisas do tratamento JÁ.' : 'Tens sintomas. Faz o teste (Hospital grátis, Clínica rápido).') + (m.fase >= 3 ? v6Muted('<b>Urgência:</b> no hospital és atendido(a) sem senha.') : ''), 'bad');
}
function v6HospConsUI() {
  const aqui = v6Aqui('hospital'), urg = v6Urg();
  let h = noteBox('🏥 <b>Hospital público</b>: as consultas são grátis, mas há fila e às vezes falta medicamento. Na <b>Clínica Bem-Estar</b> pagas, mas és atendido(a) logo.') + (urg ? noteBox('🚑 Estás muito mal: a urgência atende-te sem senha!', true) : v6SenhaCard('hosp'));
  h += v6MalCard();
  h += list([
    btnItem('🩺', 'Consulta externa', G.doente ? 'Tratar a tua doença (45% de cura aqui; se não, receita)' : 'Check-up gratuito', 'Grátis', 'v6Consulta()', !aqui || (!urg && !v6SenhaOk('hosp'))),
    btnItem('💉', 'Vacinar os filhos', G.filhos.some(f => f.idade < 6) ? 'Calendário de vacinas em dia (grátis)' : 'Não tens filhos pequenos', 'Grátis', 'v6Vacinar()', !aqui || !G.filhos.some(f => f.idade < 6) || v6G().vac === G.ano),
  ]);
  return h;
}
function v6HospMalUI() {
  const v = v6G(), aqui = v6Aqui('hospital');
  return v6MalCard() + (v6Urg() ? '' : v6SenhaCard('hosp')) + list([btnItem('🧪', 'Teste de paludismo (gota espessa)', 'No laboratório do hospital · grátis com senha', 'Grátis', "v6Teste('pub')", !aqui || (!v6Urg() && !v6SenhaOk('hosp')))]) + sec('Prevenção') + noteBox('🦟 Dorme com mosquiteiro, tapa os bidões de água e despeja as poças à volta de casa. Quem vive no musseque e usa água de cacimba tem mais risco.') + list([btnItem('🦟', 'Pedir mosquiteiro da campanha', v.mosqCamp === G.ano ? 'Já recebeste este ano' : 'Às vezes há campanhas grátis', 'Grátis', 'v6MosqCamp()', !aqui || v.mosqCamp === G.ano || v.casa.mosq)]);
}
function v6MosqCamp() {
  const v = v6G(); v.mosqCamp = G.ano;
  if (chance(.5)) { v.casa.mosq = 1; v6Done('🦟 Havia campanha: recebeste um mosquiteiro grátis do Ministério da Saúde!', 'good'); }
  else v6Done('🦟 "A campanha acabou na semana passada." Volta para o ano ou compra na farmácia.');
  renderPanel(true);
}
function v6Vacinar() {
  const v = v6G(); if (!v6Aqui('hospital')) return; v.vac = G.ano;
  G.filhos.filter(f => f.idade < 6).forEach(f => f.rel = clamp(f.rel + 3));
  v6Done('💉 Vacinaste os teus filhos (sarampo, pólio, febre-amarela). Pais responsáveis! ' + fx({ karma: 3, felicidade: 2 }), 'good'); renderPanel(true);
}
/* clínica privada: novos separadores */
function v6CliMalUI() {
  const v = v6G(), k = v6K() * (v.seguro ? .3 : 1), aqui = v6Aqui('clinica');
  return v6MalCard() + list([
    btnItem('🧪', 'Teste rápido de paludismo', 'Resultado em 15 minutos, sem fila' + (v.seguro ? ' · seguro paga 70%' : ''), kzShort(8000 * k), "v6Teste('cli')", !aqui),
    btnItem('💊', 'Tratamento completo (com soro se for grave)', v.mal && v.mal.test && !v.mal.trat ? 'Começa hoje' : 'Precisas de teste positivo primeiro', kzShort(15000 * k), 'v6TratarCli()', !aqui || !(v.mal && v.mal.test && !v.mal.trat)),
  ]) + sec('Farmácia da clínica') + v6FarmaciaList();
}
function v6SeguroUI() {
  const v = v6G(), pr = Math.round(18000 * 12 * v6K());
  let h = noteBox('🛡️ <b>Kianda Saúde</b> · seguro de saúde privado. Paga 70% das consultas e testes na Clínica e 80% do parto na clínica. A mensalidade entra no custo de vida anual.');
  h += list([v.seguro ? btnItem('🛡️', 'Seguro ativo', `${kz(Math.round(18000 * v6K()))}/mês · ${kzShort(pr)}/ano`, 'Cancelar', 'v6Seguro(0)') : btnItem('🛡️', 'Aderir ao Kianda Saúde', `${kz(Math.round(18000 * v6K()))}/mês · ${kzShort(pr)}/ano`, 'Aderir', 'v6Seguro(1)', G.idade < 18)]);
  if (v.seguro) h += list([btnItem('🩺', 'Consulta com seguro', G.doente ? 'Tratamento garantido da tua doença' : 'Check-up completo', kzShort(21000 * v6K()), 'v6ConsSeguro()', !v6Aqui('clinica'))]);
  return h;
}
function v6Seguro(on) { const v = v6G(); v.seguro = on ? G.ano : 0; v6Done(on ? '🛡️ Aderiste ao seguro de saúde Kianda Saúde.' : '🛡️ Cancelaste o seguro de saúde.'); renderPanel(true); }
function v6ConsSeguro() { if (!pay(Math.round(21000 * v6K()))) return; const was = G.doente; G.doente = false; v6Done((was ? '🩺 Com o seguro, a clínica tratou a tua doença! ' : '🩺 Check-up completo com o seguro. ') + fx({ saude: R(was ? 15 : 5, was ? 22 : 10) }), 'good'); renderPanel(true); }

/* gravidez: consultas pré-natais e parto */
function v6GravTxt() { const v = v6G(); if (!v.grav) return ''; return G.genero === 'F' ? 'Estás grávida' : `${(G.parceiro ? G.parceiro.nome.split(' ')[0] : 'A mãe do bebé')} está grávida`; }
function v6PreNatal(onde) {
  const v = v6G(); if (!v.grav) return;
  if (v.grav.cons >= 4) return toast('✅ Já fizeram as 4 consultas pré-natais recomendadas.');
  if (onde === 'pub') { if (!v6Aqui('hospital')) return toast('📍 No Hospital Geral.'); if (!v6SenhaOk('hosp')) return toast('🎫 Tira senha primeiro.'); v.fila.hosp = null; }
  else { if (!v6Aqui('clinica')) return toast('📍 Na Clínica.'); if (!pay(Math.round(25000 * v6K() * (v.seguro ? .3 : 1)))) return; }
  v.grav.cons++;
  v6Done(`🤰 Consulta pré-natal ${v.grav.cons}/4 ${onde === 'pub' ? 'no hospital público' : 'na clínica (com ecografia)'}: o bebé está a crescer bem! ${fx({ felicidade: 3, karma: 1 })}`, 'good'); renderPanel(true);
}
function v6MatUI(onde) {
  const v = v6G();
  let h = v.grav ? v6Card(`🤰 ${v6GravTxt()}`, `<div class="v6big">${v.grav.cons}/4 consultas pré-natais</div>` + v6Muted('O bebé nasce no próximo ano (quando fechares o ano). Mais consultas = parto mais seguro.')) : noteBox('🤰 Quando houver um bebé a caminho (Casa → Família), as consultas pré-natais fazem-se aqui.');
  if (onde === 'pub') h += (v.grav ? v6SenhaCard('hosp') : '') + list([btnItem('🤰', 'Consulta pré-natal', 'Grátis · com senha', 'Grátis', "v6PreNatal('pub')", !v.grav || !v6Aqui('hospital') || !v6SenhaOk('hosp'))]);
  else h += list([btnItem('🤰', 'Consulta pré-natal + ecografia', 'Sem fila' + (v.seguro ? ' · seguro paga 70%' : ''), kzShort(25000 * v6K() * (v.seguro ? .3 : 1)), "v6PreNatal('cli')", !v.grav || !v6Aqui('clinica'))]);
  h += v6Muted('Parto: na maternidade pública é grátis (leva o teu kit: lençóis, balde, luvas). Na clínica privada custa cerca de 450.000 Kz (o seguro paga 80%).');
  return h;
}
function v6Parto(tipo) {
  const v = v6G(), g = v.grav || { cons: 0 };
  let cust = { pub: 15000, cli: Math.round(450000 * v6K() * (v.seguro ? .2 : 1)), casa: 5000 }[tipo];
  let nota = '';
  if (tipo === 'cli' && G.dinheiro < cust) { tipo = 'pub'; cust = 15000; nota = 'Não havia dinheiro para a clínica: foram para a maternidade pública. '; }
  G.dinheiro -= cust;
  const risco = Math.max(.02, { pub: .14, cli: .05, casa: .25 }[tipo] - g.cons * .025);
  const sx = chance(.5) ? 'M' : 'F';
  const f = { nome: pick(sx === 'M' ? NOMES_M : NOMES_F), g: sx, idade: 0, rel: 100, escola: 'publica' };
  G.filhos.push(f); v.grav = null; v.partos++;
  if (G.parceiro) G.parceiro.rel = clamp(G.parceiro.rel + 8);
  let t = nota + `👶 Nasceu ${sx === 'M' ? 'o teu filho' : 'a tua filha'} <b>${f.nome}</b> ${tipo === 'pub' ? 'na maternidade pública' : tipo === 'cli' ? 'na clínica privada' : 'em casa, com a parteira do bairro'}! `;
  if (chance(risco)) t += (G.genero === 'F' ? 'O parto foi complicado e precisaste de cuidados extra. ' + fx({ saude: -R(8, 15), felicidade: 12 }) : 'O parto foi complicado e o bebé ficou uns dias na incubadora. ' + fx({ felicidade: 8 })) + ' Agora estão bem.';
  else t += fx({ felicidade: 20, karma: 3 });
  t += ` (${kz(cust)})`;
  return t;
}

/* =========================================================
   4. KIXIKILA · poupança rotativa (uma ronda por dia de jogo)
   ========================================================= */
const V6_KIX = [
  { id: 'peq', ico: '🧺', t: 'Kixikila das zungueiras', n: 5, q: 5000, risco: .03, d: '5 pessoas do mercado · 5.000 Kz por ronda' },
  { id: 'med', ico: '💼', t: 'Kixikila dos colegas', n: 8, q: 20000, risco: .04, d: '8 pessoas · 20.000 Kz por ronda', req: () => G.idade >= 18 ? '' : '18 anos' },
  { id: 'gra', ico: '💎', t: 'Kixikila das mamãs empresárias', n: 10, q: 100000, risco: .05, d: '10 pessoas · 100.000 Kz por ronda · só para quem tem nome', req: () => G.stats.fama >= 10 || G.negocios.length ? '' : 'fama 10+ ou um negócio' },
];
function v6KixEntrar(id, pos) {
  const v = v6G(), K = V6_KIX.find(k => k.id === id);
  if (v.kix) return toast('Já estás numa kixikila.');
  const why = K.req && K.req(); if (why) return toast('🔒 Requer ' + why + '.');
  if (G.idade < 14) return toast('Muito novo(a) para kixikila.');
  const bolo = K.n * K.q; let taxa = 0, p = R(1, K.n);
  if (pos === 'pri') { taxa = Math.round(bolo * .05); p = 1; } else if (pos === 'ult') p = K.n;
  if (taxa && !pay(taxa)) return;
  const nomes = []; while (nomes.length < K.n - 1) { const nm = pick(chance(.7) ? NOMES_F : NOMES_M); if (!nomes.includes(nm)) nomes.push(nm); }
  const membros = nomes.map(n => ({ n, fugiu: false })); membros.splice(p - 1, 0, { n: 'Tu', eu: true });
  v.kix = { id, ronda: 0, pos: p, membros, faltas: 0, bonus: pos === 'ult' ? .05 : 0, pagoT: 0 };
  v6Done(`🤝 Entraste na <b>${K.t}</b>. Recebes na ronda ${p} de ${K.n}${taxa ? ` (pagaste ${kzShort(taxa)} à mamã kixikila para receber primeiro)` : pos === 'ult' ? ' (aceitaste ser o último: ganhas +5%)' : ''}. Cada dia de jogo (6 min) há uma ronda.`); renderPanel(true);
}
function v6KixRonda() {
  const v = v6G(), x = v.kix; if (!x) return;
  const K = V6_KIX.find(k => k.id === x.id); x.ronda++;
  // alguém que já recebeu pode fugir com o dinheiro
  if (x.ronda > 1 && chance(K.risco)) { const cand = x.membros.filter((m, i) => !m.eu && !m.fugiu && i < x.ronda - 1); if (cand.length) { const m = pick(cand); m.fugiu = true; addLog(`🏃 Na kixikila, a ${m.n} desapareceu depois de receber! Agora o bolo é menor.`, 'bad'); fx({ felicidade: -3 }); } }
  if (G.dinheiro >= K.q) { G.dinheiro -= K.q; x.pagoT += K.q; }
  else { x.faltas++; v.famRep = clamp(v.famRep - 3); addLog(`⚠️ Não tinhas ${kzShort(K.q)} para a ronda ${x.ronda} da kixikila. ${x.faltas >= 2 ? 'Foste expulso(a) e perdeste o que já tinhas posto!' : 'As outras ficaram desconfiadas.'}`, 'bad'); if (x.faltas >= 2 && x.ronda <= x.pos) { v.kixHist.unshift({ t: K.t, r: -x.pagoT, ano: G.ano }); v.kix = null; return; } }
  if (x.ronda === x.pos) {
    const pagantes = x.membros.filter(m => !m.fugiu).length;
    const bolo = Math.round(pagantes * K.q * (1 + x.bonus));
    G.dinheiro += bolo; x.recebeu = bolo;
    addLog(`💰 Hoje é a tua vez na kixikila: recebeste <b>${kz(bolo)}</b>! ${fx({ felicidade: 6 })}`, 'good');
    if (typeof p2Banner === 'function') p2Banner('🤝', 'Kixikila', `Recebeste ${kzShort(bolo)}! É a tua vez.`, null);
    if (typeof SND !== 'undefined') SND.play('cash');
  }
  if (x.ronda >= K.n) {
    const r = (x.recebeu || 0) - x.pagoT;
    v.kixHist.unshift({ t: K.t, r, ano: G.ano }); v.kixHist = v.kixHist.slice(0, 6);
    addLog(`🤝 A ${K.t} terminou. Saldo final: ${r >= 0 ? '+' : ''}${kzShort(r)}.${r >= 0 ? ' Poupar em grupo funciona!' : ''}`, r >= 0 ? 'good' : 'bad');
    v.famRep = clamp(v.famRep + 2); v.kix = null;
  }
}
function v6KixSair() {
  const v = v6G(), x = v.kix; if (!x) return;
  if (x.recebeu) return toast('🚫 Já recebeste o teu bolo: tens de pagar até ao fim (senão és tu quem foge!).');
  if (!confirm('Sair da kixikila? Perdes o que já puseste.')) return;
  v.kixHist.unshift({ t: V6_KIX.find(k => k.id === x.id).t, r: -x.pagoT, ano: G.ano }); v.kix = null; v6Done('🤝 Saíste da kixikila antes do fim e perdeste o que já tinhas posto.', 'bad'); renderPanel(true);
}
function v6KixUI() {
  const v = v6G(), x = v.kix;
  let h = noteBox('🤝 <b>Kixikila</b>: um grupo põe o mesmo valor todas as rondas e, de cada vez, uma pessoa leva o bolo todo. É a poupança tradicional angolana. Risco: quem já recebeu pode fugir com o dinheiro.');
  if (x) {
    const K = V6_KIX.find(k => k.id === x.id), prox = Math.round((1 - dayT) * V6_DIA_S);
    h += v6Card(`${K.ico} ${K.t} · ronda ${x.ronda}/${K.n}`, `<div class="v6kix">${x.membros.map((m, i) => `<span class="${m.eu ? 'eu' : ''} ${m.fugiu ? 'fug' : ''} ${i < x.ronda ? 'rec' : ''} ${i === x.ronda ? 'next' : ''}"><i>${i + 1}</i>${esc(m.n)}${m.fugiu ? ' · fugiu' : ''}</span>`).join('')}</div>` +
      v6Muted(`Próxima ronda daqui a ~${v6Seg(prox)} (amanhã no jogo): pagas ${kz(K.q)}. ${x.recebeu ? `Já recebeste ${kzShort(x.recebeu)}.` : `Recebes na ronda ${x.pos}.`} Já puseste ${kzShort(x.pagoT)}.`) + list([btnItem('🚪', 'Sair da kixikila', x.recebeu ? 'Já recebeste: tens de ir até ao fim' : 'Perdes o que já puseste', '', 'v6KixSair()', !!x.recebeu)]));
  } else {
    h += sec('Grupos à procura de membros') + list(V6_KIX.map(K => { const why = K.req && K.req(); return `<div class="item col"><div class="row"><div class="ico">${K.ico}</div><div class="tx"><div class="t1">${K.t}</div><div class="t2">${K.d} · bolo ${kzShort(K.n * K.q)}${why ? ` · 🔒 requer ${why}` : ''}</div></div></div><div class="btns">${chip('🎲 Posição sorteada', `v6KixEntrar('${K.id}','rnd')`, !!why)}${chip(`1.º a receber (taxa ${kzShort(K.n * K.q * .05)})`, `v6KixEntrar('${K.id}','pri')`, !!why)}${chip('Último (+5%)', `v6KixEntrar('${K.id}','ult')`, !!why)}</div></div>`; }));
  }
  if (v.kixHist.length) h += sec('Kixikilas anteriores') + list(v.kixHist.map(k => infoItem('🤝', k.t, `${k.ano}`, `${k.r >= 0 ? '+' : ''}${kzShort(k.r)}`)));
  return h;
}

/* =========================================================
   5. KINGUILAS (câmbio de rua), RANCHO DO MÊS e FARMÁCIA
   ========================================================= */
function v6Taxa() { const v = v6G(); const of = Math.round(v.cambio * (1 + ((phHash(v6Hoje()) % 7) - 3) / 200)); return { of, rua: Math.round(of * 1.11), divisas: !!v.hoje.divisas }; }
function v6Usd(op, usd) {
  const v = v6G(), T = v6Taxa(); G.inv = G.inv || { bodiva: 0, cripto: 0, dolar: 0 };
  if (op === 'kin' || op === 'ban') {
    if (op === 'ban' && !T.divisas) return toast('🏦 "Hoje não há divisas." Tenta amanhã ou vai à kinguila.');
    const custo = Math.round(usd * (op === 'kin' ? T.rua : T.of * 1.02)); if (!pay(custo)) return;
    if (op === 'kin' && chance(.04)) { v6Done(`💵 A kinguila deu-te notas de 100 dólares <b>falsas</b>! Perdeste ${kz(custo)}. ${fx({ felicidade: -8 })}`, 'bad'); renderPanel(true); return; }
    G.inv.dolar += usd * T.of;
    v6Done(`💵 Compraste ${usd} USD ${op === 'kin' ? 'a uma kinguila na rua' : 'no banco à taxa oficial'} por ${kz(custo)}. Ficam na tua carteira de investimentos (Dólares).`);
  } else {
    if (G.inv.dolar < 1000) return toast('Não tens dólares guardados.');
    const kzv = Math.round(G.inv.dolar * (usd === 'all' ? 1 : .5)), rec = Math.round(kzv * 1.08);
    G.inv.dolar -= kzv; G.dinheiro += rec;
    v6Done(`💵 Vendeste ${Math.round(kzv / T.of)} USD a uma kinguila: recebeste ${kz(rec)} (8% acima do câmbio oficial).`);
  }
  renderPanel(true);
}
const V6_CESTA = [['🍚', 'Arroz (saco 25 kg)', 24000], ['🛢️', 'Óleo vegetal (5 L)', 9500], ['🌽', 'Fuba de milho (10 kg)', 7500], ['🫘', 'Feijão (5 kg)', 7000], ['🧂', 'Açúcar (5 kg)', 5500], ['🍗', 'Caixa de frango (10 kg)', 19000], ['🥚', 'Ovos (cartão de 30)', 4500], ['🧼', 'Sabão e detergente', 3500]];
function v6Cesta() { const v = v6G(), k = v6K() * Math.min(1.8, v.ipc); return V6_CESTA.map(([i, t, p]) => [i, t, Math.round(p * k / 50) * 50]); }
function v6Rancho(reg) {
  const v = v6G(), tot = v6Cesta().reduce((s, x) => s + x[2], 0);
  if (!v6Aqui('mercado', 40)) return toast('📍 O rancho barato é no Mercado do Roque.');
  if (v.despensa > v.dia) return toast('🧺 A despensa ainda está cheia.');
  let preco = tot, t = '';
  if (reg) { const ok = chance(.45 + G.stats.inteligencia / 300 + (talento('labia') ? .2 : 0)); if (ok) { preco = Math.round(tot * .85); t = 'Regateaste bem com a mamã: 15% de desconto! '; } else t = '"Isso aí não dá, meu filho!" A vendedora não baixou o preço. '; }
  if (!pay(preco)) return;
  v.despensa = v.dia + 3; if (G.vr) { G.vr.fome = Math.min(100, G.vr.fome + 60); G.vr.energia = Math.min(100, G.vr.energia + 10); }
  v6Done(`🧺 ${t}Fizeste o rancho do mês no Roque por ${kz(preco)}. Durante 3 dias de jogo comes em casa todas as manhãs. ${fx({ felicidade: 3 })}`, 'good'); renderPanel(true);
}
function v6KinUI() {
  const v = v6G(), T = v6Taxa(), k = v6K();
  let h = v6Card('💵 Câmbio de hoje', `<div class="v6bill"><div><span>🏦 Taxa oficial (banco)</span><b>${T.of} Kz / USD</b></div><div><span>🧍‍♀️ Kinguilas na rua</span><b>${T.rua} Kz / USD</b></div><div><span>🧳 Os teus dólares (valor)</span><b>${kzShort((G.inv && G.inv.dolar) || 0)}</b></div></div>` + v6Muted(T.divisas ? 'O banco tem divisas hoje.' : '<b>O banco não tem divisas hoje</b> — por isso toda a gente vai às kinguilas.'));
  h += list([
    btnItem('🧍‍♀️', 'Comprar 100 USD à kinguila', 'Rápido, sem papelada · 4% de risco de notas falsas', kzShort(100 * T.rua), "v6Usd('kin',100)"),
    btnItem('🧍‍♀️', 'Comprar 500 USD à kinguila', 'Para viagens ou para proteger da inflação', kzShort(500 * T.rua), "v6Usd('kin',500)"),
    btnItem('🏦', 'Comprar 500 USD no banco', T.divisas ? 'Taxa oficial + 2% de comissão' : 'Sem divisas hoje', kzShort(500 * T.of * 1.02), "v6Usd('ban',500)", !T.divisas || !v6DocOk('bi')),
    btnItem('💸', 'Vender metade dos dólares à kinguila', 'Pagam 8% acima da taxa oficial', '', "v6Usd('ven','half')", !(G.inv && G.inv.dolar >= 1000)),
  ]);
  const cesta = v6Cesta(), tot = cesta.reduce((s, x) => s + x[2], 0);
  h += sec('🧺 Rancho do mês · cesta básica no Roque') + `<div class="v6bill">${cesta.map(c => `<div><span>${c[0]} ${c[1]}</span><b>${kz(c[2])}</b></div>`).join('')}<div class="tot"><span>Total</span><b>${kz(tot)}</b></div></div>`;
  h += list([btnItem('🧺', 'Fazer o rancho', v.despensa > v.dia ? 'A despensa ainda está cheia' : 'Comida em casa por 3 dias de jogo (fome +60)', kzShort(tot), 'v6Rancho(0)', v.despensa > v.dia), btnItem('🗣️', 'Regatear com a mamã', 'Se correr bem, −15%', '−15%?', 'v6Rancho(1)', v.despensa > v.dia)]);
  h += v6Muted(`Os preços sobem com a inflação de ano para ano (índice atual ${v.ipc.toFixed(2)}).`);
  h += sec('💊 Farmácia do bairro') + v6FarmaciaList();
  return h;
}

/* =========================================================
   6. TRABALHO · INSS, salários em atraso e salários reais
   ========================================================= */
function v6Pensao() { const v = v6G(); if (v.inss < 15 || !G.emprego) return 360000; return Math.round(salario(G.emprego) * .45 * Math.min(1, v.inss / 30)); }
function v6InssVol() { const v = v6G(); v.inssVol = !v.inssVol; v6Done(v.inssVol ? '📑 Inscreveste-te no INSS como trabalhador(a) por conta própria: 96.000 Kz por ano contam para a reforma.' : '📑 Deixaste de descontar para o INSS.'); renderPanel(true); }
function v6IGT() {
  const v = v6G(); if (!v.atraso) return;
  doAct(0, () => {
    if (chance(.45)) { const a = v.atraso; G.dinheiro += a; v.atraso = 0; return `⚖️ Fizeste queixa na Inspeção Geral do Trabalho e a empresa pagou os salários em atraso: +${kzShort(a)}! ` + fx({ felicidade: 8 }); }
    if (G.emprego) G.emprego.desemp = clamp((G.emprego.desemp || 50) - 8);
    return '⚖️ A queixa na IGT ficou "em análise". O patrão soube e anda de cara feia contigo. ' + fx({ felicidade: -3 });
  }, 'think');
}
function v6DireitosUI() {
  const v = v6G(), e = G.emprego, J = e && job(e.id);
  let h = v6Card('📑 Segurança Social (INSS)', `<div class="v6bill"><div><span>Anos de descontos</span><b>${v.inss}</b></div><div><span>Reforma estimada</span><b>${kzShort(v6Pensao())}/ano</b></div></div>` + v6Muted(e ? (J.informal ? 'O teu trabalho é <b>informal</b>: ninguém desconta para o INSS por ti. Sem 15 anos de descontos, só tens a pensão social mínima.' : 'Trabalho com contrato: descontas 3% do salário e a empresa paga mais 8%. Com 30 anos de descontos tens a reforma completa (45% do salário).') : 'Sem emprego não há descontos. Os trabalhadores informais podem descontar por conta própria.'));
  h += list([btnItem('📑', v.inssVol ? 'A descontar por conta própria' : 'Descontar por conta própria', '96.000 Kz por ano · cada ano conta para a reforma', v.inssVol ? 'Parar' : 'Inscrever', 'v6InssVol()', v6Formal() || G.idade < 18)]);
  if (v.atraso) h += v6Card('⏳ Salários em atraso', `<div class="v6big bad">${kz(v.atraso)}</div>` + v6Muted('A empresa deve-te salários. Podes esperar (às vezes pagam no ano seguinte) ou fazer queixa na Inspeção Geral do Trabalho.') + list([btnItem('⚖️', 'Queixa na IGT', '45% de hipóteses de receber já · o patrão pode não gostar', '1 ⚡', 'v6IGT()')]), 'bad');
  const lista = JOBS.filter(j => !j.varFama && !j.varSeg && j.sal).sort((a, b) => a.sal - b.sal);
  const sel = lista.filter((j, i) => i % Math.max(1, Math.floor(lista.length / 18)) === 0 || (e && j.id === e.id));
  h += sec(`💰 Salários reais por mês em ${G.cidade.prov} (início de carreira)`) + `<div class="v6bill">${sel.map(j => `<div class="${e && j.id === e.id ? 'me' : ''}"><span>${j.ico} ${j.t}${j.informal ? ' <small>informal</small>' : ''}</span><b>${kz(Math.round(j.sal / 12 * (j.informal ? 1 : (cid().sal || 1)) / 500) * 500)}</b></div>`).join('')}</div>` + v6Muted('Valores do jogo, aproximados à realidade angolana. Promoções, cursos e qualificação aumentam o salário.');
  return h;
}

/* =========================================================
   7. CULTURA · Girabola ao vivo, kuduro, igreja, domingo, carnaval
   ========================================================= */
const V6_CLUBES = [['Petro de Luanda', 88], ['1.º de Agosto', 84], ['Sagrada Esperança', 76], ['Wiliete SC', 73], ['Interclube', 72], ['Kabuscorp', 70], ['Desportivo da Huíla', 70], ['Bravos do Maquis', 66], ['Académica do Lobito', 64], ['Luanda City', 63], ['São Salvador', 62], ['Progresso do Sambizanga', 62], ['Santa Rita de Cássia', 60], ['Sporting de Cabinda', 60]];
const V6_JOG = ['Kinito', 'Mabi', 'Tchico', 'Lukeny', 'Dany K.', 'Nelinho', 'Beto Kanga', 'Txuca', 'Mendes', 'Pedrito', 'Yuri', 'Zola', 'Mavinga', 'Gaspar', 'Fredy J.', 'Neblú Jr.', 'Kalunga', 'Tó Mbala'];
const V6_SLOT = 480000; // um jogo da jornada a cada 8 minutos reais (igual para todos)
function v6Jogo(slot) {
  const r = mxSeed('gira' + slot), n = V6_CLUBES.length;
  const hi = Math.floor(r() * n); let ai = Math.floor(r() * (n - 1)); if (ai >= hi) ai++;
  const H = V6_CLUBES[hi], A = V6_CLUBES[ai], sh = H[1] + 6, sa = A[1];
  const lh = 2.6 * sh / (sh + sa) * .62, la = 2.6 * sa / (sh + sa) * .62, ev = []; let gh = 0, ga = 0;
  for (let m = 1; m <= 90; m++) {
    if (r() < lh / 90 * 1.3) { gh++; ev.push({ m, k: 'gol', l: 'h', p: V6_JOG[Math.floor(r() * V6_JOG.length)] }); }
    else if (r() < la / 90 * 1.3) { ga++; ev.push({ m, k: 'gol', l: 'a', p: V6_JOG[Math.floor(r() * V6_JOG.length)] }); }
    else if (r() < .02) ev.push({ m, k: 'am', l: r() < .5 ? 'h' : 'a', p: V6_JOG[Math.floor(r() * V6_JOG.length)] });
    else if (r() < .022) ev.push({ m, k: 'op', l: r() < sh / (sh + sa) ? 'h' : 'a', p: V6_JOG[Math.floor(r() * V6_JOG.length)] });
  }
  const oh = Math.max(1.25, +((sh + sa) / sh * .95).toFixed(2)), oa_ = Math.max(1.25, +((sh + sa) / sa * 1.05).toFixed(2));
  return { slot, h: H[0], a: A[0], gh, ga, ev, odd: { 1: oh, X: 3.1, 2: oa_ } };
}
const v6Res = J => J.gh > J.ga ? '1' : J.gh < J.ga ? '2' : 'X';
function v6GiraComprar(tipo) {
  const v = v6G(), slot = Math.floor(Date.now() / V6_SLOT);
  if (!v6Aqui('ginasio', 45)) return toast('📍 Os bilhetes vendem-se no Estádio 11 de Novembro.');
  if (V6.jogo && !V6.jogo.fim) return toast('⚽ Já estás a ver um jogo!');
  if (v.gira.slot === slot) return toast('⚽ Já viste o jogo desta jornada. Próximo daqui a ' + v6Seg((V6_SLOT - Date.now() % V6_SLOT) / 1000) + '.');
  const T = { pop: [1500, 'Bancada popular'], cen: [4000, 'Bancada central'], vip: [20000, 'Tribuna VIP'] }[tipo];
  if (!pay(T[0])) return;
  let ap = V6.aposta; V6.aposta = null;
  if (ap && G.dinheiro < ap.v) { toast('💸 Sem dinheiro para a aposta: entras só para ver.'); ap = null; } else if (ap) G.dinheiro -= ap.v;
  v.gira.slot = slot; v.gira.n = (v.gira.n || 0) + 1;
  V6.jogo = { J: v6Jogo(slot), t0: Date.now(), tipo, ap, fim: false, shown: 0 };
  if (G.vr) G.vr.energia = Math.max(0, G.vr.energia - 6);
  toast(`🎟️ ${T[1]}: a entrar no estádio…`); save(); refresh(); renderPanel(true);
  if (typeof playerEmote === 'function') playerEmote('cheer');
}
function v6Apostar(p, val) { V6.aposta = V6.aposta && V6.aposta.p === p && V6.aposta.v === val ? null : { p, v: val }; renderPanel(true); }
function v6JogoMin() { const j = V6.jogo; return j ? Math.min(90, Math.floor((Date.now() - j.t0) / 500)) : 0; }
function v6JogoFim() {
  const j = V6.jogo, v = v6G(); if (!j || j.fim) return; j.fim = true;
  const J = j.J, res = v6Res(J); let t = `⚽ Final no 11 de Novembro: <b>${J.h} ${J.gh}–${J.ga} ${J.a}</b>. `;
  const f = { felicidade: j.tipo === 'vip' ? 5 : 3 };
  if (v.clube) { const lado = v.clube === J.h ? '1' : v.clube === J.a ? '2' : null; if (lado) { if (res === lado) { t += `O teu ${v.clube} ganhou! A bancada foi abaixo! `; f.felicidade += 6; } else if (res === 'X') t += `Empate do ${v.clube}. `; else { t += `O ${v.clube} perdeu… `; f.felicidade -= 5; } } }
  if (j.ap) { if (j.ap.p === res) { const g = Math.round(j.ap.v * J.odd[res]); G.dinheiro += g; t += `Ganhaste a aposta: +${kzShort(g)}! `; } else t += `Perdeste a aposta de ${kzShort(j.ap.v)}. `; }
  if (j.tipo === 'vip' && chance(.3)) { t += 'Na tribuna VIP conheceste um empresário importante. '; f.fama = 1; }
  v6Done(t + fx(f), 'good', 'cheer'); if (typeof mxAdd === 'function') mxAdd('girabola');
  if (panelId) renderPanel(true);
}
function v6JogoTick() {
  const j = V6.jogo; if (!j || j.fim) return;
  const m = v6JogoMin(), J = j.J;
  const novos = J.ev.filter(e => e.m <= m && e.m > (j.shown || 0));
  j.shown = m;
  novos.forEach(e => { if (e.k === 'gol') { if (typeof SND !== 'undefined') SND.play('cash'); if (!panelId) toast(`⚽ GOLO ${e.l === 'h' ? J.h : J.a}! ${e.p} (${e.m}')`); } });
  const el = document.getElementById('v6Placar'); if (el) el.outerHTML = v6PlacarHTML();
  if (m >= 90) v6JogoFim();
}
function v6PlacarHTML() {
  const j = V6.jogo; if (!j) return '';
  const m = v6JogoMin(), J = j.J, evs = J.ev.filter(e => e.m <= m), gh = evs.filter(e => e.k === 'gol' && e.l === 'h').length, ga = evs.filter(e => e.k === 'gol' && e.l === 'a').length;
  const txt = e => e.k === 'gol' ? `⚽ GOLO! ${e.p} marca para o ${e.l === 'h' ? J.h : J.a}` : e.k === 'am' ? `🟨 Cartão amarelo para ${e.p} (${e.l === 'h' ? J.h : J.a})` : `😱 ${e.p} falha por pouco! (${e.l === 'h' ? J.h : J.a})`;
  return `<div id="v6Placar" class="v6placar"><div class="sc"><span>${J.h}</span><b>${gh} – ${ga}</b><span>${J.a}</span></div><div class="mn">${m >= 90 ? 'FINAL' : m < 45 ? `1.ª parte · ${m}'` : `2.ª parte · ${m}'`}</div><div class="bar"><i style="width:${m / .9}%"></i></div><div class="tl">${evs.slice(-5).reverse().map(e => `<div><em>${e.m}'</em>${txt(e)}</div>`).join('') || '<div>Bola ao centro! O estádio canta.</div>'}</div>${j.ap ? `<div class="ap">Aposta: ${j.ap.p === '1' ? J.h : j.ap.p === '2' ? J.a : 'Empate'} · ${kzShort(j.ap.v)}</div>` : ''}</div>`;
}
function v6Clube(n) { v6G().clube = n; v6Done(`⚽ Agora és adepto(a) do <b>${n}</b>!`); renderPanel(true); }
function v6GiraUI() {
  const v = v6G(), now = Date.now(), slot = Math.floor(now / V6_SLOT), J = v6Jogo(slot), aqui = v6Aqui('ginasio', 45);
  let h = '';
  if (V6.jogo && !V6.jogo.fim) return v6PlacarHTML() + v6Muted('O jogo dura 45 segundos. Podes fechar o painel: o resultado aparece no fim.');
  if (V6.jogo && V6.jogo.fim && V6.jogo.J.slot === slot) h += v6PlacarHTML();
  const visto = v.gira.slot === slot;
  h += v6Card(`⚽ Girabola · jornada ao vivo`, `<div class="v6vs"><b>${J.h}</b><span>vs</span><b>${J.a}</b></div>` + v6Muted(visto ? `Já viste este jogo. Próximo jogo daqui a ${v6Cd((slot + 1) * V6_SLOT)}.` : `Este jogo é igual para todos os jogadores. Próximo jogo daqui a ${v6Cd((slot + 1) * V6_SLOT)}.`));
  if (!visto) {
    h += sec('🎯 Palpite (opcional, antes de entrares)') + `<div class="v6opts three">${['1', 'X', '2'].map(p => `<div class="v6col"><small>${p === '1' ? J.h : p === '2' ? J.a : 'Empate'} · odd ${J.odd[p]}</small>${[1000, 5000, 20000].map(val => `<button class="chip ${V6.aposta && V6.aposta.p === p && V6.aposta.v === val ? 'on' : ''}" onclick="v6Apostar('${p}',${val})">${kzShort(val)}</button>`).join('')}</div>`).join('')}</div>`;
    h += sec('🎟️ Bilhetes') + list([
      btnItem('🎟️', 'Bancada popular', 'Muita festa, batuque e kuduro na bancada', kzShort(1500), "v6GiraComprar('pop')", !aqui || G.idade < 6),
      btnItem('🎟️', 'Bancada central', 'Vês o jogo todo de frente', kzShort(4000), "v6GiraComprar('cen')", !aqui),
      btnItem('🥂', 'Tribuna VIP', 'Ar condicionado, petiscos e gente importante', kzShort(20000), "v6GiraComprar('vip')", !aqui || G.idade < 16),
    ]) + (aqui ? '' : noteBox('📍 Os bilhetes vendem-se aqui no Estádio 11 de Novembro.', true));
  }
  h += sec('❤️ O teu clube') + (v.clube ? noteBox(`És adepto(a) do <b>${v.clube}</b>. Quando ganha, ficas mais feliz.`) : '') + `<div class="v6clubes">${V6_CLUBES.map(c => `<button class="chip ${v.clube === c[0] ? 'on' : ''}" onclick="v6Clube('${c[0]}')">${c[0]}</button>`).join('')}</div>`;
  const ult = [1, 2, 3, 4].map(i => v6Jogo(slot - i));
  h += sec('📋 Últimos resultados') + list(ult.map(x => infoItem('⚽', `${x.h} ${x.gh}–${x.ga} ${x.a}`, x.ev.filter(e => e.k === 'gol').map(e => `${e.p} ${e.m}'`).join(', ') || 'Sem golos', '')));
  return h;
}
/* batalha de kuduro na discoteca */
const V6_MOV = [['acro', '🤸', 'Mortal e cabeça no chão', 'Acrobacia vence Estilo'], ['estilo', '🕺', 'Passo do toque com estilo', 'Estilo vence Humor'], ['humor', '😂', 'Dança cómica que põe a pista a rir', 'Humor vence Acrobacia']];
const V6_RIVAIS = ['Puto Fogo', 'Kota Rebita', 'Mana Kuyela', 'Tchico Robot', 'Lady Kuduro', 'Mano Choque', 'Rainha da Pista', 'Kid Tremor'];
function v6KudStart() {
  const v = v6G();
  if (!v6Aqui('farra', 40)) return toast('📍 As batalhas são na Discoteca Kizomba (Ilha).');
  if (G.idade < 16) return toast('Só a partir dos 16 anos.');
  if (v.kudDia === v.dia && v.kudN >= 3) return toast('🥵 Já fizeste 3 batalhas hoje. Volta amanhã (no jogo).');
  if (G.vr && G.vr.energia < 20) return toast('😴 Estás sem energia para dançar. Come ou dorme.');
  if (!pay(2000)) return;
  if (v.kudDia !== v.dia) { v.kudDia = v.dia; v.kudN = 0; } v.kudN++;
  V6.kud = { riv: pick(V6_RIVAIS), lv: R(35, 75) + Math.min(20, (v.kudV || 0) * 2), r: 0, eu: 0, ele: 0, log: [] };
  closePanel(); v6KudRender();
}
function v6KudRender(fim) {
  const K = V6.kud; if (!K) return;
  const hist = K.log.map(l => `<div class="${l.w === 1 ? 'g' : l.w === -1 ? 'r' : ''}">${l.t}</div>`).join('');
  const body = fim ? `<div class="result">${fim}</div><div class="choices"><button class="btn btn-yel" onclick="closeModal()">Continuar</button></div>`
    : `<div class="choices">${V6_MOV.map((m, i) => `<button class="choice" onclick="v6KudMov(${i})">${m[1]} ${m[2]}<small>${m[3]}</small></button>`).join('')}</div>`;
  openModal(`<div class="mico">🔥</div><h3>Batalha de Kuduro</h3><p class="center">Ronda ${Math.min(3, K.r + 1)} de 3 contra <b>${K.riv}</b> · <b>${K.eu} – ${K.ele}</b></p><div class="v6tl">${hist}</div>${body}`, false);
}
function v6KudMov(i) {
  const K = V6.kud, v = v6G(); if (!K || K.r >= 3) return;
  const meu = V6_MOV[i], j = Math.floor(Math.random() * 3), dele = V6_MOV[j];
  const ganha = { acro: 'estilo', estilo: 'humor', humor: 'acro' };
  let w = 0, extra = '';
  if (meu[0] === 'acro' && G.stats.saude < 45 && chance(.35)) { w = -1; extra = ' Escorregaste no mortal!'; }
  else if (ganha[meu[0]] === dele[0]) w = 1; else if (ganha[dele[0]] === meu[0]) w = -1;
  else { const st = { acro: G.stats.saude, estilo: G.stats.aparencia, humor: G.stats.felicidade }[meu[0]] + G.stats.fama / 2; w = st + R(-15, 15) >= K.lv ? 1 : -1; extra = ' Mesmo estilo: decidiu a malta.'; }
  K.r++; if (w > 0) K.eu++; else K.ele++;
  K.log.push({ w, t: `${meu[1]} Tu: ${meu[2]} · ${dele[1]} ${K.riv}: ${dele[2]} → ${w > 0 ? 'a pista gritou por ti!' : 'a malta preferiu o rival.'}${extra}` });
  if (typeof playerEmote === 'function') playerEmote('kuduro'); if (typeof SND !== 'undefined') SND.play('tap');
  if (K.eu >= 2 || K.ele >= 2 || K.r >= 3) {
    const win = K.eu > K.ele; if (G.vr) G.vr.energia = Math.max(0, G.vr.energia - 15);
    let t;
    if (win) { const pr = Math.min(60000, 10000 + G.stats.fama * 400 + (v.kudV || 0) * 1500); v.kudV = (v.kudV || 0) + 1; G.dinheiro += pr; t = `🏆 Ganhaste a batalha de kuduro contra ${K.riv}! Prémio ${kz(pr)}. Alguém filmou e está a circular no Bwé Social. ${fx({ fama: 2, felicidade: 6 })}`; if (G.tel >= 2) G.seg = (G.seg || 0) + R(20, 120); }
    else t = `😅 ${K.riv} levou a melhor esta noite. A malta gozou um bocado, mas aplaudiu. ${fx({ felicidade: -2, saude: 1 })}`;
    addLog('🔥 <b>Batalha de Kuduro:</b> ' + t, win ? 'good' : ''); save(); refresh(); V6.kud = null; return v6KudRender(t);
  }
  v6KudRender();
}
function v6KudUI() {
  const v = v6G(), restam = v.kudDia === v.dia ? 3 - v.kudN : 3;
  return noteBox('🔥 <b>Batalha de Kuduro</b>: 3 rondas contra um dançarino da casa. Acrobacia vence Estilo, Estilo vence Humor, Humor vence Acrobacia. Saúde ajuda nas acrobacias, aparência no estilo, felicidade no humor e a fama puxa pela plateia.') +
    list([btnItem('🔥', 'Entrar na roda', `Inscrição 2.000 Kz · restam ${Math.max(0, restam)} batalhas hoje · vitórias: ${v.kudV || 0}`, kzShort(2000), 'v6KudStart()', restam <= 0 || G.idade < 16 || !v6Aqui('farra', 40))]) +
    (typeof mxEvento === 'function' && mxEvento().id === 'kizomba' ? noteBox('💃 Festival de Kizomba na Ilha: a discoteca está cheia, os prémios são maiores!') : '');
}
/* igreja e domingo */
function v6Culto() {
  const v = v6G(), hoje = v6Hoje(); if (v.culto === hoje) return toast('🙏 Já foste ao culto hoje.');
  doAct(0, () => { v.culto = hoje; const dom = v6Domingo(); v.famRep = clamp(v.famRep + (dom ? 3 : 1)); return dom ? '⛪ Culto de domingo: a igreja cheia, o coro a cantar e a família toda bem vestida. ' + fx({ felicidade: 7, karma: 3 }) : '⛪ Culto de semana: pouca gente, muita paz. ' + fx({ felicidade: 3, karma: 2 }); }, 'pray');
}
function v6Dizimo() {
  const v = v6G(); if (v.dizimo === G.ano) return toast('Já deste o dízimo este ano.');
  const val = Math.max(1000, Math.round((G.emprego ? salario(G.emprego) / 12 : 20000) * .1 / 100) * 100);
  if (!pay(val)) return; v.dizimo = G.ano; v6Done(`🙏 Deste o dízimo (${kz(val)}, 10% de um mês). O pastor agradeceu no fim do culto. ${fx({ karma: 3, felicidade: 2 })}`); renderPanel(true);
}
function v6Coro() { const v = v6G(); if (v.coro === v.dia) return toast('🎶 O ensaio do coro de hoje já foi.'); doAct(0, () => { v.coro = v.dia; return '🎶 Ensaiaste com o coro da igreja. A tua voz está a melhorar! ' + fx({ felicidade: 4, fama: 1 }); }, 'pray'); }
function v6AjudaIgreja() { const v = v6G(); if (v.igrejaAjuda === G.ano) return; v.igrejaAjuda = G.ano; G.dinheiro += 15000; v6Done('🧺 A igreja deu-te uma cesta básica e 15.000 Kz da caixa de solidariedade. ' + fx({ felicidade: 3 }), 'good'); renderPanel(true); }
function v6CasaIgreja() { const p = G.parceiro; if (!p || !p.casado || p.igreja) return; if (!pay(Math.round(250000 * v6K()))) return; p.igreja = 1; p.rel = clamp(p.rel + 10); v6Done(`💒 Casaram também pela igreja, com bênção do padre/pastor e a família toda! ${fx({ felicidade: 10, karma: 3 })}`, 'good', 'love'); renderPanel(true); }
function v6IgrejaUI() {
  const v = v6G(), dom = v6Domingo(), p = G.parceiro;
  let h = dom ? noteBox('☀️ <b>Hoje é domingo!</b> O culto rende o dobro e a família está toda junta.') : '';
  h += list([
    btnItem('⛪', dom ? 'Culto de domingo' : 'Culto de semana', v.culto === v6Hoje() ? 'Já foste hoje' : dom ? 'Felicidade +7, karma +3' : 'Volta ao domingo para o culto grande', '1 ⚡', 'v6Culto()', v.culto === v6Hoje()),
    btnItem('🙏', 'Dar o dízimo', v.dizimo === G.ano ? 'Já deste este ano' : '10% de um mês de salário', '', 'v6Dizimo()', v.dizimo === G.ano),
    btnItem('🎶', 'Ensaiar no coro', v.coro === v.dia ? 'O ensaio de hoje já foi' : 'Uma vez por dia de jogo', '1 ⚡', 'v6Coro()', v.coro === v.dia),
    btnItem('🧺', 'Pedir ajuda à igreja', G.dinheiro < 20000 ? 'A caixa de solidariedade ajuda quem precisa (1×/ano)' : 'Só para quem está mesmo aflito', '+15k', 'v6AjudaIgreja()', G.dinheiro >= 20000 || v.igrejaAjuda === G.ano),
    p && p.casado ? btnItem('💒', 'Casamento religioso', p.igreja ? 'Já casaram pela igreja' : 'Depois do alembamento, a bênção na igreja', kzShort(250000 * v6K()), 'v6CasaIgreja()', !!p.igreja) : '',
  ].filter(Boolean));
  return h;
}
function v6Quintal() {
  const v = v6G(), hoje = v6Hoje(); if (v.quintal === hoje) return toast('🍖 Já fizeste quintal hoje.');
  if (G.casa.tipo === 'rua') return toast('Sem casa, sem quintal…');
  const c = Math.round(25000 * v6K()); if (G.dinheiro < c) return toast('💸 Precisas de ' + kz(c) + ' para a carne, a gasosa e o carvão.');
  doAct(c, () => {
    v.quintal = hoje; const dom = v6Domingo();
    ['pai', 'mae'].forEach(k => { if (G[k].vivo) G[k].rel = clamp(G[k].rel + 5); }); if (G.parceiro) G.parceiro.rel = clamp(G.parceiro.rel + 5); G.filhos.forEach(f => f.rel = clamp(f.rel + 5)); G.amigos.forEach(f => f.rel = clamp(f.rel + 4));
    v.famRep = clamp(v.famRep + 4); if (G.vr) G.vr.fome = Math.min(100, G.vr.fome + 40);
    return `🍖 ${dom ? 'Domingo de' : 'Dia de'} quintal: grelhados, funge, kizomba na coluna e os mais-velhos a contar histórias à sombra da mangueira. ` + fx({ felicidade: dom ? 9 : 6, karma: 1 });
  }, 'dance');
}
function v6PraiaDom() {
  const v = v6G(), hoje = v6Hoje(); if (v.domingo === hoje) return toast('🏖️ Já foste à praia hoje.');
  doAct(Math.round(8000 * v6K()), () => { v.domingo = hoje; const dom = v6Domingo(); if (G.vr) G.vr.energia = Math.max(0, G.vr.energia - 8); return `🏖️ ${dom ? 'Domingo na Ilha' : 'Dia de praia'}: mergulho, peixe grelhado, mufete e música ao vivo nas barracas. ` + fx({ felicidade: dom ? 8 : 5, saude: 2 }); }, 'wave');
}
/* carnaval */
function v6Pascoa(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), dy = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, dy); }
function v6Carnaval() { const now = new Date(); let y = now.getFullYear(); let c = new Date(v6Pascoa(y).getTime() - 47 * 864e5); if (now - c > 2 * 864e5) c = new Date(v6Pascoa(++y).getTime() - 47 * 864e5); return c; }
const V6_GRUPOS = [['União Kianda da Ilha', '🌊'], ['Kazukuta do Sambizanga', '🥁'], ['Semba do Rangel', '💃']];
function v6CarnInfo() {
  const c = v6Carnaval(), now = Date.now(), dias = Math.ceil((c - now) / 864e5);
  const mx = typeof mxEvento === 'function' && mxEvento().id === 'carnaval';
  return { c, dias, epoca: dias <= 40, desfile: (dias <= 1 && dias >= -1) || mx, mx, ano: c.getFullYear() };
}
function v6CarnGrupo(i) { const v = v6G(), I = v6CarnInfo(); if (v.carn.ano !== I.ano) v.carn = { ano: I.ano, ens: 0 }; v.carn.grupo = V6_GRUPOS[i][0]; v6Done(`🎭 Entraste no grupo carnavalesco <b>${V6_GRUPOS[i][0]}</b>!`); renderPanel(true); }
function v6Ensaio() {
  const v = v6G(), I = v6CarnInfo(), hoje = v6Hoje(); if (v.carn.ensDia === hoje) return toast('🥁 Hoje já ensaiaste.');
  doAct(0, () => { v.carn.ensDia = hoje; if (I.epoca) v.carn.ens = (v.carn.ens || 0) + 1; return `🥁 Ensaio com o ${v.carn.grupo}: batuques, apitos e a coreografia ${I.epoca ? `(ensaio ${v.carn.ens} para o desfile)` : '(treino livre: os ensaios a sério começam 40 dias antes do Carnaval)'}. ` + fx({ felicidade: 3, saude: 1 }); }, 'semba');
}
function v6Desfile() {
  const v = v6G(), I = v6CarnInfo(), key = I.mx ? 'mx' + mxEvento().slot : 'c' + I.ano;
  if (v.carn.desf === key) return toast('🎭 Já desfilaste neste carnaval.');
  doAct(0, () => {
    v.carn.desf = key;
    const sc = (v.carn.ens || 0) * 12 + G.stats.aparencia / 4 + G.stats.saude / 6 + R(0, 30);
    const pos = Math.max(1, Math.min(12, 13 - Math.floor(sc / 10)));
    const pr = pos === 1 ? 500000 : pos <= 3 ? 150000 : 20000; G.dinheiro += pr;
    return `🎭 Desfile na Marginal com o ${v.carn.grupo}! O júri deu ao grupo o <b>${pos}.º lugar</b>${pos === 1 ? ' — CAMPEÕES DO CARNAVAL!' : ''}. Prémio/ajuda de custo: ${kzShort(pr)}. ` + fx({ felicidade: pos <= 3 ? 12 : 6, fama: pos === 1 ? 6 : pos <= 3 ? 3 : 1 });
  }, 'dance');
}
function v6CarnUI() {
  const v = v6G(), I = v6CarnInfo(); if (v.carn.ano !== I.ano && !v.carn.grupo) v.carn.ano = I.ano;
  const dt = `${I.c.getDate()} de ${MESES[I.c.getMonth()]} de ${I.ano}`;
  let h = v6Card('🎭 Carnaval de Luanda', `<div class="v6big">${I.desfile ? 'É CARNAVAL!' : `Faltam ${I.dias} dias`}</div>` + v6Muted(`Terça-feira de Carnaval: ${dt}. Os grupos desfilam na Marginal e o júri escolhe o campeão. ${I.mx ? 'Hoje há desfile especial na Marginal (evento da cidade)!' : ''}`));
  if (!v.carn.grupo) h += sec('Escolhe o teu grupo carnavalesco') + list(V6_GRUPOS.map((g, i) => btnItem(g[1], g[0], 'Entrar no grupo (grátis)', '', `v6CarnGrupo(${i})`)));
  else h += list([
    btnItem('🥁', 'Ensaiar com o grupo', `${v.carn.grupo} · ensaios para o desfile: ${v.carn.ens || 0}${I.epoca ? '' : ' (época de ensaios: 40 dias antes)'}`, '1 ⚡', 'v6Ensaio()', v.carn.ensDia === v6Hoje()),
    btnItem('🎭', 'Desfilar na Marginal', I.desfile ? 'Mais ensaios = melhor lugar' : `Só no Carnaval (${dt}) ou quando houver desfile especial na cidade`, '1 ⚡', 'v6Desfile()', !I.desfile),
  ]);
  return h;
}
function v6PraiaDomUI() {
  const dom = v6Domingo(), v = v6G();
  return (dom ? noteBox('☀️ <b>Hoje é domingo!</b> A Ilha está cheia de famílias.') : '') + list([btnItem('🏖️', dom ? 'Domingo na praia com a família' : 'Dia de praia', v.domingo === v6Hoje() ? 'Já foste hoje' : 'Mufete, mergulho e música nas barracas', kzShort(8000 * v6K()), 'v6PraiaDom()', v.domingo === v6Hoje())]) + v6CarnUI();
}
function v6CasaDomUI() {
  const v = v6G(), dom = v6Domingo();
  return list([btnItem('🍖', dom ? 'Quintal de domingo' : 'Fazer um quintal', v.quintal === v6Hoje() ? 'Já fizeste hoje' : 'Grelhados, família e kambas · relações +5', kzShort(25000 * v6K()), 'v6Quintal()', v.quintal === v6Hoje() || G.casa.tipo === 'rua')]);
}

/* =========================================================
   8. APP "DIA A DIA" (telemóvel) e chip no topo do ecrã
   ========================================================= */
function phoneOpenSafe(id) { try { if (!G || G.tel < 2) return; if (!phoneApp) openPhone(); phoneOpen(id); } catch (e) { } }
function v6Pendentes() {
  const v = v6G(), now = Date.now(), L = [];
  if (v.mal) L.push(['🤒', `Paludismo · dia ${v.mal.fase}`, v.mal.trat ? 'em tratamento' : v.mal.test ? 'precisas do tratamento!' : 'faz o teste!', 'bad']);
  if (v.grav) L.push(['🤰', v6GravTxt(), `${v.grav.cons}/4 consultas pré-natais`, '']);
  ['siac', 'hosp'].forEach(k => { const s = v.fila[k]; if (s && now < s.ate) L.push(['🎫', `Senha ${s.n} · ${k === 'siac' ? 'SIAC' : 'Hospital'}`, now < s.chama ? `chamam daqui a ${v6Cd(s.chama)}` : 'é a tua vez!', now >= s.chama ? 'ok' : '']); });
  v.proc.forEach(p => L.push([V6_DOCS[p.id].ico, V6_DOCS[p.id].t, now >= p.pronto ? 'pronto: levanta no SIAC' : `pronto daqui a ${v6Cd(p.pronto)}`, now >= p.pronto ? 'ok' : '']));
  if (v.kix) { const K = V6_KIX.find(k => k.id === v.kix.id); L.push(['🤝', K.t, `ronda ${v.kix.ronda}/${K.n} · recebes na ${v.kix.pos}.ª`, '']); }
  if (v.multas.length) L.push(['🧾', `${v.multas.length} multa(s) por pagar`, kzShort(v.multas.reduce((s, m) => s + m.v, 0)), 'bad']);
  if (v.receita) L.push(['📋', 'Receita por aviar', 'compra na farmácia', 'bad']);
  if (v.atraso) L.push(['⏳', 'Salários em atraso', kzShort(v.atraso), 'bad']);
  if (!v6DocOk('bi') && G.idade >= 16 && !v6Proc('bi')) L.push(['🪪', 'Não tens BI válido', 'trata no SIAC (Mutamba)', 'bad']);
  return L;
}
function v6PagarMultas() { const v = v6G(), t = v.multas.reduce((s, m) => s + m.v, 0); if (!t) return; if (!pay(t)) return; v.multas = []; v6Done(`📲 Pagaste todas as multas pelo Palanca Pay (${kz(t)}).`); renderPhone(true); }
function v6Precos() { const k = Math.min(1.8, v6G().ipc) * v6K(), r = x => Math.round(x * k / 50) * 50; return [['🚐', 'Candongueiro (azul e branco)', r(300)], ['🏍️', 'Kupapata (viagem curta)', r(500)], ['🍞', 'Pão (unidade)', r(100)], ['⛽', 'Gasolina (litro)', r(400)], ['💧', 'Garrafão de água 5 L', r(600)], ['📱', 'Pacote de dados 1 GB', r(1000)], ['🍺', 'Cerveja Palmeira (lata)', r(500)]]; }
function v6Datas() {
  const now = new Date(), L = []; const I = v6CarnInfo();
  if (typeof MX_DATAS !== 'undefined') for (let i = 0; i < 120; i++) { const d = new Date(now.getTime() + i * 864e5), k = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; const e = MX_DATAS[k]; if (e && e.id !== 'carnaval') L.push([e.ico, e.t, i === 0 ? 'hoje!' : `daqui a ${i} dia(s)`]); if (L.length >= 5) break; }
  L.push(['🎭', 'Carnaval', I.desfile ? 'é agora!' : `daqui a ${I.dias} dias`]);
  const dd = (7 - now.getDay()) % 7; L.unshift(['☀️', 'Domingo (culto, quintal e praia)', dd === 0 ? 'hoje!' : `daqui a ${dd} dia(s)`]);
  return L;
}
PHONE_VIEWS.diaadia = () => {
  const v = v6G(), pend = v6Pendentes(), b = v6Contas();
  let h = apHead('Dia a Dia', `${dateTxt()}${v6Domingo() ? ' · domingo' : ''}`);
  h += `<div class="apsec">Agora</div>` + (pend.length ? `<div class="v6pend">${pend.map(p => `<div class="${p[3]}"><i>${p[0]}</i><span><b>${p[1]}</b><small>${p[2]}</small></span></div>`).join('')}</div>` : '<div class="apok">✅ Nada pendente. Vida tranquila!</div>');
  h += `<div class="list">${[
    btnItem('📲', 'Agendar no SIAC Digital', 'Marca o atendimento e passa à frente da fila', 'Grátis', 'v6Agendar()'),
    v.multas.length ? btnItem('🧾', 'Pagar multas (Palanca Pay)', `${v.multas.length} multa(s)`, kzShort(v.multas.reduce((s, m) => s + m.v, 0)), 'v6PagarMultas()') : '',
  ].join('')}</div>`;
  h += `<div class="apsec">Contas da casa</div>` + (b.linhas.length ? `<div class="v6bill">${b.linhas.map(l => `<div><span>${l[0]} ${l[1]}</span><b>${kzShort(Math.round(l[2] * v6K()))}/mês</b></div>`).join('')}<div class="tot"><span>Por ano</span><b>${kzShort(b.total)}</b></div></div>` : '<p class="apnote">Sem contas: vives com a família ou ainda não tens casa. Muda os serviços em Casa → Contas.</p>');
  h += `<div class="apsec">Farmácia (entrega Txova)</div>` + v6FarmaciaList();
  h += `<div class="apsec">Preços de hoje</div><div class="v6bill">${v6Precos().map(p => `<div><span>${p[0]} ${p[1]}</span><b>${kz(p[2])}</b></div>`).join('')}<div><span>💵 Dólar (kinguila)</span><b>${v6Taxa().rua} Kz</b></div></div>`;
  h += `<div class="apsec">Calendário</div><div class="v6bill">${v6Datas().map(d => `<div><span>${d[0]} ${d[1]}</span><b>${d[2]}</b></div>`).join('')}</div>`;
  h += `<div class="apsec">Definições</div><div class="list">${btnItem('🔔', 'Situações do dia a dia', v.rt ? 'Ligadas: de vez em quando acontece algo na rua (rusgas, cortes de luz, família…)' : 'Desligadas', v.rt ? 'ON' : 'OFF', 'v6RtTog()')}</div>`;
  return h + '<p class="apnote">Documentos no SIAC (Mutamba) · Hospital Geral Kianda (Baixa) · Kixikila e kinguilas no Mercado do Roque.</p>';
};
function v6RtTog() { const v = v6G(); v.rt = !v.rt; save(); renderPhone(true); }
(function () {
  const iv = APPS.findIndex(a => a.id === 'saude');
  if (!APPS.some(a => a.id === 'diaadia')) APPS.splice(iv >= 0 ? iv + 1 : APPS.length, 0, { id: 'diaadia', ico: '🧾', t: 'Dia a Dia', bg: 'linear-gradient(#ffcb00,#e8590c)', tel: 2 });
})();
function v6Chip() {
  const hud = document.getElementById('vrHud'); if (!hud || !G) return;
  let c = document.getElementById('v6Chip');
  if (!c) { c = document.createElement('div'); c.id = 'v6Chip'; c.onclick = e => { e.stopPropagation(); if (G.tel >= 2) phoneOpenSafe('diaadia'); else { const p = v6Pendentes()[0]; toast(p ? strip(`${p[0]} ${p[1]}: ${p[2]}`) : 'Nada pendente.'); } }; hud.appendChild(c); }
  const v = v6G(), now = Date.now(); let t = '';
  if (v.mal) t = `🤒 <b>${v.mal.trat ? 'a tratar' : 'paludismo'}</b>`;
  else { const s = v.fila.siac || v.fila.hosp; const sk = v.fila.siac && now < v.fila.siac.ate ? v.fila.siac : v.fila.hosp && now < v.fila.hosp.ate ? v.fila.hosp : null; if (sk) t = now < sk.chama ? `🎫 <b>${v6Seg((sk.chama - now) / 1000)}</b>` : '🔔 <b>vez!</b>'; else if (v.proc.some(p => now >= p.pronto)) t = '📄 <b>pronto</b>'; else if (v.kix && v.kix.ronda + 1 === v.kix.pos) t = '🤝 <b>amanhã</b>'; else if (V6.jogo && !V6.jogo.fim) { const J = V6.jogo.J, m = v6JogoMin(), e = J.ev.filter(x => x.m <= m); t = `⚽ <b>${e.filter(x => x.k === 'gol' && x.l === 'h').length}-${e.filter(x => x.k === 'gol' && x.l === 'a').length} ${m}'</b>`; } }
  if (c.dataset.t !== t) { c.dataset.t = t; c.innerHTML = t; c.classList.toggle('hidden', !t); }
}

/* =========================================================
   9. RELÓGIO: dia de jogo, filas, cortes de luz, situações
   ========================================================= */
function v6NovoDia() {
  const v = v6G(); v.dia++;
  const z = v6Zona(), c = v.casa;
  const pc = c.luz === 'solar' ? .03 : ({ musseque: .55, zango: .45, bairro: .4, kilamba: .25, talatona: .15, miramar: .1 }[z] || .35) + (c.luz === 'puxada' ? .15 : 0);
  v.hoje = { divisas: chance(.45), corte: v6Indep() || G.casa.tipo === 'pais' ? chance(pc) : false, agua: c.agua === 'epal' && chance(v6Pobre() ? .35 : .18) };
  try { v6KixRonda(); } catch (e) { console.error(e); }
  try { v6MalDia(); } catch (e) { console.error(e); }
  if (v.despensa > v.dia && G.vr) { G.vr.fome = Math.min(100, G.vr.fome + 40); toast('🍳 Pequeno-almoço em casa com o rancho do mês: fome +40.'); }
  save(); refresh();
}
function v6Livre() {
  return mode === 'game' && G && G.vivo && !panelId && !modalOpen && !phoneApp && !busy && !(typeof MX !== 'undefined' && MX.task) && !(typeof TR !== 'undefined' && TR) && !(G.preso > 0) && !(typeof vrPreso === 'function' && vrPreso()) && !document.querySelector('#fade.on') && !(typeof dying !== 'undefined' && dying);
}
function v6Tick() {
  if (!G || !G.vivo || mode !== 'game') return;
  const v = v6G(), now = Date.now();
  if (V6.lastT == null) V6.lastT = dayT;
  if (dayT < V6.lastT - .5) v6NovoDia();
  V6.lastT = dayT;
  v.proc.forEach(p => { if (!p.av && now >= p.pronto) { p.av = 1; if (typeof p2Banner === 'function') p2Banner('📄', 'SIAC', `${V6_DOCS[p.id].t}: pronto para levantar!`, null); } });
  ['siac', 'hosp'].forEach(k => { const s = v.fila[k]; if (s && !s.av && now >= s.chama && now < s.ate) { s.av = 1; if (typeof SND !== 'undefined') SND.play('notif'); toast(`🔔 Senha ${s.n}: é a tua vez no ${k === 'siac' ? 'SIAC' : 'Hospital'}!`); } });
  // corte de luz à noite
  const hr = typeof p2Hour === 'function' ? p2Hour() : 12;
  if (v.hoje.corte === true && (hr >= 19 || hr < 5)) { v.hoje.corte = 'feito'; v.cortes++; v6Corte(); }
  // situações aleatórias
  if (!V6.t0) { V6.t0 = now; V6.nextRT = now + 150000; }
  if (now >= V6.nextRT && v.rt && G.idade >= 14 && v6Livre()) { V6.nextRT = now + R(260, 420) * 1000; try { v6RT(); } catch (e) { console.error('v6RT', e); } }
  if (V6.rtQ.length && v6Livre()) eventModal(V6.rtQ.shift());
  v6JogoTick();
  // contagens decrescentes visíveis
  let re = false;
  document.querySelectorAll('[data-v6cd]').forEach(el => { const s = (+el.dataset.v6cd - now) / 1000; el.textContent = v6Seg(s); if (s <= 0 && !el.dataset.done) { el.dataset.done = 1; re = true; } });
  if (re) { if (panelId) renderPanel(true); if (phoneApp) renderPhone(true); }
  // paludismo sem tratamento cansa
  if (v.mal && !v.mal.trat && G.vr && now % 60000 < 1000) G.vr.energia = Math.max(0, G.vr.energia - 2);
  v6Chip();
}
setInterval(() => { try { v6Tick(); } catch (e) { console.error('v6Tick', e); } }, 1000);
function v6Corte() {
  const v = v6G(), c = v.casa, emCasa = v6Aqui('casa', 40);
  if (c.ger && v6Indep()) { const g = Math.round(1500 * v6K()); G.dinheiro -= g; if (emCasa) toast(`⛽ Corte da ENDE! O gerador ligou sozinho (−${kz(g)} de gasóleo).`); addLog(`⚡ Corte de luz no bairro. O gerador salvou a noite (−${kzShort(g)} de gasóleo).`); save(); return; }
  if (!emCasa) { if (typeof p2Banner === 'function') p2Banner('⚡', 'ENDE', 'Corte de energia na tua zona. Previsão de reposição: indeterminada.', null); return; }
  V6.rtQ.push(V6_CORTE);
}
const V6_CORTE = { ico: '⚡', t: 'Corte de Luz!', txt: () => 'Tudo às escuras de repente. A ENDE cortou a luz no bairro… a geleira parou e a novela ia no melhor.', ch: [
  ['Acender velas e contar histórias', 'Felicidade −1', () => '🕯️ À luz das velas, a família contou histórias antigas. ' + fx({ felicidade: -1, karma: 1 })],
  ['Ir dormir cedo', '+ energia', () => { if (G.vr) G.vr.energia = Math.min(100, G.vr.energia + 25); return '😴 Dormiste cedo. Pelo menos descansaste.'; }],
  ['Pedir ao vizinho do gerador para carregar o telemóvel', '500 Kz', () => { G.dinheiro -= 500; return '🔌 O vizinho carregou-te o telemóvel por 500 Kz. ' + fx({ karma: 0 }); }],
] };

/* =========================================================
   10. PAINÉIS: novos locais e separadores nos existentes
   ========================================================= */
PANELS.siac = { ico: '🪪', t: 'SIAC · Loja do Cidadão', sub: 'BI, passaporte, registo criminal, NIF e multas · Mutamba', tabs: [['docs', '🪪 Documentos', v6DocsUI], ['fila', '🎫 Senha & fila', v6FilaUI], ['multas', '🚔 Multas', v6MultasUI]] };
PANELS.hospital = { ico: '🏥', t: 'Hospital Geral Kianda', sub: 'Hospital público · consulta externa, urgência e maternidade', tabs: [['cons', '🩺 Consulta & urgência', v6HospConsUI], ['mal', '🦟 Paludismo', v6HospMalUI], ['mat', '🤰 Maternidade & vacinas', () => v6MatUI('pub')]] };
Object.assign(LOC_POS, {
  siac: { x: -98, z: -33.2, ico: '🪪', n: 'SIAC · Loja do Cidadão', zona: 'Mutamba' },
  hospital: { x: 102, z: -46.8, ico: '🏥', n: 'Hospital Geral Kianda', zona: 'Baixa' },
});
Object.assign(HIT_BOXES, { siac: [-98, -18, 16, 16, 28], hospital: [102, -64, 14, 22, 52] });
(function () {
  const P = PANELS;
  if (P.clinica && !P.clinica.tabs) { const b = P.clinica.body; delete P.clinica.body; P.clinica.tabs = [['cons', '🩺 Consultas', b], ['mal', '🦟 Paludismo & farmácia', v6CliMalUI], ['mat', '🤰 Pré-natal', () => v6MatUI('cli')], ['seg', '🛡️ Seguro', v6SeguroUI]]; P.clinica.sub = 'Clínica privada · rápido, mas pago'; }
  if (P.igreja && !P.igreja.tabs) { const b = P.igreja.body; delete P.igreja.body; P.igreja.tabs = [['fe', '⛪ Igreja', b], ['com', '🙏 Culto & comunidade', v6IgrejaUI]]; }
  if (P.ginasio && !P.ginasio.tabs) { const b = P.ginasio.body; delete P.ginasio.body; P.ginasio.tabs = [['treino', '🏋️ Treinar', b], ['gira', '⚽ Girabola ao vivo', v6GiraUI]]; }
  if (P.farra && !P.farra.tabs) { const b = P.farra.body; delete P.farra.body; P.farra.tabs = [['noite', '💃 Noite', b], ['kud', '🔥 Batalha de Kuduro', v6KudUI]]; }
  if (P.praia && !P.praia.tabs) { const b = P.praia.body; delete P.praia.body; P.praia.tabs = [['praia', '🏖️ Praia', b], ['dom', '🎭 Domingo & Carnaval', v6PraiaDomUI]]; }
  if (P.mercado && P.mercado.tabs && !P.mercado.tabs.some(t => t[0] === 'kix')) P.mercado.tabs.push(['kix', '🤝 Kixikila', v6KixUI], ['kin', '💵 Kinguilas & rancho', v6KinUI]);
  if (P.casa && P.casa.tabs && !P.casa.tabs.some(t => t[0] === 'contas')) { P.casa.tabs.splice(1, 0, ['contas', '🧾 Contas', () => v6ContasUI() + sec('☀️ Fim de semana') + v6CasaDomUI()]); }
  if (P.emprego && P.emprego.tabs && !P.emprego.tabs.some(t => t[0] === 'dir')) P.emprego.tabs.push(['dir', '📑 INSS & salários', v6DireitosUI]);
})();
if (typeof V2_STAFF !== 'undefined') { V2_STAFF.siac = 'Bom dia! Tire a sua senha na máquina e aguarde que chamem o seu número.'; V2_STAFF.hospital = 'Consulta externa por ordem de chegada. Urgências, à direita.'; }
if (typeof V2_CHAT !== 'undefined') { V2_CHAT.siac = ['Estou aqui desde as 6 da manhã…', 'O sistema foi abaixo outra vez!', 'Diz que o BI fica pronto em 15 dias.']; V2_CHAT.hospital = ['A enfermeira disse para esperar.', 'Trouxe o lençol e o balde, como pediram.', 'O meu filho está com febre há 2 dias.']; }

/* =========================================================
   11. LIGAÇÕES ÀS REGRAS QUE JÁ EXISTEM
   ========================================================= */
(function () {
  // emprego formal pede BI; função pública/polícia pedem registo criminal
  const _aj = applyJob; applyJob = function (id) {
    const j = job(id); if (j && G.idade >= 18 && !j.informal && !j.part && !v6DocOk('bi')) return toast('🪪 Para um emprego com contrato precisas do BI. Trata no SIAC (Mutamba).');
    if (j && j.req && j.req.limpo && !v6DocOk('registo')) return toast('📜 Esta vaga pede Registo Criminal deste ano. Pede no SIAC.');
    return _aj.apply(this, arguments);
  };
  const _tc = tirarCarta; tirarCarta = function () { if (!v6DocOk('bi')) return toast('🪪 Para a carta de condução precisas do BI.'); return _tc.apply(this, arguments); };
  const _tl = takeLoan; takeLoan = function () { if (!v6DocOk('bi')) return toast('🪪 O banco pede o BI para qualquer crédito.'); return _tl.apply(this, arguments); };
  const _on = openNeg; openNeg = function () { if (!v6DocOk('nif')) return toast('🧾 Para abrir negócio precisas de NIF (grátis no SIAC).'); return _on.apply(this, arguments); };
  if (typeof vhPass === 'function') vhPass = function () {
    if (G.idade < 18) return; if (!v6DocOk('bi')) return toast('🪪 Para o passaporte precisas primeiro do BI (SIAC).');
    if (v6Proc('pass')) return toast('🛂 O teu passaporte está em tratamento. Levanta no SIAC quando estiver pronto.');
    toast('🛂 O passaporte trata-se no balcão do SME no SIAC (Mutamba). Normal 25.000 Kz, urgente 60.000 Kz.');
  };
  if (typeof vrPolOp === 'function') { const _vp = vrPolOp; vrPolOp = function (op) { if ((op === 'votar' || op === 'candidatar') && !v6DocOk('eleitor')) return toast('🗳️ Precisas do Cartão de Eleitor (grátis no SIAC).'); return _vp.apply(this, arguments); }; }
  // gravidez: 9 meses e parto no ano seguinte
  haveKid = function () {
    const p = G.parceiro; if (!p) return;
    const mi = G.genero === 'F' ? G.idade : p.idade;
    if (G.idade < 18) return toast('Ainda és muito novo(a)!');
    if (mi > 47) return toast('Já não é possível ter filhos naturalmente. Podes adotar.');
    const v = v6G(); if (v.grav) return toast('🤰 Já há um bebé a caminho! Nasce no próximo ano.');
    doAct(0, () => {
      if (!chance(.6)) return 'Tentaram, mas ainda não foi desta. ' + fx({ felicidade: -2 });
      v.grav = { ano: G.ano, cons: 0 }; p.rel = clamp(p.rel + 6);
      return `🤰 ${G.genero === 'F' ? 'Estás grávida' : p.nome.split(' ')[0] + ' está grávida'}! O bebé nasce no próximo ano. Façam as consultas pré-natais no Hospital Geral (grátis) ou na Clínica. ` + fx({ felicidade: 12 });
    }, 'love');
  };
  // contas da casa e seguro no custo de vida
  const _cv = custoVida; custoVida = function () {
    const r = _cv.apply(this, arguments);
    try { const v = v6G(), b = v6Contas(); if (b.total) { r.c += b.total; r.det.push('contas da casa'); } if (v.seguro && G.idade >= 18) { r.c += Math.round(18000 * 12 * v6K()); r.det.push('seguro de saúde'); } if (v.inssVol && !v6Formal()) { r.c += 96000; r.det.push('INSS por conta própria'); } } catch (e) { }
    return r;
  };
  // ano novo: INSS, reforma, atrasos, multas, consequências das contas, documentos, parto
  const _age = ageUpLogic; ageUpLogic = function () {
    const v = v6G(), wasRef = !!G.reformado;
    const r = _age.apply(this, arguments);
    if (r === 'dead' || !G.vivo) return r;
    let ev = null; try { ev = v6Anual(wasRef); } catch (e) { console.error('v6Anual', e); }
    save();
    return ev && r !== 'area' ? ev : r;
  };
})();
function v6Anual(wasRef) {
  const v = v6G(), c = v.casa;
  if (G.preso > 0) return null;
  // INSS
  if (v6Formal()) { v.inss++; const d = Math.round(salario(G.emprego) * .03); G.dinheiro -= d; addLog(`📑 Desconto de 3% para o INSS: −${kzShort(d)} (${v.inss} anos de descontos).`); }
  else if (v.inssVol) v.inss++;
  if (G.reformado && !wasRef && !v.pAdj) { v.pAdj = true; const ant = G.pensao || 0; G.pensao = v.inss >= 15 ? Math.round(ant * Math.min(1, v.inss / 30)) : 360000; addLog(`📑 A tua reforma foi calculada com ${v.inss} anos de descontos no INSS: ${kzShort(G.pensao)}/ano${v.inss < 15 ? ' (pensão social mínima: descontaste pouco)' : ''}.`, v.inss >= 25 ? 'good' : 'bad'); }
  // salários em atraso
  if (v.atraso > 0) { if (chance(G.emprego ? .6 : .3)) { G.dinheiro += v.atraso; addLog(`💰 A empresa finalmente pagou os salários em atraso: +${kzShort(v.atraso)}.`, 'good'); v.atraso = 0; } else addLog(`⏳ Os salários em atraso (${kzShort(v.atraso)}) continuam por pagar.`, 'bad'); }
  // multas por pagar duplicam
  v.multas.forEach(m => { if (m.ano < G.ano - 1 && !m.dup) { m.v *= 2; m.dup = 1; } });
  if (v.multas.some(m => m.dup)) addLog('🧾 Tens multas antigas por pagar: o valor duplicou. Paga no SIAC ou no Palanca Pay.', 'bad');
  // documentos que caducam
  if (v.docs.bi && !v6DocOk('bi') && v.biAviso !== G.ano) { v.biAviso = G.ano; addLog('🪪 O teu BI caducou! Renova no SIAC.', 'bad'); }
  if (v.docs.pass && G.ano - v.docs.pass >= 5 && G.viag && G.viag.pass) { G.viag.pass = 0; addLog('🛂 O teu passaporte caducou. Renova no SIAC (balcão do SME).', 'bad'); }
  // consequências das escolhas da casa
  if (v6Indep()) {
    if (c.luz === 'puxada') { if (chance(.22)) { const m = Math.round(150000 * v6K()); G.dinheiro -= m; c.luz = 'ende'; addLog(`⚡ A fiscalização da ENDE descobriu a tua puxada! Multa de ${kzShort(m)} e passaste a pagar a luz como deve ser. ${fx({ felicidade: -6, karma: -3 })}`, 'bad'); } else if (chance(.06)) { const m = Math.round(300000 * v6K()); G.dinheiro -= m; addLog(`🔥 A puxada fez curto-circuito e queimou a TV e a geleira (−${kzShort(m)}). ${fx({ felicidade: -8 })}`, 'bad'); } }
    if (c.luz === 'ende' && chance(.25)) { const m = Math.round(R(25000, 60000) * v6K()); G.dinheiro -= m; addLog(`💡 A ENDE mandou uma fatura por estimativa muito acima do consumo: −${kzShort(m)}. Pensa em pôr contador pré-pago.`, 'bad'); }
    if (c.agua === 'cac' && !c.filtro && chance(.3)) addLog(`🪣 A água da cacimba deu diarreias lá em casa. ${fx({ saude: -R(5, 9), felicidade: -3 })}`, 'bad');
    if (c.agua === 'epal' && v6Pobre() && chance(.3)) { const m = Math.round(30000 * v6K()); G.dinheiro -= m; addLog(`🚰 A EPAL esteve semanas sem dar água no bairro: compraste bidões e garrafões (−${kzShort(m)}).`); }
    if (c.coz === 'carvao') fx({ saude: -1 });
    if (c.tv) fx({ felicidade: c.tv === 2 ? 3 : 1 });
    if (c.net === 2) fx({ inteligencia: 1 });
    if (!c.ger && c.luz !== 'solar' && v6Pobre()) addLog(`⚡ Os cortes de luz estragaram comida várias vezes este ano. ${fx({ felicidade: -2 })}`);
  }
  // agiota
  if (v.agiota > 0) { const a = v.agiota; v.agiota = 0; G.dinheiro -= a; addLog(`🦈 O agiota veio cobrar: −${kzShort(a)} (o empréstimo com 50% de juros).`, 'bad'); if (G.dinheiro < 0) addLog(`🦈 Como não chegava, levaram-te a TV e o telemóvel velho. ${fx({ felicidade: -8 })}`, 'bad'); }
  // inflação e câmbio
  v.ipc = Math.min(3, +(v.ipc * (1 + R(5, 14) / 100)).toFixed(3));
  v.cambio = Math.min(2500, Math.round(v.cambio * (1 + Math.max(-.02, (G.mercado && G.mercado.dolar) || .06))));
  v.famRep = clamp(v.famRep + (50 - v.famRep) * .1);
  // o bebé nasce
  if (v.grav && v.grav.ano < G.ano) return V6_PARTO;
  return null;
}
const V6_PARTO = { ico: '👶', t: 'Chegou a hora do parto!', txt: () => `As águas rebentaram! ${v6G().grav ? `Fizeram ${v6G().grav.cons} de 4 consultas pré-natais.` : ''} Onde vai nascer o bebé?`, ch: [
  ['Maternidade pública', 'Grátis · leva o kit (15.000 Kz)', () => v6Parto('pub')],
  ['Clínica privada', 'Cerca de 450.000 Kz · o seguro paga 80%', () => v6Parto('cli')],
  ['Parteira do bairro, em casa', '5.000 Kz · mais arriscado', () => v6Parto('casa')],
] };

/* =========================================================
   12. CSS
   ========================================================= */
(function () {
  if (document.getElementById('v6css')) return;
  const s = document.createElement('style'); s.id = 'v6css';
  s.textContent = `
.v6card{background:#17171d;border:1px solid #2a2a33;border-radius:14px;padding:10px 12px;margin:8px 0}.v6card>b{display:block;font-size:13px;margin-bottom:4px}
.v6card.ok{border-color:#2ecc71;background:rgba(46,204,113,.08)}.v6card.bad{border-color:#ff5a5a;background:rgba(255,80,80,.08)}.v6card.wait{border-color:#ffcb00;background:rgba(255,203,0,.06)}
.v6muted{font-size:11.5px;color:#9a9aa5;margin-top:4px;line-height:1.35}.v6muted2{font-size:11px;color:#8a8a95;font-weight:600}
.v6ok{font-size:11px;color:#5be08f;font-weight:700}.v6bad{font-size:11px;color:#ff6b6b;font-weight:700}.v6warn{font-size:11px;color:#ffcb00;font-weight:700}
.v6big{font-size:20px;font-weight:900;margin:2px 0}.v6big.ok{color:#5be08f}.v6big.bad{color:#ff6b6b}
.v6bill{display:flex;flex-direction:column;gap:2px;background:#111116;border-radius:12px;padding:8px 10px;margin:6px 0}
.v6bill>div{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;padding:3px 0;border-bottom:1px dashed rgba(255,255,255,.07)}.v6bill>div:last-child{border:0}
.v6bill>div span{color:#cfcfd8;min-width:0}.v6bill>div b{white-space:nowrap}.v6bill .tot{font-weight:800;color:#ffcb00}.v6bill .me{color:#ffcb00}.v6bill small{color:#888;font-size:10px}
.v6opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin:6px 0}
.v6opt{background:#1b1b22;border:1px solid #2c2c36;border-radius:12px;padding:8px;text-align:left;color:#fff;cursor:pointer;display:flex;flex-direction:column;gap:2px}
.v6opt b{font-size:12.5px}.v6opt small{color:#ffcb00;font-weight:700;font-size:11px}.v6opt em{font-style:normal;color:#9a9aa5;font-size:10.5px;line-height:1.3}
.v6opt.on{border-color:#ffcb00;background:rgba(255,203,0,.1)}.v6opt:disabled{opacity:1;cursor:default}
.v6opts.three{grid-template-columns:repeat(3,1fr)}.v6col{display:flex;flex-direction:column;gap:4px;background:#17171d;border-radius:10px;padding:6px}.v6col small{font-size:10.5px;color:#bbb;min-height:26px}
.chip.on{background:#ffcb00!important;color:#111!important}
.v6kix{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.v6kix span{font-size:11px;background:#23232c;border-radius:20px;padding:3px 9px 3px 3px;display:flex;align-items:center;gap:5px}
.v6kix span i{font-style:normal;width:18px;height:18px;border-radius:50%;background:#33333f;display:grid;place-items:center;font-size:10px;font-weight:800}
.v6kix span.rec{opacity:.6}.v6kix span.next{outline:1px solid #ffcb00}.v6kix span.eu{background:#ffcb00;color:#111}.v6kix span.eu i{background:#111;color:#ffcb00}.v6kix span.fug{text-decoration:line-through;color:#ff7b7b}
.v6vs{display:flex;align-items:center;justify-content:center;gap:10px;font-size:15px;margin:6px 0;text-align:center}.v6vs span{color:#ffcb00;font-weight:900}
.v6placar{background:linear-gradient(180deg,#0f3d1f,#0b1f12);border:1px solid #2e8b57;border-radius:14px;padding:10px;margin:8px 0;color:#fff}
.v6placar .sc{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:700;text-align:center}.v6placar .sc span{flex:1}.v6placar .sc b{font-size:28px;font-weight:900;color:#ffcb00;white-space:nowrap}
.v6placar .mn{text-align:center;font-size:11px;color:#9ff0bf;margin:2px 0 6px}.v6placar .bar{height:4px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden}.v6placar .bar i{display:block;height:100%;background:#ffcb00;transition:width .5s}
.v6placar .tl{margin-top:8px;display:flex;flex-direction:column;gap:3px;font-size:12px}.v6placar .tl em{font-style:normal;color:#ffcb00;font-weight:800;margin-right:6px}.v6placar .ap{margin-top:6px;font-size:11px;color:#ffd;opacity:.8}
.v6clubes{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}
.v6tl{display:flex;flex-direction:column;gap:4px;margin:6px 0;font-size:12px;text-align:left}.v6tl div{background:rgba(255,255,255,.05);border-radius:8px;padding:5px 8px}.v6tl .g{border-left:3px solid #2ecc71}.v6tl .r{border-left:3px solid #ff5a5a}
.v6pend{display:flex;flex-direction:column;gap:5px;margin:4px 0 8px}.v6pend>div{display:flex;gap:8px;align-items:center;background:#17171d;border-radius:12px;padding:7px 9px;border-left:3px solid #555}
.v6pend>div.bad{border-left-color:#ff5a5a}.v6pend>div.ok{border-left-color:#2ecc71}.v6pend i{font-style:normal;font-size:16px}.v6pend span{display:flex;flex-direction:column;min-width:0}.v6pend small{color:#9a9aa5;font-size:11px}
#v6Chip{font-size:11.5px;color:#fff;background:rgba(255,203,0,.18);border:1px solid rgba(255,203,0,.5);border-radius:10px;padding:2px 7px;white-space:nowrap;cursor:pointer}#v6Chip.hidden{display:none}
`;
  document.head.appendChild(s);
})();
