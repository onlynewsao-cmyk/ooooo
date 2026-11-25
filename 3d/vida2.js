/* =========================================================
   PRÓXIMA ENCARNAÇÃO — "Vida 2": universidades e faculdades,
   qualificação/respeito, painéis bloqueados ricos, táxi 3D,
   caminhar até aos edifícios, energia equilibrada, interiores
   com objetos e pessoas com quem falar.
   Carregado depois de extra.js.
   ========================================================= */
const V2 = { prev: false, ride: null, sit: null, talk: null, walkT: 0, regenT: 0, uiT: 0, rec: null };
const V2_REGEN_S = 45;                 // 1 ponto de energia a cada 45 s de jogo
function v2G() {
  if (!G) return {};
  if (!G.v2) G.v2 = {};
  const d = { anosUni: 0, exp: 0, graus: [], regen: 0, regenAno: -1, bolsa: false, estAno: -1, bolsaTry: -1, festaAno: -1, exame: {}, rej: {}, cd: {}, pAno: -1, pInt: 0, pFel: 0, talkAno: -1, talkN: 0, pcAno: -1, dormAno: -1 };
  for (const k in d) if (G.v2[k] === undefined) G.v2[k] = d[k];
  return G.v2;
}

/* =========================================================
   1) CURSOS, EMPREGOS E UNIVERSIDADES
   ========================================================= */
[
  { id: 'farmacia', t: 'Ciências Farmacêuticas', ico: '💊', anos: 5, area: ['cfb', 'saude'], dif: .08 },
  { id: 'geologia', t: 'Geologia e Minas', ico: '🪨', anos: 5, area: ['cfb'], dif: .08 },
  { id: 'agronomia', t: 'Agronomia', ico: '🌾', anos: 5, area: ['cfb'], dif: -.02 },
  { id: 'ri', t: 'Relações Internacionais', ico: '🌍', anos: 4, area: ['cej', 'hum'], dif: .04 },
  { id: 'design', t: 'Design Gráfico e Multimédia', ico: '🎨', anos: 4, area: ['hum', 'info'], dif: 0 },
  { id: 'turismo', t: 'Turismo e Hotelaria', ico: '🛎️', anos: 4, area: ['hum', 'cej'], dif: -.04 },
].forEach(c => { if (!CURSOS.some(x => x.id === c.id)) CURSOS.push(c); });
[
  { id: 'farmaceutico', t: 'Farmacêutico(a)', ico: '💊', cat: 'Superior', sal: 5200000, req: { curso: 'farmacia' }, outfit: 'medico', niv: ['Farmacêutico(a) Estagiário(a)', 'Farmacêutico(a)', 'Diretor(a) Técnico(a)', 'Dono(a) de Rede de Farmácias'] },
  { id: 'geologo', t: 'Geólogo(a) de Minas', ico: '🪨', cat: 'Superior', sal: 9600000, req: { curso: 'geologia' }, niv: ['Geólogo(a) Júnior', 'Geólogo(a)', 'Chefe de Exploração', 'Diretor(a) de Minas'] },
  { id: 'agronomo', t: 'Engenheiro(a) Agrónomo(a)', ico: '🌾', cat: 'Superior', sal: 4200000, req: { curso: 'agronomia' }, niv: ['Técnico(a) Agrícola', 'Agrónomo(a)', 'Gestor(a) de Fazenda', 'Diretor(a) Agroindustrial'] },
  { id: 'diplomata', t: 'Diplomata', ico: '🌍', cat: 'Superior', sal: 7800000, req: { curso: 'ri', idade: 25, limpo: true }, outfit: 'executivo', niv: ['Adido(a)', 'Secretário(a) de Embaixada', 'Conselheiro(a)', 'Embaixador(a)'] },
  { id: 'designer', t: 'Designer Gráfico', ico: '🎨', cat: 'Superior', sal: 3600000, req: { curso: 'design' }, niv: ['Designer Júnior', 'Designer', 'Diretor(a) de Arte', 'Diretor(a) Criativo(a)'] },
  { id: 'hoteleiro', t: 'Gestor(a) Hoteleiro', ico: '🛎️', cat: 'Superior', sal: 4400000, req: { curso: 'turismo' }, outfit: 'executivo', niv: ['Rececionista Chefe', 'Gestor(a) de Hotel', 'Diretor(a) Regional', 'Diretor(a) de Cadeia Hoteleira'] },
].forEach(j => { if (!JOBS.some(x => x.id === j.id)) JOBS.push(j); });

const V2_UNI = {
  uan: {
    id: 'uan', sig: 'UAN', n: 'Universidade Agostinho Neto', pub: true, prest: 10, pk: 0, cor: '#0d3b66', face: '#efe6d2', glass: '#284a6e', kind: 'office',
    lema: 'Pública · exame de acesso · a mais prestigiada', bx: 66, w: 28, h: 14, wall: '#f1ebdd', floor: '#9a6a3e', desk: '#c9a46a',
    fac: [['Faculdade de Medicina', ['medicina', 'farmacia']], ['Faculdade de Engenharia', ['petroleos', 'civil', 'geologia']], ['Faculdade de Direito', ['direito']], ['Faculdade de Economia', ['economia']], ['Faculdade de Ciências Agrárias', ['agronomia']], ['Faculdade de Ciências Sociais', ['psicologia', 'comunicacao']]],
  },
  ukianda: {
    id: 'ukianda', sig: 'UPK', n: 'Universidade Privada Kianda', pub: false, prest: 7, pk: 1.15, req: 55, cor: '#7a1f5c', face: '#f4eef2', glass: '#5a2a6e', kind: 'glass',
    lema: 'Privada · entrada direta · cara e moderna', bx: -60, w: 22, h: 12, wall: '#f6f0f4', floor: '#6b4a5a', desk: '#e4d6de',
    fac: [['Faculdade de Ciências da Saúde', ['medicina', 'enfermagem', 'psicologia']], ['Faculdade de Direito e Relações Internacionais', ['direito', 'ri']], ['Faculdade de Arquitetura e Design', ['arquitetura', 'design']], ['Kianda Business School', ['gestao', 'economia']]],
  },
  ispm: {
    id: 'ispm', sig: 'ISPM', n: 'Instituto Superior Politécnico Mulemba', pub: false, prest: 5, pk: .6, req: 0, cor: '#1f7a4a', face: '#e9f3ec', glass: '#1d5a3a', kind: 'glass',
    lema: 'Privado · propinas baixas · cursos práticos', bx: -122, w: 24, h: 10, wall: '#eef5ef', floor: '#8a7a5a', desk: '#cfd8c9',
    fac: [['Escola de Tecnologias', ['informatica', 'civil', 'petroleos']], ['Escola de Gestão e Turismo', ['gestao', 'turismo']], ['Escola de Educação e Comunicação', ['educacao', 'comunicacao']], ['Escola de Enfermagem', ['enfermagem']]],
  },
};
const V2_UIDS = Object.keys(V2_UNI);
const v2Curso = id => CURSOS.find(c => c.id === id);
const v2Offers = (U, cid) => U.fac.some(f => f[1].includes(cid));
const v2Prop = (U, c) => U.pub ? PROP_PUB : Math.round(PROP_PRIV * U.pk * (c.id === 'medicina' ? 2 : 1) / 1000) * 1000;
Object.values(V2_UNI).forEach(U => {
  LOC_POS[U.id] = { x: U.bx, z: 166.8, ico: '🏛️', n: U.sig === 'UAN' ? 'Universidade Agostinho Neto' : U.n, zona: 'Cidade Universitária' };
  HIT_BOXES[U.id] = [U.bx, 181, U.w, 14, U.h];
});
LOC_POS.escola.n = 'Escola Secundária';

/* ---------- edifícios na Avenida dos Transportes (Cidade Universitária) ---------- */
function v2BuildCampus() {
  decor = new T.Group(); worldScene.add(decor);
  Object.values(V2_UNI).forEach(U => {
    const x = U.bx, z = 181, w = U.w, d = 14;
    bldg(x, z, w, d, U.h, { face: U.face, glass: U.glass, kind: U.kind, noTop: true, noShops: true });
    mesh(bx(w + .4, .9, .3), mat(U.cor), x, U.h - 1.2, z - d / 2 - .2, decor, false);
    U.signM = sign(U.n.toUpperCase(), Math.min(w - 3, 17), U.cor, '#ffffff', U.lema.toUpperCase(), x, U.pub ? 10.2 : 6.1, z - d / 2 - .3, Math.PI);
    canopy(x, z - d / 2 - 1.4, Math.min(12, w * .45), 2.8, 3.6, U.cor, '#ffffff', Math.PI);
    groundPatch(x - w / 2, 167.6, x + w / 2, 173.7, '#d9d1c2', .036);
    if (U.pub) { // pórtico com colunas
      for (let i = 0; i < 6; i++) mesh(cyl(.42, .48, 5.4, 12), mat('#f6f1e6'), x - 7.5 + i * 3, 2.7, z - d / 2 - 2.2, decor);
      mesh(bx(17.4, .7, 3), mat('#f6f1e6'), x, 5.7, z - d / 2 - 1.6, decor);
      { const sh = new T.Shape(); sh.moveTo(-9, 0); sh.lineTo(9, 0); sh.lineTo(0, 2.2); sh.lineTo(-9, 0); const tg = new T.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false }); mesh(tg, mat('#efe6d2'), x, 6.05, z - d / 2 - 3.1, decor); }
    }
    // mastros com bandeira
    [-1, 1].forEach(s => { const fx = x + s * (w / 2 - 1.5); mesh(cyl(.07, .07, 9, 6), mat('#d0d0d0', { metalness: .6 }), fx, 4.5, 169, decor); mesh(bx(.05, 1.1, 1.8), mat(s < 0 ? U.cor : '#c8102e'), fx, 8.2, 169.95, decor, false); });
    // bancos e árvores do campus
    [-1, 1].forEach(s => { mesh(bx(2.2, .12, .6), mat('#8a5a3a'), x + s * (w / 2 - 4.5), .48, 169.4, decor); mesh(bx(.12, .48, .5), mat('#555'), x + s * (w / 2 - 4.5) - .9, .24, 169.4, decor, false); mesh(bx(.12, .48, .5), mat('#555'), x + s * (w / 2 - 4.5) + .9, .24, 169.4, decor, false); });
    treeA(x - w / 2 + 1, 195, .9); treeA(x + w / 2 - 1, 195, .9);
  });
  worldScene.remove(decor); worldScene.add(mergeStatic(decor)); decor = null;
}
(function () { const _b = buildWorld; buildWorld = function () { const r = _b.apply(this, arguments); try { v2BuildCampus(); } catch (e) { console.error('v2BuildCampus', e); } return r; }; })();

/* =========================================================
   2) QUALIFICAÇÃO & RESPEITO
   ========================================================= */
