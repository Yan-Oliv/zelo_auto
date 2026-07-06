# Zelo Auto

Landing page cinematografica da Zelo Estetica Automotiva, criada com React, TypeScript, Vite, Three.js e GSAP.

## Rodando localmente

```bash
npm install
npm run dev
```

Para gerar a build de producao:

```bash
npm run build
```

Para visualizar a build:

```bash
npm run preview
```

## Instagram

A secao de Instagram esta preparada para consumir as ultimas postagens por um endpoint oficial/proxy.
Copie `.env.example` para `.env` e configure uma das opcoes:

```bash
VITE_INSTAGRAM_FEED_ENDPOINT=
VITE_INSTAGRAM_GRAPH_USER_ID=
VITE_INSTAGRAM_ACCESS_TOKEN=
```

Nao commite `.env` ou tokens reais. Use o endpoint em producao para nao expor credenciais no bundle do frontend.
