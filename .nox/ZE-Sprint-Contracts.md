# Contratos de sprints — Zelo Autoestética

Visual aprovado: Audi/AURA-MOTION + identidade Zelo (branco, dourado). Avaliações exclusivamente Google. Máximo de **2 entregas** por sprint. Produção não é alterada antes de homologação e aprovação explícita.

## ZE-01 — Segurança e baseline

- **Entregas (2):** 1) Checkpoint recuperável; 2) Baseline funcional, técnico e de produção.
- **Estado atual:** Sem checkpoint formal nem métricas de referência; cinco JPEG não rastreados.
- **Estado esperado:** Checkpoint reversível e baseline técnico/funcional documentado.
- **Critério de aceite:** Tag e dois ZIPs verificáveis; branch isolada; build/lint e navegação documentados.
- **Melhor caminho:** Git tag/archive, cópia de JPEG, QA local e relatório sem segredos.

## ZE-02 — Desacoplamento do 3D

- **Entregas (2):** 1) Remover cena 3D e loading gate; 2) Eliminar pin de 6120 px e acoplamentos.
- **Estado atual:** LandingPage monta CarScene e bloqueia UI aguardando renderer WebGL.
- **Estado esperado:** Navegação e hero independentes de modelo 3D.
- **Critério de aceite:** Nenhum WebGL obrigatório; navegação, serviços e CTA preservados.
- **Melhor caminho:** Extrair UI dos estados 3D, retirar Canvas e reduzir dependências do bundle.

## ZE-03 — Hero cinematográfico final Audi/Zelo

- Entregas: hero fiel à referência em camadas independentes; animações de primeira abertura com persistência/reduced-motion.
- Estado final: COMPLETED, QA 166/166, build/lint PASS, review técnico PASS. A execução anterior ZE-03-REWORK está incorporada e substituída pelo resultado final desta ZE-03.
- Aceite: carro frontal sem fabricante, escala/posição da referência, showroom quente, ZELO SVG, slogans legíveis, fades e header sem divisor horizontal; desktop/ultrawide/tablet/mobile; navegação preservada e zero WebGL na landing.
- Implementação: edição da referência via image_gen; WebP sem upscale, SVG/texto/DOM, CSS e sessionStorage zelo:hero-intro:v3. Evidências e limites reais em ZE-03-Report.md.
- Limite do objetivo: ZE-04 não autorizada; sem deploy/push.

## ZE-04 — Reestruturação visual

- **Entregas (2):** 1) Redesenhar serviços e seções; 2) Modernizar cabeçalho, parceiros, contato e rodapé.
- **Estado atual:** Seções escuras acopladas à história 3D.
- **Estado esperado:** Landing coesa Audi+Zelo e comercialmente objetiva.
- **Critério de aceite:** Cards, menu, seções e rodapé aprovados visualmente em mobile/desktop.
- **Melhor caminho:** Tokens de design, componentes reutilizáveis e regressão de links.

## ZE-05 — Performance e acessibilidade

- **Entregas (2):** 1) Reduzir JS/assets iniciais; 2) Validar performance mobile e acessibilidade.
- **Estado atual:** Bundle three ~1MB e fontes pesadas; rolagem longa.
- **Estado esperado:** Carga leve e acessível com diferença mensurável para baseline.
- **Critério de aceite:** Lighthouse e E2E sem regressão; bundle 3D ausente na rota inicial.
- **Melhor caminho:** Code splitting/remoção código 3D, imagens responsivas, fontes otimizadas e reduced-motion.

## ZE-06 — Instagram funcional