const V2_LVL = [
  [0, 'Sem qualificação', '#ff5b5b', 'Só consegues trabalho informal e biscates.'],
  [20, 'Básico', '#ff9f43', 'Abre empregos simples e técnicos.'],
  [35, 'Qualificado(a)', '#ffcb00', 'Já te levam a sério nas entrevistas.'],
  [50, 'Muito qualificado(a)', '#7bd88f', 'Apto(a) para chefiar equipas.'],
  [65, 'Quadro superior', '#3fa9ff', 'Apto(a) para direção e grandes empresas.'],
  [80, 'Elite', '#c77dff', 'Respeitado(a) por todos — apto(a) para tudo.'],
];
const V2_APTO = [['Chefe de equipa', 35], ['Gestor(a) / Diretor(a)', 50], ['CEO de uma grande empresa', 62], ['Governador(a) / Deputado(a)', 68], ['Juiz(a) / Embaixador(a)', 75], ['Ministro(a)', 85]];
function v2BestGrau() { const v = v2G(); let b = null; v.graus.forEach(g => { const U = V2_UNI[g.u]; if (U && (!b || U.prest > V2_UNI[b.u].prest)) b = g; }); return b; }
function v2Qual() {
  const v = v2G(), parts = []; let s = 0;
  const add = (k, n) => { n = Math.round(n); if (n) parts.push([k, n]); s += n; };
  add('Escolaridade · ' + EDU[G.edu], [0, 4, 10, 18, 30, 38][G.edu] || 0);
  add(`Anos de universidade (${v.anosUni})`, Math.min(16, v.anosUni * 2.5));
  if (G.notaMedia) add(`Média (${G.notaMedia} valores)`, Math.max(0, Math.min(12, (G.notaMedia - 10) * 1.6)));
  const bg = v2BestGrau(); if (bg) add('Prestígio · ' + V2_UNI[bg.u].sig, V2_UNI[bg.u].prest * .8);
  add(`Experiência profissional (${Math.round(v.exp * 10) / 10} anos)`, Math.min(14, v.exp * 1.4));
  add('Cursos técnicos', Math.min(6, (G.tecnicos || []).length * 2));
  add('Fama e reputação', Math.min(6, G.stats.fama / 12));
  if (G.carta) add('Carta de condução', 2);
  if (G.cadastro) add('Cadastro criminal', -15);
  return { s: Math.max(0, Math.min(100, s)), parts };
}
const v2Lvl = s => V2_LVL.filter(l => s >= l[0]).pop();
function v2QualCard(full) {
  const q = v2Qual(), L = v2Lvl(q.s), v = v2G();
  let h = `<div class="v2q" style="--qc:${L[2]}"><div class="v2q-top"><div class="v2q-ring" style="--p:${q.s}"><b>${q.s}</b></div><div class="v2q-tx"><small>⭐ Respeito & Qualificação</small><b>${L[1]}</b><span>${L[3]}</span></div></div>`;
  h += `<div class="v2apt">${V2_APTO.map(([t, m]) => `<span class="${q.s >= m ? 'ok' : ''}">${q.s >= m ? '✅' : '🔒'} ${t}${q.s >= m ? '' : ` <i>${m}</i>`}</span>`).join('')}</div>`;
  if (full) {
    h += `<div class="v2qp">${q.parts.map(([k, n]) => `<div><span>${k}</span><b class="${n < 0 ? 'r' : 'g'}">${n > 0 ? '+' : ''}${n}</b></div>`).join('') || '<div><span>Ainda não tens pontos. Estuda, trabalha e evita a polícia!</span></div>'}</div>`;
    const k = v2SalK(null);
    h += `<div class="v2qn">📈 Bónus de salário por estudos: <b>+${Math.round((k - 1) * 100)}%</b> · 🚀 Promoções: <b>+${Math.round(v2PromoBonus())} pontos</b> de desempenho a teu favor</div>`;
  }
  return h + '</div>';
}
function v2SalK(e) {
  const v = v2G(), j = e ? job(e.id) : null;
  if (j && (j.informal || j.varFama || j.varSeg)) return 1;
  let k = 1 + Math.min(.24, v.anosUni * .03);
  const bg = v2BestGrau(); if (bg) k += V2_UNI[bg.u].prest * .006;
  if (j && j.req && j.req.curso) { const cs = [].concat(j.req.curso); if (v.graus.some(g => cs.includes(g.c) && g.n >= 16)) k += .04; }
  if (G.notaMedia >= 16) k += .03;
  return k;
}
function v2PromoBonus() { const v = v2G(), q = v2Qual().s; return Math.max(0, Math.min(22, v.anosUni * 2.2 + (q - 40) / 5)); }
function v2LegacyUni(e) { if (e && (e.tipo === 'univ') && !e.uni) { e.uni = e.pub ? 'uan' : 'ukianda'; } }

/* --- salário, promoções e candidaturas usam a qualificação --- */
(function () {
  const _sal = salario; salario = function (e) { const s = _sal.apply(this, arguments); try { return Math.round(s * v2SalK(e)); } catch (x) { return s; } };
  const _ap = askPromo; askPromo = function () {
    const e = G.emprego; if (!e) return _ap.apply(this, arguments);
    const b = v2PromoBonus(), niv = e.nivel; e.desemp += b;
    try { return _ap.apply(this, arguments); } finally { if (G.emprego === e && e.nivel === niv) e.desemp = Math.max(0, Math.min(100, e.desemp - b)); }
  };
  const _aj = applyJob; applyJob = function (id) {
    const v = v2G(), q = v2Qual().s, bonus = Math.max(0, q - 25) / 160, a0 = G.acoes, e0 = G.emprego, p0 = G.part;
    G.cunha = (G.cunha || 0) + bonus;
    try { return _aj.apply(this, arguments); }
    finally {
      if (G.cunha > 0) G.cunha = Math.max(0, Math.round((G.cunha - bonus) * 1000) / 1000);
      if (G.acoes < a0 && G.emprego === e0 && G.part === p0 && v.rej[id] !== G.ano) { v.rej[id] = G.ano; G.acoes++; setTimeout(() => toast('⚡ Não te aceitaram desta vez, mas a energia foi devolvida (1 vez por vaga, por ano).'), 900); save(); refresh(); }
    }
  };
  const _sy = schoolYear; schoolYear = function () {
    const v = v2G(), e = G.estudo, sup = e && (e.tipo === 'univ' || e.tipo === 'mestrado');
    if (sup) { v2LegacyUni(e); if (v.bolsa && e.tipo === 'univ' && e.prop) { e.prop0 = e.prop; e.prop = 0; } }
    const ano0 = sup ? e.ano : 0, had = sup && e.curso ? G.cursosFeitos.includes(e.curso) : false, mest0 = G.mestrado;
    const r = _sy.apply(this, arguments);
    if (sup) {
      const grad = e.tipo === 'univ' ? (!had && G.cursosFeitos.includes(e.curso)) : (!mest0 && G.mestrado);
      if ((G.estudo === e && e.ano > ano0) || grad) { v.anosUni++; addLog(`📈 Mais um ano de estudos superiores (${v.anosUni} no total): o teu salário futuro e a tua qualificação subiram.`, 'good'); }
      if (grad && e.tipo === 'univ') { v.graus.push({ c: e.curso, u: e.uni || 'uan', n: e.notaUlt || 10, ano: G.ano }); addLog(`🏛️ Diploma de ${v2Curso(e.curso).t} pela ${V2_UNI[e.uni || 'uan'].n}.`, 'gold'); }
      if (v.bolsa && (grad || G.estudo !== e)) { v.bolsa = false; }
      else if (v.bolsa && (e.notaUlt || 0) < 14) { v.bolsa = false; if (e.prop0) e.prop = e.prop0; addLog('📉 Perdeste a bolsa de mérito: a média do ano ficou abaixo de 14.', 'bad'); }
    }
    return r;
  };
  const _ag = ageUpLogic; ageUpLogic = function () {
    const r = _ag.apply(this, arguments);
    try {
      if (r !== 'dead' && G) {
        const v = v2G();
        if (G.emprego) { const j = job(G.emprego.id); v.exp += j.informal ? .4 : j.part ? .5 : 1; }
        if (G.part) v.exp += .4;
        v.regen = 0; v.regenAno = G.ano;
      }
    } catch (e) { }
    return r;
  };
  // compatibilidade: o antigo applyUni envia para a UAN (pública) ou para a privada que tenha o curso
  applyUni = function (id, pub) { const uid = pub ? 'uan' : (v2Offers(V2_UNI.ukianda, id) ? 'ukianda' : 'ispm'); return v2Apply(uid, id); };
})();

function v2Apply(uid, cid) {
  const U = V2_UNI[uid], c = v2Curso(cid), v = v2G(); if (!U || !c) return;
  if (!v2Offers(U, cid)) return toast(`A ${U.sig} não tem o curso de ${c.t}.`);
  if (G.edu < 3) return toast('Precisas de concluir o Ensino Médio.');
  if (G.estudo) return toast('Já estás a estudar.');
  if (G.cursosFeitos.includes(cid)) return toast('Já tens esta licenciatura.');
  if (!U.pub && U.req && !(G.area && c.area.includes(G.area)) && G.stats.inteligencia < U.req) return toast(`A ${U.sig} exige a área certa no médio ou Inteligência ${U.req}+.`);
  if (U.pub && v.exame[cid] === G.ano) return toast('Já fizeste o exame de acesso a este curso este ano. Tenta no próximo ano ou escolhe uma privada.');
  if (!canAct()) return;
  const prop = v2Prop(U, c);
  const paisPagam = familiaPaga() || (U.pub && parentsAlive() && G.classe !== 'pobre');
  if (!paisPagam && G.dinheiro < prop) return toast('💸 Precisas de ' + kz(prop) + ' para a primeira propina.');
  G.acoes--;
  if (U.pub) {
    v.exame[cid] = G.ano;
    if (!chance(uniChance(c, true))) { G.acoes++; return after(`❌ Reprovaste no exame de acesso a ${c.t} na ${U.sig}. A energia foi devolvida. Estuda e tenta no próximo ano, ou entra numa privada. ` + fx({ felicidade: -6 }), 'bad', 'sad'); }
  }
  if (!paisPagam) G.dinheiro -= prop;
  G.estudo = { tipo: 'univ', curso: c.id, uni: U.id, t: `${c.t} — ${U.sig}`, ano: 1, anos: c.anos, esf: 0, faltas: 0, prop, paisPagam, pub: U.pub };
  unlockOutfit('estudante'); G.roupa = 'estudante';
  after(`🎓 ENTRASTE em <b>${c.t}</b> na <b>${U.n}</b>! ${paisPagam ? 'A família vai ajudar com as propinas.' : ''} ` + fx({ felicidade: 12 }), 'good', 'cheer');
  if (typeof checkPlayerLook === 'function') checkPlayerLook();
}
function v2Bolsa(uid) {
  const v = v2G(), e = G.estudo;
  if (!e || e.tipo !== 'univ' || e.uni !== uid) return toast('A bolsa pede-se na universidade onde estudas.');
  if (v.bolsa) return toast('Já tens bolsa de mérito.');
  if (v.bolsaTry === G.ano) return toast('Já concorreste à bolsa este ano.');
  const nota = e.notaUlt || G.notaMedia || 0;
  if (nota < 15) return toast(`A bolsa de mérito pede média 15+ (tens ${nota}).`);
  if (!canAct()) return; G.acoes--; v.bolsaTry = G.ano;
  const p = Math.min(.9, .35 + (nota - 15) * .12 + (G.classe === 'pobre' ? .12 : 0) + (talento('estudo') ? .08 : 0));
  if (chance(p)) { v.bolsa = true; if (e.prop) { e.prop0 = e.prop; e.prop = 0; } return after('🏅 Ganhaste a <b>Bolsa de Mérito do Fundo Kianda</b>! Propinas pagas enquanto a média for 14+. ' + fx({ felicidade: 10, fama: 1 }), 'gold', 'cheer'); }
  after('📄 A bolsa foi para outra pessoa este ano. Sobe a média e tenta de novo. ' + fx({ felicidade: -3 }), 'bad', 'think');
}
function v2Estagio() {
  const v = v2G(), e = G.estudo;
  const ok = (e && e.tipo === 'univ' && e.ano >= 2) || (G.edu >= 4 && !G.emprego);
  if (!ok) return toast('Estágios: a partir do 2.º ano da faculdade, ou licenciado(a) sem emprego.');
  if (v.estAno === G.ano) return toast('Já fizeste um estágio este ano.');
  if (!canAct()) return; G.acoes--; v.estAno = G.ano;
  const pay = R(12, 30) * 10000; G.dinheiro += pay; v.exp += .5; G.cunha = Math.min(1, (G.cunha || 0) + .15);
  after(`💼 Fizeste um estágio de verão numa empresa de Luanda: +${kzShort(pay)}, +0,5 anos de experiência e ficaste com contactos (cunha) para a próxima candidatura. ` + fx({ inteligencia: 1, felicidade: 3 }), 'good', 'cheer');
}
function v2Festa() {
  const v = v2G(); if (v.festaAno === G.ano) return toast('A Semana Académica só acontece uma vez por ano!');
  if (!canAct()) return; G.acoes--; v.festaAno = G.ano; const vr = vrG(); vr.energia = Math.max(0, (vr.energia || 0) - 15);
  after('🎉 Semana Académica: concertos, desfile de cursos e kizomba no campus. ' + fx({ felicidade: 10, inteligencia: -1 }), 'good', 'cheer');
}

