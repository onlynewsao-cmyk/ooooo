
/* =========================================================
   PAINÉIS DOS CENTROS
   ========================================================= */
const VH_PAINT = { carro: 250000, moto: 60000, bike: 8000 };
function vhIdade(V) { return V.idade || (V.cat === 'bike' ? 0 : 18); }
function vhCard(id) {
  const V = VEIC[id], own = G.bens.includes(id), cor = vhCor(id), sell = Math.round(V.p * .55);
  const fuel = V.kml ? (V.ev ? `${V.kml} Kz/km (elétrico)` : `${V.kml} Kz/km`) : 'Sem combustível';
  const req = []; if (V.carta && !G.carta) req.push('carta de condução'); if (vhIdade(V) > G.idade) req.push(vhIdade(V) + '+ anos');
  return `<div class="vhcard ${own ? 'own' : ''}"><canvas data-veh="${id}" width="300" height="140"></canvas><div class="vhinfo">
    <b>${V.t}</b><small>${V.sub || ''}</small>
    <div class="vhspec"><span>🏁 ${V.vel} km/h</span><span>💺 Conforto ${V.conf}/5</span><span>⛽ ${fuel}</span>${V.tt ? '<span>⛰️ Todo-o-terreno</span>' : ''}${V.manut ? `<span>🔧 ${kzShort(V.manut)}/ano</span>` : ''}</div>
    ${V.d ? `<p>${V.d}</p>` : ''}${Object.keys(V.ef || {}).length ? `<p class="vhef">Ao comprar: ${Object.entries(V.ef).map(([k, v]) => `${LABEL[k] || k} +${v}`).join(' · ')}</p>` : ''}
    <div class="vhcores">${V.cores.map(c => `<button style="background:${c}" class="${c === cor ? 'on' : ''}" onclick="vhSetCor('${id}','${c}')" aria-label="cor"></button>`).join('')}${own && V.cores.length > 1 ? `<em>Pintura: ${kzShort(VH_PAINT[V.cat])}</em>` : ''}</div>
    ${req.length && !own ? `<div class="vhreq">Requer: ${req.join(' · ')}</div>` : ''}
    <div class="vhbtns">${own ? `<span class="vhown">✅ É teu</span><button onclick="vhSell('${id}')">Vender · ${kzShort(sell)}</button>` : `<button class="buy" onclick="vhBuy('${id}')">Comprar · ${kzShort(V.p)}</button>`}${V.cat !== 'bike' && !own ? `<button onclick="vhTest('${id}')">🔑 Test-drive</button>` : ''}</div>
  </div></div>`;
}
function vhSetCor(id, c) {
  const V = VEIC[id];
  if (G.bens.includes(id)) {
    if (vhCor(id) === c) return; const pr = VH_PAINT[V.cat];
    if (!confirm(`Pintar ${V.t} por ${kz(pr)}?`)) return; if (!pay(pr)) return; vhG().cor[id] = c; VH.cor[id] = c; toast('🎨 Pintura nova! Parece acabado de sair da fábrica.'); save(); refresh();
  } else VH.cor[id] = c;
  renderPanel(true);
}
function vhBuy(id) {
  const V = VEIC[id]; if (vhIdade(V) > G.idade) return toast(`🧒 Só a partir dos ${vhIdade(V)} anos.`);
  buyBem(id); if (G.bens.includes(id)) { vhG().cor[id] = vhCor(id); VH.sel[V.cat] = id; if (typeof SND !== 'undefined') SND.play(V.cat === 'bike' ? 'bell2' : 'car'); save(); }
  renderPanel(true);
}
function vhSell(id) { sellBem(id); renderPanel(true); }
function vhTest(id) {
  const V = VEIC[id], v = vhG(); if (V.carta && !G.carta) return toast('🪪 Precisas de carta de condução para fazer o test-drive.'); if (vhIdade(V) > G.idade) return toast(`🧒 Só a partir dos ${vhIdade(V)} anos.`);
  if (v.td[id] === G.ano) return toast('🔑 Já fizeste test-drive deste modelo este ano. O vendedor quer é que compres! 😅');
  v.td[id] = G.ano;
  trStart({ kind: V.cat === 'carro' ? 'car' : V.cat, D: { id: 'test', n: 'Test-drive na Marginal', km: 6, bio: ['cidade', 'costa'], f: 2, ico: '🔑', d: `Deste uma volta no ${V.t}. O vendedor diz que "é teu por um precinho"…`, acts: [], noVis: 1 }, veh: id, mod: V.mod, col: vhCor(id), conf: 0, vehN: V.t, dur: 13, noEv: true });
}
function vhPaintCv(c) {
  const id = c.dataset.veh, V = VEIC[id]; if (!V) return; const x = c.getContext('2d'), W = c.width, H = c.height;
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d1f27'); g.addColorStop(.7, '#2a2d38'); g.addColorStop(1, '#14151b'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W / 2, H * .82, 10, W / 2, H * .82, W * .5); rg.addColorStop(0, 'rgba(255,203,0,.22)'); rg.addColorStop(1, 'rgba(255,203,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  const col = vhCor(id), gy = H * .86;
  if (V.cat === 'carro') { const P = TR_CARP[V.mod] || TR_CARP.sedan; trCar2D(x, W / 2, gy, Math.min(1.15, 255 / (P.L + 30)), V.mod, col, .3, null); }
  else if (V.cat === 'moto') trMoto2D(x, W / 2, gy, 1.55, V.mod, col, .3, null);
  else trBike2D(x, W / 2, gy, 1.75, V.mod, col, .3, null);
}
(function () { const _r = renderPanel; renderPanel = function () { const r = _r.apply(this, arguments); try { document.querySelectorAll('#pBody canvas[data-veh]').forEach(vhPaintCv); } catch (e) { console.error(e); } return r; }; })();

