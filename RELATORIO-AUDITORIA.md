# Próxima Encarnação — Auditoria Completa & O Que Falta
**Data:** 2026-11-23 · **Método:** playtest automatizado (Playwright) + análise estática de todo o código + testes multiplayer com 2 contas em simultâneo.

---

## 1. O que foi testado e PASSOU ✅

| Área | Resultado |
|---|---|
| Painéis (prédios, menus) | **112 separadores testados, 0 erros**, nenhum vazio |
| Apps do telemóvel | **37 apps testados, 0 erros**, todos com conteúdo |
| Interiores | Todos os prédios entram (banco, escola, hospital, universidades, stands, estações, restaurante, cantina, salão…) |
| Salas multiplayer | 2 contas no mesmo prédio vêem-se e falam (testado com foto) |
| Servidor | limite de 3 anos/dia confirmado; 0 erros de consola no percurso |
| Rig/animações | 18/18 NPCs articulados |
| Ícones | 658/658 emojis com ícone desenhado (corrigido nesta ronda) |

## 2. Bugs encontrados e CORRIGIDOS nesta auditoria 🔧
1. 24 emojis (📽️ 🥁 🥚 🦈 🪣 🤰 🌽…) apareciam como emoji do sistema em vez do ícone desenhado — mapeados.
2. Presença multiplayer expirava em 10 s (jogador "sumia" com uma falha de rede) — agora 25 s.
3. Contagem "anos vividos hoje" podia duplicar ao confirmar no servidor — corrigido.

## 3. Falhas menores encontradas (por corrigir) ⚠️
1. "Fechar o ano" não mostra spinner durante a confirmação do servidor (~200 ms).
2. Lista "Aqui em…" não mostra o rosto/avatar dos jogadores, só o nick.
3. Gravação de voz sem indicador grande no ecrã principal (só dentro do chat).
4. Sem mensagem de confirmação visual quando o jogo grava no servidor (save silencioso).
5. Minimapa não distingue prédio "com interior" de marcos sem entrada (praia, cadeia).
6. Sem aviso de "sem internet" elegante se o servidor cair durante o jogo (só o chat morre).

---

# 4. O QUE FALTA — lista grande por área (250+ itens)

⭐ = rápido de fazer · 🔥 = impacto alto

## A. Primeiros minutos (onboarding)
1. 🔥 Tutorial interativo de 5 passos (mover, entrar, telemóvel, trabalhar, fechar ano) — *proposto, por decidir*.
2. ⭐ Missão inicial guiada: "Fala com a tua mãe", "Vai à escola", "Arranja biscate".
3. ⭐ Dica contextual na 1ª vez em cada prédio ("Aqui podes abrir conta…").
4. ⭐ Objetivo do 1º dia no HUD (ex.: "Ganha 5 mil Kz").
5. 🔥 "Sonho de vida" aos 16 (escolher meta épica: rico, famoso, presidente…) — *proposto*.
6. ⭐ Visita guiada à cidade no 1º login (câmara sobrevoa os pontos).
7. ⭐ Botão "Não voltar a mostrar" nas dicas.

## B. Vida quotidiana
8. Higiene: banho, lavar roupa, pentear (afeta respeito).
9. Dias da semana reais (seg–dom) com fim de semana diferente.
10. 🔥 Feriados nacionais: 11 Nov, 4 Fev, 17 Set, 1 Jan — cidade decorada + eventos.
11. Horário comercial: lojas fecham de noite; mercado abre de madrugada.
12. Fila no banco (como no SIAC).
13. ⭐ Troco no mercado (às vezes errado — podes reclamar).
14. 🔥 Negociar/barganhar preços no mercado e nas zungueiras.
15. Cortes de água/luz por zona (apagão noturno no musseque vs. Talatona).
16. Gerador e tanque de água compráveis para casas.
17. ⭐ Tempo de viagem proporcional à distância a pé.
18. Despertador/rotina: acordar cedo dá bónus de energia.
19. Notícias na TV sobre o que fizeste (fama).

