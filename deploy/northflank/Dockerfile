# Próxima Encarnação — imagem única para o Northflank
#   PE_ROLE=game    -> nós do jogo (PROCS processos Python por contentor, portas 8101..)
#   PE_ROLE=router  -> nginx público: ficheiros do jogo + encaminha cada cidade (?sh=N) para o seu nó
#   PE_ROLE=tudo    -> tudo num só contentor (nginx + NODES nós), para testes ou arranque pequeno
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PE_ROLE=game PROCS=4 PORT_BASE=8101

RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx-light tini curl \
 && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app
# ficheiros do jogo pré-comprimidos: o nginx serve .gz diretamente (gzip_static), sem gastar CPU por pedido
RUN find /app/3d /app/img /app/index.html /app/proxima-encarnacao.html -type f \
      \( -name '*.js' -o -name '*.css' -o -name '*.html' -o -name '*.svg' -o -name '*.json' \) \
      -exec gzip -k -9 -f {} \; \
 && chmod +x /app/deploy/northflank/entrypoint.sh \
 && mkdir -p /app/data /tmp/nginx \
 && useradd -r -u 10001 jogo && chown -R jogo /app/data /tmp/nginx

# corre como root: os volumes montados em /app/data (Northflank) pertencem a root e o SQLite precisa de escrever lá
EXPOSE 8080 8101 8102 8103 8104
ENTRYPOINT ["/usr/bin/tini", "--", "/app/deploy/northflank/entrypoint.sh"]
