/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Mundo: Avenida dos Transportes,
   telões de TV, placas publicitárias, paragens com posters,
   Agência Kianda Publicidade, comboios e aviões a circular.
   Carregado depois de live.js e antes de veiculos.js.
   ========================================================= */
const MU = { boards: [], screens: [], adsSrv: [], adsV: 0, adsLocal: [], rot: 0, rotT: 0, ledT: 0, scrT: 0, scrI: 0, train: null, planes: [], form: null, tvRaf: 0, tvInfoT: 0, tvRew: 0 };
try { MU.adsLocal = JSON.parse(localStorage.getItem('pe3d_ads') || '[]').filter(a => a.exp > Date.now() / 1000); } catch (e) { MU.adsLocal = []; }

/* ---------------- novos locais ---------------- */
const MU_TVS = [
  { id: 'tv_marginal', n: 'Telão da Marginal', ch: 'tj', x: 40, z: -95.5, sx: 40, sz: -101.8, ry: 0, w: 8, h: 4.5, y: 3.4, zona: 'Marginal' },
  { id: 'tv_estadio', n: 'Fan Zone do Estádio', ch: 'desp', x: 106, z: 17.4, sx: 106, sz: 22.2, ry: Math.PI, w: 8, h: 4.5, y: 3.4, zona: 'Talatona' },
  { id: 'tv_ilha', n: 'Telão da Ilha', ch: 'mus', x: -70, z: -124.4, sx: -70, sz: -128.9, ry: 0, w: 6, h: 3.4, y: 2.8, zona: 'Ilha' },
  { id: 'tv_mercado', n: 'Barraca do Kota', ch: 'nov', x: -52, z: 17.4, sx: -52, sz: 21.4, ry: Math.PI, w: 1.9, h: 1.08, y: 1.45, kiosk: true, zona: 'Rangel' },
  { id: 'casa', n: 'A TV da tua casa', ch: null },
];
MU_TVS.forEach(t => { if (t.id === 'casa') return; LOC_POS[t.id] = { x: t.x, z: t.z, ico: '📺', n: t.n, zona: t.zona, tv: t.ch }; HIT_BOXES[t.id] = [t.sx, t.sz, t.w + .4, 1, t.y + t.h + .4]; });
Object.assign(LOC_POS, {
  agencia: { x: -150, z: -46.8, ico: '📢', n: 'Kianda Publicidade', zona: 'Baixa' },
  bikes: { x: -150, z: 166.8, ico: '🚲', n: 'Pedala Angola', zona: 'Avenida dos Transportes' },
  estacao: { x: -90, z: 166.8, ico: '🚆', n: 'Estação Ferroviária', zona: 'Avenida dos Transportes' },
  stand: { x: -30, z: 166.8, ico: '🚗', n: 'Stand Auto Kianda', zona: 'Avenida dos Transportes' },
  motos: { x: 30, z: 166.8, ico: '🏍️', n: 'Moto Bwé', zona: 'Avenida dos Transportes' },
  aeroporto: { x: 120, z: 166.8, ico: '✈️', n: 'Aeroporto de Luanda', zona: 'Avenida dos Transportes' },
});
Object.assign(HIT_BOXES, {
  agencia: [-152, -62, 22, 16, 15], bikes: [-150, 178, 22, 12, 7], estacao: [-90, 182, 34, 16, 12],
  stand: [-30, 181, 34, 16, 9], motos: [30, 180, 26, 14, 8], aeroporto: [120, 190, 64, 22, 15],
});
WALK[0].z1 = 226;
const MU_AV = 160; // z da Avenida dos Transportes

/* =========================================================
   ANÚNCIOS — modelos, marcas e desenho
   ========================================================= */
