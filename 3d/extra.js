/* =========================================================
   MAIS VIDA — biscates no mapa (com marcadores 3D), missões
   diárias com sequência, eventos da cidade sincronizados para
   todos (sem servidor: calculados pela hora), Lotaria Kianda,
   raspadinhas, habilidades e +90 conquistas.
   Leve: 2 malhas 3D no máximo, o resto é HTML.
   ========================================================= */
const MX = { task: null, mk: null, t: 0, evKey: '', lp: null, pf: -1, hudK: '' };
const MX_BAIRROS = [
  ['Cazenga', 'Sambizanga', 'Rangel', 'Maianga', 'Ingombota'],
  ['Alvalade', 'Prenda', 'Kinaxixi', 'Mutamba', 'Maculusso'],
  ['Cacuaco', 'Bairro Operário', 'Vila Alice', 'Coqueiros', 'Miramar'],
  ['Viana', 'Zango', 'Kilamba', 'Talatona', 'Benfica'],
  ['Palanca', 'Golfe', 'Patriota', 'Morro Bento', 'Samba'],
];
/* [id, ícone, nome, descrição, paragens, base Kz, Kz por metro, idade mínima, habilidade, tipo de rota] */
const MX_GIGS = [
  { id: 'estafeta', ico: '📦', t: 'Estafeta Kianda Express', d: 'Levanta uma encomenda num sítio e entrega-a noutro antes do tempo acabar.', n: 2, base: 6000, pm: 70, min: 16, sk: 'Condução', rota: 'loc' },
  { id: 'kupapata', ico: '🛵', t: 'Kupapata (moto-táxi)', d: 'Apanha um passageiro numa esquina e leva-o ao destino. Paga bem, mas é preciso ter 18.', n: 2, base: 9000, pm: 80, min: 18, sk: 'Condução', rota: 'taxi' },
  { id: 'zunga', ico: '🧺', t: 'Zunga pelo bairro', d: 'Vende fruta e água fresca em 4 paragens. Cada paragem paga logo.', n: 4, base: 3500, pm: 30, min: 14, sk: 'Comércio', rota: 'esq' },
  { id: 'ardina', ico: '📰', t: 'Ardina do Jornal de Luanda', d: 'Distribui jornais em 5 pontos, a correr contra o relógio.', n: 5, base: 2500, pm: 25, min: 12, sk: 'Fitness', rota: 'esq' },
  { id: 'lavador', ico: '🧼', t: 'Lavador de carros', d: 'Lava carros em 3 parques diferentes. Trabalho honesto, sem patrão.', n: 3, base: 4500, pm: 25, min: 14, sk: 'Comércio', rota: 'esq' },
  { id: 'turismo', ico: '📷', t: 'Guia turístico', d: 'Mostra 4 sítios famosos da cidade a turistas. Pede 18 anos e inteligência 40+.', n: 4, base: 8000, pm: 45, min: 18, sk: 'Carisma', rota: 'loc', int: 40 },
  { id: 'cruz', ico: '🚑', t: 'Voluntário da Cruz Vermelha', d: 'Leva kits de saúde a 3 bairros. Não paga, mas dá karma e fama.', n: 3, base: 0, pm: 0, min: 14, sk: 'Carisma', rota: 'esq', karma: 3, fama: 1 },
];
/* eventos da cidade: mudam de 30 em 30 min e são iguais para todos os jogadores (calculados pela hora) */
const MX_EVS = [
  { id: 'normal', ico: '☀', t: 'Dia normal em Luanda', d: 'Sem eventos especiais. Boa altura para estudar e trabalhar.', w: 5 },
  { id: 'chuva', ico: '🌧', t: 'Chuvada em Luanda', d: 'As ruas alagam: todos os biscates pagam +30%.', w: 2, all: 1.3 },
  { id: 'carnaval', ico: '🎭', t: 'Carnaval na Marginal', d: 'Desfile dos grupos de carnaval: zunga e guias turísticos +80%, felicidade extra.', w: 1, g: { zunga: 1.8, turismo: 1.8 }, fel: 2 },
  { id: 'girabola', ico: '⚽', t: 'Girabola: Petro vs 1º de Agosto', d: 'Estádio cheio: kupapatas e zungueiras ganham +60%.', w: 2, g: { kupapata: 1.6, zunga: 1.6 } },
  { id: 'promo', ico: '🛍', t: 'Semana de Descontos no Kianda Mall', d: 'Muitas compras online: estafetas +70%.', w: 2, g: { estafeta: 1.7 } },
  { id: 'kizomba', ico: '💃', t: 'Festival de Kizomba na Ilha', d: 'Muita gente a sair à noite: kupapatas e guias +50%.', w: 1, g: { kupapata: 1.5, turismo: 1.5 }, fel: 1 },
  { id: 'feira', ico: '🌾', t: 'Feira do Kilamba', d: 'Produtores de todas as províncias: zunga e lavadores a dobrar.', w: 1, g: { zunga: 2, lavador: 2 } },
  { id: 'maratona', ico: '🏃', t: 'Maratona de Luanda', d: 'Ardinas +100% e cada biscate dá +1 de saúde.', w: 1, g: { ardina: 2 }, sau: 1 },
  { id: 'cruzv', ico: '🚑', t: 'Campanha da Cruz Vermelha', d: 'Voluntariado dá o dobro de karma e 15 mil Kz de ajuda de custo.', w: 1, cruz: 1 },
  { id: 'cruzeiro', ico: '🚢', t: 'Cruzeiro no Porto de Luanda', d: 'Chegaram centenas de turistas: guias turísticos +100%.', w: 1, g: { turismo: 2 } },
  { id: 'jackpot', ico: '🎟', t: 'Super Jackpot da Lotaria Kianda', d: 'O prémio máximo da lotaria desta hora vale o dobro.', w: 1, jack: 2 },
  { id: 'missoes', ico: '🎯', t: 'Hora das Missões', d: 'Missões diárias completadas agora pagam +50%.', w: 1, miss: 1.5 },
];
/* datas especiais de Angola: substituem o evento do dia inteiro */
const MX_DATAS = {
  '01-01': { id: 'anonovo', ico: '🎊', t: 'Ano Novo', d: 'Feliz Ano Novo! Todos os biscates +50% e felicidade extra.', all: 1.5, fel: 2 },
  '02-04': { id: '4fev', ico: '🇦🇴', t: '4 de Fevereiro — Início da Luta Armada', d: 'Feriado nacional: biscates +40%.', all: 1.4 },
  '04-04': { id: 'paz', ico: '🙏', t: 'Dia da Paz e Reconciliação', d: 'Feriado nacional: voluntariado a dobrar e biscates +30%.', all: 1.3, cruz: 1 },
  '09-17': { id: 'heroi', ico: '🎖', t: 'Dia do Herói Nacional', d: 'Feriado: biscates +40% e missões +50%.', all: 1.4, miss: 1.5 },
  '11-11': { id: 'indep', ico: '🇦🇴', t: 'Dia da Independência', d: 'Festa em todo o país! Todos os biscates +60%.', all: 1.6, fel: 2 },
  '12-25': { id: 'natal', ico: '🎄', t: 'Natal', d: 'Boas festas! Estafetas a dobrar e felicidade extra.', g: { estafeta: 2 }, fel: 2 },
};
/* missões diárias: [chave contada, ícone, texto, alvos possíveis, prémio base Kz] */
const MX_MISS = [
  ['gig', '🛵', n => `Faz ${n} biscates`, [2, 3, 4], 9000],
  ['gig_estafeta', '📦', n => `Faz ${n} entrega(s) como estafeta`, [1, 2], 8000],
  ['gig_zunga', '🧺', n => `Faz ${n} volta(s) de zunga`, [1, 2], 7000],
  ['gig_ardina', '📰', n => `Distribui jornais ${n} vez(es)`, [1, 2], 7000],
  ['gig_lavador', '🧼', n => `Lava carros ${n} vez(es)`, [1, 2], 7000],
  ['gig_cruz', '🚑', n => `Faz ${n} ronda(s) de voluntariado`, [1], 10000],
  ['m', '👟', n => `Anda ${n} metros a pé pela cidade`, [400, 800, 1500], 6000],
  ['comer', '🍲', n => `Come ${n} refeições`, [2, 3], 5000],
  ['chat', '💬', n => `Manda ${n} mensagens no chat`, [2, 4], 5000],
  ['visit', '📍', n => `Visita ${n} sítios diferentes da cidade`, [3, 5], 8000],
  ['ganhos', '💵', n => `Ganha ${kzShort(n)} em biscates`, [30000, 60000, 120000], 12000],
  ['dormir', '😴', n => `Descansa ${n} vez(es)`, [1], 4000],
  ['raspa', '🎟', n => `Compra ${n} raspadinha(s)`, [1, 2], 3000, 18],
  ['ano', '🎂', n => `Vive ${n} ano(s) (enche a barra do ano)`, [1, 2], 8000],
];
const MX_ROM = ['I', 'II', 'III', 'IV', 'V'];
/* conquistas por níveis: [contador, ícone, título, níveis, descrição] */
const MX_TIERS = [
  ['gig', '🛵', 'Biscateiro(a)', [1, 10, 50, 200, 1000], n => `${n} biscates feitos`],
  ['km', '👟', 'Andarilho(a)', [1, 10, 50, 200, 1000], n => `${n} km a pé`],
  ['ganhos', '💵', 'Suor Honesto', [1e5, 1e6, 1e7, 1e8, 1e9], n => `${kzShort(n)} ganhos em biscates`],
  ['miss', '🎯', 'Cumpridor(a)', [1, 10, 50, 200, 1000], n => `${n} missões diárias`],
  ['streakMax', '🔥', 'Sequência', [3, 7, 30, 100, 365], n => `${n} dias seguidos com as 3 missões`],
  ['comer', '🍲', 'Bom Garfo', [10, 100, 500, 2000], n => `${n} refeições`],
  ['chat', '💬', 'Conversador(a)', [10, 100, 1000, 10000], n => `${n} mensagens no chat`],
  ['visit', '📍', 'Explorador(a)', [10, 100, 500, 2000], n => `${n} visitas a sítios da cidade`],
  ['raspa', '🎟', 'Apostador(a)', [1, 10, 100, 1000], n => `${n} raspadinhas/bilhetes`],
  ['sorte', '🍀', 'Sortudo(a)', [1, 5, 25, 100], n => `${n} prémios na lotaria`],
  ['amigo', '🤝', 'Social', [1, 5, 20, 50], n => `${n} pedidos de amizade`],
  ['prender', '🚔', 'Xerife', [1, 10, 50, 200], n => `${n} detenções como agente`],
  ['evento', '🎪', 'Festeiro(a)', [1, 10, 50, 200], n => `${n} biscates durante eventos especiais`],
  ['dormir', '😴', 'Dorminhoco(a)', [5, 50, 200], n => `${n} descansos`],
  ['ano', '🎂', 'Vida Longa', [5, 20, 50, 80], n => `${n} anos vividos neste jogo`],
];
MX_GIGS.forEach(g => MX_TIERS.push(['gig_' + g.id, g.ico, g.t.split(' ')[0].replace('Voluntário', 'Voluntário(a)'), [5, 50, 250, 1000], n => `${n} × ${g.t}`]));