/* ---------- UI das universidades ---------- */
function v2UniHead(U) {
  const st = U.prest + '/10';
  return `<div class="v2uh" style="--uc:${U.cor}"><div class="v2uh-ic">🏛️</div><div><b>${U.n}</b><span>${U.pub ? 'Pública' : 'Privada'} · prestígio <i class="v2st">${st}</i></span><small>${U.lema}</small></div></div>`;
}
function v2CourseRow(U, cid, btn) {
  const c = v2Curso(cid); if (!c) return '';
  const feito = G.cursosFeitos.includes(cid), match = G.area && c.area.includes(G.area), prop = v2Prop(U, c);
  const pc = U.pub ? Math.round(uniChance(c, true) * 100) : null, J = JOBS.filter(j => j.req && j.req.curso && [].concat(j.req.curso).includes(cid)).map(j => j.t);
  const block = G.edu < 3 || !!G.estudo || feito || (U.pub && v2G().exame[cid] === G.ano);
  return `<div class="item col"><div class="row"><div class="ico">${c.ico}</div><div class="tx"><div class="t1">${c.t}${feito ? ' <span class="tag">concluído</span>' : ''}</div>
    <div class="t2">${c.anos} anos · ${match ? '✅ área certa' : '⚠️ área diferente'} · propina <b>${kzShort(prop)}/ano</b>${pc != null ? ` · hipótese no exame <b>${pc}%</b>` : ''}</div>
    ${J.length ? `<div class="t2">💼 Abre: ${J.slice(0, 3).join(', ')}</div>` : ''}</div></div>
    ${btn ? `<div class="btns">${chip(U.pub ? '📝 Fazer exame de acesso' : '✍️ Inscrever-me', `v2Apply('${U.id}','${cid}')`, block)}</div>` : ''}</div>`;
}
function v2FacUI(uid) {
  const U = V2_UNI[uid]; let h = energyBar() + v2UniHead(U);
  h += noteBox(U.pub ? `📝 Entrada por <b>exame de acesso</b> (conta a média e a área do médio). Propina simbólica de ${kzShort(PROP_PUB)}/ano. Se reprovares, a energia é devolvida e podes tentar no ano seguinte.` : `✍️ Entrada direta${U.req ? ` (área certa no médio ou Inteligência ${U.req}+)` : ''}. Propina de ${kzShort(Math.round(PROP_PRIV * U.pk))}/ano (Medicina o dobro).${familiaPaga() ? ' A tua família pode pagar.' : ''}`);
  if (G.edu < 3) h += noteBox('❌ Precisas de concluir o Ensino Médio para entrar. Podes ver tudo o que te espera aqui em baixo.', true);
  if (G.estudo && G.estudo.tipo === 'univ') h += noteBox(`📖 Já estás a frequentar ${esc(G.estudo.t)}.`);
  U.fac.forEach(([fn, cs]) => { h += sec(fn) + list(cs.map(cid => v2CourseRow(U, cid, true))); });
  if (U.id !== 'ispm' && G.edu >= 4) h += sec('Pós-graduação') + list([
    btnItem('🎓', U.id === 'uan' ? 'Mestrado na UAN' : 'Mestrado Executivo Kianda', '2 anos · +25% salário em cargos superiores · abre Juiz(a)', '1,5M', 'applyMestrado(false)', G.mestrado || !!G.estudo),
    ...(U.id === 'ukianda' ? [btnItem('✈️', 'Mestrado em Portugal (intercâmbio)', '2 anos · mais prestígio', '6M', 'applyMestrado(true)', G.mestrado || !!G.estudo)] : [])]);
  return h;
}
function v2CursoUI(uid) {
  const U = V2_UNI[uid], e = G.estudo; v2LegacyUni(e);
  let h = '';
  if (e && e.tipo === 'univ' && e.uni === uid) {
    h += v2UniHead(U) + estudosUI();
    h += noteBox(`📈 Cada ano que passas aqui vale <b>+3% de salário</b> e mais pontos de qualificação. Ao licenciar-te pela ${U.sig} ganhas prestígio extra (+${Math.round(U.prest * .6)}% salário).`);
    return h;
  }
  h += energyBar() + v2UniHead(U);
  if (e && e.tipo === 'univ') h += noteBox(`📖 Estudas na <b>${V2_UNI[e.uni].n}</b>. As aulas, os estudos e os exames são lá.`) + list([btnItem('🚶', 'Ir a pé até lá', LOC_POS[e.uni].n, '', `v2Go('${e.uni}')`), btnItem('🚕', 'Apanhar Kandonga', 'Táxi até à porta', '', `closePanel();v2Taxi('${e.uni}','eco')`)]);
  else if (e) h += noteBox(`📖 Agora estás em: <b>${esc(e.t)}</b>.`);
  else h += noteBox('Ainda não estás inscrito(a) aqui. Escolhe um curso no separador <b>Faculdades</b>.');
  const v = v2G(); if (v.graus.length) h += sec('Os teus diplomas') + list(v.graus.map(g => infoItem(v2Curso(g.c).ico, v2Curso(g.c).t, `${V2_UNI[g.u] ? V2_UNI[g.u].n : ''} · média ${g.n} · ${g.ano}`)));
  return h;
}
function v2VidaUI(uid) {
  const U = V2_UNI[uid], v = v2G(), e = G.estudo, aqui = e && e.tipo === 'univ' && e.uni === uid;
  let h = energyBar() + v2UniHead(U);
  h += list([
    btnItem('🏅', 'Bolsa de Mérito (Fundo Kianda)', v.bolsa ? 'Tens bolsa: propinas pagas ✅' : aqui ? `Média 15+ · 1 tentativa por ano${v.bolsaTry === G.ano ? ' (já tentaste)' : ''}` : 'Só para estudantes desta universidade', '', `v2Bolsa('${uid}')`, v.bolsa || !aqui || v.bolsaTry === G.ano),
    btnItem('💼', 'Gabinete de Estágios', v.estAno === G.ano ? 'Já fizeste o estágio deste ano' : 'Dinheiro, experiência e contactos', '120–300 mil', 'v2Estagio()', v.estAno === G.ano),
    btnItem('🤝', 'Associação de Estudantes', 'Conhecer colegas e fazer amigos', '', "makeFriend('na faculdade')"),
    btnItem('🎉', 'Semana Académica', v.festaAno === G.ano ? 'Já foste este ano' : 'Concertos e kizomba no campus (1 vez por ano)', '', 'v2Festa()', v.festaAno === G.ano),
  ]);
  h += sec('Biblioteca da faculdade') + ativList(['biblio']);
  return h;
}
function v2QualUI() { return energyBar() + v2QualCard(true) + noteBox('💡 Como subir: concluir o médio com boa média, estudar na universidade (cada ano conta), licenciar-te numa universidade de prestígio, fazer mestrado, trabalhar anos seguidos, cursos técnicos e carta. O cadastro criminal tira 15 pontos.'); }
Object.values(V2_UNI).forEach(U => {
  PANELS[U.id] = { ico: '🏛️', t: U.n, sub: U.lema, tabs: [['fac', '🏛️ Faculdades', () => v2FacUI(U.id)], ['est', '📖 O meu curso', () => v2CursoUI(U.id)], ['vida', '🎒 Vida académica', () => v2VidaUI(U.id)], ['qual', '⭐ Qualificação', v2QualUI]] };
});
/* Escola: as universidades passam a ter os seus próprios campus */
function v2GuiaUI() {
  let h = energyBar();
  h += noteBox('🏛️ As universidades ficam na <b>Cidade Universitária</b> (Avenida dos Transportes, no sul da cidade). Cada uma tem <b>faculdades e cursos diferentes</b>, propinas e prestígio diferentes. Inscreve-te lá, no balcão da secretaria.');
  h += v2QualCard(false);
  Object.values(V2_UNI).forEach(U => {
    const cs = [].concat(...U.fac.map(f => f[1]));
    h += `<div class="v2uc" style="--uc:${U.cor}">${v2UniHead(U)}<div class="v2fac">${U.fac.map(([fn, c]) => `<div><b>${fn}</b><span>${c.map(id => { const C = v2Curso(id); const m = G.area && C.area.includes(G.area); return `<i class="${m ? 'm' : ''}">${C.ico} ${C.t}</i>`; }).join('')}</span></div>`).join('')}</div>
      <div class="btns">${chip('🚶 Ir a pé', `v2Go('${U.id}')`)}${chip('🚕 Kandonga', `closePanel();v2Taxi('${U.id}','eco')`)}<span class="v2muted">${cs.length} cursos · propina ${U.pub ? kzShort(PROP_PUB) : kzShort(Math.round(PROP_PRIV * U.pk))}/ano</span></div></div>`;
  });
  return h;
}
PANELS.escola.t = 'Escola Secundária';
PANELS.escola.sub = 'Ensino médio, cursos técnicos e carta · universidades no campus';
PANELS.escola.tabs = PANELS.escola.tabs.map(t => t[0] === 'uni' ? ['uni', '🏛️ Universidades', v2GuiaUI] : t);
PANELS.escola.tabs.push(['qual', '⭐ Qualificação', v2QualUI]);
{ const est = PANELS.escola.tabs.find(t => t[0] === 'est'); if (est) { const f = est[2]; est[2] = () => { const h = f(); return h.replace('</div>', '</div>' + (G.idade >= 14 ? v2QualCard(false) : '')); }; } }
{ const eu = PANELS.emprego.tabs.find(t => t[0] === 'eu'); if (eu) { const f = eu[2]; eu[2] = () => { const h = f(); if (G.idade < 14) return h; const k = v2SalK(G.emprego); return h + sec('Qualificação') + v2QualCard(false) + noteBox(`📈 Os teus estudos dão <b>+${Math.round((k - 1) * 100)}%</b> no salário${G.emprego ? '' : ' (quando tiveres emprego formal)'} e <b>+${Math.round(v2PromoBonus())}</b> pontos de desempenho quando pedes promoção.`); }; } }
{ const cv = PANELS.emprego.tabs.find(t => t[0] === 'cv'); if (cv) { const f = cv[2]; cv[2] = () => v2QualCard(true) + f(); } }

/* =========================================================
   3) MENOS "TUDO NUM SÍTIO": cada coisa no seu lugar
   ========================================================= */
