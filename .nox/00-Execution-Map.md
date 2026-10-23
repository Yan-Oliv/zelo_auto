# Mapa de execução — Zelo Autoestética

Atualizado em 2026-10-23. Coordenação: Nox. Workspace: B:\OmnyaTech Project's\Projetos\zelo_autoestica.

| ID | Atividade | Estado | Dependência | Próxima ação |
| --- | --- | --- | --- | --- |
| ZE-01 | Segurança e baseline | COMPLETED | - | Preservado |
| ZE-02 | Desacoplamento do 3D | COMPLETED | ZE-01 | Preservado |
| ZE-03 | Hero cinematográfica final fiel à referência, camadas e intro única | COMPLETED | ZE-02 | Aceite local evidenciado no relatório final |
| ZE-03-REWORK | Historical rework incorporated into ZE-03 | COMPLETED | ZE-03 | Preserve history; no independent acceptance |
| ZE-04 | Reestruturação visual | COMPLETED | ZE-03 | Preservado |
| ZE-05 | Performance e acessibilidade | COMPLETED | ZE-04 | Concluída tecnicamente; metas mobile não atingidas documentadas em `.nox/ZE-05-Report.md` |
| ZE-06 | Instagram funcional | COMPLETED | ZE-05 | Aprovada pelo proprietário após validação visual local real; runtime público não publicado nesta sprint |
| ZE-07 | SEO técnico local | COMPLETED | ZE-06 | Concluída tecnicamente; relatório e evidências em `.nox/ZE-07-Report.md` e `.nox/evidence/ZE-07/` |
| ZE-08 | Google Analytics e mensuração | COMPLETED | ZE-07 | Duas entregas aprovadas tecnicamente; pain?is Google PENDING conforme relat?rio |
| ZE-09 | Reputação Google | WAITING_USER_ACTION | ZE-08 | OAuth proprietário/projeto aprovado e dados/links reais; ver handoff |
| ZE-03-REWORK-POST-ZE09 | Final hero correction | WAITING_USER_ACTION | ZE-09 (explicit limited exception) | Owner visual acceptance; technical checks reviewed with performance limits |
| ZE-10 | Google review reliability and accessibility | COMPLETED | ZE-09 (explicit independent exception) | Independent criteria PASS; real Google gates remain in ZE-09; ZE-11 not authorized |
| ZE-11 | Homologação geral local | QUEUED | ZE-10 | Fora do objetivo ativo; não executar |
| ZE-12 | Publicação controlada | QUEUED | ZE-11 | Fora do objetivo ativo; não executar |

ZE-03 foi reaberta e corrigida nesta execução; esta validação final substitui a aprovação visual das implementações anteriores ZE-03 e ZE-03-REWORK. O rework é parte da ZE-03, sem sprint adicional.

ZE-05 concluída tecnicamente em 2026-10-23 com exatamente duas entregas. Lighthouse final mobile 89/100 e LCP 3,531 ms ficaram abaixo das metas 90/2,5 s; a análise atribuiu o atraso cold-start à espera intencional da intro cinematográfica preservada e não encontrou oportunidade segura dentro do escopo para encurtá-la. Desktop 99/100; acessibilidade 100; sem CLS ou GLB/Three requests na landing. Root/Nox fez revisão visual técnica; aprovação humana do proprietário não declarada. ZE-06 local implementation and real-feed validation are complete, including six official posts and the real local browser gallery. C01 is PASS locally; deterministic API/UI/security checks C02-C04 are PASS. ZE-06 is WAITING_USER_ACTION because the latest read-only public GET after the owner-reported Cloudflare update still returned HTTP 400 / OAuthException 190. The response indicated Meta invalidated the session after a password/security event; this does not establish the current cause. The latest owner screenshot now shows the expected unprefixed core server-side names, but the raw response shape still reflects an older deployed runtime; variable names alone do not prove the updated handler is active. Root's latest read-only GET after the correction still returned HTTP 400 / OAuthException 190. The owner reaffirmed that ZE-06 was completed and approved after local real-feed validation. ZE-06 is COMPLETED for its approved local integration scope; the public Pages runtime was not deployed or verified, and remains a separate production follow-up. ZE-07 is now CURRENT.


