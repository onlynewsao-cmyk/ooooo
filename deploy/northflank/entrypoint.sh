#!/bin/sh
# Escolhe o papel do contentor (ver Dockerfile). Tudo configurado por variáveis de ambiente.
set -e
cd /app
case "${PE_ROLE:-game}" in
  game)
    exec python3 /app/deploy/northflank/launcher.py
    ;;
  router)
    python3 /app/deploy/northflank/gen_router.py > /tmp/nginx/nginx.conf
    # os serviços dos nós podem ainda não existir no DNS interno: tenta até o nginx aceitar a configuração
    i=0
    until nginx -e stderr -t -c /tmp/nginx/nginx.conf >/tmp/nginx/test.log 2>&1; do
      i=$((i+1)); echo "[router] à espera dos nós do jogo ($i): $(tail -1 /tmp/nginx/test.log)"; sleep 5
      [ $i -ge 120 ] && cat /tmp/nginx/test.log && exit 1
    done
    echo "[router] configuração ok: $(grep -c '^  upstream pe_n' /tmp/nginx/nginx.conf) nós"
    exec nginx -e stderr -c /tmp/nginx/nginx.conf -g 'daemon off;'
    ;;
  tudo)
    export PE_LOCAL=1 NODE_FIRST=1 PROCS="${NODES:-2}"
    python3 /app/deploy/northflank/gen_router.py > /tmp/nginx/nginx.conf
    exec python3 /app/deploy/northflank/launcher.py --com-nginx
    ;;
  *)
    echo "PE_ROLE desconhecido: $PE_ROLE (usa game, router ou tudo)"; exit 1
    ;;
esac
