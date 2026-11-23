/* =========================================================
   VIDA REAL (vida6ev) — eventos do dia a dia angolano
   · situações ao vivo enquanto andas pela cidade (rusgas, família, burlas…)
   · eventos anuais ligados aos novos sistemas (contas, documentos, saúde,
     família alargada, trabalho, cultura)
   · eventos de estrada, notícias, datas, edifícios e interiores (SIAC e Hospital)
   ========================================================= */
const v6Fam = () => pick(['o tio Zeca', 'a tia Bina', 'o primo Nelo', 'a prima Tuca', 'o tio Kiluange', 'a avó Nga Maria', 'a tia Fátima', 'o primo Didi']);
const v6Prov = () => pick(PROVINCIAS.filter(p => p.n !== G.cidade.prov)).n;
const v6Fil = (a, b) => G.filhos.filter(f => f.idade >= a && f.idade <= b);
const v6Pay = (v, ok, nao) => { v = Math.round(v); if (G.dinheiro < v) return nao || `Não tinhas ${kz(v)}… ficou para outra vez.`; G.dinheiro -= v; return ok; };
const v6Rua = () => !(typeof inInt !== 'undefined' && inInt);

/* =========================================================
   SITUAÇÕES AO VIVO (aparecem de 4 em 4 a 7 minutos, se estiverem ligadas)
   ========================================================= */