PANELS.banco.sub = 'Conta, poupança e crédito';
PANELS.banco.tabs = PANELS.banco.tabs.filter(t => t[0] !== 'loja');
function v2ZonasUI() {
  let h = energyBar();
  const P = cid();
  h += noteBox(`📍 Estás em <b>${P.n}</b>: os preços das casas aqui são ${Math.round(P.custo * 100)}% dos de Luanda. Para mudar de província vai à <b>Estação Ferroviária</b> ou ao <b>Aeroporto</b>.`);
  h += sec('Renda média por zona (por mês)') + list(ZONAS_CASA.map(Z => {
    const cs = CASAS.filter(C => C.z === Z.id); if (!cs.length) return '';
    const r = cs.reduce((s, C) => s + C.renda * P.custo, 0) / cs.length / 12, pr = cs.filter(C => C.preco).map(C => precoCasa(C));
    return infoItem(Z.ico, `${Z.nivel} · ${Z.t}`, `${cs.length} tipos de casa${pr.length ? ` · comprar desde ${kzShort(Math.min(...pr))}` : ' · só arrendar'}`, kzShort(r));
  }));
  h += list([btnItem('🚆', 'Estação Ferroviária', 'Comboios para outras províncias', '', "v2Go('estacao')"), btnItem('✈️', 'Aeroporto de Luanda', 'Voos nacionais e mudança de província', '', "v2Go('aeroporto')")]);
  return h;
}
PANELS.imobiliaria.sub = 'Centro Habitacional · casas do bairro pobre ao rico';
PANELS.imobiliaria.tabs = PANELS.imobiliaria.tabs.map(t => t[0] === 'cid' ? ['zonas', '📊 Preços por zona', v2ZonasUI] : t);
['aeroporto', 'estacao'].forEach(id => { const P = PANELS[id]; if (P && P.tabs && !P.tabs.some(t => t[0] === 'prov')) P.tabs.push(['prov', '🗺️ Províncias', cidadesUI]); });

/* =========================================================
   4) PAINÉIS BLOQUEADOS RICOS (padrão de jogo a sério)
   ========================================================= */
const V2_LOCKS = [
  { re: /casa/, t: 'Casa própria', perks: ['Arrendar casa em qualquer bairro, do Musseque ao Miramar', 'Comprar a pronto ou a crédito (entrada de 30%)', 'Pôr as tuas casas a render com inquilinos', 'Mudar de bairro quando subires na vida'],
    alt: [['🏦', 'Abrir poupança no Banco Palanca', 'Junta a caução já · 7% de juros por ano', "v2Go('banco')", 14], ['🧺', 'Fazer biscates', 'Dinheiro rápido: estafeta, zunga, kupapata', "v2OpenExtra('bisc')", 12], ['💼', 'Arranjar um part-time', 'Centro de Emprego · a partir dos 14', "v2Go('emprego')", 14], ['🎓', 'Ver as universidades', 'Cada ano de faculdade aumenta o salário', "v2Go('escola')", 0]], plan: true },
  { re: /trabalhar/, t: 'Trabalho', perks: ['Empregos formais com salário e carreira', 'Part-times compatíveis com os estudos', 'Promoções até Diretor(a) e CEO'],
    alt: [['🧺', 'Biscates no Mercado', 'A partir dos 12 anos', "v2Go('mercado')", 12], ['📚', 'Estudar a sério', 'Melhor média = melhores empregos', "v2Go('escola')", 0], ['🎯', 'Missões diárias', 'Prémios todos os dias', "v2OpenExtra('miss')", 0]] },
  { re: /banco/, t: 'Conta bancária', perks: ['Conta e poupança com 7% de juros por ano', 'Crédito pessoal (a partir dos 18)', 'Palanca Pay no telemóvel'],
    alt: [['🏠', 'Mealheiro em casa', 'O dinheiro fica guardado na tua casa', "v2Go('casa')", 0], ['🧺', 'Fazer biscates', 'Começa a juntar dinheiro', "v2OpenExtra('bisc')", 12]] },
  { re: /negócio/, t: 'Negócios', perks: ['Abrir zungas, cantinas, salões e lojas', 'Contratar funcionários e abrir filiais', 'Crescer até um grupo empresarial'],
    alt: [['🧺', 'Biscates e zunga', 'Aprende a vender', "v2OpenExtra('bisc')", 12], ['🛠️', 'Curso técnico', 'Abre negócios técnicos', "v2Go('escola')", 15]] },
  { re: /terrenos/, t: 'Terrenos & Obras', perks: ['Comprar terrenos por zona', 'Construir prédios e viver das rendas', 'Vender frações com lucro'],
    alt: [['🏦', 'Poupar no banco', 'Junta capital para o 1.º terreno', "v2Go('banco')", 14], ['💼', 'Trabalhar', 'Um salário fixo abre crédito', "v2Go('emprego')", 14]] },
  { re: /discoteca/, t: 'Discoteca', perks: ['Kizomba, semba e kuduro até de manhã', 'Conhecer pessoas e arranjar namoro', 'Concursos de dança'],
    alt: [['🏖️', 'Praia da Ilha', 'Diversão para todas as idades', "v2Go('praia')", 0], ['🏋️', 'Ginásio & Campo', 'Treinar e fazer amigos', "v2Go('ginasio')", 0], ['⛪', 'Igreja', 'Comunidade e amizades', "v2Go('igreja')", 0]] },
  { re: /universidade/, t: 'Universidade', perks: ['3 universidades com faculdades diferentes', 'Licenciaturas de 4 a 6 anos', 'Cada ano estudado sobe o salário e a qualificação'],
    alt: [['📚', 'Estudar a sério', 'A média conta no exame da UAN', "v2Go('escola')", 0], ['🛠️', 'Curso técnico', '1 ano e já trabalhas', "v2Go('escola')", 15]] },
];
function v2CurPanelFn() {
  const P = PANELS[panelId]; if (!P) return null;
  if (P.tabs) { const cur = panelTab[panelId] || P.tabs[0][0]; const T_ = P.tabs.find(t => t[0] === cur) || P.tabs[0]; return T_[2]; }
  return P.body;
}
function v2Go(id) {
  closePanel(); if (typeof closePhone === 'function') closePhone();
  if (typeof inInt !== 'undefined' && inInt) ivExit(true);
  setTimeout(() => { uiBlocked = !!panelId || modalOpen || !!phoneApp; tapEnter(id); }, 60);
}
function v2OpenExtra(tab) { closePanel(); if (PANELS.extra) openPanel('extra', tab); }
function lockRich(min, what) {
  if (V2.prev || !G) return '';
  const L = V2_LOCKS.find(l => l.re.test(what)) || { t: what, perks: [], alt: [] };
  const falta = min - G.idade, pct = Math.max(4, Math.min(100, Math.round(G.idade / min * 100)));
  let h = `<div class="v2lock"><div class="v2lk-top"><div class="v2lk-ic">🔒</div><div><small>${esc(L.t)}</small><b>Abre aos ${min} anos</b><span>Tens ${G.idade} · ${falta === 1 ? 'falta 1 ano' : `faltam ${falta} anos`}</span></div></div>
    <div class="v2bar"><i style="width:${pct}%"></i></div>`;
  if (L.perks.length) h += `<div class="v2lk-pk"><b>O que vais poder fazer aqui</b>${L.perks.map(p => `<span>✅ ${p}</span>`).join('')}</div>`;
  if (L.plan && typeof CASAS !== 'undefined') {
    const P = cid(), cau = Math.min(...CASAS.filter(C => C.renda).map(C => Math.round(C.renda * P.custo / 6)));
    const p2 = Math.max(2, Math.min(100, Math.round(G.dinheiro / cau * 100)));
    h += `<div class="v2plan"><b>🎯 Plano: a tua 1.ª casa</b><span>A caução mais barata custa <b>${kzShort(cau)}</b>. Já tens ${kzShort(G.dinheiro)}.</span><div class="v2bar g"><i style="width:${p2}%"></i></div></div>`;
  }
  h += `<button class="v2lk-btn" onclick="ageUpUI()">⏩ Avançar 1 ano</button></div>`;
  const alts = L.alt.filter(a => G.idade >= a[4]);
  if (alts.length) h += sec('Enquanto esperas, podes…') + list(alts.map(a => btnItem(a[0], a[1], a[2], '', a[3])));
  // pré-visualização do conteúdo verdadeiro, só para ver
  const fn = v2CurPanelFn();
  if (fn) {
    const age = G.idade; let prev = '';
    V2.prev = true; G.idade = min;
    try { prev = fn(); } catch (e) { prev = ''; } finally { G.idade = age; V2.prev = false; }
    prev = prev.replace(/<div class="energy">[\s\S]*?<\/span><\/div>/, '');
    if (prev) h += sec('Pré-visualização') + `<div class="v2prev" inert>${prev}</div>`;
  }
  return h;
}

/* =========================================================
   5) ENERGIA: recupera com o tempo, falhar não gasta à toa
   ========================================================= */
function v2RegenMax() { return maxAcoes() * 2; }
function v2RegenTick(dt) {
  if (!G || !G.vivo || mode !== 'game' || dying || G.preso > 0) return;
  const v = v2G(); if (v.regenAno !== G.ano) { v.regenAno = G.ano; v.regen = 0; }
  if (G.acoes >= maxAcoes() || v.regen >= v2RegenMax()) { V2.regenT = 0; return; }
  V2.regenT += dt;
  if (V2.regenT >= V2_REGEN_S) { V2.regenT = 0; G.acoes++; v.regen++; toast(`⚡ Recuperaste 1 de energia (${G.acoes}/${maxAcoes()}).`); save(); refresh(); }
}
function v2RegenTxt() {
  if (!G) return ''; const v = v2G();
  if (G.acoes >= maxAcoes()) return '';
  if (v.regen >= v2RegenMax()) return 'descansa: +1 ano';
  const s = Math.max(0, Math.ceil(V2_REGEN_S - V2.regenT)); return `+1 em ${s}s`;
}
(function () {
  /* (removido o bónus legado "+2 energia por dormir" — com a energia unificada (ano9) o descanso
     vem todo dos níveis de cama em vrDormir: chão +45 · colchão +75 · cama 100 · ortopédica 100++) */
  const _rf = refresh; refresh = function () {
    const r = _rf.apply(this, arguments);
    try { const he = document.getElementById('hEnergy'); if (he && G && !he.querySelector('.v2rg')) he.insertAdjacentHTML('beforeend', `<small class="v2rg">${v2RegenTxt()}</small>`); } catch (e) { }
    return r;
  };
})();

/* =========================================================
   6) CAMINHAR PELAS RUAS ATÉ AO EDIFÍCIO (sem teletransporte)
   ========================================================= */
