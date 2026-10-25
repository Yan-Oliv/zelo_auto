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


## 2026-10-23 - Explicit exception: ZE-03-REWORK-POST-ZE09 CURRENT
Owner contract explicitly authorizes only this hero correction while ZE-09 stays WAITING_USER_ACTION. Nominal dependency retained; exception limited to this activity. ZE-09 criteria and pending client/Profile/API/OAuth gates unchanged. Google Cloud zelo-integracoes / 878742106609 exists; API approval not established. ZE-10/11/12 stay QUEUED. Historical ZE-03-REWORK stays COMPLETED; the ambiguous future short label is reconciled to its existing POST-ZE09 ID, without a third sprint.
Exactly two deliveries: (1) visual fidelity/assets/layers/AppBar; (2) animations/responsiveness/validation. Binding reference new_interface/1.png; other sections and integrations preserved. Human visual approval requires explicit owner acceptance.
Checkpoint tag ZE-03-REWORK-POST-ZE09-start-20261023 at 49e44926bac6f2b30d76e17ce309653633a0f16d; branch work/ze-audi-redesign. Four pre-existing dirty ZE-09 documents backed up in ignored .nox/checkpoints/ZE-03-REWORK-POST-ZE09-start-20261023/. new_interface/ and src/planos/ preserved. No push/deploy/cost. QA pending; no advance PASS.


## 2026-10-23 - ZE-03-REWORK-POST-ZE09 WAITING_USER_ACTION
Exactly two deliveries implemented and reviewed. Technical visual review PASS; no owner visual approval claimed. Reference car pixels recovered outside two badge masks, original scene sides retained with central inpaint; see dedicated report for honest reconstruction limits. Responsive65/12viewports, animation13, smoke33 and reviews18MOCK groups PASS; build/lint exit0 with six legacy warnings. MAE20.81->8.76 diagnostic;9landmarks<0.29%. Lighthouse observed mobile81->80/LCP4808->5034 and desktop67->66/LCP4957->5333, CLS0; image transfer increased, no improvement/full performance PASS claimed. Sole remaining hero acceptance action is owner visual review. ZE-09 criteria and WAITING_USER_ACTION preserved; resume after client/Profile/API/OAuth approval. ZE10+QUEUED, historical rework preserved. No push/deploy/cost. Evidence/report: .nox/evidence/ZE-03-REWORK-POST-ZE09/ and .nox/ZE-03-REWORK-POST-ZE09-Report.md. Scoped commit pending parent Git operation; checkpoint ZE-03-REWORK-POST-ZE09-start-20261023 retained.

## 2026-10-23 - ZE-10 CURRENT: authorized independent execution
Owner request and contract attachment ed20ef22-84e5-4df4-8343-0403f3612f4a/Pasted text.txt explicitly authorize ZE-10 independently while ZE-09 remains WAITING_USER_ACTION for client/Profile/API/OAuth and ZE-03-REWORK-POST-ZE09 remains WAITING_USER_ACTION for human visual acceptance. Historical ZE-03-REWORK remains COMPLETED. The nominal ZE-09 dependency is preserved; exception applies only to independent reliability, recovery, UX and accessibility work in ZE-10.
Exactly two deliveries: (1) state/request reliability and controlled recovery; (2) UX, accessibility and official Google links, including QA/performance/documentation. Binding visual reference: new_interface/4.png; all other sections preserved. Real Google source, average/count/reviews and actual Google submission/consultation flows remain PENDING under ZE-09 and are not proven by fixtures. No API/Cloud credentials, billing, production, push or deploy changes. ZE-11 and ZE-12 remain QUEUED and unauthorized.
Checkpoint ZE-10-start-20261023 at cbd4b26; branch work/ze-audi-redesign. Existing dirty ZE-09 docs preserved and backed up as .nox/evidence/ZE-10/preexisting-docs.patch; owner new_interface/ and src/planos/ preserved. No advance QA PASS: implementation and verification underway. This dated entry supersedes earlier current-state summaries without changing historical acceptance.

