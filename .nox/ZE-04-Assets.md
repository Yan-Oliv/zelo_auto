# ZE-04 — Assets e autenticidade

Data: 2026-10-22. Ferramenta: `image_gen` integrada, editando as referências `new_interface/2.png`, `3.png` e `5.png`. Os PNGs completos não são exibidos como interface: o código reconstrói títulos, cards, timeline, comparadores, reviews, mapa e contatos como elementos reais.

## Prompts finais utilizados

1. **Serviços / referência2:** extrair/reconstruir quatro fotografias em grade2×2 sem espaços: carro preto sendo lavado com espuma, cockpit limpo, couro perfurado com costura e carpete sob pedais. Reproduzir fotografia automotiva quente/dourada, enquadramento dos cards e textura nítida. Remover toda UI, textos, gradientes, números, logotipos de fabricante e inscrições. Somente fotografias editoriais ilustrativas.
2. **Detalhamento / referência3:** extrair/reconstruir fotografia de mão com luva preta passando microfibra sobre capô preto, farol em primeiro plano inferior direito, reflexos dourados e showroom escuro. Tela1672×940, mão/carro à direita e ambiente à esquerda. Remover textos, ZELO gigante, timeline, cards, ícones, fades da UI e fabricante. Não apresentar como documento de atendimento real.
3. **Produtos / referência3:** extrair/reconstruir fotografia de quatro frascos genéricos e pote preto, toalhas de microfibra e aplicador sobre bancada escura, luz LED dourada ao fundo, composição central/direita. Sem marca, texto legível, garantias ou certificações. Visual editorial, sem alegar estoque real desses frascos.
4. **Localização / referência5:** reconstruir plate fotográfico limpo com traseira3/4 de esportivo preto no quarto direito da tela, roda/lanterna vermelha, showroom e piso refletivo dourado, espaço negativo escuro à esquerda. Preservar composição/perspectiva. Remover mapa, endereço, footer, botões, ZELO, ícones e fabricante. Não representar como foto da sede real.
5. **Etapas / referência3:** grade2×2 de fotografias sem UI: técnico com luz LED examinando painel; mãos com politriz; traseira de carro limpo com lanterna vermelha; microfibra sobre capô. Iluminação coerente preto/dourado, sem logos/textos e sem alegar registro documental da equipe.
6. **Comparações / referência2:** grade2colunas×3linhas. Cada linha mostra mesma superfície/câmera/enquadramento, antes à esquerda e depois à direita: capô sujo/manchado versus limpo; banco perfurado com poeira versus limpo; carpete com resíduos versus limpo. Sem texto, UI ou fabricante. Pares ilustrativos destinados a demonstrar o controle interativo, nunca prova de atendimento real da Zelo.

## Arquivos incorporados

Preparação: crop apenas das fotografias geradas em contact sheets, sem incorporar widgets/UI da referência; conversão WebP qualidade91, sem upscale. Os plates grandes mantêm dimensão de origem aproximadamente1672×940; cards834×468 e pares834×311. Caminhos sob `public/editorial/`: `service-wash`, `service-interior`, `service-seats`, `service-carpet`, `process-detail`, `process-evaluation`, `process-execution`, `process-delivery`, `quality-products`, `location-scene` e `comparison-{paint,seats,carpet}-{before,after}.webp`. Manifesto SHA256/dimensões/tamanho em `.nox/evidence/ZE-04-asset-manifest.json`.

As seções marcam fotografias como ilustrativas, os comparadores dizem que não são resultado real da Zelo e o fallback Instagram não se apresenta como publicação atual. Marca oficial, parceiros, produtos e cadastro existente foram reutilizados. Não se inventou sede, avaliação, nota, seguidor, transformação, garantia ou certificação.

## Fonte local

O arquivo existente `EurostileExtendedBlack.ttf` foi diagnosticado como inválido (cmap truncado e rejeição OTS no Chromium). A tentativa gratuita local de reempacotamento não criou uma fonte utilizável. A requisição inválida foi retirada; foram mantidas as fontes válidas do projeto e proporções geométricas em CSS nas seções novas. O arquivo original e a hero foram preservados. Não foi baixada fonte alternativa sem origem/licença e nenhuma dependência entrou no produto. Essa diferença tipográfica está declarada no relatório visual.
