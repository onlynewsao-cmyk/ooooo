# Gera proxima-encarnacao.html (tudo num só ficheiro). Correr na raiz do projeto.
import re,glob,os,base64,json
src=open('3d/index.html').read()
imgs={os.path.relpath(f,'img')[:-4].replace(os.sep,'/'):'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('img/*.jpg')+glob.glob('img/sel/*.jpg')) if '_fix' not in f}
aud={os.path.basename(f)[:-4]:'data:audio/mpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('3d/audio/*.mp3')) if 'trailer' not in f}
def inl(m):
    name=m.group(1); js=open('3d/'+name).read().replace('</script>','<\\/script>')
    pre=('<script>window.IMG='+json.dumps(imgs)+';window.AUD='+json.dumps(aud)+';</script>\n') if name=='three.min.js' else ''
    return pre+'<script>'+js+'</script>'
out=re.sub(r'<script src="([a-z0-9.]+\.js)"></script>', inl, src)
out=re.sub(r'<a class="v2d"[^>]*>.*?</a>','',out,flags=re.S)
assert not re.search(r'src="[^"]*\.js"',out)
open('proxima-encarnacao.html','w').write(out); print(len(out)//1024,'KB')