const V6_RT = [
  { w: 3, cond: () => G.idade >= 16 && v6Rua(), ev: () => ({ ico: '👮', t: 'Rusga da Polícia', txt: () => 'Dois agentes param-te no passeio: "Boa tarde. Documento, por favor."', ch: v6DocOk('bi') ? [
      ['Mostrar o BI', 'Tudo em ordem', () => '🪪 O agente olhou para o BI, olhou para ti e mandou seguir. ' + fx({ karma: 1 })],
      ['Perguntar porque estão a parar toda a gente', 'Arriscado', () => chance(.6) ? 'Explicaram que há uma operação no bairro. Seguiste.' : 'Não gostaram da pergunta e fizeram-te esperar meia hora ao sol. ' + fx({ felicidade: -4 })],
    ] : [
      ['Pagar uma "gasosa" de 2.000 Kz', 'Rápido, mas é suborno', () => { v6G().gasosas++; return v6Pay(2000, '💸 O agente guardou a nota e disse "da próxima vez traz o documento". ' + fx({ karma: -3 }), 'Não tinhas dinheiro: levaram-te para a esquadra e só saíste à noite. ' + fx({ felicidade: -8 })); }],
      ['Explicar que ainda não tens BI', 'Vais à esquadra', () => { if (G.vr) G.vr.energia = Math.max(0, G.vr.energia - 20); return '🚓 Passaste a tarde na esquadra até alguém confirmar quem eras. Trata do BI no SIAC (Mutamba)! ' + fx({ felicidade: -6 }); }],
      ['Fugir a correr', '50/50', () => chance(.5) ? '🏃 Fugiste por um beco. Ninguém te seguiu… desta vez. ' + fx({ karma: -2, saude: -1 }) : '🏃 Apanharam-te logo na esquina. Multa de 10.000 Kz por desobediência. ' + (v6Multa(10000, 'Desobediência numa rusga'), fx({ felicidade: -6, karma: -2 }))],
    ] }) },
  { w: 2, cond: () => G.tel >= 1 && (parentsAlive() || v6G().famRep > 30), ev: () => { const q = parentsAlive() ? (G.mae.vivo ? 'A tua mãe' : 'O teu pai') : v6Fam().replace(/^./, c => c.toUpperCase()); return { ico: '📱', t: 'Mensagem da família', txt: () => `${q} mandou mensagem: "Filho(a), manda só um saldo de 2.000 que o meu acabou. Preciso de ligar para a tua tia na província."`, ch: [
      ['Mandar 2.000 Kz de saldo', 'Família é família', () => { v6G().famRep = clamp(v6G().famRep + 3); ['pai', 'mae'].forEach(k => { if (G[k].vivo) G[k].rel = clamp(G[k].rel + 3); }); return v6Pay(2000, '📲 Mandaste o saldo. Recebeste uma mensagem de voz cheia de bênçãos. ' + fx({ karma: 2, felicidade: 2 })); }],
      ['Mandar 500 Kz', 'O que dá', () => v6Pay(500, '📲 Mandaste 500. "Obrigado, filho(a), Deus te pague." ' + fx({ karma: 1 }))],
      ['Dizer que também estás sem saldo', '', () => { v6G().famRep = clamp(v6G().famRep - 2); return 'Ficou um silêncio no Fala Já… ' + fx({ karma: -1 }); }],
    ] }; } },
  { w: 2, cond: () => G.idade >= 20 && G.dinheiro > 40000, ev: () => { const f = v6Fam(), v = R(15, 40) * 1000; return { ico: '🎓', t: 'Pedido da família alargada', txt: () => `Ligou ${f}: "O teu primo vai ser expulso da escola se não pagar a propina de ${kz(v)} até sexta. Sabes como é, não temos como…"`, ch: [
      ['Pagar a propina toda', kz(v), () => { v6G().famRep = clamp(v6G().famRep + 6); return v6Pay(v, `🎓 Pagaste a propina. ${f.replace(/^o |^a /, '')} disse a toda a família que és um orgulho. ` + fx({ karma: 5, felicidade: 3 })); }],
      ['Dar metade', kz(v / 2), () => { v6G().famRep = clamp(v6G().famRep + 2); return v6Pay(v / 2, '🎓 Deste metade. O resto juntaram com outros familiares. ' + fx({ karma: 2 })); }],
      ['Dizer que não podes', '', () => { v6G().famRep = clamp(v6G().famRep - 5); return 'No próximo óbito vão comentar que "agora já não conhece a família". ' + fx({ karma: -2 }); }],
    ] }; } },
  { w: 1, cond: () => G.idade >= 18, ev: () => ({ ico: '🕯️', t: 'Óbito no bairro', txt: () => 'Faleceu o kota Domingos, vizinho de há muitos anos. A família está a fazer o óbito no quintal e os vizinhos estão a juntar a comba (contribuição).', ch: [
      ['Ir ao óbito e dar 5.000 Kz de comba', 'Respeito', () => { v6G().famRep = clamp(v6G().famRep + 3); return v6Pay(5000, '🕯️ Ficaste a noite no óbito, com café, cantos e histórias do kota. A família agradeceu. ' + fx({ karma: 4, felicidade: -2 })); }],
      ['Mandar só a comba (2.000 Kz)', '', () => v6Pay(2000, '🕯️ Mandaste a contribuição por um vizinho. ' + fx({ karma: 1 }))],
      ['Não ir', '', () => { v6G().famRep = clamp(v6G().famRep - 3); return 'No bairro repararam que não apareceste. ' + fx({ karma: -2 }); }],
    ] }) },
  { w: 2, cond: () => v6G().hoje.agua && v6Aqui('casa', 40), ev: () => ({ ico: '🚰', t: 'Não há água!', txt: () => 'Abriste a torneira… nada. A EPAL cortou a água no bairro outra vez. Os bidões estão vazios.', ch: [
      ['Comprar água ao camião-cisterna', '3.000 Kz', () => { v6G().hoje.agua = false; return v6Pay(3000, '🚚 O camião encheu os bidões. Banho tomado! ' + fx({ felicidade: 1 })); }],
      ['Ir buscar ao chafariz com bidões', 'Cansa', () => { v6G().hoje.agua = false; if (G.vr) G.vr.energia = Math.max(0, G.vr.energia - 15); return '🪣 Carregaste bidões de 20 litros na cabeça, como toda a gente do bairro. ' + fx({ saude: 1, felicidade: -2 }); }],
      ['Ficar sem banho hoje', '', () => '😬 Desodorizante e boa sorte. ' + fx({ aparencia: -2, felicidade: -1 })],
    ] }) },
  { w: 1, cond: () => G.tel >= 2 && v6Rua(), ev: () => ({ ico: '📱', t: '"Empresta só o telefone"', txt: () => 'Um jovem bem vestido aproxima-se: "Mano, desculpa, o meu telefone morreu. Empresta só para fazer uma chamada rápida à minha mãe?"', ch: [
      ['Emprestar', 'Confiar', () => { if (chance(.4)) { G.tel = Math.max(1, G.tel - 1); return '🏃 Fez a "chamada"… a correr para o fim da rua! Perdeste o telemóvel bom (ficaste com um velhinho). ' + fx({ felicidade: -12 }); } return 'Fez mesmo a chamada e agradeceu. Ainda há gente boa! ' + fx({ karma: 3 }); }],
      ['Ligar tu e pôr em alta voz', 'Esperto', () => 'Ligaste tu e passaste a chamada em alta voz. Ele desistiu logo… ' + fx({ inteligencia: 1 })],
      ['Dizer que não', '', () => 'Seguiste caminho com o telefone bem guardado.'],
    ] }) },
  { w: 1, cond: () => G.tel >= 1 && G.idade >= 16, ev: () => ({ ico: '✉️', t: 'SMS: "Parabéns, ganhou!"', txt: () => 'SMS de um número estranho: "PARABÉNS! Ganhou 5.000.000 Kz na promoção DarkCell. Para levantar envie 5.000 Kz de saldo para este número."', ch: [
      ['Mandar os 5.000 Kz', '5 milhões!', () => v6Pay(5000, '🤦 Mandaste… e o número desapareceu. Era burla, claro. ' + fx({ felicidade: -5, inteligencia: 1 }))],
      ['Apagar e bloquear', 'Já conheces essa', () => '🛡️ Burla clássica. Bloqueado! ' + fx({ inteligencia: 1 })],
      ['Responder a gozar', '', () => '😂 Respondeste "manda tu primeiro". Nunca mais escreveram. ' + fx({ felicidade: 2 })],
    ] }) },
  { w: 2, cond: () => G.emprego && G.emprego.id === 'zungueiro', ev: () => ({ ico: '🚨', t: 'Fiscais na zunga!', txt: () => 'Os fiscais do Governo Provincial estão a correr atrás das zungueiras e a apreender as bacias com a mercadoria!', ch: [
      ['Fugir com a bacia', 'Rápido!', () => chance(.6) ? '🏃‍♀️ Fugiste por entre os candongueiros com a bacia na cabeça. Mercadoria salva! ' + fx({ saude: -1 }) : '😢 Apanharam-te: levaram a mercadoria toda (−8.000 Kz). ' + (G.dinheiro -= 8000, fx({ felicidade: -8 }))],
      ['Pagar 2.000 Kz ao fiscal', 'Gasosa', () => { v6G().gasosas++; return v6Pay(2000, '💸 O fiscal fingiu que não te viu. ' + fx({ karma: -2 })); }],
      ['Ir para o mercado formal amanhã', 'Pagas lugar', () => '🏪 Decidiste pagar um lugar no mercado (1.500 Kz por dia). Menos sustos. ' + (G.dinheiro -= 1500, fx({ felicidade: 1 }))],
    ] }) },
  { w: 1, cond: () => v6Chuvas() && v6Rua(), ev: () => ({ ico: '🌧️', t: 'A rua virou lagoa', txt: () => 'Choveu uma hora e a rua desapareceu debaixo de água castanha. Para atravessar, ou molhas os pés… ou pagas a um miúdo que carrega as pessoas às costas.', ch: [
      ['Atravessar a pé', 'Molha tudo', () => chance(.25) ? '🦠 Atravessaste e dias depois apareceu uma infeção no pé. ' + fx({ saude: -5 }) : '🌊 Água pelo joelho, sapatos estragados. ' + fx({ aparencia: -1, felicidade: -1 })],
      ['Pagar 200 Kz ao miúdo', 'Às costas', () => v6Pay(200, '😂 O miúdo atravessou-te às costas como um saco de fuba. ' + fx({ felicidade: 2, karma: 1 }))],
      ['Apanhar uma kupapata', '500 Kz', () => v6Pay(500, '🏍️ A kupapata passou a lagoa a abrir. Chegaste seco(a).')],
    ] }) },
  { w: 1, cond: () => v6Aqui('casa', 40) && ((typeof p2Hour === 'function' && (p2Hour() >= 20 || p2Hour() < 4))), ev: () => ({ ico: '🔊', t: 'O vizinho e o kuduro', txt: () => 'São horas de dormir, mas o vizinho pôs a coluna no máximo: kuduro, kizomba e amigos a gritar no quintal.', ch: [
      ['Juntar-te à festa', 'Se não os vences…', () => '🕺 Acabaste a dançar no quintal do vizinho até às 3. ' + fx({ felicidade: 5, saude: -2 })],
      ['Ir pedir para baixar', '', () => chance(.6) ? 'Baixou o volume e ainda te deu um prato de grelhados. ' + fx({ karma: 1, felicidade: 2 }) : 'Disse que "é sexta-feira". O volume subiu. ' + fx({ felicidade: -4 })],
      ['Chamar a polícia', '', () => 'A polícia chegou duas horas depois, quando a festa já tinha acabado. ' + fx({ felicidade: -2 })],
    ] }) },
  { w: 1, cond: () => G.idade >= 18, ev: () => ({ ico: '💌', t: 'Convite para alembamento', txt: () => `Um kamba vai fazer o alembamento da namorada no sábado e convida-te. "Traz qualquer coisa: uma grade, um envelope… e vem bem vestido(a)!"`, ch: [
      ['Levar uma grade de cerveja', '12.000 Kz', () => v6Pay(12000, '🍻 Chegaste com a grade e foste recebido(a) como da família. Que festa! ' + fx({ felicidade: 6, karma: 2 }))],
      ['Levar um envelope de 5.000 Kz', '', () => v6Pay(5000, '💌 Entregaste o envelope aos noivos. ' + fx({ felicidade: 4, karma: 1 }))],
      ['Inventar uma desculpa', '', () => 'Ficaste em casa. Viste as fotos no Bwé Social… ' + fx({ felicidade: -1 })],
    ] }) },
  { w: 1, cond: () => v6Rua() && G.dinheiro > 1000, ev: () => ({ ico: '🧒', t: 'Criança de rua', txt: () => 'Um menino de uns 8 anos, descalço, pede: "Mano, dá só para o pão…"', ch: [
      ['Comprar-lhe comida', '1.000 Kz', () => v6Pay(1000, '🍞 Compraste-lhe pão com chouriço e um sumo. O sorriso dele valeu o dia. ' + fx({ karma: 5, felicidade: 3 }))],
      ['Dar 200 Kz', '', () => v6Pay(200, 'Agradeceu e correu para os amigos. ' + fx({ karma: 2 }))],
      ['Seguir', '', () => fx({ karma: -1 })],
    ] }) },
  { w: 1, cond: () => G.idade >= 18 && v6Rua(), ev: () => ({ ico: '💵', t: 'Kinguila com taxa "especial"', txt: () => 'Um senhor aproxima-se a sussurrar: "Dólar a 700! Só hoje, mano. Tenho 200 dólares, faço-te tudo por 140 mil."', ch: [
      ['Aceitar', 'Barato demais…', () => v6Pay(140000, '🤦 Em casa percebeste: as notas eram fotocópias a cores. Burla! ' + fx({ felicidade: -10, inteligencia: 1 }), 'Não tinhas o dinheiro. Ainda bem!')],
      ['Recusar', 'Ninguém dá dinheiro', () => '🛡️ Ninguém vende dólares abaixo do banco. Era burla. ' + fx({ inteligencia: 1 })],
    ] }) },
  { w: 2, cond: () => v6Formal(), ev: () => ({ ico: '📞', t: 'O patrão ligou', txt: () => '"Amanhã é sábado, mas preciso de ti cá. Horas extra… depois vemos isso."', ch: [
      ['Ir trabalhar', 'O patrão gosta', () => { if (G.emprego) G.emprego.desemp = clamp((G.emprego.desemp || 50) + 6); return chance(.5) ? '💼 Trabalhaste o sábado todo e ele até pagou as horas: +6.000 Kz. ' + fx({ dinheiro: 6000, felicidade: -2 }) : '💼 Trabalhaste o sábado… "depois vemos" nunca chegou. ' + fx({ felicidade: -4 }); }],
      ['Dizer que tens compromisso de família', '', () => { if (G.emprego) G.emprego.desemp = clamp((G.emprego.desemp || 50) - 4); return 'Ficou chateado, mas aceitou. ' + fx({ felicidade: 2 }); }],
    ] }) },
  { w: 1, cond: () => v6G().casa.agua === 'cac' && !v6G().casa.filtro && v6Aqui('casa', 40), ev: () => ({ ico: '🤢', t: 'Dores de barriga', txt: () => 'A água da cacimba não caiu bem. Diarreia e cólicas.', ch: [
      ['Soro caseiro (água fervida, sal e açúcar)', 'Grátis', () => '🥤 O soro caseiro segurou a coisa. Ferve sempre a água! ' + fx({ saude: -2 })],
      ['Ir à clínica', '15.000 Kz', () => v6Pay(15000, '🏥 Medicação e soro na clínica. Melhor rápido. ' + fx({ saude: 2 }), 'Sem dinheiro para a clínica… ' + fx({ saude: -5 }))],
      ['Ignorar', '', () => '😖 Passaste o dia de cama. ' + fx({ saude: -6, felicidade: -3 })],
    ] }) },
  { w: 1, cond: () => G.idade >= 16 && v6Rua(), ev: () => ({ ico: '🚐', t: 'Candongueiro', txt: () => '"Mutamba, Mutamba! Viana, Viana!" Entras no azul e branco, quatro por banco. Na hora de pagar, o cobrador diz que não tem troco para a nota de 1.000 Kz.', ch: [
      ['Deixar o troco', '"Fica para a gasosa"', () => '😅 Ficou com os 700 Kz de troco. ' + (G.dinheiro -= 700, fx({ karma: 1 }))],
      ['Esperar até ele ter troco', '', () => 'Duas paragens depois, lá apareceu o troco. ' + fx({ felicidade: -1 })],
      ['Pagar com Palanca Pay', 'Se tiver smartphone', () => G.tel >= 2 ? '📲 Pagaste por QR code. Nem o cobrador acreditou. ' + fx({ felicidade: 1 }) : 'Sem smartphone… deixaste o troco. ' + (G.dinheiro -= 700, '')],
    ] }) },
];
function v6RT() {
  const pool = V6_RT.filter(x => { try { return x.cond(); } catch (e) { return false; } });
  if (!pool.length) return;
  const tot = pool.reduce((s, x) => s + x.w, 0); let r = Math.random() * tot, X = pool[0];
  for (const x of pool) { r -= x.w; if (r <= 0) { X = x; break; } }
  const ev = X.ev(); v6G().rtN++;
  if (typeof SND !== 'undefined') SND.play('notif');
  eventModal(ev);
}

/* =========================================================
   EVENTOS ANUAIS (entram no sorteio do +1 ANO)
   ========================================================= */
