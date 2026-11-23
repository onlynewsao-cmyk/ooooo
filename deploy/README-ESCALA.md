# Próxima Encarnação — como pôr o jogo a aguentar milhares de jogadores

## O que já está feito no código

| Área | O que mudou |
|---|---|
| Tráfego | Respostas JSON compactas e comprimidas (gzip). A aparência de cada jogador só é enviada quando muda (cache `cv`). Cada jogador só recebe os **24 jogadores mais perto (até 140 m)**. **Resultado: ~5,5 KB por resposta (antes eram 32 KB).** |
| Ritmo | O cliente pergunta ao servidor a cada 0,3 s só quando há alguém a menos de 35 m. Com alguém até 80 m pergunta a cada 0,45 s, mais longe a cada 0,65 s, sozinho a cada 0,9 s e em segundo plano a cada 2 s. |
| Gravações | A gravação local é imediata. Para o servidor grava no máximo 1 vez a cada 15 s, e também quando o separador é fechado ou escondido. |
| Servidor | HTTP/1.1 keep-alive, SQLite em modo WAL, fila de ligações 4096 e sem cadeado global nas contas (o pbkdf2 já não bloqueia os outros pedidos). Os ficheiros estáticos vão em gzip com ETag/304. |
| Cidades paralelas | Cada "Luanda N" leva no máximo `SHARD_CAP` jogadores (250 por defeito). O chat, a polícia, os crimes e a lista de online são separados por cidade, e o jogador pode mudar de cidade no separador Online. |
| Cluster | O jogo corre em **K processos** (`NODE=i NODES=K`) e cada processo é dono das cidades `s` em que `(s-1) % K == i-1`. O nginx encaminha cada pedido pelo `?sh=N`. As eleições ficam no nó 1. Os eventos entre nós (pedidos de amizade, expulsões, eleito) passam pela tabela `evq`. As contagens e a lista de quem está online são partilhadas de 2 em 2 s pela tabela `kv`. |
| Anti-batota | Saltos de dinheiro impossíveis marcam a conta (ficam em `data/batota.log`) e essa conta não se pode candidatar nem votar. O saque dos roubos PvP tem um limite. |
| Proteção | O nginx gerado limita a 12 pedidos/s por IP, a 10 logins/min por IP e a 40 ligações por IP. |

## Medições (sandbox com 2 vCPU; o gerador de carga corre na mesma máquina)

| Jogadores simulados (1 processo) | Pedidos/s | Latência p50 / p95 | KB por resposta | Falhas |
|---|---|---|---|---|
| **Antes:** 150 | 397 | 5 / 21 ms | 32,3 | 194 |
| **Agora:** 150 | 493 | 10 / 24 ms | 5,5 | **0** |
| **Agora:** 400 | 1263 | 312 / 372 ms | 5,5 | **0** |

Um processo trata ~1250 pedidos/s. Com o ritmo adaptativo (~2,2 pedidos/s por jogador) isso dá cerca de **350–500 jogadores por núcleo de CPU**. Gravações: ~870 gravações/s de 10 KB num só processo.

## Quanto é preciso para 10–15 mil jogadores ao mesmo tempo

- **1 servidor dedicado com 32–48 vCPU, 64 GB de RAM e disco NVMe.** Exemplos: Hetzner AX102 / CCX63 ou OVH Advance, cerca de 150–350 €/mês.
  - `NODES` = número de núcleos − 4 (os outros ficam para o nginx e o SQLite).
  - 32 vCPU → 28 nós → ~10 mil jogadores. 48 vCPU → 44 nós → ~15 mil jogadores.
- **Cloudflare** (plano grátis ou Pro, 20 $/mês) à frente: guarda em cache os ficheiros do jogo (~0,7 MB por visita) e protege contra DDoS.
- Com 100–200 mil jogadores por dia, as gravações (1 a cada 15 s por jogador) ficam perto do limite de escrita do SQLite (~1–2 mil por segundo).
  - **Para passar dos ~15 mil em simultâneo, ou para usar várias máquinas, o passo seguinte é trocar o SQLite por PostgreSQL e os dados partilhados (`kv`/`evq`) por Redis.** Isso ainda não está feito.

## Como arrancar em produção (Linux)

```bash
# 1) copiar a pasta do jogo para o servidor (ex.: /srv/proxima-encarnacao)
cd /srv/proxima-encarnacao
python3 tools/gen_cluster.py 28 8101 250     # 28 nós, portas 8101.., 250 jogadores por cidade
./deploy/run_cluster.sh                      # arranca os 28 processos
sudo apt install nginx
sudo cp deploy/nginx.conf /etc/nginx/nginx.conf && sudo nginx -t && sudo systemctl restart nginx
# 2) apontar o domínio para o servidor, através da Cloudflare (proxy laranja ligado, SSL "Full")
```

Para testar o cluster sem nginx: `python3 tools/router.py 8090 2 8101` (só para testes, não aguenta carga).

## Ainda falta (honestamente)

1. **PostgreSQL + Redis** para poder usar várias máquinas (hoje: 1 máquina grande).
2. **WebSocket** em vez de perguntas HTTP. Cortaria mais ~40–60% de CPU, mas precisa de uma biblioteca externa (ex.: `websockets`/`aiohttp`) ou de um servidor em Go/Node.
3. **Economia 100% no servidor.** Hoje o dinheiro vive no navegador e o servidor só deteta saltos impossíveis.
4. Moderação humana, um painel de administração e monitorização (Grafana/Uptime Kuma).
