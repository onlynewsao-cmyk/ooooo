# Próxima Encarnação no Northflank — 5 000 a 10 000 jogadores ao mesmo tempo

Este guia põe o jogo online no **Northflank** para **5 000 a 10 000 jogadores ligados ao mesmo tempo**.
Os ficheiros estão todos em `deploy/northflank/`. O script `nf_criar.py` cria tudo automaticamente.

---

## 1. Como fica montado

```
 jogadores (telemóvel / PC)
        │  HTTPS  (domínio teu ou …code.run)
        ▼
 ┌──────────────────────────┐   2–3 instâncias, sem estado
 │  pe-router  (nginx)      │   • serve o jogo (ficheiros .gz já comprimidos, cache no navegador)
 │  porta pública 8080      │   • encaminha cada cidade paralela (?sh=N) para o nó dono dela
 └───────────┬──────────────┘   • limites anti-abuso por jogador e por IP
             │ rede privada do projeto
   ┌─────────┼───────────┬───────────────┐
   ▼         ▼           ▼               ▼
 pe-jogo-1  pe-jogo-2   …            pe-jogo-G       cada serviço = 4 vCPU = 4 nós (processos Python)
 nós 1–4    nós 5–8                  nós …           cada nó = 1 cidade de 250 jogadores (chat, PvP, polícia…)
   └─────────┴─────┬─────┴───────────────┘
                   ▼
            pe-db (PostgreSQL gerido)   contas, gravações, grupos, amigos, anúncios,
                                        eventos entre nós, governador eleito
```

- **Cidades paralelas:** cada "Luanda N" tem no máximo 250 jogadores e vive num só nó. Assim o chat "perto", o PvP, a polícia e os ladrões são instantâneos e ficam na memória.
- **Base de dados partilhada:** o login, o registo e as gravações funcionam em **qualquer** nó. Se um nó cair, os jogadores dele passam sozinhos para uma cidade de um nó vivo, e o progresso não se perde.
- **Entre nós:** de 2 em 2 segundos cada nó publica quantos jogadores tem. Também passam entre nós:
  - os eventos (pedidos de amizade, assaltos, prisões);
  - os avisos globais (eleições, grupos novos, anúncios);
  - a versão dos anúncios.

  Por isso o contador "online" e a lista de cidades mostram o total real.
- **Eleições:** o nó 1 é o dono das eleições do Governador. O router manda sempre `/api/pol` para o nó 1.

---

## 2. Capacidade e custo mensal (preços públicos do Northflank)

| Pico de jogadores | Nós (cidades) | Serviços do jogo | Router | PostgreSQL | **Total computação** |
|---|---|---|---|---|---|
| **5 000** | 24 (cap. 6 000) | 6 × nf-compute-400 (4 vCPU / 8 GB) ≈ $584 | 2 × nf-compute-200 ≈ $97 | nf-compute-200 + 20 GB ≈ $51 | **≈ $732/mês** (30 vCPU) |
| **10 000** | 48 (cap. 12 000) | 12 × nf-compute-400 ≈ $1 168 | 3 × nf-compute-200 ≈ $146 | nf-compute-400 + 20 GB ≈ $100 | **≈ $1 414/mês** (58 vCPU) |

**Tráfego de saída (egress, $0.06/GB).** Foi medido no teste de carga, com as respostas já comprimidas:
- cerca de 1 KB por resposta;
- 1,2 a 1,7 KB/s por jogador, ou seja ~6 MB por jogador por hora;
- 10 000 jogadores ligados ≈ 100 a 140 Mbit/s.

Conta rápida: **custo do tráfego por mês ≈ média de jogadores ligados × $0,26**. Por exemplo, uma média de 3 000 jogadores ligados dá ≈ $780/mês.

Para baixar o tráfego, usa `--poll-mul 1.3`. Os clientes perguntam ~25 % menos vezes, quase sem diferença no jogo.

> **Quota:** por defeito o Northflank limita cada conta (vCPU por instância/projeto). Para 30–58 vCPU, abre um pedido ao suporte do Northflank ("quota increase") antes do lançamento.
> O Northflank cobra ao segundo. Podes começar com `--jogadores 2000` (≈ $350/mês) e subir quando for preciso.

---

## 3. Passo a passo

### 3.1 Pôr o código num repositório Git (GitHub)

Na pasta `proxima-encarnacao/`:

```bash
git init
git add .
git commit -m "Próxima Encarnação — versão Northflank"
git branch -M main
git remote add origin https://github.com/A_TUA_CONTA/proxima-encarnacao.git
git push -u origin main
```

O `.gitignore` já deixa de fora a base de dados local (`data/`) e os ficheiros temporários. **Nunca** ponhas tokens ou senhas no repositório.

### 3.2 Preparar o Northflank

1. Cria a conta em northflank.com e escolhe um plano pago (o sandbox gratuito não chega para isto).
2. Em **Account → Git**, liga o GitHub e dá acesso ao repositório.
3. Em **Team settings → API → Tokens**, cria um token com permissões de projeto.

