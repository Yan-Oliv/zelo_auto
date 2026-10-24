# ZE-UX-OBS-01 — Owner UI observations

Status: COMPLETED technically after Root/Nox rendered/source review. Human owner visual acceptance remains separate.

This bounded activity follows ZE-09.1's two-delivery closure in `b46d59626b72fe33df8cd85522369217ecb83e0d`. It implements the latest explicitly expanded owner request; it is not a third ZE-09.1 delivery or a future sprint. Checkpoint: `ZE-UX-OBS-01-start-20261024`. Branch: `work/ze-audi-redesign`.

## Implemented

- Removed visible technical/editorial captions from services, comparisons, process, product scene, location and Instagram fallback. Comparator note nodes and their obsolete aria-describedby were removed, not merely hidden. Internal source metadata, appropriate descriptive alt text, original photo hashes and existing source documentation remain; illustrative Banks/Carpet are not asserted to be real Zelo results. The owner's latest instruction supersedes the prior visible-provenance-caption requirement.
- Instagram renders only returned official posts; partial, empty or unavailable feeds never insert editorial stock photos as real posts. Useful loading/unavailability status and the official profile CTA remain.
- Opened/measured reference2.png. Benefits have no rectangular/translucent panel; a continuous wide scene fade keeps black text legible. Three benefit labels/icons match the reference concept; steering-wheel and carpet vector icons complement the existing wash/seats icons. Responsive cards, real paint photos and sliders remain intact.
- Four WhatsApp links retain the existing business number and use individually written, URL-encoded service-specific messages: wash availability; interior care; seat material/stains; carpet cleaning/odors. Existing event context IDs are unchanged.
- Product logos are larger84–108px circular, clipped, keyboard-focusable links to exactly the owner-provided official Vonixx/Vintex/Zacs HTTPS sites. Official pages were checked read-only. Vonixx200px/Zacs320px original assets remain. A blurred Vintex57px icon and its officially supplied but internally enlarged192px version were rejected; the intact180×41 alpha wordmark from the official header is crisp at64–88CSSpx, self-hosted672bytes. Source/hash manifest is retained.
- Fixed a genuine analytics regression discovered by QA: the existing observer recognized only the full generic WhatsApp URL, so service-specific queries were not counted. It now recognizes the approved HTTPS origin/business-number path while retaining consent and typed event sanitization. Query text, phone strings and arbitrary user values are not sent to analytics; other destinations are not counted.

## Validation

`npm run build` PASS. `npm run lint` PASS with the same six legacy MotionSettings/cinematic warnings and no new warnings. Rendered QA17/17 groups PASS across1920,1440,1366,1024,768,430,390,360,320 and844px landscape: no horizontal overflow, all four service links44px, source metadata/slider accessibility preserved, no technical captions in DOM, official/partial/empty/unavailable Instagram states honest, circular official links/image dimensions validated.

Additional analytics3/3 groups PASS: each of four opt-in CTAs emits select_service/quote_click/whatsapp_click (12 typed diagnostic events total), denied consent emits none, and a different WhatsApp destination is ignored. No analytics delivery/dashboard receipt is claimed.

Root/Nox final technical visual review PASS: desktop/mobile services/results and benefit fade, circular logos/clear Vintex wordmark at1440/320, responsive useful sliders, source review and safe links. No open technical visual findings. No new Lighthouse loop was run for these lazy small-logo/copy/CSS observations; ZE-09.1's measured performance limitations remain disclosed, and no performance-preservation claim is added.

Evidence: `.nox/evidence/ZE-UX-OBS-01/qa.json`, `analytics.json`, build/lint logs, `brand-assets.json`, source scripts and reference2/brands screenshots1440/768/390/320. The prior failed analytics evidence remains locally for audit. The selected final evidence is committed.

## Current Google gate and local preview

ZE-09 remains WAITING_USER_ACTION. The owner clarified the received approval was Meta Business Portfolio, not Google. Google approval is unconfirmed. The Google request used omnyatech@gmail.com, whereas the connected Gmail is yanoliveiragm@gmail.com; the connected-mailbox search does not verify the request account. Five Google server configuration names are absent locally; values were never emitted/stored. Follow `.nox/ZE-09-Approval-Status.md` using the existing project/protocol, without a duplicate application, billing or new project.

The owner preview is the real local Vite runtime with the existing Functions handlers, **http://localhost:5173/**: Instagram HTTP200/six official posts; Google sanitized HTTP503/configuration. No mocked route is installed in that preview. Fixture interception occurs only inside QA browser contexts. No Google OAuth/API success is claimed.

ZE-09.1 and ZE-10.1 remain technically completed; final hero human approval remains pending. ZE-11/12 remain QUEUED and unstarted; global homologation retains all unmet predecessor gates. No production changes, push, deploy, Cloud mutations, billing or secret changes. The owner's two dirty ZE-09 documents and untracked new_interface/src/planos remain untouched. Internal PENDING_OWNER_ASSETS for Banks/Carpet is preserved without reintroducing rejected visible labels.

Commit: scoped followup commit carrying this record; final hash recorded after Git. Rollback: review/revert only that commit while preserving subsequent work; checkpoint points to b46d596. Never reset/clean owner work or publish automatically.
