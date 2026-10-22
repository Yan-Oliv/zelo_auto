# ZE-03 — QA da correção após rejeição visual

**PASS funcional e visual — 166/166 verificações automáticas, zero falhas.** A aprovação anterior `ZE-03-FINAL-*` foi superada pela rejeição do usuário. Esta evidência valida a correção atual; não usa a antiga exigência de sobreposição das frases no mobile.

Executado em 22/10/2026, em Chromium headless via Playwright, sobre o último build local congelado em `http://127.0.0.1:4210/`. A execução final começou às `2026-10-22T19:11:02.103Z`. Todos os seis screenshots finais, seis recortes de pneus/piso e seis recortes da logo foram abertos e inspecionados. Root/Nox também informou revisão independente PASS das quatro correções solicitadas.

## Resultado das quatro correções

| Correção solicitada | Evidência observada | Resultado |
| --- | --- | --- |
| Carro apoiado no piso | Contato escuro unido às bases dos dois pneus; oclusão contínua sob chassi; ausência de fresta clara ou sombra separada. Conferido nos recortes `*-tire-contact.png` dos seis tamanhos. | PASS visual |
| Cenário/piso mais próximo da referência | Iluminação dourada e arquitetura preservadas; piso central e laterais corrigidos sem escurecer indiscriminadamente o teto. Comparação visual com a imagem original e medidas auxiliares abaixo. | PASS visual |
| Mobile: primeira frase acima, segunda abaixo de ZELO | Frases integralmente legíveis, separadas dos limites da palavra e acima do carro em 390×844 e 360×740. Medidas DOM e screenshots concordam. | PASS |
| Logo real no appbar | O próprio PNG local `zelo_logo_png_optimized`, natural 640×427, sem SVG substituto nem filtro de cor. Branco e dourado originais sobre suporte escuro; arco, palavra e legenda completos, inclusive ultrawide. | PASS visual e teste de limites alpha |

## Separação mobile

Valores em CSS px; o primeiro texto termina antes de começar ZELO, e o segundo começa depois do fim de ZELO.

| Viewport | Fim texto superior | Início ZELO | Fim ZELO | Início texto inferior | Fim texto inferior | Início carro |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 390×844 | 234.64 | 253.19 | 377.56 | 395.56 | 410.77 | 472.63 |
| 360×740 | 206.69 | 222.00 | 336.80 | 354.80 | 369.09 | 414.39 |

## Comparação auxiliar do piso

Luma média de RGB codificado, escala 0–255, regiões alinhadas no screenshot de 1672×940. Valores menores indicam região mais escura. Estas medidas apoiam a inspeção visual; não substituem a observação de contato sob pneus.

| Região | Referência original | Versão rejeitada | Correção final |
| --- | ---: | ---: | ---: |
| Piso lateral esquerdo | 115.13 | 121.89 | 113.59 |
| Piso lateral direito | 97.67 | 106.06 | 98.58 |
| Piso sob o carro | 54.38 | 67.21 | 55.46 |
| Contato pneu esquerdo | 21.82 | 33.23 | 22.48 |
| Contato pneu direito | 17.46 | 34.72 | 21.24 |

O ajuste intermediário que ainda deixava a faixa sob o carro mais clara foi devolvido ao Nox. A versão final reduziu essa faixa de 72.00 para 55.46, próxima da referência 54.38. O cenário final preservou a leitura das superfícies, sem depender de blur global. Dados e coordenadas integrais: `ZE-03-CORRECTION-luminance.json`.

## Regressões validadas

- Seis viewports: referência 1672×940, desktop 1440×900, ultrawide 2560×1080, tablet 768×1024, mobile 390×844 e compacto 360×740.
- Camadas independentes de cenário, carro, quatro paths SVG, textos, overlays, hint e header; proporções naturais preservadas.
- Carro sem logo do fabricante ou badge na grade, confirmado visualmente. Posição/escala de referência conferidas com tolerância de cinco CSS px.
- Primeira abertura realmente entra em `playing`, com animações opostas dos slogans, fade do carro e revelação do ZELO. Screenshots não usam `animations: disabled` para simular término.
- `zelo:hero-intro:v3=complete`; reload e retorno interno mostram hero pronta. Contexto novo reproduz a intro. Reduced motion mostra estado pronto imediatamente.
- sessionStorage negado não provoca exceção; fallback em memória impede repetição durante interações no documento.
- Header sem borda inferior, legível na hero e após navegação; menu mobile, busca com acentos, estado vazio, Escape/foco, CTA orçamento e scroll hint funcionais.
- Sete seções existentes, quatro serviços, nove tiles Instagram e links WhatsApp preservados. Sem overflow horizontal, pageerror, canvas ou requisição GLB/Three na landing em nenhum viewport.
- Logo testada a partir dos pixels alpha do próprio asset: nenhum detalhe visível sai dos limites da imagem renderizada em qualquer viewport. Os recortes reais confirmam o resultado e as cores originais.
- Build e lint PASS, ambos com exitCode 0, conforme `ZE-03-CORRECTION-quality.json`. Permanecem os seis warnings legados fora da hero e o aviso de chunk Three para debug, não requisitado pela landing.

## Reprodução e artefatos

1. Rodar `npm run build` e servir localmente em `http://127.0.0.1:4210/`.
2. Rodar `node .nox/evidence/ZE-03-CORRECTION-qa.mjs`.
3. Rodar `node .nox/evidence/ZE-03-CORRECTION-luminance.mjs`.
4. Inspecionar os seis screenshots e recortes, comparando com `b:/Downloads/Hero ZELO_ Luxo Automotivo Cinematográfico.png`. O script marca `visualResult` pendente até a revisão humana/por agente; os resultados finais atuais registram `visualResult: PASS` após a leitura efetiva das imagens.

Artefatos finais: `ZE-03-CORRECTION-qa-results.json`, `ZE-03-CORRECTION-luminance.json`, `ZE-03-CORRECTION-{reference,desktop,ultrawide,tablet,mobile,compact}.png`, os recortes correspondentes `*-tire-contact.png` e `*-logo.png`, além de `intro.png` e `reduced.png`, todos com o prefixo `ZE-03-CORRECTION-`.

Somente `/api/instagram-feed` recebe resposta controlada 503 JSON para estabilizar o fallback, sem certificar o feed externo. O clique do orçamento é interceptado na saída para WhatsApp: destino existente verificado sem envio de mensagem. Validação de navegador é emulada em Chromium, sem alegação de teste em todos os motores ou aparelhos físicos. A comparação visual não declara igualdade pixel a pixel nem resolução 4K nativa.

QA não alterou código de produto, estado Nox ou commits. Nenhum deploy, publicação, push, migração ou trabalho ZE-04 foi executado. Reconciliação documental, commit e encerramento pertencem ao Nox.
