/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Lógica do jogo (v2)
   ========================================================= */
var IMG = window.IMG || {};
const imgSrc = id => IMG[id] || ('../img/' + id + '.jpg');

const $ = s => document.querySelector(s);
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
const clamp20 = v => Math.max(0, Math.min(20, Math.round(v)));
const kz = n => (n < 0 ? '-' : '') + Math.abs(Math.round(n)).toLocaleString('pt-PT') + ' Kz';
const kzShort = n => {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e9) return s + (a / 1e9).toFixed(1).replace('.0', '') + ' Mil M Kz';
  if (a >= 1e6) return s + (a / 1e6).toFixed(1).replace('.0', '') + ' M Kz';
  if (a >= 1e3) return s + Math.round(a / 1e3) + ' mil Kz';
  return s + Math.round(a) + ' Kz';
};
const numShort = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.0', '') + 'k' : String(Math.round(n));
const strip = s => String(s).replace(/<[^>]+>/g, '');
const oa = (g, m, f) => g === 'F' ? f : m; // concordância de género

const LABEL = { saude: 'Saúde', felicidade: 'Felicidade', inteligencia: 'Inteligência', aparencia: 'Aparência', fama: 'Fama', karma: 'Karma' };
const SHORT = { saude: '❤️', felicidade: '😊', inteligencia: '🧠', aparencia: '✨', fama: '⭐', karma: '☯️' };
const COLOR = { saude: '#2ecc71', felicidade: '#ffcb00', inteligencia: '#3fa9ff', aparencia: '#ff6fb5', fama: '#b77bff', karma: '#ff7a3d' };
const EDU = ['Sem escolaridade', 'Ensino Primário', 'I Ciclo', 'Ensino Médio', 'Licenciatura', 'Mestrado'];

const NOMES_M = ['João', 'António', 'Manuel', 'Paulo', 'Kiala', 'Nzuzi', 'Mateus', 'Adilson', 'Edmilson', 'Ngola', 'Lukeny', 'Délcio', 'Hélder', 'Osvaldo', 'Bento', 'Cristóvão', 'Yuri', 'Nelson', 'Kalunga', 'Mbinda', 'Kiluanje', 'Mukuna', 'Domingos', 'Wilson'];
const NOMES_F = ['Maria', 'Ana', 'Isabel', 'Nzinga', 'Josefa', 'Yola', 'Esperança', 'Domingas', 'Wanda', 'Djamila', 'Teresa', 'Lurdes', 'Kiesse', 'Ndalu', 'Mwanza', 'Suzana', 'Celeste', 'Tchizé', 'Luena', 'Joana', 'Tchissola', 'Feliciana'];
const APELIDOS = ['dos Santos', 'Neto', 'Cassoma', 'Kiala', 'Mbala', 'Sebastião', 'Fernandes', 'Miguel', 'Tchipa', 'Lopes', 'Cardoso', 'Manuel', 'Domingos', 'Kassoma', 'Ngunza', 'Francisco', 'Chivukuvuku', 'Kapapelo', 'Tavares', 'Bumba', 'Gaspar', 'Paulino'];
const ALCUNHAS_M = ['Djodjo', 'Nelo', 'Zé', 'Tonecas', 'Kiko', 'Dudu', 'Txuna', 'Bebito', 'Neco', 'Dady', 'Mister Lu', 'Ndulo'];
const ALCUNHAS_F = ['Tchutchi', 'Bebucha', 'Kiki', 'Mimi', 'Nanda', 'Dina', 'Lulu', 'Yoyo', 'Belinha', 'Zinha', 'Gigi', 'Princesa'];
// pessoas do jogo: só nome próprio ou alcunha — sem sobrenomes
function nomeKamba(g, alc) { return chance(alc == null ? .4 : alc) ? pick(g === 'M' ? ALCUNHAS_M : ALCUNHAS_F) : pick(g === 'M' ? NOMES_M : NOMES_F); }
function semApelido(n) { if (typeof n !== 'string') return n; for (const a of APELIDOS) if (n.endsWith(' ' + a) && n.length > a.length + 1) return n.slice(0, -a.length - 1); return n; }