const AD_BASE = [
  { marca: 'Kitanda Super', t: 'Tudo mais barato!', s: 'Arroz, óleo e fuba com 20% de desconto', cta: 'Todos os dias', cor: '#e63946', ico: 'shopping-cart', tpl: 'promo' },
  { marca: 'Mbote Telecom', t: 'Ilimitado 5G', s: 'Fala e navega sem parar por 9.900 Kz', cta: 'Marca *123#', cor: '#ff7a1a', ico: 'signal', tpl: 'classico' },
  { marca: 'Banco Palanca', t: 'O teu futuro começa aqui', s: 'Abre conta grátis na app Palanca Pay', cta: 'Palanca Pay', cor: '#0d2a4a', ico: 'landmark', tpl: 'minimal' },
  { marca: 'Txova', t: 'A fome não espera', s: 'Comida quente à tua porta em 30 minutos', cta: 'Pede já', cor: '#2a9d8f', ico: 'utensils', tpl: 'classico' },
  { marca: 'Kandonga', t: 'Chega lá mais rápido', s: 'Viagens seguras pela cidade inteira', cta: 'Abre a app', cor: '#ffcb00', ico: 'car-taxi-front', tpl: 'promo' },
  { marca: 'Kianda Mall', t: 'Black Friday Mwangolé', s: 'Até 70% em moda, tecnologia e casa', cta: 'Talatona', cor: '#ff2fa0', ico: 'shopping-bag', tpl: 'neon' },
  { marca: 'Céu Net', t: 'Internet até na lavra', s: 'Satélite rápido em todo o país', cta: 'Céu Net', cor: '#1d3557', ico: 'satellite-dish', tpl: 'classico' },
  { marca: 'Mulemba Petróleos', t: 'Energia que move Angola', s: 'Combustível de qualidade em todas as bombas', cta: 'Mulemba', cor: '#111111', ico: 'fuel', tpl: 'minimal' },
  { marca: 'Casa Já', t: 'A casa dos teus sonhos', s: 'Do Zango ao Miramar, encontra a tua', cta: 'Imobiliária', cor: '#c8102e', ico: 'house', tpl: 'classico' },
  { marca: 'Palanca Airlines', t: 'Voa por Angola', s: 'Luanda–Lubango desde 45.000 Kz', cta: 'Aeroporto de Luanda', cor: '#b5179e', ico: 'plane', tpl: 'viagem' },
  { marca: 'Ferrovia Kianda', t: 'Comboio Luanda–Malanje', s: 'Vê Angola pela janela, com conforto', cta: 'Estação Ferroviária', cor: '#2b9348', ico: 'train-front', tpl: 'viagem' },
  { marca: 'Stand Auto Kianda', t: 'Sai hoje de carro novo', s: 'Volta EV, SUV Kalahari e Pick-up Bwé', cta: 'Test-drive grátis', cor: '#0077b6', ico: 'car', tpl: 'promo' },
  { marca: 'Moto Bwé', t: 'Kupapata com estilo', s: 'Motorizadas desde 450.000 Kz', cta: 'Avenida dos Transportes', cor: '#f77f00', ico: 'bike', tpl: 'neon' },
  { marca: 'Pedala Angola', t: 'Pedala e poupa', s: 'Bicicletas, BTT e aluguer na cidade', cta: 'Aluga por 1.500 Kz', cor: '#52b788', ico: 'bike', tpl: 'minimal' },
  { marca: 'Kalemba Novelas', t: 'Amor na Banda', s: 'Novo episódio a cada 10 minutos', cta: 'Kalemba TV', cor: '#ad1457', ico: 'tv', tpl: 'neon' },
  { marca: 'Kizomba FM 99.9', t: 'Dedica uma música', s: 'Ouve o teu nome no ar, ao vivo', cta: '99.9 FM', cor: '#ff5c8a', ico: 'radio', tpl: 'classico' },
  { marca: 'Kianda Publicidade', t: 'Anuncia aqui!', s: 'Este espaço pode ser teu: placas, LED e rádio', cta: 'Agência na Baixa', cor: '#7209b7', ico: 'megaphone', tpl: 'neon' },
  { marca: 'Campanha Nacional', t: 'Mosquiteiro salva vidas', s: 'Dorme protegido contra a malária', cta: 'Centros de saúde', cor: '#0096c7', ico: 'shield', tpl: 'minimal' },
  { marca: 'Cerveja Palmeira', t: 'Fresquinha como a Ilha', s: 'Para os kambas, depois do trabalho. Bebe com moderação', cta: '18+', cor: '#d4a017', ico: 'beer', tpl: 'classico' },
  { marca: 'Águas do Kwanza', t: 'Água pura de Angola', s: 'Da nascente para a tua mesa', cta: 'Hidrata-te', cor: '#00b4d8', ico: 'droplet', tpl: 'minimal' },
  { marca: 'Discoteca Kizomba', t: 'Sexta é dia de farra', s: 'Kuduro, semba e afro house até de manhã', cta: 'Ilha de Luanda', cor: '#8338ec', ico: 'party-popper', tpl: 'festa' },
  { marca: 'Universidade Pública', t: 'Inscrições abertas', s: 'Engenharia, Medicina, Direito e mais', cta: 'Cidade Universitária', cor: '#7a1a1a', ico: 'graduation-cap', tpl: 'minimal' },
  { live: 'jogo' }, { live: 'radio' },
];
const AD_TPL = [['classico', 'Clássico'], ['promo', 'Promoção'], ['neon', 'Neon'], ['minimal', 'Minimal'], ['festa', 'Festa'], ['viagem', 'Viagem'], ['emprego', 'Precisa-se']];
const AD_COR = ['#c8102e', '#ff7a1a', '#ffcb00', '#2e8b57', '#0077b6', '#7209b7', '#ff2fa0', '#111111', '#00b4d8', '#6d4c41'];
const AD_ICO = ['megaphone', 'store', 'shopping-bag', 'utensils', 'car', 'house', 'briefcase', 'party-popper', 'music', 'heart', 'scissors', 'dumbbell', 'graduation-cap', 'phone', 'gift', 'star', 'wrench', 'shirt', 'pizza', 'plane'];
const AD_FMT = [
  { id: 'poster', t: 'Poster de paragem', d: 'Nas paragens de candongueiro', dur: 1800, p: 30000, ico: '🖼️', alc: 'mupi' },
  { id: 'placa', t: 'Placa grande', d: 'Nas placas da cidade', dur: 7200, p: 150000, ico: '🪧', alc: 'placa' },
  { id: 'led', t: 'Ecrã LED', d: 'Ecrãs LED animados + placas', dur: 21600, p: 450000, ico: '📺', alc: 'led' },
  { id: 'radio', t: 'Spot de rádio', d: 'Nos intervalos das 5 rádios ao vivo', dur: 3600, p: 80000, ico: '📻', alc: 'radio' },
  { id: 'mega', t: 'Mega campanha', d: 'Placas, LED, posters, rádio e rodapé da TV', dur: 86400, p: 1500000, ico: '🚀', alc: 'all' },
];
const AD_CAT = [['pessoal', '🙋 Pessoal'], ['negocio', '🏪 O meu negócio'], ['emprego', '💼 Emprego'], ['venda', '🏷️ Vendo / compro'], ['festa', '🎉 Festa / evento'], ['campanha', '🤝 Campanha social']];
const muNowS = () => (typeof LIVE !== 'undefined' ? LIVE.now() : Date.now() / 1000);
function muAdsAll() { const n = muNowS(); return MU.adsSrv.concat(MU.adsLocal).filter(a => a.exp > n); }
function muAdFits(a, alc) { const f = a.fmt; if (f === 'mega') return true; if (alc === 'radio') return f === 'radio'; if (alc === 'mupi') return f === 'poster' || f === 'placa' || f === 'led'; if (alc === 'placa') return f === 'placa' || f === 'led'; if (alc === 'led') return f === 'led' || f === 'placa'; return false; }
function muPool(alc) {
  const mine = muAdsAll().filter(a => muAdFits(a, alc));
  const base = AD_BASE.filter(a => !a.live || alc !== 'mupi');
  const out = []; mine.forEach(a => out.push(a, a, a)); return out.concat(base);
}
function muWrap(x, txt, maxW) { const w = String(txt).split(' '); const L = []; let l = ''; for (const p of w) { const t = l ? l + ' ' + p : p; if (x.measureText(t).width > maxW && l) { L.push(l); l = p; } else l = t; } if (l) L.push(l); return L; }
function muFit(x, txt, maxW, size, weight = 900, fam = 'system-ui,Segoe UI,sans-serif') { let fs = size; x.font = `${weight} ${fs}px ${fam}`; while (fs > 10 && x.measureText(txt).width > maxW) { fs -= 2; x.font = `${weight} ${fs}px ${fam}`; } return fs; }
function muRR(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
function muAdDraw(x, W, H, ad, t = 0) {
  x.save(); x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.shadowBlur = 0;
  if (ad.live === 'jogo' && typeof lvMatchNow === 'function') {
    const m = lvMatchNow(), A = m.M.A, B = m.M.B;
    x.fillStyle = '#145a1e'; x.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#1b6b27' : '#17621f'; x.fillRect(i * W / 8, 0, W / 8, H); }
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 3; x.beginPath(); x.arc(W / 2, H / 2, H * .3, 0, 7); x.stroke(); x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke();
    x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, W, H * .22); x.fillStyle = '#ffcb00'; muFit(x, m.live ? 'AO VIVO NA KALEMBA DESPORTO' : 'LIGA MWANGOLÉ · RESULTADO FINAL', W * .9, H * .1); x.textAlign = 'center'; x.fillText(m.live ? 'AO VIVO NA KALEMBA DESPORTO' : 'LIGA MWANGOLÉ · RESULTADO FINAL', W / 2, H * .15);
    [[A, W * .25], [B, W * .75]].forEach(([tm, cx]) => { x.fillStyle = tm[2]; x.beginPath(); x.arc(cx, H * .5, H * .15, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = tm[3]; x.stroke(); x.fillStyle = '#fff'; muFit(x, tm[0], W * .4, H * .085, 800); x.fillText(tm[0], cx, H * .82); x.fillStyle = tm[3]; muFit(x, tm[1], H * .2, H * .09); x.fillText(tm[1], cx, H * .53); });
    x.fillStyle = '#fff'; x.font = `900 ${H * .2}px system-ui`; x.fillText(`${m.s[0]} - ${m.s[1]}`, W / 2, H * .58); x.font = `800 ${H * .07}px system-ui`; x.fillStyle = '#ffcb00'; x.fillText(m.live ? m.min + "'" : 'FIM', W / 2, H * .7);
    x.restore(); return;
  }
  if (ad.live === 'radio' && typeof LV_ST !== 'undefined') {
    const st = LV_ST[Math.floor(t / 20 + MU.rot) % LV_ST.length], N = lvNowTxt(st);
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, st.c1); g.addColorStop(1, st.c2); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 26; i++) { const hh = (Math.sin(i * 1.7 + t * 4) * .5 + .6) * H * .3; x.fillRect(W * .58 + i * W * .015, H * .55 - hh / 2, W * .008, hh); }
    x.fillStyle = '#fff'; muFit(x, st.n, W * .52, H * .17); x.fillText(st.n, W * .05, H * .32); x.font = `900 ${H * .3}px system-ui`; x.fillText(st.f, W * .05, H * .66);
    x.font = `700 ${H * .075}px system-ui`; x.fillStyle = 'rgba(255,255,255,.9)'; x.fillText('AGORA: ' + (N.t.length > 30 ? N.t.slice(0, 29) + '…' : N.t), W * .05, H * .86);
    x.restore(); return;
  }
  const port = H > W * 1.1, cor = ad.cor || '#c8102e', tpl = ad.tpl || 'classico', u = Math.min(W, H) / 100;
  let fg = '#fff', sub = 'rgba(255,255,255,.9)', icBg = 'rgba(255,255,255,.18)', icFg = '#fff';
  if (tpl === 'classico') { const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, cor); g.addColorStop(1, shade(cor, .45)); x.fillStyle = g; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(255,255,255,.07)'; x.beginPath(); x.arc(W * .85, H * .2, H * .7, 0, 7); x.fill(); }
  else if (tpl === 'promo') { x.fillStyle = '#ffcb00'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(0,0,0,.06)'; for (let i = -H; i < W; i += 26 * u) { x.beginPath(); x.moveTo(i, H); x.lineTo(i + H, 0); x.lineTo(i + H + 12 * u, 0); x.lineTo(i + 12 * u, H); x.fill(); } fg = '#111'; sub = '#222'; icBg = cor; icFg = '#fff'; }
  else if (tpl === 'neon') { x.fillStyle = '#0b0b14'; x.fillRect(0, 0, W, H); x.strokeStyle = cor; x.lineWidth = 3 * u; x.shadowColor = cor; x.shadowBlur = 14 * u; muRR(x, 4 * u, 4 * u, W - 8 * u, H - 8 * u, 8 * u); x.stroke(); x.shadowBlur = 0; fg = '#fff'; sub = shade(cor, 1.6); icBg = 'rgba(255,255,255,.08)'; icFg = cor; }
  else if (tpl === 'minimal') { x.fillStyle = '#f7f5f0'; x.fillRect(0, 0, W, H); x.fillStyle = cor; if (port) x.fillRect(0, 0, W, 6 * u); else x.fillRect(0, 0, 6 * u, H); fg = '#141414'; sub = '#444'; icBg = cor; icFg = '#fff'; }
  else if (tpl === 'festa') { const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#3a0ca3'); g.addColorStop(.5, cor); g.addColorStop(1, '#f72585'); x.fillStyle = g; x.fillRect(0, 0, W, H); for (let i = 0; i < 60; i++) { x.fillStyle = ['#ffcb00', '#4cc9f0', '#fff', '#80ffdb'][i % 4]; x.globalAlpha = .7; x.fillRect((i * 97 + t * 30) % W, (i * 53 + t * 18 * (i % 3 + 1)) % H, 2.2 * u, 2.2 * u); } x.globalAlpha = 1; }
  else if (tpl === 'viagem') { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4cc9f0'); g.addColorStop(.65, '#ffd6a5'); g.addColorStop(1, '#f4a261'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.fillStyle = '#ffef9f'; x.beginPath(); x.arc(W * .78, H * .58, H * .2, 0, 7); x.fill(); x.fillStyle = shade(cor, .7); x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= 10; i++) x.lineTo(i * W / 10, H * (.78 + Math.sin(i * 1.3) * .06)); x.lineTo(W, H); x.fill(); x.fillStyle = '#3d2b1f'; x.fillRect(W * .9, H * .62, 1.2 * u, H * .2); x.beginPath(); x.ellipse(W * .9, H * .6, 6 * u, 3 * u, 0, 0, 7); x.fill(); icBg = 'rgba(255,255,255,.35)'; }
  else if (tpl === 'emprego') { x.fillStyle = '#c49a6c'; x.fillRect(0, 0, W, H); x.fillStyle = '#fffdf3'; x.save(); x.translate(W / 2, H / 2); x.rotate(-.02); x.fillRect(-W * .45, -H * .42, W * .9, H * .84); x.restore(); x.fillStyle = '#c8102e'; x.beginPath(); x.arc(W * .5, H * .1, 2.5 * u, 0, 7); x.fill(); fg = '#141414'; sub = '#333'; icBg = cor; }
  // ícone
  const icS = port ? W * .34 : H * .42, icX = port ? W / 2 : W - icS * .75 - 6 * u, icY = port ? H * .24 : H * .45;
  x.fillStyle = icBg; x.beginPath(); x.arc(icX, icY, icS * .55, 0, 7); x.fill();
  if (typeof drawIc === 'function') drawIc(x, ad.ico || 'megaphone', icX, icY, icS * .62, icFg, 2.2);
  // textos
  const pad = (tpl === 'minimal' && !port ? 12 : 8) * u, tw = port ? W - pad * 2 : W - icS * 1.6 - pad * 1.4;
  x.textAlign = port ? 'center' : 'left'; const tx = port ? W / 2 : pad;
  if (tpl === 'emprego') { x.fillStyle = '#c8102e'; x.font = `900 ${(port ? 9 : 11) * u}px system-ui`; x.fillText('PRECISA-SE', tx, port ? H * .48 : H * .25); }
  if (tpl === 'promo') { x.save(); x.translate(port ? W * .82 : W * .62, port ? H * .1 : H * .2); x.rotate(-.25); x.fillStyle = '#c8102e'; x.beginPath(); for (let i = 0; i < 24; i++) { const r = i % 2 ? 9 * u : 13 * u, a = i / 24 * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `900 ${5.5 * u}px system-ui`; x.fillText('PROMO', 0, 2 * u); x.restore(); x.textAlign = port ? 'center' : 'left'; }
  x.fillStyle = fg; const ts = muFit(x, ad.t || '', tw, (port ? 15 : 19) * u);
  if (tpl === 'neon') { x.shadowColor = cor; x.shadowBlur = 10 * u; }
  const ty = port ? H * .56 : (tpl === 'emprego' ? H * .45 : H * .4); x.fillText(ad.t || '', tx, ty); x.shadowBlur = 0;
  x.fillStyle = sub; x.font = `700 ${(port ? 7 : 8) * u}px system-ui,sans-serif`;
  muWrap(x, ad.s || '', tw).slice(0, port ? 3 : 2).forEach((l, i) => x.fillText(l, tx, ty + ts * .2 + (i + 1) * (port ? 9 : 10) * u));
  // marca + CTA
  const by = H - 9 * u;
  x.fillStyle = fg; x.font = `900 ${(port ? 7 : 8) * u}px system-ui`; if (ad.marca) x.fillText(ad.marca.toUpperCase(), tx, port ? by - 13 * u : by);
  if (ad.cta) { x.font = `800 ${(port ? 6 : 6.5) * u}px system-ui`; const cw = x.measureText(ad.cta).width + 8 * u, cx0 = port ? W / 2 - cw / 2 : W - cw - 5 * u - (port ? 0 : 0); const cy0 = by - 6 * u; x.fillStyle = tpl === 'promo' ? '#111' : (tpl === 'minimal' || tpl === 'emprego' ? cor : '#fff'); muRR(x, cx0, cy0 - (port ? 0 : 0), cw, 9 * u, 4.5 * u); x.fill(); x.fillStyle = tpl === 'promo' || tpl === 'minimal' || tpl === 'emprego' ? '#fff' : shade(cor, .6); x.textAlign = 'center'; x.fillText(ad.cta, cx0 + cw / 2, cy0 + 6.5 * u); }
  if (ad.nick) { x.textAlign = 'left'; x.font = `700 ${4.6 * u}px system-ui`; x.fillStyle = 'rgba(0,0,0,.45)'; const s = 'ANÚNCIO · ' + ad.nick; const sw = x.measureText(s).width + 5 * u; x.fillRect(W - sw - 2 * u, 2 * u, sw, 7 * u); x.fillStyle = '#fff'; x.fillText(s, W - sw + .5 * u, 7.2 * u); }
  x.restore();
}

/* ---------------- superfícies de anúncio ---------------- */
function muAdSurface(w, h, cw, ch, alc, lit = .45) {
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
  const m = new T.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: lit, roughness: .55 });
  nightMats.push({ m, day: lit * .55, night: lit * 1.9 });
  const b = { cv, ctx: cv.getContext('2d'), tex, m, alc, i: MU.boards.length, cur: null, w, h };
  MU.boards.push(b); return b;
}
function muBoard(x, y, z, ry, w, h, kind) {
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; worldScene.add(g);
  const b = muAdSurface(w, h, 512, 256, kind === 'led' ? 'led' : 'placa', kind === 'led' ? .9 : .4);
  b.x = x; b.z = z; b.led = kind === 'led';
  const steel = mat('#4a4f55', { metalness: .6, roughness: .4 });
  if (y > 5 || kind === 'roof') { [-w * .3, w * .3].forEach(px => { mesh(bx(.25, y, .25), steel, px, y / 2, -.3, g); }); }
  else { mesh(cyl(.28, .34, y, 10), steel, 0, y / 2, -.25, g); }
  mesh(bx(w + .5, h + .5, .35), mat(kind === 'led' ? '#111' : '#e9e6df', { roughness: .6 }), 0, y + h / 2, -.2, g);
  const front = new T.Mesh(new T.PlaneGeometry(w, h), b.m); front.position.set(0, y + h / 2, -.01); g.add(front);
  const back = new T.Mesh(new T.PlaneGeometry(w, h), b.m); back.position.set(0, y + h / 2, -.39); back.rotation.y = Math.PI; g.add(back);
  if (kind !== 'led') [-w * .33, 0, w * .33].forEach(px => { mesh(bx(.12, .12, .8), steel, px, y + h + .35, .1, g, false); mesh(bx(.5, .18, .3), lampMat, px, y + h + .3, .45, g, false); });
  mesh(bx(w + .8, .12, 1), steel, 0, y - .05, .1, g, false);
  return b;
}
function muShelter(x, z, ry) { // paragem de candongueiro com poster retroiluminado
  const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; worldScene.add(g);
  const st = mat('#3a3f45', { metalness: .6, roughness: .35 }), gl = new T.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: .28, roughness: .1, metalness: .2 });
  [[-1.6, -.6], [1.6, -.6], [-1.6, .6], [1.6, .6]].forEach(([a, c]) => mesh(bx(.08, 2.5, .08), st, a, 1.25, c, g));
  mesh(bx(3.6, .1, 1.6), mat('#1f63c9', { roughness: .4 }), 0, 2.55, 0, g); mesh(bx(3.62, .14, .08), mat('#ffcb00'), 0, 2.45, .8, g, false);
  const back = new T.Mesh(new T.PlaneGeometry(3.2, 1.9), gl); back.position.set(0, 1.35, -.6); g.add(back);
  mesh(bx(2.6, .08, .45), mat('#8a5a3a'), 0, .5, -.3, g); mesh(bx(.08, .5, .08), st, -1.1, .25, -.3, g); mesh(bx(.08, .5, .08), st, 1.1, .25, -.3, g);
  const b = muAdSurface(1.25, 1.9, 256, 390, 'mupi', .7); b.x = x; b.z = z;
  mesh(bx(1.45, 2.2, .22), mat('#2a2a2a', { metalness: .4 }), 1.75, 1.3, 0, g);
  [.12, -.12].forEach((o, k) => { const p = new T.Mesh(new T.PlaneGeometry(1.25, 1.9), b.m); p.position.set(1.75, 1.3, o); if (k) p.rotation.y = Math.PI; g.add(p); });
  const sg = textSprite('🚐 Paragem', { scale: 1.6, size: 44 }); sg.position.set(-1.2, 3.05, .3); g.add(sg);
  const c = Math.cos(ry), s = Math.sin(ry); addCol(x + c * 1.75, z - s * 1.75, .5, .5);
  return b;
}
function muDrawBoard(b, t, force) {
  const pool = muPool(b.alc), ad = pool[(MU.rot + b.i * 5) % pool.length];
  if (!force && ad === b.cur && !b.led && !ad.live && ad.tpl !== 'festa') return;
  b.cur = ad;
  try { muAdDraw(b.ctx, b.cv.width, b.cv.height, ad, t); } catch (e) { console.error(e); }
  if (b.led) { const x = b.ctx, W = b.cv.width, H = b.cv.height; x.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = 0; yy < H; yy += 3) x.fillRect(0, yy, W, 1); const sx = ((t * 160) % (W + 200)) - 100; const gg = x.createLinearGradient(sx - 60, 0, sx + 60, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.18)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(0, 0, W, H); }
  b.tex.needsUpdate = true;
}