/* ---------- passeios de estrada (carro / moto / bicicleta) ---------- */
function vhRentOk(cat) { const C = VH_CAT[cat]; if (G.idade < C.rentIdade) return `idade ${C.rentIdade}+`; if (cat !== 'bike' && !G.carta) return 'carta de condução'; return ''; }
function vhSel(cat) { const own = vhOwned(cat); let s = VH.sel[cat]; if (!s || (s !== 'rent' && !own.includes(s))) s = VH.sel[cat] = own[own.length - 1] || 'rent'; return s; }
function vhTripCost(cat, sel, d) {
  const C = VH_CAT[cat], kml = sel === 'rent' ? (cat === 'carro' ? 35 : cat === 'moto' ? 14 : 0) : VEIC[sel].kml;
  return Math.round(kml * d.km * 2 / 100) * 100 + (sel === 'rent' ? C.rent * Math.max(1, Math.ceil(d.km / 350)) : 0);
}
function vhRoadUI(cat) {
  const C = VH_CAT[cat], own = vhOwned(cat), sel = vhSel(cat), rent = vhRentOk(cat);
  let h = sec(`${C.ico} Com que veículo vais?`) + `<div class="vhpick">${own.map(id => `<button class="${sel === id ? 'on' : ''}" onclick="VH.sel.${cat}='${id}';renderPanel(true)"><canvas data-veh="${id}" width="300" height="140"></canvas><b>${VEIC[id].t}</b><small>O teu</small></button>`).join('')}
    <button class="${sel === 'rent' ? 'on' : ''}" onclick="VH.sel.${cat}='rent';renderPanel(true)"><div class="vhrent">🔑</div><b>Alugar</b><small>${kzShort(C.rent)}/dia${rent ? ' · requer ' + rent : ''}</small></button></div>`;
  if (!own.length) h += noteBox(`Ainda não tens ${C.n.toLowerCase()}. Podes alugar aqui ou comprar no separador ao lado.`);
  h += noteBox(`⚡ Cada passeio gasta <b>1 energia</b> (viagens com mais de 800 km gastam 2). O preço inclui ${cat === 'bike' ? 'o aluguer, se precisares' : 'combustível de ida e volta' + (sel === 'rent' ? ' e aluguer' : '')}.`);
  const tt = sel !== 'rent' && VEIC[sel].tt;
  h += sec('🗺️ Destinos') + list(TR_ROAD.filter(d => cat !== 'bike' || d.bike).map(d => {
    const c = vhTripCost(cat, sel, d), seen = vhG().vis.includes((cat === 'carro' ? 'car' : cat) + ':' + d.id);
    return btnItem(d.ico, d.n + (seen ? ' ✅' : ''), `${d.km} km · ${d.d}${d.tt && !tt ? ' · ⚠️ picada difícil sem 4x4' : ''}`, c ? kzShort(c) : 'Grátis', `vhGo('${cat}','${d.id}')`);
  }));
  if (cat === 'bike') h += noteBox('🚲 De bicicleta só dá para destinos até 60 km. Para mais longe, apanha o comboio ou um voo!');
  return h;
}
function vhEnergy(n) { if (!canAct()) return false; if (G.acoes < n) { toast(`😴 Esta viagem precisa de ${n} energias. Carrega em +1 ANO.`); return false; } return true; }
function vhGo(cat, did) {
  const d = TR_ROAD.find(x => x.id === did), sel = vhSel(cat), C = VH_CAT[cat], need = d.km > 800 ? 2 : 1;
  if (sel === 'rent') { const r = vhRentOk(cat); if (r) return toast('🔑 Para alugar precisas de: ' + r + '.'); }
  else if (VEIC[sel].carta && !G.carta) return toast('🪪 Precisas de carta de condução.');
  if (!vhEnergy(need)) return; const cost = vhTripCost(cat, sel, d); if (!pay(cost)) return; G.acoes -= need;
  const V = sel === 'rent' ? null : VEIC[sel];
  trStart({ kind: cat === 'carro' ? 'car' : cat, cat, D: d, veh: V ? sel : null, mod: V ? V.mod : C.rentMod, col: V ? vhCor(sel) : '#f2f2f2', conf: V ? V.conf - 1 : 0, vehN: V ? V.t : C.rentN, risk: d.tt && !(V && V.tt) });
}

