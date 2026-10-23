# ZE-05 — Performance e acessibilidade

**Estado:** COMPLETED tecnicamente em 2026-10-23, com exatamente duas entregas e limites medidos. A revisão técnica de screenshots por Nox/root foi aprovada; aprovação visual humana do proprietário não é reivindicada. **Branch:** `work/ze-audi-redesign`. **Baseline:** `3271073` (ZE-04). **Produção:** intacta; apenas preview local. Nenhum push, deploy ou início de ZE-06.

## Entregas

1. **JavaScript e assets iniciais:** rotas de debug separadas em chunks lazy; imagens responsivas WebP e carregamento próximo à viewport; fontes Montserrat em WOFF2 subset latino; preload concentrado nos assets críticos; chunks e requests auditados. Three ainda aparece no build (~1.025 MB) por ser usado pelas páginas debug, mas não é requisitado pela landing, junto com qualquer GLB/WebGL.
2. **Performance mobile e acessibilidade:** Lighthouse repetido em três amostras comparáveis; CDP cold/warm; regressão funcional/visual em seis viewports; teclado, touch, reduced motion, sessão, storage bloqueado, menu, comparador e mapa; varredura axe em página/seções/painéis.

## Métricas Lighthouse

Lighthouse 13.5.0 / Chrome 149.0.7827.55; Vite production preview local; cada amostra em novo contexto cold, sem interceptar APIs. Mobile: 390×844, RTT 150 ms, 1638.4 Kbit/s, CPU 4×. Desktop: 1440×900, RTT 40 ms, 10240 Kbit/s, CPU 1×. Os valores de score/tempo/bytes abaixo são medianas de três amostras; tamanhos são transferidos observados via Network, não tamanho bruto.

| Métrica | Baseline mobile | ZE-05 mobile | Baseline desktop | ZE-05 desktop |
|---|---:|---:|---:|---:|
| Performance | 60 | 89 | 90 | 99 |
| Acessibilidade | 96 | 100 | 96 | 100 |
| FCP | 6308 ms | 1956 ms | 1119 ms | 446 ms |
| LCP | 11709 ms | 3531 ms | 1785 ms | 865 ms |
| CLS | 0 | 0 | 0.00012 | 0 |
| TBT | 20 ms | 32 ms | 0 ms | 0 ms |
| JavaScript transferido | 127215 B | 116133 B | 574814 B | 116133 B |
| Imagens transferidas | 2161953 B | 435232 B | 2635103 B | 577458 B |
| Fontes transferidas | 969392 B | 78596 B | 969392 B | 78596 B |
| Transferência total | 3277714 B | 649512 B | 4204986 B | 791738 B |
| Requests Three/GLB na landing | 0 | 0 | 0 | 0 |

Mobile teve ganho expressivo: transferência total caiu cerca de 80%, FCP 69% e LCP 70%. A meta mobile de Performance ≥90 e LCP ≤2.5 s **não foi atingida**. Accessibility, CLS e TBT atingiram as metas. Nenhum INP de campo é alegado.

### Limite de LCP mobile

O candidato LCP cold é `img.zelo-hero-car-body`. O recurso responsivo é declarado no documento, tem `fetchpriority=high` e não é lazy; a auditoria não identificou atraso de descoberta. No CDP cold com CPU/rede mobile emulados, o primeiro LCP é a carroceria após a hero permanecer em `waiting` enquanto backdrop, carro, logo e `document.fonts.ready` concluem; então ocorre a intro de primeira visita que mantém a sequência cinematográfica e `zelo:hero-intro:v4`. Depois que a sessão consome a intro, o load warm registra LCP de 732 ms. Os setups Lighthouse simulado e CDP cold têm resultados diferentes, por isso são apresentados separadamente. Não encurtar ou remover a animação para fabricar a meta: a fidelidade cinematográfica é um requisito vinculante. Uma futura exploração deve medir separadamente a prontidão das fontes sem alterar o visual ou a sequência.

