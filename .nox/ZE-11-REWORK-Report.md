# ZE-11-REWORK — Performance mobile e retomada Google

Estado: **COMPLETED**. ZE-11 aprovada nos critérios aplicáveis; ZE-12 pronta e QUEUED, sem execução. O rework pertence à ZE-11 e mantém suas duas entregas originais. Baseline `6bdd370632009ecd230298ba9384f33453d45a2d`, checkpoint `ZE-11-REWORK-start-20261024`, branch `work/ze-audi-redesign`.

## Autoridade e decisões

O proprietário aprovou visualmente a landing e pediu correção efetiva das metas mobile, sem exceção de performance. Também confirmou que suas ações Google foram realizadas: ZE-09 passa a **BLOCKED_EXTERNAL**, aguardando a autorização externa. Autorizou uma publicação futura com a interface Google honestamente indisponível; isso remove esse gate integrado da conclusão independente da ZE-11, sem aprovar avaliações fictícias ou autorizar deploy nesta execução.

O aceite visual prévio permanece válido para a composição. O rework preserva cenário, carro sem fabricante, enquadramento, escala, logomarca, frases, hierarquia e animações reais. A revisão técnica compara os frames finais com o baseline aprovado; não cria outro aceite humano.

## Correções

- A hero passa a existir no HTML gerado no build, com CSS crítico extraído dos seletores reais. Um bootstrap nativo inicia a mesma composição antes do pacote React; React hidrata esse DOM e adota o estado da intro/sessão. Rotas de debug usam montagem normal, sem tentar hidratar a landing.
- O conteúdo editorial e a biblioteca de animações abaixo da hero foram separados. Carregam após a intro, ou imediatamente quando o usuário rola, seleciona uma seção ou chega com âncora. Menu, busca, orçamento e consentimento continuam disponíveis sem esperar a intro terminar. Observadores e rolagem da âncora são atualizados após o conteúdo montar.
- A divisão de chunks usa as opções Rolldown suportadas pelo Vite, evitando captura recursiva de React no chunk de movimento. Fontes editoriais e pesos adicionais deixam de competir no caminho inicial. O consentimento usa animação CSS equivalente e continua opt-in.
- O cenário mobile deriva do recorte central exato do cenário aprovado, sem geração de outra cena. AVIF de alta qualidade e alternativas WebP preservam o conteúdo; desktop mantém seus assets originais. Corpo e reflexão compartilham a mesma imagem responsiva, sem download duplicado. O favicon de navegação usa uma derivação de 64px, preservando os assets institucionais maiores.
- No mobile em retrato, a chegada do carro mantém o fade, easing e transformação sutis, com duração de 1s e delay de 0,15s, antes 1,4s + 0,5s. A intro completa, frases, contorno, cenário e persistência continuam ativos. Desktop conserva seus tempos.
- O HTML de recuperação, no-JavaScript, erro de módulo e Error Boundary permanece disponível. A regressão encontrou imagem crítica falhando antes da hidratação: a recuperação nativa e o primeiro render React agora compartilham o estado do fallback, evitando mismatch e recuperação global indevida. Fontes/erros de imagens não registram conteúdo de provedores nem segredos.

## Imagens e revisão visual

`image-delivery.json` e `image-quality.json` registram bytes e método. Carro 640px: 68.696 → 39.318 bytes; cenário móvel WebP 89.568 → AVIF 44.003 bytes. PSNR RGB ponderado pela transparência do carro 44,2–44,6dB; cenário comparado ao recorte original 45,42dB. AVIF é compressão com perdas: o canal alfa permanece presente, com diferença máxima observada de 16/255; não há alegação de pixels idênticos nesse asset.

Comparação renderizada: desktop final pixel a pixel idêntico (MAE0 em 1.164.960 pixels). Mobile: mesma geometria/fontes, MAE0,7975 e 0,78% dos pixels acima do limiar do diagnóstico. As diferenças decorrem das derivações de imagem/logo; Root revisou nitidez, faróis, grade, contorno e enquadramento sem halo ou blur perceptível. Vídeos baseline/candidato mostram a mudança de tempo mobile sem ocultar a intro. Evidência: `evidence/ZE-11-REWORK/qa-hero-compare/`.

## Performance e método

O relatório anterior mediu um servidor estático sem compressão. O runtime Pages nativo negocia Brotli com Chrome. Para evitar atribuir transporte a código, este rework reconstruiu o baseline `6bdd370` e comparou baseline e candidato em runtimes Pages isolados idênticos, com APIs não configuradas, mesmo perfil mobile, movimento normal explícito e contexto Chrome novo sem pré-preencher sessão.

Baseline comparável: **Performance80 / LCP simulado5129ms**. As medições intermediárias permaneceram preservadas: candidato1 SSR80/5207ms; candidato2 separação editorial/recorte92/3254ms; candidato3 fontes/ícone95/2811ms; candidato4 tempo mobile96/2649ms; candidato5 AVIF98/2373ms. Nenhum resultado warm foi apresentado como cold. A série intermediária é diagnóstico sequencial de mudanças causais, não seleção do melhor resultado de várias execuções iguais.