- **Entregas (2):** 1) Corrigir backend e credenciais de integração; 2) Exibir feed autêntico e fallback confiável.
- **Estado atual:** Pages Function /api/instagram-feed retorna HTTP 400; fallback usa imagens estáticas.
- **Estado após ZE-06 local:** End-to-end handler/UI and mock QA PASS. After owner refreshed the ignored local `.env`, fresh Vite endpoint returned HTTP 200 with six official posts; browser verified six images and six valid Instagram permalinks without recording post data. C01 PASS locally. The public endpoint retains the previously observed HTTP 400 with old Cloudflare credentials; production runtime verification remains pending.
- **Critério de aceite:** Local real-feed behavior, normalization, cache/error security, exact post permalinks, honest fallback and responsive/accessibility QA PASS. Public runtime remains pending owner-only update of Cloudflare Pages server variables and endpoint verification; no deploy performed by Nox.
- **Owner action:** Copy the already locally validated Instagram Login values via the approved secret-management path into Pages server variables `INSTAGRAM_API_MODE=instagram-login`, `INSTAGRAM_GRAPH_USER_ID`, and `INSTAGRAM_ACCESS_TOKEN`; then verify the public endpoint. Do not send token through chat. Owner screenshot confirms the intended account is an Instagram Tester; Facebook Test Users is separate and unnecessary for Instagram Login, although app-role access is relevant in Development Mode.
- **Boundaries:** Production unchanged, no deploy/push, no Google Reviews changes, ZE-07+ remain queued.

## ZE-07 — SEO técnico local

- **Entregas (2):** 1) Corrigir URLs e dados estruturados; 2) Reforçar conteúdo local e metadados.
- **Estado atual:** Canonical/robots/sitemap/schema apontam para pages.dev.
- **Estado esperado:** Domínio zelo.omnyatech.com.br único canônico e texto para Catalão.
- **Critério de aceite:** Sitemap/schema/og/canonical coerentes, verificação indexável.
- **Melhor caminho:** Revisar head, JSON-LD e Search Console; evitar duplicidade pages.dev.

## ZE-08 — Google e mensuração

- **Entregas (2):** 1) Instalar GA4 e eventos de conversão; 2) Preparar/Search Console e checklist local.
- **Estado atual:** GA4 G-E9SKGKCQXX ainda ausente em produção.
- **Estado esperado:** Mensuração de visitantes, orçamento e contatos; SEO acompanhado.
- **Critério de aceite:** GA4 e eventos confirmados, sitemap encaminhado a Search Console.
- **Melhor caminho:** Tag e eventos de conversão, validação de privacidade e Perfil da Empresa.

## ZE-09 — Reputação Google

- **Entregas (2):** 1) Exibir avaliações Google autorizadas; 2) Oferecer botão de avaliação oficial.
- **Estado atual:** Sem seção Google Reviews.
- **Estado esperado:** Avaliações reais com fonte atribuída e CTA para avaliar no Google.
- **Critério de aceite:** Dados autênticos quando API permite; link oficial abre fluxo correto.
- **Melhor caminho:** Consultar APIs Google compatíveis e configuração Perfil da Empresa.

## ZE-10 — Confiabilidade da reputação Google

- **Entregas (2):** 1) Tratar falhas/indisponibilidade Google; 2) Validar mobile, teclado e links Google.
- **Estado atual:** Sem componente de reputação ou estados de erro.
- **Estado esperado:** Reviews Google com estados vazios e UX acessível.
- **Critério de aceite:** Nenhum review fabricado; acessibilidade e links validados.
- **Melhor caminho:** Fallback sem dados próprios, sem KV/SQL/GitHub, testes de error states.

## ZE-11 — Homologação local

- **Entregas (2):** 1) QA regressivo desktop/mobile; 2) Homologação visual e funcional.
- **Estado atual:** Rework ainda não implementado.
- **Estado esperado:** Candidato pronto para aprovação explícita.
- **Critério de aceite:** Build, lint, E2E e Lighthouse aprovados; revisão visual humana realizada.
- **Melhor caminho:** Preview e testes Playwright, correção e repetição até aceite.

## ZE-12 — Publicação controlada

- **Entregas (2):** 1) Deploy aprovado e rastreável; 2) Validação pós-publicação e rollback documentado.
- **Estado atual:** Produção permanece antiga.
- **Estado esperado:** Cloudflare Pages atualizado após autorização.
- **Critério de aceite:** Site real, API, GA4, sitemap, links e rollback verificados.
- **Melhor caminho:** Deploy rastreável somente com aprovação, smoke test e reversão preparada.

