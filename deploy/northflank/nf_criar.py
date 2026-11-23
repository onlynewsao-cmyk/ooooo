#!/usr/bin/env python3
"""Cria (ou atualiza) toda a infraestrutura da Próxima Encarnação no Northflank através da API.

  # 1) ver o plano e o custo, sem tocar em nada:
  python3 deploy/northflank/nf_criar.py --jogadores 5000 --simular

  # 2) criar de verdade (token em Northflank > Team settings > API > Tokens):
  export NF_TOKEN=xxxxxxxx
  python3 deploy/northflank/nf_criar.py --jogadores 5000 --projeto proxima-encarnacao \\
          --repo https://github.com/A_TUA_CONTA/proxima-encarnacao --ramo main

  # alternativa sem GitHub ligado: imagem já publicada num registo (Docker Hub, GHCR...)
  python3 deploy/northflank/nf_criar.py --jogadores 10000 --projeto proxima-encarnacao --imagem docker.io/conta/proxima:1

O que cria (no mesmo projeto):
  pe-db          PostgreSQL gerido (contas, gravações, grupos, amigos, anúncios, eventos entre nós)
  pe-build       serviço de build a partir do repositório (Dockerfile em deploy/northflank/Dockerfile)
  pe-jogo-1..G   serviços do jogo, cada um com PROCS nós (1 por vCPU), portas privadas 8101..
  pe-router      nginx público (porta 8080): serve o jogo e encaminha cada cidade para o seu nó

Correr outra vez com outro --jogadores atualiza tudo (mais/menos serviços do jogo, NODES novo no router e nos nós).
Só usa a biblioteca padrão do Python.
"""
import argparse, json, math, os, sys, time, urllib.error, urllib.request

API = 'https://api.northflank.com/v1'
PRECO_VCPU_H, PRECO_GB_H, PRECO_DISCO_GB_MES, PRECO_EGRESS_GB = 0.01667, 0.00833, 0.11657, 0.06
PLANOS = {   # vCPU, GB de RAM (planos padrão do Northflank)
    'nf-compute-100-2': (1, 2), 'nf-compute-200': (2, 4), 'nf-compute-200-8': (2, 8),
    'nf-compute-400': (4, 8), 'nf-compute-400-16': (4, 16), 'nf-compute-800-16': (8, 16), 'nf-compute-800-32': (8, 32),
}


def mes(plano, n=1):
    c, g = PLANOS[plano]
    return n * (c * PRECO_VCPU_H + g * PRECO_GB_H) * 730


