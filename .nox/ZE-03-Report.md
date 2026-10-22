# ZE-03 — Hero cinematográfico Audi/Zelo (2026-10-22)

## Entregas (limite de 2)
1. Hero editorial aprovada: carro central; cenário escuro com gradiente branco–preto–branco; ZELO contornado ao fundo; frase fina “Mais que estética. É valorização.” atravessando a imagem; menu real e orçamento preservados; sem textos promocionais adicionais.
2. Ativo responsivo: imagem AVIF leve, animação CSS sutil, adaptação mobile e suporte a reduced-motion. Sem Canvas, modelo 3D nem scroll pin.

## Antes e depois
- Antes: fallback WebP de ZE-02 e hero escura ainda com cópia comercial.
- Depois: layout audiovisual inspirado na Audi, mas com identidade Zelo; h1 semântico acessível para serviço/localização Catalão-GO; header claro, logo com contraste escuro, link de orçamento.
- A arte aprovada foi recortada para eliminar seu menu ilustrativo, preservando carro, lettering e slogan.
- Imagem local AVIF 1200x611 de 12786 bytes. SHA256: 5e0f455f98b0f1d63898af1f856be1ac77ca70c9382ce57d22a43ae1a3e7c243

## Arquivos
- src/features/landing/LandingPage.tsx
- src/features/landing/CinematicHero.css
- public/hero-zelo-approved.avif
- .nox/ZE-03-Report.md, execution-state.json, mapa, Execution-Log.md
- Evidências locais em .nox/evidence

## Qualidade
- npm run build: PASS (TypeScript + Vite)
- npm run lint: PASS (zero erros, seis avisos preexistentes fora da landing)
- Playwright Chromium: 45/45 testes PASS em 1440x900, 1920x1080, 768x1024, 390x844 e 360x740.
- Asset servido, decodificado e exibido nos cinco viewports; menu mobile e navegação desktop, quatro serviços, Instagram, WhatsApp e demais seções intactos.
- Sem Canvas, requisições GLB/Three na landing, overflow horizontal ou erros JS nos cenários.
- reduced-motion elimina animações, com imagem estática acessível.
- Screenshots: evidence/ZE-03-desktop.png, ultrawide.png, tablet.png, mobile.png e compact-mobile.png, com prefixo ZE-03-.
- Warning de chunk grande do Three permanece no build apenas para rotas debug lazy, não carregadas pela landing; redução total do bundle será abordada em ZE-05.
- Métricas capturadas em preview local, não equivalem a Core Web Vitals de produção.

## Integridade
- Tag de rollback ZE-03-start-20261022 aponta para o commit a335543, sem reescrever histórico.
- Produção, Cloudflare, .env, cinco JPEGs não rastreados e backend não alterados. Sem push/deploy.
- Para rollback: criar nova branch da tag em cópia separada; nunca limpar ou dar reset --hard em arquivos de trabalho.

## Fora de escopo
ZE-04: todas as seções abaixo da hero na identidade Audi/Zelo; ZE-05: performance global e remoção dos resíduos 3D. Instagram/SEO/Analytics/Google seguem ZE-06 até ZE-10. Homologação geral ZE-11; publicação autorizada ZE-12.
