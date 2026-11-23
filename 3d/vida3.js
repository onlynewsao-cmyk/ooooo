/* =========================================================
   PRÓXIMA ENCARNAÇÃO — vida3.js  "Formação, Turnos & Comida"
   · App "Uni Angola": universidades das 21 províncias, cursos de
     10 níveis (20 s por nível, máx. 3 níveis por dia), presencial
     só na tua cidade; online é mais caro.
   · App "Turno Já": turnos de 1 minuto, só para quem é elegível;
     cada turno desgasta energia, fome e saúde.
   · Restaurante, Cantina e Ponto de Candongueiros (zungueiras).
   · Viajar gasta energia conforme a qualidade do transporte.
   ========================================================= */
const V3 = { act: null, uiT: 0, emoT: 0, prov: null, selP: null, tab: 'cid' };
function v3G() {
  if (!G) return {};
  if (!G.v3) G.v3 = {};
  const d = { cur: {}, dia: '', nivHoje: 0, turnos: 0, ganhos: 0, turnoDia: '', ganhosHoje: 0, buff: 0, espAno: {}, act: null, hist: [] };
  for (const k in d) if (G.v3[k] === undefined) G.v3[k] = d[k];
  return G.v3;
}
const v3Hoje = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const v3K = () => (typeof cid === 'function' ? cid().custo || 1 : 1);
const v3Buff = () => { const v = v3G(); return v.buff > Date.now(); };
const V3_DIA_MAX = 3, V3_NIV_MAX = 10, V3_T_CURSO = 20000, V3_T_TURNO = 60000;

/* ---------------- universidades por província ---------------- */
const V3_PUB = {
  'Luanda': ['UAN', 'Universidade Agostinho Neto', 10], 'Cabinda': ['UON', 'Universidade 11 de Novembro', 8],
  'Benguela': ['UKB', 'Universidade Katyavala Bwila', 8], 'Huambo': ['UJES', 'Universidade José Eduardo dos Santos', 8],
  'Huíla': ['UMN', 'Universidade Mandume ya Ndemufayo', 8], 'Uíge': ['UNIKIVI', 'Universidade Kimpa Vita', 8],
  'Lunda Norte': ['ULAN', "Universidade Lueji A'Nkonde", 8], 'Malanje': ['URNM', 'Universidade Rainha Njinga a Mbande', 8],
  'Cubango': ['UCC', 'Universidade Cuito Cuanavale', 7],
};
const V3_ORIG = {};
V2_UIDS.forEach(id => { const U = V2_UNI[id]; V3_ORIG[id] = { n: U.n, sig: U.sig, lema: U.lema, prest: U.prest }; });
function v3Sig(P) { return P.n.split(/\s+/).map(w => w[0]).join('').toUpperCase().replace(/[^A-ZÍÚÉÓÁ]/g, ''); }
/* as 3 universidades de uma província (ocupam os 3 campus da Cidade Universitária) */
function v3UnisDe(P) {
  if (P.n === 'Luanda') return V2_UIDS.map(id => Object.assign({ slot: id }, V3_ORIG[id]));
  const pb = V3_PUB[P.n], c = P.cap;
  return [
    pb ? { slot: 'uan', sig: pb[0], n: pb[1], prest: pb[2], lema: `Pública · exame de acesso · a maior ${provDe(P.n)}` }
       : { slot: 'uan', sig: 'ISP' + v3Sig(P), n: `Instituto Superior Politécnico Público de ${c}`, prest: 6, lema: 'Público · exame de acesso · propina simbólica' },
    { slot: 'ukianda', sig: 'UPK', n: `Universidade Privada Kianda · ${c}`, prest: 6, lema: 'Privada · entrada direta · polo provincial' },
    { slot: 'ispm', sig: 'ISPM', n: `Politécnico Mulemba · ${c}`, prest: 4, lema: 'Privado · propinas baixas · cursos práticos' },
  ];
}
function v3ApplyProv(force) {
  if (!G || !G.cidade) return;
  const P = cid(); if (!force && V3.prov === P.n) return;
  const changed = V3.prov && V3.prov !== P.n; V3.prov = P.n;
  v3UnisDe(P).forEach(u => {
    const U = V2_UNI[u.slot]; if (!U) return;
    U.n = u.n; U.sig = u.sig; U.lema = u.lema; U.prest = u.prest;
    if (LOC_POS[u.slot]) { LOC_POS[u.slot].n = u.n; LOC_POS[u.slot].zona = P.n === 'Luanda' ? 'Cidade Universitária' : `Cidade Universitária · ${P.cap}`; }
    if (PANELS[u.slot]) { PANELS[u.slot].t = u.n; PANELS[u.slot].sub = u.lema; }
    if (U.signM) { try { const np = signPlane(u.n.toUpperCase(), Math.min(U.w - 3, 17), U.cor, '#ffffff', u.lema.toUpperCase()); U.signM.material = np.material; } catch (e) { } }
    if (changed && typeof IV_CACHE !== 'undefined') delete IV_CACHE[u.slot];
  });
}

/* ---------------- cursos de formação (10 níveis) ---------------- */
const V3_CURSOS = [
  { id: 'informatica', t: 'Informática', ico: '💻', st: 'inteligencia', rel: ['informatica', 'program', 'tecnico'], d: 'Do Word à programação. Abre turnos de técnico e programador.' },
  { id: 'ingles', t: 'Inglês', ico: '🗣', st: 'inteligencia', rel: ['ri', 'turismo', 'diplomata', 'hoteleiro', 'rececao'], univ: 1, d: 'Ajuda em qualquer emprego formal. Essencial em hotéis e diplomacia.' },
  { id: 'contab', t: 'Contabilidade e Finanças', ico: '🧮', st: 'inteligencia', rel: ['economia', 'gestao', 'contab', 'banc', 'caixa'], d: 'Balanços, impostos e IVA. Abre turnos de caixa e contabilista.' },
  { id: 'gestao', t: 'Gestão e Liderança', ico: '📈', st: 'inteligencia', rel: ['gestao', 'economia', 'diretor', 'gerente', 'consultor'], univ: 1, d: 'Liderar equipas. Conta para promoções em qualquer empresa.' },
  { id: 'socorros', t: 'Enfermagem e Primeiros Socorros', ico: '🩺', st: 'saude', rel: ['medicina', 'enfermagem', 'farmacia', 'medico', 'enfermeiro', 'farmaceutico'], d: 'Salvar vidas. Abre turnos de enfermagem.' },
  { id: 'mecanica', t: 'Mecânica Auto', ico: '🔧', st: 'saude', rel: ['mecanic', 'motorista', 'taxista'], d: 'Motores, travões e Hiaces. Abre turnos de mecânico.' },
  { id: 'eletric', t: 'Electricidade e Energia Solar', ico: '⚡', st: 'inteligencia', rel: ['civil', 'eletric', 'engenh'], d: 'Instalações e painéis solares. Abre turnos de electricista.' },
  { id: 'culinaria', t: 'Culinária Angolana', ico: '🍲', st: 'felicidade', rel: ['cozinh', 'chef', 'hoteleiro', 'turismo'], d: 'Muamba, calulu e mufete. Abre turnos de cozinheiro(a).' },
  { id: 'marketing', t: 'Marketing Digital', ico: '📣', st: 'aparencia', rel: ['comunicacao', 'design', 'influ', 'jornal', 'designer'], d: 'Redes sociais e publicidade. Dá seguidores e turnos de gestor(a) de redes.' },
  { id: 'petroleo', t: 'Petróleo & Gás · Segurança', ico: '🛢', st: 'inteligencia', rel: ['petroleos', 'geologia', 'engpetro', 'geologo'], edu: 3, d: 'Segurança offshore. Abre os turnos mais bem pagos do país.' },
  { id: 'direito', t: 'Direito e Cidadania', ico: '⚖', st: 'inteligencia', rel: ['direito', 'ri', 'advog', 'juiz', 'diplomata'], d: 'Leis, contratos e direitos. Abre consultas jurídicas.' },
  { id: 'agro', t: 'Agro-negócio', ico: '🌱', st: 'saude', rel: ['agronomia', 'agronomo', 'agricult'], d: 'Fazendas, gado e exportação.' },
];
const V3_OFERTA = {
  uan: ['ingles', 'contab', 'direito', 'petroleo', 'agro', 'socorros', 'informatica', 'gestao'],
  ukianda: ['gestao', 'marketing', 'ingles', 'informatica', 'direito', 'socorros', 'contab', 'petroleo'],
  ispm: ['mecanica', 'eletric', 'culinaria', 'informatica', 'marketing', 'socorros', 'agro', 'ingles'],
};
const V3_UFAC = { uan: .6, ukianda: 1.5, ispm: .9 };
const v3Curso = id => V3_CURSOS.find(c => c.id === id);
const v3Lv = id => (v3G().cur[id] || 0);
const v3LvTxt = n => n >= 10 ? 'Diploma' : n >= 5 ? 'Certificado' : n > 0 ? 'Básico' : 'Por começar';
function v3Preco(slot, cid_, online) {
  const n = v3Lv(cid_) + 1;
  return Math.round(2500 * (1 + (n - 1) * .35) * (V3_UFAC[slot] || 1) * v3K() * (online ? 1.6 : 1) / 100) * 100;
}
function v3DiaReset() { const v = v3G(), h = v3Hoje(); if (v.dia !== h) { v.dia = h; v.nivHoje = 0; } if (v.turnoDia !== h) { v.turnoDia = h; v.ganhosHoje = 0; } }
const v3Presente = slot => (typeof inInt !== 'undefined' && inInt) ? inInt.loc === slot : vrNearLoc(slot, 26);
const v3Total = () => Object.values(v3G().cur).reduce((s, n) => s + n, 0);
const v3Diplomas = () => Object.values(v3G().cur).filter(n => n >= 10).length;

