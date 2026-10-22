# ZE-01 — Baseline técnico e checkpoint (2026-10-22)

## Objetivo e duas entregas
1. Preservar o estado anterior à refatoração de forma recuperável.
2. Registrar referências técnicas, operacionais e funcionais para ZE-02..ZE-12.

## Checkpoint e isolamento
- HEAD original: `b575ed2f42c0fa1a65c314a67d75644cf4ab640d` (main).
- Tag anotada `ZE-01-baseline-20261022` aponta para HEAD original.
- Branch de trabalho local: `work/ze-audi-redesign`; nenhuma publicação/push.
- ZIP do Git HEAD com 375 arquivos rastreados e 42 entradas de diretório, SHA256 `C6776A619BC0D94D854FF1D63A5A58AE5156F7CB6309DD7F2C34A4F838EC4DC5`.
- ZIP separado com 5 JPEGs originalmente não rastreados em `src/planos`, SHA256 `0A0F32792CBF6BB2028CAC0E8717FE48718FFD48C5FC49FAA3C76A102C96DBF9`.
- ZIPs ficam em `.nox/checkpoints/` e são ignorados pelo Git. `.env` segue intacto no local, não copiado e não incluído nos ZIPs.
- Integridade validada em `evidence/ZE-01-restore-verification.json`: 375/375 arquivos, Git blob do `package.json` idêntico, tag e HEAD original coincidem.
- A comparação de bytes de arquivo de checkout com ZIP pode diferir por filtros do Git; a validação correta compara blob Git.

## QA local — antes de mudanças
- `npm run build`: exit code **0**, ~15,68s; alerta de chunk >500KB.
- `npm run lint`: exit code **0**, 0 erros e **6 avisos**; não corrigidos em ZE-01.
- Produção (consulta somente leitura): homepage HTTP 200; `/api/instagram-feed` HTTP 400; tag GA4 `G-E9SKGKCQXX` ausente; canonical e sitemap apontam para pages.dev; modelo GLB possui preload.
- Bundle após build: `three-*.js` 1.025.417 bytes, `index-*.js` 224.946, `react-*.js` 184.929, `motion-*.js` 132.761; Montserrat Bold e SemiBold ~649KB somadas.
- Playwright (Chromium headless em preview local): navegação desktop 1440x900 e mobile 390x844, sete seções presentes, quatro cards de serviços, nove tiles Instagram (podem ser estáticos), três links WhatsApp, Canvas WebGL 3D e GLB HTTP 200 em ambos.
- O roteiro mobile abriu o menu e encontrou botão de fechamento. Captura mobile gerada; screenshot desktop falhou por timeout 10s sob WebGL; isto é achado do baseline, **não regressão introduzida pela sprint**.
- Medições de `performance` do preview local e dados dos navegadores estão em `evidence/ZE-01-browser-results.json`. Não equivalem a Field Data/PageSpeed, nem devem ser usadas isoladamente para estimar Core Web Vitals.

## Pontos conhecidos para próximas sprints
- CarScene WebGL e gate visual tornam experiência dependente da GPU; ZE-02/03.
- ScrollTrigger pin 6.120px e transições; ZE-02.
- Bundle grande, fonts e assets; ZE-05.
- Instagram HTTP 400 e fallback não real; ZE-06.
- URLs canônicas divergentes e GA4 ausente; ZE-07/08.
- Avaliações somente Google, sem persistência própria; ZE-09/10.

## Segurança / rollback
- Nada foi apagado do projeto e nenhum arquivo funcional foi editado.
- Não commitar ZIPs, screenshots, logs ou segredos; `.nox/.gitignore` protege `checkpoints/` e `evidence/`.
- Voltar ao original **sem destruir trabalho**: criar uma nova branch no commit/taga `ZE-01-baseline-20261022` ou extrair `ZE-01-tracked-source-20261022.zip` em pasta nova.
- Para restaurar arquivos não rastreados, extrair o ZIP de `src/planos` em diretório separado. Nunca executar `git reset --hard` ou `git clean -fd` sobre a pasta de trabalho com edições.
- Dependências são reinstaláveis por `npm ci` quando necessário; `.env` deve ser preservado no dispositivo, jamais versionado.
- O snapshot é local, não um backup externo redundante. Antes da publicação, revisar redundância e manter plano de rollback de Cloudflare.

## Evidências
- `evidence/ZE-01-quality-results.json`, `ZE-01-build.log`, `ZE-01-lint.log`
- `evidence/ZE-01-browser-results.json`, `ZE-01-browser-run.log`, `ZE-01-mobile.png`
- `evidence/ZE-01-production-baseline.json`, `ZE-01-restore-verification.json`

Status de aprovação é definido em `execution-state.json`, após revisão final dos arquivos e do commit de documentação.
