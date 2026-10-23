# QA independente ZE-08

Resultado técnico local: **PASS**. Recebimento em GA4/DebugView e propriedade Search Console: **PENDING / não demonstrados**. Não houve deploy, acesso a conta Google ou leitura de `.env` nesta validação.

## Reprodução

Com o build final sendo servido em `http://127.0.0.1:4178`:

```powershell
node .nox/evidence/ZE-08/qa-browser.mjs
node .nox/evidence/ZE-08/qa-production-simulation.mjs
node .nox/evidence/ZE-08/qa-additional.mjs
node .nox/evidence/ZE-08/qa-visual-compare.mjs
```

Os scripts só escrevem evidências ZE-08. A simulação de produção usa a origem oficial exclusivamente no navegador isolado, roteia cada recurso da aplicação ao servidor local e bloqueia/substitui tráfego externo. Não modifica DNS nem produção; não prova recepção Google.

## Evidências

- `qa-browser-results.json`: consentimento inicial sem eventos/tag/requests, recusa persistida após reload, aceite, pageview único, revogação, storage indisponível, exclusão debug, SEO preservado e seis viewports.
- `qa-events.json`: eventos sanitizados de pageview, orçamento, WhatsApp, serviço, Instagram, Maps, busca e comparador. Nenhum texto de busca, número, mensagem de WhatsApp, query/hash da página ou venda fictícia.
- `qa-production-simulation.json`: quatro cenários PASS — adblock, download 503, Google indisponível (stub sem processamento) e tag pendente/timeout. Tag única/async, ID autorizado, config única, pageview manual único, armazenamento publicitário negado, revogação bloqueia novas medições, remove eventos em fila e cookies `_ga*` acessíveis. Nenhum request de coleta real.
- `qa-additional.json`: quatro serviços e três comparadores geram IDs corretos; revogação entre abas interrompe eventos na aba já aberta; recusa preserva navegação real do CTA do header para destino WhatsApp interceptado localmente.
- `qa-consent-{viewport}.png`, `qa-{viewport}.png`, `qa-preferences-desktop.png`: seis viewports 1920×1080, 1440×900, 1366×768, 768×1024, 390×844, 360×740. Nenhum overflow; aviso dentro do viewport; zero exceções browser. Modal legível, checkbox desmarcado inicialmente, ciclo Tab/Shift+Tab entre controles validado. Movimento reduzido remove transform do aviso.

O CTA orçamento gera exatamente um `quote_click` e um `whatsapp_click` para representar duas dimensões da mesma ação; não são dois contatos e não podem ser somados. CTA de serviço também produz `select_service`; os três nomes são categorias diferentes, sem repetição do mesmo nome por listener ou bubbling. Arraste/teclas consecutivas no comparador são agrupados em um evento após 500ms.

## Regressão visual

Comparação pixel a pixel normalizada com as seis capturas anteriores à ZE-08: notebook, tablet, mobile e mobile compacto têm diferença zero em todos os pixels da área anterior. Desktop e ultrawide têm diferenças nas faixas do feed dinâmico Instagram; o restante é idêntico. Em todos os seis tamanhos, o acesso permitido de privacidade acrescenta 44–45px no fim da página, sem deslocar as seções anteriores. A hero é idêntica em todos os seis tamanhos. Detalhes por faixa em `qa-visual-comparison.json`.

Essa evidência comprova preservação da interface anterior. Não declara nova aprovação estética absoluta dos cinco modelos, nem antecipa rework visual de outra sprint. O aviso ocupa temporariamente parte inferior da hero no mobile; a escolha o remove e permanece persistida. Nenhuma alteração do cenário/carro/header foi observada.

## Limites

Os cenários interceptados verificam integração e comandos enfileirados do bundle, não executam a biblioteca real do Google. Enhanced Measurement, eventos principais, DebugView, recebimento e Search Console dependem do painel e devem continuar explicitamente pendentes. Build/lint/Lighthouse e revisão de estado Nox são reconciliados pelo Nox no relatório da sprint.