function v3Ocupado() {
  const a = v3G().act; if (!a) return false;
  toast(a.k === 'curso' ? '📖 Estás a meio de uma aula. Espera ou cancela.' : '⏱ Estás a meio de um turno. Espera ou cancela.'); return true;
}
function v3CursoStart(slot, cid_, online) {
  if (!G || v3Ocupado()) return;
  const c = v3Curso(cid_), v = v3G(), vr = vrG(), U = V2_UNI[slot]; if (!c || !U) return;
  if (G.idade < 14) return toast('🧒 Os cursos de formação são a partir dos 14 anos.');
  if (!V3_OFERTA[slot].includes(cid_)) return toast('Esta universidade não dá esse curso.');
  if (c.edu && G.edu < c.edu) return toast(`📚 Este curso pede ${EDU[c.edu]}.`);
  v3DiaReset();
  if (v.nivHoje >= V3_DIA_MAX) return toast(`📅 Já fizeste ${V3_DIA_MAX} níveis hoje. Volta amanhã!`);
  if (v3Lv(cid_) >= V3_NIV_MAX) return toast('🎓 Já tens o Diploma deste curso (nível 10).');
  if (!online && !v3Presente(slot)) return toast(`📍 Para estudar presencialmente tens de estar na ${U.n}. Ou faz online (mais caro).`);
  if (vr.energia < 12) return toast('😴 Estás muito cansado(a) para estudar. Come qualquer coisa ou dorme.');
  if (vr.fome < 8) return toast('🍽 Estás com muita fome para te concentrares. Vai comer primeiro.');
  const p = v3Preco(slot, cid_, online); if (!pay(p)) return;
  v.nivHoje++;
  v.act = { k: 'curso', id: cid_, slot, online: !!online, t0: Date.now(), dur: V3_T_CURSO, p, lvl: v3Lv(cid_) + 1 };
  if (typeof closePhone === 'function') closePhone(); closePanel();
  if (typeof SND !== 'undefined') SND.play('chime');
  toast(`${c.ico} Nível ${v.act.lvl} de ${c.t} ${online ? '(online)' : 'na ' + U.sig}: 20 segundos de aula…`);
  save(); v3ActUI();
}
function v3CursoFim(a) {
  const c = v3Curso(a.id), v = v3G(), vr = vrG(); if (!c) return;
  v.cur[a.id] = Math.min(V3_NIV_MAX, (v.cur[a.id] || 0) + 1); const n = v.cur[a.id];
  const k = v3Buff() ? .7 : 1;
  vr.energia = Math.max(0, vr.energia - (a.online ? 6 : 7) * k); vr.fome = Math.max(0, vr.fome - 4 * k);
  const ef = { [c.st]: 1 };
  if (c.id === 'marketing') G.seg = (G.seg || 0) + 40 * n;
  let tit = `${c.ico} ${c.t}: nível ${n}/10 concluído!`;
  if (n === 5) { ef[c.st] = 3; ef.felicidade = 3; tit = `📜 CERTIFICADO em ${c.t} (nível 5)!`; }
  if (n === 10) { ef[c.st] = 4; ef.felicidade = 6; ef.fama = 2; tit = `🎓 DIPLOMA DE ESPECIALIZAÇÃO em ${c.t}!`; }
  const r = fx(ef);
  addLog(`${tit} ${a.online ? 'Online' : 'Presencial'} · ${kzShort(a.p)}. ${r} · energia −${Math.round((a.online ? 6 : 7) * k)}`, n >= 5 ? 'gold' : 'good');
  toast(tit); if (typeof playerEmote === 'function') playerEmote(n >= 5 ? 'cheer' : 'think');
  v.hist.unshift({ t: tit, ano: G.ano }); v.hist = v.hist.slice(0, 20);
}

