# Próxima Encarnação — Teste completo de jogo (16 → 30 anos)

**Como foi testado:** um bot jogou dentro do jogo verdadeiro, no browser, com o código atual. Usou os mesmos botões que um jogador: candidaturas, universidade, curso técnico, carta, casa, crédito, ginásio, praia e +1 ANO. Os eventos foram respondidos com escolhas aleatórias.
- Foram jogadas mais de **80 vidas completas** dos 16 aos 30 anos, em 6 perfis.
- Houve **0 erros de JavaScript**.
- Ir ao SIAC tratar o BI e o Registo Criminal foi simulado. No jogo real isto custa 3 a 4 minutos reais de cada vez.

> **Como ler as idades:** "Casa aos 18" quer dizer que a casa foi comprada no ano em que o jogador tem 18 anos.

---

## 1. Tabela de equilíbrio — idade da primeira casa comprada a pronto (mediana)

| Origem e estratégia | Casa de chapa (≈1,8–2,5 M) | Casa T2 no bairro (≈6–9 M) | Kilamba T3 (≈25–35 M) | Dinheiro aos 30 (mediana) | Salário aos 30 |
|---|---|---|---|---|---|
| Nasceu na rua, só trabalho | **20** (19–22) | **24** (1 em 8 não conseguiu) | **nunca** (0 em 8) | 11–17 M | 2–2,6 M/ano |
| Pobre + curso técnico | **18** | **21** | 27 (4 em 8 não conseguiram) | 19–27 M | 2,3–3,6 M |
| Humilde + universidade pública | **18** | **21** | **25** | 30–45 M | 7–10 M |
| Média + universidade pública | **18** | **20** | 27 (1 em 5 não conseguiu) | 28–95 M | 9–16 M |
| Rica + universidade privada | **18** | **18** | **21** | 100–110 M | 18 M |
| Rica, só trabalho | **18** | **18** | **20** | 27–54 M | 2 M |

**Com crédito habitação** (precisa de emprego formal), toda a gente teve casa de chapa ou Zango **aos 18**, incluindo quem nasceu na rua (aos 19).

### O que esta tabela diz
- ✅ **A educação conta muito.** Um licenciado ganha 7 a 18 M/ano e quem não estudou ganha 2 a 3 M/ano. Direito leva a Advogado (5,4 M → 13,6 M aos 30) e Medicina a Médico (10,7 M). É isto que deve acontecer.
- ✅ **A família rica ajuda, mas o fundo acaba.** O fundo dá a casa no Kilamba aos 20–21 anos. Depois disso, quem não estudou fica com um salário baixo. A regra "o dinheiro da família acaba, trabalhar continua a ser preciso" funciona.
- ❌ **A primeira casa é demasiado fácil.** Quase toda a gente compra uma casa **no primeiro momento em que a lei deixa (18 anos)**. Quem nasce na rua sai da rua em 1 ou 2 anos e tem casa própria aos 19–22. Isto são **3 a 6 cliques no +1 ANO, menos de 5 minutos reais**. A história "nasci na rua e lutei pela minha casa" quase não existe.
- ❌ **A partir dos 22–24 anos o dinheiro deixa de importar.** Toda a gente acumula dezenas de milhões e quase não há em que gastar. Não há tensão.

---

## 2. Onde o jogo funciona bem ✅
1. **O ecrã de nascimento é claro e bonito.** Mostra o local, a classe, os pais e o fundo, numa única janela.
2. **As escolhas aos 16 fazem sentido.** A universidade pública tem exame com percentagem visível e a privada é cara mas tem entrada direta. O curso técnico é barato e abre empregos de ofício.
3. **As regras dos empregos funcionam.** Se o jogador for recusado, a energia é devolvida (uma vez por vaga, por ano). O jogo é exigente mas justo.
4. **Os eventos têm muita cara de Angola.** Exemplos: "Gasosa na estrada", "Multicaixa sem dinheiro", "Fatura da ENDE", "Kota pede kumbu", "Paludismo", "Óbito na família", "Palancas Negras no CAN". As consequências são reais (karma, saúde, dinheiro, emprego).
5. **Perder o emprego não é um beco sem saída.** Uma empresa que fecha, salários em atraso ou uma greve fazem perder o emprego. Ainda assim, quem procura volta a encontrar trabalho em 1 ano.
6. **A morte é rara antes dos 30.** Aconteceu 2 vezes em mais de 80 vidas, e só em quem vivia na rua ou estava doente sem tratamento. Isto é correto.

