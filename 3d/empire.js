/* =========================================================
   IMPÉRIO — empresas com funcionários e filiais, grupo empresarial,
   promoção imobiliária (terrenos → obra → arrendar/vender) e
   carreira empresarial até CEO.
   ========================================================= */

/* ---------------- CARREIRA EMPRESARIAL (até CEO) ---------------- */
const CORP_JOBS = [
  { id: 'c_retalho', t: 'Grande Retalho (Kitanda Super)', ico: '🛒', cat: 'Carreira Empresarial', sal: 1300000, req: { idade: 16 },
    niv: ['Operador(a) de Loja', 'Supervisor(a)', 'Gerente de Loja', 'Gerente Regional', 'Diretor(a) de Operações', 'CEO da Cadeia'], mult: [1, 1.5, 2.4, 4, 7, 14],
    nivReq: { 2: { edu: 3 }, 3: { inteligencia: 50 }, 4: { edu: 4 }, 5: { edu: 4, inteligencia: 70 } } },
  { id: 'c_telecom', t: 'Telecomunicações (Mbote Telecom)', ico: '📶', cat: 'Carreira Empresarial', sal: 1800000, req: { idade: 18, edu: 3 },
    niv: ['Consultor(a) de Vendas', 'Coordenador(a) de Equipa', 'Gestor(a) de Área', 'Diretor(a) de Marketing', 'Administrador(a)', 'CEO da Mbote Telecom'], mult: [1, 1.6, 2.6, 4.4, 7.5, 15],
    nivReq: { 2: { edu: 4 }, 4: { inteligencia: 65 }, 5: { inteligencia: 72, fama: 10 } } },
  { id: 'c_banca', t: 'Banca Comercial (Banco Palanca)', ico: '🏦', cat: 'Carreira Empresarial', sal: 2600000, req: { idade: 18, edu: 3, limpo: true }, outfit: 'executivo',
    niv: ['Assistente de Balcão', 'Gestor(a) de Clientes', 'Gerente de Agência', 'Diretor(a) Comercial', 'Administrador(a) Executivo(a)', 'CEO do Banco'], mult: [1, 1.6, 2.6, 4.4, 7.5, 15],
    nivReq: { 1: { edu: 4 }, 3: { inteligencia: 60 }, 4: { mestrado: true }, 5: { mestrado: true, inteligencia: 75 } } },
  { id: 'c_petro', t: 'Petróleo (Mulemba Petróleos)', ico: '🛢️', cat: 'Carreira Empresarial', sal: 5200000, req: { idade: 21, edu: 4, inteligencia: 55 }, outfit: 'executivo',
    niv: ['Quadro Júnior', 'Quadro Sénior', 'Chefe de Departamento', 'Diretor(a)', 'Administrador(a)', 'PCA da Mulemba Petróleos'], mult: [1, 1.6, 2.6, 4.4, 7.5, 15],
    nivReq: { 4: { mestrado: true }, 5: { mestrado: true, inteligencia: 78, limpo: true } } },
];
CORP_JOBS.forEach(j => { if (!job(j.id)) JOBS.push(j); });

/* ---------------- EMPRESAS: funcionários e filiais ---------------- */
const negStaffBase = N => Math.max(1, Math.round(Math.sqrt(N.base / 1e6) * 1.5));
function negNeed(n) { const N = negT(n.id); return Math.max(0, negStaffBase(N) * n.nivel * (1 + (n.fil || 0)) - 1); }
function negWage(n) { const N = negT(n.id); return Math.round(Math.max(360000, N.base * .1 / negStaffBase(N)) * (G ? cid().sal : 1)); }
function negFix(n) { if (n.fil == null) n.fil = 0; if (n.func == null) n.func = negNeed(n); return n; }
const filialCusto = n => { const N = negT(n.id); return Math.round(N.p * 2 * NIV_M[n.nivel - 1] * (1 + .25 * (n.fil || 0))); };
const totFunc = () => G.negocios.reduce((s, n) => s + (n.func || 0), 0);
const totFil = () => G.negocios.reduce((s, n) => s + (n.fil || 0), 0);