O caminho inicial medido passou de 1.002.506 bytes/18 requisições para 234.402 bytes/10 antes de 1s (-76,6%). O total dentro da janela de auditoria passou de 1.022.631 para 799.725 bytes (-21,8%), incluindo conteúdo editorial carregado posteriormente. A mudança não é apenas deslocamento de bytes para fora da captura.

Medição final com o mesmo HTML em seis execuções, movimento normal e perfis explícitos:

| Perfil | Performance | LCP simulado | CLS |
| --- | --- | --- | --- |
| Mobile, primeira visita | 98 | 2363 ms | 0 |
| Mobile, retorno | 100 | 902 ms | 0 |
| Desktop, primeira visita | 97 | 1265 ms | 0,003333 |
| Desktop, retorno | 100 | 246 ms | 0,003333 |

As duas repetições adicionais previamente previstas de primeira visita mobile deram 98 e LCP2356/2357ms; três amostras passam nas metas Performance≥90 e LCP≤2500ms, mediana2357ms. Acessibilidade e SEO100 em todos os perfis. O pequeno CLS desktop fica abaixo da meta0,1 e foi documentado, preservando o acesso imediato à privacidade. Não houve exceção da meta de performance. LCP observado no trace local e LCP simulado Lighthouse são métricas diferentes; nenhum é dado de campo nem promessa de dispositivo real. Resultados completos: `performance-final-summary.json` e `performance-report.md`.

Referências técnicas consultadas: [LCP e atraso de renderização](https://web.dev/articles/optimize-lcp), [Vite e divisão de chunks](https://vite.dev/guide/build). As conclusões de desempenho acima vêm dos artefatos locais, não de exemplos da documentação.

## Google: bloqueio externo e comportamento automático

ZE-09 permanece **BLOCKED_EXTERNAL**; avaliações, nota e total oficiais continuam não homologados. A UI indisponível é a alternativa autorizada para uma futura publicação. Não foram criadas credenciais, alterado Cloudflare/Google Cloud nem realizadas autenticação ou publicação.

Uma página já aberta agora pode recuperar automaticamente: uma tentativa após cinco minutos de falha, somente com seção próxima e documento visível, respeitando cooldown, deduplicação e timeout. Documento oculto ou seção distante não faz tentativas; retorno visível/próximo permite a consulta controlada. Cinco cenários com relógio e resposta TEST DATA passam. O endpoint precisa receber autorização e configuração server-side válidas e devolver dados oficiais validados para a interface exibi-los. A aprovação administrativa do Google, isoladamente, não gera OAuth, IDs ou segredos. Nenhuma atualização de frontend é necessária quando esse endpoint já estiver operacional.

As cinco variáveis esperadas são documentadas em `qa-google-source.json` apenas por nome. Valores de `.env` não foram exibidos, copiados para evidências nem commitados. O mecanismo de recuperação não simula autenticação Google e não publica avaliações de fixtures.

## QA e fechamento

QA final PASS: SSR/hidratação14/14, matriz global22/22 em onze resoluções, tipografia/texto200%14/14, consentimento/SEO/teclado/axe8/8, axe compilado3/3, Instagram6/6, recuperação Google5/5 com fixtures, boundary compilado4/4 e contraste28/28. Seis scans axe sem violações detectadas, sem alegar certificação integral. Inclui falhas anteriores à hidratação, imagens lentas/quebradas, módulo editorial indisponível, três contextos de âncora antecipada, sessão/movimento reduzido e noJS. Os resultados iniciais com defeito e erros de harness ficam preservados e classificados separadamente. Relatórios: `qa-report.md` e `qa-summary.json`.

Build final PASS e lint PASS; warnings legados e aviso de chunk 3D de debug serão identificados no relatório final. Nenhum GLB/Three é carregado na landing.

O pacote selecionado de screenshots, vídeos, scripts e resultados fica em `evidence/ZE-11-REWORK/`, com índice e hashes. Baseline/dist intermediários, arquivos temporários, traces brutos extensos e arquivos de ambiente não entram no commit. Os dois documentos ZE-09 previamente alterados pelo proprietário permanecem fora do staging e são conferidos por SHA256; `new_interface/`, `src/planos/` e os originais de pintura são preservados.

Preview da experiência compilada: `http://127.0.0.1:8888/` (APIs deliberadamente sem credenciais). Preview de desenvolvimento com Instagram real: `http://127.0.0.1:5173/`. Não confundir APIs503 do runtime isolado com validação da integração real.

Rollback: reverter somente o commit deste rework após revisão, preservando trabalhos posteriores. Tag `ZE-11-REWORK-start-20261024` identifica o baseline; sem reset/clean destrutivo.

**Sem push, deploy, mudanças Cloud/OAuth/billing, custos ou execução de ZE-12.**