/* ---------------- turnos (1 minuto) ---------------- */
// r: idade, edu, cur{id:n}, curso[] (licenciatura), qual, st{k:v}, carta, tel, limpo · w: desgaste (en, fo, sa, fe) · g: ganhos de atributos
const V3_TURNOS = [
  { id: 'lavar', t: 'Lavador(a) de carros', ico: '🧼', pay: 4000, r: { idade: 14 }, w: { en: 14, fo: 9, sa: 0 }, g: { saude: 0 }, onde: null, d: 'Na bomba de gasolina Mulemba' },
  { id: 'zunga', t: 'Zungueiro(a) de água e gasosa', ico: '🧺', pay: 5000, r: { idade: 14 }, w: { en: 16, fo: 10 }, onde: 'candongueiros', d: 'No Ponto de Candongueiros' },
  { id: 'cobrador', t: 'Cobrador(a) de candongueiro', ico: '🚐', pay: 6500, r: { idade: 16 }, w: { en: 18, fo: 10 }, onde: 'candongueiros', d: '"Mutamba, Mutamba! Viana, Viana!"' },
  { id: 'cozinha', t: 'Ajudante de cozinha', ico: '🍲', pay: 7000, r: { idade: 16 }, w: { en: 12, fo: 4 }, onde: 'cantina', d: 'Na Cantina Popular · comes de graça' },
  { id: 'mesa', t: 'Empregado(a) de mesa', ico: '🍽', pay: 8500, r: { idade: 16, st: { aparencia: 45 } }, w: { en: 13, fo: 6 }, onde: 'restaurante', d: 'No Restaurante Sabor da Banda · gorjetas' },
  { id: 'carregador', t: 'Carregador(a) de armazém', ico: '📦', pay: 9500, r: { idade: 18, st: { saude: 60 } }, w: { en: 24, fo: 14, sa: 2 }, d: 'Armazém do Porto de Luanda · trabalho pesado' },
  { id: 'estafeta', t: 'Estafeta Txova', ico: '🛵', pay: 10000, r: { idade: 16, tel: 2 }, w: { en: 17, fo: 9 }, d: 'Entregas de comida pela cidade' },
  { id: 'caixa', t: 'Operador(a) de caixa', ico: '🧮', pay: 12500, r: { idade: 16, edu: 2, cur: { contab: 2 } }, w: { en: 10, fo: 6 }, d: 'Supermercado do Kianda Mall' },
  { id: 'explicador', t: 'Explicador(a) de Matemática', ico: '🧑‍🏫', pay: 14000, r: { idade: 16, edu: 3, st: { inteligencia: 62 } }, w: { en: 10, fo: 5 }, d: 'Explicações ao domicílio' },
  { id: 'seguranca', t: 'Segurança de discoteca', ico: '🛡', pay: 15000, r: { idade: 18, st: { saude: 65 }, limpo: 1 }, w: { en: 16, fo: 8, sa: 1 }, d: 'Porta da Discoteca Kizomba' },
  { id: 'rececao', t: 'Rececionista de hotel', ico: '🛎', pay: 17000, r: { idade: 18, edu: 3, cur: { ingles: 3 }, st: { aparencia: 55 } }, w: { en: 10, fo: 6 }, d: 'Hotel Presidente' },
  { id: 'kandonga', t: 'Motorista de candongueiro', ico: '🚐', pay: 19000, r: { idade: 18, carta: 1 }, w: { en: 20, fo: 9, sa: 1 }, onde: 'candongueiros', d: 'Rota Viana–Mutamba' },
  { id: 'cozinheiro', t: 'Cozinheiro(a)', ico: '🥘', pay: 21000, r: { idade: 18, cur: { culinaria: 4 } }, w: { en: 15, fo: 3 }, onde: 'restaurante', d: 'Cozinha do Sabor da Banda' },
  { id: 'eletricista', t: 'Electricista ao domicílio', ico: '🔌', pay: 25000, r: { idade: 18, cur: { eletric: 4 } }, w: { en: 15, fo: 8, sa: 1 }, d: 'Instalações e painéis solares' },
  { id: 'mecanico', t: 'Mecânico(a) de oficina', ico: '🛠', pay: 25000, r: { idade: 18, cur: { mecanica: 4 } }, w: { en: 17, fo: 9, sa: 1 }, d: 'Oficina do Stand Auto Kianda' },
  { id: 'tecnico', t: 'Técnico(a) informático', ico: '💻', pay: 29000, r: { idade: 16, cur: { informatica: 5 } }, w: { en: 10, fo: 6 }, d: 'Reparar computadores e redes' },
  { id: 'redes', t: 'Gestor(a) de redes sociais', ico: '📣', pay: 33000, r: { idade: 16, cur: { marketing: 5 }, tel: 2 }, w: { en: 9, fo: 5 }, d: 'Páginas de marcas angolanas' },
  { id: 'enfermeiro', t: 'Enfermeiro(a) de turno', ico: '🩹', pay: 39000, r: { idade: 18, cur: { socorros: 6 }, ou: { curso: ['enfermagem', 'medicina'] } }, w: { en: 18, fo: 9, sa: 1 }, d: 'Hospital Geral · urgências' },
  { id: 'contabilista', t: 'Contabilista freelancer', ico: '📊', pay: 44000, r: { idade: 18, edu: 3, cur: { contab: 6 }, qual: 30 }, w: { en: 11, fo: 6 }, d: 'Contas de pequenas empresas' },
  { id: 'programador', t: 'Programador(a) freelance', ico: '🧑‍💻', pay: 62000, r: { idade: 16, cur: { informatica: 8, ingles: 4 } }, w: { en: 13, fo: 8 }, d: 'Apps para clientes de Lisboa e Joanesburgo' },
  { id: 'consultor', t: 'Consultor(a) de gestão', ico: '👔', pay: 78000, r: { idade: 21, cur: { gestao: 8 }, qual: 50 }, w: { en: 13, fo: 7 }, d: 'Reestruturar empresas na Baixa' },
  { id: 'advogado', t: 'Consulta jurídica', ico: '⚖', pay: 92000, r: { idade: 22, qual: 50, curso: ['direito'], ou: { cur: { direito: 10 } } }, w: { en: 12, fo: 6 }, d: 'Contratos, heranças e tribunais' },
  { id: 'offshore', t: 'Turno numa plataforma offshore', ico: '🛢', pay: 125000, r: { idade: 21, cur: { petroleo: 8 }, curso: ['petroleos', 'geologia'] }, w: { en: 30, fo: 16, sa: 3 }, d: 'Bloco 17 · helicóptero desde o aeroporto' },
  { id: 'medico', t: 'Banco de urgência (médico)', ico: '🚑', pay: 140000, r: { idade: 24, curso: ['medicina'], qual: 55 }, w: { en: 28, fo: 14, sa: 2 }, d: 'Hospital Geral · 1 minuto que vale uma noite' },
];
function v3Req(r) {
  const f = [];
  const reqCur = (cu) => Object.entries(cu || {}).filter(([id, n]) => v3Lv(id) < n).map(([id, n]) => `${v3Curso(id).t} nível ${n}`);
  if (r.idade && G.idade < r.idade) f.push(`idade ${r.idade}+`);
  if (r.edu && G.edu < r.edu) f.push(EDU[r.edu]);
  let cf = reqCur(r.cur), lf = [];
  if (r.curso && !r.curso.some(c => (G.cursosFeitos || []).includes(c))) lf.push('Licenciatura em ' + r.curso.map(c => (CURSOS.find(x => x.id === c) || { t: c }).t).join(' ou '));
  if (r.ou) { // alternativa: cumpre "ou" e dispensa o resto do mesmo tipo
    const altCur = r.ou.cur ? reqCur(r.ou.cur) : null, altLic = r.ou.curso ? !r.ou.curso.some(c => (G.cursosFeitos || []).includes(c)) : null;
    if (r.ou.curso && !altLic) cf = [];
    if (r.ou.cur && altCur && !altCur.length) lf = [];
    if (r.ou.curso && cf.length) cf = [cf.join(' + ') + ' (ou Licenciatura em ' + r.ou.curso.map(c => (CURSOS.find(x => x.id === c) || { t: c }).t).join('/') + ')'];
    if (r.ou.cur && lf.length) lf = [lf.join('') + ' (ou ' + altCur.join(' + ') + ')'];
  }
  f.push(...cf, ...lf);
  if (r.qual && v2Qual().s < r.qual) f.push(`qualificação ${r.qual}+`);
  Object.entries(r.st || {}).forEach(([k, n]) => { if (G.stats[k] < n) f.push(`${LABEL[k]} ${n}+`); });
  if (r.carta && !G.carta) f.push('carta de condução');
  if (r.tel && G.tel < r.tel) f.push('smartphone');
  if (r.limpo && G.cadastro) f.push('registo criminal limpo');
  return f;
}
const v3Rel = (c, ids) => ids.some(x => c.rel.some(r => String(x).includes(r)));
function v3TurnoPay(T) {
  const relLv = V3_CURSOS.reduce((s, c) => s + (v3Rel(c, [T.id]) ? v3Lv(c.id) : 0), 0);
  const q = v2Qual().s;
  return Math.round(T.pay * (cid().sal || 1) * (1 + Math.min(.2, relLv * .02)) * (1 + q / 400) * (v3Buff() ? 1.1 : 1) / 50) * 50;
}
function v3TurnoStart(id) {
  if (!G || v3Ocupado()) return;
  const T = V3_TURNOS.find(t => t.id === id), vr = vrG(); if (!T) return;
  if (G.preso > 0) return toast('🔒 Estás preso(a)!');
  const miss = v3Req(T.r); if (miss.length) return toast('❌ Ainda não és elegível: ' + miss.join(', '));
  if (vr.energia < T.w.en) return toast(`😴 Este turno gasta ${T.w.en} de energia e só tens ${Math.round(vr.energia)}. Come ou dorme primeiro.`);
  if (vr.fome < 10) return toast('🍽 Estás com fome demais para trabalhar. Vai comer (há zungueiras no Ponto de Candongueiros).');
  if (T.w.sa && G.stats.saude < 15) return toast('🤒 Estás doente. Vai à clínica antes de pegar num turno pesado.');
  const v = v3G();
  v.act = { k: 'turno', id, t0: Date.now(), dur: V3_T_TURNO, pay: v3TurnoPay(T) };
  if (typeof closePhone === 'function') closePhone(); closePanel();
  if (typeof SND !== 'undefined') SND.play('chime');
  toast(`${T.ico} Turno de ${T.t} começou: 1 minuto de trabalho…`);
  save(); v3ActUI();
}
function v3Desgaste(w, frac = 1) {
  const vr = vrG(), k = (v3Buff() ? .85 : 1) * frac, out = [];
  if (w.en) { const n = Math.round(w.en * k); vr.energia = Math.max(0, vr.energia - n); out.push(`energia −${n}`); }
  if (w.fo) { const n = Math.round(w.fo * k); vr.fome = Math.max(0, vr.fome - n); out.push(`fome −${n}`); }
  if (w.sa && G.stats.saude > 25 && frac >= 1) { G.stats.saude = Math.max(1, G.stats.saude - w.sa); out.push(`saúde −${w.sa}`); }
  return out.join(' · ');
}
function v3TurnoFim(a) {
  const T = V3_TURNOS.find(t => t.id === a.id), v = v3G(); if (!T) return;
  v3DiaReset();
  G.dinheiro += a.pay; v.turnos++; v.ganhos += a.pay; v.ganhosHoje += a.pay;
  const dz = v3Desgaste(T.w);
  try { const v2 = v2G(); v2.exp = (v2.exp || 0) + .02; } catch (e) { }
  let extra = '';
  if (T.id === 'cozinha') { vrG().fome = Math.min(100, vrG().fome + 25); extra = ' · comeste na cantina (+25 fome)'; }
  if (T.id === 'mesa' && chance(.5)) { const g = Math.round(a.pay * (.1 + Math.random() * .25) / 50) * 50; G.dinheiro += g; extra = ` · gorjetas +${kzShort(g)}`; }
  if (T.id === 'carregador' || T.id === 'lavar') { if (chance(.3)) extra += ' ' + fx({ saude: 1 }); }
  addLog(`${T.ico} Turno concluído: <b>${T.t}</b> · +${kzShort(a.pay)}${extra}. <i>Desgaste: ${dz}.</i>`, 'good');
  toast(`${T.ico} +${kzShort(a.pay)} · ${dz}`);
  if (typeof playerEmote === 'function') playerEmote('cheer');
  if (typeof SND !== 'undefined') SND.play('cash');
}
function v3Cancel() {
  const v = v3G(), a = v.act; if (!a) return;
  const frac = Math.min(1, (Date.now() - a.t0) / a.dur);
  v.act = null;
  if (a.k === 'curso') { const back = Math.round(a.p * .5 / 100) * 100; G.dinheiro += back; v.nivHoje = Math.max(0, v.nivHoje - 1); toast(`Saíste da aula a meio. Devolveram-te ${kzShort(back)}.`); }
  else { const T = V3_TURNOS.find(t => t.id === a.id); const dz = T ? v3Desgaste(T.w, frac) : ''; toast(`Abandonaste o turno: não recebes nada. ${dz}`); }
  save(); refresh(); v3ActUI();
}
function v3ActUI() {
  const a = v3G().act; let el = document.getElementById('v3Act');
  if (!a) { if (el) el.classList.add('hidden'); return; }
  if (!el) { document.body.insertAdjacentHTML('beforeend', '<div id="v3Act" class="hidden"></div>'); el = document.getElementById('v3Act'); }
  const left = Math.max(0, Math.ceil((a.t0 + a.dur - Date.now()) / 1000)), pc = Math.min(100, Math.round((Date.now() - a.t0) / a.dur * 100));
  let ico, t, s;
  if (a.k === 'curso') { const c = v3Curso(a.id); ico = c.ico; t = `${c.t} · nível ${a.lvl}/10`; s = a.online ? 'Aula online' : `Aula presencial · ${V2_UNI[a.slot].sig}`; }
  else { const T = V3_TURNOS.find(x => x.id === a.id); ico = T.ico; t = T.t; s = `Turno · +${kzShort(a.pay)} no fim`; }
  const key = a.k + a.id + left;
  if (el.dataset.k === key) return; el.dataset.k = key;
  el.innerHTML = `<div class="v3a-ic">${ico}</div><div class="v3a-tx"><b>${t}</b><span>${s}${v3Buff() ? ' · 🍽 bem alimentado(a)' : ''}</span><div class="v2bar"><i style="width:${pc}%"></i></div></div><div class="v3a-t">${left}s</div><button class="v3a-x" onclick="v3Cancel()" aria-label="Cancelar">✕</button>`;
  el.classList.remove('hidden');
}
function v3Tick(dt) {
  if (!G || mode !== 'game') return;
  v3ApplyProv();
  const v = v3G(), a = v.act; if (!a) return;
  // personagem fica no sítio enquanto trabalha / estuda
  for (const k in keys) keys[k] = false; joy.active = false; joy.x = joy.y = 0; autoGo = null;
  if (typeof ivGo !== 'undefined') ivGo = null;
  V3.emoT -= dt; if (V3.emoT <= 0) { V3.emoT = 6; if (typeof playerEmote === 'function') playerEmote(a.k === 'curso' ? 'think' : 'train'); }
  if (Date.now() - a.t0 >= a.dur) {
    v.act = null;
    try { if (a.k === 'curso') v3CursoFim(a); else v3TurnoFim(a); } catch (e) { console.error('v3 fim', e); }
    save(); refresh(); if (typeof vrHud === 'function') vrHud(); v3ActUI();
    if (phoneApp === 'unis' || phoneApp === 'turnos') renderPhone(true);
    return;
  }
  V3.uiT -= dt; if (V3.uiT <= 0) { V3.uiT = .25; v3ActUI(); }
}

