#!/usr/bin/env python3
"""
Próxima Encarnação — servidor do jogo (ficheiros + API de contas)
Só usa a biblioteca padrão do Python 3 (sem instalações).

  python3 server.py            -> http://0.0.0.0:8080
  PORT=9000 python3 server.py  -> outra porta

API (JSON):
  GET  /api/ping
  POST /api/register  {nome, email, senha, adulto, avatar}
  POST /api/login     {email, senha}
  GET  /api/me                       (Authorization: Bearer <token>)
  POST /api/save      {save, meta}   (Authorization: Bearer <token>)
  POST /api/profile   {nome?, avatar?, adulto?}
  POST /api/logout
  POST /api/mp        {room,x,z,yaw,mv,em,nick,cfg?,since}  presença multijogador + chat novo
  GET  /api/ads                                             anúncios ativos (placas, LED, rádio)
  POST /api/ads/new   {fmt,tpl,t,s,cta,marca,cor,ico,cat}   publicar anúncio (filtro de ofensas)
  POST /api/ded       {ch,para,txt}                         dedicatória numa rádio ao vivo
  POST /api/chat      {txt, scope: todos|perto|grupo}       enviar mensagem (filtro de ofensas)
  POST /api/voz       {op: enviar|ouvir|denunciar, ...}     mensagens de voz na mesma sala (ou perto, na rua) / no grupo
  POST /api/crime     {tipo, alvo?}                         crime (PvP ou contra a cidade) -> nível de procurado
  POST /api/prender   {alvo}                                agente em serviço prende um procurado (< 5 m)
  POST /api/fianca    {}                                    sair da cadeia (o cliente paga a fiança)
  POST /api/amigos    {op: list|add|del, fid?|nick?}        amigos (pedido + aceitação)
  POST /api/grupo     {op: lista|meu|criar|entrar|sair|expulsar, ...}   gangues, empresas, clubes, partidos, famílias
  POST /api/pol       {op: estado|candidatar|votar|desistir, ...}       eleições para Governador(a) de Luanda
"""
import gzip, hashlib, hmac, json, os, random, re, secrets, signal, sqlite3, sys, threading, time
import pedb
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, 'data')
os.makedirs(DATA, exist_ok=True)
DB_PATH = os.path.join(DATA, 'jogo.db')
LOCK = threading.Lock()
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
MAX_BODY = 2_000_000

# ---------- multijogador (memória) ----------
from collections import deque
from chatfilter import filtrar
MP_LOCK = threading.Lock()
PLAYERS = {}          # uid -> estado do jogador
CHAT = deque(maxlen=200)
SEQ = [0]
TOKC = {}             # token -> (uid, nome, t)
STRIKES, MUTE, LASTMSG, NICKC = {}, {}, {}, {}
MP_TIMEOUT = 25   # rede móvel real tem falhas; só expira quem some mesmo
PERTO = 35           # metros: alcance do chat "perto"
DED = deque(maxlen=80)   # dedicatórias nas rádios ao vivo
DSEQ = [0]
LASTDED = {}
LASTAD = {}
ADS_V = [1]          # versão dos anúncios (muda quando alguém publica)
# ----- mensagens de voz (só em memória, apagam-se sozinhas) -----
from collections import OrderedDict
import base64
VOZ = OrderedDict()  # id -> {'t','uid','mime','b','room','sh','x','z','g'}
VOZ_TTL = 240        # segundos que um áudio fica disponível
VOZ_MAXB = 140_000   # bytes por mensagem (15 s de opus ~ 40-70 KB)
VOZ_TOTAL = [0]
VOZ_CAP = 32_000_000 # memória máxima para áudios neste processo
VOZ_DUR = 15
LASTVOZ, VOZREP, VOZBAN = {}, {}, {}
VOZ_MIME = {'audio/webm': b'\x1a\x45\xdf\xa3', 'audio/ogg': b'OggS', 'audio/mp4': None, 'audio/aac': None, 'audio/mpeg': None}
# ----- vida real: polícia e ladrões, grupos, amigos, política -----
CRIM = {}            # uid -> {'wl': estrelas de procurado 0..5, 'wlT': último crime/decaimento, 'cad': cadeia até (ts)}
EVQ = {}             # uid -> eventos pendentes (roubado, preso, alerta, pedido de amizade, ...)
LASTCRIME = {}
GTAG = {}            # uid -> (tag, gid, tipo) ou None
CRIME_T = {  # tipo: (estrelas, prob. sucesso, saque mín, saque máx, prob. polícia NPC, nome)
    'npc': (1, .75, 2000, 15000, .10, 'roubo a um peão'),
    'loja': (2, .60, 20000, 120000, .18, 'assalto a uma cantina'),
    'banco': (3, .35, 300000, 2000000, .35, 'assalto ao banco'),
    'carro': (2, .55, 40000, 250000, .20, 'roubo de carro'),
    'carteira': (1, .65, 3000, 25000, .10, 'carteirista'),
    'assalto': (2, .70, 8000, 60000, .15, 'assalto à mão armada'),
}
WL_DECAI = 75        # segundos sem crimes para perder 1 estrela
CAD_POR_WL = 40      # segundos de cadeia por estrela
RONDA_S = 1200       # cada eleição dura 20 min
POL = {'ronda': 1, 'fim': 0, 'cands': {}, 'votou': set()}
GOV = [None]
ORCS = ('saude', 'educacao', 'seguranca', 'economia')
GTIPOS = ('gangue', 'empresa', 'clube', 'partido', 'familia')
AD_FMT = {'poster': (1800, 30000), 'placa': (7200, 150000), 'led': (21600, 450000), 'radio': (3600, 80000), 'mega': (86400, 1500000)}


def _num(v, lo, hi):
    try:
        v = float(v)
    except Exception:
        return 0.0
    return max(lo, min(hi, v)) if v == v else 0.0


def _sys(txt, sh=None):
    SEQ[0] += 1
    CHAT.append({'id': SEQ[0], 'uid': 0, 'nick': '', 'txt': txt, 'room': '*', 't': time.time(), 'sys': 1, '_sh': sh})


# ----- escala: cidades paralelas (shards), cache agregada por segundo -----
SHARD_CAP = int(os.environ.get('SHARD_CAP', 250))
SAVE_S = max(10, int(os.environ.get('SAVE_S', 15)))        # o cliente grava no servidor no máximo 1 vez a cada SAVE_S s
ANO_GAP = 20*60   # segundos mínimos entre anos fechados (o cliente pede 25 min; o servidor dá margem)
POLL_MUL = max(1.0, min(3.0, float(os.environ.get('POLL_MUL', 1))))   # >1 = clientes perguntam menos vezes (menos tráfego)   # jogadores por cidade paralela
VIEW = 140                                          # só recebes jogadores a menos de 140 m (na rua)
MAX_PS = 24                                         # e no máximo os 24 mais perto
AGG = {'t': 0, 'chs': {}, 'pol': 0, 'sh': {}}
LASTEXP = [0]
SUS = {}                                            # anti-batota: uid -> motivo
KZH = {}                                            # uid -> (t, dinheiro reportado)
# ----- perfil social: ações entre jogadores (acenar, respeito, dinheiro, namoro, convites, denúncias) -----
SOCT = {}      # (de, para, ação) -> última vez
KZDAY = {}     # uid -> (dia, total enviado hoje)
NAMP = {}      # (de, para) -> pedido de namoro pendente {t, info}
REPORTS = {}   # uid denunciado -> {denunciante: t}
PFC = {}       # cache de perfis: uid -> (t, dados)
DESP = {}      # (desafiante, desafiado) -> desafio pendente
PRESENTES = ('flores', 'chocolate', 'gasosa', 'perfume', 'relogio', 'pano', 'telemovel', 'carro')
DESAFIOS = ('braco', 'quiz', 'danca', 'corrida')
SOC_ACOES = ('acenar', 'abracar', 'dancar', 'respeito', 'bebida', 'elogio', 'visita')
KZ_MAX, KZ_DIA = 5_000_000, 20_000_000
IPSALT = os.environ.get('IP_SALT', 'pe3d-kianda-ao')   # sal para não guardar IPs em claro
ADMIN_KEY = os.environ.get('ADMIN_KEY', '')            # chave do painel de auditoria (definir no Northflank)
IDENTC = {}   # uid -> (dev, iph) em cache; a gravação na base só acontece quando muda
KZIP = {}     # (uid, fid) -> (dia, total) transferências entre contas no mesmo IP
KZIP_DIA = 2_000_000   # teto diário entre contas que partilham IP
PAT_T = [(1e9, 'Bilionário(a)'), (1e8, 'Milionário(a)'), (2e7, 'Rico(a)'), (3e6, 'Confortável'), (3e5, 'Remediado(a)'), (-1e18, 'Humilde')]


def _pf_extract(sv):
    """resumo público da vida de um jogador, tirado da gravação (nunca mostra valores exatos de dinheiro)"""
    try:
        g = json.loads(sv) if sv else None
    except Exception:
        g = None
    if not isinstance(g, dict):
        return None
    st = g.get('stats') or {}
    ims = [i for i in (g.get('imoveis') or []) if isinstance(i, dict)]
    pat = _num(g.get('dinheiro'), -1e15, 1e15) + _num(g.get('poupanca'), -1e15, 1e15) + sum(_num(i.get('valor'), 0, 1e13) for i in ims)
    casa = g.get('casa') if isinstance(g.get('casa'), dict) else {}
    cid_ = None
    if casa.get('tipo') == 'arrendada':
        cid_ = casa.get('id')
    elif casa.get('tipo') == 'propria':
        try:
            cid_ = ims[int(casa.get('idx') or 0)].get('id')
        except Exception:
            cid_ = None
    em = g.get('emprego') if isinstance(g.get('emprego'), dict) else None
    par = g.get('parceiro') if isinstance(g.get('parceiro'), dict) else None
    vr = g.get('vr') if isinstance(g.get('vr'), dict) else {}
    v3 = g.get('v3') if isinstance(g.get('v3'), dict) else {}
    cidade = g.get('cidade') if isinstance(g.get('cidade'), dict) else {}
    est = g.get('estudo') if isinstance(g.get('estudo'), dict) else None
    sv_ = lambda x, n=40: str(x)[:n] if x is not None else None
    return {
        'vivo': bool(g.get('vivo', True)), 'idade': int(_num(g.get('idade'), 0, 130)), 'genero': sv_(g.get('genero'), 2),
        'prov': sv_(cidade.get('prov')), 'mun': sv_(cidade.get('mun')), 'classe': sv_(g.get('classe'), 12), 'origem': sv_(g.get('origem'), 12),
        'casa': {'tipo': sv_(casa.get('tipo'), 12), 'id': sv_(cid_, 16)}, 'emprego': {'id': sv_(em.get('id'), 20), 'nivel': int(_num(em.get('nivel'), 0, 9))} if em else None,
        'reformado': bool(g.get('reformado')), 'estudo': sv_(est.get('t'), 60) if est else None, 'edu': int(_num(g.get('edu'), 0, 9)),
        'cursos': [sv_(c, 20) for c in (g.get('cursosFeitos') or [])[:8]], 'mestrado': bool(g.get('mestrado')), 'tecnicos': len(g.get('tecnicos') or []),
        'fama': int(_num(st.get('fama'), 0, 100)), 'karma': int(_num(st.get('karma'), 0, 100)), 'aparencia': int(_num(st.get('aparencia'), 0, 100)),
        'seg': int(_num(g.get('seg'), 0, 1e10)), 'verificado': bool(g.get('verificado')), 'negocios': len(g.get('negocios') or []),
        'grupoEmp': sv_((g.get('grupo') or {}).get('nome'), 40) if isinstance(g.get('grupo'), dict) else None, 'imoveis': len(ims),
        'bens': [sv_(b, 16) for b in (g.get('bens') or [])[:40]], 'tel': int(_num(g.get('tel'), 0, 9)),
        'parceiro': {'nome': sv_(par.get('nome'), 30), 'casado': bool(par.get('casado')), 'uid': int(_num(par.get('uid'), 0, 1e12)) or None} if par else None,
        'filhos': len(g.get('filhos') or []), 'conq': len(g.get('conq') or []), 'pat': next(t for v, t in PAT_T if pat >= v),
        'crimes': int(_num(vr.get('crimes'), 0, 1e6)), 'prisoes': int(_num(vr.get('prisoes'), 0, 1e6)), 'presos': int(_num(vr.get('presosFeitos'), 0, 1e6)),
        'diplomas': sum(1 for n in (v3.get('cur') or {}).values() if _num(n, 0, 99) >= 10) if isinstance(v3.get('cur'), dict) else 0,
        'talento': sv_(g.get('talento'), 16), 'avatar': g.get('avatar') if isinstance(g.get('avatar'), dict) and len(json.dumps(g.get('avatar'))) < 3000 else None,
        'roupa': sv_(g.get('roupa'), 20),
    }