function v2Lines() {
  if (V2.lines) return V2.lines;
  const Ls = [];
  CITY_ZS.concat([typeof MU_AV !== 'undefined' ? MU_AV : 160]).forEach(z => Ls.push({ h: 1, c: z, a: -176, b: 176 }));
  CITY_XS.forEach(x => Ls.push({ h: 0, c: x, a: -88, b: typeof MU_AV !== 'undefined' ? MU_AV : 160 }));
  Ls.push({ h: 0, c: -150, a: -120, b: -88 });   // ponte para a Ilha
  Ls.push({ h: 1, c: -120, a: -170, b: -22 });   // avenida da Ilha
  return (V2.lines = Ls);
}
function v2Proj(x, z) {
  let best = null;
  v2Lines().forEach((L, i) => {
    const t = Math.max(L.a, Math.min(L.b, L.h ? x : z)), px = L.h ? t : L.c, pz = L.h ? L.c : t, d = Math.hypot(px - x, pz - z);
    if (!best || d < best.d) best = { i, t, x: px, z: pz, d };
  });
  return best;
}
function v2Clear(x0, z0, x1, z1, pad = .55) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(L / 1.2));
  for (let k = 0; k <= n; k++) {
    const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n;
    for (const c of colliders) if (x > c.x0 - pad && x < c.x1 + pad && z > c.z0 - pad && z < c.z1 + pad) return false;
    if (!WALK.some(r => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1)) return false;
  }
  return true;
}
/* rota pelas ruas: devolve [[x,z],...]; car=true fica na estrada e acaba no ponto da estrada mais perto */
function v2Route(P, id, car) {
  const L = LOC_POS[id]; if (!L) return null;
  if (!car && Math.hypot(L.x - P.x, L.z - P.z) < 40 && v2Clear(P.x, P.z, L.x, L.z)) return [[L.x, L.z]];
  const Ls = v2Lines(), A = v2Proj(P.x, P.z), B = v2Proj(L.x, L.z);
  const nodes = [], key = (x, z) => Math.round(x * 10) + ':' + Math.round(z * 10), idx = {};
  const addN = (x, z) => { const k = key(x, z); if (idx[k] == null) { idx[k] = nodes.length; nodes.push({ x, z, e: [] }); } return idx[k]; };
  const onLine = Ls.map(() => []);
  Ls.forEach((h, i) => { if (!h.h) return; Ls.forEach((v, j) => { if (v.h) return; if (v.c >= h.a && v.c <= h.b && h.c >= v.a && h.c <= v.b) { const n = addN(v.c, h.c); onLine[i].push(n); onLine[j].push(n); } }); });
  const a = addN(A.x, A.z), b = addN(B.x, B.z); onLine[A.i].push(a); onLine[B.i].push(b);
  Ls.forEach((Ln, i) => {
    const arr = [...new Set(onLine[i])].sort((p, q) => Ln.h ? nodes[p].x - nodes[q].x : nodes[p].z - nodes[q].z);
    for (let k = 1; k < arr.length; k++) { const p = arr[k - 1], q = arr[k], w = Math.hypot(nodes[p].x - nodes[q].x, nodes[p].z - nodes[q].z); nodes[p].e.push([q, w]); nodes[q].e.push([p, w]); }
  });
  const dist = nodes.map(() => Infinity), prev = nodes.map(() => -1), done = nodes.map(() => false); dist[a] = 0;
  for (;;) {
    let u = -1; for (let k = 0; k < nodes.length; k++) if (!done[k] && (u < 0 || dist[k] < dist[u])) u = k;
    if (u < 0 || dist[u] === Infinity || u === b) break; done[u] = true;
    nodes[u].e.forEach(([q, w]) => { if (dist[u] + w < dist[q]) { dist[q] = dist[u] + w; prev[q] = u; } });
  }
  const seq = []; for (let u = b; u >= 0; u = prev[u]) { seq.unshift(u); if (u === a) break; }
  if (seq[0] !== a) return car ? null : [[L.x, L.z]];
  const off = car ? 2.3 : 3.8;
  let pts = seq.map(u => [nodes[u].x + off, nodes[u].z + off]);
  if (!car) {
    pts.push([L.x, L.z]);
    // atalhos: salta pontos quando o caminho direto está livre (passeios, praças)
    const out = []; let cx = P.x, cz = P.z, k = 0;
    while (k < pts.length) {
      let far = k;
      for (let m = Math.min(pts.length - 1, k + 4); m > k; m--) if (Math.hypot(pts[m][0] - cx, pts[m][1] - cz) < 90 && v2Clear(cx, cz, pts[m][0], pts[m][1])) { far = m; break; }
      out.push(pts[far]); cx = pts[far][0]; cz = pts[far][1]; k = far + 1;
    }
    pts = out;
  }
  return pts.filter((p, i) => i === pts.length - 1 || Math.hypot(p[0] - (pts[i + 1] || p)[0], p[1] - (pts[i + 1] || p)[1]) > .8);
}
function v2PathLen(pts, P) { let d = 0, x = P.x, z = P.z; (pts || []).forEach(p => { d += Math.hypot(p[0] - x, p[1] - z); x = p[0]; z = p[1]; }); return d; }
function v2WalkStart(id, d) {
  const L = LOC_POS[id]; V2.walkId = id;
  const m = autoGo && autoGo.path ? v2PathLen(autoGo.path, playerPos) : d;
  toast(`🚶 A caminho de ${L.n} (${Math.round(m * 1.5)} m)`);
  v2WalkUI();
}
function v2WalkEnd() { V2.walkId = null; const w = document.getElementById('v2Walk'); if (w) w.classList.add('hidden'); }
function v2WalkUI() {
  let w = document.getElementById('v2Walk');
  if (!w) { document.body.insertAdjacentHTML('beforeend', '<div id="v2Walk" class="hidden"><span id="v2WalkT"></span><button onclick="v2WalkTaxi()">🚕 Táxi</button><button class="x" onclick="autoGo=null;v2WalkEnd()">✕</button></div>'); w = document.getElementById('v2Walk'); }
  if (!autoGo || !LOC_POS[autoGo.id] || (typeof inInt !== 'undefined' && inInt)) { w.classList.add('hidden'); return; }
  const L = LOC_POS[autoGo.id], m = v2PathLen(autoGo.path || [[L.x, L.z]], playerPos);
  document.getElementById('v2WalkT').innerHTML = `🚶 <b>${L.n}</b> · ${Math.round(m * 1.5)} m`;
  w.classList.remove('hidden');
}
function v2WalkTaxi() { const id = autoGo && autoGo.id; autoGo = null; v2WalkEnd(); if (id) v2Taxi(id, 'eco'); }

/* =========================================================
   7) KANDONGA 3D — o táxi aparece, entras e vês a viagem
   ========================================================= */