/* ---------------- PERSONAGENS-BASE (aparência inicial) ---------------- */
const CHARS = [
  { id: 'kiluanje', nome: 'Kiluanje', titulo: 'O Kandengue do Bairro', genero: 'M', estilo: 'Twists e corrente de ouro',
    model: { skin: '#5a3825', shirt: '#c8102e', shirtTex: 'luanda', sleeveColor: '#d8361f', pants: '#2b2a28', shorts: true, socks: '#f2f2f2', shoes: '#c8102e', sole: '#f2f2f2', hair: 'twists', hairColor: '#111', sleeves: 'short', extras: ['chain', 'phone'], build: 1.05 } },
  { id: 'ndalu', nome: 'Ndalu', titulo: 'A Estudante', genero: 'F', estilo: 'Afro puff e óculos',
    model: { fem: true, skin: '#6b4429', shirt: '#f4f1ea', shirtTex: 'blouse', pants: '#6b4429', skirt: ['#8a1424', '#e8a21f', '#f2e6c8', '#1a1a1a'], shoes: '#f2f2f2', sole: '#dcdcdc', hair: 'afropuff', hairColor: '#1a1210', sleeves: 'long', extras: ['glasses', 'books', 'backpack', 'earrings', 'watch'], backpackColor: '#7a4a2a', build: .92 } },
  { id: 'tchissola', nome: 'Tchissola', titulo: 'A Zungueira', genero: 'F', estilo: 'Lenço de pano e argolas',
    model: { fem: true, skin: '#4a2e1c', shirt: '#1d1d1d', shirtTex: 'zungueira', pants: '#4a2e1c', skirt: ['#c8102e', '#ffcb00', '#f2f2f2', '#1a1a1a'], skirtLong: true, shoes: '#7a4a2a', hair: 'wrap', wrap: ['#ffcb00', '#d2122e', '#1a1a1a', '#e86a00'], sleeves: 'short', extras: ['basin', 'earrings'], build: 1.15 } },
  { id: 'mukuna', nome: 'Mukuna', titulo: 'O Candongueiro', genero: 'M', estilo: 'Boné para trás e barba',
    model: { skin: '#4f321f', shirt: '#b9b4aa', shirtTex: 'candongueiro', pants: '#3b5a85', shoes: '#2a2a2a', sole: '#e0e0e0', hair: 'cap', hairColor: '#111', capColor: '#151515', sleeves: 'none', extras: ['beard', 'chainSilver', 'keys', 'watch'], build: 1.08 } },
  { id: 'kiesse', nome: 'Kiesse', titulo: 'A Kudurista', genero: 'F', estilo: 'Tranças coloridas',
    model: { fem: true, skin: '#6a4128', shirt: '#ffcb00', shirtTex: 'kuduro', crop: true, pants: '#151515', pantsStripe: ['#c8102e', '#ffcb00'], baggy: true, shoes: '#c8102e', sole: '#ffcb00', hair: 'braids', hairColor: '#1a1010', braidColors: ['#1a1010', '#c8102e', '#1a1010', '#ffcb00', '#1a1010'], shadesColor: '#ffcb00', sleeves: 'none', extras: ['sunglassesHead', 'earrings', 'chain'], build: .9, dance: true } },
  { id: 'domingos', nome: 'Domingos', titulo: 'O Filho do Kota', genero: 'M', estilo: 'Corte fade e pera',
    model: { skin: '#4d3020', shirt: '#1c2a4a', shirtTex: 'suit', suit: true, pants: '#1c2a4a', shoes: '#120c08', hair: 'fade', hairColor: '#0d0d0d', sleeves: 'long', extras: ['sunglasses', 'watchGold', 'keys', 'goatee'], build: 1.0 } },
  { id: 'kalunga', nome: 'Kalunga', titulo: 'O Pescador da Ilha', genero: 'M', estilo: 'Cabelo curto e barba cheia',
    model: { skin: '#3f281a', shirt: '#d9d2c0', shirtTex: 'ilha', pants: '#5e5a4c', rolled: true, shoes: null, hair: 'short', hairColor: '#5f5c58', sleeves: 'none', extras: ['net', 'fish', 'beardGrey'], build: 1.18 } },
  { id: 'luena', nome: 'Luena', titulo: 'A Basquetebolista', genero: 'F', estilo: 'Fita desportiva, alta',
    model: { fem: true, skin: '#5c3a24', shirt: '#c8102e', shirtTex: 'jersey', pants: '#c8102e', pantsStripe: ['#151515', '#ffcb00'], shorts: true, socks: '#151515', shoes: '#151515', sole: '#f2f2f2', hair: 'band', bandColor: '#151515', hairColor: '#111', sleeves: 'none', extras: ['ball'], build: .95, height: 1.12 } },
];
const SKINS = ['#c68b62', '#a8714d', '#8d5a3b', '#73482e', '#6b4429', '#5c3a24', '#4d3020', '#3f281a', '#2e1d13'];
const HAIRS = [
  { id: 'short', t: 'Curto' }, { id: 'fade', t: 'Fade' }, { id: 'bald', t: 'Careca' }, { id: 'twists', t: 'Twists' },
  { id: 'locs', t: 'Dreads' }, { id: 'afro', t: 'Black Power' }, { id: 'afropuff', t: 'Puff' }, { id: 'bun', t: 'Coque' },
  { id: 'braids', t: 'Tranças' }, { id: 'band', t: 'Fita' }, { id: 'wrap', t: 'Lenço' }, { id: 'cap', t: 'Boné' },
  { id: 'longo', t: 'Liso comprido' }, { id: 'rabo', t: 'Rabo-de-cavalo' }, { id: 'cachos', t: 'Cachos compridos' },
  { id: 'nago', t: 'Tranças nagô' }, { id: 'boxbraids', t: 'Box braids' }, { id: 'bantu', t: 'Bantu knots' }, { id: 'hightop', t: 'High-top' }, { id: 'waves', t: 'Waves 360' },
];
const HAIR_COLORS = [['#0d0d0d', 'Preto'], ['#2a1a12', 'Castanho escuro'], ['#4a2c1c', 'Castanho'], ['#7a4a2a', 'Avelã'], ['#b8862f', 'Mel'], ['#d9b26a', 'Loiro'], ['#6a1424', 'Vinho'], ['#c8102e', 'Vermelho'], ['#3a5fcd', 'Azul'], ['#e6e6e6', 'Platinado']];
const EYES = [['#2b170d', 'Castanho escuro'], ['#4a2a14', 'Castanho'], ['#6b4a22', 'Mel'], ['#8a6a2a', 'Âmbar'], ['#3d5a3a', 'Verde'], ['#3a4f6a', 'Cinza-azulado']];
const BUILDS = [[.9, 'Magro'], [1, 'Normal'], [1.12, 'Forte'], [1.24, 'Cheinho']];
const HEIGHTS = [[.94, 'Baixo'], [1, 'Médio'], [1.06, 'Alto'], [1.12, 'Muito alto']];
const PANTS = ['#2b3a55', '#151515', '#3b5a85', '#5e5a4c', '#e9e2d0', '#6b4a2a', '#c8102e', '#2e8b57'];
const SHOES = ['#f2f2f2', '#151515', '#c8102e', '#1f63c9', '#7a4a2a', '#ffcb00', '#2e8b57'];
const FACE_OPTS = [['beard', '🧔🏿', 'Barba'], ['goatee', '🫦', 'Pera'], ['mustache', '🧔', 'Bigode'], ['stubble', '🧔', 'Barba por fazer'], ['glasses', '👓', 'Óculos'], ['earrings', '💍', 'Brincos'], ['lipstick', '💄', 'Batom']];
/* opções diferentes para cada género */
const GEN = {
  M: { hairs: ['short', 'fade', 'waves', 'bald', 'hightop', 'twists', 'locs', 'nago', 'afro', 'cap'], face: ['beard', 'stubble', 'goatee', 'mustache', 'glasses'],
       builds: ['Magro', 'Normal', 'Atlético', 'Forte'], cima: [['tshirt', 'T-shirt'], ['camisa', 'Camisa'], ['regata', 'Regata']], baixo: [['calcas', 'Calças'], ['calcoes', 'Calções']],
       estampas: ['liso', 'listras', 'logo', 'numero', 'wax', 'xadrez'], acess: ['chain', 'chapeu', 'watch', 'sunglasses', 'backpack', 'gravata', 'pulseiras'] },
  F: { hairs: ['longo', 'cachos', 'rabo', 'afropuff', 'bun', 'braids', 'boxbraids', 'nago', 'bantu', 'afro', 'twists', 'locs', 'wrap', 'band', 'short'], face: ['earrings', 'lipstick', 'glasses'],
       builds: ['Magra', 'Normal', 'Curvas', 'Cheinha'], cima: [['blusa', 'Blusa'], ['manga', 'Manga longa'], ['crop', 'Top curto'], ['vestido', 'Vestido']], baixo: [['calcas', 'Calças'], ['saia', 'Saia de pano'], ['saialonga', 'Saia longa']],
       estampas: ['liso', 'listras', 'flores', 'wax', 'logo', 'animal'], acess: ['bolsa', 'chapeu', 'colar', 'pulseiras', 'watch', 'sunglasses', 'backpack'] },
};
const shadeHex = (h, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(h.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
const nearest = (arr, v) => arr.reduce((b, x) => Math.abs(x[0] - v) < Math.abs(b[0] - v) ? x : b)[0];
function presetFromChar(id, fem) {
  const m = CHARS.find(c => c.id === id).model;
  const rosto = (m.extras || []).map(x => x === 'beardGrey' ? 'beard' : x).filter(x => FACE_X.includes(x));
  if (fem && !rosto.includes('earrings')) rosto.push('earrings');
  return { cabelo: m.hair, corCabelo: !m.hairColor || m.hairColor === '#5f5c58' ? '#0d0d0d' : m.hairColor, rosto, corpo: nearest(BUILDS, m.build || 1), altura: nearest(HEIGHTS, m.height || 1), olhos: EYES[0][0] };
}
const CLOTH = ['#c8102e', '#ffcb00', '#1f63c9', '#2e8b57', '#151515', '#f2f2f2', '#ff7a1a', '#8a4dff', '#14b8a6', '#c2185b', '#6b4a2a', '#7a7a7a'];
const FACE_X = ['glasses', 'beard', 'stubble', 'goatee', 'mustache', 'earrings', 'lipstick'];

/* ---------------- ROUPAS (desbloqueiam com a vida) ---------------- */
const CLOTH_KEYS = ['shirt', 'shirtTex', 'sleeveColor', 'pants', 'shorts', 'socks', 'shoes', 'sole', 'skirt', 'skirtLong', 'crop', 'baggy', 'suit', 'rolled', 'sleeves', 'pantsStripe', 'backpackColor', 'shadesColor'];
const CLOTH_X = ['chain', 'chainSilver', 'phone', 'books', 'backpack', 'basin', 'net', 'fish', 'ball', 'keys', 'watch', 'watchGold', 'sunglasses', 'sunglassesHead', 'colar', 'gravata', 'chapeu', 'pulseiras', 'bolsa'];
const ACESS_LBL = { chain: 'Corrente', chapeu: 'Chapéu', watch: 'Relógio', sunglasses: 'Óculos de sol', backpack: 'Mochila', gravata: 'Gravata', pulseiras: 'Pulseiras', bolsa: 'Mala de mão', colar: 'Colar' };
const CIMA_T = { tshirt: 'T-shirt', camisa: 'Camisa', regata: 'Regata', blusa: 'Blusa', manga: 'Blusa de manga longa', crop: 'Top curto', vestido: 'Vestido' };
const fromChar = id => { const m = CHARS.find(c => c.id === id).model, o = {}; CLOTH_KEYS.forEach(k => { if (m[k] !== undefined) o[k] = m[k]; }); o.extras = (m.extras || []).filter(x => CLOTH_X.includes(x)); return o; };
const OUTFITS = {
  bebe:      { t: 'Roupinha de bebé', ico: '🍼', kid: true, spec: c => ({ shirt: c, pants: c, shorts: true, sleeves: 'short', shoes: null }) },
  crianca:   { t: 'Roupa de criança', ico: '🧒', kid: true, spec: c => ({ shirt: c, pants: '#2b3a55', shorts: true, sleeves: 'short', shoes: '#f2f2f2', sole: '#ccc' }) },
  bata:      { t: 'Bata escolar', ico: '🥼', kid: true, how: 'Vai à escola', spec: c => ({ shirt: '#f6f6f6', shirtTex: 'bata', sleeveColor: '#f6f6f6', sleeves: 'long', pants: '#1f2f50', shoes: '#151515', extras: ['backpack'], backpackColor: c }) },
  casual:    { t: 'Casual', ico: '👕', kid: true, spec: c => ({ shirt: c, pants: '#2b3a55', sleeves: 'short', shoes: '#f2f2f2', sole: '#ccc' }) },
  luanda:    { t: 'T-shirt "Luanda Musseque"', ico: '🌴', char: 'kiluanje', how: 'Chega à adolescência (13 anos)', spec: () => fromChar('kiluanje') },
  estudante: { t: 'Look Universitário', ico: '🎓', char: 'ndalu', how: 'Entra na universidade', spec: () => fromChar('ndalu') },
  zungueira: { t: 'Pano & Bacia de Zungueira', ico: '🧺', char: 'tchissola', how: 'Trabalha a zungar ou abre uma banca', spec: () => fromChar('tchissola') },
  candongueiro: { t: 'Camisola de Candongueiro', ico: '🚐', char: 'mukuna', how: 'Trabalha num candongueiro ou compra uma carrinha', spec: () => fromChar('mukuna') },
  kuduro:    { t: 'Fato de Kuduro', ico: '🎤', char: 'kiesse', how: 'Fama 40+ ou carreira na música / redes', spec: () => fromChar('kiesse') },
  executivo: { t: 'Fato Executivo', ico: '👔', char: 'domingos', how: 'Cargo de escritório ou compra na Loja (Mercado)', spec: () => fromChar('domingos') },
  pescador:  { t: 'Roupa de Pescador', ico: '🎣', char: 'kalunga', how: 'Trabalha como pescador', spec: () => fromChar('kalunga') },
  atleta:    { t: 'Equipamento ANGOLA 7', ico: '🏀', char: 'luena', how: 'Torna-te atleta profissional', spec: () => fromChar('luena') },
  medico:    { t: 'Bata de Saúde', ico: '🩺', how: 'Trabalha na saúde', spec: () => ({ shirt: '#f4f6f8', shirtTex: 'medico', sleeveColor: '#f4f6f8', sleeves: 'long', pants: '#e9eef2', shoes: '#f2f2f2', sole: '#ccc', extras: ['watch'] }) },
  policia:   { t: 'Farda da Polícia Nacional', ico: '👮', how: 'Entra na Polícia ou nas FAA', spec: () => ({ shirt: '#22385f', shirtTex: 'policia', sleeveColor: '#22385f', sleeves: 'short', pants: '#1b2b48', shoes: '#0d0d0d', extras: ['watch'], policeCap: true }) },
};
const SHOP_OUTFITS = { luanda: 25000, estudante: 60000, zungueira: 18000, candongueiro: 35000, pescador: 22000, atleta: 120000, kuduro: 180000, executivo: 450000 };

function avatarCfg(av, outfit, age, opt = {}) {
  const base = (CHARS.find(c => c.id === av.base) || CHARS[0]).model;
  const fem = av.genero === 'F';
  const O = OUTFITS[outfit] || OUTFITS.casual;
  const cl = O.spec(av.roupa || '#c8102e');
  const cfg = Object.assign({}, cl, { skin: av.pele || base.skin, fem, hair: base.hair, hairColor: base.hairColor === '#5f5c58' ? '#141414' : base.hairColor,
    braidColors: base.braidColors, wrap: base.wrap, capColor: base.capColor, bandColor: base.bandColor, build: base.build, height: base.height || 1 });
  if (cfg.hair === 'braids' && !cfg.braidColors) cfg.braidColors = ['#1a1010'];
  if (cfg.hair === 'wrap' && !cfg.wrap) cfg.wrap = ['#ffcb00', '#d2122e', '#1a1a1a', '#e86a00'];
  if (av.cabelo && av.cabelo !== base.hair) {
    cfg.hair = av.cabelo;
    if (cfg.hair === 'braids') cfg.braidColors = null;
    if (cfg.hair === 'wrap') cfg.wrap = [av.roupa || '#c8102e', '#ffcb00', '#1a1a1a', '#f2f2f2'];
    if (cfg.hair === 'cap') cfg.capColor = av.roupa === '#151515' ? '#c8102e' : (av.roupa || '#151515');
    if (cfg.hair === 'band' || cfg.hair === 'bun') cfg.bandColor = av.roupa || '#151515';
  }
  if (av.corCabelo) { cfg.hairColor = av.corCabelo; if (cfg.hair === 'braids' && (!cfg.braidColors || av.cabelo)) cfg.braidColors = av.corCabelo === base.hairColor && base.braidColors ? base.braidColors : [av.corCabelo, shadeHex(av.corCabelo, .75)]; }
  if (cfg.hair === 'braids' && !cfg.braidColors) cfg.braidColors = ['#1a1010'];
  if (av.olhos) cfg.eyes = av.olhos;
  cfg.face = { s: av.cara | 0, e: av.olhar | 0, n: av.nariz == null ? 1 : av.nariz | 0, l: av.labios == null ? 1 : av.labios | 0, b: av.sobr | 0 };
  if (av.corpo) cfg.build = av.corpo;
  if (av.altura) cfg.height = av.altura;
  if (fem) cfg.height = (cfg.height || 1) * .97;
  if (av.calcas && (outfit === 'casual' || outfit === 'crianca')) cfg.pants = av.calcas;
  if (av.sapatos && cfg.shoes && (outfit === 'casual' || outfit === 'crianca')) { cfg.shoes = av.sapatos; cfg.sole = av.sapatos === '#f2f2f2' ? '#ccc' : '#f2f2f2'; }
  let face = Array.isArray(av.rosto) ? av.rosto.filter(x => FACE_X.includes(x)) : (base.extras || []).map(x => x === 'beardGrey' ? 'beard' : x).filter(x => FACE_X.includes(x));
  if (fem) { face = face.filter(x => !['beard', 'goatee', 'mustache', 'stubble'].includes(x)); if (!Array.isArray(av.rosto) && !face.includes('earrings')) face.push('earrings'); }
  else face = face.filter(x => x !== 'lipstick');
  if (age < 18) face = face.filter(x => !['beard', 'goatee', 'mustache'].includes(x)); if (age < 15) face = face.filter(x => x !== 'stubble');
  if (age < 15) face = face.filter(x => x !== 'lipstick');
  /* peças do dia-a-dia escolhidas no criador */
  if (outfit === 'casual' || (outfit === 'crianca' && fem)) {
    const c = av.cima, b = av.baixo;
    if (c === 'camisa' || c === 'manga') cfg.sleeves = 'long';
    else if (c === 'regata') cfg.sleeves = 'none';
    else if (c === 'crop' && age >= 13) { cfg.crop = true; cfg.sleeves = 'none'; }
    if (c === 'camisa') cfg.collar = true;
    if (b === 'calcoes') cfg.shorts = true;
    if (fem && (b === 'saia' || b === 'saialonga')) { cfg.skirt = [av.calcas || '#c8102e', av.roupa || '#ffcb00', '#f2f2f2', '#1a1a1a']; cfg.skirtLong = b === 'saialonga'; cfg.shorts = false; }
    if (fem && c === 'vestido') { cfg.dress = true; cfg.skirt = [av.roupa || '#c8102e', '#ffcb00', '#f2f2f2', '#1a1a1a']; cfg.skirtLong = b === 'saialonga'; cfg.shorts = false; cfg.sleeves = 'none'; cfg.crop = false; }
    const G3 = GEN[fem ? 'F' : 'M'];
    cfg.print = G3.estampas.includes(av.estampa) ? av.estampa : 'liso';
    cfg.lookTop = CIMA_T[c] || (fem ? 'Blusa' : 'T-shirt');
    if (fem && age >= 16 && (cfg.dress || cfg.skirt) && cfg.shoes) cfg.heels = true;
  } else cfg.lookTop = O.t;
  let acc = Array.isArray(av.acess) ? av.acess.filter(x => (GEN[fem ? 'F' : 'M'].acess || []).includes(x)) : [];
  if (outfit === 'policia' || outfit === 'medico') acc = acc.filter(x => !['chapeu', 'bolsa', 'gravata', 'sunglasses'].includes(x));
  if (age < 13) acc = acc.filter(x => ['watch', 'backpack', 'pulseiras'].includes(x));
  if (acc.includes('gravata') && !cfg.collar && outfit === 'casual') cfg.collar = true;
  if (acc.includes('chapeu')) cfg.hatColor = fem ? (av.roupa === '#f2f2f2' ? '#d9b26a' : '#efe2c4') : (av.calcas === '#151515' ? '#5e5a4c' : '#2a2a2e');
  if (acc.includes('bolsa')) cfg.bagColor = av.calcas && av.calcas !== '#e9e2d0' ? shadeHex(av.calcas, .9) : '#7a2a3a';
  cfg.extras = [...new Set([...(cl.extras || []), ...face, ...acc])];
  if (!fem && cfg.skirt) { delete cfg.skirt; delete cfg.skirtLong; cfg.pants = cfg.pants && cfg.pants !== cfg.skin ? cfg.pants : '#2b2a28'; }
  if (fem && cfg.skirt) cfg.pants = cfg.skin;
  if (!fem && cfg.crop) cfg.crop = false;
  if (outfit === 'zungueira' && !fem) cfg.extras = cfg.extras.filter(x => x !== 'earrings');
  if (age < 13) cfg.extras = cfg.extras.filter(x => !['chain', 'chainSilver', 'keys', 'watchGold', 'sunglasses', 'basin', 'net'].includes(x));
  if (age >= 55) { cfg.hairColor = age >= 70 ? '#e6e6e6' : '#8a8a8a'; if (cfg.braidColors) cfg.braidColors = cfg.braidColors.map((b, i) => i % 2 ? '#bbb' : b); if (cfg.extras.includes('beard')) cfg.extras = cfg.extras.map(x => x === 'beard' ? 'beardGrey' : x); }
  if (cfg.policeCap) { cfg.hair = 'cap'; cfg.capColor = '#1b2b48'; cfg.capFront = true; }
  cfg.age = age;
  /* acabamentos v5: salão/tatuador e corpo que muda com a vida */
  if (av.corBarba) cfg.beardColor = av.corBarba;
  if (age >= 16 && Array.isArray(av.tats)) cfg.tats = av.tats.slice(0, 4);
  if (fem && av.unhas && age >= 13) cfg.nails = av.unhas;
  if (fem && av.sombra && age >= 15) cfg.shadowColor = av.sombra;
  if (fem && av.delineado && age >= 15) cfg.eyeliner = true;
  if (age >= 13) { cfg.musc = Math.max(0, Math.min(1, av.musc || 0)); cfg.fat = Math.max(0, Math.min(1, av.gord || 0)); }
  cfg.hq = 1;
  return cfg;
}

/* ---------------- NASCIMENTO ---------------- */
/* As 21 províncias de Angola (divisão em vigor desde 2025).
   custo = preço das casas e da vida · sal = salários · ricas >= 0.9, médias >= 0.75, pobres < 0.75 */
const PROVINCIAS = [
  { n: 'Luanda', cap: 'Luanda', m: ['Ingombota', 'Maianga', 'Rangel', 'Sambizanga', 'Cazenga', 'Kilamba Kiaxi', 'Talatona', 'Viana', 'Belas', 'Cacuaco', 'Camama'], w: 32, custo: 1, sal: 1, mar: true, eco: 'Capital, petróleo, bancos e serviços' },
  { n: 'Cabinda', cap: 'Cabinda', m: ['Cabinda', 'Cacongo', 'Belize', 'Buco-Zau'], w: 3, custo: .95, sal: 1, mar: true, eco: 'Petróleo offshore' },
  { n: 'Zaire', cap: 'Mbanza Kongo', m: ['Mbanza Kongo', 'Soyo', 'Nzeto'], w: 3, custo: .9, sal: .95, mar: true, eco: 'Petróleo e gás no Soyo' },
  { n: 'Benguela', cap: 'Benguela', m: ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta'], w: 10, custo: .86, sal: .88, mar: true, eco: 'Porto do Lobito, pesca e comércio' },
  { n: 'Ícolo e Bengo', cap: 'Catete', m: ['Catete', 'Calumbo', 'Cabiri', 'Quiçama', 'Cabo Ledo', 'Bom Jesus'], w: 5, custo: .85, sal: .84, mar: true, eco: 'Agricultura, turismo e novas centralidades' },
  { n: 'Lunda Norte', cap: 'Dundo', m: ['Dundo', 'Lucapa', 'Cuango'], w: 6, custo: .82, sal: .88, eco: 'Diamantes' },
  { n: 'Huíla', cap: 'Lubango', m: ['Lubango', 'Matala', 'Chibia', 'Caconda'], w: 12, custo: .8, sal: .82, eco: 'Agricultura, gado e universidades' },
  { n: 'Namibe', cap: 'Moçâmedes', m: ['Moçâmedes', 'Tômbwa', 'Bibala'], w: 3, custo: .8, sal: .8, mar: true, eco: 'Pesca, deserto e turismo' },
  { n: 'Bengo', cap: 'Caxito', m: ['Caxito', 'Ambriz', 'Nambuangongo', 'Pango Aluquém'], w: 3, custo: .78, sal: .76, mar: true, eco: 'Agricultura e pesca' },
  { n: 'Lunda Sul', cap: 'Saurimo', m: ['Saurimo', 'Muconda', 'Dala'], w: 3, custo: .76, sal: .8, eco: 'Diamantes e comércio' },
  { n: 'Huambo', cap: 'Huambo', m: ['Huambo', 'Caála', 'Bailundo', 'Londuimbali'], w: 10, custo: .75, sal: .78, eco: 'Agricultura e indústria' },
  { n: 'Cuanza Sul', cap: 'Sumbe', m: ['Sumbe', 'Porto Amboim', 'Gabela', 'Waku Kungo'], w: 9, custo: .72, sal: .74, mar: true, eco: 'Café, agricultura e pesca' },
  { n: 'Malanje', cap: 'Malanje', m: ['Malanje', 'Cacuso', 'Calandula'], w: 5, custo: .68, sal: .72, eco: 'Agricultura e as Quedas de Kalandula' },
  { n: 'Uíge', cap: 'Uíge', m: ['Uíge', 'Negage', 'Maquela do Zombo'], w: 7, custo: .66, sal: .7, eco: 'Café e comércio com o Congo' },
  { n: 'Cuanza Norte', cap: 'Ndalatando', m: ['Ndalatando', 'Cambambe', 'Golungo Alto'], w: 3, custo: .66, sal: .7, eco: 'Barragens e café' },
  { n: 'Cunene', cap: 'Ondjiva', m: ['Ondjiva', 'Cahama', 'Xangongo', 'Curoca'], w: 7, custo: .64, sal: .68, eco: 'Gado e comércio com a Namíbia' },
  { n: 'Bié', cap: 'Cuíto', m: ['Cuíto', 'Camacupa', 'Andulo', 'Chinguar'], w: 8, custo: .62, sal: .66, eco: 'Agricultura' },
  { n: 'Moxico', cap: 'Luena', m: ['Luena', 'Camanongue', 'Léua'], w: 2, custo: .62, sal: .68, eco: 'Agricultura e caminho de ferro' },
  { n: 'Cubango', cap: 'Menongue', m: ['Menongue', 'Cuchi', 'Cuangar'], w: 2, custo: .6, sal: .66, eco: 'Agricultura e rios' },
  { n: 'Moxico Leste', cap: 'Cazombo', m: ['Cazombo', 'Luau', 'Luacano'], w: 2, custo: .58, sal: .64, eco: 'Fronteira e caminho de ferro' },
  { n: 'Cuando', cap: 'Mavinga', m: ['Mavinga', 'Rivungo'], w: 1, custo: .55, sal: .6, eco: 'Parques naturais e fauna' },
];
const CLASSES = [
  { id: 'pobre', t: 'Família muito pobre', ico: '🏚️', w: 30, casa: 'Casa de chapa no musseque', mesada: [0, 15000], heranca: [0, 300000], profs: ['Zungueira', 'Desempregado', 'Lavador de carros', 'Camponês', 'Pedreiro'], stat: { saude: -6, aparencia: -4 } },
  { id: 'humilde', t: 'Família humilde', ico: '🏠', w: 38, casa: 'Casa de blocos no bairro', mesada: [10000, 40000], heranca: [200000, 1500000], profs: ['Taxista', 'Segurança', 'Vendedora no mercado', 'Mecânico', 'Cabeleireira'], stat: {} },
  { id: 'media', t: 'Família de classe média', ico: '🏢', w: 22, casa: 'Apartamento na cidade', mesada: [40000, 120000], heranca: [1500000, 12000000], profs: ['Professora', 'Enfermeiro', 'Funcionária pública', 'Polícia', 'Bancário'], stat: { inteligencia: 4 } },
  { id: 'rica', t: 'Família rica', ico: '🏡', w: 8, casa: 'Vivenda com quintal e gerador', mesada: [250000, 900000], heranca: [30000000, 150000000], profs: ['Médica', 'Engenheiro petrolífero', 'Empresário', 'Advogada', 'Diretor de banco'], stat: { saude: 5, aparencia: 5, inteligencia: 5, karma: -4 } },
  { id: 'elite', t: 'Família da elite', ico: '🏰', w: 2, casa: 'Mansão com piscina em Talatona', mesada: [1500000, 5000000], heranca: [300000000, 1500000000], profs: ['General', 'Ministra', 'Magnata do petróleo', 'Deputado', 'Empresária de diamantes'], stat: { saude: 8, aparencia: 8, inteligencia: 6, fama: 10, karma: -8 } },
];
const TALENTOS = [
  { id: 'estudo', t: 'Cabeça boa', ico: '🧠', d: 'Aprende depressa: estudar rende mais.' },
  { id: 'desporto', t: 'Atleta nato', ico: '🏃', d: 'Treinar dá mais saúde e abre o desporto profissional.' },
  { id: 'arte', t: 'Artista', ico: '🎤', d: 'Dança, música e redes sociais rendem fama a dobrar.' },
  { id: 'negocio', t: 'Faro para negócio', ico: '💼', d: 'Negócios e biscates rendem +35%.' },
  { id: 'labia', t: 'Lábia', ico: '😏', d: 'Entrevistas, namoro e cunhas correm melhor.' },
  { id: 'saude', t: 'Saúde de ferro', ico: '💪', d: 'Adoece menos e vive mais.' },
];
const talento = id => G && G.talento === id;

/* ---------------- ESCOLA / UNIVERSIDADE ---------------- */
const AREAS = [
  { id: 'cfb', t: 'Ciências Físicas e Biológicas', ico: '🔬', d: 'Abre: Medicina, Engenharias, Arquitetura, Enfermagem', anos: 3 },
  { id: 'cej', t: 'Ciências Económicas e Jurídicas', ico: '⚖️', d: 'Abre: Economia, Gestão, Direito', anos: 3 },
  { id: 'hum', t: 'Ciências Humanas', ico: '📖', d: 'Abre: Comunicação, Educação, Psicologia, Direito', anos: 3 },
  { id: 'info', t: 'Técnico Médio de Informática', ico: '💻', d: 'Profissão técnica + Engenharia Informática', anos: 4 },
  { id: 'saude', t: 'Técnico Médio de Saúde', ico: '🩺', d: 'Profissão técnica + Enfermagem', anos: 4 },
];
const CURSOS = [
  { id: 'medicina', t: 'Medicina', ico: '⚕️', anos: 6, area: ['cfb'], dif: .18 },
  { id: 'enfermagem', t: 'Enfermagem', ico: '💉', anos: 4, area: ['cfb', 'saude'], dif: 0 },
  { id: 'petroleos', t: 'Engenharia de Petróleos', ico: '🛢️', anos: 5, area: ['cfb'], dif: .14 },
  { id: 'civil', t: 'Engenharia Civil', ico: '🏗️', anos: 5, area: ['cfb'], dif: .06 },
  { id: 'informatica', t: 'Engenharia Informática', ico: '💻', anos: 5, area: ['cfb', 'info'], dif: .05 },
  { id: 'arquitetura', t: 'Arquitetura', ico: '📐', anos: 5, area: ['cfb'], dif: .05 },
  { id: 'direito', t: 'Direito', ico: '⚖️', anos: 5, area: ['cej', 'hum'], dif: .08 },
  { id: 'economia', t: 'Economia', ico: '📊', anos: 4, area: ['cej'], dif: .04 },
  { id: 'gestao', t: 'Gestão de Empresas', ico: '🗂️', anos: 4, area: ['cej'], dif: 0 },
  { id: 'comunicacao', t: 'Comunicação Social', ico: '🎙️', anos: 4, area: ['hum'], dif: 0 },
  { id: 'educacao', t: 'Ciências da Educação', ico: '🧑‍🏫', anos: 4, area: ['hum'], dif: -.06 },
  { id: 'psicologia', t: 'Psicologia', ico: '🧠', anos: 4, area: ['hum'], dif: 0 },
];
const PROP_PUB = 60000, PROP_PRIV = 1800000;
const TECNICOS = [
  { id: 'mecanica', t: 'Mecânica Auto', ico: '🔧', custo: 90000 },
  { id: 'eletricidade', t: 'Eletricidade', ico: '⚡', custo: 90000 },
  { id: 'cabeleireiro', t: 'Cabeleireiro & Estética', ico: '💇', custo: 70000 },
  { id: 'culinaria', t: 'Culinária', ico: '🍲', custo: 80000 },
  { id: 'costura', t: 'Corte & Costura', ico: '🧵', custo: 60000 },
];

/* ---------------- EMPREGOS ---------------- */
const LVL = ['Júnior', 'Pleno', 'Sénior', 'Chefe', 'Diretor(a)'], LVL_M = [1, 1.35, 1.8, 2.5, 3.6, 5.2];
const JOBS = [
  // Informal
  { id: 'zungueiro', t: 'Zungueiro(a)', ico: '🧺', cat: 'Informal', sal: 720000, req: { idade: 14 }, outfit: 'zungueira', informal: true },
  { id: 'lavador', t: 'Lavador(a) de Carros', ico: '🚿', cat: 'Informal', sal: 600000, req: { idade: 14 }, informal: true },
  { id: 'ajudante', t: 'Ajudante de Pedreiro', ico: '🧱', cat: 'Informal', sal: 900000, req: { idade: 16, saude: 50 }, informal: true },
  { id: 'cobrador', t: 'Cobrador(a) de Candongueiro', ico: '📣', cat: 'Informal', sal: 960000, req: { idade: 16 }, outfit: 'candongueiro', informal: true },
  { id: 'pescador', t: 'Pescador(a)', ico: '🎣', cat: 'Informal', sal: 1000000, req: { idade: 16, mar: true }, outfit: 'pescador', informal: true },
  { id: 'empregado', t: 'Empregado(a) de Mesa', ico: '🍽️', cat: 'Part-time', sal: 900000, req: { idade: 16 }, part: true },
  { id: 'explicador', t: 'Explicador(a)', ico: '✏️', cat: 'Part-time', sal: 650000, req: { idade: 16, inteligencia: 60 }, part: true },
  { id: 'kupapata', t: 'Mototaxista (Kupapata)', ico: '🏍️', cat: 'Informal', sal: 1300000, req: { idade: 18, carta: true, bem: 'moto' }, informal: true },
  { id: 'taxista', t: 'Taxista de Candongueiro', ico: '🚐', cat: 'Informal', sal: 1800000, req: { idade: 21, carta: true }, outfit: 'candongueiro', informal: true },
  { id: 'seguranca', t: 'Segurança Privado', ico: '🛡️', cat: 'Técnico', sal: 1200000, req: { idade: 18, saude: 55 } },
  // Técnicos
  { id: 'mecanico', t: 'Mecânico(a) Auto', ico: '🔧', cat: 'Técnico', sal: 1800000, req: { idade: 17, tecnico: 'mecanica' } },
  { id: 'eletricista', t: 'Eletricista', ico: '⚡', cat: 'Técnico', sal: 1900000, req: { idade: 17, tecnico: 'eletricidade' } },
  { id: 'cabeleireiro', t: 'Cabeleireiro(a)', ico: '💇', cat: 'Técnico', sal: 1400000, req: { idade: 16, tecnico: 'cabeleireiro' } },
  { id: 'cozinheiro', t: 'Cozinheiro(a)', ico: '🍲', cat: 'Técnico', sal: 1500000, req: { idade: 17, tecnico: 'culinaria' } },
  { id: 'costureiro', t: 'Costureiro(a)', ico: '🧵', cat: 'Técnico', sal: 1200000, req: { idade: 16, tecnico: 'costura' } },
  // Ensino médio
  { id: 'caixa', t: 'Operador(a) de Caixa', ico: '🧾', cat: 'Ensino Médio', sal: 1500000, req: { idade: 18, edu: 3 }, niv: ['Operador(a)', 'Supervisor(a)', 'Gerente de Loja'] },
  { id: 'professor', t: 'Professor(a) Primário', ico: '🧑‍🏫', cat: 'Ensino Médio', sal: 2400000, req: { idade: 18, edu: 3 }, niv: ['Professor(a)', 'Coordenador(a)', 'Diretor(a) de Escola'] },
  { id: 'policia', t: 'Polícia Nacional', ico: '👮', cat: 'Ensino Médio', sal: 2800000, req: { idade: 18, edu: 3, saude: 60, limpo: true }, outfit: 'policia', niv: ['Agente', 'Subinspetor(a)', 'Inspetor(a)', 'Superintendente', 'Comissário(a)'] },
  { id: 'militar', t: 'Militar das FAA', ico: '🎖️', cat: 'Ensino Médio', sal: 2600000, req: { idade: 18, edu: 3, saude: 65, limpo: true }, outfit: 'policia', niv: ['Soldado', 'Sargento', 'Tenente', 'Capitão', 'Coronel', 'General'] },
  { id: 'tecsaude', t: 'Técnico(a) de Enfermagem', ico: '🩹', cat: 'Ensino Médio', sal: 2600000, req: { idade: 18, area: 'saude' }, outfit: 'medico' },
  { id: 'tecinfo', t: 'Técnico(a) de Informática', ico: '🖥️', cat: 'Ensino Médio', sal: 2400000, req: { idade: 18, area: 'info' } },
  { id: 'funcionario', t: 'Funcionário(a) Público', ico: '🗂️', cat: 'Ensino Médio', sal: 3000000, req: { idade: 20, edu: 3 }, outfit: 'executivo' },
  // Superior
  { id: 'medico', t: 'Médico(a)', ico: '👩‍⚕️', cat: 'Superior', sal: 9600000, req: { curso: 'medicina' }, outfit: 'medico', niv: ['Médico(a) Interno(a)', 'Clínico(a) Geral', 'Especialista', 'Chefe de Serviço', 'Diretor(a) Clínico(a)'] },
  { id: 'enfermeiro', t: 'Enfermeiro(a)', ico: '🩺', cat: 'Superior', sal: 3800000, req: { curso: 'enfermagem' }, outfit: 'medico', niv: ['Enfermeiro(a)', 'Enfermeiro(a) Especialista', 'Enfermeiro(a)-Chefe'] },
  { id: 'advogado', t: 'Advogado(a)', ico: '⚖️', cat: 'Superior', sal: 6000000, req: { curso: 'direito' }, outfit: 'executivo', niv: ['Advogado(a) Estagiário(a)', 'Advogado(a)', 'Advogado(a) Sénior', 'Sócio(a)'] },
  { id: 'juiz', t: 'Juiz(a)', ico: '👨‍⚖️', cat: 'Superior', sal: 14000000, req: { curso: 'direito', idade: 30, mestrado: true, limpo: true }, outfit: 'executivo', niv: ['Juiz(a) de Direito', 'Juiz(a) Desembargador(a)', 'Juiz(a) Conselheiro(a)'] },
  { id: 'bancario', t: 'Bancário(a)', ico: '🏦', cat: 'Superior', sal: 6000000, req: { curso: ['economia', 'gestao'] }, outfit: 'executivo', niv: ['Assistente', 'Gestor(a) de Conta', 'Gerente de Balcão', 'Diretor(a)', 'Administrador(a)'] },
  { id: 'contabilista', t: 'Contabilista', ico: '🧮', cat: 'Superior', sal: 4800000, req: { curso: ['economia', 'gestao'] }, outfit: 'executivo' },
  { id: 'engpetro', t: 'Engenheiro(a) Petrolífero', ico: '🛢️', cat: 'Superior', sal: 18000000, req: { curso: 'petroleos', inteligencia: 60 }, niv: ['Engenheiro(a) Júnior', 'Engenheiro(a)', 'Engenheiro(a) Sénior', 'Gestor(a) de Campo', 'Diretor(a) de Operações'] },
  { id: 'engcivil', t: 'Engenheiro(a) Civil', ico: '🏗️', cat: 'Superior', sal: 8400000, req: { curso: ['civil', 'arquitetura'] } },
  { id: 'arquiteto', t: 'Arquiteto(a)', ico: '📐', cat: 'Superior', sal: 7200000, req: { curso: 'arquitetura' }, outfit: 'executivo' },
  { id: 'programador', t: 'Programador(a)', ico: '💻', cat: 'Superior', sal: 6000000, req: { curso: 'informatica' }, niv: ['Programador(a) Júnior', 'Programador(a)', 'Sénior', 'Tech Lead', 'CTO'] },
  { id: 'jornalista', t: 'Jornalista', ico: '🎙️', cat: 'Superior', sal: 4200000, req: { curso: 'comunicacao' }, niv: ['Repórter', 'Jornalista', 'Editor(a)', 'Diretor(a) de Informação'] },
  { id: 'profsec', t: 'Professor(a) do Ensino Médio', ico: '📚', cat: 'Superior', sal: 3600000, req: { curso: 'educacao' } },
  { id: 'psicologo', t: 'Psicólogo(a)', ico: '🛋️', cat: 'Superior', sal: 4200000, req: { curso: 'psicologia' } },
  // Arte & desporto
  { id: 'kudurista', t: 'Artista de Kuduro', ico: '🎤', cat: 'Arte & Desporto', sal: 0, varFama: true, req: { idade: 16, fama: 25, aparencia: 50 }, outfit: 'kuduro' },
  { id: 'influencer', t: 'Influenciador(a) Digital', ico: '📸', cat: 'Arte & Desporto', sal: 0, varSeg: true, req: { idade: 16, seguidores: 50000 }, outfit: 'kuduro', part: true },
  { id: 'basquete', t: 'Basquetebolista Profissional', ico: '🏀', cat: 'Arte & Desporto', sal: 8000000, req: { saude: 80, maxIdade: 30, treinos: 6 }, outfit: 'atleta', niv: ['Suplente', 'Titular', 'Estrela', 'Capitão(ã) da Seleção'] },
  { id: 'futebol', t: 'Futebolista da Liga Mwangolé', ico: '⚽', cat: 'Arte & Desporto', sal: 6000000, req: { saude: 80, maxIdade: 30, treinos: 6 }, outfit: 'atleta', niv: ['Suplente', 'Titular', 'Craque', 'Palanca Negra'] },
  // Digital
  { id: 'estafeta', t: 'Estafeta de Entregas (Txova)', ico: '🛵', cat: 'Digital', sal: 900000, req: { idade: 18, bem: ['moto', 'bike'], tel: 2 }, informal: true, part: true },
  { id: 'yango', t: 'Motorista Kandonga', ico: '🚕', cat: 'Digital', sal: 2600000, req: { idade: 21, carta: true, bem: ['carro', 'carroel', 'carronovo', 'jeep'], tel: 2 }, informal: true },
  { id: 'freelancer', t: 'Freelancer Digital (design & web)', ico: '🧑‍💻', cat: 'Digital', sal: 2200000, req: { idade: 16, bem: 'portatil', inteligencia: 60 }, part: true },
  { id: 'gestorredes', t: 'Gestor(a) de Redes Sociais', ico: '📲', cat: 'Digital', sal: 3200000, req: { idade: 18, bem: 'portatil', seguidores: 5000 }, outfit: 'executivo' },
  { id: 'devapps', t: 'Desenvolvedor(a) de Apps', ico: '📱', cat: 'Digital', sal: 8000000, req: { curso: 'informatica', bem: 'portatil' }, niv: ['Dev Júnior', 'Dev', 'Dev Sénior', 'Head of Mobile', 'CTO'] },
  { id: 'dados', t: 'Cientista de Dados / IA', ico: '🤖', cat: 'Digital', sal: 11000000, req: { curso: ['informatica', 'economia'], mestrado: true, inteligencia: 70 }, niv: ['Analista', 'Cientista de Dados', 'Lead de IA', 'Diretor(a) de IA'] },
  // Política
  { id: 'deputado', t: 'Deputado(a) da Assembleia', ico: '🏛️', cat: 'Política', sal: 30000000, req: { idade: 30, edu: 4, fama: 50, inteligencia: 60, limpo: true }, outfit: 'executivo', niv: ['Deputado(a)', 'Presidente de Comissão', 'Ministro(a)'] },
];
const job = id => JOBS.find(j => j.id === id);

/* ---------------- CASAS, BENS, NEGÓCIOS ---------------- */
const CASAS = [
  { id: 'quarto', t: 'Quarto no musseque', ico: '🛏️', renda: 240000, preco: 0, conforto: -5, z: 'musseque' },
  { id: 'chapa', t: 'Casa de chapa no musseque', ico: '🏚️', renda: 360000, preco: 7000000, conforto: -2, z: 'musseque' },
  { id: 'zango', t: 'Apartamento T2 no Zango', ico: '🏬', renda: 600000, preco: 10000000, conforto: 1, z: 'zango' },
  { id: 't2', t: 'Casa T2 no bairro', ico: '🏠', renda: 960000, preco: 15000000, conforto: 3, z: 'bairro' },
  { id: 'kilamba', t: 'Apartamento T3 no Kilamba', ico: '🏢', renda: 2400000, preco: 52500000, conforto: 8, z: 'kilamba' },
  { id: 'vivenda', t: 'Vivenda em Talatona', ico: '🏡', renda: 9600000, preco: 250000000, conforto: 15, z: 'talatona' },
  { id: 'mansao', t: 'Mansão no Miramar', ico: '🏰', renda: 30000000, preco: 800000000, conforto: 22, z: 'miramar' },
];
/* Centro Habitacional: todas as casas na mesma avenida, do bairro pobre ao bairro rico */
const ZONAS_CASA = [
  { id: 'musseque', t: 'Musseque do Cazenga', nivel: 'Bairro pobre', cor: '#a3482a', ico: '🏚️' },
  { id: 'zango', t: 'Zango', nivel: 'Cidade barata', cor: '#e8b923', ico: '🏬' },
  { id: 'bairro', t: 'Bairro Popular', nivel: 'Bairro médio', cor: '#f0a04b', ico: '🏠' },
  { id: 'kilamba', t: 'Centralidade do Kilamba', nivel: 'Cidade média', cor: '#3fa9d8', ico: '🏢' },
  { id: 'talatona', t: 'Talatona', nivel: 'Cidade cara', cor: '#2e8b57', ico: '🏡' },
  { id: 'miramar', t: 'Miramar', nivel: 'Bairro rico', cor: '#9b59d0', ico: '🏰' },
];
const zonaCasa = id => ZONAS_CASA.find(z => z.id === id) || ZONAS_CASA[2];
const precoCasa = C => Math.round(C.preco * cid().custo / 50000) * 50000; // o preço muda com a cidade
const nivelCidade = P => P.custo >= .9 ? 'rica' : P.custo >= .75 ? 'media' : 'pobre';
const casaT = id => CASAS.find(c => c.id === id);

/* ---------------- MÓVEIS (a casa compra-se vazia — mobilar é contigo) ---------------- */
const MOVEIS = [
  { id: 'colchao', t: 'Colchão', ico: '🛏️', p: 25000, d: 'Dormir em casa sem ser no chão frio (+75 energia)' },
  { id: 'cama', t: 'Cama com colchão', ico: '🛏️', p: 180000, d: 'Dormir a sério: energia no máximo e +2 saúde' },
  { id: 'cama2', t: 'Cama ortopédica de casal', ico: '🛏️', p: 480000, d: 'O melhor sono da tua vida: energia no máximo, +3 saúde e +2 felicidade' },
  { id: 'arcond', t: 'Ar condicionado', ico: '❄️', p: 380000, d: 'Dormir fresco no calor: a tua cama descansa ainda mais (+1 saúde extra ao dormir)' },
  { id: 'mesa', t: 'Mesa e cadeiras', ico: '🪑', p: 85000, d: 'Refeições sentado(a), receber visitas' },
  { id: 'fogao', t: 'Fogão a gás', ico: '🍳', p: 130000, d: 'Cozinhar em casa — a comida mais barata' },
  { id: 'geladeira', t: 'Geladeira', ico: '🧊', p: 260000, d: 'Comida guardada: acordas com menos fome' },
  { id: 'sofa', t: 'Sofá', ico: '🛋️', p: 210000, d: 'Descansar, ver TV, receber kambas e fazer sestas sem risco (+40 energia)' },
  { id: 'tv', t: 'TV LED', ico: '📺', p: 280000, d: 'Ver a novela da Kalemba TV e o futebol (+felicidade)' },
  { id: 'som', t: 'Aparelho de som', ico: '🔊', p: 150000, d: 'Kizomba em casa (+felicidade)' },
  { id: 'guardaroupa', t: 'Guarda-roupa', ico: '🚪', p: 190000, d: 'Guardar a roupa: trocar de look em casa' },
  { id: 'candeeiro', t: 'Candeeiros', ico: '💡', p: 35000, d: 'Casa iluminada e acolhedora' },
  { id: 'tapete', t: 'Tapetes', ico: '🟥', p: 45000, d: 'Casa com cara de lar' },
  { id: 'pc', t: 'Computador portátil', ico: '💻', p: 520000, d: 'Estudar e trabalhar melhor em casa' },
];
const movelT = id => MOVEIS.find(m => m.id === id);
const precoMovel = M => Math.round(M.p * cid().custo / 1000) * 1000;
const temMovel = id => (G.moveis || []).includes(id);
const casaPropriaOuArrendada = () => G && (G.casa.tipo === 'propria' || G.casa.tipo === 'arrendada');
function buyMovel(id) {
  const M = movelT(id); if (!M) return;
  if (!casaPropriaOuArrendada()) return toast('🏚️ Precisas de uma casa (própria ou arrendada) para ter móveis. Vai à Imobiliária!');
  G.moveis = G.moveis || [];
  if (G.moveis.includes(id)) return toast('Já tens isto em casa.');
  if (!pay(precoMovel(M))) return;
  G.moveis.push(id);
  if (typeof IV_CACHE !== 'undefined') Object.keys(IV_CACHE).forEach(k => { if (k.startsWith('casa:')) delete IV_CACHE[k]; });
  const t = `🪑 <b>${M.t}</b> entregue em tua casa! ` + fx({ felicidade: 2 });
  addLog(t, 'good'); toast('🪑 ' + M.t + ' entregue! Entra em casa para veres.'); save(); refresh();
  if (typeof inInt !== 'undefined' && inInt && inInt.loc === 'casa' && typeof ivExit === 'function' && typeof ivEnter === 'function') { ivExit(true); setTimeout(() => ivEnter('casa'), 60); }
}
const BENS = [
  // Telemóveis
  { id: 'tel1', cat: 'Telemóveis', t: 'Tijolinho 105 (básico)', ico: '📞', p: 15000, tel: 1, d: 'Chamadas, SMS, rádio e jogo da cobrinha' },
  { id: 'tel2', cat: 'Telemóveis', t: 'Faísca 30', ico: '📱', p: 120000, tel: 2, d: 'Smartphone 4G: apps, redes sociais, Kandonga, entregas', ef: { felicidade: 4 } },
  { id: 'telS', cat: 'Telemóveis', t: 'Nova S25 Ultra', ico: '📱', p: 1100000, tel: 3, d: '5G, câmara 200MP, assistente IA', ef: { felicidade: 6, aparencia: 1 } },
  { id: 'tel3', cat: 'Telemóveis', t: 'Lumi 17 Pro Max', ico: '📲', p: 1600000, tel: 4, d: '5G, Face ID, fotos de estúdio: muito mais seguidores', ef: { felicidade: 7, aparencia: 2, fama: 1 } },
  { id: 'telF', cat: 'Telemóveis', t: 'Nova Dobra 7', ico: '📖', p: 2200000, tel: 5, d: 'Ecrã dobrável gigante, topo de gama absoluto', ef: { felicidade: 8, aparencia: 2, fama: 2 } },
  // Tecnologia
  { id: 'watch', cat: 'Tecnologia', t: 'Smartwatch', ico: '⌚', p: 150000, d: 'Conta passos e vigia o coração (+1 saúde/ano)', ef: { saude: 2 } },
  { id: 'portatil', cat: 'Tecnologia', t: 'Portátil (laptop)', ico: '💻', p: 450000, d: 'Trabalho remoto, freelancing e aulas online', ef: { inteligencia: 2 } },
  { id: 'starlink', cat: 'Tecnologia', t: 'Internet por satélite (Céu Net)', ico: '🛰️', p: 600000, manut: 360000, d: 'Internet rápida: posts e aulas online rendem mais' },
  { id: 'ps5', cat: 'Tecnologia', t: 'Consola KZ Station 5', ico: '🎮', p: 650000, d: 'Futebol e corridas com a malta', ef: { felicidade: 6 } },
  { id: 'smarttv', cat: 'Tecnologia', t: 'Smart TV 65" 4K', ico: '📺', p: 900000, d: 'Filmes, canais e a Liga Mwangolé em grande', ef: { felicidade: 5 } },
  // Casa
  { id: 'gerador', cat: 'Casa', t: 'Gerador (contra o apagão)', ico: '🔌', p: 400000, d: 'Adeus apagões', ef: { felicidade: 3 } },
  { id: 'solar', cat: 'Casa', t: 'Painéis solares + bateria', ico: '☀️', p: 2500000, d: 'Energia limpa e grátis, sem apagões', ef: { felicidade: 4, karma: 3 } },
  { id: 'ac', cat: 'Casa', t: 'Ar condicionado', ico: '❄️', p: 350000, d: 'Dormir bem no calor de Luanda', ef: { felicidade: 3, saude: 1 } },
  // Veículos
  { id: 'bike', cat: 'Veículos', t: 'Bicicleta', ico: '🚲', p: 60000, d: 'Transporte e saúde', ef: { saude: 2 } },
  { id: 'moto', cat: 'Veículos', t: 'Motorizada', ico: '🏍️', p: 700000, carta: true, manut: 100000, d: 'Kupapata e entregas' },
  { id: 'carro', cat: 'Veículos', t: 'Carro usado (sedan)', ico: '🚗', p: 4500000, carta: true, manut: 300000, d: 'Conforto e Kandonga', ef: { felicidade: 8, fama: 2 } },
  { id: 'carroel', cat: 'Veículos', t: 'Carro elétrico (Volta EV)', ico: '🔋', p: 18000000, carta: true, manut: 120000, d: 'Moderno, silencioso, sem combustível', ef: { felicidade: 9, fama: 4, karma: 2 } },
  { id: 'carronovo', cat: 'Veículos', t: 'Carro novo (SUV)', ico: '🚙', p: 22000000, carta: true, manut: 600000, ef: { felicidade: 10, fama: 5 } },
  { id: 'hiace', cat: 'Veículos', t: 'Carrinha Candongueiro (azul e branca)', ico: '🚐', p: 10000000, carta: true, manut: 400000, renda: 2400000, d: 'Põe um motorista a trabalhar para ti' },
  { id: 'jeep', cat: 'Veículos', t: 'Jeep de Luxo V8', ico: '🛻', p: 60000000, carta: true, manut: 1200000, ef: { felicidade: 12, fama: 8, karma: -2 } },
];
const TEL_NOME = ['Sem telemóvel', 'Tijolinho 105', 'Faísca 30', 'Nova S25 Ultra', 'Lumi 17 Pro Max', 'Nova Dobra 7'];
const bemT = id => BENS.find(b => b.id === id);
const NEG = [
  { id: 'banca', t: 'Banca no Mercado', ico: '🧺', p: 100000, base: 650000, idade: 14 },
  { id: 'cantina', t: 'Cantina no Bairro', ico: '🏪', p: 1500000, base: 1500000 },
  { id: 'roulotte', t: 'Roulotte de Comida', ico: '🍢', p: 3000000, base: 2800000 },
  { id: 'salao', t: 'Salão de Beleza', ico: '💅', p: 5000000, base: 3800000, bonus: 'cabeleireiro' },
  { id: 'oficina', t: 'Oficina Auto', ico: '🔧', p: 6000000, base: 4500000, bonus: 'mecanica' },
  { id: 'lavandaria', t: 'Lavandaria', ico: '🧼', p: 6000000, base: 4200000 },
  { id: 'frota', t: 'Frota de Candongueiros', ico: '🚐', p: 30000000, base: 16000000 },
  { id: 'software', t: 'Empresa de Tecnologia', ico: '💻', p: 10000000, base: 8000000, curso: 'informatica' },
  { id: 'advocacia', t: 'Escritório de Advogados', ico: '⚖️', p: 15000000, base: 12000000, curso: 'direito' },
  { id: 'restaurante', t: 'Restaurante na Ilha', ico: '🍤', p: 25000000, base: 15000000 },
  { id: 'armazem', t: 'Armazém de Bebidas', ico: '🍺', p: 25000000, base: 14000000 },
  { id: 'colegio', t: 'Colégio Privado', ico: '🏫', p: 60000000, base: 32000000 },
  { id: 'clinicapriv', t: 'Clínica Privada', ico: '🏥', p: 80000000, base: 50000000, curso: 'medicina' },
  { id: 'lojaonline', t: 'Loja Online (e-commerce)', ico: '🛒', p: 2000000, base: 2200000, bem: 'portatil' },
  { id: 'produtora', t: 'Produtora de Música & Vídeo', ico: '🎬', p: 8000000, base: 6000000 },
  { id: 'fitness', t: 'Ginásio Fitness', ico: '🏋️', p: 12000000, base: 8000000 },
  { id: 'fintech', t: 'Startup Fintech', ico: '🚀', p: 40000000, base: 32000000, curso: 'informatica', risco: .2 },
  { id: 'construtora', t: 'Construtora', ico: '🏗️', p: 90000000, base: 60000000, risco: .14 },
];
const negT = id => NEG.find(n => n.id === id);
const NIV_M = [1, 1.8, 3, 4.8, 7.5];

/* ---------------- ESTADO ---------------- */
let G = null, USER = null;
let meta = { karmaBonus: 0, vidas: [] };
const saveMeta = () => Acc.persist(G && G.vivo ? G : null, meta);
const save = () => { if (G && G.vivo) Acc.persist(G, meta); };
const cid = () => PROVINCIAS.find(p => p.n === G.cidade.prov) || PROVINCIAS[0];
const adulto = () => G.idade >= 18;
const maxAcoes = () => G.idade >= 70 ? 7 : 10; // energia do corpo ÷ 10 (ver ano9.js)
const plus18 = () => !!(USER && USER.adulto);

function wpick(arr, wf) { const t = arr.reduce((s, x) => s + wf(x), 0); let r = Math.random() * t; for (const x of arr) { r -= wf(x); if (r <= 0) return x; } return arr[arr.length - 1]; }
/* profissão dos pais no género certo (o pai não é "Professora") */
const PROF_GEN = { Zungueira: 'Zungueiro', Desempregado: 'Desempregada', 'Lavador de carros': 'Lavadora de carros', 'Camponês': 'Camponesa', Pedreiro: 'Pedreira', 'Vendedora no mercado': 'Vendedor no mercado', 'Mecânico': 'Mecânica', Cabeleireira: 'Cabeleireiro', Professora: 'Professor', Enfermeiro: 'Enfermeira', 'Funcionária pública': 'Funcionário público', 'Bancário': 'Bancária', 'Médica': 'Médico', 'Engenheiro petrolífero': 'Engenheira petrolífera', 'Empresário': 'Empresária', Advogada: 'Advogado', 'Diretor de banco': 'Diretora de banco', Ministra: 'Ministro', 'Magnata do petróleo': 'Magnata do petróleo', Deputado: 'Deputada', 'Empresária de diamantes': 'Empresário de diamantes' };
const PROF_FEM8 = new Set(['Zungueira', 'Vendedora no mercado', 'Cabeleireira', 'Professora', 'Funcionária pública', 'Médica', 'Advogada', 'Ministra', 'Empresária de diamantes']);
function profGen(p, g) { const fem = PROF_FEM8.has(p); if ((g === 'F') === fem || !PROF_GEN[p]) return p; return PROF_GEN[p]; }
function newLife() {
  const kb = meta.karmaBonus || 0, av = USER.avatar;
  const prov = wpick(PROVINCIAS, p => p.w);
  const cls = wpick(CLASSES, c => c.w * Math.pow(1.13, kb * (CLASSES.indexOf(c) - 1.4)));
  const ci = CLASSES.indexOf(cls);
  const nome = (USER.nome || '').trim().replace(/\s+/g, ' ').slice(0, 24) || 'Kamba'; // o nome/nickname tal como o jogador escreveu
  const stats = { saude: R(55, 85), felicidade: R(60, 85), inteligencia: R(30, 60), aparencia: R(40, 70), fama: 0, karma: 50 };
  for (const k in cls.stat) stats[k] += cls.stat[k];
  for (const k in stats) if (k !== 'fama') stats[k] = clamp(stats[k] + (k === 'karma' ? Math.round(kb / 2) : Math.round(kb * .7)));
  const tal = pick(TALENTOS);
  const pai = { nome: pick(NOMES_M), idade: R(22, 40), vivo: true, rel: R(55, 90), prof: profGen(pick(cls.profs), 'M') };
  const mae = { nome: pick(NOMES_F), idade: R(18, 36), vivo: true, rel: R(65, 95), prof: profGen(pick(cls.profs), 'F') };
  if (chance(.08)) pai.vivo = false; // pai ausente / falecido
  // nascer na rua: possível nas famílias mais pobres (o mau karma aumenta a hipótese)
  const rua = ci === 0 && chance(Math.max(.18, Math.min(.6, .34 - kb * .04)));
  if (rua) { pai.vivo = false; mae.vivo = false; pai.ausente = mae.ausente = true; pai.prof = mae.prof = 'Desconhecido(a)'; stats.saude = clamp(stats.saude - 8); stats.felicidade = clamp(stats.felicidade - 10); stats.aparencia = clamp(stats.aparencia - 6); stats.karma = clamp(stats.karma + 4); }
  // sem irmãos e sem amigos à nascença: as pessoas conhecem-se online, na cidade
  const nIrm = 0, irmaos = [];
  const FUNDO = { media: [800000, 2500000, 600000], rica: [15000000, 40000000, 6000000], elite: [80000000, 220000000, 30000000] }[cls.id];
  const fundo = FUNDO && !rua ? { total: Math.round(R(FUNDO[0], FUNDO[1]) / 1000) * 1000, anual: FUNDO[2] } : null;
  if (fundo) fundo.resto = fundo.total;
  G = {
    v: 2, nome, genero: av.genero, avatar: Object.assign({}, av), idade: 16, ano: new Date().getFullYear(),
    cidade: { prov: prov.n, mun: pick(prov.m) }, classe: cls.id, talento: tal.id,
    stats, dinheiro: 0, poupanca: 0, emprestimo: null,
    edu: 0, estudo: null, area: null, curso: null, cursosFeitos: [], tecnicos: [], mestrado: false, notaMedia: 0, notas: [],
    carta: false, cadastro: false, treinos: 0,
    emprego: null, historico: [], reformado: false,
    casa: { tipo: 'rua' }, origem: rua ? 'rua' : 'familia', fundo, imoveis: [], bens: [], negocios: [], moveis: [], telNum: null,
    tel: 0, seg: 0, posts: 0, verificado: false,
    pai, mae, irmaos, amigos: [], parceiro: null, filhos: [], ex: 0,
    roupa: null, roupas: ['casual', 'luanda', 'bata'],
    doente: false, preso: 0, acoes: 4, vivo: true, conq: [], log: [], cunha: 0,
    inv: { bodiva: 0, cripto: 0, dolar: 0 }, inbox: [], feed: [], fotos: [], msgAno: {}, wall: 0,
  };
  const inf = infancia(cls, ci, tal, prov);
  pai.idade += 16; mae.idade += 16;
  if (rua) {
    addLog(`🌧️ Nasceste <b>na rua</b>, em ${G.cidade.mun}, ${prov.n}. Nunca conheceste os teus pais. Chamam-te <b>${nome}</b>.`, 'bad');
    addLog('🏚️ Não tens casa: dormes em passeios, mercados e no Abrigo da Missão. Trabalha, poupa e arrenda um quarto — ou compra a tua própria casa.', 'bad');
  } else {
    addLog(`👶 Nasceste em <b>${G.cidade.mun}, ${prov.n}</b>, numa <b>${cls.t.toLowerCase()}</b>. Chamam-te <b>${nome}</b>.`, 'gold');
    addLog(`O teu pai é ${pai.vivo ? pai.prof.toLowerCase() : 'ausente'} e a tua mãe é ${mae.prof.toLowerCase()}. És filho(a) único(a).`);
    addLog('🏚️ Aos 16 anos saíste de casa dos teus pais para fazeres a tua vida: <b>estás na rua</b> — dormes em passeios e no Abrigo da Missão. Trabalha, poupa e arrenda um quarto ou compra a tua casa (Imobiliária). Os teus pais estão a uma chamada de distância.', 'bad');
    // presente de despedida: os pais dão um extra conforme a classe (a mãe esconde na mala...)
    if (pai.vivo || mae.vivo) {
      const pre = [R(10, 25), R(25, 60), R(60, 150), R(200, 500), R(500, 1200)][ci] * 1000;
      G.dinheiro += pre;
      const frases = pai.vivo && mae.vivo
        ? [`A tua mãe meteu <b>${kzShort(pre)}</b> na tua mala sem o pai ver: "Para o primeiro mês, filho(a)."`, `O teu pai deu-te <b>${kzShort(pre)}</b> no portão: "Não gastes tudo em cerveja."`, `Os teus pais juntaram <b>${kzShort(pre)}</b> para o teu arranque: "Faz por ti."`]
        : pai.vivo ? [`O teu pai deu-te <b>${kzShort(pre)}</b> no portão: "Faz por ti, filho(a)."`] : [`A tua mãe meteu <b>${kzShort(pre)}</b> na tua mala: "Cuida de ti, filho(a)."`];
      addLog(`🎁 ${pick(frases)}`, 'gold');
    }
  }
  if (ci >= 3) addLog(`🍀 <b>Sorte rara!</b> Só ${cls.w} em cada 100 pessoas nascem numa ${cls.t.toLowerCase()} — e o fundo acaba: trabalhar continua a ser o caminho.`, 'gold');
  if (fundo) addLog(`💳 A tua família abriu-te uma conta com <b>${kzShort(fundo.total)}</b>. Recebes até ${kzShort(fundo.anual)} por ano enquanto durar — quando acabar, é contigo. Trabalhar continua a ser o caminho.`, 'gold');
  addLog(`${tal.ico} Talento natural: <b>${tal.t}</b> — ${tal.d}`);
  inf.log.forEach(t => addLog(t));
  addLog(`🎓 Terminaste a escola aos 16 anos com média de <b>${G.notaMedia} valores</b>. Agora decides: universidade, curso técnico ou trabalhar.`, 'gold');
  if (kb > 0) addLog(`✨ O bom karma da vida passada acompanha-te (+${kb}).`, 'good');
  if (kb < 0) addLog(`⚠️ O karma da vida passada pesa sobre ti (${kb}).`, 'bad');
  save();
  return { prov, cls, tal, pai, mae, irmaos, inf, rua, fundo };
}
/* Infância resumida: escola, notas, poupança e primeiros amigos (a vida jogável começa aos 16) */
function infancia(cls, ci, tal, prov) {
  const st = G.stats, priv = ci >= 3;
  const rua = G.origem === 'rua'; // a casa é 'rua' para todos aos 16 — quem é de rua a sério vem da origem
  let base = 9.5 + st.inteligencia * .08 + ci * .5 + (talento('estudo') ? 1.6 : 0) - (rua ? 1.2 : 0);
  G.notas = Array.from({ length: 10 }, () => clamp20(Math.max(10, base + R(-2, 2))));
  G.notaMedia = Math.round(G.notas.reduce((s, x) => s + x, 0) / G.notas.length * 10) / 10;
  G.edu = 3;
  const w = { cfb: 1 + st.inteligencia / 40, cej: 1.3, hum: 1.2, info: tal.id === 'estudo' ? 1.4 : .8, saude: .8 };
  G.area = wpick(Object.keys(w), k => w[k]);
  const A = AREAS.find(a => a.id === G.area);
  G.dinheiro = rua ? R(10, 25) * 1000 : [R(60, 120), R(150, 300), R(400, 900), R(1200, 3500), R(6000, 18000)][ci] * 1000;
  G.tel = [1, 1, 2, 3, 4][ci]; if (ci <= 1 && chance(.35) && !rua) G.tel = 2;
  const ev = [];
  if (rua) {
    ev.push('🧺 Cresceste entre o mercado e a paragem dos candongueiros: lavavas carros, carregavas sacos e vendias água gelada.');
    ev.push(pick(['⛪ As irmãs da Missão davam-te sopa e um colchão quando chovia.', '🛒 Aprendeste a fazer contas a vender pastilhas na rua.', '🚌 Dormiste muitas noites na paragem, a ouvir kuduro dos táxis.']));
    ev.push(`📘 Graças a um projeto social, fizeste o ensino médio à noite em <b>${A.t}</b>. ${G.notaMedia >= 14 ? 'Contra tudo, foste dos melhores!' : 'Passaste com muito esforço.'}`);
    ev.push('🌐 Amigos? Vais conhecê-los agora, na cidade, entre os outros jogadores.');
    ev.push(`📱 ${TEL_NOME[G.tel]} em segunda mão · no bolso: ${kzShort(G.dinheiro)}.`);
    return { log: ev, area: A, priv: false };
  }
  ev.push(`🎒 Aos 6 anos entraste ${priv ? 'num colégio privado' : 'na escola pública do bairro'}${ci === 0 ? ', muitas vezes sem material escolar' : ''}.`);
  ev.push(pick(['📚 Na 4ª classe ganhaste o concurso de leitura da escola.', '⚽ Passavas as tardes a jogar à bola no campo de terra batida.', '🪁 Fazias papagaios de papel e carrinhos de lata com os vizinhos.', '📻 Ouvias kizomba no rádio da avó enquanto fazias os TPC.']));
  ev.push(ci <= 1 ? pick(['🧺 Aos 12 começaste a ajudar a família a vender no mercado.', '💧 Ias buscar água ao chafariz antes das aulas.', '👶 Cuidavas dos irmãos mais novos quando os pais trabalhavam.']) : pick(['💻 Tiveste explicações e aulas de inglês.', '✈️ Passaste umas férias em Lisboa com a família.', '🎹 Fizeste aulas de piano e natação.']));
  ev.push(`📘 Fizeste o ensino médio em <b>${A.t}</b>. ${G.notaMedia >= 15 ? 'Foste dos melhores da turma!' : G.notaMedia >= 12 ? 'Foste um(a) aluno(a) razoável.' : 'Passaste à rasca, mas passaste.'}`);
  ev.push('🌐 Os teus kambas vais conhecê-los agora, online — na cidade, entre os outros jogadores.');
  ev.push(`📱 ${TEL_NOME[G.tel]} · poupanças da mesada: ${kzShort(G.dinheiro)}.`);
  return { log: ev, area: A, priv };
}

/* ---------------- NÚCLEO ---------------- */
// DarkCell: ao entrar, se já tens telemóvel mas ainda não tens número, atribui um.
setTimeout(() => { try { if (typeof G !== 'undefined' && G && G.tel > 0 && !G.telNum && typeof telNovo === 'function') telNovo(); } catch (e) { } }, 4000);
function addLog(txt, cls = '') {
  let y = G.log[G.log.length - 1];
  if (!y || y.idade !== G.idade) { y = { idade: G.idade, ano: G.ano, e: [] }; G.log.push(y); }
  y.e.push({ t: txt, c: cls });
  if (G.log.length > 110) G.log.shift();
}
function fx(o) {
  const parts = [];
  for (const k in o) {
    let v = o[k]; if (!v) continue;
    if (k === 'dinheiro') { v = Math.round(v); G.dinheiro += v; parts.push((v > 0 ? '+' : '') + kzShort(v)); continue; }
    if (k === 'fama' && v > 0 && talento('arte')) v *= 2;
    if (k === 'inteligencia' && v > 0 && talento('estudo')) v = Math.round(v * 1.5);
    if (k === 'saude' && v > 0 && talento('desporto')) v = Math.round(v * 1.3);
    const before = G.stats[k]; G.stats[k] = clamp(before + v);
    const d = G.stats[k] - before;
    if (d) { parts.push(`${LABEL[k]} ${d > 0 ? '+' : ''}${d}`); if (typeof floatStat === 'function') floatStat(k, d); }
  }
  return parts.length ? `<span class="fxs">(${parts.join(' · ')})</span>` : '';
}
function canAct() {
  if (G.preso > 0) { toast('🔒 Estás preso(a)! Só podes esperar...'); return false; }
  if (G.acoes <= 0) { toast('⚡ Sem energia! Come alguma coisa, descansa ou dorme em casa.'); return false; }
  return true;
}
function pay(v) { if (G.dinheiro < v) { toast('💸 Não tens kumbu suficiente! Precisas de ' + kz(v)); return false; } G.dinheiro -= v; return true; }
function after(txt, cls, anim) {
  if (txt) { addLog(txt, cls || ''); toast(strip(txt)); }
  if (anim && typeof playerEmote === 'function') playerEmote(anim);
  checkUnlocks(); checkConq();
  if (G.stats.saude <= 0) return die('excesso de esforço');
  save(); refresh();
}
function doAct(cost, fn, anim) {
  if (!canAct()) return;
  if (cost && G.dinheiro < cost) return toast('💸 Não tens kumbu suficiente! Precisas de ' + kz(cost));
  G.acoes--; if (cost) G.dinheiro -= cost;
  const r = fn();
  after(r, '', anim || 'cheer');
}

/* ---------------- ROUPAS ---------------- */
function unlockOutfit(id, silent) {
  if (G.roupas.includes(id)) return false;
  G.roupas.push(id);
  if (!silent) { const O = OUTFITS[id]; addLog(`👗 Nova roupa desbloqueada: <b>${O.ico} ${O.t}</b>! Veste-a no guarda-roupa (Casa).`, 'gold'); if (typeof flash === 'function') flash(`${O.ico} Nova roupa: ${O.t}`); }
  return true;
}
function checkUnlocks() {
  if (G.idade >= 6) unlockOutfit('bata', true);
  if (G.idade >= 13) unlockOutfit('luanda', G.idade !== 13);
  if (G.stats.fama >= 40) unlockOutfit('kuduro');
  if (G.bens.includes('hiace')) unlockOutfit('candongueiro');
  if (G.negocios.some(n => n.id === 'banca')) unlockOutfit('zungueira');
  if (G.estudo && G.estudo.tipo === 'univ') unlockOutfit('estudante');
  if (G.emprego) { const j = job(G.emprego.id); if (j.outfit) unlockOutfit(j.outfit); }
  if (G.dinheiro >= 50000000) unlockOutfit('executivo');
}
function curOutfit() {
  if (G.idade < 3) return 'bebe';
  if (G.roupa && G.roupas.includes(G.roupa) && (G.idade >= 13 || OUTFITS[G.roupa].kid)) return G.roupa;
  if (G.estudo && ['primario', 'ciclo1', 'ciclo2'].includes(G.estudo.tipo)) return 'bata';
  if (G.idade < 13) return 'crianca';
  if (G.emprego && job(G.emprego.id).outfit && G.roupas.includes(job(G.emprego.id).outfit)) return job(G.emprego.id).outfit;
  return G.idade < 18 && G.roupas.includes('luanda') ? 'luanda' : 'casual';
}
function playerCfg() {
  const c = avatarCfg(G.avatar, curOutfit(), G.idade);
  if (G.tel >= 2 && G.idade >= 10 && !c.extras.some(x => ['books', 'basin', 'ball', 'fish', 'net', 'phone'].includes(x))) c.extras.push('phone');
  return c;
}
function wear(id) {
  if (!G.roupas.includes(id)) return;
  if (G.idade < 13 && !OUTFITS[id].kid) return toast('Ainda és muito novo(a) para essa roupa!');
  G.roupa = id; save(); refresh(); if (typeof checkPlayerLook === 'function') checkPlayerLook();
  toast(`${OUTFITS[id].ico} Vestiste: ${OUTFITS[id].t}`);
}
function buyOutfit(id) {
  if (G.roupas.includes(id)) return;
  if (id === 'executivo' && G.edu < 4 && G.dinheiro < 20000000) return toast('A boutique só vende o fato a licenciados ou a quem tem 20M Kz.');
  if (G.idade < 13 && !OUTFITS[id].kid) return toast('Ainda és muito novo(a) para essa roupa (13+).');
  if (!canAct()) return; if (!pay(SHOP_OUTFITS[id])) return; G.acoes--;
  unlockOutfit(id); G.roupa = id; fx({ aparencia: 3, felicidade: 3 });
  after(`🛍️ Compraste ${OUTFITS[id].t}.`, 'good', 'cheer'); if (typeof checkPlayerLook === 'function') checkPlayerLook();
}

/* ---------------- ESCOLA ---------------- */
const STAGES = { primario: { t: 'Ensino Primário', anos: 6, nivel: 1, classe0: 1 }, ciclo1: { t: 'I Ciclo do Ensino Secundário', anos: 3, nivel: 2, classe0: 7 }, ciclo2: { t: 'II Ciclo do Ensino Secundário', anos: 3, nivel: 3, classe0: 10 } };
function startStage(tipo, privada) {
  const S = STAGES[tipo];
  const anos = tipo === 'ciclo2' && G.area && AREAS.find(a => a.id === G.area).anos === 4 ? 4 : S.anos;
  G.estudo = { tipo, t: S.t + (tipo === 'ciclo2' && G.area ? ' — ' + AREAS.find(a => a.id === G.area).t : ''), ano: 1, anos, esf: 0, faltas: 0, privada: !!privada, prop: privada ? 600000 : 0 };
}
function classeTxt() { const e = G.estudo; if (!e) return ''; if (STAGES[e.tipo]) return `${STAGES[e.tipo].classe0 + e.ano - 1}ª classe`; return `${e.ano}º ano`; }
function studyHard() { doAct(0, () => { G.estudo.esf++; return pick(['Estudaste para os testes à luz da vela durante o apagão.', 'Fizeste grupo de estudo com os colegas.', 'Passaste o fim de semana a resolver exercícios.']) + ' ' + fx({ inteligencia: R(2, 4), felicidade: -R(0, 2) }); }, 'think'); }
function explicacao() { doAct(20000, () => { G.estudo.esf += 2; return 'Tiveste explicações com um professor do bairro. ' + fx({ inteligencia: R(2, 5) }); }, 'think'); }
function faltar() { doAct(0, () => { G.estudo.faltas++; return pick(['Fugiste da escola para jogar à bola.', 'Faltaste às aulas e foste à praia com a malta.', 'Gazetaste e ficaste no bairro.']) + ' ' + fx({ felicidade: R(4, 8), karma: -1 }); }, 'dance'); }
function dropSchool() {
  if (G.idade < 14) return toast('Por lei, tens de estudar pelo menos até aos 14 anos.');
  if (!confirm('Desistir dos estudos? Será mais difícil arranjar bons empregos.')) return;
  addLog(`🚫 Desististe de ${G.estudo.t}.`, 'bad'); G.estudo = null; save(); refresh(); if (typeof checkPlayerLook === 'function') checkPlayerLook();
}
function chooseArea(id) {
  G.area = id; G.precisaArea = false; startStage('ciclo2', G.estudo && G.estudo.privada);
  addLog(`📘 Escolheste a área de <b>${AREAS.find(a => a.id === id).t}</b> no II Ciclo.`, 'good'); save(); refresh();
}
function notaAno() {
  const e = G.estudo;
  let n = 6 + G.stats.inteligencia * .1 + e.esf * 1.6 - e.faltas * 1.8 + (e.privada ? 1 : 0) + (talento('estudo') ? 1.5 : 0) + R(-2, 2) - (G.emprego && !job(G.emprego.id).part ? 2 : 0);
  return clamp20(n);
}
function schoolYear() {
  const e = G.estudo; if (!e) return;
  const n = notaAno(); e.notaUlt = n;
  if (e.tipo === 'univ' || e.tipo === 'mestrado') {
    const prop = e.prop;
    if (prop) {
      if (e.paisPagam && parentsAlive() && (!G.fundo || fundoTira(prop) >= prop)) { addLog(`👨‍👩‍👧 Os teus pais pagaram as propinas (${kzShort(prop)})${G.fundo ? ` — restam ${kzShort(G.fundo.resto)} no fundo da família` : ''}.`); }
      else if (G.dinheiro >= prop) { G.dinheiro -= prop; addLog(`🎓 Propinas do ano: -${kzShort(prop)}.`); }
      else { addLog(`❌ Sem dinheiro para as propinas, foste obrigado(a) a abandonar ${e.t}.`, 'bad'); G.estudo = null; return; }
    }
  } else if (e.privada && e.prop) {
    if (parentsAlive() && G.idade < 18) { /* pais pagam */ } else if (G.dinheiro >= e.prop) G.dinheiro -= e.prop; else { e.privada = false; e.prop = 0; addLog('Passaste para a escola pública por falta de dinheiro.', 'bad'); }
  }
  e.esf = 0; e.faltas = 0;
  if (n < 10) { addLog(`📉 Reprovaste no ${classeTxt()} com média ${n} valores. Vais repetir o ano. ` + fx({ felicidade: -10 }), 'bad'); e.reprov = (e.reprov || 0) + 1; return; }
  G.notas.push(n); G.notaMedia = Math.round(G.notas.reduce((s, x) => s + x, 0) / G.notas.length * 10) / 10;
  fx({ inteligencia: R(1, 3) });
  if (e.ano >= e.anos) return finishStage(n);
  addLog(`📗 Passaste de ano com <b>${n} valores</b>.`, n >= 16 ? 'good' : '');
  e.ano++;
}
function finishStage(n) {
  const e = G.estudo;
  if (STAGES[e.tipo]) {
    G.edu = Math.max(G.edu, STAGES[e.tipo].nivel);
    addLog(`🎉 Concluíste o <b>${STAGES[e.tipo].t}</b> com ${n} valores!`, 'gold'); fx({ felicidade: 8 });
    if (e.tipo === 'primario') startStage('ciclo1', e.privada);
    else if (e.tipo === 'ciclo1') { G.estudo = null; G.precisaArea = true; }
    else { G.estudo = null; addLog('🎓 Terminaste o Ensino Médio! Agora podes concorrer à universidade, fazer um curso técnico ou trabalhar.', 'gold'); }
  } else if (e.tipo === 'univ') {
    G.edu = Math.max(G.edu, 4); G.curso = e.curso; G.cursosFeitos.push(e.curso);
    addLog(`🎓 LICENCIASTE-TE em <b>${CURSOS.find(c => c.id === e.curso).t}</b>! Que orgulho para a família! ` + fx({ felicidade: 18, fama: 3 }), 'gold');
    ['pai', 'mae'].forEach(k => { if (G[k].vivo) G[k].rel = clamp(G[k].rel + 10); });
    G.estudo = null;
  } else if (e.tipo === 'mestrado') {
    G.edu = 5; G.mestrado = true; addLog('🎓 Concluíste o <b>Mestrado</b>! Salários de quadro superior +25%. ' + fx({ felicidade: 12, fama: 3 }), 'gold'); G.estudo = null;
  }
  if (typeof checkPlayerLook === 'function') setTimeout(checkPlayerLook, 50);
}
function parentsAlive() { return G.pai.vivo || G.mae.vivo; }
const familiaPaga = () => parentsAlive() && ['rica', 'elite'].includes(G.classe) && Math.max(G.pai.vivo ? G.pai.rel : 0, G.mae.vivo ? G.mae.rel : 0) >= 40 && (!G.fundo || G.fundo.resto > 0);
const semFamilia = () => G.casa.tipo === 'rua' || !parentsAlive();
const casaFallback = () => parentsAlive() ? { tipo: 'pais' } : { tipo: 'rua' };
/* tira dinheiro do fundo da família (se existir); devolve quanto conseguiu pagar */
function fundoTira(v) { const f = G.fundo; if (!f) return v; const t = Math.max(0, Math.min(v, f.resto)); f.resto -= t; if (f.resto <= 0 && !f.fim) { f.fim = true; addLog('💳 O fundo da família <b>acabou</b>. A partir de agora, o dinheiro vem do teu trabalho.', 'bad'); } return t; }
function uniChance(c, pub) {
  if (!pub) return 1;
  const match = G.area && c.area.includes(G.area);
  return Math.max(.04, Math.min(.93, .25 + (G.notaMedia - 11) / 9 + (G.stats.inteligencia - 50) / 110 - c.dif - (match ? 0 : .3) + (talento('estudo') ? .08 : 0)));
}
function applyUni(id, pub) {
  const c = CURSOS.find(x => x.id === id);
  if (G.edu < 3) return toast('Precisas de concluir o Ensino Médio.');
  if (G.estudo) return toast('Já estás a estudar.');
  if (!pub && !(G.area && c.area.includes(G.area)) && G.stats.inteligencia < 55) return toast('A privada exige a área certa no médio ou Inteligência 55+.');
  if (!canAct()) return;
  const prop = pub ? PROP_PUB : PROP_PRIV * (c.id === 'medicina' ? 2 : 1);
  const paisPagam = familiaPaga() || (pub && parentsAlive() && G.classe !== 'pobre');
  if (!paisPagam && G.dinheiro < prop) return toast('💸 Precisas de ' + kz(prop) + ' para a primeira propina.');
  G.acoes--;
  if (pub && !chance(uniChance(c, pub))) return after(`❌ Reprovaste no exame de acesso a ${c.t} (pública). Estuda e tenta no próximo ano, ou vai para uma privada. ` + fx({ felicidade: -8 }), 'bad', 'sad');
  if (!paisPagam) G.dinheiro -= prop;
  G.estudo = { tipo: 'univ', curso: c.id, t: `${c.t} — ${pub ? 'Universidade Pública de Luanda' : 'Universidade Privada'}`, ano: 1, anos: c.anos, esf: 0, faltas: 0, prop, paisPagam, pub };
  unlockOutfit('estudante'); G.roupa = 'estudante';
  after(`🎓 ENTRASTE em <b>${c.t}</b> (${pub ? 'pública' : 'privada'})! ${paisPagam ? 'A família vai ajudar com as propinas.' : ''} ` + fx({ felicidade: 12 }), 'good', 'cheer');
  if (typeof checkPlayerLook === 'function') checkPlayerLook();
}
function applyMestrado(pt) {
  if (G.edu < 4 || G.estudo) return; if (!canAct()) return;
  const prop = pt ? 6000000 : 1500000; if (!pay(prop)) return; G.acoes--;
  G.estudo = { tipo: 'mestrado', t: pt ? 'Mestrado em Portugal' : 'Mestrado em Luanda', ano: 1, anos: 2, esf: 0, faltas: 0, prop };
  after(`✈️ Começaste o ${G.estudo.t}! ` + fx({ felicidade: 8, fama: pt ? 2 : 0 }), 'good', 'cheer');
}
function adultSchool() {
  if (G.estudo || G.idade < 18 || G.edu >= 3) return; if (!canAct()) return; G.acoes--;
  const tipo = G.edu === 0 ? 'primario' : G.edu === 1 ? 'ciclo1' : 'ciclo2';
  if (tipo === 'ciclo2' && !G.area) G.area = 'hum';
  startStage(tipo, false); G.estudo.anos = Math.max(2, Math.ceil(G.estudo.anos / 2)); G.estudo.t += ' (Noturno)';
  after(`🌙 Inscreveste-te no ensino noturno: ${G.estudo.t}.`, 'good', 'think');
}
function doTecnico(id) {
  const T = TECNICOS.find(x => x.id === id);
  if (G.idade < 15) return toast('Os cursos técnicos são a partir dos 15 anos.');
  if (G.tecnicos.includes(id)) return;
  doAct(T.custo, () => { G.tecnicos.push(id); return `🛠️ Concluíste o curso técnico de <b>${T.t}</b> (INEFOP)! ` + fx({ inteligencia: 2, felicidade: 4 }); }, 'think');
}
function tirarCarta() {
  if (G.idade < 18) return toast('A carta de condução é só a partir dos 18 anos.');
  if (G.carta) return;
  doAct(150000, () => {
    if (chance(.5 + G.stats.inteligencia / 200)) { G.carta = true; return '🪪 PASSASTE no exame de condução! Já tens carta. ' + fx({ felicidade: 8 }); }
    return 'Chumbaste no exame de condução. O examinador queria "um refresco"... ' + fx({ felicidade: -5 });
  }, 'think');
}

/* ---------------- TRABALHO ---------------- */
function reqOk(r) {
  const f = [];
  if (r.idade && G.idade < r.idade) f.push(`idade ${r.idade}+`);
  if (r.maxIdade && G.idade > r.maxIdade) f.push(`até ${r.maxIdade} anos`);
  if (r.edu && G.edu < r.edu) f.push(EDU[r.edu]);
  if (r.area && G.area !== r.area) f.push('Técnico Médio de ' + (r.area === 'saude' ? 'Saúde' : 'Informática'));
  if (r.curso) { const cs = [].concat(r.curso); if (!cs.some(c => G.cursosFeitos.includes(c))) f.push('Licenciatura em ' + cs.map(c => CURSOS.find(x => x.id === c).t).join(' ou ')); }
  if (r.tecnico && !G.tecnicos.includes(r.tecnico)) f.push('curso técnico de ' + TECNICOS.find(t => t.id === r.tecnico).t);
  if (r.carta && !G.carta) f.push('carta de condução');
  if (r.bem) { const bs = [].concat(r.bem); if (!bs.some(b => G.bens.includes(b))) f.push(bs.map(b => bemT(b).t).join(' ou ')); }
  if (r.tel && G.tel < r.tel) f.push('smartphone');
  if (r.mestrado && !G.mestrado) f.push('Mestrado');
  if (r.limpo && G.cadastro) f.push('registo criminal limpo');
  if (r.mar && !cid().mar) f.push('viver numa cidade com mar');
  if (r.treinos && G.treinos < r.treinos) f.push(`${r.treinos} treinos (tens ${G.treinos})`);
  if (r.seguidores && G.seg < r.seguidores) f.push(`${numShort(r.seguidores)} seguidores`);
  ['saude', 'inteligencia', 'aparencia', 'fama'].forEach(k => { if (r[k] && G.stats[k] < r[k]) f.push(`${LABEL[k]} ${r[k]}+`); });
  return f;
}
function salario(e) {
  const j = job(e.id);
  if (j.varFama) return Math.round(300000 + G.stats.fama * G.stats.fama * 2500);
  if (j.varSeg) return Math.round(G.seg * 40 * (1 + G.stats.aparencia / 100));
  let s = j.sal * (j.mult ? j.mult[e.nivel] || 1 : j.niv ? LVL_M[e.nivel] || 1 : 1) * (j.informal ? 1 : cid().sal) * (G.mestrado && j.cat === 'Superior' ? 1.25 : 1);
  return Math.round(s * (e.bonus || 1));
}
function jobTitle(e) { const j = job(e.id); return j.niv ? j.niv[Math.min(e.nivel, j.niv.length - 1)] + (j.niv[0] === j.t ? '' : '') : j.t; }
function applyJob(id) {
  const j = job(id);
  if (reqOk(j.req).length) return toast('❌ Não cumpres os requisitos.');
  const cur = G.emprego ? job(G.emprego.id) : null;
  let slot = 'emprego';
  if (cur) {
    if (cur.part && j.part) { if (G.part) return toast('Já tens dois part-times.'); slot = 'part'; }
    else if (!cur.part && j.part) { if (G.part) return toast('Já tens um part-time.'); slot = 'part'; }
    else if (!cur.part && !j.part) return toast('Já tens um emprego a tempo inteiro. Despede-te primeiro.');
    else slot = 'swap'; // tinha part-time, vai para tempo inteiro
  }
  if (G.estudo && !j.part && G.idade < 18) return toast('Menores a estudar só podem ter trabalhos part-time ou biscates.');
  if (!canAct()) return; G.acoes--;
  let p = .5 + (G.stats.inteligencia - 50) / 160 + (G.stats.aparencia - 50) / 300 + G.stats.fama / 500 + (talento('labia') ? .12 : 0) + G.cunha * .25 + (['rica', 'elite'].includes(G.classe) ? .1 : 0);
  if (j.informal || j.part) p += .35;
  if (G.cadastro && !j.informal) p -= .25;
  if (['medico', 'juiz', 'engpetro', 'deputado'].includes(id)) p -= .12;
  if (talento('desporto') && ['basquete', 'futebol'].includes(id)) p += .25;
  if (chance(Math.max(.08, Math.min(.95, p)))) {
    const e = { id, nivel: 0, desemp: 55, anos: 0, anosNivel: 0 };
    if (slot === 'part') G.part = e; else if (slot === 'swap') { G.part = G.emprego; G.emprego = e; } else G.emprego = e;
    G.cunha = 0;
    if (j.outfit) { unlockOutfit(j.outfit); if (!j.part || !G.roupa) G.roupa = j.outfit; }
    G.historico.push(j.t);
    { const sl = salario(e), fm = !j.informal, irt = fm ? vrIRT(sl) : 0, inss = fm ? Math.round(sl * .03) : 0;
      after(`🎉 Foste contratado(a): <b>${j.t}</b>! Salário: ${kzShort(sl)}/ano${fm ? ` (≈${kzShort(sl - irt - inss)} líquidos após IRT e INSS)` : ''}. ` + fx({ felicidade: 10 }), 'good', 'cheer'); }
    if (typeof checkPlayerLook === 'function') checkPlayerLook();
  } else {
    after(`Candidatura a ${j.t}: ` + pick(['A entrevista correu mal. O lugar foi para o sobrinho do diretor.', 'Disseram que iam ligar... nunca ligaram.', 'Pediram "gasosa" para avançar o processo.', 'Havia 300 candidatos para uma vaga.']) + ' ' + fx({ felicidade: -4 }), 'bad', 'sad');
  }
}
function cansado() { if (G.stats.saude > 20) return false; toast('⚠️ Estás exausto(a)! Com a saúde tão baixa podes morrer. Descansa em casa ou vai à clínica antes de trabalhar mais.'); return true; }
function workHard() { if (cansado()) return; if (G.emprego && G.emprego.desemp >= 100) return toast('⭐ O teu desempenho já está no máximo! Não precisas de te esforçar mais este ano.'); doAct(0, () => { G.emprego.desemp = clamp(G.emprego.desemp + R(10, 18)); return 'Trabalhaste no duro, chegaste cedo e saíste tarde. ' + fx({ saude: -R(1, 4), felicidade: -R(0, 3), karma: 1 }); }, 'train'); }
function horasExtra() { if (cansado()) return; doAct(0, () => { const v = Math.round(salario(G.emprego) * .08); G.emprego.desemp = clamp(G.emprego.desemp + 5); return `Fizeste horas extra. +${kzShort(v)} ` + fx({ dinheiro: v, saude: -R(2, 5), felicidade: -R(1, 4) }); }, 'train'); }
function askPromo() {
  const e = G.emprego, j = job(e.id);
  doAct(0, () => {
    if (!j.niv) { // informal: pedir aumento
      if (chance(.2 + e.desemp / 250)) { e.bonus = (e.bonus || 1) * 1.15; return '📈 O patrão aceitou dar-te mais 15%! ' + fx({ felicidade: 8 }); }
      return '"Não há dinheiro, a crise está feia." ' + fx({ felicidade: -4 });
    }
    if (e.nivel >= j.niv.length - 1) return 'Já estás no topo da carreira!';
    const nr = j.nivReq && j.nivReq[e.nivel + 1], nf = nr ? reqOk(nr) : [];
    if (nf.length) return `Para subir a <b>${j.niv[e.nivel + 1]}</b> precisas de: ${nf.join(', ')}.`;
    const p = (e.desemp - 50) / 70 + Math.min(e.anosNivel, 5) * .08 + (G.mestrado ? .1 : 0) + G.cunha * .2 + (talento('labia') ? .08 : 0);
    if (e.anosNivel >= 2 && chance(Math.max(.05, Math.min(.9, p)))) { e.nivel++; e.anosNivel = 0; e.desemp = 50; G.cunha = 0; return `🚀 PROMOVIDO(A) a <b>${jobTitle(e)}</b>! Novo salário: ${kzShort(salario(e))}/ano. ` + fx({ felicidade: 15, fama: 2 }); }
    if (e.anosNivel < 2) return `O chefe disse para esperares — precisas de pelo menos 2 anos no cargo (tens ${e.anosNivel}).`;
    if (chance(.1)) { const t = j.t; G.emprego = null; return `😡 Insististe demais e foste despedido(a) de ${t}! ` + fx({ felicidade: -15 }); }
    return 'Promoção recusada. Trabalha mais para subir o desempenho. ' + fx({ felicidade: -5 });
  }, 'think');
}
function quitJob(part) {
  const e = part ? G.part : G.emprego; if (!e) return;
  if (!confirm('Despedir-te de ' + job(e.id).t + '?')) return;
  addLog(`🚪 Despediste-te: ${job(e.id).t}.`); if (part) G.part = null; else { G.emprego = G.part || null; G.part = null; }
  save(); refresh(); if (typeof checkPlayerLook === 'function') checkPlayerLook();
}
function reformar() { if (G.idade < 60 || !G.emprego) return; if (!confirm('Reformar-te? Vais receber pensão do INSS.')) return; G.pensao = Math.round(salario(G.emprego) * .45); addLog(`🎉 Reformaste-te. Pensão: ${kzShort(G.pensao)}/ano.`, 'gold'); G.emprego = null; G.reformado = true; save(); refresh(); }

/* ---------------- ATIVIDADES ---------------- */
const ATIV = [
  { id: 'brincar', t: 'Brincar no quintal', ico: '🪀', d: 'Correr, saltar à corda, jogar à bola', c: 0, max: 12, run: () => pick(['Brincaste às escondidas com os vizinhos.', 'Jogaste à bola de trapos na rua.', 'Fizeste um carrinho de lata.']) + ' ' + fx({ felicidade: R(4, 9), saude: R(1, 3) }) },
  { id: 'historias', t: 'Ouvir histórias da avó', ico: '👵🏿', d: 'Contos e sabedoria dos mais-velhos', c: 0, max: 9, anim: 'think', run: () => 'A avó contou histórias antigas à volta da fogueira. ' + fx({ inteligencia: R(2, 4), karma: 1 }) },
  { id: 'ajudarcasa', t: 'Ajudar em casa', ico: '🧹', d: 'Ir buscar água, varrer, cuidar dos irmãos', c: 0, min: 6, max: 17, run: () => { ['pai', 'mae'].forEach(k => G[k].vivo && (G[k].rel = clamp(G[k].rel + 4))); return 'Ajudaste a família nas tarefas de casa. ' + fx({ karma: 3, felicidade: -1 }); } },
  { id: 'ginasio', t: 'Treinar no Ginásio', ico: '🏋️', d: 'Treinar o corpo', c: 15000, min: 14, anim: 'train', run: () => 'Treinaste no ginásio. ' + fx({ saude: R(3, 8), aparencia: R(1, 4), felicidade: R(0, 3) }) },
  { id: 'basquete', t: 'Treinar Basquetebol', ico: '🏀', d: 'Conta para a carreira desportiva', c: 0, min: 8, anim: 'train', run: () => { G.treinos++; return `Treinaste basquete no campo (${G.treinos} treinos). ` + fx({ saude: R(2, 6), felicidade: R(2, 5), fama: chance(.2) ? 1 : 0 }); } },
  { id: 'futebol', t: 'Jogar Futebol', ico: '⚽', d: 'Conta para a carreira desportiva', c: 0, min: 6, anim: 'train', run: () => { G.treinos++; return `Jogaste futebol no campo de terra batida (${G.treinos} treinos). ` + fx({ saude: R(2, 6), felicidade: R(3, 6) }); } },
  { id: 'salao', t: 'Salão / Barbeiro', ico: '💈', d: 'Ficar bem pintado(a)', c: 15000, min: 12, run: () => (G.genero === 'F' ? 'Fizeste tranças novas no salão.' : 'O barbeiro deixou o corte no ponto.') + ' ' + fx({ aparencia: R(3, 8), felicidade: R(1, 4) }) },
  { id: 'praia', t: 'Relaxar na Praia', ico: '🏖️', d: 'Mergulho e peixe grelhado', c: 8000, run: () => pick(['Passaste o domingo na Ilha com a malta.', 'Foste de lancha ao Mussulo. Que paz!', 'Mergulho no mar e funje com peixe.']) + ' ' + fx({ felicidade: R(5, 12), saude: R(0, 3) }) },
  { id: 'pesca', t: 'Ir à Pesca', ico: '🎣', d: 'Lançar as redes no mar', c: 0, min: 10, run: () => { const v = R(10000, 50000) * (G.emprego && G.emprego.id === 'pescador' ? 2 : 1); return pick(['Apanhaste carapau e corvina.', 'Boa pescaria de garoupa!', 'O mar estava bravo, mas valeu.']) + ' ' + fx({ dinheiro: v, saude: R(0, 3), felicidade: R(1, 4) }); } },
  { id: 'igreja', t: 'Assistir ao Culto', ico: '⛪', d: 'Rezar e encontrar a comunidade', c: 2000, anim: 'pray', run: () => { let t = 'Foste ao culto e deixaste a tua oferta. ' + fx({ karma: R(3, 7), felicidade: R(1, 5) }); if (G.idade >= 16 && !G.parceiro && chance(.15)) t += ' ' + meetSomeone('na igreja'); return t; } },
  { id: 'voluntario', t: 'Voluntariado', ico: '🤝', d: 'Ajudar crianças e idosos', c: 0, min: 12, anim: 'pray', run: () => 'Ajudaste na distribuição de cestas básicas. ' + fx({ karma: R(6, 12), felicidade: R(2, 5), fama: chance(.2) ? 2 : 0 }) },
  { id: 'farra', t: 'Dançar Kizomba & Semba', ico: '💃', d: 'Farra até de manhã', c: 25000, min: 16, anim: 'dance', run: () => { let t = pick(['Dançaste kizomba até às 6h!', 'A farra estava rija!', 'Semba ao vivo, ambiente top.']) + ' ' + fx({ felicidade: R(6, 14), aparencia: R(0, 2) }); if (plus18() && adulto() && chance(.18)) t += ' Mas exageraste na cerveja... ' + fx({ saude: -R(4, 10) }); if (!G.parceiro && chance(.25)) t += ' ' + meetSomeone('na pista de dança'); return t; } },
  { id: 'kuduro', t: 'Atuar num show de Kuduro', ico: '🎤', d: 'Mostrar o teu talento ao público', c: 0, min: 14, anim: 'dance', run: () => { const ok = chance(.35 + G.stats.aparencia / 250 + (talento('arte') ? .2 : 0)); return ok ? 'Arrasaste no palco! O público gritou o teu nome! ' + fx({ fama: R(3, 7), felicidade: 8, dinheiro: R(10000, 60000) }) : 'Falhaste o passo e levaste vaias... ' + fx({ felicidade: -6, fama: chance(.3) ? 1 : 0 }); } },
  { id: 'biblio', t: 'Ler na Biblioteca', ico: '📚', d: 'Alimentar a mente', c: 0, min: 7, anim: 'think', run: () => 'Passaste a tarde a ler na biblioteca. ' + fx({ inteligencia: R(2, 5) }) },
  { id: 'medico', t: 'Consulta Médica', ico: '🏥', d: 'Check-up e tratamento', c: 70000, run: () => { const was = G.doente; G.doente = false; return (was ? 'O médico tratou a tua doença! ' : 'Check-up feito, estás bem. ') + fx({ saude: R(was ? 15 : 5, was ? 25 : 12) }); } },
  { id: 'estetica', t: 'Cirurgia estética', ico: '💉', d: 'Arriscado mas pode melhorar o visual', c: 2500000, min: 18, run: () => chance(.75) ? 'A cirurgia correu bem! ' + fx({ aparencia: R(10, 20), felicidade: 6 }) : 'Correu mal... ' + fx({ aparencia: -R(5, 12), saude: -10 }) },
  { id: 'biscate', t: 'Fazer um Biscate', ico: '🔧', d: 'Ganhar uns trocos', c: 0, min: 12, anim: 'train', run: () => { const v = R(15000, 60000) * (talento('negocio') ? 1.35 : 1) * (G.idade < 16 ? .5 : 1); return pick(['Ajudaste a carregar um camião.', 'Pintaste o muro de um vizinho.', 'Vendeste saldo e cartões na rua.', 'Fizeste uma mudança no Kilamba.']) + ' ' + fx({ dinheiro: v, saude: -R(0, 3) }); } },
  { id: 'apostas', t: 'Apostas Desportivas', ico: '🎰', d: 'Só +18 · Aposta 20 mil na Liga Mwangolé', c: 20000, min: 18, adult: true, run: () => chance(.3) ? 'Acertaste o resultado! ' + fx({ dinheiro: R(50000, 200000), felicidade: 8 }) : 'Perdeste a aposta. O Petro empatou no último minuto. ' + fx({ felicidade: -4 }) },
  { id: 'casino', t: 'Noite no Casino', ico: '🃏', d: 'Só +18 · Arriscar 200 mil', c: 200000, min: 18, adult: true, run: () => chance(.35) ? 'Noite de sorte na roleta! ' + fx({ dinheiro: R(400000, 900000), felicidade: 10 }) : 'A casa ganhou... como sempre. ' + fx({ felicidade: -8, karma: -1 }) },
  { id: 'esquema', t: 'Fazer um "esquema"', ico: '🕶️', d: 'Kumbu fácil... mas arriscado', c: 0, min: 16, run: () => esquema() },
];
function ativOk(a) { return G.idade >= (a.min || 0) && G.idade <= (a.max || 200) && (!a.adult || plus18()); }
function runAtiv(id) { const a = ATIV.find(x => x.id === id); if (!ativOk(a)) return toast('Esta atividade não está disponível para ti.'); doAct(a.c, a.run, a.anim || 'cheer'); }
function esquema() {
  if (chance(.33)) {
    G.preso = R(1, 4); G.cadastro = true; if (G.emprego) G.emprego = null; G.part = null;
    if (G.parceiro && chance(.4)) { addLog(`${G.parceiro.nome} deixou-te por causa da prisão.`, 'bad'); G.parceiro = null; }
    if (typeof sendToPrison === 'function') setTimeout(sendToPrison, 400);
    return `🚔 Foste apanhado(a)! Condenado(a) a ${G.preso} ano(s) na Cadeia de Viana. Ficas com cadastro. ` + fx({ karma: -15, felicidade: -25, fama: 3 });
  }
  const v = R(150000, 1200000) * (G.idade < 18 ? .3 : 1);
  return pick(['Revendeste combustível no mercado negro.', 'Fizeste um "negócio" no porto.', 'Câmbio de rua com a nota "boa".']) + ' Ninguém viu... ' + fx({ dinheiro: v, karma: -8 });
}
function prisonAct() {
  if (G.acoes <= 0) return toast('Sem energia este ano.');
  G.acoes--;
  let t = 'Mantiveste bom comportamento na cadeia. ' + fx({ karma: 3 });
  if (chance(.2) && G.preso > 1) { G.preso--; t += ' A pena foi reduzida em 1 ano!'; }
  addLog(t); toast(strip(t)); save(); refresh();
}

/* ---------------- FAMÍLIA & RELAÇÕES ---------------- */
const pName = k => k === 'pai' ? 'o teu pai' : 'a tua mãe';
function visitParent(k) { doAct(0, () => { G[k].rel = clamp(G[k].rel + R(5, 12)); return `Passaste tempo com ${pName(k)}. ${pick(['Comeram muamba de galinha juntos.', 'Conversaram até tarde no quintal.', 'Recebeste conselhos dos mais-velhos.'])} ` + fx({ felicidade: R(3, 7), karma: 2 }); }, 'love'); }
function askMoney(k) {
  doAct(0, () => {
    const p = G[k], cls = CLASSES.find(c => c.id === G.classe);
    if (chance(p.rel / 120 - (G.idade > 25 ? .25 : 0))) { const v = R(cls.mesada[0] + 5000, cls.mesada[1] + 10000); p.rel = clamp(p.rel - 4); return `${pName(k)[0].toUpperCase() + pName(k).slice(1)} deu-te kumbu. ` + fx({ dinheiro: v }); }
    p.rel = clamp(p.rel - 8); return `"${G.idade > 20 ? 'Já tens idade para trabalhar!' : 'Dinheiro não nasce nas árvores!'}" — não te deram nada. ` + fx({ felicidade: -3 });
  }, 'sad');
}
function helpParent(k) { const v = Math.max(50000, Math.round(Math.max(0, G.dinheiro) * .05)); doAct(v, () => { G[k].rel = clamp(G[k].rel + 15); return `Deste ${kzShort(v)} a ${pName(k)}. Ficou emocionado(a). ` + fx({ karma: 8, felicidade: 5 }); }, 'love'); }
function siblingTime(i) { doAct(0, () => { const s = G.irmaos[i]; s.rel = clamp(s.rel + 10); return `Passaste tempo com ${s.nome.split(' ')[0]}. ` + fx({ felicidade: R(3, 6) }); }, 'love'); }
function makeFriend(where) {
  if (typeof v4AmigosOnline === 'function') return v4AmigosOnline(where);
  doAct(0, () => {
    if (G.amigos.length >= 6) return 'Já tens amigos que cheguem — cuida deles!';
    if (!chance(.45 + G.stats.felicidade / 250 + (talento('labia') ? .15 : 0))) return 'Tentaste fazer amizade mas não houve química. ' + fx({ felicidade: -1 });
    const g = chance(.5) ? 'M' : 'F';
    const f = { nome: nomeKamba(g), g, idade: Math.max(5, G.idade + R(-2, 3)), rel: R(55, 80), rico: chance(.2) };
    G.amigos.push(f); return `🤝 Fizeste amizade com <b>${f.nome}</b> ${where || ''}. ` + fx({ felicidade: R(4, 8) });
  }, 'cheer');
}
function friendOut(i) { doAct(10000, () => { const f = G.amigos[i]; f.rel = clamp(f.rel + R(8, 14)); return `Saíste com ${f.nome.split(' ')[0]}: ${pick(['jantaram na Marginal', 'foram a um show', 'jogaram consola', 'foram à praia'])}. ` + fx({ felicidade: R(5, 9) }); }, 'cheer'); }
function askCunha(i) {
  doAct(0, () => {
    const f = G.amigos[i];
    if (f.rel >= 60 && chance(f.rico ? .8 : .45)) { G.cunha = 1; f.rel = clamp(f.rel - 10); return `${f.nome.split(' ')[0]} vai meter uma cunha por ti na próxima candidatura/promoção! 🤫 ` + fx({ karma: -2 }); }
    f.rel = clamp(f.rel - 6); return `${f.nome.split(' ')[0]} disse que não conhece ninguém importante.`;
  }, 'think');
}
function newPartner(g) {
  const pg = g || (G.genero === 'M' ? 'F' : 'M');
  const cls = wpick(CLASSES, c => c.w), ci = CLASSES.indexOf(cls);
  const j = G.idade >= 18 ? pick([null, 'zungueiro', 'professor', 'enfermeiro', 'bancario', 'cabeleireiro', 'caixa', 'policia', null]) : null;
  return { nome: nomeKamba(pg, .25), g: pg, idade: Math.max(G.idade < 18 ? G.idade : 18, G.idade + R(-4, 5)), rel: R(55, 85), casado: false, juntos: false, anos: 0, cls: ci, emprego: j };
}
function meetSomeone(onde) { if (G.idade < 16 || G.parceiro) return ''; G.parceiro = newPartner(); return `💕 Conheceste ${G.parceiro.nome} ${onde}. Estão a namorar!`; }
function findLove(src) {
  if (G.idade < 16) return toast('Ainda és muito novo(a) para namorar!');
  if (src === 'app' && (!plus18() || !adulto())) return toast('A app Kamba é só para maiores de 18 com a opção +18 ativa.');
  doAct(0, () => {
    const p = (G.stats.aparencia + G.stats.fama / 2 + G.stats.felicidade / 3) / 140 + (talento('labia') ? .15 : 0) + (src === 'app' ? .1 : 0);
    if (chance(p)) { G.parceiro = newPartner(); return `💕 Conheceste ${G.parceiro.nome} ${src === 'app' ? 'na app Kamba' : pick(['numa farra de kizomba', 'na igreja', 'no candongueiro', 'na faculdade', 'num casamento'])}. Estão a namorar! ` + fx({ felicidade: R(8, 15) }); }
    return pick(['Levaste uma tampa daquelas...', 'Ficaste no "visto" do Fala Já.', 'Disse que só te via como amigo(a).']) + ' ' + fx({ felicidade: -R(2, 6) });
  }, 'love');
}
function dateTime() { doAct(15000, () => { G.parceiro.rel = clamp(G.parceiro.rel + R(6, 14)); return `Saíste com ${G.parceiro.nome.split(' ')[0]}. ${pick(['Jantar na Marginal ao pôr do sol.', 'Cinema no Kianda Mall.', 'Passeio na Ilha.'])} ` + fx({ felicidade: R(4, 9) }); }, 'love'); }
function moveIn() {
  const p = G.parceiro; if (!p || p.juntos) return;
  if (G.idade < 18) return toast('Só podem morar juntos depois dos 18.');
  if (G.casa.tipo === 'pais' || G.casa.tipo === 'rua') return toast('Primeiro arranja casa própria ou arrendada (Imobiliária, no Centro Habitacional).');
  doAct(0, () => { if (p.rel < 55) return `${p.nome.split(' ')[0]} ainda não se sente pronto(a). ` + fx({ felicidade: -3 }); p.juntos = true; return `🏠 ${p.nome.split(' ')[0]} veio morar contigo! ` + fx({ felicidade: 10 }); }, 'love');
}
const alembCusto = () => [300000, 600000, 1500000, 5000000, 20000000][G.parceiro.cls || 0];
function marry() {
  const p = G.parceiro;
  if (G.idade < 18 || p.idade < 18) return toast('O casamento só é permitido a partir dos 18 anos.');
  if (p.anos < 1) return toast('Ainda é cedo! Namorem pelo menos 1 ano.');
  const c = alembCusto();
  doAct(c, () => {
    if (p.rel < 60) { G.dinheiro += c; return `A família de ${p.nome.split(' ')[0]} recusou o pedido. A relação precisa de melhorar (60+). ` + fx({ felicidade: -8 }); }
    p.casado = true; p.juntos = G.casa.tipo !== 'pais' && G.casa.tipo !== 'rua';
    if (typeof newsPub === 'function') newsPub(`💍 ${G.nome} casou com ${p.nome}! A festa foi em ${G.cidade.mun}.`);
    return `💍 ALEMBAMENTO FEITO! Entregaste as grades de cerveja, os panos, o fato do sogro e o envelope (${kzShort(c)}). Estás ${oa(G.genero, 'casado', 'casada')} com ${p.nome}! ` + fx({ felicidade: 20, karma: 4 });
  }, 'love');
}
function wedding(tipo) {
  const p = G.parceiro; if (!p || !p.casado || p.festa) return;
  const c = { simples: 500000, medio: 3000000, luxo: 25000000 }[tipo];
  doAct(c, () => { p.festa = tipo; return `💒 Festa de casamento ${tipo === 'luxo' ? 'de LUXO no Epic Sana' : tipo === 'medio' ? 'num salão de festas' : 'no quintal da família'}! ${tipo === 'luxo' ? 'Saiu nas revistas!' : 'Kizomba até de manhã.'} ` + fx({ felicidade: tipo === 'luxo' ? 20 : 12, fama: tipo === 'luxo' ? 10 : tipo === 'medio' ? 2 : 0 }); }, 'dance');
}
function haveKid() {
  const p = G.parceiro;
  const mi = G.genero === 'F' ? G.idade : p.idade;
  if (G.idade < 18) return toast('Ainda és muito novo(a)!');
  if (mi > 47) return toast('Já não é possível ter filhos naturalmente. Podes adotar.');
  doAct(0, () => {
    if (!chance(.6)) return 'Tentaram, mas ainda não foi desta. ' + fx({ felicidade: -2 });
    const g = chance(.5) ? 'M' : 'F';
    const f = { nome: pick(g === 'M' ? NOMES_M : NOMES_F), g, idade: 0, rel: 100, escola: 'publica' };
    G.filhos.push(f); p.rel = clamp(p.rel + 8);
    if (typeof newsPub === 'function') newsPub(`👶 ${oa(G.genero, 'Nasceu o filho de', 'Nasceu a filha de')} ${G.nome}: bem-vindo(a), ${f.nome}!`);
    return `👶 Nasceu ${g === 'M' ? 'o teu filho' : 'a tua filha'} <b>${f.nome}</b>! ` + fx({ felicidade: 20, karma: 3 });
  }, 'love');
}
function adopt() {
  if (G.idade < 25) return toast('Para adotar precisas de ter pelo menos 25 anos.');
  if (G.casa.tipo === 'pais' || G.casa.tipo === 'rua') return toast('Precisas de casa própria ou arrendada para adotar.');
  doAct(500000, () => { const g = chance(.5) ? 'M' : 'F'; const f = { nome: pick(g === 'M' ? NOMES_M : NOMES_F), g, idade: R(1, 8), rel: 80, escola: 'publica' }; G.filhos.push(f); return `🧡 Adotaste ${f.nome} de um lar de acolhimento. ` + fx({ felicidade: 15, karma: 15 }); }, 'love');
}
function kidSchool(i, tipo) { G.filhos[i].escola = tipo; addLog(`🏫 ${G.filhos[i].nome.split(' ')[0]} vai para a escola ${tipo === 'privada' ? 'privada (1,5M/ano)' : 'pública'}.`); save(); refresh(); }
function kidTime(i) { doAct(0, () => { const f = G.filhos[i]; f.rel = clamp(f.rel + 10); return `Passaste tempo com ${f.nome.split(' ')[0]}. ${f.idade < 12 ? 'Jogaram à bola no quintal.' : 'Tiveram uma boa conversa sobre a vida.'} ` + fx({ felicidade: R(4, 8), karma: 2 }); }, 'love'); }
function breakUp() {
  const p = G.parceiro; if (!confirm((p.casado ? 'Divorciar-te de ' : 'Terminar com ') + p.nome + '?' + (p.casado ? '\n⚖️ Divórcio: os bens são partilhados 50/50 (dinheiro, casa, móveis).' : ''))) return;
  let t = `💔 ${p.casado ? 'Divorciaste-te de' : 'Terminaste com'} ${p.nome}. `;
  if (p.casado) {
    if (G.dinheiro > 0) { const m = Math.round(G.dinheiro * .5); G.dinheiro -= m; t += `Na partilha de bens perdeste ${kzShort(m)} em dinheiro. `; }
    if (G.casa.tipo === 'propria' && G.casa.idx != null && G.imoveis[G.casa.idx]) {
      if (chance(.5)) {
        const iv = G.imoveis.splice(G.casa.idx, 1)[0];
        const c = casaT(iv.id);
        G.casa = { tipo: 'arrendada', id: c.id }; G.moveis = [];
        t += `A casa (${c.t}) ficou para ${p.nome.split(' ')[0]} e voltaste para uma casa arrendada, sem mobília. `;
      } else t += `A casa ficou contigo, mas pagaste a parte dele(a) na partilha. `;
    } else if (G.moveis && G.moveis.length) {
      const perde = G.moveis.filter(() => chance(.5));
      if (perde.length) { G.moveis = G.moveis.filter(m => !perde.includes(m)); t += `Ele(a) levou ${perde.length === 1 ? '1 móvel' : perde.length + ' móveis'}. `; }
    }
    const fmen = G.filhos.filter(f => f.idade < 18);
    if (fmen.length && G.casa.tipo !== 'rua') {
      const nomeMenor = fmen[0].nome.split(' ')[0];
      G.divorcio = { nome: p.nome, pensao: fmen.length, filho: nomeMenor, total: 0, desde: G.ano };
      t += `⚖️ O tribunal decidiu: os filhos ficam contigo e ${p.nome.split(' ')[0]} paga assistência todo o mês (DarkCell Money). `;
    }
  }
  G.parceiro = null; G.ex++; addLog(t + fx({ felicidade: -12 }), 'bad'); save(); refresh();
}

// Pensão de alimentos: o ex paga 1×/dia se ainda não pagou este dia
function divorcioUI() {
  const d = G.divorcio; if (!d) return '';
  if (G.stats.felicidade < 50) d.lastE = d.lastE || 0;
  const pend = d.lastP !== v6Hoje();
  return `<div class="card" style="border-color:#e74c3c55"><b>⚖️ Divórcio de ${esc(d.nome)}</b><br><span class="dim">${d.filho} e ${d.pensao > 1 ? `mais ${d.pensao - 1} filho(s)` : '1 filho'} ficaram contigo. Total recebido: ${kzShort(d.total)}.</span><br>${pend ? `<button class="pbtn" onclick="divorcioCobrar()">💸 Pedir assistência do dia</button>` : `<span class="dim">✅ Assistência de hoje já entrou na DarkCell Money.</span>`}</div>`;
}
function divorcioCobrar() {
  const d = G.divorcio; if (!d || d.lastP === v6Hoje()) return toast('Já recebeste a assistência de hoje.');
  d.lastP = v6Hoje();
  const base = 8000 * d.pensao * (cid().custo || 1) * (1 + (G.ano - (d.desde || G.ano)) * .06);
  const v = Math.max(2000, Math.round(base * R(50, 110) / 100));
  d.total += v; G.dinheiro += v;
  (G.inbox = G.inbox || []).unshift({ key: 'ex', de: d.nome + ' (ex)', txt: `Transferência DarkCell Money: ${kz(v)} para a assistência ${d.pensao > 1 ? 'das' : 'da'} nossa${d.pensao > 1 ? 's' : ''} criança${d.pensao > 1 ? 's' : ''}.`, ano: G.ano, lida: false });
  addLog(`💸 ${d.nome.split(' ')[0]} enviou ${kz(v)} pela DarkCell Money (assistência de ${d.pensao > 1 ? d.pensao + ' filhos' : '1 filho'}). ` + fx({ felicidade: 2 }), 'good');
  save(); refresh();
}

/* ---------------- CASAS ---------------- */
const moradaTxt = () => G.casa.tipo === 'rua' ? 'Sem casa · dormes na rua / Abrigo da Missão' : G.casa.tipo === 'pais' ? (parentsAlive() ? 'Casa dos pais' : 'Casa da família') : G.casa.tipo === 'arrendada' ? casaT(G.casa.id).t + ' (arrendada)' : casaT(G.imoveis[G.casa.idx].id).t + ' (tua)';
function rentHouse(id) {
  if (!adulto() && !(semFamilia() && G.idade >= 16)) return toast('Só podes arrendar casa a partir dos 18 anos (ou 16, se não tiveres família).');
  const C = casaT(id); const caucao = Math.round(C.renda * cid().custo / 6);
  if (!canAct()) return; if (!pay(caucao)) return; G.acoes--;
  if (G.casa.tipo === 'propria') G.imoveis[G.casa.idx].mora = false;
  G.casa = { tipo: 'arrendada', id };
  if (G.parceiro && G.parceiro.casado) G.parceiro.juntos = true;
  after(`🔑 Arrendaste: <b>${C.t}</b> (${kzShort(C.renda * cid().custo / 12)}/mês). Pagaste ${kzShort(caucao)} de caução. ` + fx({ felicidade: 6 + C.conforto }), 'good', 'cheer');
}
const CRED_ENT = .3; // entrada do crédito habitação
const CRED_ANOS = 2; // o banco pede 2 anos de contrato no emprego atual
const credAnosOk = () => !!(G.emprego && !job(G.emprego.id).informal && (G.emprego.anos || 0) >= CRED_ANOS) || G.negocios.some(n => (n.ult || 0) > 0);
function credPrest(v) { const r = .14, n = 15; return Math.round(v * r / (1 - Math.pow(1 + r, -n))); }
function buyHouse(id, credito) {
  if (!adulto() && !(semFamilia() && G.idade >= 16 && !credito)) return toast('Só podes comprar casa a partir dos 18 anos (ou a pronto aos 16, se não tiveres família).');
  const C = casaT(id), preco = precoCasa(C);
  if (!canAct()) return;
  if (credito) {
    if (typeof v6DocOk === 'function' && !v6DocOk('bi')) return toast('🪪 O banco pede o BI para o crédito habitação. Trata no SIAC (Mutamba).');
    if (!credAnosOk()) return toast(`🏦 Crédito recusado: o banco pede pelo menos ${CRED_ANOS} anos de contrato no emprego atual (ou um negócio com lucro).`);
    const ent = Math.round(preco * CRED_ENT), prest = credPrest(preco - ent);
    const rend = (G.emprego && !job(G.emprego.id).informal ? salario(G.emprego) : 0) + G.negocios.reduce((s, n) => s + Math.max(0, n.ult || 0), 0);
    if (!rend || prest > rend * .45) return toast(`🏦 Crédito recusado: a prestação (${kzShort(prest)}/ano) não pode passar 45% do teu rendimento formal.`);
    if (!pay(ent)) return; G.acoes--;
    G.imoveis.push({ id, valor: preco, cred: { divida: preco - ent, prest, anos: 15 } });
  } else { if (!pay(preco)) return; G.acoes--; G.imoveis.push({ id, valor: preco }); }
  const idx = G.imoveis.length - 1;
  if (G.casa.tipo !== 'propria' || casaT(G.imoveis[G.casa.idx].id).preco < C.preco) moveInto(idx, true);
  after(`🏠 Compraste <b>${C.t}</b>${credito ? ' com crédito habitação' : ''}! ` + fx({ felicidade: 15 + C.conforto, fama: C.conforto > 10 ? 5 : 0 }), 'gold', 'cheer');
  if (typeof newsPub === 'function') newsPub(`🏠 ${G.nome} comprou casa: ${C.t}, em ${G.cidade.mun}. O sonho mwangolé!`);
}
function moveInto(idx, silent) {
  if (G.casa.tipo === 'propria' && G.imoveis[G.casa.idx]) G.imoveis[G.casa.idx].mora = false;
  const im = G.imoveis[idx]; im.mora = true; im.inq = false; G.casa = { tipo: 'propria', idx };
  if (G.parceiro && (G.parceiro.casado || G.parceiro.juntos)) G.parceiro.juntos = true;
  if (!silent) { addLog(`🏠 Mudaste-te para ${casaT(im.id).t}.`); save(); refresh(); }
}
function toggleRentOut(idx) {
  const im = G.imoveis[idx]; if (im.mora) return toast('Estás a morar nesta casa.');
  im.inq = !im.inq; addLog(im.inq ? `📝 Puseste ${casaT(im.id).t} a arrendar (~${kzShort(casaT(im.id).renda * .9)}/ano).` : `Tiraste ${casaT(im.id).t} do arrendamento.`); save(); refresh();
}
function sellHouse(idx) {
  const im = G.imoveis[idx], C = casaT(im.id);
  const liq = Math.round(im.valor - (im.cred ? im.cred.divida : 0));
  if (!confirm(`Vender ${C.t} por ${kz(im.valor)}${im.cred ? ` (liquidas o crédito: recebes ${kz(liq)})` : ''}?`)) return;
  G.dinheiro += liq;
  if (G.casa.tipo === 'propria' && G.casa.idx === idx) G.casa = { tipo: 'pais' };
  else if (G.casa.tipo === 'propria' && G.casa.idx > idx) G.casa.idx--;
  G.imoveis.splice(idx, 1);
  if (G.casa.tipo === 'pais' && !parentsAlive()) G.casa = { tipo: 'rua' };
  addLog(`💰 Vendeste ${C.t} por ${kzShort(im.valor)}.`, 'good'); save(); refresh();
}
function moveToParents() {
  if (!parentsAlive()) return toast('Já não tens os pais para te acolherem.');
  if (G.casa.tipo === 'propria') G.imoveis[G.casa.idx].mora = false;
  G.casa = { tipo: 'pais' }; if (G.parceiro) G.parceiro.juntos = false;
  addLog('🏠 Voltaste para casa dos pais. ' + fx({ felicidade: G.idade > 25 ? -6 : 0 })); save(); refresh();
}
/* distâncias aproximadas por estrada a partir de Luanda (as rotas irradiam da capital) */
const ANG_KM = { 'Luanda': 0, 'Ícolo e Bengo': 70, 'Bengo': 80, 'Cuanza Norte': 250, 'Uíge': 330, 'Malanje': 380, 'Cuanza Sul': 380, 'Zaire': 470, 'Benguela': 540, 'Cabinda': 560, 'Huambo': 600, 'Bié': 720, 'Lunda Norte': 860, 'Huíla': 860, 'Namibe': 900, 'Cunene': 950, 'Lunda Sul': 990, 'Cubango': 1050, 'Moxico': 1250, 'Moxico Leste': 1450, 'Cuando': 1500 };
/* escala coerente com o resto do jogo: comboio 18 Kz/km < autocarro 30 Kz/km < avião ~110 Kz/km (bate com os voos nacionais do aeroporto) */
function viajarPreco(prov, meio) {
  const km = ANG_KM[prov] || 500;
  return meio === 'aviao' ? Math.max(40000, Math.round(km * 110 / 1000) * 1000) : Math.max(3000, Math.round(km * 30 / 100) * 100);
}
function viajarHoras(prov, meio) { const km = ANG_KM[prov] || 500; return Math.max(1, Math.round(meio === 'aviao' ? km / 750 + .5 : km / 60)); }
/* visitar outra província e voltar (a tua casa fica à tua espera) */
function viajarPara(prov, meio) {
  if (G.visitando) return toast('🧳 Já estás de viagem! Volta primeiro a casa (mapa → a tua província).');
  const P = PROVINCIAS.find(p => p.n === prov); if (!P || P.n === G.cidade.prov) return;
  const preco = viajarPreco(P.n, meio);
  doAct(preco, () => {
    G.visitando = { prov: G.cidade.prov, mun: G.cidade.mun };
    G.cidade = { prov: P.n, mun: pick(P.m) };
    setTimeout(() => { if (typeof provSync === 'function') provSync('aeroporto'); }, 700);
    if (typeof SND !== 'undefined') SND.play(meio === 'aviao' ? 'whoosh' : 'car');
    return `${meio === 'aviao' ? '✈️ Voaste' : '🚌 Viajaste de autocarro'} para <b>${G.cidade.mun}, ${P.n}</b> (${(ANG_KM[P.n] || 500)} km · ~${viajarHoras(P.n, meio)} h)! Estás de visita — passeia, tira selfies e come o prato da terra. A tua casa fica em ${G.visitando.mun} (${G.visitando.prov}). ` + fx({ felicidade: 6 });
  }, 'cheer');
}
function voltarParaCasa() {
  if (!G.visitando) return toast('Já estás em casa.');
  doAct(0, () => {
    G.cidade = { prov: G.visitando.prov, mun: G.visitando.mun };
    G.visitando = null;
    setTimeout(() => { if (typeof provSync === 'function') provSync('aeroporto'); }, 700);
    return `🏠 Voltaste a <b>${G.cidade.mun}</b>. Não há nada como a nossa terra! ` + fx({ felicidade: 2 });
  }, 'cheer');
}
function moveCity(prov) {
  if (!adulto()) return toast('Só podes mudar de província aos 18.');
  if (G.visitando) return toast('🏠 Volta primeiro a casa para tratares da mudança.');
  const P = PROVINCIAS.find(p => p.n === prov); if (!P || P.n === G.cidade.prov) return;
  doAct(150000, () => {
    G.cidade = { prov: P.n, mun: pick(P.m) };
    setTimeout(() => { if (typeof provSync === 'function') provSync('aeroporto'); }, 700);
    if (G.casa.tipo === 'arrendada' || G.casa.tipo === 'pais') G.casa = { tipo: 'arrendada', id: 'quarto' };
    if (G.emprego && !job(G.emprego.id).informal && chance(.6)) { addLog(`Perdeste o emprego de ${job(G.emprego.id).t} com a mudança.`, 'bad'); G.emprego = null; }
    return `🚌 Mudaste-te para <b>${G.cidade.mun}, ${P.n}</b>! Nova vida, novas oportunidades. ` + fx({ felicidade: 5 });
  }, 'cheer');
}

/* ---------------- BENS ---------------- */
function buyBem(id) {
  const B = bemT(id);
  if (B.carta && !G.carta) return toast('🪪 Precisas de carta de condução primeiro (Escola → Escola de Condução).');
  if (B.tel && G.idade < 10) return toast('🧒 Ainda és muito pequeno(a) para ter telemóvel (só a partir dos 10 anos).');
  if (B.tel && G.tel >= B.tel) return toast('Já tens um telemóvel igual ou melhor.');
  if (G.bens.includes(id) && !B.tel) return toast('Já tens isto.');
  if (!pay(B.p)) return;
  if (B.tel) { G.bens = G.bens.filter(b => !bemT(b).tel); G.tel = B.tel; }
  G.bens.push(id);
  if (B.tel && typeof telNovo === 'function') setTimeout(telNovo, 400);
  after(`🛍️ Compraste: <b>${B.t}</b>! ` + fx(B.ef || {}), 'good', 'cheer');
}
function sellBem(id) { const B = bemT(id); const v = Math.round(B.p * .55); if (!confirm(`Vender ${B.t} por ${kz(v)}?`)) return; G.bens = G.bens.filter(b => b !== id); if (B.tel) G.tel = 0; G.dinheiro += v; addLog(`Vendeste ${B.t} por ${kzShort(v)}.`); save(); refresh(); }

/* ---------------- NEGÓCIOS ---------------- */
function negReq(N) {
  const f = [];
  if (G.idade < (N.idade || 18)) f.push(`idade ${N.idade || 18}+`);
  if (N.curso && !G.cursosFeitos.includes(N.curso)) f.push('Licenciatura em ' + CURSOS.find(c => c.id === N.curso).t);
  if (N.bem && !G.bens.includes(N.bem)) f.push(bemT(N.bem).t);
  return f;
}
function openNeg(id) {
  const N = negT(id); if (negReq(N).length) return toast('❌ Requer: ' + negReq(N).join(', '));
  if (G.negocios.some(n => n.id === id)) return toast('Já tens este negócio. Podes expandi-lo.');
  if (!canAct()) return; const alvara = Math.round(N.p * .05); if (!pay(N.p + alvara)) return; G.acoes--;
  G.negocios.push({ id, nivel: 1, gestao: 60, ult: null, anos: 0, gerente: false, fil: 0, func: null }); if (typeof negFix === 'function') negFix(G.negocios[G.negocios.length - 1]);
  after(`🏪 Abriste o teu negócio: <b>${N.t}</b>! (inclui alvará de ${kzShort(alvara)}) ` + fx({ felicidade: 8, fama: 2 }), 'gold', 'cheer');
}
function manageNeg(i) { doAct(0, () => { const n = G.negocios[i]; n.gestao = clamp(n.gestao + R(20, 35)); return `Geriste pessoalmente ${negT(n.id).t}: contas em dia, clientes felizes. ` + fx({ inteligencia: 1, saude: -1 }); }, 'think'); }
function expandNeg(i) {
  const n = G.negocios[i], N = negT(n.id); if (n.nivel >= 5) return toast('Este negócio já está no máximo!');
  const c = Math.round(N.p * n.nivel * 1.2);
  doAct(c, () => { n.nivel++; return `📈 Expandiste ${N.t} para o nível ${n.nivel}! (${['', 'Pequeno', 'Médio', 'Grande', 'Rede', 'Império'][n.nivel]}) ` + fx({ fama: 2 * n.nivel, felicidade: 6 }); }, 'cheer');
}
function toggleGerente(i) { const n = G.negocios[i]; n.gerente = !n.gerente; addLog(n.gerente ? `👔 Contrataste um gerente para ${negT(n.id).t} (custa 15% do lucro).` : `Dispensaste o gerente de ${negT(n.id).t}.`); save(); refresh(); }
const negValor = n => Math.round(negT(n.id).p * (1 + (n.nivel - 1) * 1.5) * .7 * (1 + (n.fil || 0) * .9) * (G && G.grupo ? 1.15 : 1));
function sellNeg(i) { const n = G.negocios[i], v = negValor(n); if (!confirm(`Vender ${negT(n.id).t} por ${kz(v)}?`)) return; G.negocios.splice(i, 1); G.dinheiro += v; addLog(`💼 Vendeste ${negT(n.id).t} por ${kzShort(v)}.`, 'good'); save(); refresh(); }

/* ---------------- BANCO ---------------- */
function deposit(v) { v = Math.min(v, G.dinheiro); if (v <= 0) return toast('Sem saldo para depositar.'); G.dinheiro -= v; G.poupanca += v; addLog(`🏦 Depositaste ${kzShort(v)} no depósito a prazo (7%/ano).`); save(); refresh(); }
function withdraw(v) { v = Math.min(v, G.poupanca); if (v <= 0) return; G.poupanca -= v; G.dinheiro += v; addLog(`🏦 Levantaste ${kzShort(v)} da poupança.`); save(); refresh(); }
function takeLoan(v) {
  if (!adulto()) return toast('Só maiores de 18.'); if (G.emprestimo) return toast('Já tens um empréstimo a decorrer.');
  const rend = G.emprego ? salario(G.emprego) : 0;
  if (v > Math.max(500000, rend * 2)) return toast('🏦 O banco só empresta até 2x o teu salário anual (ou 500 mil sem emprego... e com fiador).');
  G.emprestimo = { divida: Math.round(v * 1.25), prest: Math.round(v * 1.25 / 4) }; G.dinheiro += v;
  addLog(`🏦 Pediste um empréstimo de ${kzShort(v)}. Vais pagar ${kzShort(G.emprestimo.prest)}/ano durante 4 anos.`, ''); save(); refresh();
}
function payLoan() { const e = G.emprestimo; if (!e) return; if (!pay(e.divida)) return; G.emprestimo = null; addLog('🏦 Liquidaste o empréstimo! ' + fx({ felicidade: 6 }), 'good'); save(); refresh(); }

/* ---------------- REDES SOCIAIS ---------------- */
const POSTS = [
  { id: 'selfie', t: 'Publicar uma selfie', ico: '🤳', k: 'aparencia' },
  { id: 'danca', t: 'Vídeo de dança (kuduro challenge)', ico: '💃', k: 'fama' },
  { id: 'humor', t: 'Vídeo de humor sobre a vida em Luanda', ico: '😂', k: 'inteligencia' },
  { id: 'luxo', t: 'Mostrar a vida de luxo', ico: '💎', k: 'aparencia', req: () => G.dinheiro > 20000000 || G.bens.includes('jeep') || G.imoveis.some(i => ['vivenda', 'mansao'].includes(i.id)) },
  { id: 'dica', t: 'Dica profissional', ico: '💡', k: 'inteligencia', req: () => G.edu >= 4 || (G.emprego && job(G.emprego.id).cat === 'Superior') },
  { id: 'polemica', t: 'Opinião polémica', ico: '🔥', k: 'fama' },
];
function postSocial(id) {
  if (G.tel < 2) return toast('Precisas de um smartphone.');
  const P = POSTS.find(x => x.id === id); if (P.req && !P.req()) return toast('Ainda não tens conteúdo para isso.');
  doAct(0, () => {
    const q = ([0, 0, 1, 1.4, 1.9, 2.2][G.tel] || 1) * (G.bens.includes('starlink') ? 1.15 : 1);
    let g = (20 + G.stats[P.k] * 3 + G.seg * .04) * q * (talento('arte') ? 1.8 : 1) * (Math.random() * 1.2 + .4);
    let t = '', fam = 0;
    if (id === 'polemica') {
      if (chance(.45)) { g *= 4; fam = R(2, 5); t = '🔥 A tua opinião incendiou as redes! Toda a gente está a comentar. '; fx({ karma: -3 }); }
      else { g = -G.seg * .08; t = '😬 Cancelaram-te! Perdeste seguidores. '; fx({ felicidade: -8 }); }
    } else if (chance(.05)) { g *= 20; fam = R(5, 10); t = '🚀 VIRALIZOU! O teu post está em todo o lado! '; }
    else t = pick(['Publicaste e choveram likes.', 'Os comentários estão a bombar.', 'Os amigos partilharam o teu post.']) + ' ';
    g = Math.round(g); G.seg = Math.max(0, G.seg + g); G.posts++;
    G.feed = G.feed || []; G.feed.unshift({ ico: P.ico, t: P.t, g, ano: G.ano, viral: g > 2000 }); if (G.feed.length > 24) G.feed.pop();
    if (G.seg >= 100000 && !G.verificado) { G.verificado = true; t += '✅ A tua conta foi VERIFICADA! '; }
    if (G.seg >= 20000) unlockOutfit('kuduro');
    return `${P.ico} ${t}${g >= 0 ? '+' : ''}${numShort(g)} seguidores (total ${numShort(G.seg)}). ` + fx({ fama: fam || (g > 500 ? 1 : 0), felicidade: g > 0 ? R(1, 4) : 0 });
  }, id === 'danca' ? 'dance' : 'cheer');
}

/* ---------------- TELEMÓVEL ---------------- */
const FOODS = [
  { id: 'funje', t: 'Funje com peixe grelhado', ico: '🐟', p: 6000, ef: { saude: 1, felicidade: 3 } },
  { id: 'muamba', t: 'Muamba de galinha', ico: '🍲', p: 8000, ef: { felicidade: 4, saude: 1 } },
  { id: 'pizza', t: 'Pizza familiar', ico: '🍕', p: 14000, ef: { felicidade: 5, saude: -1 } },
  { id: 'burger', t: 'Hambúrguer & batata frita', ico: '🍔', p: 9000, ef: { felicidade: 4, saude: -1 } },
  { id: 'sushi', t: 'Sushi em Talatona', ico: '🍣', p: 35000, ef: { felicidade: 7, aparencia: 1 } },
  { id: 'marisco', t: 'Mariscada na Ilha', ico: '🦞', p: 60000, ef: { felicidade: 9, fama: 1 } },
];
function genInbox() {
  G.inbox = G.inbox || [];
  const m = (de, ico, txt, key) => G.inbox.unshift({ de, ico, txt, key, ano: G.ano, lida: false });
  const n1 = s => s.split(' ')[0];
  if (G.mae.vivo && chance(.8)) m(n1(G.mae.nome) + ' (Mãe)', '👩🏿', pick(G.idade < 18 ? ['Já fizeste os trabalhos de casa? 📚', 'Vem jantar, a comida está pronta!', 'Não te esqueças de levar o casaco 🧥'] : ['Filho(a), já comeste hoje? ❤️', 'Liga-me quando puderes, tenho saudades 🙏', 'Domingo há muamba cá em casa, vens?', 'Vi a tua foto, estás tão bonito(a)! 😍']), 'mae');
  if (G.pai.vivo && chance(.5)) m(n1(G.pai.nome) + ' (Pai)', '👨🏿', pick(['Estuda e trabalha, a vida não está fácil 💪', 'Viste o jogo do Petro? ⚽', G.idade >= 18 ? 'Quando é que me dás netos? 😂' : 'Porta-te bem na escola!']), 'pai');
  if (G.parceiro && chance(.8)) m(n1(G.parceiro.nome) + ' 💕', '💕', pick(['Bom dia, meu amor ☀️', 'Hoje à noite jantamos fora? 🍷', 'Tenho saudades tuas 🥺', 'Onde estás? Não respondes...']), 'par');
  G.amigos.slice(0, 3).forEach((f, i) => { if (chance(.5)) m(n1(f.nome), '🧑🏿', pick(['Mano, bora à farra sábado? 🎶', 'Viste o vídeo que te mandei? 😂', 'Preciso de um favor... liga-me', 'Bwé de tempo que não nos vemos!']), 'a' + i); });
  if (G.emprego && chance(.4)) m('Chefe', '💼', pick(['Reunião amanhã às 8h em ponto.', 'Bom trabalho este mês 👏', 'Preciso do relatório até sexta.']), 'chefe');
  if (chance(.6)) m('DarkCell', '📶', pick(['Semana Bwé: chamadas e SMS à vontade por 9.900 Kz!', 'Recebeste 500 MB de bónus 🎁', 'O teu saldo está a acabar. Recarrega já.']), 'darkcell');
  if (G.seg > 5000 && chance(.6)) m('Marca parceira', '🤝', `Olá! Adorávamos colaborar contigo (${numShort(G.seg)} seguidores). Interessado(a)?`, 'marca');
  if (G.inbox.length > 40) G.inbox.length = 40;
}
function sendMsg(key) {
  if (G.tel < 1) return toast('📵 Não tens telemóvel.');
  if (key[0] === 'p') {   // jogador real (rede DarkCell)
    if (typeof smsNovoPara === 'function') smsNovoPara(key.slice(1));
    return;
  }
  G.msgAno = G.msgAno || {};
  const p = key === 'pai' || key === 'mae' ? G[key] : key === 'par' ? G.parceiro : key[0] === 'a' ? G.amigos[+key.slice(1)] : key[0] === 'i' ? G.irmaos[+key.slice(1)] : null;
  if (!p) return;
  if (G.msgAno[key]) return toast(`Já falaste com ${p.nome.split(' ')[0]} este ano. Liga ou visita para fortalecer a relação.`);
  G.msgAno[key] = 1; p.rel = clamp(p.rel + R(2, 5)); fx({ felicidade: 1 });
  toast(`💬 Mandaste mensagem a ${p.nome.split(' ')[0]}. Relação +`); save(); refresh();
}
function orderFood(id) {
  if (G.tel < 2) return toast('Precisas de um smartphone.');
  const F = FOODS.find(f => f.id === id); if (!pay(F.p)) return;
  G.comidaAno = (G.comidaAno || 0) + 1;
  const t = `🛵 A Txova entregou: ${F.t}. ` + (G.comidaAno <= 3 ? fx(F.ef) : 'Já comeste bem este ano, o efeito é menor. ' + fx({ saude: F.ef.saude < 0 ? -1 : 0 }));
  addLog(t); toast(strip(t)); save(); refresh();
}
const GAMES = [
  { id: 'fifa', t: 'EA FC (futebol)', ico: '⚽', tel: 2, run: () => 'Jogaste online e ganhaste ao campeão do bairro! ' + fx({ felicidade: R(4, 8) + (G.bens.includes('ps5') ? 3 : 0) }) },
  { id: 'freefire', t: 'Free Fire', ico: '🔫', tel: 2, run: () => { if (chance(.06 + G.stats.inteligencia / 1500)) return '🏆 Ganhaste um torneio de eSports em Luanda! ' + fx({ dinheiro: R(100000, 500000), fama: R(2, 5), felicidade: 10 }); return 'Booyah! Noite de jogos com a squad. ' + fx({ felicidade: R(5, 9), saude: -1 }); } },
  { id: 'xadrez', t: 'Xadrez online', ico: '♟️', tel: 2, run: () => 'Treinaste xadrez contra jogadores do mundo inteiro. ' + fx({ inteligencia: R(2, 4), felicidade: 1 }) },
  { id: 'cobra', t: 'Cobrinha', ico: '🐍', tel: 1, run: () => `Fizeste ${R(40, 300)} pontos na cobrinha! ` + fx({ felicidade: R(2, 5) }) },
];
function playGame(id) { const g = GAMES.find(x => x.id === id); if (G.tel < g.tel) return toast('Precisas de um smartphone.'); doAct(0, g.run, 'cheer'); }
function onlineClass(premium) {
  if (G.tel < 2 && !G.bens.includes('portatil')) return toast('Precisas de smartphone ou portátil.');
  doAct(premium ? 25000 : 0, () => {
    const b = (G.bens.includes('portatil') ? 1 : 0) + (G.bens.includes('starlink') ? 1 : 0);
    if (G.estudo) G.estudo.esf += premium ? 2 : 1;
    return (premium ? '🎓 Fizeste um curso online certificado.' : '▶️ Estudaste com vídeo-aulas na Aula Online.') + ' ' + fx({ inteligencia: R(1, 3) + (premium ? 2 : 0) + b });
  }, 'think');
}
function listenMusic() {
  if (G.tel < 1) return; if (G.musicaAno) return toast('🎧 Já tens a playlist do ano no repeat!');
  G.musicaAno = true; const t = '🎧 ' + pick(['Ouviste kizomba a noite toda.', 'O novo som de kuduro está a bater!', 'Semba dos kotas para relaxar.', 'Afro house no máximo!']) + ' ' + fx({ felicidade: R(2, 5) });
  addLog(t); toast(strip(t)); save(); refresh();
}
function readNews() { if (G.noticiasAno) return; G.noticiasAno = true; fx({ inteligencia: 1 }); save(); refresh(); }
function invest(k, v) {
  if (G.tel < 2) return toast('Precisas de um smartphone.'); if (!adulto()) return toast('Só maiores de 18 podem investir.');
  G.inv = G.inv || { bodiva: 0, cripto: 0, dolar: 0 };
  v = Math.min(v, G.dinheiro); if (v <= 0) return toast('Sem saldo para investir.');
  G.dinheiro -= v; G.inv[k] += v; addLog(`📈 Investiste ${kzShort(v)} em ${{ bodiva: 'ações da BODIVA', cripto: 'cripto', dolar: 'dólares' }[k]}.`); save(); refresh();
}
function resgatar(k) {
  const v = G.inv && G.inv[k]; if (!v) return; const fee = k === 'cripto' ? .02 : .01;
  const r = Math.round(v * (1 - fee)); G.inv[k] = 0; G.dinheiro += r; addLog(`💰 Resgataste ${kzShort(r)} (${{ bodiva: 'BODIVA', cripto: 'cripto', dolar: 'dólares' }[k]}).`); save(); refresh();
}
function takeSelfie(onde) {
  if (G.tel < 2) return toast('Precisas de um smartphone com câmara.');
  G.fotos = G.fotos || [];
  const bgs = ['#2a2028', '#1f3a5a', '#5a2a1f', '#1f5a3a', '#4a1f5a', '#5a4a1f'];
  G.fotos.unshift({ cfg: playerCfg(), bg: pick(bgs), idade: G.idade, ano: G.ano, onde: onde || 'no bairro' });
  if (G.fotos.length > 12) G.fotos.length = 12;
  toast('📸 Click! Foto guardada na galeria.'); save(); refresh();
}

/* ---------------- EVENTOS ---------------- */
const EVENTS = [
  // Infância / escola
  { ico: '🎂', t: 'Festa de Anos', cond: () => G.idade >= 4 && G.idade <= 12, txt: () => 'Os teus pais fizeram-te uma festa de anos com bolo e gasosa para os miúdos do bairro!',
    ch: [['Convidar a escola toda', 'Mais alegria', () => 'A festa foi um sucesso! ' + fx({ felicidade: 10 })],
         ['Só a família', 'Mais tranquilo', () => fx({ felicidade: 6, karma: 1 })]] },
  { ico: '😤', t: 'Bullying na Escola', cond: () => G.idade >= 7 && G.idade <= 16 && G.estudo, txt: () => 'Um colega mais velho está sempre a gozar contigo e a tirar-te o lanche.',
    ch: [['Contar à professora', 'O caminho certo', () => fx({ felicidade: 2, karma: 2 }) + ' A professora resolveu.'],
         ['Enfrentá-lo', 'Arriscado', () => chance(.5) ? 'Ele nunca mais te chateou! ' + fx({ felicidade: 8, fama: 2 }) : 'Levaste uma tareia... ' + fx({ saude: -8, felicidade: -6 })],
         ['Aguentar calado(a)', '', () => fx({ felicidade: -8 })]] },
  { ico: '📝', t: 'Teste Surpresa', cond: () => G.estudo && G.idade < 25, txt: () => 'O professor marcou um teste surpresa de Matemática! O colega do lado oferece-se para te passar as respostas.',
    ch: [['Fazer sozinho(a)', 'Honestidade', () => { G.estudo.esf += G.stats.inteligencia > 55 ? 1 : 0; return fx({ karma: 2, inteligencia: 1 }); }],
         ['Copiar ("cábula")', 'Ninguém vê...', () => chance(.7) ? (G.estudo.esf++, 'Correu bem. ' + fx({ karma: -3 })) : (G.estudo.faltas++, 'Apanhado(a)! Zero no teste. ' + fx({ felicidade: -6, karma: -3 }))]] },
  { ico: '📱', t: 'Telemóvel de Presente', cond: () => G.idade >= 11 && G.idade <= 16 && G.tel === 0 && ['media', 'rica', 'elite'].includes(G.classe) && parentsAlive(), txt: () => 'Os teus pais chegaram a casa com uma caixa embrulhada...',
    ch: [['Abrir!', '', () => { const id = ['rica', 'elite'].includes(G.classe) ? 'tel3' : 'tel2'; G.bens.push(id); G.tel = bemT(id).tel; return `Ganhaste um ${bemT(id).t}! Já podes usar redes sociais. ` + fx({ felicidade: 15 }); }]] },
  { ico: '💘', t: 'Primeira Paixão', cond: () => G.idade >= 13 && G.idade <= 17 && !G.parceiro, txt: () => 'Tens um fraquinho por alguém da tua turma. Os amigos dizem que é recíproco...',
    ch: [['Declarar-me', 'Coragem!', () => chance(.5) ? (G.idade >= 16 ? (G.parceiro = newPartner(), `Disse que sim! Estás a namorar com ${G.parceiro.nome}! `) : 'Disse que sim! Andam de mãos dadas no recreio. ') + fx({ felicidade: 12 }) : 'Riu-se e contou a toda a gente... ' + fx({ felicidade: -10 })],
         ['Ficar calado(a)', '', () => fx({ felicidade: -2 })]] },
  { ico: '🏆', t: 'Olimpíadas de Matemática', cond: () => G.estudo && G.idade >= 10 && G.idade <= 18 && G.stats.inteligencia >= 60, txt: () => 'A escola escolheu-te para representar a província nas Olimpíadas Nacionais de Matemática!',
    ch: [['Participar', '', () => chance(.4 + (G.stats.inteligencia - 60) / 80) ? '🥇 Ganhaste uma medalha! Saíste na Kalemba TV! ' + fx({ fama: 6, inteligencia: 4, felicidade: 12 }) : 'Não ganhaste, mas aprendeste muito. ' + fx({ inteligencia: 3 })]] },
  // Família
  { ico: '👴🏿', t: 'Kota Pede Kumbu', cond: () => G.idade >= 20, txt: () => 'Um tio mais-velho aparece em tua casa: "Sobrinho(a), a vida está difícil... ajuda o teu tio com 50 mil."',
    ch: [['Dar 50.000 Kz', 'Família é família', () => fx({ dinheiro: -50000, karma: 6, felicidade: 2 })], ['Dar só 10.000 Kz', 'Meio termo', () => fx({ dinheiro: -10000, karma: 2 })], ['Recusar', '"Também estou mal, tio"', () => fx({ karma: -4 }) + ' Agora a família fala de ti no óbito.']] },
  { ico: '⚱️', t: 'Óbito na Família', cond: () => G.idade >= 12, txt: () => 'Faleceu um primo afastado. A família espera que vás ao óbito e contribuas.',
    ch: [['Ir e contribuir (30 mil)', 'Respeito pelos mortos', () => fx({ dinheiro: -30000, karma: 5, felicidade: -3 })], ['Não ir', '', () => fx({ karma: -6 })]] },
  { ico: '👵🏿', t: 'A Sogra Chegou', cond: () => G.parceiro && G.parceiro.casado && G.casa.tipo !== 'pais', txt: () => `A mãe de ${G.parceiro.nome.split(' ')[0]} quer vir morar convosco "só uns meses"...`,
    ch: [['Aceitar', 'Paz na família', () => { G.parceiro.rel = clamp(G.parceiro.rel + 10); return fx({ felicidade: -6, karma: 4, dinheiro: -150000 }); }], ['Recusar', 'A casa é nossa', () => { G.parceiro.rel = clamp(G.parceiro.rel - 15); return fx({ felicidade: 2 }); }]] },
  { ico: '😳', t: 'Mensagem Suspeita', cond: () => G.parceiro && G.parceiro.anos >= 2, txt: () => `Viste uma mensagem estranha no telemóvel de ${G.parceiro.nome.split(' ')[0]}...`,
    ch: [['Confrontar', 'Quero a verdade', () => chance(.5) ? 'Era só a prima. Pediste desculpa. ' + (G.parceiro.rel = clamp(G.parceiro.rel - 5), fx({ felicidade: -2 })) : 'Havia mesmo outra pessoa! ' + (G.parceiro.rel = clamp(G.parceiro.rel - 30), fx({ felicidade: -15 }))],
         ['Confiar e ignorar', '', () => fx({ felicidade: -3 })]] },
  // Vida adulta
  { ico: '👮', t: 'Gasosa na Estrada', cond: () => G.idade >= 18, txt: () => 'Um agente manda parar o carro onde vais e diz que os documentos "têm problema". Quer uma gasosa.',
    ch: [['Pagar 5.000 Kz', 'Rápido', () => fx({ dinheiro: -5000, karma: -2 }) + ' Ele sorriu e deixou passar.'], ['Recusar e argumentar', 'Os documentos estão em dia!', () => chance(.5) ? 'Ele desistiu. ' + fx({ karma: 4, felicidade: 4 }) : 'Perdeste o dia na esquadra. ' + fx({ felicidade: -8, dinheiro: -15000 })]] },
  { ico: '🔌', t: 'Apagão!', cond: () => !G.bens.includes('gerador') && !G.bens.includes('solar') && G.idade >= 14, txt: () => 'A luz foi cortada há 3 dias. A comida está a estragar e o calor é insuportável.',
    ch: [['Comprar um gerador (400 mil)', '', () => G.dinheiro >= 400000 ? (G.bens.push('gerador'), fx({ dinheiro: -400000, felicidade: 5 }) + ' Agora tens gerador!') : 'Não tinhas kumbu... ' + fx({ felicidade: -8 })], ['Aguentar com velas', '', () => fx({ felicidade: -6 })]] },
  { ico: '🦟', t: 'Paludismo', txt: () => 'Febre alta, dores no corpo e calafrios. Parece paludismo (malária)...',
    ch: [['Ir ao hospital', '50.000 Kz', () => fx({ dinheiro: -50000, saude: -5 }) + ' Fizeste o tratamento e recuperaste.'], ['Tratamento caseiro', 'Chá e repouso', () => { if (chance(talento('saude') ? .2 : .45)) { G.doente = true; return 'Pioraste muito! ' + fx({ saude: -25 }); } return 'Recuperaste. ' + fx({ saude: -10 }); }]] },
  { ico: '🔪', t: 'Assalto!', cond: () => G.idade >= 14, txt: () => 'Dois meliantes de motorizada encostam-te e exigem o telemóvel e o dinheiro.',
    ch: [['Entregar tudo', 'A vida vale mais', () => { let t = fx({ dinheiro: -Math.min(Math.max(G.dinheiro, 0), R(20000, 80000)), felicidade: -8 }); if (G.tel && chance(.6)) { G.bens = G.bens.filter(b => !bemT(b).tel); G.tel = 0; t += ' Levaram o telemóvel!'; } return t; }],
         ['Reagir', 'Arriscado!', () => chance(.3) ? 'Puseste-os a correr! ' + fx({ fama: 5, felicidade: 6 }) : 'Levaste uma facada no braço. ' + fx({ saude: -25, felicidade: -10 })]] },
  { ico: '💼', t: 'Esquema do Amigo', cond: () => G.idade >= 20, txt: () => 'Um amigo diz que tem um "negócio garantido" de importação de carros do Dubai. Precisa de 500 mil Kz teus.',
    ch: [['Investir 500.000 Kz', '"Confia, mano!"', () => { if (G.dinheiro < 500000) return 'Não tinhas o dinheiro.'; G.dinheiro -= 500000; return chance(.35) ? 'Era verdade! ' + fx({ dinheiro: R(1200000, 2000000), felicidade: 12 }) : 'O amigo desapareceu com o kumbu. ' + fx({ felicidade: -15 }); }], ['Recusar', 'Conheço essas fitas', () => fx({ inteligencia: 1 })]] },
  { ico: '👛', t: 'Carteira Perdida', txt: () => 'Encontraste uma carteira no chão do mercado com 150.000 Kz e o BI do dono.',
    ch: [['Devolver ao dono', 'Fazer o certo', () => 'O dono deu-te uma recompensa. ' + fx({ karma: 12, dinheiro: 15000, fama: 2 })], ['Ficar com o dinheiro', 'Ninguém está a ver...', () => fx({ dinheiro: 150000, karma: -12 })]] },
  { ico: '🌧️', t: 'Chuvas Fortes', cond: () => !(G.casa.tipo === 'propria' && ['kilamba', 'vivenda', 'mansao'].includes(casaT(G.imoveis[G.casa.idx].id).id)), txt: () => 'Choveu a noite toda e a casa inundou.',
    ch: [['Reparar (120 mil)', '', () => fx({ dinheiro: -120000, felicidade: -4 })], ['Secar e seguir', '', () => fx({ felicidade: -9, saude: -4 })]] },
  { ico: '⚽', t: 'Palancas Negras no CAN!', txt: () => 'Angola está na fase final do CAN! O país inteiro para.',
    ch: [['Ver no bar com a malta', '', () => (chance(.5) ? 'ANGOLA GANHOU! ' + fx({ felicidade: 15 }) : 'Perdemos nos penáltis... ' + fx({ felicidade: -3 }))], ['Ver em casa com a família', '', () => fx({ felicidade: 6, karma: 1 })]] },
  { ico: '🏛️', t: 'Convite Político', cond: () => G.idade >= 25, txt: () => 'Um dirigente do bairro convida-te para as atividades do partido. "Há vantagens, camarada..."',
    ch: [['Aceitar', 'Contactos e kumbu', () => { G.cunha = 1; return fx({ fama: R(4, 8), dinheiro: R(100000, 400000), karma: -5 }); }], ['Recusar educadamente', '', () => fx({ karma: 3 })]] },
  { ico: '🚑', t: 'Vizinho Precisa de Ajuda', cond: () => G.idade >= 16, txt: () => 'A mulher do vizinho entrou em trabalho de parto e eles não têm transporte.',
    ch: [['Ajudar e pagar o táxi', '15.000 Kz', () => 'O bebé nasceu saudável e deram-lhe o teu nome! ' + fx({ dinheiro: -15000, karma: 12, felicidade: 8 })], ['Fingir que não ouviste', '', () => fx({ karma: -10 })]] },
  // Trabalho / negócios / redes
  { ico: '💰', t: 'Gasosa no Serviço', cond: () => G.emprego && ['policia', 'funcionario', 'militar', 'juiz', 'deputado'].includes(G.emprego.id), txt: () => 'Alguém oferece-te um envelope gordo para "agilizar" um processo.',
    ch: [['Aceitar', '1 milhão de Kz', () => chance(.8) ? fx({ dinheiro: 1000000, karma: -12 }) : (G.emprego = null, G.cadastro = true, 'Era uma operação da PGR! Foste despedido(a) e ficaste com cadastro. ' + fx({ felicidade: -20, karma: -10 }))], ['Recusar', 'Integridade', () => { G.emprego.desemp = clamp(G.emprego.desemp + 8); return fx({ karma: 10 }); }]] },
  { ico: '💸', t: 'Salários em Atraso', cond: () => G.emprego && !job(G.emprego.id).informal && !job(G.emprego.id).varFama, txt: () => 'A empresa tem salários em atraso há 3 meses. Os colegas querem fazer greve.',
    ch: [['Entrar na greve', 'Lutar pelos direitos', () => { if (chance(.5)) { G.emprego.bonus = (G.emprego.bonus || 1) * 1.1; return 'A greve resultou! +10% salário. ' + fx({ felicidade: 8, karma: 3 }); } G.emprego = null; return 'Foste despedido(a) por "insubordinação". ' + fx({ felicidade: -15 }); }], ['Continuar a trabalhar', '', () => { G.emprego.desemp = clamp(G.emprego.desemp + 10); return fx({ felicidade: -5 }); }]] },
  { ico: '🧾', t: 'Fiscalização da AGT', cond: () => G.negocios.length > 0, txt: () => 'Os fiscais da AGT apareceram no teu negócio e encontraram "irregularidades" nos impostos.',
    ch: [['Pagar a multa oficial', '', () => { const v = Math.round(negT(G.negocios[0].id).base * .15); return fx({ dinheiro: -v, karma: 3 }); }], ['Oferecer uma "gasosa"', 'Mais barato... talvez', () => chance(.6) ? fx({ dinheiro: -150000, karma: -6 }) : 'O fiscal era honesto! Multa a dobrar. ' + fx({ dinheiro: -Math.round(negT(G.negocios[0].id).base * .3), karma: -6 })]] },
  { ico: '🤳', t: 'Proposta de Patrocínio', cond: () => G.seg >= 5000, txt: () => `Uma marca de bebidas quer pagar-te para publicitar nas redes (tens ${numShort(G.seg)} seguidores).`,
    ch: [['Aceitar', '', () => fx({ dinheiro: Math.round(G.seg * 12), fama: 2 })], ['Recusar', 'Não promovo álcool', () => fx({ karma: 3 })]] },
  { ico: '🏀', t: 'Olheiro do Clube', cond: () => G.stats.saude >= 75 && G.idade >= 15 && G.idade <= 26 && G.treinos >= 4 && !(G.emprego && ['basquete', 'futebol'].includes(G.emprego.id)), txt: () => 'Um olheiro de um grande clube viu-te jogar e convida-te para um teste.',
    ch: [['Fazer o teste', 'Dar tudo em campo', () => { if (chance(.25 + (talento('desporto') ? .45 : 0) + G.treinos / 60)) { const id = chance(.5) ? 'basquete' : 'futebol'; G.emprego = { id, nivel: 0, desemp: 60, anos: 0, anosNivel: 0 }; unlockOutfit('atleta'); G.roupa = 'atleta'; if (typeof checkPlayerLook === 'function') setTimeout(checkPlayerLook, 50); return `PASSASTE! És agora ${job(id).t}! ` + fx({ fama: 15, felicidade: 20 }); } return 'Não ficaste, mas foi uma boa experiência. ' + fx({ fama: 2 }); }], ['Não ir', '', () => fx({ felicidade: -3 })]] },
  { ico: '🎤', t: 'Convite para Gravar', cond: () => G.idade >= 14 && (G.stats.aparencia > 60 || G.stats.fama > 20), txt: () => 'Um produtor de kuduro viu os teus vídeos e quer-te num videoclipe!',
    ch: [['Aceitar!', '', () => { unlockOutfit('kuduro'); G.seg += R(500, 5000); return fx({ fama: R(6, 14), felicidade: 10, dinheiro: R(30000, 150000) }); }], ['Recusar', '', () => fx({ felicidade: -2 })]] },
  { ico: '📉', t: 'Desvalorização do Kwanza', cond: () => G.dinheiro > 1000000, txt: () => 'O Kwanza desvalorizou face ao dólar. As tuas poupanças valem menos.',
    ch: [['Comprar dólares na rua', 'Arriscado', () => chance(.75) ? 'Protegeste as poupanças. ' + fx({ dinheiro: Math.round(G.dinheiro * .05) }) : 'Notas falsas! ' + fx({ dinheiro: -Math.round(G.dinheiro * .15) })], ['Deixar no banco', '', () => fx({ dinheiro: -Math.round(G.dinheiro * .06) })]] },
  { ico: '🏚️', t: 'Inquilino Caloteiro', cond: () => G.imoveis.some(i => i.inq), txt: () => 'O inquilino da tua casa não paga a renda há meses e diz que "não tem como".',
    ch: [['Despejá-lo', 'Pela via legal', () => fx({ dinheiro: -100000, karma: -3 }) + ' Ficaste com a casa livre.'], ['Dar mais tempo', 'Toda a gente passa mal', () => fx({ karma: 6, dinheiro: -200000 })]] },
];

/* ---------------- CONQUISTAS ---------------- */
const CONQ = [
  { id: 'escola', ico: '🎒', t: 'Ensino Médio concluído', f: () => G.edu >= 3 },
  { id: 'emprego', ico: '💼', t: 'Primeiro emprego', f: () => G.historico.length > 0 },
  { id: 'carta', ico: '🪪', t: 'Carta de condução', f: () => G.carta },
  { id: 'licenciado', ico: '🎓', t: 'Licenciado(a)', f: () => G.edu >= 4 },
  { id: 'casa', ico: '🏠', t: 'Casa própria', f: () => G.imoveis.length > 0 },
  { id: 'casado', ico: '💍', t: 'Alembamento feito', f: () => G.parceiro && G.parceiro.casado },
  { id: 'pais', ico: '👶', t: 'Pai/Mãe de família', f: () => G.filhos.length > 0 },
  { id: 'empresario', ico: '🏪', t: 'Empresário(a)', f: () => G.negocios.length > 0 },
  { id: 'influencer', ico: '📸', t: '100 mil seguidores', f: () => G.seg >= 100000 },
  { id: 'milionario', ico: '💰', t: '100 milhões de Kz', f: () => G.dinheiro >= 100000000 },
  { id: 'chefe', ico: '🚀', t: 'Topo da carreira', f: () => G.emprego && job(G.emprego.id).niv && G.emprego.nivel >= job(G.emprego.id).niv.length - 1 },
  { id: 'imperio', ico: '👑', t: 'Império (negócio nível 5)', f: () => G.negocios.some(n => n.nivel >= 5) },
  { id: 'bilionario', ico: '💎', t: 'Bilionário(a)', f: () => G.dinheiro >= 1e9 },
  { id: 'patrao', ico: '👥', t: 'Patrão/Patroa (10 funcionários)', f: () => G.negocios.reduce((s, n) => s + (n.func || 0), 0) >= 10 },
  { id: 'filial', ico: '🏬', t: 'Primeira filial', f: () => G.negocios.some(n => n.fil > 0) },
  { id: 'grupo', ico: '🏛️', t: 'Grupo Empresarial', f: () => !!G.grupo },
  { id: 'promotor', ico: '🏗️', t: 'Promotor(a) imobiliário(a)', f: () => (G.terrenos || []).some(t => t.ed) },
  { id: 'ceo', ico: '👔', t: 'CEO de uma grande empresa', f: () => G.emprego && job(G.emprego.id).mult && G.emprego.nivel >= job(G.emprego.id).niv.length - 1 },
];
function checkConq() {
  CONQ.forEach(c => { if (!G.conq.includes(c.id) && c.f()) { G.conq.push(c.id); addLog(`🏆 Conquista: <b>${c.ico} ${c.t}</b>!`, 'gold'); if (typeof flash === 'function') flash(`🏆 ${c.t}`); } });
}

/* ---------------- ENVELHECER ---------------- */
function deathChance(a) { if (a < 5) return .002; if (a < 40) return .0015; if (a < 55) return .007; if (a < 65) return .018; if (a < 75) return .04; if (a < 85) return .09; if (a < 95) return .2; return .38; }
function custoVida() {
  const C = cid().custo; let c = 0, det = [];
  if (G.idade < 18 && G.casa.tipo === 'pais') return G.emprego || G.part ? { c: Math.round(100000 * C), det: ['quem trabalha ajuda em casa'] } : { c: 0, det: [] };
  if (G.casa.tipo === 'rua') { c += 150000 * C; det.push('comida e sobrevivência na rua'); }
  else if (G.casa.tipo === 'pais') { c += 360000 * C; det.push('contribuição em casa'); }
  else { c += 600000 * C; det.push('alimentação & transporte'); }
  if (G.casa.tipo === 'arrendada') { c += casaT(G.casa.id).renda * C; det.push('renda'); }
  const kids = G.filhos.filter(f => f.idade < 18);
  kids.forEach(f => { c += 250000 * C + (f.idade >= 6 ? (f.escola === 'privada' ? 1500000 : 100000) : 0); });
  if (kids.length) det.push(kids.length + ' filho(s)');
  c += [0, 12000, 60000, 120000, 150000, 180000][G.tel] || 0; 
  G.bens.forEach(b => { const B = bemT(b); if (B.manut) c += B.manut; });
  const p = G.parceiro;
  if (p && p.juntos) { if (p.emprego) { c -= Math.round(job(p.emprego).sal * .4); det.push('ajuda de ' + p.nome.split(' ')[0]); } else c += 300000 * C; }
  if (G.dinheiro > 100000000) { c += 6000000; det.push('estilo de vida'); }
  return { c: Math.round(c), det };
}
function ageUpLogic() {
  G.idade++; G.ano++;
  if (G.idade === 12 && !G.tel && (G.mae.vivo || G.pai.vivo)) {
    const t = { pobre: 'tel1', humilde: 'tel2', media: 'tel2', rica: 'telS', elite: 'tel3' }[G.classe] || 'tel2'; G.tel = bemT(t).tel; G.bens.push(t);
    addLog(`🎁 Fizeste 12 anos e os teus pais deram-te o teu primeiro telemóvel: <b>${bemT(t).t}</b>! (tecla 📱)`, 'gold');
  }
  const S = G.stats, cls = CLASSES.find(c => c.id === G.classe);
  // família
  ['pai', 'mae'].forEach(k => {
    const p = G[k]; if (!p.vivo) return; p.idade++; p.rel = clamp(p.rel - R(0, 3));
    if (chance(deathChance(p.idade) * 1.2)) {
      p.vivo = false; addLog(`🕯️ ${k === 'pai' ? 'O teu pai' : 'A tua mãe'}, ${p.nome}, faleceu aos ${p.idade} anos. Que descanse em paz.`, 'bad'); fx({ felicidade: -20 });
      if (!G.pai.vivo && !G.mae.vivo || chance(.5)) { const h = Math.round(R(cls.heranca[0], cls.heranca[1]) / (G.irmaos.length + 1) * (p.rel > 50 ? 1 : .6)); if (h > 0) { G.dinheiro += h; addLog(`📜 Recebeste a tua parte da herança: ${kzShort(h)}.`, 'gold'); } }
    }
  });
  G.irmaos.forEach(s => { s.idade++; s.rel = clamp(s.rel - R(0, 3)); });
  G.amigos.forEach(f => { f.idade++; f.rel = clamp(f.rel - R(1, 5)); });
  G.amigos = G.amigos.filter(f => { if (f.rel < 15) { addLog(`Perdeste o contacto com ${f.nome.split(' ')[0]}.`); return false; } return true; });
  if (G.parceiro) {
    const p = G.parceiro; p.idade++; p.anos++; p.rel = clamp(p.rel - R(0, 6));
    if (p.rel < 15) { addLog(`💔 ${p.nome} deixou-te. A relação já não estava a funcionar.`, 'bad'); fx({ felicidade: -15 }); if (p.casado && G.dinheiro > 0) { const m = Math.round(G.dinheiro * .4); G.dinheiro -= m; addLog(`Divórcio: perdeste ${kzShort(m)}.`, 'bad'); } G.parceiro = null; G.ex++; }
    else if (p.idade > 55 && chance(deathChance(p.idade))) { addLog(`🕯️ ${p.nome} faleceu. Perdeste o amor da tua vida.`, 'bad'); fx({ felicidade: -25 }); G.parceiro = null; }
    else if (p.idade >= 18 && !p.emprego && chance(.15)) p.emprego = pick(['zungueiro', 'professor', 'caixa', 'enfermeiro', 'cabeleireiro']);
  }
  G.filhos.forEach(f => { f.idade++; f.rel = clamp(f.rel - R(0, 4)); if (f.idade === 18) { addLog(`🎂 ${f.nome.split(' ')[0]} fez 18 anos ${f.escola === 'privada' ? 'e entrou na universidade!' : '!'}`, 'gold'); if (f.escola === 'privada') fx({ felicidade: 5, karma: 2 }); } });

  if (G.preso > 0) {
    G.preso--; fx({ felicidade: -6, saude: -3 });
    addLog(G.preso === 0 ? '🔓 Saíste da cadeia! Uma nova oportunidade.' : `🔒 Mais um ano na Cadeia de Viana. Faltam ${G.preso}.`, G.preso === 0 ? 'good' : 'bad');
  } else {
    // escola automática
    if (G.idade === 6 && !G.estudo && G.edu === 0) {
      if (G.classe === 'pobre' && chance(.25)) addLog('🎒 A família não tinha dinheiro para o material escolar. Ficaste um ano sem ir à escola.', 'bad');
      else { startStage('primario', ['rica', 'elite'].includes(G.classe)); addLog(`🎒 Primeiro dia de aulas! Entraste na <b>1ª classe</b>${G.estudo.privada ? ' num colégio privado' : ''}.`, 'gold'); }
    } else if (G.idade > 6 && G.idade < 9 && !G.estudo && G.edu === 0) { startStage('primario', false); addLog('🎒 Finalmente entraste na escola!', 'good'); }
    else if (G.estudo) schoolYear();
    // mesada (até aos 18)
    if (G.idade >= 6 && G.idade < 18 && parentsAlive() && !G.fundo) { const m = R(cls.mesada[0], cls.mesada[1]); if (m > 0) { G.dinheiro += m; addLog(`🪙 Mesada do ano: +${kzShort(m)}.`); } }
    // trabalho
    [['emprego', G.emprego], ['part', G.part]].forEach(([key, e]) => {
      if (!e) return; const j = job(e.id);
      e.anos++; e.anosNivel++;
      const s = salario(e); G.dinheiro += s;
      const fm = !j.informal, irt = fm ? vrIRT(s) : 0, inss = fm ? Math.round(s * .03) : 0;
      addLog(`💼 ${key === 'part' ? 'Part-time' : 'Salário'} como ${jobTitle(e)}: <b>+${kzShort(s)}</b>/ano brutos.${fm ? ` Ficas com ≈<b>${kzShort(s - irt - inss)}</b> depois do IRT (−${kzShort(irt)}) e do INSS 3% (−${kzShort(inss)}), descontados no fecho do ano.` : ' Trabalho informal: sem descontos, mas também sem INSS para a reforma.'}`);
      e.desemp = clamp(e.desemp - R(4, 10) + (G.stats.inteligencia > 60 ? 2 : 0));
      if (e.id === 'kudurista') fx({ fama: R(0, 3) });
      if (e.id === 'deputado') fx({ karma: -2, fama: 2 });
      if (['medico', 'enfermeiro', 'tecsaude', 'professor', 'profsec'].includes(e.id)) fx({ karma: 2 });
      if (j.req.maxIdade && G.idade > j.req.maxIdade + 4 && chance(.4)) { addLog(`Terminaste a carreira de ${j.t}.`, 'gold'); G[key] = null; return; }
      if (e.desemp < 25 && chance(.35)) { addLog(`📦 Foste despedido(a) de ${j.t} por mau desempenho.`, 'bad'); fx({ felicidade: -12 }); G[key] = null; return; }
      if (chance(.03)) { addLog(`📦 A empresa fechou e perdeste o emprego de ${j.t}.`, 'bad'); fx({ felicidade: -12 }); G[key] = null; return; }
      if (j.niv && e.desemp >= 80 && e.anosNivel >= 3 && e.nivel < j.niv.length - 1 && !(j.nivReq && j.nivReq[e.nivel + 1] && reqOk(j.nivReq[e.nivel + 1]).length) && chance(.35)) { e.nivel++; e.anosNivel = 0; addLog(`⭐ Promovido(a) pelo excelente desempenho: ${jobTitle(e)}!`, 'good'); }
    });
    if (G.emprego && G.idade >= 65 && chance(.3)) { G.pensao = Math.round(salario(G.emprego) * .45); addLog(`🎉 Reformaste-te como ${job(G.emprego.id).t}. Pensão: ${kzShort(G.pensao)}/ano.`, 'gold'); G.emprego = null; G.reformado = true; }
    if (G.reformado) G.dinheiro += G.pensao || 600000;
  }
  // bens com renda
  G.bens.forEach(b => { const B = bemT(b); if (B.renda) { const v = Math.round(B.renda * R(70, 130) / 100); G.dinheiro += v; addLog(`${B.ico} ${B.t} rendeu ${kzShort(v)}.`); } });
  // negócios, imobiliário e carreira (império)
  if (typeof empireYear === 'function') empireYear(S);
  // imóveis
  G.imoveis = G.imoveis.filter(im => {
    const C = casaT(im.id);
    im.valor = Math.round(im.valor * (1 + R(-4, 9) / 100));
    if (im.inq) { const v = Math.round(C.renda * .9 * cid().custo); G.dinheiro += v; addLog(`🏘️ Renda de ${C.t}: +${kzShort(v)}.`); }
    if (im.cred) {
      if (G.dinheiro >= im.cred.prest || G.poupanca >= im.cred.prest) { if (G.dinheiro >= im.cred.prest) G.dinheiro -= im.cred.prest; else G.poupanca -= im.cred.prest; im.cred.divida = Math.max(0, im.cred.divida - im.cred.prest * .55); im.cred.anos--; addLog(`🏦 Prestação do crédito (${C.t}): -${kzShort(im.cred.prest)}.`); if (im.cred.anos <= 0) { delete im.cred; addLog(`🎉 Pagaste o crédito! ${C.t} é 100% teu.`, 'gold'); } }
      else { im.cred.falha = (im.cred.falha || 0) + 1; addLog(`⚠️ Falhaste a prestação de ${C.t}!`, 'bad'); if (im.cred.falha >= 2) { addLog(`🏦 O banco penhorou ${C.t}.`, 'bad'); fx({ felicidade: -20 }); if (im.mora) G.casa = casaFallback(); return false; } }
    }
    return true;
  });
  if (G.casa.tipo === 'propria') { const i = G.imoveis.findIndex(x => x.mora); if (i < 0) G.casa = casaFallback(); else G.casa.idx = i; }
  if (G.casa.tipo === 'pais' && !parentsAlive() && adulto()) { if (G.dinheiro >= 60000) { G.casa = { tipo: 'arrendada', id: 'quarto' }; addLog('🏚️ Sem os pais, tiveste de arrendar um quarto.', 'bad'); } else { G.casa = { tipo: 'rua' }; addLog('🌧️ Sem os pais e sem dinheiro para um quarto, ficaste na rua. Trabalha e arrenda casa na Imobiliária.', 'bad'); } }
  // fundo da família: transferência anual até acabar
  if (G.fundo && G.fundo.resto > 0 && parentsAlive()) { const v = fundoTira(Math.min(G.fundo.anual, G.fundo.resto)); if (v > 0) { G.dinheiro += v; addLog(`💳 A família transferiu ${kzShort(v)} do teu fundo. ${G.fundo.resto > 0 ? `Restam ${kzShort(G.fundo.resto)}.` : 'Era o último dinheiro do fundo!'}`, G.fundo.resto > 0 ? '' : 'bad'); } }
  // viver na rua desgasta
  if (G.casa.tipo === 'rua' && !G.preso) {
    addLog('🥶 Mais um ano sem casa: noites frias, pouca comida e sempre em alerta. ' + fx({ saude: -R(3, 7), felicidade: -R(4, 8), aparencia: -R(1, 3) }), 'bad');
    if (G.dinheiro > 20000 && chance(.25)) { const v = Math.round(G.dinheiro * .3); G.dinheiro -= v; addLog(`👛 Enquanto dormias, roubaram-te ${kzShort(v)}. Guarda o dinheiro no banco!`, 'bad'); }
  }
  if (G.casa.tipo === 'pais' && G.idade >= 28) fx({ felicidade: -2 });
  // empréstimo
  if (G.emprestimo) { const e = G.emprestimo; const v = Math.min(e.prest, e.divida); G.dinheiro -= v; e.divida -= v; addLog(`🏦 Prestação do empréstimo: -${kzShort(v)}.`); if (e.divida <= 0) { G.emprestimo = null; addLog('🏦 Empréstimo pago!', 'good'); } }
  // poupança
  if (G.poupanca > 0) { const j = Math.round(G.poupanca * .07); G.poupanca += j; addLog(`🏦 Juros da poupança: +${kzShort(j)}.`); }
  // investimentos
  G.inv = G.inv || { bodiva: 0, cripto: 0, dolar: 0 };
  G.mercado = { bodiva: R(-10, 22) / 100, cripto: R(-65, 140) / 100, dolar: R(-3, 18) / 100 };
  [['bodiva', '📈 Ações na BODIVA'], ['cripto', '₿ Cripto'], ['dolar', '💵 Dólares']].forEach(([k, n]) => {
    const v = G.inv[k]; if (v <= 0) return; const d = Math.round(v * G.mercado[k]); G.inv[k] = Math.max(0, v + d);
    addLog(`${n}: ${d >= 0 ? '+' : ''}${kzShort(d)} (${Math.round(G.mercado[k] * 100)}%).`, d >= 0 ? 'good' : 'bad');
  });
  if (G.bens.includes('watch')) fx({ saude: 1 });
  G.msgAno = {}; G.comidaAno = 0; G.musicaAno = false; G.noticiasAno = false;
  if (G.tel >= 1) genInbox();
  // redes sociais
  if (G.seg > 0) {
    const d = Math.round(G.seg * (G.posts ? .02 : -.12)); G.seg = Math.max(0, G.seg + d); G.posts = 0;
    if (G.seg >= 5000 && !(G.emprego && G.emprego.id === 'influencer')) { const v = Math.round(G.seg * 8); G.dinheiro += v; addLog(`📸 Parcerias nas redes sociais: +${kzShort(v)}.`); }
    if (G.seg >= 10000) fx({ fama: Math.min(3, Math.floor(Math.log10(G.seg)) - 3) });
  }
  // custo de vida
  if (!G.preso) {
    const cv = custoVida();
    if (cv.c > 0) { G.dinheiro -= cv.c; addLog(`🧾 Custo de vida (${cv.det.join(', ')}): -${kzShort(cv.c)}.`); }
    else if (cv.c < 0) { G.dinheiro -= cv.c; addLog(`🤝 A família ajudou nas contas: +${kzShort(-cv.c)}.`); }
  }
  if (G.casa.tipo === 'propria' || G.casa.tipo === 'arrendada') { const C = casaT(G.casa.tipo === 'propria' ? G.imoveis[G.casa.idx].id : G.casa.id); fx({ felicidade: Math.round(C.conforto / 4) }); }
  if (G.dinheiro < 0) {
    fx({ felicidade: -8, saude: -1 });
    if (G.poupanca > 0) { const v = Math.min(G.poupanca, -G.dinheiro); G.poupanca -= v; G.dinheiro += v; addLog(`🏦 Usaste ${kzShort(v)} da poupança para pagar dívidas.`); }
    if (G.dinheiro < 0 && G.casa.tipo === 'arrendada' && G.dinheiro < -casaT(G.casa.id).renda * .5) { addLog(`🚪 Foste despejado(a) por falta de pagamento da renda!${parentsAlive() ? '' : ' Ficaste na rua.'}`, 'bad'); fx({ felicidade: -15 }); G.casa = casaFallback(); }
    if (G.dinheiro < -2000000 && chance(.5) && parentsAlive()) { const perd = Math.round(-G.dinheiro * .5); G.dinheiro += perd; addLog(`🤝 A família pagou metade das tuas dívidas (${kzShort(perd)}). ` + fx({ karma: -2 }), 'gold'); }
    else if (G.dinheiro < 0) addLog('⚠️ Estás endividado(a)! Os credores batem à porta.', 'bad');
  }
  // saúde
  if (G.idade > 45) fx({ saude: -R(0, G.idade > 70 ? 5 : 3) });
  else if (!G.doente && S.saude < 75) fx({ saude: R(3, 7) }); // um ano de descanso recupera um pouco
  if (S.saude < 25) addLog('⚠️ A tua saúde está muito fraca. Vai à clínica e descansa, ou podes morrer!', 'bad');
  if (G.idade > 40) fx({ aparencia: -R(0, 2) });
  if (G.doente) {
    if (chance(.3)) { G.doente = false; addLog('🏥 Foste tratado(a) no hospital público e ficaste curado(a). ' + fx({ saude: R(5, 10) }), 'good'); }
    else { fx({ saude: -R(5, 10) }); addLog('🤒 Continuas doente. Vai à Clínica!', 'bad'); }
  }
  if (!G.doente && G.idade > 30 && chance((.04 + G.idade / 1000) * (talento('saude') ? .5 : 1))) { G.doente = true; addLog(`🤒 Foste diagnosticado(a) com ${pick(['hipertensão', 'diabetes', 'febre tifóide', 'uma infeção grave', 'problemas cardíacos'])}.`, 'bad'); fx({ saude: -10 }); }
  S.felicidade = clamp(S.felicidade + (50 - S.felicidade) * .05);
  if (G.idade < 18) fx({ inteligencia: R(0, 2) });
  // marcos
  if (G.idade === 3) addLog('🗣️ Já falas pelos cotovelos e corres pelo quintal!');
  if (G.idade === 13) addLog('🧑🏿 Entraste na adolescência!', 'gold');
  if (G.idade === 18) addLog('🎂 Fizeste 18 anos! És maior de idade: podes tirar a carta, arrendar casa, abrir negócios e casar.', 'gold');
  if (G.idade % 10 === 0 && G.idade >= 20) addLog(`🎉 Festa dos ${G.idade} anos com muamba, calulu e kizomba!`, 'gold');
  checkUnlocks(); checkConq();
  G.acoes = maxAcoes();
  const dc = deathChance(G.idade) * (talento('saude') ? .7 : 1) + (S.saude < 25 ? (25 - S.saude) / 60 : 0);
  if (S.saude <= 0 || chance(dc)) return 'dead';
  save();
  if (G.precisaArea) return 'area';
  if (G.preso === 0 && G.idade >= 4 && chance(.7)) { const ev = EVENTS.filter(e => !e.cond || e.cond()); if (ev.length) return pick(ev); }
  return null;
}

function patrimonio() {
  return G.dinheiro + G.poupanca + (G.inv ? G.inv.bodiva + G.inv.cripto + G.inv.dolar : 0) + G.imoveis.reduce((s, i) => s + i.valor - (i.cred ? i.cred.divida : 0), 0) + G.bens.reduce((s, b) => s + bemT(b).p * .55, 0) + G.negocios.reduce((s, n) => s + negValor(n), 0) + (typeof imobValor === 'function' ? imobValor() : 0) - (G.emprestimo ? G.emprestimo.divida : 0);
}
function deathData(causa) {
  G.vivo = false;
  const S = G.stats;
  if (!causa) causa = S.saude <= 5 ? pick(['problemas de saúde', 'complicações de paludismo', 'doença prolongada']) :
    G.idade > 78 ? pick(['velhice, em paz', 'velhice, rodeado(a) pela família', 'causas naturais']) :
    G.idade < 12 ? pick(['uma doença infantil grave', 'paludismo']) :
    pick(['acidente de candongueiro', 'ataque cardíaco', 'complicações de paludismo', 'acidente na estrada', 'AVC']);
  const pat = patrimonio();
  const score = Math.max(0, Math.round(G.idade + S.karma + S.fama + S.felicidade / 2 + G.edu * 12 + G.filhos.length * 10 + G.conq.length * 8 + Math.log10(Math.max(1, pat)) * 8));
  const kb = Math.max(-12, Math.min(12, Math.round((S.karma - 50) / 4)));
  meta.karmaBonus = kb;
  meta.vidas.push({ nome: G.nome, titulo: G.emprego ? jobTitle(G.emprego) : (G.historico.slice(-1)[0] || (G.idade < 18 ? 'Criança' : 'Sem profissão')), img: G.avatar.base, av: G.avatar, idade: G.idade, causa, score, local: G.cidade.prov });
  if (meta.vidas.length > 50) meta.vidas.shift();
  Acc.persist(null, meta);
  const destino = kb >= 8 ? 'A tua alma brilha! Na próxima vida tens muito mais hipóteses de nascer numa família rica e abençoada.' :
    kb > 0 ? 'Viveste com bondade. A próxima encarnação será um pouco mais fácil.' :
    kb === 0 ? 'Uma vida equilibrada. A próxima começa do zero.' :
    kb > -8 ? 'As tuas más ações deixaram marca. A próxima vida será mais dura.' : 'O teu karma está pesadíssimo... A próxima encarnação vai cobrar caro.';
  return { causa, patrimonio: pat, score, kb, destino };
}