class NF:
    def __init__(s, token, simular):
        s.token, s.simular = token, simular

    def call(s, method, path, body=None, ok404=False):
        if s.simular:
            print(f'    [simulação] {method} {path}' + (f'  {json.dumps(body, ensure_ascii=False)[:160]}...' if body else ''))
            return 200, {'data': {}}
        req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                     headers={'Authorization': 'Bearer ' + s.token, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.status, json.loads(r.read() or b'{}')
        except urllib.error.HTTPError as e:
            txt = e.read().decode(errors='replace')
            if e.code == 404 and ok404:
                return 404, {}
            if e.code == 409:
                return 409, {}
            print(f'  ERRO {e.code} em {method} {path}: {txt[:600]}')
            raise SystemExit(1)


def main():
    ap = argparse.ArgumentParser(description='Próxima Encarnação -> Northflank')
    ap.add_argument('--jogadores', type=int, default=5000, help='pico de jogadores ligados ao mesmo tempo (ex.: 5000 ou 10000)')
    ap.add_argument('--projeto', default='proxima-encarnacao', help='ID do projeto (é criado se não existir)')
    ap.add_argument('--regiao', default='europe-west', help='região do projeto novo (europe-west = Londres, a mais perto de Angola)')
    ap.add_argument('--repo', help='URL do repositório Git (GitHub/GitLab/Bitbucket ligado ao Northflank)')
    ap.add_argument('--ramo', default='main')
    ap.add_argument('--conta-git', help='login da conta Git no Northflank (accountLogin), se tiveres várias')
    ap.add_argument('--imagem', help='em vez de --repo: imagem Docker já publicada (ex.: ghcr.io/conta/proxima:1)')
    ap.add_argument('--procs', type=int, default=4, help='nós (processos) por serviço do jogo = vCPUs do plano')
    ap.add_argument('--cap', type=int, default=250, help='jogadores por cidade paralela (= por nó)')
    ap.add_argument('--folga', type=float, default=1.2, help='margem de capacidade (1.2 = +20%%)')
    ap.add_argument('--plano-jogo', default='nf-compute-400')
    ap.add_argument('--plano-router', default='nf-compute-200')
    ap.add_argument('--routers', type=int, default=0, help='instâncias do router (0 = automático)')
    ap.add_argument('--plano-db', default='')
    ap.add_argument('--disco-db', type=int, default=20, help='GB de disco do PostgreSQL')
    ap.add_argument('--db-replicas', type=int, default=1, help='2 = alta disponibilidade (dobra o custo da base de dados)')
    ap.add_argument('--db-url', help='DATABASE_URL já conhecido (salta a leitura das credenciais do addon)')
    ap.add_argument('--save-s', type=int, default=30, help='gravação no servidor a cada N s por jogador')
    ap.add_argument('--poll-mul', type=float, default=1.0, help='>1 = clientes perguntam menos vezes (menos tráfego/CPU)')
    ap.add_argument('--simular', action='store_true', help='mostra o plano e o custo sem chamar a API')
    a = ap.parse_args()

    nodes = max(a.procs, math.ceil(a.jogadores * a.folga / a.cap))
    G = math.ceil(nodes / a.procs)
    nodes = G * a.procs
    if nodes > 99:
        raise SystemExit('Demasiados nós (máx. 99 cidades paralelas). Aumenta --cap ou --procs.')
    routers = a.routers or (2 if a.jogadores <= 6000 else 3)
    plano_db = a.plano_db or ('nf-compute-200' if a.jogadores <= 6000 else 'nf-compute-400')
    c_jogo, c_router = mes(a.plano_jogo, G), mes(a.plano_router, routers)
    c_db = mes(plano_db, a.db_replicas) + a.disco_db * PRECO_DISCO_GB_MES * a.db_replicas
    n_ = lambda x: f'{x:,.0f}'.replace(',', ' ')
    vcpu = G * PLANOS[a.plano_jogo][0] + routers * PLANOS[a.plano_router][0] + PLANOS[plano_db][0] * a.db_replicas
    print(f'''
Próxima Encarnação no Northflank — plano para {n_(a.jogadores)} jogadores ao mesmo tempo
  cidades paralelas : {nodes} nós × {a.cap} jogadores = capacidade {n_(nodes * a.cap)} (folga +{a.folga - 1:.0%})
  serviços do jogo  : {G} × {a.plano_jogo} ({PLANOS[a.plano_jogo][0]} vCPU / {PLANOS[a.plano_jogo][1]} GB) com {a.procs} nós cada  ≈ ${n_(c_jogo)}/mês
  router (nginx)    : {routers} × {a.plano_router}  ≈ ${n_(c_router)}/mês
  PostgreSQL        : {plano_db} × {a.db_replicas} réplica(s) · {a.disco_db} GB nvme  ≈ ${n_(c_db)}/mês
  TOTAL computação  : ≈ ${n_(c_jogo + c_router + c_db)}/mês  (+ tráfego de saída a ${PRECO_EGRESS_GB}/GB: ~6 MB por jogador-hora)
  vCPU necessárias  : {vcpu} (pede aumento de quota ao Northflank se passar o teu limite)
''')
    if not a.simular and not os.environ.get('NF_TOKEN'):
        raise SystemExit('Define NF_TOKEN (token da API do Northflank) ou usa --simular.')
    if not a.simular and not (a.repo or a.imagem):
        raise SystemExit('Indica --repo (repositório Git) ou --imagem (imagem Docker publicada).')
    nf = NF(os.environ.get('NF_TOKEN', ''), a.simular)
    P = a.projeto

    print('1/5 Projeto')
    st, _ = nf.call('GET', f'/projects/{P}', ok404=True)
    if st == 404:
        nf.call('POST', '/projects', {'name': P, 'region': a.regiao, 'description': 'Proxima Encarnacao - jogo online'})
        print(f'    criado em {a.regiao}')
    else:
        print('    já existe')

    print('2/5 PostgreSQL (pe-db)')
    st, _ = nf.call('POST', f'/projects/{P}/addons', {
        'name': 'pe-db', 'description': 'Contas e gravacoes do jogo', 'type': 'postgresql', 'version': 'latest',
        'billing': {'deploymentPlan': plano_db, 'storageClass': 'nvme', 'storage': a.disco_db * 1024, 'replicas': a.db_replicas},
        'tlsEnabled': False, 'externalAccessEnabled': False,
        'typeSpecificSettings': {'postgresqlConnectionPoolerEnabled': False},
        'backupSchedules': [{'scheduling': {'interval': 'daily', 'minute': [15], 'hour': [5]}, 'backupType': 'snapshot', 'retentionTime': 7}],
    })
    print('    já existe' if st == 409 else '    a criar...')
    db_url = a.db_url
    if not db_url and not a.simular:
        for i in range(120):
            _, d = nf.call('GET', f'/projects/{P}/addons/pe-db')
            stt = (d.get('data') or {}).get('status')
            if stt == 'running':
                break
            print(f'    estado: {stt} (à espera...)')
            time.sleep(10)
        _, d = nf.call('GET', f'/projects/{P}/addons/pe-db/credentials')
        allv = {**((d.get('data') or {}).get('secrets') or {}), **((d.get('data') or {}).get('envs') or {})}
        for k in ('POSTGRES_URI', 'postgresUri', 'uri', 'URI'):
            if allv.get(k):
                db_url = allv[k]
                break
        if not db_url:
            ks = [k for k in allv if 'URI' in k.upper() and 'ADMIN' not in k.upper() and 'JDBC' not in k.upper()]
            db_url = allv[ks[0]] if ks else None
        if not db_url:
            raise SystemExit('Não encontrei POSTGRES_URI nas credenciais. Copia-o da página "Connection details" do pe-db e volta a correr com --db-url "postgresql://..."')
    db_url = db_url or 'postgresql://UTILIZADOR:SENHA@primary.pe-db--xxxx.addon.code.run:5432/BASE'

    fonte = {'external': {'imagePath': a.imagem}} if a.imagem else {'internal': {'id': 'pe-build', 'branch': a.ramo, 'buildSHA': 'latest'}}
    if a.repo and not a.imagem:
        print('3/5 Build (pe-build)')
        vcs = {'projectUrl': a.repo, 'projectType': 'github' if 'github.com' in a.repo else 'gitlab' if 'gitlab' in a.repo else 'bitbucket'}
        if a.conta_git:
            vcs['accountLogin'] = a.conta_git
        st, _ = nf.call('POST', f'/projects/{P}/services/build', {
            'name': 'pe-build', 'description': 'Imagem unica do jogo', 'billing': {'buildPlan': 'nf-compute-200-8'},
            'vcsData': vcs, 'buildSettings': {'dockerfile': {'buildEngine': 'buildkit', 'dockerFilePath': '/deploy/northflank/Dockerfile', 'dockerWorkDir': '/'}},
            'buildConfiguration': {'branchRestrictions': [a.ramo], 'pathIgnoreRules': ['*.md', 'tools/*']},
        })
        print('    já existe' if st == 409 else '    criado')
        nf.call('POST', f'/projects/{P}/services/pe-build/build', {'branch': a.ramo})
        print('    build iniciado (os serviços arrancam quando a imagem estiver pronta)')
    else:
        print('3/5 Build: a usar a imagem', a.imagem or '(indica --repo ou --imagem)')

    env_comum = {'NODES': str(nodes), 'PROCS': str(a.procs), 'SHARD_CAP': str(a.cap), 'SAVE_S': str(a.save_s), 'POLL_MUL': str(a.poll_mul)}

    def servico(nome, plano, inst, env, portas, saude):
        body = {'name': nome, 'description': 'Proxima Encarnacao', 'billing': {'deploymentPlan': plano},
                'deployment': dict(instances=inst, docker={'configType': 'default'}, **fonte),
                'ports': portas, 'runtimeEnvironment': env, 'healthChecks': saude}
        st, _ = nf.call('POST', f'/projects/{P}/services/deployment', body)
        if st == 409:   # já existe: atualiza plano, instâncias, variáveis e portas
            body.pop('name')
            nf.call('PATCH', f'/projects/{P}/services/deployment/{nome}', body)
            print(f'    {nome}: atualizado')
        else:
            print(f'    {nome}: criado')

    def saude(port, path):
        return [{'protocol': 'HTTP', 'type': 'readinessProbe', 'path': path, 'port': port, 'initialDelaySeconds': 5, 'periodSeconds': 10, 'timeoutSeconds': 3, 'failureThreshold': 3, 'successThreshold': 1},
                {'protocol': 'HTTP', 'type': 'livenessProbe', 'path': path, 'port': port, 'initialDelaySeconds': 30, 'periodSeconds': 15, 'timeoutSeconds': 5, 'failureThreshold': 4, 'successThreshold': 1}]

    print(f'4/5 Serviços do jogo (pe-jogo-1..{G})')
    for g in range(1, G + 1):
        env = dict(env_comum, PE_ROLE='game', GROUP=str(g), DATABASE_URL=db_url, DB_POOL='3' if nodes <= 30 else '2')   # ligações à BD: nós × pool < max_connections
        portas = [{'name': f'n{8101 + j}', 'internalPort': 8101 + j, 'public': False, 'protocol': 'HTTP'} for j in range(a.procs)]
        servico(f'pe-jogo-{g}', a.plano_jogo, 1, env, portas, saude(8101, '/api/ping'))

    print('5/5 Router público (pe-router)')
    servico('pe-router', a.plano_router, routers, dict(env_comum, PE_ROLE='router', GAME_HOST='pe-jogo-{g}', PORT='8080'),
            [{'name': 'web', 'internalPort': 8080, 'public': True, 'protocol': 'HTTP'}], saude(8080, '/healthz'))

    if not a.simular:
        # serviços que sobram de uma configuração maior (ex.: de 10 000 para 5 000): avisa, não apaga sozinho
        st, d = nf.call('GET', f'/projects/{P}/services')
        extra = sorted(s_['id'] for s_ in (d.get('data') or {}).get('services', []) if s_.get('id', '').startswith('pe-jogo-') and int(s_['id'].split('-')[-1]) > G)
        if extra:
            print(f'\nATENÇÃO: estes serviços já não são precisos e podem ser apagados no painel: {", ".join(extra)}')
    print('\nPronto. Abre o pe-router no painel do Northflank > Networking para ver o endereço público (…code.run) ou liga o teu domínio.')
    print('Depois testa:  python3 tools/teste_api.py https://O_TEU_ENDERECO')


if __name__ == '__main__':
    main()