/* ---------------- qualificação, salário e promoções ---------------- */
(function () {
  const _q = v2Qual; v2Qual = function () {
    const r = _q.apply(this, arguments); if (!G) return r;
    const tot = v3Total(), dip = v3Diplomas();
    const add = (k, n) => { n = Math.round(n); if (n) { r.parts.push([k, n]); r.s = Math.max(0, Math.min(100, r.s + n)); } };
    add(`Cursos de formação (${tot} níveis)`, Math.min(14, tot * .45));
    add(`Diplomas de especialização (${dip})`, Math.min(8, dip * 2.5));
    return r;
  };
  const _k = v2SalK; v2SalK = function (e) {
    let k = _k.apply(this, arguments); if (!G) return k;
    const j = e ? job(e.id) : null; if (j && (j.informal || j.varFama || j.varSeg)) return k;
    let b = 0;
    V3_CURSOS.forEach(c => { const n = v3Lv(c.id); if (!n) return; const rel = j ? v3Rel(c, [j.id].concat(j.req && j.req.curso ? [].concat(j.req.curso) : [])) : false; b += n * (rel ? .02 : c.univ ? .005 : 0); });
    return k + Math.min(.3, b);
  };
  const _pb = v2PromoBonus; v2PromoBonus = function () { return Math.min(30, _pb.apply(this, arguments) + Math.min(8, v3Total() * .25)); };
})();

/* ---------------- desgaste em todas as ações ---------------- */
(function () {
  const _d = doAct; doAct = function (cost, fn, anim) {
    const a0 = G ? G.acoes : 0; const r = _d.apply(this, arguments);
    try { if (G && G.acoes < a0 && G.vr) { const vr = vrG(); vr.fome = Math.max(0, vr.fome - 1.5); /* a energia já sai pela ação (ano9.js) */ } } catch (e) { }
    return r;
  };
})();

/* ---------------- viajar gasta energia (transporte barato cansa mais) ---------------- */
const v3ColPreco = d => Math.round((150 + d * 2) * v3K() / 50) * 50;
const V3_RIDE_W = { col: 7, moto: 6, eco: 4.5, xl: 4, conf: 2.5 };
if (typeof P2_RIDE !== 'undefined' && !P2_RIDE.some(c => c.id === 'col')) P2_RIDE.push({ id: 'col', t: 'Candongueiro', ico: '🚐', m: .35, d: 'Azul e branco · o mais barato · cansa mais · só no Ponto', eta: 9 });
(function () {
  const _tm = v2TaxiModel; v2TaxiModel = function (c) { return _tm.call(this, c === 'col' ? 'xl' : c); };
  const _t = v2Taxi; v2Taxi = function (id, cls) {
    if (G && G.v3 && G.v3.act) return v3Ocupado();
    if (cls === 'col' && !vrNearLoc('candongueiros', 34)) return toast('🚐 Os candongueiros só se apanham no Ponto de Candongueiros (Viana). Escolhe outro tipo de táxi.');
    if (cls === 'col' && LOC_POS[id]) { const C = P2_RIDE.find(c => c.id === 'col'), L = LOC_POS[id], d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z), rc = rideCost(d) || 1; C.m = v3ColPreco(d) / rc; }
    const r = _t.apply(this, arguments);
    if (cls === 'col' && V2.ride) { V2.ride.car = 'Hiace azul e branca'; V2.ride.mot = 'Kota ' + V2.ride.mot.split(' ').pop(); v2RideUI(); }
    return r;
  };
  const _e = v2RideEnd; v2RideEnd = function (abort) {
    const R_ = V2.ride; const r = _e.apply(this, arguments);
    if (R_ && !abort && G && G.vr) {
      const f = Math.max(.6, Math.min(1.15, .6 + (R_.len || 100) / 300)), n = Math.round((V3_RIDE_W[R_.C.id] || 4) * f * 10) / 10;
      const vr = vrG(); vr.energia = Math.max(0, vr.energia - n); if (typeof vrHud === 'function') vrHud();
      setTimeout(() => toast(`${R_.C.ico} Viagem de ${R_.C.t}: energia −${n}${R_.C.id === 'col' ? ' (apertado e aos solavancos!)' : R_.C.id === 'conf' ? ' (viagem confortável)' : ''}`), 1600);
    }
    return r;
  };
  if (typeof trEnd === 'function') {
    const _te = trEnd; trEnd = function () {
      const T0 = typeof TR !== 'undefined' && TR ? { kind: TR.kind, cls: TR.cls, conf: TR.conf || 0, km: TR.D ? TR.D.km * (TR.D.ida ? 1 : 2) : 100 } : null;
      const r = _te.apply(this, arguments);
      if (T0 && G && G.vr) {
        let b = T0.kind === 'plane' ? ({ pri: 2, exe: 3 }[T0.cls] || 5) : T0.kind === 'train' ? 6 : T0.kind === 'bike' ? 10 : T0.kind === 'moto' ? 8 : Math.max(3, 7 - T0.conf * 1.5);
        const n = Math.round(b * Math.max(.6, Math.min(1.5, .6 + T0.km / 700)));
        const vr = vrG(); vr.energia = Math.max(0, vr.energia - n); vr.fome = Math.max(0, vr.fome - Math.round(n / 2));
        addLog(`🧳 A viagem cansou: energia −${n}, fome −${Math.round(n / 2)}. <i>Razão: transportes mais baratos cansam mais.</i>`);
        if (typeof vrHud === 'function') vrHud();
      }
      return r;
    };
  }
  const _mc = moveCity; moveCity = function () { const p0 = G && G.cidade.prov; const r = _mc.apply(this, arguments); if (G && G.cidade.prov !== p0 && G.vr) { vrG().energia = Math.max(0, vrG().energia - 12); v3ApplyProv(true); } return r; };
  const _te2 = tapEnter; tapEnter = function () { if (G && G.v3 && G.v3.act) return v3Ocupado(); return _te2.apply(this, arguments); };
})();