/* ---------- oficina ---------- */
function vhOficinaUI(cat) {
  const own = vhOwned(cat), v = vhG(), C = VH_CAT[cat], car = cat === 'carro';
  let h = noteBox(G.carta ? '🪪 Tens carta de condução. Boa estrada!' : '🪪 Ainda não tens carta de condução. Tira-a na Escola de Condução (Escola → Técnicos & Carta).', !G.carta);
  if (!G.carta) h += list([btnItem('🎓', 'Ir à Escola de Condução', 'Carta a partir dos 18 anos', '', "closePanel();tapEnter('escola')")]);
  if (!own.length) return h + noteBox(`Não tens nenhum veículo desta categoria. Compra um no separador ${C.ico} ${C.n}.`);
  const top = own.map(id => VEIC[id]).sort((a, b) => b.p - a.p)[0], segP = Math.round(top.p * (car ? .03 : .02) / 1000) * 1000;
  h += sec('🔧 Serviços') + list([
    btnItem('🔧', 'Revisão completa', v.rev === G.ano ? 'Feita este ano: sem avarias nas viagens' : 'Óleo, travões e pneus. Evita avarias durante as viagens este ano', car ? kzShort(60000) : kzShort(20000), `vhSvc('rev',${car ? 60000 : 20000})`, v.rev === G.ano),
    btnItem('🛡️', 'Seguro contra todos os riscos', v.seg === G.ano ? 'Ativo este ano' : `Cobre acidentes nas viagens (${top.t})`, kzShort(segP), `vhSvc('seg',${segP})`, v.seg === G.ano),
    btnItem('🧽', 'Lavagem e polimento', v.lav === G.ano ? 'Já brilhou este ano' : 'Chegar a brilhar dá estilo (Aparência +1)', kzShort(car ? 5000 : 2000), `vhSvc('lav',${car ? 5000 : 2000})`, v.lav === G.ano),
    car ? btnItem('🔊', 'Jantes desportivas e som potente', (v.tun || []).includes(G.ano) ? 'Já fizeste o tuning este ano' : 'A Marginal vai ouvir-te chegar (Fama +2)', kzShort(350000), `vhSvc('tun',350000)`, (v.tun || []).includes(G.ano))
      : btnItem('⛑️', 'Capacete e casaco de proteção', (v.cap || 0) ? 'Já tens' : 'Menos risco nas quedas', kzShort(45000), `vhSvc('cap',45000)`, !!v.cap),
  ]);
  if (cat === 'moto') h += sec('💼 Trabalhar com a moto') + list([btnItem('🏍️', 'Mototaxista (Kupapata)', 'Com moto e carta tens vaga no Centro de Emprego', '', "closePanel();tapEnter('emprego')")]);
  h += sec('🚘 A tua garagem') + `<div class="vhgar">${own.map(id => `<div><canvas data-veh="${id}" width="300" height="140"></canvas><b>${VEIC[id].t}</b><small>Vale ${kzShort(VEIC[id].p * .55)}</small></div>`).join('')}</div>`;
  return h;
}
function vhSvc(k, pr) {
  const v = vhG(); if (!pay(pr)) return; let t = '';
  if (k === 'rev') { v.rev = G.ano; t = '🔧 Revisão feita: o motor está como novo.'; }
  if (k === 'seg') { v.seg = G.ano; t = '🛡️ Seguro ativo até ao fim do ano.'; }
  if (k === 'lav') { v.lav = G.ano; t = '🧽 Brilha que até encandeia! ' + fx({ aparencia: 1 }); }
  if (k === 'tun') { v.tun = (v.tun || []).concat(G.ano); t = '🔊 Jantes novas e som a bombar! ' + fx({ fama: 2, felicidade: 3 }); }
  if (k === 'cap') { v.cap = 1; t = '⛑️ Equipamento de proteção comprado. ' + fx({ saude: 1 }); }
  after(t, 'good'); renderPanel(true);
}