function hire(i, k) {
  const n = negFix(G.negocios[i]), w = negWage(n), N = negT(n.id);
  if (k === 'ideal') k = Math.max(0, negNeed(n) - n.func);
  if (k <= 0) return toast('A equipa já está completa.');
  const c = Math.round(w * .1 * k); if (!pay(c)) return;
  n.func += k; addLog(`👥 Contrataste ${k} funcionário(s) para ${N.t} (recrutamento ${kzShort(c)}). Salário: ${kzShort(w)}/ano cada.`);
  toast(`👥 +${k} funcionário(s) em ${N.t}`); checkConq(); save(); refresh();
}
function fire(i) {
  const n = negFix(G.negocios[i]), w = negWage(n), N = negT(n.id); if (!n.func) return;
  const c = Math.round(w * .25); if (!pay(c)) return;
  n.func--; addLog(`📦 Despediste 1 funcionário de ${N.t} (indemnização ${kzShort(c)}). ` + fx({ karma: -1 }));
  save(); refresh();
}
function openFilial(i) {
  const n = negFix(G.negocios[i]), N = negT(n.id);
  if (n.nivel < 3) return toast('Só podes abrir filiais com o negócio no nível 3 (Grande).');
  if (n.fil >= 12) return toast('Já tens o máximo de filiais.');
  const c = filialCusto(n), bairro = pick(['Viana', 'Cacuaco', 'Talatona', 'Kilamba', 'Benfica', 'Cazenga', 'Huambo', 'Benguela', 'Lubango', 'Lobito', 'Cabinda', 'Malanje']);
  doAct(c, () => { n.fil++; n.filiais = (n.filiais || []).concat(bairro); return `🏬 Abriste uma filial de <b>${N.t}</b> em ${bairro}! Agora tens ${n.fil} filial(is). Contrata pessoal para ela render. ` + fx({ fama: 3, felicidade: 6 }); }, 'cheer');
}
function closeFilial(i) {
  const n = G.negocios[i]; if (!n.fil) return; if (!confirm('Fechar uma filial? Recebes 40% do investimento.')) return;
  const v = Math.round(filialCusto(n) * .4 / 1.25); n.fil--; (n.filiais || []).pop(); n.func = Math.min(n.func, negNeed(n) + 2); G.dinheiro += v;
  addLog(`🏬 Fechaste uma filial de ${negT(n.id).t} (+${kzShort(v)}).`); save(); refresh();
}
function negAno(S) {
  G.negocios.forEach(n => {
    negFix(n); const N = negT(n.id); n.anos++;
    if (n.gerente) n.gestao = Math.max(n.gestao, 62); else n.gestao = clamp(n.gestao - R(10, 20) - n.fil * 3);
    if (G.grupo) n.gestao = Math.max(n.gestao, 45);   // a holding faz auditoria e controlo: a gestão nunca cai abaixo de 45
    const units = NIV_M[n.nivel - 1] * (1 + .75 * n.fil), need = negNeed(n), r = need ? Math.min(1, n.func / need) : 1, extra = Math.min(.2, Math.max(0, n.func - need) * .04);
    let rev = N.base * units * (.45 + n.gestao / 100) * (.75 + S.inteligencia / 200) * (Math.random() * .8 + .6) * cid().sal * (.35 + .65 * r);
    if (talento('negocio')) rev *= 1.35; if (N.bonus && G.tecnicos.includes(N.bonus)) rev *= 1.25; if (G.grupo) rev *= 1.1; rev *= 1 + extra;
    const wages = n.func * negWage(n);
    let v = rev - N.base * .25 * units * cid().sal - wages;
    if (chance(N.risco || .06)) v = -Math.abs(N.base * units * R(20, 60) / 100);
    if (n.gerente && v > 0) v *= .85;
    n.ult = Math.round(v); n.folha = wages; G.dinheiro += n.ult; n.med = n.med == null ? n.ult : Math.round(n.med * .6 + n.ult * .4);
    addLog(`${N.ico} ${N.t}${n.fil ? ` (+${n.fil} filiais)` : ''}: ${n.ult >= 0 ? 'lucro' : 'prejuízo'} de ${kzShort(n.ult)}${n.func ? ` · ${n.func} funcionários` : ''}${r < .7 ? ' · ⚠️ falta pessoal' : ''}.`, n.ult >= 0 ? '' : 'bad');
  });
}

