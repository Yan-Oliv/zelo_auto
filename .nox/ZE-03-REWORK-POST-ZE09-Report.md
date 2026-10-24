# ZE-03-REWORK-POST-ZE09 - Final technical report

State: COMPLETED. Technical implementation and checks reviewed by root/Nox; owner explicitly accepted the implemented hero on2026-10-24: "A hero está aprovada visualmente". The approved reference does not automatically approve this implementation. No production deployment or push.

## Authorization and preserved state
The owner's attached contract (84bdb9ad-ec19-444c-9596-9aa33647b2ca) explicitly authorizes this limited exception while ZE-09 remains WAITING_USER_ACTION. ZE-09 criteria and its pending client/Profile/API/OAuth gates are unchanged. Google Cloud zelo-integracoes / 878742106609 exists; API approval is not established. Resume ZE-09 when those external approvals arrive. ZE-10/11/12 remain QUEUED. Historical ZE-03-REWORK remains COMPLETED; no duplicate third sprint was created.

Branch work/ze-audi-redesign; initial HEAD 49e44926bac6f2b30d76e17ce309653633a0f16d. Checkpoint tag ZE-03-REWORK-POST-ZE09-start-20261023. Four previously dirty ZE-09 documents were copied before edits into ignored .nox/checkpoints/ZE-03-REWORK-POST-ZE09-start-20261023/. Untracked new_interface/ and src/planos/ preserved. Existing branch retained with disjoint ownership instead of a worktree.

## Delivery 1 - Visual fidelity
Binding reference new_interface/1.png is 1672x940. Baseline desktop/tablet/mobile captures document the previous composition. The reference car was recovered at native 710x360 (x478,y400), preserving its original RGB outside two small badge masks. Existing alpha was fitted to the matching silhouette. Local image editing inside those masks removed manufacturer rings/model badge; outsideChanges=0 in the lossless intermediate (asset-preservation.json). The display asset is high-quality WebP, not native 4K.

The showroom retains original side pixels and wall sign. Its central region behind foreground elements required precise inpainting with a 14px feather; original pixels hidden by the source car/lettering cannot be recovered. The final showroom is therefore not pixel-identical everywhere. No second wall sign was added. Independent SVG lettering, DOM slogans, vehicle, floor reflection/contact shadow, edge gradients, real header and scroll hint remain animatable layers. Official transparent company logo retained; its approved identity intentionally differs from the source mockup's logo.

Scale/position were calibrated to the reference. Floor reflection was reduced and header raised after review. Desktop slogans remain lateral; portrait/mobile uses text -> ZELO -> text -> car. No horizontal header divider, no duplicate foreground car/text. Source changes are limited to LandingPage.tsx, CinematicHero.css, index.html image preloads and public/hero assets/responsive variants, plus dedicated evidence/Nox records; other sections/integrations were not redesigned.

visual-comparison.json records native-size rendered comparison: diagnostic mean absolute RGB error 20.81 baseline -> 8.76 final, and all 9 geometric landmarks below 0.29% normalized deviation (target <2%). MAE is not human acceptance or proof of exact identity; the official logo, badge retouches and recovered background intentionally differ. See overlay.png/difference.png and side-by-side final-1672x940.png against the original reference. Final comparison reflects the latest saved visual-comparison.json.

## Delivery 2 - Motion, responsiveness and validation
Existing session mechanism retained (zelo:hero-intro:v4, waiting/playing/settled). Scene reveals, independent lettering reveals progressively, car fades/scales, left/right slogans move inward, header/hint enter subtly. Final car fade duration 1.4s with 0.5s delay; scene reveal 1.4s. Frames at 0/400/800/1200/1800/3400ms and first-visit video prove actual rendered motion. Reload/anchor navigation have no full replay; reduced-motion displays ready composition. Storage denial, slow/failed assets do not leave the hero stuck waiting.

responsive.json: 65 checks PASS across the required 11 viewports plus native-reference size (12 total): 2560x1440,1920x1080,1440x900,1366x768,1024x768,768x1024,430x932,390x844,360x740,320x640,844x390 and1672x940. Bounding boxes, controls, ordering, collision/overflow and exceptions tested. animation-results.json:13 checks PASS. smoke-results.json:33 checks PASS. regression-reviews.json:18 deterministic MOCK groups PASS; these confirm regression behavior only, not real Google authorization/reviews. Keyboard/focus/search/mobile menu, section navigation, CTAs, consent and zero canvas/GLB/Three covered. Existing real Google review API limitations remain in ZE-09.

Consolidated measured performance: performance-summary.json.

Build PASS (exit0), lint PASS (exit0; six legacy warnings, no new lint failures). Logs: build.txt/lint.txt. Technical visual review PASS in review.json; ownerVisual PENDING.

### Performance: measured limitations
Comparable cold local Lighthouse baseline/final reports are preserved, including intermediate samples. Results below are observed samples, not a statistical guarantee of regression absence. Final file names containing "approved" identify the technically selected iteration, not owner acceptance.

| Profile | Performance | LCP ms | TBT ms | CLS | JS transferred bytes | Images transferred bytes |
| --- | --- | --- | --- | --- | --- | --- |
| mobile | 81 -> 80 | 4808 -> 5034 | 34 -> 30 | 0 -> 0 | 119755 -> 119788 | 544952 -> 713808 |
| desktop | 67 -> 66 | 4957 -> 5333 | 32 -> 44 | 0 -> 0 | 119755 -> 119788 | 577432 -> 786252 |

Observed score is one point lower in both profiles and LCP is higher; image transfer also increased. No performance improvement or full performance PASS is claimed. Higher-quality source-faithful imagery and cinematic reveal are retained with this documented technical limitation; root/Nox review records the one-point delta rather than hiding it. CLS remains0 and no WebGL/GLB/Three was reintroduced. These are local synthetic measurements, not field Core Web Vitals.

## Criteria and evidence
- ZE-03-RW-C01: technical visual review PASS; owner visual approval PENDING (sole manual acceptance gate).
- ZE-03-RW-C02: technical PASS, responsive.json and 12 final viewport captures.
- ZE-03-RW-C03: technical PASS, animation-results.json, intro-*.png, video/, reduced/storage/fallback captures.
- ZE-03-RW-C04: technical checks PASS with measured performance limits above; build.txt, lint.txt, smoke-results.json, regression-reviews.json, Lighthouse reports, review.json. No blanket performance/regression-free claim.

Evidence directory: .nox/evidence/ZE-03-REWORK-POST-ZE09/. Baseline desktop/tablet/mobile, final viewport captures, overlay/difference/comparison, mask-audit.png, asset-preservation.json, animation frames/video, reduced.png, asset-error.png, slow-art.png and storage-blocked.png are retained. Human visual inspection is the only remaining requested acceptance action; no human approval was invented.

## Git and rollback
Final scoped commit: the commit carrying this report; resolve its hash with git log -- .nox/ZE-03-REWORK-POST-ZE09-Report.md after the parent Git operation. A commit cannot embed its own hash. No push/deploy. Checkpoint remains recoverable. Rollback by selectively restoring only modified hero/product files from checkpoint after reviewing the diff; never reset/clean or overwrite ZE-09 updates. The ignored backup preserves the pre-existing dirty state of four ZE-09 documents.


## Owner acceptance2026-10-24
The latest explicit statement closes only this hero visual gate. Evidence: `.nox/evidence/ZE-11/hero-owner-approval.json`. It does not grant final landing acceptance, Google integration acceptance, production or ZE-12 authorization. Historical performance limits remain documented.
