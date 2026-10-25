# Google — recuperação automática limitada

**PASS nos cinco cenários técnicos isolados; BLOCKED_EXTERNAL para avaliações oficiais.**

Verificação inicial em `qa-google-source.json` descreve o comportamento antes da alteração:503/configuration travava revalidação automática na página já aberta. O Nox adicionou recuperação limitada, sem criar credenciais nem interpretar aprovação administrativa como configuração pronta.

Reprodução: `node .nox/evidence/ZE-11-REWORK/qa-google-recovery.mjs`. A fonte real do hook é carregada por Vite; IntersectionObserver/visibilidade e relógio são controlados pelo harness e a resposta Google é TEST DATA. Evidência em `qa-google-recovery/results.json`.

1. Seção distante: zero requisições. Falha inicial visível/próxima: uma. Foco repetido não repete. Após cinco minutos, uma tentativa com resposta válida atualiza a interface sem reload.
2. Documento oculto por seis minutos: nenhuma tentativa extra; volta visível/próxima recupera uma vez.
3. Seção distante por seis minutos: nenhuma tentativa extra; reentrada recupera uma vez.
4. Configuração persistentemente inválida: uma requisição inicial, outra após cinco minutos e outra após dez; sem loop curto.
5. Tentativa manual antecipada bloqueada pelo cooldown; após61s recupera, antes da tentativa automática de cinco minutos.

Quando o ambiente possuir account/location/clientId/clientSecret/refreshToken válidos, a API validar a identidade e receber dados autênticos, novas visitas e a recuperação limitada poderão exibir avaliações. A autorização Google isolada não gera OAuth, IDs ou segredos. Publicação futura com indisponibilidade honesta foi autorizada pelo proprietário; nenhum deploy é executado nesta validação.