## C. Saúde
20. 🔥 Farmácia (comprar medicamentos, preservativos, vitaminas).
21. Dentista (dor de dente aleatória).
22. Ótica/óculos (visão afeta condução).
23. Vacinas (campanhas no hospital).
24. Malária/paludismo com mosquito à noite no musseque.
25. Ecografia e escolha de nome na gravidez.
26. Parto no hospital vs. parteira tradicional.
27. Psicólogo (stress/felicidade).
28. Seguro de saúde privado.
29. Fisioterapia após acidentes.
30. ⭐ Doar sangue (respeito + item).

## D. Família
31. Irmãos que NASCEM depois de ti (pais têm mais filhos).
32. Avós, tios e primos com visitas.
33. 🔥 Casamento com cerimónia na igreja, convidados e gasto real.
34. Divórcio com partilha de bens e pensão.
35. 🔥 Filhos que crescem: escola, mesada, pedidos.
36. Adoção.
37. Funeral + luto (eventos já existem; tornar visível no mundo).
38. Herança dos pais quando morrem (casa, poupança).
39. Reunião familiar ao domingo (bónus de felicidade).
40. Pais ficam velhos e precisam de ajuda (pagar clínica).

## E. Amor
41. 🔥 Namoro com outros jogadores (pedido, estado no perfil).
42. Encontros em sítios (restaurante, praia, cinema).
43. ⭐ Presentes (flores, chocolate, telemóvel).
44. Eventos de ciúme/traição.
45. 🔥 Casamento multiplayer (dois jogadores, convidados, festa).
46. Lua de mel (viagem a Benguela/Namibe).

## F. Educação
47. Exames nacionais com nota e ranking da turma.
48. ⭐ Material escolar a renovar todo o ano.
49. Bolsas de estudo por mérito.
50. Intercâmbio (semestre fora).
51. Bullying na escola (eventos).
52. Festa de finalistas.
53. Reprovação por faltas (faltar às aulas tem custo).
54. Trabalhos de grupo com colegas NPC.
55. Biblioteca/livraria no mapa.

## G. Trabalho
56. 🔥 Entrevista de emprego (mini-jogo de perguntas).
57. Currículo visível e melhorável (CV na app).
58. 🔥 Colegas e chefe com relações (cunha já existe; expandir).
59. Horas extra pagas.
60. 🔥 Subsídio de férias e 13.º (Natal).
61. Acidentes de trabalho (seguro).
62. Despedimento por justa causa (faltas).
63. Subsídio de desemprego.
64. Trabalho remoto (com computador bom).
65. Festa de reforma.
66. Estágios não pagos → contrato.
67. ⭐ Avaliação anual do chefe (desempenho visível).

## H. Dinheiro e banco
68. 🔥 ATM/multibanco no mundo (levantar sem entrar no banco).
69. 🔥 Transferências entre jogadores (Palanca Pay P2P).
70. Cartão com PIN.
71. Agiota: empréstimo rápido, juro alto, cobrança "musculada".
72. Juros compostos visíveis na poupança.
73. Inflação anual (preços sobem com os anos).
74. Câmbio USD/EUR para viagens.
75. Débitos diretos das contas da casa.
76. Cofre em casa (roubo pode levar dinheiro em mão).
77. ⭐ Notificação de cada movimento no saldo.

## I. Habitação
78. Renda ao senhorio com recibo mensal.
79. Despejo por falta de pagamento (evento).
80. 🔥 Mobília comprável e decoração da casa (loja de móveis).
81. Melhorias: pintura, cozinha nova, painel solar, ar condicionado.
82. Cortes de água/luz por dívida (parcialmente existe).
83. Vizinhos barulhentos / festa do vizinho.
84. Mudança com camioneta de mudanças.
85. Alarme e segurança privada.
86. Empregada doméstica / jardineiro.
87. ⭐ Piscina nas mansões (funcional: nadar).

