#!/usr/bin/env bash
# Arranca 2 nós da Próxima Encarnação (gerado por tools/gen_cluster.py). Pára com: pkill -f 'NODES=2'
cd "$(dirname "$0")/.."
mkdir -p logs
for i in $(seq 1 2); do
  PORT=$(( 8101 + i - 1 )) NODE=$i NODES=2 SHARD_CAP=250 nohup python3 server.py > logs/no$i.log 2>&1 &
  echo "nó $i -> porta $(( 8101 + i - 1 ))"
done
echo "Agora: sudo nginx -c $(pwd)/deploy/nginx.conf   (ou copia para /etc/nginx/nginx.conf)"
