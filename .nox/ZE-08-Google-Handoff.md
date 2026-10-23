# ZE-08 — Homologação Google pelo proprietário

Estado: preparação local, **não recebido pelo GA4 / não publicado / não verificado no Search Console**. Sem acesso autorizado aos painéis, estas etapas são PENDING externas, não PASS. Não forneça senha ou token.

## GA4

1. Acesse https://analytics.google.com/ com a conta proprietária. Em Administrador > Coleta e modificação de dados > Fluxos de dados, selecione o fluxo Web do domínio https://zelo.omnyatech.com.br/. Confirme Measurement ID **G-E9SKGKCQXX**, sem criar outra propriedade.
2. Em Medição otimizada > engrenagem, desative visualizações por mudança no histórico do navegador e busca interna automática (não enviar termos pesquisados). Recomenda-se desativar cliques de saída automáticos para utilizar somente os eventos comerciais próprios; nunca some `click` automático com `whatsapp_click` como contatos distintos.
3. A aplicação assume pageview manual, `send_page_view:false`. Âncoras/scroll não são páginas. Verifique também tags conectadas/configurações no painel que possam ativar pageviews automáticos.
4. Em Administrador > Exibição de dados > Eventos, após recebimento real, marque **whatsapp_click** como evento principal de intenção de contato (uma vez por evento). `quote_click` informa origem de intenção de orçamento; não somar ambos como dois contatos quando coexistirem na mesma ação. Não marcar purchase/generate_lead nem atribuir valor monetário.
5. Não ative medição em localhost ou previews comuns. Depois de publicação futura separadamente autorizada, abra o domínio oficial sem consentimento e confirme ausência de gtag/collect. Aceite analytics; use https://tagassistant.google.com/ para conferir uma tag e escolha de consentimento.
6. No GA4 > Relatórios > Tempo real e Administrador > Exibição de dados > DebugView (com modo debug autorizado), realize um clique por ação e confira parâmetros e ausência de duplicidade. Chamar gtag no browser não prova recebimento; registrar evidência real somente ao aparecer no painel. Recuse/revogue e confirme interrupção.
7. Em Administrador > Gerenciamento de acesso à propriedade, confirme a conta e sua função antes de alterar eventos. Configurações de retenção, sinais Google e publicidade não foram modificadas pela sprint.

## Search Console

1. Acesse https://search.google.com/search-console/ com a conta proprietária e selecione a propriedade existente de prefixo **https://zelo.omnyatech.com.br/** ou a propriedade de domínio **omnyatech.com.br** que inclua o subdomínio. Não crie uma duplicata.
2. Configurações > Usuários e permissões: confirme acesso. Configurações > Verificação de propriedade: confira o método. A meta google-site-verification existente está preservada; o HTML sozinho não comprova propriedade/conta correspondente.
3. Antes de enviar, após publicação futura autorizada, abra https://zelo.omnyatech.com.br/sitemap.xml e https://zelo.omnyatech.com.br/robots.txt. Ambos devem responder 200 com URLs oficiais. O GET público desta sprint ainda retorna canonical/sitemap do pages.dev; por isso não foi enviado o sitemap local.
4. Em Indexação > Sitemaps, confira se o sitemap já está cadastrado e seu último processamento. Só se necessário informe **https://zelo.omnyatech.com.br/sitemap.xml** e clique Enviar. Sucesso significa processamento, não garantia de indexação/posição.
5. Em Inspeção de URL use https://zelo.omnyatech.com.br/ > Testar URL publicada; confirme indexabilidade/canonical. Solicite indexação somente com arquivo público correto e permissão. Rotas debug devem manter noindex.
6. Acompanhe Desempenho > Resultados da pesquisa (cliques, impressões, CTR, posição, consultas/dispositivos), Indexação > Páginas e status de Sitemaps. Não existem números atestados nesta sprint.

## Base consultada

- Google Consent Mode básico: https://developers.google.com/tag-platform/security/concepts/consent-mode
- Setup consentimento: https://developers.google.com/tag-platform/security/guides/consent
- ANPD Guia orientativo Cookies e proteção de dados pessoais: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais

Essas orientações fundamentam bloqueio prévio de tags não essenciais, recusa acessível e revogação. Não equivalem a certificação jurídica ou validação do painel.
