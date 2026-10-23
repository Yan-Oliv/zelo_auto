# ZE-08 — Analytics e mensuração

Data: 2026-10-23. Coordenação Nox. Baseline739216f, checkpoint `ZE-08-start-20261023`, branch `work/ze-audi-redesign`. ZE-07 e ZE-06 permanecem concluídas em seus escopos aceitos. Nenhum deploy/push/produção. ZE-09 e correção visual pós ZE-09 não iniciadas.

## Entrega 1 — GA4, consentimento e eventos

Integração direta e leve `gtag.js`, ID autorizado **G-E9SKGKCQXX**, sem GTM duplicado. Inicialização única em módulo, script async somente quando build PROD + hostname oficial + consentimento granted + rota raiz. Local/preview comum inativo; diagnóstico explícito `window.__ZELO_ANALYTICS_DIAGNOSTIC__=true` antes da montagem emite somente CustomEvent `zelo:analytics`, sem download Google ou coleta. Rotas debug não mensuradas.

Consent Mode básico: nada enviado antes da escolha. Publicidade permanece denied (`ad_storage`, `ad_user_data`, `ad_personalization`); Google Signals/personalização desativados. Consentimento versionado local por180dias, sem identidade. Storage indisponível: estado em memória, sem presumir autorização. Revogação ativa ga-disable antes da atualização, remove eventos enfileirados e cookies `_ga`/`_ga_*` acessíveis em domínios correspondentes. Falha de tag/storage/cookie não impede CTA. Cookies `cookie_update:false`, expiração180dias. A política informa processamento Google/internacional, direitos e retirada, terceiros com suas próprias políticas; retenção de relatórios depende da configuração externa não inspecionada.

| Evento | Parâmetros permitidos | Semântica |
| --- | --- | --- |
| page_view | page_location canônico, page_title estático | um por documento autorizado |
| select_service | service_name enum | interesse em um dos4 serviços |
| quote_click | cta_location enum, service_context enum opcional | intenção de orçamento |
| whatsapp_click | cta_location, service_context opcional | intenção de contato |
| instagram_click | cta_location, link_type profile/post | navegação Instagram |
| directions_click | cta_location | intenção de rota |
| google_reviews_click | cta_location | somente fonte real quando há link |
| internal_search | result_count limitado, selected_section enum | escolha real de resultado, sem termo digitado |
| before_after_interaction | comparator_id enum | arraste/teclado consolidado por500ms |

Um listener comercial central por montagem, limpo no unmount; sem callbacks duplicados de clique. Um orçamento que abre WhatsApp pode emitir `select_service`/`quote_click`/`whatsapp_click` com semânticas distintas. **Métrica de intenção de contato é whatsapp_click: nunca somar as três como contatos.** Nenhum purchase/generate_lead/venda/valor monetário. Eventos bloqueados sem consentimento não são replayados depois. `send_page_view:false`, guard por documento impede StrictMode/scroll/âncoras. Nova navegação real/reload cria novo documento. Filtragem runtime descarta chaves e valores desconhecidos. Nenhuma URL de post, telefone, mensagem, query ou dados de formulário enviados. Referrer reduzido ao origin e localização sempre canônica; UTMs arbitrárias omitidas, portanto atribuição de campanhas UTM não está habilitada, canais por domínio de origem permanecem disponíveis.

**Dependência externa importante:** desabilitar Enhanced Measurement (principalmente History API/pageviews automáticos, cliques externos e busca) na propriedade, seguindo o handoff. Configurações remotas podem coletar fora dos eventos próprios; não atestamos o painel nem dados recebidos. Não somar click automático aos eventos comerciais. Antes de futura publicação, o proprietário deve confirmar estas opções.

## Entrega 2 — Search Console, privacidade e homologação

Meta de verificação Google preservada, assim como canonical, OG, sitemap, robots e JSON-LD da ZE-07. GET read-only público200 continua servindo canonical pages.dev e arquivos publicados anteriores. Nenhum sitemap foi submetido. A propriedade/conta não pode ser confirmada pela existência da meta. Search Console **PENDING externo**; procedimento preciso em [ZE-08-Google-Handoff.md](ZE-08-Google-Handoff.md), incluindo URLs, permissões, verificação, envio pós-publicação e relatórios. Realtime/DebugView/Tag Assistant reais também **PENDING**, não confundidos com diagnóstico interceptado.

UI única nova: aviso compacto off-white/grafite/dourado inferior com aceitar/recusar em hierarquia equilibrada, preferências e política. Acesso persistente após rodapé. Navegação, links, hero, imagens, intro v4, serviços, API Instagram, comparadores e lazy mapa preservados; dados de serviços mantidos. Não há banco novo ou biblioteca de analytics.

## QA e limites

Resultados finais serão reconciliados após QA. Evidências em `.nox/evidence/ZE-08/`. Lighthouse é laboratório local, não métricas de campo nem recebimento Google. Baseline frio CLI: desktop99/mobile81, LCP mobile4808ms, TBT38ms, CLS0. Primeiro final frio: desktop99/mobile81, LCP4733ms, TBT48ms, CLS0; aumento JS transferido115184→118454bytes (~3,3kB). Sem regressão de score/CLS; diferença TBT10ms em uma amostra não constitui medição estatística. Persistência consentimento warm: denied92/granted91, LCP3379/3453ms, CLS0; não comparar ganhos com cold-start. Ambos zero requests analytics por ambiente local inativo. Acessibilidade cold100, warm97 acusa contraste legado em `.ze4-quality-attributes` não alterado nesta sprint; não alegar100 em todos cenários. Tabela completa inclui main thread e transfer em `performance-summary.json`.

Painéis Google, origem oficial com tag real e custos externos não foram alterados. Aprovação técnica local e recebimento remoto são estados distintos. O contrato permite conclusão técnica com pendências externas explicitadas, sem autorizar publicação para validá-las.

## Git e rollback

Commit final: registrado na resposta e histórico Nox após criação. Para rollback reverter somente commit ZE-08; tag `ZE-08-start-20261023` preserva baseline. Não usar reset/clean. Arquivos do usuário `new_interface/` e `src/planos/` preservados e excluídos do commit.

?ltimo build final repetido mobile81/accessibility100, LCP4734ms, TBT32ms, CLS0. Resultado frio compat?vel com baseline81/LCP4808/TBT38. Desktop99/accessibility100. Scripts e evid?ncias identificam cen?rios; os relat?rios warm n?o comprovam requests/tag real de produ??o.

Revis?o independente root/Nox source e visual PASS. Seis viewports sem overflow e sem erros de browser; banner dentro viewport, bot?o44px, modal leg?vel/foco e reduced motion. Compara??o pixel: hero id?ntica nas seis, diferen?as somente feed din?mico em desktop/ultrawide; demais ?reas anteriores preservadas. ?nica expans?o de44?45px no fim do documento para acesso ?s prefer?ncias. Compara??o aos cinco modelos ? de preserva??o do baseline aprovado, n?o nova aprova??o de fidelidade absoluta; ZE-03-REWORK p?sZE-09 permanece na fila.

Status final: COMPLETED t?cnico local. C01 integra??o/ambientes/testes PASS com recep??o Google PENDING; C02 eventos PASS; C03 privacidade/SEO/prepara??o PASS com propriedade/envio externo PENDING; C04 build/lint/QA/revis?o/documenta??o PASS. Nenhum crit?rio externo marcado PASS.