const V6_EVT = ['Fatura da ENDE', 'O senhorio quer aumentar a renda', 'O táxi subiu', 'O arroz subiu outra vez', 'O gerador avariou', 'Campanha do BI no bairro', 'O processo não anda', 'Operação Stop', 'Carta da AGT', 'Registo de nascimento', 'Multicaixa sem dinheiro', 'Febre do teu filho', 'Óbito na família', 'A família da província pede ajuda', 'O sobrinho vem estudar para a cidade', 'O primo quer um emprego', 'O filho quer telemóvel novo', 'Festa de finalistas', 'Abertura do ano letivo', 'Estudar em Portugal', 'A avó vem a Luanda ao hospital', 'Convite para padrinho/madrinha', 'Os pais precisam de cuidados', 'Salários em atraso', 'Sem descontos para o INSS', 'O agiota do bairro', 'Biscate de fim de semana', 'Aumento do salário mínimo', 'Final da Taça de Angola', 'Carnaval no bairro', 'Concerto da velha guarda', 'Dia de eleições', 'Corrida de São Silvestre', 'Excursão a Kalandula', 'Festa de kuduro no bairro'];
EVENTS.push(
  // ---- contas e dia a dia
  { ico: '💡', t: 'Fatura da ENDE', cond: () => v6Indep() && v6G().casa.luz === 'ende', txt: () => 'Chegou a fatura da luz: 85.000 Kz num só mês! A casa nem tem ar condicionado…', ch: [
    ['Reclamar na loja da ENDE', 'Fila e paciência', () => chance(.55) ? 'Depois de duas manhãs na fila, corrigiram a fatura para 9.000 Kz. ' + fx({ felicidade: 4 }) : 'Disseram que "o sistema não permite alterar". Pagaste. ' + (G.dinheiro -= 85000, fx({ felicidade: -6 }))],
    ['Pagar para não cortarem', '', () => { G.dinheiro -= 85000; return 'Pagaste os 85.000 Kz a resmungar. ' + fx({ felicidade: -4 }); }],
    ['Instalar contador pré-pago', '35.000 Kz', () => { const c = v6G().casa; G.dinheiro -= 35000; c.contador = 1; c.luz = 'pre'; return '🔌 Instalaste contador pré-pago. Nunca mais faturas por estimativa! ' + fx({ felicidade: 3 }); }],
  ] },
  { ico: '🏠', t: 'O senhorio quer aumentar a renda', cond: () => G.casa.tipo === 'arrendada', txt: () => '"A vida está cara, o dólar subiu… a partir deste mês a renda sobe 20%."', ch: [
    ['Aceitar', 'Paz', () => { const v = Math.round(casaT(G.casa.id).renda * cid().custo * .2); G.dinheiro -= v; return `Pagaste a diferença deste ano (${kzShort(v)}). ` + fx({ felicidade: -3 }); }],
    ['Negociar', 'Lábia', () => chance(.5 + (talento('labia') ? .25 : 0)) ? 'Mostraste que pagas sempre a horas. Ficou só em +5%. ' + (G.dinheiro -= Math.round(casaT(G.casa.id).renda * cid().custo * .05), fx({ felicidade: 2 })) : 'Não cedeu: ou pagas ou sais. Pagaste. ' + (G.dinheiro -= Math.round(casaT(G.casa.id).renda * cid().custo * .2), fx({ felicidade: -4 }))],
    ['Ameaçar mudar de casa', '', () => chance(.4) ? 'Ele não quis perder um bom inquilino: a renda fica igual! ' + fx({ felicidade: 4 }) : 'Respondeu "a porta é ali". Tiveste de aceitar o aumento. ' + (G.dinheiro -= Math.round(casaT(G.casa.id).renda * cid().custo * .2), fx({ felicidade: -5 }))],
  ] },
  { ico: '🚐', t: 'O táxi subiu', cond: () => G.idade >= 16, txt: () => 'Os taxistas anunciaram: o candongueiro passa a custar mais 100 Kz por corrida, por causa do preço do combustível.', ch: [
    ['Andar mais a pé', 'Poupa e faz exercício', () => fx({ saude: 2, felicidade: -1 })],
    ['Comprar uma bicicleta', '', () => G.bens.includes('bike') ? 'Já tens bicicleta: agora é que ela vai trabalhar! ' + fx({ saude: 2 }) : (G.dinheiro >= 60000 ? (G.dinheiro -= 60000, G.bens.push('bike'), '🚲 Compraste uma bicicleta. Liberdade! ' + fx({ saude: 3, felicidade: 3 })) : 'Não havia dinheiro para a bicicleta.')],
    ['Aceitar e pagar', '', () => { G.dinheiro -= 25000; return 'Mais 25.000 Kz de transportes ao longo do ano. ' + fx({ felicidade: -2 }); }],
  ] },
  { ico: '🛒', t: 'O arroz subiu outra vez', cond: () => G.idade >= 18 && G.casa.tipo !== 'pais', txt: () => 'No Roque, o saco de 25 kg de arroz subiu 3.000 Kz num mês. As mamãs dizem que é "por causa do dólar".', ch: [
    ['Comprar a granel com os vizinhos', 'Compra conjunta', () => 'Juntaram-se e compraram ao armazém: saiu mais barato para todos. ' + fx({ karma: 2, felicidade: 2, dinheiro: 15000 })],
    ['Cortar nas despesas', '', () => 'Menos carne, mais feijão e funge. ' + fx({ saude: -1, dinheiro: 20000 })],
    ['Comprar no Kianda Mall, que é mais rápido', '', () => 'Pagaste o preço do mall. ' + fx({ dinheiro: -30000, felicidade: 1 })],
  ] },
  { ico: '⛽', t: 'O gerador avariou', cond: () => v6Indep() && v6G().casa.ger, txt: () => 'Corte da ENDE, puxas a corda do gerador… nada. O motor gripou.', ch: [
    ['Levar ao mecânico do bairro', '40.000 Kz', () => { G.dinheiro -= 40000; return 'O kota mecânico pôs a trabalhar como novo. ' + fx({ felicidade: 2 }); }],
    ['Ficar sem gerador', '', () => { v6G().casa.ger = 0; return 'Vendeste o gerador para sucata. Agora os cortes são às escuras. ' + fx({ dinheiro: 15000, felicidade: -3 }); }],
  ] },
  // ---- documentos e serviços
  { ico: '🪪', t: 'Campanha do BI no bairro', cond: () => G.idade >= 10 && !v6DocOk('bi') && !v6Proc('bi'), txt: () => 'Há uma brigada móvel de registo e emissão do BI na escola do bairro. É grátis, mas a fila dá a volta ao quarteirão.', ch: [
    ['Ir e esperar o dia todo', 'BI grátis', () => { if (chance(.75)) { v6G().docs.bi = G.ano; v6G().biTeve = 1; return '🪪 Passaste o dia na fila… mas saíste com o BI na mão! ' + fx({ felicidade: 6 }); } return 'O sistema foi abaixo às 15h e mandaram toda a gente embora. ' + fx({ felicidade: -4 }); }],
    ['Fica para depois', '', () => 'Fica para depois… Sem BI não há emprego com contrato.'],
  ] },
  { ico: '🗂️', t: 'O processo não anda', cond: () => G.idade >= 18, txt: () => 'Há semanas que o teu processo está parado numa repartição. Um funcionário diz baixinho: "Se quiser, posso despachar hoje… com uma gasosa de 10.000."', ch: [
    ['Pagar a gasosa', 'Rápido', () => { v6G().gasosas++; G.dinheiro -= 10000; return chance(.15) ? 'Era uma operação da Inspeção! Multa de 50.000 Kz. ' + (G.dinheiro -= 50000, fx({ karma: -6, felicidade: -8 })) : 'O processo ficou pronto em 10 minutos. ' + fx({ karma: -4 }); }],
    ['Recusar e esperar', 'Honestidade', () => 'Esperaste mais um mês, mas ficou tratado. ' + fx({ karma: 3, felicidade: -2 })],
    ['Denunciar na linha anticorrupção', '', () => chance(.4) ? 'O funcionário foi suspenso e o processo andou! ' + fx({ karma: 6, fama: 1 }) : 'Nada aconteceu… e o processo "perdeu-se". ' + fx({ karma: 3, felicidade: -4 })],
  ] },
  { ico: '🚔', t: 'Operação Stop', cond: () => G.carta && G.bens.some(b => typeof VEIC !== 'undefined' && VEIC[b] && VEIC[b].cat === 'carro'), txt: () => 'Num controlo na Avenida 21 de Janeiro, o agente diz que ias a 80 numa zona de 60. "São 30.000 Kz… ou resolvemos aqui."', ch: [
    ['Aceitar a multa', 'Paga no SIAC', () => { v6Multa(30000, 'Excesso de velocidade'); return '🧾 Ficou registada a multa de 30.000 Kz. Paga no SIAC ou no Palanca Pay antes que duplique.'; }],
    ['Resolver ali (gasosa de 5.000)', 'Suborno', () => { v6G().gasosas++; G.dinheiro -= 5000; return 'O agente guardou os 5.000 e mandou seguir. ' + fx({ karma: -3 }); }],
    ['Pedir para ver o radar', '', () => chance(.4) ? 'Não havia radar nenhum. Mandou seguir. ' + fx({ felicidade: 3 }) : 'Mostrou o radar: 82 km/h. Multa a dobrar por teimosia. ' + (v6Multa(60000, 'Excesso de velocidade'), fx({ felicidade: -4 }))],
  ] },
  { ico: '🧾', t: 'Carta da AGT', cond: () => G.negocios.length > 0 || (G.emprego && job(G.emprego.id).informal && G.idade >= 25), txt: () => 'Chegou uma notificação da AGT: "Regularize a sua situação fiscal no prazo de 30 dias."', ch: [
    ['Ir à repartição regularizar', '', () => { if (!v6DocOk('nif')) { v6G().docs.nif = G.ano; return 'Tiraste o NIF e regularizaste tudo. Pagaste 20.000 Kz de coima. ' + (G.dinheiro -= 20000, fx({ karma: 2 })); } return 'Estava quase tudo em ordem: coima de 10.000 Kz. ' + (G.dinheiro -= 10000, fx({ karma: 2 })); }],
    ['Ignorar', 'Ninguém vem', () => chance(.5) ? 'Ninguém veio… por agora.' : (v6Multa(80000, 'Coima da AGT'), 'A AGT aplicou uma coima de 80.000 Kz. Está nas tuas multas.')],
  ] },
  { ico: '👶', t: 'Registo de nascimento', cond: () => G.filhos.some(f => f.idade <= 1 && !f.reg), txt: () => 'O bebé ainda não está registado na Conservatória. Sem registo não há BI, nem escola, nem vacinas no cartão.', ch: [
    ['Ir à Conservatória registar', 'Grátis', () => { G.filhos.forEach(f => { if (f.idade <= 1) f.reg = 1; }); return '📜 Registaste o bebé. Já tem nome oficial e cédula. ' + fx({ karma: 3, felicidade: 3 }); }],
    ['Deixar para depois', '', () => { G.filhos.forEach(f => { if (f.idade <= 1) f.rel = clamp(f.rel - 3); }); return 'Depois vai dar mais trabalho (e multa). ' + fx({ karma: -1 }); }],
  ] },
  { ico: '🏧', t: 'Multicaixa sem dinheiro', cond: () => G.idade >= 18, txt: () => 'Dia de salário: todos os multicaixas da zona estão "fora de serviço" ou sem notas. Há uma fila de 40 pessoas no único que funciona.', ch: [
    ['Esperar na fila', '1 hora ao sol', () => fx({ felicidade: -2 }) + ' Levantaste à terceira tentativa.'],
    ['Pagar tudo com Palanca Pay', 'Smartphone', () => G.tel >= 2 ? 'Pagaste tudo por transferência. O futuro chegou! ' + fx({ felicidade: 2 }) : 'Sem smartphone… esperaste na fila. ' + fx({ felicidade: -2 })],
    ['Pagar 500 Kz a quem guarda lugar', '', () => 'Um miúdo guardava lugares na fila. Pagaste e passaste. ' + fx({ dinheiro: -500, karma: -1 })],
  ] },
  // ---- saúde e família
  { ico: '🦟', t: 'Febre do teu filho', cond: () => v6Fil(0, 12).length > 0, txt: () => { const f = v6Fil(0, 12)[0]; return `${f.nome.split(' ')[0]} acordou a arder em febre e a tremer. Pode ser paludismo.`; }, ch: [
    ['Hospital público (grátis, fila)', '', () => { const f = v6Fil(0, 12)[0]; f.rel = clamp(f.rel + 3); return chance(.75) ? `Depois de 5 horas de espera, teste positivo e tratamento grátis. ${f.nome.split(' ')[0]} recuperou. ` + fx({ karma: 2, felicidade: -2 }) : 'Faltava medicamento no hospital: compraste na farmácia (8.000 Kz). Recuperou. ' + fx({ dinheiro: -8000 }); }],
    ['Clínica privada', '45.000 Kz', () => { const f = v6Fil(0, 12)[0]; f.rel = clamp(f.rel + 5); G.dinheiro -= 45000; return 'Atendidos logo: teste, soro e tratamento. Em dois dias estava a brincar. ' + fx({ felicidade: 2 }); }],
    ['Remédio caseiro e esperar', 'Perigoso', () => { const f = v6Fil(0, 12)[0]; if (chance(.4)) { f.rel = clamp(f.rel - 10); return `${f.nome.split(' ')[0]} piorou muito e teve de ser internado(a) de urgência (−120.000 Kz). Nunca mais esperes com febre! ` + fx({ dinheiro: -120000, felicidade: -12, karma: -4 }); } return 'A febre baixou com chá de caxinde… desta vez. ' + fx({ karma: -2 }); }],
  ] },
  { ico: '🕯️', t: 'Óbito na família', cond: () => G.idade >= 18, txt: () => { const f = v6Fam(); return `Faleceu ${f.replace(/^o tio|^a tia|^o primo|^a prima|^a avó/, m => ({ 'o tio': 'o teu tio', 'a tia': 'a tua tia', 'o primo': 'o teu primo', 'a prima': 'a tua prima', 'a avó': 'a tua avó' }[m]))}. A família vai fazer o óbito durante 3 dias e todos os parentes devem contribuir para o funeral.`; }, ch: [
    ['Contribuir bem e ficar os 3 dias', '150.000 Kz', () => { const v = v6G(); v.famRep = clamp(v.famRep + 10); v.obito = G.ano; G.dinheiro -= 150000; return '🕯️ Pagaste parte da urna e do almoço do óbito, e ficaste os três dias. A família nunca vai esquecer. ' + fx({ karma: 6, felicidade: -6 }); }],
    ['Dar 30.000 Kz e passar uma noite', '', () => { const v = v6G(); v.famRep = clamp(v.famRep + 3); v.obito = G.ano; G.dinheiro -= 30000; return '🕯️ Deste a tua parte e acompanhaste a família uma noite. ' + fx({ karma: 2, felicidade: -4 }); }],
    ['Não ir (estás longe/ocupado)', '', () => { v6G().famRep = clamp(v6G().famRep - 10); return 'A família comentou muito a tua ausência… ' + fx({ karma: -4, felicidade: -2 }); }],
  ] },
  { ico: '📦', t: 'A família da província pede ajuda', cond: () => G.idade >= 22 && G.dinheiro > 100000, txt: () => `Os teus parentes de ${v6Prov()} mandaram recado: a colheita foi má e pedem dinheiro para sacos de arroz, óleo e sabão.`, ch: [
    ['Mandar um carregamento', '80.000 Kz', () => { v6G().famRep = clamp(v6G().famRep + 8); G.dinheiro -= 80000; return '📦 Mandaste as compras no camião que vai para a província. Ligaram a chorar de alegria. ' + fx({ karma: 6, felicidade: 4 }); }],
    ['Mandar 20.000 Kz', '', () => { v6G().famRep = clamp(v6G().famRep + 2); G.dinheiro -= 20000; return 'Mandaste o que podias. ' + fx({ karma: 2 }); }],
    ['Dizer que a vida em Luanda também está difícil', '', () => { v6G().famRep = clamp(v6G().famRep - 5); return '"Quem vai para a cidade esquece-se da aldeia", disseram. ' + fx({ karma: -2 }); }],
  ] },
  { ico: '🧳', t: 'O sobrinho vem estudar para a cidade', cond: () => v6Indep() && G.idade >= 25, txt: () => 'A tua irmã mais velha da província pergunta se o filho dela, de 15 anos, pode morar contigo para estudar no liceu em Luanda.', ch: [
    ['Aceitar', 'Mais uma boca', () => { v6G().famRep = clamp(v6G().famRep + 10); G.dinheiro -= 120000; return '🧳 O sobrinho chegou com uma mala e um saco de bombó. Gastos extra (120.000 Kz), mas a família está-te grata. ' + fx({ karma: 6, felicidade: 1 }); }],
    ['Aceitar, mas ele ajuda em casa', '', () => { v6G().famRep = clamp(v6G().famRep + 5); G.dinheiro -= 60000; return 'Ele lava a loiça, vai buscar água e estuda. Boa troca. ' + fx({ karma: 3 }); }],
    ['Recusar', '', () => { v6G().famRep = clamp(v6G().famRep - 8); return 'A tua irmã ficou muito magoada. ' + fx({ karma: -3, felicidade: -2 }); }],
  ] },
  { ico: '🤝', t: 'O primo quer um emprego', cond: () => G.negocios.length > 0 || (G.emprego && G.emprego.nivel >= 2), txt: () => '"Primo(a), tu agora estás bem… arranja-me qualquer coisa aí no teu serviço. Faço qualquer coisa!"', ch: [
    ['Meter uma cunha', 'Família primeiro', () => chance(.5) ? 'Ele trabalhou bem e agradece-te todos os dias. ' + fx({ karma: 2, felicidade: 2 }) : 'Chegava sempre atrasado e a culpa caiu em ti. ' + fx({ felicidade: -4, fama: -1 })],
    ['Ajudar com o currículo', 'Sem cunhas', () => 'Ajudaste-o a fazer o CV e a preparar a entrevista. Ele conseguiu noutro lado! ' + fx({ karma: 3 })],
    ['Dizer que não há vagas', '', () => { v6G().famRep = clamp(v6G().famRep - 3); return 'Ficou de pé atrás contigo. ' + fx({ karma: -1 }); }],
  ] },
  { ico: '📱', t: 'O filho quer telemóvel novo', cond: () => v6Fil(12, 17).length > 0, txt: () => { const f = v6Fil(12, 17)[0]; return `${f.nome.split(' ')[0]}: "Toda a gente na turma tem o Nova S! O meu já nem abre o Bwé Social…"`; }, ch: [
    ['Comprar o topo de gama', '350.000 Kz', () => { const f = v6Fil(12, 17)[0]; f.rel = clamp(f.rel + 12); G.dinheiro -= 350000; return 'Ficou radiante! Mas as notas desceram um bocado… ' + fx({ felicidade: 3 }); }],
    ['Um mais simples, se melhorar as notas', '90.000 Kz', () => { const f = v6Fil(12, 17)[0]; f.rel = clamp(f.rel + 4); G.dinheiro -= 90000; return 'Combinado! Ficou motivado a estudar. ' + fx({ karma: 2 }); }],
    ['Não', '"Quando eu era jovem…"', () => { const f = v6Fil(12, 17)[0]; f.rel = clamp(f.rel - 8); return 'Bateu com a porta do quarto. ' + fx({ felicidade: -2 }); }],
  ] },
  { ico: '🎓', t: 'Festa de finalistas', cond: () => v6Fil(17, 18).length > 0, txt: () => { const f = v6Fil(17, 18)[0]; return `${f.nome.split(' ')[0]} acabou o ensino médio! A turma vai fazer a festa de finalistas num salão, com fato, vestido e fotógrafo.`; }, ch: [
    ['Pagar tudo como deve ser', '250.000 Kz', () => { const f = v6Fil(17, 18)[0]; f.rel = clamp(f.rel + 12); G.dinheiro -= 250000; return 'Que noite! As fotos estão na parede da sala. ' + fx({ felicidade: 8 }); }],
    ['Só a quota da festa', '60.000 Kz', () => { const f = v6Fil(17, 18)[0]; f.rel = clamp(f.rel + 4); G.dinheiro -= 60000; return 'Foi com uma roupa emprestada, mas foi. ' + fx({ felicidade: 3 }); }],
  ] },
  { ico: '🎒', t: 'Abertura do ano letivo', cond: () => v6Fil(6, 17).length > 0, txt: () => `Começam as aulas: uniformes, cadernos, mochilas, "comparticipação" da escola… para ${v6Fil(6, 17).length} filho(s).`, ch: [
    ['Comprar tudo novo', '', () => { const n = v6Fil(6, 17).length, c = n * 45000; G.dinheiro -= c; v6Fil(6, 17).forEach(f => f.rel = clamp(f.rel + 4)); return `Gastaste ${kzShort(c)}. Os miúdos foram para a escola a brilhar. ` + fx({ felicidade: 3 }); }],
    ['Uniformes em segunda mão no Roque', '', () => { const n = v6Fil(6, 17).length, c = n * 15000; G.dinheiro -= c; return `Gastaste só ${kzShort(c)}. Ninguém nota! ` + fx({ felicidade: 1 }); }],
    ['Pedir ajuda aos padrinhos', '', () => chance(.5) ? 'O padrinho pagou os uniformes! ' + fx({ felicidade: 3 }) : 'O padrinho "estava sem dinheiro". Compraste tu. ' + (G.dinheiro -= v6Fil(6, 17).length * 45000, '')],
  ] },
  { ico: '✈️', t: 'Estudar em Portugal', cond: () => v6Fil(17, 20).length > 0 && G.dinheiro > 3000000, txt: () => { const f = v6Fil(17, 20)[0]; return `${f.nome.split(' ')[0]} entrou numa universidade em Lisboa! Propinas, casa e viagens: cerca de 3 milhões de Kz por ano.`; }, ch: [
    ['Apoiar o sonho', '3.000.000 Kz', () => { const f = v6Fil(17, 20)[0]; f.rel = clamp(f.rel + 15); f.escola = 'privada'; G.dinheiro -= 3000000; return '✈️ No aeroporto, choraram todos. Mas é para o futuro! ' + fx({ felicidade: 6, karma: 3 }); }],
    ['Melhor estudar em Angola', '', () => { const f = v6Fil(17, 20)[0]; f.rel = clamp(f.rel - 5); return 'Vai estudar na UAN. Também há bons cursos cá. ' + fx({ felicidade: -1 }); }],
  ] },
  { ico: '👵', t: 'A avó vem a Luanda ao hospital', cond: () => G.idade >= 20, txt: () => `A avó vem de ${v6Prov()} para fazer exames em Luanda. Precisa de onde ficar e de quem a leve ao hospital.`, ch: [
    ['Recebê-la e pagar a clínica', '90.000 Kz', () => { v6G().famRep = clamp(v6G().famRep + 8); G.dinheiro -= 90000; return 'A avó ficou um mês contigo, contou histórias de antigamente e voltou curada. ' + fx({ karma: 6, felicidade: 4 }); }],
    ['Levá-la ao hospital público', 'Grátis, mas filas', () => { v6G().famRep = clamp(v6G().famRep + 4); return 'Madrugadas na fila do hospital, mas foi atendida. ' + fx({ karma: 4, felicidade: -2 }); }],
    ['Pedir a outro familiar', '', () => { v6G().famRep = clamp(v6G().famRep - 4); return 'Foi para casa de um primo. ' + fx({ karma: -1 }); }],
  ] },
  { ico: '⛪', t: 'Convite para padrinho/madrinha', cond: () => G.idade >= 21, txt: () => 'Um casal amigo quer que sejas padrinho/madrinha de batismo do bebé. É uma honra… e uma responsabilidade (presentes, escola, festas).', ch: [
    ['Aceitar com orgulho', '50.000 Kz', () => { G.dinheiro -= 50000; return '⛪ No batismo seguraste o bebé ao colo. Agora és família. ' + fx({ karma: 4, felicidade: 5 }); }],
    ['Recusar com jeito', '', () => 'Explicaste que ainda não estás preparado(a). ' + fx({ karma: -1 })],
  ] },
  { ico: '👴', t: 'Os pais precisam de cuidados', cond: () => (G.pai.vivo && G.pai.idade > 66) || (G.mae.vivo && G.mae.idade > 66), txt: () => 'Os teus pais já estão mais-velhos e precisam de ajuda: medicamentos da tensão, consultas e alguém por perto.', ch: [
    ['Levá-los para tua casa', '', () => { ['pai', 'mae'].forEach(k => { if (G[k].vivo) G[k].rel = clamp(G[k].rel + 15); }); G.dinheiro -= 150000; return 'A casa ficou mais cheia e mais feliz. ' + fx({ karma: 8, felicidade: 3 }); }],
    ['Pagar uma cuidadora', '300.000 Kz/ano', () => { ['pai', 'mae'].forEach(k => { if (G[k].vivo) G[k].rel = clamp(G[k].rel + 6); }); G.dinheiro -= 300000; return 'Uma senhora do bairro cuida deles todos os dias. ' + fx({ karma: 4 }); }],
    ['Visitar quando puder', '', () => { ['pai', 'mae'].forEach(k => { if (G[k].vivo) G[k].rel = clamp(G[k].rel - 6); }); return 'Sentem a tua falta… ' + fx({ karma: -2, felicidade: -2 }); }],
  ] },
  // ---- trabalho e dinheiro
  { ico: '⏳', t: 'Salários em atraso', cond: () => v6Formal() && !v6G().atraso, txt: () => '"A empresa está com dificuldades de tesouraria." Já são três meses sem salário e a renda não espera.', ch: [
    ['Esperar', 'Talvez paguem no próximo ano', () => { const a = Math.round(salario(G.emprego) * .25); G.dinheiro -= a; v6G().atraso = a; return `Ficaram ${kzShort(a)} em atraso. ` + fx({ felicidade: -6 }); }],
    ['Aderir à greve com os colegas', 'Sindicato', () => { if (chance(.5)) return '✊ A greve resultou: pagaram tudo e ainda prometeram aumento! ' + fx({ felicidade: 6, fama: 1 }); const a = Math.round(salario(G.emprego) * .25); G.dinheiro -= a; v6G().atraso = a; G.emprego.desemp = clamp((G.emprego.desemp || 50) - 10); return `A administração não cedeu e ficou a olhar para os grevistas de lado. Ficaram ${kzShort(a)} em atraso. ` + fx({ felicidade: -4 }); }],
    ['Procurar outro emprego', 'Despedes-te', () => { const t = job(G.emprego.id).t; G.emprego = null; return `Saíste de ${t}. Vai ao Centro de Emprego procurar outra coisa. ` + fx({ felicidade: -3 }); }],
  ] },
  { ico: '📑', t: 'Sem descontos para o INSS', cond: () => v6Formal() && v6G().inss > 0, txt: () => 'Foste ao INSS ver os teus descontos e… a empresa não entregou nada nos últimos 2 anos, apesar de te tirar os 3% do salário!', ch: [
    ['Exigir ao patrão', '', () => chance(.6) ? 'Regularizaram tudo. Os anos contam! ' + fx({ felicidade: 3 }) : (v6G().inss = Math.max(0, v6G().inss - 2), 'Prometeram, mas não fizeram. Perdeste 2 anos de descontos. ' + fx({ felicidade: -5 }))],
    ['Queixa na Inspeção do Trabalho', '', () => { if (G.emprego) G.emprego.desemp = clamp((G.emprego.desemp || 50) - 6); return 'A IGT multou a empresa e os descontos foram repostos. O patrão não gostou… ' + fx({ karma: 3 }); }],
    ['Deixar andar', '', () => { v6G().inss = Math.max(0, v6G().inss - 2); return 'Perdeste 2 anos de descontos para a reforma. ' + fx({ felicidade: -2 }); }],
  ] },
  { ico: '🦈', t: 'O agiota do bairro', cond: () => G.idade >= 18 && G.dinheiro < 50000 && !v6G().agiota, txt: () => 'O Sr. Bento, que "ajuda" as pessoas do bairro, oferece-te 300.000 Kz já, sem papéis. "Devolves 450 no fim do ano."', ch: [
    ['Aceitar', '+300.000 agora, −450.000 depois', () => { G.dinheiro += 300000; v6G().agiota = 450000; return '🦈 Pegaste no dinheiro. No fim do ano ele vem cobrar… ' + fx({ felicidade: 2 }); }],
    ['Recusar', '', () => '🛡️ Juros de 50% são uma armadilha. Boa decisão. ' + fx({ inteligencia: 1 })],
  ] },
  { ico: '🖌️', t: 'Biscate de fim de semana', cond: () => G.idade >= 16, txt: () => 'Um vizinho precisa de alguém para pintar o muro e o portão da casa. Paga 40.000 Kz pelo fim de semana.', ch: [
    ['Aceitar', '+40.000 Kz', () => '🖌️ Pintaste tudo e ficou bonito. ' + fx({ dinheiro: 40000, saude: -2, felicidade: 1 })],
    ['Pedir 60.000', 'Regatear', () => chance(.5) ? 'Aceitou os 60.000! ' + fx({ dinheiro: 60000, saude: -2 }) : 'Arranjou outro pintor mais barato.'],
    ['Recusar', '', () => 'Fim de semana de descanso. ' + fx({ felicidade: 2 })],
  ] },
  { ico: '📈', t: 'Aumento do salário mínimo', cond: () => !!G.emprego && (job(G.emprego.id).informal || job(G.emprego.id).sal < 1500000), txt: () => 'O Governo anunciou um aumento do salário mínimo nacional. As empresas têm 3 meses para atualizar.', ch: [
    ['Boa notícia!', '', () => { if (!G.emprego) return 'Boa notícia para quem trabalha. ' + fx({ felicidade: 1 }); if (!job(G.emprego.id).informal) { G.emprego.bonus = +((G.emprego.bonus || 1) * 1.08).toFixed(3); return 'O teu salário subiu 8%. ' + fx({ felicidade: 5 }); } return 'No trabalho informal ninguém te aumenta… mas os clientes têm mais dinheiro. ' + fx({ felicidade: 2, dinheiro: 20000 }); }],
  ] },
  // ---- cultura e lazer
  { ico: '🏆', t: 'Final da Taça de Angola', cond: () => G.idade >= 8, txt: () => 'Final da Taça: Petro de Luanda contra 1.º de Agosto, o grande clássico! A cidade está dividida entre amarelo e vermelho-e-preto.', ch: [
    ['Ir ao estádio', '5.000 Kz', () => '⚽ Que ambiente! Cânticos, bandeiras e um golo nos descontos. ' + fx({ dinheiro: -5000, felicidade: 8 })],
    ['Ver no quintal com os kambas', '', () => '📺 Grelhados, gasosa e gritaria a cada lance. ' + fx({ felicidade: 6 })],
    ['Não ligo a futebol', '', () => 'Foste dormir cedo. A vizinhança não deixou… ' + fx({ felicidade: -1 })],
  ] },
  { ico: '🎭', t: 'Carnaval no bairro', cond: () => new Date().getMonth() <= 2, txt: () => 'O grupo carnavalesco do bairro anda a ensaiar na rua: batuques, apitos e as mamãs com saias de pano a dançar a kazukuta.', ch: [
    ['Entrar na roda', '', () => '🥁 Dançaste até ficares sem voz. ' + fx({ felicidade: 7, saude: 1 })],
    ['Ajudar a costurar as fantasias', '', () => '🧵 Passaste a tarde com as costureiras do grupo. ' + fx({ karma: 3, felicidade: 3 })],
    ['Ver da varanda', '', () => fx({ felicidade: 2 })],
  ] },
  { ico: '🎶', t: 'Concerto da velha guarda', cond: () => G.idade >= 16, txt: () => 'Os grandes nomes do semba vão dar um concerto na Marginal. Os mais-velhos dizem que é imperdível.', ch: [
    ['Comprar bilhete', '15.000 Kz', () => '🎶 Semba ao vivo, toda a gente a cantar as letras antigas. Arrepiante! ' + fx({ dinheiro: -15000, felicidade: 9, inteligencia: 1 })],
    ['Ouvir na rádio', '', () => '📻 Ouviste em direto na rádio. ' + fx({ felicidade: 3 })],
  ] },
  { ico: '🗳️', t: 'Dia de eleições', cond: () => G.idade >= 18 && G.ano % 5 === 2, txt: () => 'Hoje há eleições gerais. As escolas transformaram-se em assembleias de voto e há filas desde as 5 da manhã.', ch: [
    ['Ir votar', 'Cartão de eleitor', () => v6DocOk('eleitor') ? '🗳️ Votaste e mostraste o dedo pintado com orgulho. ' + fx({ karma: 3, felicidade: 3 }) : '🚫 Sem Cartão de Eleitor não puderam deixar-te votar. Trata no SIAC para a próxima. ' + fx({ felicidade: -3 })],
    ['Ficar em casa', '', () => 'Acompanhaste os resultados pela TV. ' + fx({ karma: -1 })],
  ] },
  { ico: '🏃', t: 'Corrida de São Silvestre', cond: () => G.idade >= 12 && G.stats.saude >= 50, txt: () => 'A tradicional corrida de fim de ano atravessa a cidade. Milhares de atletas e amadores na rua.', ch: [
    ['Correr', '', () => G.stats.saude > 75 && chance(.3) ? '🏅 Ficaste nos 100 primeiros! Saíste no jornal. ' + fx({ saude: 4, fama: 2, felicidade: 6 }) : '🏃 Chegaste ao fim! Medalha de participação ao peito. ' + fx({ saude: 3, felicidade: 5 })],
    ['Aplaudir no passeio', '', () => fx({ felicidade: 2 })],
  ] },
  { ico: '🌊', t: 'Excursão a Kalandula', cond: () => G.idade >= 10, txt: () => 'A igreja/escola organiza uma excursão de autocarro às Quedas de Kalandula, em Malanje.', ch: [
    ['Ir', '25.000 Kz', () => '🌊 As quedas de água são enormes! Fotos de cartão-postal. ' + fx({ dinheiro: -25000, felicidade: 8, inteligencia: 1 })],
    ['Fica para a próxima', '', () => fx({ felicidade: -1 })],
  ] },
  { ico: '🔥', t: 'Festa de kuduro no bairro', cond: () => G.idade >= 14 && G.idade <= 40, txt: () => 'Um DJ do bairro montou colunas gigantes no largo. Há batalha de kuduro e toda a gente está a filmar.', ch: [
    ['Entrar na batalha', '', () => chance(.4 + G.stats.saude / 300) ? '🔥 Mortal, cabeça no chão e a pista foi abaixo! O vídeo tem milhares de visualizações. ' + fx({ fama: 3, felicidade: 7 }) : '😅 Escorregaste no meio do passo. Ficou viral… pelos piores motivos. ' + fx({ felicidade: -2, fama: 1 })],
    ['Dançar na roda', '', () => fx({ felicidade: 5, saude: 1 })],
    ['Ir embora cedo', '', () => fx({ saude: 1 })],
  ] },
);

