/* =========================================================
   vida4.js — Seletor visual de escolhas (casas, universidades, cursos, técnicos, vagas),
   nascer na rua / Abrigo da Missão, amigos só online, perfil completo de jogador
   (amizade, MP, dinheiro, presentes, convites, namoro, desafios, denúncia) e interiores melhores.
   ========================================================= */
(function () {
  const st = document.createElement('style');
  st.textContent = `
.sf4{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none;touch-action:pan-x}
.sf4::-webkit-scrollbar{display:none}.sf4 .chip{flex-shrink:0}
.sg4{display:grid;grid-template-columns:repeat(auto-fill,minmax(146px,1fr));gap:10px;margin-bottom:8px}
.sc4{position:relative;display:flex;flex-direction:column;text-align:left;border-radius:14px;overflow:hidden;background:#17171d;border:1px solid var(--line);transition:transform .14s,border-color .14s,box-shadow .14s;min-width:0;animation:pop .3s both}
.sc4:hover{border-color:#ffcb00;transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,0,0,.5)}
.sc4:active{transform:scale(.97)}
.sc4.cur{border-color:#2ecc71;box-shadow:0 0 0 1px #2ecc71 inset}
.sc4.off .sc4i>img,.sc4.off .sc4big{filter:saturate(.25) brightness(.62)}
.sc4i{position:relative;aspect-ratio:16/10;background:linear-gradient(135deg,var(--g1,#333),var(--g2,#111));overflow:hidden}
.sc4i>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .4s}
.sc4:hover .sc4i>img{transform:scale(1.06)}
.sc4i:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.78));pointer-events:none}
.sc4big{position:absolute;inset:0;display:grid;place-items:center;font-size:46px}
.sc4big .ic{width:46px;height:46px}
.sc4ic{position:absolute;left:8px;bottom:6px;z-index:1;font-size:20px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))}
.sc4b{position:absolute;top:7px;left:7px;z-index:1;font-size:9.5px;font-weight:900;padding:3px 7px;border-radius:9px;background:rgba(0,0,0,.62);color:#fff;letter-spacing:.4px;backdrop-filter:blur(4px);max-width:calc(100% - 44px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc4b.g{background:#1d7a45}.sc4b.y{background:#ffcb00;color:#111}.sc4b.r{background:#9c1f2c}
.sc4pr{position:absolute;right:8px;bottom:6px;z-index:1;font-weight:900;font-size:12px;color:#ffcb00;text-shadow:0 1px 3px #000}
.sc4t{padding:8px 10px 2px}
.sc4t b{font-size:13px;line-height:1.22;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sc4t small{display:block;font-size:11px;color:var(--mut);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc4k{display:flex;flex-wrap:wrap;gap:4px;padding:6px 10px 10px;margin-top:auto}
.sc4k i{font-style:normal;font-size:10px;font-weight:800;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,.07);color:#ddd}
.sc4k i.ok{background:#143d26;color:#7ef0ad}.sc4k i.no{background:#3d1414;color:#ff9a9a}
.sc4cmp{position:absolute;top:6px;right:6px;z-index:2;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.55);display:grid;place-items:center;font-size:12px;border:1px solid rgba(255,255,255,.25)}
.sc4cmp.on{background:#ffcb00;color:#111;border-color:#ffcb00}
.cb4{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:6px;padding:8px 10px;margin:0 0 10px;border-radius:12px;background:#2a2410;border:1px solid #6b5a12;font-size:12px;font-weight:800}
.cb4 span{flex:1}
#sel4{position:fixed;inset:0;z-index:55;background:rgba(5,5,8,.74);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;touch-action:auto}
#sel4.hidden{display:none}
.sd4{position:relative;width:min(560px,100%);max-height:92vh;overflow:auto;background:#131318;border:1px solid var(--line);border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,.7);animation:pop .25s;user-select:text;overscroll-behavior:contain}
.sd4.wide{width:min(760px,100%)}
.sd4h{position:relative;aspect-ratio:16/8;background:linear-gradient(135deg,var(--g1,#333),var(--g2,#111));overflow:hidden;flex-shrink:0}
.sd4h>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sd4h:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 30%,rgba(19,19,24,1) 99%);pointer-events:none}
.sd4h .sc4big{font-size:70px}.sd4h .sc4big .ic{width:70px;height:70px}
.sd4x,.sd4bk{position:absolute;top:10px;z-index:3;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.6);font-size:16px;font-weight:900;border:1px solid rgba(255,255,255,.2)}
.sd4x{right:10px}.sd4bk{left:10px;font-size:20px}
.sd4tt{position:absolute;left:16px;right:16px;bottom:10px;z-index:2}
.sd4tt .sc4b{position:static;display:inline-block;margin-bottom:6px}
.sd4tt h3{font-size:22px;line-height:1.15;text-shadow:0 2px 8px #000}
.sd4tt span.s{display:block;font-size:12px;color:#ddd;margin-top:3px;text-shadow:0 1px 4px #000}
.sd4c{padding:4px 16px 8px}
.sd4d{font-size:13px;color:#cfcfd8;line-height:1.55;margin:4px 0 12px}
.sd4s{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.sd4s>div{background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:12px;padding:8px 10px;min-width:0}
.sd4s small{display:block;font-size:9.5px;color:var(--mut);text-transform:uppercase;letter-spacing:1px;font-weight:800}
.sd4s b{font-size:15px;display:block;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sd4s .bar{height:5px;border-radius:3px;background:#24242c;margin-top:6px;overflow:hidden}.sd4s .bar i{display:block;height:100%;background:linear-gradient(90deg,#ffcb00,#2ecc71);border-radius:3px}
.sd4h4{font-size:11px;color:var(--mut);text-transform:uppercase;letter-spacing:1.5px;font-weight:800;margin:12px 0 6px}
.sd4pc{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sd4pc ul,.sd4r{list-style:none;font-size:12px;line-height:1.5;border-radius:12px;padding:8px 10px}
.sd4pc li,.sd4r li{padding:1px 0}
.sd4pc .p{border:1px solid #1d5a35;background:rgba(20,61,38,.35)}.sd4pc .p li:before{content:'+ ';color:#2ecc71;font-weight:900}
.sd4pc .c{border:1px solid #5a1d1d;background:rgba(61,20,20,.35)}.sd4pc .c li:before{content:'− ';color:#ff6b6b;font-weight:900}
.sd4r{border:1px solid var(--line);background:rgba(255,255,255,.03)}
.sd4r li.ok:before{content:'✓ ';color:#2ecc71;font-weight:900}.sd4r li.no{color:#ffb3b3}.sd4r li.no:before{content:'✗ ';color:#ff6b6b;font-weight:900}
.sd4car{display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:11px}
.sd4car i{font-style:normal;padding:3px 8px;border-radius:9px;background:#1f1f27;border:1px solid var(--line)}
.sd4car i:first-child{background:#2a2410;border-color:#6b5a12;color:#ffcb00}
.sd4car em{opacity:.5;font-style:normal}
.sd4a{position:sticky;bottom:0;z-index:3;display:flex;flex-direction:column;gap:7px;padding:14px 16px 16px;background:linear-gradient(180deg,rgba(19,19,24,0),#131318 22%)}
.sd4a .btn{width:100%;padding:12px 14px;font-size:13px}
.sd4a .r2{display:flex;gap:8px}.sd4a .r2 .btn{flex:1}
.btn:disabled{opacity:.42;filter:grayscale(.7);cursor:not-allowed;transform:none}
.sd4why{font-size:11px;color:#ff9a9a;text-align:center;margin-top:-3px}
.sd4cf{background:#1b1a12;border:1px solid #6b5a12;border-radius:14px;padding:12px;animation:pop .2s}
.sd4cf b.t{display:block;font-size:14px;margin-bottom:6px}
.sd4cf ul{list-style:none;font-size:12.5px;line-height:1.6;margin-bottom:10px}
.sd4cf li:before{content:'› ';color:#ffcb00;font-weight:900}
.ct4{width:100%;border-collapse:separate;border-spacing:0;font-size:12px}
.ct4 th,.ct4 td{padding:7px 6px;border-bottom:1px solid var(--line);text-align:center;vertical-align:middle}
.ct4 th:first-child,.ct4 td:first-child{text-align:left;color:var(--mut);font-weight:800;font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;width:26%}
.ct4 td.best{color:#7ef0ad;font-weight:900}
.ct4 .cti{width:100%;aspect-ratio:16/10;border-radius:10px;overflow:hidden;position:relative;background:linear-gradient(135deg,var(--g1),var(--g2));margin-bottom:5px}
.ct4 .cti img{width:100%;height:100%;object-fit:cover}.ct4 .cti .sc4big{font-size:28px}
.ru4{border-radius:16px;overflow:hidden;border:1px solid #5a2a1d;background:#1a1311;margin-bottom:10px}
.ru4i{position:relative;aspect-ratio:16/7;background:linear-gradient(135deg,#4a2a1d,#120c0a)}
.ru4i img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ru4i:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(26,19,17,1))}
.ru4i div{position:absolute;left:12px;bottom:8px;z-index:1}.ru4i b{font-size:19px;display:block}.ru4i span{font-size:12px;color:#ddd}
.ru4p{padding:8px 12px}.ru4p small{display:block;font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:1px;font-weight:800}
.ru4p .bar{height:7px;border-radius:4px;background:#2c2220;margin:5px 0 3px;overflow:hidden}.ru4p .bar i{display:block;height:100%;background:linear-gradient(90deg,#ff8a3d,#ffcb00)}
.ru4p b{font-size:12px}
.pf4h{position:relative;padding:18px 16px 12px;display:flex;gap:14px;align-items:center;background:radial-gradient(120% 140% at 0% 0%,var(--pc,#3a2a5a) 0%,rgba(19,19,24,0) 70%)}
.pf4av{width:84px;height:84px;border-radius:22px;flex-shrink:0;overflow:hidden;background:#1c1a22;border:2px solid rgba(255,255,255,.18);display:grid;place-items:center;font-size:36px;font-weight:900;color:#111;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.pf4av img{width:100%;height:100%;object-fit:cover}
.pf4n{min-width:0;flex:1}.pf4n h3{font-size:20px;line-height:1.15;word-break:break-word}
.pf4n .on{font-size:12px;color:#9a9aa8;margin-top:3px}.pf4n .on i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#2ecc71;margin-right:5px;box-shadow:0 0 8px #2ecc71}
.pf4n .on i.off{background:#666;box-shadow:none}
.pf4bd{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.pf4bd em{font-style:normal;font-size:10px;font-weight:800;padding:2px 7px;border-radius:9px;background:#24242c}
.pf4bd em.r{background:#4a1418;color:#ff9a9a}.pf4bd em.b{background:#13305a;color:#9cc8ff}.pf4bd em.g{background:#143d26;color:#7ef0ad}.pf4bd em.y{background:#3a2d0b;color:#ffcb00}
.pf4g{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:0 16px}
.pf4g>div{background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:12px;padding:7px 8px;min-width:0}
.pf4g small{display:block;font-size:9px;color:var(--mut);text-transform:uppercase;letter-spacing:.8px;font-weight:800}
.pf4g b{display:block;font-size:12.5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pf4bars{padding:10px 16px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pf4bars div{font-size:10px;color:var(--mut);font-weight:800}.pf4bars .bar{height:5px;border-radius:3px;background:#24242c;margin-top:4px;overflow:hidden}.pf4bars .bar i{display:block;height:100%}
.pf4a{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:4px 16px}
.pf4a button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid var(--line);font-size:10.5px;font-weight:800;line-height:1.15;text-align:center;transition:background .12s,border-color .12s,transform .1s}
.pf4a button span{font-size:22px;line-height:1}.pf4a button span .ic{width:22px;height:22px}
.pf4a button:hover{border-color:#ffcb00;background:rgba(255,203,0,.08)}.pf4a button:active{transform:scale(.95)}
.pf4a button:disabled{opacity:.35;cursor:not-allowed}
.pf4a button.pri{background:linear-gradient(135deg,#ffcb00,#ffa600);color:#111;border-color:#ffcb00}
.pf4a button.red{border-color:#7d2e2e;background:rgba(80,16,16,.5)}
.pf4sv{padding:6px 16px 4px}
.pf4kz{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:8px 0}
.pf4in{width:100%;padding:12px;border-radius:12px;background:#1c1c24;border:1px solid var(--line);color:#fff;font-size:15px;font-weight:800;margin:4px 0 8px}
.pf4li{display:flex;flex-direction:column;gap:7px}
.ol4{display:flex;flex-direction:column;gap:6px}
.ol4 .vrp{cursor:pointer}
@media (max-width:520px){.sd4{max-height:94vh;border-radius:18px}.pf4a{grid-template-columns:repeat(4,1fr)}.pf4g{grid-template-columns:repeat(2,1fr)}.sd4h{aspect-ratio:16/9}}
`;
  document.head.appendChild(st);
})();

const V4 = { f: {}, cmp: {}, stack: [], pf: null, all: 0, olT: null };
function v4Re() { try { if (panelId) renderPanel(true); if (phoneApp) renderPhone(true); } catch (e) { } }
function v4Img(key, filter) { return key ? `<img src="${imgSrc('sel/' + key)}" alt="" loading="lazy" draggable="false"${filter ? ` style="filter:${filter}"` : ''} onerror="this.remove()">` : ''; }
function v4Head(it) { return it.img ? v4Img(it.img, it.imgF) : `<span class="sc4big">${it.ico}</span>`; }
const v4Pct = (a, b) => Math.max(0, Math.min(100, Math.round(a / Math.max(1, b) * 100)));
const v4Sign = n => (n > 0 ? '+' : '') + n;