/* ---------------- GRUPO EMPRESARIAL ---------------- */
const grupoReq = () => { const f = []; if (G.negocios.length < 3) f.push(`3 empresas (tens ${G.negocios.length})`); const sn = G.negocios.reduce((s, n) => s + n.nivel, 0); if (sn < 9) f.push(`soma de níveis 9+ (tens ${sn})`); if (totFunc() < 10) f.push(`10 funcionários (tens ${totFunc()})`); return f; };
const GRUPO_CUSTO = 25000000;
function foundGrupo() {
  if (G.grupo) return; const f = grupoReq(); if (f.length) return toast('❌ Requer: ' + f.join(', '));
  const nome = 'Grupo ' + G.nome.split(' ').slice(-1)[0];
  doAct(GRUPO_CUSTO, () => { G.grupo = { nome, ano: G.ano, ipo: false }; return `🏛️ Fundaste o <b>${nome}</b>! Holding, auditoria e marca única: todas as empresas rendem +10%. És agora CEO do teu próprio grupo. ` + fx({ fama: 10, felicidade: 12 }); }, 'cheer');
}
const valorGrupo = () => G.negocios.reduce((s, n) => s + negValor(n), 0);
function ipoGrupo() {
  if (!G.grupo || G.grupo.ipo) return; const v = valorGrupo(); if (v < 2e9) return toast('O grupo precisa de valer pelo menos 2 mil milhões de Kz para entrar em bolsa.');
  if (!confirm(`Vender 25% do ${G.grupo.nome} na BODIVA por ${kz(Math.round(v * .25))}?`)) return;
  doAct(0, () => { const c = Math.round(v * .25); G.dinheiro += c; G.grupo.ipo = true; return `🔔 O <b>${G.grupo.nome}</b> entrou na BODIVA! Encaixaste ${kzShort(c)} e és o rosto do capitalismo angolano. ` + fx({ fama: 15, felicidade: 15 }); }, 'cheer');
}