/* ---------- desafios de bicicleta ---------- */
function vhDesafiosUI() {
  const own = vhOwned('bike'), v = vhG();
  let h = noteBox('🏆 Desafios da Pedala Angola. Pedalar faz bem à saúde e ainda podes ganhar prémios!');
  h += list([
    btnItem('🏁', 'Volta a Luanda (corrida amadora)', own.length ? 'Corrida de 42 km. O resultado depende da tua saúde e da bicicleta' : 'Precisas de uma bicicleta tua', kzShort(5000), "vhRace()", !own.length || v.volta === G.ano),
    btnItem('🌳', 'Passeio de domingo em grupo', 'Pela Marginal com a comunidade. Grátis e faz amigos', 'Grátis', "vhGroupRide()", v.grupo === G.ano),
    btnItem('🤸', 'Escola de BMX no Largo', 'Manobras e saltos (melhor com uma BMX)', kzShort(10000), "vhBmx()", v.bmx === G.ano),
  ]);
  if (v.volta === G.ano) h += noteBox('Já correste a Volta a Luanda este ano. Treina e volta para o ano!');
  h += sec('📊 As tuas estatísticas') + list([infoItem('🛣️', 'Quilómetros na vida', `${Math.round(v.km).toLocaleString('pt-PT')} km em ${v.n} viagens`), infoItem('🧭', 'Destinos descobertos', `${new Set(v.vis.map(s => s.split(':')[1])).size} sítios diferentes`), infoItem('🏆', 'Melhor resultado na Volta', v.best ? v.best + '.º lugar' : 'Ainda não correste')]);
  return h;
}
function vhRace() {
  const own = vhOwned('bike'); if (!own.length) return; if (!vhEnergy(1) || !pay(5000)) return; G.acoes--; vhG().volta = G.ano;
  const best = own.sort((a, b) => VEIC[b].vel - VEIC[a].vel)[0];
  trStart({ kind: 'bike', D: { id: 'volta', n: 'Volta a Luanda', km: 21, ida: 0, bio: ['cidade', 'costa', 'cidade'], f: 2, ico: '🏁', d: 'Meta na Marginal, com o público a gritar o teu nome.', acts: [], noVis: 1, race: 1 }, veh: best, mod: VEIC[best].mod, col: vhCor(best), conf: 0, vehN: VEIC[best].t, noEv: false });
}
function vhGroupRide() {
  const v = vhG(); if (!vhEnergy(1)) return; G.acoes--; v.grupo = G.ano; const sel = vhOwned('bike').pop();
  trStart({ kind: 'bike', D: Object.assign({}, TR_ROAD[0], { id: 'grupo', n: 'Passeio de domingo', km: 12, f: 4, noVis: 1, acts: [['🤝', 'Ficar a conversar com o grupo', { felicidade: 2, karma: 1 }, 0], ['🥤', 'Sumo natural no fim', { felicidade: 2 }, 1000]] }), veh: sel || null, mod: sel ? VEIC[sel].mod : 'bike', col: sel ? vhCor(sel) : '#2e8b57', conf: 0, vehN: sel ? VEIC[sel].t : 'Bicicleta emprestada' });
}
function vhBmx() { const v = vhG(); doAct(10000, () => { v.bmx = G.ano; return G.bens.includes('bmx') ? '🤸 Aprendeste um backflip! Toda a gente filmou. ' + fx({ saude: 2, fama: 2, felicidade: 3 }) : '🤸 Aula de BMX com uma bicicleta emprestada. ' + fx({ saude: 2, felicidade: 2 }); }); renderPanel(true); }