/* ---------------- componentes do seletor ---------------- */
function v4Card(kind, it, i) {
  const on = (V4.cmp[kind] || []).includes(it.id);
  return `<button class="sc4 ${it.off ? 'off' : ''} ${it.cur ? 'cur' : ''}" style="animation-delay:${Math.min(i || 0, 12) * .03}s" onclick="v4Det('${kind}','${it.id}')">
    <div class="sc4i" style="--g1:${it.grad[0]};--g2:${it.grad[1]}">${v4Head(it)}
      ${it.badge ? `<span class="sc4b ${it.badgeC || ''}">${it.badge}</span>` : ''}${it.img ? `<span class="sc4ic">${it.ico}</span>` : ''}
      ${it.price ? `<span class="sc4pr">${it.price}</span>` : ''}
      ${it.noCmp ? '' : `<span class="sc4cmp ${on ? 'on' : ''}" onclick="event.stopPropagation();v4Cmp('${kind}','${it.id}')" title="Comparar">⚖️</span>`}</div>
    <div class="sc4t"><b>${it.title}</b><small>${it.sub || ''}</small></div>
    <div class="sc4k">${(it.keys || []).map(k => `<i class="${k[1] || ''}">${k[0]}</i>`).join('')}</div></button>`;
}
function v4Grid(kind, ids) { return `<div class="sg4">${ids.map((id, i) => { try { return v4Card(kind, V4K[kind](id), i); } catch (e) { console.error(e); return ''; } }).join('')}</div>`; }
function v4Filt(kind, opts, def) {
  const cur = V4.f[kind] || def;
  return `<div class="sf4">${opts.map(([id, l]) => `<button class="chip ${cur === id ? 'on' : ''}" onclick="V4.f['${kind}']='${id}';v4Re()">${l}</button>`).join('')}</div>`;
}
function v4CmpBar(kind) {
  const n = (V4.cmp[kind] || []).length; if (!n) return '';
  return `<div class="cb4">⚖️ <span>${n} na comparação${n < 2 ? ' · escolhe mais 1 ou 2' : ''}</span>${n >= 2 ? `<button class="chip on" onclick="v4Det('cmp','${kind}')">Comparar</button>` : ''}<button class="chip" onclick="V4.cmp['${kind}']=[];v4Re()">Limpar</button></div>`;
}
function v4Cmp(kind, id) {
  const a = V4.cmp[kind] = V4.cmp[kind] || [];
  const i = a.indexOf(id);
  if (i >= 0) a.splice(i, 1); else { if (a.length >= 3) a.shift(); a.push(id); toast(`⚖️ Na comparação (${a.length}/3)${a.length >= 2 ? ' — toca em “Comparar”' : ''}`); }
  v4Re(); if (V4.stack.length) v4Show();
}

/* ---------------- janela de detalhe ---------------- */
function v4El() {
  let e = document.getElementById('sel4');
  if (!e) {
    e = document.createElement('div'); e.id = 'sel4'; e.className = 'hidden';
    e.addEventListener('click', ev => { if (ev.target === e) v4Close(); });
    ['pointerdown', 'wheel', 'touchstart'].forEach(t => e.addEventListener(t, ev => ev.stopPropagation(), { passive: true }));
    document.body.appendChild(e);
  }
  return e;
}
function v4Det(kind, id) { V4.stack.push([kind, id]); v4Show(true); }
function v4Show(top) {
  if (!V4.stack.length) return v4Close();
  const [kind, id] = V4.stack[V4.stack.length - 1], el = v4El();
  const box = el.querySelector('.sd4'), sc = box && !top ? box.scrollTop : 0;
  let html = '';
  try {
    if (kind === 'cmp') html = v4CmpHTML(id);
    else if (kind === 'ucur') html = v4UniCursosHTML(id);
    else if (kind === 'pf') html = v4PfHTML();
    else if (kind === 'online') html = v4OnlineHTML();
    else html = v4DetHTML(kind, V4K[kind](id));
  } catch (e) { console.error(e); html = `<div class="sd4"><div class="sd4c" style="padding:20px">Não foi possível abrir. <button class="btn btn-ghost" onclick="v4Close()">Fechar</button></div></div>`; }
  el.innerHTML = html; el.classList.remove('hidden');
  const nb = el.querySelector('.sd4'); if (nb) nb.scrollTop = sc;
  uiBlocked = true;
}
function v4Back() { V4.stack.pop(); if (V4.stack.length) v4Show(true); else v4Close(); }
function v4Close() {
  V4.stack = []; V4.pf = null; clearInterval(V4.olT); V4.olT = null;
  const e = document.getElementById('sel4'); if (e) { e.classList.add('hidden'); e.innerHTML = ''; }
  uiBlocked = (typeof modalOpen !== 'undefined' && modalOpen) || !!panelId || !!phoneApp || mode !== 'game';
}
addEventListener('keydown', e => { if (e.key === 'Escape' && V4.stack.length) { e.stopPropagation(); v4Back(); } }, true);
function v4Nav() { return `<button class="sd4x" onclick="v4Close()" aria-label="Fechar">✕</button>${V4.stack.length > 1 ? '<button class="sd4bk" onclick="v4Back()" aria-label="Voltar">‹</button>' : ''}`; }
function v4DetHTML(kind, it) {
  const on = (V4.cmp[kind] || []).includes(it.id);
  let h = `<div class="sd4"><div class="sd4h" style="--g1:${it.grad[0]};--g2:${it.grad[1]}">${v4Head(it)}${v4Nav()}
    <div class="sd4tt">${it.badge ? `<span class="sc4b ${it.badgeC || ''}">${it.badge}</span>` : ''}<h3>${it.ico} ${it.title}</h3><span class="s">${it.sub || ''}</span></div></div><div class="sd4c">`;
  if (it.desc) h += `<p class="sd4d">${it.desc}</p>`;
  if (it.stats && it.stats.length) h += `<div class="sd4s">${it.stats.map(s => `<div><small>${s.l}</small><b>${s.txt}</b>${s.pct != null ? `<div class="bar"><i style="width:${Math.max(3, Math.min(100, s.pct))}%"></i></div>` : ''}</div>`).join('')}</div>`;
  if (it.career && it.career.length) h += `<div class="sd4h4">${it.careerT || 'Carreira'}</div><div class="sd4car">${it.career.map((c, i) => `${i ? '<em>→</em>' : ''}<i>${c}</i>`).join('')}</div>`;
  if (it.extra) h += it.extra;
  if ((it.pros && it.pros.length) || (it.cons && it.cons.length)) h += `<div class="sd4h4">Prós e contras</div><div class="sd4pc"><ul class="p">${(it.pros || []).map(p => `<li>${p}</li>`).join('') || '<li>—</li>'}</ul><ul class="c">${(it.cons || []).map(p => `<li>${p}</li>`).join('') || '<li>Nada de especial</li>'}</ul></div>`;
  if (it.reqs && it.reqs.length) h += `<div class="sd4h4">Requisitos</div><ul class="sd4r">${it.reqs.map(r => `<li class="${r.ok ? 'ok' : 'no'}">${r.t}</li>`).join('')}</ul>`;
  h += `</div><div class="sd4a" id="sd4a">`;
  (it.acts || []).forEach((a, i) => { h += `<button class="btn ${a.pri ? 'btn-yel' : 'btn-ghost'}" ${a.dis ? 'disabled' : ''} onclick="v4Act('${kind}','${it.id}',${i})">${a.l}</button>${a.dis && a.why ? `<div class="sd4why">${a.why}</div>` : ''}`; });
  h += `<div class="r2">${it.noCmp ? '' : `<button class="btn btn-ghost" onclick="v4Cmp('${kind}','${it.id}')">${on ? '✓ Na comparação' : '⚖️ Comparar'}</button>`}<button class="btn btn-ghost" onclick="${V4.stack.length > 1 ? 'v4Back()' : 'v4Close()'}">${V4.stack.length > 1 ? 'Voltar' : 'Fechar'}</button></div></div></div>`;
  return h;
}
function v4Act(kind, id, i) {
  const it = V4K[kind](id), a = it.acts[i]; if (!a || a.dis) return;
  if (a.nav || !a.conf) return v4Do(kind, id, i);
  const box = document.getElementById('sd4a'); if (!box) return v4Do(kind, id, i);
  box.innerHTML = `<div class="sd4cf"><b class="t">Confirmar: ${a.l}</b><ul>${a.conf.filter(Boolean).map(c => `<li>${c}</li>`).join('')}</ul>
    <div class="r2" style="display:flex;gap:8px"><button class="btn btn-ghost" style="flex:1" onclick="v4Show()">Voltar</button><button class="btn btn-yel" style="flex:1" onclick="v4Do('${kind}','${id}',${i})">Confirmar</button></div></div>`;
}
function v4Do(kind, id, i) {
  const it = V4K[kind](id), a = it.acts[i]; if (!a) return;
  if (!a.nav) v4Close();
  try { Function(a.code)(); } catch (e) { console.error(e); }
}
function v4CmpHTML(kind) {
  const ids = V4.cmp[kind] || [], its = ids.map(id => V4K[kind](id));
  if (its.length < 2) return `<div class="sd4"><div class="sd4c" style="padding:22px">${v4Nav()}<p class="sd4d">Escolhe pelo menos 2 opções com ⚖️ para comparar.</p></div></div>`;
  const rows = its[0].stats.map((s, r) => {
    const vals = its.map(it => it.stats[r]), nums = vals.map(v => v && typeof v.v === 'number' && v.txt !== '—' ? v.v : null).filter(v => v != null);
    const best = nums.length > 1 ? (s.lo ? Math.min(...nums) : Math.max(...nums)) : null;
    const same = nums.length > 1 && nums.every(v => v === nums[0]);
    return `<tr><td>${s.l}</td>${vals.map(v => `<td class="${v && best != null && !same && v.v === best && v.txt !== '—' ? 'best' : ''}">${v ? v.txt : '—'}</td>`).join('')}</tr>`;
  }).join('');
  return `<div class="sd4 wide"><div class="sd4c" style="padding-top:54px">${v4Nav()}<h3 style="margin-bottom:10px">⚖️ Comparar</h3><table class="ct4"><tr><th></th>${its.map(it => `<th><div class="cti" style="--g1:${it.grad[0]};--g2:${it.grad[1]}">${v4Head(it)}</div><b style="font-size:12px">${it.ico} ${it.title}</b></th>`).join('')}</tr>
    ${rows}<tr><td>Requisitos</td>${its.map(it => { const n = (it.reqs || []).filter(r => !r.ok).length; return `<td class="${n ? '' : 'best'}">${n ? `✗ falta${n > 1 ? 'm' : ''} ${n}` : '✓ cumpres'}</td>`; }).join('')}</tr>
    <tr><td></td>${its.map(it => `<td><button class="chip on" onclick="v4Det('${kind}','${it.id}')">Ver</button></td>`).join('')}</tr></table>
    <p class="sd4d" style="margin-top:10px;font-size:11px">A verde: a melhor opção em cada linha.</p></div>
    <div class="sd4a"><div class="r2"><button class="btn btn-ghost" onclick="V4.cmp['${kind}']=[];v4Re();v4Back()">Limpar comparação</button><button class="btn btn-ghost" onclick="v4Back()">Voltar</button></div></div></div>`;
}