/* ---------------- estado ---------------- */
function mxDayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function mxG() {
  if (!G) return { cnt: {}, dcnt: {}, xp: {}, miss: [], lot: [] };
  if (!G.mx) G.mx = {};
  const d = { cnt: {}, dcnt: {}, dvis: [], day: '', miss: [], claimed: [], bau: false, streak: 0, lastFull: '', xp: {}, lot: [], lotHist: [] };
  for (const k in d) if (G.mx[k] === undefined) G.mx[k] = d[k];
  if (G.mx.day !== mxDayKey()) mxNewDay(G.mx);
  return G.mx;
}
function mxSeed(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
function mxNewDay(m) {
  const k = mxDayKey(), r = mxSeed(k + ':' + (G.nome || '') + ':' + (G.ano || 0));
  m.day = k; m.dcnt = {}; m.dvis = []; m.claimed = []; m.bau = false; m.miss = [];
  const pool = MX_MISS.filter(x => !x[5] || G.idade >= x[5]);
  const used = new Set();
  while (m.miss.length < 3 && used.size < pool.length) {
    const i = Math.floor(r() * pool.length); if (used.has(i)) continue; used.add(i);
    const x = pool[i]; m.miss.push({ k: x[0], n: x[3][Math.floor(r() * x[3].length)], p: x[4] });
  }
}
function mxAdd(k, n = 1) {
  if (!G) return;
  const m = mxG(); m.cnt[k] = (m.cnt[k] || 0) + n; m.dcnt[k] = (m.dcnt[k] || 0) + n;
  if (k === 'm') { m.cnt.km = Math.floor((m.cnt.m || 0) / 1000); return; }
  mxBadge(); try { checkConq(); } catch (e) { }
}
const mxLvl = id => { const xp = (mxG().xp || {})[id] || 0; return Math.min(10, Math.floor(Math.sqrt(xp / 2))); };

/* ---------------- eventos sincronizados ---------------- */
function mxEvento(at) {
  const t = at || Date.now(), d = new Date(t);
  const esp = MX_DATAS[`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`];
  const slot = Math.floor(t / 1800000);
  if (esp) return Object.assign({ slot, fim: (slot + 1) * 1800000, dia: true }, esp);
  const r = mxSeed('ev' + slot), tot = MX_EVS.reduce((s, e) => s + e.w, 0);
  let x = r() * tot, e = MX_EVS[0];
  for (const it of MX_EVS) { x -= it.w; if (x <= 0) { e = it; break; } }
  return Object.assign({ slot, fim: (slot + 1) * 1800000 }, e);
}
function mxMult(gid) { const e = mxEvento(); return (e.all || 1) * ((e.g && e.g[gid]) || 1); }

/* ---------------- biscates: rotas e marcadores ---------------- */
function mxPontos() {
  const out = [];
  CITY_ZS.forEach((z, j) => CITY_XS.forEach((x, i) => out.push({ x: x + 6.5, z: z + 6.5, n: 'Esquina do ' + MX_BAIRROS[j][i] })));
  return out;
}
function mxLocs() { return Object.entries(LOC_POS).filter(([id]) => !['cela', 'cadeia'].includes(id)).map(([id, L]) => ({ x: L.x, z: L.z + (L.z > -100 ? 7 : 0), n: L.n })); }
const mxD = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
function mxRota(g) {
  const me = { x: playerPos.x, z: playerPos.z }, P = g.rota === 'loc' ? mxLocs() : mxPontos(), out = [];
  let cur = me;
  for (let k = 0; k < g.n; k++) {
    let pool = (g.rota === 'taxi' && k === 1) ? mxLocs() : P;
    pool = pool.filter(p => !out.includes(p) && mxD(p, cur) > (k === 0 && g.rota !== 'loc' ? 20 : 45) && mxD(p, cur) < (k === 0 ? 110 : 170));
    if (!pool.length) pool = P.filter(p => !out.includes(p) && mxD(p, cur) > 15);
    const p = pick(pool); out.push(p); cur = p;
  }
  return out;
}
function mxMarker(p) {
  if (!MX.mk) {
    const g = new T.Group();
    const beam = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 26, 10, 1, true), new T.MeshBasicMaterial({ color: '#2bff88', transparent: true, opacity: .28, depthWrite: false, side: T.DoubleSide }));
    beam.position.y = 13; g.add(beam);
    const ring = new T.Mesh(new T.TorusGeometry(2.2, .22, 6, 24), new T.MeshBasicMaterial({ color: '#ffcb00' }));
    ring.rotation.x = Math.PI / 2; ring.position.y = .35; g.add(ring); g.userData.ring = ring;
    MX.mk = g;
  }
  MX.mk.position.set(p.x, 0, p.z);
  if (typeof worldScene !== 'undefined' && worldScene && MX.mk.parent !== worldScene) worldScene.add(MX.mk);
}
function mxMarkerOff() { if (MX.mk && MX.mk.parent) MX.mk.parent.remove(MX.mk); }
function mxGigOk(g) {
  if (!G) return 'Sem jogo.';
  if (G.idade < g.min) return `Precisas de ter ${g.min} anos.`;
  if (g.int && G.stats.inteligencia < g.int) return `Precisas de inteligência ${g.int}+.`;
  if (typeof vrPreso === 'function' && vrPreso()) return 'Estás na cadeia.';
  if (G.preso > 0) return 'Estás preso(a).';
  if (G.vr && G.vr.energia < 8) return 'Estás exausto(a): come ou dorme primeiro.';
  return '';
}
function mxGigStart(id) {
  const g = MX_GIGS.find(x => x.id === id); if (!g) return;
  const why = mxGigOk(g); if (why) return toast('⚠ ' + why);
  if (MX.task) return toast('⚠ Já estás num biscate. Acaba ou cancela primeiro.');
  if (typeof inInt !== 'undefined' && inInt) return toast('🚪 Sai do edifício primeiro: os biscates são na rua.');
  if (typeof TR !== 'undefined' && TR) return toast('⚠ Acaba a viagem primeiro.');
  const pts = mxRota(g); let dist = 0, c = { x: playerPos.x, z: playerPos.z };
  pts.forEach(p => { dist += mxD(c, p); c = p; });
  const lv = mxLvl(id), mult = mxMult(id) * (1 + lv * .05);
  const total = Math.round((g.base + g.pm * dist) * mult / 100) * 100;
  MX.task = { id, pts, i: 0, t0: Date.now(), lim: Math.round(30 + dist / 3.3), total, paid: 0, dist: Math.round(dist), ev: mxEvento().id !== 'normal' };
  mxMarker(pts[0]); closePanel();
  if (typeof SND !== 'undefined') SND.play('pickup');
  toast(`${g.ico} ${g.t}: vai até <b>${esc(pts[0].n)}</b> (marcador verde no mapa). ${g.base ? 'Pagamento: ' + kzShort(total) : 'Voluntário'}`);
  mxHud(true);
}
function mxGigCancel() { if (!MX.task) return; MX.task = null; mxMarkerOff(); mxHud(true); toast('Biscate cancelado.'); }
function mxGigStep() {
  const T0 = MX.task, g = MX_GIGS.find(x => x.id === T0.id), p = T0.pts[T0.i];
  T0.i++;
  const partial = ['zunga', 'ardina', 'lavador'].includes(g.id);
  if (partial && g.base) { const v = Math.round(T0.total / g.n); T0.paid += v; G.dinheiro += v; if (typeof SND !== 'undefined') SND.play('coin'); }
  if (T0.i < T0.pts.length) {
    mxMarker(T0.pts[T0.i]);
    const msg = g.id === 'estafeta' ? `📦 Encomenda levantada! Entrega em <b>${esc(T0.pts[T0.i].n)}</b>` : g.id === 'kupapata' ? `🛵 Passageiro a bordo! Leva-o a <b>${esc(T0.pts[T0.i].n)}</b>` : `${g.ico} Feito em ${esc(p.n)}${partial && g.base ? ' (+' + kzShort(Math.round(T0.total / g.n)) + ')' : ''}. Próximo: <b>${esc(T0.pts[T0.i].n)}</b>`;
    toast(msg); return;
  }
  // fim
  const e = mxEvento(), m = mxG();
  const resto = Math.max(0, T0.total - T0.paid); G.dinheiro += resto; T0.paid += resto;
  const st = {}; if (g.karma) st.karma = g.karma * (e.cruz ? 2 : 1); if (g.fama) st.fama = g.fama; if (e.fel) st.felicidade = e.fel; if (e.sau) st.saude = e.sau;
  if (g.id === 'cruz' && e.cruz) { G.dinheiro += 15000; T0.paid += 15000; }
  const fxs = fx(st);
  if (G.vr) { G.vr.energia = Math.max(0, G.vr.energia - 5); G.vr.fome = Math.max(0, G.vr.fome - 3); }
  m.xp[g.id] = (m.xp[g.id] || 0) + 1;
  const lv0 = mxLvl(g.id);
  mxAdd('gig'); mxAdd('gig_' + g.id); if (T0.paid) mxAdd('ganhos', T0.paid); if (T0.ev) mxAdd('evento');
  const sec = Math.round((Date.now() - T0.t0) / 1000);
  addLog(`${g.ico} Biscate: <b>${g.t}</b> em ${sec} s · ${T0.paid ? '+' + kzShort(T0.paid) : 'voluntário'} ${fxs}`, 'good');
  if (typeof SND !== 'undefined') SND.play('cash');
  flash(`${g.ico} ${T0.paid ? '+' + kzShort(T0.paid) : 'Obrigado!'}`);
  toast(`✅ ${g.t} concluído! ${T0.paid ? '+' + kzShort(T0.paid) : ''} ${fxs}${mxLvl(g.id) > lv0 ? ` · Subiste para nível ${mxLvl(g.id)} (${g.sk})!` : ''}`);
  MX.task = null; mxMarkerOff(); mxHud(true); save(); refresh();
}
function mxTick(dt) {
  if (!G || !G.vivo || mode !== 'game') return;
  const ins = typeof inInt !== 'undefined' && inInt, trip = typeof TR !== 'undefined' && TR;
  // distância a pé
  if (!ins && !trip) {
    if (MX.lp) { const d = Math.hypot(playerPos.x - MX.lp.x, playerPos.z - MX.lp.z); if (d > .05 && d < 3) { MX.acc = (MX.acc || 0) + d; if (MX.acc > 10) { mxAdd('m', Math.round(MX.acc)); MX.acc = 0; } } }
    MX.lp = { x: playerPos.x, z: playerPos.z };
  } else MX.lp = null;
  if (MX.task) {
    const T0 = MX.task, p = T0.pts[T0.i];
    if (MX.mk) { MX.mk.userData.ring.rotation.z += dt * 2; MX.mk.userData.ring.position.y = .35 + Math.sin(performance.now() / 300) * .15; }
    if (!ins && !trip && p && Math.hypot(playerPos.x - p.x, playerPos.z - p.z) < 4.2) mxGigStep();
    else if (Date.now() - T0.t0 > T0.lim * 1000) {
      const g = MX_GIGS.find(x => x.id === T0.id);
      toast(`⏳ O tempo acabou: ${g.t} falhado. ${T0.paid ? 'Ficas com ' + kzShort(T0.paid) + '.' : ''} ${fx({ felicidade: -2 })}`);
      addLog(`⏳ Falhaste um biscate (${g.t}).`, 'bad'); MX.task = null; mxMarkerOff(); refresh();
    }
  }
  MX.t += dt;
  if (MX.t > .5) {
    MX.t = 0; mxHud();
    // eventos: aviso quando muda
    const e = mxEvento(), k = e.id + e.slot;
    if (k !== MX.evKey) { if (MX.evKey && e.id !== 'normal') { toast(`${e.ico} Evento na cidade: <b>${e.t}</b> — ${e.d}`); if (typeof SND !== 'undefined') SND.play('notif'); } MX.evKey = k; }
    // detenções feitas (vida.js)
    if (G.vr) { const pf = G.vr.presosFeitos || 0; if (MX.pf >= 0 && pf > MX.pf) mxAdd('prender', pf - MX.pf); MX.pf = pf; }
    mxLotCheck(true);
  }
}
function mxHud(force) {
  const hud = document.getElementById('hud'); if (!hud) return;
  let el = document.getElementById('mxTask');
  if (!el) { el = document.createElement('div'); el.id = 'mxTask'; hud.appendChild(el); }
  let ev = document.getElementById('mxEv');
  if (!ev) { ev = document.createElement('button'); ev.id = 'mxEv'; ev.onclick = () => openPanel('extra', 'ev'); hud.appendChild(ev); }
  const e = mxEvento(), ek = e.id + e.slot;
  if (ev.dataset.k !== ek) { ev.dataset.k = ek; ev.innerHTML = `${e.ico} <span>${esc(e.t)}</span>`; ev.classList.toggle('hidden', e.id === 'normal'); }
  const T0 = MX.task;
  if (!T0) { if (el.dataset.k !== '') { el.dataset.k = ''; el.className = 'hidden'; el.innerHTML = ''; } return; }
  const g = MX_GIGS.find(x => x.id === T0.id), p = T0.pts[T0.i];
  const left = Math.max(0, Math.ceil(T0.lim - (Date.now() - T0.t0) / 1000)), d = Math.round(Math.hypot(playerPos.x - p.x, playerPos.z - p.z));
  const k = `${T0.i}|${left}|${d}`; if (!force && el.dataset.k === k) return; el.dataset.k = k;
  el.className = left < 15 ? 'urg' : '';
  el.innerHTML = `<b>${g.ico}</b><div><small>${esc(g.t)} · ${T0.i + 1}/${T0.pts.length}</small><span>${esc(p.n)} · <b>${d} m</b></span></div><em>${left}s</em><button onclick="mxGigCancel()" title="Cancelar">✕</button>`;
}
function mxBadge() {
  const b = document.getElementById('mxBadge'); if (!b || !G) return;
  const m = mxG(); const pronto = m.miss.some((x, i) => !m.claimed.includes(i) && (m.dcnt[x.k] || 0) >= x.n) || (!m.bau && m.claimed.length === 3);
  b.classList.toggle('hidden', !pronto);
}

