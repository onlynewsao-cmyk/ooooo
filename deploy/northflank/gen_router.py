#!/usr/bin/env python3
"""Gera o nginx.conf do router (PE_ROLE=router ou tudo) a partir de variáveis de ambiente.

  NODES       total de nós do jogo (ex.: 24)
  PROCS       nós por serviço do jogo (ex.: 4)
  GAME_HOST   nome interno dos serviços do jogo no Northflank, com {g} = n.º do serviço (padrão: pe-jogo-{g})
  PORT_BASE   porta do 1.º nó em cada serviço (8101)
  PORT        porta pública do router (8080)
  PE_LOCAL=1  todos os nós neste contentor (127.0.0.1:8101..)  -> modo "tudo"
  RATE_JOGADOR  pedidos/s por jogador (token) nas rotas do jogo (padrão 10)
  RATE_IP       pedidos/s por IP (padrão 3000 — muitos jogadores em Angola partilham o mesmo IP da operadora)

Regras: a cidade paralela s pertence ao nó ((s-1) % NODES) + 1; o nó n vive no serviço ceil(n/PROCS), porta PORT_BASE+((n-1) % PROCS).
Login, registo, gravações, perfil e anúncios vão para qualquer nó (base de dados partilhada); eleições para o nó 1.
"""
import os

NODES = max(1, int(os.environ.get('NODES', 4)))
PROCS = max(1, int(os.environ.get('PROCS', 4)))
HOST = os.environ.get('GAME_HOST', 'pe-jogo-{g}')
BASE = int(os.environ.get('PORT_BASE', 8101))
PORT = int(os.environ.get('PORT', 8080))
LOCAL = os.environ.get('PE_LOCAL') == '1'
RJ = int(os.environ.get('RATE_JOGADOR', 10))
RIP = int(os.environ.get('RATE_IP', 3000))   # alto de propósito: em Angola muitos telemóveis saem pelo mesmo IP da operadora (CGNAT)
APP = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MAXS = 99


def addr(n):
    if LOCAL:
        return f'127.0.0.1:{BASE + n - 1}'
    g = (n - 1) // PROCS + 1
    return f'{HOST.format(g=g)}:{BASE + (n - 1) % PROCS}'


ups = '\n'.join(f'  upstream pe_n{n} {{ server {addr(n)}; keepalive 32; }}' for n in range(1, NODES + 1))
allsrv = '\n'.join(f'    server {addr(n)} max_fails=2 fail_timeout=5s;' for n in range(1, NODES + 1))
mp = '\n'.join(f'    "{s}" pe_n{((s - 1) % NODES) + 1};' for s in range(1, MAXS + 1))
PROXY = '''proxy_http_version 1.1; proxy_set_header Connection "";
      proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_connect_timeout 3s; proxy_read_timeout 20s; proxy_send_timeout 20s;'''

print(f"""# Próxima Encarnação — router nginx ({NODES} nós, {PROCS} por serviço) — gerado por deploy/northflank/gen_router.py
worker_processes auto;
worker_rlimit_nofile 65535;
pid /tmp/nginx/nginx.pid;
error_log stderr warn;
events {{ worker_connections 16384; multi_accept on; }}
http {{
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  access_log off;
  server_tokens off;
  client_body_temp_path /tmp/nginx/body; proxy_temp_path /tmp/nginx/proxy;
  fastcgi_temp_path /tmp/nginx/fcgi; uwsgi_temp_path /tmp/nginx/uwsgi; scgi_temp_path /tmp/nginx/scgi;
  sendfile on; tcp_nopush on; tcp_nodelay on;
  keepalive_timeout 65; keepalive_requests 100000;
  client_max_body_size 2m; client_body_buffer_size 64k;
  # compressão: ficheiros do jogo já vêm em .gz (gzip_static); respostas JSON da API comprimidas aqui
  gzip on; gzip_static on; gzip_vary on; gzip_proxied any; gzip_comp_level 4; gzip_min_length 1024;
  gzip_types application/javascript text/css application/json image/svg+xml text/plain;

  # IP real do jogador (o balanceador do Northflank põe-no em X-Forwarded-For)
  real_ip_header X-Forwarded-For; real_ip_recursive on;
  set_real_ip_from 10.0.0.0/8; set_real_ip_from 172.16.0.0/12; set_real_ip_from 192.168.0.0/16; set_real_ip_from 100.64.0.0/10;

  # proteção contra abuso: por jogador (token) e por IP — generoso por IP porque as operadoras móveis partilham IPs (CGNAT)
  limit_req_zone $http_authorization zone=jogador:32m rate={RJ}r/s;
  limit_req_zone $binary_remote_addr zone=ip:32m rate={RIP}r/s;
  limit_req_zone $binary_remote_addr zone=conta:16m rate=60r/m;
  limit_req_status 429;

{ups}
  upstream pe_all {{
{allsrv}
    keepalive 64;
  }}

  map $arg_sh $pe_node {{
    default pe_all;
{mp}
  }}

  server {{
    listen {PORT} reuseport backlog=8192;
    server_name _;
    root {APP};

    location = /healthz {{ return 200 "ok\\n"; default_type text/plain; }}
    location = / {{ return 302 /3d/; }}
    location = /3d {{ return 302 /3d/; }}
    location = /3d/index.html {{ expires 2m; add_header Cache-Control "public"; }}
    location = /3d/ {{ try_files /3d/index.html =404; expires 2m; add_header Cache-Control "public"; }}
    location /3d/ {{ expires 1h; add_header Cache-Control "public"; }}
    location /img/ {{ expires 7d; add_header Cache-Control "public"; }}
    location ~ ^/(index\\.html|proxima-encarnacao\\.html|favicon\\.ico)$ {{ expires 10m; }}

    location ~ ^/api/(login|register)$ {{
      limit_req zone=conta burst=30 nodelay;
      proxy_pass http://pe_all; proxy_next_upstream error timeout http_502 http_503;
      {PROXY}
    }}
    location = /api/pol {{
      limit_req zone=jogador burst=20 nodelay;
      proxy_pass http://pe_n1;
      {PROXY}
    }}
    location ~ ^/api/(mp|chat|ded|crime|prender|fianca|amigos|grupo|social|voz|ads/new)$ {{
      limit_req zone=jogador burst=20 nodelay;
      limit_req zone=ip burst=2000 nodelay;
      proxy_pass http://$pe_node;
      {PROXY}
    }}
    location /api/ {{
      limit_req zone=ip burst=2000 nodelay;
      proxy_pass http://pe_all; proxy_next_upstream error timeout http_502 http_503;
      {PROXY}
    }}
    location / {{ return 404; }}
  }}
}}""")