/* ---------- estação ---------- */
function vhTrainNow() { const T = typeof muNowS === 'function' ? muNowS() : Date.now() / 1000, c = ((T % 110) + 110) % 110; return c < 30 ? `🚆 O próximo comboio chega à plataforma em <b>${Math.ceil(30 - c)} s</b>` : c < 42 ? '🟢 <b>Comboio na plataforma</b>: embarque imediato!' : `🚆 Comboio a partir. O próximo chega em <b>${Math.ceil(140 - c)} s</b>`; }
function vhTrainPrice(d, cls) { const v = vhG(), m = TR_CLS_T.find(c => c[0] === cls)[2]; let p = Math.max(500, Math.round(d.km * 18 * m / 100) * 100); if (v.passe === G.ano && d.km <= 62 && cls === 'seg') p = 0; if (v.jovem === G.ano) p = Math.round(p * .7 / 100) * 100; return p; }
function vhPartidasUI() {
  const cls = VH.clsT || 'seg', now = new Date(), v = vhG();
  let h = `<div class="vhnow">${vhTrainNow()}</div>`;
  h += `<div class="vhboard"><div class="vbh"><span>Hora</span><span>Destino</span><span>Linha</span><span>Estado</span></div>${TR_TREM.map((d, i) => { const iv = i === 0 ? 20 : 60 + i * 30, m = now.getHours() * 60 + now.getMinutes(), nx = Math.ceil((m + 1) / iv) * iv, hh = String(Math.floor(nx / 60) % 24).padStart(2, '0') + ':' + String(nx % 60).padStart(2, '0'), st = trRnd(Math.floor(m / 30) * 7 + i, 99) < .15 ? ['ATRASADO', 'late'] : nx - m < 10 ? ['A EMBARCAR', 'board'] : ['A HORAS', 'ok']; return `<div><span>${hh}</span><span>${d.n}</span><span>CFL</span><span class="${st[1]}">${st[0]}</span></div>`; }).join('')}</div>`;
  h += sec('🎫 Classe') + `<div class="agchips">${TR_CLS_T.map(([k, t, m, b]) => `<button class="chip ${k === cls ? 'on' : ''}" onclick="VH.clsT='${k}';renderPanel(true)">${t}${b ? ' · Felicidade +' + b : ''}</button>`).join('')}</div>`;
  h += sec('🚆 Linha de Luanda (Ferrovia Kianda)') + list(TR_TREM.map(d => { const p = vhTrainPrice(d, cls), seen = v.vis.includes('train:' + d.id); return btnItem(d.ico, `Luanda → ${d.n}${seen ? ' ✅' : ''}`, `${d.km} km · ~${Math.max(1, Math.round(d.km / 55 * 10) / 10)} h · ${d.d}`, p ? kzShort(p) : 'Passe', `vhTrain('${d.id}')`); }));
  h += noteBox('⚡ Cada viagem de comboio gasta 1 energia. Na janela vês a paisagem; carrega em 🎥 para ver o comboio por fora.');
  return h;
}
function vhTrain(id) {
  const d = TR_TREM.find(x => x.id === id), cls = VH.clsT || 'seg', C = TR_CLS_T.find(c => c[0] === cls);
  if (!vhEnergy(1)) return; const p = vhTrainPrice(d, cls); if (!pay(p)) return; G.acoes--;
  trStart({ kind: 'train', D: d, cls, clsN: C[1], conf: C[3], vehN: 'Ferrovia Kianda · ' + C[1] });
}
function vhPasseUI() {
  const v = vhG();
  return noteBox('🎫 Passes e cartões da Ferrovia Kianda. Válidos até ao fim do ano.') + list([
    btnItem('🎫', 'Passe Suburbano anual', v.passe === G.ano ? 'Ativo: Viana e Catete grátis na 2.ª classe' : 'Viana e Catete grátis em 2.ª classe durante o ano', kzShort(60000), "vhPasse('passe',60000)", v.passe === G.ano),
    btnItem('🧑', 'Cartão Jovem (até 25 anos)', v.jovem === G.ano ? 'Ativo: 30% de desconto' : G.idade > 25 ? 'Só para quem tem até 25 anos' : '30% de desconto em todos os bilhetes', kzShort(10000), "vhPasse('jovem',10000)", v.jovem === G.ano || G.idade > 25),
  ]) + sec('📈 As tuas viagens') + list([infoItem('🛣️', 'Quilómetros na vida', `${Math.round(v.km).toLocaleString('pt-PT')} km`), infoItem('🚆', 'Estações visitadas', `${v.vis.filter(s => s.startsWith('train:')).length} de ${TR_TREM.length}`)]);
}
function vhPasse(k, pr) { const v = vhG(); if (!pay(pr)) return; v[k] = G.ano; after(k === 'passe' ? '🎫 Compraste o Passe Suburbano!' : '🧑 Cartão Jovem ativado: 30% de desconto!', 'good'); renderPanel(true); }
function vhLinhaUI() {
  return noteBox('🚆 A <b>Linha de Luanda</b> é uma das mais antigas de África: começou a ser construída no fim do século XIX e chegou a Malanje no início do século XX. Hoje leva milhares de passageiros por dia entre Luanda, Viana e o interior.')
    + list([infoItem('🛤️', 'Caminho de Ferro de Luanda (CFL)', 'Luanda → Viana → Catete → Zenza do Itombe → N\'dalatando → Malanje'), infoItem('🚂', 'Caminho de Ferro de Benguela (CFB)', 'Lobito → Huambo → Cuito → Luena → Luau, até à fronteira'), infoItem('🏜️', 'Caminho de Ferro de Moçâmedes (CFM)', 'Namibe → Lubango → Menongue'), infoItem('🌍', 'Corredor do Lobito', 'Liga o porto do Lobito à Zâmbia e ao Congo')])
    + noteBox('💡 Sabias que? O comboio que vês a chegar à plataforma aqui fora chega à mesma hora para todos os jogadores online.');
}

