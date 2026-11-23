#!/usr/bin/env python3
"""Simulação "todos online" da Próxima Encarnação: N jogadores-robô a viver a vida ao mesmo tempo.

  python3 tools/simular_todos.py URL N [DURAÇÃO_S=60] [PROCESSOS=2] [relatorio.json]
  ex.: python3 tools/simular_todos.py http://127.0.0.1:8090 300 90

Cada robô tem uma personalidade (trabalhador, social, ladrão, polícia, estudante, festeiro) e faz o que um
jogador real faz: anda pelas ruas de Luanda, entra em sítios (restaurante, banco, igreja…), dança e faz gestos,
conduz, ouve rádio, conversa no chat (todos / perto / grupo), manda e ouve MENSAGENS DE VOZ na mesma sala,
rouba, é perseguido e preso pela polícia, paga fiança, faz amigos, acena, oferece presentes, vê perfis,
cria e entra em grupos, candidata-se e vota nas eleições, manda dedicatórias à rádio, publica anúncios e grava
o progresso. No fim verifica as regras do mundo multijogador e mede o desempenho de cada parte.
"""
import gzip, json, http.client, multiprocessing as mp, os, random, re, sys, threading, time, urllib.parse
from collections import Counter, defaultdict

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8080'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 100
DUR = int(sys.argv[3]) if len(sys.argv) > 3 else 60
P = int(sys.argv[4]) if len(sys.argv) > 4 else 2
OUT = sys.argv[5] if len(sys.argv) > 5 else None
U = urllib.parse.urlparse(URL)
UR = urllib.parse.urlparse(os.environ.get('SIM_REG_URL') or URL)   # registo direto num nó (o router limita contas novas por IP)

# sítios do mapa (x, z) — iguais ao cliente (LOC_POS)
LUG = {'empresa': (-30, -46.8), 'banco': (30, -46.8), 'emprego': (-30, -33.2), 'escola': (30, -33.2),
       'mercado': (-30, 16.8), 'restaurante': (-150, 16.8), 'casa': (-30, 66.8), 'salao': (-150, 46.8),
       'praia': (-100, -133), 'estacao': (-90, 166.8), 'stand': (-30, 166.8), 'cantina': (0, 166.8),
       'uan': (66, 166.8), 'aeroporto': (120, 166.8), 'igreja': (90, 16.8)}
SALAS = ['restaurante', 'banco', 'mercado', 'cantina', 'igreja', 'salao', 'escola', 'emprego', 'uan']
EMOTES = ['cheer', 'dance', 'kuduro', 'kizomba', 'semba', 'afro', 'wave', 'clap', 'laugh', 'selfie', 'think', 'pushup']
FRASES = ['Bom dia kamba!', 'Quem vai ao Kianda Mall?', 'Bora trabalhar, malta', 'Alguém no Talatona?', 'Esse kuduro está bué fixe',
          'Vendo carro barato, chama', 'O candongueiro está cheio', 'Quem quer entrar no meu grupo?', 'Vamos à praia hoje',
          'A UAN abriu inscrições', 'Petro ganhou ontem!', 'Preciso de emprego, alguém contrata?', 'Muamba no restaurante é top']