| CDP Chromium 149 | Cold FCP | Cold LCP | Cold transferido | Warm LCP | Warm transferido |
|---|---:|---:|---:|---:|---:|
| 390×844, RTT150 / 1.638 Kbit/s / CPU4× | 2348 ms | 6304 ms | 647792 B | 732 ms | 3856 B |
| 1440×900, RTT40 / 10.240 Kbit/s / CPU1× | 520 ms | 3956 ms | 790114 B | 244 ms | 4756 B |

Baseline CDP cold era 15940 ms / 2451895 B em mobile e 5248 ms / 3216545 B em desktop. Esses resultados também confirmam zero request de Three/GLB na landing. Os resultados CDP são navegações reais emulados com cache/sessão warm na segunda visita, não substituem a mediana Lighthouse.

## Acessibilidade, funcionalidade e visual

- Regressão Playwright final: **307/307 PASS, 0 FAIL**, nos tamanhos 1920×1080, 1440×900, 1366×768, 768×1024, 390×844 e 360×740. Cobriu overflow, navegação, busca/menu/foco, cards, comparadores por teclado/mouse/touch, timeline, links/estados reais, mapa, sessão v4, reduced motion, erros de runtime, zero canvas e requests 3D ausentes.
- Resiliência de storage/reduced motion: 54/54 PASS. Axe: 25 scans, zero violações do produto; zero crítica/séria. Seis nós moderate `region` vêm exclusivamente de conteúdo dentro do iframe Google Maps; 34 checks incompletos permanecem registrados para julgamento manual e não são contados como aprovados.
- Nox/root revisou as capturas desktop/mobile, incluindo hero, serviços e localização após scroll: preservação visual técnica PASS. Full-page pode mostrar o mapa escuro antes do iframe lazy entrar no viewport; os recortes pós-scroll mostram o mapa funcional. Sem aprovação visual humana do proprietário.
- `prefers-reduced-motion`, controle de foco/teclado e falha de Storage foram exercitados sem desabilitar a experiência de usuários sem preferência reduzida. `zelo:hero-intro:v4` preservada.
- Build final PASS (2750 módulos). Lint exit 0, com seis warnings preexistentes em MotionSettings/CinematicContext/CarScene. Aviso de chunk >500 KB refere-se ao Three isolado para debug; não ao request inicial da landing.

## Referências e evidências

Comparações e imagens: `.nox/evidence/ZE-05-baseline-{1920,1440,1366,768,390,360}-*.png` e `.nox/evidence/ZE-05-{1920,1440,1366,768,390,360}-*.png`; localização pós-scroll: `ZE-05-1440-location.png`, `ZE-05-390-location.png`, `ZE-05-360-location.png`. Referências `new_interface/1.png` a `5.png` e `src/planos/` permaneceram intactas e não rastreadas.

- Lighthouse: `ZE-05-baseline-benchmark.json`, `ZE-05-final-benchmark.json`, relatórios `ZE-05-final-{mobile,desktop}-{1..3}.{json,html}`.
- CDP: `ZE-05-baseline-cdp.json`, `ZE-05-final-cdp.json`.
- Acessibilidade: `ZE-05-axe-results.json`, `ZE-05-axe-classified.json`; QA funcional: `ZE-05-qa.json`; storage/reduced motion: `ZE-05-resilience.json`.
- Build/lint: `ZE-05-build-final.log`, `ZE-05-lint-final.log`.

## Segurança, rollback e próximo passo

Nenhum segredo, `.env`, dado comercial, API de Instagram, reviews Google, produção ou migração foi alterado. `new_interface/` e `src/planos/` não serão incluídos no commit. O rollback local é `git revert <commit ZE-05>` após revisão; sem publicar/push.

ZE-06 Instagram funcional continua **QUEUED** e fora do objetivo ativo. A ideia de medir possível contribuição de `document.fonts.ready` na primeira entrada, preservando animação e aparência, pode ser avaliada como backlog futuro e requer autorização própria.
