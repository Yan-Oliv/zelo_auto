# ZE-04 — QA final local

Resultado: **PASS técnico local — 332 verificações resolvidas, 0 falhas de produto abertas**. Aprovação visual humana não é alegada. Build/lint são gates executados e registrados pelo Nox, fora da responsabilidade deste relatório de navegador.

Escopo delegado: somente arquivos de evidência `ZE-04-*`; nenhuma edição de produto, estado Nox ou commit pelo QA. Contrato completo lido em UTF-8 no anexo `83111dda-e282-48cf-b044-017d095d16eb/Pasted text.txt`; cinco modelos `new_interface/1.png` a `5.png` abertos individualmente. URL validada: `http://127.0.0.1:4210/`.

## Reproduzir

```powershell
node .nox/evidence/ZE-04-final-qa.mjs
node .nox/evidence/ZE-04-final-controls.mjs
node .nox/evidence/ZE-04-final-retest.mjs
node .nox/evidence/ZE-04-final-reconcile-qa.mjs
```

O JSON agregado é `ZE-04-final-qa-aggregate.json`. O primeiro run principal preserva **281 PASS / 2 falhas metodológicas** em `ZE-04-final-qa.json`: no compacto, exigia a segunda card abaixo da viewport antes de entrar em tela e iniciava um gesto touch sob o header fixo. O reteste posiciona o primeiro card e o slider no centro real da viewport; ambos passam. O harness principal foi corrigido para futuras reproduções. Os 2 resultados antigos não foram apagados: a agregação liga cada um ao reteste correspondente. Resultado dos controles no build corrigido: **33/33 PASS**; reteste direcionado: **18/18 PASS**. A contagem final é 281 + 33 + 18 = 332 verificações PASS, incluindo as duas correções de metodologia.

## Cobertura e evidência

- Rodada principal: 1920×1080, 1440×900, 1366×768, 768×1024, 390×844 e 360×740. Zero overflow horizontal, imagens locais carregadas, dimensões definidas, lazy fora da hero e ausência de erros JS/fontes novos.
- Quatro serviços reais do cadastro; quatro cliques reais abriram o WhatsApp configurado. Navegação externa bloqueada no transporte durante QA, sem enviar mensagens. Todos os links externos usam WhatsApp, Instagram ou Maps existentes.
- Três comparadores começam em 50%, possuem dois arquivos distintos do mesmo caso ilustrativo e rótulo explícito de demonstração. Setas do teclado mudam 50→51 e clip 50→49%; arraste real do mouse chega a aproximadamente 80%; CDP touchscreen real funciona em tablet/mobile. Compacto retestado: 50→25. Os seis arquivos antes/depois foram abertos visualmente para conferir identidade do caso e diferença entre estados.
- Processo 01 Avaliação / 02 Detalhamento / 03 Entrega; conectores revelados; marcas reais Vonixx, Vintex e Zacs; fotos e composição de produtos identificadas como ilustrativas.
- Instagram preserva contrato do hook/API. Só `/api/instagram-feed` foi interceptado para 503, vazio, loading e fixture de contrato. Fixture valida `media_url`, thumbnail de vídeo e filho de carrossel, permalink e fallback ao perfil. Isso não prova que a API oficial está operacional. Fallback tem seis tiles e legenda “Galeria ilustrativa”, sem métricas falsas.
- Google Reviews indisponível de forma explícita, sem notas, contagens, nomes ou comentários inventados; três ações reais de Instagram/WhatsApp/Maps. Integração futura não foi simulada como produção.
- Dados preservados: R. Antônio Horácio Pereira, 1485, WhatsApp (64) 99616-1968, segunda–sexta 08:00–18:00, sábado 08:00–14:00, domingo fechado. O endereço demonstrativo da referência 5 não foi copiado.
- Google Maps é iframe real, lazy, com DOM e tiles carregados em seis tamanhos: 254–277 elementos e 8–11 tiles reais carregados por tela. Screenshots desktop/mobile mostram mapa, pin, atribuição Google e controles. Link de rota existente preservado. Nenhuma imagem falsa de mapa substitui a integração.
- Footer usa logo oficial, parceiros OmnyaTech/SKG, versículo institucional completo 1 Timóteo 1:17 e ano 2026, sem redes inventadas.
- Todos os seis destinos do menu, busca normalizada sem acentos, estado vazio, fechar via Escape e foco, orçamento, aliases e scroll-margin verificados. Menu mobile retestado com foco inicial, Tab/Shift+Tab em ciclo, Escape, restauração do trigger e bloqueio/limpeza de scroll do body.
- Hero v4 tem quatro animações reais, armazenamento `complete` e nenhum replay em retorno/reload nos seis tamanhos. Reduced-motion mostra conteúdos prontos. Sem canvas, payload GLB/Three ou uso integral dos PNGs de referência.
- Amostras reais de tempo, sem pausar relógio, provam stagger dos cards e fade/deslocamento de processo/Instagram/mapa; produtos fazem opacity ~0.045→1 e scale ~1.014→1. Hover da fotografia do serviço chega a scale 1.03. Reduced-motion também foi verificado.