### 3.3 Criar tudo com um comando

```bash
# ver primeiro o plano e o custo, sem criar nada:
python3 deploy/northflank/nf_criar.py --jogadores 5000 --simular

# criar de verdade:
export NF_TOKEN=o_teu_token
python3 deploy/northflank/nf_criar.py --jogadores 5000 \
    --projeto proxima-encarnacao --regiao europe-west \
    --repo https://github.com/A_TUA_CONTA/proxima-encarnacao --ramo main
```

O script faz isto, por ordem:
1. Cria o projeto.
2. Cria o PostgreSQL, espera que fique pronto e lê o `POSTGRES_URI`.
3. Cria o build a partir do `deploy/northflank/Dockerfile`.
4. Cria os serviços `pe-jogo-1…G` e o `pe-router`, com as variáveis e os health checks.

Se o script não conseguir ler o URI, copia-o de **pe-db → Connection details** e corre outra vez com `--db-url "postgresql://…"`.

Se correres o script outra vez, os serviços que já existem são **atualizados** (não são duplicados).

### 3.4 Criar à mão pelo painel (alternativa)

1. **Addon → PostgreSQL**, nome `pe-db`:
   - plano nf-compute-200, disco 20 GB nvme, backups diários;
   - copia o `POSTGRES_URI` em Connection details.
2. **Build service** `pe-build`:
   - o teu repositório, ramo `main`;
   - Dockerfile `/deploy/northflank/Dockerfile`, contexto `/`.
3. **Deployment service** `pe-jogo-1`:
   - imagem do `pe-build`, plano nf-compute-400, 1 instância;
   - portas **privadas** HTTP 8101, 8102, 8103 e 8104;
   - variáveis: `PE_ROLE=game  GROUP=1  PROCS=4  NODES=24  SHARD_CAP=250  SAVE_S=30  DB_POOL=3  DATABASE_URL=<POSTGRES_URI>`;
   - health check HTTP `/api/ping` na porta 8101.
4. Repete o passo 3 para `pe-jogo-2` … `pe-jogo-6`. Só muda `GROUP=2`, `GROUP=3`, e assim por diante.
5. **Deployment service** `pe-router`:
   - mesma imagem, plano nf-compute-200, 2 instâncias;
   - porta **pública** HTTP 8080;
   - variáveis: `PE_ROLE=router  NODES=24  PROCS=4  GAME_HOST=pe-jogo-{g}`;
   - health check `/healthz` na porta 8080.

> A regra que não pode falhar: **`NODES` tem de ser igual em todos os serviços** e **igual a número de serviços × `PROCS`**.

### 3.5 Domínio

Em **pe-router → Networking → Domains**, liga, por exemplo, `jogar.proximaencarnacao.ao`. O certificado HTTPS é automático.

Opcional: põe o domínio atrás da Cloudflare (DNS com proxy). O jogo (`/3d/`, `/img/`) fica em cache perto de Angola e o egress do Northflank baixa.

### 3.6 Trazer as contas que já existem (SQLite → PostgreSQL)

```bash
DATABASE_URL="postgresql://…" python3 tools/migrar_sqlite_pg.py data/jogo.db
```

Para ligar do teu PC ao PostgreSQL, usa uma destas formas:
- liga o "public access" do addon (com TLS) durante a migração;
- usa o túnel da CLI do Northflank (`northflank forward …`, ver a documentação da CLI).

Podes repetir a migração sem duplicar nada.

### 3.7 Testar

```bash
# teste de fumo (cria 2 contas de teste e testa ~34 funções):
python3 tools/teste_api.py https://jogar.proximaencarnacao.ao

# teste de carga — corre NOUTRA máquina (um VPS), nunca no teu portátil por Wi-Fi:
python3 tools/carga.py https://jogar.proximaencarnacao.ao 1000 60 8
```

### 3.8 Crescer de 5 000 para 10 000

```bash
python3 deploy/northflank/nf_criar.py --jogadores 10000 --projeto proxima-encarnacao --repo https://github.com/A_TUA_CONTA/proxima-encarnacao
```

O script cria os serviços que faltam e atualiza `NODES` em todos. Os nós reiniciam e os jogadores voltam a ligar-se sozinhos em poucos segundos. Faz isto de madrugada.

Para descer, o script avisa que serviços sobram, e apagas esses no painel.

---

## 4. Variáveis de ambiente

