"""Filtro inteligente de ofensas para o chat do Próxima Encarnação.

Deteta palavrões e insultos em português (Angola, Portugal, Brasil) e inglês, mesmo
disfarçados: acentos, números no lugar de letras (put4, m3rda), letras repetidas
(puuuta), letras separadas (p u t a, p.u.t.a) e frases coladas (filhodaputa).
Evita falsos positivos ("computador", "cultura", "puto" = miúdo em Angola),
porque compara palavra a palavra e só procura frases longas dentro do texto colado.
Também bloqueia links, esconde números de telefone e trava spam e gritos.
"""
import re
import unicodedata

PALAVRAS = """
puta putas caralho caralhos krl crl krlh porra merda merdas mrd foda fodase fodasse foder fodido fodida
fodam fode fodeu fodi fodes cona conas pila piroca cu cus cuzao cuzoes cabrao cabroes cabra corno cornos
chifrudo viado viados paneleiro paneleiros maricas otario otaria otarios idiota idiotas imbecil imbecis
estupido estupida estupidos burro burra burros retardado retardada mongoloide anormal vadia vadias
vagabunda vagabundo desgracado desgracada nojento nojenta arrombado arrombada babaca escroto escrota
buceta boceta xoxota bosta fdp pqp vsf vtnc tnc matumbo matumba macaco macaca ngulu porco porca
fuck fucking fucker shit bitch bitches asshole nigger nigga niggas cunt dick motherfucker bastard
""".split()
RAIZES = """caralh fodid foder fodas putaria putinha merdinh cabron arromb desgrac retardad imbecil idiot
estupid otari viadinh fuck motherf bitch nigg paneleir escrot vagabund""".split()
FRASES = """filhodaputa filhadaputa filhodeumaputa putaquepariu putaqueopariu vaitefoder vaisefoder
vaiafoder vaitomarnocu tomanocu tomarnocu enfianocu vaiprocaralho vaipocaralho voutematar
voutefoder eutemato vouacabarcontigo voutepartir""".lower().split()
AMEACAS = {'voutematar', 'eutemato', 'vouacabarcontigo', 'voutepartir'}

LEET = str.maketrans({'0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't'})


def _base(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.translate(LEET)


def _colapsa(s):
    return re.sub(r'(.)\1+', r'\1', s)


BAD = {_colapsa(w) for w in PALAVRAS}
ROOTS = [_colapsa(w) for w in RAIZES]
PHR = [_colapsa(w) for w in FRASES]


def _mau(tok):
    t = _colapsa(re.sub(r'[^a-z]', '', _base(tok)))
    if not t:
        return False
    if t in BAD or (t.endswith('s') and t[:-1] in BAD):
        return True
    return any(t.startswith(r) for r in ROOTS)


def filtrar(txt):
    """Devolve (texto_limpo, ofensas, bloqueado, motivo)."""
    txt = re.sub(r'\s+', ' ', str(txt or '')).strip()[:140]
    if not txt:
        return '', 0, True, 'vazio'
    if re.search(r'(https?://|www\.|\b[a-z0-9-]+\.(com|net|org|ao|io|me|ly|gg)\b)', txt, re.I):
        return '', 0, True, 'Links não são permitidos no chat.'
    # números de telefone (9+ dígitos) ficam escondidos, por segurança
    txt = re.sub(r'(?:\+?\d[\s.-]?){9,}', '[número escondido]', txt)
    letras = [c for c in txt if c.isalpha()]
    if len(letras) >= 8 and sum(c.isupper() for c in letras) / len(letras) > .7:
        txt = txt.lower()
    toks = txt.split(' ')
    out, hits, i = [], 0, 0
    while i < len(toks):
        # letras soltas seguidas: "p u t a"
        j = i
        while j < len(toks) and len(re.sub(r'[^a-zA-Z0-9@$!]', '', toks[j])) == 1:
            j += 1
        if j - i >= 2 and _mau(''.join(toks[i:j])):
            out.append('•' * (j - i)); hits += 1; i = j; continue
        t = toks[i]
        if _mau(t):
            out.append(re.sub(r'\w', '•', t) if re.search(r'\w', t) else '•••'); hits += 1
        else:
            out.append(t)
        i += 1
    colado = _colapsa(re.sub(r'[^a-z]', '', _base(txt)))
    frase = [p for p in PHR if p in colado]
    limpo = ' '.join(out)
    if any(p in AMEACAS for p in frase):
        return '', hits + 1, True, 'Ameaças não são permitidas. Joga com respeito.'
    if frase:
        return '', hits + 1, True, 'Mensagem ofensiva bloqueada.'
    if hits >= 3:
        return '', hits, True, 'Mensagem ofensiva bloqueada.'
    return limpo, hits, False, ''


if __name__ == '__main__':
    for t in ['Olá a todos!', 'o meu computador é fixe', 'puto, bora à cultura', 'és um p u t a',
              'vai te f0d3r', 'filho da puta', 'm3rdaaaa', 'liga 923 456 789', 'www.site.com',
              'ESTOU MUITO FELIZ HOJE', 'vou te matar', 'idiotas todos', 'Kota, fixe!', 'p.u.t.a', 'que porra é essa', 'este mato é verde', 'vou matar tempo', 'eu te mato', 'filho da p u t a']:
        print(repr(t), '->', filtrar(t))