def _rep_get(c, uid):
    r = c.execute('SELECT v FROM kv WHERE k=?', (f'rep:{uid}',)).fetchone()
    try:
        d = json.loads(r[0]) if r else {}
    except Exception:
        d = {}
    return d if isinstance(d, dict) else {}

# ----- modo cluster: vários processos/máquinas, cada um dono de algumas cidades paralelas -----
# NODE=i NODES=K  ->  este processo é dono das cidades s com (s-1) % K == i-1 (o nginx encaminha por ?sh=)
NODE = int(os.environ.get('NODE', 1))
NODES = max(1, int(os.environ.get('NODES', 1)))
CLUSTER = NODES > 1
CL = {'t': 0, 'sh': {}, 'online': 0, 'pol': None, 'gt': 0, 'on': set()}
EVCHK = {}


def _owner(s_):
    return ((int(s_) - 1) % NODES) + 1


ALIVE_S = 10           # um nó sem sinal há mais de 10 s é dado como em baixo
GSYS_OUT = deque(maxlen=12)   # avisos globais deste nó (eleições, grupos, anúncios) -> copiados para os outros nós
GSEQ = [0]
GSEEN = {}


def _gsys(txt):
    """aviso de sistema para TODAS as cidades (todos os nós)"""
    _sys(txt)
    if CLUSTER:
        GSEQ[0] += 1
        GSYS_OUT.append((GSEQ[0], time.time(), txt))


def _cluster(now):
    """(compatibilidade) a sincronização corre agora em _cluster_loop, num fio separado"""
    return


def _cluster_sync():
    """de 2 em 2 s: publica as contagens deste nó, lê as dos outros, eventos entre nós, avisos globais, versão dos anúncios"""
    now = time.time()
    with MP_LOCK:
        mine = {}
        for o in PLAYERS.values():
            mine[o.get('sh', 1)] = mine.get(o.get('sh', 1), 0) + 1
        local = set(PLAYERS.keys())
        me_row = json.dumps({'t': now, 'sh': mine, 'u': list(local), 'g': list(GSYS_OUT)})
        pol_row = json.dumps({'ronda': POL['ronda'], 'fim': POL['fim'], 'n': len(POL['cands'])}) if NODE == 1 else None
    evs, gtags = {}, None
    with db() as c:
        c.execute('INSERT OR REPLACE INTO kv VALUES(?, ?)', (f'node:{NODE}', me_row))
        if pol_row:
            c.execute("INSERT OR REPLACE INTO kv VALUES('pol', ?)", (pol_row,))
        rows = c.execute("SELECT k, v FROM kv WHERE k LIKE 'node:%' OR k IN ('pol', 'gov')").fetchall()
        mx = c.execute('SELECT MAX(id) FROM ads').fetchone()[0] or 0
        # eventos deixados por outros nós para jogadores que estão aqui (1 consulta por nó, não por jogador)
        if CL.get('evid') is None:
            CL['evid'] = c.execute('SELECT MAX(id) FROM evq').fetchone()[0] or 0
        rs = c.execute('SELECT id, uid, e FROM evq WHERE id>? ORDER BY id LIMIT 2000', (CL['evid'],)).fetchall()
        apagar = []
        for r in rs:
            CL['evid'] = max(CL['evid'], r[0])
            if r[1] in local:
                evs.setdefault(r[1], []).append(json.loads(r[2]))
                apagar.append(r[0])
        for i in range(0, len(apagar), 500):
            part = apagar[i:i + 500]
            c.execute(f"DELETE FROM evq WHERE id IN ({','.join('?' * len(part))})", part)
        if now - CL['gt'] > 30 and local:   # grupos podem mudar noutro nó: recarrega as etiquetas de uma vez
            CL['gt'] = now
            ids = list(local)[:3000]
            gtags = {u: None for u in ids}
            for i in range(0, len(ids), 500):
                part = ids[i:i + 500]
                for r in c.execute(f"SELECT m.uid, g.tag, g.id, g.tipo FROM membros m JOIN grupos g ON g.id=m.gid WHERE m.uid IN ({','.join('?' * len(part))})", part).fetchall():
                    gtags[r[0]] = (r[1], r[2], r[3])
        if NODE == 1 and now - CL.get('limpo', 0) > 600:   # limpeza periódica (só o nó 1)
            CL['limpo'] = now
            c.execute('DELETE FROM evq WHERE t<?', (now - 900,))
            c.execute('DELETE FROM sessions WHERE criado<?', (now - 60 * 86400,))
            c.execute("DELETE FROM kv WHERE k LIKE 'node:%' AND k NOT IN (" + ','.join(f"'node:{i}'" for i in range(1, NODES + 1)) + ")")
    tot, sh, on, alive, gnew, pol, gov = 0, {}, set(), {NODE}, [], None, None
    for k, v in rows:
        v = json.loads(v)
        if k.startswith('node:'):
            if k == f'node:{NODE}' or now - v.get('t', 0) > ALIVE_S:
                continue
            try:
                alive.add(int(k[5:]))
            except ValueError:
                pass
            for a, b in v.get('sh', {}).items():
                sh[int(a)] = sh.get(int(a), 0) + b
                tot += b
            on.update(v.get('u', []))
            last = GSEEN.get(k)
            for seq, t, txt in v.get('g', []):
                if last is not None and seq > last and now - t < 60:
                    gnew.append(txt)
                GSEEN[k] = max(GSEEN.get(k) or 0, seq)
            if last is None:
                GSEEN[k] = max([g[0] for g in v.get('g', [])] or [0])
        elif k == 'pol' and NODE != 1:
            pol = v
        elif k == 'gov' and NODE != 1:
            gov = v
    with MP_LOCK:
        for a, b in mine.items():
            sh[a] = sh.get(a, 0) + b
        CL.update({'sh': sh, 'online': tot + len(PLAYERS), 'on': on, 'alive': alive, 't': now})
        if pol:
            CL['pol'] = pol
        if gov is not None:
            GOV[0] = gov
        if mx > ADS_V[0]:
            ADS_V[0] = mx
        for txt in gnew:
            _sys(txt)
        for uid, lst in evs.items():
            q = EVQ.setdefault(uid, [])
            q.extend(lst)
            del q[:-20]
        if gtags is not None:
            GTAG.update(gtags)


def _cluster_loop():
    while True:
        time.sleep(2)
        try:
            _cluster_sync()
        except Exception as e:
            print(f'[nó {NODE}] sincronização do cluster falhou: {e!r}', flush=True)
            time.sleep(3)