/* =========================================================
   ESTRADA (viagens de carro/moto) — mais situações reais
   ========================================================= */
if (typeof TR_EV !== 'undefined') {
  TR_EV.road.push(
    { id: 'cinto', t: '👮 "Boa tarde. O senhor vinha sem cinto de segurança."', c: [
      ['Aceitar a multa (15.000 Kz, paga no SIAC)', () => { v6Multa(15000, 'Sem cinto de segurança'); return ['Multa registada. Paga antes que duplique.', { felicidade: -2 }]; }],
      ['"Gasosa" de 3.000 Kz', () => { v6G().gasosas++; return ['O agente guardou a nota e mandou seguir.', { dinheiro: -3000, karma: -2 }]; }],
      ['Mostrar que o cinto estava posto', () => chance(.5) ? ['Ele pediu desculpa: viu mal.', { felicidade: 2 }] : ['"Agora está, antes não estava." Multa.', (v6Multa(15000, 'Sem cinto de segurança'), { felicidade: -3 })]],
    ] },
    { id: 'livrete', t: '📋 Controlo: "Livrete, seguro e carta, por favor."', c: [
      ['Mostrar tudo', () => G.carta && vhSeguro() ? ['Tudo em dia. Boa viagem!', { karma: 1 }] : (v6Multa(G.carta ? 25000 : 60000, G.carta ? 'Viatura sem seguro' : 'Conduzir sem carta'), [G.carta ? 'Faltava o seguro do ano: multa de 25.000 Kz.' : 'Sem carta! Multa de 60.000 Kz.', { felicidade: -5 }])],
      ['Oferecer "um refresco"', () => { v6G().gasosas++; return chance(.8) ? ['Mandou seguir com um sorriso.', { dinheiro: -5000, karma: -3 }] : ['Era um agente sério! Multa e sermão.', (v6Multa(50000, 'Tentativa de suborno'), { karma: -5, felicidade: -6 })]; }],
    ] },
    { id: 'zungueiro', t: '🧺 Engarrafamento parado: zungueiros vendem água, carregadores e bolachas entre os carros.', c: [
      ['Comprar água fresca (200 Kz)', () => ['Salvaste-te do calor.', { dinheiro: -200, saude: 1 }]],
      ['Comprar um carregador (1.500 Kz)', () => ['Funciona! Até à próxima semana…', { dinheiro: -1500 }]],
      ['Fechar o vidro', () => ['Ficaste a ouvir rádio no trânsito.', {}]],
    ] },
  );
}

