# Contratos de sprints — Zelo Autoestética

Visual aprovado: Audi/AURA-MOTION + identidade Zelo (branco, dourado). Avaliações exclusivamente Google. Máximo de **2 entregas** por sprint. Produção não é alterada antes de homologação e aprovação explícita.

## ZE-01 — Segurança e baseline

- **Entregas (2):** 1) Checkpoint recuperável; 2) Baseline funcional, técnico e de produção.
- **Estado atual:** Sem checkpoint formal nem métricas de referência; cinco JPEG não rastreados.
- **Estado esperado:** Checkpoint reversível e baseline técnico/funcional documentado.
- **Critério de aceite:** Tag e dois ZIPs verificáveis; branch isolada; build/lint e navegação documentados.
- **Melhor caminho:** Git tag/archive, cópia de JPEG, QA local e relatório sem segredos.

## ZE-02 — Desacoplamento do 3D

- **Entregas (2):** 1) Remover cena 3D e loading gate; 2) Eliminar pin de 6120 px e acoplamentos.
- **Estado atual:** LandingPage monta CarScene e bloqueia UI aguardando renderer WebGL.
- **Estado esperado:** Navegação e hero independentes de modelo 3D.
- **Critério de aceite:** Nenhum WebGL obrigatório; navegação, serviços e CTA preservados.
- **Melhor caminho:** Extrair UI dos estados 3D, retirar Canvas e reduzir dependências do bundle.

## ZE-03 — Hero cinematográfico Audi/Zelo

- **Entregas (2):** 1) Composição cinematográfica minimalista aprovada: carro central, gradiente branco–preto–branco, ZELO contornado e frase fina única, preservando o menu e o acesso ao orçamento; 2) Ativo local leve e comportamento responsivo, com transições sutis e movimento reduzido.
- **Estado atual:** ZE-02 retirou a cena WebGL e colocou uma imagem de fallback temporária.
- **Estado esperado:** Primeira dobra com o visual Audi/Zelo aprovado, sem excesso de textos e sem WebGL.
- **Critério de aceite:** Imagem real carregada, contraste adequado, desktop/mobile sem overflow, header funcional e SEO acessível; build/lint e regressão sem falhas.
- **Melhor caminho:** Usar AVIF otimizado a partir da referência visual aprovada, React/CSS simples e testes em diferentes viewports; sem reinstalar renderização 3D.

## ZE-04 — Reestruturação visual

- **Entregas (2):** 1) Redesenhar serviços e seções; 2) Modernizar cabeçalho, parceiros, contato e rodapé.
- **Estado atual:** Seções escuras acopladas à história 3D.
- **Estado esperado:** Landing coesa Audi+Zelo e comercialmente objetiva.
- **Critério de aceite:** Cards, menu, seções e rodapé aprovados visualmente em mobile/desktop.
- **Melhor caminho:** Tokens de design, componentes reutilizáveis e regressão de links.

## ZE-05 — Performance e acessibilidade

- **Entregas (2):** 1) Reduzir JS/assets iniciais; 2) Validar performance mobile e acessibilidade.
- **Estado atual:** Bundle three ~1MB e fontes pesadas; rolagem longa.
- **Estado esperado:** Carga leve e acessível com diferença mensurável para baseline.
- **Critério de aceite:** Lighthouse e E2E sem regressão; bundle 3D ausente na rota inicial.
- **Melhor caminho:** Code splitting/remoção código 3D, imagens responsivas, fontes otimizadas e reduced-motion.

## ZE-06 — Instagram funcional

- **Entregas (2):** 1) Corrigir backend e credenciais de integração; 2) Exibir feed autêntico e fallback confiável.
- **Estado atual:** Pages Function /api/instagram-feed retorna HTTP 400; fallback usa imagens estáticas.
- **Estado esperado:** Posts reais quando permissões oficiais funcionarem e fallback honesto quando indisponível.
- **Critério de aceite:** Permalinks reais, API segura, tokens somente servidor e erros observáveis.
- **Melhor caminho:** Revisar Graph API, Cloudflare Secrets e hook do React com cache/timeout.

## ZE-07 — SEO técnico local

- **Entregas (2):** 1) Corrigir URLs e dados estruturados; 2) Reforçar conteúdo local e metadados.
- **Estado atual:** Canonical/robots/sitemap/schema apontam para pages.dev.
- **Estado esperado:** Domínio zelo.omnyatech.com.br único canônico e texto para Catalão.
- **Critério de aceite:** Sitemap/schema/og/canonical coerentes, verificação indexável.
- **Melhor caminho:** Revisar head, JSON-LD e Search Console; evitar duplicidade pages.dev.

## ZE-08 — Google e mensuração

- **Entregas (2):** 1) Instalar GA4 e eventos de conversão; 2) Preparar/Search Console e checklist local.
- **Estado atual:** GA4 G-E9SKGKCQXX ainda ausente em produção.
- **Estado esperado:** Mensuração de visitantes, orçamento e contatos; SEO acompanhado.
- **Critério de aceite:** GA4 e eventos confirmados, sitemap encaminhado a Search Console.
- **Melhor caminho:** Tag e eventos de conversão, validação de privacidade e Perfil da Empresa.

## ZE-09 — Reputação Google

- **Entregas (2):** 1) Exibir avaliações Google autorizadas; 2) Oferecer botão de avaliação oficial.
- **Estado atual:** Sem seção Google Reviews.
- **Estado esperado:** Avaliações reais com fonte atribuída e CTA para avaliar no Google.
- **Critério de aceite:** Dados autênticos quando API permite; link oficial abre fluxo correto.
- **Melhor caminho:** Consultar APIs Google compatíveis e configuração Perfil da Empresa.

## ZE-10 — Confiabilidade da reputação Google

- **Entregas (2):** 1) Tratar falhas/indisponibilidade Google; 2) Validar mobile, teclado e links Google.
- **Estado atual:** Sem componente de reputação ou estados de erro.
- **Estado esperado:** Reviews Google com estados vazios e UX acessível.
- **Critério de aceite:** Nenhum review fabricado; acessibilidade e links validados.
- **Melhor caminho:** Fallback sem dados próprios, sem KV/SQL/GitHub, testes de error states.

## ZE-11 — Homologação local

- **Entregas (2):** 1) QA regressivo desktop/mobile; 2) Homologação visual e funcional.
- **Estado atual:** Rework ainda não implementado.
- **Estado esperado:** Candidato pronto para aprovação explícita.
- **Critério de aceite:** Build, lint, E2E e Lighthouse aprovados; revisão visual humana realizada.
- **Melhor caminho:** Preview e testes Playwright, correção e repetição até aceite.

## ZE-12 — Publicação controlada

- **Entregas (2):** 1) Deploy aprovado e rastreável; 2) Validação pós-publicação e rollback documentado.
- **Estado atual:** Produção permanece antiga.
- **Estado esperado:** Cloudflare Pages atualizado após autorização.
- **Critério de aceite:** Site real, API, GA4, sitemap, links e rollback verificados.
- **Melhor caminho:** Deploy rastreável somente com aprovação, smoke test e reversão preparada.