/* ---------------- IMOBILIÁRIO: terrenos, obras, arrendamento ---------------- */
const ZONAS = [
  { id: 'cacuaco', t: 'Cacuaco', ico: '🌾', m2: 12000, rf: .5 },
  { id: 'viana', t: 'Viana', ico: '🏭', m2: 16000, rf: .6 },
  { id: 'camama', t: 'Camama', ico: '🏘️', m2: 30000, rf: .8 },
  { id: 'kilamba', t: 'Kilamba', ico: '🏢', m2: 45000, rf: 1 },
  { id: 'talatona', t: 'Talatona', ico: '🏡', m2: 120000, rf: 1.8 },
  { id: 'ilha', t: 'Ilha de Luanda', ico: '🏖️', m2: 260000, rf: 2.6 },
];
const LOTES = [{ t: 'Pequeno', m2: 400 }, { t: 'Médio', m2: 1500 }, { t: 'Grande', m2: 5000 }];
const PROJ = [
  { id: 'vivenda', t: 'Vivenda T4', ico: '🏡', lote: 0, custo: 45e6, anos: 1, un: 1, renda: 4.2e6, venda: 95e6, d: '1 casa de luxo' },
  { id: 'predio4', t: 'Prédio de 4 andares', ico: '🏢', lote: 1, custo: 320e6, anos: 2, un: 8, renda: 4.8e6, venda: 58e6, d: '8 apartamentos T3' },
  { id: 'centro', t: 'Centro comercial de bairro', ico: '🏬', lote: 1, custo: 480e6, anos: 2, un: 12, renda: 5.4e6, venda: 52e6, d: '12 lojas' },
  { id: 'torre', t: 'Torre residencial (12 pisos)', ico: '🏙️', lote: 2, custo: 2.2e9, anos: 3, un: 36, renda: 5.4e6, venda: 85e6, d: '36 apartamentos' },
  { id: 'escrit', t: 'Torre de escritórios (20 pisos)', ico: '🏛️', lote: 2, custo: 4e9, anos: 4, un: 20, renda: 22e6, venda: 280e6, d: '20 pisos de escritórios' },
];
const zonaT = id => ZONAS.find(z => z.id === id), projT = id => PROJ.find(p => p.id === id);
const terrenoPreco = (z, l) => Math.round(zonaT(z).m2 * LOTES[l].m2);
const temConstrutora = () => G.negocios.some(n => n.id === 'construtora');
function obraCusto(p) { let c = projT(p).custo * cid().custo; if (temConstrutora()) c *= .8; if (G.cursosFeitos.some(x => ['civil', 'arquitetura'].includes(x))) c *= .9; return Math.round(c); }
const obraAnos = p => Math.max(1, projT(p).anos - (temConstrutora() ? 1 : 0));
function edValorUn(t) { const P = projT(t.ed.p), Z = zonaT(t.zona); return Math.round(P.venda * Z.rf * (t.ed.val || 1)); }
function imobValor() {
  return (G.terrenos || []).reduce((s, t) => {
    let v = t.valor;
    if (t.obra) v += t.obra.pago;
    if (t.ed) v += (t.ed.un - t.ed.vend) * edValorUn(t) * .85;
    return s + v;
  }, 0);
}
function buyTerreno(z, l) {
  G.terrenos = G.terrenos || []; if (G.idade < 18) return toast('Só maiores de 18 podem comprar terrenos.');
  if (G.terrenos.length >= 10) return toast('Já tens 10 terrenos. Constrói ou vende algum.');
  const c = terrenoPreco(z, l), Z = zonaT(z);
  doAct(Math.round(c * 1.04), () => { G.terrenos.push({ zona: z, lote: l, valor: c, obra: null, ed: null }); return `🗺️ Compraste um terreno ${LOTES[l].t.toLowerCase()} (${LOTES[l].m2} m²) em <b>${Z.t}</b> por ${kzShort(c)} (+4% de escritura). ` + fx({ felicidade: 5 }); }, 'cheer');
}
function sellTerreno(i) {
  const t = G.terrenos[i]; if (t.obra) return toast('Não podes vender com uma obra a decorrer.');
  const v = Math.round(t.valor * .95 + (t.ed ? (t.ed.un - t.ed.vend) * edValorUn(t) * .9 : 0));
  if (!confirm(`Vender ${t.ed ? 'o terreno e o edifício' : 'o terreno'} em ${zonaT(t.zona).t} por ${kz(v)}?`)) return;
  G.terrenos.splice(i, 1); G.dinheiro += v; addLog(`🗺️ Vendeste a propriedade em ${zonaT(t.zona).t} por ${kzShort(v)}.`, 'good'); save(); refresh();
}
function buildPicker(i) {
  const t = G.terrenos[i], Z = zonaT(t.zona);
  openModal(`<div class="mico">🏗️</div><h3>Construir em ${Z.t}</h3><p class="center">Terreno ${LOTES[t.lote].t.toLowerCase()} · ${LOTES[t.lote].m2} m². Pagas 40% no arranque e o resto durante a obra.${temConstrutora() ? '<br>🏗️ A tua Construtora faz a obra 20% mais barata e 1 ano mais rápida.' : ''}</p>
    <div class="list" style="margin-top:12px">${PROJ.map(P => {
      const c = obraCusto(P.id), ok = t.lote >= P.lote;
      return btnItem(P.ico, P.t, ok ? `${P.d} · ${obraAnos(P.id)} ano(s) · renda ~${kzShort(P.renda * Z.rf * P.un)}/ano · venda ~${kzShort(P.venda * Z.rf * P.un)}` : `❌ Precisa de terreno ${LOTES[P.lote].t.toLowerCase()} ou maior`, kzShort(c), `closeModal();startObra(${i},'${P.id}')`, !ok);
    }).join('')}</div><div class="choices"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button></div>`, true);
}
function startObra(i, p) {
  const t = G.terrenos[i], P = projT(p), c = obraCusto(p), ent = Math.round(c * .4);
  doAct(ent, () => { t.obra = { p, total: c, pago: ent, anos: obraAnos(p), parada: 0 }; return `🏗️ Começou a obra: <b>${P.t}</b> em ${zonaT(t.zona).t}! Entrada de ${kzShort(ent)}; faltam ${kzShort(c - ent)} em ${t.obra.anos} ano(s). ` + fx({ fama: 2, felicidade: 5 }); }, 'cheer');
}
function speedObra(i) {
  const t = G.terrenos[i], o = t.obra; if (!o) return; const falta = o.total - o.pago, extra = Math.round(o.total * .1);
  if (!confirm(`Pagar tudo agora (${kz(falta + extra)}, inclui 10% de horas extra) e terminar a obra já?`)) return;
  if (!pay(falta + extra)) return; o.pago = o.total; o.anos = 0; finishObra(t); save(); refresh();
}
function finishObra(t) {
  const P = projT(t.obra.p); t.ed = { p: t.obra.p, un: P.un, vend: 0, arr: true, val: 1 }; t.obra = null;
  addLog(`🎉 Obra concluída: <b>${P.ico} ${P.t}</b> em ${zonaT(t.zona).t}! ${P.un} fração(ões) prontas a arrendar ou vender.`, 'gold'); checkConq();
}
function toggleArr(i) { const t = G.terrenos[i]; t.ed.arr = !t.ed.arr; addLog(t.ed.arr ? `🔑 Puseste ${projT(t.ed.p).t} em ${zonaT(t.zona).t} a arrendar.` : `🔒 Tiraste ${projT(t.ed.p).t} do arrendamento.`); save(); refresh(); }
function sellFracao(i, all) {
  const t = G.terrenos[i], left = t.ed.un - t.ed.vend; if (!left) return;
  const k = all ? left : 1, v = Math.round(edValorUn(t) * k * R(90, 110) / 100);
  if (all && !confirm(`Vender as ${k} frações restantes por ~${kz(v)}?`)) return;
  t.ed.vend += k; G.dinheiro += v; addLog(`💰 Vendeste ${k} fração(ões) de ${projT(t.ed.p).t} (${zonaT(t.zona).t}) por ${kzShort(v)}.`, 'good');
  if (t.ed.vend >= t.ed.un) { addLog(`🏁 Vendeste o edifício todo em ${zonaT(t.zona).t}. O terreno também passou para os compradores.`); G.terrenos.splice(i, 1); }
  checkConq(); save(); refresh();
}
function imobAno() {
  (G.terrenos || []).forEach(t => {
    const Z = zonaT(t.zona);
    t.valor = Math.round(t.valor * (1 + R(-3, 10) / 100));
    if (t.obra) {
      const o = t.obra, prest = Math.round((o.total - o.pago) / Math.max(1, o.anos));
      if (G.dinheiro >= prest) { G.dinheiro -= prest; o.pago += prest; o.anos--; addLog(`🏗️ Obra de ${projT(o.p).t} (${Z.t}): -${kzShort(prest)}${o.anos > 0 ? `, faltam ${o.anos} ano(s)` : ''}.`); if (o.anos <= 0) finishObra(t); }
      else { o.parada++; addLog(`⚠️ A obra em ${Z.t} parou por falta de dinheiro (${kzShort(prest)} em falta).`, 'bad'); }
    } else if (t.ed) {
      t.ed.val = (t.ed.val || 1) * (1 + R(-3, 8) / 100);
      const P = projT(t.ed.p), left = t.ed.un - t.ed.vend;
      if (t.ed.arr && left) {
        const occ = R(65, 100) / 100, bruto = P.renda * Z.rf * left * occ * cid().custo, liq = Math.round(bruto * .88);
        G.dinheiro += liq; t.ed.ult = liq; addLog(`🔑 Rendas de ${P.t} em ${Z.t} (${Math.round(occ * 100)}% ocupado): +${kzShort(liq)}.`);
      } else t.ed.ult = 0;
    }
  });
}

