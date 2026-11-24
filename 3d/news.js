/* =========================================================
   ACONTECIMENTOS REAIS — o que os jogadores fazem vira notícia
   Alimenta a rádio (locutores), o Telejornal (Kalemba 1) e o
   Jornal no telemóvel. O servidor guarda as manchetes; aqui
   buscamos e publicamos.
   ========================================================= */
const NEWS = { on: 0, items: [], top: [], fam: [], deds: [], ts: 0 };
let newsLastPub = 0;

async function newsRefresh(force) {
  if (typeof Acc === 'undefined' || !Acc.online) return;
  const now = Date.now();
  if (!force && now - NEWS.ts < 110000) return;
  NEWS.ts = now;
  try {
    const r = await fetch('/api/news');
    if (!r.ok) return;
    const d = await r.json();
    NEWS.on = d.on || 0;
    NEWS.items = (d.items || []).slice().reverse();          // mais recentes primeiro
    NEWS.top = d.top || []; NEWS.fam = d.fam || [];
    NEWS.deds = (d.deds || []).slice().reverse();
  } catch (e) { }
}
setInterval(() => { try { newsRefresh(); } catch (e) { } }, 120000);
addEventListener('load', () => setTimeout(() => newsRefresh(true), 5000));

function newsPub(txt) {
  if (typeof Acc === 'undefined' || !Acc.online || !Acc.token) return;
  const now = Date.now();
  if (now - newsLastPub < 300000) return;                    // 1 notícia a cada 5 min por jogador
  newsLastPub = now;
  fetch('/api/news/pub', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Acc.token },
    body: JSON.stringify({ txt: String(txt).slice(0, 140) })
  }).catch(() => { });
  NEWS.ts = 0; setTimeout(() => newsRefresh(true), 5000);
}

/* uma manchete real para o locutor da rádio ler */
function newsLine() {
  if (NEWS.items.length) {
    const x = NEWS.items[R(0, Math.min(NEWS.items.length, 8) - 1)];
    return x.t;
  }
  if (NEWS.on > 1) return `neste momento há ${NEWS.on} jogadores a viver a vida na cidade`;
  return 'a cidade está a acordar — entra, faz história e apareces no noticiário';
}

/* bloco de notícias para o Telejornal e para o Jornal */
function newsReal() {
  const out = [];
  NEWS.items.slice(0, 6).forEach(x => out.push(x.t));
  if (NEWS.top.length) out.push(`💰 ${NEWS.top[0].n} é o jogador mais rico da cidade${NEWS.top.length > 1 ? `, seguido de ${NEWS.top[1].n}` : ''}`);
  if (NEWS.fam.length && NEWS.fam[0].f >= 20) out.push(`⭐ ${NEWS.fam[0].n} é a figura mais famosa do momento`);
  return out;
}