/* ---------------- dados de cada tipo de escolha ---------------- */
const V4_CASA_TXT = {
  quarto: ['Um quarto alugado num quintal partilhado do musseque: casa de banho comum, água do tanque e vizinhos sempre por perto. É o primeiro passo para sair da rua.', ['A forma mais barata de ter um teto', 'Só pagas a caução de 2 meses'], ['Conforto muito baixo: a felicidade desce', 'Zona com pouca segurança']],
  chapa: ['Casa de chapa de zinco com um quintal pequeno no musseque. Aquece muito no Cacimbo e na chuva faz barulho — mas pode ser tua.', ['A casa mais barata para comprar', 'Deixas de pagar renda'], ['Pouco conforto', 'Bairro sem saneamento']],
  zango: ['Apartamento T2 num prédio novo da centralidade do Zango. Água e luz mais estáveis, mas longe do centro.', ['Preço acessível', 'Prédio novo e organizado'], ['Longe do centro: viagens mais longas']],
  t2: ['Casa T2 de blocos no Bairro Popular, com quintal, mangueira e vizinhança animada aos fins de semana.', ['Bom equilíbrio entre preço e conforto', 'Espaço para começar família'], ['Trânsito e barulho do bairro']],
  kilamba: ['Apartamento T3 na Centralidade do Kilamba: prédios coloridos, escolas, jardins e campos de jogos.', ['Conforto alto', 'Zona segura e organizada'], ['Renda e preço já pesam no orçamento']],
  vivenda: ['Vivenda com quintal, gerador e segurança 24h em Talatona, a zona nobre moderna de Luanda.', ['Conforto de luxo', 'Dá fama e estatuto'], ['Muito cara de manter']],
  mansao: ['Mansão com piscina no Miramar, com vista para a baía de Luanda e a Marginal.', ['O máximo de conforto', 'Fama e prestígio'], ['Preço de elite', 'Custos altíssimos']],
};
const V4_TEC_TXT = {
  mecanica: ['Motores, travões e diagnóstico. Há sempre carros e candongueiros para arranjar.', 'linear-gradient', ['#3a4a5a', '#11161c']],
  eletricidade: ['Instalações elétricas, quadros e geradores — muito procurado em Luanda.', '', ['#c99a12', '#2a1f05']],
  cabeleireiro: ['Tranças, cortes, unhas e maquilhagem. Podes trabalhar por conta própria.', '', ['#a3367a', '#2a0c1f']],
  culinaria: ['Cozinha angolana e internacional: muamba, calulu, funje e pastelaria.', '', ['#b5521f', '#2a1206']],
  costura: ['Corte, costura e moda com panos africanos. Dá para abrir atelier.', '', ['#2e7d6b', '#08201b']],
  carta: ['Escola de condução: código e exame prático. Abre empregos de motorista e taxista e deixa-te conduzir o teu carro.', '', ['#1f63c9', '#0a1730']],
};
function v4CatG(cat) { const M = { 'Informal': ['#8a4a2a', '#1e100a'], 'Técnico': ['#b8691f', '#24140a'], 'Superior': ['#2c5aa0', '#0b1626'], 'Retalho': ['#2e8b57', '#0b2014'], 'Estado': ['#7a1f2e', '#1e070b'], 'Desporto': ['#1f7a9a', '#071d24'], 'Arte': ['#8a2aa0', '#1f0926'] }; if (M[cat]) return M[cat]; const hh = (typeof phHash === 'function' ? phHash(String(cat)) : String(cat).length * 47) % 360; return [`hsl(${hh},45%,36%)`, `hsl(${hh},45%,9%)`]; }
const V4_REQL = r => {
  const L = [];
  const add = (k, t) => L.push({ t, ok: !reqOk({ [k]: r[k] }).length });
  if (r.idade) add('idade', `Idade ${r.idade}+`);
  if (r.maxIdade) add('maxIdade', `Até ${r.maxIdade} anos`);
  if (r.edu) add('edu', EDU[r.edu]);
  if (r.area) add('area', 'Técnico Médio de ' + (r.area === 'saude' ? 'Saúde' : 'Informática'));
  if (r.curso) add('curso', 'Licenciatura em ' + [].concat(r.curso).map(c => (CURSOS.find(x => x.id === c) || { t: c }).t).join(' ou '));
  if (r.tecnico) add('tecnico', 'Curso técnico de ' + (TECNICOS.find(t => t.id === r.tecnico) || { t: r.tecnico }).t);
  if (r.carta) add('carta', 'Carta de condução');
  if (r.bem) add('bem', [].concat(r.bem).map(b => (bemT(b) || { t: b }).t).join(' ou '));
  if (r.tel) add('tel', 'Smartphone');
  if (r.mestrado) add('mestrado', 'Mestrado');
  if (r.limpo) add('limpo', 'Registo criminal limpo');
  if (r.mar) add('mar', 'Viver numa cidade com mar');
  if (r.treinos) add('treinos', `${r.treinos} treinos (tens ${G.treinos})`);
  if (r.seguidores) add('seguidores', `${numShort(r.seguidores)} seguidores`);
  const known = ['idade', 'maxIdade', 'edu', 'area', 'curso', 'tecnico', 'carta', 'bem', 'tel', 'mestrado', 'limpo', 'mar', 'treinos', 'seguidores'];
  const rest = Object.keys(r).filter(k => !known.includes(k));
  if (rest.length) { const f = reqOk(Object.fromEntries(rest.map(k => [k, r[k]]))); f.forEach(t => L.push({ t, ok: false })); }
  if (!L.length) L.push({ t: 'Sem requisitos especiais', ok: true });
  return L;
};
const v4Idade = () => G.idade >= 18 || (semFamilia() && G.idade >= 16);
const V4K = {
  casa(id) {
    const C = casaT(id), P = cid(), Z = zonaCasa(C.z), renda = Math.round(C.renda * P.custo), mes = Math.round(renda / 12), cau = Math.round(renda / 6);
    const preco = precoCasa(C), ent = Math.round(preco * CRED_ENT), prest = credPrest(preco - ent), rend = imobRend(), okCred = rend && prest <= rend * .45 && credAnosOk();
    const iok = v4Idade(), aqui = (G.casa.tipo === 'arrendada' && G.casa.id === id) || (G.casa.tipo === 'propria' && G.imoveis[G.casa.idx] && G.imoveis[G.casa.idx].id === id);
    const tem = G.imoveis.some(im => im.id === id), tx = V4_CASA_TXT[id] || ['', [], []];
    const ageWhy = 'Só a partir dos 18 anos (ou 16, se não tiveres família).';
    const acts = [{ l: `🔑 Arrendar · caução ${kzShort(cau)}`, code: `rentHouse('${id}')`, pri: true, dis: !iok || aqui || G.dinheiro < cau,
      why: !iok ? ageWhy : aqui ? 'Já moras aqui.' : G.dinheiro < cau ? `Faltam ${kzShort(cau - Math.max(0, G.dinheiro))} para a caução.` : '',
      conf: [`Pagas agora a caução: <b>${kz(cau)}</b>`, `Renda: <b>${kzShort(mes)}/mês</b> (${kzShort(renda)} por ano, no fim de cada ano)`, `Conforto ${v4Sign(C.conforto)} → felicidade ${v4Sign(Math.round(C.conforto / 4))} por ano`, G.casa.tipo === 'rua' ? 'Sais da rua: acabam os castigos de dormir ao relento' : '', 'Gasta 10 de energia'] }];
    if (C.preco) {
      acts.push({ l: `🏠 Comprar a pronto · ${kzShort(preco)}`, code: `buyHouse('${id}',false)`, dis: !iok || G.dinheiro < preco,
        why: !iok ? ageWhy : G.dinheiro < preco ? `Faltam ${kzShort(preco - Math.max(0, G.dinheiro))}.` : '', conf: [`Pagas <b>${kz(preco)}</b> de uma vez`, 'Deixas de pagar renda', 'A casa valoriza (ou desvaloriza) todos os anos e podes arrendá-la a outros', 'Gasta 10 de energia'] });
      acts.push({ l: `🏦 Crédito habitação · entrada ${kzShort(ent)}`, code: `buyHouse('${id}',true)`, dis: G.idade < 18 || !okCred || G.dinheiro < ent,
        why: G.idade < 18 ? 'Crédito só a partir dos 18 anos.' : !rend ? 'Precisas de rendimento formal (emprego ou negócio).' : !credAnosOk() ? 'O banco pede 2 anos de contrato no emprego atual.' : !okCred ? `A prestação (${kzShort(prest)}/ano) passa 45% do teu rendimento.` : G.dinheiro < ent ? `Faltam ${kzShort(ent - Math.max(0, G.dinheiro))} para a entrada.` : '',
        conf: [`Entrada: <b>${kz(ent)}</b>`, `Prestação: <b>${kzShort(prest)}/ano</b> durante 15 anos (juro 14%)`, 'Se falhares 2 prestações, o banco fica com a casa', 'Gasta 10 de energia'] });
    }
    return { id, title: C.t, sub: `${Z.nivel} · ${Z.t}`, img: id, grad: [Z.cor, '#0d0d10'], ico: C.ico,
      badge: aqui ? 'MORAS AQUI' : tem ? 'É TUA' : Z.nivel.toUpperCase(), badgeC: aqui || tem ? 'g' : '', cur: aqui, off: !iok || (!aqui && G.dinheiro < cau),
      price: `${kzShort(mes)}/mês`,
      keys: [[`Conforto ${v4Sign(C.conforto)}`, C.conforto >= 8 ? 'ok' : C.conforto < 0 ? 'no' : ''], [C.preco ? `Compra ${kzShort(preco)}` : 'Só arrendar'], [G.dinheiro >= cau ? '✓ Caução' : '✗ Caução', G.dinheiro >= cau ? 'ok' : 'no']],
      desc: tx[0], pros: tx[1].concat(C.conforto >= 10 ? [`Felicidade ${v4Sign(Math.round(C.conforto / 4))} por ano`] : []), cons: tx[2].concat(C.conforto < 0 ? [`Felicidade ${Math.round(C.conforto / 4)} por ano`] : []),
      stats: [{ l: 'Renda por mês', v: mes, txt: kzShort(mes), lo: true }, { l: 'Preço de compra', v: preco || 0, txt: C.preco ? kzShort(preco) : '—', lo: true },
        { l: 'Conforto', v: C.conforto, txt: v4Sign(C.conforto), pct: (C.conforto + 5) / 27 * 100 }, { l: 'Caução (2 meses)', v: cau, txt: kzShort(cau), lo: true },
        { l: 'Prestação do crédito', v: C.preco ? prest : 0, txt: C.preco ? kzShort(prest) + '/ano' : '—', lo: true }, { l: 'Zona', v: 0, txt: Z.t }],
      reqs: [{ t: 'Idade 18+ (ou 16 sem família)', ok: iok }, { t: `Dinheiro para a caução (${kzShort(cau)})`, ok: G.dinheiro >= cau }].concat(C.preco ? [{ t: `Rendimento formal para crédito (tens ${kzShort(rend)}/ano)`, ok: !!okCred }] : []),
      acts };
  },
  job(id) {
    const j = job(id), f = reqOk(j.req), mine = (G.emprego && G.emprego.id === id) || (G.part && G.part.id === id);
    const s = j.varFama || j.varSeg ? 0 : salario({ id, nivel: 0 }), top = j.niv && s ? salario({ id, nivel: j.niv.length - 1 }) : s;
    const pros = [], cons = [];
    if (j.informal) { pros.push('Começas já, sem papéis'); cons.push('Rendimento informal: o banco não conta para crédito'); } else pros.push('Contrato formal: conta para crédito e reforma');
    if (j.part) pros.push('Part-time: dá para conciliar com os estudos');
    if (j.niv) pros.push(`Promoções até ${j.niv[j.niv.length - 1]}`);
    if (top && s && top > s * 2) pros.push(`O salário pode subir ${Math.round(top / s)}×`);
    if (j.req && j.req.limpo) cons.push('Exige registo criminal limpo');
    if (j.req && j.req.maxIdade) cons.push(`Carreira curta: até aos ${j.req.maxIdade} anos`);
    cons.push('Cada turno cansa: gasta energia e fome');
    const sw = G.emprego && !j.part && !job(G.emprego.id).part && !mine;
    return { id, title: j.t, sub: j.cat + (j.part ? ' · part-time' : '') + (j.informal ? ' · informal' : ''), ico: j.ico, grad: v4CatG(j.cat), img: null,
      badge: mine ? 'O TEU' : f.length ? `FALTA${f.length > 1 ? 'M' : ''} ${f.length}` : 'PODES CANDIDATAR', badgeC: mine ? 'g' : f.length ? 'r' : 'y', cur: mine, off: f.length > 0,
      price: s ? kzShort(s / 12) + '/mês' : 'variável',
      keys: [f.length ? [`✗ ${f.length} requisito${f.length > 1 ? 's' : ''}`, 'no'] : ['✓ Requisitos', 'ok']].concat(j.niv ? [[`${j.niv.length} níveis`]] : []).concat(j.part ? [['Part-time']] : []),
      desc: `${j.ico} <b>${j.t}</b> — ${j.cat}. ${j.niv ? `Começas como <b>${j.niv[0]}</b> e, com bom desempenho e anos de casa, podes ser promovido(a).` : 'Trabalho sem escada de carreira: o salário sobe com aumentos e experiência.'}`,
      stats: [{ l: 'Salário inicial', v: s, txt: s ? kzShort(s) + '/ano' : (j.varFama ? 'Varia com a fama' : 'Varia com seguidores') }, { l: 'Líquido (IRT+INSS)', v: s && !j.informal ? s - vrIRT(s) - Math.round(s * .03) : s, txt: s ? (j.informal ? 'sem descontos (informal)' : '≈' + kzShort(s - vrIRT(s) - Math.round(s * .03)) + '/ano') : '—' }, { l: 'Por mês', v: s / 12, txt: s ? kzShort(s / 12) : '—' },
        { l: 'Topo da carreira', v: top || 0, txt: top ? kzShort(top) + '/ano' : '—' }, { l: 'Níveis de carreira', v: j.niv ? j.niv.length : 1, txt: String(j.niv ? j.niv.length : 1), pct: (j.niv ? j.niv.length : 1) / 5 * 100 }],
      career: j.niv, careerT: 'Carreira', pros, cons, reqs: V4_REQL(j.req || {}),
      acts: [{ l: mine ? '✓ Já trabalhas aqui' : '📨 Candidatar-me', code: `applyJob('${id}')`, pri: true, dis: f.length > 0 || mine, why: f.length ? 'Falta: ' + f.join(', ') : '',
        conf: [`Cargo: <b>${j.niv ? j.niv[0] : j.t}</b>`, `Salário: <b>${s ? kzShort(s) + '/ano' : 'variável'}</b>`, sw ? `⚠️ Já tens emprego a tempo inteiro (${job(G.emprego.id).t}): despede-te primeiro` : '', 'Gasta 10 de energia · a resposta depende da tua qualificação, aparência e cunhas'] }] };
  },
  tec(id) {
    if (id === 'carta') {
      const ok = G.idade >= 18, J = JOBS.filter(j => j.req && j.req.carta).map(j => j.t);
      return { id, title: 'Carta de condução', sub: 'Escola de condução · exame teórico e prático', ico: '🪪', img: null, grad: V4_TEC_TXT.carta[2], noCmp: true,
        badge: G.carta ? 'JÁ TENS' : ok ? 'DISPONÍVEL' : 'A PARTIR DOS 18', badgeC: G.carta ? 'g' : ok ? 'y' : 'r', cur: G.carta, off: !ok && !G.carta, price: kzShort(150000),
        keys: [[G.carta ? '✓ Concluída' : ok ? '✓ Idade' : '✗ 18+', G.carta || ok ? 'ok' : 'no'], [`${J.length} empregos`]], desc: V4_TEC_TXT.carta[0],
        stats: [{ l: 'Custo', v: 150000, txt: kzShort(150000) }, { l: 'Empregos que abre', v: J.length, txt: String(J.length) }], career: J.slice(0, 8), careerT: 'Empregos que abre',
        reqs: [{ t: 'Idade 18+', ok }], acts: [{ l: G.carta ? '✓ Já tens carta' : '🪪 Tirar a carta', code: 'tirarCarta()', pri: true, dis: G.carta || !ok, why: !ok ? 'A partir dos 18 anos.' : '', conf: ['Custo: <b>150 mil Kz</b>', 'Gasta 10 de energia'] }] };
    }
    const T = TECNICOS.find(x => x.id === id), tem = G.tecnicos.includes(id), ok = G.idade >= 15, J = JOBS.filter(j => j.req && j.req.tecnico === id);
    const tx = V4_TEC_TXT[id] || ['', '', ['#444', '#111']], sal = J.length ? Math.max(...J.map(j => salario({ id: j.id, nivel: 0 }))) : 0;
    return { id, title: T.t, sub: 'INEFOP · curso de 1 ano', ico: T.ico, img: null, grad: tx[2],
      badge: tem ? 'CONCLUÍDO' : ok ? 'INSCRIÇÕES ABERTAS' : 'A PARTIR DOS 15', badgeC: tem ? 'g' : ok ? 'y' : 'r', cur: tem, off: !ok && !tem, price: kzShort(T.custo),
      keys: [[tem ? '✓ Tens' : ok ? '✓ Idade' : '✗ 15+', tem || ok ? 'ok' : 'no'], [J.length ? `Até ${kzShort(sal / 12)}/mês` : 'Negócio próprio']],
      desc: tx[0], stats: [{ l: 'Custo', v: T.custo, txt: kzShort(T.custo), lo: true }, { l: 'Duração', v: 1, txt: '1 ano' }, { l: 'Salário de entrada', v: sal, txt: sal ? kzShort(sal) + '/ano' : '—' }, { l: 'Empregos que abre', v: J.length, txt: String(J.length) }],
      career: J.map(j => j.t), careerT: 'Empregos que abre', pros: ['Rápido e barato', 'Podes abrir negócio próprio', 'Inteligência +2'], cons: ['Salários mais baixos do que um curso superior'],
      reqs: [{ t: 'Idade 15+', ok }], acts: [{ l: tem ? '✓ Já tens este curso' : `🛠️ Inscrever-me · ${kzShort(T.custo)}`, code: `doTecnico('${id}')`, pri: true, dis: tem || !ok, why: !ok ? 'A partir dos 15 anos.' : '', conf: [`Curso: <b>${T.t}</b> (1 ano)`, `Custo: <b>${kz(T.custo)}</b>`, `Abre: ${J.map(j => j.t).join(', ') || 'trabalho por conta própria'}`, 'Gasta 10 de energia'] }] };
  },
  uni(slot) {
    if (typeof v3ApplyProv === 'function') try { v3ApplyProv(); } catch (e) { }
    const U = V2_UNI[slot], prop = U.pub ? PROP_PUB : Math.round(PROP_PRIV * U.pk / 1000) * 1000;
    const cs = [...new Set(U.fac.flatMap(f => f[1]))].filter(c => v2Curso(c)), match = cs.filter(c => G.area && v2Curso(c).area.includes(G.area)).length;
    const aqui = G.estudo && G.estudo.tipo === 'univ' && G.estudo.uni === slot;
    return { id: slot, title: U.n, sub: `${U.pub ? 'Pública' : 'Privada'} · ${U.sig} · ${cid().n}`, ico: '🏛️', img: U.pub ? 'uni_pub' : 'uni_priv', imgF: slot === 'ispm' ? 'hue-rotate(110deg) saturate(1.15)' : '', grad: [U.cor, '#08080c'],
      badge: aqui ? 'ESTUDAS AQUI' : U.pub ? 'PÚBLICA · EXAME' : 'PRIVADA · ENTRADA DIRETA', badgeC: aqui ? 'g' : U.pub ? 'y' : '', cur: aqui,
      price: `${kzShort(prop)}/ano`, keys: [[`Prestígio ${U.prest}/10`, U.prest >= 8 ? 'ok' : ''], [`${cs.length} cursos`], [match ? `✓ ${match} da tua área` : '⚠ fora da tua área', match ? 'ok' : 'no']],
      desc: `${U.lema}. ${U.pub ? 'Entra-se por exame de acesso: conta a média do médio e a área. A propina é simbólica.' : `Entrada direta${U.req ? ` (área certa no médio ou Inteligência ${U.req}+)` : ''}, propinas mais altas.`} Um diploma daqui dá <b>+${Math.round(U.prest * .6)}%</b> de salário pelo prestígio.`,
      stats: [{ l: 'Prestígio', v: U.prest, txt: U.prest + '/10', pct: U.prest * 10 }, { l: 'Propina por ano', v: prop, txt: kzShort(prop), lo: true }, { l: 'Cursos', v: cs.length, txt: String(cs.length) }, { l: 'Da tua área', v: match, txt: String(match) }, { l: 'Entrada', v: 0, txt: U.pub ? 'Exame de acesso' : 'Direta' }, { l: 'Bónus de salário', v: U.prest, txt: '+' + Math.round(U.prest * .6) + '%' }],
      pros: U.pub ? ['Propina quase grátis', 'O maior prestígio da província'] : ['Entrada garantida', 'Instalações modernas'], cons: U.pub ? ['Exame difícil: podes reprovar', 'Turmas cheias'] : ['Propinas caras', 'Menos prestígio que a pública'],
      career: U.fac.map(f => f[0]), careerT: 'Faculdades',
      acts: [{ l: '📚 Ver cursos e escolher', code: `v4Det('ucur','${slot}')`, pri: true, nav: true }].concat(typeof v2Go === 'function' ? [{ l: '🚶 Ir ao campus', code: `v4Close();v2Go('${slot}')`, nav: true }] : []) };
  },
  curso(key) {
    const [slot, cc] = key.split('.'), U = V2_UNI[slot], c = v2Curso(cc), prop = v2Prop(U, c), v = v2G();
    const feito = G.cursosFeitos.includes(cc), match = !!(G.area && c.area.includes(G.area)), pc = U.pub ? Math.round(uniChance(c, true) * 100) : 100;
    const J = JOBS.filter(j => j.req && j.req.curso && [].concat(j.req.curso).includes(cc)), sal = J.length ? Math.max(...J.map(j => salario({ id: j.id, nivel: 0 }))) : 0;
    const privOk = U.pub || !U.req || match || G.stats.inteligencia >= U.req, exOk = !(U.pub && v.exame[cc] === G.ano);
    const paisPagam = familiaPaga() || (U.pub && parentsAlive() && G.classe !== 'pobre');
    const dinOk = paisPagam || G.dinheiro >= prop;
    const block = G.edu < 3 ? 'Precisas de concluir o Ensino Médio.' : G.estudo ? 'Já estás a estudar.' : feito ? 'Já tens esta licenciatura.' : !exOk ? 'Já fizeste o exame este ano.' : !privOk ? `Exige a área certa no médio ou Inteligência ${U.req}+.` : !dinOk ? `Precisas de ${kzShort(prop)} para a primeira propina.` : G.idade < 16 ? 'A partir dos 16 anos.' : '';
    return { id: key, title: c.t, sub: `${U.sig} · ${c.anos} anos`, ico: c.ico, img: null, grad: [U.cor, '#0a0a10'],
      badge: feito ? 'CONCLUÍDO' : block ? 'INDISPONÍVEL' : U.pub ? `EXAME · ${pc}%` : 'ENTRADA DIRETA', badgeC: feito ? 'g' : block ? 'r' : pc >= 50 ? 'y' : '', off: !!block && !feito, cur: feito,
      price: `${kzShort(prop)}/ano`, keys: [[match ? '✓ Tua área' : '⚠ Outra área', match ? 'ok' : 'no'], [`${c.anos} anos`]].concat(sal ? [[`Até ${kzShort(sal / 12)}/mês`]] : []),
      desc: `Licenciatura em <b>${c.t}</b> na ${U.n}. ${U.pub ? `A tua hipótese no exame de acesso é <b>${pc}%</b> (média ${G.notaMedia}, ${match ? 'área certa' : 'área diferente — conta menos'}).` : 'Entrada direta.'}`,
      stats: [{ l: 'Hipótese de entrar', v: pc, txt: pc + '%', pct: pc }, { l: 'Propina por ano', v: prop, txt: kzShort(prop), lo: true }, { l: 'Duração', v: c.anos, txt: c.anos + ' anos', lo: true }, { l: 'Salário de entrada', v: sal, txt: sal ? kzShort(sal) + '/ano' : '—' }],
      career: J.map(j => j.t), careerT: 'Profissões que abre', pros: [match ? 'É da tua área do médio' : '', paisPagam ? 'A família paga as propinas' : '', `+${Math.round(U.prest * .6)}% de salário pelo prestígio da ${U.sig}`].filter(Boolean), cons: [!match ? 'Fora da tua área: mais difícil' : '', U.pub ? 'Se reprovares no exame, só no ano seguinte' : '', !paisPagam ? `Pagas ${kzShort(prop)} por ano` : ''].filter(Boolean),
      reqs: [{ t: 'Ensino Médio concluído', ok: G.edu >= 3 }, { t: 'Não estar a estudar noutro curso', ok: !G.estudo }, { t: U.pub ? 'Exame de acesso (1 vez por ano)' : 'Área certa ou Inteligência ' + (U.req || 0) + '+', ok: U.pub ? exOk : privOk }, { t: `Dinheiro para a 1.ª propina (${kzShort(prop)})`, ok: dinOk }],
      acts: [{ l: U.pub ? '📝 Fazer exame de acesso' : '✍️ Inscrever-me', code: `v2Apply('${slot}','${cc}')`, pri: true, dis: !!block, why: block,
        conf: [`Curso: <b>${c.t}</b> · ${c.anos} anos`, `Universidade: <b>${U.n}</b>`, `Propina: <b>${kzShort(prop)}/ano</b>${paisPagam ? ' — paga pela família' : ''}`, U.pub ? `Hipótese de passar: <b>${pc}%</b> (se reprovares, a energia é devolvida)` : 'Entrada garantida', 'Gasta 10 de energia'] }] };
  },
};
function v4UniCursosHTML(slot) {
  const it = V4K.uni(slot), U = V2_UNI[slot];
  let h = `<div class="sd4 wide"><div class="sd4h" style="--g1:${it.grad[0]};--g2:${it.grad[1]};aspect-ratio:16/6">${v4Head(it)}${v4Nav()}<div class="sd4tt"><span class="sc4b ${it.badgeC}">${it.badge}</span><h3>🏛️ ${U.n}</h3><span class="s">Escolhe o curso · toca para ver detalhes</span></div></div><div class="sd4c">`;
  if (G.edu < 3) h += noteBox('❌ Precisas de concluir o Ensino Médio para entrar. Podes ver os cursos na mesma.', true);
  if (G.estudo && G.estudo.tipo === 'univ') h += noteBox(`📖 Já estás a frequentar ${esc(G.estudo.t)}.`);
  U.fac.forEach(([fn, cs]) => { h += `<div class="sd4h4">${fn}</div>` + v4Grid('curso', cs.filter(c => v2Curso(c)).map(c => slot + '.' + c)); });
  return h + `</div><div class="sd4a"><div class="r2"><button class="btn btn-ghost" onclick="v4Back()">Voltar</button><button class="btn btn-ghost" onclick="v4Close()">Fechar</button></div></div></div>`;
}

