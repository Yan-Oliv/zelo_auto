# ZE-12 — Release controlado e homologação em produção

**COMPLETED — PUBLICADA**, em 2026-10-25: https://zelo.omnyatech.com.br/

Exatamente duas entregas formais. O proprietário respondeu **Autorizo** ao plano concreto do candidato/ambiente e à sincronização Instagram, encerrando o GateD antes de qualquer publicação de produção. A hero e a landing já estavam aprovadas visualmente; a ZE-11 estava COMPLETED após rework. ZE-09 permanece BLOCKED_EXTERNAL sob a exceção expressa para apresentar Google indisponível de forma honesta.

## Entrega 1 — Release autorizado, rastreável e seguro

- Produto publicado: **676f1a5a7e51e9c79c5f3fbe03c56edc35beedd8**, da branch de trabalho preservada work/ze-audi-redesign. O commit documental de preparação20f91fe não foi confundido com o produto.
- Projeto Pages: zelo-auto, conta663888827c96aad8d97cea728e78fb0a, repositório Yan-Oliv/zelo_auto, produção por main no pipeline GitHub existente. Nenhum projeto, DNS, billing ou pipeline paralelo criado.
- Instalação limpa npm ci, lint e build PASS em fonte isolada do Git. Seis warnings legados no lint e aviso de chunk3D de debug preservados; Three/GLB não entram no caminho da landing. Os134arquivos/28,3MB do dist excluem .env/.nox/arquivos locais e o GLB ignorado66,6MB.
- npm audit registrou14findings (9high/5moderate), classificados na revisão como ferramentas offline/build/dev e debug com URLs fixas, sem caminho remoto explorável demonstrado na landing/Functions. Isso não significa audit limpo; não houve upgrade indiscriminado.
- As três variáveis Instagram autorizadas foram sincronizadas apenas como segredos server-side, preservando a variável legada de feed e demais bindings. Não foram exibidos/copiedos valores em evidências, cliente ou Git.
- Preview autenticado8a0949d0-a7f2-437d-8ddf-acab6d7fe12f: mesmo SHA e HTML aprovado, HTTP200/seis posts oficiais antes do push de produção.
- Após conferir main e deployment anterior, o root fez avanço fast-forward sem force de b575ed2 para676f1a5. Build remoto Node22.23.4/npm10.9.9, prerender e Worker compilados, publicação bem-sucedida.
- Deployment ativo: **82345fa7-647c-4087-a103-beaa8b98539a**; URL imutável https://82345fa7.zelo-auto.pages.dev; sucesso2026-10-25T11:27:18Z. Domínio canônico confirmado com HTML SHA25661c4fcebb4fd93c65d99c6e83b3cd9266ead2d82915b8045207da7c316dcc17f, igual ao homologado.
- Tag anotada enviada: **ZE-12-release-20261025-676f1a5**, apontando exatamente para o produto publicado, sem reescrever tags.

## Entrega 2 — Homologação real do domínio

QA no domínio canônico: **13/13** grupos principais, **11/11** complementares, **2/2** mídia/reveal e **2/2** recuperação/erros, além de três caminhos privados404 e três scans axe sem violações detectadas. Não é certificação integral WCAG nem teste em aparelho físico.

Foram verificadas onze resoluções, cinco áreas visuais desktop/mobile, intro real em vídeo/frames, sessão/retorno, movimento reduzido, reveal das seções, menu/busca/foco, âncoras, comparadores mouse/teclado/touch e orientação, serviços, mensagens WhatsApp distintas, links das marcas e SKG. A OmnyaTech continua sem link. Pintura usa as fotos reais aprovadas; Bancos/Carpete mantêm a fonte ilustrativa interna, sem legendas rejeitadas.

Instagram: HTTP200, seis posts oficiais, seis imagens HTTPS de CDN efetivamente decodificadas, links correspondentes e grid visível. Google: HTTP503/configuration e UI indisponível honesta, sem nota/quantidade/reviews fictícios. A recuperação limitada poderá apresentar dados reais quando o endpoint autorizado estiver operacional; aprovação administrativa isolada não cria OAuth/IDs/segredos.

Maps: evidência dedicada mostra ruas, marcador, atribuição Google e scroll com um dedo; o iframe respondeu200. Capturas de inventário podem bloquear Maps ou anteceder decode de mídia e não são usadas como essa prova; usar as capturas REAL específicas.