/* ---------------- ANO DO IMPÉRIO ---------------- */
function empireYear(S) {
  negAno(S); imobAno();
  if (G.grupo) { fx({ fama: 1 }); if (G.grupo.ipo) { const d = Math.round(valorGrupo() * .02); G.dinheiro += d; addLog(`🔔 Dividendos do ${G.grupo.nome} na BODIVA: +${kzShort(d)}.`); } }
  if (G.emprego) { const j = job(G.emprego.id); if (j.mult && G.emprego.nivel >= j.niv.length - 1) { const b = Math.round(salario(G.emprego) * .3); G.dinheiro += b; addLog(`👔 Bónus e ações de ${jobTitle(G.emprego)}: +${kzShort(b)}.`, 'good'); fx({ fama: 2 }); } }
}
const rendAnual = () => (G.emprego ? salario(G.emprego) : 0) + (G.part ? salario(G.part) : 0) + G.negocios.reduce((s, n) => s + (n.med != null ? n.med : (n.ult || 0)), 0) + (G.terrenos || []).reduce((s, t) => s + (t.ed && t.ed.ult || 0), 0) + G.imoveis.reduce((s, im) => s + (im.inq ? casaT(im.id).renda * .9 : 0), 0);

/* =========================================================
   UI
   ========================================================= */
