# ZE-03 — Correção visual final | 2026-10-22

Estado: COMPLETED após a correção solicitada pelo usuário. Aprovação técnica/QA/Nox local, sem atribuir homologação humana ao usuário. A aprovação anterior do commit240d4c2 foi rejeitada e está substituída por esta rodada.

## Correções entregues

- Apoio do carro no piso: sombra de contato dos dois pneus, oclusão sob chassi, sombra projetada conectada e reflexo agora pertencem ao mesmo container do carro. A geometria acompanha sua escala e movimento, sem offsets de viewport independentes. Os recortes reais comprovam ausência da fresta luminosa que dava aspecto de flutuação. Reflexo parte da linha de contato e se dissolve no piso.
- Cenário: ajuste localizado no piso central e saturação discreta, preservando laterais, arquitetura, iluminação dourada e fades. A escuridão vem da integração de sombras/reflexo, sem escurecer uniformemente toda a hero. Evidência de luminância acompanha a inspeção visual; médias de regiões são apoio, não substituem percepção ou garantem identidade pixel a pixel.
- Mobile: MAIS QUE ESTÉTICA. fica acima do ZELO; É VALORIZAÇÃO. fica abaixo do ZELO e antes do carro, com margens próprias, sem sobreposição entre os textos e o lettering. Essa correção explícita substitui o critério anterior de sobreposição mobile.
- Appbar: removeu-se completamente o desenho SVG/texto inventado. Usa a imagem oficial existente src/logos/zelo_logo_png_optimized.png (via siteConfig.mainLogo), com silhueta e subtítulo dourados e ZELO branco. Sem filtro monocromático ou geração de marca. Suporte discreto #0d1b2a segue a identidade fornecida em src/images/identidade_visual_zelo.jpeg. Largura máxima230px e proporção do suporte preservam o conteúdo inteiro em todas as telas, inclusive ultrawide.

As duas entregas da ZE-03 permanecem hero final em camadas e animações/primeiro carregamento. Slogans, SVG, cenário, carro, sombras/reflexo, hint e header continuam elementos independentes. Destinos de navegação e outras seções foram preservados. Nenhuma mudança em ZE-04, backend, credenciais, ambiente ou produção.

## Gates finais

- npm run build: PASS, exit0. Aviso legado de chunk Three grande na rota debug lazy, não requisitada pela landing.
- npm run lint: PASS, exit0; seis warnings legados em MotionSettings/CinematicContext/CarScene fora da hero, detalhados no quality.json.
- QA local Chromium: 166/166 PASS, incluindo viewports1672×940,1440×900,2560×1080,768×1024,390×844 e360×740; intro real, persistência sessão/retorno/reload, reduced-motion, storage indisponível, navegação/busca/menu/orçamento/hint, proporções, conteúdo preservado, sem overflow/JS errors/Canvas/GLB/Three.
- Inspeção visual real: seis screenshots completas mais recortes de contato pneus/piso e logo. QA verificou contato físico aparente, sombra conectada, reflexo, leitura do cenário, logo original inteira e frases mobile separadas. Nox e coordenador raiz abriram screenshots finais antes do fechamento.
- A primeira rodada da correção passou nos testes funcionais, mas a inspeção identificou logo truncada em ultrawide; corrigida. A validação também refinou a faixa de sombra/reflexo central antes do último bundle congelado. O fechamento depende da revisão visual, não apenas da contagem de testes.

## Evidências e limites

Evidências atuais têm prefixo evidence/ZE-03-CORRECTION-: QA.md, qa.mjs, qa-results.json, quality.json, review.json, luminance.mjs/json, reference/desktop/ultrawide/tablet/mobile/compact.png e recortes *-tire-contact.png / *-logo.png. ZE-03-FINAL-* é histórico da aprovação anterior rejeitada, não o aceite atual.

Assets de cena/carro continuam os mesmos WebP locais derivados da referência via image_gen:1672×940 e1275×643, sem upscale, com prompts e hashes em ZE-03-Asset-Prompts.md e evidence/ZE-03-FINAL-asset-manifest.json. Esta correção usa CSS/DOM e a marca oficial já existente; não gerou novo logo nem raster. Não se declara captura4K ou equivalência pixel a pixel. Microdetalhes da edição e nomes das seções reais do menu diferem da imagem conceitual.

API Instagram é interceptada no QA para erro503 controlado; sua integração externa não é certificada nesta sprint. Movimento reduzido mostra a composição pronta. Storage negado usa memória do documento e não consegue persistir após recarga completa sem armazenamento. Testes Chromium emulados não substituem hardware móvel físico.

Branch work/ze-audi-redesign preservada; checkpoint ZE-03-correction-start-20261022 aponta240d4c2. Rollback por checkout isolado/branch nova preservando arquivos locais, sem reset hard/clean. .env e src/planos/ não rastreado preservados. Commit final registrado no Git e no contexto durável após criação. Sem deploy ou push; ZE-04 permanece QUEUED.