/* ---------------- comida: restaurante, cantina e zungueiras ---------------- */
// [id, ico, nome, descrição, preço, fome, energia, efeitos]
const V3_MENU = {
  candongueiros: { t: 'Zungueiras do Ponto', itens: [
    ['pao', '🍞', 'Pão com chouriço', 'Da roulote da Tia Fefa', 300, 16, 3, {}],
    ['bolinho', '🍞', 'Bolinhos de farinha (3)', 'Quentinhos, acabados de fritar', 200, 9, 6, {}],
    ['ginguba', '🍫', 'Ginguba torrada', 'Saquinho de amendoim', 150, 6, 7, {}],
    ['mandioca', '🥔', 'Mandioca assada com peixe seco', 'Na brasa da Mamã Joana', 500, 24, 4, {}],
    ['banana', '🥭', 'Banana-pão assada com ginguba', 'O lanche do candongueiro', 400, 18, 5, {}],
    ['quissangua', '🧃', 'Quissângua gelada', 'Bebida de milho fermentado', 250, 5, 11, {}],
    ['agua', '💧', 'Água fresca (0,5 L)', '"Água, água fresca!"', 100, 0, 5, { saude: 0 }],
    ['gasosa', '🥤', 'Kianda Cola', 'Gasosa nacional bem gelada', 300, 3, 9, { felicidade: 1 }],
    ['cafe', '☕', 'Café de termo', 'Forte, para aguentar o turno', 200, 0, 13, {}],
  ] },
  cantina: { t: 'Cantina Popular · Prato do dia', itens: [
    ['prato', '🍚', 'Arroz, feijão de óleo de palma e peixe frito', 'Prato do dia · o mais pedido', 1500, 45, 10, {}],
    ['funge', '🍲', 'Funge com carne seca', 'Com gimboa e molho', 1800, 50, 8, {}],
    ['massa', '🍗', 'Massa com frango guisado', 'Dose de estudante', 1600, 45, 9, {}],
    ['sopa', '🥗', 'Sopa de legumes e pão', 'Leve e saudável', 800, 25, 5, { saude: 1 }],
    ['sumo', '🧃', 'Sumo natural de múcua', 'Feito na hora', 500, 4, 9, { saude: 1 }],
    ['cafeb', '☕', 'Café com bolo de laranja', 'Para estudar mais', 600, 8, 15, {}],
  ] },
  restaurante: { t: 'Restaurante Sabor da Banda', itens: [
    ['muamba', '🍗', 'Muamba de galinha com funge', 'A rainha da cozinha angolana', 7500, 70, 15, { felicidade: 3, saude: 1 }],
    ['calulu', '🐟', 'Calulu de peixe', 'Com quiabo, feijão e banana', 8000, 65, 12, { saude: 2, felicidade: 2 }],
    ['mufete', '🐟', 'Mufete completo', 'Peixe grelhado, feijão, mandioca e banana', 9500, 75, 15, { felicidade: 4 }],
    ['cabidela', '🥘', 'Galinha de cabidela', 'Receita da avó', 7000, 65, 10, { felicidade: 2 }],
    ['grelhada', '🍖', 'Grelhada mista (para partilhar)', 'Carne, chouriço e mandioca frita', 18000, 80, 20, { felicidade: 7, fama: 1 }],
    ['cocada', '🍯', 'Cocada amarela', 'Sobremesa tradicional', 2500, 8, 6, { felicidade: 3 }],
    ['mucua', '🧃', 'Batido de múcua', 'Bem gelado', 1500, 5, 10, { saude: 1 }],
  ] },
};
const V3_ESP = [
  ['familia', '👨‍👩‍👧', 'Jantar de família', 'Levar a família a jantar fora', 25000, { felicidade: 7, karma: 1 }],
  ['amigos', '🍻', 'Celebrar com os amigos', 'Mesa grande, grelhada e música', 40000, { felicidade: 9, fama: 1 }],
  ['romantico', '🌹', 'Jantar romântico', 'Velas, kizomba ao vivo e sobremesa', 35000, { felicidade: 10, aparencia: 1 }],
];
function v3Desc(loc) { return loc === 'cantina' && G.estudo ? .7 : 1; }
function v3Comer(loc, id) {
  const M = V3_MENU[loc]; if (!M) return; const F = M.itens.find(x => x[0] === id), vr = vrG(); if (!F) return;
  if (!vrNearLoc(loc, 30)) return toast(`📍 Isto só se compra em: ${LOC_POS[loc].n}.`);
  if (vr.fome >= 99 && F[5] > 0) return toast('😮‍💨 Já estás cheio(a)! Não cabe mais nada.');
  const p = Math.round(F[4] * v3K() * v3Desc(loc) / 50) * 50; if (!pay(p)) return;
  vr.fome = Math.min(100, vr.fome + F[5]); vr.energia = Math.min(100, vr.energia + F[6]);
  let r = Object.keys(F[7]).length ? fx(F[7]) : '';
  if (F[5] >= 40) { v3G().buff = Date.now() + 10 * 60000; r += ' · 🍽 <b>Bem alimentado(a)</b> por 10 min (turnos +10%, menos desgaste)'; }
  toast(`${F[1]} ${F[2]}: fome ${Math.round(vr.fome)} · energia ${Math.round(vr.energia)}`);
  if (F[4] >= 7000) addLog(`${F[1]} Comeste ${F[2]} no ${LOC_POS[loc].n}. ${r}`);
  save(); refresh(); if (typeof vrHud === 'function') vrHud(); renderPanel(true);
}
function v3Esp(id) {
  const E = V3_ESP.find(x => x[0] === id), v = v3G(), vr = vrG(); if (!E) return;
  if (!vrNearLoc('restaurante', 30)) return toast('📍 Só no restaurante.');
  if (v.espAno[id] === G.ano) return toast('Já fizeste isso este ano. Volta para o ano!');
  if (G.idade < 16 && id === 'romantico') return toast('🧒 Ainda és muito novo(a) para isso.');
  const p = Math.round(E[4] * v3K() / 100) * 100; if (!pay(p)) return;
  v.espAno[id] = G.ano; vr.fome = Math.min(100, vr.fome + 70); vr.energia = Math.min(100, vr.energia + 15);
  addLog(`${E[1]} ${E[2]} no Sabor da Banda (${kzShort(p)}). ${fx(E[5])}`, 'good'); if (typeof playerEmote === 'function') playerEmote('love');
  save(); refresh(); renderPanel(true);
}
function v3NeedsCard() {
  const vr = vrG(), b = v3Buff(), bl = b ? Math.ceil((v3G().buff - Date.now()) / 60000) : 0;
  const bar = (t, n, c) => `<div class="v3nd"><span>${t}</span><div class="v2bar"><i style="width:${Math.round(n)}%;background:${c}"></i></div><b>${Math.round(n)}</b></div>`;
  return `<div class="v3card">${bar('🍽 Fome', vr.fome, '#ff9f43')}${bar('⚡ Energia', vr.energia, '#3fa9ff')}${b ? `<div class="v3buff">🍽 Bem alimentado(a) · mais ${bl} min · turnos +10% e menos desgaste</div>` : '<div class="v3muted">Uma refeição a sério (+40 fome) deixa-te "bem alimentado(a)" durante 10 minutos.</div>'}</div>`;
}
function v3MenuUI(loc) {
  const M = V3_MENU[loc], longe = !vrNearLoc(loc, 30);
  let h = v3NeedsCard();
  if (longe) h += noteBox(`📍 Estás longe. ${btnInline('Ir a pé', `v2Go('${loc}')`)}`);
  if (loc === 'cantina') h += noteBox(G.estudo ? '🎓 És estudante: <b>30% de desconto</b> em tudo!' : '🎓 Estudantes têm 30% de desconto. Aqui comes bem e barato.');
  if (loc === 'candongueiros') h += noteBox('🧺 As zungueiras vendem comida barata para quem vai e vem. Mata a fome e dá energia para o turno.');
  h += sec(M.t) + list(M.itens.map(F => {
    const p = Math.round(F[4] * v3K() * v3Desc(loc) / 50) * 50;
    const ef = [F[5] ? `+${F[5]} fome` : '', F[6] ? `+${F[6]} energia` : ''].concat(Object.entries(F[7]).filter(([, n]) => n).map(([k, n]) => `+${n} ${LABEL[k] || k}`)).filter(Boolean).join(' · ');
    return btnItem(F[1], F[2], `${F[3]} · ${ef}`, kzShort(p), `v3Comer('${loc}','${F[0]}')`, longe || G.dinheiro < p);
  }));
  return h;
}
const btnInline = (t, f) => `<button class="chip" style="margin-left:6px" onclick="${f}">${t}</button>`;
function v3EspUI() {
  const v = v3G(), longe = !vrNearLoc('restaurante', 30);
  let h = noteBox('🎉 Ocasiões especiais: uma vez por ano cada. Dão muita felicidade.');
  h += list(V3_ESP.map(E => { const p = Math.round(E[4] * v3K() / 100) * 100, feito = v.espAno[E[0]] === G.ano; return btnItem(E[1], E[2], feito ? 'Já fizeste este ano' : E[3] + ' · ' + Object.entries(E[5]).map(([k, n]) => `+${n} ${LABEL[k]}`).join(' · '), kzShort(p), `v3Esp('${E[0]}')`, longe || feito || G.dinheiro < p); }));
  return h;
}
function v3RotasUI() {
  const perto = vrNearLoc('candongueiros', 34);
  let h = noteBox('🚐 O candongueiro (azul e branco) é o transporte mais barato da cidade, mas vais apertado(a) e cansas mais.');
  h += `<div class="v3card"><b>Quanto cansa cada transporte</b>${[['🚐 Candongueiro', 7], ['🏍 Kupapata', 6], ['🚕 Económico', 4.5], ['🚐 Kandonga XL', 4], ['🚗 Conforto', 2.5]].map(([t, n]) => `<div class="v3nd"><span>${t}</span><div class="v2bar"><i style="width:${n * 12}%;background:#ff6b6b"></i></div><b>−${n}</b></div>`).join('')}<div class="v3muted">Energia gasta numa viagem média. Viagens longas cansam um pouco mais.</div></div>`;
  if (!perto) return h + noteBox(`📍 Tens de estar no Ponto de Candongueiros. ${btnInline('Ir a pé', "v2Go('candongueiros')")}`);
  const dests = Object.entries(LOC_POS).filter(([id, L]) => !['cela', 'cadeia', 'candongueiros'].includes(id) && !id.startsWith('tv_') && !L.tv);
  h += sec('Para onde vais?') + list(dests.map(([id, L]) => { const d = Math.hypot(L.x - playerPos.x, L.z - playerPos.z), p = v3ColPreco(d); return btnItem(L.ico, L.n, `${(d / 10).toFixed(1)} km · ${L.zona || ''}`, kzShort(p), `closePanel();v2Taxi('${id}','col')`, G.dinheiro < p); }));
  return h;
}
function v3TurnosAquiUI(loc) {
  const ts = V3_TURNOS.filter(t => t.onde === loc);
  return v3NeedsCard() + noteBox('⏱ Turnos de 1 minuto aqui mesmo. Também os encontras na app <b>Turno Já</b> do telemóvel.') + list(ts.map(v3TurnoItem));
}
function v3TurnoItem(T) {
  const miss = v3Req(T.r), p = v3TurnoPay(T), w = `⚡−${T.w.en} 🍽−${T.w.fo || 0}${T.w.sa ? ` ❤−${T.w.sa}` : ''}`;
  if (miss.length) return `<div class="item v3lock"><div class="ico">${T.ico}</div><div class="tx"><div class="t1">${T.t} <span class="v3pay">${kzShort(p)}</span></div><div class="t2">🔒 Falta: ${miss.join(' · ')}</div></div></div>`;
  return btnItem(T.ico, T.t, `${T.d} · ${w} · 1 min`, kzShort(p), `v3TurnoStart('${T.id}')`, !!v3G().act);
}