const ETAPAS = [
  ['💼', 'Primeiro emprego', () => G.historico.length > 0],
  ['🏪', 'Abrir a primeira empresa', () => G.negocios.length > 0],
  ['👥', 'Contratar funcionários', () => totFunc() > 0],
  ['🏬', 'Abrir uma filial', () => totFil() > 0],
  ['🗺️', 'Comprar um terreno', () => (G.terrenos || []).length > 0],
  ['🏗️', 'Construir um prédio', () => (G.terrenos || []).some(t => t.ed)],
  ['🏛️', 'Fundar um Grupo Empresarial', () => !!G.grupo],
  ['👔', 'Chegar a CEO', () => !!G.grupo || G.conq.includes('ceo')],
  ['💎', 'Património de 1 mil milhões', () => patrimonio() >= 1e9],
  ['🔔', 'Entrar na bolsa (BODIVA)', () => !!(G.grupo && G.grupo.ipo)],
];
function imperioUI() {
  let h = energyBar();
  const done = ETAPAS.filter(e => e[2]()).length;
  h += `<div class="grid2"><div class="kpi">💎 Património<b>${kzShort(patrimonio())}</b></div><div class="kpi">📈 Rendimento anual<b class="${rendAnual() >= 0 ? 'g' : 'r'}">${kzShort(rendAnual())}</b></div><div class="kpi">🏪 Empresas<b>${G.negocios.length} · ${totFil()} filiais</b></div><div class="kpi">👥 Funcionários<b>${totFunc()}</b></div><div class="kpi">🏗️ Imóveis & terrenos<b>${(G.terrenos || []).length + G.imoveis.length}</b></div><div class="kpi">🏛️ Grupo<b>${G.grupo ? G.grupo.nome : '—'}</b></div></div>`;
  h += sec(`Caminho do império · ${done}/${ETAPAS.length}`) + `<div class="bar rel" style="margin:0 2px 10px"><i style="width:${done / ETAPAS.length * 100}%;background:#ffcb00"></i></div>`;
  h += `<div class="etapas">${ETAPAS.map(([ico, t, f]) => `<div class="etp ${f() ? 'ok' : ''}"><span>${ico}</span>${t}</div>`).join('')}</div>`;
  h += sec('Grupo empresarial');
  if (!G.grupo) {
    const f = grupoReq();
    h += noteBox('🏛️ Junta as tuas empresas numa <b>holding</b>: +10% em todas as empresas, mais valor de mercado e o título de CEO do grupo.') + list([btnItem('🏛️', 'Fundar o Grupo ' + esc(G.nome.split(' ').slice(-1)[0]), f.length ? reqTxt(f) : 'Registo, auditoria e marca única', kzShort(GRUPO_CUSTO), 'foundGrupo()', f.length || G.idade < 18)]);
  } else {
    const v = valorGrupo();
    h += list([infoItem('🏛️', G.grupo.nome + (G.grupo.ipo ? ' <span class="tag">cotado na BODIVA</span>' : ''), `Fundado em ${G.grupo.ano} · ${G.negocios.length} empresas · ${totFunc()} funcionários · valor ${kzShort(v)}`),
      btnItem('🔔', 'Entrar em bolsa (IPO na BODIVA)', G.grupo.ipo ? 'Já estás cotado: recebes dividendos todos os anos' : v < 2e9 ? `Precisa de valer 2 mil milhões (vale ${kzShort(v)})` : 'Vende 25% do grupo aos investidores', G.grupo.ipo ? '' : kzShort(v * .25), 'ipoGrupo()', G.grupo.ipo || v < 2e9)]);
  }
  return h;
}
function negociosUI() {
  let h = energyBar();
  if (G.idade < 14) return h + tooYoung(14, 'ter um negócio');
  if (G.negocios.length) h += sec('As tuas empresas') + list(G.negocios.map((n, i) => {
    negFix(n); const N = negT(n.id), need = negNeed(n), w = negWage(n), falta = need - n.func;
    return `<div class="item col"><div class="row"><div class="ico">${N.ico}</div><div class="tx"><div class="t1">${N.t} <span class="tag">nível ${n.nivel}</span>${n.fil ? ` <span class="tag">${n.fil} filial(is)</span>` : ''}${n.gerente ? ' <span class="tag">gerente</span>' : ''}</div>
      <div class="t2">Último ano: <b class="${(n.ult || 0) >= 0 ? 'g' : 'r'}">${n.ult == null ? '—' : kzShort(n.ult)}</b> · valor ${kzShort(negValor(n))}${n.med != null ? ` · média ${kzShort(n.med)}` : ''}</div>${(n.ult || 0) < 0 && !n.gerente && n.gestao < 45 ? '<div class="t2 r">⚠️ Prejuízo por falta de gestão: usa 📋 Gerir ou contrata um 👔 Gerente.</div>' : ''}
      <div class="t2">👥 Funcionários: <b class="${falta > 0 ? 'r' : 'g'}">${n.func}/${need}</b> · salário ${kzShort(w)}/ano cada${falta > 0 ? ' · ⚠️ falta pessoal, a empresa rende menos' : ''}${n.filiais && n.filiais.length ? `<br>🏬 Filiais: ${n.filiais.join(', ')}` : ''}</div>
      <div class="t2">Gestão</div><div class="bar rel"><i style="width:${n.gestao}%;background:#3fa9ff"></i></div></div></div>
      <div class="btns">${chip('📋 Gerir', `manageNeg(${i})`)}${falta > 0 ? chip(`👥 Contratar ${falta} (${kzShort(w * .1 * falta)})`, `hire(${i},'ideal')`) : ''}${chip('+1 👤', `hire(${i},1)`)}${n.func ? chip('−1 👤', `fire(${i})`) : ''}${n.nivel < 5 ? chip(`📈 Expandir (${kzShort(N.p * n.nivel * 1.2)})`, `expandNeg(${i})`) : ''}${n.nivel >= 3 && n.fil < 12 ? chip(`🏬 Filial (${kzShort(filialCusto(n))})`, `openFilial(${i})`) : ''}${n.fil ? chip('Fechar filial', `closeFilial(${i})`) : ''}${chip(n.gerente ? 'Dispensar gerente' : '👔 Gerente', `toggleGerente(${i})`)}${chip('Vender', `sellNeg(${i})`)}</div></div>`;
  }));
  h += sec('Abrir empresa (+5% alvará)') + noteBox('📊 Cada empresa precisa de <b>funcionários</b> (salários pagos todos os anos). No <b>nível 3</b> podes abrir <b>filiais</b> noutros bairros e províncias. Sem gestão, a qualidade cai — um gerente fica com 15% do lucro.');
  h += list(NEG.map(N => { const f = negReq(N), tem = G.negocios.some(n => n.id === N.id); return btnItem(N.ico, N.t + (tem ? ' <span class="tag">tens</span>' : ''), (f.length ? reqTxt(f) : `Lucro base ~${kzShort(N.base * .55)}/ano · ${Math.max(0, negStaffBase(N) - 1)} funcionário(s) no início`) + (N.bonus ? ` · bónus com técnico de ${TECNICOS.find(t => t.id === N.bonus).t}` : ''), kzShort(N.p), `openNeg('${N.id}')`, f.length || tem); }));
  return h;
}
function carreiraUI() {
  let h = energyBar();
  const e = G.emprego, j = e && job(e.id);
  if (e && j.niv) {
    const nx = e.nivel + 1 < j.niv.length ? j.niv[e.nivel + 1] : null, nr = nx && j.nivReq && j.nivReq[e.nivel + 1], nf = nr ? reqOk(nr) : [];
    h += sec('A tua carreira') + `<div class="ladder">${j.niv.map((n, i) => `<div class="lv ${i < e.nivel ? 'past' : i === e.nivel ? 'cur' : ''}"><b>${i + 1}</b><span>${n}</span>${j.mult ? `<small>${kzShort(j.sal * j.mult[i] * cid().sal)}/ano</small>` : ''}</div>`).join('')}</div>`;
    h += noteBox(nx ? `🚀 Próximo cargo: <b>${nx}</b> · ${e.anosNivel}/2 anos no cargo · desempenho ${e.desemp}/100${nf.length ? `<br>❌ Requer: ${nf.join(', ')}` : '<br>✅ Cumpres os requisitos do próximo cargo'}` : '👑 Chegaste ao topo! Recebes bónus e ações todos os anos.') + list([btnItem('💪', 'Trabalhar no duro', 'Sobe o desempenho', '', 'workHard()'), btnItem('🚀', 'Pedir promoção', 'Precisa de 2+ anos no cargo e bom desempenho', '', 'askPromo()', !nx)]);
  }
  h += sec('Carreiras até CEO') + noteBox('👔 Entra numa grande empresa, sobe de cargo em cargo e chega a <b>CEO</b>. Os cargos de topo pedem licenciatura, mestrado e inteligência.');
  h += list(CORP_JOBS.map(c => {
    const f = reqOk(c.req), mine = e && e.id === c.id;
    return `<div class="item col"><div class="row"><div class="ico">${c.ico}</div><div class="tx"><div class="t1">${c.t}${mine ? ' <span class="tag">o teu</span>' : ''}</div><div class="t2">${c.niv.join(' → ')}</div><div class="t2">${reqTxt(f)} · entra com ${kzShort(c.sal * cid().sal)}/ano · CEO ganha ~${kzShort(c.sal * c.mult[5] * cid().sal)}</div></div></div>
      <div class="btns">${chip(mine ? 'Já trabalhas aqui' : 'Candidatar-me', `applyJob('${c.id}')`, f.length || mine)}</div></div>`;
  }));
  return h;
}
function terrenosUI() {
  let h = energyBar(); G.terrenos = G.terrenos || [];
  if (G.idade < 18) return h + tooYoung(18, 'comprar terrenos e construir');
  h += noteBox(`🏗️ Compra terrenos, constrói prédios e vive das rendas — ou vende as frações com lucro.${temConstrutora() ? ' <b>A tua Construtora dá-te 20% de desconto e obras mais rápidas.</b>' : ' Ter uma <b>Construtora</b> torna as obras mais baratas.'}`);
  if (G.terrenos.length) h += sec('As tuas propriedades') + list(G.terrenos.map((t, i) => {
    const Z = zonaT(t.zona), L = LOTES[t.lote];
    let st = '', b = '';
    if (t.obra) { const P = projT(t.obra.p); st = `🏗️ Em obra: <b>${P.t}</b> · ${Math.round(t.obra.pago / t.obra.total * 100)}% pago · faltam ${t.obra.anos} ano(s)${t.obra.parada ? ' · ⚠️ esteve parada' : ''}`; b = chip(`⚡ Acabar já (${kzShort(t.obra.total - t.obra.pago + t.obra.total * .1)})`, `speedObra(${i})`); }
    else if (t.ed) { const P = projT(t.ed.p), left = t.ed.un - t.ed.vend; st = `${P.ico} <b>${P.t}</b> · ${left}/${t.ed.un} frações tuas · ${t.ed.arr ? `a arrendar (último ano ${kzShort(t.ed.ult || 0)})` : 'vazias'} · fração vale ~${kzShort(edValorUn(t))}`; b = chip(t.ed.arr ? '🔒 Parar arrendamento' : '🔑 Arrendar', `toggleArr(${i})`) + chip('💰 Vender 1 fração', `sellFracao(${i},false)`) + chip('Vender tudo', `sellFracao(${i},true)`); }
    else { st = 'Terreno vazio — pronto a construir'; b = chip('🏗️ Construir', `buildPicker(${i})`) + chip('Vender', `sellTerreno(${i})`); }
    return `<div class="item col"><div class="row"><div class="ico">${Z.ico}</div><div class="tx"><div class="t1">${Z.t} <span class="tag">${L.t} · ${L.m2} m²</span></div><div class="t2">Terreno vale ${kzShort(t.valor)}</div><div class="t2">${st}</div></div></div><div class="btns">${b}</div></div>`;
  }));
  h += sec('Comprar terreno (+4% escritura)');
  h += `<div class="ztable"><div class="zr zh"><span>Zona</span>${LOTES.map(l => `<span>${l.t}<small>${l.m2} m²</small></span>`).join('')}</div>${ZONAS.map(Z => `<div class="zr"><span>${Z.ico} ${Z.t}<small>rendas ×${Z.rf}</small></span>${LOTES.map((l, li) => { const p = terrenoPreco(Z.id, li); return `<button class="chip" onclick="buyTerreno('${Z.id}',${li})" ${G.dinheiro < p * 1.04 ? 'disabled style="opacity:.4"' : ''}>${kzShort(p)}</button>`; }).join('')}</div>`).join('')}</div>`;
  h += sec('O que podes construir') + list(PROJ.map(P => infoItem(P.ico, P.t, `${P.d} · terreno ${LOTES[P.lote].t.toLowerCase()}+ · ${obraAnos(P.id)} ano(s) de obra · renda base ${kzShort(P.renda)}/fração/ano`, kzShort(obraCusto(P.id)))));
  return h;
}

/* ---------- novos locais no mapa ---------- */
Object.assign(PANELS, {
  empresa:  { ico: '🏢', t: 'Torre Empresarial', sub: () => G.grupo ? G.grupo.nome + ' · o teu império' : 'Empresas, carreira e o teu império', tabs: [['imp', '👑 Império', imperioUI], ['neg', '🏪 Empresas', negociosUI], ['car', '📈 Carreira', carreiraUI]] },
  obras:    { ico: '🏗️', t: 'Terrenos & Obras', sub: 'Compra terrenos, constrói e arrenda', tabs: [['ter', '🗺️ Terrenos & Prédios', terrenosUI]] },
  shopping: { ico: '🛍️', t: 'Kianda Mall', sub: 'Moda, tecnologia e stand automóvel', tabs: [['bout', '🛍️ Roupa', boutiqueUI], ['loja', '🚗 Stand & Tecnologia', lojaUI]] },
});
PANELS.mercado.t = 'Mercado do Roque';
PANELS.mercado.tabs.forEach(t => { if (t[0] === 'neg') t[2] = negociosUI; });
PANELS.banco.tabs.forEach(t => { if (t[0] === 'imo') t[2] = imobUI; });