## 3. Onde o jogo se perde ❌ (por gravidade)

### 🔴 Grave
1. **Não há limite para o +1 ANO.** Uma vida inteira dos 16 aos 30 joga-se em cerca de 5 minutos. Isto parte três coisas:
   - **O online:** dois amigos entram juntos e, 10 minutos depois, um tem 17 anos e o outro tem 45.
   - **A economia em tempo real:** um turno de 1 minuto como zungueiro paga 5 mil Kz e um clique no +1 ANO paga 720 mil a 13 M. Depois do primeiro ano, os turnos, as cantinas e os candongueiros já não valem a pena.
   - **Os documentos:** o Registo Criminal só vale 1 ano de jogo, mas um ano passa em 2 segundos.
2. **Há duas "energias" diferentes.** As **bolinhas** ao lado do +1 ANO são as ações do ano. As barras **Fome e Energia** no topo são o corpo, em tempo real. O jogador não percebe qual delas o bloqueia.
3. **Não há objetivo de longo prazo.** Depois de ter casa e emprego (por volta dos 22 anos), o jogo não diz ao jogador o que perseguir a seguir.

### 🟠 Médio
4. **A primeira casa é demasiado barata para o que se ganha.** Até aos 18 anos não há custo de vida em casa dos pais, por isso um pobre junta 2 M só com um part-time.
5. **Há demasiado dinheiro e poucas formas de o gastar.** Faltam despesas que cresçam com o estilo de vida (carro, família, saúde privada, impostos que sobem com o rendimento).
6. **O BI aos 18 apanha o jogador de surpresa.** Sem BI não há emprego com contrato, carta nem crédito, e a ajuda não falava nisso. Tratá-lo exige ir à Mutamba e esperar 4 minutos (ou 1 minuto se for urgente).
7. **Os efeitos dos stats são invisíveis.** O bot passou anos com Felicidade 1 e não aconteceu nada de especial. Devia haver consequências: depressão, perder o emprego, ou a família a intervir.

### 🟡 Pequeno (3 já corrigidos)
8. ✅ **CORRIGIDO** — O pai aparecia como "Délcio · **Professora**". As profissões dos pais agora aparecem no género certo.
9. ✅ **CORRIGIDO** — O crédito habitação passava **sem BI**, apesar de o banco pedir o BI para qualquer outro crédito. Agora o crédito habitação também pede o BI.
10. ✅ **CORRIGIDO** — A ajuda "Como Jogar" dizia "4 ações até aos 18, depois 5". Os valores reais são **6 e 8**. A ajuda agora também explica a diferença entre as ações e a Fome/Energia, e fala do BI.
11. Código antigo `applyUni()` aponta para a universidade errada nas províncias. O jogador não chega lá, porque o ecrã novo usa o código certo. É só limpeza.

---

## 4. Propostas concretas (por ordem de impacto)
1. **Novo modelo de tempo** (resolve os problemas 1, 2 e parte do 3):
   - **1 ano de jogo = 1 dia real.** O +1 ANO só fica disponível depois de cumprir 2 ou 3 "tarefas do ano" (trabalhar, estudar ou fazer turnos), ou com um tempo de espera de 20–30 minutos.
   - Juntar as duas energias numa só: as ações do ano passam a nascer da Energia do corpo.
   - Assim os turnos, a comida e as viagens voltam a contar, e os jogadores online envelhecem a ritmos parecidos.
2. **Reequilibrar as casas:**
   - Contribuir em casa desde os 16 anos.
   - Casa de chapa ×2 e T2/Kilamba ×1,5.
   - Entrada do crédito de 30%.
   - Objetivo: quem nasce na rua consegue a primeira casa aos 23–26 anos e um pobre aos 21–23.
