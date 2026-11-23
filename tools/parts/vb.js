
/* =========================================================
   DESTINOS
   ========================================================= */
const TR_ROAD = [
  { id: 'marginal', n: 'Marginal & Ilha de Luanda', km: 18, bio: ['cidade', 'costa'], bike: 1, f: 3, ico: '🌅', d: 'Volta pela baía, a Fortaleza e a Ilha do Cabo',
    acts: [['🍢', 'Espetadas e gelado na Ilha', { felicidade: 3 }, 4000], ['📸', 'Fotos na Fortaleza de São Miguel', { inteligencia: 1, fama: 1 }, 1500], ['🌅', 'Ver o pôr do sol na Marginal', { felicidade: 2, karma: 1 }, 0]] },
  { id: 'kilamba', n: 'Centralidade do Kilamba', km: 28, bio: ['cidade', 'planalto'], bike: 1, f: 2, ico: '🏙️', d: 'Avenidas largas, ciclovia e jardins',
    acts: [['⚽', 'Futebol com a malta do bairro', { saude: 2, felicidade: 2 }, 0], ['🛍️', 'Passear no centro comercial', { felicidade: 2 }, 6000], ['🧺', 'Piquenique no jardim', { felicidade: 3 }, 3000]] },
  { id: 'miradouro', n: 'Miradouro da Lua', km: 40, bio: ['cidade', 'falesia'], bike: 1, f: 5, ico: '🌄', d: 'Falésias vermelhas esculpidas pelo vento e pela chuva',
    acts: [['📸', 'Fotos no miradouro', { felicidade: 3, fama: 1 }, 0], ['🥾', 'Descer o trilho até à praia', { saude: 2, felicidade: 2 }, 0], ['🥥', 'Água de coco na barraca', { felicidade: 2 }, 1000]] },
  { id: 'mussulo', n: 'Mussulo (pela Samba)', km: 45, bio: ['cidade', 'costa'], bike: 1, f: 5, ico: '🏝️', d: 'Restinga de areia branca e águas calmas',
    acts: [['⛵', 'Passeio de barco à vela', { felicidade: 4 }, 15000], ['🦀', 'Caranguejo grelhado à beira-mar', { felicidade: 3, saude: 1 }, 9000], ['🏖️', 'Dormir na rede o dia todo', { felicidade: 3, saude: 1 }, 0]] },
  { id: 'kissama', n: 'Parque Nacional da Quiçama', km: 75, bio: ['cidade', 'savana'], tt: 1, terra: 1, f: 7, ico: '🐘', d: 'Safari com elefantes, palancas e gungas',
    acts: [['🐘', 'Safari guiado ao amanhecer', { felicidade: 5, inteligencia: 2 }, 25000], ['⛺', 'Acampar debaixo das estrelas', { felicidade: 4, saude: 1 }, 8000], ['🌊', 'Ver o rio na Barra do Kwanza', { felicidade: 3 }, 0]] },
  { id: 'caboledo', n: 'Cabo Ledo', km: 120, bio: ['cidade', 'savana', 'costa'], f: 7, ico: '🏄', d: 'As melhores ondas de Angola para o surf',
    acts: [['🏄', 'Aula de surf', { saude: 2, felicidade: 4 }, 20000], ['🐟', 'Peixe grelhado na praia', { felicidade: 3 }, 7000], ['🎶', 'Festa na praia ao fim da tarde', { felicidade: 4, fama: 1 }, 10000]] },
  { id: 'pungo', n: 'Pedras Negras de Pungo Andongo', km: 390, bio: ['savana', 'planalto', 'pedras'], f: 8, ico: '🪨', d: 'Rochedos gigantes e as pegadas lendárias da Rainha Njinga',
    acts: [['🧗', 'Subir às pedras', { saude: 2, felicidade: 3 }, 0], ['👑', 'Ouvir a lenda da Rainha Njinga com um guia', { inteligencia: 3, karma: 1 }, 5000], ['📸', 'Fotos ao pôr do sol', { fama: 1, felicidade: 2 }, 0]] },
  { id: 'calandula', n: 'Quedas de Kalandula (Malanje)', km: 420, bio: ['cidade', 'savana', 'planalto', 'quedas'], f: 10, ico: '💦', d: 'Uma das maiores quedas de água de África, com mais de 100 m',
    acts: [['👀', 'Ver as quedas do miradouro', { felicidade: 5, inteligencia: 1 }, 0], ['🥾', 'Descer até ao fundo da queda', { saude: 2, felicidade: 5 }, 5000], ['🛏️', 'Dormir na pousada com vista', { felicidade: 4, saude: 2 }, 30000]] },
  { id: 'benguela', n: 'Benguela & Restinga do Lobito', km: 540, bio: ['cidade', 'savana', 'costa'], f: 9, ico: '🌴', d: 'Praia Morena, acácias rubras e a Restinga',
    acts: [['🏖️', 'Dia na Praia Morena', { felicidade: 4 }, 0], ['🍲', 'Caldeirada de cabrito', { felicidade: 3 }, 8000], ['🚶', 'Passear na Restinga do Lobito', { felicidade: 3, karma: 1 }, 0]] },
  { id: 'leba', n: 'Serra da Leba (Huíla)', km: 1000, bio: ['savana', 'planalto', 'serra'], f: 12, ico: '⛰️', d: 'A estrada em ziguezague mais famosa de Angola',
    acts: [['👀', 'Miradouro da Serra da Leba', { felicidade: 6 }, 0], ['🏞️', 'Fenda da Tundavala', { felicidade: 5, inteligencia: 1 }, 5000], ['⛪', 'Cristo Rei do Lubango', { karma: 2, felicidade: 3 }, 0]] },
  { id: 'namibe', n: 'Deserto do Namibe', km: 1150, bio: ['serra', 'deserto'], tt: 1, f: 12, ico: '🏜️', d: 'Dunas, a Lagoa do Arco e a misteriosa Welwitschia',
    acts: [['🌿', 'Ver uma Welwitschia com mais de mil anos', { inteligencia: 3 }, 0], ['🏞️', 'Lagoa do Arco', { felicidade: 5 }, 10000], ['🌅', 'Pôr do sol nas dunas de jipe', { felicidade: 6, fama: 1 }, 25000]] },
];
const TR_TREM = [
  { id: 'viana', n: 'Viana', km: 25, bio: ['cidade'], f: 2, ico: '🏘️', d: 'Suburbano: Bungo → Viana, a cada hora',
    acts: [['🧺', 'Compras no mercado do Km 30', { felicidade: 2 }, 5000], ['⚽', 'Ver um jogo do bairro', { felicidade: 2 }, 0], ['🍗', 'Frango no churrasco', { felicidade: 2 }, 3000]] },
  { id: 'catete', n: 'Catete (Ícolo e Bengo)', km: 62, bio: ['cidade', 'savana'], f: 4, ico: '🌾', d: 'Capital da nova província de Ícolo e Bengo',
    acts: [['🏛️', 'Visitar Kaxicane, terra natal de Agostinho Neto', { inteligencia: 3, karma: 1 }, 2000], ['🐟', 'Funge com peixe do rio Bengo', { felicidade: 3 }, 4000], ['🧺', 'Feira de produtos do campo', { felicidade: 2 }, 3000]] },
  { id: 'zenza', n: 'Zenza do Itombe', km: 140, bio: ['savana', 'floresta'], f: 5, ico: '🌳', d: 'Pequena vila à beira do rio Kwanza',
    acts: [['🎣', 'Pescar no rio Kwanza', { felicidade: 3, saude: 1 }, 0], ['🥭', 'Comprar fruta fresca na estação', { felicidade: 2, saude: 1 }, 1500], ['📖', 'Conversar com os mais-velhos da vila', { inteligencia: 2, karma: 1 }, 0]] },
  { id: 'ndalatando', n: "N'dalatando (Cuanza Norte)", km: 250, bio: ['savana', 'floresta', 'planalto'], f: 7, ico: '☕', d: 'Jardim Botânico e as antigas roças de café',
    acts: [['🌺', 'Jardim Botânico', { inteligencia: 2, felicidade: 3 }, 2000], ['☕', 'Visitar uma roça de café', { inteligencia: 2, felicidade: 2 }, 5000], ['🌧️', 'Passear na serra verde e fresca', { saude: 2, felicidade: 2 }, 0]] },
  { id: 'malanje', n: 'Malanje', km: 424, bio: ['savana', 'floresta', 'planalto'], f: 9, ico: '🚉', d: 'Fim da linha: porta para Kalandula e Pungo Andongo',
    acts: [['💦', 'Excursão às Quedas de Kalandula', { felicidade: 6 }, 15000], ['🪨', 'Excursão às Pedras Negras', { inteligencia: 2, felicidade: 3 }, 12000], ['🧺', 'Mercado de Malanje', { felicidade: 2 }, 3000]] },
];
const TR_CLS_T = [['seg', '2.ª classe', 1, 0], ['pri', '1.ª classe', 2, 2], ['exe', 'Executiva', 4, 4]];
const TR_VOO = [
  { id: 'catumbela', n: 'Benguela (Catumbela)', km: 400, p: 65000, bio: 'costa', ico: '🌴', f: 6, d: 'Praias, acácias rubras e o Lobito',
    acts: [['🏖️', 'Praia da Caotinha', { felicidade: 4 }, 0], ['🍲', 'Caldeirada no Lobito', { felicidade: 3 }, 8000], ['🚂', 'Ver o Caminho de Ferro de Benguela', { inteligencia: 2 }, 0]] },
  { id: 'lubango', n: 'Lubango (Huíla)', km: 750, p: 95000, bio: 'serra', ico: '⛰️', f: 8, d: 'Cristo Rei, Tundavala e o clima fresco da serra',
    acts: [['⛪', 'Cristo Rei', { karma: 2, felicidade: 3 }, 0], ['🏞️', 'Fenda da Tundavala', { felicidade: 5 }, 5000], ['🐄', 'Churrasco de carne da Huíla', { felicidade: 3 }, 9000]] },
  { id: 'namibe', n: 'Moçâmedes (Namibe)', km: 870, p: 105000, bio: 'deserto', ico: '🏜️', f: 9, d: 'O deserto encontra o mar',
    acts: [['🌿', 'Welwitschia mirabilis', { inteligencia: 3 }, 0], ['🏞️', 'Lagoa do Arco', { felicidade: 5 }, 10000], ['🐟', 'Peixe seco e lagosta', { felicidade: 3 }, 12000]] },
  { id: 'huambo', n: 'Huambo', km: 520, p: 80000, bio: 'planalto', ico: '🌾', f: 6, d: 'O Planalto Central e a cidade das flores',
    acts: [['🌸', 'Passear na cidade jardim', { felicidade: 3 }, 0], ['🏔️', 'Subir ao Morro do Moco', { saude: 3, felicidade: 4 }, 8000], ['🥔', 'Feira agrícola do planalto', { inteligencia: 1, felicidade: 2 }, 3000]] },
  { id: 'cabinda', n: 'Cabinda', km: 420, p: 70000, bio: 'floresta', ico: '🌳', f: 7, d: 'A floresta do Maiombe e as praias do norte',
    acts: [['🦍', 'Trilho na floresta do Maiombe', { felicidade: 5, inteligencia: 2 }, 15000], ['🏖️', 'Praia de Cabinda', { felicidade: 3 }, 0], ['🍫', 'Provar cacau e chikuanga', { felicidade: 2 }, 3000]] },
  { id: 'saurimo', n: 'Saurimo (Lunda Sul)', km: 800, p: 98000, bio: 'savana', ico: '💎', f: 6, d: 'Terra dos diamantes e da cultura Cokwe',
    acts: [['🎭', 'Máscaras e danças Cokwe', { inteligencia: 3, felicidade: 2 }, 3000], ['💎', 'Visitar uma feira de artesanato', { felicidade: 2 }, 5000], ['🌳', 'Passear no parque da cidade', { felicidade: 2 }, 0]] },
  { id: 'menongue', n: 'Menongue (Cuando Cubango)', km: 900, p: 110000, bio: 'savana', ico: '🦁', f: 8, d: 'Rios, savana sem fim e vida selvagem',
    acts: [['🛶', 'Canoa no rio Cuebe', { felicidade: 4 }, 8000], ['🦓', 'Safari fotográfico', { felicidade: 5, fama: 1 }, 20000], ['🍯', 'Mel e peixe do rio', { felicidade: 2 }, 3000]] },
  { id: 'saotome', n: 'São Tomé', km: 800, p: 280000, int: 1, pais: 'São Tomé e Príncipe', bio: 'costa', ico: '🏝️', f: 10, d: 'Ilhas verdes, cacau e praias de sonho',
    acts: [['🍫', 'Roça de cacau', { inteligencia: 2, felicidade: 3 }, 15000], ['🏖️', 'Praia Jalé', { felicidade: 5 }, 0], ['🐢', 'Ver tartarugas a desovar', { felicidade: 4, karma: 2 }, 10000]] },
  { id: 'windhoek', n: 'Windhoek', km: 1560, p: 380000, int: 1, pais: 'Namíbia', bio: 'deserto', ico: '🏜️', f: 10, d: 'Capital limpa e moderna às portas do deserto',
    acts: [['🦒', 'Safari no Etosha', { felicidade: 6, inteligencia: 2 }, 90000], ['🏜️', 'Dunas de Sossusvlei', { felicidade: 6 }, 70000], ['🍖', 'Mercado e churrasco', { felicidade: 3 }, 15000]] },
  { id: 'joburg', n: 'Joanesburgo', km: 2600, p: 520000, int: 1, pais: 'África do Sul', bio: 'cidadeX', ico: '🏙️', f: 10, d: 'Arranha-céus, compras e história',
    acts: [['🏛️', 'Museu do Apartheid', { inteligencia: 4, karma: 1 }, 20000], ['🛍️', 'Compras em Sandton', { felicidade: 4, aparencia: 1 }, 150000], ['🦁', 'Safari perto da cidade', { felicidade: 5 }, 60000]] },
  { id: 'cabo', n: 'Cidade do Cabo', km: 3000, p: 600000, int: 1, pais: 'África do Sul', bio: 'serra', ico: '🏔️', f: 12, d: 'A Montanha da Mesa e o oceano',
    acts: [['🚡', 'Subir à Montanha da Mesa', { felicidade: 6 }, 40000], ['🐧', 'Pinguins na praia', { felicidade: 5 }, 15000], ['🍷', 'Jantar no porto', { felicidade: 4 }, 50000]] },
  { id: 'lisboa', n: 'Lisboa', km: 6550, p: 950000, int: 1, pais: 'Portugal', bio: 'europa', ico: '🏰', f: 12, d: 'Elétricos amarelos, pastéis e a diáspora angolana',
    acts: [['🚋', 'Passear de elétrico pelas colinas', { felicidade: 5 }, 8000], ['👨‍👩‍👧', 'Visitar família na diáspora', { felicidade: 5, karma: 2 }, 0], ['🎶', 'Noite de kizomba angolana em Lisboa', { felicidade: 5, fama: 1 }, 20000]] },
  { id: 'saopaulo', n: 'São Paulo', km: 6200, p: 1100000, int: 1, pais: 'Brasil', bio: 'cidadeX', ico: '🌎', f: 12, d: 'A metrópole gigante do Brasil',
    acts: [['🎨', 'Avenida Paulista e museus', { inteligencia: 3, felicidade: 3 }, 20000], ['⚽', 'Jogo no estádio', { felicidade: 6 }, 45000], ['🥩', 'Rodízio de churrasco', { felicidade: 4 }, 30000]] },
  { id: 'dubai', n: 'Dubai', km: 7300, p: 1200000, int: 1, pais: 'Emirados Árabes Unidos', bio: 'dubai', ico: '🏙️', f: 13, d: 'O prédio mais alto do mundo e o deserto',
    acts: [['🏙️', 'Subir ao prédio mais alto do mundo', { felicidade: 6, fama: 1 }, 90000], ['🐪', 'Safari no deserto', { felicidade: 5 }, 60000], ['🛍️', 'Compras no mega centro comercial', { felicidade: 4, aparencia: 2 }, 250000]] },
];
const TR_CLS_V = [['eco', 'Económica', 1, 0], ['exe', 'Executiva', 2.8, 3], ['pri', 'Primeira', 5, 6]];

