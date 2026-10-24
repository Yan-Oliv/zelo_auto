# ZE-11 — QA local independente

**PASS no escopo técnico verificado. BLOCKED para homologação integrada das avaliações Google. Aceite humano da landing completa permanece PENDING.** Performance é medida separadamente e não recebe PASS por inferência destes testes.

## Reprodução

Pré-condições: Vite candidato atual em `http://127.0.0.1:5173`, Pages local em `http://127.0.0.1:8888`. Runtime Pages desta rodada usa ambiente vazio de propósito: prova roteamento e falhas seguras, não Instagram real nesse runtime. Vite usa os valores locais ignorados sem expor seus conteúdos.

- `node .nox/evidence/ZE-11/qa-matrix.mjs` — 22/22 grupos: 11 viewports obrigatórios, imagens/sem overflow, sliders mouse/touch/teclado/Home/End, rotação, menu/busca/foco, reflow e texto200%, recursos lentos/quebrados, intro/sessão/reduced motion, stagger e analytics.
- `node .nox/evidence/ZE-11/qa-local.mjs` — 17/17 grupos: endpoints atuais, HTTP Pages, cinco áreas em quatro tamanhos, vídeos/frame inicial/intermediário/final da hero, retorno de sessão, fontes/imagens lentas, motion nas seções, SEO/links, consentimento/analytics diagnóstico, axe e árvore AX/teclado.
- `node .nox/evidence/ZE-11/qa-affected.mjs` — 14/14 grupos: tipografia final nas 11 resoluções, título localização com quatro linhas em tamanho padrão; texto computado dobrado720/390/320 sem corte ou overflow interno do título.
- `node .nox/evidence/ZE-11/qa-feed.mjs` — 6/6 grupos: StrictMode faz uma requisição inicial, seis/dois/nenhum post, erro, skeleton e imagem quebrada, unmount/abort/remount e resposta antiga sem sobrescrever estado novo.
- `$env:ZE102_QA_DIR='.nox/evidence/ZE-11/qa-errors'; node .nox/evidence/ZE-11/qa-errors.mjs` — 48/48 grupos sobre erros responsivos e recuperação, modos render/provider/lazy, foco/ações nativas, reduced motion, contraste de botões, JS desativado e boot recovery.
- `node .nox/evidence/ZE-11/qa-production.mjs` — 4/4 grupos de falhas sintéticas sobre fonte boundary e rootOptions compilados em produção; logs públicos sanitizados e retry recuperável.
- `node --experimental-strip-types .nox/evidence/ZE-11/qa-api-matrix.mjs` — 23 cenários de upstream controlado; JSON/status sanitizados sem expor sentinelas.
- `node --experimental-strip-types --test .nox/evidence/ZE-10/api-tests.mjs` — 18/18 testes backend Google atuais, saída preservada em `qa-api-google.txt`.
- `node .nox/evidence/ZE-11/qa-errors-accessibility.mjs` — seis scans axe de404/500/503,1366/320, zero violações detectadas.
- `node .nox/evidence/ZE-11/qa-contrast.mjs` — 28/28 amostras manuais por pixels reais sob glifos, limiar4,5 para textos pequenos. Não certifica AA integral.

As rodadas afetadas foram repetidas após correções. `qa-findings.json` diferencia defeitos internos de enganos no harness e aponta evidência antes/depois. Não somar grupos heterogêneos para fingir casos independentes ou cobertura integral automática.

## Evidência visual

`qa-local/REAL-model-{1-hero,2-services-results,3-process-quality,4-community,5-location-footer}-{1440,768,390,320}.png` e `REAL-full-{largura}.png` registram a interface corrente com seis posts oficiais; Google mostra a indisponibilidade503 de configuração sem nota/depoimento fictício. Algumas capturas amplas mostram o iframe Maps em branco transitório mesmo com a rede permitida.

`qa-local/REAL-map-mobile-scroll.png` é a prova separada de mapa real: ruas, marcador, atribuição Google, aviso de dois dedos. O gesto de um dedo sobre o mapa moveu a página de8727 para8852px. O link oficial de rotas está disponível fora do iframe. As visões amplas com mapa vazio não são prova de tiles reais.

`qa-local/videos/hero-cold-warm.webm` e frames `hero-cold-initial/middle/final.png` mostram a intro real em `no-preference` explícito, opacidade do carro0→intermediária→1, frases de lados opostos e reveal ZELO. Reload e retorno por âncora ficam settled; novo contexto isolado inicia playing. Reduced motion não executa animações. Limpeza do efeito já terminado no `animationend` não é remoção da intro. A sombra de contraste é uma diferença intencional restrita aos glifos; não declarar a hero inteira pixel idêntica ao baseline.

`MOCK-scroll-comparators.webm` contém feed de teste isolado, identificado no nome e no relatório; prova motion e interação, sem provar integração oficial. `qa-matrix/MOCK-*` segue a mesma limitação.

## Limites obrigatórios

- Google real: **BLOCKED**; resposta atual503/configuration, sem OAuth/retorno oficial autorizado. Fixtures não removem esse gate.
- Human visual completo: **PENDING**. A aprovação explícita recebida para hero não aprova automaticamente os demais ajustes finais.
- Lighthouse/performance: relatório do especialista separado; não concedido PASS por comandos de QA passarem.
- Analytics: eventos diagnósticos locais e consentimento testados. Não foi entregue evento real à propriedade de produção.
- axe: três scans landing e seis erros sem violações detectadas; contraste em imagens/gradientes exige inspeção, amostrada em28 alvos e botões de erro. Leitor de tela físico e conformidade WCAG integral não certificados.
- Zoom: reflow equivalente e texto computado dobrado; toolbar nativa do navegador não automatizada.
- HTTP404 real em Pages. `/500` e `/503` templates diretos respondem200; boundary React não altera retroativamente status entregue nem intercepta automaticamente falha da infraestrutura.
- Nenhum deploy, push, billing, credencial, produção ou projeto Google Cloud foi alterado pelo QA.
