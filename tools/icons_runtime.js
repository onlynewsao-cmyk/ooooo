const EMO_RE = /(?:[\u{1F1E6}-\u{1F1FF}]{2}|[\u{1F000}-\u{1FAFF}\u2190-\u21FF\u2300-\u23FF\u2600-\u27BF\u2B00-\u2BFF\u2122\u2139\u3030\u303D\u203C\u2049])(?:\uFE0F|\u200D[\u{1F000}-\u{1FAFF}\u2600-\u27BF]\uFE0F?|[\u{1F3FB}-\u{1F3FF}])*/gu;
const EMO_TEST = new RegExp(EMO_RE.source, 'u');
function emoKey(s) {
  const k = s.replace(/[\uFE0F\u{1F3FB}-\u{1F3FF}]/gu, '');
  if (EMO_MAP[k]) return EMO_MAP[k];
  return EMO_MAP[String.fromCodePoint(k.codePointAt(0))] || null;
}
const stripEmo = s => String(s).replace(EMO_RE, '').replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
const ic = (name, cls = '') => ICON_D[name] ? `<svg class="ic ic-${name} ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON_D[name]}"/></svg>` : '';
const emoIcon = s => { const m = String(s).match(EMO_TEST); return m ? emoKey(m[0]) : null; };
const _icTpl = {};
function icEl(name) {
  if (!_icTpl[name]) {
    const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'ic ic-' + name); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', ICON_D[name]); s.appendChild(p); _icTpl[name] = s;
  }
  return _icTpl[name].cloneNode(true);
}
const IC_SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'svg', 'path', 'TITLE', 'CANVAS', 'NOSCRIPT']);
function iconizeText(t) {
  const p = t.parentNode; if (!p) return;
  if (p.nodeName === 'OPTION') { if (EMO_TEST.test(t.data)) t.data = stripEmo(t.data); return; }
  if (IC_SKIP.has(p.nodeName) || (p.closest && p.closest('[data-noic]'))) return;
  const s = t.data; if (!EMO_TEST.test(s)) return;
  const frag = document.createDocumentFragment(); let last = 0, m; EMO_RE.lastIndex = 0;
  while ((m = EMO_RE.exec(s))) {
    if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
    const n = emoKey(m[0]); if (n && ICON_D[n]) frag.appendChild(icEl(n));
    last = m.index + m[0].length;
  }
  if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
  p.replaceChild(frag, t);
}
function iconizeNode(root) {
  if (!root) return;
  if (root.nodeType === 3) return iconizeText(root);
  if (root.nodeType !== 1 || IC_SKIP.has(root.nodeName)) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => EMO_TEST.test(n.data) ? 1 : 2 });
  const list = []; while (w.nextNode()) list.push(w.currentNode); list.forEach(iconizeText);
  if (root.querySelectorAll) root.querySelectorAll('[placeholder]').forEach(e => { if (EMO_TEST.test(e.placeholder)) e.placeholder = stripEmo(e.placeholder); });
}
new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') iconizeText(m.target); else m.addedNodes.forEach(iconizeNode); } })
  .observe(document.documentElement, { childList: true, subtree: true, characterData: true });
if (document.body) iconizeNode(document.body); else addEventListener('DOMContentLoaded', () => iconizeNode(document.body));
(() => { const c = window.confirm.bind(window), a = window.alert.bind(window); window.confirm = m => c(stripEmo(m)); window.alert = m => a(stripEmo(m)); })();
/* desenhar um ícone num canvas 2D (rótulos 3D, minimapa) */
function drawIc(x, name, cx, cy, size, color, lw = 2.2) {
  const d = ICON_D[name]; if (!d) return;
  x.save(); x.translate(cx - size / 2, cy - size / 2); x.scale(size / 24, size / 24);
  x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = color; x.stroke(new Path2D(d)); x.restore();
}
