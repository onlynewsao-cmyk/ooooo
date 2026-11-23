# Monta o trailer a partir dos frames capturados do jogo (tools: Playwright + PIL + ffmpeg).
# Uso: python3 tools/trailer_compose.py <pasta_frames> <musica.wav> <saida.mp4>
import sys, os, glob, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
SRC, MUS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, FPS = 1280, 720, 24
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
FR = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F = lambda p, s: ImageFont.truetype(p, s)
TMP = '/tmp/trf'; os.makedirs(TMP, exist_ok=True)
for f in glob.glob(TMP + '/*.jpg'): os.remove(f)
GOLD = (255, 203, 0)

def seq(name, a=0, b=None):
    fs = sorted(glob.glob(f'{SRC}/{name}_*.jpg'))[a:b]
    return fs

def up(frames):  # 12 fps -> 24 fps com frame intermédio misturado
    L = lambda f: Image.open(f).convert('RGB').resize((W, H))
    prev = None
    for i, f in enumerate(frames):
        im = L(f)
        if prev is not None: yield Image.blend(prev, im, .5)
        yield im; prev = im
    yield prev

def grad_text(txt, font, c1=(255, 226, 120), c2=(255, 170, 0)):
    bb = font.getbbox(txt); w, h = bb[2] - bb[0] + 8, bb[3] - bb[1] + 12
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((4 - bb[0], 6 - bb[1]), txt, font=font, fill=255)
    g = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(g)
    for y in range(h):
        k = y / max(1, h - 1); d.line([(0, y), (w, y)], fill=tuple(int(c1[i] + (c2[i] - c1[i]) * k) for i in range(3)))
    return g, m

def bg_card(t):
    im = Image.new('RGB', (W, H), (12, 10, 20)); d = ImageDraw.Draw(im)
    for r in range(0, 900, 6):  # brilho radial dourado
        k = max(0, 1 - r / 700) ** 2.2
        col = (int(12 + 60 * k), int(10 + 40 * k), int(20 + 8 * k))
        d.ellipse([W / 2 - r * 1.4, H / 2 - r, W / 2 + r * 1.4, H / 2 + r], outline=col, width=7)
    # linhas finas a mexer (fundo vivo)
    for i in range(14):
        x = (i * 97 + t * 40) % (W + 200) - 100
        d.line([(x, 0), (x - 160, H)], fill=(30, 24, 44), width=2)
    return im.filter(ImageFilter.GaussianBlur(2))

