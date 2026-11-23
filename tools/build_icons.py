# Gera 3d/icons.js a partir do lucide-static (ISC) — ícones de traço consistentes
import re, json, sys, os
SRC = '/tmp/luc/node_modules/lucide-static/icons/'
def attrs(s): return dict(re.findall(r'([\w-]+)="([^"]*)"', s))
def f(v): return float(v)
def to_d(svg):
    d = []
    for tag, a in re.findall(r'<(path|circle|rect|line|polyline|polygon|ellipse)\b([^>]*)/?>', svg):
        A = attrs(a)
        if tag == 'path':
            pd = A['d'].strip()
            mm = re.match(r'm\s*(-?(?:\d+\.?\d*|\.\d+))[\s,]*(-?(?:\d+\.?\d*|\.\d+))\s*,?\s*(.*)$', pd, re.S)
            if mm:  # 'm' inicial relativo -> absoluto (os caminhos são concatenados)
                rest = mm.group(3)
                pd = f'M{mm.group(1)} {mm.group(2)}' + (('l' + rest) if rest and (rest[0].isdigit() or rest[0] in '-.') else rest)
            d.append(pd)
        elif tag == 'circle':
            cx, cy, r = f(A['cx']), f(A['cy']), f(A['r']); d.append(f'M{cx-r} {cy}a{r} {r} 0 1 0 {2*r} 0a{r} {r} 0 1 0 {-2*r} 0')
        elif tag == 'ellipse':
            cx, cy, rx, ry = f(A['cx']), f(A['cy']), f(A['rx']), f(A['ry']); d.append(f'M{cx-rx} {cy}a{rx} {ry} 0 1 0 {2*rx} 0a{rx} {ry} 0 1 0 {-2*rx} 0')
        elif tag == 'line': d.append(f"M{A['x1']} {A['y1']}L{A['x2']} {A['y2']}")
        elif tag in ('polyline', 'polygon'):
            n = re.findall(r'-?[\d.]+', A['points']); pts = [f'{n[i]} {n[i+1]}' for i in range(0, len(n) - 1, 2)]
            d.append('M' + 'L'.join(pts) + ('Z' if tag == 'polygon' else ''))
        elif tag == 'rect':
            x, y, w, h = f(A.get('x', 0)), f(A.get('y', 0)), f(A['width']), f(A['height']); r = f(A.get('rx', A.get('ry', 0)))
            if r: d.append(f'M{x+r} {y}h{w-2*r}a{r} {r} 0 0 1 {r} {r}v{h-2*r}a{r} {r} 0 0 1 {-r} {r}h{-(w-2*r)}a{r} {r} 0 0 1 {-r} {-r}v{-(h-2*r)}a{r} {r} 0 0 1 {r} {-r}z')
            else: d.append(f'M{x} {y}h{w}v{h}h{-w}z')
    return ''.join(d)
CUSTOM = {
  'yin-yang': 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM12 2a5 5 0 0 1 0 10a5 5 0 0 0 0 10M12 6.5v.01M12 17.5v.01',
  'mars': 'M5 14a5 5 0 1 0 10 0a5 5 0 1 0-10 0M13.5 10.5L20 4M15 4h5v5',
  'venus': 'M7 9a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 14v7M9 18h6',
}
EMO = json.load(open(sys.argv[1]))
names = sorted(set(EMO.values()) | set(sys.argv[2].split(',')))
D = {}
for n in names:
    if n in CUSTOM: D[n] = CUSTOM[n]; continue
    p = SRC + n + '.svg'
    if not os.path.exists(p): print('MISSING', n); continue
    D[n] = to_d(open(p).read())
js = '/* Ícones: Lucide (ISC License, lucide.dev) + 3 personalizados. Gerado por tools/build_icons.py */\n'
js += 'const ICON_D = ' + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + ';\n'
js += 'const EMO_MAP = ' + json.dumps(EMO, ensure_ascii=False, separators=(',', ':')) + ';\n'
js += open(os.path.join(os.path.dirname(__file__), 'icons_runtime.js')).read()
open('/home/user/proxima-encarnacao/3d/icons.js', 'w').write(js)
print(len(D), 'icons', len(js)//1024, 'KB')
