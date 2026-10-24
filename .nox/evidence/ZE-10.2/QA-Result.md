# ZE-10.2 — Read-only product QA

Status: **PASS** for the browser behaviors exercised below. Product source was not edited by QA. Human design approval remains separate.

## Reproduction

From the project root with Vite on `127.0.0.1:5173` and Cloudflare Pages-compatible local runtime on `127.0.0.1:8888`:

```powershell
node .nox/evidence/ZE-10.2/qa-browser.mjs
node .nox/evidence/ZE-10.2/qa-production.mjs
node .nox/evidence/ZE-10.2/regression.mjs
node .nox/evidence/ZE-10.2/accessibility.mjs
```

Cloudflare static/boot tests use `ZE102_QA_URL=http://127.0.0.1:8888`, `ZE102_QA_FILTER=Static|CSS reveal|Actual text|Landing boot`, and `ZE102_QA_DIR=.nox/evidence/ZE-10.2/cloudflare`. A final scoped 503 typography change was rechecked using filter `Static 503|Actual text` and output `cloudflare-503-final`.

## Recorded results

| Evidence | Result | Scope |
|---|---|---|
| `qa-browser.json` | 48/48 PASS | 30 static pages at ten viewport sizes; actual React boundary render/provider/lazy errors under StrictMode; persistent failure, manual retry, recovery and new error; metadata restoration; storage preservation; keyboard/focus; accessibility tree and contrast; animation frames; reduced motion; equivalent zoom reflow and actual doubled text; no JavaScript; blocked Vite entry. |
| `qa-production.json` | 4/4 PASS | Locally compiled production React with actual boundary and exact current `src/main.tsx` root options. Render/provider/lazy errors print only fixed `APP_RENDER_FAILED`; uncaught root error prints only fixed `APP_ROOT_FAILED` and restores native HTML/focus/noindex. Synthetic secret markers and stack details absent from console, page errors and visible output. Retry recovers. |
| `cloudflare/qa-browser.json` | 38/38 PASS | Actual built static pages and blocked **compiled** main bundle/no-JavaScript fallback in Cloudflare-compatible runtime. Captures have the final official black logo and contained decorative layers. |
| `cloudflare-503-final/qa-browser.json` | 13/13 PASS | Final scoped 503 small-screen title adjustment: all ten viewports, JavaScript disabled, and actual doubled text at 640/320 CSS pixels. `TEMPORARIAMENTE` remains a whole word at normal 320-pixel layout. |
| `regression/qa.json` | 17/17 PASS | Existing landing contract: ten responsive viewports, authentic paint/illustrative internal source metadata, no visible technical captions, four WhatsApp messages, circular official brand links, Instagram six/two/empty/error fixtures, no fabricated Google score, slider keyboard, consent-gated analytics and menu Escape. External integrations were intercepted test fixtures. |
| `accessibility.json` | 6 scans; zero violations | axe WCAG 2 A/AA, 2.1 AA and 2.2 AA: 404/500/503 at 1366×768 and 320×640 in Cloudflare-compatible runtime. |

Ten viewport sizes: 2560×1440, 1920×1080, 1366×768, 1024×768, 768×1024, 430×932, 390×844, 360×740, 320×640, 844×390.

## Corrections and interpretation

- QA found genuine 19-pixel decorative overflow at 768×1024 on all three error pages. Returned to implementer, who clipped only the decorative art container. All 30 responsive page cases subsequently passed.
- QA identified insufficient white-on-light-gold button contrast before final validation. Implementer darkened the gradient; computed endpoint contrasts now **4.879:1** and **7.077:1**. Secondary CTA contrast is **14.822:1**.
- axe reports incomplete color-contrast checks for decorative outline/number over pseudo-elements, the gradient CTA, and its non-text arrow. Decorative art and arrows are `aria-hidden`; the meaningful gradient CTA is covered by the calculated endpoint contrast above. Incomplete findings remain recorded, not suppressed.
- Initial isolated harness imports required Vite refresh preamble and avoiding a separate unversioned React hook instance; those fixture defects were corrected. They were not product failures.
- A legacy regression assertion counted the exiting menu synchronously after Escape. The fixture now waits for dialog detachment; the same product source passes the existing keyboard behavior.
- Text enlargement explicitly doubles computed pixel font sizes for headings, descriptions, eyebrow, actions, header return link and footer text. Zoom-equivalent reflow uses CSS viewport width; no physical browser toolbar zoom or physical screen-reader certification is claimed.

Static `500.html` and `503.html` direct visits are templates served as HTTP 200; browser fallback cannot change an earlier HTTP 200. Real unknown-route HTTP 404 and API status/JSON evidence are owned by Nox in `http.json` and its report. Build/lint/performance and production infrastructure limits are also reported by Nox separately.

Screenshots: `screens/`, `cloudflare/screens/`, `cloudflare-503-final/screens/`, and `regression/`.

All QA browsers closed after the last scan. No deploy, push, live fault route, production mutation, secret access or paid operation was performed by QA.


Final Root/Nox follow-up: optional font and conditional error stylesheet/silhouette were applied after the first performance run. Browser48, production4, actual Pages38, regression17, HTTP20 and axe6 scans0violations were rerun successfully. Corrected static mobile CLS is0/0.051/0.051 for404/500/503. The separately authorized SKG partner link has its own keyboard/URL test; OmnyaTech remains unlinked. Performance limitations are in the sprint report; no real Google validation or owner visual acceptance is inferred.