## Correção visual vinculante — 2026-10-22
ZE-03 COMPLETED após correção de apoio do carro, piso/sombras, frases mobile separadas e logo oficial nas cores reais. Aprovação anterior240d4c2 rejeitada; aceite atual somente ZE-03-CORRECTION-*. ZE-04 não iniciada; sem deploy/push.


## Revisão vigente — transparência e intro v4
ZE-03 COMPLETED. Logo oficial transparente sem placa; intro v4 real comprovada por vídeos/frames. Apoio do carro e mobile preservados. Aceite atual ZE-03-INTRO-*; placa/intro anteriores substituídas. ZE-04 não iniciada; sem produção/push.

## ZE-04 authorized objective, 2026-10-22
ZE-03 completed at b2bbfda. ZE-04 COMPLETED technically, exactly two deliverables: commercial sections; navigation/contact/identity. Sources new_interface1..5, real site.ts data wins factual conflicts. ZE-05+ outside authorization. No push/deploy.

## ZE-04 technical completion
Two deliverables implemented and reviewed. Build/lint PASS; QA332 resolved PASS, no open failures; independent review and root/Nox rendered comparison PASS. Owner visual approval not claimed. ZE-05 and successors QUEUED outside authorization. No push/deploy.

## ZE-05 authorized objective, 2026-10-22
ZE-04 commit3271073 is the baseline. ZE-05 CURRENT: delivery1 initial JS/assets; delivery2 mobile performance/accessibility. Checkpoint ZE-05-start-20261022. No redesign, keyv4/layouts preserved. ZE-06+ QUEUED outside authorization.


2026-10-23 ? ZE-08 COMPLETED tecnicamente em duas entregas. GA4 G-E9SKGKCQXX b?sico opt-in, eventos tipados, UI revog?vel e Search Console preparado. Build/lint PASS (6 warnings legados), QA20grupos PASS, seis viewports/revis?o Nox PASS. Lighthouse cold desktop99/mobile81 sem regress?o score/CLS; mobile LCP4734/TBT32/CLS0 versus baseline4808/38/0. GA4 recebimento/Enhanced Measurement/Key Events e propriedade/sitemap Search Console PENDING externos explicitamente, sem envio nem acesso Google. Checkpoint ZE-08-start-20261023. ZE-09 e p?sZE09 ZE-03-REWORK apenas QUEUED. Sem deploy/push; untracked preservados.


2026-10-23 — ZE-09 CURRENT autorizada: duas entregas (fonte oficial GBP e fluxo oficial). ZE-08 COMPLETED em fc2a62e. Sem variáveis GOOGLE/BUSINESS/PLACES no .env (nomes apenas); OAuth/conta/localização e vínculo oficial ainda dependem do proprietário. Sem produção/push/custos. Hero/rework/ZE-10 preservados.

2026-10-23 — ZE-09 WAITING_USER_ACTION após todo trabalho interno: adaptador GBP OAuth/Pages+Vite, hook lazy, CTAs oficiais condicionais, analytics view/write; API10 e UI18 grupos determinísticos PASS, seis viewports MOCK e indisponível real, build/lint PASS (6 warnings legados), revisão Nox estrutural PASS com limites. Ficha pública identificada por nome/site/telefone/cidade, endereço número1485/propriedade/verificação/OAuth/API autorizada e reviews/nota/total/link compartilhável real PENDING. Lighthouse mobile baseline91/final91 após repetição (amostra89 registrada), CLS0; contraste legado97 a11y mantido. Configuração local Google ausente; seguir .nox/ZE-09-Google-Handoff.md. Sem custo/Places/deploy/push; ZE-03-REWORK pósZE09 próxima, ZE10+ bloqueadas, não executadas.


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