/* ---------- aeroporto ---------- */
function vhTier(mi) { return mi >= 20000 ? ['Ouro', '#ffcb00', .2] : mi >= 5000 ? ['Prata', '#c0c7d0', .1] : ['Azul', '#2ab0d8', 0]; }
function vhFlyPrice(d, cls) { const m = TR_CLS_V.find(c => c[0] === cls)[2], t = vhTier(vhG().mi || 0); return Math.round(d.p * m * (1 - t[2]) / 1000) * 1000; }
function vhVoosUI(int) {
  const cls = VH.cls || 'eco', v = vhG(), t = vhTier(v.mi || 0);
  let h = `<div class="vhmiles" style="--c:${t[1]}"><b>Palanca Miles · ${t[0]}</b><span>${(v.mi || 0).toLocaleString('pt-PT')} milhas${t[2] ? ' · ' + Math.round(t[2] * 100) + '% de desconto' : ''}</span></div>`;
  if (int && (!v.pass || G.idade < 18)) h += noteBox(G.idade < 18 ? '🛂 Para voos internacionais sozinho(a) precisas de ter 18 anos.' : '🛂 Precisas de passaporte para voar para fora. Trata dele no separador 🛂 Passaporte & Milhas.', true);
  h += sec('💺 Classe') + `<div class="agchips">${TR_CLS_V.map(([k, tt, m, b]) => `<button class="chip ${k === cls ? 'on' : ''}" onclick="VH.cls='${k}';renderPanel(true)">${tt}${b ? ' · Felicidade +' + b : ''}</button>`).join('')}</div>`;
  if (!int && (v.mi || 0) >= 3000) h += `<div class="agchips"><button class="chip ${VH.useMi ? 'on' : ''}" onclick="VH.useMi=!VH.useMi;renderPanel(true)">🎁 Usar 3.000 milhas: voo nacional grátis</button></div>`;
  h += sec(int ? '🌍 Voos internacionais' : '✈️ Voos nacionais') + list(TR_VOO.filter(d => !!d.int === !!int).map(d => {
    const p = !int && VH.useMi && (v.mi || 0) >= 3000 ? 0 : vhFlyPrice(d, cls), hrs = d.km / 750 + .5, seen = v.vis.includes('plane:' + d.id);
    return btnItem(d.ico, `${d.n}${seen ? ' ✅' : ''}`, `${d.pais ? d.pais + ' · ' : ''}${Math.floor(hrs)} h ${String(Math.round(hrs % 1 * 60)).padStart(2, '0')} de voo · ${d.d}`, p ? kzShort(p) : 'Milhas', `vhFly('${d.id}')`, int && (!v.pass || G.idade < 18));
  }));
  h += noteBox(`⚡ Voos nacionais gastam 1 energia; internacionais gastam 2. Ganhas milhas por cada km voado (a dobrar em Primeira).`);
  return h;
}
function vhFly(id) {
  const d = TR_VOO.find(x => x.id === id), v = vhG(), cls = VH.cls || 'eco', C = TR_CLS_V.find(c => c[0] === cls), need = d.int ? 2 : 1;
  if (d.int && G.idade < 18) return toast('🛂 Só a partir dos 18 anos.'); if (d.int && !v.pass) return toast('🛂 Precisas de passaporte.');
  if (!vhEnergy(need)) return; const mi = !d.int && VH.useMi && (v.mi || 0) >= 3000, p = mi ? 0 : vhFlyPrice(d, cls); if (!pay(p)) return;
  if (mi) { v.mi -= 3000; VH.useMi = false; } G.acoes -= need;
  trStart({ kind: 'plane', D: d, cls, clsN: C[1], conf: C[3], col: '#b5179e', vehN: 'Palanca Airlines · ' + C[1] });
}
function vhPassUI() {
  const v = vhG(), t = vhTier(v.mi || 0);
  let h = sec('🛂 Passaporte') + list([v.pass ? infoItem('🛂', 'Passaporte angolano', 'Válido. Podes voar para fora do país', '✅') : btnItem('🛂', 'Tratar o passaporte (SME)', G.idade < 18 ? 'Só a partir dos 18 anos' : 'Pronto na hora, aqui no balcão do aeroporto', kzShort(25000), 'vhPass()', G.idade < 18)]);
  h += sec('🎖️ Palanca Miles') + `<div class="vhmiles big" style="--c:${t[1]}"><b>${t[0]}</b><span>${(v.mi || 0).toLocaleString('pt-PT')} milhas</span><i style="width:${Math.min(100, (v.mi || 0) / (t[0] === 'Azul' ? 5000 : 20000) * 100)}%"></i><small>${t[0] === 'Ouro' ? 'Nível máximo: 20% de desconto e sala VIP grátis' : t[0] === 'Prata' ? 'Faltam ' + (20000 - v.mi).toLocaleString('pt-PT') + ' milhas para Ouro' : 'Faltam ' + (5000 - (v.mi || 0)).toLocaleString('pt-PT') + ' milhas para Prata'}</small></div>`;
  h += sec('🛍️ No terminal') + list([
    btnItem('🛋️', 'Sala VIP Palanca', v.vip === G.ano ? 'Já relaxaste este ano' : 'Buffet, duche e wi-fi antes do voo', t[0] === 'Ouro' ? 'Grátis' : kzShort(20000), 'vhVip()', v.vip === G.ano),
    btnItem('🧴', 'Duty free: perfume Kianda N.º 5', v.duty === G.ano ? 'Já compraste este ano' : 'Cheirar bem dá confiança (Aparência +1)', kzShort(45000), 'vhDuty()', v.duty === G.ano),
  ]);
  h += sec('🌍 Carimbos no passaporte') + (v.car.length ? `<div class="vhstamps">${v.car.map(c => `<span>${c}</span>`).join('')}</div>` : noteBox('Ainda não tens carimbos. O mundo está à tua espera!'));
  h += sec('🧭 Destinos descobertos') + list([infoItem('🗺️', 'Sítios visitados', `${new Set(v.vis.map(s => s.split(':')[1])).size} destinos · ${v.n} viagens · ${Math.round(v.km).toLocaleString('pt-PT')} km`)]);
  return h;
}
function vhPass() { if (G.idade < 18) return; if (!pay(25000)) return; vhG().pass = 1; after('🛂 Passaporte tratado! Agora podes voar para o estrangeiro.', 'good', 'cheer'); renderPanel(true); }
function vhVip() { const v = vhG(), free = vhTier(v.mi || 0)[0] === 'Ouro'; if (!free && !pay(20000)) return; v.vip = G.ano; after('🛋️ Relaxaste na sala VIP. ' + fx({ felicidade: 2, saude: 1 }), 'good'); renderPanel(true); }
function vhDuty() { const v = vhG(); if (!pay(45000)) return; v.duty = G.ano; after('🧴 Perfume novo! ' + fx({ aparencia: 1, felicidade: 1 }), 'good'); renderPanel(true); }

