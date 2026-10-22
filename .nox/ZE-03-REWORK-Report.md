> HISTÓRICO SUPERADO: aprovação visual anterior substituída pela ZE-03 final de 2026-10-22. Consultar ZE-03-Report.md; não usar este relatório como aceite atual.

# ZE-03-REWORK — Relatório técnico | 2026-10-22

## Escopo: exatamente duas entregas
1. Composição cinematográfica verdadeiramente individualizada: cenário, degradê branco-preto-branco, wordmark ZELO como SVG com animação de escrita, carro separado com fade/scale, slogan em dois spans que entram da esquerda e da direita; header e CTA originais preservados.
2. Ativos 4K: cena e carro 4096x2304 em WebP, carro mobile 1600x900. Carro sem logotipo de fabricante; placa Zelo mantida. Reduced-motion e fallback estático respeitados.

## Intro e persistência
- sessionStorage na chave zelo:hero-intro:v2, por aba/sessão. Após a conclusão do primeiro carregamento, a hero monta integralmente em recargas e no retorno à página, sem replay.
- Animações CSS executam só na primeira entrada; nenhuma cena WebGL foi reincorporada. Acesso por âncoras permanece imediato.

## Validação observada
- Vite build PASS, lint PASS, zero erros; seis warnings legados de CarScene na rota debug que já existiam.
- Playwright 71/71 checks PASS em desktop 1440x900, wide 1920x1080, tablet 768x1024, mobile 390x844 e compacto 360x740, mais reduced-motion.
- Verificados: camadas separadas, animações iniciais distintas, flag de sessão, refresh sem reexecutar, 4K assets carregados, ausência de GLB/Three/Canvas, conteúdo e navegação preservados, sem overflow ou exceções JS.
- Arquivos: public/hero/showroom-4k.webp (300690 bytes), car-4k.webp (491110 bytes), car-mobile.webp (188078 bytes). Hashes em .nox/evidence/ZE-03-RW-asset-manifest.json.
- Origens da geração 1672x941 e upscale 4096x2304 via Lanczos3 e sharpen moderado. A saída tem 4K em dimensões, mas não tem a mesma microtextura de imagem nativamente capturada em 4K.
- Screenshots dos cinco breakpoints e logs guardados em .nox/evidence (arquivos ZE-03-RW-*). Tamanho transferido observado do preview local ~1,665 MB desktop e 1,369 MB mobile (não métricas de campo).

## Reversão e segurança
- Tag ZE-03-REWORK-start-20261022 marca o commit original 0176403. Branch work/ze-audi-redesign. Para voltar, criar branch nova do checkpoint num clone isolado, sem reset hard nem clean sobre arquivos não rastreados.
- src/planos/ (cinco JPEGs), .env, endpoints Instagram e ambiente publicado não foram modificados.
- A imagem achatada anterior continua no histórico para rollback, mas não é solicitada pela landing.
- Não houve push/deploy. ZE-04 permanece QUEUED.

## QA iterativo
- Primeira execução 65/66 PASS: CSS já removia movimentos mas o estado inicial de reduced-motion ainda dizia playing até a configuração ser sincronizada.
- Corrigido uso de matchMedia inicial; nova execução 66/66 PASS.
- Teste ampliado para validar nomes de quatro animações em primeiro acesso: 71/71 PASS.
