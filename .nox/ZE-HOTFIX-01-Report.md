# ZE-HOTFIX-01 ? Primeira abertura e WhatsApp

Estado em 2026-10-26: **COMPLETED — publicada e validada em produção**. Autorização explícita do proprietário executada após QA local e preview.

## Corre??o

O handler nativo global de boot confundia o diagn?stico recuper?vel React418 com falha fatal e substitu?a a hero por500 enquanto o React regenerava o DOM. Em produ??o antiga, duas diverg?ncias controladas apenas no navegador (texto e elemento inserido antes da hidrata??o) reproduziram exatamente erro418 +hero ausente+500. Chromium sem modifica??o abriu normalmente; o fator espec?fico que alterou o HTML no Brave do propriet?rio n?o foi identificado e n?o ? atribu?do como fato a extens?es.

React agora assume explicitamente o tratamento de falhas ao iniciar. O callback onRecoverableError registra somente diagn?stico sanitizado, sem ErrorEvent global. A recupera??o nativa continua para falha verdadeira do m?dulo de entrada; a boundary mant?m500 para falha real de render/lazy import. Script opcional externo n?o invalida a landing. N?o h? suppressHydrationWarning, remo??o da hidrata??o, reload autom?tico ou mudan?a na hero/anima??es.

WhatsApp alterado para **+55 64 99616-8694**: links gerais e personalizados dos quatro servi?os, rodap?/contato, recovery React, p?ginas nativas404/503, noscript e telefone no JSON-LD. O500 nativo n?o possui link de contato. Mensagens personalizadas preservadas.

## Valida??o local

- npm run build: PASS, exit0. Warning legado de chunk3D/debug maior que500KB; landing n?o passou a carregar3D.
- npm run lint: PASS, exit0, sete warnings preexistentes (seis componentes/motion e um unused-var no script documental ZE12).
- QA13/13: desktop1366/mobile390/mobile320, primeira visita/retorno, reduced-motion, storage indispon?vel, main atrasado3.8s, mismatch texto/DOM, erro opcional beacon, entry bloqueado, lazychunk503+recupera??o por reload e todos contatos/metadados. Screenshots finais aguardam estado settled real, sem reduzir anima??es.
- O primeiro teste de reload reutilizava os logs da falha intencional e acusou FAIL de harness; reset de coleta e reteste PASS. Matriz final completa limpa em local-final/results.json.
- Preloads desktop/mobile usam os mesmos recursos selecionados pelos picture/srcset; zero warnings nas duas amostras, sem baixar WebP e AVIF simultaneamente.
- Valores exatos de segredos locais conferidos emHTML/JS/CSS emitidos: n?o encontrados; nenhum valor persistido. .env e configura??es Cloudflare intactos.

## Release

Commit produto **9496d688c50750ed9bd73a944b794f1b8d6db221**. Pipeline Git existente; nenhum upload de dist compartilhado ou GLB ignored. Preview77604c60; main s? ser? atualizado ap?s QA do preview. Rollback preparado: produ??o anterior82345fa7, sem execut?-lo.

Google ZE09 permanece **BLOCKED_EXTERNAL**, com503 e estado indispon?vel aceito previamente; o beacon ERR_BLOCKED_BY_CLIENT ? bloqueio do navegador, n?o depend?ncia fatal da landing.

## Fontes t?cnicas

- https://react.dev/errors/418
- https://react.dev/reference/react-dom/client/hydrateRoot
- https://developers.cloudflare.com/pages/configuration/git-integration/

## Evid?ncias

.nox/evidence/ZE-HOTFIX-01/: baseline.json, reproduction.json, build.txt, lint.txt, local-final/results.json e screenshots desktop/mobile, preloads.json, security.json, production-before.json. Sem credenciais ou payloads de clientes/provedores.


## Produção validada

Deploy **6b3b979f-3e81-4c44-9904-94936bed8746** em https://zelo.omnyatech.com.br/, concluído11:30:32UTC de2026-10-26. Mesmo commit9496d68 do preview. Tag anotada **ZE-HOTFIX-01-release-20261026-9496d68** criada e enviada. Não houve upload do dist local compartilhado; build limpo da fonte Git pelo Cloudflare.

QA canônico13/13 PASS; mesmos cenários críticos locais, incluindo dois mismatches recuperados sem500, beacon bloqueado e storage indisponível. Falhas verdadeiras de entry/lazy foram simuladas somente nesses navegadores de teste, sem quebrar recursos públicos. Root inspecionou screenshots settled desktop/mobile e confirmou visual preservado. Todos os links WhatsApp renderizados apontam5564996168694, mensagens diferenciadas e12eventos opt-in/0denied mantidos em regressão3/3. Não foram enviadas mensagens WhatsApp.

Smoke inicial: HTTP200, entrada versionada **/assets/index-dQaBHXj6.js**, callback novo presente, JSON-LD/links novos, Instagram200/seis posts, Google503 esperado, URL desconhecida e/.env404. HTML SHA256 **3c712b09843ecb837d06af2ccdd4a0d76abb6b156522d7304577ae7ac9899a4c**. Rollback anterior82345fa7 preparado e não necessário. Sem alterações em DNS, cobrança, OAuth ou segredos. Os dois documentos ZE09 já modificados pelo proprietário mantêmSHA idêntico ao checkpoint.

Não foi repetida medição Lighthouse nesta correção pequena sem mudanças de layout/assets; não se alega uma nova medição de performance nem resolução da limitação histórica deLCP2554ms. O trigger particular do mismatch no Brave permanece não confirmado; a cascata recoverable→500 foi reproduzida e eliminada nas provas controladas.


Observa??o final **PASS** ?s11:35:47UTC, mais de5min ap?s o deploy11:30:32: mesmoHTML, landing200, WhatsAppnovo, Instagram200/seis, Google503esperado, unknown/.env404. Nenhum incidente; rollback n?o executado. Evid?ncia smoke-observation.json.
