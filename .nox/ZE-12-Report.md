# ZE-12 — Release controlado e homologação em produção

Estado em 2026-10-25: **WAITING_USER_ACTION — preparação independente concluída; produção NÃO PUBLICADA**. Exatamente duas entregas formais. O contrato anexado `47c49978-38a4-4211-802d-7ad15f7136a0/Pasted text.txt` exige autorização final do candidato/ambiente antes do go-live; o pedido para executar a sprint não substitui esse gate.

## Estado inicial e candidato

- Branch local: `work/ze-audi-redesign`.
- Produto candidato: `676f1a5a7e51e9c79c5f3fbe03c56edc35beedd8`, posterior ao aceite visual original `85e8073`.
- Checkpoint: `ZE-12-start-20261024`, sem reescrever tags existentes.
- ZE-11: **COMPLETED**, critérios aplicáveis PASS, após rework; mobile primeira visita98/LCP2356–2363ms, desktop97/LCP1265ms, movimento normal ativo. Medidas locais de laboratório, não dados de campo. Não é necessária exceção de performance.
- Campos redundantes antigos de desempenho no JSON foram reconciliados com o rework; medições anteriores preservadas como histórico.
- ZE-09: **BLOCKED_EXTERNAL**. A decisão comercial expressa do proprietário permite futura publicação com estado Google indisponível honesto. Isso não homologa fonte, nota ou comentários reais nem cria credenciais OAuth.
- Duas alterações preexistentes do proprietário em `ZE-09-Google-Handoff.md` e `ZE-09-Report.md` permanecem preservadas por SHA256 e fora do commit. Referências, planos, fotografias originais, credenciais e configuração local intactos.

## Entrega 1 — Engenharia de release

### Git e pipeline

Repositório confirmado: `Yan-Oliv/zelo_auto`. Projeto Pages confirmado por API de leitura: `zelo-auto`, conta `663888827c96aad8d97cea728e78fb0a`, domínio `https://zelo.omnyatech.com.br/`.

Integração GitHub existente, produção a partir de `main`, deploy automático habilitado. Todas as branches não principais geram preview; não há workflow GitHub Actions separado. `main` remoto está em `b575ed2f42c0fa1a65c314a67d75644cf4ab640d`, ancestral do candidato; não se deve executar push de produção antes do gate final. Uma branch de preview isolada só conterá o candidato explícito, sem owner dirt.

Configuração remota observada: build `npm run build`, saída `dist`, root vazio, build imagev3, Functions compatibility date`2026-07-06`, sem bindings KV/D1/R2. Node local24.13.1/npm11.8.0; lock Vite8.1.3 exige Node20.19+ ou22.12+. O preview remoto confirmou **Node22.23.4/npm10.9.9**, build e compilação de Worker bem-sucedidos, sem mudança da configuração do projeto.

### Build imutável e segurança

Source extraído do Git candidato, sem `.nox`, `.env` ou arquivos locais não rastreados. Instalação `npm ci --no-fund`, lint e build **PASS** no diretório isolado `evidence/ZE-12/work/source`; não houve alteração do `node_modules` compartilhado. Lint tem seis warnings legados. Build mantém aviso de chunk3D grande em debug, sem Three/GLB no caminho da landing.

Artefatos:134 arquivos, 28.313.127bytes, maior asset3,43MB, abaixo do limite Pages25MiB por arquivo. HTML prerender, CSS crítico, fontes, imagens, erros404/500/503, `_headers`, `_redirects`, sitemap, robots e favicons presentes. Build local limpo HTMLSHA256`1a189ffd435fba1d74ba724fb0f0fc6aca83e8d7824afbc412a23d12b4938b56`; manifesto completo em `prerelease/release-manifest.json`. O build Linux remoto gerou HTMLSHA256`61c4fcebb4fd93c65d99c6e83b3cd9266ead2d82915b8045207da7c316dcc17f`, exatamente o artefato final homologado da ZE-11. A diferença local envolve literais CRLF e o hash do entry gerado; fontes, CSS, vendor e AVIF críticos foram conferidos, sem alteração do produto.

