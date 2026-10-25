# ZE-11 — Homologação geral local

Estado: **WAITING_USER_ACTION**. Duas entregas formais: regressão completa; homologação visual/funcional e handoff. Todo trabalho interno executável e seus retestes foram concluídos. O aceite visual global foi recebido em2026-10-24. Restam Google oficial e decisão explícita sobre metas de performance não atingidas. ZE-11 não está COMPLETED nem liberada para ZE-12.

## Autoridade, baseline e aceite da hero

Contrato do proprietário: anexo `5a2e6c2f-a413-4a4b-99ef-e46eeedcf9ac/Pasted text.txt`. Branch `work/ze-audi-redesign`; baseline `0827b0d7bcef93cb5f1e861cb2e3a725c41d7fa4`; checkpoint `ZE-11-start-20261024`. O contrato permite homologação independente da ZE-09. Os documentos ZE-09 já modificados pelo proprietário foram preservados por SHA256 e backup; `new_interface/`, `src/planos/`, fotografias originais e credenciais ignoradas permanecem intactos.

O proprietário declarou: **“A hero está aprovada visualmente”**. Isso fecha o aceite humano de `ZE-03-REWORK-POST-ZE09`, cujos critérios técnicos já estavam validados. Registro: `evidence/ZE-11/hero-owner-approval.json`. Essa declaração não aprova automaticamente toda a landing nem resolve Google, performance ou publicação.

## Entrega 1 — Regressão e correções

- Instagram iniciava duas requisições no ciclo de montagem/limpeza/remontagem de desenvolvimento StrictMode. O fetch agora é agendado no próximo task, cancelável na limpeza, e ignora resposta abortada antes de atualizar estado. Seis testes cobrem feed completo/parcial/vazio/indisponível, imagem quebrada, aborto e remontagem sem resposta antiga sobrescrever conteúdo novo. O backend, autenticação e contrato não foram alterados.
- A coleção de marcas tinha `aria-label` em `div` sem papel semântico compatível. `role="group"` corrige a identificação acessível.
- Amostras de contraste em fundos fotográficos revelaram dez falhas que o axe não conseguia concluir. O fade branco contínuo dos serviços foi reforçado e as frases da hero receberam reforço estreito na sombra preta existente. Cores, posições, proporções, carro, cenário e animações foram preservados. As 28 amostras finais passam; isso é verificação complementar e não certificação completa WCAG.
- A animação do carro mantinha seu efeito preenchido após terminar naturalmente, atrasando o registro observado de maior conteúdo até a limpeza global. O evento `animationend` remove somente o efeito já terminado do wrapper correto. Nenhuma duração, delay, sessão, escala ou enquadramento foi alterado. O diagnóstico isolado mediu LCP observado local de 3871 para 2230 ms com imagem final idêntica em 339.076 pixels; o LCP simulado permaneceu aproximadamente 5031/5033 ms. Esse experimento não representa telefone real, ganho de score ou aprovação da meta mobile.

Todos os defeitos internos identificados têm correção e reteste; erros dos harnesses são separados no ledger. As primeiras falhas permanecem como evidência, sem apresentação de resultados intermediários como aceite final.

## Entrega 2 — Fidelidade, responsividade e preview

As cinco referências foram abertas e comparadas à interface renderizada. Títulos editoriais dependiam de Eurostile instalado localmente e caíam em Montserrat arredondada. A fonte geométrica Michroma já licenciada e presente no projeto foi reutilizada nos títulos de serviços, resultados, processo, qualidade e localização, com carregamento próximo do conteúdo após a intro ou saída da hero. A tipografia própria da hero permanece preservada. O título de localização foi calibrado para quatro linhas nos onze tamanhos; ampliação real do texto em 200% recebeu quebra de palavra para evitar corte interno em 390/320px.