OFENSAS = ['és um idiota', 'vai à merda']
PERS = [('trabalhador', 30), ('social', 25), ('ladrao', 14), ('policia', 11), ('estudante', 10), ('festeiro', 10)]
LOOK_M = {'shirt': '#c8102e', 'pants': '#2b3a55', 'sleeves': 'short', 'shoes': '#f2f2f2', 'sole': '#ccc', 'skin': '#5c3a24', 'fem': False, 'hair': 'short', 'hairColor': '#0d0d0d', 'braidColors': None, 'wrap': None, 'capColor': None, 'bandColor': None, 'build': 1, 'height': 1, 'eyes': '#2b170d', 'print': 'logo', 'lookTop': 'T-shirt', 'extras': ['watch', 'phone'], 'age': 24, 'tats': [], 'musc': 0, 'fat': 0.161, 'hq': 1}
LOOK_F = {'shirt': '#c8102e', 'pants': '#5c3a24', 'sleeves': 'short', 'shoes': '#f2f2f2', 'sole': '#ccc', 'skin': '#5c3a24', 'fem': True, 'hair': 'longo', 'hairColor': '#0d0d0d', 'braidColors': None, 'wrap': None, 'capColor': None, 'bandColor': None, 'build': 1, 'height': 0.97, 'eyes': '#2b170d', 'skirt': ['#2b3a55', '#c8102e', '#f2f2f2', '#1a1a1a'], 'skirtLong': False, 'shorts': False, 'print': 'flores', 'lookTop': 'Blusa', 'heels': True, 'bagColor': '#27344d', 'extras': ['earrings', 'lipstick', 'bolsa', 'pulseiras', 'phone'], 'age': 24, 'tats': [], 'musc': 0, 'fat': 0.16, 'hq': 1}
PELES = ['#3b2416', '#4a2c1a', '#5c3a24', '#6b4329', '#7a4e30', '#8d5a3b', '#a06a45']
CORES = ['#c8102e', '#2b3a55', '#f2f2f2', '#1a1a1a', '#ffcc00', '#1f8a4c', '#0a5bd8', '#ff6a00', '#7b2cbf', '#e83f8b', '#5c3a24', '#00a3a3']
CAB_M = ['short', 'fade', 'waves', 'bald', 'hightop', 'twists', 'locs', 'nago', 'afro']
CAB_F = ['longo', 'cachos', 'rabo', 'afropuff', 'bun', 'braids', 'boxbraids', 'nago', 'bantu', 'afro', 'twists', 'locs', 'short']
EST = ['logo', 'wax', 'liso', 'listras', 'flores', 'xadrez', 'animal']


def look():
    """aparência no mesmo formato do cliente (playerCfg), com cores e cabelos variados"""
    f = random.random() < .48
    c = json.loads(json.dumps(LOOK_F if f else LOOK_M))
    c.update({'skin': random.choice(PELES), 'shirt': random.choice(CORES), 'pants': random.choice(CORES),
              'hair': random.choice(CAB_F if f else CAB_M), 'print': random.choice(EST), 'age': random.randint(17, 60),
              'fat': round(random.uniform(0, .5), 2), 'musc': round(random.uniform(0, .6), 2), 'height': round(random.uniform(.92, 1.08), 2)})
    if f:
        c['skirt'] = [random.choice(CORES) for _ in range(4)]
    return c


def fake_webm(seg):
    """Áudio falso com cabeçalho EBML (WebM) e tamanho realista para `seg` segundos (~12 kbit/s Opus)."""
    n = max(800, int(seg * 1500))
    return b'\x1a\x45\xdf\xa3' + os.urandom(n - 4)


def conn(u=None):
    u = u or U
    C = http.client.HTTPSConnection if u.scheme == 'https' else http.client.HTTPConnection
    return C(u.hostname, u.port or (443 if u.scheme == 'https' else 80), timeout=30)


def pers():
    r, a = random.uniform(0, sum(w for _, w in PERS)), 0
    for p, w in PERS:
        a += w
        if r <= a:
            return p
    return 'trabalhador'