## J. Transporte
88. 🔥 Gasolina: preços, postos Mulemba, ficar sem combustível.
89. Multas de trânsito (excesso, mau estacionamento).
90. 🔥 Carta de condução com escola de condução e exame.
91. Acidentes com peritagem e seguro.
92. Revisão/oficina com peças (já há oficina; expandir).
93. Inspeção veicular anual.
94. ⭐ Preço do táxi por distância real.
95. Estacionamento pago no centro.
96. Portagens na estrada para outras províncias.
97. Lavagem de carro.
98. ⭐ Rádio do carro sincronizada com a tua conta.

## K. Comida
99. 🔥 Cozinhar em casa (ingredientes do mercado, receitas).
100. Receitas angolanas com bónus diferentes (muamba, calulu, mufete…).
101. Mercearia de bairro (kitanda) além do mercado.
102. Fome com efeitos graduais (tontura, ecrã a tremer leve).
103. Água: bidons no musseque (já há bidons no chão; tornar funcional).
104. ⭐ Churrasco de fim de semana com amigos.
105. Dieta e peso (corpo já muda; ligar à comida).

## L. Lazer e cultura
106. 🔥 Cinema físico (sessões, bilhetes, pipocas).
107. Teatro.
108. 🔥 Pesca na Ilha (mini-jogo com cana).
109. Nadar na praia (barra de fôlego).
110. Pelada de futebol no bairro (mini-jogo).
111. Damas/matraquilhos nos largos.
112. Visita ao Mausoléu Agostinho Neto (conteúdo histórico).
113. Concertos ao vivo com palco e multidão.
114. Aulas de kizomba/semba (escola de dança).
115. Festa de quintal no bairro.
116. 🔥 Carnaval jogável (desfile, grupos, apostas).
117. Parque infantil jogável (já há visual no Kilamba; dar uso às crianças).
118. Caça ao tesouro semanal pela cidade.

## M. Tecnologia e media
119. 🔥 Rede social no telemóvel: feed, posts com foto, likes, seguidores.
120. 🔥 Carreira de influencer/streamer (ganhar por views).
121. Loja online com entregas ao domicílio.
122. Vírus no telemóvel + loja de reparação.
123. Bateria do telemóvel + powerbank.
124. Pacotes de dados MB (Mbote) necessários para apps online.
125. Leaderboards nos jogos do telemóvel.
126. ⭐ Wallpapers e temas do telemóvel (Kianda OS).

## N. Crime e justiça
127. 🔥 Tribunal com julgamento, advogado e testemunhas.
128. Suborno com risco de denúncia.
129. Investigação policial (pistas).
130. 🔥 Companheiros de cela multiplayer (a cela já é sala; dar uso).
131. Trabalho comunitário como pena alternativa.
132. Loja de penhores.
133. Mercado negro (risco/benefício).
134. Reincidência agrava penas.

## O. Política
135. Voto do jogador conta na eleição (urna no município).
136. Debates na TV KALEMBA.
137. Orçamento municipal visível.
138. Manifestações na rua (evento vivo).
139. Presidente altera economia (preços, subsídios).
140. Embaixadas e vistos para viagens internacionais.

## P. Multiplayer e social
141. Festas em casa com convidados.
142. 🔥 Empresas com funcionários jogadores reais (salário pago pelo dono).
143. Torneios semanais (futebol, kuduro, EA FC).
144. Presentes entre jogadores.
145. 🔥 Mercado de jogadores (vender itens usados, carros).
146. Leilões de casas/carros.
147. Rivalidades de bairro (eventos).
148. ⭐ Emotes sincronizados (dançar juntos).

## Q. Comunicação
149. 🔥 Chamadas de voz diretas 1-para-1.
150. Grupos de chat.
151. Status/stories no telemóvel.
152. Mensagens offline (caixa de entrada).
153. ⭐ Balão de voz mostra duração e ondas.

