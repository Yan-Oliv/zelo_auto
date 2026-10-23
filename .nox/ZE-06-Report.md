# ZE-06 — Instagram funcional (checkpoint)

**Status: WAITING_USER_ACTION for live Meta verification.** Local implementation, deterministic QA, and production-preview checks pass. No production settings or credentials were changed. The task remains open until the owner provides a valid Instagram Login authorization and matching account ID through the approved server-side settings.

## Deliveries

1. Replaced the Instagram Pages/Vite endpoint with one shared server handler. It requires explicit `INSTAGRAM_API_MODE=instagram-login`, a numeric Instagram account ID, and a server-only access token; sends the token as a Bearer header; validates and normalizes no more than six posts; applies an eight-second timeout; sanitizes Meta errors; honors 429 retry guidance; and sends CDN cache policy only for successful responses.
2. Replaced static-as-real gallery behavior with six loading skeletons, official-post cards linked to their exact permalink, clearly labeled editorial cards for empty/unavailable states, and a local image-failure fallback that preserves the grid and links to the official profile. The approved 3×2 gallery remains intact.

Google Reviews code was not changed. There was no deploy, push, migration, or production mutation.

## Production diagnosis and dependency

The public `/api/instagram-feed` endpoint returned HTTP 400 with sanitized Meta error type `OAuthException`, code 190. This establishes that Meta rejected the configured token as invalid, expired, revoked, or incompatible; it does not identify the token's issuance flow or the account/permission mismatch. No token value was read or recorded. The exact public response body and token were never printed.

Official Meta documentation distinguishes Instagram Login (`graph.instagram.com`, Instagram `instagram_business_basic`, no Facebook Page requirement) from Facebook Login, which uses a different permission/API flow. The existing owner token's flow is unknown; the implementation explicitly selects Instagram Login and fails closed rather than inferring a Facebook flow. References: [Meta Instagram API with Instagram Login](https://www.postman.com/meta/instagram/folder/6raa77c/instagram-api-with-instagram-login) and [Meta Instagram API with Facebook Login](https://www.postman.com/meta/instagram/folder/u4g5a2a/instagram-api-with-facebook-login).

The owner must complete official Instagram Login authorization for the intended professional Business or Creator account, confirm its numeric Instagram user ID, and set `INSTAGRAM_API_MODE=instagram-login`, `INSTAGRAM_GRAPH_USER_ID`, and `INSTAGRAM_ACCESS_TOKEN` as server-only Cloudflare Pages variables. Local development can use ignored `.dev.vars`. Never send the token in chat or place it in a `VITE_` variable. If the existing app/token uses Facebook Login, the owner must resolve the flow explicitly before configuring credentials. After that action, verify the public feed returns official media and real permalinks. Until then, live integration is not verified.

## Validation evidence

- `node --experimental-strip-types --test functions/api/_instagram-feed.test.mjs` — PASS.
- `npm run build` — PASS; existing large Three.js chunk warning remains.
- `npm run lint` — PASS with six existing warnings in motion/cinematic files.
- `git diff --check` — PASS.
- Local Vite route without configured Instagram variables — fail-closed 503, private/no-store, no CDN cache header.
- Independent QA — PASS for mock API/UI, production preview, security markers, responsive and accessibility checks. Exactly one feed endpoint request occurs per production page load. Dev Vite showed two requests because React StrictMode replays effects in development.
- Mock success renders six official cards linked to exact response permalinks. The screenshot fixtures use local editorial WebP photos served by Playwright, so they prove real thumbnail rendering and card layout without claiming those are Instagram posts. Empty/error states render labeled editorial cards. A failed image preserves the gallery and changes its destination to the official profile while the other five fixture photos load. Keyboard focus, reduced-motion hero, and widths 320/375/390/1440 pass; gallery remains 3×2 without horizontal overflow. Reviews implementation is unchanged.
- Deterministic synthetic timeout maps to sanitized 504/no-store; 403 maps to sanitized authentication 502/no-store; browser requests contain no secret-like markers; built assets contain no `INSTAGRAM_ACCESS_TOKEN`, `VITE_INSTAGRAM`, test markers, or Bearer token strings.
- Browser, edge-case scripts, JSON reports, and screenshots: `.nox/evidence/ze06-qa-2026-10-23/`.

Live Meta behavior remains unverified because owner authorization is unavailable. Do not mark ZE-06 COMPLETED until a valid owner-issued token/account is configured and real posts are verified.
