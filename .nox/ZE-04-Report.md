# ZE-04 — Reestruturação visual | 2026-10-22

Relatório de implementação e homologação local. Estado de validação e contagem final constam no resultado QA desta sprint; não se atribui aprovação visual humana ao usuário.

## Contrato e baseline

Escopo exclusivo ZE-04, no máximo duas entregas: seções comerciais; navegação/contato/identidade. Contrato integral fornecido pelo usuário, cinco PNGs em `new_interface/` inspecionados individualmente e design system complementar lido. ZE-03 concluída em `b2bbfdab98153e0922969b86bf275f7953012ccf` é a dependência satisfeita. Branch `work/ze-audi-redesign` preservada.

Checkpoint anotado `ZE-04-start-20261022` no commit baseline; ZIP local `.nox/checkpoints/ZE-04-user-references-20261022.zip` preserva `new_interface/` e `src/planos/`; hashes dos cinco PNGs em `.nox/evidence/ZE-04-start-manifest.json`. Nenhum segredo foi incluído na cópia. Rollback por nova branch/checkout isolado a partir da tag, preservando os arquivos locais; sem reset hard/clean.

## Entrega 1 — Seções comerciais

Serviços com cabeçalho editorial preto/dourado, foto de carro lateral, lettering de fundo, três diferenciais e quatro cards independentes. Os quatro serviços e descrições derivam do cadastro existente. Fotos específicas, fades, ações de orçamento, foco/hover e stagger de entrada.

Resultados com três comparadores antes/depois reais de interface: duas imagens diferentes por caso, range inicial50%, arraste mouse/touch e teclado, labels e divisor. Todos os pares são demonstrativos e trazem aviso visível de que não são resultados reais da Zelo. Não há caso documental confirmado, portanto nenhuma imagem editorial é oferecida como prova de atendimento.

Processo com três etapas editoriais Avaliação/Detalhamento/Entrega, fotos próprias, numerais/conectores revelados e timeline vertical no mobile. Textos orientam conversar/combinar com a equipe, sem prometer método/certificação não confirmado. Qualidade com foto de produtos, três diferenciais, fade da cena e marcas reais Vonixx/Vintex/Zacs.

Instagram e avaliações: composição em duas colunas com grid3×2; uma única chamada ao hook existente e endpoint preservado. O hook antigo retorna placeholders em falhas/ausência; a interface detecta esses dados e mostra uma galeria explicitamente ilustrativa com link ao perfil oficial. Loading, erro, vazio e feed real têm estados próprios. O componente de reviews recebe dados tipados quando houver fonte verificada; atualmente apresenta indisponibilidade e ações reais distintas, sem nota, estrelas, nomes, seguidores ou contagens inventados.

## Entrega 2 — Navegação, contato e identidade

Navegação integrada a âncoras funcionais hero/serviços/processo/resultados/avaliações/contato e busca também Instagram/produtos/localização. Seção ativa considera posição sob o header, inclusive em blocos mobile altos. Altura real do header medida para margem de rolagem; contraste muda quando a hero sai da área do header. Sem linha horizontal na hero, scroll pin ou novo3D.

Localização segue a composição escura de foto/lettering/texto/mapa, com iframe Google Maps real e lazy, bordas douradas e botões orçamento/rota. Removido badge decorativo que obstruía o texto do mapa Google. Endereço/WhatsApp/horários do cadastro foram mantidos: R.Antônio Horácio Pereira1485, Lot.Ipanema, Catalão-GO75705-150; WhatsApp(64)99616-1968; segunda–sexta08–18h, sábado08–14h, domingo fechado. Esses dados prevalecem sobre os exemplos divergentes do PNG5.

Rodapé em colunas com logo oficial, declaração institucional, navegação, Instagram/Maps/WhatsApp legítimos, copyright2026, verso completo1Timóteo1:17 e parceiros OmnyaTech/SKG. Sem inventar Facebook/YouTube. Tokens semânticos e componentes separados evitam ampliar o monólito da LandingPage.

## Preservação da ZE-03

Carro, enquadramento, cenário, frases, camadas, keyframes, chave de sessão v4 e lógica de primeira entrada foram mantidos. A marca oficial transparente continua sem placa. O JSX interno da hero foi comparado com o baseline e é idêntico após normalizar quebras de linha; CinematicHero.css e assets hero não foram editados. Ajustes no header são integração das novas âncoras e medição de altura/contraste. Regressão visual e funcional da hero integra o QA.