/* ---------- registo dos painéis ---------- */
const vhShop = cat => () => {
  const ids = Object.keys(VEIC).filter(id => VEIC[id].cat === cat).sort((a, b) => VEIC[a].p - VEIC[b].p);
  const msg = { carro: '🚗 Carros novos e usados. Todos os carros pedem carta de condução e têm manutenção anual.', moto: '🏍️ Scooters a partir dos 16 anos sem carta; motos maiores pedem carta.', bike: '🚲 Bicicletas para todas as idades: saúde, poupança e zero engarrafamento.' }[cat];
  return noteBox(msg + ` Tens <b>${kzShort(G.dinheiro)}</b>.`) + `<div class="vhgrid">${ids.map(vhCard).join('')}</div>`;
};
Object.assign(PANELS, {
  stand: { ico: '🚗', t: 'Stand Auto Kianda', sub: 'Carros novos e usados · test-drive · oficina', tabs: [['carros', '🚗 Carros', vhShop('carro')], ['passeios', '🛣️ Passeios', () => vhRoadUI('carro')], ['oficina', '🔧 Oficina', () => vhOficinaUI('carro')]] },
  motos: { ico: '🏍️', t: 'Moto Bwé', sub: 'Scooters, motos e superdesportivas', tabs: [['motos', '🏍️ Motos', vhShop('moto')], ['passeios', '🛣️ Passeios', () => vhRoadUI('moto')], ['oficina', '🔧 Oficina', () => vhOficinaUI('moto')]] },
  bikes: { ico: '🚲', t: 'Pedala Angola', sub: 'Bicicletas, aluguer, passeios e desafios', tabs: [['bikes', '🚲 Bicicletas', vhShop('bike')], ['passeios', '🌳 Passeios', () => vhRoadUI('bike')], ['desafios', '🏆 Desafios', vhDesafiosUI]] },
  estacao: { ico: '🚆', t: 'Estação Ferroviária de Luanda', sub: 'Ferrovia Kianda · Linha de Luanda', tabs: [['partidas', '🚆 Partidas', vhPartidasUI], ['passe', '🎫 Passes', vhPasseUI], ['info', 'ℹ️ A linha', vhLinhaUI]] },
  aeroporto: { ico: '✈️', t: 'Aeroporto de Luanda', sub: 'Palanca Airlines · voos nacionais e internacionais', tabs: [['nac', '✈️ Nacionais', () => vhVoosUI(false)], ['int', '🌍 Internacionais', () => vhVoosUI(true)], ['milhas', '🛂 Passaporte & Milhas', vhPassUI]] },
});