Não publicar o `dist` compartilhado: ele contém GLB local ignorado66,6MB. O build isolado exclui esse arquivo e outros dados locais. Functions são compiladas pelo pipeline Git a partir de `functions/`; upload estático apenas do `dist` pelo dashboard não é método equivalente.

Revisão independente e scan de assinatura não encontraram segredos ou fontes privadas no output. Um resultado inicial dentro de base64 de decoderWASM foi falso positivo do scanner e foi corrigido com delimitadores; nenhum valor de token foi lido/exibido. `npm audit` registra14 findings (9high/5moderate), **não audit limpo**: cadeias offline de ferramentas GLTF/sharp, CSS build, devserverVite e loaders debug com URLs fixas. Não foi demonstrado caminho remoto explorável na landing/Functions; risco residual e manutenção documentados em `security-summary.json`. Nenhum `audit fix --force`/upgrade de framework foi executado.

### Ambientes e integrações

Produção contém quatro variáveis Instagram do tipo secreto, existência/nome/tipo apenas. Preview não tem variáveis. As cinco variáveis Google não estão configuradas, conforme exceção de publicação aprovada. Não copiar valores para relatório, cliente ou arquivos públicos.

**Pendência impeditiva Instagram:** o endpoint público atual responde HTTP400/OAuthException190. Presença de bindings não prova credencial válida. O servidor local validado responde200/seis posts, inclusive o **build isolado compilado** com variáveis server-side fornecidas apenas em memória do processo (`baseline/compiled-local-integrations.json`). Será necessária atualização autorizada de `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_API_MODE` e `INSTAGRAM_GRAPH_USER_ID` no ambiente de destino ou ação manual equivalente, seguida de validação real. Preservar a variável legada de feed e demais segredos. A configuração de preview vazia produz503 honesto e não comprova integração oficial. Nenhum segredo foi alterado na Cloudflare nesta preparação.

### Preview, autorização e rollback

Preview compilado local em `http://127.0.0.1:8890/`, runtime Pages com compatibilidade igual à produção e APIs deliberadamente sem configuração. QA local **PASS**: SSR14, matriz22 em onze resoluções, consentimento/SEO/teclado/axe8, estados reais indisponíveis/links2, HTTP8; três scans axe sem violações detectadas. Revalidação única de primeira visita mobile do artefato limpo: **98/LCP2363ms**, FCP1388ms/TBT0/CLS0, acessibilidade/SEO100, intro normal ativa e nenhum erro JavaScript. Não é dado de campo. O build remoto retorna o hash HTML aprovado na ZE-11 (`61c4fcebb4fd93c65d99c6e83b3cd9266ead2d82915b8045207da7c316dcc17f`); o build local do arquivo Git tem diferenças de fim de linha/identidade do entrypoint, com equivalência funcional e visual verificada separadamente.

Preview Git isolado na branch `release/ze12-preview-676f1a5`, exatamente o candidato e sem push de `main`: **https://1d123d20.zelo-auto.pages.dev**, deployment`1d123d20-2d18-4619-baa9-4b411976046f`, ambiente **preview**, build/Worker/deploy bem-sucedidos. O domínio de produção e o deployment canônico anterior permaneceram inalterados. HTTP do preview confirmou raiz200, paths inexistentes404, APIs503 sem configuração, cache e assets críticos. Templates diretos500/503 continuamHTTP200 e não interceptam falhas de infraestrutura. Header de robots do preview é `noindex`. QA remoto **13/13 PASS**: onze resoluções, intro real em vídeo/frames, persistência da sessão, movimento reduzido, menu/busca/foco, comparadores e links comerciais. Capturas das cinco áreas em desktop/mobile e páginas completas preservadas. Root revisou hero mobile, serviços/resultados desktop e localização/rodapé mobile: composição, tipografia e imagens preservadas. Mapas foram bloqueados deliberadamente nas capturas de inventário; essas imagens não comprovam mapa renderizado. As APIs remotas não usam fixtures e continuam indisponíveis por falta de bindings no preview. O primeiro teste de geometria mobile tinha serialização incorreta da classe SVG; o harness foi corrigido e os quatro tamanhos afetados passaram sem mudança no produto. Analytics restringe envio ao hostname canônico, sem conversões no preview.

