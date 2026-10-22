# ZE-03 — Origem dos assets finais

Execução: 2026-10-22. Modo: ferramenta integrada `image_gen`, edição da referência local fornecida pelo usuário. Não foi usada API paga separada, CLI de geração ou upscale.

Entrada visual: `b:/Downloads/Hero ZELO_ Luxo Automotivo Cinematográfico.png`.

## Carro — prompt enviado

Use case: background-extraction. Extract ONLY the central front-facing black supercar from this exact reference image as a genuinely transparent PNG. This is an exact object extraction, not a redesign. Preserve precisely its shape, frontal camera angle, dimensions, paint, white headlight geometry, grille honeycomb, bright roof/windshield reflections, gold lighting and every body contour. Remove the four-ring manufacturer logo centered above grille and tiny red/silver R8 badge inside grille by seamlessly continuing underlying black carbon/grille textures. No manufacturer marks anywhere. No floor, no cast shadow, no reflection, no background, no typography, no UI, no ZELO outline. Keep entire car mirrors to tires, no cropping. The car in original spans x478..1185 and y403..762 in 1672x940. Keep original overall 1672x940 canvas with car in EXACT original position and scale if possible; transparent elsewhere. Preserve image sharpness and photoreal detail. Do not substitute another car or alter its framing.

Saída integrada PNG: 1672×941 com alpha, bbox do conteúdo x200..1474/y180..822. Preparação com Sharp: crop do espaço transparente, WebP qualidade96/alpha100, sem reamostragem; asset final `public/hero/car-reference.webp`, 1275×643. A composição DOM repõe a escala/posição da referência. Reflexo e sombra são camadas CSS independentes.

## Cenário — prompt enviado

Use case: precise-object-edit. Asset: clean background plate for exact reconstruction of this supplied website hero in separate HTML layers. Edit target is this exact reference. Keep original full wide 1672x940 composition and ALL architecture perspective, warm gold illuminated showroom, left window city skyline and tree, right illuminated bottles bar with ZELO AUTO ESTÉTICA sign on right wall, glossy reflective gray tiled floor, side pillars, tiny dark car at far left, original photographic detail and lighting identical. REMOVE only these foreground/UI elements: the main front-facing supercar and its central reflection/shadow, ALL giant outline ZELO typography in center, both slogans and horizontal thin rules across middle, ALL navigation/logo/buttons/search in top header, ALL bottom scroll text/vertical line/chevron. Fill removed regions seamlessly with matching dark showroom walls and gray glossy floor. Preserve original white atmospheric fade at top and bottom, left and right clear architecture and central black ceiling. NO change of camera, geometry, room design, light direction, contrast, sharpness, or crop. Exact clean background extraction/inpainting. Do not invent different scene, no other central car, no central text. High quality crisp photorealistic architectural plate.

Saída integrada PNG: 1672×940. Preparação com Sharp: WebP qualidade95, sem upscale; asset final `public/hero/showroom-reference.webp`. A placa ZELO da parede não foi preservada pela edição e foi recomposta como elemento DOM decorativo. O lettering gigante é SVG vetorial, os slogans são texto real e toda a interface é HTML.

## Limites verificáveis

Os arquivos derivam de edição generativa: preservam composição, perspectiva, luz e estilo; não se alega identidade de todos os pixels nem captura nativa 4K. Há diferenças de microdetalhes no carro, reflexo e interior preenchido. No header, os destinos e nomes das seções reais são preservados; não foram inventadas seções Sobre/Resultados/Depoimentos. Screenshots finais documentam o resultado efetivo.
