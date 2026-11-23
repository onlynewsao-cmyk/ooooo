# Próxima Encarnação — Simulação "todos online"

Data: 22/11/2026 · Ferramenta: `tools/simular_todos.py`

## Como correr

```bash
# 1 servidor (SQLite) — ex.: 300 jogadores durante 90 s
python3 tools/simular_todos.py http://127.0.0.1:8080 300 90

# cluster (vários nós + router nginx + PostgreSQL): regista os robôs direto num nó
SIM_REG_URL=http://127.0.0.1:8201 python3 tools/simular_todos.py http://127.0.0.1:8095 300 90 2 relatorio.json

# teste rápido de todas as APIs (34 verificações)
python3 tools/teste_api.py http://127.0.0.1:8080
```

Cada robô tem uma personalidade (trabalhador, social, ladrão, polícia, estudante, festeiro) e faz tudo o que um jogador faz:
anda pelas ruas, entra em restaurantes, bancos, mercados e outros sítios, dança e faz gestos, conduz, ouve rádio, conversa no chat
(todos / perto / grupo), manda e ouve **mensagens de voz na mesma sala**, rouba, é perseguido e preso pela polícia, paga fiança,
faz amigos, acena, oferece presentes, desafia, pede em namoro, vê perfis, cria e entra em grupos, candidata-se e vota,
manda dedicatórias à rádio, publica anúncios e grava o progresso. A aparência dos robôs usa o mesmo formato que o jogo (homens e mulheres, com peles, roupas e cabelos variados).

## Resultados (máquina de teste com 2 núcleos, que também gera a carga)

| Cenário | Jogadores | Pedidos/s | Erros 5xx | Exceções | Chat entregue | Voz |
|---|---|---|---|---|---|---|
| 1 servidor | 40 | 137 | 0 | 0 | 100 % | 16 enviadas, 16/16 ouvidas |
| 1 servidor | 250 | 895 | 0 | 0 | 100 % | 418 enviadas, 1012 audições ok |
| 1 servidor (antes das correções) | 500 | 1269 | 0 | **1736 ligações caídas** | 95,6 % | — |
| 1 servidor (depois das correções) | 500 | **1592** | 0 | **0** | 99,9 % | 717 enviadas, 1683 audições ok |
| Cluster de 4 nós + router + PostgreSQL | 300 | 1039 | 0 | 0 | 98 % | 439 enviadas, 1043 audições ok |

Regras do mundo verificadas: cidades paralelas nunca passam do limite (100 por cidade nos testes, 250 em produção) e os jogadores
espalham-se automaticamente (500 → 5 cidades de 100). Cada jogador vê até 24 pessoas na rua (média 23) e quem está na mesma sala.
A voz só chega a quem está na mesma sala (em média 4,7 ouvintes). Também funcionaram: polícia contra ladrões (218 detenções numa só simulação),
eleições, grupos, amizades e filtro de linguagem.

Browsers reais no meio de 95 robôs:
- **PC:** 15 avatares à volta no Mercado do Roque, com balões de conversa e danças. No restaurante, robôs sentados, siglas de grupo,
  indicador "a falar" e mensagens de voz no chat.
- **Telemóvel:** 20 a 23 avatares visíveis.
- Zero erros de JavaScript.

## Problemas encontrados e corrigidos

1. **Ligações à base de dados nunca fechadas (grave).** No modo de 1 servidor (SQLite), cada pedido deixava o ficheiro da base de dados aberto:
   1014 ficheiros abertos mesmo com o servidor parado. Com muitos jogadores esgotava o limite do processo (1024) e o servidor começava a
   recusar jogadores ("unable to open database file" e ligações caídas). A ligação agora fecha no fim de cada operação (`pedb.py`).
   Depois do teste com 500 jogadores: 7 ficheiros abertos.
2. **Limite de ligações do processo.** O servidor sobe sozinho o limite de ficheiros abertos de 1024 para 65 536, porque cada jogador ligado gasta um.
3. **Servidor 25 % mais rápido e com menos memória.** O "cartão" de cada jogador (posição, gesto, música, estrelas, grupo…) passa a ser
   preparado uma vez quando ele se mexe, e não 24 vezes por cada pedido de quem o vê. Também deixam de ir campos vazios e a compressão ficou mais rápida.
   Com 500 jogadores: 1269 → 1592 pedidos/s e 182 → 126 MB de memória.
4. **Convites de outros jogadores tapavam o ecrã.** Desafios, pedidos de namoro, propostas de emprego e convites para grupos abriam uma
   janela por cima de tudo, até por cima de outra janela aberta. Com muita gente online isto era constante. Agora:
   - os convites entram numa fila;
   - se estiveres ocupado(a), aparece só uma notificação e tocas para responder;
   - quando estás livre, abre um de cada vez, com "+N convites à espera";
   - ao fim de 2 minutos sem resposta, o convite é recusado automaticamente.
5. **Router (Northflank):** o limite por IP passou de 1000 para 3000 pedidos/s. Em Angola muitos telemóveis saem pelo mesmo IP
   da operadora, e com o limite antigo um grupo grande atrás do mesmo IP podia ser travado.

## Recusas normais do jogo (não são erros)

As recusas mais comuns na simulação são as regras do jogo a funcionar: "Essa pessoa já está presa", "Tens de estar ao lado do suspeito",
"Estás preso(a)! Faltam X s", "Este grupo já está cheio", "Presos não votam", "Não repitas a mesma mensagem (spam)".

## Imagens

- `docs/simulacao-restaurante.jpg`: restaurante Sabor da Banda cheio de robôs, com siglas de grupo, um robô a falar por voz e o balão "Mensagem de voz".
- `docs/simulacao-telemovel.jpg`: no telemóvel, a rua com 20 a 23 pessoas, a notificação de convite com um painel aberto, a fila "+2 convites à espera" e o restaurante.
