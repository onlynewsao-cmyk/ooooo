#!/usr/bin/env python3
"""Router mínimo (só biblioteca padrão) para TESTAR o cluster sem nginx.
Em produção usa o nginx gerado por tools/gen_cluster.py — este router não aguenta milhares de jogadores.
  python3 tools/router.py PORTA K PORTA_BASE
"""
import http.client, sys, threading
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlsplit, parse_qs
PORT, K, BASE = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
TL = threading.local()
def node_port(path):
    u = urlsplit(path)
    if u.path in ('/api/pol', '/api/login', '/api/register'):
        return BASE
    try:
        s = int(parse_qs(u.query).get('sh', ['0'])[0])
    except Exception:
        s = 0
    return BASE + ((s - 1) % K) if s >= 1 else BASE
class P(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    def log_message(self, *a): pass
    def go(self):
        port = node_port(self.path)
        n = int(self.headers.get('Content-Length') or 0)
        body = self.rfile.read(n) if n else None
        cs = getattr(TL, 'c', None) or {}; TL.c = cs
        for tent in (0, 1):
            c = cs.get(port) or http.client.HTTPConnection('127.0.0.1', port, timeout=20); cs[port] = c
            try:
                h = {k: v for k, v in self.headers.items() if k.lower() not in ('host', 'connection')}
                c.request(self.command, self.path, body, h); r = c.getresponse(); data = r.read(); break
            except Exception:
                cs.pop(port, None)
                if tent: return self.send_error(502)
        self.send_response(r.status)
        for k, v in r.getheaders():
            if k.lower() not in ('connection', 'transfer-encoding', 'server', 'date'): self.send_header(k, v)
        self.end_headers(); self.wfile.write(data)
    do_GET = do_POST = go
class S(ThreadingHTTPServer):
    daemon_threads = True; allow_reuse_address = True; request_queue_size = 4096
print(f'router :{PORT} -> {K} nós a partir de :{BASE}')
S(('0.0.0.0', PORT), P).serve_forever()