/* ---------------- telões de TV ---------------- */
function muScreen(T_) {
  const g = new T.Group(); g.position.set(T_.sx, 0, T_.sz); g.rotation.y = T_.ry; worldScene.add(g);
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 180;
  const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding;
  const m = new T.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: .95, roughness: .4 });
  const steel = mat('#2b2f35', { metalness: .6, roughness: .35 });
  if (T_.kiosk) {
    // barraca de madeira com TV e banco
    mesh(bx(3.4, 2.4, 2.2), mat('#a0663a'), 0, 1.2, .9, g); mesh(bx(3.8, .12, 3), mat('#c8102e'), 0, 2.6, .5, g);
    mesh(bx(2.2, 1.3, .1), mat('#111'), 0, T_.y + T_.h / 2, -.25, g);
    const p = new T.Mesh(new T.PlaneGeometry(T_.w, T_.h), m); p.position.set(0, T_.y + T_.h / 2, -.31); p.rotation.y = Math.PI; g.add(p);
    mesh(bx(3, .1, .5), mat('#6b4423'), 0, .48, -2.6, g); [-1.2, 1.2].forEach(px => mesh(bx(.1, .48, .4), mat('#4a2e1a'), px, .24, -2.6, g));
    const s = signPlane('BARRACA DO KOTA', 3.2, '#ffcb00', '#111', 'TV · GASOSA · PETISCOS'); s.position.set(0, 2.25, -.27); s.rotation.y = Math.PI; g.add(s);
    addCol(T_.sx, T_.sz + .9 * (T_.ry ? -1 : 1) * -1, 3.4, 2.2);
  } else {
    const H0 = T_.y, Hs = T_.h, W = T_.w;
    [-W * .36, W * .36].forEach(px => mesh(bx(.35, H0 + Hs * .5, .35), steel, px, (H0 + Hs * .5) / 2, -.35, g));
    mesh(bx(W + .5, Hs + .5, .4), mat('#141414', { roughness: .4 }), 0, H0 + Hs / 2, -.25, g);
    const p = new T.Mesh(new T.PlaneGeometry(W, Hs), m); p.position.set(0, H0 + Hs / 2, -.04); g.add(p);
    const ch = LV_TV.find(c => c.id === T_.ch); const lab = textSprite(`📺 ${ch ? ch.n : 'TV'}`, { scale: 3.4, size: 46 }); lab.position.set(0, H0 + Hs + .9, -.2); g.add(lab);
    mesh(bx(W + .5, .25, .9), steel, 0, H0 - .1, 0, g);
    const c = Math.cos(T_.ry), s = Math.sin(T_.ry); [-W * .36, W * .36].forEach(px => addCol(T_.sx + c * px, T_.sz - s * px, .6, .6));
  }
  const S = { T: T_, cv, ctx: cv.getContext('2d'), tex, m };
  try { lvDrawTV(S.ctx, 320, 180, T_.ch, 0); } catch (e) { }
  MU.screens.push(S); return S;
}

