#!/usr/bin/env python3
"""Copia as contas e o progresso do SQLite local (data/jogo.db) para o PostgreSQL do Northflank.

  DATABASE_URL="postgresql://utilizador:senha@host:5432/base" python3 tools/migrar_sqlite_pg.py [data/jogo.db]

Para ligar do teu PC ao PostgreSQL do Northflank: ativa "public access" no addon (com TLS) por uns minutos,
ou usa o túnel da CLI:  northflank forward addon --projectId proxima-encarnacao --addonId pe-db
Pode correr mais de uma vez: linhas já existentes são ignoradas. No fim acerta as sequências de IDs.
"""
import os, sqlite3, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pedb

src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'jogo.db')
if not pedb.PG:
    raise SystemExit('Define DATABASE_URL=postgresql://... (o destino).')
if not os.path.exists(src):
    raise SystemExit(f'Não encontrei {src}')
pedb.init_schema(None)
s = sqlite3.connect(src)
TAB = {   # tabela: colunas (kv só leva o governo; eventos e presença dos nós não interessam)
    'users': 'id,nome,email,salt,hash,adulto,avatar,save,meta,criado',
    'sessions': 'token,user_id,criado',
    'ads': 'id,uid,nick,data,criado,exp',
    'amigos': 'uid,fid,ok,criado',
    'grupos': 'id,nome,tag,tipo,dono,lema,criado',
    'membros': 'uid,gid,cargo,desde',
    'kv': 'k,v',
}
for t, cols in TAB.items():
    rows = s.execute(f'SELECT {cols} FROM {t}' + (" WHERE k='gov'" if t == 'kv' else '')).fetchall()
    n = len(cols.split(','))
    with pedb.connect(None) as c:
        for i in range(0, len(rows), 500):
            for r in rows[i:i + 500]:
                c.execute(f'INSERT OR IGNORE INTO {t}({cols}) VALUES({",".join("?" * n)})', r)
    print(f'{t:9s} {len(rows):7d} linhas')
with pedb.connect(None) as c:
    for t in ('users', 'ads', 'grupos', 'evq'):
        c.execute(f"SELECT setval(pg_get_serial_sequence('{t}', 'id'), COALESCE((SELECT MAX(id) FROM {t}), 0) + 1, false)")
print('Migração concluída.')