HTTP/SEO: HTTPS/raiz/assets200, URL inexistente404 real, robots/sitemap/canonical/OG/JSON-LD comercial sem aggregateRating fictício; debug e erros noindex. Os caminhos /.env, /.git/config e /.nox/execution-state.json retornam404 sem conteúdo interno. Os templates diretos500/503 retornam200: não interceptam falhas da infraestrutura nem alteram retroativamente status HTTP. Trinta e três estados de erro foram validados em onze resoluções. Uma falha503 de chunk foi simulada somente no navegador, produzindo React500 segura sem promessa não tratada; a interceptação foi removida e o reload restaurou hero, quatro serviços e seis posts. Não foi provocada falha real da infraestrutura.

GA4: uma tag, quatro comandos de eventos tipados sem duplicidade, dois recebimentos HTTP204, consentimento/negação/revogação e ausência de PII verificados. Recepção de rede não comprova ingestão em Realtime/DebugView: painel não verificado sem acesso autorizado. Nenhuma mensagem, avaliação ou e-mail foi enviado nos testes.

## Performance real medida

Quatro perfis planejados, uma amostra cada, domínio HTTPS real/CDN/APIs reais, movimento normal explícito. Cold sem storage pré-semeado; warm com visita natural completa e mesma sessão/cache. Não houve repetição para escolher melhor nota, bloqueio de provedores ou alteração do produto.

| Perfil | Performance | LCP simulado | CLS |
| --- | ---: | ---: | ---: |
| Mobile primeira visita | 95 | **2554ms** | 0 |
| Mobile retorno | 100 | 780ms | 0 |
| Desktop primeira visita | 93 | 1427ms | 0,094321 |
| Desktop retorno | 100 | 213ms | 0,003333 |

Acessibilidade e SEO100 nos quatro perfis; nenhum erro JavaScript observado. **O LCP mobile inicial ficou54ms acima da meta estrita de2500ms; esse alvo não foi marcado PASS.** O GateC pré-publicação tinha passado realmente (candidato limpo98/LCP2363ms). Na produção, TTFB observado155,746ms versus12,199ms local e imagem61,434ms versus27,913ms; atraso de renderização1206,17ms versus1284,476ms local, portanto não aumentou. HTML/carro/geometria aprovados permanecem iguais.

A revisão técnica do root classificou a medição pós-publicação como cumprida e a diferença de rede/servidor como limitação não crítica, sem regressão de código demonstrada, waiver comercial inventado, alteração de fonte ou rollback. CLS desktop0,094321 está abaixo de0,1, e não foi declarado zero. Medidas simuladas/observadas não são dados de campo nem garantia de dispositivo real. Acompanhar métricas de campo quando disponíveis fica como nota PLANNED não impeditiva, sem novo sprint, polling ou ferramenta paga.

## Monitoramento, rollback e segurança

Smoke imediato PASS e nova verificação11:32:48UTC, mais de cinco minutos após o deploy11:27:18UTC, PASS. Observação limitada de runtime45s capturou a chamada Google503 esperada com outcomeok, zero exceções e zero mensagens de console. Nenhum IP, cabeçalho, corpo de provedor, query assinada ou texto bruto de log foi persistido. São amostras, não garantia de ausência de falhas fora da janela.

Rollback preparado para o deployment de produção anterior **0f414771-cd0e-4407-9165-5a4311babff3** (SHA b575ed2), raiz/asset e equivalência com a versão anterior verificados por leitura. Não foi necessário executar rollback nem um exercício destrutivo. Assets não restauram automaticamente segredos; a credencial antiga já rejeitada não foi copiada para backup. Sem DNS, billing, GoogleOAuth, exclusão de releases ou alteração de código durante o release.

As duas alterações preexistentes do proprietário em ZE-09-Google-Handoff.md e ZE-09-Report.md continuam preservadas por SHA256 e fora do commit. new_interface, src/planos, originais de pintura, .env e demais dados locais intactos.

## Aceite final e Nox

| Critério | Resultado |
| --- | --- |
| C01 release preparado e autorizado | PASS |
| C02 deployment controlado | PASS |
| C03 homologação real, incluindo performance medida | PASS; alvo estrito LCPmobile NOT_MET explicitamente separado |
| C04 observação, evidências, rollback e encerramento | PASS |

ZE-12 **COMPLETED**; ZE-11 COMPLETED; ZE-09 **BLOCKED_EXTERNAL** com exceção já aprovada. Sem sprint sucessora iniciada. Limitações não impeditivas: fonte Google autorizada ainda ausente, LCPmobile simulado54ms acima da meta e ingestão GA4 no painel não verificada.

Evidências: production/qa-summary.json e qa-report.md, performance-results.json e performance-decision.json, deployment.json, smoke-initial.json, smoke-observation.json, runtime-observation.json, release-tag.json, rollback/rollback-plan.md e índice evidence-index.json. O commit documental que carrega este relatório registra o fechamento, separado do SHA publicado.
