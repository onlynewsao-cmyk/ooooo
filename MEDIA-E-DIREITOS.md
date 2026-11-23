# Próxima Encarnação — música, vozes e vídeos

Todo o conteúdo audiovisual foi criado de propósito para o jogo. Não tem músicas, amostras, logótipos nem marcas reais de terceiros.

## Rádio (música original)
- `3d/musica.js` é o motor de música procedimental. Cria 24 faixas instrumentais em tempo real, no próprio browser, com Web Audio:
  - estilos kuduro, kizomba, semba e afro-house;
  - não usa ficheiros de som externos.
- As estações da rádio do jogo usam este motor. O locutor fala entre as faixas, com vozes geradas para o jogo (`3d/audio/*.mp3`).
- Função de exportação: `MZ.renderOffline(faixa, segundos)` seguido de `MZ.wav(buffer)`. Gera um WAV de qualquer faixa, por exemplo para usar num trailer.

## Vozes (`3d/audio/`)
- `id_*`: identificação de cada estação.
- `dj_ded`, `dj_next`: falas do locutor.
- `tv_tj`: abertura do telejornal.
- `trailer1`, `trailer2`: narração do trailer.

## Vídeos
- **Trailer:** `3d/media/trailer.mp4` (1280×720, 26 s).
  - Imagens: jogabilidade real, capturada frame a frame do motor do jogo.
  - Som: faixa original "Kuduro na Banda" mais a narração.
  - No jogo: Menu › Créditos › Ver trailer.
  - Para refazer: `python3 tools/trailer_compose.py <frames> <musica.wav> <saida.mp4>`.
- **Televisão no jogo** (canais Kalemba):
  - telejornal, reportagem, meteorologia, Girabola, novela e anúncios de marcas inventadas;
  - desenhados em tempo real em canvas (`3d/live.js` e `3d/vida5.js`).
- **Cinemática de nascimento:** mapa de Angola, província de origem e voo de câmara até ao local onde a personagem nasce (`3d/vida5.js`, função `v5Cine`).
