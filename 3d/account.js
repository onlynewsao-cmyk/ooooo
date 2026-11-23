/* =========================================================
   PRÓXIMA ENCARNAÇÃO — Contas de jogador
   Online (server.py) com recurso a contas locais no navegador.
   ========================================================= */
/* identidade do aparelho (anti-multiconta): aleatório, guardado no aparelho; não identifica a pessoa */
let DEV_ID = ''; try { DEV_ID = localStorage.getItem('pe3d_dev') || ''; if (!DEV_ID) { DEV_ID = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('pe3d_dev', DEV_ID); } } catch (e) { DEV_ID = 'x' + Math.random().toString(36).slice(2); }
const Acc = (() => {
  const SK = 'pe3d_session_v2', UK = 'pe3d_users_v2';
  let online = false, sess = null, saveTimer = null, pending = null, lastSent = 0, saveMs = 15000;
  const ls = {
    get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del: k => { try { localStorage.removeItem(k); } catch (e) { } },
  };
  async function api(path, body, method) {
    const h = { 'Content-Type': 'application/json' };
    if (sess && sess.token) h.Authorization = 'Bearer ' + sess.token;
    const r = await fetch('/api/' + path, { method: method || (body ? 'POST' : 'GET'), headers: h, body: body ? JSON.stringify(body) : undefined });
    let d = {}; try { d = await r.json(); } catch (e) { }
    if (!r.ok) { const err = new Error(d.erro || 'Erro de ligação ao servidor.'); err.status = r.status; throw err; }
    return d;
  }
  async function hash(senha, salt) {
    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', enc.encode(senha), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 60000, hash: 'SHA-256' }, key, 256);
      return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { // contexto sem crypto.subtle
      let h1 = 0x811c9dc5, s = salt + ':' + senha;
      for (let r = 0; r < 4000; r++) for (let i = 0; i < s.length; i++) { h1 ^= s.charCodeAt(i) + r; h1 = Math.imul(h1, 16777619) >>> 0; }
      return 'f' + h1.toString(16);
    }
  }
  const rnd = () => [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, '0')).join('');
  const localKey = (id, t) => `pe3d_${t}_${id}`;
  const NOME_RE = /^[\wÀ-ÖØ-öø-ÿ]+(?: [\wÀ-ÖØ-öø-ÿ]+)*$/;
  const checkNome = (nome) => {   // regras de formato; figuras públicas e unicidade são confirmadas no servidor
    const nm = (nome || '').trim().replace(/\s+/g, ' ');
    if (nm.length < 2) throw new Error('O nome precisa de pelo menos 2 letras.');
    if (nm.length > 24) throw new Error('O nome pode ter no máximo 24 caracteres.');
    if (!NOME_RE.test(nm) || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(nm)) throw new Error('O nome só pode ter letras, números e _ (sem emojis nem símbolos). Ex.: draka, _draka_, draka_4.');
    return nm;
  };
  const check = (d) => {
    d.nome = checkNome(d.nome);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || '')) throw new Error('E-mail inválido.');
    if (!d.senha || d.senha.length < 6) throw new Error('A senha precisa de pelo menos 6 caracteres.');
  };
  function result(user, save, meta) {
    if (!online) { save = ls.get(localKey(user.id, 's')); meta = ls.get(localKey(user.id, 'm')); }
    else { const c = ls.get(localKey('o' + user.id, 's')); if (!save && c) save = c; }
    return { user, save: save || null, meta: meta || { karmaBonus: 0, vidas: [] } };
  }
  return {
    get online() { return online; },
    get hasSession() { return !!sess; },
    get user() { return sess && sess.user; },
    get token() { return sess && sess.token; },
    async init() {
      if (location.protocol === 'file:') online = false;
      else {
        online = false;
        for (let i = 0; i < 2 && !online; i++) {   // 2 tentativas: redes móveis e arranques frios do servidor falham à primeira
          try {
            const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
            const r = await fetch('/api/ping', { signal: ctl.signal }); clearTimeout(t);
            const pj = r.ok ? await r.json() : {}; online = pj.ok === true;
            if (pj.save_s) saveMs = Math.max(10000, Math.min(120000, pj.save_s * 1000));   // o servidor decide o ritmo de gravação
          } catch (e) { }
          if (!online && !i) await new Promise(res => setTimeout(res, 1200));
        }
      }
      sess = ls.get(SK);   // a sessão nunca é deitada fora aqui: o restore decide (só um 401 a apaga)
      return online;
    },
    async restore() {
      if (!sess) return null;
      if (online) {
        try { const d = await api('me'); sess.user = d.user; ls.set(SK, sess); return result(d.user, d.save, d.meta); }
        catch (e) {
          if (e && e.status === 401) { sess = null; ls.del(SK); }   // token mesmo inválido/expirado
          // erro de rede ou 5xx (redeploy, arranque frio): manter a sessão para a próxima visita
          return null;
        }
      }
      if (sess.mode === 'online') return null;   // servidor inatingível agora — a sessão fica guardada
      try {
        const users = ls.get(UK) || {}; const u = Object.values(users).find(x => x.id === sess.user.id);
        if (!u) { sess = null; ls.del(SK); return null; }
        return result(pub(u));
      } catch (e) { return null; }
    },
    async register(d) {
      check(d);
      if (online) { const r = await api('register', Object.assign({}, d, { dv: DEV_ID })); sess = { mode: 'online', token: r.token, user: r.user }; ls.set(SK, sess); return result(r.user, null, null); }
      const users = ls.get(UK) || {}; const email = d.email.trim().toLowerCase();
      if (users[email]) throw new Error('Já existe uma conta com este e-mail neste dispositivo.');
      if (Object.values(users).some(x => (x.nome || '').toLowerCase() === d.nome.toLowerCase())) throw new Error('Este nome já está a ser usado neste dispositivo.');
      const salt = rnd();
      const u = { id: 'L' + Date.now().toString(36), nome: d.nome.trim().slice(0, 40), email, salt, hash: await hash(d.senha, salt), adulto: !!d.adulto, avatar: d.avatar || {} };
      users[email] = u; ls.set(UK, users); sess = { mode: 'local', user: pub(u) }; ls.set(SK, sess);
      return result(pub(u));
    },
    async login(email, senha) {
      if (!email || !senha) throw new Error('Preenche o e-mail e a senha.');
      if (online) { const r = await api('login', { email, senha, dv: DEV_ID }); sess = { mode: 'online', token: r.token, user: r.user }; ls.set(SK, sess); return result(r.user, r.save, r.meta); }
      const users = ls.get(UK) || {}; const u = users[email.trim().toLowerCase()];
      if (!u || u.hash !== await hash(senha, u.salt)) throw new Error('E-mail ou senha incorretos.');
      sess = { mode: 'local', user: pub(u) }; ls.set(SK, sess); return result(pub(u));
    },
    async updateProfile(patch) {
      if (!sess) return;
      if (online) { const r = await api('profile', patch); sess.user = r.user; }
      else {
        const users = ls.get(UK) || {}; const u = users[sess.user.email]; if (!u) return;
        Object.assign(u, patch); users[u.email] = u; ls.set(UK, users); sess.user = pub(u);
      }
      ls.set(SK, sess); return sess.user;
    },
    persist(save, meta) {
      if (!sess) return;
      const id = online ? 'o' + sess.user.id : sess.user.id;
      if (save) ls.set(localKey(id, 's'), save); else ls.del(localKey(id, 's'));
      if (meta) ls.set(localKey(id, 'm'), meta);
      if (!online) return;
      pending = { save: save || null, meta };
      clearTimeout(saveTimer);
      // a gravação local é imediata; para o servidor no máximo 1 vez a cada 15 s (menos carga com milhares de jogadores)
      saveTimer = setTimeout(() => { const b = pending; pending = null; lastSent = Date.now(); api('save', b).catch(() => { }); }, Math.max(900, saveMs - (Date.now() - lastSent)));
    },
    flush() {   // ao fechar/esconder o separador
      if (!pending || !online || !sess) return;
      clearTimeout(saveTimer); const b = pending; pending = null; lastSent = Date.now();
      try { fetch('/api/save', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sess.token }, body: JSON.stringify(b) }); } catch (e) { }
    },
    async logout() {
      if (pending) { clearTimeout(saveTimer); try { await api('save', pending); } catch (e) { } pending = null; }
      if (online) { try { await api('logout', {}); } catch (e) { } }
      sess = null; ls.del(SK);
    },
  };
  function pub(u) { return { id: u.id, nome: u.nome, email: u.email, adulto: !!u.adulto, avatar: u.avatar || {} }; }
})();
addEventListener('pagehide', () => { try { Acc.flush(); } catch (e) { } });
document.addEventListener('visibilitychange', () => { if (document.hidden) try { Acc.flush(); } catch (e) { } });