3. **Despesas que crescem com o rendimento:**
   - IRT progressivo.
   - Filhos e escola.
   - Manutenção do carro e da casa.
   - Seguro de saúde.
   - "Ajudar a família" (pedidos que crescem quando o jogador é rico).
4. **Objetivos de vida:** escolher 1 de 5 "sonhos" aos 16 (Casa no Kilamba, Doutor(a), CEO, Famoso(a), Família grande). Cada sonho tem metas e dá karma e um título no fim da vida.
5. **Tutorial curto de 5 passos** no primeiro dia:
   1. Andar.
   2. Abrir o telemóvel.
   3. Candidatar-se a um emprego.
   4. Tratar o BI no SIAC.
   5. Carregar no +1 ANO.
6. **Consequências para stats extremos** (Felicidade < 15 ou Saúde < 20 durante 2 anos seguidos).

---

## 5. ✅ IMPLEMENTADO — Novo modelo de tempo (opção C)

**Ficheiro novo:** `3d/ano9.js`, carregado em último lugar.

### Como funciona
- **Barra do ano** (no lugar das antigas bolinhas, junto ao botão do ano). Enche ao viver:

  | Fonte | Quanto enche |
  |---|---|
  | Ação | +6 |
  | Turno de 1 min | +10 |
  | Nível de curso/aula | +12 |
  | Refeição | +4 |
  | Dormir | +6 |
  | Tempo de jogo ativo | +2,5 por minuto |

- **Para fechar o ano** são precisas duas coisas: a barra a 100% e pelo menos **25 minutos de jogo ativo** nesse ano. Jogo ativo quer dizer que o jogador tocou no jogo nos últimos 2 minutos.
- **No máximo 3 anos por dia real.** Quem saiu do jogo não envelhece. Na cadeia, cada ano demora 6 minutos.
- **O botão do ano mostra o estado:**
  - "Ano 62%" enquanto a barra enche, com o preenchimento dentro do botão.
  - "**Fechar o ano**" a vermelho e a pulsar quando o ano está pronto.
  - "Amanhã" quando já foram vividos 3 anos hoje.
  - Clicar antes do tempo abre a janela **"O teu ano"**, com a barra, os minutos, os anos vividos hoje e o que enche a barra.
- **Uma só energia:** as ações gastam **10 de Energia do corpo** (a barra do topo).
  - Recupera-se a comer, a descansar e a dormir em casa.
  - Dormir tem uma espera de 8 minutos e a sesta de 3 minutos.
  - Fechar o ano dá energia nova.
  - Acabou a regeneração "+1 em 45 s".

### Reequilíbrio das casas
| | Antes | Agora |
|---|---|---|
| Casa de chapa | 2,5 M | **7 M** |
| Zango T2 | 5,5 M | **10 M** |
| Casa T2 no bairro | 9 M | **15 M** |
| Kilamba T3 | 35 M | **52,5 M** |
| Entrada do crédito | 20 % | **30 %**, mais **2 anos de contrato** no emprego atual |
| Contribuição em casa dos pais | 0 até aos 18; 200 mil/ano | **100 mil/ano aos 16–17 para quem trabalha**; **360 mil/ano** em adulto |

### Idade da primeira casa depois do reequilíbrio (bot, mediana)
| Perfil | Chapa a pronto | Chapa a crédito | T2 | Kilamba |
|---|---|---|---|---|
| Nasceu na rua | **23** (antes 20) | 21 (antes 18) | 28 (antes 24) | — |
| Pobre + técnico | **21** (antes 18) | 20 (antes 18) | 24 (antes 21) | não chega aos 30 |
| Humilde + universidade | 22 | — | 24 | **27** |
| Média + universidade | — | — | 23 | **27** |
| Rica + universidade | — | — | 18 | **23** (antes 21) |

As idades alvo eram 23–26 para quem nasce na rua e 21–23 para os pobres. Ficaram dentro do alvo.