| Referência/área | Resultado técnico e diferenças autorizadas | Evidência |
| --- | --- | --- |
| 1 — Header/hero | Camadas, composição, intro única, slogans e logo oficial preservados; sombra estreita melhora contraste. Aceite humano da hero recebido antes da sprint. | `qa-local/REAL-model-1-hero-*.png`, vídeo `hero-cold-warm.webm` |
| 2 — Serviços/resultados | Hierarquia geométrica, grid 4/2/1, benefícios, CTAs individuais e comparadores operacionais. Pintura usa fotos reais; Bancos/Carpete mantêm fonte ilustrativa interna/alt, sem legendas rejeitadas. | `qa-local/REAL-model-2-services-results-*.png`, `qa-matrix/qa-global.json` |
| 3 — Processo/qualidade | Timeline horizontal/vertical em ordem, imagens e lettering; marcas circulares maiores com links oficiais; textos comerciais posteriores preservados. | `qa-local/REAL-model-3-process-quality-*.png` |
| 4 — Instagram/Google | Seis posts oficiais atuais. Google indisponível de forma honesta, sem nota/quantidade/reviews fictícios. Fixtures isoladas comprovam comportamento técnico, não autenticidade. | `qa-local/REAL-model-4-community-*.png`, `qa-local/results.json` |
| 5 — Localização/contato/rodapé | Dados reais existentes, quatro linhas do título, links/horários/WhatsApp, SKG com Instagram e OmnyaTech sem link. Captura específica comprova mapa real e scroll. | `qa-local/REAL-model-5-location-footer-*.png`, `REAL-map-mobile-scroll.png` |

Screenshots das cinco áreas e full-page em 1440/768/390/320px; matriz global em 2560×1440, 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844, 360×740, 320×640 e 844×390. Vídeos e frames mostram animações reais, retorno sem replay e reduced motion. O vídeo `MOCK-scroll-comparators.webm` é explicitamente de teste e não comprova reviews ou posts reais.

Os overviews podem mostrar iframe momentaneamente vazio, inclusive com rede liberada. Não são prova de pixels do mapa. A evidência dedicada `REAL-map-mobile-scroll.png` mostra ruas, marcador, atribuição Google, instrução de dois dedos e rolagem vertical de 125px com um dedo.

## QA

| Verificação | Resultado |
| --- | --- |
| Build | PASS — `build-final.txt` |
| Lint | PASS — seis warnings legados cinematic/MotionSettings, sem novos erros |
| Matriz global/interações | 22/22 grupos PASS, onze viewports |
| Interface real/SEO/analytics/animação/teclado | 17/17 grupos PASS |
| Regressão de tipografia/texto ampliado | 14/14 PASS |
| Feed e lifecycle Instagram | 6/6 PASS; feed real atual HTTP200/seis posts |
| 404/500/503 e recuperação | 48/48 grupos PASS |
| Boundary compilado em produção | 4/4 PASS; logs sanitizados e recuperação |
| Regressão Google backend | 18/18 testes PASS, fixtures |
| Falhas de APIs | 23/23 cenários PASS, fixtures |
| Axe | Três scans landing e seis erros, zero violações detectadas |
| Contraste de texto/fotos | 28/28 amostras PASS, sem alegar cobertura integral |
| WhatsApp/menu/busca/âncoras/sliders | PASS, teclado/touch/mensagens individuais/consentimento |
| Maps | Mapa real e scroll comprovados; fallback oficial preservado |
| Google real | PENDING — HTTP503 configuration, OAuth/API não configurados |
| Aprovação humana global | PASS — proprietário: “Aprovado visualmente”, candidato85e8073 |

SEO: title/description/canonical/robots/sitemap/OG/JSON-LD AutoWash e dados de Catalão verificados; sem `aggregateRating` fictício. Debug e erros noindex. Analytics valida consentimento unset/denied/granted, deduplicação e parâmetros permitidos em diagnóstico local; nenhum recebimento no painel GA4 ou publicação externa é alegado. Segurança inclui revisão de handlers, status/JSON sanitizados, scan de assinaturas no bundle e preservação de ativos/dados. Nenhum valor de `.env` foi lido, exibido, modificado ou commitado.

Runtime Pages local real comprova raiz/query/âncoras/debug HTTP200, barras redirecionadas sem loop e URLs/assets inexistentes HTTP404. O hash HTML da raiz corresponde ao `dist` final, conferido por Root. Templates diretos 500/503 retornam HTTP200 e Error Boundary não altera retroativamente HTTP; não foi implementada interceptação de falhas da infraestrutura Cloudflare.

## Performance e método