/* =========================================================
   CONSTRUÇÃO: Avenida dos Transportes + Agência + placas
   ========================================================= */
function muBuild() {
  decor = new T.Group(); worldScene.add(decor);
  const X = CITY_XS, Z = MU_AV;
  /* avenida e ligações */
  road(-178, Z, 178, Z); X.forEach(x => { road(x, 148, x, Z); crosswalk(x, Z); });
  const im = new T.MeshStandardMaterial({ color: '#3a3b3f', roughness: .92 });
  X.forEach(x => { const p = new T.Mesh(new T.PlaneGeometry(ROAD_W, ROAD_W), im); p.rotation.x = -Math.PI / 2; p.position.set(x, .062, Z); worldScene.add(p); });
  const cm = mat('#d8d2c6'); [[-178, X[0]], [X[0], X[1]], [X[1], X[2]], [X[2], X[3]], [X[3], X[4]], [X[4], 178]].forEach(([a, b]) => { const a1 = a + (a > -178 ? 5 : 0), b1 = b - (b < 178 ? 5 : 0); [-1, 1].forEach(s => mesh(bx(b1 - a1, .18, .3), cm, (a1 + b1) / 2, .09, Z + s * 5, decor, false)); });
  const nearLocX = x => Object.values(LOC_POS).some(L => Math.abs(L.z - Z) < 10 && Math.abs(L.x - x) < 6) || X.some(a => Math.abs(a - x) < 9);
  for (let x = -170; x <= 170; x += 20) { if (!nearLocX(x)) lamp(x, Z - 6.2, 0); if (!nearLocX(x + 10)) lamp(x + 10, Z + 6.2, Math.PI); }
  // passeio largo e relva da zona sul
  const grass = noiseTex('#7aa548', ['#5b8530', '#88b04f', '#4e7428'], [30, 6]);
  groundPatch(-178, 166, 178, 228, null, .012, grass);
  const pave = noiseTex('#cfc8bb', ['#bdb5a6', '#ddd6c9'], [40, 4], 900);
  groundPatch(-178, 165, 178, 172, null, .03, pave);

  /* ---- Pedala Angola (bicicletas) ---- */
  bldg(-150, 179, 22, 12, 7, { face: '#e9f5ec', glass: '#1d6b3a', kind: 'glass', noTop: true });
  mesh(bx(22.4, .7, .3), mat('#52b788'), -150, 6.2, 172.9, decor, false);
  sign('PEDALA ANGOLA', 11, '#1b4332', '#b7e4c7', 'BICICLETAS · BTT · ALUGUER · OFICINA', -150, 4.9, 172.8, Math.PI);
  canopy(-150, 171.6, 9, 2.6, 3.4, '#52b788', '#ffffff', Math.PI);
  for (let i = 0; i < 7; i++) { const bx0 = -160 + i * 2.2; if (Math.abs(bx0 + 150) < 3) continue; mesh(bx(.06, .6, .06), mat('#888', { metalness: .7 }), bx0, .3, 170.6, decor, false); }

  /* ---- Estação Ferroviária ---- */
  const stc = '#f1e3c6', sty = '#b5651d';
  mesh(bx(34, 9, 13), mat(stc), -90, 4.5, 181.5, decor); addCol(-90, 181.5, 34.4, 13.4);
  mesh(bx(34.6, .8, 13.6), mat(sty), -90, 9.3, 181.5, decor);
  for (let i = 0; i < 7; i++) { const ax = -105 + i * 5; mesh(bx(3.2, 5.4, .1), mat('#2a3d52', { roughness: .2, metalness: .5 }), ax, 2.9, 174.95, decor, false); mesh(new T.CylinderGeometry(1.6, 1.6, .12, 16, 1, false, 0, Math.PI), mat(sty), ax, 5.6, 174.95, decor, false).rotation.set(Math.PI / 2, 0, Math.PI / 2); }
  mesh(bx(6, 17, 6), mat(stc), -90, 8.5, 178, decor); mesh(bx(6.6, .6, 6.6), mat(sty), -90, 17.2, 178, decor);
  { const rf = mesh(new T.ConeGeometry(4.6, 3.4, 4), mat('#7a3a2a'), -90, 19.2, 178, decor); rf.rotation.y = Math.PI / 4; }
  { const ck = ctex(128, 128, x => { x.fillStyle = '#fbf7ee'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 6; x.stroke(); x.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillRect(64 + Math.cos(a) * 48 - 3, 64 + Math.sin(a) * 48 - 3, 6, 6); } x.lineWidth = 5; x.beginPath(); x.moveTo(64, 64); x.lineTo(64, 24); x.moveTo(64, 64); x.lineTo(92, 70); x.stroke(); });
    const c = new T.Mesh(new T.CircleGeometry(2, 24), new T.MeshStandardMaterial({ map: ck, emissive: '#fff', emissiveMap: ck, emissiveIntensity: .25 })); c.position.set(-90, 13.5, 174.96); c.rotation.y = Math.PI; worldScene.add(c); }
  sign('ESTAÇÃO FERROVIÁRIA DE LUANDA', 16, '#2b2b2b', '#ffcb00', 'FERROVIA KIANDA · NORTE · CENTRO · SUL', -90, 7.2, 174.9, Math.PI);
  // plataforma e linha
  groundPatch(-128, 212, -52, 226, '#bdb6a8', .04); mesh(bx(76, .03, .5), mat('#ffcb00'), -90, .06, 225.4, decor, false);
  for (let i = 0; i < 9; i++) { const px = -124 + i * 8.5; mesh(cyl(.14, .14, 4.2, 8), mat('#6b6f75', { metalness: .6 }), px, 2.1, 219, decor); }
  mesh(bx(76, .25, 7), mat('#b5651d', { roughness: .5 }), -90, 4.3, 219, decor);
  for (let i = 0; i < 4; i++) { mesh(bx(2.6, .45, .5), mat('#8a5a3a'), -118 + i * 18, .45, 216.5, decor); }
  const stname = signPlane('LUANDA · CENTRAL', 4, '#1d3557', '#ffffff', 'LINHA NORTE · LINHA SUL'); stname.position.set(-90, 3.4, 220.5); worldScene.add(stname);
  const stname2 = signPlane('LUANDA · CENTRAL', 4, '#1d3557', '#ffffff', 'LINHA NORTE · LINHA SUL'); stname2.position.set(-90, 3.4, 220.3); stname2.rotation.y = Math.PI; worldScene.add(stname2);
  // via férrea
  const sl = noiseTex('#6e5a48', ['#5a4838', '#7d6a58'], [200, 1], 400);
  groundPatch(-420, 229.5, 420, 234.5, null, .05, sl);
  { const rt = ctex(64, 256, x => { x.fillStyle = '#6a6a6a'; x.fillRect(0, 0, 64, 256); for (let i = 0; i < 256; i += 16) { x.fillStyle = '#5a3d26'; x.fillRect(0, i, 64, 7); } }); rt.wrapS = rt.wrapT = T.RepeatWrapping; rt.repeat.set(1, 200);
    const p = new T.Mesh(new T.PlaneGeometry(3.2, 840), new T.MeshStandardMaterial({ map: rt, roughness: 1 })); p.rotation.set(-Math.PI / 2, 0, Math.PI / 2); p.position.set(0, .07, 232); worldScene.add(p); }
  [-.72, .72].forEach(o => mesh(bx(840, .14, .1), mat('#9aa0a6', { metalness: .8, roughness: .3 }), 0, .16, 232 + o, decor, false));
  for (let x = -176; x <= 176; x += 4) if (x < -130 || x > -50) mesh(bx(.1, 1.2, .1), mat('#777'), x, .6, 227.6, decor, false);
  mesh(bx(46, .06, .06), mat('#999'), -153, 1.1, 227.6, decor, false); mesh(bx(126, .06, .06), mat('#999'), 113, 1.1, 227.6, decor, false);

  /* ---- Stand Auto Kianda ---- */
  bldg(-30, 182, 34, 18, 9, { face: '#e8eef4', glass: '#1f4e79', kind: 'glass', noTop: true });
  mesh(bx(34.4, 1.2, .4), mat('#0077b6'), -30, 8.2, 172.9, decor, false);
  sign('STAND AUTO KIANDA', 13, '#03045e', '#ffffff', 'CARROS NOVOS E USADOS · TEST-DRIVE · OFICINA', -30, 6.2, 172.75, Math.PI);
  groundPatch(-47, 167.5, -13, 172.6, '#2b2d31', .035);
  [-44, -38, -22, -16].forEach((x, i) => { mesh(cyl(1.9, 2, .25, 24), mat('#dfe3e8', { metalness: .3, roughness: .3 }), x, .12, 170.4, decor); });
  [[-49, 1], [-11, 1]].forEach(([x]) => { mesh(cyl(.06, .06, 6, 6), mat('#ccc'), x, 3, 168, decor); const fl = mesh(bx(.05, 2.4, 1), mat('#0077b6'), x, 4.6, 168.55, decor, false); });

  /* ---- Moto Bwé ---- */
  bldg(30, 180, 26, 14, 7, { face: '#1b1b1f', glass: '#f77f00', kind: 'glass', noTop: true });
  mesh(bx(26.4, .9, .3), mat('#f77f00', { emissive: '#f77f00', emissiveIntensity: .6 }), 30, 6.3, 172.9, decor, false);
  sign('MOTO BWÉ', 9, '#f77f00', '#111111', 'MOTORIZADAS · SCOOTERS · KUPAPATA', 30, 4.8, 172.75, Math.PI);
  groundPatch(17, 167.5, 43, 172.6, '#2b2d31', .035);

  /* ---- Aeroporto de Luanda ---- */
  bldg(120, 190, 64, 22, 13, { face: '#eef3f7', glass: '#4f8fbf', kind: 'glass', noTop: true });
  { const rf = new T.Mesh(new T.CylinderGeometry(14, 14, 66, 32, 1, true, -Math.PI / 2.6, Math.PI / 1.3), mat('#f4f6f8', { side: T.DoubleSide, metalness: .3, roughness: .4 })); rf.rotation.z = Math.PI / 2; rf.position.set(120, 4.6, 190); rf.scale.set(1, 1, .9); rf.castShadow = true; worldScene.add(rf); }
  canopy(120, 176.6, 40, 4.2, 4.4, '#ffffff', '#b5179e', Math.PI);
  sign('AEROPORTO DE LUANDA', 18, '#ffffff', '#b5179e', 'PALANCA AIRLINES · VOOS NACIONAIS E INTERNACIONAIS', 120, 10, 178.85, Math.PI);
  [96, 108, 132, 144].forEach(x => mesh(cyl(.25, .25, 4.4, 10), mat('#ddd', { metalness: .6 }), x, 2.2, 176, decor));
  // torre de controlo
  mesh(cyl(1.6, 2.2, 26, 14), mat('#e9edf1'), 166, 13, 202, decor); addCol(166, 202, 4.4, 4.4);
  mesh(cyl(4, 3, 4, 12), mat('#3a6ea5', { roughness: .15, metalness: .6 }), 166, 28, 202, decor); mesh(cyl(4.4, 4.4, .6, 12), mat('#f4f6f8'), 166, 30.3, 202, decor);
  mesh(cyl(.08, .08, 4, 6), mat('#ccc'), 166, 32.5, 202, decor);
  // placa de pista + avião estacionado
  groundPatch(60, 236, 260, 252, '#8a8d91', .04);
  groundPatch(-120, 256, 420, 270, '#4a4c50', .045);
  for (let x = -110; x < 420; x += 14) mesh(bx(7, .02, .5), mat('#f2f2f2'), x, .08, 263, decor, false);
  [-1, 1].forEach(s => mesh(bx(540, .02, .3), mat('#f2f2f2'), 150, .08, 263 + s * 6.6, decor, false));
  for (let x = -110; x < 420; x += 18) [-1, 1].forEach(s => mesh(bx(.4, .3, .4), new T.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffd27a', emissiveIntensity: .8 }), x, .2, 263 + s * 7.4, decor, false));
  // zona verde
  [[-170, 196], [-128, 204], [-60, 200], [-8, 206], [52, 200], [-160, 214], [10, 220], [70, 214]].forEach(([x, z], i) => i % 3 === 0 ? baobab(x, z, .8 + (i % 2) * .2) : treeA(x, z, .9));
  [[-178, 188], [178, 186]].forEach(([x, z]) => palm(x - Math.sign(x) * 2, z, 1));

  /* ---- Agência Kianda Publicidade (Baixa) ---- */
  bldg(-152, -62, 22, 16, 15, { face: '#2b1d3f', glass: '#9d4edd', kind: 'glass', noTop: true });
  sign('KIANDA PUBLICIDADE', 12, '#7209b7', '#ffffff', 'PLACAS · LED · POSTERS · RÁDIO', -152, 5.4, -53.85, 0);
  canopy(-152, -52.6, 10, 2.8, 3.6, '#7209b7', '#ffcb00', 0);
  mesh(bx(.25, 16, .25), mat('#ffcb00'), -163.2, 8, -53.9, decor, false); mesh(bx(.25, 16, .25), mat('#ffcb00'), -140.8, 8, -53.9, decor, false);

  worldScene.remove(decor); worldScene.add(mergeStatic(decor)); decor = null;

  /* ---- ecrã LED gigante na fachada da agência ---- */
  { const b = muAdSurface(16, 6.5, 512, 208, 'led', 1); b.led = true; b.x = -152; b.z = -53.8; const p = new T.Mesh(new T.PlaneGeometry(16, 6.5), b.m); p.position.set(-152, 10.8, -53.78); worldScene.add(p); }
  /* ---- telões ---- */
  MU_TVS.forEach(t => { if (t.id !== 'casa') muScreen(t); });
  /* ---- placas grandes ---- */
  [[-125, 3.2, -111.2, Math.PI, 10, 5, 'placa'], [-15, 3.6, 151.2, 0, 10, 5, 'placa'], [-105, 3.6, 151.2, 0, 10, 5, 'placa'], [95, 3.6, 151.2, 0, 10, 5, 'led'],
    [76, 8.3, 30, Math.PI, 10, 4.5, 'roof'], [150, 12.3, 40, Math.PI, 14, 5.5, 'led'], [150, 10.3, 136, Math.PI, 14, 5.5, 'roof'], [-30, 9.3, 132, Math.PI, 12, 5, 'roof'],
    [30, 9.3, 132, Math.PI, 12, 5, 'roof'], [-55, 9.2, -129, 0, 12, 4.5, 'led'], [150, 7.8, -71, Math.PI, 12, 5, 'roof'], [-90, 11.3, 80, Math.PI, 10, 4.5, 'roof'],
    [-178, 3.6, 130, Math.PI / 2, 10, 5, 'placa'], [178, 3.6, 80, -Math.PI / 2, 10, 5, 'placa']].forEach(a => muBoard(...a));
  /* ---- paragens com posters ---- */
  [[45, -47.6, 0], [-45, -32.4, Math.PI], [68, 2.6, 0], [-105, 67.4, Math.PI], [-45, 103, 0], [165, -32.4, Math.PI], [-165, 152.6, 0], [90, 152.6, 0], [-135, 67.4, Math.PI], [-75, -47.6, 0]].forEach(a => muShelter(...a));
  MU.boards.forEach(b => muDrawBoard(b, 0, true));

  /* ---- comboio e aviões ---- */
  if (typeof vehModel === 'function') {
    MU.train = vehModel('train', '#2b9348'); MU.train.position.set(-500, 0, 232); worldScene.add(MU.train);
    MU.planes = [0, 1].map(i => { const p = vehModel('plane', i ? '#1d3557' : '#b5179e'); p.position.set(-500, 0, 263); worldScene.add(p); return p; });
    const pk = vehModel('plane', '#b5179e'); pk.position.set(110, 0, 244); pk.rotation.y = Math.PI * .5; pk.scale.setScalar(.9); worldScene.add(pk);
    const pk2 = vehModel('plane', '#2b9348'); pk2.position.set(170, 0, 244); pk2.rotation.y = Math.PI * .5; pk2.scale.setScalar(.8); worldScene.add(pk2);
    // carros e motos em exposição
    [['carronovo', -44, '#0077b6'], ['gt', -38, '#c8102e'], ['carroel', -22, '#f2f2f2'], ['pickup', -16, '#2e8b57']].forEach(([k, x, c]) => { const v = vehModel(VEIC[k].mod, c); v.position.set(x, .25, 170.4); v.rotation.y = Math.PI * .5 + .5; worldScene.add(v); addCol(x, 170.4, 3.4, 3.4); });
    [['scooter', 20.5, '#ff2fa0'], ['moto', 24, '#c8102e'], ['trail', 36, '#ffcb00'], ['superbike', 39.5, '#111111']].forEach(([k, x, c]) => { const v = vehModel(VEIC[k].mod, c); v.position.set(x, 0, 170.2); v.rotation.y = Math.PI * .5 + .35; worldScene.add(v); addCol(x, 170.2, 1, 1.6); });
    [['bike', -158], ['bmx', -156], ['btt', -144], ['ebike', -142]].forEach(([k, x], i) => { const v = vehModel(VEIC[k].mod, ['#2e8b57', '#ff2fa0', '#ff7a1a', '#0077b6'][i]); v.position.set(x, 0, 170.7); v.rotation.y = Math.PI * .5; worldScene.add(v); });
  }
  /* trânsito também na avenida nova */
  try {
    const path = [[X[0], 110], [X[4], 110], [X[4], Z], [X[0], Z]];
    for (let i = 0; i < 2; i++) {
      const p = i ? path.slice().reverse() : path, segs = []; let total = 0;
      for (let k = 0; k < p.length; k++) { const a = p[k], b = p[(k + 1) % p.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, L, s: total }); total += L; }
      const v = i ? vanModel() : carModel(); v.scale.multiplyScalar(BODY_S); worldScene.add(v); vans.push({ g: v, segs, total, d: i * total * .5, speed: 11 + i * 2, wait: 0 });
    }
  } catch (e) { console.error(e); }
}
(function () { const _b = buildWorld; buildWorld = function () { const r = _b.apply(this, arguments); try { muBuild(); } catch (e) { console.error('muBuild', e); } return r; }; })();