## Comparação visual e correções

PNG1: hero preservada, header integrado. PNG2: serviços/cards/comparadores e CTAs reconstruídos como widgets reais. PNG3: texto/foto/timeline e faixa de produtos, fades e lettering. PNG4: proporção de colunas e grid preservada; a prova social ilustrativa da referência foi substituída por indisponibilidade honesta. PNG5: composição escura, contato, mapa real e rodapé; dados reais substituem exemplos incorretos da imagem.

Primeira revisão renderizada detectou texto utilitário pequeno, carro editorial muito central, repetição de mensagens nos cards de indisponibilidade e benefício escuro sobre foto. Corrigidos tamanho/legibilidade, enquadramento editorial, ações distintas e fundo claro local nos diferenciais. QA detectou cabeçalho cobrindo a âncora/estado ativo, corrigido pela altura dinâmica, e falta de fade nos produtos, implementado. Screenshot de mapa parcialmente carregado foi rejeitada; a evidência final aguarda e mostra ruas/pin/controles reais.

Diferenças declaradas: fotografias novas são editoriais derivadas de edição generativa, com microdetalhes diferentes dos PNGs; não representam clientes/sede reais. Fonte Eurostile local tem cmap inválido e é rejeitada pelo navegador; requisição inválida retirada, fontes válidas do projeto e proporção geométrica CSS usadas sem modificar hero ou baixar fonte sem licença. Não se declara identidade pixel a pixel. Mobile reorganiza cards/timeline/colunas de modo legível.

## Gates e evidências

`npm run build` e `npm run lint`: resultados completos em `.nox/evidence/ZE-04-quality.json`. Lint conserva seis warnings legados de MotionSettings/CinematicContext/CarScene, sem introduzir warnings nos componentes. Build conserva aviso do chunk Three debug lazy; não solicitado pela landing.

QA Playwright e comparação visual em1920×1080,1440×900,1366×768,768×1024,390×844 e360×740, com reduzido movimento, interações, imagens/fontes, mapa, estados de integrações e regressão de hero. Resultados e contagem final em `.nox/evidence/ZE-04-final-qa-aggregate.json` e relatório `ZE-04-final-QA.md`. Screenshots por seção e página inteira em `ZE-04-final-*`, header ocultado somente nos recortes de comparação e presente nas páginas completas. Revisões locais Nox/QA/root; validação humana permanece separada.

Assets, método e prompts finais em `ZE-04-Assets.md`; manifesto de tamanhos/hashes em `evidence/ZE-04-asset-manifest.json`. Foram usados assets locais da marca/produtos/parceiros e WebP novos com lazy fora da primeira dobra. Nenhuma nova dependência de produto.

## Pendências externas reais e limites

Não há fonte verificada de avaliações Google nem URL confirmada de Perfil da Empresa. O shortlink cadastrado foi verificado e aponta para o endereço, não para reviews; a interface diz “Ver localização no Google Maps”. Proprietário deve confirmar futuramente URL do Perfil e fonte autorizada de avaliações. Não se cria place_id ou nota artificial. Integração final pertence às ZE-09/10.

Publicações atuais dependem da API existente, cuja correção é ZE-06. Casos reais antes/depois devem substituir posteriormente os pares demonstrativos, mediante autorização/material do proprietário. Confirmação do endereço pelo proprietário pode ser feita em homologação; nesta execução o cadastro existente foi preservado. Nenhuma dessas pendências impede a interface honesta prevista no contrato.

Nenhum deploy, push, migração, alteração de credenciais ou execução ZE-05+ ocorreu. Produção permanece intacta. Arquivos do usuário `new_interface/` e `src/planos/` permanecem preservados e fora do commit. O commit final é registrado no Git e no contexto durável Nox após criação.

## Resultado final de homologa??o local
**Aprovada tecnicamente; aguardando valida??o visual humana do propriet?rio.** QA agregado332PASS/0falhasabertas: principal281PASS+2falhasmetodol?gicas preservadas, reteste18PASS e controles33PASS. Build/lint exit0, review independente semP1/P2 e compara??o renderizada Nox/root PASS. O commit autorizado consolida c?digo, assets, documenta??o e evid?ncias finais; nenhuma publica??o ocorreu.