/* ---------------- painéis dos novos sítios ---------------- */
PANELS.restaurante = { ico: '🍽', t: 'Restaurante Sabor da Banda', sub: 'Comida angolana de verdade · Centro Habitacional', tabs: [['menu', '🍽 Menu', () => v3MenuUI('restaurante')], ['esp', '🎉 Ocasiões', v3EspUI], ['turnos', '⏱ Trabalhar aqui', () => v3TurnosAquiUI('restaurante')]] };
PANELS.cantina = { ico: '🍲', t: 'Cantina Popular', sub: 'Prato do dia barato · estudantes com desconto', tabs: [['menu', '🍲 Prato do dia', () => v3MenuUI('cantina')], ['turnos', '⏱ Trabalhar aqui', () => v3TurnosAquiUI('cantina')]] };
PANELS.candongueiros = { ico: '🚐', t: 'Ponto de Candongueiros', sub: 'Viana · táxis azul e branco e zungueiras', tabs: [['zunga', '🧺 Zungueiras', () => v3MenuUI('candongueiros')], ['rotas', '🚐 Apanhar candongueiro', v3RotasUI], ['turnos', '⏱ Trabalhar aqui', () => v3TurnosAquiUI('candongueiros')]] };
Object.assign(LOC_POS, {
  restaurante: { x: -150, z: 16.8, ico: '🍽', n: 'Restaurante Sabor da Banda', zona: 'Centro Habitacional' },
  cantina: { x: 0, z: 166.8, ico: '🍲', n: 'Cantina Popular', zona: 'Cidade Universitária' },
  candongueiros: { x: -150, z: 116.8, ico: '🚐', n: 'Ponto de Candongueiros', zona: 'Viana' },
});
Object.assign(HIT_BOXES, { restaurante: [-150, 22, 18, 9, 7], cantina: [0, 180, 22, 12, 6], candongueiros: [-150, 126, 34, 16, 4] });
VR_FOOD.push(
  ['zunga', '🧺', 'Zungueiras (mandioca, pão, bolinhos)', 'Ponto de Candongueiros · o mais barato da rua', 400, 20, 5, 'candongueiros'],
  ['cantina', '🍚', 'Prato do dia na Cantina Popular', 'Cidade Universitária · estudantes −30%', 1500, 45, 10, 'cantina'],
  ['rest', '🍗', 'Muamba no Sabor da Banda', 'Centro Habitacional · comida de festa', 7500, 70, 15, 'restaurante'],
);

/* ---------------- universidades: separador de cursos de formação ---------------- */
function v3CursosUniUI(slot) {
  const U = V2_UNI[slot], v = v3G(); v3DiaReset();
  const aqui = v3Presente(slot);
  let h = energyBar() + v3NeedsCard();
  h += `<div class="v3card"><b>📅 Hoje: ${v.nivHoje}/${V3_DIA_MAX} níveis</b><div class="v3muted">Cada nível dura 20 segundos. Cada curso tem 10 níveis: o 5 dá Certificado e o 10 dá Diploma. ${aqui ? '<b>Estás no campus: preço presencial.</b>' : 'Online custa +60%. Vem ao campus para pagares menos.'}</div></div>`;
  h += sec(`Cursos de formação · ${U.sig}`) + list(V3_OFERTA[slot].map(id => v3CursoItem(slot, id, !aqui)));
  return h;
}
function v3CursoItem(slot, id, online) {
  const c = v3Curso(id), n = v3Lv(id), v = v3G();
  const p = n >= 10 ? 0 : v3Preco(slot, id, online);
  const bar = `<span class="v3lv">${Array.from({ length: 10 }, (_, i) => `<i class="${i < n ? 'on' : ''}${i === 4 || i === 9 ? ' m' : ''}"></i>`).join('')}</span>`;
  const lock = c.edu && G.edu < c.edu ? ` · pede ${EDU[c.edu]}` : '';
  return btnItem(c.ico, `${c.t} · ${n}/10`, `${bar}${v3LvTxt(n)} · ${n >= 10 ? 'concluído' : online ? 'online (+60%)' : 'presencial'} · ${c.d}${lock}`, n >= 10 ? '✅' : kzShort(p), `v3CursoStart('${slot}','${id}',${online})`, n >= 10 || v.nivHoje >= V3_DIA_MAX || !!lock || !!v.act || G.dinheiro < p);
}
V2_UIDS.forEach(id => { const P = PANELS[id]; if (P && !P.tabs.some(t => t[0] === 'cur')) P.tabs.splice(1, 0, ['cur', '📜 Cursos (níveis)', () => v3CursosUniUI(id)]); });

/* ---------------- app "Uni Angola" ---------------- */
function v3SelP(n) { V3.selP = n; renderPhone(true); }
function v3UniTab(t) { V3.tab = t; renderPhone(true); }
PHONE_VIEWS.unis = () => {
  const lock = tooYoung(14, 'cursos de formação'); if (lock) return apHead('Uni Angola') + lock;
  const v = v3G(); v3DiaReset(); v3ApplyProv();
  const P = cid();
  let h = apHead('Uni Angola', 'Universidades das 21 províncias');
  h += `<div class="v3card"><b>📅 Hoje: ${v.nivHoje}/${V3_DIA_MAX} níveis</b><div class="v3muted">20 s por nível · 10 níveis por curso · presencial só na tua cidade (${P.n}) · online +60%</div></div>`;
  h += `<div class="btns" style="margin:6px 0">${[['cid', '📍 Na minha cidade'], ['meus', '📜 Os meus cursos'], ['prov', '🗺 Províncias']].map(([k, t]) => chip(t, `v3UniTab('${k}')`, false).replace('class="chip', `class="chip${V3.tab === k ? ' on' : ''}`)).join('')}</div>`;
  if (V3.tab === 'meus') {
    const q = v2Qual();
    h += v2QualCard(false);
    h += sec('O meu progresso') + list(V3_CURSOS.map(c => { const n = v3Lv(c.id); return `<div class="item"><div class="ico">${c.ico}</div><div class="tx"><div class="t1">${c.t} · ${n}/10</div><div class="t2"><span class="v3lv">${Array.from({ length: 10 }, (_, i) => `<i class="${i < n ? 'on' : ''}${i === 4 || i === 9 ? ' m' : ''}"></i>`).join('')}</span>${v3LvTxt(n)}</div></div></div>`; }));
    h += noteBox(`📈 ${v3Total()} níveis feitos · ${v3Diplomas()} diploma(s). Cada nível sobe a tua qualificação (agora ${q.s}), o salário nos empregos ligados ao curso e as hipóteses de promoção.`);
    return h;
  }
  if (V3.tab === 'prov') {
    const sel = PROVINCIAS.find(p => p.n === (V3.selP || P.n)) || P;
    h += `<div class="v3provs">${PROVINCIAS.map(p => `<button class="${p.n === sel.n ? 'on' : ''}${p.n === P.n ? ' me' : ''}" onclick="v3SelP('${p.n}')">${p.n}</button>`).join('')}</div>`;
    h += sec(`Universidades ${provDe(sel.n)}`);
    h += list(v3UnisDe(sel).map(u => `<div class="item"><div class="ico">🏛</div><div class="tx"><div class="t1">${u.n}</div><div class="t2">${u.lema} · prestígio ${u.prest}/10 · ${V3_OFERTA[u.slot].length} cursos de formação</div></div></div>`));
    if (sel.n !== P.n) h += noteBox(`🔒 Só podes estudar onde vives. Para estudares ${provDe(sel.n)}, muda-te para lá na app <b>Angola</b> ou no aeroporto (a partir dos 18).`);
    return h;
  }
  v3UnisDe(P).forEach(u => {
    const aqui = v3Presente(u.slot);
    h += `<div class="v2uc"><div class="v2uh" style="--uc:${V2_UNI[u.slot].cor}"><div class="v2uh-ic">🏛</div><div><b>${u.n}</b><span>${u.lema}</span><small>prestígio ${u.prest}/10</small></div></div>`;
    h += `<div class="btns" style="margin:4px 0 6px">${aqui ? '<span class="v3muted">📍 Estás aqui · preço presencial</span>' : chip('🚶 Ir lá (presencial, mais barato)', `closePhone();v2Go('${u.slot}')`, false) + chip('🚕 Táxi', `closePhone();v2Taxi('${u.slot}','eco')`, false)}</div>`;
    h += list(V3_OFERTA[u.slot].map(id => v3CursoItem(u.slot, id, !aqui))) + '</div>';
  });
  return h;
};

