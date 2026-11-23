"""Validação de nomes de jogador do Próxima Encarnação.

Só entram nomes "normais": letras (com acentos), números e _ —
sem emojis nem símbolos. Ex.: draka, _draka_, draka_4, Ze Kambala.
Nada de políticos, figuras públicas ou termos da equipa (admin…),
mesmo disfarçados com números e símbolos (h1tl3r, p.u.t.i.n).
Palavrões são detetados pelo filtro do chat. A unicidade
(nome ainda não usado) é garantida no servidor, no registo e na
mudança de nome do perfil.
"""
import re
import unicodedata
from chatfilter import filtrar, _base, _colapsa

# letras (com acentos), números e _; espaços só entre palavras; 2–24 caracteres
NOME_RE = re.compile(r'^(?=.{2,24}$)[\wÀ-ÖØ-öø-ÿ]+(?: [\wÀ-ÖØ-öø-ÿ]+)*$')

# figuras políticas e públicas — escritas sem acentos; são normalizadas e
# "colapsadas" (letras repetidas cortadas) como os nomes testados
FRASES_FIG = """
joaolourenco joaogoncalveslourenco eduardodossantos joseeduardo zedudossantos isabeldossantos
adalbertocosta costajunior agostinhoneto antonioagostinho savimbi jonassavimbi
holdenroberto chivukuvuku bornitodesouza
putin trump obama biden zelensky zelenski macron jinping xijinping kimjong maduro
bolsonaro luladasilva hitler stalin mussolini fidelcastro cheguevara gaddafi kadhafi
saddam binladen lukashenko erdogan netanyahu milei
cristianoronaldo ronaldinho neymar mbappe haaland bellingham lebron jameslebron
michaeljordan michaeljackson elonmusk billgates zuckerberg bezos
beyonce rihanna shakira bieber eminem taylorswift
anselmoralph nagrelha yolasemedo
admin administrador administradora moderador moderadora suporte staff proximaencarnacao
"""
# curtas demais para procurar "dentro" do nome: só contam como palavra inteira
TOKENS_BLOQ = {'mpla', 'unita', 'fnla', 'cr7', 'messi', 'lula'}

FIG = {_colapsa(f) for f in FRASES_FIG.split()}
TOK = {_colapsa(t) for t in TOKENS_BLOQ}


def limpar(nome):
    """Normaliza espaços e corta pontas. Não mexe nos caracteres."""
    return re.sub(r'\s+', ' ', str(nome or '')).strip()


def _norm(nome):
    """minúsculas, sem acentos, leetspeak traduzido, só [a-z0-9], repetições colapsadas."""
    return _colapsa(re.sub(r'[^a-z0-9]', '', _base(nome)))


def validar_nome(nome):
    """Devolve (ok, erro). Formato + figuras públicas + ofensas. A unicidade é no servidor."""
    n = limpar(nome)
    if len(n) < 2:
        return False, 'O nome precisa de pelo menos 2 letras.'
    if len(n) > 24:
        return False, 'O nome pode ter no máximo 24 caracteres.'
    if not NOME_RE.match(n):
        return False, 'O nome só pode ter letras, números e _ (sem emojis nem símbolos).'
    if not any(c.isalpha() for c in n):
        return False, 'O nome precisa de letras.'
    base = _norm(n)
    if any(f in base for f in FIG):
        return False, 'Esse nome não é permitido. Usa um nome teu — nomes de políticos e figuras públicas ficam fora do jogo.'
    cru = _base(n)                                   # tokens com leet traduzido (h1tl3r)…
    sem = ''.join(c for c in unicodedata.normalize('NFD', n.lower()) if unicodedata.category(c) != 'Mn')  # …e sem traduzir (unita7, cr7)
    toks = set()
    for v in (cru, sem):
        toks |= set(re.split(r'[^a-z0-9]+', v)) | set(re.split(r'[^a-z]+', v))
    toks = {_colapsa(t) for t in toks if t}
    if toks & TOK:
        return False, 'Esse nome não é permitido. Política e figuras públicas ficam fora do jogo.'
    _, hits, bloq, _ = filtrar(n)
    if hits or bloq:
        return False, 'Esse nome não é permitido. Joga com respeito.'
    return True, ''


if __name__ == '__main__':
    ok_list = ['draka', '_draka_', 'draka_4', 'Ze Kambala', 'Mário Silva', 'João7', 'kiluanje_2',
               'MC Kota', 'x2', 'ndalu_', 'A B', 'Êxodo_20', 'puto', 'Messias', 'Lulanja']
    mau_list = ['x', '', '🔥Rei🔥', 'draka!', '@draka', 'dr aka', 'João Lourenço', 'joao_lourenco',
                'Putin', 'p.u.t.i.n', 'h1tl3r', 'TRUMP2024', 'truuumP', 'Savimbi', 'MPLA_kota',
                'unita7', 'obama_', 'cr7', 'Messi10', 'lula', 'Admin', 'administrador',
                'eu sou o admin', 'merda', 'p3rr4', 'vou te matar', 'a' * 25, '_', '___', '123',
                'costa junior', 'IsAbEl DoS sAnToS', 'Neymar Jr']
    for n in ok_list:
        ok, erro = validar_nome(n)
        print(('OK  ' if ok else 'FALHOU'), repr(n), erro)
    print('---')
    for n in mau_list:
        ok, erro = validar_nome(n)
        print(('BLOQUEADO ' if not ok else 'PASSOU!!'), repr(n), erro)