## Achados devolvidos e corrigidos pelo responsável

1. Header/âncora: a seção Serviços chegava a top 132px com header até 143.48px e mantinha hero/aria-current antigos. Correção de altura dinâmica e condição da hero. Reteste passou em todos os tamanhos; os demais links tiveram reteste dedicado.
2. Produtos de qualidade não tinham fade/parallax. Correção para fade/scale muito sutil, com reduced-motion. Amostras reais constam do JSON principal.
3. Contato em 1920 no fim do documento não recebia aria-current porque a âncora não alcançava a linha do observer. Correção do caso de fim de documento; reteste de todos os links PASS.
4. Modal mobile não fechava com Escape e não gerenciava foco. Correção de foco, ciclo de teclado, Escape, restauração e body lock; 390/360 PASS.
5. CTA secundário de resultados herdava branco sobre fim de gradiente claro. Correção de texto `rgb(22,23,25)` e fundo `rgb(250,250,248)` verificada em seis larguras, com screenshots de resultados atualizados.

## Comparação visual técnica

Foram abertos e comparados os cinco PNGs e os componentes reais capturados em desktop/mobile. A hero mantém composição/arquivos aprovados. Serviços reproduzem introdução branca, carro superior direito, ZELO contornado, benefícios e quatro cards; resultados preservam faixa escura e três comparações. Processo/qualidade preservam divisão editorial/fotográfica, timeline e produtos. Comunidade mantém duas colunas, grid 3×2 e cards; mobile empilha de modo legível. Localização preserva carro/cenário escuro, informações à esquerda, mapa/ações e footer conectado.

Há diferenças legítimas documentadas: logotipo oficial em vez de marca tipográfica fictícia do PNG; conteúdo real e estados sem prova social fictícia; fotos conceituais identificadas; mapa Google funcional claro em vez do mockup escuro; fonte geométrica local/fallback válida, com traço mais fino que a referência. A fonte TTF defeituosa não é recarregada; nenhum erro OTS novo foi observado. Isso é comparação técnica de fidelidade, não alegação pixel-perfect nem aprovação do usuário.

Capturas: `ZE-04-final-{1920,1440,1366,768,390,360}-{hero,services,results,process,quality,community,location,footer,fullpage}.png`. Os recortes de componente escondem temporariamente só o header fixo para inspecionar a seção inteira. As fullpages mantêm o header real. Seções longas foram percorridas antes da captura para revelar conteúdo legitimamente dependente de viewport. A correção final de cor do CTA consta das capturas `*-results.png`; as fullpages anteriores continuam documentando a composição e precedem apenas essa alteração de cor.

O run principal foi executado depois dos ajustes de altura do header/fade de produtos/remoção do badge sobre o mapa. Após ele, o responsável alterou somente a seleção ativa no fim de documento, o comportamento de teclado do modal e as cores do CTA secundário. Os controles e o reteste direcionado verificam esses deltas no último build. Não houve nova rodada desnecessária da integração Maps já comprovada.

## Limites e encaminhamento ao Nox

Fotos reais de casos antes/depois, feed oficial operacional e avaliações Google verificadas continuam dependências externas/futuras, apresentadas honestamente na UI. Endereço do cadastro prevalece até evidência de mudança, pois diverge do PNG. Homologação visual humana continua distinta deste PASS técnico. Nox deve reconciliar build/lint, revisão, documentação persistente e commit. Nenhum push ou deploy foi executado pelo QA.
