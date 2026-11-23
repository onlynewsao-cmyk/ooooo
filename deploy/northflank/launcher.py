#!/usr/bin/env python3
"""Arranca e vigia os nós do jogo dentro de um contentor.

Variáveis:
  NODES       total de nós em TODO o cluster (ex.: 24)
  PROCS       nós (processos Python) neste contentor (ex.: 4 — um por vCPU)
  GROUP       número deste serviço (1, 2, 3...) -> nós (GROUP-1)*PROCS+1 .. GROUP*PROCS
  NODE_FIRST  (alternativa a GROUP) primeiro nó deste contentor
  PORT_BASE   porta do 1.º processo (8101); os outros usam 8102, 8103...
  --com-nginx também arranca e vigia o nginx (modo PE_ROLE=tudo)
Se um processo morrer, é reiniciado ao fim de 2 s. SIGTERM pára tudo com calma.
"""
import os, signal, subprocess, sys, time

PROCS = max(1, int(os.environ.get('PROCS', 4)))
NODES = max(1, int(os.environ.get('NODES', PROCS)))
GROUP = int(os.environ.get('GROUP', 1))
FIRST = int(os.environ.get('NODE_FIRST') or (GROUP - 1) * PROCS + 1)
BASE = int(os.environ.get('PORT_BASE', 8101))
NGINX = '--com-nginx' in sys.argv
APP = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if FIRST + PROCS - 1 > NODES:
    print(f'[launcher] AVISO: este contentor teria os nós {FIRST}..{FIRST + PROCS - 1} mas NODES={NODES}. '
          f'Confirma GROUP/PROCS/NODES.', flush=True)
    PROCS = max(1, NODES - FIRST + 1)

procs = {}
parar = [False]


def start(i):
    if i == 'nginx':
        return subprocess.Popen(['nginx', '-e', 'stderr', '-c', '/tmp/nginx/nginx.conf', '-g', 'daemon off;'])
    env = dict(os.environ, NODE=str(FIRST + i), NODES=str(NODES), PORT=str(BASE + i))
    return subprocess.Popen([sys.executable, os.path.join(APP, 'server.py')], env=env, cwd=APP)


def term(*_):
    parar[0] = True
    for p in procs.values():
        try:
            p.send_signal(signal.SIGTERM)
        except Exception:
            pass


signal.signal(signal.SIGTERM, term)
signal.signal(signal.SIGINT, term)
print(f'[launcher] nós {FIRST}..{FIRST + PROCS - 1} de {NODES} · portas {BASE}..{BASE + PROCS - 1}' + (f" · nginx :{os.environ.get('PORT', '8080')}" if NGINX else ''), flush=True)
for i in range(PROCS):
    procs[i] = start(i)
    time.sleep(0.3)   # o 1.º cria o esquema da base de dados; os outros esperam um pouco
if NGINX:
    time.sleep(1)
    procs['nginx'] = start('nginx')

mortes = {}
while not parar[0]:
    time.sleep(1)
    for k, p in list(procs.items()):
        if p.poll() is not None and not parar[0]:
            n = mortes[k] = mortes.get(k, 0) + 1
            print(f'[launcher] {"nginx" if k == "nginx" else "nó " + str(FIRST + k)} terminou (código {p.returncode}); reinício n.º {n} em 2 s', flush=True)
            time.sleep(2)
            procs[k] = start(k)

fim = time.time() + 20
for p in procs.values():
    try:
        p.wait(timeout=max(0.1, fim - time.time()))
    except subprocess.TimeoutExpired:
        p.kill()
print('[launcher] parado.', flush=True)