Os históricos exigiam correção metodológica: o perfil chamado desktop herdava CPU/rede/UA mobile; o Windows também informa reduced motion por padrão, fazendo a intro ser legitimamente pulada nos primeiros testes. Esses controles foram preservados e classificados, não apagados. A série autoritativa `performance-motion-summary.json` usa explicitamente movimento normal, CPU/rede/UA próprios mobile/desktop, cold sem sessão e warm após conclusão natural com mesmo navegador/cache. Portanto 8485ms históricos para 1530ms do desktop corrigido não é ganho de código.

Baseline autoritativo: mobile cold Performance70/LCP simulado6238ms/observado3910ms; warm97/2628ms/136ms. Desktop cold94/1530ms/3822ms; warm100/544ms/134ms. Simulado é modelo Lighthouse; observado é trace local sem throttling efetivo. São medidas diferentes, não dados de campo. Gzip foi ensaiado separadamente como transporte semelhante ao CDN: mobile80/LCP5031ms, sem alegar ganho de produto. Adiar imagens sob a dobra não apresentou ganho de LCP no diagnóstico e foi rejeitado como alteração desnecessária.

Medição final equivalente, uma amostra por cenário após QA encerrar todos os browsers, em `performance-final-summary.json` e quatro relatórios/traces. Não houve repetição para selecionar o melhor score.

| Cenário | Performance antes → final | LCP simulado antes → final | LCP observado antes → final | TBT final | CLS |
| --- | --- | --- | --- | --- | --- |
| Mobile inicial | 70 → 69 | 6238 → 6367ms | 3910 → 2203ms | 34ms | 0 |
| Mobile retorno | 97 → 96 | 2628 → 2777ms | 136 → 144ms | 49ms | 0 |
| Desktop inicial | 94 → 95 | 1530 → 1413ms | 3822 → 2196ms | 0ms | 0 |
| Desktop retorno | 100 → 100 | 544 → 584ms | 134 → 139ms | 0ms | 0 |

Accessibility e SEO100 nos quatro cenários; Best Practices96 mobile/92 desktop. O 503 deliberado no feed isolado e arredondamento inferior a1% da proporção do reflexo explicam itens Best Practices; isso não é erro JavaScript novo. Total transferido cold aumentou22.086bytes, principalmente fonte editorial19.914bytes, JS725 e CSS1447; imagens permanecem idênticas. O retorno ainda consulta a fonte em `/fonts/` sem cache imutável, por isso não se apresenta navegação warm como totalmente sem transferência. Essa alteração recupera fidelidade tipográfica e tem custo medido; não é melhoria global de performance.

A limpeza após término natural da animação antecipou a pintura observada em1707ms mobile/1626ms desktop, mantendo a intro global. O LCP simulado mobile aumentou129ms, e o retorno149ms; não há aprovação de preservação plena ou causalidade de melhorias no score. O observado pertence ao host local sem throttling efetivo e não equivale ao tempo em telefone real. **Metas mobile90+ e LCP≤2500ms: FAIL/não atingidas.** Manter a intro aprovada e aceitar o custo de fidelidade exige decisão explícita do proprietário; até lá o subgate de performance permanece não atendido, não PASS por exceção presumida.

## Critérios e parecer final

| Critério | Estado | Fundamentação |
| --- | --- | --- |
| ZE-11-C01 — Regressão funcional | PASS no estado autorizado | APIs reais separadas de fixtures; Instagram e mapas atuais comprovados; Google indisponível corretamente representado, sem homologar fonte real |
| ZE-11-C02 — Visual e responsividade | PASS técnico | Cinco referências comparadas, onze viewports, texto ampliado, motion/teclado/touch; Root/Nox revisou correções; proprietário aprovou visualmente o candidato85e8073 |
| ZE-11-C03 — Qualidade técnica | PENDING, subgate performance FAIL | Build/lint/SEO/analytics/segurança/acessibilidade testados; metas mobile não atingidas e decisão do proprietário necessária |
| ZE-11-C04 — Aprovação/handoff integrado | PENDING | Aceite visual global PASS; fonte Google real e decisão sobre metas de performance ainda pendentes |