| Variável | Onde | Para quê | Valor típico |
|---|---|---|---|
| `PE_ROLE` | todos | `game`, `router` ou `tudo` (tudo num contentor, para testes) | — |
| `NODES` | todos | total de nós do cluster | 24 / 48 |
| `PROCS` | todos | nós por serviço do jogo (= vCPUs do plano) | 4 |
| `GROUP` | jogo | número do serviço (1…G) | 1, 2, 3… |
| `DATABASE_URL` | jogo | PostgreSQL. Sem esta variável usa SQLite local | `postgresql://…` |
| `DB_POOL` | jogo | ligações à BD por nó (nós × pool < max_connections) | 2–3 |
| `SHARD_CAP` | jogo | jogadores por cidade paralela | 250 |
| `SAVE_S` | jogo | o cliente grava no servidor no máx. 1×/N s | 30 |
| `POLL_MUL` | jogo | ritmo dos clientes (1 = normal, 1.3 = menos tráfego) | 1–1.5 |
| `GAME_HOST` | router | nome interno dos serviços do jogo | `pe-jogo-{g}` |
| `RATE_JOGADOR` / `RATE_IP` | router | limites anti-abuso (pedidos/s) | 10 / 3000 |

---

## 5. O que mudou no código para esta versão

- **`pedb.py` (novo):** camada de base de dados.
  - Sem `DATABASE_URL` → SQLite, como antes. Com ela → PostgreSQL com pool de ligações.
  - Traduz o SQL automaticamente.
  - Reentrante: um `db()` dentro de outro usa SAVEPOINT, por isso nunca esgota o pool.
  - O esquema é criado com um advisory lock, porque dezenas de nós arrancam ao mesmo tempo.
- **`server.py`:**
  - **Sincronização do cluster num fio próprio**, com a base de dados fora do cadeado do jogo:
    - eventos entre nós lidos **1 vez por nó** de 2 em 2 s, em vez de 1 vez por jogador;
    - grupos recarregados em lote;
    - avisos globais e versão dos anúncios passam entre nós.
  - **Recuperação automática:** um nó sem sinal há 10 s deixa de receber jogadores novos, e os jogadores dele mudam para cidades vivas.
  - **`TCP_NODELAY`:** acabou o atraso de 40 ms em cada resposta (Nagle). A latência mediana caiu de ~43 ms para ~1 ms.
  - **`/api/save` mais leve:** sessão em cache e um só UPDATE (já não lê o save inteiro).
  - Outras melhorias:
    - cache de 5 s nos anúncios;
    - limpeza das caches e das sessões antigas;
    - `SIGTERM` sem erros.
- **Cliente:**
  - `account.js` lê o ritmo de gravação do servidor (`save_s`).
  - `mp.js` respeita o ritmo pedido pelo servidor (`pm`). Quando há erros 429 ou 5xx, espera mais e, se um nó cair, pede outra cidade.
- **Ferramentas:**
  - `tools/teste_api.py`: teste de fumo;
  - `tools/carga.py`: teste de carga com medição de tráfego;
  - `tools/migrar_sqlite_pg.py`: migração das contas do SQLite para o PostgreSQL.

---

## 6. Resultados dos testes nesta máquina (2 vCPU, PostgreSQL local, 4 nós em 2 "serviços" + router nginx)

- Teste de fumo **34/34 OK** no cluster (4 nós atrás do router) e no modo `tudo` (2 nós + nginx num só contentor).
- Testes entre nós OK:
  - contagem online somada;
  - pedido de amizade e evento entregue noutro nó;
  - aviso global e versão dos anúncios propagados;
  - processo morto reiniciado automaticamente;
  - serviço inteiro em baixo → jogador recolocado numa cidade viva.
- Carga de 200 jogadores: **0 erros, p50 1 ms, p99 4 ms**.
- Com 600 jogadores a máquina de 2 vCPU satura (o gerador de carga corre na mesma máquina). O limite por IP de 1000 pedidos/s também atua, porque os bots usam todos o mesmo IP.
- A estimativa de produção mantém-se em **~350–500 jogadores por vCPU de jogo**, e o plano usa 250 por nó (com folga).
- Migração de 1 675 contas reais do SQLite para o PostgreSQL: OK, e pode repetir-se sem duplicar.

---

## 7. Notas importantes

- **Região:** o Northflank não tem região gerida em África. A mais perto de Luanda é **`europe-west` (Londres)**, a ~130–170 ms, o que chega para este jogo (presença a cada 0,3–0,9 s).
  Para menos latência há o BYOC (a tua conta AWS em Cape Town `af-south-1` ou Google Cloud em Joanesburgo `africa-south1`). Dá mais trabalho a configurar.
- Se um nó reiniciar, perde-se o que estava **só em memória** nas cidades dele:
  - chat recente;
  - estrelas de procurado;
  - cadeia.

  As contas, as gravações, os grupos, os amigos, os anúncios e o governador estão no PostgreSQL e não se perdem.
- Ativa os **backups diários** do `pe-db` (o script já os pede, com 7 dias de retenção).
- Antes de abrir ao público:
  1. faz um teste de carga a partir de um VPS;
  2. confirma a quota de vCPU;
  3. liga o domínio;
  4. migra as contas;
  5. guarda o `NF_TOKEN` num sítio seguro.
