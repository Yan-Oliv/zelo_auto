# ZE-12 — QA real em produção

**PASS no escopo verificado.** Domínio: `https://zelo.omnyatech.com.br/`; candidato `676f1a5a7e51e9c79c5f3fbe03c56edc35beedd8`, deployment `82345fa7-647c-4087-a103-beaa8b98539a`, 2026-10-25. Nenhuma mudança de código, Cloudflare, Git ou configuração foi feita por este QA.

| Suíte | Resultado |
| --- | --- |
| Matriz/hero/navegação no domínio canônico | 13/13 PASS, onze resoluções |
| HTTP/SEO/axe/Maps/motion/analytics | 11/11 PASS |
| Mídia real decodificada/reveal mobile | 2/2 PASS |
| URLs privadas públicas | 3/3 retornam404, sem marcadores internos |
| Axe WCAG2.2AA | Três scans, zero violações detectadas |

## Comprovações reais

- Raiz e assets servidos por HTTPS, ausência de overflow horizontal na matriz e funcionamento de serviços, comparadores, menu, busca, foco e links. Quatro mensagens WhatsApp distintas e destinos oficiais de marcas/SKG; OmnyaTech sem link. Nenhuma mensagem WhatsApp, avaliação ou e-mail enviado.
- Hero com movimento normal em contexto novo, frames inicial/intermediário/final e vídeo `qa-production/intro-production.webm`; retorno/recarga sem replay e movimento reduzido validados. `qa-extra/production-scroll-motion.webm` mostra stagger real em serviços/processo/Instagram e transição da localização; `qa-media/results.json` comprova reveal de alvos mobile ao entrarem efetivamente na viewport.
- Instagram: API oficial atualHTTP200/seis posts, seis links de publicações oficiais e seis imagens HTTPS do CDN realmente decodificadas, dimensões entre834 e941px de largura. `qa-media/REAL-instagram-six-decoded.png` foi inspecionada: seis posts reais visíveis, sem placeholders. URLs assinadas completas, query strings e respostas do provedor não foram persistidas.
- Google: endpoint real503/configuration, UI indisponível honesta, sem nota/contagem/comentários inventados. A exceção comercial aprovada permanece separada da fonte oficial externamente bloqueada.
- Maps: iframe realHTTP200, screenshot `qa-extra/REAL-map-mobile-scroll.png` inspecionada com ruas, marcador, atribuição Google e instrução de dois dedos. Um gesto vertical de um dedo sobre o mapa moveu a página de8680 para8805px; CTA oficial de rota permanece disponível.
- SEO: canonical, title/description, robots, sitemap, OG, favicon e JSON-LD comercial verificados; sem aggregateRating falso; debug recebe noindex. URL inexistente retorna404 real, com tela segura/noindex. `/.env`, `/.git/config` e `/.nox/execution-state.json` retornam404 sem conteúdo privado.
- Analytics: sem tag/requisições antes do aceite ou após recusa; uma tag ao aceitar, page_view/select_service/quote_click/whatsapp_click uma vez cada em interação controlada. Apenas parâmetros tipados permitidos; nenhuma mensagem, telefone, e-mail, termo de busca ou token nos parâmetros comerciais. Dois recebimentos de redeHTTP204 do endpoint Google observados. Revogação interrompe novos comandos e remove cookies analíticos acessíveis. **HTTP204 não comprova ingestão no Realtime/DebugView**; acesso ao painel não foi usado.

## Evidências e reprodução

Resultados completos em `qa-summary.json`, `qa-production/results.json`, `qa-extra/results.json`, `qa-media/results.json` e `public-private-paths.json`. Scripts reproduzíveis `qa-production.mjs`, `qa-extra.mjs` e `qa-media.mjs`. Executar somente quando Nox liberar a janela de navegador; não sobrepor com performance.

Capturas das cinco áreas em desktop/mobile e páginas completas estão em `qa-production/PRODUCTION-*.png`. Capturas de inventário bloqueiam o iframe Maps deliberadamente; não são prova de mapa carregado. Algumas capturas iniciais da comunidade podem preceder decode do CDN; a evidência específica de seis mídias decodificadas corrige esse limite sem mudar produto ou substituir fontes.

## Correções de harness, preservadas

O primeiro teste de motion exigia opacidade1 de todos os filhos de um grid mobile alto, embora primeiro/último cards estivessem fora da viewport. A medição foi corrigida para stagger desktop visível e reveal mobile de cada alvo alcançado; o estado fora da viewport era correto. `qa-extra/results-first-motion-harness.json` preserva o FAIL inicial.

Um segundo teste aguardava opacidade>0,99 e logo exigia igualdade exata1, capturando0,990955 ainda em animação. A condição passou a aguardar o frame final1; o reteste mobile passou. `qa-media/results-first-threshold-harness.json` preserva o diagnóstico. Nenhuma falha de produto foi encontrada nesses casos.

## Limites

Templates diretos500/503 respondemHTTP200 e não interceptam automaticamente erros de infraestrutura. Foram verificados visual/lettering/fade e movimento reduzido dessas telas; não foi repetida nesta suíte a injeção de falha React no browser pós-deploy. Boundary4/SSR14 do mesmo candidato compilado aprovados no pré-release são evidência separada, não um teste novo de erro da infraestrutura pública.

Axe e árvore Chromium/teclado complementam inspeção visual; não representam certificação WCAG integral, leitor físico ou aparelho físico. Performance pertence à janela separada do agente responsável; não é medida por este QA. Todos os Chromium deste QA foram encerrados antes dessa janela.