/* =========================================================
   EVENTOS A MEIO DA VIAGEM
   ========================================================= */
const TR_EV = {
  road: [
    { id: 'stop', t: '👮 Operação STOP! Um agente pede os documentos e fala numa "gasosa".', c: [['Mostrar os documentos', () => G.carta || VEIC[TR.veh || 'bike'].cat === 'bike' || (TR.veh && !VEIC[TR.veh].carta) ? ['Tudo em ordem. O agente deseja boa viagem.', { karma: 1 }] : ['Sem carta! Multa de 30.000 Kz.', { dinheiro: -30000, felicidade: -2 }]], ['Dar 5.000 Kz de gasosa', () => chance(.2) ? ['Era uma operação anticorrupção! Multa pesada.', { dinheiro: -55000, fama: -2, karma: -3 }] : ['Ele aceitou e deixou-te passar…', { dinheiro: -5000, karma: -3 }]]] },
    { id: 'furo', t: '🛞 Pneu furado no meio da estrada!', c: [['Trocar tu mesmo', () => ['Mãos sujas, mas resolveste sozinho(a).', { inteligencia: 1, saude: -1 }]], ['Chamar um mecânico de rua (8.000 Kz)', () => ['O kota mecânico trocou num instante.', { dinheiro: -8000 }]]] },
    { id: 'boleia', t: '🙋 Uma senhora com sacos de mandioca pede boleia.', c: [['Dar boleia', () => chance(.4) ? ['Ela ofereceu-te mandioca e muitas bênçãos!', { karma: 3, felicidade: 2 }] : ['Foi a contar histórias o caminho todo.', { karma: 3 }]], ['Seguir viagem', () => ['Seguiste… e ficaste com a consciência pesada.', { karma: -1 }]]] },
    { id: 'zunga', t: '🥭 Na paragem, zungueiras vendem jinguba, mangas e água fresca.', c: [['Comprar lanche (2.000 Kz)', () => ['Manga docinha e jinguba torrada!', { dinheiro: -2000, felicidade: 2, saude: 1 }]], ['Só uma água (300 Kz)', () => ['Água fresquinha. Siga!', { dinheiro: -300 }]]] },
    { id: 'chuva', t: '🌧️ Chuvada tropical! A estrada parece um rio.', c: [['Abrandar e ligar os quatro piscas', () => ['Chegaste mais tarde, mas em segurança.', { karma: 1 }]], ['Manter a velocidade', () => chance(.28) ? (vhSeguro() ? ['Despiste! O seguro pagou o arranjo.', { saude: -6, felicidade: -3 }] : ['Despiste! Arranjo caro e uns arranhões.', { saude: -8, dinheiro: -120000, felicidade: -4 }]) : ['Correu bem… desta vez.', { felicidade: 1 }]]] },
    { id: 'miradouro', t: '📸 Há um miradouro com uma vista incrível.', c: [['Parar 10 minutos', () => ['Que vista! Valeu a pena.', { felicidade: 3 }]], ['Seguir, que está tarde', () => ['Fica para a próxima.', {}]]] },
    { id: 'radar', t: '📡 Radar de velocidade escondido atrás de um embondeiro!', c: [['Travar a tempo', () => ['Ufa, passaste dentro do limite.', {}]], ['Arriscar', () => chance(.5) ? ['Flash! Multa de 25.000 Kz.', { dinheiro: -25000, felicidade: -2 }] : ['Escapaste… por pouco.', { felicidade: 1, karma: -1 }]]] },
    { id: 'avaria', t: '🌡️ O motor começa a aquecer…', ok: () => TR.veh && !VEIC[TR.veh].ev && vhG().rev !== G.ano, c: [['Parar e deixar arrefecer', () => ['Esperaste meia hora à sombra de uma mulemba.', { felicidade: -1 }]], ['Continuar a abrir', () => chance(.4) ? ['O motor gripou! Reboque e oficina.', { dinheiro: -70000, felicidade: -4 }] : ['Aguentou até ao fim.', {}]]] },
    { id: 'animais', t: '🦌 Uma manada de palancas atravessa a estrada!', bio: ['savana', 'planalto', 'pedras'], c: [['Parar e fotografar', () => ['Fotos incríveis da palanca!', { felicidade: 3, fama: G.tel >= 2 ? 1 : 0 }]], ['Buzinar', () => ['Os animais fugiram assustados.', { karma: -2 }]]] },
    { id: 'kupapata', t: '🧍 Um senhor acena: quer ir para o mesmo lado e paga 3.000 Kz.', kind: 'moto', c: [['Levar o passageiro', () => ['Ganhaste uns trocos pelo caminho.', { dinheiro: 3000 }]], ['Não, estou a passear', () => ['Hoje é só lazer.', {}]]] },
    { id: 'bomba', t: '⛽ Na bomba de combustível, alguém muito simpático puxa conversa.', ok: () => G.idade >= 18 && !G.parceiro, c: [['Trocar números', () => ['Ficaram a falar no Fala Já a viagem toda!', { felicidade: 3 }]], ['Sorrir e seguir', () => ['Um sorriso também alegra o dia.', { felicidade: 1 }]]] },
  ],
  bike: [
    { id: 'sede', t: '🥵 Está um calor de 34 °C e a água acabou.', c: [['Comprar água a uma zungueira (300 Kz)', () => ['Salvaste-te!', { dinheiro: -300, saude: 1 }]], ['Aguentar até ao fim', () => ['Chegaste a desidratar…', { saude: -3 }]]] },
    { id: 'subida', t: '⛰️ Uma subida enorme pela frente!', c: [['Dar tudo nos pedais', () => G.stats.saude > 60 ? ['Subiste sem parar! Pernas de aço.', { saude: 2, felicidade: 2 }] : ['Ficaste sem fôlego a meio…', { saude: -2 }]], ['Empurrar a bicicleta', () => ['Devagar se vai ao longe.', {}]]] },
    { id: 'corrente', t: '⛓️ Saltou a corrente da bicicleta!', c: [['Arranjar com as mãos', () => ['Aprendeste mecânica à força.', { inteligencia: 1 }]], ['Pedir ajuda a um mecânico (1.000 Kz)', () => ['Arranjado num minuto.', { dinheiro: -1000 }]]] },
    { id: 'grupo', t: '🚴 Um grupo de ciclistas convida-te a pedalar com eles.', c: [['Juntar-me ao grupo', () => ['Novos amigos e um ritmo forte!', { felicidade: 3, saude: 1 }]], ['Seguir sozinho(a)', () => ['Tu e a estrada.', {}]]] },
    { id: 'buraco', t: '🕳️ Um buraco enorme no asfalto!', c: [['Desviar com cuidado', () => ['Bem visto.', {}]], ['Saltar por cima', () => TR.veh === 'bmx' || TR.veh === 'btt' ? ['Salto perfeito! Alguém filmou.', { felicidade: 3, fama: 1 }] : chance(.45) ? ['Caíste! Joelho esfolado.', { saude: -5 }] : ['Saltaste! Por pouco.', { felicidade: 2 }]]] },
  ],
  train: [
    { id: 'vend', t: '🧃 Passa um vendedor com bolinhos, sumos e jinguba.', c: [['Comprar (1.500 Kz)', () => ['Lanche no comboio sabe sempre melhor.', { dinheiro: -1500, felicidade: 2 }]], ['Não, obrigado', () => ['Poupaste o kumbu.', {}]]] },
    { id: 'kota', t: '👴 Um mais-velho conta histórias da linha de Malanje de antigamente.', c: [['Ouvir com atenção', () => ['Aprendeste muito sobre a história do país.', { inteligencia: 2, karma: 1 }]], ['Pôr os auriculares', () => ['Música no máximo.', { felicidade: 1 }]]] },
    { id: 'para', t: '⏸️ O comboio para no meio da savana: manutenção da via.', c: [['Esperar sentado', () => ['Quarenta minutos depois, seguiu.', { felicidade: -1 }]], ['Descer para esticar as pernas', () => ['Fotos lindas ao lado da linha!', { felicidade: 2 }]]] },
    { id: 'revisor', t: '🎫 O revisor oferece upgrade para a 1.ª classe por 3.000 Kz.', ok: () => TR.cls === 'seg', c: [['Aceitar', () => ['Cadeira larga e ar condicionado!', { dinheiro: -3000, felicidade: 3 }]], ['Fico onde estou', () => ['Mais animado aqui atrás.', { felicidade: 1 }]]] },
    { id: 'crianca', t: '👦 Uma criança está perdida da mãe na carruagem.', c: [['Ajudar a encontrar a mãe', () => ['A mãe agradeceu-te em lágrimas.', { karma: 4 }]], ['Chamar o revisor', () => ['O revisor tratou do assunto.', { karma: 1 }]]] },
  ],
  plane: [
    { id: 'turb', t: '🌀 Turbulência forte! O avião abana muito.', c: [['Apertar o cinto e respirar fundo', () => ['Passou. Coração aos saltos.', {}]], ['Agarrar a mão do vizinho', () => ['Ele riu-se e ficaram amigos.', { felicidade: 2 }]]] },
    { id: 'comida', t: '🍽️ Hora da refeição: frango com arroz ou peixe com funge?', c: [['Frango com arroz', () => ['Nada mau para comida de avião!', { felicidade: 1 }]], ['Peixe com funge', () => ['Sabor de casa, lá em cima!', { felicidade: 2 }]]] },
    { id: 'famoso', t: '🌟 Um artista famoso de kuduro está no teu voo!', c: [['Pedir uma selfie', () => G.tel >= 2 ? ['A selfie bombou nas redes!', { fama: 2, felicidade: 2 }] : ['Sem câmara… só um autógrafo.', { felicidade: 2 }]], ['Deixar o homem descansar', () => ['Ele reparou e agradeceu com um aceno.', { karma: 1 }]]] },
    { id: 'upg', t: '💺 A tripulação oferece upgrade para executiva por 50.000 Kz.', ok: () => TR.cls === 'eco', c: [['Aceitar', () => ['Champanhe, cadeira-cama e silêncio.', { dinheiro: -50000, felicidade: 4 }]], ['Recusar', () => ['Económica também chega.', {}]]] },
    { id: 'rio', t: '🏞️ Lá em baixo, o rio Kwanza serpenteia pela savana.', c: [['Tirar uma foto pela janela', () => ['Foto do ano!', { felicidade: 2, fama: G.tel >= 2 ? 1 : 0 }]], ['Dormir um bocado', () => ['Uma soneca nas nuvens.', { saude: 1 }]]] },
  ],
};
function vhSeguro() { return vhG().seg === G.ano; }