/* ---------------- app "Turno Já" ---------------- */
PHONE_VIEWS.turnos = () => {
  const lock = tooYoung(14, 'trabalhar por turnos'); if (lock) return apHead('Turno Já') + lock;
  const v = v3G(); v3DiaReset();
  let h = apHead('Turno Já', 'Turnos de 1 minuto · paga melhor quem é mais qualificado');
  h += v3NeedsCard();
  h += `<div class="v3card"><div class="v3stats"><div><small>Hoje</small><b>${kzShort(v.ganhosHoje)}</b></div><div><small>Turnos feitos</small><b>${v.turnos}</b></div><div><small>Total ganho</small><b>${kzShort(v.ganhos)}</b></div></div></div>`;
  const ok = V3_TURNOS.filter(t => !v3Req(t.r).length).sort((a, b) => v3TurnoPay(b) - v3TurnoPay(a));
  const no = V3_TURNOS.filter(t => v3Req(t.r).length).sort((a, b) => a.pay - b.pay);
  h += sec(`És elegível (${ok.length})`) + (ok.length ? list(ok.map(v3TurnoItem)) : noteBox('Ainda não és elegível para nenhum turno.'));
  if (no.length) {
    const nx = no[0]; h += noteBox(`🎯 Próximo objetivo: <b>${nx.t}</b> (${kzShort(v3TurnoPay(nx))} por turno). Falta: ${v3Req(nx.r).join(', ')}. Faz cursos na app <b>Uni Angola</b>.`);
    h += sec(`Turnos mais bem pagos (${no.length})`) + list(no.map(v3TurnoItem));
  }
  h += `<p class="apnote">Cada turno gasta energia e fome (e às vezes saúde). Come nas zungueiras, na cantina ou no restaurante para recuperares. Cursos ligados ao turno pagam até +20%.</p>`;
  return h;
};
(function () {
  const ia = APPS.findIndex(a => a.id === 'aulas');
  if (!APPS.some(a => a.id === 'unis')) APPS.splice(ia >= 0 ? ia + 1 : APPS.length, 0, { id: 'unis', ico: '🎓', t: 'Uni Angola', bg: 'linear-gradient(#2fd6a0,#0d7a5a)', tel: 2 });
  const ie = APPS.findIndex(a => a.id === 'emprego');
  if (!APPS.some(a => a.id === 'turnos')) APPS.splice(ie >= 0 ? ie + 1 : APPS.length, 0, { id: 'turnos', ico: '⏱', t: 'Turno Já', bg: 'linear-gradient(#ffd23f,#ff8a00)', tel: 2 });
})();

/* ---------------- edifícios 3D ---------------- */
function v3Build() {
  decor = new T.Group(); worldScene.add(decor);
  // Restaurante Sabor da Banda (praça do Centro Habitacional)
  bldg(-150, 22, 18, 9, 7, { face: '#f3dcb8', glass: '#5a3a1a', kind: 'res', noTop: true, noShops: true, base: '#8a4a2a' });
  mesh(bx(18.4, .7, .3), mat('#c8102e'), -150, 6.2, 17.25, decor, false);
  V3.signR = sign('SABOR DA BANDA', 11, '#7a1a1a', '#ffcb00', 'MUAMBA · CALULU · MUFETE · CABIDELA', -150, 5.1, 17.2, Math.PI);
  canopy(-150, 16.4, 8, 2.2, 3.1, '#c8102e', '#ffcb00', Math.PI);
  [[-163.5, 20], [-136.5, 20]].forEach(([x, z]) => { mesh(cyl(.06, .06, 2.4, 6), mat('#ddd'), x, 1.2, z, decor, false); mesh(new T.ConeGeometry(1.8, .7, 8), mat('#ffcb00'), x, 2.5, z, decor); mesh(cyl(.7, .7, .06, 12), mat('#f4f1ea'), x, .76, z, decor); mesh(cyl(.06, .06, .76, 6), mat('#555'), x, .38, z, decor, false); addCol(x, z, 1.4, 1.4); });
  // Cantina Popular (Avenida dos Transportes)
  bldg(0, 180, 22, 12, 6.5, { face: '#e9f2e4', glass: '#2e6b3a', kind: 'office', noTop: true, noShops: true, base: '#2e6b3a' });
  mesh(bx(22.4, .5, .3), mat('#2e8b57'), 0, 6.15, 173.8, decor, false);
  V3.signC = sign('CANTINA POPULAR', 12, '#1f5a34', '#ffffff', 'PRATO DO DIA · ESTUDANTES −30%', 0, 4.7, 173.75, Math.PI);
  canopy(0, 172.6, 9, 2.4, 3.1, '#2e8b57', '#ffffff', Math.PI);
  for (let i = 0; i < 3; i++) { const x = -8 + i * 8; if (Math.abs(x) < 3) continue; mesh(bx(2.6, .08, 1), mat('#8a5a3a'), x, .76, 171, decor); mesh(bx(2.6, .06, .35), mat('#8a5a3a'), x, .45, 170.3, decor, false); mesh(bx(2.6, .06, .35), mat('#8a5a3a'), x, .45, 171.7, decor, false); addCol(x, 171, 2.6, 1.4); }
  // Ponto de Candongueiros (Viana)
  groundPatch(-176, 112.5, -124, 137, '#5b5d61', .03);
  for (let i = 0; i < 4; i++) mesh(bx(.25, .03, 6), mat('#ffffff'), -164 + i * 9 - 4.5, .05, 131, decor, false);
  { // abrigo comprido
    const g = new T.Group(); g.position.set(-150, 0, 121.5); decor.add(g);
    mesh(bx(24, .3, 4.2), mat('#1f63c9'), 0, 3.3, 0, g); mesh(bx(24.2, .35, .15), mat('#ffffff'), 0, 3.3, -2.1, g);
    for (let i = -2; i <= 2; i++) { mesh(cyl(.12, .12, 3.3, 6), mat('#d9d9d9', { metalness: .6 }), i * 5.6, 1.65, 1.6, g); addCol(-150 + i * 5.6, 123.1, .4, .4); }
    for (let i = -1; i <= 1; i++) { mesh(bx(4, .1, .6), mat('#8a5a3a'), i * 7, .5, 1.2, g); }
  }
  V3.signK = sign('PONTO DE CANDONGUEIROS', 10, '#1f63c9', '#ffffff', 'VIANA · MUTAMBA · KILAMBA · CAZENGA', -150, 4.6, 119.35, Math.PI);
  [-1, 1].forEach(s => mesh(cyl(.1, .1, 4.2, 6), mat('#888'), -150 + s * 4.6, 2.1, 119.5, decor, false));
  // vans azul e branco estacionadas
  [-164, -155, -146, -137].forEach((x, i) => { const v = vanModel(); v.position.set(x, 0, 131); v.rotation.y = Math.PI / 2 + (i % 2 ? .06 : -.05); decor.add(v); addCol(x, 131, 2.2, 4.6); });
  // bancas das zungueiras (bacias coloridas e guarda-sol)
  [[-171, 119], [-167, 124.5], [-131, 119], [-128.5, 124.5]].forEach(([x, z], i) => {
    mesh(bx(2, .8, 1.1), mat('#8a6a48'), x, .4, z, decor); addCol(x, z, 2.2, 1.3);
    ['#ff7a1a', '#2e8b57', '#ffcb00'].forEach((c, k) => mesh(cyl(.32, .22, .22, 10), mat(c), x - .6 + k * .6, .92, z, decor));
    mesh(cyl(.05, .05, 2.4, 6), mat('#ddd'), x + .8, 1.2, z + .4, decor, false); mesh(new T.ConeGeometry(1.5, .6, 8), mat(['#c8102e', '#1f63c9', '#ffcb00', '#2e8b57'][i]), x + .8, 2.5, z + .4, decor);
  });
  worldScene.remove(decor); worldScene.add(mergeStatic(decor)); decor = null;
  // pessoas à espera do candongueiro e zungueiras
  V3.people = [];
  [[-160, 122.6, Math.PI], [-155, 122.4, Math.PI], [-147, 122.8, 0.4], [-142, 122.5, Math.PI], [-170.2, 120.4, Math.PI], [-130.2, 120.4, Math.PI], [-127.6, 125.8, Math.PI], [-168, 125.8, Math.PI]].forEach(([x, z, ry], i) => {
    try { const hm = makeHuman(randomNPCcfg()); hm.g.scale.multiplyScalar(BODY_S); hm.g.position.set(x, 0, z); hm.g.rotation.y = ry; worldScene.add(hm.g); V3.people.push(hm); } catch (e) { }
  });
}
(function () { const _b = buildWorld; buildWorld = function () { const r = _b.apply(this, arguments); try { v3Build(); } catch (e) { console.error('v3Build', e); } return r; }; })();

