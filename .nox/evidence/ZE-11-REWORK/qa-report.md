# ZE-11-REWORK QA

Verdict: PASS for the exercised internal application behavior. Authentic Google data remains BLOCKED_EXTERNAL; fixtures never establish authorization. Performance acceptance is reported separately by the performance owner.

| Suite | Result | Evidence |
|---|---|---|
| Compiled SSR and bootstrap | 14/14 PASS; 0 FAIL | `qa-ssr/results.json` |
| Production global viewport and interaction matrix | 22/22 PASS; 0 FAIL | `qa-matrix/qa-global.json` |
| Production affected typography and text200 | 14/14 PASS; 0 FAIL | `qa-affected/results.json` |
| Source SEO, consent, keyboard and axe | 8/8 PASS; 0 FAIL | `qa-local/results.json` |
| Compiled landing axe | 3/3 PASS; 0 FAIL | `qa-axe-production/results.json` |
| Source Instagram lifecycle | 6/6 PASS; 0 FAIL | `qa-feed/results.json` |
| Source Google bounded recovery | 5/5 PASS; 0 FAIL | `qa-google-recovery/results.json` |
| Compiled boundary/root/lazy errors | 4/4 PASS; 0 FAIL | `qa-production/qa-production.json` |
| Targeted rendered text/photo contrast | 28/28 PASS; 0 FAIL | `qa-contrast/results.json` |

The global matrix covers 2560x1440, 1920x1080, 1440x900, 1366x768, 1024x768, 768x1024, 430x932, 390x844, 360x740, 320x640 and 844x390. Text was doubled before measurement at 720/390/320 CSS px; no horizontal or inner heading clipping was observed. Six axe scans (three source and three compiled) detected zero applicable violations. Targeted contrast sampling passes 28/28; this is complementary sampling, not whole-site WCAG certification.

## SSR and failure recovery

The production application on native Pages port8888 was tested before and after delayed main-module hydration. Fourteen groups pass: natural first intro and stored-session return; slow artwork; initial and dynamically enabled reduced motion; three independent desktop native-anchor selections before a 2.3-second-delayed main module; menu/search during intro; image failure before hydration; actual editorial chunk failure; healthy UI after a nonfatal late error; no-JavaScript and blocked-main fallback; and debug crossfade routing without hydration mismatch. Native anchors now wait for the editorial component actual commit instead of import resolution.

A 404 for both AVIF/WebP car files before hydration initially exposed missing fallback. The first native fix then exposed a React hydration mismatch from removed picture sources. The corrected native/React artwork adoption loads car-reference.webp without hydration errors. An actual editorial-chunk503 initially exposed an unhandled duplicate import promise despite safe500 output; the actual-commit callback removes that duplicate import. Initial failure artifacts remain under qa-ssr/results-fallback-first.json, asset-failure-diagnostic.json, editorial-chunk-failure.json and results-anchor-race.json. The initial menu/title failures in results-first-harness.json were test Unicode-literal corruption; corrected harness assertions do not change product behavior.

## Visual and animation evidence

Fresh normal-motion contexts and videos were captured sequentially against baseline8889 and candidate8888. The final geometry and font identities match exactly at390 and1440px. Desktop is pixel identical across 1,164,960 pixels. Mobile mean absolute channel difference is0.7975/255; 2,560 of329,160 pixels (0.78%) differ by summed RGB>15. This quantifies documented AVIF/alpha/crop/mobile-logo encoding differences; geometry is unchanged. Images and difference maps are under qa-hero-compare/.

The mobile arrival remains a real fade/movement: sampled car opacity reaches its final value about1.13s after the first playing sample versus1.91s at baseline (80ms sampling resolution). Desktop remains approximately1.84s. The complete intro continues to settled; no session was preseeded for this comparison. Videos baseline-390.webm, candidate-390.webm, baseline-1440.webm and candidate-1440.webm preserve actual motion. Root/Nox performs the final visual reconciliation; this is not a new human approval claim.

## Integration and evidence limits

Google recovery tests use isolated TEST DATA with a controlled clock, visibility and intersection. They establish five-minute bounded recovery and deduplication, hidden/far suppression, and manual retry; they do not create OAuth or approve the Google API. Actual local Google remains configuration503; authentic display needs a valid configured server response. Instagram hook tests use fixtures; current real endpoint HTTP200/six posts was checked separately by Root. Analytics tests use local diagnostic events and blocked remote delivery, not GA4 dashboard receipt. Error fault injection exists only in local Playwright routes/test-only compilation and is excluded from the shipped application.

All QA Chromium processes were closed before final performance measurement.