def _expire(now):
    if now - LASTEXP[0] < 1:
        return
    LASTEXP[0] = now
    if now - CL.get('cx', 0) > 120:   # caches por jogador: sem crescer para sempre com milhares de contas
        CL['cx'] = now
        for t in [t for t, h in TOKC.items() if now - h[2] > 120]:
            TOKC.pop(t, None)
        for d_ in (NICKC, KZH, LASTMSG, LASTCRIME, LASTAD, LASTDED, STRIKES, EVCHK, LASTVOZ, VOZREP):
            if len(d_) > 4 * max(100, len(PLAYERS)):
                for u in [u for u in list(d_) if u not in PLAYERS][:len(d_) // 2]:
                    d_.pop(u, None)
        for u in [u for u, c_ in CRIM.items() if u not in PLAYERS and c_.get('wl', 0) == 0 and c_.get('cad', 0) < now]:
            CRIM.pop(u, None)
        if len(GTAG) > 4 * max(100, len(PLAYERS)):
            GTAG.clear()
    for uid in [u for u, p in PLAYERS.items() if now - p['t'] > MP_TIMEOUT]:
        p = PLAYERS.pop(uid)
        _sys(f"{p['nick']} saiu da cidade", p.get('sh'))


PS_MARCA = '\x00PS'
PS_MARCA_J = '"players":' + json.dumps(PS_MARCA)
_CJ = (',', ':')


def _cartao(o):
    """o que os outros recebem deste jogador, em JSON pronto (sem campos vazios). Feito 1 vez por atualização
    dele, em vez de 1 vez por cada jogador que o vê (até 24x por pedido)."""
    q = {k: o.get(k) for k in ('id', 'nick', 'x', 'z', 'yaw', 'mv', 'cv')}
    for k in ('em', 'mu', 'vh', 'wl', 'pol', 'gt', 'cad', 'job'):
        v = o.get(k)
        if v:
            q[k] = v
    j = json.dumps(q, ensure_ascii=False, separators=_CJ)
    o['_pj'] = j
    cfg = o.get('cfg')
    if cfg is not None:
        if o.get('_cfgv') != o.get('cv'):
            o['_cfgj'] = json.dumps(cfg, ensure_ascii=False, separators=_CJ); o['_cfgv'] = o.get('cv')
        o['_pjc'] = j[:-1] + ',"cfg":' + o['_cfgj'] + '}'
    else:
        o['_pjc'] = j


def _agg(now):
    if now - AGG['t'] < 1:
        return AGG
    chs, sh, pol = {}, {}, 0
    for o in PLAYERS.values():
        if o.get('ch'):
            chs[o['ch']] = chs.get(o['ch'], 0) + 1
        sh[o.get('sh', 1)] = sh.get(o.get('sh', 1), 0) + 1
        pol += 1 if o.get('pol') else 0
    AGG.update({'t': now, 'chs': chs, 'pol': pol, 'sh': sh})
    return AGG


def _shard(want=None):
    cnt = dict(_agg(time.time())['sh'])
    if CLUSTER:
        for a, b in CL['sh'].items():
            if _owner(a) != NODE:
                cnt[a] = b
    i = 0
    vivos = CL.get('alive') if CLUSTER else None   # nós com sinal nos últimos 10 s
    if want and 1 <= want <= 99 and cnt.get(want, 0) < SHARD_CAP and (not vivos or _owner(want) in vivos):
        i = want
    elif CLUSTER and want and 1 <= want <= 99 and _owner(want) == NODE:
        i = want                      # chegou a este nó: fica numa das cidades dele (sem ping-pong entre nós)
        while cnt.get(i, 0) >= SHARD_CAP:
            i += NODES
    else:
        i = 1
        while cnt.get(i, 0) >= SHARD_CAP or (vivos and _owner(i) not in vivos and i < 99):
            i += 1
    if not CLUSTER or _owner(i) == NODE:
        AGG['sh'][i] = AGG['sh'].get(i, 0) + 1   # conta já, para picos de entradas não encherem demais
    return i


def _batota(uid, nick, kz, now):
    """anti-batota básico: dinheiro absurdo ou saltos impossíveis marcam a conta"""
    kz = _num(kz, -1e15, 1e15)
    prev = KZH.get(uid)
    KZH[uid] = (now, kz)
    if uid in SUS:
        return kz
    if kz > 5e11:
        SUS[uid] = 'dinheiro impossível'
    elif prev and kz - prev[1] > 2e9 and now - prev[0] < 20:
        SUS[uid] = f'salto de {kz - prev[1]:,.0f} Kz em {now - prev[0]:.0f}s'
    if uid in SUS:
        try:
            with open(os.path.join(DATA, 'batota.log'), 'a', encoding='utf-8') as f:
                f.write(f'{time.strftime("%Y-%m-%d %H:%M:%S")}\t{uid}\t{nick}\t{SUS[uid]}\n')
        except Exception:
            pass
    return kz


def _iph(h):
    """hash do IP (X-Forwarded-For atrás de proxy) — privacidade: nunca guardamos o IP em claro"""
    ip = (h.headers.get('X-Forwarded-For') or '').split(',')[0].strip() or (h.client_address[0] if h.client_address else '?')
    return hashlib.sha256((ip + IPSALT).encode()).hexdigest()[:16]


def _ident_get(c, uid):
    r = c.execute('SELECT v FROM kv WHERE k=?', (f'ident:{uid}',)).fetchone()
    try:
        return json.loads(r[0]) if r else {}
    except Exception:
        return {}


def _ident_note(self, c, uid, dev, now):
    """regista aparelho + hash do IP de uma conta (só grava quando muda)"""
    iph = _iph(self)
    dev = (dev or '')[:32]
    cur = IDENTC.get(uid)
    if cur and cur[0] == dev and cur[1] == iph:
        return
    IDENTC[uid] = (dev, iph)
    try:
        idn = _ident_get(c, uid)
        ips = idn.get('ips') or []
        if iph not in ips:
            ips = (ips + [iph])[-8:]
        if dev and idn.get('dev') != dev:
            idn['devs'] = ((idn.get('devs') or []) + [idn.get('dev')])[-3:] if idn.get('dev') else []
            idn['dev'] = dev
        elif dev:
            idn['dev'] = dev
        idn['ips'] = ips
        idn['t'] = now
        c.execute('INSERT OR REPLACE INTO kv VALUES(?, ?)', (f'ident:{uid}', json.dumps(idn)))
    except Exception:
        pass


def _ident_mem(uid):
    return IDENTC.get(uid, ('', ''))


def db():
    return pedb.connect(DB_PATH)


pedb.init_schema(DB_PATH)
with db() as c:
    # esquema: pedb.SCHEMA_SQLITE / pedb.SCHEMA_PG (criado em pedb.init_schema)
    _g = c.execute("SELECT v FROM kv WHERE k='gov'").fetchone()
    if _g:
        try:
            GOV[0] = json.loads(_g[0])
        except Exception:
            GOV[0] = None


def _ev(uid, e):
    if CLUSTER and uid not in PLAYERS:   # o jogador está noutro nó: deixa o evento na base de dados
        try:
            with db() as c:
                c.execute('INSERT INTO evq(uid, e, t) VALUES(?,?,?)', (uid, json.dumps(e), time.time()))
        except Exception:
            pass
        return
    q = EVQ.setdefault(uid, [])
    q.append(e)
    del q[:-20]


def _d2(a, b):
    return (a['x'] - b['x']) ** 2 + (a['z'] - b['z']) ** 2


def _crim(uid, now):
    cr = CRIM.setdefault(uid, {'wl': 0, 'wlT': now, 'cad': 0})
    if cr['wl'] > 0 and now - cr['wlT'] > WL_DECAI:
        cr['wl'] -= 1
        cr['wlT'] = now
    return cr


def _gtag(c, uid):
    if uid not in GTAG:
        r = c.execute('SELECT g.tag, g.id, g.tipo FROM membros m JOIN grupos g ON g.id=m.gid WHERE m.uid=?', (uid,)).fetchone()
        GTAG[uid] = (r[0], r[1], r[2]) if r else None
    return GTAG[uid]


def _nome(c, uid):
    if uid in NICKC:
        return NICKC[uid][1]
    r = c.execute('SELECT nome FROM users WHERE id=?', (uid,)).fetchone()
    return (r[0] if r else f'Jogador{uid}')[:24]


def _pol_tick(now):
    if not POL['fim']:
        POL['fim'] = now + RONDA_S
        return
    if now < POL['fim']:
        return
    cs = sorted(POL['cands'].values(), key=lambda x: (-x['votos'], x['t']))
    if cs and cs[0]['votos'] > 0:
        w = cs[0]
        GOV[0] = {'uid': w['uid'], 'nick': w['nick'], 'partido': w['partido'], 'promessa': w['promessa'], 'orc': w['orc'],
                  'iva': w['iva'], 'votos': w['votos'], 'ronda': POL['ronda'], 'desde': now}
        with db() as c:
            c.execute("INSERT OR REPLACE INTO kv VALUES('gov', ?)", (json.dumps(GOV[0]),))
        _gsys(f"🗳 {w['nick']} ({w['partido']}) venceu a eleição e é o(a) novo(a) Governador(a) de Luanda com {w['votos']} voto(s)!")
        _ev(w['uid'], {'t': 'eleito', 'v': w['votos']})
    elif cs:
        _gsys('🗳 Eleição sem votos: o governo atual mantém-se.')
    POL.update({'ronda': POL['ronda'] + 1, 'fim': now + RONDA_S, 'cands': {}, 'votou': set()})


ADS_CACHE = [0, None, 0]


def ads_ativos(now=None):
    now = now or time.time()
    if ADS_CACHE[1] is not None and now - ADS_CACHE[0] < 5 and ADS_CACHE[2] == ADS_V[0]:
        return ADS_CACHE[1]   # milhares de jogadores pedem ao mesmo tempo quando sai um anúncio novo
    with db() as c:
        rs = c.execute('SELECT * FROM ads WHERE exp>? ORDER BY id DESC LIMIT 60', (now,)).fetchall()
    out = []
    for r in rs:
        a = json.loads(r['data'])
        a.update({'id': r['id'], 'nick': r['nick'], 'exp': r['exp'], 'criado': r['criado']})
        out.append(a)
    ADS_CACHE[:] = [now, out, ADS_V[0]]
    return out


def hash_pw(senha, salt):
    return hashlib.pbkdf2_hmac('sha256', senha.encode(), bytes.fromhex(salt), 150_000).hex()


def public(u):
    return {'id': u['id'], 'nome': u['nome'], 'email': u['email'], 'adulto': bool(u['adulto']),
            'avatar': json.loads(u['avatar'] or '{}')}


GZ = {}   # cache de ficheiros comprimidos: caminho -> (mtime, bytes)
GZ_EXT = ('.js', '.html', '.css', '.json', '.svg', '.txt')


class H(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'   # ligações reutilizadas (keep-alive): menos trabalho por pedido
    disable_nagle_algorithm = True   # TCP_NODELAY: sem os 40 ms de atraso (Nagle + ACK atrasado) em cada resposta

    def do_HEAD(self):
        return self.send_json(405, {'erro': 'Método não suportado'})

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        pass

    def end_headers(self):
        if self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    # ---------- utilitários ----------
    def send_json(self, code, obj):
        if getattr(self, '_defer', False):   # dentro do cadeado: guarda e envia depois de o largar
            self._out = (code, obj)
            return
        psj = obj.pop('_psj', None) if isinstance(obj, dict) else None
        b = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
        if psj is not None:   # lista de jogadores já em JSON (cartões em cache): cola no sítio da marca
            b = b.replace(PS_MARCA_J, '"players":' + psj, 1)
        b = b.encode()
        if len(b) > 1400 and 'gzip' in self.headers.get('Accept-Encoding', ''):
            b = gzip.compress(b, 1)   # nível 1: ~3x mais rápido que 4 e só ~8% maior
            self.send_response(code)
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(b)))
            self.end_headers()
            self.wfile.write(b)
            return
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n > MAX_BODY:
            raise ValueError('Pedido demasiado grande')
        return json.loads(self.rfile.read(n) or b'{}') if n else {}

    def user(self, c, cols='u.*'):
        a = self.headers.get('Authorization', '')
        if not a.startswith('Bearer '):
            return None
        r = c.execute(f'SELECT {cols} FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?', (a[7:],)).fetchone()
        return r

    # ---------- multijogador ----------
    def mp_uid(self):
        a = self.headers.get('Authorization', '')
        if not a.startswith('Bearer '):
            return None
        tok, now = a[7:], time.time()
        hit = TOKC.get(tok)
        if hit and now - hit[2] < 60:
            return hit
        with db() as c:
            r = c.execute('SELECT u.id, u.nome FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?', (tok,)).fetchone()
        if not r:
            TOKC.pop(tok, None)
            return None
        TOKC[tok] = (r['id'], r['nome'], now)
        return TOKC[tok]

    def mp(self, p, d):
        self._defer, self._out = True, None
        try:
            self._mp(p, d)
        finally:
            self._defer = False
        if self._out:
            code, obj = self._out
            self._out = None
            self.send_json(code, obj)

    def static_gz(self):
        """serve ficheiros de texto comprimidos (gzip) com cache — o jogo descarrega ~4x mais depressa"""
        path = self.translate_path(self.path.split('?')[0])
        if os.path.isdir(path) and self.path.split('?')[0].endswith('/'):
            path = os.path.join(path, 'index.html')
        if not path.endswith(GZ_EXT) or not os.path.isfile(path) or 'gzip' not in self.headers.get('Accept-Encoding', ''):
            return False
        mt = os.path.getmtime(path)
        hit = GZ.get(path)
        if not hit or hit[0] != mt:
            with open(path, 'rb') as f:
                hit = GZ[path] = (mt, gzip.compress(f.read(), 6))
        etag = f'"{int(mt)}-{len(hit[1])}"'
        if self.headers.get('If-None-Match') == etag:
            self.send_response(304); self.send_header('ETag', etag); self.send_header('Content-Length', '0'); self.end_headers()
            return True
        self.send_response(200)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(len(hit[1])))
        self.send_header('Cache-Control', 'public, max-age=300')
        self.send_header('ETag', etag)
        self.end_headers()
        self.wfile.write(hit[1])
        return True

    def _mp(self, p, d):
        who = self.mp_uid()
        if not who:
            return self.send_json(401, {'erro': 'Sessão inválida. Entra outra vez.'})
        uid, nome_conta = who[0], who[1]
        now = time.time()
        evs = None
        if p == '/api/mp' and uid not in GTAG:   # consulta à base de dados FORA do cadeado (não bloqueia os outros)
            try:
                with db() as c:
                    _gtag(c, uid)
            except pedb.DBError:
                pass
        if CLUSTER and p == '/api/mp' and uid not in PLAYERS and now - EVCHK.get(uid, 0) > 3:
            EVCHK[uid] = now   # acabou de chegar a este nó: recolhe o que outros nós lhe deixaram
            try:
                with db() as c:
                    rs = c.execute('SELECT id, e FROM evq WHERE uid=? ORDER BY id LIMIT 20', (uid,)).fetchall()
                    if rs:
                        c.execute('DELETE FROM evq WHERE uid=? AND id<=?', (uid, rs[-1][0]))
                        evs = [json.loads(r[1]) for r in rs]
            except Exception:
                evs = None
        if p == '/api/social' and str(d.get('op') or '') == 'perfil':
            return self.perfil(uid, int(_num(d.get('fid'), 0, 1e12)), now)
        with MP_LOCK:
            _expire(now)
            if evs:
                EVQ.setdefault(uid, []).extend(evs)
            if p == '/api/mp':
                raw = str(d.get('nick') or nome_conta)[:24]
                if NICKC.get(uid, (None,))[0] != raw:
                    limpo, hits, bloq, _ = filtrar(raw)
                    NICKC[uid] = (raw, limpo if limpo and not hits else f'Jogador{uid}')
                nick = NICKC[uid][1]
                st = PLAYERS.get(uid)
                if not st:
                    s0 = _shard(int(_num(d.get('sh'), 0, 99)))
                    if CLUSTER and _owner(s0) != NODE:   # essa cidade vive noutro nó: o cliente volta a pedir com ?sh=
                        return self.send_json(200, {'move': s0, 'me': uid})
                    st = PLAYERS[uid] = {'id': uid, 'cfg': None, 'cv': None, 'sh': s0}
                    _sys(f'{nick} entrou na cidade', st['sh'])
                elif d.get('sh') and int(_num(d.get('sh'), 0, 99)) != st['sh']:
                    novo = _shard(int(_num(d.get('sh'), 0, 99)))
                    if CLUSTER and novo != st['sh'] and _owner(novo) != NODE:
                        PLAYERS.pop(uid, None)
                        _sys(f'{nick} mudou-se para Luanda {novo}', st['sh'])
                        return self.send_json(200, {'move': novo, 'me': uid})
                    if novo != st['sh']:
                        _sys(f'{nick} mudou-se para Luanda {novo}', st['sh'])
                        st['sh'] = novo
                        _sys(f'{nick} chegou de outra cidade', novo)
                cfg = d.get('cfg')
                if isinstance(cfg, dict):
                    cj = json.dumps(cfg, sort_keys=True)
                    if len(cj) < 6000:
                        st['cfg'] = cfg
                        st['cv'] = hashlib.md5(cj.encode()).hexdigest()[:10]
                if 'kz' in d:
                    _batota(uid, nick, d.get('kz'), now)
                    st['kz'] = max(0, KZH[uid][1])
                st.update({'nick': nick, 'room': str(d.get('room') or 'rua')[:40],
                           'x': round(_num(d.get('x'), -400, 400), 2), 'z': round(_num(d.get('z'), -400, 400), 2),
                           'yaw': round(_num(d.get('yaw'), -100, 100), 3), 'mv': int(_num(d.get('mv'), 0, 2)),
                           'em': (str(d.get('em'))[:12] if d.get('em') else None), 't': now})
                # identidade anti-multiconta: aparelho + hash do IP (grava só quando muda)
                dv = str(d.get('dv') or '')[:32]
                iph = _iph(self)
                if IDENTC.get(uid) != (dv, iph):
                    try:
                        with db() as c2:
                            _ident_note(self, c2, uid, dv, now)
                    except Exception:
                        pass
                st['ch'] = str(d.get('ch') or '')[:24]
                st['pol'] = bool(d.get('pol'))
                st['job'] = re.sub(r'[^\w À-ÿ()-]', '', str(d.get('job') or ''))[:28]
                cr = _crim(uid, now)
                if cr['cad'] > now:
                    st['pol'] = False
                if uid in GTAG:
                    gt = GTAG[uid]
                else:
                    with db() as c:
                        gt = _gtag(c, uid)
                st['gt'] = gt[0] if gt else None
                st['wl'] = cr['wl']
                st['cad'] = cr['cad'] > now
                if NODE == 1:
                    _pol_tick(now)
                vh = d.get('vh')
                st['vh'] = re.sub(r'[^a-z0-9#:]', '', str(vh).lower())[:24] if vh else None
                mu = d.get('mu')
                st['mu'] = [int(_num(mu[0], 0, 50)), round(_num(mu[1], 0, 900), 1)] if isinstance(mu, list) and len(mu) == 2 else None
                _cartao(st)
                since = int(_num(d.get('since'), 0, 1e12))
                room, sh = st['room'], st['sh']
                need = set(int(_num(i, 0, 1e12)) for i in (d.get('need') or [])[:10]) if isinstance(d.get('need'), list) else set()
                full = not d.get('cv')   # clientes antigos recebem sempre a aparência completa
                v2 = VIEW * VIEW
                near = []
                for o in PLAYERS.values():
                    if o['id'] == uid or o['room'] != room or o.get('sh') != sh or not o.get('cfg'):
                        continue
                    dd = (o['x'] - st['x']) ** 2 + (o['z'] - st['z']) ** 2
                    if room == 'rua' and dd > v2:
                        continue
                    near.append((dd, o))
                near.sort(key=lambda t: t[0])
                ps = []   # cartões JSON já prontos (com a aparência só para quem precisa)
                for dd, o in near[:MAX_PS]:
                    if '_pj' not in o:
                        _cartao(o)
                    ps.append(o['_pjc'] if (full or o['id'] in need) else o['_pj'])
                psj = '[' + ','.join(ps) + ']'
                def ve(m):  # mensagens "perto" só chegam a quem está a menos de PERTO metros
                    if m.get('_sh') and m['_sh'] != sh:
                        return False   # cada cidade paralela tem o seu chat
                    if m.get('sc') == 'grupo':
                        return bool(gt) and m.get('_g') == gt[1]
                    if m.get('sc') == 'sala':   # voz: mesma sala (interior) ou perto, na rua
                        return m['uid'] == uid or (m['room'] == room and (room != 'rua' or (m['_x'] - st['x']) ** 2 + (m['_z'] - st['z']) ** 2 <= PERTO ** 2))
                    if m.get('sc') != 'perto' or m['uid'] == uid:
                        return True
                    return m['room'] == room and (m['_x'] - st['x']) ** 2 + (m['_z'] - st['z']) ** 2 <= PERTO ** 2
                pool = [m for m in CHAT if m['id'] > since] if since else list(CHAT)
                chat = [{k: v for k, v in m.items() if k[0] != '_'} for m in pool if ve(m)][-40 if since else -15:]
                A = _agg(now)
                chs = A['chs']
                shc = CL['sh'] if CLUSTER and CL['sh'] else A['sh']
                el = CL['pol'] if CLUSTER and NODE != 1 and CL['pol'] else {'ronda': POL['ronda'], 'fim': POL['fim'], 'n': len(POL['cands'])}
                ds = int(_num(d.get('dsince'), 0, 1e12))
                ded = [x for x in DED if x['id'] > ds][-20:] if ds else list(DED)[-12:]
                return self.send_json(200, {'me': uid, 'nick': nick, 'online': max(len(PLAYERS), CL['online']) if CLUSTER else len(PLAYERS), 'players': PS_MARCA, '_psj': psj, 'sh': sh, 'shOn': A['sh'].get(sh, 1),
                                            'shards': sorted(shc.items())[:30], 'shCap': SHARD_CAP, 'needCfg': not st.get('cfg'), 'sus': uid in SUS,
                                            'chat': chat, 'mute': max(0, round(MUTE.get(uid, 0) - now)),
                                            'srv': now, 'pm': POLL_MUL, 'chs': chs, 'ded': ded, 'adsV': ADS_V[0],
                                            'wl': cr['wl'], 'cad': max(0, round(cr['cad'] - now)), 'ev': EVQ.pop(uid, []),
                                            'gov': GOV[0], 'polOn': A['pol'],
                                            'eleicao': {'ronda': el['ronda'], 'fim': max(0, round(el['fim'] - now)), 'n': el['n']},
                                            'all': [{k: o.get(k) for k in ('id', 'nick', 'room', 'job', 'wl', 'pol', 'gt', 'cad', 'vh')}
                                                    for o in PLAYERS.values() if o.get('sh') == sh][:200] if d.get('all') else None})
            nick = NICKC.get(uid, (None, nome_conta))[1]
            st = PLAYERS.get(uid)
            if p in ('/api/crime', '/api/prender', '/api/fianca', '/api/amigos', '/api/grupo', '/api/pol', '/api/social'):
                return self.vida(p, d, uid, nick, st, now)
            if p == '/api/voz':
                return self.voz(d, uid, nick, st, now)
            if p == '/api/ads/new':
                if MUTE.get(uid, 0) > now:
                    return self.send_json(200, {'ok': False, 'erro': f'Estás silenciado(a) por mais {round(MUTE[uid] - now)} s.'})
                if now - LASTAD.get(uid, 0) < 45:
                    return self.send_json(200, {'ok': False, 'erro': f'Espera {round(45 - (now - LASTAD[uid]))} s para publicar outro anúncio.'})
                fmt = str(d.get('fmt') or 'poster')
                if fmt not in AD_FMT:
                    return self.send_json(200, {'ok': False, 'erro': 'Formato inválido.'})
                campos = {}
                bad = []
                for k, mx in (('t', 28), ('s', 60), ('cta', 24), ('marca', 24)):
                    raw = str(d.get(k) or '').strip()[:mx]
                    limpo, hits, bloq, motivo = filtrar(raw) if raw else ('', 0, False, '')
                    if hits or bloq:
                        bad.append(motivo or 'ofensa')
                    campos[k] = limpo
                if bad:
                    s_ = [t for t in STRIKES.get(uid, []) if now - t < 300] + [now]; STRIKES[uid] = s_
                    if len(s_) >= 3:
                        MUTE[uid] = now + 90; STRIKES[uid] = []
                    return self.send_json(200, {'ok': False, 'erro': 'A agência recusou o anúncio: linguagem ofensiva, links ou contactos não são permitidos.'})
                if not campos['t']:
                    return self.send_json(200, {'ok': False, 'erro': 'O anúncio precisa de um título.'})
                with db() as c:
                    n = c.execute('SELECT COUNT(*) FROM ads WHERE uid=? AND exp>?', (uid, now)).fetchone()[0]
                    if n >= 4:
                        return self.send_json(200, {'ok': False, 'erro': 'Já tens 4 anúncios no ar. Espera que algum termine.'})
                    campos.update({'fmt': fmt, 'tpl': re.sub(r'[^a-z0-9]', '', str(d.get('tpl') or 'classico'))[:16],
                                   'cor': re.sub(r'[^#0-9a-fA-F]', '', str(d.get('cor') or '#c8102e'))[:7],
                                   'ico': re.sub(r'[^a-z0-9_]', '', str(d.get('ico') or 'megaphone'))[:20],
                                   'cat': re.sub(r'[^a-z]', '', str(d.get('cat') or 'pessoal'))[:12]})
                    nick = NICKC.get(uid, (None, nome_conta))[1]
                    cur = c.execute('INSERT INTO ads(uid,nick,data,criado,exp) VALUES(?,?,?,?,?)', (uid, nick, json.dumps(campos), now, now + AD_FMT[fmt][0]))
                    aid = cur.lastrowid
                LASTAD[uid] = now
                ADS_V[0] = max(ADS_V[0] + 1, aid or 0)
                _gsys(f'{nick} publicou um anúncio: “{campos["t"]}”')
                campos.update({'id': aid, 'nick': nick, 'exp': now + AD_FMT[fmt][0], 'criado': now})
                return self.send_json(200, {'ok': True, 'ad': campos})
            if p == '/api/ded':
                if MUTE.get(uid, 0) > now:
                    return self.send_json(200, {'ok': False, 'erro': f'Estás silenciado(a) por mais {round(MUTE[uid] - now)} s.'})
                if now - LASTDED.get(uid, 0) < 30:
                    return self.send_json(200, {'ok': False, 'erro': f'Espera {round(30 - (now - LASTDED[uid]))} s para fazer outra dedicatória.'})
                ch = str(d.get('ch') or '')[:24]
                para, hp, bp, _ = filtrar(str(d.get('para') or '')[:30])
                txt, ht, bt, motivo = filtrar(str(d.get('txt') or '')[:100])
                if hp or ht or bp or bt or not para or not ch:
                    if hp or ht:
                        s_ = [t for t in STRIKES.get(uid, []) if now - t < 300] + [now]; STRIKES[uid] = s_
                        if len(s_) >= 3:
                            MUTE[uid] = now + 90; STRIKES[uid] = []
                    return self.send_json(200, {'ok': False, 'erro': 'A rádio recusou a dedicatória: ' + (motivo if (bt and motivo and motivo != 'vazio') else 'linguagem ofensiva ou campos vazios.')})
                LASTDED[uid] = now
                DSEQ[0] += 1
                x = {'id': DSEQ[0], 'ch': ch, 'nick': NICKC.get(uid, (None, nome_conta))[1], 'para': para, 'txt': txt, 't': now}
                DED.append(x)
                return self.send_json(200, {'ok': True, 'ded': x})
            # ----- enviar mensagem -----
            if MUTE.get(uid, 0) > now:
                return self.send_json(200, {'ok': False, 'erro': f'Estás silenciado(a) por mais {round(MUTE[uid] - now)} s por linguagem ofensiva.', 'mute': round(MUTE[uid] - now)})
            txt = str(d.get('txt') or '')
            last = LASTMSG.get(uid)
            if last and now - last[1] < 1.2:
                return self.send_json(200, {'ok': False, 'erro': 'Calma! Espera um segundo entre mensagens.'})
            limpo, hits, bloq, motivo = filtrar(txt)
            if not bloq and last and last[0] == limpo.lower() and now - last[1] < 30:
                rep = last[2] + 1
                if rep >= 2:
                    return self.send_json(200, {'ok': False, 'erro': 'Não repitas a mesma mensagem (spam).'})
            else:
                rep = 0
            aviso = None
            if hits:
                s = [t for t in STRIKES.get(uid, []) if now - t < 300] + [now]
                STRIKES[uid] = s
                if len(s) >= 3:
                    MUTE[uid] = now + 90; STRIKES[uid] = []
                    return self.send_json(200, {'ok': False, 'erro': 'Foste silenciado(a) durante 90 s por linguagem ofensiva.', 'mute': 90})
                aviso = f'Linguagem ofensiva filtrada. Aviso {len(s)}/3: à terceira ficas silenciado(a).'
            if bloq:
                return self.send_json(200, {'ok': False, 'erro': motivo if motivo != 'vazio' else 'Mensagem vazia.', 'aviso': aviso})
            LASTMSG[uid] = (limpo.lower(), now, rep)
            st = PLAYERS.get(uid)
            nick = NICKC.get(uid, (None, nome_conta))[1]
            SEQ[0] += 1
            sc = d.get('scope') if d.get('scope') in ('perto', 'grupo') else 'todos'
            gt = GTAG.get(uid)
            if sc == 'grupo' and not gt:
                return self.send_json(200, {'ok': False, 'erro': 'Não pertences a nenhum grupo. Cria ou entra num grupo no painel Cidade.'})
            m = {'id': SEQ[0], 'uid': uid, 'nick': (f'[{gt[0]}] ' if sc == 'grupo' else '') + nick, 'txt': limpo, 'room': st['room'] if st else 'rua', 't': now, 'sc': sc,
                 '_x': st['x'] if st else 0, '_z': st['z'] if st else 0, '_g': gt[1] if gt else None, '_sh': (st.get('sh') if st and sc != 'grupo' else None)}
            CHAT.append(m)
            ouv = sum(1 for o in PLAYERS.values() if o['id'] != uid and st and o.get('sh') == st.get('sh') and o['room'] == st['room'] and (o['x'] - st['x']) ** 2 + (o['z'] - st['z']) ** 2 <= PERTO ** 2) if sc == 'perto' else None
            return self.send_json(200, {'ok': True, 'msg': {k: v for k, v in m.items() if k[0] != '_'}, 'aviso': aviso, 'ouvintes': ouv})

    # ---------- mensagens de voz ----------
    def voz(self, d, uid, nick, st, now):
        """chamado dentro de MP_LOCK. Áudio gravado no browser (MediaRecorder), guardado só em memória durante VOZ_TTL."""
        for k in [k for k, v in VOZ.items() if now - v['t'] > VOZ_TTL]:
            VOZ_TOTAL[0] -= len(VOZ.pop(k)['b'])
        op = str(d.get('op') or 'enviar')
        if op == 'ouvir':
            v = VOZ.get(str(d.get('id') or '')[:24])
            if not v:
                return self.send_json(200, {'ok': False, 'erro': 'Esta mensagem de voz já expirou.'})
            gt = GTAG.get(uid)
            pode = v['uid'] == uid or (v['g'] and gt and gt[1] == v['g']) or (st and st.get('sh') == v['sh'] and st['room'] == v['room'] and
                   (v['room'] != 'rua' or (st['x'] - v['x']) ** 2 + (st['z'] - v['z']) ** 2 <= (PERTO * 2) ** 2))
            if not pode:
                return self.send_json(200, {'ok': False, 'erro': 'Só quem estava na mesma sala pode ouvir.'})
            return self.send_json(200, {'ok': True, 'mime': v['mime'], 'a': base64.b64encode(v['b']).decode()})
        if op == 'denunciar':
            v = VOZ.get(str(d.get('id') or '')[:24])
            if not v or v['uid'] == uid:
                return self.send_json(200, {'ok': False, 'erro': 'Não é possível denunciar esta mensagem.'})
            rs = [r for r in VOZREP.get(v['uid'], []) if now - r[1] < 600 and r[0] != uid] + [(uid, now)]
            VOZREP[v['uid']] = rs
            if len(rs) >= 3:
                VOZBAN[v['uid']] = now + 900; VOZREP[v['uid']] = []
                for k in [k for k, x in VOZ.items() if x['uid'] == v['uid']]:
                    VOZ_TOTAL[0] -= len(VOZ.pop(k)['b'])
            return self.send_json(200, {'ok': True, 'msg': 'Obrigado. A denúncia foi registada; 3 denúncias bloqueiam a voz desse jogador durante 15 min.'})
        # ----- enviar -----
        if MUTE.get(uid, 0) > now:
            return self.send_json(200, {'ok': False, 'erro': f'Estás silenciado(a) por mais {round(MUTE[uid] - now)} s.'})
        if VOZBAN.get(uid, 0) > now:
            return self.send_json(200, {'ok': False, 'erro': f'A tua voz foi bloqueada por denúncias. Volta a tentar daqui a {round((VOZBAN[uid] - now) / 60) or 1} min.'})
        if not st:
            return self.send_json(200, {'ok': False, 'erro': 'Ainda não estás ligado(a) à cidade.'})
        if now - LASTVOZ.get(uid, 0) < 3:
            return self.send_json(200, {'ok': False, 'erro': 'Espera um pouco entre mensagens de voz.'})
        mime = str(d.get('mime') or '').split(';')[0].strip().lower()
        if mime not in VOZ_MIME:
            return self.send_json(200, {'ok': False, 'erro': 'Formato de áudio não suportado.'})
        try:
            b = base64.b64decode(str(d.get('a') or ''), validate=True)
        except Exception:
            return self.send_json(200, {'ok': False, 'erro': 'Áudio inválido.'})
        if len(b) < 600 or len(b) > VOZ_MAXB:
            return self.send_json(200, {'ok': False, 'erro': 'A mensagem de voz é demasiado curta ou demasiado longa (máx. 15 s).'})
        mg = VOZ_MIME[mime]
        if (mg and not b.startswith(mg)) or (mime == 'audio/mp4' and b[4:8] != b'ftyp'):
            return self.send_json(200, {'ok': False, 'erro': 'Áudio inválido.'})
        dur = round(_num(d.get('dur'), .3, VOZ_DUR + .5), 1)
        sc = 'grupo' if d.get('scope') == 'grupo' else 'sala'
        gt = GTAG.get(uid)
        if sc == 'grupo' and not gt:
            return self.send_json(200, {'ok': False, 'erro': 'Não pertences a nenhum grupo.'})
        while VOZ and VOZ_TOTAL[0] + len(b) > VOZ_CAP:
            VOZ_TOTAL[0] -= len(VOZ.popitem(last=False)[1]['b'])
        vid = secrets.token_urlsafe(9)
        VOZ[vid] = {'t': now, 'uid': uid, 'mime': mime, 'b': b, 'room': st['room'], 'sh': st.get('sh'), 'x': st['x'], 'z': st['z'], 'g': gt[1] if (gt and sc == 'grupo') else None}
        VOZ_TOTAL[0] += len(b)
        LASTVOZ[uid] = now
        SEQ[0] += 1
        m = {'id': SEQ[0], 'uid': uid, 'nick': (f'[{gt[0]}] ' if sc == 'grupo' else '') + nick, 'txt': '🎤 Mensagem de voz', 'room': st['room'], 't': now, 'sc': sc,
             'vz': {'id': vid, 'd': dur}, '_x': st['x'], '_z': st['z'], '_g': gt[1] if gt else None, '_sh': (st.get('sh') if sc != 'grupo' else None)}
        CHAT.append(m)
        if sc == 'grupo':
            ouv = None
        else:
            ouv = sum(1 for o in PLAYERS.values() if o['id'] != uid and o.get('sh') == st.get('sh') and o['room'] == st['room'] and
                      (st['room'] != 'rua' or (o['x'] - st['x']) ** 2 + (o['z'] - st['z']) ** 2 <= PERTO ** 2))
        return self.send_json(200, {'ok': True, 'msg': {k: v for k, v in m.items() if k[0] != '_'}, 'ouvintes': ouv})

    # ---------- perfil público de um jogador ----------
    def perfil(self, uid, fid, now):
        if not fid:
            return self.send_json(200, {'ok': False, 'erro': 'Jogador(a) inválido(a).'})
        hit = PFC.get(fid)
        try:
            with db() as c:
                r = c.execute('SELECT id, nome, criado, adulto FROM users WHERE id=?', (fid,)).fetchone()
                if not r:
                    return self.send_json(200, {'ok': False, 'erro': 'Jogador(a) não encontrado(a).'})
                if not hit or now - hit[0] > 20:
                    sv = c.execute('SELECT save FROM users WHERE id=?', (fid,)).fetchone()
                    hit = PFC[fid] = (now, _pf_extract(sv[0] if sv else None))
                    if len(PFC) > 5000:
                        for k in sorted(PFC, key=lambda k: PFC[k][0])[:1000]:
                            PFC.pop(k, None)
                rp = _rep_get(c, fid)
                nam = c.execute('SELECT COUNT(*) FROM amigos WHERE uid=? AND ok=1', (fid,)).fetchone()[0]
                eu = c.execute('SELECT ok FROM amigos WHERE uid=? AND fid=?', (uid, fid)).fetchone()
                ele = c.execute('SELECT ok FROM amigos WHERE uid=? AND fid=?', (fid, uid)).fetchone()
                rel = 'amigos' if (eu and eu[0]) else 'enviado' if eu else 'pedido' if ele else 'nada'
                gm = c.execute('SELECT g.nome, g.tag, g.tipo, m.cargo FROM membros m JOIN grupos g ON g.id=m.gid WHERE m.uid=?', (fid,)).fetchone()
                nome = _nome(c, fid)
        except pedb.DBError:
            return self.send_json(200, {'ok': False, 'erro': 'Servidor ocupado, tenta outra vez.'})
        o = PLAYERS.get(fid)
        out = {'ok': True, 'id': fid, 'nick': nome, 'desde': r[2], 'adulto': bool(r[3]), 'on': bool(o) or fid in CL['on'],
               'room': o.get('room') if o else None, 'job': o.get('job') if o else None, 'wl': o.get('wl', 0) if o else 0, 'pol': bool(o and o.get('pol')),
               'sh': o.get('sh') if o else None, 'rep': int(rp.get('n') or 0), 'deiRep': rp.get('by', {}).get(str(uid)) == time.strftime('%Y-%m-%d'),
               'amigos': nam, 'rel': rel, 'eu': fid == uid,
               'grupo': {'nome': gm[0], 'tag': gm[1], 'tipo': gm[2], 'cargo': gm[3]} if gm else None, 'vida': hit[1]}
        return self.send_json(200, out)

    # ---------- vida real ----------
    def vida(self, p, d, uid, nick, st, now):
        J = lambda o: self.send_json(200, o)
        E = lambda t: self.send_json(200, {'ok': False, 'erro': t})
        cr = _crim(uid, now)
        if p == '/api/crime':
            if not st or st.get('room') is None:
                return E('Entra na cidade primeiro.')
            if cr['cad'] > now:
                return E(f'Estás preso(a)! Faltam {round(cr["cad"] - now)} s.')
            if st.get('pol'):
                return E('Um(a) agente em serviço não pode cometer crimes. Sai de serviço primeiro.')
            if now - LASTCRIME.get(uid, 0) < 8:
                return E(f'Calma! A cidade está atenta. Espera {round(8 - (now - LASTCRIME[uid]))} s.')
            tipo = str(d.get('tipo') or '')
            if tipo not in CRIME_T:
                return E('Crime desconhecido.')
            stars, pok, lo, hi, pnpc, tnome = CRIME_T[tipo]
            alvo, aid = None, 0
            if tipo in ('carteira', 'assalto'):
                aid = int(_num(d.get('alvo'), 0, 1e12))
                alvo = PLAYERS.get(aid)
                if not alvo or aid == uid or alvo.get('sh') != st.get('sh') or alvo['room'] != st['room'] or _d2(alvo, st) > 4.5 ** 2:
                    return E('A vítima tem de estar mesmo ao teu lado (menos de 4 m).')
                if CRIM.get(aid, {}).get('cad', 0) > now:
                    return E('Essa pessoa está presa.')
                if alvo.get('pol'):
                    return E('Não podes assaltar um(a) agente da polícia em serviço.')
            LASTCRIME[uid] = now
            pols = [o for o in PLAYERS.values() if o.get('pol') and o['id'] != uid and o.get('sh') == st.get('sh')]
            perto = [o for o in pols if o['room'] == st['room'] and _d2(o, st) < 30 ** 2]
            ok = random.random() < pok - (.25 if perto else 0)
            cr['wl'] = min(5, cr['wl'] + stars + (0 if ok else 1))
            cr['wlT'] = now
            seg = bool(GOV[0] and GOV[0].get('orc') == 'seguranca')
            pn = (pnpc + cr['wl'] * .04 + (.1 if seg else 0)) * (.35 if pols else 1)
            preso = random.random() < pn
            v = random.randint(lo, hi) if ok else 0
            if alvo:
                devA, ipA = _ident_mem(uid); devB, ipB = _ident_mem(aid)
                if devA and devB and devA == devB:
                    return E('Sem efeito: essa conta pertence ao mesmo aparelho.')
                if ipA and ipB and ipA == ipB:
                    v = min(v, 5000)   # mesma rede (família/café): saque simbólico
                v = min(v, int(alvo.get('kz', v)))   # não se rouba dinheiro que a vítima não tem
                _ev(aid, {'t': 'roubado' if ok else 'tentativa', 'de': nick, 'id': uid, 'v': v, 'tipo': tipo})
            secs, wl0 = 0, cr['wl']
            if preso:
                secs = CAD_POR_WL * cr['wl']
                cr['cad'] = now + secs
                cr['wl'] = 0
                _sys(f'🚔 A polícia apanhou {nick} em flagrante ({tnome}).', st.get('sh'))
            else:
                for o in pols:
                    _ev(o['id'], {'t': 'alerta', 'de': nick, 'id': uid, 'tipo': tipo, 'tn': tnome, 'wl': cr['wl'], 'x': st['x'], 'z': st['z'], 'room': st['room']})
            return J({'ok': True, 'sucesso': ok, 'v': v, 'wl': cr['wl'], 'wl0': wl0, 'preso': preso, 'secs': secs,
                      'pol': len(pols), 'perto': len(perto), 'seg': seg, 'vitima': alvo['nick'] if alvo else None})
        if p == '/api/prender':
            if not st or not st.get('pol'):
                return E('Só agentes em serviço podem prender.')
            aid = int(_num(d.get('alvo'), 0, 1e12))
            alvo, ca = PLAYERS.get(aid), CRIM.get(aid)
            if not alvo or alvo.get('sh') != st.get('sh') or alvo['room'] != st['room'] or _d2(alvo, st) > 5 ** 2:
                return E('Tens de estar ao lado do suspeito (menos de 5 m).')
            if ca:
                _crim(aid, now)
            if ca and ca['cad'] > now:
                return E('Essa pessoa já está presa.')
            if not ca or ca['wl'] <= 0:
                return E('Esta pessoa não é procurada. Prender inocentes é abuso de poder!')
            wl = ca['wl']
            secs = CAD_POR_WL * wl
            ca['cad'] = now + secs
            ca['wl'] = 0
            _ev(aid, {'t': 'preso', 'por': nick, 's': secs, 'wl': wl})
            _sys(f'🚔 {nick} prendeu {alvo["nick"]} ({wl} estrela(s) de procurado).', st.get('sh'))
            return J({'ok': True, 'wl': wl, 'premio': 15000 * wl, 'secs': secs, 'nick': alvo['nick']})
        if p == '/api/fianca':
            cr['cad'] = 0
            return J({'ok': True})
        if p == '/api/social':
            op = str(d.get('op') or '')
            fid = int(_num(d.get('fid'), 0, 1e12))
            if not fid or fid == uid:
                return E('Jogador(a) inválido(a).')
            on = fid in PLAYERS or fid in CL['on']
            if op == 'bloq_info':
                return J({'ok': True})
            if op == 'denuncia':
                rs = REPORTS.setdefault(fid, {})
                rs[uid] = now
                for k in [k for k, t in rs.items() if now - t > 600]:
                    rs.pop(k, None)
                motivo = re.sub(r'[^\w À-ÿ,.!?-]', '', str(d.get('motivo') or ''))[:60]
                try:
                    with open(os.path.join(DATA, 'denuncias.log'), 'a', encoding='utf-8') as f:
                        f.write(f'{time.strftime("%Y-%m-%d %H:%M:%S")}\t{uid}\t{nick}\t->\t{fid}\t{motivo}\n')
                except Exception:
                    pass
                if len(rs) >= 3:
                    MUTE[fid] = max(MUTE.get(fid, 0), now + 300)
                    REPORTS[fid] = {}
                return J({'ok': True})
            if not on:
                return E('Essa pessoa não está online agora.')
            if op == 'acao':
                a = str(d.get('a') or '')
                if a not in SOC_ACOES:
                    return E('Ação inválida.')
                k = (uid, fid, a)
                if now - SOCT.get(k, 0) < (10 if a != 'respeito' else 3):
                    return E('Calma! Espera uns segundos antes de repetir.')
                SOCT[k] = now
                if len(SOCT) > 50000:
                    for kk in [kk for kk, t in SOCT.items() if now - t > 120]:
                        SOCT.pop(kk, None)
                extra = {}
                if a == 'respeito':
                    hoje = time.strftime('%Y-%m-%d')
                    with db() as c:
                        rp = _rep_get(c, fid)
                        by = rp.get('by') or {}
                        if by.get(str(uid)) == hoje:
                            return E('Já deste respeito a esta pessoa hoje. Volta amanhã.')
                        by[str(uid)] = hoje
                        if len(by) > 400:
                            by = dict(sorted(by.items(), key=lambda t: t[1])[-300:])
                        rp = {'n': int(rp.get('n') or 0) + 1, 'by': by}
                        c.execute('INSERT OR REPLACE INTO kv VALUES(?, ?)', (f'rep:{fid}', json.dumps(rp)))
                    extra['rep'] = rp['n']
                    PFC.pop(fid, None)
                _ev(fid, dict({'t': 'social', 'a': a, 'de': nick, 'id': uid}, **extra))
                return J(dict({'ok': True}, **extra))
            if op == 'kz':
                v = int(_num(d.get('v'), 0, KZ_MAX))
                if v < 100:
                    return E(f'Podes enviar entre 100 Kz e {KZ_MAX:,} Kz de cada vez.'.replace(',', ' '))
                if uid in SUS:
                    return E('A tua conta está em revisão: transferências bloqueadas.')
                devA, ipA = _ident_mem(uid); devB, ipB = _ident_mem(fid)
                if not ipB:
                    try:
                        with db() as c2:
                            idb = _ident_get(c2, fid)
                        ipB = (idb.get('ips') or [''])[-1]; devB = devB or idb.get('dev', '')
                    except Exception:
                        pass
                if devA and devB and devA == devB:
                    return E('Não podes enviar dinheiro entre contas do mesmo aparelho.')
                mesmo_ip = bool(ipA and ipB and ipA == ipB)
                if mesmo_ip:
                    dia = time.strftime('%Y-%m-%d')
                    par = KZIP.get((uid, fid))
                    totp = par[1] if par and par[0] == dia else 0
                    if totp + v > KZIP_DIA:
                        SUS[uid] = 'funil de Kz entre contas no mesmo IP'
                        return E(f'Contas na mesma rede podem trocar no máximo {KZIP_DIA:,} Kz/dia.'.replace(',', ' '))
                tem = KZH.get(uid, (0, 0))[1]
                if v > tem:
                    return E('Não tens esse dinheiro na carteira.')
                dia = time.strftime('%Y-%m-%d')
                dd_ = KZDAY.get(uid)
                tot = dd_[1] if dd_ and dd_[0] == dia else 0
                if tot + v > KZ_DIA:
                    return E(f'Limite diário de transferências: {KZ_DIA:,} Kz.'.replace(',', ' '))
                KZDAY[uid] = (dia, tot + v)
                if mesmo_ip:
                    KZIP[(uid, fid)] = (dia, totp + v)   # só conta transferências que aconteceram
                KZH[uid] = (now, tem - v)
                if fid in KZH:
                    KZH[fid] = (KZH[fid][0], KZH[fid][1] + v)   # o salto na carteira de quem recebe não conta como batota
                _ev(fid, {'t': 'kz', 'v': v, 'de': nick, 'id': uid})
                return J({'ok': True, 'v': v})
            if op == 'presente':
                g = str(d.get('g') or '')
                if g not in PRESENTES:
                    return E('Presente inválido.')
                if now - SOCT.get((uid, fid, 'pr'), 0) < 8:
                    return E('Calma! Espera uns segundos antes de oferecer outro presente.')
                SOCT[(uid, fid, 'pr')] = now
                _ev(fid, {'t': 'presente', 'g': g, 'de': nick, 'id': uid})
                return J({'ok': True})
            if op in ('emp_conv', 'emp_ok', 'emp_nao'):
                if op == 'emp_conv':
                    if now - SOCT.get((uid, fid, 'emp'), 0) < 30:
                        return E('Já convidaste esta pessoa há pouco.')
                    SOCT[(uid, fid, 'emp')] = now
                emp = re.sub(r'[^\w À-ÿ&.,()-]', '', str(d.get('emp') or ''))[:40] or 'a minha empresa'
                _ev(fid, {'t': op, 'de': nick, 'id': uid, 'emp': emp, 'sal': int(_num(d.get('sal'), 0, 2e7))})
                return J({'ok': True})
            if op == 'desafio':
                tp = str(d.get('tipo') or '')
                if tp not in DESAFIOS:
                    return E('Desafio inválido.')
                ap = int(_num(d.get('aposta'), 0, 1_000_000))
                if ap and KZH.get(uid, (0, 0))[1] < ap:
                    return E('Não tens dinheiro para essa aposta.')
                if now - SOCT.get((uid, fid, 'des'), 0) < 20:
                    return E('Já desafiaste esta pessoa há pouco. Espera pela resposta.')
                SOCT[(uid, fid, 'des')] = now
                DESP[(uid, fid)] = {'t': now, 'tipo': tp, 'ap': ap, 'st': int(_num(d.get('st'), 0, 100)), 'nick': nick}
                if len(DESP) > 20000:
                    for k in [k for k, v in DESP.items() if now - v['t'] > 300]:
                        DESP.pop(k, None)
                _ev(fid, {'t': 'desafio', 'tipo': tp, 'aposta': ap, 'de': nick, 'id': uid})
                return J({'ok': True})
            if op in ('desafio_ok', 'desafio_nao'):
                ds = DESP.pop((fid, uid), None)
                if not ds or now - ds['t'] > 300:
                    return E('Esse desafio já expirou.')
                if op == 'desafio_nao':
                    _ev(fid, {'t': 'desafio_nao', 'de': nick, 'id': uid, 'tipo': ds['tipo']})
                    return J({'ok': True})
                ap = ds['ap']
                if ap and (KZH.get(uid, (0, 0))[1] < ap or KZH.get(fid, (0, 0))[1] < ap):
                    _ev(fid, {'t': 'desafio_nao', 'de': nick, 'id': uid, 'tipo': ds['tipo'], 'sem': 1})
                    return E('Alguém já não tem dinheiro para a aposta. O desafio foi cancelado.')
                meu = int(_num(d.get('st'), 0, 100))
                pa = max(.12, min(.88, .5 + (ds['st'] - meu) / 220))   # probabilidade de o desafiante ganhar
                ganhou_a = random.random() < pa
                if ap:
                    a0, b0 = KZH.get(fid, (now, 0)), KZH.get(uid, (now, 0))
                    KZH[fid] = (a0[0], a0[1] + (ap if ganhou_a else -ap))
                    KZH[uid] = (b0[0], b0[1] + (-ap if ganhou_a else ap))
                sa, sb = ds['st'], meu
                _ev(fid, {'t': 'desafio_res', 'win': ganhou_a, 'v': ap, 'tipo': ds['tipo'], 'vs': nick, 'id': uid, 'eu': sa, 'ele': sb})
                return J({'ok': True, 'win': not ganhou_a, 'v': ap, 'tipo': ds['tipo'], 'vs': ds['nick'], 'eu': sb, 'ele': sa})
            if op == 'grupo_conv':
                gt = GTAG.get(uid)
                if not gt:
                    return E('Não pertences a nenhum grupo.')
                if now - SOCT.get((uid, fid, 'gc'), 0) < 30:
                    return E('Já convidaste esta pessoa há pouco.')
                SOCT[(uid, fid, 'gc')] = now
                _ev(fid, {'t': 'grupo_conv', 'de': nick, 'id': uid, 'gid': gt[1], 'tag': gt[0]})
                return J({'ok': True})
            if op in ('namoro', 'namoro_ok', 'namoro_nao', 'namoro_fim', 'casou'):
                info = d.get('info') if isinstance(d.get('info'), dict) else {}
                info = {'idade': int(_num(info.get('idade'), 0, 130)), 'g': 'F' if info.get('g') == 'F' else 'M', 'cls': int(_num(info.get('cls'), 0, 5)),
                        'job': re.sub(r'[^\w À-ÿ()-]', '', str(info.get('job') or ''))[:30] or None}
                if op in ('namoro', 'namoro_ok'):
                    with db() as c:
                        ad = c.execute('SELECT adulto FROM users WHERE id IN (?, ?)', (uid, fid)).fetchall()
                    if len(ad) < 2 or not all(x[0] for x in ad):
                        return E('Namoros só entre contas +18.')
                if op == 'namoro':
                    if now - SOCT.get((uid, fid, 'nam'), 0) < 60:
                        return E('Já fizeste o pedido. Espera pela resposta.')
                    SOCT[(uid, fid, 'nam')] = now
                    NAMP[(uid, fid)] = {'t': now, 'info': info}
                    _ev(fid, {'t': 'namoro', 'de': nick, 'id': uid, 'info': info})
                    return J({'ok': True})
                if op in ('namoro_ok', 'namoro_nao'):
                    pend = NAMP.pop((fid, uid), None)
                    if not pend or now - pend['t'] > 900:
                        return E('Esse pedido já expirou.')
                    _ev(fid, {'t': op, 'de': nick, 'id': uid, 'info': info})
                    return J({'ok': True, 'info': pend['info']})
                _ev(fid, {'t': op, 'de': nick, 'id': uid})
                return J({'ok': True})
            return E('Operação inválida.')
        if p == '/api/amigos':
            op = str(d.get('op') or 'list')
            with db() as c:
                if op in ('add', 'del'):
                    fid = int(_num(d.get('fid'), 0, 1e12))
                    if not fid and d.get('nick'):
                        n = str(d['nick']).strip().lower()
                        fid = next((o['id'] for o in PLAYERS.values() if o['nick'].lower() == n), 0)
                        if not fid:   # está noutra cidade paralela / noutro nó: procura pelo nome da conta
                            r_ = c.execute('SELECT id FROM users WHERE lower(nome)=lower(?) ORDER BY id LIMIT 1', (n,)).fetchone()
                            fid = r_[0] if r_ else 0
                    if not fid or fid == uid or not c.execute('SELECT 1 FROM users WHERE id=?', (fid,)).fetchone():
                        return E('Jogador(a) não encontrado(a). Tem de estar online.')
                    if op == 'del':
                        c.execute('DELETE FROM amigos WHERE (uid=? AND fid=?) OR (uid=? AND fid=?)', (uid, fid, fid, uid))
                        return J({'ok': True})
                    if c.execute('SELECT 1 FROM amigos WHERE uid=? AND fid=?', (fid, uid)).fetchone():
                        c.execute('INSERT OR REPLACE INTO amigos VALUES(?,?,1,?)', (uid, fid, now))
                        c.execute('UPDATE amigos SET ok=1 WHERE uid=? AND fid=?', (fid, uid))
                        _ev(fid, {'t': 'amigo_ok', 'de': nick, 'id': uid})
                        return J({'ok': True, 'estado': 'amigos', 'nick': _nome(c, fid)})
                    c.execute('INSERT OR IGNORE INTO amigos VALUES(?,?,0,?)', (uid, fid, now))
                    _ev(fid, {'t': 'pedido', 'de': nick, 'id': uid})
                    return J({'ok': True, 'estado': 'pedido', 'nick': _nome(c, fid)})
                mine = c.execute('SELECT fid, ok FROM amigos WHERE uid=?', (uid,)).fetchall()
                inc = c.execute('SELECT uid FROM amigos WHERE fid=? AND ok=0', (uid,)).fetchall()
                mf = {r[0] for r in mine}
                def info(i):
                    o = PLAYERS.get(i)
                    return {'id': i, 'nick': _nome(c, i), 'on': bool(o) or i in CL['on'], 'room': o['room'] if o else None, 'job': o.get('job') if o else None,
                            'wl': o.get('wl') if o else 0, 'gt': o.get('gt') if o else None}
                return J({'ok': True, 'amigos': [info(r[0]) for r in mine if r[1]], 'enviados': [info(r[0]) for r in mine if not r[1]],
                          'pedidos': [info(r[0]) for r in inc if r[0] not in mf]})
        if p == '/api/grupo':
            op = str(d.get('op') or 'meu')
            with db() as c:
                gt = _gtag(c, uid)
                if op == 'lista':
                    rs = c.execute('SELECT g.*, (SELECT COUNT(*) FROM membros m WHERE m.gid=g.id) n FROM grupos g ORDER BY n DESC, g.id LIMIT 40').fetchall()
                    out = []
                    for r in rs:
                        ids = [x[0] for x in c.execute('SELECT uid FROM membros WHERE gid=?', (r['id'],)).fetchall()]
                        out.append({'id': r['id'], 'nome': r['nome'], 'tag': r['tag'], 'tipo': r['tipo'], 'lema': r['lema'], 'n': r['n'],
                                    'on': sum(1 for i in ids if i in PLAYERS or i in CL['on']), 'dono': _nome(c, r['dono'])})
                    return J({'ok': True, 'grupos': out, 'meu': gt[1] if gt else None})
                if op == 'meu':
                    if not gt:
                        return J({'ok': True, 'grupo': None})
                    g = c.execute('SELECT * FROM grupos WHERE id=?', (gt[1],)).fetchone()
                    ms = c.execute('SELECT uid, cargo, desde FROM membros WHERE gid=? ORDER BY desde', (gt[1],)).fetchall()
                    mem = [{'id': m[0], 'nick': _nome(c, m[0]), 'cargo': m[1], 'on': m[0] in PLAYERS or m[0] in CL['on'],
                            'room': PLAYERS[m[0]]['room'] if m[0] in PLAYERS else None, 'job': PLAYERS[m[0]].get('job') if m[0] in PLAYERS else None} for m in ms]
                    return J({'ok': True, 'grupo': {'id': g['id'], 'nome': g['nome'], 'tag': g['tag'], 'tipo': g['tipo'], 'lema': g['lema'],
                                                    'lider': g['dono'] == uid, 'membros': mem}})
                if op == 'criar':
                    if gt:
                        return E('Já pertences a um grupo. Sai primeiro.')
                    nome, h1, b1, _ = filtrar(str(d.get('nome') or '').strip()[:24])
                    lema, h2, b2, _ = filtrar(str(d.get('lema') or '').strip()[:60]) if d.get('lema') else ('', 0, False, '')
                    tag = re.sub(r'[^A-Z0-9]', '', str(d.get('tag') or '').upper())[:4]
                    tipo = str(d.get('tipo') or 'clube')
                    if h1 or h2 or b1 or b2:
                        return E('Nome ou lema recusado: linguagem ofensiva, links ou contactos.')
                    if len(nome) < 3 or len(tag) < 2 or tipo not in GTIPOS:
                        return E('O grupo precisa de nome (3+ letras), sigla (2 a 4 letras) e tipo.')
                    if c.execute('SELECT 1 FROM grupos WHERE nome=? COLLATE NOCASE OR tag=?', (nome, tag)).fetchone():
                        return E('Já existe um grupo com esse nome ou sigla.')
                    gid = c.execute('INSERT INTO grupos(nome,tag,tipo,dono,lema,criado) VALUES(?,?,?,?,?,?)', (nome, tag, tipo, uid, lema, now)).lastrowid
                    c.execute('INSERT OR REPLACE INTO membros VALUES(?,?,?,?)', (uid, gid, 'líder', now))
                    GTAG[uid] = (tag, gid, tipo)
                    _gsys(f'👥 {nick} fundou o grupo [{tag}] {nome}.')
                    return J({'ok': True, 'gid': gid, 'tag': tag})
                if op == 'entrar':
                    if gt:
                        return E('Já pertences a um grupo. Sai primeiro.')
                    gid = int(_num(d.get('gid'), 0, 1e12))
                    g = c.execute('SELECT * FROM grupos WHERE id=?', (gid,)).fetchone()
                    if not g:
                        return E('Grupo não encontrado.')
                    if c.execute('SELECT COUNT(*) FROM membros WHERE gid=?', (gid,)).fetchone()[0] >= 30:
                        return E('Este grupo já está cheio (30 membros).')
                    c.execute('INSERT OR REPLACE INTO membros VALUES(?,?,?,?)', (uid, gid, 'membro', now))
                    GTAG[uid] = (g['tag'], gid, g['tipo'])
                    _ev(g['dono'], {'t': 'grupo_entrou', 'de': nick})
                    return J({'ok': True, 'tag': g['tag']})
                if op in ('sair', 'expulsar'):
                    if not gt:
                        return E('Não pertences a nenhum grupo.')
                    g = c.execute('SELECT * FROM grupos WHERE id=?', (gt[1],)).fetchone()
                    quem = uid
                    if op == 'expulsar':
                        quem = int(_num(d.get('uid'), 0, 1e12))
                        if g['dono'] != uid or quem == uid:
                            return E('Só o(a) líder pode expulsar membros.')
                        if not c.execute('SELECT 1 FROM membros WHERE uid=? AND gid=?', (quem, gt[1])).fetchone():
                            return E('Essa pessoa não é do teu grupo.')
                        _ev(quem, {'t': 'expulso', 'g': g['nome']})
                    c.execute('DELETE FROM membros WHERE uid=?', (quem,))
                    GTAG.pop(quem, None)
                    if g['dono'] == quem:
                        nx = c.execute('SELECT uid FROM membros WHERE gid=? ORDER BY desde LIMIT 1', (g['id'],)).fetchone()
                        if nx:
                            c.execute('UPDATE grupos SET dono=? WHERE id=?', (nx[0], g['id']))
                            c.execute("UPDATE membros SET cargo='líder' WHERE uid=?", (nx[0],))
                        else:
                            c.execute('DELETE FROM grupos WHERE id=?', (g['id'],))
                    return J({'ok': True})
            return E('Operação inválida.')
        if p == '/api/pol':
            _pol_tick(now)
            op = str(d.get('op') or 'estado')
            if op == 'candidatar':
                if cr['wl'] > 0 or cr['cad'] > now:
                    return E('Procurados ou presos não se podem candidatar. Limpa o teu nome primeiro.')
                if uid in SUS:
                    return E('A tua conta está em revisão por suspeita de batota. Não te podes candidatar.')
                if uid in POL['cands']:
                    return E('Já és candidato(a) nesta eleição.')
                if len(POL['cands']) >= 12:
                    return E('Já há 12 candidatos nesta eleição. Tenta na próxima.')
                partido, h1, b1, _ = filtrar(str(d.get('partido') or '').strip()[:24])
                prom, h2, b2, _ = filtrar(str(d.get('promessa') or '').strip()[:90])
                if h1 or h2 or b1 or b2 or len(partido) < 2 or len(prom) < 4:
                    return E('Partido e promessa são obrigatórios e não podem ter ofensas, links ou contactos.')
                orc = d.get('orc') if d.get('orc') in ORCS else 'economia'
                POL['cands'][uid] = {'uid': uid, 'nick': nick, 'partido': partido, 'promessa': prom, 'orc': orc,
                                     'iva': int(_num(d.get('iva'), 7, 20)), 'votos': 0, 't': now}
                _gsys(f'🗳 {nick} ({partido}) é candidato(a) a Governador(a): “{prom}”')
            elif op == 'votar':
                cid = int(_num(d.get('cid'), 0, 1e12))
                if cid not in POL['cands']:
                    return E('Candidato(a) inválido(a).')
                if uid in POL['votou']:
                    return E('Já votaste nesta eleição. Um voto por pessoa!')
                if uid in SUS:
                    return E('A tua conta está em revisão por suspeita de batota.')
                if cr['cad'] > now:
                    return E('Presos não votam.')
                POL['votou'].add(uid)
                POL['cands'][cid]['votos'] += 1
            elif op == 'desistir':
                POL['cands'].pop(uid, None)
            cs = sorted(POL['cands'].values(), key=lambda x: (-x['votos'], x['t']))
            return J({'ok': True, 'gov': GOV[0], 'ronda': POL['ronda'], 'fim': max(0, round(POL['fim'] - now)),
                      'cands': [{k: v for k, v in x.items() if k != 't'} for x in cs], 'votei': uid in POL['votou'], 'souCand': uid in POL['cands']})
        return E('Rota desconhecida.')

    # ---------- rotas ----------
    def do_GET(self):
        if self.path.startswith('/api/') and '?' in self.path:
            self.path = self.path.split('?')[0]
        if self.path == '/api/ping':
            return self.send_json(200, {'ok': True, 'jogo': 'Próxima Encarnação', 'no': NODE, 'save_s': SAVE_S, 'pm': POLL_MUL})
        if self.path == '/api/me':
            with db() as c:
                u = self.user(c)
                if not u:
                    return self.send_json(401, {'erro': 'Sessão inválida. Entra outra vez.'})
                return self.send_json(200, {'user': public(u), 'save': json.loads(u['save']) if u['save'] else None,
                                            'meta': json.loads(u['meta']) if u['meta'] else None})
        if self.path == '/api/admin/contas':
            if not ADMIN_KEY or self.headers.get('X-Admin-Key', '') != ADMIN_KEY:
                return self.send_json(404, {'erro': 'Não encontrado'})
            grupos = {}
            with db() as c:
                for k, v in c.execute("SELECT k, v FROM kv WHERE k LIKE 'ident:%'").fetchall():
                    try:
                        uid = int(k.split(':')[1]); idn = json.loads(v)
                    except Exception:
                        continue
                    for chave in ([('dev', idn['dev'])] if idn.get('dev') else []) + [('ip', i) for i in (idn.get('ips') or [])]:
                        grupos.setdefault(chave, []).append(uid)
                sus = []
                for (tipo, hv), uids in grupos.items():
                    if len(set(uids)) > 1:
                        nomes = {r[0]: r[1] for r in c.execute('SELECT id, nome FROM users WHERE id IN (%s)' % ','.join('?' * len(set(uids))), tuple(set(uids))).fetchall()}
                        sus.append({'tipo': tipo, 'contas': [{'id': u, 'nome': nomes.get(u, '?'), 'suspeita': u in SUS} for u in sorted(set(uids))]})
            return self.send_json(200, {'grupos': sus, 'sus': SUS, 'agora': time.time()})
        if self.path == '/api/ads':
            return self.send_json(200, {'ads': ads_ativos(), 'v': ADS_V[0], 'srv': time.time()})
        if self.path.startswith('/api/'):
            return self.send_json(404, {'erro': 'Rota desconhecida'})
        low = self.path.split('?')[0].lower()
        if not (low in ('/', '') or low.startswith(('/3d/', '/img/')) or low == '/3d' or low in ('/index.html', '/proxima-encarnacao-standalone.html', '/proxima-encarnacao.html', '/proxima-encarnacao-3d-standalone.html', '/favicon.ico')) or '..' in low or '/.' in low:
            return self.send_json(404, {'erro': 'Não encontrado'})
        if self.path.split('?')[0] in ('/', ''):
            self.send_response(302); self.send_header('Location', '/3d/'); self.send_header('Content-Length', '0'); self.end_headers(); return
        if self.static_gz():
            return
        return super().do_GET()

    def do_POST(self):
        try:
            d = self.body()
        except Exception as e:
            return self.send_json(400, {'erro': str(e) or 'JSON inválido'})
        p = self.path.split('?')[0]
        self.path = p
        if p in ('/api/mp', '/api/chat', '/api/ded', '/api/ads/new', '/api/crime', '/api/prender', '/api/fianca', '/api/amigos', '/api/grupo', '/api/pol', '/api/social', '/api/voz'):
            return self.mp(p, d)
        if p == '/api/save':   # o pedido mais frequente depois do /api/mp: sessão em cache, 1 só UPDATE
            who = self.mp_uid()
            if not who:
                return self.send_json(401, {'erro': 'Sessão inválida. Entra outra vez.'})
            sets, args = [], []
            if 'save' in d:
                sets.append('save=?'); args.append(json.dumps(d['save'], separators=(',', ':')) if d['save'] else None)
            if 'meta' in d:
                sets.append('meta=?'); args.append(json.dumps(d['meta'], separators=(',', ':')))
            if sets:
                with db() as c:
                    c.execute(f"UPDATE users SET {', '.join(sets)} WHERE id=?", (*args, who[0]))
            return self.send_json(200, {'ok': True})
        if p == '/api/ano':   # fechar o ano: o servidor é a autoridade no limite de 3 por dia real
            who = self.mp_uid()
            if not who:
                return self.send_json(401, {'erro': 'Sessão inválida. Entra outra vez.'})
            uid = who[0]; now = time.time(); hoje = time.strftime('%Y-%m-%d')
            with db() as c:
                r = c.execute('SELECT dia,n,ts FROM anos WHERE uid=?', (uid,)).fetchone()
                dia, n, ts = (r[0], int(r[1]), float(r[2])) if r else (None, 0, 0)
                if dia != hoje:
                    n = 0
                if n >= 3:
                    return self.send_json(200, {'ok': 0, 'n': n, 'max': 3})
                if ts and now - ts < ANO_GAP:
                    return self.send_json(200, {'ok': 0, 'cedo': 1, 'espera': int(ANO_GAP - (now - ts))})
                c.execute('INSERT INTO anos(uid,dia,n,ts) VALUES(?,?,?,?) ON CONFLICT(uid) DO UPDATE SET dia=?,n=?,ts=?', (uid, hoje, n + 1, now, hoje, n + 1, now))
            return self.send_json(200, {'ok': 1, 'n': n + 1})
        with db() as c:
            if p == '/api/register':
                nome = str(d.get('nome', '')).strip()[:40]
                email = str(d.get('email', '')).strip().lower()[:120]
                senha = str(d.get('senha', ''))
                if len(nome) < 2:
                    return self.send_json(400, {'erro': 'O nome precisa de pelo menos 2 letras.'})
                if not EMAIL_RE.match(email):
                    return self.send_json(400, {'erro': 'E-mail inválido.'})
                if len(senha) < 6:
                    return self.send_json(400, {'erro': 'A senha precisa de pelo menos 6 caracteres.'})
                if c.execute('SELECT 1 FROM users WHERE email=?', (email,)).fetchone():
                    return self.send_json(409, {'erro': 'Já existe uma conta com este e-mail.'})
                salt = secrets.token_hex(16)
                hp = hash_pw(senha, salt)
                try:
                    cur = c.execute('INSERT INTO users(nome,email,salt,hash,adulto,avatar,criado) VALUES(?,?,?,?,?,?,?)',
                                    (nome, email, salt, hp, 1 if d.get('adulto') else 0,
                                     json.dumps(d.get('avatar') or {}), time.time()))
                except pedb.IntegrityError:
                    return self.send_json(409, {'erro': 'Já existe uma conta com este e-mail.'})
                tok = secrets.token_urlsafe(32)
                c.execute('INSERT INTO sessions VALUES(?,?,?)', (tok, cur.lastrowid, time.time()))
                _ident_note(self, c, cur.lastrowid, str(d.get('dv') or '')[:32], time.time())
                u = c.execute('SELECT * FROM users WHERE id=?', (cur.lastrowid,)).fetchone()
                return self.send_json(200, {'token': tok, 'user': public(u), 'save': None, 'meta': None})
            if p == '/api/login':
                email = str(d.get('email', '')).strip().lower()
                u = c.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
                if not u or not hmac.compare_digest(u['hash'], hash_pw(str(d.get('senha', '')), u['salt'])):
                    return self.send_json(401, {'erro': 'E-mail ou senha incorretos.'})
                tok = secrets.token_urlsafe(32)
                c.execute('INSERT INTO sessions VALUES(?,?,?)', (tok, u['id'], time.time()))
                _ident_note(self, c, u['id'], str(d.get('dv') or '')[:32], time.time())
                return self.send_json(200, {'token': tok, 'user': public(u),
                                            'save': json.loads(u['save']) if u['save'] else None,
                                            'meta': json.loads(u['meta']) if u['meta'] else None})
            u = self.user(c, 'u.id, u.nome, u.email, u.adulto, u.avatar')
            if not u:
                return self.send_json(401, {'erro': 'Sessão inválida. Entra outra vez.'})
            if p == '/api/profile':
                if d.get('nome'):
                    c.execute('UPDATE users SET nome=? WHERE id=?', (str(d['nome']).strip()[:40], u['id']))
                if 'avatar' in d:
                    c.execute('UPDATE users SET avatar=? WHERE id=?', (json.dumps(d['avatar']), u['id']))
                if 'adulto' in d:
                    c.execute('UPDATE users SET adulto=? WHERE id=?', (1 if d['adulto'] else 0, u['id']))
                u = c.execute('SELECT * FROM users WHERE id=?', (u['id'],)).fetchone()
                return self.send_json(200, {'user': public(u)})
            if p == '/api/logout':
                c.execute('DELETE FROM sessions WHERE token=?', (self.headers.get('Authorization', '')[7:],))
                TOKC.pop(self.headers.get('Authorization', '')[7:], None)
                return self.send_json(200, {'ok': True})
        return self.send_json(404, {'erro': 'Rota desconhecida'})


