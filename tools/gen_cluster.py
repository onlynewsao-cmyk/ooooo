#!/usr/bin/env python3
"""Gera a configuração de cluster da Próxima Encarnação.

  python3 tools/gen_cluster.py K [PORTA_BASE=8101] [CAP=250]

Cria:
  deploy/nginx.conf      -> nginx à frente (porta 80), encaminha cada cidade paralela (?sh=N) para o seu nó,
                            /api/pol (eleições) para o nó 1, ficheiros estáticos servidos pelo próprio nginx com gzip.
  deploy/run_cluster.sh  -> arranca K processos server.py (NODE=i NODES=K) nas portas PORTA_BASE..PORTA_BASE+K-1.
Regra: a cidade s pertence ao nó ((s-1) % K) + 1.
"""
import os, sys
K = int(sys.argv[1]) if len(sys.argv) > 1 else 4
BASE = int(sys.argv[2]) if len(sys.argv) > 2 else 8101
CAP = int(sys.argv[3]) if len(sys.argv) > 3 else 250
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'deploy'); os.makedirs(D, exist_ok=True)
MAXS = 99
ups = '\n'.join(f'upstream pe_n{i} {{ server 127.0.0.1:{BASE + i - 1}; keepalive 64; }}' for i in range(1, K + 1))
mp = '\n'.join(f'    "{s}" pe_n{((s - 1) % K) + 1};' for s in range(1, MAXS + 1))
conf = f"""# Próxima Encarnação — nginx à frente de {K} nós (gerado por tools/gen_cluster.py)
worker_processes auto;
events {{ worker_connections 16384; multi_accept on; }}
http {{
  include       /etc/nginx/mime.types;
  sendfile on; tcp_nopush on; keepalive_timeout 30; keepalive_requests 10000;
  gzip on; gzip_comp_level 5; gzip_min_length 1400;
  gzip_types application/javascript text/css application/json image/svg+xml text/plain;
  client_max_body_size 2m;
  # proteção básica contra abuso / DDoS de camada 7
  limit_req_zone $binary_remote_addr zone=api:20m rate=12r/s;
  limit_req_zone $binary_remote_addr zone=conta:10m rate=10r/m;
  limit_conn_zone $binary_remote_addr zone=ip:10m;

{ups}

  map $arg_sh $pe_node {{
    default pe_n1;
{mp}
  }}

  server {{
    listen 80 reuseport;
    server_name _;
    limit_conn ip 40;
    root {ROOT};
    location = / {{ return 302 /3d/; }}
    location /3d/ {{ try_files $uri $uri/index.html =404; expires 1h; add_header Cache-Control "public"; }}
    location /img/ {{ expires 7d; add_header Cache-Control "public"; }}
    location ~ ^/api/(login|register)$ {{
      limit_req zone=conta burst=5 nodelay;
      proxy_pass http://pe_n1; proxy_http_version 1.1; proxy_set_header Connection "";
    }}
    location = /api/pol {{
      limit_req zone=api burst=20 nodelay;
      proxy_pass http://pe_n1; proxy_http_version 1.1; proxy_set_header Connection "";
    }}
    location /api/ {{
      limit_req zone=api burst=30 nodelay;
      proxy_pass http://$pe_node; proxy_http_version 1.1; proxy_set_header Connection "";
      proxy_set_header X-Real-IP $remote_addr;
      proxy_read_timeout 15s;
    }}
  }}
}}
"""
open(os.path.join(D, 'nginx.conf'), 'w').write(conf)
run = f"""#!/usr/bin/env bash
# Arranca {K} nós da Próxima Encarnação (gerado por tools/gen_cluster.py). Pára com: pkill -f 'NODES={K}'
cd "$(dirname "$0")/.."
mkdir -p logs
for i in $(seq 1 {K}); do
  PORT=$(( {BASE} + i - 1 )) NODE=$i NODES={K} SHARD_CAP={CAP} nohup python3 server.py > logs/no$i.log 2>&1 &
  echo "nó $i -> porta $(( {BASE} + i - 1 ))"
done
echo "Agora: sudo nginx -c $(pwd)/deploy/nginx.conf   (ou copia para /etc/nginx/nginx.conf)"
"""
fp = os.path.join(D, 'run_cluster.sh'); open(fp, 'w').write(run); os.chmod(fp, 0o755)
print(f'ok: {K} nós, portas {BASE}..{BASE + K - 1}, cap {CAP}/cidade -> deploy/nginx.conf, deploy/run_cluster.sh')