/* ---------------- painéis com o novo seletor ---------------- */
function v4ImobUI() {
  let h = energyBar();
  const P = cid(), Zm = zonaCasa(typeof casaZona === 'function' ? casaZona() : 'bairro');
  h += noteBox(`🏠 Moras em: <b>${moradaTxt()}</b>${G.casa.tipo === 'rua' ? '' : ' · ' + Zm.nivel}<br>📍 ${G.cidade.mun}, <b>${P.n}</b> — ${NIVEL_CID[nivelCidade(P)]} (preços a ${Math.round(P.custo * 100)}% dos de Luanda)`, G.casa.tipo === 'rua');
  if (!v4Idade()) h += noteBox('🧒 Ainda vives com a família: podes ver as casas, mas só arrendas ou compras aos 18.');
  h += meusImoveisHTML();
  const f = V4.f.casa || 'todas';
  h += sec('Escolhe a tua casa') + v4Filt('casa', [['todas', 'Todas'], ['posso', '💰 Posso pagar'], ['comprar', '🏠 Para comprar'], ['conforto', '★ Mais conforto'], ['barata', '↓ Mais barata']], 'todas');
  let cs = CASAS.slice();
  if (f === 'posso') cs = cs.filter(C => G.dinheiro >= Math.round(C.renda * P.custo / 6));
  if (f === 'comprar') cs = cs.filter(C => C.preco);
  if (f === 'conforto') cs.sort((a, b) => b.conforto - a.conforto);
  if (f === 'barata') cs.sort((a, b) => a.renda - b.renda);
  h += v4CmpBar('casa') + (cs.length ? v4Grid('casa', cs.map(C => C.id)) : noteBox('Nenhuma casa cabe no teu orçamento ainda. Trabalha e poupa — o quarto no musseque é o mais barato.', true));
  h += noteBox(`🔑 Arrendar: caução de 2 meses. 🏦 Crédito: entrada de 30%, 2 anos de contrato, 15 anos a 14%, prestação até 45% do teu rendimento formal (${kzShort(imobRend())}/ano). Toca numa casa para ver fotos, custos, prós e contras · ⚖️ compara até 3.`);
  return h;
}
function v4UniUI() {
  let h = energyBar();
  if (G.idade < 16) return h + tooYoung(17, 'a universidade');
  if (typeof v3ApplyProv === 'function') try { v3ApplyProv(); } catch (e) { }
  h += noteBox(`🏛️ Universidades em <b>${cid().n}</b>. <b>Públicas</b>: exame de acesso e propina simbólica. <b>Privadas</b>: entrada direta e mais caras.${familiaPaga() ? '<br>👨‍👩‍👧 A família paga as propinas enquanto houver fundo.' : ''}`);
  if (G.edu < 3) h += noteBox('❌ Precisas de concluir o Ensino Médio para entrar na universidade.', true);
  if (G.estudo && G.estudo.tipo === 'univ') h += noteBox(`📖 Já estás a frequentar ${esc(G.estudo.t)}.`);
  h += sec('1 · Escolhe a universidade') + v4CmpBar('uni') + v4Grid('uni', V2_UIDS);
  const f = V4.f.curso || 'area';
  h += sec('2 · Ou procura pelo curso') + v4Filt('curso', [['area', '✅ Da minha área'], ['facil', '📈 Mais fácil entrar'], ['barato', '💰 Mais barato'], ['todos', 'Todos']], 'area');
  let ks = []; V2_UIDS.forEach(s => [...new Set(V2_UNI[s].fac.flatMap(x => x[1]))].forEach(c => { if (v2Curso(c)) ks.push(s + '.' + c); }));
  const cc = k => v2Curso(k.split('.')[1]), uu = k => V2_UNI[k.split('.')[0]];
  if (f === 'area') ks = ks.filter(k => G.area && cc(k).area.includes(G.area));
  if (f === 'facil') ks.sort((a, b) => (uu(b).pub ? uniChance(cc(b), true) : 1) - (uu(a).pub ? uniChance(cc(a), true) : 1));
  if (f === 'barato') ks.sort((a, b) => v2Prop(uu(a), cc(a)) - v2Prop(uu(b), cc(b)));
  h += v4CmpBar('curso') + (ks.length ? v4Grid('curso', ks.slice(0, 24)) : noteBox('Nenhum curso da tua área nesta província. Vê “Todos”.'));
  if (G.edu >= 4) h += sec('Pós-graduação') + list([
    btnItem('🎓', 'Mestrado em Luanda', '2 anos · +25% salário em cargos superiores · abre Juiz(a)', '1,5M', 'applyMestrado(false)', G.mestrado || !!G.estudo),
    btnItem('✈️', 'Mestrado em Portugal', '2 anos · mais prestígio', '6M', 'applyMestrado(true)', G.mestrado || !!G.estudo)]);
  return h;
}
function v4FacUI(uid) {
  const U = V2_UNI[uid]; let h = energyBar() + v2UniHead(U);
  h += noteBox(U.pub ? `📝 Entrada por <b>exame de acesso</b> (média e área do médio). Propina simbólica de ${kzShort(PROP_PUB)}/ano. Se reprovares, a energia é devolvida.` : `✍️ Entrada direta${U.req ? ` (área certa ou Inteligência ${U.req}+)` : ''}. Propina de ${kzShort(Math.round(PROP_PRIV * U.pk))}/ano (Medicina o dobro).${familiaPaga() ? ' A família pode pagar.' : ''}`);
  if (G.edu < 3) h += noteBox('❌ Precisas de concluir o Ensino Médio para entrar.', true);
  if (G.estudo && G.estudo.tipo === 'univ') h += noteBox(`📖 Já estás a frequentar ${esc(G.estudo.t)}.`);
  h += v4CmpBar('curso');
  U.fac.forEach(([fn, cs]) => { h += sec(fn) + v4Grid('curso', cs.filter(c => v2Curso(c)).map(c => uid + '.' + c)); });
  if (U.id !== 'ispm' && G.edu >= 4) h += sec('Pós-graduação') + list([
    btnItem('🎓', U.id === 'uan' ? 'Mestrado na ' + U.sig : 'Mestrado Executivo Kianda', '2 anos · +25% salário em cargos superiores · abre Juiz(a)', '1,5M', 'applyMestrado(false)', G.mestrado || !!G.estudo),
    ...(U.id === 'ukianda' ? [btnItem('✈️', 'Mestrado em Portugal (intercâmbio)', '2 anos · mais prestígio', '6M', 'applyMestrado(true)', G.mestrado || !!G.estudo)] : [])]);
  return h;
}
function v4TecUI() {
  let h = energyBar() + sec('Cursos técnicos (INEFOP) · a partir dos 15 anos');
  h += v4CmpBar('tec') + v4Grid('tec', TECNICOS.map(t => t.id));
  h += sec('Escola de condução') + v4Grid('tec', ['carta']);
  return h;
}
function v4VagasUI() {
  let h = energyBar();
  if (G.idade < 14) return h + tooYoung(14, 'trabalhar');
  h += noteBox('📋 1 emprego a tempo inteiro + 1 part-time. Toca numa vaga para ver salário, carreira e requisitos · ⚖️ compara até 3.');
  const all = JOBS.filter(j => !j.hidden), cats = [...new Set(all.map(j => j.cat))], f = V4.f.job || 'posso';
  h += v4Filt('job', [['posso', '✅ Posso já'], ['top', '💰 Melhor pagos'], ['todas', 'Todas']].concat(cats.map(c => [c, c])), 'posso');
  let js = all;
  const sal = j => j.varFama || j.varSeg ? 0 : salario({ id: j.id, nivel: 0 });
  if (f === 'posso') js = js.filter(j => !reqOk(j.req).length).sort((a, b) => sal(b) - sal(a));
  else if (f === 'top') js = js.slice().sort((a, b) => sal(b) - sal(a));
  else if (f !== 'todas') js = js.filter(j => j.cat === f);
  h += v4CmpBar('job') + (js.length ? v4Grid('job', js.map(j => j.id)) : noteBox('Ainda não cumpres os requisitos de nenhuma vaga. Vê “Todas” para saber o que te falta.', true));
  if (f === 'posso') h += noteBox('💡 Vê “Todas” ou “Melhor pagos” para saberes o que precisas para os melhores empregos.');
  return h;
}
uniUI = v4UniUI; tecnicoUI = v4TecUI; vagasUI = v4VagasUI; imobUI = v4ImobUI; v2FacUI = v4FacUI;
(function () {
  const fix = (pid, tab, fn) => { const P = PANELS[pid]; if (!P || !P.tabs) return; P.tabs.forEach(t => { if (t[0] === tab) t[2] = fn; }); };
  fix('escola', 'uni', v4UniUI); fix('escola', 'tec', v4TecUI); fix('emprego', 'vagas', v4VagasUI); fix('imobiliaria', 'casas', v4ImobUI); fix('banco', 'imo', v4ImobUI);
  if (PANELS.casa) PANELS.casa.sub = () => G && G.casa.tipo === 'rua' ? 'Sem casa · Abrigo da Missão' : moradaTxt();
})();
JOBS.push({ id: 'colab', t: 'Colaborador(a) numa empresa de jogador', ico: '🤝', cat: 'Convites', sal: 1500000, req: { idade: 16 }, part: true, hidden: true });