function v2TaxiModel(cls) {
  let g;
  if (cls === 'moto') g = vehModel('moto', '#c8102e');
  else if (cls === 'xl') g = vanModel();
  else if (cls === 'conf') g = vehModel('suv', '#151515');
  else g = vehModel('sedan', '#f2f2f2');
  if (cls === 'eco' || cls === 'conf') {
    const top = cls === 'conf' ? 1.98 : 1.62;
    mesh(bx(.9, .26, .42), new T.MeshStandardMaterial({ color: '#ffcb00', emissive: '#ffcb00', emissiveIntensity: .9 }), -.3, top, 0, g, false);
    if (cls === 'eco') [-1, 1].forEach(s => mesh(bx(2.6, .1, .02), mat('#ffcb00'), -.1, .72, s * .91, g, false));
  }
  g.scale.multiplyScalar(BODY_S);
  return g;
}
function v2Sit(h, seat) { const P = h.P; P.legL.rotation.x = P.legR.rotation.x = -1.45; P.body.position.y = (seat || .47) + .06 - .92; P.armL.rotation.x = P.armR.rotation.x = -.6; }
function v2Taxi(id, clsId) {
  if (!G || !LOC_POS[id] || mode !== 'game') return;
  if (G.preso > 0) return toast('🔒 Estás preso(a)!');
  if (V2.ride) return toast('🚕 Já estás numa viagem.');
  if (typeof inInt !== 'undefined' && inInt) ivExit(true);
  if (typeof TR !== 'undefined' && TR) return toast('Termina primeiro a viagem atual.');
  const C = P2_RIDE.find(x => x.id === clsId) || P2_RIDE[1], L = LOC_POS[id];
  const d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z);
  if (d < 6) return toast('Já estás aí! 😄');
  if (C.id === 'moto' && G.idade < 16) return toast('🧒 Kupapata só a partir dos 16 anos.');
  const pts = v2Route(playerPos, id, true);
  if (!pts || pts.length < 1) { return p2RideOld(id); }
  const cost = Math.round(rideCost(d) * C.m / 100) * 100; if (!pay(cost)) return;
  if (typeof closePhone === 'function') closePhone(); closePanel(); autoGo = null; v2WalkEnd();
  const mot = pick(P2_MOT), car = C.id === 'moto' ? 'Moto Kwanza 125' : C.id === 'xl' ? 'Kandonga Van azul e branca' : C.id === 'conf' ? 'Palanca SUV preto' : pick(P2_CARROS), plate = `LD-${R(10, 99)}-${R(10, 99)}-${String.fromCharCode(65 + R(0, 25))}${String.fromCharCode(65 + R(0, 25))}`;
  const g = v2TaxiModel(C.id); worldScene.add(g);
  // o táxi chega pela estrada, vindo de trás
  const p0 = pts[0], p1 = pts[1] || [L.x, L.z];
  let dx = p1[0] - p0[0], dz = p1[1] - p0[1]; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
  const sx = p0[0] - dx * 26, sz = p0[1] - dz * 26;
  g.position.set(sx, 0, sz); g.rotation.y = Math.atan2(-dz, dx);
  let driver = null;
  if (C.id === 'moto') { driver = makeHuman(randomNPCcfg()); driver.g.scale.multiplyScalar(BODY_S * .92); v2Sit(driver, .62); worldScene.add(driver.g); }
  V2.ride = { id, C, cost, mot, car, plate, g, driver, pts: [[p0[0], p0[1]]].concat(pts.slice(1)), all: pts, i: 0, phase: 'arrive', sp: 0, t: 0, len: v2PathLen(pts, { x: p0[0], z: p0[1] }), done: 0, cam0: { camDist, camPitch } };
  SND.play('car');
  toast(`${C.ico} ${mot} vem a caminho num ${car}…`);
  v2RideUI();
}
function v2RideUI() {
  const R_ = V2.ride; let el = document.getElementById('v2Ride');
  if (!R_) { if (el) el.classList.add('hidden'); return; }
  if (!el) { document.body.insertAdjacentHTML('beforeend', '<div id="v2Ride" class="hidden"></div>'); el = document.getElementById('v2Ride'); }
  const L = LOC_POS[R_.id], pc = Math.round(Math.min(1, R_.done / Math.max(1, R_.len)) * 100);
  const ph = { arrive: `${R_.C.ico} O táxi está a chegar…`, board: '🚪 A entrar no carro…', drive: `${R_.C.ico} A caminho de <b>${L.n}</b>`, alight: '📍 Chegaste!' }[R_.phase];
  el.innerHTML = `<div class="v2r-top"><div class="v2r-av">${R_.C.ico}</div><div class="v2r-tx"><b>${R_.mot} · ⭐ 4,${(R_.plate.charCodeAt(9) % 4) + 6}</b><span>${R_.car} · ${R_.plate}</span></div><div class="v2r-pr">${kzShort(R_.cost)}</div></div>
    <div class="v2r-st">${ph}</div><div class="v2bar"><i style="width:${pc}%"></i></div>
    <div class="btns">${R_.phase === 'drive' || R_.phase === 'arrive' ? `<button class="chip" onclick="v2RideSkip()">⏩ Saltar viagem</button>` : ''}</div>`;
  el.classList.remove('hidden');
}
function v2RideSkip() {
  const R_ = V2.ride; if (!R_) return;
  if (R_.phase === 'arrive' || R_.phase === 'board') { R_.phase = 'drive'; if (player) player.g.visible = R_.C.id === 'moto'; }
  const last = R_.pts[R_.pts.length - 1]; R_.g.position.set(last[0], 0, last[1]); R_.i = R_.pts.length; R_.done = R_.len;
  playerPos.set(last[0], 0, last[1]);
  if (camera) camera.position.set(last[0] + Math.sin(camYaw) * camDist, 6, last[1] + Math.cos(camYaw) * camDist);
}
function v2RideEnd(abort) {
  const R_ = V2.ride; if (!R_) return; V2.ride = null;
  const L = LOC_POS[R_.id];
  camDist = R_.cam0.camDist; camPitch = R_.cam0.camPitch;
  if (player) { player.g.visible = true; }
  uiBlocked = !!panelId || modalOpen || !!phoneApp;
  const y = playerYaw; spawnPlayer(null); playerYaw = y;
  // o táxi segue viagem e desaparece
  V2.leaving = { g: R_.g, driver: R_.driver, t: 0, yaw: R_.g.rotation.y };
  G.rideAno = G.rideAno || {};
  if ((R_.C.id === 'conf' || R_.C.id === 'xl') && G.rideAno.conf !== G.ano) { G.rideAno.conf = G.ano; fx({ felicidade: 1 }); }
  if (typeof P2 !== 'undefined') P2.lastRide = { mot: R_.mot, car: R_.car, cost: R_.cost };
  v2RideUI(); save(); refresh();
  if (!abort && L) {
    toast(`${R_.C.ico} Chegaste a ${L.n}. Avalia ${R_.mot} na app Kandonga!`);
    autoGo = { id: R_.id, t: 0, stuck: 0, path: [[L.x, L.z]] };
  }
}
function v2RideTick(dt) {
  const R_ = V2.ride;
  if (V2.leaving) { const Lv = V2.leaving; Lv.t += dt; const sp = 14 * dt; Lv.g.position.x += Math.cos(Lv.yaw) * sp; Lv.g.position.z -= Math.sin(Lv.yaw) * sp; if (Lv.driver) { Lv.driver.g.position.set(Lv.g.position.x, .05, Lv.g.position.z); } if (Lv.t > 3.2) { worldScene.remove(Lv.g); if (Lv.driver) worldScene.remove(Lv.driver.g); V2.leaving = null; } }
  if (!R_) return;
  if (!G || mode !== 'game' || dying) { worldScene.remove(R_.g); if (R_.driver) worldScene.remove(R_.driver.g); V2.ride = null; v2RideUI(); return; }
  R_.t += dt; uiBlocked = true; autoGo = null;
  const g = R_.g, yaw = g.rotation.y;
  const moveTo = (tx, tz, vmax) => {
    const dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz);
    R_.sp = Math.min(vmax, R_.sp + dt * 14); const st = Math.min(d, R_.sp * dt);
    if (d > .01) { g.position.x += dx / d * st; g.position.z += dz / d * st; let df = Math.atan2(-dz, dx) - g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); g.rotation.y += df * Math.min(1, dt * 7); }
    return { d, st };
  };
  if (R_.phase === 'arrive') {
    const p = R_.pts[0], r = moveTo(p[0], p[1], 16);
    if (r.d < 3) R_.sp = Math.max(3, R_.sp - dt * 30);
    if (r.d < .4) { R_.phase = 'board'; R_.sp = 0; R_.bt = 0; }
  } else if (R_.phase === 'board') {
    R_.bt += dt;
    const side = 1.7 * BODY_S, tx = g.position.x + Math.sin(yaw) * side, tz = g.position.z + Math.cos(yaw) * side;
    const dx = tx - playerPos.x, dz = tz - playerPos.z, d = Math.hypot(dx, dz);
    if (d > .3 && R_.bt < 3.5) { const st = Math.min(d, 6 * dt); playerPos.x += dx / d * st; playerPos.z += dz / d * st; playerYaw = Math.atan2(dx, dz); }
    else { R_.phase = 'drive'; R_.sp = 0; if (player) player.g.visible = R_.C.id === 'moto'; SND.play('car'); toast(`🚪 Entraste. ${R_.mot}: "Bom dia! Vamos para ${LOC_POS[R_.id].n}, né?"`); }
  } else if (R_.phase === 'drive') {
    if (R_.i < R_.pts.length) {
      const p = R_.pts[R_.i], nxt = R_.pts[R_.i + 1];
      let vmax = R_.C.id === 'moto' ? 26 : 22;
      const dd = Math.hypot(p[0] - g.position.x, p[1] - g.position.z);
      if (nxt && dd < 10) vmax = Math.max(9, dd * 1.6);
      if (!nxt && dd < 14) vmax = Math.max(3, dd * 1.4);
      const r = moveTo(p[0], p[1], vmax); R_.done += r.st;
      if (r.d < .6) R_.i++;
    } else { R_.phase = 'alight'; R_.at = 0; }
    playerPos.set(g.position.x, 0, g.position.z);
    // câmara atrás do carro
    const fx_ = Math.cos(g.rotation.y), fz = -Math.sin(g.rotation.y);
    let want = Math.atan2(-fx_, -fz), df = want - camYaw; df = Math.atan2(Math.sin(df), Math.cos(df)); camYaw += df * Math.min(1, dt * 2.5);
    camDist = Math.max(camDist, (IS_MOBILE ? 13 : 11) * BODY_S);
  } else if (R_.phase === 'alight') {
    R_.at += dt;
    if (R_.at > .5) {
      const L = LOC_POS[R_.id], s = 1.8 * BODY_S, ex = g.position.x, ez = g.position.z;
      const dl = Math.hypot(L.x - ex, L.z - ez) || 1;
      playerPos.set(ex + (L.x - ex) / dl * s, 0, ez + (L.z - ez) / dl * s); collide(playerPos, .45);
      v2RideEnd(false); return;
    }
  }
  V2.uiT2 = (V2.uiT2 || 0) + dt; if (V2.uiT2 > .25) { V2.uiT2 = 0; v2RideUI(); }
}
function v2RidePose() {
  const R_ = V2.ride; if (!R_ || !player) return;
  if (R_.phase === 'board') { player.g.position.copy(playerPos); player.g.rotation.y = playerYaw; animHuman(player, 1 / 60, true, false); return; }
  if (R_.phase !== 'drive') return;
  if (R_.C.id === 'moto') {
    const g = R_.g, y = g.rotation.y, fx_ = Math.cos(y), fz = -Math.sin(y);
    if (R_.driver) { R_.driver.g.position.set(g.position.x + fx_ * .15, .1, g.position.z + fz * .15); R_.driver.g.rotation.y = y + Math.PI / 2; }
    player.g.visible = true; player.g.position.set(g.position.x - fx_ * .55 * BODY_S, .14, g.position.z - fz * .55 * BODY_S); player.g.rotation.y = y + Math.PI / 2; v2Sit(player, .66);
  } else player.g.visible = false;
}
const p2RideOld = p2Ride;
p2Ride = function (id) { return v2Taxi(id, (typeof P2 !== 'undefined' && P2.rideCls) || 'eco'); };
rideTo = function (id) { return v2Taxi(id, 'eco'); };

/* =========================================================
   8) INTERIORES: objetos que se usam e pessoas com quem falar
   ========================================================= */