/* ---------------- missões diárias ---------------- */
function mxMissDef(k) { return MX_MISS.find(x => x[0] === k); }
function mxClaim(i) {
  const m = mxG(), x = m.miss[i]; if (!x || m.claimed.includes(i)) return;
  const prog = x.k === 'visit' ? m.dvis.length : (m.dcnt[x.k] || 0);
  if (prog < x.n) return toast('Ainda não completaste esta missão.');
  const e = mxEvento(), v = Math.round(x.p * (e.miss || 1) * (1 + Math.min(m.streak, 10) * .05) / 100) * 100;
  m.claimed.push(i); G.dinheiro += v; mxAdd('miss');
  if (typeof SND !== 'undefined') SND.play('gold');
  toast(`🎯 Missão cumprida! +${kzShort(v)}`); addLog(`🎯 Missão diária: ${mxMissDef(x.k)[2](x.n)} · +${kzShort(v)}`, 'good');
  save(); mxBadge(); renderPanel(true);
}
function mxBau() {
  const m = mxG(); if (m.bau || m.claimed.length < 3) return;
  const ontem = new Date(Date.now() - 864e5), ok = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`;
  m.streak = m.lastFull === ok ? m.streak + 1 : 1; m.lastFull = m.day; m.bau = true;
  m.cnt.streakMax = Math.max(m.cnt.streakMax || 0, m.streak);
  const v = 25000 + Math.min(m.streak, 30) * 5000;
  G.dinheiro += v; const f = fx({ felicidade: 4, fama: m.streak >= 7 ? 1 : 0 });
  if (typeof SND !== 'undefined') SND.play('win');
  flash(`🎁 Baú diário: +${kzShort(v)}`); addLog(`🎁 Baú diário (sequência de ${m.streak} dia(s)): +${kzShort(v)} ${f}`, 'gold');
  try { checkConq(); } catch (e) { }
  save(); mxBadge(); renderPanel(true);
}

/* ---------------- lotaria e raspadinhas (18+) ---------------- */
function mxSorteio(h) { const r = mxSeed('lot' + h), s = new Set(); while (s.size < 5) s.add(1 + Math.floor(r() * 30)); return [...s].sort((a, b) => a - b); }
const mxHora = () => Math.floor(Date.now() / 3600000);
const MX_LP = [0, 0, 0, 8000, 150000, 15000000];
function mxLotBuy(rand) {
  if (G.idade < 18) return toast('🔞 A lotaria é só para maiores de 18.');
  const m = mxG(), h = mxHora();
  if (m.lot.filter(t => t.h === h).length >= 10) return toast('Máximo 10 bilhetes por sorteio.');
  let ns = [];
  if (rand) { const s = new Set(); while (s.size < 5) s.add(1 + Math.floor(Math.random() * 30)); ns = [...s]; }
  else { ns = [...document.querySelectorAll('.mxnum.on')].map(b => +b.dataset.n); if (ns.length !== 5) return toast('Escolhe exatamente 5 números (1–30).'); }
  if (!pay(500)) return;
  m.lot.push({ h, n: ns.sort((a, b) => a - b), jack: mxEvento().jack || 1 }); mxAdd('raspa');
  if (typeof SND !== 'undefined') SND.play('tap');
  toast(`🎟 Bilhete registado: ${ns.join(' · ')}. Sorteio às ${new Date((h + 1) * 3600000).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}.`);
  save(); renderPanel(true);
}
function mxNumTog(b) { const on = document.querySelectorAll('.mxnum.on').length; if (!b.classList.contains('on') && on >= 5) return; b.classList.toggle('on'); }
function mxLotCheck(quiet) {
  if (!G || !G.mx || !G.mx.lot.length) return;
  const m = G.mx, h = mxHora(); let ganho = 0, n = 0, msgs = [];
  m.lot = m.lot.filter(t => {
    if (t.h >= h) return true;
    const s = mxSorteio(t.h), hits = t.n.filter(x => s.includes(x)).length, v = MX_LP[hits] * (hits === 5 ? (t.jack || 1) : 1);
    m.lotHist.unshift({ h: t.h, n: t.n, s, hits, v }); if (m.lotHist.length > 20) m.lotHist.pop();
    if (v) { ganho += v; n++; msgs.push(`${hits} certos`); }
    return false;
  });
  if (ganho) {
    G.dinheiro += ganho; mxAdd('sorte', n);
    if (typeof SND !== 'undefined') SND.play('win');
    flash(`🍀 Lotaria: +${kzShort(ganho)}`); addLog(`🍀 Ganhaste na Lotaria Kianda (${msgs.join(', ')}): +${kzShort(ganho)}`, 'gold'); save(); refresh();
  } else if (!quiet && m.lotHist.length) { }
}
function mxRaspa() {
  if (G.idade < 18) return toast('🔞 As raspadinhas são só para maiores de 18.');
  if (!pay(200)) return;
  mxAdd('raspa');
  const r = Math.random(); let v = 0;
  if (r < 1 / 3000) v = 150000; else if (r < 1 / 3000 + 1 / 60) v = 3000; else if (r < 1 / 3000 + 1 / 60 + 1 / 6) v = 400;
  if (v) { G.dinheiro += v; mxAdd('sorte'); }
  if (typeof SND !== 'undefined') SND.play(v ? 'coin' : 'flip');
  toast(v ? `🎟 Raspadinha premiada: +${kzShort(v)}!` : '🎟 Não foi desta… Joga com responsabilidade.');
  save(); renderPanel(true);
}

/* ---------------- interface ---------------- */
function mxBiscUI() {
  const m = mxG(), e = mxEvento();
  let h = noteBox(`Os biscates são na <b>rua</b>: aparece um <b style="color:#2bff88">marcador verde</b> no mapa e no radar. Chega lá antes do tempo acabar. Cada biscate cansa um pouco (energia e fome). Quanto mais fazes, mais sobes de nível (+5% por nível).${e.id !== 'normal' ? `<br>${e.ico} <b>Agora:</b> ${esc(e.t)} — ${esc(e.d)}` : ''}`);
  if (MX.task) { const g = MX_GIGS.find(x => x.id === MX.task.id); h += noteBox(`${g.ico} Em curso: <b>${g.t}</b> — próximo ponto: ${esc(MX.task.pts[MX.task.i].n)}`) + list([btnItem('✕', 'Cancelar biscate', 'Perdes o que falta receber', '', 'mxGigCancel();renderPanel(true)')]); }
  h += sec('Biscates disponíveis') + list(MX_GIGS.map(g => {
    const why = mxGigOk(g), lv = mxLvl(g.id), mu = mxMult(g.id);
    const pr = g.base ? `${kzShort(g.base * mu * (1 + lv * .05))}+${mu > 1 ? ` <b style="color:#2bff88">×${mu.toFixed(1)}</b>` : ''}` : 'karma';
    return btnItem(g.ico, `${g.t} <small style="opacity:.7">· ${g.sk} nv ${lv}</small>`, why ? `<span style="color:#ff8080">${why}</span>` : g.d, pr, `mxGigStart('${g.id}')`, !!why || !!MX.task);
  }));
  const tot = m.cnt.gig || 0;
  h += sec('As tuas habilidades') + `<div class="mxsk">${['Condução', 'Comércio', 'Fitness', 'Carisma'].map(s => { const ids = MX_GIGS.filter(g => g.sk === s).map(g => g.id); const lv = Math.max(...ids.map(mxLvl)); return `<div><span>${s}</span><i><b style="width:${lv * 10}%"></b></i><em>nv ${lv}</em></div>`; }).join('')}</div>`;
  h += noteBox(`📊 Biscates feitos: <b>${tot}</b> · Ganhos: <b>${kzShort(m.cnt.ganhos || 0)}</b> · Andaste <b>${((m.cnt.m || 0) / 1000).toFixed(1)} km</b>`);
  return h;
}
function mxMissUI() {
  const m = mxG(), e = mxEvento();
  let h = noteBox(`🎯 Três missões novas todos os dias (à meia-noite). Completa as 3 e abre o <b>Baú diário</b>: a sequência de dias seguidos aumenta o prémio (até +50% nas missões).<br>🔥 Sequência atual: <b>${m.streak} dia(s)</b>${e.miss ? `<br>${e.ico} <b>${esc(e.t)}</b>: missões +50% agora!` : ''}`);
  h += sec('Missões de hoje') + `<div class="list">${mxMissItems(m)}</div>`;
  const bauOk = m.claimed.length === 3 && !m.bau;
  h += list([btnItem('🎁', m.bau ? 'Baú diário aberto' : 'Baú diário', m.bau ? 'Volta amanhã para continuar a sequência!' : `Completa as 3 missões · prémio ${kzShort(25000 + Math.min(m.streak + 1, 30) * 5000)}`, '', 'mxBau()', !bauOk)]);
  return h;
}
function mxMissItems(m) {
  return m.miss.map((x, i) => {
    const D = mxMissDef(x.k); if (!D) return '';
    const prog = Math.min(x.n, x.k === 'visit' ? m.dvis.length : (m.dcnt[x.k] || 0)), done = prog >= x.n, cl = m.claimed.includes(i);
    return `<div class="item col"><div class="row"><div class="ico">${D[1]}</div><div class="tx"><div class="t1">${D[2](x.n)}</div><div class="t2">${x.k === 'ganhos' ? kzShort(prog) + ' / ' + kzShort(x.n) : prog + ' / ' + x.n}</div><div class="bar rel"><i style="width:${Math.round(prog / x.n * 100)}%"></i></div></div><div class="pr">${kzShort(x.p)}</div></div><div class="btns">${cl ? '<span style="color:#2bff88;font-weight:800">✔ Recebido</span>' : `<button class="chip" onclick="mxClaim(${i})" ${done ? '' : 'disabled style="opacity:.4"'}>Receber prémio</button>`}</div></div>`;
  }).join('');
}
function mxEvUI() {
  const e = mxEvento(), now = Date.now();
  const mins = Math.max(1, Math.round((e.fim - now) / 60000));
  let h = `<div class="mxevnow"><div class="mxevi">${e.ico}</div><div><small>AGORA EM LUANDA${e.dia ? ' · FERIADO' : ''}</small><b>${esc(e.t)}</b><span>${esc(e.d)}</span><em>${e.dia ? 'Durante todo o dia' : `Mais ${mins} min`}</em></div></div>`;
  h += noteBox('Os eventos são iguais para <b>todos os jogadores</b> ao mesmo tempo e mudam a cada 30 minutos. Aproveita os bónus nos biscates!');
  h += sec('Próximos eventos') + list(Array.from({ length: 8 }, (_, i) => {
    const t = (e.slot + 1 + i) * 1800000, x = mxEvento(t + 1000);
    return infoItem(x.ico, esc(x.t), esc(x.d), new Date(t).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
  }));
  h += sec('Feriados de Angola no jogo') + list(Object.entries(MX_DATAS).map(([d, x]) => infoItem(x.ico, esc(x.t), esc(x.d), d.split('-').reverse().join('/'))));
  return h;
}
function mxLotUI() {
  if (G.idade < 18) return noteBox('🔞 A Lotaria Kianda e as raspadinhas são só para maiores de 18 anos.');
  const m = mxG(), h0 = mxHora(), e = mxEvento();
  const meus = m.lot.filter(t => t.h === h0), prox = new Date((h0 + 1) * 3600000).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const ult = mxSorteio(h0 - 1);
  let h = noteBox(`🎟 <b>Lotaria Kianda</b> · sorteio de hora a hora, com os mesmos números para todos. Escolhe 5 números de 1 a 30 (500 Kz).<br>Prémios: 3 certos ${kzShort(MX_LP[3])} · 4 certos ${kzShort(MX_LP[4])} · 5 certos <b>${kzShort(MX_LP[5] * (e.jack || 1))}</b>${e.jack ? ' (Super Jackpot!)' : ''}<br><small>Joga com responsabilidade: a casa ganha sempre a longo prazo.</small>`);
  h += `<div class="mxlast">Último sorteio: ${ult.map(n => `<i>${n}</i>`).join('')}</div>`;
  h += sec(`Próximo sorteio às ${prox} · tens ${meus.length} bilhete(s)`);
  h += `<div class="mxnums">${Array.from({ length: 30 }, (_, i) => `<button class="mxnum" data-n="${i + 1}" onclick="mxNumTog(this)">${i + 1}</button>`).join('')}</div>`;
  h += `<div class="vhbtns"><button class="buy" onclick="mxLotBuy(false)">Comprar bilhete · 500 Kz</button><button onclick="mxLotBuy(true)">Números ao calhas · 500 Kz</button></div>`;
  if (meus.length) h += list(meus.map(t => infoItem('🎟', t.n.join(' · '), `Sorteio às ${prox}`, '')));
  h += sec('Raspadinha instantânea') + list([btnItem('🎟', 'Raspadinha Kianda', 'Até 150 mil Kz na hora · 200 Kz', '200 Kz', 'mxRaspa()')]);
  if (m.lotHist.length) h += sec('Os teus resultados') + list(m.lotHist.slice(0, 8).map(r => infoItem(r.v ? '🍀' : '🎟', `${r.n.join(' · ')} → ${r.hits} certo(s)`, `Saiu: ${r.s.join(' · ')}`, r.v ? '+' + kzShort(r.v) : '—')));
  return h;
}
function mxConqUI() {
  const m = mxG();
  const mine = CONQ.filter(c => G.conq.includes(c.id)).length;
  let h = noteBox(`🏆 Tens <b>${mine}</b> de <b>${CONQ.length}</b> conquistas.`);
  h += sec('Progresso') + `<div class="mxconq">${MX_TIERS.map(([k, ico, t, lv, dsc]) => {
    const v = k === 'km' ? Math.floor((m.cnt.m || 0) / 1000) : (m.cnt[k] || 0);
    const n = lv.filter(x => v >= x).length, nx = lv[n];
    return `<div class="${n ? 'on' : ''}"><b>${ico}</b><span>${esc(t)} ${n ? MX_ROM[n - 1] : ''}</span><small>${nx != null ? dsc(nx) : 'Completo!'}</small><i><em style="width:${nx != null ? Math.min(100, Math.round(v / nx * 100)) : 100}%"></em></i></div>`;
  }).join('')}</div>`;
  h += sec('Conquistas da vida') + `<div class="mxconq">${CONQ.filter(c => !String(c.id).startsWith('mx_')).map(c => `<div class="${G.conq.includes(c.id) ? 'on' : ''}"><b>${c.ico}</b><span>${esc(c.t)}</span></div>`).join('')}</div>`;
  return h;
}
PANELS.extra = {
  ico: '🎯', t: 'Biscates & Missões', sub: () => { const e = mxEvento(); return `${e.ico} ${esc(e.t)} · 🔥 ${mxG().streak} dia(s)`; },
  tabs: [['bisc', '🛵 Biscates', mxBiscUI], ['miss', '🎯 Missões', mxMissUI], ['ev', '🎪 Eventos', mxEvUI], ['lot', '🎟 Lotaria', mxLotUI], ['conq', '🏆 Conquistas', mxConqUI]],
};
/* conquistas por níveis entram na lista geral */
MX_TIERS.forEach(([k, ico, t, lv, dsc]) => lv.forEach((x, i) => CONQ.push({ id: `mx_${k}_${i}`, ico, t: `${t} ${MX_ROM[i]} — ${dsc(x)}`, f: () => G && G.mx && (k === 'km' ? Math.floor((G.mx.cnt.m || 0) / 1000) : (G.mx.cnt[k] || 0)) >= x })));

/* ---------------- ligações aos sistemas existentes ---------------- */
(function () {
  const _uw = updateWorld;
  updateWorld = function (dt) { const r = _uw.apply(this, arguments); try { mxTick(dt); } catch (e) { console.error(e); } return r; };
  const _op = openPanel;
  openPanel = function (id) {
    try { if (G && LOC_POS[id] && id !== 'cela') { const m = mxG(); if (!m.dvis.includes(id)) m.dvis.push(id); mxAdd('visit'); } } catch (e) { }
    return _op.apply(this, arguments);
  };
  if (typeof vrComer === 'function') { const _c = vrComer; vrComer = function () { const f0 = G && G.vr ? G.vr.fome : 0, d0 = G ? G.dinheiro : 0; const r = _c.apply(this, arguments); try { if (G && G.vr && (G.vr.fome > f0 || G.dinheiro < d0)) mxAdd('comer'); } catch (e) { } return r; }; }
  if (typeof vrDormir === 'function') { const _d = vrDormir; vrDormir = function () { const e0 = G && G.vr ? G.vr.energia : 0; const r = _d.apply(this, arguments); try { if (G && G.vr && G.vr.energia > e0) mxAdd('dormir'); } catch (e) { } return r; }; }
  if (typeof vrAmigo === 'function') { const _a = vrAmigo; vrAmigo = function (op) { if (op === 'add') try { mxAdd('amigo'); } catch (e) { } return _a.apply(this, arguments); }; }
  const _ms = mpSend;
  mpSend = function (txt) { try { if (String(txt || '').trim()) mxAdd('chat'); } catch (e) { } return _ms.apply(this, arguments); };
  const _au = ageUpLogic;
  ageUpLogic = function () { const r = _au.apply(this, arguments); try { if (r !== 'dead' && G && G.vivo) mxAdd('ano'); } catch (e) { } return r; };
  // radar: marcador do biscate
  const _dm = drawMinimap;
  drawMinimap = function () {
    _dm.apply(this, arguments);
    try {
      if (!MX.task || (typeof inInt !== 'undefined' && inInt)) return;
      const c = minimapCtx, p = MX.task.pts[MX.task.i]; if (!c || !p) return;
      const W = c.canvas.width, H = c.canvas.height, S = 1.05;
      let X = W / 2 + (p.x - playerPos.x) * S, Z = H / 2 + (p.z - playerPos.z) * S; const out = X < 7 || X > W - 7 || Z < 7 || Z > H - 7;
      X = Math.max(7, Math.min(W - 7, X)); Z = Math.max(7, Math.min(H - 7, Z));
      c.fillStyle = '#2bff88'; c.strokeStyle = '#063'; c.lineWidth = 2; c.beginPath(); c.arc(X, Z, out ? 5 : 6 + Math.sin(performance.now() / 200) * 1.5, 0, 7); c.fill(); c.stroke();
    } catch (e) { }
  };
  // botão na barra de baixo
  const addBtn = () => {
    const hb = document.querySelector('.hbtns'); if (!hb || document.getElementById('hbExtra')) return;
    const b = document.createElement('button'); b.className = 'hb'; b.id = 'hbExtra'; b.title = 'Biscates & Missões'; b.onclick = () => openPanel('extra');
    b.innerHTML = '🎯<span class="bd hidden" id="mxBadge">!</span><small>Missões</small>'; hb.appendChild(b); mxBadge();
  };
  const _uw2 = updateWorld;
  updateWorld = function (dt) { const r = _uw2.apply(this, arguments); if (!document.getElementById('hbExtra')) try { addBtn(); } catch (e) { } return r; };
})();
