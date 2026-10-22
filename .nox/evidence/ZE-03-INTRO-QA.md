# ZE-03 — QA final da intro v4 e logo transparente

**PASS funcional e visual. Total: 210 verificações aprovadas, zero falhas:** 172 na regressão de seis viewports e 38 em frames/vídeo, persistência v4 e condições de carregamento/visibilidade. Evidência gerada em 22/10/2026 no preview local `http://127.0.0.1:4210/`.

Esta correção supera o aceite anterior da placa azul e a implementação da intro v3. O PNG original transparente permanece intacto, sem placa ou reconstrução. A nova chave `zelo:hero-intro:v4` permite que a entrada seja vista mesmo quando `v3` já estava consumida.

## Logo original, sem placa

- O appbar carrega o PNG local original de 640×427, branco/dourado, completo e com transparência. Não existe SVG ou texto substituindo a marca.
- Nos seis tamanhos, o contêiner tem background `rgba(0, 0, 0, 0)`, background-image `none`, bordas 0 e box-shadow `none`. Pseudo-elementos não desenham placa.
- O contraste vem exclusivamente de `drop-shadow` na imagem. Não há brightness, invert, grayscale ou outra alteração das cores originais.
- Limites alpha do artwork conferidos contra o recorte renderizado: nenhuma parte visível cortada. Logo e layout final inspecionados em screenshots reais; o root também informou PASS visual da transparência.

## Intro realmente observada

Os testes gravam WebM e capturam PNGs durante a passagem natural do tempo, sem pausar, avançar ou finalizar animações por API e sem `animations: disabled` no screenshot. A telemetria amostra estilos reais a cada aproximadamente 45 ms. Foram abertos os frames desktop e mobile iniciais/intermediários/finais: carro ausente, carro semitransparente, carro quase completo e composição final são efetivamente diferentes; ZELO revela da esquerda para a direita e os slogans entram de lados opostos.

| Evidência | Desktop | Mobile |
| --- | ---: | ---: |
| Opacidade carro no frame inicial | 0 | 0 |
| Opacidade carro no frame 02 | 0.398 | 0.420 |
| Opacidade carro no frame 03 | 0.904 | 0.909 |
| Opacidade carro final | 1 | 1 |
| Hint no frame 03 | 0 | 0 |
| Hint no frame 04 | 0.463 | 0.488 |
| Hint final | 1 | 1 |
| Tempo amostrado em `playing` | 3249 ms | 3250 ms |

O timer de término é 3300 ms; a amostragem discreta explica o intervalo registrado ligeiramente menor. Tempos reais de cada amostra e screenshot constam no JSON. Cena, logo/header, carro, slogans, ZELO e hint apresentam transições observadas. Na amostragem desktop, carro começa a aparecer aproximadamente aos 700 ms, slogan esquerdo aos 800 ms, direito aos 1008 ms e hint aos 2299 ms; no mobile, aproximadamente 650/760/950/2250 ms. As partes do header têm delays distintos registrados na telemetria, com logo antes das ações.

Vídeos gravados de verdade pelo Playwright:

- `ZE-03-INTRO-desktop-intro.webm` — 1.107.337 bytes.
- `ZE-03-INTRO-mobile-intro.webm` — 659.944 bytes.

PNGs temporais: `ZE-03-INTRO-{desktop,mobile}-frame-{00..06}.png`, além de `*-final.png`. A aprovação visual se baseia na inspeção desses frames reais e das screenshots; não alega reprodução manual integral dos dois arquivos de vídeo.

## Persistência, carregamento e acessibilidade

- Sessão sem v4, com `zelo:hero-intro:v3=complete`: intro v4 executa nos dois viewports gravados.
- Após o término, `zelo:hero-intro:v4=complete`; refresh e navegação de retorno mostram estado `settled`, sem repetir a entrada.
- Cada contexto novo executa sua primeira intro. sessionStorage negado mantém fallback em memória e não causa exceção.
- Carro retido por 1800 ms e fontes por 1400 ms: estado fica `waiting`, sem consumir v4 antes da prontidão; a entrada começa com assets decodificados e fontes carregadas.
- Documento com Visibility API simulada como `hidden`: não consome v4 nem inicia; após `visible` e `visibilitychange`, executa normalmente. Esta é simulação explícita da API, não teste de aba real minimizada pelo sistema operacional.
- Movimento reduzido: sete camadas prontas imediatamente, sem animação e com opacidade 1.

## Regressões preservadas

Screenshots finais de referência 1672×940, desktop 1440×900, ultrawide 2560×1080, tablet 768×1024, mobile 390×844 e compacto 360×740 foram inspecionados. Permanecem contato escuro contínuo sob pneus/chassi, piso corrigido, proporções naturais e carro sem marca de fabricante. No mobile, `MAIS QUE ESTÉTICA.` fica acima de ZELO e `É VALORIZAÇÃO.` abaixo, sem sobreposição e acima do carro.

Todos os seis viewports passaram em: camadas independentes, borda inferior do header ausente, sem overflow horizontal, sem pageerror, sem canvas ou requisição GLB/Three na landing, navegação e menu, busca com acentos/Escape/foco/estado vazio, orçamento e hint. Sete seções existentes, quatro serviços, nove tiles Instagram e links WhatsApp preservados.

Somente `/api/instagram-feed` recebe 503 JSON controlado para estabilizar o fallback. O clique de orçamento é interceptado ao alcançar o destino WhatsApp, sem enviar mensagem. Os testes usam Chromium emulado/DPR 1; não afirmam cobertura de todos os motores ou dispositivos físicos.

## Reprodução e resultado persistido

1. Servir o build atual em `http://127.0.0.1:4210/`.
2. Executar `node .nox/evidence/ZE-03-INTRO-frames.mjs` — 38/38 PASS.
3. Executar `node .nox/evidence/ZE-03-INTRO-qa.mjs` — 172/172 PASS.
4. Inspecionar frames e screenshots; o `visualResult` inicia pendente em nova execução e só deve virar PASS após a inspeção efetiva.

Resultados atuais: `ZE-03-INTRO-frames-results.json` com `result: PASS`; `ZE-03-INTRO-qa-results.json` com `result: PASS` e `visualResult: PASS`. Root confirmou revisão independente dos frames desktop intermediários e da logo transparente antes do fechamento.

Sem edições de produto, estado Nox ou commits pelo QA. Sem deploy, push, publicação, migração ou ZE-04. Encerramento documental e commit pertencem ao Nox.
