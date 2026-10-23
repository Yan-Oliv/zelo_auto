# ZE-09 — Reputação Google

Estado: WAITING_USER_ACTION, implementação interna e QA concluídos; conexão real pendente. Branch `work/ze-audi-redesign`; baseline `fc2a62e`; checkpoint `ZE-09-start-20261023`. Exatamente duas entregas, sem produção/push/deploy nem ZE-10/hero rework.

## Entrega 1 — Fonte oficial

Escolhida Business Profile API com OAuth server-side e projeto próprio autorizado. Places analisada e descartada nesta execução: campos reviews podem gerar custo, sem autorização de faturamento ou chamadas. Nenhuma cobrança/API Places acionada.

Ficha pública localizada: Zelo Estética Automotiva, Catalão–GO; nome, telefone (64)99616-1968 e site oficial coincidem. Categoria observada: serviço de limpeza completa de automóveis. Rua Antônio Horácio Pereira coincide, número1485 não aparece no texto público. Link antigo maps.app.goo.gl/9twSEgWic6k4YYyf7 é ponto de endereço, não comprova empresa. Evidência sanitizada em `profile-discovery.json` e screenshot oficial; sem rating/reviews observáveis nessa visualização limitada. Propriedade, verificação, AccountID/LocationID/API/OAuth permanecem PENDING. PlaceID não inventado.

Adaptador `/api/google-reviews` implementado em Pages e mesmo handler Vite. Configuração ausente retorna503 sanitizado sem consultar Google. Com autorização: refresh OAuth, ficha via Business Information, validação nome/cidade/UF/telefone/localização e Voice of Merchant; reviews oficiais v4 em ordem updateTime desc até3. Nota média/total provêm da API; nenhum filtro positivo. JSON validado, limite256KiB, deadline8s, URLs Google allowlisted, origem mesma, erros sem payload/token. Nenhum log de segredos, no-store em resposta e CDN, sem persistência de dados. Uso de refresh restrito servidor.

Hook lazy próximo da viewport (400px), deduplicação por aba e timeout10s; loading/empty/unavailable honestos, sem depoimentos demonstrativos em runtime. Fonte Google, nota acessível e estrelas fracionárias, até3 cards texto puro. Screenshots MOCK só demonstram layout/lógica, nunca prova de API real.

## Entrega 2 — Fluxo oficial

Dois CTAs implementados a partir de URLs autenticadas metadata.mapsUri/newReviewUri: AVALIAR NO GOOGLE e VER TODAS AS AVALIAÇÕES. Sem credenciais/link validado não se habilita fluxo inventado; somente Maps localização existente honestamente nomeado. Ficha pública botão Avaliar abriu login Google no teste read-only; nenhum login ou publicação realizado. Link compartilhável e teste real integrado desktop/mobile PENDING.

Analytics preserva consentimento ZE08, evento `google_reviews_click` com ação view/write; nenhum nome/texto/estrela pessoal enviado e clique não equivale a avaliação publicada. Animações/reduced motion, foco/links externos e estrutura duas colunas preservados. Hero/Instagram/localização fora da alteração de produto.

## QA

Build PASS e lint exit0 com seis warnings legados nos contextos cinematic/motion/CarScene; chunk Three grande permanece apenas debug. Testes API determinísticos:10 gruposPASS cobrindo configurações, identidade, verificação, erros400/401/403/404/429/500, JSON malformado/grande, timeout real, secrets/origem/no-store. Resultado não comprova OAuth real.

QA browser:18 grupos PASS no build atual com casos de loading, dados válidos, empty, malformed, URLs perigosas, ausência de escrita, consentimento off/on e seis viewports sem overflow/erros. Capturas MOCK identificadas explicitamente; indisponível real local503 capturado. Root/Nox comparou referência4 e capturas: estrutura coerente, preservadas diferenças prévias; não equivale a aceite visual humano ou autenticação real. Lighthouse mobile consent denied baseline91/LCP3454ms/CLS0; final primeira89/LCP3754, repetição91/LCP3453/CLS0. Consent granted baseline91/LCP3453 e final91/LCP3454. Accessibility97 baseline/final: contraste legado, sem nova regressão detectada. Aviso Lantern NO_LCP surgiu em processamento auxiliar, mas relatórios completos têm LCP/scores e nenhum runtimeError; não foi omitido. Evidências em `.nox/evidence/ZE-09/`. Critérios C01 fonte real, C02 dados reais, C03 link real e partes C04 dependentes deles permanecem PENDING. Não declarar ZE09 COMPLETED.

## Desbloqueio e rollback

Seguir `.nox/ZE-09-Google-Handoff.md`: proprietário confirma ficha verificada, projeto aprovado, OAuth e configura cinco variáveis server-only no `.env` ignorado; fornece link público Receba mais avaliações, sem tokens no chat. Retomar testes reais da API e ambos CTAs. Sem publicação autorizada.

Rollback local: checkpoint `ZE-09-start-20261023` recupera fontes anteriores; aplicar reversão do commit ZE09 quando criado em trabalho limpo, preservando `.env`, `new_interface/` e `src/planos/`. Não executar reset/clean destrutivo. A atividade futura ZE-03-REWORK pósZE09 está distinta do histórico já concluído e precede ZE10 na fila; nenhuma iniciada.


## Retomada com links do proprietário
2026-10-23 — ZE-09 retomada com links públicos fornecidos pelo proprietário: search lrd CID0x14e35d89087019ae ação3 e share.google/3PlTHI5FF8L4JCmS0 cujo redirecionamento kgmid/g/11zxzxp9sv corresponde à ficha encontrada. CTAs públicos independentes de OAuth implementados; fragmento de escrita preservado. Browser Google retornou desafio anti-bot, sem contorno; fluxo final manual continua PENDING. Fonte/nota/total/reviews reais ainda dependem OAuth/projeto aprovado. WAITING_USER_ACTION mantido; sem produção/custos/ZE10/rework.