/* =========================================================
   ANIMAÇÃO: placas, telões, comboio e aviões
   ========================================================= */
const muSmooth = k => k * k * (3 - 2 * k);
function muTrainX(T) { // ciclo de 110 s, igual para todos os jogadores
  const c = ((T % 110) + 110) % 110;
  if (c < 30) { const k = c / 30; return -560 + (1 - (1 - k) * (1 - k)) * 470; }  // chega e trava
  if (c < 42) return -90;                                                       // parado na estação
  if (c < 80) { const k = (c - 42) / 38; return -90 + k * k * 650; }             // arranca
  return 1000;
}
function muPlane(p, T, off) {
  const c = (((T + off) % 150) + 150) % 150;
  if (off === 0) { // descolagem
    if (c > 46) { p.visible = false; return; } p.visible = true;
    const k = c / 46, x = -100 + k * k * 900, y = Math.max(0, (x - 180) * .22); p.position.set(x, y, 263); p.rotation.set(0, 0, 0); p.rotation.z = y > 0 ? .16 : 0;
  } else { // aterragem
    if (c > 40) { p.visible = false; return; } p.visible = true;
    const k = c / 40, x = 900 - (1 - (1 - k) * (1 - k)) * 960, y = Math.max(0, (x - 200) * .2); p.position.set(x, y, 263); p.rotation.set(0, Math.PI, 0); p.rotation.z = y > 0 ? -.05 : 0;
  }
}
function muTick(dt) {
  if (!worldScene || (typeof inInt !== 'undefined' && inInt)) return;
  const T = muNowS(), t = performance.now() / 1000;
  MU.rotT += dt; if (MU.rotT > 9) { MU.rotT = 0; MU.rot++; MU.boards.forEach(b => muDrawBoard(b, t)); }
  MU.ledT += dt; if (MU.ledT > .12) { MU.ledT = 0; MU.boards.forEach(b => { if ((b.led || (b.cur && (b.cur.live || b.cur.tpl === 'festa'))) && Math.hypot(b.x - playerPos.x, b.z - playerPos.z) < 90) muDrawBoard(b, t, true); }); }
  MU.scrT += dt; if (MU.scrT > .1 && MU.screens.length) {
    MU.scrT = 0; const near = MU.screens.filter(s => Math.hypot(s.T.sx - playerPos.x, s.T.sz - playerPos.z) < 70);
    if (near.length) { const s = near[MU.scrI++ % near.length]; try { lvDrawTV(s.ctx, 320, 180, s.T.ch, t); s.tex.needsUpdate = true; } catch (e) { } }
  }
  if (MU.train) {
    const x = muTrainX(T); MU.train.visible = x < 900; MU.train.position.x = x;
    const c = ((T % 110) + 110) % 110; if (c > 41.5 && c < 41.5 + dt * 1.2 && Math.abs(playerPos.z - 220) < 70 && typeof SND !== 'undefined') SND.play('trainHorn');
    if (MU.train.userData.wheels) MU.train.userData.wheels.forEach(w => w.rotation.y += dt * (c < 30 ? (30 - c) / 3 : c > 42 && c < 80 ? (c - 42) / 3 : 0));
  }
  MU.planes.forEach((p, i) => muPlane(p, T, i ? 75 : 0));
}
(function () { const _u = updateWorld; updateWorld = function (dt) { const r = _u.apply(this, arguments); try { muTick(dt); } catch (e) { console.error(e); } return r; }; })();

