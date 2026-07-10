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
Copie `.env.example` para `.env` e configure:

```bash
VITE_INSTAGRAM_FEED_ENDPOINT=/api/instagram-feed
INSTAGRAM_GRAPH_USER_ID=
INSTAGRAM_ACCESS_TOKEN=
```

Nao commite `.env` ou tokens reais. O token deve ficar em `INSTAGRAM_ACCESS_TOKEN`, sem prefixo `VITE_`, para nao expor credenciais no bundle do frontend. No Cloudflare Pages, configure as mesmas variaveis em Production.