## Retificação ZE-03 — correção visual final
Aceite anterior240d4c2 rejeitado. Resultado atual exige pneus/chassi apoiados, reflexo/sombra conectados, piso integrado, textos mobile separados acima/abaixo ZELO e imagem oficial da marca com cores originais. Evidências atuais ZE-03-CORRECTION-*. ZE-04 não iniciada.

## Retificação vigente ZE-03 — logo e entrada
Marca oficial deve ser transparente sem suporte/placa. Intro v4 estável exibida uma vez por sessão após assets/fontes/paint visível, comprovada por frames reais/vídeo; entrada de cenário, lettering, carro, frases, header e hint. Critério mobile/piso anterior permanece. Evidências vigentes ZE-03-INTRO-*.

## ZE-04 ? Executed contract, 2026-10-22
Two deliveries completed technically: commercial sections (PNG2/3/4) and navigation/contact/identity (PNG5, hero integration). Before/after uses labeled interactive demonstrations; Google/Instagram unknown data unavailable honestly. Cadastro site.ts prevails. QA332/0 open, build/lint/review/visual technical PASS. Human owner review separate. ZE-05+ not authorized; no production actions.

## ZE-05 — Executed contract, 2026-10-23
Exactly two deliveries completed: (1) reduce initial JS/assets; (2) validate mobile performance, accessibility and regression. Build/lint, requests, responsive assets/fonts, six viewports, interactions, reduced motion, map, reference screenshots, Lighthouse and CDP were measured. Four acceptance criteria pass with documented limitations. Lighthouse mobile 89 (target ≥90) and LCP 3531 ms (target ≤2500 ms) remain misses; first-visit LCP is the car image and is delayed by the approved one-time cinematic intro after asset/font readiness. Desktop 99; accessibility 100; CLS0; TBT32 ms; zero landing Three/GLB requests. No change to hero, visual references, animation or `zelo:hero-intro:v4`. Root/Nox technical visual review PASS; no owner approval claimed. Branch `work/ze-audi-redesign`, commit pending at report preparation; production unchanged; no push/deploy/ZE-06.

## ZE-08 ? contrato vigente 2026-10-23
Exatamente duas entregas: (1) GA4 G-E9SKGKCQXX, consentimento b?sico e eventos comerciais; (2) Search Console, privacidade e QA. Crit?rios C01?C04: integra??o ?nica/tipada, bloqueio pr?-consentimento, deduplica??o, eventos sem PII/vendas fict?cias, controles revog?veis, SEO preservado, seis viewports, build/lint/tests/performance/documenta??o/commit. Pain?is e recebimento Google somente PASS com prova externa; pend?ncias permitidas explicitamente registradas no relat?rio/handoff. Sem deploy/push/ZE-09. ZE-03-REWORK somente ap?s ZE-09, preservada na fila.


## ZE-09 — Contrato vigente 2026-10-23
Duas entregas: fonte oficial GBP e fluxo oficial de avaliação. Implementação local não fecha sprint: exige reviews/nota/total autênticos, perfil autorizado e dois destinos homologados. Estado WAITING_USER_ACTION; mocks só lógica/layout, nunca aceite real. Sem Places/custos/deploy/ZE10/hero rework. Próxima ZE-03-REWORK pósZE09 distinta do histórico concluído. Ver ZE-09-Report.md e ZE-09-Google-Handoff.md.


## Retomada com links do proprietário
2026-10-23 — ZE-09 retomada com links públicos fornecidos pelo proprietário: search lrd CID0x14e35d89087019ae ação3 e share.google/3PlTHI5FF8L4JCmS0 cujo redirecionamento kgmid/g/11zxzxp9sv corresponde à ficha encontrada. CTAs públicos independentes de OAuth implementados; fragmento de escrita preservado. Browser Google retornou desafio anti-bot, sem contorno; fluxo final manual continua PENDING. Fonte/nota/total/reviews reais ainda dependem OAuth/projeto aprovado. WAITING_USER_ACTION mantido; sem produção/custos/ZE10/rework.
