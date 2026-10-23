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

The gallery uses the same-origin `/api/instagram-feed` endpoint. The server calls the Instagram API only when `INSTAGRAM_API_MODE=instagram-login` is explicitly set; Facebook Login tokens are unsupported. Configure `INSTAGRAM_GRAPH_USER_ID` (numeric Instagram user ID) and `INSTAGRAM_ACCESS_TOKEN` as server-side secrets locally and in Cloudflare Pages. This integration requires the `instagram_business_basic` Instagram Login permission.

The public endpoint returned Meta error 190 during verification. That shows only that the token is invalid, expired, revoked, or incompatible. The token issuance flow is unknown, so a valid Instagram Login token and its matching account ID are required before live posts can be verified. When unavailable or empty, the page labels gallery images as illustrative.

Owner setup for live verification:

1. In Meta for Developers, use the app's Instagram API with Instagram Login configuration and grant the Instagram `instagram_business_basic` permission to the authorized professional account.
2. Complete Meta's official authorization flow for the intended Business or Creator account and obtain an access token issued by that flow. Do not reuse a Facebook Login token; the API host and permissions differ.
3. Set `INSTAGRAM_API_MODE=instagram-login`, `INSTAGRAM_GRAPH_USER_ID` to that account's numeric Instagram user ID, and `INSTAGRAM_ACCESS_TOKEN` as server-only variables in the Cloudflare Pages project. For local development, use an ignored `.dev.vars` file. Never place credentials in a `VITE_` variable, source control, screenshots, or chat.
4. Re-test `/api/instagram-feed` and confirm six or fewer official posts, real Instagram permalinks, and no token in request URLs or browser assets. If Meta still returns an authentication category, renew authorization through the official flow and check the app permission/account selection in Meta; do not paste the token into a support request.

Never expose the token through a `VITE_` variable or commit `.env`.
