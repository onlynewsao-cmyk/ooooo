"""
Próxima Encarnação — camada de base de dados.

  • Sem variáveis de ambiente      -> SQLite local (data/jogo.db), como sempre (desenvolvimento / 1 máquina).
  • Com DATABASE_URL=postgresql://... -> PostgreSQL partilhado por todos os nós (Northflank, 5k-10k jogadores).
  • Com MONGODB_URI=mongodb://...     -> MongoDB partilhado por todos os nós (as contas nunca se perdem com o redeploy).

O resto do servidor continua a escrever SQL ao estilo SQLite ( ? , INSERT OR REPLACE, ...);
aqui é traduzido automaticamente para PostgreSQL ou MongoDB. Ligações reutilizadas num pool por processo.
"""
import os, re, sqlite3, threading, time

URL = (os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URI') or '').strip()
PG = URL.startswith(('postgres://', 'postgresql://'))
POOL_MAX = max(1, int(os.environ.get('DB_POOL', 4)))

if PG:
    import psycopg2, psycopg2.extras, psycopg2.pool
    IntegrityError = (sqlite3.IntegrityError, psycopg2.IntegrityError)
    DBError = (sqlite3.Error, psycopg2.Error)
else:
    IntegrityError = (sqlite3.IntegrityError,)
    DBError = (sqlite3.Error,)

# ---------------------------------------------------------------- esquema
SCHEMA_SQLITE = '''
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  salt TEXT NOT NULL, hash TEXT NOT NULL,
  adulto INTEGER DEFAULT 0, adm INTEGER DEFAULT 0, avatar TEXT DEFAULT '{}',
  save TEXT, meta TEXT, criado REAL);
CREATE TABLE IF NOT EXISTS sessions(
  token TEXT PRIMARY KEY, user_id INTEGER, criado REAL);
CREATE TABLE IF NOT EXISTS ads(
  id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER, nick TEXT, data TEXT, criado REAL, exp REAL);
CREATE TABLE IF NOT EXISTS amigos(uid INTEGER, fid INTEGER, ok INTEGER DEFAULT 0, criado REAL, PRIMARY KEY(uid, fid));
CREATE TABLE IF NOT EXISTS grupos(id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT UNIQUE, tag TEXT UNIQUE, tipo TEXT, dono INTEGER, lema TEXT, criado REAL);
CREATE TABLE IF NOT EXISTS membros(uid INTEGER PRIMARY KEY, gid INTEGER, cargo TEXT, desde REAL);
CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS evq(id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER, e TEXT, t REAL);
CREATE TABLE IF NOT EXISTS anos(uid INTEGER PRIMARY KEY, dia TEXT, n INTEGER, ts REAL);
CREATE INDEX IF NOT EXISTS evq_uid ON evq(uid);
CREATE INDEX IF NOT EXISTS sessions_criado ON sessions(criado);
CREATE INDEX IF NOT EXISTS membros_gid ON membros(gid);
CREATE INDEX IF NOT EXISTS amigos_fid ON amigos(fid);
CREATE INDEX IF NOT EXISTS ads_exp ON ads(exp);
CREATE INDEX IF NOT EXISTS users_nome_lower ON users(lower(nome));
CREATE TABLE IF NOT EXISTS sms(id INTEGER PRIMARY KEY AUTOINCREMENT, de INTEGER, para INTEGER, txt TEXT, ts REAL);
CREATE INDEX IF NOT EXISTS sms_para ON sms(para);
'''

SCHEMA_PG = '''
CREATE TABLE IF NOT EXISTS users(
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  salt TEXT NOT NULL, hash TEXT NOT NULL,
  adulto INTEGER DEFAULT 0, adm INTEGER DEFAULT 0, avatar TEXT DEFAULT '{}',
  save TEXT, meta TEXT, criado DOUBLE PRECISION);
CREATE TABLE IF NOT EXISTS sessions(
  token TEXT PRIMARY KEY, user_id BIGINT, criado DOUBLE PRECISION);
CREATE TABLE IF NOT EXISTS ads(
  id BIGSERIAL PRIMARY KEY, uid BIGINT, nick TEXT, data TEXT, criado DOUBLE PRECISION, exp DOUBLE PRECISION);
CREATE TABLE IF NOT EXISTS amigos(uid BIGINT, fid BIGINT, ok INTEGER DEFAULT 0, criado DOUBLE PRECISION, PRIMARY KEY(uid, fid));
CREATE TABLE IF NOT EXISTS grupos(id BIGSERIAL PRIMARY KEY, nome TEXT UNIQUE, tag TEXT UNIQUE, tipo TEXT, dono BIGINT, lema TEXT, criado DOUBLE PRECISION);
CREATE TABLE IF NOT EXISTS membros(uid BIGINT PRIMARY KEY, gid BIGINT, cargo TEXT, desde DOUBLE PRECISION);
CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS evq(id BIGSERIAL PRIMARY KEY, uid BIGINT, e TEXT, t DOUBLE PRECISION);
CREATE TABLE IF NOT EXISTS anos(uid BIGINT PRIMARY KEY, dia TEXT, n INTEGER, ts DOUBLE PRECISION);
CREATE INDEX IF NOT EXISTS evq_uid ON evq(uid);
CREATE INDEX IF NOT EXISTS sessions_criado ON sessions(criado);
CREATE INDEX IF NOT EXISTS membros_gid ON membros(gid);
CREATE INDEX IF NOT EXISTS amigos_fid ON amigos(fid);
CREATE INDEX IF NOT EXISTS ads_exp ON ads(exp);
CREATE INDEX IF NOT EXISTS users_nome_lower ON users(lower(nome));
CREATE INDEX IF NOT EXISTS grupos_nome_lower ON grupos(lower(nome));
CREATE TABLE IF NOT EXISTS sms(id BIGSERIAL PRIMARY KEY, de BIGINT, para BIGINT, txt TEXT, ts DOUBLE PRECISION);
CREATE INDEX IF NOT EXISTS sms_para ON sms(para);
'''

# ---------------------------------------------------------------- tradução SQLite -> PostgreSQL
_UPSERT = {   # tabela: (colunas, chave)
    'kv': (('k', 'v'), ('k',)),
    'amigos': (('uid', 'fid', 'ok', 'criado'), ('uid', 'fid')),
    'membros': (('uid', 'gid', 'cargo', 'desde'), ('uid',)),
}
_SERIAL = ('users', 'ads', 'grupos', 'evq')
_TR = {}


def traduz(sql):
    """devolve (sql_pg, devolve_id)"""
    hit = _TR.get(sql)
    if hit:
        return hit
    s = sql.strip()
    ret = False
    s = re.sub(r'(\w+)\s*=\s*\?\s+COLLATE\s+NOCASE', r'lower(\1)=lower(?)', s, flags=re.I)
    m = re.match(r'INSERT\s+OR\s+REPLACE\s+INTO\s+(\w+)\s*(.*)$', s, re.I | re.S)
    if m:
        t = m.group(1)
        cols, key = _UPSERT[t]
        upd = ', '.join(f'{c}=EXCLUDED.{c}' for c in cols if c not in key)
        s = f'INSERT INTO {t} {m.group(2)} ON CONFLICT ({", ".join(key)}) DO UPDATE SET {upd}'
    m = re.match(r'INSERT\s+OR\s+IGNORE\s+INTO\s+(.*)$', s, re.I | re.S)
    if m:
        s = f'INSERT INTO {m.group(1)} ON CONFLICT DO NOTHING'
    m = re.match(r'INSERT\s+INTO\s+(\w+)', s, re.I)
    if m and m.group(1).lower() in _SERIAL and 'RETURNING' not in s.upper():
        s += ' RETURNING id'
        ret = True
    s = s.replace('%', '%%').replace('?', '%s')
    _TR[sql] = (s, ret)
    return _TR[sql]


class _Cur:
    __slots__ = ('c', 'lastrowid', 'rowcount', '_first')

    def __init__(self, c, ret):
        self.c, self.lastrowid, self._first = c, None, None
        self.rowcount = c.rowcount
        if ret:
            r = c.fetchone()
            self.lastrowid = r[0] if r else None

    def fetchone(self):
        try:
            return self.c.fetchone()
        except psycopg2.ProgrammingError:   # sem resultados (UPDATE/DELETE)
            return None

    def fetchall(self):
        try:
            return self.c.fetchall()
        except psycopg2.ProgrammingError:
            return []

    def __iter__(self):
        return iter(self.fetchall())


_TL = threading.local()


class _PgConn:
    """imita sqlite3.Connection: with db() as c: c.execute(sql, args).fetchone() ... commit no fim.
    Reentrante por fio: um db() dentro de outro reutiliza a mesma ligação (SAVEPOINT), sem esgotar o pool."""

    def __init__(self):
        self.bad, self.parent, self.sp = False, getattr(_TL, 'c', None), None
        if self.parent is not None:
            self.raw = self.parent.raw
            return
        if not _SEM.acquire(timeout=15):
            raise psycopg2.OperationalError('pool de ligações esgotado (15 s)')
        try:
            self.raw = _POOL.getconn()
            if self.raw.closed:
                _POOL.putconn(self.raw, close=True)
                self.raw = _POOL.getconn()
        except Exception:
            _SEM.release()
            raise

    def execute(self, sql, args=()):
        q, ret = traduz(sql)
        cur = self.raw.cursor(cursor_factory=psycopg2.extras.DictCursor)
        try:
            cur.execute(q, tuple(args))
        except (psycopg2.OperationalError, psycopg2.InterfaceError):
            self._root().bad = True
            raise
        return _Cur(cur, ret)

    def executescript(self, script):
        cur = self.raw.cursor()
        cur.execute(script)

    def _root(self):
        c = self
        while c.parent is not None:
            c = c.parent
        return c

    def commit(self):
        if self.parent is None:
            self.raw.commit()

    def __enter__(self):
        if self.parent is not None:
            self.sp = f'sp{id(self)}'
            self.raw.cursor().execute(f'SAVEPOINT {self.sp}')
        _TL.c = self
        return self

    def __exit__(self, et, ev, tb):
        if self.parent is not None:   # ligação emprestada pelo db() de fora
            _TL.c = self.parent
            try:
                if et is None:
                    self.raw.cursor().execute(f'RELEASE SAVEPOINT {self.sp}')
                else:
                    self.raw.cursor().execute(f'ROLLBACK TO SAVEPOINT {self.sp}')
            except psycopg2.Error:
                self._root().bad = True
            return False
        _TL.c = None
        try:
            if et is None and not self.bad:
                try:
                    self.raw.commit()
                except psycopg2.Error:
                    self.raw.rollback()
            else:
                try:
                    self.raw.rollback()
                except psycopg2.Error:
                    self.bad = True
        finally:
            try:
                _POOL.putconn(self.raw, close=self.bad or bool(self.raw.closed))
            finally:
                _SEM.release()
        return False


_POOL = _SEM = None
_INIT_LOCK = threading.Lock()


def _pg_init():
    global _POOL, _SEM
    with _INIT_LOCK:
        if _POOL:
            return
        kw = {'connect_timeout': 8, 'client_encoding': 'UTF8', 'keepalives': 1, 'keepalives_idle': 30, 'keepalives_interval': 10, 'keepalives_count': 3,
              'application_name': f"pe-no{os.environ.get('NODE', '1')}"}
        for i in range(40):   # a base de dados pode ainda estar a arrancar (Northflank)
            try:
                _POOL = psycopg2.pool.ThreadedConnectionPool(1, POOL_MAX, URL, **kw)
                break
            except psycopg2.OperationalError as e:
                print(f'[db] PostgreSQL ainda não responde ({e.__class__.__name__}); nova tentativa em 3 s...', flush=True)
                time.sleep(3)
        else:
            raise SystemExit('[db] não foi possível ligar ao PostgreSQL (DATABASE_URL)')
        _SEM = threading.BoundedSemaphore(POOL_MAX)


class _SqConn(sqlite3.Connection):
    """ligação SQLite que FECHA no fim do `with` (o sqlite3 normal só faz commit e deixa o ficheiro aberto:
    com muitos jogadores esgotava o limite de ficheiros abertos do processo -> 'unable to open database file')"""
    def __exit__(self, et, ev, tb):
        try:
            return super().__exit__(et, ev, tb)
        finally:
            self.close()


def connect(sqlite_path):
    """fábrica usada pelo servidor: db() -> ligação com a mesma interface nos três modos"""
    if PG:
        if not _POOL:
            _pg_init()
        return _PgConn()
    if MONGO:
        if _MDB is None:
            _mongo_init()
        return _MgConn()
    c = sqlite3.connect(sqlite_path, timeout=10, factory=_SqConn)
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA synchronous=NORMAL')
    return c


def init_schema(sqlite_path):
    if PG:
        _pg_init()
        with _PgConn() as c:
            c.execute('SELECT pg_advisory_xact_lock(4242)')   # vários nós a arrancar ao mesmo tempo: um de cada vez
            c.executescript(SCHEMA_PG)
            try:
                c.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS adm INTEGER DEFAULT 0')
            except Exception:
                pass
        return
    if MONGO:
        _mongo_init()   # no MongoDB o "esquema" são os índices (criados no arranque)
        return
    with connect(sqlite_path) as c:
        c.executescript(SCHEMA_SQLITE)
        c.execute('PRAGMA journal_mode=WAL')
        try:
            c.execute('ALTER TABLE users ADD COLUMN adm INTEGER DEFAULT 0')
        except Exception:
            pass


def descr():
    if PG:
        h = re.sub(r'//[^@/]*@', '//***@', URL)
        return f'PostgreSQL ({h.split("?")[0]}) pool={POOL_MAX}'
    if MONGO:
        h = re.sub(r'//[^@/]*@', '//***@', MONGO_URL)
        return f'MongoDB ({h.split("?")[0]})'
    return 'SQLite local'


# ================================================================ MongoDB
# Com MONGODB_URI=mongodb://... (ou mongodb+srv://...) -> MongoDB partilhado por todos os nós.
# O servidor continua a chamar db().execute(sql, args) com o SQL de sempre; aqui cada
# instrução conhecida é traduzida para a operação pymongo equivalente.

MONGO_URL = (os.environ.get('MONGODB_URI') or os.environ.get('MONGO_URL') or
             os.environ.get('MONGO_URI') or os.environ.get('MONGODB_URL') or '').strip()
MONGO = (not PG) and MONGO_URL.startswith(('mongodb://', 'mongodb+srv://'))
MONGO_DB = (os.environ.get('MONGO_DB') or os.environ.get('MONGODB_DB') or '').strip()

if MONGO:
    import pymongo
    from pymongo.errors import DuplicateKeyError, OperationFailure, PyMongoError
    IntegrityError = (sqlite3.IntegrityError, DuplicateKeyError)
    DBError = (sqlite3.Error, PyMongoError)

TCOLS = {
    'users': ['id', 'nome', 'email', 'salt', 'hash', 'adulto', 'adm', 'avatar', 'save', 'meta', 'criado'],
    'sessions': ['token', 'user_id', 'criado'],
    'ads': ['id', 'uid', 'nick', 'data', 'criado', 'exp'],
    'amigos': ['uid', 'fid', 'ok', 'criado'],
    'grupos': ['id', 'nome', 'tag', 'tipo', 'dono', 'lema', 'criado'],
    'membros': ['uid', 'gid', 'cargo', 'desde'],
    'kv': ['k', 'v'],
    'evq': ['id', 'uid', 'e', 't'],
    'anos': ['uid', 'dia', 'n', 'ts'],
    'sms': ['id', 'de', 'para', 'txt', 'ts'],
}
KEYF = {'users': 'id', 'sessions': 'token', 'ads': 'id', 'grupos': 'id', 'membros': 'uid', 'kv': 'k', 'evq': 'id', 'anos': 'uid', 'sms': 'id'}
SERIAL_M = ('users', 'ads', 'grupos', 'evq', 'sms')


class _Row(dict):
    """linha estilo sqlite3.Row: aceita r[0] (posição) e r['col'] (nome); iterar devolve os valores"""
    __slots__ = ('_k',)

    def __init__(self, keys, vals):
        super().__init__(zip(keys, vals))
        self._k = tuple(keys)

    def __getitem__(self, k):
        if isinstance(k, int):
            return dict.__getitem__(self, self._k[k])
        return dict.__getitem__(self, k)

    def __iter__(self):
        return (dict.__getitem__(self, k) for k in self._k)


class _MCur:
    __slots__ = ('rows', 'i', 'lastrowid', 'rowcount')

    def __init__(self, rows=(), lastrowid=None, rowcount=-1):
        self.rows, self.i, self.lastrowid, self.rowcount = list(rows), 0, lastrowid, rowcount

    def fetchone(self):
        if self.i < len(self.rows):
            r = self.rows[self.i]
            self.i += 1
            return r
        return None

    def fetchall(self):
        r = self.rows[self.i:]
        self.i = len(self.rows)
        return r

    def __iter__(self):
        return iter(self.fetchall())


_MCLI = _MDB = None


def _next_id(t):
    d = _MDB.counters.find_one_and_update({'_id': t}, {'$inc': {'n': 1}}, upsert=True, return_document=pymongo.ReturnDocument.AFTER)
    return int(d['n'])


def _ci(v):   # correspondência exata sem distinguir maiúsculas (COLLATE NOCASE)
    return {'$regex': '^' + re.escape(str(v)) + '$', '$options': 'i'}


def _sel(table, d, cols):
    """extrai colunas de um documento; '*' = todas; '1' = constante"""
    if cols == ['*']:
        cols = list(TCOLS[table])
    vals = [1 if c == '1' else d.get(c) for c in cols]
    return list(cols), vals


def _ids(toks, a):
    """lista de ids a partir de tokens '?' (vêm dos args) ou números embutidos no SQL"""
    ai, out = iter(a), []
    for t in toks:
        t = t.strip()
        out.append(next(ai) if t == '?' else int(t))
    return out


def _build_mongo_handlers():
    H = []

    def h(pat):
        def deco(f):
            H.append((re.compile(pat, re.S), f))
            return f
        return deco

    # ---------------- kv ----------------
    @h(r"SELECT v FROM kv WHERE k=\?")
    def _(m, a):
        d = _MDB.kv.find_one({'_id': a[0]})
        return _MCur([_Row(['v'], [d.get('v')])] if d else [])

    @h(r"SELECT v FROM kv WHERE k='([^']*)'")
    def _(m, a):
        d = _MDB.kv.find_one({'_id': m.group(1)})
        return _MCur([_Row(['v'], [d.get('v')])] if d else [])

    @h(r"SELECT k, v FROM kv WHERE k LIKE 'node:%' OR k IN \('pol', 'gov'\)")
    def _(m, a):
        docs = _MDB.kv.find({'$or': [{'_id': {'$regex': '^node:'}}, {'_id': {'$in': ['pol', 'gov']}}]})
        return _MCur([_Row(['k', 'v'], [d['_id'], d.get('v')]) for d in docs])

    @h(r"SELECT (k, v|k|v) FROM kv WHERE k LIKE '([^']*)'")
    def _(m, a):
        cols = [c.strip() for c in m.group(1).split(',')]
        pre = m.group(2).replace('%', '')
        return _MCur([_Row(cols, [d['_id'] if c == 'k' else d.get(c) for c in cols])
                      for d in _MDB.kv.find({'_id': {'$regex': '^' + re.escape(pre)}})])

    @h(r"DELETE FROM kv WHERE k LIKE 'node:%' AND k NOT IN \((.+)\)")
    def _(m, a):
        keep = re.findall(r"'([^']*)'", m.group(1))
        r = _MDB.kv.delete_many({'_id': {'$regex': '^node:', '$nin': keep}})
        return _MCur(rowcount=r.deleted_count)

    @h(r"DELETE FROM kv WHERE k=\?")
    def _(m, a):
        r = _MDB.kv.delete_one({'_id': a[0]})
        return _MCur(rowcount=r.deleted_count)

    # ---------------- autenticação (sessions JOIN users) ----------------
    @h(r"SELECT (.+?) FROM sessions s JOIN users u ON u\.id=s\.user_id WHERE s\.token=\?")
    def _(m, a):
        s = _MDB.sessions.find_one({'_id': a[0]})
        if not s:
            return _MCur()
        u = _MDB.users.find_one({'_id': s.get('user_id')})
        if not u:
            return _MCur()
        cols = []
        for t in m.group(1).split(','):
            t = t.strip()
            if t == 'u.*':
                cols += [('u', c) for c in TCOLS['users']]
            else:
                src, _, col = t.partition('.')
                cols.append((src.strip(), col.strip()))
        keys = [c for _, c in cols]
        vals = [(u.get(c) if src == 'u' else s.get(c)) for src, c in cols]
        return _MCur([_Row(keys, vals)])

    # ---------------- users ----------------
    @h(r"SELECT (.+?) FROM users WHERE id=\?")
    def _(m, a):
        d = _MDB.users.find_one({'_id': a[0]})
        if not d:
            return _MCur()
        k, v = _sel('users', d, [c.strip() for c in m.group(1).split(',')])
        return _MCur([_Row(k, v)])

    @h(r"SELECT (.+?) FROM users WHERE email=\?")
    def _(m, a):
        d = _MDB.users.find_one({'email': a[0]})
        if not d:
            return _MCur()
        k, v = _sel('users', d, [c.strip() for c in m.group(1).split(',')])
        return _MCur([_Row(k, v)])

    @h(r"SELECT 1 FROM users WHERE nome=\? COLLATE NOCASE AND id<>\?")
    def _(m, a):
        d = _MDB.users.find_one({'nome': _ci(a[0]), '_id': {'$ne': a[1]}})
        return _MCur([_Row(['1'], [1])] if d else [])

    @h(r"SELECT 1 FROM users WHERE nome=\? COLLATE NOCASE")
    def _(m, a):
        d = _MDB.users.find_one({'nome': _ci(a[0])})
        return _MCur([_Row(['1'], [1])] if d else [])

    @h(r"SELECT id FROM users WHERE lower\(nome\)=lower\(\?\) ORDER BY id LIMIT 1")
    def _(m, a):
        d = _MDB.users.find_one({'nome': _ci(a[0])}, sort=[('_id', 1)])
        return _MCur([_Row(['id'], [d['_id']])] if d else [])

    @h(r"SELECT ([\w, ]+) FROM users WHERE id IN \(([^)]*)\)")
    def _(m, a):
        ids = _ids(m.group(2).split(','), a)
        cols = [c.strip() for c in m.group(1).split(',')]
        return _MCur([_Row(*_sel('users', d, cols)) for d in _MDB.users.find({'_id': {'$in': ids}})])

    @h(r"SELECT COUNT\(\*\) AS n FROM users")
    def _(m, a):
        return _MCur([_Row(['n'], [_MDB.users.count_documents({})])])

    @h(r"SELECT ([\w, ]+) FROM users ORDER BY id DESC LIMIT (\d+)")
    def _(m, a):
        cols = [c.strip() for c in m.group(1).split(',')]
        docs = _MDB.users.find().sort('_id', -1).limit(int(m.group(2)))
        return _MCur([_Row(*_sel('users', d, cols)) for d in docs])

    @h(r"UPDATE users SET (.+?) WHERE id=\?")
    def _(m, a):
        st, ai = {}, iter(a)
        for tok in m.group(1).split(','):
            col, _, val = tok.strip().partition('=')
            col = col.strip()
            val = val.strip()
            if val == '?':
                st[col] = next(ai)
            elif val.upper() == 'NULL':
                st[col] = None
            elif val.startswith("'"):
                st[col] = val[1:-1]
            else:
                st[col] = float(val) if '.' in val else int(val)
        uid = list(a)[-1]
        r = _MDB.users.update_one({'_id': uid}, {'$set': st})
        return _MCur(rowcount=r.modified_count)

    # ---------------- sessions ----------------
    @h(r"DELETE FROM sessions WHERE criado<\?")
    def _(m, a):
        r = _MDB.sessions.delete_many({'criado': {'$lt': a[0]}})
        return _MCur(rowcount=r.deleted_count)

    @h(r"DELETE FROM sessions WHERE user_id=\?")
    def _(m, a):
        r = _MDB.sessions.delete_many({'user_id': a[0]})
        return _MCur(rowcount=r.deleted_count)

    @h(r"DELETE FROM sessions WHERE token=\?")
    def _(m, a):
        r = _MDB.sessions.delete_one({'_id': a[0]})
        return _MCur(rowcount=r.deleted_count)

    # ---------------- ads ----------------
    @h(r"SELECT \* FROM ads WHERE exp>\? ORDER BY id DESC LIMIT 60")
    def _(m, a):
        docs = _MDB.ads.find({'exp': {'$gt': a[0]}}).sort('_id', -1).limit(60)
        return _MCur([_Row(TCOLS['ads'], [d.get(c) for c in TCOLS['ads']]) for d in docs])

    @h(r"SELECT COUNT\(\*\) FROM ads WHERE uid=\? AND exp>\?")
    def _(m, a):
        return _MCur([_Row(['COUNT(*)'], [_MDB.ads.count_documents({'uid': a[0], 'exp': {'$gt': a[1]}})])])

    @h(r"SELECT MAX\(id\) FROM (ads|evq)")
    def _(m, a):
        d = _MDB[m.group(1)].find_one(sort=[('_id', -1)])
        return _MCur([_Row(['MAX(id)'], [d['_id'] if d else None])])

    # ---------------- evq (fila de eventos entre nós) ----------------
    @h(r"SELECT id, uid, e FROM evq WHERE id>\? ORDER BY id LIMIT 2000")
    def _(m, a):
        docs = _MDB.evq.find({'_id': {'$gt': a[0]}}).sort('_id', 1).limit(2000)
        return _MCur([_Row(['id', 'uid', 'e'], [d['_id'], d.get('uid'), d.get('e')]) for d in docs])

    @h(r"SELECT id, e FROM evq WHERE uid=\? ORDER BY id LIMIT 20")
    def _(m, a):
        docs = _MDB.evq.find({'uid': a[0]}).sort('_id', 1).limit(20)
        return _MCur([_Row(['id', 'e'], [d['_id'], d.get('e')]) for d in docs])

    @h(r"DELETE FROM evq WHERE id IN \(([^)]*)\)")
    def _(m, a):
        r = _MDB.evq.delete_many({'_id': {'$in': _ids(m.group(1).split(','), a)}})
        return _MCur(rowcount=r.deleted_count)

    @h(r"DELETE FROM evq WHERE t<\?")
    def _(m, a):
        r = _MDB.evq.delete_many({'t': {'$lt': a[0]}})
        return _MCur(rowcount=r.deleted_count)

    @h(r"DELETE FROM evq WHERE uid=\? AND id<=\?")
    def _(m, a):
        r = _MDB.evq.delete_many({'uid': a[0], '_id': {'$lte': a[1]}})
        return _MCur(rowcount=r.deleted_count)

    # ---------------- grupos / membros ----------------
    @h(r"SELECT \* FROM grupos WHERE id=\?")
    def _(m, a):
        d = _MDB.grupos.find_one({'_id': a[0]})
        return _MCur([_Row(TCOLS['grupos'], [d.get(c) for c in TCOLS['grupos']])] if d else [])

    @h(r"SELECT 1 FROM grupos WHERE nome=\? COLLATE NOCASE OR tag=\?")
    def _(m, a):
        d = _MDB.grupos.find_one({'$or': [{'nome': _ci(a[0])}, {'tag': a[1]}]})
        return _MCur([_Row(['1'], [1])] if d else [])

    @h(r"SELECT g\.\*, \(SELECT COUNT\(\*\) FROM membros m WHERE m\.gid=g\.id\) n FROM grupos g ORDER BY n DESC, g\.id LIMIT 40")
    def _(m, a):
        rows = []
        for d in _MDB.grupos.find():
            n = _MDB.membros.count_documents({'gid': d['_id']})
            rows.append((n, d['_id'], _Row(TCOLS['grupos'] + ['n'], [d.get(c) for c in TCOLS['grupos']] + [n])))
        rows.sort(key=lambda x: (-x[0], x[1]))
        return _MCur([r for _, _, r in rows[:40]])

    @h(r"UPDATE grupos SET dono=\? WHERE id=\?")
    def _(m, a):
        r = _MDB.grupos.update_one({'_id': a[1]}, {'$set': {'dono': a[0]}})
        return _MCur(rowcount=r.modified_count)

    @h(r"DELETE FROM grupos WHERE id=\?")
    def _(m, a):
        r = _MDB.grupos.delete_one({'_id': a[0]})
        return _MCur(rowcount=r.deleted_count)

    @h(r"SELECT ([\w, ]+) FROM membros WHERE gid=\?( ORDER BY desde)?( LIMIT (\d+))?")
    def _(m, a):
        cols = [c.strip() for c in m.group(1).split(',')]
        cur = _MDB.membros.find({'gid': a[0]})
        if m.group(2):
            cur = cur.sort('desde', 1)
        if m.group(4):
            cur = cur.limit(int(m.group(4)))
        return _MCur([_Row(cols, [d.get(c) for c in cols]) for d in cur])

    @h(r"SELECT COUNT\(\*\) FROM membros WHERE gid=\?")
    def _(m, a):
        return _MCur([_Row(['COUNT(*)'], [_MDB.membros.count_documents({'gid': a[0]})])])

    @h(r"SELECT 1 FROM membros WHERE uid=\? AND gid=\?")
    def _(m, a):
        d = _MDB.membros.find_one({'_id': a[0], 'gid': a[1]})
        return _MCur([_Row(['1'], [1])] if d else [])

    @h(r"DELETE FROM membros WHERE uid=\?")
    def _(m, a):
        r = _MDB.membros.delete_one({'_id': a[0]})
        return _MCur(rowcount=r.deleted_count)

    @h(r"UPDATE membros SET cargo='([^']*)' WHERE uid=\?")
    def _(m, a):
        r = _MDB.membros.update_one({'_id': a[0]}, {'$set': {'cargo': m.group(1)}})
        return _MCur(rowcount=r.modified_count)

    @h(r"SELECT m\.uid, g\.tag, g\.id, g\.tipo FROM membros m JOIN grupos g ON g\.id=m\.gid WHERE m\.uid IN \(([^)]*)\)")
    def _(m, a):
        ids = _ids(m.group(1).split(','), a)
        mbs = list(_MDB.membros.find({'_id': {'$in': ids}}))
        gs = {g['_id']: g for g in _MDB.grupos.find({'_id': {'$in': [mb['gid'] for mb in mbs]}})}
        rows = []
        for mb in mbs:
            g = gs.get(mb.get('gid'))
            if g:
                rows.append(_Row(['uid', 'tag', 'id', 'tipo'], [mb['_id'], g.get('tag'), g['_id'], g.get('tipo')]))
        return _MCur(rows)

    @h(r"SELECT g\.tag, g\.id, g\.tipo FROM membros m JOIN grupos g ON g\.id=m\.gid WHERE m\.uid=\?")
    def _(m, a):
        mb = _MDB.membros.find_one({'_id': a[0]})
        g = _MDB.grupos.find_one({'_id': mb.get('gid')}) if mb else None
        return _MCur([_Row(['tag', 'id', 'tipo'], [g.get('tag'), g['_id'], g.get('tipo')])] if g else [])

    @h(r"SELECT g\.nome, g\.tag, g\.tipo, m\.cargo FROM membros m JOIN grupos g ON g\.id=m\.gid WHERE m\.uid=\?")
    def _(m, a):
        mb = _MDB.membros.find_one({'_id': a[0]})
        g = _MDB.grupos.find_one({'_id': mb.get('gid')}) if mb else None
        return _MCur([_Row(['nome', 'tag', 'tipo', 'cargo'], [g.get('nome'), g.get('tag'), g.get('tipo'), mb.get('cargo')])] if g else [])

    # ---------------- amigos ----------------
    @h(r"SELECT COUNT\(\*\) FROM amigos WHERE uid=\? AND ok=1")
    def _(m, a):
        return _MCur([_Row(['COUNT(*)'], [_MDB.amigos.count_documents({'uid': a[0], 'ok': 1})])])

    @h(r"SELECT ok FROM amigos WHERE uid=\? AND fid=\?")
    def _(m, a):
        d = _MDB.amigos.find_one({'_id': f"{a[0]}:{a[1]}"})
        return _MCur([_Row(['ok'], [d.get('ok')])] if d else [])

    @h(r"SELECT 1 FROM amigos WHERE uid=\? AND fid=\?")
    def _(m, a):
        d = _MDB.amigos.find_one({'_id': f"{a[0]}:{a[1]}"})
        return _MCur([_Row(['1'], [1])] if d else [])

    @h(r"SELECT fid, ok FROM amigos WHERE uid=\?")
    def _(m, a):
        return _MCur([_Row(['fid', 'ok'], [d.get('fid'), d.get('ok')]) for d in _MDB.amigos.find({'uid': a[0]})])

    @h(r"SELECT uid FROM amigos WHERE fid=\? AND ok=0")
    def _(m, a):
        return _MCur([_Row(['uid'], [d.get('uid')]) for d in _MDB.amigos.find({'fid': a[0], 'ok': 0})])

    @h(r"UPDATE amigos SET ok=1 WHERE uid=\? AND fid=\?")
    def _(m, a):
        r = _MDB.amigos.update_one({'_id': f"{a[0]}:{a[1]}"}, {'$set': {'ok': 1}})
        return _MCur(rowcount=r.modified_count)

    @h(r"DELETE FROM amigos WHERE \(uid=\? AND fid=\?\) OR \(uid=\? AND fid=\?\)")
    def _(m, a):
        r = _MDB.amigos.delete_many({'_id': {'$in': [f"{a[0]}:{a[1]}", f"{a[2]}:{a[3]}"]}})
        return _MCur(rowcount=r.deleted_count)

    # ---------------- anos ----------------
    @h(r"SELECT dia,n,ts FROM anos WHERE uid=\?")
    def _(m, a):
        d = _MDB.anos.find_one({'_id': a[0]})
        return _MCur([_Row(['dia', 'n', 'ts'], [d.get('dia'), d.get('n'), d.get('ts')])] if d else [])

    # ---------------- sms (caixa DarkCell) ----------------
    @h(r"SELECT s\.id, s\.de, s\.para, s\.txt, s\.ts, ud\.nome AS den, up\.nome AS paran, CASE WHEN s\.de=\? THEN .+ END AS num FROM sms s JOIN users ud ON ud\.id=s\.de JOIN users up ON up\.id=s\.para WHERE s\.de=\? OR s\.para=\? ORDER BY s\.id DESC LIMIT 120")
    def _(m, a):
        uid = a[0]
        docs = list(_MDB.sms.find({'$or': [{'de': uid}, {'para': uid}]}).sort('_id', -1).limit(120))
        ids = {d.get('de') for d in docs} | {d.get('para') for d in docs}
        us = {u['_id']: u for u in _MDB.users.find({'_id': {'$in': list(ids)}})}
        tels = {}
        for d in _MDB.kv.find({'_id': {'$in': [f'telu:{i}' for i in ids]}}):
            tels[d['_id']] = d.get('v')
        rows = []
        for d in docs:
            outro = d.get('para') if d.get('de') == uid else d.get('de')
            rows.append(_Row(['id', 'de', 'para', 'txt', 'ts', 'den', 'paran', 'num'],
                             [d['_id'], d.get('de'), d.get('para'), d.get('txt'), d.get('ts'),
                              (us.get(d.get('de')) or {}).get('nome'), (us.get(d.get('para')) or {}).get('nome'),
                              tels.get(f'telu:{outro}')]))
        return _MCur(rows)

    # ---------------- INSERT genérico (todas as tabelas) ----------------
    @h(r"INSERT( OR REPLACE| OR IGNORE)? INTO (\w+)\s*(?:\(([^)]*)\))?\s*VALUES\(([^)]*)\)(.*)$")
    def _(m, a):
        mode, t, cols_g, vals_g, suf = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5) or ''
        if t not in TCOLS:
            raise OperationFailure(f'[db] INSERT em tabela desconhecida: {t}')
        cols = [c.strip() for c in cols_g.split(',')] if cols_g else list(TCOLS[t])
        toks = [x.strip() for x in vals_g.split(',')]
        ai, d = iter(a), {}
        for c, tok in zip(cols, toks):
            if tok == '?':
                d[c] = next(ai)
            elif tok.upper() == 'NULL':
                d[c] = None
            elif tok.startswith("'"):
                d[c] = tok[1:-1]
            else:
                d[c] = float(tok) if '.' in tok else int(tok)
        lastrowid = None
        if t in SERIAL_M and 'id' not in d:
            d['id'] = _next_id(t)
            lastrowid = d['id']
        if t == 'amigos':
            d['_id'] = f"{d['uid']}:{d['fid']}"
        elif t in KEYF:
            d['_id'] = d[KEYF[t]]
        col = _MDB[t]
        if mode == ' OR IGNORE':
            col.update_one({'_id': d['_id']}, {'$setOnInsert': d}, upsert=True)
        elif mode == ' OR REPLACE' or 'ON CONFLICT' in suf.upper():
            col.replace_one({'_id': d['_id']}, d, upsert=True)
        else:
            col.insert_one(d)   # DuplicateKeyError -> pedb.IntegrityError
        return _MCur(lastrowid=lastrowid, rowcount=1)

    return H