/* resultado da corrida e do atolar na picada (antes do ecrã de chegada) */
(function () {
  const _a = trArrive; trArrive = function () {
    const D = TR.D, v = vhG();
    if (D.race) { const V = VEIC[TR.veh] || {}, sc = G.stats.saude + (TR.veh === 'corrida' ? 28 : TR.veh === 'btt' ? 12 : TR.veh === 'ebike' ? -40 : 4) + Math.random() * 35, pos = sc > 112 ? 1 : sc > 100 ? 2 : sc > 90 ? 3 : Math.max(4, Math.round(60 - sc / 2));
      v.best = Math.min(v.best || 999, pos); let t;
      if (TR.veh === 'ebike') t = '🚫 Desclassificado(a): bicicletas elétricas não podem correr! ' + fx({ felicidade: -2 });
      else if (pos === 1) t = '🥇 GANHASTE a Volta a Luanda! Prémio de 150.000 Kz! ' + fx({ dinheiro: 150000, fama: 4, felicidade: 6 });
      else if (pos <= 3) t = `🥉 Pódio! Ficaste em ${pos}.º lugar. Prémio de 50.000 Kz. ` + fx({ dinheiro: 50000, fama: 2, felicidade: 4 });
      else t = `🏅 Terminaste em ${pos}.º lugar. Para o ano há mais! ` + fx({ saude: 2, felicidade: 1 });
      TR.log.push(t); if (typeof SND !== 'undefined') SND.play(pos <= 3 ? 'goal' : 'whistle'); }
    if (TR.risk && chance(.35)) { G.dinheiro -= 15000; TR.log.push('🚜 Atolaste na picada! Um tractor puxou-te por 15.000 Kz.'); }
    if (D.noVis) { const vis = v.vis.slice(); const r = _a.apply(this, arguments); v.vis = vis; return r; }
    return _a.apply(this, arguments);
  };
})();
/* quem está em viagem aparece assim para os outros jogadores */
if (typeof LIVE !== 'undefined' && LIVE.mpBody) { const _mb = LIVE.mpBody.bind(LIVE); LIVE.mpBody = function () { return Object.assign(_mb(), { vh: TR ? TR.kind + ':' + String(TR.D.id).replace(/[^a-z0-9]/g, '') : '' }); }; }
