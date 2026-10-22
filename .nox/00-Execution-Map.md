# Mapa de execução — Zelo Autoestética

Data-base: 2026-10-22 | Projeto local: `B:\OmnyaTech Project's\Projetos\zelo_autoestica`

## Decisões aprovadas

- Visual: inspiração Audi / AURA-MOTION com identidade Zelo, base branca, lettering transparente e detalhes dourados.
- Avaliações: **somente Google**. Sem comentários próprios, sem KV/SQL/GitHub para avaliações.
- Cada sprint: até duas entregas; registrar estado atual, esperado, aceite e melhor caminho antes de começar.
- Produção somente após homologação local e aprovação explícita. Não causar regressões.

## Roadmap

- ✅ **ZE-01 — Segurança e baseline** | Checkpoint Git e preservação dos arquivos locais; registrar baseline de build, performance e fluxos
- ✅ **ZE-02 — Desacoplamento do 3D** | Remover dependência obrigatória de CarScene; eliminar travamento da navegação/scroll
- ✅ **ZE-03 — Hero cinematográfico Audi/Zelo** | Cena 2D AVIF aprovada com carro central, gradiente branco–preto–branco, ZELO contornado, slogan minimalista, responsividade e animação sutil
- ⬜ **ZE-04 — Reestruturação visual** | Redesenhar serviços e blocos comerciais; modernizar navegação e rodapé
- ⬜ **ZE-05 — Performance e acessibilidade** | Retirar carga 3D da produção e otimizar assets; medir performance e acessibilidade
- ⬜ **ZE-06 — Instagram funcional** | Restabelecer conector oficial; exibir feed autêntico com fallback adequado
- ⬜ **ZE-07 — SEO técnico local** | Corrigir domínio canônico e sitemap; atualizar SEO local e dados estruturados
- ⬜ **ZE-08 — Google Analytics e mensuração** | Instalar GA4 G-E9SKGKCQXX; validar eventos, Search Console e Perfil da Empresa
- ⬜ **ZE-09 — Reputação Google** | Exibir avaliações Google quando tecnicamente viável; direcionar avaliação ao Google
- ⬜ **ZE-10 — Experiência e confiabilidade das avaliações Google** | Tratar falhas/estados vazios de avaliações Google; validar acessibilidade e links
- ⬜ **ZE-11 — Homologação local** | Executar testes regressivos em desktop/mobile; aprovação visual e funcional
- ⬜ **ZE-12 — Publicação controlada** | Implantar após aprovação explícita; validar produção e rollback

## Gate ZE-01

1. Checkpoint recuperável do HEAD original e cópia segura de arquivos locais não rastreados.
2. Branch de trabalho separada de `main`; nenhuma alteração em produção.
3. Baseline comparável de build/lint, assets, tempos e navegação, com achados reais documentados.
4. Integridade do checkpoint, rollback documentado e revisão de segurança.

ZE-01, ZE-02 e ZE-03 concluídas e validadas. ZE-04 permanece `QUEUED`; produção intacta. A homologação geral e o deploy só ocorrerão nas sprints apropriadas.
