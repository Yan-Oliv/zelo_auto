# ZE-06 — Instagram funcional (checkpoint)

**Status: WAITING_USER_ACTION for live Meta verification.** Local implementation, deterministic QA, and production-preview checks pass. No production settings or credentials were changed. The task remains open until the owner provides a valid Instagram Login authorization and matching account ID through the approved server-side settings.

## Deliveries

1. Replaced the Instagram Pages/Vite endpoint with one shared server handler. It requires explicit `INSTAGRAM_API_MODE=instagram-login`, a numeric Instagram account ID, and a server-only access token; sends the token as a Bearer header; validates and normalizes no more than six posts; applies an eight-second timeout; sanitizes Meta errors; honors 429 retry guidance; and sends CDN cache policy only for successful responses.
2. Replaced static-as-real gallery behavior with six loading skeletons, official-post cards linked to their exact permalink, clearly labeled editorial cards for empty/unavailable states, and a local image-failure fallback that preserves the grid and links to the official profile. The approved 3×2 gallery remains intact.

Google Reviews code was not changed. There was no deploy, push, migration, or production mutation.

## Production diagnosis and dependency

The public `/api/instagram-feed` endpoint was previously observed returning HTTP 400 with sanitized Meta error type `OAuthException`, code 190. A secret-safe inspection found local ID/token/feed-endpoint variable names, and the first read-only `graph.instagram.com/me` check returned HTTP 401/code 190. After the owner updated the local token and confirmed the intended account's Instagram Tester role, a fresh Vite process loaded `INSTAGRAM_API_MODE=instagram-login` and the local `/api/instagram-feed` route returned HTTP 200 with six normalized official posts. The response stayed `private, no-store`; all six permalinks passed HTTPS Instagram-host/post-path validation, and all six media URLs were HTTPS. A browser check against that real local route rendered six official tiles, six ready images, six valid Instagram links, zero image fallbacks, and zero page errors. It printed only counts and booleans; no captions, post IDs, URLs, or credential values were printed or recorded. The screenshot `.nox/evidence/ze06-qa-2026-10-23/live-instagram-local.png` contains the gallery without post captions or displayed permalinks. Dev Vite requested the endpoint twice because React StrictMode replays effects in development; the earlier production-preview mock run made one request per page load.

The successful local call proves the updated token currently works for this Instagram Login API path. It does not change Cloudflare Pages: the public endpoint still has the previously observed rejection until the owner updates the server-side Pages variables through the approved route and verifies production. No local `.env`, Cloudflare, or production setting was changed. The historical reason the old feed stopped working remains unknown.

Official Meta documentation distinguishes Instagram Login (`graph.instagram.com`, Instagram `instagram_business_basic`, no Facebook Page requirement) from Facebook Login, which uses a different permission/API flow. The existing owner token's flow is unknown; the implementation explicitly selects Instagram Login and fails closed rather than inferring a Facebook flow. References: [Meta Instagram API with Instagram Login](https://www.postman.com/meta/instagram/folder/6raa77c/instagram-api-with-instagram-login) and [Meta Instagram API with Facebook Login](https://www.postman.com/meta/instagram/folder/u4g5a2a/instagram-api-with-facebook-login).

Owner action remaining: copy the updated token through the approved secret-management path into `INSTAGRAM_ACCESS_TOKEN` in Cloudflare Pages, ensure `INSTAGRAM_API_MODE=instagram-login` and the matching numeric `INSTAGRAM_GRAPH_USER_ID` are set server-side, then verify the public endpoint returns official posts with real permalinks. Do not send the token in chat or place it in a `VITE_` variable. The provided screenshot shows `zelo_autoestetica` as an Instagram Tester. Facebook **Test Users** creation is separate and is not required for this Instagram Login feed; Meta's setup allows a professional account to authorize the Instagram Login API without a linked Facebook Page. The account already has the relevant Instagram tester role. No other user action is needed unless Meta's dashboard shows a new requirement. The public/production feed remains unverified until the Pages secret is updated and the endpoint is rechecked.

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
