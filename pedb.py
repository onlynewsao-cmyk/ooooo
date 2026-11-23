"""
Próxima Encarnação — camada de base de dados.

  • Sem DATABASE_URL  -> SQLite local (data/jogo.db), como sempre (desenvolvimento / 1 máquina).
  • Com DATABASE_URL=postgresql://...  -> PostgreSQL partilhado por todos os nós (Northflank, 5k-10k jogadores).

O resto do servidor continua a escrever SQL ao estilo SQLite ( ? , INSERT OR REPLACE, ...);
aqui é traduzido automaticamente para PostgreSQL. Ligações reutilizadas num pool por processo.
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
  adulto INTEGER DEFAULT 0, avatar TEXT DEFAULT '{}',
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
'''

SCHEMA_PG = '''
CREATE TABLE IF NOT EXISTS users(
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  salt TEXT NOT NULL, hash TEXT NOT NULL,
  adulto INTEGER DEFAULT 0, avatar TEXT DEFAULT '{}',
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
    """fábrica usada pelo servidor: db() -> ligação com a mesma interface nos dois modos"""
    if PG:
        if not _POOL:
            _pg_init()
        return _PgConn()
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
        return
    with connect(sqlite_path) as c:
        c.executescript(SCHEMA_SQLITE)
        c.execute('PRAGMA journal_mode=WAL')


def descr():
    if PG:
        h = re.sub(r'//[^@/]*@', '//***@', URL)
        return f'PostgreSQL ({h.split("?")[0]}) pool={POOL_MAX}'
    return 'SQLite local'