## 2026-10-23 - ZE-10 COMPLETED: independent technical acceptance
Exactly two deliveries completed and reconciled by Nox: (1) request/state reliability, bounded payloads, deduplication, abort/timeout, manual retry/backoff and deterministic recovery; (2) reference4 UX, safe official links, accessible status/ratings/focus/keyboard, responsive/motion tests and evidence. Build/lint PASS (six legacy warnings); backend18, UI18, lifecycle5, recovery matrix52 PASS. Fixture screenshots explicitly MOCK, never evidence of real Google data. Root technical visual/security review PASS within scope, not human owner approval. Evidence/report: .nox/evidence/ZE-10/ and .nox/ZE-10-Report.md.
Lighthouse comparable single samples: mobile70->70, desktop57->57; a11y100, CLS0, requests unchanged; JS+2436bytes and LCP+75/+73ms observed. No performance improvement claimed. CSSzoom200 section Google no overflow; global overflow observed outside section, no whole-page zoom approval claimed.
ZE-09 remains WAITING_USER_ACTION for client/Profile/API/OAuth, authentic reviews/rating/count and human official-flow validation. Final ZE-03-REWORK-POST-ZE09 remains WAITING_USER_ACTION for owner visual approval; historical ZE-03-REWORK COMPLETED unchanged. ZE-11/12 QUEUED, no automatic advance. No secrets/.env read or recorded, actual Google connection simulated as real, Cloud/API/billing mutation, paid service, push or deploy. Checkpoint ZE-10-start-20261023 at cbd4b26. Scoped commit is the commit carrying this record; hash to be reported after Git operation. Existing dirty ZE-09 docs and owner untracked preserved.


2026-10-23 — ZE-10.1 CURRENT: owner explicitly authorizes independent responsiveness and real painting comparison while ZE-09 and final hero approval remain WAITING_USER_ACTION. Exactly two deliveries: global responsiveness/real owner photographs; responsive motion/interactions/QA. Baseline 00e44b2, checkpoint ZE-10.1-start-20261023, preexisting ZE-09 changes backed up; original references and src/planos preserved. ZE-10.2/11/12 unauthorized. No billing, credentials, push or deployment.


2026-10-23 — ZE-10.1 COMPLETED technically in exactly two deliveries. Responsive global layouts, genuine owner paint photos with SHA256 manifest and honest angle/source labels, illustrative banks/carpet preserved. Build/lint exit0 (six legacy warnings), backend18 and Playwright22 groups PASS across11required sizes; text200/zoom-reflow/touch/keyboard/motion/loading/failure/analytics regression verified. Root rendered technical review PASS desktop/tablet/mobile320/390, no open findings; human owner approval is separate and not inferred. Mobile LH70→69, clean idle desktop57→57, CLS0/a11y100; original contention sample preserved and mobile targets remain unmet. Evidence/report .nox/evidence/ZE-10.1 and .nox/ZE-10.1-Report.md; checkpoint ZE-10.1-start-20261023@00e44b2. ZE-09 WAITING_USER_ACTION and final hero owner-approval WAITING_USER_ACTION retained, historical rework completed unchanged. PENDING_OWNER_ASSETS — Bancos e Carpete is content backlog, nonblocking with honest illustrative labels. ZE-10.2/11/12 not started; no credentials/billing/production/push/deploy. Owner dirty ZE-09 docs and untracked references/planos preserved.


2026-10-24 — ZE-09.1 CURRENT authorized independently of ZE-09 WAITING_USER_ACTION by owner contract 6a80a498-d491-4bdf-9c12-130cf8b69fc2. ZE-10.1 confirmed COMPLETED at bcddcc8; no concurrent implementation. Exactly two deliveries: reference4 visual fidelity and responsive motion; dynamic official-contract readiness, QA and handoff. Baseline/checkpoint ZE-09.1-start-20261024 at bcddcc8. Owner dirty ZE-09 documents backed up without alteration; new_interface/ and src/planos/ preserved. Google project zelo-integracoes / 878742106609 / protocol1-7339000042113 remains externally pending. No API/Cloud/billing/Instagram backend changes, credentials, production, push or deployment. ZE-11/12 unauthorized.


2026-10-24 — ZE-09.1 COMPLETED technically in exactly two deliveries, under owner explicit exception independent of pending ZE-09. Reference4 editorial DOM, approved copy, official Instagram, dynamic Google average/count/fraction stars/snippets, honest unavailable channels and source attribution, responsive motion and controlled revalidation implemented. Root rendered technical review1440/768/390/320/unavailable PASS; owner visual approval not inferred. Build/lint PASS with six legacy warnings; API18, hook9+9, UI/E2E32, activation5, scopedaxe3 scans0violations/text200 and labeled motion/deferredfont PASS. Michroma Regular OFL selfhost19,744bytes loads near section only; no critical Google/font requests. Performance comparison executed, NOT preservation PASS: mobile69→68/LCP6209→6260, desktop57→56/LCP6629→8491, CLS0/a11y100, simulated desktop LCP regression disclosed. No secrets/provider content saved, Cloud/API/billing changes, push or deploy. Checkpoint ZE-09.1-start-20261024@bcddcc8. ZE-09 WAITING_USER_ACTION for GBP approval/OAuth/server credentials/real data, final hero human gate unchanged; ZE-10.1 COMPLETED, ZE-11/12 not initiated. Report/evidence .nox/ZE-09.1-Report.md and .nox/evidence/ZE-09.1. Latest owner observation followup is separately mapped after this two-delivery closure.


