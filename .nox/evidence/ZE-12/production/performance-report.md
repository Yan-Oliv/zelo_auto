# ZE-12 ? Performance real no dom?nio can?nico

Auditoria conclu?da em 2026-10-25; candidato `676f1a5a7e51e9c79c5f3fbe03c56edc35beedd8`, URL https://zelo.omnyatech.com.br/. Quatro execu??es planejadas, uma por perfil, sem repeti??o ou sele??o do melhor resultado. Nenhum arquivo de produto foi alterado.

**A meta estrita de LCP mobile na primeira visita n?o foi atendida nesta amostra de produ??o: 2554ms, 54ms acima de 2500ms.** Performance95 supera90; retorno100/LCP780ms. A aprova??o pr?-release local98/LCP2363ms permanece como evid?ncia de outro ambiente, sem substituir a medi??o p?blica. N?o declarar o LCP p?blico como PASS nem converter o retorno em primeira visita.

| Perfil | Performance | LCP simulado ms | LCP observado local ms | FCP ms | TBT ms | CLS | A11y/BP/SEO |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| mobile cold | 95 | 2554 | 1430 | 1954 | 0 | 0.000000 | 100/100/100 |
| mobile warm | 100 | 780 | 101 | 780 | 11 | 0.000000 | 100/100/100 |
| desktop cold | 93 | 1427 | 2174 | 673 | 0 | 0.094321 | 100/96/100 |
| desktop warm | 100 | 213 | 106 | 213 | 0 | 0.003333 | 100/96/100 |

## M?todo e integridade

QA e navegadores Root estavam encerrados antes do in?cio. Chrome novo por perfil, sem storage pr?-carregado no cold; movimento normal explicitamente selecionado por CDP, n?o o padr?o Windows reduzido. Mobile Slow4G/CPU4/412?823/DPR1,75/UA mobile e desktop Dense4G/CPU1/1440?900/UA desktop. Retorno usa pr?-visita natural conclu?da, conte?do editorial montado, espera limitada por inatividade de rede, mesmo cache/sess?o e reload. Janela adicional4500ms inclui a intro. Nenhum provider/API foi simulado ou bloqueado; consentimento padr?o n?o foi pr?-concedido. O estado do cache de edge n?o ? controlado.

As quatro execu??es correspondem ao HTML aprovado SHA256 `61c4fcebb4fd93c65d99c6e83b3cd9266ead2d82915b8045207da7c316dcc17f`. As duas primeiras visitas registram waiting?playing?settled com reduce=false; os retornos permanecem settled sem replay. Zero erros JavaScript em todos os perfis. Lighthouse mediu as quatro categorias; ferramentas MCP DevTools n?o estavam dispon?veis, portanto foi usado o mesmo Lighthouse/Puppeteer/CDP j? homologado na ZE-11.

## Diferen?a medida em rela??o ao laborat?rio local

O elemento LCP continua sendo o corpo do carro, com geometria id?ntica (363?184px no perfil mobile). A decomposi??o observada mostrou TTFB155,746ms p?blico versus12,199ms local; carga do asset61,434ms versus27,913ms; atraso de renderiza??o1206,17ms p?blico versus1284,476ms local. Portanto n?o foi observado aumento do atraso de renderiza??o do c?digo; o ambiente p?blico adicionou lat?ncia de rede/servidor. O Lighthouse simulado registrou TTFB754ms p?blico. O delta de LCP simulado ?191ms. Essa decomposi??o n?o ? an?lise causal de todos os custos nem estimativa de p75 de usu?rios reais.

CLS mobile0. Desktop cold0,094321 e warm0,003333 ficam abaixo de0,1; o cold est? acima da amostra local0,003333. N?o foi persistido trace bruto e n?o se atribui esse deslocamento a um elemento sem evid?ncia espec?fica.

## Limites e encaminhamento

Sem dados de campo/INP real, sem distribui??o estat?stica ou mediana de produ??o e sem garantia para todos os dispositivos. O LCP observado do trace e o simulado s?o m?tricas diferentes. N?o foi feita otimiza??o de produto, configura??o, cache, DNS ou mudan?a de intro nesta tarefa. N?o h? evid?ncia de falha JavaScript ou indisponibilidade nos quatro perfis; a decis?o de release e a classifica??o do LCP54ms acima da meta pertencem a Nox/Root.

Artefatos: `performance-results.json` e quatro `performance-{mode}-{state}.json`. Eles preservam m?tricas, settings, agregados e requests sem query strings; n?o cont?m respostas OAuth, coment?rios, legendas, snippets de provider ou corpos de API. N?o foram salvos traces brutos. Todos os Chromium de benchmark foram encerrados.