/* =========================================================
   VER TV: telões, barraca e TV de casa
   ========================================================= */
function muWatch(spot) {
  if (!G) return;
  const ch = spot.ch || LIVE.tvCh;
  MU.watchSpot = spot; LIVE.watch = ch; uiBlocked = true; if (typeof closePhone === 'function') closePhone();
  let v = document.getElementById('tvView');
  if (!v) {
    document.body.insertAdjacentHTML('beforeend', `<div id="tvView" class="hidden"><div class="tvvBox"><div class="tvvTop"><div><b id="tvvName"></b><small id="tvvSub"></small></div><span class="aibadge lvbadge">● AO VIVO</span><button class="tvvX" onclick="muTvClose()">✕</button></div>
      <div class="tvvMain"><div class="tvvScr"><canvas id="tvvCv" width="960" height="540"></canvas><span class="tvview" id="tvvCount"></span></div><div class="tvvSide"><div id="tvvChs"></div><div id="tvvInfo"></div></div></div></div></div>`);
    v = document.getElementById('tvView');
  }
  v.classList.remove('hidden'); SND.unlock(); SND.play('tvon');
  muTvRender(); MU.tvRew = 0;
  if (!MU.tvRaf) { const loop = () => { if (!LIVE.watch) { MU.tvRaf = 0; return; } const c = document.getElementById('tvvCv'); try { lvDrawTV(c.getContext('2d'), 960, 540, LIVE.watch, performance.now() / 1000); } catch (e) { } MU.tvRaf = requestAnimationFrame(loop); }; MU.tvRaf = requestAnimationFrame(loop); }
  if (typeof playerEmote === 'function') try { playerEmote('cheer'); } catch (e) { }
}
function muTvRender() {
  if (!LIVE.watch) return; const sp = MU.watchSpot || {}, ch = LV_TV.find(c => c.id === LIVE.watch) || LV_TV[0];
  document.getElementById('tvvName').textContent = sp.n || 'TV';
  document.getElementById('tvvSub').textContent = ch.n + ' · ' + ch.s + (sp.ch ? ' · canal fixo neste ecrã' : '');
  document.getElementById('tvvCount').textContent = `👁 ${lvCount('tv:' + ch.id)} a ver`;
  document.getElementById('tvvChs').innerHTML = sp.ch ? `<p class="apnote">Este ecrã público passa sempre a ${ch.n}. Para mudar de canal usa a TV da tua casa ou procura outro telão.</p>` : lvTvChBtns(ch.id, 'muTvSet');
  document.getElementById('tvvInfo').innerHTML = lvTvInfo(ch.id);
}
function muTvSet(id) { LIVE.watch = id; LIVE.tvCh = id; localStorage.setItem('pe3d_tv', id); SND.play('tvon'); muTvRender(); }
function muTvClose() {
  LIVE.watch = null; MU.watchSpot = null; const v = document.getElementById('tvView'); if (v) v.classList.add('hidden');
  uiBlocked = !!panelId || modalOpen || !!phoneApp; if (typeof SND !== 'undefined') SND.crowd(0);
}
setInterval(() => {
  try {
    if (!LIVE.watch || !G) return; MU.tvInfoT++;
    if (MU.tvInfoT % 5 === 0) muTvRender();
    MU.tvRew++; if (MU.tvRew % 40 === 0) { G.tvAno = G.tvAno && G.tvAno.ano === G.ano ? G.tvAno : { ano: G.ano, n: 0 }; if (G.tvAno.n < 4) { G.tvAno.n++; const ch = LV_TV.find(c => c.id === LIVE.watch); toast(`📺 Estás a gostar da ${ch ? ch.n : 'TV'}! ` + strip(fx({ felicidade: 1 }))); save(); refresh(); } }
  } catch (e) { }
}, 1000);
addEventListener('keydown', e => { if (LIVE.watch && (e.code === 'Escape' || e.code === 'KeyE' && !e.repeat)) { if (e.code === 'KeyE' && MU.tvOpenT && performance.now() - MU.tvOpenT < 400) return; muTvClose(); e.stopPropagation(); } }, true);

