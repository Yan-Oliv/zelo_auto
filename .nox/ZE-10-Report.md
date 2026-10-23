# ZE-10 - Google reviews reliability and accessibility

Status: COMPLETED for independent technical criteria, 2026-10-23. Exactly two deliveries. Nox technical review PASS; real Google integration and human hero approval are not inferred.

## Authority and initial state

Owner contract: attachment ed20ef22-84e5-4df4-8343-0403f3612f4a/Pasted text.txt; this report records evidence and does not replace that contract. The explicit exception authorizes ZE-10 independent of the pending ZE-09 integration. ZE-09 remains WAITING_USER_ACTION for client/Profile/API/OAuth, genuine reviews/rating/count and manual Google flow confirmation. ZE-03-REWORK-POST-ZE09 remains WAITING_USER_ACTION for human visual acceptance. Historical ZE-03-REWORK remains COMPLETED. ZE-11/12 remain QUEUED and unauthorized.

Branch: work/ze-audi-redesign; baseline cbd4b26; checkpoint ZE-10-start-20261023. Existing dirty ZE-09 documents backed up in evidence/ZE-10/preexisting-docs.patch and preserved. Owner new_interface/ and src/planos/ preserved. Cloud project zelo-integracoes was not changed.

## Delivery 1 - Request/state reliability and recovery

The previous module-level Promise also memorized failed results, preventing normal recovery. The replacement page-memory store shares the active query and snapshot, clears the Promise on completion and notifies subscribers. States remain loading, verified, empty and unavailable; recovery uses loading with an appropriate message.

Fetching remains lazy near the viewport. StrictMode/immediate remount shares the request. A deferred abort cancels truly abandoned work. Controller identity prevents an older response overwriting a newer result. No network polling, automatic retry or page reload was added; content is not persisted in browser storage.

Transient errors allow manual retry after 2s, exponential backoff capped at60s. HTTP429 waits at least60s and respects Retry-After seconds or date. Configuration/authentication/permission/identity/verification/location/origin errors do not offer repeated retries. The visual countdown does not query the API.

Frontend aborts after10s and limits JSON to262144bytes. Invalid fields, duplicate IDs, inconsistent counts, out-of-range ratings and unapproved URLs are rejected. Reviews render as React text. Existing backend was strengthened rather than replaced: bounded responses, configuration/identity checks, caller abort versus deadline distinction, sanitized error categories and rate-limit propagation. No upstream bodies, credentials or customer content are logged. no-store remains in effect.

## Delivery 2 - UX, accessibility and Google links

The reference4 editorial layout preserves Instagram on the left, Google on the right, gold accents, summary, cards and CTAs. Reference sample ratings/authors are not used as real reputation. Loading reserves space; empty means confirmed zero reviews; unavailable distinguishes connection failure and offers official alternatives/recovery. Long text expands without changing its meaning.

Fractional rating/stars expose the correct accessible value; decorative stars/skeletons are not announced individually. Status/busy, a real retry button, visible focus, Enter/Space, a target at least44px and focus preservation were tested. External links use noopener/noreferrer and restricted destinations. Reduced motion was exercised. This is applicable automated accessibility testing, not WCAG certification or a claim of human screen-reader testing.

## Local verification and evidence

Evidence directory: .nox/evidence/ZE-10/.

| Check | Verified result |
| --- | --- |
| Build | PASS; build-result.txt; existing chunk-size warning retained |
| Lint | PASS; lint-result.txt; six legacy warnings in MotionSettings/CinematicContext/CarScene |
| Backend mocks |18 PASS, zero failures; api-tests-result.txt |
| UI |18 groups PASS; qa-browser.json |
| Hook lifecycle |5 PASS; hook-lifecycle.json: StrictMode, abort/remount, stale response, shared success and no React errors |
| Recovery/state matrix |52 groups PASS; recovery-matrix.json; actual manual retry captures included |
| Security/accessibility |accessibility-security.json; focused48px control, safe rel, no false stars or React errors |
| Responsive states |Nine normal sizes from320x568 to2560x1080; five states; MOCK-* screenshots |
| Technical review/regression |Nox review PASS; review-security-regression.json and review-security.md |
| Real Google reviews |PENDING ZE-09; fixtures do not establish a real connection |
| Actual external review/consultation flow |PENDING human ZE-09 check; anti-bot was not bypassed |

The mandatory initial failure -> manual retry -> validated success, navigation/return without reload runs in both motion modes with deterministic isolated responses. Fixtures and screenshots are explicitly MOCK, never proof of real Google reviews. Group totals overlap; no combined independent-test count is claimed. Nox visually reviewed reference4 structure: two editorial columns, gold summary, three fixture cards and CTAs. Hero and other sections were not redesigned.

Limitation: CSSzoom200% showed no overflow in the Google section but global overflow outside it. Whole-page zoom is not approved by this result; this report does not establish that issue's baseline. Nine normal sizes passed no-overflow checks. Automated checks do not replace full human accessibility evaluation.

## Comparable performance

performance-summary.json uses baseline cbd4b26 and final static builds, fresh Chrome per run, default Lighthouse simulated throttling, no saved consent and deterministic503 APIs. One sample per build/mode; no statistical or performance-improvement claim.

| Metric | Mobile before -> after | Desktop before -> after |
| --- | --- | --- |
| Performance |70 ->70 |57 ->57 |
| Accessibility |100 ->100 |100 ->100 |
| LCP ms |6036.6 ->6111.4 |6474.9 ->6547.8 |
| CLS |0 ->0 |0 ->0 |
| TBT ms |23.5 ->26.5 |17.5 ->17 |
| Requests |17 ->17 |20 ->20 |
| Total transferred bytes |1302796 ->1305905 |1374937 ->1378046 |
| JS transferred bytes |359116 ->361552 |359116 ->361552 |

Score/CLS and request counts stayed unchanged in these samples; JS increased2436bytes and observed LCP increased about75/73ms. No improvement or historical mobile-target compliance claimed. Final hero/intro preserved.

## Acceptance, external dependencies and boundaries

ZE-10-C01/C02/C03/C04 PASS for their independent scope after Nox reconciliation. External real-data and manual-flow checks remain PENDING in ZE-09 and do not block these explicitly independent criteria. Final hero visual acceptance remains pending; ZE-11 did not start.

No credentials or .env were read/recorded, no actual Google connection was represented by a mock, and no Cloud/API/billing changes, paid services, push or deployment occurred in this execution.

## Git and rollback

Commit: the scoped commit carrying this report; hash provided after the final Git operation, avoiding a self-referential versioned hash. Checkpoint ZE-10-start-20261023 identifies tracked baseline cbd4b26. Roll back only the ZE-10 commit after reviewing local changes, preserving owner dirty documents/untracked assets; never reset --hard or clean. Production remains untouched by this sprint.