/* =========================================================
   DESENHO DA VIAGEM (canvas 2D com paralaxe)
   ========================================================= */
let TR = null;
const trRnd = (i, s) => { let h = Math.imul(i | 0, 374761393) ^ Math.imul((s | 0) + 1, 668265263); h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const trHex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const trMix = (a, b, k) => { const A = trHex(a), B = trHex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
const TR_SKY = [[0, '#070b1e', '#18264a'], [.22, '#0b1430', '#1d2c55'], [.27, '#3b3f78', '#f39a5b'], [.33, '#4f8fd8', '#ffd9a0'], [.42, '#2f7fdc', '#a9d6ff'], [.66, '#2f7fdc', '#b5dcff'], [.74, '#5a4a9a', '#ff8a4a'], [.79, '#1c1f4a', '#7a3a5a'], [.84, '#0b1430', '#1d2c55'], [1, '#070b1e', '#18264a']];
function trSky(tod) { let i = 0; while (i < TR_SKY.length - 2 && TR_SKY[i + 1][0] <= tod) i++; const a = TR_SKY[i], b = TR_SKY[i + 1], k = (tod - a[0]) / (b[0] - a[0] || 1); return [trMix(a[1], b[1], k), trMix(a[2], b[2], k)]; }
function trNight(tod) { if (tod > .3 && tod < .72) return 0; if (tod >= .22 && tod <= .3) return (.3 - tod) / .08; if (tod >= .72 && tod <= .82) return (tod - .72) / .1; return 1; }
function trLayer(sc, f, S, seed, W, fn) { const off = sc * f, i0 = Math.floor(off / S) - 1, i1 = Math.ceil((off + W) / S) + 1; for (let i = i0; i <= i1; i++) fn(i * S - off, trRnd(i, seed), i); }
function trPoly(x, pts, col) { x.fillStyle = col; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fill(); }
function trCirc(x, cx, cy, r, col) { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, Math.max(.5, r), 0, 7); x.fill(); }
function trPalm(x, px, gy, s, h) {
  x.strokeStyle = '#7a5a3a'; x.lineWidth = 7 * s; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, gy); x.quadraticCurveTo(px + 14 * s, gy - h * .5, px + 6 * s, gy - h); x.stroke();
  x.strokeStyle = '#2f7a3a'; x.lineWidth = 6 * s; for (let k = 0; k < 7; k++) { const a = -Math.PI + k * Math.PI / 6; x.beginPath(); x.moveTo(px + 6 * s, gy - h); x.quadraticCurveTo(px + 6 * s + Math.cos(a) * 30 * s, gy - h - 16 * s, px + 6 * s + Math.cos(a) * 52 * s, gy - h + Math.abs(Math.sin(a)) * 4 * s + 16 * s); x.stroke(); }
}
function trBaobab(x, px, gy, s, r) {
  const h = (90 + r * 60) * s, w = (26 + r * 14) * s;
  trPoly(x, [[px - w, gy], [px - w * .55, gy - h], [px + w * .55, gy - h], [px + w, gy]], '#8a6a52');
  x.strokeStyle = '#7a5a44'; x.lineWidth = 6 * s; x.lineCap = 'round';
  for (let k = 0; k < 6; k++) { const a = -Math.PI * (.15 + k * .14); x.beginPath(); x.moveTo(px, gy - h + 4 * s); x.lineTo(px + Math.cos(a) * 46 * s, gy - h + Math.sin(a) * 30 * s); x.stroke(); trCirc(x, px + Math.cos(a) * 46 * s, gy - h + Math.sin(a) * 30 * s, 11 * s, '#5f8a3a'); }
}
function trAcacia(x, px, gy, s, r) { const h = (70 + r * 40) * s; x.strokeStyle = '#5a4030'; x.lineWidth = 5 * s; x.beginPath(); x.moveTo(px, gy); x.lineTo(px + 6 * s, gy - h); x.stroke(); x.fillStyle = '#6b8e3a'; x.beginPath(); x.ellipse(px + 6 * s, gy - h, 50 * s, 13 * s, 0, 0, 7); x.fill(); }
function trTree(x, px, gy, s, h, col) { x.fillStyle = '#5a4030'; x.fillRect(px - 4 * s, gy - h, 8 * s, h); trCirc(x, px, gy - h, h * .35, col); trCirc(x, px - h * .22, gy - h * .85, h * .26, col); trCirc(x, px + h * .22, gy - h * .85, h * .26, col); }
function trAnimal(x, px, gy, s, kind, t) {
  const b = Math.sin(t * 8 + px) * 2 * s;
  if (kind === 'ele') { trCirc(x, px, gy - 46 * s, 34 * s, '#8d8a86'); trCirc(x, px + 34 * s, gy - 54 * s, 18 * s, '#8d8a86'); x.fillStyle = '#8d8a86'; [-22, -6, 10, 24].forEach(o => x.fillRect(px + o * s, gy - 26 * s, 10 * s, 26 * s + (o % 2 ? b : -b))); x.strokeStyle = '#8d8a86'; x.lineWidth = 7 * s; x.beginPath(); x.moveTo(px + 46 * s, gy - 52 * s); x.quadraticCurveTo(px + 56 * s, gy - 20 * s, px + 48 * s, gy - 10 * s); x.stroke(); x.strokeStyle = '#f2efe6'; x.lineWidth = 3 * s; x.beginPath(); x.moveTo(px + 40 * s, gy - 44 * s); x.lineTo(px + 52 * s, gy - 38 * s); x.stroke(); return; }
  // palanca negra
  x.fillStyle = '#2a211c'; x.beginPath(); x.ellipse(px, gy - 34 * s, 26 * s, 12 * s, 0, 0, 7); x.fill();
  [-18, -10, 12, 20].forEach(o => x.fillRect(px + o * s, gy - 26 * s, 3.5 * s, 26 * s + (o % 4 ? b : -b)));
  x.beginPath(); x.ellipse(px + 30 * s, gy - 48 * s, 7 * s, 10 * s, .4, 0, 7); x.fill(); x.fillRect(px + 18 * s, gy - 48 * s, 9 * s, 16 * s);
  x.fillStyle = '#f2efe6'; x.fillRect(px + 30 * s, gy - 44 * s, 6 * s, 4 * s);
  x.strokeStyle = '#2a211c'; x.lineWidth = 3 * s; x.beginPath(); x.moveTo(px + 28 * s, gy - 56 * s); x.quadraticCurveTo(px + 14 * s, gy - 90 * s, px - 6 * s, gy - 78 * s); x.stroke();
}
function trHills(x, W, base, amp, f, sc, col, seed, wl) { x.fillStyle = col; x.beginPath(); x.moveTo(0, base + amp * 3); for (let X = 0; X <= W + 20; X += 20) { const u = (X + sc * f) / (wl || 300); x.lineTo(X, base - amp * (.6 + .4 * Math.sin(u + seed) * Math.sin(u * .37 + seed * 2))); } x.lineTo(W, base + amp * 3); x.closePath(); x.fill(); }