/* TV de casa: estação "Ver TV" junto ao sofá */
(function () {
  if (typeof ivBuild !== 'function') return;
  const _ib = ivBuild;
  ivBuild = function (id, key) {
    const D = _ib.apply(this, arguments);
    try {
      if (id === 'casa' && D && LIVE.tex) {
        const ps = []; D.sc.traverse(o => { if (o.isMesh && o.material && o.material.map === LIVE.tex) { const p = new T.Vector3(); o.getWorldPosition(p); ps.push(p); } });
        ps.slice(0, 1).forEach(p => ivStation(D, { x: p.x, z: p.z + 1.45, ry: Math.PI, ico: '📺', label: 'Ver TV', fn: () => muWatch({ n: 'A TV da tua casa', ch: null }) }));
      }
    } catch (e) { console.error(e); }
    return D;
  };
  const _use = ivUse; ivUse = function (st) { if (st && st.fn) { ivGo = null; playerYaw = st.ry; return st.fn(); } return _use.apply(this, arguments); };
})();

/* ---------- abrir os novos locais ---------- */
(function () {
  const _ol = openLocation;
  openLocation = function (id) {
    const L = LOC_POS[id];
    if (L && L.tv) { if (G.preso > 0) return toast('🔒 Estás preso(a)!'); MU.tvOpenT = performance.now(); return muWatch({ n: L.n, ch: L.tv }); }
    return _ol.apply(this, arguments);
  };
  // minimapa: os telões só aparecem quando estão perto (não poluem a borda)
  const _dm = drawMinimap;
  drawMinimap = function () {
    const hid = []; MU_TVS.forEach(t => { const L = LOC_POS[t.id]; if (L && Math.hypot(L.x - playerPos.x, L.z - playerPos.z) > 60) { hid.push([t.id, L]); delete LOC_POS[t.id]; } });
    try { _dm.apply(this, arguments); } finally { hid.forEach(([k, L]) => LOC_POS[k] = L); }
    const c = minimapCtx; if (!c) return; const W = c.canvas.width, H = c.canvas.height, S = 1.05, sx = x => W / 2 + (x - playerPos.x) * S, sz = z => H / 2 + (z - playerPos.z) * S;
    c.save(); c.globalCompositeOperation = 'destination-over'; c.fillStyle = '#4a4a4e'; c.fillRect(sx(-178), sz(MU_AV) - 4, 356 * S, 8); CITY_XS.forEach(x => c.fillRect(sx(x) - 4, sz(148), 8, 12 * S)); c.restore();
  };
})();

/* =========================================================
   AGÊNCIA KIANDA PUBLICIDADE — criar e gerir anúncios
   ========================================================= */