/* ---------------- interiores: restaurante e cantina ---------------- */
IV_ROOMS.restaurante = D => {
  ivRoom(D, { w: 16, d: 11, h: 4.6, ftex: ivFloorTex('tile', '#efe2c8', '#c9a46a'), frep: 3, fr: .5, wall: '#f6e7cc', wains: '#7a1a1a', trim: '#5a1010', bg: '#140d0a', door: '#5a3a1a' });
  IVP = D.back;
  ivSign('SABOR DA BANDA', 6.4, '#7a1a1a', '#ffcb00', 'COMIDA ANGOLANA DE VERDADE', -2.5, 3.7, -5.45);
  ivArt(4.6, 2.6, -5.47, 0, 2, 1.3, 'angola', '#3a2a1a'); ivClock(6.9, 3.6, -5.47, 0);
  ivPlane(2.4, 1.6, ivCanvas('v3menuBoard', 300, 200, (x, w, h) => { x.fillStyle = '#1b1b1b'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffcb00'; x.font = '900 24px system-ui'; x.fillText('MENU DO DIA', 20, 34); x.fillStyle = '#fff'; x.font = '600 17px system-ui'; ['Muamba de galinha', 'Calulu de peixe', 'Mufete completo', 'Cabidela', 'Cocada amarela'].forEach((t, i) => x.fillText('• ' + t, 22, 66 + i * 26)); }), -7, 2.5, -5.44);
  IVP = D.st;
  // cozinha aberta ao fundo
  ivCounter(-2.5, -4.4, 7, 1, 1.05, '#ffffff', '#7a1a1a'); ivCol(D, -2.5, -4.4, 7.2, 1.2);
  [[-5, '#c0c0c0'], [-3.6, '#9a9a9a'], [-1.2, '#c0c0c0']].forEach(([x, c]) => { ivC(.28, .28, .3, c, x, 1.2, -4.4, 12); });
  ivB(.8, .5, .5, '#f2d16b', .4, 1.07, -4.4); ivB(.6, .4, .4, '#d9822b', 1.3, 1.07, -4.4);
  ivNPC(D, -3, -5, 0, { mode: 'work', cfg: { shirt: '#ffffff', pants: '#222' } }); ivNPC(D, .2, -5, 0, { mode: 'work', fem: true, cfg: { shirt: '#ffffff', pants: '#222' } });
  // mesas com toalhas
  const toalhas = ['#c8102e', '#ffcb00', '#2e8b57', '#1f63c9'];
  [[-5.4, -1.3], [-1.6, -1.3], [2.2, -1.3], [5.8, -1.3], [-5.4, 2.2], [-1.6, 2.2], [2.2, 2.2], [5.8, 2.2]].forEach(([x, z], i) => {
    ivTable(x, z, 1.5, 1.1, .78, toalhas[i % 4], '#3a2a1a'); ivCol(D, x, z, 1.7, 1.3);
    ivChair(x - .95, z, Math.PI / 2, '#5a3a1a'); ivChair(x + .95, z, -Math.PI / 2, '#5a3a1a');
    ivC(.12, .12, .05, '#ffffff', x - .3, .81, z, 10); ivC(.12, .12, .05, '#ffffff', x + .3, .81, z, 10);
    if (i % 3 !== 2) ivNPC(D, x - .95, z, Math.PI / 2, { mode: 'sit' });
    if (i % 2 === 0) ivNPC(D, x + .95, z, -Math.PI / 2, { mode: 'sit', fem: true });
  });
  ivNPC(D, -6, .5, 0, { mode: 'walk', a: [-6.5, .5], b: [6.5, .5], cfg: { shirt: '#111', pants: '#111' } });
  ivPlant(-7.3, -4.6, 1.1); ivPlant(7.3, 4.6, 1); ivPlant(7.3, -4.6, 1.1);
  ivTV(7.9, 2.4, -1.5, -Math.PI / 2, 1.6);
  ivLights(D, { hi: .78, ki: .7, points: [[-2.5, 3.6, -3.5, '#ffe2a0', .6, 10], [2, 3.6, 1, '#ffd890', .5, 12]] });
  [-5.4, -1.6, 2.2, 5.8].forEach(x => { ivPendant(x, 4.6, -1.3); ivPendant(x, 4.6, 2.2); });
  ivStation(D, { x: -2.5, z: -3.3, ry: Math.PI, tab: 'menu', ico: '🍽', label: 'Balcão · Pedir comida', hit: [-2.5, -4.4, 7.2, 1.2, 1.6] });
  ivStation(D, { x: 4.6, z: -4.3, ry: Math.PI, tab: 'esp', ico: '🎉', label: 'Reservas · Ocasiões especiais', hit: [4.6, -5.3, 2.2, .4, 3.2] });
  ivStation(D, { x: 0, z: -2.9, ry: Math.PI, tab: 'turnos', ico: '⏱', label: 'Gerente · Trabalhar aqui', small: true, hit: [.2, -5, 1, 1, 2] });
};
IV_ROOMS.cantina = D => {
  ivRoom(D, { w: 18, d: 12, h: 4.4, ftex: ivFloorTex('cement', '#d9d6cc', '#bdb8aa'), frep: 3, fr: .7, wall: '#eef3ea', wains: '#2e8b57', trim: '#1f5a34', bg: '#0f1410', door: '#1f5a34' });
  IVP = D.back;
  ivSign('CANTINA POPULAR', 6.8, '#1f5a34', '#ffffff', 'PRATO DO DIA · 1.500 Kz', 0, 3.6, -5.95);
  ivPlane(2.6, 1.5, ivCanvas('v3cantinaBoard', 300, 180, (x, w, h) => { x.fillStyle = '#244a2f'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '900 22px system-ui'; x.fillText('HOJE:', 18, 34); x.font = '600 17px system-ui'; ['Arroz, feijão e peixe frito', 'Funge com carne seca', 'Massa com frango', 'Sopa de legumes'].forEach((t, i) => x.fillText('• ' + t, 18, 66 + i * 26)); }), 6.3, 2.6, -5.94);
  ivClock(-6.5, 3.5, -5.97, 0);
  IVP = D.st;
  // balcão self-service com tabuleiros
  ivCounter(0, -4.8, 10, 1.1, 1, '#c9ced1', '#8a9196'); ivCol(D, 0, -4.8, 10.2, 1.3);
  ['#f2d16b', '#7a3a1a', '#e8e2d4', '#2e8b57', '#d9822b', '#c8102e'].forEach((c, i) => ivB(1.2, .12, .7, c, -3.8 + i * 1.5, 1.04, -4.8));
  ivB(9.6, .05, .4, '#9ab3c9', 0, 1.5, -4.3, { metalness: .5, roughness: .2 });
  [-3, 0, 3].forEach((x, i) => ivNPC(D, x, -5.6, 0, { mode: 'work', fem: i !== 1, cfg: { shirt: '#ffffff', pants: '#2e8b57' } }));
  // mesas compridas com bancos
  [-1.4, 1.6, 4.4].forEach((z, r) => [-5, 0, 5].forEach((x, c) => {
    ivTable(x, z, 3.6, .9, .76, '#d8c9a8', '#555'); ivCol(D, x, z, 3.8, 1.1);
    ivB(3.6, .08, .35, '#8a6a48', x, .46, z - .75); ivB(3.6, .08, .35, '#8a6a48', x, .46, z + .75);
    ivB(.36, .05, .28, '#e9e2d0', x - 1, .79, z); ivB(.36, .05, .28, '#e9e2d0', x + 1, .79, z);
    if ((r + c) % 2 === 0) { ivNPC(D, x - 1, z - .75, 0, { mode: 'sit', seat: .5 }); ivNPC(D, x + 1, z + .75, Math.PI, { mode: 'sit', seat: .5, fem: true }); }
    else ivNPC(D, x + .6, z - .75, 0, { mode: 'sit', seat: .5 });
  }));
  ivNPC(D, -4, -3.2, Math.PI, {}); ivNPC(D, -3.2, -3.1, Math.PI, { fem: true }); ivNPC(D, -2.4, -3.2, Math.PI, { mode: 'think' });
  ivCooler(8.4, -5.3); ivCol(D, 8.4, -5.3, .6, .6); ivPlant(-8.4, -5.3, 1); ivPlant(-8.4, 5.4, .9);
  ivLights(D, { hi: .82, ki: .7, points: [[0, 3.8, -3, '#ffffff', .5, 12], [0, 3.8, 2.5, '#f4fff0', .45, 12]] });
  ivStation(D, { x: 0, z: -3.6, ry: Math.PI, tab: 'menu', ico: '🍲', label: 'Balcão · Prato do dia', hit: [0, -4.8, 10.2, 1.3, 1.6] });
  ivStation(D, { x: 7, z: -4, ry: Math.PI, tab: 'turnos', ico: '⏱', label: 'Cozinha · Trabalhar aqui', small: true, hit: [7, -4.8, 1.4, 1.2, 2] });
};
['restaurante', 'cantina'].forEach(id => { if (!IV_IDS.includes(id)) IV_IDS.push(id); });
if (typeof V2_STAFF !== 'undefined') Object.assign(V2_STAFF, { restaurante: 'Bem-vindo(a) ao Sabor da Banda! Hoje a muamba está divinal.', cantina: 'Prato do dia, mano? Tabuleiro ali, estudantes têm desconto.' });
if (typeof V2_CHAT !== 'undefined') Object.assign(V2_CHAT, { restaurante: ['Esta muamba lembra a da minha avó!', 'Já provaste o calulu? É top.'], cantina: ['Aqui comes bem por pouco dinheiro.', 'Depois da aula, cantina é sagrado.'] });

/* ---------------- ciclo do jogo ---------------- */
(function () { const _u = updateWorld; updateWorld = function (dt) { try { v3Tick(dt); } catch (e) { console.error('v3Tick', e); } return _u.apply(this, arguments); }; })();