2026-10-24 — After technical ZE-09.1 closure in b46d596, owner explicitly expands active objective with bounded UI observations, mapped as ZE-UX-OBS-01 CURRENT (not a third ZE-09.1 delivery or future sprint). Remove visible technical/editorial provenance captions across interface while retaining internal/accessibility provenance and honest provider states; align services/results to reference2 including benefit bar/cards/icons, individual WhatsApp messages for four services, and larger circular clickable Vonixx/Vintex/Zacs logos at owner-provided official HTTPS URLs. Existing functionality/hero/Instagram API/analytics/credentials preserved. Latest owner caption instruction supersedes prior visible-caption requirement. No push/deploy/Cloud/billing/future sprints. ZE-09 remains WAITING_USER_ACTION: Meta portfolio approval screenshot does not establish Google GBP approval, connected read-only search inconclusive, five required Google server variable names absent. Local real Functions preview5173 is running; Instagram200/6posts, Google503configuration. Current task has no external blocker.


2026-10-24 — ZE-UX-OBS-01 COMPLETED technically after root source/rendered review: owner-requested technical captions removed from visible and comparator-note DOM, honest source metadata/alt retained, official-only Instagram (no editorial fill), reference2 benefits/copy/icons with continuous legible fade/no panel, four distinct personalized WhatsApp messages, larger clipped circular official brand links and crisp native Vintex wordmark. A real analytics regression from changed WhatsApp query strings was fixed by approved origin/number-path matching with consent/typed context intact. Build/lint PASS six legacy warnings; rendered17groups/10sizes and analytics3groups PASS (12opt-in,0denied,wrong target ignored). Root visual1440/320/services/results/logos PASS, no open findings; owner human approval separate. ZE-09.1 already completed in b46d596 with performance limitations retained. ZE-09 WAITING_USER_ACTION: owner received Meta approval only; Google approval unconfirmed in request mailbox omnyatech@gmail.com (connector is another mailbox), five required Google variable names absent. Real local Functions5173 IG200/6officialposts and Google503configuration, no mocks installed. ZE-10.1 completed; final hero human gate pending; ZE-11/12 queued/unstarted with unmet predecessors enforced. No secrets/Cloud/API/billing/production/push/deploy changes; owner dirty ZE-09 docs/untracked preserved. Source/report/evidence .nox/ZE-UX-OBS-01-Report.md and .nox/evidence/ZE-UX-OBS-01. Latest owner caption direction supersedes earlier labels; PENDING_OWNER_ASSETS stays internal.


2026-10-24 — ZE-10.2 CURRENT under explicit owner contract f5dee4d5-1118-425e-a74a-01fd4636e10c. Logical predecessor ZE-10.1 is COMPLETED; independent exception preserves ZE-09 WAITING_USER_ACTION and hero human approval. ZE-09.1 and ZE-UX-OBS-01 are already technically completed at b46d596/742b97f, with disclosed performance limits. Exactly two deliveries: (1) cinematic error interfaces and actual HTTP routing; (2) global recovery, accessibility, security, QA and reconciliation. Baseline/checkpoint ZE-10.2-start-20261024 at742b97f on work/ze-audi-redesign; dirty owner ZE-09 docs and untracked references/planos preserved. No hero, review/Instagram backend, credentials, Cloud configuration, billing, push or deploy changes. ZE-11/12 remain queued and unauthorized. Vite alone cannot prove production HTTP; local Pages-compatible runtime validation required.


2026-10-24 ? ZE-10.2 COMPLETED technically in exactly two deliveries after actual Pages HTTP20, browser48, production4, Pages38, regression17, API18+1/matrix23 and axe6 scans0violations. Static404/500/503, native boot recovery, provider-protecting boundary, manual retry and noindex validated; static500/503 direct access remains HTTP200 and no infrastructure interception is claimed. Error CSS/silhouette deferred; optional font lowers mobile503CLS0.122?0.051. Errors LH100mobile/92desktop, TBT0 and~122KB. Landing70mobile/57desktop, CLS0; modeled desktopLCP6320?8485 limitation disclosed, no full performance-preservation claim. Root technical visual PASS, human approval separate. Additional owner-requested ZE-UX-SKG-01 COMPLETED: only SKG links to provided official Instagram; OmnyaTech unlinked, keyboard/URL test PASS. Existing owner dirtyZE09docs SHA unchanged and untracked preserved. No credentials, external configuration, push/deploy or ZE11/12 execution.


