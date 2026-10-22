# ZE-03 — Logo transparente e intro visível | 2026-10-22

Estado: COMPLETED. Aceite local Nox/QA/root. Esta correção substitui o suporte azul e a avaliação da intro do commit48d5ca1. Não se atribui aprovação humana ao usuário.

## Resultado atual

- Logo oficial src/logos/zelo_logo_png_optimized.png, transparente e sem alteração do arquivo, preserva branco/dourado. Placa azul removida. O contraste no topo claro vem de drop-shadow somente no contorno da própria imagem; não existe fundo/placa ou SVG inventado. Marca inteira nos seis viewports.
- Intro revisada usa chave estável zelo:hero-intro:v4. A chave v3 já consumida era a causa de o retorno mostrar tudo pronto; a revisão v4 é exibida uma vez mesmo nesse caso. Não se cria chave por timestamp ou por visita.
- A entrada aguarda decode de cenário/carro/logo, document.fonts.ready, documento visível e dois requestAnimationFrame. Guard de agendamento duplicado e cleanup cancelam frames/listeners antigos. Evita consumir a entrada durante rede lenta, carregamento de fontes ou documento oculto.
- Cenário faz fade; ZELO é revelado por máscara; carro entra com fade/scale discreto; frases entram por lados opostos; marca, links, orçamento, busca/menu e hint usam stagger suave. Duração total3,3s. Carro/sombras/reflexo permanecem unidos e o resultado final conserva contato no piso e slogans mobile separados acima/abaixo ZELO.
- v4=complete é persistida ao concluir a entrada. Saída explícita da hero encerra a intro pronta; retorno/reload não repetem. Reduced-motion mostra tudo pronto imediatamente. Storage negado usa memória do documento; recarga completa sem armazenamento não conserva essa memória.

## Gates e evidência real

- Build PASS, exit0; aviso legado de chunk grande Three da rota debug lazy, não requisitado na landing.
- Lint PASS, exit0; seis warnings legados em MotionSettings/CinematicContext/CarScene fora da hero.
- Regressão 172/172 PASS em1672×940,1440×900,2560×1080,768×1024,390×844 e360×740. Navegação/busca/CTA/menu/seções, proporções/contato piso/textos mobile, logo alpha/semplaca, sessão/reload/reduced/storage, sem overflow/JS errors/GLB/Canvas.
- Frames/vídeo 38/38 PASS. Total 210/210. Vídeos WebM desktop/mobile e PNGs em tempo real0/350/900/1600/2500/3600/5000ms comprovam carro ausente→translúcido→opaco, desenho parcial→ZELO completo, frases opostas e hint posterior. Não se pausou animação ou manipulou currentTime.
- v3complete/v4ausente executa a revisão; v4complete/reload e retorno mostram settled. Atrasos controlados de1800ms no carro e1400ms em fontes preservam a entrada após readiness. Visibility API simulada hidden→visible mantém espera e só então inicia; isso não é certificação de aba oculta pelo SO.
- QA abriu os seis layouts finais; Nox e root abriram frames intermediários reais. Root aprovou logo transparente e entrada visível. Evidências atuais: evidence/ZE-03-INTRO-QA.md, qa.mjs/qa-results.json, frames.mjs/frames-results.json, quality.json, review.json, screenshots e vídeos desktop-intro.webm/mobile-intro.webm.

## Preservação e limites

Somente ZE-03: hero e comportamento de primeira abertura. Cenário/carro WebP e marca oficial não foram regenerados; ground contact, sombra/reflexo e layout mobile da correção anterior preservados. O nome das seções reais continua no menu. Microdetalhes generativos não são pixel-identical/4K nativo. Chromium emulado não substitui hardware físico.

Feed Instagram interceptado para503 controlado no QA; a integração externa não é certificada. Sem backend/credenciais/migração/produção. Branch work/ze-audi-redesign preservada; src/planos/ e new_interface/ não rastreados preservados e excluídos do commit. Checkpoint ZE-03-intro-v4-start-20261022 em48d5ca1; rollback por nova branch/checkout isolado, sem reset hard/clean. ZE-04 permanece QUEUED; nenhum deploy/push. Commit final registrado no Git e contexto durável após criação.