## R. UI/UX
154. ⭐ Indicador de "a gravar…" quando o jogo grava no servidor.
155. ⭐ Ajuda "?" em cada painel.
156. Tamanho da fonte nas definições.
157. Remap de controlos PC.
158. Histórico de notificações.
159. Widget de metas no HUD.
160. Ordenar apps do telemóvel (arrastar).
161. ⭐ Botão de partilhar momento (screenshot).

## S. Mobile
162. Swipe para fechar painéis.
163. Vibração (haptics) em ações.
164. ⭐ Modo poupança de dados (menos polls).
165. Instalação PWA ("Adicionar ao ecrã principal").

## T. Áudio
166. Mais estações: kizomba, semba, gospel, notícias.
167. Som ambiente por zona (mar na Ilha, burburinho no mercado).
168. Passos por superfície.
169. Buzinas no trânsito.
170. Música dinâmica em eventos (perseguição, festa).

## U. Mundo e NPCs
171. 🔥 NPCs com rotinas (saem de manhã, voltam à noite).
172. Zungueiras móveis a andar pelas ruas.
173. Polícia a patrulhar a pé.
174. Hora de ponta (mais trânsito 7–9h / 17–19h).
175. Buracos na estrada no musseque.
176. Equipa de limpeza urbana.
177. Cães de rua.
178. Crianças a jogar à bola no bairro.
179. Casamentos/funerais de NPC visíveis.
180. Vuvuzelas e festa quando o Girabola tem golo.

## V. Províncias e viagens
181. 🔥 Viajar muda mesmo o cenário (destino jogável, não só painel).
182. Conteúdo por província (praia do Lobito, Tundavala, fenda).
183. Sotaques/diálogos regionais.
184. Passaporte e fronteira.
185. Bagagem com peso no avião.

## W. Progressão e metas
186. Conquistas com recompensas reais (já existem; ligar a bónus).
187. Títulos desbloqueáveis (ex.: "Kota", "Doutor").
188. 🔥 Legado: ao morrer, o filho herda e continuas com ele.
189. Ranking semanal (mais rico, mais respeitado, mais solidário).
190. Desafios diários/semanais.
191. ⭐ Barra de progresso da carreira no HUD.

## X. Fim de vida
192. Testamento (escolher herdeiros).
193. Funeral com convidados.
194. Lápide visitável no cemitério.
195. ⭐ Reencarnação: nova vida com pequeno bónus da anterior.

## Y. Pets e quintal
196. 🔥 Pets: cão, gato, papagaio (comprar, alimentar, passear).
197. Veterinário.
198. Machamba/quintal: plantar couve, banana, mandioca; colher e vender.
199. Galinhas no quintal (ovos).

## Z. Conta e segurança
200. Recuperar senha por e-mail.
201. Ver sessões ativas.
202. 2FA opcional.
203. Apagar conta.
204. ⭐ Termos e regras da comunidade no registo.

## AA. Moderação
205. Reportar jogador.
206. Bloquear jogador.
207. Ferramentas de moderador (painel admin).

## AB. Eventos sazonais
208. 11 de Novembro com fogo de artifício na Marginal.
209. Carnaval (fevereiro).
210. Dia da Mulher Africana (31 jul).
211. Natal e Ano Novo decorados.
212. Black Friday com saldos nas lojas.
213. Regresso às aulas (setembro).

## AC. Realismo extra
214. Sistema de troco e notas físicas.
215. Candongueiro avariado (evento em viagem).
216. Apagões noturnos por zona.
217. "Água vem às terças" no musseque (regime).
218. Preços sobem na chuva (kapulanas…).
219. Wi-Fi público no shopping (grátis, lento).
220. Carregadores públicos (cargueiro).

---

## 5. Prioridade sugerida (a minha recomendação)
**Próxima ronda:** tutorial de 5 passos + Sonho de vida (A), farmácia (C), transferências entre jogadores + ATM (H), gasolina/carta de condução (J), rede social no telemóvel (M), casamento/empresas multiplayer (P), NPCs com rotinas (U), legado/herança (W).
