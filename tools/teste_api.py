#!/usr/bin/env python3
"""Teste rápido de fumo da API da Próxima Encarnação (local, cluster ou Northflank).

  python3 tools/teste_api.py http://127.0.0.1:8080
  python3 tools/teste_api.py https://jogo.exemplo.ao

Cria 2 contas de teste, põe-nas na mesma cidade paralela e testa: registo, login, me, save, perfil,
presença (mp), chat, anúncios, amigos, grupos, eleições, crime/prisão/fiança e logout.
Imprime OK/FALHOU por passo e termina com código 1 se algo falhar.
"""
import json, random, string, sys, time, urllib.error, urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8080').rstrip('/')
FAL = []


def req(path, body=None, tok=None, sh=None, method=None):
    u = BASE + path + (('&' if '?' in path else '?') + f'sh={sh}' if sh else '')
    h = {'Content-Type': 'application/json', 'Accept-Encoding': 'identity'}
    if tok:
        h['Authorization'] = 'Bearer ' + tok
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(u, data=data, headers=h, method=method or ('POST' if body is not None else 'GET'))
    try:
        with urllib.request.urlopen(r, timeout=20) as f:
            return f.status, json.loads(f.read() or b'{}')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b'{}')
        except Exception:
            return e.code, {}


def ok(nome, cond, extra=''):
    print(('  OK      ' if cond else '  FALHOU  ') + nome + (f'  ({extra})' if extra and not cond else ''))
    if not cond:
        FAL.append(nome)
    return cond


class J:
    def __init__(s, nome):
        s.nome, s.sh, s.tok, s.id, s.since = nome, 0, None, None, 0

    def mp(s, x=0, z=0, want=None, **kw):
        body = {'room': 'rua', 'x': x, 'z': z, 'yaw': 0, 'mv': 0, 'nick': s.nome, 'since': s.since, 'cv': 1,
                'cfg': {'g': 'f', 'pele': 2}, 'kz': 50000}
        body.update(kw)
        for _ in range(6):
            if want:
                body['sh'] = want
            c, d = req('/api/mp', body, s.tok, s.sh or want)
            if c == 200 and d.get('move'):
                want = d['move']; s.sh = 0
                continue
            if c == 200 and d.get('sh'):
                s.sh = d['sh']
            return c, d
        return c, d