/* ---------------- viver na rua ---------------- */
function v4RuaUI() {
  const P = cid(), q = casaT('quarto'), cau = Math.round(q.renda * P.custo / 6), ch = precoCasa(casaT('chapa')), d = Math.max(0, G.dinheiro);
  let h = energyBar();
  h += `<div class="ru4"><div class="ru4i">${v4Img('rua')}<div><b>🌧️ Sem casa</b><span>Dormes na rua e no Abrigo da Missão</span></div></div>
    <div class="ru4p"><small>Objetivo 1 · arrendar um quarto (caução)</small><div class="bar"><i style="width:${v4Pct(d, cau)}%"></i></div><b>${kzShort(d)} / ${kzShort(cau)}</b>${d >= cau ? ' <span class="tag">consegues!</span>' : ''}</div>
    <div class="ru4p" style="padding-bottom:12px"><small>Objetivo 2 · comprar uma casa de chapa</small><div class="bar"><i style="width:${v4Pct(d, ch)}%"></i></div><b>${kzShort(d)} / ${kzShort(ch)}</b></div></div>`;
  h += noteBox(`🥶 A rua custa ${kzShort(custoVida().c)}/ano em comida e tira <b>saúde, felicidade e aparência</b> todos os anos. Há risco de roubo: guarda o dinheiro no banco.`, true);
  h += sec('Sobreviver') + list([
    btnItem('⛪', 'Dormir no Abrigo da Missão', 'Um colchão e um teto por uma noite', 'Grátis', "doAct(0,()=>'Dormiste no Abrigo da Missão. Não é casa, mas é seguro. '+fx({saude:R(2,5),felicidade:R(0,2)}),'think')"),
    btnItem('🍲', 'Sopa solidária', 'As irmãs da Missão servem sopa ao fim da tarde', 'Grátis', 'v4Sopa()'),
    btnItem('🚗', 'Lavar carros no parque', 'Biscate rápido no mercado', '+3–9 mil', 'v4Biscate()', G.idade < 12),
    btnItem('🗓️', 'Fechar o ano', 'Quando a barra do ano estiver cheia (a rua desgasta)', 'ANO', 'closePanel();ageUpUI()'),
  ]);
  h += sec('Sair da rua') + list([
    btnItem('🔑', 'Arrendar um quarto', `Caução ${kzShort(cau)} · ${kzShort(q.renda * P.custo / 12)}/mês`, '', "v4Det('casa','quarto')", G.idade < 16),
    btnItem('🏘️', 'Ver todas as casas', 'Fotos, preços e comparação', '', "openPanel('imobiliaria','casas')"),
    btnItem('💼', 'Procurar trabalho', 'Vagas que podes fazer já', '', "openPanel('emprego','vagas')"),
    btnItem('🌐', 'Conhecer pessoas', 'Jogadores online podem ajudar-te', '', 'v4AmigosOnline()'),
  ]);
  return h;
}
function v4Sopa() { doAct(0, () => { const v = vrG(); v.fome = Math.min(100, (v.fome || 0) + 35); return 'Comeste uma sopa quente na Missão. ' + fx({ saude: 2, felicidade: 2 }); }, 'think'); }
function v4Biscate() { doAct(0, () => { const g = R(3, 9) * 1000; G.dinheiro += g; return `🚗 Lavaste carros no parque do mercado e ganhaste ${kzShort(g)}. ` + fx({ saude: -1 }); }, 'train'); }
(function () {
  if (typeof placeCasa !== 'function') return;
  const _pc = placeCasa; placeCasa = function () { const r = _pc.apply(this, arguments); try { if (G && G.casa.tipo === 'rua') LOC_POS.casa.zona = 'Abrigo da Missão · sem casa'; } catch (e) { } return r; };
})();

/* ---------------- amigos: só online ---------------- */
function v4AmigosFam() {
  const A = (typeof VR !== 'undefined' && VR.amigos) || null;
  if (typeof vrLoad === 'function') vrLoad('amigos');
  const am = A ? A.amigos : [];
  let h = sec(`Kambas online (${am.length})`);
  if (!vrOnline()) return h + noteBox('🌐 Os amigos são outros jogadores reais. Entra com a tua conta online para os conheceres.');
  if (am.length) h += `<div class="vrlist">${am.map(p => `<div class="vrp" onclick="v4Perfil(${p.id})" style="cursor:pointer"><i style="background:${mpColor(p.nick)}"></i><div><b>${p.gt ? `<span class="vrgt">[${esc(p.gt)}]</span> ` : ''}${esc(p.nick)}</b><small>${p.on ? '🟢 online · ' + esc(p.job || '') : '⚪ offline'}</small></div><button class="chip" onclick="event.stopPropagation();v4Perfil(${p.id})">👤 Perfil</button></div>`).join('')}</div>`;
  else h += noteBox('Ainda não tens kambas. Nasceste sem amigos: conhece pessoas na cidade — toca em qualquer jogador para ver o perfil e pedir amizade.');
  if (A && A.pedidos && A.pedidos.length) h += noteBox(`🤝 Tens ${A.pedidos.length} pedido(s) de amizade à espera — abre Cidade → Amigos.`);
  h += list([btnItem('🌐', 'Conhecer pessoas online', 'Vê quem está na cidade agora', '', 'v4AmigosOnline()')]);
  return h;
}
function v4AmigosOnline() {
  if (!vrOnline()) return toast('🌐 Os amigos são jogadores reais: entra com a tua conta online.');
  V4.all = Date.now() + 60000; V4.stack = [['online', 0]]; v4Show(true);
  clearInterval(V4.olT); V4.olT = setInterval(() => { if (!V4.stack.length || V4.stack[V4.stack.length - 1][0] !== 'online') { clearInterval(V4.olT); V4.olT = null; return; } V4.all = Date.now() + 60000; v4Show(); }, 2500);
}
function v4OnlineHTML() {
  const all = (VR.all || []).filter(p => p.id !== MP.me), am = new Set(((VR.amigos && VR.amigos.amigos) || []).map(a => a.id));
  const perto = [...MP.others.entries()].filter(([, o]) => o.d != null && o.d < 40).sort((a, b) => a[1].d - b[1].d);
  const row = (id, nick, sub, gt) => `<div class="vrp" onclick="v4Perfil(${id})"><i style="background:${mpColor(nick)}"></i><div><b>${gt ? `<span class="vrgt">[${esc(gt)}]</span> ` : ''}${esc(nick)}</b><small>${sub}</small></div><span class="vrtags">${am.has(id) ? '<em class="am">🤝 kamba</em>' : ''}</span><button class="chip" onclick="event.stopPropagation();v4Perfil(${id})">👤</button></div>`;
  let h = `<div class="sd4"><div class="sd4h" style="--g1:#1f63c9;--g2:#0b0b14;aspect-ratio:16/5"><span class="sc4big">🌐</span>${v4Nav()}<div class="sd4tt"><h3>🌐 Conhecer pessoas</h3><span class="s">Jogadores reais online agora · toca para ver o perfil</span></div></div><div class="sd4c">`;
  if (perto.length) h += `<div class="sd4h4">Perto de ti (${perto.length})</div><div class="ol4">${perto.map(([id, o]) => row(id, o.nick, `${esc(o.job || '')} · a ${Math.round(o.d)} m`, o.gt)).join('')}</div>`;
  h += `<div class="sd4h4">Na tua cidade (${all.length})</div>`;
  h += all.length ? `<div class="ol4">${all.slice(0, 80).map(p => row(p.id, p.nick, `${esc(p.job || '—')} · ${esc(mpRoomName(p.room || 'rua'))}`, p.gt)).join('')}</div>` : noteBox(VR.all ? 'Por agora só estás tu nesta cidade. Muda de cidade em Cidade → Online, ou volta mais tarde.' : 'A carregar a lista…');
  return h + `<p class="sd4d" style="margin-top:10px;font-size:12px">💡 Na rua, toca diretamente na personagem de outro jogador para abrir o perfil.</p></div></div>`;
}

