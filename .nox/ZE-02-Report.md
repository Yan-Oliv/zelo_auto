# ZE-02 — Relatório de desacoplamento 3D (2026-10-22)

## Entregas
1. Removidos Canvas 3D, loading gate e dependência da timeline na landing.
2. Removido pin de rolagem de 6120 pixels; navegação independente da cena.

## Estado inicial e resultado
Anterior: LandingPage controlada pela renderização CarScene, texto do hero atrelado ao progresso 3D e preloading GLB no HTML. Estado novo: hero imediato com imagem 2D WebP versionada de 19714 bytes, serviços e contato preservados.

## Arquivos modificados
- src/features/landing/LandingPage.tsx: remove CarScene, loading gate, useCinematicTimeline e estados 3D; restaura acesso imediato a todos os elementos e substitui pelo fallback estático 2D.
- src/main.tsx: remove CinematicProvider obrigatório da landing.
- index.html: remove preload do modelo GLB.
- public/hero-static-fallback.webp: imagem WebP local com 19714 bytes, derivada de PNG antes ignorado pelo Git.

## Gates de qualidade
- Build e lint exit 0; seis warnings antigos do CarScene isolado, sem erros novos.
- Playwright 20/20 PASS em 1440x900 e 390x844: seções, navbar, menu mobile, CTA WhatsApp, serviços, Instagram, mapa, ausência de erros JS e de overflow.
- WebGL Canvas 0 na landing; nenhuma requisição GLB/Three.js nos dois viewports.
- Rotas de debug 3D continuam disponíveis e separadas, smoke 2/2 PASS.
- Desktop: hero 900 px; página 5992 px; transferência observada 910 KiB.
- Mobile: hero 776 px; página 6497 px; transferência observada 910 KiB.
- Na ZE-01 as respectivas alturas totais eram 12112 e 12617 px.
- Medidas de transferência são de Chromium/preview local, não Core Web Vitals de campo ou produção.

## Segurança e rollback
- Tag de início ZE-02-start-20261022 aponta ao commit de conclusão da ZE-01.
- Nenhum arquivo .env, cinco JPEG não rastreados, conteúdo de produção ou Cloudflare alterados.
- Fazer rollback criando outra branch da tag de início, sem git reset --hard ou limpeza de arquivos locais.
- Código 3D e bundle Three ainda existem para as duas rotas de debug, mas NÃO são carregados na landing. Remoção física e racionalização futura pertencem a ZE-05.

## Pendências corretamente fora desta sprint
- ZE-03: hero cinematográfico Audi/Zelo com base branca e dourado; a imagem atual é apenas fallback transitório.
- ZE-06: recuperação de posts reais do Instagram (endpoint 400 no baseline).
- ZE-07/08: SEO e analytics.