def main():
    print(f'Teste da API em {BASE}')
    c, d = req('/api/ping')
    ok('ping', c == 200 and d.get('ok'), c)
    tag = ''.join(random.choice(string.ascii_lowercase) for _ in range(6))
    A, B = J('Teste' + tag[:3] + 'A'), J('Teste' + tag[:3] + 'B')
    for P in (A, B):
        c, d = req('/api/register', {'nome': P.nome, 'email': f'{P.nome.lower()}{tag}@teste.ao', 'senha': 'segredo123', 'adulto': True, 'avatar': {'g': 'f'}})
        ok(f'registo {P.nome}', c == 200 and d.get('token'), (c, d))
        P.tok, P.id = d.get('token'), (d.get('user') or {}).get('id')
    c, d = req('/api/register', {'nome': 'X', 'email': f'{A.nome.lower()}{tag}@teste.ao', 'senha': 'segredo123'})
    ok('registo repetido recusado', c == 400 or c == 409, c)
    c, d = req('/api/login', {'email': f'{A.nome.lower()}{tag}@teste.ao', 'senha': 'segredo123'})
    ok('login', c == 200 and d.get('token'), c)
    A.tok = d.get('token') or A.tok
    c, d = req('/api/login', {'email': f'{A.nome.lower()}{tag}@teste.ao', 'senha': 'errada'})
    ok('login com senha errada recusado', c == 401, c)
    c, d = req('/api/save', {'save': {'nome': A.nome, 'dinheiro': 1234, 'lista': list(range(50))}, 'meta': {'vidas': [1]}}, A.tok)
    ok('save', c == 200 and d.get('ok'), (c, d))
    c, d = req('/api/me', tok=A.tok)
    ok('me devolve o save', c == 200 and (d.get('save') or {}).get('dinheiro') == 1234 and d.get('meta') == {'vidas': [1]}, (c, str(d)[:120]))
    c, d = req('/api/profile', {'avatar': {'g': 'f', 'cabelo': 3}}, A.tok)
    ok('perfil', c == 200 and d.get('user', {}).get('avatar', {}).get('cabelo') == 3, (c, d))

    # presença: A escolhe cidade, B pede a mesma
    c, d = A.mp(0, 0)
    ok('mp A entra numa cidade', c == 200 and A.sh >= 1, (c, d))
    c, d = B.mp(1, 1, want=A.sh)
    ok('mp B na mesma cidade', c == 200 and B.sh == A.sh, (c, B.sh, A.sh, d.get('erro')))
    time.sleep(.3)
    c, d = A.mp(0, 0)
    ok('A vê B por perto', c == 200 and any(p.get('id') == B.id for p in d.get('players', [])), [p.get('id') for p in d.get('players', [])])
    ok('contagem online', d.get('online', 0) >= 2, d.get('online'))
    c, d = req('/api/chat', {'txt': 'Olá kamba, bom dia!', 'scope': 'todos'}, A.tok, A.sh)
    ok('chat enviar', c == 200 and d.get('ok'), (c, d))
    c, d = req('/api/chat', {'txt': 'és um idiota', 'scope': 'todos'}, A.tok, A.sh)
    ok('filtro de ofensas', c == 200 and (not d.get('ok') or d.get('aviso')), d)
    c, d = B.mp(1, 1)
    ok('B recebe a mensagem de A', any(m.get('uid') == A.id and 'kamba' in m.get('txt', '') for m in d.get('chat', [])), [m.get('txt') for m in d.get('chat', [])][-3:])

    c, d = req('/api/ads/new', {'fmt': 'poster', 'tpl': 'classico', 't': 'Kitanda da ' + A.nome[-4:], 's': 'Fuba e peixe fresco', 'cta': 'Passa cá', 'marca': 'Kitanda'}, A.tok, A.sh)
    ok('publicar anúncio', c == 200 and d.get('ok'), (c, d))
    time.sleep(.2)
    c, d = req('/api/ads', tok=A.tok, sh=A.sh)
    ok('lista de anúncios', c == 200 and isinstance(d.get('ads'), list), c)

    c, d = req('/api/amigos', {'op': 'add', 'fid': B.id}, A.tok, A.sh)
    ok('pedido de amizade', c == 200 and d.get('ok'), d)
    c, d = req('/api/amigos', {'op': 'add', 'fid': A.id}, B.tok, B.sh)
    ok('aceitar amizade', c == 200 and d.get('estado') == 'amigos', d)
    c, d = req('/api/amigos', {'op': 'list'}, A.tok, A.sh)
    ok('lista de amigos', c == 200 and any(x.get('id') == B.id for x in d.get('amigos', [])), str(d)[:200])

    gt = ('T' + tag[:3]).upper()
    c, d = req('/api/grupo', {'op': 'criar', 'nome': 'Kambas ' + tag, 'tag': gt, 'tipo': 'clube', 'lema': 'Juntos sempre'}, A.tok, A.sh)
    ok('criar grupo', c == 200 and d.get('ok'), d)
    gid = d.get('gid')
    c, d = req('/api/grupo', {'op': 'entrar', 'gid': gid}, B.tok, B.sh)
    ok('entrar no grupo', c == 200 and d.get('ok'), d)
    c, d = req('/api/grupo', {'op': 'meu'}, A.tok, A.sh)
    ok('o meu grupo tem 2 membros', c == 200 and len((d.get('grupo') or {}).get('membros', [])) == 2, str(d)[:200])
    c, d = req('/api/grupo', {'op': 'lista'}, A.tok, A.sh)
    ok('lista de grupos', c == 200 and any(g.get('id') == gid for g in d.get('grupos', [])), c)

    c, d = req('/api/pol', {'op': 'estado'}, A.tok, A.sh)
    ok('eleições: estado', c == 200 and d.get('ok'), d)
    c, d = req('/api/pol', {'op': 'candidatar', 'partido': 'Partido ' + tag, 'promessa': 'Mais escolas e estradas', 'orc': 'educacao', 'iva': 10}, A.tok, A.sh)
    ok('candidatar', c == 200 and d.get('ok'), d)
    c, d = req('/api/pol', {'op': 'votar', 'cid': A.id}, B.tok, B.sh)
    ok('votar', c == 200 and d.get('ok') and any(x.get('uid') == A.id and x.get('votos', 0) >= 1 for x in d.get('cands', [])), str(d)[:200])
    req('/api/pol', {'op': 'desistir'}, A.tok, A.sh)

    # polícia e ladrão (PvP): B fica de serviço como agente, A rouba B? Não pode (agente). A rouba um peão
    c, d = req('/api/crime', {'tipo': 'npc'}, A.tok, A.sh)
    ok('crime', c == 200 and d.get('ok'), d)
    if d.get('ok') and not d.get('preso') and d.get('wl', 0) > 0:
        B.mp(0.5, 0.5, pol=True)
        A.mp(0, 0)
        c, d = req('/api/prender', {'alvo': A.id}, B.tok, B.sh)
        ok('agente prende o procurado', c == 200 and d.get('ok'), d)
    c, d = req('/api/fianca', {}, A.tok, A.sh)
    ok('fiança', c == 200 and d.get('ok'), d)

    c, d = req('/api/grupo', {'op': 'sair'}, B.tok, B.sh)
    c, d = req('/api/grupo', {'op': 'sair'}, A.tok, A.sh)
    ok('sair do grupo', c == 200 and d.get('ok'), d)
    c, d = req('/api/logout', {}, B.tok, B.sh)
    ok('logout', c == 200 and d.get('ok'), d)
    c, d = req('/api/me', tok=B.tok)
    ok('sessão terminada', c == 401, c)
    print(('\nTUDO OK' if not FAL else f'\n{len(FAL)} FALHA(S): ' + ', '.join(FAL)))
    sys.exit(1 if FAL else 0)


if __name__ == '__main__':
    main()
