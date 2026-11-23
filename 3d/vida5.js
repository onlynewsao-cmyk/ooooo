/* =========================================================
   PRÓXIMA ENCARNAÇÃO — vida5.js · "Estilo & Corpo"
   • Salão Kianda Style: barbeiro, cabeleireira, unhas/maquilhagem e tatuador
   • O corpo muda com a vida: ginásio, comida, corrida e idade
   • Modo Foto / selfies reais publicadas no Bwé Social
   • Roda de gestos e danças (kuduro, kizomba, semba, afro-house) vista online
   • Cinemática de nascimento e programas de TV com intervalos publicitários
   ========================================================= */
const V5 = { prev: null, wheel: false, ph: null, cin: null, emCd: 0, runAcc: 0, thumbQ: [], thumbTok: 0, tvTune: null, tvIntro: -1 };

/* ---------------- avatar: campos novos ---------------- */
function v5A() {
  const a = G.avatar || (G.avatar = {});
  if (a.musc == null) a.musc = 0;
  if (a.gord == null) a.gord = +(.06 + Math.random() * .16).toFixed(3);
  if (!Array.isArray(a.tats)) a.tats = [];
  return a;
}
const v5Clamp = v => Math.max(0, Math.min(1, v));
function v5Look() { save(); refresh(); if (typeof checkPlayerLook === 'function') checkPlayerLook(); }
function v5Cfg(change) { const a = Object.assign({}, v5A(), change || {}); return avatarCfg(a, curOutfit(), G.idade); }

/* =========================================================
   SALÃO KIANDA STYLE
   ========================================================= */
const V5_CORTE = { short: 3000, fade: 3500, waves: 5000, bald: 2000, hightop: 6000, twists: 9000, locs: 30000, nago: 12000, afro: 8000, afropuff: 7000, bun: 5000, braids: 18000, boxbraids: 25000, bantu: 10000, longo: 22000, rabo: 6000, cachos: 20000, wrap: 3000, band: 2000, cap: 4000 };
const V5_CORTE_D = { short: 'Corte clássico à tesoura', fade: 'Degradê na máquina, risco à navalha', waves: 'Escova, pomada e durag', bald: 'Careca lisa à navalha', hightop: 'Volume em cima, laterais rapadas', twists: 'Twists com creme', locs: 'Rastas feitas de raiz (4 h)', nago: 'Tranças coladas à cabeça', afro: 'Black power bem armado', afropuff: 'Puff alto com elástico', bun: 'Coque elegante', braids: 'Tranças compridas', boxbraids: 'Box braids com anéis dourados', bantu: 'Bantu knots', longo: 'Extensões lisas', rabo: 'Rabo-de-cavalo', cachos: 'Extensões encaracoladas', wrap: 'Lenço de pano africano', band: 'Fita de cabelo', cap: 'Boné novo' };
const V5_TAT_P = { tribal: 35000, angola: 40000, rosa: 45000, mae: 30000, leao: 60000, ondas: 30000, kianda: 70000, relogio: 65000 };
const V5_TAT_L = [['bL', 'Antebraço esquerdo', 1], ['bR', 'Antebraço direito', 1], ['pes', 'Pescoço', 1.3], ['mao', 'Mão', 1.2]];
const V5_UNHAS = [['#c8102e', 'Vermelho'], ['#ff6fa8', 'Rosa'], ['#7a1fa0', 'Roxo'], ['#111111', 'Preto'], ['#e8b923', 'Dourado'], ['#f2f2f2', 'Branco'], ['#1f63c9', 'Azul'], ['#2e8b57', 'Verde']];
const V5_SOMBRA = [['#8a3a9a', 'Roxo'], ['#c27a2a', 'Dourado'], ['#2a5a9a', 'Azul'], ['#7a2a2a', 'Bordô'], ['#2e7a4a', 'Esmeralda']];
const V5_BARBA = [['none', 'Sem barba', 0], ['stubble', 'Barba por fazer', 1500], ['beard', 'Barba cheia', 2500], ['goatee', 'Pera', 2000], ['mustache', 'Bigode', 1500]];
const V5_CORBARBA = [['#111111', 'Preta'], ['#3a2a1a', 'Castanha'], ['#7a5a3a', 'Clara'], ['#9a9792', 'Grisalha']];
function v5K() { return typeof v3K === 'function' ? v3K() : 1; }
const v5P = p => Math.round(p * v5K() / 100) * 100;

