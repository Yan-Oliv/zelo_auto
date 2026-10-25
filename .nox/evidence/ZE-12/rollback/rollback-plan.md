# ZE-12 — Plano de rollback

Produção protegida: `https://zelo.omnyatech.com.br/`, Pages `zelo-auto`, conta `663888827c96aad8d97cea728e78fb0a`.

## Alvo conhecido antes da publicação

- Deployment de produção bem-sucedido: `0f414771-cd0e-4407-9165-5a4311babff3`.
- Commit de origem: `b575ed2f42c0fa1a65c314a67d75644cf4ab640d`, branch `main`.
- URL imutável: `https://0f414771.zelo-auto.pages.dev`.
- Criado em 2026-07-23; raiz e asset principal responderam HTTP200, HTML equivalente ao domínio atual, conforme baseline.
- Nunca usar um deployment preview como alvo presumido de rollback.

## Critérios e execução autorizada

Se o novo deployment apresentar indisponibilidade, assets críticos ausentes, falha de segurança, hero materialmente quebrada ou navegação comercial inoperante: preservar evidência mínima sanitizada e classificar o incidente. Efetuar o rollback oficial do Pages para o alvo acima somente com a autorização operacional registrada para o release. Nenhum rollback é executado nesta preparação.

No painel: Workers & Pages → `zelo-auto` → Deployments → selecionar o deployment de produção conhecido → Rollback. Alternativamente usar o endpoint oficial de rollback com o mesmo project/deployment ID e credenciais autorizadas, sem expor valores.

Após confirmação, verificar o domínio canônico: raiz200, asset principal200, correspondência de HTML ao alvo, navegação e contato. Um retorno de sucesso do painel/API sozinho não homologa a reversão. Registrar deployment ativo, horário, SHA e resultados. Manter ZE-12 em `REWORK` se houver regressão de release, seguindo os estados canônicos Nox.

## Limites e configurações

O rollback de assets **não restaura automaticamente variáveis, bindings, DNS, OAuth ou segredos externos**. Nenhum DNS/billing/binding é alterado nesta preparação. Caso o proprietário autorize atualização de credenciais Instagram antes do go-live, documentar essa operação separadamente; não copiar segredo revogado para arquivos de rollback. Credencial antiga já rejeitada não é um alvo funcional de restauração.

O projeto usa integração GitHub e deploy automático da branch `main`. Um rollback no Pages não impede um push futuro de republicar outro commit. Preservar `main` e as tags; não usar force push, reset ou exclusão de releases. Verificar novamente a versão anterior imediatamente antes do go-live caso outro operador publique no intervalo.

Documentação oficial: https://developers.cloudflare.com/pages/configuration/rollbacks/

Status: **PREPARADO e alvo verificado por leitura; exercício destrutivo NOT_RUN**.