/* =========================================================
   NOTÍCIAS — separador "Sociedade" ligado aos sistemas
   ========================================================= */
if (typeof p2News === 'function') {
  const _pn = p2News;
  p2News = function () {
    const N = _pn.apply(this, arguments);
    try {
      const v = v6G(), I = v6CarnInfo(), T = v6Taxa(), inf = Math.round((v.ipc - 1) * 100), tab = (ico, t, b) => ({ ico, t, b });
      const last = v6Jogo(Math.floor(Date.now() / V6_SLOT) - 1);
      N.splice(1, 0, ['Sociedade', [
        tab('⚡', v.cortes ? `ENDE: cortes de energia em ${G.cidade.mun} irritam moradores` : 'ENDE anuncia cortes programados para manutenção', 'A empresa pede compreensão e aconselha o uso de contadores pré-pagos. Nos bairros periféricos, os moradores queixam-se de faturas por estimativa e de dias inteiros sem luz.'),
        tab('🦟', v6Chuvas() ? 'Época das chuvas: casos de paludismo disparam nos hospitais' : 'Ministério da Saúde lança campanha de mosquiteiros', 'Os médicos lembram: perante febre, faça o teste. O tratamento é gratuito nos hospitais públicos, e dormir com mosquiteiro reduz muito o risco.'),
        tab('🪪', 'SIAC alarga horário e lança agendamento online', 'Com o SIAC Digital é possível marcar o atendimento para o BI, o registo criminal e o passaporte e evitar as filas da madrugada.'),
        tab('💵', `Dólar a ${T.rua} Kz nas kinguilas, ${T.of} Kz no banco`, `A diferença entre o câmbio oficial e o da rua continua. ${T.divisas ? 'Hoje os bancos tinham divisas.' : 'Hoje vários bancos não tinham divisas para vender.'}`),
        tab('🛒', inf > 0 ? `Inflação: a cesta básica subiu ${inf}% desde que começaste a vida` : 'Preços da cesta básica estáveis no Roque', 'O arroz, o óleo e o frango são os produtos que mais pesam no bolso das famílias angolanas.'),
        tab('⚽', `Girabola: ${last.h} ${last.gh}–${last.ga} ${last.a}`, `${last.ev.filter(e => e.k === 'gol').map(e => `${e.p} (${e.m}')`).join(', ') || 'Jogo sem golos'}. O próximo jogo da jornada é no Estádio 11 de Novembro.`),
        tab('🎭', I.desfile ? 'É Carnaval! Os grupos desfilam na Marginal' : `Faltam ${I.dias} dias para o Carnaval de Luanda`, 'Os grupos carnavalescos ensaiam nos bairros. O desfile na Marginal decide o campeão do ano.'),
      ]]);
    } catch (e) { console.error(e); }
    return N;
  };
}

/* =========================================================
   DATAS NACIONAIS (biscates e eventos do dia)
   ========================================================= */
if (typeof MX_DATAS !== 'undefined') {
  Object.assign(MX_DATAS, {
    '01-04': { id: 'martires', ico: '🕯️', t: 'Dia dos Mártires da Repressão Colonial', d: 'Feriado: biscates +30%.', all: 1.3 },
    '03-08': { id: 'mulher', ico: '💐', t: 'Dia Internacional da Mulher', d: 'Flores e jantares: estafetas e guias +60%, felicidade extra.', g: { estafeta: 1.6, turismo: 1.6 }, fel: 1 },
    '03-23': { id: 'libert', ico: '🇦🇴', t: 'Dia da Libertação da África Austral', d: 'Feriado nacional: biscates +40%.', all: 1.4 },
    '05-01': { id: 'trab', ico: '✊', t: 'Dia do Trabalhador', d: 'Feriado: missões +50% e felicidade extra.', miss: 1.5, fel: 1 },
    '06-01': { id: 'crianca', ico: '🎈', t: 'Dia da Criança', d: 'Festas nas escolas: zunga de doces e brinquedos a dobrar.', g: { zunga: 2 }, fel: 1 },
    '11-02': { id: 'finados', ico: '🕯️', t: 'Dia dos Finados', d: 'Visitas aos cemitérios: zunga de flores +80%.', g: { zunga: 1.8 } },
  });
  try { const c = v6Carnaval(), k = `${String(c.getMonth() + 1).padStart(2, '0')}-${String(c.getDate()).padStart(2, '0')}`; MX_DATAS[k] = { id: 'carnaval', ico: '🎭', t: 'Carnaval de Luanda', d: 'Desfile dos grupos na Marginal! Zunga e guias +80%, felicidade extra.', g: { zunga: 1.8, turismo: 1.8 }, all: 1.2, fel: 2 }; } catch (e) { }
}

/* =========================================================
   EDIFÍCIOS NO MAPA (fachadas do SIAC e do Hospital)
   ========================================================= */
function v6Build() {
  decor = new T.Group(); worldScene.add(decor);
  // SIAC (prédio azul da Mutamba)
  canopy(-98, -27.3, 9, 2.6, 3.6, '#0d2a4a', '#ffcb00', Math.PI);
  [-1, 1].forEach(s => mesh(bx(.5, 3.2, .5), mat('#c8102e'), -98 + s * 5.4, 1.6, -27, decor));
  mesh(bx(1.2, .9, .3), mat('#1d1d1d'), -92.5, .45, -28.4, decor, false);
  // Hospital Geral (torre na Baixa)
  canopy(102, -51.7, 9, 2.6, 3.6, '#ffffff', '#2e8b57', 0);
  mesh(bx(9, .12, 4), mat('#c8102e'), 102, .07, -47.6, decor, false);
  worldScene.remove(decor); worldScene.add(mergeStatic(decor)); decor = null;
  V6.signS = sign('SIAC · LOJA DO CIDADÃO', 14, '#0d2a4a', '#ffffff', 'BI · PASSAPORTE · REGISTOS · NIF · MULTAS', -98, 5.6, -26.25, Math.PI);
  V6.signH = sign('HOSPITAL GERAL KIANDA', 13, '#ffffff', '#1f6b43', 'URGÊNCIA 24H · CONSULTA · MATERNIDADE', 102, 5.8, -52.8, 0);
  [[3.2, .9], [.9, 3.2]].forEach(([w, h]) => { const c = new T.Mesh(bx(w, h, .2), new T.MeshStandardMaterial({ color: '#e8102e', emissive: '#e8102e', emissiveIntensity: .7 })); c.position.set(102, 13, -52.85); worldScene.add(c); });
  { const c = new T.Mesh(bx(4.4, .7, .2), new T.MeshStandardMaterial({ color: '#ffcb00', emissive: '#ffcb00', emissiveIntensity: .5 })); c.position.set(-98, 9, -26.15); worldScene.add(c); }
}
(function () { const _b = buildWorld; buildWorld = function () { const r = _b.apply(this, arguments); try { v6Build(); } catch (e) { console.error('v6Build', e); } return r; }; })();

/* =========================================================
   INTERIORES · SIAC (filas e guichês) e Hospital público
   ========================================================= */
IV_ROOMS.siac = D => {
  ivRoom(D, { w: 18, d: 12, h: 4.4, ftex: ivFloorTex('tile', '#e9ecef', '#d3d9df'), frep: 3, fr: .35, wall: '#f5f7fa', wains: '#1f4e8a', trim: '#c8102e', bg: '#0d1420', door: '#1f4e8a' });
  IVP = D.back;
  ivSign('SIAC · LOJA DO CIDADÃO', 6, '#0d2a4a', '#ffffff', 'ATENDIMENTO INTEGRADO AO CIDADÃO', 0, 3.75, -5.95);
  ivPlane(2.6, 1, ivCanvasGlow('v6senhas', 256, 100, (x, w, h) => { x.fillStyle = '#050505'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff3b3b'; x.font = '900 36px monospace'; x.textAlign = 'center'; x.fillText('A047 → 3', w / 2, 42); x.fillStyle = '#ffcb00'; x.font = '700 22px monospace'; x.fillText('A046→1  W031→4', w / 2, 82); }, 1.1), -6, 3.3, -5.94);
  ivArt(6.2, 2.9, -5.97, 0, 1.6, 1.1, 'angola', '#0d2a4a'); ivClock(3.6, 3.6, -5.97, 0);
  IVP = D.st;
  const vidro = new T.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: .32, roughness: .05 });
  [-4.5, -1.5, 1.5, 4.5].forEach((x, i) => {
    ivCounter(x, -4.5, 2.6, .9, 1.1, '#ffffff', '#1f4e8a'); ivCol(D, x, -4.5, 2.7, 1);
    ivB(2.6, .9, .03, vidro, x, 1.1, -4.1, null, false); ivB(.05, 2, .9, '#1f4e8a', x + 1.32, 0, -4.5);
    ivPlane(.5, .36, ivCanvasGlow('v6g' + i, 64, 46, (c, w, h) => { c.fillStyle = '#0d2a4a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 30px system-ui'; c.textAlign = 'center'; c.fillText(String(i + 1), w / 2, 34); }, .9), x, 2.45, -4.04);
    ivPC(x - .6, 1.1, -4.75, 0);
    ivNPC(D, x, -5.25, 0, { fem: i % 2 === 0, cfg: { shirt: '#1f4e8a', pants: '#222' } });
    if (i < 3) ivNPC(D, x + .2, -3.55, Math.PI, { fem: i === 1 });
  });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { const x = -4.2 + c * 1.1, z = -1 + r * 1.45; ivChair(x, z, Math.PI, '#c8102e'); if ((r * 7 + c) % 3 === 0) ivNPC(D, x, z, Math.PI, { mode: 'sit', seat: .48, fem: (r + c) % 2 === 0 }); }
  ivCol(D, -.9, .45, 7.8, 4.4);
  // máquina das senhas junto à porta
  ivB(.7, 1.25, .55, '#c8102e', -8.2, 0, 1.4); ivB(.5, .38, .04, ivGlow('#7fd0ff', .9), -8.2, .95, 1.69, null, false); ivB(.3, .05, .1, '#111', -8.2, .7, 1.7); ivCol(D, -8.2, 1.4, .8, .7);
  ivPlant(8, 4.6, 1.2); ivPlant(8, -2.6, 1); ivCooler(7.9, 1.2); ivTV(8.85, 2.2, -.6, -Math.PI / 2, 1.6);
  ivNPC(D, 6.6, 3.2, -2.2, { mode: 'idle', cfg: { shirt: '#ffcb00', pants: '#1d1d1d' } }); // segurança
  ivLights(D, { hi: .85, ki: .7, sky: '#f4f8ff', points: [[0, 4, -2, '#f5f8ff', .55, 12]] });
  ivStation(D, { x: -7.3, z: 1.4, ry: -Math.PI / 2, tab: 'fila', ico: '🎫', label: 'Tirar senha', small: true, hit: [-8.2, 1.4, .8, .7, 1.3] });
  ivStation(D, { x: -1.5, z: -3.1, ry: Math.PI, tab: 'docs', ico: '🪪', label: 'Guichês · Documentos', hit: [-1.5, -4.5, 5.8, 1, 1.6] });
  ivStation(D, { x: 4.5, z: -3.1, ry: Math.PI, tab: 'multas', ico: '🚔', label: 'Guichê 4 · Multas', small: true, hit: [4.5, -4.5, 2.7, 1, 1.6] });
};
IV_ROOMS.hospital = D => {
  ivRoom(D, { w: 20, d: 13, h: 4.6, ftex: ivFloorTex('tile', '#e6eeee', '#cddada'), frep: 3, fr: .35, wall: '#f4f9f8', wains: '#2e8b57', trim: '#1f6b43', bg: '#0b1712', door: '#2e8b57' });
  IVP = D.back;
  [[2.2, .6], [.6, 2.2]].forEach(([w, h]) => ivB(w, h, .06, ivGlow('#e8102e', .8), -5.6, 3.2 - h / 2 + .3, -6.45));
  ivSign('HOSPITAL GERAL KIANDA', 5.8, '#ffffff', '#1f6b43', 'CONSULTA EXTERNA · URGÊNCIA · MATERNIDADE', 1.2, 3.95, -6.45);
  ivPlane(1.3, 1.8, ivCanvas('v6palu', 140, 196, (x, w, h) => { x.fillStyle = '#fffbe6'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8102e'; x.fillRect(0, 0, w, 46); x.fillStyle = '#fff'; x.font = '900 19px system-ui'; x.textAlign = 'center'; x.fillText('PALUDISMO', w / 2, 22); x.fillText('MATA!', w / 2, 41); x.fillStyle = '#222'; x.font = '700 14px system-ui'; ['Dorme com', 'mosquiteiro.', 'Febre?', 'Faz o teste!', 'É GRÁTIS'].forEach((t, i) => x.fillText(t, w / 2, 76 + i * 24)); }), 7.6, 2.2, -6.46);
  IVP = D.st;
  // triagem / consulta externa
  ivCounter(1, -4.9, 5, 1.1, 1.08, '#ffffff', '#2e8b57'); ivCol(D, 1, -4.9, 5.2, 1.3); ivPC(-.2, 1.08, -5.1, 0); ivPC(2.2, 1.08, -5.1, 0);
  ivNPC(D, 0, -5.8, 0, { fem: true, cfg: { shirt: '#ffffff', pants: '#2e8b57' } }); ivNPC(D, 2.2, -5.8, 0, { cfg: { shirt: '#ffffff', pants: '#ffffff' } });
  // bancos compridos cheios de gente
  for (let r = 0; r < 3; r++) { const z = -2 + r * 1.6; ivB(6.4, .45, .55, '#2e8b57', -3, 0, z); ivB(6.4, .5, .08, '#2e8b57', -3, .45, z + .28); ivCol(D, -3, z, 6.6, .7); for (let k = 0; k < 4; k++) if ((r + k) % 2 === 0 || r === 1) ivNPC(D, -5.6 + k * 1.7, z, Math.PI, { mode: 'sit', seat: .45, fem: (r + k) % 3 !== 0 }); }
  ivNPC(D, 1.2, -3.3, Math.PI, { fem: true }); ivNPC(D, 1.9, -2.4, Math.PI * 1.1, {}); // fila na triagem
  // laboratório de paludismo
  ivCounter(-7.6, -5.3, 2.8, .9, 1, '#f4f4f4', '#1f6b43'); ivCol(D, -7.6, -5.3, 3, 1);
  ivC(.08, .12, .35, '#333', -8.2, 1, -5.4); ivB(.25, .05, .3, '#222', -8.2, 1, -5.35); for (let i = 0; i < 5; i++) ivB(.05, .2, .05, pick(['#c8102e', '#ffcb00', '#7cc4f0']), -7.3 + i * .15, 1, -5.4, null, false);
  ivNPC(D, -7.6, -6, 0, { cfg: { shirt: '#ffffff', pants: '#1f6b43' } });
  // enfermaria e maternidade (lado direito)
  [-4.2, -1.4].forEach(z => { ivBed(8.5, z, -Math.PI / 2, '#7cc4f0', false, '#d8dde0'); ivCol(D, 8.5, z, 2.2, 1.2); ivB(.04, 2.2, 1.6, new T.MeshStandardMaterial({ color: '#bfe3f0', roughness: 1, side: T.DoubleSide }), 7.1, .3, z - 1.1); });
  ivBed(8.5, 2.6, -Math.PI / 2, '#ff9ad0', false, '#d8dde0'); ivCol(D, 8.5, 2.6, 2.2, 1.2);
  IVP = D.right; ivSign('MATERNIDADE', 2.6, '#ff9ad0', '#ffffff', '', 9.94, 3.1, 2.6, -Math.PI / 2); IVP = D.st;
  ivNPC(D, 6.8, -2.6, -Math.PI / 2, { mode: 'think', fem: true, cfg: { shirt: '#ffffff', pants: '#ffffff' } });
  ivNPC(D, 6.6, 3.6, -Math.PI / 2, { fem: true, cfg: { shirt: '#f2b8d0', pants: '#ffffff' } });
  // máquina de senhas
  ivB(.7, 1.25, .55, '#2e8b57', -9.3, 0, 1); ivB(.5, .38, .04, ivGlow('#9ff0bf', .9), -9.3, .95, 1.29, null, false); ivCol(D, -9.3, 1, .8, .7);
  ivPlant(4.8, -5.8, 1); ivCooler(4, 5.6); ivTV(-9.85, 2.4, -2.6, Math.PI / 2, 1.4);
  ivLights(D, { hi: .88, ki: .7, sky: '#f4fbff', points: [[0, 4.2, -1, '#f2fbff', .55, 13]] });
  ivStation(D, { x: 1, z: -3.6, ry: Math.PI, tab: 'cons', ico: '🩺', label: 'Triagem · Consulta externa', hit: [1, -4.9, 5, 1.3, 1.6] });
  ivStation(D, { x: -7.6, z: -4, ry: Math.PI, tab: 'mal', ico: '🧪', label: 'Laboratório · Paludismo', small: true, hit: [-7.6, -5.3, 3, 1, 1.5] });
  ivStation(D, { x: 6.9, z: 1.2, ry: -Math.PI / 2, tab: 'mat', ico: '🤰', label: 'Maternidade', small: true, hit: [8.5, 2.6, 2.2, 1.2, 1.6] });
  ivStation(D, { x: -8.4, z: 1, ry: -Math.PI / 2, tab: 'cons', ico: '🎫', label: 'Senhas', small: true, hit: [-9.3, 1, .8, .7, 1.3] });
};
['siac', 'hospital'].forEach(id => { if (!IV_IDS.includes(id)) IV_IDS.push(id); });

/* =========================================================
   ÍCONES (os emojis novos têm de existir no mapa de ícones)
   ========================================================= */
if (typeof EMO_MAP !== 'undefined') Object.assign(EMO_MAP, { '🕴': 'user', '🚰': 'droplet', '🪣': 'droplets', '🪵': 'trees', '🤰': 'baby', '🌽': 'wheat', '🫘': 'sprout', '🧂': 'soup', '🥚': 'utensils', '🟨': 'square', '🥁': 'music', '🍳': 'utensils', '🦈': 'fish', '🦠': 'bug', '🤢': 'frown', '😖': 'frown', '🖌': 'brush' });

/* nos interiores ninguém anda com a bacia da zunga à cabeça */
(function () {
  let dentro = false;
  const _cfg = randomNPCcfg; randomNPCcfg = function () { const c = _cfg.apply(this, arguments); if (dentro && c.extras) { const i = c.extras.indexOf('basin'); if (i >= 0) { c.extras.splice(i, 1); c.hair = pick(['braids', 'afropuff', 'wrap', 'cachos']); } } return c; };
  const _npc = ivNPC; ivNPC = function () { dentro = true; try { return _npc.apply(this, arguments); } finally { dentro = false; } };
})();
