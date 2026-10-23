# ZE-07 preflight — dependency gate

**State: PREPARATION ONLY; ZE-07 remains QUEUED.** Branch `work/ze-audi-redesign`; baseline commit `abac1a4` was the latest recoverable Git checkpoint before this preflight. No product files were changed. This audit is independent, read-only preparation permitted by the ZE-07 request. The strict predecessor gate remains ZE-06.

## Nox dependency decision

The current request explicitly says not to mark ZE-06 complete to release ZE-07, and requires the public runtime to be verified. Although the owner approved the local gallery, local API success does not establish the public Pages runtime. The last read-only public Instagram endpoint check was HTTP 400 / OAuthException 190. No Pages deployment is authorized. Therefore ZE-06 is restored to `WAITING_USER_ACTION`; ZE-07 stays `QUEUED` and no ZE-07 implementation starts until the public prerequisite is resolved.

## Read-only repository baseline

- `index.html` has one title, description, `robots=index, follow`, one canonical and basic OG tags; canonical and `og:url` point to `https://zelo-auto.pages.dev/`, not the official `https://zelo.omnyatech.com.br/`. Twitter declares only `summary_large_image`; OG/Twitter image fields are absent.
- `public/sitemap.xml` contains only the root URL but points at `zelo-auto.pages.dev`, has `lastmod` `2026-07-07` (stale for this 2026-10-23 audit), and includes `changefreq`/`priority`.
- `public/robots.txt` allows the landing but announces a sitemap on `zelo-auto.pages.dev`.
- Local business facts are already sourced in `src/features/landing/data/site.ts`: name/brand, Catalão-GO, address, WhatsApp, Instagram, schedule (Mon-Fri 08:00-18:00; Sat 08:00-14:00; Sun closed), and four service descriptions. `index.html` duplicates address/phone and does not include hours or `sameAs` beyond Instagram. External business registration was not verified.
- `AutoWash` is a Schema.org subtype for a car-wash business. Whether it remains the most specific and accurate type for the actual operation must be confirmed against the business description before editing; do not change type merely because the field is currently present.
- Landing has one visually hidden H1 and section H2/H3 hierarchy. Debug paths `/debug-model` and `/debug-crossfade` branch in `src/App.tsx` and return the SPA shell; the repository has no route-specific noindex response rule identified in this preflight.

## Read-only public checks (2026-10-23)

- `https://zelo.omnyatech.com.br/` returned 200 and its HTML canonical points to `https://zelo-auto.pages.dev/`.
- `https://zelo-auto.pages.dev/` also returned 200 with canonical to itself; neither host redirected. Both serve the same project shell. This confirms a duplicate-host canonical conflict.
- Official-domain `/robots.txt` and `/sitemap.xml` returned 200, but the robots body includes Cloudflare-managed content signals and its sitemap directive still points to pages.dev. Public sitemap location also uses pages.dev with stale `lastmod` `2026-07-07`.
- Official-domain `/debug-model` and `/debug-crossfade` returned 200 with the SPA app shell, no detected `noindex` in HTML, and no `X-Robots-Tag` header. These routes are publicly reachable. No access control or production changes were attempted.

## Independent preparation vs blocker

The static SEO files and React content audit do not depend on Instagram feed code. However, Nox's ordered execution map sets ZE-07 dependent on ZE-06, and the active request requires that predecessor be genuinely complete. No source edit, canonical change, robots change, sitemap change, debug routing change, build, deploy, or ZE-08 work was started. Next gate: owner authorization for the separate ZE-06 Pages runtime update and public feed verification, then resume ZE-07.