2026-10-24 — ZE-11 CURRENT by explicit owner contract 5a2e6c2f-a413-4a4b-99ef-e46eeedcf9ac. Latest owner statement "A hero está aprovada visualmente" accepts the implemented hero, completing ZE-03-REWORK-POST-ZE09 whose technical checks were already reviewed; it does not accept the entire landing. ZE-09 remains WAITING_USER_ACTION for official Google approval/OAuth/server configuration/authentic data; explicit exception authorizes all independent ZE-11 work. Exactly two deliveries: full regression QA; visual/functional homologation and handoff. Baseline0827b0d, checkpointZE-11-start-20261024, branchwork/ze-audi-redesign; two dirty owner ZE-09 documents hashed/backed up, untracked references/planos and secrets preserved. No deployment, push, Cloud/OAuth/billing changes or ZE-12 execution. Performance targets will be measured honestly, with explicit mobile/desktop and cold/warm profiles; no advance acceptance.


2026-10-24 — ZE-11 WAITING_USER_ACTION after all executable independent homologation work, exactly two deliveries. Owner explicitly accepted implemented hero; ZE-03-REWORK-POST-ZE09 COMPLETED. Internal defects fixed/retested: StrictMode Instagram duplicate request and aborted state, brand ARIA role, unavailable editorial display font, four-line location fit/text200 inner overflow, photo-background contrast, finished car animation fill delaying observed paint. Build/lint PASS six legacy warnings; global22, local17, affected14, feed6, errors48, productionBoundary4, API23+18 and contrast28 PASS; nine axe scans zero detected violations, no complete WCAG certification. All five models compared and Root technical visual review PASS; final full-landing human approval not inferred. Actual Instagram200/six posts and rendered map/mobile scroll verified; Google503configuration, real source remains pending under ZE-09. Final explicit normal-motion equivalent Lighthouse: cold/warm mobile69/96, desktop95/100; LCPsim6367/2777/1413/584ms, CLS0, a11ySEO100, BP96mobile92desktop. Observed cold LCP2203/2196ms improved after natural animation cleanup; simulated mobile targets90+/2500ms NOT met, no performance acceptance or tradeoff waiver assumed. Earlier desktop/mobile-profile and OS-reduced-motion measurement issues preserved/classified. Remaining actions: Google approval/OAuth/authentic data; owner full-page visual acceptance; explicit decision on measured performance tradeoff. ZE-12 QUEUED blocked, no execution. Protected owner documents/assets and untracked references/planos preserved; no secrets/Cloud/billing/production/push/deploy changes. Report .nox/ZE-11-Report.md, evidence .nox/evidence/ZE-11/. Local preview5173 real APIs, Pages8888 isolated configuration.


2026-10-24 — Owner explicitly stated "Aprovado visualmente", accepting the current full ZE-11 visual candidate85e80732088b62e05a25c7bdde139b106b01ba20. Human visual acceptance gate PASS; earlier implemented hero acceptance remains COMPLETED. This closes only the visual gate: official Google source/approval/OAuth and mobile Performance69/LCPsim6367ms targets remain unresolved. No performance exception inferred. ZE-11 WAITING_USER_ACTION, ZE-09 WAITING_USER_ACTION, ZE-12 QUEUED blocked; no product changes, tests, push, deploy, Cloud/billing changes or new sprint execution. Evidence .nox/evidence/ZE-11/owner-visual-approval.json.


2026-10-24 — Owner authorizes ZE-11-REWORK to meet actual mobile Performance90+/LCP2500ms targets with real optimizations while preserving visually accepted composition and normal intro. Existing ZE-11 is REWORK, not a third formal delivery or ZE-12. Baseline6bdd370, checkpointZE-11-REWORK-start-20261024; owner dirty ZE-09 documents hashed/backed up and references/planos/secrets preserved. Owner clarifies ZE-09 BLOCKED_EXTERNAL awaiting Google after their requested actions; owner permits eventual publication with honest unavailable Google UI, but no deployment/ZE-12 is authorized now. Authentic Google remains unverified; explicit release exception removes it as blocking independent ZE-11 acceptance without fake source PASS. Approval alone cannot configure OAuth: five server values are required; fresh visits auto-load valid data, currently open permanent-error pages need bounded recovery. Scope includes safe long-cooldown visible/focus recovery, no hot polling. Approved full visual/hero acceptance retained; material appearance changes require evidence/review. Cold/warm and explicit motion/network profiles remain separate; no measurement gaming or performance waiver. Root owns runtimes/visual review; Nox owns implementation/state/QA/scoped commit. No costs, Cloud changes, push or production.


