# ZE-06 — Instagram funcional (checkpoint)

**Status: WAITING_USER_ACTION — public runtime verification.** The owner visually approved the local gallery, and local real-feed verification, deterministic QA, build, and lint pass. The ZE-07 execution request requires public ZE-06 verification before treating the predecessor as complete. The last public GET returned HTTP 400 / OAuthException 190; a separate ZE-06 runtime update is not authorized.

## Deliveries

1. Replaced the Instagram Pages/Vite endpoint with one shared server handler. It requires explicit `INSTAGRAM_API_MODE=instagram-login`, a numeric Instagram account ID, and a server-only access token; sends the token as a Bearer header; validates and normalizes no more than six posts; applies an eight-second timeout; sanitizes Meta errors; honors 429 retry guidance; and sends CDN cache policy only for successful responses.
2. Replaced static-as-real gallery behavior with six loading skeletons, official-post cards linked to their exact permalink, clearly labeled editorial cards for empty/unavailable states, and a local image-failure fallback that preserves the grid and links to the official profile. The approved 3×2 gallery remains intact.

Google Reviews code was not changed. There was no deploy, push, migration, or production mutation.

## Production diagnosis and dependency

The public `/api/instagram-feed` endpoint was observed returning HTTP 400 / OAuthException code 190. Earlier responses were captured as safe metadata only. A secret-safe inspection found local ID/token/feed-endpoint variable names, and the first read-only `graph.instagram.com/me` check returned HTTP 401/code 190. These historical checks do not describe the latest production configuration. After the owner updated the local token and confirmed the intended account's Instagram Tester role, a fresh Vite process loaded `INSTAGRAM_API_MODE=instagram-login` and the local `/api/instagram-feed` route returned HTTP 200 with six normalized official posts. The response stayed `private, no-store`; all six permalinks passed HTTPS Instagram-host/post-path validation, and all six media URLs were HTTPS. A browser check against that real local route rendered six official tiles, six ready images, six valid Instagram links, zero image fallbacks, and zero page errors. It printed only counts and booleans; no captions, post IDs, URLs, or credential values were printed or recorded. The screenshot `.nox/evidence/ze06-qa-2026-10-23/live-instagram-local.png` contains the gallery without post captions or displayed permalinks. Dev Vite requested the endpoint twice because React StrictMode replays effects in development; the earlier production-preview mock run made one request per page load.

The successful local call proves the owner-reported known-good local token works for this Instagram Login API path. It does not prove the current Cloudflare runtime uses that value. The latest owner screenshot shows the expected unprefixed core variable names; values were not inspected. A later read-only public GET still returned HTTP 400 / OAuthException 190. The public failure source is unresolved; do not infer the exact cause. No local `.env`, Cloudflare, or production setting was changed.

Official Meta documentation distinguishes Instagram Login (`graph.instagram.com`, Instagram `instagram_business_basic`, no Facebook Page requirement) from Facebook Login, which uses a different permission/API flow. The existing owner token's flow is unknown; the implementation explicitly selects Instagram Login and fails closed rather than inferring a Facebook flow. References: [Meta Instagram API with Instagram Login](https://www.postman.com/meta/instagram/folder/6raa77c/instagram-api-with-instagram-login) and [Meta Instagram API with Facebook Login](https://www.postman.com/meta/instagram/folder/u4g5a2a/instagram-api-with-facebook-login).

Owner action remaining: the owner reports the same known-good local token was applied to Cloudflare, but the latest public read still returned HTTP 400. The earlier screenshot showed `INSTAGRAM_API_MODE=instagram-login` with VITE-prefixed token/account/feed-endpoint names; the owner says that screenshot predates the latest update, so those names must not be assumed current. The server handler expects server-only `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_GRAPH_USER_ID` without `VITE_`; the old endpoint variable is no longer read. The remaining gate is owner authorization to publish/deploy the ZE-06 Pages runtime, then repeat public verification; Nox has not deployed or mutated production. The owner clarified that the token surfaced through IDE active-selection context and was not deliberately typed into chat. Its value is not repeated, recorded, or requested again. The screenshot shows `zelo_autoestetica` as an Instagram Tester; Facebook **Test Users** is separate and not required for Instagram Login.

## Latest production configuration evidence

The earlier owner-provided Cloudflare screenshot showed VITE-prefixed token/account variables; the owner later said Cloudflare was updated with the same token that passed locally, so the screenshot may be stale and does not establish current production variable names. Root performed a read-only public GET after that update: HTTP 400 / OAuthException 190; no response body or secret was surfaced. The observed response indicated Meta invalidated the session after a password/security event. The deployed endpoint returned the raw upstream error shape rather than the local handler's sanitized category; this response does not establish the current cause. The owner clarified that the token appeared in IDE active-selection context and was not deliberately typed into chat. Its value is not recorded or repeated. No Cloudflare values were inspected, and no production mutation, deployment, or push was performed.

## Validation evidence

- `node --experimental-strip-types --test functions/api/_instagram-feed.test.mjs` — PASS.
- `npm run build` — PASS; existing large Three.js chunk warning remains.
- `npm run lint` — PASS with six existing warnings in motion/cinematic files.
- `git diff --check` — PASS.
- Local Vite route without configured Instagram variables — fail-closed 503, private/no-store, no CDN cache header.
- Independent QA — PASS for mock API/UI, production preview, security markers, responsive and accessibility checks. Exactly one feed endpoint request occurs per production page load. Dev Vite showed two requests because React StrictMode replays effects in development.
- Mock success renders six official cards linked to exact response permalinks. The screenshot fixtures use local editorial WebP photos served by Playwright, so they prove real thumbnail rendering and card layout without claiming those are Instagram posts. Empty/error states render labeled editorial cards. A failed image preserves the gallery and changes its destination to the official profile while the other five fixture photos load. Keyboard focus, reduced-motion hero, and widths 320/375/390/1440 pass; gallery remains 3×2 without horizontal overflow. Reviews implementation is unchanged.
- Deterministic synthetic timeout maps to sanitized 504/no-store; 403 maps to sanitized authentication 502/no-store; browser requests contain no secret-like markers; built assets contain no `INSTAGRAM_ACCESS_TOKEN`, `VITE_INSTAGRAM`, test markers, or Bearer token strings.
- Browser, edge-case scripts, JSON reports, mock screenshots, and live-local gallery screenshot: `.nox/evidence/ze06-qa-2026-10-23/`. The live-local screenshot is not committed and contains no captions or displayed permalinks.

Local real Meta integration is verified with six posts and the owner approved the local visual experience. ZE-06 is not marked complete because public runtime verification remains required by the active ZE-07 request: latest public GET was HTTP 400 / OAuthException 190. No production deploy/push was authorized or performed.


## Owner acceptance — 2026-10-23

The owner explicitly approved the local Instagram gallery after confirming that posts load correctly. This is local visual approval only. Public Pages behavior remains unverified and the active ZE-07 request requires it before ZE-06 may be marked complete; ZE-07 was not started.