Nenhum finding interno corrigível permanece aberto. O ledger preserva falhas iniciais de produto e divergências dos harnesses separadas, com correção e reteste. Root aprovou tecnicamente fonte/fade dos serviços, título de localização em quatro linhas e reforço estreito das sombras dos slogans. O reforço de contraste não revoga a declaração anterior do proprietário nem cria uma aprovação global inexistente.

## Gates, preview e rollback

- ZE-09: WAITING_USER_ACTION, confirmação da aprovação no e-mail `omnyatech@gmail.com`, OAuth autorizado/identificadores/segredos server-side e dados autênticos. O e-mail Meta não confirma Google. Projeto `zelo-integracoes`, número878742106609, protocolo1-7339000042113.
- Hero final: COMPLETED por aceite explícito. ZE-10.2 permanece COMPLETED tecnicamente.
- ZE-11: validação independente e pacote de aceite; não COMPLETED enquanto Google e decisão de performance estiverem pendentes. ZE-12 permanece QUEUED e bloqueada.
- Preview: `http://127.0.0.1:5173/` com Instagram real e Google indisponível; `http://127.0.0.1:8888/pagina-inexistente`, `/500`, `/503` para erros/HTTP compatível Pages. O runtime8888 usa configuração deliberadamente vazia nas APIs e não comprova Instagram real.
- Rollback: reverter apenas o commit ZE-11 após revisão, preservando mudanças posteriores; recuperar baseline pela tag `ZE-11-start-20261024` quando necessário. Nunca reset/clean destrutivo. O commit que contém este relatório é o candidato local ZE-11; seu hash será informado no handoff após a operação Git. Os dois documentos ZE-09 preexistentes e os diretórios do proprietário ficam fora do staging.

Produção permanece intacta. Sem deploy, push, alterações Cloud/OAuth, custos, faturamento ou execução ZE-12.


## Aceite visual do proprietário — 2026-10-24

Declaração explícita: **“Aprovado visualmente”**. O gate visual da landing atual está aprovado para o candidato `85e80732088b62e05a25c7bdde139b106b01ba20`; evidência `evidence/ZE-11/owner-visual-approval.json`. A declaração não resolve Google nem aceita automaticamente a exceção das metas mobile não atingidas. ZE-11 permanece WAITING_USER_ACTION, com C03 performance não atendida e C04 Google/decisão de performance PENDING. ZE-12 não foi iniciada; nenhuma publicação foi autorizada ou realizada.


## 2026-10-24 — Fechamento pelo ZE-11-REWORK

2026-10-24 — ZE-11-REWORK COMPLETED; ZE-11 applicable criteria PASS. Mobile cold normal-motion Performance98 in three fixed samples; simulated LCP2363/2356/2357ms (median2357), CLS0, no waived performance target. Mobile warm100/LCP902; desktop cold97/LCP1265 and warm100/LCP246, CLS0.003333 below0.1 disclosed. Native Pages Brotli baseline80/LCP5129 is equivalent transport; previous raw-server69/6367 is not the code-gain baseline. SSR/critical CSS/native intro+hydration, deferred editorial/motion and font competition, mobile AVIF/fallback/logo/favicon budgets and genuine mobile car arrival1.0s+.15s replace1.4s+.5s while geometry/framing/easing and desktop timing remain. Internal defects found and retested include early artwork fallback/hydration adoption, duplicate rejected import and pre-main anchor commit race. Build/lint PASS six legacy warnings; SSR14/global22/affected14/source8/productionAxe3/feed6/GoogleRecovery5/boundary4/contrast28 PASS, six axe scans0violations. Root technical visual review PASS: desktop final pixels identical, mobile geometry exact with quantified encoding differences; prior owner full visual acceptance retained, no new human approval invented. ZE-09 remains BLOCKED_EXTERNAL by owner clarification; explicit owner release exception allows future honest Google-unavailable UI, not fake authenticated data. Five-minute bounded visible/near recovery tested with fixtures; real activation requires valid authorized server endpoint, approval alone does not create OAuth/configuration. ZE-12 QUEUED and ready for separate authorization, not started. Owner dirty ZE-09 documents hashed unchanged, references/planos/originals and secrets preserved. No Cloud/OAuth/billing changes, push or deploy. Report .nox/ZE-11-REWORK-Report.md; evidence .nox/evidence/ZE-11-REWORK/. Scoped commit is the commit carrying this record.
