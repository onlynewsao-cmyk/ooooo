#!/usr/bin/env python3
"""Teste de carga da Próxima Encarnação — simula N jogadores como o cliente real.

  python3 tools/carga.py URL N [DURAÇÃO_S=30] [PROCESSOS=4]
  ex.: python3 tools/carga.py http://127.0.0.1:8090 300 30

Cada bot: regista-se, entra numa cidade (segue os 'move' do cluster), anda, manda presença com o ritmo
adaptativo do cliente (~0,45 s), conversa às vezes e grava o progresso (~6 KB) a cada SAVE_S segundos.
Mede pedidos/s, latência p50/p95/p99, erros e bytes recebidos (comprimidos) -> estimativa de tráfego de saída.
Corre o gerador de carga NOUTRA máquina para resultados realistas (aqui ele também gasta CPU).
"""
import gzip, json, http.client, multiprocessing as mp, random, sys, threading, time, urllib.parse

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8080'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 100
DUR = int(sys.argv[3]) if len(sys.argv) > 3 else 30
P = int(sys.argv[4]) if len(sys.argv) > 4 else 4
U = urllib.parse.urlparse(URL)
CFG = {'skin': '#8d5a3b', 'shirt': '#c8102e', 'pants': '#2b3a55', 'hair': 'afro', 'extras': ['watch', 'chain'], 'genero': 'M', 'print': 'wax', 'x': 'y' * 600}
SAVE = {'nome': 'bot', 'dinheiro': 125000, 'hist': ['evento ' * 8] * 80}


def conn():
    C = http.client.HTTPSConnection if U.scheme == 'https' else http.client.HTTPConnection
    return C(U.hostname, U.port or (443 if U.scheme == 'https' else 80), timeout=30)


def call(c, path, body, tok=None, sh=None):
    h = {'Content-Type': 'application/json', 'Accept-Encoding': 'gzip'}
    if tok:
        h['Authorization'] = 'Bearer ' + tok
    c.request('POST', path + (f'?sh={sh}' if sh else ''), json.dumps(body), h)
    r = c.getresponse()
    raw = r.read()
    data = gzip.decompress(raw) if r.getheader('Content-Encoding') == 'gzip' else raw
    try:
        d = json.loads(data or b'{}')
    except Exception:
        d = {}
    return r.status, d, len(raw) + 180   # +~180 B de cabeçalhos HTTP


def worker(k, n, q):
    c = conn()
    toks = []
    pre = __import__('os').environ.get('CARGA_TOKENS')   # tokens já criados na base de dados (prefixo): salta o registo
    if pre:
        toks = [f'{pre}{k}x{i}' for i in range(n)]
    for i in range(0 if pre else n):
        for _ in range(5):
            try:
                st, d, _ = call(c, '/api/register', {'nome': f'Bot{k}x{i}', 'email': f'bot{k}x{i}x{random.random()}@carga.ao', 'senha': 'abcdef', 'adulto': True})
                if st == 200:
                    toks.append(d['token'])
                    break
            except Exception:
                c = conn()
            time.sleep(0.5)
    S = {'n': 0, 'lat': [], 'b': 0, 'e': 0, 'codes': {}, 'saves': 0}
    L = threading.Lock()
    start = time.time() + 2

    def bot(tok, i):
        cc = conn()
        x, z, sh, since, first = random.uniform(-150, 150), random.uniform(-90, 140), 0, 0, True
        nxt_save = start + random.uniform(0, 30)
        while time.time() < start:
            time.sleep(0.01)
        time.sleep(random.uniform(0, 0.5))
        end = start + DUR
        while time.time() < end:
            t0 = time.time()
            wait = 0.45
            try:
                x += random.uniform(-2, 2); z += random.uniform(-2, 2)
                body = {'room': 'rua', 'x': round(x, 2), 'z': round(z, 2), 'yaw': 0, 'mv': 1, 'nick': f'Bot{k}x{i}', 'cv': 1, 'kz': 125000, 'since': since}
                if first:
                    body['cfg'] = CFG
                if sh:
                    body['sh'] = sh
                st, d, nb = call(cc, '/api/mp', body, tok, sh)
                with L:
                    S['n'] += 1; S['lat'].append(time.time() - t0); S['b'] += nb
                    S['codes'][st] = S['codes'].get(st, 0) + 1
                if st == 200 and d.get('move'):
                    sh = d['move']; wait = 0.05
                    continue
                if st == 200:
                    first = False
                    sh = d.get('sh') or sh
                    for m in d.get('chat') or []:
                        since = max(since, m.get('id', 0))
                    wait = 0.3 if d.get('players') else 0.9
                    wait *= float(d.get('pm') or 1)
                else:
                    wait = 2
                if random.random() < 0.01:
                    call(cc, '/api/chat', {'txt': random.choice(['Bom dia kamba', 'Quem vai ao Kianda Mall?', 'Bora trabalhar', 'Alguém no Talatona?']), 'scope': 'todos'}, tok, sh)
                if time.time() > nxt_save:
                    nxt_save = time.time() + 15
                    st2, _, _ = call(cc, '/api/save', {'save': SAVE, 'meta': {'vidas': [1, 2]}}, tok, sh)
                    with L:
                        S['saves'] += 1
                        if st2 != 200:
                            S['e'] += 1
            except Exception as e:
                with L:
                    S['e'] += 1
                    if S['e'] < 3:
                        print('ERRO', repr(e)[:150], flush=True)
                cc = conn(); wait = 1
            time.sleep(max(0, wait - (time.time() - t0)))

    th = [threading.Thread(target=bot, args=(t, i), daemon=True) for i, t in enumerate(toks)]
    [x.start() for x in th]
    [x.join() for x in th]
    q.put(S)


if __name__ == '__main__':
    print(f'Carga: {N} jogadores durante {DUR}s contra {URL} ...', flush=True)
    q = mp.Queue()
    ps = [mp.Process(target=worker, args=(k, N // P + (1 if k < N % P else 0), q)) for k in range(P)]
    [p.start() for p in ps]
    R = [q.get() for _ in ps]
    [p.join() for p in ps]
    n = sum(r['n'] for r in R); lat = sorted(sum((r['lat'] for r in R), [])) or [0]
    b = sum(r['b'] for r in R); e = sum(r['e'] for r in R); sv = sum(r['saves'] for r in R)
    codes = {}
    for r in R:
        for k_, v in r['codes'].items():
            codes[k_] = codes.get(k_, 0) + v
    pj = b / DUR / max(1, N)   # bytes/s por jogador
    print(f'jogadores={N}  pedidos/s={n / DUR:.0f} ({n / DUR / max(1, N):.2f} por jogador)  '
          f'p50={lat[len(lat) // 2] * 1000:.0f}ms  p95={lat[int(len(lat) * .95)] * 1000:.0f}ms  p99={lat[int(len(lat) * .99)] * 1000:.0f}ms  '
          f'erros={e}  códigos={codes}  gravações={sv}')
    print(f'tráfego de saída: {b / max(1, n) / 1024:.2f} KB/resposta · {pj / 1024:.1f} KB/s por jogador · '
          f'{pj * 3600 / 1e6:.0f} MB por jogador-hora · 10 000 jogadores = {pj * 10000 * 8 / 1e6:.0f} Mbit/s')
