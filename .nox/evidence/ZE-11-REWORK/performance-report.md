# ZE-11-REWORK ? Final local performance

Native Wrangler Pages transport with browser-negotiated Brotli. Fresh Chrome; explicit normal motion; cold has no preseeded storage. Warm completes a natural previsit, waits for #servicos and bounded network idle after intro, then reloads in same page/cache/session. CPU/network/UA explicitly profile-specific. APIs use isolated empty server configuration. Lighthouse simulated metrics and local observed trace are distinct; not field measurements. Warm results are descriptive, not compared to previous incomplete-cache/raw-transport warm profiles.

| Profile | Performance | A11y | Best practices | SEO | LCP simulated ms | LCP observed ms | FCP ms | TBT ms | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| final mobile cold | 98 | 100 | 96 | 100 | 2363 | 1266 | 1388 | 0 | 0.000000 |
| final mobile warm | 100 | 100 | 96 | 100 | 902 | 72 | 630 | 19 | 0.000000 |
| final desktop cold | 97 | 100 | 92 | 100 | 1265 | 2098 | 503 | 0 | 0.003333 |
| final desktop warm | 100 | 100 | 92 | 100 | 246 | 64 | 174 | 0 | 0.003333 |
| robustness-1 mobile cold | 98 | 100 | 96 | 100 | 2356 | 1296 | 1381 | 0 | 0.000000 |
| robustness-2 mobile cold | 98 | 100 | 96 | 100 | 2357 | 1295 | 1382 | 0 | 0.000000 |

Three cold mobile samples: Performance98 in all; LCP range2356?2363ms, median2357ms. Both required targets pass in every sample. The two extra cold samples were declared before execution because the first had137ms margin, and all are reported.

Comparable native Pages baseline6bdd370: one sample80/LCP5129ms. Final cold medianLCP2357ms is54.0% lower; baseline has no multi-run distribution. The older uncompressed static server result69/6367ms is a different transport and is not used as the code-gain baseline.

Desktop CLS0.003333 remains below0.1; the affected node is the footer privacy access link as editorial content mounts. Mobile CLS0. Immediate consent access remains available. Best-practices96mobile/92desktop includes isolated endpoint503 console reporting and existing reflection aspect-ratio rounding under1%; these are not runtime script errors.

All six runs share HTML SHA256 `61c4fcebb4fd93c65d99c6e83b3cd9266ead2d82915b8045207da7c316dcc17f`. Full LHR reports and selected summaries are retained; raw traces are diagnostic support and need not enter the final Git package.

Cold native requests started before1000ms reduced from1,002,506bytes/18requests to234,402bytes/10 (-76.6%) in baseline/candidate5 traces. Whole audit transfer dropped1,022,631?799,725bytes (-21.8%), including deferred content. This is a genuine initial critical-path and asset budget reduction, not only moving downloads outside the audit window.

The observed local LCP is not field LCP and is not substituted for the simulated target. Cold normal-motion state transitions are recorded in each summary, and warm state is already settled after a natural previsit. No mobile intro is disabled or session preseeded for cold runs.