['ivSofa', 'ivBed', 'ivCooler', 'ivShelf', 'ivTV', 'ivPC', 'ivWardrobe'].forEach(n => {
  const f = window[n]; if (typeof f !== 'function') return;
  window[n] = function () { const a = [...arguments]; try { if (V2.rec && IVP === V2.rec.st) V2.rec.list.push({ k: n, a }); } catch (e) { } return f.apply(this, arguments); };
});
(function () {
  const _n = ivNew; ivNew = function (id) { const D = _n.apply(this, arguments); V2.rec = { D, st: D.st, list: [] }; return D; };
  const _b = ivBuild; ivBuild = function (id, key) {
    const D = _b.apply(this, arguments);
    try { if (V2.rec && V2.rec.D === D) v2Props(D, id, V2.rec.list); v2NpcHits(D); } catch (e) { console.error('v2Props', e); }
    V2.rec = null; return D;
  };
})();
const V2_PROPS = {
  ivSofa: { ico: '🛋️', label: 'Sentar e descansar', act: 'sit', r: .95, max: 2 },
  ivBed: { ico: '🛏️', label: 'Deitar · descansar', act: 'rest', r: 1.5, max: 1 },
  ivCooler: { ico: '💧', label: 'Beber água', act: 'water', r: .75, max: 1 },
  ivShelf: { ico: '📚', label: 'Ler um livro', act: 'read', r: .95, max: 1 },
  ivTV: { ico: '📺', label: 'Ver televisão', act: 'tv', r: 1.9, max: 1 },
  ivPC: { ico: '🖥️', label: 'Usar o computador', act: 'pc', r: 1, max: 1 },
  ivWardrobe: { ico: '👗', label: 'Trocar de roupa', act: 'roupa', r: 1, max: 1 },
};
function v2FreeAt(D, x, z) {
  if (Math.abs(x) > D.w / 2 - .6 || Math.abs(z) > D.d / 2 - .6) return false;
  return !D.cols.some(c => x > c.x0 - .35 && x < c.x1 + .35 && z > c.z0 - .35 && z < c.z1 + .35);
}
function v2Props(D, id, list) {
  const cnt = {};
  list.forEach(({ k, a }) => {
    const S = V2_PROPS[k]; if (!S) return;
    if (id !== 'casa' && k === 'ivWardrobe') return;
    cnt[k] = (cnt[k] || 0); if (cnt[k] >= S.max) return;
    const tv = k === 'ivTV' || k === 'ivPC', x = a[0], z = tv ? a[2] : a[1], ry = (tv ? a[3] : k === 'ivCooler' ? 0 : a[2]) || 0;
    if (D.stations.some(s => Math.hypot(s.x - x, s.z - z) < 1.7)) return;
    // ponto onde o jogador fica: de preferência à frente do objeto
    let sx = null, sz = null;
    const tries = [ry]; for (let i = 1; i < 12; i++) tries.push(ry + i * Math.PI / 6);
    for (const ang of tries) { const px = x + Math.sin(ang) * S.r, pz = z + Math.cos(ang) * S.r; if (v2FreeAt(D, px, pz)) { sx = px; sz = pz; break; } }
    if (sx == null) return;
    cnt[k]++;
    let label = S.label, act = S.act, ico = S.ico;
    if (k === 'ivBed' && id === 'casa') { label = 'Dormir'; act = 'sleep'; }
    if (k === 'ivBed' && id === 'cela') { label = 'Deitar no catre'; }
    if (k === 'ivPC' && id === 'casa') label = 'Computador · estudar e CV';
    const st = { x: sx, z: sz, ry: Math.atan2(x - sx, z - sz), ico, label, act, prop: k, ox: x, oz: z, ory: ry, small: true };
    const lab = textSprite(`${ico} ${label}`, { scale: IS_MOBILE ? 2.2 : 2.4, size: 48 });
    lab.position.set(x, Math.min(D.h - .3, k === 'ivShelf' || k === 'ivWardrobe' ? 2.9 : 2.1), z); lab.userData.y = lab.position.y; lab.visible = false; D.dyn.add(lab); D.labels.push(lab); st.lab = lab;
    const idx = D.stations.length;
    const hb = new T.Mesh(new T.BoxGeometry(1.5, k === 'ivShelf' || k === 'ivWardrobe' ? 2.4 : 1.3, 1.5), IV_HITM); hb.position.set(x, .7, z); hb.updateMatrixWorld(true); hb.userData.iv = 'st:' + idx; D.hits.push(hb);
    // marca discreta no chão
    const m = new T.Mesh(new T.CircleGeometry(.32, 20), new T.MeshBasicMaterial({ color: '#ffcb00', transparent: true, opacity: .22, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(sx, .03, sz); D.dyn.add(m);
    D.stations.push(st);
  });
}
function v2NpcHits(D) {
  D.npcs.forEach((n, i) => {
    const hb = new T.Mesh(new T.BoxGeometry(.9, 2, .9), IV_HITM); hb.position.set(n.h.g.position.x, 1, n.h.g.position.z); hb.updateMatrixWorld(true); hb.userData.iv = 'npc:' + i; D.hits.push(hb); n.hb = hb;
  });
}
function v2Cd(key, s) { const v = v2G(), now = Date.now(); if (v.cd[key] && now - v.cd[key] < s * 1000) { return Math.ceil((s * 1000 - (now - v.cd[key])) / 1000); } v.cd[key] = now; return 0; }
function v2YearCap(k, max) { const v = v2G(); if (v.pAno !== G.ano) { v.pAno = G.ano; v.pInt = 0; v.pFel = 0; } if (v[k] >= max) return false; v[k]++; return true; }
const V2_TV = ['Girabola: Petro de Luanda e 1.º de Agosto empatam no clássico', 'Novela das 20h: a Mana Joana descobriu o segredo do Kota Zé', 'Telejornal: nova estrada liga Luanda a Ícolo e Bengo', 'Kuduro ao vivo: concurso de dança na Ilha', 'Previsão: calor forte em Luanda, 31 graus'];
function v2PropAct(st) {
  const vr = vrG(), L = inInt ? LOC_POS[inInt.loc] : null;
  const key = (inInt ? inInt.loc : '') + ':' + st.prop + ':' + Math.round(st.ox) + ':' + Math.round(st.oz);
  switch (st.act) {
    case 'sit': {
      const w = v2Cd(key, 40);
      playerPos.set(st.ox + Math.sin(st.ory) * .12, 0, st.oz + Math.cos(st.ory) * .12); playerYaw = st.ory;
      V2.sit = { t: 0, by: player ? player.P.body.position.y : 0 };
      if (!w) { vr.energia = Math.min(100, (vr.energia || 0) + 10); toast('🛋️ Sentaste-te um bocado: energia +10.'); if (typeof vrHud === 'function') vrHud(); }
      else toast('🛋️ Estás a descansar…');
      return;
    }
    case 'sleep': return vrDormir(false);
    case 'rest': { const w = v2Cd(key, 90); if (w) return toast(`🛏️ Descansa daqui a ${w}s.`); vr.energia = Math.min(100, (vr.energia || 0) + 22); playerEmote('think'); toast('🛏️ Deitaste-te uns minutos: energia +22.'); if (typeof vrHud === 'function') vrHud(); return; }
    case 'water': { const w = v2Cd(key, 25); if (w) return toast(`💧 Já bebeste água. Espera ${w}s.`); vr.energia = Math.min(100, (vr.energia || 0) + 5); toast('💧 Bebeste água fresquinha: energia +5.'); if (typeof vrHud === 'function') vrHud(); return; }
    case 'read': {
      const w = v2Cd(key, 50); if (w) return toast(`📚 Ainda estás a digerir o último livro (${w}s).`);
      playerEmote('think');
      if (v2YearCap('pInt', 3)) { fx({ inteligencia: 1 }); toast('📚 Leste um capítulo inteiro: Inteligência +1.'); }
      else toast('📚 Leste um pouco. (Já aprendeste o máximo com livros soltos este ano — estuda a sério para subir mais.)');
      save(); refresh(); return;
    }
    case 'tv': {
      if (typeof muWatch === 'function' && typeof LIVE !== 'undefined') { muWatch({ id: 'int_' + (inInt ? inInt.loc : 'x'), n: (L ? L.n : 'TV') + ' · Televisão', ch: null, zona: L ? L.n : '' }); }
      else toast('📺 ' + pick(V2_TV));
      if (!v2Cd(key, 60) && v2YearCap('pFel', 4)) { fx({ felicidade: 1 }); save(); refresh(); }
      return;
    }
    case 'pc': {
      const v = v2G(), e = G.estudo;
      if (v.pcAno === G.ano) return toast('🖥️ Já usaste o computador a sério este ano. Volta no próximo ano.');
      v.pcAno = G.ano; playerEmote('think');
      if (e && e.esf < 3) { e.esf++; toast('🖥️ Fizeste trabalhos e pesquisa online: conta como esforço nos estudos deste ano.'); }
      else { G.cunha = Math.min(1, (G.cunha || 0) + .1); toast('🖥️ Atualizaste o teu CV online: próxima candidatura com mais hipóteses.'); }
      save(); refresh(); return;
    }
    case 'roupa': return openPanel('casa', 'roupa');
    case 'talk': return v2Talk(st.npc);
  }
}
/* ---------- conversar com as pessoas ---------- */
const V2_STAFF = {
  banco: 'Bom dia! Bem-vindo(a) ao Banco Palanca. Quer abrir conta, depositar ou pedir crédito?', emprego: 'Olá! Temos vagas novas esta semana. Já atualizou o seu currículo?',
  escola: 'Bom dia! Ensino médio, cursos técnicos e carta aqui. As universidades ficam na Cidade Universitária.', clinica: 'Boa tarde. Tem consulta marcada ou é urgência?',
  igreja: 'A paz esteja contigo! A comunidade está sempre de portas abertas.', ginasio: 'Bora treinar? Hoje é dia de pernas!', shopping: 'Seja bem-vindo(a) ao Kianda Mall! Promoções em roupa e tecnologia.',
  farra: 'Kizomba até de manhã! O que vais querer?', imobiliaria: 'Procura casa para arrendar ou comprar? Temos do Musseque ao Miramar.', empresa: 'Bem-vindo(a) à Torre Empresarial. Tem reunião marcada?',
  obras: 'Capacete sempre! Quer comprar terreno ou ver uma obra?', casa: 'Então, como correu o dia?', cela: 'Silêncio aí! A visita é ao domingo.',
  uan: 'Secretaria académica da UAN, bom dia. Matrículas, exames de acesso e certificados aqui.', ukianda: 'Bem-vindo(a) à Universidade Privada Kianda! Inscrições abertas em todas as faculdades.', ispm: 'Olá! Aqui no Politécnico Mulemba as propinas são baixas e os cursos são práticos.',
};
const V2_CHAT = {
  _: ['Epá, hoje o calor está bwé forte!', 'Ouviste o resultado do Girabola? O Petro ganhou outra vez.', 'Estou a juntar kumbu para a minha primeira casa.', 'Já foste à Ilha este fim de semana?', 'Os candongueiros hoje estavam todos cheios…', 'Dizem que vão abrir mais vagas no Centro de Emprego.'],
  banco: ['Esta fila não anda, mano…', 'Vim pedir crédito para abrir a minha cantina.'], escola: ['Amanhã há teste de Matemática, estou a tremer.', 'Quero entrar na UAN, por isso estudo todos os dias.'],
  uan: ['O exame de acesso de Medicina é muito difícil!', 'Estou no 3.º ano de Engenharia. Falta pouco!'], ukianda: ['A propina aqui é cara, mas os professores são bons.', 'Vou fazer intercâmbio em Portugal no mestrado.'], ispm: ['Aqui aprendemos a fazer, não só a teoria.', 'Faço Informática à noite e trabalho de dia.'],
  clinica: ['Vim fazer o check-up anual.', 'O paludismo apanhou-me outra vez…'], igreja: ['Domingo há almoço da comunidade, aparece!', 'O coro está a ensaiar para o Natal.'],
  ginasio: ['Já vou no 10.º treino este mês!', 'Quero entrar na seleção de basquetebol.'], farra: ['Esta música é da boa!', 'Bora dançar kizomba?'], shopping: ['Estes ténis estão em promoção!', 'Vim só ver… o dinheiro não chega.'],
  imobiliaria: ['Os preços em Talatona estão loucos!', 'Vou arrendar no Kilamba, é mais barato.'], empresa: ['Reunião às 9h, e já estou atrasado.', 'O meu chefe prometeu-me promoção.'],
};
function v2NpcRole(D, n) {
  if (n.mode === 'work') return 'staff';
  let best = null, bd = 2.4; D.stations.forEach(s => { if (s.small || s.act) return; const d = Math.hypot(s.x - n.h.g.position.x, s.z - n.h.g.position.z); if (d < bd) { bd = d; best = s; } });
  return best ? 'staff' : 'npc';
}
function v2NearStation(D, n) { let best = null, bd = 1e9; D.stations.forEach(s => { if (s.small || s.act) return; const d = Math.hypot(s.x - n.h.g.position.x, s.z - n.h.g.position.z); if (d < bd) { bd = d; best = s; } }); return best; }
function v2Talk(i) {
  if (!inInt) return; const D = inInt, n = D.npcs[i]; if (!n) return;
  const id = D.loc, role = v2NpcRole(D, n), st = v2NearStation(D, n);
  n.h.g.rotation.y = Math.atan2(playerPos.x - n.h.g.position.x, playerPos.z - n.h.g.position.z);
  playerYaw = Math.atan2(n.h.g.position.x - playerPos.x, n.h.g.position.z - playerPos.z);
  const fala = role === 'staff' ? (V2_STAFF[id] || 'Bom dia! Em que posso ajudar?') : pick((V2_CHAT[id] || []).concat(V2_CHAT._));
  const nome = role === 'staff' ? ({ casa: 'Família', cela: 'Guarda' }[id] || 'Funcionário(a)') : pick(['Kota Mingas', 'Mana Teresa', 'Djamila', 'Nelo', 'Tio Bento', 'Kiesse', 'Wilson', 'Ndalu', 'Yola', 'Dário']);
  V2.talk = { i, st, role };
  let el = document.getElementById('v2Talk');
  if (!el) { document.body.insertAdjacentHTML('beforeend', '<div id="v2Talk" class="hidden"></div>'); el = document.getElementById('v2Talk'); }
  const btn = (t, f) => `<button class="chip" onclick="${f}">${t}</button>`;
  el.innerHTML = `<div class="v2t-h"><div class="v2t-av">💬</div><div><b>${nome}</b><span>${LOC_POS[id] ? LOC_POS[id].n : ''}</span></div><button class="v2t-x" onclick="v2TalkClose()">✕</button></div><p>"${fala}"</p>
    <div class="btns">${role === 'staff' && st ? btn(`${st.ico} ${st.label.split('·')[0].trim()}`, 'v2TalkSt()') : ''}${btn('💬 Conversar', 'v2TalkChat()')}${role !== 'staff' && G.idade >= 5 ? btn('🤝 Fazer amizade', `v2TalkClose();makeFriend('${id === 'igreja' ? 'na igreja' : 'por aí'}')`) : ''}${btn('💡 Pedir uma dica', 'v2TalkTip()')}</div>`;
  el.classList.remove('hidden');
}
function v2TalkClose() { V2.talk = null; const el = document.getElementById('v2Talk'); if (el) el.classList.add('hidden'); }
function v2TalkSt() { const t = V2.talk; v2TalkClose(); if (t && t.st && inInt) ivUseOrig(t.st); }
function v2TalkChat() {
  const v = v2G(); if (v.talkAno !== G.ano) { v.talkAno = G.ano; v.talkN = 0; }
  const el = document.querySelector('#v2Talk p');
  const r = pick(['Hahaha, és bué fixe! Aparece mais vezes.', 'Pois é, a vida em Luanda não é fácil, mas a gente vai vencendo.', 'Gostei de falar contigo! Boa sorte com tudo.', 'Epá, tens razão. Vamos combinar um dia destes!']);
  if (el) el.textContent = '"' + r + '"';
  if (v.talkN < 5) { v.talkN++; fx({ felicidade: 1 }); refresh(); }
  if (typeof playerEmote === 'function') playerEmote('cheer');
}
function v2TalkTip() {
  const el = document.querySelector('#v2Talk p'); let tips = [];
  try { tips = aiTips().map(t => strip(t)); } catch (e) { }
  const q = v2Qual().s; tips.push(q < 35 ? 'Se queres ser alguém grande, estuda: cada ano de universidade sobe o salário e o respeito.' : 'Já tens boa qualificação. Pede promoção quando o desempenho estiver alto!');
  tips.push('A energia recupera sozinha com o tempo. E dormir em casa dá energia extra.');
  if (el) el.textContent = '💡 ' + pick(tips);
}
let ivUseOrig = null;
(function () {
  ivUseOrig = ivUse;
  ivUse = function (st) { if (st && st.act) { if (!inInt) return; ivGo = null; return v2PropAct(st); } return ivUseOrig.apply(this, arguments); };
  const _tap = ivTap; ivTap = function (id) {
    if (inInt && !uiBlocked && !dying && typeof id === 'string') {
      const s = id.split(':');
      if (s[1] === 'npc') {
        const n = inInt.npcs[+s[2]]; if (!n) return;
        const nx = n.h.g.position.x, nz = n.h.g.position.z, dx = playerPos.x - nx, dz = playerPos.z - nz, d = Math.hypot(dx, dz) || 1;
        if (d < 1.6) return v2Talk(+s[2]);
        let tx = nx + dx / d * 1.1, tz = nz + dz / d * 1.1;
        if (!v2FreeAt(inInt, tx, tz)) { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, px = nx + Math.sin(a) * 1.2, pz = nz + Math.cos(a) * 1.2; if (v2FreeAt(inInt, px, pz)) { tx = px; tz = pz; break; } } }
        ivGo = { x: tx, z: tz, st: { act: 'talk', npc: +s[2], ry: 0, label: 'Falar', ico: '💬' }, t: 0, stuck: 0 };
        return;
      }
    }
    return _tap.apply(this, arguments);
  };
  const _ex = ivExit; ivExit = function () { v2TalkClose(); V2.sit = null; return _ex.apply(this, arguments); };
})();
function v2IntTick(dt) {
  const D = inInt; if (!D) return;
  // rótulos dos objetos só aparecem perto
  D.stations.forEach(s => { if (s.lab) s.lab.visible = Math.hypot(s.ox - playerPos.x, s.oz - playerPos.z) < 3.4; });
  D.npcs.forEach(n => { if (n.hb && n.mode === 'walk') { n.hb.position.set(n.h.g.position.x, 1, n.h.g.position.z); n.hb.updateMatrixWorld(true); } });
  // sentado no sofá
  if (V2.sit && player) {
    const mv = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight || (joy.active && Math.hypot(joy.x, joy.y) > .15) || ivGo;
    V2.sit.t += dt;
    if (mv) { player.P.body.position.y = V2.sit.by; V2.sit = null; }
    else { player.g.position.copy(playerPos); player.g.rotation.y = playerYaw; v2Sit(player, .47); if (V2.sit.t > 6 && V2.sit.t - dt <= 6) { const vr = vrG(); vr.energia = Math.min(100, (vr.energia || 0) + 4); } }
  }
  if (V2.talk) { const n = D.npcs[V2.talk.i]; if (!n || Math.hypot(n.h.g.position.x - playerPos.x, n.h.g.position.z - playerPos.z) > 4) v2TalkClose(); }
}

/* =========================================================
   9) LIGAR AO CICLO DO JOGO
   ========================================================= */
(function () {
  const _uw = updateWorld;
  updateWorld = function (dt) {
    try { if (V2.ride) v2RideTick(dt); else if (V2.leaving) v2RideTick(dt); } catch (e) { console.error('ride', e); V2.ride = null; }
    const r = _uw.apply(this, arguments);
    try {
      if (V2.ride) { v2RidePose(); if (nearLoc) { nearLoc = null; } const p = document.getElementById('prompt'); if (p) p.classList.add('hidden'); }
      if (typeof inInt !== 'undefined' && inInt) v2IntTick(dt);
      v2RegenTick(Math.min(dt, .5));
      V2.uiT += dt;
      if (V2.uiT > .3) {
        V2.uiT = 0;
        if (autoGo) v2WalkUI(); else if (V2.walkId) v2WalkEnd();
        const rg = document.querySelector('#hEnergy .v2rg'); if (rg) rg.textContent = v2RegenTxt();
      }
    } catch (e) { }
    return r;
  };
})();

/* ---------- interior das universidades: anfiteatro, biblioteca e secretaria ---------- */
function v2UniRoom(D, U) {
  ivRoom(D, { w: 22, d: 15, h: 5.4, ftex: ivFloorTex('wood', U.floor, '#000'), frep: 4, fr: .55, wall: U.wall, wains: U.cor, trim: shade(U.cor, .7), bg: '#12141a', door: shade(U.cor, .7) });
  const cor = U.cor;
  IVP = D.back;
  ivB(9.2, 2.9, .06, '#5a3d26', 2, 1, -7.48);
  ivPlane(8.8, 2.6, ivCanvas('v2board_' + U.id + U.sig, 640, 190, (x, w, h) => {
    x.fillStyle = '#1f4a34'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '700 26px "Comic Sans MS",system-ui';
    const cs = [].concat(...U.fac.map(f => f[1])).slice(0, 4).map(id => v2Curso(id).t);
    x.fillText(U.sig + ' · Aula de hoje', 24, 40); x.font = '600 20px "Comic Sans MS",system-ui';
    cs.forEach((t, i) => x.fillText('• ' + t, 30, 78 + i * 26)); x.fillText('∫ f(x)dx = F(b) − F(a)', 380, 90); x.fillText('PIB = C + I + G + (X − M)', 360, 130);
  }), 2, 2.4, -7.44);
  ivSign(U.sig + ' · ' + (U.pub ? 'PÚBLICA' : 'PRIVADA'), 8.4, cor, '#ffffff', U.lema.toUpperCase(), 2, 4.55, -7.45);
  ivArt(-7.4, 2.9, -7.47, 0, 2.2, 1.3, 'angola', '#3a2a1a'); ivClock(8.4, 4.2, -7.47, 0);
  IVP = D.right;
  ivB(.05, 1.9, 2.9, '#6b4423', 10.97, 1.25, -3.6);
  ivPlane(2.7, 1.7, ivCanvas('v2avisos', 300, 190, (x, w, h) => {
    x.fillStyle = '#c9a26a'; x.fillRect(0, 0, w, h); const cs = ['#fff7a8', '#ffffff', '#ffd1dc', '#c8f0ff'];
    [['BOLSAS', 'Média 15+'], ['ESTÁGIOS', 'Verão 2026'], ['EXAMES', 'Época normal'], ['SEMANA', 'ACADÉMICA']].forEach(([a, b], i) => { const X = 14 + (i % 2) * 145, Y = 14 + Math.floor(i / 2) * 88; x.fillStyle = cs[i]; x.fillRect(X, Y, 130, 76); x.fillStyle = '#222'; x.font = '900 18px system-ui'; x.fillText(a, X + 8, Y + 30); x.font = '600 14px system-ui'; x.fillText(b, X + 8, Y + 54); });
  }), 10.94, 2.2, -3.6, -Math.PI / 2);
  IVP = D.st;
  // mesa do professor e anfiteatro
  ivTable(2, -6.1, 2.6, 1, .8, '#6b4423'); ivCol(D, 2, -6.1, 2.8, 1.2); ivLaptop(2.6, .8, -6.1, 0); ivB(.4, .06, .3, '#c8102e', 1.2, .8, -6.1);
  const xs = [-3, -.6, 1.8, 4.2, 6.6], zs = [-3.5, -1.7, .1];
  zs.forEach((z, r) => xs.forEach((x, c) => {
    ivTable(x, z, 1.7, .55, .74, U.desk, '#444'); ivChair(x - .42, z + .55, Math.PI, cor); ivChair(x + .42, z + .55, Math.PI, cor); ivCol(D, x, z + .2, 1.8, 1.1);
    if ((r * 5 + c) % 3 !== 1) ivNPC(D, x + ((r + c) % 2 ? .42 : -.42), z + .55, Math.PI, { mode: 'sit', cfg: { shirt: pick(['#f2f2f2', '#1f63c9', '#c8102e', '#2e8b57', '#e8b923', cor]), pants: pick(['#2b3a55', '#1a1a1a', '#5a4632']) } });
  }));
  ivNPC(D, .6, -6.7, .25, { mode: 'think', cfg: { shirt: '#3a2a1a', pants: '#222' } });
  // biblioteca
  [-6.4, -4.4, -2.4].forEach(z => ivShelf(-10.75, z, Math.PI / 2, 1.9, 2.6)); ivCol(D, -10.6, -4.4, .6, 6.2);
  ivTable(-8.1, -3.6, 1.3, 2.4, .76, '#7a5236'); ivCol(D, -8.1, -3.6, 1.5, 2.6);
  ivChair(-8.95, -4.3, Math.PI / 2, cor); ivChair(-8.95, -2.9, Math.PI / 2, cor); ivChair(-7.25, -3.6, -Math.PI / 2, cor);
  ivNPC(D, -8.95, -4.3, Math.PI / 2, { mode: 'sit', fem: true }); ivNPC(D, -7.25, -3.6, -Math.PI / 2, { mode: 'sit' });
  // secretaria académica
  ivCounter(9.7, 2.6, 1.1, 3.6, 1.08, '#ffffff', cor); ivCol(D, 9.7, 2.6, 1.3, 3.8); ivPC(9.8, 1.08, 1.6, -Math.PI / 2);
  ivNPC(D, 10.5, 2.8, -Math.PI / 2, { mode: 'work', fem: true, cfg: { shirt: cor, pants: '#1a1a1a' } });
  ivNPC(D, 8.2, 3.6, Math.PI / 2, {}); ivNPC(D, 7.4, 3.7, Math.PI / 2, { mode: 'think', fem: true });
  // zona de convívio
  ivSofa(-10.35, .7, Math.PI / 2, cor, 2.4); ivCol(D, -10.35, .7, 1, 2.5); ivCooler(-10.5, 3); ivCol(D, -10.5, 3, .5, .5);
  ivPlant(-5.2, -6.9, 1.2); ivPlant(10.3, -6.6, 1.1); ivPlant(10.3, 6.4, 1); ivPlant(-4, 6.6, .9);
  ivRug(2, 3.6, 7, 2.2, cor, ivRugTex(cor, '#ffcb00', shade(cor, .7)));
  ivNPC(D, -3.5, 4.6, 0, { mode: 'walk', a: [-3.5, 4.6], b: [5.5, 4.4] });
  ivLights(D, { hi: .78, ki: .74, points: [[2, 4.6, -2, '#fff6e0', .6, 14], [-8, 4, -3.5, '#fff1d0', .45, 9], [9, 4, 2.6, '#fff1d0', .4, 8]] });
  ivPendant(-1, 5.4, -2); ivPendant(5, 5.4, -2);
  ivStation(D, { x: 8.4, z: 2.6, ry: Math.PI / 2, tab: 'fac', ico: '🏛️', label: 'Secretaria · Matrículas', hit: [9.7, 2.6, 1.3, 3.8, 1.5] });
  ivStation(D, { x: 2, z: -4.8, ry: Math.PI, tab: 'est', ico: '📖', label: 'Sala de aula · O meu curso', hit: [2, -6.1, 2.8, 1.2, 1.6] });
  ivStation(D, { x: 9.6, z: -3.6, ry: Math.PI / 2, tab: 'vida', ico: '💼', label: 'Bolsas & Estágios', hit: [10.8, -3.6, .6, 3, 2.8] });
  ivStation(D, { x: -7.4, z: -6.2, ry: Math.PI, tab: 'qual', ico: '🏆', label: 'Quadro de Honra · Qualificação', hit: [-7.4, -7.3, 2.6, .4, 3.4] });
}
V2_UIDS.forEach(id => { IV_ROOMS[id] = D => v2UniRoom(D, V2_UNI[id]); if (!IV_IDS.includes(id)) IV_IDS.push(id); });