2026-10-24 — ZE-11-REWORK COMPLETED; ZE-11 applicable criteria PASS. Mobile cold normal-motion Performance98 in three fixed samples; simulated LCP2363/2356/2357ms (median2357), CLS0, no waived performance target. Mobile warm100/LCP902; desktop cold97/LCP1265 and warm100/LCP246, CLS0.003333 below0.1 disclosed. Native Pages Brotli baseline80/LCP5129 is equivalent transport; previous raw-server69/6367 is not the code-gain baseline. SSR/critical CSS/native intro+hydration, deferred editorial/motion and font competition, mobile AVIF/fallback/logo/favicon budgets and genuine mobile car arrival1.0s+.15s replace1.4s+.5s while geometry/framing/easing and desktop timing remain. Internal defects found and retested include early artwork fallback/hydration adoption, duplicate rejected import and pre-main anchor commit race. Build/lint PASS six legacy warnings; SSR14/global22/affected14/source8/productionAxe3/feed6/GoogleRecovery5/boundary4/contrast28 PASS, six axe scans0violations. Root technical visual review PASS: desktop final pixels identical, mobile geometry exact with quantified encoding differences; prior owner full visual acceptance retained, no new human approval invented. ZE-09 remains BLOCKED_EXTERNAL by owner clarification; explicit owner release exception allows future honest Google-unavailable UI, not fake authenticated data. Five-minute bounded visible/near recovery tested with fixtures; real activation requires valid authorized server endpoint, approval alone does not create OAuth/configuration. ZE-12 QUEUED and ready for separate authorization, not started. Owner dirty ZE-09 documents hashed unchanged, references/planos/originals and secrets preserved. No Cloud/OAuth/billing changes, push or deploy. Report .nox/ZE-11-REWORK-Report.md; evidence .nox/evidence/ZE-11-REWORK/. Scoped commit is the commit carrying this record.


2026-10-24 — ZE-12 CURRENT authorized by owner contract47c49978. Two deliveries only: traceable release preparation/authorized deploy; real post-deploy homologation. Current approved product candidate676f1a5a7e51e9c79c5f3fbe03c56edc35beedd8 supersedes historical85e8073 without rewriting visual acceptance. ZE-11 COMPLETED: final mobile98/LCP2356–2363ms and all applicable QA PASS; redundant legacy performance metadata reconciled with historical record retained. ZE-09 BLOCKED_EXTERNAL and explicit owner honest-unavailable release exception retained. Gate D requires separate final GO-LIVE identifying candidate/environment; execution request is preparation authority, not immediate production publication. No push/merge/deploy/Cloud mutation before that gate. Preserve two owner dirty documents, references/planos/originals/secrets; isolated git-archive source and npm ci/build/lint. Root owns Cloudflare read-only discovery, Nox owns release preparation/state. Final production checks remain NOT_RUN until authorized deployment.


2026-10-25 — ZE-12 WAITING_USER_ACTION after all independent preparation: immutable product676f1a5, clean npm ci/lint/build PASS,134files28MB, classified dependency risks14 tooling/debug findings, localQA14SSR/22matrix/8scoped/2actual/8HTTP/3axe PASS; cold mobile98/LCP2363ms. GitHub branchrelease/ze12-preview-676f1a5 only, previewdeployment1d123d20-2d18-4619-baa9-4b411976046f SUCCESS onNode22.23.4/npm10.9.9, Worker compiled; remote13groupsPASS including11resolutions/intro/session/interactions. PreviewHTMLSHA61c4 matchesapprovedZE11. Productionmainb575ed2/deployment0f414771 remain unchanged; no production deployment or secret mutation. Current production Instagram400/OAuth190; local compiled server with whitelisted in-memory validated vars200/6. Final approval required for exactcandidate/zelo-auto/canonicaldomain plus3Instagram server binding sync topreview+production, sameSHApreviewfeedverification beforemainfast-forward, fullpostdeployQA/smoke and5mincheck, conditionalknownrollback oncriticalincident. GateD authority from ownercontract47c49978, not an inferred skill permission rule. Googleexceptionalreadyapproved; ZE09BLOCKED_EXTERNAL andZE11COMPLETED preserved. C01pendingonlyauthorization/Instagramactivation;C02-C04NOT_RUN. Ownerdirtydocs/reference/planos/secrets preserved; preview is not production. Report.nox/ZE-12-Report.md.