Deployment de produção anterior identificado: `0f414771-cd0e-4407-9165-5a4311babff3`, commit`b575ed2f42c0fa1a65c314a67d75644cf4ab640d`, sucesso2026-07-23, URL`https://0f414771.zelo-auto.pages.dev`. Raiz e asset principal foram verificados por leitura. Plano oficial de rollback em `rollback/rollback-plan.md`; alvo preparado, exercício destrutivo NOT_RUN. Rollback de assets não restaura segredos/configuração externa automaticamente.

**GO-LIVE PENDENTE:** autorização deve identificar candidato, `zelo-auto`/domínio de produção, exceção Google já aceita e a atualização necessária do Instagram. Nenhum push de produção, merge, deploy, DNS, billing ou alteração de segredo foi executado nesta preparação.

## Entrega 2 — Homologação real pós-publicação

**NOT_RUN**. Após go-live autorizado: domínio/HTTPS/HTTP404/assets, comparação visual dos cinco modelos e candidato aprovado, intro em vídeo/sessão/reduced motion, onze resoluções, serviços/comparadores, WhatsApp individual, Instagram oficial, Google indisponível conforme exceção, Maps real, SEO/noindexdebug, consentimento/analytics, segurança, cold/warm performance e observação operacional. Não substituir esses checks por evidência local ou apenas `pages.dev`.

GA4: tag/eventos/consentimento podem ser verificados no navegador; recebimento em Realtime/DebugView depende de acesso autorizado ao painel. Não enviar mensagens WhatsApp nem registrar avaliações durante testes.

## Estado e retomada

ZE-12 está **WAITING_USER_ACTION** para o GO-LIVE específico e a liberação da configuração Instagram; C01 permanece PENDING nesses dois subgates, embora a preparação independente tenha passado. C02–C04 permanecem PENDING/NOT_RUN. ZE-09 continua BLOCKED_EXTERNAL; ZE-11 COMPLETED. O commit documental de preparação não substitui o produto candidato `676f1a5`.

### Autorização concreta solicitada

1. Autorizar a sincronização, a partir dos valores locais já validados, de `INSTAGRAM_API_MODE`, `INSTAGRAM_GRAPH_USER_ID` e `INSTAGRAM_ACCESS_TOKEN` nos ambientes preview/production de `zelo-auto`, preservando a variável legada de feed e demais configurações. Nenhum valor será enviado ao cliente, ao chat ou ao Git.
2. Gerar novamente o preview do mesmo SHA com os bindings e exigir resposta oficial HTTP200/seis posts antes de liberar a publicação. Se a integração falhar, não publicar.
3. Confirmar que `main` e o deployment anterior não mudaram; realizar somente avanço fast-forward de `main` para `676f1a5a7e51e9c79c5f3fbe03c56edc35beedd8`, pelo pipeline GitHub existente, e publicar em `https://zelo.omnyatech.com.br/`.
4. Executar a Entrega2, smoke imediato e nova verificação operacional após cinco minutos. Em incidente crítico de release, executar rollback para `0f414771-cd0e-4407-9165-5a4311babff3` e verificar novamente o domínio. Sem DNS, billing, OAuth Google ou alterações fora desse plano.

A exceção Google já foi autorizada e não precisa de novo aceite. Todas as operações acima continuam **NOT_RUN**, aguardando a autorização final exigida pelo GateD do contrato. Plano estruturado em `prerelease/go-live-plan.json`.

Produção: **NÃO PUBLICADA**. Não declarar sucesso de release antes de deploy correto, domínio homologado, evidência real e aceite final.
