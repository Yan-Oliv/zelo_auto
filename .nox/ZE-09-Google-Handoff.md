# ZE-09 — Handoff Google Business Profile

## Ação indispensável do proprietário

A ficha foi localizada por nome, site e telefone coincidentes; o link Maps antigo aponta somente para o endereço. Acesso público não comprova propriedade nem verificação. A interface Google abriu autenticação ao acionar Avaliar, sem login nem publicação. A API não foi autenticada, pois não há variáveis Google no ambiente local.

1. Entre na conta Google proprietária e abra o Perfil da Empresa Zelo Estética Automotiva em Catalão. Confira telefone (64) 99616-1968, site zelo.omnyatech.com.br e rua Antônio Horácio Pereira; confirme o número 1485, que não aparece na ficha pública observada.
2. Os links públicos de avaliação e compartilhamento já foram recebidos do proprietário e incorporados. Não é necessário enviá-los novamente. Confirme que é proprietário/administrador e que a ficha está verificada; confirme manualmente que o link abre o fluxo correto quando o desafio anti-bot impedir a automação. Não envie senha ou tokens no chat.
3. No Google Cloud, selecione projeto da própria empresa autorizado para Business Profile APIs. Confirme aprovação de acesso; possuir a ficha não concede automaticamente API. Siga o setup oficial abaixo. Não habilite cobrança: se o painel pedir faturamento, pare e registre essa dependência.
4. Habilite somente APIs necessárias após conferir acesso: Business Profile Account Management, Business Information e Google My Business v4 (reviews). Crie cliente OAuth sob o projeto aprovado e autorize a conta proprietária com escopo `https://www.googleapis.com/auth/business.manage`. O Google não oferece escopo somente leitura para reviews; o adaptador executa apenas GET de localização/avaliações e POST de renovação OAuth, nunca edição de ficha ou publicação.
5. Obtenha Account ID pela lista oficial de contas, e Location ID pela lista de localizações dessa conta. Não use Place ID nem identificador hexadecimal de endereço em seu lugar. Confira título, cidade, telefone e metadata.mapsUri/newReviewUri da localização autorizada. Faça o OAuth offline com seu próprio cliente e guarde refresh token em arquivo local ignorado; não envie no chat.
6. Configure no `.env` local ignorado: `GOOGLE_BUSINESS_ACCOUNT_ID`, `GOOGLE_BUSINESS_LOCATION_ID`, `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`, `GOOGLE_BUSINESS_REFRESH_TOKEN`. Sem prefixo VITE_. URLs opcionais `GOOGLE_BUSINESS_REVIEWS_URL` e `GOOGLE_BUSINESS_REVIEW_ACTION_URL` servem como conferência exata contra metadata autenticada; não substituem a autorização. Não preencher com Maps antigo/endereço.
7. Reinicie `npm run dev`. Acesse a seção Avaliações para iniciar a consulta. Valide `/api/google-reviews`: dados oficiais, nota e total verdadeiros, até três avaliações em ordem de atualização do Google. Sem configuração o endpoint retorna 503 sanitizado e a página preserva estado indisponível.
8. Valide os dois CTAs em desktop/mobile sem publicar avaliação de teste. **AVALIAR** deve abrir o fluxo de avaliação/login; **VER TODAS** deve abrir a ficha oficial e permitir ler avaliações. O metadata.mapsUri é link da ficha, não garantia de aba de avaliações aberta; comprovação manual permanece necessária.
9. Após dados reais e links homologados, retomar ZE-09 para concluir critérios C01–C04. Cloudflare pode receber os mesmos nomes como secrets server-side em publicação futura expressamente autorizada. Não houve alteração remota nesta sprint.

## Políticas e decisão

Preferência: Business Profile API, acesso do proprietário e sem chamadas Places. Places (New) entrega até cinco reviews selecionados, exige atribuições específicas e pode cobrar no nível de fields reviews; não houve autorização de custo, habilitação ou chamadas. Não se adotou fallback Places.

Não há banco, comentários próprios, snapshots de reviews reais nem cache de conteúdo Google em disco/KV/CDN. Resposta `no-store`; única promessa em memória na aba evita duplicação StrictMode. Dados não são persistidos após fechar a página. Requisitos de API Google devem ser reconferidos antes de ativar, inclusive uso próprio/projeto e atribuições. Nenhuma nota ou comentário ilustrativo entra no runtime; mocks existem só em testes explicitamente identificados.

Fontes oficiais consultadas em 2026-10-23:
- https://developers.google.com/my-business/content/basic-setup
- https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
- https://developers.google.com/my-business/reference/businessinformation/rest/v1/accounts.locations#Metadata
- https://developers.google.com/my-business/content/policies
- https://developers.google.com/maps/documentation/places/web-service/place-details
- https://developers.google.com/maps/documentation/places/web-service/policies
- https://support.google.com/business/answer/16816815?hl=pt-BR
- https://developers.cloudflare.com/pages/functions/bindings/


## Retomada com links do proprietário
2026-10-23 — ZE-09 retomada com links públicos fornecidos pelo proprietário: search lrd CID0x14e35d89087019ae ação3 e share.google/3PlTHI5FF8L4JCmS0 cujo redirecionamento kgmid/g/11zxzxp9sv corresponde à ficha encontrada. CTAs públicos independentes de OAuth implementados; fragmento de escrita preservado. Browser Google retornou desafio anti-bot, sem contorno; fluxo final manual continua PENDING. Fonte/nota/total/reviews reais ainda dependem OAuth/projeto aprovado. WAITING_USER_ACTION mantido; sem produção/custos/ZE10/rework.