/* pré-visualização: antes → depois e confirmar */
function v5Preview(k, v, preco, nome, extra) { V5.prev = { k, v, preco, nome, extra }; renderPanel(true); }
function v5PrevCard(dflt) {
  const P = V5.prev;
  const now = avatarShot(playerCfg(), '#2b2f3e', true, 200);
  let depois = now, txt = dflt || 'Escolhe um estilo para veres como ficas.';
  if (P) { try { depois = avatarShot(v5Cfg(P.extra || { [P.k]: P.v }), '#3a2a46', true, 200); } catch (e) { } txt = `<b>${P.nome}</b><span>${kzShort(P.preco)}</span>`; }
  return `<div class="v5prev"><figure><img src="${now}" alt=""><figcaption>Agora</figcaption></figure><div class="v5arr">➜</div><figure class="${P ? 'on' : ''}"><img src="${depois}" alt=""><figcaption>${P ? 'Depois' : 'Pré-visualização'}</figcaption></figure>
    <div class="v5pc">${txt}${P ? `<button class="btn btn-yel" onclick="v5Confirmar()">Confirmar · ${kzShort(P.preco)}</button><button class="btn btn-ghost" onclick="V5.prev=null;renderPanel(true)">Cancelar</button>` : ''}</div></div>`;
}
function v5Confirmar() {
  const P = V5.prev; if (!P) return; const a = v5A();
  if (!vrNearLoc('salao', 30)) return toast('💈 Vem ao Salão Kianda Style para isso.');
  if (!pay(P.preco)) return;
  Object.assign(a, P.extra || { [P.k]: P.v });
  const r = fx({ aparencia: R(2, 5), felicidade: R(1, 4) });
  addLog(`💈 ${P.nome} no Kianda Style. ${r}`, 'good'); toast(`💈 ${P.nome} · ficaste um espetáculo!`);
  SND.play('good'); V5.prev = null; v5Look(); renderPanel(true);
  if (typeof playerEmote === 'function') setTimeout(() => playerEmote('cheer'), 400);
}
/* miniaturas carregadas aos poucos (não bloqueia telemóveis fracos) */
function v5Thumbs() {
  const tok = ++V5.thumbTok, imgs = [...document.querySelectorAll('#pBody img[data-v5]')];
  const step = () => {
    if (tok !== V5.thumbTok) return; const im = imgs.shift(); if (!im) return;
    try { const ch = JSON.parse(im.dataset.v5); im.src = avatarShot(v5Cfg(ch), '#2b2f3e', true, 120); } catch (e) { }
    setTimeout(step, 16);
  };
  setTimeout(step, 30);
}
function v5Grid(items) { setTimeout(v5Thumbs, 0); return `<div class="v5grid">${items.join('')}</div>`; }
function v5Cell(ch, label, price, on, sel, onclick) {
  return `<button class="v5c ${on ? 'cur' : ''} ${sel ? 'sel' : ''}" onclick="${onclick}"><img data-v5='${JSON.stringify(ch)}' alt=""><b>${label}</b><small>${on ? 'Atual' : kzShort(price)}</small></button>`;
}
function v5SalaoCabelo() {
  const a = v5A(), fem = G.genero === 'F', hairs = GEN[fem ? 'F' : 'M'].hairs, P = V5.prev;
  let h = v5PrevCard('Escolhe um corte ou penteado. Vês o antes e o depois antes de pagar.');
  h += sec(`${fem ? 'Cabeleireira' : 'Barbeiro'} · cortes e penteados`);
  h += v5Grid(hairs.map(id => { const H = HAIRS.find(x => x.id === id); const p = v5P(V5_CORTE[id] || 5000); return v5Cell({ cabelo: id }, H ? H.t : id, p, a.cabelo === id, P && P.k === 'cabelo' && P.v === id, `v5Preview('cabelo','${id}',${p},'${(H ? H.t : id).replace(/'/g, '')}')`); }));
  h += `<p class="apnote">${Object.keys(V5_CORTE).filter(k => hairs.includes(k)).slice(0, 6).map(k => `<b>${(HAIRS.find(x => x.id === k) || {}).t}</b>: ${V5_CORTE_D[k]}`).join(' · ')}</p>`;
  return h;
}
function v5SalaoCor() {
  const a = v5A(), P = V5.prev; let h = v5PrevCard('Pinta o cabelo. A cor fica até mudares outra vez (ou até aos cabelos brancos!).');
  h += sec('Coloração');
  h += v5Grid(HAIR_COLORS.map(([c, n]) => { const p = v5P(c === '#0d0d0d' ? 4000 : 9000); return v5Cell({ corCabelo: c }, n, p, a.corCabelo === c, P && P.k === 'corCabelo' && P.v === c, `v5Preview('corCabelo','${c}',${p},'Cabelo ${n.toLowerCase()}')`); }));
  return h;
}
function v5SalaoBeleza() {
  const a = v5A(), fem = G.genero === 'F', P = V5.prev; let h = v5PrevCard(fem ? 'Unhas, sombra, delineado e batom. Tudo à tua maneira.' : 'Barba aparada à navalha, com toalha quente.');
  const rosto = Array.isArray(a.rosto) ? a.rosto : [];
  if (!fem) {
    if (G.idade < 15) return h + noteBox('🧔 Ainda não tens barba para aparar. Volta daqui a uns anos!');
    h += sec('Barba');
    h += v5Grid(V5_BARBA.map(([id, n, p0]) => { const r = rosto.filter(x => !['beard', 'stubble', 'goatee', 'mustache'].includes(x)); if (id !== 'none') r.push(id); const p = v5P(p0 || 1000), cur = id === 'none' ? !rosto.some(x => ['beard', 'stubble', 'goatee', 'mustache'].includes(x)) : rosto.includes(id); return v5Cell({ rosto: r }, n, p, cur, P && P.k === 'barba' && P.v === id, `v5Preview('barba','${id}',${p},'${n}',${JSON.stringify({ rosto: r }).replace(/"/g, '&quot;')})`); }));
    h += sec('Cor da barba');
    h += v5Grid(V5_CORBARBA.map(([c, n]) => { const p = v5P(3500); return v5Cell({ corBarba: c, rosto: rosto.includes('beard') || rosto.includes('stubble') ? rosto : [...rosto, 'beard'] }, n, p, a.corBarba === c, P && P.k === 'corBarba' && P.v === c, `v5Preview('corBarba','${c}',${p},'Barba ${n.toLowerCase()}')`); }));
    return h;
  }
  h += sec('Unhas de gel');
  h += v5Grid([...V5_UNHAS.map(([c, n]) => { const p = v5P(6000); return v5Cell({ unhas: c }, n, p, a.unhas === c, P && P.k === 'unhas' && P.v === c, `v5Preview('unhas','${c}',${p},'Unhas ${n.toLowerCase()}')`); }), v5Cell({ unhas: null }, 'Naturais', v5P(1500), !a.unhas, P && P.k === 'unhas' && !P.v, `v5Preview('unhas',null,${v5P(1500)},'Unhas naturais')`)]);
  h += sec('Maquilhagem');
  const lip = rosto.includes('lipstick'), lipR = lip ? rosto.filter(x => x !== 'lipstick') : [...rosto, 'lipstick'];
  h += v5Grid([...V5_SOMBRA.map(([c, n]) => { const p = v5P(5000); return v5Cell({ sombra: c }, 'Sombra ' + n.toLowerCase(), p, a.sombra === c, P && P.k === 'sombra' && P.v === c, `v5Preview('sombra','${c}',${p},'Sombra ${n.toLowerCase()}')`); }),
    v5Cell({ sombra: null }, 'Sem sombra', 0, !a.sombra, P && P.k === 'sombra' && !P.v, `v5Preview('sombra',null,0,'Sem sombra')`),
    v5Cell({ delineado: !a.delineado }, a.delineado ? 'Tirar delineado' : 'Delineado gatinho', v5P(3000), false, P && P.k === 'delineado', `v5Preview('delineado',${!a.delineado},${v5P(3000)},'${a.delineado ? 'Sem delineado' : 'Delineado gatinho'}')`),
    v5Cell({ rosto: lipR }, lip ? 'Tirar batom' : 'Batom vermelho', v5P(2000), false, P && P.k === 'batom', `v5Preview('batom',1,${v5P(2000)},'${lip ? 'Sem batom' : 'Batom vermelho'}',${JSON.stringify({ rosto: lipR }).replace(/"/g, '&quot;')})`)]);
  return h;
}
function v5TatImg(id) { try { const m = tatTex(id); return m.map.image.toDataURL(); } catch (e) { return ''; } }
function v5SalaoTat() {
  const a = v5A(); V5.tatLoc = V5.tatLoc || 'bR';
  let h = v5PrevCard('Escolhe o sítio e o desenho. Tatuagem é para a vida: remover custa caro (laser).');
  if (G.idade < 18) return h + noteBox('🖋️ O tatuador só trabalha com maiores de 18 anos.', true);
  h += sec('1 · Onde?') + `<div class="seg segw">${V5_TAT_L.map(([id, n]) => `<button class="${V5.tatLoc === id ? 'on' : ''}" onclick="V5.tatLoc='${id}';V5.prev=null;renderPanel(true)">${n}</button>`).join('')}</div>`;
  const L = V5_TAT_L.find(x => x[0] === V5.tatLoc), cur = a.tats.find(t => t.startsWith(V5.tatLoc + ':'));
  h += sec('2 · Desenho');
  h += `<div class="v5grid">${Object.entries(TATS).map(([id, n]) => {
    const p = v5P(V5_TAT_P[id] * L[2]), tats = [...a.tats.filter(t => !t.startsWith(V5.tatLoc + ':')), `${V5.tatLoc}:${id}`], on = cur === `${V5.tatLoc}:${id}`;
    return `<button class="v5c tat ${on ? 'cur' : ''} ${V5.prev && V5.prev.v === id ? 'sel' : ''}" onclick="v5Preview('tat','${id}',${p},'Tatuagem ${n.replace(/'/g, '')} (${L[1].toLowerCase()})',${JSON.stringify({ tats }).replace(/"/g, '&quot;')})"><img src="${v5TatImg(id)}" alt=""><b>${n}</b><small>${on ? 'Atual' : kzShort(p)}</small></button>`;
  }).join('')}</div>`;
  if (a.tats.length) {
    h += sec('As tuas tatuagens') + list(a.tats.map(t => { const [l, id] = t.split(':'); const LL = V5_TAT_L.find(x => x[0] === l); return btnItem('🖋️', TATS[id] || id, (LL ? LL[1] : l) + ' · remover com laser', kzShort(v5P(150000)), `v5TatRemover('${t}')`); }));
  }
  h += `<p class="apnote">Máximo 4 tatuagens visíveis. Ficam à mostra com manga curta ou sem mangas, e toda a gente online vê.</p>`;
  return h;
}
function v5TatRemover(t) {
  const a = v5A(); if (!vrNearLoc('salao', 30)) return toast('Vem ao Kianda Style.');
  if (!pay(v5P(150000))) return;
  a.tats = a.tats.filter(x => x !== t); addLog('🖋️ Removeste uma tatuagem com laser. Doeu mais do que fazer! ' + fx({ felicidade: -2 })); v5Look(); renderPanel(true);
}
PANELS.salao = {
  ico: '💈', t: 'Kianda Style · Salão & Tattoo', sub: 'Barbeiro, cabeleireira, unhas e tatuador · Centro Habitacional',
  tabs: [['cabelo', '💈 Cabelo', v5SalaoCabelo], ['cor', '🎨 Cor', v5SalaoCor], ['beleza', '💅 Barba & Beleza', v5SalaoBeleza], ['tat', '🖋️ Tatuagens', v5SalaoTat]],
};
(function () { const _st = setTab; setTab = function (t) { V5.prev = null; return _st.apply(this, arguments); }; })();
Object.assign(LOC_POS, { salao: { x: -150, z: 46.8, ico: '💈', n: 'Kianda Style · Salão & Tattoo', zona: 'Centro Habitacional' } });
Object.assign(HIT_BOXES, { salao: [-150, 39.5, 16, 9, 6.5] });
/* a antiga atividade "Salão / Barbeiro" passa a levar ao salão verdadeiro */
(function () { const a = ATIV.find(x => x.id === 'salao'); if (a) a.d = 'Ou vai ao Kianda Style escolher o teu estilo'; })();

/* edifício no mapa (praça do Centro Habitacional, ao lado do Sabor da Banda) */
function v5Build() {
  decor = new T.Group(); worldScene.add(decor);
  bldg(-150, 39.5, 16, 9, 6.5, { face: '#1d1a24', glass: '#ff4fa0', kind: 'glass', noTop: true, noShops: true, base: '#111' });
  mesh(bx(16.4, .6, .3), mat('#ff2f8a'), -150, 6.1, 44.15, decor, false);
  V5.sign = sign('KIANDA STYLE', 10, '#111', '#ff4fa0', 'BARBEARIA · SALÃO · TATTOO', -150, 4.9, 44.2, 0);
  canopy(-150, 44.9, 7, 2, 3.1, '#111', '#ff4fa0', 0);
  /* poste de barbeiro às riscas, a rodar */
  const pg = new T.Group(); pg.position.set(-155.4, 0, 44.6); worldScene.add(pg);
  mesh(cyl(.2, .2, .15, 12), mat('#ddd', { metalness: .7 }), 0, 1.2, 0, pg, false); mesh(cyl(.2, .2, .15, 12), mat('#ddd', { metalness: .7 }), 0, 2.55, 0, pg, false);
  const tex = ctex(64, 128, x => { x.fillStyle = '#fff'; x.fillRect(0, 0, 64, 128); for (let i = -4; i < 10; i++) { x.fillStyle = i % 2 ? '#c8102e' : '#1f63c9'; x.beginPath(); x.moveTo(0, i * 16); x.lineTo(64, i * 16 + 32); x.lineTo(64, i * 16 + 40); x.lineTo(0, i * 16 + 8); x.fill(); } });
  tex.wrapT = T.RepeatWrapping; const pm = new T.MeshBasicMaterial({ map: tex });
  mesh(cyl(.16, .16, 1.2, 14), pm, 0, 1.88, 0, pg, false); V5.pole = tex;
  mesh(new T.SphereGeometry(.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#ddd', { metalness: .7 }), 0, 2.62, 0, pg, false);
  /* cadeiras de espera na rua */
  [-145.5, -144].forEach(x => { mesh(bx(1.1, .1, .9), mat('#222'), x, .5, 46, decor, false); mesh(bx(1.1, .8, .1), mat('#222'), x, .9, 46.45, decor, false); });
  worldScene.remove(decor); worldScene.add(mergeStatic(decor)); decor = null;
}
(function () { const _b = buildWorld; buildWorld = function () { const r = _b.apply(this, arguments); try { v5Build(); } catch (e) { console.error('v5Build', e); } return r; }; })();

/* interior do salão */
IV_ROOMS.salao = D => {
  ivRoom(D, { w: 15, d: 10, h: 4.2, ftex: ivFloorTex('tile', '#1a1a1a', '#f2f2f2'), frep: 4, fr: .3, wall: '#f6f0f4', wains: '#1d1a24', trim: '#ff2f8a', bg: '#0e0b10', door: '#1d1a24' });
  IVP = D.back;
  ivNeon('KIANDA', -3.2, 3.62, -4.95, 0, '#ff4fa0', 3.6); ivNeon('STYLE', -3.2, 3.0, -4.95, 0, '#ffffff', 2);
  ivArt(4.8, 2.5, -4.97, 0, 1.4, 1.8, 'angola', '#111'); ivClock(6.4, 3.3, -4.97, 0);
  IVP = D.st;
  /* 3 cadeiras de barbeiro com espelhos */
  [-5.6, -3.2, -.8].forEach((x, i) => {
    ivB(1.5, 1.6, .05, new T.MeshStandardMaterial({ color: '#cfe6f2', metalness: .9, roughness: .05 }), x, 1, -4.9);
    ivB(1.7, .08, .45, '#f2f2f2', x, .95, -4.7); ivCol(D, x, -4.7, 1.7, .5);
    [-1, 1].forEach(s => ivS(.05, ivGlow('#fff6e0', 1.4), x + s * .8, 2.2, -4.85));
    ivC(.3, .3, .06, '#ccc', x, 0, -3.4, 16, { metalness: .8 }); ivC(.07, .07, .4, '#bbb', x, .06, -3.4, 8, { metalness: .8 });
    ivB(.65, .14, .6, '#c8102e', x, .46, -3.4); ivB(.65, .7, .14, '#c8102e', x, .6, -3.12); ivB(.12, .1, .5, '#111', x - .36, .72, -3.4); ivB(.12, .1, .5, '#111', x + .36, .72, -3.4);
    ivCol(D, x, -3.4, .8, .8);
    if (i < 2) { ivNPC(D, x, -3.45, Math.PI, { mode: 'sit', seat: .6 }); ivNPC(D, x + .7, -2.7, Math.PI * 1.15, { mode: 'work', cfg: { shirt: '#111', pants: '#222' } }); }
  });
  /* zona de tranças: secadores */
  [2.4, 4].forEach((x, i) => { ivChair(x, -3.6, Math.PI, '#ff4fa0'); ivC(.32, .26, .38, '#f2f2f2', x, 1.35, -3.75, 16); ivC(.04, .04, 1.1, '#aaa', x, .3, -4.2, 6); ivCol(D, x, -3.7, .8, .8); ivNPC(D, x, -3.6, Math.PI, { mode: 'sit', fem: true }); });
  ivNPC(D, 3.2, -2.8, Math.PI, { mode: 'work', fem: true, cfg: { shirt: '#ff4fa0', pants: '#111' } });
  /* estúdio de tatuagem (canto direito, com cortina) */
  ivB(.08, 2.4, 3.2, '#2a2230', 5.3, 0, 2.2); ivCol(D, 5.3, 2.2, .2, 3.2);
  ivB(1.9, .5, .7, '#111', 6.3, 0, 1.6); ivB(1.9, .12, .7, '#2a2a2a', 6.3, .5, 1.6); ivCol(D, 6.3, 1.6, 2, .8);
  ivPlane(1.6, 1.1, ivCanvas('v5flash', 256, 176, (x, w, h) => { x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, w, h); ['tribal', 'angola', 'rosa', 'leao', 'kianda', 'mae'].forEach((id, k) => { try { x.drawImage(tatTex(id).map.image, 0, 0, 128, 128, 10 + (k % 3) * 82, 8 + Math.floor(k / 3) * 84, 72, 72); } catch (e) { } }); }), 6.7, 1.9, 4.95, Math.PI);
  ivNPC(D, 6.1, 2.6, Math.PI, { mode: 'work', cfg: { shirt: '#111', pants: '#111', extras: ['beard', 'chain'], tats: ['bL:tribal', 'bR:leao'], sleeves: 'none' } });
  /* sofá de espera, revistas e plantas */
  ivSofa(-5.2, 3.6, Math.PI, '#1d1a24', 2.6); ivCol(D, -5.2, 3.6, 2.8, 1); ivNPC(D, -5.8, 3.6, Math.PI, { mode: 'sit', seat: .5 }); ivNPC(D, -4.6, 3.6, Math.PI, { mode: 'sit', seat: .5, fem: true });
  ivTable(-2.6, 3.4, 1, .6, .45, '#111'); ivCol(D, -2.6, 3.4, 1.1, .7);
  ivCounter(1.4, 3.2, 2.4, .8, 1.05, '#1d1a24', '#ff4fa0'); ivCol(D, 1.4, 3.2, 2.5, .9);
  ivNPC(D, 1.4, 3.9, Math.PI, { fem: true, cfg: { shirt: '#ff4fa0', pants: '#111' } });
  ivPlant(-6.9, -4.4, 1); ivPlant(6.9, -4.4, 1); ivTV(-7.4, 2.2, .2, Math.PI / 2, 1.4);
  ivLights(D, { hi: .85, ki: .7, points: [[-3, 3.6, -3, '#ffffff', .6, 10], [5.8, 3.4, 2, '#ff9ad0', .5, 8]] });
  ivStation(D, { x: -3.2, z: -2.2, ry: Math.PI, tab: 'cabelo', ico: '💈', label: 'Cadeira · Cortar o cabelo', hit: [-3.2, -3.4, 4, 1.2, 1.8] });
  ivStation(D, { x: 3.2, z: -2.2, ry: Math.PI, tab: 'cor', ico: '🎨', label: 'Tranças & cor', hit: [3.2, -3.7, 2.6, 1, 1.8] });
  ivStation(D, { x: 1.4, z: 2.2, ry: 0, tab: 'beleza', ico: '💅', label: 'Unhas · barba · maquilhagem', small: true, hit: [1.4, 3.2, 2.5, .9, 1.6] });
  ivStation(D, { x: 4.4, z: 1.2, ry: -Math.PI / 2, tab: 'tat', ico: '🖋️', label: 'Estúdio de tatuagem', hit: [6.3, 1.6, 2, .8, 1.6] });
};
if (!IV_IDS.includes('salao')) IV_IDS.push('salao');
if (typeof V2_STAFF !== 'undefined') V2_STAFF.salao = 'Bem-vindo(a) ao Kianda Style! Corte, tranças, unhas ou tattoo? Senta-te.';
if (typeof V2_CHAT !== 'undefined') V2_CHAT.salao = ['Esse fade ficou limpo, mano!', 'As box braids demoram, mas valem a pena.', 'Vou fazer a estrela de Angola no braço.'];

/* =========================================================
   CORPO QUE MUDA COM A VIDA
   ========================================================= */
const V5_FOOD_G = { pao: .012, funge: .006, cafe: 0, mufete: -.003, mall: .022, casa: .002, zunga: .004, cantina: .005, rest: .01, muamba: .008, calulu: -.004, cabidela: .012, grelhada: .026, cocada: .012, mucua: -.003, cafeb: .004 };
function v5Corpo(dm, dg, why) {
  const a = v5A(), m0 = a.musc, g0 = a.gord;
  a.musc = +v5Clamp(a.musc + dm).toFixed(3); a.gord = +v5Clamp(a.gord + dg).toFixed(3);
  const st = v => Math.round(v * 5);
  if (st(a.musc) !== st(m0) || st(a.gord) !== st(g0)) {
    const up = st(a.musc) > st(m0) ? '💪 Estás mais musculado(a)!' : st(a.gord) > st(g0) ? '🍔 Ganhaste uns quilos…' : st(a.gord) < st(g0) ? '🏃 Perdeste peso!' : '📉 Perdeste músculo.';
    toast(up + (why ? ' ' + why : '')); v5Look();
  }
}
function v5Peso() { const a = v5A(), alt = (a.altura || 1) * (G.genero === 'F' ? 1.62 : 1.72); const kg = Math.round(alt * alt * (20 + a.gord * 16 + a.musc * 3.5)); return { kg, imc: kg / (alt * alt), alt }; }
function v5CorpoCard() {
  const a = v5A(), p = v5Peso();
  const bar = (v, c) => `<span class="v5bar"><i style="width:${Math.round(v * 100)}%;background:${c}"></i></span>`;
  const est = p.imc < 18.5 ? 'Abaixo do peso' : p.imc < 25 ? 'Peso saudável' : p.imc < 30 ? 'Excesso de peso' : 'Obesidade';
  return `<div class="v5corpo"><img src="${avatarShot(playerCfg(), '#23283a', true, 200, true)}" alt=""><div>
    <b>O teu corpo</b><div class="v5row">💪 Músculo ${bar(a.musc, '#2ecc71')} ${Math.round(a.musc * 100)}%</div>
    <div class="v5row">🍔 Gordura ${bar(a.gord, '#ff9f43')} ${Math.round(a.gord * 100)}%</div>
    <div class="v5row">⚖️ ${p.kg} kg · ${p.alt.toFixed(2)} m · IMC ${p.imc.toFixed(1)} <span class="v5tag ${p.imc >= 25 || p.imc < 18.5 ? 'bad' : ''}">${est}</span></div>
    <small>Treinar e correr dá músculo e queima gordura. Comida de rua e de festa engorda. Sem treino, o músculo vai-se. Depois dos 35 é mais fácil engordar.</small></div></div>`;
}
(function () {
  if (PANELS.ginasio && PANELS.ginasio.body) { const _b = PANELS.ginasio.body; PANELS.ginasio.body = function () { return v5CorpoCard() + _b.apply(this, arguments); }; }
  const _ra = runAtiv; runAtiv = function (id) {
    const ac = G.acoes, r = _ra.apply(this, arguments);
    if (G.acoes < ac) { const a = v5A(); a.trAno = (a.trAno || 0) + 1;
      if (id === 'ginasio') v5Corpo(.06, -.02, ''); else if (id === 'basquete' || id === 'futebol') v5Corpo(.03, -.018, ''); else if (id === 'farra' || id === 'kuduro') v5Corpo(0, -.012, ''); }
    return r;
  };
  const eat = (fn, idOf) => function () {
    const k = G.dinheiro, r = fn.apply(this, arguments);
    if (G.dinheiro < k) { const id = idOf(arguments), vr = vrG(); let g = V5_FOOD_G[id] != null ? V5_FOOD_G[id] : .005; if ((vr.fome || 0) >= 96) g *= 1.6; if (G.idade >= 35) g *= 1.25; v5Corpo(0, g, ''); }
    return r;
  };
  if (typeof vrComer === 'function') vrComer = eat(vrComer, a => a[0]);
  if (typeof v3Comer === 'function') v3Comer = eat(v3Comer, a => a[1]);
  const _ay = ageUpLogic; ageUpLogic = function () {
    const r = _ay.apply(this, arguments);
    try {
      const a = v5A(), tr = a.trAno || 0; a.trAno = 0;
      let dm = tr >= 4 ? 0 : -(a.musc * (G.idade >= 50 ? .35 : .2)), dg = G.idade >= 35 ? .02 : 0;
      if (G.idade >= 60) dm -= .03;
      a.musc = +v5Clamp(a.musc + dm).toFixed(3); a.gord = +v5Clamp(a.gord + dg).toFixed(3);
      if (a.gord > .62) addLog('⚖️ O médico avisou: o excesso de peso está a prejudicar a tua saúde. ' + fx({ saude: -R(2, 4) }), 'bad');
      else if (a.musc > .55 && a.gord < .35) addLog('💪 Corpo em forma! ' + fx({ saude: 2, aparencia: 1 }), 'good');
    } catch (e) { }
    return r;
  };
})();

/* =========================================================
   RODA DE GESTOS E DANÇAS
   ========================================================= */
const V5_GEST = [['wave', '👋', 'Acenar'], ['clap', '👏', 'Palmas'], ['cheer', '🎉', 'Festejar'], ['laugh', '😂', 'Rir'], ['love', '💖', 'Amor'], ['kiss', '😘', 'Beijinho'], ['yes', '👍', 'Fixe'], ['no', '👎', 'Nada disso'],
  ['shrug', '🤷', 'Sei lá'], ['facepalm', '🤦', 'Ai, ai'], ['angry', '😠', 'Zangado'], ['point', '👉', 'Apontar'], ['bow', '🙇', 'Vénia'], ['think', '💡', 'Pensar'], ['sit', '🪑', 'Sentar'], ['pushup', '💪', 'Flexões']];
const V5_DANCE = [['kuduro', '🎶', 'Kuduro'], ['kizomba', '💃', 'Kizomba'], ['semba', '🎵', 'Semba'], ['afro', '🕺', 'Afro-house']];
function v5Wheel(on) {
  V5.wheel = on == null ? !V5.wheel : on;
  let el = document.getElementById('v5wheel');
  if (!V5.wheel) { if (el) el.classList.add('hidden'); return; }
  if (!el) { document.body.insertAdjacentHTML('beforeend', '<div id="v5wheel" class="hidden" onclick="if(event.target.id===\'v5wheel\')v5Wheel(false)"></div>'); el = document.getElementById('v5wheel'); }
  const ring = (arr, r, cls) => arr.map(([id, ico, t], i) => { const a = -Math.PI / 2 + i / arr.length * Math.PI * 2; return `<button class="v5w ${cls}" style="left:calc(50% + ${Math.cos(a) * r}px);top:calc(50% + ${Math.sin(a) * r}px)" onclick="v5Emote('${id}')"><span>${ico}</span><small>${t}</small></button>`; }).join('');
  el.innerHTML = `<div class="v5wr"><div class="v5wbg"></div>${ring(V5_GEST, 150, '')}${ring(V5_DANCE, 78, 'd')}<button class="v5wc" onclick="v5Wheel(false);v5Foto(true)"><span>📸</span><small>Modo foto</small></button></div><div class="v5wt">Gestos & danças · toda a gente online vê · <kbd>G</kbd></div>`;
  el.classList.remove('hidden'); SND.play('tap');
}
function v5Emote(id) {
  v5Wheel(false);
  if (!player || mode !== 'game') return;
  if (performance.now() < V5.emCd) return; V5.emCd = performance.now() + 700;
  playerEmote(id);
  if (EM_DANCE.includes(id) && typeof extraCount === 'function') try { extraCount('danca'); } catch (e) { }
}
(function () {
  const add = () => {
    const hb = document.querySelector('.hbtns'); if (!hb || document.getElementById('hbGest')) return;
    const b = document.createElement('button'); b.className = 'hb'; b.id = 'hbGest'; b.title = 'Gestos, danças e modo foto (G)'; b.onclick = () => v5Wheel();
    b.innerHTML = '🕺<small>Gestos</small>'; hb.appendChild(b);
  };
  const _u = updateWorld; updateWorld = function (dt) {
    const r = _u.apply(this, arguments);
    try { if (!document.getElementById('hbGest')) add(); v5Tick(dt); } catch (e) { console.error('v5Tick', e); }
    return r;
  };
  addEventListener('keydown', e => {
    if (mode !== 'game' || /INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return;
    if (e.code === 'KeyG' && !uiBlocked) v5Wheel();
    if (e.code === 'Escape') { if (V5.wheel) v5Wheel(false); if (V5.ph) v5Foto(false); }
  });
})();

/* =========================================================
   MODO FOTO
   ========================================================= */
const V5_FIL = [['Normal', 'none'], ['Vivo', 'saturate(1.45) contrast(1.08)'], ['Quente', 'sepia(.25) saturate(1.35) brightness(1.04)'], ['Frio', 'saturate(.95) hue-rotate(14deg) brightness(1.05)'], ['P&B', 'grayscale(1) contrast(1.15)'], ['Vintage', 'sepia(.6) contrast(.95) brightness(1.05)'], ['Neon', 'saturate(2) contrast(1.2) hue-rotate(-10deg)']];
const V5_MOLD = [['nada', 'Sem moldura'], ['polaroid', 'Polaroid'], ['bwe', 'Bwé Social'], ['cinema', 'Cinema']];
const V5_CAMS = [['selfie', 'Selfie', 0, 1.25, .12, 'selfie'], ['retrato', 'Retrato', 0, 3.2, .05, null], ['corpo', 'Corpo inteiro', 0, 6, .12, null], ['livre', 'Livre', .7, 8, .35, null]];
const V5_POSES = [['', 'Natural'], ['wave', 'Acenar'], ['cheer', 'Festejar'], ['love', 'Amor'], ['kiss', 'Beijinho'], ['point', 'Apontar'], ['think', 'Pensar'], ['yes', 'Fixe'], ['laugh', 'Rir'], ['kuduro', 'Kuduro'], ['kizomba', 'Kizomba'], ['sit', 'Sentado']];
function v5Foto(on) {
  if (on && (!player || mode !== 'game')) return;
  if (on && G.tel < 2) return toast('📸 Precisas de um smartphone com câmara.');
  let el = document.getElementById('v5ph');
  if (!on) {
    V5.ph = null; document.body.classList.remove('v5photo'); if (el) el.classList.add('hidden');
    if (renderer) renderer.domElement.style.filter = ''; uiBlocked = modalOpen || !!phoneApp || !!panelId;
    if (player) { player.emoteT = 0; } return;
  }
  closePanel(); if (typeof closePhone === 'function') closePhone();
  V5.ph = { cam: 'selfie', yaw: 0, d: 1.25, h: .12, pose: 'selfie', f: 0, m: 'nada' };
  if (!el) { document.body.insertAdjacentHTML('beforeend', '<div id="v5ph" class="hidden"></div>'); el = document.getElementById('v5ph'); v5PhDrag(el); }
  document.body.classList.add('v5photo'); uiBlocked = true; el.classList.remove('hidden'); v5PhUI(); SND.play('tap');
}
function v5PhUI() {
  const P = V5.ph, el = document.getElementById('v5ph'); if (!P || !el) return;
  const chips = (arr, cur, fn) => arr.map(([id, n], i) => `<button class="${(typeof cur === 'number' ? i === cur : id === cur) ? 'on' : ''}" onclick="${fn(id, i)}">${n}</button>`).join('');
  const onde = v5Onde();
  el.innerHTML = `<div class="v5frm ${P.m}"><div class="v5cap">${P.m === 'bwe' ? '@' + esc(G.nome.toLowerCase().replace(/\s+/g, '_')) : P.m === 'polaroid' ? esc(onde) + ' · ' + G.ano : P.m === 'cinema' ? esc(onde.toUpperCase()) : ''}</div></div>
    <div class="v5top"><button onclick="v5Foto(false)">✕</button><b>📸 Modo Foto</b><small>Arrasta para rodar · roda do rato / pinça para zoom</small></div>
    <div class="v5bot">
      <div class="v5chips"><i>Câmara</i>${chips(V5_CAMS, P.cam, id => `v5PhCam('${id}')`)}</div>
      <div class="v5chips"><i>Pose</i>${chips(V5_POSES, P.pose || '', id => `V5.ph.pose='${id}';player.emAge=0;v5PhUI()`)}</div>
      <div class="v5chips"><i>Filtro</i>${chips(V5_FIL.map(([n]) => [n, n]), P.f, (id, i) => `V5.ph.f=${i};v5PhUI()`)}</div>
      <div class="v5chips"><i>Moldura</i>${chips(V5_MOLD, P.m, id => `V5.ph.m='${id}';v5PhUI()`)}</div>
      <button class="v5shut" onclick="v5Disparar()" aria-label="Tirar foto"></button>
    </div>`;
  if (renderer) renderer.domElement.style.filter = V5_FIL[P.f][1] === 'none' ? '' : V5_FIL[P.f][1];
}
function v5PhCam(id) { const C = V5_CAMS.find(c => c[0] === id), P = V5.ph; P.cam = id; P.yaw = C[2]; P.d = C[3]; P.h = C[4]; if (C[5]) P.pose = C[5]; else if (P.pose === 'selfie') P.pose = ''; if (player) player.emAge = 0; v5PhUI(); }
function v5PhDrag(el) {
  let d = null, pin = null;
  el.addEventListener('pointerdown', e => { if (e.target.closest('button,.v5bot,.v5top')) return; d = { x: e.clientX, y: e.clientY }; });
  addEventListener('pointermove', e => { if (!d || !V5.ph) return; V5.ph.yaw -= (e.clientX - d.x) * .008; V5.ph.h = Math.max(-.35, Math.min(1.1, V5.ph.h + (e.clientY - d.y) * .004)); d = { x: e.clientX, y: e.clientY }; });
  addEventListener('pointerup', () => d = null);
  el.addEventListener('wheel', e => { if (!V5.ph) return; V5.ph.d = Math.max(.9, Math.min(14, V5.ph.d * (e.deltaY > 0 ? 1.1 : .9))); e.preventDefault(); }, { passive: false });
  el.addEventListener('touchmove', e => { if (!V5.ph || e.touches.length !== 2) { pin = null; return; } const k = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pin) V5.ph.d = Math.max(.9, Math.min(14, V5.ph.d * pin / k)); pin = k; d = null; }, { passive: true });
}
function v5Onde() { return typeof inInt !== 'undefined' && inInt && LOC_POS[inInt.loc] ? LOC_POS[inInt.loc].n : nearLoc && LOC_POS[nearLoc] ? LOC_POS[nearLoc].n : G.cidade.mun; }
function v5PhCamUpdate() {
  const P = V5.ph; if (!P || !player) return;
  if (P.pose) { if (player.emote !== P.pose) { player.emote = P.pose; player.emAge = 0; } player.emoteT = Math.max(player.emoteT, 1.5); }
  const S = (typeof inInt !== 'undefined' && inInt) ? 1 : BODY_S, head = new T.Vector3(); player.P.head.getWorldPosition(head);
  const tgt = P.cam === 'corpo' || P.cam === 'livre' ? new T.Vector3(player.g.position.x, head.y * .55, player.g.position.z) : P.cam === 'retrato' ? head.clone().add(new T.Vector3(0, -.35 * S, 0)) : head;
  const yaw = playerYaw + P.yaw, d = P.d * S;
  camera.position.set(tgt.x + Math.sin(yaw) * d * Math.cos(P.h), tgt.y + Math.sin(P.h) * d + (P.cam === 'selfie' ? .12 * S : 0), tgt.z + Math.cos(yaw) * d * Math.cos(P.h));
  if (P.cam === 'selfie') { const r = new T.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)); camera.position.addScaledVector(r, -.22 * S); }
  camera.lookAt(tgt);
}
function v5Disparar() {
  const P = V5.ph; if (!P || !renderer) return;
  const ph = document.getElementById('v5ph'); if (ph) { const f = document.createElement('div'); f.className = 'v5fl'; ph.appendChild(f); setTimeout(() => f.remove(), 450); }
  SND.play('shutter');
  v5PhCamUpdate(); renderer.render(curScene, camera);
  const src = renderer.domElement, W = 480, H = 600, out = document.createElement('canvas'); out.width = W; out.height = H;
  const x = out.getContext('2d'), sw = src.width, sh = src.height, k = Math.min(sw / W, sh / H), cw = W * k, ch = H * k;
  const pad = P.m === 'polaroid' ? 22 : P.m === 'bwe' ? 10 : 0, bot = P.m === 'polaroid' ? 92 : pad;
  x.fillStyle = P.m === 'polaroid' ? '#fbfaf6' : '#000'; x.fillRect(0, 0, W, H);
  if (P.m === 'bwe') { const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#f9a03f'); g.addColorStop(.5, '#e1306c'); g.addColorStop(1, '#833ab4'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
  x.filter = V5_FIL[P.f][1];
  const iw = W - pad * 2, ih = H - pad - bot, kk = Math.min(sw / iw, sh / ih);
  x.drawImage(src, (sw - iw * kk) / 2, (sh - ih * kk) / 2, iw * kk, ih * kk, pad, pad, iw, ih);
  x.filter = 'none';
  const onde = v5Onde();
  if (P.m === 'polaroid') { x.fillStyle = '#2a2a2a'; x.font = 'italic 600 26px "Segoe Script","Comic Sans MS",cursive'; x.textAlign = 'center'; x.fillText(`${onde} · ${G.ano}`, W / 2, H - 40, W - 40); }
  if (P.m === 'cinema') { x.fillStyle = '#000'; x.fillRect(0, 0, W, 64); x.fillRect(0, H - 64, W, 64); x.fillStyle = '#ffcb00'; x.font = '800 15px system-ui'; x.textAlign = 'center'; x.fillText(onde.toUpperCase(), W / 2, H - 28, W - 40); }
  if (P.m === 'bwe') { x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(pad, pad, iw, 40); x.fillStyle = '#fff'; x.font = '800 16px system-ui'; x.textAlign = 'left'; x.fillText('@' + G.nome.toLowerCase().replace(/\s+/g, '_'), pad + 12, pad + 26); x.textAlign = 'right'; x.fillText('♥ ' + numShort(G.seg || 0), W - pad - 12, pad + 26); }
  x.textAlign = 'right'; x.font = '700 11px system-ui'; x.fillStyle = P.m === 'polaroid' ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.6)'; x.fillText('PRÓXIMA ENCARNAÇÃO', W - pad - 10, H - bot - (P.m === 'polaroid' ? -18 : 10));
  const url = out.toDataURL('image/jpeg', .84);
  V5.shot = { url, onde };
  openModal(`<div class="v5shot"><img src="${url}" alt=""></div><div class="choices"><button class="btn btn-yel" onclick="v5Guardar(true)">↗️ Publicar no Bwé Social</button><button class="btn" onclick="v5Guardar(false)">🖼️ Só guardar</button><button class="btn btn-ghost" onclick="closeModal()">Descartar</button></div>`, true);
}
const v5FKey = () => 'pe3d_v5f_' + ((typeof Acc !== 'undefined' && Acc.user && (Acc.user.id || Acc.user.email)) || G.nome);
function v5FStore() { try { return JSON.parse(localStorage.getItem(v5FKey()) || '{}'); } catch (e) { return {}; } }
function v5FSave(m) {
  const keep = new Set((G.fotos || []).map(f => f.pid).filter(Boolean)); Object.keys(m).forEach(k => { if (!keep.has(k)) delete m[k]; });
  for (let i = 0; i < 4; i++) { try { localStorage.setItem(v5FKey(), JSON.stringify(m)); return true; } catch (e) { const ks = Object.keys(m); if (!ks.length) return false; delete m[ks[0]]; } }
  return false;
}
function v5Guardar(pub) {
  const S = V5.shot; if (!S) return; closeModal();
  const pid = 'f' + Date.now().toString(36);
  G.fotos = G.fotos || []; G.fotos.unshift({ cfg: playerCfg(), bg: '#2a2028', idade: G.idade, ano: G.ano, onde: 'em ' + S.onde, f: 0, pid });
  if (G.fotos.length > 12) G.fotos.length = 12;
  const m = v5FStore(); m[pid] = S.url; v5FSave(m);
  if (pub) { const n = (G.feed || []).length; v5Foto(false); postSocial('selfie'); if (G.feed && G.feed.length > n) G.feed[0].pid = pid; if (typeof mpSys === 'function') { } }
  else toast('🖼️ Foto guardada na galeria do telemóvel.');
  save(); V5.shot = null;
}
(function () { const _c = closeModal; closeModal = function () { const r = _c.apply(this, arguments); if (V5.ph) uiBlocked = true; return r; }; })();
function v5FImg(pid) { return pid ? v5FStore()[pid] : null; }
/* galeria e Bwé Social mostram as fotos reais */
(function () {
  if (PHONE_VIEWS.galeria) { const _g = PHONE_VIEWS.galeria; PHONE_VIEWS.galeria = function () { let h = _g.apply(this, arguments); try { const m = v5FStore(); (G.fotos || []).forEach(x => { if (x.pid && m[x.pid]) { const a = avatarShot(x.cfg, x.bg, true); const i = h.indexOf(a); if (i >= 0) h = h.slice(0, i) + m[x.pid] + h.slice(i + a.length); } }); } catch (e) { } return h; }; }
  if (PHONE_VIEWS.bwe) { const _b = PHONE_VIEWS.bwe; PHONE_VIEWS.bwe = function () { let h = _b.apply(this, arguments); try { const m = v5FStore(), ps = (G.feed || []).filter(f => f.pid && m[f.pid]).slice(0, 9); const strip = `<div class="apsec">As tuas fotos publicadas</div>${ps.length ? `<div class="v5feed">${ps.map(f => `<div><img src="${m[f.pid]}" alt=""><small>♥ ${numShort(Math.max(0, f.g))}</small></div>`).join('')}</div>` : ''}<button class="pbtn" style="width:100%;margin:6px 0 2px" onclick="closePhone();v5Foto(true)">📸 Abrir o modo foto</button>`; const k = h.indexOf('<div class="apsec">Feed</div>'); h = k >= 0 ? h.slice(0, k) + strip + h.slice(k) : h + strip; } catch (e) { } return h; }; }
})();

/* =========================================================
   CINEMÁTICA DE NASCIMENTO
   ========================================================= */
function v5CineOk() { try { return !navigator.webdriver || localStorage.getItem('pe3d_cine') === '1'; } catch (e) { return true; } }
function v5Beat(t0) {
  const c = SND.ctx; if (!c || !SND.cfg.sfx) return;
  const out = c.createGain(); out.gain.value = .5 * (SND.cfg.vol || .8); out.connect(c.destination);
  const thump = (t, v) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(38, t + .14); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); g.connect(out); o.start(t); o.stop(t + .25); };
  for (let i = 0; i < 4; i++) { const t = t0 + i * .82; thump(t, .9); thump(t + .2, .6); }
  /* acorde suave (pad) no mapa e brilho no nascimento */
  [196, 246.9, 293.7, 392].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = f; const t = t0 + 3.1; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + 1.2); g.gain.linearRampToValueAtTime(.04, t + 3); g.gain.linearRampToValueAtTime(0, t + 4.4); o.connect(g); g.connect(out); o.start(t); o.stop(t + 4.6); });
  [784, 988, 1175, 1568, 1976].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; const t = t0 + 6.4 + i * .09; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + 1.4); o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.5); });
}
function v5Cine(b, done) {
  if (!v5CineOk()) return done();
  document.body.insertAdjacentHTML('beforeend', `<div id="v5cin"><canvas></canvas><div class="lb t"></div><div class="lb b"></div><div class="v5ct"></div><button class="v5skip">Saltar ⏭</button></div>`);
  const el = document.getElementById('v5cin'), cv = el.querySelector('canvas'), x = cv.getContext('2d'), tx = el.querySelector('.v5ct');
  let W = 0, H = 0; const fit = () => { W = cv.width = innerWidth * Math.min(devicePixelRatio, 2); H = cv.height = innerHeight * Math.min(devicePixelRatio, 2); }; fit();
  const t0 = performance.now(), END = 11.2; let fin = false, lastTxt = '';
  const prov = b.prov && b.prov.n, path = typeof ANG_GEO !== 'undefined' && prov && ANG_GEO.p[prov] ? new Path2D(ANG_GEO.p[prov].d) : null;
  const all = typeof ANG_GEO !== 'undefined' ? Object.values(ANG_GEO.p).map(p => new Path2D(p.d)) : [];
  const stars = Array.from({ length: 120 }, () => [Math.random(), Math.random(), Math.random()]);
  const origem = b.rua ? 'Na rua, sem casa e sem família.' : b.cls ? (/^fam[ií]lia/i.test(b.cls.t) ? `Numa ${b.cls.t.toLowerCase()}.` : `Numa família ${b.cls.t.toLowerCase()}.`) : '';
  const say = s => { if (s === lastTxt) return; lastTxt = s; tx.innerHTML = s ? `<div>${s}</div>` : ''; };
  try { if (SND.ctx && SND.ctx.state !== 'running') SND.ctx.resume(); v5Beat(SND.ctx ? SND.ctx.currentTime + .1 : 0); } catch (e) { }
  V5.cin = { t0, y0: camYaw, d0: camDist, p0: camPitch }; document.body.classList.add('v5cine');
  const finish = () => { if (fin) return; fin = true; V5.cin = null; document.body.classList.remove('v5cine'); el.classList.add('out'); setTimeout(() => el.remove(), 600); done(); };
  el.querySelector('.v5skip').onclick = finish;
  const frame = () => {
    if (fin) return; const t = (performance.now() - t0) / 1000; if (t > END) return finish();
    x.clearRect(0, 0, W, H);
    const S = Math.min(W, H) / 600;
    if (t < 7.2) {
      const a = t < 6.6 ? 1 : 1 - (t - 6.6) / .6;
      x.globalAlpha = a; const g = x.createRadialGradient(W / 2, H * .55, 10, W / 2, H / 2, Math.max(W, H) * .7); g.addColorStop(0, t < 3.2 ? '#1a0d12' : '#0d1a2e'); g.addColorStop(1, '#050308'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      stars.forEach(([sx, sy, sz]) => { x.fillStyle = `rgba(255,240,200,${.25 + .5 * Math.abs(Math.sin(t * 2 + sz * 9))})`; x.fillRect(sx * W, sy * H * .8, 1.5 * S + sz * 2 * S, 1.5 * S + sz * 2 * S); });
      if (t < 3.2) { const beat = Math.max(0, Math.sin((t % .82) / .82 * Math.PI * 2)) ** 4; x.fillStyle = `rgba(200,16,46,${.18 + beat * .35})`; x.beginPath(); x.arc(W / 2, H / 2, (60 + beat * 22) * S, 0, 7); x.fill(); say(t < 1.6 ? 'Algures em Angola…' : `Ano ${G.ano}`); }
      else if (all.length) {
        const k = Math.min(1, (t - 3.2) / 1.6), e = k * k * (3 - 2 * k), sc = S * (.78 + e * .14);
        x.save(); x.translate(W / 2 - ANG_GEO.w * sc / 2, H / 2 - ANG_GEO.h * sc / 2); x.scale(sc, sc);
        x.lineWidth = 1.2 / sc * S; all.forEach(p => { x.fillStyle = 'rgba(255,255,255,.05)'; x.fill(p); x.strokeStyle = `rgba(255,203,0,${.25 + e * .35})`; x.stroke(p); });
        if (path) { const pu = .55 + .45 * Math.sin(t * 5); x.fillStyle = `rgba(200,16,46,${.35 + pu * .4})`; x.fill(path); x.lineWidth = 2.2 / sc * S; x.strokeStyle = '#ffcb00'; x.stroke(path); }
        x.restore(); say(`${prov || ''}${G.cidade && G.cidade.mun ? ' · ' + G.cidade.mun : ''}`);
      }
      x.globalAlpha = 1;
      if (t > 6.3 && t < 7.2) { x.fillStyle = `rgba(255,250,235,${1 - Math.abs(t - 6.6) / .6})`; x.fillRect(0, 0, W, H); }
    }
    if (t >= 6.5 && t < 8.3) say(`Nasceu <b>${esc(G.nome)}</b>`);
    else if (t >= 8.3 && t < 9.7) say(origem);
    else if (t >= 9.7) say('16 anos depois… <b>a tua vida começa agora.</b>');
    el.classList.toggle('bars', t > 6.6);
    requestAnimationFrame(frame);
  };
  addEventListener('resize', fit, { once: true });
  requestAnimationFrame(frame);
}
(function () { const _br = birthReveal; birthReveal = function (b) { const a = arguments, me = this; try { v5A(); } catch (e) { } v5Cine(b, () => _br.apply(me, a)); }; })();
function v5CinCam() {
  const C = V5.cin; if (!C || !player) return;
  const t = (performance.now() - C.t0) / 1000; if (t < 6.4) { camYaw = C.y0 + 2.4; camDist = C.d0 * 4; camPitch = .9; return; }
  const k = Math.min(1, (t - 6.4) / 4.6), e = 1 - Math.pow(1 - k, 3);
  camYaw = C.y0 + 2.4 * (1 - e); camDist = C.d0 * (4 - 3 * e); camPitch = .9 + (C.p0 - .9) * e;
  if (k >= 1) { camYaw = C.y0; camDist = C.d0; camPitch = C.p0; }
}

/* =========================================================
   TV: abertura do telejornal com voz, reportagens, meteorologia e intervalos
   ========================================================= */
const V5_ADS = () => (typeof AD_BASE !== 'undefined' && AD_BASE.length ? AD_BASE : [{ marca: 'Kitanda Super', t: 'Tudo mais barato!', s: 'Arroz, óleo e fuba com 20% de desconto', cta: 'Todos os dias', cor: '#e63946' }]);
function v5AdBreak(T) { const c = T % 180; return c < 12; }
function v5DrawAd(x, T) {
  const A = V5_ADS(), i = Math.floor(T / 180 + Math.floor((T % 180) / 6)) % A.length, ad = A[i], k = (T % 6) / 6;
  x.fillStyle = ad.cor || '#c8102e'; x.fillRect(0, 0, 320, 180);
  x.fillStyle = 'rgba(255,255,255,.12)'; for (let j = 0; j < 7; j++) { x.beginPath(); x.arc(40 + j * 48, 90 + Math.sin(T * 2 + j) * 30, 30 + j * 4, 0, 7); x.fill(); }
  const hx = (ad.cor || '#c8102e').replace('#', ''), lum = hx.length >= 6 ? (parseInt(hx.slice(0, 2), 16) * .299 + parseInt(hx.slice(2, 4), 16) * .587 + parseInt(hx.slice(4, 6), 16) * .114) / 255 : .3, claro = lum > .55;
  if (claro) { x.fillStyle = 'rgba(0,0,0,.42)'; x.fillRect(0, 0, 320, 180); }
  const s = Math.min(1, k * 5); x.save(); x.translate(160, 66); x.scale(.6 + s * .4, .6 + s * .4);
  lvText(x, ad.marca.toUpperCase(), 0, 0, 290, '900 26px system-ui', '#fff', 'center'); x.restore();
  if (k > .18) lvText(x, ad.t, 160, 92, 290, '800 15px system-ui', claro ? '#fff3c4' : '#ffcb00', 'center');
  if (k > .32) lvWrap(x, ad.s, 160, 122, 270, 12, '600 10px system-ui', '#fff');
  if (k > .5) { x.fillStyle = '#fff'; x.fillRect(100, 140, 120, 22); lvText(x, ad.cta || 'Já!', 160, 155, 116, '800 10px system-ui', claro ? '#222' : (ad.cor || '#c8102e'), 'center'); }
  x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(250, 8, 62, 16); lvText(x, 'PUBLICIDADE', 281, 19, 60, '800 7.5px system-ui', '#fff', 'center');
}
function v5DrawMeteo(x, T) {
  const g = x.createLinearGradient(0, 0, 0, 180); g.addColorStop(0, '#0b3d7a'); g.addColorStop(1, '#4fa3e3'); x.fillStyle = g; x.fillRect(0, 0, 320, 180);
  if (typeof ANG_GEO !== 'undefined') {
    const sc = 138 / ANG_GEO.h; x.save(); x.translate(20, 34); x.scale(sc, sc);
    Object.entries(ANG_GEO.p).forEach(([n, p], i) => { const P = new Path2D(p.d); x.fillStyle = ['#7cc576', '#a6d96a', '#f2d16b', '#e8a35a'][i % 4]; x.fill(P); x.strokeStyle = '#fff'; x.lineWidth = 1.5 / sc; x.stroke(P); });
    x.restore();
  }
  const C = [['Luanda', 29, '☀'], ['Huambo', 22, '⛅'], ['Benguela', 27, '☀'], ['Lubango', 21, '☁'], ['Malanje', 25, '⛈'], ['Cabinda', 28, '⛅']];
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(178, 24, 134, 128);
  lvText(x, 'METEOROLOGIA', 186, 40, 120, '900 10px system-ui', '#ffcb00');
  C.forEach(([n, t, ic], i) => { const tt = t + Math.round(Math.sin(LIVE.now() / 3600 + i) * 2); lvText(x, n, 186, 58 + i * 15, 70, '700 9.5px system-ui', '#fff'); lvText(x, ic + ' ' + tt + '°', 304, 58 + i * 15, 50, '800 9.5px system-ui', '#fff', 'right'); });
  lvPerson(x, 150, 120, .7, '#7b4a2a', '#ad1457', '#1b0f08', (T % 6) < 4.5, T, true);
}
function v5DrawRep(x, T) {
  /* reportagem na rua: céu, prédios de Luanda, repórter com microfone */
  const g = x.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#7ec8e3'); g.addColorStop(1, '#ffe2b0'); x.fillStyle = g; x.fillRect(0, 0, 320, 180);
  for (let i = 0; i < 12; i++) { const h = 40 + (i * 37 % 50); x.fillStyle = ['#e8e2d4', '#c9d6e0', '#f2d16b', '#d9c2a5'][i % 4]; x.fillRect(i * 28 - ((T * 4) % 28), 120 - h, 24, h); x.fillStyle = 'rgba(30,60,90,.35)'; for (let j = 0; j < h / 10 - 1; j++) x.fillRect(i * 28 - ((T * 4) % 28) + 4, 126 - h + j * 10, 16, 4); }
  x.fillStyle = '#5b5d61'; x.fillRect(0, 120, 320, 60); x.fillStyle = '#fff'; for (let i = 0; i < 8; i++) x.fillRect(i * 46 - ((T * 30) % 46), 148, 24, 3);
  const cx = 60 + ((T * 50) % 420); x.fillStyle = '#1f63c9'; x.fillRect(cx - 40, 128, 40, 14); x.fillStyle = '#fff'; x.fillRect(cx - 40, 128, 40, 4);
  lvPerson(x, 230, 102, 1, '#5a3215', '#2e7d32', '#111', (T % 7) < 5.5, T, false);
  x.fillStyle = '#111'; x.fillRect(206, 96, 4, 22); x.fillStyle = '#c62828'; x.fillRect(203, 90, 10, 9);
  const H = lvHeadlines(), hi = Math.floor(T / 9) % H.length;
  x.fillStyle = '#c62828'; x.fillRect(0, 140, 82, 16); lvText(x, 'REPORTAGEM', 6, 152, 76, '900 8.5px system-ui', '#fff');
  x.fillStyle = 'rgba(255,255,255,.92)'; x.fillRect(0, 156, 320, 20); lvText(x, H[hi], 8, 170, 304, '700 9.5px system-ui', '#111');
}
(function () {
  const _d = lvDrawTV; lvDrawTV = function (x, w, h, chId, t) {
    const T = LIVE.now();
    if (chId !== 'mus' && !(chId === 'desp' && lvMatchNow(T).live) && v5AdBreak(T)) {
      x.save(); x.setTransform(w / 320, 0, 0, h / 180, 0, 0); v5DrawAd(x, T); x.restore(); return;
    }
    if (chId === 'tj') {
      const c = T % 180;
      if (c < 17) { x.save(); x.setTransform(w / 320, 0, 0, h / 180, 0, 0); const k = (c - 12) / 5; const g = x.createLinearGradient(0, 0, 320, 180); g.addColorStop(0, '#0d2b5e'); g.addColorStop(1, '#c62828'); x.fillStyle = g; x.fillRect(0, 0, 320, 180); x.strokeStyle = 'rgba(255,255,255,.2)'; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(160, 90, 20 + i * 22 + k * 30, 0, 7); x.stroke(); } lvText(x, 'TELEJORNAL', 160, 92, 300, `900 ${28 + k * 6}px system-ui`, '#fff', 'center'); lvText(x, 'KALEMBA 1 · AS NOTÍCIAS DE ANGOLA', 160, 112, 300, '700 9px system-ui', '#ffcb00', 'center'); x.restore(); return; }
      if (c >= 120 && c < 150) { x.save(); x.setTransform(w / 320, 0, 0, h / 180, 0, 0); v5DrawRep(x, T); lvBug(x, LV_TV[0], true); x.restore(); return; }
      if (c >= 150) { x.save(); x.setTransform(w / 320, 0, 0, h / 180, 0, 0); v5DrawMeteo(x, T); lvBug(x, LV_TV[0], false); x.restore(); return; }
    }
    if (chId === 'nov') {
      const ep = T % 600;
      if (ep > 585) { x.save(); x.setTransform(w / 320, 0, 0, h / 180, 0, 0); x.fillStyle = '#2a0016'; x.fillRect(0, 0, 320, 180); lvText(x, 'NO PRÓXIMO EPISÓDIO…', 160, 80, 300, 'italic 900 18px Georgia,serif', '#ffd6e7', 'center'); lvText(x, LV_NOV.ln[Math.floor(T / 600 + 3) % LV_NOV.ln.length], 160, 104, 300, '600 10px system-ui', '#fff', 'center'); x.restore(); return; }
    }
    return _d.apply(this, arguments);
  };
  const _a = lvTvAudio; lvTvAudio = function () {
    const r = _a.apply(this, arguments);
    try {
      if (typeof SND === 'undefined' || !SND.ctx) return r;
      const on = lvTvActive() && lvTvCur() === 'tj', T = LIVE.now(), cyc = Math.floor(T / 180), c = T % 180;
      if (!on) { V5.tvTune = null; return r; }
      if (V5.tvTune == null) V5.tvTune = cyc;
      if (c >= 12 && c < 22 && V5.tvIntro !== cyc) { V5.tvIntro = cyc; SND.voice('tv_tj', { from: Math.max(0, c - 12.3), vol: phoneApp === 'tv' || LIVE.watch ? 1 : .6 }); }
    } catch (e) { }
    return r;
  };
})();

/* =========================================================
   TICK
   ========================================================= */
function v5Tick(dt) {
  if (V5.pole) V5.pole.offset.y = (V5.pole.offset.y + dt * .5) % 1;
  if (V5.cin) v5CinCam();
  if (V5.ph) v5PhCamUpdate();
  if (mode === 'game' && player && G && !V5.ph) {
    const p = playerPos, L = V5.lastP; V5.lastP = { x: p.x, z: p.z };
    if (L) { const d = Math.hypot(p.x - L.x, p.z - L.z), sp = d / Math.max(dt, .001); if (sp > 7 && sp < 30) { V5.runAcc += d; if (V5.runAcc > 400) { V5.runAcc = 0; v5Corpo(.004, -.006, '(corrida)'); } } }
  }
}