/* ---------------- perfil de jogador ---------------- */
const V4_ACOES = {
  acenar: { ico: '👋', l: 'Acenar', em: 'cheer', me: 'Acenaste a', rx: 'acenou-te', fx: {}, rfx: { felicidade: 1 } },
  abracar: { ico: '🫂', l: 'Abraçar', em: 'love', near: true, me: 'Deste um abraço a', rx: 'deu-te um abraço', fx: { felicidade: 2 }, rfx: { felicidade: 3 } },
  dancar: { ico: '💃', l: 'Dançar juntos', em: 'dance', near: true, me: 'Dançaste kizomba com', rx: 'dançou kizomba contigo', fx: { felicidade: 3 }, rfx: { felicidade: 3 } },
  respeito: { ico: '⭐', l: 'Dar respeito', em: 'cheer', me: 'Deste respeito a', rx: 'deu-te respeito (+1 ⭐)', fx: { karma: 1 }, rfx: { fama: 1 } },
  bebida: { ico: '🍺', l: 'Pagar bebida', em: 'cheer', near: true, custo: 2500, me: 'Pagaste uma bebida a', rx: 'pagou-te uma bebida', fx: { felicidade: 2 }, rfx: { felicidade: 4 } },
  elogio: { ico: '👏', l: 'Elogiar', em: 'love', me: 'Elogiaste', rx: 'elogiou o teu estilo', fx: { karma: 1 }, rfx: { felicidade: 2 } },
};
const V4_GIFTS = [
  { id: 'gasosa', ico: '🥤', t: 'Gasosa gelada', c: 800, fx: { felicidade: 1 } },
  { id: 'chocolate', ico: '🍫', t: 'Caixa de chocolates', c: 3000, fx: { felicidade: 3 } },
  { id: 'flores', ico: '💐', t: 'Ramo de flores', c: 5000, fx: { felicidade: 4 } },
  { id: 'pano', ico: '🧣', t: 'Pano do Congo', c: 25000, fx: { felicidade: 3, aparencia: 2 } },
  { id: 'perfume', ico: '🧴', t: 'Perfume importado', c: 45000, fx: { felicidade: 5, aparencia: 2 } },
  { id: 'telemovel', ico: '📱', t: 'Smartphone Faísca 30', c: 150000, fx: { felicidade: 8 } },
  { id: 'relogio', ico: '⌚', t: 'Relógio de luxo', c: 250000, fx: { felicidade: 6, fama: 1 } },
];
const V4_DES = {
  braco: { ico: '💪', t: 'Braço de ferro', l: 'Saúde', st: () => G.stats.saude },
  quiz: { ico: '🧠', t: 'Quiz de cultura angolana', l: 'Inteligência', st: () => G.stats.inteligencia },
  danca: { ico: '💃', t: 'Batalha de kuduro', l: 'Aparência + Felicidade', st: () => Math.round((G.stats.aparencia + G.stats.felicidade) / 2) },
  corrida: { ico: '🏃', t: 'Corrida na Marginal', l: 'Saúde + Energia', st: () => Math.round((G.stats.saude + (vrG().energia || 50)) / 2) },
};
const V4_DEN = ['Linguagem ofensiva', 'Assédio ou ameaças', 'Batota / dinheiro impossível', 'Spam no chat', 'Nome impróprio'];
async function v4Perfil(id) {
  id = +id; if (!id) return;
  if (typeof closeModal === 'function' && typeof modalOpen !== 'undefined' && modalOpen) closeModal();
  V4.pf = { id, data: null, view: 'main', err: null };
  V4.stack = [['pf', id]]; v4Show(true);
  if (!vrOnline()) return;
  const r = await vrApi('social', { op: 'perfil', fid: id });
  if (!V4.pf || V4.pf.id !== id) return;
  if (r.ok) V4.pf.data = r; else V4.pf.err = r.erro || 'Não foi possível carregar o perfil.';
  if (V4.stack.length && V4.stack[V4.stack.length - 1][0] === 'pf') v4Show();
}
function v4PfView(v) { if (!V4.pf) return; V4.pf.view = v; v4Show(true); }
function v4PfRefresh() { if (V4.pf) v4Perfil(V4.pf.id); }
function v4PfNick() { const P = V4.pf, o = MP.others.get(P.id); return (P.data && P.data.nick) || (o && o.nick) || ((VR.all || []).find(p => p.id === P.id) || {}).nick || 'Jogador(a)'; }
function v4PfHTML() {
  const P = V4.pf; if (!P) return '';
  const d = P.data, v = d && d.vida, o = MP.others.get(P.id), nick = v4PfNick(), near = o && o.d != null && o.h && o.h.g.parent === mpScene() ? o.d : null, me = P.id === MP.me;
  const cc = MP.cfgs && MP.cfgs.get(P.id); let im = ''; try { if (cc && cc.cfg) im = avatarShot(cc.cfg, '#1c1a22', true, 200, true); } catch (e) { }
  const col = mpColor(nick), on = d ? d.on : !!o;
  const jobT = v && v.emprego ? (() => { try { return strip(jobTitle(v.emprego)); } catch (e) { return (job(v.emprego.id) || {}).t || '—'; } })() : v && v.reformado ? 'Reformado(a)' : v && v.estudo ? 'Estudante' : d && d.job ? d.job : (o && o.job) || '—';
  const casaTx = v ? (v.casa.tipo === 'rua' ? 'Sem casa' : v.casa.tipo === 'pais' ? 'Casa da família' : (casaT(v.casa.id) || {}).t || 'Casa própria') : '—';
  const amor = v ? (v.parceiro ? `${v.parceiro.casado ? '💍 Casado(a)' : '💕 Namora'} · ${esc(v.parceiro.nome || '')}` : 'Solteiro(a)') : '—';
  const badges = [];
  if (d && d.pol) badges.push('<em class="b">🚔 Agente em serviço</em>');
  if (d && d.wl) badges.push(`<em class="r">Procurado(a) ${vrStarsF(d.wl)}</em>`);
  if (v && v.verificado) badges.push('<em class="b">✔ Verificado(a)</em>');
  if (v && v.origem === 'rua') badges.push('<em class="y">🌧️ Nasceu na rua</em>');
  if (d && d.rel === 'amigos') badges.push('<em class="g">🤝 Kamba</em>');
  if (d && d.grupo) badges.push(`<em>👥 [${esc(d.grupo.tag)}] ${esc(d.grupo.nome)}</em>`);
  if (v && !v.vivo) badges.push('<em class="r">🕯️ Vida terminada</em>');
  let h = `<div class="sd4"><div class="pf4h" style="--pc:${col}55">${v4Nav()}<div class="pf4av" style="${im ? '' : `background:${col}`}">${im ? `<img src="${im}" alt="">` : esc(nick[0] || '?').toUpperCase()}</div>
    <div class="pf4n"><h3>${d && d.grupo ? `<span class="vrgt">[${esc(d.grupo.tag)}]</span> ` : ''}${esc(nick)}${me ? ' (tu)' : ''}</h3>
    <div class="on"><i class="${on ? '' : 'off'}"></i>${on ? 'Online' + (d && d.room ? ' · ' + esc(mpRoomName(d.room)) : o ? ' · ' + esc(mpRoomName('rua')) : '') + (near != null ? ` · a ${Math.round(near)} m` : '') : 'Offline'}</div>
    <div class="pf4bd">${badges.join('')}</div></div></div>`;
  if (P.view === 'main') {
    if (!d && !P.err) h += `<div class="sd4c"><p class="sd4d">A carregar o perfil…</p></div>`;
    if (P.err) h += `<div class="sd4c">${noteBox('⚠️ ' + esc(P.err), true)}</div>`;
    if (v) {
      const it = (l, x) => `<div><small>${l}</small><b>${x}</b></div>`;
      h += `<div class="pf4g">${it('Idade', v.idade + ' anos')}${it('Província', esc(v.prov || '—'))}${it('Respeito', '⭐ ' + d.rep)}${it('Trabalho', esc(jobT))}${it('Estudos', v.estudo ? esc(String(v.estudo).split(' — ')[0]) : esc(EDU[v.edu] || '—'))}${it('Património', v.pat)}${it('Casa', esc(casaTx))}${it('Amor', amor)}${it('Kambas', d.amigos)}${it('Seguidores', numShort(v.seg))}${it('Conquistas', '🏆 ' + v.conq)}${it('Filhos', v.filhos)}${v.negocios || v.grupoEmp ? it('Empresas', v.grupoEmp ? esc(v.grupoEmp) : v.negocios + ' negócio(s)') : ''}${v.diplomas || v.cursos.length ? it('Diplomas', (v.cursos.length + v.diplomas) + (v.mestrado ? ' + mestrado' : '')) : ''}${it('Membro desde', d.desde ? new Date(d.desde * 1000).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }) : '—')}</div>`;
      const bar = (l, x, c) => `<div>${l} ${x}<div class="bar"><i style="width:${x}%;background:${c}"></i></div></div>`;
      h += `<div class="pf4bars">${bar('Fama', v.fama, '#ffcb00')}${bar('Karma', v.karma, '#2ecc71')}${bar('Aparência', v.aparencia, '#ff6ba8')}</div>`;
      if (v.crimes || v.prisoes || v.presos) h += `<div class="pf4sv" style="font-size:11px;color:var(--mut);margin-top:8px">📜 Ficha: ${v.crimes} crime(s) · ${v.prisoes} prisão(ões) · ${v.presos} detenção(ões) feitas</div>`;
    }
    if (!me) h += v4PfActs(d, v, near, nick, o);
    else h += `<div class="sd4c"><p class="sd4d">Este é o teu perfil público: é o que os outros jogadores veem quando tocam em ti.</p></div>`;
  } else h += v4PfSub(P.view, d, v, nick);
  return h + `<div style="height:14px"></div></div>`;
}
function v4PfActs(d, v, near, nick, o) {
  const btn = (ico, l, on, opt = {}) => `<button class="${opt.cls || ''}" ${opt.dis ? 'disabled' : ''} title="${opt.tip || l}" onclick="${on}"><span>${ico}</span>${l}</button>`;
  const rel = d ? d.rel : 'nada', meu = vrG(), solteiro = !G.parceiro, ele = v && !v.parceiro;
  const podeNam = d && d.adulto && plus18() && adulto() && v && v.idade >= 18 && solteiro && ele;
  const fr = rel === 'amigos' ? btn('✅', 'Kambas', `if(confirm('Remover dos amigos?')){vrAmigo('del',${V4.pf.id});setTimeout(v4PfRefresh,700)}`, { tip: 'Já são kambas · toca para remover' })
    : rel === 'enviado' ? btn('⏳', 'Pedido enviado', '', { dis: true }) : rel === 'pedido' ? btn('🤝', 'Aceitar amizade', `vrAmigo('add',${V4.pf.id});setTimeout(v4PfRefresh,700)`, { cls: 'pri' })
    : btn('🤝', 'Adicionar amigo', `vrAmigo('add',${V4.pf.id});setTimeout(v4PfRefresh,700)`, { cls: 'pri' });
  const longe = near == null || near > 8, nm = esc(nick).replace(/'/g, '');
  let h = `<div class="sd4h4" style="padding:0 16px">Social</div><div class="pf4a">${fr}${btn('💬', 'Mensagem', `v4Close();mpOpen('@${nm} ')`)}`;
  ['acenar', 'abracar', 'dancar', 'respeito', 'bebida', 'elogio'].forEach(a => { const A = V4_ACOES[a]; h += btn(A.ico, A.l + (A.custo ? ` · ${kzShort(A.custo)}` : ''), `v4Soc('${a}')`, { dis: (A.near && longe) || (a === 'respeito' && d && d.deiRep), tip: A.near && longe ? 'Aproxima-te (menos de 8 m)' : A.l }); });
  h += `</div><div class="sd4h4" style="padding:0 16px">Dinheiro, convites e desafios</div><div class="pf4a">`;
  h += btn('💸', 'Enviar dinheiro', "v4PfView('kz')", { dis: G.idade < 14 }) + btn('🎁', 'Oferecer presente', "v4PfView('gift')");
  h += btn('👥', 'Convidar p/ grupo', 'v4GrupoConv()', { dis: !meu.gtag || (d && d.grupo), tip: !meu.gtag ? 'Não tens grupo' : 'Convidar para o teu grupo' });
  h += btn('💼', 'Convidar p/ empresa', 'v4EmpConv()', { dis: !(G.negocios.length || G.grupo), tip: G.negocios.length || G.grupo ? 'Oferecer trabalho part-time na tua empresa' : 'Precisas de ter um negócio' });
  h += btn('💘', 'Convidar p/ namorar', 'v4Namoro()', { dis: !podeNam, tip: !solteiro ? 'Já tens alguém' : !ele ? 'Essa pessoa já tem alguém' : 'Só entre contas +18' });
  h += btn('⚔️', 'Desafiar', "v4PfView('desafio')");
  if (meu.servico && d && d.wl) h += btn('🚔', 'Prender', `v4Close();vrPrender(${V4.pf.id})`, { cls: 'pri', dis: longe });
  h += btn('🚩', 'Denunciar', "v4PfView('den')", { cls: 'red' });
  h += '</div>';
  if (o && !meu.servico && !(d && d.pol)) h += `<details class="pf4sv" style="margin-top:8px"><summary style="font-size:11px;color:var(--mut);cursor:pointer">⚠️ Ações de rua (crime — há consequências)</summary><div class="pf4a" style="padding:8px 0 0">${btn('👛', 'Roubar a carteira', `v4Close();vrCrimeAsk('carteira',${V4.pf.id})`, { cls: 'red', dis: longe })}${btn('🔪', 'Assaltar', `v4Close();vrCrimeAsk('assalto',${V4.pf.id})`, { cls: 'red', dis: longe })}</div></details>`;
  return h;
}
function v4PfSub(view, d, v, nick) {
  const back = `<div class="sd4a"><button class="btn btn-ghost" onclick="v4PfView('main')">‹ Voltar ao perfil</button></div>`;
  let h = '<div class="pf4sv">';
  if (view === 'kz') {
    h += `<div class="sd4h4">💸 Enviar dinheiro a ${esc(nick)}</div><p class="sd4d">Tens <b>${kz(Math.max(0, G.dinheiro))}</b> na carteira. Limite: 5 milhões por envio, 20 milhões por dia. A tua conta precisa de <b>3 dias de vida</b> para enviar.</p>
      <div class="pf4kz">${[1000, 5000, 20000, 100000, 500000, 1000000].map(x => `<button class="chip" ${G.dinheiro < x ? 'disabled style="opacity:.4"' : ''} onclick="v4Kz(${x})">${kzShort(x)}</button>`).join('')}</div>
      <input id="v4kzIn" class="pf4in" type="number" inputmode="numeric" min="100" placeholder="Outro valor (Kz)"><button class="btn btn-yel" style="width:100%" onclick="v4Kz(document.getElementById('v4kzIn').value)">Enviar</button>`;
  } else if (view === 'gift') {
    h += `<div class="sd4h4">🎁 Oferecer um presente a ${esc(nick)}</div><div class="pf4li">${V4_GIFTS.map(g => btnItem(g.ico, g.t, Object.keys(g.fx).map(k => `${LABEL[k]} +${g.fx[k]}`).join(' · ') + ' para quem recebe', kzShort(g.c), `v4Gift('${g.id}')`, G.dinheiro < g.c)).join('')}</div>`;
  } else if (view === 'desafio') {
    const ap = V4.desAp || 0;
    h += `<div class="sd4h4">⚔️ Desafiar ${esc(nick)}</div><p class="sd4d">Ganha quem tiver o atributo mais alto — com uma pitada de sorte. Aposta opcional: quem perde paga.</p>
      <div class="sf4">${[0, 1000, 10000, 100000, 1000000].map(x => `<button class="chip ${ap === x ? 'on' : ''}" onclick="V4.desAp=${x};v4Show()" ${x > G.dinheiro ? 'disabled style="opacity:.4"' : ''}>${x ? 'Aposta ' + kzShort(x) : 'Sem aposta'}</button>`).join('')}</div>
      <div class="pf4li">${Object.entries(V4_DES).map(([k, D]) => btnItem(D.ico, D.t, `Conta: ${D.l} (tens ${D.st()})`, ap ? kzShort(ap) : '', `v4Desafio('${k}')`)).join('')}</div>`;
  } else if (view === 'den') {
    h += `<div class="sd4h4">🚩 Denunciar ${esc(nick)}</div><p class="sd4d">As denúncias são anónimas e revistas pela moderação. Abusos de denúncias também são punidos.</p><div class="pf4li">${V4_DEN.map((m, i) => btnItem('🚩', m, '', '', `v4Den(${i})`)).join('')}</div>`;
  }
  return h + '</div>' + back;
}
async function v4Soc(a) {
  const P = V4.pf, A = V4_ACOES[a]; if (!P || !A) return;
  if (!vrOnline()) return toast('Precisas de estar online.');
  if (A.custo && !pay(A.custo)) return;
  const r = await vrApi('social', { op: 'acao', fid: P.id, a });
  if (!r.ok) { if (A.custo) G.dinheiro += A.custo; refresh(); return toast('🚫 ' + r.erro); }
  try { playerEmote(A.em); } catch (e) { }
  const t = `${A.ico} ${A.me} <b>${esc(v4PfNick())}</b>. ` + fx(A.fx); toast(t);
  if (a === 'respeito' && P.data) { P.data.rep = r.rep || P.data.rep + 1; P.data.deiRep = true; }
  save(); refresh(); if (V4.stack.length) v4Show();
}
async function v4Kz(val) {
  const P = V4.pf; if (!P) return; const v = Math.floor(+val || 0), nick = v4PfNick();
  if (v < 100) return toast('O mínimo é 100 Kz.');
  if (v > 5000000) return toast('Máximo de 5 milhões por envio.');
  if (G.dinheiro < v) return toast('💸 Não tens esse dinheiro na carteira.');
  if (!confirm(`Enviar ${kz(v)} a ${nick}?`)) return;
  const r = await vrApi('social', { op: 'kz', fid: P.id, v });
  if (!r.ok) return toast('🚫 ' + r.erro);
  G.dinheiro -= v; addLog(`💸 Enviaste ${kzShort(v)} a <b>${esc(nick)}</b> pelo Mbote Kumbu. ` + fx({ karma: v >= 20000 ? 2 : 1 }), 'good');
  toast(`💸 ${kzShort(v)} enviados a <b>${esc(nick)}</b>.`); try { SND.play('coin'); } catch (e) { }
  save(); refresh(); v4PfView('main');
}
async function v4Gift(gid) {
  const P = V4.pf, g = V4_GIFTS.find(x => x.id === gid); if (!P || !g) return;
  if (!pay(g.c)) return;
  const r = await vrApi('social', { op: 'presente', fid: P.id, g: gid });
  if (!r.ok) { G.dinheiro += g.c; refresh(); return toast('🚫 ' + r.erro); }
  try { playerEmote('love'); } catch (e) { }
  addLog(`🎁 Ofereceste ${g.t.toLowerCase()} a <b>${esc(v4PfNick())}</b>. ` + fx({ karma: 2, felicidade: 2 }), 'good');
  if (G.parceiro && G.parceiro.uid === P.id) G.parceiro.rel = clamp(G.parceiro.rel + 6);
  toast(`${g.ico} Presente enviado!`); save(); refresh(); v4PfView('main');
}
async function v4GrupoConv() {
  const P = V4.pf; if (!P) return;
  const r = await vrApi('social', { op: 'grupo_conv', fid: P.id });
  toast(r.ok ? `👥 Convite para o grupo enviado a <b>${esc(v4PfNick())}</b>.` : '🚫 ' + r.erro);
}
function v4MinhaEmp() { return G.grupo ? G.grupo.nome : G.negocios.length ? (G.negocios[0].nome || G.negocios[0].t || 'o meu negócio') : null; }
async function v4EmpConv() {
  const P = V4.pf, emp = v4MinhaEmp(); if (!P || !emp) return;
  const r = await vrApi('social', { op: 'emp_conv', fid: P.id, emp: String(emp).slice(0, 40), sal: 1500000 });
  toast(r.ok ? `💼 Proposta de trabalho em <b>${esc(emp)}</b> enviada a <b>${esc(v4PfNick())}</b>.` : '🚫 ' + r.erro);
}
function v4Info() { return { idade: G.idade, g: G.genero, cls: Math.max(0, CLASSES.findIndex(c => c.id === G.classe)), job: G.emprego ? job(G.emprego.id).t : null }; }
async function v4Namoro() {
  const P = V4.pf; if (!P) return;
  const r = await vrApi('social', { op: 'namoro', fid: P.id, info: v4Info() });
  toast(r.ok ? `💘 Pedido de namoro enviado a <b>${esc(v4PfNick())}</b>. Agora é esperar…` : '🚫 ' + r.erro);
}
async function v4Desafio(tipo) {
  const P = V4.pf, D = V4_DES[tipo]; if (!P || !D) return;
  const ap = V4.desAp || 0; if (ap > G.dinheiro) return toast('Não tens dinheiro para essa aposta.');
  const r = await vrApi('social', { op: 'desafio', fid: P.id, tipo, aposta: ap, st: D.st() });
  if (!r.ok) return toast('🚫 ' + r.erro);
  toast(`⚔️ Desafio de ${D.t.toLowerCase()} enviado a <b>${esc(v4PfNick())}</b>${ap ? ` (aposta ${kzShort(ap)})` : ''}.`); v4PfView('main');
}
async function v4Den(i) {
  const P = V4.pf; if (!P) return;
  const r = await vrApi('social', { op: 'denuncia', fid: P.id, motivo: V4_DEN[i] });
  toast(r.ok ? '🚩 Denúncia enviada. Obrigado por ajudares a manter a cidade segura.' : '🚫 ' + r.erro); v4PfView('main');
}
function v4Par(nick, uid, info) { return { nome: nick, uid, g: info && info.g === 'F' ? 'F' : 'M', idade: (info && info.idade) || G.idade, rel: 65, anos: 0, cls: (info && info.cls) || 1, emprego: null, online: true }; }
/* convites de outros jogadores (desafio, namoro, emprego, grupo): ficam numa fila e NUNCA tapam o que estás a
   fazer. Com muita gente online, se estiveres ocupado(a) aparece só uma notificação — tocas e respondes. */
const V4INV = { q: [], last: 0 };
function v4Ask(ico, title, txt, yes, no, yesL, noL) {
  const it = { ico, title, txt, yes, no, yesL, noL, key: title + '|' + txt, t: Date.now() };
  if (V4INV.q.some(x => x.key === it.key)) return;
  if (V4INV.q.length >= 6) { const o = V4INV.q.shift(); try { o.no && o.no(); } catch (e) { } }   // fila cheia: o mais antigo é recusado
  V4INV.q.push(it); v4InvPump(it);
}
function v4InvLivre() { return !modalOpen && !panelId && !phoneApp && mode === 'game' && !(typeof dying !== 'undefined' && dying); }
function v4InvPump(nova) {
  const now = Date.now();
  V4INV.q = V4INV.q.filter(x => { if (now - x.t < 120000) return true; try { x.no && x.no(); } catch (e) { } return false; });   // 2 min sem resposta = recusado
  if (!V4INV.q.length) return;
  if (v4InvLivre() && now - V4INV.last > 6000) return v4InvShow(V4INV.q.shift());
  if (nova && typeof p2Banner === 'function') p2Banner(nova.ico, nova.title, nova.txt.replace(/<[^>]+>/g, '') + ' · toca para responder', () => v4InvOpen(nova));
}
function v4InvOpen(x) { const i = V4INV.q.indexOf(x); if (i < 0) return toast('Este convite já expirou.'); V4INV.q.splice(i, 1); if (modalOpen) closeModal(); v4InvShow(x); }
function v4InvShow(x) {
  V4INV.last = Date.now();
  const n = V4INV.q.length;
  openModal(`<div class="mico">${x.ico}</div><h3>${x.title}</h3><p class="center">${x.txt}</p><div class="choices"><button class="btn btn-yel" id="v4y">${x.yesL || 'Aceitar'}</button><button class="btn btn-ghost" id="v4n">${x.noL || 'Recusar'}</button></div>${n ? `<p class="center" style="opacity:.65;font-size:12px;margin-top:8px">+${n} convite${n > 1 ? 's' : ''} à espera</p>` : ''}`, false);
  const fim = f => { closeModal(); try { f && f(); } catch (e) { console.error(e); } V4INV.last = Date.now() - 4500; setTimeout(() => v4InvPump(), 1600); };
  document.getElementById('v4y').onclick = () => fim(x.yes);
  document.getElementById('v4n').onclick = () => fim(x.no);
}
setInterval(() => { try { v4InvPump(); } catch (e) { } }, 2000);
function v4DesRes(win, v, tipo, vs, eu, ele) {
  const D = V4_DES[tipo] || { ico: '⚔️', t: 'Desafio' };
  if (v) G.dinheiro += win ? v : -v;
  const t = `${D.ico} ${D.t} contra <b>${esc(vs)}</b>: ${win ? 'GANHASTE' : 'perdeste'}! (${eu} vs ${ele})${v ? ` ${win ? '+' : '−'}${kzShort(v)}` : ''} ` + fx(win ? { felicidade: 5, fama: 1 } : { felicidade: -3 });
  addLog(t, win ? 'good' : 'bad'); try { playerEmote(win ? 'cheer' : 'sad'); SND.play(win ? 'coin' : 'err'); } catch (e) { }
  if (modalOpen && typeof p2Banner === 'function') p2Banner(win ? '🏆' : '😓', win ? 'Vitória!' : 'Derrota…', t.replace(/<[^>]+>/g, ''));   // não tapa o que tens aberto
  else openModal(`<div class="mico">${win ? '🏆' : '😓'}</div><h3>${win ? 'Vitória!' : 'Derrota…'}</h3><p class="center">${t}</p><div class="choices"><button class="btn btn-yel" onclick="closeModal()">OK</button></div>`);
  save(); refresh();
}
function v4Event(e) {
  const ban = (ico, de, txt, id) => { if (typeof p2Banner === 'function') p2Banner(ico, de, txt, () => id && v4Perfil(id)); else toast(`${ico} <b>${esc(de)}</b> ${esc(txt)}`); };
  switch (e.t) {
    case 'social': { const A = V4_ACOES[e.a]; if (!A) return true; fx(A.rfx); ban(A.ico, e.de, A.rx + ' · toca para ver o perfil', e.id); save(); refresh(); return true; }
    case 'kz': { const v = Math.max(0, Math.min(5000000, +e.v || 0)); G.dinheiro += v; addLog(`💸 <b>${esc(e.de)}</b> enviou-te ${kzShort(v)} pelo Mbote Kumbu.`, 'gold'); ban('💸', e.de, `enviou-te ${kzShort(v).replace(/<[^>]+>/g, '')}`, e.id); try { SND.play('coin'); } catch (x) { } save(); refresh(); return true; }
    case 'presente': {
      const g = V4_GIFTS.find(x => x.id === e.g) || { ico: '🎁', t: 'um presente', fx: { felicidade: 3 } };
      let extra = '';
      if (g.id === 'telemovel' && G.tel < 2) { try { G.bens.push('tel2'); G.tel = bemT('tel2').tel; extra = ' Agora tens um smartphone!'; } catch (x) { } }
      if (G.parceiro && G.parceiro.uid === e.id) G.parceiro.rel = clamp(G.parceiro.rel + 8);
      addLog(`🎁 <b>${esc(e.de)}</b> ofereceu-te ${g.t.toLowerCase()}!${extra} ` + fx(g.fx), 'gold'); ban(g.ico, e.de, `ofereceu-te ${g.t.toLowerCase()}`, e.id); save(); refresh(); return true;
    }
    case 'grupo_conv':
      v4Ask('👥', 'Convite para grupo', `<b>${esc(e.de)}</b> convidou-te para o grupo <b>[${esc(e.tag)}]</b>.`, async () => {
        const r = await vrApi('grupo', { op: 'entrar', gid: e.gid });
        if (!r.ok) return toast('🚫 ' + r.erro);
        const v = vrG(); v.gtag = r.tag; VR.fetchT.grupo = 0; toast(`👥 Entraste no grupo [${esc(r.tag)}]!`); save();
      }, null, 'Entrar no grupo', 'Agora não');
      return true;
    case 'emp_conv':
      v4Ask('💼', 'Proposta de trabalho', `<b>${esc(e.de)}</b> quer-te na empresa <b>${esc(e.emp)}</b> como Colaborador(a) part-time — ${kzShort(salario({ id: 'colab', nivel: 0 }))}/ano.`, () => {
        if (G.part) { vrApi('social', { op: 'emp_nao', fid: e.id, emp: e.emp }); return toast('Já tens um part-time. Despede-te primeiro.'); }
        if (G.idade < 16) return toast('Só a partir dos 16 anos.');
        G.part = { id: 'colab', nivel: 0, desemp: 60, anos: 0, anosNivel: 0, emp: e.emp, de: e.de }; G.historico.push(`Colaborador(a) em ${e.emp}`);
        addLog(`💼 Começaste a trabalhar em <b>${esc(e.emp)}</b>, a empresa de ${esc(e.de)}. ` + fx({ felicidade: 5 }), 'good');
        vrApi('social', { op: 'emp_ok', fid: e.id, emp: e.emp }); save(); refresh();
      }, () => vrApi('social', { op: 'emp_nao', fid: e.id, emp: e.emp }));
      return true;
    case 'emp_ok': addLog(`💼 <b>${esc(e.de)}</b> aceitou trabalhar na tua empresa (${esc(e.emp)}). ` + fx({ fama: 1, karma: 1 }), 'good'); ban('💼', e.de, 'aceitou a tua proposta de trabalho', e.id); save(); refresh(); return true;
    case 'emp_nao': ban('💼', e.de, 'recusou a proposta de trabalho', e.id); return true;
    case 'namoro': {
      const i = e.info || {};
      v4Ask('💘', 'Pedido de namoro', `<b>${esc(e.de)}</b> (${i.idade || '?'} anos${i.job ? ', ' + esc(i.job) : ''}) quer namorar contigo!`, async () => {
        if (G.parceiro) { vrApi('social', { op: 'namoro_nao', fid: e.id, info: v4Info() }); return toast('Já tens alguém. Termina primeiro.'); }
        const r = await vrApi('social', { op: 'namoro_ok', fid: e.id, info: v4Info() });
        if (!r.ok) return toast('🚫 ' + r.erro);
        G.parceiro = v4Par(e.de, e.id, r.info || i);
        addLog(`💕 Tu e <b>${esc(e.de)}</b> estão a namorar! ` + fx({ felicidade: 12 }), 'gold'); try { playerEmote('love'); } catch (x) { } save(); refresh();
      }, () => vrApi('social', { op: 'namoro_nao', fid: e.id, info: v4Info() }));
      return true;
    }
    case 'namoro_ok':
      if (G.parceiro) return true;
      G.parceiro = v4Par(e.de, e.id, e.info);
      addLog(`💕 <b>${esc(e.de)}</b> aceitou! Estão a namorar. ` + fx({ felicidade: 12 }), 'gold'); flash(`💕 ${esc(e.de)} aceitou namorar contigo!`); try { playerEmote('love'); } catch (x) { } save(); refresh(); return true;
    case 'namoro_nao': ban('💔', e.de, 'recusou o teu pedido de namoro', e.id); fx({ felicidade: -3 }); return true;
    case 'namoro_fim':
      if (G.parceiro && G.parceiro.uid === e.id) { const c = G.parceiro.casado; G.parceiro = null; G.ex++; addLog(`💔 <b>${esc(e.de)}</b> ${c ? 'divorciou-se de ti' : 'terminou contigo'}. ` + fx({ felicidade: -12 }), 'bad'); save(); refresh(); }
      return true;
    case 'casou':
      if (G.parceiro && G.parceiro.uid === e.id) { G.parceiro.casado = true; G.parceiro.juntos = G.casa.tipo !== 'pais' && G.casa.tipo !== 'rua'; addLog(`💍 Alembamento feito: estás ${oa(G.genero, 'casado', 'casada')} com <b>${esc(e.de)}</b>! ` + fx({ felicidade: 20 }), 'gold'); save(); refresh(); }
      return true;
    case 'desafio': {
      const D = V4_DES[e.tipo] || { t: 'Desafio', ico: '⚔️', st: () => 50 };
      v4Ask(D.ico, 'Desafio!', `<b>${esc(e.de)}</b> desafia-te para ${D.t.toLowerCase()}${e.aposta ? ` com uma aposta de <b>${kzShort(e.aposta)}</b>` : ''}. Conta: ${D.l || ''} (tens ${D.st()}).`, async () => {
        if (e.aposta && G.dinheiro < e.aposta) { vrApi('social', { op: 'desafio_nao', fid: e.id }); return toast('Não tens dinheiro para a aposta.'); }
        const r = await vrApi('social', { op: 'desafio_ok', fid: e.id, st: D.st() });
        if (!r.ok) return toast('🚫 ' + r.erro);
        v4DesRes(r.win, r.v, r.tipo, r.vs || e.de, r.eu, r.ele);
      }, () => vrApi('social', { op: 'desafio_nao', fid: e.id }), 'Aceitar desafio', 'Recusar');
      return true;
    }
    case 'desafio_res': v4DesRes(e.win, e.v, e.tipo, e.vs, e.eu, e.ele); return true;
    case 'desafio_nao': ban('⚔️', e.de, e.sem ? 'não tinha dinheiro para a aposta' : 'recusou o teu desafio', e.id); return true;
  }
  return false;
}
(function () {
  const _ev = vrEvent; vrEvent = function (e) { try { if (v4Event(e)) return; } catch (x) { console.error(x); } return _ev.apply(this, arguments); };
  vrInteragir = function (id) { return v4Perfil(id); };
  const _bu = breakUp; breakUp = function () { const p = G.parceiro, uid = p && p.uid; const r = _bu.apply(this, arguments); if (uid && !G.parceiro) vrApi('social', { op: 'namoro_fim', fid: uid }); return r; };
  const _ma = marry; marry = function () { const p = G.parceiro, was = p && p.casado; const r = _ma.apply(this, arguments); if (p && p.uid && !was && p.casado) vrApi('social', { op: 'casou', fid: p.uid }); return r; };
  // um(a) namorado(a) que é jogador(a) real não morre de velhice no teu jogo
  const _ag = ageUpLogic; ageUpLogic = function () { const p = G && G.parceiro, keep = p && p.uid ? p.idade : null; if (keep != null) p.idade = Math.min(p.idade, 50); const r = _ag.apply(this, arguments); if (keep != null && G.parceiro === p) p.idade = keep + 1; return r; };
})();
/* tocar num jogador no mundo 3D */
function v4PickPlayer(sx, sy) {
  if (typeof MP === 'undefined' || !MP.others || !MP.others.size || typeof camera === 'undefined' || mode !== 'game') return null;
  const sc = mpScene(), r = renderer.domElement.getBoundingClientRect(), v = new T.Vector3();
  let best = null;
  for (const [id, o] of MP.others) {
    if (!o.h || o.h.g.parent !== sc || !o.h.g.visible) continue;
    const g = o.h.g, hg = o.hgt || 1.8;
    v.set(g.position.x, hg * .5, g.position.z).project(camera); if (v.z > 1 || v.z < -1) continue;
    const cx = r.left + (v.x + 1) / 2 * r.width, cy = r.top + (1 - v.y) / 2 * r.height;
    v.set(g.position.x, hg, g.position.z).project(camera);
    const ty = r.top + (1 - v.y) / 2 * r.height, half = Math.max(20, (cy - ty) * 1.2), w = Math.max(22, half * .62);
    if (Math.abs(sx - cx) < w && Math.abs(sy - cy) < half) { const dd = camera.position.distanceTo(g.position); if (!best || dd < best.d) best = { id, d: dd }; }
  }
  return best && best.id;
}

/* ---------------- interiores: abrigo, mais decoração e etiquetas sem sobreposição ---------------- */
(function () {
  if (typeof IV_CASA === 'undefined') return;
  const _t = ivCasaTier; ivCasaTier = function () { return G && G.casa && G.casa.tipo === 'rua' ? 'abrigo' : _t.apply(this, arguments); };
  IV_CASA.abrigo = function (D) {
    ivRoom(D, { w: 14, d: 10, h: 4, ftex: ivFloorTex('cement', '#9a958c', '#000'), frep: 3, fr: 1, wall: '#d9e0e3', wains: '#5d7f93', wainsH: 1.1, trim: '#3e5666', bg: '#121416', dist: 13.5, door: '#7a4a2a' });
    ivWindow(D, 'back', -4.6, 1.5, 1.6, 1.2, 'bairro', '#3e5666'); ivWindow(D, 'back', 4.8, 1.5, 1.6, 1.2, 'bairro', '#3e5666');
    IVP = D.back; ivSign('ABRIGO DA MISSÃO', 4.6, '#1f4e79', '#ffffff', 'SOPA · BANHO · CAMA', 0, 3.05, -4.82);
    ivB(.12, .9, .06, '#6b4423', 0, 1.7, -4.84); ivB(.5, .12, .06, '#6b4423', 0, 2.25, -4.84);
    IVP = D.right; ivArt(6.96, 1.9, 1.6, -Math.PI / 2, 1.2, .8, 'angola', '#3e5666');
    IVP = D.st;
    // camaratas: colchões em fila
    [-5.6, -4.1, -2.6].forEach((z, i) => { ivBed(-5.4, z, Math.PI / 2, ['#5a6b80', '#7a5a3a', '#4a6b4a'][i], false, '#8a8f96'); });
    ivCol(D, -5.4, -4.1, 2.3, 4.4);
    ivB(.9, .5, .45, '#6b4423', -3.6, 0, -4.6); ivB(.25, .3, .2, '#c8102e', -3.7, .5, -4.6);
    // refeitório
    ivTable(1.5, -2.6, 3.4, 1, .76, '#b08a5a'); ivB(3.2, .45, .35, '#7a5a3a', 1.5, 0, -3.4); ivB(3.2, .45, .35, '#7a5a3a', 1.5, 0, -1.8); ivCol(D, 1.5, -2.6, 3.5, 2);
    [0.4, 1.5, 2.6].forEach(x => { ivC(.14, .12, .08, '#f4f4f4', x, .77, -2.6, 12); ivC(.1, .1, .02, '#d2a35a', x, .84, -2.6, 12); });
    ivCounter(5, -4.4, 3, .8, .95, '#e8e2d6', '#5a5a5a'); ivC(.38, .34, .5, '#9aa0a6', 4.4, .95, -4.4, 16, { metalness: .6, roughness: .35 }); ivC(.3, .3, .32, '#9aa0a6', 5.4, .95, -4.4, 16, { metalness: .6, roughness: .35 }); ivCol(D, 5, -4.4, 3.1, .9);
    ivCooler(6.4, -2.4); ivCol(D, 6.4, -2.4, .5, .5);
    // cacifos e quadro de avisos
    for (let i = 0; i < 4; i++) ivB(.55, 1.9, .5, ['#3e6a8a', '#4a7a5a', '#3e6a8a', '#8a6a3e'][i], 6.65, 0, .6 + i * .58);
    ivCol(D, 6.65, 1.5, .6, 2.4);
    ivRug(1.5, 1.4, 3.2, 2, null, ivRugTex('#5a2a1d', '#ffcb00', '#1d1d1d'));
    ivB(1.6, .4, .5, '#7a5a3a', -3.2, 0, 1.2); ivCol(D, -3.2, 1.2, 1.7, .6);
    ivPlant(-6.3, 3.8, .9); ivPlant(6.3, 4.1, 1); ivC(.2, .18, .45, '#2a8a3a', 5.4, 0, 4.2, 12);
    ivPendant(-4, 4, -3); ivPendant(1.5, 4, -2.6); ivPendant(5, 4, -4);
    ivLights(D, { hi: .7, ki: .62, key: '#ffeedd', points: [[1.5, 3.2, -2.6, '#ffe2b0', .8, 10], [-4.5, 3.2, -3.5, '#ffe2b0', .5, 8]] });
    ivStation(D, { x: 1.5, z: -.9, ry: Math.PI, tab: 'main', ico: '⛪', label: 'Abrigo · sobreviver', hit: [1.5, -2.6, 3.5, 2, 1.2] });
    ivStation(D, { x: -3.2, z: 2.2, ry: Math.PI, tab: 'fam', ico: '🤝', label: 'Kambas', hit: [-3.2, 1.2, 1.7, .6, .8] });
    ivStation(D, { x: 5.6, z: 1.5, ry: Math.PI / 2, tab: 'roupa', ico: '🎒', label: 'Mochila · roupa', hit: [6.65, 1.5, .6, 2.4, 1.9] });
    ivStation(D, { x: -3.6, z: -3.6, ry: 0, tab: 'diario', ico: '📜', label: 'Diário', hit: [-3.6, -4.6, .9, .5, .8] });
    ivNPC(D, 5, -3.6, Math.PI, { mode: 'idle', fem: true, cfg: { shirt: '#f2f2f2', pants: '#1f4e79' } });
    ivNPC(D, .6, -1.8, Math.PI, { mode: 'sit' }); ivNPC(D, 2.4, -3.4, 0, { mode: 'sit', fem: true });
  };
  const after = (k, fn) => { const o = IV_CASA[k]; if (!o) return; IV_CASA[k] = function (D) { const r = o.apply(this, arguments); try { IVP = D.st; fn(D); IVP = D.st; } catch (e) { console.error('v4 decor', k, e); } return r; }; };
  after('simples', D => {
    ivRug(.4, .9, 3, 2, null, ivRugTex('#c8102e', '#ffcb00', '#1d1d1d'));
    ivB(1.1, .42, .38, '#6b4a2a', -5.5, 0, .1); ivB(.35, .35, .3, '#1f63c9', -5.5, .42, .1); ivCol(D, -5.5, .1, .5, 1.2);
    ivGrp(3.4, 3.4, 0, () => { ivC(.24, .2, .32, '#3a3a3a', 0, 0, 0, 10); ivC(.2, .18, .22, '#7a7f86', 0, .32, 0, 12, { metalness: .5 }); ivS(.05, ivGlow('#ff6a00', 1.6), 0, .3, 0); });
    ivCol(D, 3.4, 3.4, .6, .6);
    ivShelf(5.85, -.7, -Math.PI / 2, 1.3, 1.5, '#7a5a3a', false); ivC(.1, .1, .22, '#c8102e', 5.8, 1.02, -1.1, 10); ivC(.12, .1, .18, '#2e8b57', 5.8, 1.02, -.5, 10); ivCol(D, 5.85, -.7, .5, 1.4);
    ivC(.16, .14, .3, '#b0b4b8', 5.6, 0, 3.9, 10, { metalness: .4 }); ivPlant(5.6, 3.9, .55, '#b0b4b8');
    ivC(.16, .14, .3, '#b0b4b8', -1.9, 0, -4.1, 10, { metalness: .4 }); ivPlant(-1.9, -4.1, .5, '#b0b4b8');
    IVP = D.right; ivArt(5.96, 1.9, 2, -Math.PI / 2, .7, .9, 'sunset', '#5a3a1e');
    IVP = D.left; ivB(.03, .45, .32, '#f4f1ea', -5.97, 1.5, .6); ivB(.03, .1, .32, '#c8102e', -5.96, 1.85, .6);
  });
  after('bairro', D => {
    ivBed(5.9, 3.3, -Math.PI / 2, '#2e5a8a', true); ivCol(D, 5.9, 3.3, 2.2, 1.7);
    ivB(.45, .5, .4, '#6b4423', 6.6, 0, 1.9 + .0); ivLampF(6.6, 4.6);
    ivRug(4.4, 3.3, 1.2, 1.8, null, ivRugTex('#2e5a8a', '#f2f2f2', '#ffcb00'));
    ivShelf(-6.75, -.6, Math.PI / 2, 1.6, 2, '#6b4423'); ivCol(D, -6.75, -.6, .5, 1.7);
    ivRug(-.6, 1.5, 3, 2, null, ivRugTex('#8a1a2a', '#f2e6c8', '#1d1d1d'));
    ivGrp(-2.6, 3.4, 0, () => { ivC(.35, .35, .38, '#a3482a', 0, 0, 0, 14); ivC(.36, .36, .05, '#f4e1b0', 0, .38, 0, 14); }); ivCol(D, -2.6, 3.4, .8, .8);
    ivPlant(2.6, 4.4, .9); ivClock(6.96, 2.6, -1.4, -Math.PI / 2);
  });
  after('apto', D => {
    ivBed(6.9, 3.6, -Math.PI / 2, '#e9e4da', true, '#2a2a2a'); ivCol(D, 6.9, 3.6, 2.2, 1.8);
    ivB(.45, .5, .4, '#2a2a2a', 7.6, 0, 2.2); ivLampF(7.6, 4.9); ivRug(5.4, 3.6, 1.3, 2, null, ivRugTex('#3d5a73', '#e9e4da', '#c9a227'));
    ivShelf(-7.75, -.8, Math.PI / 2, 1.8, 2.4, '#2a2a2a'); ivCol(D, -7.75, -.8, .5, 1.9);
    ivRug(-.6, 2.1, 3.4, 2.2, null, ivRugTex('#e9e4da', '#c9a227', '#3d5a73'));
    ivSofa(-2.8, 3.6, Math.PI / 2, '#c9a227', 1.2); ivCol(D, -2.8, 3.6, 1, 1.3); ivPlant(2.4, 4.9, 1);
  });
  after('luxo', D => {
    ivBed(8.6, 4.4, -Math.PI / 2, '#f4f1ea', true, '#1d1d1d'); ivCol(D, 8.6, 4.4, 2.3, 2);
    ivB(.5, .5, .45, '#1d1d1d', 9.3, 0, 2.7); ivLampF(9.3, 6.2, '#ffe9c0'); ivRug(6.9, 4.4, 1.4, 2.2, null, ivRugTex('#1d1d1d', '#c9a227', '#f4f1ea'));
    ivCounter(3.5, 4.2, 3, .7, 1.05, '#1d1d1d', '#c9a227'); [2.6, 3.5, 4.4].forEach(x => ivStool(x, 5.1, '#c9a227')); ivCol(D, 3.5, 4.2, 3.1, .8);
    for (let i = 0; i < 5; i++) ivC(.04, .05, .3, ['#2e8b57', '#c8102e', '#ffcb00', '#7a1f5c', '#1f63c9'][i], 2.4 + i * .5, 1.05, 4.1, 8);
    ivPlant(-2.6, 6.2, 1.4); ivPlant(-9.2, -6.2, 1.5);
  });
  // etiquetas: as que ficam muito perto umas das outras sobem em degraus
  const _b = ivBuild; ivBuild = function () {
    const D = _b.apply(this, arguments);
    try {
      const L = (D.labels || []).filter(l => l && l.position).sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
      for (let k = 0; k < 3; k++) for (let i = 0; i < L.length; i++) for (let j = 0; j < i; j++) {
        const a = L[i], b = L[j], dx = Math.abs(a.position.x - b.position.x), dz = Math.abs(a.position.z - b.position.z), dy = Math.abs(a.position.y - b.position.y);
        if (dx < 2.9 && dz < 2.2 && dy < .55) { a.position.y = Math.min(D.h + .4, Math.max(a.position.y, b.position.y) + .6); a.userData.y = a.position.y; }
      }
    } catch (e) { }
    return D;
  };
})();
