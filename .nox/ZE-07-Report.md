# ZE-07 — SEO técnico local

**Estado:** concluída tecnicamente em 2026-10-23. **Branch:** `work/ze-audi-redesign`. **Checkpoint:** `ZE-07-start-20261023` (`33b5fc9`). **Produção:** não publicada nem modificada.

ZE-06 foi mantida como COMPLETED no escopo aprovado pelo proprietário: feed real do Instagram validado localmente. A resposta pública anterior com HTTP 400/OAuthException 190 permanece apenas como observação operacional; ZE-06 não foi reaberta. Essa sprint não alterou o backend Instagram, não iniciou ZE-08 e não publicou mudanças.

## Entrega 1 — URLs canônicas, indexação e dados estruturados

- Canonical, `og:url`, JSON-LD `url` e `@id` agora usam `https://zelo.omnyatech.com.br/`.
- `public/sitemap.xml` lista somente a home canônica; removeu `lastmod` sem fonte confiável, `changefreq` e `priority`.
- `public/robots.txt` permite rastreamento e anuncia o sitemap no domínio oficial. Não bloqueia a landing nem tenta esconder duplicidade via robots.
- JSON-LD preserva `AutoWash`, com identidade, endereço, telefone, Instagram, horários reais e os quatro serviços publicados em `site.ts`. Sem avaliações ou coordenadas inventadas.
- As rotas `/debug-model` e `/debug-crossfade` recebem `noindex, nofollow, noarchive` via meta no carregamento e regras `X-Robots-Tag` em `public/_headers` para Pages.
- Auditoria pública somente leitura anterior às mudanças: domínio oficial e `pages.dev` respondiam 200 sem redirecionar; ambas serviam a mesma landing. O HTML público ainda anunciava `pages.dev` como canonical. Nenhuma regra Cloudflare/DNS foi alterada. O HTML publicado continuará antigo até uma publicação futura, fora desta autorização.

## Entrega 2 — SEO local e metadados

- Título: `Estética Automotiva em Catalão–GO | Zelo`.
- Description, Open Graph e Twitter/X Card descrevem os serviços confirmados em Catalão–GO; todos os URLs sociais usam domínio oficial.
- Criada imagem OG 1200×630 derivada dos assets aprovados de showroom/carro: `public/og/zelo-estetica-automotiva-catalao.jpg` (aprox. 113 KiB). Artefato gerado por `.nox/evidence/ZE-07/generate-og.mjs`.
- O conteúdo da localização agora cita Catalão–GO, lavagem completa, limpeza interna e higienização de bancos e carpetes, conforme o catálogo existente. Hierarquia semântica existente foi preservada (um H1 e headings de seção); nenhum redesign ocorreu.

## QA e evidências

- `npm run build`: PASS. O bundler mantém aviso conhecido de chunk Three (~1.025 MB), carregado pelas rotas de diagnóstico, não pela landing.
- `npm run lint`: código de saída 0; seis warnings existentes fora das alterações desta sprint, nos contextos cinematic/motion (`only-export-components` e dependências de hooks em `CarScene.tsx`).
- `qa.mjs`: PASS para canonical/OG, JSON-LD, sitemap e robots; âncora principal de navegação; ambas rotas debug com noindex; zero erros de browser, zero imagens quebradas e zero overflow nos viewports 1920×1080, 1440×900, 1366×768, 768×1024, 390×844 e 360×740. Capturas completas percorreram a página para acionar conteúdo lazy.
- Lighthouse no preview do build local: desktop 99 performance, 100 accessibility, 100 best practices e 100 SEO; mobile repetido 84/100 performance, 100/100 accessibility, 100/100 best practices e 100/100 SEO, CLS 0 e TBT 29–30 ms. Comparação isolada no mesmo commit pré-SEO marcou mobile 83 e LCP 4360 ms; ZE-07 marcou 84 e LCP 4283–4284 ms. Portanto, a alteração não regrediu o baseline imediatamente anterior. A comparação histórica ZE-05 (89, LCP 3531 ms) usa configuração 390×844 documentada; a causa da diferença entre o baseline ZE-05 e o estado pré-SEO atual não foi atribuída a esta sprint, que não alterou a hero. Mantém-se o limite já documentado pela ZE-05 de que o alvo mobile ≥90 / LCP ≤2,5 s não foi atingido.
- Os relatórios Lighthouse usam Chromium/Lighthouse local sob rede/CPU simuladas; não representam métricas de campo.
- Evidências visuais: `evidence/ZE-07/{ultrawide,desktop,notebook,tablet,mobile,mobile-compact}.png`. Testes e dados: `qa-results.json`, `qa.mjs`, `lighthouse-*-production-build*.json` e `lighthouse-pre-seo-baseline.json`.
- `git diff --check`: PASS. Auditoria de secrets sem leitura de `.env`; nenhum segredo foi adicionado.

## Indexação e dependências futuras

O build e os arquivos locais estão preparados para rastreamento. As respostas públicas ainda refletem a versão publicada antes desta sprint porque não houve deploy. Após publicação futura, validar redirects/canonical/Sitemap e páginas de diagnóstico por HTTP e então usar URL Inspection/Sitemaps no Search Console; a ZE-07 não afirma indexação nem posicionamento Google. Não foi possível validar regras `_headers` contra Pages sem publicar; o meta noindex foi validado em ambas rotas na aplicação local.

## Git e rollback

- Rollback: reverter o commit ZE-07; o checkpoint `ZE-07-start-20261023` preserva o estado pré-sprint.
- Commit da sprint registrado na resposta final; checkpoint `ZE-07-start-20261023` mantém o rollback pré-sprint. Nenhum push, deploy, alteração de produção ou execução de ZE-08.
