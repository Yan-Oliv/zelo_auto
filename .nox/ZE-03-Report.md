# ZE-03 — Relatório final | 2026-10-22

Estado: COMPLETED. Aprovação técnica local Nox/QA/review; não se atribui homologação humana ao usuário. ZE-04 permanece QUEUED e não foi iniciada. Sem deploy ou push.

## Entregas concluídas

1. Hero final reconstruída com a imagem anexada como fonte visual: showroom derivado da referência, carro frontal preto sem anéis nem badge R8, escala e enquadramento correspondentes em1672×940, ZELO contornado vetorial, slogans legíveis branco/dourado, fades claros, assinatura na parede, sombra e reflexo do carro. Background, carro, SVG, frases, hint e header são elementos independentes.
2. Intro cinematográfica na primeira abertura: frases entram de lados opostos, carro faz fade com scale/deslocamento discretos, SVG é revelado por máscara. Inicia após decode dos assets. sessionStorage zelo:hero-intro:v3 é consumida no início da intro para que saída precoce/retorno não provoquem replay. Fallback em memória para storage bloqueado. Reduced-motion mostra a composição pronta.

Header com orçamento/calendário, busca circular funcional por seções/serviços locais, menu e destinos reais preservados. Contraste do header depende de observer dedicado da hero, evitando o defeito em seções mobile altas. Não há linha separando header e hero.

## Qualidade e fidelidade verificadas

Assets WebP: cenário1672×940/189448 bytes, carro alpha1275×643/258408 bytes (total447856 bytes). Edição integrada image_gen a partir da referência, crop do alpha e conversão Sharp, sem upscale nem alegação4K. Prompts em ZE-03-Asset-Prompts.md e hashes em evidence/ZE-03-FINAL-asset-manifest.json.

Comparação visual real em1672×940 confirma carro frontal na escala e posição de referência, showroom quente, ZELO atrás do carro, slogans nos lados e hint inferior. Ultrawide preserva proporções com escala uniforme e fades adicionais; tablet/mobile adaptam o recorte sem overflow. Foram inspecionadas screenshots reais por QA e Nox, com segunda leitura do coordenador raiz.

Limite declarado: reconstrução em camadas visualmente próxima, sem equivalência pixel a pixel. Há microdiferenças nos detalhes do carro, reflexo e preenchimento do interior por edição generativa. Os nomes/destinos das seções reais do menu foram preservados (Produtos/Instagram/Localização), em vez de inventar Sobre/Resultados/Depoimentos ausentes no projeto. Não se criou conteúdo comercial fora da ZE-03.

## Gates e correções de QA

- npm run build: PASS, exit0. Aviso de chunk Three maior que500kB permanece na rota debug lazy; não é requisitado pela landing.
- npm run lint: PASS, exit0. Seis warnings legados fora da hero: exports de MotionSettings/CinematicContext e dependências useMemo de CarScene.
- Playwright Chromium local: 144/144 PASS. Viewports1672×940,1440×900,2560×1080,768×1024,390×844 e360×740; reduced-motion e storage bloqueado.
- Verificados intro/keyframes, fades/reveal, persistência em reload/retorno, nova sessão, proporções car/SVG, overlap mobile, legibilidade/fades, ausência de overflow/Canvas/GLB/Three e exceções JS, menu/busca/CTA/hint e seções preservadas.
- Iterações reais:126/128 no primeiro QA (contraste do header em2 viewports mobile); corrigido com observer dedicado. Review encontrou deformação ultrawide; corrigida com aspect-ratio e cover uniforme. QA visual adicional encontrou perda de overlap mobile e corte do fade ultrawide; ambos corrigidos e revalidados. Última rodada do bundle congelado está integralmente aprovada.
- O endpoint /api/instagram-feed foi interceptado no teste para erro503 controlado; a integração oficial não é homologada nesta sprint. Mapas e links existentes continuam presentes. Não se alterou backend, credenciais, dados ou configuração de produção.

## Evidências e reversão

evidence/ZE-03-FINAL-qa.mjs e -qa-results.json; -quality.json; -reference.png; -desktop.png; -ultrawide.png; -tablet.png; -mobile.png; -compact.png; -intro.png; -reduced.png; -review.json; -asset-manifest.json.

Branch preservada work/ze-audi-redesign. Checkpoint anotado ZE-03-final-start-20261022 aponta9a557ef. Para rollback, criar branch nova a partir desse checkpoint em checkout isolado, preservando alterações do usuário; não usar reset hard/clean. src/planos/ não rastreado e .env foram preservados. Registro do commit final em Git e no log durável independente após commit.
