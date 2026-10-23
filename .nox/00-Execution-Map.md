# Mapa de execução — Zelo Autoestética

Atualizado em 2026-10-22. Coordenação: Nox. Workspace: B:\OmnyaTech Project's\Projetos\zelo_autoestica.

| ID | Atividade | Estado | Dependência | Próxima ação |
| --- | --- | --- | --- | --- |
| ZE-01 | Segurança e baseline | COMPLETED | - | Preservado |
| ZE-02 | Desacoplamento do 3D | COMPLETED | ZE-01 | Preservado |
| ZE-03 | Hero cinematográfica final fiel à referência, camadas e intro única | COMPLETED | ZE-02 | Aceite local evidenciado no relatório final |
| ZE-04 | Reestruturação visual | COMPLETED | ZE-03 | Preservado |
| ZE-05 | Performance e acessibilidade | COMPLETED | ZE-04 | Concluída tecnicamente; metas mobile não atingidas documentadas em `.nox/ZE-05-Report.md` |
| ZE-06 | Instagram funcional | WAITING_USER_ACTION | ZE-05 | Owner authorizes/publishes the ZE-06 Pages runtime update, then Nox verifies public endpoint; latest GET remains HTTP 400 / OAuthException 190 |
| ZE-07 | SEO técnico local | QUEUED | ZE-06 | Fora do objetivo ativo; não executar |
| ZE-08 | Google Analytics e mensuração | QUEUED | ZE-07 | Fora do objetivo ativo; não executar |
| ZE-09 | Reputação Google | QUEUED | ZE-08 | Fora do objetivo ativo; não executar |
| ZE-10 | Confiabilidade de avaliações Google | QUEUED | ZE-09 | Fora do objetivo ativo; não executar |
| ZE-11 | Homologação geral local | QUEUED | ZE-10 | Fora do objetivo ativo; não executar |
| ZE-12 | Publicação controlada | QUEUED | ZE-11 | Fora do objetivo ativo; não executar |

ZE-03 foi reaberta e corrigida nesta execução; esta validação final substitui a aprovação visual das implementações anteriores ZE-03 e ZE-03-REWORK. O rework é parte da ZE-03, sem sprint adicional.

ZE-05 concluída tecnicamente em 2026-10-23 com exatamente duas entregas. Lighthouse final mobile 89/100 e LCP 3,531 ms ficaram abaixo das metas 90/2,5 s; a análise atribuiu o atraso cold-start à espera intencional da intro cinematográfica preservada e não encontrou oportunidade segura dentro do escopo para encurtá-la. Desktop 99/100; acessibilidade 100; sem CLS ou GLB/Three requests na landing. Root/Nox fez revisão visual técnica; aprovação humana do proprietário não declarada. ZE-06 local implementation and real-feed validation are complete, including six official posts and the real local browser gallery. C01 is PASS locally; deterministic API/UI/security checks C02-C04 are PASS. ZE-06 is WAITING_USER_ACTION because the latest read-only public GET after the owner-reported Cloudflare update still returned HTTP 400 / OAuthException 190. The response indicated Meta invalidated the session after a password/security event; this does not establish the current cause. The latest owner screenshot now shows the expected unprefixed core server-side names, but the raw response shape still reflects an older deployed runtime; variable names alone do not prove the updated handler is active. Root's latest read-only GET after the correction still returned HTTP 400 / OAuthException 190. The next gate is owner authorization to publish/deploy the ZE-06 Pages runtime, then public verification. No production change/deploy/push was made by Nox. ZE-07+ remain QUEUED.


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