def worker(k, n, q, bar, T0):
    import base64
    S = {'ep': defaultdict(lambda: {'n': 0, 'lat': [], 'codes': Counter(), 'falha': Counter()}),
         'exc': Counter(), 'sent_chat': [], 'seen_chat': defaultdict(set), 'final_sh': {}, 'vz_sent': [], 'vz_seen': defaultdict(set),
         'vz_ouvir': Counter(), 'vis': defaultdict(list), 'shards_max': 0, 'online_max': 0, 'presos': 0, 'crimes_ok': 0,
         'grupos': 0, 'votos': 0, 'amigos': 0, 'emotes': 0, 'perfis': 0, 'inside_vis': [], 'mute': 0, 'acts': Counter(), 'regs': 0}
    L = threading.Lock()

    def call(c, path, body, tok=None, sh=None):
        h = {'Content-Type': 'application/json', 'Accept-Encoding': 'gzip'}
        if tok:
            h['Authorization'] = 'Bearer ' + tok
        ts = time.time()
        c.request('POST', path + (f'?sh={sh}' if sh else ''), json.dumps(body), h)
        r = c.getresponse()
        raw = r.read()
        data = gzip.decompress(raw) if r.getheader('Content-Encoding') == 'gzip' else raw
        try:
            d = json.loads(data or b'{}')
        except Exception:
            d = {}
        key = path + ((':' + body.get('op')) if isinstance(body, dict) and body.get('op') else '')
        with L:
            e = S['ep'][key]
            e['n'] += 1; e['lat'].append(time.time() - ts); e['codes'][r.status] += 1
            if r.status == 200 and d.get('ok') is False:
                e['falha'][re.sub(r'\d+', '#', str(d.get('erro') or '?'))[:70]] += 1
        return r.status, d

    # ---- registo (antes de começar a contar o tempo) ----
    bots = []
    c = conn(UR)
    for i in range(n):
        for _ in range(5):
            try:
                st, d = call(c, '/api/register', {'nome': f'Robo{k}x{i}', 'email': f'robo{k}x{i}x{random.random()}@sim.ao', 'senha': 'abcdef', 'adulto': True})
                if st == 200:
                    bots.append({'tok': d['token'], 'id': d['user']['id'], 'nick': random.choice(['Kiala', 'Nzinga', 'Mbuta', 'Lukeny', 'Djamila', 'Kianda', 'Tchissola', 'Mukenga', 'Ndombe', 'Wezo']) + f'{k}{i}', 'p': pers(), 'cfg': look()})
                    break
            except Exception:
                c = conn(UR)
            time.sleep(0.3)
    S['regs'] = len(bots)
    bar.wait()            # todos os processos acabaram o registo: arrancam juntos
    t0 = time.time() + 1.5

    GR = {'gids': []}   # grupos criados por robôs deste processo

    def bot(B):
        cc = conn()
        tok, me, p = B['tok'], B['id'], B['p']
        alvo = random.choice(list(LUG))
        x, z = LUG[alvo][0] + random.uniform(-60, 60), LUG[alvo][1] + random.uniform(-40, 40)
        room, sala_ate = 'rua', 0
        sh, since, first, wl, preso, dsince = 0, 0, True, 0, 0, 0
        em_ate, em = 0, None
        nxt = Counter()   # próximo instante permitido para cada ação
        now0 = time.time()
        for a in ('chat', 'voz', 'crime', 'social', 'amigo', 'grupo', 'pol', 'ded', 'ad', 'save', 'perfil'):
            nxt[a] = now0 + random.uniform(2, 25)
        seen = {}          # id -> (x, z, wl, room)
        end = t0 + DUR
        time.sleep(random.uniform(0, 1))
        while time.time() < end:
            ts = time.time(); wait = 0.45
            try:
                # --- andar / entrar e sair de sítios ---
                if room == 'rua':
                    tx, tz = LUG[alvo]
                    dx, dz = tx - x, tz - z; dist = (dx * dx + dz * dz) ** .5
                    if dist < 3:
                        if alvo in SALAS and random.random() < (0.75 if p in ('social', 'festeiro', 'estudante') else 0.5):
                            room = 'iv:' + alvo; sala_ate = ts + random.uniform(15, 40); x, z = random.uniform(-4, 4), random.uniform(-4, 4)
                        alvo = random.choice(list(LUG))
                    else:
                        v = random.uniform(2.5, 6) * (2.5 if random.random() < .15 else 1)   # às vezes de carro/moto
                        x += dx / dist * min(dist, v * .45); z += dz / dist * min(dist, v * .45)
                else:
                    x += random.uniform(-.6, .6); z += random.uniform(-.6, .6)
                    if ts > sala_ate:
                        room = 'rua'; x, z = LUG.get(alvo, (0, 0))[0] + 2, LUG.get(alvo, (0, 0))[1] + 2
                if ts > em_ate and random.random() < (0.05 if p == 'festeiro' else 0.012):
                    em = random.choice(EMOTES); em_ate = ts + 4
                    with L: S['emotes'] += 1
                body = {'room': room, 'x': round(x, 2), 'z': round(z, 2), 'yaw': round(random.uniform(-3, 3), 2), 'mv': 1 if room == 'rua' else 0,
                        'nick': B['nick'], 'cv': 1, 'kz': 250000, 'since': since, 'dsince': dsince, 'em': em if ts < em_ate else None,
                        'pol': p == 'policia', 'job': {'trabalhador': 'Taxista', 'policia': 'Agente', 'estudante': 'Estudante'}.get(p, '')}
                if p == 'festeiro' and random.random() < .5:
                    body['mu'] = [random.randint(0, 23), round(random.uniform(0, 200), 1)]
                if room == 'rua' and random.random() < .1:
                    body['vh'] = random.choice(['carro:gt', 'moto:trail', 'bike:btt'])
                if first:
                    body['cfg'] = B['cfg']
                st, d = call(cc, '/api/mp', body, tok, sh)
                if st == 200 and d.get('move'):
                    sh = d['move']; time.sleep(.05); continue
                if st != 200:
                    time.sleep(2); continue
                first = False
                sh = d.get('sh') or sh
                wl, preso = d.get('wl', 0), d.get('cad', 0)
                for x_ in d.get('ded') or []:
                    dsince = max(dsince, x_.get('id', 0))
                ps = d.get('players') or []
                seen = {o['id']: (o['x'], o['z'], o.get('wl') or 0, room) for o in ps}
                with L:
                    S['final_sh'][me] = sh
                    S['vis']['rua' if room == 'rua' else 'sala'].append(len(ps))
                    S['shards_max'] = max([S['shards_max']] + [v for _, v in d.get('shards') or []])
                    S['online_max'] = max(S['online_max'], d.get('online', 0))
                    if d.get('mute'): S['mute'] += 1
                for m in d.get('chat') or []:
                    since = max(since, m.get('id', 0))
                    with L:
                        S['seen_chat'][me].add(m.get('id'))
                        if m.get('vz') and m.get('uid') != me:
                            S['vz_seen'][me].add(m['vz']['id'])
                    if m.get('vz') and m.get('uid') != me and random.random() < .5:
                        st2, d2 = call(cc, '/api/voz', {'op': 'ouvir', 'id': m['vz']['id']}, tok, sh)
                        with L: S['vz_ouvir']['ok' if d2.get('ok') and d2.get('a') else re.sub(r'\d+', '#', str(d2.get('erro')))[:60]] += 1
                for e in d.get('ev') or []:
                    if e.get('t') == 'preso':
                        with L: S['presos'] += 1
                wait = (0.3 if ps else 0.9) * float(d.get('pm') or 1)
                now = time.time()

                # --- ações ---
                if preso and now > nxt['fianca']:
                    nxt['fianca'] = now + 5
                    if random.random() < .6:
                        call(cc, '/api/fianca', {}, tok, sh)
                elif now > nxt['chat'] and p in ('social', 'festeiro', 'estudante', 'trabalhador'):
                    nxt['chat'] = now + random.uniform(15, 45)
                    sc = random.choice(['todos', 'todos', 'perto'] + (['grupo'] if B.get('g') else []))
                    txt = random.choice(OFENSAS) if random.random() < .02 else random.choice(FRASES)
                    st2, d2 = call(cc, '/api/chat', {'txt': txt, 'scope': sc}, tok, sh)
                    if d2.get('ok') and d2.get('msg') and sc == 'todos':
                        with L: S['sent_chat'].append((d2['msg']['id'], sh, me, now))
                elif now > nxt['voz'] and room != 'rua' and any(v[3] == room for v in seen.values()):
                    nxt['voz'] = now + random.uniform(20, 50)
                    seg = round(random.uniform(1.5, 12), 1)
                    st2, d2 = call(cc, '/api/voz', {'op': 'enviar', 'mime': 'audio/webm;codecs=opus', 'a': base64.b64encode(fake_webm(seg)).decode(), 'dur': seg, 'scope': 'sala'}, tok, sh)
                    if d2.get('ok'):
                        with L: S['vz_sent'].append((d2['msg']['vz']['id'], sh, room, me, d2.get('ouvintes', 0), now))
                elif p == 'ladrao' and now > nxt['crime'] and room == 'rua':
                    nxt['crime'] = now + random.uniform(9, 20)
                    perto = [i for i, v in seen.items() if (v[0] - x) ** 2 + (v[1] - z) ** 2 < 4 ** 2]
                    if perto and random.random() < .5:
                        st2, d2 = call(cc, '/api/crime', {'tipo': 'carteira', 'alvo': perto[0]}, tok, sh)
                    else:
                        st2, d2 = call(cc, '/api/crime', {'tipo': random.choice(['npc', 'npc', 'loja', 'carro', 'banco'])}, tok, sh)
                    if d2.get('ok'):
                        with L: S['crimes_ok'] += 1
                elif p == 'policia' and room == 'rua':
                    proc = sorted(((v[0] - x) ** 2 + (v[1] - z) ** 2, i, v) for i, v in seen.items() if v[2] > 0)
                    if proc:   # persegue o procurado mais perto e prende-o
                        dd, i, v = proc[0]
                        if dd > 16:
                            x, z = v[0] + random.uniform(-1.5, 1.5), v[1] + random.uniform(-1.5, 1.5); alvo = min(LUG, key=lambda l: (LUG[l][0] - x) ** 2 + (LUG[l][1] - z) ** 2)
                        elif now > nxt['prender']:
                            nxt['prender'] = now + 2
                            call(cc, '/api/prender', {'alvo': i}, tok, sh)
                if now > nxt['social'] and seen and p in ('social', 'festeiro', 'policia', 'estudante'):
                    nxt['social'] = now + random.uniform(10, 30)
                    fid = random.choice(list(seen))
                    r = random.random()
                    if r < .55:
                        a = random.choice(['acenar', 'abracar', 'dancar', 'respeito', 'bebida', 'elogio'])
                        call(cc, '/api/social', {'op': 'acao', 'fid': fid, 'a': a}, tok, sh); 
                        with L: S['acts'][a] += 1
                    elif r < .75:
                        call(cc, '/api/social', {'op': 'presente', 'fid': fid, 'g': random.choice(['flores', 'gasosa', 'chocolate', 'pano'])}, tok, sh)
                    elif r < .9:
                        call(cc, '/api/social', {'op': 'desafio', 'fid': fid, 'tipo': random.choice(['braco', 'quiz', 'danca', 'corrida']), 'aposta': 0}, tok, sh)
                    else:
                        call(cc, '/api/social', {'op': 'namoro', 'fid': fid}, tok, sh)
                if now > nxt['perfil'] and seen:
                    nxt['perfil'] = now + random.uniform(25, 70)
                    st2, d2 = call(cc, '/api/social', {'op': 'perfil', 'fid': random.choice(list(seen))}, tok, sh)
                    if st2 == 200 and d2.get('ok') is not False:
                        with L: S['perfis'] += 1
                if now > nxt['amigo'] and seen:
                    nxt['amigo'] = now + random.uniform(30, 80)
                    st2, d2 = call(cc, '/api/amigos', {'op': 'add', 'fid': random.choice(list(seen))}, tok, sh)
                    if d2.get('estado') == 'amigos':
                        with L: S['amigos'] += 1
                if now > nxt['grupo']:
                    nxt['grupo'] = now + 1e9   # uma vez por robô
                    if random.random() < .06:
                        tag = ''.join(random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ') for _ in range(4))
                        st2, d2 = call(cc, '/api/grupo', {'op': 'criar', 'nome': 'Kambas ' + tag, 'tag': tag, 'tipo': random.choice(['clube', 'gangue', 'empresa', 'familia']), 'lema': 'Juntos sempre'}, tok, sh)
                        if d2.get('ok'):
                            B['g'] = True
                            with L: GR['gids'].append(d2.get('gid')); S['grupos'] += 1
                    elif random.random() < .5:
                        st2, d2 = call(cc, '/api/grupo', {'op': 'lista'}, tok, sh)
                        gs = [g['id'] for g in d2.get('grupos') or []]
                        if gs:
                            st3, d3 = call(cc, '/api/grupo', {'op': 'entrar', 'gid': random.choice(gs)}, tok, sh)
                            B['g'] = bool(d3.get('ok'))
                if now > nxt['pol']:
                    nxt['pol'] = now + 1e9
                    if random.random() < .03:
                        call(cc, '/api/pol', {'op': 'candidatar', 'partido': 'Partido ' + B['nick'], 'promessa': 'Mais escolas, estradas e emprego', 'orc': random.choice(['educacao', 'saude', 'seguranca']), 'iva': random.choice([7, 10, 14])}, tok, sh)
                    else:
                        st2, d2 = call(cc, '/api/pol', {'op': 'estado'}, tok, sh)
                        cs = [c_['uid'] for c_ in d2.get('cands') or []]
                        if cs and random.random() < .7:
                            st3, d3 = call(cc, '/api/pol', {'op': 'votar', 'cid': random.choice(cs)}, tok, sh)
                            if d3.get('ok'):
                                with L: S['votos'] += 1
                if now > nxt['ded'] and p == 'festeiro' and random.random() < .3:
                    nxt['ded'] = now + 60
                    call(cc, '/api/ded', {'ch': random.choice(['kalemba', 'kianda', 'luanda']), 'para': 'Malta do Cazenga', 'txt': 'Este som é para vocês!'}, tok, sh)
                if now > nxt['ad']:
                    nxt['ad'] = now + 1e9
                    if random.random() < .04: call(cc, '/api/ads/new', {'fmt': 'poster', 'tpl': 'classico', 't': 'Kitanda ' + B['nick'], 's': 'Fuba e peixe fresco', 'cta': 'Passa cá', 'marca': 'Kitanda'}, tok, sh)
                if now > nxt['save']:
                    nxt['save'] = now + 15
                    call(cc, '/api/save', {'save': {'nome': B['nick'], 'dinheiro': 250000, 'hist': ['evento'] * 60}, 'meta': {'vidas': [1]}}, tok, sh)
            except Exception as ex:
                with L: S['exc'][type(ex).__name__] += 1
                cc = conn(); wait = 1
            time.sleep(max(0, wait - (time.time() - ts)))

    th = [threading.Thread(target=bot, args=(b,), daemon=True) for b in bots]
    [x.start() for x in th]
    [x.join(DUR + 60) for x in th]
    # serializar
    ep = {k_: {'n': v['n'], 'lat': v['lat'], 'codes': dict(v['codes']), 'falha': dict(v['falha'])} for k_, v in S['ep'].items()}
    S2 = dict(S); S2['ep'] = ep; S2['seen_chat'] = {k_: list(v) for k_, v in S['seen_chat'].items()}
    S2['vz_seen'] = {k_: list(v) for k_, v in S['vz_seen'].items()}; S2['vis'] = dict(S['vis'])
    for k_ in ('exc', 'vz_ouvir', 'acts'):
        S2[k_] = dict(S[k_])
    q.put(S2)


def pct(a, f):
    return a[min(len(a) - 1, int(len(a) * f))] * 1000 if a else 0


if __name__ == '__main__':
    print(f'Simulação: {N} jogadores online durante {DUR}s contra {URL} ({P} processos) ...', flush=True)
    q = mp.Queue()
    bar = mp.Barrier(P)
    ps = [mp.Process(target=worker, args=(k, N // P + (1 if k < N % P else 0), q, bar, 0)) for k in range(P)]
    [p.start() for p in ps]
    R = [q.get() for _ in ps]
    [p.join() for p in ps]
    ep = defaultdict(lambda: {'n': 0, 'lat': [], 'codes': Counter(), 'falha': Counter()})
    for r in R:
        for k_, v in r['ep'].items():
            e = ep[k_]; e['n'] += v['n']; e['lat'] += v['lat']; e['codes'].update(v['codes']); e['falha'].update(v['falha'])
    tot = Counter(); [tot.update(r[k]) for r in R for k in ()]
    exc = Counter(); [exc.update(r['exc']) for r in R]
    regs = sum(r['regs'] for r in R)
    print(f'\nRobôs registados: {regs}/{N}')
    print(f'{"pedido":28} {"n":>7} {"/s":>6} {"p50":>6} {"p95":>6} {"p99":>6}  erros5xx  recusas(jogo)')
    n5 = 0
    allat = []
    for k_ in sorted(ep, key=lambda k: -ep[k]['n']):
        e = ep[k_]; lat = sorted(e['lat']); allat += lat
        e5 = sum(v for c, v in e['codes'].items() if int(c) >= 500 or int(c) == 0); n5 += e5
        nf = sum(e['falha'].values())
        print(f'{k_:28} {e["n"]:7} {e["n"] / DUR:6.1f} {pct(lat, .5):5.0f}ms {pct(lat, .95):5.0f}ms {pct(lat, .99):5.0f}ms  {e5:8}  {nf}')
    allat.sort()
    print(f'\nTOTAL pedidos={len(allat)} ({len(allat) / DUR:.0f}/s)  p50={pct(allat, .5):.0f}ms p95={pct(allat, .95):.0f}ms p99={pct(allat, .99):.0f}ms  5xx={n5}  exceções={dict(exc)}')
    rec = Counter()
    for k_, e in ep.items():
        for m, v in e['falha'].items():
            rec[f'{k_} → {m}'] += v
    print('\nRecusas do jogo mais comuns (regras a funcionar, não são erros):')
    for m, v in rec.most_common(14):
        print(f'  {v:6}  {m}')
    # ---- regras do mundo ----
    final_sh = {}; seen = defaultdict(set); vz_seen = defaultdict(set)
    for r in R:
        final_sh.update({int(k): v for k, v in r['final_sh'].items()})
        for k_, v in r['seen_chat'].items(): seen[int(k_)] |= set(v)
        for k_, v in r['vz_seen'].items(): vz_seen[int(k_)] |= set(v)
    sent = [m for r in R for m in r['sent_chat']]
    # entrega do chat 'todos': quem estava na mesma cidade e ligado até ao fim deve ver a mensagem
    deliv = []
    tend = max((m[3] for m in sent), default=0)
    for mid, sh, uid, t in sent:
        if t > tend - 3:
            continue
        alvo = [u for u, s in final_sh.items() if s == sh and u != uid]
        if alvo:
            deliv.append(sum(1 for u in alvo if mid in seen[u]) / len(alvo))
    vzs = [m for r in R for m in r['vz_sent']]
    vz_ouv = Counter(); [vz_ouv.update(r['vz_ouvir']) for r in R]
    rec_vz = [sum(1 for u in vz_seen if m[0] in vz_seen[u]) for m in vzs]
    vis = defaultdict(list)
    for r in R:
        for k_, v in r['vis'].items(): vis[k_] += v
    shmax = max(r['shards_max'] for r in R); onmax = max(r['online_max'] for r in R)
    cidades = Counter(final_sh.values())
    print('\nMundo multijogador:')
    print(f'  online máximo visto pelo servidor: {onmax} · cidades paralelas usadas: {dict(sorted(cidades.items()))} · maior cidade: {shmax}')
    print(f'  jogadores visíveis por resposta: rua média {sum(vis["rua"]) / max(1, len(vis["rua"])):.1f} (máx {max(vis["rua"] or [0])}), '
          f'dentro de salas média {sum(vis["sala"]) / max(1, len(vis["sala"])):.1f}')
    print(f'  chat "todos": {len(sent)} mensagens, entrega média na mesma cidade = {100 * sum(deliv) / max(1, len(deliv)):.1f}%')
    print(f'  voz: {len(vzs)} mensagens enviadas em salas, ouvintes médios = {sum(m[4] for m in vzs) / max(1, len(vzs)):.1f}, '
          f'recebidas por outros robôs (média) = {sum(rec_vz) / max(1, len(rec_vz)):.1f}, ouvir = {dict(vz_ouv)}')
    print(f'  crimes com êxito {sum(r["crimes_ok"] for r in R)} · presos pela polícia {sum(r["presos"] for r in R)} · grupos criados {sum(r["grupos"] for r in R)}'
          f' · votos {sum(r["votos"] for r in R)} · amizades {sum(r["amigos"] for r in R)} · perfis vistos {sum(r["perfis"] for r in R)} · gestos/danças {sum(r["emotes"] for r in R)}'
          f' · silenciados pelo filtro {sum(r["mute"] for r in R)} respostas')
    if OUT:
        json.dump({'N': N, 'DUR': DUR, 'pedidos': len(allat), 'rps': len(allat) / DUR, 'p50': pct(allat, .5), 'p95': pct(allat, .95), 'p99': pct(allat, .99),
                   'e5xx': n5, 'exc': dict(exc), 'online': onmax, 'cidades': dict(cidades), 'shmax': shmax,
                   'chat_entrega': 100 * sum(deliv) / max(1, len(deliv)), 'vz': len(vzs), 'vz_ouvir': dict(vz_ouv),
                   'ep': {k_: {'n': e['n'], 'p50': pct(sorted(e['lat']), .5), 'p95': pct(sorted(e['lat']), .95), 'falha': dict(e['falha'].most_common(5))} for k_, e in ep.items()}},
                  open(OUT, 'w'), ensure_ascii=False, indent=1)
    n429 = sum(v for e in ep.values() for c, v in e['codes'].items() if int(c) == 429)
    if n429:
        print(f'  pedidos travados pelo limitador do router (429): {n429}')
    ok = n5 == 0 and not exc and regs == N and onmax >= N * .95 and shmax <= int(os.environ.get('SHARD_CAP', 10 ** 9))
    print('\nRESULTADO:', 'TUDO OK' if ok else 'HÁ PROBLEMAS (ver acima)')