function muForm() {
  if (!MU.form) MU.form = { fmt: 'placa', cat: 'pessoal', tpl: 'classico', cor: '#c8102e', ico: 'megaphone', t: '', s: '', cta: '', marca: '' };
  if (!MU.form.marca && G) MU.form.marca = (G.grupo && G.grupo.nome) || G.nome;
  return MU.form;
}
function muAgSet(k, v) { muForm()[k] = v; if (['fmt', 'cat', 'tpl', 'cor', 'ico'].includes(k)) renderPanel(true); else muAgPreview(); }
function muAgPreview() {
  const c = document.getElementById('agPrev'), c2 = document.getElementById('agPrev2'); const f = muForm();
  const ad = Object.assign({}, f, { t: f.t || 'O teu título aqui', s: f.s || 'Escreve uma frase curta e chamativa para toda a cidade ver.', nick: G ? (MP && MP.nick) || G.nome : '' });
  if (c) muAdDraw(c.getContext('2d'), c.width, c.height, ad, performance.now() / 1000);
  if (c2) muAdDraw(c2.getContext('2d'), c2.width, c2.height, ad, performance.now() / 1000);
}
const muFmtT = s => s >= 3600 ? (s / 3600) + ' h' : (s / 60) + ' min';
function muLeft(a) { const s = Math.max(0, a.exp - muNowS()); return s > 3600 ? Math.floor(s / 3600) + ' h ' + Math.floor(s % 3600 / 60) + ' min' : Math.floor(s / 60) + ' min'; }
function agCriarUI() {
  const f = muForm(), F = AD_FMT.find(x => x.id === f.fmt) || AD_FMT[1];
  const temNeg = G.negocios.length || G.grupo;
  let h = `<div class="agprev"><canvas id="agPrev" width="512" height="256"></canvas><canvas id="agPrev2" width="150" height="230"></canvas></div><p class="apnote" style="text-align:center">Pré-visualização: placa grande e poster de paragem</p>`;
  h += sec('1 · Onde vai passar') + `<div class="agfmt">${AD_FMT.map(x => `<button class="${x.id === f.fmt ? 'on' : ''}" onclick="muAgSet('fmt','${x.id}')"><b>${x.ico} ${x.t}</b><small>${x.d}</small><em>${kzShort(x.p)} · ${muFmtT(x.dur)}</em></button>`).join('')}</div>`;
  h += sec('2 · Tipo de anúncio') + `<div class="agchips">${AD_CAT.map(([k, t]) => `<button class="chip ${k === f.cat ? 'on' : ''}" onclick="muAgSet('cat','${k}')">${t}</button>`).join('')}</div>`;
  if (f.cat === 'negocio' && !temNeg) h += noteBox('Ainda não tens negócio nem empresa. O anúncio passa na mesma, mas só traz clientes a quem tem um negócio aberto.', true);
  h += sec('3 · Texto') + `<div class="agform">
    <label>Título <input data-noic maxlength="28" value="${esc(f.t)}" placeholder="Ex: Salão da Mana Lurdes" oninput="muAgSet('t',this.value)"></label>
    <label>Frase <input data-noic maxlength="60" value="${esc(f.s)}" placeholder="Ex: Tranças e penteados com 20% de desconto" oninput="muAgSet('s',this.value)"></label>
    <label>Assinatura / marca <input data-noic maxlength="24" value="${esc(f.marca)}" oninput="muAgSet('marca',this.value)"></label>
    <label>Chamada (botão) <input data-noic maxlength="24" value="${esc(f.cta)}" placeholder="Ex: No Cazenga · Sábado" oninput="muAgSet('cta',this.value)"></label></div>`;
  h += sec('4 · Estilo') + `<div class="agchips">${AD_TPL.map(([k, t]) => `<button class="chip ${k === f.tpl ? 'on' : ''}" onclick="muAgSet('tpl','${k}')">${t}</button>`).join('')}</div>`
    + `<div class="agcor">${AD_COR.map(c => `<button style="background:${c}" class="${c === f.cor ? 'on' : ''}" onclick="muAgSet('cor','${c}')"></button>`).join('')}</div>`
    + `<div class="agico">${AD_ICO.map(i => `<button class="${i === f.ico ? 'on' : ''}" onclick="muAgSet('ico','${i}')">${typeof ic === 'function' ? ic(i) : i}</button>`).join('')}</div>`;
  h += `<button class="btn big" onclick="muPublish()">📢 Publicar por ${kz(F.p)} · ${muFmtT(F.dur)} no ar</button>`
    + `<p class="apnote">Todos os jogadores online vêem o teu anúncio nas placas, ecrãs e rádios da cidade. A agência tem filtro de ofensas: insultos, links e números de telefone são recusados.</p>`;
  setTimeout(muAgPreview, 0);
  return h;
}
function agArUI() {
  const all = muAdsAll().sort((a, b) => b.criado - a.criado), me = (MP && MP.nick) || G.nome;
  let h = sec(`No ar agora · ${all.length} anúncio${all.length === 1 ? '' : 's'} de jogadores`);
  if (!all.length) h += noteBox('Ainda ninguém anunciou. As placas estão a mostrar publicidade das marcas da cidade. Sê o primeiro!');
  h += `<div class="aglist">${all.map((a, i) => `<div class="agit ${a.nick === me ? 'mine' : ''}"><canvas data-ad="${i}" width="256" height="128"></canvas><div><b>${esc(a.t)}</b><small>${esc(a.nick || '')} · ${(AD_FMT.find(f => f.id === a.fmt) || {}).t || ''}</small><em>⏱ ${muLeft(a)}</em></div></div>`).join('')}</div>`;
  setTimeout(() => document.querySelectorAll('canvas[data-ad]').forEach(c => { const a = all[+c.dataset.ad]; if (a) muAdDraw(c.getContext('2d'), 256, 128, a, 0); }), 0);
  h += sec('Marcas a anunciar na cidade') + `<div class="aglist">${AD_BASE.filter(a => !a.live).slice(0, 8).map((a, i) => `<div class="agit"><canvas data-base="${i}" width="256" height="128"></canvas><div><b>${esc(a.marca)}</b><small>${esc(a.t)}</small></div></div>`).join('')}</div>`;
  setTimeout(() => document.querySelectorAll('canvas[data-base]').forEach(c => { const a = AD_BASE.filter(x => !x.live)[+c.dataset.base]; if (a) muAdDraw(c.getContext('2d'), 256, 128, a, 0); }), 0);
  return h;
}
function agInfoUI() {
  return sec('Como funciona') + list([
    infoItem('🖼️', 'Posters de paragem', `10 paragens de candongueiro com poster retroiluminado · ${kzShort(30000)} por 30 min`),
    infoItem('🪧', 'Placas grandes', `14 placas e telhados pela cidade, da Ilha a Viana · ${kzShort(150000)} por 2 h`),
    infoItem('📺', 'Ecrãs LED', `LED animado na Agência, no Mall, na Discoteca e na Avenida dos Transportes · ${kzShort(450000)} por 6 h`),
    infoItem('📻', 'Spot de rádio', `O locutor lê o teu anúncio nos intervalos das 5 rádios ao vivo · ${kzShort(80000)} por 1 h`),
    infoItem('🚀', 'Mega campanha', `Tudo ao mesmo tempo + rodapé do Telejornal · ${kzShort(1500000)} por 24 h`),
  ]) + sec('O que ganhas') + list([
    infoItem('🏪', 'O meu negócio', 'Mais clientes: lucro extra imediato e mais fama para a marca'),
    infoItem('💼', 'Emprego', 'Recebes candidaturas e a cidade fica a conhecer-te (karma)'),
    infoItem('🏷️', 'Vendo / compro', 'Interessados ligam-te; às vezes vendes logo com lucro'),
    infoItem('🎉', 'Festa / evento', 'Mais amigos e felicidade'),
    infoItem('🙋', 'Pessoal', 'Fama: toda a cidade vê o teu nome'),
    infoItem('🤝', 'Campanha social', 'Karma e respeito do bairro'),
  ]);
}
PANELS.agencia = { ico: '📢', t: 'Kianda Publicidade', sub: 'Placas, ecrãs LED, posters e rádio', tabs: [['criar', '📢 Criar anúncio', agCriarUI], ['ar', '📋 No ar', agArUI], ['info', 'ℹ️ Formatos', agInfoUI]] };
async function muPublish() {
  const f = muForm(), F = AD_FMT.find(x => x.id === f.fmt);
  if (!f.t.trim()) return toast('📢 Escreve um título para o anúncio.');
  const chk = [f.t, f.s, f.marca, f.cta].filter(s => s && s.trim()).map(s => MPF(s));
  if (chk.some(c => !c.ok || c.hits)) { SND.play('err'); return toast('📢 A agência recusou: linguagem ofensiva, links ou contactos não são permitidos.'); }
  if (G.dinheiro < F.p) return toast('💸 Não tens kumbu suficiente! Precisas de ' + kz(F.p));
  const body = { fmt: f.fmt, tpl: f.tpl, cor: f.cor, ico: f.ico, cat: f.cat, t: f.t.trim(), s: f.s.trim(), cta: f.cta.trim(), marca: f.marca.trim() };
  let ad = null, online = typeof MP !== 'undefined' && !MP.offline && Acc.online && Acc.token;
  if (online) {
    try {
      const r = await fetch('/api/ads/new', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token }, body: JSON.stringify(body) });
      const d = await r.json(); if (!d.ok) { SND.play('err'); return toast('📢 ' + (d.erro || 'Não foi possível publicar.')); }
      ad = d.ad; MU.adsSrv.unshift(ad); MU.adsV = -1;
    } catch (e) { online = false; }
  }
  if (!ad) { ad = Object.assign({}, body, { id: 'l' + Date.now(), nick: G.nome, criado: muNowS(), exp: muNowS() + F.dur }); MU.adsLocal.unshift(ad); localStorage.setItem('pe3d_ads', JSON.stringify(MU.adsLocal)); }
  G.dinheiro -= F.p;
  const mult = { poster: .8, placa: 1, led: 1.3, radio: .9, mega: 1.6 }[f.fmt];
  let txt = `📢 O teu anúncio “${body.t}” está no ar (${F.t}, ${muFmtT(F.dur)}). `;
  if (f.cat === 'negocio' && (G.negocios.length || G.grupo)) { const lucro = Math.round(F.p * (1.1 + Math.random() * 1.2)); txt += `Os clientes apareceram: +${kzShort(lucro)} em vendas! ` + fx({ dinheiro: lucro, fama: Math.round(2 * mult) }); }
  else if (f.cat === 'emprego') txt += `Recebeste ${R(3, 25)} candidaturas! ` + fx({ karma: 2, fama: 1 });
  else if (f.cat === 'venda') { const ok = chance(.45); txt += ok ? `Um comprador ligou e pagou bem! ` + fx({ dinheiro: Math.round(F.p * (.6 + Math.random())), felicidade: 2 }) : `${R(2, 9)} pessoas mostraram interesse. ` + fx({ fama: 1 }); }
  else if (f.cat === 'festa') txt += `A cidade inteira ficou a saber da festa! ` + fx({ felicidade: Math.round(3 * mult), fama: 1 });
  else if (f.cat === 'campanha') txt += `O bairro aplaudiu a iniciativa. ` + fx({ karma: Math.round(3 * mult), fama: 1 });
  else txt += `Toda a gente está a falar de ti! ` + fx({ fama: Math.round(3 * mult) });
  if (!online) txt += ' <i>(modo offline: só tu vês o anúncio)</i>';
  addLog(txt, 'good'); toast(strip(txt)); SND.play('cash');
  MU.boards.forEach(b => b.cur = null); MU.rot++; MU.boards.forEach(b => muDrawBoard(b, performance.now() / 1000, true));
  MU.form.t = ''; MU.form.s = ''; MU.form.cta = ''; panelTab.agencia = 'ar'; save(); refresh(); renderPanel(false);
}
async function muFetchAds() {
  if (location.protocol === 'file:') return;
  try { const r = await fetch('/api/ads'); const d = await r.json(); MU.adsSrv = d.ads || []; MU.adsV = d.v; MU.boards.forEach(b => b.cur = null); } catch (e) { }
}
(function () {
  if (typeof LIVE === 'undefined') return;
  const _on = LIVE.onMp; LIVE.onMp = function (d) { const r = _on.apply(this, arguments); if (d && d.adsV != null && d.adsV !== MU.adsV) { MU.adsV = d.adsV; muFetchAds(); } return r; };
  // spots de rádio dos jogadores nos intervalos
  const _nt = lvNowTxt; lvNowTxt = function (st) {
    const N = _nt.apply(this, arguments);
    if (N.k === 'ad') { const ra = muAdsAll().filter(a => a.fmt === 'radio' || a.fmt === 'mega'); if (ra.length) { const a = ra[(N.g.cycN * 7 + N.g.n) % ra.length]; return Object.assign({}, N, { t: 'Anúncio · ' + (a.marca || a.nick), a: a.t + (a.s ? ' — ' + a.s : '') + (a.cta ? ' · ' + a.cta : '') }); } }
    return N;
  };
  const _hl = lvHeadlines; lvHeadlines = function () { const h = _hl.apply(this, arguments).slice(); muAdsAll().filter(a => a.fmt === 'mega').slice(0, 3).forEach(a => h.push('Publicidade: ' + a.t + (a.s ? ' — ' + a.s : ''))); return h; };
})();
setTimeout(muFetchAds, 2500);