/* um "bioma": fundo + camada média; L = pass de luzes (depois do escurecer da noite) */
function trBiome(x, k, W, H, sc, t, hz, s, L) {
  const gy = hz;
  switch (k) {
    case 'cidade': case 'cidadeX': {
      const X = k === 'cidadeX';
      trLayer(sc, .05, 64 * s, X ? 7 : 3, W, (px, r, i) => {
        const w = (40 + r * 46) * s, h = (X ? 160 + trRnd(i, 9) * 300 : 70 + trRnd(i, 9) * 200) * s;
        if (!L) { x.fillStyle = X ? ['#5f7894', '#7d93ad', '#4a6280', '#8fa6bf'][i & 3] : ['#8a9bb0', '#a5b4c4', '#7586a0', '#b9c3cf'][i & 3]; x.fillRect(px, gy - h, w, h + 4); if (X && r > .7) { x.fillRect(px + w / 2 - 2 * s, gy - h - 40 * s, 4 * s, 40 * s); } }
        else for (let yy = gy - h + 10 * s; yy < gy - 6 * s; yy += 13 * s) for (let xx = px + 5 * s; xx < px + w - 6 * s; xx += 10 * s) if (trRnd(i * 97 + Math.round(yy), Math.round(xx)) > .55) { x.fillStyle = '#ffd77a'; x.fillRect(xx, yy, 4 * s, 5 * s); }
      });
      trLayer(sc, .3, 170 * s, 11, W, (px, r, i) => {
        if (L) { if (r < .55) { x.fillStyle = '#ffe2a0'; x.fillRect(px + 30 * s, gy + 18 * s - 34 * s, 12 * s, 12 * s); } return; }
        if (i % 7 === 0 && TR.ads.length) { const a = TR.ads[Math.abs(i) % TR.ads.length]; x.fillStyle = '#555'; x.fillRect(px + 60 * s, gy - 30 * s, 6 * s, 50 * s); x.fillRect(px + 130 * s, gy - 30 * s, 6 * s, 50 * s); x.drawImage(a, px + 30 * s, gy - 110 * s, 140 * s, 70 * s); return; }
        if (r < .55) { const w = (90 + r * 60) * s, h = (50 + trRnd(i, 4) * 50) * s, c = ['#f2c14e', '#e76f51', '#f4a261', '#2a9d8f', '#e9c46a', '#d0d6dc', '#9d4edd'][Math.abs(i) % 7]; x.fillStyle = c; x.fillRect(px, gy + 18 * s - h, w, h); x.fillStyle = '#7a7f84'; x.fillRect(px - 4 * s, gy + 18 * s - h - 6 * s, w + 8 * s, 7 * s); x.fillStyle = '#2a3d52'; x.fillRect(px + 30 * s, gy + 18 * s - 34 * s, 12 * s, 12 * s); x.fillRect(px + 60 * s, gy + 18 * s - 34 * s, 12 * s, 12 * s); x.fillStyle = '#4a2e1a'; x.fillRect(px + 12 * s, gy + 18 * s - 26 * s, 12 * s, 26 * s); }
        else trPalm(x, px + 40 * s, gy + 20 * s, s, (80 + r * 40) * s);
      });
      break;
    }
    case 'costa': case 'falesia': {
      if (!L) {
        const sg = x.createLinearGradient(0, gy - 30 * s, 0, gy + 30 * s); sg.addColorStop(0, '#1f6fa8'); sg.addColorStop(1, '#3fb0d8'); x.fillStyle = sg; x.fillRect(0, gy - 26 * s, W, 60 * s);
        x.fillStyle = 'rgba(255,255,255,.55)'; trLayer(sc, .04, 40 * s, 5, W, (px, r) => x.fillRect(px, gy - 20 * s + r * 40 * s, 14 * s * r, 2 * s));
        trLayer(sc, .02, 600 * s, 6, W, (px, r) => { if (r > .5) return; trPoly(x, [[px, gy - 22 * s], [px + 40 * s, gy - 22 * s], [px + 34 * s, gy - 14 * s], [px + 6 * s, gy - 14 * s]], '#f2f2f2'); x.fillStyle = '#c8102e'; x.fillRect(px + 14 * s, gy - 34 * s, 4 * s, 12 * s); });
        if (k === 'falesia') trLayer(sc, .12, 90 * s, 12, W, (px, r, i) => { const h = (60 + r * 90) * s; trPoly(x, [[px - 10 * s, gy + 20 * s], [px + 6 * s, gy - h], [px + 18 * s, gy - h * .8], [px + 26 * s, gy - h * 1.05], [px + 40 * s, gy - h * .7], [px + 54 * s, gy - h * .9], [px + 100 * s, gy + 20 * s]], ['#c4572e', '#d9773e', '#b5482a'][Math.abs(i) % 3]); x.fillStyle = 'rgba(255,255,255,.15)'; for (let q = 0; q < 4; q++) x.fillRect(px + q * 18 * s, gy - h * .6 + q * 8 * s, 3 * s, h * .5); });
        x.fillStyle = '#ecd9a6'; x.fillRect(0, gy + 18 * s, W, 30 * s);
        trLayer(sc, .3, 160 * s, 13, W, (px, r, i) => { if (r < .6) trPalm(x, px, gy + 34 * s, s, (80 + r * 50) * s); else if (r < .8) { trPoly(x, [[px, gy + 30 * s], [px + 50 * s, gy + 30 * s], [px + 25 * s, gy - 10 * s]], '#c99a52'); x.fillStyle = '#7a5a3a'; x.fillRect(px + 23 * s, gy, 4 * s, 30 * s); } else { trPoly(x, [[px, gy + 30 * s], [px + 60 * s, gy + 30 * s], [px + 52 * s, gy + 40 * s], [px + 8 * s, gy + 40 * s]], '#2a7ab0'); } });
      }
      break;
    }
    case 'savana': case 'pedras': {
      if (!L) {
        trHills(x, W, gy, 26 * s, .04, sc, '#c9a36a', 1, 260 * s);
        if (k === 'pedras') trLayer(sc, .1, 220 * s, 21, W, (px, r) => { const h = (80 + r * 110) * s; x.fillStyle = '#2f2b2a'; x.beginPath(); x.ellipse(px, gy + 10 * s, (50 + r * 40) * s, h, 0, Math.PI, 0); x.fill(); x.fillStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.ellipse(px - 14 * s, gy - h * .5, 10 * s, h * .4, 0, 0, 7); x.fill(); });
        trLayer(sc, .3, 190 * s, 14, W, (px, r, i) => { if (r < .35) trBaobab(x, px, gy + 26 * s, s, r); else if (r < .7) trAcacia(x, px, gy + 26 * s, s, r); else if (r < .8) trAnimal(x, px, gy + 26 * s, s, Math.abs(i) % 3 ? 'pal' : 'ele', t); });
        x.fillStyle = '#b8945a'; trLayer(sc, .7, 30 * s, 15, W, (px, r) => { x.fillRect(px, gy + 40 * s + r * 20 * s, 2 * s, -10 * s * r); x.fillRect(px + 4 * s, gy + 40 * s + r * 20 * s, 2 * s, -14 * s * r); });
      }
      break;
    }
    case 'planalto': {
      if (!L) {
        trHills(x, W, gy - 6 * s, 40 * s, .04, sc, '#6f9f55', 2, 320 * s); trHills(x, W, gy + 10 * s, 26 * s, .1, sc, '#86b862', 4, 200 * s);
        trLayer(sc, .3, 120 * s, 16, W, (px, r, i) => {
          if (r < .45) { const h = (110 + r * 60) * s; x.fillStyle = '#d8cfc0'; x.fillRect(px - 2.5 * s, gy + 26 * s - h, 5 * s, h); x.fillStyle = '#4f7a4a'; x.beginPath(); x.ellipse(px, gy + 26 * s - h, 16 * s, 34 * s, 0, 0, 7); x.fill(); }
          else if (r < .7) { x.fillStyle = '#b06a3a'; x.beginPath(); x.ellipse(px, gy + 20 * s, 22 * s, 18 * s, 0, Math.PI, 0); x.fill(); x.fillRect(px - 22 * s, gy + 20 * s, 44 * s, 8 * s); trPoly(x, [[px - 30 * s, gy + 6 * s], [px, gy - 30 * s], [px + 30 * s, gy + 6 * s]], '#c9a050'); x.fillStyle = '#3a2416'; x.fillRect(px - 5 * s, gy + 12 * s, 10 * s, 16 * s); }
        });
      }
      break;
    }
    case 'serra': {
      if (!L) {
        trLayer(sc, .03, 300 * s, 17, W, (px, r, i) => { const h = (180 + r * 120) * s; trPoly(x, [[px - 200 * s, gy + 10 * s], [px, gy - h], [px + 200 * s, gy + 10 * s]], '#5b6f8a'); trPoly(x, [[px - 40 * s, gy - h * .8], [px, gy - h], [px + 40 * s, gy - h * .8], [px + 10 * s, gy - h * .75]], '#7d8fa6'); if (i % 3 === 0) { x.strokeStyle = 'rgba(240,230,210,.7)'; x.lineWidth = 2.5 * s; x.beginPath(); for (let z = 0; z < 7; z++) { const yy = gy - h * .1 - z * h * .1, wv = (90 - z * 11) * s; x.lineTo(px + (z % 2 ? wv : -wv), yy); } x.stroke(); } });
        trHills(x, W, gy + 6 * s, 50 * s, .1, sc, '#7a8f6a', 5, 220 * s);
        trLayer(sc, .3, 140 * s, 18, W, (px, r) => { if (r < .4) { x.fillStyle = '#8a8478'; x.beginPath(); x.ellipse(px, gy + 26 * s, 26 * s * (r + .6), 16 * s, 0, Math.PI, 0); x.fill(); } else if (r < .7) { x.strokeStyle = '#4f7a4a'; x.lineWidth = 4 * s; for (let q = -3; q <= 3; q++) { x.beginPath(); x.moveTo(px, gy + 26 * s); x.lineTo(px + q * 8 * s, gy - 10 * s - Math.abs(3 - Math.abs(q)) * 8 * s); x.stroke(); } } });
      }
      break;
    }
    case 'deserto': case 'dubai': {
      if (!L) {
        trHills(x, W, gy - 4 * s, 34 * s, .04, sc, '#e6b071', 3, 360 * s);
        if (k === 'dubai') trLayer(sc, .06, 70 * s, 22, W, (px, r, i) => { const tall = Math.abs(i) % 11 === 0, h = (tall ? 420 : 120 + r * 220) * s, w = (tall ? 30 : 30 + r * 30) * s; const g = x.createLinearGradient(px, 0, px + w, 0); g.addColorStop(0, '#9fc3dc'); g.addColorStop(1, '#5d87a8'); x.fillStyle = g; if (tall) trPoly(x, [[px, gy], [px + w * .3, gy - h], [px + w * .5, gy - h - 60 * s], [px + w * .7, gy - h], [px + w, gy]], g); else x.fillRect(px, gy - h, w, h); });
        trHills(x, W, gy + 14 * s, 22 * s, .12, sc, '#d99a5a', 6, 240 * s);
        trLayer(sc, .3, 200 * s, 19, W, (px, r, i) => { if (k === 'dubai' && r < .5) return trPalm(x, px, gy + 30 * s, s, 90 * s); if (r < .4) { x.fillStyle = '#5a6a3a'; for (let q = 0; q < 2; q++) { x.beginPath(); x.ellipse(px + (q ? 26 : -26) * s, gy + 26 * s, 34 * s, 7 * s, q ? .2 : -.2, 0, 7); x.fill(); } x.fillStyle = '#8a5a3a'; x.fillRect(px - 8 * s, gy + 18 * s, 16 * s, 8 * s); } else if (r < .6) { x.fillStyle = '#a07a5a'; x.beginPath(); x.ellipse(px, gy + 26 * s, 22 * s, 14 * s, 0, Math.PI, 0); x.fill(); } else if (r < .7) trAnimal(x, px, gy + 26 * s, s * .9, 'pal', t); });
      }
      break;
    }
    case 'quedas': case 'floresta': {
      if (!L) {
        if (k === 'quedas') {
          trHills(x, W, gy - 70 * s, 30 * s, .06, sc, '#355f35', 8, 260 * s); x.fillStyle = '#3f6b3a'; x.fillRect(0, gy - 60 * s, W, 80 * s);
          trLayer(sc, .06, 260 * s, 23, W, (px, r) => { const w = (30 + r * 40) * s; const g = x.createLinearGradient(0, gy - 90 * s, 0, gy + 20 * s); g.addColorStop(0, '#e8f6ff'); g.addColorStop(1, '#bfe3f2'); x.fillStyle = g; x.fillRect(px, gy - 92 * s, w, 112 * s); x.fillStyle = 'rgba(160,200,220,.7)'; for (let q = 0; q < 6; q++) { const yy = (t * 120 * s + q * 22 * s) % (110 * s); x.fillRect(px + q * w / 6, gy - 92 * s + yy, 2 * s, 14 * s); } x.fillStyle = 'rgba(255,255,255,.55)'; for (let q = 0; q < 5; q++) trCirc(x, px + w / 2 + (q - 2) * 16 * s, gy + 18 * s - Math.sin(t * 2 + q) * 3 * s, 18 * s, 'rgba(255,255,255,.45)'); });
        } else { trLayer(sc, .05, 60 * s, 24, W, (px, r) => trCirc(x, px, gy, (40 + r * 30) * s, '#2f5a32')); x.fillStyle = '#2f5a32'; x.fillRect(0, gy, W, 30 * s); }
        trLayer(sc, .3, 110 * s, 25, W, (px, r) => { if (r < .6) trTree(x, px, gy + 30 * s, s, (80 + r * 70) * s, ['#3d7a3a', '#2f6a35', '#4f8a3a'][Math.floor(r * 30) % 3]); else if (r < .85) { x.strokeStyle = '#3f8a3a'; x.lineWidth = 9 * s; for (let q = -2; q <= 2; q++) { x.beginPath(); x.moveTo(px, gy + 30 * s); x.quadraticCurveTo(px + q * 16 * s, gy - 30 * s, px + q * 34 * s, gy - 10 * s); x.stroke(); } } });
      }
      break;
    }
    case 'europa': {
      if (!L) {
        trHills(x, W, gy - 10 * s, 50 * s, .04, sc, '#9aa978', 7, 300 * s);
        trLayer(sc, .06, 26 * s, 26, W, (px, r, i) => { const yy = gy - 20 * s - 40 * s * (.5 + .5 * Math.sin((px + sc * .06) / (300 * s) + 7)); x.fillStyle = ['#f4ead5', '#f2d7a8', '#e8e0d0', '#f6c9a0'][Math.abs(i) % 4]; x.fillRect(px, yy, 22 * s, 18 * s); trPoly(x, [[px - 2 * s, yy], [px + 11 * s, yy - 9 * s], [px + 24 * s, yy]], '#c25a32'); });
        x.fillStyle = '#5b8fb0'; x.fillRect(0, gy + 6 * s, W, 14 * s);
        trLayer(sc, .3, 260 * s, 27, W, (px, r) => { if (r < .5) trTree(x, px, gy + 30 * s, s, 90 * s, '#5f8a4a'); else if (r < .75) { x.fillStyle = '#ffcb00'; x.fillRect(px, gy - 14 * s, 90 * s, 38 * s); x.fillStyle = '#2a3d52'; for (let q = 0; q < 5; q++) x.fillRect(px + 6 * s + q * 17 * s, gy - 8 * s, 11 * s, 12 * s); x.fillStyle = '#333'; x.fillRect(px + 44 * s, gy - 34 * s, 2 * s, 20 * s); } });
      }
      break;
    }
  }
}
const TR_GROUND = { cidade: ['#b9b3a6', '#9a9488'], cidadeX: ['#a9a9a9', '#8a8a8a'], costa: ['#e3cf98', '#cdb67a'], falesia: ['#d9b47a', '#c09058'], savana: ['#d8b878', '#b8945a'], pedras: ['#c8a868', '#a88848'], planalto: ['#8fbf5f', '#6f9f45'], serra: ['#9a8f6a', '#7a704a'], deserto: ['#ecc48a', '#d8a86a'], dubai: ['#ecc896', '#d8b07a'], quedas: ['#5f9a45', '#4a7f38'], floresta: ['#4f7f3a', '#3a6a2a'], europa: ['#b8b0a0', '#9a9284'] };
