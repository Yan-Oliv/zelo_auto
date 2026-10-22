# ZE-03 — QA final local

Resultado: **PASS**. Escopo exclusivo ZE-03. Reconciliação e encerramento da sprint pertencem ao Nox.

## Reprodução

1. Executar `npm run build` e servir o resultado local com Vite preview em `http://127.0.0.1:4210/`.
2. Executar `node .nox/evidence/ZE-03-FINAL-qa.mjs`.
3. Conferir `ZE-03-FINAL-qa-results.json`: **144 verificações PASS, zero FAIL**.
4. Abrir as imagens `ZE-03-FINAL-reference.png`, `desktop.png`, `ultrawide.png`, `tablet.png`, `mobile.png` e `compact.png` (todos com prefixo `ZE-03-FINAL-`).

O teste usa Chromium headless via Playwright, DPR 1 e contextos independentes sem storage inicial. Somente `/api/instagram-feed` recebe resposta controlada 503 em JSON, para validar a landing e seu fallback sem depender do feed oficial. A integração externa Instagram não é certificada por este teste. O clique do orçamento é interceptado na saída para WhatsApp: o destino configurado é alcançado sem abrir conversa ou enviar mensagem.

## Cobertura e evidência

| Área | Verificação | Resultado |
| --- | --- | --- |
| Referência desktop | 1672×940; mesma composição geral, cenário premium, luz dourada, carro frontal central, ZELO delineado, frases e hint | PASS por inspeção das imagens reais |
| Responsividade | 1440×900, 2560×1080, 768×1024, 390×844, 360×740 | PASS; sem overflow horizontal |
| Camadas | Showroom, carro, SVG com quatro paths, slogans, overlays, hint e header são elementos distintos | PASS |
| Carro | Bbox desktop de referência dentro de cinco CSS px do modelo; proporção natural 1275/643 preservada em todas as telas | PASS |
| Marca fabricante | Inspeção do asset transparente e screenshots: sem anéis do fabricante ou badge na grade | PASS |
| Letras | SVG mantém proporção 825/286 e sobreposição vertical com carro; mobile mantém conceito adaptado | PASS |
| Header | Sem borda inferior; texto legível sobre topo claro, inclusive ultrawide | PASS |
| Intro primeira visita | Estado `playing` real; quatro animações observadas, entrada esquerda negativa/direita positiva, fade carro e clip reveal ZELO | PASS |
| Persistência | Chave `zelo:hero-intro:v3=complete`; reload e navegação de retorno mostram `settled`; cada contexto novo executa intro novamente | PASS |
| Reduced motion | Hero imediatamente pronta, opacity 1, animation none | PASS |
| Storage negado | sessionStorage lança SecurityError; hero completa sem exceções e não repete ao voltar no mesmo documento | PASS |
| Navegação | Menu mobile, serviços, retorno à hero, busca com acentos/estado vazio/Escape/foco, orçamento e hint | PASS |
| Regressão | Sete seções existentes, quatro serviços, nove tiles Instagram, links WhatsApp preservados | PASS |
| Runtime | Sem pageerror, canvas, requisição GLB ou bundle Three na landing | PASS |
| Build/lint | `ZE-03-FINAL-quality.json`, comandos solicitados com exitCode 0 | PASS |

As screenshots são capturadas depois do término natural da intro, sem `animations: disabled`. `ZE-03-FINAL-intro.png` registra o primeiro acesso ainda em transição. `ZE-03-FINAL-reduced.png` registra a configuração de movimento reduzido.

## Correções devolvidas e revalidadas

- O header permanecia escuro sobre Serviços no mobile. Reprodução original em `ZE-03-FINAL-qa-before-fix.json` e `ZE-03-FINAL-mobile-services-before.png`. Após o observer dedicado da hero, o header assume fundo escuro e texto claro ao sair da hero; ambos os viewports móveis passaram.
- Imagens e lettering deformavam em proporções diferentes. Após preservar proporções naturais, todos os seis viewports passaram nos checks de aspect ratio.
- No ultrawide, o recorte do showroom eliminava o fade claro e prejudicava o menu/hint. O overlay dedicado restaurou a leitura, validada na screenshot atual.
- No mobile, letras e carro ficaram separados após o ajuste de proporção. O posicionamento final voltou a sobrepor lettering e teto, comprovado por bounding boxes e inspeção visual.

## Limites e observações

A aprovação visual avalia composição, proporções, nitidez, legibilidade e integração das camadas; não declara identidade pixel a pixel de assets gerados/recortados. A navegação existente foi preservada, portanto seus rótulos continuam correspondendo às seções reais. Os assets têm resolução real de 1672×940 no cenário e 1275×643 no carro; não são anunciados como 4K nativo.

Com sessionStorage indisponível, a equivalência leve é em memória do documento: impede repetição nas interações e retornos internos; uma recarga completa sem qualquer armazenamento não consegue preservar esse estado. O teste valida que esse caso permanece funcional e sem erros.

Build apresenta aviso de chunk grande do legado de debug Three, que não é requisitado pela landing. Lint passa com seis warnings em arquivos legados fora da hero (`CinematicContext.tsx`, `MotionSettings.tsx` e `CarScene.tsx`), registrados integralmente em `ZE-03-FINAL-quality.json`.

Validação feita em navegador Chromium emulado; não substitui teste em hardware móvel físico ou todos os motores de navegador. Nenhum deploy, publicação, migração, push ou trabalho ZE-04 foi executado pelo QA.