_MH = None


def _mq(sql, args):
    """traduz e executa uma instrução SQL do servidor no MongoDB"""
    global _MH
    if _MH is None:
        _MH = _build_mongo_handlers()
    s = re.sub(r'\s+', ' ', sql.strip())
    for rx, f in _MH:
        m = rx.fullmatch(s)
        if m:
            return f(m, tuple(args))
    raise OperationFailure('[db] SQL sem tradução para MongoDB: ' + s[:220])


class _MgConn:
    """mesma interface de sqlite3.Connection usada pelo servidor; cada operação é autónoma (auto-commit)"""
    def execute(self, sql, args=()):
        return _mq(sql, tuple(args))

    def executescript(self, script):
        raise OperationFailure('executescript não existe em MongoDB (o esquema são índices, criados no arranque)')

    def commit(self):
        pass

    def close(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, et, ev, tb):
        return False


def _mongo_init():
    global _MCLI, _MDB
    with _INIT_LOCK:
        if _MDB is not None:
            return
        name = MONGO_DB
        if not name:
            mm = re.match(r'^mongodb(?:\+srv)?://[^/]+/([^?]+)', MONGO_URL)
            name = mm.group(1) if mm else 'proxima_encarnacao'
        cli = None
        for i in range(40):   # a base de dados pode ainda estar a arrancar (Northflank)
            try:
                cli = pymongo.MongoClient(MONGO_URL, appname=f"pe-no{os.environ.get('NODE', '1')}",
                                          serverSelectionTimeoutMS=8000, maxPoolSize=POOL_MAX * 4)
                cli.admin.command('ping')
                break
            except PyMongoError as e:
                print(f'[db] MongoDB ainda não responde ({e.__class__.__name__}); nova tentativa em 3 s...', flush=True)
                time.sleep(3)
        else:
            raise SystemExit('[db] não foi possível ligar ao MongoDB (MONGODB_URI)')
        _MCLI, _MDB = cli, cli[name]
        _MDB.users.create_index('email', unique=True)
        _MDB.users.create_index('nome')
        _MDB.sessions.create_index('criado')
        _MDB.ads.create_index('exp')
        _MDB.amigos.create_index('fid')
        _MDB.membros.create_index('gid')
        _MDB.evq.create_index('uid')
        _MDB.sms.create_index('para')
        _MDB.sms.create_index('de')
        for t in SERIAL_M:   # os contadores de id continuam acima do maior id já existente
            top = _MDB[t].find_one(sort=[('_id', -1)])
            if top:
                _MDB.counters.update_one({'_id': t}, {'$max': {'n': int(top['_id'])}}, upsert=True)