if __name__ == '__main__':
    try:   # cada jogador ligado gasta 1 ficheiro (socket): sobe o limite do processo (por omissão 1024) até ao máximo permitido
        import resource
        _sl, _hl = resource.getrlimit(resource.RLIMIT_NOFILE)
        _alvo = 65536 if _hl == resource.RLIM_INFINITY else min(_hl, 65536)
        if _sl != resource.RLIM_INFINITY and _sl < _alvo:
            resource.setrlimit(resource.RLIMIT_NOFILE, (_alvo, _hl))
    except Exception:
        pass
    port = int(os.environ.get('PORT', 8080))
    print(f'Próxima Encarnação a correr em http://0.0.0.0:{port}  (jogo em /3d/)' + (f'  [nó {NODE}/{NODES}]' if CLUSTER else ''))
    class Srv(ThreadingHTTPServer):
        daemon_threads = True
        allow_reuse_address = True
        request_queue_size = 4096   # fila de ligações maior: sem 'connection reset' em picos
        def handle_error(self, request, client_address):
            import sys
            if isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
                return  # o cliente fechou a ligação — inofensivo
            super().handle_error(request, client_address)
    print(f'[nó {NODE}] base de dados: {pedb.descr()}  · cidades de {SHARD_CAP} · gravação a cada {SAVE_S}s · ritmo x{POLL_MUL}', flush=True)
    if CLUSTER:
        threading.Thread(target=_cluster_loop, daemon=True, name='cluster').start()
    srv = Srv((os.environ.get('BIND', '0.0.0.0'), port), H)
    def _parar(*_):   # Northflank / Docker param com SIGTERM: fecha sem erros
        threading.Thread(target=srv.shutdown, daemon=True).start()
    signal.signal(signal.SIGTERM, _parar)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    print(f'[nó {NODE}] parado.', flush=True)