def title_card(n, sub, small=None, extra=None):
    f1, f2 = F(FB, 108), F(FB, 30)
    l1, l2 = 'PRÓXIMA', 'ENCARNAÇÃO'
    for i in range(n):
        t = i / FPS; im = bg_card(t)
        a = min(1, t / .8)
        sc = 1 + .04 * (1 - min(1, t / 1.2))
        for j, (txt, y) in enumerate([(l1, 200), (l2, 318)]):
            g, m = grad_text(txt, f1)
            if sc != 1: g = g.resize((int(g.width * sc), int(g.height * sc))); m = m.resize(g.size)
            aj = max(0, min(1, (t - j * .25) / .6))
            sh = Image.new('L', m.size, 0); sh.paste(m.point(lambda v: int(v * .55 * aj)))
            im.paste((0, 0, 0), ((W - g.width) // 2 + 4, y + 6), sh.filter(ImageFilter.GaussianBlur(5)))
            im.paste(g, ((W - g.width) // 2, y), m.point(lambda v: int(v * aj)))
        d = ImageDraw.Draw(im)
        if sub:
            a2 = max(0, min(1, (t - .9) / .6)); col = tuple(int(c * a2) for c in (255, 255, 255))
            bb = d.textbbox((0, 0), sub, font=f2); d.text(((W - bb[2]) // 2, 470), sub, font=f2, fill=col)
            d.line([((W - 260) // 2, 455), ((W + 260) // 2, 455)], fill=tuple(int(c * a2) for c in GOLD), width=3)
        if extra:
            a3 = max(0, min(1, (t - 1.4) / .6)); fe = F(FB, 26)
            bb = d.textbbox((0, 0), extra, font=fe); bw = bb[2] + 56
            x0 = (W - bw) // 2
            d.rounded_rectangle([x0, 530, x0 + bw, 584], 27, fill=tuple(int(c * a3) for c in GOLD))
            d.text((x0 + 28, 543), extra, font=fe, fill=(12, 10, 20))
        if small:
            a4 = max(0, min(1, (t - 1.8) / .6)); fs = F(FR, 20)
            bb = d.textbbox((0, 0), small, font=fs); d.text(((W - bb[2]) // 2, 660), small, font=fs, fill=tuple(int(c * a4 * .75) for c in (255, 255, 255)))
        yield im

def caption(frames, txt, kicker=None, n=None):
    f, fk = F(FB, 40), F(FB, 22)
    if n is None: frames = list(frames); n = len(frames)
    for i, im in enumerate(frames):
        t = i / FPS; im = im.copy()
        a = max(0, min(1, (t - .25) / .45)) * max(0, min(1, (n / FPS - t - .1) / .35))
        if a > 0:
            ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
            # vinheta inferior para leitura
            for y in range(H - 220, H): d.line([(0, y), (W, y)], fill=(0, 0, 0, int(150 * a * ((y - (H - 220)) / 220) ** 1.6)))
            dx = int((1 - a) * -30)
            bb = d.textbbox((0, 0), txt, font=f)
            d.rectangle([56 + dx, H - 140, 63 + dx, H - 54], fill=GOLD + (int(255 * a),))
            if kicker: d.text((82 + dx, H - 140), kicker.upper(), font=fk, fill=GOLD + (int(255 * a),))
            d.text((82 + dx, H - 98), txt, font=f, fill=(0, 0, 0, int(140 * a)))
            d.text((80 + dx, H - 100), txt, font=f, fill=(255, 255, 255, int(255 * a)))
            im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
        yield im

def tvwall(n_each=10):
    out = []
    fs = [f'{SRC}/tv_{k}.jpg' for k in (0, 1, 2, 3, 4, 6) if os.path.exists(f'{SRC}/tv_{k}.jpg')]
    for k, f in enumerate(fs):
        tv = Image.open(f).convert('RGB').resize((W, H))
        for i in range(n_each):
            z = 1.0 + .05 * (i / n_each)
            im = tv.resize((int(W * z), int(H * z))); x, y = (im.width - W) // 2, (im.height - H) // 2
            im = im.crop((x, y, x + W, y + H)); base = im.copy()
            # linhas de varrimento leves (ar de televisão)
            d = ImageDraw.Draw(im)
            for yy in range(0, H, 4): d.line([(0, yy), (W, yy)], fill=(0, 0, 0), width=1) if (yy // 4) % 2 else None
            out.append(Image.blend(base, im, .25))
    return out

class Writer:
    def __init__(s): s.n = 0; s.buf = []
    def put(s, im):
        s.buf.append(im)
        while len(s.buf) > 12: s._w(s.buf.pop(0))
    def _w(s, im): im.save(f'{TMP}/{s.n:05d}.jpg', quality=93); s.n += 1
    def seg(s, gen, xf=6):
        first = s.n > 0 or s.buf
        for k, im in enumerate(gen):
            if first and k < xf and len(s.buf) >= xf:
                idx = len(s.buf) - xf + k; s.buf[idx] = Image.blend(s.buf[idx], im, (k + 1) / (xf + 1))
            else: s.put(im)
    def end(s):
        m = len(s.buf)
        for i in range(m): k = 1 - (i + 1) / (m + 1); s.buf[i] = Image.blend(Image.new('RGB', (W, H)), s.buf[i], k)
        for im in s.buf: s._w(im)
        s.buf = []
w = Writer()
w.seg(title_card(int(3.0 * FPS), None))
w.seg(caption(up(seq('a_aerial')), 'Luanda como nunca viste', 'Um mundo aberto', n=2*len(seq('a_aerial'))))
w.seg(caption(up(seq('b_walk')), 'Estuda, trabalha, escolhe o teu caminho', 'Vida real', n=2*len(seq('b_walk'))))
w.seg(caption(up(seq('c_dance', 0, 26)), 'Kuduro, kizomba e semba', 'Dança', n=2*len(seq('c_dance', 0, 26))))
w.seg(caption(up(seq('d_salao', 6, 42)), 'Tranças, cortes e tatuagens', 'Estilo', n=2*len(seq('d_salao', 6, 42))))
w.seg(caption(tvwall(), 'Telejornal, Girabola e novela na TV', 'Ao vivo'))
w.seg(caption(up(seq('e_night')), 'Online com toda a banda, dia e noite', 'Multijogador', n=2*len(seq('e_night'))))
w.seg(title_card(int(5.2 * FPS), 'Joga já, no teu browser', 'Criada pela Dark Net AO', 'Grátis · PC e telemóvel'))
w.end()
dur = w.n / FPS

print('frames', w.n, 'dur', round(dur, 2))

import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
A = os.path.join(ROOT, '3d', 'audio')
t1, t2 = 1.3, dur - 12.3
flt = (f"[1:a]atrim=0:{dur:.2f},afade=t=in:d=0.6,afade=t=out:st={dur-2.2:.2f}:d=2.2,volume=0.85[m];"
       f"[2:a]adelay={int(t1*1000)}|{int(t1*1000)},volume=1.6[v1];[3:a]adelay={int(t2*1000)}|{int(t2*1000)},volume=1.6[v2];"
       f"[v1][v2]amix=inputs=2:normalize=0,apad[vo];[vo]asplit[vo1][vo2];"
       f"[m][vo1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];"
       f"[md][vo2]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-15:TP=-1.5:LRA=9,aresample=44100[a]")
cmd = [FF, '-y', '-framerate', str(FPS), '-i', f'{TMP}/%05d.jpg', '-i', MUS,
       '-i', f'{A}/trailer1.mp3', '-i', f'{A}/trailer2.mp3', '-filter_complex', flt,
       '-map', '0:v', '-map', '[a]', '-vf', 'scale=out_range=tv:out_color_matrix=bt709,format=yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p',
       '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-movflags', '+faststart', '-t', f'{dur:.2f}', OUT]
r = subprocess.run(cmd, capture_output=True, text=True)
print(r.returncode, r.stderr[-1500:] if r.returncode else 'ok')
